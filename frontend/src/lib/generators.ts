/**
 * Aql Zone — savol generatorlari.
 *
 * Har biri chaqirilganda YANGI savol yasaydi, shuning uchun bola darsni
 * qayta o'ynasa sonlar boshqacha bo'ladi. Barchasi sof funksiya: tashqi
 * holatga tegmaydi, faqat tasodifiy sonlarga tayanadi.
 *
 * Manba: "Matematika" 1–4-sinf darsliklari (Respublika ta'lim markazi).
 */
import { choicesAround, pc, pcS, pick, rnd, shuffle } from "./rnd";
import {
  ASOSIY_RANGLAR, BOSH_HARF, GURUHLAR, HAYVONLAR, HAYVON_OVOZ,
  KAYFIYAT, KUN_TARTIBI, MAKTAB_RANGLAR, MEVA, OBJS, OB_HAVO, OLCHAM_JUFT,
  OLCHAM_SIFAT, RANGLAR, RANGLI_NARSA, SHAKL_EMOJI, SHAPES, TRANSPORT, YEM,
  YONALISH, boshHarfi, hafta, haftaKeyin, harflar, nomi, objName, ovoziNomi,
  qayerNomi, rangSifat, shaklNomi,
} from "./activity";
import type { Activity, Gen, ShapeKey } from "./activity";
import { til } from "./til";
import { p } from "./tarjima/savol";

/* ==================== Maktabgacha (4–6 yosh) ====================
 * Bu bolalar 1-sinf bolasidan ham kichik: ular na o'qiydi, na sanaydi,
 * ba'zilari raqamni ham ko'rmagan. Shuning uchun bu bo'limning qat'iy
 * qoidalari bor:
 *
 *   • javob variantlari HECH QACHON so'z bo'lmaydi — rang, rasm,
 *     yoki bitta katta harf/raqam;
 *   • sonlar 5 dan, oxirgi boblarda 10 dan oshmaydi;
 *   • har bir savolda faqat BITTA narsa so'raladi;
 *   • prompt bir nafasda o'qiladigan uzunlikda — uni kattalar o'qib beradi
 *     (ovoz yoqilganda ilova o'zi o'qiydi, `lib/ovoz.ts`).
 *
 * Tartib: ranglar → shakllar → naqsh → guruhlash → sanash → raqamlar →
 * harflar. Ya'ni matematika emas, TANISH va MANTIQ birinchi keladi.
 */

/**
 * Gap bosh harf bilan boshlansin.
 *
 * Savol matni ko'pincha ma'lumot ro'yxatidagi nomdan yasaladi ("ayiq") va
 * u yerda nomlar kichik harfda turadi — chunki gap o'rtasida ham ishlatiladi.
 * Ekranda esa u gapning boshi: "Ayiq nimani yeydi?"
 */
const Bosh = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Nomni GAP BOSHIDA turgan holatga keltiradi — faqat o'zbekchada.
 *
 * O'zbekcha qolipda nom gapning boshida keladi ("Ayiq nimani yeydi?"),
 * ruschada esa o'rtasida ("Что ест медведь?"). Shuning uchun bosh harfga
 * ko'tarish tilga bog'liq: ruschada u gap o'rtasidagi otni katta harf
 * bilan yozib qo'yardi.
 */
const B = (s: string) => (til() === "ru" ? s : Bosh(s));

/* ---------- ranglar ---------- */

/** Ko'rsatilgan rangni topish — to'rt asosiy rang ichidan. */
export const g0Rang = (): Activity => {
  const t = pick(ASOSIY_RANGLAR);
  const boshqa = shuffle(ASOSIY_RANGLAR.filter((r) => r.hex !== t.hex)).slice(0, 3);
  return {
    type: "rang", rang: t.hex, answer: t.hex, kind: "rang",
    prompt: p("rangTop"),
    choices: shuffle([t.hex, ...boshqa.map((r) => r.hex)]),
  };
};

/** Nomi aytilgan rang. Kattalar o'qib beradi: "qaysi biri ko'k?" */
export const g0RangNom = (): Activity => {
  const t = pick(ASOSIY_RANGLAR);
  const boshqa = shuffle(ASOSIY_RANGLAR.filter((r) => r.hex !== t.hex)).slice(0, 3);
  return {
    type: "rang", rang: "", answer: t.hex, kind: "rang",
    prompt: p("rangQaysi", { nom: nomi(t) }),
    choices: shuffle([t.hex, ...boshqa.map((r) => r.hex)]),
  };
};

/** Narsaning tabiiy rangi: olma — qizil, banan — sariq. */
export const g0RangNarsa = (): Activity => {
  const t = pick(RANGLI_NARSA);
  const boshqa = shuffle(RANGLAR.filter((r) => r.hex !== t.hex)).slice(0, 3);
  return {
    type: "rasm", emoji: t.e, answer: t.hex, kind: "rang",
    prompt: p("narsaRang", { nom: B(nomi(t)) }),
    choices: shuffle([t.hex, ...boshqa.map((r) => r.hex)]),
  };
};

/** Yetti rangdan biri — kursning to'liq rang darsi. */
export const g0RangKop = (): Activity => {
  const t = pick(MAKTAB_RANGLAR);
  const boshqa = shuffle(MAKTAB_RANGLAR.filter((r) => r.hex !== t.hex)).slice(0, 3);
  return {
    type: "rang", rang: "", answer: t.hex, kind: "rang",
    prompt: p("rangQaysi", { nom: nomi(t) }),
    choices: shuffle([t.hex, ...boshqa.map((r) => r.hex)]),
  };
};

/**
 * "Qizil olmani top!" — rang va narsa birga.
 *
 * Bu ranglar bobining eng muhim darsi: bola rangni mavhum doirada emas,
 * HAQIQIY narsada tanishi kerak. Variantlar turli rangdagi mevalar, javob
 * esa aytilgan rangdagisi.
 */
export const g0RangliMeva = (): Activity => {
  const t = pick(MEVA);
  // Chalg'ituvchilar BOSHQA rangda bo'lishi shart, aks holda ikkita to'g'ri
  // javob paydo bo'ladi (olma ham, gilos ham qizil).
  const boshqa = shuffle(MEVA.filter((m) => m.hex !== t.hex)).slice(0, 3);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    // Ruschada sifat OT JINSIGA kelishadi ("красное яблоко", "красную
    // клубнику"), o'zbekchada esa o'zgarmaydi — shu sabab ikki til bir
    // qolipda ishlashi uchun sifat `rangSifat` dan olinadi.
    prompt: p("rangliMeva", {
      sifat: B(rangSifat(t.hex, t.r)),
      nom: nomi(t),
    }),
    choices: shuffle([t.e, ...boshqa.map((m) => m.e)]),
  };
};

/* ---------- shakllar ---------- */

/** Xuddi shu shaklni top — savol ham, javob ham rasm. */
export const g0Shakl = (): Activity => {
  const t = pick(SHAKL_EMOJI);
  const boshqa = shuffle(SHAKL_EMOJI.filter((s) => s.e !== t.e)).slice(0, 3);
  return {
    type: "rasm", emoji: t.e, answer: t.e, kind: "emoji",
    prompt: p("shaklTop"),
    choices: shuffle([t.e, ...boshqa.map((s) => s.e)]),
  };
};

/** Nomi aytilgan shakl: "qaysi biri uchburchak?" */
export const g0ShaklNom = (): Activity => {
  const t = pick(SHAKL_EMOJI);
  const boshqa = shuffle(SHAKL_EMOJI.filter((s) => s.e !== t.e)).slice(0, 3);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("shaklQaysi", { nom: nomi(t) }),
    choices: shuffle([t.e, ...boshqa.map((s) => s.e)]),
  };
};

/* ---------- naqsh: sanashdan oldingi mantiq ---------- */

/**
 * Naqsh davomi: 🔴🔵🔴🔵 → keyingisi?
 *
 * Uch xil qiyinlik bir generatorda: AB (eng oson), ABC va AAB. Qaysi biri
 * chiqishi tasodifiy, shuning uchun dars qayta o'ynalganda zerikarli
 * bo'lmaydi. Naqsh ataylab to'liq davr bilan tugaydi — "?" har doim
 * davrning boshiga to'g'ri kelmaydi, aks holda bola faqat oxirgi ikkitaga
 * qarab taxmin qilib ketardi.
 */
export const g0Naqsh = (): Activity => {
  const shakl = pick([[0, 1], [0, 1, 2], [0, 0, 1]]);
  const nechta = new Set(shakl).size;
  const belgi = shuffle([...SHAKL_EMOJI]).slice(0, nechta).map((s) => s.e);
  const uz = shakl.length * 2 + rnd(0, shakl.length - 1);      // 4–8 katak
  const items = Array.from({ length: uz }, (_, i) => belgi[shakl[i % shakl.length]]);
  const javob = belgi[shakl[uz % shakl.length]];
  const boshqa = shuffle(SHAKL_EMOJI.filter((s) => s.e !== javob)).slice(0, 3);
  return {
    type: "naqsh", items, answer: javob, kind: "emoji",
    prompt: p("naqshKeyin"),
    choices: shuffle([javob, ...boshqa.map((s) => s.e)]),
  };
};

/* ---------- guruhlash va bog'lash ---------- */

/** "Qaysi biri meva?" — narsalarni guruhga ajratish. */
export const g0Guruh = (): Activity => {
  const g = pick(GURUHLAR);
  const togri = pick(g.items);
  const boshqalar = shuffle(GURUHLAR.filter((x) => x.nom !== g.nom).flatMap((x) => [...x.items])).slice(0, 3);
  return {
    type: "rasm", emoji: "", answer: togri, kind: "emoji",
    prompt: p("guruhQaysi", { nom: nomi(g) }),
    choices: shuffle([togri, ...boshqalar]),
  };
};

/** Ortiqchasini top: uchtasi bir guruhdan, bittasi butunlay boshqa. */
export const g0Ortiq = (): Activity => {
  const g = pick(GURUHLAR);
  const uch = shuffle([...g.items]).slice(0, 3);
  const ortiq = pick(pick(GURUHLAR.filter((x) => x.nom !== g.nom)).items);
  const joy = rnd(0, 3);
  const items = [...uch];
  items.splice(joy, 0, ortiq);
  return {
    type: "odd", items, odd: joy, answer: ortiq, kind: "emoji",
    prompt: p("boshqacha"),
    choices: shuffle([ortiq, ...uch]),
  };
};

/** Kim nima yeydi — hayvonni yemi bilan bog'lash. */
export const g0Yem = (): Activity => {
  const t = pick(YEM);
  const boshqa = shuffle(YEM.filter((x) => x.y !== t.y)).slice(0, 3);
  return {
    type: "rasm", emoji: t.h, answer: t.y, kind: "emoji",
    prompt: p("yem", { nom: B(nomi(t)) }),
    choices: shuffle([t.y, ...boshqa.map((x) => x.y)]),
  };
};

/** Kayfiyat — yuz ifodasini o'qish. */
export const g0Kayfiyat = (): Activity => {
  const t = pick(KAYFIYAT);
  const boshqa = shuffle(KAYFIYAT.filter((k) => k.e !== t.e)).slice(0, 3);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("kayfiyat", { nom: nomi(t) }),
    choices: shuffle([t.e, ...boshqa.map((k) => k.e)]),
  };
};

/* ---------- atrofdagi dunyo: hayvon, meva, transport ---------- */

/** Hayvon nomi: "qaysi biri arslon?" */
export const g0Hayvon = (): Activity => {
  const t = pick(HAYVON_OVOZ);
  const boshqa = shuffle(HAYVON_OVOZ.filter((h) => h.e !== t.e)).slice(0, 3);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("hayvonQaysi", { nom: nomi(t) }),
    choices: shuffle([t.e, ...boshqa.map((h) => h.e)]),
  };
};

/**
 * Hayvon ovozi: "Kim 'vov-vov' deydi?"
 *
 * Bu yoshdagi eng sevimli savol va u ovozsiz ham ishlaydi: tovush savol
 * matnida yozilgan, kattalar uni o'qib (yoki taqlid qilib) beradi. Ovoz
 * yoqilganda esa ilova o'zi aytadi.
 */
export const g0HayvonOvoz = (): Activity => {
  const t = pick(HAYVON_OVOZ);
  const boshqa = shuffle(HAYVON_OVOZ.filter((h) => h.ovoz !== t.ovoz)).slice(0, 3);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("ovozKim", { ovoz: ovoziNomi(t) }),
    choices: shuffle([t.e, ...boshqa.map((h) => h.e)]),
  };
};

/** Hayvonni ko'rsatib, ovozini so'raymiz — teskari yo'nalish. */
export const g0Ovozi = (): Activity => {
  const t = pick(HAYVON_OVOZ);
  const boshqa = shuffle(HAYVON_OVOZ.filter((h) => h.ovoz !== t.ovoz)).slice(0, 3);
  return {
    type: "rasm", emoji: t.e, answer: ovoziNomi(t), kind: "matn",
    prompt: p("ovozQanday", { nom: B(nomi(t)) }),
    choices: shuffle([ovoziNomi(t), ...boshqa.map(ovoziNomi)]),
  };
};

/** Meva nomi. */
export const g0Meva = (): Activity => {
  const t = pick(MEVA);
  const boshqa = shuffle(MEVA.filter((m) => m.e !== t.e)).slice(0, 3);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("mevaQaysi", { nom: nomi(t) }),
    choices: shuffle([t.e, ...boshqa.map((m) => m.e)]),
  };
};

/**
 * Mevaning rangi: "olma qanday rangda?"
 *
 * Chalg'ituvchilar `RANGLAR` dan olinadi, `MAKTAB_RANGLAR` dan emas:
 * apelsin "to'q sariq" va bu rang qisqa ro'yxatda yo'q — javob variantlar
 * ichida umuman bo'lmay qolardi.
 */
export const g0MevaRang = (): Activity => {
  const t = pick(MEVA);
  const boshqa = shuffle(RANGLAR.filter((r) => r.hex !== t.hex)).slice(0, 3);
  return {
    type: "rasm", emoji: t.e, answer: t.hex, kind: "rang",
    prompt: p("narsaRang", { nom: B(nomi(t)) }),
    choices: shuffle([t.hex, ...boshqa.map((r) => r.hex)]),
  };
};

/** Transport nomi. */
export const g0Transport = (): Activity => {
  const t = pick(TRANSPORT);
  const boshqa = shuffle(TRANSPORT.filter((x) => x.e !== t.e)).slice(0, 3);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("transportQaysi", { nom: nomi(t) }),
    choices: shuffle([t.e, ...boshqa.map((x) => x.e)]),
  };
};

/**
 * Transport qayerda yuradi: yerda, havoda yoki suvda.
 *
 * Savol berilgan JOYGA mos transportni so'raydi — chalg'ituvchilar albatta
 * boshqa joyda yuradiganlar bo'ladi, aks holda ikkita to'g'ri javob
 * chiqib qolardi.
 */
export const g0TransportJoy = (): Activity => {
  const t = pick(TRANSPORT);
  const boshqa = shuffle(TRANSPORT.filter((x) => x.qayer !== t.qayer)).slice(0, 3);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("transportJoy", { qayer: qayerNomi(t) }),
    choices: shuffle([t.e, ...boshqa.map((x) => x.e)]),
  };
};

/* ---------- o'lcham va yo'nalish ---------- */

/**
 * Katta–kichik, uzun–qisqa, baland–past.
 *
 * Har savolda BIR juft ko'rsatiladi va ikkitasidan biri so'raladi. Javob
 * variantlari ikkita bo'ladi — bu yoshda to'rtta variant ortiqcha, bola
 * tanlashning o'zidan charchaydi.
 */
export const g0Olcham = (): Activity => {
  const t = pick(OLCHAM_JUFT);
  const kattaSora = Math.random() < 0.5;
  const s = OLCHAM_SIFAT[t.sifat];
  // Ruschada DARAJA shakli ishlatiladi ("выше", "короче"): u jinsga
  // bog'lanmaydi, ya'ni istalgan juftlik uchun to'g'ri chiqadi.
  const sifat = til() === "ru"
    ? (kattaSora ? s.ru : s.ruTeskari)
    : (kattaSora ? t.sifat : s.teskari);
  return {
    type: "rasm", emoji: "", answer: kattaSora ? t.katta : t.kichik, kind: "emoji",
    prompt: p("olcham", { sifat }),
    choices: shuffle([t.katta, t.kichik]),
  };
};

/** Strelka yo'nalishi: yuqoriga, pastga, chapga, o'ngga. */
export const g0Yonalish = (): Activity => {
  const t = pick(YONALISH);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("yonalish", { nom: nomi(t) }),
    choices: shuffle(YONALISH.map((y) => y.e)),
  };
};

/* ---------- vaqt: kun, hafta, ob-havo ---------- */

/** Kun qismi: ertalab, tush, kech, tun. */
export const g0Kun = (): Activity => {
  const t = pick(KUN_TARTIBI);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("kunQaysi", { nom: nomi(t) }),
    choices: shuffle(KUN_TARTIBI.map((k) => k.e)),
  };
};

/** Kundan keyin nima keladi: ertalab → tush. */
export const g0KunKeyin = (): Activity => {
  const i = rnd(0, KUN_TARTIBI.length - 2);
  const t = KUN_TARTIBI[i], j = KUN_TARTIBI[i + 1];
  return {
    type: "rasm", emoji: t.e, answer: j.e, kind: "emoji",
    // Ruschada "после" qaratqich kelishigini talab qiladi (утро → утра).
    prompt: p("kunKeyin", { nom: til() === "ru" ? t.ruGen : Bosh(t.nom) }),
    choices: shuffle(KUN_TARTIBI.map((k) => k.e)),
  };
};

/**
 * Hafta kunlari.
 *
 * Kursdagi yagona dars — javoblari SO'Z. Kun nomining rasmi yo'q, shuning
 * uchun boshqa iloji ham yo'q. Kattalar o'qib beradi (ovoz yoqilganda
 * ilova o'zi aytadi), bola esa tartibni quloq bilan eslab qoladi.
 */
export const g0Hafta = (): Activity => {
  const kunlar = hafta();
  const i = rnd(0, kunlar.length - 2);
  const togri = kunlar[i + 1];
  const boshqa = shuffle(kunlar.filter((k) => k !== togri)).slice(0, 3);
  return {
    // Sahnada BUGUNGI kun turadi: bola so'zning shaklini ko'radi va uni
    // eshitgan nomi bilan bog'laydi. Bo'sh sahna bu darsni umuman
    // ma'nosiz qilardi — ko'rsatadigan narsasi qolmasdi.
    type: "belgi", belgi: kunlar[i], answer: togri, kind: "matn",
    prompt: p("haftaKeyin", { kun: haftaKeyin(i) }),
    choices: shuffle([togri, ...boshqa]),
  };
};

/** Ob-havo: quyoshli, yomg'irli, qorli, bulutli. */
export const g0ObHavo = (): Activity => {
  const t = pick(OB_HAVO);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("obHavoQaysi", { nom: nomi(t) }),
    choices: shuffle(OB_HAVO.map((o) => o.e)),
  };
};

/** Bunday kunda nima kerak: yomg'ir → soyabon. */
export const g0ObHavoKiyim = (): Activity => {
  const t = pick(OB_HAVO);
  return {
    type: "rasm", emoji: t.e, answer: t.kiyim, kind: "emoji",
    prompt: p("obHavoKiyim"),
    choices: shuffle(OB_HAVO.map((o) => o.kiyim)),
  };
};

/* ---------- sanash: 3 → 5 → 10 ---------- */

/**
 * Narsalarni sanash.
 *
 * Javob variantlari RAQAM bo'lgani uchun `belgi` ko'rinishida katta
 * chiziladi: bola raqamni hali o'qimaydi, uning shaklini eslab qoladi.
 */
export const g0Sana = (max = 3): Activity => {
  const n = rnd(1, max), e = pick(OBJS);
  return {
    type: "count", emoji: e, n, answer: n, kind: "belgi",
    prompt: p("nechta", { nom: objName(e) }),
    choices: choicesAround(n, 4, 1, max + 2),
  };
};

/** Qayerda ko'p — ikki guruhni ko'z bilan taqqoslash (sanamasdan ham bo'ladi). */
export const g0Kop = (): Activity => {
  const a = rnd(1, 5);
  let b = rnd(1, 5);
  // Farq kamida 2 bo'lsin: "4 va 5" ni bu yoshda ko'z bilan ajratib
  // bo'lmaydi va bola tasodifga tayanib bosadi.
  while (Math.abs(b - a) < 2) b = rnd(1, 5);
  const kop = Math.max(a, b);
  return {
    type: "cmpvis", a, b, emoji: pick(OBJS), answer: kop, kind: "belgi",
    prompt: p("qayerdaKop"),
    choices: choicesAround(kop, 4, 1, 7),
  };
};

/** Hammasi nechta — rasmlar bilan qo'shishning eng birinchi ko'rinishi. */
export const g0Qosh = (max = 5): Activity => {
  const a = rnd(1, max - 1), b = rnd(1, max - a);
  return {
    type: "cmpvis", a, b, emoji: pick(OBJS), plus: true, answer: a + b, kind: "belgi",
    prompt: p("hammasiNechta"),
    choices: choicesAround(a + b, 4, 1, max + 2),
  };
};

/** Sonlar qatorida tushib qolgan son: 1 2 ? 4 5. */
export const g0Nur = (max = 5): Activity => {
  const boshi = rnd(1, Math.max(1, max - 4));
  const arr = Array.from({ length: 5 }, (_, i) => boshi + i);
  const hide = rnd(1, 3);
  return {
    type: "numray", arr, hide, answer: arr[hide], kind: "belgi",
    prompt: p("tushibQolgan"),
    choices: choicesAround(arr[hide], 4, 1, max),
  };
};

/** Qayerda kam — taqqoslashning ikkinchi tomoni. */
export const g0Kam = (): Activity => {
  const a = rnd(1, 5);
  let b = rnd(1, 5);
  while (Math.abs(b - a) < 2) b = rnd(1, 5);
  const kam = Math.min(a, b);
  return {
    type: "cmpvis", a, b, emoji: pick(OBJS), answer: kam, kind: "belgi",
    prompt: p("qayerdaKam"),
    choices: choicesAround(kam, 4, 1, 7),
  };
};

/**
 * Ayirish — ko'z bilan: chizilganlari ketdi, qolganini sanaydi.
 *
 * Javob har doim 1 dan kichik bo'lmaydi: nol bu yoshda "yo'q" degani va
 * bo'sh ekran bolani chalkashtiradi, shuning uchun kamida bittasi qoladi.
 */
export const g0Ayir = (max = 5): Activity => {
  const n = rnd(2, max), k = rnd(1, n - 1);
  return {
    type: "ayirvis", n, k, emoji: pick(OBJS), answer: n - k, kind: "belgi",
    prompt: p("nechtaQoldi"),
    choices: choicesAround(n - k, 4, 1, max + 1),
  };
};

/** Qo'shish — belgilar bilan: 2 + 1 = ? */
export const g0QoshBelgi = (max = 5): Activity => {
  const a = rnd(1, max - 1), b = rnd(1, max - a);
  return {
    type: "eqn", text: `${a} + ${b} = ?`, answer: a + b, kind: "belgi",
    prompt: p("qoshBuyruq", { a, b }),
    choices: choicesAround(a + b, 4, 1, max + 2),
  };
};

/** Ayirish — belgilar bilan: 4 − 1 = ? */
export const g0AyirBelgi = (max = 5): Activity => {
  const a = rnd(2, max), b = rnd(1, a - 1);
  return {
    type: "eqn", text: `${a} − ${b} = ?`, answer: a - b, kind: "belgi",
    prompt: p("ayirBuyruq", { a, b }),
    choices: choicesAround(a - b, 4, 1, max),
  };
};

/** Keyingi va oldingi son — sanoq tartibini mustahkamlaydi. */
export const g0Keyingi = (max = 5): Activity => {
  const keyin = Math.random() < 0.5;
  const n = keyin ? rnd(1, max - 1) : rnd(2, max);
  const j = keyin ? n + 1 : n - 1;
  return {
    type: "eqn", text: keyin ? `${n} → ?` : `? ← ${n}`, answer: j, kind: "belgi",
    prompt: keyin ? p("keyingiSon", { n }) : p("oldingiSon", { n }),
    choices: choicesAround(j, 4, 1, max),
  };
};

/* ---------- raqamlar va harflar: o'qishga tayyorgarlik ---------- */

/** Raqamni tanish: "qaysi biri 3?" */
export const g0Raqam = (max = 5): Activity => {
  const n = rnd(1, max);
  const boshqa = shuffle(Array.from({ length: max }, (_, i) => i + 1).filter((x) => x !== n)).slice(0, 3);
  return {
    type: "belgi", belgi: "", answer: n, kind: "belgi",
    prompt: p("raqamQaysi", { n }),
    choices: shuffle([n, ...boshqa]),
  };
};

/** Harfni tanish: "qaysi biri A harfi?" */
export const g0Harf = (): Activity => {
  const alifbo = harflar();
  const h = pick(alifbo);
  const boshqa = shuffle(alifbo.filter((x) => x !== h)).slice(0, 3);
  return {
    type: "belgi", belgi: "", answer: h, kind: "belgi",
    prompt: p("harfQaysi", { h }),
    choices: shuffle([h, ...boshqa]),
  };
};

/** Xuddi shu harfni top — o'qishdan oldingi eng oson shakl mashqi. */
export const g0HarfJuft = (): Activity => {
  const alifbo = harflar();
  const h = pick(alifbo);
  const boshqa = shuffle(alifbo.filter((x) => x !== h)).slice(0, 3);
  return {
    type: "belgi", belgi: h, answer: h, kind: "belgi",
    prompt: p("harfTop"),
    choices: shuffle([h, ...boshqa]),
  };
};

/** So'z qaysi harf bilan boshlanadi: 🍎 olma → O. */
export const g0BoshHarf = (): Activity => {
  const t = pick(BOSH_HARF);
  const h = boshHarfi(t);
  const boshqa = shuffle(harflar().filter((x) => x !== h)).slice(0, 3);
  return {
    type: "rasm", emoji: t.e, answer: h, kind: "belgi",
    prompt: p("boshHarf", { nom: nomi(t) }),
    choices: shuffle([h, ...boshqa]),
  };
};

/* ==================== 1-sinf ====================
 * Bu yoshda bola hali O'QIY OLMAYDI. Shuning uchun:
 *
 *   • savolning o'zi rasm — rang, hayvon, sanaladigan narsalar;
 *   • javob tugmalari ham rasm yoki rang (`kind`), matn emas;
 *   • prompt ataylab juda qisqa — kattalar o'qib bersa bir nafasda o'qiladi.
 *
 * Tartib ham shunga mos: ranglar → hayvonlar → sanash → sonlar → amallar.
 */

/* ---------- ranglar: eng birinchi mavzu ---------- */

/** Berilgan rangni tanish. Variantlar — bo'yalgan doiralar, o'qish kerak emas. */
export const g1Rang = (): Activity => {
  const t = pick(RANGLAR);
  const boshqa = shuffle(RANGLAR.filter((r) => r.hex !== t.hex)).slice(0, 3);
  return {
    type: "rang", rang: t.hex, answer: t.hex, kind: "rang",
    prompt: p("rangTop"),
    choices: shuffle([t.hex, ...boshqa.map((r) => r.hex)]),
  };
};

/** Nomi aytilgan rangni topish — kattalar o'qib beradi. */
export const g1RangNom = (): Activity => {
  const t = pick(RANGLAR);
  const boshqa = shuffle(RANGLAR.filter((r) => r.hex !== t.hex)).slice(0, 3);
  return {
    type: "rang", rang: "", answer: t.hex, kind: "rang",
    prompt: p("rangQaysi", { nom: nomi(t) }),
    choices: shuffle([t.hex, ...boshqa.map((r) => r.hex)]),
  };
};

/* ---------- hayvonlar ---------- */

/** Ko'rsatilgan hayvonni variantlar orasidan topish. */
export const g1Hayvon = (): Activity => {
  const t = pick(HAYVONLAR);
  const boshqa = shuffle(HAYVONLAR.filter((h) => h.e !== t.e)).slice(0, 3);
  return {
    type: "rasm", emoji: t.e, answer: t.e, kind: "emoji",
    prompt: p("shunisiTop"),
    choices: shuffle([t.e, ...boshqa.map((h) => h.e)]),
  };
};

/** Nomi aytilgan hayvonni topish. */
export const g1HayvonNom = (): Activity => {
  const t = pick(HAYVONLAR);
  const boshqa = shuffle(HAYVONLAR.filter((h) => h.e !== t.e)).slice(0, 3);
  return {
    type: "rasm", emoji: "", answer: t.e, kind: "emoji",
    prompt: p("hayvonQaysi", { nom: nomi(t) }),
    choices: shuffle([t.e, ...boshqa.map((h) => h.e)]),
  };
};

/** Hayvonlarni sanash. */
export const g1HayvonSana = (max = 5): Activity => {
  const h = pick(HAYVONLAR), n = rnd(1, max);
  return {
    type: "count", emoji: h.e, n, answer: n,
    prompt: p("nechta", { nom: nomi(h) }),
    choices: choicesAround(n, 4, 1, max + 2),
  };
};

/** Ortiqchasini top — uchtasi bir xil hayvon, bittasi boshqa. */
export const g1HayvonOrtiq = (): Activity => {
  const a = pick(HAYVONLAR);
  let b = pick(HAYVONLAR);
  while (b.e === a.e) b = pick(HAYVONLAR);
  const odd = rnd(0, 3);
  return {
    type: "odd", items: Array.from({ length: 4 }, (_, i) => (i === odd ? b.e : a.e)), odd,
    answer: b.e, kind: "emoji",
    prompt: p("boshqacha"),
    choices: shuffle([b.e, a.e, ...shuffle(HAYVONLAR.filter((h) => h.e !== a.e && h.e !== b.e)).slice(0, 2).map((h) => h.e)]),
  };
};

/* ---------- katta–kichik, ko'p–kam ---------- */

/**
 * Katta–kichik: to'rtta hayvondan eng kattasi (yoki eng kichigi).
 *
 * Javob variantlari rasm bo'lgani uchun bola hech narsa o'qimaydi —
 * hayvonlarni tanib, kattaligini taqqoslaydi.
 */
export const g1KattaKichik = (): Activity => {
  const kattaSora = Math.random() < 0.5;
  // Kattaliklari ANIQ farq qiladigan to'rtta hayvon tanlaymiz, aks holda
  // "quyon va mushuk" kabi juftlarda to'g'ri javob munozarali bo'lib qoladi.
  const daraja = shuffle([1, 2, 3, 4, 5]).slice(0, 4);
  const tanlangan = daraja.map((d) => pick(HAYVONLAR.filter((h) => h.o === d)));
  const togri = tanlangan.reduce((a, b) => (kattaSora ? (b.o > a.o ? b : a) : (b.o < a.o ? b : a)));
  return {
    type: "rasm", emoji: "", answer: togri.e, kind: "emoji",
    prompt: kattaSora ? p("engKatta") : p("engKichik"),
    choices: shuffle(tanlangan.map((h) => h.e)),
  };
};

/* ---------- joylashuv, sanash, sonlar ---------- */

/**
 * Joylashuv nomlari — javob variantlari sifatida ishlatiladi.
 *
 * Ro'yxat funksiya bo'lib turadi, doimiy emas: til modul yuklangandan
 * keyin ham almashishi mumkin va doimiy qiymat eski tilda qotib qolardi.
 */
const oy = () => [
  p("jYuqorida"), p("jPastda"), p("jChapda"), p("jOngda"), p("jOrtada"),
];

/** Fazoviy joylashuv. 3×3 katakda narsa qayerda turibdi. */
export const g1Pos = (): Activity => {
  // Faqat aniq javobi bor kataklar: burchaklar ikki ma'noli bo'lib qoladi.
  const kataklar = [1, 7, 3, 5, 4];                     // yuqori, past, chap, o'ng, markaz
  const OY = oy();
  const i = rnd(0, kataklar.length - 1);
  const e = pick(OBJS);
  const togri = OY[i];
  return {
    type: "pos", emoji: e, cell: kataklar[i], answer: togri,
    prompt: p("narsaQayerda", { nom: B(objName(e)) }),
    choices: shuffle([togri, ...shuffle(OY.filter((x) => x !== togri)).slice(0, 3)]),
  };
};

/** Ortiqchasini top — uchtasi bir xil, bittasi boshqacha. */
export const g1Odd = (): Activity => {
  const asosiy = pick(OBJS);
  let boshqa = pick(OBJS);
  while (boshqa === asosiy) boshqa = pick(OBJS);
  const odd = rnd(0, 3);
  const items = Array.from({ length: 4 }, (_, i) => (i === odd ? boshqa : asosiy));
  return {
    type: "odd", items, odd, answer: boshqa,
    prompt: p("boshqacha"),
    choices: shuffle([boshqa, asosiy, ...shuffle(OBJS.filter((x) => x !== asosiy && x !== boshqa)).slice(0, 2)]),
  };
};

/** Sanash — 1-sinfning eng asosiy ko'nikmasi. */
export const g1Count = (max = 10): Activity => {
  const n = rnd(1, max), e = pick(OBJS);
  return {
    type: "count", emoji: e, n, answer: n,
    prompt: p("nechta", { nom: objName(e) }),
    choices: choicesAround(n, 4, 1, max + 2),
  };
};

/** Ko'p — kam. Ikki guruhni ko'z bilan taqqoslash. */
export const g1CmpVis = (): Activity => {
  const a = rnd(2, 9);
  let b = rnd(2, 9);
  while (b === a) b = rnd(2, 9);
  const e = pick(OBJS);
  const kop = Math.max(a, b);
  return {
    type: "cmpvis", a, b, emoji: e, answer: kop,
    prompt: p("qayerdaKop"),
    choices: pc(kop, [Math.min(a, b), kop + 1, kop - 1]),
  };
};

/** Katta sonni tanlash. */
export const g1Cmp = (max = 10): Activity => {
  const a = rnd(1, max);
  let b = rnd(1, max);
  while (b === a) b = rnd(1, max);
  const kop = Math.max(a, b);
  return {
    type: "eqn", text: `${a}   ${p("txtVa")}   ${b}`, answer: kop,
    prompt: p("qaysiSonKatta"),
    choices: pc(kop, [Math.min(a, b), kop + 1, Math.max(1, kop - 2)]),
  };
};

/** Sonlar tarkibi: 7 = 3 + ? — qo'shishning poydevori. */
export const g1Compose = (jami = 10): Activity => {
  const n = rnd(4, jami), a = rnd(1, n - 1);
  return {
    type: "eqn", text: `${n} = ${a} + ?`, answer: n - a,
    prompt: p("yetmayotgan"),
    choices: choicesAround(n - a, 4, 0, jami),
  };
};

/** Keyingi / oldingi son. */
export const g1NextPrev = (max = 10): Activity => {
  const keyin = Math.random() < 0.5;
  const n = keyin ? rnd(0, max - 1) : rnd(1, max);
  const j = keyin ? n + 1 : n - 1;
  return {
    type: "eqn", text: `${n} → ?`, answer: j,
    prompt: keyin ? p("keyingiNima", { n }) : p("oldingiNima", { n }),
    choices: choicesAround(j, 4, 0, max + 1),
  };
};

/** 10 ichida qo'shish — o'nlikdan o'tmasdan. */
export const g1Add10 = (): Activity => {
  const a = rnd(1, 8), b = rnd(1, 9 - a);
  return {
    type: "eqn", text: `${a} + ${b} = ?`, answer: a + b,
    prompt: p("qosh"),
    choices: choicesAround(a + b, 4, 0, 12),
  };
};

/** 10 ichida ayirish. */
export const g1Sub10 = (): Activity => {
  const a = rnd(3, 10), b = rnd(1, a - 1);
  return {
    type: "eqn", text: `${a} − ${b} = ?`, answer: a - b,
    prompt: p("ayir"),
    choices: choicesAround(a - b, 4, 0, 11),
  };
};

/** 20 ichida O'NLIKDAN O'TIB qo'shish — 1-sinfning eng qiyin mavzusi. */
export const g1Add20 = (): Activity => {
  const a = rnd(6, 9), b = rnd(11 - a, 9);
  return {
    type: "eqn", text: `${a} + ${b} = ?`, answer: a + b,
    prompt: p("onlikTold"),
    choices: choicesAround(a + b, 4, 10, 20),
  };
};

/** 20 ichida o'nlikni buzib ayirish. */
export const g1Sub20 = (): Activity => {
  const a = rnd(11, 18), b = rnd(a - 9, 9);
  return {
    type: "eqn", text: `${a} − ${b} = ?`, answer: a - b,
    prompt: p("onlikTush"),
    choices: choicesAround(a - b, 4, 0, 12),
  };
};

/** O'nlik dastalari va yakka birliklar — xona tushunchasining boshlanishi. */
export const g1Tens = (maxTens = 1): Activity => {
  const t = rnd(1, maxTens), u = rnd(0, 9), n = t * 10 + u;
  return {
    type: "tens", tens: t, units: u, answer: n,
    prompt: p("dasta", { t, u }),
    choices: pc(n, [t * 10, u * 10 + t, n + 10]),
  };
};

/** Yumaloq o'nliklarni qo'shish/ayirish: 30 + 40. */
export const g1AddTens = (): Activity => {
  const qosh = Math.random() < 0.5;
  if (qosh) {
    const a = rnd(1, 5) * 10, b = rnd(1, 9 - a / 10) * 10;
    return {
      type: "eqn", text: `${a} + ${b} = ?`, answer: a + b,
      prompt: p("onlikQosh"),
      choices: pc(a + b, [a + b + 10, a + b - 10, a * 2]),
    };
  }
  const a = rnd(3, 9) * 10, b = rnd(1, a / 10 - 1) * 10;
  return {
    type: "eqn", text: `${a} − ${b} = ?`, answer: a - b,
    prompt: p("onlikAyir"),
    choices: pc(a - b, [a - b + 10, a - b - 10, b]),
  };
};

/** 100 ichida qo'shish — o'nlikdan o'tmasdan (1-sinf darajasi). */
export const g1Add100 = (): Activity => {
  const t = rnd(1, 8), u = rnd(1, 8);
  const a = t * 10 + u, b = rnd(1, 9 - u) + rnd(0, 9 - t) * 10;
  return {
    type: "eqn", text: `${a} + ${b} = ?`, answer: a + b,
    prompt: p("onlikBirlikQosh"),
    choices: choicesAround(a + b, 4, 10, 99),
  };
};

/** 100 ichida ayirish — o'nlikni buzmasdan. */
export const g1Sub100 = (): Activity => {
  const t = rnd(2, 9), u = rnd(1, 9);
  const a = t * 10 + u, b = rnd(1, u) + rnd(0, t - 1) * 10;
  return {
    type: "eqn", text: `${a} − ${b} = ?`, answer: a - b,
    prompt: p("onlikBirlikAyir"),
    choices: choicesAround(a - b, 4, 0, 99),
  };
};

/* ==================== 2-sinf poydevori ==================== */

export const gMul = (n = 0, max = 10): Activity => {
  const a = n || rnd(2, 9), b = rnd(1, max), s = a * b;
  return { type: "eqn", text: `${a} × ${b} = ?`, prompt: p("kopaytir"), answer: s, choices: choicesAround(s, 4, 0, 100) };
};

export const gDiv = (n = 0, max = 10): Activity => {
  const b = n || rnd(2, 9), k = rnd(1, max), a = b * k;
  return { type: "eqn", text: `${a} ÷ ${b} = ?`, prompt: p("bol"), answer: k, choices: choicesAround(k, 4, 0, 12) };
};

export const gMulDiv = (): Activity => {
  // O'zgaruvchi nomi `p` EMAS: `p` — tarjima funksiyasi va uni soya
  // qilib qo'ysa, shu qatordagi `p("…")` chaqiruvi songa aylanardi.
  const a = rnd(2, 9), b = rnd(2, 9), kop = a * b;
  return { type: "eqn", text: `${a} × ${b} = ${kop},  ${kop} ÷ ${a} = ?`, prompt: p("kopaytmaBolinma"), answer: b, choices: choicesAround(b, 4, 1, 10) };
};

export const gMulSum = (): Activity => {
  const k = rnd(2, 9), g = rnd(2, 5);
  return { type: "eqn", text: `${Array(g).fill(k).join(" + ")} = ${k} × ?`, prompt: p("yigindiKopaytma"), answer: g, choices: choicesAround(g, 4, 1, 10) };
};

export const gMulVis = (): Activity => {
  const g = rnd(2, 5), k = rnd(2, 5), e = pick(OBJS);
  return { type: "mulvis", g, k, emoji: e, answer: g * k, prompt: p("guruhlarJami", { g, k, nom: objName(e) }), choices: choicesAround(g * k, 4, 1, 40) };
};

export const gDivVis = (): Activity => {
  const g = rnd(2, 5), k = rnd(2, 5), e = pick(OBJS);
  return { type: "divvis", g, k, emoji: e, answer: k, prompt: p("tengGuruh", { jami: g * k, nom: objName(e), g }), choices: choicesAround(k, 4, 1, 12) };
};

export const gColumn = (op: "+" | "−", max: number): Activity => {
  let a: number, b: number;
  if (op === "+") { a = rnd(12, max - 12); b = rnd(11, max - a); }
  else { a = rnd(25, max); b = rnd(11, a - 1); }
  const s = op === "+" ? a + b : a - b;
  return { type: "column", op, a, b, answer: s, prompt: op === "+" ? p("ustunQosh") : p("ustunAyir"), choices: choicesAround(s, 4, 0, max + 10) };
};

export const gAddOver2 = (max = 100): Activity => {
  const t = rnd(1, Math.floor(max / 10) - 1), u = rnd(1, 9);
  const a = t * 10 + u, b = rnd(10 - u, 9), s = a + b;
  return { type: "eqn", text: `${a} + ${b} = ?`, prompt: p("onlikdanOtibQosh"), answer: s, choices: choicesAround(s, 4, 0, max) };
};

export const gSubOver2 = (max = 100): Activity => {
  const t = rnd(2, Math.floor(max / 10)), u = rnd(0, 8);
  const a = t * 10 + u, b = rnd(u + 1, 9), s = a - b;
  return { type: "eqn", text: `${a} − ${b} = ?`, prompt: p("onlikdanOtibAyir"), answer: s, choices: choicesAround(s, 4, 0, max) };
};

export const gPlace = (): Activity => {
  const t = rnd(2, 9), u = rnd(1, 9), n = t * 10 + u;
  return { type: "eqn", text: `${n} = ${t * 10} + ?`, prompt: p("xonaAjrat"), answer: u, choices: choicesAround(u, 4, 0, 9) };
};

export const gRay = (max: number): Activity => {
  const step = pick([1, 2, 5, 10]);
  const start = step * rnd(0, Math.max(0, Math.floor((max - step * 6) / step)));
  const arr = Array.from({ length: 7 }, (_, i) => start + i * step);
  const hide = rnd(1, 5);
  return { type: "numray", arr, hide, prompt: p("nurTushib"), answer: arr[hide], choices: choicesAround(arr[hide], 4, 0, max) };
};

export const gParen = (): Activity => {
  const a = rnd(10, 40), b = rnd(3, 20), c = rnd(2, Math.min(9, b));
  const s = a + (b - c);
  return { type: "eqn", text: `${a} + (${b} − ${c}) = ?`, prompt: p("qavsAvval"), answer: s, choices: choicesAround(s, 4, 0, 80) };
};

export const gParenMul = (): Activity => {
  const a = rnd(2, 9), b = rnd(2, 5), c = rnd(1, 9), s = a * b + c;
  return { type: "eqn", text: `${a} × ${b} + ${c} = ?`, prompt: p("kopaytKeyinQosh"), answer: s, choices: choicesAround(s, 4, 0, 60) };
};

export const gLetter = (): Activity => {
  const L = pick(["a", "b", "x", "y"]), v = rnd(2, 20), c = rnd(3, 30);
  return { type: "eqn", text: `${L} + ${c},   ${L} = ${v}`, prompt: p("harfQoy", { L, v }), answer: v + c, choices: choicesAround(v + c, 4, 0, 60) };
};

export const gEqx = (): Activity => {
  const kind = pick(["add", "sub", "mul"] as const);
  if (kind === "mul") {
    const a = rnd(2, 9), k = rnd(2, 9);
    return { type: "eqn", text: `x × ${a} = ${a * k}`, prompt: p("nomalumKopaytuvchi"), answer: k, choices: choicesAround(k, 4, 1, 10) };
  }
  const a = rnd(5, 40), s = a + rnd(5, 40);
  if (kind === "add") {
    const x = s - a;
    return { type: "eqn", text: `x + ${a} = ${s}`, prompt: p("nomalumQoshiluvchi"), answer: x, choices: choicesAround(x, 4, 0, 60) };
  }
  return { type: "eqn", text: `x − ${a} = ${s - a}`, prompt: p("nomalumKamayuvchi"), answer: s, choices: choicesAround(s, 4, 0, 90) };
};

/**
 * Ulush nomlari. `n` — JAVOB TUGMASIDA turadigan so'z, shuning uchun u
 * funksiya orqali olinadi: doimiy qiymat bo'lsa modul yuklangan paytdagi
 * tilda qotib qolardi.
 */
const fracs = () => [
  { p: 2, n: p("jYarmi"), t: "1/2" },
  { p: 3, n: p("jUchdanBiri"), t: "1/3" },
  { p: 4, n: p("jChoragi"), t: "1/4" },
];

export const gFrac = (): Activity => {
  const FRACS = fracs();
  const f = pick(FRACS);
  return { type: "frac", parts: f.p, shaded: 1, prompt: p("ulushNima"), answer: f.n, choices: shuffle(FRACS.map((x) => x.n)) };
};

export const gFracNum = (): Activity => {
  const f = pick(fracs()), k = rnd(2, 9), tot = f.p * k;
  return { type: "eqn", text: p("txtQismi", { tot, t: f.t }), prompt: p("ulushBol", { tot, p: f.p }), answer: k, choices: choicesAround(k, 4, 1, 12) };
};

export const gPerim = (): Activity => {
  const w = rnd(2, 9), h = rnd(2, 9), sq = Math.random() < 0.35;
  const W = w, H = sq ? w : h, P = 2 * (W + H);
  return { type: "perim", w: W, h: H, answer: P, prompt: sq ? p("perimKvadrat") : p("perimTortburchak"), choices: choicesAround(P, 4, 4, 40) };
};

export const gArea = (): Activity => {
  const w = rnd(2, 6), h = rnd(2, 5);
  return { type: "area", w, h, answer: w * h, prompt: p("katakSana"), choices: choicesAround(w * h, 4, 1, 36) };
};

export const gShape = (): Activity => {
  const keys = Object.keys(SHAPES) as ShapeKey[];
  const k = pick(keys);
  const others = shuffle(keys.filter((x) => x !== k)).slice(0, 3);
  return { type: "shapeName", shape: k, prompt: p("shaklNomiSavol"), answer: shaklNomi(k), choices: shuffle([k, ...others]).map(shaklNomi) };
};

export const gCorners = (): Activity => {
  const keys = Object.keys(SHAPES) as ShapeKey[];
  const k = pick(keys);
  return { type: "corners", shape: k, prompt: p("burchakSoni"), answer: SHAPES[k].corners, choices: shuffle([0, 3, 4, 5]) };
};

export const gMm = (): Activity => {
  const cm = rnd(1, 9);
  if (Math.random() < 0.5)
    return { type: "eqn", text: p("txtSmMm", { n: cm }), prompt: p("smMm"), answer: cm * 10, choices: choicesAround(cm * 10, 4, 10, 100) };
  return { type: "eqn", text: p("txtMmSm", { n: cm * 10 }), prompt: p("mmSm"), answer: cm, choices: choicesAround(cm, 4, 1, 10) };
};

export const gClock = (): Activity => {
  const h = rnd(1, 12), m = pick([0, 0, 15, 30, 45]);
  const txt = `${h}:${String(m).padStart(2, "0")}`;
  const set = new Set<string>([txt]);
  while (set.size < 4) set.add(`${rnd(1, 12)}:${String(pick([0, 15, 30, 45])).padStart(2, "0")}`);
  return { type: "clock", h, m, prompt: p("soatNecha"), answer: txt, choices: shuffle([...set]) };
};

export const gTime = (): Activity => {
  const q = pick([
    { t: "uSoatMinut", a: 60, lo: 10, hi: 100 },
    { t: "uSutkaSoat", a: 24, lo: 10, hi: 40 },
    { t: "uHaftaKun", a: 7, lo: 1, hi: 14 },
    { t: "uYilOy", a: 12, lo: 5, hi: 20 },
    { t: "uYarimSoat", a: 30, lo: 10, hi: 60 },
  ] as const);
  return { type: "eqn", text: p(q.t), prompt: p("vaqtBirlik"), answer: q.a, choices: choicesAround(q.a, 4, q.lo, q.hi) };
};

const COL_L = ["A", "B", "C", "D"];
export const gCoord = (): Activity => {
  const w = 4, h = 3, cx = rnd(0, w - 1), cy = rnd(0, h - 1), e = pick(OBJS);
  const cell = COL_L[cx] + (cy + 1);
  const set = new Set<string>([cell]);
  while (set.size < 4) set.add(COL_L[rnd(0, w - 1)] + rnd(1, h));
  return { type: "coord", w, h, cx, cy, emoji: e, prompt: p("katakQaysi", { nom: B(objName(e)) }), answer: cell, choices: shuffle([...set]) };
};

export const gData = (): Activity => {
  const rows = shuffle([...OBJS]).slice(0, 3).map((emoji) => ({ emoji, n: rnd(2, 7) }));
  const top = rows.reduce((a, b) => (b.n > a.n ? b : a));
  return { type: "data", rows, prompt: p("jadvalKop", { nom: objName(top.emoji) }), answer: top.n, choices: choicesAround(top.n, 4, 1, 9) };
};

/* ==================== 3–4-sinf uchun umumiy ==================== */

export const g3MulBig = (): Activity => {
  const a = rnd(11, 99), b = rnd(2, 9), s = a * b;
  return { type: "eqn", text: `${a} × ${b} = ?`, prompt: p("kopXonaliKopaytir"), answer: s, choices: choicesAround(s, 4, 0, s + 40) };
};

export const g3DivBig = (): Activity => {
  const b = rnd(2, 9), k = rnd(11, 99), a = b * k;
  return { type: "eqn", text: `${a} ÷ ${b} = ?`, prompt: p("kopXonaliBol"), answer: k, choices: choicesAround(k, 4, 0, k + 20) };
};

export const g3Rem = (): Activity => {
  const b = rnd(3, 9), k = rnd(2, 9), r = rnd(1, b - 1), a = b * k + r;
  return { type: "eqn", text: `${a} ÷ ${b} = ${k}   ${p("txtQoldiq")} ?`, prompt: p("qoldiqTop"), answer: r, choices: pc(r, [r + 1, r - 1, b]) };
};

export const g3Len = (): Activity => {
  const q = pick([["uMSm", 100, [10, 1000, 50]], ["uDmSm", 10, [1, 100, 20]],
    ["uKmM", 1000, [100, 10000, 500]], ["uMDm", 10, [1, 100, 5]], ["uSmMm", 10, [1, 100, 5]]] as const);
  return { type: "eqn", text: p(q[0]), prompt: p("uzunlikBirlik"), answer: q[1], choices: pc(q[1], [...q[2]]) };
};

export const g3Mass = (): Activity => {
  const q = pick([["uKgG", 1000, [100, 10000, 500]], ["uTKg", 1000, [100, 10000, 500]],
    ["uSentnerKg", 100, [10, 1000, 50]]] as const);
  return { type: "eqn", text: p(q[0]), prompt: p("massaBirlik"), answer: q[1], choices: pc(q[1], [...q[2]]) };
};

const FR: [number, string][] = [[2, "1/2"], [3, "1/3"], [4, "1/4"], [6, "1/6"], [8, "1/8"]];
export const gFracCmp = (): Activity => {
  const x = pick(FR); let y = pick(FR);
  while (y[0] === x[0]) y = pick(FR);
  const big = x[0] < y[0] ? x : y;
  return { type: "eqn", text: `${x[1]}   ${p("txtVa")}   ${y[1]}`, prompt: p("ulushKatta"), answer: big[1], choices: pcS(big[1], [x[1], y[1]], ["1/2", "1/3", "1/4", "1/5", "1/6", "1/8"]) };
};

/* ==================== 3-sinf ==================== */

export const g3Compose = (): Activity => {
  const h = rnd(1, 9), t = rnd(0, 9), u = rnd(0, 9), n = h * 100 + t * 10 + u;
  return { type: "eqn", text: p("txtXonaUch", { h, t, u }), prompt: p("xonadanYasa"), answer: n, choices: choicesAround(n, 4, 100, 999) };
};

export const g3Split = (): Activity => {
  const h = rnd(1, 9), t = rnd(1, 9), u = rnd(1, 9), n = h * 100 + t * 10 + u;
  const w = pick(["h", "t", "u"] as const);
  if (w === "h") return { type: "eqn", text: p("txtYuzlikSoni", { n }), prompt: p("uchXonaliAjrat"), answer: h, choices: pc(h, [t, u, h + 1]) };
  if (w === "t") return { type: "eqn", text: p("txtOnlarXona", { n }), prompt: p("onlarRaqami"), answer: t, choices: pc(t, [h, u, t + 1]) };
  return { type: "eqn", text: p("txtBirlarXona", { n }), prompt: p("birlarRaqami"), answer: u, choices: pc(u, [h, t, u + 1]) };
};

export const g3Cmp = (): Activity => {
  const a = rnd(101, 999); let b = rnd(101, 999);
  if (a === b) b++;
  const big = Math.max(a, b);
  return { type: "eqn", text: `${a}   ${p("txtVa")}   ${b}`, prompt: p("kattasiniTanla"), answer: big, choices: pc(big, [Math.min(a, b), big + rnd(1, 60), big - rnd(1, 60)]) };
};

export const g3Round = (): Activity => {
  const n = rnd(11, 989), r = Math.round(n / 10) * 10;
  return { type: "eqn", text: `${n} ≈ ?   ${p("txtOnlikkacha")}`, prompt: p("onlikkachaYaxlit"), answer: r, choices: pc(r, [r - 10, r + 10, r + 20]) };
};

export const g3Round100 = (): Activity => {
  const n = rnd(150, 949), r = Math.round(n / 100) * 100;
  return { type: "eqn", text: `${n} ≈ ?   ${p("txtYuzlikkacha")}`, prompt: p("yuzlikkachaYaxlit"), answer: r, choices: pc(r, [r - 100, r + 100, r + 200]) };
};

export const g3Order = (): Activity => {
  const b = rnd(2, 9), c = rnd(2, 9), op = pick(["+", "−"] as const), a = rnd(b * c + 1, 90);
  const s = op === "+" ? a + b * c : a - b * c;
  return { type: "eqn", text: `${a} ${op} ${b} × ${c} = ?`, prompt: p("kopaytKeyinQoshAyir"), answer: s, choices: choicesAround(s, 4, 0, s + 30) };
};

export const g3OrderDiv = (): Activity => {
  const b = rnd(2, 9), k = rnd(2, 9), a = rnd(5, 60), s = a + k;
  return { type: "eqn", text: `${a} + ${b * k} ÷ ${b} = ?`, prompt: p("bolKeyinQosh"), answer: s, choices: choicesAround(s, 4, 0, s + 25) };
};

/* ==================== 4-sinf ==================== */

export const g4Compose = (): Activity => {
  const th = rnd(1, 9), h = rnd(0, 9), t = rnd(0, 9), u = rnd(0, 9);
  const n = th * 1000 + h * 100 + t * 10 + u;
  return { type: "eqn", text: p("txtXonaTort", { th, h, t, u }), prompt: p("xonalardanYasa"), answer: n, choices: choicesAround(n, 4, 1000, 9999) };
};

export const g4Class = (): Activity => {
  const n = rnd(1000, 999999), th = Math.floor(n / 1000);
  return { type: "eqn", text: p("txtMinglikSoni", { n }), prompt: p("minglarSinfi"), answer: th, choices: pc(th, [th + 1, th - 1, n % 1000]) };
};

export const g4Cmp = (): Activity => {
  const a = rnd(1000, 99999); let b = rnd(1000, 99999);
  if (a === b) b++;
  const big = Math.max(a, b);
  return { type: "eqn", text: `${a}   ${p("txtVa")}   ${b}`, prompt: p("xonalarSolishtir"), answer: big, choices: pc(big, [Math.min(a, b), big + rnd(1, 300), big - rnd(1, 300)]) };
};

export const g4Round = (): Activity => {
  const n = rnd(1050, 98999), r = Math.round(n / 1000) * 1000;
  return { type: "eqn", text: `${n} ≈ ?   ${p("txtMinglikkacha")}`, prompt: p("minglikkachaYaxlit"), answer: r, choices: pc(r, [r - 1000, r + 1000, r + 2000]) };
};

export const g4Round100 = (): Activity => {
  const n = rnd(1150, 98949), r = Math.round(n / 100) * 100;
  return { type: "eqn", text: `${n} ≈ ?   ${p("txtYuzlikkacha")}`, prompt: p("yuzlikkachaYaxlit2"), answer: r, choices: pc(r, [r - 100, r + 100, r + 200]) };
};

export const g4Mul2 = (): Activity => {
  const a = rnd(12, 99), b = rnd(11, 99), s = a * b;
  return { type: "eqn", text: `${a} × ${b} = ?`, prompt: p("ikkiXonaliKopaytir"), answer: s, choices: choicesAround(s, 4, 0, s + 150) };
};

export const g4MulBig = (): Activity => {
  const a = rnd(101, 999), b = rnd(2, 9), s = a * b;
  return { type: "eqn", text: `${a} × ${b} = ?`, prompt: p("uchXonaliKopaytir"), answer: s, choices: choicesAround(s, 4, 0, s + 80) };
};

export const g4Mul10 = (): Activity => {
  const a = rnd(12, 99), b = pick([10, 20, 30, 40, 50, 100, 200, 300]), s = a * b;
  return { type: "eqn", text: `${a} × ${b} = ?`, prompt: p("yumaloqKopaytir"), answer: s, choices: pc(s, [s / 10, s * 10, s + b]) };
};

export const g4DivLong = (): Activity => {
  const b = rnd(11, 25), k = rnd(4, 40), a = b * k;
  return { type: "eqn", text: `${a} ÷ ${b} = ?`, prompt: p("ikkiXonaliBol"), answer: k, choices: choicesAround(k, 4, 0, k + 20) };
};

export const g4Order = (): Activity => {
  const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9);
  // Ayirishda kamayuvchi ATAYLAB ko'paytmadan katta olinadi: bu yoshda
  // manfiy son o'tilmagan, "20 − 9 × 9" esa −61 berib qo'yardi.
  const kamayuvchi = (Math.floor((b * c) / 10) + rnd(1, 4)) * 10;
  const k = pick([
    { t: `(${a} + ${b}) × ${c} = ?`, v: (a + b) * c },
    { t: `${a} × ${b} + ${a} × ${c} = ?`, v: a * b + a * c },
    { t: `${a * c} ÷ ${a} + ${b} = ?`, v: c + b },
    { t: `${kamayuvchi} − ${b} × ${c} = ?`, v: kamayuvchi - b * c },
  ]);
  return { type: "eqn", text: k.t, prompt: p("amallarTartibi"), answer: k.v, choices: choicesAround(k.v, 4, 0, Math.abs(k.v) + 30) };
};

export const g4FracAdd = (): Activity => {
  const d = pick([4, 5, 6, 7, 8, 9]), n1 = rnd(1, d - 2), n2 = rnd(1, d - n1), s = n1 + n2;
  return { type: "eqn", text: `${n1}/${d} + ${n2}/${d} = ?/${d}`, prompt: p("kasrQosh"), answer: s, choices: pc(s, [s + 1, s - 1, d]) };
};

export const g4FracSub = (): Activity => {
  const d = pick([4, 5, 6, 7, 8, 9]), n1 = rnd(2, d - 1), n2 = rnd(1, n1 - 1), s = n1 - n2;
  return { type: "eqn", text: `${n1}/${d} − ${n2}/${d} = ?/${d}`, prompt: p("kasrAyir"), answer: s, choices: pc(s, [s + 1, s - 1, n1]) };
};

/** w: "s" masofa, "v" tezlik, "t" vaqt; berilmasa — tasodifiy. */
export const g4Speed = (w?: "s" | "v" | "t"): Activity => {
  const v = pick([40, 50, 60, 70, 80, 90]), t = rnd(2, 6), s = v * t;
  const which = w ?? pick(["s", "v", "t"] as const);
  if (which === "s") return { type: "eqn", text: p("txtTezlikS", { v, t }), prompt: p("masofaF"), answer: s, choices: pc(s, [v + t, s + v, v * (t + 1)]) };
  if (which === "v") return { type: "eqn", text: p("txtTezlikV", { s, t }), prompt: p("tezlikF"), answer: v, choices: pc(v, [s - t, v + 10, v - 10]) };
  return { type: "eqn", text: p("txtTezlikT", { s, v }), prompt: p("vaqtF"), answer: t, choices: pc(t, [t + 1, t + 2, t + 3]) };
};

export const g4Area = (): Activity => {
  const w = rnd(3, 12), h = rnd(3, 12), s = w * h;
  return { type: "eqn", text: p("txtTomonlari", { w, h }), prompt: p("yuzaF"), answer: s, choices: pc(s, [2 * (w + h), s + w, s - h]) };
};

export const g4AreaSide = (): Activity => {
  const w = rnd(3, 12), h = rnd(3, 12), s = w * h;
  return { type: "eqn", text: p("txtYuzaTomon", { s, w }), prompt: p("tomonF"), answer: h, choices: pc(h, [w, s - w, h + 2]) };
};

export const g4Units = (): Activity => {
  const q = pick([["uKmM", 1000, [100, 10000, 500]], ["uTKg", 1000, [100, 10000, 500]],
    ["uDm2Sm2", 100, [10, 1000, 50]], ["uM2Dm2", 100, [10, 1000, 50]],
    ["uArM2", 100, [10, 1000, 50]], ["uKgG", 1000, [100, 10000, 500]]] as const);
  return { type: "eqn", text: p(q[0]), prompt: p("kattalikBirlik"), answer: q[1], choices: pc(q[1], [...q[2]]) };
};

export const g4TimeBig = (): Activity => {
  const q = pick([["uAsrYil", 100, [10, 1000, 50]], ["uSutkaSoat", 24, [12, 48, 36]],
    ["uYilOy", 12, [10, 24, 6]], ["uSoatMinut", 60, [30, 90, 120]],
    ["uMinutSekund", 60, [30, 90, 120]], ["uHaftaKun", 7, [5, 14, 10]]] as const);
  return { type: "eqn", text: p(q[0]), prompt: p("vaqtBirlik"), answer: q[1], choices: pc(q[1], [...q[2]]) };
};

export type { Gen };
