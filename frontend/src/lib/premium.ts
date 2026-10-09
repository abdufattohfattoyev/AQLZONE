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
import { botNomi, sorov, xatoKodi } from "./api";
import { til } from "./til";
import { havolaniOch } from "./qobiq";

export type Tarif = "7kun" | "1oy";
export const TARIFLAR: Tarif[] = ["7kun", "1oy"];

export interface PremiumHolat {
  faol: boolean;
  /** ISO sana — faqat `faol` bo'lsa. */
  gacha: string | null;
  /** Server hisoblagan qolgan vaqt — telefon soati noto'g'ri bo'lsa ham to'g'ri. */
  qolgan_sekund: number;
  /** Faol, lekin hali to'lov yo'q — 3 kunlik sinov. */
  sinovda: boolean;
  sinov_mumkin: boolean;
  sinov_kun: number;
  bepul: number;
  narxlar: Record<Tarif, number>;
  kunlar: Record<Tarif, number>;
  /** Bo'sh — to'lov hozircha yopiq (serverda karta sozlanmagan). */
  karta: string;
  karta_egasi: string;
  /** Admin bilan aloqa havolasi (`t.me/...`). Bo'sh bo'lishi mumkin. */
  admin: string;
  /** Yuborilgan, hali tekshirilmagan chek. */
  kutilmoqda: { tarif: Tarif; vaqt: string } | null;
  /** Oxirgi chek rad etilgan va hozir premium yo'q. */
  rad_etilgan: boolean;
}

/** Server javob bermaguncha ham qulf to'g'ri chizilsin — standart qiymat. */
export const BEPUL = 3;

let kesh: PremiumHolat | null = null;
/** `kesh` qachon olingan (`performance.now`) — qolgan vaqtni shundan sanaymiz. */
let keshVaqt = 0;
let jarayon: Promise<PremiumHolat | null> | null = null;
const tinglovchilar = new Set<(h: PremiumHolat | null) => void>();

function yangila(h: PremiumHolat | null): void {
  kesh = h;
  keshVaqt = performance.now();
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
 * Chek rasmini SAYTDAN yuboradi. Admin rasmni botda "Tasdiqlash" tugmasi
 * bilan oladi, odamga esa bot orqali xabar keladi. Xato bo'lsa — kod
 * (`tarif` | `rasm` | `katta` | `kop` | `karta` | `aloqa`).
 */
export async function chekYukla(tarif: Tarif, rasm: File): Promise<string | null> {
  const f = new FormData();
  f.append("tarif", tarif);
  f.append("rasm", rasm);
  try {
    yangila(await sorov<PremiumHolat>("/api/v1/premium/chek", f));
    return null;
  } catch (e) {
    const kod = xatoKodi(e);
    return kod === 429 ? "kop" : kod === 400 ? "rasm" : "aloqa";
  }
}

/**
 * Chekni BOT orqali yuborish (ikkinchi yo'l): `?start=premium_<tarif>`.
 * Bot karta raqamini qayta yozadi va chek rasmini kutadi.
 */
export async function botdaYubor(tarif: Tarif): Promise<boolean> {
  const bot = await botNomi();
  if (!bot) return false;
  havolaniOch(`https://t.me/${encodeURIComponent(bot)}?start=premium_${tarif}`);
  return true;
}

/** 12000 → "12 000". */
export const som = (n: number): string =>
  String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** "12.11.2026 14:30" — tugash payti. */
export function sanaMatn(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const k = (x: number) => String(x).padStart(2, "0");
  return `${k(d.getDate())}.${k(d.getMonth() + 1)}.${d.getFullYear()} ${k(d.getHours())}:${k(d.getMinutes())}`;
}

/** "5 kun 3 soat", "4 soat 7 daqiqa", "12 daqiqa" — serverdagi `qolgan_matn` bilan bir xil. */
export function qolganMatn(sekund: number): string {
  const s = Math.max(0, Math.floor(sekund));
  const kun = Math.floor(s / 86400);
  const soat = Math.floor((s % 86400) / 3600);
  const daqiqa = Math.floor((s % 3600) / 60);
  const ru = til() === "ru";
  if (kun) return ru ? `${kun} дн. ${soat} ч` : `${kun} kun ${soat} soat`;
  if (soat) return ru ? `${soat} ч ${daqiqa} мин` : `${soat} soat ${daqiqa} daqiqa`;
  return ru ? `${daqiqa} мин` : `${daqiqa} daqiqa`;
}

/**
 * Qolgan vaqt — har daqiqada yangilanadi. Muddat tugasa holat serverdan
 * qayta olinadi va yopiq variantlar o'zi qulflanadi.
 */
export function useQolgan(h: PremiumHolat | null): number {
  const hisobla = () => (h?.faol ? h.qolgan_sekund - (performance.now() - keshVaqt) / 1000 : 0);
  const [s, setS] = useState(hisobla);
  useEffect(() => {
    setS(hisobla());
    if (!h?.faol) return;
    const id = window.setInterval(() => {
      const yangi = hisobla();
      setS(yangi);
      if (yangi <= 0) premiumOl(true).catch(() => {});
    }, 30_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h]);
  return s;
}
