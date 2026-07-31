/**
 * O'yin savollarining sinovi (`src/lib/oyin/`).
 *
 * NEGA SINOV KERAK. Savollar TASODIFIY yasaladi va shu sabab ularning
 * nuqsoni brauzerda ko'rinmasligi mumkin: yuz savoldan bittasida ikkita
 * to'g'ri variant chiqsa, uni qo'lda o'ynab topib bo'lmaydi. Bola esa
 * uni darrov topadi — va to'g'ri javob berib "xato" degan yozuvni
 * ko'rgan bola o'yinga qaytmaydi.
 *
 * Uch narsa tekshiriladi:
 *
 *   1. Javob variantlar ichida va FAQAT BITTA marta uchraydi.
 *   2. Savolda "NaN", "undefined" kabi buzuq matn yo'q.
 *   3. "24" topishmog'i haqiqatan ham so'ralgan darajaga mos va
 *      yechimi bor.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import { belgi, jadval, ketma, tarozi, taxmin, tezkor } from "../src/lib/oyin/savollar";
import {
  birlashtir, darajasi, kasrMatn, sondan, yangiTopishmoq, yechim, yigirmaTortmi,
} from "../src/lib/oyin/yigirma";
import type { Daraja, Generator } from "../src/lib/oyin/tur";

let xato = 0;
const tekshir = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

const DARAJALAR: Daraja[] = [1, 2, 3];
/** Har generator va daraja uchun shuncha savol yasab ko'riladi. */
const URINISH = 400;

/* ------------------------------------------------------ oqim savollari */

const GENLAR: [string, Generator][] = [
  ["tezkor", tezkor],
  ["belgi", belgi],
  ["jadval", jadval],
  ["ketma", ketma],
  ["taxmin", taxmin],
  ["tarozi", tarozi],
];

console.log("--- oqim savollari ---");

for (const [nom, gen] of GENLAR) {
  for (const d of DARAJALAR) {
    let buzuq = "";
    for (let i = 0; i < URINISH && !buzuq; i++) {
      const s = gen(d);
      const j = JSON.stringify(s);

      if (!s.matn) buzuq = "matn bo'sh";
      else if (/NaN|undefined|Infinity/.test(j)) buzuq = `buzuq son: ${j}`;
      else if (s.variantlar.length !== 2 && s.variantlar.length !== 4)
        buzuq = `variantlar soni ${s.variantlar.length}: ${j}`;
      else if (new Set(s.variantlar).size !== s.variantlar.length)
        buzuq = `variantlar takrorlandi: ${j}`;
      // Eng muhim shart: to'g'ri javob ro'yxatda BOR va BITTA.
      else if (s.variantlar.filter((v) => v === s.javob).length !== 1)
        buzuq = `javob "${s.javob}" ro'yxatda bir marta emas: ${j}`;
    }
    tekshir(`${nom} · ${d}-daraja — ${URINISH} savol butun`, !buzuq, buzuq);
  }
}

/* ------------------------------------------------------ kasr arifmetikasi */

console.log("\n--- kasr arifmetikasi ---");

const K = (n: number) => sondan(n);
const q = (a: number, b: number, amal: "+" | "−" | "×" | "÷") =>
  kasrMatn(birlashtir(K(a), K(b), amal)!);

tekshir("8 ÷ 3 kasr bo'lib qoladi", q(8, 3, "÷") === "8/3", q(8, 3, "÷"));
tekshir("6 ÷ 3 butun bo'ladi", q(6, 3, "÷") === "2", q(6, 3, "÷"));
tekshir("3 − 8/3 = 1/3", (() => {
  const x = birlashtir(K(8), K(3), "÷")!;
  return kasrMatn(birlashtir(K(3), x, "−")!) === "1/3";
})(), "");
tekshir("8 ÷ (3 − 8÷3) roppa-rosa 24", (() => {
  const a = birlashtir(K(8), K(3), "÷")!;
  const b = birlashtir(K(3), a, "−")!;
  return yigirmaTortmi(birlashtir(K(8), b, "÷")!);
})(), "double bilan 23.999… chiqardi");
tekshir("nolga bo'lish null qaytaradi", birlashtir(K(5), K(0), "÷") === null, "");

/* ------------------------------------------------------ 24 topishmog'i */

console.log("\n--- 24 topishmog'i ---");

tekshir("4·6·1·1 — 1-daraja (faqat + va ×)", darajasi([4, 6, 1, 1]) === 1,
  String(darajasi([4, 6, 1, 1])));
tekshir("5·5·1·1 — 2-daraja (5×5−1×1, oraliq butun)", darajasi([5, 5, 1, 1]) === 2,
  String(darajasi([5, 5, 1, 1])));
tekshir("3·3·8·8 — 3-daraja (kasr shart)", darajasi([3, 3, 8, 8]) === 3,
  String(darajasi([3, 3, 8, 8])));
tekshir("1·1·1·1 — yechimi yo'q", darajasi([1, 1, 1, 1]) === null,
  String(darajasi([1, 1, 1, 1])));
// 5·5·5·1 ning yagona yechimi 5×(5−1÷5) — oraliqda 1/5 chiqadi, ya'ni u
// "5×5−5÷5" emas (unda beshta 5 kerak bo'lardi). Aynan shuning uchun bu
// topishmoq uchinchi darajada turadi.
tekshir("1·5·5·5 — 3-daraja", darajasi([1, 5, 5, 5]) === 3,
  String(darajasi([1, 5, 5, 5])));

for (const d of DARAJALAR) {
  let buzuq = "";
  for (let i = 0; i < 40 && !buzuq; i++) {
    const r = yangiTopishmoq(d);
    if (r.length !== 4) buzuq = `raqamlar soni ${r.length}`;
    else if (r.some((x) => x < 1 || x > 9)) buzuq = `raqam chegaradan chiqdi: ${r}`;
    else if (darajasi(r) !== d) buzuq = `${r} → daraja ${darajasi(r)}, kutilgan ${d}`;
    else if (!yechim(r)) buzuq = `${r} — yechimi topilmadi`;
  }
  tekshir(`${d}-daraja — 40 topishmoq to'g'ri`, !buzuq, buzuq);
}

/* --------------------------------------------------------------- yakun */

console.log(xato ? `\n${xato} ta xato` : "\nHammasi joyida");
process.exit(xato ? 1 : 0);
