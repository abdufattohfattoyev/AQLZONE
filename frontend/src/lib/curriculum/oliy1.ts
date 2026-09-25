/**
 * OLIY MATEMATIKA · 1-kurs — talabalar kursi.
 *
 * Manba: OTMlarning 1-kurs "Oliy matematika" dasturi —
 *   1. Chiziqli algebra: determinantlar, matritsalar, Kramer usuli
 *   2. Vektorlar: uzunlik, skalyar va vektor ko'paytma
 *   3. Limitlar: cheksizlikdagi limit, 0/0 noaniqlik, ajoyib limit
 *   4. Differensial hisob: ko'paytma, murakkab va ko'rsatkichli funksiya
 *   5. Integral hisob: Nyuton–Leybnits, bo'laklab integrallash
 *   6. Qatorlar va differensial tenglamalar
 *
 * Kurs kodi 301 (`Course.grade`): maktab kodlaridan (0–11, 107–110) va
 * masalalar bo'limi kodlaridan (200, 201) uzoqda. Server uni
 * "Oliy matematika" deb nomlaydi (`boshqaruv.sinf_nomi`).
 *
 * Anketada "talaba" yoki "universitet darajasi" deganlarga shu kurs
 * birinchi chiqadi (`lib/profil.ts`).
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as A from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. Chiziqli algebra", ic: "grid", color: "blue",
    intro: {
      t: "Matritsa va determinant",
      v: ["det", "A", "Δ"],
      d: "Chiziqli tenglamalar sistemasini jadval ko'rinishida yozish va determinant orqali yechish.",
    },
    lessons: [
      { n: "2×2 determinant", ic: "grid", gens: Array(6).fill(A.o1Det2) },
      { n: "3×3 determinant", ic: "grid", gens: Array(6).fill(A.o1Det3) },
      { n: "Matritsalar ustida amallar", ic: "plus", gens: Array(6).fill(A.o1MatQosh) },
      { n: "Matritsalarni ko'paytirish", ic: "times", gens: Array(6).fill(A.o1MatKop) },
      { n: "Kramer usuli", ic: "equals", gens: Array(6).fill(A.o1Kramer) },
    ],
  },
  {
    u: "2-bob. Vektorlar", ic: "angle", color: "green",
    intro: {
      t: "Fazodagi vektorlar",
      v: ["a·b", "a×b", "|a|"],
      d: "Uzunlik, burchak va yuza — hammasi koordinatalar orqali hisoblanadi.",
    },
    lessons: [
      { n: "Vektor uzunligi", ic: "ruler", gens: Array(6).fill(A.o1VektorUzun) },
      { n: "Skalyar ko'paytma", ic: "times", gens: Array(6).fill(A.o1Skalyar) },
      { n: "Perpendikulyarlik sharti", ic: "angle", gens: Array(6).fill(A.o1Perp) },
      { n: "Vektor ko'paytma", ic: "cube", gens: Array(6).fill(A.o1VektorKop) },
    ],
  },
  {
    u: "3-bob. Limitlar", ic: "search", color: "orange",
    intro: {
      t: "Noaniqliklarni ochish",
      v: ["∞/∞", "0/0", "sin x/x"],
      d: "Limit to'g'ridan-to'g'ri qo'yib bo'lmaganda: bosh hadlar, qisqartirish va ajoyib limit.",
    },
    lessons: [
      { n: "Cheksizlikdagi limit", ic: "chart", gens: Array(6).fill(A.o1LimitCheksiz) },
      { n: "0/0 noaniqlik", ic: "divide", gens: Array(6).fill(A.o1LimitNol) },
      { n: "Birinchi ajoyib limit", ic: "circle", gens: Array(6).fill(A.o1AjoyibLimit) },
    ],
  },
  {
    u: "4-bob. Differensial hisob", ic: "chart", color: "purple",
    intro: {
      t: "Hosila qoidalari",
      v: ["(uv)′", "f(g)′", "eˣ"],
      d: "Maktabdagi hosilalar jadvalidan keyingi qadam: ko'paytma, murakkab va ko'rsatkichli funksiya.",
    },
    lessons: [
      { n: "Ko'paytmaning hosilasi", ic: "times", gens: Array(6).fill(A.o1HosilaKopaytma) },
      { n: "Murakkab funksiya hosilasi", ic: "power", gens: Array(6).fill(A.o1HosilaMurakkab) },
      { n: "Ko'rsatkichli funksiya hosilasi", ic: "chart", gens: Array(6).fill(A.o1HosilaEksp) },
    ],
  },
  {
    u: "5-bob. Integral hisob", ic: "pie", color: "red",
    intro: {
      t: "Aniq integral",
      v: ["∫", "F(b) − F(a)", "uv"],
      d: "Nyuton–Leybnits formulasi va bo'laklab integrallash.",
    },
    lessons: [
      { n: "Nyuton–Leybnits formulasi", ic: "equals", gens: Array(6).fill(A.o1IntegralDaraja) },
      { n: "Bo'laklab integrallash", ic: "puzzle", gens: Array(6).fill(A.o1Bolaklab) },
    ],
  },
  {
    u: "6-bob. Qatorlar va differensial tenglamalar", ic: "repeat", color: "gold",
    intro: {
      t: "Cheksiz yig'indi va o'zgarish qonuni",
      v: ["Σ", "y′ = ky", "eᵏˣ"],
      d: "Geometrik qator yig'indisi va eng sodda differensial tenglama.",
    },
    lessons: [
      { n: "Geometrik qator yig'indisi", ic: "repeat", gens: Array(6).fill(A.o1Qator) },
      { n: "y′ = ky tenglamasi", ic: "chart", gens: Array(6).fill(A.o1DifTenglama) },
      {
        n: "Yakuniy takrorlash", ic: "trophy",
        gens: [A.o1Det3, A.o1Kramer, A.o1LimitNol, A.o1HosilaMurakkab, A.o1IntegralDaraja, A.o1Qator],
      },
    ],
  },
];

export const oliy1 = withReviews(U);
