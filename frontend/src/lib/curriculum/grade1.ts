/**
 * 1-sinf — eng boshlang'ich kurs.
 *
 * Muhim: bu yoshdagi bola HALI O'QIY OLMAYDI. Shuning uchun kurs matematikadan
 * emas, TANISHDAN boshlanadi — ranglar, hayvonlar, sanash. Bu darslarda javob
 * variantlari ham matn emas, rangli doira yoki katta rasm bo'ladi, ya'ni bola
 * ularni hech kimning yordamisiz yechadi.
 *
 * Keyin asta-sekin matematikaga o'tiladi: sanash → sonlar → 10 ichida amallar
 * → 20 → 100. Oxirgi boblar "Matematika 1-sinf" darsligi (Respublika ta'lim
 * markazi) tuzilishiga mos keladi.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../generators";

const U: Unit[] = [
  {
    u: "1-bob. Ranglar", ic: "palette", color: "red",
    intro: { t: "Ranglarni taniymiz", v: ["🔴", "🟡", "🔵"], d: "Qizil, sariq, ko'k, yashil. O'qish kerak emas — rangni tanlaysan." },
    lessons: [
      { n: "Rangni top", ic: "palette", gens: Array(6).fill(G.g1Rang) },
      { n: "Rang nomi", ic: "palette", gens: Array(6).fill(G.g1RangNom) },
      { n: "Ranglar aralash", ic: "palette", gens: [G.g1Rang, G.g1RangNom, G.g1Rang, G.g1RangNom, G.g1Rang, G.g1RangNom] },
    ],
  },
  {
    u: "2-bob. Hayvonlar", ic: "search", color: "green",
    intro: { t: "Hayvonlarni taniymiz", v: ["🐶", "🐱", "🐘"], d: "It, mushuk, quyon, fil. Xuddi shunisini topamiz." },
    lessons: [
      { n: "Xuddi shunisini top", ic: "search", gens: Array(6).fill(G.g1Hayvon) },
      { n: "Hayvon nomi", ic: "search", gens: Array(6).fill(G.g1HayvonNom) },
      { n: "Qaysi biri boshqacha", ic: "puzzle", gens: Array(6).fill(G.g1HayvonOrtiq) },
      { n: "Katta va kichik", ic: "scale", gens: Array(6).fill(G.g1KattaKichik) },
    ],
  },
  {
    u: "3-bob. Sanash", ic: "count", color: "orange",
    intro: { t: "Sanashni boshlaymiz", v: ["1", "2", "3"], d: "Avval 5 tagacha, keyin 10 tagacha sanaymiz." },
    lessons: [
      { n: "5 tagacha sanash", ic: "count", gens: Array(6).fill(() => G.g1HayvonSana(5)) },
      { n: "10 tagacha sanash", ic: "count", gens: Array(6).fill(() => G.g1Count(10)) },
      { n: "Ko'p va kam", ic: "scale", gens: Array(6).fill(G.g1CmpVis) },
      { n: "Ortiqchasini top", ic: "puzzle", gens: Array(6).fill(G.g1Odd) },
    ],
  },
  {
    u: "4-bob. Qayerda turibdi", ic: "map", color: "blue",
    intro: { t: "Yuqorida — pastda", v: ["↑", "↓", "←"], d: "Yuqorida, pastda, o'ngda, chapda, o'rtada." },
    lessons: [
      { n: "Yuqorida — pastda", ic: "map", gens: Array(6).fill(G.g1Pos) },
      { n: "O'ngda — chapda", ic: "map", gens: Array(6).fill(G.g1Pos) },
    ],
  },
  {
    u: "5-bob. 1 dan 10 gacha sonlar", ic: "numline", color: "purple",
    intro: { t: "Sonlarni taniymiz", v: ["1", "…", "10"], d: "Sonlar nuri, katta va kichik son, sonlar tarkibi." },
    lessons: [
      { n: "Sonlar nuri", ic: "numline", gens: Array(6).fill(() => G.gRay(10)) },
      { n: "Keyingi son", ic: "numline", gens: Array(6).fill(() => G.g1NextPrev(10)) },
      { n: "Qaysi son katta", ic: "scale", gens: Array(6).fill(() => G.g1Cmp(10)) },
      { n: "Sonlar tarkibi", ic: "puzzle", gens: Array(6).fill(() => G.g1Compose(10)) },
    ],
  },
  {
    u: "6-bob. 10 ichida qo'shish va ayirish", ic: "plus", color: "green",
    intro: { t: "Qo'shamiz va ayiramiz", v: ["3", "+", "4"], d: "10 ichida qo'shish, ayirish va ikkalasi aralash." },
    lessons: [
      { n: "10 ichida qo'shish", ic: "plus", gens: Array(6).fill(G.g1Add10) },
      { n: "10 ichida ayirish", ic: "minus", gens: Array(6).fill(G.g1Sub10) },
      { n: "Qo'sh va ayir", ic: "order", gens: [G.g1Add10, G.g1Sub10, G.g1Add10, G.g1Sub10, G.g1Add10, G.g1Sub10] },
    ],
  },
  {
    u: "7-bob. Geometrik shakllar", ic: "shape", color: "purple",
    intro: { t: "Shakllarni taniymiz", v: ["△", "◻", "○"], d: "Doira, uchburchak, kvadrat. Burchaklarini sanaymiz." },
    lessons: [
      { n: "Shakllar nomi", ic: "shape", gens: Array(6).fill(G.gShape) },
      { n: "Burchaklarni sanash", ic: "ruler", gens: Array(6).fill(G.gCorners) },
    ],
  },
  {
    u: "8-bob. 11 dan 20 gacha sonlar", ic: "blocks", color: "orange",
    intro: { t: "O'nlikdan keyin", v: ["1", "o'nlik"], d: "11–20: bitta dasta va yakka tayoqchalar." },
    lessons: [
      { n: "Dasta va tayoqcha", ic: "blocks", gens: Array(6).fill(() => G.g1Tens(1)) },
      { n: "11–20 taqqoslash", ic: "scale", gens: Array(6).fill(() => G.g1Cmp(20)) },
      { n: "20 ichida qo'shish", ic: "plus", gens: Array(6).fill(G.g1Add20) },
      { n: "20 ichida ayirish", ic: "minus", gens: Array(6).fill(G.g1Sub20) },
    ],
  },
  {
    u: "9-bob. 100 gacha sonlar", ic: "column", color: "blue",
    intro: { t: "Yuzgacha sanaymiz", v: ["10", "…", "100"], d: "O'nliklar va birliklar, 100 ichida qo'shish-ayirish." },
    lessons: [
      { n: "O'nliklar va birliklar", ic: "blocks", gens: Array(6).fill(() => G.g1Tens(9)) },
      { n: "Sonlar nuri (100 gacha)", ic: "numline", gens: Array(6).fill(() => G.gRay(100)) },
      { n: "O'nliklarni qo'shish", ic: "plus", gens: Array(6).fill(G.g1AddTens) },
      { n: "100 ichida qo'shish", ic: "plus", gens: Array(6).fill(G.g1Add100) },
      { n: "100 ichida ayirish", ic: "minus", gens: Array(6).fill(G.g1Sub100) },
    ],
  },
  {
    u: "10-bob. Jadval", ic: "chart", color: "purple",
    intro: { t: "Rasmli jadval", v: ["📊"], d: "Jadvaldan eng ko'pini topamiz va sanaymiz." },
    lessons: [
      { n: "Rasmli jadval", ic: "chart", gens: Array(6).fill(G.gData) },
    ],
  },
  {
    u: "Takrorlash — Bosh sinov", ic: "trophy", color: "gold", final: true,
    intro: { t: "Hammasini sinaymiz!", v: ["★"], d: "Ranglar, hayvonlar, sanash, 10 va 20 ichida amallar, 100 gacha sonlar." },
    lessons: [
      { n: "Aralash sinov 1", ic: "trophy", gens: [G.g1Rang, G.g1Hayvon, () => G.g1Count(10), G.g1Add10, G.gShape, () => G.g1Cmp(20)] },
      { n: "Aralash sinov 2", ic: "trophy", gens: [G.g1RangNom, G.g1KattaKichik, G.g1CmpVis, G.g1Sub20, () => G.g1Tens(9), G.g1Add100] },
    ],
  },
];

export const grade1 = withReviews(U);
