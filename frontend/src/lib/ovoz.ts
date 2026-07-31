/**
 * Ovoz — savol matnini o'qib berish.
 *
 * Maktabgacha kurs uchun bu bezak emas, ISHLASH SHARTI: 4 yoshli bola
 * "Qaysi biri doira?" degan yozuvni o'qiy olmaydi. Shuning uchun ovoz shu
 * kursda sukut bo'yicha YONIQ va har bir savol ochilganda o'zi eshitiladi.
 *
 * Uch manba, shu tartibda sinaladi:
 *
 *   1. `AZ_TTS_API` — tashqi TTS xizmati (hozircha bo'sh, ulanmagan).
 *      Ulaganda faqat shu doimiyni to'ldirish kifoya: qolgan kod tayyor.
 *   2. `public/audio/` papkadagi tayyor o'zbekcha mp3 — talaffuz tabiiy va
 *      internetsiz ham ishlaydi (sw.js ularni birinchi so'rovdayoq keshlaydi).
 *   3. Brauzerning o'z ovozi — yuqoridagilar topilmasa.
 *
 * Hech biri ishlamasa ilova jimgina davom etadi. Ovoz hech qachon o'yin
 * yo'liga to'siq bo'lmasligi kerak: fayl yo'qligi sababli dars ochilmay
 * qolishi — eng yomon holat.
 */

import { til } from "./til";

/**
 * Tashqi TTS xizmati manzili.
 *
 * Bo'sh bo'lsa — ishlatilmaydi. To'ldirilganda matn `?matn=` parametrida
 * yuboriladi va javob sifatida audio kutiladi, masalan:
 *
 *     const AZ_TTS_API = "/api/v1/ovoz";     // → /api/v1/ovoz?matn=Salom
 *
 * Manzil o'z serveringizniki bo'lgani ma'qul: kalitni mijozga chiqarmaydi
 * va javobni keshlab, har savolga qayta pul to'lamaydi.
 */
const AZ_TTS_API = "";

/** mp3 fayllar qayerda turadi (`public/audio/` — dev'da ham, dist'da ham `/audio`). */
const AUDIO_YOL = "/audio";

/** Brauzer ovozi ishlatilsinmi, boshqa manba topilmaganda. */
const ZAXIRA_BRAUZER = true;

/** Sozlama qayerda saqlanadi. */
const KALIT = "azapp_ovoz";

/**
 * Ovoz yoqilganmi.
 *
 * Hozircha sukut bo'yicha O'CHIQ: haqiqiy TTS xizmati hali ulanmagan
 * (`AZ_TTS_API` bo'sh), brauzerning o'z ovozi esa o'zbekchani ko'pincha
 * ruscha yoki inglizcha talaffuz bilan o'qiydi — bunday ovoz bolaga
 * yordam bermaydi, chalg'itadi.
 *
 * Xizmat ulangach shu yerdagi `!== "1"` ni `!== "0"` ga almashtirsangiz,
 * ovoz hammada o'zi yonadi. Boshqa hech qayerga tegish shart emas.
 */
export function ovozYoniqmi(): boolean {
  try {
    return localStorage.getItem(KALIT) === "1";
  } catch {
    return false;
  }
}

export function ovozniYoq(yoniq: boolean): void {
  try {
    localStorage.setItem(KALIT, yoniq ? "1" : "0");
  } catch { /* saqlay olmadik — bu safar shunday ishlaydi */ }
  if (!yoniq) toxtat();
}

let joriy: HTMLAudioElement | null = null;

/** Bir vaqtda faqat bitta ovoz eshitilsin — ustma-ust tushib ketmasin. */
function toxtat(): void {
  if (joriy) {
    joriy.pause();
    joriy = null;
  }
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

/**
 * Matnni ovoz chiqarib o'qiydi.
 * O'chiq bo'lsa — hech narsa qilmaydi (va hech qanday xato bermaydi).
 */
export function gapir(matn: string): void {
  if (!matn || !ovozYoniqmi()) return;
  toxtat();

  void (async () => {
    // Avval tashqi xizmat, keyin tayyor mp3. Ikkalasi ham bitta yo'l bilan
    // o'ynatiladi, shuning uchun farqi faqat manzilda.
    const manba = AZ_TTS_API
      ? `${AZ_TTS_API}?matn=${encodeURIComponent(matn)}`
      : `${AUDIO_YOL}/${await xesh(matn)}.mp3`;

    const a = new Audio(manba);
    joriy = a;
    try {
      await a.play();
    } catch {
      // Fayl yo'q yoki brauzer bloklagan — zaxiraga o'tamiz.
      if (joriy === a) joriy = null;
      brauzerOvozi(matn);
    }
  })();
}

function brauzerOvozi(matn: string): void {
  if (!ZAXIRA_BRAUZER || typeof speechSynthesis === "undefined") return;
  const u = new SpeechSynthesisUtterance(matn);
  // Til savol matni bilan BIR XIL bo'lishi shart. Ruscha savolni "uz-UZ"
  // bilan o'qitsak, brauzer harflarni o'zbekcha qoidalar bilan talaffuz
  // qilib, tushunarsiz ovoz chiqarardi — ruscha ovoz esa deyarli har
  // qurilmada bor va sifatli.
  const kod = til() === "ru" ? "ru-RU" : "uz-UZ";
  u.lang = kod;
  u.rate = 0.9;                            // bolalar uchun sekinroq
  // Shu tildagi ovoz bo'lsa — o'shani olamiz. Bo'lmasa brauzer o'zi
  // tanlaydi: talaffuz g'alizroq bo'ladi, lekin gap tushunarli qoladi.
  const ovoz = speechSynthesis.getVoices()
    .find((v) => v.lang.toLowerCase().startsWith(kod.slice(0, 2)));
  if (ovoz) u.voice = ovoz;
  speechSynthesis.speak(u);
}

/** Qisqa effekt: to'g'ri javob, xato, yulduz. */
export function tovush(nom: "togri" | "xato" | "yulduz"): void {
  if (!ovozYoniqmi()) return;
  const a = new Audio(`${AUDIO_YOL}/_${nom}.mp3`);
  a.play().catch(() => { /* fayl yo'q — jim qolamiz */ });
}

/**
 * Matndan fayl nomini yasaydi.
 *
 * mp3 fayllarini yasagan skript bilan AYNAN bir xil bo'lishi shart, aks
 * holda tayyor fayl topilmaydi: sha1(utf8) ning birinchi 16 belgisi.
 * `public/audio/` dagi nomlar shu qoida bilan yozilgan.
 */
async function xesh(s: string): Promise<string> {
  const bayt = new TextEncoder().encode(s);
  const d = await crypto.subtle.digest("SHA-1", bayt);
  return [...new Uint8Array(d)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}
