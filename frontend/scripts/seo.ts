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
 */
import { mkdirSync, writeFileSync } from "node:fs";
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
const { OLCHAM, VARIANTLAR: DTM_VARIANT } = await import("../src/lib/imtihon.ts");
const { VARIANTLAR: SERT_VARIANT, DAQIQA: SERT_DAQIQA, TUZILISH } = await import("../src/lib/sertifikat.ts");

export const ASOS = "https://aql-zone.uz";
const BREND = "Aql Zone";

interface Havola { yol: string; nom: string }
interface Sahifa {
  sarlavha: string;
  tavsif: string;
  h1: string;
  matn: string[];
  havolalar: Havola[];
  /** Ichma-ich ro'yxat (kurs boblari, formulalar bo'limlari). */
  guruhlar?: { nom: string; qatorlar: Havola[] | string[] }[];
  /** Non-kanonik nusxa (bir xil mazmun) — Google shu manzilni asosiy deb bilsin. */
  kanonik?: string;
  ld: Record<string, unknown>[];
  /** sitemap.xml: 0.1–1.0. Yo'q bo'lsa — sitemapga kirmaydi. */
  muhim?: number;
}

const sahifalar: Record<string, Sahifa> = {};
const qisqa = (s: string, n = 158) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…");
const darsNomi = (n: string) => n.split(" · ")[0]!.trim();
/** "2-bob. Natural sonlar" → "Natural sonlar" (raqam alohida qo'yiladi). */
const bobNomi = (u: string) => u.replace(/^\d+-bob\.\s*/, "");

const TASHKILOT = {
  "@type": "Organization", "@id": `${ASOS}/#tashkilot`, name: BREND, url: `${ASOS}/`,
  logo: `${ASOS}/og.png`, sameAs: ["https://t.me/Aqlzone_bot"],
};
const yolak = (qadamlar: Havola[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: qadamlar.map((q, i) => ({ "@type": "ListItem", position: i + 1, name: q.nom, item: ASOS + q.yol })),
});
const BOSH: Havola = { yol: "/", nom: BREND };

/* ------------------------------------------------------------------ kurslar */

const kursHavolalari: Havola[] = COURSES.map((c) => ({ yol: `/kurs/${c.slug}`, nom: c.title }));
const jamiDars = COURSES.reduce((a, c) => a + c.units.reduce((b, u) => b + u.lessons.length, 0), 0);

for (const c of COURSES) {
  const yol = `/kurs/${c.slug}`;
  const darsSoni = c.units.reduce((a, u) => a + u.lessons.length, 0);
  const kursYolak = [BOSH, { yol: "/darslar", nom: "Darslar" }, { yol, nom: c.title }];
  sahifalar[yol] = {
    sarlavha: `${c.title} — onlayn darslar va mashqlar | ${BREND}`,
    tavsif: qisqa(`${c.title}: ${c.units.length} bob, ${darsSoni} ta dars. ${c.desc}. Har darsda mashqlar, `
      + "xatolar ustida ishlash va bob testlari. Bepul."),
    h1: c.title,
    matn: [
      `${c.desc}.`,
      `Kurs ${c.units.length} ta bob va ${darsSoni} ta darsdan iborat. Har dars qisqa tushuntirish va `
        + "savollardan tuzilgan: javob darhol tekshiriladi, xato qilingan savollar keyin takrorlanadi.",
    ],
    guruhlar: c.units.map((u, ui) => ({
      nom: `${ui + 1}-bob. ${bobNomi(u.u)}`,
      qatorlar: u.lessons.map((l, li) => ({ yol: `${yol}/${ui + 1}-bob/${li + 1}-dars`, nom: darsNomi(l.n) })),
    })),
    havolalar: [{ yol: `${yol}/formulalar`, nom: `${c.title}: formulalar` }, { yol: "/imtihon", nom: "DTM test variantlari" }],
    ld: [
      {
        "@context": "https://schema.org", "@type": "Course", name: c.title, description: qisqa(`${c.desc}.`, 300),
        url: ASOS + yol, inLanguage: "uz", isAccessibleForFree: true, provider: TASHKILOT,
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
    u.lessons.forEach((l, li) => {
      const dYol = `${yol}/${ui + 1}-bob/${li + 1}-dars`;
      const nom = darsNomi(l.n);
      const bet = l.n.split(" · ")[1]?.trim();
      sahifalar[dYol] = {
        sarlavha: `${nom} — ${c.title}, ${ui + 1}-bob | ${BREND}`,
        tavsif: qisqa(`${nom}: ${c.title}, ${ui + 1}-bob «${bobNomi(u.u)}». ${u.intro.d} Onlayn mashq, javob darhol tekshiriladi.`),
        h1: `${nom}`,
        matn: [
          `${c.title} · ${ui + 1}-bob «${bobNomi(u.u)}» · ${li + 1}-dars${bet ? ` (darslik: ${bet})` : ""}.`,
          `${u.intro.t}. ${u.intro.d}`,
          "Dars qisqa tushuntirish va savollardan iborat. Har javob darhol tekshiriladi, "
            + "xato qilingan savollar xatolar daftariga tushadi va keyin qayta so'raladi.",
        ],
        guruhlar: [{
          nom: `${ui + 1}-bob darslari`,
          qatorlar: u.lessons.map((x, xi) => ({ yol: `${yol}/${ui + 1}-bob/${xi + 1}-dars`, nom: darsNomi(x.n) })),
        }],
        havolalar: [{ yol, nom: `${c.title} — barcha boblar` }],
        ld: [
          {
            "@context": "https://schema.org", "@type": "LearningResource", name: nom,
            description: qisqa(`${u.intro.d}`, 300), url: ASOS + dYol, inLanguage: "uz",
            learningResourceType: "Exercise", isAccessibleForFree: true, provider: TASHKILOT,
            isPartOf: { "@type": "Course", name: c.title, url: ASOS + yol },
          },
          yolak([...kursYolak, { yol: dYol, nom }]),
        ],
        muhim: 0.6,
      };
    });
  });

  // Formulalar sahifasi har kursda bor, mazmuni esa bitta — asosiysi bitta.
  sahifalar[`${yol}/formulalar`] = { ...formulaSahifasi(), kanonik: "/formulalar", muhim: undefined };
}

/* --------------------------------------------------------------- formulalar */

function formulaSahifasi(): Sahifa {
  const jami = FORMULALAR.reduce((a, b) => a + b.lar.length, 0);
  return {
    sarlavha: `Matematika formulalari — algebra va geometriya, 5–11-sinf | ${BREND}`,
    tavsif: qisqa(`${jami} ta asosiy formula bir joyda: ${FORMULALAR.map((b) => b.nom.toLowerCase()).slice(0, 6).join(", ")}. `
      + "Maktab va DTM uchun."),
    h1: "Matematika formulalari",
    matn: [`Maktab matematikasidagi ${jami} ta asosiy formula bo'limlar bo'yicha: har biri qaysi sinfda o'tilishi bilan.`],
    guruhlar: FORMULALAR.map((b) => ({ nom: `${b.nom} (${b.sinf}-sinf)`, qatorlar: b.lar.map((f) => `${f.nom}: ${f.f}`) })),
    havolalar: [{ yol: "/imtihon", nom: "DTM test variantlari" }, { yol: "/sertifikat", nom: "Milliy sertifikat variantlari" }],
    ld: [yolak([BOSH, { yol: "/formulalar", nom: "Formulalar" }])],
    muhim: 0.8,
  };
}
// Kanonik manzil — alohida yo'l: `/formulalar` ni ilova 11-sinf formulalariga
// yo'naltiradi (`App.tsx`), server esa shu sahifani beradi.
sahifalar["/formulalar"] = formulaSahifasi();

/* ------------------------------------------------------------------ o'yinlar */

const oyinHavolalari: Havola[] = OYINLAR.map((o) => ({ yol: `/oyinlar/${o.id}`, nom: t(o.nom) }));
for (const o of OYINLAR) {
  const nom = t(o.nom);
  sahifalar[`/oyinlar/${o.id}`] = {
    sarlavha: `${nom} — matematik o'yin onlayn | ${BREND}`,
    tavsif: qisqa(`${nom}: ${t(o.izoh)} ${t(o.qoida).replace(/[✅❌]/g, "").replace(/\s+/g, " ")} Uch daraja, rekord va haftalik o'sish. Bepul.`),
    h1: `${nom} — matematik o'yin`,
    matn: [`${t(o.izoh)}`, t(o.qoida).replace(/[✅❌]/g, "").replace(/\s+/g, " "), "O'yin uch darajada: bola ham, katta ham o'ziga mosini tanlaydi."],
    havolalar: oyinHavolalari.filter((h) => h.nom !== nom),
    ld: [yolak([BOSH, { yol: "/oyinlar", nom: "O'yinlar" }, { yol: `/oyinlar/${o.id}`, nom }])],
    muhim: 0.7,
  };
}

/* --------------------------------------------------------------- bo'limlar */

sahifalar["/"] = {
  sarlavha: `${BREND} — matematika: 1–11-sinf darslari, DTM va Milliy sertifikat testlari`,
  tavsif: "Bepul onlayn matematika: maktabgacha yoshdan 11-sinfgacha darslar, algebra va geometriya, "
    + "DTM va Milliy sertifikat test variantlari, masalalar, formulalar va matematik o'yinlar.",
  h1: `${BREND} — matematikani o'rganish uchun bepul ilova`,
  matn: [
    `Maktabgacha yoshdan 11-sinfgacha ${COURSES.length} ta kurs va ${jamiDars} ta dars: darslik boblari bo'yicha, `
      + "har darsda qisqa tushuntirish va mashqlar.",
    `Abituriyentlar uchun ${DTM_VARIANT} ta DTM varianti (${OLCHAM.savol} savol, ${OLCHAM.daqiqa} daqiqa) va `
      + `${SERT_VARIANT} ta Milliy sertifikat varianti (${TUZILISH.y1 + TUZILISH.y2 + TUZILISH.o} topshiriq, ${SERT_DAQIQA / 60} soat).`,
    `${OYINLAR.length} ta yakka matematik o'yin, do'st bilan duel va jamoaviy o'yinlar. Telegramda ham ishlaydi: @Aqlzone_bot.`,
  ],
  havolalar: [
    { yol: "/darslar", nom: "Barcha darslar" }, { yol: "/imtihon", nom: "DTM test variantlari" },
    { yol: "/sertifikat", nom: "Milliy sertifikat" }, { yol: "/formulalar", nom: "Matematika formulalari" },
    { yol: "/masalalar", nom: "Masalalar" }, { yol: "/oyinlar", nom: "Matematik o'yinlar" },
    ...kursHavolalari,
  ],
  ld: [
    { "@context": "https://schema.org", "@type": "WebSite", "@id": `${ASOS}/#sayt`, name: BREND, url: `${ASOS}/`, inLanguage: ["uz", "ru"], publisher: TASHKILOT },
    { "@context": "https://schema.org", ...TASHKILOT },
    {
      "@context": "https://schema.org", "@type": "WebApplication", name: BREND, url: `${ASOS}/`,
      applicationCategory: "EducationalApplication", operatingSystem: "Web, Android, iOS (Telegram)",
      inLanguage: ["uz", "ru"], isAccessibleForFree: true,
      offers: { "@type": "Offer", price: 0, priceCurrency: "UZS" },
      description: "Maktabgacha yoshdan 11-sinfgacha matematika, DTM va Milliy sertifikat testlari, matematik o'yinlar.",
    },
  ],
  muhim: 1.0,
};

sahifalar["/darslar"] = {
  sarlavha: `Matematika darslari: 1–11-sinf, algebra va geometriya | ${BREND}`,
  tavsif: qisqa(`Maktabgacha yoshdan 11-sinfgacha ${COURSES.length} ta kurs, ${jamiDars} ta dars: matematika, algebra, `
    + "geometriya, oliy matematika. Darslik boblari bo'yicha, bepul."),
  h1: "Matematika darslari",
  matn: [`${COURSES.length} ta kurs va ${jamiDars} ta dars — darslik boblari tartibida.`],
  havolalar: kursHavolalari,
  ld: [yolak([BOSH, { yol: "/darslar", nom: "Darslar" }])],
  muhim: 0.9,
};

sahifalar["/imtihon"] = {
  sarlavha: `DTM matematika test variantlari onlayn — ${DTM_VARIANT} variant | ${BREND}`,
  tavsif: qisqa(`DTM matematika bo'yicha ${DTM_VARIANT} ta variant: ${OLCHAM.savol} savol, ${OLCHAM.daqiqa} daqiqa, `
    + "haqiqiy format. Javob darhol ko'rinadi, o'rtacha ballingiz va zaif mavzularingiz ko'rsatiladi. Bepul."),
  h1: "DTM matematika test variantlari",
  matn: [
    `${DTM_VARIANT} ta variant, har birida ${OLCHAM.savol} ta savol va ${OLCHAM.daqiqa} daqiqa — DTM bilan bir xil. `
      + "Savollar 7–11-sinf dasturidan aralash.",
    "Har savoldan keyin to'g'ri yoki xato darhol ko'rsatiladi. Oxirgi beshta urinishning o'rtacha bali va "
      + "ko'p xato qilinayotgan mavzular alohida ko'rinadi — shu mavzularni takrorlash mumkin.",
  ],
  havolalar: [
    { yol: "/sertifikat", nom: "Milliy sertifikat variantlari" }, { yol: "/formulalar", nom: "Matematika formulalari" },
    ...COURSES.filter((c) => c.grade >= 7 && c.grade < 300).map((c) => ({ yol: `/kurs/${c.slug}`, nom: c.title })),
  ],
  ld: [yolak([BOSH, { yol: "/imtihon", nom: "DTM testlari" }])],
  muhim: 0.95,
};

sahifalar["/sertifikat"] = {
  sarlavha: `Milliy sertifikat matematika — ${SERT_VARIANT} variant, onlayn test | ${BREND}`,
  tavsif: qisqa(`Milliy sertifikat matematika imtihoniga tayyorgarlik: ${SERT_VARIANT} ta variant, `
    + `${TUZILISH.y1 + TUZILISH.y2 + TUZILISH.o} topshiriq, ${SERT_DAQIQA / 60} soat. Taxminiy daraja (C … A+) va ball. Bepul.`),
  h1: "Milliy sertifikat: matematika test variantlari",
  matn: [
    `${SERT_VARIANT} ta variant, rasmiy namunadagi tuzilish: ${TUZILISH.y1} ta test, ${TUZILISH.y2} ta moslashtirish `
      + `va ${TUZILISH.o} ta ochiq javobli topshiriq, ${SERT_DAQIQA / 60} soat.`,
    "Natija 100 ballik shkalada va taxminiy daraja bilan (C, C+, B, B+, A, A+). Javoblar saqlanadi — "
      + "to'xtagan joydan davom etish mumkin.",
  ],
  havolalar: [{ yol: "/imtihon", nom: "DTM test variantlari" }, { yol: "/formulalar", nom: "Matematika formulalari" }],
  ld: [yolak([BOSH, { yol: "/sertifikat", nom: "Milliy sertifikat" }])],
  muhim: 0.95,
};

sahifalar["/testlar"] = {
  sarlavha: `Matematika testlari — sinflar bo'yicha, onlayn | ${BREND}`,
  tavsif: "Matematika testlari: har bob uchun blok testlar va hamma uchun bir xil test to'plamlari. Natija darhol, bepul.",
  h1: "Matematika testlari",
  matn: ["Har bobning testi va tayyor test to'plamlari: javob darhol tekshiriladi, xatolar tahlil qilinadi."],
  havolalar: [{ yol: "/imtihon", nom: "DTM test variantlari" }, { yol: "/sertifikat", nom: "Milliy sertifikat" }, ...kursHavolalari],
  ld: [yolak([BOSH, { yol: "/testlar", nom: "Testlar" }])],
  muhim: 0.8,
};

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

sahifalar["/oyinlar"] = {
  sarlavha: `Matematik o'yinlar onlayn — ko'paytirish jadvali, tezkor hisob | ${BREND}`,
  tavsif: qisqa(`${OYINLAR.length} ta matematik o'yin: ${oyinHavolalari.map((h) => h.nom.toLowerCase()).join(", ")}. `
    + "Do'st bilan duel va jamoaviy o'yinlar. Bepul."),
  h1: "Matematik o'yinlar",
  matn: [
    "Og'zaki hisob, ko'paytirish jadvali va mantiqni o'yin orqali mashq qilish: har o'yinda uch daraja, "
      + "rekord va haftalik o'sish grafigi.",
    "Kunlik son, do'st bilan duel va 30 kishigacha jamoaviy o'yinlar ham bor.",
  ],
  havolalar: [...oyinHavolalari, { yol: "/oyinlar/kunlik-son", nom: "Kunlik son" }],
  ld: [yolak([BOSH, { yol: "/oyinlar", nom: "O'yinlar" }])],
  muhim: 0.85,
};

sahifalar["/oyinlar/kunlik-son"] = {
  sarlavha: `Kunlik son — har kuni yangi matematik jumboq | ${BREND}`,
  tavsif: "Kunlik son: yashirin to'g'ri tenglikni oltita urinishda toping. Har kuni yangi jumboq, hamma uchun bir xil.",
  h1: "Kunlik son",
  matn: ["Har kuni yangi jumboq: yashirin to'g'ri tenglikni oltita urinishda topish kerak. Har urinishdan keyin qaysi belgi to'g'ri joyda ekani ko'rsatiladi."],
  havolalar: oyinHavolalari,
  ld: [yolak([BOSH, { yol: "/oyinlar", nom: "O'yinlar" }, { yol: "/oyinlar/kunlik-son", nom: "Kunlik son" }])],
  muhim: 0.6,
};

sahifalar["/kichkintoy"] = {
  sarlavha: `Maktabgacha yoshdagi bolalar uchun matematika — 2–5 yosh | ${BREND}`,
  tavsif: "Kichkintoylar uchun: ranglar, hayvonlar, mashinalar va sonlar. O'qish shart emas — rasmlar va ovoz bilan. Bepul.",
  h1: "Kichkintoylar uchun",
  matn: ["2–5 yoshli bolalar uchun katta rasmlar va ovoz: ranglar, hayvonlar, mashinalar va raqamlar. O'qishni bilish shart emas."],
  havolalar: kursHavolalari.slice(0, 3),
  ld: [yolak([BOSH, { yol: "/kichkintoy", nom: "Kichkintoylar" }])],
  muhim: 0.6,
};

/* ------------------------------------------------------------------ yozish */

const bu = dirname(fileURLToPath(import.meta.url));
const dist = join(bu, "..", "dist");
mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "seo.json"), JSON.stringify({ asos: ASOS, sahifalar }));

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
console.log(`seo.json: ${Object.keys(sahifalar).length} sahifa, sitemap: `
  + `${Object.values(sahifalar).filter((s) => s.muhim).length}, takroriy sarlavha: ${takror}`);
if (takror) process.exit(1);
