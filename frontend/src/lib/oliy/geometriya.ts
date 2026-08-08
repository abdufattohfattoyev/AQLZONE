/**
 * 7–9-sinf geometriya savollari.
 *
 * Manba:
 *   "Geometriya 7" — planimetriya asoslari, burchak, uchburchak, parallellik
 *   A. A. Rahimqoriyev, M. A. Toxtaxodjayeva, "Geometriya 8" — to'rtburchaklar,
 *     Pifagor, trigonometriya, koordinata va vektorlar, yuz, aylana
 *   "Geometriya 9" — o'xshashlik, sinuslar/kosinuslar teoremasi, aylana uzunligi
 *
 * ─────────────── CHIZMASIZ GEOMETRIYA NEGA ISHLAYDI ───────────────
 *
 * Ilovada geometrik chizma chizadigan komponent yo'q va bu bo'lim uni
 * TALAB QILMAYDI. Sabab: 7-sinfdan boshlab geometriya masalasi deyarli
 * har doim SON bilan beriladi — "∠A = 40°, ∠B = 60°, ∠C = ?", "katetlar
 * 6 va 8, gipotenuza = ?". Chizma bunday masalada tushuntiruvchi, lekin
 * shart emas: shartning o'zi to'liq.
 *
 * Chizma SHART bo'lgan mavzular (yasashga doir masalalar, kesim yasash)
 * ataylab olinmagan — ular o'rniga o'sha bobning MANTIQIY savoli
 * beriladi: "qaysi tenglik alomati qo'llanadi", "bunday uchburchak
 * yasash mumkinmi". Bilim o'sha yerda, chizma esa daftarda qoladi.
 */
import type { Activity } from "../activity";
import { po } from "../tarjima/oliy";
import {
  PIFAGOR, dc, dPick, fr, iz, pick, rnd, sPick, shuffle, zPick,
} from "./asos";

const PI = 3.14;

/* ==================================================================== */
/*                        7-SINF GEOMETRIYA                             */
/* ==================================================================== */

/* ---------- I bob. Boshlang'ich geometrik ma'lumotlar ---------- */

/** 5-§. Kesma uzunligi: AC = AB + BC (B nuqta AC ichida). */
export const g7Kesma = (): Activity => {
  const a = rnd(3, 25), b = rnd(3, 25);
  if (Math.random() < 0.5) {
    return {
      type: "eqn", text: `AB = ${a},  BC = ${b}.   AC = ?`, prompt: po("kesmaUzunlik"),
      ...zPick(a + b, [Math.abs(a - b), a * b, a]),
    };
  }
  const c = a + b;
  return {
    type: "eqn", text: `AC = ${c},  AB = ${a}.   BC = ?`, prompt: po("kesmaUzunlik"),
    ...zPick(b, [c + a, c, a]),
  };
};

/** 7-§. Aylana: radius va diametr bog'lanishi. */
export const g7Aylana = (): Activity => {
  const r = rnd(2, 30);
  if (Math.random() < 0.5) {
    return { type: "eqn", text: `r = ${r}.   d = ?`, prompt: po("kesmaUzunlik"), ...zPick(2 * r, [r / 2, r, r * r]) };
  }
  const d = 2 * r;
  return { type: "eqn", text: `d = ${d}.   r = ?`, prompt: po("kesmaUzunlik"), ...zPick(r, [d * 2, d, d + 2]) };
};

/* ---------- II bob. Burchak ---------- */

/** 13-§. Burchak turi: o'tkir, to'g'ri, o'tmas, yoyiq. */
export const g7BurchakTuri = (): Activity => {
  const t = rnd(0, 3);
  const b = t === 0 ? rnd(5, 89) : t === 1 ? 90 : t === 2 ? rnd(91, 179) : 180;
  const j = [po("jOtkir"), po("jTogri90"), po("jOtmas"), po("jYoyiq")][t];
  return {
    type: "eqn", text: `∠A = ${b}°`, prompt: po("burchakTuri"),
    answer: j, choices: shuffle([po("jOtkir"), po("jTogri90"), po("jOtmas"), po("jYoyiq")]),
  };
};

/** 13-§. Bissektrisa burchakni teng ikkiga bo'ladi. */
export const g7Bissektrisa = (): Activity => {
  const yarim = rnd(10, 80), b = yarim * 2;
  return {
    type: "eqn", text: `∠AOB = ${b}°,  OM — bissektrisa.   ∠AOM = ?`, prompt: po("burchakHisobla"),
    ...zPick(yarim, [b, 180 - b, 90 - yarim]),
  };
};

/** 14-§. Qo'shni burchaklar yig'indisi 180°. */
export const g7Qoshni = (): Activity => {
  const a = rnd(15, 165);
  return {
    type: "eqn", text: `∠1 = ${a}°.   ∠2 = ?`, prompt: po("qoshniBurchak"),
    // Xato: 90° gacha to'ldirish (to'ldiruvchi burchak bilan chalkashtirish).
    ...zPick(180 - a, [90 - a > 0 ? 90 - a : a, a, 360 - a]),
  };
};

/** 14-§. Vertikal burchaklar teng. */
export const g7Vertikal = (): Activity => {
  const a = rnd(20, 160);
  return {
    // Prompt "burchakni toping": savol son so'rayapti. `vertikalBurchak`
    // ("nima to'g'ri?") bu yerga to'g'ri kelmaydi — u nazariy savolniki.
    type: "eqn", text: `∠1 = ${a}°,  ∠3 — unga vertikal.   ∠3 = ?`, prompt: po("burchakHisobla"),
    ...zPick(a, [180 - a, 90 - a > 0 ? 90 - a : 2 * a, 360 - a]),
  };
};

/* ---------- III bob. Ko'pburchaklar va uchburchaklar ---------- */

/** 22-§. Uchburchak turi tomonlariga ko'ra. */
export const g7UchburchakTuri = (): Activity => {
  const nomlar = [po("jTengTomonli"), po("jTengYonli"), po("jTurliTomonli")];
  const k = rnd(0, 2), a = rnd(5, 15);
  const tomon = k === 0 ? [a, a, a] : k === 1 ? [a, a, Math.max(2, a - rnd(1, 3))] : [a, a + 2, a + 5];
  return {
    type: "eqn", text: po("txtTomonlar", { a: tomon[0], b: tomon[1], c: tomon[2] }),
    prompt: po("uchburchakTuri2"),
    answer: nomlar[k], choices: shuffle([...nomlar]),
  };
};

/** 24–27-§. Qaysi tenglik alomati qo'llanadi. */
export const g7Alomat = (): Activity => {
  const holat = pick([
    { berilgan: "AB = A₁B₁,  ∠A = ∠A₁,  AC = A₁C₁", j: po("jTBT") },
    { berilgan: "∠A = ∠A₁,  AB = A₁B₁,  ∠B = ∠B₁", j: po("jBTB") },
    { berilgan: "AB = A₁B₁,  BC = B₁C₁,  AC = A₁C₁", j: po("jTTT") },
  ]);
  return {
    type: "eqn", text: holat.berilgan, prompt: po("tenglikAlomati"),
    answer: holat.j, choices: shuffle([po("jTBT"), po("jBTB"), po("jTTT")]),
  };
};

/** 25-§. Teng yonli uchburchakning asosidagi burchaklari teng. */
export const g7TengYonli = (): Activity => {
  if (Math.random() < 0.5) {
    const uch = rnd(20, 140), asos = (180 - uch) / 2;
    if (!Number.isInteger(asos)) return g7TengYonli();
    return {
      type: "eqn", text: `Teng yonli:  ∠A = ${uch}° (uchidagi).   Asosidagi burchak = ?`,
      prompt: po("burchakHisobla"), ...zPick(asos, [180 - uch, uch, 90 - uch > 0 ? 90 - uch : asos + 10]),
    };
  }
  const asos = rnd(20, 80), uch = 180 - 2 * asos;
  return {
    type: "eqn", text: `Teng yonli:  asosidagi burchak = ${asos}°.   Uchidagi burchak = ?`,
    prompt: po("burchakHisobla"), ...zPick(uch, [asos, 180 - asos, 2 * asos]),
  };
};

/* ---------- IV bob. Parallel to'g'ri chiziqlar ---------- */

/** 37-§. Parallel to'g'ri chiziqlar va kesuvchi. */
export const g7Parallel = (): Activity => {
  const a = rnd(25, 155);
  const tur = rnd(0, 1);
  // Ichki almashinuvchi burchaklar TENG, ichki bir tomonli burchaklar
  // yig'indisi 180° — ikkalasi bir-biriga eng ko'p chalkashtiriladi.
  const j = tur === 0 ? a : 180 - a;
  const nom = tur === 0 ? "ichki almashinuvchi" : "ichki bir tomonli";
  return {
    type: "eqn", text: `a ∥ b,  ∠1 = ${a}°.  ∠2 — ${nom}.   ∠2 = ?`,
    prompt: po("parallelBurchak"), ...zPick(j, [tur === 0 ? 180 - a : a, 90, 360 - a]),
  };
};

/* ---------- V bob. Uchburchak tomonlari va burchaklari ---------- */

/** 41-§. Uchburchak ichki burchaklari yig'indisi 180°. */
export const g7UchinchiBurchak = (): Activity => {
  const a = rnd(20, 100), b = rnd(20, 175 - a);
  const c = 180 - a - b;
  return {
    type: "eqn", text: po("txtUchburchakABC", { a, b }), prompt: po("uchburchakBurchak3"),
    ...zPick(c, [180 - a, a + b, 90 - a > 0 ? 90 - a : c + 15]),
  };
};

/** 42-§. Tashqi burchak = qo'shni bo'lmagan ikki ichki burchak yig'indisi. */
export const g7Tashqi = (): Activity => {
  const a = rnd(25, 80), b = rnd(25, 80);
  return {
    type: "eqn", text: `∠A = ${a}°,  ∠B = ${b}°.   C uchidagi tashqi burchak = ?`,
    prompt: po("tashqiBurchak"), ...zPick(a + b, [180 - a - b, 180 - a, a]),
  };
};

/** 44-§. To'g'ri burchakli uchburchakda o'tkir burchaklar yig'indisi 90°. */
export const g7TogriBurchakli = (): Activity => {
  const a = rnd(10, 80), b = 90 - a;
  return {
    type: "eqn", text: `∠C = 90°,  ∠A = ${a}°.   ∠B = ?`, prompt: po("burchakHisobla"),
    ...zPick(b, [180 - a, a, 90 + a]),
  };
};

/** 49-§. Uchburchak tengsizligi — bunday uchburchak bormi. */
export const g7Tengsizlik = (): Activity => {
  const bor = Math.random() < 0.5;
  let a: number, b: number, c: number;
  if (bor) {
    a = rnd(4, 15); b = rnd(4, 15); c = rnd(Math.abs(a - b) + 1, a + b - 1);
  } else {
    a = rnd(2, 6); b = rnd(2, 6); c = a + b + rnd(1, 5);
  }
  return {
    type: "eqn", text: po("txtTomonlar", { a, b, c }), prompt: po("uchburchakTengsizlik"),
    answer: bor ? po("jMumkin") : po("jMumkinEmas"),
    choices: shuffle([po("jMumkin"), po("jMumkinEmas")]),
  };
};

/** 21-§. Ko'pburchak ichki burchaklari yig'indisi: (n−2)·180°. */
export const g7Kopburchak = (): Activity => {
  const n = rnd(3, 12), s = (n - 2) * 180;
  return {
    type: "eqn", text: `n = ${n}`, prompt: po("kopburchakBurchak"),
    ...zPick(s, [n * 180, (n - 1) * 180, 360]),
  };
};

/* ==================================================================== */
/*                        8-SINF GEOMETRIYA                             */
/* ==================================================================== */

/* ---------- I bob. To'rtburchaklar ---------- */

/** 2-§. Parallelogrammning qarama-qarshi burchaklari teng, qo'shnilari 180°. */
export const g8Parallelogramm = (): Activity => {
  const a = rnd(30, 150);
  if (Math.random() < 0.5) {
    return {
      type: "eqn", text: `Parallelogramm,  ∠A = ${a}°.   ∠C = ?`, prompt: po("parallelogrammBurchak"),
      ...zPick(a, [180 - a, 90, 360 - a]),
    };
  }
  return {
    type: "eqn", text: `Parallelogramm,  ∠A = ${a}°.   ∠B = ?`, prompt: po("parallelogrammBurchak"),
    ...zPick(180 - a, [a, 90, 360 - a]),
  };
};

/** 2-§. Parallelogramm perimetri: P = 2(a + b). */
export const g8ParallelogrammP = (): Activity => {
  const a = rnd(3, 25), b = rnd(3, 25);
  return {
    type: "eqn", text: `a = ${a},  b = ${b}`, prompt: po("parallelogrammPerim"),
    ...zPick(2 * (a + b), [a + b, a * b, 4 * a]),
  };
};

/** 5–6-§. Romb yuzi: S = d₁d₂/2. */
export const g8Romb = (): Activity => {
  const d1 = rnd(2, 20) * 2, d2 = rnd(2, 20);
  const S = (d1 * d2) / 2;
  return {
    type: "eqn", text: `d₁ = ${d1},  d₂ = ${d2}`, prompt: po("rombYuza"),
    ...zPick(S, [d1 * d2, d1 + d2, S / 2]),
  };
};

/** 7–8-§. Trapetsiya yuzi: S = (a + b)h/2. */
export const g8Trapetsiya = (): Activity => {
  const a = rnd(3, 20), b = rnd(3, 20), h = rnd(2, 16);
  // Yuza butun chiqsin.
  const asoslar = (a + b) % 2 === 0 ? [a, b] : [a, b + 1];
  const S = ((asoslar[0] + asoslar[1]) * h) / 2;
  return {
    type: "eqn", text: `a = ${asoslar[0]},  b = ${asoslar[1]},  h = ${h}`, prompt: po("trapetsiyaYuza"),
    ...zPick(S, [(asoslar[0] + asoslar[1]) * h, asoslar[0] * h, S + h]),
  };
};

/** 10–11-§. Trapetsiya o'rta chizig'i: m = (a + b)/2. */
export const g8OrtaChiziq = (): Activity => {
  const a = rnd(3, 25), b = a % 2 === 0 ? rnd(2, 12) * 2 : rnd(2, 12) * 2 + 1;
  const m = (a + b) / 2;
  return {
    type: "eqn", text: `a = ${a},  b = ${b}`, prompt: po("ortaChiziq"),
    ...zPick(m, [a + b, Math.abs(a - b), m * 2]),
  };
};

/* ---------- II bob. To'g'ri burchakli uchburchak ---------- */

/** 17-§. Pifagor teoremasi — gipotenuza yoki katet. */
export const g8Pifagor = (): Activity => {
  const [a, b, c] = pick(PIFAGOR);
  if (Math.random() < 0.5) {
    return {
      type: "eqn", text: po("txtKatetlar", { a, b }), prompt: po("pifagor"),
      // Xato: kvadratsiz qo'shish — eng ko'p uchraydigani.
      ...zPick(c, [a + b, c + 1, Math.abs(a - b)]),
    };
  }
  return {
    type: "eqn", text: po("txtGipotenuza", { c, a }), prompt: po("pifagor"),
    ...zPick(b, [c - a, c + a, b + 1]),
  };
};

/** 15-§. O'tkir burchakning sinus, kosinus, tangensi — Pifagor uchligida. */
export const g8TrigNisbat = (): Activity => {
  const [a, b, c] = pick(PIFAGOR);
  const f = pick(["sin", "cos", "tg"]);
  const j = f === "sin" ? fr(a, c) : f === "cos" ? fr(b, c) : fr(a, b);
  const boshqa = [fr(a, c), fr(b, c), fr(a, b), fr(b, a)].filter((x) => x !== j);
  return {
    type: "eqn", text: `Katetlar ${a} va ${b},  gipotenuza ${c}.   ${f} α = ?   (α — ${a} katet qarshisidagi)`,
    prompt: po("trigNisbat"), ...sPick(j, boshqa),
  };
};

/** 23-§. 30°, 45°, 60° burchaklarning trigonometrik qiymatlari. */
export const g8TrigJadval = (): Activity => {
  const jadval: [string, string][] = [
    ["sin 30°", "1/2"], ["cos 60°", "1/2"], ["sin 45°", "√2/2"], ["cos 45°", "√2/2"],
    ["sin 60°", "√3/2"], ["cos 30°", "√3/2"], ["tg 45°", "1"], ["tg 30°", "√3/3"], ["tg 60°", "√3"],
  ];
  const [ifoda, j] = pick(jadval);
  const boshqa = shuffle([...new Set(jadval.map((x) => x[1]))]).filter((x) => x !== j).slice(0, 3);
  return { type: "eqn", text: `${ifoda} = ?`, prompt: po("trigQiymat"), ...sPick(j, boshqa) };
};

/* ---------- III bob. Koordinatalar usuli. Vektorlar ---------- */

/** 31-§. Kesma o'rtasining koordinatalari. */
export const g8OrtaNuqta = (): Activity => {
  const x1 = rnd(-10, 10) * 2, y1 = rnd(-10, 10) * 2;
  const x2 = rnd(-10, 10) * 2, y2 = rnd(-10, 10) * 2;
  const j = `(${iz((x1 + x2) / 2)}; ${iz((y1 + y2) / 2)})`;
  return {
    type: "eqn", text: po("txtNuqtalar", { x1: iz(x1), y1: iz(y1), x2: iz(x2), y2: iz(y2) }),
    prompt: po("ortaNuqta"),
    ...sPick(j, [`(${iz(x1 + x2)}; ${iz(y1 + y2)})`, `(${iz((x2 - x1) / 2)}; ${iz((y2 - y1) / 2)})`, `(${iz(x1)}; ${iz(y2)})`]),
  };
};

/** 32–33-§. Ikki nuqta orasidagi masofa. */
export const g8Masofa = (): Activity => {
  const [dx, dy, d] = pick(PIFAGOR);
  const x1 = rnd(-8, 8), y1 = rnd(-8, 8);
  const x2 = x1 + dx, y2 = y1 + dy;
  return {
    type: "eqn", text: po("txtNuqtalar", { x1: iz(x1), y1: iz(y1), x2: iz(x2), y2: iz(y2) }),
    prompt: po("masofa2"), ...zPick(d, [dx + dy, d + 1, Math.abs(dx - dy)]),
  };
};

/** 38–39-§. Vektor uzunligi. */
export const g8VektorUzunlik = (): Activity => {
  const [x, y, d] = pick(PIFAGOR);
  const sx = Math.random() < 0.5 ? -x : x;
  return {
    type: "eqn", text: `a⃗(${iz(sx)}; ${y})`, prompt: po("vektorUzunlik"),
    ...zPick(d, [Math.abs(sx) + y, d + 1, Math.abs(Math.abs(sx) - y)]),
  };
};

/** 40-§. Koordinatalari bilan berilgan vektorlarni qo'shish. */
export const g8VektorQosh = (): Activity => {
  const x1 = rnd(-9, 9), y1 = rnd(-9, 9), x2 = rnd(-9, 9), y2 = rnd(-9, 9);
  const j = `(${iz(x1 + x2)}; ${iz(y1 + y2)})`;
  return {
    type: "eqn", text: `${po("txtVektorlar", { x1: iz(x1), y1: iz(y1), x2: iz(x2), y2: iz(y2) })}.   a⃗ + b⃗ = ?`,
    prompt: po("vektorAmal"),
    ...sPick(j, [`(${iz(x1 - x2)}; ${iz(y1 - y2)})`, `(${iz(x1 * x2)}; ${iz(y1 * y2)})`, `(${iz(x1 + y1)}; ${iz(x2 + y2)})`]),
  };
};

/** 41-§. Skalyar ko'paytma. */
export const g8Skalyar = (): Activity => {
  const x1 = rnd(-8, 8), y1 = rnd(-8, 8), x2 = rnd(-8, 8), y2 = rnd(-8, 8);
  const s = x1 * x2 + y1 * y2;
  return {
    type: "eqn", text: `${po("txtVektorlar", { x1: iz(x1), y1: iz(y1), x2: iz(x2), y2: iz(y2) })}.   a⃗ · b⃗ = ?`,
    prompt: po("skalyar"), ...zPick(s, [x1 * x2 - y1 * y2, x1 + x2 + y1 + y2, (x1 + x2) * (y1 + y2)]),
  };
};

/* ---------- IV bob. Yuz ---------- */

/** 46–48-§. To'g'ri to'rtburchak, parallelogramm va uchburchak yuzi. */
export const g8Yuza = (): Activity => {
  const t = rnd(0, 2), a = rnd(3, 20), h = rnd(2, 18);
  if (t === 0) return { type: "eqn", text: `To'g'ri to'rtburchak:  a = ${a},  b = ${h}`, prompt: po("yuzaHisobla"), ...zPick(a * h, [2 * (a + h), a + h, (a * h) / 2]) };
  if (t === 1) return { type: "eqn", text: `Parallelogramm:  a = ${a},  h = ${h}`, prompt: po("yuzaHisobla"), ...zPick(a * h, [2 * (a + h), (a * h) / 2, a + h]) };
  const asos = a % 2 === 0 || h % 2 === 0 ? a : a + 1;
  return { type: "eqn", text: `Uchburchak:  a = ${asos},  h = ${h}`, prompt: po("yuzaHisobla"), ...zPick((asos * h) / 2, [asos * h, asos + h, asos * h * 2]) };
};

/* ---------- V bob. Aylana ---------- */

/** 57-§. Ichki chizilgan burchak markaziy burchakning yarmi. */
export const g8IchkiBurchak = (): Activity => {
  const yoy = rnd(10, 88) * 2;
  return {
    type: "eqn", text: `Yoyning gradus o'lchovi ${yoy}°.   Ichki chizilgan burchak = ?`,
    prompt: po("aylanaBurchak"), ...zPick(yoy / 2, [yoy, 180 - yoy, yoy * 2]),
  };
};

/** 57-§. Diametrga tiralgan ichki burchak — har doim 90°. */
export const g8DiametrBurchak = (): Activity => {
  const a = rnd(20, 70);
  return {
    type: "eqn", text: `AB — diametr,  C — aylanada,  ∠A = ${a}°.   ∠C = ?`,
    prompt: po("aylanaBurchak"), ...zPick(90, [180 - a, a, 90 - a]),
  };
};

/* ==================================================================== */
/*                        9-SINF GEOMETRIYA                             */
/* ==================================================================== */

/* ---------- I bob. O'xshashlik ---------- */

/** 7-§. O'xshashlik koeffitsiyenti. */
export const g9OxshashlikKoef = (): Activity => {
  const k = rnd(2, 5), a = rnd(3, 15);
  return {
    type: "eqn", text: `AB = ${a},  A₁B₁ = ${a * k}`, prompt: po("oxshashlikKoef"),
    ...zPick(k, [a * k, a + k, k * k]),
  };
};

/** 8–10-§. O'xshash uchburchakning noma'lum tomoni. */
export const g9OxshashTomon = (): Activity => {
  const k = rnd(2, 4), a = rnd(3, 12), b = rnd(3, 12);
  return {
    type: "eqn", text: `AB = ${a},  BC = ${b},  A₁B₁ = ${a * k}.   B₁C₁ = ?`,
    prompt: po("oxshashTomon"), ...zPick(b * k, [b + k, b, a * k]),
  };
};

/** 19-§. O'xshash shakllar yuzlari nisbati k². */
export const g9OxshashYuza = (): Activity => {
  const k = rnd(2, 5);
  return {
    type: "eqn", text: `O'xshashlik koeffitsiyenti k = ${k}.   S₁ : S₂ = ?`,
    prompt: po("oxshashYuza"), ...sPick(`${k * k} : 1`, [`${k} : 1`, `1 : ${k * k}`, `${k ** 3} : 1`]),
  };
};

/* ---------- II bob. Uchburchak tomonlari va burchaklari ---------- */

/** 27-§. Uchburchak yuzi: S = ½ab·sin C. */
export const g9YuzaSinus = (): Activity => {
  const a = rnd(4, 20), b = rnd(4, 20), burchak = pick([30, 90, 150]);
  // sin 30° = sin 150° = 1/2, sin 90° = 1 — yuza butun chiqadi.
  const sinus = burchak === 90 ? 1 : 0.5;
  const S = 0.5 * a * b * sinus;
  return {
    type: "eqn", text: `a = ${a},  b = ${b},  ∠C = ${burchak}°`, prompt: po("uchburchakYuzaSin"),
    ...sPick(dc(S), [dc(a * b * sinus), dc(0.5 * a * b), dc(a + b)]),
  };
};

/** 28-§. Sinuslar teoremasi: a/sin A = b/sin B. */
export const g9Sinuslar = (): Activity => {
  const a = rnd(4, 20);
  // 30° va 90° tanlanadi: nisbat 1/2 ga teng va javob butun chiqadi.
  return {
    type: "eqn", text: `a = ${a},  ∠A = 30°,  ∠B = 90°.   b = ?`, prompt: po("sinuslarTeorema"),
    ...zPick(a * 2, [a / 2, a, a * 3]),
  };
};

/** 29-§. Kosinuslar teoremasi: c² = a² + b² − 2ab·cos C. */
export const g9Kosinuslar = (): Activity => {
  const a = rnd(3, 12), b = rnd(3, 12);
  const burchak = pick([60, 90, 120]);
  const cos = burchak === 60 ? 0.5 : burchak === 90 ? 0 : -0.5;
  const c2 = a * a + b * b - 2 * a * b * cos;
  return {
    type: "eqn", text: `a = ${a},  b = ${b},  ∠C = ${burchak}°.   c² = ?`, prompt: po("kosinuslarTeorema"),
    ...zPick(c2, [a * a + b * b, a * a + b * b + 2 * a * b * cos, (a + b) ** 2]),
  };
};

/* ---------- III bob. Aylana uzunligi va doira yuzi ---------- */

/** 38-§. Muntazam n-burchakning ichki burchagi. */
export const g9Muntazam = (): Activity => {
  const n = pick([3, 4, 5, 6, 8, 9, 10, 12]);
  const b = ((n - 2) * 180) / n;
  return {
    type: "eqn", text: `Muntazam ${n}-burchak`, prompt: po("muntazamKopburchak"),
    ...sPick(dc(b), [dc(360 / n), dc((n - 2) * 180), dc(180 - b)]),
  };
};

/** 42-§. Aylana uzunligi: C = 2πr. */
export const g9AylanaUzunlik = (): Activity => {
  const r = rnd(2, 25);
  return {
    type: "eqn", text: po("txtRadiusR", { r }), prompt: po("aylanaUzunlik2"),
    ...dPick(2 * PI * r, [PI * r, PI * r * r, r]),
  };
};

/** 43-§. Yoy uzunligi: l = πrn/180. */
export const g9Yoy = (): Activity => {
  const r = rnd(3, 18), n = pick([30, 45, 60, 90, 120, 180]);
  const l = (PI * r * n) / 180;
  return {
    type: "eqn", text: `r = ${r},  n = ${n}°`, prompt: po("yoyUzunlik"),
    ...dPick(l, [PI * r, (2 * PI * r * n) / 180, r * n]),
  };
};

/** 45-§. Sektor yuzi: S = πr²n/360. */
export const g9Sektor = (): Activity => {
  const r = rnd(3, 16), n = pick([30, 45, 60, 90, 120, 180]);
  const S = (PI * r * r * n) / 360;
  return {
    type: "eqn", text: `r = ${r},  n = ${n}°`, prompt: po("sektorYuza"),
    ...dPick(S, [PI * r * r, (PI * r * n) / 360, r * r]),
  };
};

/* ---------- IV bob. Metrik munosabatlar ---------- */

/** 50-§. To'g'ri burchakli uchburchakdagi proporsional kesmalar: h² = ac·bc. */
export const g9Proporsional = (): Activity => {
  const juft = pick([[1, 4], [2, 8], [3, 12], [4, 9], [2, 18], [5, 20], [4, 25]] as const);
  const [p1, p2] = juft;
  const h = Math.sqrt(p1 * p2);
  if (!Number.isInteger(h)) return g9Proporsional();
  return {
    type: "eqn", text: `Gipotenuzadagi proyeksiyalar: ${p1} va ${p2}.   Balandlik h = ?`,
    prompt: po("proporsionalKesma"), ...zPick(h, [(p1 + p2) / 2, p1 + p2, p1 * p2]),
  };
};
