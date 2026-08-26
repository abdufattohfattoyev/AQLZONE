/**
 * Like/dislike hisobi — ekrandan ALOHIDA.
 *
 * ─────────────── NEGA ALOHIDA FAYL ───────────────
 *
 * Tugma bosilganda ekran DARHOL o'zgaradi, server javobini
 * kutmasdan. Busiz tugma bosilib, yarim soniya hech narsa bo'lmasa,
 * odam uni ikkinchi marta bosadi va o'z ovozini o'zi qaytarib
 * olardi.
 *
 * "Darhol o'zgarish" degani sonlarni QO'LDA hisoblash degani, va
 * bu yerda uch holat bor: qo'yish, olib tashlash va ALMASHTIRISH.
 * Uchinchisi eng nozigi — ikkala son bir vaqtda o'zgaradi. Xatosi
 * esa JIM o'tadi: ekranda 5 turadi, bazada 4, va buni faqat
 * sahifani yangilagan odam sezadi.
 *
 * Shuning uchun mantiq shu yerda — React'siz sinaladi
 * (`scripts/masala.ts`).
 */
import type { Ovoz } from "./masala";

export interface Sanoq {
  like: number;
  dislike: number;
}

/**
 * Tugma bosilgandan keyingi ovoz.
 *
 * O'SHA tugmani qayta bosish ovozni QAYTARIB OLADI. Busiz bexosdan
 * bosilgan dislike'ni orqaga qaytarib bo'lmasdi — masala ostida
 * turgan sonni hisobga olsak, bu muallif uchun haqsizlik bo'lardi.
 *
 * Server AYNAN shu qoidaga bo'ysunadi (`core/masala.py` dagi
 * `ovoz_ber`), ya'ni ekran va baza bir xil natijaga keladi.
 */
export function kelasiOvoz(joriy: Ovoz, bosilgan: "like" | "dislike"): Ovoz {
  return joriy === bosilgan ? "" : bosilgan;
}

/**
 * Ovoz o'zgarganda sonlar qanday bo'ladi.
 *
 * Manfiyga tushmaydi: server bilan ekran bir lahza mos kelmasligi
 * mumkin (masalan boshqa qurilmadan ovoz berilgan) va o'shanda
 * ekranda "−1" turib qolardi.
 */
export function sanoqniHisobla(sonlar: Sanoq, eski: Ovoz, yangi: Ovoz): Sanoq {
  const ozgarish = (tur: "like" | "dislike") =>
    (yangi === tur ? 1 : 0) - (eski === tur ? 1 : 0);
  return {
    like: Math.max(0, sonlar.like + ozgarish("like")),
    dislike: Math.max(0, sonlar.dislike + ozgarish("dislike")),
  };
}
