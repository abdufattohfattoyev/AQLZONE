/**
 * Yutuq nishonlari.
 *
 * Nishonlar ALOHIDA saqlanmaydi — ular mavjud progressdan hisoblanadi.
 * Sabab: ikki manba bo'lsa, ular albatta bir-biriga zid bo'lib qoladi
 * (masalan progress serverdan yangilanadi-yu, nishon eski holida qoladi).
 * Hisoblash arzon, xotira esa yolg'on gapirmaydi.
 *
 * Shartlar ataylab turlicha: biri mehnat (savollar soni), biri odat
 * (ketma-ket kunlar), biri mahorat (xatosiz bob). Uchalasi bir xil
 * bo'lsa, faqat ko'p o'ynagan bola yutardi.
 */
import type { IconName } from "./icons";
import { t } from "./matn";
import type { Kunlik } from "./progress";
import type { Progress, Unit } from "./types";
import { lessonId } from "./types";

export interface Nishon {
  id: string;
  nom: string;
  izoh: string;
  ic: IconName;
  /** 0 → 1 oralig'ida. 1 bo'lsa — qo'lga kiritilgan. */
  daraja: number;
  /** Ko'rsatish uchun: "3/7". Bo'sh bo'lsa ko'rsatilmaydi. */
  hisob?: string;
}

interface Manba {
  progress: Progress;
  kunlik: Kunlik;
  units: Unit[];
  /** Shu kursda jami yechilgan savollar (barcha darslar bo'yicha taxmin). */
  savollar: number;
}

const nisbat = (bor: number, kerak: number) => Math.min(1, bor / kerak);

export function nishonlar({ progress, kunlik, units, savollar }: Manba): Nishon[] {
  const tugagan = Object.keys(progress.done).length;

  // Xatosiz bob: bobning HAMMA darsi 3 yulduz bo'lsa.
  // 3 yulduz = birinchi urinishda bitta ham xato yo'q (Lesson.tsx).
  let xatosizBob = 0;
  for (let ui = 0; ui < units.length; ui++) {
    const darslar = units[ui].lessons;
    if (!darslar.length) continue;
    if (darslar.every((_, li) => progress.done[lessonId(ui, li)] === 3)) xatosizBob++;
  }

  return [
    {
      id: "ilk-qadam",
      nom: t("nIlkQadam"),
      izoh: t("nIlkQadamIzoh"),
      ic: "star",
      daraja: nisbat(tugagan, 1),
    },
    {
      id: "yetti-kun",
      nom: t("nBirHafta"),
      izoh: t("nBirHaftaIzoh"),
      ic: "flame",
      daraja: nisbat(kunlik.kunlar, 7),
      hisob: `${Math.min(kunlik.kunlar, 7)}/7`,
    },
    {
      id: "yuz-savol",
      nom: t("nYuzSavol"),
      izoh: t("nYuzSavolIzoh"),
      ic: "map",
      daraja: nisbat(savollar, 100),
      hisob: `${Math.min(savollar, 100)}/100`,
    },
    {
      id: "xatosiz-bob",
      nom: t("nXatosizBob"),
      izoh: t("nXatosizBobIzoh"),
      ic: "trophy",
      daraja: nisbat(xatosizBob, 1),
    },
    {
      id: "oʻn-dars",
      nom: t("nOnDars"),
      izoh: t("nOnDarsIzoh"),
      ic: "check",
      daraja: nisbat(tugagan, 10),
      hisob: `${Math.min(tugagan, 10)}/10`,
    },
    {
      id: "yuz-yulduz",
      nom: t("nYulduzYiguvchi"),
      izoh: t("nYulduzYiguvchiIzoh"),
      ic: "star",
      daraja: nisbat(progress.stars, 100),
      hisob: `${Math.min(progress.stars, 100)}/100`,
    },
  ];
}

/** Qo'lga kiritilganlari soni — kartada ko'rsatish uchun. */
export const olingan = (n: Nishon[]) => n.filter((x) => x.daraja >= 1).length;
