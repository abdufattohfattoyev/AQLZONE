/**
 * SAVOL TO'G'RIMI — mustaqil tekshiruv.
 *
 *     npx jiti scripts/togri.ts
 *
 * ─────────────── NEGA `tekshir.ts` YETARLI EMAS ───────────────
 *
 * `tekshir.ts` savolning YAROQLI ekanini biladi: javob bormi,
 * variantlar ichida turibdimi, takrorlanmaganmi, manfiy chiqib
 * ketmadimi. Bularning hammasi kerak, lekin ular bitta savolga javob
 * bermaydi: JAVOB TO'G'RIMI?
 *
 * Bera olmasligining sababi tuzilishda. Generator savolni ham,
 * javobni ham O'ZI yasaydi:
 *
 *     const a = rnd(10, 99), b = rnd(10, 99);
 *     return { text: `${a} + ${b} = ?`, answer: a + b, ... };
 *
 * Formulada xato bo'lsa (masalan `a + b` o'rniga `a - b` yozilsa),
 * savol ham, javob ham BIRDEK noto'g'ri bo'ladi va har qanday
 * ichki tekshiruv ularni bir-biriga mos deb topadi.
 *
 * ─────────────── QANDAY TEKSHIRILADI ───────────────
 *
 * Yagona chiqish yo'li — javobga BOSHQA YO'LDAN borish. Bu skript
 * savol MATNINI o'qiydi va uni o'zining mustaqil hisoblagichi bilan
 * yechadi. Generatorning kodidan hech narsa ishlatilmaydi.
 *
 * Asosiy qoida sodda: `?` o'rniga javobni qo'yamiz va tenglikning
 * ikki tomoni teng chiqishini tekshiramiz.
 *
 *     "73 + 8 = ?"     → 73 + 8 = 81      ✓
 *     "92 = 90 + ?"    → 92 = 90 + 2      ✓
 *     "(9 + 7) × 8 = ?" → (9+7)×8 = 128   ✓
 *
 * ─────────────── NIMA TEKSHIRILMAYDI ───────────────
 *
 * Bu skript HAMMASINI tekshira olmaydi va bunga da'vo ham qilmaydi.
 * Matn bilan berilgan masala ("Anvarda 5 ta olma bor edi…"), chizma
 * savollari, hosila, grafik yo'nalishi — bularni matndan yechib
 * bo'lmaydi.
 *
 * Shuning uchun oxirida QAMROV yoziladi: nechta savol tekshirildi va
 * nechtasi tekshiruvdan tashqarida qoldi. Qamrovni bilish muhim —
 * "hammasi joyida" degan yozuv nimani anglatishini aynan shu son
 * belgilaydi.
 *
 * Topilgan nomuvofiqlik AVTOMATIK ravishda xato degani emas: ehtimol
 * matnni bu skript noto'g'ri o'qigandir. Shuning uchun u ro'yxat
 * chiqaradi va odam ko'rib chiqadi.
 */
import { COURSES } from "../src/lib/curriculum";
import { SHAPES } from "../src/lib/activity";
import type { Activity } from "../src/lib/activity";

/** Har generatordan nechta namuna olinadi. */
const TAKROR = 12;

/* ==================== mustaqil hisoblagich ====================
 *
 * Ataylab NOLDAN yozilgan: `eval` ham, biror kutubxona ham emas.
 * Maqsad — generator yurgan yo'ldan butunlay boshqa yo'l.
 */

/** Matematik belgilarni oddiy ko'rinishga keltiradi. */
function tozala(s: string): string {
  return s
    // Bo'shliqlarning har xil turi (shu jumladan uzilmas bo'shliq).
    .replace(/[    \s]+/g, " ")
    .replace(/[×∙·⋅]/g, "*")
    // Bo'lish belgisi kasr chizig'idan AJRATIB olinadi.
    //
    // Ikkalasini ham `/` ga aylantirish jimgina xato berardi:
    // "1/4 ÷ 1/4" → "1/4/1/4" bo'lib, chapdan o'ngga hisoblanganda
    // 0,0625 chiqardi. To'g'ri javob esa 1. Kasr — BITTA son, uning
    // ichidagi chiziq amal emas, shuning uchun u kuchliroq bog'laydi.
    .replace(/[÷:]/g, "|")
    // Minus belgisining uch xili — hammasi oddiy defisga.
    .replace(/[−–—]/g, "-")
    // O'nli kasr vergul bilan yoziladi: "3,5". Faqat raqamlar
    // orasidagisi almashtiriladi — ro'yxatdagi vergulga tegilmasin.
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/⁰/g, "^0").replace(/¹/g, "^1").replace(/²/g, "^2").replace(/³/g, "^3")
    .replace(/⁴/g, "^4").replace(/⁵/g, "^5").replace(/⁶/g, "^6").replace(/⁷/g, "^7")
    .replace(/⁸/g, "^8").replace(/⁹/g, "^9")
    .trim();
}

/**
 * Ifodani hisoblaydi. Yechib bo'lmasa `null`.
 *
 * Rekursiv tushish: qo'shish → ko'paytirish → daraja → atom.
 */
function hisobla(ifoda: string): number | null {
  const s = ifoda;
  let i = 0;

  const bosh = () => { while (i < s.length && s[i] === " ") i++; };
  const kor = () => { bosh(); return i < s.length ? s[i] : ""; };

  function atom(): number | null {
    bosh();
    if (kor() === "(") {
      i++;
      const v = qoshish();
      bosh();
      if (kor() !== ")") return null;
      i++;
      return v;
    }
    // Kvadrat ildiz: "√256". Manfiy ostidagi ildiz — yechilmaydi.
    if (kor() === "√") {
      i++;
      const v = atom();
      if (v === null || v < 0) return null;
      return Math.sqrt(v);
    }
    const boshi = i;
    while (i < s.length && /[\d.]/.test(s[i])) i++;
    if (i === boshi) return null;
    const n = Number(s.slice(boshi, i));
    return Number.isFinite(n) ? n : null;
  }

  /**
   * Daraja va unar minus.
   *
   * MINUS DARAJADAN KEYIN ishlaydi: `−x²` bu `−(x²)`, `(−x)²` emas.
   * Ilgari minus atom ichida edi va `−(−5)²` ni `(−(−5))² = 25` deb
   * hisoblardi — to'g'risi −25. Tekshiruvchi shu sababdan ikkita
   * to'g'ri savolni "xato" deb ko'rsatgan edi.
   */
  function daraja(): number | null {
    bosh();
    if (kor() === "-") { i++; const v = daraja(); return v === null ? null : -v; }
    if (kor() === "+") { i++; return daraja(); }

    const a = atom();
    if (a === null) return null;
    bosh();
    if (kor() === "^") {
      i++;
      const b = daraja();               // o'ngdan chapga
      return b === null ? null : a ** b;
    }
    return a;
  }

  /**
   * Kasr chizig'i — eng kuchli bog'lovchi (darajadan keyin).
   *
   * "1/4 ÷ 1/4" da `1/4` bitta son bo'lishi kerak. Agar `/` oddiy
   * bo'lish darajasida tursa, ifoda chapdan o'ngga hisoblanib
   * (((1÷4)÷1)÷4) noto'g'ri natija berardi.
   */
  function kasr(): number | null {
    let a = daraja();
    if (a === null) return null;
    for (;;) {
      bosh();
      if (kor() !== "/") return a;
      i++;
      const b = daraja();
      if (b === null || b === 0) return null;
      a /= b;
    }
  }

  function kopaytirish(): number | null {
    let a = kasr();
    if (a === null) return null;
    for (;;) {
      bosh();
      const c = kor();
      if (c !== "*" && c !== "|") return a;
      i++;
      const b = kasr();
      if (b === null) return null;
      if (c === "|" && b === 0) return null;
      a = c === "*" ? a * b : a / b;
    }
  }

  function qoshish(): number | null {
    let a = kopaytirish();
    if (a === null) return null;
    for (;;) {
      bosh();
      const c = kor();
      if (c !== "+" && c !== "-") return a;
      i++;
      const b = kopaytirish();
      if (b === null) return null;
      a = c === "+" ? a + b : a - b;
    }
  }

  const v = qoshish();
  bosh();
  // Oxirigacha o'qilmagan bo'lsa — ifoda tanish emas, tekshirmaymiz.
  return i === s.length ? v : null;
}

/** Ikki son amalda tengmi (o'nli kasrlarda yaxlitlash farqi bo'ladi). */
const teng = (a: number, b: number) => Math.abs(a - b) < 1e-6;

/**
 * Javob YAXLITLANGAN bo'lishi mumkin bo'lgan joylarda ishlatiladi.
 *
 * Geometriyada natija ko'pincha butun emas: aylana uzunligi, sinuslar
 * teoremasi, ildiz. Generator uni bir-ikki xonagacha yaxlitlaydi
 * ("31,4"), tekshiruvchi esa to'liq aniqlikda hisoblaydi. Qattiq
 * solishtirish har bunday savolni "xato" deb ko'rsatardi.
 *
 * Shuning uchun kutilgan qiymat JAVOBDAGI aniqlikka keltiriladi va
 * shundan keyin solishtiriladi.
 */
function tengYaxlit(kutilgan: number, javob: number): boolean {
  if (teng(kutilgan, javob)) return true;
  const nuqta = String(javob).split(".")[1]?.length ?? 0;
  const k = Number(kutilgan.toFixed(nuqta));
  // π ni 3,14 deb olgan javoblar uchun kichik yon beriladi.
  return k === javob || Math.abs(kutilgan - javob) < 0.05;
}

/**
 * Javobni songa aylantiradi. Bo'lmasa `null`.
 *
 * JAVOB HAR DOIM HAM SODDA SON EMAS. 5–8-sinfda u ko'pincha kasr
 * bo'ladi: "21/20", "12/7", "√3/2". Ilgari bunday javob `Number()` da
 * `NaN` berardi va savol butunlay tekshiruvdan chiqib ketardi —
 * kasrlar esa o'sha sinflarning asosiy mavzusi.
 *
 * Endi javob ham xuddi savol kabi hisoblagichdan o'tkaziladi.
 */
function javobSoni(javob: unknown): number | null {
  const t = tozala(String(javob));
  const tez = Number(t);
  if (Number.isFinite(tez)) return tez;
  // Faqat son, ildiz va amal belgilari bo'lsin — so'z bo'lsa emas.
  if (!/^[\d\s+\-*/|^().√]+$/.test(t)) return null;
  return hisobla(t);
}

/* ==================== ko'phad ====================
 *
 * Hosila savollarida javob SON emas, IFODA bo'ladi: "24x²", "4x + 3".
 * Ularni satr sifatida solishtirish mo'rt — bo'shliq, belgi tartibi va
 * ustki indeks yozuvi har xil bo'lishi mumkin va har farq yolg'on
 * ogohlantirish berardi.
 *
 * Shuning uchun ikkala tomon ham SONGA aylantiriladi: ko'phad
 * "daraja → koeffitsiyent" jadvali bo'lib yoziladi va jadvallar
 * solishtiriladi. "4x + 3" va "3 + 4x" bir xil jadval beradi.
 */

/** Daraja → koeffitsiyent. */
type Kophad = Map<number, number>;

/**
 * "2x^2 + 3x - 4" ko'rinishidagi ifodani jadvalga aylantiradi.
 *
 * Tanimasa `null` — o'shanda savol tekshirilmaydi.
 */
function kophadOqi(xom: string): Kophad | null {
  let s = tozala(xom).replace(/\s+/g, "");
  if (!s || !/^[-+]?[\dx^.]/.test(s)) return null;
  // Faqat son, `x`, daraja va ishoralar bo'lsin.
  if (!/^[-+\dx^.]+$/.test(s)) return null;

  const m: Kophad = new Map();
  // Birinchi had ishorasiz bo'lishi mumkin.
  if (!/^[-+]/.test(s)) s = `+${s}`;

  const hadlar = s.match(/[-+][^-+]+/g);
  if (!hadlar) return null;

  for (const h of hadlar) {
    const ishora = h[0] === "-" ? -1 : 1;
    const tana = h.slice(1);
    if (!tana) return null;

    if (!tana.includes("x")) {
      const k = Number(tana);
      if (!Number.isFinite(k)) return null;
      m.set(0, (m.get(0) ?? 0) + ishora * k);
      continue;
    }

    const [oldi, keyin] = tana.split("x");
    // "x" yolg'iz kelsa koeffitsiyent 1, "2x" da 2.
    const koef = oldi === "" ? 1 : Number(oldi);
    if (!Number.isFinite(koef)) return null;
    // Daraja: "" → 1, "^3" → 3.
    let daraja = 1;
    if (keyin) {
      if (!keyin.startsWith("^")) return null;
      daraja = Number(keyin.slice(1));
      if (!Number.isFinite(daraja)) return null;
    }
    m.set(daraja, (m.get(daraja) ?? 0) + ishora * koef);
  }

  // Nol koeffitsiyentli hadlar olib tashlanadi — "0x²" hech narsa emas.
  for (const [d, k] of m) if (k === 0) m.delete(d);
  return m;
}

/** Hosila: har hadning darajasi bittaga kamayadi, koeffitsiyent ko'payadi. */
function hosila(p: Kophad): Kophad {
  const h: Kophad = new Map();
  for (const [d, k] of p) {
    if (d === 0) continue;                     // o'zgarmas sonning hosilasi 0
    h.set(d - 1, (h.get(d - 1) ?? 0) + k * d);
  }
  for (const [d, k] of h) if (k === 0) h.delete(d);
  return h;
}

/** Ko'phadning berilgan nuqtadagi qiymati. */
function qiymat(p: Kophad, x: number): number {
  let s = 0;
  for (const [d, k] of p) s += k * x ** d;
  return s;
}

const kophadTeng = (a: Kophad, b: Kophad): boolean => {
  if (a.size !== b.size) return false;
  for (const [d, k] of a) {
    const v = b.get(d);
    if (v === undefined || !teng(k, v)) return false;
  }
  return true;
};

/* ==================== savolni tekshirish ==================== */

type Natija =
  | { holat: "tekshirildi"; togri: boolean; kutilgan?: number }
  | { holat: "otkazildi" };

/**
 * Bitta savolni tekshiradi.
 *
 * Uchta shakl taniladi; qolganlari o'tkazib yuboriladi.
 */
function savolniTekshir(matn: string, javob: unknown): Natija {
  const j = javobSoni(javob);
  if (j === null) return { holat: "otkazildi" };

  const s = tozala(matn);

  // Faqat raqam va amal belgilaridan iborat bo'lsin. Harf bo'lsa
  // (x, y, lim, sin) — bu boshqa janr, matndan yechib bo'lmaydi.
  const sof = (x: string) => /^[\d\s+\-*/|^().?√]+$/.test(x);

  // ── 1. "A ÷ B = Q qoldiq R" ──────────────────────────────
  // Alohida, chunki bu tenglik emas: A = B×Q + R deb tekshiriladi.
  const qoldiq = s.match(
    /^(\d+)\s*\|\s*(\d+)\s*=\s*(\d+)\s*(?:qoldiq|ostatok|остаток|qoldiqli)?\s*\?$/i,
  );
  if (qoldiq) {
    const [, A, B, Q] = qoldiq.map(Number);
    if (B === 0) return { holat: "otkazildi" };
    const kutilgan = A - B * Q;
    return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
  }

  // ── 2. Tenglik: bir tomonida `?` ──────────────────────────
  //
  // Shart QAT'IY va bu ataylab: shoxga faqat mos keladigan savol
  // kirsin. Ilgari u `=` bo'lgan har qanday matnni o'ziga olib,
  // yechа olmaganda "o'tkazildi" deb qaytarardi — natijada
  // "2x + 2,  x = 8" kabi savollar keyingi shoxgacha umuman
  // yetib bormasdi.
  const teng_ = s.split("=");
  if (
    teng_.length === 2
    && (s.match(/\?/g) ?? []).length === 1
    && sof(teng_[0]) && sof(teng_[1])
  ) {
    const [chap, ong] = teng_;
    // `?` ni javob bilan almashtiramiz — ikki tomon teng chiqsinmi.
    const c = hisobla(chap.replace("?", `(${j})`));
    const o = hisobla(ong.replace("?", `(${j})`));
    if (c !== null && o !== null) {
      return { holat: "tekshirildi", togri: teng(c, o) };
    }
    return { holat: "otkazildi" };
  }

  // ── 3. Almashtirish: "IFODA,  x = N" va "lim (IFODA),  x → N" ──
  //
  // Ikkalasi bitta mexanizm bilan tekshiriladi, chunki matematik ish
  // ham bitta: `x` o'rniga son qo'yiladi va ifoda hisoblanadi.
  // Chiziqli va ko'phadli limitda bu AYNAN to'g'ri javob beradi
  // (uzluksiz funksiya), shuning uchun 9–11-sinfning bir qismi shu
  // yo'l bilan tekshiriladi.
  const almash = s.match(/^(?:lim\s*)?(.+?)\s*,\s*x\s*(?:=|->|→)\s*(-?[\d.]+)\s*$/i);
  if (almash) {
    const [, xomIfoda, xStr] = almash;
    const x = Number(xStr);
    if (!Number.isFinite(x)) return { holat: "otkazildi" };

    let ifoda = xomIfoda.trim();
    // "y = 3x + 1" ko'rinishidagi chap tomon olib tashlanadi.
    ifoda = ifoda.replace(/^[a-z]\s*=\s*/i, "");
    // Faqat `x` harfi bo'lsin. Boshqa harf (sin, log, a, b) bo'lsa —
    // bu boshqa janr va uni matndan yechib bo'lmaydi.
    if (/[a-wyz]/i.test(ifoda.replace(/[x]/gi, ""))) return { holat: "otkazildi" };
    if (!/x/i.test(ifoda)) return { holat: "otkazildi" };

    // Yashirin ko'paytirish oshkor qilinadi: "3x" → "3*x", ")x" → ")*x",
    // "x(" → "x*(". Busiz hisoblagich "3x" ni o'qiy olmaydi.
    ifoda = ifoda
      .replace(/(\d)\s*x/gi, "$1*x")
      .replace(/\)\s*x/gi, ")*x")
      .replace(/x\s*\(/gi, "x*(")
      .replace(/\)\s*\(/g, ")*(")
      .replace(/xx+/gi, "x")
      .replace(/x/gi, `(${x})`);

    if (!sof(ifoda)) return { holat: "otkazildi" };
    const v = hisobla(ifoda);
    if (v === null) return { holat: "otkazildi" };
    return { holat: "tekshirildi", togri: teng(v, j), kutilgan: v };
  }

  // ── 4. Hosila nuqtada: "y = POLY,  y′(N) = ?" ─────────────
  const hosilaNuqta = s.match(/^y\s*=\s*(.+?),\s*y['′]\s*\(\s*(-?[\d.]+)\s*\)\s*=\s*\?$/);
  if (hosilaNuqta) {
    const p = kophadOqi(hosilaNuqta[1]);
    if (!p) return { holat: "otkazildi" };
    const x = Number(hosilaNuqta[2]);
    const kutilgan = qiymat(hosila(p), x);
    return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
  }

  // ── 5. Progressiyalar ─────────────────────────────────────
  //
  // Pastki indekslar oddiy raqamga aylantiriladi: "a₇" → "a7".
  const past = s.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)));

  // Arifmetik: n-had.  aₙ = a₁ + (n−1)d
  const ar = past.match(/^a1\s*=\s*(-?[\d.]+)\s*,\s*d\s*=\s*(-?[\d.]+)\s*\.\s*a(\d+)\s*=\s*\?$/);
  if (ar) {
    const [, a1, d, n] = ar.map(Number);
    const kutilgan = a1 + (n - 1) * d;
    return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
  }

  // Geometrik: n-had.  bₙ = b₁ · q^(n−1)
  const geo = past.match(/^b1\s*=\s*(-?[\d.]+)\s*,\s*q\s*=\s*(-?[\d.]+)\s*\.\s*b(\d+)\s*=\s*\?$/);
  if (geo) {
    const [, b1, q, n] = geo.map(Number);
    const kutilgan = b1 * q ** (n - 1);
    return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
  }

  // Arifmetik yig'indi.  Sₙ = n/2 · (2a₁ + (n−1)d)
  const arS = past.match(
    /^a1\s*=\s*(-?[\d.]+)\s*,\s*d\s*=\s*(-?[\d.]+)\s*,\s*n\s*=\s*(\d+)\s*\.\s*S\d+\s*=\s*\?$/,
  );
  if (arS) {
    const [, a1, d, n] = arS.map(Number);
    const kutilgan = (n / 2) * (2 * a1 + (n - 1) * d);
    return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
  }

  // Geometrik yig'indi.  Sₙ = b₁(qⁿ − 1)/(q − 1)
  const geoS = past.match(
    /^b1\s*=\s*(-?[\d.]+)\s*,\s*q\s*=\s*(-?[\d.]+)\s*,\s*n\s*=\s*(\d+)\s*\.\s*S\d+\s*=\s*\?$/,
  );
  if (geoS) {
    const [, b1, q, n] = geoS.map(Number);
    if (q === 1) return { holat: "otkazildi" };
    const kutilgan = (b1 * (q ** n - 1)) / (q - 1);
    return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
  }

  // ── 6. Ko'rsatkichli tenglama: "2ˣ = 32" ──────────────────
  // Javob — darajaning o'zi, ya'ni asosni javob darajasiga
  // ko'targanda o'ng tomon chiqishi kerak.
  const kors = s.replace(/ˣ/g, "^x").match(/^(-?[\d.]+)\s*\^x\s*=\s*(-?[\d.]+)$/);
  if (kors) {
    const [, asos, ong] = kors.map(Number);
    if (asos <= 0 || asos === 1) return { holat: "otkazildi" };
    return { holat: "tekshirildi", togri: teng(asos ** j, ong), kutilgan: ong };
  }

  // ── 7. Uchburchakning uchinchi burchagi ───────────────────
  // "∠A = 81°, ∠B = 44°" → 180 − 81 − 44
  const uchB = s.match(/∠[a-zа-я]\s*=\s*(\d+)°.*?∠[a-zа-я]\s*=\s*(\d+)°/i);
  if (uchB && /uchburchak|треугольник/i.test(s)) {
    const [, A, B] = uchB.map(Number);
    const kutilgan = 180 - A - B;
    return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
  }

  // ── 8. Vektor: uzunlik yoki skalyar ko'paytma ─────────────
  //
  // Ikkalasi bitta joyda, chunki ularni AJRATISH kerak: ilgari
  // uzunlik shoxi matndagi birinchi qavsni olib, skalyar ko'paytma
  // savolini ham o'ziga tortardi va "a⃗(2; −1), b⃗(6; 5)" da
  // faqat birinchi vektorning uzunligini hisoblardi.
  const vektorlar = [...s.matchAll(/⃗\s*\(\s*(-?[\d.]+(?:\s*;\s*-?[\d.]+)+)\s*\)/g)]
    .map((m) => m[1].split(";").map((x) => Number(x.trim())));

  if (vektorlar.length && vektorlar.every((v) => v.every(Number.isFinite))) {
    // Skalyar ko'paytma: ikkita vektor va ko'paytma belgisi.
    if (vektorlar.length === 2 && /[*·]/.test(s.replace(/[×∙⋅]/g, "*"))) {
      const [a, b] = vektorlar;
      if (a.length === b.length) {
        const kutilgan = a.reduce((sum, x, i) => sum + x * b[i], 0);
        return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
      }
    }
    // Uzunlik: BITTA vektor va boshqa hech narsa. Shart qat'iy —
    // matnda yana biror amal bo'lsa, nima so'ralayotgani noaniq.
    if (vektorlar.length === 1 && /^[a-z]?⃗\s*\([-\d.;\s]+\)$/i.test(s)) {
      const kutilgan = Math.sqrt(vektorlar[0].reduce((a, b) => a + b * b, 0));
      return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
    }
    return { holat: "otkazildi" };
  }

  // ── 9. To'g'ri burchakli parallelepiped diagonali ─────────
  // "a = 2, b = 3, c = 6.  d = ?" → √(a² + b² + c²)
  const diag = s.match(
    /^a\s*=\s*([\d.]+)\s*,\s*b\s*=\s*([\d.]+)\s*,\s*c\s*=\s*([\d.]+)\s*\.\s*d\s*=\s*\?$/i,
  );
  if (diag) {
    const [, a, b, c] = diag.map(Number);
    const kutilgan = Math.sqrt(a * a + b * b + c * c);
    return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
  }

  // ── 10. Pifagor — tomonlar NOMI bilan atalganda ───────────
  //
  // Faqat nom aytilgan holat olinadi. "AB = 10, BC = 21" kabi
  // yozuvlar ataylab tashqarida qoldiriladi: ulardan uchburchak
  // to'g'ri burchaklimi yoki nuqtalar bir to'g'ri chiziqdami —
  // matndan bilib bo'lmaydi.
  //
  // TOMONLARNI SANASH YETARLI EMAS — nima so'ralayotgani ham kerak.
  // Ilgari bu shox "katetlar" so'zini ko'rishi bilan ishga tushardi va
  // "Katetlar 10 va 24, gipotenuza 26.  tg α = ?" degan savolni ham
  // o'ziga tortib, gipotenuzani hisoblab, tangens javobini (5/12)
  // xato deb ko'rsatardi.
  const katetlar = s.match(/(?:katetlar|катеты)\D{0,4}([\d.]+)\D{1,6}([\d.]+)/i);
  if (katetlar && /(?:gipotenuza|гипотенуза)\s*=\s*\?/i.test(s)) {
    const [, a, b] = katetlar.map(Number);
    const kutilgan = Math.sqrt(a * a + b * b);
    return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
  }

  // ── To'g'ri burchakli uchburchakda sin, cos, tg ────────────
  //
  // "Katetlar 15 va 20,  gipotenuza 25.   sin α = ?
  //  (α — 15 katet qarshisidagi)"
  //
  // Qavs ichidagi izoh QAYSI katet qarshisida ekanini aytadi — bu
  // yerdagi butun ma'no shunda. Usiz sin va cos ni ajratib bo'lmasdi.
  const trig = s.match(
    /(?:katetlar|катеты)\D{0,4}([\d.]+)\D{1,6}([\d.]+)\D{1,14}?(?:gipotenuza|гипотенуза)\D{0,4}([\d.]+).*?\b(sin|cos|tg)\s*α\s*=\s*\?.*?([\d.]+)\s*katet/i,
  );
  if (trig) {
    const k1 = Number(trig[1]);
    const k2 = Number(trig[2]);
    const gip = Number(trig[3]);
    const nima = trig[4].toLowerCase();
    const qarshi = Number(trig[5]);
    // Qarshidagi katet qaysi biri — ikkinchisi yondoshi bo'ladi.
    const yondosh = teng(qarshi, k1) ? k2 : teng(qarshi, k2) ? k1 : null;
    if (yondosh === null || gip === 0 || yondosh === 0) return { holat: "otkazildi" };
    const kutilgan = nima === "sin" ? qarshi / gip
      : nima === "cos" ? yondosh / gip
        : qarshi / yondosh;
    return { holat: "tekshirildi", togri: tengYaxlit(kutilgan, j), kutilgan };
  }
  const gipKatet = s.match(/(?:gipotenuza|гипотенуза)\s*([\d.]+)\D{1,10}?(?:katet|катет)\D{0,4}([\d.]+)/i);
  if (gipKatet) {
    const [, c, a] = gipKatet.map(Number);
    if (c <= a) return { holat: "otkazildi" };
    const kutilgan = Math.sqrt(c * c - a * a);
    return { holat: "tekshirildi", togri: teng(kutilgan, j), kutilgan };
  }

  // ── 11. Kosinuslar teoremasi: "a = 7, b = 10, ∠C = 120°.  c² = ?"
  const kosin = s.match(
    /^a\s*=\s*([\d.]+)\s*,\s*b\s*=\s*([\d.]+)\s*,\s*∠C\s*=\s*([\d.]+)°\s*\.\s*c\^2\s*=\s*\?$/i,
  );
  if (kosin) {
    const [, a, b, C] = kosin.map(Number);
    const kutilgan = a * a + b * b - 2 * a * b * Math.cos((C * Math.PI) / 180);
    return { holat: "tekshirildi", togri: tengYaxlit(kutilgan, j), kutilgan };
  }

  // ── 12. Sinuslar teoremasi: "a = 4, ∠A = 30°, ∠B = 90°.  b = ?"
  const sinus = s.match(
    /^a\s*=\s*([\d.]+)\s*,\s*∠A\s*=\s*([\d.]+)°\s*,\s*∠B\s*=\s*([\d.]+)°\s*\.\s*b\s*=\s*\?$/i,
  );
  if (sinus) {
    const [, a, A, B] = sinus.map(Number);
    const sA = Math.sin((A * Math.PI) / 180);
    if (Math.abs(sA) < 1e-9) return { holat: "otkazildi" };
    const kutilgan = (a * Math.sin((B * Math.PI) / 180)) / sA;
    return { holat: "tekshirildi", togri: tengYaxlit(kutilgan, j), kutilgan };
  }

  // ── 13. O'xshashlik: "AB = 12, BC = 10, A₁B₁ = 36.  B₁C₁ = ?"
  //
  // Mos tomonlar nisbati teng: B₁C₁ = BC · (A₁B₁ / AB).
  const oxsh = past.match(
    /^AB\s*=\s*([\d.]+)\s*,\s*BC\s*=\s*([\d.]+)\s*,\s*A1B1\s*=\s*([\d.]+)\s*\.\s*B1C1\s*=\s*\?$/i,
  );
  if (oxsh) {
    const [, AB, BC, A1B1] = oxsh.map(Number);
    if (AB === 0) return { holat: "otkazildi" };
    const kutilgan = (BC * A1B1) / AB;
    return { holat: "tekshirildi", togri: tengYaxlit(kutilgan, j), kutilgan };
  }

  // ── 14. Gipotenuzadagi proyeksiyalar → balandlik: h = √(p·q)
  const proy = s.match(/(?:proyeksiya|проекци)\D{0,12}([\d.]+)\s*(?:va|и)\s*([\d.]+)/i);
  if (proy && /balandlik|высот/i.test(s)) {
    const [, p, q] = proy.map(Number);
    const kutilgan = Math.sqrt(p * q);
    return { holat: "tekshirildi", togri: tengYaxlit(kutilgan, j), kutilgan };
  }

  // ── 15. Bissektrisa burchakni TENG IKKIGA bo'ladi ─────────
  // "∠AOB = 118°,  OM — bissektrisa.   ∠AOM = ?" → 59
  const biss = s.match(/∠\w+\s*=\s*([\d.]+)°.*?(?:bissektrisa|биссектриса)/i);
  if (biss && /∠\w+\s*=\s*\?/.test(s)) {
    const kutilgan = Number(biss[1]) / 2;
    return { holat: "tekshirildi", togri: tengYaxlit(kutilgan, j), kutilgan };
  }

  // ── 16. Diametr va radius ─────────────────────────────────
  const dr = s.match(/^d\s*=\s*([\d.]+)\s*\.\s*r\s*=\s*\?$/i);
  if (dr) {
    const kutilgan = Number(dr[1]) / 2;
    return { holat: "tekshirildi", togri: tengYaxlit(kutilgan, j), kutilgan };
  }
  const rd = s.match(/^r\s*=\s*([\d.]+)\s*\.\s*d\s*=\s*\?$/i);
  if (rd) {
    const kutilgan = Number(rd[1]) * 2;
    return { holat: "tekshirildi", togri: tengYaxlit(kutilgan, j), kutilgan };
  }

  // ── 17. `x` li tenglama — javobni qo'yib tekshirish ───────
  //
  // "25 / (x + 6) = 5" → x o'rniga javob qo'yiladi va ikki tomon
  // solishtiriladi. Bu 2-shoxning kengaytmasi: u yerda faqat sof
  // sonli ifoda olinardi, bu yerda bitta noma'lum ham bo'ladi.
  //
  // "= 0" ko'rinishidagi tenglamalar ATAYLAB tashqarida. Ular uch xil
  // savolga tegishli bo'lishi mumkin — ildizini top, diskriminantini
  // top, nechta ildizi bor — va matndan qaysi biri ekanini bilib
  // bo'lmaydi. Tekshiruvchi "x² − 9x + 12 = 0" ni "x ni top" deb
  // o'qib, diskriminant javobini (33) xato deb ko'rsatgan edi.
  const teng2 = s.split("=");
  if (
    teng2.length === 2
    && !s.includes("?")
    && /x/i.test(s)
    && teng2[1].trim() !== "0"
  ) {
    let [chap, ong] = teng2;
    // Boshqa harf bo'lsa — bu boshqa janr (sin, log, y = ...).
    const harfsiz = (v: string) => !/[a-wyzа-я]/i.test(v.replace(/x/gi, ""));
    if (harfsiz(chap) && harfsiz(ong)) {
      const qoy = (v: string) => v
        .replace(/(\d)\s*x/gi, "$1*x")
        .replace(/\)\s*x/gi, ")*x")
        .replace(/x\s*\(/gi, "x*(")
        .replace(/x/gi, `(${j})`);
      chap = qoy(chap); ong = qoy(ong);
      if (sof(chap) && sof(ong)) {
        const c = hisobla(chap);
        const o = hisobla(ong);
        if (c !== null && o !== null) {
          return { holat: "tekshirildi", togri: teng(c, o) };
        }
      }
    }
  }

  return { holat: "otkazildi" };
}

/* ==================== ma'lumotdan tekshirish ====================
 *
 * Kichik sinflarda savol MATNI hech narsa aytmaydi: "Nechta?",
 * "Qaysi biri ortiqcha?", "Soat nechi?". Yechim rasmda, matnda emas —
 * shuning uchun yuqoridagi hisoblagich ularni umuman ololmaydi va
 * maktabgacha guruh 9% da qolgan edi.
 *
 * Lekin savol o'zi bilan MA'LUMOT olib yuradi: nechta narsa
 * chizilishi, qaysi amal bajarilishi, to'rtburchakning tomonlari.
 * Ekran aynan shu ma'lumotni chizadi. Demak javobni o'sha
 * ma'lumotdan qayta hisoblash mumkin.
 *
 * BU HAM MUSTAQIL TEKSHIRUV. Generator `answer` ni o'z formulasi
 * bilan hisoblaydi; bu yerda esa u EKRANGA CHIQARADIGAN sonlardan
 * qayta hisoblanadi. Formulada xato bo'lsa — masalan `op: "+"` yozib,
 * `answer: a - b` bergan bo'lsa — ikkisi bir-biriga to'g'ri kelmaydi.
 *
 * NIMA OLINMAYDI. Javobning o'zi ma'lumot maydonining nusxasi bo'lgan
 * turlar (`rasm`, `belgi`, `rang`) ATAYLAB tashqarida: ularda
 * "answer === emoji" degan tekshiruv har doim to'g'ri chiqadi va hech
 * narsani isbotlamaydi. Qamrov foizini bunday tekshiruv bilan
 * ko'tarish — o'zini aldash.
 */

/** Ikki tomonli nomni solishtiradi (o'zbekcha yoki ruscha bo'lishi mumkin). */
const nomTeng = (javob: string, uz: string, ru: string) => {
  const n = (x: string) => x.trim().toLowerCase();
  return n(javob) === n(uz) || n(javob) === n(ru);
};

function malumotTekshir(a: Activity): Natija {
  const j = a.answer;
  const son = Number(j);
  const sonTeng = (kutilgan: number): Natija =>
    ({ holat: "tekshirildi", togri: Number.isFinite(son) && teng(kutilgan, son), kutilgan });

  switch (a.type) {
    // Nechta narsa chizilsa, javob ham shuncha bo'lishi kerak.
    case "count": return sonTeng(a.n);

    // Ustunda yozilgan AMAL bajarilishi kerak. Bu yerda haqiqiy xavf
    // bor: `op` va `answer` ikki xil joyda yoziladi.
    case "column": return sonTeng(a.op === "+" ? a.a + a.b : a.a - a.b);

    case "perim": return sonTeng(2 * (a.w + a.h));
    case "area": return sonTeng(a.w * a.h);
    case "tens": return sonTeng(a.tens * 10 + a.units);

    /*
     * Taqqoslash — UCH XIL savol, bitta ma'lumot.
     *
     * `plus` bayrog'i yig'indini bildiradi, lekin qolgan ikkitasi
     * ("qayerda ko'p?" va "qayerda kam?") ma'lumotda farqlanmaydi:
     * ikkalasida ham `a` va `b` turadi. Farq faqat SAVOLDA.
     *
     * Shuning uchun bu yerda savol matni o'qiladi. Bu hamon mustaqil
     * tekshiruv: savol nimani so'rayotgani matndan, javob esa
     * ma'lumotdan olinadi — generatorning hisobi ikkalasiga ham
     * aralashmaydi.
     *
     * Ilgari bu yerda doim kattasi olinardi va "Где меньше?" degan
     * savollar xato deb ko'rsatilardi.
     */
    case "cmpvis": {
      if (a.plus) return sonTeng(a.a + a.b);
      const savol = String(a.prompt ?? "");
      if (/kam|меньше/i.test(savol)) return sonTeng(Math.min(a.a, a.b));
      if (/ko'p|kop|больше/i.test(savol)) return sonTeng(Math.max(a.a, a.b));
      // Savol tanish emas — taxmin qilmaymiz.
      return { holat: "otkazildi" };
    }
    case "ayirvis": return sonTeng(a.n - a.k);
    case "mulvis": return sonTeng(a.g * a.k);

    // Yashirilgan katakdagi son.
    case "numray":
      if (a.hide < 0 || a.hide >= a.arr.length) return { holat: "otkazildi" };
      return sonTeng(a.arr[a.hide]);

    // Burchaklar soni — jadvaldan, generatorning hisobidan emas.
    case "corners": return sonTeng(SHAPES[a.shape].corners);

    case "shapeName": {
      const s = SHAPES[a.shape];
      return { holat: "tekshirildi", togri: nomTeng(String(j), s.name, s.nameRu) };
    }

    // Ortiqchasi — belgilangan o'rindagi narsa.
    case "odd":
      if (a.odd < 0 || a.odd >= a.items.length) return { holat: "otkazildi" };
      return { holat: "tekshirildi", togri: String(j) === a.items[a.odd] };

    case "clock": {
      const kutilgan = `${a.h}:${String(a.m).padStart(2, "0")}`;
      return { holat: "tekshirildi", togri: String(j).trim() === kutilgan };
    }

    /*
     * Qolganlari ataylab tashqarida:
     *
     *   rasm, belgi, rang   javob ma'lumot maydonining nusxasi —
     *                       tekshiruv hech narsa isbotlamaydi
     *   divvis              `g` va `k` ning ma'nosi matnga bog'liq;
     *                       taxmin qilib qoida yozish xato bo'lardi
     *   coord, pos, data,   savol matniga qarab har xil narsa
     *   naqsh, frac         so'raladi
     */
    default: return { holat: "otkazildi" };
  }
}

/**
 * Javobi IFODA bo'lgan savol — hozircha faqat hosila.
 *
 * Alohida funksiya, chunki `savolniTekshir` javobni son deb boshlaydi
 * va bu yerda u ko'phad ("24x²", "4x + 3").
 *
 * FARQLASH BELGISI — javobning o'zi. "y = 2x² − 8x − 3" degan matn
 * uch xil savolga tegishli bo'lishi mumkin (uchi qayerda, tarmoqlari
 * qayoqqa, hosilasi nima) va matndan qaysi biri ekanini bilib
 * bo'lmaydi. Lekin javob ko'phad bo'lsa — bu HOSILA: uchining
 * koordinatasi son, tarmoq yo'nalishi esa so'z.
 */
function ifodaliTekshir(matn: string, javob: unknown): Natija {
  const s = tozala(matn);
  const j = String(javob);
  // Javobda `x` bo'lmasa — bu ko'phad emas, boshqa shox bilan ishlanadi.
  if (!/x/i.test(j)) return { holat: "otkazildi" };

  const jp = kophadOqi(j);
  if (!jp || jp.size === 0) return { holat: "otkazildi" };

  // "y = POLY" yoki "y = POLY,  y′ = ?"
  const m = s.match(/^y\s*=\s*([^,]+?)\s*(?:,\s*y['′]\s*=\s*\?)?$/);
  if (!m) return { holat: "otkazildi" };

  const p = kophadOqi(m[1]);
  if (!p || p.size === 0) return { holat: "otkazildi" };

  return { holat: "tekshirildi", togri: kophadTeng(hosila(p), jp) };
}

/* ==================== tekshiruvchining o'z sinovi ====================
 *
 * TEKSHIRUVCHI HAM XATO QILADI va bu yozilayotganda ikki marta
 * isbotlandi: birinchi variantda `1/4 ÷ 1/4` noto'g'ri hisoblangan,
 * ikkinchisida `−x²` ni `(−x)²` deb o'qigan. Ikkalasi ham TO'G'RI
 * savollarni "xato" deb ko'rsatgan edi.
 *
 * Bunday yolg'on ogohlantirish oddiy xatodan yomonroq: bir necha
 * marta bo'lsa, ro'yxatga ishonch qolmaydi va haqiqiy xato ham
 * e'tiborsiz qoladi. Shuning uchun hisoblagich har ishga tushishda
 * o'zini sinab ko'radi.
 */
const OZSINOV: [string, number, boolean][] = [
  ["73 + 8 = ?", 81, true],
  ["73 + 8 = ?", 80, false],
  ["92 = 90 + ?", 2, true],
  ["(9 + 7) * 8 = ?", 128, true],
  ["3 + 5 · 5 = ?", 28, true],          // ko'paytirish oldin
  ["1/4 ÷ 1/4 = ?", 1, true],           // kasr chizig'i ÷ dan kuchli
  ["3/4 ÷ 3/4 = ?", 1, true],
  ["220 ÷ 22 = ?", 10, true],
  ["47 ÷ 9 = 5   qoldiq ?", 2, true],
  ["2x + 2,   x = 8", 18, true],
  ["y = −x² − 2x − 5,   x = −5", -20, true],   // minus darajadan keyin
  ["y = −x² + 6x − 5,   x = 2", 3, true],
  ["lim (4x − 9),   x → 4", 7, true],
  ["lim (−4x + 1),   x → 4", -15, true],
  ["32^(1/3) = ?", 3, false],           // ∛32 = 3,17 — butun emas
  ["4^(1/2) = ?", 2, true],
  // hosila nuqtada
  ["y = x² + 7x,   y′(4) = ?", 15, true],
  ["y = 5x² − 7x,   y′(−1) = ?", -17, true],
  ["y = 4x² + 5x,   y′(−3) = ?", -19, true],
  ["y = x² + 7x,   y′(4) = ?", 14, false],
  // progressiyalar
  ["a₁ = −3, d = 8. a₇ = ?", 45, true],
  ["b₁ = 3, q = 2. b₄ = ?", 24, true],
  ["a₁ = 3,  d = 4,  n = 10.   S₁₀ = ?", 210, true],
  ["b₁ = 4,  q = 3,  n = 4.   S₄ = ?", 160, true],
  ["a₁ = −3, d = 8. a₇ = ?", 44, false],
  // ko'rsatkichli tenglama
  ["2ˣ = 32", 5, true],
  ["3ˣ = 81", 4, true],
  ["2ˣ = 32", 4, false],
  // uchburchakning uchinchi burchagi
  ["В треугольнике ABC ∠A = 81°, ∠B = 44°", 55, true],
  ["В треугольнике ABC ∠A = 81°, ∠B = 44°", 54, false],
  // vektor uzunligi
  ["a⃗(12; 16)", 20, true],
  ["a⃗(−4; 4; 7)", 9, true],
  ["a⃗(3; 4)", 5, true],
  ["a⃗(3; 4)", 7, false],
  // parallelepiped diagonali
  ["a = 2, b = 3, c = 6.   d = ?", 7, true],
  ["a = 2, b = 3, c = 6.   d = ?", 11, false],
  // Pifagor — nomi bilan
  ["Катеты: 3 и 4. Гипотенуза = ?", 5, true],
  ["Гипотенуза 13, катет 5. Второй катет = ?", 12, true],
  ["Катеты: 3 и 4. Гипотенуза = ?", 7, false],
  // x li tenglama
  ["25 / (x + 6) = 5", -1, true],
  ["25 / (x + 6) = 5", 1, false],
  // skalyar ko'paytma
  ["a⃗(2; −1),  b⃗(6; 5).   a⃗ · b⃗ = ?", 7, true],
  ["a⃗(2; 2),  b⃗(0; 1).   a⃗ · b⃗ = ?", 2, true],
  ["a⃗(2; −1),  b⃗(6; 5).   a⃗ · b⃗ = ?", 17, false],
  // kosinuslar teoremasi
  ["a = 7,  b = 10,  ∠C = 120°.   c² = ?", 219, true],
  ["a = 9,  b = 12,  ∠C = 90°.   c² = ?", 225, true],
  ["a = 7,  b = 10,  ∠C = 120°.   c² = ?", 149, false],
  // sinuslar teoremasi
  ["a = 4,  ∠A = 30°,  ∠B = 90°.   b = ?", 8, true],
  ["a = 17,  ∠A = 30°,  ∠B = 90°.   b = ?", 34, true],
  ["a = 4,  ∠A = 30°,  ∠B = 90°.   b = ?", 2, false],
  // o'xshashlik
  ["AB = 12,  BC = 10,  A₁B₁ = 36.   B₁C₁ = ?", 30, true],
  ["AB = 12,  BC = 10,  A₁B₁ = 36.   B₁C₁ = ?", 20, false],
  // gipotenuzadagi proyeksiyalar
  ["Gipotenuzadagi proyeksiyalar: 4 va 25.   Balandlik = ?", 10, true],
  ["Gipotenuzadagi proyeksiyalar: 4 va 25.   Balandlik = ?", 14, false],
  // bissektrisa
  ["∠AOB = 118°,  OM — bissektrisa.   ∠AOM = ?", 59, true],
  ["∠AOB = 46°,  OM — bissektrisa.   ∠AOM = ?", 23, true],
  ["∠AOB = 118°,  OM — bissektrisa.   ∠AOM = ?", 118, false],
  // diametr va radius
  ["d = 42.   r = ?", 21, true],
  ["r = 10.   d = ?", 20, true],
  ["d = 42.   r = ?", 42, false],
  // kasr javob — "21/20" kabi
  ["2/8 + 4/5 = ?", 1.05, true],
  ["√256 = ?", 16, true],
  ["√256 = ?", 15, false],
  // to'g'ri burchakli uchburchakda trigonometriya
  ["Katetlar 15 va 20,  gipotenuza 25.   sin α = ?   (α — 15 katet qarshisidagi)", 0.6, true],
  ["Katetlar 15 va 20,  gipotenuza 25.   cos α = ?   (α — 15 katet qarshisidagi)", 0.8, true],
  ["Katetlar 10 va 24,  gipotenuza 26.   tg α = ?   (α — 10 katet qarshisidagi)", 10 / 24, true],
  ["Katetlar 15 va 20,  gipotenuza 25.   sin α = ?   (α — 15 katet qarshisidagi)", 0.8, false],
];

/**
 * Tekshiruvdan CHETDA qolishi kerak bo'lgan savollar.
 *
 * Bu ro'yxat ham sinovning bir qismi: qaysi savolni tekshirib
 * BO'LMASLIGINI bilish, tekshirilganini bilish bilan barobar. Har biri
 * bir vaqtlar yolg'on ogohlantirish bergan.
 */
const OZSINOV_CHETDA: [string, unknown][] = [
  // Diskriminant — savol "x ni top" emas.
  ["x² − 9x + 12 = 0", 33],
  ["x² + 9x + 9 = 0", 45],
  // Matnli masala — matndan yechilmaydi.
  ["4 рубашек, 3 брюк, 3 шляп", 36],
  // So'z bilan javob.
  ["y = −3x²", "вниз"],
];

/**
 * Ma'lumotdan tekshiriladigan holatlar.
 *
 * Turlari `Activity` bo'lgani uchun alohida ro'yxat. Har biri bir
 * vaqtlar xato bergan yoki berishi mumkin bo'lgan joy.
 */
const OZSINOV_MALUMOT: [Partial<Activity> & { type: string }, boolean][] = [
  // Ustundagi amal — `op` va `answer` ikki xil joyda yoziladi.
  [{ type: "column", op: "+", a: 54, b: 23, answer: 77 }, true],
  [{ type: "column", op: "−", a: 54, b: 23, answer: 31 }, true],
  [{ type: "column", op: "+", a: 54, b: 23, answer: 31 }, false],
  [{ type: "column", op: "−", a: 54, b: 23, answer: 77 }, false],

  [{ type: "count", emoji: "🍎", n: 3, answer: 3 }, true],
  [{ type: "count", emoji: "🍎", n: 3, answer: 4 }, false],

  [{ type: "perim", w: 9, h: 7, answer: 32 }, true],
  [{ type: "perim", w: 9, h: 7, answer: 63 }, false],   // yuza bilan almashib ketgan
  [{ type: "area", w: 5, h: 2, answer: 10 }, true],
  [{ type: "area", w: 5, h: 2, answer: 14 }, false],    // perimetr bilan almashib ketgan

  [{ type: "tens", tens: 1, units: 6, answer: 16 }, true],
  [{ type: "tens", tens: 1, units: 6, answer: 7 }, false],

  // Taqqoslash — savolga qarab kattasi yoki kichigi.
  [{ type: "cmpvis", a: 1, b: 3, emoji: "🚗", answer: 3, prompt: "Где больше? Сколько?" }, true],
  [{ type: "cmpvis", a: 1, b: 3, emoji: "🚗", answer: 1, prompt: "Где меньше? Сколько?" }, true],
  [{ type: "cmpvis", a: 1, b: 3, emoji: "🚗", answer: 3, prompt: "Где меньше? Сколько?" }, false],
  [{ type: "cmpvis", a: 1, b: 3, emoji: "🚗", answer: 4, prompt: "Nechta?", plus: true }, true],

  [{ type: "ayirvis", n: 3, k: 1, emoji: "🐝", answer: 2 }, true],
  [{ type: "ayirvis", n: 3, k: 1, emoji: "🐝", answer: 4 }, false],
  [{ type: "mulvis", g: 2, k: 3, emoji: "🍎", answer: 6 }, true],
  [{ type: "mulvis", g: 2, k: 3, emoji: "🍎", answer: 5 }, false],

  [{ type: "numray", arr: [1, 2, 3, 4, 5], hide: 1, answer: 2 }, true],
  [{ type: "numray", arr: [1, 2, 3, 4, 5], hide: 1, answer: 3 }, false],

  [{ type: "corners", shape: "pentagon", answer: 5 }, true],
  [{ type: "corners", shape: "circle", answer: 0 }, true],
  [{ type: "corners", shape: "pentagon", answer: 4 }, false],

  [{ type: "odd", items: ["👕", "🌷", "🌹", "🌼"], odd: 0, answer: "👕" }, true],
  [{ type: "odd", items: ["👕", "🌷", "🌹", "🌼"], odd: 0, answer: "🌷" }, false],

  [{ type: "clock", h: 1, m: 15, answer: "1:15" }, true],
  [{ type: "clock", h: 12, m: 5, answer: "12:05" }, true],
  [{ type: "clock", h: 1, m: 15, answer: "1:51" }, false],
];

/** Javobi IFODA bo'lgan holatlar — alohida ro'yxat. */
const OZSINOV_IFODA: [string, string, boolean][] = [
  ["y = 8x³", "24x²", true],
  ["y = 5x⁶", "30x⁵", true],
  ["y = 2x²", "4x", true],
  ["y = 2x² + 3x + 2", "4x + 3", true],
  ["y = 6x² + 3x − 4", "12x + 3", true],
  ["y = 8x³", "24x³", false],       // daraja kamaymagan
  ["y = 8x³", "8x²", false],        // koeffitsiyent ko'paymagan
];

let ozXato = 0;
for (const [matn, javob, kutilgan] of OZSINOV) {
  const r = savolniTekshir(matn, javob);
  if (r.holat !== "tekshirildi") {
    ozXato++;
    console.log(`❌ o'z sinovi: "${matn}" tekshirilmadi (o'tkazib yuborildi)`);
  } else if (r.togri !== kutilgan) {
    ozXato++;
    console.log(
      `❌ o'z sinovi: "${matn}" → ${javob} — `
      + `kutilgan ${kutilgan ? "to'g'ri" : "xato"}, chiqdi ${r.togri ? "to'g'ri" : "xato"}`,
    );
  }
}
for (const [matn, javob, kutilgan] of OZSINOV_IFODA) {
  const r = ifodaliTekshir(matn, javob);
  if (r.holat !== "tekshirildi") {
    ozXato++;
    console.log(`❌ o'z sinovi (ifoda): "${matn}" → ${javob} tekshirilmadi`);
  } else if (r.togri !== kutilgan) {
    ozXato++;
    console.log(
      `❌ o'z sinovi (ifoda): "${matn}" → ${javob} — `
      + `kutilgan ${kutilgan ? "to'g'ri" : "xato"}, chiqdi ${r.togri ? "to'g'ri" : "xato"}`,
    );
  }
}

for (const [xom, kutilgan] of OZSINOV_MALUMOT) {
  const a = xom as Activity;
  const r = malumotTekshir(a);
  const nom = `${a.type} ${JSON.stringify(a.answer)}`;
  if (r.holat !== "tekshirildi") {
    ozXato++;
    console.log(`❌ o'z sinovi (ma'lumot): ${nom} tekshirilmadi`);
  } else if (r.togri !== kutilgan) {
    ozXato++;
    console.log(
      `❌ o'z sinovi (ma'lumot): ${nom} — `
      + `kutilgan ${kutilgan ? "to'g'ri" : "xato"}, chiqdi ${r.togri ? "to'g'ri" : "xato"}`,
    );
  }
}

for (const [matn, javob] of OZSINOV_CHETDA) {
  const a = savolniTekshir(matn, javob);
  const b = a.holat === "otkazildi" ? ifodaliTekshir(matn, javob) : a;
  if (b.holat !== "otkazildi") {
    ozXato++;
    console.log(
      `❌ o'z sinovi (chetda): "${matn}" tekshirilmasligi kerak edi, `
      + `lekin "${b.togri ? "to'g'ri" : "XATO"}" deb baholandi`,
    );
  }
}

if (ozXato) {
  console.log(`\n❌ hisoblagichning o'zi ishonchsiz (${ozXato} ta) — natijaga ishonib bo'lmaydi\n`);
  process.exit(1);
}

/* ==================== yurgizish ==================== */

interface Xato {
  joy: string;
  matn: string;
  javob: string;
}

const xatolar: Xato[] = [];
let tekshirildi = 0;
let otkazildi = 0;
const sinfQamrov = new Map<number, { t: number; o: number }>();

for (const c of COURSES) {
  for (const [ui, U] of c.units.entries()) {
    for (const [li, L] of U.lessons.entries()) {
      for (const gen of L.gens) {
        for (let k = 0; k < TAKROR; k++) {
          let a;
          try { a = gen(); } catch { break; }
          const matn = (a as { text?: string }).text ?? a.prompt ?? "";
          if (!matn) { otkazildi++; continue; }

          let r = savolniTekshir(matn, a.answer);
          // Sonli shox o'tkazib yuborgan bo'lsa — javob ifoda
          // bo'lishi mumkin (hosila). Ikkinchi urinish shu yerda.
          if (r.holat === "otkazildi") r = ifodaliTekshir(matn, a.answer);
          // Matndan yechilmasa — savolning O'Z MA'LUMOTIDAN.
          // Kichik sinflarda yechim rasmda, matnda emas.
          if (r.holat === "otkazildi") r = malumotTekshir(a);
          const q = sinfQamrov.get(c.grade) ?? { t: 0, o: 0 };
          if (r.holat === "otkazildi") {
            otkazildi++;
            q.o++;
          } else {
            tekshirildi++;
            q.t++;
            if (!r.togri && xatolar.length < 400) {
              xatolar.push({
                joy: `${c.slug} ${ui}-${li} "${L.n}"`,
                matn,
                javob: String(a.answer),
              });
            }
          }
          sinfQamrov.set(c.grade, q);
        }
      }
    }
  }
}

console.log("\nSavol to'g'rimi — mustaqil tekshiruv\n");
console.log("  Savol matni o'qiladi va javob BOSHQA yo'ldan hisoblanadi.");
console.log("  Generator kodidan hech narsa ishlatilmaydi.\n");

console.log("  sinf    tekshirildi   tashqarida");
for (const [g, q] of [...sinfQamrov].sort((a, b) => a[0] - b[0])) {
  const foiz = Math.round((q.t / (q.t + q.o)) * 100);
  console.log(
    `  ${String(g).padStart(4)}  ${String(q.t).padStart(11)}  ${String(q.o).padStart(11)}   ${String(foiz).padStart(3)}%`,
  );
}

const jami = tekshirildi + otkazildi;
console.log(
  `\n  jami ${jami} ta savol · ${tekshirildi} tasi tekshirildi `
  + `(${Math.round((tekshirildi / jami) * 100)}%)`,
);

// Bir xil generator o'nlab marta chaqiriladi — ro'yxat joyi bo'yicha
// siqiladi, aks holda bitta xato ekranni to'ldirib yuborardi.
const guruh = new Map<string, Xato>();
for (const x of xatolar) if (!guruh.has(x.joy)) guruh.set(x.joy, x);

if (guruh.size) {
  console.log(`\n❌ ${xatolar.length} nomuvofiqlik (${guruh.size} xil joyda):\n`);
  for (const x of [...guruh.values()].slice(0, 30)) {
    console.log(`   ${x.joy}`);
    console.log(`     "${x.matn}"  →  javob: ${x.javob}\n`);
  }
  console.log("  Diqqat: bu ro'yxat AVTOMATIK xato degani emas — matnni");
  console.log("  tekshiruvchi noto'g'ri o'qigan bo'lishi ham mumkin. Har");
  console.log("  birini odam ko'rib chiqishi kerak.\n");
  process.exit(1);
}

console.log("\n✅ tekshirilgan savollarning hammasi to'g'ri\n");
console.log("  Eslatma: tekshiruvdan tashqarida qolgan savollar (matnli");
console.log("  masala, chizma, hosila) bu yerda EMAS. Ular uchun");
console.log("  `scripts/namuna.ts` va odam ko'rigi kerak.\n");
