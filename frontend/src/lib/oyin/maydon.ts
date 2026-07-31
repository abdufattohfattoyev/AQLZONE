/**
 * BUGUNGI MAYDON — kuniga bir marta, hammaga bir xil.
 *
 * ──────────────────────── NEGA KERAK ────────────────────────
 *
 * O'yinlar bo'limida sakkizta karta yonma-yon turardi va bu ekranning
 * asosiy muammosi edi: sakkizta teng karta — sakkizta qaror. Odam
 * bunday paytda tanlamaydi, chiqib ketadi. Darsda bunday muammo yo'q,
 * chunki u yerda bitta yashil "Davom etish" bor.
 *
 * Ikkinchi teshik: hech bir o'yin BUGUN boshqacha emas. Ertaga ham
 * xuddi shu sakkizta karta turadi, ya'ni "bugun kirishim uchun sabab"
 * yo'q. Rekord esa faqat qurilmada yotadi — uni hech kim ko'rmaydi.
 *
 * Maydon ikkalasini ham yopadi: bitta katta tugma, har kuni yangi
 * uchta bosqich va yarim tunda yopiladigan muddat.
 *
 * ─────────────── HAMMAGA BIR XIL SAVOL: NEGA MUHIM ───────────────
 *
 * Savollar KUN URUG'idan yasaladi (`urug.ts`), ya'ni Toshkentdagi bola
 * va Buxorodagi bola bir xil misolni ko'radi. Busiz jadval hech
 * narsani o'lchamasdi: yuqorida turgan odam yaxshi o'ynadimi yoki unga
 * oson savol tushdimi — buni hech kim ayta olmasdi. "Menga qiyini
 * chiqdi" degan e'tiroz esa bunday o'yinni birinchi haftada o'ldiradi.
 *
 * ──────────────────── UCHTA QAT'IY QOIDA ────────────────────
 *
 *   1. **Uch bosqich, oltita emas.** Maydon 3–4 daqiqada tugashi
 *      kerak. Har kuni qaytariladigan narsa QISQA bo'lmasa, u
 *      "keyinroq" ga suriladi va keyinroq hech qachon kelmaydi.
 *
 *   2. **Kuniga bitta urinish.** Ikki marta o'ynash mumkin bo'lsa,
 *      odam eng yaxshi natijasini qoldirish uchun o'n marta o'ynaydi
 *      va ball o'z ma'nosini yo'qotadi. Mashq qilmoqchi bo'lgan odam
 *      pastdagi "Mashq" bo'limida cheksiz o'ynaydi.
 *
 *   3. **Daraja o'zgarmaydi.** Maydon bosqichlari har doim IKKINCHI
 *      darajada. Aks holda oson darajada o'ynagan odam jadval boshiga
 *      chiqib olardi. Mashqda esa uchala daraja ochiq turaveradi.
 *
 * ──────────────────── ZANJIRGA TEGMAYDI ────────────────────
 *
 * Maydon kunlik zanjirni SURMAYDI (o'ynalgan savollar kunlik maqsadga
 * qo'shiladi, lekin zanjir darsdan yuradi). Sabab kunlik sinovdagi
 * bilan bir xil: maydon — qo'shimcha, majburiyat emas. Uni o'tkazib
 * yuborgan bola "yo'qotdim" emas, "bonus olmadim" deb his qilsin.
 */
import { OYINLAR } from "./index";
import { kunUrugi, urugBilan } from "./urug";
import { kunKaliti } from "../zanjir";
import type { Daraja, Oyin, OqimSavol } from "./tur";

/** Nechta bosqich. */
export const BOSQICH = 3;

/** Har bosqichda nechta savol tayyorlanadi (vaqt yetmasa hammasi ishlatilmaydi). */
const SAVOL_ZAXIRA = 40;

/** Maydon qaysi darajada o'ynaladi. */
export const MAYDON_DARAJA: Daraja = 2;

/** Har bosqichga necha soniya. */
export const BOSQICH_VAQT = 45;

/** Bitta bosqich: qaysi o'yin va uning tayyor savollari. */
export interface Bosqich {
  oyin: Oyin;
  savollar: OqimSavol[];
}

/** Kunlik natija — qurilmada saqlanadi va serverga yuboriladi. */
export interface MaydonNatija {
  kun: string;
  ball: number;
  savollar: number;
  /** Har bosqichdagi ball — yakun ekranida ko'rsatiladi. */
  bosqichlar: number[];
}

/**
 * Bugun qaysi uchta o'yin tushadi.
 *
 * FAQAT "oqim" turidagi o'yinlar olinadi. "24" va "Sonlar xotirasi"
 * o'z taxtasiga ega va ular boshqacha o'lchanadi (pog'ona, urinish) —
 * ularni bitta ball jadvaliga qo'shish uchun har biriga alohida
 * koeffitsiyent o'ylab topish kerak bo'lardi, va o'sha koeffitsiyent
 * har doim adolatsiz ko'rinardi.
 *
 * Tanlash TAKRORLANMAYDI: bir kunda bitta o'yin ikki marta tushmaydi.
 */
export function bugungiOyinlar(kun = kunKaliti()): Oyin[] {
  const nomzod = OYINLAR.filter((o) => o.tur === "oqim" && o.gen);
  const tanlangan: Oyin[] = [];
  const qolgan = [...nomzod];

  for (let i = 0; i < BOSQICH && qolgan.length; i++) {
    // Har bosqich uchun ALOHIDA urug': bitta urug'dan uchta son
    // olsak, ketma-ket kunlarda ro'yxat siljib takrorlanardi.
    const u = kunUrugi(kun, 100 + i);
    tanlangan.push(...qolgan.splice(u % qolgan.length, 1));
  }
  return tanlangan;
}

/**
 * Bugungi bosqichlar — savollari bilan.
 *
 * Savollar OLDINDAN yasaladi: o'yin paytida yasalsa, urug' qobig'i
 * (`urugBilan`) o'yin davomida ochiq turishi kerak bo'lardi va
 * animatsiyalardagi tasodifiylik ham unga tushib qolardi.
 *
 * ────────────────── TAKROR: NEGA BUTUNLAY TAQIQLANMAGAN ──────────────────
 *
 * Avval takrorlanmagan savollar yig'iladi. Lekin ba'zi o'yinlarda
 * savollar soni CHEKLI: ko'paytirish jadvalining ikkinchi darajasida
 * jami bir necha o'nlab misol bor, ya'ni 40 ta har xil savol jismonan
 * chiqmaydi.
 *
 * Bunday paytda ro'yxat o'sha yig'ilganlaridan TO'LDIRILADI. Muqobili
 * yomonroq bo'lardi: ro'yxat qisqa qolsa, tez o'ynagan bola uni
 * tugatib qo'yardi va bosqich vaqti tugamasdan yopilardi — ya'ni
 * yaxshi o'ynagani uchun KAMROQ savol olardi.
 *
 * To'ldirish aylanma tartibda ketadi (0, 1, 2, …), shuning uchun
 * takror faqat ro'yxat oxirida va yonma-yon emas.
 */
export function bugungiBosqichlar(kun = kunKaliti()): Bosqich[] {
  return bugungiOyinlar(kun).map((oyin, i) => {
    const savollar = urugBilan(kunUrugi(kun, i), () => {
      const chiqqan = new Set<string>();
      const ro: OqimSavol[] = [];
      // Urinish soni zaxiradan ko'p: ba'zi o'yinlarda savol turi kam
      // va takrorsiz to'plash uchun bir necha marta urinish kerak.
      for (let k = 0; k < SAVOL_ZAXIRA * 6 && ro.length < SAVOL_ZAXIRA; k++) {
        const s = oyin.gen!(MAYDON_DARAJA);
        const kalit = `${s.matn}|${s.ost ?? ""}|${s.javob}`;
        if (chiqqan.has(kalit)) continue;
        chiqqan.add(kalit);
        ro.push(s);
      }
      // Yetmagani aylantirib to'ldiriladi.
      const xilma = ro.length;
      for (let k = 0; ro.length < SAVOL_ZAXIRA && xilma; k++) ro.push(ro[k % xilma]);
      return ro;
    });
    return { oyin, savollar };
  });
}

/**
 * Yarim tungacha necha soat qoldi.
 *
 * Kunlik sinovdagi bilan bir xil hisob: muddat ko'rsatilmasa, taklif
 * "keyinroq" degan javobni oladi.
 */
export function qolganSoat(): number {
  const hozir = new Date();
  const yarimTun = new Date(hozir);
  yarimTun.setHours(24, 0, 0, 0);
  return Math.max(1, Math.round((yarimTun.getTime() - hozir.getTime()) / 3600000));
}
