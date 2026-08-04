/**
 * 5-sinf — B. Q. Xaydarov, "Matematika 5-sinf", 1- va 2-qism (2020).
 *
 * Boblar darslikning O'Z tartibida: natural sonlar → ko'paytirish-bo'lish
 * → matnli masalalar → geometriya va yuza → oddiy kasrlar → fazoviy
 * shakllar → o'nli kasrlar va foiz → ma'lumotlar tahlili. Darslikda
 * bitta bobga o'ttizga yaqin bet to'g'ri keladi, shuning uchun katta
 * boblar shu yerda ikkiga bo'lingan — ilovada bir bob bir o'tirishda
 * tugaydigan yo'l bo'lishi kerak, aks holda xarita cho'zilib ketadi.
 *
 * 1-bob — 4-sinfni takrorlash.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../generators";

const U: Unit[] = [
  {
    u: "1-bob. Takrorlash: 4-sinf materiali", ic: "repeat", color: "green",
    intro: { t: "4-sinfni yodga olamiz", v: ["3456", "+", "2789"], d: "Ko'p xonali amallar, amallar tartibi, kasr va kattaliklarni takrorlaymiz." },
    lessons: [
      { n: "Ko'p xonali qo'shish va ayirish", ic: "column", gens: [() => G.gColumn("+", 9000), () => G.gColumn("−", 9000), () => G.gColumn("+", 8000), () => G.gColumn("−", 8000), () => G.gColumn("+", 9000), () => G.gColumn("−", 7000)] },
      { n: "Ko'paytirish va bo'lish", ic: "times", gens: [G.g4Mul2, G.g4DivLong, G.g4MulBig, G.g3Rem, G.g4Mul2, G.g4DivLong] },
      { n: "Amallar tartibi", ic: "order", gens: [G.g4Order, G.gParen, G.g4Order, G.gParenMul, G.g4Order, G.gEqx] },
      { n: "Kasr va kattaliklar", ic: "ruler", gens: [G.g4FracAdd, G.g4Units, G.gFracCmp, G.g4TimeBig, G.g4FracSub, G.g4Units] },
    ],
  },
  {
    u: "2-bob. Natural sonlar va nol", ic: "blocks", color: "blue",
    intro: { t: "Natural sonlar olami", v: ["0", "1", "2"], d: "Natural sonlar qatori, shkalalar va sonlar nuri, taqqoslash va yaxlitlash." },
    lessons: [
      { n: "Natural sonlar qatori", ic: "numline", gens: Array(6).fill(G.g5Natural) },
      { n: "Shkalalar va sonlar nuri", ic: "ruler", gens: Array(6).fill(() => G.gRay(1000)) },
      { n: "Natural sonlarni taqqoslash", ic: "scale", gens: Array(6).fill(G.g5Cmp) },
      { n: "Natural sonlarni yaxlitlash", ic: "numline", gens: Array(6).fill(G.g5Round) },
    ],
  },
  {
    u: "3-bob. Natural sonlarni qo'shish va ayirish", ic: "plus", color: "orange",
    intro: { t: "Katta sonlar bilan", v: ["45678", "+", "9876"], d: "Besh xonali sonlarni qo'shamiz va ayiramiz, harfli ifoda va tenglamalarni yechamiz." },
    lessons: [
      { n: "Natural sonlarni qo'shish", ic: "plus", gens: Array(6).fill(G.g5Add) },
      { n: "Natural sonlarni ayirish", ic: "minus", gens: Array(6).fill(G.g5Sub) },
      { n: "Sonli va harfli ifodalar", ic: "pencil", gens: [G.g5Expr, G.gLetter, G.g5Expr, G.g5Expr, G.gLetter, G.g5Expr] },
      { n: "Matematik masala va tenglamalar", ic: "equals", gens: Array(6).fill(G.g5Eq) },
    ],
  },
  {
    u: "4-bob. Natural sonlarni ko'paytirish va bo'lish", ic: "times", color: "purple",
    intro: { t: "Ko'paytiramiz va bo'lamiz", v: ["234", "×", "56"], d: "Uch xonalini ikki xonaliga ko'paytirish, bo'lish, qoldiqli bo'lish va qulay hisoblash." },
    lessons: [
      { n: "Natural sonlarni ko'paytirish", ic: "times", gens: Array(6).fill(G.g5Mul) },
      { n: "Natural sonlarni bo'lish", ic: "divide", gens: Array(6).fill(G.g5Div) },
      { n: "Qoldiqli bo'lish", ic: "puzzle", gens: Array(6).fill(G.g5Rem) },
      { n: "Qulay va tezkor hisoblash", ic: "flame", gens: Array(6).fill(G.g5Fast) },
      { n: "Ifodalarni soddalashtirish", ic: "pencil", gens: Array(6).fill(G.g5Simplify) },
    ],
  },
  {
    u: "5-bob. To'rt amal va daraja", ic: "power", color: "red",
    intro: { t: "Daraja bilan tanishamiz", v: ["5", "²", "= 25"], d: "To'rt amalga doir hisoblash algoritmi, sonning kvadrati, kubi va darajasi." },
    lessons: [
      { n: "To'rt amalga doir hisoblash", ic: "order", gens: Array(6).fill(G.g5Order4) },
      { n: "Sonning kvadrati va kubi", ic: "power", gens: Array(6).fill(G.g5Pow) },
      { n: "Daraja va amallar tartibi", ic: "order", gens: [G.g5Pow, G.g5Order4, G.g5Pow, G.g5Order4, G.g5Pow, G.g5Order4] },
    ],
  },
  {
    u: "6-bob. Matnli masalalarni yechish", ic: "map", color: "green",
    intro: { t: "Masala yechamiz", v: ["60", "×", "3"], d: "Qismlarga, geometriyaga, harakatga, savdoga va bajarilgan ishga doir masalalar." },
    lessons: [
      { n: "Qismlarga doir masalalar", ic: "puzzle", gens: Array(6).fill(G.g5Part) },
      { n: "Geometrik mazmundagi masalalar", ic: "grid", gens: [G.g5Rect, G.g4AreaSide, G.gPerim, G.g5Rect, G.g4AreaSide, G.gPerim] },
      { n: "Harakatga doir masalalar", ic: "car", gens: [() => G.g4Speed("s"), () => G.g4Speed("v"), () => G.g4Speed("t"), () => G.g4Speed(), () => G.g4Speed("s"), () => G.g4Speed()] },
      { n: "Ikki jism harakatiga doir masalalar", ic: "map", gens: Array(6).fill(G.g5Two) },
      { n: "Iqtisodiy mazmundagi masalalar", ic: "coin", gens: Array(6).fill(G.g5Money) },
      { n: "Bajarilgan ishga doir masalalar", ic: "clock", gens: Array(6).fill(G.g5Work) },
    ],
  },
  {
    u: "7-bob. Burchaklar va siniq chiziq", ic: "angle", color: "blue",
    intro: { t: "Burchaklar olami", v: ["∠", "90°", "180°"], d: "Burchak turlari, burchaklarni qo'shish, siniq chiziq va ko'pburchak perimetri." },
    lessons: [
      { n: "Burchaklar va ularning turlari", ic: "angle", gens: Array(6).fill(G.g5Angle) },
      { n: "Burchaklarni o'lchash va qo'shish", ic: "scale", gens: Array(6).fill(G.g5AngleSum) },
      { n: "Siniq chiziq va uning uzunligi", ic: "numline", gens: Array(6).fill(G.g5Broken) },
      { n: "Ko'pburchak perimetri", ic: "shape", gens: [G.g5PerimN, G.gPerim, G.g5PerimN, G.gShape, G.g5PerimN, G.gCorners] },
    ],
  },
  {
    u: "8-bob. Yuza va yuz o'lchov birliklari", ic: "grid", color: "orange",
    intro: { t: "Yuzani hisoblaymiz", v: ["S", "=", "a × b"], d: "To'g'ri to'rtburchak yuzi, murakkab shakllar yuzi va yuz o'lchov birliklari." },
    lessons: [
      { n: "To'g'ri to'rtburchakning yuzi", ic: "grid", gens: [G.g5Rect, G.g4Area, G.g5Rect, G.g4AreaSide, G.g5Rect, G.gArea] },
      { n: "Murakkab shakllarning yuzi", ic: "puzzle", gens: Array(6).fill(G.g5AreaSum) },
      { n: "Yuz o'lchov birliklari", ic: "ruler", gens: Array(6).fill(G.g5AreaUnit) },
    ],
  },
  {
    u: "9-bob. Oddiy kasrlar", ic: "pie", color: "purple",
    intro: { t: "Kasrlar bilan tanishamiz", v: ["3", "/", "4"], d: "Ulush va kasr, kasrlarni taqqoslash, to'g'ri va noto'g'ri kasrlar, qo'shish va ayirish." },
    lessons: [
      { n: "Ulushlar va oddiy kasrlar", ic: "pie", gens: Array(6).fill(G.g5Frac) },
      { n: "Kasrlarni taqqoslash", ic: "scale", gens: Array(6).fill(G.g5FracCmp) },
      { n: "To'g'ri va noto'g'ri kasrlar", ic: "search", gens: Array(6).fill(G.g5Proper) },
      { n: "Bir xil maxrajli kasrlarni qo'shish va ayirish", ic: "plus", gens: [G.g5FracAdd, G.g5FracSub, G.g5FracAdd, G.g5FracSub, G.g5FracAdd, G.g5FracSub] },
      { n: "Bo'lish va kasrlar", ic: "divide", gens: Array(6).fill(G.g5DivFrac) },
    ],
  },
  {
    u: "10-bob. Aralash sonlar", ic: "puzzle", color: "red",
    intro: { t: "Butun va kasr birga", v: ["2", "¾"], d: "Noto'g'ri kasrni aralash songa aylantiramiz, aralash sonlarni qo'shamiz va ayiramiz." },
    lessons: [
      { n: "Aralash sonlar", ic: "puzzle", gens: [G.g5Mixed, G.g5MixedBack, G.g5Mixed, G.g5MixedBack, G.g5Mixed, G.g5MixedBack] },
      { n: "Aralash sonlarni qo'shish va ayirish", ic: "plus", gens: Array(6).fill(G.g5MixedAdd) },
      { n: "Kasrlarga doir masalalar", ic: "map", gens: Array(6).fill(G.g5FracPart) },
    ],
  },
  {
    u: "11-bob. Fazoviy shakllar va hajm", ic: "cube", color: "green",
    intro: { t: "Uch o'lchovli olam", v: ["V", "=", "abc"], d: "Ko'pyoqlar, to'g'ri burchakli parallelepiped va kub, ularning hajmi." },
    lessons: [
      { n: "Fazoviy shakllar. Ko'pyoqlar", ic: "cube", gens: Array(6).fill(G.g5Solid) },
      { n: "Parallelepiped va kub", ic: "blocks", gens: Array(6).fill(G.g5CubeParts) },
      { n: "Parallelepiped va kub hajmi", ic: "cube", gens: [G.g5Volume, G.g5CubeVol, G.g5Volume, G.g5CubeVol, G.g5Volume, G.g5CubeVol] },
    ],
  },
  {
    u: "12-bob. O'nli kasrlar", ic: "numline", color: "blue",
    intro: { t: "Verguldan keyin", v: ["3", ",", "14"], d: "O'nli kasrni o'qish va yozish, taqqoslash, qo'shish-ayirish va yaxlitlash." },
    lessons: [
      { n: "O'nli kasrlar", ic: "numline", gens: Array(6).fill(G.g5Dec) },
      { n: "O'nli kasrlarni taqqoslash", ic: "scale", gens: Array(6).fill(G.g5DecCmp) },
      { n: "O'nli kasrlarni qo'shish va ayirish", ic: "column", gens: [G.g5DecAdd, G.g5DecSub, G.g5DecAdd, G.g5DecSub, G.g5DecAdd, G.g5DecSub] },
      { n: "Taqribiy qiymat va yaxlitlash", ic: "search", gens: Array(6).fill(G.g5DecRound) },
    ],
  },
  {
    u: "13-bob. O'nli kasrlarni ko'paytirish va bo'lish", ic: "divide", color: "orange",
    intro: { t: "Vergulni to'g'ri qo'yamiz", v: ["2,5", "×", "4"], d: "O'nli kasrni natural songa va o'nli kasrga ko'paytirish hamda bo'lish." },
    lessons: [
      { n: "Natural songa ko'paytirish", ic: "times", gens: Array(6).fill(G.g5DecMulN) },
      { n: "Natural songa bo'lish", ic: "divide", gens: Array(6).fill(G.g5DecDivN) },
      { n: "O'nli kasrlarni ko'paytirish", ic: "times", gens: Array(6).fill(G.g5DecMul) },
      { n: "O'nli kasrni o'nli kasrga bo'lish", ic: "divide", gens: Array(6).fill(G.g5DecDiv) },
    ],
  },
  {
    u: "14-bob. Foizlar", ic: "percent", color: "purple",
    intro: { t: "Yuzdan bir qism", v: ["50", "%"], d: "Foiz — sonning yuzdan bir qismi. Sonning foizini va necha foiz ekanini topamiz." },
    lessons: [
      { n: "Foiz tushunchasi", ic: "percent", gens: [G.g5Percent, G.g5Percent, G.g5PercentOf, G.g5Percent, G.g5Percent, G.g5PercentOf] },
      { n: "Sonning foizini topish", ic: "percent", gens: Array(6).fill(G.g5Percent) },
      { n: "Necha foiz ekanini topish", ic: "search", gens: Array(6).fill(G.g5PercentOf) },
    ],
  },
  {
    u: "15-bob. Ma'lumotlar tahlili", ic: "chart", color: "red",
    intro: { t: "Ma'lumot bilan ishlaymiz", v: ["📊"], d: "Ma'lumotlar qatorining o'rta arifmetigi, eng katta va eng kichik qiymat." },
    lessons: [
      { n: "O'rta arifmetik", ic: "scale", gens: Array(6).fill(G.g5Mean) },
      { n: "Ma'lumotlar qatori va uning tahlili", ic: "chart", gens: [G.g5DataRow, G.gData, G.g5DataRow, G.gCoord, G.g5DataRow, G.gData] },
    ],
  },
  {
    u: "Takrorlash — Bosh sinov", ic: "trophy", color: "gold", final: true,
    intro: { t: "Hammasini sinaymiz!", v: ["★"], d: "Butun yil: natural sonlar, daraja, masalalar, kasr, o'nli kasr, foiz, hajm va yuza." },
    lessons: [
      { n: "Aralash sinov 1", ic: "trophy", gens: [G.g5Cmp, G.g5Mul, G.g5Pow, G.g5FracAdd, G.g5DecAdd, G.g5Percent] },
      { n: "Aralash sinov 2", ic: "trophy", gens: [G.g5Round, G.g5Rem, G.g5Two, G.g5Mixed, G.g5DecMul, G.g5Volume] },
      { n: "Aralash sinov 3", ic: "trophy", gens: [G.g5Eq, G.g5Order4, G.g5AreaSum, G.g5FracPart, G.g5DecDiv, G.g5Mean] },
    ],
  },
];

export const grade5 = withReviews(U);
