/**
 * 4-sinf — "Matematika 4-sinf" darsligi (Respublika ta'lim markazi).
 * Million gacha sonlar, ko'p xonali amallar, kasrlar, tezlik-vaqt-masofa, yuza.
 * 1-bob — 3-sinfni takrorlash.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../generators";

const U: Unit[] = [
  {
    u: "1-bob. Takrorlash: 1000 ichida amallar", ic: "repeat", color: "green",
    intro: { t: "3-sinfni takrorlaymiz", v: ["345", "+", "278"], d: "1000 ichida qo'shish-ayirish, ko'paytirish va amallar tartibini yodga olamiz." },
    lessons: [
      { n: "1000 ichida qo'shish", ic: "plus", gens: [() => G.gColumn("+", 1000), () => G.gColumn("+", 900), () => G.gColumn("+", 1000), () => G.gColumn("+", 800), () => G.gColumn("+", 1000), () => G.gColumn("+", 700)] },
      { n: "1000 ichida ayirish", ic: "minus", gens: [() => G.gColumn("−", 1000), () => G.gColumn("−", 900), () => G.gColumn("−", 1000), () => G.gColumn("−", 800), () => G.gColumn("−", 1000), () => G.gColumn("−", 700)] },
      { n: "Ko'paytirish va bo'lish", ic: "times", gens: [() => G.gMul(0, 10), () => G.gDiv(0, 10), G.g3MulBig, G.g3DivBig, G.gMulDiv, G.g3Rem] },
      { n: "Amallar tartibi", ic: "order", gens: [G.g4Order, G.g4Order, G.gParen, G.g4Order, G.gParenMul, G.g4Order] },
    ],
  },
  {
    u: "2-bob. Million gacha sonlar", ic: "blocks", color: "blue",
    intro: { t: "Katta sonlar olami", v: ["4", "·", "5678"], d: "Minglar sinfi va birliklar sinfi. Ko'p xonali sonlarni yasaymiz, taqqoslaymiz, yaxlitlaymiz." },
    lessons: [
      { n: "Sonni xonalaridan yasash", ic: "blocks", gens: Array(6).fill(G.g4Compose) },
      { n: "Minglar sinfi", ic: "search", gens: Array(6).fill(G.g4Class) },
      { n: "Katta sonlarni taqqoslash", ic: "scale", gens: Array(6).fill(G.g4Cmp) },
      { n: "Yaxlitlash", ic: "numline", gens: [G.g4Round, G.g4Round100, G.g4Round, G.g4Round100, G.g4Round, G.g4Round100] },
    ],
  },
  {
    u: "3-bob. Ko'p xonali sonlarni qo'shish va ayirish", ic: "plus", color: "orange",
    intro: { t: "Ustun shaklida hisoblaymiz", v: ["3456", "+", "2789"], d: "To'rt xonali sonlarni ustun shaklida qo'shamiz va ayiramiz." },
    lessons: [
      { n: "Ko'p xonali qo'shish", ic: "column", gens: [() => G.gColumn("+", 9000), () => G.gColumn("+", 8000), () => G.gColumn("+", 9000), () => G.gColumn("+", 7000), () => G.gColumn("+", 9000), () => G.gColumn("+", 6000)] },
      { n: "Ko'p xonali ayirish", ic: "minus", gens: [() => G.gColumn("−", 9000), () => G.gColumn("−", 8000), () => G.gColumn("−", 9000), () => G.gColumn("−", 7000), () => G.gColumn("−", 9000), () => G.gColumn("−", 6000)] },
      { n: "Aralash va tenglama", ic: "order", gens: [() => G.gColumn("+", 9000), () => G.gColumn("−", 9000), G.gEqx, () => G.gColumn("+", 8000), () => G.gColumn("−", 8000), G.gEqx] },
    ],
  },
  {
    u: "4-bob. Ko'p xonali sonlarni ko'paytirish", ic: "times", color: "purple",
    intro: { t: "Ko'paytiramiz", v: ["234", "×", "6"], d: "Ko'p xonali sonni bir xonaliga, yumaloq songa va ikki xonali sonlarga ko'paytiramiz." },
    lessons: [
      { n: "Uch xonali × bir xonali", ic: "times", gens: Array(6).fill(G.g4MulBig) },
      { n: "Yumaloq songa ko'paytirish", ic: "blocks", gens: Array(6).fill(G.g4Mul10) },
      { n: "Ikki xonali × ikki xonali", ic: "column", gens: Array(6).fill(G.g4Mul2) },
    ],
  },
  {
    u: "5-bob. Ko'p xonali sonlarni bo'lish", ic: "divide", color: "red",
    intro: { t: "Bo'lamiz", v: ["144", "÷", "12"], d: "Ko'p xonali sonlarni bir xonali va ikki xonali songa bo'lamiz, qoldiqni topamiz." },
    lessons: [
      { n: "Bir xonaliga bo'lish", ic: "divide", gens: Array(6).fill(G.g3DivBig) },
      { n: "Ikki xonaliga bo'lish", ic: "puzzle", gens: Array(6).fill(G.g4DivLong) },
      { n: "Qoldiqli bo'lish", ic: "puzzle", gens: Array(6).fill(G.g3Rem) },
    ],
  },
  {
    u: "6-bob. Ifodalar va tenglamalar", ic: "equals", color: "green",
    intro: { t: "Ifodalarni hisoblaymiz", v: ["(6", "+", "4)×3"], d: "Qavs, ko'paytirish-bo'lish, qo'shish-ayirish tartibi. Harfli ifodalar va tenglamalar." },
    lessons: [
      { n: "Amallar tartibi", ic: "order", gens: [G.g4Order, G.g4Order, G.gParen, G.g4Order, G.gParenMul, G.g4Order] },
      { n: "Harfli ifodalar", ic: "pencil", gens: Array(6).fill(G.gLetter) },
      { n: "Tenglamalar", ic: "equals", gens: Array(6).fill(G.gEqx) },
    ],
  },
  {
    u: "7-bob. Kasrlar", ic: "pie", color: "orange",
    intro: { t: "Kasrlar bilan ishlash", v: ["⅔", "+", "⅓"], d: "Bir xil maxrajli kasrlarni qo'shamiz va ayiramiz, kasrlarni taqqoslaymiz." },
    lessons: [
      { n: "Kasrlarni qo'shish", ic: "plus", gens: Array(6).fill(G.g4FracAdd) },
      { n: "Kasrlarni ayirish", ic: "minus", gens: Array(6).fill(G.g4FracSub) },
      { n: "Kasrlarni taqqoslash", ic: "scale", gens: Array(6).fill(G.gFracCmp) },
      { n: "Sonning ulushi", ic: "pie", gens: [G.gFracNum, G.gFracNum, G.gFrac, G.gFracNum, G.gFracNum, G.gFrac] },
    ],
  },
  {
    u: "8-bob. Kattaliklar va o'lchov birliklari", ic: "ruler", color: "blue",
    intro: { t: "O'lchaymiz", v: ["sm", "kg", "soat"], d: "Uzunlik, massa va yuza birliklari; vaqt: asr, yil, sutka, soat." },
    lessons: [
      { n: "Uzunlik va massa", ic: "ruler", gens: [G.g3Len, G.g3Mass, G.gMm, G.g3Len, G.g3Mass, G.gMm] },
      { n: "Yuza birliklari", ic: "grid", gens: Array(6).fill(G.g4Units) },
      { n: "Vaqt: asr, yil, sutka", ic: "clock", gens: [G.g4TimeBig, G.g4TimeBig, G.gClock, G.g4TimeBig, G.g4TimeBig, G.gClock] },
    ],
  },
  {
    u: "9-bob. Tezlik, vaqt, masofa", ic: "car", color: "purple",
    intro: { t: "Harakat masalalari", v: ["60", "×", "3"], d: "Masofa = tezlik × vaqt. Shu formuladan tezlik va vaqtni ham topamiz." },
    lessons: [
      { n: "Masofani topish", ic: "car", gens: Array(6).fill(() => G.g4Speed("s")) },
      { n: "Tezlikni topish", ic: "car", gens: Array(6).fill(() => G.g4Speed("v")) },
      { n: "Vaqtni topish", ic: "clock", gens: Array(6).fill(() => G.g4Speed("t")) },
      { n: "Aralash harakat masalalari", ic: "map", gens: Array(6).fill(() => G.g4Speed()) },
    ],
  },
  {
    u: "10-bob. Geometriya va yuza", ic: "shape", color: "red",
    intro: { t: "Yuza va perimetr", v: ["△", "◻", "◇"], d: "To'g'ri to'rtburchak yuzasi va perimetri, tomonni topish, shakllar va burchaklar." },
    lessons: [
      { n: "Yuzani hisoblash", ic: "grid", gens: [G.g4Area, G.g4Area, G.gArea, G.g4Area, G.gArea, G.g4Area] },
      { n: "Yuzadan tomonni topish", ic: "ruler", gens: Array(6).fill(G.g4AreaSide) },
      { n: "Perimetr va shakllar", ic: "shape", gens: [G.gPerim, G.gCorners, G.gPerim, G.gShape, G.gPerim, G.gCorners] },
    ],
  },
  {
    u: "11-bob. Ma'lumotlar va koordinata", ic: "chart", color: "green",
    intro: { t: "Ma'lumot bilan ishlash", v: ["📊"], d: "Jadval, diagramma va koordinata katakchalari bilan ishlaymiz." },
    lessons: [
      { n: "Jadval va diagramma", ic: "chart", gens: Array(6).fill(G.gData) },
      { n: "Koordinata", ic: "map", gens: Array(6).fill(G.gCoord) },
    ],
  },
  {
    u: "Takrorlash — Bosh sinov", ic: "trophy", color: "gold", final: true,
    intro: { t: "Hammasini sinaymiz!", v: ["★"], d: "Butun yil: million gacha sonlar, ko'p xonali amallar, kasr, tezlik, yuza, tenglama." },
    lessons: [
      { n: "Aralash sinov 1", ic: "trophy", gens: [G.g4Compose, G.g4Mul2, G.g4Order, G.g4FracAdd, () => G.g4Speed("s"), G.g4Area] },
      { n: "Aralash sinov 2", ic: "trophy", gens: [() => G.gColumn("+", 9000), G.g4DivLong, G.gParen, G.gFracCmp, G.g4Units, G.gEqx] },
      { n: "Aralash sinov 3", ic: "trophy", gens: [G.g4Cmp, G.g4MulBig, G.g4FracSub, () => G.g4Speed("v"), G.g4AreaSide, G.g4TimeBig] },
    ],
  },
];

export const grade4 = withReviews(U);
