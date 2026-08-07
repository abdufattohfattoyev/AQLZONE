package uz.aqlzone.app;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import android.webkit.CookieManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.app.Activity;

/**
 * Aql Zone — Android qobiq.
 *
 * ─────────────────────── NIMA QILADI ───────────────────────
 *
 * Bitta WebView ochadi va unda `https://aql-zone.uz` ni ko'rsatadi.
 * Ilovaning butun mantig'i — darslar, o'yinlar, bellashuv — saytda
 * qoladi va bu yerga KO'CHIRILMAYDI.
 *
 * ─────────────────── NEGA SAYT, NEGA ICHIGA SOLINMAGAN ───────────────────
 *
 * Fayllarni APK ichiga solish ham mumkin edi (`VITE_ROUTER=hash`), lekin
 * o'shanda har tuzatish uchun yangi APK yig'ib, uni har bir telefonga
 * qaytadan o'rnatish kerak bo'lardi. Sayt yuklanadigan qobiqda esa
 * serverga qilingan deploy o'sha zahoti hammaga yetib boradi.
 *
 * Buning narxi bor va u yashirilmaydi: internetsiz ilova ochilmaydi.
 * Fayllarni ichiga solish keyingi qadam (`README.md` ga qarang) va u
 * API manzilini o'zgartirishni talab qiladi.
 *
 * ─────────────────── QAYSI HAVOLA QAYERDA OCHILADI ───────────────────
 *
 * `aql-zone.uz` — shu yerda, WebView ichida.
 * Boshqasi (Telegram, `tel:`, `mailto:`) — TASHQARIDA, tizim ilovasida.
 *
 * Bu shunchaki qulaylik emas. Bellashuv chaqiruvi `t.me/...` havolasi
 * bilan ulashiladi: u WebView ichida ochilsa, Telegram'ning veb
 * ko'rinishi chiqib, bola hisobsiz qolardi va chaqiruv yo'qolardi.
 */
public class MainActivity extends Activity {

    /** Ilova ochadigan manzil. */
    private static final String ASOS = "https://aql-zone.uz";

    /** Shu domen (va uning pastki domenlari) WebView ICHIDA qoladi. */
    private static final String DOMEN = "aql-zone.uz";

    /** Internet yo'q bo'lganda ko'rsatiladigan sahifa. */
    private static final String XATO_SAHIFA = "file:///android_asset/xato.html";

    /** Brend foni — `res/values/colors.xml` dagi `brend_fon` bilan bir xil. */
    private static final int FON = 0xFF8ED6FF;

    private WebView web;

    /** Ayni paytda xato sahifasi turibdimi — orqaga tugmasi uchun. */
    private boolean xatoda = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle saqlangan) {
        super.onCreate(saqlangan);

        web = new WebView(this);

        // WebView TO'G'RIDAN-TO'G'RI oynaga qo'yilmaydi: u ramka ichida
        // turadi va ramkaning foni brend rangida bo'ladi. Tizim
        // panellari ostidagi bo'sh joyni aynan shu rang to'ldiradi —
        // pastdagi `setOnApplyWindowInsetsListener` ga qarang.
        FrameLayout ramka = new FrameLayout(this);
        ramka.setBackgroundColor(FON);
        ramka.addView(web, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(ramka, new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));

        // Sahifa fonini ham brend rangi qilamiz: sayt yuklanguncha
        // WebView oq bo'lib turardi va ochilishda ko'kdan oqqa, keyin
        // yana ko'kka o'tish ko'rinardi.
        web.setBackgroundColor(FON);

        chetlarniQoy(ramka);

        WebSettings s = web.getSettings();

        // JavaScript — ilovaning O'ZI shu. Busiz oq ekran qoladi.
        s.setJavaScriptEnabled(true);

        // localStorage. ENG MUHIM SOZLAMA.
        //
        // Bolaning butun progressi, kirish tokeni va sozlamalari shu
        // yerda saqlanadi. O'chiq bo'lsa ilova ishlayotgandek ko'rinadi,
        // lekin har ochilganda hammasi noldan boshlanadi — va buni
        // birinchi qarashda sezib bo'lmaydi.
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);

        // Talaffuz ovozlari bosishsiz ijro etiladi.
        s.setMediaPlaybackRequiresUserGesture(false);

        // Kattalashtirish o'chiq: sahifa allaqachon telefon ekraniga
        // moslashgan, ikki barmoq bilan cho'zish esa o'yin paytida
        // tasodifan bosilib, taxtani surib yuborardi.
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);

        // Tizim shrifti kattalashtirilgan bo'lsa ham sahifa o'z
        // o'lchamida qoladi. Sabab — o'yin katakchalari qat'iy setkaga
        // chizilgan: 130% shriftda savol matni katakdan chiqib ketardi.
        s.setTextZoom(100);

        // Kesh: internet bo'lsa yangisi olinadi, bo'lmasa keshdagisi.
        s.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Sayt qobiqni tanib olsin — kerak bo'lganda (masalan "ilovani
        // yangilang" xabari) shunga qarab yo'l tutadi.
        s.setUserAgentString(s.getUserAgentString() + " AqlZoneApp/1.1");

        CookieManager.getInstance().setAcceptCookie(true);

        // Xromdan (`chrome://inspect`) faqat SINOV qurilishini ko'rish
        // mumkin. Release'da ochiq qoldirilsa, har kim ilova ichidagi
        // ma'lumotni ko'ra olardi.
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        web.setWebViewClient(new AqlClient());

        // Qayta yaratilganda (masalan tizim ilovani xotiradan chiqarib
        // yuborgach) sahifa qayerda qolgan bo'lsa — o'sha yerdan.
        if (saqlangan != null) {
            web.restoreState(saqlangan);
        } else {
            web.loadUrl(ASOS);
        }
    }

    /**
     * Sahifani tizim panellari OSTIDAN chiqaradi.
     *
     * ─────────────────── NEGA KERAK ───────────────────
     *
     * Android 15 dan boshlab ilova oynasi butun ekranni egallaydi:
     * tepadagi soat-batareya qatori ham, pastdagi navigatsiya paneli
     * ham sahifaning USTIDA turadi. Buni o'chirib bo'lmaydi.
     *
     * Natijada menyuning pastki satrlari navigatsiya paneli ostida
     * qolib ketardi — ular ekranda bor, lekin ularga barmoq
     * yetmasdi va yozuv yarmigacha kesilgan ko'rinardi.
     *
     * Yechim: panellar egallagan joy WebView ga BO'SHLIQ bo'lib
     * beriladi. Sahifa esa hech narsani bilmaydi — u o'zining butun
     * balandligini o'zi olganday ishlayveradi.
     *
     * ─────────────────── KLAVIATURA ───────────────────
     *
     * Klaviatura ham "chet" bo'lib keladi va u navigatsiya panelidan
     * balandroq. Shuning uchun ikkalasining KATTASI olinadi: aks holda
     * klaviatura chiqqanda kirish maydonchasi uning ostida qolardi.
     *
     * ─────────────────── ESKI ANDROID ───────────────────
     *
     * Android 14 va pastda oyna panellar ostiga umuman kirmaydi va
     * chetlar nolga teng bo'ladi — ya'ni bu kod u yerda hech narsani
     * o'zgartirmaydi, lekin zarar ham qilmaydi.
     */
    private void chetlarniQoy(final View ramka) {
        ramka.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsets onApplyWindowInsets(View v, WindowInsets chet) {
                int chap, tepa, ong, past;

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                    Insets panel = chet.getInsets(
                            WindowInsets.Type.systemBars()
                                    | WindowInsets.Type.displayCutout());
                    Insets klaviatura = chet.getInsets(WindowInsets.Type.ime());
                    chap = panel.left;
                    tepa = panel.top;
                    ong = panel.right;
                    past = Math.max(panel.bottom, klaviatura.bottom);
                } else {
                    chap = chet.getSystemWindowInsetLeft();
                    tepa = chet.getSystemWindowInsetTop();
                    ong = chet.getSystemWindowInsetRight();
                    past = chet.getSystemWindowInsetBottom();
                }

                if (web != null) {
                    web.setPadding(chap, tepa, ong, past);
                }
                return chet;
            }
        });
        ramka.requestApplyInsets();
    }

    /**
     * Orqaga tugmasi — ilovadan chiqmaydi, sahifada orqaga qaytaradi.
     *
     * Busiz bola darsdan chiqmoqchi bo'lib bosgan tugma ilovani butunlay
     * yopib qo'yardi.
     *
     * Xato sahifasida esa orqaga qaytadigan joy yo'q: u yerdan bosilgan
     * tugma ilovani yopadi.
     */
    @Override
    public boolean onKeyDown(int kod, KeyEvent hodisa) {
        if (kod == KeyEvent.KEYCODE_BACK && web != null && web.canGoBack() && !xatoda) {
            web.goBack();
            return true;
        }
        return super.onKeyDown(kod, hodisa);
    }

    @Override
    protected void onSaveInstanceState(Bundle holat) {
        super.onSaveInstanceState(holat);
        web.saveState(holat);
    }

    /**
     * Ilova fonga o'tganda WebView ham to'xtaydi.
     *
     * Bu batareyani tejash uchun emas: bellashuvda ekran har 2 soniyada
     * serverga "men shu yerdaman" deb turadi. Telefon cho'ntakka
     * solingandan keyin ham shu belgi ketaversa, raqib yo'q odam bilan
     * duel boshlab yuborardi.
     */
    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
        web.pauseTimers();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.resumeTimers();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        // WebView Activity'dan uzib olinadi va keyin yo'q qilinadi.
        // Teskari tartibda qilinsa, tizim "WebView allaqachon
        // yo'q qilingan" degan xato bilan yiqiladi.
        if (web != null) {
            ((ViewGroup) web.getParent()).removeView(web);
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    /** Internet bormi (aniq javob emas — faqat tarmoq ulanganmi). */
    private boolean tarmoqBormi() {
        ConnectivityManager cm =
                (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm == null) return false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return cm.getActiveNetwork() != null;
        }
        NetworkInfo n = cm.getActiveNetworkInfo();
        return n != null && n.isConnected();
    }

    private final class AqlClient extends WebViewClient {

        /**
         * Havola qayerda ochilsin.
         *
         * `false` — WebView o'zi yuklaydi (o'z saytimiz).
         * `true`  — biz hal qildik, WebView tegmasin (tashqi ilova).
         */
        @Override
        public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest sorov) {
            Uri u = sorov.getUrl();
            String host = u.getHost();

            if (host != null && (host.equals(DOMEN) || host.endsWith("." + DOMEN))) {
                xatoda = false;
                return false;
            }

            // Tashqarida ochiladi: Telegram, telefon, pochta, boshqa sayt.
            try {
                Intent i = new Intent(Intent.ACTION_VIEW, u);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (ActivityNotFoundException e) {
                // Telefonda bunday havolani ochadigan ilova yo'q —
                // jimgina o'tkazib yuboramiz. Yiqilishdan ko'ra hech
                // narsa bo'lmagani yaxshi.
            }
            return true;
        }

        /**
         * Sahifa yuklanmadi.
         *
         * Faqat ASOSIY sahifa uchun: rasm yoki API so'rovi yiqilsa,
         * butun ekranni xato bilan almashtirish noto'g'ri bo'lardi —
         * ilova o'sha xatolarni o'zi ko'taradi.
         */
        @Override
        public void onReceivedError(WebView v, WebResourceRequest sorov, WebResourceError xato) {
            if (!sorov.isForMainFrame()) return;
            xatoda = true;
            v.loadUrl(XATO_SAHIFA + (tarmoqBormi() ? "?sabab=server" : "?sabab=internet"));
        }

        @Override
        public void onPageFinished(WebView v, String url) {
            // Xato sahifasi TARIXDA qolmaydi: qolsa, orqaga tugmasi
            // bolani yana o'sha xatoga qaytarardi.
            if (url.startsWith("file:///android_asset/")) {
                v.clearHistory();
            }
        }
    }
}
