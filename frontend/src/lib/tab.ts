/**
 * Pastki paneldagi BESH BO'LIM va qaysi manzil qaysi bo'limga tegishli.
 *
 * Ilgari har tugma o'zining faolligini `Panel.tsx` ichida alohida
 * hisoblardi va natijada ko'p sahifa "hech qayerda" turardi: testlar,
 * sertifikat, reyting, do'kon — panelda birorta tugma yonmasdi va odam
 * qayerdaligini bilmasdi. Endi qoida bitta joyda, React'siz yozilgan va
 * `scripts/tab.ts` bilan sinaladi.
 *
 * ESKI MANZILLAR O'CHIRILMAYDI. Bot xabarlari, kanal postlari va eski
 * havolalar `/kurs/...`, `/imtihon/...` ga olib boradi — ular ishlashda
 * qoladi, faqat qaysi tab yonishi o'zgaradi.
 */
export type TabId = "bugun" | "oqish" | "oyin" | "masalalar" | "men";

/**
 * Kurs ichidagi, lekin "Men" bo'limiga tegishli sahifalar. Ular kursga
 * bog'langan (do'kon va nishonlar kurs progressidan hisoblanadi), lekin
 * odam ularni "o'zimniki" deb qidiradi — dars xaritasi ichida emas.
 */
const MEN_KURSDA = /^\/kurs\/[^/]+\/(nishonlar|dokon|ota-ona|hisobot)$/;

/** Manzil qaysi tabga tegishli. Hech biriga bo'lmasa — `null` (qidiruv, 404). */
export function faolTab(yol: string): TabId | null {
  if (yol === "/") return "bugun";
  if (MEN_KURSDA.test(yol)) return "men";
  if (/^\/(men|reyting|profillar|sozlamalar)(\/|$)/.test(yol)) return "men";
  if (/^\/(darslar|kurs|testlar|toplam|kichkintoy)(\/|$)/.test(yol)) return "oqish";
  if (/^\/(imtihon|sertifikat|sessiya)(\/|$)/.test(yol)) return "oqish";
  if (/^\/(oyinlar|duel|xona)(\/|$)/.test(yol)) return "oyin";
  if (/^\/masalalar(\/|$)/.test(yol)) return "masalalar";
  return null;
}
