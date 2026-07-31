/**
 * Duel savollarining sinovi (`src/lib/oyin/duel.ts`).
 *
 * Butun bellashuv bitta va'daga tayanadi: **ikkala o'yinchi bir xil
 * savolni oladi**. U buzilsa duel adolatsiz bo'lib qoladi va buni
 * brauzerda topib bo'lmaydi — ikki qurilmada bir vaqtda o'ynab ko'rish
 * kerak bo'lardi.
 */
import { duelSavollari, raqibBali, sanoqniYoz } from "../src/lib/oyin/duel";
import { OYINLAR } from "../src/lib/oyin";

let xato = 0;
const tekshir = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

// Kalitda `ost` ham bor: tarozida savolning O'ZI (shartlar) aynan
// shu qatorda turadi va `matn` ikki savolda bir xil bo'lishi mumkin.
const belgi = (s: { matn: string; ost?: string; javob: string }[]) =>
  s.map((x) => `${x.matn}|${x.ost ?? ""}|${x.javob}`).join("~");

/* --- bir urug' — bir xil savollar (ikkala qurilmada) --- */
const a = duelSavollari(123456, "tezkor", 2);
const b = duelSavollari(123456, "tezkor", 2);
tekshir("bir urug' — bir xil savollar", belgi(a) === belgi(b));
tekshir("boshqa urug' — boshqa savollar",
  belgi(a) !== belgi(duelSavollari(999999, "tezkor", 2)));

/* --- har bir o'yin uchun ro'yxat to'la va yaroqli --- */
for (const o of OYINLAR.filter((x) => x.tur === "oqim")) {
  const s = duelSavollari(42, o.id, 2);
  tekshir(`${o.id}: 60 ta savol`, s.length === 60, `${s.length} ta`);
  tekshir(`${o.id}: javob variantlar ichida`,
    s.every((q) => q.variantlar.includes(q.javob)));
  tekshir(`${o.id}: yonma-yon takror yo'q`,
    s.every((q, i) => i === 0 || belgi([q]) !== belgi([s[i - 1]])));
}

/* --- noma'lum o'yin bo'sh ro'yxat qaytaradi, yiqilmaydi --- */
tekshir("noma'lum o'yin bo'sh ro'yxat", duelSavollari(1, "yoq-bunday", 2).length === 0);

/* --- raqib chizig'i --- */
const sanoq = [0, 2, 5, 9, 14];
tekshir("raqib bali soniya bo'yicha", raqibBali(sanoq, 3) === 9);
tekshir("oxiridan keyin oxirgi qiymat qoladi", raqibBali(sanoq, 99) === 14);
tekshir("bo'sh sanoqda nol", raqibBali([], 5) === 0);

const yozuv: number[] = [];
sanoqniYoz(yozuv, 0, 1);
sanoqniYoz(yozuv, 4, 7);
tekshir("oraliq to'ldiriladi", yozuv.length === 5 && yozuv[2] === 1 && yozuv[4] === 7,
  JSON.stringify(yozuv));

console.log(xato ? `\n${xato} ta nuqson` : "\nDuel — hammasi joyida");
process.exit(xato ? 1 : 0);
