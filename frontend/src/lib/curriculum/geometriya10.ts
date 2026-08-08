/**
 * 10-sinf GEOMETRIYA — stereometriya boshlanishi.
 *
 * Manba: "Geometriya 10-sinf" (yangi darslik) mundarijasi —
 *   I bob. Planimetriyani tizimli takrorlash
 *   II bob. Stereometriyaga kirish
 *   III bob. Fazoda to'g'ri chiziq va tekisliklarning parallelligi
 *   IV bob. Fazoda to'g'ri chiziq va tekisliklarning perpendikulyarligi
 *   V bob. Takrorlash
 *
 * ─────────────── TEKISLIKDAN FAZOGA ───────────────
 *
 * Bu yil bola uchun eng qiyin narsa hisoblash emas, TASAVVUR: tekislikda
 * kesishmaydigan ikki to'g'ri chiziq albatta parallel edi, fazoda esa u
 * AYQASH ham bo'lishi mumkin — ya'ni umuman bir tekislikda yotmaydi.
 *
 * Shu sabab bob "joylashuv" savolidan boshlanadi va u chizmasiz beriladi:
 * shart so'z bilan aytiladi, javob ham so'z. Bu — aynan tasavvurni
 * tekshiradigan savol, chizma esa unga javobni tayyor ko'rsatib qo'yardi.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. Planimetriyani takrorlash", ic: "repeat", color: "blue",
    intro: {
      t: "Tekislikdagi geometriya",
      v: ["△", "○", "S"],
      d: "Fazoga chiqishdan oldin tekislikdagi hamma narsa mustahkam turishi kerak.",
    },
    lessons: [
      { n: "Uchburchak va to'rtburchaklar", ic: "triangle", gens: [G.g7UchinchiBurchak, G.g8Parallelogramm, G.g8Pifagor, G.g7Tashqi, G.g8Trapetsiya, G.g8Pifagor] },
      { n: "Yuz va aylana", ic: "circle", gens: [G.g8Yuza, G.g9AylanaUzunlik, G.g9Sektor, G.g8Romb, G.g9Yoy, G.g8Yuza] },
      { n: "Sinuslar va kosinuslar teoremasi", ic: "angle", gens: [G.g9Sinuslar, G.g9Kosinuslar, G.g9YuzaSinus, G.g9Kosinuslar, G.g9Sinuslar, G.g9YuzaSinus] },
    ],
  },
  {
    u: "2-bob. Stereometriyaga kirish", ic: "cube", color: "purple",
    intro: {
      t: "Uchinchi o'lcham",
      v: ["◻", "→", "▣"],
      d: "Endi shakl qog'ozda emas, fazoda. Nuqta, chiziq va tekislik — asosiy uch tushuncha.",
    },
    lessons: [
      { n: "Fazoda to'g'ri chiziqlar joylashuvi", ic: "numline", gens: Array(6).fill(G.s10Joylashuv) },
      { n: "Ko'pyoqlar va ularning elementlari", ic: "cube", gens: Array(6).fill(G.s10Kopyoq) },
      { n: "Eyler formulasi", ic: "equals", gens: Array(6).fill(G.s10Eyler) },
    ],
  },
  {
    u: "3-bob. Fazoda parallellik", ic: "numline", color: "green",
    intro: {
      t: "Parallel va ayqash",
      v: ["∥", "vs", "⤬"],
      d: "Fazoda kesishmagan ikki chiziq parallel bo'lishi SHART EMAS — ayqash bo'lishi ham mumkin.",
    },
    lessons: [
      { n: "Ayqash to'g'ri chiziqlar", ic: "sign", gens: Array(6).fill(G.s10Joylashuv) },
      {
        n: "Tekisliklarning o'zaro joylashuvi", ic: "shape",
        gens: [G.s10Joylashuv, G.s10Kopyoq, G.s10Joylashuv, G.s10Eyler, G.s10Joylashuv, G.s10Kopyoq],
      },
    ],
  },
  {
    u: "4-bob. Fazoda perpendikulyarlik", ic: "angle", color: "red",
    intro: {
      t: "Perpendikulyar va masofa",
      v: ["⊥", "d", "="],
      d: "Nuqtadan tekislikkacha masofa — perpendikulyarning uzunligi, og'maniki emas.",
    },
    lessons: [
      { n: "Fazoda ikki nuqta orasidagi masofa", ic: "ruler", gens: Array(6).fill(G.s10Masofa) },
      { n: "Parallelepipedning diagonali", ic: "cube", gens: Array(6).fill(G.s10Diagonal) },
      { n: "Fazoviy vektorlar", ic: "map", gens: Array(6).fill(G.s10Vektor) },
    ],
  },
  {
    u: "5-bob. Takrorlash", ic: "trophy", color: "gold",
    final: true,
    intro: {
      t: "Yil yakuni",
      v: ["▣", "⊥", "∥"],
      d: "Fazoviy tasavvur va hisob — ikkalasi birga.",
    },
    lessons: [
      {
        n: "Takrorlashga doir masalalar", ic: "repeat",
        gens: [G.s10Diagonal, G.s10Joylashuv, G.s10Masofa, G.s10Eyler, G.s10Vektor, G.s10Kopyoq],
      },
    ],
  },
];

export const geometriya10 = withReviews(U);
