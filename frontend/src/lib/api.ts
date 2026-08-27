/**
 * Backend bilan aloqa — /api/v1.
 *
 * Kirish ikki yo'l bilan bo'ladi va natija bir xil: sessiya tokeni.
 *   Telegram Mini App ichida → initData bilan
 *   Boshqa hamma joyda (veb, APK, iOS) → qurilma id bilan anonim
 *
 * Shu sabab bu fayl kelajakdagi mobil ilovada ham o'zgarishsiz ishlaydi.
 */
import { t } from "./matn";
import { tgFoydalanuvchi, tgWebApp, tgda } from "./qobiq";

const TOKEN_KEY = "az_token";
const DEVICE_KEY = "az_device";
/** Tanlangan profil — qaysi bolaning progressi bilan ishlayapmiz. */
const PROFIL_KEY = "az_profil";
/** Oxirgi ma'lum profil soni. Nega saqlanadi — `profilSoni()` ga qarang. */
const PROFIL_SONI_KEY = "az_profil_soni";

// Telegram obyekti va sirt tekshiruvi `lib/qobiq.ts` da — YAGONA joyda.
// Ilgari bu fayl o'z nusxasini saqlardi va ikki nusxa albatta bir-biridan
// qolib ketardi: bittasiga yangi maydon qo'shiladi, ikkinchisi eski
// holida qoladi va nosozlik faqat ishlab chiqarishda ko'rinadi.
const tg = tgWebApp;

function deviceId(): string {
  let d = localStorage.getItem(DEVICE_KEY);
  if (!d) {
    d = "dev-" + crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem(DEVICE_KEY, d);
  }
  return d;
}

let token: string | null = localStorage.getItem(TOKEN_KEY);
let profilId: string | null = localStorage.getItem(PROFIL_KEY);

/** Joriy profilni almashtirish (profil tanlash ekranidan chaqiriladi). */
export function profilniTanla(id: number | string | null): void {
  profilId = id === null ? null : String(id);
  if (profilId) localStorage.setItem(PROFIL_KEY, profilId);
  else localStorage.removeItem(PROFIL_KEY);
}

export const joriyProfil = (): string | null => profilId;

/**
 * Nechta bola profili bor.
 *
 * Qiymat MAHALLIY saqlanadi va serverdan har safar so'ralmaydi. Sabab:
 * bosh sahifa profil almashtirish tugmasini shu songa qarab ko'rsatadi,
 * va bu qaror ilova ochilishi bilan, internetsiz ham kerak. Server javob
 * bergunicha kutsak, tugma bir lahza yo'q bo'lib, keyin sakrab chiqardi.
 *
 * Son har safar server javob berganda yangilanadi (`/me`, kirish, profil
 * qo'shish), shuning uchun u eskirib qolmaydi.
 */
export function profilSoni(): number {
  const x = Number(localStorage.getItem(PROFIL_SONI_KEY));
  // Ma'lumot yo'q bo'lsa 1 deb hisoblaymiz: bitta bola — eng ko'p
  // uchraydigan holat va bunda ortiqcha tugma ko'rsatilmaydi.
  return Number.isFinite(x) && x > 0 ? x : 1;
}

function profilSoniniYoz(n: number): void {
  try {
    localStorage.setItem(PROFIL_SONI_KEY, String(Math.max(1, n)));
  } catch {
    /* xotira to'lgan — tugma ko'rinishi noto'g'ri bo'ladi, xolos */
  }
}

/**
 * So'rovga profil qo'shadi.
 *
 * Profil tanlanmagan bo'lsa hech narsa qo'shilmaydi va server o'zining
 * birinchi profilini ishlatadi — shu sabab profil haqida bilmaydigan
 * eski o'rnatmalar ham buzilmaydi.
 */
export const bilanProfil = <T extends Record<string, unknown>>(b: T): T =>
  (profilId ? { ...b, profileId: profilId } : b);

/**
 * Manzilga profil qismini qo'shadi.
 *
 * `belgi` — manzilda allaqachon `?` bo'lsa "&" berish uchun.
 * Chaqiruvchi buni o'zi yozganda albatta bir joyda ikkinchi "?"
 * paydo bo'lardi va o'sha so'rov jimgina profilsiz ketardi.
 */
const profilQuery = (belgi: "?" | "&" = "?"): string =>
  (profilId ? `${belgi}profileId=${encodeURIComponent(profilId)}` : "");

export { profilQuery };

async function post<T>(url: string, body: unknown, auth = true): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

/**
 * Token bilan so'rov — ALOHIDA bo'limlar uchun.
 *
 * `tana` berilsa POST, berilmasa GET. Ikkitasini bitta funksiya
 * qilib berishning sababi bor: bo'lim fayllari (`lib/masala.ts`)
 * tokenni, sarlavhalarni va xato tekshiruvini o'zi takrorlamasin —
 * takrorlangan joyda albatta biri unutiladi va o'sha so'rov jimgina
 * tokensiz ketadi.
 *
 * XATOSI TASHLANADI (yutilmaydi): bu yerdagi so'rovlar ekranga
 * to'g'ridan-to'g'ri ta'sir qiladi va ular jim yiqilsa, foydalanuvchi
 * bo'sh ekranga qarab qoladi. Chaqiruvchi xatoni ushlab, nima
 * bo'lganini yozadi.
 */
export async function sorov<T>(url: string, tana?: unknown): Promise<T> {
  // `FormData` — fayl bilan yuborilgan so'rov. Unga `Content-Type`
  // QO'YILMAYDI: brauzer uni o'zi yozadi va ichiga chegara belgisini
  // (`boundary`) qo'shadi. Qo'lda "multipart/form-data" deb yozsak,
  // chegara tushib qoladi va server so'rovni umuman o'qiy olmaydi.
  const fayl = typeof FormData !== "undefined" && tana instanceof FormData;
  const r = await fetch(url, {
    method: tana === undefined ? "GET" : "POST",
    headers: {
      ...(tana === undefined || fayl ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(tana === undefined ? {} : { body: fayl ? (tana as FormData) : JSON.stringify(tana) }),
  });
  if (!r.ok) {
    // Kodi xabarga qo'shiladi: chaqiruvchi 429 (kunlik chegara) va
    // 404 (o'chirilgan masala) ni bir-biridan ajratishi kerak.
    const e = new Error(`${url} → HTTP ${r.status}`);
    (e as Error & { kod?: number }).kod = r.status;
    throw e;
  }
  return r.json() as Promise<T>;
}

/** So'rov xatosining HTTP kodi. Noma'lum bo'lsa 0. */
export const xatoKodi = (e: unknown): number =>
  (e as { kod?: number } | null)?.kod ?? 0;

/**
 * Ayni paytda ketayotgan kirish.
 *
 * Ilova ishga tushganda kirish bir necha joydan chaqiriladi
 * (`ProgressProvider`, hisob ekrani, tanishuv). Bularsiz har biri
 * alohida so'rov yuborardi va ekranlar bir-birini kutib qolardi.
 * Bitta va'da hammasiga yetadi.
 */
let kirishJarayoni: Promise<boolean> | null = null;

/**
 * Mini App ichida Telegram hisobi shu qurilmaga bog'landimi.
 *
 * Bayroq KERAK, chunki tokenning o'zi kimniki ekanini aytmaydi: u
 * anonim hisobniki ham bo'lishi mumkin. Busiz ilova har ochilganda
 * `auth/link` ni qayta chaqirardi — zararsiz, lekin ortiqcha so'rov.
 */
const TG_KEY = "az_tg_boglandi";

/**
 * Saqlangan token QAYSI Telegram foydalanuvchisiniki.
 *
 * Shu bitta qiymat butun tekshiruvni tez qiladi: ekrandagi odam
 * o'zgarmagan bo'lsa, ilova serverga umuman murojaat qilmaydi va
 * darhol ishlay boshlaydi.
 */
const TG_ID_KEY = "az_tg_id";

/**
 * "Bu token shu Telegram foydalanuvchisiniki" deb belgilab qo'yadi.
 *
 * Ikkala bayroq BIRGA yoziladi va bu ataylab: ular alohida yozilsa,
 * biri yozilib ikkinchisi unutilgan holat paydo bo'lardi — va o'shanda
 * tekshiruv jimgina ishlamay qolardi.
 */
function tgBelgila(): void {
  try {
    localStorage.setItem(TG_KEY, "1");
    const kim = tgFoydalanuvchi();
    if (kim) localStorage.setItem(TG_ID_KEY, kim);
  } catch {
    /* xotira bloklangan — har ochilishda qayta kiradi, xolos */
  }
}

export function signIn(): Promise<boolean> {
  /**
   * Mini App ichida token BOR bo'lsa ham ish qolishi mumkin — va bu
   * shart ikki xil nosozlikni yopadi.
   *
   * 1. **Anonim token.** Ilova ilgari oddiy brauzerdek ochilgan bo'lsa,
   *    localStorage da anonim hisobning tokeni yotadi. "Token bor —
   *    demak kirdik" desak, Telegram hisobi hech qachon ulanmaydi va
   *    odam Telegram ICHIDA "kiring" degan ekranni ko'radi.
   *
   * 2. **BEGONA token.** Ilgari bu yerda `az_tg_boglandi` bayrog'i
   *    tekshirilardi: u "1" bo'lsa token to'g'ri deb hisoblanib,
   *    `initData` bilan UMUMAN solishtirilmasdi. Natijada saqlangan
   *    token kimniki ekani hech qachon tasdiqlanmasdi — bir marta
   *    yozilgan token o'sha qurilmada boshqa Telegram hisobi ostida
   *    ham ishlayverardi. Duel havolasi buni ochib berdi: chaqiruvni
   *    ochgan odam CHAQIRGANNING hisobiga tushib qolardi.
   *
   * Shuning uchun token endi TEKSHIRILADI. Lekin har ochilishda
   * serverga so'rov yuborish ham to'g'ri yechim emas edi: ilova
   * sekinlashib, ochilishda bir lahza "chiqib-kirgandek" ko'rinardi.
   *
   * Yechim — tokenning EGASINI qurilmada eslab qolish. Ekrandagi
   * Telegram foydalanuvchisi o'zgarmagan bo'lsa, hech qanday so'rov
   * ketmaydi va ilova avvalgidek darhol ochiladi. O'zgargan bo'lsa
   * (yoki hali eslab qolinmagan bo'lsa) — to'liq kirish qaytadan
   * bo'lib o'tadi.
   *
   * Eslab qolingan raqam `initDataUnsafe` dan olinadi va u imzolanmagan
   * — lekin bu yerda u faqat KESH KALITI. Qalbakilashtirilgan qiymat
   * eng ko'pi bilan ortiqcha bir marta kirishga olib keladi, hisobni
   * esa baribir server imzolangan `initData` bo'yicha aytadi.
   */
  if (token) {
    const kim = tgFoydalanuvchi();
    // Telegram tashqarisida (veb, APK) tekshiradigan narsa yo'q.
    if (!tg()?.initData) return Promise.resolve(true);
    if (kim && lokal(TG_ID_KEY) === kim) return Promise.resolve(true);
  }

  if (!kirishJarayoni) {
    kirishJarayoni = kirishniBoshla().finally(() => { kirishJarayoni = null; });
  }
  return kirishJarayoni;
}

async function kirishniBoshla(): Promise<boolean> {
  // Kirish javobi hisob bilan birga profillar ro'yxatini ham beradi —
  // sonini shu yerdayoq eslab qolamiz, alohida so'rov kerak bo'lmaydi.
  type Kirish = { token: string; user?: { id?: number; profillar?: unknown[] } };
  const t = tg();
  const initData = t?.initData;

  try {
    if (initData) {
      t?.ready?.(); t?.expand?.();

      // ANONIM hisob bor — uni Telegram'ga bog'laymiz. Yangi kirish
      // qilsak, bola shu qurilmada yig'gan yulduzlari bilan birga eski
      // hisobda qolib ketardi.
      //
      // `az_tg_boglandi` SHARTI muhim: u "1" bo'lsa, tokendagi hisob
      // allaqachon biror Telegram hisobiga tegishli va uni ekrandagi
      // odamga "bog'lash" mumkin emas — bu ikki begona hisobni
      // qo'shib yuborardi. Bunday holatda pastdagi oddiy kirish
      // ishlaydi va hisobni SERVER `initData` bo'yicha aytadi.
      if (token && localStorage.getItem(TG_KEY) !== "1") {
        try {
          await post("/api/v1/auth/link", { initData });
          tgBelgila();
          return true;
        } catch (e) {
          // Token yaroqsiz bo'lishi mumkin (muddati tugagan). Pastdagi
          // oddiy kirish uni baribir hal qiladi.
          console.warn("[api] bog'lanmadi, qaytadan kiramiz:", (e as Error).message);
        }
      }

      const d = await post<Kirish>(
        "/api/v1/auth/telegram", { initData, platform: "tg" }, false,
      );
      tokenniYoz(d.token, d.user?.profillar?.length, d.user?.id);
      tgBelgila();
      return true;
    }

    const d = await post<Kirish>(
      "/api/v1/auth/device", { deviceId: deviceId(), platform: "web" }, false,
    );
    tokenniYoz(d.token, d.user?.profillar?.length, d.user?.id);
    return true;
  } catch (e) {
    console.warn("[api] kirish bo'lmadi:", (e as Error).message, "— faqat localStorage ishlaydi");
    return false;
  }
}

/** `localStorage` dan xavfsiz o'qish — bloklangan bo'lsa bo'sh satr. */
function lokal(kalit: string): string {
  try {
    return localStorage.getItem(kalit) || "";
  } catch {
    return "";
  }
}

/** Oxirgi marta qaysi HISOB kirgani — profil kalitini tozalash uchun. */
const HISOB_KEY = "az_hisob";

/**
 * Tanlangan bolaning profili qaysi hisobga tegishli ekanini eslab
 * qoladi va hisob ALMASHSA uni tozalaydi.
 *
 * Server o'zi himoyalangan: `_profil_tanla` profilni faqat so'rov
 * egasining ichidan qidiradi, ya'ni begona `profileId` bilan boshqa
 * bolaning progressini olib bo'lmaydi. Lekin qurilmadagi keshlar
 * profil raqami bilan kalitlanadi (`azapp_...::<id>`) — tozalanmasa,
 * bir telefonda ikkinchi odam kirganda uning rekordlari begona
 * raqam ostiga yozilib, aralashib ketardi.
 *
 * Bir xil hisob qayta kirganda TEGILMAYDI: ko'p bolali oilada
 * tanlangan bola har ochilishda nolga tushib ketmasligi kerak.
 */
function hisobniBelgila(hisobId: unknown): void {
  const yangi = hisobId == null ? "" : String(hisobId);
  if (!yangi) return;
  let eski = "";
  try {
    eski = localStorage.getItem(HISOB_KEY) || "";
  } catch { /* xotira bloklangan */ }
  if (eski === yangi) return;
  try {
    localStorage.setItem(HISOB_KEY, yangi);
    if (eski) profilniTanla(null);
  } catch { /* xotira bloklangan — keshlar aralashishi mumkin, xolos */ }
}

function tokenniYoz(yangi: string, profilSon?: number, hisobId?: unknown): void {
  token = yangi;
  if (typeof profilSon === "number") profilSoniniYoz(profilSon);
  localStorage.setItem(TOKEN_KEY, yangi);
  hisobniBelgila(hisobId);
}

export interface RemoteState { state: Record<string, string>; stars: number }

export async function getProgress(): Promise<RemoteState | null> {
  if (!token) return null;
  try {
    const r = await fetch(`/api/v1/progress${profilQuery()}`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.status === 401) { token = null; localStorage.removeItem(TOKEN_KEY); return null; }
    if (!r.ok) return null;
    return (await r.json()) as RemoteState;
  } catch { return null; }
}

/** Ayni damda ketayotgan saqlash. Bo'lmasa `null`. */
let saqlashJarayoni: Promise<void> | null = null;
/** Jarayon tugashini kutayotgan ENG OXIRGI holat. */
let kutayotganHolat: Record<string, string> | null = null;

/**
 * Progressni serverga yozadi — bir vaqtda FAQAT BITTA so'rov bilan.
 *
 * Ilova ochilganda bu funksiya bir necha marta chaqiriladi: kirishdan
 * keyin bir marta, keyin har o'zgarishda. Ular parallel ketsa, serverda
 * bir nechta yozuv to'qnashadi — SQLite'da bir vaqtda bitta yozuvchi
 * bo'ladi va ortiqcha so'rovlar faqat navbat yasaydi.
 *
 * Shuning uchun navbat SHU YERDA tugaydi: bittasi ketayotganda kelgan
 * chaqiruvlar navbatga turmaydi, ular BIR-BIRINI ALMASHTIRADI. Progress
 * to'liq holat bo'lib boradi (qismli o'zgarish emas), ya'ni oxirgisi
 * oldingilarining hammasini o'z ichiga oladi — o'rtadagilarni yuborish
 * shunchaki behuda so'rov bo'lardi.
 */
export async function putProgress(state: Record<string, string>): Promise<void> {
  if (!token) return;

  if (saqlashJarayoni) {
    kutayotganHolat = state;
    return saqlashJarayoni;
  }

  const ish = (async () => {
    let joriy: Record<string, string> | null = state;
    while (joriy) {
      try { await post("/api/v1/progress", bilanProfil({ state: joriy })); }
      catch (e) { console.warn("[api] saqlanmadi:", (e as Error).message); }
      joriy = kutayotganHolat;
      kutayotganHolat = null;
    }
    // Bayroq SINXRON tushiriladi, `finally` da emas: aks holda sikl
    // tugashi bilan bayroq tushishi orasida bo'shliq qolardi va o'sha
    // lahzada kelgan chaqiruv "jarayon bor" deb kutib, yuborilmay
    // qolardi — ya'ni oxirgi progress yo'qolardi.
    saqlashJarayoni = null;
  })();

  saqlashJarayoni = ish;
  return ish;
}

export interface ResultPayload {
  grade: number; unit: number; lesson: number; lessonName: string;
  asked: number; correct: number; mistakes: number; stars: number;
  /** Serverdagi maydon nomi — `durationMs` (serializers.py). */
  durationMs: number;
}

export async function postResult(p: ResultPayload): Promise<void> {
  if (!token) return;
  try { await post("/api/v1/results", bilanProfil({ ...p })); }
  catch (e) { console.warn("[api] natija yuborilmadi:", (e as Error).message); }
}

export const isSignedIn = () => Boolean(token);

/**
 * Hisobdan chiqish.
 *
 * QURILMA ID HAM O'CHIRILADI, va bu shart. Telegram'ga bog'langanda
 * qurilma `Identity` si o'sha hisobga KO'CHADI (`auth/link`). Ya'ni id
 * saqlanib qolsa, chiqqandan keyingi anonim kirish xuddi o'sha hisobni
 * qaytarardi — tugma bosiladi, hech narsa o'zgarmaydi.
 *
 * Mahalliy progress ham tozalanadi. Bu qurilmada boshqa odam kirsa,
 * oldingi bolaning yulduzlari uning hisobiga yozilib ketardi: ilova
 * localStorage dagi holatni serverga yuboradi va u yerda birlashadi.
 * Chiqqan odamning progressi serverda turibdi — qaytib kirsa, joyida.
 *
 * Oxirida sahifa boshidan yuklanadi: xotirada React holati, profil
 * tanlovi va progress konteksti qolib ketmasin.
 */
export function chiqish(): void {
  token = null;
  profilId = null;
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith("az_") || k.startsWith("azapp_")) localStorage.removeItem(k);
    }
  } catch { /* xotira bloklangan — pastdagi qayta yuklash baribir bo'ladi */ }

  window.location.replace(import.meta.env.VITE_ROUTER === "hash" ? "#/" : "/");
  if (import.meta.env.VITE_ROUTER === "hash") window.location.reload();
}

/* ------------------------------------------- Telegram orqali kirish */

/**
 * Botdagi «✅ Saytga kirish» havolasi orqali kirish.
 *
 * Havolada bir martalik kod bo'ladi (`/kirish/<kod>`). Token BOR bo'lsa
 * ham yuboriladi va bu MUHIM: brauzerda bola allaqachon anonim o'ynagan
 * bo'lishi mumkin. Server o'sha anonim hisobni Telegram hisobiga qo'shadi,
 * ya'ni yulduzlar yo'qolmaydi.
 *
 * Kod bir marta ishlaydi va bir soatdan keyin kuchini yo'qotadi, shuning
 * uchun `false` — bu odatiy holat (havola eski), xato emas.
 */
export async function kodBilanKir(kod: string): Promise<boolean> {
  // AVVAL anonim kirishni KUTAMIZ, keyin kodni yuboramiz. Ikkalasi bir
  // vaqtda ketsa poyga chiqadi va u JIM yutqazadi:
  //
  //   kod → server BEARER'siz so'rov ko'radi, hech narsani birlashtirmaydi
  //   qurilma → keyinroq tugab, o'z tokenini USTIGA yozadi
  //
  // Natijada bola "Telegram bilan kirdim" deb o'ylaydi, ilova esa hamon
  // anonim hisobda ishlaydi: ism o'sha yerga saqlanadi, Telegram hisobi
  // esa bo'sh qoladi. Kutish shu ikkala nosozlikni ham yopadi — token
  // paydo bo'ladi (server hisoblarni birlashtiradi) va endi uni ustidan
  // yozadigan boshqa kirish qolmaydi.
  await signIn();
  try {
    const d = await post<{ token: string }>(
      "/api/v1/auth/kod", { kod, platform: "web" },
    );
    token = d.token;
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (e) {
    console.warn("[api] kod bilan kirib bo'lmadi:", (e as Error).message);
    return false;
  }
}

/**
 * Botga o'tish manzili — «Telegram bilan kirish» tugmasi shu yerga olib boradi.
 *
 * `?start=kirish` shart emas, lekin u bilan Telegram suhbatda darhol
 * "BOSHLASH" tugmasini ko'rsatadi va bosilishi bilan bot javob beradi.
 * Busiz odam bo'sh suhbatga tushib, nima qilishni bilmay qolardi.
 */
export const botHavolasi = (bot: string): string =>
  `https://t.me/${encodeURIComponent(bot)}?start=kirish`;

/**
 * Server sozlamalari — hozircha faqat bot nomi.
 *
 * Bot nomi yig'ish vaqtida emas, serverdan olinadi: botni almashtirish
 * uchun ilovani qayta yig'ish shart bo'lmasin. Bo'sh qaytsa — Telegram
 * tugmasi umuman ko'rsatilmaydi.
 */
export async function botNomi(): Promise<string> {
  try {
    const r = await fetch("/api/health");
    if (!r.ok) return "";
    return ((await r.json()) as { botUsername?: string }).botUsername || "";
  } catch { return ""; }
}

/* ------------------------------------------------------- reyting */

export interface ReytingQator {
  orin: number;
  ism: string;
  familiya: string;
  toliqIsm: string;
  /** Ko'p bolali hisobda — qaysi bola. Aks holda bo'sh. */
  bola: string;
  avatar: string;
  yulduz: number;
  darslar: number;
  men: boolean;
}

export interface Reyting {
  davr: "jami" | "hafta";
  top: ReytingQator[];
  /** O'z o'rning — top ichida bo'lmasang ham. Yulduz yo'q bo'lsa `null`. */
  men: ReytingQator | null;
  qatnashchilar: number;
}

export async function getReyting(davr: "jami" | "hafta"): Promise<Reyting | null> {
  if (!(await signIn())) return null;
  try {
    const r = await fetch(`/api/v1/leaderboard?davr=${davr}${profilId ? `&profileId=${profilId}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return (await r.json()) as Reyting;
  } catch { return null; }
}

/* ---------------------------------------------------------- liga */

export interface LigaDaraja {
  nomer: number;
  nom: string;
  emoji: string;
}

/** Qator qaysi zonada: rang va tushuntirish shundan chiqadi. */
export type LigaZona = "kotariladi" | "xavfsiz" | "tushadi" | "kutmoqda";

export interface LigaQator {
  orin: number;
  ism: string;
  familiya: string;
  toliqIsm: string;
  /** Ko'p bolali hisobda — qaysi bola. Aks holda bo'sh. */
  bola: string;
  avatar: string;
  yulduz: number;
  darslar: number;
  zona: LigaZona;
  men: boolean;
}

export interface Liga {
  /**
   * Ro'yxatdan o'tmagan hisob guruhga qo'shilmaydi — qolgan maydonlar
   * bo'sh keladi va ekran taklif ko'rsatadi.
   */
  qatnashadi: boolean;
  daraja?: LigaDaraja;
  darajalar: LigaDaraja[];
  hafta?: { boshi: string; tugaydi: string; qolganSoat: number };
  guruh?: LigaQator[];
  men?: LigaQator | null;
  /** Nechtasi ko'tariladi va nechtasi tushadi. 0 — bu hafta yo'q. */
  kotariladi?: number;
  tushadi?: number;
  otganHafta?: {
    daraja: LigaDaraja;
    orin: number;
    yulduz: number;
    natija: "kotarildi" | "qoldi" | "tushdi";
    hafta: string;
  } | null;
}

export async function getLiga(): Promise<Liga | null> {
  if (!(await signIn())) return null;
  try {
    const r = await fetch(`/api/v1/liga${profilId ? `?profileId=${profilId}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return (await r.json()) as Liga;
  } catch { return null; }
}

/**
 * Ilova Telegram Mini App ichida ochilganmi.
 *
 * Bu shunchaki "Telegram bormi" degani emas: ism so'rash faqat shu yerda
 * ma'noli, chunki Mini App'ni ochgan odam allaqachon bot orqali kelgan va
 * internet bor. Oddiy brauzerda esa bola anonim o'ynayveradi — undan ism
 * so'rash keraksiz to'siq bo'lardi.
 */
export const miniAppda = (): boolean => tgda();

/**
 * Javob shu ilova ochilishi davomida saqlanadi.
 *
 * "Ha" o'zgarmaydi — hisob Telegram'dan uzilmaydi. "Yo'q" ham
 * keshlanadi, aks holda bellashuv ekraniga har kirganda `/me` so'rovi
 * ketardi.
 */
let tgHisobKesh: boolean | null = null;

/**
 * Joriy HISOB Telegram'ga bog'langanmi.
 *
 * NEGA `miniAppda()` YETARLI EMAS. U `initData` borligiga qaraydi, ya'ni
 * "ilova AYNAN HOZIR Telegram'dan ochildimi" degan savolga javob beradi.
 * Bellashuv uchun esa boshqa narsa kerak: raqibga ko'rsatiladigan ism va
 * xabar boradigan hisob — bular `initData` da emas, hisobning O'ZIDA
 * turadi.
 *
 * Farq amalda ko'rindi. Telegram REPLY-KLAVIATURA tugmasidan ochilgan
 * Mini App'ga `initData` bermaydi. Bot klaviaturasidagi «Bellashuv»ni
 * bosgan odam — ya'ni Telegram ichida, o'z hisobi bilan turgan odam —
 * "Bellashuv Telegram orqali o'ynaladi" degan devorga urilardi. Hisob
 * esa allaqachon o'shaniki edi.
 *
 * Shuning uchun savol SERVERGA beriladi: `/me` javobidagi `telegram`
 * bayrog'i — yagona ishonchli manba. Qurilmadagi bayroqqa (`az_tg_...`)
 * suyanib bo'lmaydi: token eskirib, hisob anonimga tushib qolgan
 * holatda u "1" bo'lib qolaverardi.
 *
 * Aloqa yo'q bo'lsa `false` qaytadi va KESHLANMAYDI — internet
 * qaytganda keyingi urinish to'g'ri javob beradi.
 */
export async function telegramHisobmi(): Promise<boolean> {
  // `initData` bor — kirish albatta Telegram hisobiga olib boradi,
  // so'rov kutib o'tirishning hojati yo'q.
  if (tgda()) return true;
  if (tgHisobKesh !== null) return tgHisobKesh;

  const hisob = await getHisob();
  if (hisob === null) return false;
  tgHisobKesh = Boolean(hisob.telegram);
  return tgHisobKesh;
}

/* ------------------------------------------------- ota-ona paneli */

export interface Xulosa {
  jami: {
    darslar: number; savollar: number; togri: number;
    xatolar: number; vaqt: number; aniqlik: number;
  };
  sinflar: { grade: number; darslar: number; savollar: number; togri: number }[];
  hafta: { sana: string; savollar: number; darslar: number }[];
  qiyin: QiyinDars[];
  oson: QiyinDars[];
}

export interface QiyinDars {
  grade: number; unit: number; lesson: number; lesson_name: string;
  savollar: number; togri: number; xatolar: number; aniqlik: number;
}

/**
 * Ota-ona paneli ma'lumoti.
 *
 * `null` — server bilan aloqa yo'q. Bu XATO EMAS: ilova internetsiz ham
 * ishlaydi, shunchaki hisobot ko'rsatilmaydi. Chaqiruvchi shu holatni
 * alohida ko'rsatadi.
 */
export async function getXulosa(): Promise<Xulosa | null> {
  if (!token) return null;
  try {
    const r = await fetch(`/api/v1/summary${profilQuery()}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return null;
    return (await r.json()) as Xulosa;
  } catch { return null; }
}

/* ----------------------------------------------------------- hisob */

export interface Profil { id: number; ism: string; avatar: string }


/**
 * Hisob egasi — odatda ota-ona.
 *
 * Bu BOLA emas: bolalar `Profil` da turadi. Ism-familiya hisobga tegishli,
 * chunki u Telegram'dan keladi yoki Sozlamalarda qo'lda kiritiladi.
 */
export interface Hisob {
  id: number;
  ism: string;
  familiya: string;
  toliqIsm: string;
  /** Telegram bot orqali yuborilgan raqam. Bo'lmasa — bo'sh satr. */
  telefon: string;
  kirishUsullari: string[];
  telegram: boolean;
  qurilma: boolean;
  /** Ism ham, familiya ham to'ldirilganmi. Ro'yxat oynasi shunga qaraydi. */
  royxatdan: boolean;
  /** Shu hisobdagi bolalar. Sozlamalarda ro'yxat qilib ko'rsatiladi. */
  profillar?: Profil[];
  /**
   * Serverda saqlangan til ("uz" / "ru").
   *
   * Ilova bunga QARAB ishlamaydi — u tilni qurilmada saqlaydi. Maydon
   * faqat solishtirish uchun: qurilmadagi tanlov boshqacha bo'lsa,
   * ilova yangisini serverga yozadi (`tilniSaqla`). Serverga esa til
   * eslatma va botdagi javoblar uchun kerak — ular ilova yopiq
   * bo'lganda yuboriladi.
   */
  til?: string;
}

/**
 * Tanlangan tilni serverga yozadi.
 *
 * Javobi kutilmaydi va xatosi jim o'tadi: til serverda faqat xabar
 * yuborish uchun kerak, ilova esa u yetib bormasa ham avvalgidek
 * ishlaydi. Buning uchun foydalanuvchini kutdirish ortiqcha.
 */
export async function tilniSaqla(til: string): Promise<void> {
  if (!token) return;
  try {
    await fetch("/api/v1/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ til }),
    });
  } catch (e) {
    console.warn("[api] til saqlanmadi:", (e as Error).message);
  }
}

export async function getHisob(): Promise<Hisob | null> {
  // HAR DOIM kutamiz, token bor bo'lganda ham.
  //
  // Ikki sabab. Birinchisi: ilova endi ochilgan bo'lsa token bir necha
  // yuz millisekunddan keyin paydo bo'ladi va kutmasak ekran "aloqa
  // yo'q" deb noto'g'ri xabar berardi. Ikkinchisi nozikroq: Mini App
  // ichida token BOR bo'lsa ham u anonim hisobniki bo'lishi mumkin va
  // `signIn()` uni Telegram'ga bog'lash bilan band. O'sha paytda /me
  // ni so'rasak, ESKI hisob qaytadi va ekran "kiring" deb turaverardi.
  //
  // Bog'lash kerak bo'lmaganda `signIn()` darhol javob beradi, ya'ni bu
  // kutish hech narsaga turmaydi.
  if (!(await signIn())) return null;
  try {
    const r = await fetch(`/api/v1/me${profilQuery()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const u = ((await r.json()) as { user: Hisob }).user;
    if (u.profillar) profilSoniniYoz(u.profillar.length);
    return u;
  } catch {
    return null;                       // internetsiz — chaqiruvchi hal qiladi
  }
}

/**
 * Saqlash natijasi.
 *
 * Xato SABABI bilan qaytadi, chunki ikkisi butunlay boshqa narsa:
 * "aloqa yo'q" — kutish kerak, "ismda raqam bor" — tuzatish kerak.
 * Faqat `null` qaytarsak, ekran ikkalasiga bir xil javob berardi va
 * foydalanuvchi nimani to'g'rilashni bilmay qolardi.
 */
export type SaqlashNatija =
  | { ok: true; hisob: Hisob }
  | { ok: false; xato: string };

/** Serverdan kelgan tekshiruv xatosini o'qiydi (DRF maydon bo'yicha beradi). */
function xatoMatni(d: unknown): string {
  if (d && typeof d === "object") {
    for (const [maydon, qiymat] of Object.entries(d as Record<string, unknown>)) {
      const matn = Array.isArray(qiymat) ? String(qiymat[0]) : String(qiymat);
      if (!matn) continue;
      const nom = maydon === "ism" ? t("xatoIsm")
        : maydon === "familiya" ? t("xatoFamiliya") : "";
      return nom ? `${nom}: ${matn}` : matn;
    }
  }
  return t("saqlanmadi");
}

/**
 * Ism va/yoki familiyani saqlaydi.
 *
 * Faqat berilgan maydon yuboriladi: foydalanuvchi familiyani tahrirlasa,
 * ismi serverda tegilmagan bo'lib qolishi kerak.
 */
export async function hisobniSaqla(
  o: { ism?: string; familiya?: string },
): Promise<SaqlashNatija> {
  if (!token && !(await signIn())) {
    return { ok: false, xato: t("aloqaYoq") };
  }
  try {
    const r = await fetch("/api/v1/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(o),
    });
    const d = await r.json().catch(() => null);
    if (!r.ok) return { ok: false, xato: xatoMatni(d) };
    return { ok: true, hisob: (d as { user: Hisob }).user };
  } catch (e) {
    console.warn("[api] ism saqlanmadi:", (e as Error).message);
    return { ok: false, xato: t("aloqaYoq") };
  }
}

/* ------------------------------------------------------- profillar */

export async function profillar(): Promise<Profil[] | null> {
  if (!token) return null;
  try {
    const r = await fetch("/api/v1/profiles", { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return null;
    const ro = ((await r.json()) as { profillar: Profil[] }).profillar;
    profilSoniniYoz(ro.length);
    return ro;
  } catch { return null; }
}

export async function profilQosh(ism: string): Promise<Profil | null> {
  if (!token) return null;
  try {
    const d = await post<{ profil: Profil }>("/api/v1/profiles", { ism });
    profilSoniniYoz(profilSoni() + 1);
    return d.profil;
  } catch (e) {
    console.warn("[api] profil qo'shilmadi:", (e as Error).message);
    return null;
  }
}

/* ---------------------------------------------------- Telegram kanali */

export interface KanalHolat {
  /** Bu odam kanalda YO'Q — taklif oynasini ko'rsatsa bo'ladi. */
  korsat: boolean;
  /** `@AqlZoneUz`. Sozlanmagan bo'lsa bo'sh. */
  kanal: string;
  havola: string;
}

/**
 * Kanalga taklif oynasi shu odamga kerakmi.
 *
 * Server Telegram'dan so'raydi, ya'ni javob bir necha yuz millisekund
 * kechikishi mumkin. Shuning uchun bu chaqiruv ilova ochilishini KUTIB
 * TURMAYDI — oyna baribir bir necha soniyadan keyin chiqadi.
 *
 * Xato bo'lsa `null`: bunda oyna ko'rsatilmaydi. Tarmoq uzilgani yoki
 * server yiqilgani foydalanuvchiga reklama ko'rsatish sababi emas.
 */
export async function getKanal(): Promise<KanalHolat | null> {
  if (!(await signIn())) return null;
  try {
    const r = await fetch("/api/v1/kanal", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return (await r.json()) as KanalHolat;
  } catch { return null; }
}

/* ================= DUEL — do'st bilan bellashuv ================= */

/**
 * Ikki o'yinchi orasidagi UMUMIY hisob — "Aziz bilan 4:3".
 *
 * Bitta duelning bali ertaga esdan chiqadi, bu son esa qolib ketadi va
 * keyingi bellashuvga sabab bo'ladi. `null` — bu odam bilan hali
 * tugagan duel bo'lmagan.
 */
export interface DuelHisob {
  men: number;
  raqib: number;
  durang: number;
  jami: number;
}

export interface DuelHolat {
  kod: string;
  oyin: string;
  daraja: number;
  /** Nechta savol va necha soniya — chaqirgan odam tanlaydi. */
  savollar: number;
  vaqt: number;
  /** `boshlanmagan` | `kutyapti` | `tugadi` | `muddati_otdi` */
  holat: string;
  chaqirgan: string;
  ozim: boolean;
  havola: string;
  /**
   * Boshlanishga necha soniya qoldi. Odatda `null` — lekin QAYTA
   * bellashuvda duel allaqachon boshlangan bo'ladi va sanoq shu
   * qiymatdan ketadi.
   */
  boshlanishSoniya?: number | null;
  /** Faqat boshlashda va qabul qilishda keladi. */
  urug?: number;
  /**
   * Chaqirganning har soniyadagi bali — raqib chizig'i uchun.
   *
   * Yakuniy BALL ataylab kelmaydi: u ko'rinsa duel "nishonga urish" ga
   * aylanadi va o'yinchi kerakli sonni o'tishi bilan to'xtaydi.
   */
  raqibSanoq?: number[];
  /** Shu raqib bilan umumiy hisob. Raqib hali noma'lum bo'lsa — `null`. */
  hisob?: DuelHisob | null;
}

/** Jonli duel holati — har 2 soniyada so'raladi. */
export interface DuelJonli {
  holat: string;
  menTayyor: boolean;
  /** Boshlanishga necha soniya qoldi. `null` — hali ikkalasi tayyor emas. */
  boshlanishSoniya: number | null;
  golib: string;
  meniki: number;
  raqibBor: boolean;
  raqibNom: string;
  raqibTayyor: boolean;
  raqibBall: number;
  raqibTugadi: boolean;
  /** Raqibning oxirgi belgisi yangimi — u hozir ekran oldidami. */
  raqibShuYerda: boolean;
  /** Duel tugagach — shu raqib bilan umumiy hisob. */
  hisob?: DuelHisob | null;
  /** "Yana o'ynaymizmi?" ni men bosdimmi. */
  menYana?: boolean;
  /** Raqib bosdimi — u meni kutyapti. */
  raqibYana?: boolean;
  /** Ikkalasi ham bosgach yasalgan yangi duel kodi. Bo'sh — hali yo'q. */
  keyingiKod?: string;
}

export interface DuelNatija {
  kod: string;
  /** `chaqirgan` | `qabul` | `durang` */
  golib: string;
  meniki: number;
  raqib: number;
  raqibIsm: string;
  /** Shu raqib bilan umumiy hisob — bu duel ham sanalgan holda. */
  hisob?: DuelHisob | null;
}

/** Natija javobi — jonli duelda raqib hali tugatmagan bo'lishi mumkin. */
export interface DuelYakun extends DuelNatija {
  holat: string;
  tugadi: boolean;
  menChaqirdim: boolean;
}

export interface DuelYozuv {
  kod: string;
  oyin: string;
  holat: string;
  menChaqirdim: boolean;
  raqib: string;
  meniki: number;
  raqibBall: number;
  /** `null` — hali tugamagan. */
  yutdim: boolean | null;
  durang: boolean;
  havola: string;
}

/** Xato turi — ekran foydalanuvchiga tushunarli javob bera olishi uchun. */
export class DuelXato extends Error {
  /** HTTP kodi — ekran shunga qarab tushunarli javob beradi. */
  kod: number;
  sabab: string;

  constructor(kod: number, sabab: string) {
    super(sabab);
    this.kod = kod;
    this.sabab = sabab;
  }
}

async function duelPost<T>(url: string, body: unknown = {}): Promise<T> {
  // Kirishni KUTAMIZ. Duel ekrani ilova ochilishi bilan chaqiriladi
  // (chaqiruv havolasi to'g'ridan-to'g'ri shu yerga tushiradi) va o'sha
  // lahzada token hali kelmagan bo'lishi mumkin — busiz birinchi so'rov
  // 401 bilan qaytib, ekranda "aloqa yo'q" degan yolg'on xato chiqardi.
  if (!token && !(await signIn())) throw new DuelXato(401, "kirish yo'q");

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(bilanProfil(body as Record<string, unknown>)),
  });
  if (!r.ok) {
    let sabab = "";
    try { sabab = ((await r.json()) as { detail?: string }).detail ?? ""; } catch { /* bo'sh */ }
    throw new DuelXato(r.status, sabab);
  }
  return r.json() as Promise<T>;
}

/** Chaqirgan odam tanlaydigan shartlar. */
export interface DuelShart {
  oyin: string;
  savollar: number;
  vaqt: number;
}

/** Yangi chaqiruv boshlaydi. Shartlar berilmasa server standartini oladi. */
export const duelBoshla = (shart?: DuelShart): Promise<DuelHolat> =>
  duelPost<DuelHolat>("/api/v1/duel", shart ?? {});

/** Chaqiruv haqida ma'lumot (ball bermaydi). */
export async function duelKorish(kod: string): Promise<DuelHolat | null> {
  if (!token && !(await signIn())) return null;
  try {
    const r = await fetch(`/api/v1/duel/${encodeURIComponent(kod)}${profilQuery()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return (await r.json()) as DuelHolat;
  } catch { return null; }
}

/** Chaqiruvni qabul qiladi — o'ynash uchun urug' va raqib sanog'i. */
export const duelQabul = (kod: string): Promise<DuelHolat> =>
  duelPost<DuelHolat>(`/api/v1/duel/${encodeURIComponent(kod)}/qabul`);

/** Natijani yuboradi. Chaqirgan uchun `DuelHolat`, qabul qilgan uchun `DuelNatija`. */
export const duelNatija = <T>(
  kod: string, ball: number, xato: number, sanoq: number[],
): Promise<T> =>
  duelPost<T>(`/api/v1/duel/${encodeURIComponent(kod)}/natija`, { ball, xato, sanoq });

/** "Men tayyorman" — ikkalasi bosgach o'yin boshlanadi. */
export const duelTayyor = (kod: string): Promise<DuelHolat & DuelJonli> =>
  duelPost<DuelHolat & DuelJonli>(`/api/v1/duel/${encodeURIComponent(kod)}/tayyor`);

/** Jonli holat. So'rovning o'zi "men shu yerdaman" belgisini ham qo'yadi. */
export async function duelHolat(kod: string): Promise<DuelJonli | null> {
  if (!token && !(await signIn())) return null;
  try {
    const r = await fetch(`/api/v1/duel/${encodeURIComponent(kod)}/holat${profilQuery()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return (await r.json()) as DuelJonli;
  } catch { return null; }
}

/**
 * O'yin PAYTIDAGI ballni yuboradi va raqibnikini oladi.
 *
 * Yakuniy natija emas: bu chaqiruv duelni yopmaydi va g'olibni
 * aniqlamaydi. Xato bo'lsa jim qaytadi — o'yin davom etaveradi va
 * raqib chizig'i shunchaki bir necha soniya qotib turadi.
 */
export async function duelBall(
  kod: string, ball: number, sanoq: number[],
): Promise<DuelJonli | null> {
  try {
    return await duelPost<DuelJonli>(
      `/api/v1/duel/${encodeURIComponent(kod)}/ball`, { ball, sanoq });
  } catch { return null; }
}

/**
 * "Yana o'ynaymizmi?" — tugagan duelda.
 *
 * Ikkalasi ham bosgach javobda yangi duel kodi keladi (`keyingiKod`).
 * Bitta bosish yetarli emas: raqib rozi bo'lmaguncha tugma
 * "javobini kutyapmiz" holatida qoladi.
 */
export async function duelYana(kod: string): Promise<DuelYanaHolat | null> {
  try {
    return await duelPost<DuelYanaHolat>(`/api/v1/duel/${encodeURIComponent(kod)}/yana`);
  } catch { return null; }
}

/** "Yana o'ynaymizmi?" javobi — kim so'radi va yangi duel yasaldimi. */
export interface DuelYanaHolat {
  menYana: boolean;
  raqibYana: boolean;
  /** Bo'sh — hali ikkalasi rozi emas. */
  keyingiKod: string;
}

/** O'z duellarim — oxirgi 20 tasi. */
export async function duelRoyxat(): Promise<DuelYozuv[]> {
  if (!token && !(await signIn())) return [];
  try {
    const r = await fetch(`/api/v1/duel/royxat${profilQuery()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return [];
    return ((await r.json()) as { duellar: DuelYozuv[] }).duellar;
  } catch { return []; }
}
