/**
 * Pastki panelning belgilari — hajmli (3D) va harakatli.
 *
 * NEGA `lib/icons.tsx` DAN AJRALDI.  U yerdagi belgilar bir tilda
 * gapiradi: 24×24 to'r, faqat chiziq, qalinligi 2.4, rangi
 * `currentColor`. Ular ro'yxatlarda, tugmalarda, sarlavhalarda —
 * yuzlab joyda turadi va aynan bir xilligi ularni tinch qiladi.
 *
 * Panel esa BOSHQA ish qiladi. Unda atigi beshta belgi bor, ular
 * ekranning eng pastida, hamma sahifada, doim turadi va bola ularni
 * YOZUVDAN OLDIN taniydi. Bu yerda bir xillik emas, AJRALIB TURISH
 * kerak: har tugma o'z rangi va o'z shakli bilan esda qoladi
 * ("uy — yashil", "xarita — ko'k"). Shuning uchun bular to'ldirilgan,
 * gradientli, yumshoq yorug'likli — bolalar ilovalari tilida.
 *
 * HAJM QAYERDAN KELADI.  Uch qatlam, uchalasi ham arzon:
 *
 *   1. Gradient — tepasi yorug', pastki chekkasi quyuq. Shu bitta
 *      narsa shaklni "yassi rang" bo'lishdan chiqaradi.
 *   2. Ichki oq yoritma (`--az-yaltir`) — yuqori chetdagi ingichka
 *      yorug'lik, ya'ni "yuza silliq" degan ishora.
 *   3. Tashqi yumshoq nur (`drop-shadow`) — belgi panel yuzasidan
 *      bir barmoq ko'tarilgandek turadi.
 *
 * Rasm EMAS, SVG. PNG bilan uchta muammo bo'lardi: temaga moslashmaydi
 * (tungi temada oq hoshiya qoladi), harakatlanmaydi va beshta fayl
 * yuklanguncha panel bo'sh turadi.
 *
 * HARAKAT FAQAT FAOL TUGMADA va faqat BIR MARTA. Doim aylanadigan
 * belgi — bu ekranning pastidagi doimiy chalg'ituvchi; bola darsni
 * emas, o'sha sakrayotgan narsani kuzatadi. Shuning uchun animatsiya
 * tugma FAOL BO'LGAN PAYTDA bir marta o'ynaydi va to'xtaydi. Harakat
 * kamaytirilgan bo'lsa (`prefers-reduced-motion`) umuman bo'lmaydi —
 * uni `index.css` hal qiladi.
 */
import { useId, type ReactElement } from "react";

export type PanelBelgiNom = "uy" | "xarita" | "vazifa" | "reyting" | "menyu";

/** Har belgining o'z rangi — bola tugmani yozuvdan oldin rangdan taniydi. */
const RANG: Record<PanelBelgiNom, { och: string; quyuq: string }> = {
  uy:      { och: "var(--color-brand-green)",  quyuq: "var(--color-brand-green-d)" },
  xarita:  { och: "var(--color-brand-blue)",   quyuq: "var(--color-brand-blue-d)" },
  vazifa:  { och: "var(--color-brand-purple)", quyuq: "var(--color-brand-purple-d)" },
  reyting: { och: "var(--color-brand-purple)", quyuq: "var(--color-brand-purple-d)" },
  menyu:   { och: "var(--color-brand-blue)",   quyuq: "var(--color-brand-blue-d)" },
};

/**
 * Tugmaning rangi — yostiq va yozuv uchun.
 *
 * Ilgari panelda hamma narsa YASHIL edi: belgi ham, yostiq ham, yozuv
 * ham. Belgilar rangli bo'lgach yashil yostiq binafsha planshet ostida
 * yot ko'rinib qoldi — bir tugmada ikkita begona rang. Endi yostiq va
 * yozuv belgining O'Z rangini oladi, ya'ni bitta tugma bitta rangda
 * gapiradi.
 */
export const panelRang = (nom: PanelBelgiNom): string => RANG[nom].quyuq;

export function PanelBelgi({ nom, faol = false, size = 26 }: {
  nom: PanelBelgiNom;
  /** Shu tugma turgan sahifa ochiqmi — harakat va to'liq rang shundan. */
  faol?: boolean;
  size?: number;
}) {
  // Gradient `id` lari HUJJAT BO'YICHA umumiy: panelda beshta belgi
  // yonma-yon turadi va bir xil `id` bo'lsa, hammasi birinchisining
  // gradientini oladi. `useId` dagi ikki nuqta esa `url(#…)` ichida
  // ba'zi brauzerlarda tanlagichni buzadi — shuning uchun olib
  // tashlanadi.
  const xom = useId().replace(/[^a-zA-Z0-9]/g, "");
  const g = `az-pb-${nom}-${xom}`;
  const { och, quyuq } = RANG[nom];

  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true"
      className={`az-pb ${faol ? "az-pb-faol" : ""}`}>
      <defs>
        {/* Tepadan pastga: yorug'dan quyuqqa. Hajmning asosi shu. */}
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={och} />
          <stop offset="100%" stopColor={quyuq} />
        </linearGradient>
        {/* Yuqori chetdagi oq yoritma — "silliq yuza" ishorasi. */}
        <linearGradient id={`${g}-y`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {SHAKL[nom](g)}
    </svg>
  );
}

/* ────────────────────────── shakllar ──────────────────────────
 *
 * Hammasi 32×32 to'rda. `lib/icons.tsx` dagi 24×24 emas: hajmli
 * shaklda ichki tafsilot (eshik, buklama, chiziqchalar) bor va 24 ta
 * birlikda ular yarim piksel joylarga tushib, chetlari xiralashardi.
 *
 * Chiziqlar `stroke-linejoin="round"` bilan — o'tkir burchak bu
 * yoshdagi bola uchun "qattiq" ko'rinadi va butun panel qattiqlashadi.
 */
const SHAKL: Record<PanelBelgiNom, (g: string) => ReactElement> = {
  /* UY — bosh sahifa.  Tomi alohida guruh: faol bo'lganda u sal
     ko'tarilib joyiga tushadi, ya'ni "eshik ochildi" degan ishora
     butun belgini qimirlatmasdan beriladi. */
  uy: (g) => (
    <>
      {/* Devor — ichi karta rangida, ya'ni tungi temada ham o'zidan
          o'zi to'g'ri chiqadi. */}
      <path d="M7 14.5 16 7l9 7.5V25a1.6 1.6 0 0 1-1.6 1.6H8.6A1.6 1.6 0 0 1 7 25z"
        fill="var(--color-karta)" stroke={`url(#${g})`} strokeWidth="2.6"
        strokeLinejoin="round" />
      {/* Eshik — to'liq rangda: ko'z uni birinchi ko'radi. */}
      <path d="M13 26.6v-5.2a3 3 0 0 1 6 0v5.2z" fill={`url(#${g})`} />
      {/* Poydevor — belgini "yerga qo'yadi", usiz uy havoda turardi. */}
      <rect x="5" y="25.4" width="22" height="3.2" rx="1.6" fill={`url(#${g})`} />
      {/* Tom. Guruh markazi 16 16 — `transform-box` bilan birga bu
          animatsiyaning tayanch nuqtasi bo'ladi. */}
      <g className="az-pb-tom">
        <path d="M4.4 16.2 16 6.2l11.6 10" fill="none" stroke={`url(#${g})`}
          strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.4 14.6 16 6.4l9.6 8.2" fill="none" stroke={`url(#${g}-y)`}
          strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </>
  ),

  /* XARITA — darslar yo'li.  Ikki varaq o'rtadan buklangan. Faol
     bo'lganda o'ng varaq bir marta "ochiladi" (`az-pb-varaq`). */
  xarita: (g) => (
    <>
      <g className="az-pb-varaq">
        {/* O'ng varaq — burchagi ko'targan, shuning uchun quyuqroq. */}
        <path d="M16 9.6 26.4 6.2a1.3 1.3 0 0 1 1.7 1.2v15.4c0 .6-.4 1.1-.9 1.3L16 27.4z"
          fill={`url(#${g})`} stroke={`url(#${g})`} strokeWidth="2.4"
          strokeLinejoin="round" />
      </g>
      {/* Chap varaq — yorug' yuza, gradient faqat hoshiyada. */}
      <path d="M16 9.6 5.6 6.2a1.3 1.3 0 0 0-1.7 1.2v15.4c0 .6.4 1.1.9 1.3L16 27.4z"
        fill="var(--color-karta)" stroke={`url(#${g})`} strokeWidth="2.4"
        strokeLinejoin="round" />
      {/* Buklama — ikki varaqni ajratadigan chiziq. */}
      <path d="M16 9.6v17.8" fill="none" stroke={`url(#${g})`} strokeWidth="2.2"
        strokeLinecap="round" />
      <path d="M7 8.6v14" fill="none" stroke={`url(#${g}-y)`} strokeWidth="1.6"
        strokeLinecap="round" />
    </>
  ),

  /* VAZIFA — o'yinlar.  Planshet: qisqichi va ichida ikki qator.
     Qatorlar faol bo'lganda navbat bilan yonadi — "ro'yxat to'ldi". */
  vazifa: (g) => (
    <>
      <rect x="6" y="7.4" width="20" height="21" rx="3.4"
        fill="var(--color-karta)" stroke={`url(#${g})`} strokeWidth="2.6" />
      {/* Qisqich — tepadagi halqa va tasma. */}
      <path d="M12.4 4.6h7.2a1.4 1.4 0 0 1 1.4 1.4v2.6a1.4 1.4 0 0 1-1.4 1.4h-7.2A1.4 1.4 0 0 1 11 8.6V6a1.4 1.4 0 0 1 1.4-1.4z"
        fill={`url(#${g})`} />
      <circle cx="16" cy="4.2" r="2.1" fill="none" stroke={`url(#${g})`} strokeWidth="2.2" />
      {/* Ikki qator: kichik kvadrat + chiziq. */}
      <g className="az-pb-qator">
        <rect x="10.2" y="14.2" width="3.6" height="3.6" rx="1.1" fill={`url(#${g})`} />
        <rect x="15.6" y="15" width="6.4" height="2.2" rx="1.1" fill={`url(#${g})`} />
      </g>
      <g className="az-pb-qator az-pb-qator2">
        <rect x="10.2" y="20.4" width="3.6" height="3.6" rx="1.1" fill={`url(#${g})`}
          opacity="0.7" />
        <rect x="15.6" y="21.2" width="6.4" height="2.2" rx="1.1" fill={`url(#${g})`} />
      </g>
    </>
  ),

  /* REYTING — kamayib boradigan uchta tasma va nuqta. Shakl "saralash"
     ni bildiradi: eng uzunidan eng kichigigacha. Faol bo'lganda ular
     yuqoridan pastga navbat bilan chapdan siljib joylashadi. */
  reyting: (g) => (
    <>
      <g className="az-pb-tasma">
        <rect x="4.6" y="7.6" width="22.8" height="4.6" rx="2.3" fill={`url(#${g})`} />
      </g>
      <g className="az-pb-tasma az-pb-tasma2">
        <rect x="7.6" y="14.6" width="16.8" height="4.6" rx="2.3" fill={`url(#${g})`} />
      </g>
      <g className="az-pb-tasma az-pb-tasma3">
        <rect x="11.6" y="21.6" width="8.8" height="4.6" rx="2.3" fill={`url(#${g})`} />
      </g>
      <g className="az-pb-tasma az-pb-tasma4">
        <circle cx="16" cy="29" r="2.2" fill={`url(#${g})`} />
      </g>
    </>
  ),

  /* MENYU — uchta teng tasma. `lib/icons.tsx` dagi `menu` da pastkisi
     ataylab qisqa edi (u yerda u `order` bilan chalkashardi); bu yerda
     esa yonidagi "reyting" allaqachon KAMAYIB boradi, ya'ni farq
     shundan ko'rinadi. Teng uchtasi esa "ro'yxat" degan eng tanish
     shakl. */
  menyu: (g) => (
    <>
      <g className="az-pb-tasma">
        <rect x="4.6" y="8.2" width="22.8" height="4.6" rx="2.3" fill={`url(#${g})`} />
      </g>
      <g className="az-pb-tasma az-pb-tasma2">
        <rect x="4.6" y="14.7" width="22.8" height="4.6" rx="2.3" fill={`url(#${g})`} />
      </g>
      <g className="az-pb-tasma az-pb-tasma3">
        <rect x="4.6" y="21.2" width="22.8" height="4.6" rx="2.3" fill={`url(#${g})`} />
      </g>
    </>
  ),
};
