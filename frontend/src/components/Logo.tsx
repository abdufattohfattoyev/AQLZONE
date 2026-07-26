/**
 * Aql Zone belgisi.
 *
 * Shakl `public/logo.svg` (= `public/favicon.svg`) bilan AYNAN bir xil —
 * brend bir joyda ikki xil ko'rinmasligi kerak. Birini o'zgartirganda
 * ikkalasini birga o'zgartiring.
 *
 * Nega <img src="/logo.svg"> emas: belgi ekranning birinchi kadrida turadi,
 * alohida so'rov esa uni bir lahza yo'q qilib ko'rsatadi. Inline SVG shu
 * "sakrash"ni yo'qotadi va uning ustiga CSS bilan tema/animatsiya beradi.
 *
 * TEMAGA MOSLASHUV. Shapka, kitob va "Aql" yozuvi to'q ko'k — bu oq fonda
 * kuchli, ammo "bosh" va "katta" temalarning qorong'i fonida belgi fonga
 * singib ketardi. Shuning uchun o'sha qismlarga `az-l-*` klasslari qo'yilgan
 * va index.css qorong'i temalarda ularni ochroq qiladi.
 *
 * Diqqat: rang UCHUN `fill="var(--x)"` YOZMANG. Brauzer SVG prezentatsiya
 * atributlari ichida custom property'ni almashtirmaydi — rang jimgina
 * zaxira qiymatda qolib ketadi va tema ishlamaydi (shu xato bo'lgan).
 * Atributda oddiy HEX turadi (oq fon uchun standart, `logo.svg` bilan bir xil),
 * temani esa CSS qoidasi ustidan yozadi.
 *
 * Gradient id'lari useId orqali noyob: bir sahifada bir nechta logo bo'lsa
 * (masalan sarlavha + kartochka) ular bir-birining rangini o'g'irlamasin.
 */
import { useId } from "react";

interface Props {
  size?: number;
  className?: string;
  /**
   * "belgi" — faqat shakl (sarlavha, kichik o'lchamlar).
   * "toliq" — shakl + "AqlZone" yozuvi + shior (kirish/splash ekranlari).
   */
  variant?: "belgi" | "toliq";
  /**
   * Animatsiya: belgi suzadi, popuk tebranadi, kitob nafas oladi va "A"
   * ustidan yorug'lik o'tadi. Ro'yxat ichidagi kichik logolarda o'chiring —
   * ekranda bir vaqtda o'nlab harakat bo'lsa, diqqat savoldan chalg'iydi.
   * `prefers-reduced-motion` yoqilgan qurilmada baribir to'xtaydi.
   */
  jonli?: boolean;
}

export function Logo({ size = 40, className = "", variant = "belgi", jonli = true }: Props) {
  const uid = useId().replace(/:/g, "");
  const id = (nom: string) => `az-${nom}-${uid}`;

  const aChap = id("achap");
  const aOng = id("aong");
  const shapka = id("shapka");
  const kitob = id("kitob");
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
        <linearGradient id={aChap} x1="0" y1="0" x2=".6" y2="1">
          <stop offset="0" stopColor="#2f7fe4" />
          <stop offset="1" stopColor="#1636c4" />
        </linearGradient>
        <linearGradient id={aOng} x1=".1" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f8ee6" />
          <stop offset="1" stopColor="#22bd6d" />
        </linearGradient>
        <linearGradient id={shapka} x1="0" y1="0" x2="1" y2="1">
          <stop className="az-l-shapka-a" offset="0" stopColor="#1e3a8f" />
          <stop className="az-l-shapka-b" offset="1" stopColor="#101f52" />
        </linearGradient>
        <linearGradient id={kitob} x1="0" y1="0" x2="1" y2="0">
          <stop className="az-l-kitob-a" offset="0" stopColor="#1b45a8" />
          <stop className="az-l-kitob-b" offset=".5" stopColor="#122f74" />
          <stop className="az-l-kitob-a" offset="1" stopColor="#1b45a8" />
        </linearGradient>
        <linearGradient id={zone} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f8ee6" />
          <stop offset=".55" stopColor="#22a8c0" />
          <stop offset="1" stopColor="#22bd6d" />
        </linearGradient>

        {/* Qorong'i fonda belgini ajratib turadigan yumshoq yorug'lik.
            Oq fonda index.css uni ko'rinmas qiladi — u yerda kerak emas. */}
        <radialGradient id={nur}>
          <stop offset="0" stopColor="#4fd1ff" stopOpacity=".55" />
          <stop offset=".55" stopColor="#3a86f0" stopOpacity=".22" />
          <stop offset="1" stopColor="#3a86f0" stopOpacity="0" />
        </radialGradient>

        {/* "A" ustidan o'tadigan yorug'lik yo'li */}
        <linearGradient id={yaltir} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        {/* "A" — tashqi uchburchak minus ikki teshik; teshiklar orasi ko'ndalang chiziq bo'lib qoladi */}
        <clipPath id={kesim} clipRule="evenodd">
          <path d="M60 28 L109 100 H11 Z M60 58 L71.5 75 H48.5 Z M44 83 H76 L80.5 91 H39.5 Z" />
        </clipPath>
      </defs>

      {/* To'liq variantda belgi tepada, markazda turadi */}
      <g transform={toliq ? "translate(120 6)" : undefined}>
        {/* Suzish ICHKI guruhda: CSS transform yuqoridagi translate atributini
            almashtirib yuborar edi va belgi burchakka sakrab chiqardi. */}
        <g className="az-logo-belgi">
        <ellipse className="az-logo-nur" cx="60" cy="64" rx="62" ry="56" fill={`url(#${nur})`} />

        {/* Shapka A'ning uchini yopadi — shuning uchun A'dan oldin chiziladi */}
        <g transform="rotate(-13 60 24)">
          <path d="M60 6 96 22 60 38 24 22Z" fill={`url(#${shapka})`} />
          <path className="az-l-tund" d="M48 29v9c0 3.4 5.4 6 12 6s12-2.6 12-6v-9l-12 5.3z" fill="#16295e" />
          {/* Popuk alohida guruh: tebranish uning ipi boshlanadigan nuqtadan aylanadi */}
          <g className="az-logo-popuk">
            <path className="az-l-tund-s" d="M93.5 22.6v16" stroke="#101f52" strokeWidth="2.6"
              strokeLinecap="round" fill="none" />
            <path className="az-l-tund" d="M93.5 37c3.4 0 5.6 2 5.6 4.6 0 3.4-2.4 7-5.6 8.6-3.2-1.6-5.6-5.2-5.6-8.6 0-2.6 2.2-4.6 5.6-4.6z"
              fill="#16295e" />
          </g>
        </g>

        {/* Chap yelka ko'k, o'ng yelka ko'k→yashil: ikki to'rtburchak A shakli bo'ylab kesiladi */}
        <g clipPath={`url(#${kesim})`}>
          <path d="M0 0h74L34 120H0z" fill={`url(#${aChap})`} />
          <path d="M74 0h46v120H34z" fill={`url(#${aOng})`} />
          {/* Yorug'lik ham shu kesim ichida — A'dan tashqariga chiqmaydi */}
          <rect className="az-logo-yaltir" x="-46" y="-10" width="34" height="140"
            transform="skewX(-14)" fill={`url(#${yaltir})`} />
        </g>

        {/* Ochiq kitob: A shu yerda "turadi" */}
        <g className="az-logo-kitob">
          <path d="M4 98c17-9 39-8 54 2v13c-15-10-37-11-54-4z" fill={`url(#${kitob})`} />
          <path d="M116 98c-17-9-39-8-54 2v13c15-10 37-11 54-4z" fill={`url(#${kitob})`} />
          <path d="M8 96c16-7 36-6 50 3M112 96c-16-7-36-6-50 3" stroke="#fff" strokeWidth="2.4"
            strokeLinecap="round" fill="none" opacity=".95" />
        </g>
        </g>
      </g>

      {toliq && (
        <g className="az-logo-yozuv">
          {/* textLength yozuvni shriftdan qat'i nazar bir xil kenglikda ushlab turadi.
              Bo'lmasa shrift yuklanguncha yozuv kengroq chiqib, yon chiziqlar
              matn ustiga tushadi va "o'chirilgan" kabi ko'rinadi. */}
          <text x="180" y="200" textAnchor="middle" textLength="242" lengthAdjust="spacingAndGlyphs"
            fontFamily="'Baloo 2', 'Fredoka', system-ui, sans-serif"
            fontSize="66" fontWeight="800" letterSpacing="-1">
            <tspan className="az-l-yozuv" fill="#16276b">Aql</tspan>
            <tspan fill={`url(#${zone})`}>Zone</tspan>
          </text>
          <g opacity=".9">
            {/* Shior 87..273 oralig'ida; chiziqlar 13px bo'shliq qoldirib chetda */}
            <path className="az-l-shior-s" d="M40 232h34M286 232h34" stroke="#1b45a8" strokeWidth="3"
              strokeLinecap="round" />
            <text className="az-l-shior" x="180" y="237" textAnchor="middle" textLength="186"
              lengthAdjust="spacingAndGlyphs"
              fontFamily="'Baloo 2', 'Fredoka', system-ui, sans-serif"
              fontSize="13" fontWeight="700" letterSpacing="1.2" fill="#1e3a8f">
              BILIM SARI HAR BIR QADAM
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}
