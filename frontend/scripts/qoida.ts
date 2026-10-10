/**
 * Qoida ovi (`src/lib/oyin/qoida.ts`): ko'p urug' bilan savol yasaladi va
 * har biri tekshiriladi — misollar to'g'ri, takror son yo'q, pastda kamida
 * 2 ta o'tadigan va 2 ta o'tmaydigan bor, javob BIR MA'NOLI.
 */
import { QOIDALAR, RAUND, bosqichi, savolYasa, tasodif } from "../src/lib/oyin/qoida";

let xato = 0;
const qoidalar = new Set<string>();
for (let urug = 1; urug <= 300; urug++) {
  const r = tasodif(urug);
  let oldingi: string | undefined;
  for (let i = 0; i < RAUND; i++) {
    const s = savolYasa(bosqichi(i), r, oldingi);
    oldingi = s.qoida.id;
    qoidalar.add(s.qoida.id);
    const hamma = [...s.otdi, ...s.otmadi, ...s.sonlar];
    const muammo: string[] = [];
    if (new Set(hamma).size !== hamma.length) muammo.push("takror son");
    if (!s.otdi.every(s.qoida.mos) || s.otmadi.some(s.qoida.mos)) muammo.push("misol noto'g'ri");
    const ha = s.javob.filter(Boolean).length;
    if (ha < 2 || s.sonlar.length - ha < 2) muammo.push("pastda muvozanat yo'q");
    for (const q of QOIDALAR) {
      if (q.id === s.qoida.id || !s.otdi.every(q.mos) || s.otmadi.some(q.mos)) continue;
      if (s.sonlar.some((n, j) => q.mos(n) !== s.javob[j])) muammo.push(`ikki ma'noli: ${q.id}`);
    }
    if (muammo.length) {
      xato++;
      if (xato < 10) console.log(`❌ urug' ${urug}, ${i + 1}-savol (${s.qoida.id}): ${muammo.join(", ")}`);
    }
  }
}
console.log(`${qoidalar.size === QOIDALAR.length ? "✅" : "❌"} qoidalar chiqdi: ${qoidalar.size}/${QOIDALAR.length}`);
if (qoidalar.size !== QOIDALAR.length) xato++;
console.log(xato ? `\n❌ qoida ovi: ${xato} ta xato` : "\n✅ qoida ovi: 2400 savol — hammasi joyida");
if (xato) process.exit(1);
