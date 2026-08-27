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

/**
 * Bosh sahifa — ilovaning XARITASI, kurslar ro'yxati emas.
 *
 * Ilgari `/` kurslar ro'yxatini ko'rsatardi va boshqa bo'limlar
 * (masalalar, testlar, kichkintoylar) uning ostida yoki menyu
 * ichida yashiringan edi. Endi `/` beshta bo'lim eshigini
 * ko'rsatadi, kurslar esa o'z ekraniga ko'chdi.
 */
export const yolBosh = () => "/";

/**
 * Kurslar ro'yxati — "qaysi sinf?" degan savolning javobi.
 *
 * Bosh sahifadan AJRATILDI: u "ilovada nima bor?" degan boshqa
 * savolga javob beradi. Ikkalasi bir sahifada turganda kurslar
 * pastda qolib, ularni ko'rish uchun surish kerak edi.
 */
export const yolKurslar = () => "/darslar";

/**
 * Testlar — sinf tanlash.
 *
 * Kursdan TASHQARIDA. Test o'lchaydi, dars esa o'rgatadi:
 * o'lchamoqchi bo'lgan odamda "qaysi bobdan boshlay" degan savol
 * yo'q, faqat "nechanchi sinfman" degan savol bor. Ilgari testlar
 * faqat kurs ichidan ochilardi va ko'pchilik u yerga yetib
 * bormasdi.
 */
export const yolTestSinf = () => "/testlar";

/** Hisob sozlamalari: ism, familiya, kirish usullari. */
export const yolSozlama = () => "/sozlamalar";

/**
 * Umumiy qidiruv — kursdan TASHQARIDA.
 *
 * U butun ilova bo'ylab qidiradi: 1-sinf darsi ham, 11-sinf
 * formulasi ham, o'yin ham bitta ro'yxatda chiqadi. `/kurs/...`
 * ostiga qo'yilsa, manzilda tasodifiy sinf raqami turib qolardi va
 * "9-sinf qidiruvi" degan yolg'on ma'no paydo bo'lardi.
 */
export const yolQidiruv = () => "/qidiruv";

/**
 * Foydalanuvchi masalalari — kursdan TASHQARIDA.
 *
 * Masala sinf kodi bilan belgilanadi, lekin bo'lim biror kursga
 * TEGISHLI emas: bir ekranda 1-sinf masalasi ham, 11-sinfniki ham
 * turadi va odam ular orasida filtr bilan yuradi. `/kurs/...`
 * ostiga qo'yilsa, manzilda tasodifiy sinf raqami qolib, ulashilgan
 * havola "bu 9-sinf masalasi ekan" degan yolg'onni aytardi.
 */
export const yolMasalalar = () => "/masalalar";
/** Yangi masala yozish. `<id>` dan OLDIN kelishi shart (App.tsx). */
export const yolMasalaYangi = () => "/masalalar/yangi";
/** O'z masalalarim — hamma holatda, rad sababi bilan. */
export const yolMasalalarim = () => "/masalalar/menikilar";
export const yolMasala = (id: number) => `/masalalar/${id}`;
export const yolMasalaMuallif = (profilId: number) => `/masalalar/muallif/${profilId}`;

/** Reyting — kim qancha yulduz yig'gan. Kursdan tashqarida: hammasi birga. */
export const yolReyting = () => "/reyting";

/**
 * Kichkintoylar bo'limi — kursdan TASHQARIDA va bu ataylab.
 *
 * U sinf emas va kurs ham emas: bu yerda dars, tartib va yulduz yo'q.
 * `/kurs/...` ostiga qo'yilsa, manzilda tasodifiy sinf raqami turib
 * qolardi va ulashilgan havola "bu 1-sinf mavzusi ekan" degan yolg'onni
 * aytardi.
 */
export const yolKichkintoy = () => "/kichkintoy";
export const yolKichkintoyMavzu = (id: string) => `/kichkintoy/${id}`;

/**
 * O'yinlar — kursdan TASHQARIDA.
 *
 * Manzil `/kurs/...` ostiga tushmasligi ataylab: o'yin biror sinfga
 * tegishli emas, uni 1-sinf bolasi ham, kattasi ham o'ynaydi. Kurs
 * ichiga qo'ysak, havolada tasodifiy sinf raqami turib qolardi va
 * ulashilgan havola "bu 2-sinf o'yini ekan" degan yolg'onni aytardi.
 */
export const yolOyinlar = () => "/oyinlar";

/** Bugungi maydon — kunlik uch bosqich. */
export const yolMaydon = () => "/oyinlar/maydon";

/** Do'st bilan bellashuv — chaqiruv yasash. */
export const yolDuel = () => "/oyinlar/duel";

/** Chaqiruv havolasi. ATAYLAB qisqa (`/duel/<kod>`): u Telegramda
 *  ulashiladi va uzun manzil xabarni ikki qatorga bo'lib yuboradi. */
export const yolDuelKod = (kod: string) => `/duel/${kod}`;
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

/**
 * Testlar bazasi — darslardan alohida bo'lim. 5–11-sinfda.
 *
 * Manzil KURS ostida turadi, garchi test ikkala fandan (algebra va
 * geometriya) aralash yig'ilsa ham. Sabab: odam u yerga aynan kurs
 * ekranidan kiradi va "9-sinf testlari" degan tushuncha uning uchun
 * kursning bir qismi. Alohida `/testlar/9` manzili esa hech qayerdan
 * ko'rinmaydigan yetim sahifa bo'lardi.
 */
export const yolTestlar = (c: Course) => `/kurs/${c.slug}/testlar`;

/** O'quvchining o'z hisoboti — testlar tarixi va o'sish. */
export const yolHisobot = (c: Course) => `/kurs/${c.slug}/hisobot`;

/** Formulalar varaqasi. */
export const yolFormulalar = (c: Course) => `/kurs/${c.slug}/formulalar`;

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
