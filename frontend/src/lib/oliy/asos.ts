/**
 * 7–11-sinf generatorlari uchun umumiy yordamchilar.
 *
 * Nega alohida papka, `generators.ts` ning ichida emas: u fayl 1–6-sinf
 * uchun 2000 qatordan oshgan va yuqori sinflar unga yana shuncha
 * qo'shardi. Ikkinchi sabab muhimroq — yuqori sinf savollari boshqa
 * turdagi: ular ASOSAN MATN javob qaytaradi ("3x²", "x = 5", "±2√3"),
 * quyi sinflar esa deyarli har doim son. Shu sabab bu yerdagi
 * yordamchilar ham matn ustida ishlaydi.
 *
 * Qat'iy qoida: har bir generator SOF funksiya bo'lsin va chaqirilganda
 * yangi savol yasasin. Bola darsni qayta ochsa sonlar boshqacha bo'ladi
 * — bu butun ilovaning asosiy qoidasi va yuqori sinflarda ham buziladi
 * degan gap yo'q.
 */
import { pick, pcS, rnd, shuffle } from "../rnd";
import type { Qadam } from "../activity";
import type { YechimKalit } from "../tarjima/yechim";

/* ------------------------------------------------------------- yechim */

/**
 * Yechimning bitta qadami.
 *
 * Ataylab juda qisqa nom: u har bir generatorda uch-to'rt marta
 * takrorlanadi va uzun nom yechimni kodda savolning o'zidan kattaroq
 * ko'rsatib qo'yardi.
 *
 *   Y("formula", "S = a·b")   izoh + ifoda
 *   Y("qavsMinus")            faqat qoida, natijasi yo'q
 */
export const Y = (q: YechimKalit, ifoda?: string): Qadam => ({ q, if: ifoda });

/**
 * Manfiy sonni QAVSGA oladi: −6 → "(−6)", 6 → "6".
 *
 * Yechim qadamlarida shart. Qavssiz `−6²` yozuvi −(6²) = −36 deb
 * o'qiladi, holbuki ko'zda tutilgani (−6)² = 36. Xuddi shunday
 * `13 · −1` ham matematik yozuvda uchramaydi va o'quvchi uni xato deb
 * o'ylaydi. Musbat sonda qavs qo'yilmaydi — u faqat shovqin bo'lardi.
 */
export const qav = (n: number): string => (n < 0 ? `(${iz(n)})` : String(n));

/* ------------------------------------------------------------ belgilar */

/** Ustki indekslar: 2 → "²". Daraja matnda shunday yoziladi. */
export const UST = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];

/** Sonni ustki indeks bilan: 12 → "¹²". */
export const ust = (n: number): string =>
  String(n).split("").map((c) => (c === "-" ? "⁻" : UST[+c])).join("");

/** Pastki indekslar — ketma-ketlik hadlari uchun: a₁, aₙ. */
export const PAST = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
export const past = (n: number): string => String(n).split("").map((c) => PAST[+c]).join("");

/**
 * Minus belgisi — defis emas, HAQIQIY minus (U+2212).
 *
 * Farqi ko'rinadi: defis shriftda kalta va yuqoriroq turadi, ya'ni
 * "−5" o'rniga "-5" yozilsa son bilan belgi orasida chok paydo bo'ladi.
 * Butun ilova bo'ylab bitta belgi ishlatilishi kerak.
 */
export const iz = (n: number): string => (n < 0 ? `−${-n}` : String(n));

/** Qo'shiluvchi sifatida: 5 → "+ 5", −5 → "− 5". */
export const qosh = (n: number): string => (n < 0 ? `− ${-n}` : `+ ${n}`);

/** O'nli son, vergul bilan va ortiqcha nollarsiz: 3.5 → "3,5". */
export const dc = (x: number, d = 3): string =>
  (Math.round(x * 10 ** d) / 10 ** d)
    .toFixed(d)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "")
    .replace(".", ",");

/* ------------------------------------------------------------ kasrlar */

export const ekub = (a: number, b: number): number => (b === 0 ? Math.abs(a) : ekub(b, a % b));
export const ekuk = (a: number, b: number) => Math.abs((a / ekub(a, b)) * b);

/** Qisqartirilgan kasr matni: (6,8) → "3/4", (8,4) → "2", (3,−4) → "−3/4". */
export function fr(n: number, d: number): string {
  if (d < 0) { n = -n; d = -d; }
  const g = ekub(Math.abs(n), Math.abs(d)) || 1;
  const a = n / g, b = d / g;
  return b === 1 ? iz(a) : `${iz(a)}/${b}`;
}

/* -------------------------------------------------- algebraik ifodalar */

/**
 * Bitta had: koeffitsiyent + harf + daraja.
 *
 * `bosh` — had ifodaning BOSHIDA turibdimi. Boshida "+" yozilmaydi
 * ("+3x" emas, "3x"), o'rtasida esa albatta ishora kerak.
 *
 * Koeffitsiyent 1 va −1 alohida: "1x²" deb yozilgan ifoda darslikda
 * uchramaydi va bola uni xato deb o'ylaydi.
 */
export function had(k: number, harf: string, daraja = 1, bosh = true): string {
  if (k === 0) return "";
  const belgi = bosh ? (k < 0 ? "−" : "") : (k < 0 ? " − " : " + ");
  const son = Math.abs(k);
  const qism = daraja === 0 ? String(son) : `${son === 1 ? "" : son}${harf}${daraja === 1 ? "" : ust(daraja)}`;
  return belgi + (qism === "" ? "1" : qism);
}

/** Ko'phad: koeffitsiyentlar kamayuvchi darajalar bo'yicha. [1,−5,6] → "x² − 5x + 6". */
export function kophad(k: number[], harf = "x"): string {
  const n = k.length - 1;
  let s = "";
  for (let i = 0; i <= n; i++) {
    if (k[i] === 0) continue;
    s += had(k[i], harf, n - i, s === "");
  }
  return s || "0";
}

/* -------------------------------------------------- javob variantlari */

/**
 * Matn javob + chalg'ituvchilar. Takrorlanganlari o'zi tashlanadi.
 *
 * `zaxira` — chalg'ituvchilar YETMAY QOLGANDA ishlatiladi.
 *
 * Nega kerak: asosiy chalg'ituvchilar o'quvchi qiladigan aniq
 * xatolardan yasaladi va ba'zi qiymatlarda ularning hammasi bir-biriga
 * (yoki to'g'ri javobga) ustma-ust tushadi. Muntazam TO'RTburchakda
 * ichki burchak 90°, tashqi burchagi ham 360/4 = 90°, to'ldiruvchisi
 * ham 180 − 90 = 90° — uchalasi bitta son. O'shanda savolda ikkita
 * tugma qoladi va javob hisoblanmasdan, taxmin bilan topiladi.
 *
 * Zaxira variantlar shu holat uchun: ular mantiqiy xatoni bildirmaydi,
 * lekin savolni to'rt tugmali holida saqlaydi.
 */
export const sPick = (c: string, xato: string[], zaxira: string[] = []) => ({
  answer: c,
  choices: pcS(c, xato.filter((x) => x !== c), zaxira),
});

/**
 * Butun son javobi — javob ham, variantlar ham bir xil ko'rinishda.
 *
 * Chalg'ituvchilar YAXLITLANADI. Ular ko'pincha "yarmini olish" yoki
 * "ikkiga bo'lish" kabi xatolardan yasaladi va o'shanda 27,5 kabi kasr
 * chiqib qolishi mumkin. Butun sonlar orasida turgan bitta kasr esa
 * javobni oshkor qiladi: bola uni hisoblamasdan ham "boshqacha" deb
 * chiqarib tashlaydi.
 */
export function zPick(c: number, xato: number[]) {
  const s: number[] = [];
  xato.map((x) => Math.round(x)).forEach((x) => { if (x !== c && !s.includes(x)) s.push(x); });
  let k = 1;
  while (s.length < 3) {
    const v = c + k * (k % 2 ? 1 : -1) * (1 + (k >> 1));
    if (v !== c && !s.includes(v)) s.push(v);
    if (++k > 40) break;
  }
  return { answer: iz(c), choices: shuffle([c, ...s.slice(0, 3)]).map(iz) };
}

/** O'nli javob — yaqin qiymatlar bilan. */
export const dPick = (c: number, farq: number[]) => ({
  answer: dc(c),
  choices: pcS(dc(c), farq.map((f) => dc(c + f)), [dc(c * 2), dc(c / 2)]),
});

/** Ikki ildizli javob: "x₁ = 2,  x₂ = 5" ko'rinishida. */
export const ikkiIldiz = (a: number, b: number): string =>
  a === b ? `x = ${iz(a)}` : `x₁ = ${iz(Math.min(a, b))},  x₂ = ${iz(Math.max(a, b))}`;

/* ------------------------------------------------------------ sonlar */

/** Kvadrati butun bo'lgan sonlar — ildiz chiqadigan misollar uchun. */
export const KVADRAT = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400];

/** Pifagor uchliklari — to'g'ri burchakli uchburchak masalalari uchun. */
export const PIFAGOR = [
  [3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15],
  [7, 24, 25], [20, 21, 29], [12, 16, 20], [10, 24, 26], [15, 20, 25],
] as const;

/** Nol bo'lmagan tasodifiy son. */
export const nz = (a: number, b: number): number => {
  const v = rnd(a, b);
  return v === 0 ? b : v;
};

/** Ro'yxatdan `n` ta har xil element. */
export const bir_nechta = <T,>(arr: readonly T[], n: number): T[] => shuffle([...arr]).slice(0, n);

export { pick, rnd, shuffle };
