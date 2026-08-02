/**
 * Pastki panel — ilovaning asosiy navigatsiyasi.
 *
 * HAMMA ekranda turadi va o'rni hech qachon o'zgarmaydi. Aynan shu
 * o'zgarmaslik uni foydali qiladi: bola bir marta "do'kon pastda, o'ngdan
 * ikkinchi" deb o'rganadi va keyin o'ylamaydi. Ilgari bu tugmalar faqat
 * kurs sahifasida, yuqorida, yozuvsiz kulrang doiralar bo'lib turardi —
 * boshqa ekranga o'tgan bola ularni butunlay yo'qotardi va orqaga qaytish
 * tugmasini qidirishga majbur bo'lardi.
 *
 * ────────────── NEGA OLTITA TUGMA BESHTAGA TUSHDI ──────────────
 *
 * Ilgari panelda oltita tugma turardi: bosh, darslar, nishonlar,
 * do'kon, reyting, ota-ona. Uchta muammosi bor edi.
 *
 *   O'YINLAR YO'Q EDI.  Ilovaning yarmi — sakkizta o'yin, bugungi
 *   maydon, duel — panelda umuman ko'rinmasdi. Ularga faqat bosh
 *   sahifadagi bitta kartadan kirilardi, ya'ni boshqa ekranga o'tgan
 *   odam ularni yo'qotardi.
 *
 *   OLTITA YOZUV SIG'MASDI.  320px li telefonda bir tugmaga ~53px
 *   qolardi va yozuvlar kesilib ketardi.
 *
 *   TENG TUGMA — TENG MA'NO.  Do'kon va ota-ona paneli har kuni
 *   bosiladigan joylar emas, lekin panelda ular "Darslar" bilan bir
 *   xil og'irlikda turardi.
 *
 * Endi panelda faqat HAR KUNI kerak bo'ladigan to'rttasi va menyu
 * bor. Nishonlar, do'kon, ota-ona paneli, sozlamalar, kunlik sinov,
 * xatolar daftari — hammasi menyuda, izohi bilan
 * (`components/Menyu.tsx`).
 *
 * Ikkita tugma KURSGA bog'liq (darslar va menyuning ichidagilar),
 * qolgani bog'liq emas. Kursga bog'liqlari qaysi kursni ochadi degan
 * savol bor va javob uch bosqichli:
 *
 *   1. Ayni paytda kurs sahifasidamiz — o'sha kurs.
 *   2. Emasmiz (masalan reytingda) — oxirgi ochilgan kurs (`lib/oxirgi`).
 *   3. Hali hech qanday kurs ochilmagan — ro'yxatdagi birinchisi.
 *
 * Busiz bosh sahifada turgan bola "Do'kon" ni bosganda hech narsa
 * bo'lmasdi: qaysi kursning do'koni ochilishi noma'lum edi.
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { Icon } from "../lib/icons";
import { Menyu } from "./Menyu";
import { COURSES, courseBySlug } from "../lib/curriculum";
import { oxirgiKurs } from "../lib/oxirgi";
import { useProgress } from "../lib/progress";
import { nishonlar, olingan } from "../lib/nishon";
import { yolKurs, yolKurslar, yolOyinlar, yolReyting } from "../lib/yollar";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";

/**
 * Panel KO'RINMAYDIGAN manzillar.
 *
 * Dars va takrorlash — diqqat talab qiladigan ish. Pastda navigatsiya
 * tursa, bola savol o'rtasida uni bexosdan bosib, yig'gan javoblarini
 * yo'qotardi. Kirish esa hali hisob yo'q joy: paneldagi hech bir manzil
 * u yerda ma'noga ega emas.
 */
const YOPIQ = [
  /^\/kurs\/[^/]+\/\d+-bob\//,   // dars
  /^\/kurs\/[^/]+\/daftar$/,     // xatolar daftari (u ham dars)
  /^\/kurs\/[^/]+\/sinov$/,      // kunlik sinov (u ham dars)
  // O'yinning O'ZI — ro'yxat va daraja tanlash emas. O'yinda soat
  // yuradi va pastdagi tugmani bexosdan bosgan odam butun natijasini
  // yo'qotardi; ro'yxatda esa panel kerak, chunki u oddiy sahifa.
  /^\/oyinlar\/[^/]+\/[^/]+$/,
  // Bugungi maydon — u ham o'yin, ustiga kuniga bitta urinish. Bu
  // yerda bexosdan bosilgan tugma butun kunni yo'qotardi.
  /^\/oyinlar\/maydon$/,
  // Duel — u ham o'yin. Chaqiruv havolasi (`/duel/<kod>`) esa
  // umuman ilova ichidan emas, Telegramdan ochiladi: u yerda panel
  // "qayerdaman?" degan savolni faqat kuchaytirardi.
  /^\/oyinlar\/duel$/,
  /^\/duel\//,
  /^\/kirish\//,                 // botdagi havola
];

export const panelKerakmi = (yol: string): boolean => !YOPIQ.some((r) => r.test(yol));

export function Panel() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { progressOf, kunlik } = useProgress();
  const [menyu, setMenyu] = useState(false);

  // Manzildagi kurs, bo'lmasa oxirgi ochilgani, bo'lmasa birinchisi.
  const kurs =
    courseBySlug(/^\/kurs\/([^/]+)/.exec(pathname)?.[1] ?? "") ??
    courseBySlug(oxirgiKurs()) ??
    COURSES[0];

  // Yangi nishon bor-yo'qligi — tugma ustidagi qizil nuqta uchun.
  const p = progressOf(kurs);
  const yangiNishon = useMemo(
    () => olingan(nishonlar({
      progress: p, kunlik, units: kurs.units, savollar: p.savollar ?? 0,
    })) > 0,
    [p, kunlik, kurs],
  );

  const bosh = pathname === yolKurslar();
  const darslar = /^\/kurs\/[^/]+$/.test(pathname);
  // O'yinlar tugmasi butun BO'LIM uchun yonadi: ro'yxat, daraja
  // tanlash, maydon, duel — hammasi `/oyinlar` ostida. Faqat ro'yxatning
  // o'ziga qarasa, daraja tanlash ekranida panel "hech qayerdasiz" deb
  // turardi.
  const oyinlar = pathname.startsWith("/oyinlar");

  // Tugmalar ro'yxat bo'lib turadi, chunki siljiydigan belgiga FAOL
  // TUGMANING INDEKSI kerak. Alohida yozilganda uni sanash uchun har
  // safar qo'lda tartib raqami yozib qo'yishga to'g'ri kelardi — tugma
  // qo'shilganda unutiladigan qadam.
  /**
   * Faol tugma qayta bosilsa — sahifa boshiga qaytadi.
   *
   * Bir xil manzilga o'tish hech narsa qilmaydi va tugma "buzuq" bo'lib
   * tuyulardi. Pastga aylanib ketgan odam uchun esa eng tabiiy kutilma
   * aynan shu: tepaga qayt.
   */
  const yur = (yol: string, faol: boolean) => () => {
    // Yengil tebranish — Telegram ichida tugma "bosildi" degan javobni
    // beradi. Boshqa joyda hech narsa qilmaydi.
    tebrat("tanlov");
    if (faol) window.scrollTo({ top: 0, behavior: "smooth" });
    else nav(yol);
  };

  const tablar = [
    { ic: "home", nom: t("tabBosh"), faol: bosh, on: yur(yolKurslar(), bosh) },
    { ic: "map", nom: t("tabDarslar"), faol: darslar, on: yur(yolKurs(kurs), darslar) },
    // O'yinlar ENG O'RTADA — paneldagi eng oson yetiladigan joy. Bu
    // yerda o'yin, bugungi maydon va duel bir eshik ortida turadi.
    { ic: "puzzle", nom: t("tabOyinlar"), faol: oyinlar, on: yur(yolOyinlar(), oyinlar) },
    {
      ic: "order", nom: t("tabReyting"), faol: pathname === yolReyting(),
      on: yur(yolReyting(), pathname === yolReyting()),
    },
    // Menyu ENG O'NGDA: u manzil emas, ochiladigan ro'yxat. Qizil nuqta
    // ham shu yerga ko'chdi — nishon endi menyu ichida va odam yangi
    // nishonini boshqa hech qayerdan sezmasdi.
    {
      ic: "menu", nom: t("tabMenyu"), faol: menyu, nuqta: yangiNishon,
      on: () => { tebrat("tanlov"); setMenyu(true); },
    },
  ] as const;

  // -1 bo'lishi mumkin: sozlamalar, do'kon va nishonlar sahifasida hech
  // bir tugma faol emas. Bunda belgi umuman chizilmaydi — noto'g'ri
  // joyda turgan belgi "shu yerdasiz" deb yolg'on aytardi.
  const faolIndeks = tablar.findIndex((t) => t.faol);

  return (
    <>
      {/* Oddiy oqimdagi bo'shliq: panel `fixed` bo'lgani uchun sahifa
          oxiri uning ostiga kirib qolardi. Bo'shliq shu yerda turadi va
          panel bilan BIRGA paydo bo'ladi — darsda ikkalasi ham yo'q. */}
      <div aria-hidden className="h-[calc(4rem+var(--az-past))]" />

      <Menyu ochiq={menyu} onYop={() => setMenyu(false)} kurs={kurs} />

      <nav data-tur="panel"
        className="az-shisha fixed inset-x-0 bottom-0 z-30 border-t border-karta/45
                   pb-[var(--az-past)]">
        <div className="mx-auto w-full max-w-[430px] px-1 sm:max-w-[560px]">
          {/* `relative` AYNAN shu yerda: belgining eni foizda beriladi va
              u tugmalar qatoriga nisbatan o'lchanishi kerak. Tashqi
              idishda bo'lsa, yon bo'shliq ham hisobga kirib, belgi
              tugmadan bir necha piksel keng bo'lib qolardi. */}
          <div className="relative flex">
            {faolIndeks >= 0 && (
              <span aria-hidden
                style={{
                  width: `${100 / tablar.length}%`,
                  transform: `translateX(${faolIndeks * 100}%)`,
                }}
                className="az-panel-belgi absolute inset-y-1 left-0 rounded-2xl bg-brand-green/12" />
            )}
            {tablar.map((t) => (
              <Tab key={t.nom} ic={t.ic} nom={t.nom} faol={t.faol}
                nuqta={"nuqta" in t ? t.nuqta : false}
                on={t.on} />
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

/** Panelning bitta tugmasi. Balandligi 56px — barmoq uchun yetarli. */
function Tab({ ic, nom, on, faol = false, nuqta = false }: {
  ic: "home" | "map" | "puzzle" | "order" | "menu";
  nom: string;
  on: () => void;
  faol?: boolean;
  nuqta?: boolean;
}) {
  return (
    // `relative` — tugma siljiydigan belgi USTIDA turishi uchun: belgi
    // absolyut joylashgan va joylashgansiz element uni bosib qolardi.
    <button type="button" onClick={on} title={nom}
      aria-current={faol ? "page" : undefined}
      /* `min-w-0` SHART: usiz flex elementi o'z mazmunidan kichrayolmaydi
         va uzun yozuv ("Родителям") tugmani kengaytirib, qolgan beshtasini
         siqib qo'yadi — natijada siljiydigan belgi ham joyidan chiqadi.
         U bilan esa yozuv `truncate` ga bo'ysunadi. */
      className={`clay-press relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2
                  transition-colors ${faol ? "text-brand-green-d" : "text-ink-soft"}`}>
      {/* `key` faollik bilan almashadi va shu sabab element QAYTA
          yasaladi — sakrash animatsiyasi aynan shunda qaytadan
          o'ynaydi. Faqat klass qo'shilsa, brauzer uni qayta ishga
          tushirmasdi. */}
      <span key={faol ? "faol" : "oddiy"}
        className={`relative ${faol ? "az-tab-sakra" : ""}`}>
        <Icon name={ic} size={22} />
        {nuqta && (
          <span className="az-nuqta absolute -top-0.5 -right-1 size-2.5 rounded-full bg-brand-red ring-2 ring-karta" />
        )}
      </span>
      {/* Beshta yozuv 320px li telefonga ham sig'ishi kerak — bir
          tugmaga ~64px qoladi. Oltitasida bu ~53px edi va eng uzun
          yozuv ("Родители") kesilib ketardi; beshtasida joy yetadi,
          lekin `truncate` baribir turadi: chetdan chiqib ketgan harf
          butun qatorni qiyshaytirardi. */}
      <span className="w-full truncate px-0.5 text-center text-[10.5px] leading-none">{nom}</span>
    </button>
  );
}

/**
 * Sahifa almashganda tepaga qaytarish.
 *
 * Panel bilan birga keldi va usiz nuqson ko'rinardi: reytingni pastigacha
 * aylantirgan odam "Do'kon" ni bossa, do'kon ham O'RTASIDAN ochilardi.
 * Brauzerning orqaga tugmasi bunga kirmaydi — u yerda odam o'zi qoldirgan
 * joyga qaytishni kutadi, shuning uchun faqat yangi o'tishlar hisobga
 * olinadi.
 */
export function TepagaQayt() {
  const { pathname } = useLocation();
  const tur = useNavigationType();
  useEffect(() => {
    // "POP" — brauzerning orqaga/oldinga tugmasi. U yerda odam o'zi
    // qoldirgan joyga qaytishni kutadi, shuning uchun tegilmaydi.
    if (tur === "POP") return;
    window.scrollTo(0, 0);
  }, [pathname, tur]);
  return null;
}
