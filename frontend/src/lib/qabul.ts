/**
 * PREZIDENT VA IXTISOSLASHTIRILGAN MAKTABLARGA TAYYORLOV (5-sinfga qabul).
 *
 * ─────────────── NEGA ALOHIDA BO'LIM ───────────────
 *
 * 4-sinf bolasining ota-onasi uchun eng aniq maqsad — shu imtihon. U
 * DTM ga o'xshamaydi: savollar 1–4-sinf dasturidan, lekin "nostandart"
 * — tenglama o'rniga yangi kiritilgan amal, perimetr o'rniga qirqilgan
 * shakl, oddiy hisob o'rniga "eng kamida nechta olish kerak". Oddiy
 * 4-sinf darslari bunga tayyorlamaydi.
 *
 * ─────────────── UCH TUR ───────────────
 *
 *   ixtisos      Ixtisoslashtirilgan maktablar — rasmiy spetsifikatsiya
 *                (2026): 30 ta test, 70 daqiqa, 51 ball, har topshiriq
 *                o'z mavzusi va bali bilan (`qabulSavol.TOPSHIRIQLAR`).
 *   prezident    Prezident maktablari, 1-bosqich: 30 ta matematika
 *                testi, 90 daqiqa (ariza.piima.uz). Mazmuni — o'sha
 *                4-sinf dasturi, shuning uchun o'sha ro'yxatdan.
 *   prezident2   Prezident maktablari, 2-bosqich: tanqidiy fikrlash —
 *                16 ta ma'lumot tahlili + 24 ta mantiqiy matematika.
 *                Vaqti rasmiy e'lon qilinmagan: mashq uchun 90 daqiqa.
 *                Ingliz tili qismi bu yerda yo'q — ilova matematika haqida.
 *
 * Ball faqat `ixtisos` da rasmiy (51 ball). Prezident maktablarida
 * o'tish — reyting bo'yicha (har o'ringa 20 nomzoddan eng yaxshisi), ya'ni
 * "o'tish bali" yo'q va biz uni o'ylab topmaymiz: natija to'g'ri javoblar
 * va foizda ko'rsatiladi.
 *
 * Variant raqamdan URUG' bilan yasaladi (`lib/imtihon.ts` dagi kabi):
 * 5-variant har qurilmada bir xil — ota-onalar natijani solishtira oladi.
 */
import type { Blok, BlokSavol } from "./blok";
import { courseById } from "./curriculum";
import { kunUrugi, urugBilan } from "./oyin/urug";
import { BALL, MALUMOT, MANTIQ, TOPSHIRIQLAR } from "./qabulSavol";
import type { Topshiriq } from "./qabulSavol";

export type QabulTur = "ixtisos" | "prezident" | "prezident2";
export const QABUL_TURLAR: QabulTur[] = ["prezident", "ixtisos", "prezident2"];

/** Har turda nechta variant. */
export const QABUL_VARIANT = 12;

export const QABUL: Record<QabulTur, { savol: number; daqiqa: number; ball: number | null }> = {
  ixtisos: { savol: 30, daqiqa: 70, ball: 51 },
  prezident: { savol: 30, daqiqa: 90, ball: null },
  prezident2: { savol: 40, daqiqa: 90, ball: null },
};

export const qabulTurmi = (x: string | undefined): x is QabulTur =>
  x === "ixtisos" || x === "prezident" || x === "prezident2";

/**
 * Savolning izi — takrorni aniqlash uchun. Chizma va javob ham kiradi:
 * diagrammali savollarda matn bir xil, farqi faqat sonlarda.
 */
export const savolIzi = (a: { prompt: string; kirish?: string; text?: string; rasm?: string; answer: unknown }): string =>
  `${a.prompt}|${a.kirish ?? ""}|${a.text ?? ""}|${a.rasm ?? ""}|${String(a.answer)}`;

/** Variantning topshiriqlar ro'yxati — tartibi imtihondagidek. */
function reja(tur: QabulTur): Topshiriq[] {
  if (tur !== "prezident2") return TOPSHIRIQLAR;
  // 16 ma'lumot tahlili, keyin 24 mantiq — yasovchilar navbat bilan.
  return [
    ...Array.from({ length: 16 }, (_, i) => MALUMOT[i % MALUMOT.length]!),
    ...Array.from({ length: 24 }, (_, i) => MANTIQ[i % MANTIQ.length]!),
  ];
}

/**
 * Topshiriqlarning ballari (natija ekrani uchun). Faqat `ixtisos` da —
 * qolganida `null` (rasmiy bal yo'q).
 */
export function qabulBallari(tur: QabulTur): number[] | null {
  return QABUL[tur].ball === null ? null : reja(tur).map((x) => BALL[x.daraja]);
}

/** Ball — bir xona aniqlikda (51 lik shkala 1,1 va 2,1 dan yig'iladi). */
export const ballYaxlit = (x: number): number => Math.round(x * 10) / 10;

/**
 * Variantni yasaydi. Bir variant ichida bir xil savol IKKI MARTA
 * chiqmaydi (2-bosqichda bir yasovchi bir necha bor ishlaydi).
 */
export function qabulYasa(tur: QabulTur, n: number): Blok | null {
  if (!Number.isInteger(n) || n < 1 || n > QABUL_VARIANT) return null;
  const kurs = courseById("grade4");
  if (!kurs) return null;
  return urugBilan(kunUrugi(`qabul-${tur}-${n}`, 5), () => {
    const chiqqan = new Set<string>();
    const savollar: BlokSavol[] = reja(tur).map((T) => {
      let a = T.yasa();
      for (let k = 0; k < 30 && chiqqan.has(savolIzi(a)); k++) a = T.yasa();
      chiqqan.add(savolIzi(a));
      const U = kurs.units[T.bob] ?? kurs.units[0]!;
      return { a, kurs: kurs.key, kursId: kurs.id, ui: T.bob, li: 0, mavzu: U.u };
    });
    return { savollar, daqiqa: QABUL[tur].daqiqa };
  });
}

/* ------------------------------------------------------------ natija */

export interface QabulNatija {
  tur: QabulTur;
  variant: number;
  togri: number;
  jami: number;
  /** Faqat `ixtisos` da — 51 ballik. */
  ball: number | null;
  sekund: number;
  vaqt: number;
}

const KALIT = "azapp_qabul_v1";

export function qabulNatijalar(tur?: QabulTur): QabulNatija[] {
  try {
    const x = JSON.parse(localStorage.getItem(KALIT) || "[]") as QabulNatija[];
    const r = Array.isArray(x) ? x.filter((y) => y && qabulTurmi(y.tur) && typeof y.variant === "number") : [];
    return tur ? r.filter((y) => y.tur === tur) : r;
  } catch { return []; }
}

export function qabulSaqla(n: QabulNatija): void {
  try { localStorage.setItem(KALIT, JSON.stringify([n, ...qabulNatijalar()].slice(0, 60))); }
  catch { /* xotira to'lgan — natija faqat ekranda qoladi */ }
}

/** Variantdagi eng yaxshi urinish. */
export function qabulEng(tur: QabulTur, variant: number): QabulNatija | null {
  const r = qabulNatijalar(tur).filter((x) => x.variant === variant);
  return r.length ? r.reduce((a, b) => (b.togri > a.togri ? b : a)) : null;
}

/**
 * Oxirgi beshta urinishning o'rtachasi — foizda va (bo'lsa) ballda.
 * Bitta natija tasodifga bog'liq, beshtasi esa yo'nalishni ko'rsatadi.
 */
export function qabulOrtacha(tur: QabulTur): { foiz: number; ball: number | null; urinish: number } | null {
  const r = qabulNatijalar(tur).slice(0, 5);
  if (!r.length) return null;
  const foiz = Math.round(r.reduce((s, x) => s + (100 * x.togri) / Math.max(1, x.jami), 0) / r.length);
  const b = r.filter((x) => x.ball !== null);
  return {
    foiz,
    ball: b.length ? ballYaxlit(b.reduce((s, x) => s + x.ball!, 0) / b.length) : null,
    urinish: qabulNatijalar(tur).length,
  };
}
