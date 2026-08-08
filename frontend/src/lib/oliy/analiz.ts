/**
 * 10–11-sinf: algebra va analiz asoslari.
 *
 * Manba:
 *   "Algebra va analiz asoslari 10" — funksiyalar, ratsional va
 *     irratsional tenglamalar, ko'rsatkichli va logarifmik funksiyalar,
 *     trigonometrik tenglamalar, ehtimollar nazariyasi
 *   "Matematika 11, I qism" — hosila va uning tatbiqlari, integral
 *   "Matematika 11, II qism" — integral tatbiqlari, ma'lumotlar tahlili
 *
 * ─────────────── SONLAR NEGA "CHIROYLI" TANLANADI ───────────────
 *
 * Bu bo'limdagi deyarli har bir generatorda sonlar ro'yxatdan olinadi,
 * tasodifiy oraliqdan emas. Sabab bitta: javob TO'RTTA TUGMAGA sig'ishi
 * kerak. log₃ 7 ning qiymati yoki √53 ekranda o'qilmaydigan uzun kasr
 * bo'lib chiqadi va bola javobni hisoblab emas, "eng qisqasini" tanlab
 * topadi.
 *
 * Shu sabab: logarifmda asos va son ataylab butun daraja bo'ladi,
 * hosilada koeffitsiyentlar kichik, integralda chegaralar butun natija
 * beradi. Bu masalani yengillashtirmaydi — u faqat javobni O'QILADIGAN
 * qiladi. Qiyinlik savolning o'zida qoladi.
 */
import type { Activity } from "../activity";
import { po } from "../tarjima/oliy";
import {
  dc, fr, had, iz, kophad, nz, pick, qosh, rnd, sPick, shuffle, ust, zPick,
} from "./asos";

/* ==================================================================== */
/*                   10-SINF: ELEMENTAR FUNKSIYALAR                     */
/* ==================================================================== */

/** Funksiyaning berilgan nuqtadagi qiymati. */
export const x10FunksiyaQiymat = (): Activity => {
  const a = nz(-4, 4), b = nz(-9, 9), c = nz(-9, 9), x = nz(-4, 4);
  const y = a * x * x + b * x + c;
  return {
    type: "eqn", text: `f(x) = ${kophad([a, b, c])},   f(${iz(x)}) = ?`, prompt: po("funksiyaQiymat"),
    ...zPick(y, [a * x + b * x + c, y - c, -y]),
  };
};

/** Murakkab funksiya: f(g(x)). */
export const x10Murakkab = (): Activity => {
  const a = rnd(2, 5), b = nz(-6, 6), x = nz(-4, 5);
  const g = a * x + b;          // g(x) = ax + b
  const s = g * g;              // f(t) = t²
  return {
    type: "eqn", text: `f(t) = t²,  g(x) = ${had(a, "x")} ${qosh(b)}.   f(g(${iz(x)})) = ?`,
    prompt: po("murakkabFunksiya"), ...zPick(s, [a * x * x + b, g, s + g]),
  };
};

/** Teskari funksiya: y = ax + b → x = (y − b)/a. */
export const x10Teskari = (): Activity => {
  const a = rnd(2, 6), b = nz(-9, 9);
  const j = `(x ${qosh(-b)}) / ${a}`;
  return {
    type: "eqn", text: `y = ${had(a, "x")} ${qosh(b)}`, prompt: po("teskariFunksiya"),
    ...sPick(j, [`(x ${qosh(b)}) / ${a}`, `${a}x ${qosh(-b)}`, `x / ${a} ${qosh(-b)}`]),
  };
};

/** Trigonometrik funksiyaning davri. */
export const x10Davr = (): Activity => {
  const k = rnd(2, 6);
  const f = pick(["sin", "cos"]);
  const j = `2π/${k}`;
  return {
    type: "eqn", text: `y = ${f} ${k}x`, prompt: po("davr"),
    ...sPick(j, ["2π", `π/${k}`, `${k}π`]),
  };
};

/** Ratsional tenglama: a/(x−b) = c. */
export const x10Ratsional = (): Activity => {
  const b = nz(-8, 8), c = nz(-6, 6), x = b + rnd(1, 6);
  const a = c * (x - b);
  return {
    type: "eqn", text: `${iz(a)} / (x ${qosh(-b)}) = ${iz(c)}`, prompt: po("ratsionalTenglama"),
    ...zPick(x, [-x, x - b, a - b]),
  };
};

/** Irratsional tenglama: √(ax + b) = c. */
export const x10Irratsional = (): Activity => {
  const a = rnd(1, 5), c = rnd(2, 9), b = nz(-9, 9);
  const x = (c * c - b) / a;
  if (!Number.isInteger(x)) return x10Irratsional();
  return {
    type: "eqn", text: `√(${had(a, "x")} ${qosh(b)}) = ${c}`, prompt: po("irratsionalTenglama"),
    // Xato: ikkala tomonni kvadratga ko'tarishni unutish.
    ...zPick(x, [(c - b) / a, c * c, x + 1]),
  };
};

/* ---------- ko'rsatkichli va logarifmik funksiyalar ---------- */

/** aˣ = aⁿ ko'rinishidagi ko'rsatkichli tenglama. */
export const x10Korsatkichli = (): Activity => {
  const a = pick([2, 3, 5]), n = rnd(2, 5);
  const s = a ** n;
  return {
    type: "eqn", text: `${a}ˣ = ${s}`, prompt: po("korsatkichliTenglama"),
    // Xato: darajani asosga bo'lish yoki javob sifatida sonning o'zini olish.
    ...zPick(n, [s / a, s, a * n]),
  };
};

/** Logarifmni hisoblash: log_a b. */
export const x10Logarifm = (): Activity => {
  const a = pick([2, 3, 5, 10]), n = rnd(1, 5);
  const b = a ** n;
  return {
    type: "eqn", text: `log${sub(a)} ${b} = ?`, prompt: po("logarifmHisobla"),
    ...zPick(n, [b / a, a * n, b]),
  };
};

/** Logarifm xossalari: log(ab), log(a/b), log aⁿ. */
export const x10LogarifmXossa = (): Activity => {
  const holatlar: [string, string][] = [
    ["log a + log b", "log(ab)"],
    ["log a − log b", "log(a/b)"],
    ["n · log a", "log aⁿ"],
    ["log 1", "0"],
  ];
  const [ifoda, j] = pick(holatlar);
  const boshqa = holatlar.map((x) => x[1]).filter((x) => x !== j);
  return { type: "eqn", text: `${ifoda} = ?`, prompt: po("logarifmXossa"), ...sPick(j, boshqa) };
};

/** Sodda logarifmik tenglama: log_a x = n. */
export const x10LogTenglama = (): Activity => {
  const a = pick([2, 3, 5]), n = rnd(1, 4);
  const x = a ** n;
  return {
    type: "eqn", text: `log${sub(a)} x = ${n}`, prompt: po("logarifmikTenglama"),
    ...zPick(x, [a * n, a + n, n ** a]),
  };
};

/** Ko'rsatkichli tengsizlik: aˣ > aⁿ, asos 1 dan katta. */
export const x10KorsatkichliTengsizlik = (): Activity => {
  const a = pick([2, 3, 5]), n = rnd(2, 5);
  const j = `x > ${n}`;
  return {
    type: "eqn", text: `${a}ˣ > ${a ** n}`, prompt: po("korsatkichliTengsizlik"),
    // Xato: asos 1 dan katta bo'lsa ham ishorani teskari o'girish.
    ...sPick(j, [`x < ${n}`, `x > ${a ** n}`, `x ≥ ${n}`]),
  };
};

/** Murakkab foiz: S = S₀(1 + p/100)ⁿ. */
export const x10MurakkabFoiz = (): Activity => {
  const s0 = pick([1000000, 2000000, 500000, 4000000]);
  const f = pick([10, 20, 25, 50]), n = rnd(2, 3);
  const s = s0 * (1 + f / 100) ** n;
  return {
    type: "eqn", text: po("txtFoiz", { s: s0.toLocaleString("ru-RU"), f, n }),
    prompt: po("murakkabFoiz"),
    ...sPick(Math.round(s).toLocaleString("ru-RU"), [
      Math.round(s0 * (1 + (f * n) / 100)).toLocaleString("ru-RU"),
      Math.round(s0 + (s0 * f) / 100).toLocaleString("ru-RU"),
      Math.round(s0 * n).toLocaleString("ru-RU"),
    ]),
  };
};

/* ---------- trigonometrik tenglamalar ---------- */

/** Sodda trigonometrik tenglama: sin x = a, cos x = a. */
export const x10TrigTenglama = (): Activity => {
  const holatlar: [string, string][] = [
    ["sin x = 0", "x = πn"],
    ["sin x = 1", "x = π/2 + 2πn"],
    ["cos x = 0", "x = π/2 + πn"],
    ["cos x = 1", "x = 2πn"],
    ["tg x = 0", "x = πn"],
  ];
  const [ifoda, j] = pick(holatlar);
  const boshqa = shuffle([...new Set(holatlar.map((x) => x[1]))]).filter((x) => x !== j).slice(0, 3);
  return { type: "eqn", text: ifoda, prompt: po("trigTenglama"), ...sPick(j, boshqa) };
};

/** Ehtimollikning klassik ta'rifi: kubik va tanga. */
export const x10Ehtimollik = (): Activity => {
  if (Math.random() < 0.5) {
    const k = rnd(1, 5);                 // 1..5 ta qulay hol
    return {
      type: "eqn", text: `Kubik tashlandi. ${k} ta qulay hol bor.   P = ?`,
      prompt: po("hodisaEhtimoli"), ...sPick(fr(k, 6), [fr(6, k), fr(k, 12), dc(k / 6)]),
    };
  }
  const n = rnd(2, 4);
  const jami = 2 ** n;
  return {
    type: "eqn", text: po("txtTanga", { n, k: n }), prompt: po("hodisaEhtimoli"),
    ...sPick(fr(1, jami), [fr(1, n), fr(n, jami), fr(1, n * 2)]),
  };
};

/* ==================================================================== */
/*              11-SINF: HOSILA, INTEGRAL, EHTIMOLLIK                   */
/* ==================================================================== */

/** Limit — sodda holat: ko'phadning nuqtadagi qiymati. */
export const y11Limit = (): Activity => {
  const a = nz(-4, 4), b = nz(-9, 9), x = nz(-4, 4);
  const s = a * x + b;
  return {
    type: "eqn", text: `lim (${had(a, "x")} ${qosh(b)}),   x → ${iz(x)}`, prompt: po("limit"),
    ...zPick(s, [a + b, a * b, s + x]),
  };
};

/** Darajaning hosilasi: (xⁿ)' = n·xⁿ⁻¹. */
export const y11HosilaDaraja = (): Activity => {
  const a = rnd(2, 8), n = rnd(2, 6);
  const j = had(a * n, "x", n - 1);
  return {
    type: "eqn", text: `y = ${had(a, "x", n)}`, prompt: po("hosila"),
    // Xato: koeffitsiyentni ko'paytirmaslik yoki darajani kamaytirmaslik.
    ...sPick(j, [had(a, "x", n - 1), had(a * n, "x", n), had(n, "x", n - 1)]),
  };
};

/** Ko'phadning hosilasi. */
export const y11HosilaKophad = (): Activity => {
  const a = rnd(2, 6), b = rnd(2, 9), c = nz(-9, 9);
  const j = kophad([2 * a, b]);
  return {
    type: "eqn", text: `y = ${kophad([a, b, c])}`, prompt: po("hosila"),
    // Klassik xato: ozod hadning hosilasini 0 deb olmaslik.
    ...sPick(j, [kophad([2 * a, b, c]), kophad([a, b]), kophad([2 * a, 0])]),
  };
};

/** Asosiy funksiyalarning hosilalari. */
export const y11HosilaJadval = (): Activity => {
  const jadval: [string, string][] = [
    ["sin x", "cos x"], ["cos x", "−sin x"], ["eˣ", "eˣ"],
    ["ln x", "1/x"], ["√x", "1/(2√x)"], ["tg x", "1/cos²x"],
  ];
  const [f, j] = pick(jadval);
  const boshqa = shuffle([...new Set(jadval.map((x) => x[1]))]).filter((x) => x !== j).slice(0, 3);
  return { type: "eqn", text: `y = ${f},   y′ = ?`, prompt: po("hosila"), ...sPick(j, boshqa) };
};

/** Nuqtadagi hosila qiymati. */
export const y11HosilaNuqta = (): Activity => {
  const a = rnd(1, 5), b = nz(-8, 8), x = nz(-4, 4);
  const s = 2 * a * x + b;
  return {
    type: "eqn", text: `y = ${kophad([a, b, 0])},   y′(${iz(x)}) = ?`, prompt: po("hosilaNuqtada"),
    ...zPick(s, [a * x + b, a * x * x + b * x, 2 * a * x]),
  };
};

/** Urinmaning burchak koeffitsiyenti — nuqtadagi hosila. */
export const y11Urinma = (): Activity => {
  const a = rnd(1, 4), x = nz(-4, 5);
  const k = 2 * a * x;
  return {
    type: "eqn", text: `y = ${had(a, "x", 2)},  x₀ = ${iz(x)}.   k = ?`, prompt: po("urinmaBurchak"),
    ...zPick(k, [a * x, a * x * x, k + a]),
  };
};

/** Ekstremum nuqtasi: y' = 0. */
export const y11Ekstremum = (): Activity => {
  const a = pick([1, 2, -1, -2]), x0 = nz(-6, 6);
  const b = -2 * a * x0, c = nz(-9, 9);
  return {
    type: "eqn", text: `y = ${kophad([a, b, c])}`, prompt: po("ekstremum"),
    ...zPick(x0, [-x0, b, c]),
  };
};

/** Funksiya qayerda o'sadi — parabola uchidan chapda yoki o'ngda. */
export const y11Osish = (): Activity => {
  const x0 = nz(-5, 5);
  const a = pick([1, 2]);
  const b = -2 * a * x0;
  const j = `x > ${iz(x0)}`;
  return {
    type: "eqn", text: `y = ${kophad([a, b, 0])}`, prompt: po("osishOraliq"),
    ...sPick(j, [`x < ${iz(x0)}`, "x — ixtiyoriy", `x > ${iz(-x0)}`]),
  };
};

/* ---------- integral ---------- */

/** Boshlang'ich funksiya: (xⁿ)dan → xⁿ⁺¹/(n+1). */
export const y11Boshlangich = (): Activity => {
  const n = rnd(1, 5);
  const j = `x${ust(n + 1)}/${n + 1} + C`;
  return {
    type: "eqn", text: `f(x) = ${xd(n)}`, prompt: po("boshlangichFunksiya"),
    // Xato: darajani oshirmaslik yoki bo'lishni unutish.
    ...sPick(j, [`${xd(n + 1)} + C`, `${n}${xd(n - 1)} + C`, `${xd(n)}/${n} + C`]),
  };
};

/** Integrallar jadvali. */
export const y11IntegralJadval = (): Activity => {
  const jadval: [string, string][] = [
    ["sin x", "−cos x + C"], ["cos x", "sin x + C"], ["eˣ", "eˣ + C"],
    ["1/x", "ln|x| + C"], ["1", "x + C"],
  ];
  const [f, j] = pick(jadval);
  const boshqa = shuffle([...new Set(jadval.map((x) => x[1]))]).filter((x) => x !== j).slice(0, 3);
  return { type: "eqn", text: `∫ ${f} dx = ?`, prompt: po("aniqmasIntegral"), ...sPick(j, boshqa) };
};

/** Aniq integral: ∫ₐᵇ xⁿ dx = (bⁿ⁺¹ − aⁿ⁺¹)/(n+1). */
export const y11AniqIntegral = (): Activity => {
  const n = rnd(1, 3), b = rnd(2, 4);
  const s = b ** (n + 1) / (n + 1);
  if (!Number.isInteger(s)) return y11AniqIntegral();
  return {
    type: "eqn", text: `∫₀${sup(b)} ${xd(n)} dx = ?`, prompt: po("aniqIntegral"),
    ...zPick(s, [b ** n, b ** (n + 1), s * (n + 1)]),
  };
};

/** Egri chiziqli trapetsiya yuzi — aniq integral bilan. */
export const y11Yuza = (): Activity => {
  const b = rnd(2, 5);
  const S = (b * b) / 2;
  return {
    type: "eqn", text: `y = x,  x = 0,  x = ${b},  y = 0.   S = ?`, prompt: po("yuzaIntegral"),
    ...sPick(dc(S), [dc(b * b), dc(b), dc(b / 2)]),
  };
};

/* ---------- ma'lumotlar tahlili va ehtimollik ---------- */

const faktorial = (n: number): number => (n <= 1 ? 1 : n * faktorial(n - 1));
const C = (n: number, k: number) => faktorial(n) / (faktorial(k) * faktorial(n - k));

/** Kombinatsiyalar soni: Cₙᵏ. */
export const y11Kombinatsiya = (): Activity => {
  const n = rnd(4, 8), k = rnd(2, n - 2);
  const s = C(n, k);
  return {
    type: "eqn", text: `C${sub(n)}${sup(k)} = ?`, prompt: po("kombinatsiya"),
    ...zPick(s, [n * k, faktorial(n) / faktorial(n - k), n + k]),
  };
};

/** Nyuton binomi koeffitsiyenti. */
export const y11Binom = (): Activity => {
  const n = rnd(3, 7), k = rnd(1, n - 1);
  const s = C(n, k);
  return {
    type: "eqn", text: `(a + b)${ust(n)} yoyilmasidagi ${k + 1}-had koeffitsiyenti = ?`,
    prompt: po("nyutonBinom"), ...zPick(s, [n * k, n + k, C(n, k - 1)]),
  };
};

/** O'rtacha kvadratik chetlanish — kichik namuna uchun. */
export const y11Chetlanish = (): Activity => {
  const m = rnd(4, 12), d = pick([1, 2, 3]);
  // Namuna ataylab simmetrik: dispersiya butun chiqadi.
  const arr = [m - d, m, m, m + d];
  const orta = m;
  const disp = arr.reduce((s, x) => s + (x - orta) ** 2, 0) / arr.length;
  return {
    type: "eqn", text: arr.join(",  "), prompt: po("ortachaChetlanish"),
    ...sPick(dc(Math.sqrt(disp)), [dc(disp), dc(orta), dc(d)]),
  };
};

/* ------------------------------------------------------------ belgilar */

/**
 * x ning darajasi — birinchi daraja ustki indekssiz yoziladi.
 *
 * `x¹` matematik jihatdan to'g'ri, lekin darslikda hech qachon shunday
 * yozilmaydi va o'quvchi uni ko'rganda savolda xato bor deb o'ylaydi.
 */
const xd = (n: number): string => (n === 0 ? "1" : n === 1 ? "x" : `x${ust(n)}`);

/** Pastki indeks — logarifm asosi va Cₙ uchun. */
const sub = (n: number): string => String(n).split("").map((c) => "₀₁₂₃₄₅₆₇₈₉"[+c]).join("");
/** Ustki indeks — integral chegarasi va Cᵏ uchun. */
const sup = (n: number): string => String(n).split("").map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c]).join("");
