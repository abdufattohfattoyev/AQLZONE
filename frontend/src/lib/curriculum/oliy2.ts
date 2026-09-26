/**
 * OLIY MATEMATIKA · 2-kurs — talabalar kursi (kod 302).
 *
 * Manba: OTMlar "Oliy matematika" ishchi dasturining 2-semestri —
 * ko'p o'zgaruvchili funksiyalar, karrali integrallar, sonli va
 * funksional qatorlar, oddiy differensial tenglamalar.
 *
 * Anketada 2-kurs va undan yuqori talabalar ko'pchilik (56 dan 49 tasi),
 * ular uchun 1-kurs mavzulari takrorlash, bu esa o'z semestri.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as A from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. Ko'p o'zgaruvchili funksiyalar", ic: "chart", color: "blue",
    intro: {
      t: "Ikki o'zgaruvchi — ikki yo'nalish",
      v: ["∂f/∂x", "∂f/∂y", "grad"],
      d: "Xususiy hosila: bitta o'zgaruvchi o'zgaradi, qolgani o'zgarmas turadi.",
    },
    lessons: [
      { n: "x bo'yicha xususiy hosila", ic: "chart", gens: Array(6).fill(A.o2XususiyX) },
      { n: "y bo'yicha xususiy hosila", ic: "chart", gens: Array(6).fill(A.o2XususiyY) },
      { n: "Gradient", ic: "angle", gens: Array(6).fill(A.o2Gradient) },
      { n: "Ikki o'zgaruvchili funksiya ekstremumi", ic: "trophy", gens: Array(6).fill(A.o2Ekstremum) },
    ],
  },
  {
    u: "2-bob. Karrali integrallar", ic: "pie", color: "green",
    intro: {
      t: "Hajm va yuza integrali",
      v: ["∬", "dx dy", "S"],
      d: "Ikki karrali integral ketma-ket ikkita oddiy integral sifatida hisoblanadi.",
    },
    lessons: [
      { n: "To'g'ri to'rtburchak bo'yicha integral", ic: "grid", gens: Array(6).fill(A.o2IkkiKarrali) },
      { n: "Ko'paytmaning karrali integrali", ic: "times", gens: Array(6).fill(A.o2KarraliKopaytma) },
      { n: "Soha yuzi", ic: "shape", gens: Array(6).fill(A.o2SohaYuzi) },
    ],
  },
  {
    u: "3-bob. Qatorlar", ic: "repeat", color: "orange",
    intro: {
      t: "Cheksiz yig'indilar",
      v: ["Σ", "R", "n!"],
      d: "Qator qachon yaqinlashadi, darajali qator qayerda ishlaydi va funksiyani qatorga yoyish.",
    },
    lessons: [
      { n: "Sonli qatorlarning yaqinlashishi", ic: "search", gens: Array(6).fill(A.o2QatorTanlash) },
      { n: "Yaqinlashish radiusi", ic: "circle", gens: Array(6).fill(A.o2Radius) },
      { n: "Makloren qatori", ic: "power", gens: Array(6).fill(A.o2Teylor) },
    ],
  },
  {
    u: "4-bob. Differensial tenglamalar", ic: "equals", color: "purple",
    intro: {
      t: "Noma'lum — funksiya",
      v: ["y′", "y″", "k²"],
      d: "O'zgaruvchilari ajraladigan tenglamalar va o'zgarmas koeffitsiyentli ikkinchi tartibli tenglamalar.",
    },
    lessons: [
      { n: "O'zgaruvchilari ajraladigan tenglamalar", ic: "divide", gens: Array(6).fill(A.o2Ajraladigan) },
      { n: "Xarakteristik tenglama", ic: "equals", gens: Array(6).fill(A.o2Xarakteristik) },
      { n: "Umumiy yechim", ic: "puzzle", gens: Array(6).fill(A.o2UmumiyYechim) },
      {
        n: "Yakuniy takrorlash", ic: "trophy",
        gens: [A.o2XususiyX, A.o2IkkiKarrali, A.o2Radius, A.o2Teylor, A.o2Xarakteristik, A.o2UmumiyYechim],
      },
    ],
  },
];

export const oliy2 = withReviews(U);
