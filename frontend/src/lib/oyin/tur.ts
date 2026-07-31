/**
 * O'yinlar bo'limining turlari va DARAJA qoidasi.
 *
 * O'YIN DARS EMAS — butun bo'lim shu farq ustiga qurilgan.
 *
 *   Dars    tartibli, tugaydi, yo'l xaritasiga yoziladi, yulduz beradi.
 *   O'yin   tartibsiz, tugamaydi, faqat REKORD qoldiradi, tanga beradi.
 *
 * Shuning uchun o'yinlar `curriculum/` ga qo'shilmadi: u yerdagi har bir
 * narsa "bob → dars → yulduz" mantig'iga bo'ysunadi va o'yinni unga tiqish
 * uchun soxta bob yasash kerak bo'lardi.
 *
 * ────────────────────── NEGA DARAJA, YOSH EMAS ──────────────────────
 *
 * O'yin qiyinligi YOSH bilan emas, DARAJA bilan tanlanadi. Yosh esa
 * darajaning yonida MASLAHAT bo'lib turadi ("6–9 yosh"). Farqi kichik
 * ko'rinadi, lekin oqibati katta:
 *
 *   Yosh — devor.  9 yoshli kuchli bola "bolalar darajasi" da zerikadi
 *                  va undan chiqa olmaydi.
 *   Yosh — uyat.   Qiynalayotgan 12 yoshli bola "kichiklar" ni tanlashdan
 *                  uyaladi va umuman o'ynamaydi.
 *   Yosh — yolg'on. Uni hech kim tekshirmaydi: reyting uchun hamma
 *                  "kattalar" ni tanlaydi va jadval ma'nosini yo'qotadi.
 *
 * Yozuv esa ota-onaga kerak: u bolasiga qaysi darajani berishni bir
 * qarashda biladi. Bola istagan payt yuqoriga ko'tarila oladi.
 *
 * REKORD VA REYTING har doim `o'yin + daraja` juftligi bo'yicha alohida
 * saqlanadi. Aks holda kattalar birinchi yigirma o'rinni egallab, bola
 * jadvalda umuman ko'rinmasdi.
 */
import type { IconName } from "../icons";
import type { UnitColor } from "../types";
import type { Kalit } from "../matn";

export type OyinId =
  | "tezkor"    // To'g'rimi? — tez javob
  | "belgi"     // yashirin amal: 6 ? 3 = 18
  | "jadval"    // ko'paytirish jadvali
  | "ketma"     // ketma-ketlik: 2, 4, 8, 16, ?
  | "taxmin"    // chamalash: 19 × 21 ≈ ?
  | "tarozi"    // tarozi: 🍎🍎🍎 = 12
  | "yigirma"   // 24 — sonlar sehri
  | "xotira";   // sonlar xotirasi

/** Qiyinlik. Uchta, ko'p emas: to'rtinchisi tanlovni og'irlashtiradi. */
export type Daraja = 1 | 2 | 3;

export const DARAJALAR: {
  n: Daraja;
  nom: Kalit;
  /** Yosh — MASLAHAT, shart emas. Ota-ona shunga qarab tanlaydi. */
  yosh: Kalit;
  rang: UnitColor;
  /**
   * Ochilish sharti: OLDINGI darajada shuncha ball to'plangan bo'lishi
   * kerak. Birinchi daraja doim ochiq (0).
   *
   * Qulf bolani majburlamaydi — u pastda o'ynayveradi. Lekin kattaga
   * aniq maqsad beradi va eng muhimi: hech kim isinmasdan turib eng
   * qiyin darajaga tushib, uch xato bilan chiqib ketmaydi.
   */
  ochish: number;
}[] = [
  { n: 1, nom: "darajaOson",  yosh: "darajaOsonYosh",  rang: "green", ochish: 0 },
  { n: 2, nom: "darajaOrta",  yosh: "darajaOrtaYosh",  rang: "blue",  ochish: 10 },
  { n: 3, nom: "darajaQiyin", yosh: "darajaQiyinYosh", rang: "red",   ochish: 15 },
];

export const darajaMa = (d: Daraja) => DARAJALAR[d - 1];

/**
 * Manzildagi "2-daraja" ni darajaga aylantiradi. Noto'g'ri bo'lsa `null`.
 *
 * Manzil o'qib tushunarli bo'lishi kerak — ilovaning qolgan qismida ham
 * shunday (`3-bob/2-dars`). Qo'lda o'zgartirilgan noto'g'ri manzil
 * bo'sh ekran emas, ro'yxatga qaytarishi kerak.
 */
export function darajaniOqi(x: string | undefined): Daraja | null {
  const m = /^([123])-daraja$/.exec(x ?? "");
  return m ? (Number(m[1]) as Daraja) : null;
}

/** Oqim o'yinining bitta savoli. */
export interface OqimSavol {
  /** Katta ifoda — ekran o'rtasida turadi: "7 × 8 = 54". */
  matn: string;
  /**
   * Ifoda USTIDAGI shart — tarozining birinchi qatori kabi.
   *
   * Alohida maydon kerak edi, chunki bu qism savolning o'zi emas,
   * BERILGANI: u boshqa o'lchamda va boshqa rangda turishi kerak.
   */
  ost?: string;
  /** Javob tugmalari. Ikkita bo'lsa keng, to'rtta bo'lsa setka. */
  variantlar: string[];
  javob: string;
  /**
   * Variantlar KATTA belgi bo'lib chizilsin.
   *
   * "+ − × ÷" bitta belgidan iborat va oddiy o'lchamda ular tugma
   * o'rtasida yo'qolib ketadi — barmoq qayerni bosishini bilmaydi.
   */
  belgi?: boolean;
}

export type Generator = (d: Daraja) => OqimSavol;

/**
 * Bitta o'yin haqidagi hamma narsa.
 *
 * `tur` o'yin qaysi ekran bilan chizilishini aytadi. Uchtasi bor va
 * bu ATAYLAB: sakkizta o'yinga sakkizta alohida ekran yozilsa,
 * ularning oltitasi bir-birini takrorlagan bo'lardi.
 *
 *   "oqim"     savol → javob → keyingisi. Oltita o'yin shu qolipda.
 *   "yigirma"  o'z taxtasi bor: sonlar bosilib birlashtiriladi.
 *   "xotira"   vaqt bilan emas, POG'ONA bilan o'lchanadi.
 */
export interface Oyin {
  id: OyinId;
  tur: "oqim" | "yigirma" | "xotira";
  ic: IconName;
  rang: UnitColor;
  /** Kartadagi katta belgi. */
  emoji: string;
  nom: Kalit;
  izoh: Kalit;
  /** "Qanday o'ynaladi" — daraja tanlash ekranida turadi. */
  qoida: Kalit;
  /** Oqim o'yinining savol yasovchisi. Boshqa turlarda bo'lmaydi. */
  gen?: Generator;
  /**
   * Oqim o'yini necha soniya davom etadi — daraja bo'yicha.
   *
   * Uchinchi daraja ATAYLAB qisqaroq: u yerda savol ham qiyin, vaqt ham
   * kam bo'lishi kerak, aks holda "qiyin" daraja shunchaki "sekinroq"
   * bo'lib qolardi.
   */
  vaqt?: [number, number, number];
}

/** O'yin tugaganda ekran shuni qaytaradi. */
export interface OyinNatija {
  /** To'plangan ball. Har o'yinda o'z ma'nosi bor, lekin doim "ko'p — yaxshi". */
  ball: number;
  /** O'ynalgan savollar soni — kunlik maqsadga shu qo'shiladi. */
  savollar: number;
}
