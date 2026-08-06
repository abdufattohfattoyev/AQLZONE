/**
 * Chizmasi bor kartalarning ro'yxati.
 *
 * ─────────── NEGA ALOHIDA FAYLDA ───────────
 *
 * Ikki sabab, va ikkalasi ham amaliy:
 *
 * 1. TIPLAR TEKSHIRUVI. `index.tsx` dagi jadval `Record<ChizmaId, …>`
 *    bo'lib e'lon qilingan. Ya'ni bu yerga id qo'shib, rasmini
 *    yozishni unutsangiz — loyiha YIG'ILMAYDI. Aks holda karta
 *    jimgina emoji ko'rinishiga tushib qolardi va buni hech kim
 *    sezmasdi.
 *
 * 2. SINOV SKRIPTI. `scripts/kichkintoy.ts` Node ostida ishlaydi va
 *    JSX li faylni o'qiy olmaydi. Bu fayl esa oddiy TypeScript —
 *    skript uni to'g'ridan-to'g'ri import qiladi va har bir kartaning
 *    rasmi borligini tekshiradi.
 *
 * Ranglar va raqamlar bu ro'yxatda YO'Q va bo'lishi ham kerak emas:
 * ular rasm bilan emas, doira va belgi bilan chiziladi.
 */
export const CHIZMA_IDLAR = [
  // mashinalar
  "mashina", "avtobus", "taksi", "yuk", "otochir", "tezyordam",
  "politsiya", "traktor", "velosiped", "poyezd", "samolyot", "kema",
  // hayvonlar
  "it", "mushuk", "sigir", "qoy", "ot", "tovuq", "xoroz", "ordak",
  "quyon", "baqa", "ayiq", "arslon", "fil", "asalari",
] as const;

export type ChizmaId = typeof CHIZMA_IDLAR[number];

export const chizmaBormi = (id: string): id is ChizmaId =>
  (CHIZMA_IDLAR as readonly string[]).includes(id);
