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
 * Uchta tugma KURSGA bog'liq (darslar, nishonlar, do'kon), ikkitasi
 * bog'liq emas (bosh sahifa, reyting). Kursga bog'liqlari qaysi kursni
 * ochadi degan savol bor va javob uch bosqichli:
 *
 *   1. Ayni paytda kurs sahifasidamiz — o'sha kurs.
 *   2. Emasmiz (masalan reytingda) — oxirgi ochilgan kurs (`lib/oxirgi`).
 *   3. Hali hech qanday kurs ochilmagan — ro'yxatdagi birinchisi.
 *
 * Busiz bosh sahifada turgan bola "Do'kon" ni bosganda hech narsa
 * bo'lmasdi: qaysi kursning do'koni ochilishi noma'lum edi.
 */
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { Icon } from "../lib/icons";
import { COURSES, courseBySlug } from "../lib/curriculum";
import { oxirgiKurs } from "../lib/oxirgi";
import { useProgress } from "../lib/progress";
import { nishonlar, olingan } from "../lib/nishon";
import {
  yolDokon, yolKurs, yolKurslar, yolNishon, yolReyting,
} from "../lib/yollar";

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
  /^\/kirish\//,                 // botdagi havola
];

export const panelKerakmi = (yol: string): boolean => !YOPIQ.some((r) => r.test(yol));

export function Panel() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { progressOf, kunlik } = useProgress();

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

  // Tugmalar ro'yxat bo'lib turadi, chunki siljiydigan belgiga FAOL
  // TUGMANING INDEKSI kerak. Alohida yozilganda uni sanash uchun har
  // safar qo'lda tartib raqami yozib qo'yishga to'g'ri kelardi — tugma
  // qo'shilganda unutiladigan qadam.
  const tablar = [
    { ic: "home", nom: "Bosh", yol: yolKurslar(), faol: bosh },
    { ic: "map", nom: "Darslar", yol: yolKurs(kurs), faol: darslar },
    {
      ic: "trophy", nom: "Nishonlar", yol: yolNishon(kurs),
      faol: pathname === yolNishon(kurs), nuqta: yangiNishon,
    },
    { ic: "palette", nom: "Do'kon", yol: yolDokon(kurs), faol: pathname === yolDokon(kurs) },
    { ic: "order", nom: "Reyting", yol: yolReyting(), faol: pathname === yolReyting() },
  ] as const;

  // -1 bo'lishi mumkin: sozlamalar va profillar sahifasida hech bir tugma
  // faol emas. Bunda belgi umuman chizilmaydi — noto'g'ri joyda turgan
  // belgi "shu yerdasiz" deb yolg'on aytardi.
  const faolIndeks = tablar.findIndex((t) => t.faol);

  /**
   * Faol tugma qayta bosilsa — sahifa boshiga qaytadi.
   *
   * Bir xil manzilga o'tish hech narsa qilmaydi va tugma "buzuq" bo'lib
   * tuyulardi. Pastga aylanib ketgan odam uchun esa eng tabiiy kutilma
   * aynan shu: tepaga qayt.
   */
  const yur = (yol: string, faol: boolean) => () => {
    if (faol) window.scrollTo({ top: 0, behavior: "smooth" });
    else nav(yol);
  };

  return (
    <>
      {/* Oddiy oqimdagi bo'shliq: panel `fixed` bo'lgani uchun sahifa
          oxiri uning ostiga kirib qolardi. Bo'shliq shu yerda turadi va
          panel bilan BIRGA paydo bo'ladi — darsda ikkalasi ham yo'q. */}
      <div aria-hidden className="h-[calc(4rem+env(safe-area-inset-bottom))]" />

      <nav data-tur="panel"
        className="az-shisha fixed inset-x-0 bottom-0 z-30 border-t border-karta/45
                   pb-[env(safe-area-inset-bottom)]">
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
                on={yur(t.yol, t.faol)} />
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

/** Panelning bitta tugmasi. Balandligi 56px — barmoq uchun yetarli. */
function Tab({ ic, nom, on, faol = false, nuqta = false }: {
  ic: "home" | "map" | "trophy" | "palette" | "order";
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
      className={`clay-press relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-2
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
      {/* Beshta yozuv 400px ga sig'ishi kerak: "Nishonlar" eng uzuni. */}
      <span className="text-[11.5px] leading-none">{nom}</span>
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
