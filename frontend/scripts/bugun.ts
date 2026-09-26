/**
 * "Bugun" ekranining hisob-kitobi (`src/lib/bugun.ts`).
 *
 * NEGA SINOV KERAK. Hafta doiralari SANAGA bog'liq va brauzerda ularni
 * tekshirish uchun tizim soatini surish kerak bo'ladi. Xatosi esa
 * jimgina chiqadi: zanjiri tirik bola kechagi doirani bo'sh ko'radi.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import { hafta, joriyZanjir, salomVaqti, yilKuni } from "../src/lib/bugun";

let xato = 0;
const tekshir = (nom: string, kutilgan: unknown, keldi: unknown) => {
  const ok = JSON.stringify(kutilgan) === JSON.stringify(keldi);
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`,
    ok ? "" : `— kutilgan ${JSON.stringify(kutilgan)}, keldi ${JSON.stringify(keldi)}`);
};

/** Haftani qisqa satrga: + o'ynagan, - o'ynamagan, . kelajak. */
const B = { oynagan: "+", oynamagan: "-", kelajak: "." } as const;
const satr = (z: { sana: string; kunlar: number }, bugun: string) =>
  hafta(z, bugun).map((k) => B[k.holat]).join("");

// 2026-09-25 — juma (dushanbadan hisoblaganda indeks 4).
const JUMA = "2026-09-25";

console.log("--- hafta ---");
{
  const h = hafta({ sana: JUMA, kunlar: 5 }, JUMA);
  tekshir("dushanbadan boshlanadi", "2026-09-21", h[0]!.sana);
  tekshir("yakshanba bilan tugaydi", "2026-09-27", h[6]!.sana);
  tekshir("bugun — juma", 4, h.findIndex((k) => k.bugun));
}
tekshir("besh kunlik zanjir bugun tugagan", "+++++..", satr({ sana: JUMA, kunlar: 5 }, JUMA));
tekshir("zanjir kecha tugagan — bugun hali yo'q", "++++-..", satr({ sana: "2026-09-24", kunlar: 4 }, JUMA));
tekshir("zanjir o'tgan haftadan kelyapti", "+++++..", satr({ sana: JUMA, kunlar: 12 }, JUMA));
tekshir("qisqa zanjir — faqat oxirgi kunlar", "---++..", satr({ sana: JUMA, kunlar: 2 }, JUMA));
tekshir("zanjir uzilgan — hech bir kun yo'q", "-----..", satr({ sana: "2026-09-22", kunlar: 3 }, JUMA));
tekshir("yangi odam", "-----..", satr({ sana: "", kunlar: 0 }, JUMA));
tekshir("dushanba — kelajak oltita", "+......", satr({ sana: "2026-09-21", kunlar: 1 }, "2026-09-21"));
tekshir("yakshanba — kelajak yo'q", "-----++", satr({ sana: "2026-09-27", kunlar: 2 }, "2026-09-27"));
tekshir("oy chegarasi (1-oktabr — payshanba)", "-+++...", satr({ sana: "2026-10-01", kunlar: 3 }, "2026-10-01"));

console.log("\n--- joriy zanjir ---");
tekshir("bugun davom etgan", 5, joriyZanjir({ sana: JUMA, kunlar: 5 }, JUMA));
tekshir("kecha davom etgan — hali tirik", 4, joriyZanjir({ sana: "2026-09-24", kunlar: 4 }, JUMA));
tekshir("ikki kun oldin — uzilgan", 0, joriyZanjir({ sana: "2026-09-23", kunlar: 4 }, JUMA));

console.log("\n--- salom ---");
tekshir("06:00 — tong", "tong", salomVaqti(6));
tekshir("13:00 — kun", "kun", salomVaqti(13));
tekshir("20:00 — kech", "kech", salomVaqti(20));
tekshir("02:00 — kech", "kech", salomVaqti(2));

console.log("\n--- yil kuni ---");
tekshir("1-yanvar — 0", 0, yilKuni("2026-01-01"));
tekshir("2-fevral — 32", 32, yilKuni("2026-02-02"));

console.log(xato === 0 ? "\n✅ bugun: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
