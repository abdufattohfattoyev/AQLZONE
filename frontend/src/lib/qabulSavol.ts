/**
 * PREZIDENT VA IXTISOSLASHTIRILGAN MAKTABLARGA QABUL — savol yasovchilar.
 *
 * ─────────────────────── MANBA ───────────────────────
 *
 * "2026-2027-o'quv yilida Ixtisoslashtirilgan ta'lim muassasalari
 * agentligi tizimidagi maktablarning 5-sinfiga qabul imtihoni uchun
 * matematika fanidan test spetsifikatsiyasi" (kabinet.piima.uz, 2026):
 *
 *   1–10   Sonlar va amallar       natural sonlar (8) + kasr va qism (2)
 *   11–22  Algebra va funksiyalar  ifoda (6) + nisbat, proporsiya (3) +
 *                                  harakat (3)
 *   23–25  Statistika              diagramma, jadval, kodlash (3)
 *   26–30  Geometriya              kesma, perimetr, yuza, kuboid (5)
 *
 * Kognitiv daraja: bilish 6 ta va oddiy qo'llash 6 ta (1,1 ball),
 * murakkab qo'llash 9 ta va mulohaza 9 ta (2,1 ball) — jami 51 ball.
 * Har topshiriq raqami o'z mavzusiga va darajasiga ega: `TOPSHIRIQLAR`
 * ro'yxati AYNAN spetsifikatsiya tartibida.
 *
 * Prezident maktablarining 1-bosqichi ham 4-sinf dasturi bo'yicha 30 ta
 * matematika testi (ariza.piima.uz), shuning uchun u ham shu ro'yxatdan
 * yig'iladi. 2-bosqich — tanqidiy fikrlash: 16 ta ma'lumot tahlili va
 * 24 ta mantiqiy matematika (`MALUMOT`, `MANTIQ`).
 *
 * ─────────────────────── SIFAT ───────────────────────
 *
 * Har generator:
 *   - javobni SHARTNING O'ZIDAN hisoblaydi (qo'lda yozilgan javob yo'q);
 *   - noto'g'ri variantlarni TIPIK XATOLARDAN yasaydi (amallar tartibini
 *     buzish, "qolganidan" o'rniga "hammasidan" olish, nolni boshga
 *     qo'yish) — tasodifiy son emas, aks holda to'g'ri javob ko'zga
 *     tashlanib qoladi;
 *   - qisqa yechim beradi: xato qilgan bola nimani o'tkazib yuborganini
 *     ko'rsin.
 *
 * `scripts/qabul.ts` har generatorni yuzlab marta ishga tushirib,
 * javob variantlar ichida ekanini, takror yo'qligini va javob yagona
 * ekanini (bo'linish alomatida — faqat bitta son bo'linadi) tekshiradi.
 */
import type { Answer, Qadam, RasmiyQ } from "./activity";
import { til } from "./til";

/* ================================================================ yordamchi */

const L = (uz: string, ru: string): string => (til() === "ru" ? ru : uz);
const tas = (a: number, b: number): number => a + Math.floor(Math.random() * (b - a + 1));
const tanla = <T>(x: readonly T[]): T => x[Math.floor(Math.random() * x.length)]!;

/**
 * Ruscha son + ot: 1 день, 2 дня, 5 дней, 21 день, 12 дней. O'zbekchada
 * bu muammo yo'q ("5 kun"), ruschada esa "32 учеников" darrov ko'zga
 * tashlanadi va savolga bo'lgan ishonchni tushiradi.
 */
function rk(n: number, bir: string, ikki: string, kop: string): string {
  const o = n % 10, y = n % 100;
  const s = o === 1 && y !== 11 ? bir : o >= 2 && o <= 4 && (y < 12 || y > 14) ? ikki : kop;
  return `${n} ${s}`;
}
const yil = (n: number) => rk(n, "год", "года", "лет");
const kunR = (n: number) => rk(n, "день", "дня", "дней");

function aralash<T>(x: T[]): T[] {
  const y = [...x];
  for (let i = y.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [y[i], y[j]] = [y[j]!, y[i]!];
  }
  return y;
}

/**
 * Sonni yozish: 10 000 dan boshlab xonalar bo'sh joy bilan ajratiladi
 * (darslikdagidek), kichigi — ajratilmaydi. Bo'sh joy UZILMAS: tugmada
 * "12" bir qatorda, "345" keyingisida qolmasin.
 */
export function son(n: number): string {
  if (Math.abs(n) < 10000) return String(n);
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Javob variantlari: to'g'ri javob + tipik xatolar (takrorsiz, manfiysiz).
 * Xatolar yetmasa — to'g'ri javobga yaqin sonlar bilan to'ldiriladi.
 */
function sonlar(togri: number, xatolar: number[], qadam = 1): string[] {
  const bor = new Set([togri]);
  const v: number[] = [];
  for (const x of xatolar) {
    if (v.length === 3) break;
    if (!Number.isFinite(x) || x < 0 || !Number.isInteger(x) || bor.has(x)) continue;
    bor.add(x); v.push(x);
  }
  for (let k = 1; v.length < 3 && k < 60; k++) {
    for (const x of [togri + k * qadam, togri - k * qadam]) {
      if (v.length < 3 && x >= 0 && !bor.has(x)) { bor.add(x); v.push(x); }
    }
  }
  return aralash([togri, ...v]).map(son);
}

/** Matnli javob variantlari (kasr, vaqt): takrorsiz, to'g'risi albatta ichida. */
function matnlar(togri: string, xatolar: string[], zaxira: () => string): string[] {
  const bor = new Set([togri]);
  const v: string[] = [];
  for (const x of xatolar) if (v.length < 3 && !bor.has(x)) { bor.add(x); v.push(x); }
  for (let k = 0; v.length < 3 && k < 50; k++) {
    const x = zaxira();
    if (!bor.has(x)) { bor.add(x); v.push(x); }
  }
  return aralash([togri, ...v]);
}

interface Shart {
  /** Nima so'ralyapti — savol kartasida. */
  savol: string;
  /** Masala sharti — sahnada, chap tomonga tekislangan. */
  shart?: string;
  /** Formula yoki ketma-ketlik qatori. */
  formula?: string;
  /** Chizma (SVG matni). */
  rasm?: string;
  javob: Answer;
  variantlar: Answer[];
  yechim?: Qadam[];
}

const Q = (s: Shart): RasmiyQ => ({
  type: "rasmiy", prompt: s.savol, kirish: s.shart, text: s.formula, rasm: s.rasm,
  answer: s.javob, choices: s.variantlar, yechim: s.yechim,
});

/* ---------------------------------------------------------------- chizmalar */
/* Hammasi `currentColor` bilan — qorong'i va yorug' rejimda bir xil o'qiladi
   (`lib/sertRasm.ts` dagi qoida). Yozuvlar faqat sonlar va harflar. */

const CH = 'stroke="currentColor" fill="none" stroke-width="1.8" stroke-linejoin="round"';
const svg = (w: number, h: number, ichi: string) =>
  `<svg viewBox="0 0 ${w} ${h}" role="img" style="width:100%;max-width:${w}px;height:auto;display:block;margin:0 auto" ` +
  `font-family="inherit">${ichi}</svg>`;
const yoz = (x: number, y: number, s: string, z = 13, a = "middle") =>
  `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${z}" fill="currentColor">${s}</text>`;

/** Ustunli diagramma: har ustun ustida qiymati, ostida nomi. */
function diagramma(nomlar: string[], qiymat: number[]): string {
  const w = 300, h = 170, past = 140, max = Math.max(...qiymat);
  const qadam = w / nomlar.length;
  let ichi = `<line x1="8" y1="${past}" x2="${w - 8}" y2="${past}" ${CH}/>`;
  nomlar.forEach((n, i) => {
    const bal = Math.round((qiymat[i]! / max) * 105);
    const x = i * qadam + qadam * 0.22, en = qadam * 0.56;
    ichi += `<rect x="${x.toFixed(1)}" y="${past - bal}" width="${en.toFixed(1)}" height="${bal}" rx="3" ` +
      `fill="currentColor" fill-opacity=".22" stroke="currentColor" stroke-width="1.4"/>`;
    ichi += yoz(x + en / 2, past - bal - 6, String(qiymat[i]), 12);
    ichi += yoz(x + en / 2, past + 18, n, 12);
  });
  return svg(w, h, ichi);
}

/** Jadval: birinchi qator — sarlavha. */
function jadval(qatorlar: string[][]): string {
  const ust = qatorlar[0]!.length, en = 300 / ust, bal = 30, h = bal * qatorlar.length;
  let ichi = `<rect x="1" y="1" width="298" height="${h - 2}" rx="6" ${CH}/>`;
  for (let i = 1; i < qatorlar.length; i++) ichi += `<line x1="1" y1="${i * bal}" x2="299" y2="${i * bal}" stroke="currentColor" stroke-opacity=".45"/>`;
  for (let j = 1; j < ust; j++) ichi += `<line x1="${(j * en).toFixed(1)}" y1="1" x2="${(j * en).toFixed(1)}" y2="${h - 1}" stroke="currentColor" stroke-opacity=".45"/>`;
  qatorlar.forEach((q, i) => q.forEach((s, j) =>
    { ichi += yoz(+(j * en + en / 2).toFixed(1), i * bal + 20, s, i === 0 ? 12 : 13); }));
  return svg(300, h + 2, ichi);
}

/* ================================================================ topshiriqlar */

/** Kognitiv daraja — ball shundan (spetsifikatsiyaning IV bo'limi). */
export type Daraja = "bilish" | "qollash" | "murakkab" | "mulohaza";
export const BALL: Record<Daraja, number> = { bilish: 1.1, qollash: 1.1, murakkab: 2.1, mulohaza: 2.1 };

export interface Topshiriq {
  /** Spetsifikatsiyadagi mazmun sohasi — tahlil shu bo'yicha guruhlanadi. */
  soha: "sonlar" | "kasr" | "ifoda" | "nisbat" | "harakat" | "statistika" | "geometriya" | "malumot" | "mantiq";
  daraja: Daraja;
  /** 4-sinf kursidagi bob (`curriculum/grade4.ts`) — "takrorlash" havolasi. */
  bob: number;
  yasa: () => RasmiyQ;
}

/* ---------------- 1. Sonlar va amallar ---------------- */

/** 1 · bilish — xona va sinflar. */
function xonaBirligi(): RasmiyQ {
  // Raqamlari har xil son: "minglar xonasidagi raqam" savoliga javob yagona bo'lsin.
  const r = aralash([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 6);
  const n = Number(r.join(""));
  const xonalar = [
    { nom: L("yuz minglar", "сотен тысяч"), k: 0 }, { nom: L("o'n minglar", "десятков тысяч"), k: 1 },
    { nom: L("minglar", "тысяч"), k: 2 }, { nom: L("yuzlar", "сотен"), k: 3 }, { nom: L("o'nlar", "десятков"), k: 4 },
  ];
  if (Math.random() < 0.5) {
    const x = tanla(xonalar);
    const javob = r[x.k]!;
    return Q({
      savol: L(`Sonning ${x.nom} xonasidagi raqamni toping.`, `Найдите цифру разряда ${x.nom} в этом числе.`),
      formula: son(n),
      javob: String(javob),
      variantlar: sonlar(javob, [r[x.k + 1]!, r[Math.max(0, x.k - 1)]!, r[5]!, r[0]!]),
      yechim: [{ q: "javob", if: `${son(n)} → ${javob}` }],
    });
  }
  // Sondagi jami yuzlar (yoki minglar) — xona emas, SINF tushunchasi.
  const kop = tanla([{ b: 100, nom: L("yuzlar", "сотен") }, { b: 1000, nom: L("minglar", "тысяч") }]);
  const javob = Math.floor(n / kop.b);
  const xona = Math.floor(n / kop.b) % 10;
  return Q({
    savol: L(`Bu sonda jami nechta ${kop.nom} bor?`, `Сколько всего ${kop.nom} в этом числе?`),
    formula: son(n),
    javob: son(javob),
    variantlar: sonlar(javob, [xona, Math.floor(n / (kop.b * 10)), Math.floor(n / (kop.b / 10)), n % (kop.b * 10)]),
    yechim: [{ q: "hisobla", if: `${son(n)} : ${son(kop.b)} = ${son(javob)} (${L("qoldiq", "ост.")} ${n % kop.b})` }],
  });
}

/** 2 · qo'llash — amallar tartibi. */
function amallarTartibi(): RasmiyQ {
  for (;;) {
    const c = tas(3, 9), q = tas(4, 15), b = c * q, d = tas(2, 6), e = tas(5, 60);
    const a = tas(q * d + 10, q * d + 300);
    const javob = a - q * d + e;
    // Tipik xatolar: chapdan o'ngga ketma-ket; bo'lish va ko'paytirishni almashtirish.
    const ketma = (a - b) / c * d + e;
    const ayirOldin = a - (b / c) * (d + e);
    const korOldin = b % (c * d) === 0 ? a - b / (c * d) + e : -1;
    if (!Number.isInteger(ketma) || ketma <= 0) continue;
    return Q({
      savol: L("Ifodaning qiymatini toping.", "Найдите значение выражения."),
      formula: `${a} − ${b} : ${c} · ${d} + ${e}`,
      javob: son(javob),
      variantlar: sonlar(javob, [ketma, ayirOldin, korOldin, a - q * d - e]),
      yechim: [
        { q: "tartib", if: `${b} : ${c} = ${q};  ${q} · ${d} = ${q * d}` },
        { q: "hisobla", if: `${a} − ${q * d} + ${e} = ${son(javob)}` },
      ],
    });
  }
}

/** 3 · bilish — bo'linish alomatlari: to'rt sondan FAQAT bittasi bo'linadi. */
function bolinishAlomati(): RasmiyQ {
  const k = tanla([3, 4, 9, 25, 6]);
  const bolinadi = (n: number) => n % k === 0;
  const javob = (() => { for (;;) { const n = tas(1000, 9999); if (bolinadi(n)) return n; } })();
  const boshqa = new Set<number>();
  while (boshqa.size < 3) {
    // Chalg'ituvchi o'xshash bo'lsin: 9 da — raqamlar yig'indisi 3 ga
    // bo'linadigan (lekin 9 ga emas), 4 da — juft son.
    const n = tas(1000, 9999);
    if (bolinadi(n) || n === javob) continue;
    if (k === 9 && n % 3 !== 0 && Math.random() < 0.7) continue;
    if ((k === 4 || k === 6) && n % 2 !== 0 && Math.random() < 0.7) continue;
    boshqa.add(n);
  }
  const alomat: Record<number, string> = {
    3: L("raqamlari yig'indisi 3 ga bo'linadi", "сумма цифр делится на 3"),
    9: L("raqamlari yig'indisi 9 ga bo'linadi", "сумма цифр делится на 9"),
    4: L("oxirgi ikki raqamidan tuzilgan son 4 ga bo'linadi", "число из двух последних цифр делится на 4"),
    25: L("oxirgi ikki raqami 00, 25, 50 yoki 75", "две последние цифры 00, 25, 50 или 75"),
    6: L("juft va raqamlari yig'indisi 3 ga bo'linadi", "чётное и сумма цифр делится на 3"),
  };
  return Q({
    savol: L(`Qaysi son ${k} ga qoldiqsiz bo'linadi?`, `Какое число делится на ${k} без остатка?`),
    formula: `□ : ${k}`,
    javob: String(javob),
    variantlar: aralash([javob, ...boshqa]).map(String),
    yechim: [{ q: "tekshir", if: `${javob}: ${alomat[k]}` }],
  });
}

/** 4 · murakkab — raqamlardan eng katta va eng kichik son. */
function raqamlardanSon(): RasmiyQ {
  const r = aralash([0, ...aralash([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4)]);
  const kamay = [...r].sort((a, b) => b - a);
  const katta = Number(kamay.join(""));
  const osish = [...r].sort((a, b) => a - b);
  // Eng kichik: nol boshga qo'yilmaydi — eng kichik NOLDAN FARQLI raqam boshda.
  const bosh = osish.find((x) => x > 0)!;
  const qolgan = [...osish]; qolgan.splice(qolgan.indexOf(bosh), 1);
  const kichik = Number([bosh, ...qolgan].join(""));
  const nolBilan = Number(osish.join(""));          // "0xxxx" — to'rt xonali bo'lib qoladi
  const javob = katta - kichik;
  return Q({
    savol: L("Eng katta va eng kichik sonlar ayirmasini toping.", "Найдите разность наибольшего и наименьшего чисел."),
    shart: L(
      `${r.join(", ")} raqamlarining har biridan bir martadan foydalanib besh xonali sonlar tuzildi.`,
      `Из цифр ${r.join(", ")}, используя каждую по одному разу, составили пятизначные числа.`),
    javob: son(javob),
    variantlar: sonlar(javob, [katta - nolBilan, katta + kichik, javob + 9, javob - 90]),
    yechim: [
      { q: "hisobla", if: `${son(katta)} − ${son(kichik)}` },
      { q: "javob", if: son(javob) },
    ],
  });
}

/** 5 · mulohaza — tengsizlik bilan taqqoslash: nechta natural son? */
function taqqoslash(): RasmiyQ {
  const k = tas(6, 13), a = tas(5, 20) * k + tas(1, k - 1), b = a + tas(5, 12) * k + tas(1, k - 1);
  // a < k·x < b  →  x = ⌈(a+1)/k⌉ … ⌊(b−1)/k⌋
  const kichik = Math.ceil((a + 1) / k), katta = Math.floor((b - 1) / k);
  const javob = katta - kichik + 1;
  return Q({
    savol: L("Tengsizlikni qanoatlantiruvchi nechta natural x son bor?", "Сколько натуральных x удовлетворяют неравенству?"),
    formula: `${a} < ${k} · x < ${b}`,
    javob: String(javob),
    variantlar: sonlar(javob, [javob + 1, javob - 1, javob + 2, Math.floor((b - a) / k)]),
    yechim: [
      { q: "hisobla", if: `x = ${kichik}, …, ${katta}` },
      { q: "javob", if: `${katta} − ${kichik} + 1 = ${javob}` },
    ],
  });
}

/** 6 · murakkab — xarid va qaytim. */
function xarid(): RasmiyQ {
  const n1 = tas(2, 5), n2 = tas(2, 4);
  const p1 = tas(3, 9) * 500, p2 = tas(2, 8) * 1000;
  const jami = n1 * p1 + n2 * p2;
  const berdi = Math.ceil((jami + 1000) / 10000) * 10000 + (Math.random() < 0.5 ? 10000 : 0);
  const javob = berdi - jami;
  const [d, r] = tanla([
    [{ uz: "daftar", ru: "тетрадь", rk: "тетради" }, { uz: "ruchka", ru: "ручка", rk: "ручки" }],
    [{ uz: "non", ru: "лепёшка", rk: "лепёшки" }, { uz: "sut", ru: "пакет молока", rk: "пакета молока" }],
  ] as const);
  return Q({
    savol: L("U necha so'm qaytim oldi?", "Сколько сумов сдачи он получил?"),
    shart: L(
      `Bitta ${d.uz} ${son(p1)} so'm, bitta ${r.uz} ${son(p2)} so'm turadi. Ali ${n1} ta ${d.uz} va ${n2} ta ${r.uz} olib, ${son(berdi)} so'm berdi.`,
      `${d.ru[0]!.toUpperCase()}${d.ru.slice(1)} стоит ${son(p1)} сум, ${r.ru} — ${son(p2)} сум. Али купил ${d.rk} (${n1} шт.) и ${r.rk} (${n2} шт.) и дал ${son(berdi)} сум.`),
    javob: son(javob),
    variantlar: sonlar(javob, [berdi - (p1 + p2), berdi - (n2 * p1 + n1 * p2), berdi - n1 * p1, javob + 1000], 500),
    yechim: [
      { q: "hisobla", if: `${n1} · ${son(p1)} + ${n2} · ${son(p2)} = ${son(jami)}` },
      { q: "javob", if: `${son(berdi)} − ${son(jami)} = ${son(javob)}` },
    ],
  });
}

/** 7 · mulohaza — raqamlar yig'indisi bilan eng kichik / eng katta son. */
function raqamYigindisi(): RasmiyQ {
  const s = tas(11, 24);
  const turli = Math.random() < 0.5;
  const kichikmi = Math.random() < 0.5;
  const mos: number[] = [];
  for (let n = 100; n <= 999; n++) {
    const d = String(n).split("").map(Number);
    if (d[0]! + d[1]! + d[2]! !== s) continue;
    if (turli && new Set(d).size < 3) continue;
    mos.push(n);
  }
  if (mos.length < 4) return raqamYigindisi();
  const javob = kichikmi ? mos[0]! : mos[mos.length - 1]!;
  // Chalg'ituvchilar ham SHU yig'indili sonlar — faqat eng chetdagisi emas.
  const xatolar = kichikmi ? mos.slice(1, 4) : mos.slice(-4, -1);
  const shartT = turli ? L("raqamlari har xil bo'lgan", "с различными цифрами") : "";
  return Q({
    savol: kichikmi
      ? L(`Raqamlari yig'indisi ${s} ga teng, ${shartT} eng kichik uch xonali sonni toping.`,
        `Найдите наименьшее трёхзначное число ${shartT}, сумма цифр которого равна ${s}.`)
      : L(`Raqamlari yig'indisi ${s} ga teng, ${shartT} eng katta uch xonali sonni toping.`,
        `Найдите наибольшее трёхзначное число ${shartT}, сумма цифр которого равна ${s}.`),
    formula: `□ + □ + □ = ${s}`,
    javob: String(javob),
    variantlar: aralash([javob, ...xatolar]).map(String),
    yechim: [{ q: "tekshir", if: `${String(javob).split("").join(" + ")} = ${s}` }],
  });
}

/** 8 · murakkab — qoldiqli bo'lish. */
function qoldiqli(): RasmiyQ {
  const b = tas(6, 12), q = tas(12, 48);
  if (Math.random() < 0.5) {
    const r = tas(1, b - 1), javob = b * q + r;
    return Q({
      savol: L("Bo'linuvchini toping.", "Найдите делимое."),
      shart: L(`Son ${b} ga bo'linganda bo'linma ${q}, qoldiq ${r} chiqdi.`,
        `При делении числа на ${b} получили частное ${q} и остаток ${r}.`),
      javob: String(javob),
      variantlar: sonlar(javob, [b * q, b * q - r, b * (q + r), q * r + b]),
      yechim: [{ q: "formula", if: `${b} · ${q} + ${r} = ${javob}` }],
    });
  }
  // Qoldiq "eng katta" — bo'luvchidan bitta kam. Bola ko'pincha bo'luvchining o'zini oladi.
  const javob = b * q + (b - 1);
  return Q({
    savol: L("Bo'linuvchi eng ko'pi bilan nechaga teng bo'lishi mumkin?", "Каким наибольшим может быть делимое?"),
    shart: L(`Son ${b} ga qoldiqli bo'lindi, bo'linma ${q} ga teng.`, `Число разделили на ${b} с остатком, частное равно ${q}.`),
    javob: String(javob),
    variantlar: sonlar(javob, [b * q + b, b * q, b * q + 1, b * (q + 1) + 1]),
    yechim: [
      { q: "hisobla", if: `${L("eng katta qoldiq", "наибольший остаток")}: ${b} − 1 = ${b - 1}` },
      { q: "formula", if: `${b} · ${q} + ${b - 1} = ${javob}` },
    ],
  });
}

/* ---------------- 1.2 Kasr va qism ---------------- */

/** 9 · qo'llash — bir xil maxrajli kasrlar. Maxraj tub: kasr qisqarmaydi, javob yagona. */
function kasrlar(): RasmiyQ {
  const n = tanla([7, 11, 13, 17]);
  for (;;) {
    const a = tas(2, n - 2), b = tas(1, n - 2), c = tas(1, n - 2);
    const sur = a + b - c;
    if (sur <= 0 || sur >= n || c === a || c === b) continue;
    const k = (x: number, y: number) => `${x}/${y}`;
    return Q({
      savol: L("Amalni bajaring.", "Выполните действие."),
      formula: `${k(a, n)} + ${k(b, n)} − ${k(c, n)}`,
      javob: k(sur, n),
      // Tipik xatolar: maxrajlarni ham qo'shib-ayirish, hammasini qo'shish.
      variantlar: matnlar(k(sur, n), [k(sur, 3 * n), k(sur, n * 2), k(a + b + c, n), k(Math.abs(a - b - c) || 1, n)],
        () => k(tas(1, n - 1), n)),
      yechim: [{ q: "hisobla", if: `(${a} + ${b} − ${c}) / ${n} = ${k(sur, n)}` }],
    });
  }
}

/** 10 · mulohaza — "qolganining" qismi: ikki bosqichli. */
function sonningQismi(): RasmiyQ {
  const m1 = tanla([3, 4, 5]), m2 = tanla([2, 3, 4]), s2 = tas(1, m2 - 1);
  const n = m1 * m2 * tas(4, 12);
  const qoldi1 = n - n / m1;
  const oqidi2 = (qoldi1 / m2) * s2;
  const javob = qoldi1 - oqidi2;
  const hammasidan = n - n / m1 - (n / m2) * s2;    // "qolganining" o'rniga "kitobning"
  return Q({
    savol: L("Necha bet o'qilmay qoldi?", "Сколько страниц осталось прочитать?"),
    shart: L(
      `Kitob ${n} betdan iborat. Birinchi kuni kitobning 1/${m1} qismi, ikkinchi kuni qolgan betlarning ${s2}/${m2} qismi o'qildi.`,
      `В книге ${rk(n, "страница", "страницы", "страниц")}. В первый день прочитали 1/${m1} книги, во второй — ${s2}/${m2} оставшихся страниц.`),
    javob: String(javob),
    variantlar: sonlar(javob, [hammasidan, oqidi2, qoldi1, n / m1 + oqidi2]),
    yechim: [
      { q: "hisobla", if: `${n} − ${n} : ${m1} = ${qoldi1}` },
      { q: "hisobla", if: `${qoldi1} : ${m2} · ${s2} = ${oqidi2}` },
      { q: "javob", if: `${qoldi1} − ${oqidi2} = ${javob}` },
    ],
  });
}

/* ---------------- 2.1 Algebraik ifoda ---------------- */

/** 11 · mulohaza — ikki bosqichli qonuniyat. */
function ketmaKetlik(): RasmiyQ {
  const tur = tas(0, 2);
  // Qatorni QOIDANING O'ZI davom ettiradi: 6 ta had ko'rsatiladi, 7-si — javob.
  // Javob alohida formula bilan hisoblanmaydi — aks holda qoida va javob
  // bir-biridan ajralib ketishi mumkin edi.
  let keyingi: (q: number[], i: number) => number;
  let qoida = "";
  let xatoQoida: ((q: number[]) => number)[];
  if (tur === 0) {
    // Ayirmalar arifmetik o'sadi: +d, +(d+k), +(d+2k), …
    const d = tas(1, 4), k = tas(1, 3);
    keyingi = (q, i) => q[i - 1]! + d + (i - 1) * k;
    qoida = `+${d}, +${d + k}, +${d + 2 * k}, …`;
    xatoQoida = [(q) => q[5]! + (q[5]! - q[4]!), (q) => q[5]! + d, (q) => q[5]! + (q[5]! - q[4]!) + 2 * k];
  } else if (tur === 1) {
    // Navbatma-navbat: +a, ×b
    const a = tas(1, 5), b = tas(2, 3);
    keyingi = (q, i) => (i % 2 === 1 ? q[i - 1]! + a : q[i - 1]! * b);
    qoida = `+${a}, ×${b}, +${a}, ×${b}, …`;
    xatoQoida = [(q) => q[5]! + a, (q) => q[5]! * b + a, (q) => q[5]! + (q[5]! - q[4]!)];
  } else {
    // Har had — oldingi ikkitasining yig'indisi.
    keyingi = (q, i) => (i === 1 ? q[0]! + tas(1, 4) : q[i - 1]! + q[i - 2]!);
    qoida = L("har had — oldingi ikkitasining yig'indisi", "каждый член — сумма двух предыдущих");
    xatoQoida = [(q) => q[5]! + q[3]!, (q) => q[5]! + (q[5]! - q[4]!), (q) => q[5]! * 2];
  }
  const q = [tas(1, 6)];
  for (let i = 1; i <= 6; i++) q.push(keyingi(q, i));
  const javob = q.pop()!;
  const xato = xatoQoida.map((f) => f(q));
  return Q({
    savol: L("Qonuniyatni toping va keyingi sonni yozing.", "Найдите закономерность и следующее число."),
    formula: `${q.join(", ")}, ?`,
    javob: son(javob),
    variantlar: sonlar(javob, xato),
    yechim: [{ q: "formula", if: qoida }, { q: "javob", if: son(javob) }],
  });
}

/** 12 · murakkab — koeffitsiyentli, bir necha amalli tenglama. */
function tenglama(): RasmiyQ {
  const x = tas(3, 40), k = tas(2, 9), a = tas(2, Math.max(2, x - 1)), b = tas(5, 90);
  const shakl = tas(0, 1);
  const chap = shakl === 0 ? `(x − ${a}) · ${k} + ${b}` : `${k} · x − ${a} + ${b}`;
  const ong = shakl === 0 ? (x - a) * k + b : k * x - a + b;
  const xatolar = shakl === 0
    ? [(ong - b) / k - a, (ong + b) / k + a, (ong - b) / k, x + 1]
    : [(ong + a - b) / k + 1, (ong - a - b) / k, (ong + a + b) / k, x - 1];
  return Q({
    savol: L("Tenglamani yeching.", "Решите уравнение."),
    formula: `${chap} = ${ong}`,
    javob: String(x),
    variantlar: sonlar(x, xatolar.filter(Number.isInteger)),
    yechim: shakl === 0
      ? [{ q: "hisobla", if: `(x − ${a}) · ${k} = ${ong - b}` }, { q: "hisobla", if: `x − ${a} = ${(ong - b) / k}` }, { q: "javob", if: `x = ${x}` }]
      : [{ q: "hisobla", if: `${k} · x = ${ong - b + a}` }, { q: "javob", if: `x = ${x}` }],
  });
}

/** 13 · bilish — yaxlitlash. */
function yaxlitlash(): RasmiyQ {
  const n = tas(102345, 989876);
  const x = tanla([{ b: 1000, nom: L("minglar", "тысяч") }, { b: 100, nom: L("yuzlar", "сотен") }, { b: 10000, nom: L("o'n minglar", "десятков тысяч") }]);
  const javob = Math.round(n / x.b) * x.b;
  const past = Math.floor(n / x.b) * x.b, tepa = Math.ceil(n / x.b) * x.b;
  return Q({
    savol: L(`Sonni ${x.nom}gacha yaxlitlang.`, `Округлите число до ${x.nom}.`),
    formula: `${son(n)} ≈ ?`,
    javob: son(javob),
    variantlar: sonlar(javob, [past === javob ? tepa : past, Math.round(n / (x.b * 10)) * x.b * 10, Math.round(n / (x.b / 10)) * (x.b / 10), javob + x.b], x.b),
    yechim: [{ q: "javob", if: `${son(n)} ≈ ${son(javob)}` }],
  });
}

/** 14 · qo'llash — yaxlitlangan qiymatdan asl sonni topish. */
function yaxlitlashMasala(): RasmiyQ {
  const b = tanla([10, 100]), y = tas(12, 98) * b * (b === 10 ? 10 : 1);
  const kichikmi = Math.random() < 0.5;
  const javob = kichikmi ? y - b / 2 : y + b / 2 - 1;
  const nom = b === 10 ? L("o'nlar", "десятков") : L("yuzlar", "сотен");
  return Q({
    savol: kichikmi
      ? L(`${nom}gacha yaxlitlanganda ${son(y)} bo'ladigan eng kichik natural son qaysi?`,
        `Какое наименьшее натуральное число при округлении до ${nom} даёт ${son(y)}?`)
      : L(`${nom}gacha yaxlitlanganda ${son(y)} bo'ladigan eng katta natural son qaysi?`,
        `Какое наибольшее натуральное число при округлении до ${nom} даёт ${son(y)}?`),
    formula: `? ≈ ${son(y)}`,
    javob: son(javob),
    variantlar: sonlar(javob, kichikmi ? [y - b / 2 + 1, y - b / 2 - 1, y - b, y - b + 1] : [y + b / 2, y + b / 2 - 2, y + b - 1, y + b]),
    yechim: [{ q: "tekshir", if: `${son(javob)} ≈ ${son(y)}` }],
  });
}

/** 15 · bilish — o'lchov birliklari. */
function birliklar(): RasmiyQ {
  const t = tas(0, 3);
  const katta = tas(2, 9), kichik = t === 2 ? tas(5, 55) : tas(5, 95);
  const turlar = [
    { k: L("t", "т"), m: L("kg", "кг"), b: 1000 },
    { k: L("km", "км"), m: L("m", "м"), b: 1000 },
    { k: L("soat", "ч"), m: L("daqiqa", "мин"), b: 60 },
    { k: L("m", "м"), m: L("sm", "см"), b: 100 },
  ];
  const u = turlar[t]!;
  const javob = katta * u.b + kichik;
  return Q({
    savol: L(`Necha ${u.m}?`, `Сколько ${u.m}?`),
    formula: `${katta} ${u.k} ${kichik} ${u.m} = ? ${u.m}`,
    javob: son(javob),
    variantlar: sonlar(javob, [Number(`${katta}${kichik}`), katta * u.b * 10 + kichik, katta * 100 + kichik, katta * u.b + kichik * 10]),
    yechim: [{ q: "hisobla", if: `${katta} · ${u.b} + ${kichik} = ${son(javob)}` }],
  });
}

/** 16 · murakkab — yangi kiritilgan amal. */
function kiritilganAmal(): RasmiyQ {
  const p = tas(2, 4), q = tas(1, 3);
  const f = (a: number, b: number) => p * a - q * b;
  for (;;) {
    const a = tas(3, 9), b = tas(1, 6), c = tas(1, 5);
    const ich = f(a, b);
    if (ich <= 0) continue;
    const javob = f(ich, c);
    if (javob <= 0) continue;
    const almash = f(b, a) > 0 ? f(f(b, a), c) : -1;              // a va b o'rni almashgan
    const tashqi = f(a, f(b, c) > 0 ? f(b, c) : 1);                // qavs boshqa joyda
    return Q({
      savol: L("Ifodaning qiymatini toping.", "Найдите значение выражения."),
      shart: L(`a ★ b = ${p}a − ${q === 1 ? "" : q}b deb belgilangan.`, `Обозначено: a ★ b = ${p}a − ${q === 1 ? "" : q}b.`),
      formula: `(${a} ★ ${b}) ★ ${c}`,
      javob: String(javob),
      variantlar: sonlar(javob, [almash, tashqi, ich, p * ich + q * c]),
      yechim: [
        { q: "qoy", if: `${a} ★ ${b} = ${p} · ${a} − ${q} · ${b} = ${ich}` },
        { q: "hisobla", if: `${ich} ★ ${c} = ${p} · ${ich} − ${q} · ${c} = ${javob}` },
      ],
    });
  }
}

/* ---------------- 2.2 Nisbat va proporsiya ---------------- */

/** 17 · murakkab — foiz. */
function foiz(): RasmiyQ {
  const p = tanla([10, 20, 25, 50, 75]);
  if (Math.random() < 0.5) {
    const narx = tas(4, 30) * 4000;
    const chegirma = (narx * p) / 100, javob = narx - chegirma;
    return Q({
      savol: L("Chegirmadan keyingi narxni toping (so'mda).", "Найдите цену со скидкой (в сумах)."),
      shart: L(`Kitobning narxi ${son(narx)} so'm. Do'kon ${p}% chegirma e'lon qildi.`,
        `Книга стоит ${son(narx)} сум. Магазин объявил скидку ${p}%.`),
      javob: son(javob),
      variantlar: sonlar(javob, [chegirma, narx - p * 100, narx + chegirma, narx - p], 1000),
      yechim: [{ q: "hisobla", if: `${son(narx)} · ${p} : 100 = ${son(chegirma)}` }, { q: "javob", if: `${son(narx)} − ${son(chegirma)} = ${son(javob)}` }],
    });
  }
  // Sinfdagi o'quvchilar soni foizga mos: 10% da 10 ga, 25% da 4 ga karrali.
  const qadam = ({ 10: 10, 20: 5, 25: 4, 50: 2, 75: 4 } as Record<number, number>)[p]!;
  const n = qadam * tas(Math.ceil(16 / qadam), Math.floor(40 / qadam)), a = (n * p) / 100;
  const javob = n - a;
  return Q({
    savol: L("A'lochi bo'lmagan o'quvchilar nechta?", "Сколько учеников не отличники?"),
    shart: L(`Sinfda ${n} nafar o'quvchi bor, ularning ${p}% i a'lochi.`, `Учеников в классе — ${n}, из них ${p}% — отличники.`),
    javob: String(javob),
    variantlar: sonlar(javob, [a, n - p, 100 - p, n - a / 2]),
    yechim: [{ q: "hisobla", if: `${n} · ${p} : 100 = ${a}` }, { q: "javob", if: `${n} − ${a} = ${javob}` }],
  });
}

/** 18 · mulohaza — birgalikdagi ish. */
function ishMasalasi(): RasmiyQ {
  if (Math.random() < 0.5) {
    const juft = tanla([[6, 3], [12, 6], [10, 15], [20, 30], [12, 4], [6, 12], [18, 9], [24, 12], [20, 5], [4, 12], [30, 15], [36, 12]] as const);
    const [a, b] = juft;
    const javob = (a * b) / (a + b);
    return Q({
      savol: L("Ikkalasi birga ishlasa, ishni necha kunda tugatadi?", "За сколько дней они выполнят работу вместе?"),
      shart: L(`Birinchi usta ishni ${a} kunda, ikkinchisi ${b} kunda bajaradi.`,
        `Первый мастер выполняет работу за ${kunR(a)}, второй — за ${kunR(b)}.`),
      javob: String(javob),
      variantlar: sonlar(javob, [(a + b) / 2, Math.abs(a - b), a + b, Math.min(a, b) - 1]),
      yechim: [
        { q: "hisobla", if: `1/${a} + 1/${b} = 1/${javob}` },
        { q: "javob", if: `${javob}` },
      ],
    });
  }
  // "3 usta 3 kunda 3 stul" — nostandart: unumdorlik bitta ustaga keltiriladi.
  const u = tas(2, 5), k = tas(2, 5), s = u * tas(1, 3) * 1;
  const u2 = u * tas(2, 3), k2 = k * tas(1, 3);
  const javob = (s / u / k) * u2 * k2;
  if (!Number.isInteger(javob)) return ishMasalasi();
  return Q({
    savol: L(`${u2} ta usta ${k2} kunda nechta stul yasaydi?`, `Сколько стульев сделают ${rk(u2, "мастер", "мастера", "мастеров")} за ${kunR(k2)}?`),
    shart: L(`${u} ta usta ${k} kunda ${s} ta stul yasaydi (hammasi bir xil ishlaydi).`,
      `${rk(u, "мастер", "мастера", "мастеров")} за ${kunR(k)} делают ${rk(s, "стул", "стула", "стульев")} (все работают одинаково).`),
    javob: String(javob),
    variantlar: sonlar(javob, [(s * u2) / u, (s * k2) / k, s + (u2 - u) + (k2 - k), s * u2 * k2]),
    yechim: [{ q: "hisobla", if: `${s} · ${u2}/${u} · ${k2}/${k} = ${javob}` }],
  });
}

/** 19 · qo'llash — vaqt. */
function vaqt(): RasmiyQ {
  const vq = (m: number) => { const x = ((m % 1440) + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };
  if (Math.random() < 0.5) {
    const bosh = tas(16, 23) * 60 + tanla([0, 10, 15, 20, 30, 40, 45, 50]);
    const s = tas(3, 9), d = tanla([5, 15, 25, 35, 45, 55]);
    const javob = vq(bosh + s * 60 + d);
    return Q({
      savol: L("Poyezd soat nechada yetib keldi?", "Во сколько прибыл поезд?"),
      shart: L(`Poyezd ${vq(bosh)} da jo'nab ketdi va yo'lda ${s} soat ${d} daqiqa yurdi.`,
        `Поезд отправился в ${vq(bosh)} и был в пути ${s} ч ${d} мин.`),
      javob,
      variantlar: matnlar(javob, [vq(bosh + s * 60), vq(bosh + s * 60 + d + 60), vq(bosh + s * 60 + d - 60), vq(bosh + d * 60 + s)],
        () => vq(bosh + s * 60 + d + tanla([-30, 30, -10, 10]))),
      yechim: [{ q: "hisobla", if: `${vq(bosh)} + ${s}:${String(d).padStart(2, "0")} = ${javob}` }],
    });
  }
  const bosh = 8 * 60 + tanla([0, 15, 30]), n = tas(3, 5), dars = tanla([40, 45]), tan = tanla([5, 10, 15]);
  const javob = vq(bosh + n * dars + (n - 1) * tan);
  return Q({
    savol: L("Oxirgi dars soat nechada tugaydi?", "Во сколько закончится последний урок?"),
    shart: L(`Darslar ${vq(bosh)} da boshlanadi. ${n} ta dars bor, har biri ${dars} daqiqa, darslar orasida ${tan} daqiqadan tanaffus.`,
      `Уроки начинаются в ${vq(bosh)}. Всего ${n} урока по ${dars} мин, между уроками перемены по ${tan} мин.`),
    javob,
    variantlar: matnlar(javob, [vq(bosh + n * dars), vq(bosh + n * (dars + tan)), vq(bosh + n * dars + (n - 2) * tan)],
      () => vq(bosh + n * dars + (n - 1) * tan + tanla([-5, 5, 15]))),
    yechim: [{ q: "hisobla", if: `${n} · ${dars} + ${n - 1} · ${tan} = ${n * dars + (n - 1) * tan}` }, { q: "javob", if: javob }],
  });
}

/* ---------------- 2.3 Harakat ---------------- */

/** 20 · murakkab — qarama-qarshi harakat. */
function qarshiHarakat(): RasmiyQ {
  const v1 = tas(4, 9) * 10, v2 = tas(3, 8) * 10, t = tas(2, 5);
  const d = (v1 + v2) * t;
  if (Math.random() < 0.5) {
    return Q({
      savol: L("Necha soatdan keyin ular uchrashadi?", "Через сколько часов они встретятся?"),
      shart: L(`Ikki shahar orasidagi masofa ${d} km. Ulardan bir vaqtda bir-biriga qarab ikki avtomobil yo'lga chiqdi: tezliklari ${v1} km/soat va ${v2} km/soat.`,
        `Расстояние между городами ${d} км. Одновременно навстречу друг другу выехали два автомобиля со скоростями ${v1} и ${v2} км/ч.`),
      javob: String(t),
      variantlar: sonlar(t, [t + 1, t - 1, Number.isInteger(d / Math.abs(v1 - v2)) ? d / Math.abs(v1 - v2) : t + 2, t * 2]),
      yechim: [{ q: "hisobla", if: `${v1} + ${v2} = ${v1 + v2}` }, { q: "javob", if: `${d} : ${v1 + v2} = ${t}` }],
    });
  }
  // Velosipedchilar: tezliklar 5 barobar kichik, masofa ham.
  const u1 = v1 / 5, u2 = v2 / 5, D = d / 5;
  const t2 = tas(1, t - 1), yurdi = (u1 + u2) * t2, javob = D - yurdi;
  return Q({
    savol: L(`${t2} soatdan keyin ular orasida necha km qoladi?`, `Какое расстояние будет между ними через ${t2} ч?`),
    shart: L(`Ikki qishloq orasidagi masofa ${D} km. Ulardan bir vaqtda bir-biriga qarab ikki velosipedchi chiqdi: tezliklari ${u1} km/soat va ${u2} km/soat.`,
      `Расстояние между сёлами ${D} км. Одновременно навстречу друг другу выехали два велосипедиста со скоростями ${u1} и ${u2} км/ч.`),
    javob: String(javob),
    variantlar: sonlar(javob, [yurdi, D - u1 * t2, D - Math.abs(u1 - u2) * t2, javob + u1]),
    yechim: [{ q: "hisobla", if: `(${u1} + ${u2}) · ${t2} = ${yurdi}` }, { q: "javob", if: `${D} − ${yurdi} = ${javob}` }],
  });
}

/** 21 · mulohaza — quvib yetish. */
function quvish(): RasmiyQ {
  for (;;) {
    const v1 = tas(2, 6) * 6, kech = tas(1, 4), v2 = v1 + tas(1, 6) * 6;
    const oldinda = v1 * kech;
    if (oldinda % (v2 - v1) !== 0) continue;
    const javob = oldinda / (v2 - v1);
    return Q({
      savol: L("Mototsiklchi necha soatda velosipedchiga yetib oladi?", "Через сколько часов мотоциклист догонит велосипедиста?"),
      shart: L(`Velosipedchi ${v1} km/soat tezlik bilan yo'lga chiqdi. ${kech} soatdan keyin xuddi shu joydan uning ortidan ${v2} km/soat tezlik bilan mototsiklchi chiqdi.`,
        `Велосипедист выехал со скоростью ${v1} км/ч. Через ${kech} ч из того же места за ним выехал мотоциклист со скоростью ${v2} км/ч.`),
      javob: String(javob),
      variantlar: sonlar(javob, [javob + kech, Number.isInteger(oldinda / v2) ? oldinda / v2 : javob * 2, kech, oldinda / (v2 - v1) * 2]),
      yechim: [
        { q: "hisobla", if: `${v1} · ${kech} = ${oldinda} km` },
        { q: "hisobla", if: `${v2} − ${v1} = ${v2 - v1}` },
        { q: "javob", if: `${oldinda} : ${v2 - v1} = ${javob}` },
      ],
    });
  }
}

/** 22 · murakkab — tezlik oshsa, qancha erta yetadi. */
function kechikish(): RasmiyQ {
  for (;;) {
    const v1 = tas(4, 8) * 10, t1 = tas(3, 8), d = v1 * t1, v2 = v1 + tas(1, 4) * 10;
    if (d % v2 !== 0) continue;
    const t2 = d / v2, javob = t1 - t2;
    return Q({
      savol: L("Necha soat oldin yetib boradi?", "На сколько часов раньше он прибудет?"),
      shart: L(`Avtobus ${v1} km/soat tezlik bilan manzilga ${t1} soatda yetib boradi. Agar u ${v2} km/soat tezlik bilan yursa-chi?`,
        `Автобус со скоростью ${v1} км/ч доезжает за ${t1} ч. А если он поедет со скоростью ${v2} км/ч?`),
      javob: String(javob),
      variantlar: sonlar(javob, [t2, Number.isInteger((v2 - v1) / 10) ? (v2 - v1) / 10 : javob + 2, t1, javob + 1]),
      yechim: [{ q: "hisobla", if: `${v1} · ${t1} = ${d} km` }, { q: "hisobla", if: `${d} : ${v2} = ${t2}` }, { q: "javob", if: `${t1} − ${t2} = ${javob}` }],
    });
  }
}

/* ---------------- 3. Statistika ---------------- */

const KUNLAR = () => L("Du,Se,Ch,Pa,Ju", "Пн,Вт,Ср,Чт,Пт").split(",");

/** 23 · qo'llash — diagrammadan o'qish. */
function diagrammaSavol(): RasmiyQ {
  const q = KUNLAR().map(() => tas(3, 12) * 5);
  const kunlar = KUNLAR();
  const tur = tas(0, 1);
  if (tur === 0) {
    const max = Math.max(...q), min = Math.min(...q);
    if (max === min) return diagrammaSavol();
    const javob = max - min;
    return Q({
      savol: L("Eng ko'p va eng kam o'qilgan kunlardagi betlar farqi nechta?", "На сколько страниц больше в самый «читающий» день, чем в самый малый?"),
      shart: L("Diagrammada Lola besh kunda o'qigan betlar soni berilgan.", "На диаграмме — сколько страниц Лола прочитала за пять дней."),
      rasm: diagramma(kunlar, q),
      javob: String(javob),
      variantlar: sonlar(javob, [max, min, max + min, q[0]! - q[4]! > 0 ? q[0]! - q[4]! : javob + 5], 5),
      yechim: [{ q: "javob", if: `${max} − ${min} = ${javob}` }],
    });
  }
  const javob = q.reduce((a, b) => a + b, 0);
  return Q({
    savol: L("Lola besh kunda jami nechta bet o'qigan?", "Сколько всего страниц Лола прочитала за пять дней?"),
    shart: L("Diagrammada Lola besh kunda o'qigan betlar soni berilgan.", "На диаграмме — сколько страниц Лола прочитала за пять дней."),
    rasm: diagramma(kunlar, q),
    javob: String(javob),
    variantlar: sonlar(javob, [javob - q[2]!, javob + 10, javob - 5, Math.max(...q) * 5], 5),
    yechim: [{ q: "hisobla", if: `${q.join(" + ")} = ${javob}` }],
  });
}

/** 24 · murakkab — jadval tahlili (ikki bosqich). */
function jadvalSavol(): RasmiyQ {
  const sinflar = ["4-A", "4-B", "4-D"];
  const ogil = sinflar.map(() => tas(10, 18)), qiz = sinflar.map(() => tas(10, 18));
  const jami = (x: number[]) => x.reduce((a, b) => a + b, 0);
  const rasm = jadval([[L("Sinf", "Класс"), L("O'g'il", "Мальч."), L("Qiz", "Дев.")], ...sinflar.map((s, i) => [s, String(ogil[i]), String(qiz[i])])]);
  if (jami(ogil) === jami(qiz)) return jadvalSavol();
  const kop = jami(qiz) > jami(ogil);
  const javob = Math.abs(jami(qiz) - jami(ogil));
  return Q({
    savol: kop
      ? L("Uchala sinfda qizlar o'g'il bolalardan nechta ko'p?", "На сколько девочек больше, чем мальчиков, во всех трёх классах?")
      : L("Uchala sinfda o'g'il bolalar qizlardan nechta ko'p?", "На сколько мальчиков больше, чем девочек, во всех трёх классах?"),
    shart: L("Jadvalda uchta sinfdagi o'quvchilar soni berilgan.", "В таблице — число учеников трёх классов."),
    rasm,
    javob: String(javob),
    variantlar: sonlar(javob, [Math.abs(qiz[0]! - ogil[0]!), jami(qiz), jami(ogil), javob + 3]),
    yechim: [{ q: "hisobla", if: `${Math.max(jami(qiz), jami(ogil))} − ${Math.min(jami(qiz), jami(ogil))} = ${javob}` }],
  });
}

/** 25 · mulohaza — kodlash va kombinatorika. */
function kodlash(): RasmiyQ {
  const t = tas(0, 2);
  if (t === 0) {
    // Raqamlar takrorlanmaydi, nol bor — nol boshga qo'yilmaydi.
    const r = [0, ...aralash([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3)].sort((a, b) => a - b);
    const javob = 3 * 3 * 2;
    return Q({
      savol: L("Nechta uch xonali son tuzish mumkin?", "Сколько трёхзначных чисел можно составить?"),
      shart: L(`${r.join(", ")} raqamlaridan raqamlari takrorlanmaydigan uch xonali sonlar tuzilmoqda.`,
        `Из цифр ${r.join(", ")} составляют трёхзначные числа без повторения цифр.`),
      javob: String(javob),
      variantlar: sonlar(javob, [24, 64, 48, 12]),
      yechim: [{ q: "hisobla", if: `3 · 3 · 2 = ${javob}` }],
    });
  }
  if (t === 1) {
    const n = tas(3, 5);
    const javob = n * n * n;
    return Q({
      savol: L("Nechta turli kod bo'lishi mumkin?", "Сколько различных кодов возможно?"),
      shart: L(`Qulf kodi uch xonali bo'lib, unda faqat 1 dan ${n} gacha raqamlar ishlatiladi (raqamlar takrorlanishi mumkin).`,
        `Код замка трёхзначный, в нём используются только цифры от 1 до ${n} (цифры могут повторяться).`),
      javob: String(javob),
      variantlar: sonlar(javob, [n * (n - 1) * (n - 2), n * 3, n * n, javob - n]),
      yechim: [{ q: "hisobla", if: `${n} · ${n} · ${n} = ${javob}` }],
    });
  }
  const n = tas(4, 6);
  const javob = (n * (n - 1)) / 2;
  return Q({
    savol: L("Hammasi bo'lib nechta o'yin o'tkazildi?", "Сколько всего было сыграно партий?"),
    shart: L(`Turnirda ${n} nafar shaxmatchi qatnashdi. Har biri qolgan har biri bilan bir martadan o'ynadi.`,
      `В турнире участвовали ${rk(n, "шахматист", "шахматиста", "шахматистов")}. Каждый сыграл с каждым по одной партии.`),
    javob: String(javob),
    variantlar: sonlar(javob, [n * (n - 1), n * n, n * 2, javob + n]),
    yechim: [{ q: "hisobla", if: `${n} · ${n - 1} : 2 = ${javob}` }],
  });
}

/* ---------------- 4. Geometriya ---------------- */

/** 26 · bilish — kesma. */
function kesma(): RasmiyQ {
  const ab = tas(2, 7) * 10 + tas(1, 9), bc = tas(15, 70);
  const javob = ab + bc;
  const rasm = svg(300, 60,
    `<line x1="20" y1="30" x2="280" y2="30" ${CH}/>` +
    [20, 130, 280].map((x, i) => `<circle cx="${x}" cy="30" r="3.5" fill="currentColor"/>${yoz(x, 52, "ABC"[i]!, 14)}`).join(""));
  return Q({
    savol: L("AC kesmaning uzunligi necha millimetr?", "Какова длина отрезка AC в миллиметрах?"),
    shart: L(`AB = ${Math.floor(ab / 10)} sm ${ab % 10} mm, BC = ${bc} mm.`, `AB = ${Math.floor(ab / 10)} см ${ab % 10} мм, BC = ${bc} мм.`),
    rasm,
    javob: String(javob),
    variantlar: sonlar(javob, [Math.floor(ab / 10) + ab % 10 + bc, Math.floor(ab / 10) + bc, Math.abs(bc - ab), javob + 10]),
    yechim: [{ q: "hisobla", if: `${ab} + ${bc} = ${javob} mm` }],
  });
}

/** 27 · qo'llash — perimetrdan yuza. */
function torburchak(): RasmiyQ {
  const a = tas(3, 9), b = a + tas(2, 8), p = 2 * (a + b);
  const javob = a * b;
  return Q({
    savol: L("To'g'ri to'rtburchakning yuzini toping (sm²).", "Найдите площадь прямоугольника (см²)."),
    shart: L(`To'g'ri to'rtburchakning perimetri ${p} sm, eni ${a} sm.`, `Периметр прямоугольника ${p} см, ширина ${a} см.`),
    javob: String(javob),
    variantlar: sonlar(javob, [a * (p / 2), (p - a) * a, a * (p - 2 * a), p * a]),
    yechim: [{ q: "hisobla", if: `${p} : 2 − ${a} = ${b}` }, { q: "javob", if: `${a} · ${b} = ${javob}` }],
  });
}

/** 28 · mulohaza — murakkab shakl perimetri (chizma bilan). */
function murakkabShakl(): RasmiyQ {
  const W = tas(8, 14), H = tas(6, 10), a = tas(2, W - 4), b = tas(2, H - 3);
  const s = 18, x0 = 30, y0 = 18, w = W * s, h = H * s;
  const burchak = Math.random() < 0.5;
  // Burchakdan kesilgan bo'lak perimetrni O'ZGARTIRMAYDI; o'rtadagi o'yiq esa 2·chuqurlik qo'shadi.
  const javob = burchak ? 2 * (W + H) : 2 * (W + H) + 2 * b;
  const ox = x0 + Math.round((W - a) / 2) * s;
  const yolD = burchak
    ? `M${x0} ${y0}H${x0 + w - a * s}V${y0 + b * s}H${x0 + w}V${y0 + h}H${x0}Z`
    : `M${x0} ${y0}H${ox}V${y0 + b * s}H${ox + a * s}V${y0}H${x0 + w}V${y0 + h}H${x0}Z`;
  const rasm = svg(x0 * 2 + w, y0 * 2 + h + 10,
    `<path d="${yolD}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="currentColor" fill-opacity=".08"/>` +
    yoz(x0 + w / 2, y0 + h + 20, `${W}`, 13) + yoz(x0 - 8, y0 + h / 2 + 4, `${H}`, 13, "end") +
    (burchak
      ? yoz(x0 + w - (a * s) / 2, y0 + b * s + 15, `${a}`, 12) + yoz(x0 + w - a * s - 6, y0 + (b * s) / 2 + 4, `${b}`, 12, "end")
      : yoz(ox + (a * s) / 2, y0 + b * s + 15, `${a}`, 12) + yoz(ox - 6, y0 + (b * s) / 2 + 4, `${b}`, 12, "end")));
  return Q({
    savol: L("Shaklning perimetrini toping (sm).", "Найдите периметр фигуры (см)."),
    shart: L("Shakl to'g'ri to'rtburchakdan kichik to'g'ri to'rtburchak qirqib olinib hosil qilingan. O'lchamlar santimetrda.",
      "Фигура получена вырезанием маленького прямоугольника из прямоугольника. Размеры в сантиметрах."),
    rasm,
    javob: String(javob),
    variantlar: sonlar(javob, burchak
      ? [2 * (W + H) - 2 * (a + b), 2 * (W + H) - (a + b), W * H - a * b, 2 * (W + H) + 2 * b]
      : [2 * (W + H), 2 * (W + H) - a + 2 * b, W * H - a * b, 2 * (W + H) + 2 * a]),
    yechim: burchak
      ? [{ q: "formula", if: L("Kesilgan burchak perimetrni o'zgartirmaydi", "Вырезанный угол не меняет периметр") }, { q: "javob", if: `2 · (${W} + ${H}) = ${javob}` }]
      : [{ q: "hisobla", if: `2 · (${W} + ${H}) + 2 · ${b} = ${javob}` }],
  });
}

/** 29 · bilish — kuboid qirralari yig'indisi. */
function qirralar(): RasmiyQ {
  const a = tas(3, 12), b = tas(2, 9), c = tas(2, 8);
  const javob = 4 * (a + b + c);
  return Q({
    savol: L("Barcha qirralari uzunliklari yig'indisini toping (sm).", "Найдите сумму длин всех рёбер (см)."),
    shart: L(`To'g'ri burchakli parallelepipedning o'lchamlari: ${a} sm, ${b} sm, ${c} sm.`,
      `Размеры прямоугольного параллелепипеда: ${a} см, ${b} см, ${c} см.`),
    javob: String(javob),
    variantlar: sonlar(javob, [a + b + c, 2 * (a + b + c), a * b * c, 2 * (a * b + b * c + a * c)]),
    yechim: [{ q: "formula", if: "4 · (a + b + c)" }, { q: "javob", if: `4 · ${a + b + c} = ${javob}` }],
  });
}

/** 30 · mulohaza — kuboid yon yoqlari yoki kub qirrasidan yuza. */
function kuboid(): RasmiyQ {
  if (Math.random() < 0.5) {
    const a = tas(3, 9), b = tas(2, 7), h = tas(3, 10);
    const javob = 2 * (a + b) * h;
    return Q({
      savol: L("Yon yoqlari yuzlarining yig'indisini toping (sm²).", "Найдите сумму площадей боковых граней (см²)."),
      shart: L(`To'g'ri burchakli parallelepipedning asosi ${a} sm va ${b} sm, balandligi ${h} sm.`,
        `Основание прямоугольного параллелепипеда ${a} см на ${b} см, высота ${h} см.`),
      javob: String(javob),
      variantlar: sonlar(javob, [javob + 2 * a * b, a * b * h, (a + b) * h, 2 * a * b + (a + b) * h]),
      yechim: [{ q: "hisobla", if: `2 · (${a} + ${b}) · ${h} = ${javob}` }],
    });
  }
  const q = tas(2, 9), jami = 12 * q, javob = q * q;
  return Q({
    savol: L("Kubning bitta yog'ining yuzi necha sm²?", "Какова площадь одной грани куба (см²)?"),
    shart: L(`Kubning barcha qirralari uzunliklari yig'indisi ${jami} sm.`, `Сумма длин всех рёбер куба ${jami} см.`),
    javob: String(javob),
    variantlar: sonlar(javob, [(jami / 4) ** 2, 6 * q * q, q * q * q, jami / 6]),
    yechim: [{ q: "hisobla", if: `${jami} : 12 = ${q}` }, { q: "javob", if: `${q} · ${q} = ${javob}` }],
  });
}

/**
 * 30 TOPSHIRIQ — spetsifikatsiya tartibida. Daraja taqsimoti:
 * bilish 6, qo'llash 6, murakkab 9, mulohaza 9 (`scripts/qabul.ts` sanaydi).
 */
export const TOPSHIRIQLAR: Topshiriq[] = [
  { soha: "sonlar", daraja: "bilish", bob: 1, yasa: xonaBirligi },
  { soha: "sonlar", daraja: "qollash", bob: 5, yasa: amallarTartibi },
  { soha: "sonlar", daraja: "bilish", bob: 4, yasa: bolinishAlomati },
  { soha: "sonlar", daraja: "murakkab", bob: 1, yasa: raqamlardanSon },
  { soha: "sonlar", daraja: "mulohaza", bob: 1, yasa: taqqoslash },
  { soha: "sonlar", daraja: "murakkab", bob: 3, yasa: xarid },
  { soha: "sonlar", daraja: "mulohaza", bob: 2, yasa: raqamYigindisi },
  { soha: "sonlar", daraja: "murakkab", bob: 4, yasa: qoldiqli },
  { soha: "kasr", daraja: "qollash", bob: 6, yasa: kasrlar },
  { soha: "kasr", daraja: "mulohaza", bob: 6, yasa: sonningQismi },
  { soha: "ifoda", daraja: "mulohaza", bob: 5, yasa: ketmaKetlik },
  { soha: "ifoda", daraja: "murakkab", bob: 5, yasa: tenglama },
  { soha: "ifoda", daraja: "bilish", bob: 1, yasa: yaxlitlash },
  { soha: "ifoda", daraja: "qollash", bob: 1, yasa: yaxlitlashMasala },
  { soha: "ifoda", daraja: "bilish", bob: 7, yasa: birliklar },
  { soha: "ifoda", daraja: "murakkab", bob: 5, yasa: kiritilganAmal },
  { soha: "nisbat", daraja: "murakkab", bob: 6, yasa: foiz },
  { soha: "nisbat", daraja: "mulohaza", bob: 8, yasa: ishMasalasi },
  { soha: "nisbat", daraja: "qollash", bob: 7, yasa: vaqt },
  { soha: "harakat", daraja: "murakkab", bob: 8, yasa: qarshiHarakat },
  { soha: "harakat", daraja: "mulohaza", bob: 8, yasa: quvish },
  { soha: "harakat", daraja: "murakkab", bob: 8, yasa: kechikish },
  { soha: "statistika", daraja: "qollash", bob: 10, yasa: diagrammaSavol },
  { soha: "statistika", daraja: "murakkab", bob: 10, yasa: jadvalSavol },
  { soha: "statistika", daraja: "mulohaza", bob: 10, yasa: kodlash },
  { soha: "geometriya", daraja: "bilish", bob: 9, yasa: kesma },
  { soha: "geometriya", daraja: "qollash", bob: 9, yasa: torburchak },
  { soha: "geometriya", daraja: "mulohaza", bob: 9, yasa: murakkabShakl },
  { soha: "geometriya", daraja: "bilish", bob: 9, yasa: qirralar },
  { soha: "geometriya", daraja: "mulohaza", bob: 9, yasa: kuboid },
];

/* ================================================================ 2-bosqich */
/* Prezident maktablari, 2-bosqich: "tanqidiy fikrlash" — 16 ta ma'lumot
   tahlili va 24 ta mantiqiy elementli matematika (ariza.piima.uz). */

/** Ma'lumot tahlili — o'rtacha qiymat diagrammadan. */
function ortacha(): RasmiyQ {
  for (;;) {
    const q = KUNLAR().map(() => tas(2, 12) * 5);
    const s = q.reduce((a, b) => a + b, 0);
    if (s % 5 !== 0 || (s / 5) % 1 !== 0) continue;
    const javob = s / 5;
    if (!Number.isInteger(javob)) continue;
    return Q({
      savol: L("Bir kunda o'rtacha nechta bet o'qilgan?", "Сколько страниц в среднем читали в день?"),
      shart: L("Diagrammada besh kunda o'qilgan betlar soni.", "На диаграмме — число страниц за пять дней."),
      rasm: diagramma(KUNLAR(), q),
      javob: String(javob),
      variantlar: sonlar(javob, [s, Math.max(...q), (Math.max(...q) + Math.min(...q)) / 2, q[2]!]),
      yechim: [{ q: "hisobla", if: `(${q.join(" + ")}) : 5 = ${javob}` }],
    });
  }
}

/** Ma'lumot tahlili — jadvaldan eng arzon xarid. */
function arzonXarid(): RasmiyQ {
  const dokon = ["A", "B", "C"];
  const narx = dokon.map(() => [tas(4, 9) * 1000, tas(2, 6) * 1000]);
  const n1 = tas(2, 4), n2 = tas(1, 3);
  const jami = narx.map(([a, b]) => n1 * a! + n2 * b!);
  const min = Math.min(...jami);
  if (jami.filter((x) => x === min).length > 1) return arzonXarid();
  return Q({
    savol: L(`${n1} ta daftar va ${n2} ta ruchkani qaysi do'kondan olish eng arzon?`, `В каком магазине дешевле всего купить ${n1} тетради и ${n2} ручки?`),
    shart: L("Jadvalda uchta do'kondagi narxlar (so'm) berilgan.", "В таблице — цены (в сумах) в трёх магазинах."),
    rasm: jadval([[L("Do'kon", "Магазин"), L("Daftar", "Тетрадь"), L("Ruchka", "Ручка")], ...dokon.map((d, i) => [d, son(narx[i]![0]!), son(narx[i]![1]!)])]),
    javob: dokon[jami.indexOf(min)]!,
    variantlar: [...dokon, L("Farqi yo'q", "Без разницы")],
    yechim: dokon.map((d, i) => ({ q: "hisobla" as const, if: `${d}: ${son(jami[i]!)}` })),
  });
}

/** Ma'lumot tahlili — ulush diagrammadan. */
function ulushDiagramma(): RasmiyQ {
  for (;;) {
    // Kerakli kun QURILADI: qolgan to'rt kun tasodifiy, u esa ularning
    // yig'indisidan shunday olinadiki, jami betlarning aynan 1/m qismi bo'lsin.
    const m = tanla([3, 4, 5]), i = tas(0, 4);
    const boshqa = [0, 1, 2, 3].map(() => tas(2, 12) * 4);
    const yig = boshqa.reduce((a, b) => a + b, 0);
    if (yig % (m - 1) !== 0) continue;
    const shu = yig / (m - 1);
    if (shu < 4 || shu > 60 || boshqa.includes(shu)) continue;
    const q = [...boshqa]; q.splice(i, 0, shu);
    const s = yig + shu;
    return Q({
      savol: L(`Qaysi kuni jami betlarning 1/${m} qismi o'qilgan?`, `В какой день прочитана 1/${m} всех страниц?`),
      shart: L("Diagrammada besh kunda o'qilgan betlar soni.", "На диаграмме — число страниц за пять дней."),
      rasm: diagramma(KUNLAR(), q),
      javob: KUNLAR()[i]!,
      variantlar: aralash([KUNLAR()[i]!, ...aralash(KUNLAR().filter((_, j) => j !== i)).slice(0, 3)]),
      yechim: [{ q: "hisobla", if: `${s} : ${m} = ${q[i]}` }],
    });
  }
}

/** Ma'lumot tahlili — mantiqiy tartib ("kim eng baland"). */
function tartib(): RasmiyQ {
  const ism = L("Ali,Vali,Sardor,Olim", "Али,Вали,Сардор,Олим").split(",");
  const t = aralash([0, 1, 2, 3]);          // t[0] — eng baland
  const [a, b, c, d] = t.map((i) => ism[i]!);
  const shart = L(
    `${a} ${b}dan baland. ${c} ${d}dan past. ${b} ${c}dan baland.`,
    `${a} выше, чем ${b}. ${c} ниже, чем ${d}. ${b} выше, чем ${c}.`);
  // Shartlardan tartib: a > b > c, d > c. d ning o'rni noaniq bo'lishi mumkin — savol faqat eng pastni so'raydi.
  return Q({
    savol: L("Kim eng past?", "Кто самый низкий?"),
    shart,
    javob: c!,
    variantlar: aralash([a!, b!, c!, d!]),
    yechim: [{ q: "tekshir", if: `${a} > ${b} > ${c},  ${d} > ${c}` }],
  });
}

/** Mantiq — yosh masalasi. */
function yosh(): RasmiyQ {
  const bola = tas(6, 12), farq = tas(22, 32), keyin = tas(3, 10);
  const ota = bola + farq;
  if (Math.random() < 0.5) {
    const javob = ota + keyin;
    return Q({
      savol: L(`${keyin} yildan keyin otasi necha yoshda bo'ladi?`, `Сколько лет будет отцу через ${yil(keyin)}?`),
      shart: L(`Hozir o'g'il ${bola} yoshda, ota esa o'g'lidan ${farq} yosh katta.`, `Сейчас сыну ${yil(bola)}, отец старше на ${yil(farq)}.`),
      javob: String(javob),
      variantlar: sonlar(javob, [ota, farq + keyin, bola + keyin, javob + keyin]),
      yechim: [{ q: "hisobla", if: `${bola} + ${farq} + ${keyin} = ${javob}` }],
    });
  }
  // "Necha yildan keyin ota o'g'lidan k marta katta bo'ladi" — yechim butun bo'lsin.
  for (let k = 2; k <= 4; k++) {
    const x = farq / (k - 1) - bola;
    if (Number.isInteger(x) && x > 0) {
      return Q({
        savol: L(`Necha yildan keyin ota o'g'lidan ${k} marta katta bo'ladi?`, `Через сколько лет отец будет в ${k} раза старше сына?`),
        shart: L(`Ota ${ota} yoshda, o'g'li ${bola} yoshda.`, `Отцу ${yil(ota)}, сыну ${yil(bola)}.`),
        javob: String(x),
        variantlar: sonlar(x, [farq / (k - 1), x + 1, x * k, bola]),
        yechim: [{ q: "shart", if: `${ota} + x = ${k} · (${bola} + x)` }, { q: "javob", if: `x = ${x}` }],
      });
    }
  }
  return yosh();
}

/** Mantiq — oyoqlar soni (tovuq va quyon). */
function oyoqlar(): RasmiyQ {
  const t = tas(3, 12), q = tas(2, 10);
  const bosh = t + q, oyoq = 2 * t + 4 * q;
  return Q({
    savol: L("Hovlida nechta quyon bor?", "Сколько во дворе кроликов?"),
    shart: L(`Hovlida tovuqlar va quyonlar bor. Ularning boshlari ${bosh} ta, oyoqlari ${oyoq} ta.`,
      `Во дворе куры и кролики. У них ${rk(bosh, "голова", "головы", "голов")} и ${rk(oyoq, "нога", "ноги", "ног")}.`),
    javob: String(q),
    variantlar: sonlar(q, [t, oyoq / 4, bosh - q + 1, (oyoq - bosh) / 2]),
    yechim: [{ q: "hisobla", if: `(${oyoq} − 2 · ${bosh}) : 2 = ${q}` }],
  });
}

/** Mantiq — sahifalarni raqamlash: nechta raqam ishlatildi. */
function sahifalar(): RasmiyQ {
  const n = tas(25, 140);
  const javob = Math.min(n, 9) + Math.max(0, Math.min(n, 99) - 9) * 2 + Math.max(0, n - 99) * 3;
  return Q({
    savol: L("Sahifalarni raqamlash uchun jami nechta raqam yozilgan?", "Сколько всего цифр понадобилось для нумерации страниц?"),
    shart: L(`Kitob 1 dan ${n} gacha raqamlangan ${n} sahifadan iborat.`, `Страницы книги пронумерованы от 1 до ${n}.`),
    javob: String(javob),
    variantlar: sonlar(javob, [n, 2 * n, javob - 9, javob + 9]),
    yechim: [{ q: "hisobla", if: n > 99 ? `9 + 90 · 2 + ${n - 99} · 3 = ${javob}` : `9 + ${n - 9} · 2 = ${javob}` }],
  });
}

/** Mantiq — hafta kuni. */
function haftaKuni(): RasmiyQ {
  const kun = L("dushanba,seshanba,chorshanba,payshanba,juma,shanba,yakshanba", "понедельник,вторник,среда,четверг,пятница,суббота,воскресенье").split(",");
  const b = tas(0, 6), n = tas(10, 60);
  const javob = kun[(b + n) % 7]!;
  return Q({
    savol: L(`${n} kundan keyin haftaning qaysi kuni bo'ladi?`, `Какой день недели будет через ${kunR(n)}?`),
    shart: L(`Bugun — ${kun[b]}.`, `Сегодня — ${kun[b]}.`),
    javob,
    variantlar: matnlar(javob, [kun[(b + n + 1) % 7]!, kun[(b + n + 6) % 7]!, kun[(b + (n % 7) + 2) % 7]!], () => tanla(kun)),
    yechim: [{ q: "hisobla", if: `${n} = 7 · ${Math.floor(n / 7)} + ${n % 7}` }, { q: "javob", if: javob }],
  });
}

/** Mantiq — kafolat (Dirixle): eng kamida nechta olish kerak. */
function kafolat(): RasmiyQ {
  const q = tas(4, 9), k = tas(3, 8), y = tas(2, 6);
  const rang = [L("qizil", "красных"), L("ko'k", "синих"), L("yashil", "зелёных")];
  const ruRang = ["красных", "синих", "зелёных"];
  const javob = q + k + 2;     // eng yomoni: hammasi boshqa ranglardan, so'ng ikkitasi yashil
  return Q({
    savol: L("Ichiga qaramay eng kamida nechta shar olinsa, ular orasida albatta 2 ta yashil shar bo'ladi?",
      "Какое наименьшее число шаров нужно взять не глядя, чтобы среди них точно было 2 зелёных?"),
    shart: L(`Qutida ${q} ta ${rang[0]}, ${k} ta ${rang[1]} va ${y} ta ${rang[2]} shar bor.`,
      `В коробке шары: ${ruRang[0]} — ${q}, ${ruRang[1]} — ${k}, ${ruRang[2]} — ${y}.`),
    javob: String(javob),
    variantlar: sonlar(javob, [2, 3, q + k + 1, q + k + y]),
    yechim: [{ q: "hisobla", if: `${q} + ${k} + 2 = ${javob}` }],
  });
}

/** Mantiq — tarozi (almashtirish). */
function tarozi(): RasmiyQ {
  const a = tas(2, 4), b = tas(2, 5), c = tas(1, 3);
  // a olma = b nok, c nok = ... — bitta olmaning og'irligi nok bilan butun bo'lsin.
  const nok = tas(1, 4) * 20, olma = (b * nok) / a;
  if (!Number.isInteger(olma)) return tarozi();
  const n = tas(2, 6), javob = n * olma + c * nok;
  return Q({
    savol: L(`${n} ta olma va ${c} ta nok birgalikda necha gramm?`, `Сколько граммов весят вместе ${rk(n, "яблоко", "яблока", "яблок")} и ${rk(c, "груша", "груши", "груш")}?`),
    shart: L(`${a} ta olma ${b} ta nok bilan teng og'irlikda. Bitta nok ${nok} g.`, `${rk(a, "яблоко", "яблока", "яблок")} весят столько же, сколько ${rk(b, "груша", "груши", "груш")}. Одна груша — ${nok} г.`),
    javob: String(javob),
    variantlar: sonlar(javob, [n * nok + c * nok, n * olma, (n + c) * olma, javob + nok], 10),
    yechim: [{ q: "hisobla", if: `${L("olma", "яблоко")} = ${b} · ${nok} : ${a} = ${olma} g` }, { q: "javob", if: `${n} · ${olma} + ${c} · ${nok} = ${javob}` }],
  });
}

/** Mantiq — sehrli kvadrat. */
function sehrliKvadrat(): RasmiyQ {
  // Lo Shu kvadrati + siljitish: yig'indilar hamma qatorda teng.
  const asos = [[2, 7, 6], [9, 5, 1], [4, 3, 8]];
  const k = tas(0, 10);
  const m = asos.map((q) => q.map((x) => x + k));
  const i = tas(0, 2), j = tas(0, 2);
  const javob = m[i]![j]!;
  const rasm = jadval(m.map((q, r) => q.map((x, s) => (r === i && s === j ? "?" : String(x)))));
  return Q({
    savol: L("So'roq o'rniga qaysi son yoziladi?", "Какое число стоит вместо знака вопроса?"),
    shart: L("Kvadratda har bir qator, ustun va diagonal bo'yicha sonlar yig'indisi bir xil.",
      "В квадрате суммы чисел в каждой строке, столбце и диагонали одинаковы."),
    rasm,
    javob: String(javob),
    variantlar: sonlar(javob, [javob + 1, javob - 1, 15 + 3 * k - javob, javob + 2]),
    yechim: [{ q: "hisobla", if: `${L("yig'indi", "сумма")} = ${15 + 3 * k}` }, { q: "javob", if: String(javob) }],
  });
}

/** Mantiq — qatordagi joy. */
function qatordaJoy(): RasmiyQ {
  const old = tas(4, 15), ort = tas(5, 15);
  const javob = old + ort - 1;
  return Q({
    savol: L("Qatorda jami nechta bola bor?", "Сколько всего детей в ряду?"),
    shart: L(`Bolalar bir qatorga turishdi. Aziz oldindan ${old}-o'rinda, orqadan ${ort}-o'rinda turibdi.`,
      `Дети встали в ряд. Азиз стоит ${old}-м спереди и ${ort}-м сзади.`),
    javob: String(javob),
    variantlar: sonlar(javob, [old + ort, old + ort + 1, Math.abs(old - ort), javob - 1]),
    yechim: [{ q: "hisobla", if: `${old} + ${ort} − 1 = ${javob}` }],
  });
}

/** Mantiq — ustunlar (daraxtlar) orasidagi masofa. */
function ustunlar(): RasmiyQ {
  const n = tas(5, 15), d = tas(2, 9) * 2;
  const javob = (n - 1) * d;
  return Q({
    savol: L("Birinchi va oxirgi daraxt orasidagi masofa necha metr?", "Каково расстояние между первым и последним деревом (м)?"),
    shart: L(`Yo'l bo'yida bir qatorga ${n} ta daraxt ekildi. Qo'shni daraxtlar orasi ${d} m.`,
      `Вдоль дороги в ряд посадили ${n} деревьев, между соседними — ${d} м.`),
    javob: String(javob),
    variantlar: sonlar(javob, [n * d, (n + 1) * d, (n - 2) * d, javob + 1], 2),
    yechim: [{ q: "hisobla", if: `(${n} − 1) · ${d} = ${javob}` }],
  });
}

/** 2-bosqich: ma'lumot tahlili (16 ta) — shu yasovchilardan navbat bilan. */
export const MALUMOT: Topshiriq[] = [
  { soha: "malumot", daraja: "murakkab", bob: 10, yasa: diagrammaSavol },
  { soha: "malumot", daraja: "murakkab", bob: 10, yasa: jadvalSavol },
  { soha: "malumot", daraja: "murakkab", bob: 10, yasa: ortacha },
  { soha: "malumot", daraja: "murakkab", bob: 10, yasa: arzonXarid },
  { soha: "malumot", daraja: "murakkab", bob: 6, yasa: ulushDiagramma },
  { soha: "malumot", daraja: "mulohaza", bob: 10, yasa: tartib },
  { soha: "malumot", daraja: "mulohaza", bob: 7, yasa: vaqt },
  { soha: "malumot", daraja: "mulohaza", bob: 10, yasa: kodlash },
];

/** 2-bosqich: mantiqiy elementli matematika (24 ta). */
export const MANTIQ: Topshiriq[] = [
  { soha: "mantiq", daraja: "mulohaza", bob: 5, yasa: ketmaKetlik },
  { soha: "mantiq", daraja: "mulohaza", bob: 5, yasa: yosh },
  { soha: "mantiq", daraja: "mulohaza", bob: 5, yasa: oyoqlar },
  { soha: "mantiq", daraja: "mulohaza", bob: 1, yasa: sahifalar },
  { soha: "mantiq", daraja: "mulohaza", bob: 7, yasa: haftaKuni },
  { soha: "mantiq", daraja: "mulohaza", bob: 1, yasa: kafolat },
  { soha: "mantiq", daraja: "mulohaza", bob: 8, yasa: tarozi },
  { soha: "mantiq", daraja: "mulohaza", bob: 5, yasa: sehrliKvadrat },
  { soha: "mantiq", daraja: "mulohaza", bob: 1, yasa: qatordaJoy },
  { soha: "mantiq", daraja: "mulohaza", bob: 9, yasa: ustunlar },
  { soha: "mantiq", daraja: "mulohaza", bob: 2, yasa: raqamYigindisi },
  { soha: "mantiq", daraja: "mulohaza", bob: 8, yasa: ishMasalasi },
  { soha: "mantiq", daraja: "mulohaza", bob: 8, yasa: quvish },
  { soha: "mantiq", daraja: "mulohaza", bob: 5, yasa: kiritilganAmal },
  { soha: "mantiq", daraja: "mulohaza", bob: 9, yasa: murakkabShakl },
  { soha: "mantiq", daraja: "mulohaza", bob: 1, yasa: taqqoslash },
];

/**
 * Mantiq bo'limi (`lib/mantiq.ts`) shu yasovchilardan foydalanadi: ular
 * qabul imtihoni uchun yozilgan va `scripts/qabul.ts` da sinalgan —
 * ikkinchi nusxa yozish ularni bir-biridan ajratib yuborardi.
 */
export const YASOVCHI = {
  qatordaJoy, ustunlar, ketmaKetlik, tartib, haftaKuni, oyoqlar, tarozi, sehrliKvadrat,
  yosh, sahifalar, kodlash, kafolat, kiritilganAmal, murakkabShakl,
} as const;
