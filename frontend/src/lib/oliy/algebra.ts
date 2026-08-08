/**
 * 7–9-sinf algebra savollari.
 *
 * Manba:
 *   Sh. A. Alimov va boshq., "Algebra 7" (5-nashr)
 *   "Algebra 8" (2019) — algebraik kasrlar, tengsizliklar, kvadrat tenglamalar
 *   "Algebra 9" (2019) — kvadrat funksiya, trigonometriya, progressiyalar
 *
 * ─────────────────── JAVOB NEGA MATN ───────────────────
 *
 * Quyi sinflarda javob deyarli har doim son edi. Bu yerda esa javob
 * IFODA bo'ladi: "3x²", "(x−4)(x+4)", "x₁ = 2, x₂ = 5". Shu sababdan
 * chalg'ituvchilarni tasodifiy yasab bo'lmaydi — ular o'quvchi qiladigan
 * ANIQ XATOga to'g'ri kelishi kerak:
 *
 *   • daraja xossasida ko'rsatkichlarni qo'shish o'rniga ko'paytirish
 *   • (a+b)² da o'rta hadni tushirib qoldirish
 *   • kvadrat tenglamada ildiz ishorasini teskari olish
 *   • qavs oldidagi minusni faqat birinchi hadga tarqatish
 *
 * Har bir generatorda o'sha xatolar ataylab variant bo'lib turadi. Bu
 * savolni qiyinlashtirish uchun emas: tasodifiy variant orasidan
 * to'g'risi ko'rinib turadi va bola misolni YECHMASDAN topadi.
 */
import type { Activity } from "../activity";
import { po } from "../tarjima/oliy";
import {
  dc, ekub, fr, had, ikkiIldiz, iz, kophad, nz, past, pick, qosh, rnd,
  sPick, shuffle, ust, zPick,
} from "./asos";

/* ==================================================================== */
/*                          7-SINF ALGEBRA                              */
/* ==================================================================== */

/* ---------- I bob. Algebraik ifodalar ---------- */

/** 1-§. Sonli ifodaning qiymati — amallar tartibi bilan. */
export const a7Sonli = (): Activity => {
  const a = rnd(2, 12), b = rnd(2, 9), c = rnd(2, 9);
  const s = a + b * c;
  // Eng ko'p uchraydigan xato — chapdan o'ngga qarab hisoblash.
  return {
    type: "eqn", text: `${a} + ${b} · ${c} = ?`, prompt: po("ifodaQiymati"),
    ...zPick(s, [(a + b) * c, a * b + c, s - b]),
  };
};

/** 2-§. Algebraik ifodaning berilgan qiymatdagi soni. */
export const a7Algebraik = (): Activity => {
  const a = rnd(2, 8), b = rnd(2, 12), x = rnd(2, 9);
  const s = a * x + b;
  return {
    type: "eqn", text: `${had(a, "x")} + ${b},   x = ${x}`, prompt: po("ifodaQiymati"),
    ...zPick(s, [a + x + b, a * (x + b), s - b]),
  };
};

/** 3-§. Formula bo'yicha hisoblash — perimetr, yuza, tezlik. */
export const a7Formula = (): Activity => {
  const t = rnd(0, 2);
  if (t === 0) {
    const a = rnd(3, 20), b = rnd(3, 20), P = 2 * (a + b);
    return { type: "eqn", text: `P = 2(a + b),  a = ${a},  b = ${b}`, prompt: po("formulaQiymat"), ...zPick(P, [a + b, a * b, 2 * a + b]) };
  }
  if (t === 1) {
    const v = rnd(4, 20), tt = rnd(2, 9), S = v * tt;
    return { type: "eqn", text: `S = v · t,  v = ${v},  t = ${tt}`, prompt: po("formulaQiymat"), ...zPick(S, [v + tt, S / 2, v - tt]) };
  }
  const a = rnd(3, 15), S = a * a;
  return { type: "eqn", text: `S = a²,  a = ${a}`, prompt: po("formulaQiymat"), ...zPick(S, [a * 2, a * 4, a * a * a]) };
};

/** 5-§. Qavslarni ochish — minus qavs oldida turgan hol. */
export const a7Qavs = (): Activity => {
  const a = rnd(2, 12), b = rnd(2, 12), c = rnd(2, 9);
  if (Math.random() < 0.5) {
    // a − (b − c): minusni IKKALA hadga tarqatish kerak.
    const s = a - (b - c);
    return { type: "eqn", text: `${a} − (${b} − ${c}) = ?`, prompt: po("qavsOching"), ...zPick(s, [a - b - c, a + b - c, b - c]) };
  }
  const k = rnd(2, 6), s = k * (a + b);
  return { type: "eqn", text: `${k}(${a} + ${b}) = ?`, prompt: po("qavsOching"), ...zPick(s, [k * a + b, a + k * b, k + a + b]) };
};

/* ---------- II bob. Bir noma'lumli birinchi darajali tenglamalar ---------- */

/** 6-§. Berilgan son tenglamaning ildizimi. */
export const a7Ildiz = (): Activity => {
  const a = rnd(2, 9), x = rnd(2, 12), b = nz(-15, 15);
  const c = a * x + b;
  const notogri = shuffle([x + 1, x - 1, -x, c - b]).filter((v) => v !== x).slice(0, 3);
  return {
    type: "eqn", text: `${had(a, "x")} ${qosh(b)} = ${iz(c)}`, prompt: po("ildiziQaysi"),
    ...zPick(x, notogri),
  };
};

/** 7-§. ax + b = cx + d ko'rinishidagi tenglama. */
export const a7Tenglama = (): Activity => {
  const x = nz(-9, 9);
  const a = rnd(3, 9), c = rnd(1, a - 1), b = nz(-12, 12);
  const d = (a - c) * x + b;
  return {
    type: "eqn", text: `${had(a, "x")} ${qosh(b)} = ${had(c, "x")} ${qosh(d)}`,
    prompt: po("tenglamaYech"), ...zPick(x, [-x, x + 1, b - d]),
  };
};

/** 8-§. Masalani tenglama bilan yechish — ikki son yig'indisi. */
export const a7Masala = (): Activity => {
  const kichik = rnd(4, 40), farq = rnd(3, 25);
  const yigindi = kichik * 2 + farq;
  return {
    type: "eqn",
    text: po("txtQator", { q: `x + (x + ${farq}) = ${yigindi}` }),
    prompt: po("masalaTenglama"), ...zPick(kichik, [kichik + farq, yigindi - farq, yigindi / 2]),
  };
};

/* ---------- III bob. Birhad va ko'phadlar ---------- */

/** 9-§. Natural ko'rsatkichli daraja. */
export const a7Daraja = (): Activity => {
  const a = rnd(2, 7), n = rnd(2, 4), s = a ** n;
  return { type: "eqn", text: `${a}${ust(n)} = ?`, prompt: po("darajaHisobla"), ...zPick(s, [a * n, a ** (n - 1), s + a]) };
};

/** 10-§. Daraja xossalari: aⁿ · aᵏ, aⁿ : aᵏ, (aⁿ)ᵏ. */
export const a7DarajaXossa = (): Activity => {
  const L = pick(["a", "x", "b", "y"]);
  const n = rnd(2, 7), k = rnd(2, 6);
  const t = rnd(0, 2);
  if (t === 0) {
    const j = `${L}${ust(n + k)}`;
    return {
      type: "eqn", text: `${L}${ust(n)} · ${L}${ust(k)} = ?`, prompt: po("darajaXossa"),
      // Xato: ko'rsatkichlarni ko'paytirish yoki asosni ham ko'paytirish.
      ...sPick(j, [`${L}${ust(n * k)}`, `${L}${ust(Math.abs(n - k))}`, `2${L}${ust(n + k)}`]),
    };
  }
  if (t === 1) {
    const b = n + k;                                  // bo'linuvchi kattaroq bo'lsin
    const j = `${L}${ust(k)}`;
    return {
      type: "eqn", text: `${L}${ust(b)} : ${L}${ust(n)} = ?`, prompt: po("darajaXossa"),
      ...sPick(j, [`${L}${ust(b + n)}`, `${L}${ust(b * n)}`, `${L}${ust(1)}`]),
    };
  }
  const j = `${L}${ust(n * k)}`;
  return {
    type: "eqn", text: `(${L}${ust(n)})${ust(k)} = ?`, prompt: po("darajaXossa"),
    ...sPick(j, [`${L}${ust(n + k)}`, `${L}${ust(n ** k)}`, `${n * k}${L}`]),
  };
};

/** 11–12-§. Birhadlarni ko'paytirish. */
export const a7Birhad = (): Activity => {
  const a = rnd(2, 8), b = rnd(2, 8), n = rnd(1, 4), k = rnd(1, 4);
  const j = had(a * b, "x", n + k);
  return {
    type: "eqn", text: `${had(a, "x", n)} · ${had(b, "x", k)} = ?`, prompt: po("birhadKopaytir"),
    ...sPick(j, [had(a * b, "x", n * k), had(a + b, "x", n + k), had(a * b, "x", Math.max(n, k))]),
  };
};

/** 14-§. O'xshash hadlarni ixchamlash. */
export const a7Oxshash = (): Activity => {
  const a = rnd(2, 12), b = rnd(2, 12), c = rnd(2, 9);
  const j = `${had(a + b, "x")}${had(c, "y", 1, false)}`;
  return {
    type: "eqn", text: `${had(a, "x")}${had(c, "y", 1, false)}${had(b, "x", 1, false)} = ?`,
    prompt: po("oxshashHad"),
    ...sPick(j, [
      had(a + b + c, "x"),
      `${had(a + b, "x")}${had(-c, "y", 1, false)}`,
      `${had(a * b, "x")}${had(c, "y", 1, false)}`,
    ]),
  };
};

/** 15-§. Ko'phadlarni qo'shish va ayirish. */
export const a7KophadQosh = (): Activity => {
  const [a, b, c, d] = [rnd(2, 9), nz(-9, 9), rnd(2, 9), nz(-9, 9)];
  if (Math.random() < 0.5) {
    const j = kophad([a + c, b + d]);
    return {
      type: "eqn", text: `(${kophad([a, b])}) + (${kophad([c, d])}) = ?`, prompt: po("kophadQosh"),
      ...sPick(j, [kophad([a + c, b - d]), kophad([a * c, b + d]), kophad([a + c + b + d, 0])]),
    };
  }
  // Ayirishda eng ko'p uchraydigan xato — ikkinchi qavsdagi ozod hadning
  // ishorasini o'zgartirmaslik.
  const j = kophad([a - c, b - d]);
  return {
    type: "eqn", text: `(${kophad([a, b])}) − (${kophad([c, d])}) = ?`, prompt: po("kophadAyir"),
    ...sPick(j, [kophad([a - c, b + d]), kophad([a + c, b - d]), kophad([c - a, d - b])]),
  };
};

/** 16-§. Ko'phadni birhadga ko'paytirish: kx(ax + b). */
export const a7KophadBirhad = (): Activity => {
  const k = rnd(2, 7), a = rnd(2, 9), b = nz(-9, 9);
  // kx · (ax + b) = ka·x² + kb·x
  const j = kophad([k * a, k * b, 0]);
  return {
    type: "eqn", text: `${had(k, "x")} · (${kophad([a, b])}) = ?`, prompt: po("kophadKopaytir"),
    // Xato: birhadni faqat BIRINCHI hadga ko'paytirish (eng ko'p uchraydigani).
    ...sPick(j, [kophad([k * a, b, 0]), kophad([a, k * b, 0]), kophad([k * a, k * b])]),
  };
};

/** 17-§. Ko'phadni ko'phadga ko'paytirish: (x+a)(x+b). */
export const a7KophadKophad = (): Activity => {
  const a = nz(-9, 9), b = nz(-9, 9);
  const j = kophad([1, a + b, a * b]);
  return {
    type: "eqn", text: `(x ${qosh(a)})(x ${qosh(b)}) = ?`, prompt: po("kophadKopaytir"),
    // Xato: o'rta hadni tushirib qoldirish yoki ko'paytma o'rniga yig'indi.
    ...sPick(j, [kophad([1, 0, a * b]), kophad([1, a * b, a + b]), kophad([1, a + b, a + b])]),
  };
};

/** 18-§. Ko'phadni birhadga bo'lish: (ka·xⁿ⁺¹ + kb·x) : kx. */
export const a7Bolish = (): Activity => {
  const k = rnd(2, 6), a = rnd(2, 8), b = rnd(2, 8), n = rnd(2, 4);
  const j = `${had(a, "x", n)}${had(b, "x", 0, false)}`;
  return {
    type: "eqn",
    text: `(${had(a * k, "x", n + 1)}${had(b * k, "x", 1, false)}) : ${had(k, "x")} = ?`,
    prompt: po("kophadBol"),
    // Xato: darajani kamaytirmaslik yoki koeffitsiyentni bo'lmaslik.
    ...sPick(j, [
      `${had(a, "x", n + 1)}${had(b, "x", 0, false)}`,
      `${had(a * k, "x", n)}${had(b, "x", 0, false)}`,
      `${had(a, "x", n)}${had(b * k, "x", 0, false)}`,
    ]),
  };
};

/* ---------- IV bob. Ko'phadni ko'paytuvchilarga ajratish ---------- */

/** 19-§. Umumiy ko'paytuvchini qavsdan chiqarish. */
export const a7Umumiy = (): Activity => {
  const k = rnd(2, 9), a = rnd(2, 9), b = rnd(2, 9);
  const j = `${k}(${kophad([a, b])})`;
  return {
    type: "eqn", text: `${had(k * a, "x")}${had(k * b, "x", 0, false)} = ?`, prompt: po("umumiyKopaytuvchi"),
    ...sPick(j, [`${k}(${kophad([a * k, b])})`, `${k * a}(${kophad([1, b])})`, `${k}(${kophad([a, b * k])})`]),
  };
};

/** 21-§. Yig'indi va ayirmaning kvadrati. */
export const a7Kvadrat = (): Activity => {
  const a = rnd(1, 9), manfiy = Math.random() < 0.5;
  const b = manfiy ? -a : a;
  const j = kophad([1, 2 * b, a * a]);
  return {
    type: "eqn", text: `(x ${qosh(b)})${ust(2)} = ?`, prompt: po("yigindiKvadrat"),
    // Klassik xato: o'rta hadni butunlay tushirib qoldirish.
    ...sPick(j, [kophad([1, 0, a * a]), kophad([1, b, a * a]), kophad([1, 2 * b, 2 * a])]),
  };
};

/** 22-§. Kvadratlar ayirmasi: x² − a² = (x−a)(x+a). */
export const a7KvadratAyirma = (): Activity => {
  const a = rnd(2, 12);
  const j = `(x − ${a})(x + ${a})`;
  return {
    type: "eqn", text: `x${ust(2)} − ${a * a} = ?`, prompt: po("kvadratlarAyirmasi"),
    ...sPick(j, [`(x − ${a})${ust(2)}`, `(x + ${a})${ust(2)}`, `(x − ${a * a})(x + ${a * a})`]),
  };
};

/** 23-§. Bir necha usulni birgalikda qo'llash. */
export const a7Birgalikda = (): Activity => {
  const k = rnd(2, 6), a = rnd(2, 9);
  const j = `${k}(x − ${a})(x + ${a})`;
  return {
    type: "eqn", text: `${k}x${ust(2)} − ${k * a * a} = ?`, prompt: po("kopaytuvchiAjrat"),
    ...sPick(j, [`${k}(x − ${a})${ust(2)}`, `(x − ${a})(x + ${a})`, `${k}(x${ust(2)} − ${a})`]),
  };
};

/* ---------- V bob. Algebraik kasrlar ---------- */

/** 24-§. Algebraik kasrni qisqartirish. */
export const a7KasrQisqa = (): Activity => {
  const k = rnd(2, 8), a = rnd(2, 9), n = rnd(1, 3);
  const j = had(a, "x", n);
  return {
    type: "eqn", text: `${had(a * k, "x", n + 1)} / ${had(k, "x")}`, prompt: po("kasrQisqartir"),
    ...sPick(j, [had(a * k, "x", n), had(a, "x", n + 1), had(a, "x", 1)]),
  };
};

/** 26-§. Bir xil maxrajli algebraik kasrlarni qo'shish. */
export const a7KasrQosh = (): Activity => {
  const a = rnd(2, 9), b = rnd(2, 9), m = rnd(2, 9);
  const j = `${a + b}/${m}`;
  return {
    type: "eqn", text: `${a}/${m} + ${b}/${m} = ?`, prompt: po("kasrAmal"),
    ...sPick(j, [`${a + b}/${m * 2}`, `${a * b}/${m}`, `${a + b}/${m + m}`]),
  };
};

/** 27-§. Algebraik kasrlarni ko'paytirish. */
export const a7KasrKopaytir = (): Activity => {
  const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9), d = rnd(2, 9);
  const j = fr(a * c, b * d);
  return {
    type: "eqn", text: `${a}/${b} · ${c}/${d} = ?`, prompt: po("kasrAmal"),
    ...sPick(j, [fr(a * d, b * c), fr(a + c, b + d), `${a * c}/${b + d}`]),
  };
};

/* ---------- VI bob. Kombinatorika elementlari ---------- */

/** 29-§. Kombinatorikaning asosiy qoidasi — ko'paytirish. */
export const a7Kombinatorika = (): Activity => {
  const a = rnd(2, 6), b = rnd(2, 5), c = rnd(2, 4);
  const s = a * b * c;
  return {
    type: "eqn", text: po("txtNechtaUsul", { a, b, c }), prompt: po("kombinatorikaQoida"),
    ...zPick(s, [a + b + c, a * b, (a + b) * c]),
  };
};

/** 30-§. O'rin almashtirish — n!. */
export const a7Orin = (): Activity => {
  const n = rnd(3, 6);
  let s = 1;
  for (let i = 2; i <= n; i++) s *= i;
  return {
    type: "eqn", text: `P${past(n)} = ${n}! = ?`, prompt: po("orinAlmashtirish"),
    ...zPick(s, [n * n, s / n, n * (n - 1)]),
  };
};

/* ==================================================================== */
/*                          8-SINF ALGEBRA                              */
/* ==================================================================== */

/* ---------- I bob. Algebraik kasrlar va ular ustida amallar ---------- */

/** 3-§. Kasrlarni umumiy maxrajga keltirish.
 *
 * Maxrajlar HAR XIL, surat esa maxrajdan kichik bo'lishi shart: aks
 * holda "4/2 + 3/3" kabi misol chiqadi va u umumiy maxrajni umuman
 * talab qilmaydi — ikkala kasr ham butun songa qisqaradi. */
export const a8UmumiyMaxraj = (): Activity => {
  const b = rnd(3, 9);
  let d = rnd(3, 9);
  while (d === b) d = rnd(3, 9);
  const a = rnd(1, b - 1), c = rnd(1, d - 1);
  const m = (b * d) / ekub(b, d);
  const j = fr(a * (m / b) + c * (m / d), m);
  return {
    type: "eqn", text: `${a}/${b} + ${c}/${d} = ?`, prompt: po("kasrAmal"),
    // Klassik xato: suratni suratga, maxrajni maxrajga qo'shish.
    ...sPick(j, [`${a + c}/${b + d}`, fr(a + c, m), `${a * d + c * b}/${b + d}`]),
  };
};

/** 7-§. y = k/x funksiya — teskari proporsionallik. */
export const a8Teskari = (): Activity => {
  const k = pick([6, 8, 12, 18, 24, 36, 48, 60]);
  const boluvchi: number[] = [];
  for (let i = 2; i <= k; i++) if (k % i === 0) boluvchi.push(i);
  const x = pick(boluvchi), y = k / x;
  return {
    type: "eqn", text: `y = ${k}/x,   x = ${x}`, prompt: po("teskariProp"),
    ...zPick(y, [k * x, k - x, x]),
  };
};

/** 8-§. Arifmetik kvadrat ildiz. */
export const a8Ildiz = (): Activity => {
  const a = rnd(2, 20), n = a * a;
  return { type: "eqn", text: `√${n} = ?`, prompt: po("ildizHisobla"), ...zPick(a, [n / 2, a * 2, a + 1]) };
};

/** 8-§. Ildiz xossalari: √a·√b va √(a/b). */
export const a8IldizXossa = (): Activity => {
  if (Math.random() < 0.5) {
    const a = pick([2, 3, 5, 6, 7, 8]), b = pick([2, 3, 5, 6, 8]);
    const kop = a * b;
    const ildiz = Math.sqrt(kop);
    const butun = Number.isInteger(ildiz);
    const j = butun ? String(ildiz) : `√${kop}`;
    // `√kop` chalg'ituvchi sifatida FAQAT ildiz butun chiqmaganda
    // yaramaydi: √25 ham, 5 ham bir xil son — ikkita to'g'ri javob
    // bo'lib qolardi va bola qaysinisini bossa ham "xato" eshitardi.
    return {
      type: "eqn", text: `√${a} · √${b} = ?`, prompt: po("ildizXossa"),
      ...sPick(j, [`√${a + b}`, String(a * b), butun ? `√${a + b + 1}` : String(kop)]),
    };
  }
  const b = pick([2, 3, 4, 5]), a = b * b * pick([1, 4, 9]);
  const j = dc(Math.sqrt(a / (b * b)));
  return {
    type: "eqn", text: `√(${a}/${b * b}) = ?`, prompt: po("ildizXossa"),
    ...sPick(j, [dc(a / (b * b)), dc(Math.sqrt(a) / b / b), dc(Math.sqrt(a))]),
  };
};

/** 9-§. Ratsional ko'rsatkichli daraja: a^(1/n) va a^(m/n). */
export const a8RatsionalDaraja = (): Activity => {
  const a = pick([4, 8, 9, 16, 25, 27, 32, 64, 81]);
  const n = a === 8 || a === 27 || a === 32 || a === 64 ? 3 : 2;
  const asos = Math.round(a ** (1 / n));
  // Ko'rsatkich oddiy kasr bo'lib yoziladi: `4^(1/2)`. Ustki indeksda
  // kasr chizig'i uchun to'g'ri belgi yo'q va uning o'rniga qo'yiladigan
  // har qanday belgi ekranda begona ko'rinadi.
  return {
    type: "eqn", text: `${a}^(1/${n}) = ?`, prompt: po("ratsionalDaraja"),
    ...zPick(asos, [a / n, a * n, asos + 1]),
  };
};

/* ---------- II bob. Tengsizliklar ---------- */

/** 11–12-§. Qaysi sonli tengsizlik to'g'ri. */
export const a8SonliTengsizlik = (): Activity => {
  const togri = [`${rnd(2, 9)}${ust(2)} > 0`, "−7 < −2", "0 > −1", "|−4| > 3", "−2 · (−3) > 0"];
  const notogri = ["−5 > −3", "|−4| < 3", "√9 < 2", "−1 > 0", "−10 > −4"];
  return {
    type: "eqn", text: "…", prompt: po("tengsizlikTogri"),
    ...sPick(pick(togri), shuffle([...notogri]).slice(0, 3)),
  };
};

/** 15-§. Bir noma'lumli chiziqli tengsizlik. */
export const a8Tengsizlik = (): Activity => {
  const a = rnd(2, 9), x = rnd(2, 12), b = nz(-15, 15);
  const c = a * x + b;
  const j = `x > ${x}`;
  return {
    type: "eqn", text: `${had(a, "x")} ${qosh(b)} > ${iz(c)}`, prompt: po("tengsizlikYech"),
    // Xato: ishorani teskari o'girish yoki koeffitsiyentga bo'lmaslik.
    ...sPick(j, [`x < ${x}`, `x > ${iz(c - b)}`, `x ≥ ${x}`]),
  };
};

/** 16-§. Yechim qaysi sonli oraliqda. */
export const a8Oraliq = (): Activity => {
  const a = rnd(-8, 4), b = a + rnd(2, 9);
  const j = `(${iz(a)}; ${iz(b)})`;
  return {
    type: "eqn", text: `${iz(a)} < x < ${iz(b)}`, prompt: po("oraliqQaysi"),
    ...sPick(j, [`[${iz(a)}; ${iz(b)}]`, `(${iz(b)}; ${iz(a)})`, `(${iz(a)}; ${iz(b)}]`]),
  };
};

/** 17-§. Sonning moduli va modulli tenglama. */
export const a8Modul = (): Activity => {
  if (Math.random() < 0.5) {
    const a = nz(-20, 20), s = Math.abs(a);
    return { type: "eqn", text: `|${iz(a)}| = ?`, prompt: po("modulHisobla"), ...zPick(s, [a, -s, s + 1]) };
  }
  const a = rnd(2, 15);
  const j = `x = ${a},  x = −${a}`;
  return {
    type: "eqn", text: `|x| = ${a}`, prompt: po("modulTenglama"),
    ...sPick(j, [`x = ${a}`, `x = −${a}`, `x = ${a * 2}`]),
  };
};

/** 20-§. Sonlarni yaxlitlash. */
export const a8Yaxlit = (): Activity => {
  const butun = rnd(1, 99), kasr = rnd(1, 99);
  const son = butun + kasr / 100;
  const s = Math.round(son * 10) / 10;
  return {
    type: "eqn", text: `${dc(son)} ≈ ?   (0,1 gacha)`, prompt: po("yaxlitla"),
    // Xato: yaxlitlash o'rniga shunchaki kesib tashlash (10,17 → 10,1).
    ...sPick(dc(s), [dc(Math.floor(son * 10) / 10), dc(Math.round(son)), dc(son)]),
  };
};

/* ---------- III bob. Kvadrat tenglamalar ---------- */

/** 22–23-§. Chala kvadrat tenglama: ax² + c = 0 va ax² + bx = 0. */
export const a8Chala = (): Activity => {
  if (Math.random() < 0.5) {
    const a = rnd(2, 15);
    const j = `x = ${a},  x = −${a}`;
    return {
      type: "eqn", text: `x${ust(2)} − ${a * a} = 0`, prompt: po("kvadratIldizlari"),
      ...sPick(j, [`x = ${a}`, `x = ${a * a}`, po("jYoq")]),
    };
  }
  const b = rnd(2, 12);
  const j = `x = 0,  x = ${b}`;
  return {
    type: "eqn", text: `x${ust(2)} − ${b}x = 0`, prompt: po("kvadratIldizlari"),
    ...sPick(j, [`x = ${b}`, `x = 0`, `x = −${b}`]),
  };
};

/** 24-§. Diskriminant. */
export const a8Diskriminant = (): Activity => {
  const a = 1, b = nz(-9, 9), c = nz(-12, 12);
  const D = b * b - 4 * a * c;
  return {
    type: "eqn", text: `${kophad([1, b, c])} = 0`, prompt: po("diskriminant"),
    ...zPick(D, [b * b + 4 * c, b * b - c, -D]),
  };
};

/** 24-§. Nechta ildiz bor — diskriminantning ishorasiga qarab. */
export const a8NechtaIldiz = (): Activity => {
  const t = rnd(0, 2);
  // b JUFT tanlanadi: D = 0 holatida c = b²/4 bo'ladi va toq b da u
  // kasr chiqib qolardi ("x² + x + 0,25 = 0"). Bunday tenglama
  // darslikda uchramaydi va o'quvchini savolning o'zidan chalg'itadi.
  const b = 2 * nz(-4, 4);
  // D > 0 — ikkita, D = 0 — bitta, D < 0 — yo'q.
  const c = t === 0 ? -rnd(1, 9) : t === 1 ? (b * b) / 4 : (b * b) / 4 + rnd(1, 5);
  const D = b * b - 4 * c;
  const javob = D > 0 ? po("jIkkita") : D === 0 ? po("jBitta") : po("jYoq");
  return {
    type: "eqn", text: `${kophad([1, b, c])} = 0`, prompt: po("nechtaIldiz"),
    answer: javob, choices: shuffle([po("jIkkita"), po("jBitta"), po("jYoq")]),
  };
};

/** 24-§. To'liq kvadrat tenglamaning ildizlari — ildizlari butun bo'ladi. */
export const a8Kvadrat = (): Activity => {
  const x1 = nz(-9, 9), x2 = nz(-9, 9);
  const b = -(x1 + x2), c = x1 * x2;
  return {
    type: "eqn", text: `${kophad([1, b, c])} = 0`, prompt: po("kvadratIldizlari"),
    // Xato: ildizlarni ishorasi bilan olish (Viyetdagi eng ko'p uchraydigan xato).
    ...sPick(ikkiIldiz(x1, x2), [ikkiIldiz(-x1, -x2), ikkiIldiz(x1, -x2), ikkiIldiz(b, c)]),
  };
};

/** 25-§. Viyet teoremasi. */
export const a8Viyet = (): Activity => {
  const x1 = nz(-9, 9), x2 = nz(-9, 9);
  const b = -(x1 + x2), c = x1 * x2;
  if (Math.random() < 0.5) {
    return {
      type: "eqn", text: `${kophad([1, b, c])} = 0,   x₁ + x₂ = ?`, prompt: po("viyet"),
      ...zPick(x1 + x2, [b, c, x1 * x2]),
    };
  }
  return {
    type: "eqn", text: `${kophad([1, b, c])} = 0,   x₁ · x₂ = ?`, prompt: po("viyet"),
    ...zPick(c, [-c, x1 + x2, b]),
  };
};

/** 25-§. Kvadrat uchhadni ko'paytuvchilarga ajratish. */
export const a8Uchhad = (): Activity => {
  const x1 = nz(-8, 8), x2 = nz(-8, 8);
  const b = -(x1 + x2), c = x1 * x2;
  const j = `(x ${qosh(-x1)})(x ${qosh(-x2)})`;
  return {
    type: "eqn", text: `${kophad([1, b, c])} = ?`, prompt: po("uchhadAjrat"),
    ...sPick(j, [`(x ${qosh(x1)})(x ${qosh(x2)})`, `(x ${qosh(-x1)})(x ${qosh(x2)})`, `(x ${qosh(b)})(x ${qosh(c)})`]),
  };
};

/** 26-§. Bikvadrat tenglama: x⁴ + bx² + c = 0.
 *
 * t = x² almashtirish qilinadi, ya'ni t uchun ildizlar MUSBAT to'la
 * kvadrat bo'lishi kerak — aks holda x butun chiqmaydi va javob
 * variantlari o'qilmaydigan ildizlarga to'lib ketardi. */
export const a8Bikvadrat = (): Activity => {
  const [k1, k2] = shuffle([1, 2, 3, 4, 5]).slice(0, 2).sort((x, y) => x - y);
  const p = k1 * k1, q = k2 * k2;          // t ning ildizlari
  const b = -(p + q), c = p * q;
  const j = `±${k1},  ±${k2}`;
  return {
    type: "eqn", text: `x${ust(4)} ${qosh(b)}x${ust(2)} ${qosh(c)} = 0`, prompt: po("bikvadrat"),
    // Xato: t ning ildizlarini x deb olish, yoki manfiylarini unutish.
    ...sPick(j, [`${k1},  ${k2}`, `±${p},  ±${q}`, `±${k1 * k2}`]),
  };
};

/* ---------- IV bob. Ma'lumotlar tahlili ---------- */

const namuna = (n: number) => Array.from({ length: n }, () => rnd(1, 20));

/** 29-§. O'rta arifmetik qiymat. */
export const a8Orta = (): Activity => {
  const n = pick([4, 5]);
  let arr = namuna(n);
  // Yig'indi butun bo'lib bo'linsin — o'rtacha kasr chiqmasin.
  const qoldiq = arr.reduce((a, b) => a + b, 0) % n;
  if (qoldiq) arr[0] += n - qoldiq;
  arr = arr.map((x) => Math.min(x, 30));
  const s = arr.reduce((a, b) => a + b, 0) / n;
  return {
    type: "eqn", text: arr.join(",  "), prompt: po("ortaQiymat"),
    ...zPick(s, [Math.max(...arr), Math.min(...arr), arr.reduce((a, b) => a + b, 0)]),
  };
};

/** 29-§. Moda — eng ko'p uchragan qiymat. */
export const a8Moda = (): Activity => {
  const m = rnd(2, 12);
  const boshqa = shuffle([m + 1, m + 2, m + 3, m - 1].filter((x) => x > 0)).slice(0, 3);
  const arr = shuffle([m, m, m, ...boshqa]);
  return {
    type: "eqn", text: arr.join(",  "), prompt: po("moda"),
    ...zPick(m, boshqa),
  };
};

/** 29-§. Mediana — tartiblangan qatorning o'rtasi. */
export const a8Mediana = (): Activity => {
  const arr = shuffle(namuna(5));
  const s = [...arr].sort((a, b) => a - b)[2];
  return {
    type: "eqn", text: arr.join(",  "), prompt: po("mediana"),
    ...zPick(s, [arr[2], Math.max(...arr), Math.min(...arr)]),
  };
};

/* ==================================================================== */
/*                          9-SINF ALGEBRA                              */
/* ==================================================================== */

/* ---------- I bob. Kvadrat funksiya. Kvadrat tengsizliklar ---------- */

/** 3-§. y = ax² — tarmoqlar yo'nalishi. */
export const a9Tarmoq = (): Activity => {
  const a = nz(-5, 5);
  const j = a > 0 ? po("jYuqoriga") : po("jPastga");
  return {
    type: "eqn", text: `y = ${had(a, "x", 2)}`, prompt: po("parabolaYonalish"),
    answer: j, choices: shuffle([po("jYuqoriga"), po("jPastga")]),
  };
};

/** 4-§. y = ax² + bx + c — uchning abssissasi. */
export const a9Ucha = (): Activity => {
  const a = pick([1, 1, 2, -1, -2]), x0 = nz(-6, 6);
  const b = -2 * a * x0, c = nz(-9, 9);
  return {
    type: "eqn", text: `y = ${kophad([a, b, c])}`, prompt: po("parabolaUchi"),
    ...zPick(x0, [-x0, b, -b]),
  };
};

/** 5-§. Kvadrat funksiyaning qiymati. */
export const a9FunksiyaQiymat = (): Activity => {
  const a = pick([1, 2, -1]), b = nz(-6, 6), c = nz(-9, 9), x = nz(-5, 5);
  const y = a * x * x + b * x + c;
  return {
    type: "eqn", text: `y = ${kophad([a, b, c])},   x = ${iz(x)}`, prompt: po("funksiyaQiymat"),
    ...zPick(y, [a * x + b * x + c, y - c, -y]),
  };
};

/** 5-§. Funksiyaning nollari. */
export const a9Nollar = (): Activity => {
  const x1 = nz(-8, 8), x2 = nz(-8, 8);
  const b = -(x1 + x2), c = x1 * x2;
  return {
    type: "eqn", text: `y = ${kophad([1, b, c])}`, prompt: po("funksiyaNoli"),
    ...sPick(ikkiIldiz(x1, x2), [ikkiIldiz(-x1, -x2), `x = ${iz(c)}`, `x = ${iz(b)}`]),
  };
};

/** 6–7-§. Kvadrat tengsizlik: (x−x₁)(x−x₂) < 0 → oraliq. */
export const a9KvadratTengsizlik = (): Activity => {
  const x1 = nz(-7, 5), x2 = x1 + rnd(2, 8);
  const b = -(x1 + x2), c = x1 * x2;
  const j = `${iz(x1)} < x < ${iz(x2)}`;
  return {
    type: "eqn", text: `${kophad([1, b, c])} < 0`, prompt: po("kvadratTengsizlik"),
    // Xato: "<" uchun tashqi oraliqni olish — ">" bilan almashtirib yuborish.
    ...sPick(j, [`x < ${iz(x1)},  x > ${iz(x2)}`, `${iz(x2)} < x < ${iz(x1)}`, `x > ${iz(x2)}`]),
  };
};

/** 9-§. Aniqlanish sohasi — maxraj nolga teng bo'lmasin. */
export const a9Aniqlanish = (): Activity => {
  const a = nz(-9, 9);
  const j = `x ≠ ${iz(a)}`;
  return {
    type: "eqn", text: `y = 1 / (x ${qosh(-a)})`, prompt: po("aniqlanishSoha"),
    ...sPick(j, [`x ≠ ${iz(-a)}`, `x > ${iz(a)}`, "x — ixtiyoriy"]),
  };
};

/** 11-§. Funksiya juft yoki toqmi. */
export const a9JuftToq = (): Activity => {
  const t = rnd(0, 2);
  const a = rnd(2, 6);
  if (t === 0) {
    return {
      type: "eqn", text: `y = ${had(a, "x", 2)}`, prompt: po("juftToq"),
      answer: po("jJuft"), choices: shuffle([po("jJuft"), po("jToq"), po("jNaJuftNaToq")]),
    };
  }
  if (t === 1) {
    return {
      type: "eqn", text: `y = ${had(a, "x", 3)}`, prompt: po("juftToq"),
      answer: po("jToq"), choices: shuffle([po("jJuft"), po("jToq"), po("jNaJuftNaToq")]),
    };
  }
  return {
    type: "eqn", text: `y = ${kophad([a, rnd(2, 6), 0])}`, prompt: po("juftToq"),
    answer: po("jNaJuftNaToq"), choices: shuffle([po("jJuft"), po("jToq"), po("jNaJuftNaToq")]),
  };
};

/* ---------- II bob. Tenglamalar va tengsizliklar sistemalari ---------- */

/** 13–14-§. Chiziqli sistema — yechim juftligi. */
export const a9Sistema = (): Activity => {
  const x = nz(-6, 6), y = nz(-6, 6);
  const a = rnd(1, 5), b = rnd(1, 5), c = rnd(1, 5), d = -rnd(1, 5);
  const e = a * x + b * y, f = c * x + d * y;
  const j = `x = ${iz(x)},  y = ${iz(y)}`;
  return {
    type: "eqn",
    // Ikki tenglama bitta qatorda: savol matni bitta satr bo'lib
    // chiziladi (`QuestionView`), shuning uchun ular nuqtali vergul
    // bilan ajratiladi — tik qavs qo'yilsa ikkinchi qator kerak bo'lardi.
    text: `${had(a, "x")}${had(b, "y", 1, false)} = ${iz(e)}   ;   ${had(c, "x")}${had(d, "y", 1, false)} = ${iz(f)}`,
    prompt: po("sistemaYech"),
    ...sPick(j, [`x = ${iz(y)},  y = ${iz(x)}`, `x = ${iz(-x)},  y = ${iz(y)}`, `x = ${iz(x)},  y = ${iz(-y)}`]),
  };
};

/* ---------- III bob. Trigonometriya elementlari ---------- */

const RADIAN: [number, string][] = [
  [30, "π/6"], [45, "π/4"], [60, "π/3"], [90, "π/2"],
  [120, "2π/3"], [135, "3π/4"], [150, "5π/6"], [180, "π"], [270, "3π/2"], [360, "2π"],
];

/** 17-§. Gradusni radianga o'girish va teskarisi. */
export const a9Radian = (): Activity => {
  const [g, r] = pick(RADIAN);
  const boshqa = shuffle(RADIAN.filter((x) => x[0] !== g)).slice(0, 3);
  if (Math.random() < 0.5) {
    return {
      type: "eqn", text: `${g}° = ?`, prompt: po("radian"),
      ...sPick(r, boshqa.map((x) => x[1])),
    };
  }
  return {
    type: "eqn", text: `${r} = ?`, prompt: po("gradus"),
    ...sPick(`${g}°`, boshqa.map((x) => `${x[0]}°`)),
  };
};

/** 19-§. Asosiy burchaklarning sinus, kosinus, tangensi. */
const TRIG: Record<string, Record<number, string>> = {
  sin: { 0: "0", 30: "1/2", 45: "√2/2", 60: "√3/2", 90: "1", 180: "0" },
  cos: { 0: "1", 30: "√3/2", 45: "√2/2", 60: "1/2", 90: "0", 180: "−1" },
  tg: { 0: "0", 30: "√3/3", 45: "1", 60: "√3", 180: "0" },
};

export const a9TrigQiymat = (): Activity => {
  const f = pick(["sin", "cos", "tg"]);
  const jadval = TRIG[f];
  const burchak = Number(pick(Object.keys(jadval)));
  const j = jadval[burchak];
  const boshqa = shuffle([...new Set(Object.values(TRIG.sin).concat(Object.values(TRIG.cos), Object.values(TRIG.tg)))])
    .filter((x) => x !== j).slice(0, 3);
  return {
    type: "eqn", text: `${f} ${burchak}° = ?`, prompt: po("trigQiymat"), ...sPick(j, boshqa),
  };
};

/** 20-§. Chorak bo'yicha ishora. */
export const a9TrigIshora = (): Activity => {
  const f = pick(["sin", "cos", "tg"]);
  const chorak = rnd(1, 4);
  const burchak = (chorak - 1) * 90 + rnd(10, 80);
  const rad = (burchak * Math.PI) / 180;
  const q = f === "sin" ? Math.sin(rad) : f === "cos" ? Math.cos(rad) : Math.tan(rad);
  const j = q > 0 ? po("jMusbat") : po("jManfiy");
  return {
    type: "eqn", text: `${f} ${burchak}°`, prompt: po("trigIshora"),
    answer: j, choices: shuffle([po("jMusbat"), po("jManfiy")]),
  };
};

/** 22-§. Asosiy trigonometrik ayniyat: sin²α + cos²α = 1. */
export const a9Ayniyat = (): Activity => {
  const juft = pick([[3, 5], [4, 5], [6, 10], [8, 10], [5, 13], [12, 13]] as const);
  const [a, c] = juft;
  const b = Math.round(Math.sqrt(c * c - a * a));
  const j = fr(b, c);
  return {
    type: "eqn", text: `sin α = ${fr(a, c)},   cos α = ?    (0 < α < 90°)`, prompt: po("trigAyniyat"),
    ...sPick(j, [fr(a, c), fr(c, b), fr(a, b)]),
  };
};

/** 26-§. Keltirish formulalari. */
export const a9Keltirish = (): Activity => {
  const holatlar: [string, string][] = [
    ["sin(180° − α)", "sin α"],
    ["cos(180° − α)", "−cos α"],
    ["sin(90° − α)", "cos α"],
    ["cos(90° − α)", "sin α"],
    ["sin(−α)", "−sin α"],
    ["cos(−α)", "cos α"],
    ["tg(−α)", "−tg α"],
  ];
  const [ifoda, j] = pick(holatlar);
  const boshqa = shuffle([...new Set(holatlar.map((x) => x[1]))]).filter((x) => x !== j).slice(0, 3);
  return { type: "eqn", text: `${ifoda} = ?`, prompt: po("keltirish"), ...sPick(j, boshqa) };
};

/** 24-§. Qo'shish formulalari. */
export const a9QoshishFormula = (): Activity => {
  const holatlar: [string, string][] = [
    ["sin(α + β)", "sin α cos β + cos α sin β"],
    ["sin(α − β)", "sin α cos β − cos α sin β"],
    ["cos(α + β)", "cos α cos β − sin α sin β"],
    ["cos(α − β)", "cos α cos β + sin α sin β"],
  ];
  const [ifoda, j] = pick(holatlar);
  const boshqa = holatlar.map((x) => x[1]).filter((x) => x !== j);
  return { type: "eqn", text: `${ifoda} = ?`, prompt: po("qoshishFormula"), ...sPick(j, boshqa) };
};

/** 25-§. Ikkilangan burchak. */
export const a9Ikkilangan = (): Activity => {
  const holatlar: [string, string][] = [
    ["sin 2α", "2 sin α cos α"],
    ["cos 2α", "cos²α − sin²α"],
  ];
  const [ifoda, j] = pick(holatlar);
  return {
    type: "eqn", text: `${ifoda} = ?`, prompt: po("ikkilangan"),
    ...sPick(j, ["2 sin α", "sin²α + cos²α", "2 cos²α", "sin α cos α"]),
  };
};

/* ---------- IV bob. Sonli ketma-ketliklar. Progressiyalar ---------- */

/** 28-§. Ketma-ketlikning n-hadi. */
export const a9KetmaKetlik = (): Activity => {
  const a = rnd(2, 6), b = nz(-8, 8), n = rnd(3, 12);
  const s = a * n + b;
  return {
    type: "eqn", text: `aₙ = ${had(a, "n")} ${qosh(b)},   n = ${n}`,
    prompt: po("ketmaKetlikHad"), ...zPick(s, [a + n + b, a * (n + b), s - b]),
  };
};

/** 29-§. Arifmetik progressiyaning n-hadi: aₙ = a₁ + (n−1)d. */
export const a9ArifHad = (): Activity => {
  const a1 = nz(-12, 20), d = nz(-9, 9), n = rnd(5, 20);
  const s = a1 + (n - 1) * d;
  return {
    type: "eqn", text: po("txtProgressiya", { a: iz(a1), d: iz(d), n: past(n) }),
    prompt: po("arifProgHad"),
    // Klassik xato: (n−1) o'rniga n ni olish.
    ...zPick(s, [a1 + n * d, a1 * d * n, a1 + d]),
  };
};

/** 30-§. Arifmetik progressiya yig'indisi. */
export const a9ArifYigindi = (): Activity => {
  const a1 = rnd(1, 15), d = rnd(1, 8), n = pick([6, 8, 10, 12, 20]);
  const S = ((2 * a1 + (n - 1) * d) * n) / 2;
  return {
    type: "eqn", text: `a₁ = ${a1},  d = ${d},  n = ${n}.   S${past(n)} = ?`,
    prompt: po("arifProgYigindi"),
    ...zPick(S, [a1 + (n - 1) * d, S * 2, (a1 + d) * n]),
  };
};

/** 31-§. Geometrik progressiyaning n-hadi: bₙ = b₁qⁿ⁻¹. */
export const a9GeoHad = (): Activity => {
  const b1 = rnd(1, 6), q = pick([2, 3, -2]), n = rnd(3, 6);
  const s = b1 * q ** (n - 1);
  return {
    type: "eqn", text: po("txtGeoProg", { a: b1, q: iz(q), n: past(n) }),
    prompt: po("geoProgHad"),
    ...zPick(s, [b1 * q ** n, b1 * q * n, b1 + q * (n - 1)]),
  };
};

/** 32-§. Geometrik progressiya yig'indisi. */
export const a9GeoYigindi = (): Activity => {
  const b1 = rnd(1, 5), q = pick([2, 3]), n = rnd(3, 6);
  const S = (b1 * (q ** n - 1)) / (q - 1);
  return {
    type: "eqn", text: `b₁ = ${b1},  q = ${q},  n = ${n}.   S${past(n)} = ?`,
    prompt: po("geoProgYigindi"),
    ...zPick(S, [b1 * q ** n, b1 * q * n, S - b1]),
  };
};

/** 33-§. Cheksiz kamayuvchi progressiya: S = b₁/(1−q). */
export const a9CheksizYigindi = (): Activity => {
  const juft = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5]] as const);
  const [qn, qd] = juft;
  const b1 = qd * rnd(1, 4);
  const S = b1 / (1 - qn / qd);
  return {
    type: "eqn", text: `b₁ = ${b1},   q = ${fr(qn, qd)}`, prompt: po("cheksizYigindi"),
    ...sPick(dc(S), [dc(b1 * (1 - qn / qd)), dc(b1 / (1 + qn / qd)), dc(b1 * qd)]),
  };
};

/* ---------- V bob. Ehtimolliklar nazariyasi ---------- */

/** 35-§. Klassik ehtimollik — qutidagi sharlar. */
export const a9Ehtimollik = (): Activity => {
  const a = rnd(2, 9), b = rnd(2, 9);
  const j = fr(a, a + b);
  return {
    type: "eqn", text: po("txtQutida", { a, b }), prompt: po("ehtimollik"),
    ...sPick(j, [fr(a, b), fr(b, a + b), fr(a + b, a)]),
  };
};

/** 36-§. Nisbiy chastota. */
export const a9Chastota = (): Activity => {
  const n = pick([20, 25, 40, 50, 100]), k = rnd(2, n - 2);
  const j = dc(k / n);
  return {
    type: "eqn", text: `n = ${n},   m = ${k}`, prompt: po("ehtimollik"),
    ...sPick(j, [dc(n / k), dc(k / (n + k)), dc(k)]),
  };
};
