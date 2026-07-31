/**
 * O'yinlar ro'yxati — butun bo'lim shu bitta massivdan chizadi.
 *
 * Bosh sahifadagi kartalar ham, daraja tanlash ekrani ham, o'yin
 * ekranining o'zi ham shu yerdan o'qiydi. Yangi o'yin qo'shish uchun
 * bitta qator yozish kifoya: qolgan hamma joyda u o'zi paydo bo'ladi.
 *
 * TARTIB TASODIFIY EMAS. Ro'yxat oson va tanish o'yindan boshlanib,
 * asta-sekin g'ayrioddiylariga o'tadi:
 *
 *   1–3  hisoblash        (tanish: har kim nima qilishni darrov biladi)
 *   4–6  fikrlash         (qonuniyat, chamalash, tenglama)
 *   7–8  boshqa turdagi   (topishmoq va xotira — o'z taxtasi bor)
 *
 * Ilk uchtasi ro'yxat boshida turgani uchun ilova ochilgan odam
 * o'ylab o'tirmay birinchi o'yinini boshlaydi. "24" yuqorida tursa,
 * ko'pchilik uni ochib, tushunmay chiqib ketardi.
 *
 * RANGLAR ham qatorma-qator almashib boradi: yonma-yon turgan ikki
 * karta bir xil rangda bo'lsa, ular bitta narsadek ko'rinadi.
 */
import { belgi, jadval, ketma, tarozi, taxmin, tezkor } from "./savollar";
import type { Oyin, OyinId } from "./tur";

export const OYINLAR: Oyin[] = [
  {
    id: "tezkor", tur: "oqim", ic: "flame", rang: "red", emoji: "⚡",
    nom: "oyinTezkor", izoh: "oyinTezkorIzoh", qoida: "oyinTezkorQoida",
    gen: tezkor, vaqt: [60, 60, 45],
  },
  {
    id: "jadval", tur: "oqim", ic: "times", rang: "blue", emoji: "✖️",
    nom: "oyinJadval", izoh: "oyinJadvalIzoh", qoida: "oyinJadvalQoida",
    gen: jadval, vaqt: [60, 60, 60],
  },
  {
    id: "belgi", tur: "oqim", ic: "search", rang: "purple", emoji: "❓",
    nom: "oyinBelgi", izoh: "oyinBelgiIzoh", qoida: "oyinBelgiQoida",
    gen: belgi, vaqt: [60, 60, 50],
  },
  {
    id: "ketma", tur: "oqim", ic: "numline", rang: "green", emoji: "🔢",
    nom: "oyinKetma", izoh: "oyinKetmaIzoh", qoida: "oyinKetmaQoida",
    // Qonuniyatni ko'rish hisoblashdan sekinroq kechadi — vaqt ham ko'proq.
    gen: ketma, vaqt: [75, 75, 65],
  },
  {
    id: "taxmin", tur: "oqim", ic: "ruler", rang: "orange", emoji: "👁",
    nom: "oyinTaxmin", izoh: "oyinTaxminIzoh", qoida: "oyinTaxminQoida",
    gen: taxmin, vaqt: [60, 60, 50],
  },
  {
    id: "tarozi", tur: "oqim", ic: "scale", rang: "gold", emoji: "⚖️",
    nom: "oyinTarozi", izoh: "oyinTaroziIzoh", qoida: "oyinTaroziQoida",
    gen: tarozi, vaqt: [75, 75, 70],
  },
  {
    id: "yigirma", tur: "yigirma", ic: "puzzle", rang: "purple", emoji: "🎲",
    nom: "oyin24", izoh: "oyin24Izoh", qoida: "oyin24Qoida",
    // Uch daqiqa — bitta topishmoq uchun emas, QANCHASINI yechishing uchun.
    vaqt: [180, 180, 180],
  },
  {
    id: "xotira", tur: "xotira", ic: "grid", rang: "blue", emoji: "🧠",
    nom: "oyinXotira", izoh: "oyinXotiraIzoh", qoida: "oyinXotiraQoida",
    // Vaqt yo'q: bu o'yin POG'ONA bilan o'lchanadi va bitta xato bilan tugaydi.
  },
];

export const oyinById = (id: string): Oyin | undefined =>
  OYINLAR.find((o) => o.id === id);

export const OYIN_IDLAR: OyinId[] = OYINLAR.map((o) => o.id);
