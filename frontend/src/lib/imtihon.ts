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
import { bilanProfil, profilQuery, sorov } from "./api";
import { blokYasa } from "./blok";
import { courseById } from "./curriculum";
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

/**
 * Bitta tugagan urinishni yuboradi. Xato bo'lsa jim — keyingi
 * `sinxronla` yetkazadi. Promise qaytadi: natija ekranidagi reyting
 * kartasi urinish yozilgandan KEYIN so'raladi, aks holda odam o'zini
 * jadvalda ko'rmasdi.
 */
export function serverga(n: ImtihonNatija): Promise<void> {
  return sorov("/api/v1/imtihon/natija", bilanProfil({ ...n })).then(() => {}, () => {});
}

/* ------------------------------------------------------ haftalik reyting */

/** Qaysi imtihon: DTM varianti yoki milliy sertifikat. */
export type ImtTur = "dtm" | "sert";

export interface ReytingQator {
  orin: number;
  ism: string;
  variant: number;
  togri: number;
  jami: number;
  /** Faqat sertifikatda — 100 ballik. */
  ball: number | null;
  sekund: number;
  men: boolean;
  /** O'zimnikida: jadvalga kirgan urinishning vaqti (`ImtihonNatija.vaqt`). */
  vaqt?: number;
}

export interface Reyting {
  tur: ImtTur;
  variant: number | null;
  hafta_boshi: string;
  ishlagan: number;
  /** Variant raqami → shu hafta nechta odam ishladi. */
  variantlar: Record<string, number>;
  qatorlar: ReytingQator[];
  meniki: ReytingQator | null;
}

/**
 * Shu haftaning jadvali (`core/imtihon.haftalik_reyting`). `variant`
 * berilmasa — umumiy: har odamning eng yaxshi natijasi. Hisobga har
 * variantning BIRINCHI urinishi kiradi.
 */
export function haftalikReyting(tur: ImtTur, variant?: number | null): Promise<Reyting> {
  const v = variant ? `&variant=${variant}` : "";
  return sorov<Reyting>(`/api/v1/imtihon/reyting?tur=${tur}${v}${profilQuery("&")}`);
}

/* ------------------------------------------------ ulashish va taklif */

/**
 * Natija kartasini odamning O'Z Telegram'iga yuboradi (`core/taklif.py`):
 * u yerdan guruhga yo'naltiradi. Kartadagi tugma — shaxsiy taklif havolasi.
 * Xato (Telegram'i yo'q, internet) — tashlanadi, chaqiruvchi oddiy
 * "ulashish" oynasini ochadi.
 */
export function natijaniUlash(tur: ImtTur, variant: number): Promise<{ ok: boolean; havola: string }> {
  return sorov("/api/v1/imtihon/ulash", bilanProfil({ tur, variant }));
}

/** Shaxsiy taklif havolasi va shu havola bilan kelganlar soni. */
export function taklifHolati(): Promise<{ havola: string; soni: number }> {
  return sorov(`/api/v1/taklif${profilQuery()}`);
}

/* -------------------------------------------- javoblar — ko'rib chiqish */

/**
 * OXIRGI URINISHNING JAVOBLARI — variant bo'yicha, faqat qurilmada.
 *
 * Nega kerak: natija ekrani yopilgach, "qaysi savolda nima deb
 * belgiladim?" degan savolga javob yo'q edi. Savollarni saqlash shart
 * emas — variant raqamdan har safar AYNAN o'shanday yasaladi. Faqat
 * javoblar yoziladi, ularning ustiga savollar qayta quriladi.
 */
export interface SaqlanganJavob<J> {
  variant: number;
  javoblar: J[];
  vaqt: number;
}

const javobKalit = (tur: ImtTur) => `azapp_${tur}_javob_v1`;

function javobXarita<J>(tur: ImtTur): Record<string, SaqlanganJavob<J>> {
  try {
    const x = JSON.parse(localStorage.getItem(javobKalit(tur)) || "{}") as unknown;
    return x && typeof x === "object" && !Array.isArray(x) ? x as Record<string, SaqlanganJavob<J>> : {};
  } catch { return {}; }
}

export function javobSaqla<J>(tur: ImtTur, variant: number, javoblar: J[]): void {
  const x = javobXarita<J>(tur);
  x[String(variant)] = { variant, javoblar, vaqt: Date.now() };
  try { localStorage.setItem(javobKalit(tur), JSON.stringify(x)); } catch { /* ko'rib chiqish bo'lmaydi, xolos */ }
}

export function javobOqi<J>(tur: ImtTur, variant: number): SaqlanganJavob<J> | null {
  const j = javobXarita<J>(tur)[String(variant)];
  return j && Array.isArray(j.javoblar) ? j : null;
}

/** Eng oxirgi ishlangan variant — ro'yxatdagi "Ko'rib chiqish" qatori uchun. */
export function oxirgiJavob(tur: ImtTur): { variant: number; vaqt: number } | null {
  const hammasi = Object.values(javobXarita<unknown>(tur)).filter((x) => x && typeof x.vaqt === "number");
  if (!hammasi.length) return null;
  const o = hammasi.reduce((a, b) => (b.vaqt > a.vaqt ? b : a));
  return { variant: o.variant, vaqt: o.vaqt };
}

/* ------------------------------------------------------ zaif mavzular */

/**
 * DTM varianti qaysi mavzularda xato qilindi — ro'yxatdagi "Ko'p xato
 * qilinayotgan mavzular" chiplari uchun (`screens/Imtihon.tsx`).
 *
 * Natija yozuviga (`ImtihonNatija`) QO'SHILMADI: u serverga ham boradi
 * va server bu maydonni kutmaydi. Shu sabab alohida, faqat qurilmadagi
 * kalitda — oxirgi beshta urinish (o'rtacha ball ham beshtadan olinadi).
 */
export interface MavzuXato {
  mavzu: string;
  kursId: string;
  xato: number;
  /**
   * Bobning tartib raqami — zaif mavzular MASHQI shu bobdan savol
   * yig'adi (`Qamrov` "mavzular"). Eski yozuvlarda yo'q: u holda bob
   * nomidan topiladi (`mashqBoblari`).
   */
  ui?: number;
}

/**
 * DTM va sertifikatning zaif mavzulari ALOHIDA saqlanadi: sertifikatda
 * ochiq javobli savollar bor va bir xil mavzu ikki imtihonda har xil
 * yiqitadi. Eski DTM kaliti o'zgarmadi — yig'ilgan tarix yo'qolmasin.
 */
const mavzuKalit = (tur: ImtTur) => (tur === "dtm" ? "azapp_imtihon_mavzu_v1" : "azapp_sert_mavzu_v1");
const MAVZU_URINISH = 5;

function mavzuOqi(tur: ImtTur): MavzuXato[][] {
  try {
    const x = JSON.parse(localStorage.getItem(mavzuKalit(tur)) || "[]") as unknown;
    return Array.isArray(x) ? x.filter(Array.isArray) as MavzuXato[][] : [];
  } catch { return []; }
}

/** Bitta urinishning mavzular bo'yicha xatolari (nol xatolilari tushiriladi). */
export function mavzuXatoYoz(urinish: MavzuXato[], tur: ImtTur = "dtm"): void {
  const yangi = [urinish.filter((x) => x.xato > 0), ...mavzuOqi(tur)].slice(0, MAVZU_URINISH);
  try { localStorage.setItem(mavzuKalit(tur), JSON.stringify(yangi)); } catch { /* ko'rinmaydi, xolos */ }
}

/**
 * Zaif mavzular mashqi uchun boblar — ko'pi bilan uchta eng zaifi.
 * `ui` yo'q eski yozuvda bob nomi bo'yicha qidiriladi.
 */
export function mashqBoblari(tur: ImtTur): { kursId: string; ui: number }[] {
  return zaifMavzular(3, tur).flatMap((m) => {
    const ui = m.ui ?? courseById(m.kursId)?.units.findIndex((U) => U.u === m.mavzu) ?? -1;
    return ui >= 0 ? [{ kursId: m.kursId, ui }] : [];
  });
}

/** Oxirgi urinishlarda eng ko'p xato qilingan mavzular — ko'pi bilan `n` ta. */
export function zaifMavzular(n = 3, tur: ImtTur = "dtm"): MavzuXato[] {
  const m = new Map<string, MavzuXato>();
  for (const urinish of mavzuOqi(tur)) {
    for (const x of urinish) {
      if (!x || typeof x.mavzu !== "string" || typeof x.xato !== "number") continue;
      const k = `${x.kursId}|${x.mavzu}`;
      const bor = m.get(k);
      m.set(k, { ...x, xato: (bor?.xato ?? 0) + x.xato });
    }
  }
  return [...m.values()].sort((a, b) => b.xato - a.xato).slice(0, n);
}
