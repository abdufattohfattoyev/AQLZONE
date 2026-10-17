/**
 * KIRISH YO'LI — "kira olamanmi?" savoliga raqam bilan javob.
 *
 * ─────────────────── NEGA ───────────────────
 *
 * Test hamma ilovada bor; abituriyent esa test uchun emas, KIRISH uchun
 * tayyorlanadi. Natija "142 ball" deydi — u qaysi yo'nalishga yetadi,
 * hech kim aytmaydi. Bu yerda odam o'z maqsadini (OTM, yo'nalish) tanlaydi
 * va doim bitta raqamni ko'radi: "grantgacha yana 4 ta savol".
 *
 * Ilgari natija kartasida "maqsad" so'ralardi va egasi uni ortiqcha qadam
 * deb olib tashlatgan (`FarqKarta.tsx`). Shuning uchun bu yerda maqsad
 * hech qachon so'ralmaydi — o'zi xohlagan odam alohida sahifada tanlaydi.
 *
 * ─────────────────── HISOB (DTM, 189 ball) ───────────────────
 *
 *   majburiy:  ona tili, matematika, tarix — 10 savol × 1,1
 *   1-fan:     30 savol × 3,1 = 93
 *   2-fan:     30 savol × 2,1 = 63
 *
 * Ilova faqat MATEMATIKANI biladi. Shuning uchun matematikaning ulushi
 * (1-fan yoki 2-fan + majburiy 11) DTM variantlaridagi o'rtacha foizdan
 * olinadi, qolgan fanlarni esa odam o'zi taxmin qiladi (surgich). Bu
 * yashirilmaydi: ekranda "boshqa fanlar — sizning taxminingiz" deb yozilgan.
 *
 * Ma'lumot: o'tish ballari 2025 — UZBMB (mandat.uzbmb.uz, ochiq jadval);
 * fanlar majmuasi 2025/2026 — infoedu.uz. Faqat matematika 1- yoki 2-fan
 * bo'lgan yo'nalishlar olingan: qolganlarida ilova yordam bera olmaydi.
 *
 * GRANT: rasmiy jadvalda 2025 uchun grant ustuni hamma joyda 0 (e'lon
 * qilinmagan), uchinchi tomon saytlarining grant raqamlari manbasiz —
 * shuning uchun asosiy raqam TO'LOV-SHARTNOMA o'tish bali. `grant` maydoni
 * qoldirilgan: UZBMB e'lon qilsa, jadvalni qayta yig'ish kifoya:
 *   python scripts/otish/yigish.py <papka>      (~10 daqiqa, ochiq so'rovlar)
 *   python scripts/otish/ixcham.py <papka> src/lib/data/otish2025.json
 * Tekshiruv: `scripts/kirish.ts` (`npm run tekshir`).
 */

export interface Yonalish {
  /** OTM nomi. */
  otm: string;
  hudud: string;
  /** Ta'lim shakli: "Kunduzgi", "Sirtqi"... */
  tur: string;
  til: string;
  /** Yo'nalish shifri (DIRID). */
  kod: number;
  nomi: string;
  /** 0 — grant o'rni yo'q. */
  grant: number;
  kontrakt: number;
  /** Matematika qaysi mutaxassislik fani: 1 (×3,1) yoki 2 (×2,1). */
  orin: 1 | 2;
}

/** `data/otish2025.json` — ixcham: OTM nomlari alohida, qatorlar massiv. */
interface XomFayl {
  manba: string;
  otm: string[];
  hudud: string[];
  tur: string[];
  til: string[];
  /** [otm, hudud, tur, til, kod, nomi, grant, kontrakt, orin] */
  q: [number, number, number, number, number, string, number, number, 1 | 2][];
}

let kesh: Promise<Yonalish[]> | null = null;

/** Jadval faqat shu sahifa ochilganda yuklanadi — asosiy to'plamga tushmaydi. */
export function yonalishlar(): Promise<Yonalish[]> {
  kesh ??= import("./data/otish2025.json").then((m) => {
    const x = m.default as unknown as XomFayl;
    return x.q.map(([o, h, tu, ti, kod, nomi, grant, kontrakt, orin]) => ({
      otm: x.otm[o], hudud: x.hudud[h], tur: x.tur[tu], til: x.til[ti], kod, nomi, grant, kontrakt, orin,
    }));
  });
  return kesh;
}

/* ------------------------------------------------------------ maqsad */

const KALIT = "azapp_kirish_v1";

export interface Maqsad {
  y: Yonalish;
  /** Boshqa fanlardan taxminiy foiz (0–100) — odamning o'z bahosi. */
  boshqa: number;
}

/** Surgichning boshlang'ich qiymati — o'rtacha abituriyent taxminan shuncha. */
export const BOSHQA_BOSHI = 60;

export function maqsadOqi(): Maqsad | null {
  try {
    const x = JSON.parse(localStorage.getItem(KALIT) || "null") as Maqsad | null;
    return x && x.y && typeof x.y.kod === "number" ? x : null;
  } catch { return null; }
}

export function maqsadSaqla(m: Maqsad | null): void {
  try {
    if (m) localStorage.setItem(KALIT, JSON.stringify(m));
    else localStorage.removeItem(KALIT);
  } catch { /* xotira yopiq — faqat shu safar */ }
}

/* ------------------------------------------------------------ hisob */

export const MAKS = 189;
/** DTM variantidagi savollar (`lib/imtihon.ts` OLCHAM bilan bir xil). */
const SAVOL = 30;

/** Matematikaning eng ko'p bali: mutaxassislik fani + majburiy 11. */
export const matemMaks = (orin: 1 | 2) => (orin === 1 ? 93 : 63) + 11;

export interface Hisob {
  /** Taxminiy jami ball. */
  ball: number;
  /** Shundan matematika. */
  matem: number;
  boshqa: number;
  /** Grant chegarasigacha ball (manfiy — o'tib ketgan, `null` — grant yo'q). */
  grantFarq: number | null;
  kontraktFarq: number;
  /**
   * Grantga yetish uchun 30 talik variantda yana NECHTA savol to'g'ri
   * bo'lishi kerak. 0 — yetarli; `null` — grant yo'q yoki matematikaning
   * o'zi bilan yetib bo'lmaydi (`yetmaydi`).
   */
  grantSavol: number | null;
  kontraktSavol: number | null;
  /** 30/30 yechsa ham grantga yetmaydi — boshqa fanlarni ko'tarish kerak. */
  yetmaydi: boolean;
}

/** `foiz` — DTM variantlaridagi o'rtacha to'g'ri javob foizi. */
export function hisobla(y: Yonalish, foiz: number, boshqa: number): Hisob {
  const mm = matemMaks(y.orin);
  const bm = MAKS - mm;
  const matem = (foiz / 100) * mm;
  const bosh = (boshqa / 100) * bm;
  const ball = matem + bosh;
  /** Chegaraga yetish uchun kerakli savollar soni (30 dan). */
  const savol = (chegara: number): number | null => {
    if (chegara <= 0) return null;
    const kerak = ((chegara - bosh) / mm) * SAVOL;
    if (kerak > SAVOL) return null;
    return Math.max(0, Math.ceil(kerak - (foiz / 100) * SAVOL - 1e-9));
  };
  const grantSavol = savol(y.grant);
  return {
    ball, matem, boshqa: bosh,
    grantFarq: y.grant > 0 ? y.grant - ball : null,
    kontraktFarq: y.kontrakt - ball,
    grantSavol,
    kontraktSavol: savol(y.kontrakt),
    yetmaydi: y.grant > 0 && grantSavol === null,
  };
}

/** 132,7 — o'zbekcha va ruscha ikkalasida vergul. */
export const ballYoz = (x: number) => (Math.round(x * 10) / 10).toFixed(1).replace(".", ",");
