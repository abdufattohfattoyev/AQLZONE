/**
 * 9-sinf GEOMETRIYA.
 *
 * Manba: "Geometriya 9-sinf" mundarijasi —
 *   I bob. Geometrik almashtirishlar va o'xshashlik (6–24)
 *   II bob. Uchburchak tomonlari va burchaklari (25–35)
 *   III bob. Aylana uzunligi va doira yuzi (36–47)
 *   IV bob. Uchburchak va aylanadagi metrik munosabatlar (48–55)
 *
 * ─────────────── O'XSHASHLIK — YILNING ASOSIY G'OYASI ───────────────
 *
 * 8-sinfda ikki shakl TENG bo'lishi mumkin edi. 9-sinfda yangi, kuchliroq
 * munosabat keladi: o'xshash — ya'ni shakli bir xil, o'lchami boshqa.
 *
 * Bu yerda bitta nozik joy bor va u har yili takrorlanadigan xato:
 * tomonlar k marta katta bo'lsa, yuz k marta emas, k² MARTA katta
 * bo'ladi. Shu sabab "yuzlari nisbati" darsi alohida turadi va uning
 * chalg'ituvchilari orasida har doim "k : 1" javobi bor.
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../oliy";

const U: Unit[] = [
  {
    u: "1-bob. O'xshashlik", ic: "shape", color: "purple",
    intro: {
      t: "Shakli bir xil, o'lchami boshqa",
      v: ["△", "∼", "△"],
      d: "Tomonlar k marta katta bo'lsa, yuz k² marta katta bo'ladi.",
    },
    lessons: [
      { n: "O'xshashlik koeffitsiyenti", ic: "ruler", gens: Array(6).fill(G.g9OxshashlikKoef) },
      { n: "O'xshash uchburchak tomonlari", ic: "triangle", gens: Array(6).fill(G.g9OxshashTomon) },
      { n: "O'xshash shakllar yuzi", ic: "grid", gens: Array(6).fill(G.g9OxshashYuza) },
      {
        n: "O'xshashlik alomatlari", ic: "equals",
        gens: [G.g9OxshashTomon, G.g9OxshashlikKoef, G.g9OxshashTomon, G.g9OxshashYuza, G.g9OxshashTomon, G.g9OxshashlikKoef],
      },
    ],
  },
  {
    u: "2-bob. Sinuslar va kosinuslar teoremasi", ic: "angle", color: "red",
    intro: {
      t: "Har qanday uchburchak",
      v: ["a/sin A", "=", "b/sin B"],
      d: "Endi to'g'ri burchak shart emas — bu ikki teorema hamma uchburchakda ishlaydi.",
    },
    lessons: [
      { n: "Yuzni sinus orqali hisoblash", ic: "triangle", gens: Array(6).fill(G.g9YuzaSinus) },
      { n: "Sinuslar teoremasi", ic: "scale", gens: Array(6).fill(G.g9Sinuslar) },
      { n: "Kosinuslar teoremasi", ic: "power", gens: Array(6).fill(G.g9Kosinuslar) },
      {
        n: "Uchburchaklarni yechish", ic: "puzzle",
        gens: [G.g9Sinuslar, G.g9Kosinuslar, G.g9YuzaSinus, G.g9Kosinuslar, G.g9Sinuslar, G.g9YuzaSinus],
      },
    ],
  },
  {
    u: "3-bob. Aylana uzunligi va doira yuzi", ic: "circle", color: "blue",
    intro: {
      t: "π keladi",
      v: ["C", "=", "2πr"],
      d: "Aylana uzunligi ham, doira yuzi ham bitta songa — π ga bog'liq.",
    },
    lessons: [
      { n: "Muntazam ko'pburchaklar", ic: "shape", gens: Array(6).fill(G.g9Muntazam) },
      { n: "Aylana uzunligi", ic: "circle", gens: Array(6).fill(G.g9AylanaUzunlik) },
      { n: "Yoy uzunligi", ic: "angle", gens: Array(6).fill(G.g9Yoy) },
      { n: "Sektor yuzi", ic: "pie", gens: Array(6).fill(G.g9Sektor) },
    ],
  },
  {
    u: "4-bob. Metrik munosabatlar", ic: "ruler", color: "gold",
    final: true,
    intro: {
      t: "Proporsional kesmalar",
      v: ["h²", "=", "a · b"],
      d: "To'g'ri burchakli uchburchakda balandlik ikki proyeksiyaning o'rta proporsionali.",
    },
    lessons: [
      { n: "Proporsional kesmalar", ic: "ruler", gens: Array(6).fill(G.g9Proporsional) },
      {
        n: "9-sinf geometriya kursini takrorlash", ic: "repeat",
        gens: [G.g9OxshashTomon, G.g9Kosinuslar, G.g9AylanaUzunlik, G.g9Sektor, G.g9Proporsional, G.g9Muntazam],
      },
    ],
  },
];

export const geometriya9 = withReviews(U);
