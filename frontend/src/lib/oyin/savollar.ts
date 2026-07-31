/**
 * Oqim o'yinlarining savol yasovchilari — oltitasi bir faylda.
 *
 * Hammasi bir imzoga bo'ysunadi: `(daraja) => OqimSavol`. Shu sabab
 * o'yin ekrani (`components/oyin/Oqim.tsx`) qaysi o'yin ekanini
 * BILMAYDI — u faqat savol so'raydi va javobni tekshiradi. Yangi oqim
 * o'yini qo'shish uchun shu yerga bitta funksiya yozib, `index.ts` ga
 * qator qo'shish kifoya.
 *
 * ─────────────────────── UCH DARAJA QOIDASI ───────────────────────
 *
 * Har generator `d` ni oladi va uchta boshqa-boshqa savol to'plamidan
 * bittasini beradi. Daraja SAVOL TURINI o'zgartiradi, faqat sonlarni
 * kattalashtirmaydi — bu muhim farq: 1-darajadagi "6 + 5" ning sonlarini
 * o'stirib "634 + 512" qilsak, u qiyin emas, shunchaki ZERIKARLI bo'lardi.
 * Uchinchi daraja esa boshqa MAVZUGA o'tadi (foiz, daraja, tenglama
 * tizimi) — o'shanda kattaga qiziq bo'ladi.
 *
 * ────────────────────── JAVOB YAGONA BO'LSIN ──────────────────────
 *
 * Ikki generatorda (`belgi`, `taxmin`) to'g'ri javob tasodifan ikkita
 * bo'lib qolishi mumkin edi. Ikkalasida ham savol yasalgandan KEYIN
 * tekshiriladi va shart buzilsa qaytadan yasaladi. Busiz o'yin ba'zan
 * to'g'ri javobni "xato" deb ko'rsatardi — va bunday xato o'yinga bo'lgan
 * ishonchni butunlay yo'q qiladi.
 */
import { pick, rnd, shuffle } from "../rnd";
import type { Daraja, OqimSavol } from "./tur";

/** "To'g'rimi?" o'yinining ikki tugmasi. Belgining o'zi javob bo'lib yuradi. */
export const HA = "✅";
export const YOQ = "❌";

/* ------------------------------------------------------------------ */
/*                            yordamchilar                            */
/* ------------------------------------------------------------------ */

/**
 * Sonni ko'rsatish uchun matn.
 *
 * Ikki ish qiladi: kasr qismidagi ortiqcha nolni olib tashlaydi va
 * minusni TIPOGRAFIK belgiga (−, U+2212) almashtiradi. Ikkinchisi
 * mayda ko'rinadi, lekin "3 − 1" va "-31" bir ekranda turganda farqi
 * darrov seziladi: klaviaturadagi defis kalta va yuqoriroq turadi,
 * ya'ni bir savolda ikki xil "minus" ko'rinib qolardi.
 */
const son = (v: number): string =>
  (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(2)))).replace("-", "−");

/**
 * To'g'ri javob + uchta chalg'ituvchi, aralashtirilgan holda.
 *
 * Chalg'ituvchilar YETMASA yaqin sonlar bilan to'ldiriladi — aks holda
 * tugmalar soni savoldan savolga o'zgarib, setka sakrab turardi.
 */
function tanlov(togri: number, xato: number[]): string[] {
  const s: number[] = [];
  for (const x of xato) {
    if (x !== togri && !s.includes(x)) s.push(x);
    if (s.length === 3) break;
  }
  let k = 1;
  while (s.length < 3 && k < 60) {
    const v = togri + (k % 2 ? k : -k);
    if (v !== togri && v > 0 && !s.includes(v)) s.push(v);
    k++;
  }
  return shuffle([togri, ...s]).map(son);
}

/* ------------------------------------------------------------------ */
/*                     1. Tezkor hisob — "To'g'rimi?"                 */
/* ------------------------------------------------------------------ */

/**
 * Ifoda va uning HAQIQIY qiymati.
 *
 * Uch daraja uch xil matematika:
 *   1  10–20 ichida qo'shish va ayirish
 *   2  ko'paytirish jadvali, aniq bo'lish, ikki xonali qo'shish
 *   3  foiz, daraja va amallar TARTIBI (bu yerda ko'pchilik yanglishadi)
 */
function tezkorIfoda(d: Daraja): [string, number] {
  if (d === 1) {
    if (Math.random() < 0.5) {
      const a = rnd(2, 10), b = rnd(2, 10);
      return [`${a} + ${b}`, a + b];
    }
    const a = rnd(6, 20), b = rnd(1, a - 1);
    return [`${a} − ${b}`, a - b];
  }

  if (d === 2) {
    const tur = rnd(1, 3);
    if (tur === 1) {
      const a = rnd(3, 10), b = rnd(3, 10);
      return [`${a} × ${b}`, a * b];
    }
    if (tur === 2) {
      // Bo'lish DOIM butun chiqadi: kasr javob bu darajada savolni
      // hisoblash emas, taxmin qilish o'yiniga aylantirardi.
      const b = rnd(3, 12), j = rnd(3, 12);
      return [`${b * j} ÷ ${b}`, j];
    }
    const a = rnd(21, 89), b = rnd(11, 79);
    return Math.random() < 0.5
      ? [`${a} + ${b}`, a + b]
      : [`${a + b} − ${b}`, a];
  }

  // 3-daraja
  const tur = rnd(1, 3);
  if (tur === 1) {
    // Foiz: `n` yigirmaga, `p` beshga karrali — javob doim butun chiqadi.
    const p = pick([5, 10, 15, 20, 25, 40, 50, 75]);
    const n = rnd(1, 12) * 20;
    return [`${p}% · ${n}`, (p * n) / 100];
  }
  if (tur === 2) {
    const a = rnd(2, 9), b = rnd(2, 9);
    return [`${a}² + ${b}²`, a * a + b * b];
  }
  // Amallar tartibi — ko'paytirish qo'shishdan OLDIN bajariladi.
  const a = rnd(2, 15), b = rnd(2, 9), c = rnd(2, 9);
  return [`${a} + ${b} × ${c}`, a + b * c];
}

/** Haqiqiy javobga yaqin, lekin BOSHQA son — "xato" holati uchun. */
function buz(v: number): number {
  for (let i = 0; i < 40; i++) {
    const siljish = pick([1, 1, 2, 2, 3, 4, 5, 9, 10, 20]) * (Math.random() < 0.5 ? -1 : 1);
    const x = v + siljish;
    // Manfiy javob faqat manfiy savolda ma'noli. Musbat ifodaga manfiy
    // "javob" ko'rsatilsa, uni hisoblamay ham xato deb bilib bo'ladi.
    if (x !== v && (v < 0 || x >= 0)) return x;
  }
  return v + 1;
}

export function tezkor(d: Daraja): OqimSavol {
  const [ifoda, qiymat] = tezkorIfoda(d);
  // Yarmida to'g'ri, yarmida buzilgan javob ko'rsatiladi. Nisbat teng
  // bo'lishi shart: bir tomonga og'sa, o'yinchi hisoblamay, doim bitta
  // tugmani bosib ham ball yig'a boshlardi.
  const togri = Math.random() < 0.5;
  return {
    matn: `${ifoda} = ${son(togri ? qiymat : buz(qiymat))}`,
    variantlar: [HA, YOQ],
    javob: togri ? HA : YOQ,
  };
}

/* ------------------------------------------------------------------ */
/*                        2. Yashirin amal                            */
/* ------------------------------------------------------------------ */

const AMALLAR = ["+", "−", "×", "÷"] as const;
type Amal = (typeof AMALLAR)[number];

const hisobla = (a: number, amal: Amal, b: number): number =>
  amal === "+" ? a + b : amal === "−" ? a - b : amal === "×" ? a * b : a / b;

/**
 * `a ? b = c` — qaysi amal?
 *
 * Savol yasalgandan keyin QOLGAN UCH AMAL ham tekshiriladi: birortasi
 * ham xuddi shu natijani bersa, savol tashlab yuborilib qaytadan
 * yasaladi. Bunday to'qnashuv kam uchraydi, lekin uchraydi —
 * `2 × 2 = 4` va `2 + 2 = 4` eng mashhur misoli.
 */
export function belgi(d: Daraja): OqimSavol {
  for (let urinish = 0; urinish < 60; urinish++) {
    let a: number, b: number, amal: Amal;

    if (d === 1) {
      amal = pick(["+", "−"] as const);
      if (amal === "+") { a = rnd(2, 12); b = rnd(2, 12); }
      else { a = rnd(4, 20); b = rnd(1, a - 1); }
    } else if (d === 2) {
      amal = pick(AMALLAR);
      if (amal === "+") { a = rnd(6, 40); b = rnd(4, 30); }
      else if (amal === "−") { a = rnd(10, 60); b = rnd(2, a - 2); }
      else if (amal === "×") { a = rnd(3, 12); b = rnd(3, 12); }
      else { b = rnd(3, 12); a = b * rnd(2, 12); }
    } else {
      // 3-daraja: manfiy son va kasr javob. Bu yerda "amal ma'nosi"
      // sinaladi — manfiyni manfiyga ko'paytirsa musbat chiqishini
      // bilmagan odam bu savolda to'xtaydi.
      const tur = rnd(1, 3);
      if (tur === 1) { amal = "×"; a = -rnd(2, 12); b = rnd(2, 12); }
      else if (tur === 2) { amal = "+"; a = -rnd(3, 20); b = -rnd(3, 20); }
      else { amal = "÷"; a = rnd(1, 9); b = pick([2, 4, 5, 8, 10, 20]); }
    }

    const c = hisobla(a, amal, b);
    if (!Number.isFinite(c)) continue;

    // Javob YAGONA bo'lsin: boshqa amal ham shu natijani bersa — qaytadan.
    const teng = AMALLAR.filter((x) => {
      const v = hisobla(a, x, b);
      return Number.isFinite(v) && Math.abs(v - c) < 1e-9;
    });
    if (teng.length !== 1) continue;

    return {
      // Manfiy son QAVS ichida: "−13 − −18" degan qator o'qilmaydi,
      // "(−13) ? (−18)" esa savolning qayerdaligini darrov ko'rsatadi.
      matn: `${a < 0 ? `(${son(a)})` : a}  ?  ${b < 0 ? `(${son(b)})` : b}  =  ${son(c)}`,
      variantlar: [...AMALLAR],
      javob: amal,
      belgi: true,
    };
  }
  // Bu yerga deyarli hech qachon yetib kelinmaydi, lekin o'yin savolsiz
  // qolmasligi kerak — eng sodda holat qaytariladi.
  return { matn: "6  ?  3  =  9", variantlar: [...AMALLAR], javob: "+", belgi: true };
}

/* ------------------------------------------------------------------ */
/*                     3. Ko'paytirish jadvali                        */
/* ------------------------------------------------------------------ */

/**
 * Uch ko'rinish: `a × b = ?`, `a × ? = c`, `c ÷ a = ?`.
 *
 * Yashirin KO'PAYTUVCHI (`a × ? = c`) ataylab bor: jadvalni to'g'ri
 * yo'nalishda yod olgan bola teskarisida ko'pincha to'xtab qoladi, ya'ni
 * u jadvalni emas, ketma-ketlikni yodlagan bo'ladi.
 */
export function jadval(d: Daraja): OqimSavol {
  const [lo, hi] = d === 1 ? [2, 5] : d === 2 ? [2, 10] : [11, 19];
  const a = rnd(lo, hi);
  const b = d === 3 ? rnd(11, 19) : rnd(2, 10);
  const c = a * b;

  // Chalg'ituvchilar YAQIN ko'paytmalardan olinadi: tasodifiy sonlar
  // bo'lsa, to'g'ri javob "eng mantiqiysi" bo'lib ko'zga tashlanib
  // qolardi va savolni hisoblamay ham yechish mumkin bo'lardi.
  const yaqin = [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, c + 10, c - 10];

  const tur = d === 1 ? 1 : rnd(1, 3);
  if (tur === 1) {
    return { matn: `${a} × ${b} = ?`, variantlar: tanlov(c, shuffle(yaqin)), javob: son(c) };
  }
  if (tur === 2) {
    return {
      matn: `${a} × ? = ${c}`,
      variantlar: tanlov(b, shuffle([b + 1, b - 1, b + 2, b - 2, b + 10])),
      javob: son(b),
    };
  }
  return {
    matn: `${c} ÷ ${a} = ?`,
    variantlar: tanlov(b, shuffle([b + 1, b - 1, b + 2, b - 2, a])),
    javob: son(b),
  };
}

/* ------------------------------------------------------------------ */
/*                         4. Ketma-ketlik                            */
/* ------------------------------------------------------------------ */

/**
 * Qatorning keyingi a'zosini top.
 *
 * O'yin SONNI emas, QONUNIYATNI so'raydi — shu sabab u boshqa
 * o'yinlardan farq qiladi: hisoblash tez bo'lsa ham, qoidani ko'rmaguncha
 * javob berib bo'lmaydi.
 */
export function ketma(d: Daraja): OqimSavol {
  const arr: number[] = [];
  let keyingi = 0;

  if (d === 1) {
    const q = rnd(2, 6);
    const osish = Math.random() < 0.7;
    let x = osish ? rnd(1, 8) : rnd(30, 60);
    for (let i = 0; i < 4; i++) { arr.push(x); x += osish ? q : -q; }
    keyingi = x;
  } else if (d === 2) {
    const tur = rnd(1, 3);
    if (tur === 1) {
      const k = pick([2, 2, 3]);
      let x = rnd(1, 4);
      for (let i = 0; i < 4; i++) { arr.push(x); x *= k; }
      keyingi = x;
    } else if (tur === 2) {
      // Kvadratlar: 1, 4, 9, 16 → 25
      const b = rnd(1, 5);
      for (let i = 0; i < 4; i++) arr.push((b + i) ** 2);
      keyingi = (b + 4) ** 2;
    } else {
      // Qadam o'sib boradi: 1, 3, 6, 10 → 15
      const b = rnd(1, 3);
      let x = b, q = b + 1;
      for (let i = 0; i < 4; i++) { arr.push(x); x += q; q++; }
      keyingi = x;
    }
  } else {
    const tur = rnd(1, 3);
    if (tur === 1) {
      // Fibonachchi — har a'zo oldingi ikkitasining yig'indisi.
      let a = rnd(1, 4), b = a + rnd(1, 3);
      arr.push(a, b);
      for (let i = 0; i < 3; i++) { const c = a + b; arr.push(c); a = b; b = c; }
      keyingi = a + b;
    } else if (tur === 2) {
      // n·(n+1): 2, 6, 12, 20 → 30
      const b = rnd(1, 4);
      for (let i = 0; i < 4; i++) arr.push((b + i) * (b + i + 1));
      keyingi = (b + 4) * (b + 5);
    } else {
      // Ikki qadam navbatlashadi: +5, −2, +5, −2 …
      const p = rnd(4, 9), m = rnd(1, 3);
      let x = rnd(2, 10);
      for (let i = 0; i < 5; i++) { arr.push(x); x += i % 2 === 0 ? p : -m; }
      keyingi = x;
    }
  }

  return {
    matn: `${arr.join(" · ")} · ?`,
    variantlar: tanlov(keyingi, shuffle([
      keyingi + 1, keyingi - 1, keyingi + rnd(2, 6), keyingi - rnd(2, 6),
      arr[arr.length - 1] + (arr[1] - arr[0]),
    ].filter((x) => x > 0))),
    javob: son(keyingi),
  };
}

/* ------------------------------------------------------------------ */
/*                          5. Chamalash                              */
/* ------------------------------------------------------------------ */

/** Sonni "chiroyli" ko'rinishga yaxlitlaydi: 399 → 400, 41 → 40. */
function yaxlit(v: number): number {
  const a = Math.abs(v);
  const qadam = a < 50 ? 5 : a < 200 ? 10 : a < 1000 ? 50 : 100;
  return Math.round(v / qadam) * qadam;
}

/**
 * `19 × 21 ≈ ?` — aniq hisoblash SHART EMAS.
 *
 * Bu o'yin maktabda o'rgatilmaydi, lekin hayotda eng ko'p kerak
 * bo'ladigan ko'nikma: bozorda, do'konda, hisob-kitobda odam aniq
 * ko'paytirmaydi — chamalaydi.
 *
 * Shu sabab variantlar bir-biridan UZOQ turadi (kamida 20%): agar ular
 * yaqin bo'lsa, o'yin chamalashni emas, aniq hisoblashni talab qilib
 * qolardi — ya'ni o'z maqsadining teskarisiga aylanardi.
 */
export function taxmin(d: Daraja): OqimSavol {
  for (let urinish = 0; urinish < 40; urinish++) {
    let matn: string, qiymat: number;

    if (d === 1) {
      const a = rnd(11, 89), b = rnd(11, 89);
      matn = `${a} + ${b}`;
      qiymat = a + b;
    } else if (d === 2) {
      const a = rnd(11, 49), b = rnd(11, 49);
      matn = `${a} × ${b}`;
      qiymat = a * b;
    } else {
      const tur = rnd(1, 2);
      if (tur === 1) {
        const a = rnd(15, 99) / 10, b = rnd(21, 99);
        matn = `${son(a)} × ${b}`;
        qiymat = a * b;
      } else {
        const a = rnd(4, 30) * 100, b = rnd(11, 49);
        matn = `${a} ÷ ${b}`;
        qiymat = a / b;
      }
    }

    const togri = yaxlit(qiymat);
    if (togri <= 0) continue;
    // Yaxlitlangan javobning O'ZI 6% dan uzoqlashib ketmasin, aks holda
    // "eng yaqin variant" degan qoida ishonchsiz bo'lib qoladi.
    if (Math.abs(togri - qiymat) / qiymat > 0.06) continue;

    const xato = [0.55, 0.72, 1.35, 1.75]
      .map((k) => yaxlit(qiymat * k))
      .filter((x) => x > 0 && Math.abs(x - qiymat) / qiymat > 0.2);
    if (xato.length < 3) continue;

    const uch = shuffle(xato).slice(0, 3);
    // Variantlar o'zaro ham takrorlanmasin.
    if (new Set([togri, ...uch]).size !== 4) continue;

    return {
      matn: `${matn} ≈ ?`,
      variantlar: shuffle([togri, ...uch]).map(son),
      javob: son(togri),
    };
  }
  return { matn: "19 × 21 ≈ ?", variantlar: ["290", "340", "400", "480"], javob: "400" };
}

/* ------------------------------------------------------------------ */
/*                            6. Tarozi                               */
/* ------------------------------------------------------------------ */

const MEVA = ["🍎", "🍌", "🍇", "🍒", "🥕", "🍋", "🍐", "🍓"];

/**
 * Tarozi — bu aslida TENGLAMA, lekin harfsiz.
 *
 * `🍎🍎🍎 = 12` degan qator `3x = 12` ning o'zi. Bola buni bilmaydi,
 * shuning uchun qo'rqmaydi — algebra esa aynan shu yerdan boshlanadi.
 *
 * Uchinchi daraja allaqachon TENGLAMALAR TIZIMI (`x + y = 10`,
 * `x − y = 4`), faqat u ham meva bilan yozilgan.
 */
export function tarozi(d: Daraja): OqimSavol {
  const [A, B] = shuffle([...MEVA]).slice(0, 2);

  if (d === 1) {
    const n = rnd(2, 5), x = rnd(2, 9);
    return {
      ost: `${A.repeat(n)}  =  ${n * x}`,
      matn: `${A}  =  ?`,
      variantlar: tanlov(x, shuffle([x + 1, x - 1, n, n * x, x + 2])),
      javob: son(x),
    };
  }

  if (d === 2) {
    // a·A = b·B va B ma'lum. A ni topish uchun avval o'ng tarafni
    // hisoblab, keyin `a` ga bo'lish kerak — ikki qadamli fikr.
    for (let i = 0; i < 40; i++) {
      const a = rnd(2, 4), b = rnd(2, 5), yB = rnd(2, 9);
      if ((b * yB) % a !== 0) continue;
      const yA = (b * yB) / a;
      if (yA < 2 || yA > 40) continue;
      return {
        ost: `${A.repeat(a)} = ${B.repeat(b)}
${B} = ${yB}`,
        matn: `${A}  =  ?`,
        variantlar: tanlov(yA, shuffle([yA + 1, yA - 1, yB, b * yB, yA + 2])),
        javob: son(yA),
      };
    }
  }

  // 3-daraja: tenglamalar tizimi. Yig'indi va ayirma bir xil juftlikda
  // berilgani uchun javob yagona — bu haqiqiy algebra masalasi.
  const x = rnd(5, 20);
  const y = rnd(1, x - 1);
  return {
    ost: `${A} + ${B} = ${x + y}
${A} − ${B} = ${x - y}`,
    matn: `${A}  =  ?`,
    variantlar: tanlov(x, shuffle([y, x + y, x - y, x + 1, x - 1])),
    javob: son(x),
  };
}
