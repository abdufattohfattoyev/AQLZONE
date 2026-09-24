/**
 * SON OVI — to'rtta kartadan 24 ni chiqarish.
 *
 * Dunyodagi eng mashhur matematik o'yinlardan biri ("24 game"). Qoidasi
 * bitta jumla: to'rtta son beriladi, har birini BIR MARTA ishlatib,
 * + − × ÷ bilan maqsad sonini chiqarish kerak. Shunga qaramay u
 * soatlab o'ynaladi, chunki yechim yo'li har safar boshqacha.
 *
 * ─────────────── NEGA QAVS YOZILMAYDI ───────────────
 *
 * Qavsli ifoda yozish (`(8-3)*(6-1)`) telefonda og'ir va xatoga
 * to'la. Shuning uchun o'yin IKKI KARTA BIRLASHTIRISH usulida:
 * ikkita son tanlanadi, amal bosiladi va ular O'RNIGA natija turadi.
 * Qavslar shu tarzda o'z-o'zidan chiqadi va bola ularni o'ylab ham
 * o'tirmaydi — u faqat "qaysi ikkitasini qo'shsam foyda beradi" deb
 * o'ylaydi, ya'ni aynan hisob-kitob qiladi.
 *
 * ─────────────── FAQAT BUTUN SONLAR ───────────────
 *
 * Oraliq natija kasr bo'lishi MUMKIN EMAS: `8÷(3−8÷3)` kabi klassik
 * yechim kattalar uchun chiroyli, bola uchun esa tushunarsiz va u
 * o'yinni tashlab ketadi. Shuning uchun bo'lish faqat qoldiqsiz
 * bajariladi va jumboq ham shu qoida bilan YARATILADI: yechimi bor
 * jumboqgina beriladi.
 *
 * Fayl SOF: brauzersiz sinaladi (`scripts/sonOvi.ts`).
 */
import { kunUrugi } from "./urug";
import type { Daraja } from "./tur";

export type Amal = "+" | "-" | "*" | "/";
export const AMALLAR: Amal[] = ["+", "-", "*", "/"];

/** Ekrandagi ko'rinish (ichkarida ASCII, ekranda matematik belgi). */
export const amalBelgisi = (a: Amal): string =>
  (a === "*" ? "×" : a === "/" ? "÷" : a === "-" ? "−" : "+");

/** Har darajaning maqsadi va kartalari. */
export interface Sozlama {
  maqsad: number;
  eng_kichik: number;
  eng_katta: number;
  /** Yechimda ko'paytirish yoki bo'lish SHART bo'lsin. */
  kopaytir: boolean;
  /**
   * Yechim MANFIY oraliq natijasiz topilishi kerakmi.
   *
   * 1–4 sinf uchun shart: o'sha yoshda manfiy son hali o'tilmagan va
   * ekranda `−4` chiqishi bolani to'xtatib qo'yadi. Kattaroq
   * darajalarda esa aksincha — manfiy oraliq qiziqarli yo'l.
   */
  manfiysiz: boolean;
}

export const SOZLAMA: Record<Daraja, Sozlama> = {
  1: { maqsad: 12, eng_kichik: 1, eng_katta: 9, kopaytir: false, manfiysiz: true },
  2: { maqsad: 24, eng_kichik: 1, eng_katta: 9, kopaytir: true, manfiysiz: false },
  3: { maqsad: 24, eng_kichik: 2, eng_katta: 13, kopaytir: true, manfiysiz: false },
};

/** Ikki sonni amal bilan birlashtirish. Yaroqsiz bo'lsa — `null`. */
export function birlashtir(a: number, b: number, amal: Amal): number | null {
  if (amal === "+") return a + b;
  if (amal === "-") return a - b;
  if (amal === "*") return a * b;
  // Bo'lish faqat qoldiqsiz (izohga qarang).
  if (b === 0 || a % b !== 0) return null;
  return a / b;
}

export interface Qadam { a: number; b: number; amal: Amal; natija: number }

/**
 * Yechimni qidiradi: qadamlar ro'yxati yoki `null`.
 *
 * Har qadamda ikkita son olinadi, birlashtiriladi va natija ularning
 * o'rniga qo'yiladi — ya'ni to'rtta sondan uchta, keyin ikkita, oxirida
 * bitta qoladi. Qidiruv shu daraxt bo'ylab yuradi: to'rtta son uchun u
 * eng ko'pi bilan bir necha ming holat, ya'ni telefonda ham bir zumda.
 */
export function yechimTop(sonlar: number[], maqsad: number, manfiysiz = false): Qadam[] | null {
  if (sonlar.length === 1) return sonlar[0] === maqsad ? [] : null;
  for (let i = 0; i < sonlar.length; i++) {
    for (let j = 0; j < sonlar.length; j++) {
      if (i === j) continue;
      // `a − b` va `b − a` boshqa natija beradi, shuning uchun juftlik
      // TARTIBLI ko'rib chiqiladi; qo'shish va ko'paytirishda esa
      // takrorni tashlaymiz.
      const qolgan = sonlar.filter((_, k) => k !== i && k !== j);
      for (const amal of AMALLAR) {
        if ((amal === "+" || amal === "*") && i > j) continue;
        const n = birlashtir(sonlar[i], sonlar[j], amal);
        if (n === null) continue;
        if (manfiysiz && n < 0) continue;
        const keyin = yechimTop([...qolgan, n], maqsad, manfiysiz);
        if (keyin) return [{ a: sonlar[i], b: sonlar[j], amal, natija: n }, ...keyin];
      }
    }
  }
  return null;
}

export const yechimBormi = (sonlar: number[], maqsad: number, manfiysiz = false): boolean =>
  yechimTop(sonlar, maqsad, manfiysiz) !== null;

/** Faqat qo'shish-ayirish bilan yechiladimi — "juda oson" jumboqni tashlash uchun. */
function faqatQoshish(sonlar: number[], maqsad: number): boolean {
  const qidir = (s: number[]): boolean => {
    if (s.length === 1) return s[0] === maqsad;
    for (let i = 0; i < s.length; i++) {
      for (let j = 0; j < s.length; j++) {
        if (i === j) continue;
        const qolgan = s.filter((_, k) => k !== i && k !== j);
        for (const amal of ["+", "-"] as Amal[]) {
          if (amal === "+" && i > j) continue;
          const n = birlashtir(s[i], s[j], amal)!;
          if (qidir([...qolgan, n])) return true;
        }
      }
    }
    return false;
  };
  return qidir(sonlar);
}

/** Takrorlanuvchan tasodif (bir kun — bir xil to'plam). */
function rng(urug: number) {
  let x = urug >>> 0 || 1;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

/**
 * Bitta jumboq: yechimi BOR to'rtta son.
 *
 * Yaroqsiz to'plam qaytarilmaydi — o'yin "yechimi yo'q" jumboq berishi
 * eng yomon nosozlik bo'lardi: bola o'zini ayblaydi va o'yinni tashlaydi.
 */
export function jumboq(daraja: Daraja, tasodif: () => number): number[] {
  const s = SOZLAMA[daraja];
  const son = () => s.eng_kichik + Math.floor(tasodif() * (s.eng_katta - s.eng_kichik + 1));
  for (let i = 0; i < 400; i++) {
    const t = [son(), son(), son(), son()].sort((a, b) => a - b);
    if (!yechimBormi(t, s.maqsad, s.manfiysiz)) continue;
    // Yuqori darajalarda "hammasini qo'shsa bo'ldi" jumboq qiziq emas.
    if (s.kopaytir && faqatQoshish(t, s.maqsad)) continue;
    return t;
  }
  return daraja === 1 ? [2, 3, 3, 4] : [4, 6, 2, 3];
}

/** Kunlik to'plam: bir sana + daraja → hamma uchun bir xil jumboqlar. */
export function kunlikToplam(kun: string, daraja: Daraja, soni = 5): number[][] {
  const r = rng(kunUrugi(kun, 200 + daraja));
  const toplam: number[][] = [];
  for (let i = 0; i < soni; i++) toplam.push(jumboq(daraja, r));
  return toplam;
}

/** Tasodifiy jumboq — "yana bitta" tugmasi uchun. */
export const tasodifiyJumboq = (daraja: Daraja): number[] =>
  jumboq(daraja, Math.random);

/**
 * Maslahat — yechimning BIRINCHI qadami.
 *
 * To'liq yechimni ko'rsatish o'yinni tugatadi; birinchi qadam esa
 * qolganini bolaning o'ziga qoldiradi. Maslahat JORIY holatdan
 * hisoblanadi, ya'ni bola bir necha qadam qilganidan keyin ham to'g'ri
 * yo'lni ko'rsatadi.
 */
export function maslahat(sonlar: number[], maqsad: number, manfiysiz = false): Qadam | null {
  // Avval "chiroyli" yo'l bilan qidiramiz; topilmasa — istalgan yo'l
  // bilan, chunki bola allaqachon manfiy songa kirib qolgan bo'lishi
  // mumkin va unda ham maslahat kerak.
  const y = yechimTop(sonlar, maqsad, manfiysiz) ?? yechimTop(sonlar, maqsad);
  return y && y.length ? y[0] : null;
}
