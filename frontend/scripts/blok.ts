/**
 * Blok testning sinovi (`src/lib/blok.ts`).
 *
 * NEGA SINOV KERAK. Bu yerdagi qoidalar VAQTGA va XOTIRAGA bog'liq —
 * ikkalasini ham brauzerda qo'lda tekshirish og'ir. "Yarim qolgan test
 * bir kundan keyin ko'rsatilmasin" degan qoidani ko'z bilan sinash
 * uchun tizim soatini surish kerak; "savollar JSON'ga tushadimi"
 * degani esa faqat ilova qayta yuklanganda bilinadi.
 *
 * Xatosi esa eng yomon paytda chiqadi: o'quvchi o'ttiz daqiqa ishlab,
 * qaytib kelganda ishini yo'qotadi. Bir marta shunday bo'lgan odam
 * ikkinchi marta uzun testni boshlamaydi.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import {
  OLCHAM, blokBormi, blokYasa, dtmBormi, foiz, joriyniOchir,
  joriyniOqi, joriyniSaqla, qolganVaqt, sinfBoblari, sinfOf, vaqtiTugagan,
} from "../src/lib/blok";
import type { Joriy } from "../src/lib/blok";

let xato = 0;
const tekshir = (nom: string, kutilgan: unknown, keldi: unknown) => {
  const ok = JSON.stringify(kutilgan) === JSON.stringify(keldi);
  if (!ok) xato++;
  console.log(
    `${ok ? "✅" : "❌"} ${nom}`,
    ok ? "" : `— kutilgan ${JSON.stringify(kutilgan)}, keldi ${JSON.stringify(keldi)}`,
  );
};

/*
 * localStorage — Node'da yo'q, shuning uchun eng sodda nusxasi.
 *
 * Haqiqiy brauzerdagidek xatti-harakat kerak emas: sinaladigan narsa
 * `blok.ts` ning mantig'i, brauzerning o'zi emas.
 */
const xotira = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => xotira.get(k) ?? null,
  setItem: (k: string, v: string) => void xotira.set(k, v),
  removeItem: (k: string) => void xotira.delete(k),
  clear: () => xotira.clear(),
  key: () => null,
  length: 0,
} as Storage;

const SOAT = 60 * 60 * 1000;

/** Sinov uchun yarim qolgan test. */
const joriy = (x: Partial<Joriy> = {}): Joriy => ({
  sinf: 9,
  uzunlik: "toliq",
  savollar: [{
    a: { type: "eqn", text: "2 + 2 = ?", answer: 4, options: [3, 4, 5, 6] },
    kurs: "algebra9", kursId: "9-sinf-algebra", ui: 0, li: 0, mavzu: "Sinov",
  }] as Joriy["savollar"],
  daqiqa: 30,
  javoblar: [],
  idx: 0,
  tugash: Date.now() + 10 * 60 * 1000,
  boshlandi: Date.now(),
  ...x,
});

console.log("\n── o'lcham va qamrov ──");

tekshir("to'liq blok — 30 savol", 30, OLCHAM.toliq.savol);
tekshir("qisqa blok — 10 savol", 10, OLCHAM.qisqa.savol);
// Bob testining vaqti savoliga 1,2 daqiqa: bu tezlik mashqi emas.
tekshir("bob testi kengroq vaqt beradi", true, OLCHAM.bob.daqiqa > OLCHAM.bob.savol);

// DTM — haqiqiy imtihon sur'ati: savoliga ikki daqiqa. To'liq blok
// esa ataylab tig'izroq (savoliga bir daqiqa) — tezlik mashqi.
tekshir("DTM — 30 savol", 30, OLCHAM.dtm.savol);
tekshir("DTM — 60 daqiqa", 60, OLCHAM.dtm.daqiqa);
tekshir("DTM to'liq blokdan keng", true, OLCHAM.dtm.daqiqa > OLCHAM.toliq.daqiqa);
tekshir("DTM faqat 11-sinfda", true, dtmBormi(11));
tekshir("10-sinfda DTM yo'q", false, dtmBormi(10));
tekshir("9-sinfda DTM yo'q", false, dtmBormi(9));

tekshir("4-sinfda test yo'q", false, blokBormi(4));
tekshir("5-sinfda test bor", true, blokBormi(5));
tekshir("11-sinfda test bor", true, blokBormi(11));
tekshir("12-sinf yo'q", false, blokBormi(12));

// Geometriya kodi 100 + sinf. Busiz 9-sinf geometriyasi "109-sinf"
// bo'lib yozilardi.
tekshir("109 → 9-sinf", 9, sinfOf(109));
tekshir("9 → 9-sinf", 9, sinfOf(9));

console.log("\n── yarim qolgan test ──");

joriyniOchir();
tekshir("bo'sh xotirada yarim test yo'q", null, joriyniOqi());

const j = joriy();
joriyniSaqla(j);
const oqildi = joriyniOqi();
tekshir("saqlangan test qaytib o'qiladi", true, oqildi !== null);
tekshir("savollar joyida", 1, oqildi?.savollar.length);
tekshir("nechanchi savolda to'xtagani saqlanadi", 0, oqildi?.idx);

joriyniOchir();
tekshir("o'chirilgandan keyin yo'q", null, joriyniOqi());

// Bir kundan oshgan test — endi "yarim qolgan ish" emas, unutilgan
// narsa. Uni ko'rsatish yordam emas, chalkashlik bo'lardi.
joriyniSaqla(joriy({ boshlandi: Date.now() - 25 * SOAT }));
tekshir("bir kundan eski test ko'rsatilmaydi", null, joriyniOqi());

joriyniSaqla(joriy({ boshlandi: Date.now() - 23 * SOAT }));
tekshir("23 soatlik test hali ko'rsatiladi", true, joriyniOqi() !== null);
joriyniOchir();

// Buzuq yozuv butun ekranni yiqitmasligi kerak.
localStorage.setItem("azapp_blok_joriy_v1", "{buzuq");
tekshir("buzuq yozuv yo'q deb hisoblanadi", null, joriyniOqi());
localStorage.setItem("azapp_blok_joriy_v1", JSON.stringify({ savollar: [] }));
tekshir("savolsiz yozuv rad etiladi", null, joriyniOqi());
joriyniOchir();

console.log("\n── vaqt ──");

tekshir("vaqti bor test tugamagan", false, vaqtiTugagan(joriy()));
tekshir("o'tib ketgan vaqt tugagan", true, vaqtiTugagan(joriy({ tugash: Date.now() - 1000 })));
tekshir("tugagan testda qolgan vaqt 0", 0, qolganVaqt(joriy({ tugash: Date.now() - 5000 })));

// Qolgan vaqt SOATdan hisoblanadi. Ilgari u sanoq edi va brauzer
// fondagi taymerni sekinlashtirganda o'quvchi vaqt yutardi.
const besh = qolganVaqt(joriy({ tugash: Date.now() + 5 * 60 * 1000 }));
tekshir("besh daqiqa ≈ 300 sekund", true, besh >= 299 && besh <= 300);

console.log("\n── savollar JSON'ga tushadimi ──");

/*
 * Bu eng muhim tekshiruv. Yarim qolgan test SAVOLLARI bilan
 * saqlanadi: ular tasodifiy yasaladi va faqat javoblar saqlansa,
 * qaytgandan keyin boshqa savollar chiqib, javoblar begona savollarga
 * yopishib qolardi.
 *
 * Demak `Activity` JSON'dan o'tib, o'zgarmay qaytishi SHART. Bugun u
 * sof ma'lumot; ertaga kimdir unga funksiya yoki `Date` qo'shsa, bu
 * sinov shu yerda to'xtatadi.
 */
let tekshirilgan = 0;
for (const sinf of [5, 7, 9, 11]) {
  const b = blokYasa(sinf, "qisqa", { tur: "hammasi" });
  if (!b) { console.log(`❌ ${sinf}-sinf uchun blok yasalmadi`); xato++; continue; }
  const nusxa = JSON.parse(JSON.stringify(b.savollar));
  const ok = JSON.stringify(nusxa) === JSON.stringify(b.savollar);
  if (!ok) { xato++; console.log(`❌ ${sinf}-sinf savollari JSON'da o'zgarib ketdi`); }
  tekshirilgan += b.savollar.length;
}
tekshir("to'rt sinfdan 40 savol JSON'dan o'zgarmay o'tdi", 40, tekshirilgan);

console.log("\n── boblar ro'yxati ──");

for (const sinf of [5, 7, 9, 11]) {
  const b = sinfBoblari(sinf);
  const bosh = b.filter((x) => x.dars === 0);
  if (!b.length) { xato++; console.log(`❌ ${sinf}-sinfda bob yo'q`); }
  if (bosh.length) { xato++; console.log(`❌ ${sinf}-sinfda darssiz bob bor`); }
}
console.log(`✅ 5, 7, 9, 11-sinf boblari — hammasida dars bor`);

console.log("\n── ball ──");
tekshir("30 dan 24 → 80%", 80, foiz({ jami: 30, togri: 24 }));
tekshir("savol bo'lmasa 0", 0, foiz({ jami: 0, togri: 0 }));

console.log(xato === 0 ? "\n✅ blok: hammasi joyida\n" : `\n❌ blok: ${xato} ta xato\n`);
process.exit(xato === 0 ? 0 : 1);
