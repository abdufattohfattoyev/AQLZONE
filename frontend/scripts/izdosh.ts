/**
 * Izdosh darajalari (`src/lib/oyin/izdosh.ts`): har biri YECHILADI,
 * IZDOSHSIZ YECHILMAYDI (aks holda daraja o'yinning g'oyasini o'rgatmaydi)
 * va yozilgan "eng qisqa" son haqiqiy eng qisqa yechimga teng.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import { DARAJALAR, yech } from "../src/lib/oyin/izdosh";

let xato = 0;
DARAJALAR.forEach((d, i) => {
  const y = yech(d, false, 50);
  const y0 = yech(d, true, 50);
  const ok = Boolean(y) && !y0 && y!.length === d.engQisqa;
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${i + 1}. ${d.nom[0]} — eng qisqa ${y ? y.length : "yo'q"} (yozilgan ${d.engQisqa})`
    + (y0 ? " — izdoshsiz ham yechiladi!" : ""));
});
console.log(xato ? `\n❌ izdosh: ${xato} ta xato` : "\n✅ izdosh: hammasi joyida");
if (xato) process.exit(1);
