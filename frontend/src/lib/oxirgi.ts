/**
 * Oxirgi ochilgan kurs.
 *
 * Bosh sahifa shu qiymatga qarab "Oxirgi marta shu yerda edingiz" kartasini
 * ko'rsatadi. Busiz bola ilovani ochganda o'nlab kurs orasidan o'zinikini
 * har safar qidirib topishi kerak edi — holbuki javob deyarli har doim
 * bitta: kecha qayerda to'xtagan bo'lsa, o'sha.
 *
 * Faqat QURILMADA saqlanadi va serverga yuborilmaydi. Bu progress emas,
 * shunchaki ko'rsatkich: qurilma almashsa, yangi qurilmada bola qaysi
 * kursni birinchi ochsa, o'sha yozilib qoladi. Sinxronlash uchun esa
 * "qaysi qurilmada oxirgi bo'lgan?" degan savolni yechish kerak bo'lardi —
 * bir bosishlik qulaylikka arzimaydigan murakkablik.
 *
 * Kalit `azapp_` bilan boshlanadi, shuning uchun hisobdan chiqqanda
 * `api.chiqish()` uni ham tozalaydi: keyingi odam boshqa bolaning kursini
 * ko'rmaydi.
 */
import { joriyProfil, songgiKursniYoz } from "./api";

const KALIT = "azapp_oxirgi_kurs_v1";

/** Shu seansda serverga oxirgi yuborilgan kurs. */
const YUBORILDI = "az_songgi_kurs_yuborildi";

/**
 * Kalit profilga bog'lanadi: bir telefonda ikki farzand o'ynasa, har
 * biri o'z kursiga qaytadi. Aks holda aka-ukalar bir-birining kursini
 * ochib yuborardi.
 */
const kalitim = (): string => {
  const p = joriyProfil();
  return p ? `${KALIT}::${p}` : KALIT;
};

/**
 * Kursni serverga aytadi — botdagi kun savoli shu darajada keladi.
 * Seansda shu kurs uchun bir marta: har sahifa almashganda so'rov ketmasin.
 */
export function kursniServergaAyt(slug: string): void {
  try {
    if (sessionStorage.getItem(YUBORILDI) === slug) return;
    sessionStorage.setItem(YUBORILDI, slug);
  } catch {
    /* xotira yopiq — baribir yuboramiz */
  }
  songgiKursniYoz(slug);
}

export function oxirginiYoz(slug: string): void {
  kursniServergaAyt(slug);
  try {
    localStorage.setItem(kalitim(), slug);
  } catch {
    /* xotira to'lgan — karta ko'rsatilmaydi, xolos */
  }
}

/** Kurs slug'i yoki bo'sh satr (hali hech qanday kurs ochilmagan). */
export function oxirgiKurs(): string {
  try {
    return localStorage.getItem(kalitim()) ?? "";
  } catch {
    return "";
  }
}
