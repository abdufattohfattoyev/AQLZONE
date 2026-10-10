/**
 * IZDOSH — mantiq o'yini (`screens/Izdosh.tsx`).
 *
 * Katakli maydon. Siz yurasiz, izdoshingiz esa AYNAN sizning yo'lingizdan
 * `kech` qadam ortda keladi. Eshik faqat uning tugmasida kimdir turganda
 * ochiq. Ko'pincha tugmada turadigan "kimdir" — izdosh: siz uni o'sha
 * joyga oldindan olib borib qo'yasiz va o'zingiz eshikdan o'tasiz.
 *
 * G'oya mashhur "o'tmishdagi o'zing bilan hamkorlik" jumboqlaridan; kod,
 * darajalar va qoidalar — o'zimizniki. Hisob: kechikish — AYIRISH
 * (`t − kech`), ya'ni bola "4 qadamdan keyin u qayerda bo'ladi?" deb
 * oldindan sanaydi — o'yinning butun ma'nosi shu.
 *
 * ─────────────── QOIDALAR ───────────────
 *
 *   #  devor           .  yo'l
 *   P  boshlanish      E  chiqish (shu yerga yetish kerak)
 *   a b c  tugma       A B C  eshik (o'z tugmasi bosilganda ochiq)
 *
 *   • Yurish — to'rt tomonga bir katak; "Kutish" — joyida turish
 *     (izdosh baribir bir qadam yuradi).
 *   • Izdosh — soya: devordan o'tmaydi (siz o'tmagansiz), eshik uni
 *     to'xtatmaydi. U faqat TUGMANI BOSADI.
 *   • Eshikka qadam qo'yish mumkin, agar SHU YURISHDAN KEYIN uning
 *     tugmasida siz yoki izdosh tursa. Eshik ichida turgan odamning
 *     ustiga eshik yopilmaydi.
 *
 * Fayl SOF: brauzersiz sinaladi (`scripts/izdosh.ts`) — har daraja
 * yechiladi, izdoshsiz yechilmaydi va eng qisqa yo'l shu yerda yozilgan.
 */

export type Yon = "u" | "d" | "l" | "r";
export type Yurish = Yon | "w";

export const YONLAR: Record<Yon, [number, number]> = { u: [-1, 0], d: [1, 0], l: [0, -1], r: [0, 1] };

export interface Daraja {
  /** Nomi — ekranda "3 · Kutish san'ati". */
  nom: [string, string];
  /** Izdosh necha qadam ortda. */
  kech: number;
  /** Maydon qatorlari (yuqoridagi belgilar). */
  xarita: string[];
  /** Eng qisqa yechim (sinov tekshiradi) — "eng qisqa 7" uchun. */
  engQisqa: number;
  /** Birinchi ochilishda chiqadigan maslahat. */
  maslahat: [string, string];
}

export interface Holat {
  /** O'yinchi yo'li — har yurishdan keyingi joy (`[0]` — boshlanish). */
  yol: number[];
}

export interface Maydon {
  en: number;
  boy: number;
  hujayra: string[];
  bosh: number;
  chiqish: number;
}

export function maydon(d: Daraja): Maydon {
  const boy = d.xarita.length;
  const en = Math.max(...d.xarita.map((q) => q.length));
  const hujayra: string[] = [];
  let bosh = 0, chiqish = 0;
  for (let y = 0; y < boy; y++) {
    for (let x = 0; x < en; x++) {
      const c = d.xarita[y][x] ?? "#";
      if (c === "P") bosh = y * en + x;
      if (c === "E") chiqish = y * en + x;
      hujayra.push(c === "P" ? "." : c);
    }
  }
  return { en, boy, hujayra, bosh, chiqish };
}

/** `t` yurishdan keyin izdosh qayerda. */
export function izdoshJoyi(yol: number[], kech: number): number {
  return yol[Math.max(0, yol.length - 1 - kech)];
}

const tugmami = (c: string) => c >= "a" && c <= "c";
const eshikmi = (c: string) => c >= "A" && c <= "C";

/** Shu holatda qaysi eshiklar ochiq (tugmasida kimdir bor). */
export function ochiqEshiklar(m: Maydon, oyinchi: number, izdosh: number): Set<string> {
  const ochiq = new Set<string>();
  for (const j of [oyinchi, izdosh]) {
    const c = m.hujayra[j];
    if (tugmami(c)) ochiq.add(c.toUpperCase());
  }
  return ochiq;
}

/** Yurishdan keyingi joy, yoki `null` — mumkin emas. */
export function yur(m: Maydon, yol: number[], kech: number, y: Yurish): number | null {
  const joy = yol[yol.length - 1];
  if (y === "w") return joy;
  const [dy, dx] = YONLAR[y];
  const ny = Math.floor(joy / m.en) + dy, nx = (joy % m.en) + dx;
  if (ny < 0 || nx < 0 || ny >= m.boy || nx >= m.en) return null;
  const yangi = ny * m.en + nx;
  const c = m.hujayra[yangi];
  if (c === "#") return null;
  if (eshikmi(c)) {
    const izdosh = izdoshJoyi([...yol, yangi], kech);
    if (!ochiqEshiklar(m, yangi, izdosh).has(c)) return null;
  }
  return yangi;
}

/**
 * Eng qisqa yechim (yurishlar ro'yxati) yoki `null`. `izdoshsiz` —
 * tugmani faqat o'yinchi bosadi (sinov: daraja izdoshni TALAB qiladimi).
 */
export function yech(d: Daraja, izdoshsiz = false, chegara = 60): Yurish[] | null {
  const m = maydon(d);
  // Izdoshsiz: soya boshlanishda qotib qoladi (u hech qachon yetib kelmaydi).
  const kech = izdoshsiz ? 1_000_000 : d.kech;
  // Holat — oxirgi `kech + 1` joy: izdosh shu oynaning boshida turadi.
  // Oyna boshlanish bilan to'ldiriladi — izdosh boshda turgan paytlar
  // ham bir xil uzunlikdagi kalit beradi. Izdoshsizda holat — faqat joy.
  const oyna = izdoshsiz ? 1 : kech + 1;
  const boshOyna = Array(Math.max(0, oyna - 1)).fill(m.bosh);
  const navbat: { yol: number[]; yur: Yurish[] }[] = [{ yol: izdoshsiz ? [m.bosh] : [...boshOyna, m.bosh], yur: [] }];
  const korilgan = new Set<string>([izdoshsiz ? String(m.bosh) : navbat[0].yol.join(",")]);
  for (let i = 0; i < navbat.length; i++) {
    const h = navbat[i];
    if (h.yol[h.yol.length - 1] === m.chiqish) return h.yur;
    if (h.yur.length >= chegara) continue;
    for (const y of ["u", "d", "l", "r", "w"] as Yurish[]) {
      const j = yur(m, h.yol, kech, y);
      if (j === null) continue;
      // Izdoshsizda yo'l boshida doim boshlanish turadi — soya o'sha yerda.
      const yol = izdoshsiz ? [m.bosh, j] : [...h.yol, j].slice(-oyna);
      const k = izdoshsiz ? String(j) : yol.join(",");
      if (korilgan.has(k)) continue;
      korilgan.add(k);
      navbat.push({ yol, yur: [...h.yur, y] });
    }
  }
  return null;
}

/**
 * Darajalar. Har biri bitta yangi fikr o'rgatadi; tartib — oson → qiyin.
 * Yozuvlar ikki tilda (`[uz, ru]`).
 */
export const DARAJALAR: Daraja[] = [
  {
    nom: ["Tanishuv", "Знакомство"], kech: 3, engQisqa: 8,
    maslahat: ["Chiqishga yeting. Izdoshingiz 3 qadam ortda yuradi — tugmaga u yetganda eshik ochiladi.",
      "Дойдите до выхода. Спутник идёт на 3 шага позади — дверь откроется, когда он встанет на кнопку."],
    xarita: ["P...a..AE"],
  },
  {
    nom: ["Kutish", "Ожидание"], kech: 4, engQisqa: 7,
    maslahat: ["Eshik yopiq — izdosh hali tugmaga yetmagan. «Kutish» uni bir qadam yaqinlashtiradi.",
      "Дверь закрыта — спутник ещё не на кнопке. «Ждать» приближает его на шаг."],
    xarita: ["P.a..AE"],
  },
  {
    nom: ["Yon yo'lak", "Боковой ход"], kech: 3, engQisqa: 9,
    maslahat: ["Tugma yo'lda emas. Avval unga kiring — izdosh ham o'sha yerdan o'tadi.",
      "Кнопка не на пути. Сначала зайдите к ней — спутник пройдёт там же."],
    xarita: ["##a##", "P...A..E"],
  },
  {
    nom: ["Ortga", "Назад"], kech: 4, engQisqa: 7,
    maslahat: ["Ba'zan oldinga o'tish uchun avval orqaga yurish kerak.",
      "Иногда, чтобы пройти вперёд, сначала нужно пойти назад."],
    xarita: ["a.P.AE"],
  },
  {
    nom: ["Ikki eshik", "Две двери"], kech: 3, engQisqa: 15,
    maslahat: ["Har eshikning o'z tugmasi. Ikkinchisida izdosh kechikadi — sanang.",
      "У каждой двери своя кнопка. У второй спутник опоздает — посчитайте."],
    xarita: ["####a##b", "P.....A.B.E"],
  },
  {
    nom: ["Uzoq soya", "Длинная тень"], kech: 5, engQisqa: 14,
    maslahat: ["Izdosh 5 qadam ortda. U tugmaga aynan siz eshik oldida turganingizda yetsin.",
      "Спутник отстаёт на 5 шагов. Пусть он встанет на кнопку ровно тогда, когда вы у двери."],
    xarita: ["P...#", "##..#", "a...A..E"],
  },
  {
    nom: ["Burama", "Изгиб"], kech: 4, engQisqa: 14,
    maslahat: ["Kutish o'rniga oldinga-orqaga yursa ham bo'ladi — izdosh baribir yuradi.",
      "Вместо ожидания можно шагнуть туда-обратно — спутник всё равно идёт."],
    xarita: ["P.#...", "..#.##", "a.A...", "####.#", "E....#"],
  },
  {
    nom: ["Teskari tartib", "Обратный порядок"], kech: 5, engQisqa: 12,
    maslahat: ["Ikki eshik ketma-ket. Izdosh tugmalarni qaysi tartibda bosishi kerak?",
      "Две двери подряд. В каком порядке спутник должен нажать кнопки?"],
    xarita: ["###ba##", "P.....ABE"],
  },
  {
    nom: ["Tugmadan tugmaga", "От кнопки к кнопке"], kech: 2, engQisqa: 15,
    maslahat: ["Izdosh atigi 2 qadam ortda — juda yaqin. Har yurishni o'ylang.",
      "Спутник всего в 2 шагах — очень близко. Обдумывайте каждый ход."],
    xarita: ["P.a#....", "##A#.##.", "##.b.#B.", "######.E"],
  },
  {
    nom: ["Usta", "Мастер"], kech: 4, engQisqa: 20,
    maslahat: ["Uchta eshik. Shoshilmang — «Bir yurish ortga» doim bor.",
      "Три двери. Не спешите — «Шаг назад» всегда есть."],
    xarita: ["#c#####ba", "P...C....A", "#########B", "######E..."],
  },
];
