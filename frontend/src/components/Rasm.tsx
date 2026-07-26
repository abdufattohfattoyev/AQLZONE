/**
 * Rasm — savoldagi har bir narsaning ko'rinishi.
 *
 * Ikki manba bor va tanlov ataylab shunday:
 *
 *   • CHIZMA — o'z SVG chizmalarimiz. Shakl, strelka, ob-havo, kun qismlari,
 *     kayfiyat: bularning hammasi sof geometriya, ya'ni ularni o'zimiz
 *     chizsak emojidan ANCHA yaxshi chiqadi — gradient, yumshoq soya,
 *     bir xil uslub. Emoji bu yerda har qurilmada boshqacha ko'rinadi
 *     (Windows'da bir xil, telefonda boshqa) va o'lchamlari ham qochadi.
 *
 *   • Emoji — hayvon, meva, transport kabi murakkab narsalar uchun.
 *     Ularni yomon chizgandan ko'ra, professional chizilgan emojini
 *     ISHLATGAN yaxshi. Lekin u yolg'iz qolmaydi: rangli pufak ustida,
 *     kattalashtirilgan va sekin suzib turgan holda beriladi — shunda
 *     yassi belgi emas, tirik rasmga o'xshaydi.
 *
 * Yangi chizma qo'shish: CHIZMA ga emojini kalit qilib, funksiyani yozing.
 * Boshqa hech qayerga tegish shart emas — butun ilova shu yerdan o'tadi.
 */
import type { ReactNode } from "react";

/* ---------------- yordamchilar ---------------- */

/** Gradient ta'rifi — chizmalarga hajm beradi. */
const Grad = ({ id, a, b }: { id: string; a: string; b: string }) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  </defs>
);

/** Barcha chizmalar shu maydonda — 100×100. */
const Svg = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
    {children}
  </svg>
);

/* ---------------- shakllar ---------------- */

const shakl = (id: string, a: string, b: string, ichi: ReactNode) => (
  <Svg>
    <Grad id={id} a={a} b={b} />
    {ichi}
  </Svg>
);

/* ---------------- chizmalar ro'yxati ---------------- */

/**
 * Emoji → o'z chizmamiz.
 *
 * Kalit sifatida ATAYLAB emoji ishlatiladi: savol generatorlari va javob
 * taqqoslash o'sha emojining o'zi bilan ishlaydi (`String(javob) ===
 * String(tanlangan)`), shuning uchun ma'lumot tuzilmasiga tegmasdan
 * ko'rinishni almashtira olamiz. Chizmasi yo'q emoji o'zicha chiziladi.
 */
const CHIZMA: Record<string, ReactNode> = {
  /* --- shakllar --- */
  "⭕": shakl("g-doira", "#ff8a7a", "#f2453d",
    <circle cx="50" cy="50" r="38" fill="url(#g-doira)" />),
  "🔺": shakl("g-uch", "#ffd166", "#f5a524",
    <path d="M50 10 L88 80 Q90 86 84 86 H16 Q10 86 12 80 Z" fill="url(#g-uch)" />),
  "🟥": shakl("g-kvadrat", "#7ec8f5", "#3d8ef2",
    <rect x="14" y="14" width="72" height="72" rx="14" fill="url(#g-kvadrat)" />),
  "⭐": shakl("g-yulduz", "#ffe066", "#f5b301",
    <path d="M50 8 L62 36 L92 39 L69 59 L76 89 L50 73 L24 89 L31 59 L8 39 L38 36 Z"
      fill="url(#g-yulduz)" strokeLinejoin="round" stroke="#f5b301" strokeWidth="4" />),
  "❤️": shakl("g-yurak", "#ff8fb1", "#f2456d",
    <path d="M50 86 C18 64 10 46 10 34 A22 22 0 0150 24 A22 22 0 0190 34 C90 46 82 64 50 86 Z"
      fill="url(#g-yurak)" />),
  "🔷": shakl("g-romb", "#a9e0ff", "#3aa8e0",
    <path d="M50 8 L88 50 L50 92 L12 50 Z" fill="url(#g-romb)" />),

  /* --- strelkalar: bitta chizma, to'rt tomonga buriladi --- */
  "⬆️": <Strelka burchak={0} />,
  "➡️": <Strelka burchak={90} />,
  "⬇️": <Strelka burchak={180} />,
  "⬅️": <Strelka burchak={270} />,

  /* Ob-havo, kun qismlari, yuzlar va boshqa TABIIY narsalar ataylab shu
     yerda YO'Q. Ular emoji bo'lib qoladi: emoji hajmli, yorug'-soyali va
     bolaga haqiqiy narsani eslatadi, o'zimiz chizgan tekis shakl esa
     "chizilgan rasm" bo'lib qolardi. Bu yerda faqat GEOMETRIYA turadi —
     uchburchakning "haqiqiysi" yo'q, u shundoq ham chizma. */
};

/* ---------------- takrorlanuvchi chizmalar ---------------- */

/** Strelka. Bitta shakl, `burchak` bilan to'rt tomonga buriladi. */
function Strelka({ burchak }: { burchak: number }) {
  return (
    <Svg>
      <Grad id={`g-str-${burchak}`} a="#8fd7a0" b="#2fa25c" />
      <g transform={`rotate(${burchak} 50 50)`}>
        <path d="M50 8 L84 44 H66 V88 Q66 92 62 92 H38 Q34 92 34 88 V44 H16 Z"
          fill={`url(#g-str-${burchak})`} strokeLinejoin="round" />
      </g>
    </Svg>
  );
}

/* ---------------- tashqi ko'rinish ---------------- */

/**
 * Emoji uchun tinch, doim bir xil rang.
 *
 * Tasodifiy emas — belgidan hisoblanadi, ya'ni olma HAR DOIM bir xil
 * pushti pufakda chiqadi. Bola shu bog'lanishga o'rganadi va rasmni
 * tezroq taniydi.
 */
const PUFAK = [
  "#ffe3d0", "#d8f0dc", "#dbe9ff", "#fdf0c8", "#f0e0ff", "#ffe0ea", "#d6f2f5",
];

function pufakRangi(e: string): string {
  let n = 0;
  for (const belgi of e) n = (n * 31 + (belgi.codePointAt(0) ?? 0)) >>> 0;
  return PUFAK[n % PUFAK.length];
}

interface Props {
  /** Emoji yoki chizma kaliti. */
  e: string;
  /** Chizma kattaligi, px. */
  size?: number;
  /** Pufak (rangli fon doira) chizilsinmi. */
  pufak?: boolean;
  /** Sekin suzib turish animatsiyasi kechikishi, ms. */
  kech?: number;
  className?: string;
}

/**
 * Bitta rasm.
 *
 * Chizmasi bo'lsa — SVG, bo'lmasa emojining o'zi. Ikkalasi ham bir xil
 * o'lchamda chiqadi, shuning uchun ular yonma-yon turganda ham qatorlar
 * qiyshaymaydi.
 */
export function Rasm({ e, size = 56, pufak = false, kech, className = "" }: Props) {
  const chizma = CHIZMA[e];
  const ichki = Math.round(size * (pufak ? 0.66 : 1));

  const rasm = chizma
    ? <span style={{ width: ichki, height: ichki, display: "block" }}>{chizma}</span>
    : <span style={{ fontSize: ichki, lineHeight: 1 }}>{e}</span>;

  const uslub = kech === undefined ? undefined : ({ "--az-kech": `${kech}ms` } as React.CSSProperties);
  const jonli = kech === undefined ? "" : "az-suzish";

  if (!pufak) return <span className={`${jonli} ${className}`} style={uslub}>{rasm}</span>;

  return (
    <span
      className={`grid place-items-center rounded-full ${jonli} ${className}`}
      style={{
        width: size, height: size, background: pufakRangi(e),
        boxShadow: "inset 0 -4px 10px rgb(0 0 0 / 0.07), 0 4px 10px rgb(58 46 34 / 0.12)",
        ...uslub,
      }}
    >
      {rasm}
    </span>
  );
}

/** Shu belgining o'z chizmasi bormi — sinov va nosozlik qidirish uchun. */
export const chizmaBor = (e: string) => e in CHIZMA;
