/**
 * Aql Zone belgisi.
 *
 * Shakl `public/logo.svg` (= `public/favicon.svg`) bilan AYNAN bir xil —
 * brend bir joyda ikki xil ko'rinmasligi kerak. Birini o'zgartirganda
 * ikkalasini birga o'zgartiring.
 *
 * 2026-10-08 dan belgi: firuza plitka, unda yonma-yon oq "A" va amber "Z"
 * (ilgari shapka + A + ochiq kitob, ko'k-yashil edi). Plitka o'z foni bilan
 * keladi, shuning uchun qorong'i temada belgining qismlarini qayta bo'yash
 * endi shart emas — faqat to'liq variantdagi yozuv (`az-l-yozuv`, `az-l-shior`)
 * ochroq qilinadi (index.css).
 *
 * Nega <img src="/logo.svg"> emas: belgi ekranning birinchi kadrida turadi,
 * alohida so'rov esa uni bir lahza yo'q qilib ko'rsatadi. Inline SVG shu
 * "sakrash"ni yo'qotadi va uning ustiga CSS bilan tema/animatsiya beradi.
 *
 * Diqqat: rang UCHUN `fill="var(--x)"` YOZMANG. Brauzer SVG prezentatsiya
 * atributlari ichida custom property'ni almashtirmaydi — rang jimgina
 * zaxira qiymatda qolib ketadi. Atributda oddiy HEX turadi, temani esa
 * CSS qoidasi ustidan yozadi.
 *
 * Gradient id'lari useId orqali noyob: bir sahifada bir nechta logo bo'lsa
 * ular bir-birining rangini o'g'irlamasin.
 */
import { useId } from "react";
import { T } from "../lib/til";

interface Props {
  size?: number;
  className?: string;
  /**
   * "belgi" — faqat plitka (sarlavha, kichik o'lchamlar).
   * "toliq" — plitka + "AqlZone" yozuvi + shior (kirish/splash ekranlari).
   */
  variant?: "belgi" | "toliq";
  /**
   * Animatsiya: belgi suzadi va plitka ustidan yorug'lik o'tadi. Ro'yxat
   * ichidagi kichik logolarda o'chiring — ekranda bir vaqtda o'nlab harakat
   * bo'lsa, diqqat savoldan chalg'iydi. `prefers-reduced-motion` yoqilgan
   * qurilmada baribir to'xtaydi.
   */
  jonli?: boolean;
}

export function Logo({ size = 40, className = "", variant = "belgi", jonli = true }: Props) {
  const uid = useId().replace(/:/g, "");
  const id = (nom: string) => `az-${nom}-${uid}`;

  const fon = id("fon");
  const yaltirFon = id("yfon");
  const oq = id("oq");
  const amber = id("amber");
  const zone = id("zone");
  const kesim = id("kesim");
  const nur = id("nur");
  const yaltir = id("yaltir");

  const toliq = variant === "toliq";

  return (
    <svg
      width={size}
      height={toliq ? (size * 270) / 360 : size}
      viewBox={toliq ? "0 0 360 270" : "0 0 120 120"}
      className={`az-logo${jonli ? " az-logo-jonli" : ""} ${className}`}
      role="img"
      aria-label={toliq ? "Aql Zone — bilim sari har bir qadam" : "Aql Zone"}
    >
      <defs>
        <linearGradient id={fon} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2cc6d4" />
          <stop offset=".55" stopColor="#17b3c1" />
          <stop offset="1" stopColor="#0e8f9b" />
        </linearGradient>
        <linearGradient id={yaltirFon} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".3" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={oq} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e3f6f8" />
        </linearGradient>
        <linearGradient id={amber} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb84d" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id={zone} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#17b3c1" />
          <stop offset="1" stopColor="#0e8f9b" />
        </linearGradient>

        {/* Qorong'i fonda plitkani ajratib turadigan yumshoq yorug'lik.
            Oq fonda index.css uni ko'rinmas qiladi — u yerda kerak emas. */}
        <radialGradient id={nur}>
          <stop offset="0" stopColor="#4fe3f0" stopOpacity=".5" />
          <stop offset=".55" stopColor="#17b3c1" stopOpacity=".2" />
          <stop offset="1" stopColor="#17b3c1" stopOpacity="0" />
        </radialGradient>

        {/* Plitka ustidan o'tadigan yorug'lik yo'li */}
        <linearGradient id={yaltir} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".4" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* Yorug'lik plitkadan tashqariga chiqmasin */}
        <clipPath id={kesim}>
          <rect width="120" height="120" rx="28" />
        </clipPath>
      </defs>

      {/* To'liq variantda belgi tepada, markazda turadi */}
      <g transform={toliq ? "translate(120 4)" : undefined}>
        {/* Suzish ICHKI guruhda: CSS transform yuqoridagi translate atributini
            almashtirib yuborar edi va belgi burchakka sakrab chiqardi. */}
        <g className="az-logo-belgi">
          <ellipse className="az-logo-nur" cx="60" cy="62" rx="66" ry="62" fill={`url(#${nur})`} />

          <rect width="120" height="120" rx="28" fill={`url(#${fon})`} />
          <rect width="120" height="62" rx="28" fill={`url(#${yaltirFon})`} />

          {/* Z — orqada: A uni pastda yopib turadi */}
          <path d="M63 32 H98 L65 88 H101" fill="none" stroke="#8a4b00" strokeOpacity=".6"
            strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" transform="translate(1.4 3)" />
          <path d="M63 32 H98 L65 88 H101" fill="none" stroke={`url(#${amber})`}
            strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M65 30.4 H94" stroke="#fff" strokeOpacity=".6" strokeWidth="1.8" strokeLinecap="round" />

          {/* A — doimiy qism */}
          <path d="M19 88 L42 30 L65 88 M30 69 H54" fill="none" stroke="#08636b" strokeOpacity=".55"
            strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" transform="translate(1.4 3)" />
          <path d="M19 88 L42 30 L65 88 M30 69 H54" fill="none" stroke={`url(#${oq})`}
            strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22.5 82 L41.5 34" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />

          <g clipPath={`url(#${kesim})`}>
            <rect className="az-logo-yaltir" x="-46" y="-10" width="34" height="140"
              transform="skewX(-14)" fill={`url(#${yaltir})`} />
          </g>
        </g>
      </g>

      {toliq && (
        <g className="az-logo-yozuv">
          {/* textLength yozuvni shriftdan qat'i nazar bir xil kenglikda ushlab turadi.
              Bo'lmasa shrift yuklanguncha yozuv kengroq chiqib, yon chiziqlar
              matn ustiga tushadi va "o'chirilgan" kabi ko'rinadi. */}
          <text x="180" y="196" textAnchor="middle" textLength="242" lengthAdjust="spacingAndGlyphs"
            fontFamily="'Baloo 2', 'Fredoka', system-ui, sans-serif"
            fontSize="66" fontWeight="800" letterSpacing="-1">
            <tspan className="az-l-yozuv" fill="#1f2937">Aql</tspan>
            <tspan fill={`url(#${zone})`}>Zone</tspan>
          </text>
          <g opacity=".9">
            {/* Shior 87..273 oralig'ida; chiziqlar 13px bo'shliq qoldirib chetda */}
            <path className="az-l-shior-s" d="M40 230h34M286 230h34" stroke="#17b3c1" strokeWidth="3"
              strokeLinecap="round" />
            <text className="az-l-shior" x="180" y="235" textAnchor="middle" textLength="186"
              lengthAdjust="spacingAndGlyphs"
              fontFamily="'Baloo 2', 'Fredoka', system-ui, sans-serif"
              fontSize="13" fontWeight="700" letterSpacing="1.2" fill="#0e8f9b">
              {/* Shior tarjima qilinadi, brend nomi esa YO'Q: "Aql Zone" —
                  bu nom, uni o'girish brendni ikkiga bo'lardi. `textLength`
                  ikki tilda ham bir xil kenglikni ushlab turadi, ya'ni
                  ruscha uzunroq matn chiziqlarga tegib ketmaydi. */}
              {T("BILIM SARI HAR BIR QADAM", "КАЖДЫЙ ШАГ К ЗНАНИЯМ")}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}
