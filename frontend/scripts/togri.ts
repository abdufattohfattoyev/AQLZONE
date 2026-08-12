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
  const j = Number(tozala(String(javob)));
  if (!Number.isFinite(j)) return { holat: "otkazildi" };

  const s = tozala(matn);

  // Faqat raqam va amal belgilaridan iborat bo'lsin. Harf bo'lsa
  // (x, y, lim, sin) — bu boshqa janr, matndan yechib bo'lmaydi.
  const sof = (x: string) => /^[\d\s+\-*/|^().?]+$/.test(x);

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

  return { holat: "otkazildi" };
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

          const r = savolniTekshir(matn, a.answer);
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
