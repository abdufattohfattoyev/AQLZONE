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
export interface Buyum {
  id: string;
  nom: string;
  /** Aql (brend belgisi) ustiga chiqadigan belgi. */
  belgi: string;
  narx: number;
}

export const BUYUMLAR: Buyum[] = [
  { id: "shlyapa",   nom: "Shlyapa",       belgi: "🎩", narx: 30 },
  { id: "kozoynak",  nom: "Ko'zoynak",     belgi: "🕶️", narx: 40 },
  { id: "toj",       nom: "Toj",           belgi: "👑", narx: 120 },
  { id: "sharf",     nom: "Sharf",         belgi: "🧣", narx: 60 },
  { id: "gul",       nom: "Gul",           belgi: "🌸", narx: 25 },
  { id: "yulduzcha", nom: "Yulduzcha",     belgi: "✨", narx: 80 },
  { id: "kitob",     nom: "Kitob",         belgi: "📚", narx: 70 },
  { id: "raketa",    nom: "Raketa",        belgi: "🚀", narx: 150 },
];

export const buyumTop = (id: string): Buyum | undefined =>
  BUYUMLAR.find((b) => b.id === id);
