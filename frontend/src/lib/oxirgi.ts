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
import { joriyProfil } from "./api";

const KALIT = "azapp_oxirgi_kurs_v1";

/**
 * Kalit profilga bog'lanadi: bir telefonda ikki farzand o'ynasa, har
 * biri o'z kursiga qaytadi. Aks holda aka-ukalar bir-birining kursini
 * ochib yuborardi.
 */
const kalitim = (): string => {
  const p = joriyProfil();
  return p ? `${KALIT}::${p}` : KALIT;
};

export function oxirginiYoz(slug: string): void {
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
