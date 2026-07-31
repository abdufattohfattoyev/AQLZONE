/**
 * Kunlik sinov — faqat BUGUN ochiq bo'ladigan 6 ta savol.
 *
 * NEGA KERAK. Ilovada hech narsa o'tkazib yuborilmaydi: har bir dars
 * ertaga ham shu yerda turadi. Shoshilish uchun sabab yo'q, ya'ni
 * "keyinroq" har doim to'g'ri javob — va "keyinroq" hech qachon kelmaydi.
 * Kuniga bitta yopiladigan narsa ilovaga kun tartibida joy beradi va
 * eslatmaga aniq gap qo'shadi: umumiy "kel, mashq qil" o'rniga
 * "bugungi sinov 4 soatdan keyin yopiladi".
 *
 * Uch qoida ATAYLAB shunday:
 *
 *   1. **Olti savol, ko'p emas.** O'tkazib yuborgan bola o'zini aybdor
 *      his qilmasligi kerak — sinov "yo'qotish" emas, "bonus olmadim"
 *      bo'lib qolsin.
 *   2. **Zanjirga TA'SIR QILMAYDI.** U qo'shimcha, majburiyat emas.
 *   3. **Yangi mavzu bermaydi.** Savollar allaqachon O'TILGAN darslardan
 *      va xatolar daftaridan olinadi. Shu sabab yangi kontent yozish
 *      kerak emas va sinov hech qachon "bilmagan narsam" bo'lmaydi.
 *
 * Xatolar daftari birinchi turadi: takrorlash kerak bo'lgan savol —
 * bugungi eng foydali savol.
 */
import { bugungilar } from "./daftar";
import { takrorlashDarsi } from "./takrorlash";
import { kunKaliti } from "./zanjir";
import { t } from "./matn";
import type { Gen } from "./activity";
import type { Lesson, Progress, Unit } from "./types";
import { lessonId } from "./types";

/** Sinovda nechta savol bo'ladi. */
export const SINOV_SAVOL = 6;

/** Bajarilgan sinovlar shu kalitda: `{ "1-sinf": "2026-07-31" }`. */
const KALIT = "azapp_kunlik_sinov_v1";

type Yozuv = Record<string, string>;

function oqi(): Yozuv {
  try {
    const raw = localStorage.getItem(KALIT);
    return raw ? (JSON.parse(raw) as Yozuv) : {};
  } catch {
    return {};
  }
}

/** Shu kursning bugungi sinovi allaqachon bajarilganmi. */
export const sinovBajarilgan = (kurs: string): boolean => oqi()[kurs] === kunKaliti();

/** Bugungi sinov bajarildi deb belgilaydi. */
export function sinovniBelgila(kurs: string): void {
  try {
    localStorage.setItem(KALIT, JSON.stringify({ ...oqi(), [kurs]: kunKaliti() }));
  } catch {
    /* xotira to'lgan — bola sinovni ikkinchi marta o'ynay oladi, xolos */
  }
}

/**
 * Yarim tungacha necha soat qoldi.
 *
 * Ataylab YUQORIGA yaxlitlanadi: "0 soat qoldi" degan yozuv sinov
 * allaqachon yopilgandek tuyuladi, holbuki 40 daqiqa bor.
 */
export function qolganSoat(): number {
  const hozir = new Date();
  const yarimTun = new Date(hozir);
  yarimTun.setHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((yarimTun.getTime() - hozir.getTime()) / 3600_000));
}

/**
 * O'tilgan darslarning generatorlari.
 *
 * Faqat TUGALLANGAN darslar olinadi: sinov tekshiruv, dars emas —
 * bola hali ko'rmagan mavzu u yerda paydo bo'lmasligi kerak. Hech narsa
 * tugallanmagan bo'lsa birinchi darsga tushamiz, aks holda ilovaning
 * ilk kunida sinov umuman ochilmasdi.
 */
function otilganlar(units: Unit[], progress: Progress): Gen[] {
  const gens: Gen[] = [];
  units.forEach((U, ui) => {
    U.lessons.forEach((L, li) => {
      if (progress.done[lessonId(ui, li)]) gens.push(...L.gens);
    });
  });
  if (gens.length) return gens;
  return [...(units[0]?.lessons[0]?.gens ?? [])];
}

/** Ro'yxatni aralashtiradi (nusxasini qaytaradi). */
function aralash<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/**
 * Bugungi sinov darsi. Savol topilmasa `null`.
 *
 * Aralashma: avval xatolar daftaridan (eng foydalisi), qolgan joyga
 * o'tilgan darslardan tasodifiy. Ikkalasi ham bo'lmasa sinov umuman
 * ko'rsatilmaydi.
 */
export function sinovDarsi(
  kurs: string, units: Unit[], progress: Progress,
): { unit: Unit; lesson: Lesson } | null {
  const gens: Gen[] = [];

  // Xatolar daftari birinchi — takrorlash kerak bo'lgan savol bugungi
  // eng foydali savol. `takrorlashDarsi` o'sha yozuvlardan generator
  // yasab beradi va uni ikkinchi marta yozib o'tirmaymiz.
  if (bugungilar(kurs).length) {
    const daftar = takrorlashDarsi(kurs);
    if (daftar) gens.push(...daftar.lesson.gens.slice(0, 3));
  }

  const qolgan = SINOV_SAVOL - gens.length;
  if (qolgan > 0) gens.push(...aralash(otilganlar(units, progress)).slice(0, qolgan));

  if (!gens.length) return null;

  return {
    unit: {
      u: t("sinovSarlavha"),
      ic: "flame",
      color: "gold",
      intro: { t: t("sinovSarlavha"), v: ["⚡"], d: t("sinovIzoh") },
      lessons: [],
    },
    // `review: true` — bu dars yo'l xaritasiga yozilmaydi.
    lesson: { n: t("sinovSarlavha"), ic: "flame", gens: gens.slice(0, SINOV_SAVOL), review: true },
  };
}
