/**
 * Bitta savol (activity) turlari.
 *
 * Hammasida `prompt` (Aql nima deyishi), `answer` va `choices` bor —
 * shu sababli hali maxsus chizuvchisi yo'q turlar ham o'ynasa bo'ladi:
 * savol matni va variantlar ko'rsatiladi, faqat rasm qismi keyin qo'shiladi.
 */
export type Answer = number | string;

/**
 * Javob tugmalari qanday chiziladi.
 *
 * 1-sinf bolasi hali o'qiy olmaydi, shuning uchun eng boshlang'ich
 * darslarda variantlar MATN bo'lmasligi kerak: rang bo'lsa — rangli
 * doira, rasm bo'lsa — katta rasm. Shunda bola savolni hech kimning
 * yordamisiz yechadi.
 *
 * "belgi" — bitta harf yoki raqam. U ham matn, lekin ancha katta
 * chiziladi: maktabgacha bola harfni tanimaydi, RASMDEK ko'radi,
 * shuning uchun u ko'zga to'la ko'rinishi kerak.
 */
export type ChoiceKind = "matn" | "rang" | "emoji" | "belgi";

interface Base {
  prompt: string;
  answer: Answer;
  choices: Answer[];
  /** Berilmasa "matn" deb olinadi. */
  kind?: ChoiceKind;
  /**
   * Savol qaysi darsdan olingani. Faqat XATOLAR DAFTARI takrorlashida
   * to'ldiriladi: u yerda savollar turli darslardan yig'iladi va har
   * birining javobi o'z yozuviga qaytishi kerak (`lib/daftar.ts`).
   */
  joy?: { kurs: string; ui: number; li: number };
}

/** Oddiy ifoda: "345 + 278 = ?" */
export interface Eqn extends Base { type: "eqn"; text: string }
/** Ustun shaklida qo'shish/ayirish. */
export interface Column extends Base { type: "column"; op: "+" | "−"; a: number; b: number; answer: number }
/** Sonlar nuri — tushib qolgan sonni topish. */
export interface NumRay extends Base { type: "numray"; arr: number[]; hide: number }
/** Butunning bo'yalgan ulushi. */
export interface Frac extends Base { type: "frac"; parts: number; shaded: number }
/** Soat ko'rsatkichi. */
export interface Clock extends Base { type: "clock"; h: number; m: number }
/** To'g'ri to'rtburchak perimetri. */
export interface Perim extends Base { type: "perim"; w: number; h: number }
/** Katakli yuza. */
export interface Area extends Base { type: "area"; w: number; h: number }
/** Shakl nomi / burchaklari. */
export interface ShapeQ extends Base { type: "shapeName" | "corners"; shape: ShapeKey }
/** Teng guruhlar — ko'paytirish/bo'lish ma'nosi. */
export interface Groups extends Base { type: "mulvis" | "divvis"; g: number; k: number; emoji: string }
/** Katakchada joylashuv. */
export interface Coord extends Base { type: "coord"; w: number; h: number; cx: number; cy: number; emoji: string }
/** Piktogramma jadval. */
export interface DataQ extends Base { type: "data"; rows: { emoji: string; n: number }[] }

/* --- 1-sinf turlari: bu yoshda savol RASM bo'lishi kerak, matn emas --- */

/** Bitta katta rang — "shu rangni top". */
export interface RangQ extends Base { type: "rang"; rang: string }
/** Bitta katta rasm — "shu rasmni top", hayvon yoki narsa. */
export interface RasmQ extends Base { type: "rasm"; emoji: string }
/** Narsalarni sanash. */
export interface CountQ extends Base { type: "count"; emoji: string; n: number }
/**
 * Ikki guruh narsa yonma-yon.
 *
 * Ikki xil savolga xizmat qiladi: "qayerda ko'p?" (taqqoslash) va
 * "hammasi nechta?" (qo'shish). Ikkinchisida `plus` yoqiladi — guruhlar
 * orasida "+" chiqadi, ya'ni bola ikkitasini BIRGA sanashi kerakligini
 * o'zi tushunadi.
 */
export interface CmpVis extends Base { type: "cmpvis"; a: number; b: number; emoji: string; plus?: boolean }
/** Ortiqchasini top — bittasi boshqacha. */
export interface OddQ extends Base { type: "odd"; items: string[]; odd: number }
/** Fazoviy joylashuv: yuqorida / pastda / o'ngda / chapda / o'rtada. */
export interface PosQ extends Base { type: "pos"; emoji: string; cell: number }
/** O'nlik dastalari va yakka birliklar. */
export interface TensQ extends Base { type: "tens"; tens: number; units: number }

/* --- Maktabgacha turlari (4–6 yosh): hech qanday matn yo'q --- */

/**
 * Naqsh davomi: 🔴 🔵 🔴 🔵 → keyingisi qaysi?
 *
 * Ko'rinishida oxirgi katak "?" bo'lib chiziladi. Bu yoshda naqsh ilg'ash
 * matematikaning eng birinchi mantiqiy ko'nikmasi — sanashdan ham oldin
 * keladi va o'qish umuman talab qilmaydi.
 */
export interface NaqshQ extends Base { type: "naqsh"; items: string[] }

/** Bitta katta harf yoki raqam — uni tanish. */
export interface BelgiQ extends Base { type: "belgi"; belgi: string }

/**
 * Ayirish — ko'z bilan: `n` ta narsadan `k` tasi chizib tashlangan.
 *
 * Bu yoshda "5 − 2" mavhum: bola sonlar bilan emas, NARSALAR bilan ishlaydi.
 * Ketganlari o'chib ketmaydi, chizilib qoladi — shunda bola "nechtasi
 * ketdi" va "nechtasi qoldi" ni bir vaqtda ko'radi.
 */
export interface AyirQ extends Base { type: "ayirvis"; n: number; k: number; emoji: string }

export type Activity =
  | Eqn | Column | NumRay | Frac | Clock | Perim | Area | ShapeQ | Groups | Coord | DataQ
  | RangQ | RasmQ | CountQ | CmpVis | OddQ | PosQ | TensQ
  | NaqshQ | BelgiQ | AyirQ;

export type ActivityType = Activity["type"];

/** Savol yasovchi funksiya — dasturda shular ro'yxati turadi. */
export type Gen = () => Activity;

export const SHAPES = {
  circle: { name: "Doira", corners: 0 },
  triangle: { name: "Uchburchak", corners: 3 },
  square: { name: "Kvadrat", corners: 4 },
  rect: { name: "To'rtburchak", corners: 4 },
  pentagon: { name: "Beshburchak", corners: 5 },
} as const;

export type ShapeKey = keyof typeof SHAPES;

export const OBJS = ["🍎", "⭐", "🎈", "🐟", "🌸", "🦆", "🍪", "🚗", "🍓", "🐝", "🌻", "🐞"] as const;

/**
 * Ranglar — 1-sinfning eng birinchi mavzusi.
 *
 * Qiymat sifatida NOM emas, HEX kodi ishlatiladi: javob tugmasi shu rang
 * bilan bo'yaladi va bola o'qimasdan tanlaydi. Nom faqat savol matnida
 * (kattalar o'qib berishi uchun) chiqadi.
 */
export const RANGLAR = [
  { nom: "qizil", hex: "#f2453d" },
  { nom: "sariq", hex: "#f7c325" },
  { nom: "ko'k", hex: "#3d8ef2" },
  { nom: "yashil", hex: "#3fb865" },
  { nom: "to'q sariq", hex: "#f78c25" },
  { nom: "binafsha", hex: "#9b5de5" },
  { nom: "pushti", hex: "#f56dbc" },
  { nom: "jigarrang", hex: "#96603b" },
] as const;

export const rangNomi = (hex: string) => RANGLAR.find((r) => r.hex === hex)?.nom ?? "rang";

/**
 * Faqat to'rt asosiy rang — maktabgacha yoshning eng birinchi darsi.
 *
 * Sakkizta rang 4 yoshli bola uchun ko'p: "to'q sariq" bilan "sariq" ni
 * ajratish allaqachon keyingi qadam. Shuning uchun boshda qizil, sariq,
 * ko'k, yashil bilan cheklanamiz.
 */
export const ASOSIY_RANGLAR = RANGLAR.slice(0, 4);

/**
 * Maktabgacha kursning to'liq rang to'plami — yetti rang.
 *
 * Qora va oq bu ro'yxatda bor, lekin `RANGLAR` da yo'q: ular 1-sinf
 * savollarida chalg'ituvchi bo'lib chiqsa, oq doira oq kartada ko'rinmay
 * qolardi. Bu yerda esa ular kerak — bola dunyoni shu ikki rangsiz
 * tasavvur qila olmaydi. Ko'rinishi uchun javob tugmasi doim ingichka
 * chegara bilan chiziladi (`screens/Lesson.tsx`).
 */
export const MAKTAB_RANGLAR = [
  { nom: "qizil", hex: "#f2453d" },
  { nom: "yashil", hex: "#3fb865" },
  { nom: "ko'k", hex: "#3d8ef2" },
  { nom: "sariq", hex: "#f7c325" },
  { nom: "binafsha", hex: "#9b5de5" },
  { nom: "qora", hex: "#2f2b28" },
  { nom: "oq", hex: "#ffffff" },
] as const;

/**
 * Narsaning TABIIY rangi: "olma qanday rangda?"
 *
 * Rangni mavhum doirada emas, tanish narsada ko'rish — bu yoshdagi bola
 * uchun ancha oson. `hex` ataylab RANGLAR ichidagi qiymatlardan olinadi,
 * shunda javob tugmalari o'sha palitrada bo'yaladi.
 */
export const RANGLI_NARSA = [
  { e: "🍎", nom: "olma", hex: "#f2453d" },
  { e: "🍌", nom: "banan", hex: "#f7c325" },
  { e: "🍇", nom: "uzum", hex: "#9b5de5" },
  { e: "🌳", nom: "daraxt", hex: "#3fb865" },
  { e: "🍊", nom: "apelsin", hex: "#f78c25" },
  { e: "🌊", nom: "dengiz", hex: "#3d8ef2" },
  { e: "🐻", nom: "ayiq", hex: "#96603b" },
  { e: "🌷", nom: "lola", hex: "#f56dbc" },
] as const;

/**
 * Shakllar — maktabgacha yoshda emoji ko'rinishida.
 *
 * Kattalar kursida shakl SVG bo'lib chiziladi va javob variantlari NOM
 * bo'ladi — ya'ni o'qish kerak. Bu yerda esa savol ham, javob ham rasm:
 * bola shaklni ko'rib, xuddi shunisini tanlaydi.
 */
export const SHAKL_EMOJI = [
  { e: "⭕", nom: "doira" },
  { e: "🔺", nom: "uchburchak" },
  { e: "🟥", nom: "kvadrat" },
  { e: "⭐", nom: "yulduz" },
  { e: "❤️", nom: "yurak" },
  { e: "🔷", nom: "romb" },
] as const;

/** Kim nima yeydi — hayvon va uning yemi. */
export const YEM = [
  { h: "🐰", nom: "quyon", y: "🥕" },
  { h: "🐭", nom: "sichqon", y: "🧀" },
  { h: "🐶", nom: "it", y: "🦴" },
  { h: "🐱", nom: "mushuk", y: "🐟" },
  { h: "🐻", nom: "ayiq", y: "🍯" },
  { h: "🐵", nom: "maymun", y: "🍌" },
  { h: "🐴", nom: "ot", y: "🌾" },
  { h: "🐝", nom: "asalari", y: "🌸" },
] as const;

/** Guruhlar — "qaysi biri meva?" savoli uchun. */
export const GURUHLAR = [
  { nom: "meva", items: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🍐"] },
  { nom: "hayvon", items: ["🐶", "🐱", "🐰", "🐘", "🦁", "🐻", "🐮"] },
  { nom: "mashina", items: ["🚗", "🚌", "🚂", "✈️", "🚲", "🚢"] },
  { nom: "kiyim", items: ["👕", "👖", "🧦", "🧢", "👗", "🧥"] },
  { nom: "gul", items: ["🌷", "🌻", "🌸", "🌹", "🌼"] },
] as const;

/** Kayfiyat — yuz ifodasini o'qish. */
export const KAYFIYAT = [
  { e: "😀", nom: "xursand" },
  { e: "😢", nom: "yig'layapti" },
  { e: "😠", nom: "jahli chiqqan" },
  { e: "😴", nom: "uxlayapti" },
  { e: "😮", nom: "hayron qolgan" },
  { e: "🥶", nom: "sovqotgan" },
] as const;

/**
 * Harflar — o'zbek alifbosining eng tanish, adashtirmaydigan harflari.
 *
 * Bu yoshda maqsad O'QISH emas: harfni RASM sifatida tanish. Shuning
 * uchun "o'" va "g'" kabi apostrofli harflar hozircha yo'q — ular
 * kichkintoy uchun bir emas, ikki belgidek ko'rinadi.
 */
export const HARFLAR = ["A", "B", "D", "E", "F", "G", "H", "I", "K", "L",
  "M", "N", "O", "P", "Q", "R", "S", "T", "U", "Y", "Z"] as const;

/**
 * So'zning bosh harfi — o'qishga tayyorgarlikning asosiy mashqi.
 *
 * Bola rasmni ko'radi, kattalar nomini aytadi ("o-o-olma"), bola birinchi
 * tovushni harfdan topadi. Nomlar ataylab bitta tovush bilan boshlanadi:
 * "shar" yoki "cho'chqa" bo'lmaydi, chunki ularning boshi ikki harf.
 */
export const BOSH_HARF = [
  { e: "🍎", nom: "olma", h: "O" },
  { e: "🍌", nom: "banan", h: "B" },
  { e: "🍇", nom: "uzum", h: "U" },
  { e: "🐘", nom: "fil", h: "F" },
  { e: "🐶", nom: "it", h: "I" },
  { e: "🐱", nom: "mushuk", h: "M" },
  { e: "🐰", nom: "quyon", h: "Q" },
  { e: "🦊", nom: "tulki", h: "T" },
  { e: "🌸", nom: "gul", h: "G" },
  { e: "🐟", nom: "baliq", h: "B" },
  { e: "📕", nom: "kitob", h: "K" },
  { e: "🍞", nom: "non", h: "N" },
  { e: "🐝", nom: "asalari", h: "A" },
  { e: "🌳", nom: "daraxt", h: "D" },
  { e: "🐐", nom: "echki", h: "E" },
  { e: "🌷", nom: "lola", h: "L" },
  { e: "🚗", nom: "mashina", h: "M" },
  { e: "🥕", nom: "sabzi", h: "S" },
  { e: "🦓", nom: "zebra", h: "Z" },
  { e: "🍐", nom: "nok", h: "N" },
] as const;

/* ================= Atrofdagi dunyo =================
 * Maktabgacha yoshda matematika yolg'iz kelmaydi. Bola avval DUNYONI
 * nomlashni o'rganadi: hayvon, meva, transport, ob-havo, kun qismlari.
 * Quyidagi ro'yxatlar shu darslarning butun mazmuni — savollar shulardan
 * yasaladi, shuning uchun har bir yozuvda ikki narsa bo'lishi shart:
 * BOLA KO'RADIGAN rasm (`e`) va KATTALAR O'QIB BERADIGAN nom (`nom`).
 */

/**
 * Hayvon va uning tovushi.
 *
 * "Kim 'vov-vov' deydi?" — bu yoshdagi eng sevimli savol. Tovush matn
 * ko'rinishida yozilgan: ovoz yoqilganda ilova uni o'zi aytadi, ovozsiz
 * paytda esa kattalar o'qib beradi. Ya'ni dars mp3 fayllarga bog'lanib
 * qolmaydi va bugun ham ishlaydi.
 */
export const HAYVON_OVOZ = [
  { e: "🐶", nom: "it", ovoz: "vov-vov" },
  { e: "🐱", nom: "mushuk", ovoz: "miyov" },
  { e: "🐮", nom: "sigir", ovoz: "mu-u" },
  { e: "🐑", nom: "qo'y", ovoz: "ba-a" },
  { e: "🐔", nom: "tovuq", ovoz: "qo'-qo'-qo'" },
  { e: "🐓", nom: "xo'roz", ovoz: "qu-qa-ri-qu" },
  { e: "🐸", nom: "baqa", ovoz: "qur-qur" },
  { e: "🦁", nom: "arslon", ovoz: "rrr" },
  { e: "🐴", nom: "ot", ovoz: "ih-ih" },
  { e: "🐷", nom: "cho'chqa", ovoz: "xryu" },
  { e: "🦆", nom: "o'rdak", ovoz: "g'a-g'a" },
  { e: "🐝", nom: "asalari", ovoz: "vizz" },
] as const;

/** Mevalar. `hex` — mevaning rangi, "qizil mevani top" darsi uchun. */
export const MEVA = [
  { e: "🍎", nom: "olma", hex: "#f2453d" },
  { e: "🍌", nom: "banan", hex: "#f7c325" },
  { e: "🍇", nom: "uzum", hex: "#9b5de5" },
  { e: "🍉", nom: "tarvuz", hex: "#3fb865" },
  { e: "🍓", nom: "qulupnay", hex: "#f2453d" },
  { e: "🍊", nom: "apelsin", hex: "#f78c25" },
  { e: "🍐", nom: "nok", hex: "#3fb865" },
  { e: "🍒", nom: "gilos", hex: "#f2453d" },
  { e: "🍑", nom: "shaftoli", hex: "#f78c25" },
  { e: "🍋", nom: "limon", hex: "#f7c325" },
] as const;

/** Transport. `qayer` — "u qayerda yuradi?" darsi shunga tayanadi. */
export const TRANSPORT = [
  { e: "🚗", nom: "mashina", qayer: "yerda" },
  { e: "🚌", nom: "avtobus", qayer: "yerda" },
  { e: "🚂", nom: "poyezd", qayer: "yerda" },
  { e: "🚲", nom: "velosiped", qayer: "yerda" },
  { e: "🚕", nom: "taksi", qayer: "yerda" },
  { e: "✈️", nom: "samolyot", qayer: "havoda" },
  { e: "🚁", nom: "vertolyot", qayer: "havoda" },
  { e: "🚀", nom: "raketa", qayer: "havoda" },
  { e: "🚢", nom: "kema", qayer: "suvda" },
  { e: "⛵", nom: "yelkanli qayiq", qayer: "suvda" },
] as const;

/**
 * Uzun–qisqa, baland–past juftlari.
 *
 * Har juftda ikki narsa bir turdan, lekin o'lchami aniq farq qiladi.
 * "Daraxt va maysa" kabi juftda javob munozarasiz bo'ladi — 4 yoshli bola
 * ham ikkilanmaydi.
 */
export const OLCHAM_JUFT = [
  { katta: "🌳", kichik: "🌱", nomK: "daraxt", nomKi: "maysa", sifat: "baland" },
  { katta: "🐘", kichik: "🐭", nomK: "fil", nomKi: "sichqon", sifat: "katta" },
  { katta: "🚂", kichik: "🚲", nomK: "poyezd", nomKi: "velosiped", sifat: "uzun" },
  { katta: "🐍", kichik: "🐛", nomK: "ilon", nomKi: "qurt", sifat: "uzun" },
  { katta: "🏢", kichik: "🏠", nomK: "bino", nomKi: "uy", sifat: "baland" },
  { katta: "🦒", kichik: "🐈", nomK: "jirafa", nomKi: "mushuk", sifat: "baland" },
] as const;

/** Yo'nalishlar — strelka ko'rinishida, o'qish umuman kerak emas. */
export const YONALISH = [
  { e: "⬆️", nom: "yuqoriga" },
  { e: "⬇️", nom: "pastga" },
  { e: "⬅️", nom: "chapga" },
  { e: "➡️", nom: "o'ngga" },
] as const;

/** Kun qismlari. Tartib muhim — "keyin nima bo'ladi?" savoli shunga tayanadi. */
export const KUN_TARTIBI = [
  { e: "🌞", nom: "ertalab" },
  { e: "☀️", nom: "tush" },
  { e: "🌇", nom: "kech" },
  { e: "🌙", nom: "tun" },
] as const;

/**
 * Hafta kunlari.
 *
 * Diqqat: bu kursdagi YAGONA dars, javobi so'z bo'ladigan. Boshqa iloji
 * yo'q — kun nomining rasmi bo'lmaydi. Shuning uchun u ataylab oxirroqda
 * turadi va ovoz yoqilganda to'liq mustaqil ishlaydi.
 */
export const HAFTA = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba",
  "Juma", "Shanba", "Yakshanba"] as const;

/** Ob-havo. `kiyim` — "bunday kunda nima kerak?" savoli uchun. */
export const OB_HAVO = [
  { e: "☀️", nom: "quyoshli", kiyim: "🕶️", kiyimNom: "ko'zoynak" },
  { e: "🌧️", nom: "yomg'irli", kiyim: "☂️", kiyimNom: "soyabon" },
  { e: "❄️", nom: "qorli", kiyim: "🧥", kiyimNom: "issiq kiyim" },
  { e: "⛅", nom: "bulutli", kiyim: "👕", kiyimNom: "yengil kiyim" },
] as const;

/**
 * Hayvonlar — bolaga eng tanish va eng yoqimli mavzu.
 *
 * `o` — hayvonning HAQIQIY kattaligi (1 eng kichik … 5 eng katta).
 * "Katta–kichik" darsi shunga tayanadi: bola rasmlarga qarab, hech narsa
 * o'qimasdan eng kattasini tanlaydi.
 */
export const HAYVONLAR = [
  { e: "🐜", nom: "chumoli", o: 1 }, { e: "🐝", nom: "asalari", o: 1 },
  { e: "🐭", nom: "sichqon", o: 2 }, { e: "🐤", nom: "jo'ja", o: 2 },
  { e: "🐸", nom: "baqa", o: 2 }, { e: "🐔", nom: "tovuq", o: 2 },
  { e: "🐰", nom: "quyon", o: 3 }, { e: "🐱", nom: "mushuk", o: 3 },
  { e: "🐶", nom: "it", o: 3 }, { e: "🦊", nom: "tulki", o: 3 },
  { e: "🐷", nom: "cho'chqa", o: 4 }, { e: "🐑", nom: "qo'y", o: 4 },
  { e: "🐻", nom: "ayiq", o: 4 }, { e: "🦁", nom: "sher", o: 4 },
  { e: "🐮", nom: "sigir", o: 5 }, { e: "🐴", nom: "ot", o: 5 },
  { e: "🐘", nom: "fil", o: 5 },
] as const;

export const hayvonNomi = (e: string) => HAYVONLAR.find((h) => h.e === e)?.nom ?? "hayvon";

const NAMES: Record<string, string> = {
  "🍎": "olma", "⭐": "yulduz", "🎈": "shar", "🐟": "baliq", "🌸": "gul", "🦆": "o'rdak",
  "🍪": "pechene", "🚗": "mashina", "🍓": "qulupnay", "🐝": "asalari", "🌻": "kungaboqar", "🐞": "qo'ng'iz",
};
export const objName = (e: string) => NAMES[e] ?? "narsa";
