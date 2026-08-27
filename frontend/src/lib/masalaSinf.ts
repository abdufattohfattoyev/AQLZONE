/**
 * Masala kimga mo'ljallangan — nomi va ro'yxati.
 *
 * ─────────────── SINFLAR KURSLARDAN YASALADI ───────────────
 *
 * Kod kurslarnikiga MOS (`Course.grade`): 0–11 va 107–110. Alohida
 * ro'yxat yozilmadi — ikkita ro'yxat bir kun kelib albatta
 * bir-biridan qolib ketadi va o'shanda masala hech qaysi filtrga
 * tushmay, ro'yxatdan yo'qolardi.
 *
 * ─────────────── KURSDAN TASHQARI IKKI TOIFA ───────────────
 *
 * Bo'limning eng qimmatli masalalari ko'pincha hech qaysi sinfga
 * to'g'ri kelmaydi:
 *
 *   Kattalar uchun   maktab dasturidan tashqari, yosh chegarasi yo'q
 *   Olimpiada        sinfi bor, lekin darslikda yo'q — hiylali,
 *                    o'ylantiradigan masalalar
 *
 * Usiz ularni yozgan odam "qaysi sinf?" degan savolda to'xtab
 * qolardi va tasodifiy sinfni tanlardi — keyin o'sha masala
 * noto'g'ri filtrda ko'rinardi.
 *
 * Kodlar server bilan bir xil (`core/models.py` dagi
 * `Masala.KATTALAR` va `OLIMPIADA`) va `scripts/masala.ts` shu
 * mosligni tekshiradi.
 */
import { COURSES } from "./curriculum";
import { t } from "./matn";
import { sinfMatn } from "./tarjima/kurs";

/** Kurs dasturidan tashqaridagi toifalar. Server bilan bir xil kod. */
export const KATTALAR = 200;
export const OLIMPIADA = 201;

export interface Toifa {
  kod: number;
  nom: string;
  /** Kurs dasturiga tegishlimi. Ro'yxatda ular ajratib ko'rsatiladi. */
  kursdan: boolean;
}

/**
 * Tanlash uchun butun ro'yxat.
 *
 * Kursdan tashqari toifalar ENG BOSHIDA turadi va bu ataylab: ular
 * o'n oltita sinfning ostida qolsa, ularni faqat oxirigacha surgan
 * odam ko'rardi — ya'ni deyarli hech kim.
 */
export const TOIFALAR: Toifa[] = [
  { kod: KATTALAR, nom: t("masalaKattalar"), kursdan: false },
  { kod: OLIMPIADA, nom: t("masalaOlimpiada"), kursdan: false },
  ...COURSES.map((c) => ({ kod: c.grade, nom: sinfMatn(c.grade), kursdan: true })),
];

/** Faqat sinflar — filtr ro'yxatida ishlatiladi. */
export const SINFLAR = TOIFALAR;

/**
 * Toifa nomi.
 *
 * Noma'lum kod bo'lsa (masalan kurs olib tashlangan) kodning o'zi
 * qaytadi — masala ro'yxatdan yo'qolib qolgandan ko'ra, "107" deb
 * tursa ham ko'ringani yaxshi.
 */
export function sinfNomi(kod: number): string {
  return TOIFALAR.find((s) => s.kod === kod)?.nom ?? String(kod);
}
