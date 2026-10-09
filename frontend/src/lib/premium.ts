/**
 * Imtihon Premium — DTM, milliy sertifikat va prezident maktabi variantlari.
 *
 * Birinchi `bepul` tasi (3) hammaga ochiq, qolgani Premium. Darslar,
 * o'yinlar, duel — hammasi bepul va bu fayl ularga tegmaydi.
 *
 * HUQUQ SERVERDA (`backend/core/premium.py`). Bu yerda u faqat XOTIRADA
 * turadi — `localStorage` ga yozilmaydi: bitta `setItem` bilan "premium"
 * bo'lib olish mumkin bo'lardi. Server javob bermaguncha holat noma'lum
 * (`null`) va yopiq variant yopiqligicha qoladi; ochiq uchtasi esa
 * internetsiz ham ishlayveradi.
 *
 * Savollar mijozda urug'dan yasaladi, ya'ni bu qulf asosiy to'siq. Server
 * esa natijani tekshiradi: premiumsiz yopiq variant reytingga ham, tarixga
 * ham yozilmaydi (`core/imtihon.py`).
 */
import { useEffect, useState } from "react";
import { botNomi, sorov } from "./api";
import { havolaniOch } from "./qobiq";

export interface PremiumHolat {
  faol: boolean;
  /** ISO sana — faqat `faol` bo'lsa. */
  gacha: string | null;
  sinov_mumkin: boolean;
  sinov_kun: number;
  bepul: number;
  narxlar: { "1oy": number; "3oy": number };
  /** Bo'sh — to'lov hozircha yopiq (serverda karta sozlanmagan). */
  karta: string;
  karta_egasi: string;
}

export type Tarif = "1oy" | "3oy";

/** Server javob bermaguncha ham qulf to'g'ri chizilsin — standart qiymat. */
export const BEPUL = 3;

let kesh: PremiumHolat | null = null;
let jarayon: Promise<PremiumHolat | null> | null = null;
const tinglovchilar = new Set<(h: PremiumHolat | null) => void>();

function yangila(h: PremiumHolat | null): void {
  kesh = h;
  for (const f of tinglovchilar) f(h);
}

/**
 * Holatni serverdan oladi. Bir vaqtda bir nechta ekran so'rasa ham
 * bitta so'rov ketadi; `yangidan` — to'lov/sinovdan keyin keshni chetlab.
 */
export function premiumOl(yangidan = false): Promise<PremiumHolat | null> {
  if (kesh && !yangidan) return Promise.resolve(kesh);
  if (jarayon && !yangidan) return jarayon;
  jarayon = sorov<PremiumHolat>("/api/v1/premium")
    .then((h) => { yangila(h); return h; })
    .catch(() => kesh)
    .finally(() => { jarayon = null; });
  return jarayon;
}

/** Ekran uchun: holat (yoki `null` — hali kelmagan / internet yo'q). */
export function usePremium(): PremiumHolat | null {
  const [h, setH] = useState<PremiumHolat | null>(kesh);
  useEffect(() => {
    tinglovchilar.add(setH);
    premiumOl().catch(() => {});
    return () => { tinglovchilar.delete(setH); };
  }, []);
  return h;
}

/** Shu variant ochiqmi. Holat noma'lum bo'lsa — faqat bepullari. */
export function ochiqmi(h: PremiumHolat | null, n: number): boolean {
  return n <= (h?.bepul ?? BEPUL) || Boolean(h?.faol);
}

/** 3 kunlik sinov. Muvaffaqiyatsiz bo'lsa (allaqachon olingan) — `null`. */
export async function sinovOl(): Promise<PremiumHolat | null> {
  try {
    const h = await sorov<PremiumHolat>("/api/v1/premium/sinov", {});
    yangila(h);
    return h;
  } catch {
    await premiumOl(true);
    return null;
  }
}

/**
 * "To'ladim — chekni yuborish": botni `?start=premium_<tarif>` bilan
 * ochadi. Bot tarifni biladi, karta raqamini qayta yozadi va chek rasmini
 * kutadi — rasm saytga emas, botga yuboriladi: admin uni o'sha yerda,
 * "Tasdiqlash" tugmasi bilan birga ko'radi.
 */
export async function chekniYubor(tarif: Tarif): Promise<boolean> {
  const bot = await botNomi();
  if (!bot) return false;
  havolaniOch(`https://t.me/${encodeURIComponent(bot)}?start=premium_${tarif}`);
  return true;
}

/** 49000 → "49 000". */
export const som = (n: number): string =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** "12.11.2026" — tugash sanasi. */
export function sanaMatn(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const k = (x: number) => String(x).padStart(2, "0");
  return `${k(d.getDate())}.${k(d.getMonth() + 1)}.${d.getFullYear()}`;
}
