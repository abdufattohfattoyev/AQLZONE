/**
 * 7-sinf ALGEBRA.
 *
 * Manba: Sh. A. Alimov, A. R. Xalmuxamedov, M. A. Mirzaxmedov,
 * "Algebra 7-sinf uchun darslik" (5-nashr) — boblar va §-lar shu
 * darslik mundarijasidan olingan.
 *
 * ─────────────── BU YERDA NIMA O'ZGARADI ───────────────
 *
 * 6-sinfgacha bola SONLAR bilan ishlagan. Algebra esa harf bilan
 * boshlanadi va bu — butun kursdagi eng katta sakrash. Shuning uchun
 * birinchi bob ataylab sekin: sonli ifodadan algebraik ifodaga, undan
 * formulaga o'tiladi. "x" darrov tenglamada emas, avval shunchaki
 * O'RNIGA SON QO'YILADIGAN harf bo'lib keladi.
 *
 * Yasashga doir va isbotlashga doir mashqlar bu yerda yo'q — ular
 * daftarda bajariladi. Ilova hisoblash va tanib olishni mashq
 * qildiradi, o'sha ikkisi esa takrorlashni talab qiladi.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as A from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. Algebraik ifodalar", ic: "equals", color: "blue",
    intro: {
      t: "Harf bilan yozilgan matematika",
      v: ["3a", "+", "2b"],
      d: "Son o'rniga harf turadi. Harfga qiymat bersang — oddiy misolga aylanadi.",
    },
    lessons: [
      { n: "Sonli ifodalar", ic: "equals", gens: Array(6).fill(A.a7Sonli) },
      { n: "Algebraik ifodalar", ic: "power", gens: Array(6).fill(A.a7Algebraik) },
      { n: "Tengliklar va formulalar", ic: "ruler", gens: Array(6).fill(A.a7Formula) },
      {
        n: "Qavslarni ochish", ic: "puzzle",
        gens: [A.a7Qavs, A.a7Qavs, A.a7Sonli, A.a7Qavs, A.a7Algebraik, A.a7Qavs],
      },
    ],
  },
  {
    u: "2-bob. Birinchi darajali tenglamalar", ic: "scale", color: "green",
    intro: {
      t: "Tenglama — tarozi",
      v: ["2x", "+", "5 = 11"],
      d: "Ikki tomon teng. Bir tomonga nima qilsang, ikkinchisiga ham shuni qil.",
    },
    lessons: [
      { n: "Tenglama va uning ildizlari", ic: "search", gens: Array(6).fill(A.a7Ildiz) },
      { n: "Tenglamalarni yechish", ic: "scale", gens: Array(6).fill(A.a7Tenglama) },
      {
        n: "Masalalarni tenglama bilan yechish", ic: "pencil",
        gens: [A.a7Masala, A.a7Tenglama, A.a7Masala, A.a7Tenglama, A.a7Masala, A.a7Ildiz],
      },
    ],
  },
  {
    u: "3-bob. Birhad va ko'phadlar", ic: "power", color: "purple",
    intro: {
      t: "Daraja va ko'phad",
      v: ["a³", "·", "a²"],
      d: "Bir xil asosli darajalarni ko'paytirsang, ko'rsatkichlar qo'shiladi.",
    },
    lessons: [
      { n: "Natural ko'rsatkichli daraja", ic: "power", gens: Array(6).fill(A.a7Daraja) },
      { n: "Darajaning xossalari", ic: "power", gens: Array(6).fill(A.a7DarajaXossa) },
      { n: "Birhadlarni ko'paytirish", ic: "times", gens: Array(6).fill(A.a7Birhad) },
      { n: "O'xshash hadlarni ixchamlash", ic: "order", gens: Array(6).fill(A.a7Oxshash) },
      { n: "Ko'phadlarni qo'shish va ayirish", ic: "plus", gens: Array(6).fill(A.a7KophadQosh) },
      { n: "Ko'phadni birhadga ko'paytirish", ic: "times", gens: Array(6).fill(A.a7KophadBirhad) },
      { n: "Ko'phadni ko'phadga ko'paytirish", ic: "grid", gens: Array(6).fill(A.a7KophadKophad) },
      { n: "Birhadga bo'lish", ic: "divide", gens: Array(6).fill(A.a7Bolish) },
    ],
  },
  {
    u: "4-bob. Ko'paytuvchilarga ajratish", ic: "puzzle", color: "orange",
    intro: {
      t: "Teskari yo'l",
      v: ["x²", "−", "9"],
      d: "Ko'paytirishni bilsang, uni orqaga qaytarish ham qo'lingdan keladi.",
    },
    lessons: [
      { n: "Umumiy ko'paytuvchini chiqarish", ic: "puzzle", gens: Array(6).fill(A.a7Umumiy) },
      { n: "Yig'indi va ayirmaning kvadrati", ic: "power", gens: Array(6).fill(A.a7Kvadrat) },
      { n: "Kvadratlar ayirmasi", ic: "minus", gens: Array(6).fill(A.a7KvadratAyirma) },
      {
        n: "Usullarni birgalikda qo'llash", ic: "blocks",
        gens: [A.a7Birgalikda, A.a7Umumiy, A.a7KvadratAyirma, A.a7Birgalikda, A.a7Kvadrat, A.a7Umumiy],
      },
    ],
  },
  {
    u: "5-bob. Algebraik kasrlar", ic: "pie", color: "red",
    intro: {
      t: "Maxrajda ham harf bor",
      v: ["6x²", "/", "3x"],
      d: "Oddiy kasrdagi hamma qoida bu yerda ham ishlaydi — faqat son o'rnida ifoda.",
    },
    lessons: [
      { n: "Kasrlarni qisqartirish", ic: "pie", gens: Array(6).fill(A.a7KasrQisqa) },
      { n: "Qo'shish va ayirish", ic: "plus", gens: Array(6).fill(A.a7KasrQosh) },
      { n: "Ko'paytirish va bo'lish", ic: "times", gens: Array(6).fill(A.a7KasrKopaytir) },
      {
        n: "Birgalikda bajariladigan amallar", ic: "blocks",
        gens: [A.a7KasrQisqa, A.a7KasrQosh, A.a7KasrKopaytir, A.a7KasrQisqa, A.a7KasrKopaytir, A.a7KasrQosh],
      },
    ],
  },
  {
    u: "6-bob. Kombinatorika elementlari", ic: "chart", color: "gold",
    final: true,
    intro: {
      t: "Nechta usul bor?",
      v: ["3", "×", "4"],
      d: "Sanashning o'zi ham alohida fan. Ko'paytirish qoidasi shu yerdan boshlanadi.",
    },
    lessons: [
      { n: "Kombinatorikaning asosiy qoidasi", ic: "chart", gens: Array(6).fill(A.a7Kombinatorika) },
      { n: "O'rin almashtirish", ic: "order", gens: Array(6).fill(A.a7Orin) },
      {
        n: "7-sinf algebra kursini takrorlash", ic: "repeat",
        gens: [A.a7Tenglama, A.a7DarajaXossa, A.a7KophadKophad, A.a7Kvadrat, A.a7KasrQisqa, A.a7Kombinatorika],
      },
    ],
  },
];

export const algebra7 = withReviews(U);
