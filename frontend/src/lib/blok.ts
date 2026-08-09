/**
 * TESTLAR — darslardan ALOHIDA bo'lim.
 *
 * ─────────────── NEGA ALOHIDA, DARS ICHIDA EMAS ───────────────
 *
 * Darslar yo'l xaritasi — AMALIY MISOL: bola bobma-bob yuradi, har
 * darsda olti savol yechadi, yulduz yig'adi va keyingisi ochiladi. U
 * yerda maqsad o'rganish, tartib esa qat'iy.
 *
 * Test boshqa ish qiladi. U hech narsa o'rgatmaydi va hech narsani
 * ochmaydi — u O'LCHAYDI. Shuning uchun:
 *
 *   TARTIB YO'Q         Istalgan bobning testini istalgan paytda
 *                       ochish mumkin.
 *   QULF YO'Q           Dars tugatilmagan bo'lsa ham test ochiladi.
 *   YULDUZ YO'Q         Natija ball bo'lib yoziladi, yo'l xaritasiga
 *                       tegmaydi.
 *
 * ─────────────── NEGA QULF OLIB TASHLANDI ───────────────
 *
 * Avvalgi ko'rinishida test faqat TUGATILGAN darslardan yig'ilardi.
 * Mantig'i bor edi: birinchi kuni 30 tadan 3 ball chiqmasin.
 *
 * Lekin u haqiqiy foydalanuvchini hisobga olmasdi. Maktabda mavzu
 * ALLAQACHON o'tilgan bo'ladi — bola ilovaga bilimini tekshirish
 * uchun kiradi, o'rganish uchun emas. Uni "avval shu yerda ham
 * o'tib chiq" deb qaytarish — mavjud bilimini inkor qilish.
 *
 * Ball tushib ketish xavfi esa boshqa yo'l bilan hal qilindi:
 * QAMROVNI O'ZI TANLAYDI. Butun sinf bo'yicha aralash test ham bor,
 * bitta bobning testi ham. Maktabda progressiyani o'tayotgan bola
 * aynan o'sha bobni oladi va ball uning haqiqiy holatini ko'rsatadi.
 *
 * ─────────────── NEGA 5-SINFDAN ───────────────
 *
 * 5-sinfda maktabda ham nazorat ishi shu ko'rinishda bo'ladi: bir
 * necha mavzu aralash, vaqt cheklangan, ball qo'yiladi. 4-sinfgacha
 * esa bola hali "test" degan janrni bilmaydi va unga vaqt bosimi
 * foyda emas, zarar beradi.
 */
import type { Activity, Gen } from "./activity";
import type { Course } from "./curriculum";
import { COURSES } from "./curriculum";
import type { Unit } from "./types";

/* ------------------------------------------------------------ o'lcham */

export type Uzunlik = "qisqa" | "toliq" | "bob";

/** Har bir uzunlikda nechta savol va necha daqiqa. */
export const OLCHAM: Record<Uzunlik, { savol: number; daqiqa: number }> = {
  /* To'liq blok — imtihon sur'ati: bitta savolga bir daqiqa. */
  toliq: { savol: 30, daqiqa: 30 },
  /* Har kuni yarim soat ajratadigan odam kam. Qisqasi "bugun vaqtim
     yo'q" degan kunni butunlay bo'sh qoldirmaydi. */
  qisqa: { savol: 10, daqiqa: 10 },
  /* Bitta bob — mavzu yangi o'tilgan paytdagi tekshiruv. Vaqti
     kengroq (savoliga 1,2 daqiqa): bu tezlik mashqi emas, mavzuni
     bilish-bilmaslik savoli. */
  bob: { savol: 10, daqiqa: 12 },
};

/* ------------------------------------------------------------- qamrov */

/**
 * Test nimani o'lchaydi.
 *
 *   "hammasi"  butun sinf — algebra va geometriya aralash
 *   bob        bitta bob (kurs id + bobning tartib raqami)
 */
export type Qamrov = { tur: "hammasi" } | { tur: "bob"; kursId: string; ui: number };

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
 * ikkalasi bitta sinfga shu yerda qaytadan bog'lanadi. 5, 6 va
 * 11-sinfda darslik bitta va ro'yxatda bitta kurs qoladi — bu
 * kamchilik emas.
 */
export const sinfKurslari = (sinf: number): Course[] =>
  COURSES.filter((c) => c.grade === sinf || c.grade === 100 + sinf);

/** Test shu sinfda bormi. 5-sinfdan 11-gacha. */
export const blokBormi = (sinf: number): boolean => sinf >= 5 && sinf <= 11;

/**
 * Kurs kodidan haqiqiy sinfni beradi: 109 → 9.
 *
 * `curriculum/index.ts` da geometriya 100 dan boshlanadi. Busiz
 * 9-sinf geometriyasidan ochilgan test "109-sinf" deb yozilardi.
 */
export const sinfOf = (grade: number): number => (grade >= 100 ? grade - 100 : grade);

/* -------------------------------------------------------- boblar ro'yxati */

/** Test bazasidagi bitta yozuv — bobning testi. */
export interface Bob {
  kursId: string;
  /** Kurs nomi — bir sinfda ikki fan bo'lsa qaysi biri ekani ko'rinsin. */
  kursNomi: string;
  ui: number;
  nom: string;
  /** Nechta dars bor — testning qanchalik boy ekanini ko'rsatadi. */
  dars: number;
}

/**
 * Sinfning barcha boblari — testlar bazasining ro'yxati.
 *
 * Takrorlash darslari CHIQARIB TASHLANADI: ular o'z savolini
 * yasamaydi, boshqa darslardan yig'adi va testda o'sha savollar
 * ikkinchi marta chiqib qolardi.
 */
export function sinfBoblari(sinf: number): Bob[] {
  const r: Bob[] = [];
  for (const c of sinfKurslari(sinf)) {
    c.units.forEach((U, ui) => {
      const dars = U.lessons.filter((L) => !L.review).length;
      if (dars > 0) r.push({ kursId: c.id, kursNomi: c.title, ui, nom: U.u, dars });
    });
  }
  return r;
}

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

/** Kursning bir yoki barcha boblaridagi generatorlar. */
function manbalar(c: Course, units: Unit[], faqatUi?: number): Manba[] {
  const m: Manba[] = [];
  units.forEach((U, ui) => {
    if (faqatUi !== undefined && ui !== faqatUi) return;
    U.lessons.forEach((L, li) => {
      if (L.review) return;
      L.gens.forEach((gen) => m.push({ gen, kurs: c.key, kursId: c.id, ui, li, mavzu: U.u }));
    });
  });
  return m;
}

/**
 * Test yasaydi. Material bo'lmasa `null`.
 *
 * ─────────────── MAVZULAR BO'YICHA TEKIS TARQATISH ───────────────
 *
 * Manbalarni shunchaki aralashtirib 30 tasini olish YARAMAYDI: darslar
 * soni boblar bo'ylab teng emas va o'nta darsli bobdan o'nta savol,
 * ikki darsli bobdan bitta savol chiqardi. Natijada tahlil ham qiyshiq
 * bo'lardi — kichik bob umuman ko'rinmasdi.
 *
 * Shuning uchun avval har bir BOB dan navbat bilan bittadan olinadi,
 * so'ng aylana qaytadan boshlanadi.
 *
 * Bitta bobning testida bu qoida DARS darajasida ishlaydi: har
 * darsdan bittadan, so'ng ikkinchi aylana. Aks holda olti generatorli
 * dars butun testni egallab olardi.
 */
export function blokYasa(sinf: number, uzunlik: Uzunlik, qamrov: Qamrov): Blok | null {
  const kurslar = sinfKurslari(sinf);
  if (!kurslar.length) return null;

  const hammasi: Manba[] = [];
  if (qamrov.tur === "bob") {
    const c = kurslar.find((x) => x.id === qamrov.kursId);
    if (!c) return null;
    hammasi.push(...manbalar(c, c.units, qamrov.ui));
  } else {
    for (const c of kurslar) hammasi.push(...manbalar(c, c.units));
  }
  if (!hammasi.length) return null;

  // Guruh kaliti qamrovga qarab o'zgaradi: butun sinf testida BOB,
  // bitta bobning testida esa DARS. Ikkala holatda ham maqsad bir —
  // savollar bitta joydan to'planib qolmasin.
  const guruh = new Map<string, Manba[]>();
  for (const m of hammasi) {
    const kalit = qamrov.tur === "bob" ? `${m.kurs}|${m.ui}|${m.li}` : `${m.kurs}|${m.ui}`;
    const bor = guruh.get(kalit);
    if (bor) bor.push(m);
    else guruh.set(kalit, [m]);
  }

  const navbat = aralash([...guruh.values()]).map((x) => aralash(x));
  const kerak = OLCHAM[uzunlik].savol;
  const tanlangan: Manba[] = [];
  for (let aylana = 0; tanlangan.length < kerak; aylana++) {
    let qoshildi = false;
    for (const g of navbat) {
      if (tanlangan.length >= kerak) break;
      if (aylana < g.length) {
        tanlangan.push(g[aylana]);
        qoshildi = true;
      }
    }
    // Hamma manba tugadi. Bitta bobda generator kam bo'lishi mumkin —
    // o'shanda aylanani qaytadan boshlaymiz: bir generator ikki xil
    // savol yasaydi va takror bo'lmaydi.
    if (!qoshildi) {
      if (!navbat.length) break;
      const bor = tanlangan.length;
      for (const g of navbat) {
        if (tanlangan.length >= kerak) break;
        tanlangan.push(g[tanlangan.length % g.length]);
      }
      if (tanlangan.length === bor) break;
    }
  }

  // Savollar yasaladi. Bir xil savol ikki marta tushmasin: generator
  // tasodifiy va bitta generator ikki marta chaqirilsa bir xil son
  // chiqishi mumkin.
  const chiqqan = new Set<string>();
  const savollar: BlokSavol[] = [];
  for (const m of aralash(tanlangan)) {
    let a = m.gen();
    for (let k = 0; k < 25 && chiqqan.has(`${a.prompt}|${a.answer}`); k++) a = m.gen();
    if (chiqqan.has(`${a.prompt}|${a.answer}`)) continue;
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
  /** Bob testi bo'lsa bobning nomi — hisobotda qaysi mavzu ekani ko'rinsin. */
  bob?: string;
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

/**
 * Bobning eng yaxshi natijasi — testlar bazasida ko'rsatiladi.
 *
 * Nega eng yaxshisi, oxirgisi emas: ro'yxatdagi son "men bu mavzuni
 * qanchalik bilaman" degan savolga javob beradi. Shoshib topshirilgan
 * bitta test o'sha javobni butunlay o'chirib yuborishi noto'g'ri
 * bo'lardi.
 */
export function bobBali(sinf: number, bob: string): number | null {
  const oz = natijalar().filter((n) => n.sinf === sinf && n.bob === bob);
  if (!oz.length) return null;
  return Math.max(...oz.map(foiz));
}
