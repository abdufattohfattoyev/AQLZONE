/**
 * Imtihon variantlari sinovi (`src/lib/imtihon.ts`).
 *
 * Eng muhim va'dalar: variant HAR SAFAR bir xil chiqadi (aks holda
 * natijalarni solishtirib bo'lmaydi) va savollar bitta sinfdan emas,
 * 7–11 dan keladi (aks holda bu DTM emas, 11-sinf testi).
 */
import "./_xotira";
import { IMTIHON_SINFLAR, imtihonKurslari, sinfOf } from "../src/lib/blok";
import { OLCHAM, VARIANTLAR, variantYasa } from "../src/lib/imtihon";

let xato = 0;
const t = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

/* ---------------- qamrov ---------------- */
const kurslar = imtihonKurslari();
t("imtihon kurslari bor", kurslar.length > 0, String(kurslar.length));
t("faqat 7–11 sinf kurslari",
  kurslar.every((c) => IMTIHON_SINFLAR.includes(sinfOf(c.grade))),
  kurslar.map((c) => c.grade).join(","));

/* ---------------- variantlar ---------------- */
const v1 = variantYasa(1);
t("variant yasaladi", v1 !== null);
t("savollar soni to'liq", v1 !== null && v1.savollar.length === OLCHAM.savol,
  String(v1?.savollar.length));
t("vaqt 60 daqiqa", v1 !== null && v1.daqiqa === OLCHAM.daqiqa, String(v1?.daqiqa));

const v1b = variantYasa(1);
const bir_xil = JSON.stringify(v1?.savollar.map((s) => s.a.prompt))
  === JSON.stringify(v1b?.savollar.map((s) => s.a.prompt));
t("bir variant — har safar bir xil", bir_xil);

const v2 = variantYasa(2);
const boshqa = JSON.stringify(v1?.savollar.map((s) => s.a.prompt))
  !== JSON.stringify(v2?.savollar.map((s) => s.a.prompt));
t("boshqa variant — boshqa savollar", boshqa);

t("chegaradan tashqari variant yo'q", variantYasa(0) === null && variantYasa(VARIANTLAR + 1) === null);

/* ---------------- aralashganmi ---------------- */
// Imtihon savollari bir nechta SINFDAN kelishi kerak: bitta sinfdan
// yig'ilgan variant DTM emas, oddiy sinf testi bo'lardi.
let kamAralash = 0;
for (let n = 1; n <= VARIANTLAR; n++) {
  const v = variantYasa(n);
  if (!v) { kamAralash++; continue; }
  const sinflar = new Set(v.savollar.map((s) => s.kursId));
  if (sinflar.size < 3) kamAralash++;
}
t(`${VARIANTLAR} variantning hammasi bir nechta kursdan yig'ilgan`, kamAralash === 0,
  String(kamAralash));

/* ---------------- savollar to'g'rimi ---------------- */
let bosh = 0;
for (let n = 1; n <= VARIANTLAR; n++) {
  const v = variantYasa(n);
  if (!v) continue;
  for (const s of v.savollar) {
    if (!s.a.prompt || s.a.answer === undefined || s.a.answer === null) bosh++;
    if (!s.mavzu) bosh++;
  }
}
t("har savolning matni, javobi va mavzusi bor", bosh === 0, String(bosh));

console.log(xato ? `\n❌ ${xato} ta xato` : "\n✅ imtihon: hammasi joyida");
if (xato) process.exit(1);
