/**
 * 8-sinf GEOMETRIYA.
 *
 * Manba: A. A. Rahimqoriyev, M. A. Toxtaxodjayeva, "Geometriya 8" —
 *   I bob. To'rtburchaklar (1–14-mavzu)
 *   II bob. To'g'ri burchakli uchburchak: trigonometriya, Pifagor (15–30)
 *   III bob. Koordinatalar usuli. Vektorlar (31–44)
 *   IV bob. Yuz (45–54)
 *   V bob. Aylana (55–62)
 *
 * ─────────────── PIFAGOR UCHLIKLARI NEGA MUHIM ───────────────
 *
 * Bu bo'limdagi deyarli hamma masalada tomonlar Pifagor uchligidan
 * olinadi (3-4-5, 5-12-13, 8-15-17…). Sabab ilovaga xos: javob to'rtta
 * tugmadan biri bo'lishi kerak, √53 esa tugmaga sig'maydi va bola uni
 * hisoblab emas, ko'rinishidan tanib oladi. Butun javoblar bilan esa
 * to'rtta variantning hammasi bir xil ishonarli bo'lib turadi.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. To'rtburchaklar", ic: "shape", color: "blue",
    intro: {
      t: "Parallelogramm oilasi",
      v: ["▭", "◇", "▱"],
      d: "To'g'ri to'rtburchak, romb va kvadrat — hammasi parallelogrammning bolalari.",
    },
    lessons: [
      { n: "Parallelogramm burchaklari", ic: "angle", gens: Array(6).fill(G.g8Parallelogramm) },
      { n: "Parallelogramm perimetri", ic: "ruler", gens: Array(6).fill(G.g8ParallelogrammP) },
      { n: "Romb va kvadrat", ic: "shape", gens: Array(6).fill(G.g8Romb) },
      { n: "Trapetsiya", ic: "shape", gens: Array(6).fill(G.g8Trapetsiya) },
      { n: "O'rta chiziq. Fales teoremasi", ic: "numline", gens: Array(6).fill(G.g8OrtaChiziq) },
    ],
  },
  {
    u: "2-bob. To'g'ri burchakli uchburchak", ic: "triangle", color: "red",
    intro: {
      t: "Pifagor va trigonometriya",
      v: ["a²", "+", "b² = c²"],
      d: "Ikki katetni bilsang gipotenuzani topasan. Burchakni bilsang — tomonlar nisbatini.",
    },
    lessons: [
      { n: "Pifagor teoremasi", ic: "sqrt", gens: Array(6).fill(G.g8Pifagor) },
      { n: "Sinus, kosinus, tangens", ic: "angle", gens: Array(6).fill(G.g8TrigNisbat) },
      { n: "30°, 45°, 60° burchaklar", ic: "pie", gens: Array(6).fill(G.g8TrigJadval) },
      {
        n: "To'g'ri burchakli uchburchakni yechish", ic: "triangle",
        gens: [G.g8Pifagor, G.g8TrigJadval, G.g8Pifagor, G.g8TrigNisbat, G.g8Pifagor, G.g8TrigJadval],
      },
    ],
  },
  {
    u: "3-bob. Koordinatalar va vektorlar", ic: "map", color: "purple",
    intro: {
      t: "Geometriya sonlar bilan",
      v: ["A(x; y)", "→", "a⃗"],
      d: "Har bir nuqta — ikkita son. Shundan keyin geometriya masalasi hisobga aylanadi.",
    },
    lessons: [
      { n: "Kesma o'rtasining koordinatalari", ic: "numline", gens: Array(6).fill(G.g8OrtaNuqta) },
      { n: "Ikki nuqta orasidagi masofa", ic: "ruler", gens: Array(6).fill(G.g8Masofa) },
      { n: "Vektor uzunligi", ic: "sign", gens: Array(6).fill(G.g8VektorUzunlik) },
      { n: "Vektorlarni qo'shish", ic: "plus", gens: Array(6).fill(G.g8VektorQosh) },
      { n: "Skalyar ko'paytma", ic: "times", gens: Array(6).fill(G.g8Skalyar) },
    ],
  },
  {
    u: "4-bob. Yuz", ic: "grid", color: "green",
    intro: {
      t: "Yuzni hisoblash",
      v: ["S", "=", "a · h"],
      d: "Har shaklning o'z formulasi bor, lekin hammasi to'g'ri to'rtburchakdan chiqadi.",
    },
    lessons: [
      { n: "To'rtburchak va uchburchak yuzi", ic: "grid", gens: Array(6).fill(G.g8Yuza) },
      { n: "Romb va trapetsiya yuzi", ic: "shape", gens: [G.g8Romb, G.g8Trapetsiya, G.g8Romb, G.g8Trapetsiya, G.g8Romb, G.g8Trapetsiya] },
      {
        n: "Yuzga doir masalalar", ic: "ruler",
        gens: [G.g8Yuza, G.g8Trapetsiya, G.g8Yuza, G.g8Romb, G.g8Yuza, G.g8Trapetsiya],
      },
    ],
  },
  {
    u: "5-bob. Aylana", ic: "circle", color: "gold",
    final: true,
    intro: {
      t: "Aylanadagi burchaklar",
      v: ["○", "∠", "½"],
      d: "Ichki chizilgan burchak markaziy burchakning yarmiga teng — bob shu qoidaga tayanadi.",
    },
    lessons: [
      { n: "Ichki chizilgan burchak", ic: "circle", gens: Array(6).fill(G.g8IchkiBurchak) },
      { n: "Diametrga tiralgan burchak", ic: "angle", gens: Array(6).fill(G.g8DiametrBurchak) },
      {
        n: "8-sinf geometriya kursini takrorlash", ic: "repeat",
        gens: [G.g8Pifagor, G.g8Parallelogramm, G.g8Yuza, G.g8Masofa, G.g8IchkiBurchak, G.g8TrigJadval],
      },
    ],
  },
];

export const geometriya8 = withReviews(U);
