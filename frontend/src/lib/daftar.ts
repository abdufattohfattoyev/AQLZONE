/**
 * Xatolar daftari — oraliqli takrorlash.
 *
 * Muammo: hozirgacha bola xato qilsa, xato shunchaki yo'qolardi. Holbuki
 * aynan xato — eng qimmatli ma'lumot. U bolaning nimani BILMASLIGINI
 * ko'rsatadi va o'qituvchi ham birinchi navbatda shuni takrorlatadi.
 *
 * Bu yerda saqlanadigan narsa savolning O'ZI emas, uning MANZILI:
 * qaysi kurs, qaysi bob, qaysi dars va qanday turdagi savol edi.
 * Sabab: savollar har safar qaytadan yasaladi. Eski savolni saqlab
 * qo'ysak, bola javobni yodlab olardi. Manzilni saqlasak esa, takrorlashda
 * xuddi shu turdagi YANGI savol chiqadi — bu bilimni tekshiradi, xotirani
 * emas.
 *
 * Takrorlash oralig'i (kunlarda) — sinovdan o'tgan oddiy narvon:
 *
 *     xato qildi        →  1 kundan keyin
 *     takrorlab yechdi  →  3 kundan keyin
 *     yana yechdi       →  7 kundan keyin
 *     yana yechdi       →  daftardan chiqadi
 *
 * Takrorlashda yana xato qilsa — narvon boshiga qaytadi.
 */
import type { ActivityType } from "./activity";
import { joriyProfil } from "./api";

/** Serverga ham boradigan kalit (`azapp` bilan boshlanishi shart). */
const KALIT = "azapp_daftar_v1";

/**
 * Daftar ham profilga tegishli: bir telefonda ikki farzand o'ynasa,
 * birining xatolari ikkinchisiga takrorlash bo'lib chiqmasligi kerak.
 */
const kalitim = (): string => {
  const p = joriyProfil();
  return p ? `${KALIT}::${p}` : KALIT;
};

/** Narvon: bosqichdan keyin necha kundan so'ng qaytadi. */
const NARVON = [1, 3, 7];

export interface Yozuv {
  /** Kurs slug'i: "1-sinf" */
  kurs: string;
  /** Bob va dars indekslari. */
  ui: number;
  li: number;
  /** Savol turi — takrorlashda xuddi shunday savol tanlanadi. */
  tur: ActivityType;
  /** Jami necha marta xato qilingan — ota-ona panelida ko'rsatiladi. */
  xato: number;
  /** Narvonning qaysi pog'onasi. */
  bosqich: number;
  /** Qachon qaytishi ("2026-07-28"). */
  keyingi: string;
}

export type Daftar = Record<string, Yozuv>;

const kalit = (y: Pick<Yozuv, "kurs" | "ui" | "li" | "tur">) =>
  `${y.kurs}:${y.ui}:${y.li}:${y.tur}`;

/** Mahalliy sana — UTC emas (`progress.tsx` dagi bilan bir xil sabab). */
function kun(qoshimcha = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + qoshimcha);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function oqi(): Daftar {
  try {
    const xom = localStorage.getItem(kalitim());
    if (!xom) return {};
    const d = JSON.parse(xom);
    return d && typeof d === "object" ? (d as Daftar) : {};
  } catch {
    return {};
  }
}

function yoz(d: Daftar): void {
  try {
    localStorage.setItem(kalitim(), JSON.stringify(d));
  } catch {
    /* xotira to'lgan — daftar ikkinchi darajali, ilova ishlayversin */
  }
}

/** Bola xato qildi: yozuvni qo'shamiz yoki narvon boshiga qaytaramiz. */
export function xatoQoshildi(joy: Pick<Yozuv, "kurs" | "ui" | "li" | "tur">): void {
  const d = oqi();
  const k = kalit(joy);
  const eski = d[k];
  d[k] = {
    ...joy,
    xato: (eski?.xato ?? 0) + 1,
    bosqich: 0,
    keyingi: kun(NARVON[0]),
  };
  yoz(d);
}

/**
 * Takrorlashda to'g'ri yechdi — narvondan bir pog'ona yuqoriga.
 * Oxirgi pog'onadan o'tsa, yozuv daftardan butunlay chiqadi.
 */
export function takrorlandi(joy: Pick<Yozuv, "kurs" | "ui" | "li" | "tur">, togri: boolean): void {
  const d = oqi();
  const k = kalit(joy);
  const y = d[k];
  if (!y) return;

  if (!togri) {
    d[k] = { ...y, xato: y.xato + 1, bosqich: 0, keyingi: kun(NARVON[0]) };
  } else if (y.bosqich + 1 >= NARVON.length) {
    delete d[k];                       // o'rganildi
  } else {
    const b = y.bosqich + 1;
    d[k] = { ...y, bosqich: b, keyingi: kun(NARVON[b]) };
  }
  yoz(d);
}

/** Bugun takrorlash vaqti kelgan yozuvlar. */
export function bugungilar(kurs?: string): Yozuv[] {
  const bugun = kun();
  return Object.values(oqi())
    .filter((y) => (kurs ? y.kurs === kurs : true) && y.keyingi <= bugun)
    // Ko'p xato qilingani birinchi kelsin — eng og'rigan joy oldin.
    .sort((a, b) => b.xato - a.xato);
}

/** Daftardagi barcha yozuvlar (ota-ona paneli uchun). */
export const hammasi = (): Yozuv[] =>
  Object.values(oqi()).sort((a, b) => b.xato - a.xato);
