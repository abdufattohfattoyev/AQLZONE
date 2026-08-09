/**
 * YECHIMLARNI TEKSHIRISH — har bir generatorni yuz marta chaqiradi.
 *
 * Nega kerak: yechim qadamlari SAVOL BILAN BIR VAQTDA yasaladi va
 * ularning ichida hisob bor (`${a * n}`, `√${c * c}`). Ya'ni ular ham
 * xato bo'lishi mumkin — masalan generator shartni o'zgartirsa-yu,
 * yechim eski formulada qolib ketsa. Bunday xato ekranda faqat o'sha
 * variant tushganda ko'rinadi va uni qo'lda topib bo'lmaydi.
 *
 * Tekshiriladigan uch narsa:
 *
 *   1. Har bir generator `yechim` beradi — 7–11-sinf uchun bu MAJBURIY.
 *   2. Oxirgi qadam "javob" va uning ifodasi savolning haqiqiy javobi
 *      bilan MOS. Busiz yechim o'quvchini boshqa songa olib borardi.
 *   3. Har bir qadamning kaliti lug'atda bor va ikkala tilda ham
 *      bo'sh emas.
 *
 * Ishga tushirish: `npx jiti scripts/yechim.ts`
 */
import * as OLIY from "../src/lib/oliy";
import { YECHIM_LUGAT } from "../src/lib/tarjima/yechim";
import type { Activity, Qadam } from "../src/lib/activity";

const URINISH = 100;

let xato = 0;
const shikoyat = (nom: string, gap: string) => {
  console.log(`  ✗ ${nom}: ${gap}`);
  xato++;
};

/**
 * Javob qadami savolning javobiga mos keladimi.
 *
 * Taqqoslash QAT'IY emas: yechimda javob ko'pincha kengaytirilgan
 * ko'rinishda yoziladi ("x = 5", javob esa "5"). Shuning uchun javob
 * qadamning ichida uchrashi yetarli — muhimi u YO'Q bo'lmasin yoki
 * boshqa songa ishora qilmasin.
 */
function javobMos(a: Activity, oxirgi: Qadam): boolean {
  const j = String(a.answer).trim();
  const q = (oxirgi.if ?? "").trim();
  return q === j || q.includes(j);
}

const nomlar = Object.keys(OLIY).filter((k) => typeof (OLIY as never)[k] === "function");
console.log(`${nomlar.length} ta generator, har biri ${URINISH} marta\n`);

// Lug'at — ikkala til ham to'ldirilganmi. Til ish paytida almashadi,
// shuning uchun bitta tilda bo'sh qolgan yozuv ruscha ochgan
// o'quvchiga izohsiz qadam ko'rsatardi.
for (const [kalit, juft] of Object.entries(YECHIM_LUGAT)) {
  if (!juft[0]?.trim()) shikoyat(kalit, "o'zbekcha izoh bo'sh");
  if (!juft[1]?.trim()) shikoyat(kalit, "ruscha izoh bo'sh");
}

for (const nom of nomlar) {
  const gen = (OLIY as unknown as Record<string, () => Activity>)[nom];
  for (let i = 0; i < URINISH; i++) {
    let a: Activity;
    try {
      a = gen();
    } catch (e) {
      shikoyat(nom, `yiqildi — ${String(e)}`);
      break;
    }

    if (!a.yechim || a.yechim.length === 0) {
      shikoyat(nom, "yechim yo'q");
      break;
    }

    let buzuq = false;
    for (const k of a.yechim) {
      if (!YECHIM_LUGAT[k.q]) {
        shikoyat(nom, `"${k.q}" kaliti lug'atda yo'q`);
        buzuq = true;
        break;
      }
      if (k.if !== undefined && !String(k.if).trim()) {
        shikoyat(nom, `"${k.q}" qadamining ifodasi bo'sh`);
        buzuq = true;
        break;
      }
      if (/undefined|NaN|Infinity/.test(String(k.if ?? ""))) {
        shikoyat(nom, `ifodada NaN/undefined — "${k.if}"`);
        buzuq = true;
        break;
      }
    }
    if (buzuq) break;

    const oxirgi = a.yechim[a.yechim.length - 1];
    if (oxirgi.q !== "javob") {
      shikoyat(nom, `oxirgi qadam "javob" emas — "${oxirgi.q}"`);
      break;
    }
    if (!javobMos(a, oxirgi)) {
      shikoyat(nom, `javob mos emas: yechimda "${oxirgi.if}", savolda "${a.answer}"`);
      break;
    }

    // Javob variantlar ichida turishi shart — busiz savol umuman
    // yechilmaydi va bu yechimdan ham muhimroq buzilish.
    if (!a.choices.map(String).includes(String(a.answer))) {
      shikoyat(nom, "javob variantlar orasida yo'q");
      break;
    }
  }
}

console.log(xato === 0 ? "\n✓ Hammasi joyida" : `\n${xato} ta muammo`);
process.exit(xato === 0 ? 0 : 1);
