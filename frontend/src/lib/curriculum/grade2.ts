/**
 * 2-sinf — "Matematika 2-sinf" darsligi (Respublika ta'lim markazi).
 * 100 ichida amallar, ko'paytirish-bo'lish ma'nosi va jadvali, geometriya,
 * ulushlar, o'lchov birliklari, tenglama.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../generators";

const U: Unit[] = [
  {
    u: "1-bob. 100 ichida qo'shish", ic: "plus", color: "green",
    intro: { t: "100 ichida qo'shamiz", v: ["47", "+", "38"], d: "O'nlikdan o'tib qo'shishni va ustun shaklini o'rganamiz." },
    lessons: [
      { n: "Sonlar nuri", ic: "numline", gens: [() => G.gRay(100), () => G.gRay(100), G.gPlace, () => G.gRay(100), G.gPlace, () => G.gRay(100)] },
      { n: "Ikki xonali sonlar", ic: "blocks", gens: [G.gPlace, G.gPlace, () => G.gRay(100), G.gPlace, () => G.gRay(100), G.gPlace] },
      { n: "O'nlikdan o'tib qo'shish", ic: "plus", gens: Array(6).fill(() => G.gAddOver2(100)) },
      { n: "Ustun shaklida qo'shish", ic: "column", gens: [() => G.gColumn("+", 100), () => G.gColumn("+", 90), () => G.gColumn("+", 100), () => G.gColumn("+", 80), () => G.gColumn("+", 100), () => G.gColumn("+", 70)] },
    ],
  },
  {
    u: "2-bob. 100 ichida ayirish", ic: "minus", color: "orange",
    intro: { t: "100 ichida ayiramiz", v: ["62", "−", "27"], d: "O'nlikni buzib ayirishni va ustun shaklini o'rganamiz." },
    lessons: [
      { n: "O'nlikdan o'tib ayirish", ic: "minus", gens: Array(6).fill(() => G.gSubOver2(100)) },
      { n: "Ustun shaklida ayirish", ic: "column", gens: [() => G.gColumn("−", 100), () => G.gColumn("−", 90), () => G.gColumn("−", 100), () => G.gColumn("−", 80), () => G.gColumn("−", 100), () => G.gColumn("−", 70)] },
      { n: "Aralash: qo'sh va ayir", ic: "order", gens: [() => G.gColumn("+", 100), () => G.gColumn("−", 100), () => G.gAddOver2(100), () => G.gSubOver2(100), () => G.gColumn("+", 90), () => G.gColumn("−", 90)] },
    ],
  },
  {
    u: "3-bob. Ko'paytirishning ma'nosi", ic: "times", color: "purple",
    intro: { t: "Ko'paytirish nima?", v: ["3", "×", "4"], d: "Bir xil qo'shiluvchilar yig'indisi — bu ko'paytma." },
    lessons: [
      { n: "Teng guruhlar", ic: "count", gens: Array(6).fill(G.gMulVis) },
      { n: "Yig'indidan ko'paytmaga", ic: "times", gens: Array(6).fill(G.gMulSum) },
      { n: "Ko'paytirish jadvali", ic: "times", gens: [() => G.gMul(0, 10), () => G.gMul(0, 9), () => G.gMul(0, 10), () => G.gMul(0, 8), () => G.gMul(0, 10), () => G.gMul(0, 9)] },
    ],
  },
  {
    u: "4-bob. Bo'lish", ic: "divide", color: "blue",
    intro: { t: "Teng bo'laklarga bo'lamiz", v: ["12", "÷", "3"], d: "Bo'lish — teng guruhlarga ajratish. Ko'paytirish bilan bog'liq." },
    lessons: [
      { n: "Teng bo'lish", ic: "count", gens: Array(6).fill(G.gDivVis) },
      { n: "Bo'lish jadvali", ic: "divide", gens: [() => G.gDiv(0, 10), () => G.gDiv(0, 9), () => G.gDiv(0, 10), () => G.gDiv(0, 8), () => G.gDiv(0, 10), () => G.gDiv(0, 9)] },
      { n: "Ko'paytirish va bo'lish bog'liqligi", ic: "repeat", gens: Array(6).fill(G.gMulDiv) },
    ],
  },
  {
    u: "5-bob. Amallar tartibi", ic: "order", color: "red",
    intro: { t: "Qaysi amal avval?", v: ["4×3", "+", "5"], d: "Avval ko'paytirish, keyin qo'shish. Qavs bo'lsa — avval qavs." },
    lessons: [
      { n: "Qavsli ifodalar", ic: "equals", gens: Array(6).fill(G.gParen) },
      { n: "Ko'paytir, keyin qo'sh", ic: "order", gens: Array(6).fill(G.gParenMul) },
    ],
  },
  {
    u: "6-bob. Geometrik shakllar", ic: "shape", color: "green",
    intro: { t: "Shakllar va perimetr", v: ["△", "◻", "◇"], d: "Shakllarni taniymiz, burchaklarini sanaymiz, perimetr va yuzani topamiz." },
    lessons: [
      { n: "Shakllarni tanish", ic: "shape", gens: Array(6).fill(G.gShape) },
      { n: "Burchaklar", ic: "ruler", gens: Array(6).fill(G.gCorners) },
      { n: "Perimetr", ic: "ruler", gens: Array(6).fill(G.gPerim) },
      { n: "Katakli yuza", ic: "grid", gens: Array(6).fill(G.gArea) },
    ],
  },
  {
    u: "7-bob. Ulushlar", ic: "pie", color: "orange",
    intro: { t: "Butunning bo'laklari", v: ["½", "⅓", "¼"], d: "Yarmi, uchdan biri, choragi — butunni teng bo'lamiz." },
    lessons: [
      { n: "Ulushni tanish", ic: "pie", gens: Array(6).fill(G.gFrac) },
      { n: "Sonning ulushi", ic: "puzzle", gens: Array(6).fill(G.gFracNum) },
    ],
  },
  {
    u: "8-bob. O'lchov va vaqt", ic: "ruler", color: "blue",
    intro: { t: "O'lchaymiz", v: ["sm", "mm", "soat"], d: "Santimetr va millimetr, soat va vaqt birliklari." },
    lessons: [
      { n: "Santimetr va millimetr", ic: "ruler", gens: Array(6).fill(G.gMm) },
      { n: "Soatni o'qish", ic: "clock", gens: Array(6).fill(G.gClock) },
      { n: "Vaqt birliklari", ic: "clock", gens: Array(6).fill(G.gTime) },
    ],
  },
  {
    u: "9-bob. Tenglama va ma'lumotlar", ic: "equals", color: "purple",
    intro: { t: "Noma'lumni topamiz", v: ["x", "+", "5"], d: "Tenglama, harfli ifoda, jadval va koordinata." },
    lessons: [
      { n: "Tenglamalar", ic: "equals", gens: Array(6).fill(G.gEqx) },
      { n: "Harfli ifodalar", ic: "pencil", gens: Array(6).fill(G.gLetter) },
      { n: "Jadval va koordinata", ic: "chart", gens: [G.gData, G.gCoord, G.gData, G.gCoord, G.gData, G.gCoord] },
    ],
  },
  {
    u: "Takrorlash — Bosh sinov", ic: "trophy", color: "gold", final: true,
    intro: { t: "Hammasini sinaymiz!", v: ["★"], d: "Butun yil: qo'shish-ayirish, ko'paytirish-bo'lish, shakllar, ulush, vaqt." },
    lessons: [
      { n: "Aralash sinov 1", ic: "trophy", gens: [() => G.gColumn("+", 100), () => G.gMul(0, 10), G.gParenMul, G.gFracNum, G.gPerim, G.gEqx] },
      { n: "Aralash sinov 2", ic: "trophy", gens: [() => G.gColumn("−", 100), () => G.gDiv(0, 10), G.gParen, G.gShape, G.gMm, G.gClock] },
    ],
  },
];

export const grade2 = withReviews(U);
