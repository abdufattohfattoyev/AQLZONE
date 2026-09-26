/**
 * "Bugun" ekranining ma'lumoti (`screens/Bosh.tsx`, `manba/Bugun.dc.html`).
 *
 * Ekran uchta savolga javob beradi: bugun nima qilindi (uchta vazifa),
 * zanjir qanday (hafta doiralari, rekord) va keyin nima (keyingi dars).
 * Ikkitasi ilgari SAQLANMAS edi va shu yerda qo'shildi:
 *
 *   bugun dars o'tildimi   ilgari faqat "bugun nechta savol" bor edi —
 *                          u o'yin va sinovdan ham oshadi, ya'ni
 *                          "bitta dars" vazifasi uchun yaramasdi
 *   zanjir rekordi         faqat joriy zanjir saqlanardi
 *
 * Ikkalasi ham qurilmada (`localStorage`, try/catch bilan): yo'qolsa
 * vazifa bajarilmagandek ko'rinadi, xolos — hech narsa buzilmaydi.
 * Hisob-kitob React'siz, sanani parametr qilib oladi va
 * `scripts/bugun.ts` bilan sinaladi.
 */
import { kunFarqi, kunKaliti } from "./zanjir";

const DARS_KALIT = "azapp_bugun_dars_v1";
const REKORD_KALIT = "azapp_zanjir_rekord_v1";

/** Dars tugadi — bugungi "bitta dars" vazifasi bajarildi. */
export function darsBugunYoz(bugun = kunKaliti()): void {
  try { localStorage.setItem(DARS_KALIT, bugun); } catch { /* eslanmaydi, xolos */ }
}

/** Bugun kamida bitta dars tugatilganmi. */
export function darsBugunmi(bugun = kunKaliti()): boolean {
  try { return localStorage.getItem(DARS_KALIT) === bugun; } catch { return false; }
}

/**
 * Zanjir rekordi — hozirgi zanjirdan kam bo'lmaydi.
 *
 * Rekord alohida yozilmagan eski foydalanuvchida birinchi ochilishda
 * joriy zanjirga teng bo'ladi va keyin undan o'sadi.
 */
export function rekordniYangila(joriy: number): number {
  let eski = 0;
  try { eski = Number(localStorage.getItem(REKORD_KALIT)) || 0; } catch { /* yo'q */ }
  const yangi = Math.max(eski, joriy);
  if (yangi !== eski) {
    try { localStorage.setItem(REKORD_KALIT, String(yangi)); } catch { /* eslanmaydi */ }
  }
  return yangi;
}

/** Hafta doirasining holati. */
export type KunHolat = "oynagan" | "oynamagan" | "kelajak";

export interface HaftaKuni {
  /** "2026-09-26" */
  sana: string;
  /** 0 — dushanba … 6 — yakshanba. */
  indeks: number;
  holat: KunHolat;
  bugun: boolean;
}

/**
 * Joriy hafta (dushanbadan yakshanbagacha) va har kunning holati.
 *
 * Qaysi kuni o'ynalgani alohida saqlanmaydi — faqat zanjir: oxirgi
 * faol kun (`sana`) va ketma-ket kunlar soni (`kunlar`). Shundan
 * `sana` dan orqaga `kunlar` ta kun o'ynalgan deb chiqariladi. Zanjir
 * uzilgandan oldingi kunlar ko'rinmaydi — lekin doira aynan zanjirni
 * ko'rsatadi, shuning uchun bu to'g'ri: uzilgan kun "o'ynagan" emas.
 *
 * Zanjir kecha yoki bugun tugamagan bo'lsa — u uzilgan va haftada
 * hech bir kun belgilanmaydi.
 */
export function hafta(z: { sana: string; kunlar: number }, bugun = kunKaliti()): HaftaKuni[] {
  const [y, m, d] = bugun.split("-").map(Number) as [number, number, number];
  const bugunD = new Date(y, m - 1, d);
  // `getDay` yakshanbani 0 deb beradi; bizda hafta dushanbadan.
  const bugunIndeks = (bugunD.getDay() + 6) % 7;
  const tirik = Boolean(z.sana) && z.kunlar > 0 && kunFarqi(z.sana, bugun) <= 1;

  return Array.from({ length: 7 }, (_, i) => {
    const kun = new Date(y, m - 1, d - bugunIndeks + i);
    const sana = kunKaliti(kun);
    let holat: KunHolat;
    if (i > bugunIndeks) holat = "kelajak";
    else {
      const oldin = tirik ? kunFarqi(sana, z.sana) : -1;
      holat = oldin >= 0 && oldin < z.kunlar ? "oynagan" : "oynamagan";
    }
    return { sana, indeks: i, holat, bugun: i === bugunIndeks };
  });
}

/** Zanjir hozir tirikmi (bugun yoki kecha davom etgan). Tirik bo'lmasa 0. */
export const joriyZanjir = (z: { sana: string; kunlar: number }, bugun = kunKaliti()): number =>
  z.sana && kunFarqi(z.sana, bugun) <= 1 ? z.kunlar : 0;

/** Kun vaqtiga qarab salom: 5–11 tong, 11–17 kun, qolgani kech. */
export function salomVaqti(soat: number): "tong" | "kun" | "kech" {
  if (soat >= 5 && soat < 11) return "tong";
  if (soat >= 11 && soat < 17) return "kun";
  return "kech";
}

/** Kun raqami yil boshidan — maslahat har kuni almashishi uchun. */
export function yilKuni(bugun = kunKaliti()): number {
  const [y, m, d] = bugun.split("-").map(Number) as [number, number, number];
  return kunFarqi(`${y}-01-01`, `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
}
