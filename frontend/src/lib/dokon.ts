/**
 * Tangalar do'koni.
 *
 * Shu paytgacha tangalar yig'ilardi-yu, hech narsaga sarflanmasdi —
 * ya'ni mukofot mukofot emas edi. Do'kon shu bo'shliqni to'ldiradi.
 *
 * Narxlar ataylab shunday tanlangan: eng arzoni bir-ikki darsdan keyin
 * olinadi (bola do'konning ishlashiga darrov ishonch hosil qilsin), eng
 * qimmati esa uzoq maqsad bo'lib turadi. Har to'g'ri javob 2 tanga
 * beradi, ya'ni bitta dars ≈ 12 tanga.
 */
import { t } from "./matn";
import type { Kalit } from "./matn";

export interface Buyum {
  id: string;
  /** Lug'at kaliti — nom `nomi()` orqali tilga qarab olinadi. */
  kalit: Kalit;
  nom: string;
  /** Aql (brend belgisi) ustiga chiqadigan belgi. */
  belgi: string;
  narx: number;
}

export const BUYUMLAR: Buyum[] = [
  { id: "shlyapa",   kalit: "bShlyapa",   nom: "Shlyapa",   belgi: "🎩", narx: 30 },
  { id: "kozoynak",  kalit: "bKozoynak",  nom: "Ko'zoynak", belgi: "🕶️", narx: 40 },
  { id: "toj",       kalit: "bToj",       nom: "Toj",       belgi: "👑", narx: 120 },
  { id: "sharf",     kalit: "bSharf",     nom: "Sharf",     belgi: "🧣", narx: 60 },
  { id: "gul",       kalit: "bGul",       nom: "Gul",       belgi: "🌸", narx: 25 },
  { id: "yulduzcha", kalit: "bYulduzcha", nom: "Yulduzcha", belgi: "✨", narx: 80 },
  { id: "kitob",     kalit: "bKitob",     nom: "Kitob",     belgi: "📚", narx: 70 },
  { id: "raketa",    kalit: "bRaketa",    nom: "Raketa",    belgi: "🚀", narx: 150 },
];

/** Buyum nomi — joriy tilda. */
export const buyumNomi = (b: Buyum): string => t(b.kalit);

export const buyumTop = (id: string): Buyum | undefined =>
  BUYUMLAR.find((b) => b.id === id);
