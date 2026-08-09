/**
 * VARIANTLAR SONINI TEKSHIRADI — har bir savolda to'rttadan bo'lsin.
 *
 * Nega alohida skript kerak: chalg'ituvchilar `pcS`/`zPick` orqali
 * yasaladi va ular TAKRORLANGANINI o'zi tashlab yuboradi. Bu to'g'ri
 * xatti-harakat — bir xil ikki tugma bo'lgandan ko'ra uchta tugma
 * yaxshi. Lekin ba'zi qiymatlarda chalg'ituvchilarning HAMMASI
 * to'g'ri javob bilan ustma-ust tushadi va savolda atigi ikkita
 * variant qoladi.
 *
 * Misol: muntazam 4-burchakda ichki burchak 90°, tashqi burchagi ham
 * 360/4 = 90°, to'ldiruvchisi ham 180 − 90 = 90°. Uchala chalg'ituvchi
 * bitta songa aylanadi va o'quvchi javobni hisoblamasdan, ikkitadan
 * bittasini tanlab topadi.
 *
 * Bunday savol darsda ham, blok testda ham yaroqsiz — lekin u faqat
 * ma'lum sonlarda chiqadi va qo'lda ochib topib bo'lmaydi.
 *
 * Ishga tushirish: `npx jiti scripts/variant.ts`
 */
import * as OLIY from "../src/lib/oliy";
import type { Activity } from "../src/lib/activity";

const URINISH = 300;

/**
 * Nechta variant bo'lishi kerak.
 *
 * To'rtta — ilovadagi barcha savollarning standarti (javob tugmalari
 * ikki ustunga tiziladi). Uchta ham qabul qilinadi: ba'zi mavzuda
 * mantiqan to'rtta har xil javob yo'q ("juft yoki toq" — ikkita,
 * "nechta ildiz" — uchta). Ikkita esa taxminni juda arzon qiladi.
 */
const KAM = 3;

/** Javobi mantiqan ikkita bo'lgan savollar — ular uchun ikkita normal. */
const IKKILIK = new Set([
  "a9Tarmoq",          // yuqoriga yoki pastga
  "a9TrigIshora",      // musbat yoki manfiy
  "g7Tengsizlik",      // mumkin yoki mumkin emas
]);

let xato = 0;
const nomlar = Object.keys(OLIY).filter((k) => typeof (OLIY as never)[k] === "function");

for (const nom of nomlar) {
  const gen = (OLIY as unknown as Record<string, () => Activity>)[nom];
  let engKam = 99;
  let namuna = "";
  for (let i = 0; i < URINISH; i++) {
    const a = gen();
    const n = new Set(a.choices.map(String)).size;
    if (n < engKam) {
      engKam = n;
      namuna = `${"text" in a ? a.text : a.prompt}  →  ${a.choices.join(" | ")}`;
    }
  }
  const chek = IKKILIK.has(nom) ? 2 : KAM;
  if (engKam < chek) {
    console.log(`  ✗ ${nom}: ${engKam} ta variant\n     ${namuna}`);
    xato++;
  }
}

console.log(xato === 0 ? "\n✓ Hammasida yetarli variant bor" : `\n${xato} ta generatorda variant kam`);
process.exit(xato === 0 ? 0 : 1);
