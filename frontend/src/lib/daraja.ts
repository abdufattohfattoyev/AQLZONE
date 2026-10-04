/**
 * DARAJA ANIQLASH — "Aql bilan tanishuv" (`screens/Daraja.tsx`).
 *
 * ─────────────────────── MUAMMO ───────────────────────
 *
 * Ilgari har bola kursni 1-bobning 1-darsidan boshlardi. 5-sinfning
 * o'rtasida ilovani topgan bola o'zi biladigan narsani ikki hafta
 * takrorlab zerikardi. Sinfdoshlaridan orqada qolgan bola esa yo'l
 * xaritasida "u yerda sening joying" deb ko'rsatilgan bobni ochib,
 * tushunmay qo'yardi.
 *
 * ─────────────────────── YECHIM ───────────────────────
 *
 * 10–14 ta savol bilan bola qaysi bobni ALLAQACHON bilishi aniqlanadi.
 * Bu ikkiga bo'lib qidirish: boblar bir-biriga tayanadi (kasrsiz foiz
 * yo'q), ya'ni bola N-bobni bilsa, undan oldingilarini ham taxminan
 * biladi. Shuning uchun har bobni emas, faqat 4–5 tasini sinash yetadi.
 *
 * Har bob 2–3 savol bilan sinaladi: ikkita to'g'ri — biladi, ikkita
 * xato — bilmaydi. Bitta savol yetmaydi: to'rt variantli savolni
 * taxmin bilan topish ehtimoli 25%, ikkitasini — 6%.
 *
 * Birinchi sinov bob O'RTADA emas, uchdan birida. Ko'p bola o'quv yili
 * boshida keladi va o'z sinfining ikkinchi yarmini hali o'tmagan:
 * o'rtadan boshlansa, ular birinchi savollardanoq qiyin narsaga duch
 * kelib, "men bilmayman" degan his bilan tanishardi.
 *
 * ─────────────────────── SAVOLLAR ───────────────────────
 *
 * Alohida savollar bazasi YO'Q — savollar o'sha bobning o'z darslaridan
 * yasaladi. Shunda test kurs bilan birga o'zgaradi va bola testda
 * ko'rgan savolni darsda ham xuddi shu ko'rinishda uchratadi. Ammo
 * hamma savol ham testga yaramaydi (`yaroqli`): ikki variantli savol
 * yarim ehtimol bilan taxmin qilinadi va bobni o'lchamaydi.
 *
 * Hisob-kitob React'siz va `scripts/daraja.ts` da sinaladi: har kurs
 * uchun "N-bobgacha biladigan" bola aynan N-bobga tushishi tekshiriladi.
 */
import type { Activity } from "./activity";
import type { Course } from "./curriculum";
import { maktabKursi } from "./curriculum";
import type { Lesson, Progress, Unit } from "./types";

/** Testdagi eng ko'p savol — undan oshsa natija o'sha paytdagi chegara. */
export const DARAJA_MAX = 14;

/** Bob shuncha to'g'ri javob bilan "bilinadi", shuncha xato bilan "bilinmaydi". */
const CHEGARA = 2;

/** Kursda daraja testi bormi: 1–11-sinf (maktabgacha va oliy — yo'q). */
export const darajaBormi = (c: Course): boolean =>
  maktabKursi(c) && c.grade >= 1 && sinaladigan(c.units).length > 1;

/**
 * Testni taklif qilish kerakmi: kursda hali hech narsa qilinmagan va
 * test o'tkazilmagan. Bitta dars o'tilgan bo'lsa ham — yo'q: bola
 * allaqachon o'z yo'lidan ketyapti, uni qaytarib testga solish
 * ortiqcha.
 */
export const darajaKerakmi = (c: Course, p: Progress): boolean =>
  darajaBormi(c) && p.boshBob === undefined && Object.keys(p.done).length === 0;

/**
 * Sinaladigan boblar (indekslari). Yakuniy takrorlash bobi (`final`)
 * sinalmaydi — u yangi narsa o'rgatmaydi, faqat oldingilarini aralashtiradi.
 */
export function sinaladigan(units: Unit[]): number[] {
  return units.flatMap((U, ui) => (U.final ? [] : [ui]));
}

/* ------------------------------------------------------------- holat */

export interface DarajaHolat {
  /** Javob [lo, hi] oralig'ida — `sinaladigan` ro'yxatidagi o'rin. */
  lo: number;
  hi: number;
  /** Hozir sinalayotgan bob (`sinaladigan` ro'yxatidagi o'rin). */
  joriy: number;
  /** Joriy bobdagi to'g'ri va xato javoblar. */
  togri: number;
  xato: number;
  /** Jami berilgan savollar. */
  savol: number;
  /** Tugagan bo'lsa — boshlanadigan bob (`units` indeksi). */
  natija: number | null;
}

/** Keyingi sinaladigan o'rin. Birinchisi — uchdan birida (yuqoridagi izoh). */
const keyingi = (lo: number, hi: number, birinchi: boolean) =>
  birinchi ? Math.floor((lo + hi) / 3) : Math.floor((lo + hi) / 2);

export function darajaBoshla(units: Unit[]): DarajaHolat {
  const n = sinaladigan(units).length;
  return { lo: 0, hi: n, joriy: keyingi(0, n, true), togri: 0, xato: 0, savol: 0, natija: null };
}

/**
 * Natijani `units` indeksiga o'giradi.
 *
 * Hamma sinalgan bob bilinsa (`lo` oxiridan o'tib ketgan) — oxirgi
 * sinaladigan bobdan keyingi bob (yakuniy takrorlash bo'lsa — o'sha),
 * yo'q bo'lsa oxirgi bob.
 */
function bobga(units: Unit[], o: number): number {
  const s = sinaladigan(units);
  if (o < s.length) return s[o]!;
  return Math.min(s[s.length - 1]! + 1, units.length - 1);
}

/** Bitta javob. "Bilmayman" — xato javob bilan teng. */
export function darajaJavob(units: Unit[], h: DarajaHolat, togri: boolean): DarajaHolat {
  if (h.natija !== null) return h;
  let { lo, hi, togri: t, xato: x } = h;
  const savol = h.savol + 1;
  if (togri) t++; else x++;

  let hal = false;
  if (t >= CHEGARA) { lo = h.joriy + 1; hal = true; }
  else if (x >= CHEGARA) { hi = h.joriy; hal = true; }

  if (!hal) {
    // Bob hali hal bo'lmagan, lekin savol tugadi — taxmin: shu bob
    // bilinmaydi (ehtiyot yo'li: bilgan narsani takrorlash zarar
    // qilmaydi, bilmaganini o'tkazib yuborish esa qiladi).
    if (savol >= DARAJA_MAX) return { ...h, savol, togri: t, xato: x, natija: bobga(units, Math.min(lo, h.joriy)) };
    return { ...h, savol, togri: t, xato: x };
  }

  if (lo >= hi || savol >= DARAJA_MAX) {
    return { lo, hi, joriy: h.joriy, togri: 0, xato: 0, savol, natija: bobga(units, lo) };
  }
  return { lo, hi, joriy: keyingi(lo, hi, false), togri: 0, xato: 0, savol, natija: null };
}

/** Hozir qaysi bob sinalyapti (`units` indeksi). */
export const joriyBob = (units: Unit[], h: DarajaHolat): number => sinaladigan(units)[h.joriy] ?? 0;

/**
 * Taxminiy taraqqiyot (0–1) — tepadagi chiziq uchun.
 *
 * Savollar soni oldindan noma'lum, shuning uchun "3 / 12" yozilmaydi:
 * u yolg'on bo'lardi va test erta tugasa bola "nimadir buzildi" deb
 * o'ylardi. Chiziq esa qidiruv oralig'i torayishiga qarab to'ladi.
 */
export function darajaFoiz(units: Unit[], h: DarajaHolat): number {
  if (h.natija !== null) return 1;
  const n = sinaladigan(units).length;
  const jami = Math.max(1, Math.ceil(Math.log2(n + 1)));
  const qolgan = Math.ceil(Math.log2(h.hi - h.lo + 1));
  return Math.min(0.95, Math.max(0.04, (jami - qolgan) / jami + 0.08));
}

/* ------------------------------------------------------------- savollar */

/** Takrorni aniqlash uchun savol izi. */
export const savolIzi = (a: Activity): string => `${a.type}|${a.prompt}|${a.answer}`;

/**
 * Savol daraja testiga yaraydimi.
 *
 *   variant ≥ 3     ikki variantda taxmin 50% — bob o'lchanmaydi
 *   takrorsiz       bir xil variant ikki marta bo'lsa, bola adashadi
 *   javob ichida    aks holda to'g'ri javobni bosib bo'lmaydi
 *   rasmiy emas     imtihon topshirig'i uzun va chizmali, bu yerda emas
 */
export function yaroqli(a: Activity): boolean {
  if (!a.prompt || a.type === "rasmiy") return false;
  const v = a.choices.map(String);
  if (v.length < 3 || new Set(v).size !== v.length) return false;
  return v.includes(String(a.answer)) && !v.some((x) => x === "NaN" || x === "undefined");
}

/** Bobning oddiy darslari — "Bob takrorlash" emas, unda o'z savoli yo'q. */
const darslar = (U: Unit): Lesson[] => {
  const d = U.lessons.filter((L) => !L.review && L.gens.length);
  return d.length ? d : U.lessons;
};

/**
 * Bobdan bitta savol.
 *
 * Bob bitta darsga qarab baholanmasin: birinchi savol bobning OXIRGI
 * darsidan (bob tugaganda nima bilish kerakligi), ikkinchisi o'rtadan,
 * uchinchisi qolganlaridan. Shunda "biladi" degan qaror bobning bitta
 * mavzusiga emas, butun bobga tayanadi.
 */
export function darajaSavol(U: Unit, nechanchi: number, chiqqan: Set<string>,
  rnd: () => number = Math.random): Activity {
  const d = darslar(U);
  const tartib = [d.length - 1, Math.floor((d.length - 1) / 2), Math.floor(rnd() * d.length)];
  const L = d[tartib[nechanchi % tartib.length]!] ?? d[0]!;

  let zaxira: Activity | null = null;
  for (let k = 0; k < 40; k++) {
    // Darsning boshqa darslari ham sinaladi: bitta darsning hamma
    // generatori yaroqsiz bo'lsa (masalan faqat "ha/yo'q"), qolganlari bor.
    const manba = k < 20 ? L : d[Math.floor(rnd() * d.length)]!;
    const gen = manba.gens[Math.floor(rnd() * manba.gens.length)]!;
    const a = gen();
    if (chiqqan.has(savolIzi(a))) continue;
    if (yaroqli(a)) return a;
    zaxira ??= a;
  }
  return zaxira ?? L.gens[0]!();
}
