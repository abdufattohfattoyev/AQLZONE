/**
 * OLIY MATEMATIKA · 1-kurs — talabalar uchun savollar.
 *
 * Manba: texnika va iqtisodiyot OTMlarining 1-kurs "Oliy matematika"
 * dasturi — chiziqli algebra, vektorlar, limitlar, differensial va
 * integral hisob, qatorlar, oddiy differensial tenglamalar.
 *
 * ─────────────── NEGA BU FAYL KERAK BO'LDI ───────────────
 *
 * Anketada 58% odam "talaba" deb javob berdi, ilovada esa eng yuqori
 * daraja 11-sinf edi. Talabaga "formulalar va DTM" ko'rsatish uni
 * aldash edi: u maktabni allaqachon tugatgan. Bu savollar maktab
 * dasturida YO'Q mavzulardan — determinant, Kramer, vektor ko'paytma,
 * ajoyib limit, bo'laklab integrallash, qatorlar.
 *
 * Qoidalar `algebra.ts` dagidek: chalg'ituvchilar talaba qiladigan
 * ANIQ xatolardan yasaladi (ishorani adashtirish, quyi chegarani
 * unutish, ichki funksiya hosilasini tashlab ketish) va sonlar javob
 * butun yoki qisqa kasr chiqadigan qilib tanlanadi.
 */
import type { Activity } from "../activity";
import { po } from "../tarjima/oliy";
import { Y, fr, had, iz, kophad, nz, pick, qav, qosh, rnd, sPick, zPick } from "./asos";

/** "[ a  b ; c  d ]" — bir qatorda yoziladigan matritsa. */
const m2 = (a: number, b: number, c: number, d: number) => `[ ${iz(a)}  ${iz(b)} ; ${iz(c)}  ${iz(d)} ]`;

/* ==================================================================== */
/*                          CHIZIQLI ALGEBRA                            */
/* ==================================================================== */

/** 2×2 determinant. Xato: diagonallarni qo'shish yoki tartibni almashtirish. */
export const o1Det2 = (): Activity => {
  const a = nz(-9, 9), b = nz(-9, 9), c = nz(-9, 9), d = nz(-9, 9);
  const det = a * d - b * c;
  return {
    type: "eqn", text: `det ${m2(a, b, c, d)}`, prompt: po("determinant2"),
    ...zPick(det, [a * d + b * c, b * c - a * d, a * c - b * d]),
    yechim: [
      Y("det2"),
      Y("hisobla", `${qav(a)}·${qav(d)} − ${qav(b)}·${qav(c)} = ${iz(a * d)} − ${qav(b * c)}`),
      Y("javob", iz(det)),
    ],
  };
};

/** 3×3 determinant — birinchi satr bo'yicha yoyish. Xato: o'rta hadning ishorasi. */
export const o1Det3 = (): Activity => {
  const [a, b, c, d, e, f, g, h, i] = Array.from({ length: 9 }, () => rnd(-3, 4));
  const m1 = e * i - f * h, m2_ = d * i - f * g, m3 = d * h - e * g;
  const det = a * m1 - b * m2_ + c * m3;
  return {
    type: "eqn",
    text: `det [ ${iz(a)} ${iz(b)} ${iz(c)} ; ${iz(d)} ${iz(e)} ${iz(f)} ; ${iz(g)} ${iz(h)} ${iz(i)} ]`,
    prompt: po("determinant3"),
    // Eng ko'p uchraydigan xato — ikkinchi minorni ham "+" bilan olish.
    ...zPick(det, [a * m1 + b * m2_ + c * m3, -det, a * m1 - b * m2_ - c * m3]),
    yechim: [
      Y("det3", `${iz(a)}·(${iz(m1)}) − ${qav(b)}·(${iz(m2_)}) + ${qav(c)}·(${iz(m3)})`),
      Y("hisobla", `${iz(a * m1)} ${qosh(-b * m2_)} ${qosh(c * m3)}`),
      Y("javob", iz(det)),
    ],
  };
};

/** 2A − B ning bitta elementi. Xato: 2 ni B ga ham qo'llash, ishorani yo'qotish. */
export const o1MatQosh = (): Activity => {
  const A = [rnd(-6, 6), rnd(-6, 6), rnd(-6, 6), rnd(-6, 6)];
  const B = [rnd(-6, 6), rnd(-6, 6), rnd(-6, 6), rnd(-6, 6)];
  const k = rnd(0, 3);
  const nom = ["c₁₁", "c₁₂", "c₂₁", "c₂₂"][k];
  const j = 2 * A[k] - B[k];
  return {
    type: "eqn",
    text: `A = ${m2(A[0], A[1], A[2], A[3])},  B = ${m2(B[0], B[1], B[2], B[3])},  C = 2A − B,  ${nom} = ?`,
    prompt: po("matritsaQosh"),
    ...zPick(j, [A[k] - B[k], 2 * A[k] + B[k], 2 * (A[k] - B[k])]),
    yechim: [
      Y("matritsaQoshQoida"),
      Y("hisobla", `2·${qav(A[k])} − ${qav(B[k])}`),
      Y("javob", iz(j)),
    ],
  };
};

/** A·B ning bitta elementi. Xato: elementma-element ko'paytirish, satr × satr. */
export const o1MatKop = (): Activity => {
  const [a, b, c, d] = [rnd(-3, 5), rnd(-3, 5), rnd(-3, 5), rnd(-3, 5)];
  const [e, f, g, h] = [rnd(-3, 5), rnd(-3, 5), rnd(-3, 5), rnd(-3, 5)];
  const i = rnd(0, 1), j = rnd(0, 1);
  const satr = i === 0 ? [a, b] : [c, d];
  const ustun = j === 0 ? [e, g] : [f, h];
  const satrB = i === 0 ? [e, f] : [g, h];
  const javob = satr[0] * ustun[0] + satr[1] * ustun[1];
  const nom = `c${["₁", "₂"][i]}${["₁", "₂"][j]}`;
  const Bel = [[e, f], [g, h]][i][j];
  const Ael = [[a, b], [c, d]][i][j];
  return {
    type: "eqn",
    text: `A = ${m2(a, b, c, d)},  B = ${m2(e, f, g, h)},  C = A·B,  ${nom} = ?`,
    prompt: po("matritsaKop"),
    ...zPick(javob, [Ael * Bel, satr[0] * satrB[0] + satr[1] * satrB[1], satr[0] * ustun[1] + satr[1] * ustun[0]]),
    yechim: [
      Y("matritsaKopQoida"),
      Y("hisobla", `${qav(satr[0])}·${qav(ustun[0])} + ${qav(satr[1])}·${qav(ustun[1])}`),
      Y("javob", iz(javob)),
    ],
  };
};

/** Kramer usuli — ikki noma'lumli sistema. Xato: Δₓ o'rniga Δᵧ, bo'lmay qoldirish. */
export const o1Kramer = (): Activity => {
  const x = nz(-5, 5), y = nz(-5, 5);
  let a1 = 0, b1 = 0, a2 = 0, b2 = 0;
  // Determinant 0 bo'lmasin va x ≠ y bo'lsin — aks holda "y ni topdi"
  // xatosi to'g'ri javob bilan bir xil chiqardi.
  do {
    a1 = nz(-5, 5); b1 = nz(-5, 5); a2 = nz(-5, 5); b2 = nz(-5, 5);
  } while (a1 * b2 - b1 * a2 === 0);
  const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
  const D = a1 * b2 - b1 * a2, Dx = c1 * b2 - b1 * c2;
  return {
    type: "eqn",
    text: `{ ${had(a1, "x")} ${had(b1, "y", 1, false).trim()} = ${iz(c1)} ;  ${had(a2, "x")} ${had(b2, "y", 1, false).trim()} = ${iz(c2)} }`,
    prompt: po("kramer"),
    ...zPick(x, [y, -x, Dx === x ? D : Dx]),
    yechim: [
      Y("kramerQoida"),
      Y("hisobla", `Δ = ${iz(D)},  Δₓ = ${iz(Dx)}`),
      Y("javob", `x = ${iz(Dx)} / ${qav(D)} = ${iz(x)}`),
    ],
  };
};

/* ==================================================================== */
/*                              VEKTORLAR                               */
/* ==================================================================== */

/** Butun uzunlikli uch o'lchovli vektorlar: x² + y² + z² = L². */
const UCHLIK: [number, number, number, number][] = [
  [1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9],
  [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [2, 10, 11, 15],
];
const ishora = (n: number) => (Math.random() < 0.5 ? -n : n);
const v3 = (x: number, y: number, z: number) => `(${iz(x)}; ${iz(y)}; ${iz(z)})`;

export const o1VektorUzun = (): Activity => {
  const [p, q, r, L] = pick(UCHLIK);
  const [x, y, z] = [ishora(p), ishora(q), ishora(r)];
  return {
    type: "eqn", text: `|a|,  a = ${v3(x, y, z)}`, prompt: po("vektorUzun3"),
    // Xato: ildiz olmaslik yoki koordinatalarni shunchaki qo'shish.
    ...zPick(L, [L * L, p + q + r, L + 1]),
    yechim: [
      Y("vektorUzun3Q"),
      Y("hisobla", `√(${p * p} + ${q * q} + ${r * r}) = √${L * L}`),
      Y("javob", String(L)),
    ],
  };
};

export const o1Skalyar = (): Activity => {
  const a = [nz(-6, 6), nz(-6, 6), nz(-6, 6)], b = [nz(-6, 6), nz(-6, 6), nz(-6, 6)];
  const s = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  return {
    type: "eqn", text: `a·b,  a = ${v3(a[0], a[1], a[2])},  b = ${v3(b[0], b[1], b[2])}`,
    prompt: po("skalyar3"),
    ...zPick(s, [a[0] * b[0] + a[1] * b[1], s - 2 * a[2] * b[2], a[0] + b[0] + a[1] + b[1] + a[2] + b[2]]),
    yechim: [
      Y("skalyar3Q"),
      Y("hisobla", `${iz(a[0] * b[0])} ${qosh(a[1] * b[1])} ${qosh(a[2] * b[2])}`),
      Y("javob", iz(s)),
    ],
  };
};

/** k ni topish: a ⊥ b. Son oldindan tanlanadi, qolgani shunga moslanadi. */
export const o1Perp = (): Activity => {
  const a1 = nz(-3, 3), k = nz(-5, 5), a2 = nz(-4, 4), b2 = nz(-4, 4);
  // a₃ = 1, b₃ esa yig'indini nolga keltiradi: a₁k + a₂b₂ + b₃ = 0.
  const b3 = -a1 * k - a2 * b2;
  return {
    type: "eqn", text: `a = ${v3(a1, a2, 1)},  b = (k; ${iz(b2)}; ${iz(b3)}),  a ⊥ b`,
    prompt: po("perpendikulyar"),
    ...zPick(k, [-k, k + a1, a1 * k]),
    yechim: [
      Y("perpQoida"),
      Y("hisobla", `${iz(a1)}k ${qosh(a2 * b2)} ${qosh(b3)} = 0`),
      Y("javob", `k = ${iz(k)}`),
    ],
  };
};

/** a × b ning z-koordinatasi. Xato: ayirish tartibi, qo'shib yuborish. */
export const o1VektorKop = (): Activity => {
  const a = [nz(-5, 5), nz(-5, 5), nz(-5, 5)], b = [nz(-5, 5), nz(-5, 5), nz(-5, 5)];
  const z = a[0] * b[1] - a[1] * b[0];
  return {
    type: "eqn", text: `a = ${v3(a[0], a[1], a[2])},  b = ${v3(b[0], b[1], b[2])},  (a × b)_z = ?`,
    prompt: po("vektorKop"),
    ...zPick(z, [-z, a[0] * b[1] + a[1] * b[0], a[2] * b[2]]),
    yechim: [
      Y("vektorKopQ"),
      Y("hisobla", `${qav(a[0])}·${qav(b[1])} − ${qav(a[1])}·${qav(b[0])}`),
      Y("javob", iz(z)),
    ],
  };
};

/* ==================================================================== */
/*                               LIMITLAR                               */
/* ==================================================================== */

/** Ratsional funksiyaning cheksizdagi limiti. */
export const o1LimitCheksiz = (): Activity => {
  const p = nz(-6, 6), s = nz(-6, 6), q = rnd(-9, 9), r = rnd(-9, 9), t = rnd(-9, 9), u = nz(-9, 9);
  // Har to'rtinchi savolda surat darajasi past — javob 0. Bu holatni
  // ham bilish kerak: "boshlang'ich hadlar nisbati" qoidasini
  // yodlab olgan talaba bu yerda p/s deb yozadi.
  const past = Math.random() < 0.25;
  const surat = past ? kophad([p, q]) : kophad([p, q, r]);
  const j = past ? "0" : fr(p, s);
  return {
    type: "eqn", text: `lim (${surat}) / (${kophad([s, t, u])}),   x → ∞`, prompt: po("limitCheksiz"),
    ...sPick(j, [past ? fr(p, s) : "0", "∞", fr(past ? q : r, u), fr(s, p)],
      // |p| = |s| bo'lsa p/s va s/p bir xil — zaxira kerak.
      [fr(-p, s), fr(p + 1, s), fr(p, 2 * s)]),
    yechim: [
      Y("boshHad", past ? `${had(p, "x")} / ${had(s, "x", 2)} → 0` : `${had(p, "x", 2)} / ${had(s, "x", 2)}`),
      Y("javob", j),
    ],
  };
};

/** 0/0 noaniqlik: (x − a)(x − b) / (x − a), x → a. */
export const o1LimitNol = (): Activity => {
  const a = nz(-6, 6);
  let b = nz(-6, 6);
  if (b === a) b = a === 6 ? -6 : a + 1;
  const j = a - b;
  return {
    type: "eqn",
    text: `lim (${kophad([1, -(a + b), a * b])}) / (${kophad([1, -a])}),   x → ${iz(a)}`,
    prompt: po("limitNol"),
    ...zPick(j, [0, a + b, b - a]),
    yechim: [
      Y("kopaytuvchigaAjrat", `(${kophad([1, -a])})(${kophad([1, -b])}) / (${kophad([1, -a])}) = ${kophad([1, -b])}`),
      Y("qoy", `${iz(a)} ${qosh(-b)}`),
      Y("javob", iz(j)),
    ],
  };
};

/** Birinchi ajoyib limit: sin(kx)/(mx) → k/m. */
export const o1AjoyibLimit = (): Activity => {
  const k = rnd(2, 9);
  // k = m bo'lsa javob 1 va u "1" chalg'ituvchisi bilan bir xil bo'lardi.
  let m = rnd(2, 9);
  if (m === k) m = k === 9 ? 2 : k + 1;
  const tg = Math.random() < 0.4;
  const j = fr(k, m);
  return {
    type: "eqn",
    text: tg ? `lim tg(${k}x) / sin(${m}x),   x → 0` : `lim sin(${k}x) / (${m}x),   x → 0`,
    prompt: po("ajoyibLimit"),
    ...sPick(j, [fr(m, k), "1", "0"], [fr(k * m, 1), fr(k + m, m)]),
    yechim: [
      Y("ajoyibLimitQ"),
      Y("hisobla", `${k}x / ${m}x`),
      Y("javob", j),
    ],
  };
};

/* ==================================================================== */
/*                         DIFFERENSIAL HISOB                           */
/* ==================================================================== */

/** (ax + b)(cx² + d) ning x₀ dagi hosilasi. Xato: (uv)' = u'v' deb olish. */
export const o1HosilaKopaytma = (): Activity => {
  const a = nz(-4, 4), b = rnd(-5, 5), c = nz(-3, 3), d = rnd(-5, 5), x = nz(-2, 2);
  const u = a * x + b, v = c * x * x + d, du = a, dv = 2 * c * x;
  const j = du * v + u * dv;
  return {
    type: "eqn", text: `y = (${kophad([a, b])})(${kophad([c, 0, d])}),   y′(${iz(x)}) = ?`,
    prompt: po("hosilaKopaytmaNuqta"),
    ...zPick(j, [du * dv, du * v, u * dv]),
    yechim: [
      Y("hosilaKopaytma"),
      Y("qoy", `${iz(du)}·${qav(v)} + ${qav(u)}·${qav(dv)}`),
      Y("javob", iz(j)),
    ],
  };
};

/** (ax + b)ⁿ ning x₀ dagi hosilasi. Xato: ichki hosila a ni tashlab ketish. */
export const o1HosilaMurakkab = (): Activity => {
  const n = rnd(2, 4), a = pick([2, 3, -2]), x = rnd(-2, 2);
  const ich = pick([-2, -1, 1, 2]);
  const b = ich - a * x;
  const j = n * a * ich ** (n - 1);
  return {
    type: "eqn", text: `y = (${kophad([a, b])})${"⁰¹²³⁴⁵"[n]},   y′(${iz(x)}) = ?`,
    prompt: po("hosilaMurakkabNuqta"),
    ...zPick(j, [n * ich ** (n - 1), n * a * ich ** n, a * ich ** (n - 1)]),
    yechim: [
      Y("murakkab", `y′ = ${n}·${qav(a)}·(${kophad([a, b])})${"⁰¹²³⁴⁵"[n - 1]}`),
      Y("qoy", `${n}·${qav(a)}·${qav(ich)}${"⁰¹²³⁴⁵"[n - 1]}`),
      Y("javob", iz(j)),
    ],
  };
};

/** y = C·eᵏˣ ning hosilasi — ifoda javob. */
export const o1HosilaEksp = (): Activity => {
  const C = rnd(2, 5), k = pick([2, 3, 4, -2, -3]);
  const d = `e^(${had(k, "x")})`;
  const j = `${iz(C * k)}${d}`;
  return {
    type: "eqn", text: `y = ${C}${d}`, prompt: po("hosilaEksp"),
    ...sPick(j, [`${C}${d}`, `${iz(k)}${d}`, `${iz(C * k)}e^(x)`],
      [`${iz(-C * k)}${d}`, `${iz(C + k)}${d}`]),
    yechim: [Y("ekspHosila"), Y("hisobla", `${C} · ${qav(k)} = ${iz(C * k)}`), Y("javob", j)],
  };
};

/* ==================================================================== */
/*                          INTEGRAL HISOB                              */
/* ==================================================================== */

/** ∫ₐᵇ (3x² + 2px) dx = (b³ − a³) + p(b² − a²). Xato: quyi chegarani unutish. */
export const o1IntegralDaraja = (): Activity => {
  const a = rnd(-2, 1), b = rnd(a + 1, 3), p = nz(-3, 3);
  const F = (x: number) => x ** 3 + p * x * x;
  const j = F(b) - F(a);
  return {
    type: "eqn", text: `∫ (${kophad([3, 2 * p, 0])}) dx,   ${iz(a)} → ${iz(b)}`,
    prompt: po("integralDaraja"),
    ...zPick(j, [F(b), F(a) - F(b), 3 * b * b + 2 * p * b - (3 * a * a + 2 * p * a)]),
    yechim: [
      Y("integralJadval", `F(x) = ${kophad([1, p, 0, 0])}`),
      Y("nyuton", `F(${iz(b)}) − F(${iz(a)}) = ${iz(F(b))} − ${qav(F(a))}`),
      Y("javob", iz(j)),
    ],
  };
};

/**
 * Bo'laklab integrallash. Javobi "chiroyli" bo'lgan klassik integrallar
 * ro'yxatdan olinadi: tasodifiy chegaralarda natija e va π ning uzun
 * ifodasi bo'lib, tugmaga sig'masdi.
 */
const BOLAKLAB: { t: string; j: string; x: string[]; q: string }[] = [
  { t: "∫ x·eˣ dx,   0 → 1", j: "1", x: ["e", "e − 1", "0"], q: "u = x, dv = eˣdx:  [x·eˣ − eˣ]₀¹" },
  { t: "∫ x·sin x dx,   0 → π", j: "π", x: ["0", "−π", "2"], q: "u = x, dv = sin x dx:  [−x·cos x + sin x]₀^π" },
  { t: "∫ x·cos x dx,   0 → π", j: "−2", x: ["0", "2", "π"], q: "u = x, dv = cos x dx:  [x·sin x + cos x]₀^π" },
  { t: "∫ ln x dx,   1 → e", j: "1", x: ["e", "e − 1", "0"], q: "u = ln x, dv = dx:  [x·ln x − x]₁ᵉ" },
  { t: "∫ x·cos x dx,   0 → π/2", j: "π/2 − 1", x: ["π/2", "1", "π/2 + 1"], q: "[x·sin x + cos x]₀^(π/2)" },
];

export const o1Bolaklab = (): Activity => {
  const b = pick(BOLAKLAB);
  return {
    type: "eqn", text: b.t, prompt: po("integralBolaklab"),
    ...sPick(b.j, b.x),
    yechim: [Y("bolaklab"), Y("hisobla", b.q), Y("javob", b.j)],
  };
};

/* ==================================================================== */
/*                  QATORLAR VA DIFFERENSIAL TENGLAMALAR                */
/* ==================================================================== */

/** Σ a·qⁿ (n = 0…∞) = a / (1 − q). Xato: 1 + q, q ni suratga qo'yish. */
export const o1Qator = (): Activity => {
  const [p, r] = pick([[1, 2], [1, 3], [-1, 2], [2, 3], [1, 4], [-1, 3]] as const);
  const a = rnd(1, 6);
  const j = fr(a * r, r - p);
  return {
    type: "eqn", text: `Σ ${a}·(${fr(p, r)})ⁿ,   n = 0 … ∞`, prompt: po("qatorYigindi"),
    ...sPick(j, [fr(a * r, r + p), fr(a * p, r - p), fr(a * r, p)], ["∞"]),
    yechim: [
      Y("cheksiz", `S = ${a} / (1 − ${qav(p) === String(p) ? fr(p, r) : `(${fr(p, r)})`})`),
      Y("javob", j),
    ],
  };
};

/** y′ = ky, y(0) = C  ⇒  y = C·eᵏˣ. */
export const o1DifTenglama = (): Activity => {
  const k = pick([2, 3, -1, -2, 5]), C = pick([2, 3, 4, 5, -1]);
  const d = (s: number) => `e^(${had(s, "x")})`;
  /** Koeffitsiyent: 1 yozilmaydi, −1 faqat minus. */
  const kf = (n: number) => (n === 1 ? "" : n === -1 ? "−" : iz(n));
  const j = `y = ${kf(C)}${d(k)}`;
  return {
    type: "eqn", text: `y′ = ${had(k, "y")},   y(0) = ${iz(C)}`, prompt: po("difTenglama"),
    // Xato: C va k ni almashtirish, qo'shish, ko'rsatkich ishorasi.
    ...sPick(j, [`y = ${kf(k)}${d(C)}`, `y = ${iz(C)} + ${d(k)}`, `y = ${kf(C)}${d(-k)}`],
      [`y = ${kf(C)}e^(x)`, `y = ${kf(C * k)}${d(k)}`]),
    yechim: [Y("difYechim"), Y("qoy", `y(0) = C·e⁰ = C = ${iz(C)}`), Y("javob", j)],
  };
};
