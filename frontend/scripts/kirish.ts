/**
 * Kirish yo'li hisobi testi (`src/lib/kirish.ts`) va jadvalning o'zi.
 *
 * NEGA SINOV KERAK. Raqam xato bo'lsa odam "4 ta savol yetmaydi" deb
 * xotirjam bo'ladi-yu, aslida yetmaydi — bu eng yomon yolg'on. Shuning
 * uchun hisob qo'lda sanalgan misollar bilan solishtiriladi.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import { readFileSync } from "node:fs";
import { MAKS, hisobla, matemMaks } from "../src/lib/kirish";
import type { Yonalish } from "../src/lib/kirish";

const xatolar: string[] = [];
const teng = (nom: string, a: unknown, b: unknown) => {
  if (a !== b) xatolar.push(`${nom}: ${String(a)} ≠ ${String(b)}`);
};
const y = (kontrakt: number, orin: 1 | 2): Yonalish => ({
  otm: "T", hudud: "T", tur: "Kunduzgi", til: "O'zbek", kod: 1, nomi: "T", grant: 0, kontrakt, orin,
});

// Tuzilish: 3×11 majburiy + 93 + 63 = 189.
teng("maks", 33 + 93 + 63, MAKS);
teng("1-fan", matemMaks(1), 104);
teng("2-fan", matemMaks(2), 74);

// Qo'lda: 60% matem, 60% boshqa, chegara 132,7, 1-fan.
// matem 62,4 + boshqa 51 = 113,4; kerak (132,7−51)/104×30 = 23,57 → 24; bor 18 → 6.
{
  const h = hisobla(y(132.7, 1), 60, 60);
  teng("ball", Math.round(h.ball * 10) / 10, 113.4);
  teng("savol", h.kontraktSavol, 6);
}
// Chegaradan o'tgan — 0, manfiy farq.
{
  const h = hisobla(y(100, 1), 60, 85);
  teng("o'tgan savol", h.kontraktSavol, 0);
  if (!(h.kontraktFarq < 0)) xatolar.push("o'tgan: farq manfiy emas");
}
// 2-fan: matem 74 dan. 50% matem → 37; boshqa 50% × 115 = 57,5 → 94,5.
// Chegara 120: kerak (120−57,5)/74×30 = 25,3 → 26; bor 15 → 11.
{
  const h = hisobla(y(120, 2), 50, 50);
  teng("2-fan ball", Math.round(h.ball * 10) / 10, 94.5);
  teng("2-fan savol", h.kontraktSavol, 11);
}
// Yetib bo'lmaydigan: boshqa 0%, chegara 180 → 30/30 ham 104 — yetmaydi.
teng("yetmaydi", hisobla(y(180, 1), 90, 0).kontraktSavol, null);
// Aynan chegarada (kasr xatosi bo'lmasin): 30/30, boshqa 100% = 189.
teng("189", hisobla(y(189, 1), 100, 100).kontraktSavol, 0);

// Jadval: har qator to'liq, ball 0–189 orasida, matematika o'rni 1 yoki 2.
const x = JSON.parse(readFileSync(new URL("../src/lib/data/otish2025.json", import.meta.url), "utf-8")) as {
  otm: string[]; q: [number, number, number, number, number, string, number, number, number][];
};
for (const [o, , , , kod, nomi, grant, kontrakt, orin] of x.q) {
  if (!x.otm[o] || !nomi || !(kod > 0)) xatolar.push(`jadval: bo'sh maydon ${kod}`);
  if (kontrakt <= 0 && grant <= 0) xatolar.push(`jadval: ball yo'q ${kod}`);
  if (kontrakt > MAKS || grant > MAKS) xatolar.push(`jadval: ${MAKS} dan katta ${kod}`);
  if (orin !== 1 && orin !== 2) xatolar.push(`jadval: o'rin ${orin} ${kod}`);
}

if (xatolar.length) {
  console.error("❌ kirish yo'li:\n  " + xatolar.slice(0, 20).join("\n  "));
  process.exit(1);
}
console.log(`\n✅ kirish yo'li: hisob to'g'ri, jadvalda ${x.q.length} yo'nalish, ${x.otm.length} OTM`);
