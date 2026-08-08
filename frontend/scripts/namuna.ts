/**
 * Har bir kursdan namuna savollar chiqaradi:
 *
 *     npx jiti scripts/namuna.ts            # hamma kurs
 *     npx jiti scripts/namuna.ts 11-sinf    # bitta kurs (slug bo'yicha)
 *
 * `tekshir.ts` savolning YAROQLI ekanini tekshiradi — javob variantlar
 * ichidami, son o'rinlimi. Lekin u javobning TO'G'RI ekanini bila
 * olmaydi: generator ham savolni, ham javobni o'zi yasaydi, ya'ni
 * noto'g'ri formula yozilsa ikkalasi ham birdek noto'g'ri bo'ladi va
 * tekshiruv buni sezmaydi.
 *
 * Shuning uchun bu skript kerak: u har bir darsdan bitta savol chiqarib
 * beradi va ODAM ularni ko'z bilan o'qib chiqadi. Yangi mavzu
 * qo'shilganda bir marta ishga tushirilsa yetarli.
 */
import { COURSES, courseBySlug } from "../src/lib/curriculum";

const tanlangan = process.argv[2];
const royxat = tanlangan ? [courseBySlug(tanlangan)].filter(Boolean) : COURSES;

if (!royxat.length) {
  console.error(`Kurs topilmadi: ${tanlangan}`);
  console.error(`Mavjud: ${COURSES.map((c) => c.slug).join(", ")}`);
  process.exit(1);
}

for (const c of royxat) {
  if (!c) continue;
  console.log(`\n${"=".repeat(70)}`);
  console.log(`${c.title}   ·   kod ${c.grade}   ·   /kurs/${c.slug}`);
  console.log("=".repeat(70));

  c.units.forEach((U) => {
    console.log(`\n  ${U.u}`);
    U.lessons.forEach((L) => {
      // Bob takrorlash darsi o'z savoli yo'q — u boshqa darslardan
      // yig'iladi, ya'ni bu yerda ikkinchi marta chiqarish ortiqcha.
      if (L.review) return;
      const a = L.gens[0]();
      const matn = "text" in a ? String((a as { text: unknown }).text) : "";
      const bor = a.choices.map(String).includes(String(a.answer));
      console.log(`    ${bor ? " " : "✗"} ${L.n}`);
      console.log(`        ${a.prompt}${matn ? `  —  ${matn}` : ""}`);
      console.log(`        javob: ${a.answer}    variantlar: ${a.choices.join(" · ")}`);
    });
  });
}
console.log("");
