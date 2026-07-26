/**
 * Backend bilan aloqa — /api/v1.
 *
 * Kirish ikki yo'l bilan bo'ladi va natija bir xil: sessiya tokeni.
 *   Telegram Mini App ichida → initData bilan
 *   Boshqa hamma joyda (veb, APK, iOS) → qurilma id bilan anonim
 *
 * Shu sabab bu fayl kelajakdagi mobil ilovada ham o'zgarishsiz ishlaydi.
 */
const TOKEN_KEY = "az_token";
const DEVICE_KEY = "az_device";
/** Tanlangan profil — qaysi bolaning progressi bilan ishlayapmiz. */
const PROFIL_KEY = "az_profil";
/** Oxirgi ma'lum profil soni. Nega saqlanadi — `profilSoni()` ga qarang. */
const PROFIL_SONI_KEY = "az_profil_soni";

type TG = { initData?: string; ready?: () => void; expand?: () => void };
const tg = (): TG | undefined => (window as unknown as { Telegram?: { WebApp: TG } }).Telegram?.WebApp;

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
const bilanProfil = <T extends Record<string, unknown>>(b: T): T =>
  (profilId ? { ...b, profileId: profilId } : b);

const profilQuery = (): string => (profilId ? `?profileId=${encodeURIComponent(profilId)}` : "");

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
 * Ayni paytda ketayotgan kirish.
 *
 * Ilova ishga tushganda kirish bir necha joydan chaqiriladi
 * (`ProgressProvider`, hisob ekrani, tanishuv). Bularsiz har biri
 * alohida so'rov yuborardi va ekranlar bir-birini kutib qolardi.
 * Bitta va'da hammasiga yetadi.
 */
let kirishJarayoni: Promise<boolean> | null = null;

export function signIn(): Promise<boolean> {
  if (token) return Promise.resolve(true);
  if (!kirishJarayoni) {
    kirishJarayoni = kirishniBoshla().finally(() => { kirishJarayoni = null; });
  }
  return kirishJarayoni;
}

async function kirishniBoshla(): Promise<boolean> {
  try {
    const t = tg();
    // Kirish javobi hisob bilan birga profillar ro'yxatini ham beradi —
    // sonini shu yerdayoq eslab qolamiz, alohida so'rov kerak bo'lmaydi.
    type Kirish = { token: string; user?: { profillar?: unknown[] } };
    let d: Kirish;
    if (t?.initData) {
      t.ready?.(); t.expand?.();
      d = await post<Kirish>("/api/v1/auth/telegram", { initData: t.initData, platform: "tg" }, false);
    } else {
      d = await post<Kirish>("/api/v1/auth/device", { deviceId: deviceId(), platform: "web" }, false);
    }
    token = d.token;
    if (d.user?.profillar) profilSoniniYoz(d.user.profillar.length);
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (e) {
    console.warn("[api] kirish bo'lmadi:", (e as Error).message, "— faqat localStorage ishlaydi");
    return false;
  }
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

export async function putProgress(state: Record<string, string>): Promise<void> {
  if (!token) return;
  try { await post("/api/v1/progress", bilanProfil({ state })); }
  catch (e) { console.warn("[api] saqlanmadi:", (e as Error).message); }
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
  if (!token && !(await signIn())) return null;
  try {
    const r = await fetch(`/api/v1/leaderboard?davr=${davr}${profilId ? `&profileId=${profilId}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    return (await r.json()) as Reyting;
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
export const miniAppda = (): boolean => Boolean(tg()?.initData);

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
}

export async function getHisob(): Promise<Hisob | null> {
  // Kirish hali tugamagan bo'lishi mumkin: ilova endi ochilgan bo'lsa
  // token bir necha yuz millisekunddan keyin paydo bo'ladi. Kutmasak,
  // ekran "aloqa yo'q" deb noto'g'ri xabar berardi.
  if (!token && !(await signIn())) return null;
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
      const nom = maydon === "ism" ? "Ism" : maydon === "familiya" ? "Familiya" : "";
      return nom ? `${nom}: ${matn}` : matn;
    }
  }
  return "Saqlanmadi — qaytadan urinib ko'ring";
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
    return { ok: false, xato: "Aloqa yo'q — internetni tekshiring" };
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
    return { ok: false, xato: "Aloqa yo'q — internetni tekshiring" };
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
