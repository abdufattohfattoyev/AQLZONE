/**
 * IMTIHON YO'LI — DTM matematika blokiga tayyorgarlik.
 *
 * ─────────────── NEGA ALOHIDA BO'LIM ───────────────
 *
 * Anketa shuni ko'rsatdi: kelganlarning 58% i talaba, yana 9–11
 * sinflar. Ular matematikani bitta aniq sabab bilan qidiradi —
 * IMTIHON. Ilovada esa hamma narsa SINF bo'yicha tizilgan: "11-sinf
 * matematika" degan kurs bor, lekin imtihonga tayyorgarlik yo'q edi.
 * Farqi kichik ko'rinadi, aslida katta:
 *
 *   Sinf kursi    bir yilning dasturi, bob-bob, tartib bilan.
 *   Imtihon       butun maktab kursidan aralash savol, vaqt bilan,
 *                 va eng muhimi — QAYSI MAVZUDA yiqilayotganingiz.
 *
 * ─────────────── VARIANT NIMA ───────────────
 *
 * Har variant — 30 savol, 60 daqiqa (haqiqiy imtihon sur'ati) va
 * 7–11 sinflarning hammasidan yig'iladi (`blok.IMTIHON_SINFLAR`).
 *
 * Variant RAQAMI bo'yicha yasaladi: 5-variant har qurilmada,
 * har safar aynan bir xil savollarni beradi. Sabab test to'plamidagi
 * bilan bir xil (`lib/toplam.ts`): natijalarni solishtirish uchun
 * hamma bitta testni ishlashi kerak. Savollar bazada saqlanmaydi —
 * faqat urug', qolganini generatorlar qiladi.
 */
import { bilanProfil, sorov } from "./api";
import { blokYasa } from "./blok";
import type { Blok } from "./blok";
import { kunUrugi, urugBilan } from "./oyin/urug";

/** Nechta variant bor. Ro'yxat uzun bo'lmasin — tanlov ham mehnat. */
export const VARIANTLAR = 12;

/** Bitta variantning o'lchami — DTM bilan bir xil. */
export const OLCHAM = { savol: 30, daqiqa: 60 };

/** Variant urug'i: raqam → o'zgarmas son. */
export const variantUrugi = (n: number): number => kunUrugi(`dtm-variant-${n}`, 7);

/**
 * Variantni yasaydi. Raqam noto'g'ri bo'lsa — `null`.
 *
 * `urugBilan` ichida yasaladi, ya'ni generatorlardagi `Math.random`
 * vaqtincha almashadi va natija takrorlanadi.
 */
export function variantYasa(n: number): Blok | null {
  if (!Number.isInteger(n) || n < 1 || n > VARIANTLAR) return null;
  return urugBilan(variantUrugi(n), () =>
    blokYasa(11, "dtm", { tur: "imtihon" }, OLCHAM));
}

/* ------------------------------------------------------------ natija */

/** Bitta topshirilgan variant — qurilmada saqlanadi. */
export interface ImtihonNatija {
  variant: number;
  togri: number;
  jami: number;
  sekund: number;
  vaqt: number;
}

const KALIT = "azapp_imtihon_v1";
const CHEK = 40;

export function natijalar(): ImtihonNatija[] {
  try {
    const xom = JSON.parse(localStorage.getItem(KALIT) || "[]") as ImtihonNatija[];
    return Array.isArray(xom) ? xom.filter((x) => x && typeof x.variant === "number") : [];
  } catch { return []; }
}

export function natijaSaqla(n: ImtihonNatija): void {
  try {
    const royxat = [n, ...natijalar()].slice(0, CHEK);
    localStorage.setItem(KALIT, JSON.stringify(royxat));
  } catch { /* xotira to'lgan — natija faqat ekranda qoladi */ }
}

/** Shu variantdagi ENG YAXSHI natija (yo'q bo'lsa — `null`). */
export function engYaxshi(variant: number): ImtihonNatija | null {
  const shu = natijalar().filter((x) => x.variant === variant);
  if (!shu.length) return null;
  return shu.reduce((a, b) => (b.togri > a.togri ? b : a));
}

/** Foiz — 0 dan 100 gacha. */
export const foiz = (n: Pick<ImtihonNatija, "togri" | "jami">): number =>
  (n.jami ? Math.round((100 * n.togri) / n.jami) : 0);

/**
 * O'RTACHA DARAJA — oxirgi beshta urinish bo'yicha.
 *
 * Bitta natija hech narsa demaydi: omad ham, charchoq ham bor.
 * Beshta urinishning o'rtachasi esa haqiqatga yaqin va aynan shu
 * son o'sib borishi kerak.
 */
export function daraja(): { foiz: number; urinish: number } | null {
  const oxirgi = natijalar().slice(0, 5);
  if (!oxirgi.length) return null;
  const jami = oxirgi.reduce((a, b) => a + foiz(b), 0);
  return { foiz: Math.round(jami / oxirgi.length), urinish: natijalar().length };
}

/* ------------------------------------------------------------ server */

/**
 * Serverdagi tarix — telefon xotirasidagi nusxadan USTUN.
 *
 * Nega: ilovani o'chirgan yoki telefon almashtirgan odam qurilmadagi
 * tarixni yo'qotadi, tayyorgarlikda esa aynan o'sish tarixi eng
 * qimmatli narsa. Qurilmadagi nusxa faqat internet yo'q paytda
 * ekranni bo'sh qoldirmaslik uchun turadi.
 */
export interface ServerTarix {
  oxirgilar: ImtihonNatija[];
  /** Variant raqami → eng yaxshi natija. */
  eng_yaxshi: Record<string, { togri: number; jami: number }>;
  /** Oxirgi beshtaning o'rtacha foizi (urinish bo'lmasa — `null`). */
  ortacha: number | null;
  jami: number;
}

/**
 * Qurilmadagi HAMMA urinishni serverga yuboradi va yakuniy tarixni
 * qaytaradi.
 *
 * Har ochilishda chaqiriladi va bu ATAYLAB: server takrorni o'zi
 * tashlaydi (`vaqt` bo'yicha), ya'ni eski tarix bir marta ko'chadi,
 * internetsiz ishlangan variant esa keyingi ochilishda yetib boradi.
 * Qurilmada ko'pi bilan 40 ta urinish turadi — so'rov yengil.
 */
export async function sinxronla(): Promise<ServerTarix> {
  // `bilanProfil` — oilaviy hisobda natija AYNAN tanlangan bolaga
  // yozilsin, hisobning birinchi profiliga emas.
  return sorov<ServerTarix>("/api/v1/imtihon/natija", bilanProfil({ urinishlar: natijalar() }));
}

/** Bitta tugagan urinishni yuboradi. Xato bo'lsa jim — keyingi `sinxronla` yetkazadi. */
export function serverga(n: ImtihonNatija): void {
  void sorov("/api/v1/imtihon/natija", bilanProfil({ ...n })).catch(() => {});
}
