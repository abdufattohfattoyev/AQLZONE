/**
 * Kichkintoylar bo'limida KO'RILGAN kartalar.
 *
 * Bu progress EMAS va shu sabab serverga yuborilmaydi, reytingga
 * qo'shilmaydi, yulduz bermaydi. U bitta savolga javob beradi: "bola bu
 * mavzuni ochganmi?" Javob ikki joyda ishlatiladi:
 *
 *   1. mavzu kartasidagi sanoq ("12 tadan 5 tasi") — ota-ona uchun
 *      belgi, bola uchun esa o'sib boradigan son;
 *   2. o'yin tugmasi: albomni hech ko'rmagan bolaga "topib ber" o'yini
 *      taklif qilish — bilmagan narsasini so'rash bilan barobar.
 *
 * NEGA QURILMADA, SERVERDA EMAS. Bu yoshdagi bolaning hisobi yo'q; u
 * ota-onasining telefonida o'ynaydi va ertaga ham o'sha telefonda
 * o'ynaydi. Serverga chiqarish uchun hisob, sinxronlash va nizolarni
 * yechish kerak bo'lardi — sanoqning o'ziga arzimaydigan narx.
 *
 * Kalit `azapp_` bilan boshlanadi, ya'ni hisobdan chiqqanda
 * `api.chiqish()` uni ham tozalaydi.
 */
import { joriyProfil } from "./api";

const KALIT = "azapp_kichkintoy_v1";

/** Bir telefonda ikki farzand o'ynasa, sanoqlari aralashmasin. */
const kalitim = (): string => {
  const p = joriyProfil();
  return p ? `${KALIT}::${p}` : KALIT;
};

type Holat = Record<string, string[]>;

function oqi(): Holat {
  try {
    const xom = localStorage.getItem(kalitim());
    if (!xom) return {};
    const h = JSON.parse(xom) as unknown;
    // Buzuq qiymat (qo'lda tahrirlangan, eski versiyadan qolgan)
    // butun ekranni yiqitmasligi kerak — bo'sh holat ham to'g'ri javob.
    if (!h || typeof h !== "object" || Array.isArray(h)) return {};
    const toza: Holat = {};
    for (const [k, v] of Object.entries(h as Record<string, unknown>)) {
      if (Array.isArray(v)) toza[k] = v.filter((x): x is string => typeof x === "string");
    }
    return toza;
  } catch {
    return {};
  }
}

/** Shu karta ko'rildi deb belgilaydi. */
export function korildi(mavzu: string, karta: string): void {
  try {
    const h = oqi();
    const bor = h[mavzu] ?? [];
    if (bor.includes(karta)) return;
    h[mavzu] = [...bor, karta];
    localStorage.setItem(kalitim(), JSON.stringify(h));
  } catch {
    /* xotira to'lgan — sanoq o'smaydi, bo'lim avvalgidek ishlaydi */
  }
}

/** Shu mavzuda nechta karta ko'rilgan. */
export const korilganSoni = (mavzu: string): number => (oqi()[mavzu] ?? []).length;

/** Shu karta ko'rilganmi. */
export const korilganmi = (mavzu: string, karta: string): boolean =>
  (oqi()[mavzu] ?? []).includes(karta);
