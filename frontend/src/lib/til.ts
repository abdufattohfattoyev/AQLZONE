/**
 * Til — o'zbekcha va ruscha.
 *
 * Til MODUL DARAJASIDA turadi, React kontekstida emas. Sabab jiddiy:
 * savol generatorlari (`lib/generators.ts`) sof funksiyalar va ular
 * komponentdan tashqarida chaqiriladi — hook ularga yetib bormaydi.
 * Shu sabab `til()` istalgan joydan o'qiladi.
 *
 * Til ALMASHGANDA SAHIFA QAYTA YUKLANADI. Bu ataylab: kurslar ro'yxati,
 * bob nomlari va savollar modul yuklanganda bir marta yasaladi, ularni
 * yugurib turgan ilovada birma-bir almashtirish esa albatta biror joyda
 * eski matn qoldiradi. Qayta yuklash — bir soniyalik narx, evaziga
 * ekranda ikki til aralashib qolmaydi. Profil almashtirish ham xuddi
 * shu yo'ldan boradi (`screens/Profillar.tsx`).
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

/**
 * Tilni almashtiradi.
 *
 * `qaytaYukla` faqat ilk tanlovda `false` bo'ladi: o'sha payt ekranda
 * hali hech narsa yo'q va yuklashning ma'nosi yo'q.
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
  // Ruscha manzildan (`/ru/...`) o'zbekchaga o'tilsa — manzil ham
  // o'zbekchasiga. Aks holda `index.html` sahifa yuklanishida tilni yana
  // ruschaga qaytarib qo'yardi.
  const p = window.location.pathname;
  if (t === "uz" && /^\/ru(\/|$)/.test(p)) {
    window.location.replace((p.slice(3) || "/") + window.location.search + window.location.hash);
    return;
  }
  window.location.reload();
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
 * Saqlash reload'dan OLDIN kutiladi, aks holda sahifa yangilanishi
 * so'rovni yarim yo'lda uzib qo'yardi. Lekin ko'pi bilan bir yarim
 * soniya: sekin tarmoq tufayli til almashmay turishi — bundan ancha
 * yomon. Yetib bormasa ham falokat emas: ilova keyingi ochilishida
 * `Tanishuv` farqni ko'rib qayta yuboradi.
 *
 * `api` DINAMIK yuklanadi: `api` → `matn` → `til` zanjiri allaqachon
 * bor va to'g'ridan-to'g'ri import halqa yasagan bo'lardi.
 */
export async function tilniAlmashtir(t: Til): Promise<void> {
  if (t === joriy) return;
  try {
    const { tilniSaqla } = await import("./api");
    await Promise.race([
      tilniSaqla(t),
      new Promise((bajar) => setTimeout(bajar, 1500)),
    ]);
  } catch {
    /* tarmoq yo'q — til baribir almashadi */
  }
  tilniQoy(t);
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
