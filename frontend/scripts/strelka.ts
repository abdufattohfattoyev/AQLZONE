/**
 * Strelka yo'li (`src/lib/oyin/strelka.ts`): 1..60-darajalar yasaladi va
 * tekshiriladi — buzilgan holatda shar yetmaydi, yechim YAGONA va u
 * haqiqatan sharni yulduzga olib boradi; bir xil raqam — bir xil maydon.
 */
import { daraja, yechimlar, yurgiz } from "../src/lib/oyin/strelka";

let xato = 0;
const t0 = Date.now();
for (let n = 1; n <= 60; n++) {
  const d = daraja(n);
  const muammo: string[] = [];
  if (yurgiz(d, d.strelka).tur === "yetdi") muammo.push("buzilmagan");
  const ys = yechimlar(d);
  if (ys.length !== 1) muammo.push(`yechim ${ys.length} ta`);
  if (yurgiz(d, { ...d.strelka, [d.yechim.katak]: d.yechim.yon }).tur !== "yetdi") muammo.push("yechim ishlamaydi");
  if (JSON.stringify(daraja(n)) !== JSON.stringify(d)) muammo.push("takrorlanmaydi");
  if (muammo.length) { xato++; console.log(`❌ ${n}-daraja: ${muammo.join(", ")}`); }
}
console.log(xato ? `\n❌ strelka: ${xato} ta xato` : `\n✅ strelka: 60 daraja — hammasi joyida (${Date.now() - t0} ms)`);
if (xato) process.exit(1);
