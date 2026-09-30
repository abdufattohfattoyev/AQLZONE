/**
 * MAVZUNI O'ZLASHTIRISH DARAJASI — har bob uchun (kurs + bob raqami).
 *
 * ─────────────── NEGA ───────────────
 *
 * Ilgari zaif mavzu faqat "xato soni" edi: odam mashq qilib, keyin
 * imtihonda to'g'ri yechsa ham, bu hech qayerda ko'rinmasdi — o'sayotganini
 * sezmasdi. Khan Academy'dagi mastery usuli olindi, chunki u sinalgan va
 * sodda: daraja FAQAT natija bilan o'zgaradi, vaqt yoki bosish bilan emas.
 *
 *   0  Urinilgan         mashqda 70% dan kam
 *   1  Tanish            mashqda 70–99%
 *   2  Bilaman           mashqda 100%
 *   3  O'zlashtirilgan   "Bilaman" bo'lgan mavzu ARALASH testda (DTM,
 *                        sertifikat, blok test) ham xatosiz chiqdi
 *
 * Aralash testda shu bobdan xato bo'lsa — bir pog'ona tushadi: bilim
 * unutiladi va daraja buni yashirmasligi kerak.
 *
 * Faqat qurilmada saqlanadi (boshqa progress kabi).
 */

export type Daraja = 0 | 1 | 2 | 3;

interface Yozuv { d: Daraja; t: number }

const KALIT = "azapp_ozlash_v1";

/** Bob kaliti. */
export const bobKalit = (kursId: string, ui: number) => `${kursId}|${ui}`;

function oqi(): Record<string, Yozuv> {
  try {
    const x = JSON.parse(localStorage.getItem(KALIT) || "{}") as unknown;
    return x && typeof x === "object" && !Array.isArray(x) ? x as Record<string, Yozuv> : {};
  } catch { return {}; }
}

function yoz(m: Record<string, Yozuv>): void {
  try { localStorage.setItem(KALIT, JSON.stringify(m)); } catch { /* ko'rinmaydi, xolos */ }
}

/** Bobning darajasi; hali hech narsa ishlanmagan bo'lsa — `undefined`. */
export function darajasi(kursId: string, ui: number): Daraja | undefined {
  const y = oqi()[bobKalit(kursId, ui)];
  return y && [0, 1, 2, 3].includes(y.d) ? y.d : undefined;
}

/** Bitta natijaning bob bo'yicha hisobi. */
export interface BobHisob { kursId: string; ui: number; togri: number; jami: number }

/** Savollardan bob bo'yicha to'g'ri/jami yig'adi. */
export function boblargaYig(savollar: { kursId: string; ui: number; togri: boolean }[]): BobHisob[] {
  const m = new Map<string, BobHisob>();
  for (const s of savollar) {
    const k = bobKalit(s.kursId, s.ui);
    const b = m.get(k) ?? { kursId: s.kursId, ui: s.ui, togri: 0, jami: 0 };
    b.jami++;
    if (s.togri) b.togri++;
    m.set(k, b);
  }
  return [...m.values()];
}

/** Mashqdagi foizdan daraja: 3 tadan kam savol bo'lsa foiz ishonchsiz. */
const MASHQ_MIN = 3;

/**
 * Yangi daraja — sof funksiya (sinovda tekshiriladi).
 *
 * `mashq` — faqat shu mavzudan savollar (mavzu mashqi, zaif mavzular
 * mashqi); `aralash` — ko'p mavzuli test.
 */
export function yangiDaraja(eski: Daraja | undefined, b: Pick<BobHisob, "togri" | "jami">, tur: "mashq" | "aralash"): Daraja {
  if (b.jami <= 0) return eski ?? 0;
  const xatosiz = b.togri === b.jami;
  if (tur === "mashq" && b.jami >= MASHQ_MIN) {
    const foiz = b.togri / b.jami;
    if (foiz < 0.7) return 0;
    if (!xatosiz) return 1;
    // 100% — kamida "Bilaman". "O'zlashtirilgan" mashq bilan tushmaydi.
    return eski === 3 ? 3 : 2;
  }
  if (xatosiz) {
    if (eski === undefined) return 1;
    return Math.min(3, eski + 1) as Daraja;
  }
  return Math.max(0, (eski ?? 1) - 1) as Daraja;
}

/** Natijani yozadi; o'zgargan boblar qaytadi (natija ekrani ko'rsatishi uchun). */
export function natijaYoz(boblar: BobHisob[], tur: "mashq" | "aralash"): { kursId: string; ui: number; eski?: Daraja; yangi: Daraja }[] {
  const m = oqi();
  const r: { kursId: string; ui: number; eski?: Daraja; yangi: Daraja }[] = [];
  for (const b of boblar) {
    const k = bobKalit(b.kursId, b.ui);
    const eski = m[k]?.d;
    const yangi = yangiDaraja(eski, b, tur);
    m[k] = { d: yangi, t: Date.now() };
    r.push({ kursId: b.kursId, ui: b.ui, eski, yangi });
  }
  yoz(m);
  return r;
}
