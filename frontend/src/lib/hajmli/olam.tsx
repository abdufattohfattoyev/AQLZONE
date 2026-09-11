/**
 * SANALADIGAN NARSALAR — hayvon, meva, mashina, ob-havo.
 *
 * Bular `hajmli/ilova.tsx` dagilardan boshqa ish qiladi. U yerdagilar
 * ilovaning tili (tanga, kubok, to'g'ri javob belgisi), bu yerdagilar
 * esa mashqning MAZMUNI: "uchta olma va ikkita olma — nechta?".
 *
 * ─────────────── SHU SABAB SILUET MUHIM ───────────────
 *
 * Bola bu belgilarni O'QIMAYDI, SANAYDI. Ya'ni ular bir-biridan
 * uzoqdan va kichkina holda ham farq qilishi kerak. Shuning uchun
 * har hayvonning o'z tanigan shakli bor: quyonda uzun quloq, filda
 * xartum, jirafada uzun bo'yin. Faqat rangi bilan farq qiladigan
 * ikkita dumaloq bosh ikkita boshqa hayvon bo'la olmaydi.
 *
 * Chizish qoidalari `lib/hajmli.tsx` dagi izohda.
 */
import type { Belgi, Yuz } from "../hajmli";

const soya = (y: Yuz, rx = 11, cy = 35.6, o = 0.3) => (
  <ellipse cx="20" cy={cy} rx={rx} ry={rx * 0.21} fill="#000" opacity={o} filter={y.b} />
);
const yalt = (cx: number, cy: number, rx: number, ry: number, a = 0, o = 0.34) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity={o}
    transform={a ? `rotate(${a} ${cx} ${cy})` : undefined} />
);
/** Hayvon ko'zi — oq gardish bilan. Qora nuqta yolg'iz turganda
    hayvon "o'lik" ko'rinadi; aks etgan yorug'lik uni tiriltiradi. */
const koz = (cx: number, cy: number, r = 2.2) => (<>
  <circle cx={cx} cy={cy} r={r} fill="#33261c" />
  <circle cx={cx - r * 0.3} cy={cy - r * 0.34} r={r * 0.38} fill="#fff" opacity=".9" />
</>);

export const OLAM = {

  /* ══════════════ hayvonlar ══════════════ */

  it: {
    rang: "jigar", jon: "az-sakra", davom: "2.4s", emoji: ["🐶", "🐕"],
    chiz: (y) => (<>
      {soya(y, 11.5, 36)}
      <ellipse cx="7" cy="15.4" rx="5.2" ry="8" fill={y.s} />
      <ellipse cx="33" cy="15.4" rx="5.2" ry="8" fill={y.s} />
      <circle cx="20" cy="19.4" r="14" fill={y.r} />
      <ellipse cx="20" cy="25.6" rx="8" ry="6.4" fill="#f6e3cc" />
      {koz(14.4, 16.6)}{koz(25.6, 16.6)}
      <ellipse cx="20" cy="23.4" rx="3" ry="2.4" fill="#33261c" />
      <path d="M20 25.8v2.8M16.4 30.4c2.2 1.7 5 1.7 7.2 0" stroke="#33261c"
        strokeWidth="1.7" fill="none" strokeLinecap="round" />
      {yalt(13.4, 12, 3.6, 2.2, -30, 0.28)}
    </>),
  },

  mushuk: {
    rang: "kumush", jon: "az-sakra", davom: "2.6s", emoji: ["🐱", "🐈"],
    chiz: (y) => (<>
      {soya(y, 11.5, 36)}
      <path d="M5.4 4.4l4.6 11L17 10.4zM34.6 4.4L30 15.4 23 10.4z" fill={y.v} />
      <path d="M7.6 8.4l2.6 6.2 3.8-2.8zM32.4 8.4l-2.6 6.2-3.8-2.8z" fill="#ffbfc8" />
      <circle cx="20" cy="21.4" r="14" fill={y.r} />
      {koz(14.4, 18.6, 2.6)}{koz(25.6, 18.6, 2.6)}
      <path d="M20 24.4l-2.4 1.8M20 24.4l2.4 1.8" stroke="#33261c"
        strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="23.4" rx="1.8" ry="1.3" fill="#e08a9a" />
      <path d="M2 20h7M2 24.4h7M38 20h-7M38 24.4h-7" stroke="#b6c5d0"
        strokeWidth="1.3" strokeLinecap="round" />
      {yalt(13.4, 14.4, 3.6, 2.2, -30, 0.3)}
    </>),
  },

  sichqon: {
    rang: "kumush", jon: "az-qadam", davom: "1.8s", emoji: ["🐭", "🐁"],
    chiz: (y) => (<>
      {soya(y, 10.5, 36)}
      <circle cx="7.4" cy="11.4" r="6.6" fill={y.v} />
      <circle cx="32.6" cy="11.4" r="6.6" fill={y.v} />
      <circle cx="7.4" cy="11.4" r="3.8" fill="#ffbfc8" />
      <circle cx="32.6" cy="11.4" r="3.8" fill="#ffbfc8" />
      <circle cx="20" cy="22.4" r="12.8" fill={y.r} />
      {koz(15, 20)}{koz(25, 20)}
      <ellipse cx="20" cy="26.4" rx="2.4" ry="1.8" fill="#e08a9a" />
      <path d="M4 24h6M36 24h-6" stroke="#b6c5d0" strokeWidth="1.2" strokeLinecap="round" />
      {yalt(14.4, 16.6, 3.2, 2, -30, 0.3)}
    </>),
  },

  quyon: {
    rang: "kumush", jon: "az-sakra", davom: "1.7s", emoji: ["🐰", "🐇"],
    chiz: (y) => (<>
      {soya(y, 10, 36.4)}
      <ellipse cx="13.4" cy="10" rx="4" ry="9.4" fill={y.v} transform="rotate(-10 13.4 10)" />
      <ellipse cx="26.6" cy="10" rx="4" ry="9.4" fill={y.v} transform="rotate(10 26.6 10)" />
      <ellipse cx="13.6" cy="10.4" rx="2" ry="6.4" fill="#ffbfc8" transform="rotate(-10 13.6 10.4)" />
      <ellipse cx="26.4" cy="10.4" rx="2" ry="6.4" fill="#ffbfc8" transform="rotate(10 26.4 10.4)" />
      <circle cx="20" cy="25.4" r="12" fill={y.r} />
      {koz(15.4, 23.4)}{koz(24.6, 23.4)}
      <ellipse cx="20" cy="27.6" rx="2.2" ry="1.6" fill="#e08a9a" />
      <path d="M20 29.2v1.8" stroke="#33261c" strokeWidth="1.4" strokeLinecap="round" />
      {yalt(15, 20.4, 3.2, 2, -30, 0.3)}
    </>),
  },

  ayiq: {
    rang: "jigar", jon: "az-qadam", davom: "2.6s", emoji: ["🐻"],
    chiz: (y) => (<>
      {soya(y, 12, 36)}
      <circle cx="8" cy="10.4" r="6.2" fill={y.v} />
      <circle cx="32" cy="10.4" r="6.2" fill={y.v} />
      <circle cx="8" cy="10.4" r="3.2" fill="#c49a72" />
      <circle cx="32" cy="10.4" r="3.2" fill="#c49a72" />
      <circle cx="20" cy="21.4" r="14.2" fill={y.r} />
      <ellipse cx="20" cy="26.4" rx="7.4" ry="5.8" fill="#e5c9a8" />
      {koz(14.6, 18.4)}{koz(25.4, 18.4)}
      <ellipse cx="20" cy="24" rx="3" ry="2.3" fill="#33261c" />
      <path d="M20 26.3v2.4M16.6 30c2.2 1.6 4.6 1.6 6.8 0" stroke="#33261c"
        strokeWidth="1.7" fill="none" strokeLinecap="round" />
      {yalt(13.4, 14.4, 3.6, 2.2, -30, 0.28)}
    </>),
  },

  arslon: {
    rang: "sariq", jon: "az-nafas", davom: "2.6s", emoji: ["🦁"],
    chiz: (y) => (<>
      {soya(y, 12, 36)}
      {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => (
        <ellipse key={a} cx="20" cy="6.6" rx="5" ry="6.2" fill="#d98f28"
          transform={`rotate(${a} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="11.4" fill={y.r} />
      <ellipse cx="20" cy="24.4" rx="6.4" ry="4.8" fill="#ffe8bd" />
      {koz(15.6, 18)}{koz(24.4, 18)}
      <path d="M20 22.6l-2.2 1.6M20 22.6l2.2 1.6" stroke="#5a3f00"
        strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M16.4 27.4c2.2 1.8 5 1.8 7.2 0" stroke="#5a3f00"
        strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </>),
  },

  tulki: {
    rang: "olov", jon: "az-qadam", davom: "2.4s", emoji: ["🦊"],
    chiz: (y) => (<>
      {soya(y, 11.5, 36)}
      <path d="M4.4 5.4l7.6 8.2h16l7.6-8.2 1.2 12.6C36.8 26.6 29.4 33 20 33S3.2 26.6 3.2 18z"
        fill={y.r} />
      <path d="M4.4 5.4l7.6 8.2-4.6 2.8zM35.6 5.4L28 13.6l4.6 2.8z" fill="#5a3a22" opacity=".55" />
      <path d="M20 21.4l-6.8 3.4c1.6 3.6 4 5.4 6.8 5.4s5.2-1.8 6.8-5.4z" fill="#fff5e8" />
      {koz(14.2, 17.6)}{koz(25.8, 17.6)}
      <ellipse cx="20" cy="23.4" rx="2.2" ry="1.7" fill="#33261c" />
      {yalt(13.4, 12.4, 3.4, 2.2, -30, 0.3)}
    </>),
  },

  sigir: {
    rang: "kumush", jon: "az-qadam", davom: "2.8s", emoji: ["🐮", "🐄"],
    chiz: (y) => (<>
      {soya(y, 12, 36)}
      <path d="M4 11.4C1.8 8.2 4.4 4.6 8 5.6c2.6.8 4.2 3.4 4.4 6.2zM36 11.4c2.2-3.2-.4-6.8-4-5.8-2.6.8-4.2 3.4-4.4 6.2z"
        fill="#e8e2d4" />
      <circle cx="20" cy="20.4" r="14.2" fill={y.r} />
      <ellipse cx="12" cy="14" rx="4.4" ry="3.4" fill="#4a4238" opacity=".55" />
      <ellipse cx="28.8" cy="24" rx="3.4" ry="2.6" fill="#4a4238" opacity=".4" />
      <ellipse cx="20" cy="26.6" rx="8.4" ry="6.2" fill="#ffc9cf" />
      {koz(14.6, 17)}{koz(25.4, 17)}
      <ellipse cx="16.6" cy="26" rx="1.7" ry="1.3" fill="#c9707e" />
      <ellipse cx="23.4" cy="26" rx="1.7" ry="1.3" fill="#c9707e" />
      {yalt(13.4, 13.4, 3.4, 2, -30, 0.26)}
    </>),
  },

  ot: {
    rang: "jigar", jon: "az-qadam", davom: "2.2s", emoji: ["🐴", "🐎"],
    chiz: (y) => (<>
      {soya(y, 9, 36.6)}
      <path d="M10.4 6.4l2.6 8.4M28.6 5.8l-3 8.6" stroke={y.v}
        strokeWidth="3.4" strokeLinecap="round" />
      <path d="M11.4 13.4h17.2v8.2c0 6.6-3.6 12.2-8.6 12.2s-8.6-5.6-8.6-12.2z" fill={y.r} />
      <path d="M11.4 13.4h5c-1 4-1.4 8-1.4 12 0 3.4.6 6.4 1.6 8.6-3.4-1.6-5.2-6.4-5.2-12.4z"
        fill="#fff" opacity=".18" />
      <ellipse cx="20" cy="29.4" rx="4.6" ry="4" fill="#d8b48c" />
      {koz(15, 19.4)}{koz(25, 19.4)}
      <circle cx="18.2" cy="29" r="1.1" fill="#33261c" />
      <circle cx="21.8" cy="29" r="1.1" fill="#33261c" />
    </>),
  },

  qoy: {
    rang: "kumush", jon: "az-qadam", davom: "3s", emoji: ["🐑", "🐏"],
    chiz: (y) => (<>
      {soya(y, 11, 36)}
      <circle cx="9.4" cy="15" r="6" fill="#f4f6f8" />
      <circle cx="30.6" cy="15" r="6" fill="#f4f6f8" />
      <circle cx="12.6" cy="9" r="6" fill="#f4f6f8" />
      <circle cx="27.4" cy="9" r="6" fill="#f4f6f8" />
      <circle cx="20" cy="11.4" r="7" fill="#fdfefe" />
      <ellipse cx="20" cy="24.4" rx="8.4" ry="9.4" fill={y.r} />
      {koz(16.4, 22.4)}{koz(23.6, 22.4)}
      <ellipse cx="20" cy="27.4" rx="2.2" ry="1.6" fill="#33261c" />
      {yalt(15.6, 6.6, 3, 1.8, -22, 0.55)}
    </>),
  },

  tovuq: {
    rang: "kumush", jon: "az-qadam", davom: "2s", emoji: ["🐔"],
    chiz: (y) => (<>
      {soya(y, 9, 36.4)}
      <path d="M14.6 8c0-2.6 2.2-3.8 3.6-2.4.8-2.4 3.2-2.4 4 0 1.6-1.4 3.6 0 3.6 2.4z" fill="#ff6b5b" />
      <ellipse cx="20" cy="22" rx="12.2" ry="13.4" fill={y.r} />
      {koz(15.4, 18.4)}{koz(24.6, 18.4)}
      <path d="M20 21.6l4.6 2.8-4.6 2.8z" fill="#ffb300" />
      <path d="M17 29.4c-.6 1.6-.4 3 .6 4" stroke="#ff6b5b" strokeWidth="1.6"
        fill="none" strokeLinecap="round" />
      {yalt(14.4, 15, 3.4, 2.2, -30, 0.3)}
    </>),
  },

  xoroz: {
    rang: "qizil", jon: "az-qadam", davom: "2.2s", emoji: ["🐓"],
    chiz: (y) => (<>
      {soya(y, 9, 36.4)}
      <path d="M12.6 8.4c0-3 2.6-4.2 4-2.4 1-2.8 4-2.8 5 0 1.8-1.6 4.2 0 4.2 2.4z" fill="#ff5a48" />
      <ellipse cx="20" cy="22.4" rx="12" ry="13" fill={y.r} />
      {koz(15.4, 19)}{koz(24.6, 19)}
      <path d="M20 22l5 3-5 3z" fill="#ffb300" />
      <path d="M16.6 30c-.8 2-.4 3.6.8 4.6" stroke="#ff5a48" strokeWidth="1.8"
        fill="none" strokeLinecap="round" />
      {yalt(14.4, 15.6, 3.4, 2.2, -30, 0.28)}
    </>),
  },

  qurbaqa: {
    rang: "yashil", jon: "az-sakra", davom: "1.6s", emoji: ["🐸"],
    chiz: (y) => (<>
      {soya(y, 13, 35.4)}
      <circle cx="10.6" cy="11.4" r="6.6" fill={y.v} />
      <circle cx="29.4" cy="11.4" r="6.6" fill={y.v} />
      <circle cx="10.6" cy="11.4" r="3.4" fill="#fff" />
      <circle cx="29.4" cy="11.4" r="3.4" fill="#fff" />
      <circle cx="10.6" cy="11.4" r="1.7" fill="#1e3a22" />
      <circle cx="29.4" cy="11.4" r="1.7" fill="#1e3a22" />
      <path d="M3.4 19.4h33.2c0 8-6.6 14.4-16.6 14.4S3.4 27.4 3.4 19.4z" fill={y.r} />
      <path d="M11.4 26c5 3.4 12.2 3.4 17.2 0" stroke="var(--bd)"
        strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".55" />
      {yalt(11, 21.4, 4, 2, -12, 0.26)}
    </>),
  },

  chochqa: {
    rang: "qizil", jon: "az-qadam", davom: "2.4s", emoji: ["🐷", "🐖"],
    chiz: (y) => (<>
      {soya(y, 12, 36)}
      <path d="M5.4 8l4.6 8M34.6 8l-4.6 8" stroke={y.v} strokeWidth="5" strokeLinecap="round" />
      <circle cx="20" cy="21.4" r="14.2" fill={y.r} />
      <ellipse cx="20" cy="25.6" rx="6.6" ry="5.2" fill="#ffc0cb" />
      {koz(14.6, 18)}{koz(25.4, 18)}
      <ellipse cx="17.6" cy="25.4" rx="1.5" ry="2" fill="#d4707e" />
      <ellipse cx="22.4" cy="25.4" rx="1.5" ry="2" fill="#d4707e" />
      {yalt(13.4, 14.4, 3.6, 2.2, -30, 0.3)}
    </>),
  },

  maymun: {
    rang: "jigar", jon: "az-sakra", davom: "2.2s", emoji: ["🐵", "🐒"],
    chiz: (y) => (<>
      {soya(y, 11.5, 36)}
      <circle cx="6" cy="19.4" r="6" fill={y.v} />
      <circle cx="34" cy="19.4" r="6" fill={y.v} />
      <circle cx="6" cy="19.4" r="3.4" fill="#e8b98e" />
      <circle cx="34" cy="19.4" r="3.4" fill="#e8b98e" />
      <circle cx="20" cy="20.4" r="14" fill={y.r} />
      <ellipse cx="20" cy="25" rx="9.4" ry="8" fill="#f2d3ae" />
      {koz(15.4, 18.4)}{koz(24.6, 18.4)}
      <ellipse cx="18.2" cy="24.4" rx="1" ry="1.4" fill="#5a3a22" />
      <ellipse cx="21.8" cy="24.4" rx="1" ry="1.4" fill="#5a3a22" />
      <path d="M16.4 28.4c2.2 1.8 5 1.8 7.2 0" stroke="#5a3a22"
        strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {yalt(13.4, 13.4, 3.4, 2.2, -30, 0.28)}
    </>),
  },

  echki: {
    rang: "kumush", jon: "az-qadam", davom: "2.6s", emoji: ["🐐"],
    chiz: (y) => (<>
      {soya(y, 9, 36.6)}
      <path d="M11.4 7.4C7.4 4 3.4 6 4.4 9.8c.8 3 4 4.2 7.4 3.8zM28.6 7.4c4-3.4 8-1.4 7 2.4-.8 3-4 4.2-7.4 3.8z"
        fill="#d8d2c4" />
      <path d="M11.6 13h16.8v8.4c0 5.8-3.4 10.6-8.4 10.6s-8.4-4.8-8.4-10.6z" fill={y.r} />
      {koz(15.4, 19)}{koz(24.6, 19)}
      <ellipse cx="20" cy="27" rx="3" ry="2.4" fill="#e8e2d4" />
      <path d="M20 32v5l-2.6-2.4zM20 32v5l2.6-2.4z" fill="#e8e2d4" />
      {yalt(14.6, 17, 2.8, 2, -26, 0.3)}
    </>),
  },

  zebra: {
    rang: "kumush", jon: "az-qadam", davom: "2.8s", emoji: ["🦓"],
    chiz: (y) => (<>
      {soya(y, 9, 36.6)}
      <path d="M10.4 6.4l2.6 8M29.6 6.4l-2.6 8" stroke="#2e3438" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M11.4 13.4h17.2v8.2c0 6.6-3.6 12.2-8.6 12.2s-8.6-5.6-8.6-12.2z" fill="#f4f6f8" />
      <path d="M14.6 14.4v5.6M20 14v6.4M25.4 14.4v5.6M13.4 24.4h4M22.6 24.4h4"
        stroke="#2e3438" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="20" cy="29.6" rx="4.4" ry="3.8" fill="#4a5258" />
      {koz(15.4, 21.6, 2)}{koz(24.6, 21.6, 2)}
    </>),
  },

  jirafa: {
    rang: "sariq", jon: "az-chayqal", davom: "3.2s", emoji: ["🦒"],
    chiz: (y) => (<>
      {soya(y, 8, 36.6, 0.24)}
      <path d="M16 36V17.4a6.6 6.6 0 0113.2 0v3" stroke={y.v}
        strokeWidth="6.6" fill="none" strokeLinecap="round" />
      <circle cx="13.4" cy="24" r="2.4" fill="#b5731e" opacity=".65" />
      <circle cx="17.4" cy="31.4" r="2.2" fill="#b5731e" opacity=".65" />
      <circle cx="19.4" cy="19.4" r="2" fill="#b5731e" opacity=".55" />
      <path d="M26 8.4l-1.4-4M32 8.4l1.4-4" stroke={y.v} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="25.6" cy="5" r="1.8" fill="#8a5a12" />
      <circle cx="32.4" cy="5" r="1.8" fill="#8a5a12" />
      <circle cx="29" cy="12" r="7" fill={y.r} />
      <ellipse cx="31" cy="15.4" rx="4" ry="3.2" fill="#e8c78e" />
      {koz(26.4, 10.4, 2)}
      <circle cx="30.4" cy="15" r="1" fill="#33261c" />
      <circle cx="32.6" cy="15.6" r="1" fill="#33261c" />
    </>),
  },

  fil: {
    rang: "kumush", jon: "az-qadam", davom: "3.2s", emoji: ["🐘"],
    chiz: (y) => (<>
      {soya(y, 13, 36)}
      <ellipse cx="6.4" cy="17.4" rx="6.4" ry="8.6" fill={y.v} />
      <ellipse cx="33.6" cy="17.4" rx="6.4" ry="8.6" fill={y.v} />
      <ellipse cx="7.4" cy="17.4" rx="3.6" ry="5.4" fill="#c9b9b0" opacity=".7" />
      <ellipse cx="32.6" cy="17.4" rx="3.6" ry="5.4" fill="#c9b9b0" opacity=".7" />
      <path d="M10.4 13.4h19.2v9.2c0 4.2-2 7.4-5 8.4V36a2.4 2.4 0 11-4.8 0v-4.8c-5.4-.8-9.4-4.4-9.4-8.6z"
        fill={y.r} />
      {koz(15, 18.4)}{koz(25, 18.4)}
      <path d="M16 27.4h3M21 27.4h3" stroke="#fff" strokeWidth="2.4"
        strokeLinecap="round" opacity=".7" />
      {yalt(14.4, 15, 3.2, 2, -30, 0.26)}
    </>),
  },

  baliq: {
    rang: "zangori", jon: "az-suzish", davom: "2.4s", emoji: ["🐟", "🐠"],
    chiz: (y) => (<>
      <path d="M25 20c0 6.6-5.6 12-12.4 12S1 26.6 1 20 6.6 8 12.6 8 25 13.4 25 20z" fill={y.r} />
      <path d="M24 20l15-9v18z" fill={y.v} />
      <path d="M13 13c3 4.4 3 9.6 0 14" stroke="#fff" strokeWidth="1.8"
        fill="none" opacity=".4" strokeLinecap="round" />
      <path d="M17.4 15.4c2 2.8 2 6.4 0 9.2" stroke="#fff" strokeWidth="1.6"
        fill="none" opacity=".3" strokeLinecap="round" />
      {koz(8.4, 17, 2.4)}
      {yalt(8, 12.4, 3.4, 1.8, -24, 0.4)}
    </>),
  },

  ari: {
    rang: "sariq", jon: "az-uch", davom: "1.2s", emoji: ["🐝"],
    chiz: (y) => (<>
      <ellipse cx="11.4" cy="11" rx="7.4" ry="4.6" fill="#dff2fb"
        opacity=".8" transform="rotate(-26 11.4 11)" />
      <ellipse cx="28.6" cy="11" rx="7.4" ry="4.6" fill="#dff2fb"
        opacity=".8" transform="rotate(26 28.6 11)" />
      <ellipse cx="20" cy="23.4" rx="10.4" ry="12.4" fill={y.r} />
      <path d="M10.4 18.4h19.2M9.8 24h20.4M12.4 29.6h15.2" stroke="#3a2d0a"
        strokeWidth="3.2" strokeLinecap="round" />
      {koz(16.4, 15.4, 1.8)}{koz(23.6, 15.4, 1.8)}
      <path d="M17 8.4l-1.6-3.4M23 8.4l1.6-3.4" stroke="#3a2d0a"
        strokeWidth="1.6" strokeLinecap="round" />
    </>),
  },

  qongiz: {
    rang: "qizil", jon: "az-qadam", davom: "2s", emoji: ["🐞"],
    chiz: (y) => (<>
      {soya(y, 12, 36)}
      <circle cx="20" cy="21.4" r="15" fill={y.r} />
      <path d="M20 6.4a15 15 0 00-10.6 4.4h21.2A15 15 0 0020 6.4z" fill="#2e2a26" />
      <path d="M20 6.4v30" stroke="#2e2a26" strokeWidth="2.2" />
      <circle cx="13" cy="17.4" r="2.6" fill="#2e2a26" />
      <circle cx="27" cy="17.4" r="2.6" fill="#2e2a26" />
      <circle cx="14.4" cy="27.4" r="2.2" fill="#2e2a26" />
      <circle cx="25.6" cy="27.4" r="2.2" fill="#2e2a26" />
      <circle cx="15.4" cy="9.4" r="1.4" fill="#fff" />
      <circle cx="24.6" cy="9.4" r="1.4" fill="#fff" />
      {yalt(13.4, 14.4, 3.4, 2, -30, 0.3)}
    </>),
  },

  ordak: {
    rang: "yashil", jon: "az-suzish", davom: "2.6s", emoji: ["🦆"],
    chiz: (y) => (<>
      <path d="M5 27h22a8.6 8.6 0 000-17.2h-2.4V7.4a4.8 4.8 0 00-9.6 0v6.4C9.6 15 5 19.8 5 27z"
        fill={y.r} />
      <path d="M10.4 8.4H4l3.8 3.4 3.4-1.2z" fill="#ffb300" />
      {koz(17, 8, 1.8)}
      <path d="M3 30h24" stroke="#4fb8e0" strokeWidth="2.8" strokeLinecap="round" opacity=".6" />
      <path d="M6 34h18" stroke="#4fb8e0" strokeWidth="2.4" strokeLinecap="round" opacity=".4" />
      {yalt(19, 5.4, 2.4, 1.6, -20, 0.3)}
    </>),
  },

  joja: {
    rang: "sariq", jon: "az-sakra", davom: "1.5s", emoji: ["🐤", "🐥"],
    chiz: (y) => (<>
      {soya(y, 9, 36.4)}
      <ellipse cx="20" cy="22" rx="12.4" ry="13" fill={y.r} />
      {koz(15.6, 18.4)}{koz(24.4, 18.4)}
      <path d="M20 21.6l4.4 2.6-4.4 2.6z" fill="#ffb300" />
      <path d="M17.6 8.4c0-2 3-2 3 0" stroke={y.v} strokeWidth="2.4"
        fill="none" strokeLinecap="round" />
      <path d="M16.6 34.4l-1.6 2.4M23.4 34.4l1.6 2.4" stroke="#ffb300"
        strokeWidth="1.8" strokeLinecap="round" />
      {yalt(14.6, 15, 3.4, 2.2, -30, 0.32)}
    </>),
  },

  ilon: {
    rang: "yashil", jon: "az-chayqal", davom: "3s", emoji: ["🐍"],
    chiz: (y) => (<>
      <path d="M8 33c9.6 0 9.6-7.4 19.2-7.4 6 0 6-8.4 0-8.4-9.6 0-9.6-7.4-19.2-7.4"
        stroke={y.v} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M8 33c9.6 0 9.6-7.4 19.2-7.4" stroke="#fff" strokeWidth="1.6"
        fill="none" strokeLinecap="round" opacity=".28" />
      <circle cx="8.4" cy="9.8" r="5.4" fill={y.r} />
      {koz(6.8, 8.4, 1.8)}
      <path d="M4 11.6L.6 10.4M4 11.6L1 13.8" stroke="#ff6b5b"
        strokeWidth="1.5" strokeLinecap="round" />
    </>),
  },

  qurt: {
    rang: "yashil", jon: "az-qadam", davom: "1.6s", emoji: ["🐛", "🐌"],
    chiz: (y) => (<>
      {soya(y, 13, 34.4, 0.22)}
      <circle cx="31" cy="16.4" r="7.4" fill={y.r} />
      <circle cx="21.4" cy="21" r="7.4" fill={y.v} />
      <circle cx="12.6" cy="25.4" r="6.6" fill={y.v} opacity=".88" />
      <circle cx="5.4" cy="28.6" r="5" fill={y.v} opacity=".78" />
      <path d="M28.4 9.6l-1.8-4.2M34 9.4l2-3.8" stroke={y.v}
        strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="26.2" cy="4.6" r="1.6" fill="#2b6b3a" />
      <circle cx="36.4" cy="4.8" r="1.6" fill="#2b6b3a" />
      {koz(32.6, 14.4, 2)}
      {yalt(28, 12.4, 2.6, 1.6, -30, 0.3)}
    </>),
  },

  chumoli: {
    rang: "jigar", jon: "az-qadam", davom: "1.4s", emoji: ["🐜"],
    chiz: (y) => (<>
      {soya(y, 12, 34.4, 0.22)}
      <ellipse cx="30.4" cy="20" rx="8" ry="7" fill={y.r} />
      <circle cx="20" cy="20" r="5" fill={y.v} />
      <circle cx="9.4" cy="20" r="6.6" fill={y.r} />
      <path d="M5.4 14.4L1.6 9M11.4 13.8l1.6-5" stroke={y.v}
        strokeWidth="2.2" strokeLinecap="round" />
      <path d="M17 16l-4-5.4M17 24l-4 5.4M24 16l4-5.4M24 24l4 5.4"
        stroke={y.v} strokeWidth="2.2" strokeLinecap="round" />
      {koz(7.4, 18, 1.8)}
    </>),
  },

  /* ══════════════ meva va ovqat ══════════════ */

  olma: {
    rang: "qizil", jon: "az-sakra", davom: "2.4s", emoji: ["🍎", "🍏"],
    chiz: (y) => (<>
      {soya(y, 11, 35)}
      <path d="M20 11.6c4-4 10.9-3.4 13.5 1.3 3.1 5.3.9 16.3-4.7 21-2.6 2.2-5.4 1.4-8.8 1.4s-6.2.8-8.8-1.4C5.6 29.2 3.4 18.2 6.5 12.9 9.1 8.2 16 7.6 20 11.6z"
        fill={y.r} />
      <path d="M20 11.6V4.8" stroke="#6b4a2a" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M21 7.4c3.6-4.4 7.8-3.2 7.8-3.2s-.8 5.2-7.8 5.2z" fill="#5fae52" />
      <path d="M22.4 7.4c2.4-2.8 5.4-2.6 5.4-2.6" stroke="#8ed07e"
        strokeWidth="1" fill="none" opacity=".8" />
      {yalt(12.8, 16.8, 3.4, 5, -24)}
      <ellipse cx="26.5" cy="27" rx="4" ry="5.5" fill="var(--bd)"
        opacity=".3" transform="rotate(20 26.5 27)" />
    </>),
  },

  qulupnay: {
    rang: "qizil", jon: "az-sakra", davom: "2.6s", emoji: ["🍓"],
    chiz: (y) => (<>
      {soya(y, 9.5, 36)}
      <path d="M20 36c-7.4 0-13.2-6.8-13.2-14.4 0-4.4 5.9-8 13.2-8s13.2 3.6 13.2 8C33.2 29.2 27.4 36 20 36z"
        fill={y.r} />
      <path d="M10.4 12h19.2L20 17.4z" fill="#4d9c3f" />
      <path d="M13.4 10.4l6.6 4.4-3.4-6z" fill="#5fae52" />
      <path d="M26.6 10.4L20 14.8l3.4-6z" fill="#5fae52" />
      <path d="M20 7.4v7" stroke="#3d7a32" strokeWidth="2.2" strokeLinecap="round" />
      {[["14.6", "22"], ["24.4", "21"], ["20", "26.4"], ["16.4", "29.4"], ["24", "29"]]
        .map(([cx, cz], i) => <circle key={i} cx={cx} cy={cz} r="1.3" fill="#ffe9a8" />)}
      {yalt(13.6, 19.4, 3, 2, -28, 0.3)}
    </>),
  },

  banan: {
    rang: "sariq", jon: "az-chayqal", davom: "3s", emoji: ["🍌"],
    chiz: (y) => (<>
      {soya(y, 12, 36, 0.24)}
      <path d="M7 6c0 13.4 8.6 22.6 20.8 22.6 3.2 0 4.4 2 3.2 4.2-2 3.6-6.8 4.2-11.2 3C9.4 32.6 2.6 21.8 2.6 9.4c0-3 4.4-3.6 4.4-3.4z"
        fill={y.v} />
      <path d="M7 6c0 13.4 8.6 22.6 20.8 22.6l-1 3C14.6 31.6 5.6 21 4.6 8.4z"
        fill="#fff" opacity=".3" />
      <path d="M30.6 28.8l4 2" stroke="#8a6a10" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M4.8 5.6l-1.6-2.4" stroke="#8a6a10" strokeWidth="2.4" strokeLinecap="round" />
    </>),
  },

  uzum: {
    rang: "binafsha", jon: "az-nafas", davom: "2.6s", emoji: ["🍇"],
    chiz: (y) => (<>
      {soya(y, 9, 36, 0.24)}
      <path d="M20 12V4M20 6c3.6-2.4 7.4-1.2 7.4-1.2" stroke="#4d9c3f"
        strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="14.6" r="5" fill={y.r} />
      <circle cx="13.4" cy="20" r="5" fill={y.r} />
      <circle cx="26.6" cy="20" r="5" fill={y.r} />
      <circle cx="20" cy="24.4" r="5" fill={y.r} />
      <circle cx="13.4" cy="29.4" r="5" fill={y.r} />
      <circle cx="26.6" cy="29.4" r="5" fill={y.r} />
      {yalt(17.6, 12.4, 2, 1.4, -30, 0.4)}
      {yalt(11.4, 17.6, 1.8, 1.2, -30, 0.32)}
    </>),
  },

  pechenye: {
    rang: "jigar", jon: "az-nafas", davom: "2.8s", emoji: ["🍪"],
    chiz: (y) => (<>
      {soya(y, 12, 36)}
      <circle cx="20" cy="20" r="15.6" fill={y.r} />
      <circle cx="13.4" cy="14.6" r="2.6" fill="#4a2d12" />
      <circle cx="25.6" cy="16.6" r="2.2" fill="#4a2d12" />
      <circle cx="17.4" cy="25.4" r="2.4" fill="#4a2d12" />
      <circle cx="26.6" cy="26.4" r="2" fill="#4a2d12" />
      <circle cx="10.4" cy="23.4" r="1.6" fill="#4a2d12" opacity=".8" />
      {yalt(13.4, 12.6, 3.4, 2, -30, 0.24)}
    </>),
  },

  nok: {
    rang: "yashil", jon: "az-sakra", davom: "2.8s", emoji: ["🍐"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <path d="M20 10.4c4.2 0 5.6 4.2 7.4 8.2 2 4.4 3.6 7.2 3.6 10.6 0 5-5 8.4-11 8.4s-11-3.4-11-8.4c0-3.4 1.6-6.2 3.6-10.6 1.8-4 3.2-8.2 7.4-8.2z"
        fill={y.r} />
      <path d="M20 10.4V4.4" stroke="#6b4a2a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M21.2 6.4c3.4-3.2 7.2-1.8 7.2-1.8s-1.2 4.6-7.2 4.2z" fill="#5fae52" />
      {yalt(14.6, 22.4, 3, 4.4, -18, 0.32)}
    </>),
  },

  tarvuz: {
    rang: "yashil", jon: "az-nafas", davom: "3s", emoji: ["🍉"],
    chiz: (y) => (<>
      {soya(y, 13, 36, 0.24)}
      <path d="M3 10.4h34C37 24.6 29.4 36 20 36S3 24.6 3 10.4z" fill={y.r} />
      <path d="M6.4 13.6h27.2C33.6 25 27.4 32.6 20 32.6S6.4 25 6.4 13.6z" fill="#fdf6ec" />
      <path d="M7.6 14.8h24.8C32.4 25.2 26.6 31.4 20 31.4S7.6 25.2 7.6 14.8z" fill="#ff6b5b" />
      {[["15.4", "20"], ["24.4", "21.4"], ["20", "25.4"], ["16.6", "27"], ["25", "27.4"]]
        .map(([cx, cz], i) => <ellipse key={i} cx={cx} cy={cz} rx="1.2" ry="1.6" fill="#33261c" />)}
      {yalt(10.4, 15.4, 3, 1.6, -8, 0.24)}
    </>),
  },

  gilos: {
    rang: "qizil", jon: "az-chayqal", davom: "2.8s", emoji: ["🍒"],
    chiz: (y) => (<>
      {soya(y, 11, 36.4, 0.24)}
      <path d="M13.4 27C13.4 16 17 9 24.4 5M26.4 26c0-10-1.2-16 0-21"
        stroke="#4d9c3f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="12.4" cy="29.4" r="7.4" fill={y.r} />
      <circle cx="27.4" cy="28.6" r="7.4" fill={y.r} />
      {yalt(9.4, 26.4, 2.4, 1.6, -30, 0.4)}
      {yalt(24.6, 25.6, 2.2, 1.4, -30, 0.34)}
    </>),
  },

  shaftoli: {
    rang: "olov", jon: "az-sakra", davom: "2.6s", emoji: ["🍑"],
    chiz: (y) => (<>
      {soya(y, 11, 36)}
      <circle cx="20" cy="23.4" r="13.4" fill={y.r} />
      <path d="M20 10.6c-2.2 4.2-2.2 18 0 26" stroke="var(--bd)"
        strokeWidth="1.8" opacity=".38" fill="none" />
      <path d="M20 11V4.4" stroke="#6b4a2a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M21 6.4c3.6-3.2 7.6-2 7.6-2s-1.4 4.8-7.6 4.4z" fill="#5fae52" />
      {yalt(13.6, 18.4, 3.4, 2.6, -30, 0.36)}
    </>),
  },

  non: {
    rang: "jigar", jon: "az-nafas", davom: "3s", emoji: ["🍞"],
    chiz: (y) => (<>
      {soya(y, 13, 35.4, 0.24)}
      <path d="M4 17C4 10 11.2 5 20 5s16 5 16 12v13.4a4 4 0 01-4 4H8a4 4 0 01-4-4z" fill={y.r} />
      <path d="M9.4 16.4c0-4.2 4.8-7 10.6-7s10.6 2.8 10.6 7" stroke="#fff"
        strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".5" />
      <path d="M8 23.4h24" stroke="var(--bd)" strokeWidth="1.6" opacity=".3" strokeLinecap="round" />
      {yalt(12.4, 12.4, 3.4, 2, -18, 0.26)}
    </>),
  },

  asal: {
    rang: "sariq", jon: "az-nafas", davom: "2.8s", emoji: ["🍯"],
    chiz: (y) => (<>
      {soya(y, 11, 36, 0.24)}
      <path d="M9.4 5.4h21.2l-1.4 4.4H10.8z" fill="#e8d5a8" />
      <path d="M8 15.4a5.4 5.4 0 015.4-5.4h13.2a5.4 5.4 0 015.4 5.4v14.2A6.4 6.4 0 0125.6 36h-11.2A6.4 6.4 0 018 29.6z"
        fill={y.r} />
      <path d="M12.4 20.4h15.2M12.4 26h15.2" stroke="#fff" strokeWidth="2.4"
        strokeLinecap="round" opacity=".45" />
      {yalt(13.4, 16.4, 2.4, 3.4, -12, 0.32)}
    </>),
  },

  boshoq: {
    rang: "tuproq", jon: "az-chayqal", davom: "3.4s", emoji: ["🌾"],
    chiz: (y) => (<>
      <path d="M20 37V11" stroke={y.v} strokeWidth="2.8" strokeLinecap="round" />
      {[13, 20, 27].map((cy, i) => (
        <g key={i}>
          <path d={`M20 ${cy + 1.4}c-5 0-7.6-3-7.6-6.8 5 0 7.6 3 7.6 6.8z`} fill={y.r} />
          <path d={`M20 ${cy + 1.4}c5 0 7.6-3 7.6-6.8-5 0-7.6 3-7.6 6.8z`} fill={y.v} />
        </g>
      ))}
      <path d="M20 11c0-3 1.6-5.4 4-6.4 0 3-1.6 5.4-4 6.4z" fill={y.r} />
    </>),
  },

  sabzi: {
    rang: "olov", jon: "az-sakra", davom: "2.6s", emoji: ["🥕"],
    chiz: (y) => (<>
      {soya(y, 6, 37, 0.22)}
      <path d="M14.4 15.4h11.2l-3.6 19.4a2 2 0 01-4 0z" fill={y.r} />
      <path d="M14.4 15.4h4l-1.4 19.4a2 2 0 001 0z" fill="#fff" opacity=".22" />
      <path d="M20 15.4V9" stroke="#4d9c3f" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M20 11c-1.6-3.6-6-4.8-6-4.8s.4 4.4 4 6.4M20 11c1.6-3.6 6-4.8 6-4.8s-.4 4.4-4 6.4"
        stroke="#4d9c3f" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M17.6 21.4h4M17 26.4h3.4" stroke="var(--bd)" strokeWidth="1.5"
        strokeLinecap="round" opacity=".5" />
    </>),
  },

  limon: {
    rang: "sariq", jon: "az-chayqal", davom: "3s", emoji: ["🍋"],
    chiz: (y) => (<>
      {soya(y, 12, 35.4, 0.24)}
      <g transform="rotate(-22 20 21)">
        <ellipse cx="20" cy="21" rx="15.4" ry="11.4" fill={y.r} />
        {yalt(13.4, 16.4, 4.6, 2.6, -8, 0.36)}
      </g>
      <path d="M31.6 8.4l3.4-3.4" stroke="#4d9c3f" strokeWidth="3" strokeLinecap="round" />
    </>),
  },

  apelsin: {
    rang: "olov", jon: "az-nafas", davom: "2.8s", emoji: ["🍊"],
    chiz: (y) => (<>
      {soya(y, 11, 36)}
      <circle cx="20" cy="21.4" r="14" fill={y.r} />
      <path d="M20 7.4V4.4" stroke="#6b4a2a" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M21 5.4c3-2.6 6.4-1.6 6.4-1.6s-1.2 4-6.4 3.6z" fill="#5fae52" />
      {yalt(13.4, 15.4, 3.6, 2.4, -30, 0.34)}
    </>),
  },

  /* ══════════════ o'simliklar ══════════════ */

  daraxt: {
    rang: "yashil", jon: "az-chayqal", davom: "3.6s", emoji: ["🌳", "🌲"],
    chiz: (y) => (<>
      {soya(y, 12, 35.6, 0.32)}
      <path d="M17.2 24h5.6v10.8a2.8 1.4 0 01-5.6 0z" fill="#6b4a2a" />
      <path d="M17.2 24h5.6v2.4h-5.6z" fill="#8a6136" />
      <circle cx="12.4" cy="19.6" r="7.6" fill={y.r} opacity=".92" />
      <circle cx="27.6" cy="19.6" r="7.6" fill={y.r} opacity=".92" />
      <circle cx="20" cy="14.4" r="10.6" fill={y.r} />
      {yalt(15.4, 9.6, 4, 2.8, -22, 0.3)}
      <path d="M27.4 24.6a10.6 10.6 0 01-14.8 0" stroke="var(--bd)"
        strokeWidth="2" fill="none" opacity=".28" strokeLinecap="round" />
    </>),
  },

  lola: {
    rang: "qizil", jon: "az-chayqal", davom: "3.2s", emoji: ["🌷"],
    chiz: (y) => (<>
      <path d="M20 37V20" stroke="#4d9c3f" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 28c-5.4 0-8.6-3-8.6-7.4 5.4 0 8.6 3 8.6 7.4z" fill="#4d9c3f" />
      <path d="M10 11.4c0-3.8 2.4-6.8 5-6.8s5 3 5 6.8c0-3.8 2.4-6.8 5-6.8s5 3 5 6.8v4.2c0 5.4-4.4 9.4-10 9.4s-10-4-10-9.4z"
        fill={y.r} />
      <path d="M10 11.4c0-3.8 2.4-6.8 5-6.8s5 3 5 6.8v13.6c-5.6 0-10-4-10-9.4z"
        fill="#fff" opacity=".18" />
    </>),
  },

  kungaboqar: {
    rang: "sariq", jon: "az-nafas", davom: "3s", emoji: ["🌻"],
    chiz: (y) => (<>
      <path d="M20 37V22" stroke="#4d9c3f" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 30c-5 0-8-2.8-8-6.8 5 0 8 2.8 8 6.8z" fill="#4d9c3f" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse key={a} cx="20" cy="6.6" rx="4" ry="5.6" fill={y.r}
          transform={`rotate(${a} 20 18)`} />
      ))}
      <circle cx="20" cy="18" r="7.4" fill="#5a3a12" />
      <circle cx="20" cy="18" r="4.6" fill="#7a5220" opacity=".7" />
    </>),
  },

  atirgul: {
    rang: "qizil", jon: "az-chayqal", davom: "3.4s", emoji: ["🌹"],
    chiz: (y) => (<>
      <path d="M20 37V21" stroke="#4d9c3f" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 29c-5 0-8-2.8-8-6.8 5 0 8 2.8 8 6.8z" fill="#4d9c3f" />
      <circle cx="20" cy="14" r="11.4" fill={y.r} />
      <path d="M20 6.4a7.6 7.6 0 017.6 7.6 5.6 5.6 0 01-5.6 5.6 4 4 0 01-4-4"
        stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".5" />
      {yalt(14.6, 9, 3, 2, -30, 0.3)}
    </>),
  },

  romashka: {
    rang: "sariq", jon: "az-chayqal", davom: "3.2s", emoji: ["🌼"],
    chiz: (y) => (<>
      <path d="M20 37V24" stroke="#4d9c3f" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M20 31c-4.6 0-7.4-2.6-7.4-6.2 4.6 0 7.4 2.6 7.4 6.2z" fill="#4d9c3f" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse key={a} cx="20" cy="7.4" rx="3.6" ry="5.6" fill="#fffdf6"
          transform={`rotate(${a} 20 17)`} />
      ))}
      <circle cx="20" cy="17" r="5.4" fill={y.r} />
    </>),
  },

  /* ══════════════ transport ══════════════ */

  mashina: {
    rang: "zangori", jon: "az-surish", davom: "1.8s", emoji: ["🚗"],
    chiz: (y) => (<>
      {soya(y, 15, 34.6, 0.24)}
      <path d="M6.4 18.4l3.2-6.6A5 5 0 0114 9h12a5 5 0 014.4 2.8l3.2 6.6z" fill={y.t} />
      <path d="M9.6 12.6h8v5.8H7z" fill="#cfeaf6" />
      <path d="M22.4 12.6h8L33 18.4h-10.6z" fill="#cfeaf6" />
      <path d="M2.6 21a3.6 3.6 0 013.6-3.6h27.6A3.6 3.6 0 0137.4 21v5.6a2.4 2.4 0 01-2.4 2.4H5a2.4 2.4 0 01-2.4-2.4z"
        fill={y.v} />
      <path d="M2.6 21a3.6 3.6 0 013.6-3.6h27.6A3.6 3.6 0 0137.4 21v1.4H2.6z"
        fill="#fff" opacity=".22" />
      <circle cx="10.6" cy="29.4" r="4.6" fill="#2e3438" />
      <circle cx="10.6" cy="29.4" r="2" fill="#8e9aa2" />
      <circle cx="29.4" cy="29.4" r="4.6" fill="#2e3438" />
      <circle cx="29.4" cy="29.4" r="2" fill="#8e9aa2" />
      <rect x="4.4" y="20.4" width="4.4" height="3" rx="1.5" fill="#ffe9a8" />
    </>),
  },

  taksi: {
    rang: "sariq", jon: "az-surish", davom: "1.8s", emoji: ["🚕"],
    chiz: (y) => (<>
      {soya(y, 15, 34.6, 0.24)}
      <rect x="15" y="3.4" width="10" height="4.6" rx="1.6" fill="#2e3438" />
      <path d="M6.4 18.4l3.2-6.6A5 5 0 0114 9h12a5 5 0 014.4 2.8l3.2 6.6z" fill={y.t} />
      <path d="M9.6 12.6h8v5.8H7zM22.4 12.6h8L33 18.4h-10.6z" fill="#cfeaf6" />
      <path d="M2.6 21a3.6 3.6 0 013.6-3.6h27.6A3.6 3.6 0 0137.4 21v5.6a2.4 2.4 0 01-2.4 2.4H5a2.4 2.4 0 01-2.4-2.4z"
        fill={y.v} />
      <path d="M11 22.4h18v3H11z" fill="#2e3438" />
      <circle cx="10.6" cy="29.4" r="4.6" fill="#2e3438" />
      <circle cx="10.6" cy="29.4" r="2" fill="#8e9aa2" />
      <circle cx="29.4" cy="29.4" r="4.6" fill="#2e3438" />
      <circle cx="29.4" cy="29.4" r="2" fill="#8e9aa2" />
    </>),
  },

  avtobus: {
    rang: "olov", jon: "az-surish", davom: "2s", emoji: ["🚌", "🚐"],
    chiz: (y) => (<>
      {soya(y, 14, 35.4, 0.24)}
      <path d="M4 9.4A4.4 4.4 0 018.4 5h23.2A4.4 4.4 0 0136 9.4v18.2a3 3 0 01-3 3H7a3 3 0 01-3-3z"
        fill={y.v} />
      <path d="M4 9.4A4.4 4.4 0 018.4 5h23.2A4.4 4.4 0 0136 9.4v2H4z" fill="#fff" opacity=".22" />
      <rect x="7" y="10.4" width="11.4" height="8.4" rx="1.8" fill="#cfeaf6" />
      <rect x="21.6" y="10.4" width="11.4" height="8.4" rx="1.8" fill="#cfeaf6" />
      <rect x="6.4" y="23" width="5" height="3" rx="1.5" fill="#ffe9a8" />
      <rect x="28.6" y="23" width="5" height="3" rx="1.5" fill="#ffe9a8" />
      <circle cx="11" cy="32.4" r="4.2" fill="#2e3438" />
      <circle cx="11" cy="32.4" r="1.8" fill="#8e9aa2" />
      <circle cx="29" cy="32.4" r="4.2" fill="#2e3438" />
      <circle cx="29" cy="32.4" r="1.8" fill="#8e9aa2" />
    </>),
  },

  yukMashina: {
    rang: "kumush", jon: "az-surish", davom: "2s", emoji: ["🚚", "🚛"],
    chiz: (y) => (<>
      {soya(y, 15, 34.6, 0.24)}
      <path d="M2 12a3 3 0 013-3h15v20H2z" fill="#f2f4f6" />
      <path d="M2 12a3 3 0 013-3h15v3H2z" fill="#fff" />
      <path d="M21.6 15h6.6l6 6.2v7.8H21.6z" fill={y.v} />
      <path d="M23.6 16.8h4l4 4.2h-8z" fill="#cfeaf6" />
      <circle cx="9.6" cy="30.4" r="4.4" fill="#2e3438" />
      <circle cx="9.6" cy="30.4" r="1.9" fill="#8e9aa2" />
      <circle cx="28.4" cy="30.4" r="4.4" fill="#2e3438" />
      <circle cx="28.4" cy="30.4" r="1.9" fill="#8e9aa2" />
    </>),
  },

  traktor: {
    rang: "yashil", jon: "az-surish", davom: "2.2s", emoji: ["🚜"],
    chiz: (y) => (<>
      {soya(y, 15, 36, 0.22)}
      <path d="M10 12.4a2.4 2.4 0 012.4-2.4h7.2l3.2 7.6H10z" fill="#cfeaf6" />
      <path d="M5 19h30v6H5z" fill={y.v} />
      <path d="M5 19h30v1.8H5z" fill="#fff" opacity=".25" />
      <circle cx="11" cy="27.4" r="8" fill="#2e3438" />
      <circle cx="11" cy="27.4" r="3.4" fill={y.v} />
      <circle cx="30" cy="29.4" r="5.4" fill="#2e3438" />
      <circle cx="30" cy="29.4" r="2.2" fill={y.v} />
    </>),
  },

  tezYordam: {
    rang: "kumush", jon: "az-surish", davom: "1.6s", emoji: ["🚑"],
    chiz: (y) => (<>
      {soya(y, 15, 34.6, 0.24)}
      <path d="M2 13a3 3 0 013-3h15v19H2z" fill="#f2f4f6" />
      <path d="M21.6 15h5.4l6.6 6.6v7.4H21.6z" fill="#f2f4f6" />
      <path d="M23.4 17h3.6l4.4 4.4h-8z" fill="#cfeaf6" />
      <path d="M9 15.4h6M12 12.4v6" stroke="#ff5a48" strokeWidth="3" strokeLinecap="round" />
      <path d="M2 23.4h32" stroke="#ff5a48" strokeWidth="2.6" />
      <rect x="8" y="5" width="8" height="3.6" rx="1.6" fill="#4fb8e0" />
      <circle cx="9.6" cy="31.4" r="4.2" fill="#2e3438" />
      <circle cx="9.6" cy="31.4" r="1.8" fill="#8e9aa2" />
      <circle cx="28.4" cy="31.4" r="4.2" fill="#2e3438" />
      <circle cx="28.4" cy="31.4" r="1.8" fill="#8e9aa2" />
    </>),
  },

  otOchirgich: {
    rang: "qizil", jon: "az-surish", davom: "1.6s", emoji: ["🚒"],
    chiz: (y) => (<>
      {soya(y, 15, 34.6, 0.24)}
      <path d="M2 14a3 3 0 013-3h15v18H2z" fill={y.v} />
      <path d="M21.6 16h5.4l6.6 6.4V29H21.6z" fill={y.v} opacity=".88" />
      <path d="M23.4 17.6h3.6l4.4 4.2h-8z" fill="#cfeaf6" />
      <path d="M5 13.4h7v5.4H5z" fill="#cfeaf6" />
      <rect x="7" y="5.4" width="26" height="3" rx="1.5" fill="#b9c7d2" />
      <circle cx="20" cy="6.9" r="2.4" fill="#ffe9a8" />
      <circle cx="9.6" cy="31.4" r="4.2" fill="#2e3438" />
      <circle cx="9.6" cy="31.4" r="1.8" fill="#8e9aa2" />
      <circle cx="28.4" cy="31.4" r="4.2" fill="#2e3438" />
      <circle cx="28.4" cy="31.4" r="1.8" fill="#8e9aa2" />
    </>),
  },

  politsiya: {
    rang: "zangori", jon: "az-surish", davom: "1.6s", emoji: ["🚓", "🚨"],
    chiz: (y) => (<>
      {soya(y, 15, 34.6, 0.24)}
      <rect x="14" y="4" width="12" height="3.8" rx="1.6" fill="#ff5a48" />
      <rect x="20" y="4" width="6" height="3.8" rx="1.6" fill="#4fb8e0" />
      <path d="M6.4 18.4l3.2-6.6A5 5 0 0114 9h12a5 5 0 014.4 2.8l3.2 6.6z" fill="#f2f4f6" />
      <path d="M9.6 12.6h8v5.8H7zM22.4 12.6h8L33 18.4h-10.6z" fill="#cfeaf6" />
      <path d="M2.6 21a3.6 3.6 0 013.6-3.6h27.6A3.6 3.6 0 0137.4 21v5.6a2.4 2.4 0 01-2.4 2.4H5a2.4 2.4 0 01-2.4-2.4z"
        fill={y.v} />
      <path d="M13 17.4h14v11.6H13z" fill="#f2f4f6" opacity=".9" />
      <circle cx="10.6" cy="29.4" r="4.6" fill="#2e3438" />
      <circle cx="10.6" cy="29.4" r="2" fill="#8e9aa2" />
      <circle cx="29.4" cy="29.4" r="4.6" fill="#2e3438" />
      <circle cx="29.4" cy="29.4" r="2" fill="#8e9aa2" />
    </>),
  },

  velosiped: {
    rang: "yashil", jon: "az-surish", davom: "1.8s", emoji: ["🚲"],
    chiz: (y) => (<>
      {soya(y, 15, 35.6, 0.2)}
      <circle cx="9.4" cy="26" r="8.4" fill="none" stroke="#2e3438" strokeWidth="3" />
      <circle cx="30.6" cy="26" r="8.4" fill="none" stroke="#2e3438" strokeWidth="3" />
      <circle cx="9.4" cy="26" r="8.4" fill="none" stroke="#8e9aa2" strokeWidth="1" />
      <circle cx="30.6" cy="26" r="8.4" fill="none" stroke="#8e9aa2" strokeWidth="1" />
      <path d="M9.4 26l7.6-11.4h7.2l6.4 11.4M17 14.6h7.2M20 26H9.4"
        stroke={y.v} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 11.6h4.4" stroke={y.v} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="26" r="2.2" fill={y.v} />
    </>),
  },

  poyezd: {
    rang: "jigar", jon: "az-surish", davom: "2.2s", emoji: ["🚂", "🚃", "🚄"],
    chiz: (y) => (<>
      {soya(y, 15, 35.4, 0.24)}
      <path d="M3 15a3 3 0 013-3h11v16H3z" fill={y.v} />
      <rect x="19" y="17.4" width="17" height="10.6" rx="2.4" fill={y.v} opacity=".86" />
      <rect x="6.4" y="4" width="5.4" height="8" rx="1.8" fill={y.v} opacity=".8" />
      <rect x="6.4" y="15.4" width="6.6" height="5.4" rx="1.6" fill="#cfeaf6" />
      <rect x="21.4" y="19.4" width="5" height="4.4" rx="1.4" fill="#cfeaf6" />
      <rect x="28.4" y="19.4" width="5" height="4.4" rx="1.4" fill="#cfeaf6" />
      <circle cx="8.6" cy="31.4" r="4" fill="#2e3438" />
      <circle cx="8.6" cy="31.4" r="1.7" fill="#8e9aa2" />
      <circle cx="21.4" cy="31.4" r="3.4" fill="#2e3438" />
      <circle cx="32.4" cy="31.4" r="3.4" fill="#2e3438" />
    </>),
  },

  samolyot: {
    rang: "zangori", jon: "az-uch", davom: "2.6s", emoji: ["✈", "✈️", "🛩"],
    chiz: (y) => (<>
      <path d="M37.4 20c0 1.8-1.5 3-3.3 3h-8.5l-6.2 13.2h-4.2l3-13.2h-7.7l-3.5 5H4.2l2.5-8-2.5-8h2.8l3.5 5h7.7l-3-13.2h4.2L25.6 17h8.5c1.8 0 3.3 1.2 3.3 3z"
        fill={y.v} />
      <path d="M37.4 20c0 1.8-1.5 3-3.3 3h-8.5l-6.2 13.2h-2L23 23H4.2l2.5-3h30.7z"
        fill="var(--bd)" opacity=".25" />
      <path d="M10 12h7.7l-1.4-6.2h-1.4z" fill="#fff" opacity=".28" />
    </>),
  },

  vertolyot: {
    rang: "zangori", jon: "az-uch", davom: "1.8s", emoji: ["🚁"],
    chiz: (y) => (<>
      <path d="M3 6.4h34" stroke="#8e9aa2" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 6.4v4.2" stroke="#8e9aa2" strokeWidth="2.8" />
      <path d="M7.4 19.4A8.4 8.4 0 0115.8 11h7.4a8.4 8.4 0 018.4 8.4v4.2a3.4 3.4 0 01-3.4 3.4H10.8a3.4 3.4 0 01-3.4-3.4z"
        fill={y.v} />
      <path d="M10.4 14.4h7.2v5.4h-9.4z" fill="#cfeaf6" />
      <path d="M31.6 21h6.4M36.4 17.4v7.2" stroke="#8e9aa2" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M10 30.4h16" stroke="#8e9aa2" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M13 26.4v4M23 26.4v4" stroke="#8e9aa2" strokeWidth="2.4" />
    </>),
  },

  kema: {
    rang: "zangori", jon: "az-suzish", davom: "3s", emoji: ["🚢", "⛴"],
    chiz: (y) => (<>
      <path d="M4 22.4h32l-3.6 9c-.8 1.8-2.6 3-4.6 3H12.2c-2 0-3.8-1.2-4.6-3z" fill={y.v} />
      <path d="M8 22.4V11.4a2.4 2.4 0 012.4-2.4h11.2a2.4 2.4 0 012.4 2.4v11z" fill="#f2f4f6" />
      <circle cx="12.6" cy="14.6" r="2.2" fill="#cfeaf6" />
      <circle cx="19.4" cy="14.6" r="2.2" fill="#cfeaf6" />
      <path d="M27.4 22.4V5.4" stroke="#8e9aa2" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M4 26.4h32" stroke="#fff" strokeWidth="1.8" opacity=".3" />
      <path d="M2 36c3.4 0 3.4-2.6 6.8-2.6S12.2 36 15.6 36 19 33.4 22.4 33.4 25.8 36 29.2 36s3.4-2.6 6.8-2.6"
        stroke="#4fb8e0" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".6" />
    </>),
  },

  yelkanli: {
    rang: "zangori", jon: "az-suzish", davom: "3.2s", emoji: ["⛵"],
    chiz: (y) => (<>
      <path d="M18.4 22.4V3.4L7 22.4z" fill="#f4f8fb" />
      <path d="M21.4 22.4V7.4l9.6 15z" fill="#dce8f0" />
      <path d="M19.9 3v19.4" stroke="#8e9aa2" strokeWidth="1.8" />
      <path d="M3 25.4h34l-3.2 5.8a6 6 0 01-5.2 3.2H11.4a6 6 0 01-5.2-3.2z" fill={y.v} />
      <path d="M2 37c3.4 0 3.4-2.4 6.8-2.4S12.2 37 15.6 37 19 34.6 22.4 34.6 25.8 37 29.2 37"
        stroke="#4fb8e0" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".55" />
    </>),
  },

  /* ══════════════ ob-havo ══════════════ */

  quyosh: {
    rang: "sariq", jon: "az-yaltira", davom: "4s", emoji: ["☀", "☀️"],
    chiz: (y) => (<>
      <path d="M20 1.6v5.6M20 32.8v5.6M1.6 20h5.6M32.8 20h5.6M7 7l4 4M29 29l4 4M33 7l-4 4M11 29l-4 4"
        stroke={y.v} strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="20" cy="20" r="9.6" fill={y.r} />
      {yalt(15.6, 15.6, 3, 2, -32, 0.45)}
    </>),
  },

  quyoshYuzi: {
    rang: "sariq", jon: "az-nafas", davom: "3s", emoji: ["🌞"],
    chiz: (y) => (<>
      <path d="M20 1.6v4.6M20 33.8v4.6M1.6 20h4.6M33.8 20h4.6M7 7l3.4 3.4M29.6 29.6L33 33M33 7l-3.4 3.4M10.4 29.6L7 33"
        stroke={y.v} strokeWidth="3.2" strokeLinecap="round" opacity=".85" />
      <circle cx="20" cy="20" r="12" fill={y.r} />
      {koz(15.6, 17.6, 2.2)}{koz(24.4, 17.6, 2.2)}
      <path d="M14.4 24.4c3 3.4 8.2 3.4 11.2 0" stroke="#8a5a00"
        strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="12.4" cy="23" r="2" fill="#ff9f9f" opacity=".55" />
      <circle cx="27.6" cy="23" r="2" fill="#ff9f9f" opacity=".55" />
    </>),
  },

  oy: {
    rang: "sariq", jon: "az-chayqal", davom: "4s", emoji: ["🌙", "🌛"],
    chiz: (y) => (<>
      <path d="M29.4 26.4A15 15 0 0110.6 7.6a15.8 15.8 0 1018.8 18.8z" fill={y.r} />
      <circle cx="24" cy="27.4" r="2.4" fill="var(--bd)" opacity=".3" />
      <circle cx="15.4" cy="24" r="1.7" fill="var(--bd)" opacity=".25" />
      {yalt(13.4, 12.4, 2.6, 1.8, -30, 0.36)}
    </>),
  },

  bulut: {
    rang: "kumush", jon: "az-suzish", davom: "4s", emoji: ["⛅", "☁"],
    // Bulut gradientsiz: u oq va quyosh sariq — ikkalasi ham ohangdan
    // emas, o'z ma'nosidan rang oladi.
    chiz: () => (<>
      <circle cx="27.4" cy="11.4" r="6.6" fill="#ffd45c" />
      <path d="M11.4 32A8 8 0 0110.6 16 10.4 10.4 0 0129.6 19a6.6 6.6 0 01-1.2 13z"
        fill="#f4f7fa" />
      <path d="M11.4 32A8 8 0 0110.6 16a10.3 10.3 0 012.4-2.4C9.6 18 9 25.6 13.4 32z"
        fill="#fff" opacity=".7" />
    </>),
  },

  yomgir: {
    rang: "zangori", jon: "az-tushish", davom: "1.4s", emoji: ["🌧", "☔"],
    chiz: (y) => (<>
      <path d="M11.4 24A7.6 7.6 0 0110.6 8.4 9.8 9.8 0 0128.4 11a6.2 6.2 0 01-1.2 13z"
        fill="#dbe5ec" />
      <path d="M12.4 28l-2 6.4M20 28l-2 6.4M27.6 28l-2 6.4" stroke={y.v}
        strokeWidth="3.2" strokeLinecap="round" />
    </>),
  },

  qor: {
    rang: "zangori", jon: "az-aylan", davom: "4s", emoji: ["❄", "❄️", "⛄"],
    chiz: (y) => (<>
      <path d="M20 2.6v34.8M5 11.4l30 17.2M35 11.4L5 28.6" stroke={y.v}
        strokeWidth="3.2" strokeLinecap="round" />
      <path d="M14.6 6.6L20 11l5.4-4.4M14.6 33.4L20 29l5.4 4.4"
        stroke={y.v} strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 17.4l.4 6.4-6 2.2M32 17.4l-.4 6.4 6 2.2M8 22.6l-.4-6.4 6-2.2M32 22.6l.4-6.4-6-2.2"
        stroke={y.v} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>),
  },

  tolqin: {
    rang: "zangori", jon: "az-suzish", davom: "2.6s", emoji: ["🌊"],
    chiz: (y) => (<>
      <path d="M1.6 13c4.4 0 4.4 4.2 8.8 4.2S14.8 13 19.2 13s4.4 4.2 8.8 4.2S32.4 13 36.8 13"
        stroke={y.v} strokeWidth="3.6" fill="none" strokeLinecap="round" opacity=".5" />
      <path d="M1.6 22c4.4 0 4.4 4.2 8.8 4.2S14.8 22 19.2 22s4.4 4.2 8.8 4.2S32.4 22 36.8 22"
        stroke={y.v} strokeWidth="3.6" fill="none" strokeLinecap="round" opacity=".8" />
      <path d="M1.6 31c4.4 0 4.4 4.2 8.8 4.2S14.8 31 19.2 31s4.4 4.2 8.8 4.2S32.4 31 36.8 31"
        stroke={y.v} strokeWidth="3.6" fill="none" strokeLinecap="round" />
    </>),
  },

  /* ══════════════ kiyim va uy ══════════════ */

  futbolka: {
    rang: "zangori", jon: "az-chayqal", davom: "3.2s", emoji: ["👕"],
    chiz: (y) => (<>
      {soya(y, 11, 36.4, 0.2)}
      <path d="M14.4 5.4L3.4 11.4l4.4 7.8 3.4-2v17.4h17.6V17.2l3.4 2 4.4-7.8-11-6c0 3.4-2.6 5.4-5.6 5.4s-5.6-2-5.6-5.4z"
        fill={y.v} />
      <path d="M14.4 5.4L3.4 11.4l4.4 7.8 3.4-2v17.4h4V5.4z" fill="#fff" opacity=".2" />
    </>),
  },

  kurtka: {
    rang: "tuproq", jon: "az-chayqal", davom: "3.4s", emoji: ["🧥"],
    chiz: (y) => (<>
      {soya(y, 11, 36.4, 0.2)}
      <path d="M16.4 5L4.4 10.6V35h12V5zM23.6 5l12 5.6V35h-12V5z" fill={y.v} />
      <path d="M16.4 5L4.4 10.6V35h4V9.4z" fill="#fff" opacity=".2" />
      <path d="M16.4 5L20 10l3.6-5" stroke="#fff" strokeWidth="2"
        fill="none" strokeLinejoin="round" opacity=".5" />
      <circle cx="19" cy="19" r="1.5" fill="#fff" opacity=".65" />
      <circle cx="19" cy="26" r="1.5" fill="#fff" opacity=".65" />
    </>),
  },

  shim: {
    rang: "zangori", jon: "az-chayqal", davom: "3.2s", emoji: ["👖"],
    chiz: (y) => (<>
      {soya(y, 10, 37, 0.2)}
      <path d="M9.4 3.6h21.2v6.6L28.6 36h-6.4l-2.2-19-2.2 19h-6.4L9.4 10.2z" fill={y.v} />
      <path d="M9.4 10.2h21.2" stroke="#fff" strokeWidth="1.8" opacity=".45" />
      <path d="M9.4 3.6h5v6.6z" fill="#fff" opacity=".2" />
    </>),
  },

  paypoq: {
    rang: "binafsha", jon: "az-chayqal", davom: "3s", emoji: ["🧦"],
    chiz: (y) => (<>
      {soya(y, 10, 36.4, 0.2)}
      <path d="M11.4 4h11v14.4c0 3.2 1.2 4.4 4.4 6.4 4.2 2.6 5.4 4.4 4.2 7.4-1.2 3-4.4 3.8-8.2 1.8l-8.2-4.4c-3.2-1.8-4.6-4.2-4.6-7.6z"
        fill={y.v} />
      <path d="M11.4 4h11v4.4h-11z" fill="#fff" opacity=".4" />
      <path d="M11.4 12.4h11" stroke="#fff" strokeWidth="1.6" opacity=".3" />
    </>),
  },

  kepka: {
    rang: "qizil", jon: "az-sakra", davom: "2.8s", emoji: ["🧢"],
    chiz: (y) => (<>
      {soya(y, 13, 35.4, 0.22)}
      <path d="M5.4 24C5.4 15 12.4 8 20 8s14.6 7 14.6 16z" fill={y.r} />
      <path d="M3.4 24h33.2c0 2.8-1.8 4.6-4.6 4.6H8C5.2 28.6 3.4 26.8 3.4 24z" fill={y.v} />
      <path d="M34.6 24H39c0 2.8-1.8 4.6-4.4 4.6z" fill={y.v} opacity=".7" />
      <circle cx="20" cy="9" r="2" fill={y.s} />
      {yalt(13.4, 14.4, 3.4, 2.4, -30, 0.28)}
    </>),
  },

  koylak: {
    rang: "binafsha", jon: "az-chayqal", davom: "3.4s", emoji: ["👗"],
    chiz: (y) => (<>
      {soya(y, 13, 36.4, 0.22)}
      <path d="M14.4 4h11.2l-2.2 9.4L32.6 36H7.4l9.2-22.6z" fill={y.v} />
      <path d="M14.4 4h4l-1.8 9.4L11 36H7.4l9.2-22.6z" fill="#fff" opacity=".2" />
      <path d="M16.6 13.4h6.8" stroke="#fff" strokeWidth="1.8" opacity=".4" />
    </>),
  },

  uy: {
    rang: "yashil", jon: "az-nafas", davom: "3s", emoji: ["🏠", "🏡"],
    chiz: (y) => (<>
      {soya(y, 14, 35.4)}
      <path d="M7 17.8v11.6L20 35.4V23.4z" fill={y.v} />
      <path d="M33 17.8v11.6L20 35.4V23.4z" fill={y.s} />
      <path d="M20 5.6l14.8 9.6L20 22.4 5.2 15.2z" fill="#ff7a6b" />
      <path d="M20 5.6l14.8 9.6-4 1.9L16 7.4z" fill="#fff" opacity=".25" />
      <path d="M22.8 25.4l6.4-3v7.2l-6.4 3z" fill="#ffe9a8" opacity=".85" />
      <path d="M10.6 24.4l5.2 2.4v6.2l-5.2-2.4z" fill="var(--bd)" opacity=".45" />
    </>),
  },

  bino: {
    rang: "kumush", jon: "az-nafas", davom: "3.2s", emoji: ["🏢", "🏬"],
    chiz: (y) => (<>
      {soya(y, 12, 36.4, 0.26)}
      <path d="M8 8.4L20 4l12 4.4v28H8z" fill={y.v} />
      <path d="M8 8.4L20 4v32.4H8z" fill="#fff" opacity=".18" />
      {[11, 17, 23].map((cy) => [12.4, 20, 27.6].map((cx) => (
        <rect key={`${cx}-${cy}`} x={cx - 2.2} y={cy - 2.2} width="4.4" height="4.4"
          rx="1.2" fill="#cfeaf6" opacity=".85" />
      )))}
      <rect x="16.6" y="29" width="6.8" height="7.4" rx="1.4" fill="var(--bd)" opacity=".6" />
    </>),
  },

  shahar: {
    rang: "olov", jon: "az-nafas", davom: "3.4s", emoji: ["🌇", "🌆", "🏙"],
    chiz: (y) => (<>
      <circle cx="20" cy="21" r="8.4" fill={y.r} />
      <path d="M2.6 24.4h6.8V36H2.6zM11.4 17.4h6.8V36h-6.8zM20 26.4h6.8V36H20zM28.6 20.4h6.8V36h-6.8z"
        fill="var(--bd)" opacity=".82" />
      <path d="M2.6 24.4h6.8v1.8H2.6zM11.4 17.4h6.8v1.8h-6.8zM20 26.4h6.8v1.8H20zM28.6 20.4h6.8v1.8h-6.8z"
        fill="#fff" opacity=".2" />
      <path d="M1 37h38" stroke="var(--bd)" strokeWidth="2.4" strokeLinecap="round" />
    </>),
  },

  /* ══════════════ yuz ifodalari ══════════════ */

  xursand: {
    rang: "sariq", jon: "az-sakra", davom: "2.2s", emoji: ["😀", "😃", "😄", "🙂"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <circle cx="14.4" cy="16.4" r="2.5" fill="#5a3f00" />
      <circle cx="25.6" cy="16.4" r="2.5" fill="#5a3f00" />
      <path d="M11.6 23.6c4.6 6.4 12.2 6.4 16.8 0z" fill="#5a3f00" />
      <path d="M14 26.4c3.4 1.6 8.6 1.6 12 0-1.6 2.6-4 4-6 4s-4.4-1.4-6-4z" fill="#ff8c7a" />
      {yalt(12.6, 11.6, 4.2, 2.4, -32, 0.3)}
    </>),
  },

  yiglagan: {
    rang: "zangori", jon: "az-tebran", davom: "3.4s", emoji: ["😢", "😭"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <circle cx="14.4" cy="16.4" r="2.5" fill="#2b4250" />
      <circle cx="25.6" cy="16.4" r="2.5" fill="#2b4250" />
      <path d="M14 29.4c3.4-4 8.6-4 12 0" stroke="#2b4250" strokeWidth="2.8"
        fill="none" strokeLinecap="round" />
      <path d="M14.4 21c2 2.8 3 4.4 3 5.6a3 3 0 01-6 0c0-1.2 1-2.8 3-5.6z" fill="#7fd0f0" />
      {yalt(12.6, 11.6, 4.2, 2.4, -32, 0.3)}
    </>),
  },

  jahli: {
    rang: "qizil", jon: "az-tebran", davom: "1.8s", emoji: ["😠", "😡"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <path d="M10.4 11.6l6.8 3.8M29.6 11.6l-6.8 3.8" stroke="#7a2b1e"
        strokeWidth="3" strokeLinecap="round" />
      <circle cx="14.6" cy="19.4" r="2.4" fill="#7a2b1e" />
      <circle cx="25.4" cy="19.4" r="2.4" fill="#7a2b1e" />
      <path d="M13.6 29c3.4-3.2 9.4-3.2 12.8 0" stroke="#7a2b1e"
        strokeWidth="2.8" fill="none" strokeLinecap="round" />
      {yalt(12.6, 11.6, 4.2, 2.4, -32, 0.26)}
    </>),
  },

  uxlayotgan: {
    rang: "binafsha", jon: "az-nafas", davom: "3.6s", emoji: ["😴", "😪"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <path d="M10.4 17c2.2-2.4 5.4-2.4 7.6 0M22 17c2.2-2.4 5.4-2.4 7.6 0"
        stroke="#3a2450" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="27" rx="3.4" ry="2.6" fill="#3a2450" />
      <path d="M29 4h6.4L29 11.4h6.4" stroke="#b07be8" strokeWidth="2.2"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {yalt(12.6, 11.6, 4.2, 2.4, -32, 0.3)}
    </>),
  },

  hayron: {
    rang: "sariq", jon: "az-nafas", davom: "2.2s", emoji: ["😮", "😯", "😲"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <circle cx="14.4" cy="15.6" r="2.5" fill="#5a3f00" />
      <circle cx="25.6" cy="15.6" r="2.5" fill="#5a3f00" />
      <ellipse cx="20" cy="26" rx="4.2" ry="5.2" fill="#5a3f00" />
      <ellipse cx="20" cy="28.4" rx="2.4" ry="2.4" fill="#ff8c7a" />
      {yalt(12.6, 11.6, 4.2, 2.4, -32, 0.3)}
    </>),
  },

  sovqotgan: {
    rang: "zangori", jon: "az-tebran", davom: "1.2s", emoji: ["🥶", "🧊"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <circle cx="14.4" cy="16.4" r="2.5" fill="#1d4356" />
      <circle cx="25.6" cy="16.4" r="2.5" fill="#1d4356" />
      <path d="M13.2 26.4l3.4 3 3.4-3 3.4 3 3.4-3" stroke="#1d4356"
        strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.4 9.6l4 4M35.6 9.6l-4 4M20 1.6v5" stroke="#cfeaf6"
        strokeWidth="2.4" strokeLinecap="round" opacity=".85" />
      {yalt(12.6, 11.6, 4.2, 2.4, -32, 0.3)}
    </>),
  },

} satisfies Record<string, Belgi>;
