/**
 * 6-sinf — M. A. Mirzaxmedov va boshq., "Matematika 6" (O'qituvchi, 2017).
 *
 * Yilning ikkita katta yangiligi bor va boblar shu ikkitasi atrofida
 * quriladi: KASR endi har xil maxrajli (shuning uchun avval bo'linish
 * belgilari, EKUB va EKUK o'tiladi — ularsiz umumiy maxraj yo'q), va
 * SON endi manfiy bo'lishi mumkin. Shu sabab bo'linish belgilari bobi
 * kasrlardan OLDIN turadi: darslikda ham shunday.
 *
 * 1-bob — 5-sinfni takrorlash.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../generators";

const U: Unit[] = [
  {
    u: "1-bob. Takrorlash: 5-sinf materiali", ic: "repeat", color: "green",
    intro: { t: "5-sinfni yodga olamiz", v: ["2,5", "×", "4"], d: "Natural sonlar bilan amallar, oddiy va o'nli kasrlar, foiz va o'rta arifmetik." },
    lessons: [
      { n: "Natural sonlar bilan amallar", ic: "times", gens: [G.g5Mul, G.g5Div, G.g5Order4, G.g5Pow, G.g5Rem, G.g5Eq] },
      { n: "Oddiy kasrlar", ic: "pie", gens: [G.g5FracAdd, G.g5FracSub, G.g5FracCmp, G.g5Mixed, G.g5MixedAdd, G.g5FracPart] },
      { n: "O'nli kasrlar", ic: "numline", gens: [G.g5DecAdd, G.g5DecSub, G.g5DecMulN, G.g5DecDivN, G.g5DecCmp, G.g5DecRound] },
      { n: "Foiz va o'rta arifmetik", ic: "percent", gens: [G.g5Percent, G.g5Mean, G.g5PercentOf, G.g5Mean, G.g5Percent, G.g5DataRow] },
    ],
  },
  {
    u: "2-bob. Sonlarning bo'linish belgilari", ic: "search", color: "blue",
    intro: { t: "Qaysi songa bo'linadi?", v: ["2", "3", "5"], d: "Bo'luvchi va karrali, 2 ga, 3 ga, 5 ga, 9 ga va 10 ga bo'linish belgilari." },
    lessons: [
      { n: "Sonning bo'luvchilari va karralilari", ic: "search", gens: [G.g6Divisor, G.g6Multiple, G.g6Divisor, G.g6Multiple, G.g6Divisor, G.g6Multiple] },
      { n: "10 ga, 5 ga va 2 ga bo'linish belgilari", ic: "divide", gens: [G.g6Bolinish(2), G.g6Bolinish(5), G.g6Bolinish(10), G.g6Bolinish(2), G.g6Bolinish(5), G.g6Bolinish(10)] },
      { n: "9 ga va 3 ga bo'linish belgilari", ic: "divide", gens: [G.g6Bolinish(3), G.g6Bolinish(9), G.g6Bolinish(3), G.g6Bolinish(9), G.g6Bolinish(3), G.g6Bolinish(9)] },
      { n: "Tub va murakkab sonlar", ic: "blocks", gens: Array(6).fill(G.g6Prime) },
      { n: "Tub ko'paytuvchilarga ajratish", ic: "puzzle", gens: Array(6).fill(G.g6Factor) },
    ],
  },
  {
    u: "3-bob. EKUB va EKUK", ic: "puzzle", color: "orange",
    intro: { t: "Umumiy bo'luvchi va karrali", v: ["EKUB", "EKUK"], d: "Eng katta umumiy bo'luvchi, o'zaro tub sonlar va eng kichik umumiy karrali." },
    lessons: [
      { n: "Eng katta umumiy bo'luvchi", ic: "search", gens: Array(6).fill(G.g6Gcd) },
      { n: "O'zaro tub sonlar", ic: "blocks", gens: Array(6).fill(G.g6Coprime) },
      { n: "Eng kichik umumiy karrali", ic: "numline", gens: Array(6).fill(G.g6Lcm) },
    ],
  },
  {
    u: "4-bob. Kasrning asosiy xossasi", ic: "pie", color: "purple",
    intro: { t: "Kasrni o'zgartiramiz", v: ["2/4", "=", "1/2"], d: "Kasrning asosiy xossasi, qisqartirish, umumiy maxrajga keltirish va taqqoslash." },
    lessons: [
      { n: "Kasrning asosiy xossasi", ic: "pie", gens: Array(6).fill(G.g6FracBase) },
      { n: "Kasrlarni qisqartirish", ic: "scale", gens: Array(6).fill(G.g6Reduce) },
      { n: "Kasrlarni umumiy maxrajga keltirish", ic: "equals", gens: Array(6).fill(G.g6Common) },
      { n: "Har xil maxrajli kasrlarni taqqoslash", ic: "scale", gens: Array(6).fill(G.g6FracCmp) },
    ],
  },
  {
    u: "5-bob. Har xil maxrajli kasrlarni qo'shish va ayirish", ic: "plus", color: "red",
    intro: { t: "Umumiy maxrajga keltiramiz", v: ["1/2", "+", "1/3"], d: "Har xil maxrajli kasrlarni va aralash sonlarni qo'shamiz hamda ayiramiz." },
    lessons: [
      { n: "Har xil maxrajli kasrlarni qo'shish", ic: "plus", gens: Array(6).fill(G.g6FracAdd) },
      { n: "Har xil maxrajli kasrlarni ayirish", ic: "minus", gens: Array(6).fill(G.g6FracSub) },
      { n: "Aralash sonlarni qo'shish", ic: "plus", gens: Array(6).fill(G.g6MixAdd) },
      { n: "Aralash sonlarni ayirish", ic: "minus", gens: Array(6).fill(G.g6MixSub) },
    ],
  },
  {
    u: "6-bob. Oddiy kasrlarni ko'paytirish", ic: "times", color: "green",
    intro: { t: "Kasrni kasrga", v: ["2/3", "×", "3/4"], d: "Oddiy kasrlarni va aralash sonlarni ko'paytirish, sonning qismini topish." },
    lessons: [
      { n: "Oddiy kasrlarni ko'paytirish", ic: "times", gens: Array(6).fill(G.g6FracMul) },
      { n: "Aralash sonlarni ko'paytirish", ic: "puzzle", gens: Array(6).fill(G.g6MixMul) },
      { n: "Sonning qismini topish", ic: "pie", gens: Array(6).fill(G.g6PartOf) },
      { n: "Ko'paytirishning taqsimot qonuni", ic: "order", gens: Array(6).fill(G.g6Distrib) },
    ],
  },
  {
    u: "7-bob. Oddiy kasrlarni bo'lish", ic: "divide", color: "blue",
    intro: { t: "Teskari songa ko'paytiramiz", v: ["3/4", "÷", "1/2"], d: "O'zaro teskari sonlar, kasrlarni bo'lish va qismiga ko'ra sonning o'zini topish." },
    lessons: [
      { n: "O'zaro teskari sonlar", ic: "repeat", gens: Array(6).fill(G.g6Recip) },
      { n: "Oddiy kasrlarni bo'lish", ic: "divide", gens: Array(6).fill(G.g6FracDiv) },
      { n: "Qismiga ko'ra sonning o'zini topish", ic: "search", gens: Array(6).fill(G.g6WholeFrom) },
    ],
  },
  {
    u: "8-bob. Nisbat va proporsiya", ic: "scale", color: "orange",
    intro: { t: "Nisbat va proporsiya", v: ["a : b", "=", "c : d"], d: "Nisbat, proporsiyaning asosiy xossasi, to'g'ri va teskari proporsional miqdorlar, masshtab." },
    lessons: [
      { n: "Nisbat tushunchasi", ic: "scale", gens: Array(6).fill(G.g6Ratio) },
      { n: "Proporsiyaning asosiy xossasi", ic: "equals", gens: Array(6).fill(G.g6Prop) },
      { n: "To'g'ri proporsional miqdorlar", ic: "coin", gens: Array(6).fill(G.g6Direct) },
      { n: "Teskari proporsional miqdorlar", ic: "clock", gens: Array(6).fill(G.g6Inverse) },
      { n: "Masshtab", ic: "map", gens: Array(6).fill(G.g6Scale) },
    ],
  },
  {
    u: "9-bob. Musbat va manfiy sonlar", ic: "sign", color: "purple",
    intro: { t: "Noldan pastga", v: ["−5", "0", "+5"], d: "Musbat va manfiy sonlar, koordinata to'g'ri chizig'i, qarama-qarshi sonlar va modul." },
    lessons: [
      { n: "Musbat va manfiy sonlar", ic: "sign", gens: Array(6).fill(G.g6Sign) },
      { n: "Koordinata to'g'ri chizig'i", ic: "numline", gens: [G.g6IntCmp, G.g6Opp, G.g6IntCmp, G.g6Opp, G.g6IntCmp, G.g6Opp] },
      { n: "Qarama-qarshi sonlar va modul", ic: "scale", gens: [G.g6Opp, G.g6Abs, G.g6Opp, G.g6Abs, G.g6Opp, G.g6Abs] },
      { n: "Sonlarni taqqoslash", ic: "scale", gens: Array(6).fill(G.g6IntCmp) },
    ],
  },
  {
    u: "10-bob. Butun sonlarni qo'shish va ayirish", ic: "plus", color: "red",
    intro: { t: "Ishoralar bilan ishlaymiz", v: ["−7", "+", "3"], d: "Bir xil va har xil ishorali sonlarni qo'shamiz, so'ng ayirishni o'rganamiz." },
    lessons: [
      { n: "Bir xil ishorali sonlarni qo'shish", ic: "plus", gens: Array(6).fill(G.g6IntAdd) },
      { n: "Har xil ishorali sonlarni qo'shish", ic: "sign", gens: Array(6).fill(G.g6IntAddMix) },
      { n: "Sonlarni ayirish", ic: "minus", gens: Array(6).fill(G.g6IntSub) },
    ],
  },
  {
    u: "11-bob. Butun sonlarni ko'paytirish va bo'lish", ic: "times", color: "green",
    intro: { t: "Ishoralar qoidasi", v: ["−", "×", "−"], d: "Ishoralar bir xil bo'lsa — musbat, har xil bo'lsa — manfiy. Daraja va kvadrat ildiz." },
    lessons: [
      { n: "Sonlarni ko'paytirish", ic: "times", gens: Array(6).fill(G.g6IntMul) },
      { n: "Sonlarni bo'lish", ic: "divide", gens: Array(6).fill(G.g6IntDiv) },
      { n: "Daraja va kvadrat ildiz", ic: "sqrt", gens: [G.g6Pow, G.g6Sqrt, G.g6Pow, G.g6Sqrt, G.g6Pow, G.g6Sqrt] },
    ],
  },
  {
    u: "12-bob. Tenglamalarni yechish", ic: "equals", color: "blue",
    intro: { t: "x ni topamiz", v: ["3x", "+", "5 = 20"], d: "Qavslarni ochish qoidasi, koeffitsiyent va bir noma'lumli chiziqli tenglamalar." },
    lessons: [
      { n: "Qavslarni ochish qoidasi", ic: "order", gens: Array(6).fill(G.g6OpenParen) },
      { n: "Koeffitsiyent", ic: "pencil", gens: Array(6).fill(G.g6Coef) },
      { n: "Chiziqli tenglamalarni yechish", ic: "equals", gens: [G.g6LinEq, G.g6LinEq2, G.g6LinEq, G.g6LinEq2, G.g6LinEq, G.g6LinEq2] },
      { n: "Kasr koeffitsiyentli tenglamalar", ic: "pie", gens: Array(6).fill(G.g6FracEq) },
    ],
  },
  {
    u: "13-bob. Ma'lumotlar va kombinatorika", ic: "chart", color: "orange",
    intro: { t: "Ma'lumotni o'qiymiz", v: ["📊"], d: "Jadval va diagrammalar, ma'lumotlar tahlili hamda kombinatorikaning ko'paytirish qoidasi." },
    lessons: [
      { n: "Jadvallar va diagrammalar", ic: "chart", gens: [G.gData, G.gCoord, G.gData, G.g5DataRow, G.gData, G.gCoord] },
      { n: "Ma'lumotlar tahlili", ic: "search", gens: [G.g5Mean, G.g5DataRow, G.g5Mean, G.g5DataRow, G.g5Mean, G.g5DataRow] },
      { n: "Kombinatorika elementlari", ic: "puzzle", gens: Array(6).fill(G.g6Comb) },
    ],
  },
  {
    u: "14-bob. Geometrik material", ic: "triangle", color: "purple",
    intro: { t: "Uchburchak va doira", v: ["△", "○"], d: "Uchburchak turlari, burchaklari va yuzi, katakli qog'ozda yuza, aylana va doira." },
    lessons: [
      { n: "Uchburchak va uning turlari", ic: "triangle", gens: Array(6).fill(G.g6TriKind) },
      { n: "Uchburchak perimetri va burchaklari", ic: "angle", gens: [G.g6TriPerim, G.g6TriAngle, G.g6TriPerim, G.g6TriAngle, G.g6TriPerim, G.g6TriAngle] },
      { n: "Uchburchakning yuzi", ic: "triangle", gens: Array(6).fill(G.g6TriArea) },
      { n: "Katakli qog'ozda yuzlarni hisoblash", ic: "grid", gens: [G.gArea, G.g5AreaSum, G.gArea, G.g5Rect, G.gArea, G.g5AreaSum] },
      { n: "Aylana uzunligi va doira yuzi", ic: "circle", gens: [G.g6Circle, G.g6Disc, G.g6Circle, G.g6Disc, G.g6Circle, G.g6Disc] },
    ],
  },
  {
    u: "Takrorlash — Bosh sinov", ic: "trophy", color: "gold", final: true,
    intro: { t: "Hammasini sinaymiz!", v: ["★"], d: "Butun yil: bo'linish belgilari, kasrlar, proporsiya, manfiy sonlar, tenglama va geometriya." },
    lessons: [
      { n: "Aralash sinov 1", ic: "trophy", gens: [G.g6Gcd, G.g6Reduce, G.g6FracAdd, G.g6Ratio, G.g6IntAddMix, G.g6TriArea] },
      { n: "Aralash sinov 2", ic: "trophy", gens: [G.g6Lcm, G.g6FracMul, G.g6PartOf, G.g6Prop, G.g6IntMul, G.g6LinEq] },
      { n: "Aralash sinov 3", ic: "trophy", gens: [G.g6Factor, G.g6FracDiv, G.g6Scale, G.g6Abs, G.g6FracEq, G.g6Circle] },
    ],
  },
];

export const grade6 = withReviews(U);
