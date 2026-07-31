/**
 * "24" — sonlar sehri. To'rt raqamdan 24 chiqarish.
 *
 * Bo'limning bosh o'yini va yagona o'yin bo'lib, unda javob TOPILADI,
 * tanlanmaydi. Bitta topishmoq 30 soniyadan uch daqiqagacha oladi,
 * javobi esa mutlaqo aniq — shu sabab u bir vaqtda bolaga ham,
 * kattaga ham qiziq.
 *
 * ───────────────────── NEGA KASR ARIFMETIKASI ─────────────────────
 *
 * `8 ÷ (3 − 8 ÷ 3)` ning oralig'ida 1/3 chiqadi. `double` bilan
 * hisoblasak, 8/3 = 2.6666666666666665 bo'lib, oxirida 24 o'rniga
 * 23.999999999999996 keladi — va o'yin TO'G'RI yechimni rad etadi.
 * Buni "epsilon" bilan yamash mumkin, lekin unda teskarisi bo'ladi:
 * 24 ga juda yaqin, ammo NOTO'G'RI yechim qabul qilinadi.
 *
 * Shu sabab hamma hisob butun sonli KASR (`p/q`) ustida ketadi:
 * yaqinlashish umuman yo'q, taqqoslash aniq.
 *
 * ──────────────────────── UCH DARAJA ────────────────────────
 *
 * Qiyinlik sonlarning kattaligi bilan emas, YECHIM TURI bilan
 * o'lchanadi — va bu o'lchov to'g'ridan-to'g'ri hisoblanadi, qo'lda
 * yozib qo'yilmaydi:
 *
 *   1  faqat `+` va `×` bilan yechiladi        2·(3+4+5)
 *   2  `−` yoki `÷` kerak, oraliq sonlar BUTUN 5×5−1×1
 *   3  oraliqda KASR chiqishi shart            8÷(3−8÷3)
 *
 * Uchinchisi eng qiziq: odam butun sonlar bilan urinib ko'radi, topa
 * olmaydi va "yechimi yo'q" deb o'ylaydi — aslida bor.
 */
import { rnd, shuffle } from "../rnd";
import type { Daraja } from "./tur";

export const MAQSAD = 24;

/** Kasr son: `p/q`, `q > 0` va kasr doim qisqartirilgan holda turadi. */
export interface Kasr {
  p: number;
  q: number;
  /** Shu qiymat qanday yig'ilgani — ekranda ko'rsatiladi. */
  matn: string;
}

export type Amal = "+" | "−" | "×" | "÷";
export const AMALLAR: Amal[] = ["+", "−", "×", "÷"];

const ekat = (a: number, b: number): number => (b === 0 ? Math.abs(a) : ekat(b, a % b));

function kasr(p: number, q: number, matn: string): Kasr {
  if (q < 0) { p = -p; q = -q; }
  const d = ekat(Math.abs(p), q) || 1;
  return { p: p / d, q: q / d, matn };
}

export const butunmi = (k: Kasr): boolean => k.q === 1;
export const yigirmaTortmi = (k: Kasr): boolean => k.p === MAQSAD && k.q === 1;

/** Sondan kasr yasaydi — taxtaning boshlang'ich toshlari shunday tug'iladi. */
export const sondan = (n: number): Kasr => ({ p: n, q: 1, matn: String(n) });

/** Kasrni ekranda ko'rsatish: butun bo'lsa oddiy son, aks holda `p/q`. */
export const kasrMatn = (k: Kasr): string => (k.q === 1 ? String(k.p) : `${k.p}/${k.q}`);

/**
 * Ikki kasrni birlashtiradi. Nolga bo'lishda `null`.
 *
 * `matn` qavs bilan yig'iladi: yechim ko'rsatilganda amallar tartibi
 * o'quvchiga aniq bo'lishi kerak.
 */
export function birlashtir(a: Kasr, b: Kasr, amal: Amal): Kasr | null {
  const m = `(${a.matn} ${amal} ${b.matn})`;
  if (amal === "+") return kasr(a.p * b.q + b.p * a.q, a.q * b.q, m);
  if (amal === "−") return kasr(a.p * b.q - b.p * a.q, a.q * b.q, m);
  if (amal === "×") return kasr(a.p * b.p, a.q * b.q, m);
  if (b.p === 0) return null;
  return kasr(a.p * b.q, a.q * b.p, m);
}

/* ------------------------------------------------------------------ */
/*                            yechuvchi                               */
/* ------------------------------------------------------------------ */

interface Shart {
  /** Qaysi amallardan foydalanish mumkin. */
  amallar: Amal[];
  /** Oraliq qiymatlar BUTUN bo'lishi shartmi. */
  butun: boolean;
}

/**
 * Yechimni izlaydi va topilsa uning IFODASINI qaytaradi.
 *
 * Har qadamda ikkita son olinadi, birlashtiriladi va o'rniga bitta son
 * qo'yiladi — ya'ni to'rttadan uchta, uchtadan ikkita qoladi. Bu usul
 * qavslarni alohida hisobga olishni talab qilmaydi: har birlashtirish
 * o'zi bitta qavs.
 */
function izla(sonlar: Kasr[], sh: Shart): string | null {
  if (sonlar.length === 1) {
    return yigirmaTortmi(sonlar[0]) ? sonlar[0].matn : null;
  }

  for (let i = 0; i < sonlar.length; i++) {
    for (let j = 0; j < sonlar.length; j++) {
      if (i === j) continue;
      const qolgan = sonlar.filter((_, k) => k !== i && k !== j);
      for (const amal of sh.amallar) {
        // `+` va `×` da tartib ahamiyatsiz — juftlikning bir yo'nalishi
        // tashlab ketiladi, aks holda bir xil ifoda ikki marta
        // tekshirilib, izlash ikki barobar sekinlashardi. `−` va `÷` da
        // esa tartib MUHIM, shuning uchun ular ikkala yo'nalishda ham
        // sinaladi.
        if ((amal === "+" || amal === "×") && i > j) continue;
        const yangi = birlashtir(sonlar[i], sonlar[j], amal);
        if (!yangi) continue;
        if (sh.butun && !butunmi(yangi)) continue;
        const javob = izla([...qolgan, yangi], sh);
        if (javob) return javob;
      }
    }
  }
  return null;
}

const QOSH_KOP: Shart = { amallar: ["+", "×"], butun: true };
const BUTUN: Shart = { amallar: AMALLAR, butun: true };
const KASRLI: Shart = { amallar: AMALLAR, butun: false };

/**
 * To'rt raqamning qiyinlik darajasi. Yechimi bo'lmasa `null`.
 *
 * Tartib muhim: eng yengil shartdan boshlanadi, chunki bir topishmoq
 * bir vaqtda uch darajaga ham javob bera oladi — bunda ENG OSONI
 * to'g'ri javob bo'ladi.
 */
export function darajasi(raqamlar: number[]): Daraja | null {
  const k = raqamlar.map(sondan);
  if (izla(k, QOSH_KOP)) return 1;
  if (izla(k, BUTUN)) return 2;
  if (izla(k, KASRLI)) return 3;
  return null;
}

/**
 * To'rt raqamning to'liq yechimi — "javobni ko'rsatish" uchun.
 *
 * Eng tashqi qavs olib tashlanadi: `((3 × 1) × (5 + 3))` emas,
 * `(3 × 1) × (5 + 3)`. U hech narsani aniqlashtirmaydi va faqat
 * o'qishni qiyinlashtiradi.
 */
export function yechim(raqamlar: number[]): string | null {
  const k = raqamlar.map(sondan);
  const y = izla(k, BUTUN) ?? izla(k, KASRLI);
  if (!y) return null;
  return y.startsWith("(") && y.endsWith(")") ? y.slice(1, -1) : y;
}

/* ------------------------------------------------------------------ */
/*                        topishmoq yasash                            */
/* ------------------------------------------------------------------ */

/**
 * Hech qachon bo'sh qaytmasin uchun tayyor topishmoqlar.
 *
 * Tasodifiy izlash deyarli doim bir necha urinishda topadi, lekin
 * "deyarli" yetarli emas: o'yin ochilganda ekranda albatta topishmoq
 * turishi kerak. Uchtasi ham qo'lda tekshirilgan.
 */
const ZAXIRA: Record<Daraja, number[]> = {
  1: [4, 6, 1, 1],     // 4 × 6 × 1 × 1
  2: [5, 5, 1, 1],     // 5 × 5 − 1 × 1
  3: [3, 3, 8, 8],     // 8 ÷ (3 − 8 ÷ 3)
};

/**
 * Berilgan darajaga mos yangi topishmoq.
 *
 * Raqamlar 1–9 dan olinadi: nol bo'lsa ko'p topishmoq "hamma narsani
 * nolga ko'paytir" ga aylanib, o'yin ma'nosini yo'qotardi.
 */
export function yangiTopishmoq(d: Daraja): number[] {
  for (let i = 0; i < 400; i++) {
    const r = [rnd(1, 9), rnd(1, 9), rnd(1, 9), rnd(1, 9)];
    if (darajasi(r) === d) return shuffle(r);
  }
  return shuffle([...ZAXIRA[d]]);
}
