/**
 * Masalalar bo'limi — server bilan aloqa.
 *
 * `api.ts` da EMAS, alohida faylda: u fayl butun ilovaning kirish
 * qatlami va uni har ekran yuklaydi. Masalalar esa alohida bo'lim
 * bo'lib, ochilmasa umuman kerak bo'lmaydi — bir joyda tursa,
 * uning kodi hamma ochilishda birga yuklanardi.
 *
 * ─────────────────── QOIDALAR SERVERDA ───────────────────
 *
 * Bu yerda hech qanday qaror qabul qilinmaydi. Yechim ochiqmi,
 * ovoz berish mumkinmi, rasm yaroqlimi — hammasini server aytadi va
 * mijoz shuni ko'rsatadi. Sabab: mijoz kodini har kim o'zgartira
 * oladi, ya'ni bu yerdagi tekshiruv himoya emas, faqat qulaylik.
 */
import { bilanProfil, profilQuery, sorov } from "./api";

/** Masalaning holati. Faqat muallif "kutmoqda" va "rad" ni ko'radi. */
export type MasalaHolat = "kutmoqda" | "tasdiq" | "rad";

/** Ovoz turi. Bo'sh satr — ovoz berilmagan. */
export type Ovoz = "like" | "dislike" | "";

export interface Muallif {
  id: number;
  ism: string;
  avatar: string;
}

export interface Masala {
  id: number;
  sinf: number;
  matn: string;
  holat: MasalaHolat;
  muallif: Muallif;
  /** Shu masala menikimi — ovoz tugmalari o'chiriladi. */
  meniki: boolean;
  urinishSoni: number;
  yechganSoni: number;
  /**
   * Nechta ODAM ochgan — har biri bir marta sanaladi.
   *
   * Urinishdan boshqa son: masala ko'p ochilib kam yechilsa — u
   * qiziq, lekin qiyin; kam ochilsa — ro'yxatda ko'zga tashlanmayapti.
   */
  korishSoni: number;
  /** Birinchi urinishda to'g'ri yechganlar foizi (0–100). */
  qiyinlik: number;
  like: number;
  dislike: number;
  createdAt: string;
  /** Yechim ochiqmi. Ro'yxatda HAR DOIM `false` — u yerda yechim yo'q. */
  yechimOchiq: boolean;
  yechim?: string;
  javob?: string;
  /** Faqat muallifning o'ziga va faqat rad etilganda keladi. */
  radSababi?: string;
  /** Biriktirilgan rasm manzili. Yo'q bo'lsa bo'sh satr. */
  rasm: string;
  /**
   * Test variantlari. BO'SH ro'yxat — javob yoziladigan masala.
   *
   * Ikkalasi bir turda turadi, chunki farqi faqat javob qanday
   * olinishida: matn, chizma, yechim, statistika va tanga ikkalasida
   * ham bir xil ishlaydi.
   */
  variantlar: string[];
  /** Shu odam bergan ovoz. */
  ovozim?: Ovoz;
  /** Urinib ko'rilganmi — ro'yxatda "yechilgan" belgisi uchun. */
  uringan?: boolean;
  /** Shu odam necha marta urindi. Yechim narxi shunga bog'liq. */
  urinishim?: number;
  /** Birinchi urinish to'g'ri bo'lganmi. Urinmagan bo'lsa `null`. */
  birinchiTogri?: boolean | null;
  /**
   * Kanal tugmasi — FAQAT administrator javobida keladi.
   *
   * Oddiy foydalanuvchida maydonning o'zi yo'q, ya'ni tugma ham
   * chizilmaydi va serverga so'rov ham ketmaydi.
   */
  kanal?: KanalHolat & { mumkin: boolean };
  /**
   * Keyingi masala — FAQAT yechim ochilganda keladi.
   *
   * Yechib bo'lgan odam ro'yxatga qaytib, o'sha sahifani qaytadan
   * ko'zdan kechirib, keyingisini o'zi qidirishi kerak edi.
   * Ko'pchilik qidirmaydi — shu yerda to'xtaydi.
   */
  keyingi?: Keyingi | null;
  /** Muallifning tasdiqlangan masalalari soni — yechilgandan keyin. */
  muallifMasalalari?: number;
}

/** "Navbatdagi masala" kartasi uchun qisqacha ma'lumot. */
export interface Keyingi {
  id: number;
  sinf: number;
  /** Matnning birinchi qatori — kartada sarlavha bo'lib turadi. */
  matn: string;
  rasm: string;
  variantlar: string[];
}

/** Masalaning kanaldagi ahvoli — admin qatori shundan chiziladi. */
export interface KanalHolat {
  yuborilgan: boolean;
  /** Postning o'ziga havola (`t.me/<kanal>/<id>`). */
  havola?: string;
  /**
   * Kunlik tekshiruv postni KANALDA TOPMADI.
   *
   * Ya'ni masala bir marta chiqqan, keyin o'chib ketgan. Admin uchun
   * bu "qayta yuborish" degan chaqiriq — shuning uchun alohida
   * bayroq: `yuborilgan` o'zi bu holatni ayta olmaydi.
   */
  yoq?: boolean;
  /** Oxirgi tekshiruv payti (ISO). Hech tekshirilmagan bo'lsa yo'q. */
  tekshirilgan?: string | null;
}

export interface Royxat {
  masalalar: Masala[];
  yana: boolean;
  sahifa: number;
  /** Nechta sahifa bor — raqamlar shundan chiziladi. */
  sahifalar: number;
  /** Filtrga tushgan masalalarning jami soni. */
  jami: number;
}

/** Ro'yxat saralash usullari. */
export type Tartib = "yangi" | "zor" | "qiyin" | "koplik";

/**
 * Yechilganlik filtri.
 *
 * "yechgan" — BIRINCHI urinishda to'g'ri topgani, ya'ni kartadagi
 * yashil belgi bilan bir xil qoida. Xato javob bergan masala
 * "yechilmagan" tomonda qoladi: odam u yerga aynan qaytishi kerak.
 */
export type Holat = "hammasi" | "yechilmagan" | "yechgan";

export interface JavobNatija {
  togri: boolean;
  /** Shu odamning BIRINCHI urinishimi — statistika faqat shunda o'zgaradi. */
  birinchi: boolean;
  /** Nechanchi urinish ekani (1 dan). Mukofot shunga qarab beriladi. */
  urinishim: number;
  /** Yechim ochilganmi. Xato javobda — yo'q. */
  yechimOchiq: boolean;
  /** Yechim va javob FAQAT ochilganda keladi. */
  yechim?: string;
  javob?: string;
  urinishSoni: number;
  yechganSoni: number;
  birinchiTogri: boolean;
  /** Yechim shu javob bilan ochilgan bo'lsa — davom yo'li. */
  keyingi?: Keyingi | null;
  /** Muallifning tasdiqlangan masalalari soni. */
  muallifMasalalari?: number;
}

export interface MuallifSahifa {
  muallif: Muallif;
  meniki: boolean;
  jami: { masalalar: number; yechilgan: number; like: number };
  masalalar: Masala[];
}

export interface Menikilar {
  masalalar: Masala[];
  bugun: number;
  kunlikChegara: number;
}

/* ------------------------------------------------------------------ o'qish */

/**
 * Ro'yxatning bitta sahifasi.
 *
 * `teskari` — o'sha saralashning teskari yo'nalishi ("Yangi" →
 * eng eskisi birinchi). Alohida tartib kodlari qo'shish o'rniga
 * bitta bayroq: u har qanday saralashga bir xil qo'llanadi.
 */
export function royxat(
  sinf: number | null, tartib: Tartib, sahifa = 0, holat: Holat = "hammasi",
  teskari = false,
): Promise<Royxat> {
  const q = new URLSearchParams({ tartib, sahifa: String(sahifa), holat });
  if (sinf !== null) q.set("sinf", String(sinf));
  if (teskari) q.set("teskari", "1");
  return sorov<Royxat>(`/api/v1/masalalar?${q}${profilQuery("&")}`);
}

export const bittasi = (id: number): Promise<Masala> =>
  sorov<Masala>(`/api/v1/masalalar/${id}${profilQuery()}`);

export const muallifSahifasi = (id: number): Promise<MuallifSahifa> =>
  sorov<MuallifSahifa>(`/api/v1/masalalar/muallif/${id}${profilQuery()}`);

export const menikilar = (): Promise<Menikilar> =>
  sorov<Menikilar>(`/api/v1/masalalar/menikilar${profilQuery()}`);

/* ------------------------------------------------------------------ yozish */

export const javobBer = (id: number, javob: string): Promise<JavobNatija> =>
  sorov<JavobNatija>(`/api/v1/masalalar/${id}/javob`, bilanProfil({ javob }));

export const ovozBer = (
  id: number, tur: "like" | "dislike",
): Promise<{ ovozim: Ovoz; like: number; dislike: number }> =>
  sorov(`/api/v1/masalalar/${id}/ovoz`, bilanProfil({ tur }));

/**
 * Yechimni ochadi — tanga to'langandan keyin (yoki uch urinishdan
 * keyin bepul). Tanga MIJOZDA yechiladi, server faqat ochilganini
 * yozib qo'yadi.
 */
export const yechimniOch = (
  id: number,
): Promise<{
  yechim: string; javob: string;
  keyingi?: Keyingi | null; muallifMasalalari?: number;
}> =>
  sorov(`/api/v1/masalalar/${id}/yechim`, bilanProfil({}));

/**
 * Masalani Telegram kanaliga joylaydi — FAQAT admin.
 *
 * Boshqa odamda bu yo'l umuman yo'q (server 404 qaytaradi) va
 * tugma ham ko'rinmaydi: `kanal` maydoni javobga qo'shilmaydi.
 *
 * `qayta` — allaqachon joylangan masalani qaytadan yuborish. Server
 * eski postni o'chirib, yangisini chiqaradi. Bayroqsiz so'rov esa
 * ikkinchi marta yubormaydi (`takror` qaytadi) — bexosdan bosilgan
 * tugma kanalga dubl chiqarmasligi uchun.
 */
export const kanalgaYubor = (
  id: number, qayta = false,
): Promise<KanalHolat & { yuborilgan: boolean }> =>
  sorov(`/api/v1/masalalar/${id}/kanal`, bilanProfil(qayta ? { qayta: true } : {}));

/** Ro'yxatdagi bitta odam — kim urinib ko'rgan. */
export interface Urinuvchi {
  profilId: number;
  ism: string;
  avatar: string;
  /** Birinchi urinishda topganmi — statistikaga shu tushadi. */
  birinchi: boolean;
  /** Oxir-oqibat topganmi — qaysi urinishda bo'lishidan qat'i nazar. */
  yechdi: boolean;
  urinish: number;
  sana: string;
}

/**
 * Kim bu masalaga urinib ko'rgan — FAQAT admin.
 *
 * Boshqa odamda bu yo'l umuman yo'q (server 404 qaytaradi): ro'yxatda
 * odamlarning ismi bor va u "kim nima yecholmadi" degan ma'lumot ham
 * beradi.
 */
export const yechganlar = (
  id: number,
): Promise<{
  royxat: Urinuvchi[]; urinishSoni: number; yechganSoni: number; korishSoni: number;
}> =>
  sorov(`/api/v1/masalalar/${id}/yechganlar${profilQuery()}`);

export interface YangiMasala {
  sinf: number;
  matn: string;
  javob: string;
  yechim: string;
  /** Ixtiyoriy chizma. Berilsa so'rov `multipart/form-data` bo'ladi. */
  rasm?: File | null;
  /** Test variantlari. Bo'sh — javob yoziladigan masala. */
  variantlar?: string[];
}

/**
 * Yangi masala yuboradi.
 *
 * Rasm bo'lsa `FormData`, bo'lmasa JSON. Ikkalasi ham bitta
 * endpointga boradi — server ikkalasini ham qabul qiladi. Har doim
 * `FormData` yuborish ham mumkin edi, lekin unda rasmsiz oddiy
 * so'rov ham katta va o'qishga qiyin bo'lardi.
 */
export function yubor(m: YangiMasala): Promise<{ ok: true; masala: Masala }> {
  const { rasm, variantlar, ...qolgan } = m;
  const tana = { ...qolgan, variantlar: variantlar ?? [] };
  if (!rasm) return sorov(`/api/v1/masalalar`, bilanProfil(tana));

  const f = new FormData();
  for (const [k, v] of Object.entries(bilanProfil(tana))) {
    // `FormData` ro'yxatni bilmaydi — variantlar JSON satri bo'lib
    // ketadi va server uni o'sha yerda ro'yxatga qaytaradi
    // (`MasalaSerializer.to_internal_value`). Aks holda rasmli test
    // masalasini umuman yuborib bo'lmasdi.
    f.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
  }
  f.append("rasm", rasm);
  return sorov(`/api/v1/masalalar`, f);
}
