/**
 * MASHINALAR — qo'lda chizilgan SVG rasmlar.
 *
 * ─────────── NEGA EMOJI EMAS ───────────
 *
 * Emoji har platformada boshqa rassom qo'lida chizilgan: Windows'da
 * ular tekis va burchakli, Android'da boshqacha, iOS'da yana boshqacha.
 * Natijada albom har telefonda boshqa ko'rinardi va uni "ilovaning
 * rasmlari" deb his qilib bo'lmasdi — ular QARZGA olingan rasm edi.
 *
 * Bu yerdagi hammasi bitta tilda chizilgan:
 *
 *   • 120×120 to'r, hamma narsa markazda
 *   • yumaloq burchaklar (bolalar uchun o'tkir burchak yo'q)
 *   • har rangda ikki qatlam: asosiy va pastdagi to'q soya — hajm
 *     shundan chiqadi
 *   • oyna doim ochiq havorang, g'ildirak doim to'q kulrang —
 *     ya'ni bola bir marta o'rgansa, hamma mashinada taniydi
 *   • pastda yumshoq soya: narsa "yerda turibdi"
 *
 * ─────────── NEGA HAJM MUHIM ───────────
 *
 * Tekis rangdagi shakl bolaga "chizma" bo'lib ko'rinadi; soyasi va
 * yorug'i bor shakl esa NARSA bo'lib ko'rinadi. Farq kichkintoy uchun
 * hal qiluvchi: u haqiqiy mashinani ko'chada ko'rgan va ekrandagisini
 * o'sha bilan bog'lashi kerak.
 */
import type { JSX } from "react";

/** Umumiy ranglar — hamma mashina shu palitrada. */
const OYNA = "#bfe4f7";
const OYNA_SOYA = "#93cbe9";
const GILDIRAK = "#33323a";
const GILDIRAK_ICH = "#c8ccd6";
const FAR = "#ffe08a";

/** Pastdagi yumshoq soya — hamma rasmda bir xil. */
const Soya = () => (
  <ellipse cx="60" cy="103" rx="40" ry="5.5" fill="#000" opacity="0.13" />
);

/**
 * G'ildirak — qora shina, kulrang disk.
 *
 * Alohida komponent, chunki u sakkizta rasmda takrorlanadi va
 * ularning hammasi bir xil ko'rinishi kerak: bola g'ildirakni
 * mashinaning belgisi sifatida taniydi.
 */
const Gildirak = ({ cx, cy, r = 10 }: { cx: number; cy: number; r?: number }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={GILDIRAK} />
    <circle cx={cx} cy={cy} r={r * 0.45} fill={GILDIRAK_ICH} />
    <circle cx={cx} cy={cy} r={r * 0.18} fill="#8d93a3" />
  </g>
);

/** Kuzov ustidagi yorug'lik chizig'i — yaltiroq bo'yoq hissi. */
const Yaltir = ({ d }: { d: string }) => (
  <path d={d} fill="#fff" opacity="0.28" />
);

/* ──────────────────────────── yengil avtomobil ──────────────────────────── */

export const ChizmaMashina = (): JSX.Element => (
  <g>
    <Soya />
    {/* kuzovning pastki, to'q qismi — soya bo'lib ishlaydi */}
    <path d="M14 78c0-4 3-7 7-7h78c4 0 7 3 7 7v6c0 3-2 5-5 5H19c-3 0-5-2-5-5z" fill="#c2352d" />
    {/* asosiy kuzov */}
    <path d="M16 74c0-9 4-13 10-15l6-14c1.6-3.6 4-5.4 8-5.4h32c4 0 6.4 1.8 8 5.4l6 14c6 2 10 6 10 15v3c0 2.4-1.8 4-4 4H20c-2.4 0-4-1.6-4-4z"
      fill="#ee4a41" />
    <Yaltir d="M32 45c1.6-3.6 4-5.4 8-5.4h32c4 0 6.4 1.8 8 5.4l1.6 3.8H30.4z" />
    {/* oyna */}
    <path d="M37 46.6c.9-2 2.2-3 4.4-3h37.2c2.2 0 3.5 1 4.4 3l3.4 8.4H33.6z" fill={OYNA} />
    <path d="M58 43.6h4v11.4h-4z" fill={OYNA_SOYA} />
    {/* farlar */}
    <rect x="14" y="66" width="10" height="7" rx="3.5" fill={FAR} />
    <rect x="96" y="66" width="10" height="7" rx="3.5" fill="#ff9c8f" />
    <Gildirak cx={34} cy={86} />
    <Gildirak cx={86} cy={86} />
  </g>
);

/* ──────────────────────────────── avtobus ──────────────────────────────── */

export const ChizmaAvtobus = (): JSX.Element => (
  <g>
    <Soya />
    <rect x="12" y="80" width="96" height="10" rx="4" fill="#c78c17" />
    <rect x="12" y="26" width="96" height="58" rx="12" fill="#f5b301" />
    <Yaltir d="M12 38c0-6.6 5.4-12 12-12h72c6.6 0 12 5.4 12 12v4H12z" />
    {/* oynalar qatori — bittadan emas, ro'yxat bo'lib: avtobusni
        aynan shu uzun oyna qatori taniqli qiladi */}
    {[19, 41, 63, 85].map((x) => (
      <rect key={x} x={x} y="36" width="17" height="20" rx="4" fill={OYNA} />
    ))}
    <rect x="19" y="36" width="17" height="20" rx="4" fill={OYNA_SOYA} />
    {/* eshik */}
    <rect x="63" y="60" width="17" height="22" rx="3" fill={OYNA_SOYA} opacity="0.55" />
    <rect x="14" y="70" width="9" height="7" rx="3" fill={FAR} />
    <rect x="97" y="70" width="9" height="7" rx="3" fill={FAR} />
    <Gildirak cx={33} cy={88} r={9} />
    <Gildirak cx={87} cy={88} r={9} />
  </g>
);

/* ───────────────────────────────── taksi ───────────────────────────────── */

export const ChizmaTaksi = (): JSX.Element => (
  <g>
    <Soya />
    <path d="M14 78c0-4 3-7 7-7h78c4 0 7 3 7 7v6c0 3-2 5-5 5H19c-3 0-5-2-5-5z" fill="#d19b06" />
    <path d="M16 74c0-9 4-13 10-15l6-14c1.6-3.6 4-5.4 8-5.4h32c4 0 6.4 1.8 8 5.4l6 14c6 2 10 6 10 15v3c0 2.4-1.8 4-4 4H20c-2.4 0-4-1.6-4-4z"
      fill="#fcc419" />
    <Yaltir d="M32 45c1.6-3.6 4-5.4 8-5.4h32c4 0 6.4 1.8 8 5.4l1.6 3.8H30.4z" />
    <path d="M37 46.6c.9-2 2.2-3 4.4-3h37.2c2.2 0 3.5 1 4.4 3l3.4 8.4H33.6z" fill={OYNA} />
    {/* tomdagi chiroq — taksini boshqa mashinadan ajratadigan
        YAGONA belgi. Usiz u sariq avtomobil bo'lib qolardi. */}
    <rect x="49" y="26" width="22" height="10" rx="3" fill="#2f3d5c" />
    <text x="60" y="34.4" textAnchor="middle" fill="#ffd84d"
      style={{ font: "700 8px 'Fredoka', sans-serif" }}>TAXI</text>
    {/* yon tomondagi shashka chizig'i */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={30 + i * 10} y="62" width="5" height="5"
        fill={i % 2 ? "#2f3d5c" : "#fff"} />
    ))}
    <rect x="14" y="66" width="10" height="7" rx="3.5" fill={FAR} />
    <rect x="96" y="66" width="10" height="7" rx="3.5" fill="#ff9c8f" />
    <Gildirak cx={34} cy={86} />
    <Gildirak cx={86} cy={86} />
  </g>
);

/* ────────────────────────────── yuk mashinasi ────────────────────────────── */

export const ChizmaYuk = (): JSX.Element => (
  <g>
    <Soya />
    {/* yuk qismi ORQADA va katta — bolaning ko'zi birinchi shuni ko'radi */}
    <rect x="10" y="34" width="58" height="48" rx="6" fill="#8ea3c4" />
    <rect x="10" y="34" width="58" height="10" rx="5" fill="#a8bcda" />
    <rect x="16" y="48" width="46" height="28" rx="3" fill="#7a90b3" opacity="0.6" />
    {/* kabina */}
    <path d="M68 48h20c4 0 6.4 1.6 8 5l6 12c4 1.4 6 4 6 9v6c0 2.4-1.8 4-4 4H68z" fill="#3d8ef2" />
    <path d="M74 52h13c2 0 3.2.8 4 2.6l4.4 9.4H74z" fill={OYNA} />
    <Yaltir d="M68 48h20c4 0 6.4 1.6 8 5l1 2H68z" />
    <rect x="101" y="66" width="6" height="7" rx="3" fill={FAR} />
    <Gildirak cx={28} cy={86} r={11} />
    <Gildirak cx={56} cy={86} r={11} />
    <Gildirak cx={92} cy={86} r={11} />
  </g>
);

/* ────────────────────────── o't o'chirish mashinasi ────────────────────────── */

export const ChizmaOtOchir = (): JSX.Element => (
  <g>
    <Soya />
    <rect x="8" y="40" width="62" height="42" rx="6" fill="#c2352d" />
    <rect x="8" y="40" width="62" height="9" rx="4.5" fill="#e8564c" />
    {/* narvon — o't o'chirish mashinasining eng taniqli belgisi */}
    <g stroke="#e3e7ee" strokeWidth="3.4" strokeLinecap="round">
      <path d="M14 36h52M14 30h52" />
      {[18, 28, 38, 48, 58].map((x) => <path key={x} d={`M${x} 30v6`} />)}
    </g>
    {/* g'altak */}
    <circle cx="30" cy="62" r="10" fill="#e8e2d4" />
    <circle cx="30" cy="62" r="5" fill="#b9b0a0" />
    <path d="M70 48h18c4 0 6.4 1.6 8 5l6 12c4 1.4 6 4 6 9v6c0 2.4-1.8 4-4 4H70z" fill="#ee4a41" />
    <path d="M76 52h12c2 0 3.2.8 4 2.6l4.4 9.4H76z" fill={OYNA} />
    {/* ko'k-qizil chiroq */}
    <rect x="74" y="41" width="20" height="7" rx="3.5" fill="#2f3d5c" />
    <circle cx="80" cy="44.5" r="2.6" fill="#4fb8e0" />
    <circle cx="88" cy="44.5" r="2.6" fill="#ff5a4d" />
    <rect x="101" y="66" width="6" height="7" rx="3" fill={FAR} />
    <Gildirak cx={30} cy={86} r={10} />
    <Gildirak cx={90} cy={86} r={10} />
  </g>
);

/* ─────────────────────────────── tez yordam ─────────────────────────────── */

export const ChizmaTezYordam = (): JSX.Element => (
  <g>
    <Soya />
    <rect x="10" y="38" width="60" height="44" rx="7" fill="#e6ebf5" />
    <rect x="10" y="38" width="60" height="9" rx="4.5" fill="#fbfdff" />
    {/* qizil xoch — bola uni "shifokor mashinasi" deb taniydi */}
    <g fill="#ee4a41">
      <rect x="32" y="52" width="16" height="6" rx="2" />
      <rect x="37" y="47" width="6" height="16" rx="2" />
    </g>
    <rect x="18" y="70" width="44" height="4" rx="2" fill="#ff8a7d" />
    <path d="M70 46h18c4 0 6.4 1.6 8 5l6 12c4 1.4 6 4 6 9v6c0 2.4-1.8 4-4 4H70z" fill="#f4f7fc" />
    <path d="M76 50h12c2 0 3.2.8 4 2.6l4.4 9.4H76z" fill={OYNA} />
    <rect x="74" y="39" width="20" height="7" rx="3.5" fill="#2f3d5c" />
    <circle cx="80" cy="42.5" r="2.6" fill="#4fb8e0" />
    <circle cx="88" cy="42.5" r="2.6" fill="#ff5a4d" />
    <rect x="101" y="66" width="6" height="7" rx="3" fill={FAR} />
    <Gildirak cx={30} cy={86} r={10} />
    <Gildirak cx={90} cy={86} r={10} />
  </g>
);

/* ──────────────────────────── politsiya mashinasi ──────────────────────────── */

export const ChizmaPolitsiya = (): JSX.Element => (
  <g>
    <Soya />
    <path d="M14 78c0-4 3-7 7-7h78c4 0 7 3 7 7v6c0 3-2 5-5 5H19c-3 0-5-2-5-5z" fill="#1f2b45" />
    <path d="M16 74c0-9 4-13 10-15l6-14c1.6-3.6 4-5.4 8-5.4h32c4 0 6.4 1.8 8 5.4l6 14c6 2 10 6 10 15v3c0 2.4-1.8 4-4 4H20c-2.4 0-4-1.6-4-4z"
      fill="#2f3d5c" />
    {/* oq eshik — haqiqiy patrul mashinalaridagidek */}
    <path d="M40 59h40v18H40z" fill="#f0f3f8" />
    <Yaltir d="M32 45c1.6-3.6 4-5.4 8-5.4h32c4 0 6.4 1.8 8 5.4l1.6 3.8H30.4z" />
    <path d="M37 46.6c.9-2 2.2-3 4.4-3h37.2c2.2 0 3.5 1 4.4 3l3.4 8.4H33.6z" fill={OYNA} />
    {/* tomdagi chiroq */}
    <rect x="47" y="27" width="26" height="8" rx="4" fill="#1f2b45" />
    <rect x="49" y="29" width="10" height="4" rx="2" fill="#4fb8e0" />
    <rect x="61" y="29" width="10" height="4" rx="2" fill="#ff5a4d" />
    <rect x="14" y="66" width="10" height="7" rx="3.5" fill={FAR} />
    <rect x="96" y="66" width="10" height="7" rx="3.5" fill="#ff9c8f" />
    <Gildirak cx={34} cy={86} />
    <Gildirak cx={86} cy={86} />
  </g>
);

/* ──────────────────────────────── traktor ──────────────────────────────── */

export const ChizmaTraktor = (): JSX.Element => (
  <g>
    <Soya />
    {/* Traktorning butun tanilishi NOTENG g'ildiraklarda: orqasi juda
        katta, oldi kichik. Shu nisbat buzilsa, u oddiy mashina
        bo'lib qoladi. */}
    <rect x="52" y="52" width="42" height="26" rx="6" fill="#3fb865" />
    <rect x="30" y="60" width="26" height="18" rx="5" fill="#34a058" />
    {/* kabina */}
    <path d="M56 26h26c3.4 0 6 2.6 6 6v20H50V32c0-3.4 2.6-6 6-6z" fill="#2f8f4d" />
    <rect x="56" y="31" width="26" height="17" rx="3" fill={OYNA} />
    {/* mo'ri */}
    <rect x="40" y="34" width="7" height="22" rx="3" fill="#3d4a5c" />
    <circle cx="43.5" cy="30" r="4" fill="#c9d2de" opacity="0.65" />
    <circle cx="49" cy="23" r="3" fill="#c9d2de" opacity="0.45" />
    <Gildirak cx={78} cy={80} r={19} />
    <Gildirak cx={34} cy={86} r={12} />
  </g>
);

/* ────────────────────────────── velosiped ────────────────────────────── */

export const ChizmaVelosiped = (): JSX.Element => (
  <g>
    <Soya />
    {/* Ramka ichi BO'SH: velosipedni aynan ochiq uchburchak ramka
        taniqli qiladi, to'la shakl esa motorollerga o'xshab ketardi. */}
    <g fill="none" stroke="#3d8ef2" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 78 52 46h22" />
      <path d="M52 46 66 78" />
      <path d="M90 78 74 46" />
      <path d="M66 78H90" />
    </g>
    {/* egar va rul */}
    <rect x="44" y="42" width="15" height="6" rx="3" fill="#3d4a5c" />
    <path d="M74 40h14" stroke="#3d4a5c" strokeWidth="5" strokeLinecap="round" />
    <path d="M80 40v8" stroke="#3d4a5c" strokeWidth="4" strokeLinecap="round" />
    {/* qo'ng'iroq — bosilganda chaladigan tovushning ko'rinishi */}
    <circle cx="88" cy="38" r="4.4" fill="#f5b301" />
    {/* g'ildiraklar: ingichka shina, spitsalar */}
    {[30, 90].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy="78" r="19" fill="none" stroke={GILDIRAK} strokeWidth="4.5" />
        <g stroke="#b9c0cc" strokeWidth="1.6">
          <path d={`M${cx - 13} 65l26 26M${cx + 13} 65l-26 26M${cx} 59v38M${cx - 19} 78h38`} />
        </g>
        <circle cx={cx} cy="78" r="3.4" fill="#8d93a3" />
      </g>
    ))}
  </g>
);

/* ──────────────────────────────── poyezd ──────────────────────────────── */

export const ChizmaPoyezd = (): JSX.Element => (
  <g>
    <Soya />
    {/* relslar — poyezdni "yerdagi" narsadan ajratadi */}
    <rect x="6" y="94" width="108" height="4" rx="2" fill="#9aa3b2" />
    {[12, 32, 52, 72, 92].map((x) => (
      <rect key={x} x={x} y="90" width="6" height="9" rx="2" fill="#b6803f" />
    ))}
    {/* vagon */}
    <rect x="8" y="46" width="42" height="38" rx="6" fill="#4fb8e0" />
    <rect x="14" y="53" width="13" height="14" rx="3" fill={OYNA} />
    <rect x="31" y="53" width="13" height="14" rx="3" fill={OYNA} />
    {/* lokomotiv */}
    <path d="M54 40h34c5 0 9 4 9 9v35H54z" fill="#ee4a41" />
    <rect x="60" y="48" width="30" height="18" rx="4" fill={OYNA} />
    <path d="M54 40h34c5 0 9 4 9 9v2H54z" fill="#fff" opacity="0.25" />
    {/* mo'ri va bug' */}
    <rect x="97" y="52" width="11" height="32" rx="4" fill="#c2352d" />
    <rect x="95" y="46" width="15" height="8" rx="4" fill="#3d4a5c" />
    <circle cx="102" cy="36" r="6" fill="#dfe6f0" opacity="0.75" />
    <circle cx="110" cy="26" r="4.4" fill="#dfe6f0" opacity="0.5" />
    <Gildirak cx={20} cy={86} r={8} />
    <Gildirak cx={42} cy={86} r={8} />
    <Gildirak cx={66} cy={86} r={9} />
    <Gildirak cx={90} cy={86} r={9} />
  </g>
);

/* ─────────────────────────────── samolyot ─────────────────────────────── */

export const ChizmaSamolyot = (): JSX.Element => (
  <g>
    {/* Soya PASTDA va kichik: samolyot yerda emas, HAVODA. Aynan shu
        narsa uni qolgan hamma mashinadan ajratadi. */}
    <ellipse cx="60" cy="106" rx="26" ry="4" fill="#000" opacity="0.1" />
    {/* orqa qanot */}
    <path d="M22 40l16 18-16 6z" fill="#c9d6e8" />
    {/* tana */}
    <path d="M18 56c0-5 4-9 9-9h56c14 0 24 5 30 9-6 4-16 9-30 9H27c-5 0-9-4-9-9z" fill="#f4f7fc" />
    <path d="M18 56c0-5 4-9 9-9h56c14 0 24 5 30 9H18z" fill="#fff" />
    {/* dumaloq illyuminatorlar — samolyotning taniqli belgisi */}
    {[38, 50, 62, 74].map((x) => (
      <circle key={x} cx={x} cy="55" r="3.6" fill={OYNA} />
    ))}
    {/* kabina oynasi */}
    <path d="M96 50c6 2 10 4.4 13 6h-13z" fill={OYNA_SOYA} />
    {/* pastki qanot */}
    <path d="M56 62l-8 26h12l16-26z" fill="#3d8ef2" />
    <path d="M56 62l-4 13h10l8-13z" fill="#5aa0f5" />
    {/* dvigatel */}
    <rect x="54" y="64" width="18" height="9" rx="4.5" fill="#8ea3c4" />
  </g>
);

/* ───────────────────────────────── kema ───────────────────────────────── */

export const ChizmaKema = (): JSX.Element => (
  <g>
    {/* suv — kema yerda turmaydi, shuning uchun soya o'rniga to'lqin */}
    <path d="M4 92c8 0 8-5 16-5s8 5 16 5 8-5 16-5 8 5 16 5 8-5 16-5 8 5 16 5v10H4z"
      fill="#4fb8e0" opacity="0.55" />
    <path d="M4 98c8 0 8-4 16-4s8 4 16 4 8-4 16-4 8 4 16 4 8-4 16-4 8 4 16 4v6H4z"
      fill="#3792c9" opacity="0.45" />
    {/* korpus */}
    <path d="M16 68h88l-10 20c-1.4 2.8-3.6 4-7 4H33c-3.4 0-5.6-1.2-7-4z" fill="#c2352d" />
    <path d="M16 68h88l-3 6H19z" fill="#ee4a41" />
    {/* paluba */}
    <rect x="34" y="46" width="46" height="22" rx="4" fill="#f4f7fc" />
    {[38, 52, 66].map((x) => (
      <rect key={x} x={x} y="52" width="11" height="10" rx="2.5" fill={OYNA} />
    ))}
    <rect x="46" y="30" width="24" height="16" rx="4" fill="#e6ebf5" />
    <rect x="50" y="34" width="16" height="8" rx="2" fill={OYNA} />
    {/* mo'ri */}
    <rect x="80" y="38" width="12" height="30" rx="4" fill="#f5b301" />
    <rect x="80" y="44" width="12" height="6" fill="#2f3d5c" />
    <circle cx="86" cy="30" r="5" fill="#dfe6f0" opacity="0.7" />
    <circle cx="94" cy="21" r="3.6" fill="#dfe6f0" opacity="0.45" />
  </g>
);
