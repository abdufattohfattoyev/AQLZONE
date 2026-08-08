/**
 * YORUG'LIK — oq yoki qora. Foydalanuvchi o'zi tanlaydi.
 *
 * ─────────────────── NEGA TEMADAN ALOHIDA ───────────────────
 *
 * Ilovada allaqachon `data-tema` bor (`lib/tema.ts`) va u ekranning
 * XARAKTERINI belgilaydi: bosh sahifa, kichkintoylar, katta sinflar.
 * Lekin u KURSDAN kelib chiqadi — 2-sinfdan yuqorisi majburan quyuq
 * bo'lardi va foydalanuvchidan hech kim so'ramasdi.
 *
 * Yorug'lik esa boshqa savol: "menga oq yoqadimi yoki qora?". Bu
 * kursga bog'liq emas — bir odam kunduzi oq, kechqurun qora xohlashi
 * mumkin, va bu istak u qaysi sinfni ochganiga umuman aloqador emas.
 *
 * Shuning uchun ikkinchi atribut: `data-yoruglik="oq" | "qora"`. U
 * `data-tema` ni BEKOR QILMAYDI — ustiga qo'yiladi va faqat ranglarni
 * almashtiradi. Fon naqshi, uch qavatlilik, kartalarning shakli va
 * radiusi — hammasi o'z joyida qoladi.
 *
 * ─────────────────── UCHTA QIYMAT ───────────────────
 *
 *   "avto"  tizim sozlamasiga ergashadi (telefon tunga o'tsa — qora).
 *           Standart holat: hech kim tanlamaguncha shu ishlaydi.
 *   "oq"    doim yorug'
 *   "qora"  doim quyuq
 *
 * "avto" ni standart qilishning sababi: ko'pchilik telefonida allaqachon
 * yoqtirgan rejimi turibdi va ilova undan boshqacha ochilsa, bu tanlov
 * emas, xatolikdek tuyuladi.
 */

export type Yoruglik = "avto" | "oq" | "qora";

/** Hal qilingan qiymat — ekranga aynan shu qo'yiladi. */
export type Aniq = "oq" | "qora";

/**
 * localStorage kaliti.
 *
 * `azapp_` prefiksi bilan: server faqat shunday kalitlarni qabul qiladi
 * (`models.BIZNING_KALIT`), ya'ni tanlov qurilmalar orasida sinxronlanadi
 * va boshqa telefonda qaytadan tanlash kerak bo'lmaydi.
 */
export const YORUGLIK_KEY = "azapp_yoruglik_v1";

/** Tizim tungi rejimdami. */
export function tizimQorami(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

/** Saqlangan tanlov. Yo'q yoki buzuq bo'lsa — "avto". */
export function yoruglikniOqi(): Yoruglik {
  try {
    const v = localStorage.getItem(YORUGLIK_KEY);
    return v === "oq" || v === "qora" || v === "avto" ? v : "avto";
  } catch {
    return "avto";
  }
}

/** Tanlovni aniq qiymatga aylantiradi. */
export const aniqla = (y: Yoruglik): Aniq =>
  y === "avto" ? (tizimQorami() ? "qora" : "oq") : y;

/**
 * Tanlovni saqlaydi va darhol qo'llaydi.
 *
 * Sahifani yangilash kerak emas: butun ilova CSS o'zgaruvchilariga
 * tayanadi, ya'ni bitta atributni almashtirish hamma rangni birga
 * o'zgartiradi.
 */
export function yoruglikniQoy(y: Yoruglik): void {
  try {
    localStorage.setItem(YORUGLIK_KEY, y);
  } catch { /* xotira bloklangan — bu safar ishlaydi, esda qolmaydi */ }
  qolla(y);
}

/** Hujjatga atributni qo'yadi. */
export function qolla(y: Yoruglik = yoruglikniOqi()): Aniq {
  const a = aniqla(y);
  document.documentElement.dataset.yoruglik = a;
  return a;
}

/**
 * "avto" holatida tizim rejimi o'zgarsa ergashadi.
 *
 * Telefon quyoshbotarda tunga o'tsa, ilova ham o'tishi kerak — foydalanuvchi
 * uni qo'lda almashtirib o'tirmasin. Qaytariladigan funksiya kuzatuvni
 * to'xtatadi.
 */
export function tizimniKuzat(): () => void {
  let mq: MediaQueryList;
  try {
    mq = window.matchMedia("(prefers-color-scheme: dark)");
  } catch {
    return () => {};
  }
  const ozgardi = () => {
    if (yoruglikniOqi() === "avto") qolla("avto");
  };
  mq.addEventListener("change", ozgardi);
  return () => mq.removeEventListener("change", ozgardi);
}
