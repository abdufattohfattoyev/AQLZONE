/**
 * O'yin rekordlari — qurilmada saqlanadi.
 *
 * Rekord `o'yin + daraja` juftligi bo'yicha ALOHIDA turadi va bu
 * butun bo'limning asosiy qoidasi. Bitta umumiy rekord bo'lganda
 * "Qiyin" darajada 8 ball olgan katta bilan "Oson" da 30 ball olgan
 * bola bir jadvalda turardi — ikkalasi ham o'z natijasining ma'nosini
 * yo'qotadi.
 *
 * Progressdan farqli o'laroq rekord SERVERGA YUBORILMAYDI: u yerda
 * yulduz va dars natijalari bor, o'yin esa ularga aralashmasligi kerak.
 * O'yindan olingan TANGA esa progressga tushadi (`progress.tsx` dagi
 * `oyinTugadi`) — ya'ni o'yin mavjud iqtisodni to'ldiradi, o'ziga
 * alohida pul yasamaydi.
 */
import { joriyProfil } from "../api";
import { kunKaliti } from "../zanjir";
import { DARAJALAR } from "./tur";
import type { Daraja, OyinId } from "./tur";
import type { MaydonNatija } from "./maydon";

const KALIT = "azapp_oyin_v1";

interface Yozuv {
  /** Eng yaxshi natija. */
  ball: number;
  /** Necha marta o'ynalgan — kartada "hali o'ynalmagan" ni ajratish uchun. */
  soni: number;
  /** Oxirgi marta qaysi kuni o'ynalgan ("2026-07-31"). */
  kun: string;
}

type Hammasi = Record<string, Yozuv>;

const BOSH: Yozuv = { ball: 0, soni: 0, kun: "" };

/**
 * Kalit profil bilan birga turadi.
 *
 * Bir telefonda ikki farzand o'ynasa, akasining rekordi ukasining
 * ekranida turmasligi kerak: aks holda kichigi hech qachon "yangi
 * rekord" degan yozuvni ko'rmaydi va o'yinning butun ma'nosi yo'qoladi.
 */
function kalit(): string {
  const p = joriyProfil();
  return p ? `${KALIT}::${p}` : KALIT;
}

function oqi(): Hammasi {
  try {
    const raw = localStorage.getItem(kalit());
    return raw ? (JSON.parse(raw) as Hammasi) : {};
  } catch {
    return {};
  }
}

function yoz(h: Hammasi): void {
  try {
    localStorage.setItem(kalit(), JSON.stringify(h));
  } catch {
    /* xotira to'lgan — rekord saqlanmaydi, o'yin esa ishlashda davom etadi */
  }
}

const k = (id: OyinId, d: Daraja) => `${id}:${d}`;

const yozuv = (id: OyinId, d: Daraja): Yozuv => oqi()[k(id, d)] ?? BOSH;

/** Shu o'yin va darajadagi eng yaxshi natija. */
export const rekord = (id: OyinId, d: Daraja): number => yozuv(id, d).ball;

/**
 * Daraja ochiqmi.
 *
 * Shart OLDINGI darajaga qo'yiladi va u ataylab past: bir-ikki
 * o'yin yetadi. Qulfning maqsadi to'sish emas — hech kim isinmasdan
 * turib eng qiyin darajaga tushib, uch xato bilan chiqib ketmasin.
 */
export function ochiqmi(id: OyinId, d: Daraja): boolean {
  if (d === 1) return true;
  const oldingi = (d - 1) as Daraja;
  return rekord(id, oldingi) >= DARAJALAR[d - 1].ochish;
}

/** Ochilishga yana necha ball kerak. Ochiq bo'lsa 0. */
export function ochishgaQolgan(id: OyinId, d: Daraja): number {
  if (ochiqmi(id, d)) return 0;
  return DARAJALAR[d - 1].ochish - rekord(id, (d - 1) as Daraja);
}

/**
 * Natijani yozadi va YANGI REKORD bo'lsa `true` qaytaradi.
 *
 * Rekord faqat oshadi. Yomonroq o'ynalgan o'yin ham yoziladi (soni va
 * kuni yangilanadi), lekin balli tegilmaydi — aks holda bir marta
 * shoshib o'ynalgan o'yin haftalik mehnatni o'chirib yuborardi.
 */
export function natijaniYoz(id: OyinId, d: Daraja, ball: number): boolean {
  const h = oqi();
  const eski = h[k(id, d)] ?? BOSH;
  const yangi = ball > eski.ball;
  h[k(id, d)] = {
    ball: Math.max(eski.ball, ball),
    soni: eski.soni + 1,
    kun: kunKaliti(),
  };
  yoz(h);
  return yangi;
}

/* ------------------------------------------------------------------ */
/*                          kunlik bonus                              */
/* ------------------------------------------------------------------ */

/** Har o'yinning KUNIGA BIRINCHI o'ynalishida tanga necha barobar. */
export const BONUS = 2;

/**
 * Bugun shu o'yin (istalgan darajada) allaqachon o'ynalganmi.
 *
 * Bonus DARAJAGA emas, O'YINGA bog'liq. Aks holda uchta darajani
 * ketma-ket ochib, bir o'yindan uch marta ikkilangan tanga olish
 * mumkin bo'lardi.
 */
export function bugunOynalgan(id: OyinId): boolean {
  const h = oqi();
  return DARAJALAR.some((x) => h[k(id, x.n)]?.kun === kunKaliti());
}

/**
 * Bir o'yin necha tanga beradi.
 *
 * Ball darsdagidan ancha ko'p to'planadi (60 soniyada 20–30 ta to'g'ri
 * javob), shuning uchun tanga uchdan bir qilib olinadi — busiz do'kondagi
 * narxlar bir kunda ma'nosini yo'qotardi.
 *
 * Yuqoriga yaxlitlanadi: bitta ball ham nol tanga qaytarmasin. Nol
 * tanga — "o'ynaganing behuda ketdi" degan gap va uni birinchi marta
 * o'ynagan, hali qo'li kelmagan odam eshitadi.
 */
export const tangaHisobi = (ball: number, bonus: boolean): number =>
  Math.max(0, Math.ceil(ball / 3)) * (bonus ? BONUS : 1);

/* ================= BUGUNGI MAYDON ================= */

const MAYDON_KALIT = "azapp_maydon_v1";

/**
 * Maydon natijasi shu faylda saqlanadi, `maydon.ts` da emas.
 *
 * `maydon.ts` — QOIDA: qaysi kun qaysi o'yin, qaysi savol. U sof va
 * uni brauzersiz sinash mumkin (`scripts/maydon.ts`). Saqlash esa
 * `localStorage` va profilga tegadi, ya'ni brauzersiz umuman
 * ishlamaydi. Ikkisi bir faylda turganda sinov skripti "localStorage
 * yo'q" deb yiqilardi.
 */
const maydonKalitim = (): string => {
  const p = joriyProfil();
  return p ? `${MAYDON_KALIT}::${p}` : MAYDON_KALIT;
};

/** Bugun o'ynalgan bo'lsa — natijasi, aks holda `null`. */
export function maydonNatija(): MaydonNatija | null {
  try {
    const xom = localStorage.getItem(maydonKalitim());
    if (!xom) return null;
    const n = JSON.parse(xom) as MaydonNatija;
    return n.kun === kunKaliti() ? n : null;
  } catch {
    return null;
  }
}

/**
 * Natijani yozadi va yozilganini qaytaradi.
 *
 * Bugungisi ALLAQACHON bo'lsa ustiga yozilmaydi — "kuniga bitta
 * urinish" qoidasi shu yerda, saqlash nuqtasida turadi. Ekranda ham
 * tekshiriladi, lekin ekran o'zgarishi mumkin, qoida esa qolishi kerak.
 */
export function maydonYoz(n: Omit<MaydonNatija, "kun">): MaydonNatija {
  const bor = maydonNatija();
  if (bor) return bor;
  const yozuv: MaydonNatija = { ...n, kun: kunKaliti() };
  try {
    localStorage.setItem(maydonKalitim(), JSON.stringify(yozuv));
  } catch {
    /* xotira to'lgan — natija faqat shu ekranda qoladi */
  }
  return yozuv;
}
