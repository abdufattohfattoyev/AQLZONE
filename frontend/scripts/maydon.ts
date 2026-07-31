/**
 * Bugungi maydonning sinovi (`src/lib/oyin/maydon.ts`, `urug.ts`).
 *
 * NEGA SINOV KERAK. Maydonning butun ma'nosi bitta va'daga tayanadi:
 * **hamma bir xil savolni ko'radi**. Bu va'da buzilsa jadval hech
 * narsani o'lchamaydi va buni brauzerda ochib topib bo'lmaydi — ikki
 * xil qurilmada bir vaqtda o'ynab ko'rish kerak bo'lardi.
 *
 * To'rt narsa tekshiriladi:
 *
 *   1. Bir kun → bir xil savollar (takrorlanuvchanlik).
 *   2. Boshqa kun → boshqa savollar (aks holda urug' ishlamayapti).
 *   3. `urugBilan` asl `Math.random` ni QAYTARADI — xato tashlanganda ham.
 *      Buzilsa, butun ilova shu daqiqadan boshlab bir xil "tasodifiy"
 *      sonlar bilan ishlab ketardi va sababini topish deyarli imkonsiz.
 *   4. Bosqichlar takrorlanmaydi va savollar ichida takror yo'q.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import { bugungiBosqichlar, bugungiOyinlar } from "../src/lib/oyin/maydon";
import { kunUrugi, urugBilan } from "../src/lib/oyin/urug";

let xato = 0;
const tekshir = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

const belgi = (kun: string) =>
  bugungiBosqichlar(kun).map((b) => ({
    oyin: b.oyin.id,
    savollar: b.savollar.map((s) => `${s.matn}|${s.javob}`),
  }));

/* ------------------------------------------------ 1. takrorlanuvchanlik */

const KUN = "2026-08-14";
const a = belgi(KUN);
const b = belgi(KUN);

tekshir(
  "bir kun — bir xil savollar",
  JSON.stringify(a) === JSON.stringify(b),
  "ikki chaqiruv boshqa natija berdi",
);

/* ------------------------------------------------ 2. kunlar farq qiladi */

const c = belgi("2026-08-15");
tekshir(
  "boshqa kun — boshqa savollar",
  JSON.stringify(a) !== JSON.stringify(c),
  "ikki kun bir xil chiqdi — urug' ishlamayapti",
);

// Ketma-ket o'nta kun tekshiriladi: bittasi bo'sh chiqsa, o'sha kuni
// maydon ochilmay qolardi va buni faqat o'sha kuni bilib olardik.
let bosh = 0;
for (let i = 0; i < 10; i++) {
  const kun = `2026-09-0${i}`;
  const bosqichlar = bugungiBosqichlar(kun);
  if (bosqichlar.length !== 3 || bosqichlar.some((x) => x.savollar.length < 40)) bosh++;
}
tekshir("o'n kunning har birida uchta to'la bosqich bor", bosh === 0, `${bosh} kun nuqsonli`);

/* ------------------------------------------------ 3. Math.random qaytadi */

const aslRandom = Math.random;
urugBilan(123, () => Math.random());
tekshir("urug'dan keyin Math.random asliga qaytadi", Math.random === aslRandom);

try {
  urugBilan(123, () => { throw new Error("ataylab"); });
} catch {
  /* kutilgan */
}
tekshir("xato tashlansa ham Math.random qaytadi", Math.random === aslRandom);

// Bir xil urug' — bir xil ketma-ketlik.
const ket = (u: number) => urugBilan(u, () => [0, 0, 0, 0, 0].map(() => Math.random()));
tekshir("bir urug' — bir xil sonlar", JSON.stringify(ket(7)) === JSON.stringify(ket(7)));
tekshir("boshqa urug' — boshqa sonlar", JSON.stringify(ket(7)) !== JSON.stringify(ket(8)));

/* ------------------------------------------------ 4. takrorlar yo'q */

const oyinlar = bugungiOyinlar(KUN).map((o) => o.id);
tekshir(
  "bir kunda bitta o'yin ikki marta tushmaydi",
  new Set(oyinlar).size === oyinlar.length,
  oyinlar.join(", "),
);

for (const bosqich of bugungiBosqichlar(KUN)) {
  const kalitlar = bosqich.savollar.map((s) => `${s.matn}|${s.ost ?? ""}|${s.javob}`);
  // Takror BUTUNLAY taqiqlanmagan (ba'zi o'yinlarda savol soni chekli),
  // lekin YONMA-YON takror bo'lmasligi shart: uni o'yinchi darrov
  // sezadi va o'yin arzon ko'rinadi.
  tekshir(
    `${bosqich.oyin.id}: yonma-yon takror yo'q`,
    kalitlar.every((k, i) => i === 0 || k !== kalitlar[i - 1]),
  );
  // Birinchi yigirmatasi — o'yinchi amalda yetadigan qism — har xil.
  tekshir(
    `${bosqich.oyin.id}: birinchi 20 tasi har xil`,
    new Set(kalitlar.slice(0, 20)).size === Math.min(20, kalitlar.length),
  );
  tekshir(
    `${bosqich.oyin.id}: javob variantlar ichida`,
    bosqich.savollar.every((s) => s.variantlar.includes(s.javob)),
  );
}

console.log(xato ? `\n${xato} ta nuqson` : "\nMaydon — hammasi joyida");
process.exit(xato ? 1 : 0);
