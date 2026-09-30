/**
 * To'liq darslar sinovi (`lib/tolaqGeometriya.ts`, `tolaqAlgebra.ts`, `tolaqAnaliz.ts`).
 * Va'da: har kalit haqiqiy dars nomi (xato yozilgan nom sahifada chiqmay qolardi),
 * har bir dars hamma bo'limga ega, har matn ikki tilda va bo'sh emas.
 */
import "./_xotira";
import { imtihonKurslari } from "../src/lib/blok";
import { TOLAQ_KALITLAR, tolaq, tolaqKalit } from "../src/lib/nazariya";

let xato = 0;
const t = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

const darslar = new Set<string>();
const kursDars = new Set<string>();
for (const c of imtihonKurslari()) for (const U of c.units) for (const L of U.lessons) {
  darslar.add(L.n);
  kursDars.add(`${c.id}|${L.n}`);
}

const hammasi: Record<string, NonNullable<ReturnType<typeof tolaqKalit>>> = {};
for (const k of TOLAQ_KALITLAR()) hammasi[k] = tolaqKalit(k)!;
const bosh = (x: string) => x.trim().length > 0;
const juftmi = (x: unknown) => Array.isArray(x) && x.length === 2 && bosh(x[0]) && bosh(x[1]);

for (const [nom, T] of Object.entries(hammasi)) {
  t(`${nom}: haqiqiy dars nomi`, nom.includes("|") ? kursDars.has(nom) : darslar.has(nom));
  t(`${nom}: hamma bo'lim bor`, Boolean(T.t?.length && T.f?.length && T.s?.length && T.m?.length && T.x?.length));
  const matnlar = [
    ...(T.t ?? []).flatMap((b) => [b.h, b.p]),
    ...(T.f ?? []).map((f) => f.n),
    ...(T.s ?? []),
    ...(T.x ?? []),
  ];
  t(`${nom}: matnlar ikki tilda`, matnlar.every(juftmi));
  // O'zbekcha qism kirillcha harfsiz (aralashib qolgan yozuvni tutadi), ruscha qism kirillcha.
  const KIRILL = /[А-Яа-яЁё]/;
  const sof = (T.t ?? []).flatMap((b) => [b.h, b.p]).concat(T.s ?? [], T.x ?? []);
  t(`${nom}: tillar aralashmagan`, sof.every(([uz, ru]) => !KIRILL.test(uz) && (KIRILL.test(ru) || ru === uz)));
  t(`${nom}: misollar to'liq`, (T.m ?? []).every((m) => m.y.length > 0 && bosh(m.j)
    && (typeof m.s === "string" ? bosh(m.s) : juftmi(m.s))
    && m.y.every((q) => (typeof q === "string" ? bosh(q) : juftmi(q)))));
  const [kurs, dars] = nom.includes("|") ? nom.split("|") : [undefined, nom];
  const kursId = kurs ?? [...kursDars].find((x) => x.endsWith(`|${dars}`))?.split("|")[0] ?? "";
  t(`${nom}: tolaq() topadi`, tolaq(kursId, dars) === T);
}

if (xato) { console.log(`\n${xato} ta xato`); process.exit(1); }
console.log(`\nTo'liq darslar: ${Object.keys(hammasi).length} ta, hammasi joyida`);
