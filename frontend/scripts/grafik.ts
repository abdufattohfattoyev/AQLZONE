/**
 * O'yin kartasidagi grafik va oxirgi natijalar (`src/lib/oyin/grafik.ts`,
 * `src/lib/oyin/rekord.ts` → oxirgilar).
 *
 * NEGA SINOV KERAK. Grafik nol bilan bo'lishga juda yaqin turadi (bitta
 * natija, hamma natija teng) va xatosi jim: karta NaN koordinatali bo'sh
 * chiziq bilan qoladi. Oxirgi natijalar esa eski rekord yozuvini buzmasligi
 * kerak — foydalanuvchining rekordlari qurilmada yagona nusxa.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import "./_xotira";
import { G, grafik, haftalikFarq } from "../src/lib/oyin/grafik";
import { OXIRGI_SONI, natijaniYoz, oxirgilar, rekord } from "../src/lib/oyin/rekord";

let xato = 0;
const tekshir = (nom: string, kutilgan: unknown, keldi: unknown) => {
  const ok = JSON.stringify(kutilgan) === JSON.stringify(keldi);
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`,
    ok ? "" : `— kutilgan ${JSON.stringify(kutilgan)}, keldi ${JSON.stringify(keldi)}`);
};
const sonmi = (s: string) => !/NaN|Infinity/.test(s);

console.log("--- grafik ---");
tekshir("bo'sh — grafik yo'q", null, grafik([]));
{
  const g = grafik([31, 35, 33, 40, 38, 44, 48])!;
  tekshir("oxirgi nuqta o'ng chetda", G.W, g.oxirgi.x);
  tekshir("eng kattasi tepada", G.TEPA, g.rekord.y);
  tekshir("oxirgisi rekord — birlashgan", true, g.birlashgan);
  tekshir("maydon pastki chiziqqa yopiladi", true, g.maydon.endsWith(`L${G.W} ${G.PAST} L0 ${G.PAST} Z`));
}
{
  const g = grafik([22, 25, 24, 28, 31, 27, 29])!;
  tekshir("rekord o'rtada — alohida nuqta", false, g.birlashgan);
  tekshir("rekord — 31", 31, g.rekord.qiymat);
  tekshir("oxirgi — 29", 29, g.oxirgi.qiymat);
}
tekshir("bitta natija — NaN yo'q", true, sonmi(grafik([5])!.chiziq + grafik([5])!.oxirgi.x));
tekshir("hammasi teng — NaN yo'q", true, sonmi(grafik([4, 4, 4])!.chiziq));
tekshir("teng rekordlardan eng yangisi", 2 * G.W / 2, grafik([9, 5, 9])!.rekord.x);

console.log("\n--- haftalik farq ---");
const BUGUN = "2026-09-26";
tekshir("bitta natija — farq yo'q", null, haftalikFarq([{ b: 5, k: BUGUN }], BUGUN));
tekshir("hafta ichida o'sish", 17, haftalikFarq([
  { b: 31, k: "2026-09-20" }, { b: 40, k: "2026-09-23" }, { b: 48, k: BUGUN }], BUGUN));
tekshir("haftadan eski natija hisobga olinmaydi", 8, haftalikFarq([
  { b: 10, k: "2026-09-01" }, { b: 40, k: "2026-09-23" }, { b: 48, k: BUGUN }], BUGUN));
tekshir("pasayish manfiy", -3, haftalikFarq([{ b: 9, k: "2026-09-25" }, { b: 6, k: BUGUN }], BUGUN));

console.log("\n--- oxirgi natijalar ---");
tekshir("yangi o'yin — bo'sh", [], oxirgilar("tezkor"));
for (let i = 1; i <= 9; i++) natijaniYoz("tezkor", 1, i * 10);
tekshir("ko'pi bilan 7 ta", OXIRGI_SONI, oxirgilar("tezkor").length);
tekshir("eskidan yangiga, eng eskilari tushadi", [30, 40, 50, 60, 70, 80, 90],
  oxirgilar("tezkor").map((x) => x.b));
tekshir("rekord yozuvi ham ishlayveradi", 90, rekord("tezkor", 1));
tekshir("boshqa o'yinga tegmaydi", [], oxirgilar("jadval"));
localStorage.setItem("azapp_oyin_oxirgi_v1", "buzuq{");
tekshir("buzuq xotira — bo'sh, yiqilmaydi", [], oxirgilar("tezkor"));

console.log(xato === 0 ? "\n✅ grafik: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
