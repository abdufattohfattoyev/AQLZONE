/**
 * O'zlashtirish darajasi (`lib/ozlashtirish.ts`) va asos mavzular (`lib/asos.ts`).
 * Va'da: Khan Academy qoidalari (70% / 100% / aralash testda xatosiz),
 * xato bir pog'ona tushiradi, har asos haqiqiy bobga ishora qiladi va halqa yo'q.
 */
import "./_xotira";
import { yangiDaraja, natijaYoz, darajasi, boblargaYig } from "../src/lib/ozlashtirish";
import { ASOS } from "../src/lib/asos";
import { courseById } from "../src/lib/curriculum";

let xato = 0;
const t = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

t("mashq 60% → Urinilgan", yangiDaraja(undefined, { togri: 6, jami: 10 }, "mashq") === 0);
t("mashq 70% → Tanish", yangiDaraja(undefined, { togri: 7, jami: 10 }, "mashq") === 1);
t("mashq 100% → Bilaman", yangiDaraja(1, { togri: 10, jami: 10 }, "mashq") === 2);
t("mashq 100% O'zlashtirilganni tushirmaydi", yangiDaraja(3, { togri: 10, jami: 10 }, "mashq") === 3);
t("mashq 50% O'zlashtirilganni tushiradi", yangiDaraja(3, { togri: 5, jami: 10 }, "mashq") === 0);
t("aralash xatosiz: Bilaman → O'zlashtirilgan", yangiDaraja(2, { togri: 3, jami: 3 }, "aralash") === 3);
t("aralash xato: O'zlashtirilgan → Bilaman", yangiDaraja(3, { togri: 1, jami: 2 }, "aralash") === 2);
t("aralash xato: yangi → Urinilgan", yangiDaraja(undefined, { togri: 0, jami: 1 }, "aralash") === 0);
t("aralash xatosiz: yangi → Tanish", yangiDaraja(undefined, { togri: 1, jami: 1 }, "aralash") === 1);
t("mashqda 3 tadan kam savol — aralash qoidasi", yangiDaraja(1, { togri: 2, jami: 2 }, "mashq") === 2);

const yig = boblargaYig([
  { kursId: "algebra8", ui: 2, togri: true }, { kursId: "algebra8", ui: 2, togri: false }, { kursId: "algebra9", ui: 0, togri: true },
]);
t("boblarga yig'ish", yig.length === 2 && yig[0].jami === 2 && yig[0].togri === 1);
natijaYoz([{ kursId: "algebra8", ui: 2, togri: 10, jami: 10 }], "mashq");
t("yozildi va o'qildi", darajasi("algebra8", 2) === 2);

const bor = (k: string) => { const [id, ui] = k.split("|"); return Boolean(courseById(id)?.units[Number(ui)]); };
t("asoslar haqiqiy boblar", Object.entries(ASOS).every(([k, v]) => bor(k) && v.every(bor)),
  Object.entries(ASOS).filter(([k, v]) => !bor(k) || !v.every(bor)).map(([k]) => k).join(", "));
const halqa = (k: string, yol: Set<string>): boolean =>
  yol.has(k) || (ASOS[k] ?? []).some((x) => halqa(x, new Set([...yol, k])));
t("asoslarda halqa yo'q", Object.keys(ASOS).every((k) => !halqa(k, new Set())));

if (xato) { console.log(`\n${xato} ta xato`); process.exit(1); }
console.log("\nO'zlashtirish: hammasi joyida");
