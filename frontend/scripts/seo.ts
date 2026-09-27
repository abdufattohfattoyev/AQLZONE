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
type Activity = import("../src/lib/activity.ts").Activity;
type Course = (typeof COURSES)[number];

export const ASOS = "https://aql-zone.uz";
const BREND = "Aql Zone";

interface Havola { yol: string; nom: string }
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
  jadval?: { nom: string; bosh: (string | number)[]; qatorlar: (string | number)[][] };
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
      { yol: `${P}/kopaytirish-jadvali`, nom: L("Ko'paytirish jadvali", "Таблица умножения") },
      { yol: `${P}/masalalar`, nom: L("Masalalar", "Задачи") },
      { yol: `${P}/oyinlar`, nom: L("Matematik o'yinlar", "Математические игры") },
      ...kursHavolalari,
    ],
    ld: [
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
