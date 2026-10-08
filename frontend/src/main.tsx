import { Fragment, StrictMode, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { Fon } from "./components/Fon";
import { Holat } from "./components/Holat";
import { XatoUshlagich } from "./components/XatoUshlagich";
import { BotdanKelgan } from "./components/BotdanKelgan";
import { Tanishuv } from "./components/Tanishuv";
import { Kanal } from "./components/Kanal";
import { DuelTaklifOyna } from "./components/DuelTaklifOyna";
import { ProgressProvider } from "./lib/progress";
import { t } from "./lib/matn";
import { til, tilgaObuna, tilniUlash } from "./lib/til";
import { qobiqniUlash } from "./lib/qobiq";
import { maketniUlash } from "./lib/maket";
import { qolla as yoruglikniQolla, tizimniKuzat } from "./lib/yoruglik";
import { xatoKuzatuvniUlash } from "./lib/xatoKuzatuv";

// Brauzerdagi xato adminga yetib borsin — ENG BIRINCHI, qolgan
// hamma ulash ham yiqilishi mumkin (`lib/xatoKuzatuv.ts`).
xatoKuzatuvniUlash();

/**
 * Sahifa sarlavhasi va `lang` atributi.
 *
 * `index.html` da ular O'ZBEKCHA yozilgan — u statik fayl va ikki tilni
 * bir vaqtda ko'rsata olmaydi. Shu sabab ilova ishga tushganda ustiga
 * to'g'rilanadi: brauzer yorlig'i, tarix va PWA nomi tanlangan tilda
 * ko'rinadi.
 */
tilniUlash();
// Server sahifaga O'Z sarlavhasini qo'ygan bo'lsa (`backend/core/seo.py`:
// dars, kurs, masala…) — u qoladi: Google JS'ni ishga tushirib sahifani
// qayta o'qiganda "Kasrlarni qo'shish — 5-sinf…" o'rniga umumiy shiorni
// ko'rib, hamma sahifani bir xil deb hisoblardi. Belgisi — `#az-seo`
// bloki (React uni birinchi chizishda almashtiradi, shuning uchun hozir).
if (!document.getElementById("az-seo")) document.title = t("shior");

/**
 * Yorug'lik: oq yoki qora.
 *
 * Atributni `index.html` dagi skript ALLAQACHON qo'ygan — bu yerdagi
 * chaqiruv uni faqat tasdiqlaydi (xotira bloklangan bo'lsa yoki eski
 * qiymat qolgan bo'lsa to'g'rilaydi).
 *
 * `tizimniKuzat` esa "avto" holati uchun: telefon quyoshbotarda tunga
 * o'tsa, ilova ham o'tadi va foydalanuvchi uni qo'lda almashtirib
 * o'tirmaydi.
 */
yoruglikniQolla();
tizimniKuzat();

/**
 * Qobiq — qaysi sirtda ishlayotganimizga qarab RAMKA sozlanadi:
 * Telegram ichida nativ orqaga tugmasi, sarlavha rangi, haqiqiy ekran
 * balandligi va surish ishoralari. Dizaynga tegmaydi (`lib/qobiq.ts`).
 *
 * React'dan OLDIN chaqiriladi: `--az-ekran` va `--az-tepa` birinchi
 * kadrda joyida bo'lishi kerak, aks holda ekran bir lahza noto'g'ri
 * balandlikda chizilib, keyin sakrab to'g'rilanardi.
 */
qobiqniUlash();
// Maket qobiqdan KEYIN: u "Telegram ichidamizmi" degan javobga suyanadi.
maketniUlash();

/**
 * Veb va Telegram Mini App'da manzil chiroyli bo'lishi kerak:
 *   /kurs/1-sinf/2-bob/3-dars
 *
 * APK/iOS ichida esa sahifa `file://` dan yuklanadi va bunday manzilni
 * serverdan so'rab bo'lmaydi — u yerda hash kerak:
 *   index.html#/kurs/1-sinf
 *
 * Shu sabab tanlov yig'ish vaqtida beriladi:  VITE_ROUTER=hash npm run build
 */
const Router = import.meta.env.VITE_ROUTER === "hash" ? HashRouter : BrowserRouter;

/**
 * Ruscha manzillar — `/ru/kurs/5-sinf`. Ular Google uchun (`core/seo.py`),
 * ilova ichida esa odatdagi marshrutlar ishlaydi: `/ru` shunchaki asos
 * bo'ladi va ichki havolalar ham shu asos bilan qoladi. Til esa
 * `index.html` dagi skriptda ruschaga qo'yilgan.
 */
const ASOS_YOL = import.meta.env.VITE_ROUTER !== "hash" && /^\/ru(\/|$)/.test(location.pathname) ? "/ru" : undefined;

/**
 * Til almashganda ilovani JOYIDA qayta chizadi — sahifa yangilanmaydi.
 *
 * `key` til bo'yicha: React ichidagi hamma narsa (shu jumladan bir marta
 * hisoblanib `useMemo` da turgan ro'yxatlar) yangi tilda qayta yasaladi.
 * `ProgressProvider` va `Router` TASHQARIDA qoladi: progress xotirada
 * turadi va serverga yozilishi kutilayotgan bo'lishi mumkin, manzil esa
 * o'zgarmasligi kerak — odam qaysi ekranda bo'lsa, o'sha yerda qoladi.
 */
function TilQobiq({ children }: { children: ReactNode }) {
  const joriy = useSyncExternalStore(tilgaObuna, til);
  // Qayta chizishdan oldingi aylantirish joyi. Render paytida o'qiladi —
  // ya'ni eski ilova hali ekranda turganda. Qayta chizilgach o'sha joyga
  // qaytariladi: bir lahzada sahifa qisqarib, brauzer aylantirishni
  // o'zi kesib qo'ygan bo'lishi mumkin. Rasm va kech yuklangan bo'laklar
  // uchun keyingi kadrda yana bir marta.
  const joy = useRef({ til: joriy, y: 0 });
  if (joy.current.til !== joriy) joy.current = { til: joriy, y: window.scrollY };
  useLayoutEffect(() => {
    const y = joy.current.y;
    if (!y) return;
    window.scrollTo(0, y);
    const id = requestAnimationFrame(() => window.scrollTo(0, y));
    return () => cancelAnimationFrame(id);
  }, [joriy]);
  useEffect(() => {
    if (!document.getElementById("az-seo")) document.title = t("shior");
  }, [joriy]);
  return <Fragment key={joriy}>{children}</Fragment>;
}

// Faqat server sahifasi (ko'paytirish jadvali, formulalar bo'limi) —
// ilovada ekrani yo'q. React ulansa, u o'rniga "topilmadi" chizardi.
if (!document.documentElement.dataset.statik) createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Fon xato ushlagichdan TASHQARIDA: u shunchaki bezak, unga tegishli
        xato butun ilovani to'xtatmasligi kerak. */}
    <Fon />
    <XatoUshlagich qayer="ilova">
      <Router basename={ASOS_YOL}>
        <ProgressProvider>
          <TilQobiq>
          {/* Chaqiruv havolasidan kelgan kod ENG BIRINCHI o'qiladi —
              `Tanishuv` dan ham oldin. U til so'ralayotgan paytda
              ilovani umuman chizmaydi va kod yo'qolib ketardi. */}
          <BotdanKelgan />
          {/* Mini App'ga birinchi kirganda ism so'raladi. Boshqa hamma
              holatda bu qatlam ko'rinmaydi va hech narsa qilmaydi. */}
          <Tanishuv>
            <App />
            {/* Kanalga taklif. Tanishuv ICHIDA: hali ro'yxatdan
                o'tmagan odamga reklama ko'rsatilmaydi — u avval
                ilovaga kirib olsin. */}
            <Kanal />
            {/* Do'stdan jonli bellashuv taklifi — faqat bosh sahifa,
                o'yinlar va kurs xaritasida chiqadi, savol ustida emas. */}
            <DuelTaklifOyna />
          </Tanishuv>
          <Holat />
          </TilQobiq>
        </ProgressProvider>
      </Router>
    </XatoUshlagich>
  </StrictMode>
);
