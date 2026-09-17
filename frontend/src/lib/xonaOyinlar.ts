/**
 * Jamoaviy o'yinlar ro'yxati — kartada, ochish ekranida va kutishda.
 *
 * Alohida fayl: O'yinlar ro'yxati (`screens/Oyinlar.tsx`) faqat shu
 * ma'lumotni oladi va butun xona ekranini (uchta o'yin komponenti bilan)
 * birinchi ochilishda yuklab olmaydi.
 *
 * `min` / `max` serverdagi `core/oyin_*.py` bilan bir xil.
 */
import type { XonaOyin } from "./api";
import type { Kalit } from "./matn";

export const XONA_OYINLAR: Record<XonaOyin, {
  emoji: string; nom: Kalit; izoh: Kalit; qoida: Kalit; min: number; max: number;
}> = {
  kartalar: { emoji: "🃏", nom: "oyinKartalar", izoh: "oyinKartalarIzoh", qoida: "oyinKartalarQoida", min: 2, max: 2 },
  royale: { emoji: "👑", nom: "oyinRoyale", izoh: "oyinRoyaleIzoh", qoida: "oyinRoyaleQoida", min: 2, max: 30 },
  kodlar: { emoji: "🔢", nom: "oyinKodlar", izoh: "oyinKodlarIzoh", qoida: "oyinKodlarQoida", min: 4, max: 8 },
  seyf: { emoji: "🔐", nom: "oyinSeyf", izoh: "oyinSeyfIzoh", qoida: "oyinSeyfQoida", min: 4, max: 8 },
};
