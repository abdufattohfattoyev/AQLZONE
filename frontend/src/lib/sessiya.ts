/**
 * SESSIYA — talabaning oraliq va yakuniy nazoratga tayyorgarligi.
 *
 * ─────────────── NEGA DTM VARIANTI YETMAYDI ───────────────
 *
 * DTM varianti 7–11-sinfdan yig'iladi — talabaga bu maktab takrori.
 * Talabani esa boshqa narsa qo'rqitadi: 2024/2025 dan yakuniy nazorat
 * kompyuter xonasida, video kuzatuv ostida o'tadi, oraliq nazoratdan
 * "2" olgan talaba yakuniyga kiritilmaydi, 4 ta qarz — chetlatish
 * (Vazirlik nizomi, lex.uz 3069-son). Unga O'Z FANI bo'yicha, vaqt
 * bilan ishlanadigan va oxirida BAHO aytadigan mashq kerak.
 *
 * Har fan (talabalar kursi) uchun 10 ta variant: 30 savol, 60 daqiqa.
 * Variant raqami bo'yicha yasaladi — DTM variantlari kabi har safar
 * bir xil chiqadi, natijani solishtirish mumkin (`lib/imtihon.ts`).
 *
 * Natija faqat qurilmada saqlanadi: bu mashq, reyting emas.
 */
import { blokYasa, sinfOf } from "./blok";
import type { Blok } from "./blok";
import type { Course } from "./curriculum";
import { OLIY_KURSLAR, courseBySlug } from "./curriculum";
import { kunUrugi, urugBilan } from "./oyin/urug";

export const SESSIYA_VARIANTLAR = 10;
export const SESSIYA_OLCHAM = { savol: 30, daqiqa: 60 };

export const sessiyaKurslari = (): Course[] => OLIY_KURSLAR();

export function sessiyaYasa(slug: string, n: number): Blok | null {
  const c = courseBySlug(slug);
  if (!c || c.grade < 300 || !Number.isInteger(n) || n < 1 || n > SESSIYA_VARIANTLAR) return null;
  return urugBilan(kunUrugi(`sessiya-${c.id}-${n}`, 7), () =>
    blokYasa(sinfOf(c.grade), "dtm", { tur: "hammasi" }, SESSIYA_OLCHAM));
}

/**
 * 5 ballik baho — OTMlardagi odatiy chegaralar bo'yicha (86 / 71 / 55).
 * Bu TAXMIN: har oliygoh o'z mezonini belgilaydi, ekranda ham shunday
 * deyiladi.
 */
export function baho(foiz: number): 2 | 3 | 4 | 5 {
  if (foiz >= 86) return 5;
  if (foiz >= 71) return 4;
  if (foiz >= 55) return 3;
  return 2;
}

export interface SessiyaNatija {
  kurs: string;
  variant: number;
  togri: number;
  jami: number;
  sekund: number;
  vaqt: number;
}

const KALIT = "azapp_sessiya_v1";

export function sessiyaNatijalari(): SessiyaNatija[] {
  try {
    const x = JSON.parse(localStorage.getItem(KALIT) || "[]") as SessiyaNatija[];
    return Array.isArray(x) ? x.filter((n) => n && typeof n.variant === "number") : [];
  } catch { return []; }
}

export function sessiyaSaqla(n: SessiyaNatija): void {
  try {
    localStorage.setItem(KALIT, JSON.stringify([n, ...sessiyaNatijalari()].slice(0, 60)));
  } catch { /* xotira to'lgan — natija faqat ekranda qoladi */ }
}

export function sessiyaEng(kurs: string, variant: number): SessiyaNatija | null {
  const shu = sessiyaNatijalari().filter((x) => x.kurs === kurs && x.variant === variant);
  return shu.length ? shu.reduce((a, b) => (b.togri > a.togri ? b : a)) : null;
}

export const foizi = (n: Pick<SessiyaNatija, "togri" | "jami">): number =>
  (n.jami ? Math.round((100 * n.togri) / n.jami) : 0);
