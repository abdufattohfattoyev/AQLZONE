/**
 * Duelda o'z darajasini TAKLIF qilish va eslab qolish.
 *
 * `duel.ts` dan ALOHIDA fayl: u sof va brauzersiz sinaladi
 * (`scripts/duel.ts`), bu yerdagi taklif esa o'yin rekordlariga
 * (`rekord.ts` → `api.ts` → `localStorage`) bog'liq.
 */
import { oyinById } from "./index";
import { ochiqmi } from "./rekord";
import type { Daraja, OyinId } from "./tur";

const DARAJA_KALIT = "az-duel-daraja";

/**
 * Duelda qaysi darajani taklif qilish.
 *
 * Ilgari duelda ikkalasiga bir xil 2-daraja berilardi va bola dadasi
 * bilan o'ynab doim yutqazardi. Endi har kim O'Z darajasida yechadi
 * (Prodigy usuli) — daraja esa shu yerda taklif qilinadi:
 *
 *   1. Oxirgi marta duelda tanlangani — odam bir marta tanlaydi va u
 *      keyingi duellarda ham qoladi.
 *   2. Bo'lmasa — shu o'yinda OCHILGAN eng yuqori daraja. O'yinlar
 *      bo'limida ochilgan daraja bolaning haqiqiy kuchini ko'rsatadi,
 *      yoshini emas.
 *
 * Yosh ATAYLAB so'ralmaydi: `tur.ts` dagi "NEGA DARAJA, YOSH EMAS" ga qarang.
 */
export function duelDarajaTaklif(oyinId: string): Daraja {
  try {
    const n = Number(localStorage.getItem(DARAJA_KALIT));
    if (n === 1 || n === 2 || n === 3) return n;
  } catch { /* xotira yopiq — pastdagi hisob yetadi */ }
  const id = oyinId as OyinId;
  if (oyinById(id)) {
    for (const d of [3, 2] as const) if (ochiqmi(id, d)) return d;
  }
  return 1;
}

/** Tanlangan darajani eslab qoladi. */
export function duelDarajaSaqla(d: Daraja): void {
  try { localStorage.setItem(DARAJA_KALIT, String(d)); } catch { /* jim */ }
}
