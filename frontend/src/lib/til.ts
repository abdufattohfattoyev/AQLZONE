/**
 * Til — o'zbekcha va ruscha.
 *
 * Til MODUL DARAJASIDA turadi, React kontekstida emas. Sabab jiddiy:
 * savol generatorlari (`lib/generators.ts`) sof funksiyalar va ular
 * komponentdan tashqarida chaqiriladi — hook ularga yetib bormaydi.
 * Shu sabab `til()` istalgan joydan o'qiladi.
 *
 * Ilgari til almashganda sahifa qayta yuklanardi. 2026-10-08 dan
 * yuklanmaydi: ilova joyida qayta chiziladi (`tilniQoy` izohi).
 */
export type Til = "uz" | "ru";

const KALIT = "azapp_til";

/**
 * Tanlov tugmalari.
 *
 * `belgi` ATAYLAB bayroq emoji EMAS, ikki harfli kod. Bayroq Windows'da
 * umuman chizilmaydi — u yerda "UZ", "RU" degan quruq harflarga aylanib,
 * tugma yarim buzuq ko'rinadi. Ikki harfli kod esa hamma qurilmada bir
 * xil chiziladi va u ham darhol tanib olinadi.
 */
export const TILLAR: { kod: Til; nom: string; belgi: string }[] = [
  { kod: "uz", nom: "O'zbekcha", belgi: "UZ" },
  { kod: "ru", nom: "Русский", belgi: "RU" },
];

/**
 * Saqlangan til. Yo'q bo'lsa `null` — ya'ni foydalanuvchi hali TANLAMAGAN
 * va undan bir marta so'rash mumkin.
 */
function saqlangan(): Til | null {
  try {
    const x = localStorage.getItem(KALIT);
    return x === "ru" || x === "uz" ? x : null;
  } catch {
    return null;
  }
}

/**
 * Tanlov bo'lmasa — O'ZBEKCHA.
 *
 * Ilgari brauzer tilidan taxmin qilinardi va birinchi ekranda "Tilni
 * tanlang" so'ralardi (`TilTanlash`). U yangi odam ilovani ko'rishidan
 * oldingi yana bitta to'siq edi. Endi savol yo'q: hamma o'zbekchada
 * ochadi, ruscha kerak bo'lsa tanishuv sahifasidagi UZ / RU tugmasi
 * yoki sozlamalar orqali o'zi almashtiradi. `/ru/...` manzillar esa
 * `index.html` skriptida baribir ruschaga qo'yiladi.
 */
let joriy: Til = saqlangan() ?? "uz";

/** Ayni paytdagi til. */
export const til = (): Til => joriy;

/** Foydalanuvchi tilni o'zi tanlaganmi (yoki taxmin ishlatilyaptimi). */
export const tilTanlangan = (): boolean => saqlangan() !== null;

const tinglovchilar = new Set<() => void>();

/** Til o'zgarishiga obuna (`useTil`). */
export function tilgaObuna(f: () => void): () => void {
  tinglovchilar.add(f);
  return () => { tinglovchilar.delete(f); };
}

/**
 * Tilni almashtiradi — SAHIFA QAYTA YUKLANMAYDI.
 *
 * Ilgari har almashishda `location.reload()` bo'lardi: odam ekran
 * oqarib, qaytadan yuklanishini ko'rardi. Endi obunachilarga xabar
 * beriladi va `main.tsx` dagi `TilQobiq` ilovani joyida yangi tilda
 * qayta chizadi. Kurslar va savollar ikki tilni birga saqlaydi va
 * `kursMatn`/`t` bilan CHIZISH paytida tarjima qilinadi, shuning uchun
 * qayta chizish yetadi. Modul darajasida bir marta hisoblanadigan
 * nomlar bo'lsa, ular getter yoki funksiya bo'lishi kerak
 * (`masalaSinf.ts` → TOIFALAR, `qidiruv.ts` → indeks keshi).
 *
 * Bitta istisno qayta yuklaydi: ruscha manzildan (`/ru/...`)
 * o'zbekchaga. U yerda `/ru` marshrutning asosi (`main.tsx` →
 * ASOS_YOL) va u faqat sahifa ochilganda o'qiladi.
 */
export function tilniQoy(t: Til, qaytaYukla = true): void {
  const ozgardi = t !== joriy;
  joriy = t;
  try {
    localStorage.setItem(KALIT, t);
  } catch {
    /* xotira bloklangan — shu seansda ishlaydi, keyin taxmin qaytadi */
  }
  document.documentElement.lang = t;
  if (!qaytaYukla || !ozgardi) return;
  const p = window.location.pathname;
  if (t === "uz" && /^\/ru(\/|$)/.test(p)) {
    window.location.replace((p.slice(3) || "/") + window.location.search + window.location.hash);
    return;
  }
  tinglovchilar.forEach((f) => f());
}

/**
 * Tilni almashtiradi VA serverga ham xabar beradi.
 *
 * NEGA ALOHIDA FUNKSIYA. `tilniQoy` faqat qurilmada saqlaydi va
 * shu sabab BOT boshqa tilda gapirib qolardi: sayt o'zbekchaga
 * o'tgan, serverdagi `Pupil.til` esa Telegram interfeysi bo'yicha
 * "ru" bo'lib qolgan edi. Odam uchun bu bitta ilova — bir joyda
 * o'zbekcha, boshqa joyda ruscha bo'lishi tushuntirib bo'lmaydigan
 * narsa.
 *
 * Til DARHOL almashadi, saqlash orqada ketadi. Ilgari saqlash kutilardi,
 * chunki sahifa qayta yuklanib so'rovni uzib qo'yardi; endi qayta
 * yuklash yo'q. Yetib bormasa ham falokat emas: ilova keyingi
 * ochilishida `Tanishuv` farqni ko'rib qayta yuboradi.
 *
 * `api` DINAMIK yuklanadi: `api` → `matn` → `til` zanjiri allaqachon
 * bor va to'g'ridan-to'g'ri import halqa yasagan bo'lardi.
 */
export async function tilniAlmashtir(t: Til): Promise<void> {
  if (t === joriy) return;
  tilniQoy(t);
  try {
    const { tilniSaqla } = await import("./api");
    await tilniSaqla(t);
  } catch {
    /* tarmoq yo'q — til baribir almashdi */
  }
}

/**
 * Ikki qiymatdan tilga mos kelganini tanlaydi.
 *
 * Faqat matn uchun emas: ro'yxatlar, sonlar, hatto komponentlar ham
 * berilishi mumkin. Lug'atga tushmaydigan yakka holatlar uchun.
 */
export const T = <A,>(uz: A, ru: A): A => (joriy === "ru" ? ru : uz);

/** `<html lang>` ni joyiga qo'yadi — ekran o'quvchi va brauzer uchun. */
export function tilniUlash(): void {
  document.documentElement.lang = joriy;
}
