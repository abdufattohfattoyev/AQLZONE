/**
 * SEO — har bir ochiq sahifa uchun sarlavha, tavsif va HAQIQIY mazmun.
 *
 * ─────────────────── NEGA KERAK ───────────────────
 *
 * Ilova — React (SPA): server har manzilga BIR XIL bo'sh `index.html`
 * beradi, mazmunni esa JavaScript keyin chizadi. Google bunday sahifani
 * birinchi o'qishda bo'sh ko'radi, JS'ni esa kunlab keyin ishga tushiradi
 * — va 700 ta darsning hammasi "Aql Zone — 1–11-sinf matematikasi"
 * degan BITTA sarlavha bilan turadi. Natijada "kasrlarni qo'shish" yoki
 * "DTM matematika test" deb izlagan odamga sayt chiqmaydi.
 *
 * Bu skript `npm run build` dan keyin ishlaydi va `dist/seo.json` yozadi:
 * har manzil uchun sarlavha, tavsif, H1, bir necha paragraf, ichki
 * havolalar va schema.org (JSON-LD). Server (`backend/core/seo.py`) shu
 * faylni o'qib, HTML'ga qo'yadi; `sitemap.xml` ham shundan yasaladi.
 *
 * Matnlar kurs dasturidan OLINADI, qo'lda yozilmaydi — dastur o'zgarsa,
 * sahifalar ham o'zgaradi. Foydalanuvchi masalalari esa bazada, ularni
 * server o'zi qo'shadi.
 *
 * ─────────────────── IKKI TIL ───────────────────
 *
 * Har sahifa ikki marta yasaladi: o'zbekcha (`/kurs/5-sinf`) va ruscha
 * (`/ru/kurs/5-sinf`). Ruscha matnlar ilovaning o'z tarjimalaridan
 * (`tarjima/kurs.ts`, `matn.ts`) olinadi. Ikkalasi `hreflang` bilan
 * bog'lanadi — Google ularni nusxa deb emas, bir sahifaning ikki tili
 * deb biladi.
 *
 * ─────────────────── NAMUNAVIY SAVOLLAR ───────────────────
 *
 * Dars sahifasida nomi va bob tavsifidan boshqa hech narsa bo'lmasa,
 * 700 ta sahifa bir-biriga juda o'xshaydi va Google ularning ko'pini
 * "yupqa mazmun" deb indekslamaydi. Shuning uchun har darsga o'sha
 * darsning O'Z generatorlaridan bir nechta savol — javobi va yechimi
 * bilan — qo'yiladi. Tasodif urug'i manzildan olinadi: har yig'ishda
 * savollar bir xil chiqadi va Google sahifani "o'zgardi" deb qayta-qayta
 * ko'rib chiqmaydi.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

const { COURSES } = await import("../src/lib/curriculum/index.ts");
const { OYINLAR } = await import("../src/lib/oyin/index.ts");
const { FORMULALAR } = await import("../src/lib/formulalar.ts");
const { t } = await import("../src/lib/matn.ts");
const { tilniQoy } = await import("../src/lib/til.ts");
const { kursMatn } = await import("../src/lib/tarjima/kurs.ts");
const { yo } = await import("../src/lib/tarjima/yechim.ts");
const { OLCHAM, VARIANTLAR: DTM_VARIANT } = await import("../src/lib/imtihon.ts");
const { VARIANTLAR: SERT_VARIANT, DAQIQA: SERT_DAQIQA, TUZILISH } = await import("../src/lib/sertifikat.ts");
const { QABUL, QABUL_TURLAR, QABUL_VARIANT } = await import("../src/lib/qabul.ts");
const { lugat } = await import("../src/lib/lugat.ts");
const { mantiqMavzular } = await import("../src/lib/mantiq.ts");
type Activity = import("../src/lib/activity.ts").Activity;
type Course = (typeof COURSES)[number];
type Juft = import("../src/lib/nazariya.ts").Juft;
type Matn = import("../src/lib/nazariya.ts").Matn;

export const ASOS = "https://aql-zone.uz";
const BREND = "Aql Zone";

interface Havola { yol: string; nom: string }
interface Jadval { nom: string; bosh: (string | number)[]; qatorlar: (string | number)[][] }
interface Misol {
  /** Savol matni. */
  s: string;
  /** Savolning ko'rinishi matn bilan ("345 + 278", "2, 4, ?, 8"). */
  k?: string;
  /** Javob variantlari. */
  v?: (string | number)[];
  j: string | number;
  /** Qadam-baqadam yechim. */
  y?: string[];
  /** "Javob" yozuvi — tilga qarab. */
  jt: string;
}
interface Sahifa {
  sarlavha: string;
  tavsif: string;
  h1: string;
  matn: string[];
  havolalar: Havola[];
  /** Ichma-ich ro'yxat (kurs boblari, formulalar bo'limlari). */
  guruhlar?: { nom: string; qatorlar: Havola[] | string[] }[];
  misollar?: Misol[];
  misol_sarlavha?: string;
  /** Nomli formulalar — sahifaning eng qidirilgan qismi. */
  formulalar?: { n?: string; f: string }[];
  formula_sarlavha?: string;
  /** Yechish tartibi — raqamlangan ro'yxat. */
  qadamlar?: string[];
  qadam_sarlavha?: string;
  /** Shu mavzuda eng ko'p qilinadigan xatolar. */
  xatolar?: string[];
  xato_sarlavha?: string;
  /** Savol-javob: odam qidiruvga yozadigan savol va qisqa javob (`FAQPage`). */
  savollar?: { s: string; j: string }[];
  savol_sarlavha?: string;
  jadval?: Jadval;
  /** Bir nechta jadval — ma'lumotnoma sahifalarida. */
  jadvallar?: Jadval[];
  /** Katta tugma — asosan ilovaga olib boradi. */
  tugma?: Havola;
  /** Ilovada ekrani yo'q, faqat server sahifasi (React ulanmaydi). */
  statik?: boolean;
  /** Non-kanonik nusxa (bir xil mazmun) — Google shu manzilni asosiy deb bilsin. */
  kanonik?: string;
  ld: Record<string, unknown>[];
  /** sitemap.xml: 0.1–1.0. Yo'q bo'lsa — sitemapga kirmaydi. */
  muhim?: number;
  til?: "uz" | "ru";
  muqobil?: { uz: string; ru: string };
}

const qisqa = (s: string, n = 158) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…");
/** "2-bob. Natural sonlar" → "Natural sonlar" (raqam alohida qo'yiladi). */
const bobNomi = (u: string) => u.replace(/^(\d+-bob|Глава \d+)\.\s*/, "");

/** Lotin harflaridan manzil bo'lagi: "Bo'linish, nisbat, foiz" → "bolinish-nisbat-foiz". */
const slug = (s: string) => s.toLowerCase().replace(/[ʻʼ'`’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ------------------------------------------------------------ tasodif urug'i */

const asl = Math.random;
function urug(s: string): void {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  let a = h >>> 0;
  // mulberry32
  Math.random = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = Math.imul(a ^ (a >>> 15), 1 | a);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/* ======================================================================== */

function yasa(ru: boolean): Record<string, Sahifa> {
  tilniQoy(ru ? "ru" : "uz", false);
  const L = <A,>(uz: A, r: A): A => (ru ? r : uz);
  const P = ru ? "/ru" : "";
  const km = (s: string) => kursMatn(s);
  const darsNomi = (n: string) => km(n.split(" · ")[0]!.trim());
  const sahifalar: Record<string, Sahifa> = {};

  const TASHKILOT = {
    "@type": "Organization", "@id": `${ASOS}/#tashkilot`, name: BREND, url: `${ASOS}/`,
    logo: `${ASOS}/og.png`, sameAs: ["https://t.me/Aqlzone_bot", "https://t.me/AqlZoneUz"],
  };
  const yolak = (qadamlar: Havola[]) => ({
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: qadamlar.map((q, i) => ({ "@type": "ListItem", position: i + 1, name: q.nom, item: ASOS + q.yol })),
  });
  const BOSH: Havola = { yol: P || "/", nom: BREND };
  const kursNomi = (c: Course) => km(c.title);
  const fNom = (b: (typeof FORMULALAR)[number]) => L(b.nom, b.ru);
  const fSinf = (s: number) => (s >= 201 ? L("oliy matematika", "высшая математика") : L(`${s}-sinf`, `${s} класс`));
  const fYol = (b: (typeof FORMULALAR)[number]) => `${P}/formulalar/${slug(b.nom)}-${b.sinf}`;

  /* -------------------------------------------------------- namunaviy savol */

  const nusxa = (e: string, n: number) => Array(Math.max(0, Math.min(n, 30))).fill(e).join("");

  /** Savolning rasmini matn bilan: formulalar o'z holicha, narsalar emoji bilan. */
  function korinish(a: Activity): string | null | undefined {
    switch (a.type) {
      case "eqn": return a.text;
      case "column": return `${a.a} ${a.op} ${a.b} = ?`;
      case "numray": return a.arr.map((v, i) => (i === a.hide ? "?" : v)).join(", ");
      case "frac": return L(`${a.parts} ta teng bo'lakdan ${a.shaded} tasi bo'yalgan`, `Закрашено ${a.shaded} из ${a.parts} равных частей`);
      case "perim": return L(`Tomonlari ${a.w} va ${a.h}`, `Стороны ${a.w} и ${a.h}`);
      case "area": return L(`${a.w} × ${a.h} katak`, `${a.w} × ${a.h} клеток`);
      case "mulvis": case "divvis": return L(`${a.g} guruh, har birida ${a.k} ta ${a.emoji}`, `${a.g} групп по ${a.k} ${a.emoji}`);
      case "count": return nusxa(a.emoji, a.n);
      case "cmpvis": return `${nusxa(a.emoji, a.a)} ${a.plus ? "+" : "|"} ${nusxa(a.emoji, a.b)}`;
      case "odd": case "naqsh": return a.items.join(" ") + (a.type === "naqsh" ? " ?" : "");
      case "belgi": return a.belgi;
      case "rasm": return a.emoji;
      case "tens": return L(`${a.tens} ta o'nlik va ${a.units} ta birlik`, `${a.tens} десятков и ${a.units} единиц`);
      case "ayirvis": return L(`${nusxa(a.emoji, a.n)} — ${a.k} tasi ketdi`, `${nusxa(a.emoji, a.n)} — ${a.k} ушли`);
      // Soat, shakl, katak va jadval — rasmsiz tushunarsiz yoki javobni
      // o'zi aytib qo'yadi. Bunday savol sahifaga qo'yilmaydi.
      default: return null;
    }
  }

  function misollar(yol: string, gens: (() => Activity)[]): Misol[] {
    urug(yol);
    const chiqdi = new Set<string>();
    const natija: Misol[] = [];
    for (let urinish = 0; urinish < 16 && natija.length < 4; urinish++) {
      let a: Activity;
      try {
        a = gens[urinish % gens.length]!();
      } catch {
        continue;
      }
      const k = korinish(a);
      if (k === null || a.kind === "rang") continue;
      const kalit = `${a.prompt}|${k}`;
      if (chiqdi.has(kalit)) continue;
      chiqdi.add(kalit);
      natija.push({
        s: a.prompt, ...(k && k !== a.prompt ? { k } : {}),
        ...(a.choices?.length > 1 ? { v: a.choices } : {}),
        j: a.answer,
        ...(a.yechim?.length ? { y: a.yechim.map((q) => (q.if ? `${yo(q.q)}: ${q.if}` : yo(q.q))) } : {}),
        jt: L("Javob va yechim", "Ответ и решение"),
      });
    }
    Math.random = asl;
    return natija;
  }

  /* ---------------------------------------------------------------- kurslar */

  const kursHavolalari: Havola[] = COURSES.map((c) => ({ yol: `${P}/kurs/${c.slug}`, nom: kursNomi(c) }));
  const jamiDars = COURSES.reduce((a, c) => a + c.units.reduce((b, u) => b + u.lessons.length, 0), 0);
  const DARSLAR: Havola = { yol: `${P}/darslar`, nom: L("Darslar", "Уроки") };

  for (const c of COURSES) {
    const yol = `${P}/kurs/${c.slug}`;
    const nom = kursNomi(c);
    const desc = km(c.desc);
    const darsSoni = c.units.reduce((a, u) => a + u.lessons.length, 0);
    const kursYolak = [BOSH, DARSLAR, { yol, nom }];
    sahifalar[yol] = {
      sarlavha: L(`${nom} — onlayn darslar va mashqlar | ${BREND}`, `${nom} — онлайн-уроки и упражнения | ${BREND}`),
      tavsif: qisqa(L(
        `${nom}: ${c.units.length} bob, ${darsSoni} ta dars. ${desc}. Har darsda mashqlar, xatolar ustida ishlash va bob testlari. Bepul.`,
        `${nom}: ${c.units.length} глав, ${darsSoni} уроков. ${desc}. Упражнения в каждом уроке, работа над ошибками и тесты по главам. Бесплатно.`)),
      h1: nom,
      matn: [
        `${desc}.`,
        L(`Kurs ${c.units.length} ta bob va ${darsSoni} ta darsdan iborat. Har dars qisqa tushuntirish va `
            + "savollardan tuzilgan: javob darhol tekshiriladi, xato qilingan savollar keyin takrorlanadi.",
          `Курс состоит из ${c.units.length} глав и ${darsSoni} уроков. Каждый урок — короткое объяснение и `
            + "вопросы: ответ проверяется сразу, ошибки потом повторяются."),
      ],
      guruhlar: c.units.map((u, ui) => ({
        nom: L(`${ui + 1}-bob. ${bobNomi(u.u)}`, `Глава ${ui + 1}. ${bobNomi(km(u.u))}`),
        qatorlar: u.lessons.map((l, li) => ({ yol: `${yol}/${ui + 1}-bob/${li + 1}-dars`, nom: darsNomi(l.n) })),
      })),
      havolalar: [
        { yol: `${P}/formulalar`, nom: L("Matematika formulalari", "Формулы по математике") },
        { yol: `${P}/imtihon`, nom: L("DTM test variantlari", "Варианты тестов DTM") },
      ],
      ld: [
        {
          "@context": "https://schema.org", "@type": "Course", name: nom, description: qisqa(`${desc}.`, 300),
          url: ASOS + yol, inLanguage: L("uz", "ru"), isAccessibleForFree: true, provider: TASHKILOT,
          hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: `PT${Math.max(1, Math.round(darsSoni * 5 / 60))}H` },
          offers: { "@type": "Offer", price: 0, priceCurrency: "UZS", category: "Free" },
        },
        yolak(kursYolak),
      ],
      muhim: 0.9,
    };

    // Har bir dars — alohida sahifa: "kasrlarni qo'shish" kabi aniq
    // so'rovlar aynan dars nomiga to'g'ri keladi.
    c.units.forEach((u, ui) => {
      const bob = bobNomi(km(u.u));
      u.lessons.forEach((l, li) => {
        const dYol = `${yol}/${ui + 1}-bob/${li + 1}-dars`;
        const dNom = darsNomi(l.n);
        const bet = l.n.split(" · ")[1]?.trim();
        const intro = `${km(u.intro.t)}. ${km(u.intro.d)}`;
        const mis = misollar(dYol, l.gens);
        sahifalar[dYol] = {
          sarlavha: L(`${dNom} — ${nom}, ${ui + 1}-bob | ${BREND}`, `${dNom} — ${nom}, глава ${ui + 1} | ${BREND}`),
          tavsif: qisqa(L(
            `${dNom}: ${nom}, ${ui + 1}-bob «${bob}». ${km(u.intro.d)} Namunaviy savollar javobi bilan, onlayn mashq.`,
            `${dNom}: ${nom}, глава ${ui + 1} «${bob}». ${km(u.intro.d)} Примеры задач с ответами, онлайн-тренажёр.`)),
          h1: dNom,
          matn: [
            L(`${nom} · ${ui + 1}-bob «${bob}» · ${li + 1}-dars${bet ? ` (darslik: ${bet})` : ""}.`,
              `${nom} · глава ${ui + 1} «${bob}» · урок ${li + 1}${bet ? ` (учебник: ${bet})` : ""}.`),
            intro,
            L(`Darsda ${l.gens.length} ta savol bor, har safar yangi sonlar bilan. Javob darhol tekshiriladi, `
                + "xatolar esa keyin qayta so'raladi. Quyida shu darsdan namunalar.",
              `В уроке ${l.gens.length} вопросов, каждый раз с новыми числами. Ответ проверяется сразу, `
                + "ошибки потом повторяются. Ниже — примеры из этого урока."),
          ],
          ...(mis.length ? { misollar: mis, misol_sarlavha: L("Namunaviy savollar", "Примеры вопросов") } : {}),
          tugma: { yol: dYol, nom: L("Darsni boshlash", "Начать урок") },
          guruhlar: [{
            nom: L(`${ui + 1}-bob darslari`, `Уроки главы ${ui + 1}`),
            qatorlar: u.lessons.map((x, xi) => ({ yol: `${yol}/${ui + 1}-bob/${xi + 1}-dars`, nom: darsNomi(x.n) })),
          }],
          havolalar: [{ yol, nom: L(`${nom} — barcha boblar`, `${nom} — все главы`) }],
          ld: [
            {
              "@context": "https://schema.org", "@type": "LearningResource", name: dNom,
              description: qisqa(km(u.intro.d), 300), url: ASOS + dYol, inLanguage: L("uz", "ru"),
              learningResourceType: "Exercise", isAccessibleForFree: true, provider: TASHKILOT,
              educationalLevel: nom, teaches: dNom,
              isPartOf: { "@type": "Course", name: nom, url: ASOS + yol },
            },
            ...(mis.length ? [{
              "@context": "https://schema.org", "@type": "Quiz", name: `${dNom} — ${L("savollar", "вопросы")}`,
              about: dNom, inLanguage: L("uz", "ru"),
              hasPart: mis.map((m) => ({
                "@type": "Question", name: m.k ? `${m.s} ${m.k}` : m.s,
                acceptedAnswer: { "@type": "Answer", text: String(m.j) },
              })),
            }] : []),
            yolak([...kursYolak, { yol: dYol, nom: dNom }]),
          ],
          muhim: 0.6,
        };
      });
    });

    // Formulalar sahifasi har kursda bor, mazmuni esa bitta — asosiysi bitta.
    sahifalar[`${yol}/formulalar`] = { ...formulaSahifasi(), kanonik: `${P}/formulalar`, muhim: undefined };
  }

  /* ------------------------------------------------------------- formulalar */

  function formulaSahifasi(): Sahifa {
    const jami = FORMULALAR.reduce((a, b) => a + b.lar.length, 0);
    return {
      sarlavha: L(`Matematika formulalari — algebra va geometriya, 5–11-sinf | ${BREND}`,
        `Формулы по математике — алгебра и геометрия, 5–11 класс | ${BREND}`),
      tavsif: qisqa(L(
        `${jami} ta asosiy formula bir joyda: ${FORMULALAR.map((b) => b.nom.toLowerCase()).slice(0, 6).join(", ")}. Maktab va DTM uchun.`,
        `${jami} основных формул в одном месте: ${FORMULALAR.map((b) => b.ru.toLowerCase()).slice(0, 6).join(", ")}. Для школы и DTM.`)),
      h1: L("Matematika formulalari", "Формулы по математике"),
      matn: [L(`Maktab matematikasidagi ${jami} ta asosiy formula bo'limlar bo'yicha: har biri qaysi sinfda o'tilishi bilan.`,
        `${jami} основных формул школьной математики по разделам — с указанием класса.`)],
      guruhlar: [
        { nom: L("Bo'limlar", "Разделы"), qatorlar: FORMULALAR.map((b) => ({ yol: fYol(b), nom: `${fNom(b)} (${fSinf(b.sinf)})` })) },
        ...FORMULALAR.map((b) => ({ nom: `${fNom(b)} (${fSinf(b.sinf)})`, qatorlar: b.lar.map((f) => `${L(f.nom, f.ru)}: ${f.f}`) })),
      ],
      havolalar: [
        { yol: `${P}/imtihon`, nom: L("DTM test variantlari", "Варианты тестов DTM") },
        { yol: `${P}/sertifikat`, nom: L("Milliy sertifikat variantlari", "Варианты Национального сертификата") },
      ],
      ld: [yolak([BOSH, { yol: `${P}/formulalar`, nom: L("Formulalar", "Формулы") }])],
      muhim: 0.8,
    };
  }
  // Kanonik manzil — alohida yo'l: `/formulalar` ni ilova 11-sinf formulalariga
  // yo'naltiradi (`App.tsx`), server esa shu sahifani beradi.
  sahifalar[`${P}/formulalar`] = formulaSahifasi();

  // Har bo'lim — alohida sahifa: "trigonometriya formulalari",
  // "progressiya formulalari" kabi so'rovlar juda ko'p izlanadi.
  const kurslarSinf = (s: number): Course[] =>
    s >= 201 ? COURSES.filter((c) => c.grade === s + 100)
      : COURSES.filter((c) => c.grade === s || c.grade === s + 100);
  for (const b of FORMULALAR) {
    const yol = fYol(b);
    const nom = fNom(b);
    const kurslar = kurslarSinf(b.sinf);
    sahifalar[yol] = {
      sarlavha: L(`${nom} formulalari — ${fSinf(b.sinf)} | ${BREND}`, `${nom}: формулы — ${fSinf(b.sinf)} | ${BREND}`),
      tavsif: qisqa(L(
        `${nom}: ${b.lar.length} ta asosiy formula (${fSinf(b.sinf)}). ${b.lar.slice(0, 3).map((f) => f.nom).join(", ")} va boshqalar. Maktab, DTM va Milliy sertifikat uchun.`,
        `${nom}: ${b.lar.length} основных формул (${fSinf(b.sinf)}). ${b.lar.slice(0, 3).map((f) => f.ru).join(", ")} и другие. Для школы, DTM и Национального сертификата.`)),
      h1: L(`${nom}: formulalar`, `${nom}: формулы`),
      matn: [L(`${fSinf(b.sinf)} matematikasidagi «${nom}» bo'limining ${b.lar.length} ta asosiy formulasi.`,
        `${b.lar.length} основных формул раздела «${nom}» (${fSinf(b.sinf)}).`)],
      guruhlar: [
        { nom: L("Formulalar", "Формулы"), qatorlar: b.lar.map((f) => `${L(f.nom, f.ru)}: ${f.f}`) },
        ...(kurslar.length ? [{ nom: L("Shu mavzudagi darslar", "Уроки по теме"), qatorlar: kurslar.map((c) => ({ yol: `${P}/kurs/${c.slug}`, nom: kursNomi(c) })) }] : []),
      ],
      tugma: { yol: `${P}/imtihon`, nom: L("DTM testini ishlash", "Решить тест DTM") },
      havolalar: [
        { yol: `${P}/formulalar`, nom: L("Barcha formulalar", "Все формулы") },
        ...FORMULALAR.filter((x) => x !== b && x.sinf === b.sinf).map((x) => ({ yol: fYol(x), nom: fNom(x) })),
      ],
      statik: true,
      ld: [yolak([BOSH, { yol: `${P}/formulalar`, nom: L("Formulalar", "Формулы") }, { yol, nom }])],
      muhim: 0.7,
    };
  }

  /* ------------------------------------------------------ ko'paytirish jadvali */

  const jadvalDars = COURSES.flatMap((c) => c.units.flatMap((u, ui) => u.lessons.map((l, li) => ({ c, l, ui, li }))))
    .filter(({ l }) => /ko'paytir|jadval/i.test(l.n) && !/kasr|ko'phad|qisqa/i.test(l.n)).slice(0, 8);
  sahifalar[`${P}/kopaytirish-jadvali`] = {
    sarlavha: L(`Ko'paytirish jadvali 1 dan 10 gacha — onlayn yodlash va test | ${BREND}`,
      `Таблица умножения от 1 до 10 — выучить онлайн и тест | ${BREND}`),
    tavsif: L("Ko'paytirish jadvali 1 dan 10 gacha: to'liq jadval, yodlash usullari va onlayn mashq-o'yin. Bolalar uchun bepul.",
      "Таблица умножения от 1 до 10: полная таблица, приёмы запоминания и онлайн-тренажёр. Бесплатно для детей."),
    h1: L("Ko'paytirish jadvali (1–10)", "Таблица умножения (1–10)"),
    matn: [
      L("Qator va ustun kesishgan katakda ikki sonning ko'paytmasi turadi. Masalan, 7-qator va 8-ustunda 56 — ya'ni 7 × 8 = 56.",
        "В клетке на пересечении строки и столбца — произведение двух чисел. Например, строка 7 и столбец 8 дают 56: 7 × 8 = 56."),
      L("Yodlashni osonlashtiradigan qoidalar: ko'paytuvchilar o'rnini almashtirish natijani o'zgartirmaydi (3 × 7 = 7 × 3), "
          + "shuning uchun jadvalning deyarli yarmini bilish kifoya. 5 ga ko'paytma doim 0 yoki 5 bilan tugaydi. "
          + "9 ga ko'paytmaning raqamlari yig'indisi 9 ga teng (9 × 4 = 36 → 3 + 6 = 9). 10 ga ko'paytirish — oxiriga 0 qo'shish.",
        "Правила для запоминания: от перестановки множителей произведение не меняется (3 × 7 = 7 × 3), "
          + "поэтому достаточно выучить почти половину таблицы. Произведение на 5 всегда оканчивается на 0 или 5. "
          + "У произведения на 9 сумма цифр равна 9 (9 × 4 = 36 → 3 + 6 = 9). Умножить на 10 — дописать 0."),
      L("Eng yaxshi yodlash — har kuni 5 daqiqa mashq. Quyidagi o'yinda savollar tezlashib boradi va xato qilingan misollar qayta so'raladi.",
        "Лучше всего запоминается при ежедневной тренировке по 5 минут. В игре ниже вопросы ускоряются, а ошибки повторяются."),
    ],
    jadval: {
      nom: L("To'liq jadval", "Полная таблица"),
      bosh: ["×", ...Array.from({ length: 10 }, (_, i) => i + 1)],
      qatorlar: Array.from({ length: 10 }, (_, i) => [i + 1, ...Array.from({ length: 10 }, (_, j) => (i + 1) * (j + 1))]),
    },
    tugma: { yol: `${P}/oyinlar/jadval`, nom: L("Ko'paytirish jadvali o'yinini boshlash", "Начать игру «Таблица умножения»") },
    guruhlar: jadvalDars.length ? [{
      nom: L("Ko'paytirish bo'yicha darslar", "Уроки по умножению"),
      qatorlar: jadvalDars.map(({ c, l, ui, li }) => ({ yol: `${P}/kurs/${c.slug}/${ui + 1}-bob/${li + 1}-dars`, nom: `${darsNomi(l.n)} (${kursNomi(c)})` })),
    }] : undefined,
    havolalar: [{ yol: `${P}/oyinlar`, nom: L("Matematik o'yinlar", "Математические игры") }, DARSLAR],
    statik: true,
    ld: [yolak([BOSH, { yol: `${P}/kopaytirish-jadvali`, nom: L("Ko'paytirish jadvali", "Таблица умножения") }])],
    muhim: 0.8,
  };

  /* --------------------------------------------------------------- o'yinlar */

  const oyinHavolalari: Havola[] = OYINLAR.map((o) => ({ yol: `${P}/oyinlar/${o.id}`, nom: t(o.nom) }));
  const OYINLAR_H: Havola = { yol: `${P}/oyinlar`, nom: L("O'yinlar", "Игры") };
  for (const o of OYINLAR) {
    const nom = t(o.nom);
    const qoida = t(o.qoida).replace(/[✅❌]/g, "").replace(/\s+/g, " ");
    sahifalar[`${P}/oyinlar/${o.id}`] = {
      sarlavha: L(`${nom} — matematik o'yin onlayn | ${BREND}`, `${nom} — математическая игра онлайн | ${BREND}`),
      tavsif: qisqa(L(`${nom}: ${t(o.izoh)} ${qoida} Uch daraja, rekord va haftalik o'sish. Bepul.`,
        `${nom}: ${t(o.izoh)} ${qoida} Три уровня, рекорды и недельный прогресс. Бесплатно.`)),
      h1: L(`${nom} — matematik o'yin`, `${nom} — математическая игра`),
      matn: [`${t(o.izoh)}`, qoida, L("O'yin uch darajada: bola ham, katta ham o'ziga mosini tanlaydi.",
        "Три уровня сложности: подходящий найдут и дети, и взрослые.")],
      havolalar: oyinHavolalari.filter((h) => h.nom !== nom),
      ld: [yolak([BOSH, OYINLAR_H, { yol: `${P}/oyinlar/${o.id}`, nom }])],
      muhim: 0.7,
    };
  }

  /* ---------------------------------------------------------------- lug'at */

  /*
   * MATEMATIKA LUG'ATI — har atama uchun alohida sahifa.
   *
   * Odam qidiruvga "7-sinf algebra 3-bob 4-dars" deb yozmaydi. U
   * "diskriminant nima", "kvadratlar ayirmasi formulasi", "trapetsiya
   * yuzi qanday topiladi" deb yozadi. Tushuntirishlarning hammasi bizda
   * bor (`lib/nazariya.ts`, `lib/tolaq*.ts`), lekin ular dars ichida va
   * dars sahifasining nomi mavzuni aytmaydi.
   *
   * Shu bo'lim o'sha mazmunni MAVZU bo'yicha qayta joylaydi: qoida,
   * nomli formulalar, yechish tartibi, yechilgan misollar, tipik xatolar
   * va savol-javob. Ya'ni sahifa yupqa emas — unda odam izlagan
   * narsaning hammasi bor va u darsga ham olib boradi.
   */
  const LUGAT = lugat();
  const LUGAT_H: Havola = { yol: `${P}/lugat`, nom: L("Matematika lug'ati", "Математический словарь") };
  const lYol = (y: (typeof LUGAT)[number]) => `${P}/lugat/${y.slug}`;
  const lNom = (y: (typeof LUGAT)[number]) => km(y.nom);
  /** Tilga qarab juftlikdan birini oladi. */
  const J = (x: Juft) => L(x[0], x[1]);
  /** Formula — satr (tarjimasiz), tushuntirish — juftlik. */
  const MT = (x: Matn) => (Array.isArray(x) ? L(x[0], x[1]) : x);
  /** Birinchi gap — tavsif va savol-javob uchun. */
  const birGap = (s: string) => (s.match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim();

  // Nomi bir xil, mazmuni boshqa yozuvlar bor ("Kasrlarni qisqartirish"
  // 6- va 8-sinfda). Ularning sarlavhasi ham bir xil chiqsa, Google
  // birini ikkinchisining nusxasi deb hisoblaydi — shuning uchun bunday
  // yozuvlarga kurs nomi qo'shiladi.
  // Hisob TARJIMA QILINGAN nom bo'yicha: "Fazoviy vektorlar" va "Fazoda
  // vektorlar" ruschada bitta nom beradi, ya'ni muammo faqat ruscha
  // sahifalarda chiqadi.
  const nomSoni = new Map<string, number>();
  for (const y of LUGAT) nomSoni.set(lNom(y), (nomSoni.get(lNom(y)) ?? 0) + 1);
  // Kurs nomi ham ajratmagan holat: ikki dars nomi boshqa, tarjimasi bir
  // xil va sinfi ham bir xil. Bu haqiqatda BITTA mavzu — ikkinchisi
  // birinchisining kanonik nusxasi bo'ladi, ya'ni Google ularni bitta
  // sahifa deb biladi va sitemapga faqat biri tushadi.
  const korilgan = new Map<string, string>();

  for (const y of LUGAT) {
    const nom = lNom(y);
    const yol = lYol(y);
    const kurs = km(y.kursNomi);
    const ayirish = (nomSoni.get(nom) ?? 1) > 1 ? ` (${kurs})` : "";
    const asliy = korilgan.get(nom + ayirish);
    korilgan.set(nom + ayirish, asliy ?? yol);
    const qoida = J(y.n.q);

    // Formulalar: to'liq darsdagi NOMLILAR, keyin nazariyadagi qisqa
    // ro'yxat. Ikkala manbada bir xil formula bo'lishi odatiy holat
    // (`D = b² − 4ac` ikkalasida ham bor) — takrori tashlanadi, aks holda
    // sahifada ketma-ket ikki marta turardi.
    const korgan = new Set<string>();
    const formulalar: { n?: string; f: string }[] = [];
    for (const f of [...(y.t?.f ?? []).map((x) => ({ n: J(x.n), f: x.f })),
      ...(y.n.f ?? []).map((x) => ({ f: MT(x) }))]) {
      const kalit = f.f.replace(/\s+/g, "");
      if (korgan.has(kalit)) continue;
      korgan.add(kalit);
      formulalar.push(f);
    }
    const qadamlar = (y.t?.s ?? []).map(J);
    const xatolar = [...(y.n.e ? [J(y.n.e)] : []), ...(y.t?.x ?? []).map(J)].slice(0, 4);
    const mis: Misol[] = (y.t?.m ?? []).slice(0, 3).map((m) => ({
      s: MT(m.s), j: m.j, ...(m.y.length ? { y: m.y.map(MT) } : {}),
      jt: L("Yechimi", "Решение"),
    }));

    // Savol-javob — aynan qidiruvga yoziladigan shaklda. Javoblar
    // sahifaning o'zidan olinadi, yangi gap to'qilmaydi.
    const savollar: { s: string; j: string }[] = [
      { s: L(`${nom} — bu nima?`, `${nom} — что это?`), j: qoida },
      ...(formulalar.length ? [{
        s: L(`${nom} formulasi qanday?`, `Какая формула у «${nom}»?`),
        j: formulalar.slice(0, 4).map((f) => (f.n ? `${f.n}: ${f.f}` : f.f)).join(";  "),
      }] : []),
      { s: L(`${nom} qaysi sinfda o'tiladi?`, `В каком классе проходят «${nom}»?`),
        j: L(`${kurs} dasturida. Shu mavzu bo'yicha ${y.darslar.length} ta dars va mashqlar bor.`,
          `В программе «${kurs}». По этой теме ${y.darslar.length} урок(ов) и упражнения.`) },
      ...(xatolar.length ? [{
        s: L(`${nom}da ko'p qilinadigan xato nima?`, `Какая ошибка чаще всего встречается в «${nom}»?`),
        j: xatolar[0]!,
      }] : []),
    ];

    // Qo'shni atamalar — bir xil sinfdagilar. Ichki havola bo'lmasa
    // Google lug'at sahifalarini "yetim" deb hisoblab, ko'pini
    // indekslamaydi: ro'yxat sahifasidan 287 ta havola bitta zinapoya,
    // qo'shnilar esa ularni bir-biriga bog'laydi.
    const qoshni = LUGAT.filter((x) => x !== y && x.grade === y.grade).slice(0, 10);

    sahifalar[yol] = {
      sarlavha: L(`${nom}${ayirish} — qoida, formula va yechilgan misollar | ${BREND}`,
        `${nom}${ayirish} — правило, формула и разобранные примеры | ${BREND}`),
      tavsif: qisqa(L(
        `${nom}: ${birGap(qoida)} Formulalar, yechish tartibi, yechilgan misollar va tipik xatolar. ${kurs}, bepul.`,
        `${nom}: ${birGap(qoida)} Формулы, порядок решения, разобранные примеры и типичные ошибки. ${kurs}, бесплатно.`)),
      h1: nom,
      matn: [
        qoida,
        ...(y.t?.t ?? []).map((x) => `${J(x.h)}. ${J(x.p)}`),
        L(`Mavzu ${kurs} dasturida o'tiladi. Pastdagi darsda shu mavzu bo'yicha mashqlar bor: javob darhol tekshiriladi, xato qilingan savollar keyin qayta so'raladi.`,
          `Тема проходится в программе «${kurs}». В уроке ниже есть упражнения по этой теме: ответ проверяется сразу, ошибки потом повторяются.`),
      ],
      ...(formulalar.length ? { formulalar, formula_sarlavha: L("Formulalar", "Формулы") } : {}),
      ...(qadamlar.length ? { qadamlar, qadam_sarlavha: L("Yechish tartibi", "Порядок решения") } : {}),
      ...(mis.length ? { misollar: mis, misol_sarlavha: L("Yechilgan misollar", "Разобранные примеры") } : {}),
      ...(xatolar.length ? { xatolar, xato_sarlavha: L("Tipik xatolar", "Типичные ошибки") } : {}),
      savollar, savol_sarlavha: L("Savol va javob", "Вопросы и ответы"),
      guruhlar: [
        { nom: L("Shu mavzu bo'yicha darslar", "Уроки по этой теме"),
          qatorlar: y.darslar.map((d) => ({
            yol: `${P}/kurs/${d.kurs}/${d.bob}-bob/${d.dars}-dars`,
            nom: L(`${km(d.kursNomi)} · ${d.bob}-bob · ${d.dars}-dars`, `${km(d.kursNomi)} · глава ${d.bob} · урок ${d.dars}`),
          })) },
        ...(qoshni.length ? [{ nom: L(`${kurs} atamalari`, `Термины: ${kurs}`), qatorlar: qoshni.map((x) => ({ yol: lYol(x), nom: lNom(x) })) }] : []),
      ],
      havolalar: [
        LUGAT_H,
        { yol: `${P}/formulalar`, nom: L("Matematika formulalari", "Формулы по математике") },
        { yol: `${P}/kurs/${y.darslar[0]!.kurs}`, nom: kurs },
      ],
      statik: true,
      ...(asliy ? { kanonik: asliy } : {}),
      ld: [
        {
          "@context": "https://schema.org", "@type": "DefinedTerm", name: nom,
          description: qisqa(qoida, 300), url: ASOS + yol, inLanguage: L("uz", "ru"),
          inDefinedTermSet: {
            "@type": "DefinedTermSet", name: L("Matematika lug'ati", "Математический словарь"),
            url: ASOS + LUGAT_H.yol,
          },
          educationalLevel: kurs,
        },
        {
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: savollar.map((s) => ({
            "@type": "Question", name: s.s,
            acceptedAnswer: { "@type": "Answer", text: s.j },
          })),
        },
        yolak([BOSH, LUGAT_H, { yol, nom }]),
      ],
      // To'liq tushuntirishi bor atama (yechilgan misollar, qadamlar) —
      // mazmuni boy, qidiruvda ham oldinroq turishi kerak.
      muhim: y.t ? 0.7 : 0.6,
    };
  }

  // Lug'at ro'yxati — sinf bo'yicha guruhlangan.
  const lugatGuruh = new Map<string, typeof LUGAT>();
  for (const y of LUGAT) {
    const k = km(y.kursNomi);
    lugatGuruh.set(k, [...(lugatGuruh.get(k) ?? []), y]);
  }
  sahifalar[LUGAT_H.yol] = {
    sarlavha: L(`Matematika lug'ati — ${LUGAT.length} atama: qoida, formula va misollar | ${BREND}`,
      `Математический словарь — ${LUGAT.length} терминов: правила, формулы и примеры | ${BREND}`),
    tavsif: qisqa(L(
      `Matematika atamalari izohi: ${LUGAT.length} ta mavzu — qoidasi, formulasi, yechish tartibi, yechilgan misollari `
        + "va tipik xatolari bilan. 1–11-sinf va oliy matematika. Bepul.",
      `Объяснение математических терминов: ${LUGAT.length} тем — правило, формула, порядок решения, разобранные примеры `
        + "и типичные ошибки. 1–11 класс и высшая математика. Бесплатно.")),
    h1: L("Matematika lug'ati", "Математический словарь"),
    matn: [
      L(`${LUGAT.length} ta matematik atama va mavzu: har biri uchun qoida odam tilida, formulalar, yechish tartibi, `
          + "yechilgan misollar va shu mavzuda eng ko'p qilinadigan xato.",
        `${LUGAT.length} математических терминов и тем: для каждого — правило простыми словами, формулы, порядок решения, `
          + "разобранные примеры и самая частая ошибка по теме."),
      L("Har atamadan o'sha mavzu o'tiladigan darsga o'tish mumkin — u yerda mashqlar bor va javob darhol tekshiriladi.",
        "С каждого термина можно перейти к уроку по этой теме — там упражнения и мгновенная проверка ответа."),
    ],
    guruhlar: [...lugatGuruh].map(([k, lar]) => ({
      nom: k, qatorlar: lar.map((y) => ({ yol: lYol(y), nom: lNom(y) })),
    })),
    havolalar: [
      { yol: `${P}/formulalar`, nom: L("Matematika formulalari", "Формулы по математике") },
      DARSLAR,
    ],
    statik: true,
    ld: [
      {
        "@context": "https://schema.org", "@type": "DefinedTermSet",
        name: L("Matematika lug'ati", "Математический словарь"), url: ASOS + LUGAT_H.yol,
        inLanguage: L("uz", "ru"), publisher: TASHKILOT,
        hasDefinedTerm: LUGAT.map((y) => ({ "@type": "DefinedTerm", name: lNom(y), url: ASOS + lYol(y) })),
      },
      yolak([BOSH, LUGAT_H]),
    ],
    muhim: 0.9,
  };

  /* ---------------------------------------------------------- ma'lumotnoma */

  /*
   * MA'LUMOTNOMA — jadval va qoidalar sahifalari.
   *
   * Bu so'rovlar o'quv dasturiga bog'lanmaydi va shuning uchun hech bir
   * dars sahifasiga tushmaydi: "100 gacha tub sonlar", "kvadratlar
   * jadvali", "rim raqamlari", "o'lchov birliklari jadvali", "daraja
   * xossalari", "trigonometriya jadvali". Odam bularni darsni izlab
   * emas, QO'LIDAGI masala uchun yozadi — va topgan joyida qoladi.
   *
   * Jadvallarning hammasi SHU YERDA hisoblanadi, qo'lda yozilmaydi:
   * qo'lda yozilgan 100 ta kvadratning birortasida xato bo'lsa, u
   * sahifada yillab turardi va aynan shu sahifa "ishonchli
   * ma'lumotnoma" bo'lishi kerak.
   */
  const MLM_H: Havola = { yol: `${P}/malumotnoma`, nom: L("Matematika ma'lumotnomasi", "Справочник по математике") };
  /** Ma'lumotnoma sahifalari — havolalari va yo'lagi oxirida to'ldiriladi. */
  const mlm: { yol: string; nom: string }[] = [];
  const qator = (n: number, dan = 1) => Array.from({ length: n }, (_, i) => i + dan);

  function malumotnoma(bolak: string, nom: string, s: Omit<Sahifa, "ld" | "havolalar"> & { muhim: number }): void {
    const yol = `${P}/${bolak}`;
    mlm.push({ yol, nom });
    sahifalar[yol] = { ...s, statik: true, havolalar: [], ld: [] };
  }

  /* --- tub sonlar --- */

  const tub: number[] = [];
  for (let n = 2; n <= 1000; n++) if (tub.every((p) => p * p > n || n % p !== 0)) tub.push(n);
  const tub100 = tub.filter((p) => p < 100);
  malumotnoma("tub-sonlar", L("Tub sonlar", "Простые числа"), {
    sarlavha: L(`Tub sonlar — 1000 gacha to'liq ro'yxat va jadval | ${BREND}`,
      `Простые числа — полный список и таблица до 1000 | ${BREND}`),
    tavsif: L(`Tub sonlar: 100 gacha ${tub100.length} ta, 1000 gacha ${tub.length} ta. To'liq ro'yxat, `
        + "son tub ekanini tekshirish usuli va murakkab sonlardan farqi.",
      `Простые числа: до 100 — ${tub100.length}, до 1000 — ${tub.length}. Полный список, способ проверки `
        + "числа на простоту и отличие от составных."),
    h1: L("Tub sonlar", "Простые числа"),
    matn: [
      L("Tub son — faqat ikkita bo'luvchisi bor son: 1 va o'zi. Masalan 7 ni faqat 1 ga va 7 ga bo'lish mumkin. "
          + "Ikkitadan ko'p bo'luvchisi bo'lgan son murakkab deyiladi: 12 ning bo'luvchilari 1, 2, 3, 4, 6, 12.",
        "Простое число — число ровно с двумя делителями: 1 и само себя. Например, 7 делится только на 1 и на 7. "
          + "Число с более чем двумя делителями называется составным: у 12 делители 1, 2, 3, 4, 6, 12."),
      L("1 na tub, na murakkab: uning bo'luvchisi bitta. 2 — eng kichik tub son va yagona juft tub son, "
          + "chunki qolgan hamma juft son 2 ga bo'linadi.",
        "1 не является ни простым, ни составным: у него один делитель. 2 — наименьшее простое и единственное чётное "
          + "простое число, так как все остальные чётные делятся на 2."),
      L(`100 gacha ${tub100.length} ta tub son bor, 1000 gacha — ${tub.length} ta. Ularning soni cheksiz: `
          + "eng katta tub son yo'q.",
        `До 100 ${tub100.length} простых чисел, до 1000 — ${tub.length}. Их бесконечно много: наибольшего простого числа нет.`),
    ],
    qadamlar: [
      L("Son tub ekanini tekshirish: uning kvadrat ildizidan katta bo'lmagan tub sonlarga bo'lib ko'ring.",
        "Проверка числа на простоту: разделите его на простые числа, не превышающие его квадратный корень."),
      L("Masalan 97: √97 ≈ 9,8 — ya'ni 2, 3, 5, 7 ga bo'linishini tekshirish kifoya. Hech biriga bo'linmadi — 97 tub son.",
        "Например, 97: √97 ≈ 9,8 — достаточно проверить делимость на 2, 3, 5, 7. Ни на одно не делится — 97 простое."),
      L("Bo'linish belgilari ishni tezlashtiradi: oxirgi raqam juft bo'lsa yoki 5 bo'lsa, son darhol tub emas.",
        "Признаки делимости ускоряют проверку: если последняя цифра чётная или 5, число сразу не простое."),
    ],
    jadvallar: [
      { nom: L("100 gacha tub sonlar", "Простые числа до 100"),
        // Sarlavha qatori bo'sh bo'lsa, u sahifada sababsiz bo'sh yo'lak
        // bo'lib ko'rinadi — shuning uchun o'nliklar yozilgan.
        bosh: qator(5).map((i) => `${(i - 1) * 20}–${i * 20 - 1}`),
        qatorlar: (() => {
          // Har ustun — bir yigirmalik (0–19, 20–39, …): tub sonlar shu
          // ko'rinishda qaysi oraliqda zichroq ekani ko'rinadi.
          const ust = qator(5).map((i) => tub100.filter((p) => p >= (i - 1) * 20 && p < i * 20));
          const balandlik = Math.max(...ust.map((x) => x.length));
          return qator(balandlik).map((r) => ust.map((x) => x[r - 1] ?? ""));
        })() },
      { nom: L("Dastlabki 20 ta tub son", "Первые 20 простых чисел"),
        bosh: [L("№", "№"), L("Tub son", "Простое число"), L("№", "№"), L("Tub son", "Простое число")],
        qatorlar: qator(10).map((i) => [i, tub[i - 1]!, i + 10, tub[i + 9]!]) },
    ],
    savollar: [
      { s: L("1 tub sonmi?", "Является ли 1 простым числом?"),
        j: L("Yo'q. Tub sonning ikkita bo'luvchisi bo'lishi kerak, 1 ning esa bittasi — o'zi.",
          "Нет. У простого числа должно быть два делителя, а у 1 он один — само число.") },
      { s: L("Eng kichik tub son qaysi?", "Какое наименьшее простое число?"),
        j: L("2. U yana yagona juft tub son.", "2. Это также единственное чётное простое число.") },
      { s: L("100 gacha nechta tub son bor?", "Сколько простых чисел до 100?"),
        j: L(`${tub100.length} ta: ${tub100.slice(0, 10).join(", ")} va boshqalar.`,
          `${tub100.length}: ${tub100.slice(0, 10).join(", ")} и другие.`) },
      { s: L("Tub va murakkab son nimasi bilan farq qiladi?", "Чем отличаются простое и составное числа?"),
        j: L("Tub sonning ikkita bo'luvchisi bor (1 va o'zi), murakkab sonning ikkitadan ko'p.",
          "У простого числа два делителя (1 и само себя), у составного — больше двух.") },
    ],
    muhim: 0.8,
  });

  /* --- bo'linish belgilari --- */

  malumotnoma("bolinish-belgilari", L("Bo'linish belgilari", "Признаки делимости"), {
    sarlavha: L(`Bo'linish belgilari — 2, 3, 4, 5, 6, 8, 9, 10, 11 ga | ${BREND}`,
      `Признаки делимости — на 2, 3, 4, 5, 6, 8, 9, 10, 11 | ${BREND}`),
    tavsif: L("Bo'linish belgilari jadvali: sonni bo'lmasdan, 2, 3, 4, 5, 6, 8, 9, 10, 11 va 25 ga bo'linishini "
        + "aniqlash. Har belgiga misol bilan.",
      "Таблица признаков делимости: как без деления определить делимость на 2, 3, 4, 5, 6, 8, 9, 10, 11 и 25. "
        + "С примером к каждому признаку."),
    h1: L("Bo'linish belgilari", "Признаки делимости"),
    matn: [
      L("Bo'linish belgisi — sonni haqiqatda bo'lmasdan, u berilgan songa qoldiqsiz bo'linishini aytib beradigan qoida. "
          + "Kasrni qisqartirishda, EKUB topishda va sonni ko'paytuvchilarga ajratishda eng ko'p kerak bo'ladi.",
        "Признак делимости — правило, которое позволяет узнать, делится ли число без остатка, не выполняя само деление. "
          + "Чаще всего нужен при сокращении дробей, поиске НОД и разложении числа на множители."),
      L("Belgilarni birlashtirish mumkin: 6 ga bo'linish — 2 ga va 3 ga bir vaqtda bo'linish; 12 ga bo'linish — "
          + "3 ga va 4 ga; 15 ga bo'linish — 3 ga va 5 ga.",
        "Признаки можно объединять: делимость на 6 — это делимость на 2 и на 3 одновременно; на 12 — на 3 и на 4; "
          + "на 15 — на 3 и на 5."),
    ],
    jadval: {
      nom: L("Bo'linish belgilari jadvali", "Таблица признаков делимости"),
      bosh: [L("Nechaga", "На что"), L("Belgisi", "Признак"), L("Misol", "Пример")],
      qatorlar: [
        [2, L("oxirgi raqam juft: 0, 2, 4, 6, 8", "последняя цифра чётная: 0, 2, 4, 6, 8"), "1 34 → 34 juft → 134 ⋮ 2"],
        [3, L("raqamlar yig'indisi 3 ga bo'linadi", "сумма цифр делится на 3"), "261 → 2+6+1 = 9 ⋮ 3"],
        [4, L("oxirgi ikki raqamdan tuzilgan son 4 ga bo'linadi", "число из двух последних цифр делится на 4"), "1316 → 16 ⋮ 4"],
        [5, L("oxirgi raqam 0 yoki 5", "последняя цифра 0 или 5"), "475 → …5 ⋮ 5"],
        [6, L("2 ga ham, 3 ga ham bo'linadi", "делится и на 2, и на 3"), "534 → juft, 5+3+4 = 12 ⋮ 3"],
        [8, L("oxirgi uch raqamdan tuzilgan son 8 ga bo'linadi", "число из трёх последних цифр делится на 8"), "5112 → 112 ⋮ 8"],
        [9, L("raqamlar yig'indisi 9 ga bo'linadi", "сумма цифр делится на 9"), "837 → 8+3+7 = 18 ⋮ 9"],
        [10, L("oxirgi raqam 0", "последняя цифра 0"), "720 → …0 ⋮ 10"],
        [11, L("toq va juft o'rindagi raqamlar yig'indilari ayirmasi 11 ga bo'linadi (0 ham)",
          "разность сумм цифр на нечётных и чётных местах делится на 11 (в том числе 0)"), "935 → (9+5) − 3 = 11 ⋮ 11"],
        [25, L("oxirgi ikki raqam 00, 25, 50 yoki 75", "последние две цифры 00, 25, 50 или 75"), "1375 → …75 ⋮ 25"],
      ],
    },
    xatolar: [
      L("3 ga bo'linishni oxirgi raqam bo'yicha tekshirish. 23 ning oxirgi raqami 3, lekin 23 uch ga bo'linmaydi — "
          + "qaraladigan narsa RAQAMLAR YIG'INDISI.",
        "Проверять делимость на 3 по последней цифре. У 23 последняя цифра 3, но 23 на 3 не делится — смотреть надо на СУММУ ЦИФР."),
      L("9 ga bo'linsa 3 ga ham bo'linadi, teskarisi esa har doim emas: 12 uchga bo'linadi, to'qqizga — yo'q.",
        "Если число делится на 9, оно делится и на 3, но не наоборот: 12 делится на 3, а на 9 — нет."),
    ],
    savollar: [
      { s: L("3 ga bo'linish belgisi qanday?", "Каков признак делимости на 3?"),
        j: L("Raqamlar yig'indisi 3 ga bo'linsa, son ham 3 ga bo'linadi: 261 → 2+6+1 = 9, 9 ⋮ 3, demak 261 ⋮ 3.",
          "Если сумма цифр делится на 3, то и число делится на 3: 261 → 2+6+1 = 9, 9 ⋮ 3, значит 261 ⋮ 3.") },
      { s: L("4 ga bo'linishni qanday bilish mumkin?", "Как узнать делимость на 4?"),
        j: L("Oxirgi ikki raqamdan tuzilgan son 4 ga bo'linsa, butun son ham bo'linadi: 1316 → 16 ⋮ 4.",
          "Если число из двух последних цифр делится на 4, то делится и всё число: 1316 → 16 ⋮ 4.") },
      { s: L("7 ga bo'linish belgisi bormi?", "Есть ли признак делимости на 7?"),
        j: L("Bor, lekin u murakkab: oxirgi raqamni ikkilantirib qolganidan ayiriladi (364 → 36 − 8 = 28 ⋮ 7). "
            + "Amalda 7 ga shunchaki bo'lib ko'rish tezroq.",
          "Есть, но сложный: последнюю цифру удваивают и вычитают из остальной части (364 → 36 − 8 = 28 ⋮ 7). "
            + "На практике быстрее просто разделить на 7.") },
    ],
    muhim: 0.8,
  });

  /* --- EKUB va EKUK --- */

  const ekub = (a: number, b: number): number => (b ? ekub(b, a % b) : a);
  malumotnoma("ekub-ekuk", L("EKUB va EKUK", "НОД и НОК"), {
    sarlavha: L(`EKUB va EKUK — topish usullari, jadval va misollar | ${BREND}`,
      `НОД и НОК — способы нахождения, таблица и примеры | ${BREND}`),
    tavsif: L("EKUB (eng katta umumiy bo'luvchi) va EKUK (eng kichik umumiy karrali): ko'paytuvchilarga ajratish va "
        + "Yevklid usuli, tayyor jadval, yechilgan misollar.",
      "НОД (наибольший общий делитель) и НОК (наименьшее общее кратное): разложение на множители и алгоритм Евклида, "
        + "готовая таблица, разобранные примеры."),
    h1: L("EKUB va EKUK", "НОД и НОК"),
    matn: [
      L("EKUB — ikki sonni qoldiqsiz bo'ladigan sonlarning eng kattasi. 12 va 18 ning umumiy bo'luvchilari 1, 2, 3, 6; "
          + "eng kattasi 6, ya'ni EKUB(12, 18) = 6. EKUB kasrni qisqartirishda kerak.",
        "НОД — наибольшее из чисел, на которые делятся оба числа без остатка. Общие делители 12 и 18 — это 1, 2, 3, 6; "
          + "наибольший 6, то есть НОД(12, 18) = 6. НОД нужен для сокращения дробей."),
      L("EKUK — ikki songa ham bo'linadigan sonlarning eng kichigi. 4 va 6 ga 12, 24, 36 bo'linadi; eng kichigi 12, "
          + "ya'ni EKUK(4, 6) = 12. EKUK maxrajlari xil kasrlarni qo'shishda kerak.",
        "НОК — наименьшее из чисел, которые делятся на оба числа. На 4 и 6 делятся 12, 24, 36; наименьшее 12, "
          + "то есть НОК(4, 6) = 12. НОК нужен для сложения дробей с разными знаменателями."),
    ],
    formulalar: [
      { n: L("EKUB va EKUK bog'liqligi", "Связь НОД и НОК"), f: "EKUB(a, b) · EKUK(a, b) = a · b" },
      { n: L("EKUK ni EKUB orqali", "НОК через НОД"), f: "EKUK(a, b) = a · b / EKUB(a, b)" },
      { n: L("Yevklid usuli", "Алгоритм Евклида"), f: "EKUB(a, b) = EKUB(b, a mod b),   EKUB(a, 0) = a" },
    ],
    qadamlar: [
      L("Ko'paytuvchilarga ajratish usuli: ikki sonni ham tub ko'paytuvchilarga ajrating.",
        "Способ разложения: разложите оба числа на простые множители."),
      L("EKUB — UMUMIY ko'paytuvchilarning eng kichik darajalari ko'paytmasi. 12 = 2²·3, 18 = 2·3² → EKUB = 2·3 = 6.",
        "НОД — произведение ОБЩИХ множителей в наименьших степенях. 12 = 2²·3, 18 = 2·3² → НОД = 2·3 = 6."),
      L("EKUK — HAMMA ko'paytuvchilarning eng katta darajalari ko'paytmasi. 12 = 2²·3, 18 = 2·3² → EKUK = 2²·3² = 36.",
        "НОК — произведение ВСЕХ множителей в наибольших степенях. 12 = 2²·3, 18 = 2·3² → НОК = 2²·3² = 36."),
      L("Yevklid usuli tezroq: kattasini kichigiga bo'lib, qoldiqni olasiz va qoldiq 0 bo'lgunicha takrorlaysiz. "
          + "Oxirgi nol bo'lmagan qoldiq — EKUB.",
        "Алгоритм Евклида быстрее: делите большее на меньшее, берёте остаток и повторяете, пока остаток не станет 0. "
          + "Последний ненулевой остаток — НОД."),
    ],
    misollar: [
      { s: L("EKUB(48, 36) va EKUK(48, 36) ni toping.", "Найдите НОД(48, 36) и НОК(48, 36)."),
        y: [L("48 = 2⁴ · 3,   36 = 2² · 3²", "48 = 2⁴ · 3,   36 = 2² · 3²"),
          L("EKUB: umumiylar eng kichik darajada → 2² · 3 = 12", "НОД: общие в наименьшей степени → 2² · 3 = 12"),
          L("EKUK: hammasi eng katta darajada → 2⁴ · 3² = 144", "НОК: все в наибольшей степени → 2⁴ · 3² = 144"),
          L("Tekshirish: 12 · 144 = 1728 = 48 · 36", "Проверка: 12 · 144 = 1728 = 48 · 36")],
        j: "EKUB = 12, EKUK = 144", jt: L("Yechimi", "Решение") },
      { s: L("Yevklid usuli bilan EKUB(1071, 462) ni toping.", "Найдите НОД(1071, 462) алгоритмом Евклида."),
        y: ["1071 = 2 · 462 + 147", "462 = 3 · 147 + 21", "147 = 7 · 21 + 0",
          L("Oxirgi nol bo'lmagan qoldiq — 21.", "Последний ненулевой остаток — 21.")],
        j: "21", jt: L("Yechimi", "Решение") },
    ],
    jadval: {
      nom: L("Tez-tez uchraydigan juftliklar", "Часто встречающиеся пары"),
      bosh: ["a", "b", "EKUB", "EKUK"],
      qatorlar: [[4, 6], [6, 8], [8, 12], [9, 12], [10, 15], [12, 18], [14, 21], [15, 20], [16, 24], [18, 24],
        [20, 30], [24, 36], [25, 35], [27, 36], [30, 45], [36, 48], [40, 60], [48, 72]]
        .map(([a, b]) => [a!, b!, ekub(a!, b!), (a! * b!) / ekub(a!, b!)]),
    },
    savollar: [
      { s: L("EKUB qanday topiladi?", "Как найти НОД?"),
        j: L("Ikki sonni tub ko'paytuvchilarga ajratib, umumiylarini eng kichik darajada ko'paytiring; yoki Yevklid "
            + "usulidan foydalaning: qoldiq 0 bo'lgunicha bo'lib boring.",
          "Разложите оба числа на простые множители и перемножьте общие в наименьшей степени; или примените алгоритм "
            + "Евклида: делите с остатком, пока остаток не станет 0.") },
      { s: L("EKUK ni EKUB dan topish mumkinmi?", "Можно ли найти НОК через НОД?"),
        j: L("Ha: EKUK(a, b) = a · b / EKUB(a, b). Masalan EKUK(12, 18) = 12 · 18 / 6 = 36.",
          "Да: НОК(a, b) = a · b / НОД(a, b). Например, НОК(12, 18) = 12 · 18 / 6 = 36.") },
      { s: L("EKUB 1 ga teng bo'lsa nima bo'ladi?", "Что значит, если НОД равен 1?"),
        j: L("Sonlar o'zaro tub deyiladi — umumiy bo'luvchisi yo'q. Bunda EKUK ularning ko'paytmasiga teng: "
            + "EKUK(7, 9) = 63.",
          "Числа называются взаимно простыми — у них нет общих делителей. Тогда НОК равен их произведению: НОК(7, 9) = 63.") },
    ],
    muhim: 0.8,
  });

  /* --- kvadratlar, kublar, ildizlar --- */

  malumotnoma("kvadratlar-jadvali", L("Kvadratlar jadvali", "Таблица квадратов"), {
    sarlavha: L(`Kvadratlar jadvali — 1 dan 100 gacha sonlar kvadrati | ${BREND}`,
      `Таблица квадратов — квадраты чисел от 1 до 100 | ${BREND}`),
    tavsif: L("Sonlar kvadrati jadvali 1 dan 100 gacha: to'liq jadval, kvadratga ko'tarish qoidalari va og'zaki "
        + "hisoblash usullari. Bepul ma'lumotnoma.",
      "Таблица квадратов чисел от 1 до 100: полная таблица, правила возведения в квадрат и приёмы устного счёта. "
        + "Бесплатный справочник."),
    h1: L("Kvadratlar jadvali (1–100)", "Таблица квадратов (1–100)"),
    matn: [
      L("Sonning kvadrati — uni o'ziga ko'paytirish: a² = a · a. Masalan 13² = 13 · 13 = 169. "
          + "Jadvalda qator o'nliklarni, ustun birliklarni beradi: 7-qator va 4-ustun kesishmasida 74² = 5476.",
        "Квадрат числа — умножение его на себя: a² = a · a. Например, 13² = 13 · 13 = 169. "
          + "В таблице строка задаёт десятки, столбец — единицы: на пересечении строки 7 и столбца 4 стоит 74² = 5476."),
      L("Og'zaki hisoblash: 5 bilan tugaydigan sonning kvadrati — o'nliklarni keyingisiga ko'paytirib, oxiriga 25 "
          + "qo'shiladi (35² → 3 · 4 = 12 → 1225). 1 dan 25 gacha kvadratlarni yod bilish DTM va Milliy sertifikatda "
          + "vaqtni sezilarli tejaydi.",
        "Устный счёт: квадрат числа, оканчивающегося на 5 — умножаем десятки на следующее число и дописываем 25 "
          + "(35² → 3 · 4 = 12 → 1225). Знание квадратов от 1 до 25 наизусть заметно экономит время на DTM и "
          + "Национальном сертификате."),
    ],
    formulalar: [
      { n: L("Yig'indi kvadrati", "Квадрат суммы"), f: "(a + b)² = a² + 2ab + b²" },
      { n: L("Ayirma kvadrati", "Квадрат разности"), f: "(a − b)² = a² − 2ab + b²" },
      { n: L("Kvadratlar ayirmasi", "Разность квадратов"), f: "a² − b² = (a − b)(a + b)" },
      { n: L("5 bilan tugagan son", "Число, оканчивающееся на 5"), f: "(10n + 5)² = 100·n·(n + 1) + 25" },
    ],
    jadvallar: [
      { nom: L("1–25 — yod olinadigan qism", "1–25 — для запоминания"),
        bosh: ["n", "n²", "n", "n²", "n", "n²", "n", "n²", "n", "n²"],
        qatorlar: qator(5).map((r) => qator(5).flatMap((c) => { const n = (c - 1) * 5 + r; return [n, n * n]; })) },
      { nom: L("Kvadratlar jadvali 10–99", "Таблица квадратов 10–99"),
        bosh: ["n", ...qator(10, 0)],
        qatorlar: qator(9).map((r) => [r, ...qator(10, 0).map((c) => (r * 10 + c) ** 2)]) },
      { nom: "100²", bosh: ["n", "n²"], qatorlar: [[100, 10000]] },
    ],
    savollar: [
      { s: L("13 ning kvadrati nechaga teng?", "Чему равен квадрат 13?"), j: "13² = 169" },
      { s: L("Sonni kvadratga ko'tarish nima?", "Что значит возвести число в квадрат?"),
        j: L("Uni o'ziga ko'paytirish: a² = a · a. 9² = 9 · 9 = 81.", "Умножить его на себя: a² = a · a. 9² = 9 · 9 = 81.") },
      { s: L("Manfiy sonning kvadrati qanday bo'ladi?", "Каким будет квадрат отрицательного числа?"),
        j: L("Musbat: (−6)² = 36. Ikki manfiy sonning ko'paytmasi musbat.",
          "Положительным: (−6)² = 36. Произведение двух отрицательных чисел положительно.") },
    ],
    muhim: 0.8,
  });

  malumotnoma("kublar-jadvali", L("Kublar jadvali", "Таблица кубов"), {
    sarlavha: L(`Kublar jadvali — 1 dan 30 gacha sonlar kubi | ${BREND}`,
      `Таблица кубов — кубы чисел от 1 до 30 | ${BREND}`),
    tavsif: L("Sonlar kubi jadvali 1 dan 30 gacha, kub ildizlari, kublar yig'indisi va ayirmasi formulalari. "
        + "Bepul ma'lumotnoma.",
      "Таблица кубов чисел от 1 до 30, кубические корни, формулы суммы и разности кубов. Бесплатный справочник."),
    h1: L("Kublar jadvali (1–30)", "Таблица кубов (1–30)"),
    matn: [
      L("Sonning kubi — uni o'ziga ikki marta ko'paytirish: a³ = a · a · a. Masalan 4³ = 4 · 4 · 4 = 64. "
          + "Geometriyada kub qirrasi a bo'lgan kubning hajmi aynan a³ ga teng — nom shundan.",
        "Куб числа — умножение его на себя дважды: a³ = a · a · a. Например, 4³ = 4 · 4 · 4 = 64. "
          + "В геометрии объём куба с ребром a равен именно a³ — отсюда и название."),
      L("Manfiy sonning kubi manfiy bo'ladi: (−3)³ = −27. Bu kvadratdan farqi — kvadrat doim musbat.",
        "Куб отрицательного числа отрицателен: (−3)³ = −27. Этим он отличается от квадрата, который всегда положителен."),
    ],
    formulalar: [
      { n: L("Yig'indi kubi", "Куб суммы"), f: "(a + b)³ = a³ + 3a²b + 3ab² + b³" },
      { n: L("Ayirma kubi", "Куб разности"), f: "(a − b)³ = a³ − 3a²b + 3ab² − b³" },
      { n: L("Kublar yig'indisi", "Сумма кубов"), f: "a³ + b³ = (a + b)(a² − ab + b²)" },
      { n: L("Kublar ayirmasi", "Разность кубов"), f: "a³ − b³ = (a − b)(a² + ab + b²)" },
      { n: L("Kub ildiz", "Кубический корень"), f: "∛(a³) = a,   ∛(−a) = −∛a" },
    ],
    jadval: {
      nom: L("Kublar va kub ildizlar", "Кубы и кубические корни"),
      bosh: ["n", "n³", "n", "n³", "n", "n³"],
      qatorlar: qator(10).map((r) => qator(3).flatMap((c) => { const n = (c - 1) * 10 + r; return [n, n ** 3]; })),
    },
    savollar: [
      { s: L("Sonning kubi nima?", "Что такое куб числа?"),
        j: L("Sonni o'ziga ikki marta ko'paytirish: a³ = a · a · a. 5³ = 125.",
          "Умножение числа на себя дважды: a³ = a · a · a. 5³ = 125.") },
      { s: L("Manfiy sonning kubi musbat bo'ladimi?", "Будет ли куб отрицательного числа положительным?"),
        j: L("Yo'q, manfiy qoladi: (−3)³ = −27.", "Нет, он остаётся отрицательным: (−3)³ = −27.") },
    ],
    muhim: 0.7,
  });

  const ildiz = (n: number) => Math.sqrt(n).toFixed(3).replace(".", ",");
  malumotnoma("kvadrat-ildizlar", L("Kvadrat ildizlar", "Квадратные корни"), {
    sarlavha: L(`Kvadrat ildizlar jadvali — √1 dan √100 gacha | ${BREND}`,
      `Таблица квадратных корней — от √1 до √100 | ${BREND}`),
    tavsif: L("Kvadrat ildizlar jadvali: 1 dan 100 gacha sonlarning ildizi uch xona aniqligida, ildiz xossalari va "
        + "ildizdan chiqarish qoidalari.",
      "Таблица квадратных корней: корни чисел от 1 до 100 с точностью до трёх знаков, свойства корней и правила "
        + "вынесения из-под корня."),
    h1: L("Kvadrat ildizlar jadvali", "Таблица квадратных корней"),
    matn: [
      L("√a — kvadrati a ga teng bo'lgan MANFIY BO'LMAGAN son: √49 = 7, chunki 7² = 49. Manfiy sondan kvadrat ildiz "
          + "chiqarilmaydi (haqiqiy sonlarda).",
        "√a — это НЕОТРИЦАТЕЛЬНОЕ число, квадрат которого равен a: √49 = 7, так как 7² = 49. Из отрицательного числа "
          + "квадратный корень не извлекается (в действительных числах)."),
      L("Ildiz butun chiqmasa, uni ko'paytuvchilarga ajratib soddalashtiriladi: √72 = √(36 · 2) = 6√2. "
          + "Javobni DTM da aynan shu ko'rinishda yozish talab qilinadi.",
        "Если корень не извлекается нацело, его упрощают разложением на множители: √72 = √(36 · 2) = 6√2. "
          + "На DTM ответ требуется записывать именно в таком виде."),
    ],
    formulalar: [
      { n: L("Ko'paytmadan ildiz", "Корень из произведения"), f: "√(ab) = √a · √b   (a, b ≥ 0)" },
      { n: L("Bo'linmadan ildiz", "Корень из частного"), f: "√(a/b) = √a / √b   (a ≥ 0, b > 0)" },
      { n: L("Ildiz ostidan chiqarish", "Вынесение из-под корня"), f: "√(a²b) = a√b   (a ≥ 0)" },
      { n: L("Kvadratdan ildiz", "Корень из квадрата"), f: "√(a²) = |a|" },
      { n: L("Maxrajni ildizdan xalos qilish", "Избавление от иррациональности"), f: "1/√a = √a / a" },
    ],
    jadval: {
      nom: L("√n — uch xona aniqligida", "√n — с точностью до трёх знаков"),
      bosh: ["n", "√n", "n", "√n", "n", "√n", "n", "√n", "n", "√n"],
      qatorlar: qator(20).map((r) => qator(5).flatMap((c) => { const n = (c - 1) * 20 + r; return [n, ildiz(n)]; })),
    },
    savollar: [
      { s: L("√72 ni qanday soddalashtiriladi?", "Как упростить √72?"),
        j: L("To'liq kvadratni ajratiladi: √72 = √(36 · 2) = 6√2.",
          "Выделяют полный квадрат: √72 = √(36 · 2) = 6√2.") },
      { s: L("√(a²) nimaga teng?", "Чему равно √(a²)?"),
        j: L("|a| ga, ya'ni a ning moduliga. √((−5)²) = 5, −5 emas.",
          "|a|, то есть модулю a. √((−5)²) = 5, а не −5.") },
      { s: L("Manfiy sondan ildiz chiqadimi?", "Извлекается ли корень из отрицательного числа?"),
        j: L("Haqiqiy sonlarda yo'q: hech bir sonning kvadrati manfiy emas.",
          "В действительных числах нет: квадрат ни одного числа не бывает отрицательным.") },
    ],
    muhim: 0.75,
  });

  /* --- Rim raqamlari --- */

  const RIM: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  const rim = (n: number): string => {
    let q = "", x = n;
    for (const [v, b] of RIM) while (x >= v) { q += b; x -= v; }
    return q;
  };
  malumotnoma("rim-raqamlari", L("Rim raqamlari", "Римские цифры"), {
    sarlavha: L(`Rim raqamlari — 1 dan 1000 gacha jadval va yozish qoidalari | ${BREND}`,
      `Римские цифры — таблица от 1 до 1000 и правила записи | ${BREND}`),
    tavsif: L("Rim raqamlari jadvali: 1–100 va yuzliklar, asosiy belgilar (I, V, X, L, C, D, M), yozish qoidalari va "
        + "oddiy raqamlarga o'tkazish.",
      "Таблица римских цифр: 1–100 и сотни, основные знаки (I, V, X, L, C, D, M), правила записи и перевод в арабские."),
    h1: L("Rim raqamlari", "Римские цифры"),
    matn: [
      L("Rim raqamlarida yetti belgi ishlatiladi: I — 1, V — 5, X — 10, L — 50, C — 100, D — 500, M — 1000. "
          + "Sonlar shu belgilarni yonma-yon yozib tuziladi.",
        "В римской записи используются семь знаков: I — 1, V — 5, X — 10, L — 50, C — 100, D — 500, M — 1000. "
          + "Числа составляются из этих знаков, записанных рядом."),
      L("Asosiy qoida: kichik belgi kattasidan KEYIN turса qo'shiladi (VI = 6), OLDIN tursa ayiriladi (IV = 4). "
          + "Ayirish uchun faqat I, X va C ishlatiladi va faqat keyingi ikki pog'onadan: IV, IX, XL, XC, CD, CM.",
        "Основное правило: меньший знак ПОСЛЕ большего прибавляется (VI = 6), ПЕРЕД большим — вычитается (IV = 4). "
          + "Для вычитания используются только I, X и C и только на две ступени вперёд: IV, IX, XL, XC, CD, CM."),
      L("Bir belgi ketma-ket uch martadan ko'p takrorlanmaydi: 4 — IV, IIII emas. Nol uchun belgi yo'q.",
        "Один знак не повторяется более трёх раз подряд: 4 — это IV, а не IIII. Знака для нуля нет."),
    ],
    jadvallar: [
      { nom: L("Asosiy belgilar", "Основные знаки"),
        bosh: [L("Rim", "Римское"), L("Son", "Число"), L("Rim", "Римское"), L("Son", "Число")],
        qatorlar: [["I", 1, "L", 50], ["V", 5, "C", 100], ["X", 10, "D", 500], ["", "", "M", 1000]] },
      { nom: L("1 dan 20 gacha", "От 1 до 20"), bosh: qator(10).map((i) => i),
        qatorlar: [qator(10).map((i) => rim(i)), qator(10, 11).map((i) => i), qator(10, 11).map((i) => rim(i))] },
      { nom: L("O'nliklar va yuzliklar", "Десятки и сотни"),
        bosh: [L("Son", "Число"), L("Rim", "Римское"), L("Son", "Число"), L("Rim", "Римское")],
        qatorlar: qator(9).map((i) => [i * 10, rim(i * 10), i * 100, rim(i * 100)]) },
    ],
    misollar: [
      { s: L("XLII sonini oddiy raqamlarda yozing.", "Запишите XLII арабскими цифрами."),
        y: [L("XL — X dan oldin, ya'ni 50 − 10 = 40", "XL — X перед L, то есть 50 − 10 = 40"),
          L("II — 1 + 1 = 2", "II — 1 + 1 = 2"), "40 + 2 = 42"], j: "42", jt: L("Yechimi", "Решение") },
      { s: L("1994 ni Rim raqamlarida yozing.", "Запишите 1994 римскими цифрами."),
        y: ["1000 → M", "900 → CM", "90 → XC", "4 → IV"], j: "MCMXCIV", jt: L("Yechimi", "Решение") },
    ],
    savollar: [
      { s: L("4 Rim raqamida qanday yoziladi?", "Как записывается 4 римскими цифрами?"),
        j: L("IV: I belgisi V dan oldin turgani uchun ayiriladi (5 − 1).",
          "IV: знак I стоит перед V, поэтому вычитается (5 − 1).") },
      { s: L("Rim raqamlarida nol bormi?", "Есть ли нуль в римских цифрах?"),
        j: L("Yo'q, nol uchun belgi yo'q.", "Нет, знака для нуля не существует.") },
      { s: L("XIX nechaga teng?", "Чему равно XIX?"), j: "19 (10 + 9)" },
    ],
    muhim: 0.75,
  });

  /* --- o'lchov birliklari --- */

  malumotnoma("olchov-birliklari", L("O'lchov birliklari", "Единицы измерения"), {
    sarlavha: L(`O'lchov birliklari jadvali — uzunlik, massa, yuza, hajm, vaqt | ${BREND}`,
      `Таблица единиц измерения — длина, масса, площадь, объём, время | ${BREND}`),
    tavsif: L("O'lchov birliklari va ularni o'tkazish jadvali: uzunlik, massa, yuza, hajm va vaqt. "
        + "Kilometrdan millimetrgacha, tonnadan grammgacha, gektar va sotix.",
      "Единицы измерения и таблица перевода: длина, масса, площадь, объём и время. От километра до миллиметра, "
        + "от тонны до грамма, гектары и сотки."),
    h1: L("O'lchov birliklari jadvali", "Таблица единиц измерения"),
    matn: [
      L("O'lchov birligini o'tkazishda yagona qoida bor: kichik birlikka o'tsangiz KO'PAYTIRASIZ, kattasiga "
          + "o'tsangiz BO'LASIZ. 3 km ni metrga: 3 · 1000 = 3000 m. 4500 g ni kilogrammga: 4500 : 1000 = 4,5 kg.",
        "При переводе единиц действует одно правило: переходя к меньшей единице — УМНОЖАЕМ, к большей — ДЕЛИМ. "
          + "3 км в метры: 3 · 1000 = 3000 м. 4500 г в килограммы: 4500 : 1000 = 4,5 кг."),
      L("Yuza va hajmda ko'paytuvchi kvadratga va kubga ko'tariladi: 1 m = 100 sm, lekin 1 m² = 100² = 10 000 sm², "
          + "1 m³ = 100³ = 1 000 000 sm³. Eng ko'p xato aynan shu yerda qilinadi.",
        "В площади и объёме множитель возводится в квадрат и в куб: 1 м = 100 см, но 1 м² = 100² = 10 000 см², "
          + "1 м³ = 100³ = 1 000 000 см³. Именно здесь допускают больше всего ошибок."),
    ],
    jadvallar: [
      { nom: L("Uzunlik", "Длина"), bosh: [L("Birlik", "Единица"), L("Qiymati", "Значение")],
        qatorlar: [
          ["1 km", L("1000 m", "1000 м")], ["1 m", L("10 dm = 100 sm = 1000 mm", "10 дм = 100 см = 1000 мм")],
          ["1 dm", L("10 sm = 100 mm", "10 см = 100 мм")], ["1 sm", L("10 mm", "10 мм")],
        ] },
      { nom: L("Massa", "Масса"), bosh: [L("Birlik", "Единица"), L("Qiymati", "Значение")],
        qatorlar: [
          ["1 t", L("10 kvintal = 1000 kg", "10 центнеров = 1000 кг")], ["1 kvintal", L("100 kg", "100 кг")],
          ["1 kg", L("1000 g", "1000 г")], ["1 g", L("1000 mg", "1000 мг")],
        ] },
      { nom: L("Yuza", "Площадь"), bosh: [L("Birlik", "Единица"), L("Qiymati", "Значение")],
        qatorlar: [
          ["1 km²", L("100 ga = 1 000 000 m²", "100 га = 1 000 000 м²")],
          ["1 ga", L("100 ar (sotix) = 10 000 m²", "100 ар (соток) = 10 000 м²")],
          ["1 ar", L("100 m²", "100 м²")], ["1 m²", L("100 dm² = 10 000 sm²", "100 дм² = 10 000 см²")],
        ] },
      { nom: L("Hajm va sig'im", "Объём и ёмкость"), bosh: [L("Birlik", "Единица"), L("Qiymati", "Значение")],
        qatorlar: [
          ["1 m³", L("1000 dm³ = 1000 l", "1000 дм³ = 1000 л")], ["1 l", L("1 dm³ = 1000 ml", "1 дм³ = 1000 мл")],
          ["1 dm³", L("1000 sm³", "1000 см³")], ["1 ml", L("1 sm³", "1 см³")],
        ] },
      { nom: L("Vaqt", "Время"), bosh: [L("Birlik", "Единица"), L("Qiymati", "Значение")],
        qatorlar: [
          ["1 " + L("asr", "век"), L("100 yil", "100 лет")], ["1 " + L("yil", "год"), L("12 oy = 365 kun", "12 месяцев = 365 дней")],
          ["1 " + L("sutka", "сутки"), L("24 soat", "24 часа")], ["1 " + L("soat", "час"), L("60 daqiqa = 3600 soniya", "60 минут = 3600 секунд")],
          ["1 " + L("daqiqa", "минута"), L("60 soniya", "60 секунд")],
        ] },
    ],
    savollar: [
      { s: L("1 gektarda nechta sotix bor?", "Сколько соток в 1 гектаре?"),
        j: L("100 sotix, ya'ni 10 000 m².", "100 соток, то есть 10 000 м².") },
      { s: L("1 m² nechta sm²?", "Сколько см² в 1 м²?"),
        j: L("10 000. 1 m = 100 sm bo'lgani uchun ko'paytuvchi kvadratga ko'tariladi: 100² = 10 000.",
          "10 000. Так как 1 м = 100 см, множитель возводится в квадрат: 100² = 10 000.") },
      { s: L("1 litr necha sm³?", "Сколько см³ в 1 литре?"), j: L("1000 sm³, ya'ni 1 dm³.", "1000 см³, то есть 1 дм³.") },
    ],
    muhim: 0.8,
  });

  /* --- foiz --- */

  malumotnoma("foiz", L("Foizlar", "Проценты"), {
    sarlavha: L(`Foizlar — topish formulalari, jadval va yechilgan masalalar | ${BREND}`,
      `Проценты — формулы, таблица и разобранные задачи | ${BREND}`),
    tavsif: L("Foiz nima va qanday topiladi: sonning foizi, foizi bo'yicha son, necha foiz ekani, foizga oshish va "
        + "kamayish. Formulalar, jadval va yechilgan masalalar.",
      "Что такое процент и как его находить: процент от числа, число по проценту, сколько процентов составляет, "
        + "увеличение и уменьшение на процент. Формулы, таблица и разобранные задачи."),
    h1: L("Foizlar", "Проценты"),
    matn: [
      L("Foiz — butunning yuzdan bir bo'lagi: 1% = 1/100 = 0,01. Shuning uchun har qanday foiz masalasi oddiy "
          + "ko'paytirish yoki bo'lishga keladi — faqat qaysi son BUTUN ekanini aniqlash kerak.",
        "Процент — одна сотая часть целого: 1% = 1/100 = 0,01. Поэтому любая задача на проценты сводится к обычному "
          + "умножению или делению — нужно лишь определить, какое число является ЦЕЛЫМ."),
      L("Uch asosiy savol bor: butun berilgan, foizi so'ralgan (ko'paytiriladi); foizi berilgan, butun so'ralgan "
          + "(bo'linadi); ikki son berilgan, nisbati foizda so'ralgan (bo'lib, 100 ga ko'paytiriladi).",
        "Есть три основных вопроса: дано целое, нужен процент (умножаем); дан процент, нужно целое (делим); "
          + "даны два числа, нужно их отношение в процентах (делим и умножаем на 100)."),
    ],
    formulalar: [
      { n: L("Sonning foizi", "Процент от числа"), f: "a · p / 100" },
      { n: L("Foizi bo'yicha son", "Число по его проценту"), f: "a = b · 100 / p" },
      { n: L("Necha foiz", "Сколько процентов"), f: "a / b · 100 %" },
      { n: L("p % ga oshirish", "Увеличение на p %"), f: "a · (1 + p/100)" },
      { n: L("p % ga kamaytirish", "Уменьшение на p %"), f: "a · (1 − p/100)" },
      { n: L("O'zgarish foizi", "Процент изменения"), f: "(yangi − eski) / eski · 100 %" },
    ],
    misollar: [
      { s: L("Kitob 48 000 so'm. Narxi 25 % ga arzonlashdi. Yangi narxi qancha?",
        "Книга стоит 48 000 сум. Цена снизилась на 25 %. Какова новая цена?"),
        y: [L("Chegirma: 48 000 · 25 / 100 = 12 000", "Скидка: 48 000 · 25 / 100 = 12 000"),
          L("Yangi narx: 48 000 − 12 000 = 36 000", "Новая цена: 48 000 − 12 000 = 36 000"),
          L("Qisqa yo'l: 48 000 · 0,75 = 36 000", "Короткий путь: 48 000 · 0,75 = 36 000")],
        j: "36 000", jt: L("Yechimi", "Решение") },
      { s: L("Sinfdagi 24 o'quvchidan 18 tasi testdan o'tdi. Bu necha foiz?",
        "Из 24 учеников класса 18 сдали тест. Сколько это процентов?"),
        y: ["18 / 24 = 0,75", "0,75 · 100 % = 75 %"], j: "75 %", jt: L("Yechimi", "Решение") },
      { s: L("Sonning 15 % i 45 ga teng. Sonning o'zi qancha?", "15 % числа равны 45. Чему равно само число?"),
        y: [L("a = 45 · 100 / 15", "a = 45 · 100 / 15"), "a = 300"], j: "300", jt: L("Yechimi", "Решение") },
    ],
    jadval: {
      nom: L("Foiz, kasr va o'nli kasr", "Процент, дробь и десятичная дробь"),
      bosh: ["%", L("Oddiy kasr", "Обыкновенная дробь"), L("O'nli kasr", "Десятичная дробь")],
      qatorlar: [["1 %", "1/100", "0,01"], ["5 %", "1/20", "0,05"], ["10 %", "1/10", "0,1"], ["12,5 %", "1/8", "0,125"],
        ["20 %", "1/5", "0,2"], ["25 %", "1/4", "0,25"], ["33⅓ %", "1/3", "0,333…"], ["50 %", "1/2", "0,5"],
        ["75 %", "3/4", "0,75"], ["100 %", "1", "1"], ["150 %", "3/2", "1,5"], ["200 %", "2", "2"]],
    },
    xatolar: [
      L("20 % ga oshirib, keyin 20 % ga kamaytirish dastlabki sonni QAYTARMAYDI: 100 → 120 → 96. "
          + "Ikkinchi foiz boshqa butundan olinadi.",
        "Увеличение на 20 %, а затем уменьшение на 20 % НЕ возвращает исходное число: 100 → 120 → 96. "
          + "Второй процент берётся от другого целого."),
      L("\"20 % ga arzonlashdi\" va \"narxi 20 % bo'ldi\" boshqa narsa: birinchisida 80 % qoladi, ikkinchisida 20 %.",
        "«Подешевело на 20 %» и «цена составила 20 %» — разные вещи: в первом случае остаётся 80 %, во втором — 20 %."),
    ],
    savollar: [
      { s: L("Sonning foizi qanday topiladi?", "Как найти процент от числа?"),
        j: L("Sonni foizga ko'paytirib, 100 ga bo'linadi: 200 ning 15 % i = 200 · 15 / 100 = 30.",
          "Число умножают на процент и делят на 100: 15 % от 200 = 200 · 15 / 100 = 30.") },
      { s: L("Foizi bo'yicha sonni qanday topish kerak?", "Как найти число по его проценту?"),
        j: L("Berilgan qiymatni 100 ga ko'paytirib, foizga bo'linadi: 15 % i 45 bo'lsa, son = 45 · 100 / 15 = 300.",
          "Данное значение умножают на 100 и делят на процент: если 15 % равны 45, то число = 45 · 100 / 15 = 300.") },
      { s: L("25 % qanday kasr?", "Какой дробью является 25 %?"), j: L("1/4 yoki 0,25.", "1/4 или 0,25.") },
    ],
    muhim: 0.85,
  });

  /* --- kasrlar --- */

  malumotnoma("kasrlar", L("Kasrlar", "Дроби"), {
    sarlavha: L(`Kasrlar — qo'shish, ayirish, ko'paytirish, bo'lish va qisqartirish | ${BREND}`,
      `Дроби — сложение, вычитание, умножение, деление и сокращение | ${BREND}`),
    tavsif: L("Kasrlar bilan amallar: qo'shish va ayirish, ko'paytirish va bo'lish, qisqartirish, umumiy maxrajga "
        + "keltirish, o'nli kasrga va foizga o'tkazish. Formulalar va yechilgan misollar.",
      "Действия с дробями: сложение и вычитание, умножение и деление, сокращение, приведение к общему знаменателю, "
        + "перевод в десятичную дробь и проценты. Формулы и разобранные примеры."),
    h1: L("Kasrlar bilan amallar", "Действия с дробями"),
    matn: [
      L("Kasrda ikki son bor: surat (tepada) — nechta bo'lak olingani, maxraj (pastda) — butun nechta teng bo'lakka "
          + "bo'lingani. 3/4 — butun to'rtga bo'lingan va uchta bo'lak olingan.",
        "В дроби два числа: числитель (сверху) — сколько частей взято, знаменатель (снизу) — на сколько равных частей "
          + "разделено целое. 3/4 — целое разделили на четыре части и взяли три."),
      L("Qo'shish va ayirishda maxrajlar TENG bo'lishi shart: teng bo'lsa suratlar qo'shiladi, maxraj o'zgarmaydi. "
          + "Teng bo'lmasa, avval umumiy maxrajga keltiriladi (odatda EKUK ga).",
        "При сложении и вычитании знаменатели должны быть РАВНЫ: если равны, складывают числители, знаменатель не "
          + "меняется. Если не равны — сначала приводят к общему знаменателю (обычно к НОК)."),
      L("Ko'paytirish va bo'lishda umumiy maxraj KERAK EMAS: ko'paytirishda surat suratga, maxraj maxrajga "
          + "ko'paytiriladi; bo'lishda ikkinchi kasr teskari qilib ko'paytiriladi.",
        "Для умножения и деления общий знаменатель НЕ НУЖЕН: при умножении числитель умножают на числитель, "
          + "знаменатель на знаменатель; при делении вторую дробь переворачивают и умножают."),
    ],
    formulalar: [
      { n: L("Qo'shish", "Сложение"), f: "a/b + c/d = (ad + cb) / bd" },
      { n: L("Ayirish", "Вычитание"), f: "a/b − c/d = (ad − cb) / bd" },
      { n: L("Ko'paytirish", "Умножение"), f: "a/b · c/d = ac / bd" },
      { n: L("Bo'lish", "Деление"), f: "a/b : c/d = a/b · d/c = ad / bc" },
      { n: L("Qisqartirish", "Сокращение"), f: "a/b = (a : d) / (b : d),   d = EKUB(a, b)" },
      { n: L("Noto'g'ri kasrdan butun ajratish", "Выделение целой части"), f: "a/b = (a : b) + (a mod b)/b" },
      { n: L("Foizga o'tkazish", "Перевод в проценты"), f: "a/b = a/b · 100 %" },
    ],
    misollar: [
      { s: "3/4 + 5/6 = ?",
        y: [L("Umumiy maxraj: EKUK(4, 6) = 12", "Общий знаменатель: НОК(4, 6) = 12"),
          "3/4 = 9/12,   5/6 = 10/12", "9/12 + 10/12 = 19/12", L("Butun ajratamiz: 19/12 = 1 7/12", "Выделяем целое: 19/12 = 1 7/12")],
        j: "19/12 = 1 7/12", jt: L("Yechimi", "Решение") },
      { s: "2/3 : 4/9 = ?",
        y: [L("Ikkinchi kasrni teskari qilamiz", "Переворачиваем вторую дробь"), "2/3 · 9/4 = 18/12",
          L("Qisqartiramiz: EKUB(18, 12) = 6", "Сокращаем: НОД(18, 12) = 6"), "18/12 = 3/2 = 1 1/2"],
        j: "3/2 = 1,5", jt: L("Yechimi", "Решение") },
      { s: L("24/36 kasrini qisqartiring.", "Сократите дробь 24/36."),
        y: [L("EKUB(24, 36) = 12", "НОД(24, 36) = 12"), "24 : 12 = 2,   36 : 12 = 3"], j: "2/3", jt: L("Yechimi", "Решение") },
    ],
    xatolar: [
      L("Maxrajlarni ham qo'shish: 1/2 + 1/3 ≠ 2/5. Qo'shishda maxraj UMUMIY bo'ladi, qo'shilmaydi.",
        "Складывать и знаменатели: 1/2 + 1/3 ≠ 2/5. При сложении знаменатель становится ОБЩИМ, а не складывается."),
      L("Ko'paytirishda umumiy maxrajga keltirish — ortiqcha ish. U faqat qo'shish va ayirishda kerak.",
        "Приводить к общему знаменателю при умножении — лишняя работа. Это нужно только для сложения и вычитания."),
      L("Qisqartirishni yarim yo'lda to'xtatish: 12/18 → 6/9 hali oxiri emas, 2/3 gacha qisqaradi.",
        "Останавливать сокращение на полпути: 12/18 → 6/9 ещё не конец, сокращается до 2/3."),
    ],
    savollar: [
      { s: L("Maxrajlari xil kasrlar qanday qo'shiladi?", "Как складывать дроби с разными знаменателями?"),
        j: L("Avval umumiy maxrajga (EKUK ga) keltiriladi, keyin suratlar qo'shiladi: 3/4 + 5/6 = 9/12 + 10/12 = 19/12.",
          "Сначала приводят к общему знаменателю (к НОК), затем складывают числители: 3/4 + 5/6 = 9/12 + 10/12 = 19/12.") },
      { s: L("Kasrni kasrga qanday bo'linadi?", "Как разделить дробь на дробь?"),
        j: L("Ikkinchi kasrni teskari qilib ko'paytiriladi: a/b : c/d = a/b · d/c.",
          "Вторую дробь переворачивают и умножают: a/b : c/d = a/b · d/c.") },
      { s: L("Kasrni foizga qanday o'tkaziladi?", "Как перевести дробь в проценты?"),
        j: L("100 ga ko'paytiriladi: 3/4 = 0,75 = 75 %.", "Умножают на 100: 3/4 = 0,75 = 75 %.") },
    ],
    muhim: 0.85,
  });

  /* --- daraja xossalari --- */

  malumotnoma("daraja-xossalari", L("Daraja xossalari", "Свойства степеней"), {
    sarlavha: L(`Daraja xossalari — barcha formulalar va misollar | ${BREND}`,
      `Свойства степеней — все формулы и примеры | ${BREND}`),
    tavsif: L("Daraja xossalari: bir xil asosli darajalarni ko'paytirish va bo'lish, darajani darajaga ko'tarish, "
        + "nol va manfiy ko'rsatkich, kasr ko'rsatkich. Formulalar va misollar.",
      "Свойства степеней: умножение и деление степеней с одинаковым основанием, возведение степени в степень, "
        + "нулевой и отрицательный показатель, дробный показатель. Формулы и примеры."),
    h1: L("Daraja xossalari", "Свойства степеней"),
    matn: [
      L("Daraja — bir xil ko'paytuvchilarning qisqa yozuvi: aⁿ = a · a · … · a (n marta). a — asos, n — ko'rsatkich. "
          + "2⁵ = 2 · 2 · 2 · 2 · 2 = 32.",
        "Степень — краткая запись одинаковых множителей: aⁿ = a · a · … · a (n раз). a — основание, n — показатель. "
          + "2⁵ = 2 · 2 · 2 · 2 · 2 = 32."),
      L("Xossalar faqat ASOSLAR BIR XIL bo'lganda ishlaydi: 2³ · 2⁴ = 2⁷, lekin 2³ · 3⁴ ni soddalashtirib bo'lmaydi. "
          + "Ko'paytuvchilar bir xil bo'lsa, ko'rsatkichlar bo'yicha qoida qo'llanadi.",
        "Свойства работают только при ОДИНАКОВЫХ ОСНОВАНИЯХ: 2³ · 2⁴ = 2⁷, но 2³ · 3⁴ упростить нельзя. "
          + "Если множители одинаковы, применяется правило для показателей."),
    ],
    formulalar: [
      { n: L("Ko'paytirish", "Умножение"), f: "aᵐ · aⁿ = aᵐ⁺ⁿ" },
      { n: L("Bo'lish", "Деление"), f: "aᵐ : aⁿ = aᵐ⁻ⁿ   (a ≠ 0)" },
      { n: L("Darajani darajaga", "Степень степени"), f: "(aᵐ)ⁿ = aᵐⁿ" },
      { n: L("Ko'paytma darajasi", "Степень произведения"), f: "(ab)ⁿ = aⁿ · bⁿ" },
      { n: L("Kasr darajasi", "Степень дроби"), f: "(a/b)ⁿ = aⁿ / bⁿ   (b ≠ 0)" },
      { n: L("Nol ko'rsatkich", "Нулевой показатель"), f: "a⁰ = 1   (a ≠ 0)" },
      { n: L("Manfiy ko'rsatkich", "Отрицательный показатель"), f: "a⁻ⁿ = 1 / aⁿ" },
      { n: L("Kasr ko'rsatkich", "Дробный показатель"), f: "a^(m/n) = ⁿ√(aᵐ)   (a ≥ 0)" },
    ],
    misollar: [
      { s: "2⁵ · 2³ : 2⁶ = ?",
        y: ["2⁵ · 2³ = 2⁸", "2⁸ : 2⁶ = 2²", "2² = 4"], j: "4", jt: L("Yechimi", "Решение") },
      { s: "(3²)³ · 3⁻⁴ = ?",
        y: ["(3²)³ = 3⁶", "3⁶ · 3⁻⁴ = 3²", "3² = 9"], j: "9", jt: L("Yechimi", "Решение") },
      { s: L("(2/5)⁻² ni hisoblang.", "Вычислите (2/5)⁻²."),
        y: [L("Manfiy ko'rsatkich — teskari kasr", "Отрицательный показатель — обратная дробь"), "(5/2)² = 25/4"],
        j: "25/4 = 6,25", jt: L("Yechimi", "Решение") },
    ],
    jadval: {
      nom: L("2, 3, 5 ning darajalari", "Степени 2, 3, 5"),
      bosh: ["n", "2ⁿ", "3ⁿ", "5ⁿ"],
      qatorlar: qator(10).map((n) => [n, 2 ** n, 3 ** n, 5 ** n]),
    },
    xatolar: [
      L("aᵐ · aⁿ ni aᵐⁿ deb yozish. Ko'paytirishda ko'rsatkichlar QO'SHILADI: 2³ · 2⁴ = 2⁷, 2¹² emas.",
        "Записывать aᵐ · aⁿ как aᵐⁿ. При умножении показатели СКЛАДЫВАЮТСЯ: 2³ · 2⁴ = 2⁷, а не 2¹²."),
      L("(a + b)ⁿ ni aⁿ + bⁿ deb ochish. Bu faqat KO'PAYTMA uchun to'g'ri: (a + b)² = a² + 2ab + b².",
        "Раскрывать (a + b)ⁿ как aⁿ + bⁿ. Это верно только для ПРОИЗВЕДЕНИЯ: (a + b)² = a² + 2ab + b²."),
      L("−2⁴ va (−2)⁴ boshqa narsa: birinchisi −16, ikkinchisi +16. Qavs bo'lmasa daraja faqat 2 ga tegishli.",
        "−2⁴ и (−2)⁴ — разные вещи: первое равно −16, второе +16. Без скобок степень относится только к 2."),
    ],
    savollar: [
      { s: L("a⁰ nimaga teng?", "Чему равно a⁰?"),
        j: L("1 ga, agar a ≠ 0 bo'lsa. 5⁰ = 1, 100⁰ = 1.", "1, если a ≠ 0. 5⁰ = 1, 100⁰ = 1.") },
      { s: L("Manfiy ko'rsatkichli daraja nima?", "Что такое степень с отрицательным показателем?"),
        j: L("a⁻ⁿ = 1/aⁿ — ya'ni teskari son. 2⁻³ = 1/8.", "a⁻ⁿ = 1/aⁿ — то есть обратное число. 2⁻³ = 1/8.") },
      { s: L("Bir xil asosli darajalar qanday ko'paytiriladi?", "Как умножать степени с одинаковым основанием?"),
        j: L("Asos qoladi, ko'rsatkichlar qo'shiladi: aᵐ · aⁿ = aᵐ⁺ⁿ.",
          "Основание остаётся, показатели складываются: aᵐ · aⁿ = aᵐ⁺ⁿ.") },
    ],
    muhim: 0.8,
  });

  /* --- trigonometriya jadvali --- */

  malumotnoma("trigonometriya-jadvali", L("Trigonometriya jadvali", "Таблица тригонометрии"), {
    sarlavha: L(`Trigonometriya jadvali — sin, cos, tg, ctg qiymatlari va formulalar | ${BREND}`,
      `Таблица тригонометрии — значения sin, cos, tg, ctg и формулы | ${BREND}`),
    tavsif: L("Trigonometrik funksiyalar jadvali: 0°, 30°, 45°, 60°, 90° va 360° gacha sin, cos, tg, ctg qiymatlari, "
        + "asosiy ayniyatlar va keltirish formulalari.",
      "Таблица тригонометрических функций: значения sin, cos, tg, ctg для 0°, 30°, 45°, 60°, 90° и до 360°, "
        + "основные тождества и формулы приведения."),
    h1: L("Trigonometriya jadvali", "Таблица тригонометрии"),
    matn: [
      L("To'g'ri burchakli uchburchakda sinus — qarshi katetning gipotenuzaga nisbati, kosinus — yondosh katetning "
          + "gipotenuzaga nisbati, tangens — qarshi katetning yondoshga nisbati.",
        "В прямоугольном треугольнике синус — отношение противолежащего катета к гипотенузе, косинус — отношение "
          + "прилежащего катета к гипотенузе, тангенс — отношение противолежащего катета к прилежащему."),
      L("Jadvaldagi 30°, 45°, 60° qiymatlarini yod bilish SHART: DTM va Milliy sertifikat topshiriqlarining "
          + "ko'pchiligi aynan shu burchaklar bilan tuziladi. 30° va 60° teng tomonli uchburchakning yarmidan, "
          + "45° esa kvadrat diagonalidan chiqadi.",
        "Значения для 30°, 45°, 60° нужно знать НАИЗУСТЬ: большинство заданий DTM и Национального сертификата "
          + "составлено именно с этими углами. 30° и 60° получаются из половины равностороннего треугольника, "
          + "а 45° — из диагонали квадрата."),
    ],
    jadvallar: [
      { nom: L("Asosiy burchaklar", "Основные углы"),
        bosh: [L("Burchak", "Угол"), "0°", "30°", "45°", "60°", "90°"],
        qatorlar: [
          ["sin", "0", "1/2", "√2/2", "√3/2", "1"],
          ["cos", "1", "√3/2", "√2/2", "1/2", "0"],
          ["tg", "0", "√3/3", "1", "√3", "—"],
          ["ctg", "—", "√3", "1", "√3/3", "0"],
          [L("radian", "радианы"), "0", "π/6", "π/4", "π/3", "π/2"],
        ] },
      { nom: L("90° dan keyin", "После 90°"),
        bosh: [L("Burchak", "Угол"), "120°", "135°", "150°", "180°", "270°", "360°"],
        qatorlar: [
          ["sin", "√3/2", "√2/2", "1/2", "0", "−1", "0"],
          ["cos", "−1/2", "−√2/2", "−√3/2", "−1", "0", "1"],
          ["tg", "−√3", "−1", "−√3/3", "0", "—", "0"],
          [L("radian", "радианы"), "2π/3", "3π/4", "5π/6", "π", "3π/2", "2π"],
        ] },
    ],
    formulalar: [
      { n: L("Asosiy ayniyat", "Основное тождество"), f: "sin²α + cos²α = 1" },
      { n: L("Tangens va kotangens", "Тангенс и котангенс"), f: "tg α = sin α / cos α,   ctg α = cos α / sin α" },
      { n: L("Tangens–kotangens", "Связь tg и ctg"), f: "tg α · ctg α = 1" },
      { n: L("Qo'sh burchak", "Двойной угол"), f: "sin 2α = 2 sin α cos α,   cos 2α = cos²α − sin²α" },
      { n: L("Yig'indi sinusi", "Синус суммы"), f: "sin(α ± β) = sin α cos β ± cos α sin β" },
      { n: L("Yig'indi kosinusi", "Косинус суммы"), f: "cos(α ± β) = cos α cos β ∓ sin α sin β" },
      { n: L("Keltirish", "Приведение"), f: "sin(90° − α) = cos α,   cos(90° − α) = sin α" },
      { n: L("Darajani pasaytirish", "Понижение степени"), f: "sin²α = (1 − cos 2α)/2,   cos²α = (1 + cos 2α)/2" },
    ],
    savollar: [
      { s: L("sin 30° nechaga teng?", "Чему равен sin 30°?"), j: "1/2 = 0,5" },
      { s: L("cos 60° nechaga teng?", "Чему равен cos 60°?"), j: "1/2 = 0,5" },
      { s: L("tg 45° nechaga teng?", "Чему равен tg 45°?"),
        j: L("1 ga: 45° da ikki katet teng.", "1: при 45° катеты равны.") },
      { s: L("tg 90° nega aniqlanmagan?", "Почему tg 90° не определён?"),
        j: L("tg α = sin α / cos α, cos 90° = 0 — nolga bo'lish mumkin emas.",
          "tg α = sin α / cos α, а cos 90° = 0 — на нуль делить нельзя.") },
    ],
    muhim: 0.8,
  });

  /* --- ko'paytirish jadvali: har son uchun alohida --- */

  for (const n of qator(19, 2)) {
    const yol = `${P}/kopaytirish-jadvali/${n}`;
    sahifalar[yol] = {
      sarlavha: L(`${n} ga ko'paytirish jadvali — to'liq jadval va yodlash usuli | ${BREND}`,
        `Таблица умножения на ${n} — полная таблица и приём запоминания | ${BREND}`),
      tavsif: L(`${n} ga ko'paytirish jadvali: ${n} × 1 dan ${n} × 10 gacha to'liq jadval, bo'lish jadvali va `
          + "shu songa ko'paytirishni yodlash usuli. Onlayn mashq bilan, bepul.",
        `Таблица умножения на ${n}: полная таблица от ${n} × 1 до ${n} × 10, таблица деления и приём запоминания `
          + "умножения на это число. С онлайн-тренажёром, бесплатно."),
      h1: L(`${n} ga ko'paytirish jadvali`, `Таблица умножения на ${n}`),
      matn: [
        L(`${n} ga ko'paytirish — ${n} ni bir necha marta qo'shish. Masalan ${n} × 3 = ${n} + ${n} + ${n} = ${n * 3}.`,
          `Умножить на ${n} — значит сложить ${n} несколько раз. Например, ${n} × 3 = ${n} + ${n} + ${n} = ${n * 3}.`),
        n === 10 ? L("10 ga ko'paytirish eng oson: sonning oxiriga bitta 0 qo'shiladi.",
          "Умножение на 10 — самое простое: к числу дописывается один 0.")
          : n === 9 ? L("9 ga ko'paytmaning raqamlari yig'indisi doim 9 ga teng: 9 × 7 = 63 → 6 + 3 = 9. "
              + "Yana bir usul: 9 × a = 10 × a − a, ya'ni 9 × 7 = 70 − 7 = 63.",
            "Сумма цифр произведения на 9 всегда равна 9: 9 × 7 = 63 → 6 + 3 = 9. "
              + "Другой приём: 9 × a = 10 × a − a, то есть 9 × 7 = 70 − 7 = 63.")
          : n === 5 ? L("5 ga ko'paytma doim 0 yoki 5 bilan tugaydi. Osonroq yo'li: 10 ga ko'paytirib, yarmini olish.",
            "Произведение на 5 всегда оканчивается на 0 или 5. Проще: умножить на 10 и взять половину.")
          : n === 11 ? L("11 ga bir xonali sonni ko'paytirish — raqamni ikki marta yozish: 11 × 4 = 44.",
            "Умножить 11 на однозначное число — записать цифру дважды: 11 × 4 = 44.")
          : n % 2 === 0 ? L(`${n} juft son, shuning uchun hamma ko'paytmasi ham juft bo'ladi va oxirgi raqami `
              + "0, 2, 4, 6, 8 dan biri.",
            `${n} — чётное число, поэтому все произведения тоже чётные и оканчиваются на 0, 2, 4, 6 или 8.`)
          : L(`${n} ga ko'paytirishni yonidagi osonrog'idan chiqarish mumkin: ${n} × a = ${n - 1} × a + a.`,
            `Умножение на ${n} можно получить из более простого соседнего: ${n} × a = ${n - 1} × a + a.`),
        L("Ko'paytuvchilarning o'rni almashsa natija o'zgarmaydi, ya'ni bu jadval bir vaqtda "
            + `"${n} ga ko'paytirish" ham, "${n} ni ko'paytirish" ham bo'ladi. Bo'lish esa teskarisi: `
            + `${n * 6} : ${n} = 6, chunki ${n} × 6 = ${n * 6}.`,
          "От перестановки множителей результат не меняется, поэтому эта таблица одновременно и "
            + `«умножение на ${n}», и «умножение ${n}». Деление — обратное действие: `
            + `${n * 6} : ${n} = 6, так как ${n} × 6 = ${n * 6}.`),
      ],
      jadvallar: [
        { nom: L(`${n} ga ko'paytirish`, `Умножение на ${n}`), bosh: ["×", L("Natija", "Результат")],
          qatorlar: qator(10).map((i) => [`${n} × ${i}`, n * i]) },
        { nom: L(`${n} ga bo'lish`, `Деление на ${n}`), bosh: [":", L("Natija", "Результат")],
          qatorlar: qator(10).map((i) => [`${n * i} : ${n}`, i]) },
      ],
      savollar: qator(3).map((i) => {
        const a = [7, 8, 9][i - 1]!;
        return { s: L(`${n} × ${a} nechaga teng?`, `Чему равно ${n} × ${a}?`), j: `${n * a}` };
      }).concat([
        { s: L(`${n * 8} ni ${n} ga bo'lsak nima chiqadi?`, `Что получится, если ${n * 8} разделить на ${n}?`),
          j: L(`8. Bo'lish ko'paytirishning teskarisi: ${n} × 8 = ${n * 8}.`,
            `8. Деление — обратное умножению: ${n} × 8 = ${n * 8}.`) },
      ]),
      tugma: { yol: `${P}/oyinlar/jadval`, nom: L("Ko'paytirish jadvali o'yinini boshlash", "Начать игру «Таблица умножения»") },
      guruhlar: [{
        nom: L("Boshqa sonlarga ko'paytirish jadvali", "Таблица умножения на другие числа"),
        qatorlar: qator(19, 2).filter((x) => x !== n).map((x) => ({
          yol: `${P}/kopaytirish-jadvali/${x}`, nom: L(`${x} ga ko'paytirish jadvali`, `Таблица умножения на ${x}`),
        })),
      }],
      havolalar: [
        { yol: `${P}/kopaytirish-jadvali`, nom: L("To'liq ko'paytirish jadvali (1–10)", "Полная таблица умножения (1–10)") },
        { yol: `${P}/oyinlar`, nom: L("Matematik o'yinlar", "Математические игры") },
      ],
      statik: true,
      ld: [
        yolak([BOSH, { yol: `${P}/kopaytirish-jadvali`, nom: L("Ko'paytirish jadvali", "Таблица умножения") },
          { yol, nom: L(`${n} ga ko'paytirish`, `Умножение на ${n}`) }]),
        {
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: qator(3).map((i) => {
            const a = [7, 8, 9][i - 1]!;
            return {
              "@type": "Question", name: L(`${n} × ${a} nechaga teng?`, `Чему равно ${n} × ${a}?`),
              acceptedAnswer: { "@type": "Answer", text: `${n * a}` },
            };
          }),
        },
      ],
      muhim: n <= 10 ? 0.7 : 0.5,
    };
  }

  /* --- ma'lumotnoma ro'yxati va o'zaro havolalar --- */

  // Har sahifa qolganlariga havola beradi: ma'lumotnoma sahifalari bir
  // mavzuga tegishli emas, shuning uchun ularni faqat ro'yxat bog'laydi —
  // va faqat ro'yxatdan kelgan sahifa Google uchun "chuqurda" qoladi.
  for (const { yol, nom } of mlm) {
    const s = sahifalar[yol]!;
    s.havolalar = [MLM_H, ...mlm.filter((x) => x.yol !== yol)];
    s.ld = [
      yolak([BOSH, MLM_H, { yol, nom }]),
      ...(s.savollar?.length ? [{
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: s.savollar.map((q) => ({
          "@type": "Question", name: q.s, acceptedAnswer: { "@type": "Answer", text: q.j },
        })),
      }] : []),
    ];
  }

  sahifalar[MLM_H.yol] = {
    sarlavha: L(`Matematika ma'lumotnomasi — jadvallar, formulalar va qoidalar | ${BREND}`,
      `Справочник по математике — таблицы, формулы и правила | ${BREND}`),
    tavsif: L("Matematika ma'lumotnomasi: tub sonlar, bo'linish belgilari, EKUB va EKUK, kvadratlar va kublar "
        + "jadvali, ildizlar, Rim raqamlari, o'lchov birliklari, foizlar, kasrlar, darajalar, trigonometriya.",
      "Справочник по математике: простые числа, признаки делимости, НОД и НОК, таблицы квадратов и кубов, корни, "
        + "римские цифры, единицы измерения, проценты, дроби, степени, тригонометрия."),
    h1: L("Matematika ma'lumotnomasi", "Справочник по математике"),
    matn: [
      L("Masala yechayotganda kerak bo'ladigan tayyor jadvallar va qoidalar: har biri alohida sahifada, "
          + "yechilgan misollari va tipik xatolari bilan.",
        "Готовые таблицы и правила, которые нужны во время решения задачи: каждое на своей странице, "
          + "с разобранными примерами и типичными ошибками."),
      L("Mavzuni to'liq o'rganish kerak bo'lsa — lug'at va darslar bo'limiga o'ting: u yerda tushuntirish va "
          + "mashqlar bor.",
        "Если тему нужно изучить целиком — перейдите в словарь и уроки: там объяснение и упражнения."),
    ],
    guruhlar: [
      { nom: L("Jadvallar va qoidalar", "Таблицы и правила"), qatorlar: mlm.map((x) => ({ yol: x.yol, nom: x.nom })) },
      { nom: L("Ko'paytirish jadvali — son bo'yicha", "Таблица умножения — по числам"),
        qatorlar: qator(19, 2).map((x) => ({
          yol: `${P}/kopaytirish-jadvali/${x}`, nom: L(`${x} ga ko'paytirish jadvali`, `Таблица умножения на ${x}`),
        })) },
    ],
    havolalar: [
      LUGAT_H,
      { yol: `${P}/formulalar`, nom: L("Matematika formulalari", "Формулы по математике") },
      DARSLAR,
    ],
    statik: true,
    ld: [yolak([BOSH, MLM_H])],
    muhim: 0.9,
  };

  /* ------------------------------------------------- qabul imtihoni (4-sinf) */

  /*
   * Prezident va ixtisoslashtirilgan maktablarga qabul.
   *
   * Yilda bir marta o'n minglab ota-ona aynan shu so'rovlarni yozadi
   * ("prezident maktabi test namunalari", "ixtisoslashtirilgan maktab
   * qabul matematika"). Ilovada bo'lim bor edi, lekin qidiruv uchun
   * sahifasi yo'q — ya'ni o'sha odamlar bizni topmaydi.
   */
  const QABUL_H: Havola = { yol: `${P}/qabul`, nom: L("Qabul imtihoni", "Приёмный экзамен") };
  const qTur = (x: (typeof QABUL_TURLAR)[number]) => t(`qabulTur_${x}` as Parameters<typeof t>[0]);
  sahifalar[QABUL_H.yol] = {
    sarlavha: L(`Prezident va ixtisoslashtirilgan maktab qabul testlari — matematika, ${QABUL_VARIANT} variant | ${BREND}`,
      `Приёмные тесты в президентские и специализированные школы — математика, ${QABUL_VARIANT} вариантов | ${BREND}`),
    tavsif: qisqa(L(
      `4-sinfdan keyin qabul imtihoniga tayyorlov: Prezident maktablari 1- va 2-bosqich, ixtisoslashtirilgan `
        + `maktablar. Har turda ${QABUL_VARIANT} ta variant, rasmiy tuzilish bo'yicha. Natija darhol, bepul.`,
      `Подготовка к приёмному экзамену после 4 класса: президентские школы 1 и 2 этап, специализированные школы. `
        + `В каждом типе ${QABUL_VARIANT} вариантов по официальной структуре. Результат сразу, бесплатно.`)),
    h1: L("Qabul imtihoni: Prezident va ixtisoslashtirilgan maktablar",
      "Приёмный экзамен: президентские и специализированные школы"),
    matn: [
      L("Qabul imtihonining matematika qismi 4-sinf dasturiga tayanadi, lekin savollari darslikdagiga o'xshamaydi: "
          + "u yerda hisoblash emas, usulni topish so'raladi. Shuning uchun faqat darslarni o'qish yetmaydi — "
          + "imtihon formatida mashq qilish kerak.",
        "Математическая часть приёмного экзамена опирается на программу 4 класса, но задания не похожи на учебник: "
          + "там требуется не вычислить, а найти способ. Поэтому одного чтения уроков недостаточно — нужно "
          + "тренироваться в формате экзамена."),
      L("Uch tur bo'yicha variantlar bor, har biri rasmiy tuzilishga mos.",
        "Доступны варианты по трём типам, каждый соответствует официальной структуре."),
      L("Har variantda javob darhol tekshiriladi, oxirida to'g'ri javoblar soni, foizi va qaysi mavzuda xato "
          + "qilinganini ko'rsatadigan tahlil chiqadi.",
        "В каждом варианте ответ проверяется сразу, в конце выводится число правильных ответов, процент и разбор "
          + "с указанием тем, в которых были ошибки."),
    ],
    jadval: {
      nom: L("Imtihon tuzilishi", "Структура экзамена"),
      bosh: [L("Tur", "Тип"), L("Savol", "Вопросов"), L("Vaqt", "Время"), L("Ball", "Балл")],
      qatorlar: QABUL_TURLAR.map((x) => [qTur(x), QABUL[x].savol, L(`${QABUL[x].daqiqa} daqiqa`, `${QABUL[x].daqiqa} минут`),
        QABUL[x].ball ?? L("reyting bo'yicha", "по рейтингу")]),
    },
    savollar: [
      { s: L("Prezident maktabiga qabulda matematikadan nechta savol bo'ladi?",
        "Сколько вопросов по математике на приёме в президентскую школу?"),
        j: L(`1-bosqichda ${QABUL.prezident.savol} ta test, ${QABUL.prezident.daqiqa} daqiqa. 2-bosqich — tanqidiy `
            + `fikrlash: ${QABUL.prezident2.savol} ta topshiriq.`,
          `На 1 этапе ${QABUL.prezident.savol} тестов, ${QABUL.prezident.daqiqa} минут. 2 этап — критическое `
            + `мышление: ${QABUL.prezident2.savol} заданий.`) },
      { s: L("Ixtisoslashtirilgan maktab qabul imtihoni qanday tuzilgan?",
        "Как устроен приёмный экзамен в специализированную школу?"),
        j: L(`${QABUL.ixtisos.savol} ta test, ${QABUL.ixtisos.daqiqa} daqiqa, ${QABUL.ixtisos.ball} ball — `
            + "rasmiy spetsifikatsiya bo'yicha, har topshiriq o'z mavzusi va bali bilan.",
          `${QABUL.ixtisos.savol} тестов, ${QABUL.ixtisos.daqiqa} минут, ${QABUL.ixtisos.ball} баллов — по официальной `
            + "спецификации, каждое задание со своей темой и баллом.") },
      { s: L("Qabul imtihoniga qanday tayyorlanish kerak?", "Как подготовиться к приёмному экзамену?"),
        j: L("Avval 4-sinf dasturini mustahkamlab, keyin mantiqiy masalalar bo'limini ishlash va imtihon "
            + "formatidagi variantlarni vaqt bilan yechish.",
          "Сначала закрепить программу 4 класса, затем пройти раздел логических задач и решать варианты в формате "
            + "экзамена на время.") },
    ],
    tugma: { yol: QABUL_H.yol, nom: L("Variantni boshlash", "Начать вариант") },
    guruhlar: [{
      nom: L("Turlar", "Типы"),
      qatorlar: QABUL_TURLAR.map((x) => L(
        `${qTur(x)} — ${QABUL[x].savol} savol, ${QABUL[x].daqiqa} daqiqa, ${QABUL_VARIANT} variant`,
        `${qTur(x)} — ${QABUL[x].savol} вопросов, ${QABUL[x].daqiqa} минут, ${QABUL_VARIANT} вариантов`)),
    }],
    havolalar: [
      { yol: `${P}/mantiq`, nom: L("Mantiqiy masalalar", "Логические задачи") },
      ...COURSES.filter((c) => c.grade >= 3 && c.grade <= 5).map((c) => ({ yol: `${P}/kurs/${c.slug}`, nom: kursNomi(c) })),
    ],
    ld: [
      yolak([BOSH, QABUL_H]),
      {
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: [] as unknown[],
      },
    ],
    muhim: 0.9,
  };
  // FAQ savollari sahifaning o'zidan olinadi — ikki joyda yozilsa, biri
  // o'zgarib, ikkinchisi eskisi bilan qolardi.
  (sahifalar[QABUL_H.yol]!.ld[1] as { mainEntity: unknown[] }).mainEntity =
    sahifalar[QABUL_H.yol]!.savollar!.map((q) => ({
      "@type": "Question", name: q.s, acceptedAnswer: { "@type": "Answer", text: q.j },
    }));

  /* ---------------------------------------------------------------- mantiq */

  const MANTIQ_H: Havola = { yol: `${P}/mantiq`, nom: L("Mantiqiy masalalar", "Логические задачи") };
  const mantiqlar = mantiqMavzular();
  for (const m of mantiqlar) {
    const yol = `${P}/mantiq/${m.id}`;
    sahifalar[yol] = {
      sarlavha: L(`${m.nom} — mantiqiy masalalar, usuli va misollari | ${BREND}`,
        `${m.nom} — логические задачи, метод и примеры | ${BREND}`),
      tavsif: qisqa(L(`${m.nom}: ${m.izoh}. ${m.usul.d} Usul tushuntiriladi, keyin mashq savollari beriladi. Bepul.`,
        `${m.nom}: ${m.izoh}. ${m.usul.d} Сначала объясняется метод, затем даются задачи. Бесплатно.`)),
      h1: m.nom,
      matn: [`${m.usul.t}. ${m.usul.d}`, ...(m.usul.v.length ? [m.usul.v.join("   ")] : [])],
      tugma: { yol, nom: L("Mashqni boshlash", "Начать тренировку") },
      havolalar: [MANTIQ_H, ...mantiqlar.filter((x) => x !== m).map((x) => ({ yol: `${P}/mantiq/${x.id}`, nom: x.nom }))],
      ld: [yolak([BOSH, MANTIQ_H, { yol, nom: m.nom }])],
      muhim: 0.6,
    };
  }
  sahifalar[MANTIQ_H.yol] = {
    sarlavha: L(`Mantiqiy masalalar — 2–4-sinf, prezident maktabi va olimpiadaga | ${BREND}`,
      `Логические задачи — 2–4 класс, к президентской школе и олимпиаде | ${BREND}`),
    tavsif: qisqa(L(`${mantiqlar.length} ta mavzu bo'yicha mantiqiy masalalar: har mavzuda avval usul `
        + "tushuntiriladi, keyin mashq. Prezident maktabi va olimpiada savollari uslubida. Bepul.",
      `Логические задачи по ${mantiqlar.length} темам: в каждой сначала объясняется метод, затем тренировка. `
        + "В стиле задач президентской школы и олимпиад. Бесплатно.")),
    h1: L("Mantiqiy masalalar", "Логические задачи"),
    matn: [
      L("Oddiy masala hisoblashni so'raydi, mantiqiy masala esa USULNI topishni: hisob bir amal bo'lishi mumkin, "
          + "qiyini — nimani hisoblash kerakligini tushunish.",
        "Обычная задача требует вычислить, логическая — найти СПОСОБ: само вычисление может быть в одно действие, "
          + "сложность в том, чтобы понять, что именно считать."),
      L(`${mantiqlar.length} ta mavzu, har birida bitta usul: avval usul ko'rsatiladi va yechilgan namuna beriladi, `
          + "keyin mashq savollari. Prezident maktabi va olimpiada savollari shu uslubda tuziladi.",
        `${mantiqlar.length} тем, в каждой один метод: сначала показывается метод и разобранный образец, затем `
          + "задачи для тренировки. Задания президентской школы и олимпиад составлены в этом же стиле."),
    ],
    guruhlar: [{ nom: L("Mavzular", "Темы"), qatorlar: mantiqlar.map((m) => ({ yol: `${P}/mantiq/${m.id}`, nom: `${m.nom} — ${m.izoh}` })) }],
    havolalar: [DARSLAR, { yol: `${P}/qabul`, nom: L("Qabul imtihoni", "Приёмный экзамен") }],
    ld: [yolak([BOSH, MANTIQ_H])],
    muhim: 0.8,
  };

  /* -------------------------------------------------------------- bo'limlar */

  sahifalar[P || "/"] = {
    sarlavha: L(`${BREND} — matematika: 1–11-sinf darslari, DTM va Milliy sertifikat testlari`,
      `${BREND} — математика: уроки 1–11 класс, тесты DTM и Национального сертификата`),
    tavsif: L("Bepul onlayn matematika: maktabgacha yoshdan 11-sinfgacha darslar, algebra va geometriya, "
        + "DTM va Milliy sertifikat test variantlari, masalalar, formulalar va matematik o'yinlar.",
      "Бесплатная математика онлайн: уроки от дошкольного возраста до 11 класса, алгебра и геометрия, "
        + "варианты тестов DTM и Национального сертификата, задачи, формулы и математические игры."),
    h1: L(`${BREND} — matematikani o'rganish uchun bepul ilova`, `${BREND} — бесплатное приложение для изучения математики`),
    matn: [
      L(`Maktabgacha yoshdan 11-sinfgacha ${COURSES.length} ta kurs va ${jamiDars} ta dars: darslik boblari bo'yicha, `
          + "har darsda qisqa tushuntirish va mashqlar.",
        `${COURSES.length} курсов и ${jamiDars} уроков от дошкольного возраста до 11 класса: по главам учебника, `
          + "в каждом уроке короткое объяснение и упражнения."),
      L(`Abituriyentlar uchun ${DTM_VARIANT} ta DTM varianti (${OLCHAM.savol} savol, ${OLCHAM.daqiqa} daqiqa) va `
          + `${SERT_VARIANT} ta Milliy sertifikat varianti (${TUZILISH.y1 + TUZILISH.y2 + TUZILISH.o} topshiriq, ${SERT_DAQIQA / 60} soat).`,
        `Для абитуриентов: ${DTM_VARIANT} вариантов DTM (${OLCHAM.savol} вопросов, ${OLCHAM.daqiqa} минут) и `
          + `${SERT_VARIANT} вариантов Национального сертификата (${TUZILISH.y1 + TUZILISH.y2 + TUZILISH.o} заданий, ${SERT_DAQIQA / 60} ч).`),
      L(`${OYINLAR.length} ta yakka matematik o'yin, do'st bilan duel va jamoaviy o'yinlar. Telegramda ham ishlaydi: @Aqlzone_bot.`,
        `${OYINLAR.length} математических игр, дуэль с другом и командные игры. Работает и в Telegram: @Aqlzone_bot.`),
    ],
    havolalar: [
      { yol: `${P}/darslar`, nom: L("Barcha darslar", "Все уроки") },
      { yol: `${P}/imtihon`, nom: L("DTM test variantlari", "Варианты тестов DTM") },
      { yol: `${P}/sertifikat`, nom: L("Milliy sertifikat", "Национальный сертификат") },
      { yol: `${P}/formulalar`, nom: L("Matematika formulalari", "Формулы по математике") },
      LUGAT_H,
      MLM_H,
      { yol: `${P}/kopaytirish-jadvali`, nom: L("Ko'paytirish jadvali", "Таблица умножения") },
      { yol: `${P}/masalalar`, nom: L("Masalalar", "Задачи") },
      QABUL_H,
      MANTIQ_H,
      { yol: `${P}/oyinlar`, nom: L("Matematik o'yinlar", "Математические игры") },
      ...kursHavolalari,
    ],
    ld: [
      // `SearchAction` (sayt ichidagi qidiruv maydoni) ATAYLAB yo'q:
      // Google uni 2024-yil oxirida natijalardan olib tashladi, ya'ni
      // teg hech narsa bermaydi. Ustiga `/qidiruv` robots'da yopiq
      // (`seo.py`) — e'lon qilingan manzilni robot o'qiy olmasligi
      // qarama-qarshilik bo'lardi.
      { "@context": "https://schema.org", "@type": "WebSite", "@id": `${ASOS}/#sayt`, name: BREND, url: `${ASOS}/`, inLanguage: ["uz", "ru"], publisher: TASHKILOT },
      { "@context": "https://schema.org", ...TASHKILOT },
      {
        "@context": "https://schema.org", "@type": "WebApplication", name: BREND, url: `${ASOS}${P}/`,
        applicationCategory: "EducationalApplication", operatingSystem: "Web, Android, iOS (Telegram)",
        inLanguage: ["uz", "ru"], isAccessibleForFree: true,
        offers: { "@type": "Offer", price: 0, priceCurrency: "UZS" },
        description: L("Maktabgacha yoshdan 11-sinfgacha matematika, DTM va Milliy sertifikat testlari, matematik o'yinlar.",
          "Математика от дошкольного возраста до 11 класса, тесты DTM и Национального сертификата, математические игры."),
      },
    ],
    muhim: 1.0,
  };

  sahifalar[`${P}/darslar`] = {
    sarlavha: L(`Matematika darslari: 1–11-sinf, algebra va geometriya | ${BREND}`,
      `Уроки математики: 1–11 класс, алгебра и геометрия | ${BREND}`),
    tavsif: qisqa(L(`Maktabgacha yoshdan 11-sinfgacha ${COURSES.length} ta kurs, ${jamiDars} ta dars: matematika, algebra, `
        + "geometriya, oliy matematika. Darslik boblari bo'yicha, bepul.",
      `${COURSES.length} курсов и ${jamiDars} уроков от дошкольного возраста до 11 класса: математика, алгебра, `
        + "геометрия, высшая математика. По главам учебника, бесплатно.")),
    h1: L("Matematika darslari", "Уроки математики"),
    matn: [L(`${COURSES.length} ta kurs va ${jamiDars} ta dars — darslik boblari tartibida.`,
      `${COURSES.length} курсов и ${jamiDars} уроков — в порядке глав учебника.`)],
    havolalar: kursHavolalari,
    ld: [yolak([BOSH, DARSLAR])],
    muhim: 0.9,
  };

  const yuqoriKurslar = COURSES.filter((c) => c.grade >= 7 && c.grade < 300).map((c) => ({ yol: `${P}/kurs/${c.slug}`, nom: kursNomi(c) }));
  sahifalar[`${P}/imtihon`] = {
    sarlavha: L(`DTM matematika test variantlari onlayn — ${DTM_VARIANT} variant | ${BREND}`,
      `Тесты DTM по математике онлайн — ${DTM_VARIANT} вариантов | ${BREND}`),
    tavsif: qisqa(L(`DTM matematika bo'yicha ${DTM_VARIANT} ta variant: ${OLCHAM.savol} savol, ${OLCHAM.daqiqa} daqiqa, `
        + "haqiqiy format. Javob darhol ko'rinadi, o'rtacha ballingiz va zaif mavzularingiz ko'rsatiladi. Bepul.",
      `${DTM_VARIANT} вариантов DTM по математике: ${OLCHAM.savol} вопросов, ${OLCHAM.daqiqa} минут, `
        + "реальный формат. Ответ виден сразу, показываются средний балл и слабые темы. Бесплатно.")),
    h1: L("DTM matematika test variantlari", "Варианты тестов DTM по математике"),
    matn: [
      L(`${DTM_VARIANT} ta variant, har birida ${OLCHAM.savol} ta savol va ${OLCHAM.daqiqa} daqiqa — DTM bilan bir xil. `
          + "Savollar 7–11-sinf dasturidan aralash.",
        `${DTM_VARIANT} вариантов, в каждом ${OLCHAM.savol} вопросов и ${OLCHAM.daqiqa} минут — как на DTM. `
          + "Вопросы из программы 7–11 классов."),
      L("Har savoldan keyin to'g'ri yoki xato darhol ko'rsatiladi. Oxirgi beshta urinishning o'rtacha bali va "
          + "ko'p xato qilinayotgan mavzular alohida ko'rinadi — shu mavzularni takrorlash mumkin.",
        "После каждого вопроса сразу видно, верно или нет. Средний балл за последние пять попыток и "
          + "темы с частыми ошибками показаны отдельно — их можно повторить."),
    ],
    havolalar: [
      { yol: `${P}/sertifikat`, nom: L("Milliy sertifikat variantlari", "Варианты Национального сертификата") },
      { yol: `${P}/formulalar`, nom: L("Matematika formulalari", "Формулы по математике") },
      ...yuqoriKurslar,
    ],
    ld: [yolak([BOSH, { yol: `${P}/imtihon`, nom: L("DTM testlari", "Тесты DTM") }])],
    muhim: 0.95,
  };

  sahifalar[`${P}/sertifikat`] = {
    sarlavha: L(`Milliy sertifikat matematika — ${SERT_VARIANT} variant, onlayn test | ${BREND}`,
      `Национальный сертификат по математике — ${SERT_VARIANT} вариантов, онлайн-тест | ${BREND}`),
    tavsif: qisqa(L(`Milliy sertifikat matematika imtihoniga tayyorgarlik: ${SERT_VARIANT} ta variant, `
        + `${TUZILISH.y1 + TUZILISH.y2 + TUZILISH.o} topshiriq, ${SERT_DAQIQA / 60} soat. Taxminiy daraja (C … A+) va ball. Bepul.`,
      `Подготовка к Национальному сертификату по математике: ${SERT_VARIANT} вариантов, `
        + `${TUZILISH.y1 + TUZILISH.y2 + TUZILISH.o} заданий, ${SERT_DAQIQA / 60} ч. Примерный уровень (C … A+) и балл. Бесплатно.`)),
    h1: L("Milliy sertifikat: matematika test variantlari", "Национальный сертификат: варианты тестов по математике"),
    matn: [
      L(`${SERT_VARIANT} ta variant, rasmiy namunadagi tuzilish: ${TUZILISH.y1} ta test, ${TUZILISH.y2} ta moslashtirish `
          + `va ${TUZILISH.o} ta ochiq javobli topshiriq, ${SERT_DAQIQA / 60} soat.`,
        `${SERT_VARIANT} вариантов по официальному образцу: ${TUZILISH.y1} тестовых, ${TUZILISH.y2} на соответствие `
          + `и ${TUZILISH.o} с открытым ответом, ${SERT_DAQIQA / 60} ч.`),
      L("Natija 100 ballik shkalada va taxminiy daraja bilan (C, C+, B, B+, A, A+). Javoblar saqlanadi — "
          + "to'xtagan joydan davom etish mumkin.",
        "Результат по 100-балльной шкале с примерным уровнем (C, C+, B, B+, A, A+). Ответы сохраняются — "
          + "можно продолжить с того же места."),
    ],
    havolalar: [
      { yol: `${P}/imtihon`, nom: L("DTM test variantlari", "Варианты тестов DTM") },
      { yol: `${P}/formulalar`, nom: L("Matematika formulalari", "Формулы по математике") },
    ],
    ld: [yolak([BOSH, { yol: `${P}/sertifikat`, nom: L("Milliy sertifikat", "Национальный сертификат") }])],
    muhim: 0.95,
  };

  sahifalar[`${P}/testlar`] = {
    sarlavha: L(`Matematika testlari — sinflar bo'yicha, onlayn | ${BREND}`, `Тесты по математике — по классам, онлайн | ${BREND}`),
    tavsif: L("Matematika testlari: har bob uchun blok testlar va hamma uchun bir xil test to'plamlari. Natija darhol, bepul.",
      "Тесты по математике: блок-тесты по каждой главе и общие сборники тестов. Результат сразу, бесплатно."),
    h1: L("Matematika testlari", "Тесты по математике"),
    matn: [L("Har bobning testi va tayyor test to'plamlari: javob darhol tekshiriladi, xatolar tahlil qilinadi.",
      "Тест по каждой главе и готовые сборники: ответ проверяется сразу, ошибки разбираются.")],
    havolalar: [
      { yol: `${P}/imtihon`, nom: L("DTM test variantlari", "Варианты тестов DTM") },
      { yol: `${P}/sertifikat`, nom: L("Milliy sertifikat", "Национальный сертификат") },
      ...kursHavolalari,
    ],
    ld: [yolak([BOSH, { yol: `${P}/testlar`, nom: L("Testlar", "Тесты") }])],
    muhim: 0.8,
  };

  // Ruscha masalalar ro'yxati yo'q: masalalar o'zbekcha yozilgan, ro'yxat
  // bazadan serverda qo'shiladi (`seo.py`, faqat `/masalalar`).
  if (!ru) {
    sahifalar["/masalalar"] = {
      sarlavha: `Matematik masalalar — sinflar bo'yicha, javob va yechimlari bilan | ${BREND}`,
      tavsif: "O'quvchi va ustozlar yozgan matematik masalalar: sinflar bo'yicha, qiyinligi bilan. Yeching, "
        + "javobingizni tekshiring va yechimini ko'ring. Bepul.",
      h1: "Matematik masalalar",
      matn: ["O'quvchi va ustozlar yozgan, tekshiruvdan o'tgan masalalar. Javob berilgach yechim ochiladi."],
      havolalar: [{ yol: "/oyinlar", nom: "Matematik o'yinlar" }, { yol: "/darslar", nom: "Darslar" }],
      ld: [yolak([BOSH, { yol: "/masalalar", nom: "Masalalar" }])],
      muhim: 0.85,
    };
  }

  sahifalar[`${P}/oyinlar`] = {
    sarlavha: L(`Matematik o'yinlar onlayn — ko'paytirish jadvali, tezkor hisob | ${BREND}`,
      `Математические игры онлайн — таблица умножения, быстрый счёт | ${BREND}`),
    tavsif: qisqa(L(`${OYINLAR.length} ta matematik o'yin: ${oyinHavolalari.map((h) => h.nom.toLowerCase()).join(", ")}. `
        + "Do'st bilan duel va jamoaviy o'yinlar. Bepul.",
      `${OYINLAR.length} математических игр: ${oyinHavolalari.map((h) => h.nom.toLowerCase()).join(", ")}. `
        + "Дуэль с другом и командные игры. Бесплатно.")),
    h1: L("Matematik o'yinlar", "Математические игры"),
    matn: [
      L("Og'zaki hisob, ko'paytirish jadvali va mantiqni o'yin orqali mashq qilish: har o'yinda uch daraja, "
          + "rekord va haftalik o'sish grafigi.",
        "Устный счёт, таблица умножения и логика в игровой форме: три уровня, рекорды и график недельного прогресса."),
      L("Kunlik son, do'st bilan duel va 30 kishigacha jamoaviy o'yinlar ham bor.",
        "Есть ежедневная головоломка, дуэль с другом и командные игры до 30 человек."),
    ],
    havolalar: [
      ...oyinHavolalari, { yol: `${P}/oyinlar/kunlik-son`, nom: L("Kunlik son", "Число дня") },
      { yol: `${P}/kopaytirish-jadvali`, nom: L("Ko'paytirish jadvali", "Таблица умножения") },
    ],
    ld: [yolak([BOSH, OYINLAR_H])],
    muhim: 0.85,
  };

  sahifalar[`${P}/oyinlar/kunlik-son`] = {
    sarlavha: L(`Kunlik son — har kuni yangi matematik jumboq | ${BREND}`, `Число дня — новая математическая головоломка каждый день | ${BREND}`),
    tavsif: L("Kunlik son: yashirin to'g'ri tenglikni oltita urinishda toping. Har kuni yangi jumboq, hamma uchun bir xil.",
      "Число дня: угадайте скрытое верное равенство за шесть попыток. Каждый день новая головоломка, одна для всех."),
    h1: L("Kunlik son", "Число дня"),
    matn: [L("Har kuni yangi jumboq: yashirin to'g'ri tenglikni oltita urinishda topish kerak. Har urinishdan keyin qaysi belgi to'g'ri joyda ekani ko'rsatiladi.",
      "Каждый день новая головоломка: нужно угадать скрытое верное равенство за шесть попыток. После каждой попытки видно, какие символы на своём месте.")],
    havolalar: oyinHavolalari,
    ld: [yolak([BOSH, OYINLAR_H, { yol: `${P}/oyinlar/kunlik-son`, nom: L("Kunlik son", "Число дня") }])],
    muhim: 0.6,
  };

  sahifalar[`${P}/kichkintoy`] = {
    sarlavha: L(`Maktabgacha yoshdagi bolalar uchun matematika — 2–5 yosh | ${BREND}`,
      `Математика для дошкольников — 2–5 лет | ${BREND}`),
    tavsif: L("Kichkintoylar uchun: ranglar, hayvonlar, mashinalar va sonlar. O'qish shart emas — rasmlar va ovoz bilan. Bepul.",
      "Для малышей: цвета, животные, машинки и числа. Уметь читать не нужно — картинки и озвучка. Бесплатно."),
    h1: L("Kichkintoylar uchun", "Для малышей"),
    matn: [L("2–5 yoshli bolalar uchun katta rasmlar va ovoz: ranglar, hayvonlar, mashinalar va raqamlar. O'qishni bilish shart emas.",
      "Крупные картинки и озвучка для детей 2–5 лет: цвета, животные, машинки и цифры. Уметь читать не нужно.")],
    havolalar: kursHavolalari.slice(0, 3),
    ld: [yolak([BOSH, { yol: `${P}/kichkintoy`, nom: L("Kichkintoylar", "Малыши") }])],
    muhim: 0.6,
  };

  for (const s of Object.values(sahifalar)) s.til = ru ? "ru" : "uz";
  return sahifalar;
}

/* --------------------------------------------------------------- yig'ish */

const uz = yasa(false);
const rus = yasa(true);
tilniQoy("uz", false);

const ruga = (yol: string) => (yol === "/" ? "/ru" : `/ru${yol}`);
for (const [yol, s] of Object.entries(uz)) {
  if (rus[ruga(yol)]) {
    const m = { uz: yol, ru: ruga(yol) };
    s.muqobil = m;
    rus[ruga(yol)]!.muqobil = m;
  }
}
const sahifalar: Record<string, Sahifa> = { ...uz, ...rus };

// Ilova marshrutlari — server bularga mos kelmagan manzilga 404 beradi
// (`seo.py: mavjud`). `App.tsx` dan olinadi: yangi sahifa qo'shilsa,
// ro'yxatni qo'lda yangilash esdan chiqib, u 404 bo'lib qolmasin.
const bu = dirname(fileURLToPath(import.meta.url));
const app = readFileSync(join(bu, "..", "src", "App.tsx"), "utf-8");
const yollar = [...new Set([...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]!))];
if (yollar.length < 20) {
  console.error(`App.tsx dan marshrutlar o'qilmadi (${yollar.length} ta) — 404 tekshiruvi buziladi`);
  process.exit(1);
}

const dist = join(bu, "..", "dist");
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "seo.json"), JSON.stringify({
  asos: ASOS, sahifalar, yollar, kurslar: COURSES.map((c) => c.slug),
}));

// Qisqa tekshiruv: sarlavhalar TAKRORLANMASIN (kanonik nusxalardan tashqari) —
// Google bir xil sarlavhali sahifalarni bitta deb hisoblaydi.
const sarlavhalar = new Map<string, string>();
let takror = 0;
for (const [yol, s] of Object.entries(sahifalar)) {
  if (s.kanonik) continue;
  const oldin = sarlavhalar.get(s.sarlavha);
  if (oldin) { takror++; console.warn(`takroriy sarlavha: ${yol} = ${oldin}`); }
  sarlavhalar.set(s.sarlavha, yol);
}
const misolli = Object.values(sahifalar).filter((s) => s.misollar?.length).length;
console.log(`seo.json: ${Object.keys(sahifalar).length} sahifa, sitemap: `
  + `${Object.values(sahifalar).filter((s) => s.muhim).length}, savolli dars: ${misolli}, `
  + `marshrut: ${yollar.length}, takroriy sarlavha: ${takror}`);
if (takror) process.exit(1);
