/**
 * ERTANGI SANDIQ — qaytish uchun sabab.
 *
 * ─────────────────────── MUAMMO ───────────────────────
 *
 * Bola darsni tugatadi, yulduz oladi, telefonni qo'yadi — va ertaga
 * ilova esiga tushmaydi. Jonli serverdagi raqam shuni aytadi: dars
 * qilganlarning yarmi ikkinchi kuni umuman qaytmaydi.
 *
 * Zanjir bor, lekin u MAVHUM: "3 kun" degan son 6 yoshli bola uchun
 * hech narsani anglatmaydi. Sandiq esa BUYUM — u yopiq turadi, ichida
 * nimadir bor va uni faqat ertaga ochish mumkin.
 *
 * ─────────────────────── QOIDA ───────────────────────
 *
 *   1. Bola bugun mashq qilsa — sandiq YOPILADI va ertangi kunga qoladi.
 *   2. Ertasi kuni ilovani ochishi bilan sandiq ochiladi.
 *   3. Ochilgach darhol yangisi yopilmaydi: yangi sandiq bugungi
 *      mashqdan keyin paydo bo'ladi. Ya'ni zanjir shu: mashq → sandiq →
 *      ertaga ochish → yana mashq.
 *
 * Sandiq KUTIB TURADI. Bola uch kundan keyin qaytsa ham, o'sha sandiq
 * joyida bo'ladi. Muddat qo'yish jazoga aylanadi va jazo qaytarmaydi —
 * bu yerdagi butun maqsad esa qaytarish.
 *
 * ─────────────────── YOSH BO'YICHA TO'RT KO'RINISH ───────────────────
 *
 * Mexanika bitta, ko'rinishi to'rt xil — chunki 4 yoshli va 17 yoshli
 * bolaga bir xil narsa va'da qilib bo'lmaydi:
 *
 *   kichkintoy  2–5    ekranda sandiq YO'Q. Bu yoshda ilovani bola
 *                      emas, ota-ona ochadi — va'da ham unga boradi
 *                      (Telegram xabari, `backend/core/eslatma.py`).
 *   bolalar     0–4-s  sovg'ali sandiq: hayvon, tanga, bezak.
 *   osmir       5–8-s  sandiq emas, OCHILADIGAN DARAJA. Bu yoshda
 *                      "sovg'a qutisi" bolalarcha tuyuladi, lekin
 *                      kutish hissi ishlashda davom etadi.
 *   katta       9–11-s quti umuman yo'q: va'da — ertangi REJA. DTMga
 *                      tayyorlanayotgan bolaga quyon taklif qilish
 *                      ilovani o'chirish uchun sabab bo'ladi.
 *
 * Bu to'rtta xususiyat EMAS: holat bitta, qoida bitta, faqat matn va
 * belgi almashadi.
 */
import { kunFarqi, kunKaliti } from "./zanjir";

/* ------------------------------------------------------------- uslub */

export type SandiqUslub = "kichkintoy" | "bolalar" | "osmir" | "katta";

/**
 * Kurs kodidan yosh ko'rinishini aniqlaydi.
 *
 * Kod tuzilishi `curriculum/index.ts` da: 100 dan katta — geometriya,
 * ya'ni haqiqiy sinfni topish uchun 100 ayiriladi. Aks holda 9-sinf
 * geometriyasi (109) "katta" o'rniga hech qaysi guruhga tushmasdi.
 */
export function uslubOf(grade: number): SandiqUslub {
  const sinf = grade >= 100 ? grade - 100 : grade;
  if (sinf <= 4) return "bolalar";
  if (sinf <= 8) return "osmir";
  return "katta";
}

/* ------------------------------------------------------------- holat */

/** Sandiq ichidan nima chiqadi. */
export type MukofotTur = "tanga" | "yulduz" | "bezak";

export interface Sandiq {
  /**
   * Sandiq yopilgan kun ("2026-08-08"). Bo'sh — kutayotgan sandiq yo'q.
   *
   * Nega "ochiladigan kun" emas: yopilgan kun o'zgarmas fakt, ochilish
   * esa undan kelib chiqadi (ertasi kuni). Ikkita sana saqlansa, ular
   * bir-biriga zid bo'lib qolishi mumkin edi.
   */
  yopilgan: string;
  /** Ichidagi mukofot — YOPILGANDA tanlanadi, ochilganda emas. */
  tur: MukofotTur;
  qiymat: number;
  /** Oxirgi ochilgan kun — bir kunda ikki marta ochilmasin. */
  ochilgan: string;
  /** Jami nechta sandiq ochilgan — "12-sandiq" deb ko'rsatish uchun. */
  soni: number;
}

export const SANDIQ_BOSH: Sandiq = {
  yopilgan: "", tur: "tanga", qiymat: 0, ochilgan: "", soni: 0,
};

/** localStorage va serverdagi kalit. `azapp` prefiksi — server shartli. */
export const SANDIQ_KEY = "azapp_sandiq_v1";

/* ----------------------------------------------------------- mukofot */

/**
 * Sandiq ichidagi mukofot.
 *
 * Tanga eng ko'p chiqadi va bu ataylab: u har doim ishga yaraydi
 * (do'kon, zanjir tiklash). Yulduz kamroq — u darsning o'lchovi va
 * sovg'a bo'lib tez-tez berilsa, reyting ma'nosini yo'qotadi.
 *
 * Qiymat kun sayin o'sib boradi: ketma-ket kunlar ko'paygani sari
 * sandiq ham "boyiydi". Bu — zanjirni uzmaslik uchun qo'shimcha sabab.
 */
export function mukofotYasa(zanjir: number, uslub: SandiqUslub): { tur: MukofotTur; qiymat: number } {
  // Katta yoshda quti ham, sovg'a ham yo'q — faqat reja. Qiymat 0
  // bo'lsa ekranda mukofot qatori umuman chizilmaydi.
  if (uslub === "katta") return { tur: "tanga", qiymat: 0 };

  const bonus = Math.min(zanjir, 10);            // 10 kundan keyin o'smaydi
  const n = Math.random();
  if (n < 0.15) return { tur: "yulduz", qiymat: 1 };
  if (n < 0.25) return { tur: "bezak", qiymat: 0 };
  return { tur: "tanga", qiymat: 15 + bonus * 3 };
}

/* ------------------------------------------------------------ qoidalar */

/**
 * Bugungi mashqdan keyin sandiq yopiladimi.
 *
 * Yopilmaydigan ikki holat:
 *   • bugun allaqachon yopilgan — bir kunda bitta sandiq;
 *   • ochilmagan sandiq turibdi — ustiga yangisini qo'ymaymiz, aks
 *     holda bir hafta kelmagan bolani yettita sandiq kutib olardi va
 *     har birining qiymati yo'qolardi.
 */
export function yopilsinmi(s: Sandiq, bugun = kunKaliti()): boolean {
  return s.yopilgan !== bugun && !tayyormi(s, bugun);
}

/** Sandiq ochishga tayyormi — yopilgan kundan keyin kamida bir kun o'tganmi. */
export function tayyormi(s: Sandiq, bugun = kunKaliti()): boolean {
  if (!s.yopilgan) return false;
  return kunFarqi(s.yopilgan, bugun) >= 1;
}

/** Bugun mashq qilingan, sandiq ertaga ochiladi — shu holatdami. */
export function kutyaptimi(s: Sandiq, bugun = kunKaliti()): boolean {
  return s.yopilgan === bugun;
}

/** Mashqdan keyingi holat: kerak bo'lsa sandiqni yopadi. */
export function yop(s: Sandiq, zanjir: number, uslub: SandiqUslub, bugun = kunKaliti()): Sandiq {
  if (!yopilsinmi(s, bugun)) return s;
  const m = mukofotYasa(zanjir, uslub);
  return { ...s, yopilgan: bugun, tur: m.tur, qiymat: m.qiymat };
}

/** Ochilgandan keyingi holat. Mukofot chaqiruvchi tomonda beriladi. */
export function och(s: Sandiq, bugun = kunKaliti()): Sandiq {
  return { ...s, yopilgan: "", ochilgan: bugun, soni: s.soni + 1 };
}

/**
 * Saqlangan qiymatni o'qiydi va yetishmayotgan maydonlarni to'ldiradi.
 *
 * Eski hisobda bu kalit umuman yo'q — o'shanda ham buzilmasligi kerak.
 */
export function sandiqniOqi(raw: string | null): Sandiq {
  if (!raw) return SANDIQ_BOSH;
  try {
    const d = JSON.parse(raw) as Partial<Sandiq>;
    return {
      yopilgan: d.yopilgan ?? "",
      tur: d.tur ?? "tanga",
      qiymat: d.qiymat ?? 0,
      ochilgan: d.ochilgan ?? "",
      soni: d.soni ?? 0,
    };
  } catch {
    return SANDIQ_BOSH;
  }
}
