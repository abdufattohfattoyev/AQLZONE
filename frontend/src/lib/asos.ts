/**
 * ASOS MAVZULAR — har bobni tushunish uchun avval bilish kerak bo'lgan boblar.
 *
 * Nega kerak: 10-sinfda kvadrat tengsizlikda qoqilgan odamning muammosi
 * ko'pincha 10-sinfda emas — u 8-sinfdagi kvadrat tenglamani yecha
 * olmaydi. Unga yana tengsizlik bersak, yana yiqiladi. Mavzu sahifasi
 * shu ro'yxat bo'yicha "avval shuni mustahkamlang" deydi (Uchi.ru,
 * Skysmart ham shunday: bo'shliq pastki sinfdan qidiriladi).
 *
 * Kalit va qiymatlar — "kursId|bob indeksi" (`lib/ozlashtirish.ts`
 * dagi `bobKalit`). Faqat to'g'ridan-to'g'ri asoslar yoziladi —
 * zanjir o'zi uzayadi: asos mavzuning ham o'z sahifasida asosi bor.
 */
export const ASOS: Record<string, string[]> = {
  "algebra7|1": ["algebra7|0"],
  "algebra7|2": ["algebra7|0"],
  "algebra7|3": ["algebra7|2"],
  "algebra7|4": ["algebra7|3"],

  "geometriya7|1": ["geometriya7|0"],
  "geometriya7|2": ["geometriya7|1"],
  "geometriya7|3": ["geometriya7|1"],
  "geometriya7|4": ["geometriya7|2", "geometriya7|3"],
  "geometriya7|5": ["geometriya7|4"],

  "algebra8|0": ["algebra7|4", "algebra7|2"],
  "algebra8|1": ["algebra7|1"],
  "algebra8|2": ["algebra7|3", "algebra8|0"],
  "algebra8|3": ["algebra7|5"],

  "geometriya8|0": ["geometriya7|3", "geometriya7|4"],
  "geometriya8|1": ["geometriya7|4", "algebra8|0"],
  "geometriya8|2": ["geometriya8|1"],
  "geometriya8|3": ["geometriya8|0", "geometriya8|1"],
  "geometriya8|4": ["geometriya7|0", "geometriya7|4"],

  "algebra9|0": ["algebra8|2", "algebra8|1"],
  "algebra9|1": ["algebra7|1", "algebra8|2"],
  "algebra9|2": ["geometriya8|1"],
  "algebra9|3": ["algebra7|1"],
  "algebra9|4": ["algebra8|3"],

  "geometriya9|0": ["geometriya8|0", "geometriya7|2"],
  "geometriya9|1": ["geometriya8|1", "algebra9|2"],
  "geometriya9|2": ["geometriya8|4"],
  "geometriya9|3": ["geometriya9|0"],

  "algebra10|0": ["algebra9|0", "algebra9|2", "algebra9|3"],
  "algebra10|1": ["algebra9|0"],
  "algebra10|2": ["algebra8|0", "algebra8|2", "algebra9|0"],
  "algebra10|3": ["algebra8|0", "algebra7|2"],
  "algebra10|4": ["algebra9|2"],
  "algebra10|5": ["algebra9|4", "algebra8|3"],

  "geometriya10|0": ["geometriya9|1", "geometriya8|3"],
  "geometriya10|1": ["geometriya10|0"],
  "geometriya10|2": ["geometriya10|1", "geometriya7|3"],
  "geometriya10|3": ["geometriya10|2", "geometriya8|2"],
  "geometriya10|4": ["geometriya10|3"],

  "matematika11|0": ["algebra10|1"],
  "matematika11|1": ["matematika11|0", "algebra9|0"],
  "matematika11|2": ["matematika11|0"],
  "matematika11|3": ["geometriya10|3", "geometriya8|3"],
  "matematika11|4": ["matematika11|3", "geometriya9|1"],
  "matematika11|5": ["algebra10|5"],
};

/** Bobning asoslari: `{ kursId, ui }` ro'yxati. */
export function asoslar(kursId: string, ui: number): { kursId: string; ui: number }[] {
  return (ASOS[`${kursId}|${ui}`] ?? []).map((k) => {
    const [kursId, ui] = k.split("|");
    return { kursId, ui: Number(ui) };
  });
}
