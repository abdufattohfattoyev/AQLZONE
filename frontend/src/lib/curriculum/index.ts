import type { IconName } from "../icons";
import type { Unit, UnitColor } from "../types";
import { sinfMatn } from "../tarjima/kurs";
import { grade0 } from "./grade0";
import { grade1 } from "./grade1";
import { grade2 } from "./grade2";
import { grade3 } from "./grade3";
import { grade4 } from "./grade4";
import { grade5 } from "./grade5";
import { grade6 } from "./grade6";

export interface Course {
  id: string;
  /** Sinf raqami. 0 — maktabgacha yosh (4–6). */
  grade: number;
  title: string;
  desc: string;
  ic: IconName;
  color: UnitColor;
  units: Unit[];
  /** localStorage va serverdagi kalit. */
  key: string;
  /** Manzildagi qism: /kurs/1-sinf */
  slug: string;
}

/** `slug` berilmasa sinf raqamidan yasaladi: 2 → "2-sinf". */
const build = (c: Omit<Course, "key" | "slug"> & { slug?: string }): Course => ({
  ...c,
  key: `azapp_${c.id}_v1`,
  slug: c.slug ?? `${c.grade}-sinf`,
});

export const COURSES: Course[] = [
  // Maktabgacha kurs ataylab BIRINCHI turadi: ilovani ochgan ota-ona
  // bolasining yoshini pastdan yuqoriga qarab izlaydi. Manzili "0-sinf"
  // emas — bunday sinf yo'q, va havolani ko'rgan odam chalkashardi.
  build({ id: "grade0", grade: 0, slug: "maktabgacha", title: "Maktabgacha", ic: "palette", color: "red",
    desc: "4–6 yosh · ranglar, shakllar, naqsh, sanash, harflar", units: grade0 }),
  build({ id: "grade1", grade: 1, title: "1-sinf Matematika", ic: "count", color: "green",
    desc: "Ranglar, hayvonlar, sanash — o'qish shart emas", units: grade1 }),
  build({ id: "grade2", grade: 2, title: "2-sinf Matematika", ic: "times", color: "orange",
    desc: "Ko'paytirish, bo'lish, perimetr, ulush, soat", units: grade2 }),
  build({ id: "grade3", grade: 3, title: "3-sinf Matematika", ic: "blocks", color: "purple",
    desc: "1000 ichida amallar, qoldiqli bo'lish, ulushlar", units: grade3 }),
  build({ id: "grade4", grade: 4, title: "4-sinf Matematika", ic: "car", color: "blue",
    desc: "Million gacha sonlar, kasrlar, tezlik-vaqt-masofa", units: grade4 }),
  build({ id: "grade5", grade: 5, title: "5-sinf Matematika", ic: "percent", color: "red",
    desc: "Daraja, oddiy va o'nli kasrlar, foiz, hajm", units: grade5 }),
  build({ id: "grade6", grade: 6, title: "6-sinf Matematika", ic: "sign", color: "purple",
    desc: "Bo'linish belgilari, proporsiya, manfiy sonlar, tenglama", units: grade6 }),
];

export const courseById = (id: string) => COURSES.find((c) => c.id === id);

/**
 * Sinfning odam o'qiy oladigan nomi.
 *
 * Server natijalarni faqat `grade` soni bilan saqlaydi, shuning uchun
 * ota-ona panelida "0-sinf" chiqib qolmasligi uchun shu yerda o'giriladi.
 */
export const sinfNomi = (grade: number) => sinfMatn(grade);

/** Manzildan kursni topadi: "1-sinf" → 1-sinf kursi. */
export const courseBySlug = (slug: string) => COURSES.find((c) => c.slug === slug);

/** Kursdagi jami darslar soni. */
export const lessonCount = (c: Course) => c.units.reduce((s, u) => s + u.lessons.length, 0);
