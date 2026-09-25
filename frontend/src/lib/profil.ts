/**
 * PROFIL — "kim kirdi" degan savolning javobi va ilova shunga qanday
 * moslashadi.
 *
 * Javob anketadan keladi (`components/Anketa.tsx`) va IKKI joyda turadi:
 *
 *   qurilmada  darhol ishlaydi — javob berilgan zahoti bosh sahifa,
 *              darslar va testlar qayta tiziladi, server kutilmaydi
 *   serverda   `kim` + `bosqich` (`/me`) — qurilma almashsa ham qoladi
 *              va panelidagi tahlilga tushadi
 *
 * Ilgari anketa faqat ro'yxatdan TO'LIQ o'tganlarga chiqardi va 12%
 * odam to'ldirardi. Tahlil uchun bu yetmadi, ilova esa kimga
 * gapirayotganini bilmay, hammaga "1-sinf … 11-sinf" ni ko'rsatardi.
 * Endi savol hammaga — bir bosishli ikki savol, til tanlangandan keyin.
 */
import { useSyncExternalStore } from "react";
import { COURSES } from "./curriculum";
import type { Course } from "./curriculum";
import { t } from "./matn";

export type Kim = "oquvchi" | "talaba" | "abiturient" | "ota_ona" | "ustoz" | "kattalar";

export interface Profil {
  kim: Kim;
  /** Serverdagi `tahlil.BOSQICHLAR` kodi; -1 — so'ralmagan. */
  bosqich: number;
}

/**
 * Qaysi yo'l:
 *   maktab      sinf darslari birinchi
 *   abiturient  DTM va blok testlar birinchi
 *   oliy        formulalar, masalalar, analiz — sinf ro'yxati emas
 */
export type Yol = "maktab" | "abiturient" | "oliy";

/** Bosqich kodlari (`backend/core/tahlil.py` bilan bir xil). */
export const BOSQICH = {
  magistr: 105,
  ustozOtm: 120,
  ustozMarkaz: 121,
  maktabDaraja: 140,
  oliyDaraja: 141,
} as const;

const KALIT = "az_profil";
const KIMLAR: Kim[] = ["oquvchi", "talaba", "abiturient", "ota_ona", "ustoz", "kattalar"];

function oqi(): Profil | null {
  try {
    const x = JSON.parse(localStorage.getItem(KALIT) || "null");
    if (x && KIMLAR.includes(x.kim) && typeof x.bosqich === "number") return x;
  } catch { /* xotira yo'q yoki buzuq — profil yo'q deb qaraymiz */ }
  return null;
}

let joriy: Profil | null = oqi();
const tinglovchilar = new Set<() => void>();

export function profil(): Profil | null {
  return joriy;
}

export function profilQoy(p: Profil | null): void {
  joriy = p;
  try {
    if (p) localStorage.setItem(KALIT, JSON.stringify(p));
    else localStorage.removeItem(KALIT);
  } catch { /* faqat qurilmada eslanmaydi — serverdagisi qoladi */ }
  tinglovchilar.forEach((f) => f());
}

/**
 * Serverdan kelgan javobni qurilmaga yozadi — faqat qurilmada hali
 * javob bo'lmasa. Qurilmadagisi yangiroq: odam hozirgina o'zgartirgan
 * bo'lishi mumkin, server esa eski javobni qaytaradi.
 */
export function serverdanOl(kim: string | undefined, bosqich: number | undefined): void {
  if (joriy || !kim || !KIMLAR.includes(kim as Kim)) return;
  profilQoy({ kim: kim as Kim, bosqich: bosqich ?? -1 });
}

function obuna(f: () => void): () => void {
  tinglovchilar.add(f);
  return () => tinglovchilar.delete(f);
}

export const useProfil = (): Profil | null => useSyncExternalStore(obuna, profil, profil);

/* ------------------------------------------------------ moslashuv */

export function yolOf(p: Profil | null): Yol {
  if (!p) return "maktab";
  if (p.kim === "abiturient") return "abiturient";
  if (p.kim === "talaba") return "oliy";
  if (p.kim === "ustoz" && p.bosqich === BOSQICH.ustozOtm) return "oliy";
  if (p.kim === "kattalar" && p.bosqich === BOSQICH.oliyDaraja) return "oliy";
  return "maktab";
}

/** Maktab sinfi (0 — maktabgacha) yoki `null`. */
export function sinfOfProfil(p: Profil | null): number | null {
  if (!p) return null;
  if ((p.kim === "oquvchi" || p.kim === "ota_ona") && p.bosqich >= 0 && p.bosqich <= 11) return p.bosqich;
  return null;
}

/**
 * Profilning O'Z kursi. 7–10-sinfda ikki fan bor va birinchisi
 * (algebra) olinadi — geometriya darslar ro'yxatida yonida turadi.
 */
export function profilKursi(p: Profil | null): Course | null {
  const s = sinfOfProfil(p);
  if (s === null) return null;
  return COURSES.find((c) => c.grade === s) ?? null;
}

/** Profilning o'z kurslari (ikki fanli sinfda ikkalasi). */
export function profilKurslari(p: Profil | null): Course[] {
  const s = sinfOfProfil(p);
  if (s === null) return [];
  return COURSES.filter((c) => (c.grade >= 100 ? c.grade - 100 : c.grade) === s);
}

/** Qisqa yorliq — bosh sahifada "siz kimsiz" deb turadi. */
export function profilNomi(p: Profil): string {
  const b = p.bosqich;
  switch (p.kim) {
    case "oquvchi": return b >= 1 && b <= 11 ? t("profilOquvchi", { n: b }) : t("anketaOquvchi");
    case "ota_ona":
      if (b === 0) return t("profilOtaOnaKichik");
      return b >= 1 && b <= 11 ? t("profilOtaOna", { n: b }) : t("anketaOtaOna");
    case "talaba":
      if (b === BOSQICH.magistr) return t("profilMagistr");
      return b > 100 && b < 105 ? t("profilTalaba", { n: b - 100 }) : t("anketaTalaba");
    case "abiturient": return t("profilAbiturient");
    case "ustoz": return t("profilUstoz");
    default: return t("profilKattalar");
  }
}

/** Kichkintoylar bo'limi shu odamga tegishlimi. */
export function kichkintoyKerak(p: Profil | null): boolean {
  if (!p) return true;
  if (p.kim === "ota_ona") return true;
  if (p.kim === "ustoz") return p.bosqich === 130 || p.bosqich === BOSQICH.ustozMarkaz;
  if (p.kim === "kattalar") return p.bosqich !== BOSQICH.oliyDaraja;
  return false;
}
