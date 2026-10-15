/**
 * AI CHIZMALARI — ifoda tahlilchisi va ```chizma bloklarini tekshirish.
 *
 * Nega kerak: model yozgan ifoda (`x^2-4`, `2sin(x)`) o'z tahlilchimizda
 * hisoblanadi (`eval` yo'q). Tahlilchi bitta belgida adashsa, grafik jim
 * noto'g'ri chiziladi — o'quvchi esa chizmaga ishonadi. Buzilgan JSON esa
 * chizmasiz o'tib ketishi, ekranni buzmasligi kerak.
 *
 * Ishga tushirish: `npx jiti scripts/aiChizma.ts`
 */
import { bolakla, tahlil, tekshir } from "../src/lib/aiChizma";

let xato = 0;
const shikoyat = (gap: string) => {
  console.log(`  ✗ ${gap}`);
  xato++;
};

console.log("\n--- ifodalar ---");
const IFODALAR: [string, number, number][] = [
  ["x^2-4", 3, 5],
  ["2x+1", 2, 5],
  ["-x^2", 3, -9],
  ["2^x^2", 2, 16],
  ["(x+1)(x-2)", 3, 4],
  ["3(x+1)", 1, 6],
  ["x sin(x)", Math.PI / 2, Math.PI / 2],
  ["sqrt(x)+abs(-x)", 4, 6],
  ["√x", 9, 3],
  ["x²−1", 2, 3],
  ["log(x)", 100, 2],
  ["ln(e)", 0, 1],
  ["1/x", 4, 0.25],
  ["2pi", 0, 2 * Math.PI],
  ["y = 2x", 3, 6],
  ["tg(x)", Math.PI / 4, 1],
  ["sin(x)^2+cos(x)^2", 1.3, 1],
];
for (const [ifoda, x, kutilgan] of IFODALAR) {
  const f = tahlil(ifoda);
  const v = f?.(x);
  if (v === undefined || Math.abs(v - kutilgan) > 1e-9) shikoyat(`${ifoda} (x=${x}): ${v} ≠ ${kutilgan}`);
  else console.log(`  ✓ ${ifoda}`);
}
for (const yomon of ["", "x+", "alert(1)", "x**", "(x+1", "window", "x;1"]) {
  if (tahlil(yomon)) shikoyat(`"${yomon}" qabul qilinmasligi kerak edi`);
}

console.log("\n--- bloklar ---");
const javob = [
  "G'oya: parabola.",
  "```chizma",
  '{"tur":"grafik","x":[-4,4],"y":[-5,5],"funksiyalar":[{"f":"x^2-4","nom":"y = x² − 4"}]}',
  "```",
  "Qadamlar.",
  "```chizma",
  "{buzilgan json",
  "```",
  "Oxiri.",
].join("\n");
const b = bolakla(javob);
const turlar = b.map((x) => x.tur).join(",");
if (turlar !== "matn,chizma,matn,matn") shikoyat(`bo'laklar: ${turlar}`);
else console.log("  ✓ matn va chizma ajraldi, buzilgan blok tashlab ketildi");

const geo = tekshir(JSON.stringify({
  tur: "geometriya", nuqtalar: { A: [0, 0], B: [4, 0], C: [0, 3], A1: [1, 1] },
  kesmalar: ["AB", "BC", { k: "CA1", shtrix: true }, "AZ"],
  burchaklar: [{ uch: "A", a: "B", b: "C", togri: true }, { uch: "Q", a: "B", b: "C" }],
  aylanalar: [{ markaz: "A", r: 2 }, { markaz: [0, 0], r: -1 }],
}));
if (geo?.tur !== "geometriya") shikoyat("geometriya o'qilmadi");
else {
  if (geo.kesmalar.length !== 3 || geo.kesmalar[2].b !== "A1" || !geo.kesmalar[2].shtrix) {
    shikoyat(`kesmalar: ${JSON.stringify(geo.kesmalar)}`);
  }
  if (geo.burchaklar.length !== 1) shikoyat("noma'lum nuqtali burchak tashlanishi kerak edi");
  if (geo.aylanalar.length !== 1) shikoyat("manfiy radiusli aylana tashlanishi kerak edi");
  console.log("  ✓ geometriya: ko'p harfli nom, noma'lum nuqta, yomon radius");
}

const oqi = tekshir('{"tur":"sonOqi","oraliqlar":[{"dan":null,"gacha":1,"gacha_yopiq":true},{"dan":5,"gacha":2}]}');
if (oqi?.tur !== "sonOqi" || oqi.oraliqlar.length !== 1) shikoyat("son o'qi: teskari oraliq tashlanishi kerak edi");
else console.log("  ✓ son o'qi");

if (tekshir('{"tur":"rasm"}') || tekshir("[]") || tekshir("null")) shikoyat("noma'lum tur qabul qilindi");

console.log(xato ? `\n❌ ${xato} ta xato\n` : "\n✅ AI chizmalari: hammasi joyida\n");
if (xato) process.exit(1);
