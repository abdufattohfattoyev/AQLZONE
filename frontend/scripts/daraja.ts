/**
 * Daraja aniqlash testi (`src/lib/daraja.ts`).
 *
 * NEGA SINOV KERAK. Xato jim chiqadi: qidiruv bitta bobga adashsa,
 * bola o'zi bilmaydigan bobdan boshlaydi va buni hech kim sezmaydi —
 * u shunchaki "qiyin ekan" deb ilovani yopadi.
 *
 * Uch narsa tekshiriladi, HAR KURS uchun:
 *
 *   1. Aniqlik    "k-bobgacha biladigan" bola aynan k-bobga tushadi
 *                 (k = 0 … oxirgi), savollar `DARAJA_MAX` dan oshmaydi.
 *   2. Savollar   har sinaladigan bobdan yaroqli savol chiqadi: kamida
 *                 3 variant, takrorsiz, javob ichida (`yaroqli`).
 *   3. Takror     bitta testda bir xil savol ikki marta chiqmaydi.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import { COURSES } from "../src/lib/curriculum";
import {
  DARAJA_MAX, darajaBoshla, darajaBormi, darajaJavob, darajaSavol, joriyBob, savolIzi,
  sinaladigan, yaroqli,
} from "../src/lib/daraja";

const xatolar: string[] = [];
let kurslar = 0, savollar = 0, eng = 0;

for (const c of COURSES) {
  if (!darajaBormi(c)) continue;
  kurslar++;
  const s = sinaladigan(c.units);

  // 1. Aniqlik: bola s[k] dan oldingi hamma bobni biladi, qolganini yo'q.
  for (let k = 0; k <= s.length; k++) {
    let h = darajaBoshla(c.units);
    while (h.natija === null) {
      const bob = joriyBob(c.units, h);
      h = darajaJavob(c.units, h, s.indexOf(bob) < k);
    }
    const kutilgan = k < s.length ? s[k]! : Math.min(s[s.length - 1]! + 1, c.units.length - 1);
    if (h.natija !== kutilgan) xatolar.push(`${c.slug}: ${k} bob biladigan bola ${h.natija}-bobga tushdi, kutilgan ${kutilgan}`);
    if (h.savol > DARAJA_MAX) xatolar.push(`${c.slug}: ${h.savol} ta savol — chegaradan ko'p`);
    eng = Math.max(eng, h.savol);
  }

  // 2. Har sinaladigan bobdan savol: 30 marta, uchala o'rindan.
  for (const ui of s) {
    let yaroqsiz = 0;
    for (let i = 0; i < 30; i++) {
      const a = darajaSavol(c.units[ui]!, i % 3, new Set());
      savollar++;
      if (!yaroqli(a)) yaroqsiz++;
    }
    if (yaroqsiz) xatolar.push(`${c.slug} ${ui + 1}-bob: 30 tadan ${yaroqsiz} savol yaroqsiz (variant < 3 yoki takror)`);
  }

  // 3. Bitta test ichida takror yo'q — tasodifiy javoblar bilan 20 marta.
  for (let r = 0; r < 20; r++) {
    let h = darajaBoshla(c.units);
    const chiqqan = new Set<string>();
    while (h.natija === null) {
      const a = darajaSavol(c.units[joriyBob(c.units, h)]!, h.togri + h.xato, chiqqan);
      if (chiqqan.has(savolIzi(a))) { xatolar.push(`${c.slug}: savol takrorlandi — ${a.prompt}`); break; }
      chiqqan.add(savolIzi(a));
      h = darajaJavob(c.units, h, Math.random() < 0.5);
    }
  }
}

console.log(`\nDaraja testi: ${kurslar} kurs, ${savollar} savol yasab ko'rildi, eng uzun test — ${eng} savol`);
const noyob = [...new Set(xatolar)];
if (noyob.length) {
  console.log(`\n❌ ${noyob.length} muammo:\n`);
  for (const x of noyob.slice(0, 40)) console.log("   " + x);
  process.exit(1);
}
console.log("✅ hammasi joyida\n");
