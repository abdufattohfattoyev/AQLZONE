/**
 * KICHKINTOY — 2–5 yosh. Ilovaning eng yosh bo'limi.
 *
 * ─────────── NEGA BU "MAKTABGACHA" NING NUSXASI EMAS ───────────
 *
 * `curriculum/grade0.ts` allaqachon ranglar, hayvonlar, transport va
 * sanashni qamraydi. Lekin u SAVOL BERADI: "Qaysi biri qizil?" Savol
 * berish uchun esa bola javobni allaqachon bilishi kerak.
 *
 * Bu bo'lim o'sha bilimning O'ZINI beradi. Bu yerda:
 *
 *   * to'g'ri javob yo'q — chunki savol yo'q;
 *   * yulduz, tanga, qulf, tartib yo'q — 3 yoshli bola "keyingi dars"
 *     degan tushunchani bilmaydi va qulflangan katta uni faqat
 *     xafa qiladi;
 *   * har bir kartani bosish BIR XIL natija beradi: rasm kattalashadi
 *     va ovoz nomini aytadi. Takrorlash — shu yoshda o'rganishning
 *     yagona yo'li, ilova esa undan hech qachon charchamaydi.
 *
 * O'yin bor, lekin u ALBOMDAN KEYIN ochiladi va yutqazish yo'q: xato
 * javobda karta shunchaki silkinadi va ovoz nomni qaytadan aytadi.
 *
 * ─────────── NEGA HAR NARSANING O'Z TOVUSHI BOR ───────────
 *
 * Tovush — so'zga yetib boradigan ko'prik: bola avval tovushni
 * taniydi, keyin nomni. Lekin ikki xil tovush bor va ular ATAYLAB
 * boshqacha beriladi:
 *
 *   MASHINALARDA — HAQIQIY tovush (`tovush`). Signal, sirena,
 *   qo'ng'iroq brauzerning o'zida yasaladi (`lib/tovush.ts`). Ilgari
 *   bu yerda ham "bi-bip" degan SO'Z aytilardi — ya'ni odam ovozi
 *   mashinani taqlid qilardi. Bola esa mashinani ko'chada eshitgan va
 *   o'sha yerda "bi-bip" degan so'z emas, SIGNAL yangraydi.
 *
 *   HAYVONLARDA — so'z bo'lib qoladi (`ovoz`). Va bu ham ataylab:
 *   "vov-vov" bolaning O'ZI takrorlaydigan tovush. Haqiqiy it
 *   hurishini qo'ysak, u ta'sirli bo'lardi-yu, bola uni qaytara
 *   olmasdi — holbuki bu yoshda o'rganish aynan TAQLID orqali boradi.
 *
 * ─────────── MATN QAYERDA ───────────
 *
 * Nom va tovush shu faylda, IKKI TILDA. `lib/tarjima/*` ga
 * qo'shilmadi: u yerda dars va savol matnlari turadi, bular esa
 * lug'at — ular ekranda ham, OVOZDA ham aynan shu ko'rinishda
 * ishlatiladi va ikkiga bo'linsa, ovoz bilan yozuv bir kun ajralib
 * qolardi.
 */
import { til } from "./til";
import type { TovushNomi } from "./tovush";
import type { UnitColor } from "./types";

/** Albomdagi bitta karta. */
export interface Karta {
  /** Barqaror kalit — o'yin va progress shunga tayanadi. */
  id: string;
  /** Katta chiziladigan rasm. Rang kartasida bo'sh bo'ladi. */
  e?: string;
  nom: string;
  ru: string;
  /** Rang kartasi — rasm o'rniga shu rangdagi doira chiziladi. */
  hex?: string;
  /** Raqam kartasi — katta belgi ("5") va shuncha narsa. */
  belgi?: string;
  /** Raqam kartasida: nechta narsa chizilsin. */
  n?: number;
  /**
   * HAYVON tovushi — nomdan keyin AYTILADIGAN so'z ("miyov").
   *
   * Bola uni takrorlaydi, shuning uchun u so'z bo'lib qoladi.
   */
  ovoz?: string;
  ovozRu?: string;
  /**
   * MASHINA tovushi — brauzerda yasaladigan HAQIQIY ovoz.
   *
   * `lib/tovush.ts` dagi nomlardan biri. Bor bo'lsa, kartada so'z
   * o'rniga "tovushi" tugmasi chiqadi.
   */
  tovush?: TovushNomi;
}

export interface Mavzu {
  id: string;
  nom: string;
  ru: string;
  /** Mavzu kartasidagi katta belgi. */
  e: string;
  /** Yonidagi kichik belgilar — "ichkarida nima bor" degan ishora. */
  ishora: string[];
  rang: UnitColor;
  kartalar: Karta[];
}

/** Joriy tildagi nom. */
export const kNom = (k: { nom: string; ru: string }): string =>
  (til() === "ru" ? k.ru : k.nom);

/** Joriy tildagi tovush. Tovushi yo'q kartada — bo'sh satr. */
export const kOvoz = (k: Karta): string =>
  (til() === "ru" ? (k.ovozRu ?? "") : (k.ovoz ?? ""));

/* ─────────────────────────── mashinalar ───────────────────────────
 *
 * Tartib ATAYLAB shunday: eng tanishidan (mashina, avtobus) eng
 * qiziqiga (o't o'chirish, tez yordam) va eng uzog'iga (samolyot,
 * kema). Bola birinchi kartada "buni bilaman!" desa, qolganini ham
 * ko'radi — birinchi karta notanish bo'lsa, u telefonni qo'yadi.
 *
 * Favqulodda mashinalar ("o't o'chirish", "tez yordam", "politsiya")
 * ATAYLAB kiritilgan: bu yoshdagi bola ularni ko'chada ko'radi,
 * ovozini eshitadi va nomini so'raydi. Aynan shu uchta karta butun
 * bo'limni qiziqarli qiladi.
 */
const MASHINA: Karta[] = [
  { id: "mashina", e: "🚗", nom: "mashina", ru: "машина", tovush: "signal" },
  { id: "avtobus", e: "🚌", nom: "avtobus", ru: "автобус", tovush: "avtobus" },
  { id: "taksi", e: "🚕", nom: "taksi", ru: "такси", tovush: "signal" },
  { id: "yuk", e: "🚚", nom: "yuk mashinasi", ru: "грузовик", tovush: "yuk" },
  { id: "otochir", e: "🚒", nom: "o't o'chirish mashinasi", ru: "пожарная машина", tovush: "sirena" },
  { id: "tezyordam", e: "🚑", nom: "tez yordam", ru: "скорая помощь", tovush: "sirena" },
  { id: "politsiya", e: "🚓", nom: "politsiya mashinasi", ru: "полицейская машина", tovush: "sirena" },
  { id: "traktor", e: "🚜", nom: "traktor", ru: "трактор", tovush: "traktor" },
  { id: "velosiped", e: "🚲", nom: "velosiped", ru: "велосипед", tovush: "qongiroq" },
  { id: "poyezd", e: "🚂", nom: "poyezd", ru: "поезд", tovush: "poyezd" },
  { id: "samolyot", e: "✈️", nom: "samolyot", ru: "самолёт", tovush: "samolyot" },
  { id: "kema", e: "🚢", nom: "kema", ru: "корабль", tovush: "kema" },
];

/* ─────────────────────────── hayvonlar ───────────────────────────
 *
 * Uy hayvonlaridan boshlanadi (it, mushuk) — bola ularni har kuni
 * ko'radi. Yovvoyilari oxirida: arslon "rrr" deb baqirgani qiziq,
 * lekin u tanish emas, ya'ni undan boshlash bo'limni "notanish
 * narsalar ro'yxati" qilib qo'yardi.
 */
const HAYVON: Karta[] = [
  { id: "it", e: "🐶", nom: "it", ru: "собака", ovoz: "vov-vov", ovozRu: "гав-гав" },
  { id: "mushuk", e: "🐱", nom: "mushuk", ru: "кот", ovoz: "miyov", ovozRu: "мяу" },
  { id: "sigir", e: "🐮", nom: "sigir", ru: "корова", ovoz: "mu-u", ovozRu: "му-у" },
  { id: "qoy", e: "🐑", nom: "qo'y", ru: "овца", ovoz: "ba-a", ovozRu: "бе-е" },
  { id: "ot", e: "🐴", nom: "ot", ru: "лошадь", ovoz: "ih-ih", ovozRu: "иго-го" },
  { id: "tovuq", e: "🐔", nom: "tovuq", ru: "курица", ovoz: "qo'-qo'-qo'", ovozRu: "ко-ко-ко" },
  { id: "xoroz", e: "🐓", nom: "xo'roz", ru: "петух", ovoz: "qu-qa-ri-qu", ovozRu: "ку-ка-ре-ку" },
  { id: "ordak", e: "🦆", nom: "o'rdak", ru: "утка", ovoz: "g'a-g'a", ovozRu: "кря-кря" },
  { id: "quyon", e: "🐰", nom: "quyon", ru: "заяц" },
  { id: "baqa", e: "🐸", nom: "baqa", ru: "лягушка", ovoz: "qur-qur", ovozRu: "ква-ква" },
  { id: "ayiq", e: "🐻", nom: "ayiq", ru: "медведь", ovoz: "rrr", ovozRu: "ррр" },
  { id: "arslon", e: "🦁", nom: "arslon", ru: "лев", ovoz: "rrr", ovozRu: "ррр" },
  { id: "fil", e: "🐘", nom: "fil", ru: "слон", ovoz: "tu-u-u", ovozRu: "ту-у-у" },
  // Ruscha tovush "жжж" EMAS, "жу-жу-жу". Aisha undosh uyumini
  // umuman o'qimaydi — bo'sh fayl qaytardi va asalari jim qolardi.
  { id: "asalari", e: "🐝", nom: "asalari", ru: "пчела", ovoz: "vizz", ovozRu: "жу-жу-жу" },
];

/* ─────────────────────────── ranglar ───────────────────────────
 *
 * `hex` qiymatlari `lib/activity.ts` dagi RANGLAR bilan AYNAN bir xil
 * va bu ataylab: bola bu yerda "qizil" ni o'rganib, keyin Maktabgacha
 * kursida "Qaysi biri qizil?" savolini ko'radi. Ikki joyda ikki xil
 * qizil bo'lsa, savol adolatsiz bo'lib qolardi.
 *
 * Oq rang YO'Q: oq doira oq kartada ko'rinmaydi va bola "bu yerda
 * hech narsa yo'q" deb o'ylaydi. Qora bor — u har fonda ko'rinadi.
 */
const RANG: Karta[] = [
  { id: "qizil", hex: "#f2453d", nom: "qizil", ru: "красный" },
  { id: "sariq", hex: "#f7c325", nom: "sariq", ru: "жёлтый" },
  { id: "kok", hex: "#3d8ef2", nom: "ko'k", ru: "синий" },
  { id: "yashil", hex: "#3fb865", nom: "yashil", ru: "зелёный" },
  { id: "toqsariq", hex: "#f78c25", nom: "to'q sariq", ru: "оранжевый" },
  { id: "binafsha", hex: "#9b5de5", nom: "binafsha", ru: "фиолетовый" },
  { id: "pushti", hex: "#f56dbc", nom: "pushti", ru: "розовый" },
  { id: "jigarrang", hex: "#96603b", nom: "jigarrang", ru: "коричневый" },
  { id: "qora", hex: "#2f2b28", nom: "qora", ru: "чёрный" },
];

/* ─────────────────────────── raqamlar 0–9 ───────────────────────────
 *
 * Har kartada IKKI narsa bor: katta raqam va shuncha olma. Bu bo'limning
 * butun ma'nosi shu — "5" degan chizma bilan beshta narsa BIR VAQTDA
 * ko'rinsin. Ularni alohida ko'rsatgan ilova raqamni o'rgatadi, sonni
 * emas: bola "besh" deb o'qishni biladi-yu, beshta olmani sanay olmaydi.
 *
 * NOL boshida turadi va uning kartasi BO'SH — hech qanday olma yo'q.
 * Bu yoshda "hech narsa ham son" degan g'oya kutilmaganda qiyin, lekin
 * ko'rsatib berish oson: bo'sh joy o'zi tushuntiradi.
 */
const RAQAM: Karta[] = [
  { id: "0", belgi: "0", n: 0, e: "🍎", nom: "nol", ru: "ноль" },
  { id: "1", belgi: "1", n: 1, e: "🍎", nom: "bir", ru: "один" },
  { id: "2", belgi: "2", n: 2, e: "🍎", nom: "ikki", ru: "два" },
  { id: "3", belgi: "3", n: 3, e: "🍎", nom: "uch", ru: "три" },
  { id: "4", belgi: "4", n: 4, e: "🍎", nom: "to'rt", ru: "четыре" },
  { id: "5", belgi: "5", n: 5, e: "🍎", nom: "besh", ru: "пять" },
  { id: "6", belgi: "6", n: 6, e: "🍎", nom: "olti", ru: "шесть" },
  { id: "7", belgi: "7", n: 7, e: "🍎", nom: "yetti", ru: "семь" },
  { id: "8", belgi: "8", n: 8, e: "🍎", nom: "sakkiz", ru: "восемь" },
  { id: "9", belgi: "9", n: 9, e: "🍎", nom: "to'qqiz", ru: "девять" },
];

/**
 * Mavzular — ekrandagi tartibda.
 *
 * MASHINA BIRINCHI. Sabab o'lchovga emas, tajribaga tayanadi: bu
 * yoshdagi bolaning eng ko'p so'raydigan narsasi — ko'chadagi mashina.
 * Ranglar va raqamlar esa ota-ona xohlaydigan narsa; ular ham bor,
 * lekin ular birinchi bo'lsa bola bo'limni "dars" deb his qiladi.
 */
export const MAVZULAR: Mavzu[] = [
  {
    id: "mashina", nom: "Mashinalar", ru: "Машины", e: "🚗",
    ishora: ["🚌", "🚒", "✈️"], rang: "blue", kartalar: MASHINA,
  },
  {
    id: "hayvon", nom: "Hayvonlar", ru: "Животные", e: "🐶",
    ishora: ["🐱", "🦁", "🐘"], rang: "green", kartalar: HAYVON,
  },
  {
    id: "rang", nom: "Ranglar", ru: "Цвета", e: "🎨",
    ishora: ["🔴", "🟡", "🔵"], rang: "purple", kartalar: RANG,
  },
  {
    id: "raqam", nom: "Raqamlar", ru: "Цифры", e: "🔢",
    ishora: ["1", "2", "3"], rang: "orange", kartalar: RAQAM,
  },
];

export const mavzuById = (id: string): Mavzu | undefined =>
  MAVZULAR.find((m) => m.id === id);

/* ─────────────────────────── gaplar ───────────────────────────
 *
 * NEGA YAKKA SO'Z EMAS. Ilgari albom shunchaki "mashina" derdi. Yakka
 * so'z esa buyruqqa o'xshab eshitiladi va eng muhimi — bola undan
 * GAP tuzishni o'rganmaydi. "Bu mashina" esa to'liq gap: bola uni
 * eshitib, o'zi ham "bu mashina" deb takrorlaydi.
 *
 * O'yinda ham xuddi shunday: "mashina" degan yakka so'z SAVOL emas.
 * "Qaysi biri mashina?" — savol, va bola nima qilish kerakligini
 * ovozning ohangidan tushunadi.
 *
 * Gaplar QOLIP bilan yasaladi, qo'lda yozilmaydi. Qirq beshta karta ×
 * ikkita gap × ikkita til = 180 satr bo'lardi va ulardan bittasi
 * albatta xato yozilardi. Qolip esa bir joyda turadi va yangi karta
 * qo'shilganda gaplari o'z-o'zidan paydo bo'ladi.
 */

/** Albomdagi gap: "Bu mashina", "Bu qizil rang", "Bu raqam besh". */
export function aytiladigan(mavzu: string, k: Karta): string {
  const nom = kNom(k);
  if (til() === "ru") {
    if (mavzu === "rang") return `Это ${nom} цвет`;
    if (mavzu === "raqam") return `Это цифра ${nom}`;
    return `Это ${nom}`;
  }
  if (mavzu === "rang") return `Bu ${nom} rang`;
  if (mavzu === "raqam") return `Bu raqam ${nom}`;
  return `Bu ${nom}`;
}

/** O'yindagi savol: "Qaysi biri mashina?" */
export function savolMatni(mavzu: string, k: Karta): string {
  const nom = kNom(k);
  if (til() === "ru") {
    // "Где цифра пять?" — yakka "Где пять?" ruschada g'aliz eshitiladi.
    return mavzu === "raqam" ? `Где цифра ${nom}?` : `Где ${nom}?`;
  }
  return `Qaysi biri ${nom}?`;
}

/**
 * Ovozga chiqadigan HAMMA satr — lug'at fayli shundan yasaladi
 * (`scripts/kichkintoy.ts`).
 *
 * Ikkala til ham kerak, chunki lug'at bitta va u ikkalasini ham
 * qamraydi. `til()` ni vaqtincha almashtirish o'rniga qoliplar shu
 * yerda ochiq takrorlanadi: skript brauzerda emas, Node'da ishlaydi
 * va u yerda `localStorage` yo'q.
 */
export function barchaGaplar(): string[] {
  const s = new Set<string>();
  for (const m of MAVZULAR) {
    for (const k of m.kartalar) {
      // uz
      s.add(m.id === "rang" ? `Bu ${k.nom} rang`
        : m.id === "raqam" ? `Bu raqam ${k.nom}`
        : `Bu ${k.nom}`);
      s.add(`Qaysi biri ${k.nom}?`);
      // ru
      s.add(m.id === "rang" ? `Это ${k.ru} цвет`
        : m.id === "raqam" ? `Это цифра ${k.ru}`
        : `Это ${k.ru}`);
      s.add(m.id === "raqam" ? `Где цифра ${k.ru}?` : `Где ${k.ru}?`);
      // hayvon tovushlari — ular so'z bo'lib aytiladi
      if (k.ovoz) s.add(k.ovoz);
      if (k.ovozRu) s.add(k.ovozRu);
    }
  }
  return [...s];
}
