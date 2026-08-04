/**
 * Uchta tema — chunki uch xil ekranga uch xil kayfiyat kerak.
 *
 *   "bosh"    kurslar ro'yxati. Iliq qora tun, oltin nur, kengayuvchi
 *             halqalar. Bu o'quv ekrani emas — brendning kirish eshigi,
 *             shuning uchun ikkala kursnikiga ham o'xshamaydi.
 *
 *   "bolalar" 1-sinf. Yorqin, yumshoq, hamma narsa katta va yumaloq;
 *             quyoshli osmon, suzuvchi bulutlar, pufakchalar. Maqsad —
 *             bola ekranni ochishi bilan tabassum qilsin.
 *
 *   "katta"   2–6-sinf. Chuqur ko'k tun, shishasimon kartalar, uchuvchi
 *             3D kublar. Bu yoshda bola "kichkinalar o'yini" ni yoqtirmaydi.
 *
 * Tema `<html data-tema="...">` orqali beriladi. CSS o'zgaruvchilari shu
 * atribut ostida qayta belgilanadi, shuning uchun bitta atributni almashtirish
 * butun ilovaning radiusi, soyasi, ranglari va fonini birga o'zgartiradi.
 *
 * Diqqat: ilk temani `index.html` dagi kichik skript React'dan OLDIN qo'yadi.
 * Bu yerdagi hook keyingi almashinuvlar uchun.
 */
import { useEffect } from "react";
import { temaRanginiUzat } from "./qobiq";

export type Tema = "bosh" | "bolalar" | "katta";

/** Sinf raqamidan tema. 1-sinf alohida, qolganlari birga. */
export const temaOf = (grade: number): Tema => (grade <= 1 ? "bolalar" : "katta");

/** Berilgan temani hujjatga qo'yadi va ekran almashganda tozalaydi. */
export function useTema(t: Tema): void {
  useEffect(() => {
    const el = document.documentElement;
    const oldingi = el.dataset.tema;
    el.dataset.tema = t;
    // Telegram Mini App ichida SARLAVHA RANGI ham temaga ergashadi.
    // Busiz chok ko'rinardi: bizning fon quyoshli ko'k, Telegram
    // sarlavhasi esa o'zining kulrangida — ikkisi orasida keskin chiziq
    // paydo bo'lib, ilova "ramkaga tiqilgan" bo'lib ko'rinardi.
    temaRanginiUzat();
    return () => {
      // Oldingi holatni qaytaramiz, aks holda kursdan chiqqanda tema
      // o'sha kursnikida qolib ketadi.
      if (oldingi) el.dataset.tema = oldingi;
      else delete el.dataset.tema;
      temaRanginiUzat();
    };
  }, [t]);
}
