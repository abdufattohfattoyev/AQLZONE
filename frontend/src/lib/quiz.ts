/**
 * QUIZ — foydalanuvchi yig'adigan savollar to'plami (`backend/core/quiz.py`).
 *
 * Ikki rejim, bitta kod: muallif jonli o'yin ochgan bo'lsa kod o'yinga,
 * bo'lmasa o'z tezligida yechishga olib boradi (`screens/QuizYech.tsx`).
 *
 * Javoblar SERVERDA tekshiriladi. Yechuvchiga savol javobsiz keladi —
 * shuning uchun bu yerdagi `OchiqSavol` da `javob` maydoni yo'q.
 */
import type { Activity, ChoiceKind } from "./activity";
import { bilanProfil, profilQuery, sorov } from "./api";
import { blokYasa, sinfBoblari, type Bob } from "./blok";

export type Rejim = "oz" | "jonli";
/**
 * Savol turlari — server bilan bir xil (`quiz.TURLAR`):
 * variant · yozma · rost (to'g'ri/noto'g'ri, javob "1"/"0") ·
 * tartib (`variantlar` TO'G'RI tartibda) · juftlash (`juftlar`).
 */
export type SavolTur = "variant" | "yozma" | "rost" | "tartib" | "juftlash";
export const SAVOL_TURLARI: SavolTur[] = ["variant", "yozma", "rost", "tartib", "juftlash"];
export const MIN_TARTIB = 3;
export const MAX_TARTIB = 6;
export const MIN_JUFT = 2;
export const MAX_JUFT = 5;

/** Jonli o'yinda bitta savolga beriladigan vaqt — server bilan bir xil (`quiz.VAQTLAR`). */
export const VAQTLAR = [10, 20, 30, 60, 90] as const;
export const STANDART_VAQT = 20;
export const MAX_SAVOL = 40;
export const MAX_MATN = 500;
export const MAX_VARIANT_MATN = 100;
export const MIN_VARIANT = 2;
export const MAX_VARIANT = 6;

/** Bazadan olingan savolning chizmasi — javobsiz (`QuestionView` chizadi). */
export type Chizma = Omit<Activity, "answer" | "choices"> & { kind?: ChoiceKind };

/** Muallif tahrirlaydigan savol — javobi bilan. */
export interface Savol {
  tur: SavolTur;
  matn: string;
  variantlar: string[];
  javob: string;
  vaqt: number;
  /** Juftlashda — `[chap, o'ng]` juftlari. */
  juftlar?: [string, string][];
  /** Oltin savol — jonli o'yinda ball ikki baravar. */
  oltin?: boolean;
  /** AI yozgan — muharrirda "tekshirib chiqing" belgisi. */
  ai?: boolean;
  a?: Chizma;
}

/**
 * Yechuvchiga keladigan savol — JAVOBSIZ. Tartibda `variantlar` aralash
 * keladi; juftlashda chap ustun (`chap`) va aralash o'ng ustun (`ong`).
 */
export type OchiqSavol = Omit<Savol, "javob" | "juftlar" | "ai"> & { chap?: string[]; ong?: string[] };

/** Javob: satr (variant, yozma, rost) yoki ro'yxat (tartib; juftlashda — chap tartibidagi o'nglar). */
export type Javob = string | string[];
/** Ko'rsatiladigan to'g'ri javob — satr, tartib ro'yxati yoki juftlar. */
export type TogriJavob = string | string[] | [string, string][];

export interface QuizQisqa {
  id: number;
  kod: string;
  nom: string;
  rejim: Rejim;
  savol: number;
  ishlagan: number;
  ortacha: number;
  yangilangan: string;
}

export interface QuizNatija { ism: string; togri: number; sekund: number; sana: string }

export interface QuizToliq extends QuizQisqa {
  savollar: Savol[];
  havola: string;
  natijalar: QuizNatija[];
  /** Ochiq jonli o'yin raqami. */
  jonli: number | null;
}

export interface MeningNatija { togri: number; jami: number; sekund: number; yaxshiroqFoiz: number | null }

export interface QuizOchiq {
  id: number;
  kod: string;
  nom: string;
  rejim: Rejim;
  savol: number;
  /** O'z tezligida umumiy soat, soniya. */
  soniya: number;
  muallif: string;
  meniki: boolean;
  savollar: OchiqSavol[];
  ishlagan: number;
  ortacha: number;
  mening: MeningNatija | null;
  jonli: number | null;
  havola: string;
}

export interface Topshiriq {
  togri: number;
  jami: number;
  sekund: number;
  birinchi: boolean;
  tahlil: { togri: boolean; javob: TogriJavob; sizniki: Javob | null }[];
  ishlagan: number;
  ortacha: number;
  mening: MeningNatija | null;
}

export type OyinHolat = "kutish" | "savol" | "natija" | "tugadi";

export type OyinTur = "oddiy" | "jamoa" | "omon";

export interface ReytingQator {
  orin: number; ism: string; ball: number; togri: number; men: boolean;
  jamoa: number | null;
  /** Omon qolishda — qaysi savolda chiqdi; −1 — tomoshabin. */
  chiqdi: number | null;
}

export interface JamoaQator { jamoa: number; odam: number; ball: number }

export interface Oyin {
  id: number;
  kod: string;
  nom: string;
  holat: OyinHolat;
  tur: OyinTur;
  joriy: number;
  jami: number;
  boshlovchi: boolean;
  qatnashyapman: boolean;
  /** O'yindagi taxallusim; hali kirmagan bo'lsam — kirish oynasiga oldindan yoziladigan profil nomi. */
  ism: string;
  odam: number;
  havola: string;
  ismlar?: string[];
  savol: OchiqSavol | null;
  /** Savol yopilishiga qolgan soniya (faqat `savol` holatida). */
  qolgan: number | null;
  javobBerdi: number;
  togriJavob: TogriJavob | null;
  /** Har variantni nechta odam tanladi (savol yopilgach). */
  taqsimot: number[] | null;
  mening: {
    ball: number; togri: number; javob: Javob | null; togrimi: boolean | null; oxirgiBall: number | null;
    /** Seriya bonusi va ketma-ket to'g'ri javoblar (savol yopilgach). */
    bonus: number; seriya: number;
    /** Joriy savol ochilgandan keyin kirgan — uni ko'rmagan. */
    kech: boolean;
    jamoa: number | null;
    chiqdi: number | null;
  } | null;
  reyting: ReytingQator[] | null;
  /** Jamoaviy jangda — o'rtacha ball bo'yicha tartiblangan jamoalar. */
  jamoalar: JamoaQator[] | null;
  /** Omon qolishda — hali o'yinda turganlar. */
  tirik: number | null;
  orin?: number | null;
}

/* ------------------------------------------------------------------ API */

export const quizlarim = () => sorov<{ royxat: QuizQisqa[] }>(`/api/v1/quizlar${profilQuery()}`);

export const quizYarat = (d: { nom: string; rejim: Rejim; savollar: Savol[] }) =>
  sorov<QuizToliq>("/api/v1/quizlar", bilanProfil(d));

export const quizOch = (id: number) => sorov<QuizToliq>(`/api/v1/quiz/${id}${profilQuery()}`);

export const quizSaqla = (id: number, d: { nom: string; rejim: Rejim; savollar: Savol[] }) =>
  sorov<QuizToliq>(`/api/v1/quiz/${id}`, bilanProfil(d));

export const quizOchir = (id: number) => sorov<{ ok: boolean }>(`/api/v1/quiz/${id}/ochir`, bilanProfil({}));

export const quizKod = (kod: string) =>
  sorov<QuizOchiq>(`/api/v1/quiz/kod/${encodeURIComponent(kod)}${profilQuery()}`);

export const quizTopshir = (kod: string, javoblar: (Javob | null)[], sekund: number) =>
  sorov<Topshiriq>(`/api/v1/quiz/kod/${encodeURIComponent(kod)}/topshir`, bilanProfil({ javoblar, sekund }));

export const jonliOch = (id: number, tur: OyinTur = "oddiy", jamoaSoni = 2) =>
  sorov<Oyin>(`/api/v1/quiz/${id}/jonli`, bilanProfil({ tur, jamoa_soni: jamoaSoni }));

export const oyinHolat = (id: number) => sorov<Oyin>(`/api/v1/quiz/oyin/${id}${profilQuery()}`);

export const oyinAmal = (id: number, amal: "keyingi" | "tugat") =>
  sorov<Oyin>(`/api/v1/quiz/oyin/${id}/${amal}`, bilanProfil({}));

export const oyinKir = (id: number, ism: string) =>
  sorov<Oyin>(`/api/v1/quiz/oyin/${id}/kir`, bilanProfil({ ism }));

/** Taxallus uzunligi — server bilan bir xil (`quiz.TAXALLUS_UZUN`). */
export const TAXALLUS_UZUN = 20;

export const oyinJavob = (id: number, i: number, javob: Javob) =>
  sorov<Oyin>(`/api/v1/quiz/oyin/${id}/javob`, bilanProfil({ i, javob }));

/* ------------------------------------------------------------------ yordamchilar */

/** Kod bilan kirish maydoni — server bilan bir xil alifbo (`sinf.KOD_HARF`). */
export const kodTozala = (s: string) => s.toUpperCase().replace(/[^A-HJKMNP-Z2-9]/g, "").slice(0, 6);

export const bosh = (): Savol => ({ tur: "variant", matn: "", variantlar: ["", ""], javob: "", vaqt: STANDART_VAQT });

/**
 * Savol saqlashga tayyormi. Server ham xuddi shuni tekshiradi
 * (`quiz.savol_tozala`) — bu yerda faqat tugmani vaqtida o'chirish uchun.
 */
export function savolTayyor(s: Savol): boolean {
  if (!s.matn.trim()) return false;
  const v = s.variantlar.map((x) => x.trim()).filter(Boolean);
  const takrorsiz = new Set(v).size === v.length;
  switch (s.tur) {
    case "yozma": return Boolean(s.javob.trim());
    case "rost": return s.javob === "1" || s.javob === "0";
    case "tartib": return v.length >= MIN_TARTIB && v.length === s.variantlar.length && takrorsiz;
    case "juftlash": {
      const j = (s.juftlar ?? []).filter(([a, b]) => a.trim() && b.trim());
      return j.length >= MIN_JUFT && j.length === (s.juftlar ?? []).length
        && new Set(j.map((x) => x[0].trim())).size === j.length && new Set(j.map((x) => x[1].trim())).size === j.length;
    }
    default: return v.length >= MIN_VARIANT && takrorsiz && v.includes(s.javob.trim());
  }
}

/** Yangi tur tanlanganda — shu turga mos bo'sh maydonlar (matn va vaqt saqlanadi). */
export function turgaOtkaz(s: Savol, tur: SavolTur): Savol {
  const asos = { matn: s.matn, vaqt: s.vaqt, ...(s.oltin ? { oltin: true } : {}) };
  if (tur === "variant") return { ...asos, tur, variantlar: s.variantlar.length >= 2 ? s.variantlar : ["", ""], javob: "" };
  if (tur === "tartib") return { ...asos, tur, variantlar: s.variantlar.length >= 3 ? s.variantlar : ["", "", ""], javob: "" };
  if (tur === "juftlash") return { ...asos, tur, variantlar: [], javob: "", juftlar: [["", ""], ["", ""]] };
  if (tur === "rost") return { ...asos, tur, variantlar: [], javob: "1" };
  return { ...asos, tur, variantlar: [], javob: "" };
}

/** Yechuvchining javobi yuborishga tayyormi (tartib va juftlash — hammasi joylashgan). */
export function javobTayyor(s: OchiqSavol, j: Javob | null): boolean {
  if (j === null) return false;
  if (s.tur === "tartib") return Array.isArray(j) && j.length === s.variantlar.length;
  if (s.tur === "juftlash") return Array.isArray(j) && j.length === (s.chap ?? []).length && j.every(Boolean);
  return typeof j === "string" && j.trim() !== "";
}

/** Bazadan savol olish mumkin bo'lgan sinflar — blok testdagi kabi 5–11. */
export const BAZA_SINFLAR = [5, 6, 7, 8, 9, 10, 11];

export const bazaBoblari = (sinf: number): Bob[] => sinfBoblari(sinf);

/**
 * Bitta bobdan `n` ta tayyor savol — generatorlardan (`lib/blok.ts`).
 *
 * Savol shu paytning O'ZIDA qotiriladi va serverga saqlanadi: generator
 * har chaqirilganda yangi son beradi, quizda esa hamma bir xil savol
 * yechishi kerak.
 *
 * Variantlar to'rtta bo'lmasligi mumkin; javob ro'yxatda bo'lmasa (juda
 * kam uchraydigan generator) — savol tashlanadi, server uni baribir rad etardi.
 */
export function bazadanYasa(sinf: number, bob: Bob, n: number, vaqt: number): Savol[] {
  return blokdan(blokYasa(sinf, "bob", { tur: "bob", kursId: bob.kursId, ui: bob.ui }, { savol: n, daqiqa: n }), vaqt);
}

/**
 * TAYYOR TEST — butunlay, bir bosishda: DTM varianti, sinf testi yoki
 * test to'plami. Ular ilovada urug' bilan yasaladi (`lib/imtihon.ts`,
 * `lib/toplam.ts`), ya'ni quizga aynan o'sha savollar tushadi.
 *
 * Modullar KECH yuklanadi: DTM varianti butun 7–11-sinf generatorlarini
 * tortadi va muharrirni ochgan har kimga ular kerak emas.
 */
/**
 * DTM variantlari soni — `imtihon.VARIANTLAR` bilan bir xil (`scripts/quiz.ts` tekshiradi).
 * Bu yerda alohida: `imtihon.ts` ni muharrir ochilishi bilan yuklamaslik uchun.
 */
export const DTM_VARIANT = 30;

export type TayyorManba =
  | { tur: "dtm"; n: number }
  | { tur: "sinf"; sinf: number }
  | { tur: "toplam"; sinf: number; urug: number; savol: number; daqiqa: number };

export async function tayyorTest(m: TayyorManba, vaqt: number): Promise<Savol[]> {
  if (m.tur === "dtm") {
    const { variantYasa } = await import("./imtihon");
    return blokdan(variantYasa(m.n), vaqt).slice(0, MAX_SAVOL);
  }
  if (m.tur === "toplam") {
    const { toplamYasa } = await import("./toplam");
    return blokdan(toplamYasa(m), vaqt).slice(0, MAX_SAVOL);
  }
  return blokdan(blokYasa(m.sinf, "toliq", { tur: "hammasi" }), vaqt).slice(0, MAX_SAVOL);
}

function blokdan(blok: ReturnType<typeof blokYasa>, vaqt: number): Savol[] {
  if (!blok) return [];
  const r: Savol[] = [];
  for (const { a } of blok.savollar) {
    const javob = String(a.answer);
    const variantlar = [...new Set(a.choices.map(String))].slice(0, MAX_VARIANT);
    if (!variantlar.includes(javob) || variantlar.length < MIN_VARIANT) continue;
    // `rasmiy` turining chizmasi — SVG matni; server uni qabul qilmaydi
    // (`quiz.TAQIQ_TUR`). Matni yetarli bo'lsa savol chizmasiz qoladi.
    const { answer: _a, choices: _c, yechim: _y, joy: _j, ...chizma } = a;
    r.push({
      tur: "variant",
      matn: (a.prompt || ("text" in a ? String(a.text ?? "") : "")).slice(0, MAX_MATN) || "?",
      variantlar,
      javob,
      vaqt,
      ...(a.type === "rasmiy" ? {} : { a: chizma as Chizma }),
    });
  }
  return r;
}

/**
 * Ro'yxat qatoridagi bir qatorlik sarlavha.
 *
 * Bazadan olingan tenglama savolida shart ("Funksiya qiymatini toping")
 * o'zi hech narsa demaydi — so'ralgani formulada (`a.text`). Busiz
 * ro'yxatda o'nta bir xil qator turib qolardi.
 */
export function savolQisqa(s: Pick<Savol, "matn" | "a">): string {
  const f = s.a && "text" in s.a ? String((s.a as { text?: unknown }).text ?? "").trim() : "";
  return f ? `${s.matn} ${f}` : s.matn;
}

/** "1:05" — soat ko'rinishi. */
export function soat(soniya: number): string {
  const s = Math.max(0, Math.ceil(soniya));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ AI */

/** AI quiz yasash holati (`core/quiz_ai.py`): faqat Premium, kunlik chegara bilan. */
export interface AiHolat { yoqilgan: boolean; premium: boolean; qolgan: number; kunlik: number }
export interface AiIsh { id: number; holat: "kutilmoqda" | "tayyor" | "xato"; savollar: Savol[]; xato: string }

export const aiHolat = () => sorov<AiHolat>(`/api/v1/quiz/ai${profilQuery()}`);

/**
 * Yangi AI ishi: mavzudan (`matn`) yoki fayldan (rasm/PDF). Fayl bo'lsa
 * so'rov `FormData` bo'lib ketadi (`sorov` uni o'zi taniydi).
 */
export function aiBoshla(matn: string, soni: number, til: string, fayl?: File): Promise<AiIsh> {
  if (!fayl) return sorov<AiIsh>("/api/v1/quiz/ai", bilanProfil({ matn, soni, til }));
  const f = new FormData();
  f.append("fayl", fayl);
  f.append("matn", matn);
  f.append("soni", String(soni));
  f.append("til", til);
  const p = bilanProfil({}) as { profileId?: string | number };
  if (p.profileId !== undefined) f.append("profileId", String(p.profileId));
  return sorov<AiIsh>("/api/v1/quiz/ai", f);
}

export const aiIsh = (id: number) => sorov<AiIsh>(`/api/v1/quiz/ai/${id}${profilQuery()}`);
