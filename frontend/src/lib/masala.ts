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
  /** Shu odam bergan ovoz. */
  ovozim?: Ovoz;
  /** Urinib ko'rilganmi — ro'yxatda "yechilgan" belgisi uchun. */
  uringan?: boolean;
  /** Birinchi urinish to'g'ri bo'lganmi. Urinmagan bo'lsa `null`. */
  birinchiTogri?: boolean | null;
}

export interface Royxat {
  masalalar: Masala[];
  yana: boolean;
  sahifa: number;
}

/** Ro'yxat saralash usullari. */
export type Tartib = "yangi" | "zor" | "qiyin" | "koplik";

export interface JavobNatija {
  togri: boolean;
  /** Shu odamning BIRINCHI urinishimi — statistika faqat shunda o'zgaradi. */
  birinchi: boolean;
  yechim: string;
  javob: string;
  urinishSoni: number;
  yechganSoni: number;
  birinchiTogri: boolean;
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

export function royxat(
  sinf: number | null, tartib: Tartib, sahifa = 0,
): Promise<Royxat> {
  const q = new URLSearchParams({ tartib, sahifa: String(sahifa) });
  if (sinf !== null) q.set("sinf", String(sinf));
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

export interface YangiMasala {
  sinf: number;
  matn: string;
  javob: string;
  yechim: string;
  /** Ixtiyoriy chizma. Berilsa so'rov `multipart/form-data` bo'ladi. */
  rasm?: File | null;
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
  const { rasm, ...qolgan } = m;
  if (!rasm) return sorov(`/api/v1/masalalar`, bilanProfil({ ...qolgan }));

  const f = new FormData();
  for (const [k, v] of Object.entries(bilanProfil({ ...qolgan }))) {
    f.append(k, String(v));
  }
  f.append("rasm", rasm);
  return sorov(`/api/v1/masalalar`, f);
}
