/**
 * 7-sinf GEOMETRIYA — planimetriya boshlanishi.
 *
 * Manba: "Geometriya 7-sinf" (yangi darslik) mundarijasi — I–VII boblar.
 *
 * ─────────────── QAYSI DARSLAR OLINMADI VA NEGA ───────────────
 *
 * Darslikda "Amaliy mashg'ulot", "Nazorat ishi" va "Yasashga doir
 * masalalar" bo'limlari bor. Ular bu yerga KIRMADI, chunki uchalasi ham
 * daftar, sirkul va chizg'ichni talab qiladi — ilova ularning o'rnini
 * bosa olmaydi va bosishga urinmasligi ham kerak.
 *
 * O'rniga yasash bobidan uning MANTIQIY qismi olindi: "bunday uchburchak
 * yasash mumkinmi?" degan savol uchburchak tengsizligini tekshiradi va
 * bu — yasashdan oldin bilinishi kerak bo'lgan narsa.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. Boshlang'ich ma'lumotlar", ic: "ruler", color: "blue",
    intro: {
      t: "Nuqta, chiziq, kesma",
      v: ["·", "—", "○"],
      d: "Geometriya shu uchtadan boshlanadi. Qolgan hamma narsa ularning ustiga quriladi.",
    },
    lessons: [
      { n: "Kesma va uning uzunligi", ic: "ruler", gens: Array(6).fill(G.g7Kesma) },
      { n: "Aylana va doira", ic: "circle", gens: Array(6).fill(G.g7Aylana) },
      {
        n: "Kesmalarni taqqoslash", ic: "scale",
        gens: [G.g7Kesma, G.g7Aylana, G.g7Kesma, G.g7Kesma, G.g7Aylana, G.g7Kesma],
      },
    ],
  },
  {
    u: "2-bob. Burchak", ic: "angle", color: "orange",
    intro: {
      t: "Burchak va uning o'lchovi",
      v: ["∠", "90°", "180°"],
      d: "Burchak gradusda o'lchanadi. To'g'ri burchak — 90°, yoyiq burchak — 180°.",
    },
    lessons: [
      { n: "Burchak turlari", ic: "angle", gens: Array(6).fill(G.g7BurchakTuri) },
      { n: "Bissektrisa", ic: "divide", gens: Array(6).fill(G.g7Bissektrisa) },
      { n: "Qo'shni burchaklar", ic: "plus", gens: Array(6).fill(G.g7Qoshni) },
      { n: "Vertikal burchaklar", ic: "equals", gens: Array(6).fill(G.g7Vertikal) },
    ],
  },
  {
    u: "3-bob. Ko'pburchak va uchburchak", ic: "triangle", color: "green",
    intro: {
      t: "Uchburchak — asosiy shakl",
      v: ["△", "≅", "△"],
      d: "Ikki uchburchak teng ekanini uchta alomatdan biri bilan isbotlaymiz.",
    },
    lessons: [
      { n: "Uchburchak turlari", ic: "triangle", gens: Array(6).fill(G.g7UchburchakTuri) },
      { n: "Ko'pburchak burchaklari", ic: "shape", gens: Array(6).fill(G.g7Kopburchak) },
      { n: "Tenglik alomatlari", ic: "equals", gens: Array(6).fill(G.g7Alomat) },
      { n: "Teng yonli uchburchak", ic: "triangle", gens: Array(6).fill(G.g7TengYonli) },
    ],
  },
  {
    u: "4-bob. Parallel to'g'ri chiziqlar", ic: "numline", color: "purple",
    intro: {
      t: "Parallel chiziqlar va kesuvchi",
      v: ["∥", "∠1", "∠2"],
      d: "Kesuvchi sakkizta burchak hosil qiladi. Ular orasida faqat ikki xil qiymat bor.",
    },
    lessons: [
      { n: "Kesuvchi hosil qilgan burchaklar", ic: "angle", gens: Array(6).fill(G.g7Parallel) },
      {
        n: "Parallellik alomatlari", ic: "numline",
        gens: [G.g7Parallel, G.g7Vertikal, G.g7Parallel, G.g7Qoshni, G.g7Parallel, G.g7Parallel],
      },
    ],
  },
  {
    u: "5-bob. Tomonlar va burchaklar", ic: "scale", color: "red",
    intro: {
      t: "Uchburchakning ichida nima bor",
      v: ["∠A", "+", "∠B + ∠C"],
      d: "Uchala burchakning yig'indisi har doim 180°. Bu — butun bobning kaliti.",
    },
    lessons: [
      { n: "Ichki burchaklar yig'indisi", ic: "plus", gens: Array(6).fill(G.g7UchinchiBurchak) },
      { n: "Tashqi burchak", ic: "angle", gens: Array(6).fill(G.g7Tashqi) },
      { n: "To'g'ri burchakli uchburchak", ic: "triangle", gens: Array(6).fill(G.g7TogriBurchakli) },
      { n: "Uchburchak tengsizligi", ic: "scale", gens: Array(6).fill(G.g7Tengsizlik) },
    ],
  },
  {
    u: "6-bob. Takrorlash", ic: "repeat", color: "gold",
    final: true,
    intro: {
      t: "Hammasi birga",
      v: ["△", "∠", "∥"],
      d: "Yil davomida o'rganilgan hamma narsa aralash keladi.",
    },
    lessons: [
      {
        n: "Hisoblashga doir masalalar", ic: "count",
        gens: [G.g7UchinchiBurchak, G.g7Qoshni, G.g7Bissektrisa, G.g7Tashqi, G.g7Kesma, G.g7TogriBurchakli],
      },
      {
        n: "Yakuniy sinov", ic: "trophy",
        gens: [G.g7Alomat, G.g7Parallel, G.g7Tengsizlik, G.g7Kopburchak, G.g7TengYonli, G.g7BurchakTuri],
      },
    ],
  },
];

export const geometriya7 = withReviews(U);
