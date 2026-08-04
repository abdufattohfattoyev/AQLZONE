/**
 * O'quv dasturini tekshiradi:
 *
 *     npm run tekshir
 *
 * Har bir darsning har bir generatorini ko'p marta ishga tushiradi va
 * savolning o'yin uchun YAROQLI ekanini tekshiradi. Nima uchun kerak:
 * generatorlar tasodifiy sonlarga tayanadi, shuning uchun xato faqat
 * ma'lum bir qiymatlarda ko'rinadi — masalan "8 − 9" manfiy chiqishi yoki
 * to'g'ri javob variantlar ichida umuman bo'lmasligi. Bola darsni ochganda
 * emas, shu yerda tutilsin.
 */
import { COURSES, lessonCount } from "../src/lib/curriculum";

const TAKROR = 80;

const s = (v: unknown) => String(v);
const xatolar: string[] = [];
let savol = 0;

for (const c of COURSES) {
  // Manfiy son 6-sinfda MAVZUNING O'ZI ("Musbat va manfiy sonlar"), undan
  // oldingi sinflarda esa xato belgisi: "8 − 9" kabi savol o'tilmagan
  // amalga olib boradi. Shuning uchun taqiq sinfga qarab yechiladi.
  const manfiyMumkin = c.grade >= 6;
  c.units.forEach((U, ui) => {
    U.lessons.forEach((L, li) => {
      const joy = `${c.slug} ${ui}-${li} "${L.n}"`;
      if (!L.gens.length) {
        xatolar.push(`${joy}: generator yo'q`);
        return;
      }
      for (let k = 0; k < TAKROR; k++) {
        let a;
        try {
          a = L.gens[k % L.gens.length]();
        } catch (e) {
          xatolar.push(`${joy}: generator xato berdi — ${(e as Error).message}`);
          break;
        }
        savol++;

        if (a.answer === undefined || a.answer === null || s(a.answer) === "NaN")
          xatolar.push(`${joy}: javob yo'q (${s(a.answer)})`);
        if (!manfiyMumkin && typeof a.answer === "number" && a.answer < 0)
          xatolar.push(`${joy}: javob manfiy (${a.answer}) — bu yoshda manfiy son yo'q`);
        if (!a.prompt) xatolar.push(`${joy}: prompt bo'sh`);

        if (!Array.isArray(a.choices) || a.choices.length < 2) {
          xatolar.push(`${joy}: variant yetarli emas (${a.choices?.length})`);
          continue;
        }
        if (!a.choices.some((x) => s(x) === s(a.answer)))
          xatolar.push(`${joy}: to'g'ri javob variantlar ichida yo'q — ${s(a.answer)} ∉ [${a.choices.join(", ")}]`);
        if (new Set(a.choices.map(s)).size !== a.choices.length)
          xatolar.push(`${joy}: variantlar takrorlangan — [${a.choices.join(", ")}]`);
        if (a.choices.some((x) => s(x) === "NaN" || (!manfiyMumkin && typeof x === "number" && x < 0)))
          xatolar.push(`${joy}: variantda yaroqsiz qiymat — [${a.choices.join(", ")}]`);
      }
    });
  });
}

console.log("\nAql Zone — o'quv dasturi\n");
for (const c of COURSES)
  console.log(`  ${c.slug.padEnd(12)} ${String(c.units.length).padStart(2)} bob   ${String(lessonCount(c)).padStart(3)} dars`);
console.log(`\n  jami ${COURSES.reduce((n, c) => n + lessonCount(c), 0)} dars, ${savol} ta savol yasab ko'rildi`);

const noyob = [...new Set(xatolar)];
if (noyob.length) {
  console.log(`\n❌ ${xatolar.length} muammo (${noyob.length} xil):\n`);
  for (const x of noyob.slice(0, 40)) console.log("   " + x);
  process.exit(1);
}
console.log("\n✅ hammasi joyida\n");
