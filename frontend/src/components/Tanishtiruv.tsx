/**
 * "Aql Zone nima?" — yangi odamning birinchi ekrani (til tanlangach).
 *
 * Ilgari til tanlangan zahoti anketa chiqardi: "Siz kimsiz?". Ya'ni
 * havolani bosib kelgan odam sayt NIMA ekanini bilmasdan turib savolga
 * javob berardi. U hali "bu menga kerakmi" degan savolga javob olmagan —
 * anketa esa undan majburiyatni talab qiladi.
 *
 * Bu ekran shu savolga javob beradi: ilovada nima bor. Beshta bo'lim,
 * bosh sahifadagi eshiklar bilan AYNAN bir xil belgi, nom va izoh
 * (`screens/Bosh.tsx`). Sonlar dasturdan hisoblanadi — kurs o'sganda
 * bu yerdagi "82 dars" qolib ketmaydi.
 *
 * IZOH YO'Q — faqat belgi, nom va son. Ilgari har qatorda izoh bor edi:
 * avval to'liq, keyin bir qatorlik. Ikkalasida ham tor telefonda matn
 * qirqilib ("siz…") yoki ekran cho'zilib ketardi. Odam bu yerda
 * o'qimaydi, ko'z yugurtiradi — nom va son shunga yetadi, batafsili
 * bosh sahifada turadi.
 *
 * Qatorlar BOSILMAYDI: bu yerda hali tanlov yo'q, bitta yo'l bor —
 * "Boshlash". Bosiladigan ko'rinishdagi qator bosilmasa, odam ilova
 * buzilgan deb o'ylardi.
 *
 * Bir marta ko'rsatiladi (`TANISHTIRILDI_KEY`). Qaytgan odam uni yana
 * ko'rsa, bu to'siq bo'lardi.
 */
import { Logo } from "./Logo";
import { COURSES, lessonCount } from "../lib/curriculum";
import { OYINLAR } from "../lib/oyin";
import { blokBormi, sinfOf } from "../lib/blok";
import { t } from "../lib/matn";

const TANISHTIRILDI_KEY = "az_tanishtirildi";

export function tanishtirilganmi(): boolean {
  try { return localStorage.getItem(TANISHTIRILDI_KEY) === "1"; }
  catch { return true; }        // xotira yopiq — har safar ko'rsatib to'smaymiz
}

function tanishtirildi(): void {
  try { localStorage.setItem(TANISHTIRILDI_KEY, "1"); } catch { /* eslanmaydi, xolos */ }
}

const JAMI_DARS = COURSES.reduce((s, c) => s + lessonCount(c), 0);
const TEST_SINFLAR = COURSES.map((c) => sinfOf(c.grade)).filter(blokBormi);

export function Tanishtiruv({ onTayyor }: { onTayyor: () => void }) {
  // Tartib — yoshga qarab: kichkintoydan boshlab. Odam o'zini qatorda
  // topishi oson bo'lsin ("farzandim 4 yoshda" — birinchi qator).
  const bolimlar = [
    { ic: "palette", nom: t("kichkintoy"), son: t("tanishYosh") },
    { ic: "map", nom: t("tabDarslar"), son: t("darsSoni", { n: JAMI_DARS }) },
    { ic: "chart", nom: t("testlar"),
      son: t("boshSinfOraliq", { a: Math.min(...TEST_SINFLAR), b: Math.max(...TEST_SINFLAR) }) },
    { ic: "pencil", nom: t("masalalar"), son: "" },
    { ic: "puzzle", nom: t("oyinlar"), son: t("boshOyinSoni", { n: OYINLAR.length }) },
  ];

  const boshlash = () => { tanishtirildi(); onTayyor(); };

  return (
    <div className="mx-auto grid min-h-ekran w-full max-w-[400px] place-items-center px-4 py-4">
      <div className="az-kirish w-full min-w-0 rounded-clay bg-karta p-4 shadow-clay min-[360px]:p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Logo size={40} className="shrink-0" />
          <div className="min-w-0">
            <h1 className="font-display text-[21px] leading-tight">{t("tanishSarlavha")}</h1>
            <p className="text-[13px] leading-snug text-ink-soft">{t("tanishIzoh")}</p>
          </div>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-2">
          {bolimlar.map((b) => (
            <li key={b.ic} className="flex min-h-11 items-center gap-2.5 rounded-2xl bg-sahna px-3 py-2 shadow-ichki">
              {/* Qator foni neytral botiq maydon (`bg-sahna shadow-ichki`): beshta
                  bo'lim beshta rangda turganda ekran kamalakka aylanardi. */}
              <img src={`/belgi/${b.ic}.webp`} width={28} height={28} alt=""
                aria-hidden decoding="async" className="shrink-0" />
              {/* Qirqilmaydi ("Kichkintoyl…" bo'lib qolardi) — tor ekranda
                  kerak bo'lsa ikkinchi qatorga o'tadi. */}
              <span className="min-w-0 flex-1 font-display text-[15px] leading-tight">{b.nom}</span>
              {b.son && <span className="shrink-0 text-[12.5px] text-ink-dim">{b.son}</span>}
            </li>
          ))}
        </ul>

        <button type="button" onClick={boshlash} data-tahlil="Tanishtiruv: boshlash"
          className="tugma-3d mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl
                     bg-brand-blue font-display text-[16px] text-white shadow-clay-sm">
          {t("boshlash")}
        </button>
      </div>
    </div>
  );
}
