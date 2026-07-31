/**
 * Zanjir qoidalari — sana hisobi, tiklash va qaytish.
 *
 * `progress.tsx` SAQLASH bilan shug'ullanadi, bu fayl esa QOIDA bilan:
 * qaysi kun zanjirga kiradi, uzilgan zanjirni tiklash mumkinmi va narxi
 * qancha. Ikkisi ajratilgani bejiz emas — bu qoidalar sof funksiya va
 * ularni React'siz sinash mumkin.
 *
 * NEGA TIKLASH KERAK. Ilgari faqat bepul muzlatgich bor edi: oyiga bitta
 * qoldirilgan kun kechiriladi. Undan keyin zanjir nolga tushardi va
 * amalda aynan shu payt bola ilovani TASHLAB KETARDI — 12 kunlik mehnat
 * bir kunda yo'qolgandek tuyuladi. Tiklash o'sha zarbani yumshatadi va
 * bir vaqtda tangalarga ma'no beradi: hozir ular faqat shlyapa va tojga
 * ketadi, ya'ni ikki-uch haftadan keyin ortiqcha bo'lib qoladi.
 *
 * Uchta chegara ATAYLAB qat'iy, aks holda zanjir hech narsani bildirmay
 * qolardi:
 *
 *   1. Ko'pi bilan IKKI kun o'tkazib yuborilgan bo'lsa tiklanadi. Bir
 *      hafta yo'qolgan odamning "45 kunlik zanjiri" — yolg'on.
 *   2. Ikki tiklash orasida kamida bir hafta. Har kuni sotib olinadigan
 *      zanjir — zanjir emas, obuna.
 *   3. Narx har safar oshadi va oyiga uchtadan ko'p bo'lmaydi.
 */

/** Zanjir qoidalariga kerak bo'ladigan qism (`Kunlik` shu shaklga mos). */
export interface ZanjirHolat {
  sana: string;
  kunlar: number;
  muzlatgich: number;
  muzlatgichOyi: string;
  tiklanganKun: string;
  tiklashSoni: number;
  tiklashOyi: string;
}

/** Tiklash narxi — shu oydagi nechanchi tiklash ekaniga qarab. */
export const TIKLASH_NARX = [50, 100, 200] as const;

/** Ikki tiklash orasidagi eng kam kun. */
export const TIKLASH_ORALIQ = 7;

/** Nechta kun o'tkazib yuborilgan bo'lsa hali tiklash mumkin. */
export const TIKLASH_UZILISH = 2;

/** Shundan qisqa zanjirni tiklash taklif qilinmaydi. */
export const TIKLASH_ENG_KAM = 2;

/** Shuncha kun ko'rinmagan odam "qaytgan" hisoblanadi. */
export const QAYTISH_KUN = 7;

/**
 * Sana MAHALLIY vaqt bo'yicha olinadi.
 *
 * `toISOString()` UTC beradi — Toshkentda kechqurun o'ynagan bola uchun
 * u allaqachon "ertaga" bo'lib qoladi va kun noto'g'ri almashardi.
 */
export function kunKaliti(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** N kun oldingi sana kaliti. */
export const kunOldin = (n: number): string =>
  kunKaliti(new Date(Date.now() - n * 86400_000));

/**
 * Ikki kun kaliti orasidagi farq (kunlarda).
 *
 * Kalitlar `Date` ga o'girilib ayiriladi, satr sifatida solishtirilmaydi:
 * oy va yil chegarasida ("2026-07-31" → "2026-08-01") satr hisobi
 * butunlay noto'g'ri javob berardi.
 */
export function kunFarqi(a: string, b: string): number {
  if (!a || !b) return 0;
  const ms = new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime();
  return Math.round(ms / 86400_000);
}

export interface TiklashTaklifi {
  /** Saqlanib qoladigan zanjir uzunligi. */
  kunlar: number;
  /** Necha kun o'tkazib yuborilgan. */
  uzilgan: number;
  narx: number;
}

/**
 * Uzilgan zanjirni tiklash taklifi. Yo'q bo'lsa `null`.
 *
 * Bepul muzlatgich birinchi turadi: u bir kunlik uzilishni o'zi
 * yopadi va o'sha holatda tanga so'rash — bor narsani sotish bo'lardi.
 */
export function tiklashTaklifi(k: ZanjirHolat, bugun = kunKaliti()): TiklashTaklifi | null {
  if (!k.sana) return null;

  // Nechta kun butunlay o'tkazib yuborilgan. Kecha o'ynagan bo'lsa 0.
  const uzilgan = kunFarqi(k.sana, bugun) - 1;
  if (uzilgan <= 0) return null;                        // zanjir butun
  if (uzilgan > TIKLASH_UZILISH) return null;           // juda uzoq ketgan
  if (k.kunlar < TIKLASH_ENG_KAM) return null;          // saqlashga arzimaydi

  // Bepul muzlatgich AYNAN bir kunlik uzilishni yopadi (`progress.tsx`).
  const oy = bugun.slice(0, 7);
  const muzlatgich = k.muzlatgichOyi === oy ? k.muzlatgich : 1;
  if (uzilgan === 1 && muzlatgich > 0) return null;

  // Ikki tiklash orasida kamida bir hafta.
  if (k.tiklanganKun && kunFarqi(k.tiklanganKun, bugun) < TIKLASH_ORALIQ) return null;

  const soni = k.tiklashOyi === oy ? k.tiklashSoni : 0;
  if (soni >= TIKLASH_NARX.length) return null;         // oylik chegara

  return { kunlar: k.kunlar, uzilgan, narx: TIKLASH_NARX[soni] };
}

/**
 * Tiklangandan keyingi holat.
 *
 * Hiyla oddiy: `sana` KECHAGA qo'yiladi. Shundan keyin bola bugun dars
 * qilganda odatdagi "kecha o'ynagan → zanjir davom etadi" tarmog'i o'zi
 * ishlaydi va `kunlikYangila` ga alohida shart qo'shish kerak bo'lmaydi.
 */
export function tiklangan<T extends ZanjirHolat>(k: T, bugun = kunKaliti()): T {
  const oy = bugun.slice(0, 7);
  const soni = k.tiklashOyi === oy ? k.tiklashSoni : 0;
  return {
    ...k,
    sana: kunOldin(1),
    // Bugungi hisob noldan boshlanadi: tiklash zanjirni saqlaydi, kunlik
    // maqsadni emas.
    savollar: 0,
    tiklanganKun: bugun,
    tiklashSoni: soni + 1,
    tiklashOyi: oy,
  };
}

/**
 * Odam necha kundan beri ko'rinmagan. Qaytish hisoblanmasa `0`.
 *
 * Yangi foydalanuvchi (`sana` bo'sh) qaytgan hisoblanmaydi — unga
 * "qaytganingizdan xursandmiz" deyish g'alati eshitiladi.
 */
export function qaytish(k: { sana: string }, bugun = kunKaliti()): number {
  if (!k.sana) return 0;
  const farq = kunFarqi(k.sana, bugun);
  return farq >= QAYTISH_KUN ? farq : 0;
}
