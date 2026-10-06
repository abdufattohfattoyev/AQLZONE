/**
 * MOSLASHUV — "Siz kimsiz" javobidan butun ilova nima oladi.
 *
 * ─────────────────────── NEGA BITTA FAYL ───────────────────────
 *
 * Anketa javobi (`lib/profil.ts`) ilgari har ekranda o'zicha o'qilardi:
 * darslar sinfni bilardi, duel darajani bilardi, bosh sahifadagi
 * bo'limlar esa hech narsani bilmasdi — 2-sinf bolasiga DTM va milliy
 * sertifikat ko'rsatilardi, o'yinlarda 11-sinf o'quvchisi ham
 * "6 + 5" dan boshlardi. Har ekran o'z qoidasini yozsa, ular albatta
 * bir-biridan ajralib ketadi ("4-sinf" bir joyda boshlang'ich, boshqa
 * joyda o'rta bo'lib qoladi).
 *
 * Endi qoida BITTA: profildan GURUH chiqadi va hamma ekran shu
 * guruhdan o'qiydi. Yangi ekran qo'shilsa, shu yerdagi funksiyalardan
 * birini chaqiradi — o'z "agar sinf 5 dan kichik bo'lsa" sini yozmaydi.
 *
 *   guruh           kim
 *   ─────────────   ───────────────────────────────────────────────
 *   maktabgacha     ota-ona, farzandi maktabgacha
 *   boshlangich     1–4-sinf o'quvchisi yoki ota-onasi; boshlang'ich
 *                   sinf o'qituvchisi bo'ladigan talaba
 *   orta            5–9-sinf
 *   yuqori          10–11-sinf
 *   abituriyent     DTM ga tayyorlanuvchi
 *   talaba          OTM talabasi (pedagogikadan tashqari)
 *   ustoz           o'qituvchi (maktab / OTM / o'quv markazi)
 *   kattalar        "boshqa" yoki anketa hali to'ldirilmagan
 *
 * `scripts/moslash.ts` har bir anketa javobi uchun natijani sinaydi.
 */
import type { Daraja } from "./oyin/tur";
import { BOSQICH, pedagogmi, sinfOfProfil, yolOf } from "./profil";
import type { Profil } from "./profil";

export type Guruh =
  | "maktabgacha" | "boshlangich" | "orta" | "yuqori"
  | "abituriyent" | "talaba" | "ustoz" | "kattalar";

export function guruhOf(p: Profil | null): Guruh {
  if (!p) return "kattalar";
  if (pedagogmi(p)) return "boshlangich";
  const s = sinfOfProfil(p);
  if (s !== null) return s === 0 ? "maktabgacha" : s <= 4 ? "boshlangich" : s <= 9 ? "orta" : "yuqori";
  if (p.kim === "abiturient") return "abituriyent";
  if (p.kim === "talaba") return "talaba";
  if (p.kim === "ustoz") return "ustoz";
  return "kattalar";
}

/**
 * O'yinlardagi boshlang'ich daraja (1 — oson, 3 — qiyin).
 *
 * Uch daraja uch xil matematika (`lib/oyin/savollar.ts`): 1 — 100 ichida
 * amallar, 2 — ko'paytirish va katta sonlar, 3 — foiz, daraja, tenglama.
 * 1–4-sinf bolasini 3-darajaga qo'yish uni birinchi o'yindayoq
 * yiqitardi, 11-sinf o'quvchisini 1-darajaga qo'yish esa zeriktirardi.
 *
 * Bu faqat BOSHLANISH: bola darajani o'zi almashtira oladi va tanlovi
 * eslab qolinadi — moslashuv uning tanlovidan ustun turmaydi.
 */
export function oyinDarajasi(p: Profil | null): Daraja {
  switch (guruhOf(p)) {
    case "maktabgacha":
    case "boshlangich": return 1;
    case "orta": return 2;
    default: return p ? 3 : 2;
  }
}

/** Bosh sahifadagi bo'lim kartalari (`screens/Bosh.tsx`). */
export type Bolim =
  | "darslar" | "mantiq" | "qabul" | "oyinlar" | "masalalar"
  | "dtm" | "sertifikat" | "formulalar" | "sessiya";

/**
 * Qaysi bo'limlar va QAYSI TARTIBDA ko'rsatiladi.
 *
 * Ro'yxatda yo'q bo'lim YO'QOLMAYDI — u pastki paneldan (O'qish, O'yin,
 * Masalalar) baribir ochiladi. Bosh sahifa esa "sizga nima kerak"
 * degan savolga javob beradi, shuning uchun 2-sinf bolasi u yerda
 * DTMni ko'rmaydi, abituriyent esa Prezident maktabini.
 *
 * Tartib — eng kerakli birinchi. Har guruhda 4–8 ta: kam bo'lsa ekran
 * bo'sh ko'rinadi, ko'p bo'lsa — yana "hammasi hammaga" bo'lib qoladi.
 */
export function bolimlar(p: Profil | null): Bolim[] {
  const s = sinfOfProfil(p);
  switch (guruhOf(p)) {
    case "maktabgacha":
      return ["darslar", "oyinlar", "masalalar", "mantiq"];
    case "boshlangich":
      // Prezident maktabiga 4-sinfdan keyin kiriladi — 2-sinfga hali erta.
      return s !== null && s < 3
        ? ["darslar", "mantiq", "oyinlar", "masalalar"]
        : ["qabul", "mantiq", "darslar", "oyinlar", "masalalar"];
    case "orta":
      // 9-sinf — milliy sertifikat va DTM bo'sag'asi.
      return s === 9
        ? ["darslar", "sertifikat", "dtm", "formulalar", "masalalar", "oyinlar"]
        : ["darslar", "masalalar", "formulalar", "oyinlar"];
    case "yuqori":
      return ["dtm", "sertifikat", "darslar", "formulalar", "masalalar", "oyinlar"];
    case "abituriyent":
      return ["dtm", "sertifikat", "formulalar", "masalalar", "darslar", "oyinlar"];
    case "talaba":
      return ["sessiya", "darslar", "formulalar", "masalalar", "oyinlar", "dtm"];
    case "ustoz":
      return p?.bosqich === BOSQICH.ustozOtm
        ? ["sessiya", "darslar", "formulalar", "masalalar", "dtm", "oyinlar"]
        : ["darslar", "masalalar", "dtm", "sertifikat", "qabul", "mantiq", "formulalar", "oyinlar"];
    default:
      return yolOf(p) === "oliy"
        ? ["sessiya", "formulalar", "masalalar", "darslar", "dtm", "oyinlar"]
        : ["darslar", "dtm", "sertifikat", "masalalar", "oyinlar", "formulalar", "qabul", "mantiq"];
  }
}

/**
 * Formulalar varaqasi qaysi sinfdan ochilsin (5–11). Formulalar 5-sinfdan
 * boshlanadi, shuning uchun undan kichik sinf yoki sinfsiz odam uchun
 * 11-sinf (to'liq varaq) — avvalgi xatti-harakat.
 */
export function formulaSinfi(p: Profil | null): number {
  const s = sinfOfProfil(p);
  return s !== null && s >= 5 ? s : 11;
}
