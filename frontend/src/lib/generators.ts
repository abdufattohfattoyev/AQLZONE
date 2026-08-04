/**
 * Aql Zone — savol generatorlari.
 *
 * Har biri chaqirilganda YANGI savol yasaydi, shuning uchun bola darsni
 * qayta o'ynasa sonlar boshqacha bo'ladi. Barchasi sof funksiya: tashqi
 * holatga tegmaydi, faqat tasodifiy sonlarga tayanadi.
 *
 * Manba: "Matematika" 1–6-sinf darsliklari (Respublika ta'lim markazi,
 * B. Q. Xaydarov — 5-sinf, M. A. Mirzaxmedov va boshq. — 6-sinf).
 */
import { choicesAround, pc, pcS, pcZ, pick, rnd, shuffle } from "./rnd";
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

/* ==================== 5–6-sinf: umumiy yordamchilar ====================
 *
 * Yuqori sinflarda javob endi har doim ham BUTUN SON emas: kasr ("3/4"),
 * aralash son ("2 1/2"), o'nli kasr ("0,75") va manfiy son ham javob
 * bo'la oladi. Javob `String(tanlangan) === String(answer)` bilan
 * tekshirilgani uchun (`screens/Lesson.tsx`) matn javob ham xuddi son
 * kabi ishlaydi — faqat matn HAR DOIM bir xil ko'rinishda yasalishi
 * shart, aks holda to'g'ri javob "boshqacha yozilgani" uchun xato
 * hisoblanardi. Quyidagi uchta yasovchi shu yagona ko'rinishni beradi.
 */

const gcd2 = (a: number, b: number): number => (b === 0 ? a : gcd2(b, a % b));
const lcm2 = (a: number, b: number) => (a / gcd2(a, b)) * b;

/** Kasr matni, doim qisqartirilgan: (6,8) → "3/4", (8,4) → "2". */
const fr = (n: number, d: number): string => {
  const g = gcd2(Math.abs(n), Math.abs(d)) || 1;
  const a = n / g, b = d / g;
  return b === 1 ? String(a) : `${a}/${b}`;
};

/** Aralash son matni: (2,3,4) → "2 3/4", (2,0,4) → "2". */
const mx = (w: number, n: number, d: number): string => (n === 0 ? String(w) : `${w} ${fr(n, d)}`);

/**
 * O'nli kasr matni. Nuqta emas, VERGUL — darsliklarda shunday yoziladi.
 *
 * `toFixed` dan keyin ortiqcha nollar kesiladi, lekin faqat verguldan
 * KEYIN: "10.0000" da hammasini kessak "1" bo'lib qolardi.
 */
const dc = (x: number, d = 4): string =>
  (Math.round(x * 10 ** d) / 10 ** d)
    .toFixed(d)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "")
    .replace(".", ",");

/** O'nli kasr javobi uchun variantlar — yaqin qiymatlardan. */
const dcPick = (x: number, farq: number[]) => pcS(dc(x), farq.map((f) => dc(x + f)), []);

/**
 * Bitta kasr xonali son, oxirgi raqami ATAYLAB nol emas.
 *
 * Busiz "4,0 × 3,0" chiqib qolardi: ekranda u "4 × 3" bo'lib ko'rinadi
 * va o'nli kasr darsi to'satdan oddiy ko'paytirishga aylanardi.
 */
const d1 = (lo: number, hi: number): number => {
  const n = rnd(lo, hi);
  return (n % 10 === 0 ? n + rnd(1, 9) : n) / 10;
};

/**
 * Butun sonning matn ko'rinishi. Minus — TIPOGRAFIK "−", defis emas.
 *
 * Savol matni "−18 + 7 = ?" deb yozilgan, javob tugmasi esa son bo'lgani
 * uchun brauzer uni "-11" qilib chizardi: bitta ekranda ikki xil chiziq
 * turib, tugma savolning javobi emasdek ko'rinardi.
 */
const iz = (n: number): string => (n < 0 ? `−${-n}` : String(n));

/** Butun son javobi: javob ham, variantlar ham bir xil ko'rinishda. */
const zPick = (c: number, xato: number[]) => ({ answer: iz(c), choices: pcZ(c, xato).map(iz) });

/** Ikki sonni "5 va 8" ko'rinishida — tilga qarab "5 и 8". */
const va = (a: number | string, b: number | string) => `${a} ${p("txtVa")} ${b}`;

const USTKI = ["", "", "²", "³", "⁴", "⁵", "⁶"];

/* ==================== 5-sinf ====================
 * Manba: B. Q. Xaydarov, "Matematika 5-sinf", 1- va 2-qism (2020).
 *
 * Bu yerda savol matni ATAYLAB qisqa — formula ko'rinishida. Sabab
 * ekranda: savol 34px shriftda chiziladi (`components/QuestionView.tsx`)
 * va uzun matnli masala telefon ekranini to'ldirib yuborardi. Shuning
 * uchun masalaning SHARTI qisqa yozuvda beriladi, uni qanday yechish
 * esa `prompt` da — Aql aynan shuni aytadi va ovoz ham shuni o'qiydi.
 */

/* ---------- I bob. Natural sonlarni qo'shish va ayirish ---------- */

export const g5Natural = (): Activity => {
  const k = pick(["keyingi", "oldingi", "kichik"] as const);
  if (k === "kichik")
    return { type: "eqn", text: p("txtEngKichikNatural"), prompt: p("naturalSon"), answer: 1, choices: pc(1, [0, 2, 10]) };
  const n = rnd(1000, 99999);
  if (k === "keyingi")
    return { type: "eqn", text: p("txtKeyingiSon", { n }), prompt: p("naturalSon"), answer: n + 1, choices: pc(n + 1, [n, n - 1, n + 2]) };
  return { type: "eqn", text: p("txtOldingiSon", { n }), prompt: p("naturalSon"), answer: n - 1, choices: pc(n - 1, [n, n + 1, n - 2]) };
};

export const g5Cmp = (): Activity => {
  const a = rnd(10000, 999999), b = Math.max(1, a + pick([-1, 1]) * rnd(1, 9000));
  const katta = Math.max(a, b), kichik = Math.min(a, b);
  return { type: "eqn", text: va(a, b), prompt: p("kattaSonSolishtir"), answer: katta, choices: pc(katta, [kichik, katta + rnd(1, 500), kichik - rnd(1, 500)]) };
};

export const g5Round = (): Activity => {
  const q = pick([[10, "txtOnlikkacha"], [100, "txtYuzlikkacha"], [1000, "txtMinglikkacha"]] as const);
  const n = rnd(1200, 98000), r = Math.round(n / q[0]) * q[0];
  return { type: "eqn", text: `${n} ≈ ?   ${p(q[1])}`, prompt: p("yaxlitla"), answer: r, choices: pc(r, [r - q[0], r + q[0], r + 2 * q[0]]) };
};

export const g5Add = (): Activity => {
  const a = rnd(1200, 89000), b = rnd(1200, 89000), s = a + b;
  return { type: "eqn", text: `${a} + ${b} = ?`, prompt: p("naturalQosh"), answer: s, choices: pc(s, [s + 10, s - 100, s + 1000]) };
};

export const g5Sub = (): Activity => {
  const a = rnd(20000, 99000), b = rnd(1200, a - 1000), s = a - b;
  return { type: "eqn", text: `${a} − ${b} = ?`, prompt: p("naturalAyir"), answer: s, choices: pc(s, [s + 10, s - 100, s + 1000]) };
};

export const g5Expr = (): Activity => {
  const L = pick(["a", "b", "x", "y", "m", "n"]);
  const v = rnd(5, 40), k = rnd(2, 9);
  const c = rnd(5, k * v);
  const q = pick([
    { t: `${k}${L} + ${c}`, r: k * v + c },
    { t: `${k}${L} − ${c}`, r: k * v - c },
    { t: `${c} + ${L} × ${k}`, r: c + v * k },
  ]);
  return { type: "eqn", text: `${q.t},   ${L} = ${v}`, prompt: p("harfQoy", { L, v }), answer: q.r, choices: choicesAround(q.r, 4, 0, q.r + 30) };
};

export const g5Eq = (): Activity => {
  const kind = pick(["qosh", "ayir", "kamay", "kop", "bol"] as const);
  const a = rnd(6, 40), x = rnd(6, 60);
  if (kind === "qosh")
    return { type: "eqn", text: `x + ${a} = ${x + a}`, prompt: p("nomalumQoshiluvchi"), answer: x, choices: choicesAround(x, 4, 0, x + 25) };
  if (kind === "ayir")
    return { type: "eqn", text: `x − ${a} = ${x}`, prompt: p("nomalumKamayuvchi"), answer: x + a, choices: choicesAround(x + a, 4, 0, x + a + 25) };
  if (kind === "kamay")
    return { type: "eqn", text: `${x + a} − x = ${a}`, prompt: p("nomalumAyriluvchi"), answer: x, choices: choicesAround(x, 4, 0, x + 25) };
  const b = rnd(2, 12), k = rnd(3, 25);
  if (kind === "kop")
    return { type: "eqn", text: `x × ${b} = ${b * k}`, prompt: p("nomalumKopaytuvchi"), answer: k, choices: choicesAround(k, 4, 1, k + 12) };
  return { type: "eqn", text: `x ÷ ${b} = ${k}`, prompt: p("nomalumBolinuvchi"), answer: b * k, choices: pc(b * k, [k, b + k, b * k + b]) };
};

/* ---------- II bob. Ko'paytirish va bo'lish ---------- */

export const g5Mul = (): Activity => {
  const a = rnd(101, 999), b = rnd(11, 99), s = a * b;
  return { type: "eqn", text: `${a} × ${b} = ?`, prompt: p("kopXonaliKopaytir2"), answer: s, choices: pc(s, [s + a, s - a, s + 100]) };
};

export const g5Div = (): Activity => {
  const b = rnd(12, 48), k = rnd(12, 99), a = b * k;
  return { type: "eqn", text: `${a} ÷ ${b} = ?`, prompt: p("kopXonaliBol2"), answer: k, choices: choicesAround(k, 4, 1, k + 15) };
};

export const g5Rem = (): Activity => {
  const b = rnd(6, 19), k = rnd(20, 99), r = rnd(1, b - 1), a = b * k + r;
  if (Math.random() < 0.5)
    return { type: "eqn", text: `${a} ÷ ${b} = ${k}   ${p("txtQoldiq")} ?`, prompt: p("qoldiqTop"), answer: r, choices: pc(r, [r + 1, r - 1, b]) };
  return { type: "eqn", text: `${a} ÷ ${b} = ?   ${p("txtQoldiq")} ${r}`, prompt: p("qoldiqliBol"), answer: k, choices: choicesAround(k, 4, 1, k + 12) };
};

export const g5Fast = (): Activity => {
  if (Math.random() < 0.5) {
    // Juftini topib ko'paytirish: 25 × 17 × 4 = (25 × 4) × 17
    const juft = pick([[25, 4], [50, 2], [20, 5], [2, 5], [125, 8]] as const);
    const b = rnd(3, 19), s = juft[0] * juft[1] * b;
    return { type: "eqn", text: `${juft[0]} × ${b} × ${juft[1]} = ?`, prompt: p("qulayKopaytir"), answer: s, choices: pc(s, [s + b, s - b, juft[0] * juft[1] + b]) };
  }
  // Yumaloq songa to'ldirib qo'shish: 37 + 48 + 63 = (37 + 63) + 48
  const a = rnd(21, 79), c = 100 - (a % 100), b = rnd(15, 89), s = a + b + c;
  return { type: "eqn", text: `${a} + ${b} + ${c} = ?`, prompt: p("qulayQosh"), answer: s, choices: pc(s, [s + 10, s - 10, 100 + b]) };
};

export const g5Simplify = (): Activity => {
  const L = pick(["a", "b", "x", "y"]), a = rnd(3, 15), b = rnd(2, a - 1);
  if (Math.random() < 0.5)
    return { type: "eqn", text: `${a}${L} + ${b}${L} = ?${L}`, prompt: p("soddalashtir"), answer: a + b, choices: pc(a + b, [a - b, a * b, a + b + 1]) };
  return { type: "eqn", text: `${a}${L} − ${b}${L} = ?${L}`, prompt: p("soddalashtir"), answer: a - b, choices: pc(a - b, [a + b, a * b, a - b + 1]) };
};

export const g5Order4 = (): Activity => {
  const a = rnd(3, 12), b = rnd(2, 9), c = rnd(2, 9), d = rnd(2, 9);
  const q = pick([
    { t: `(${a} + ${b}) × ${c} − ${d} = ?`, v: (a + b) * c - d },
    { t: `${a} × ${b} + ${c} × ${d} = ?`, v: a * b + c * d },
    { t: `${(a + b) * c} ÷ ${c} + ${d} = ?`, v: a + b + d },
    { t: `${a} × (${b} + ${c}) ÷ ${b + c} = ?`, v: a },
  ]);
  return { type: "eqn", text: q.t, prompt: p("amallarTartibi"), answer: q.v, choices: choicesAround(q.v, 4, 0, q.v + 25) };
};

export const g5Pow = (): Activity => {
  const k = pick(["kv", "kub", "daraja"] as const);
  if (k === "kv") {
    const a = rnd(2, 20);
    return { type: "eqn", text: `${a}² = ?`, prompt: p("kvadratTop"), answer: a * a, choices: pc(a * a, [a * 2, a * a + a, a * a - a]) };
  }
  if (k === "kub") {
    const a = rnd(2, 10);
    return { type: "eqn", text: `${a}³ = ?`, prompt: p("kubTop"), answer: a ** 3, choices: pc(a ** 3, [a * 3, a * a, a ** 3 + a * a]) };
  }
  const a = pick([2, 3, 5]), n = rnd(2, 5), s = a ** n;
  return { type: "eqn", text: `${a}${USTKI[n]} = ?`, prompt: p("darajaTop"), answer: s, choices: pc(s, [a * n, s * a, s - a]) };
};

/* ---------- III bob. Matnli masalalar ---------- */

export const g5Part = (): Activity => {
  const k = rnd(2, 5), kichik = rnd(6, 30), jami = kichik * (k + 1);
  return { type: "eqn", text: p("txtQismlar", { jami, k }), prompt: p("qismlarMasala"), answer: kichik, choices: pc(kichik, [jami - kichik, kichik * k, kichik + k]) };
};

export const g5Money = (): Activity => {
  const narx = pick([1500, 2000, 2500, 3000, 4000, 5000]), n = rnd(3, 9), q = narx * n;
  if (Math.random() < 0.5)
    return { type: "eqn", text: p("txtNarxMiqdor", { narx, n }), prompt: p("narxMasala"), answer: q, choices: pc(q, [narx + n, q + narx, q - narx]) };
  return { type: "eqn", text: p("txtQiymatMiqdor", { q, n }), prompt: p("narxTop"), answer: narx, choices: pc(narx, [q - n, narx + 500, narx * 2]) };
};

export const g5Work = (): Activity => {
  const u = rnd(4, 20), t = rnd(3, 9), ish = u * t;
  if (Math.random() < 0.5)
    return { type: "eqn", text: p("txtIshUnum", { u, t }), prompt: p("ishMasala"), answer: ish, choices: pc(ish, [u + t, ish + u, ish - u]) };
  return { type: "eqn", text: p("txtIshVaqt", { ish, t }), prompt: p("unumTop"), answer: u, choices: pc(u, [ish - t, u + 2, u * 2]) };
};

export const g5Two = (): Activity => {
  const v1 = pick([60, 70, 80, 90]), v2 = pick([30, 40, 50]), t = rnd(2, 6);
  if (Math.random() < 0.5) {
    const s = (v1 + v2) * t;
    return { type: "eqn", text: p("txtIkkiQarshi", { v1, v2, t }), prompt: p("ikkiJismQarshi"), answer: s, choices: pc(s, [v1 + v2, v1 * t, (v1 - v2) * t]) };
  }
  const s = (v1 - v2) * t;
  return { type: "eqn", text: p("txtIkkiQuvish", { v1, v2, t }), prompt: p("ikkiJismQuvish"), answer: s, choices: pc(s, [v1 - v2, (v1 + v2) * t, v1 * t]) };
};

/* ---------- IV bob. Geometrik shakllar va yuza ---------- */

const BURCHAK_NOM = () => [p("jOtkir"), p("jTogri"), p("jOtmas"), p("jYoyiq")];

export const g5Angle = (): Activity => {
  const NOM = BURCHAK_NOM();
  const deg = pick([15, 30, 45, 60, 75, 89, 90, 100, 120, 135, 150, 179, 180]);
  const javob = deg < 90 ? NOM[0] : deg === 90 ? NOM[1] : deg < 180 ? NOM[2] : NOM[3];
  return { type: "eqn", text: `∠A = ${deg}°`, prompt: p("burchakTuri"), answer: javob, choices: shuffle([...NOM]) };
};

export const g5AngleSum = (): Activity => {
  const a = rnd(20, 70), b = rnd(20, 80);
  if (Math.random() < 0.5)
    return { type: "eqn", text: p("txtBurchakQosh", { a, b }), prompt: p("burchakYigindi"), answer: a + b, choices: pc(a + b, [a - b === 0 ? a : Math.abs(a - b), 180 - a - b, a + b + 10]) };
  return { type: "eqn", text: p("txtBurchakTold", { a }), prompt: p("burchakToldiruvchi"), answer: 180 - a, choices: pc(180 - a, [90 - a > 0 ? 90 - a : a, 180 + a, a]) };
};

export const g5Broken = (): Activity => {
  const n = rnd(3, 4);
  const arr = Array.from({ length: n }, () => rnd(2, 18));
  const s = arr.reduce((x, y) => x + y, 0);
  return { type: "eqn", text: `${arr.join(" + ")} = ?  (${p("txtSm")})`, prompt: p("siniqChiziq"), answer: s, choices: choicesAround(s, 4, 1, s + 12) };
};

export const g5PerimN = (): Activity => {
  const n = pick([3, 5, 6, 8]), a = rnd(3, 25), P = n * a;
  return { type: "eqn", text: p("txtKopburchak", { n, a }), prompt: p("kopburchakPerim"), answer: P, choices: pc(P, [n + a, P - a, P + a]) };
};

export const g5Rect = (): Activity => {
  const w = rnd(11, 40), h = rnd(5, 30), S = w * h;
  return { type: "eqn", text: p("txtTomonlari", { w, h }), prompt: p("yuzaF"), answer: S, choices: pc(S, [2 * (w + h), S + w, S - h]) };
};

export const g5AreaSum = (): Activity => {
  const a = rnd(3, 12), b = rnd(3, 12), c = rnd(3, 10), d = rnd(3, 10);
  const S = a * b + c * d;
  return { type: "eqn", text: p("txtIkkiTortburchak", { a, b, c, d }), prompt: p("murakkabYuza"), answer: S, choices: pc(S, [a * b, c * d, a * b - c * d]) };
};

export const g5AreaUnit = (): Activity => {
  const q = pick([["uSm2Mm2", 100, [10, 1000, 50]], ["uDm2Sm2", 100, [10, 1000, 50]],
    ["uM2Dm2", 100, [10, 1000, 50]], ["uArM2", 100, [10, 1000, 50]],
    ["uGaAr", 100, [10, 1000, 50]], ["uGaM2", 10000, [1000, 100000, 100]],
    ["uKm2M2", 1000000, [10000, 100000, 1000]]] as const);
  return { type: "eqn", text: p(q[0]), prompt: p("yuzBirlik"), answer: q[1], choices: pc(q[1], [...q[2]]) };
};

/* ---------- V bob. Oddiy kasrlar ---------- */

export const g5Frac = (): Activity => {
  // Bo'laklar soni 6 dan oshmaydi: `frac` chizuvchisi bo'laklarni bitta
  // qatorda, o'ralmasdan chizadi va 7-si telefon ekranidan chiqib ketardi.
  const d = rnd(3, 6), n = rnd(1, d - 1), t = `${n}/${d}`;
  return { type: "frac", parts: d, shaded: n, prompt: p("kasrQaysi"), answer: t, choices: pcS(t, [`${d - n}/${d}`, `${n}/${d + 1}`, `${n + 1}/${d + 1}`], ["1/2", "2/3", "3/4"]) };
};

export const g5FracCmp = (): Activity => {
  if (Math.random() < 0.5) {
    // Maxrajlar teng — surati katta kasr katta.
    const d = rnd(4, 9), n1 = rnd(1, d - 2), n2 = rnd(n1 + 1, d - 1);
    return { type: "eqn", text: va(`${n1}/${d}`, `${n2}/${d}`), prompt: p("maxrajTeng"), answer: `${n2}/${d}`, choices: pcS(`${n2}/${d}`, [`${n1}/${d}`], [`${n1}/${d + 1}`, `${n2}/${d + 2}`, `${n2}/${d + 1}`, "1/2", "2/3"]) };
  }
  // Suratlar teng — maxraji kichik kasr katta.
  const n = rnd(1, 4), d1 = rnd(n + 1, 6), d2 = rnd(d1 + 1, 12);
  return { type: "eqn", text: va(`${n}/${d1}`, `${n}/${d2}`), prompt: p("suratTeng"), answer: `${n}/${d1}`, choices: pcS(`${n}/${d1}`, [`${n}/${d2}`], [`${n + 1}/${d1}`, `${n}/${d1 + 1}`, `${n}/${d2 + 1}`, "1/2", "2/3"]) };
};

export const g5Proper = (): Activity => {
  const togri = Math.random() < 0.5;
  const d = rnd(3, 9);
  const n = togri ? rnd(1, d - 1) : rnd(d, d + 8);
  return { type: "eqn", text: `${n}/${d}`, prompt: p("togriNotogri"), answer: togri ? p("jTogriKasr") : p("jNotogriKasr"), choices: shuffle([p("jTogriKasr"), p("jNotogriKasr")]) };
};

export const g5FracAdd = (): Activity => {
  const d = rnd(4, 12), n1 = rnd(1, d - 1), n2 = rnd(1, d - 1), s = n1 + n2;
  const t = fr(s, d);
  return { type: "eqn", text: `${n1}/${d} + ${n2}/${d} = ?`, prompt: p("kasrQosh"), answer: t, choices: pcS(t, [`${s}/${d + d}`, fr(s + 1, d), fr(n1 * n2, d)], ["1", "2", `${d}/${s}`]) };
};

export const g5FracSub = (): Activity => {
  // Kamayuvchi maxrajga TENG bo'lmasin: "4/4 − 3/4" ekranda kasr
  // ayirishga o'xshamaydi, chunki 4/4 aslida butun bir.
  const d = rnd(4, 12), n1 = rnd(2, d - 1), n2 = rnd(1, n1 - 1), s = n1 - n2;
  const t = fr(s, d);
  return { type: "eqn", text: `${n1}/${d} − ${n2}/${d} = ?`, prompt: p("kasrAyir"), answer: t, choices: pcS(t, [`${s}/${d + d}`, fr(s + 1, d), fr(n1 + n2, d)], ["1/2", "1/3", "1/4", "2/3"]) };
};

export const g5DivFrac = (): Activity => {
  const b = rnd(3, 9), a = rnd(1, b - 1);
  const t = fr(a, b);
  return { type: "eqn", text: `${a} ÷ ${b} = ?`, prompt: p("bolishKasr"), answer: t, choices: pcS(t, [fr(b, a), `${a}/${b + 1}`, `${a + 1}/${b}`], ["1/2", "1/3", "2/3"]) };
};

export const g5Mixed = (): Activity => {
  const d = rnd(3, 9), w = rnd(1, 6), r = rnd(1, d - 1), n = w * d + r;
  const t = mx(w, r, d);
  return { type: "eqn", text: `${n}/${d} = ?`, prompt: p("aralashYoz"), answer: t, choices: pcS(t, [mx(w + 1, r, d), mx(w, r, d + 1), mx(w - 1 || w + 2, r, d)], [`${w}`, `${d}/${r}`]) };
};

export const g5MixedBack = (): Activity => {
  const d = rnd(3, 9), w = rnd(1, 6), r = rnd(1, d - 1), n = w * d + r;
  return { type: "eqn", text: `${mx(w, r, d)} = ?/${d}`, prompt: p("notogriYoz"), answer: n, choices: pc(n, [w + r, w * d, n + d]) };
};

export const g5MixedAdd = (): Activity => {
  const d = rnd(4, 10), w1 = rnd(1, 5), w2 = rnd(1, 5);
  const n1 = rnd(1, d - 2), n2 = rnd(1, d - n1 - 1);
  if (Math.random() < 0.5) {
    const t = mx(w1 + w2, n1 + n2, d);
    return { type: "eqn", text: `${mx(w1, n1, d)} + ${mx(w2, n2, d)} = ?`, prompt: p("aralashQoshAyir"), answer: t, choices: pcS(t, [mx(w1 + w2, n1 + n2, d + d), mx(w1 + w2 + 1, n1 + n2, d), mx(w1 * w2, n1 + n2, d)], [`${w1 + w2}`]) };
  }
  const katta = mx(w1 + w2, n1 + n2, d), t = mx(w2, n2, d);
  return { type: "eqn", text: `${katta} − ${mx(w1, n1, d)} = ?`, prompt: p("aralashQoshAyir"), answer: t, choices: pcS(t, [mx(w2 + 1, n2, d), mx(w2, n1, d), mx(w1, n2, d)], [`${w2}`, mx(w2, n2 + 1 < d ? n2 + 1 : 0, d), mx(w2 + 2, n2, d)]) };
};

export const g5FracPart = (): Activity => {
  const d = rnd(3, 8), a = rnd(1, d - 1), k = rnd(3, 15), n = d * k;
  const s = a * k;
  return { type: "eqn", text: p("txtSonQism", { n, t: fr(a, d) }), prompt: p("sonningQismi"), answer: s, choices: pc(s, [n - s, k, n / d + a]) };
};

/* ---------- VI bob. Fazoviy shakllar ---------- */

const FAZOVIY = () => [
  { t: "txtKubTarif", n: p("jKub") },
  { t: "txtParTarif", n: p("jParallelepiped") },
  { t: "txtSilindrTarif", n: p("jSilindr") },
  { t: "txtSharTarif", n: p("jShar") },
  { t: "txtKonusTarif", n: p("jKonus") },
  { t: "txtPiramidaTarif", n: p("jPiramida") },
] as const;

export const g5Solid = (): Activity => {
  const hammasi = FAZOVIY();
  const f = pick(hammasi);
  const boshqa = shuffle(hammasi.filter((x) => x.n !== f.n)).slice(0, 3).map((x) => x.n);
  return { type: "eqn", text: p(f.t), prompt: p("fazoviyShakl"), answer: f.n, choices: shuffle([f.n, ...boshqa]) };
};

export const g5CubeParts = (): Activity => {
  const q = pick([["txtYoqSoni", 6, [4, 8, 12]], ["txtQirraSoni", 12, [6, 8, 10]], ["txtUchSoni", 8, [6, 12, 4]]] as const);
  return { type: "eqn", text: p(q[0]), prompt: p("kubElement"), answer: q[1], choices: pc(q[1], [...q[2]]) };
};

export const g5Volume = (): Activity => {
  const a = rnd(2, 12), b = rnd(2, 12), c = rnd(2, 9), V = a * b * c;
  return { type: "eqn", text: p("txtQirralari", { a, b, c }), prompt: p("hajmF"), answer: V, choices: pc(V, [a + b + c, a * b, 2 * (a * b + b * c + a * c)]) };
};

export const g5CubeVol = (): Activity => {
  const a = rnd(2, 12);
  if (Math.random() < 0.5)
    return { type: "eqn", text: p("txtKubQirra", { a }), prompt: p("kubHajm"), answer: a ** 3, choices: pc(a ** 3, [a * 3, a * a, 6 * a * a]) };
  return { type: "eqn", text: p("txtKubHajm", { v: a ** 3 }), prompt: p("kubQirraTop"), answer: a, choices: pc(a, [a * 3, a * a, a + 1]) };
};

/* ---------- VII bob. O'nli kasrlar va foiz ---------- */

export const g5Dec = (): Activity => {
  const w = rnd(0, 9), n = rnd(1, 9);
  if (Math.random() < 0.5) {
    const t = dc(w + n / 10);
    return { type: "eqn", text: p("txtButunOndan", { w, n }), prompt: p("onliKasrYoz"), answer: t, choices: pcS(t, [dc(w + n / 100), dc(n + w / 10), dc(w + (n + 1) / 10)], ["0,5", "1,2"]) };
  }
  const d = pick([10, 100]), num = rnd(1, d - 1), t = dc(num / d);
  return { type: "eqn", text: `${num}/${d} = ?`, prompt: p("kasrdanOnli"), answer: t, choices: pcS(t, [dc(num / (d * 10)), dc((num * 10) / d), dc((num + 1) / d)], ["0,5", "0,25"]) };
};

export const g5DecCmp = (): Activity => {
  const a = d1(10, 985), b = d1(10, 985);
  const katta = Math.max(a, b), kichik = Math.min(a, b);
  if (katta === kichik) return g5DecCmp();
  return { type: "eqn", text: va(dc(a), dc(b)), prompt: p("onliTaqqosla"), answer: dc(katta), choices: pcS(dc(katta), [dc(kichik)], [dc(katta + 0.1), dc(kichik - 0.1), dc(katta + 1)]) };
};

export const g5DecAdd = (): Activity => {
  const a = d1(11, 895), b = d1(11, 895), s = (a * 10 + b * 10) / 10;
  return { type: "eqn", text: `${dc(a)} + ${dc(b)} = ?`, prompt: p("onliQosh"), answer: dc(s), choices: dcPick(s, [0.1, -0.1, 1]) };
};

export const g5DecSub = (): Activity => {
  const a = d1(200, 985), b = d1(11, 185), s = (a * 10 - b * 10) / 10;
  return { type: "eqn", text: `${dc(a)} − ${dc(b)} = ?`, prompt: p("onliAyir"), answer: dc(s), choices: dcPick(s, [0.1, -0.1, 1]) };
};

export const g5DecRound = (): Activity => {
  const x = rnd(105, 9995) / 100;
  if (Math.random() < 0.5) {
    const r = Math.round(x * 10) / 10;
    return { type: "eqn", text: `${dc(x)} ≈ ?   ${p("txtOndanBirgacha")}`, prompt: p("onliYaxlit"), answer: dc(r), choices: pcS(dc(r), [dc(r + 0.1), dc(r - 0.1), dc(Math.round(x))], [dc(r + 0.2), dc(r - 0.2)]) };
  }
  const r = Math.round(x);
  return { type: "eqn", text: `${dc(x)} ≈ ?   ${p("txtButungacha")}`, prompt: p("onliYaxlit"), answer: r, choices: pc(r, [r + 1, r - 1, r + 2]) };
};

export const g5DecMulN = (): Activity => {
  const a = d1(11, 245), b = rnd(2, 9), s = (a * 10 * b) / 10;
  // Chalg'ituvchilar — aynan shu darsning ikki tipik xatosi: vergulni
  // butunlay unutish (s × 10) va uni bir xona narigi qo'yish (s ÷ 10).
  return { type: "eqn", text: `${dc(a)} × ${b} = ?`, prompt: p("onliNaturalKopaytir"), answer: dc(s), choices: dcPick(s, [s * 9, -s * 0.9, 0.1]) };
};

export const g5DecDivN = (): Activity => {
  const b = rnd(2, 9), k = rnd(11, 250), a = (k * b) / 10, s = k / 10;
  return { type: "eqn", text: `${dc(a)} ÷ ${b} = ?`, prompt: p("onliNaturalBol"), answer: dc(s), choices: dcPick(s, [s * 9, 0.1, -0.1]) };
};

export const g5DecMul = (): Activity => {
  const a = d1(11, 95), b = d1(11, 95), s = (a * 10 * (b * 10)) / 100;
  return { type: "eqn", text: `${dc(a)} × ${dc(b)} = ?`, prompt: p("onliKopaytir"), answer: dc(s), choices: dcPick(s, [s * 9, -s * 0.9, 0.1]) };
};

export const g5DecDiv = (): Activity => {
  const b = d1(11, 45), k = rnd(2, 25), a = (b * 10 * k) / 10;
  return { type: "eqn", text: `${dc(a)} ÷ ${dc(b)} = ?`, prompt: p("onliBol"), answer: k, choices: pc(k, [k + 1, k - 1, k * 10]) };
};

export const g5Percent = (): Activity => {
  const f = pick([1, 2, 5, 10, 20, 25, 50, 75]), k = rnd(2, 20), n = k * 100;
  const s = (n * f) / 100;
  // Tipik xatolar: qolgan qismni aytish, foizni sonning o'ziga qo'shib
  // yuborish va vergulni bir xona narigi surish.
  return { type: "eqn", text: p("txtFoiz", { f, n }), prompt: p("foizTop"), answer: s, choices: pc(s, [n - s, s * 10, s + f]) };
};

export const g5PercentOf = (): Activity => {
  const f = pick([10, 20, 25, 40, 50, 60, 75, 80]), k = rnd(2, 20), n = k * 100;
  const qism = (n * f) / 100;
  return { type: "eqn", text: p("txtNechaFoiz", { qism, n }), prompt: p("nechaFoiz"), answer: f, choices: pc(f, [100 - f, f + 10, f > 20 ? f - 10 : f + 20]) };
};

/* ---------- VIII bob. Ma'lumotlar tahlili ---------- */

export const g5Mean = (): Activity => {
  const n = rnd(3, 4), o = rnd(4, 40);
  // Sonlar ATAYLAB o'rtacha atrofida yasaladi: yig'indi son soniga
  // bo'linsin va javob butun chiqsin — 5-sinfda o'rta arifmetik
  // kasr bo'lib chiqsa, mavzu emas, kasr qiyinligi tekshirilardi.
  const arr = Array.from({ length: n - 1 }, () => o + rnd(-3, 3));
  arr.push(o * n - arr.reduce((a, b) => a + b, 0));
  return { type: "eqn", text: `${shuffle(arr).join(",  ")}`, prompt: p("ortaArifmetik"), answer: o, choices: pc(o, [o + 1, o - 1, arr.reduce((a, b) => a + b, 0)]) };
};

export const g5DataRow = (): Activity => {
  const arr = Array.from({ length: rnd(4, 6) }, () => rnd(3, 60));
  const katta = Math.max(...arr), kichik = Math.min(...arr);
  if (katta === kichik) return g5DataRow();
  if (Math.random() < 0.5)
    return { type: "eqn", text: arr.join(",  "), prompt: p("qatorEngKatta"), answer: katta, choices: pc(katta, [kichik, katta - 1, katta + 1]) };
  return { type: "eqn", text: arr.join(",  "), prompt: p("qatorFarq"), answer: katta - kichik, choices: pc(katta - kichik, [katta, kichik, katta + kichik]) };
};

/* ==================== 6-sinf ====================
 * Manba: M. A. Mirzaxmedov va boshq., "Matematika 6" (O'qituvchi, 2017).
 *
 * Bu sinfda ikkita yangilik bor va ikkalasi ham javob ko'rinishiga
 * ta'sir qiladi: kasr endi har xil maxrajli (javob "7/12" bo'lishi
 * mumkin) va son endi MANFIY bo'lishi mumkin. Manfiy javoblar uchun
 * `pcZ` ishlatiladi — oddiy `pc` manfiy variantlarni tashlab yuboradi.
 */

/* ---------- I bob. Sonlarning bo'linish belgilari ---------- */

export const g6Divisor = (): Activity => {
  const n = pick([12, 18, 24, 30, 36, 40, 48, 60, 72, 90]);
  const bor: number[] = [];
  for (let i = 2; i < n; i++) if (n % i === 0) bor.push(i);
  const yoq: number[] = [];
  for (let i = 2; i < n && yoq.length < 12; i++) if (n % i !== 0) yoq.push(i);
  const javob = pick(bor);
  return { type: "eqn", text: p("txtBoluvchi", { n }), prompt: p("boluvchiQaysi"), answer: javob, choices: pc(javob, shuffle(yoq).slice(0, 3)) };
};

export const g6Multiple = (): Activity => {
  const n = rnd(3, 12), k = rnd(3, 9), javob = n * k;
  return { type: "eqn", text: p("txtKarrali", { n }), prompt: p("karraliQaysi"), answer: javob, choices: pc(javob, [javob + 1, javob - 1, javob + n - 1]) };
};

/** `d` — bo'linish belgisi tekshiriladigan son (2, 3, 5, 9, 10). */
export const g6Bolinish = (d: number) => (): Activity => {
  const k = rnd(4, 40), javob = d * k;
  const yoq = [javob + 1, javob - 1, javob + (d > 2 ? 2 : 1)].filter((x) => x % d !== 0);
  while (yoq.length < 3) { const x = rnd(20, 500); if (x % d !== 0 && !yoq.includes(x)) yoq.push(x); }
  return { type: "eqn", text: p("txtQaysiBolinadi", { d }), prompt: p("bolinishBelgisi"), answer: javob, choices: pc(javob, yoq.slice(0, 3)) };
};

const TUB = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
const MURAKKAB = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28, 33, 35, 39, 49];

export const g6Prime = (): Activity => {
  if (Math.random() < 0.5) {
    const javob = pick(TUB);
    return { type: "eqn", text: p("txtTubQaysi"), prompt: p("tubMurakkab"), answer: javob, choices: pc(javob, shuffle(MURAKKAB).slice(0, 3)) };
  }
  const tub = Math.random() < 0.5;
  const n = tub ? pick(TUB) : pick(MURAKKAB);
  return { type: "eqn", text: `${n} — ?`, prompt: p("tubMi"), answer: tub ? p("jTub") : p("jMurakkab"), choices: shuffle([p("jTub"), p("jMurakkab")]) };
};

export const g6Factor = (): Activity => {
  const f = pick([[2, 2, 3], [2, 3, 3], [2, 2, 5], [2, 3, 5], [3, 3, 5], [2, 2, 7], [2, 5, 5], [2, 2, 2, 3], [2, 2, 3, 3]] as const);
  const n = f.reduce((a, b) => a * b, 1);
  const t = f.join(" · ");
  const buz = (i: number, d: number) => f.map((x, j) => (j === i ? x + d : x)).join(" · ");
  return { type: "eqn", text: `${n} = ?`, prompt: p("tubKopaytuvchi"), answer: t, choices: pcS(t, [buz(0, 1), buz(f.length - 1, 2), buz(1, 2)], [`${n} · 1`, `2 · ${n / 2}`]) };
};

const EKUB_JUFT = [[12, 18], [16, 24], [20, 30], [24, 36], [18, 27], [28, 42], [15, 25], [36, 48], [30, 45], [14, 21]] as const;

export const g6Gcd = (): Activity => {
  const [a, b] = pick(EKUB_JUFT);
  const g = gcd2(a, b);
  return { type: "eqn", text: p("txtEKUB", { a, b }), prompt: p("ekubTop"), answer: g, choices: pc(g, [lcm2(a, b), g * 2, Math.abs(a - b)]) };
};

export const g6Lcm = (): Activity => {
  const a = rnd(3, 12), b = rnd(3, 12);
  const l = lcm2(a, b);
  return { type: "eqn", text: p("txtEKUK", { a, b }), prompt: p("ekukTop"), answer: l, choices: pc(l, [a * b, gcd2(a, b), l + a]) };
};

export const g6Coprime = (): Activity => {
  const ha = [[8, 15], [9, 16], [7, 12], [14, 25], [5, 18], [11, 24], [9, 20], [13, 21]] as const;
  const yoq = [[6, 9], [8, 12], [10, 15], [12, 18], [14, 21], [16, 20], [9, 15], [10, 25]] as const;
  const j = pick(ha), t = va(j[0], j[1]);
  const boshqa = shuffle([...yoq]).slice(0, 3).map((x) => va(x[0], x[1]));
  return { type: "eqn", text: p("txtQaysiOzaroTub"), prompt: p("ozaroTub"), answer: t, choices: shuffle([t, ...boshqa]) };
};

/* ---------- II bob. Har xil maxrajli kasrlar ---------- */

export const g6FracBase = (): Activity => {
  const a = rnd(1, 8), b = rnd(a + 1, 12), k = rnd(2, 6);
  return { type: "eqn", text: `${a}/${b} = ?/${b * k}`, prompt: p("kasrXossa"), answer: a * k, choices: pc(a * k, [a, a + k, b * k - a]) };
};

export const g6Reduce = (): Activity => {
  const a = rnd(1, 8), b = rnd(a + 1, 12), k = rnd(2, 9);
  const t = fr(a, b);
  return { type: "eqn", text: `${a * k}/${b * k} = ?`, prompt: p("kasrQisqartir"), answer: t, choices: pcS(t, [fr(b, a), `${a}/${b * k}`, `${a * k}/${b}`], ["1/2", "2/3", "3/4"]) };
};

export const g6Common = (): Activity => {
  const b = rnd(2, 9), d = rnd(2, 12), l = lcm2(b, d);
  return { type: "eqn", text: va(`1/${b}`, `1/${d}`), prompt: p("umumiyMaxraj"), answer: l, choices: pc(l, [b * d, b + d, gcd2(b, d)]) };
};

export const g6FracCmp = (): Activity => {
  const b = rnd(2, 9), d = rnd(2, 12);
  const a = rnd(1, b - 1 || 1), c = rnd(1, d - 1 || 1);
  if (a * d === c * b) return g6FracCmp();
  // Kasrlar QISQARGAN holda ko'rsatiladi: "3/6" darslikda hech qachon
  // shu ko'rinishda turmaydi va bola uni avval qisqartirishi kerakdek
  // tuyulardi — savol esa taqqoslash haqida.
  const katta = a * d > c * b ? fr(a, b) : fr(c, d);
  const kichik = a * d > c * b ? fr(c, d) : fr(a, b);
  if (katta === kichik) return g6FracCmp();
  return { type: "eqn", text: va(fr(a, b), fr(c, d)), prompt: p("harXilTaqqosla"), answer: katta, choices: pcS(katta, [kichik], [fr(a, d), fr(c, b), fr(a + 1, b + 1), fr(c + 1, d + 2), "1/2", "2/3", "3/5"]) };
};

export const g6FracAdd = (): Activity => {
  const b = rnd(2, 9), d = rnd(2, 9);
  const a = rnd(1, b - 1 || 1), c = rnd(1, d - 1 || 1);
  const l = lcm2(b, d), s = (a * l) / b + (c * l) / d;
  const t = fr(s, l);
  return { type: "eqn", text: `${fr(a, b)} + ${fr(c, d)} = ?`, prompt: p("harXilQosh"), answer: t, choices: pcS(t, [`${a + c}/${b + d}`, fr(s + 1, l), `${a + c}/${l}`], ["1", "1/2", "2"]) };
};

export const g6FracSub = (): Activity => {
  let b = rnd(2, 9), d = rnd(2, 9);
  let a = rnd(1, b - 1 || 1), c = rnd(1, d - 1 || 1);
  // Ayirish MANFIY chiqmasin: 6-sinfda kasr bobi manfiy sondan oldin keladi.
  if (a / b < c / d) { [a, b, c, d] = [c, d, a, b]; }
  const l = lcm2(b, d), s = (a * l) / b - (c * l) / d;
  if (s === 0) return g6FracSub();
  const t = fr(s, l);
  return { type: "eqn", text: `${fr(a, b)} − ${fr(c, d)} = ?`, prompt: p("harXilAyir"), answer: t, choices: pcS(t, [`${Math.abs(a - c)}/${b * d}`, fr(s + 1, l), `${s}/${l + 1}`], ["1/2", "1/3", "1/4"]) };
};

export const g6MixAdd = (): Activity => {
  const b = rnd(2, 6), d = rnd(2, 6), w1 = rnd(1, 5), w2 = rnd(1, 5);
  const a = rnd(1, b - 1 || 1), c = rnd(1, d - 1 || 1);
  const l = lcm2(b, d), s = (a * l) / b + (c * l) / d;
  const w = w1 + w2 + Math.floor(s / l), r = s % l;
  const t = mx(w, r, l);
  return { type: "eqn", text: `${mx(w1, a, b)} + ${mx(w2, c, d)} = ?`, prompt: p("aralashQosh"), answer: t, choices: pcS(t, [mx(w1 + w2, a + c, b + d), mx(w + 1, r, l), mx(w, r + 1, l)], [`${w}`, `${w + 1}`]) };
};

export const g6MixSub = (): Activity => {
  const b = rnd(2, 6), d = rnd(2, 6), w2 = rnd(1, 4);
  const a = rnd(1, b - 1 || 1), c = rnd(1, d - 1 || 1);
  const l = lcm2(b, d);
  // Kamayuvchi ATAYLAB ayriluvchidan yasaladi — natija doim musbat.
  const s2 = w2 * l + (c * l) / d, farq = rnd(1, 4) * l + (a * l) / b;
  const s1 = s2 + farq;
  const w1 = Math.floor(s1 / l), r1 = s1 % l;
  const t = mx(Math.floor(farq / l), farq % l, l);
  return { type: "eqn", text: `${mx(w1, r1, l)} − ${mx(w2, c, d)} = ?`, prompt: p("aralashAyir"), answer: t, choices: pcS(t, [mx(Math.floor(farq / l) + 1, farq % l, l), mx(w1 - w2, r1, l), mx(Math.floor(farq / l), farq % l, l + 1)], [`${Math.floor(farq / l)}`]) };
};

/* ---------- III bob. Kasrlarni ko'paytirish va bo'lish ---------- */

export const g6FracMul = (): Activity => {
  const b = rnd(2, 9), d = rnd(2, 9);
  const a = rnd(1, b - 1 || 1), c = rnd(1, d - 1 || 1);
  const t = fr(a * c, b * d);
  return { type: "eqn", text: `${fr(a, b)} × ${fr(c, d)} = ?`, prompt: p("kasrKopaytir"), answer: t, choices: pcS(t, [fr(a + c, b + d), fr(a * d, b * c), fr(a * c, b + d)], ["1/2", "1/4", "2/3"]) };
};

export const g6MixMul = (): Activity => {
  const b = rnd(2, 5), w = rnd(1, 4), a = rnd(1, b - 1 || 1), k = rnd(2, 9);
  const num = (w * b + a) * k;
  const t = mx(Math.floor(num / b), num % b, b);
  // Eng tipik xato — butunni ko'paytirib, kasrni tegmasdan qoldirish.
  return { type: "eqn", text: `${mx(w, a, b)} × ${k} = ?`, prompt: p("aralashKopaytir"), answer: t, choices: pcS(t, [mx(w * k, a, b), mx(Math.floor(num / b) + 1, num % b, b), mx(Math.floor(num / b), (num % b) + 1 < b ? (num % b) + 1 : 0, b)], [`${w * k}`, `${Math.floor(num / b)}`]) };
};

export const g6PartOf = (): Activity => {
  const d = rnd(3, 9), a = rnd(1, d - 1), k = rnd(3, 20), n = d * k, s = a * k;
  return { type: "eqn", text: p("txtSonQism", { n, t: fr(a, d) }), prompt: p("sonningQismi"), answer: s, choices: pc(s, [n - s, k, n * a]) };
};

export const g6Distrib = (): Activity => {
  const b = rnd(2, 6), d = rnd(2, 6), l = lcm2(b, d) * rnd(1, 4);
  const a = rnd(1, b - 1 || 1), c = rnd(1, d - 1 || 1);
  const s = (a * l) / b + (c * l) / d;
  return { type: "eqn", text: `(${fr(a, b)} + ${fr(c, d)}) × ${l} = ?`, prompt: p("taqsimotQonuni"), answer: s, choices: pc(s, [l, s + l, (a + c) * l]) };
};

export const g6Recip = (): Activity => {
  if (Math.random() < 0.5) {
    const b = rnd(2, 9), a = rnd(1, b - 1);
    const t = fr(b, a);
    return { type: "eqn", text: `${fr(a, b)}`, prompt: p("teskariSon"), answer: t, choices: pcS(t, [fr(a, b), fr(b, a + 1), fr(b + 1, a)], ["1", "2", "3", `${b}`]) };
  }
  const n = rnd(2, 12), t = `1/${n}`;
  return { type: "eqn", text: `${n}`, prompt: p("teskariSon"), answer: t, choices: pcS(t, [`${n}`, `1/${n + 1}`, `${n}/${n + 1}`], ["1/2", "1/3", "1"]) };
};

export const g6FracDiv = (): Activity => {
  const b = rnd(2, 9), d = rnd(2, 9);
  const a = rnd(1, b - 1 || 1), c = rnd(1, d - 1 || 1);
  const t = fr(a * d, b * c);
  return { type: "eqn", text: `${fr(a, b)} ÷ ${fr(c, d)} = ?`, prompt: p("kasrBol"), answer: t, choices: pcS(t, [fr(a * c, b * d), fr(b * c, a * d), fr(a, b * c)], ["1", "2", "1/2"]) };
};

export const g6WholeFrom = (): Activity => {
  const d = rnd(3, 9), a = rnd(1, d - 1), k = rnd(3, 20), n = d * k, qism = a * k;
  return { type: "eqn", text: p("txtQismdanSon", { qism, t: fr(a, d) }), prompt: p("qismdanSon"), answer: n, choices: pc(n, [qism, qism * d, n - qism]) };
};

/* ---------- IV bob. Nisbat va proporsiya ---------- */

export const g6Ratio = (): Activity => {
  const a = rnd(1, 9), b = rnd(1, 9), k = rnd(2, 9);
  if (a === b) return g6Ratio();
  const g = gcd2(a, b), t = `${a / g}:${b / g}`;
  return { type: "eqn", text: `${a * k}:${b * k}`, prompt: p("nisbatQisqartir"), answer: t, choices: pcS(t, [`${b / g}:${a / g}`, `${a * k}:${b}`, `${a}:${b * k}`], ["1:2", "2:3", "3:4"]) };
};

export const g6Prop = (): Activity => {
  const b = rnd(2, 9), k = rnd(2, 9), a = rnd(2, 9), d = b * k;
  const x = a * k;
  return { type: "eqn", text: `${a} : ${b} = x : ${d}`, prompt: p("proporsiyaHad"), answer: x, choices: pc(x, [a * b, d - a, x + b]) };
};

export const g6Direct = (): Activity => {
  const bir = pick([1500, 2000, 2500, 3000, 4500]), n1 = rnd(2, 6), n2 = rnd(7, 15);
  return { type: "eqn", text: p("txtTogriProp", { n1, s1: bir * n1, n2 }), prompt: p("togriProporsional"), answer: bir * n2, choices: pc(bir * n2, [bir * n1, bir * (n2 - 1), bir * n1 * n2]) };
};

export const g6Inverse = (): Activity => {
  // Ish hajmi 24 ga karrali: quyidagi ishchilar soniga qoldiqsiz bo'linadi.
  const ish = pick([24, 48, 72, 96]);
  const a = pick([2, 3, 4, 6]), b = pick([8, 12]);
  const t1 = ish / a, t2 = ish / b;
  return { type: "eqn", text: p("txtTeskariProp", { a, t1, b }), prompt: p("teskariProporsional"), answer: t2, choices: pc(t2, [t1, t1 * 2, t2 + 1]) };
};

export const g6Scale = (): Activity => {
  const m = pick([100, 500, 1000, 2000, 10000]), sm = rnd(2, 15);
  const metr = (sm * m) / 100;
  return { type: "eqn", text: p("txtMasshtab", { m, sm }), prompt: p("masshtab"), answer: metr, choices: pc(metr, [sm * m, metr * 10, metr * 100]) };
};

/* ---------- V–VII bob. Musbat va manfiy sonlar ---------- */

export const g6Sign = (): Activity => {
  const n = rnd(2, 40);
  const q = pick([["txtHaroratPast", -n], ["txtChuqurlik", -n], ["txtQarz", -n], ["txtHaroratYuqori", n]] as const);
  return { type: "eqn", text: p(q[0], { n }), prompt: p("musbatManfiy"), ...zPick(q[1], [-q[1], q[1] + 1, q[1] - 1]) };
};

export const g6Opp = (): Activity => {
  const n = rnd(1, 60) * pick([1, -1]);
  return { type: "eqn", text: iz(n), prompt: p("qaramaQarshi"), ...zPick(-n, [n, -n + 1, -n - 1]) };
};

export const g6Abs = (): Activity => {
  const n = rnd(1, 60) * pick([1, -1]);
  return { type: "eqn", text: `|${iz(n)}| = ?`, prompt: p("modulTop"), ...zPick(Math.abs(n), [-Math.abs(n), Math.abs(n) + 1, 0]) };
};

export const g6IntCmp = (): Activity => {
  const a = rnd(-60, 60), b = rnd(-60, 60);
  if (a === b) return g6IntCmp();
  const katta = Math.max(a, b);
  return { type: "eqn", text: va(iz(a), iz(b)), prompt: p("butunTaqqosla"), ...zPick(katta, [Math.min(a, b), -katta, katta + 1]) };
};

export const g6IntAdd = (): Activity => {
  const a = rnd(2, 40), b = rnd(2, 40), s = -(a + b);
  return { type: "eqn", text: `−${a} + (−${b}) = ?`, prompt: p("birXilIshoraQosh"), ...zPick(s, [a + b, -(a - b), s + 1]) };
};

export const g6IntAddMix = (): Activity => {
  const a = rnd(2, 60), b = rnd(2, 60), s = -a + b;
  return { type: "eqn", text: `−${a} + ${b} = ?`, prompt: p("harXilIshoraQosh"), ...zPick(s, [-(a + b), a + b, -s]) };
};

export const g6IntSub = (): Activity => {
  const a = rnd(2, 40), b = rnd(2, 40);
  if (Math.random() < 0.5) {
    const s = a + b;
    return { type: "eqn", text: `${a} − (−${b}) = ?`, prompt: p("butunAyir"), ...zPick(s, [a - b, -a - b, b - a]) };
  }
  const s = -a - b;
  return { type: "eqn", text: `−${a} − ${b} = ?`, prompt: p("butunAyir"), ...zPick(s, [b - a, a - b, a + b]) };
};

export const g6IntMul = (): Activity => {
  const a = rnd(2, 12), b = rnd(2, 12);
  if (Math.random() < 0.5) {
    const s = -(a * b);
    return { type: "eqn", text: `−${a} × ${b} = ?`, prompt: p("butunKopaytir"), ...zPick(s, [a * b, -(a + b), s - a]) };
  }
  const s = a * b;
  return { type: "eqn", text: `−${a} × (−${b}) = ?`, prompt: p("butunKopaytir"), ...zPick(s, [-(a * b), a + b, -(a + b)]) };
};

export const g6IntDiv = (): Activity => {
  const b = rnd(2, 12), k = rnd(2, 15), a = b * k;
  if (Math.random() < 0.5)
    return { type: "eqn", text: `−${a} ÷ ${b} = ?`, prompt: p("butunBol"), ...zPick(-k, [k, -k - 1, -a]) };
  return { type: "eqn", text: `−${a} ÷ (−${b}) = ?`, prompt: p("butunBol"), ...zPick(k, [-k, k + 1, a]) };
};

export const g6Pow = (): Activity => {
  const a = rnd(2, 9), n = rnd(2, 3);
  if (Math.random() < 0.5) {
    const s = (-a) ** n;
    return { type: "eqn", text: `(−${a})${USTKI[n]} = ?`, prompt: p("manfiyDaraja"), ...zPick(s, [-s, a * n, -a * n]) };
  }
  const s = a ** n;
  return { type: "eqn", text: `${a}${USTKI[n]} = ?`, prompt: p("darajaTop"), ...zPick(s, [a * n, -s, s + a]) };
};

export const g6Sqrt = (): Activity => {
  const a = rnd(2, 20), n = a * a;
  return { type: "eqn", text: `√${n} = ?`, prompt: p("ildizTop"), answer: a, choices: pc(a, [a * 2, a + 1, n]) };
};

/* ---------- VIII bob. Tenglamalarni yechish ---------- */

export const g6OpenParen = (): Activity => {
  const a = rnd(5, 40), b = rnd(2, 30), c = rnd(10, 60);
  if (Math.random() < 0.5) {
    const s = c - (a - b);
    return { type: "eqn", text: `${c} − (${a} − ${b}) = ?`, prompt: p("qavsOch"), ...zPick(s, [c - a - b, c + a - b, a - b]) };
  }
  const s = c - (a + b);
  return { type: "eqn", text: `${c} − (${a} + ${b}) = ?`, prompt: p("qavsOch"), ...zPick(s, [c - a + b, c + a + b, a + b]) };
};

export const g6Coef = (): Activity => {
  const L = pick(["a", "b", "x", "y"]), a = rnd(2, 12), b = rnd(2, 9);
  if (Math.random() < 0.5)
    return { type: "eqn", text: `−${a}${L} × ${b}`, prompt: p("koeffitsiyent"), ...zPick(-a * b, [a * b, -a - b, -a]) };
  return { type: "eqn", text: `${a}${L} × (−${b})`, prompt: p("koeffitsiyent"), ...zPick(-a * b, [a * b, a + b, -b]) };
};

export const g6LinEq = (): Activity => {
  const a = rnd(2, 9), x = rnd(-12, 12) || 3, b = rnd(-20, 20);
  const c = a * x + b;
  const yoz = b < 0 ? `− ${-b}` : `+ ${b}`;
  return { type: "eqn", text: `${a}x ${yoz} = ${iz(c)}`, prompt: p("chiziqliTenglama"), ...zPick(x, [-x, x + 1, c - b]) };
};

export const g6LinEq2 = (): Activity => {
  const a = rnd(2, 8), x = rnd(-10, 12) || 4, b = rnd(-12, 12);
  const c = a * (x + b);
  const yoz = b < 0 ? `− ${-b}` : `+ ${b}`;
  return { type: "eqn", text: `${a}(x ${yoz}) = ${iz(c)}`, prompt: p("chiziqliTenglama"), ...zPick(x, [-x, x + b, c]) };
};

export const g6FracEq = (): Activity => {
  const b = rnd(2, 9), k = rnd(2, 12);
  if (Math.random() < 0.5)
    return { type: "eqn", text: `x/${b} = ${k}`, prompt: p("kasrTenglama"), ...zPick(b * k, [k, b + k, -b * k]) };
  const a = rnd(1, b - 1 || 1), x = b * k, c = (a * x) / b;
  return { type: "eqn", text: `${a}/${b} · x = ${c}`, prompt: p("kasrTenglama"), ...zPick(x, [c, c * a, x + b]) };
};

/* ---------- IX bob. Ma'lumotlar va kombinatorika ---------- */

export const g6Comb = (): Activity => {
  const a = rnd(2, 6), b = rnd(2, 6), s = a * b;
  return { type: "eqn", text: p("txtKombinatorika", { a, b }), prompt: p("kombinatorika"), answer: s, choices: pc(s, [a + b, s + a, a ** b]) };
};

/* ---------- X bob. Geometrik material ---------- */

export const g6TriKind = (): Activity => {
  const NOM = [p("jTengTomonli"), p("jTengYonli"), p("jTurliTomonli")];
  const k = rnd(0, 2), a = rnd(4, 15);
  const tomon = k === 0 ? [a, a, a] : k === 1 ? [a, a, Math.max(2, a - rnd(1, 3))] : [a, a + 2, a + 5];
  return { type: "eqn", text: tomon.join(",  ") + `  (${p("txtSm")})`, prompt: p("uchburchakTuri"), answer: NOM[k], choices: shuffle([...NOM, p("jTogriburchakli")]) };
};

export const g6TriPerim = (): Activity => {
  const a = rnd(4, 25), b = rnd(4, 25), c = rnd(Math.abs(a - b) + 1, a + b - 1);
  const P = a + b + c;
  return { type: "eqn", text: p("txtUchburchakTomon", { a, b, c }), prompt: p("uchburchakPerim"), answer: P, choices: pc(P, [a * b, P - c, P + c]) };
};

export const g6TriAngle = (): Activity => {
  const a = rnd(20, 80), b = rnd(20, 160 - a);
  const c = 180 - a - b;
  return { type: "eqn", text: p("txtUchburchakBurchak", { a, b }), prompt: p("uchburchakBurchak"), answer: c, choices: pc(c, [180 - a, a + b, 90 - a > 0 ? 90 - a : c + 10]) };
};

export const g6TriArea = (): Activity => {
  const a = rnd(4, 20), h = rnd(2, 18);
  // Yuza butun chiqishi uchun asos yoki balandlikning biri juft bo'lsin.
  const asos = a % 2 === 0 || h % 2 === 0 ? a : a + 1;
  const S = (asos * h) / 2;
  return { type: "eqn", text: p("txtUchburchakYuza", { a: asos, h }), prompt: p("uchburchakYuzaF"), answer: S, choices: pc(S, [asos * h, asos + h, S + asos]) };
};

const PI = 3.14;

export const g6Circle = (): Activity => {
  const r = rnd(2, 20), C = 2 * PI * r;
  return { type: "eqn", text: p("txtRadius", { r }), prompt: p("aylanaUzunlik"), answer: dc(C), choices: pcS(dc(C), [dc(PI * r), dc(PI * r * r), dc(2 * r)], ["0", "1"]) };
};

export const g6Disc = (): Activity => {
  const r = rnd(2, 15), S = PI * r * r;
  return { type: "eqn", text: p("txtRadius", { r }), prompt: p("doiraYuza"), answer: dc(S), choices: pcS(dc(S), [dc(2 * PI * r), dc(PI * r), dc(r * r)], ["0", "1"]) };
};

export type { Gen };
