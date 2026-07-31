/**
 * Manzillar (URL) bir joyda.
 *
 * Manzil endi HTML fayl nomi emas — o'qib tushunarli yo'l:
 *
 *     /                              kurslar ro'yxati
 *     /kurs/1-sinf                   kurs yo'l xaritasi
 *     /kurs/1-sinf/2-bob/3-dars      dars
 *
 * Shu sabab havolani ulashsa ham, brauzerning orqaga tugmasi ham to'g'ri
 * ishlaydi. Raqamlar manzilda 1 dan boshlanadi (bola uchun tabiiy),
 * kod ichida esa 0 dan — o'girish faqat shu faylda bo'ladi.
 */
import type { Course } from "./curriculum";

export const yolKurslar = () => "/";

/** Hisob sozlamalari: ism, familiya, kirish usullari. */
export const yolSozlama = () => "/sozlamalar";

/** Reyting — kim qancha yulduz yig'gan. Kursdan tashqarida: hammasi birga. */
export const yolReyting = () => "/reyting";

/**
 * O'yinlar — kursdan TASHQARIDA.
 *
 * Manzil `/kurs/...` ostiga tushmasligi ataylab: o'yin biror sinfga
 * tegishli emas, uni 1-sinf bolasi ham, kattasi ham o'ynaydi. Kurs
 * ichiga qo'ysak, havolada tasodifiy sinf raqami turib qolardi va
 * ulashilgan havola "bu 2-sinf o'yini ekan" degan yolg'onni aytardi.
 */
export const yolOyinlar = () => "/oyinlar";
/** Bitta o'yinning daraja tanlash ekrani. */
export const yolOyin = (id: string) => `/oyinlar/${id}`;
/** O'yinning o'zi — daraja bilan. */
export const yolOyinDaraja = (id: string, daraja: number) => `/oyinlar/${id}/${daraja}-daraja`;

export const yolKurs = (c: Course) => `/kurs/${c.slug}`;
/** Xatolar daftari (takrorlash darsi). */
export const yolDaftar = (c: Course) => `/kurs/${c.slug}/daftar`;
/** Kunlik sinov — faqat bugun ochiq. */
export const yolSinov = (c: Course) => `/kurs/${c.slug}/sinov`;
/** Tangalar do'koni. */
export const yolDokon = (c: Course) => `/kurs/${c.slug}/dokon`;
/** Yutuq nishonlari. */
export const yolNishon = (c: Course) => `/kurs/${c.slug}/nishonlar`;
/** Ota-ona paneli. */
export const yolOtaOna = (c: Course) => `/kurs/${c.slug}/ota-ona`;

export const yolDars = (c: Course, ui: number, li: number) =>
  `/kurs/${c.slug}/${ui + 1}-bob/${li + 1}-dars`;

/** "3-bob" → 2 (kod indeksi). Noto'g'ri bo'lsa null. */
export function indeksniOqi(qism: string | undefined, qoshimcha: string): number | null {
  if (!qism) return null;
  const m = new RegExp(`^(\\d{1,3})-${qoshimcha}$`).exec(qism);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 ? n - 1 : null;
}
