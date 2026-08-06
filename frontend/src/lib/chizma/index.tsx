/**
 * CHIZMALAR — kartaning id'si bo'yicha rasm.
 *
 * Bitta joyda turadi, chunki rasm uch joyda kerak: albom sahnasida,
 * o'yin variantlarida va mavzu kartasida. Uch joyga uch xil yo'l bilan
 * olinsa, ulardan biri albatta yangi rasmni unutgan bo'lardi.
 *
 * Rasm topilmasa `null` qaytadi va chaqiruvchi emoji zaxirasiga
 * tushadi (`components/KichkintoyKarta.tsx`). Ya'ni yangi karta
 * qo'shilganda ilova buzilmaydi — rasmi yasalgunicha u emoji bilan
 * ishlab turadi.
 */
import { useId } from "react";
import type { JSX } from "react";

import { Boyoqlar } from "./ramka";
import type { ChizmaId } from "./idlar";
import {
  ChizmaAvtobus, ChizmaKema, ChizmaMashina, ChizmaOtOchir, ChizmaPolitsiya,
  ChizmaPoyezd, ChizmaSamolyot, ChizmaTaksi, ChizmaTezYordam, ChizmaTraktor,
  ChizmaVelosiped, ChizmaYuk,
} from "./mashina";
import {
  ChizmaArslon, ChizmaAsalari, ChizmaAyiq, ChizmaBaqa, ChizmaFil, ChizmaIt,
  ChizmaMushuk, ChizmaOrdak, ChizmaOt, ChizmaQoy, ChizmaQuyon, ChizmaSigir,
  ChizmaTovuq, ChizmaXoroz,
} from "./hayvon";

/**
 * Kalit — `lib/kichkintoy.ts` dagi karta `id` si.
 *
 * Tur `Record<ChizmaId, …>` va bu ATAYLAB: ro'yxatga (`idlar.ts`) id
 * qo'shib, rasmini bu yerga yozishni unutsangiz, loyiha YIG'ILMAYDI.
 * Aks holda karta jimgina emoji ko'rinishiga tushib qolardi — ilova
 * ishlayveradi va buni hech kim sezmasdi.
 */
const CHIZMALAR: Record<ChizmaId, () => JSX.Element> = {
  // mashinalar
  mashina: ChizmaMashina,
  avtobus: ChizmaAvtobus,
  taksi: ChizmaTaksi,
  yuk: ChizmaYuk,
  otochir: ChizmaOtOchir,
  tezyordam: ChizmaTezYordam,
  politsiya: ChizmaPolitsiya,
  traktor: ChizmaTraktor,
  velosiped: ChizmaVelosiped,
  poyezd: ChizmaPoyezd,
  samolyot: ChizmaSamolyot,
  kema: ChizmaKema,

  // hayvonlar
  it: ChizmaIt,
  mushuk: ChizmaMushuk,
  sigir: ChizmaSigir,
  qoy: ChizmaQoy,
  ot: ChizmaOt,
  tovuq: ChizmaTovuq,
  xoroz: ChizmaXoroz,
  ordak: ChizmaOrdak,
  quyon: ChizmaQuyon,
  baqa: ChizmaBaqa,
  ayiq: ChizmaAyiq,
  arslon: ChizmaArslon,
  fil: ChizmaFil,
  asalari: ChizmaAsalari,
};

export { CHIZMA_IDLAR, chizmaBormi } from "./idlar";

/**
 * Sanaladigan narsa — raqam kartasidagi olma.
 *
 * Emoji EMAS va bu ataylab: raqam kartasida to'qqiztagacha olma
 * yonma-yon turadi. Emoji har platformada boshqa o'lchamda chizilgani
 * uchun qator gah siqilib, gah yoyilib ketardi — bola esa aynan shu
 * qatorni SANAYDI. Chizma esa hamma joyda bir xil kenglikda turadi.
 *
 * Ataylab SODDA: bola uni sanashi kerak, tomosha qilishi emas.
 * Tafsilot ko'p bo'lsa, ko'z bitta olmada ushlanib qoladi.
 */
export function ChizmaOlma({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg">
      <path d="M12 7c2-2 6-2 8 1s1 9-2 12c-1.6 1.6-3 1-4 1s-2.4.6-4-1c-3-3-4-9-2-12s6-3 4-1z"
        fill="#ee4a41" />
      <path d="M12 7c1.4-1.4 4-1.8 6-.4-2 .4-3.6 1.6-4.6 3z" fill="#ff7a6b" />
      <path d="M12 7V4" stroke="#7a5230" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12.4 4.6c1.4-2 3.4-2.2 4.6-1.6-.6 2-2.4 3-4.6 3z" fill="#3fb865" />
    </svg>
  );
}

/**
 * KADRNI TO'LDIRISH.
 *
 * Hamma chizma bitta 120×120 to'rda, lekin narsalarning o'zi turli
 * o'lchamda: avtobus butun kenglikni egallaydi, yengil avtomobil esa
 * o'rtada kichkina turadi. Kartada bu darrov ko'rinadi — bittasi
 * "katta", ikkinchisi "yo'qolgan" bo'lib chiqadi.
 *
 * Shuning uchun har biriga kattalashtirish koeffitsienti berilgan.
 * Alohida jadval bo'lib turadi, chizmalarning ichida emas: shunda
 * hammasini YONMA-YON ko'rib, bir-biriga solishtirib sozlash mumkin.
 * Ro'yxatda yo'q chizma 1 bilan chiziladi.
 *
 * Diqqat: bu VIZUAL sozlash, chizmaning o'zi o'zgarmaydi. Ya'ni
 * rasmni qayta chizmasdan, faqat shu yerdagi sonni o'zgartirib
 * kadrni to'g'rilash mumkin.
 */
const KATTALIK: Partial<Record<ChizmaId, number>> = {
  // Yengil avtomobillar past va tor — eng ko'p kattalashtirish shularda.
  mashina: 1.3, taksi: 1.3, politsiya: 1.3,
  avtobus: 1.12, yuk: 1.12, otochir: 1.14, tezyordam: 1.14,
  traktor: 1.16, velosiped: 1.16, poyezd: 1.06,
  samolyot: 1.24, kema: 1.12,

  // Hayvonlar boshdan iborat va allaqachon to'rni to'ldiradi;
  // faqat bir nechtasi kichikroq chiqadi.
  ot: 1.08, asalari: 1.08, quyon: 1.04, baqa: 1.04,
};

/**
 * Bitta rasm.
 *
 * `viewBox` hamma chizmada bir xil (120×120) va `width`/`height`
 * berilmaydi: o'lchamni CSS boshqaradi. Shu sabab bitta rasm albomda
 * 168px, o'yinda 86px bo'lib, ikkalasida ham bir xil aniqlikda
 * chiziladi — u vektor.
 */
export function Chizma({ id, className = "" }: { id: string; className?: string }) {
  // Hooklar shartdan OLDIN chaqiriladi — aks holda noma'lum id
  // kelganda hooklar tartibi buzilardi.
  const uid = useId().replace(/:/g, "");
  const C = CHIZMALAR[id as ChizmaId];
  if (!C) return null;

  const k = KATTALIK[id as ChizmaId] ?? 1;
  // Markaz 60×62: chizmalarning og'irlik markazi geometrik markazdan
  // biroz PASTDA (tepada quloq va mo'ri uchun bo'shliq qoldirilgan).
  // 60×60 dan kattalashtirilsa, narsalar tepaga siljib ketardi.
  const kadr = k === 1 ? undefined : `translate(60 62) scale(${k}) translate(-60 -62)`;

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg">
      <Boyoqlar uid={uid}>
        {kadr ? <g transform={kadr}><C /></g> : <C />}
      </Boyoqlar>
    </svg>
  );
}
