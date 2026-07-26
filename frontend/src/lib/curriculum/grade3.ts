/**
 * 3-sinf — "Matematika 3-sinf" darsligi (Respublika ta'lim markazi).
 * Boblar darslik ketma-ketligiga mos. 1-bob — 2-sinfni takrorlash.
 * Har bir bob oxiriga "Bob takrorlash" avtomatik qo'shiladi (withReviews).
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../generators";

const U: Unit[] = [
  {
    u: "1-bob. Takrorlash: 100 ichida amallar", ic: "repeat", color: "green",
    intro: { t: "2-sinfni takrorlaymiz", v: ["47", "+", "38"], d: "100 ichida qo'shish-ayirishni va ko'paytirish jadvalini yodga olamiz." },
    lessons: [
      { n: "100 ichida qo'shish", ic: "plus", gens: [() => G.gColumn("+", 100), () => G.gAddOver2(100), () => G.gColumn("+", 90), () => G.gAddOver2(100), () => G.gColumn("+", 100), () => G.gAddOver2(90)] },
      { n: "100 ichida ayirish", ic: "minus", gens: [() => G.gColumn("−", 100), () => G.gSubOver2(100), () => G.gColumn("−", 90), () => G.gSubOver2(100), () => G.gColumn("−", 100), () => G.gSubOver2(90)] },
      { n: "Ko'paytirish jadvali", ic: "times", gens: [() => G.gMul(0, 10), () => G.gMul(0, 10), G.gMulSum, () => G.gMul(0, 9), () => G.gMul(0, 10), G.gMulSum] },
      { n: "Bo'lish jadvali", ic: "divide", gens: [() => G.gDiv(0, 10), () => G.gDiv(0, 10), G.gMulDiv, () => G.gDiv(0, 9), G.gMulDiv, () => G.gDiv(0, 10)] },
    ],
  },
  {
    u: "2-bob. 1000 ichida sonlar", ic: "blocks", color: "blue",
    intro: { t: "Uch xonali sonlar", v: ["3", "·", "45"], d: "Yuzlik, o'nlik va birlikdan sonlar yasaymiz, taqqoslaymiz va yaxlitlaymiz." },
    lessons: [
      { n: "Sonni xonalaridan yasash", ic: "blocks", gens: Array(6).fill(G.g3Compose) },
      { n: "Xonalarni ajratish", ic: "search", gens: [G.g3Split, G.g3Split, G.gPlace, G.g3Split, G.gPlace, G.g3Split] },
      { n: "1000 ichida taqqoslash", ic: "scale", gens: Array(6).fill(G.g3Cmp) },
      { n: "Yaxlitlash · sonlar nuri", ic: "numline", gens: [G.g3Round, () => G.gRay(1000), G.g3Round100, () => G.gRay(500), G.g3Round, G.g3Round100] },
    ],
  },
  {
    u: "3-bob. 1000 ichida qo'shish va ayirish", ic: "plus", color: "orange",
    intro: { t: "Ustun shaklida hisoblaymiz", v: ["345", "+", "278"], d: "Uch xonali sonlarni ustun shaklida — xonama-xona qo'shamiz va ayiramiz." },
    lessons: [
      { n: "1000 ichida qo'shish", ic: "column", gens: [() => G.gColumn("+", 1000), () => G.gColumn("+", 900), () => G.gColumn("+", 1000), () => G.gColumn("+", 800), () => G.gColumn("+", 1000), () => G.gColumn("+", 700)] },
      { n: "1000 ichida ayirish", ic: "minus", gens: [() => G.gColumn("−", 1000), () => G.gColumn("−", 900), () => G.gColumn("−", 1000), () => G.gColumn("−", 800), () => G.gColumn("−", 1000), () => G.gColumn("−", 700)] },
      { n: "Aralash: qo'sh va ayir", ic: "order", gens: [() => G.gColumn("+", 1000), () => G.gColumn("−", 1000), () => G.gColumn("+", 900), () => G.gColumn("−", 900), () => G.gColumn("+", 1000), () => G.gColumn("−", 1000)] },
      { n: "Noma'lumni topish", ic: "equals", gens: Array(6).fill(G.gEqx) },
    ],
  },
  {
    u: "4-bob. Ko'p xonali sonlarni ko'paytirish va bo'lish", ic: "times", color: "purple",
    intro: { t: "Bir xonaliga ko'paytiramiz", v: ["124", "×", "3"], d: "Ko'p xonali sonni bir xonali songa ko'paytiramiz va bo'lamiz, qoldiqni topamiz." },
    lessons: [
      { n: "Ko'p xonali × bir xonali", ic: "times", gens: Array(6).fill(G.g3MulBig) },
      { n: "Ko'p xonali ÷ bir xonali", ic: "divide", gens: Array(6).fill(G.g3DivBig) },
      { n: "Qoldiqli bo'lish", ic: "puzzle", gens: Array(6).fill(G.g3Rem) },
      { n: "Ko'paytirish va bo'lish bog'liqligi", ic: "repeat", gens: [G.gMulDiv, G.gMulDiv, G.g3MulBig, G.g3DivBig, G.gMulDiv, G.g3DivBig] },
    ],
  },
  {
    u: "5-bob. Amallar tartibi", ic: "order", color: "red",
    intro: { t: "Qaysi amal avval?", v: ["24", "−", "3×5"], d: "Avval ko'paytirish va bo'lish, keyin qo'shish va ayirish. Qavs bo'lsa — avval qavs!" },
    lessons: [
      { n: "Ko'paytir, keyin qo'sh/ayir", ic: "order", gens: [G.g3Order, G.g3Order, G.gParenMul, G.g3Order, G.gParenMul, G.g3Order] },
      { n: "Bo'l, keyin qo'sh", ic: "divide", gens: Array(6).fill(G.g3OrderDiv) },
      { n: "Qavsli ifodalar", ic: "equals", gens: [G.gParen, G.gParen, G.gParenMul, G.gParen, G.gParenMul, G.gParen] },
    ],
  },
  {
    u: "6-bob. Geometrik shakllar", ic: "shape", color: "green",
    intro: { t: "Perimetr va yuza", v: ["△", "◻", "◇"], d: "Shakllarni taniymiz, perimetrni hisoblaymiz va katakli daftarda yuzani topamiz." },
    lessons: [
      { n: "Perimetr", ic: "ruler", gens: Array(6).fill(G.gPerim) },
      { n: "Katakli yuza", ic: "grid", gens: Array(6).fill(G.gArea) },
      { n: "Shakllarni tanish", ic: "shape", gens: Array(6).fill(G.gShape) },
      { n: "Burchaklar", ic: "ruler", gens: [G.gCorners, G.gCorners, G.gShape, G.gCorners, G.gCorners, G.gShape] },
    ],
  },
  {
    u: "7-bob. Kasrlar (ulushlar)", ic: "pie", color: "orange",
    intro: { t: "Butunning bo'laklari", v: ["½", "⅓", "¼"], d: "Butunni teng bo'laklarga bo'lamiz: yarmi, uchdan biri, choragi." },
    lessons: [
      { n: "Ulushni tanish", ic: "pie", gens: Array(6).fill(G.gFrac) },
      { n: "Sonning ulushi", ic: "puzzle", gens: Array(6).fill(G.gFracNum) },
      { n: "Ulushlarni taqqoslash", ic: "scale", gens: Array(6).fill(G.gFracCmp) },
    ],
  },
  {
    u: "8-bob. Kattaliklar: uzunlik, massa, vaqt", ic: "ruler", color: "blue",
    intro: { t: "O'lchov birliklari", v: ["sm", "kg", "soat"], d: "Millimetr, santimetr, metr, kilometr; gramm va kilogramm; soat va vaqt birliklari." },
    lessons: [
      { n: "Uzunlik birliklari", ic: "ruler", gens: [G.g3Len, G.gMm, G.g3Len, G.gMm, G.g3Len, G.gMm] },
      { n: "Massa birliklari", ic: "scale", gens: Array(6).fill(G.g3Mass) },
      { n: "Vaqt birliklari", ic: "clock", gens: Array(6).fill(G.gTime) },
      { n: "Soatni o'qish", ic: "clock", gens: Array(6).fill(G.gClock) },
    ],
  },
  {
    u: "9-bob. Tenglama va ma'lumotlar", ic: "equals", color: "purple",
    intro: { t: "Noma'lumni topamiz", v: ["x", "+", "5"], d: "Tenglamalarda noma'lumni topamiz, harfli ifodalar, jadval va koordinata bilan ishlaymiz." },
    lessons: [
      { n: "Tenglamalar", ic: "equals", gens: Array(6).fill(G.gEqx) },
      { n: "Harfli ifodalar", ic: "pencil", gens: Array(6).fill(G.gLetter) },
      { n: "Jadval va koordinata", ic: "chart", gens: [G.gData, G.gCoord, G.gData, G.gCoord, G.gData, G.gCoord] },
    ],
  },
  {
    u: "Takrorlash — Bosh sinov", ic: "trophy", color: "gold", final: true,
    intro: { t: "Hammasini sinaymiz!", v: ["★"], d: "Butun yil o'rganganingiz: 1000 ichida amallar, ko'paytirish, kasr, perimetr, tenglama." },
    lessons: [
      { n: "Aralash sinov 1", ic: "trophy", gens: [() => G.gColumn("+", 1000), G.g3MulBig, G.g3Order, G.gFracNum, G.gPerim, G.gEqx] },
      { n: "Aralash sinov 2", ic: "trophy", gens: [() => G.gColumn("−", 1000), G.g3DivBig, G.gParen, G.gFracCmp, G.g3Len, G.gCoord] },
      { n: "Aralash sinov 3", ic: "trophy", gens: [G.g3Compose, G.g3Rem, G.g3OrderDiv, G.gArea, G.g3Mass, G.gClock] },
    ],
  },
];

export const grade3 = withReviews(U);
