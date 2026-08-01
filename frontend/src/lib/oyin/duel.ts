/**
 * Duel qoidalari — savol yasash va raqib chizig'i.
 *
 * Bu fayl SOF: server bilan gaplashmaydi (u `lib/api.ts` da) va React'ni
 * bilmaydi. Shu sabab uni brauzersiz sinash mumkin
 * (`scripts/duel.ts`) — va aynan shu yerda sinov eng kerak, chunki
 * "ikkala o'yinchi bir xil savolni oladi" degan va'da butun
 * bellashuvning asosi.
 */
import { oyinById } from "./index";
import { urugBilan } from "./urug";
import type { Daraja, OqimSavol } from "./tur";

/** Standart davomiylik — chaqiruvda vaqt ko'rsatilmagan bo'lsa. */
export const DUEL_VAQT = 60;

/** Standart savol soni — shart berilmaganda. */
const ZAXIRA = 60;

/** Tanlash mumkin bo'lgan qiymatlar (server bilan bir xil). */
export const DUEL_SAVOLLAR = [10, 20, 30] as const;
export const DUEL_VAQTLAR = [30, 60, 90] as const;

/**
 * Sanoq massivining eng katta uzunligi.
 *
 * Chegara ENG UZUN dueldan HISOBLANADI, standartdan emas: 90 soniyalik
 * duelda `DUEL_VAQT` (60) bilan chegaralansak, oxirgi o'ttiz soniya
 * yozilmay qolardi va raqibning chizig'i yarim yo'lda muzlab turardi.
 * Qo'lda yozilgan 90 ham xavfli edi — ro'yxatga to'rtinchi qiymat
 * qo'shilsa, u yerda unutilardi. Server ham shu chegarani tekshiradi
 * (`duel.MAX_VAQT`).
 */
const ENG_UZUN = Math.max(...DUEL_VAQTLAR);

/**
 * Urug'dan savollar yasaydi.
 *
 * Maydondagi (`maydon.ts`) bilan bir xil usul: takrorlanmaganlari
 * yig'iladi, yetmasa ro'yxat aylantirib to'ldiriladi. Ikkinchisi shart —
 * ba'zi o'yinlarda savol turi chekli va ro'yxat qisqa qolsa, tez
 * o'ynagan o'yinchi uni tugatib qo'yardi, ya'ni yaxshi o'ynagani uchun
 * KAMROQ savol olardi.
 */
export function duelSavollari(
  urug: number, oyinId: string, daraja: Daraja, soni = ZAXIRA,
): OqimSavol[] {
  const oyin = oyinById(oyinId);
  if (!oyin?.gen) return [];

  return urugBilan(urug, () => {
    const chiqqan = new Set<string>();
    const ro: OqimSavol[] = [];
    for (let k = 0; k < soni * 6 && ro.length < soni; k++) {
      const s = oyin.gen!(daraja);
      const kalit = `${s.matn}|${s.ost ?? ""}|${s.javob}`;
      if (chiqqan.has(kalit)) continue;
      chiqqan.add(kalit);
      ro.push(s);
    }
    const xilma = ro.length;
    for (let k = 0; ro.length < soni && xilma; k++) ro.push(ro[k % xilma]);
    return ro;
  });
}

/**
 * Raqibning shu soniyadagi bali.
 *
 * `sanoq[i]` — o'yinning `i`-soniyasidagi ball. Oraliqdagi qiymat
 * kerak bo'lsa oxirgi ma'lum son olinadi (sakrash yo'q).
 *
 * Sanoq kalta bo'lishi mumkin: raqib o'yinni erta tugatgan yoki
 * yozuv to'liq kelmagan bo'lsa — o'shanda oxirgi qiymat qoladi.
 */
export function raqibBali(sanoq: number[], otganSoniya: number): number {
  if (!sanoq.length) return 0;
  const i = Math.max(0, Math.min(sanoq.length - 1, Math.floor(otganSoniya)));
  return sanoq[i] ?? 0;
}

/**
 * O'z sanog'ini yozib boradi.
 *
 * Har soniyada bitta son — duel uzunligicha kichik son. Bu keyin RAQIB uchun
 * chiziq bo'ladi, ya'ni duelning "jonli" hissi shu massivdan chiqadi.
 *
 * Yozuv soniyaning INDEKSI bo'yicha ketadi va oraliqlar to'ldiriladi:
 * o'yinchi 5 soniya javob bermasa ham chiziq uzilmasligi kerak.
 */
export function sanoqniYoz(sanoq: number[], otganSoniya: number, ball: number): void {
  const i = Math.max(0, Math.min(ENG_UZUN, Math.floor(otganSoniya)));
  const oxirgi = sanoq.length ? sanoq[sanoq.length - 1] : 0;
  while (sanoq.length < i) sanoq.push(oxirgi);
  sanoq[i] = ball;
}
