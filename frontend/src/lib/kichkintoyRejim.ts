/**
 * KICHKINTOY REJIMI — 2–5 yoshli bola uchun ilova (`manba/Kichkintoy.dc.html`).
 *
 * Rejimda ilova pastki panelsiz, faqat to'rtta katta karta (Mashinalar,
 * Hayvonlar, Ranglar, Raqamlar) ko'rsatadi. Bu yoshdagi bola pastdagi
 * besh tugmani bexosdan bosadi va o'zi ochgan rasmlardan chiqib ketadi —
 * ota-ona esa telefonni har safar qaytarib olishi kerak bo'lardi.
 *
 * QACHON YOQILADI:
 *   o'zi       anketada "maktabgacha" tanlangan (`sinfOfProfil === 0`)
 *   qo'lda     ota-ona "Men › Kichkintoy rejimi" ni bosdi
 *
 * CHIQISH faqat qulfli "Ota-ona" tugmasi orqali (oddiy misol). Chiqish
 * shu SEANS uchun eslanadi (`sessionStorage`): ilova qayta ochilganda
 * bola yana o'z ekranini ko'radi — telefonni bolaga berayotgan ota-ona
 * har safar rejimni qayta yoqib o'tirmasin.
 */
import { useSyncExternalStore } from "react";
import { sinfOfProfil, useProfil } from "./profil";
import type { Profil } from "./profil";

const CHIQDI = "az_kichkintoy_chiqdi";
const QOLDA = "az_kichkintoy_qolda";

const tinglovchilar = new Set<() => void>();
let versiya = 0;
const xabar = () => { versiya++; tinglovchilar.forEach((f) => f()); };

function oqi(k: string): boolean {
  try { return sessionStorage.getItem(k) === "1"; } catch { return false; }
}
function yoz(k: string, v: boolean): void {
  try { if (v) sessionStorage.setItem(k, "1"); else sessionStorage.removeItem(k); } catch { /* eslanmaydi */ }
}

/** Rejim yoqilganmi — profil va shu seansdagi tanlovga qarab. */
export function rejimFaol(p: Profil | null): boolean {
  if (oqi(QOLDA)) return true;
  return sinfOfProfil(p) === 0 && !oqi(CHIQDI);
}

/** Ota-ona tasdiqladi — shu seansda oddiy ilova. */
export function rejimdanChiq(): void {
  yoz(QOLDA, false);
  yoz(CHIQDI, true);
  xabar();
}

/** Ota-ona rejimni o'zi yoqdi (Men bo'limidan). */
export function rejimgaKir(): void {
  yoz(CHIQDI, false);
  yoz(QOLDA, true);
  xabar();
}

function obuna(f: () => void): () => void {
  tinglovchilar.add(f);
  return () => tinglovchilar.delete(f);
}

/** React uchun: rejim o'zgarsa komponent qayta chiziladi. */
export function useKichkintoyRejim(): boolean {
  const p = useProfil();
  useSyncExternalStore(obuna, () => versiya, () => versiya);
  return rejimFaol(p);
}

/**
 * Qulf savoli — ikki xonali qo'shish: 2–5 yoshli bola yecha olmaydi,
 * kattaga bir soniya. Uchta javob varianti, bittasi to'g'ri.
 */
export function qulfSavoli(rnd: () => number = Math.random): { a: number; b: number; javob: number; variantlar: number[] } {
  const a = 11 + Math.floor(rnd() * 30);
  const b = 11 + Math.floor(rnd() * 30);
  const javob = a + b;
  const boshqa = new Set<number>();
  while (boshqa.size < 2) {
    const x = javob + (Math.floor(rnd() * 9) - 4 || 5);
    if (x !== javob && x > 0) boshqa.add(x);
  }
  const variantlar = [javob, ...boshqa].sort((x, y) => x - y);
  return { a, b, javob, variantlar };
}
