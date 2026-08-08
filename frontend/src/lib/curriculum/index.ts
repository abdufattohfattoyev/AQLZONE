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
import { algebra7 } from "./algebra7";
import { geometriya7 } from "./geometriya7";
import { algebra8 } from "./algebra8";
import { geometriya8 } from "./geometriya8";
import { algebra9 } from "./algebra9";
import { geometriya9 } from "./geometriya9";
import { algebra10 } from "./algebra10";
import { geometriya10 } from "./geometriya10";
import { matematika11 } from "./matematika11";

export interface Course {
  id: string;
  /**
   * Kurs kodi. Server natijani SHU son bilan saqlaydi
   * (`LessonResult.grade`), ya'ni u kurslar bo'ylab YAGONA bo'lishi shart.
   *
   * 0        maktabgacha
   * 1–6      matematika
   * 7–10     algebra
   * 11       matematika (11-sinfda darslik bitta, ikkala fan birga)
   * 107–110  geometriya (100 + sinf)
   *
   * Geometriya nega 100 dan boshlanadi. 7-sinfda algebra ham, geometriya
   * ham bor va ikkalasi ham "7" bo'lsa, ular serverda BIR-BIRIGA
   * QO'SHILIB ketardi: hisobotdagi "7-sinf · 1-bob · 1-dars" qatori ikki
   * xil darsning yig'indisi bo'lib qolardi va qaysi biri qiyin ekanini
   * aytib bo'lmasdi. Qo'shimcha ustun kiritish esa migratsiya, mijoz
   * yangilanishi va eski natijalarni ko'chirishni talab qilardi — bitta
   * hisobot ustuni uchun juda katta narx. Kod esa `sinfMatn` da bir
   * joyda ochiladi.
   */
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

  // 7-sinfdan boshlab matematika IKKI FANGA bo'linadi va maktabda ham
  // ikki alohida darslik, ikki alohida baho bo'ladi. Shuning uchun bu
  // yerda ham ular alohida kurs: bola algebrani tugatib, geometriyani
  // hali boshlamagan bo'lishi mumkin va yo'l xaritasi buni ko'rsatishi
  // kerak. Bitta kursga qo'shsak, ikkala fan bitta chiziqqa tizilib,
  // geometriya algebra tugagunicha qulflangan bo'lib turardi.
  build({ id: "algebra7", grade: 7, slug: "7-sinf-algebra", title: "7-sinf Algebra", ic: "power", color: "blue",
    desc: "Algebraik ifodalar, tenglama, ko'phad, kasrlar", units: algebra7 }),
  build({ id: "geometriya7", grade: 107, slug: "7-sinf-geometriya", title: "7-sinf Geometriya", ic: "triangle", color: "orange",
    desc: "Burchak, uchburchak, parallel chiziqlar", units: geometriya7 }),

  build({ id: "algebra8", grade: 8, slug: "8-sinf-algebra", title: "8-sinf Algebra", ic: "sqrt", color: "purple",
    desc: "Kvadrat ildiz, tengsizliklar, kvadrat tenglamalar", units: algebra8 }),
  build({ id: "geometriya8", grade: 108, slug: "8-sinf-geometriya", title: "8-sinf Geometriya", ic: "shape", color: "green",
    desc: "To'rtburchaklar, Pifagor, vektorlar, yuz", units: geometriya8 }),

  build({ id: "algebra9", grade: 9, slug: "9-sinf-algebra", title: "9-sinf Algebra", ic: "chart", color: "red",
    desc: "Kvadrat funksiya, trigonometriya, progressiyalar", units: algebra9 }),
  build({ id: "geometriya9", grade: 109, slug: "9-sinf-geometriya", title: "9-sinf Geometriya", ic: "circle", color: "gold",
    desc: "O'xshashlik, sinuslar teoremasi, aylana uzunligi", units: geometriya9 }),

  build({ id: "algebra10", grade: 10, slug: "10-sinf-algebra", title: "10-sinf Algebra", ic: "percent", color: "blue",
    desc: "Funksiyalar, logarifm, trigonometrik tenglamalar", units: algebra10 }),
  build({ id: "geometriya10", grade: 110, slug: "10-sinf-geometriya", title: "10-sinf Geometriya", ic: "cube", color: "purple",
    desc: "Stereometriya: fazoda chiziq va tekisliklar", units: geometriya10 }),

  // 11-sinfda darslik BITTA ("Matematika 11") va ichida ikkala fan
  // birga yuradi — kurs ham shunga mos ravishda bo'linmagan.
  build({ id: "matematika11", grade: 11, title: "11-sinf Matematika", ic: "trophy", color: "gold",
    desc: "Hosila, integral, fazoviy jismlar, ehtimollik", units: matematika11 }),
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
