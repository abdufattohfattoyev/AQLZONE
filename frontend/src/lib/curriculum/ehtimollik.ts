/**
 * EHTIMOLLAR NAZARIYASI VA MATEMATIK STATISTIKA — talabalar kursi (kod 303).
 *
 * Iqtisodiyot, IT va pedagogika yo'nalishlarida alohida fan
 * (Abdushukurov, Rasulov darsliklari). Kombinatorikadan boshlanadi —
 * klassik ehtimollik usiz hisoblanmaydi — va tanlanma
 * xarakteristikalari bilan tugaydi.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as A from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. Kombinatorika", ic: "puzzle", color: "blue",
    intro: {
      t: "Sanashning uch qoidasi",
      v: ["Cₙᵏ", "Aₙᵏ", "n!"],
      d: "Tartib muhimmi va takrorlanish bormi — shu ikki savol formulani tanlaydi.",
    },
    lessons: [
      { n: "Kombinatsiya, o'rinlashtirish, o'rin almashtirish", ic: "puzzle", gens: Array(6).fill(A.e1Kombinatorika) },
    ],
  },
  {
    u: "2-bob. Tasodifiy hodisalar", ic: "pie", color: "green",
    intro: {
      t: "Ehtimollik — qulay hollar ulushi",
      v: ["P(A)", "P(AB)", "P(A|H)"],
      d: "Klassik ta'rif, ko'paytirish teoremasi va to'la ehtimollik formulasi.",
    },
    lessons: [
      { n: "Klassik ehtimollik", ic: "pie", gens: Array(6).fill(A.e1Klassik) },
      { n: "Ehtimollarni ko'paytirish", ic: "times", gens: Array(6).fill(A.e1Kopaytirish) },
      { n: "To'la ehtimollik formulasi", ic: "equals", gens: Array(6).fill(A.e1TolaEhtimol) },
      { n: "Bernulli sxemasi", ic: "repeat", gens: Array(6).fill(A.e1Bernulli) },
    ],
  },
  {
    u: "3-bob. Tasodifiy miqdorlar", ic: "chart", color: "orange",
    intro: {
      t: "O'rtacha va tarqoqlik",
      v: ["M(X)", "D(X)", "np"],
      d: "Diskret tasodifiy miqdorning kutilmasi va binomial taqsimot parametrlari.",
    },
    lessons: [
      { n: "Matematik kutilma", ic: "chart", gens: Array(6).fill(A.e1Kutilma) },
      { n: "Binomial taqsimot", ic: "grid", gens: Array(6).fill(A.e1Binomial) },
    ],
  },
  {
    u: "4-bob. Matematik statistika", ic: "order", color: "purple",
    intro: {
      t: "Tanlanma nimani aytadi",
      v: ["x̄", "Me", "R"],
      d: "Tanlanmaning o'rta qiymati, medianasi va kengligi.",
    },
    lessons: [
      { n: "Tanlanma xarakteristikalari", ic: "order", gens: Array(6).fill(A.e1Namuna) },
      {
        n: "Yakuniy takrorlash", ic: "trophy",
        gens: [A.e1Kombinatorika, A.e1Klassik, A.e1TolaEhtimol, A.e1Bernulli, A.e1Kutilma, A.e1Namuna],
      },
    ],
  },
];

export const ehtimollik = withReviews(U);
