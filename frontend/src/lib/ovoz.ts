/**
 * Ovoz — matnni o'qib berish.
 *
 * Kichkintoylar bo'limi va maktabgacha kurs uchun bu bezak emas,
 * ISHLASH SHARTI: 3 yoshli bola "mashina" degan yozuvni o'qiy olmaydi.
 * Shu ikki joyda ovoz sukut bo'yicha YONIQ va karta ochilganda o'zi
 * eshitiladi.
 *
 * Uch manba, shu tartibda sinaladi:
 *
 *   1. `/api/v1/ovoz` — serverdagi TTS (Aisha, o'zbekcha "Gulnoza"
 *      ovozi). Server javobni ABADIY keshlaydi, ya'ni bir so'z bir
 *      marta yasaladi va keyin oddiy fayl bo'lib ketadi.
 *   2. `public/audio/` dagi tayyor mp3 — eski savollar uchun yasalgan
 *      to'plam. Server javob bermasa ham ishlaydi (`sw.js` keshlaydi).
 *   3. Brauzerning o'z ovozi — FAQAT RUSCHADA. Sabab pastda.
 *
 * Hech biri ishlamasa ilova jimgina davom etadi. Ovoz hech qachon
 * o'yin yo'liga to'siq bo'lmasligi kerak: fayl yo'qligi sababli karta
 * ochilmay qolishi — eng yomon holat.
 */

import { til } from "./til";

/**
 * Serverdagi TTS. Matn `?matn=` da ketadi, javob — audio faylning o'zi.
 *
 * Manzil O'Z serverimizniki va bu ataylab: kalit mijozga chiqmaydi,
 * javob esa serverda keshlanadi — ming bola bitta so'zni so'rasa ham
 * xizmatga bir marta to'lanadi.
 */
const AZ_TTS_API = "/api/v1/ovoz";

/** mp3 fayllar qayerda turadi (`public/audio/` — dev'da ham, dist'da ham `/audio`). */
const AUDIO_YOL = "/audio";

/**
 * Brauzerning o'z ovozi — FAQAT ruscha.
 *
 * O'zbekcha uchun u ataylab o'chirilgan. Brauzerda `uz-UZ` ovozi
 * deyarli hech qayerda yo'q va u matnni ruscha yoki inglizcha talaffuz
 * qoidalari bilan o'qiydi: "qo'y" → "ko-y", "o'rdak" → "ordak". Bunday
 * ovoz bolaga YORDAM BERMAYDI — u noto'g'ri talaffuzni o'rgatadi, ya'ni
 * jim turgandan yomonroq. Ruscha ovoz esa deyarli har qurilmada bor va
 * sifatli.
 */
const brauzerZaxirasiBormi = () => til() === "ru";

/** Sozlama qayerda saqlanadi. */
const KALIT = "azapp_ovoz";

/**
 * Ovoz yoqilganmi. Sukut bo'yicha — YONIQ.
 *
 * Ilgari u o'chiq edi va sabab bor edi: haqiqiy TTS xizmati ulanmagan,
 * brauzer ovozi esa o'zbekchani buzib o'qirdi. Endi server o'zbekcha
 * ovozni o'zi beradi, ya'ni sukutdagi javob teskarisiga o'zgardi.
 *
 * Ota-ona uni Sozlamalardan o'chira oladi (`azapp_ovoz = "0"`) — masalan
 * bola avtobusda o'ynayotganda.
 */
export function ovozYoniqmi(): boolean {
  try {
    return localStorage.getItem(KALIT) !== "0";
  } catch {
    return true;
  }
}

export function ovozniYoq(yoniq: boolean): void {
  try {
    localStorage.setItem(KALIT, yoniq ? "1" : "0");
  } catch { /* saqlay olmadik — bu safar shunday ishlaydi */ }
  if (!yoniq) toxtat();
}

let joriy: HTMLAudioElement | null = null;

/**
 * Navbat — ketma-ket aytiladigan matnlar.
 *
 * Yangi chaqiruv kelganda eski navbat BEKOR qilinadi: bola tez-tez
 * kartalarni almashtirsa, o'ntasi navbatga tizilib, u yigirma soniya
 * gapirib turardi.
 */
let navbat = 0;

/** Bir vaqtda faqat bitta ovoz eshitilsin — ustma-ust tushib ketmasin. */
export function toxtat(): void {
  navbat += 1;
  if (joriy) {
    joriy.pause();
    joriy = null;
  }
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

/** Shu matnning server manzili. */
const apiManzil = (matn: string) =>
  `${AZ_TTS_API}?matn=${encodeURIComponent(matn)}&til=${til()}`;

/**
 * Bitta manbani o'ynatib ko'radi. Muvaffaqiyatli tugasa `true`.
 *
 * "Tugadi" — bu `ended` hodisasi, `play()` ning qaytishi emas.
 * Farqi muhim: ketma-ket aytishda keyingi so'z oldingisi TUGAGANDAN
 * keyin boshlanishi kerak, aks holda ikkalasi bir-birining ustiga
 * tushadi.
 *
 * Bo'sh javob (server 204 qaytarganda) ham xato hisoblanadi: brauzer
 * bunday "audio" ni darhol `error` bilan yopadi.
 */
function ijro(manba: string, belgi: number): Promise<boolean> {
  return new Promise((hal) => {
    const a = new Audio(manba);
    joriy = a;
    let tugadi = false;
    const yop = (natija: boolean) => {
      if (tugadi) return;
      tugadi = true;
      if (joriy === a) joriy = null;
      hal(natija && belgi === navbat);
    };
    a.addEventListener("ended", () => yop(true));
    a.addEventListener("error", () => yop(false));
    a.play().catch(() => yop(false));
  });
}

/**
 * Matnni ovoz chiqarib o'qiydi.
 *
 * O'chiq bo'lsa — hech narsa qilmaydi (va hech qanday xato bermaydi).
 * Qaytadigan va'da OVOZ TUGAGANDA hal bo'ladi, shuning uchun uni
 * ketma-ket aytishda kutish mumkin.
 */
export async function gapir(matn: string): Promise<void> {
  if (!matn || !ovozYoniqmi()) return;
  toxtat();
  // Dars va yo'lboshchi matnlari uchun MP3 BIRINCHI. Sabab pastda.
  await ayt(matn, navbat, false);
}

/**
 * Ichki: navbat belgisi bilan bitta matnni aytadi.
 *
 * `apiOldin` — qaysi manba birinchi sinaladi va bu tanlov tejamkorlik
 * emas, TEZLIK masalasi:
 *
 *   KICHKINTOY so'zlari (`true`) serverda tayyor turadi, mp3 to'plamida
 *   esa ular umuman yo'q. mp3 dan boshlasak, har bir bosishda avval
 *   404 kutilardi.
 *
 *   DARS va yo'lboshchi matnlari (`false`) teskarisi: ular uchun mp3
 *   yasalgan, serverda esa yo'q va yasalmaydi ham (`core/ovoz.py`
 *   dagi oq ro'yxat). Ulardan API bilan boshlansa, har savolda bekorga
 *   204 kutilardi.
 *
 * Ikkala tartibda ham OXIRI bir xil: topilmasa jim qolinadi.
 */
async function ayt(matn: string, belgi: number, apiOldin: boolean): Promise<void> {
  const x = await xesh(matn);
  const manbalar = apiOldin
    ? [apiManzil(matn), `${AUDIO_YOL}/${x}.mp3`]
    : [`${AUDIO_YOL}/${x}.mp3`, apiManzil(matn)];

  for (const m of manbalar) {
    if (belgi !== navbat) return;
    if (await ijro(m, belgi)) return;
  }
  if (belgi !== navbat) return;
  brauzerOvozi(matn);
}

/**
 * Bir nechta matnni KETMA-KET aytadi, orasida qisqa pauza bilan.
 *
 * Kichkintoylar bo'limida ikkitasi bo'ladi: nom ("mashina") va tovush
 * ("bi-bip"). Ularni bitta satr qilib yuborish ham mumkin edi, lekin
 * TTS bunda ikkalasini bitta gap deb, shoshib o'qiydi — bola esa ikki
 * so'zni ajrata olmaydi va tovushni takrorlamaydi. Pauza esa aynan
 * "endi sen ayt" degan taklif bo'lib eshitiladi.
 */
export async function gapirKetma(matnlar: string[], pauza = 380): Promise<void> {
  const toza = matnlar.filter(Boolean);
  if (!toza.length || !ovozYoniqmi()) return;
  toxtat();
  const belgi = navbat;
  for (let i = 0; i < toza.length; i++) {
    if (belgi !== navbat) return;
    await ayt(toza[i], belgi, true);
    if (i < toza.length - 1) {
      await new Promise((r) => setTimeout(r, pauza));
    }
  }
}

/**
 * Ovozni OLDINDAN yuklaydi — eshittirmasdan.
 *
 * Albomda keyingi karta oldindan tayyorlanadi: server so'zni birinchi
 * marta yasashi bir necha soniya olishi mumkin va bola kartani
 * bosganda jim turgan ilova buzuq bo'lib tuyuladi. Bu chaqiruv esa
 * faylni brauzer keshiga tinchgina olib qo'yadi.
 *
 * Xato butunlay e'tiborsiz qoldiriladi: bu tayyorgarlik, ish emas.
 */
export function oldindanYukla(matnlar: string[]): void {
  if (!ovozYoniqmi()) return;
  for (const m of matnlar) {
    if (!m) continue;
    // `fetch` ishlatiladi, `new Audio()` emas: audio elementi ba'zi
    // brauzerlarda o'ynatishga urinib, avtomatik ijro taqiqiga tushadi.
    //
    // `cache: "force-cache"` ATAYLAB YO'Q va bu topilgan nosozlik.
    // U bilan brauzer keshdagi javobni SO'RAMASDAN oladi — shu
    // jumladan XATO javobni ham. Server bir lahzaga yiqilgan payt
    // prefetch 502 ni keshlab qo'ysa, o'sha so'z shu qurilmada
    // abadiy jim qolardi. Oddiy kesh esa yetarli: javobda
    // `immutable` turadi, ya'ni muvaffaqiyatli fayl baribir
    // qayta so'ralmaydi.
    void fetch(apiManzil(m)).catch(() => {});
  }
}

function brauzerOvozi(matn: string): void {
  if (!brauzerZaxirasiBormi() || typeof speechSynthesis === "undefined") return;
  const u = new SpeechSynthesisUtterance(matn);
  u.lang = "ru-RU";
  u.rate = 0.9;                            // bolalar uchun sekinroq
  const ovoz = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("ru"));
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
 *
 * `crypto.subtle` faqat xavfsiz kontekstda (https yoki localhost) bor.
 * Bo'lmasa bo'sh satr qaytadi — mp3 topilmaydi va zaxiraga o'tiladi.
 */
async function xesh(s: string): Promise<string> {
  try {
    const bayt = new TextEncoder().encode(s);
    const d = await crypto.subtle.digest("SHA-1", bayt);
    return [...new Uint8Array(d)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 16);
  } catch {
    return "";
  }
}
