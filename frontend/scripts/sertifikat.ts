/**
 * Milliy sertifikat variantlari sinovi (`src/lib/sertifikat.ts`).
 *
 * Va'dalar: tuzilish rasmiy namunadagidek (45 topshiriq, 100 ball),
 * variant har safar bir xil, ochiq savol javobi — son, moslashtirishda
 * har savolga bitta harf, yozilgan javob "−3" / "-3" / "2.5" / "2,5"
 * ko'rinishida ham to'g'ri o'qiladi.
 */
import "./_xotira";
import {
  BALL, TUZILISH, VARIANTLAR, daraja, maksBall, savolBali, sonTogrimi, variantYasa, yaxlit,
} from "../src/lib/sertifikat";

let xato = 0;
const t = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

for (let n = 1; n <= VARIANTLAR; n++) {
  const v = variantYasa(n);
  if (!v) { t(`${n}-variant yasaldi`, false, "null"); continue; }
  const tur = (x: string) => v.savollar.filter((s) => s.tur === x).length;
  const jami = yaxlit(v.savollar.reduce((a, s) => a + maksBall(s), 0));
  const ok = v.savollar.length === 45 && tur("y1") === TUZILISH.y1 && tur("y2") === TUZILISH.y2
    && tur("o") === TUZILISH.o && jami === 100;
  t(`${n}-variant: 45 topshiriq, 100 ball`, ok, `${v.savollar.length} ta, ${jami} ball`);

  const y2 = v.savollar.filter((s) => s.tur === "y2");
  const javoblar = y2.map((s) => (s.tur === "y2" ? String(s.s.a.answer) : ""));
  t(`${n}-variant: moslashtirish to'g'ri`,
    v.y2.length === 6 && new Set(v.y2.map(String)).size === 6
      && javoblar.every((j) => v.y2.map(String).includes(j)) && new Set(javoblar).size === javoblar.length,
    v.y2.join(" / "));

  const ochiq = v.savollar.filter((s) => s.tur === "o");
  t(`${n}-variant: ochiq javob — son, qismlar bitta bobdan`,
    ochiq.every((s) => s.tur === "o" && s.a.kursId === s.b.kursId && s.a.ui === s.b.ui
      && /^[−-]?\d+([.,]\d+)?$/.test(String(s.a.a.answer)) && /^[−-]?\d+([.,]\d+)?$/.test(String(s.b.a.answer))));

  // Hamma javobi to'g'ri — 100 ball.
  const toliq = v.savollar.reduce((a, s) => a + savolBali(s,
    s.tur === "o" ? { a: String(s.a.a.answer), b: String(s.b.a.answer) } : String(s.s.a.answer)), 0);
  t(`${n}-variant: to'liq javob = 100 ball`, yaxlit(toliq) === 100, String(toliq));
}

t("bir variant — har safar bir xil", JSON.stringify(variantYasa(4)) === JSON.stringify(variantYasa(4)));
t("boshqa variant — boshqa savollar", JSON.stringify(variantYasa(4)) !== JSON.stringify(variantYasa(5)));
t("noto'g'ri raqam — null", variantYasa(0) === null && variantYasa(VARIANTLAR + 1) === null);

t("son: −3 = -3", sonTogrimi("-3", "−3"));
t("son: 2.5 = 2,5", sonTogrimi("2.5", "2,5") && sonTogrimi(" 2,5 ", "2,5"));
t("son: bo'sh javob xato", !sonTogrimi("", "0"));
t("son: 12 ≠ 21", !sonTogrimi("12", "21"));
t("ochiq: faqat a) to'g'ri — 1,5 ball",
  (() => {
    const s = variantYasa(1)!.savollar.find((x) => x.tur === "o")!;
    return s.tur === "o" && savolBali(s, { a: String(s.a.a.answer), b: "999999" }) === BALL.oA;
  })());

t("daraja: 100 → A+, 50 → yo'q", daraja(100) === "A+" && daraja(50) === null);
t("daraja: 62 → C", daraja(62) === "C", String(daraja(62)));

if (xato) {
  console.log(`\n${xato} ta xato`);
  process.exit(1);
}
console.log("\nSertifikat: hammasi joyida");
