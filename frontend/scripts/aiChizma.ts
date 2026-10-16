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
import { ovozBolaklari, tekshirDars } from "../src/lib/jonliDars";

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
const nomli = tekshir('{"tur":"sonOqi","oraliqlar":[{"dan":0.785,"dan_nom":"π/4","gacha":3.1416,"gacha_nom":"π"}]}');
if (nomli?.tur !== "sonOqi" || nomli.oraliqlar[0].danNom !== "π/4" || nomli.oraliqlar[0].gachaNom !== "π") {
  shikoyat("son o'qi: uch nomlari o'qilmadi");
}
else console.log("  ✓ son o'qi");

const reja = tekshir(JSON.stringify({ tur: "reja", kunlar: [
  { kun: "1-kun", ishlar: [{ mavzu: "Planimetriya", daqiqa: 35 }, { mavzu: "", daqiqa: 5 }, { mavzu: "Ifodalar", daqiqa: 9999 }] },
  { kun: "2-kun", ishlar: [] },
] }));
if (reja?.tur !== "reja" || reja.kunlar.length !== 1 || reja.kunlar[0].ishlar.length !== 2
    || reja.kunlar[0].ishlar[1].daqiqa !== 240) shikoyat(`reja: ${JSON.stringify(reja)}`);
else console.log("  ✓ reja: bo'sh mavzu va bo'sh kun tashlandi, daqiqa chegaralandi");

console.log("\n--- jonli dars ---");
// Ovoz bo'laklari backend'dagi `jonli_dars.bolaklar` bilan AYNAN bir xil bo'lishi
// shart (shu misollar `tests.py` → test_jonli_dars_bolaklari da ham bor).
const b1 = ovozBolaklari("Salom.  Bugun   sinus!  Tayyormisiz?");
if (JSON.stringify(b1) !== JSON.stringify(["Salom.", "Bugun sinus!", "Tayyormisiz?"])) shikoyat(`bo'laklar: ${JSON.stringify(b1)}`);
const b2 = ovozBolaklari("Birinchi qism, " + "so'z ".repeat(50) + "oxiri.");
if (JSON.stringify(b2.map((x) => x.length)) !== "[189,81]") shikoyat(`uzun bo'laklar: ${b2.map((x) => x.length)}`);
else console.log("  ✓ ovoz bo'laklari backend bilan bir xil");
const dars = tekshirDars({ n: 1, nom: "Sinus", sahnalar: [
  { aytish: "Salom.", yozuv: ["sin x"], chizma: { tur: "noma'lum" } },
  { aytish: "Savol.", savol: { matn: "sin 30°?", variantlar: ["1/2", "1"], togri: 5 } },
  { boshqa: 1 },
] });
if (!dars || dars.sahnalar.length !== 2 || dars.sahnalar[0].chizma || dars.sahnalar[1].savol) shikoyat(`dars: ${JSON.stringify(dars)}`);
else console.log("  ✓ jonli dars: buzilgan chizma, savol va sahna tashlandi");

if (tekshir('{"tur":"rasm"}') || tekshir("[]") || tekshir("null")) shikoyat("noma'lum tur qabul qilindi");

console.log(xato ? `\n❌ ${xato} ta xato\n` : "\n✅ AI chizmalari: hammasi joyida\n");
if (xato) process.exit(1);
