/**
 * RANG — bo'yalgan shar.
 *
 * ─────────── NEGA NARSA EMAS, SHAR ───────────
 *
 * Rangni rasm bilan ko'rsatib bo'lmaydi. "Qizil mashina" bolaga
 * MASHINAni ko'rsatadi, rangni emas: u "qizil" degan so'zni
 * g'ildirak bilan ham, kuzov shakli bilan ham bog'lab qo'yishi
 * mumkin. Shuning uchun bu yerda hech qanday narsa yo'q — faqat
 * rangning o'zi.
 *
 * ─────────── NEGA TEKIS DOIRA EMAS ───────────
 *
 * Ilgari bu yerda `border-radius: 50%` qo'yilgan oddiy `<span>`
 * turardi. U ishlardi-yu, albomning qolgan qismi bilan bir oilada
 * emasdi: yonidagi kartalarda haqiqiy suratlar — hajmli, soyali,
 * yorug'i tushgan narsalar. Ularning orasida tekis doira ilovaning
 * "hali bitmagan" joyiga o'xshab ko'rinardi.
 *
 * Endi u SHAR: yuqori chap tomondan yorug'lik tushadi, pastki o'ng
 * tomoni to'qlashadi, ostida yumshoq soya bor. Rangning o'zi
 * o'zgarmaydi — o'sha `hex`, faqat ustiga oq va qora pardalar
 * qo'yiladi. Shu sabab to'qqizta rang uchun to'qqizta qiymat
 * hisoblash kerak emas va "qizil" hamma joyda AYNAN bir xil qizil
 * bo'lib qoladi (`lib/activity.ts` bilan bir xil).
 */
import { useId } from "react";
import type { CSSProperties, JSX } from "react";

export function ChizmaRang({ hex, className = "", style }: {
  hex: string;
  className?: string;
  /** Joylashuvni tashqaridan berish uchun — kirish ekranida uchta
   *  shar uchburchak bo'lib teriladi (`screens/Kichkintoy.tsx`). */
  style?: CSSProperties;
}): JSX.Element {
  // `useId` — sahifada bir vaqtda to'qqizta shar turishi mumkin
  // (o'yindagi variantlar, kirish ekranidagi ishoralar). Qat'iy nom
  // yozilsa, brauzer hammasini birinchisiga bog'lardi va u ekrandan
  // ketishi bilan qolganlari bo'yog'ini yo'qotardi.
  const uid = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Yorug'lik — yuqori chapdan. Ko'z buni tug'ilganidan biladi:
            dunyoda yorug'lik tepadan tushadi. */}
        <radialGradient id={`${uid}-yorug`} cx="0.34" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.42" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        {/* Qarama-qarshi tomondagi to'qlik — sharning yumaloqligi
            aynan shundan bilinadi. */}
        <radialGradient id={`${uid}-toq`} cx="0.6" cy="0.7" r="0.66">
          <stop offset="0.4" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </radialGradient>

        <radialGradient id={`${uid}-soya`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.65" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="60" cy="108" rx="37" ry="6.6" fill={`url(#${uid}-soya)`} />

      <circle cx="60" cy="58" r="46" fill={hex} />
      <circle cx="60" cy="58" r="46" fill={`url(#${uid}-toq)`} />
      <circle cx="60" cy="58" r="46" fill={`url(#${uid}-yorug)`} />

      {/* Aniq nur dog'i. Usiz shar yumaloq bo'ladi-yu, YALTIROQ
          bo'lmaydi — bolaga esa aynan yaltiroq narsa qiziq. */}
      <ellipse cx="43" cy="39" rx="12.5" ry="8.4" transform="rotate(-26 43 39)"
        fill="#fff" opacity="0.48" />

      {/* Ingichka to'q chekka — qora shar oq kartada, oq shar (agar
          qo'shilsa) hech qanday fonda yo'qolib ketmasin. */}
      <circle cx="60" cy="58" r="45.2" fill="none" stroke="#000"
        strokeOpacity="0.14" strokeWidth="1.6" />
    </svg>
  );
}
