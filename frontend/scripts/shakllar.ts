/**
 * QAYSI SAVOL SHAKLLARI KO'P — tekshiruv qamrovini oshirish uchun.
 *
 *     npx jiti scripts/shakllar.ts 109
 *
 * `scripts/togri.ts` savollarning bir qismini mustaqil tekshiradi va
 * qamrovni foizda yozadi. Qolgan qismni tekshirishga o'tish uchun
 * bitta savolga javob kerak: SHU SINFDA ENG KO'P QAYSI SHAKL BOR?
 *
 * Bu skript shuni ko'rsatadi. Savol matnidagi sonlar `#` bilan
 * almashtiriladi va bir xil shakldagilar birga sanaladi — natijada
 * yuzlab savol o'ndan kam qatorga siqiladi.
 *
 * Shundan keyin `togri.ts` ga yangi qoida qo'shish arzon bo'ladi va
 * qayerga kuch sarflash kerakligi ko'rinib turadi. Aynan shu yo'l
 * bilan 9-sinf geometriyasi 0% dan 40% ga chiqdi.
 *
 * Argument — kurs kodi (`grade`): 0–11, geometriya uchun 107–110.
 */
import { COURSES } from "../src/lib/curriculum";

/** Har generatordan nechta namuna olinadi. */
const TAKROR = 4;

/** Nechta shakl ko'rsatiladi. */
const CHEK = 14;

const kod = Number(process.argv[2] ?? 10);
const c = COURSES.find((x) => x.grade === kod);

if (!c) {
  console.log(`\n${kod} kodli kurs yo'q. Mavjudlari:`);
  console.log("  " + COURSES.map((x) => x.grade).join(", ") + "\n");
  process.exit(1);
}

interface Shakl {
  soni: number;
  misol: string;
  javob: string;
  joy: string;
}

const shakllar = new Map<string, Shakl>();
let jami = 0;

for (const [ui, U] of c.units.entries()) {
  for (const [li, L] of U.lessons.entries()) {
    for (const gen of L.gens) {
      for (let k = 0; k < TAKROR; k++) {
        let a;
        try { a = gen(); } catch { break; }
        const matn = String((a as { text?: string }).text ?? a.prompt ?? "");
        jami++;
        // Sonlar `#` ga aylanadi — "12 + 7" va "45 + 3" bitta shakl.
        const kalit = matn.replace(/-?\d+([.,]\d+)?/g, "#");
        const bor = shakllar.get(kalit);
        if (bor) bor.soni++;
        else {
          shakllar.set(kalit, {
            soni: 1, misol: matn, javob: String(a.answer),
            joy: `${ui}-${li} "${L.n}"`,
          });
        }
      }
    }
  }
}

console.log(`\n${c.title} — eng ko'p uchraydigan savol shakllari\n`);
console.log(`  jami ${jami} ta namuna, ${shakllar.size} xil shakl\n`);

const tartib = [...shakllar.values()].sort((a, b) => b.soni - a.soni);
for (const s of tartib.slice(0, CHEK)) {
  const ulush = Math.round((s.soni / jami) * 100);
  console.log(`  ${String(s.soni).padStart(4)}  ${String(ulush).padStart(2)}%  ${s.joy}`);
  console.log(`        ${JSON.stringify(s.misol).slice(0, 60)}`);
  console.log(`        → ${JSON.stringify(s.javob).slice(0, 40)}\n`);
}

const qolgan = tartib.slice(CHEK).reduce((n, s) => n + s.soni, 0);
if (qolgan) console.log(`  … yana ${qolgan} ta namuna, ${tartib.length - CHEK} xil shaklda\n`);
