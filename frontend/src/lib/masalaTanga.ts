/**
 * MASALA UCHUN TANGA — mukofot va yechim narxi.
 *
 * ─────────────── NEGA BIRINCHI URINISH QIMMAT ───────────────
 *
 * Mukofot urinishga qarab kamayadi: 10 → 5 → 3. Bu bo'limning
 * butun o'lchovi bilan bir xil gapni aytadi — "eng qiyin" ro'yxati
 * ham aynan BIRINCHI urinishda yechganlar foizidan quriladi.
 *
 * Kamayish yakunda to'xtaydi (uchinchidan keyin ham 3): nolga
 * tushirilsa, bir marta xato qilgan bola masalani tashlab ketardi —
 * holbuki bizga aynan uning ikkinchi urinishi kerak.
 *
 * ─────────────── YECHIM NEGA MUKOFOTDAN QIMMAT ───────────────
 *
 * Yechimni ochish 15 tanga, eng katta mukofot esa 10. Ya'ni
 * "sotib olib yechish" hech qachon foydali bo'lmaydi va tanga
 * yig'ishning yagona yo'li — o'zi yechish. Aks holda bola
 * masalalarni ketma-ket ochib, tangani "aylantirib" olardi.
 *
 * ─────────────── UCHINCHI URINISHDAN KEYIN — BEPUL ───────────────
 *
 * Tangasi yo'q bola ham yordamsiz qolmaydi: uch marta urinib
 * ko'rgandan keyin yechim o'zi ochiladi (`MasalaUrinish.YECHIM_BEPUL`
 * — qoida SERVERDA, bu yerda faqat ekranga chiqarish uchun).
 * Busiz bo'lim "tangasi borlar uchun" bo'lib qolardi.
 */

/** Nechanchi urinishda yechilsa — nechta tanga. */
const MUKOFOT = [10, 5, 3] as const;

/** Yechimni ochish narxi. */
export const YECHIM_NARX = 15;

/** Nechta urinishdan keyin yechim bepul ochiladi. Server bilan bir xil. */
export const YECHIM_BEPUL = 3;

/**
 * Shu urinishda yechgan odam nechta tanga oladi.
 *
 * `urinish` — nechanchi urinish ekani (1 dan boshlab).
 */
export function mukofot(urinish: number): number {
  if (urinish < 1) return 0;
  return MUKOFOT[Math.min(urinish, MUKOFOT.length) - 1];
}

/** Yechim bepul ochiladimi — shuncha urinishdan keyin. */
export const bepulOchiladi = (urinish: number): boolean => urinish >= YECHIM_BEPUL;
