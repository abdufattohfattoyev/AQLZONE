/**
 * 8-sinf ALGEBRA.
 *
 * Manba: "Algebra 8-sinf" (2019) darsligi mundarijasi —
 *   I bob. Algebraik kasrlar va ular ustida amallar (1–10-§)
 *   II bob. Tengsizliklar (11–21-§)
 *   III bob. Kvadrat tenglamalar (22–27-§)
 *   IV bob. Ma'lumotlar tahlili (28–31-§)
 *
 * ─────────────── YIL DAVOMIDAGI ASOSIY QADAM ───────────────
 *
 * Bu sinfda ikkita yangi narsa keladi va ikkalasi ham keyingi butun
 * matematikaning poydevori: KVADRAT TENGLAMA va TENGSIZLIK.
 *
 * Tengsizlikda bitta joy bor, unda deyarli hamma yiqiladi: ikkala
 * tomonni MANFIY songa ko'paytirganda ishora teskari o'giriladi. Shu
 * sababdan tengsizlik bo'limidagi chalg'ituvchi variantlar ichida har
 * doim "ishorasi teskari" javob turadi — bola uni o'z ko'zi bilan
 * ko'rib, farqni eslab qolsin.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as A from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. Algebraik kasrlar", ic: "pie", color: "blue",
    intro: {
      t: "Kasr ustida amallar",
      v: ["a/b", "+", "c/d"],
      d: "Umumiy maxraj, qisqartirish, ko'paytirish — hammasi 7-sinfdagidek, faqat chuqurroq.",
    },
    lessons: [
      { n: "Kasrlarni qisqartirish", ic: "pie", gens: Array(6).fill(A.a7KasrQisqa) },
      { n: "Umumiy maxrajga keltirish", ic: "plus", gens: Array(6).fill(A.a8UmumiyMaxraj) },
      { n: "Ko'paytirish va bo'lish", ic: "times", gens: Array(6).fill(A.a7KasrKopaytir) },
      { n: "y = k/x funksiya", ic: "chart", gens: Array(6).fill(A.a8Teskari) },
      { n: "Kvadrat ildiz", ic: "sqrt", gens: Array(6).fill(A.a8Ildiz) },
      { n: "Ildizning xossalari", ic: "sqrt", gens: Array(6).fill(A.a8IldizXossa) },
      { n: "Ratsional ko'rsatkichli daraja", ic: "power", gens: Array(6).fill(A.a8RatsionalDaraja) },
    ],
  },
  {
    u: "2-bob. Tengsizliklar", ic: "scale", color: "orange",
    intro: {
      t: "Tenglik emas, taqqoslash",
      v: ["3x", ">", "12"],
      d: "Manfiy songa ko'paytirsang — ishora teskari o'giriladi. Butun bobning kaliti shu.",
    },
    lessons: [
      { n: "Sonli tengsizliklar", ic: "scale", gens: Array(6).fill(A.a8SonliTengsizlik) },
      { n: "Bir noma'lumli tengsizlik", ic: "sign", gens: Array(6).fill(A.a8Tengsizlik) },
      { n: "Sonli oraliqlar", ic: "numline", gens: Array(6).fill(A.a8Oraliq) },
      { n: "Sonning moduli", ic: "sign", gens: Array(6).fill(A.a8Modul) },
      { n: "Taqribiy hisoblash va yaxlitlash", ic: "ruler", gens: Array(6).fill(A.a8Yaxlit) },
    ],
  },
  {
    u: "3-bob. Kvadrat tenglamalar", ic: "power", color: "purple",
    intro: {
      t: "ax² + bx + c = 0",
      v: ["D", "=", "b² − 4ac"],
      d: "Diskriminant nechta ildiz borligini aytadi: musbat bo'lsa ikkita, nol bo'lsa bitta.",
    },
    lessons: [
      { n: "Chala kvadrat tenglamalar", ic: "power", gens: Array(6).fill(A.a8Chala) },
      { n: "Diskriminant", ic: "search", gens: Array(6).fill(A.a8Diskriminant) },
      { n: "Nechta ildiz bor", ic: "count", gens: Array(6).fill(A.a8NechtaIldiz) },
      { n: "Ildizlarni topish", ic: "equals", gens: Array(6).fill(A.a8Kvadrat) },
      { n: "Viyet teoremasi", ic: "scale", gens: Array(6).fill(A.a8Viyet) },
      { n: "Kvadrat uchhadni ajratish", ic: "puzzle", gens: Array(6).fill(A.a8Uchhad) },
      { n: "Bikvadrat tenglama", ic: "power", gens: Array(6).fill(A.a8Bikvadrat) },
    ],
  },
  {
    u: "4-bob. Ma'lumotlar tahlili", ic: "chart", color: "green",
    final: true,
    intro: {
      t: "Sonlar to'plamini o'qish",
      v: ["x̄", "Mo", "Me"],
      d: "O'rtacha qiymat, moda va mediana — uchtasi uchta boshqa savolga javob beradi.",
    },
    lessons: [
      { n: "O'rta arifmetik qiymat", ic: "chart", gens: Array(6).fill(A.a8Orta) },
      { n: "Moda", ic: "trophy", gens: Array(6).fill(A.a8Moda) },
      { n: "Mediana", ic: "order", gens: Array(6).fill(A.a8Mediana) },
      { n: "Kombinatorik masalalar", ic: "grid", gens: Array(6).fill(A.a7Kombinatorika) },
      {
        n: "8-sinf algebra kursini takrorlash", ic: "repeat",
        gens: [A.a8Kvadrat, A.a8Tengsizlik, A.a8Ildiz, A.a8Viyet, A.a8Orta, A.a8UmumiyMaxraj],
      },
    ],
  },
];

export const algebra8 = withReviews(U);
