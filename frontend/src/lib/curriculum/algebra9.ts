/**
 * 9-sinf ALGEBRA.
 *
 * Manba: "Algebra 9-sinf" (2019) darsligi mundarijasi —
 *   I bob. Kvadrat funksiya. Kvadrat tengsizliklar (1–12-§)
 *   II bob. Tenglamalar va tengsizliklar sistemalari (13–16-§)
 *   III bob. Trigonometriya elementlari (17–27-§)
 *   IV bob. Sonli ketma-ketliklar. Progressiyalar (28–33-§)
 *   V bob. Ehtimolliklar nazariyasi va matematik statistika (34–38-§)
 *
 * ─────────────── TRIGONOMETRIYA NEGA YOD OLINADI ───────────────
 *
 * Bu bobning yarmi — formulalar: keltirish, qo'shish, ikkilangan
 * burchak. Ularni chiqarib olish mumkin, lekin masala yechayotgan
 * o'quvchi har safar chiqarib o'tirmaydi — u eslaydi.
 *
 * Shuning uchun bu darslarda savol ataylab "formulani tanish"
 * ko'rinishida: `cos(180° − α) = ?` va to'rtta variant. Bu mashq
 * hisoblashni emas, XOTIRANI qurish uchun — o'sha formulalar keyingi
 * ikki yil davomida har kuni kerak bo'ladi.
 *
 * 6-bob (Parametrli tenglamalar) — darslikda yo'q, DTM uchun qo'shilgan
 * (2026-10-15). Kurs yakunidan keyin turadi: bob tartib raqami progressga
 * bog'langan.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as A from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. Kvadrat funksiya", ic: "chart", color: "blue",
    intro: {
      t: "Parabola",
      v: ["y", "=", "ax²"],
      d: "a musbat bo'lsa tarmoqlar yuqoriga, manfiy bo'lsa pastga qaraydi.",
    },
    lessons: [
      { n: "Tarmoqlar yo'nalishi", ic: "chart", gens: Array(6).fill(A.a9Tarmoq) },
      { n: "Parabola uchi", ic: "search", gens: Array(6).fill(A.a9Ucha) },
      { n: "Funksiya qiymati", ic: "equals", gens: Array(6).fill(A.a9FunksiyaQiymat) },
      { n: "Funksiyaning nollari", ic: "numline", gens: Array(6).fill(A.a9Nollar) },
      { n: "Kvadrat tengsizlik", ic: "scale", gens: Array(6).fill(A.a9KvadratTengsizlik) },
      { n: "Aniqlanish sohasi", ic: "search", gens: Array(6).fill(A.a9Aniqlanish) },
      { n: "Juft va toq funksiyalar", ic: "sign", gens: Array(6).fill(A.a9JuftToq) },
    ],
  },
  {
    u: "2-bob. Sistemalar", ic: "blocks", color: "orange",
    intro: {
      t: "Ikkita tenglama birga",
      v: ["{", "x, y", "}"],
      d: "Yechim — ikkala tenglamani bir vaqtda to'g'ri qiladigan (x; y) juftligi.",
    },
    lessons: [
      { n: "Chiziqli sistemalar", ic: "blocks", gens: Array(6).fill(A.a9Sistema) },
      {
        n: "Sistemalarni yechish usullari", ic: "puzzle",
        gens: [A.a9Sistema, A.a9Sistema, A.a9Nollar, A.a9Sistema, A.a9KvadratTengsizlik, A.a9Sistema],
      },
    ],
  },
  {
    u: "3-bob. Trigonometriya elementlari", ic: "angle", color: "purple",
    intro: {
      t: "Burchak va aylana",
      v: ["sin", "cos", "tg"],
      d: "Burchak endi 180° dan katta ham bo'ladi. Uni radianda ham o'lchaymiz.",
    },
    lessons: [
      { n: "Radian o'lchovi", ic: "circle", gens: Array(6).fill(A.a9Radian) },
      { n: "Sinus, kosinus, tangens", ic: "angle", gens: Array(6).fill(A.a9TrigQiymat) },
      { n: "Choraklar bo'yicha ishoralar", ic: "sign", gens: Array(6).fill(A.a9TrigIshora) },
      { n: "Asosiy trigonometrik ayniyat", ic: "equals", gens: Array(6).fill(A.a9Ayniyat) },
      { n: "Keltirish formulalari", ic: "repeat", gens: Array(6).fill(A.a9Keltirish) },
      { n: "Qo'shish formulalari", ic: "plus", gens: Array(6).fill(A.a9QoshishFormula) },
      { n: "Ikkilangan burchak", ic: "times", gens: Array(6).fill(A.a9Ikkilangan) },
    ],
  },
  {
    u: "4-bob. Progressiyalar", ic: "order", color: "green",
    intro: {
      t: "Sonlar zanjiri",
      v: ["a₁", "a₂", "a₃…"],
      d: "Arifmetikda har had oldingisiga d qo'shiladi, geometrikda q ga ko'paytiriladi.",
    },
    lessons: [
      { n: "Sonli ketma-ketliklar", ic: "order", gens: Array(6).fill(A.a9KetmaKetlik) },
      { n: "Arifmetik progressiya hadi", ic: "plus", gens: Array(6).fill(A.a9ArifHad) },
      { n: "Arifmetik progressiya yig'indisi", ic: "count", gens: Array(6).fill(A.a9ArifYigindi) },
      { n: "Geometrik progressiya hadi", ic: "times", gens: Array(6).fill(A.a9GeoHad) },
      { n: "Geometrik progressiya yig'indisi", ic: "count", gens: Array(6).fill(A.a9GeoYigindi) },
      { n: "Cheksiz kamayuvchi progressiya", ic: "pie", gens: Array(6).fill(A.a9CheksizYigindi) },
    ],
  },
  {
    u: "5-bob. Ehtimolliklar nazariyasi", ic: "puzzle", color: "gold",
    final: true,
    intro: {
      t: "Tasodif ham hisoblanadi",
      v: ["P", "=", "m/n"],
      d: "Qulay hollar sonini barcha hollar soniga bo'lamiz — mana shu ehtimollik.",
    },
    lessons: [
      { n: "Hodisaning ehtimolligi", ic: "puzzle", gens: Array(6).fill(A.a9Ehtimollik) },
      { n: "Nisbiy chastota", ic: "chart", gens: Array(6).fill(A.a9Chastota) },
      {
        n: "9-sinf algebra kursini takrorlash", ic: "repeat",
        gens: [A.a9Ucha, A.a9Keltirish, A.a9ArifHad, A.a9GeoHad, A.a9Ehtimollik, A.a9KvadratTengsizlik],
      },
    ],
  },
  /*
   * Kursdan TASHQARI bob — DTM uchun (2026-10-15). Oxirida turadi:
   * progress bob raqami bilan saqlanadi (`lib/oliy/dtmQoshimcha.ts`).
   */
  {
    u: "6-bob. Parametrli tenglamalar", ic: "scale", color: "purple",
    intro: {
      t: "Harf turgan koeffitsient",
      v: ["x²", "+", "a"],
      d: "Parametr — bir emas, butun tenglamalar oilasi. Savol: qaysi a da nechta ildiz bo'ladi?",
    },
    lessons: [
      { n: "Ildizlar soni va parametr", ic: "numline", gens: Array(6).fill(A.p9IldizSoni) },
      { n: "Bosh koeffitsientda parametr", ic: "search", gens: Array(6).fill(A.p9BoshParam) },
      { n: "Parametr va Viyet teoremasi", ic: "equals", gens: Array(6).fill(A.p9ParamViyet) },
      { n: "Chiziqli tenglamada parametr", ic: "scale", gens: Array(6).fill(A.p9ParamChiziqli) },
      { n: "Ildizlar ishorasi va parametr", ic: "sign", gens: Array(6).fill(A.p9ParamIshora) },
    ],
  },
];

export const algebra9 = withReviews(U);
