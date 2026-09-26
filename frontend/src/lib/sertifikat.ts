/**
 * MILLIY SERTIFIKAT — matematikadan tayyorgarlik varianti.
 *
 * ─────────────── NEGA DTM DAN ALOHIDA ───────────────
 *
 * DTM varianti (`lib/imtihon.ts`) — 30 ta bir xil test, har biri bir
 * ball. Sertifikat imtihoni boshqacha qurilgan va u bilan DTM
 * shaklida mashq qilgan odam imtihonda ikki narsaga tayyor bo'lmaydi:
 * variantsiz, javobni O'ZI yozadigan savollarga va har savolning
 * ballari har xil ekaniga. Shuning uchun tuzilish Baholash agentligining
 * rasmiy namunasidan (uzbmb.uz, "namunaviy test topshiriqlari")
 * aynan ko'chirilgan:
 *
 *   1–32    Y-1   bitta javobli test        10 tasi 1,3 ball, 22 tasi 2,2
 *   33–35   Y-2   moslashtirish (A–F)       har biri 2,2 ball
 *   36–45   O     ochiq javob, a) va b)     a) 1,5 · b) 1,7 ball
 *
 * Jami 100 ball. Savollarning o'zi — ilovaning generatorlari (7–11
 * sinf), ya'ni rasmiy savollar ko'chirilmaydi: format rasmiy, mazmun
 * bizniki.
 *
 * ─────────────── DARAJA — TAXMINIY ───────────────
 *
 * Haqiqiy imtihonda xom ball Rasch modeli bilan 75 ballik shkalaga
 * o'tkaziladi va daraja o'shandan olinadi. Uni uyda aniq takrorlab
 * bo'lmaydi, shuning uchun bu yerda xom ball shunchaki 75 ga
 * mutanosib o'tkaziladi va ekranda "taxminiy" deb yoziladi. Chegaralar
 * bitta joyda (`DARAJALAR`) — aniqrog'i ma'lum bo'lsa shu yerda
 * o'zgartiriladi.
 */
import type { Answer } from "./activity";
import { imtihonKurslari, manbalar, sinfOf, blokYasa } from "./blok";
import type { BlokSavol, Manba } from "./blok";
import { courseById } from "./curriculum";
import { kunUrugi, urugBilan } from "./oyin/urug";

/** Nechta variant bor — DTM bilan bir xil. */
export const VARIANTLAR = 12;

/**
 * Vaqt — 3 soat. Rasmiy manbalarda 45 topshiriqli matematika uchun
 * shu vaqt ko'rsatilgan.
 */
export const DAQIQA = 180;

/** Bo'limlar o'lchami — rasmiy namunadagidek. */
export const TUZILISH = { y1: 32, y1Yengil: 10, y2: 3, o: 10 } as const;

export const BALL = { y1Yengil: 1.3, y1: 2.2, y2: 2.2, oA: 1.5, oB: 1.7 } as const;

/* ------------------------------------------------------------- savol */

export type SSavol =
  | { tur: "y1"; s: BlokSavol; ball: number }
  | { tur: "y2"; s: BlokSavol; ball: number }
  | { tur: "o"; a: BlokSavol; b: BlokSavol };

export interface SVariant {
  n: number;
  savollar: SSavol[];
  /** Moslashtirish savollarining umumiy javoblari, A–F tartibida. */
  y2: Answer[];
}

/** Berilgan javob. Ochiq savolda ikki qism, qolganida tanlangan qiymat. */
export type SJavob = string | { a: string; b: string } | null;

export const HARFLAR = ["A", "B", "C", "D", "E", "F"];

/* ------------------------------------------------------------- yasash */

/**
 * Javob ochiq savolga yaraydimi: faqat SON. "x = 3", "(2; 5)" kabi
 * javobni odam har xil yozadi va to'g'ri javob xato deb chiqardi —
 * imtihonga tayyorlanayotgan odamga bundan yomoni yo'q.
 */
const SONLI = /^[−-]?\d+([.,]\d+)?$/;

/** Savolni takrorga tekshirish kaliti. */
const kalit = (s: BlokSavol) => `${s.a.prompt}|${"text" in s.a ? s.a.text : ""}|${s.a.answer}`;

function aralash<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/**
 * Bitta bobdan `n` ta SONLI javobli, bir-biridan farqli savol.
 * Yetmasa — `null` (o'sha bob o'tkazib yuboriladi).
 */
function bobdan(guruh: Manba[], n: number, band: Set<string>, javobiFarqli = false): BlokSavol[] | null {
  const r: BlokSavol[] = [];
  const javoblar = new Set<string>();
  for (let k = 0; k < 40 && r.length < n; k++) {
    const m = guruh[k % guruh.length];
    const a = m.gen();
    const s: BlokSavol = { a, kurs: m.kurs, kursId: m.kursId, ui: m.ui, li: m.li, mavzu: m.mavzu };
    if (!SONLI.test(String(a.answer)) || band.has(kalit(s))) continue;
    if (javobiFarqli && javoblar.has(String(a.answer))) continue;
    band.add(kalit(s));
    javoblar.add(String(a.answer));
    r.push(s);
  }
  return r.length === n ? r : null;
}

/**
 * Variant yasaydi. Raqam noto'g'ri bo'lsa — `null`.
 *
 * `urugBilan` ichida: generatorlardagi `Math.random` vaqtincha
 * almashadi va 5-variant har qurilmada, har safar bir xil chiqadi —
 * natijalarni solishtirish shunga tayanadi.
 */
export function variantYasa(n: number): SVariant | null {
  if (!Number.isInteger(n) || n < 1 || n > VARIANTLAR) return null;
  return urugBilan(kunUrugi(`sertifikat-variant-${n}`, 7), () => yasa(n));
}

function yasa(n: number): SVariant | null {
  // Boblar bo'yicha guruhlangan generatorlar.
  const boblar = new Map<string, Manba[]>();
  for (const c of imtihonKurslari()) {
    for (const m of manbalar(c, c.units)) {
      const k = `${m.kursId}|${m.ui}`;
      boblar.set(k, [...(boblar.get(k) ?? []), m]);
    }
  }
  const navbat = aralash([...boblar.values()]).map((g) => aralash(g));
  const band = new Set<string>();

  // O — har savolning a) va b) qismi BITTA bobdan: imtihonda ham ikki
  // qism bitta vaziyat haqida bo'ladi.
  const ochiq: SSavol[] = [];
  let i = 0;
  for (; i < navbat.length && ochiq.length < TUZILISH.o; i++) {
    const juft = bobdan(navbat[i], 2, band);
    if (juft) ochiq.push({ tur: "o", a: juft[0], b: juft[1] });
  }

  // Y-2 — uchala savol bitta bobdan va javoblari har xil: aks holda
  // ikki savolga bitta harf to'g'ri bo'lib, moslashtirish ma'nosini
  // yo'qotardi.
  let y2: BlokSavol[] | null = null;
  for (; i < navbat.length && !y2; i++) y2 = bobdan(navbat[i], TUZILISH.y2, band, true);

  // Y-1 — DTM kabi boblar bo'ylab tekis sochilgan test. Ortig'i bilan
  // so'raladi: yuqorida ishlatilgan savol qaytib tushsa tashlanadi.
  const blok = blokYasa(11, "dtm", { tur: "imtihon" }, { savol: TUZILISH.y1 + 12, daqiqa: DAQIQA });
  const test = (blok?.savollar ?? []).filter((s) => !band.has(kalit(s))).slice(0, TUZILISH.y1);

  if (ochiq.length < TUZILISH.o || !y2 || test.length < TUZILISH.y1) return null;

  // Qaysi test 1,3 ball: eng quyi sinfdan kelgan o'ntasi. Imtihonda
  // ham yengil savol shunday baholanadi.
  const sinf = (s: BlokSavol) => sinfOf(courseById(s.kursId)?.grade ?? 11);
  const yengil = new Set(
    [...test.keys()].sort((x, y) => sinf(test[x]) - sinf(test[y]) || x - y).slice(0, TUZILISH.y1Yengil));

  // Moslashtirish variantlari: uchta to'g'ri + uchta chalg'ituvchi,
  // chalg'ituvchilar o'sha savollarning o'z variantlaridan.
  const togrilar = y2.map((s) => String(s.a.answer));
  const chalg = aralash(y2.flatMap((s) => s.a.choices.map(String)))
    .filter((x, k, arr) => !togrilar.includes(x) && arr.indexOf(x) === k)
    .slice(0, HARFLAR.length - togrilar.length);

  return {
    n,
    savollar: [
      ...test.map((s, k): SSavol => ({ tur: "y1", s, ball: yengil.has(k) ? BALL.y1Yengil : BALL.y1 })),
      ...y2.map((s): SSavol => ({ tur: "y2", s, ball: BALL.y2 })),
      ...ochiq,
    ],
    y2: aralash([...togrilar, ...chalg]),
  };
}

/* ------------------------------------------------------------ baholash */

/**
 * Yozilgan son to'g'rimi.
 *
 * Odam "−3" ni "-3" deb, "2,5" ni "2.5" deb yozadi — ikkalasi ham
 * to'g'ri. Son sifatida solishtiriladi, matn sifatida emas.
 */
export function sonTogrimi(yozildi: string, javob: Answer): boolean {
  const son = (x: string) => Number(x.trim().replace(/\s+/g, "").replace(/[−–—]/g, "-").replace(",", "."));
  const a = son(yozildi);
  const b = son(String(javob));
  return yozildi.trim() !== "" && Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-9;
}

/** Bitta savolning to'plagan balli. */
export function savolBali(S: SSavol, j: SJavob): number {
  if (S.tur === "o") {
    if (!j || typeof j === "string") return 0;
    return (sonTogrimi(j.a, S.a.a.answer) ? BALL.oA : 0) + (sonTogrimi(j.b, S.b.a.answer) ? BALL.oB : 0);
  }
  return typeof j === "string" && j === String(S.s.a.answer) ? S.ball : 0;
}

export const maksBall = (S: SSavol): number => (S.tur === "o" ? BALL.oA + BALL.oB : S.ball);

/** Javob berilganmi (ochiq savolda — hech bo'lmasa bitta qism). */
export const berilgan = (j: SJavob): boolean =>
  typeof j === "string" ? true : Boolean(j && (j.a.trim() || j.b.trim()));

/** Ballni bir xonali o'nli kasrgacha: 67,4. Suzuvchi nuqta xatosi yo'qolsin. */
export const yaxlit = (x: number): number => Math.round(x * 10) / 10;

/**
 * Daraja chegaralari — 75 ballik shkalada (izoh fayl boshida).
 * 46 dan past — sertifikat berilmaydi; bu xom ballning taxminan
 * 60 foiziga to'g'ri keladi, rasmiy "kamida 60%" talabi bilan bir xil.
 */
const DARAJALAR: [number, string][] = [
  [70, "A+"], [65, "A"], [60, "B+"], [55, "B"], [50, "C+"], [46, "C"],
];

/** Taxminiy daraja; sertifikat chiqmasa — `null`. */
export function daraja(ball100: number): string | null {
  const b = (ball100 * 75) / 100;
  return DARAJALAR.find(([chegara]) => b >= chegara)?.[1] ?? null;
}

/* ------------------------------------------------------------ natija */

export interface SNatija {
  variant: number;
  ball: number;
  sekund: number;
  vaqt: number;
}

const KALIT = "azapp_sertifikat_v1";
const CHEK = 40;

export function natijalar(): SNatija[] {
  try {
    const xom = JSON.parse(localStorage.getItem(KALIT) || "[]") as SNatija[];
    return Array.isArray(xom) ? xom.filter((x) => x && typeof x.variant === "number" && typeof x.ball === "number") : [];
  } catch { return []; }
}

export function natijaSaqla(n: SNatija): void {
  try {
    localStorage.setItem(KALIT, JSON.stringify([n, ...natijalar()].slice(0, CHEK)));
  } catch { /* xotira to'lgan — natija faqat ekranda qoladi */ }
}

export function engYaxshi(variant: number): SNatija | null {
  const shu = natijalar().filter((x) => x.variant === variant);
  return shu.length ? shu.reduce((a, b) => (b.ball > a.ball ? b : a)) : null;
}

/** Oxirgi beshta urinishning o'rtacha balli (`lib/imtihon.ts` dagi sabab bilan). */
export function ortacha(): { ball: number; urinish: number } | null {
  const hammasi = natijalar();
  const besh = hammasi.slice(0, 5);
  if (!besh.length) return null;
  return { ball: yaxlit(besh.reduce((a, b) => a + b.ball, 0) / besh.length), urinish: hammasi.length };
}

/* ------------------------------------------------- yarim qolgan variant */

/**
 * YARIM QOLGAN VARIANT.
 *
 * DTM varianti bir soat va u bir o'tirishda ishlanadi. Sertifikat esa
 * UCH SOAT — telefonda bunday uzun ishni hech kim uzilishsiz
 * tugatmaydi: qo'ng'iroq, tanaffus, ilova fonga ketadi. Shuning uchun
 * har javobda saqlanadi.
 *
 * Savollar SAQLANMAYDI, faqat raqami: variant urug' bilan yasaladi va
 * qaytadan aynan o'shanday chiqadi.
 */
export interface SJoriy {
  n: number;
  javoblar: SJavob[];
  idx: number;
  tugash: number;
  boshlandi: number;
}

const JORIY_KALIT = "azapp_sertifikat_joriy_v1";
/** Vaqti tugaganidan keyin ham bir kun kutadi — javoblar natijaga aylansin. */
const JORIY_UMR = 24 * 60 * 60 * 1000;

export function joriyniOqi(): SJoriy | null {
  try {
    const j = JSON.parse(localStorage.getItem(JORIY_KALIT) || "null") as SJoriy | null;
    if (!j || typeof j.n !== "number" || !Array.isArray(j.javoblar)) return null;
    if (typeof j.tugash !== "number" || typeof j.boshlandi !== "number") return null;
    if (Date.now() - j.boshlandi > JORIY_UMR) return null;
    return j;
  } catch { return null; }
}

export function joriyniSaqla(j: SJoriy): void {
  try { localStorage.setItem(JORIY_KALIT, JSON.stringify(j)); } catch { /* tiklanmaydi, xolos */ }
}

export function joriyniOchir(): void {
  try { localStorage.removeItem(JORIY_KALIT); } catch { /* umri baribir bir kun */ }
}
