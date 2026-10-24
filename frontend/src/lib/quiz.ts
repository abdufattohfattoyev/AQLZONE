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
export type SavolTur = "variant" | "yozma";

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
  a?: Chizma;
}

/** Yechuvchiga keladigan savol — JAVOBSIZ. */
export type OchiqSavol = Omit<Savol, "javob">;

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
  tahlil: { togri: boolean; javob: string; sizniki: string | null }[];
  ishlagan: number;
  ortacha: number;
  mening: MeningNatija | null;
}

export type OyinHolat = "kutish" | "savol" | "natija" | "tugadi";

export interface ReytingQator { orin: number; ism: string; ball: number; togri: number; men: boolean }

export interface Oyin {
  id: number;
  kod: string;
  nom: string;
  holat: OyinHolat;
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
  togriJavob: string | null;
  /** Har variantni nechta odam tanladi (savol yopilgach). */
  taqsimot: number[] | null;
  mening: {
    ball: number; togri: number; javob: string | null; togrimi: boolean | null; oxirgiBall: number | null;
    /** Joriy savol ochilgandan keyin kirgan — uni ko'rmagan. */
    kech: boolean;
  } | null;
  reyting: ReytingQator[] | null;
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

export const quizTopshir = (kod: string, javoblar: (string | null)[], sekund: number) =>
  sorov<Topshiriq>(`/api/v1/quiz/kod/${encodeURIComponent(kod)}/topshir`, bilanProfil({ javoblar, sekund }));

export const jonliOch = (id: number) => sorov<Oyin>(`/api/v1/quiz/${id}/jonli`, bilanProfil({}));

export const oyinHolat = (id: number) => sorov<Oyin>(`/api/v1/quiz/oyin/${id}${profilQuery()}`);

export const oyinAmal = (id: number, amal: "keyingi" | "tugat") =>
  sorov<Oyin>(`/api/v1/quiz/oyin/${id}/${amal}`, bilanProfil({}));

export const oyinKir = (id: number, ism: string) =>
  sorov<Oyin>(`/api/v1/quiz/oyin/${id}/kir`, bilanProfil({ ism }));

/** Taxallus uzunligi — server bilan bir xil (`quiz.TAXALLUS_UZUN`). */
export const TAXALLUS_UZUN = 20;

export const oyinJavob = (id: number, i: number, javob: string) =>
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
  if (!s.matn.trim() || !s.javob.trim()) return false;
  if (s.tur === "yozma") return true;
  const v = s.variantlar.map((x) => x.trim()).filter(Boolean);
  return v.length >= MIN_VARIANT && new Set(v).size === v.length && v.includes(s.javob.trim());
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
  const blok = blokYasa(sinf, "bob", { tur: "bob", kursId: bob.kursId, ui: bob.ui }, { savol: n, daqiqa: n });
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
