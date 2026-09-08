/**
 * Masalaning qiyinligi — nuqtalar va nom.
 *
 * ─────────────── QIYINLIK O'LCHANADI, YOZILMAYDI ───────────────
 *
 * Muallif "bu qiyin masala" deb belgilamaydi. Qiyinlik — BIRINCHI
 * urinishda to'g'ri yechganlar foizi, ya'ni uni yechuvchilar o'zlari
 * o'lchaydi. Muallif belgilaydigan bo'lsa, har kim o'z masalasini
 * "olimpiada darajasi" deb qo'yardi va bu o'lchov birinchi kunda
 * ma'nosini yo'qotardi.
 *
 * Son qancha KATTA bo'lsa, masala shuncha OSON — shuning uchun
 * quyidagi ikkala funksiya ham teskari o'qiladi.
 *
 * Ikki ko'rinish ikki joy uchun: ro'yxat kartasida joy tor va u
 * yerda beshta nuqta turadi, masalaning o'z ekranida esa joy bor va
 * so'z bilan yozilgani aniqroq ("Qiyin" — "4 ta nuqta" emas).
 */
import { t } from "./matn";

/**
 * Qiyinlik nuqtalari (1–5). Ko'p nuqta — qiyin masala.
 *
 * Hech kim urinmagan bo'lsa foiz ma'nosiz (server 100 qaytaradi) —
 * chaqiruvchi o'sha holatni oldindan ajratadi.
 */
export function nuqtaSoni(qiyinlik: number): number {
  if (qiyinlik >= 80) return 1;
  if (qiyinlik >= 60) return 2;
  if (qiyinlik >= 40) return 3;
  if (qiyinlik >= 20) return 4;
  return 5;
}

/**
 * Qiyinlikning nomi va rangi.
 *
 * To'rtta daraja, beshta emas: "o'rtacha" bilan "o'rta" o'rtasidagi
 * farqni hech kim ajratmaydi va bunday shkala faqat aniqlik
 * TAASSUROTINI berardi.
 */
export function qiyinlikNomi(qiyinlik: number): { nom: string; rang: string } {
  if (qiyinlik >= 75) return { nom: t("qiyinOson"), rang: "text-brand-green" };
  if (qiyinlik >= 45) return { nom: t("qiyinOrta"), rang: "text-brand-blue" };
  if (qiyinlik >= 20) return { nom: t("qiyinQiyin"), rang: "text-brand-orange" };
  return { nom: t("qiyinJuda"), rang: "text-brand-red" };
}
