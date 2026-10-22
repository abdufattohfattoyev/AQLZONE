/**
 * BILIM XARITASI — DTM matematikasi bo'yicha diagnostika (`screens/Diagnostika.tsx`).
 *
 * ─────────────── NEGA ───────────────
 *
 * Yangi kelgan abituriyent 13 mavzuning qaysi biri yiqitayotganini
 * bilmaydi, 13 ta mavzu testini (195 savol) ishlab chiqishga esa hech kim
 * o'tirmaydi. Diagnostika har mavzudan oz savol beradi va xarita chizadi:
 * kuchli, o'rta, zaif. Tavsiya va reja shu xaritadan yasaladi (serverda,
 * `backend/core/diagnostika.py` — hisob qoidalari o'sha yerda).
 *
 * ─────────────── QISQA VA ANIQLASHTIRISH ───────────────
 *
 * Qisqa bosqich — har mavzudan `QISQA` savol (26 ta). 1/2 natija bilgani
 * ham, omadi ham bo'lishi mumkin — bunday mavzu "taxminiy" deb
 * ko'rsatiladi va aniqlashtirish taklif qilinadi: o'sha mavzulardan yana
 * `QISQA` tadan savol. Natija qisqa bosqichdan keyin DARHOL yuboriladi —
 * aniqlashtirishdan voz kechgan odamda ham taxminiy xarita qolsin.
 *
 * ─────────────── SAVOLLAR ───────────────
 *
 * Alohida baza yo'q: mavzu testlaridagi kabi o'sha mavzu boblarining
 * generatorlaridan (`dtmMavzu.ts` → `boblar`). Savollar boblar bo'ylab
 * navbat bilan olinadi — "Tenglamalar" ning ikkala savoli ham 7-sinf
 * chiziqli tenglamasidan chiqib qolmasin. Ikki variantli savol olinmaydi
 * (`daraja.ts` → `yaroqli`): yarim ehtimol bilan topiladi va hech narsani
 * o'lchamaydi.
 *
 * Vaqt cheklanmaydi va javobdan keyin to'g'ri/xato ko'rsatilmaydi: bu
 * imtihon emas, o'lchov. Qo'rqqan yoki shoshgan odam taxmin qiladi va
 * xarita yolg'on chiqadi — shuning uchun "Bilmayman" tugmasi bor.
 *
 * Hisob React'siz va `scripts/diagnostika.ts` da sinaladi.
 */
import type { Activity, Answer } from "./activity";
import { bilanProfil, joriyProfil, profilQuery, sorov } from "./api";
import { manbalar, savolIzi } from "./blok";
import type { Manba } from "./blok";
import { courseById } from "./curriculum";
import { yaroqli } from "./daraja";
import { DTM_MAVZULAR } from "./dtmMavzu";

/** Qisqa bosqichda har mavzudan savol; aniqlashtirishda yana shuncha. */
export const QISQA = 2;
/** Baholash chegaralari — serverdagi `KUCHLI`, `ZAIF` bilan bir xil. */
export const KUCHLI = 70;
export const ZAIF = 40;
/** Reja uzunliklari — serverdagi `REJA_KUNLAR`. */
export const REJA_KUNLAR = [7, 14, 30] as const;

export interface DiagSavol {
  a: Activity;
  /** DTM mavzusi. */
  slug: string;
  /** Bob kaliti — `algebra9|3`. Tavsiya aynan shu bobning darsiga olib boradi. */
  bob: string;
}

/* ------------------------------------------------------------ savollar */

/** Mavzuning har bobi — o'z generatorlari bilan. Generatorsiz bob tashlanadi. */
function mavzuBoblari(slug: string): { bob: string; manba: Manba[] }[] {
  const m = DTM_MAVZULAR.find((x) => x.slug === slug);
  if (!m) return [];
  const r: { bob: string; manba: Manba[] }[] = [];
  for (const [kursId, ui] of m.boblar) {
    const c = courseById(kursId);
    const manba = c ? manbalar(c, c.units, ui) : [];
    if (manba.length) r.push({ bob: `${kursId}|${ui}`, manba });
  }
  return r;
}

const tasodif = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]!;

/**
 * Har mavzudan `har` tadan savol. Tartib — mavzular aralash, aylana bilan
 * (avval hamma mavzuning birinchi savoli, keyin ikkinchisi): bir mavzuning
 * savollari ketma-ket kelsa, zaif mavzuda odam ketma-ket yiqilib, qolganini
 * ham "bilmayman" bilan o'tkazib yuborardi.
 *
 * `oldingi` — shu urinishda allaqachon chiqqan savollar (aniqlashtirish
 * qisqa bosqichdagi savolni qaytarmasin) va bob navbatini davom ettirish
 * uchun: aniqlashtirish o'sha mavzuning BOSHQA boblaridan so'raydi.
 */
export function savollarYasa(slugs: string[], har: number, oldingi: DiagSavol[] = []): DiagSavol[] {
  const chiqqan = new Set(oldingi.map((s) => savolIzi(s.a)));
  const guruhlar = slugs.map((slug) => {
    const boblar = mavzuBoblari(slug);
    const r: DiagSavol[] = [];
    if (!boblar.length) return r;
    // Navbat oldingi savollar sonidan davom etadi; birinchi bob tasodifiy.
    const boshi = Math.floor(Math.random() * boblar.length) + oldingi.filter((s) => s.slug === slug).length;
    for (let i = 0; r.length < har && i < har * 3; i++) {
      const b = boblar[(boshi + i) % boblar.length]!;
      for (let k = 0; k < 25; k++) {
        const a = tasodif(b.manba).gen();
        const iz = savolIzi(a);
        if (yaroqli(a) && !chiqqan.has(iz)) {
          chiqqan.add(iz);
          r.push({ a, slug, bob: b.bob });
          break;
        }
      }
    }
    return r;
  });
  const r: DiagSavol[] = [];
  for (let i = 0; i < har; i++) for (const g of guruhlar) if (g[i]) r.push(g[i]!);
  return r;
}

/** Javob to'g'rimi. "Bilmayman" — xato (bilmagan narsa). */
export const togrimi = (s: DiagSavol, javob: Answer | "bilmayman" | null): boolean =>
  javob !== null && javob !== "bilmayman" && String(javob) === String(s.a.answer);

/* ------------------------------------------------------------ hisob */

export interface BobSanoq { k: string; t: number; j: number }
/** Bitta mavzuning sanog'i — serverga shu ko'rinishda ketadi. */
export interface MavzuSanoq { s: string; t: number; j: number; b: BobSanoq[] }

/** Savollar va javoblardan 13 mavzuning sanog'i (tartib — `DTM_MAVZULAR`). */
export function sanoq(savollar: DiagSavol[], togri: boolean[]): MavzuSanoq[] {
  return DTM_MAVZULAR.map(({ slug }) => {
    const b = new Map<string, BobSanoq>();
    let t = 0, j = 0;
    savollar.forEach((s, i) => {
      if (s.slug !== slug || togri[i] === undefined) return;
      j++;
      if (togri[i]) t++;
      const x = b.get(s.bob) ?? { k: s.bob, t: 0, j: 0 };
      x.j++;
      if (togri[i]) x.t++;
      b.set(s.bob, x);
    });
    return { s: slug, t, j, b: [...b.values()] };
  });
}

export const foiz = (t: number, j: number): number => (j ? Math.round((100 * t) / j) : 0);

export type Daraja = "kuchli" | "orta" | "zaif";
export const darajaOl = (f: number): Daraja => (f >= KUCHLI ? "kuchli" : f < ZAIF ? "zaif" : "orta");

/** 2/2, 0/2 yoki 4+ savol — aniq; qolgani taxminiy (serverdagi `aniqmi`). */
export const aniqmi = (t: number, j: number): boolean => j >= 2 * QISQA || (j >= QISQA && (t === 0 || t === j));

/** Aniqlashtirish kerak bo'lgan mavzular. */
export const noaniqlar = (s: MavzuSanoq[]): string[] => s.filter((m) => !aniqmi(m.t, m.j)).map((m) => m.s);

/** "algebra9|3" → kurs va bob raqami; bob topilmasa `null`. */
export function bobOl(k: string): { kursId: string; ui: number } | null {
  const [kursId, ui] = k.split("|");
  const n = Number(ui);
  const c = kursId ? courseById(kursId) : undefined;
  return c && Number.isInteger(n) && c.units[n] ? { kursId: c.id, ui: n } : null;
}

/* ------------------------------------------------------------ jarayon */

/**
 * Ishlanayotgan urinish — har javobdan keyin qurilmaga yoziladi:
 * sahifa yangilansa yoki ilova yopilsa ham shu joydan davom etadi.
 * Natija yuborilmagan bo'lsa (`yuborildi` yo'q), keyingi ochilishda
 * qayta yuboriladi.
 */
export interface Jarayon {
  /** Urinish boshlangan payt (ms) — serverda takrorni to'xtatuvchi kalit. */
  vaqt: number;
  bosqich: "qisqa" | "aniq";
  savollar: DiagSavol[];
  /** Qisqa bosqich savollari soni — aniqlashtirish undan keyin boshlanadi. */
  qisqaSoni: number;
  javoblar: boolean[];
  sekund: number;
  /** Shu bosqich natijasi serverga yetdi. */
  yuborildi?: boolean;
}

const KALIT = "azapp_diagnostika_v1";
/** Bir kundan eski chala urinish davom ettirilmaydi — bilim o'zgargan. */
const ESKIRISH = 24 * 3600 * 1000;

export function jarayonOqi(): Jarayon | null {
  try {
    const x = JSON.parse(localStorage.getItem(KALIT) || "null") as Jarayon | null;
    if (!x || typeof x.vaqt !== "number" || !Array.isArray(x.savollar) || !Array.isArray(x.javoblar)) return null;
    return Date.now() - x.vaqt < ESKIRISH ? x : null;
  } catch { return null; }
}

export function jarayonYoz(j: Jarayon | null): void {
  try {
    if (j) localStorage.setItem(KALIT, JSON.stringify(j));
    else localStorage.removeItem(KALIT);
  } catch { /* faqat shu ochilishda */ }
}

/* ------------------------------------------------------------ server */

export interface MavzuNatija {
  slug: string;
  togri: number;
  jami: number;
  foiz: number;
  daraja: Daraja;
  aniq: boolean;
  zaifBoblar: string[];
}

export interface DiagNatija {
  id: number;
  vaqt: number;
  sana: string;
  sinf: number;
  umumiy: number;
  aniq: boolean;
  taxminiy: number;
  sekund: number;
  mavzular: MavzuNatija[];
  kuchli: string[];
  takror: string[];
}

export type VazifaTur = "dars" | "test" | "aralash" | "qayta";
export interface Vazifa { kun: number; tur: VazifaTur; s?: string; bob?: string; v?: number; ok: boolean; sana: string }

export interface Reja {
  id: number;
  kun: number;
  boshi: string;
  bugun: number;
  bajarildi: number;
  vazifalar: Vazifa[];
}

export interface DiagHolat {
  premium: boolean;
  ism: string;
  sinf: number;
  kim: string;
  soni: number;
  oxirgi: DiagNatija | null;
  keyingi: string | null;
  oldingi: { sana: string; umumiy: number; mavzular: Record<string, number> } | null;
  tarix: { id: number; sana: string; umumiy: number }[];
  reja: Reja | null;
}

/**
 * DTM sahifasidagi karta uchun qisqa xulosa — qurilmada. Karta har ochilishda
 * serverga so'rov yubormasin: DTM sahifasi ilovaning eng ko'p ochiladigan
 * joylaridan biri. Xulosa diagnostika sahifasi har ochilganda yangilanadi.
 */
export interface Xulosa { umumiy: number; takror: string[] }
const xulosaKalit = () => `azapp_diagnostika_xulosa_v1|${joriyProfil() ?? ""}`;

export function xulosaOqi(): Xulosa | null {
  try {
    const x = JSON.parse(localStorage.getItem(xulosaKalit()) || "null") as Xulosa | null;
    return x && typeof x.umumiy === "number" && Array.isArray(x.takror) ? x : null;
  } catch { return null; }
}

function xulosaYoz(h: DiagHolat): DiagHolat {
  try {
    if (h.oxirgi) localStorage.setItem(xulosaKalit(), JSON.stringify({ umumiy: h.oxirgi.umumiy, takror: h.oxirgi.takror }));
    else localStorage.removeItem(xulosaKalit());
  } catch { /* karta "boshlash" ni ko'rsatadi */ }
  return h;
}

export const diagHolat = (): Promise<DiagHolat> =>
  sorov<DiagHolat>(`/api/v1/diagnostika${profilQuery()}`).then(xulosaYoz);

export const diagYubor = (j: Jarayon): Promise<DiagHolat> =>
  sorov<DiagHolat>("/api/v1/diagnostika", bilanProfil({
    vaqt: j.vaqt, sekund: j.sekund, aniq: j.bosqich === "aniq", mavzular: sanoq(j.savollar, j.javoblar),
  })).then(xulosaYoz);

export const rejaYasa = (kun: number): Promise<Reja> =>
  sorov<Reja>("/api/v1/diagnostika/reja", bilanProfil({ kun }));

export const rejaBelgi = (reja: number, i: number, ok: boolean): Promise<Reja> =>
  sorov<Reja>("/api/v1/diagnostika/reja/belgi", bilanProfil({ reja, i, ok }));
