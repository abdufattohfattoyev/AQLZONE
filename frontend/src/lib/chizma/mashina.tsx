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
 * ─────────── UMUMIY TIL ───────────
 *
 *   • 120×120 to'r, hamma narsa markazda
 *   • rang GRADIENT bilan (`chizma/ramka.tsx`): tepasi yorug',
 *     pastki uchdan biri to'q — yorug'lik tepadan tushadi va ko'z
 *     buni tug'ilganidan biladi
 *   • kuzov ostida yupqa to'q CHIZIQ — shakl fonda "suzib" qolmasin
 *   • oyna doim ochiq havorang, g'ildirak doim to'q kulrang: bola bir
 *     marta o'rgansa, hamma mashinada taniydi
 *   • pastda yumshoq, chetiga qarab so'nadigan soya
 *
 * ─────────── TAFSILOT QANCHA KERAK ───────────
 *
 * Har mashinada uchtadan ortiq bo'lmagan "tanish belgi" bor: taksida
 * tomdagi chiroq va shashka, o't o'chirishda narvon va g'altak,
 * traktorda noteng g'ildirak. Undan ko'pi bolaning ko'zini chalg'itadi
 * — u narsani emas, tafsilotni ko'radi.
 */
import type { JSX } from "react";

import { Soya, useBoyoq } from "./ramka";

const OYNA_CHET = "#7fb9d8";
const GILDIRAK = "#2f2e36";
const FAR = "#ffe08a";
const FAR_ORQA = "#ff8a7d";

/**
 * G'ildirak — shina, disk va o'q.
 *
 * Uchta qatlam: qora shina, metall disk (gradient), markazdagi
 * mayda o'q. Ikki qatlamda u yassi "nuqta" bo'lib ko'rinardi.
 */
function Gildirak({ cx, cy, r = 11 }: { cx: number; cy: number; r?: number }) {
  const g = useBoyoq();
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={GILDIRAK} />
      <circle cx={cx} cy={cy} r={r * 0.92} fill="none" stroke="#4a4954" strokeWidth={r * 0.12} />
      <circle cx={cx} cy={cy} r={r * 0.46} fill={g("metall")} />
      <circle cx={cx} cy={cy} r={r * 0.16} fill="#6f7686" />
    </g>
  );
}

/** Kuzov ustidan o'tadigan yorug'lik chizig'i. */
function Yaltir({ d }: { d: string }) {
  const g = useBoyoq();
  return <path d={d} fill={g("yaltir")} />;
}

/* ─────────────── yengil avtomobil (mashina · taksi · politsiya) ───────────────
 *
 * Uchalasi bitta siluetdan foydalanadi va bu ataylab: bola avval
 * SHAKLNI o'rganadi ("bu mashina"), keyin ustidagi belgilar bo'yicha
 * turini ajratadi. Har biriga alohida silüet chizilsa, uchtasi uch xil
 * narsa bo'lib ko'rinardi.
 */
function Sedan({ rang, bezak }: { rang: string; bezak?: JSX.Element }) {
  const g = useBoyoq();
  return (
    <g>
      <Soya cy={100} rx={40} />

      {/* Kuzov: pastki qismi — to'q asos, ustida asosiy shakl. */}
      <path d="M12 76c0-4 3-7 7-7h82c4 0 7 3 7 7v7c0 3.4-2.4 6-6 6H18c-3.6 0-6-2.6-6-6z"
        fill="#00000022" />
      <path d="M14 72c0-9.6 4.4-14 11-16.2l6.4-14.6C33.2 37 36 35 40.4 35h39.2c4.4 0 7.2 2 8.8 6.2L95 55.8
               C101.6 58 106 62.4 106 72v4c0 2.6-2 4.6-4.6 4.6H18.6C16 80.6 14 78.6 14 76z"
        fill={g(rang)} />

      {/* Tomdagi yorug'lik */}
      <Yaltir d="M31.4 41.2C33.2 37 36 35 40.4 35h39.2c4.4 0 7.2 2 8.8 6.2l1.8 4.2H29.6z" />

      {/* Oyna — ikkiga bo'lingan: o'rtadagi ustun mashinani
          "quti" emas, KABINA qilib ko'rsatadi. */}
      <path d="M36 43c1-2.2 2.4-3.2 4.8-3.2h38.4c2.4 0 3.8 1 4.8 3.2l3.8 9.4H32.2z"
        fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M58.4 39.8h3.2v12.6h-3.2z" fill={OYNA_CHET} opacity="0.55" />

      {/* Eshik chizig'i va tutqich — usiz kuzov bir bo'lak plastmassa
          bo'lib ko'rinardi. */}
      <path d="M60 55v20" stroke="#00000026" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="63" y="62" width="8" height="2.6" rx="1.3" fill="#ffffff55" />

      {/* Farlar */}
      <rect x="12" y="62" width="11" height="8" rx="4" fill={FAR} />
      <rect x="97" y="62" width="11" height="8" rx="4" fill={FAR_ORQA} />

      {bezak}

      <Gildirak cx={34} cy={83} />
      <Gildirak cx={86} cy={83} />
    </g>
  );
}

export const ChizmaMashina = (): JSX.Element => <Sedan rang="qizil" />;

export const ChizmaTaksi = (): JSX.Element => (
  <Sedan rang="sariq" bezak={
    <g>
      {/* Tomdagi chiroq — taksini boshqa mashinadan ajratadigan
          yagona belgi. Usiz u shunchaki sariq avtomobil bo'lardi. */}
      <rect x="48" y="23" width="24" height="11" rx="3.5" fill="#2f3d5c" />
      <text x="60" y="31.4" textAnchor="middle" fill="#ffd84d"
        style={{ font: "700 8.5px 'Fredoka', sans-serif", letterSpacing: "0.4px" }}>TAXI</text>
      {/* Yon shashka */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={31 + i * 9.4} y="66" width="4.7" height="4.7"
          fill={i % 2 ? "#2f3d5c" : "#fff"} />
      ))}
    </g>
  } />
);

export const ChizmaPolitsiya = (): JSX.Element => (
  <Sedan rang="siyoh" bezak={
    <g>
      {/* Oq eshik — haqiqiy patrul mashinalaridagidek */}
      <path d="M38 55h44v20H38z" fill="#f0f3f8" opacity="0.92" />
      <path d="M60 55v20" stroke="#00000022" strokeWidth="1.6" />
      {/* Tomdagi chiroq */}
      <rect x="46" y="25" width="28" height="9" rx="4.5" fill="#1f2b45" />
      <rect x="48.5" y="27" width="11" height="5" rx="2.5" fill="#4fb8e0" />
      <rect x="60.5" y="27" width="11" height="5" rx="2.5" fill="#ff5a4d" />
    </g>
  } />
);

/* ──────────────────────────────── avtobus ──────────────────────────────── */

export const ChizmaAvtobus = (): JSX.Element => {
  const g = useBoyoq();
  return (
    <g>
      <Soya cy={100} rx={40} />
      <rect x="11" y="24" width="98" height="62" rx="13" fill={g("oltin")} />
      <Yaltir d="M11 37c0-7.2 5.8-13 13-13h72c7.2 0 13 5.8 13 13v5H11z" />
      {/* Pastdagi to'q tasma — avtobusni "quti" emas, KUZOV qiladi */}
      <path d="M11 74h98v-6H11z" fill="#00000022" />

      {/* Oynalar qatori — avtobusni aynan shu taniqli qiladi */}
      {[18, 40, 62].map((x) => (
        <rect key={x} x={x} y="34" width="18" height="21" rx="4.5"
          fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1.2" />
      ))}
      {/* Eshik — ikki tavaqali */}
      <rect x="84" y="34" width="18" height="40" rx="4" fill={g("oyna")}
        stroke={OYNA_CHET} strokeWidth="1.2" />
      <path d="M93 34v40" stroke={OYNA_CHET} strokeWidth="1.4" />

      <rect x="13" y="64" width="10" height="8" rx="4" fill={FAR} />
      <Gildirak cx={33} cy={86} r={10} />
      <Gildirak cx={87} cy={86} r={10} />
    </g>
  );
};

/* ────────────────────────────── yuk mashinasi ────────────────────────────── */

export const ChizmaYuk = (): JSX.Element => {
  const g = useBoyoq();
  return (
    <g>
      <Soya cy={100} rx={42} />
      {/* Yuk qismi ORQADA va katta — ko'z birinchi shuni ko'radi */}
      <rect x="8" y="32" width="60" height="48" rx="6" fill={g("kulrang")} />
      <rect x="14" y="44" width="48" height="26" rx="3" fill="#00000018" />
      <path d="M8 38c0-3.3 2.7-6 6-6h48c3.3 0 6 2.7 6 6v3H8z" fill="#ffffff33" />

      {/* Kabina */}
      <path d="M68 46h20c4.4 0 7 1.8 8.8 5.6L103 64c5 1.6 7 4.6 7 10v6c0 2.6-2 4.6-4.6 4.6H68z"
        fill={g("kok")} />
      <path d="M74 50h13.4c2.2 0 3.6.9 4.5 2.9l4.6 10H74z"
        fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1.2" strokeLinejoin="round" />
      <Yaltir d="M68 46h20c4.4 0 7 1.8 8.8 5.6l1.2 2.4H68z" />
      <rect x="101" y="64" width="8" height="8" rx="4" fill={FAR} />

      <Gildirak cx={26} cy={84} r={11} />
      <Gildirak cx={52} cy={84} r={11} />
      <Gildirak cx={92} cy={84} r={11} />
    </g>
  );
};

/* ────────────────────────── o't o'chirish mashinasi ────────────────────────── */

export const ChizmaOtOchir = (): JSX.Element => {
  const g = useBoyoq();
  return (
    <g>
      <Soya cy={100} rx={42} />
      {/* Narvon — o't o'chirish mashinasining eng taniqli belgisi */}
      <g stroke="#dfe5ee" strokeWidth="3.6" strokeLinecap="round">
        <path d="M12 34h54M12 27h54" />
        {[18, 29, 40, 51, 62].map((x) => <path key={x} d={`M${x} 27v7`} />)}
      </g>

      <rect x="8" y="38" width="62" height="42" rx="6" fill={g("qizil")} />
      <path d="M8 76h62v-6H8z" fill="#00000022" />
      {/* G'altak */}
      <circle cx="30" cy="58" r="11" fill="#e8e2d4" />
      <circle cx="30" cy="58" r="7" fill="#c9bfa9" />
      <circle cx="30" cy="58" r="3" fill="#8f8878" />

      <path d="M70 44h18c4.4 0 7 1.8 8.8 5.6L103 62c5 1.6 7 4.6 7 10v8c0 2.6-2 4.6-4.6 4.6H70z"
        fill={g("qizil")} />
      <path d="M76 48h12.4c2.2 0 3.6.9 4.5 2.9l4.4 9.6H76z"
        fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1.2" strokeLinejoin="round" />
      {/* Ko'k-qizil chiroq */}
      <rect x="73" y="36" width="24" height="8" rx="4" fill="#22304d" />
      <circle cx="80" cy="40" r="2.8" fill="#4fb8e0" />
      <circle cx="90" cy="40" r="2.8" fill="#ff5a4d" />
      <rect x="102" y="64" width="7" height="8" rx="3.5" fill={FAR} />

      <Gildirak cx={30} cy={84} r={10.5} />
      <Gildirak cx={90} cy={84} r={10.5} />
    </g>
  );
};

/* ─────────────────────────────── tez yordam ─────────────────────────────── */

export const ChizmaTezYordam = (): JSX.Element => {
  const g = useBoyoq();
  return (
    <g>
      <Soya cy={100} rx={42} />
      <rect x="9" y="36" width="60" height="44" rx="7" fill={g("oq")} />
      <path d="M9 74h60v-5H9z" fill="#00000012" />
      {/* Qizil xoch — bola uni "shifokor mashinasi" deb taniydi */}
      <g fill="#ee4a41">
        <rect x="29" y="51" width="19" height="7" rx="2.5" />
        <rect x="35" y="45" width="7" height="19" rx="2.5" />
      </g>
      <rect x="15" y="68" width="48" height="4.4" rx="2.2" fill="#ff8a7d" />

      <path d="M69 44h19c4.4 0 7 1.8 8.8 5.6L103 62c5 1.6 7 4.6 7 10v8c0 2.6-2 4.6-4.6 4.6H69z"
        fill={g("oq")} />
      <path d="M75 48h12.4c2.2 0 3.6.9 4.5 2.9l4.4 9.6H75z"
        fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="73" y="36" width="24" height="8" rx="4" fill="#22304d" />
      <circle cx="80" cy="40" r="2.8" fill="#4fb8e0" />
      <circle cx="90" cy="40" r="2.8" fill="#ff5a4d" />
      <rect x="102" y="64" width="7" height="8" rx="3.5" fill={FAR} />

      <Gildirak cx={30} cy={84} r={10.5} />
      <Gildirak cx={90} cy={84} r={10.5} />
    </g>
  );
};

/* ──────────────────────────────── traktor ──────────────────────────────── */

export const ChizmaTraktor = (): JSX.Element => {
  const g = useBoyoq();
  return (
    <g>
      <Soya cy={102} rx={40} />
      {/* Traktorning butun tanilishi NOTENG g'ildiraklarda: orqasi juda
          katta, oldi kichik. Shu nisbat buzilsa, u oddiy mashina
          bo'lib qoladi. */}
      <rect x="50" y="50" width="44" height="28" rx="7" fill={g("yashil")} />
      <rect x="28" y="58" width="26" height="20" rx="6" fill={g("yashil")} />
      <path d="M28 72h66v-4H28z" fill="#00000022" />

      {/* Kabina */}
      <path d="M56 22h26c3.9 0 7 3.1 7 7v21H49V29c0-3.9 3.1-7 7-7z" fill={g("yashil")} />
      <rect x="55" y="27" width="28" height="18" rx="3.5"
        fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1.2" />

      {/* Mo'ri va tutun */}
      <rect x="38" y="30" width="8" height="28" rx="4" fill="#3d4a5c" />
      <rect x="36" y="27" width="12" height="5" rx="2.5" fill="#2b3547" />
      <circle cx="42" cy="20" r="5" fill="#c9d2de" opacity="0.6" />
      <circle cx="49" cy="12" r="3.6" fill="#c9d2de" opacity="0.4" />

      <Gildirak cx={76} cy={78} r={20} />
      <Gildirak cx={32} cy={86} r={12} />
    </g>
  );
};

/* ────────────────────────────── velosiped ────────────────────────────── */

export const ChizmaVelosiped = (): JSX.Element => (
  <g>
    <Soya cy={100} rx={38} />
    {/* Ramka ichi BO'SH: velosipedni aynan ochiq uchburchak ramka
        taniqli qiladi, to'la shakl esa motorollerga o'xshab ketardi. */}
    <g fill="none" stroke="#3d8ef2" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 76 52 44h22" />
      <path d="M52 44 66 76" />
      <path d="M90 76 74 44" />
      <path d="M66 76H90" />
    </g>
    <g fill="none" stroke="#5aa0f5" strokeWidth="2" strokeLinecap="round">
      <path d="M30 76 52 44h22" />
    </g>

    {/* Egar, rul, pedal */}
    <rect x="43" y="39" width="17" height="6.5" rx="3.2" fill="#3d4a5c" />
    <path d="M73 38h15" stroke="#3d4a5c" strokeWidth="5" strokeLinecap="round" />
    <path d="M80 38v8" stroke="#3d4a5c" strokeWidth="4" strokeLinecap="round" />
    <circle cx="66" cy="76" r="5" fill="#3d4a5c" />
    <rect x="60" y="80" width="12" height="4" rx="2" fill="#2f3d5c" />
    {/* Qo'ng'iroq — bosilganda chaladigan tovushning ko'rinishi */}
    <circle cx="88" cy="36" r="5" fill="#f5b301" />
    <circle cx="86.4" cy="34.4" r="1.6" fill="#fff" opacity="0.7" />

    {/* G'ildiraklar: ingichka shina, spitsalar */}
    {[30, 90].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy="76" r="20" fill="none" stroke="#2f2e36" strokeWidth="5" />
        <circle cx={cx} cy="76" r="20" fill="none" stroke="#4a4954" strokeWidth="1.6" />
        <g stroke="#c3cbd8" strokeWidth="1.5">
          <path d={`M${cx - 14} 62l28 28M${cx + 14} 62l-28 28M${cx} 56v40M${cx - 20} 76h40`} />
        </g>
        <circle cx={cx} cy="76" r="3.6" fill="#8d97a8" />
      </g>
    ))}
  </g>
);

/* ──────────────────────────────── poyezd ──────────────────────────────── */

export const ChizmaPoyezd = (): JSX.Element => {
  const g = useBoyoq();
  return (
    <g>
      {/* Relslar — poyezdni "yerdagi" narsadan ajratadi */}
      <rect x="4" y="93" width="112" height="4.5" rx="2.2" fill="#9aa3b2" />
      {[10, 30, 50, 70, 90, 106].map((x) => (
        <rect key={x} x={x} y="89" width="6" height="10" rx="2" fill="#a9763f" />
      ))}

      {/* Vagon */}
      <rect x="6" y="44" width="42" height="38" rx="6" fill={g("kok")} />
      <rect x="12" y="51" width="13" height="15" rx="3.5"
        fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1.1" />
      <rect x="29" y="51" width="13" height="15" rx="3.5"
        fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1.1" />
      <path d="M6 76h42v-5H6z" fill="#00000022" />

      {/* Lokomotiv */}
      <path d="M52 36h35c5.5 0 10 4.5 10 10v36H52z" fill={g("qizil")} />
      <rect x="58" y="44" width="32" height="19" rx="4.5"
        fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1.2" />
      <Yaltir d="M52 36h35c5.5 0 10 4.5 10 10v2H52z" />
      <path d="M52 76h45v-5H52z" fill="#00000022" />

      {/* Mo'ri va bug' */}
      <rect x="97" y="50" width="12" height="32" rx="4" fill="#c2352d" />
      <rect x="95" y="43" width="16" height="8" rx="4" fill="#3d4a5c" />
      <circle cx="103" cy="33" r="6.5" fill="#e3e9f2" opacity="0.75" />
      <circle cx="112" cy="23" r="4.6" fill="#e3e9f2" opacity="0.5" />

      <Gildirak cx={18} cy={84} r={8.5} />
      <Gildirak cx={40} cy={84} r={8.5} />
      <Gildirak cx={64} cy={84} r={9.5} />
      <Gildirak cx={88} cy={84} r={9.5} />
    </g>
  );
};

/* ─────────────────────────────── samolyot ─────────────────────────────── */

export const ChizmaSamolyot = (): JSX.Element => {
  const g = useBoyoq();
  return (
    <g>
      {/* BULUTLAR — kemadagi to'lqinning aynan o'zi vazifasini
          bajaradi: ular samolyot QAYERDA ekanini aytadi. Usiz kichik
          soya tushunarsiz dog' bo'lib qolardi, samolyot esa yerda
          turgandek ko'rinardi. Rangi ochiq ko'k, oq emas: karta oq va
          oq bulut umuman ko'rinmasdi. */}
      <g fill="#d3e8f8">
        <g opacity="0.9">
          <circle cx="24" cy="26" r="9" />
          <circle cx="35" cy="24" r="11.5" />
          <circle cx="47" cy="27" r="8" />
          <rect x="22" y="26" width="27" height="9" rx="4.5" />
        </g>
        <g opacity="0.65">
          <circle cx="86" cy="94" r="7" />
          <circle cx="96" cy="92" r="9" />
          <rect x="84" y="93" width="21" height="7" rx="3.5" />
        </g>
      </g>

      {/* Soya PASTDA va kichik: samolyot yerda emas, HAVODA. Aynan shu
          narsa uni qolgan hamma mashinadan ajratadi. */}
      <Soya cy={110} rx={20} />

      {/* HAMMASI 12° BURILGAN — burun tepaga qaragan.
          Gorizontal turgan samolyot havoda MUALLAQ osilgandek
          ko'rinardi. Haqiqiy suratda esa u doim ko'tarilib boradi va
          bola aeroportda ham aynan shuni ko'radi: burun tepada. */}
      <g transform="rotate(-12 60 58)">

      {/* ─── DUM ───
          Ikki qism: tepaga qaragan kil va uning ostidagi kichik
          gorizontal qanotcha. Kil uchi ORQAGA og'gan — tik turgani
          bayroqqa o'xshab ketardi.

          Kilda OY va YULDUZ bor — O'zbekiston bayrog'idan. Aynan shu
          narsa samolyotni bolaga "biznikimi?" degan savol
          tug'diradi, va bu yoshda tanish narsa notanishidan kuchli.
          Aviakompaniyaning nomi YOZILMADI: yozuv 168px kartada
          baribir o'qilmaydi, o'qilganda esa u chizma emas, birovning
          belgisi bo'lib qolardi. */}
      <path d="M23 51C27 38 31 27 35.2 20.4c1.6-2.5 4.2-1.9 4.6 1L45 49z" fill={g("moviy")} />
      <path d="M35.2 20.4c1.6-2.5 4.2-1.9 4.6 1L42.4 35l-9.6 1z" fill="#9fe3f5" />
      <path d="M35.8 31.8a5.4 5.4 0 1 0 2.8 9.7 4.4 4.4 0 1 1-2.8-9.7z" fill="#fff" />
      <circle cx="40.6" cy="37.6" r="1.3" fill="#fff" />
      <path d="M28 62 12.6 71.4c-1.7 1-1.2 3 .8 2.6L31 69.4z" fill="#2b9dc4" />

      {/* ─── TANA ───
          Burni O'NGDA va DUMALOQ, dumi chapda ingichka uchga
          keladi. Ilgari tananing ikki uchi ham teng edi va samolyot
          qayoqqa uchayotgani bilinmasdi. */}
      <path d="M13 56c0-4.6 10-9.4 29-11.4L82 43c14.6 0 26 5.8 26 13s-11.4 13-26 13l-40-1.6
               C23 65.4 13 60.6 13 56z"
        fill={g("oq")} />
      {/* Belbog' — pastki tomonda, dum tomon ingichkalashadi. U tanani
          "oq kapsula" emas, AVIALAYNER qilib ko'rsatadi.

          IKKI RANG: moviy, ostida ingichka yashil. Bayroqdagi
          tartib ham shunday (moviy · oq · yashil) va tananing o'zi
          oq bo'lgani uchun uchalasi ham joyida turadi. */}
      <path d="M13 56c0 4.6 10 9.4 29 11.4L82 69c14.6 0 26-5.8 26-13
               c-3.4 5-13.6 8.6-26 8.6l-40-1.9C27 61.2 16.6 58.8 13 56z"
        fill={g("moviy")} />
      <path d="M13 56c0 4.6 10 9.4 29 11.4L82 69c14.6 0 26-5.8 26-13
               c-2 4.2-12.4 7.6-26 7.6l-40-1.7C25.4 62.4 15.4 58.6 13 56z"
        fill={g("yashil")} />

      {/* Illyuminatorlar — qatorda, birdek oraliqda */}
      {[45, 56, 67, 78].map((x) => (
        <circle key={x} cx={x} cy="54" r="3.7" fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1.1" />
      ))}
      {/* Kabina oynasi — burunga yaqin va uning egriligiga ergashadi */}
      <path d="M89 46.6c6.8 1 12.6 3.2 16 6.2l-17.6-.6z" fill={g("oyna")}
        stroke={OYNA_CHET} strokeWidth="1.1" strokeLinejoin="round" />

      {/* ─── QANOT ───
          BITTA qanot. Ilgari ikkitasi bor edi: uzoqdagisi tananing
          ustidan chiqib turardi va ikkita ko'k tasma bo'lib
          ko'rinardi — samolyot "7" raqamiga o'xshab qolgandi.
          Yon tomondan qaraganda esa bir qanot ikkinchisini to'sadi,
          ya'ni bittasi HAQIQATGA ham yaqinroq.

          Ildizi KENG (tanada 28px), uchi tor va YUMALOQ: o'tkir
          burchak bu yoshdagi bolaga "tig'" bo'lib ko'rinadi. */}
      <path d="M62 63 44.6 85.6c-1.6 2-.4 4.6 2.2 4.6h14.4c1.8 0 3.2-.8 4.2-2.2L90 64z"
        fill={g("moviy")} />
      <path d="M62 63 51 77.4l10.6 1.6L76 63.6z" fill="#8adcf2" />

      {/* ─── DVIGATEL ───
          Qanotning OSTIDA va undan OLDINGA chiqib turadi — haqiqiy
          samolyotda ham shunday osilgan. Ilgari u qanotning
          O'RTASIGA chizilgandi va uni ikkiga kesib, "ko'k tasma
          ustidagi quvur" bo'lib ko'rinardi; oldinga chiqarilgani esa
          uni alohida narsa qilib ajratadi.

          Oldida to'q havo olgich halqasi bor: aynan o'sha halqa
          dvigatelni quvurdan ajratib turadi.

          Pilon (dvigatelni qanotga bog'laydigan tayanch) chizilmadi:
          nacellaning tepasi qanotga TEGIB turadi va pilon uning
          ostida butunlay ko'rinmasdi — chizilgani esa qanot ustidagi
          to'q ko'k "yamoq" bo'lib ko'rinardi. */}
      <rect x="60.5" y="74.4" width="19.5" height="8.4" rx="4.2" fill={g("kulrang")} />
      <path d="M65 74.7h14v2.6H64z" fill="#ffffff55" />
      <ellipse cx="79.4" cy="78.6" rx="2.4" ry="4.2" fill="#3d4a5c" />
      <ellipse cx="80" cy="78.6" rx="1.3" ry="2.7" fill="#22304d" />

      </g>
    </g>
  );
};

/* ───────────────────────────────── kema ───────────────────────────────── */

export const ChizmaKema = (): JSX.Element => {
  const g = useBoyoq();
  return (
    <g>
      {/* Suv — kema yerda turmaydi, shuning uchun soya o'rniga to'lqin */}
      <path d="M2 90c8 0 8-5 16-5s8 5 16 5 8-5 16-5 8 5 16 5 8-5 16-5 8 5 16 5 8-5 16-5v14H2z"
        fill="#4fb8e0" opacity="0.5" />
      <path d="M2 97c8 0 8-4 16-4s8 4 16 4 8-4 16-4 8 4 16 4 8-4 16-4 8 4 16 4 8-4 16-4v10H2z"
        fill="#3792c9" opacity="0.45" />

      {/* Korpus */}
      <path d="M14 66h92l-11 21c-1.5 3-3.9 4.3-7.5 4.3H32.5c-3.6 0-6-1.3-7.5-4.3z" fill={g("qizil")} />
      <path d="M14 66h92l-3.2 6.4H17.2z" fill="#ff7a6b" />
      {/* Illyuminatorlar */}
      {[38, 52, 66, 80].map((x) => (
        <circle key={x} cx={x} cy="77" r="3" fill="#ffe08a" />
      ))}

      {/* Paluba */}
      <rect x="32" y="44" width="48" height="22" rx="4" fill={g("oq")} />
      {[36, 50, 64].map((x) => (
        <rect key={x} x={x} y="50" width="11" height="10" rx="2.5"
          fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1" />
      ))}
      <rect x="44" y="27" width="26" height="17" rx="4" fill={g("oq")} />
      <rect x="48" y="31" width="18" height="9" rx="2.5"
        fill={g("oyna")} stroke={OYNA_CHET} strokeWidth="1" />

      {/* Mo'ri */}
      <rect x="82" y="36" width="13" height="30" rx="4" fill={g("oltin")} />
      <rect x="82" y="43" width="13" height="6.5" fill="#2f3d5c" />
      <circle cx="88.5" cy="27" r="5.5" fill="#e3e9f2" opacity="0.7" />
      <circle cx="97" cy="18" r="4" fill="#e3e9f2" opacity="0.45" />
    </g>
  );
};
