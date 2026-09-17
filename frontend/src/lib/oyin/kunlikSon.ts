/**
 * KUNLIK SON — Wordle uslubidagi matematik jumboq.
 *
 * Har kuni bitta yashirin TENGLIK, masalan `7×8−6=50`. Olti urinish.
 * Har urinishdan keyin katakchalar rang oladi:
 *
 *   yashil  — belgi bor va joyida
 *   oltin   — belgi bor, lekin boshqa joyda
 *   bo'z    — bunday belgi yo'q
 *
 * ──────────────────── NEGA TENGLIK, SON EMAS ────────────────────
 *
 * Faqat son topishda (`4827`) matematika yo'q — bu shunchaki taxmin. Tenglik
 * esa har urinishni HISOB qiladi: urinish ham to'g'ri tenglik bo'lishi
 * shart, ya'ni odam har qatorda misol yechadi. Nerdle o'yini shu g'oyada.
 *
 * ──────────────────── HAR KIMGA O'Z DARAJASI ────────────────────
 *
 *   Oson   6 belgi, faqat + va −      `9+8=17`
 *   O'rta  8 belgi, + − ×             `7×8−6=50`
 *   Qiyin  8 belgi, ÷ albatta bor     `48÷6+3=11`
 *
 * Kun bir, jumboq har darajada boshqa. Hamma bir xil sanada bir xil
 * jumboqni oladi — natijani ulashish shuning uchun ma'noli.
 *
 * Fayl SOF: brauzersiz sinaladi (`scripts/kunlikSon.ts`). Ichki yozuv
 * ASCII (`* / -`), ekranda `× ÷ −` ko'rinadi.
 */
import { kunUrugi } from "./urug";
import type { Daraja } from "./tur";

export type Rang = "yashil" | "oltin" | "boz";

/** O'yinning birinchi kuni — jumboq raqami (`#12`) shundan sanaladi. */
export const BOSHLANISH = "2026-09-17";
export const URINISH = 6;

export const uzunlik = (d: Daraja): number => (d === 1 ? 6 : 8);

/** Klaviatura va ekran uchun belgi yozuvi. */
export const korinish = (b: string): string => (b === "*" ? "×" : b === "/" ? "÷" : b === "-" ? "−" : b);

/** Jumboq raqami: 17-sentabr — #1. */
export function jumboqRaqami(kun: string): number {
  const [y, m, d] = kun.split("-").map(Number);
  const [by, bm, bd] = BOSHLANISH.split("-").map(Number);
  const farq = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(by, bm - 1, bd)) / 86_400_000);
  return farq + 1;
}

/* ------------------------------------------------------------ hisoblash */

/**
 * Ifodani amallar tartibi bilan hisoblaydi. Yaroqsiz bo'lsa — `null`.
 *
 * Yaroqsiz: bo'sh son, oldida nol bo'lgan son (`07`), ketma-ket ikki amal,
 * nolga yoki qoldiqli bo'lish. Qoldiqli bo'lishni ATAYLAB rad etamiz —
 * `7÷2` kabi urinish bolani kasr bilan chalg'itadi va javob butun son.
 */
export function hisobla(ifoda: string): number | null {
  const bolak = ifoda.split(/([+\-*/])/);
  if (bolak.length % 2 === 0) return null;
  const sonlar: number[] = [];
  const amallar: string[] = [];
  for (let i = 0; i < bolak.length; i++) {
    const s = bolak[i];
    if (i % 2 === 0) {
      if (!/^\d+$/.test(s) || (s.length > 1 && s[0] === "0")) return null;
      sonlar.push(Number(s));
    } else amallar.push(s);
  }
  // Avval × va ÷.
  const s2 = [sonlar[0]];
  const a2: string[] = [];
  for (let i = 0; i < amallar.length; i++) {
    const a = amallar[i];
    const b = sonlar[i + 1];
    if (a === "*" || a === "/") {
      const oldingi = s2.pop()!;
      if (a === "*") s2.push(oldingi * b);
      else {
        if (b === 0 || oldingi % b !== 0) return null;
        s2.push(oldingi / b);
      }
    } else {
      a2.push(a);
      s2.push(b);
    }
  }
  let natija = s2[0];
  for (let i = 0; i < a2.length; i++) natija = a2[i] === "+" ? natija + s2[i + 1] : natija - s2[i + 1];
  return natija;
}

export type TekshiruvXato = "uzunlik" | "tenglik" | "notogri" | "teng_emas" | "";

/** Urinish yaroqli tenglikmi: to'g'ri uzunlik, bitta `=`, o'ngda son, ikki tomon teng. */
export function tekshir(urinish: string, n: number): TekshiruvXato {
  if (urinish.length !== n) return "uzunlik";
  const qism = urinish.split("=");
  if (qism.length !== 2) return "tenglik";
  if (!/^\d+$/.test(qism[1]) || (qism[1].length > 1 && qism[1][0] === "0")) return "notogri";
  const chap = hisobla(qism[0]);
  if (chap === null) return "notogri";
  return chap === Number(qism[1]) ? "" : "teng_emas";
}

/**
 * Wordle qoidasi bilan ranglar.
 *
 * Takroriy belgilar ikki bosqichda: avval yashillar yechimdagi nusxani
 * "band qiladi", keyin qolgan nusxalar oltin bo'ladi. Aks holda
 * `11+1=12` kabi urinishda bitta `1` uch marta oltin ko'rinib, yolg'on
 * maslahat berardi.
 */
export function solishtir(urinish: string, yechim: string): Rang[] {
  const rang: Rang[] = Array(urinish.length).fill("boz");
  const qolgan: Record<string, number> = {};
  for (let i = 0; i < yechim.length; i++) {
    if (urinish[i] === yechim[i]) rang[i] = "yashil";
    else qolgan[yechim[i]] = (qolgan[yechim[i]] ?? 0) + 1;
  }
  for (let i = 0; i < urinish.length; i++) {
    if (rang[i] === "yashil") continue;
    const b = urinish[i];
    if (qolgan[b]) {
      rang[i] = "oltin";
      qolgan[b]--;
    }
  }
  return rang;
}

/* ------------------------------------------------------------ yasash */

/** Kichik, takrorlanuvchan tasodif — `Math.random` ga tegmaydi. */
function rng(urug: number) {
  let x = urug >>> 0 || 1;
  return () => {
    x = (x + 0x6d2b79f5) >>> 0;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ZAXIRA: Record<Daraja, string> = { 1: "9+8=17", 2: "7*8-6=50", 3: "48/6+3=11" };

/**
 * Kunning jumboqi. Bir sana + daraja → har doim bir xil tenglik.
 *
 * Tasodifiy shablon to'ldiriladi va shartlarga mos kelguncha qayta
 * uriniladi: uzunlik aniq, javob manfiy emas, qiyin darajada `÷` bor.
 */
export function jumboq(kun: string, d: Daraja): string {
  const r = rng(kunUrugi(kun, 100 + d));
  const son = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
  const n = uzunlik(d);
  for (let k = 0; k < 2000; k++) {
    let chap: string;
    if (d === 1) {
      const a = son(2, 20), b = son(1, 20);
      chap = r() < 0.5 ? `${a}+${b}` : `${Math.max(a, b)}-${Math.min(a, b)}`;
    } else if (d === 2) {
      const a = son(2, 12), b = son(2, 12), c = son(1, 20);
      const shakl = Math.floor(r() * 4);
      chap = shakl === 0 ? `${a}*${b}-${c}` : shakl === 1 ? `${a}*${b}+${c}`
        : shakl === 2 ? `${c}+${a}*${b}` : `${a}+${b}+${c}`;
    } else {
      const b = son(2, 9), q = son(2, 12), c = son(1, 20);
      const shakl = Math.floor(r() * 3);
      chap = shakl === 0 ? `${b * q}/${b}+${c}` : shakl === 1 ? `${b * q}/${b}-${Math.min(c, q)}`
        : `${c}+${b * q}/${b}`;
    }
    const natija = hisobla(chap);
    if (natija === null || natija < 0) continue;
    const tenglik = `${chap}=${natija}`;
    if (tenglik.length !== n) continue;
    if (d === 3 && !tenglik.includes("/")) continue;
    if (d === 2 && !tenglik.includes("*") && r() < 0.8) continue;
    return tenglik;
  }
  return ZAXIRA[d];
}

/** Ulashiladigan kvadratchalar — sonlarsiz, jumboqni ochib qo'ymaydi. */
export function ulashKvadratlar(urinishlar: string[], yechim: string): string {
  const belgi: Record<Rang, string> = { yashil: "🟩", oltin: "🟨", boz: "⬜" };
  return urinishlar.map((u) => solishtir(u, yechim).map((x) => belgi[x]).join("")).join("\n");
}
