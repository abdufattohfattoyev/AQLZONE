/**
 * DTM — MAVZU BO'YICHA TESTLAR.
 *
 * ─────────────── NEGA ARALASH VARIANT YETMAYDI ───────────────
 *
 * Aralash variant (`lib/imtihon.ts`) "imtihonga tayyormanmi?" degan
 * savolga javob beradi. Lekin tayyorlanayotgan odam ko'pincha boshqacha
 * ishlaydi: bu hafta trigonometriyani, keyingi hafta logarifmni YOPADI.
 * Aralash variantda bitta mavzudan 2–3 savol tushadi — mavzuni yopish
 * uchun bu juda kam, natija ham omadga bog'liq bo'lib qoladi.
 *
 * Mavzu testi — DTM dagi bitta bo'lim, lekin 7–11-sinflarning HAMMA
 * tegishli boblaridan: "Tenglamalar" 7-sinfning chiziqli tenglamasini
 * ham, 10-sinfning irratsional tenglamasini ham oladi. Imtihonda ular
 * yonma-yon keladi.
 *
 * ─────────────── VARIANT VA URUG' ───────────────
 *
 * Aralash variantlardagi kabi: har mavzuning har varianti raqamidan
 * yasaladi va har safar AYNAN bir xil chiqadi — o'sishni solishtirish
 * mumkin bo'lsin, Premium qulfi ham variant raqami bo'yicha ishlasin.
 *
 * Bob RAQAMI bilan bog'langan (`[kursId, ui]`). Darslikka bob qo'shilsa
 * yoki o'rni almashsa — `scripts/dtmMavzu.ts` buni ushlaydi: har bob
 * nomi kutilgan so'zni o'z ichiga olishi va 7–11-sinfning har bir
 * (takrorlash bo'lmagan) bobi biror mavzuga tushishi tekshiriladi.
 */
import { bilanProfil, sorov } from "./api";
import { blokYasa } from "./blok";
import type { Blok } from "./blok";
import type { Kalit } from "./matn";
import { kunUrugi, urugBilan } from "./oyin/urug";

/** Har mavzuda nechta variant. */
export const MAVZU_VARIANTLAR = 6;

/**
 * Har mavzuda nechta variant bepul. Egasining qarori (2026-10-15):
 * aralash variantlardagi 3 emas, 1 — mavzular 13 ta va 3 tadan bepul
 * berilsa, Premium'siz 39 ta test bo'lardi. Serverda `MAVZU_BEPUL`.
 */
export const MAVZU_BEPUL = 1;

/**
 * Bitta mavzu testining o'lchami — DTM sur'ati (savoliga 2 daqiqa).
 * 15 savol: bitta mavzuni yopishga yetadi va yarim soatga sig'adi.
 */
export const MAVZU_OLCHAM = { savol: 15, daqiqa: 30 };

export interface DtmMavzu {
  /** Manzil va serverdagi kalit — o'zgartirilmaydi (tarix shunga bog'langan). */
  slug: string;
  /** `lib/matn.ts` dagi nomi. */
  nom: Kalit;
  /** Qaysi boblardan: kurs id + bobning tartib raqami + nomida bo'lishi kerak so'z. */
  boblar: [kursId: string, ui: number, soz: string][];
}

/**
 * Mavzular — DTM matematika blokining bo'limlari tartibida: avval
 * algebra, so'ng geometriya. Serverdagi ro'yxat (`core/imtihon.py`,
 * `MAVZU_SLUGLAR`) bilan bir xil bo'lishi shart.
 */
export const DTM_MAVZULAR: DtmMavzu[] = [
  { slug: "ifodalar", nom: "dtmM_ifodalar", boblar: [
    ["algebra7", 0, "ifoda"], ["algebra7", 2, "ko'phad"], ["algebra7", 3, "ajratish"],
    ["algebra7", 4, "kasr"], ["algebra8", 0, "kasr"], ["algebra7", 6, "qoldiq"]] },
  { slug: "tenglamalar", nom: "dtmM_tenglamalar", boblar: [
    ["algebra7", 1, "tenglama"], ["algebra8", 2, "tenglama"], ["algebra9", 1, "Sistema"],
    ["algebra10", 2, "tenglama"], ["algebra9", 5, "Parametr"]] },
  { slug: "tengsizliklar", nom: "dtmM_tengsizliklar", boblar: [["algebra8", 1, "Tengsizlik"]] },
  { slug: "funksiyalar", nom: "dtmM_funksiyalar", boblar: [
    ["algebra9", 0, "funksiya"], ["algebra10", 1, "funksiya"]] },
  { slug: "progressiyalar", nom: "dtmM_progressiyalar", boblar: [["algebra9", 3, "Progressiya"]] },
  { slug: "trigonometriya", nom: "dtmM_trigonometriya", boblar: [
    ["algebra9", 2, "Trigonometriya"], ["algebra10", 4, "Trigonometrik"]] },
  { slug: "logarifm", nom: "dtmM_logarifm", boblar: [["algebra10", 3, "logarifm"]] },
  { slug: "hosila-integral", nom: "dtmM_hosila", boblar: [
    ["matematika11", 0, "Hosila"], ["matematika11", 1, "Hosila"], ["matematika11", 2, "Integral"]] },
  { slug: "ehtimollik", nom: "dtmM_ehtimollik", boblar: [
    ["algebra7", 5, "Kombinatorika"], ["algebra8", 3, "tahlil"], ["algebra9", 4, "Ehtimol"],
    ["algebra10", 5, "Ehtimol"], ["matematika11", 5, "ehtimol"]] },
  { slug: "uchburchaklar", nom: "dtmM_uchburchaklar", boblar: [
    ["geometriya7", 0, "Boshlang'ich"], ["geometriya7", 1, "Burchak"], ["geometriya7", 2, "uchburchak"],
    ["geometriya7", 3, "Parallel"], ["geometriya7", 4, "burchak"], ["geometriya8", 1, "uchburchak"],
    ["geometriya9", 0, "O'xshash"], ["geometriya9", 1, "teorema"], ["geometriya9", 3, "Metrik"]] },
  { slug: "tortburchak-aylana", nom: "dtmM_tortburchak", boblar: [
    ["geometriya8", 0, "To'rtburchak"], ["geometriya8", 3, "Yuz"], ["geometriya8", 4, "Aylana"],
    ["geometriya9", 2, "Aylana"]] },
  { slug: "vektorlar", nom: "dtmM_vektorlar", boblar: [["geometriya8", 2, "vektor"]] },
  { slug: "stereometriya", nom: "dtmM_stereometriya", boblar: [
    ["geometriya10", 1, "Stereometriya"], ["geometriya10", 2, "parallel"], ["geometriya10", 3, "perpendikulyar"],
    ["matematika11", 3, "Prizma"], ["matematika11", 4, "Piramida"], ["matematika11", 6, "Kesik"]] },
];

export const mavzuBySlug = (slug: string): DtmMavzu | null =>
  DTM_MAVZULAR.find((m) => m.slug === slug) ?? null;

/** Mavzu varianti urug'i — aralash variantlarnikidan boshqa nom: to'qnashmasin. */
export const mavzuUrugi = (slug: string, n: number): number => kunUrugi(`dtm-mavzu-${slug}-${n}`, 7);

/** Mavzu variantini yasaydi. Mavzu yoki raqam noto'g'ri bo'lsa — `null`. */
export function mavzuYasa(slug: string, n: number): Blok | null {
  const m = mavzuBySlug(slug);
  if (!m || !Number.isInteger(n) || n < 1 || n > MAVZU_VARIANTLAR) return null;
  const boblar = m.boblar.map(([kursId, ui]) => ({ kursId, ui }));
  // Zaxira bilan yig'iladi: ba'zi generatorlar o'zgarmas savol beradi va
  // `blokYasa` takrorini tashlaydi — bir-ikki bobli mavzuda 15 o'rniga
  // 13 savol qolardi. Ortig'i kesiladi, vaqt esa doim to'liq.
  const b = urugBilan(mavzuUrugi(slug, n), () =>
    blokYasa(11, "dtm", { tur: "mavzular", boblar }, { savol: MAVZU_OLCHAM.savol + 6, daqiqa: MAVZU_OLCHAM.daqiqa }));
  if (!b) return null;
  return { savollar: b.savollar.slice(0, MAVZU_OLCHAM.savol), daqiqa: MAVZU_OLCHAM.daqiqa };
}

/* ------------------------------------------------------------ natija */

/** Bitta topshirilgan mavzu varianti. `kurs` — mavzu slug'i. */
export interface MavzuNatija {
  kurs: string;
  variant: number;
  togri: number;
  jami: number;
  sekund: number;
  vaqt: number;
}

const KALIT = "azapp_dtm_mavzu_v1";
const CHEK = 120;

export function mavzuNatijalari(): MavzuNatija[] {
  try {
    const x = JSON.parse(localStorage.getItem(KALIT) || "[]") as MavzuNatija[];
    return Array.isArray(x) ? x.filter((n) => n && typeof n.kurs === "string" && typeof n.variant === "number") : [];
  } catch { return []; }
}

function yozibQoy(royxat: MavzuNatija[]): void {
  try { localStorage.setItem(KALIT, JSON.stringify(royxat.slice(0, CHEK))); } catch { /* natija ekranda qoladi */ }
}

export function mavzuSaqla(n: MavzuNatija): void {
  yozibQoy([n, ...mavzuNatijalari()]);
}

/** Shu mavzu variantidagi eng yaxshi natija. */
export function mavzuEng(royxat: MavzuNatija[], slug: string, variant: number): MavzuNatija | null {
  const shu = royxat.filter((x) => x.kurs === slug && x.variant === variant);
  return shu.length ? shu.reduce((a, b) => (b.togri > a.togri ? b : a)) : null;
}

/**
 * Mavzu bo'yicha O'ZLASHTIRISH — har variantning eng yaxshi natijasi
 * o'rtachasi. Oxirgi urinish emas: shoshib ishlangan bitta test
 * "men bu mavzuni qanchalik bilaman" degan javobni o'chirmasin.
 * Ishlanmagan mavzu — `null`.
 */
export function mavzuFoizi(royxat: MavzuNatija[], slug: string): number | null {
  const eng = new Map<number, number>();
  for (const x of royxat) {
    if (x.kurs !== slug || !x.jami) continue;
    eng.set(x.variant, Math.max(eng.get(x.variant) ?? 0, (100 * x.togri) / x.jami));
  }
  if (!eng.size) return null;
  return Math.round([...eng.values()].reduce((a, b) => a + b, 0) / eng.size);
}

/* ------------------------------------------------------------ server */

/**
 * Qurilmadagi hamma urinishni yuboradi va serverdagi ro'yxat bilan
 * qurilma nusxasini ALMASHTIRADI (sessiyadagi kabi, `lib/sessiya.ts`):
 * telefon almashsa ham tarix qoladi, internetsiz ishlangani keyingi
 * ochilishda yetib boradi.
 */
export async function mavzuSinxronla(): Promise<MavzuNatija[]> {
  const j = await sorov<{ natijalar: MavzuNatija[] }>(
    "/api/v1/imtihon/mavzu", bilanProfil({ urinishlar: mavzuNatijalari() }));
  const royxat = Array.isArray(j?.natijalar) ? j.natijalar : [];
  yozibQoy(royxat);
  return royxat;
}

/** Bitta tugagan urinish. Xato bo'lsa jim — keyingi sinxronlash yetkazadi. */
export function mavzuServerga(n: MavzuNatija & { mavzular?: { m: string; x: number }[] }): void {
  void sorov("/api/v1/imtihon/mavzu", bilanProfil({ ...n })).catch(() => {});
}
