import type { IconName } from "./icons";
import type { Gen } from "./activity";

/**
 * Darsning ANIMATSION TUSHUNTIRISHI — savollardan oldin ko'rsatiladi.
 *
 * Maktabgacha yoshdagi bola savolni "bilgani uchun" emas, ko'rgani uchun
 * yechadi. Shuning uchun dars savol bilan boshlanmaydi: avval Aql
 * qadam-baqadam ko'rsatib beradi — olmalar bitta-bitta paydo bo'ladi,
 * ikki guruh birlashadi, ketadiganlari uchib ketadi — va faqat shundan
 * keyin savol so'raladi.
 *
 * Har bir tur `components/Ogit.tsx` da o'z animatsiyasiga ega. Tushuntirish
 * IXTIYORIY: kattalar kurslarida darslar avvalgidek to'g'ridan-to'g'ri
 * savoldan boshlanadi.
 */
export type Ogit =
  /** Sanash: narsalar bitta-bitta chiqadi, tepada son o'sib boradi. */
  | { tur: "sanash"; emoji: string; n: number }
  /** Qo'shish: ikki guruh, orasida "+", so'ng bitta guruhga birlashadi. */
  | { tur: "qosh"; emoji: string; a: number; b: number }
  /** Ayirish: `k` tasi ko'z oldida uchib ketadi. */
  | { tur: "ayir"; emoji: string; n: number; k: number }
  /** Taqqoslash: ikki guruh yonma-yon, ko'pi ajralib turadi. */
  | { tur: "taqqosla"; emoji: string; a: number; b: number }
  /** Raqam shakli: katta raqam va yonida shuncha narsa. */
  | { tur: "raqam"; n: number; emoji: string }
  /** Sonlar qatori: 1 2 3 4 5 — birin-ketin yoriladi. */
  | { tur: "qator"; n: number }
  /** Naqsh: takrorlanuvchi davri ajratib ko'rsatiladi. */
  | { tur: "naqsh"; items: string[]; davr: number }
  /** Oddiy tanishtirish: bitta katta belgi va uning nomi. */
  | { tur: "tanish"; belgi: string; nom: string }
  /**
   * To'liq tanishtirish — mavzuning HAMMA a'zosi birma-bir ko'rsatiladi.
   *
   * Maktabgacha yoshda savol berishdan oldin bola narsani ko'rgan bo'lishi
   * SHART. "Qaysi biri binafsha?" deb so'rashdan avval yettala rangni
   * ko'rsatib, nomini aytib chiqamiz — ota-ona shu paytda bola bilan birga
   * takrorlaydi. Bu bobning eng birinchi darsida bir marta bo'ladi.
   *
   * `hex` berilsa rangli doira, `e` berilsa rasm chiziladi.
   */
  | { tur: "royxat"; nom: string; items: { nom: string; e?: string; hex?: string }[] };

/** Bitta dars. `gens` — savol generatorlari, har bosilganda yangi savol yasaydi. */
export interface Lesson {
  /** Dars nomi. " · " bilan ajratilgan ikkinchi qism darslik betlari sifatida ko'rsatiladi. */
  n: string;
  ic: IconName;
  gens: Gen[];
  /** Savollardan oldin ko'rsatiladigan animatsion tushuntirish. */
  ogit?: Ogit;
  /** Bob takrorlash darsi avtomatik qo'shilgani belgisi. */
  review?: boolean;
}

export interface UnitIntro {
  t: string;
  /** Kirish ekranidagi katta belgilar, masalan ["345", "+", "278"]. */
  v: string[];
  d: string;
}

export type UnitColor = "green" | "blue" | "orange" | "purple" | "red" | "gold";

export interface Unit {
  /** Bob nomi. */
  u: string;
  ic: IconName;
  color: UnitColor;
  intro: UnitIntro;
  lessons: Lesson[];
  /** Yakuniy bob — unga "Bob takrorlash" qo'shilmaydi. */
  final?: boolean;
}

/** Dars holati — yo'l xaritasidagi ko'rinishini belgilaydi. */
export type NodeState = "done" | "current" | "locked";

/** Saqlanadigan progress. Kalitlar "bobIndeksi-darsIndeksi" ko'rinishida. */
export interface Progress {
  stars: number;
  coins: number;
  /** "0-3" → shu darsda olingan yulduz (1..3). */
  done: Record<string, number>;
  /** Shu kursda umuman yechilgan savollar. Nishonlar uchun. */
  savollar?: number;
  /** Do'kondan sotib olingan buyumlar (`lib/dokon.ts` kalitlari). */
  olingan?: string[];
  /** Aqlga (brend belgisiga) kiydirilgan buyum. */
  kiygan?: string;
  /**
   * Daraja aniqlash natijasi — bola qaysi bobdan BOSHLAYDI
   * (`lib/daraja.ts`, `screens/Daraja.tsx`).
   *
   * Undan oldingi boblar O'TILGAN deb yozilmaydi, faqat OCHIQ bo'ladi:
   * yulduz o'qilmagan dars uchun berilmasin, bola esa xohlasa orqaga
   * qaytib takrorlay olsin. `undefined` — test hali o'tkazilmagan.
   */
  boshBob?: number;
}

export const UNIT_COLORS: Record<UnitColor, { bg: string; ring: string; road: string }> = {
  // Qat'iy uch rang (`index.css` dagi izoh): binafsha va qizil bob
  // ko'kka, to'q sariq oltinga teng. Nomlar kurs dasturida yozilgan,
  // shuning uchun ular qoladi — faqat rangi uchtadan biri.
  green:  { bg: "bg-brand-green",  ring: "text-brand-green",  road: "#16a34a" },
  blue:   { bg: "bg-brand-blue",   ring: "text-brand-blue",   road: "#19b7b2" },
  orange: { bg: "bg-brand-gold",   ring: "text-brand-gold",   road: "#d97706" },
  purple: { bg: "bg-brand-blue",   ring: "text-brand-blue",   road: "#19b7b2" },
  red:    { bg: "bg-brand-blue",   ring: "text-brand-blue",   road: "#19b7b2" },
  gold:   { bg: "bg-brand-gold",   ring: "text-brand-gold",   road: "#d97706" },
};

export const lessonId = (ui: number, li: number) => `${ui}-${li}`;

/**
 * Har bir bob oxiriga "Bob takrorlash" darsini qo'shadi.
 * Yakuniy bob o'zi takrorlash bo'lgani uchun chetda qoladi.
 */
export function withReviews(units: Unit[]): Unit[] {
  return units.map((U) => {
    if (U.final) return U;
    // Takrorlash savollari bobning BARCHA darslaridan navbatma-navbat olinadi:
    // sonlar boshqa chiqadi, lekin turi va qiyinligi o'sha bobning o'zi bo'ladi.
    const n = U.lessons.length;
    const mix: Gen[] = [];
    for (let i = 0; mix.length < 6; i++) {
      const L = U.lessons[i % n];
      mix.push(L.gens[Math.floor(i / n) % L.gens.length]);
    }
    return { ...U, lessons: [...U.lessons, { n: "Bob takrorlash", ic: "repeat" as IconName, gens: mix, review: true }] };
  });
}

/**
 * Dars ochiqmi: oldingi dars tugagan bo'lishi kerak.
 *
 * Istisno — daraja aniqlash (`boshBob`): boshlash bobigacha bo'lgan har
 * bobning BIRINCHI darsi ochiq. Bob ichida esa tartib o'zgarmaydi.
 */
export function isUnlocked(units: Unit[], p: Progress, ui: number, li: number): boolean {
  if (li === 0 && ui <= (p.boshBob ?? 0)) return true;
  if (li > 0) return Boolean(p.done[lessonId(ui, li - 1)]);
  const prev = units[ui - 1];
  return Boolean(p.done[lessonId(ui - 1, prev.lessons.length - 1)]);
}

export function nodeState(units: Unit[], p: Progress, ui: number, li: number): NodeState {
  if (p.done[lessonId(ui, li)]) return "done";
  return isUnlocked(units, p, ui, li) ? "current" : "locked";
}

/**
 * Keyingi o'tiladigan dars — birinchi tugallanmagani.
 *
 * "Davom etish" tugmasi shu javobga suyanadi. Qidiruv oddiy, chunki
 * tugallangan darslar HAR DOIM boshidan ketma-ket turadi: `isUnlocked`
 * oldingi dars tugamaguncha keyingisini ochmaydi. Ya'ni birinchi
 * tugallanmagan dars — aynan bola turgan joy.
 *
 * Hammasi tugagan bo'lsa `null`: bunda tugma ko'rsatilmaydi, chunki
 * "davom etish" uchun joy qolmagan.
 *
 * Daraja aniqlangan bo'lsa (`boshBob`) qidiruv O'SHA bobdan boshlanadi:
 * oldingi boblar ochiq, lekin o'tilmagan — bola ularga o'zi qaytadi.
 * Oldinga hammasi tugagach esa o'sha qoldirilgan boblarga qaytiladi.
 */
export function keyingiDars(units: Unit[], p: Progress): { ui: number; li: number } | null {
  const bosh = Math.min(Math.max(0, p.boshBob ?? 0), Math.max(0, units.length - 1));
  const tartib = [...units.keys()].slice(bosh).concat([...units.keys()].slice(0, bosh));
  for (const ui of tartib) {
    for (let li = 0; li < units[ui].lessons.length; li++) {
      if (!p.done[lessonId(ui, li)]) return { ui, li };
    }
  }
  return null;
}
