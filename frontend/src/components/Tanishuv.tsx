/**
 * Kirish darvozasi — va u ataylab DEVOR EMAS.
 *
 * Ilgari kirmagan odam ilovaning o'zini umuman ko'rmasdi: birinchi ekran
 * "Telegram bilan kirish" edi. Bu reklamani o'ldiradi — havolani bosgan
 * odam hali ishonmagan mahsulotga hisob ochmaydi, orqaga qaytadi.
 *
 * Endi kirmagan odam ilovaga TO'G'RIDAN-TO'G'RI tushadi va o'ynayveradi.
 * Kirish taklifi birinchi dars tugagach chiqadi — bola yulduzini ko'rgan,
 * ya'ni nimadir yutgan paytda (`lib/sinov.ts`). Taklifda "Keyinroq" bor,
 * ya'ni undan chiqib ketish mumkin.
 *
 * Progress yo'qolmaydi: sinov paytidagi natija anonim hisobda serverda
 * turadi va Telegram bilan kirganda o'sha hisobga qo'shiladi
 * (`auth/kod` → `_hisoblarni_birlashtir`).
 *
 * Veb'da birinchi marta bosh manzilga kelgan odam avval tanishuv
 * sahifasini ko'radi (`Tanishtiruv.tsx`) — sayt nima ekani, "Bepul
 * boshlash" tugmasi bilan. Til so'ralmaydi (o'zbekcha standart), anketa
 * esa faqat ro'yxatdan o'tganda chiqadi.
 *
 * Bitta holat hamon TO'SADI va u to'g'ri: odam botdan kelib, Telegram'i
 * bog'langan-u, ismini yozmagan bo'lsa (`ism`). U allaqachon kirish
 * jarayonining o'rtasida — uni yarim yo'lda qoldirish chalkashtiradi.
 *
 * `/kirish/<kod>` darvozadan o'tkaziladi: bu botdagi havola, ya'ni odam
 * AYNAN kirish jarayonida. Uni kirish ekraniga tiqsak, cheksiz halqa
 * yuzaga kelardi.
 */
import { Suspense, lazy, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Anketa } from "./Anketa";
import { Tanishtiruv, tanishtirildi, tanishtirilganmi } from "./Tanishtiruv";
import { Kirish } from "./Kirish";
import { Kutish } from "./Kutish";
import { til, tilTanlangan, tilniQoy } from "../lib/til";
import { getHisob, miniAppda, tilniSaqla } from "../lib/api";
import { royxatniBelgila, taklifgaObuna } from "../lib/sinov";
import type { Hisob } from "../lib/api";
import type { ReactNode } from "react";
import { t } from "../lib/matn";
import { profil, serverdanOl, yonalishKerak } from "../lib/profil";

// Ism so'rash ekrani — hisob hayotida bir marta. Asosiy bo'lakka
// kirmasin: `App.tsx` ham uni `lazy` bilan oladi va shu yerdagi oddiy
// import o'sha ajratishni butunlay bekor qilardi.
const Sozlamalar = lazy(() => import("../screens/Sozlamalar").then((m) => ({ default: m.Sozlamalar })));

/**
 * Anketa kerakmi: profil yo'q yoki bosqichi so'ralmagan. Bosqichsiz
 * javob darslar ro'yxatidagi eski "bitta savol" dan qolgan bo'lishi
 * mumkin — abituriyentdan esa bosqich so'ralmaydi.
 */
function anketaKerak(): boolean {
  const p = profil();
  return !p || (p.bosqich < 0 && p.kim !== "abiturient");
}

/** Tekshiruv holati: hali bilmaymiz → sinov / ism so'raymiz / so'ramaymiz. */
/**
 * "yonalish" — anketani ilgari to'ldirgan talabaga bitta qo'shimcha
 * savol (`components/Anketa.tsx` → faqatYonalish).
 */
type Holat = "kutilyapti" | "sinov" | "ism" | "anketa" | "yonalish" | "kerak-emas";

/**
 * Oxirgi safar kirgan bo'lganmi.
 *
 * Server javobini kutish bir necha yuz millisekund. Shu paytda nima
 * ko'rsatish kerakligi ikki xil bo'ladi va TAXMIN QILIB bo'lmaydi:
 * kirgan odamga ilovani, kirmaganga kirish ekranini. Noto'g'ri
 * taxmin ko'zga tashlanadi — ilova ochilib, keyin tortib olinadi.
 *
 * Shuning uchun javob mahalliy eslab qolinadi. U faqat ISHORA: server
 * baribir qayta tekshiradi va boshqacha desa, holat yangilanadi.
 */
const KIRGAN_KEY = "az_kirgan";

function kirganmi(): boolean {
  try { return localStorage.getItem(KIRGAN_KEY) === "1"; }
  catch { return false; }
}

export function Tanishuv({ children }: { children: ReactNode }) {
  const [holat, setHolat] = useState<Holat>("kutilyapti");
  /** Anketadan keyin qaysi holatga o'tiladi (sinov / ism / ochiq). */
  const [keyin, setKeyin] = useState<Holat>("kerak-emas");
  /** Sinov taklifi ko'rsatilyaptimi va bola nechta yulduz olgan edi. */
  const [taklif, setTaklif] = useState<number | null>(null);
  /**
   * Tanishuv sahifasi (`Tanishtiruv.tsx`) ko'rsatiladimi.
   *
   * Faqat VEB'da, faqat bosh manzilda va faqat hali ko'rmagan, kirmagan
   * odamga. Telegram Mini App va APK'da yo'q: u yerga kelgan odam
   * ilovani allaqachon tanlagan. Kanal postidan `/toplam/5` ga kelgan
   * odamga ham yo'q — u aynan o'sha testni ochish uchun bosgan.
   */
  const [tanishtirish, setTanishtirish] = useState(() =>
    !tanishtirilganmi() && !miniAppda() && import.meta.env.VITE_ROUTER !== "hash"
    && !kirganmi());
  // Ism so'raladigan bo'lsa, o'sha ekranga TAYYOR holda beriladi. Aks
  // holda u xuddi shu `/me` javobini ikkinchi marta so'rar va odam
  // kirish tugmasini bosgach yana kutib turardi.
  const [hisob, setHisob] = useState<Hisob | null>(null);
  const { pathname } = useLocation();
  const kirishSahifasi = pathname.startsWith("/kirish/");

  useEffect(() => {
    if (holat !== "kutilyapti" || kirishSahifasi) return;
    let bekor = false;

    // Kirish `ProgressProvider` da bo'ladi va u biroz vaqt oladi.
    // Shuning uchun bir necha marta urinib ko'ramiz, keyin voz kechamiz.
    let urinish = 0;
    const tekshir = async () => {
      const h = await getHisob();
      if (bekor) return;

      if (h) {
        setHisob(h);

        // ─── TIL IKKI TOMONLAMA SINXRON ───
        //
        // Til endi SO'RALMAYDI (o'zbekcha standart, `lib/til.ts`). Lekin
        // qurilmada tanlov bo'lmasa-yu, hisob ilgari ruschani tanlagan
        // bo'lsa — serverdagisi olinadi: odam boshqa telefondan kirgan
        // yoki xotira tozalangan. Ruschaga o'tish sahifani bir marta
        // qayta yuklaydi (`tilniQoy`), keyin tanlov qurilmada turadi.
        if (!tilTanlangan() && h.tilTanlandi && (h.til === "uz" || h.til === "ru")) {
          const boshqa = h.til !== til();
          tilniQoy(h.til);
          if (boshqa) return;            // sahifa qayta yuklanyapti
        } else if ((h.til || "uz") !== til() && tilTanlangan()) {
          // Teskari yo'nalish: qurilmadagi tanlov serverga yoziladi.
          // Faqat FARQ bo'lganda — har ochilishda yozib turish
          // keraksiz so'rov bo'lardi.
          void tilniSaqla(til());
        }
        try {
          if (h.royxatdan) localStorage.setItem(KIRGAN_KEY, "1");
          else localStorage.removeItem(KIRGAN_KEY);
        } catch { /* xotira to'lgan — faqat bayroq eslanmaydi */ }

        royxatniBelgila(h.royxatdan);
        // Serverdagi javob qurilmaga (boshqa telefondan kelgan odam
        // qayta so'ralmasin).
        serverdanOl(h.kim, h.bosqich, h.yonalish);

        // ANKETA — FAQAT RO'YXATDAN O'TGANDA.
        //
        // 2026-09-25 dan 10-08 gacha u hammaga, kirgan zahoti chiqardi
        // (tahlil uchun). Lekin saytga "nima ekan" deb kirgan odam hali
        // hech narsa ko'rmay turib savolga duch kelardi va chiqib ketardi.
        // Endi kirmagan odam ilovani erkin ko'radi; kim ekanini Telegram
        // bilan kirganda aytadi — o'shanda u allaqachon qolishga qaror
        // qilgan. Ism endi yozilgan bo'lsa (`ism` holati), anketa
        // undan keyin chiqadi (pastdagi `Sozlamalar` → onTayyor).
        if (h.royxatdan) {
          // Kirgan odamga tanishuv sahifasi qayta chiqmasin.
          tanishtirildi();
          setTanishtirish(false);
          if (anketaKerak()) { setKeyin("kerak-emas"); return setHolat("anketa"); }
          if (yonalishKerak(profil())) { setKeyin("kerak-emas"); return setHolat("yonalish"); }
          return setHolat("kerak-emas");
        }
        // Telegram bog'langan, lekin ism-familiya to'liq emas — odam
        // ikki bosqich orasida qolib ketgan.
        return setHolat(h.telegram ? "ism" : "sinov");
      }
      if (++urinish >= 3) {
        // Server javob bermadi. Ilovani to'smaymiz va taklif ham
        // chiqarmaymiz: internetsiz odamni Telegram'ga yuborishdan
        // ma'no yo'q, u baribir ochilmaydi.
        // Anketa faqat oxirgi safar kirgan bo'lsa (`kirganmi` — ishora):
        // profil qurilmada saqlanadi, javob internetsiz ham yoziladi.
        const kirgan = kirganmi();
        setHolat(kirgan && anketaKerak() ? "anketa"
          : kirgan && yonalishKerak(profil()) ? "yonalish" : "kerak-emas");
        return;
      }
      setTimeout(tekshir, 900);
    };
    tekshir();

    return () => { bekor = true; };
  }, [holat, kirishSahifasi]);

  // Dars tugaganda `lib/sinov.ts` shu yerga xabar beradi.
  useEffect(() => taklifgaObuna(setTaklif), []);

  if (kirishSahifasi) return <>{children}</>;

  // Saytga birinchi kelgan odamga — to'liq tanishuv sahifasi. Server
  // javobini KUTMAYDI (`kutilyapti` ham kiradi): reklamadan kelgan odam
  // birinchi ko'rgan narsa aylanuvchi belgi bo'lmasin. Server "bu odam
  // kirgan" desa, yuqoridagi effekt sahifani o'zi yopadi.
  if (tanishtirish && pathname === "/" && (holat === "kutilyapti" || holat === "sinov")) {
    return <Tanishtiruv onTayyor={() => setTanishtirish(false)} />;
  }

  if (holat === "ism") {
    // Ism yozilgan zahoti — anketa. Serverdagi bayroq hali eski
    // (`anketa: false`), shuning uchun holat to'g'ridan-to'g'ri o'tadi.
    return (
      <Suspense fallback={<Kutish />}>
        <Sozlamalar royxat boshlangich={hisob} onBack={() => setHolat("sinov")}
          onTayyor={() => setHolat(anketaKerak() ? "anketa" : "kerak-emas")} />
      </Suspense>
    );
  }

  if (holat === "anketa") return <Anketa onTugadi={() => setHolat(keyin)} />;
  if (holat === "yonalish") return <Anketa faqatYonalish onTugadi={() => setHolat(keyin)} />;

  // Mini App ichida taklif KO'RSATILMAYDI: u yerda kirish `initData`
  // orqali o'zi bo'ladi va odamni Telegram ichidan yana Telegram'ga
  // yuborish halqasi yuzaga kelardi.
  if (taklif !== null && !miniAppda()) {
    return (
      <Kirish
        izoh={taklif === 0 ? t("taklifNatija")                  // test tugadi (`sinov.ishTugadi`)
          : taklif === 3 ? t("taklifUchYulduz") : t("taklifYulduz", { n: taklif })}
        xabar={taklif === 0 ? t("taklifXabarNatija") : t("taklifXabar")}
        tugma={t("telegramBilanSaqlash")}
        onKeyinroq={() => setTaklif(null)}
      />
    );
  }

  // Qolgan hamma holatda ilova ochiq: kutilyapti bo'lsa ham, sinov
  // bo'lsa ham. Kutish ekrani ataylab olib tashlandi — reklamadan kelgan
  // odam birinchi ko'rgan narsasi aylanuvchi belgi bo'lmasligi kerak.
  return <>{children}</>;
}
