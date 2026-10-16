/**
 * JONLI DARS — DTM mavzulari bo'yicha ovozli, chizmali darslar.
 *
 * ─────────────── NEGA VIDEO EMAS ───────────────
 *
 * AI video matematikada adashadi (grafik, burchak, formula), har
 * daqiqasi qimmat, xatoni tuzatish uchun hammasini qayta yasash kerak
 * va u interaktiv emas. Jonli dars esa video kabi ko'rinadi — doskada
 * yozuv va chizma bosqichma-bosqich paydo bo'ladi, Aisha o'zbekcha
 * tushuntiradi — lekin:
 *
 *   * formula va chizma ANIQ (chizma `lib/aiChizma.ts` da hisoblanadi);
 *   * o'rtada savol beriladi va javob tekshiriladi;
 *   * dars BIR MARTA yasaladi (`manage.py jonli_dars`) va hamma uchun
 *     bir xil: ovoz fayllari serverda keshlanadi, har o'quvchiga pul ketmaydi;
 *   * xato topilsa — bitta JSON tuzatiladi.
 *
 * ─────────────── FORMAT ───────────────
 *
 * `public/darslar/<slug>.json` — bitta DTM mavzusining darslari. Sahna —
 * yo tushuntirish (`aytish` — ovozda o'qiladigan so'zlar, `yozuv` —
 * doskadagi qatorlar, `chizma`), yo savol. `aytish` alohida, chunki TTS
 * "sin x = 1/2" ni o'qiy olmaydi: ovoz uchun "sinus iks teng yarim".
 *
 * Fayl ishonchsiz deb tekshiriladi (`tekshirDars`): qo'lda tahrirlanganda
 * buzilgan sahna ekranni yiqitmasin, shunchaki tashlab ketilsin.
 */
import { tekshir as chizmaTekshir } from "./aiChizma";
import type { Chizma } from "./aiChizma";

export interface Savol {
  matn: string;
  variantlar: string[];
  togri: number;
  izoh: string;
}

export interface Sahna {
  /** Ovozda o'qiladigan matn (so'zlar bilan, belgisiz). */
  aytish: string;
  /** Doskadagi qatorlar — formula va qisqa gaplar. */
  yozuv: string[];
  chizma: Chizma | null;
  savol: Savol | null;
}

export interface Dars {
  n: number;
  nom: string;
  /** Bir gap: dars oxirida o'quvchi nimani bila oladi. */
  maqsad: string;
  sahnalar: Sahna[];
}

export interface MavzuDarslari {
  slug: string;
  darslar: Dars[];
}

const matn = (x: unknown, n: number) => (typeof x === "string" ? x.trim().slice(0, n) : "");

/** Bitta sahna — buzilgan bo'lsa `null`. */
function sahna(x: unknown): Sahna | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const aytish = matn(o.aytish, 1200);
  const yozuv = Array.isArray(o.yozuv) ? o.yozuv.map((q) => matn(q, 120)).filter(Boolean).slice(0, 8) : [];
  const chizma = o.chizma && typeof o.chizma === "object" ? chizmaTekshir(JSON.stringify(o.chizma)) : null;
  let savol: Savol | null = null;
  if (o.savol && typeof o.savol === "object") {
    const s = o.savol as Record<string, unknown>;
    const variantlar = Array.isArray(s.variantlar) ? s.variantlar.map((v) => matn(v, 80)).filter(Boolean).slice(0, 4) : [];
    const togri = typeof s.togri === "number" ? s.togri : -1;
    if (matn(s.matn, 300) && variantlar.length >= 2 && togri >= 0 && togri < variantlar.length) {
      savol = { matn: matn(s.matn, 300), variantlar, togri, izoh: matn(s.izoh, 400) };
    }
  }
  if (!aytish && !yozuv.length && !chizma && !savol) return null;
  return { aytish, yozuv, chizma, savol };
}

export function tekshirDars(x: unknown): Dars | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const sahnalar = Array.isArray(o.sahnalar) ? o.sahnalar.map(sahna).filter((s): s is Sahna => s !== null) : [];
  if (!sahnalar.length || typeof o.n !== "number") return null;
  return { n: o.n, nom: matn(o.nom, 80) || `${o.n}-dars`, maqsad: matn(o.maqsad, 200), sahnalar };
}

export function tekshirMavzu(x: unknown): MavzuDarslari | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const darslar = Array.isArray(o.darslar) ? o.darslar.map(tekshirDars).filter((d): d is Dars => d !== null) : [];
  return typeof o.slug === "string" && darslar.length ? { slug: o.slug, darslar } : null;
}

/**
 * Ovoz bo'laklari — serverdagi TTS bitta so'rovda 200 belgigacha oladi
 * (`core/ovoz.py`, `MAX_SORV`). Gaplar chegarasida bo'linadi; generator
 * (`jonli_dars`) AYNAN shu qoida bilan oldindan yasaydi — bo'linish
 * farq qilsa, ovoz keshdan topilmay jim qolardi.
 */
export function ovozBolaklari(aytish: string, n = 190): string[] {
  const gaplar = aytish.replace(/\s+/g, " ").trim().split(/(?<=[.!?])\s+/).filter(Boolean);
  const natija: string[] = [];
  for (const g of gaplar) {
    if (g.length <= n) { natija.push(g); continue; }
    // Juda uzun gap — vergul yoki bo'shliqda bo'linadi.
    let qoldiq = g;
    while (qoldiq.length > n) {
      const kesim = Math.max(qoldiq.lastIndexOf(", ", n), qoldiq.lastIndexOf(" ", n));
      const k = kesim > n / 2 ? kesim + 1 : n;
      natija.push(qoldiq.slice(0, k).trim());
      qoldiq = qoldiq.slice(k).trim();
    }
    if (qoldiq) natija.push(qoldiq);
  }
  return natija;
}

/** Mavzu darslari — statik fayl (`public/darslar`). Yo'q bo'lsa `null`. */
export async function mavzuDarslari(slug: string): Promise<MavzuDarslari | null> {
  if (!/^[a-z-]+$/.test(slug)) return null;
  try {
    const r = await fetch(`/darslar/${slug}.json`);
    if (!r.ok) return null;
    return tekshirMavzu(await r.json());
  } catch {
    return null;
  }
}

/** Qaysi mavzularda dars bor — bosh sahifa va reja kartasi uchun (`public/darslar/royxat.json`). */
export async function darsliMavzular(): Promise<string[]> {
  try {
    const r = await fetch("/darslar/royxat.json");
    const x = (await r.json()) as unknown;
    return Array.isArray(x) ? x.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/** Ovoz manzili — `GET /api/v1/ovoz` keshdagi faylni beradi. */
export const ovozManzil = (bolak: string) => `/api/v1/ovoz?matn=${encodeURIComponent(bolak)}`;
