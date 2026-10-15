/**
 * DTM da doim chiqadigan, lekin maktab darsligida alohida bob bo'lmagan
 * mavzular (2026-10-15 da qo'shildi):
 *
 *   7-sinf algebra   7-bob. Bo'linish va qoldiqlar — qoldiqli bo'lish,
 *                    qoldiqlar ustida amallar, darajaning oxirgi raqami,
 *                    bo'luvchilar soni va yig'indisi
 *   9-sinf algebra   6-bob. Parametrli tenglamalar
 *   11-sinf          7-bob. Kesik konus va kesik piramida
 *
 * Nega shu uchtasi: test variantlarida ular har yili bor, darslikda esa
 * yo'q yoki bitta mashq bo'lib o'tib ketadi. Abituriyent ularni repetitorda
 * yoki umuman o'rganmaydi — imtihonda esa aynan shu savollar "tuzoq" bo'ladi.
 *
 * Chalg'ituvchilar `algebra.ts` dagi qoida bo'yicha — o'quvchining ANIQ
 * xatosi: davrni noto'g'ri boshlash (n = 4k da 1 deb olish), bo'luvchilar
 * sonida ko'rsatkichlarni ko'paytirish, parametrda a = 0 holatini
 * unutish, kesik konus hajmida Rr hadini tushirib qoldirish.
 */
import type { Activity } from "../activity";
import { po } from "../tarjima/oliy";
import { Y, iz, nz, pick, qosh, rnd, sPick, ust, zPick } from "./asos";

/* ==================================================================== */
/*                    7-SINF. BO'LINISH VA QOLDIQLAR                    */
/* ==================================================================== */

/** Qoldiqli bo'lish: a = b·q + r, 0 ≤ r < b. */
export const n7Qoldiq = (): Activity => {
  const b = rnd(3, 12), q = rnd(6, 60), r = rnd(1, b - 1);
  const a = b * q + r;
  return {
    type: "eqn", text: `${a} : ${b}`, prompt: po("qoldiqTop"),
    // Bo'linmani qoldiq deb yozish, qoldiqni "yetmagan" tomondan sanash.
    ...zPick(r, [q, b - r, r + 1]),
    yechim: [
      Y("qoldiqliBolish", "a = b · q + r,   0 ≤ r < b"),
      Y("hisobla", `${a} = ${b} · ${q} + ${r}`),
      Y("javob", String(r)),
    ],
  };
};

/** Qoldiqlar ustida amallar: yig'indi va ko'paytmaning qoldig'i. */
export const n7QoldiqAmal = (): Activity => {
  const m = rnd(5, 11), r1 = rnd(2, m - 1), r2 = rnd(2, m - 1);
  const kop = Math.random() < 0.5;
  const s = kop ? r1 * r2 : r1 + r2;
  const j = s % m;
  return {
    type: "eqn", text: po(kop ? "txtQoldiqKop" : "txtQoldiqQosh", { m, r1, r2 }), prompt: po("qoldiqTop"),
    // Qoldiqning o'zini emas, amal natijasini javob deb berish; boshqa amal bilan adashtirish.
    ...zPick(j, [s, kop ? (r1 + r2) % m : (r1 * r2) % m, (j + 1) % m]),
    yechim: [
      Y(kop ? "qoldiqKop" : "qoldiqQosh"),
      Y("hisobla", `${r1} ${kop ? "·" : "+"} ${r2} = ${s}`),
      Y("hisobla", `${s} = ${m} · ${Math.floor(s / m)} + ${j}`),
      Y("javob", String(j)),
    ],
  };
};

/** Darajaning oxirgi raqami — oxirgi raqamlar 4 qadamda takrorlanadi. */
export const n7OxirgiRaqam = (): Activity => {
  const d = pick([2, 3, 4, 7, 8, 9]);
  const a = d + 10 * pick([0, 0, 1, 2, 3]);
  const n = rnd(13, 99);
  const davr = [1, 2, 3, 4].map((k) => d ** k % 10);
  const k = n % 4 === 0 ? 4 : n % 4;
  const j = davr[k - 1]!;
  return {
    type: "eqn", text: `${a}${ust(n)}`, prompt: po("oxirgiRaqam"),
    // Eng ko'p xato: n 4 ga qoldiqsiz bo'linganda d⁰ = 1 deb olish.
    ...zPick(j, [n % 4 === 0 ? 1 : davr[(k % 4)]!, d, n % 10]),
    yechim: [
      Y("oxirgiDavr", `${d}: ${davr.join(", ")}, …`),
      Y("hisobla", `${n} = 4 · ${(n - k) / 4} + ${k}`),
      Y("javob", String(j)),
    ],
  };
};

/** Tub ko'paytuvchilarga yoyilma — "2³ · 3² · 5". */
const yoyilma = (t: [number, number][]): string =>
  t.map(([p, e]) => (e === 1 ? String(p) : `${p}${ust(e)}`)).join(" · ");

/** Kichik son uchun 2–3 ta tub ko'paytuvchi va ko'rsatkichlar. */
function tubSon(): [number, number][] {
  for (;;) {
    const p = pick([2, 2, 3]);
    const q = pick([3, 5, 7, 11].filter((x) => x > p));
    const t: [number, number][] = [[p, rnd(1, 4)], [q, rnd(1, 3)]];
    if (Math.random() < 0.35) {
      const r = pick([5, 7, 11, 13].filter((x) => x > q));
      if (r) t.push([r, 1]);
    }
    const N = t.reduce((s, [b, e]) => s * b ** e, 1);
    if (N >= 24 && N <= 3000) return t;
  }
}

/** Natural bo'luvchilar soni: N = p^a · q^b → (a+1)(b+1). */
export const n7BoluvchiSoni = (): Activity => {
  const t = tubSon();
  const N = t.reduce((s, [b, e]) => s * b ** e, 1);
  const j = t.reduce((s, [, e]) => s * (e + 1), 1);
  return {
    type: "eqn", text: `${N}`, prompt: po("boluvchiSoni"),
    // Ko'rsatkichlarni o'zini ko'paytirish; qo'shib qo'yish; 1 va N ni sanamaslik.
    ...zPick(j, [t.reduce((s, [, e]) => s * e, 1), t.reduce((s, [, e]) => s + e + 1, 0), j - 2]),
    yechim: [
      Y("tubYoy", `${N} = ${yoyilma(t)}`),
      Y("boluvchiSoniF", "τ = (a + 1)(b + 1)…"),
      Y("hisobla", t.map(([, e]) => `(${e} + 1)`).join(" · ") + ` = ${j}`),
      Y("javob", String(j)),
    ],
  };
};

/** Natural bo'luvchilar yig'indisi: σ = (1 + p + … + pᵃ)(1 + q + … + qᵇ). */
export const n7BoluvchiYigindi = (): Activity => {
  const p = 2, a = rnd(1, 3), q = pick([3, 5, 7]), b = rnd(1, 2);
  const N = p ** a * q ** b;
  const qator = (x: number, e: number) => Array.from({ length: e + 1 }, (_, i) => x ** i);
  const sp = qator(p, a).reduce((s, x) => s + x, 0), sq = qator(q, b).reduce((s, x) => s + x, 0);
  const j = sp * sq;
  return {
    type: "eqn", text: `${N}`, prompt: po("boluvchiYigindi"),
    // N ning o'zini qo'shmaslik; qavslarni ko'paytirish o'rniga qo'shish; 1 + N.
    ...zPick(j, [j - N, sp + sq, N + 1]),
    yechim: [
      Y("tubYoy", `${N} = ${yoyilma([[p, a], [q, b]])}`),
      Y("boluvchiYigindiF", `(${qator(p, a).join(" + ")}) · (${qator(q, b).join(" + ")})`),
      Y("hisobla", `${sp} · ${sq} = ${j}`),
      Y("javob", String(j)),
    ],
  };
};

/* ==================================================================== */
/*                    9-SINF. PARAMETRLI TENGLAMALAR                    */
/* ==================================================================== */

/** "x² + 6x + a = 0" — a ni harf bilan yozadi (kophad son kutadi). */
const kvParam = (b: number) => `x² ${b < 0 ? "−" : "+"} ${Math.abs(b)}x + a = 0`;

/** Ildizlar soni va parametr: D/4 = k² − a. */
export const p9IldizSoni = (): Activity => {
  const k = nz(-7, 7), c = k * k;
  const tur = pick(["bir", "yoq", "ikki"] as const);
  const javob = { bir: `a = ${c}`, yoq: `a > ${c}`, ikki: `a < ${c}` };
  return {
    type: "eqn", text: kvParam(2 * k), prompt: po(tur === "bir" ? "paramBirIldiz" : tur === "yoq" ? "paramIldizYoq" : "paramIkkiIldiz"),
    ...sPick(javob[tur], Object.values(javob).filter((x) => x !== javob[tur]), [`a = ${iz(-c)}`, `a = ${2 * Math.abs(k)}`]),
    yechim: [
      Y("diskriminant4", `D/4 = ${k * k} − a`),
      Y(tur === "bir" ? "dNol" : tur === "yoq" ? "dManfiy" : "dMusbat"),
      Y("javob", javob[tur]),
    ],
  };
};

/** Bosh koeffitsientda parametr: a = m da tenglama chiziqli bo'lib qoladi. */
export const p9BoshParam = (): Activity => {
  const m = rnd(1, 6), k = rnd(1, 4);
  const ikkinchi = m + k * k;
  const toliq = `a = ${m};  a = ${ikkinchi}`;
  return {
    type: "eqn", text: `(a − ${m})x² + ${2 * k}x + 1 = 0`, prompt: po("paramBirIldiz"),
    // Asosiy tuzoq: a = m da tenglama kvadrat emas, chiziqli — u ham bitta ildiz beradi.
    ...sPick(toliq, [`a = ${ikkinchi}`, `a = ${m}`, `a = ${m};  a = ${m - k * k}`], [`a = ${k * k}`]),
    yechim: [
      Y("boshNol", `a = ${m}:   ${2 * k}x + 1 = 0`),
      Y("diskriminant4", `a ≠ ${m}:   D/4 = ${k * k} − (a − ${m}) = 0`),
      Y("javob", toliq),
    ],
  };
};

/** Parametr va Viyet teoremasi: bitta ildiz berilgan — p ni topish. */
export const p9ParamViyet = (): Activity => {
  let x1 = nz(-9, 9), x2 = nz(-9, 9);
  while (x2 === x1) x2 = nz(-9, 9);
  const c = x1 * x2, p = -(x1 + x2);
  return {
    type: "eqn", text: `x² + px ${qosh(c)} = 0,   x₁ = ${iz(x1)}`, prompt: po("paramPTop"),
    // Ishorani unutish (p = x₁ + x₂), ikkinchi ildizni javob deb berish.
    ...zPick(p, [x1 + x2, x2, -x1]),
    yechim: [
      Y("viet", `x₁ · x₂ = ${iz(c)}   ⇒   x₂ = ${iz(x2)}`),
      Y("hisobla", `p = −(x₁ + x₂) = −(${iz(x1)} ${qosh(x2)})`),
      Y("javob", `p = ${iz(p)}`),
    ],
  };
};

/** Chiziqli tenglamada parametr: (a − k)x = … — cheksiz ko'p yoki yechimsiz. */
export const p9ParamChiziqli = (): Activity => {
  const k = rnd(1, 9);
  if (Math.random() < 0.5) {
    // (a − k)x = a² − k²: a = k da 0 = 0 — har qanday x yechim.
    return {
      type: "eqn", text: `(a − ${k})x = a² − ${k * k}`, prompt: po("paramCheksiz"),
      ...sPick(`a = ${k}`, [`a = −${k}`, `a = ±${k}`, `a ≠ ${k}`]),
      yechim: [
        Y("chiziqliParam", "0 · x = 0"),
        Y("hisobla", `a = ${k}:   0 · x = ${k * k} − ${k * k} = 0`),
        Y("javob", `a = ${k}`),
      ],
    };
  }
  let m = nz(-9, 9);
  while (m === -k) m = nz(-9, 9);
  return {
    type: "eqn", text: `(a − ${k})x = a ${qosh(m)}`, prompt: po("paramYechimsiz"),
    ...sPick(`a = ${k}`, [`a = ${iz(-m)}`, `a = −${k}`, `a ≠ ${k}`], ["a = 0", `a = ${k + 1}`]),
    yechim: [
      Y("chiziqliParam", "0 · x = b,  b ≠ 0"),
      Y("hisobla", `a = ${k}:   0 · x = ${k + m}`),
      Y("javob", `a = ${k}`),
    ],
  };
};

/** Ildizlar ishorasi: ikkita har xil musbat ildiz — D > 0, x₁x₂ > 0, x₁+x₂ > 0. */
export const p9ParamIshora = (): Activity => {
  const p = rnd(2, 7), c = p * p;
  const j = `0 < a < ${c}`;
  return {
    type: "eqn", text: `x² − ${2 * p}x + a = 0`, prompt: po("paramIkkiMusbat"),
    // Faqat D > 0 ni yoki faqat x₁x₂ > 0 ni yozish — shartlardan birini unutish.
    ...sPick(j, [`a < ${c}`, "a > 0", `0 < a < ${2 * p}`], [`a > ${c}`]),
    yechim: [
      Y("diskriminant4", `D/4 = ${c} − a > 0   ⇒   a < ${c}`),
      Y("viet", `x₁ · x₂ = a > 0,   x₁ + x₂ = ${2 * p} > 0`),
      Y("javob", j),
    ],
  };
};

/* ==================================================================== */
/*                  11-SINF. KESIK KONUS VA KESIK PIRAMIDA              */
/* ==================================================================== */

/** (R − r, h, l) — yasovchi butun chiqsin. */
const UCHLIK = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [4, 3, 5], [12, 5, 13]] as const;

function kesikKonus() {
  const [d, h, l] = pick(UCHLIK);
  const r = rnd(1, 6);
  return { R: r + d, r, h, l, d };
}

/** Kesik konus yasovchisi: l² = h² + (R − r)². */
export const s11KesikYasovchi = (): Activity => {
  const { R, r, h, l, d } = kesikKonus();
  return {
    type: "eqn", text: `R = ${R},  r = ${r},  h = ${h}`, prompt: po("kesikYasovchi"),
    // R − r o'rniga R + r olish yoki yasovchini balandlik deb bilish.
    ...zPick(l, [h, d + h, R]),
    yechim: [
      Y("kesikYasovchiF", "l² = h² + (R − r)²"),
      Y("hisobla", `l² = ${h * h} + ${d * d} = ${l * l}`),
      Y("javob", String(l)),
    ],
  };
};

/** Kesik konus yon sirti: S = π l (R + r). */
export const s11KesikYonSirt = (): Activity => {
  const { R, r, h, l } = kesikKonus();
  const j = `${l * (R + r)}π`;
  return {
    type: "eqn", text: `R = ${R},  r = ${r},  h = ${h}`, prompt: po("kesikYonSirt"),
    // Yasovchi o'rniga balandlik; R + r o'rniga R − r; 2π.
    ...sPick(j, [`${h * (R + r)}π`, `${l * (R - r)}π`, `${2 * l * (R + r)}π`], [`${l * (R + r) + R * R + r * r}π`]),
    yechim: [
      Y("kesikYasovchiF", `l = √(${h * h} + ${(R - r) ** 2}) = ${l}`),
      Y("kesikYonF", "S = π · l · (R + r)"),
      Y("javob", j),
    ],
  };
};

/** Kesik konus hajmi: V = πh(R² + Rr + r²)/3. */
export const s11KesikHajm = (): Activity => {
  const t = rnd(1, 4), h = 3 * t, R = rnd(3, 8), r = rnd(1, R - 1);
  const s = R * R + R * r + r * r;
  const j = `${t * s}π`;
  return {
    type: "eqn", text: `R = ${R},  r = ${r},  h = ${h}`, prompt: po("kesikHajm"),
    // Rr hadini tushirish; /3 ni unutish; (R + r)² deb olish.
    ...sPick(j, [`${t * (R * R + r * r)}π`, `${h * s}π`, `${t * (R + r) ** 2}π`], [`${t * R * R}π`]),
    yechim: [
      Y("kesikHajmF", "V = πh(R² + Rr + r²) / 3"),
      Y("hisobla", `V = π · ${h} · (${R * R} + ${R * r} + ${r * r}) / 3`),
      Y("javob", j),
    ],
  };
};

/** Muntazam to'rtburchakli kesik piramida hajmi: V = h(S₁ + S₂ + √(S₁S₂))/3. */
export const s11KesikPiramida = (): Activity => {
  const t = rnd(1, 4), h = 3 * t, a = rnd(4, 10), b = rnd(2, a - 1);
  const j = t * (a * a + a * b + b * b);
  return {
    type: "eqn", text: po("txtKesikPiramida", { a, b, h }), prompt: po("kesikPiramidaHajm"),
    // √(S₁S₂) ni tushirish; /3 ni unutish; o'rta asos bilan prizma deb hisoblash.
    ...zPick(j, [t * (a * a + b * b), 3 * j, (h * (a * a + b * b)) / 2]),
    yechim: [
      Y("kesikPiramidaF", "V = h(S₁ + S₂ + √(S₁S₂)) / 3"),
      Y("hisobla", `V = ${h} · (${a * a} + ${b * b} + ${a * b}) / 3`),
      Y("javob", String(j)),
    ],
  };
};
