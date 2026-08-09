/**
 * BLOK TEST — vaqtli, aralash mavzuli, ballik sinov.
 *
 * ─────────────────────── NEGA KERAK ───────────────────────
 *
 * Ilovada allaqachon uchta qisqa rejim bor: kunlik sinov (6 savol),
 * bugungi maydon (3 bosqich) va duel. Ularning hammasi bitta narsani
 * qiladi — bugungi mashqni yopadi.
 *
 * 9–11-sinf o'quvchisiga esa boshqa narsa kerak. U imtihonga
 * tayyorlanadi va imtihon uch jihatdan darsdan farq qiladi:
 *
 *   MAVZU ARALASH   Darsda "bugun progressiya" deb yozilgan. Imtihonda
 *                   savol nimadan ekani AYTILMAYDI va qaysi formulani
 *                   olishni o'zi tanlaydi. Aynan shu tanlov yiqitadi.
 *   VAQT BOR        Bilish yetarli emas — ulgurish kerak.
 *   BALL BOR        Oxirida raqam chiqadi va u haqiqiy tayyorgarlikni
 *                   ko'rsatadi.
 *
 * ─────────────── FAQAT OCHILGAN BOBLARDAN ───────────────
 *
 * Savollar o'quvchi TUGATGAN darslardan olinadi. Butun kurs bo'ylab
 * olsak, birinchi kuni 30 tadan 3 ball chiqardi — va bunday natija
 * ko'rgan odam testni boshqa ochmaydi. Ball o'sib borishi kerak:
 * o'quvchi darslarni bosgani sayin testning qamrovi ham kengayadi.
 *
 * ALGEBRA VA GEOMETRIYA BIRGA. Maktabda ular ikki fan, imtihonda esa
 * bitta varaq. Shuning uchun test SINF bo'yicha yig'iladi: 9-sinf
 * bloki algebra9 va geometriya9 dan aralash keladi.
 *
 * ───────────────── NEGA 30 VA NEGA 10 ─────────────────
 *
 * To'liq blok — 30 savol, 30 daqiqa: bitta savolga bir daqiqa, haqiqiy
 * imtihon sur'ati. Lekin har kuni yarim soat ajratadigan odam kam,
 * shuning uchun 10 savollik qisqa variant ham bor. Qisqasi "bugun
 * vaqtim yo'q" degan kunni butunlay bo'sh qoldirmaydi.
 *
 * ───────────────── VAQT TUGAGANDA ─────────────────
 *
 * Test TO'XTAYDI, lekin javob berilmagan savollar shunchaki "xato"
 * bo'lib yozilmaydi — ular natijada ALOHIDA ko'rsatiladi ("ulgurmadi").
 * Ikkalasini qo'shib yuborish yolg'on xulosa berardi: mavzuni bilmagan
 * odam bilan sekin ishlagan odam butunlay boshqa ikki holat va ularga
 * beriladigan maslahat ham boshqacha.
 */
import type { Activity, Gen } from "./activity";
import type { Course } from "./curriculum";
import { COURSES } from "./curriculum";
import type { Progress, Unit } from "./types";
import { lessonId } from "./types";

/* ------------------------------------------------------------ o'lcham */

export type Uzunlik = "qisqa" | "toliq";

/** Har bir uzunlikda nechta savol va necha daqiqa. */
export const OLCHAM: Record<Uzunlik, { savol: number; daqiqa: number }> = {
  qisqa: { savol: 10, daqiqa: 10 },
  toliq: { savol: 30, daqiqa: 30 },
};

/* ------------------------------------------------------------- savol */

/**
 * Test savoli — o'zi va QAYERDAN kelgani.
 *
 * Manzil natija tahlili uchun shart: oxirida "qaysi mavzuda nechta
 * xato" ko'rsatiladi va o'sha yerdan to'g'ridan-to'g'ri darsga
 * o'tiladi. Manzilsiz test faqat ball aytardi.
 */
export interface BlokSavol {
  a: Activity;
  /** Kurs kaliti — `Course.key`. */
  kurs: string;
  /** Kurs id'si — darsga o'tish havolasi shundan yasaladi. */
  kursId: string;
  ui: number;
  li: number;
  /** Bobning nomi — tahlilda shu bo'yicha guruhlanadi. */
  mavzu: string;
}

export interface Blok {
  savollar: BlokSavol[];
  daqiqa: number;
}

/* ------------------------------------------------------ qaysi kurslar */

/**
 * Shu sinfning barcha kurslari: algebra + geometriya.
 *
 * Geometriya kodi 100 + sinf (`curriculum/index.ts`), shuning uchun
 * ikkalasi bitta sinfga shu yerda qaytadan bog'lanadi. 11-sinfda
 * darslik bitta va ro'yxatda bitta kurs qoladi — bu kamchilik emas.
 */
export const sinfKurslari = (sinf: number): Course[] =>
  COURSES.filter((c) => c.grade === sinf || c.grade === 100 + sinf);

/** Blok test shu sinfda ochiqmi. Faqat 7-sinfdan yuqorisi. */
export const blokBormi = (sinf: number): boolean => sinf >= 7 && sinf <= 11;

/**
 * Kurs kodidan haqiqiy sinfni beradi: 109 → 9.
 *
 * `curriculum/index.ts` da geometriya 100 dan boshlanadi. Busiz
 * 9-sinf geometriyasidan ochilgan test "109-sinf" deb yozilardi.
 */
export const sinfOf = (grade: number): number => (grade >= 100 ? grade - 100 : grade);

/* ------------------------------------------------------------ yig'ish */

/** Ro'yxatni aralashtiradi (nusxasini qaytaradi). */
function aralash<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Bitta manzil — generator bilan birga. */
interface Manba {
  gen: Gen;
  kurs: string;
  kursId: string;
  ui: number;
  li: number;
  mavzu: string;
}

/** Kursning TUGATILGAN darslaridagi barcha generatorlar. */
function otilganlar(c: Course, units: Unit[], p: Progress): Manba[] {
  const m: Manba[] = [];
  units.forEach((U, ui) => {
    U.lessons.forEach((L, li) => {
      if (!p.done[lessonId(ui, li)]) return;
      // Takrorlash darslari o'tkazib yuboriladi: ular o'z savolini
      // yasamaydi, boshqa darslardan yig'adi — testda o'sha savollar
      // ikkinchi marta chiqib qolardi.
      if (L.review) return;
      L.gens.forEach((gen) => m.push({ gen, kurs: c.key, kursId: c.id, ui, li, mavzu: U.u }));
    });
  });
  return m;
}

/**
 * Test yasaydi. Yetarli material bo'lmasa `null`.
 *
 * ─────────────── MAVZULAR BO'YICHA TEKIS TARQATISH ───────────────
 *
 * Manbalarni shunchaki aralashtirib 30 tasini olish YARAMAYDI: darslar
 * soni boblar bo'ylab teng emas va o'nta darsli bobdan o'nta savol,
 * ikki darsli bobdan bitta savol chiqardi. Natijada tahlil ham qiyshiq
 * bo'lardi — kichik bob umuman ko'rinmasdi.
 *
 * Shuning uchun avval har bir BOB dan navbat bilan bittadan olinadi,
 * so'ng aylana qaytadan boshlanadi. Shunda 30 savol boblar orasida
 * imkon qadar teng bo'linadi.
 */
export function blokYasa(
  sinf: number,
  progressOf: (c: Course) => Progress,
  uzunlik: Uzunlik,
): Blok | null {
  const kurslar = sinfKurslari(sinf);
  if (!kurslar.length) return null;

  const hammasi: Manba[] = [];
  for (const c of kurslar) hammasi.push(...otilganlar(c, c.units, progressOf(c)));
  if (!hammasi.length) return null;

  // Bob bo'yicha guruhlaymiz. Kalitda kurs ham bor: 9-sinf algebra va
  // geometriyasida bir xil nomli bob uchrasa, ular qo'shilib ketmasin.
  const boblar = new Map<string, Manba[]>();
  for (const m of hammasi) {
    const kalit = `${m.kurs}|${m.ui}`;
    const bor = boblar.get(kalit);
    if (bor) bor.push(m);
    else boblar.set(kalit, [m]);
  }

  const navbat = aralash([...boblar.values()]).map((x) => aralash(x));
  const kerak = OLCHAM[uzunlik].savol;
  const tanlangan: Manba[] = [];
  for (let aylana = 0; tanlangan.length < kerak; aylana++) {
    let qoshildi = false;
    for (const bob of navbat) {
      if (tanlangan.length >= kerak) break;
      if (aylana < bob.length) {
        tanlangan.push(bob[aylana]);
        qoshildi = true;
      }
    }
    // Hamma manba tugadi — bor narsadan ko'pini yasab bo'lmaydi.
    if (!qoshildi) break;
  }

  // Savollar yasaladi. Bir xil savol ikki marta tushmasin: generator
  // tasodifiy va bitta generator ikki marta chaqirilsa bir xil son
  // chiqishi mumkin.
  const chiqqan = new Set<string>();
  const savollar: BlokSavol[] = [];
  for (const m of aralash(tanlangan)) {
    let a = m.gen();
    for (let k = 0; k < 20 && chiqqan.has(`${a.prompt}|${a.answer}`); k++) a = m.gen();
    chiqqan.add(`${a.prompt}|${a.answer}`);
    savollar.push({ a, kurs: m.kurs, kursId: m.kursId, ui: m.ui, li: m.li, mavzu: m.mavzu });
  }

  if (!savollar.length) return null;

  // Vaqt savol soniga qarab qisqaradi: material yetmay 30 o'rniga 18
  // savol chiqqan bo'lsa, yarim soat berish testni imtihonga emas,
  // kutishga aylantirardi.
  const olcham = OLCHAM[uzunlik];
  const daqiqa = Math.max(1, Math.round((savollar.length / olcham.savol) * olcham.daqiqa));

  return { savollar, daqiqa };
}

/* ----------------------------------------------------------- natijalar */

/**
 * Bitta topshirilgan test.
 *
 * `ulgurmadi` ALOHIDA saqlanadi va xatoga qo'shilmaydi: mavzuni
 * bilmaslik bilan sekin ishlash boshqa-boshqa muammo va ularga
 * beriladigan maslahat ham boshqacha.
 */
export interface BlokNatija {
  /** ISO sana-vaqt — hisobotdagi grafik shu bo'yicha tartiblanadi. */
  vaqt: string;
  sinf: number;
  uzunlik: Uzunlik;
  jami: number;
  togri: number;
  xato: number;
  ulgurmadi: number;
  /** Sarflangan vaqt, sekund. */
  sekund: number;
}

const KALIT = "azapp_blok_v1";

/** Nechta natija saqlanadi. */
const CHEK = 60;

export function natijalar(): BlokNatija[] {
  try {
    const raw = localStorage.getItem(KALIT);
    if (!raw) return [];
    const d = JSON.parse(raw) as unknown;
    return Array.isArray(d) ? (d as BlokNatija[]) : [];
  } catch {
    return [];
  }
}

/**
 * Natijani saqlaydi.
 *
 * Ro'yxat ATAYLAB cheklangan: `azapp_` kalitlari server orqali
 * qurilmalar o'rtasida ko'chadi va bir yil o'ynagan odamning yuzlab
 * yozuvi har sinxronizatsiyada u yoqdan-bu yoqqa yurardi. Oltmish
 * yozuv esa hisobotdagi grafik uchun yetarlidan ko'p.
 */
export function natijaSaqla(n: BlokNatija): void {
  try {
    localStorage.setItem(KALIT, JSON.stringify([...natijalar(), n].slice(-CHEK)));
  } catch {
    /* xotira to'lgan — natija ko'rsatiladi, lekin tarixga tushmaydi */
  }
}

/** Foizda ball. Savol bo'lmasa 0. */
export const foiz = (n: Pick<BlokNatija, "jami" | "togri">): number =>
  n.jami ? Math.round((n.togri / n.jami) * 100) : 0;
