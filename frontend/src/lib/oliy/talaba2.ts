/**
 * OLIY MATEMATIKA · 2-kurs va EHTIMOLLAR NAZARIYASI — talabalar savollari.
 *
 * Manba: OTMlarning "Oliy matematika" ishchi dasturlaridagi 2-semestr
 * (ko'p o'zgaruvchili funksiyalar, karrali integrallar, sonli va
 * funksional qatorlar, differensial tenglamalar) va "Ehtimollar
 * nazariyasi va matematik statistika" fani (iqtisodiyot, IT,
 * pedagogika yo'nalishlarida alohida fan).
 *
 * Qoidalar `talaba.ts` dagidek: chalg'ituvchi — aniq xato (xususiy
 * hosilada ikkinchi o'zgaruvchini ham differensiallash, ehtimollikda
 * qaytarib qo'ymaslikni unutish), javob butun son yoki qisqa kasr.
 */
import type { Activity } from "../activity";
import { po } from "../tarjima/oliy";
import { Y, fr, had, ikkiIldiz, iz, kophad, nz, pick, qav, qosh, rnd, sPick, shuffle, zPick } from "./asos";

const faktorial = (n: number): number => (n <= 1 ? 1 : n * faktorial(n - 1));
const C = (n: number, k: number): number => faktorial(n) / (faktorial(k) * faktorial(n - k));
const A = (n: number, k: number): number => faktorial(n) / faktorial(n - k);

/* ==================================================================== */
/*                  KO'P O'ZGARUVCHILI FUNKSIYALAR                      */
/* ==================================================================== */

/** f = a·x²y + b·xy³ + c·x — ∂f/∂x nuqtada. Xato: ∂f/∂y ni hisoblash, y ni ham differensiallash. */
export const o2XususiyX = (): Activity => {
  const a = nz(-3, 3), b = nz(-3, 3), c = nz(-5, 5), x = nz(-2, 2), y = nz(-2, 2);
  const fx = 2 * a * x * y + b * y ** 3 + c;
  const fy = a * x * x + 3 * b * x * y * y;
  return {
    type: "eqn",
    text: `f = ${had(a, "x²y")} ${had(b, "xy³", 1, false).trim()} ${had(c, "x", 1, false).trim()},   ∂f/∂x (${iz(x)}; ${iz(y)}) = ?`,
    prompt: po("xususiyHosila"),
    ...zPick(fx, [fy, 2 * a * x * y + c, 2 * a * x * y + 3 * b * y * y + c]),
    yechim: [
      Y("xususiyQ", `∂f/∂x = ${had(2 * a, "xy")} ${had(b, "y³", 1, false).trim()} ${qosh(c)}`),
      Y("qoy", `${iz(2 * a * x * y)} ${qosh(b * y ** 3)} ${qosh(c)}`),
      Y("javob", iz(fx)),
    ],
  };
};

/** f = a·x² + b·xy² — ∂f/∂y nuqtada. */
export const o2XususiyY = (): Activity => {
  const a = nz(-4, 4), b = nz(-3, 3), x = nz(-3, 3), y = nz(-3, 3);
  const fy = 2 * b * x * y;
  return {
    type: "eqn", text: `f = ${had(a, "x²")} ${had(b, "xy²", 1, false).trim()},   ∂f/∂y (${iz(x)}; ${iz(y)}) = ?`,
    prompt: po("xususiyHosila"),
    ...zPick(fy, [2 * a * x + b * y * y, 2 * a * x + fy, b * y * y]),
    yechim: [
      Y("xususiyQ", `∂f/∂y = ${had(2 * b, "xy")}`),
      Y("qoy", `${2 * b} · ${qav(x)} · ${qav(y)}`),
      Y("javob", iz(fy)),
    ],
  };
};

/** grad f uzunligi: f = ax + by + c → √(a² + b²). Pifagor juftlari bilan. */
export const o2Gradient = (): Activity => {
  const [p, q, r] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]] as const);
  const [a, b] = shuffle([Math.random() < 0.5 ? -p : p, Math.random() < 0.5 ? -q : q]);
  const c = rnd(-9, 9);
  return {
    type: "eqn", text: `|grad f|,   f = ${kophad([a, 0])} ${had(b, "y", 1, false).trim()} ${c ? qosh(c) : ""}`.trim(),
    prompt: po("gradient"),
    ...zPick(r, [p + q, r * r, Math.abs(a + b)]),
    yechim: [Y("gradientQ", `grad f = (${iz(a)}; ${iz(b)})`), Y("hisobla", `√(${p * p} + ${q * q})`), Y("javob", String(r))],
  };
};

/** f = x² + y² + ax + by — minimum nuqtasi. Xato: ishorani almashtirmaslik, 2 ga bo'lmaslik. */
export const o2Ekstremum = (): Activity => {
  const px = nz(-5, 5), py = nz(-5, 5);
  const a = -2 * px, b = -2 * py;
  const nuqta = (x: number, y: number) => `(${iz(x)}; ${iz(y)})`;
  return {
    type: "eqn", text: `f = x² + y² ${qosh(a)}x ${qosh(b)}y`, prompt: po("ekstremum2"),
    ...sPick(nuqta(px, py), [nuqta(-px, -py), nuqta(a, b), nuqta(py, px)], [nuqta(px, -py)]),
    yechim: [
      Y("kritik", `f′x = 2x ${qosh(a)} = 0,   f′y = 2y ${qosh(b)} = 0`),
      Y("javob", nuqta(px, py)),
    ],
  };
};

/* ==================================================================== */
/*                         KARRALI INTEGRALLAR                          */
/* ==================================================================== */

/** ∬ (ax + by) dxdy, [0,m]×[0,n]. m, n juft — natija butun. */
export const o2IkkiKarrali = (): Activity => {
  const m = pick([2, 4]), n = pick([2, 4, 6]), a = nz(-3, 3), b = nz(-3, 3);
  const j = (a * m * m * n) / 2 + (b * n * n * m) / 2;
  return {
    type: "eqn", text: `∬ (${kophad([a, 0])} ${had(b, "y", 1, false).trim()}) dx dy,   0 ≤ x ≤ ${m},  0 ≤ y ≤ ${n}`,
    prompt: po("karraliIntegral"),
    // Xato: bitta integrallash, yoki 1/2 ni unutish.
    ...zPick(j, [(a * m * m) / 2 + (b * n * n) / 2, a * m * m * n + b * n * n * m, (a + b) * m * n]),
    yechim: [
      Y("karraliQ", `∫₀^${m} (${had(a * n, "x")} ${qosh((b * n * n) / 2)}) dx`),
      Y("hisobla", `${iz((a * m * m * n) / 2)} ${qosh((b * n * n * m) / 2)}`),
      Y("javob", iz(j)),
    ],
  };
};

/** ∬ xy dxdy, [0,m]×[0,n] = m²n²/4. */
export const o2KarraliKopaytma = (): Activity => {
  const m = pick([2, 4, 6]), n = pick([2, 4]);
  const j = (m * m * n * n) / 4;
  return {
    type: "eqn", text: `∬ xy dx dy,   0 ≤ x ≤ ${m},  0 ≤ y ≤ ${n}`, prompt: po("karraliIntegral"),
    ...zPick(j, [m * n, (m * m * n * n) / 2, (m * n) / 4]),
    yechim: [
      Y("karraliQ", `(∫₀^${m} x dx) · (∫₀^${n} y dy) = ${(m * m) / 2} · ${(n * n) / 2}`),
      Y("javob", iz(j)),
    ],
  };
};

/** Soha yuzi: 0 ≤ x ≤ a, 0 ≤ y ≤ kx → ka²/2. */
export const o2SohaYuzi = (): Activity => {
  const a = pick([2, 4, 6]), k = rnd(1, 5);
  const j = (k * a * a) / 2;
  return {
    type: "eqn", text: `S = ∬ dx dy,   0 ≤ x ≤ ${a},  0 ≤ y ≤ ${had(k, "x")}`, prompt: po("sohaYuzi"),
    ...zPick(j, [k * a * a, k * a, (k * a) / 2]),
    yechim: [Y("karraliQ", `∫₀^${a} ${had(k, "x")} dx = ${k}·${a}²/2`), Y("javob", iz(j))],
  };
};

/* ==================================================================== */
/*                               QATORLAR                               */
/* ==================================================================== */

/** Qaysi qator yaqinlashadi? Bitta p > 1 qator va uchta uzoqlashuvchi. */
export const o2QatorTanlash = (): Activity => {
  const p = pick([2, 3, 4]);
  const togri = `Σ 1/n${"⁰¹²³⁴"[p]}`;
  return {
    type: "eqn", text: po("txtQaysiQator"), prompt: po("qatorYaqinlashish"),
    ...sPick(togri, ["Σ 1/n", "Σ 1/√n", "Σ n/(n + 1)"]),
    yechim: [Y("pQator"), Y("javob", `${togri}:  p = ${p} > 1`)],
  };
};

/** Σ xⁿ/kⁿ yoki Σ kⁿxⁿ — yaqinlashish radiusi. */
export const o2Radius = (): Activity => {
  const k = rnd(2, 9);
  const bolish = Math.random() < 0.5;
  const j = bolish ? String(k) : fr(1, k);
  return {
    type: "eqn", text: bolish ? `Σ xⁿ / ${k}ⁿ,   R = ?` : `Σ ${k}ⁿ · xⁿ,   R = ?`, prompt: po("radius"),
    ...sPick(j, [bolish ? fr(1, k) : String(k), "1", "∞"], ["0"]),
    yechim: [Y("radiusQ", bolish ? `R = 1 / (1/${k}) = ${k}` : `R = 1 / ${k}`), Y("javob", j)],
  };
};

/** e^(ax) ning Makloren qatoridagi xⁿ koeffitsiyenti: aⁿ/n!. */
export const o2Teylor = (): Activity => {
  const a = pick([1, 2, 3, -1, -2]), n = rnd(2, 4);
  const j = fr(a ** n, faktorial(n));
  return {
    type: "eqn", text: `e^(${had(a, "x")}) = Σ cₙxⁿ,   c${"₀₁₂₃₄"[n]} = ?`, prompt: po("teylor"),
    ...sPick(j, [fr(a ** n, n), fr(a, faktorial(n)), String(a ** n)],
      [fr(1, faktorial(n)), "0", fr(2 * a ** n, faktorial(n)), fr(-(a ** n), faktorial(n))]),
    yechim: [Y("teylorQ", `cₙ = aⁿ / n! = ${qav(a)}${"⁰¹²³⁴"[n]} / ${n}!`), Y("javob", j)],
  };
};

/* ==================================================================== */
/*                      DIFFERENSIAL TENGLAMALAR                        */
/* ==================================================================== */

/** y″ + py′ + qy = 0 — xarakteristik tenglama ildizlari. */
export const o2Xarakteristik = (): Activity => {
  const r1 = nz(-5, 5);
  // r₂ ≠ ±r₁: qarama-qarshi ildizlarda "ishorani almashtirish" xatosi
  // to'g'ri javob bilan bir xil chiqardi.
  let r2 = nz(-5, 5);
  while (Math.abs(r2) === Math.abs(r1)) r2 = nz(-5, 5);
  const p = -(r1 + r2), q = r1 * r2;
  // `had` — "1y′" emas "y′" yoziladi; nol koeffitsiyentli had tushib qoladi.
  const tenglama = `y″${had(p, "y′", 1, false)}${had(q, "y", 1, false)} = 0`;
  const [f1, f2] = [ikkiIldiz(r1, r2), ikkiIldiz(-r1, -r2)];
  return {
    type: "eqn", text: tenglama, prompt: po("xarakteristik"),
    ...sPick(f1.replace(/x/g, "k"), [f2.replace(/x/g, "k"), ikkiIldiz(r1, -r2).replace(/x/g, "k"),
      ikkiIldiz(p, q).replace(/x/g, "k")],
      [ikkiIldiz(r1 + 1, r2), ikkiIldiz(r1, r2 + 1), ikkiIldiz(-r1, r2)].map((x) => x.replace(/x/g, "k"))),
    yechim: [
      Y("xarakteristikQ", `k²${had(p, "k", 1, false)}${had(q, "", 0, false)} = 0`),
      Y("viet", `k₁ + k₂ = ${iz(-p)},  k₁·k₂ = ${iz(q)}`),
      Y("javob", f1.replace(/x/g, "k")),
    ],
  };
};

/** Umumiy yechim — ildizlar berilgan. */
export const o2UmumiyYechim = (): Activity => {
  const r1 = nz(-4, 4);
  const karrali = Math.random() < 0.35;
  let r2 = karrali ? r1 : nz(-4, 4);
  if (!karrali && r2 === r1) r2 = -r1;
  const p = -(r1 + r2), q = r1 * r2;
  const e = (r: number) => `e^(${had(r, "x")})`;
  const j = karrali ? `y = (C₁ + C₂x)${e(r1)}` : `y = C₁${e(r1)} + C₂${e(r2)}`;
  const xato = karrali
    ? [`y = C₁${e(r1)} + C₂${e(r1)}`, `y = (C₁ + C₂x)${e(-r1)}`, `y = C₁${e(r1)}`]
    : [`y = C₁${e(-r1)} + C₂${e(-r2)}`, `y = (C₁ + C₂x)${e(r1)}`, `y = C₁${e(r1 * r2)}`];
  return {
    type: "eqn", text: `y″${had(p, "y′", 1, false)}${had(q, "y", 1, false)} = 0`, prompt: po("umumiyYechim"),
    ...sPick(j, xato, [`y = C₁e^(x) + C₂`]),
    yechim: [
      Y("xarakteristikQ", `k²${had(p, "k", 1, false)}${had(q, "", 0, false)} = 0  →  ${karrali ? `k = ${iz(r1)} (karrali)` : ikkiIldiz(r1, r2).replace(/x/g, "k")}`),
      Y("javob", j),
    ],
  };
};

/** y′ = kxy — o'zgaruvchilari ajraladigan. k juft: y = C·e^((k/2)x²). */
export const o2Ajraladigan = (): Activity => {
  const k = pick([2, 4, 6, -2, -4]);
  const d = (s: number) => `e^(${had(s, "x²")})`;
  const j = `y = C${d(k / 2)}`;
  return {
    type: "eqn", text: `y′ = ${had(k, "xy")}`, prompt: po("difTenglama"),
    ...sPick(j, [`y = C${d(k)}`, `y = C${d(2 * k)}`, `y = C${d(-k / 2)}`]),
    yechim: [Y("ajraladiganQ", `dy/y = ${had(k, "x")} dx  →  ln|y| = ${had(k / 2, "x²")} + C`), Y("javob", j)],
  };
};

/* ==================================================================== */
/*                   EHTIMOLLAR NAZARIYASI VA STATISTIKA                */
/* ==================================================================== */

/** Kombinatsiya / o'rinlashtirish / o'rin almashtirish — so'z bilan. */
export const e1Kombinatorika = (): Activity => {
  const tur = rnd(0, 2);
  if (tur === 0) {
    const n = rnd(5, 10), k = rnd(2, 3);
    return {
      type: "eqn", text: po("txtGuruhTanlash", { n, k }), prompt: po("kombinatsiya"),
      ...zPick(C(n, k), [A(n, k), n * k, C(n, k - 1)]),
      yechim: [Y("formula", "Cₙᵏ = n! / (k!(n − k)!)"), Y("javob", String(C(n, k)))],
    };
  }
  if (tur === 1) {
    const n = rnd(5, 9), k = rnd(2, 3);
    return {
      type: "eqn", text: po("txtLavozim", { n, k }), prompt: po("orinlashtirish"),
      ...zPick(A(n, k), [C(n, k), n ** k, n * k]),
      yechim: [Y("formula", "Aₙᵏ = n! / (n − k)!"), Y("javob", String(A(n, k)))],
    };
  }
  const n = rnd(4, 6);
  return {
    type: "eqn", text: po("txtNavbat", { n }), prompt: po("orinAlmashtirish"),
    ...zPick(faktorial(n), [n * n, faktorial(n - 1), 2 ** n]),
    yechim: [Y("orinAlmash", `${n}! = ${faktorial(n)}`), Y("javob", String(faktorial(n)))],
  };
};

/** Klassik ehtimollik — qutidan shar, ikki kubik. */
export const e1Klassik = (): Activity => {
  if (Math.random() < 0.5) {
    // oq ≠ qora: teng bo'lsa 1/2 va "qora olish" chalg'ituvchisi bir xil chiqardi.
    const oq = rnd(2, 9);
    let qora = rnd(2, 9);
    if (qora === oq) qora = oq === 9 ? 2 : oq + 1;
    return {
      type: "eqn", text: po("txtQutiBir", { oq, qora }), prompt: po("hodisaEhtimoli"),
      ...sPick(fr(oq, oq + qora), [fr(oq, qora), fr(qora, oq + qora), fr(1, oq)], [fr(1, 2), fr(oq, oq + qora + 1)]),
      yechim: [Y("ehtimol", `P = ${oq} / (${oq} + ${qora})`), Y("javob", fr(oq, oq + qora))],
    };
  }
  const s = rnd(3, 11);
  const qulay = 6 - Math.abs(7 - s);
  return {
    type: "eqn", text: po("txtIkkiKubik", { s }), prompt: po("hodisaEhtimoli"),
    ...sPick(fr(qulay, 36), [fr(1, 11), fr(qulay, 12), fr(s, 36)], [fr(1, 36), fr(qulay + 1, 36)]),
    yechim: [Y("ehtimol", `${qulay} / 36`), Y("javob", fr(qulay, 36))],
  };
};

/** Qaytarmasdan ikki shar — ikkalasi oq. Xato: qaytarib qo'ygandek hisoblash. */
export const e1Kopaytirish = (): Activity => {
  const oq = rnd(3, 7), qora = rnd(2, 6), N = oq + qora;
  const j = fr(oq * (oq - 1), N * (N - 1));
  return {
    type: "eqn", text: po("txtQutiIkki", { oq, qora }), prompt: po("hodisaEhtimoli"),
    ...sPick(j, [fr(oq * oq, N * N), fr(2 * oq, N), fr(oq - 1, N - 1)], [fr(oq, N)]),
    yechim: [Y("shartliQ", `P = ${oq}/${N} · ${oq - 1}/${N - 1}`), Y("javob", j)],
  };
};

/** To'la ehtimollik: ikki quti teng ehtimol bilan tanlanadi. */
export const e1TolaEhtimol = (): Activity => {
  const a = rnd(1, 5), b = rnd(1, 5), c = rnd(1, 5), d = rnd(1, 5);
  const j = fr(a * (c + d) + c * (a + b), 2 * (a + b) * (c + d));
  return {
    type: "eqn", text: po("txtIkkiQuti", { a, b, c, d }), prompt: po("tolaEhtimol"),
    ...sPick(j, [fr(a + c, a + b + c + d + 1), fr(a * c, (a + b) * (c + d)), fr(a + c, 2)],
      [fr(a, a + b), fr(c, c + d)]),
    yechim: [
      Y("tolaEhtimolQ", `P = ½ · ${a}/${a + b} + ½ · ${c}/${c + d}`),
      Y("javob", j),
    ],
  };
};

/** Bernulli: n marta tanga, aniq k ta gerb — C(n,k)/2ⁿ. */
export const e1Bernulli = (): Activity => {
  const n = rnd(3, 6), k = rnd(1, n - 1);
  const j = fr(C(n, k), 2 ** n);
  return {
    type: "eqn", text: po("txtBernulli", { n, k }), prompt: po("hodisaEhtimoli"),
    ...sPick(j, [fr(1, 2 ** n), fr(k, n), fr(C(n, k), n)], [fr(1, 2)]),
    yechim: [
      Y("bernulliQ", `P = C${"₀₁₂₃₄₅₆"[n]}${"⁰¹²³⁴⁵⁶"[k]} · (½)${"⁰¹²³⁴⁵⁶"[n]}`),
      Y("hisobla", `${C(n, k)} / ${2 ** n}`),
      Y("javob", j),
    ],
  };
};

/** Diskret tasodifiy miqdor: matematik kutilma. Ehtimollar o'ndan birlarda. */
export const e1Kutilma = (): Activity => {
  const x = shuffle([1, 2, 3, 4, 5, 6, 8, 10]).slice(0, 3).sort((a, b) => a - b);
  const p1 = rnd(1, 5), p2 = rnd(1, 8 - p1), p3 = 10 - p1 - p2;
  const j = (x[0] * p1 + x[1] * p2 + x[2] * p3) / 10;
  const f = (v: number) => String(v).replace(".", ",");
  return {
    type: "eqn",
    text: `X: ${x.join(";  ")}     P: 0,${p1};  0,${p2};  0,${p3}     M(X) = ?`,
    prompt: po("kutilma"),
    // Xato: ehtimollarni hisobga olmay oddiy o'rtacha, 10 ga bo'lmaslik.
    ...sPick(f(j), [f(Math.round(((x[0] + x[1] + x[2]) / 3) * 10) / 10), f(j * 10), f(x[2])],
      [f(j + 0.5), f(j - 0.5)]),
    yechim: [Y("kutilmaQ", `${x[0]}·0,${p1} + ${x[1]}·0,${p2} + ${x[2]}·0,${p3}`), Y("javob", f(j))],
  };
};

/** Binomial taqsimot: M = np, D = npq. */
export const e1Binomial = (): Activity => {
  const [p, q] = pick([[1, 2], [1, 4], [1, 5], [2, 5], [1, 10]] as const);
  const n = q * rnd(2, 8);
  const disp = Math.random() < 0.5;
  const M = (n * p) / q;
  const j = disp ? fr(n * p * (q - p), q * q) : iz(M);
  return {
    type: "eqn", text: `n = ${n},   p = ${fr(p, q)},   ${disp ? "D(X)" : "M(X)"} = ?`, prompt: po("binomial"),
    ...sPick(j, disp ? [iz(M), fr(n * p, q * q), fr(n * (q - p), q)] : [fr(n * p * (q - p), q * q), iz(n - M), fr(p, q)],
      [iz(M + 1), iz(n), fr(n * p * (q - p) + q * q, q * q), iz(Math.max(0, M - 1))]),
    yechim: [Y(disp ? "dispersiyaQ" : "kutilmaQ", disp ? "D = n·p·q" : "M = n·p"), Y("javob", j)],
  };
};

/** Namuna: o'rta qiymat, mediana, moda yoki kenglik. */
export const e1Namuna = (): Activity => {
  const n = pick([5, 7]);
  const orta = rnd(4, 15);
  // O'rtachasi butun chiqadigan namuna: nosimmetrik siljishlar yig'indisi 0.
  const siljish = pick(n === 5 ? [[-3, -1, 0, 1, 3], [-4, -1, 0, 2, 3], [-2, -2, 0, 1, 3]]
    : [[-4, -2, -1, 0, 1, 2, 4], [-3, -3, -1, 0, 2, 2, 3], [-5, -1, 0, 0, 1, 2, 3]]);
  const arr = shuffle(siljish.map((s) => orta + s));
  const tartib = [...arr].sort((a, b) => a - b);
  const tur = rnd(0, 2);
  if (tur === 0) {
    return {
      type: "eqn", text: `${arr.join(", ")}   →   x̄ = ?`, prompt: po("ortaQiymat"),
      ...zPick(orta, [tartib[0] + tartib[n - 1], tartib[n - 1] - tartib[0], arr[Math.floor(n / 2)]]),
      yechim: [Y("ortacha", `${arr.reduce((a, b) => a + b, 0)} / ${n}`), Y("javob", String(orta))],
    };
  }
  if (tur === 1) {
    const med = tartib[(n - 1) / 2];
    return {
      type: "eqn", text: `${arr.join(", ")}   →   Me = ?`, prompt: po("medianaTop"),
      ...zPick(med, [arr[(n - 1) / 2], orta + 1, tartib[n - 1] - tartib[0]]),
      yechim: [Y("mediana", tartib.join(", ")), Y("javob", String(med))],
    };
  }
  const R = tartib[n - 1] - tartib[0];
  return {
    type: "eqn", text: `${arr.join(", ")}   →   R = ?`, prompt: po("kenglik"),
    ...zPick(R, [tartib[n - 1], R + 1, orta]),
    yechim: [Y("kenglikQ", `${tartib[n - 1]} − ${tartib[0]}`), Y("javob", String(R))],
  };
};
