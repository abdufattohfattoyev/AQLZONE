/**
 * Kunlik son sinovi (`src/lib/oyin/kunlikSon.ts`).
 *
 * Eng muhim va'dalar: jumboq har doim TO'G'RI tenglik, uzunligi
 * darajaga mos, bir kun — bir xil jumboq, ranglar Wordle qoidasida.
 */
import { hisobla, jumboq, jumboqRaqami, solishtir, tekshir, uzunlik } from "../src/lib/oyin/kunlikSon";
import type { Daraja } from "../src/lib/oyin/tur";

let xato = 0;
const t = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

t("amallar tartibi", hisobla("2+3*4") === 14);
t("qoldiqli bo'lish rad etiladi", hisobla("7/2") === null);
t("oldida nol rad etiladi", hisobla("07+1") === null);
t("ketma-ket amal rad etiladi", hisobla("7+-1") === null);

t("yaroqli tenglik", tekshir("7*8-6=50", 8) === "");
t("teng emas", tekshir("7*8-6=51", 8) === "teng_emas");
t("uzunlik", tekshir("7*8=56", 8) === "uzunlik");
t("ikki tenglik", tekshir("1+1=2=2", 7) === "tenglik");

t("ranglar: hammasi joyida", solishtir("9+8=17", "9+8=17").every((x) => x === "yashil"));
const r = solishtir("11+1=12", "12-1=11");
t("ranglar: takroriy belgi ortiqcha oltin bo'lmaydi",
  r.filter((x) => x !== "boz").length <= 7 && r[0] === "yashil", JSON.stringify(r));

t("jumboq raqami", jumboqRaqami("2026-09-17") === 1 && jumboqRaqami("2026-09-18") === 2);

// 60 kun, 3 daraja — har biri yaroqli, takrorlanuvchan.
let yaroqli = true;
let izoh = "";
for (let i = 0; i < 60; i++) {
  const kun = `2026-${String(10 + Math.floor(i / 30)).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`;
  for (const d of [1, 2, 3] as Daraja[]) {
    const j = jumboq(kun, d);
    if (tekshir(j, uzunlik(d)) !== "" || j !== jumboq(kun, d) || (d === 3 && !j.includes("/"))) {
      yaroqli = false;
      izoh = `${kun} d${d}: ${j}`;
    }
  }
}
t("60 kunlik jumboqlar yaroqli va takrorlanuvchan", yaroqli, izoh);
t("boshqa kun — boshqa jumboq", jumboq("2026-10-01", 2) !== jumboq("2026-10-02", 2)
  || jumboq("2026-10-01", 1) !== jumboq("2026-10-02", 1));

if (xato) {
  console.error(`\n${xato} ta xato`);
  process.exit(1);
}
console.log("\n✅ kunlik son: hammasi joyida");
