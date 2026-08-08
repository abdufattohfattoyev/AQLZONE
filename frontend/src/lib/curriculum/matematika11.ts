/**
 * 11-sinf MATEMATIKA — algebra va analiz asoslari + geometriya.
 *
 * Manba: "Matematika 11" I va II qism —
 *   I qism, I bob. Hosila va uning tatbiqlari (1–36-dars)
 *   I qism, II bob. Integral va uning tatbiqlari (37–46)
 *   I qism geometriya: fazoda koordinatalar, vektorlar, prizma va silindr
 *   II qism, III bob. Ma'lumotlar tahlili. Ehtimollik (57–85)
 *   II qism geometriya: piramida va konus, sfera va shar
 *
 * ─────────────── NEGA IKKALASI BITTA KURSDA ───────────────
 *
 * 7–10-sinflarda algebra va geometriya alohida darslik va alohida kurs
 * edi. 11-sinfda esa darslikning O'ZI bitta: "Matematika 11" ichida
 * ikkala fan birga yuradi va imtihon ham ikkalasidan birga bo'ladi.
 *
 * Shuning uchun bu yerda ham ular bo'linmadi. Bo'limlar ketma-ketligi
 * darslikdagidek: avval hosila va integral, keyin fazoviy jismlar,
 * oxirida ehtimollik — chunki ehtimollik bo'limi ikkala qismdagi
 * hisoblash malakasini talab qiladi.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as A from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. Hosila", ic: "chart", color: "blue",
    intro: {
      t: "O'zgarish tezligi",
      v: ["y′", "=", "lim"],
      d: "Hosila funksiya qanchalik tez o'zgarayotganini aytadi. Grafikda — urinmaning qiyaligi.",
    },
    lessons: [
      { n: "Limit haqida tushuncha", ic: "search", gens: Array(6).fill(A.y11Limit) },
      { n: "Darajaning hosilasi", ic: "power", gens: Array(6).fill(A.y11HosilaDaraja) },
      { n: "Ko'phadning hosilasi", ic: "equals", gens: Array(6).fill(A.y11HosilaKophad) },
      { n: "Hosilalar jadvali", ic: "grid", gens: Array(6).fill(A.y11HosilaJadval) },
      { n: "Nuqtadagi hosila", ic: "numline", gens: Array(6).fill(A.y11HosilaNuqta) },
    ],
  },
  {
    u: "2-bob. Hosilaning tatbiqlari", ic: "ruler", color: "green",
    intro: {
      t: "Hosila nima uchun kerak",
      v: ["k", "max", "min"],
      d: "Urinma tenglamasi, o'sish oralig'i va ekstremum — hammasi hosiladan chiqadi.",
    },
    lessons: [
      { n: "Urinmaning burchak koeffitsiyenti", ic: "angle", gens: Array(6).fill(A.y11Urinma) },
      { n: "Ekstremum nuqtalari", ic: "trophy", gens: Array(6).fill(A.y11Ekstremum) },
      { n: "O'sish va kamayish oraliqlari", ic: "chart", gens: Array(6).fill(A.y11Osish) },
      {
        n: "Ekstremal masalalar", ic: "puzzle",
        gens: [A.y11Ekstremum, A.y11Urinma, A.y11Osish, A.y11HosilaNuqta, A.y11Ekstremum, A.y11Urinma],
      },
    ],
  },
  {
    u: "3-bob. Integral", ic: "pie", color: "orange",
    intro: {
      t: "Hosilaning teskarisi",
      v: ["∫", "f(x)", "dx"],
      d: "Hosilasi berilgan funksiyani topish — integrallash. U yuza hisoblashga olib keladi.",
    },
    lessons: [
      { n: "Boshlang'ich funksiya", ic: "repeat", gens: Array(6).fill(A.y11Boshlangich) },
      { n: "Integrallar jadvali", ic: "grid", gens: Array(6).fill(A.y11IntegralJadval) },
      { n: "Aniq integral. Nyuton–Leybnis", ic: "equals", gens: Array(6).fill(A.y11AniqIntegral) },
      { n: "Egri chiziqli trapetsiya yuzi", ic: "shape", gens: Array(6).fill(A.y11Yuza) },
    ],
  },
  {
    u: "4-bob. Prizma va silindr", ic: "cube", color: "purple",
    intro: {
      t: "Hajm va sirt",
      v: ["V", "=", "S · h"],
      d: "Prizma va silindr bir xil qoidaga bo'ysunadi: asos yuzini balandlikka ko'paytir.",
    },
    lessons: [
      { n: "Fazoda vektorlar", ic: "map", gens: Array(6).fill(A.s10Vektor) },
      { n: "Prizma hajmi", ic: "cube", gens: Array(6).fill(A.s11PrizmaHajm) },
      { n: "Parallelepiped hajmi va sirti", ic: "blocks", gens: Array(6).fill(A.s11Parallelepiped) },
      { n: "Silindr hajmi", ic: "circle", gens: Array(6).fill(A.s11SilindrHajm) },
      { n: "Silindr sirti", ic: "ruler", gens: Array(6).fill(A.s11SilindrSirt) },
    ],
  },
  {
    u: "5-bob. Piramida, konus, shar", ic: "shape", color: "red",
    intro: {
      t: "Uchdan bir va shar",
      v: ["⅓Sh", "⁴⁄₃πr³"],
      d: "Uchi bor jismlarda hajm uchdan bir marta kichik. Sharning o'z formulasi bor.",
    },
    lessons: [
      { n: "Piramida hajmi", ic: "triangle", gens: Array(6).fill(A.s11PiramidaHajm) },
      { n: "Konus hajmi", ic: "shape", gens: Array(6).fill(A.s11KonusHajm) },
      { n: "Konus yon sirti", ic: "pie", gens: Array(6).fill(A.s11KonusSirt) },
      { n: "Shar hajmi", ic: "circle", gens: Array(6).fill(A.s11SharHajm) },
      { n: "Sfera sirtining yuzi", ic: "circle", gens: Array(6).fill(A.s11SferaYuza) },
      { n: "Formulalarni tanish", ic: "search", gens: Array(6).fill(A.s11Formula) },
    ],
  },
  {
    u: "6-bob. Ma'lumotlar tahlili va ehtimollik", ic: "chart", color: "gold",
    final: true,
    intro: {
      t: "Kombinatorika va statistika",
      v: ["Cₙᵏ", "P", "σ"],
      d: "Nechta usul bor, qanday ehtimollik bilan va ma'lumotlar qanchalik tarqoq.",
    },
    lessons: [
      { n: "Kombinatsiyalar", ic: "grid", gens: Array(6).fill(A.y11Kombinatsiya) },
      { n: "Nyuton binomi", ic: "power", gens: Array(6).fill(A.y11Binom) },
      { n: "Ehtimollik", ic: "puzzle", gens: Array(6).fill(A.x10Ehtimollik) },
      { n: "O'rtacha kvadratik chetlanish", ic: "chart", gens: Array(6).fill(A.y11Chetlanish) },
      {
        n: "Yakuniy takrorlash", ic: "trophy",
        gens: [A.y11HosilaKophad, A.y11AniqIntegral, A.s11SilindrHajm, A.s11SharHajm, A.y11Kombinatsiya, A.y11Urinma],
      },
    ],
  },
];

export const matematika11 = withReviews(U);
