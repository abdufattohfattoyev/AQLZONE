/**
 * JONLI DARSLAR FAYLLARINI TEKSHIRISH (`public/darslar/*.json`).
 *
 * Nega kerak: darslar AI bilan yasaladi va qo'lda tahrirlanadi. Ilova
 * buzilgan sahnani jim tashlab ketadi (`tekshirDars`) — ya'ni xato
 * ekranda ko'rinmaydi, faqat dars qisqarib qoladi. Bu skript har sahna,
 * chizma va savol o'qilishini, ro'yxatdagi har mavzuning fayli borligini
 * va mavzu slug'i DTM ro'yxatida borligini tekshiradi.
 *
 * Ishga tushirish: `npx jiti scripts/darslar.ts`
 */
import "./_xotira";
import { existsSync, readFileSync } from "node:fs";
import { mavzuBySlug } from "../src/lib/dtmMavzu";
import { tekshirMavzu } from "../src/lib/jonliDars";

let xato = 0;
const shikoyat = (gap: string) => {
  console.log(`  ✗ ${gap}`);
  xato++;
};

const royxat = JSON.parse(readFileSync("public/darslar/royxat.json", "utf8")) as string[];
console.log(`\n--- jonli darslar: ${royxat.length} mavzu ---`);
for (const slug of royxat) {
  if (!mavzuBySlug(slug)) shikoyat(`${slug}: DTM mavzulari ro'yxatida yo'q`);
  const yol = `public/darslar/${slug}.json`;
  if (!existsSync(yol)) { shikoyat(`${slug}: fayl yo'q`); continue; }
  const xom = JSON.parse(readFileSync(yol, "utf8"));
  const m = tekshirMavzu(xom);
  if (!m) { shikoyat(`${slug}: fayl o'qilmadi`); continue; }
  if (m.slug !== slug) shikoyat(`${slug}: ichidagi slug "${m.slug}"`);
  for (const d of m.darslar) {
    const asl = (xom.darslar as { n: number; sahnalar: { chizma?: unknown; savol?: unknown }[] }[]).find((x) => x.n === d.n)!;
    const tushdi = asl.sahnalar.length - d.sahnalar.length;
    const chizma = asl.sahnalar.filter((s) => s.chizma).length - d.sahnalar.filter((s) => s.chizma).length;
    const savol = asl.sahnalar.filter((s) => s.savol).length - d.sahnalar.filter((s) => s.savol).length;
    if (tushdi || chizma || savol) shikoyat(`${slug} ${d.n}-dars: tushib qoldi — sahna ${tushdi}, chizma ${chizma}, savol ${savol}`);
    if (!d.sahnalar.some((s) => s.savol)) shikoyat(`${slug} ${d.n}-dars: birorta savol yo'q`);
  }
  console.log(`  ✓ ${slug}: ${m.darslar.length} dars, ${m.darslar.reduce((s, d) => s + d.sahnalar.length, 0)} sahna`);
}

console.log(xato ? `\n❌ ${xato} ta xato\n` : "\n✅ jonli darslar: hammasi joyida\n");
if (xato) process.exit(1);
