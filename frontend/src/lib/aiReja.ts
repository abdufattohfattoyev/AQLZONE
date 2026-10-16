/**
 * AI reja → bosh sahifadagi kunlik ish (`backend/core/ai_reja.py`).
 *
 * Reja SERVERDA (reja suhbatining kontekstida): telefon almashsa ham
 * qaysi kun ekani va nima bajarilgani yo'qolmaydi. Har ish `kalit`
 * ("kun-ish") bilan: avval AI dars (`rejaDars`), keyin o'sha DTM
 * mavzusidan `VAZIFA_SAVOL` ta savol (`screens/RejaVazifa.tsx`).
 */
import { sorov } from "./api";
import type { AiSuhbat } from "./ai";
import { DTM_MAVZULAR } from "./dtmMavzu";

/** Vazifadagi savollar — serverdagi `VAZIFA_SAVOL` bilan bir xil. */
export const VAZIFA_SAVOL = 10;
/** Shu ulushdan kam bo'lsa vazifa ertaga yana beriladi (`OTISH`). */
export const OTISH = 0.6;

export interface RejaIsh {
  kalit: string;
  mavzu: string;
  daqiqa: number;
  /** DTM mavzusi (`lib/dtmMavzu.ts`); bo'sh — aralash takrorlash. */
  slug: string;
  /** Boshlangan AI dars suhbati. */
  dars: number | null;
  /** Eng yaxshi vazifa natijasi `[to'g'ri, jami]`. */
  vazifa: [number, number] | null;
  /** Oldingi kundan o'tmay qolgan ish. */
  otgan: boolean;
}

export interface RejaBugun {
  suhbat: number;
  kun: number;
  jami: number;
  tugadi: boolean;
  nom: string;
  ishlar: RejaIsh[];
}

export const otdimi = (v: RejaIsh["vazifa"]): boolean => Boolean(v && v[1] > 0 && v[0] / v[1] >= OTISH);

export const rejaOl = (): Promise<RejaBugun | null> =>
  sorov<{ reja: RejaBugun | null }>("/api/v1/ai/reja").then((r) => r.reja);

export const rejaDars = (kalit: string): Promise<AiSuhbat> => sorov<AiSuhbat>("/api/v1/ai/reja/dars", { kalit });

export const rejaVazifa = (kalit: string, togri: number, jami: number): Promise<RejaBugun | null> =>
  sorov<{ reja: RejaBugun | null }>("/api/v1/ai/reja/vazifa", { kalit, togri, jami }).then((r) => r.reja);

/** Vazifa savollari qaysi boblardan: slug bo'lsa — o'sha mavzu, bo'lmasa — hamma DTM boblari. */
export function vazifaBoblari(slug: string): { kursId: string; ui: number }[] {
  const m = DTM_MAVZULAR.filter((d) => !slug || d.slug === slug);
  return m.flatMap((d) => d.boblar.map(([kursId, ui]) => ({ kursId, ui })));
}
