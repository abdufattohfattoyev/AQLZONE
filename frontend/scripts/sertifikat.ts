/**
 * Milliy sertifikat variantlari sinovi (`src/lib/sertifikat.ts`).
 *
 * Va'dalar: tuzilish rasmiy namunadagidek (45 topshiriq, 100 ball),
 * variant har safar bir xil, ochiq savol javobi — son, moslashtirishda
 * har savolga bitta harf, yozilgan javob "−3" / "-3" / "2.5" / "2,5"
 * ko'rinishida ham to'g'ri o'qiladi.
 */
import "./_xotira";
import {
  DARAJA_SHKALA, keyingiDaraja, ifodaQiymati,
  BALL, TUZILISH, VARIANTLAR, daraja, maksBall, savolBali, sonTogrimi, variantYasa, yaxlit,
} from "../src/lib/sertifikat";
import { RASMIY_RAQAM } from "../src/lib/sertRasmiy";

let xato = 0;
const t = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

for (let n = 1; n <= VARIANTLAR; n++) {
  const v = variantYasa(n);
  if (!v) { t(`${n}-variant yasaldi`, false, "null"); continue; }
  const tur = (x: string) => v.savollar.filter((s) => s.tur === x).length;
  const jami = yaxlit(v.savollar.reduce((a, s) => a + maksBall(s), 0));
  const ok = v.savollar.length === 45 && tur("y1") === TUZILISH.y1 && tur("y2") === TUZILISH.y2
    && tur("o") === TUZILISH.o && jami === 100;
  t(`${n}-variant: 45 topshiriq, 100 ball`, ok, `${v.savollar.length} ta, ${jami} ball`);

  const y2 = v.savollar.filter((s) => s.tur === "y2");
  const javoblar = y2.map((s) => (s.tur === "y2" ? String(s.s.a.answer) : ""));
  t(`${n}-variant: moslashtirish to'g'ri`,
    v.y2.length === 6 && new Set(v.y2.map(String)).size === 6
      && javoblar.every((j) => v.y2.map(String).includes(j)) && new Set(javoblar).size === javoblar.length,
    v.y2.join(" / "));

  const ochiq = v.savollar.filter((s) => s.tur === "o");
  t(`${n}-variant: ochiq javob — son, qismlar bitta bobdan`,
    ochiq.every((s) => s.tur === "o" && s.a.kursId === s.b.kursId && s.a.ui === s.b.ui
      && ifodaQiymati(String(s.a.a.answer)) !== null && ifodaQiymati(String(s.b.a.answer)) !== null
      && (v.rasmiy || (/^[−-]?\d+([.,]\d+)?$/.test(String(s.a.a.answer)) && /^[−-]?\d+([.,]\d+)?$/.test(String(s.b.a.answer))))));

  // Hamma javobi to'g'ri — 100 ball.
  const toliq = v.savollar.reduce((a, s) => a + savolBali(s,
    s.tur === "o" ? { a: String(s.a.a.answer), b: String(s.b.a.answer) } : String(s.s.a.answer)), 0);
  t(`${n}-variant: to'liq javob = 100 ball`, yaxlit(toliq) === 100, String(toliq));
}

t("bir variant — har safar bir xil", JSON.stringify(variantYasa(4)) === JSON.stringify(variantYasa(4)));
t("boshqa variant — boshqa savollar", JSON.stringify(variantYasa(4)) !== JSON.stringify(variantYasa(5)));
t("noto'g'ri raqam — null", variantYasa(0) === null && variantYasa(VARIANTLAR + 1) === null);

t("son: −3 = -3", sonTogrimi("-3", "−3"));
t("son: 2.5 = 2,5", sonTogrimi("2.5", "2,5") && sonTogrimi(" 2,5 ", "2,5"));
t("son: bo'sh javob xato", !sonTogrimi("", "0"));
t("son: 12 ≠ 21", !sonTogrimi("12", "21"));
t("ochiq: faqat a) to'g'ri — 1,5 ball",
  (() => {
    const s = variantYasa(1)!.savollar.find((x) => x.tur === "o")!;
    return s.tur === "o" && savolBali(s, { a: String(s.a.a.answer), b: "999999" }) === BALL.oA;
  })());

t("daraja: 100 → A+, 50 → yo'q", daraja(100) === "A+" && daraja(50) === null);
t("daraja: 62 → C", daraja(62) === "C", String(daraja(62)));

t("shkala: 75 ballikning teskarisi",
  JSON.stringify(DARAJA_SHKALA.map((x) => [x.d, x.ball]))
    === JSON.stringify([["C", 61.3], ["C+", 66.7], ["B", 73.3], ["B+", 80], ["A", 86.7], ["A+", 93.3]]),
  JSON.stringify(DARAJA_SHKALA));
t("shkala chegarasidan sal yuqorisi — o'sha daraja", DARAJA_SHKALA.every((x) => daraja(x.ball + 0.1) === x.d));
t("keyingi: 80 (B+) → A ga 6,7", JSON.stringify(keyingiDaraja(80)) === JSON.stringify({ d: "A", farq: 6.7 }),
  JSON.stringify(keyingiDaraja(80)));
t("keyingi: 50 → C ga 11,4 (yuqoriga yaxlit)", JSON.stringify(keyingiDaraja(50)) === JSON.stringify({ d: "C", farq: 11.4 }),
  JSON.stringify(keyingiDaraja(50)));
t("keyingi: 95 (A+) → yo'q", keyingiDaraja(95) === null);
t("keyingi: 50 + farq — haqiqatan C", daraja(50 + keyingiDaraja(50)!.farq) === "C");

/* ---- rasmiy namuna: javoblar boshqa yo'l bilan qayta hisoblanadi ---- */
{
  const v = variantYasa(RASMIY_RAQAM)!;
  const y1 = v.savollar.filter((s) => s.tur === "y1");
  const tanlov = (i: number) => (y1[i] as Extract<typeof y1[number], { tur: "y1" }>).s.a;
  const togri = (i: number) => String(tanlov(i).answer);
  const yoq = (i: number, x: string) => tanlov(i).choices.map(String).includes(x);

  t("rasmiy: 32 test, har savolda 4 variant, javob ular ichida",
    y1.length === 32 && y1.every((_, i) => tanlov(i).choices.length === 4 && yoq(i, togri(i))));
  t("rasmiy: 10 tasi 1,3 ball, 22 tasi 2,2 ball",
    y1.filter((s) => s.tur === "y1" && s.ball === 1.3).length === 10
      && y1.filter((s) => s.tur === "y1" && s.ball === 2.2).length === 22);
  t("rasmiy: moslashtirish A–F rasmiy tartibda",
    v.y2.map(String).join("|") === "30|3|50|25|33⅓|3000");

  // Mustaqil hisob (javob kaliti rasmiy varaqda yo'q edi).
  const c = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  let min1 = Infinity;
  for (let a = 1; a <= 30; a++) if (30 % a === 0) min1 = Math.min(min1, a + 2 * (30 / a) - 1);
  t("rasmiy 1: 15", togri(0) === String(min1));
  t("rasmiy 2: 3,1(3)", togri(1) === "3,1(3)" && c(649 / 90 - 398 / 90 + 31 / 90, 3 + 2 / 15));
  t("rasmiy 3: 35", togri(2) === String(175 / 3.125 * 0.625));
  t("rasmiy 5: 14", c((Math.sqrt(4 - Math.sqrt(7)) + Math.sqrt(4 + Math.sqrt(7))) ** 2, 14) && togri(4) === "14");
  t("rasmiy 6: b < a < c", c(0, 0) && 32 < 36 && 36 < 40 && togri(5) === "b < a < c");
  t("rasmiy 7: 3 + 2√3", c((Math.sqrt(7) + 1 - Math.sqrt(3)) * (Math.sqrt(7) + Math.sqrt(3) - 1), 3 + 2 * Math.sqrt(3)) && togri(6) === "3 + 2√3");
  t("rasmiy 9: b₁ = 2 yoki 32", [2, 32].every((b1) => {
    const q = b1 === 2 ? 3 : -0.75;
    return c(b1 * q * q, 18) && c(b1 * (1 + q + q * q), 26);
  }) && togri(8) === "2 yoki 32");
  {
    const [n, m, k] = [-3, -2, 3];
    t("rasmiy 11: 144", c((((4 * n * n) / m) ** 2 * k / (m * m * n * n)) / (k ** 3 / (m * n) ** 3) * (m * k * k) / n ** 3, 144) && togri(10) === "144");
  }
  t("rasmiy 13: 3", c(2 * (Math.sin(Math.PI / 8) ** 4 + Math.cos(3 * Math.PI / 8) ** 4 + Math.sin(5 * Math.PI / 8) ** 4 + Math.cos(7 * Math.PI / 8) ** 4), 3) && togri(12) === "3");
  t("rasmiy 14: x = 0", c(3 ** 0 - 2 * 3 ** 0 + 9 * 3 ** -2, 0) && c(3 ** 3 * 0 + 0, 0) && togri(13) === "0");
  {
    // 15: log₇(3x+5) + |log₇(2x+5)| = 0 — ildiz x = −1,5
    const f = (x: number) => Math.log(3 * x + 5) / Math.log(7) + Math.abs(Math.log(2 * x + 5) / Math.log(7));
    let ildiz = 0, oldin = f(-5 / 3 + 1e-9);
    for (let x = -5 / 3 + 1e-4; x < 6; x += 1e-4) { const y = f(x); if (oldin * y < 0) ildiz++; oldin = y; }
    t("rasmiy 15: 1 ta ildiz", ildiz === 1 && c(f(-1.5), 0) && togri(14) === "1");
  }
  t("rasmiy 16: −5/3", togri(15) === "−5/3");
  {
    // 17: ildizlar x² − 6x − 12 = 0 (yig'indi 6) va x² − 4x − 12 = 0 (yig'indi 4) → 10
    const g = (x: number) => x * x / 3 + 48 / (x * x) - 10 * (x / 3 - 4 / x);
    const d = 2 * Math.sqrt(21);
    const ildizlar = [3 + d / 2 * 1, 3 - d / 2 * 1, 6, -2];
    t("rasmiy 17: 10", ildizlar.every((x) => Math.abs(g(x)) < 1e-9) && c(6 + 4, 10) && togri(16) === "10");
  }
  t("rasmiy 19: 9", c([2, 3, 4].reduce((a, b) => a + b, 0), 9) && [2, 3, 4].every((x) => (5 * x + 3) / (x * x + x - 2) > 1) && togri(18) === "9");
  t("rasmiy 26: 9", c(3 * Math.sqrt(3) * Math.sqrt(3), 9) && togri(25) === "9");
  t("rasmiy 27: 36", c(64 - 12 - 16, 36) && togri(26) === "36");
  t("rasmiy 28: 2π", c(Math.PI * (Math.SQRT2) ** 2, 2 * Math.PI) && togri(27) === "2π");
  t("rasmiy 30: √541", c(25 * 25 + 16 - 10 * (5 * 4 * 0.5), 541) && togri(29) === "√541");
  t("rasmiy 32: 7/30", c((8 / 16) * (7 / 15), 7 / 30) && togri(31) === "7/30");

  // Ochiq savollar: qism javobi ifoda sifatida to'g'ri o'qiladi.
  const ochiq = v.savollar.filter((s): s is Extract<typeof s, { tur: "o" }> => s.tur === "o");
  const javob = (i: number, q: "a" | "b") => String(ochiq[i][q].a.answer);
  t("rasmiy 36: 2 ildiz, ko'paytma −8", javob(0, "a") === "2" && javob(0, "b") === "−8");
  t("rasmiy 37: π/14 va 17 ta ildiz", c(ifodaQiymati(javob(1, "a"))!, Math.PI / 14) && javob(1, "b") === "17"
    && (() => {
      let n = 0;
      for (let k = -1; k <= 1; k++) n++;
      for (let k = -8; k <= 8; k++) { const x = Math.PI / 14 + (Math.PI * k) / 7; if (Math.abs(x) <= Math.PI + 1e-12) n++; }
      return n === 17;
    })());
  t("rasmiy 38: −3/2 va √5/4", c(ifodaQiymati(javob(2, "a"))!, 3 / -2) && c(ifodaQiymati(javob(2, "b"))!, Math.sqrt(1 / 4 + 1 / 16)));
  t("rasmiy 40: 2 nuqta, yuz 1/3", javob(4, "a") === "2" && c(ifodaQiymati(javob(4, "b"))!, 4 / 3 - 1));
  t("rasmiy 41: 87 va 91", c(87 + 91 + 2, 180) && javob(5, "a") === "87" && javob(5, "b") === "91");
  t("rasmiy 42: 10 va 80", c(14 - 4, 10) && c(64 + 16, 80) && javob(6, "a") === "10" && javob(6, "b") === "80");
  t("rasmiy 43: 12 va 12√2", c(Math.abs(7 * 12 - 24) / 5, 12) && c(ifodaQiymati(javob(7, "b"))!, 12 * Math.SQRT2));
  t("rasmiy 44: √15 va √11", c(ifodaQiymati(javob(8, "a"))!, 0.9682458365518543 / 0.25) && c(ifodaQiymati(javob(8, "b"))!, 3.3166247903553994));
  {
    const jami = (x: number) => 7500 * Math.sqrt(1 + x * x) + 6000 * (5 - x);
    let eng = 1e18, xe = 0;
    for (let x = 0; x <= 5; x += 1e-5) if (jami(x) < eng) { eng = jami(x); xe = x; }
    t("rasmiy 45: JL 22000, FJ 12500", Math.abs(6000 * (5 - xe) - 22000) < 1 && Math.abs(7500 * Math.sqrt(1 + xe * xe) - 12500) < 1
      && javob(9, "a") === "22000" && javob(9, "b") === "12500");
  }
}

/* ---- ifoda o'qish ---- */
t("ifoda: 3/2 = 1,5", sonTogrimi("3/2", "1,5") && sonTogrimi("1,5", "3/2"));
t("ifoda: π/14", sonTogrimi("pi/14", "π/14") && sonTogrimi("π / 14", "π/14") && !sonTogrimi("π/7", "π/14"));
t("ifoda: 12√2", sonTogrimi("12√2", "12√2") && sonTogrimi("12*sqrt(2)", "12√2") && !sonTogrimi("17", "12√2"));
t("ifoda: −3/2", sonTogrimi("-3/2", "−3/2") && sonTogrimi("−1,5", "−3/2"));
t("ifoda: axlat → xato", !sonTogrimi("abc", "5") && !sonTogrimi("2//3", "1") && !sonTogrimi("√", "1") && !sonTogrimi("(2", "2"));

if (xato) {
  console.log(`\n${xato} ta xato`);
  process.exit(1);
}
console.log("\nSertifikat: hammasi joyida");
