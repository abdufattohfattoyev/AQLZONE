/**
 * HAYVONLAR — qo'lda chizilgan SVG rasmlar.
 *
 * ─────────── NEGA HAMMASI "YUZ" ───────────
 *
 * Har bir hayvon BOSH ko'rinishida chizilgan, butun gavda emas. Uch
 * sabab bilan:
 *
 *   TANILISH. Bola hayvonni yuzidan taniydi — quloq, tumshuq, ko'z.
 *   Yon tomondan chizilgan butun gavda kattalar uchun aniqroq, bola
 *   uchun esa "jigarrang shakl" bo'lib qoladi.
 *
 *   O'LCHAM. 120×120 to'rda butun gavda mayda chiqadi va telefon
 *   ekranida tafsilotlar yo'qoladi. Bosh esa butun maydonni egallaydi.
 *
 *   MULOQOT. Yuzda ko'z bor, ko'z esa qaraydi. Bu yoshdagi bola
 *   ekrandagi yuzga JAVOB beradi — u bilan gaplashadi, taqlid qiladi.
 *
 * ─────────── UMUMIY QOIDALAR ───────────
 *
 *   • ko'z doim bir xil: qora doira + ikkita oq yaltiroq. Bu butun
 *     to'plamni bitta rassom chizgandek qiladi
 *   • quloq boshdan OLDIN chiziladi (orqada qoladi)
 *   • har rangda ikki tus: asosiy va to'q soya
 *   • og'iz doim tabassum — bu yoshda hech bir hayvon qo'rqinchli
 *     bo'lmasligi kerak, hatto arslon ham
 */
import type { JSX } from "react";

import { Soya as UmumiySoya } from "./ramka";

/**
 * Boshning ostidagi yumshoq soya.
 *
 * Mashinalarnikidan YUQORIROQ va TORROQ turadi. Sabab: mashina yerda
 * turadi va soyasi uning ostida keng yoyiladi; hayvon esa bu yerda
 * faqat BOSH — u yerda turmaydi. Soyani pastga qo'ysak, bosh havoda
 * osilgandek ko'rinardi va rasm "yopishmagan" bo'lib tuyulardi.
 */
const Soya = () => <UmumiySoya cy={98} rx={26} />;

/**
 * Ko'z — butun to'plamda AYNAN bir xil.
 *
 * Ikkita yaltiroq (katta va kichik) ataylab: bitta yaltiroq ko'zni
 * yassi qiladi, ikkitasi esa unga shakl beradi va "tirik" ko'rsatadi.
 */
const Koz = ({ cx, cy, r = 6 }: { cx: number; cy: number; r?: number }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#2b2723" />
    <circle cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 0.35} fill="#fff" />
    <circle cx={cx + r * 0.32} cy={cy + r * 0.3} r={r * 0.16} fill="#fff" opacity="0.75" />
  </g>
);

/** Tabassum — pastga qaragan yoy. */
const Tabassum = ({ d, w = 3 }: { d: string; w?: number }) => (
  <path d={d} fill="none" stroke="#2b2723" strokeWidth={w} strokeLinecap="round" />
);

/* ────────────────────────────────── it ────────────────────────────────── */

export const ChizmaIt = (): JSX.Element => (
  <g>
    <Soya />
    {/* osilgan quloqlar — itni mushukdan ajratadigan asosiy belgi */}
    <ellipse cx="26" cy="56" rx="13" ry="22" fill="#8a5a34" />
    <ellipse cx="94" cy="56" rx="13" ry="22" fill="#8a5a34" />
    <ellipse cx="26" cy="58" rx="8" ry="16" fill="#6f4526" />
    <ellipse cx="94" cy="58" rx="8" ry="16" fill="#6f4526" />
    <circle cx="60" cy="56" r="34" fill="#b8804f" />
    <path d="M60 22a34 34 0 0 1 34 34H26a34 34 0 0 1 34-34z" fill="#c48f5c" />
    {/* tumshuq */}
    <ellipse cx="60" cy="72" rx="21" ry="16" fill="#f0dcc2" />
    <ellipse cx="60" cy="63" rx="8" ry="6" fill="#2b2723" />
    <Koz cx={47} cy={51} />
    <Koz cx={73} cy={51} />
    <Tabassum d="M52 74c3 4 13 4 16 0" />
    {/* til — itni quvnoq qiladi */}
    <path d="M56 78h8c0 6-2 9-4 9s-4-3-4-9z" fill="#ff8a9a" />
  </g>
);

/* ──────────────────────────────── mushuk ──────────────────────────────── */

export const ChizmaMushuk = (): JSX.Element => (
  <g>
    <Soya />
    {/* uchburchak quloqlar */}
    <path d="M26 46 30 16l24 14z" fill="#9aa3b2" />
    <path d="M94 46 90 16 66 30z" fill="#9aa3b2" />
    <path d="M32 42 34.6 24l14 8z" fill="#ffb4c4" />
    <path d="M88 42 85.4 24l-14 8z" fill="#ffb4c4" />
    <circle cx="60" cy="58" r="33" fill="#aeb7c6" />
    <path d="M60 25a33 33 0 0 1 33 33H27a33 33 0 0 1 33-33z" fill="#bcc4d1" />
    <ellipse cx="60" cy="70" rx="18" ry="13" fill="#e8ecf3" />
    <path d="M60 62l-5 4h10z" fill="#ff8a9a" />
    <Koz cx={46} cy={54} r={6.5} />
    <Koz cx={74} cy={54} r={6.5} />
    <Tabassum d="M53 72c2.5 3.5 5 3.5 7 1M60 73c2 2.5 4.5 2.5 7-1" w={2.6} />
    {/* mo'ylov */}
    <g stroke="#7d8698" strokeWidth="2" strokeLinecap="round">
      <path d="M40 66H22M40 72l-17 5M80 66h18M80 72l17 5" />
    </g>
  </g>
);

/* ───────────────────────────────── sigir ───────────────────────────────── */

export const ChizmaSigir = (): JSX.Element => (
  <g>
    <Soya />
    {/* shoxlar */}
    <path d="M32 30c-8-6-14-4-16 2 6 2 10 6 12 10z" fill="#e8dcc4" />
    <path d="M88 30c8-6 14-4 16 2-6 2-10 6-12 10z" fill="#e8dcc4" />
    {/* quloqlar */}
    <ellipse cx="22" cy="54" rx="12" ry="8" fill="#e8ecf3" />
    <ellipse cx="98" cy="54" rx="12" ry="8" fill="#e8ecf3" />
    <circle cx="60" cy="56" r="34" fill="#f4f7fc" />
    {/* dog'lar — sigirni aynan shu narsa taniqli qiladi */}
    <path d="M34 40c8-6 16-2 14 6s-16 10-18 3 -2-6 4-9z" fill="#3d4a5c" />
    <path d="M84 68c8 2 10 10 3 13s-13-3-12-8 3-6 9-5z" fill="#3d4a5c" />
    <ellipse cx="60" cy="74" rx="23" ry="16" fill="#ffc2cf" />
    <ellipse cx="51" cy="72" rx="4" ry="5" fill="#e08196" />
    <ellipse cx="69" cy="72" rx="4" ry="5" fill="#e08196" />
    <Koz cx={46} cy={50} />
    <Koz cx={74} cy={50} />
    <Tabassum d="M52 82c4 3.5 12 3.5 16 0" />
  </g>
);

/* ────────────────────────────────── qo'y ────────────────────────────────── */

export const ChizmaQoy = (): JSX.Element => (
  <g>
    <Soya />
    {/* jun — bir nechta doira. Bittasi bo'lsa u shunchaki bosh
        bo'lardi; ko'p doira "jun" degan tuyg'u beradi. */}
    {[[36, 40, 16], [60, 32, 18], [84, 40, 16], [30, 60, 15], [90, 60, 15]].map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#f4f7fc" />
    ))}
    <ellipse cx="26" cy="62" rx="10" ry="6.5" fill="#c9d2de" />
    <ellipse cx="94" cy="62" rx="10" ry="6.5" fill="#c9d2de" />
    <ellipse cx="60" cy="66" rx="26" ry="25" fill="#2f3d5c" />
    <ellipse cx="60" cy="70" rx="22" ry="20" fill="#3d4a5c" />
    <Koz cx={50} cy={64} r={5.5} />
    <Koz cx={70} cy={64} r={5.5} />
    <ellipse cx="60" cy="76" rx="7" ry="5" fill="#1f2b45" />
    <Tabassum d="M54 84c3.5 3 9 3 12 0" w={2.6} />
  </g>
);

/* ─────────────────────────────────── ot ─────────────────────────────────── */

export const ChizmaOt = (): JSX.Element => (
  <g>
    <Soya />
    <path d="M40 28l6-14 8 12z" fill="#8a5a34" />
    <path d="M80 28l-6-14-8 12z" fill="#8a5a34" />
    {/* yol — otning taniqli belgisi */}
    <path d="M52 20c-6 8-8 20-6 32l14-4c-2-12 0-22 4-28z" fill="#3d4a5c" />
    {/* uzun bosh — ot yuzi dumaloq emas, CHO'ZIQ */}
    <path d="M46 34h28c8 0 14 6 14 14v18c0 14-8 26-28 26s-28-12-28-26V48c0-8 6-14 14-14z" fill="#a8703f" />
    <path d="M46 34h28c8 0 14 6 14 14v6H32v-6c0-8 6-14 14-14z" fill="#b8804f" />
    <ellipse cx="60" cy="80" rx="17" ry="13" fill="#c99a6b" />
    <ellipse cx="52" cy="78" rx="3.4" ry="4.4" fill="#5a3a20" />
    <ellipse cx="68" cy="78" rx="3.4" ry="4.4" fill="#5a3a20" />
    <Koz cx={45} cy={52} r={5.5} />
    <Koz cx={75} cy={52} r={5.5} />
    <Tabassum d="M54 88c3.5 3 9 3 12 0" w={2.6} />
  </g>
);

/* ──────────────────────────────── tovuq ──────────────────────────────── */

export const ChizmaTovuq = (): JSX.Element => (
  <g>
    <Soya />
    {/* toj */}
    <path d="M46 26c0-6 5-8 7-4 1-5 6-6 8-1 2-4 7-3 7 3v6H46z" fill="#ee4a41" />
    <ellipse cx="60" cy="66" rx="33" ry="34" fill="#f4f7fc" />
    <path d="M60 32a33 34 0 0 1 33 34H27a33 34 0 0 1 33-34z" fill="#fff" />
    {/* qanot */}
    <ellipse cx="30" cy="72" rx="12" ry="17" fill="#e6ebf5" />
    <ellipse cx="90" cy="72" rx="12" ry="17" fill="#e6ebf5" />
    {/* tumshuq */}
    <path d="M60 66l-9 7 9 6 9-6z" fill="#f5b301" />
    <Koz cx={47} cy={58} r={5.5} />
    <Koz cx={73} cy={58} r={5.5} />
    {/* soqol */}
    <ellipse cx="55" cy="82" rx="4" ry="5" fill="#ee4a41" />
    <ellipse cx="65" cy="82" rx="4" ry="5" fill="#ee4a41" />
  </g>
);

/* ──────────────────────────────── xo'roz ──────────────────────────────── */

export const ChizmaXoroz = (): JSX.Element => (
  <g>
    <Soya />
    {/* KATTA toj — xo'rozni tovuqdan aynan shu ajratadi */}
    <path d="M40 28c0-9 7-11 9.6-5 1.4-8 8.4-9 11 -1.4 2.8-7 10-6 10 4v8H40z" fill="#ee4a41" />
    <path d="M40 28c0-9 7-11 9.6-5 1.4-8 8.4-9 11-1.4 2.8-7 10-6 10 4" fill="#ff6b5e" />
    <ellipse cx="58" cy="66" rx="32" ry="33" fill="#b8804f" />
    <path d="M58 33a32 33 0 0 1 32 33H26a32 33 0 0 1 32-33z" fill="#c99a6b" />
    {/* rangli dum */}
    <path d="M88 58c14-10 22-4 20 8-8-2-14 2-16 8z" fill="#3fb865" />
    <path d="M90 70c13-5 19 2 15 12-6-4-12-3-16 2z" fill="#4fb8e0" />
    <path d="M58 66l-10 7 10 6 10-6z" fill="#f5b301" />
    <Koz cx={45} cy={58} r={5.5} />
    <Koz cx={71} cy={58} r={5.5} />
    <ellipse cx="53" cy="82" rx="4" ry="5.5" fill="#ee4a41" />
    <ellipse cx="63" cy="82" rx="4" ry="5.5" fill="#ee4a41" />
  </g>
);

/* ──────────────────────────────── o'rdak ──────────────────────────────── */

export const ChizmaOrdak = (): JSX.Element => (
  <g>
    <Soya />
    <circle cx="60" cy="58" r="33" fill="#f7d34d" />
    <path d="M60 25a33 33 0 0 1 33 33H27a33 33 0 0 1 33-33z" fill="#ffe07a" />
    {/* keng, yassi tumshuq — o'rdakning belgisi */}
    <ellipse cx="60" cy="74" rx="24" ry="12" fill="#f78c25" />
    <ellipse cx="60" cy="70" rx="24" ry="8" fill="#ff9f43" />
    <path d="M50 74h20" stroke="#d9741a" strokeWidth="2" strokeLinecap="round" />
    <Koz cx={47} cy={52} />
    <Koz cx={73} cy={52} />
    {/* boshdagi tuk */}
    <path d="M60 25c-2-8 2-12 6-10-4 3-4 6-2 9z" fill="#e8bd2e" />
  </g>
);

/* ──────────────────────────────── quyon ──────────────────────────────── */

export const ChizmaQuyon = (): JSX.Element => (
  <g>
    <Soya />
    {/* uzun quloqlar — butun rasmning yarmi */}
    <ellipse cx="44" cy="26" rx="10" ry="24" fill="#e6ebf5" />
    <ellipse cx="76" cy="26" rx="10" ry="24" fill="#e6ebf5" />
    <ellipse cx="44" cy="28" rx="5.5" ry="17" fill="#ffb4c4" />
    <ellipse cx="76" cy="28" rx="5.5" ry="17" fill="#ffb4c4" />
    <circle cx="60" cy="66" r="31" fill="#f4f7fc" />
    <path d="M60 35a31 31 0 0 1 31 31H29a31 31 0 0 1 31-31z" fill="#fff" />
    <Koz cx={47} cy={62} r={6} />
    <Koz cx={73} cy={62} r={6} />
    <path d="M60 72l-5 4h10z" fill="#ff8a9a" />
    <Tabassum d="M53 78c2.5 3.5 5 3.5 7 1M60 79c2 2.5 4.5 2.5 7-1" w={2.6} />
    {/* oldingi tishlar — quyonni quvnoq qiladi */}
    <rect x="55" y="84" width="10" height="9" rx="2.5" fill="#fff" stroke="#d7dde7" strokeWidth="1.4" />
    <path d="M60 84v9" stroke="#d7dde7" strokeWidth="1.4" />
  </g>
);

/* ───────────────────────────────── baqa ───────────────────────────────── */

export const ChizmaBaqa = (): JSX.Element => (
  <g>
    <Soya />
    {/* Ko'zlar boshdan CHIQIB turadi — baqaning eng taniqli belgisi */}
    <circle cx="38" cy="36" r="16" fill="#3fb865" />
    <circle cx="82" cy="36" r="16" fill="#3fb865" />
    <circle cx="38" cy="36" r="11" fill="#fff" />
    <circle cx="82" cy="36" r="11" fill="#fff" />
    <Koz cx={38} cy={37} r={6.5} />
    <Koz cx={82} cy={37} r={6.5} />
    <ellipse cx="60" cy="70" rx="38" ry="30" fill="#3fb865" />
    <ellipse cx="60" cy="76" rx="26" ry="18" fill="#8fd86f" />
    <Tabassum d="M36 66c8 14 40 14 48 0" w={3.4} />
    <circle cx="30" cy="60" r="3" fill="#2f8f4d" opacity="0.6" />
    <circle cx="90" cy="62" r="2.6" fill="#2f8f4d" opacity="0.6" />
  </g>
);

/* ───────────────────────────────── ayiq ───────────────────────────────── */

export const ChizmaAyiq = (): JSX.Element => (
  <g>
    <Soya />
    <circle cx="28" cy="34" r="15" fill="#8a5a34" />
    <circle cx="92" cy="34" r="15" fill="#8a5a34" />
    <circle cx="28" cy="34" r="8" fill="#c99a6b" />
    <circle cx="92" cy="34" r="8" fill="#c99a6b" />
    <circle cx="60" cy="62" r="36" fill="#a06f42" />
    <path d="M60 26a36 36 0 0 1 36 36H24a36 36 0 0 1 36-36z" fill="#b8804f" />
    <ellipse cx="60" cy="76" rx="20" ry="15" fill="#e8d3b8" />
    <ellipse cx="60" cy="68" rx="8" ry="6" fill="#2b2723" />
    <Koz cx={46} cy={56} />
    <Koz cx={74} cy={56} />
    <Tabassum d="M52 78c3 4 13 4 16 0" />
  </g>
);

/* ──────────────────────────────── arslon ──────────────────────────────── */

export const ChizmaArslon = (): JSX.Element => (
  <g>
    <Soya />
    {/* yol — 12 ta bo'lak. Arslonni aynan shu taniqli qiladi va
        u boshdan OLDIN chiziladi. */}
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return (
        <circle key={i} cx={60 + Math.cos(a) * 30} cy={62 + Math.sin(a) * 30}
          r="15" fill="#d9821f" />
      );
    })}
    <circle cx="60" cy="62" r="32" fill="#f5b301" />
    <ellipse cx="42" cy="46" rx="8" ry="6" fill="#ffcf5c" />
    <ellipse cx="78" cy="46" rx="8" ry="6" fill="#ffcf5c" />
    <ellipse cx="60" cy="76" rx="19" ry="14" fill="#ffe0a8" />
    <path d="M60 68l-6 5h12z" fill="#2b2723" />
    <Koz cx={47} cy={58} />
    <Koz cx={73} cy={58} />
    <Tabassum d="M53 80c2.6 3.6 5.4 3.6 7 1M60 81c1.6 2.6 4.4 2.6 7-1" w={2.8} />
    <g stroke="#c2761a" strokeWidth="1.8" strokeLinecap="round">
      <path d="M41 78H26M41 84l-14 4M79 78h15M79 84l14 4" />
    </g>
  </g>
);

/* ───────────────────────────────── fil ───────────────────────────────── */

export const ChizmaFil = (): JSX.Element => (
  <g>
    <Soya />
    {/* katta quloqlar — filning yarmi shu */}
    <ellipse cx="24" cy="56" rx="20" ry="26" fill="#9aa3b2" />
    <ellipse cx="96" cy="56" rx="20" ry="26" fill="#9aa3b2" />
    <ellipse cx="26" cy="56" rx="13" ry="18" fill="#b3bccb" />
    <ellipse cx="94" cy="56" rx="13" ry="18" fill="#b3bccb" />
    <circle cx="60" cy="54" r="30" fill="#aeb7c6" />
    <path d="M60 24a30 30 0 0 1 30 30H30a30 30 0 0 1 30-30z" fill="#bcc4d1" />
    {/* xartum */}
    <path d="M52 66h16v18c0 8-3 14-8 14s-8-6-8-14z" fill="#aeb7c6" />
    <path d="M52 82h16" stroke="#8d97a8" strokeWidth="2" />
    <path d="M53 90h14" stroke="#8d97a8" strokeWidth="2" />
    <Koz cx={46} cy={52} r={5.5} />
    <Koz cx={74} cy={52} r={5.5} />
    {/* tishlar */}
    <path d="M44 72c-4 4-4 8-1 10 2-4 4-6 7-7z" fill="#f4f7fc" />
    <path d="M76 72c4 4 4 8 1 10-2-4-4-6-7-7z" fill="#f4f7fc" />
  </g>
);

/* ──────────────────────────────── asalari ──────────────────────────────── */

export const ChizmaAsalari = (): JSX.Element => (
  <g>
    <Soya />
    {/* shaffof qanotlar */}
    <ellipse cx="40" cy="34" rx="18" ry="12" fill="#dff1fb" opacity="0.9"
      transform="rotate(-24 40 34)" />
    <ellipse cx="80" cy="34" rx="18" ry="12" fill="#dff1fb" opacity="0.9"
      transform="rotate(24 80 34)" />
    {/* tana — sariq va qora chiziqlar */}
    <ellipse cx="60" cy="66" rx="32" ry="27" fill="#f5b301" />
    <path d="M44 44c10 14 12 30 6 44-4-3-7-7-9-11-3-10-2-22 3-33z" fill="#2b2723" />
    <path d="M68 42c10 14 12 32 6 46 4-3 8-8 10-14 2-10 0-22-6-32z" fill="#2b2723" />
    {/* mo'ylovlar */}
    <path d="M50 42c-4-8-8-10-12-9" stroke="#2b2723" strokeWidth="2.6"
      fill="none" strokeLinecap="round" />
    <path d="M70 42c4-8 8-10 12-9" stroke="#2b2723" strokeWidth="2.6"
      fill="none" strokeLinecap="round" />
    <circle cx="37" cy="32" r="3.4" fill="#2b2723" />
    <circle cx="83" cy="32" r="3.4" fill="#2b2723" />
    <Koz cx={50} cy={60} r={5.5} />
    <Koz cx={70} cy={60} r={5.5} />
    <Tabassum d="M54 74c3.5 3 9 3 12 0" w={2.6} />
  </g>
);
