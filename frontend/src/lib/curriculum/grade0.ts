/**
 * Maktabgacha — 4–6 yosh, maktabga hali bormagan bola.
 *
 * Bu 1-sinfning yengil nusxasi EMAS. 1-sinf darslik bo'yicha boradi; bu
 * kurs esa bolaning KUNDALIK DUNYOSI bo'ylab: ranglar, shakllar, hayvonlar
 * va ularning ovozi, mevalar, transport, kun qismlari, hafta, ob-havo —
 * va shular orasida matematika: sanash, qo'shish, ayirish.
 *
 * Tuzilishi ataylab almashib boradi: og'ir bob (sanash, qo'shish) dan keyin
 * yengili (ob-havo, transport) keladi. 4 yoshli bola bir mavzuda uzoq
 * turolmaydi — uni charchatgan ilova ikkinchi kuni ochilmaydi.
 *
 * Uchta qat'iy qoida bor va ular butun kurs bo'ylab buzilmaydi:
 *
 *   1. Bola O'QIY OLMAYDI. Javob variantlari — rang, rasm yoki bitta katta
 *      harf/raqam. Yagona istisno: hafta kunlari (19-bob) — kun nomining
 *      rasmi yo'q, iloji yo'q. Shuning uchun u eng oxirroqda turadi.
 *   2. Har bir dars TUSHUNTIRISH bilan boshlanadi (`ogit`), agar mavzu yangi
 *      bo'lsa. Avval ko'rsatamiz, keyin so'raymiz.
 *   3. Savol matni bir nafasda o'qiladi — kattalar o'qib beradi, ovoz
 *      yoqilganda esa ilova o'zi aytadi (`lib/ovoz.ts`).
 */
import type { Unit } from "../types";
import { withReviews } from "../types";
import * as G from "../generators";
import {
  HAYVON_OVOZ, KAYFIYAT, KUN_TARTIBI, MAKTAB_RANGLAR, MEVA, OB_HAVO,
  SHAKL_EMOJI, TRANSPORT, YONALISH,
} from "../activity";

/**
 * Ma'lumot ro'yxatidan tanishtirish ro'yxatini yasaydi.
 *
 * Tanishtirish ekrani (`Ogit`, "royxat" turi) har bir a'zoni birma-bir
 * katta qilib ko'rsatadi va nomini aytadi — ya'ni SAVOL BERISHDAN OLDIN
 * bola butun mavzuni ko'rib chiqadi. Aynan shu narsa ota-onaga "bola bilan
 * birga takrorlash" imkonini beradi.
 */
const roy = (a: readonly { e: string; nom: string }[]) => a.map((x) => ({ e: x.e, nom: x.nom }));

/** Ranglar rasm emas, doira bo'lib chiziladi — shuning uchun alohida. */
const RANG_ROY = MAKTAB_RANGLAR.map((r) => ({ hex: r.hex, nom: r.nom }));

const U: Unit[] = [
  /* ============ TANISHUV: dunyoni nomlaymiz ============ */
  {
    u: "1-bob. Ranglar", ic: "palette", color: "red",
    intro: { t: "Ranglarni taniymiz", v: ["🔴", "🟡", "🔵"], d: "Qizil, sariq, ko'k, yashil, binafsha, qora, oq." },
    lessons: [
      { n: "Shu rangni top", ic: "palette", ogit: { tur: "royxat", nom: "ranglar", items: RANG_ROY },
        gens: Array(6).fill(G.g0Rang) },
      { n: "Rang nomi", ic: "palette", gens: Array(6).fill(G.g0RangNom) },
      { n: "Yetti rang", ic: "palette", gens: Array(6).fill(G.g0RangKop) },
      { n: "Qizil olmani top", ic: "search", gens: Array(6).fill(G.g0RangliMeva) },
      { n: "Narsaning rangi", ic: "palette", gens: Array(6).fill(G.g0RangNarsa) },
    ],
  },
  {
    u: "2-bob. Shakllar", ic: "shape", color: "purple",
    intro: { t: "Shakllarni taniymiz", v: ["⭕", "🔺", "🟥"], d: "Doira, uchburchak, kvadrat, yulduz." },
    lessons: [
      { n: "Xuddi shu shaklni top", ic: "shape", ogit: { tur: "royxat", nom: "shakllar", items: roy(SHAKL_EMOJI) },
        gens: Array(6).fill(G.g0Shakl) },
      { n: "Shakl nomi", ic: "shape", ogit: { tur: "tanish", belgi: "⭕", nom: "doira" },
        gens: Array(6).fill(G.g0ShaklNom) },
      { n: "Shakllar aralash", ic: "shape",
        gens: [G.g0Shakl, G.g0ShaklNom, G.g0Shakl, G.g0ShaklNom, G.g0Shakl, G.g0ShaklNom] },
    ],
  },
  {
    u: "3-bob. Hayvonlar", ic: "search", color: "green",
    intro: { t: "Hayvonlar olami", v: ["🐶", "🐱", "🦁"], d: "It, mushuk, arslon, fil — va ularning ovozi." },
    lessons: [
      { n: "Hayvon nomi", ic: "search", ogit: { tur: "royxat", nom: "hayvonlar", items: roy(HAYVON_OVOZ) },
        gens: Array(6).fill(G.g0Hayvon) },
      { n: "Kim shunday deydi?", ic: "search", gens: Array(6).fill(G.g0HayvonOvoz) },
      { n: "Hayvon qanday ovoz chiqaradi", ic: "search", gens: Array(6).fill(G.g0Ovozi) },
      { n: "Kim nima yeydi", ic: "puzzle", gens: Array(6).fill(G.g0Yem) },
    ],
  },
  {
    u: "4-bob. Mevalar", ic: "search", color: "orange",
    intro: { t: "Mevalarni taniymiz", v: ["🍎", "🍌", "🍇"], d: "Olma, banan, uzum, tarvuz — nomi va rangi." },
    lessons: [
      { n: "Meva nomi", ic: "search", ogit: { tur: "royxat", nom: "mevalar", items: roy(MEVA) },
        gens: Array(6).fill(G.g0Meva) },
      { n: "Mevaning rangi", ic: "palette", gens: Array(6).fill(G.g0MevaRang) },
      { n: "Qaysi biri meva?", ic: "puzzle", gens: Array(6).fill(G.g0Guruh) },
    ],
  },
  {
    u: "5-bob. Transport", ic: "car", color: "blue",
    intro: { t: "Nima bilan yuramiz", v: ["🚗", "✈️", "🚢"], d: "Mashina, samolyot, poyezd, kema." },
    lessons: [
      { n: "Transport nomi", ic: "car", ogit: { tur: "royxat", nom: "transport", items: roy(TRANSPORT) },
        gens: Array(6).fill(G.g0Transport) },
      { n: "U qayerda yuradi?", ic: "map", gens: Array(6).fill(G.g0TransportJoy) },
    ],
  },

  /* ============ MATEMATIKA: sanash boshlanadi ============ */
  {
    u: "6-bob. Bir, ikki, uch", ic: "count", color: "green",
    intro: { t: "Sanashni boshlaymiz", v: ["1", "2", "3"], d: "Uchtagacha sanaymiz — bu yoshda shuning o'zi katta ish." },
    lessons: [
      { n: "Bitta, ikkita, uchta", ic: "count", ogit: { tur: "sanash", emoji: "🍎", n: 3 },
        gens: Array(6).fill(() => G.g0Sana(3)) },
      { n: "3 gacha sanash", ic: "count", ogit: { tur: "sanash", emoji: "🎈", n: 3 },
        gens: Array(6).fill(() => G.g0Sana(3)) },
      { n: "1, 2, 3 raqamlari", ic: "numline", ogit: { tur: "raqam", n: 3, emoji: "⭐" },
        gens: Array(6).fill(() => G.g0Raqam(3)) },
    ],
  },
  {
    u: "7-bob. 5 gacha sanaymiz", ic: "count", color: "orange",
    intro: { t: "To'rt va besh", v: ["4", "5"], d: "Beshgacha sanash, raqamlar va sonlar qatori." },
    lessons: [
      { n: "5 gacha sanash", ic: "count", ogit: { tur: "sanash", emoji: "🍓", n: 5 },
        gens: Array(6).fill(() => G.g0Sana(5)) },
      { n: "Raqamlar 1–5", ic: "numline", ogit: { tur: "raqam", n: 5, emoji: "🌸" },
        gens: Array(6).fill(() => G.g0Raqam(5)) },
      { n: "Sonlar qatori", ic: "numline", ogit: { tur: "qator", n: 5 },
        gens: Array(6).fill(() => G.g0Nur(5)) },
      { n: "Keyingi son", ic: "order", ogit: { tur: "qator", n: 5 },
        gens: Array(6).fill(() => G.g0Keyingi(5)) },
    ],
  },
  {
    u: "8-bob. Katta va kichik", ic: "scale", color: "purple",
    intro: { t: "O'lchovlar", v: ["🐘", "🐭"], d: "Katta–kichik, uzun–qisqa, baland–past." },
    lessons: [
      { n: "Qaysi biri katta?", ic: "scale", ogit: { tur: "tanish", belgi: "🐘", nom: "katta fil" },
        gens: Array(6).fill(G.g0Olcham) },
      { n: "Uzun va qisqa", ic: "ruler", gens: Array(6).fill(G.g0Olcham) },
      { n: "Hayvonlar orasida eng kattasi", ic: "scale", gens: Array(6).fill(G.g1KattaKichik) },
    ],
  },
  {
    u: "9-bob. Ko'p va kam", ic: "scale", color: "blue",
    intro: { t: "Qayerda ko'p?", v: ["🍎🍎🍎", "🍎"], d: "Ikki guruhni taqqoslaymiz — qo'shishdan oldingi qadam." },
    lessons: [
      { n: "Qayerda ko'p?", ic: "scale", ogit: { tur: "taqqosla", emoji: "🍪", a: 4, b: 2 },
        gens: Array(6).fill(G.g0Kop) },
      { n: "Qayerda kam?", ic: "scale", ogit: { tur: "taqqosla", emoji: "🐟", a: 2, b: 5 },
        gens: Array(6).fill(G.g0Kam) },
    ],
  },
  {
    u: "10-bob. Qo'shish +", ic: "plus", color: "green",
    intro: { t: "\"+\" belgisi", v: ["2", "+", "1"], d: "Ikki guruh birlashadi. Avval rasm bilan, keyin belgi bilan." },
    lessons: [
      { n: "Hammasi nechta?", ic: "plus", ogit: { tur: "qosh", emoji: "🍎", a: 2, b: 1 },
        gens: Array(6).fill(() => G.g0Qosh(5)) },
      { n: "Ko'proq qo'shamiz", ic: "plus", ogit: { tur: "qosh", emoji: "🎈", a: 3, b: 2 },
        gens: Array(6).fill(() => G.g0Qosh(5)) },
      { n: "\"+\" belgisi bilan", ic: "plus", ogit: { tur: "qosh", emoji: "⭐", a: 2, b: 2 },
        gens: Array(6).fill(() => G.g0QoshBelgi(5)) },
    ],
  },
  {
    u: "11-bob. Ayirish −", ic: "minus", color: "red",
    intro: { t: "\"−\" belgisi", v: ["3", "−", "1"], d: "Bir qismi ketadi — nechtasi qoldi?" },
    lessons: [
      { n: "Nechtasi qoldi?", ic: "minus", ogit: { tur: "ayir", emoji: "🍪", n: 3, k: 1 },
        gens: Array(6).fill(() => G.g0Ayir(5)) },
      { n: "Ko'proq ayiramiz", ic: "minus", ogit: { tur: "ayir", emoji: "🐟", n: 5, k: 2 },
        gens: Array(6).fill(() => G.g0Ayir(5)) },
      { n: "\"−\" belgisi bilan", ic: "minus", ogit: { tur: "ayir", emoji: "🌻", n: 4, k: 1 },
        gens: Array(6).fill(() => G.g0AyirBelgi(5)) },
    ],
  },
  {
    u: "12-bob. Qo'sh va ayir", ic: "order", color: "purple",
    intro: { t: "Ikkalasi aralash", v: ["+", "−"], d: "Endi belgiga qarab ish qilamiz: qo'shishmi yoki ayirish?" },
    lessons: [
      { n: "Rasm bilan aralash", ic: "order", ogit: { tur: "qosh", emoji: "🍓", a: 3, b: 1 },
        gens: [() => G.g0Qosh(5), () => G.g0Ayir(5), () => G.g0Qosh(5), () => G.g0Ayir(5), () => G.g0Qosh(5), () => G.g0Ayir(5)] },
      { n: "Belgilar bilan aralash", ic: "order", ogit: { tur: "ayir", emoji: "🍎", n: 5, k: 3 },
        gens: [() => G.g0QoshBelgi(5), () => G.g0AyirBelgi(5), () => G.g0QoshBelgi(5), () => G.g0AyirBelgi(5), () => G.g0QoshBelgi(5), () => G.g0AyirBelgi(5)] },
    ],
  },

  /* ============ DUNYO: yo'nalish, vaqt, ob-havo ============ */
  {
    u: "13-bob. Yo'nalish", ic: "map", color: "blue",
    intro: { t: "Qayerga?", v: ["⬆️", "⬇️", "➡️"], d: "Yuqoriga, pastga, chapga, o'ngga." },
    lessons: [
      { n: "Strelka qayerga qaragan?", ic: "map", ogit: { tur: "royxat", nom: "yo'nalishlar", items: roy(YONALISH) },
        gens: Array(6).fill(G.g0Yonalish) },
      { n: "Narsa qayerda turibdi", ic: "map", gens: Array(6).fill(G.g1Pos) },
    ],
  },
  {
    u: "14-bob. Kun tartibi", ic: "clock", color: "orange",
    intro: { t: "Kun qismlari", v: ["🌞", "☀️", "🌙"], d: "Ertalab, tush, kech, tun." },
    lessons: [
      { n: "Kun qismini top", ic: "clock", ogit: { tur: "royxat", nom: "kun qismlari", items: roy(KUN_TARTIBI) },
        gens: Array(6).fill(G.g0Kun) },
      { n: "Keyin nima bo'ladi?", ic: "order", gens: Array(6).fill(G.g0KunKeyin) },
    ],
  },
  {
    u: "15-bob. Ob-havo", ic: "search", color: "blue",
    intro: { t: "Bugun havo qanday?", v: ["☀️", "🌧️", "❄️"], d: "Quyoshli, yomg'irli, qorli, bulutli." },
    lessons: [
      { n: "Ob-havoni top", ic: "search", ogit: { tur: "royxat", nom: "ob-havo", items: roy(OB_HAVO) },
        gens: Array(6).fill(G.g0ObHavo) },
      { n: "Bunday kunda nima kerak?", ic: "puzzle", gens: Array(6).fill(G.g0ObHavoKiyim) },
    ],
  },

  /* ============ MATEMATIKA: 10 gacha ============ */
  {
    u: "16-bob. 10 gacha sanaymiz", ic: "count", color: "orange",
    intro: { t: "Beshdan keyin", v: ["6", "…", "10"], d: "Olti, yetti, sakkiz, to'qqiz, o'n." },
    lessons: [
      { n: "10 gacha sanash", ic: "count", ogit: { tur: "sanash", emoji: "🐝", n: 6 },
        gens: Array(6).fill(() => G.g0Sana(10)) },
      { n: "Raqamlar 6–10", ic: "numline", ogit: { tur: "raqam", n: 8, emoji: "🍪" },
        gens: Array(6).fill(() => G.g0Raqam(10)) },
      { n: "Sonlar qatori 10 gacha", ic: "numline", ogit: { tur: "qator", n: 10 },
        gens: Array(6).fill(() => G.g0Nur(10)) },
      { n: "Keyingi va oldingi son", ic: "order", ogit: { tur: "qator", n: 10 },
        gens: Array(6).fill(() => G.g0Keyingi(10)) },
    ],
  },
  {
    u: "17-bob. 10 ichida qo'shish", ic: "plus", color: "green",
    intro: { t: "Kattaroq sonlar", v: ["4", "+", "3"], d: "Endi o'ngacha qo'shamiz." },
    lessons: [
      { n: "Rasm bilan qo'shish", ic: "plus", ogit: { tur: "qosh", emoji: "🍎", a: 4, b: 3 },
        gens: Array(6).fill(() => G.g0Qosh(10)) },
      { n: "Belgi bilan qo'shish", ic: "plus", ogit: { tur: "qosh", emoji: "⭐", a: 5, b: 4 },
        gens: Array(6).fill(() => G.g0QoshBelgi(10)) },
    ],
  },
  {
    u: "18-bob. 10 ichida ayirish", ic: "minus", color: "red",
    intro: { t: "Kattaroq sonlardan ayiramiz", v: ["7", "−", "3"], d: "O'ngacha sonlardan ayirish." },
    lessons: [
      { n: "Rasm bilan ayirish", ic: "minus", ogit: { tur: "ayir", emoji: "🎈", n: 7, k: 3 },
        gens: Array(6).fill(() => G.g0Ayir(10)) },
      { n: "Belgi bilan ayirish", ic: "minus", ogit: { tur: "ayir", emoji: "🍓", n: 9, k: 4 },
        gens: Array(6).fill(() => G.g0AyirBelgi(10)) },
    ],
  },

  /* ============ MANTIQ VA HARFLAR ============ */
  {
    u: "19-bob. Hafta kunlari", ic: "clock", color: "purple",
    intro: { t: "Hafta", v: ["1", "…", "7"], d: "Dushanbadan yakshanbagacha. Bu darsni kattalar bilan o'ynash qulay." },
    lessons: [
      // Kursdagi yagona dars, javobi so'z bo'lgan: kun nomining rasmi yo'q.
      // Shuning uchun u shu yerda — bola boshqa hamma narsani o'rgangandan keyin.
      { n: "Keyingi kun", ic: "clock", gens: Array(6).fill(G.g0Hafta) },
    ],
  },
  {
    u: "20-bob. Naqsh va mantiq", ic: "puzzle", color: "blue",
    intro: { t: "Keyin nima keladi?", v: ["🔺", "⭕", "?"], d: "Naqsh, guruhlash, kayfiyat — matematik mantiqning boshlanishi." },
    lessons: [
      { n: "Naqsh davomi", ic: "order",
        ogit: { tur: "naqsh", items: ["🔺", "⭕", "🔺", "⭕", "🔺", "⭕"], davr: 2 },
        gens: Array(6).fill(G.g0Naqsh) },
      { n: "Qaysi biri boshqacha?", ic: "puzzle", gens: Array(6).fill(G.g0Ortiq) },
      { n: "Kayfiyatni top", ic: "search", ogit: { tur: "royxat", nom: "kayfiyatlar", items: roy(KAYFIYAT) },
        gens: Array(6).fill(G.g0Kayfiyat) },
    ],
  },
  {
    u: "21-bob. Harflar", ic: "pencil", color: "gold",
    intro: { t: "O'qishga tayyorlanamiz", v: ["A", "B", "D"], d: "Harfni o'qimaymiz — tanib olamiz va so'zning boshini topamiz." },
    lessons: [
      { n: "Xuddi shu harfni top", ic: "pencil", ogit: { tur: "tanish", belgi: "A", nom: "A harfi" },
        gens: Array(6).fill(G.g0HarfJuft) },
      { n: "Qaysi biri A harfi?", ic: "pencil", gens: Array(6).fill(G.g0Harf) },
      { n: "So'z qaysi harf bilan boshlanadi", ic: "search", gens: Array(6).fill(G.g0BoshHarf) },
    ],
  },
  {
    u: "22-bob. Bosh sinov", ic: "trophy", color: "gold", final: true,
    intro: { t: "Hammasini sinaymiz!", v: ["★"], d: "Ranglar, shakllar, hayvonlar, sanash, qo'shish va ayirish." },
    lessons: [
      { n: "Aralash sinov 1", ic: "trophy",
        gens: [G.g0RangKop, G.g0ShaklNom, G.g0Hayvon, () => G.g0Sana(5), () => G.g0Qosh(5), () => G.g0Ayir(5)] },
      { n: "Aralash sinov 2", ic: "trophy",
        gens: [G.g0Meva, G.g0Transport, G.g0ObHavo, () => G.g0QoshBelgi(10), () => G.g0AyirBelgi(10), G.g0Naqsh] },
      { n: "Aralash sinov 3", ic: "trophy",
        gens: [G.g0HayvonOvoz, G.g0Yonalish, G.g0Kun, () => G.g0Raqam(10), () => G.g0Keyingi(10), G.g0Olcham] },
    ],
  },
];

export const grade0 = withReviews(U);
