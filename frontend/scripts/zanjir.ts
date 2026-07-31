/**
 * Zanjir qoidalarining sinovi (`src/lib/zanjir.ts`).
 *
 * NEGA SINOV KERAK. Bu qoidalar SANAGA bog'liq va ularni brauzerda
 * qo'lda tekshirish uchun tizim soatini surish kerak bo'ladi — ya'ni
 * amalda hech kim tekshirmaydi. Xatosi esa jimgina yuzaga chiqadi:
 * bola tanga to'laydi, zanjiri esa baribir uziladi. Yoki teskarisi —
 * har kuni tiklash sotilaveradi va zanjir hech narsani bildirmay
 * qoladi.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import {
  TIKLASH_NARX, kunFarqi, kunOldin, qaytish, tiklangan, tiklashTaklifi,
} from "../src/lib/zanjir";
import type { ZanjirHolat } from "../src/lib/zanjir";

let xato = 0;
const tekshir = (nom: string, kutilgan: unknown, keldi: unknown) => {
  const ok = JSON.stringify(kutilgan) === JSON.stringify(keldi);
  if (!ok) xato++;
  console.log(
    `${ok ? "✅" : "❌"} ${nom}`,
    ok ? "" : `— kutilgan ${JSON.stringify(kutilgan)}, keldi ${JSON.stringify(keldi)}`,
  );
};

/** Sinov holati: standart qiymatlar ustiga kerakligini yozamiz. */
const holat = (x: Partial<ZanjirHolat> = {}): ZanjirHolat => ({
  sana: "",
  kunlar: 0,
  muzlatgich: 0,
  muzlatgichOyi: "",
  tiklanganKun: "",
  tiklashSoni: 0,
  tiklashOyi: "",
  ...x,
});

/* ------------------------------------------------------- sana hisobi */

console.log("--- sana ---");
tekshir("kecha bilan bugun orasi 1 kun", 1, kunFarqi(kunOldin(1), kunOldin(0)));
tekshir("oy chegarasi to'g'ri sanaladi", 1, kunFarqi("2026-07-31", "2026-08-01"));
tekshir("yil chegarasi to'g'ri sanaladi", 1, kunFarqi("2025-12-31", "2026-01-01"));

/* ---------------------------------------------------- tiklash taklifi */

console.log("\n--- tiklash taklifi ---");

tekshir("kecha o'ynagan bo'lsa taklif yo'q", null,
  tiklashTaklifi(holat({ sana: kunOldin(1), kunlar: 9 })));

tekshir("bugun o'ynagan bo'lsa taklif yo'q", null,
  tiklashTaklifi(holat({ sana: kunOldin(0), kunlar: 9 })));

tekshir("bepul muzlatgich bor — tanga so'ralmaydi", null,
  tiklashTaklifi(holat({
    sana: kunOldin(2), kunlar: 9,
    muzlatgich: 1, muzlatgichOyi: kunOldin(0).slice(0, 7),
  })));

tekshir("muzlatgich ishlatilgan — taklif chiqadi",
  { kunlar: 9, uzilgan: 1, narx: TIKLASH_NARX[0] },
  tiklashTaklifi(holat({
    sana: kunOldin(2), kunlar: 9,
    muzlatgich: 0, muzlatgichOyi: kunOldin(0).slice(0, 7),
  })));

tekshir("ikki kun uzilish ham tiklanadi",
  { kunlar: 5, uzilgan: 2, narx: TIKLASH_NARX[0] },
  tiklashTaklifi(holat({ sana: kunOldin(3), kunlar: 5 })));

tekshir("uch kun uzilsa — zanjir haqiqatan tugagan", null,
  tiklashTaklifi(holat({ sana: kunOldin(4), kunlar: 30 })));

tekshir("bir kunlik zanjir saqlashga arzimaydi", null,
  tiklashTaklifi(holat({ sana: kunOldin(3), kunlar: 1 })));

tekshir("hafta o'tmasdan ikkinchi tiklash yo'q", null,
  tiklashTaklifi(holat({
    sana: kunOldin(3), kunlar: 8, tiklanganKun: kunOldin(4),
  })));

tekshir("bir haftadan keyin yana mumkin",
  { kunlar: 8, uzilgan: 2, narx: TIKLASH_NARX[1] },
  tiklashTaklifi(holat({
    sana: kunOldin(3), kunlar: 8,
    tiklanganKun: kunOldin(9), tiklashSoni: 1, tiklashOyi: kunOldin(0).slice(0, 7),
  })));

tekshir("narx uchinchisida eng qimmat",
  TIKLASH_NARX[2],
  tiklashTaklifi(holat({
    sana: kunOldin(3), kunlar: 8,
    tiklashSoni: 2, tiklashOyi: kunOldin(0).slice(0, 7),
  }))?.narx);

tekshir("oyiga uchtadan ko'p emas", null,
  tiklashTaklifi(holat({
    sana: kunOldin(3), kunlar: 8,
    tiklashSoni: 3, tiklashOyi: kunOldin(0).slice(0, 7),
  })));

tekshir("o'tgan oygi hisob narxni oshirmaydi",
  TIKLASH_NARX[0],
  tiklashTaklifi(holat({
    sana: kunOldin(3), kunlar: 8, tiklashSoni: 2, tiklashOyi: "2000-01",
  }))?.narx);

/* ---------------------------------------------------- tiklangan holat */

console.log("\n--- tiklangandan keyin ---");
{
  const oldin = holat({ sana: kunOldin(3), kunlar: 8 });
  const keyin = tiklangan(oldin);
  tekshir("sana kechaga ko'chadi", kunOldin(1), keyin.sana);
  tekshir("zanjir uzunligi saqlanadi", 8, keyin.kunlar);
  tekshir("hisob bittaga oshadi", 1, keyin.tiklashSoni);
  tekshir("taklif qaytarilmaydi", null, tiklashTaklifi(keyin));
}

/* --------------------------------------------------------- qaytish */

console.log("\n--- qaytish ---");
tekshir("yangi foydalanuvchi qaytgan emas", 0, qaytish({ sana: "" }));
tekshir("uch kun — hali qaytish emas", 0, qaytish({ sana: kunOldin(3) }));
tekshir("yetti kun — qaytish", 7, qaytish({ sana: kunOldin(7) }));
tekshir("yigirma kun — qaytish", 20, qaytish({ sana: kunOldin(20) }));

console.log(xato === 0 ? "\n✅ zanjir: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
