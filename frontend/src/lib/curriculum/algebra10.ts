/**
 * 10-sinf ALGEBRA VA ANALIZ ASOSLARI.
 *
 * Manba: "Algebra va analiz asoslari 10-sinf" mundarijasi —
 *   0-bob. Takrorlash (kvadrat funksiya, tengsizlik, trigonometriya, progressiya)
 *   1-bob. Elementar funksiyalar
 *   2-bob. Ratsional va irratsional tenglamalar
 *   3-bob. Ko'rsatkichli va logarifmik funksiyalar
 *   4-bob. Trigonometrik funksiyalar
 *   5-bob. Trigonometrik tenglamalar
 *   6-bob. Ehtimollar nazariyasi
 *
 * ─────────────── FUNKSIYA — YILNING BOSH QAHRAMONI ───────────────
 *
 * Shu paytgacha tenglama yechilardi: "x nechchiga teng?". 10-sinfdan
 * boshlab savol o'zgaradi: "bu funksiya o'zini QANDAY tutadi?" — qayerda
 * aniqlangan, qayerda o'sadi, davri bormi.
 *
 * Ilova bu savolning hisoblanadigan qismini oladi: aniqlanish sohasi,
 * qiymat, davr, teskari funksiya. Grafikni O'QISH esa daftarda qoladi —
 * uni to'rtta tugma bilan tekshirib bo'lmaydi va tekshirgan bo'lib
 * ko'rinish yaxshisidan yomonroq.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as A from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. Takrorlash", ic: "repeat", color: "blue",
    intro: {
      t: "9-sinfdan nima qoldi",
      v: ["y = ax²", "sin", "aₙ"],
      d: "Kvadrat funksiya, trigonometriya va progressiyalar — yangi mavzular shularga tayanadi.",
    },
    lessons: [
      { n: "Kvadrat funksiya va grafigi", ic: "chart", gens: Array(6).fill(A.a9Ucha) },
      { n: "Kvadrat tengsizlik", ic: "scale", gens: Array(6).fill(A.a9KvadratTengsizlik) },
      { n: "Trigonometrik ayniyatlar", ic: "angle", gens: Array(6).fill(A.a9Keltirish) },
      { n: "Arifmetik va geometrik progressiyalar", ic: "order", gens: [A.a9ArifHad, A.a9GeoHad, A.a9ArifYigindi, A.a9GeoYigindi, A.a9ArifHad, A.a9GeoHad] },
    ],
  },
  {
    u: "2-bob. Elementar funksiyalar", ic: "chart", color: "green",
    intro: {
      t: "Funksiya nima qiladi",
      v: ["f(x)", "→", "y"],
      d: "Har bir x ga bitta y mos keladi. Funksiyaning butun mohiyati shu jumlada.",
    },
    lessons: [
      { n: "Funksiya qiymati", ic: "equals", gens: Array(6).fill(A.x10FunksiyaQiymat) },
      { n: "Aniqlanish sohasi", ic: "search", gens: Array(6).fill(A.a9Aniqlanish) },
      { n: "Murakkab funksiya", ic: "blocks", gens: Array(6).fill(A.x10Murakkab) },
      { n: "Teskari funksiya", ic: "repeat", gens: Array(6).fill(A.x10Teskari) },
      { n: "Davriy funksiyalar", ic: "circle", gens: Array(6).fill(A.x10Davr) },
      { n: "Juft va toq funksiyalar", ic: "sign", gens: Array(6).fill(A.a9JuftToq) },
    ],
  },
  {
    u: "3-bob. Ratsional va irratsional tenglamalar", ic: "divide", color: "orange",
    intro: {
      t: "Maxrajda va ildiz ostida",
      v: ["a/x", "√x", "= b"],
      d: "Ikkalasida ham tekshirish shart: maxraj nolga aylanmasin, ildiz ostidagi manfiy bo'lmasin.",
    },
    lessons: [
      { n: "Ratsional tenglamalar", ic: "divide", gens: Array(6).fill(A.x10Ratsional) },
      { n: "Irratsional tenglamalar", ic: "sqrt", gens: Array(6).fill(A.x10Irratsional) },
      {
        n: "Ratsional tengsizliklar", ic: "scale",
        gens: [A.a9KvadratTengsizlik, A.x10Ratsional, A.a8Oraliq, A.a9KvadratTengsizlik, A.x10Ratsional, A.a8Tengsizlik],
      },
    ],
  },
  {
    u: "4-bob. Ko'rsatkichli va logarifmik funksiyalar", ic: "power", color: "purple",
    intro: {
      t: "Daraja va uning teskarisi",
      v: ["2ˣ", "↔", "log₂"],
      d: "Logarifm — «asosni qaysi darajaga ko'tarsak shu son chiqadi» degan savolning javobi.",
    },
    lessons: [
      { n: "Ko'rsatkichli tenglamalar", ic: "power", gens: Array(6).fill(A.x10Korsatkichli) },
      { n: "Logarifm tushunchasi", ic: "search", gens: Array(6).fill(A.x10Logarifm) },
      { n: "Logarifm xossalari", ic: "puzzle", gens: Array(6).fill(A.x10LogarifmXossa) },
      { n: "Logarifmik tenglamalar", ic: "equals", gens: Array(6).fill(A.x10LogTenglama) },
      { n: "Ko'rsatkichli tengsizliklar", ic: "scale", gens: Array(6).fill(A.x10KorsatkichliTengsizlik) },
      { n: "Murakkab foiz", ic: "percent", gens: Array(6).fill(A.x10MurakkabFoiz) },
    ],
  },
  {
    u: "5-bob. Trigonometrik tenglamalar", ic: "angle", color: "red",
    intro: {
      t: "Cheksiz ko'p yechim",
      v: ["sin x = 0", "→", "πn"],
      d: "Trigonometrik tenglamaning yechimi bitta son emas — butun oila.",
    },
    lessons: [
      { n: "Sodda trigonometrik tenglamalar", ic: "angle", gens: Array(6).fill(A.x10TrigTenglama) },
      { n: "Trigonometrik qiymatlar", ic: "circle", gens: Array(6).fill(A.a9TrigQiymat) },
      {
        n: "Yechish usullari", ic: "puzzle",
        gens: [A.x10TrigTenglama, A.a9Keltirish, A.x10TrigTenglama, A.a9Ikkilangan, A.x10TrigTenglama, A.a9QoshishFormula],
      },
    ],
  },
  {
    u: "6-bob. Ehtimollar nazariyasi", ic: "puzzle", color: "gold",
    final: true,
    intro: {
      t: "Tasodifiy hodisalar",
      v: ["P(A)", "=", "m/n"],
      d: "Ehtimollik 0 dan 1 gacha. 0 — hech qachon, 1 — har doim.",
    },
    lessons: [
      { n: "Ehtimollik ta'riflari", ic: "puzzle", gens: Array(6).fill(A.x10Ehtimollik) },
      { n: "Kombinatorik masalalar", ic: "grid", gens: Array(6).fill(A.a7Kombinatorika) },
      {
        n: "10-sinf kursini takrorlash", ic: "repeat",
        gens: [A.x10Logarifm, A.x10Korsatkichli, A.x10Irratsional, A.x10Davr, A.x10Ehtimollik, A.x10Murakkab],
      },
    ],
  },
];

export const algebra10 = withReviews(U);
