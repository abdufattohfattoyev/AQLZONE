/**
 * Tangalar do'koni.
 *
 * Shu paytgacha tangalar yig'ilardi-yu, hech narsaga sarflanmasdi —
 * ya'ni mukofot mukofot emas edi. Do'kon shu bo'shliqni to'ldiradi.
 *
 * ─────────────────── IKKI QAVAT ───────────────────
 *
 * ODDIY (25–150). Eng arzoni bir-ikki darsdan keyin olinadi — bola
 * do'konning ishlashiga darrov ishonch hosil qilsin.
 *
 * KAMYOB (250–600) va ular SHARTLI. Sabab sonlarda: har kuni bitta
 * dars qilgan bola kuniga ~12 tanga, sandiq bilan birga ~57 tanga
 * yig'adi. Oddiy qavat jami 575 turadi, ya'ni u o'n kunda yopiladi
 * va tanga yana keraksiz bo'lib qolardi — do'kon aynan shu
 * muammoni hal qilish uchun qilingan edi.
 *
 * Shart NARX EMAS va bu ataylab: tanga bilan hamma narsani sotib
 * olib bo'lsa, do'kon "kim ko'p o'ynagan" degan jadvalga aylanadi.
 * Yulduz va zanjir esa boshqa narsani aytadi — nimani o'rgangan va
 * qanchalik muntazam kelgan.
 *
 * ─────────────────── BEZAK BOSHQALARGA KO'RINADI ───────────────────
 *
 * Kiyilgan buyum reytingda, masala muallifi yonida va duelda
 * chiqadi (`avatarBelgi`). Ilgari u faqat bolaning O'ZIGA ko'rinardi
 * va shuning uchun do'kondan hech kim narsa olmasdi: 454 profildan
 * atigi 6 tasi bir marta bo'lsa ham xarid qilgan.
 */
import { t } from "./matn";
import type { Kalit } from "./matn";

/** Buyumni ochish sharti. Yo'q bo'lsa — hamma uchun ochiq. */
export interface Shart {
  /** `yulduz` — jami yulduz, `zanjir` — ketma-ket kunlar. */
  tur: "yulduz" | "zanjir";
  qiymat: number;
}

export interface Buyum {
  id: string;
  /** Lug'at kaliti — nom `nomi()` orqali tilga qarab olinadi. */
  kalit: Kalit;
  nom: string;
  /** Aql (brend belgisi) ustiga chiqadigan belgi. */
  belgi: string;
  narx: number;
  /** Kamyob buyum — ro'yxatda ajratib ko'rsatiladi. */
  kamyob?: boolean;
  shart?: Shart;
}

export const BUYUMLAR: Buyum[] = [
  /* --- oddiy qavat --- */
  { id: "gul",       kalit: "bGul",       nom: "Gul",       belgi: "🌸", narx: 25 },
  { id: "shlyapa",   kalit: "bShlyapa",   nom: "Shlyapa",   belgi: "🎩", narx: 30 },
  { id: "kozoynak",  kalit: "bKozoynak",  nom: "Ko'zoynak", belgi: "🕶️", narx: 40 },
  { id: "sharf",     kalit: "bSharf",     nom: "Sharf",     belgi: "🧣", narx: 60 },
  { id: "kitob",     kalit: "bKitob",     nom: "Kitob",     belgi: "📚", narx: 70 },
  { id: "yulduzcha", kalit: "bYulduzcha", nom: "Yulduzcha", belgi: "✨", narx: 80 },
  { id: "toj",       kalit: "bToj",       nom: "Toj",       belgi: "👑", narx: 120 },
  { id: "raketa",    kalit: "bRaketa",    nom: "Raketa",    belgi: "🚀", narx: 150 },

  /* --- kamyob qavat: tanga YETARLI EMAS, shart ham kerak --- */
  {
    id: "olov", kalit: "bOlov", nom: "Olov", belgi: "🔥", narx: 250,
    kamyob: true, shart: { tur: "zanjir", qiymat: 7 },
  },
  {
    id: "bilim", kalit: "bBilim", nom: "Bilim shohi", belgi: "🎓", narx: 300,
    kamyob: true, shart: { tur: "yulduz", qiymat: 50 },
  },
  {
    id: "kubok", kalit: "bKubok", nom: "Kubok", belgi: "🏆", narx: 350,
    kamyob: true, shart: { tur: "yulduz", qiymat: 100 },
  },
  {
    id: "kometa", kalit: "bKometa", nom: "Kometa", belgi: "☄️", narx: 400,
    kamyob: true, shart: { tur: "zanjir", qiymat: 14 },
  },
  {
    id: "olmos", kalit: "bOlmos", nom: "Olmos", belgi: "💎", narx: 500,
    kamyob: true, shart: { tur: "yulduz", qiymat: 200 },
  },
  {
    id: "ajdar", kalit: "bAjdar", nom: "Ajdar", belgi: "🐉", narx: 600,
    kamyob: true, shart: { tur: "zanjir", qiymat: 30 },
  },
];

/** Buyum nomi — joriy tilda. */
export const buyumNomi = (b: Buyum): string => t(b.kalit);

export const buyumTop = (id: string): Buyum | undefined =>
  BUYUMLAR.find((b) => b.id === id);

/** Shart bajarilganmi. Shartsiz buyumda har doim `true`. */
export function shartBajarildi(
  b: Buyum, yulduz: number, zanjir: number,
): boolean {
  if (!b.shart) return true;
  return b.shart.tur === "yulduz" ? yulduz >= b.shart.qiymat : zanjir >= b.shart.qiymat;
}

/** Shart matni — "50 yulduz kerak" yoki "7 kunlik zanjir kerak". */
export const shartMatni = (b: Buyum): string =>
  !b.shart ? ""
    : b.shart.tur === "yulduz"
      ? t("shartYulduz", { n: b.shart.qiymat })
      : t("shartZanjir", { n: b.shart.qiymat });

/**
 * Profil belgisidan ko'rinadigan emoji.
 *
 * Serverda saqlanadigan qiymat — do'kon buyumining `id` si
 * ("shlyapa"), ya'ni uni shundayligicha chizib bo'lmaydi. Eski
 * hisoblarda u yerda emoji turgan bo'lishi ham mumkin — o'sha
 * paytda profil belgisi qo'lda tanlanardi — shuning uchun tanilmagan
 * qiymat SHUNDAYLIGICHA qaytariladi va faqat bo'sh bo'lsa tulki
 * ko'rsatiladi.
 */
export function avatarBelgi(avatar: string): string {
  const b = buyumTop(avatar);
  if (b) return b.belgi;
  return avatar || "🦊";
}
