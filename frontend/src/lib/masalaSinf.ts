/**
 * Masala qaysi sinfga tegishli — nomi va ro'yxati.
 *
 * Kod kurslarnikiga MOS (`Course.grade`): 0–11 va 107–110. Alohida
 * ro'yxat yasalmadi — ikkita ro'yxat bir kun kelib albatta
 * bir-biridan qolib ketadi va o'shanda masala hech qaysi filtrga
 * tushmay, ro'yxatdan yo'qolardi.
 *
 * Shu sabab ro'yxat KURSLARDAN yasaladi va yangi kurs qo'shilganda
 * u bu yerda o'zi paydo bo'ladi.
 */
import { COURSES } from "./curriculum";
import { sinfMatn } from "./tarjima/kurs";

/** Filtr uchun sinflar — kurslar tartibida. */
export const SINFLAR: { kod: number; nom: string }[] = COURSES.map((c) => ({
  kod: c.grade,
  nom: sinfMatn(c.grade),
}));

/**
 * Sinf kodining nomi.
 *
 * Noma'lum kod bo'lsa (masalan kurs olib tashlangan) kodning o'zi
 * qaytadi — masala ro'yxatdan yo'qolib qolgandan ko'ra, "107" deb
 * tursa ham ko'ringani yaxshi.
 */
export function sinfNomi(kod: number): string {
  return SINFLAR.find((s) => s.kod === kod)?.nom ?? String(kod);
}
