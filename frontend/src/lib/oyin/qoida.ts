/**
 * QOIDA OVI — mantiq o'yini (`screens/QoidaOvi.tsx`).
 *
 * Darvozaning yashirin qoidasi bor: ba'zi sonlarni o'tkazadi, ba'zilarini
 * yo'q. Tepada misollar (✓ o'tdi / ✗ o'tmadi), pastda yangi sonlar —
 * qaysilari o'tishini belgilab "Tekshirish" bosiladi.
 *
 * G'oya — "qoidani top" tipidagi induksiya o'yinlari; bizda qoidalar
 * SONLARNING XOSSALARI: juft-toq, bo'linish, tub, kvadrat, raqamlar
 * yig'indisi. Ya'ni o'yin maktab mavzularini takrorlatadi, faqat
 * teskari yo'nalishda: xossani qo'llash emas, uni KO'RIB TANISH.
 *
 * ─────────────── JAVOB BIR MA'NOLI ───────────────
 *
 * Misollar ikki qoidaga mos kelishi mumkin ("juft" ham, "4 ga bo'linadi"
 * ham). Shunda pastdagi sonlar uchun javob ikki xil bo'lardi va to'g'ri
 * o'ylagan bola "xato" degan javob olardi. Generator shuni TEKSHIRADI:
 * misollarga mos keladigan HAR qoida pastdagi sonlarga ham bir xil javob
 * berishi kerak — aks holda savol qayta yasaladi (`scripts/qoida.ts`).
 *
 * Fayl SOF: brauzersiz sinaladi.
 */

export interface Qoida {
  id: string;
  /** Ekrandagi nomi — yechim ochilganda: "3 ga bo'linadi". */
  nom: [string, string];
  /** 1 — oson, 2 — o'rta, 3 — qiyin. */
  daraja: 1 | 2 | 3;
  mos: (n: number) => boolean;
}

const tub = (n: number) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};
const raqamlar = (n: number) => String(n).split("").map(Number);
const yigindi = (n: number) => raqamlar(n).reduce((a, b) => a + b, 0);

const bolinadi = (k: number, daraja: 1 | 2 | 3): Qoida => ({
  id: `bol${k}`, daraja, nom: [`${k} ga bo'linadi`, `делится на ${k}`], mos: (n) => n % k === 0,
});
const katta = (k: number): Qoida => ({
  id: `katta${k}`, daraja: 1, nom: [`${k} dan katta`, `больше ${k}`], mos: (n) => n > k,
});
const oxiri = (r: number): Qoida => ({
  id: `oxiri${r}`, daraja: 1, nom: [`${r} bilan tugaydi`, `оканчивается на ${r}`], mos: (n) => n % 10 === r,
});

export const QOIDALAR: Qoida[] = [
  { id: "juft", daraja: 1, nom: ["juft son", "чётное число"], mos: (n) => n % 2 === 0 },
  { id: "toq", daraja: 1, nom: ["toq son", "нечётное число"], mos: (n) => n % 2 === 1 },
  katta(50),
  oxiri(5), oxiri(0),
  bolinadi(3, 2), bolinadi(4, 2), bolinadi(5, 1), bolinadi(9, 3), bolinadi(6, 2),
  { id: "ikkiXonali", daraja: 1, nom: ["ikki xonali", "двузначное"], mos: (n) => n >= 10 && n <= 99 },
  { id: "birXil", daraja: 2, nom: ["raqamlari bir xil", "одинаковые цифры"],
    mos: (n) => n >= 10 && new Set(raqamlar(n)).size === 1 },
  { id: "tub", daraja: 3, nom: ["tub son", "простое число"], mos: tub },
  { id: "kvadrat", daraja: 3, nom: ["biror sonning kvadrati", "квадрат числа"],
    mos: (n) => Number.isInteger(Math.sqrt(n)) },
  { id: "yigJuft", daraja: 3, nom: ["raqamlari yig'indisi juft", "сумма цифр чётная"],
    mos: (n) => yigindi(n) % 2 === 0 },
  { id: "yig10", daraja: 3, nom: ["raqamlari yig'indisi 10", "сумма цифр равна 10"],
    mos: (n) => yigindi(n) === 10 },
  { id: "osuvchi", daraja: 3, nom: ["raqamlari o'sib boradi", "цифры возрастают"],
    mos: (n) => { const r = raqamlar(n); return r.length > 1 && r.every((v, i) => i === 0 || v > r[i - 1]); } },
  { id: "unlik", daraja: 2, nom: ["o'nliklar raqami birliklardan katta", "десятков больше, чем единиц"],
    mos: (n) => n >= 10 && n <= 99 && Math.floor(n / 10) > n % 10 },
];

export interface Savol {
  qoida: Qoida;
  /** Darvoza oldidagi misollar. */
  otdi: number[];
  otmadi: number[];
  /** Belgilanadigan sonlar va har birining to'g'ri javobi. */
  sonlar: number[];
  javob: boolean[];
}

/** Oddiy urug'li tasodif — sinovda takrorlansin. */
export function tasodif(urug: number): () => number {
  let s = urug >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Savolda sonlar oralig'i — qiyin bosqichda kattaroq. */
const ORALIQ: Record<1 | 2 | 3, number> = { 1: 60, 2: 99, 3: 99 };

function tanla(r: () => number, sonlar: number[], n: number, chiqar: Set<number>): number[] | null {
  const qolgan = sonlar.filter((x) => !chiqar.has(x));
  if (qolgan.length < n) return null;
  const nat: number[] = [];
  while (nat.length < n) {
    const x = qolgan[Math.floor(r() * qolgan.length)];
    if (!nat.includes(x)) nat.push(x);
  }
  return nat;
}

/**
 * Bitta savol. `bosqich` — qoida qiyinligi (1..3). Misollar shunday
 * tanlanadi: misolga mos HAMMA qoida pastdagi sonlarga bir xil javob beradi.
 */
export function savolYasa(bosqich: 1 | 2 | 3, r: () => number, oldingi?: string): Savol {
  const nomzod = QOIDALAR.filter((q) => q.daraja <= bosqich && q.id !== oldingi);
  // Shu bosqichning o'z qoidalari ko'proq chiqsin (eskilari takror sifatida).
  const vazn = nomzod.flatMap((q) => (q.daraja === bosqich ? [q, q, q] : [q]));
  for (let urinish = 0; urinish < 400; urinish++) {
    const qoida = vazn[Math.floor(r() * vazn.length)];
    const max = ORALIQ[bosqich];
    const hamma = Array.from({ length: max }, (_, i) => i + 1);
    const ha = hamma.filter(qoida.mos), yoq = hamma.filter((n) => !qoida.mos(n));
    const band = new Set<number>();
    const otdi = tanla(r, ha, 3, band); if (!otdi) continue;
    otdi.forEach((x) => band.add(x));
    const otmadi = tanla(r, yoq, 3, band); if (!otmadi) continue;
    otmadi.forEach((x) => band.add(x));
    const nHa = 2 + Math.floor(r() * 2);                 // 2 yoki 3 tasi o'tadi
    const pastHa = tanla(r, ha, nHa, band); if (!pastHa) continue;
    pastHa.forEach((x) => band.add(x));
    const pastYoq = tanla(r, yoq, 6 - nHa, band); if (!pastYoq) continue;
    const sonlar = [...pastHa, ...pastYoq].sort(() => r() - 0.5);
    const javob = sonlar.map(qoida.mos);
    // Bir ma'nolilik: misollarga mos har qoida pastga ham bir xil javob bersin.
    const raqib = QOIDALAR.filter((q) => q.id !== qoida.id
      && otdi.every(q.mos) && otmadi.every((n) => !q.mos(n)));
    if (raqib.some((q) => sonlar.some((n, i) => q.mos(n) !== javob[i]))) continue;
    return { qoida, otdi: otdi.sort((a, b) => a - b), otmadi: otmadi.sort((a, b) => a - b), sonlar, javob };
  }
  throw new Error("qoida ovi: savol yasalmadi");
}

/** O'yindagi savollar soni va har birining bosqichi. */
export const RAUND = 8;
export const bosqichi = (i: number): 1 | 2 | 3 => (i < 3 ? 1 : i < 6 ? 2 : 3);
