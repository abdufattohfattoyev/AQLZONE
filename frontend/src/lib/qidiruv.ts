/**
 * UMUMIY QIDIRUV — butun ilova bitta maydondan topiladi.
 *
 * ─────────────────────── NEGA KERAK BO'LDI ───────────────────────
 *
 * Ilovada 16 kurs, 143 bob va 637 dars bor. Ularning hammasiga
 * yagona yo'l — kurs → bob → dars deb kirib borish. Ya'ni "Pifagor
 * teoremasi qayerda?" degan odam avval qaysi SINFDA o'tilishini
 * eslashi kerak edi. Eslay olmasa — topa olmasdi.
 *
 * Bu ayniqsa yangi kirgan odamda og'ir: u ilovada nima borligini
 * umuman bilmaydi va ro'yxatlarni birma-bir ochib chiqishga
 * sabri yetmaydi. Qidiruv esa teskari ishlaydi — odam bilgan
 * so'zini yozadi, ilova o'zi qayerdaligini aytadi.
 *
 * ─────────────────── NIMA QIDIRILADI ───────────────────
 *
 * Darslar, boblar, kurslar, formulalar, o'yinlar, kichkintoy
 * mavzulari va bo'limlar — hammasi bitta ro'yxatda. Ataylab bitta:
 * "kasrlar" deb yozgan odamga dars ham, formula ham keraklidir va
 * qaysi biri kerakligini u O'ZI ko'rib tanlaydi. Turlarga bo'lib
 * qo'ysak, u avval to'g'ri bo'limni tanlashi kerak bo'lardi —
 * ya'ni qidiruv yana "qayerda?" degan savolni qaytarardi.
 *
 * ─────────────── APOSTROF VA IKKI TIL ───────────────
 *
 * O'zbekchada "ko'p" so'zini hech kim apostrof bilan yozmaydi,
 * ustiga klaviaturaga qarab u besh xil belgi bo'lishi mumkin
 * (' ' ` ʻ ʼ). Shuning uchun qidirishdan oldin apostroflar
 * BUTUNLAY olib tashlanadi: "ko'p" ham, "kop" ham bir xil so'zga
 * aylanadi. Ruschada esa "ё" → "е".
 *
 * Har bir yozuv IKKALA tilda ham indekslanadi. Ruscha ochgan odam
 * o'zbekcha nomni yozsa ham topadi — kurs dasturi o'zbekcha
 * yozilgan va ruscha nom uning ustiga qo'yiladi (`tarjima/kurs.ts`),
 * ya'ni ikkalasi ham qo'lda turadi va ikkalasini ham berish arzon.
 *
 * ─────────────── INDEKS QACHON YASALADI ───────────────
 *
 * Birinchi qidiruvda, bir marta. Ilova ochilganda emas: 900 dan
 * ortiq yozuvni tayyorlash bir necha millisekund oladi va uni
 * ilovaning eng band lahzasiga — birinchi ekran chizilayotgan
 * paytga — qo'shishning ma'nosi yo'q. Qidiruv ekrani esa alohida
 * yuklanadi (`lazy`), ya'ni indeks ham faqat kerak bo'lganda
 * yasaladi.
 */
import { COURSES } from "./curriculum";
import type { Course } from "./curriculum";
import { FORMULALAR } from "./formulalar";
import type { IconName } from "./icons";
import { MAVZULAR, kNom } from "./kichkintoy";
import { t } from "./matn";
import { OYINLAR } from "./oyin";
import { kursMatn, sinfMatn } from "./tarjima/kurs";
import { til } from "./til";
import type { UnitColor } from "./types";
import {
  yolDars, yolDuel, yolFormulalar, yolKichkintoy, yolKichkintoyMavzu, yolKurs,
  yolMaydon, yolOyin, yolOyinlar, yolReyting,
} from "./yollar";

/** Natija turi — ro'yxatda rangli yorliq bo'lib ko'rinadi. */
export type Tur = "dars" | "bob" | "kurs" | "formula" | "oyin" | "kichkintoy" | "bolim";

/** Darsning kursdagi o'rni — qulfni EKRAN tekshiradi (pastdagi izohga qarang). */
export interface Joy {
  kurs: Course;
  ui: number;
  li: number;
}

export interface Natija {
  /** Ro'yxatdagi kalit — barqaror va takrorlanmas. */
  id: string;
  tur: Tur;
  /** Ko'rsatiladigan nom, tanlangan tilda. */
  nom: string;
  /** Ostidagi bir qatorlik izoh: "3-sinf · Kasrlar". */
  izoh: string;
  ic: IconName;
  rang: UnitColor;
  /** Bosilganda boriladigan manzil. */
  yol: string;
  /**
   * Dars bo'lsa — uning kursdagi o'rni.
   *
   * Qulf SHU YERDA tekshirilmaydi: indeks progressga bog'liq emas va
   * shu sabab bir marta yasalib, keyin o'zgarmasdan qayta ishlatiladi.
   * Progress esa har darsdan keyin o'zgaradi — uni indeksga qo'shsak,
   * butun indeks har safar qaytadan yasalishi kerak bo'lardi.
   */
  joy?: Joy;
  /** Qidirish uchun tayyorlangan matn (normallashgan, ikki tilda). */
  matn: string;
  /** Turga qarab qo'shiladigan asosiy og'irlik. */
  ogirlik: number;
}

/* ------------------------------------------------------- normallashtirish */

/**
 * Apostrofning hamma ko'rinishi.
 *
 * Ro'yxat uzun ko'rinadi, lekin har biri haqiqatda uchraydi: kurs
 * dasturida to'g'ri belgi (ʻ), klaviaturada oddiy tirnoq ('), iOS
 * avtomatik ravishda qo'yadigan burma tirnoq (’), va hokazo.
 */
const APOSTROF = /['`´‘’ʻʼ]/g;

/** So'z bo'lmagan hamma narsa — ajratgich. */
const AJRATGICH = /[^0-9a-zà-ÿа-яё]+/i;

/**
 * Matnni solishtirishga tayyorlaydi.
 *
 * Apostrof olib tashlanadi (yo'q qilinadi, bo'sh joyga emas): "ko'p"
 * → "kop". Bo'sh joyga almashtirilsa "ko p" bo'lib, ikkita qisqa
 * so'zga bo'linib ketardi va "kop" so'rovi uni topmasdi.
 */
export function nrm(s: string): string {
  return s.toLowerCase().replace(APOSTROF, "").replace(/ё/g, "е").trim();
}

/** So'rovni so'zlarga bo'ladi. Bo'sh so'rov — bo'sh ro'yxat. */
export function sozlar(s: string): string[] {
  return nrm(s).split(AJRATGICH).filter(Boolean);
}

/* ------------------------------------------------------------------ indeks */

/**
 * Turlarning asosiy og'irligi.
 *
 * Dars eng tepada, chunki ilovaning ishi — dars. "Kasrlar" deb
 * yozgan odam kasrlar DARSINI ochishni xohlaydi; formulalar
 * varaqasi ham keraklidir, lekin u ikkinchi navbatda.
 *
 * Bo'lim (Reyting, O'yinlar…) eng pastda emas: ular soni oz va nomi
 * qisqa, ya'ni to'liq mos kelganda baribir tepaga chiqadi. Pastga
 * tushirilsa, "reyting" deb yozgan odam Reytingni topa olmasdi.
 */
const OGIRLIK: Record<Tur, number> = {
  dars: 60, bob: 45, formula: 40, bolim: 38, kurs: 34, oyin: 30, kichkintoy: 22,
};

/**
 * Bitta yozuv yasaydi.
 *
 * `qoshimcha` — nomda ko'rinmaydigan, lekin QIDIRILADIGAN matn:
 * ruscha tarjima, kurs nomi, bob nomi. Shu tufayli "9-sinf sinus"
 * kabi so'rov ham ishlaydi: so'zlar bitta yozuvning turli
 * qismlaridan topiladi.
 */
function yozuv(
  id: string, tur: Tur, nom: string, izoh: string,
  ic: IconName, rang: UnitColor, yol: string,
  qoshimcha: string[] = [], joy?: Joy,
): Natija {
  return {
    id, tur, nom, izoh, ic, rang, yol, joy,
    matn: nrm([nom, izoh, ...qoshimcha].join(" ")),
    ogirlik: OGIRLIK[tur],
  };
}

/**
 * Dars nomining ko'rinadigan qismi.
 *
 * Kurs dasturida nom " · " bilan ikkiga bo'linadi: "Kasrlarni
 * qo'shish · 84–86-betlar". Ikkinchi qism darslik betlari va u
 * IZOHGA tushadi — ro'yxatda nom qisqa bo'lishi kerak, aks holda
 * telefonda ikki qatorga chiqib, ostidagi izoh ko'rinmay qolardi.
 */
function darsNomi(n: string): [string, string] {
  const i = n.indexOf(" · ");
  return i < 0 ? [n, ""] : [n.slice(0, i), n.slice(i + 3)];
}

let keshlangan: Natija[] | null = null;

/** Indeks. Birinchi chaqiruvda yasaladi, keyin o'sha nusxa qaytadi. */
export function indeks(): Natija[] {
  if (keshlangan) return keshlangan;
  const r: Natija[] = [];
  const ru = til() === "ru";

  /* ---- kurslar, boblar, darslar ---- */
  for (const c of COURSES) {
    const kursNom = kursMatn(c.title);
    const sinf = sinfMatn(c.grade);
    r.push(yozuv(
      `kurs:${c.id}`, "kurs", kursNom, c.desc ? kursMatn(c.desc) : sinf,
      c.ic, c.color, yolKurs(c), [c.title, sinf, c.slug],
    ));

    c.units.forEach((U, ui) => {
      const bobNom = kursMatn(U.u);
      r.push(yozuv(
        `bob:${c.id}:${ui}`, "bob", bobNom, `${sinf} · ${kursNom}`,
        U.ic, U.color, yolKurs(c), [U.u, U.intro.t, c.title],
      ));

      U.lessons.forEach((L, li) => {
        const [nom, bet] = darsNomi(L.n);
        const y = yozuv(
          `dars:${c.id}:${ui}:${li}`, "dars", kursMatn(nom),
          bet ? `${sinf} · ${bobNom} · ${bet}` : `${sinf} · ${bobNom}`,
          L.ic, U.color, yolDars(c, ui, li),
          [L.n, nom, U.u, c.title, sinf],
          { kurs: c, ui, li },
        );
        // "Bob takrorlash" — har bobga O'ZI qo'shiladigan dars
        // (`types.ts` dagi `withReviews`). Uning nomi hamma joyda
        // bir xil, ya'ni u faqat BOB nomi orqali topiladi: "hosila"
        // so'roviga hosila boblarining takrorlashlari to'planib,
        // haqiqiy darslarni pastga surib yuborardi. Ro'yxatda
        // qoladi — u ham boriladigan joy — lekin oxirroqda.
        if (L.review) y.ogirlik -= 25;
        r.push(y);
      });
    });
  }

  /* ---- formulalar ----
     Har bir formula ALOHIDA yozuv bo'ladi, bo'lim emas. Odam
     "aylana uzunligi" deb qidiradi, "Bo'linish, nisbat, foiz" deb
     emas — bo'lim nomini u ko'rmagan ham bo'lishi mumkin. */
  // Formulalar tarjimasi kurs lug'atida EMAS — har bir yozuvning o'z
  // `ru` maydoni bor (`lib/formulalar.ts`). Shuning uchun bu yerda
  // `kursMatn` ishlatilmaydi: u lug'atdan topa olmay, o'zbekcha
  // nomni qaytarib berardi va ruscha ekranda "Kasrlarni bo'lish"
  // degan yolg'iz o'zbekcha qator turib qolardi.
  FORMULALAR.forEach((b, bi) => {
    const kurs = COURSES.find((c) => c.grade === b.sinf) ?? COURSES[0];
    const bolimNom = ru ? b.ru : b.nom;
    // Kalit NOM bilan emas, o'rni bilan yasaladi. Bir bo'limda bir xil
    // nomli ikki formula bo'lishi normal — "Ikkilangan burchak" sinus
    // uchun ham, kosinus uchun ham bor. Nom kalit bo'lganda ular
    // bitta yozuvga qo'shilib, biri ro'yxatdan yo'qolardi.
    b.lar.forEach((f, fi) => {
      r.push(yozuv(
        `formula:${bi}:${fi}`, "formula", ru ? f.ru : f.nom,
        `${f.f} · ${bolimNom}`,
        b.ikon, "purple", yolFormulalar(kurs),
        [f.nom, f.ru, b.nom, b.ru, f.f],
      ));
    });
  });

  /* ---- o'yinlar ---- */
  for (const o of OYINLAR) {
    r.push(yozuv(
      `oyin:${o.id}`, "oyin", t(o.nom), t(o.izoh),
      o.ic, o.rang, yolOyin(o.id), [o.id],
    ));
  }

  /* ---- kichkintoy mavzulari ----
     Ichidagi kartalar (mashina, it, olma…) QO'SHILMAYDI: ularning
     soni yuzlab va har biri bitta so'z. Ular ro'yxatga tushsa,
     "it" deb yozgan odam natijalar ostida "Ko'paytirish"ni
     ko'rmay qolardi. Mavzuning o'zida esa kartalar nomi
     qidiriladigan matn bo'lib turadi — ya'ni "mashina" deb
     yozilsa, "Transport" mavzusi topiladi. */
  for (const m of MAVZULAR) {
    r.push(yozuv(
      `kichkintoy:${m.id}`, "kichkintoy", kNom(m), t("kichkintoyQisqa"),
      "shape", m.rang, yolKichkintoyMavzu(m.id),
      [m.nom, m.ru, ...m.kartalar.map((k) => `${k.nom} ${k.ru}`)],
    ));
  }

  /* ---- bo'limlar ----
     Kursga bog'liq bo'limlar (do'kon, nishonlar, testlar…) bu yerda
     ATAYLAB yo'q: ular `/kurs/<sinf>/...` ostida turadi va qaysi
     sinfniki ekanini qidiruv bilolmaydi. Ularni birdan o'n olti
     marta ko'rsatish esa ro'yxatni buzardi. */
  r.push(yozuv("bolim:reyting", "bolim", t("reyting"), t("menyuReytingIzoh"),
    "order", "gold", yolReyting()));
  r.push(yozuv("bolim:oyinlar", "bolim", t("oyinlar"), t("menyuOyinlarIzoh"),
    "puzzle", "purple", yolOyinlar()));
  r.push(yozuv("bolim:maydon", "bolim", t("maydon"), t("menyuMaydonIzoh"),
    "flame", "orange", yolMaydon()));
  r.push(yozuv("bolim:duel", "bolim", t("duel"), t("menyuDuelIzoh"),
    "trophy", "red", yolDuel()));
  r.push(yozuv("bolim:kichkintoy", "bolim", t("kichkintoyQisqa"), t("menyuKichkintoyIzoh"),
    "palette", "gold", yolKichkintoy()));

  keshlangan = r;
  return r;
}

/**
 * Indeksni bo'shatadi.
 *
 * Til almashganda kerak bo'lardi, lekin til almashishi sahifani
 * qayta yuklaydi (`lib/til.ts`) — ya'ni amalda buni faqat sinov
 * chaqiradi. Shunday bo'lsa ham qoldirilgan: keshni tozalash yo'li
 * yo'q modul sinovda albatta bir-biriga aralashib ketadi.
 */
export function keshniTozala(): void {
  keshlangan = null;
}

/* ------------------------------------------------------------- qidirishning o'zi */

/**
 * Bitta yozuvning bahosi. 0 — mos emas.
 *
 * Qoida: so'rovdagi HAR BIR so'z topilishi shart (VA, YOKI emas).
 * "kasr qo'shish" so'rovi faqat ikkalasi ham bor darsni beradi —
 * aks holda 637 darsdan yarmi chiqib, ro'yxat ma'nosini yo'qotardi.
 *
 * So'z BOSHIDAN qidiriladi, o'rtasidan emas. "kas" → "kasrlar"
 * topiladi, lekin "asr" → "kasrlar" ni TOPMAYDI. Sabab: yozib
 * turgan odam so'zni boshidan yozadi, o'rtadan emas, va o'rtadan
 * qidirish tasodifiy natijalarni ko'paytiradi ("son" so'zi
 * "million", "nisbat", "usson" ichida ham bor).
 */
export function baho(y: Natija, qidiruv: string[]): number {
  if (!qidiruv.length) return 0;

  const nomN = nrm(y.nom);
  let ball = y.ogirlik;

  for (const s of qidiruv) {
    const joy = soztopar(y.matn, s);
    if (joy < 0) return 0;
    // Nomning O'ZIDA topilgani izohda topilganidan qimmatliroq:
    // "Kasrlar" darsi "Kasrlar bobidagi Taqqoslash" darsidan
    // oldinroq turishi kerak.
    if (soztopar(nomN, s) >= 0) ball += 12;
    // Eng boshida turgani — yana qimmatroq.
    if (nomN.startsWith(s)) ball += 10;
  }

  // To'liq mos kelgan nom har doim birinchi.
  if (nomN === qidiruv.join(" ")) ball += 100;
  // Qisqa nom uzunidan ustun: "Kasrlar" va "Kasrlarni taqqoslash
  // va tartiblash" ikkalasi ham mos kelsa, qidirilayotgani
  // ko'pincha qisqasi bo'ladi.
  ball -= Math.min(20, Math.floor(nomN.length / 6));

  return ball;
}

/**
 * `s` so'zi `matn` ichida SO'Z BOSHIDA uchraydigan o'rni (yo'q bo'lsa −1).
 *
 * `indexOf` ning o'zi yetmaydi — u so'z o'rtasini ham topadi.
 * Muntazam ifoda (`\b`) esa kirill harflari bilan ishonchsiz, shu
 * sabab tekshiruv qo'lda: topilgan joydan oldingi belgi harf yoki
 * raqam bo'lmasligi kerak.
 */
function soztopar(matn: string, s: string): number {
  let i = matn.indexOf(s);
  while (i >= 0) {
    if (i === 0 || AJRATGICH.test(matn[i - 1])) return i;
    i = matn.indexOf(s, i + 1);
  }
  return -1;
}

/** Qidiruv natijalari — eng mosidan boshlab. */
export function qidir(sorov: string, limit = 40): Natija[] {
  const q = sozlar(sorov);
  if (!q.length) return [];

  const topilgan: { y: Natija; b: number }[] = [];
  for (const y of indeks()) {
    const b = baho(y, q);
    if (b > 0) topilgan.push({ y, b });
  }

  // Ball teng bo'lsa — indeksdagi tartib saqlanadi (kurslar sinf
  // bo'yicha tartiblangan), ya'ni 1-sinf 9-sinfdan oldin chiqadi.
  topilgan.sort((a, b) => b.b - a.b);
  return topilgan.slice(0, limit).map((x) => x.y);
}
