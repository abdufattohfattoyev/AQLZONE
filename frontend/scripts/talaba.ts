/**
 * Oliy matematika savollari sinovi (`src/lib/oliy/talaba.ts`).
 *
 * Har generator 500 marta chaqiriladi: javob variantlar ichida, to'rtta
 * HAR XIL variant, matnda "NaN" / "undefined" yo'q. Sonli javoblar
 * mustaqil formula bilan qayta hisoblanadigan joyda — qayta tekshiriladi.
 */
import "./_xotira";
import * as T from "../src/lib/oliy/talaba";
import { oliy1 } from "../src/lib/curriculum/oliy1";
import { COURSES, maktabKursi } from "../src/lib/curriculum";

let xato = 0;
const t = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) { xato++; console.log(`❌ ${nom} — ${izoh}`); }
};

const gens = Object.entries(T).filter(([, f]) => typeof f === "function") as [string, () => {
  answer: string | number; choices: (string | number)[]; text?: string; prompt: string;
}][];

for (const [nom, g] of gens) {
  for (let i = 0; i < 500; i++) {
    const a = g();
    const matn = JSON.stringify(a);
    t(`${nom}: NaN yo'q`, !/NaN|undefined|Infinity/.test(matn), matn);
    t(`${nom}: javob variantlarda`, a.choices.map(String).includes(String(a.answer)), matn);
    t(`${nom}: 4 ta variant`, a.choices.length === 4, matn);
    t(`${nom}: variantlar har xil`, new Set(a.choices.map(String)).size === a.choices.length, matn);
    t(`${nom}: savol matni bor`, Boolean(a.prompt), matn);
    if (xato > 20) break;
  }
}

/* ---- mustaqil qayta hisob: 2×2 determinant ---- */
for (let i = 0; i < 200; i++) {
  const a = T.o1Det2() as unknown as { text: string; answer: string };
  const s = a.text.match(/−?\d+/g)!.map((x) => Number(x.replace("−", "-")));
  const [p, q, r, u] = s.slice(-4);
  t("det2 to'g'ri", Number(a.answer.replace("−", "-")) === p * u - q * r, a.text);
}

/* ---- kurs tuzilishi ---- */
t("kursda 6 bob", oliy1.length >= 6, String(oliy1.length));
t("har darsda generator bor", oliy1.every((u) => u.lessons.every((l) => l.gens.length > 0)));
const oliy = COURSES.filter((c) => !maktabKursi(c));
t("talabalar kursi ro'yxatda", oliy.length === 1 && oliy[0].grade === 301);
t("slug yagona", new Set(COURSES.map((c) => c.slug)).size === COURSES.length);
t("grade yagona", new Set(COURSES.map((c) => c.grade)).size === COURSES.length);

console.log(xato ? `\n❌ talaba: ${xato} ta xato` : "✅ talaba: hammasi joyida");
if (xato) process.exit(1);
