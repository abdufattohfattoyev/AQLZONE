/**
 * STRELKA YO'LI — mantiq o'yini (`screens/Strelka.tsx`).
 *
 * Maydonda strelkalar. Shar o'z yo'nalishida to'g'ri yuradi; strelkali
 * katakka tushsa — o'sha tomonga buriladi. Maqsad — yulduz. Hozirgi
 * holatda shar yetib bormaydi: BITTA strelkani burish kerak (istalgan
 * tomonga), keyin "Yurgizish".
 *
 * G'oya — "bitta o'zgarish butun yo'lni o'zgartiradi" turidagi
 * jumboqlar; kod va darajalar o'zimizniki. O'yin oldindan "kompyuterdek"
 * yurib chiqishni o'rgatadi: algoritmni boshda bajarish.
 *
 * ─────────────── DARAJALAR CHEKSIZ ───────────────
 *
 * Daraja raqamidan urug' bilan yasaladi (`daraja(n)`): avval YECHIM yo'li
 * chiziladi (burilishlar — strelkalar), keyin chalg'ituvchi strelkalar
 * qo'shiladi va yo'ldagi bitta strelka buziladi. Yechuvchi tekshiradi:
 * buzilgan holatda shar yetmaydi va to'g'ri BITTA burish yagona bo'lsin
 * (`scripts/strelka.ts`).
 *
 * Fayl SOF: brauzersiz sinaladi.
 */

export type Yon = "u" | "r" | "d" | "l";
export const YONLAR: Yon[] = ["u", "r", "d", "l"];
const QADAM: Record<Yon, [number, number]> = { u: [-1, 0], r: [0, 1], d: [1, 0], l: [0, -1] };

export interface Daraja {
  n: number;
  en: number;
  boy: number;
  /** Shar boshlanadigan katak va yo'nalishi. */
  bosh: number;
  boshYon: Yon;
  yulduz: number;
  /** Katak → strelka yo'nalishi (boshlang'ich, buzilgan holat). */
  strelka: Record<number, Yon>;
  /** Yechim: qaysi katak qaysi tomonga (sinov va "maslahat" uchun). */
  yechim: { katak: number; yon: Yon };
}

export type Natija = { tur: "yetdi" | "chiqdi" | "aylandi"; yol: number[] };

/** Sharni yurgizadi: bosib o'tgan kataklari va oxiri. */
export function yurgiz(d: Pick<Daraja, "en" | "boy" | "bosh" | "boshYon" | "yulduz">,
  strelka: Record<number, Yon>): Natija {
  let joy = d.bosh;
  let yon = strelka[joy] ?? d.boshYon;
  const yol = [joy];
  const korilgan = new Set<string>();
  for (let q = 0; q < 400; q++) {
    const k = `${joy}:${yon}`;
    if (korilgan.has(k)) return { tur: "aylandi", yol };
    korilgan.add(k);
    const [dy, dx] = QADAM[yon];
    const y = Math.floor(joy / d.en) + dy, x = (joy % d.en) + dx;
    if (y < 0 || x < 0 || y >= d.boy || x >= d.en) return { tur: "chiqdi", yol };
    joy = y * d.en + x;
    yol.push(joy);
    if (joy === d.yulduz) return { tur: "yetdi", yol };
    if (strelka[joy]) yon = strelka[joy];
  }
  return { tur: "aylandi", yol };
}

/** Bitta strelkani burish bilan hosil bo'ladigan BARCHA yechimlar. */
export function yechimlar(d: Daraja): { katak: number; yon: Yon }[] {
  const nat: { katak: number; yon: Yon }[] = [];
  for (const [kx, eski] of Object.entries(d.strelka)) {
    const katak = Number(kx);
    for (const yon of YONLAR) {
      if (yon === eski) continue;
      if (yurgiz(d, { ...d.strelka, [katak]: yon }).tur === "yetdi") nat.push({ katak, yon });
    }
  }
  return nat;
}

function tasodif(urug: number): () => number {
  let s = (urug * 2654435761) >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Daraja o'lchami va murakkabligi raqamga qarab. */
function sozlama(n: number): { en: number; boy: number; burilish: number; chalgituvchi: number } {
  if (n <= 3) return { en: 4, boy: 4, burilish: 2, chalgituvchi: 1 };
  if (n <= 8) return { en: 5, boy: 5, burilish: 3, chalgituvchi: 3 };
  if (n <= 15) return { en: 6, boy: 6, burilish: 4, chalgituvchi: 5 };
  return { en: 6, boy: 7, burilish: 5, chalgituvchi: 7 };
}

/**
 * `n`-daraja. Bir xil `n` — doim bir xil maydon (hamma uchun bir xil,
 * do'stlar solishtira oladi). Urinishlar ichida birinchi MOS kelgani olinadi.
 */
export function daraja(n: number): Daraja {
  const { en, boy, burilish, chalgituvchi } = sozlama(n);
  for (let urinish = 0; urinish < 5000; urinish++) {
    const r = tasodif(n * 7919 + urinish);
    const ri = (k: number) => Math.floor(r() * k);
    // 1) Yechim yo'li: boshlanishdan tasodifiy to'g'ri chiziqlar, burilishlar — strelkalar.
    const bosh = ri(en * boy);
    let joy = bosh;
    let yon = YONLAR[ri(4)];
    const boshYon = yon;
    const band = new Set<number>([bosh]);
    const strelka: Record<number, Yon> = {};
    let buzildi = false;
    let soni = 0;
    for (; soni <= burilish; soni++) {
      const uzunlik = 1 + ri(3);
      for (let q = 0; q < uzunlik; q++) {
        const [dy, dx] = QADAM[yon];
        const y = Math.floor(joy / en) + dy, x = (joy % en) + dx;
        if (y < 0 || x < 0 || y >= boy || x >= en) { buzildi = true; break; }
        joy = y * en + x;
        if (band.has(joy)) { buzildi = true; break; }
        band.add(joy);
      }
      if (buzildi) break;
      if (soni < burilish) {
        const yangi = (["u", "d"].includes(yon) ? ["l", "r"] : ["u", "d"])[ri(2)] as Yon;
        strelka[joy] = yangi;
        yon = yangi;
      }
    }
    if (buzildi) continue;
    const yulduz = joy;
    delete strelka[yulduz];
    // 2) Chalg'ituvchi strelkalar — yo'ldan tashqarida.
    const bosh2 = [...Array(en * boy).keys()].filter((k) => !band.has(k));
    for (let i = 0; i < chalgituvchi && bosh2.length; i++) {
      const k = bosh2.splice(ri(bosh2.length), 1)[0];
      strelka[k] = YONLAR[ri(4)];
    }
    const d0 = { n, en, boy, bosh, boshYon, yulduz, strelka };
    if (yurgiz(d0, strelka).tur !== "yetdi") continue;
    // 3) Yo'ldagi bitta strelkani buzamiz.
    const yoldagi = Object.keys(strelka).map(Number).filter((k) => band.has(k));
    if (!yoldagi.length) continue;
    const katak = yoldagi[ri(yoldagi.length)];
    const togri = strelka[katak];
    const xato = YONLAR.filter((y) => y !== togri)[ri(3)];
    const buzuq = { ...strelka, [katak]: xato };
    const d: Daraja = { ...d0, strelka: buzuq, yechim: { katak, yon: togri } };
    if (yurgiz(d, buzuq).tur === "yetdi") continue;
    const ys = yechimlar(d);
    if (ys.length !== 1) continue;
    // Juda oson bo'lmasin: buzuq yo'l kamida bir necha katak yursin.
    if (yurgiz(d, buzuq).yol.length < 3) continue;
    return d;
  }
  throw new Error(`strelka: ${n}-daraja yasalmadi`);
}
