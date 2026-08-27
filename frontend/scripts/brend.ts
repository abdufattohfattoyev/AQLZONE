/**
 * ILOVA O'ZINI QANDAY TANISHTIRADI — sinovi.
 *
 * ─────────────────── NEGA BU SINOV KERAK ───────────────────
 *
 * "Aql Zone nima?" degan savolga ilova BESH joyda javob beradi:
 * brauzer yorlig'i, Google natijasi, Telegramdagi havola ostidagi
 * yozuv, telefonga o'rnatilgan ilova nomi va botning birinchi
 * xabari. Bu matnlar bir-biridan uzoq fayllarda yotadi va HECH
 * QAYSI ekranda yonma-yon ko'rinmaydi.
 *
 * Natijada ular jimgina bir-biridan qolib ketadi. Aynan shunday
 * bo'lgan edi: kurs dasturi 11-sinfgacha o'sgan, bot to'g'ri
 * gapirardi, sayt esa "1–4-sinf matematikasi" deb turaverdi. Ya'ni
 * havolani ko'rgan 9-sinf o'quvchisining ota-onasi "bu kichkina
 * bolalarga ekan" deb ochmasdan o'tib ketardi — va bu xato hech
 * qanday ekranda ko'rinmasdi.
 *
 * Shuning uchun tekshiruv ikkita:
 *   1. har bir tanishtiruv MATEMATIKA deyishi shart;
 *   2. undagi yuqori sinf kurs dasturidagi ENG KATTA sinfga mos
 *      bo'lishi shart — dastur o'sganda matn ham o'sadi.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const g = globalThis as unknown as Record<string, unknown>;
const xotira = new Map<string, string>([["azapp_til", "uz"]]);
g.localStorage = {
  getItem: (k: string) => xotira.get(k) ?? null,
  setItem: (k: string, v: string) => void xotira.set(k, v),
  removeItem: (k: string) => void xotira.delete(k),
};
g.window = { Telegram: undefined };
g.document = {
  documentElement: { dataset: {}, style: { setProperty: () => {}, removeProperty: () => {} } },
};
g.getComputedStyle = () => ({ getPropertyValue: () => "#0d1230" });

const bu = dirname(fileURLToPath(import.meta.url));
const oqi = (...yol: string[]) => readFileSync(join(bu, ...yol), "utf-8");

const { COURSES } = await import("../src/lib/curriculum/index.ts");
const { t } = await import("../src/lib/matn.ts");
const { tilniQoy } = await import("../src/lib/til.ts");

let xato = 0;
const tekshir = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

/**
 * Kurs dasturidagi eng katta sinf.
 *
 * Geometriya kodlari 100 dan boshlanadi (`curriculum/index.ts`),
 * shuning uchun ular qaytariladi — aks holda "eng katta sinf" 110
 * bo'lib chiqardi.
 */
const engKattaSinf = Math.max(
  ...COURSES.map((c) => (c.grade >= 100 ? c.grade - 100 : c.grade)),
);
console.log(`kurs dasturi: ${COURSES.length} kurs, eng katta sinf — ${engKattaSinf}\n`);

const html = oqi("..", "index.html");
const manifest = oqi("..", "public", "manifest.webmanifest");
const botMatn = oqi("..", "..", "backend", "core", "matn.py");

/** `<meta name="description" content="...">` ichidagi matn. */
function meta(nom: string, xususiyat = "name"): string {
  const q = new RegExp(`<meta ${xususiyat}="${nom}" content="([^"]*)"`);
  return q.exec(html)?.[1] ?? "";
}

const sarlavha = /<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "";

/** Botning birinchi xabari — o'zbekcha qismi. */
const botSalom = /"salom":\s*\{\s*"uz":\s*\(([\s\S]*?)\),/.exec(botMatn)?.[1] ?? "";

/* --------------------------------------------------- hamma joyda matematika */

const MATEM = /matematika|математик/i;

const joylar: [string, string][] = [
  ["brauzer yorlig'i (<title>)", sarlavha],
  ["Google natijasi (description)", meta("description")],
  ["havola ostidagi sarlavha (og:title)", meta("og:title", "property")],
  ["havola ostidagi yozuv (og:description)", meta("og:description", "property")],
  ["telefondagi ilova nomi (manifest name)", manifest],
  ["botning birinchi xabari", botSalom],
  ["ilova ichidagi sarlavha (shior)", t("shior")],
];

for (const [nom, matn] of joylar) {
  tekshir(`${nom} — matematika deydi`, MATEM.test(matn), JSON.stringify(matn.slice(0, 90)));
}

/* ------------------------------------------------- sinf oralig'i eskirmasin */

/**
 * Matndagi "1–4-sinf" kabi oraliqning YUQORI chegarasi.
 *
 * Oraliq umuman bo'lmasa `null` — bunday matn eskirmaydi va uni
 * tekshirishning ham hojati yo'q.
 */
function yuqoriSinf(matn: string): number | null {
  const m = /(\d{1,2})\s*[–—-]\s*(\d{1,2})\s*[- ]?(sinf|класс)/i.exec(matn);
  return m ? Number(m[2]) : null;
}

for (const [nom, matn] of joylar) {
  const bor = yuqoriSinf(matn);
  if (bor === null) continue;
  tekshir(
    `${nom} — sinf oralig'i dasturga mos`,
    bor === engKattaSinf,
    `matnda ${bor}-sinfgacha deyilgan, dasturda esa ${engKattaSinf}-sinf bor`,
  );
}

/* ------------------------------------------------------------ ikkinchi til */

tilniQoy("ru", false);
tekshir("ruscha sarlavha ham matematika deydi", MATEM.test(t("shior")),
  JSON.stringify(t("shior")));
{
  const ru = yuqoriSinf(t("shior"));
  if (ru !== null) {
    tekshir("ruscha sarlavhadagi sinf oralig'i ham mos", ru === engKattaSinf,
      `${ru} ≠ ${engKattaSinf}`);
  }
}
tilniQoy("uz", false);

console.log(xato === 0 ? "\n✅ brend: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
