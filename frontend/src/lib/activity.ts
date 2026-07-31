/**
 * Bitta savol (activity) turlari.
 *
 * Hammasida `prompt` (Aql nima deyishi), `answer` va `choices` bor —
 * shu sababli hali maxsus chizuvchisi yo'q turlar ham o'ynasa bo'ladi:
 * savol matni va variantlar ko'rsatiladi, faqat rasm qismi keyin qo'shiladi.
 */
import { til } from "./til";

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

/* ================= ma'lumot ro'yxatlari =================
 * Har bir yozuvda ikki nom bor: `nom` (o'zbekcha) va `ru` (ruscha).
 * Ular savol matnida ishlatiladi, shuning uchun HAR JOYDA `nomi()`
 * orqali o'qiladi — to'g'ridan-to'g'ri `.nom` yozilsa ruscha darsda
 * o'zbekcha so'z chiqib qolardi.
 *
 * Ruscha nom SIFAT bilan kelishishi kerak bo'lgan joylarda (masalan
 * "qizil olma" → "красное яблоко") yozuvda `r` — jins turadi. Ranglar
 * esa uchala shaklda saqlanadi.
 */

/** Ruscha ot jinsi — rang sifati shunga qarab kelishadi. */
export type Rod = "m" | "f" | "n";

/** Ikki tilli nomi bor har qanday yozuv. */
export interface Nomli {
  nom: string;
  ru?: string;
}

/** Yozuvning joriy tildagi nomi. */
export const nomi = (x: Nomli): string => (til() === "ru" ? (x.ru ?? x.nom) : x.nom);

export const SHAPES = {
  circle: { name: "Doira", nameRu: "круг", corners: 0 },
  triangle: { name: "Uchburchak", nameRu: "треугольник", corners: 3 },
  square: { name: "Kvadrat", nameRu: "квадрат", corners: 4 },
  rect: { name: "To'rtburchak", nameRu: "прямоугольник", corners: 4 },
  pentagon: { name: "Beshburchak", nameRu: "пятиугольник", corners: 5 },
} as const;

export type ShapeKey = keyof typeof SHAPES;

/**
 * Shakl nomi javob tugmasida turadi, shuning uchun ruschada ham BOSH
 * HARF bilan yoziladi — qolgan variantlar bilan bir ko'rinishda bo'lsin.
 */
export const shaklNomi = (k: ShapeKey): string =>
  til() === "ru"
    ? SHAPES[k].nameRu.charAt(0).toUpperCase() + SHAPES[k].nameRu.slice(1)
    : SHAPES[k].name;

export const OBJS = ["🍎", "⭐", "🎈", "🐟", "🌸", "🦆", "🍪", "🚗", "🍓", "🐝", "🌻", "🐞"] as const;

/**
 * Ranglar — 1-sinfning eng birinchi mavzusi.
 *
 * Qiymat sifatida NOM emas, HEX kodi ishlatiladi: javob tugmasi shu rang
 * bilan bo'yaladi va bola o'qimasdan tanlaydi. Nom faqat savol matnida
 * (kattalar o'qib berishi uchun) chiqadi.
 */
export const RANGLAR = [
  { nom: "qizil", ru: "красный", ruF: "красная", ruN: "красное", hex: "#f2453d" },
  { nom: "sariq", ru: "жёлтый", ruF: "жёлтая", ruN: "жёлтое", hex: "#f7c325" },
  { nom: "ko'k", ru: "синий", ruF: "синяя", ruN: "синее", hex: "#3d8ef2" },
  { nom: "yashil", ru: "зелёный", ruF: "зелёная", ruN: "зелёное", hex: "#3fb865" },
  { nom: "to'q sariq", ru: "оранжевый", ruF: "оранжевая", ruN: "оранжевое", hex: "#f78c25" },
  { nom: "binafsha", ru: "фиолетовый", ruF: "фиолетовая", ruN: "фиолетовое", hex: "#9b5de5" },
  { nom: "pushti", ru: "розовый", ruF: "розовая", ruN: "розовое", hex: "#f56dbc" },
  { nom: "jigarrang", ru: "коричневый", ruF: "коричневая", ruN: "коричневое", hex: "#96603b" },
] as const;

export const rangNomi = (hex: string) => {
  const r = RANGLAR.find((x) => x.hex === hex);
  if (!r) return til() === "ru" ? "цвет" : "rang";
  return til() === "ru" ? r.ru : r.nom;
};

/**
 * Rang sifati OT JINSIGA kelishtirilgan holda.
 *
 * O'zbekchada sifat o'zgarmaydi ("qizil olma", "qizil gilos"), ruschada
 * esa uch shakl bor. Busiz "красный яблоко" kabi gap chiqardi va bu
 * o'qib beradigan ota-onaning ko'ziga darrov tashlanadi.
 */
export function rangSifat(hex: string, r: Rod): string {
  const x = [...RANGLAR, ...MAKTAB_RANGLAR].find((c) => c.hex === hex);
  if (!x) return til() === "ru" ? "цветной" : "rangli";
  if (til() !== "ru") return x.nom;
  return r === "f" ? x.ruF : r === "n" ? x.ruN : x.ru;
}

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
  { nom: "qizil", ru: "красный", ruF: "красная", ruN: "красное", hex: "#f2453d" },
  { nom: "yashil", ru: "зелёный", ruF: "зелёная", ruN: "зелёное", hex: "#3fb865" },
  { nom: "ko'k", ru: "синий", ruF: "синяя", ruN: "синее", hex: "#3d8ef2" },
  { nom: "sariq", ru: "жёлтый", ruF: "жёлтая", ruN: "жёлтое", hex: "#f7c325" },
  { nom: "binafsha", ru: "фиолетовый", ruF: "фиолетовая", ruN: "фиолетовое", hex: "#9b5de5" },
  { nom: "qora", ru: "чёрный", ruF: "чёрная", ruN: "чёрное", hex: "#2f2b28" },
  { nom: "oq", ru: "белый", ruF: "белая", ruN: "белое", hex: "#ffffff" },
] as const;

/**
 * Narsaning TABIIY rangi: "olma qanday rangda?"
 *
 * Rangni mavhum doirada emas, tanish narsada ko'rish — bu yoshdagi bola
 * uchun ancha oson. `hex` ataylab RANGLAR ichidagi qiymatlardan olinadi,
 * shunda javob tugmalari o'sha palitrada bo'yaladi.
 */
export const RANGLI_NARSA = [
  { e: "🍎", nom: "olma", ru: "яблоко", hex: "#f2453d" },
  { e: "🍌", nom: "banan", ru: "банан", hex: "#f7c325" },
  { e: "🍇", nom: "uzum", ru: "виноград", hex: "#9b5de5" },
  { e: "🌳", nom: "daraxt", ru: "дерево", hex: "#3fb865" },
  { e: "🍊", nom: "apelsin", ru: "апельсин", hex: "#f78c25" },
  { e: "🌊", nom: "dengiz", ru: "море", hex: "#3d8ef2" },
  { e: "🐻", nom: "ayiq", ru: "медведь", hex: "#96603b" },
  { e: "🌷", nom: "lola", ru: "тюльпан", hex: "#f56dbc" },
] as const;

/**
 * Shakllar — maktabgacha yoshda emoji ko'rinishida.
 *
 * Kattalar kursida shakl SVG bo'lib chiziladi va javob variantlari NOM
 * bo'ladi — ya'ni o'qish kerak. Bu yerda esa savol ham, javob ham rasm:
 * bola shaklni ko'rib, xuddi shunisini tanlaydi.
 */
export const SHAKL_EMOJI = [
  { e: "⭕", nom: "doira", ru: "круг" },
  { e: "🔺", nom: "uchburchak", ru: "треугольник" },
  { e: "🟥", nom: "kvadrat", ru: "квадрат" },
  { e: "⭐", nom: "yulduz", ru: "звезда" },
  { e: "❤️", nom: "yurak", ru: "сердце" },
  { e: "🔷", nom: "romb", ru: "ромб" },
] as const;

/** Kim nima yeydi — hayvon va uning yemi. */
export const YEM = [
  { h: "🐰", nom: "quyon", ru: "заяц", y: "🥕" },
  { h: "🐭", nom: "sichqon", ru: "мышка", y: "🧀" },
  { h: "🐶", nom: "it", ru: "собака", y: "🦴" },
  { h: "🐱", nom: "mushuk", ru: "кот", y: "🐟" },
  { h: "🐻", nom: "ayiq", ru: "медведь", y: "🍯" },
  { h: "🐵", nom: "maymun", ru: "обезьяна", y: "🍌" },
  { h: "🐴", nom: "ot", ru: "лошадь", y: "🌾" },
  { h: "🐝", nom: "asalari", ru: "пчела", y: "🌸" },
] as const;

/** Guruhlar — "qaysi biri meva?" savoli uchun. */
export const GURUHLAR = [
  { nom: "meva", ru: "фрукт", items: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🍐"] },
  { nom: "hayvon", ru: "животное", items: ["🐶", "🐱", "🐰", "🐘", "🦁", "🐻", "🐮"] },
  { nom: "mashina", ru: "транспорт", items: ["🚗", "🚌", "🚂", "✈️", "🚲", "🚢"] },
  { nom: "kiyim", ru: "одежда", items: ["👕", "👖", "🧦", "🧢", "👗", "🧥"] },
  { nom: "gul", ru: "цветок", items: ["🌷", "🌻", "🌸", "🌹", "🌼"] },
] as const;

/**
 * Kayfiyat — yuz ifodasini o'qish.
 *
 * Ruscha nom ATAYLAB fe'l shaklida ("радуется", "плачет"): savol
 * "Кто из них радуется?" bo'lib chiqadi va sifat kelishigi kerak
 * bo'lmaydi.
 */
export const KAYFIYAT = [
  { e: "😀", nom: "xursand", ru: "радуется" },
  { e: "😢", nom: "yig'layapti", ru: "плачет" },
  { e: "😠", nom: "jahli chiqqan", ru: "злится" },
  { e: "😴", nom: "uxlayapti", ru: "спит" },
  { e: "😮", nom: "hayron qolgan", ru: "удивился" },
  { e: "🥶", nom: "sovqotgan", ru: "замёрз" },
] as const;

/**
 * Harflar — o'zbek alifbosining eng tanish, adashtirmaydigan harflari.
 *
 * Bu yoshda maqsad O'QISH emas: harfni RASM sifatida tanish. Shuning
 * uchun "o'" va "g'" kabi apostrofli harflar hozircha yo'q — ular
 * kichkintoy uchun bir emas, ikki belgidek ko'rinadi.
 */
const HARFLAR_UZ = ["A", "B", "D", "E", "F", "G", "H", "I", "K", "L",
  "M", "N", "O", "P", "Q", "R", "S", "T", "U", "Y", "Z"] as const;

/**
 * Ruscha alifbo — shu tilda o'qiyotgan bola uchun.
 *
 * Bu shunchaki tarjima emas: ruscha darsda bola KIRILLni o'rganadi,
 * lotin harflari unga hech narsa bermaydi. Ro'yxatdan adashtiradigan
 * harflar (Ъ, Ь, Ы, Й, Ё) chiqarilgan — ular kichkintoy uchun
 * mustaqil belgi bo'lib ko'rinmaydi.
 */
const HARFLAR_RU = ["А", "Б", "В", "Г", "Д", "Е", "Ж", "З", "И", "К",
  "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ш",
  "Э", "Ю", "Я"] as const;

export const harflar = (): readonly string[] =>
  til() === "ru" ? HARFLAR_RU : HARFLAR_UZ;

/**
 * So'zning bosh harfi — o'qishga tayyorgarlikning asosiy mashqi.
 *
 * Bola rasmni ko'radi, kattalar nomini aytadi ("o-o-olma"), bola birinchi
 * tovushni harfdan topadi. Nomlar ataylab bitta tovush bilan boshlanadi:
 * "shar" yoki "cho'chqa" bo'lmaydi, chunki ularning boshi ikki harf.
 */
export const BOSH_HARF = [
  { e: "🍎", nom: "olma", h: "O", ru: "яблоко", hRu: "Я" },
  { e: "🍌", nom: "banan", h: "B", ru: "банан", hRu: "Б" },
  { e: "🍇", nom: "uzum", h: "U", ru: "виноград", hRu: "В" },
  { e: "🐘", nom: "fil", h: "F", ru: "слон", hRu: "С" },
  { e: "🐶", nom: "it", h: "I", ru: "пёс", hRu: "П" },
  { e: "🐱", nom: "mushuk", h: "M", ru: "кот", hRu: "К" },
  { e: "🐰", nom: "quyon", h: "Q", ru: "заяц", hRu: "З" },
  { e: "🦊", nom: "tulki", h: "T", ru: "лиса", hRu: "Л" },
  { e: "🌸", nom: "gul", h: "G", ru: "цветок", hRu: "Ц" },
  { e: "🐟", nom: "baliq", h: "B", ru: "рыба", hRu: "Р" },
  { e: "📕", nom: "kitob", h: "K", ru: "книга", hRu: "К" },
  { e: "🍞", nom: "non", h: "N", ru: "хлеб", hRu: "Х" },
  { e: "🐝", nom: "asalari", h: "A", ru: "пчела", hRu: "П" },
  { e: "🌳", nom: "daraxt", h: "D", ru: "дерево", hRu: "Д" },
  { e: "🐐", nom: "echki", h: "E", ru: "коза", hRu: "К" },
  { e: "🌷", nom: "lola", h: "L", ru: "тюльпан", hRu: "Т" },
  { e: "🚗", nom: "mashina", h: "M", ru: "машина", hRu: "М" },
  { e: "🥕", nom: "sabzi", h: "S", ru: "морковь", hRu: "М" },
  { e: "🦓", nom: "zebra", h: "Z", ru: "зебра", hRu: "З" },
  { e: "🍐", nom: "nok", h: "N", ru: "груша", hRu: "Г" },
] as const;

/** So'zning joriy tildagi bosh harfi. */
export const boshHarfi = (x: { h: string; hRu: string }): string =>
  til() === "ru" ? x.hRu : x.h;

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
  { e: "🐶", nom: "it", ru: "собака", ovoz: "vov-vov", ovozRu: "гав-гав" },
  { e: "🐱", nom: "mushuk", ru: "кот", ovoz: "miyov", ovozRu: "мяу" },
  { e: "🐮", nom: "sigir", ru: "корова", ovoz: "mu-u", ovozRu: "му-у" },
  { e: "🐑", nom: "qo'y", ru: "овца", ovoz: "ba-a", ovozRu: "бе-е" },
  { e: "🐔", nom: "tovuq", ru: "курица", ovoz: "qo'-qo'-qo'", ovozRu: "ко-ко-ко" },
  { e: "🐓", nom: "xo'roz", ru: "петух", ovoz: "qu-qa-ri-qu", ovozRu: "ку-ка-ре-ку" },
  { e: "🐸", nom: "baqa", ru: "лягушка", ovoz: "qur-qur", ovozRu: "ква-ква" },
  { e: "🦁", nom: "arslon", ru: "лев", ovoz: "rrr", ovozRu: "ррр" },
  { e: "🐴", nom: "ot", ru: "лошадь", ovoz: "ih-ih", ovozRu: "иго-го" },
  { e: "🐷", nom: "cho'chqa", ru: "свинья", ovoz: "xryu", ovozRu: "хрю-хрю" },
  { e: "🦆", nom: "o'rdak", ru: "утка", ovoz: "g'a-g'a", ovozRu: "кря-кря" },
  { e: "🐝", nom: "asalari", ru: "пчела", ovoz: "vizz", ovozRu: "жжж" },
] as const;

/** Hayvon tovushi — joriy tilda. */
export const ovoziNomi = (x: { ovoz: string; ovozRu: string }): string =>
  til() === "ru" ? x.ovozRu : x.ovoz;

/**
 * Mevalar. `hex` — mevaning rangi, "qizil mevani top" darsi uchun.
 * `r` — ruscha jinsi: rang sifati shunga qarab kelishadi.
 */
export const MEVA = [
  { e: "🍎", nom: "olma", ru: "яблоко", r: "n", hex: "#f2453d" },
  { e: "🍌", nom: "banan", ru: "банан", r: "m", hex: "#f7c325" },
  { e: "🍇", nom: "uzum", ru: "виноград", r: "m", hex: "#9b5de5" },
  { e: "🍉", nom: "tarvuz", ru: "арбуз", r: "m", hex: "#3fb865" },
  { e: "🍓", nom: "qulupnay", ru: "клубника", r: "f", hex: "#f2453d" },
  { e: "🍊", nom: "apelsin", ru: "апельсин", r: "m", hex: "#f78c25" },
  { e: "🍐", nom: "nok", ru: "груша", r: "f", hex: "#3fb865" },
  { e: "🍒", nom: "gilos", ru: "черешня", r: "f", hex: "#f2453d" },
  { e: "🍑", nom: "shaftoli", ru: "персик", r: "m", hex: "#f78c25" },
  { e: "🍋", nom: "limon", ru: "лимон", r: "m", hex: "#f7c325" },
] as const;

/**
 * Transport. `qayer` — "u qayerda yuradi?" darsi shunga tayanadi.
 *
 * Ruscha shakl ("по земле") ATAYLAB to'liq ibora: savol "Что
 * передвигается по воздуху?" bo'lib chiqadi va hech qanday kelishik
 * o'zgarishi kerak bo'lmaydi.
 */
export const TRANSPORT = [
  { e: "🚗", nom: "mashina", ru: "машина", qayer: "yerda", qayerRu: "по земле" },
  { e: "🚌", nom: "avtobus", ru: "автобус", qayer: "yerda", qayerRu: "по земле" },
  { e: "🚂", nom: "poyezd", ru: "поезд", qayer: "yerda", qayerRu: "по земле" },
  { e: "🚲", nom: "velosiped", ru: "велосипед", qayer: "yerda", qayerRu: "по земле" },
  { e: "🚕", nom: "taksi", ru: "такси", qayer: "yerda", qayerRu: "по земле" },
  { e: "✈️", nom: "samolyot", ru: "самолёт", qayer: "havoda", qayerRu: "по воздуху" },
  { e: "🚁", nom: "vertolyot", ru: "вертолёт", qayer: "havoda", qayerRu: "по воздуху" },
  { e: "🚀", nom: "raketa", ru: "ракета", qayer: "havoda", qayerRu: "по воздуху" },
  { e: "🚢", nom: "kema", ru: "корабль", qayer: "suvda", qayerRu: "по воде" },
  { e: "⛵", nom: "yelkanli qayiq", ru: "парусная лодка", qayer: "suvda", qayerRu: "по воде" },
] as const;

/** Transport qayerda yuradi — joriy tilda. */
export const qayerNomi = (x: { qayer: string; qayerRu: string }): string =>
  til() === "ru" ? x.qayerRu : x.qayer;

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

/**
 * O'lcham sifatlari va ularning teskarisi.
 *
 * Ruscha shakl ATAYLAB DARAJA ko'rinishida ("выше", "больше"): u jinsga
 * ham, songa ham bog'lanmaydi, ya'ni "Что выше?" istalgan juftlik uchun
 * to'g'ri chiqadi. Sifatning oddiy shakli bo'lsa ("высокий"), har bir
 * juftga alohida jins kerak bo'lardi.
 */
export const OLCHAM_SIFAT: Record<string, { teskari: string; ru: string; ruTeskari: string }> = {
  baland: { teskari: "past", ru: "выше", ruTeskari: "ниже" },
  katta: { teskari: "kichik", ru: "больше", ruTeskari: "меньше" },
  uzun: { teskari: "qisqa", ru: "длиннее", ruTeskari: "короче" },
};

/**
 * Yo'nalishlar — strelka ko'rinishida, o'qish umuman kerak emas.
 *
 * `nomQ` — "qaysi biri yuqoriga qaragan?" savolidagi shakl. Ruschada
 * ikkisi bir xil ("вверх"), o'zbekchada ham — lekin maydon alohida
 * turadi, chunki savol qolipi ikki xil.
 */
export const YONALISH = [
  { e: "⬆️", nom: "yuqoriga", ru: "вверх" },
  { e: "⬇️", nom: "pastga", ru: "вниз" },
  { e: "⬅️", nom: "chapga", ru: "влево" },
  { e: "➡️", nom: "o'ngga", ru: "вправо" },
] as const;

/**
 * Kun qismlari. Tartib muhim — "keyin nima bo'ladi?" savoli shunga tayanadi.
 * `ruGen` — "после утра" uchun qaratqich kelishigi.
 */
export const KUN_TARTIBI = [
  { e: "🌞", nom: "ertalab", ru: "утро", ruGen: "утра" },
  { e: "☀️", nom: "tush", ru: "день", ruGen: "дня" },
  { e: "🌇", nom: "kech", ru: "вечер", ruGen: "вечера" },
  { e: "🌙", nom: "tun", ru: "ночь", ruGen: "ночи" },
] as const;

/**
 * Hafta kunlari.
 *
 * Diqqat: bu kursdagi YAGONA dars, javobi so'z bo'ladigan. Boshqa iloji
 * yo'q — kun nomining rasmi bo'lmaydi. Shuning uchun u ataylab oxirroqda
 * turadi va ovoz yoqilganda to'liq mustaqil ishlaydi.
 */
const HAFTA_UZ = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba",
  "Juma", "Shanba", "Yakshanba"] as const;

const HAFTA_RU = ["Понедельник", "Вторник", "Среда", "Четверг",
  "Пятница", "Суббота", "Воскресенье"] as const;

/** "Dushanbadan keyin" → "после понедельника": qaratqich kelishigi. */
const HAFTA_RU_GEN = ["понедельника", "вторника", "среды", "четверга",
  "пятницы", "субботы", "воскресенья"] as const;

export const hafta = (): readonly string[] => (til() === "ru" ? HAFTA_RU : HAFTA_UZ);

/** Hafta kunining "…dan keyin" shakli. */
export const haftaKeyin = (i: number): string =>
  til() === "ru" ? HAFTA_RU_GEN[i] : HAFTA_UZ[i];

/** Ob-havo. `kiyim` — "bunday kunda nima kerak?" savoli uchun. */
export const OB_HAVO = [
  { e: "☀️", nom: "quyoshli", ru: "солнечный", kiyim: "🕶️", kiyimNom: "ko'zoynak", kiyimRu: "очки" },
  { e: "🌧️", nom: "yomg'irli", ru: "дождливый", kiyim: "☂️", kiyimNom: "soyabon", kiyimRu: "зонт" },
  { e: "❄️", nom: "qorli", ru: "снежный", kiyim: "🧥", kiyimNom: "issiq kiyim", kiyimRu: "тёплая куртка" },
  { e: "⛅", nom: "bulutli", ru: "облачный", kiyim: "👕", kiyimNom: "yengil kiyim", kiyimRu: "футболка" },
] as const;

/**
 * Hayvonlar — bolaga eng tanish va eng yoqimli mavzu.
 *
 * `o` — hayvonning HAQIQIY kattaligi (1 eng kichik … 5 eng katta).
 * "Katta–kichik" darsi shunga tayanadi: bola rasmlarga qarab, hech narsa
 * o'qimasdan eng kattasini tanlaydi.
 */
export const HAYVONLAR = [
  { e: "🐜", nom: "chumoli", ru: "муравей", o: 1 }, { e: "🐝", nom: "asalari", ru: "пчела", o: 1 },
  { e: "🐭", nom: "sichqon", ru: "мышка", o: 2 }, { e: "🐤", nom: "jo'ja", ru: "цыплёнок", o: 2 },
  { e: "🐸", nom: "baqa", ru: "лягушка", o: 2 }, { e: "🐔", nom: "tovuq", ru: "курица", o: 2 },
  { e: "🐰", nom: "quyon", ru: "заяц", o: 3 }, { e: "🐱", nom: "mushuk", ru: "кот", o: 3 },
  { e: "🐶", nom: "it", ru: "собака", o: 3 }, { e: "🦊", nom: "tulki", ru: "лиса", o: 3 },
  { e: "🐷", nom: "cho'chqa", ru: "свинья", o: 4 }, { e: "🐑", nom: "qo'y", ru: "овца", o: 4 },
  { e: "🐻", nom: "ayiq", ru: "медведь", o: 4 }, { e: "🦁", nom: "sher", ru: "лев", o: 4 },
  { e: "🐮", nom: "sigir", ru: "корова", o: 5 }, { e: "🐴", nom: "ot", ru: "лошадь", o: 5 },
  { e: "🐘", nom: "fil", ru: "слон", o: 5 },
] as const;

export const hayvonNomi = (e: string) => {
  const h = HAYVONLAR.find((x) => x.e === e);
  if (!h) return til() === "ru" ? "животное" : "hayvon";
  return til() === "ru" ? h.ru : h.nom;
};

const NAMES: Record<string, { nom: string; ru: string }> = {
  "🍎": { nom: "olma", ru: "яблоко" },
  "⭐": { nom: "yulduz", ru: "звезда" },
  "🎈": { nom: "shar", ru: "шарик" },
  "🐟": { nom: "baliq", ru: "рыбка" },
  "🌸": { nom: "gul", ru: "цветок" },
  "🦆": { nom: "o'rdak", ru: "утка" },
  "🍪": { nom: "pechene", ru: "печенье" },
  "🚗": { nom: "mashina", ru: "машинка" },
  "🍓": { nom: "qulupnay", ru: "клубника" },
  "🐝": { nom: "asalari", ru: "пчела" },
  "🌻": { nom: "kungaboqar", ru: "подсолнух" },
  "🐞": { nom: "qo'ng'iz", ru: "жучок" },
};

export const objName = (e: string) => {
  const x = NAMES[e];
  if (!x) return til() === "ru" ? "предмет" : "narsa";
  return til() === "ru" ? x.ru : x.nom;
};
