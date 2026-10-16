/**
 * Chizma → ELEMENTLAR ro'yxati (Reactsiz, `scripts/aiChizma.ts` da sinaladi).
 *
 * Nega alohida model: bitta chizma ikki xil ko'rsatiladi —
 *
 *   * AI suhbatida birdaniga, tayyor rasm bo'lib (`components/AiChizma.tsx`);
 *   * jonli darsda doskadagidek BIRMA-BIR: avval o'qlar, keyin nuqtalar,
 *     oxirida chiziq "qalam" bilan tortiladi (`components/JonliDoska.tsx`).
 *
 * Geometriya (masshtab, yorliq qayerga qo'yilishi) bir joyda hisoblanadi,
 * aks holda ikki ko'rinish bir-biridan farq qilib qolardi. Elementlar
 * tartibi — chizish tartibi: `fon` darhol turadi (katak), `qadamlar`
 * navbat bilan chiziladi.
 */
import type { Chizma, Geometriya, Grafik, Nuqta2, SonOqi } from "./aiChizma";

export type Rang = "ink" | "dim" | "urgu" | "urgu2" | "urgu3" | "urguT";

export type Element =
  /** Siniq chiziq (bir nechta bo'lak bo'lishi mumkin — uzilishli grafik). */
  | { tur: "chiziq"; qismlar: Nuqta2[][]; rang: Rang; qalin: number; shtrix?: boolean; ogirlik: number }
  | { tur: "nuqta"; p: Nuqta2; r: number; rang: Rang; ochiq?: boolean; ogirlik: number }
  | { tur: "matn"; p: Nuqta2; matn: string; rang: Rang; olcham: number; anchor: "start" | "middle" | "end"; qalin?: boolean; ogirlik: number }
  /** Son o'qidagi bo'yalgan oraliq — chapdan o'ngga "bo'yaladi". */
  | { tur: "soha"; x: number; y: number; w: number; h: number; rang: Rang; ogirlik: number };

export interface Model {
  W: number;
  H: number;
  fon: Element[];
  qadamlar: Element[];
  /** Grafik izohi: rang va nomi (pastda, HTML). */
  izoh: { rang: Rang; nom: string }[];
}

export const W = 320;
export const H = 240;
const URGU: Rang[] = ["urgu", "urgu2", "urgu3"];
export const sonYoz = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");

/** Chiroyli qadam: 1, 2, 5 × 10^n — to'r chiziqlari 4–10 ta bo'lsin. */
function qadam(oraliq: number): number {
  const xom = oraliq / 8;
  const p = 10 ** Math.floor(Math.log10(xom));
  return [1, 2, 5, 10].map((k) => k * p).find((q) => q >= xom) ?? p * 10;
}

const yonalish = (a: Nuqta2, b: Nuqta2): Nuqta2 => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy) || 1;
  return [dx / l, dy / l];
};

/** Ikki nuqta orasidagi kesma — chizishda qalam uzunlik bo'yicha yuradi. */
const kesma = (a: Nuqta2, b: Nuqta2): Nuqta2[][] => [[a, b]];

function grafik(c: Grafik): Model {
  const [x0, x1] = c.x;
  const [y0, y1] = c.y;
  const sx = (x: number) => ((x - x0) / (x1 - x0)) * W;
  const sy = (y: number) => H - ((y - y0) / (y1 - y0)) * H;
  const qx = qadam(x1 - x0);
  const qy = qadam(y1 - y0);
  const fon: Element[] = [];
  const qadamlar: Element[] = [];

  const tor: number[] = [];
  for (let v = Math.ceil(x0 / qx) * qx; v <= x1; v += qx) tor.push(v);
  const torY: number[] = [];
  for (let v = Math.ceil(y0 / qy) * qy; v <= y1; v += qy) torY.push(v);
  for (const v of tor) fon.push({ tur: "chiziq", qismlar: kesma([sx(v), 0], [sx(v), H]), rang: "dim", qalin: 0.6, ogirlik: 0 });
  for (const v of torY) fon.push({ tur: "chiziq", qismlar: kesma([0, sy(v)], [W, sy(v)]), rang: "dim", qalin: 0.6, ogirlik: 0 });

  // 1) O'qlar va ularning sonlari.
  const oqX = y0 <= 0 && y1 >= 0 ? sy(0) : null;
  const oqY = x0 <= 0 && x1 >= 0 ? sx(0) : null;
  if (oqX !== null) qadamlar.push({ tur: "chiziq", qismlar: kesma([0, oqX], [W, oqX]), rang: "ink", qalin: 1.4, ogirlik: 1 });
  if (oqY !== null) qadamlar.push({ tur: "chiziq", qismlar: kesma([oqY, H], [oqY, 0]), rang: "ink", qalin: 1.4, ogirlik: 1 });
  if (oqX !== null) {
    for (const v of tor.filter((v) => Math.abs(v) > 1e-9)) {
      qadamlar.push({ tur: "matn", p: [sx(v), Math.min(H - 2, oqX + 12)], matn: sonYoz(v), rang: "dim", olcham: 10, anchor: "middle", ogirlik: 0.06 });
    }
  }
  if (oqY !== null) {
    for (const v of torY.filter((v) => Math.abs(v) > 1e-9)) {
      qadamlar.push({ tur: "matn", p: [Math.max(2, oqY - 4), sy(v) + 3], matn: sonYoz(v), rang: "dim", olcham: 10, anchor: "end", ogirlik: 0.06 });
    }
  }

  // 2) Nuqtalar — bittadan, yorlig'i bilan (Lampo'dagidek: avval nuqtalar, keyin chiziq).
  for (const n of c.nuqtalar) {
    const p: Nuqta2 = [sx(n.x), sy(n.y)];
    if (p[0] < -1 || p[0] > W + 1 || p[1] < -1 || p[1] > H + 1) continue;
    qadamlar.push({ tur: "nuqta", p, r: 4, rang: "ink", ogirlik: 0.5 });
    if (n.nom) {
      const ong = p[0] > W - 60;
      qadamlar.push({ tur: "matn", p: [p[0] + (ong ? -7 : 7), p[1] - 7], matn: n.nom, rang: "ink", olcham: 11.5,
        anchor: ong ? "end" : "start", qalin: true, ogirlik: 0.4 });
    }
  }

  // 3) Funksiyalar — chapdan o'ngga tortiladi. Uzilish (1/x, tan) va oraliqdan
  // juda chiqqan joyda chiziq bo'linadi.
  c.funksiyalar.forEach(({ f }, k) => {
    const qismlar: Nuqta2[][] = [];
    let joriy: Nuqta2[] = [];
    // Chizma maydonidan biroz chiqqan joyda chiziq uziladi — u o'qlar va
    // yozuvlar ustiga chiqib ketmasin (ilgari buni SVG clipPath qilardi,
    // qisman chizishda esa qalam ham maydonda qolishi kerak).
    const chegara = (y1 - y0) * 0.04;
    for (let i = 0; i <= W * 2; i++) {
      const x = x0 + ((x1 - x0) * i) / (W * 2);
      const y = f(x);
      if (!Number.isFinite(y) || y > y1 + chegara || y < y0 - chegara) {
        if (joriy.length > 1) qismlar.push(joriy);
        joriy = [];
        continue;
      }
      joriy.push([sx(x), sy(y)]);
    }
    if (joriy.length > 1) qismlar.push(joriy);
    qadamlar.push({ tur: "chiziq", qismlar, rang: URGU[k] ?? "urgu", qalin: 2.6, ogirlik: 3 });
  });

  return { W, H, fon, qadamlar, izoh: c.funksiyalar.filter((f) => f.nom).map((f, k) => ({ rang: URGU[k] ?? "urgu", nom: f.nom })) };
}

function geometriya(c: Geometriya): Model {
  const qiymatlar = [...Object.values(c.nuqtalar)];
  for (const a of c.aylanalar) {
    qiymatlar.push([a.markaz[0] - a.r, a.markaz[1] - a.r], [a.markaz[0] + a.r, a.markaz[1] + a.r]);
  }
  const xs = qiymatlar.map((p) => p[0]);
  const ys = qiymatlar.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // Bir xil masshtab (shakl cho'zilmasin) va yorliqlar uchun chekka.
  const CHEKKA = 26;
  const k = Math.min((W - 2 * CHEKKA) / Math.max(maxX - minX, 1e-6), (H - 2 * CHEKKA) / Math.max(maxY - minY, 1e-6));
  const ox = (W - (maxX - minX) * k) / 2;
  const oy = (H - (maxY - minY) * k) / 2;
  const P = (p: Nuqta2): Nuqta2 => [ox + (p[0] - minX) * k, H - (oy + (p[1] - minY) * k)];
  const N = (n: string) => P(c.nuqtalar[n]);
  const markaz: Nuqta2 = [ox + ((maxX - minX) * k) / 2, H - (oy + ((maxY - minY) * k) / 2)];
  const qadamlar: Element[] = [];

  // 1) Uchlar — nuqta va nomi.
  for (const n of Object.keys(c.nuqtalar)) {
    const p = N(n);
    const d = yonalish(markaz, p);
    const uz: Nuqta2 = Math.hypot(p[0] - markaz[0], p[1] - markaz[1]) < 1 ? [0, -1] : d;
    qadamlar.push({ tur: "nuqta", p, r: 3.2, rang: "ink", ogirlik: 0.3 });
    qadamlar.push({ tur: "matn", p: [p[0] + uz[0] * 13, p[1] + uz[1] * 13 + 4.5], matn: n, rang: "ink", olcham: 13.5,
      anchor: "middle", qalin: true, ogirlik: 0.15 });
  }
  // 2) Kesmalar — biridan keyin biri, so'ng aylanalar.
  for (const s of c.kesmalar) {
    qadamlar.push({ tur: "chiziq", qismlar: kesma(N(s.a), N(s.b)), rang: "ink", qalin: s.shtrix ? 1.6 : 2.2,
      shtrix: s.shtrix, ogirlik: 1 });
  }
  for (const a of c.aylanalar) {
    const [cx, cy] = P(a.markaz);
    const r = a.r * k;
    const q: Nuqta2[] = [];
    for (let i = 0; i <= 96; i++) q.push([cx + r * Math.cos((i / 96) * 2 * Math.PI), cy - r * Math.sin((i / 96) * 2 * Math.PI)]);
    qadamlar.push({ tur: "chiziq", qismlar: [q], rang: "urgu", qalin: 2, ogirlik: 2 });
  }
  // 3) Burchak belgilari.
  for (const b of c.burchaklar) {
    const u = N(b.uch);
    const v1 = yonalish(u, N(b.a));
    const v2 = yonalish(u, N(b.b));
    if (b.togri) {
      const r = 11;
      const p1: Nuqta2 = [u[0] + v1[0] * r, u[1] + v1[1] * r];
      const p3: Nuqta2 = [u[0] + v2[0] * r, u[1] + v2[1] * r];
      const p2: Nuqta2 = [p1[0] + v2[0] * r, p1[1] + v2[1] * r];
      qadamlar.push({ tur: "chiziq", qismlar: [[p1, p2, p3]], rang: "urgu", qalin: 1.6, ogirlik: 0.4 });
      continue;
    }
    const r = 20;
    // Kichik yoy: v1 dan v2 ga qisqa tomon bo'ylab.
    const a1 = Math.atan2(v1[1], v1[0]);
    let da = Math.atan2(v2[1], v2[0]) - a1;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    const yoy: Nuqta2[] = [];
    for (let i = 0; i <= 24; i++) yoy.push([u[0] + r * Math.cos(a1 + (da * i) / 24), u[1] + r * Math.sin(a1 + (da * i) / 24)]);
    qadamlar.push({ tur: "chiziq", qismlar: [yoy], rang: "urgu", qalin: 1.8, ogirlik: 0.5 });
    if (b.matn) {
      const ort = yonalish([0, 0], [v1[0] + v2[0], v1[1] + v2[1]]);
      qadamlar.push({ tur: "matn", p: [u[0] + ort[0] * (r + 11), u[1] + ort[1] * (r + 11) + 4], matn: b.matn,
        rang: "urguT", olcham: 12, anchor: "middle", qalin: true, ogirlik: 0.3 });
    }
  }
  // 4) Uzunlik yorliqlari — kesmaning shakl markazidan UZOQ tomonida.
  for (const y of c.yorliqlar) {
    const a = N(y.a);
    const b = N(y.b);
    const o: Nuqta2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let n = yonalish([0, 0], [-(b[1] - a[1]), b[0] - a[0]]);
    if ((o[0] - markaz[0]) * n[0] + (o[1] - markaz[1]) * n[1] < 0) n = [-n[0], -n[1]];
    qadamlar.push({ tur: "matn", p: [o[0] + n[0] * 13, o[1] + n[1] * 13 + 4], matn: y.matn, rang: "urguT", olcham: 12.5,
      anchor: "middle", qalin: true, ogirlik: 0.3 });
  }
  return { W, H, fon: [], qadamlar, izoh: [] };
}

function sonOqi(c: SonOqi): Model {
  const qiymatlar = [
    ...c.oraliqlar.flatMap((o) => [o.dan, o.gacha]).filter((v): v is number => v !== null),
    ...c.nuqtalar.map((n) => n.x),
  ];
  const min = Math.min(...qiymatlar);
  const max = Math.max(...qiymatlar);
  const yon = Math.max((max - min) * 0.35, 1.5);
  const [a, b] = [min - yon, max + yon];
  const HH = 70;
  const Y = 34;
  const sx = (v: number) => 14 + ((v - a) / (b - a)) * (W - 28);
  // Uchning nomi (π/4) berilgan bo'lsa — o'nli son (0,79) o'rniga shu yoziladi.
  const nomlar = new Map<number, string>();
  for (const o of c.oraliqlar) {
    if (o.dan !== null && o.danNom) nomlar.set(o.dan, o.danNom);
    if (o.gacha !== null && o.gachaNom) nomlar.set(o.gacha, o.gachaNom);
  }
  for (const n of c.nuqtalar) if (n.nom) nomlar.set(n.x, n.nom);

  const qadamlar: Element[] = [
    { tur: "chiziq", qismlar: [[[4, Y], [W - 6, Y]]], rang: "ink", qalin: 1.6, ogirlik: 1 },
    { tur: "chiziq", qismlar: [[[W - 12, Y - 5], [W - 4, Y], [W - 12, Y + 5]]], rang: "ink", qalin: 1.6, ogirlik: 0.2 },
  ];
  // Faqat model aytgan sonlar yoziladi — to'liq shkala son o'qini chalkashtirardi.
  for (const v of [...new Set(qiymatlar)]) {
    qadamlar.push({ tur: "matn", p: [sx(v), Y + 26], matn: nomlar.get(v) ?? sonYoz(v), rang: "ink", olcham: 12.5,
      anchor: "middle", qalin: true, ogirlik: 0.25 });
  }
  for (const o of c.oraliqlar) {
    const x1 = o.dan === null ? 4 : sx(o.dan);
    const x2 = o.gacha === null ? W - 8 : sx(o.gacha);
    qadamlar.push({ tur: "soha", x: x1, y: Y - 9, w: Math.max(0, x2 - x1), h: 18, rang: "urgu", ogirlik: 1 });
    qadamlar.push({ tur: "chiziq", qismlar: [[[x1, Y], [x2, Y]]], rang: "urgu", qalin: 4, ogirlik: 0.6 });
    if (o.dan !== null) qadamlar.push({ tur: "nuqta", p: [sx(o.dan), Y], r: 5.5, rang: "urgu", ochiq: !o.danYopiq, ogirlik: 0.3 });
    if (o.gacha !== null) qadamlar.push({ tur: "nuqta", p: [sx(o.gacha), Y], r: 5.5, rang: "urgu", ochiq: !o.gachaYopiq, ogirlik: 0.3 });
  }
  for (const n of c.nuqtalar) qadamlar.push({ tur: "nuqta", p: [sx(n.x), Y], r: 5.5, rang: "urgu", ochiq: !n.yopiq, ogirlik: 0.3 });
  return { W, H: HH, fon: [], qadamlar, izoh: [] };
}

/** Chizma modeli. Reja — modelsiz (HTML ro'yxat), `null`. */
export function model(c: Chizma): Model | null {
  return c.tur === "grafik" ? grafik(c) : c.tur === "geometriya" ? geometriya(c) : c.tur === "sonOqi" ? sonOqi(c) : null;
}

/* ==================== qisman chizish ==================== */

const uzunlik = (q: Nuqta2[]) => q.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - q[i - 1]![0], p[1] - q[i - 1]![1]) : 0), 0);

/**
 * Chiziqning `f` (0..1) qismi va qalamning shu paytdagi joyi. Bo'laklar
 * ketma-ket chiziladi; uzunlik bo'yicha — qalam tekis tezlikda yuradi.
 */
export function qisman(qismlar: Nuqta2[][], f: number): { qismlar: Nuqta2[][]; qalam: Nuqta2 | null } {
  if (f >= 1) {
    const oxirgi = qismlar[qismlar.length - 1];
    return { qismlar, qalam: oxirgi ? oxirgi[oxirgi.length - 1]! : null };
  }
  const jami = qismlar.reduce((s, q) => s + uzunlik(q), 0);
  let qoldi = jami * Math.max(0, f);
  const natija: Nuqta2[][] = [];
  for (const q of qismlar) {
    const l = uzunlik(q);
    if (qoldi >= l) { natija.push(q); qoldi -= l; continue; }
    const yangi: Nuqta2[] = [q[0]!];
    for (let i = 1; i < q.length; i++) {
      // Qalam aynan burchakda to'xtagan — keyingi kesmadan nol uzunlikli bo'lak qo'shilmasin.
      if (qoldi <= 1e-9) break;
      const a = q[i - 1]!;
      const b = q[i]!;
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (qoldi >= d) { yangi.push(b); qoldi -= d; continue; }
      const t = d ? qoldi / d : 0;
      yangi.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      break;
    }
    natija.push(yangi);
    return { qismlar: natija, qalam: yangi[yangi.length - 1]! };
  }
  const oxirgi = natija[natija.length - 1];
  return { qismlar: natija, qalam: oxirgi ? oxirgi[oxirgi.length - 1]! : null };
}

/** Elementlar vaqt jadvali: har biri umumiy 0..1 ning qaysi bo'lagida chiziladi. */
export function jadval(qadamlar: Element[]): { dan: number; gacha: number }[] {
  const jami = qadamlar.reduce((s, e) => s + e.ogirlik, 0) || 1;
  let t = 0;
  return qadamlar.map((e) => {
    const dan = t;
    t += e.ogirlik / jami;
    return { dan, gacha: t };
  });
}
