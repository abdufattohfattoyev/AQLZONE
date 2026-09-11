/**
 * Ilovaning O'Z belgilari — tugmalar, yorliqlar, mukofotlar.
 *
 * Bular `hajmli/olam.tsx` dagilardan boshqa ish qiladi: u yerdagilar
 * mashqda SANALADIGAN narsalar (olma, mashina), bu yerdagilar esa
 * ilovaning o'z tili — tanga, kubok, to'g'ri javob belgisi.
 *
 * Chizish qoidalari `lib/hajmli.tsx` dagi izohda. Qisqasi: yorug'lik
 * chap-tepadan, uch yoq uch rangda, ostida soya.
 */
import type { Belgi, Yuz } from "../hajmli";

/* ────────────────── yordamchilar ──────────────────
   Bularsiz har chizmada bir xil ellips va bir xil `filter` qayta
   yozilardi — va vaqt o'tib ular bir-biridan chetga chiqib ketardi:
   birida soya qorong'iroq, ikkinchisida balandroq bo'lib qolardi. */

/** Yerga tushgan soya. Narsani "turgan" qiladigan asosiy narsa. */
const soya = (y: Yuz, rx = 11, cy = 35.6, o = 0.3) => (
  <ellipse cx="20" cy={cy} rx={rx} ry={rx * 0.21} fill="#000" opacity={o} filter={y.b} />
);

/** Yaltiroq — oq shaffof dog'. Har doim chap-tepada. */
const yalt = (cx: number, cy: number, rx: number, ry: number, a = 0, o = 0.34) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" opacity={o}
    transform={a ? `rotate(${a} ${cx} ${cy})` : undefined} />
);

export const ILOVA = {

  /* ══════════════ tanga va mukofot ══════════════ */

  tanga: {
    rang: "sariq", jon: "az-aylan", davom: "2.8s", emoji: ["🪙"],
    chiz: (y) => (<>
      {soya(y, 13)}
      {/* Yon devor BALAND: tanga qalinligi shundan ko'rinadi. Past
          bo'lsa u tangaga emas, yerda yotgan yassi doiraga o'xshardi. */}
      <path d="M4.6 18.4v7.4a15.4 8.4 0 0030.8 0v-7.4z" fill={y.s} />
      <path d="M4.6 18.4v7.4c0 1.7 1 3.3 2.7 4.6V19.6z" fill="var(--bl)" opacity=".35" />
      <ellipse cx="20" cy="18.4" rx="15.4" ry="8.4" fill={y.r} />
      <ellipse cx="20" cy="18.4" rx="12.2" ry="6.4" fill="var(--bd)" opacity=".22" />
      <ellipse cx="20" cy="18.4" rx="12.2" ry="6.4" fill="none"
        stroke="var(--bl)" strokeWidth="1" opacity=".5" />
      <path d="M20 13.8l2.2 3.1 5 .5-3.7 2.3 1 3.3-4.5-1.8-4.5 1.8 1-3.3-3.7-2.3 5-.5z"
        fill="#fff8dc" />
      {yalt(12, 15.2, 4.8, 2.1, -14, 0.45)}
    </>),
  },

  kubok: {
    rang: "sariq", jon: "az-sakra", davom: "2.6s", emoji: ["🏆"],
    chiz: (y) => (<>
      {soya(y, 11.5, 35.8)}
      <path d="M11.6 30.4v2.1a8.4 3.2 0 0016.8 0v-2.1z" fill={y.s} />
      <ellipse cx="20" cy="30.4" rx="8.4" ry="3.2" fill={y.t} />
      <path d="M17.4 22.6h5.2v8h-5.2z" fill={y.s} />
      <path d="M9.2 9.5H5a5.8 5.8 0 005.8 5.8M30.8 9.5H35a5.8 5.8 0 01-5.8 5.8"
        stroke="var(--bm)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M8.6 8.4h22.8v6.2c0 6.4-5.1 11.6-11.4 11.6S8.6 21 8.6 14.6z" fill={y.v} />
      <ellipse cx="20" cy="8.4" rx="11.4" ry="4.2" fill={y.t} />
      <ellipse cx="20" cy="8.4" rx="8.4" ry="2.9" fill="var(--bd)" opacity=".3" />
      {yalt(13.4, 15.6, 2.3, 5.2, -14, 0.32)}
    </>),
  },

  medal: {
    rang: "qizil", jon: "az-chayqal", davom: "3s", emoji: ["🏅"],
    chiz: (y) => (<>
      {soya(y, 9.5, 36)}
      <path d="M13 3l6.2 11.5-5.6 3.2zM27 3l-6.2 11.5 5.6 3.2z" fill={y.s} opacity=".85" />
      <circle cx="20" cy="25" r="11.6" fill={y.r} />
      <circle cx="20" cy="25" r="8.6" fill="var(--bd)" opacity=".2" />
      <path d="M20 17.8l2.3 4.9 5.3.7-3.9 3.7 1 5.3-4.7-2.6-4.7 2.6 1-5.3-3.9-3.7 5.3-.7z"
        fill="#fffaf0" />
      {yalt(14, 19.6, 3.4, 2, -22, 0.3)}
    </>),
  },

  oltin: {
    rang: "sariq", jon: "az-yaltira", davom: "2.6s", emoji: ["🥇"],
    chiz: (y) => (<>
      {soya(y, 9.5, 36)}
      <path d="M12 3l5.8 11.4-5.6 3zM28 3l-5.8 11.4 5.6 3z" fill={y.s} opacity=".8" />
      <circle cx="20" cy="25" r="11.4" fill={y.r} />
      <circle cx="20" cy="25" r="8.4" fill="var(--bd)" opacity=".2" />
      <path d="M17.8 21.6l3.2-1.7v11" stroke="#fff8dc" strokeWidth="2.8"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {yalt(14, 19.6, 3.4, 2, -22, 0.32)}
    </>),
  },

  kumush: {
    rang: "kumush", jon: "az-nafas", davom: "3s", emoji: ["🥈"],
    chiz: (y) => (<>
      {soya(y, 9.5, 36)}
      <path d="M12 3l5.8 11.4-5.6 3zM28 3l-5.8 11.4 5.6 3z" fill={y.s} opacity=".8" />
      <circle cx="20" cy="25" r="11.4" fill={y.r} />
      <circle cx="20" cy="25" r="8.4" fill="var(--bd)" opacity=".2" />
      <path d="M16.6 22.2a3.4 3.4 0 016.6 1.3c0 3-6.6 4.4-6.6 7.5h6.8"
        stroke="#fff" strokeWidth="2.8" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      {yalt(14, 19.6, 3.4, 2, -22, 0.36)}
    </>),
  },

  bronza: {
    rang: "bronza", jon: "az-nafas", davom: "3.2s", emoji: ["🥉"],
    chiz: (y) => (<>
      {soya(y, 9.5, 36)}
      <path d="M12 3l5.8 11.4-5.6 3zM28 3l-5.8 11.4 5.6 3z" fill={y.s} opacity=".8" />
      <circle cx="20" cy="25" r="11.4" fill={y.r} />
      <circle cx="20" cy="25" r="8.4" fill="var(--bd)" opacity=".2" />
      <path d="M16.8 21h6.4l-3.4 4.2h.5a3.5 3.5 0 11-3.4 4.4"
        stroke="#fff6ec" strokeWidth="2.8" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
      {yalt(14, 19.6, 3.4, 2, -22, 0.32)}
    </>),
  },

  yulduz: {
    rang: "sariq", jon: "az-yaltira", davom: "2.4s", emoji: ["⭐", "★"],
    chiz: (y) => (<>
      {soya(y, 10, 35.4)}
      <path d="M20 3.6l4.9 10.5 11.4 1.5-8.3 7.9 2.1 11.3L20 29.2 9.9 34.8 12 23.5 3.7 15.6 15.1 14.1z"
        fill={y.r} />
      <path d="M20 3.6l4.9 10.5 11.4 1.5-8.3 7.9 2.1 11.3L20 29.2z" fill="var(--bd)" opacity=".16" />
      {yalt(15.6, 11.4, 2.6, 1.6, -34, 0.4)}
    </>),
  },

  daraja: {
    rang: "yashil", jon: "az-nafas", davom: "2.2s", emoji: ["📶"],
    chiz: (y) => (<>
      {soya(y, 13, 35.6, 0.26)}
      <path d="M4 27.4h5.6v6.8H4z" fill={y.s} />
      <path d="M4 25.6h5.6v1.8H4z" fill={y.t} opacity=".55" />
      <path d="M12.8 21.4h5.6v12.8h-5.6z" fill={y.s} />
      <path d="M12.8 19.6h5.6v1.8h-5.6z" fill={y.t} opacity=".75" />
      <path d="M21.6 14.4h5.6v19.8h-5.6z" fill={y.v} />
      <path d="M21.6 12.6h5.6v1.8h-5.6z" fill={y.t} />
      <path d="M30.4 6.4H36v27.8h-5.6z" fill={y.v} />
      <path d="M30.4 4.6H36v1.8h-5.6z" fill={y.t} />
    </>),
  },

  /* ══════════════ do'kon bezaklari ══════════════ */

  gul: {
    rang: "binafsha", jon: "az-chayqal", davom: "3.4s", emoji: ["🌸"],
    chiz: (y) => (<>
      {soya(y, 10.4, 35)}
      <circle cx="20" cy="11.4" r="6.4" fill={y.r} />
      <circle cx="28.9" cy="18" r="6.4" fill={y.r} />
      <circle cx="25.5" cy="28.4" r="6.4" fill={y.r} />
      <circle cx="14.5" cy="28.4" r="6.4" fill={y.r} />
      <circle cx="11.1" cy="18" r="6.4" fill={y.r} />
      <circle cx="20" cy="20.8" r="5.4" fill="#fff3b0" />
      <circle cx="20" cy="20.8" r="3" fill="#e8b93c" opacity=".7" />
      {yalt(16.4, 9.6, 2.4, 1.6, -30, 0.4)}
    </>),
  },

  shlyapa: {
    rang: "binafsha", jon: "az-sakra", davom: "2.8s", emoji: ["🎩"],
    chiz: (y) => (<>
      {soya(y, 13.5, 34.4)}
      <path d="M12 8v18.4a8 3.4 0 0016 0V8z" fill={y.v} />
      <ellipse cx="20" cy="8" rx="8" ry="3.4" fill={y.t} />
      <path d="M12 19h16v4.4H12z" fill="var(--bd)" opacity=".55" />
      <path d="M5 27.6a15 4.6 0 0130 0 15 4.6 0 01-30 0z" fill={y.v} />
      <ellipse cx="20" cy="27.6" rx="15" ry="4.6" fill={y.t} />
      <ellipse cx="20" cy="27.6" rx="8" ry="3.4" fill="var(--bd)" opacity=".35" />
      {yalt(14.6, 13, 1.8, 4.4, -8, 0.28)}
    </>),
  },

  koznoynak: {
    rang: "zangori", jon: "az-nafas", davom: "2.6s", emoji: ["🕶"],
    chiz: (y) => (<>
      {soya(y, 12, 33.4, 0.24)}
      <path d="M5 16.5L9.4 11h21.2l4.4 5.5" stroke="var(--bm)" strokeWidth="2.8"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="16" width="15" height="12" rx="4.4" fill={y.v} />
      <rect x="22" y="16" width="15" height="12" rx="4.4" fill={y.v} />
      <path d="M18 19.6h4" stroke="var(--bm)" strokeWidth="3" strokeLinecap="round" />
      {yalt(8.4, 19.8, 3.4, 1.8, -18, 0.35)}
      {yalt(27.4, 19.8, 3.4, 1.8, -18, 0.28)}
    </>),
  },

  sharf: {
    rang: "qizil", jon: "az-chayqal", davom: "3s", emoji: ["🧣"],
    chiz: (y) => (<>
      {soya(y, 9, 36, 0.26)}
      <path d="M8 9h24v6.6a12 12 0 01-24 0z" fill={y.v} />
      <ellipse cx="20" cy="9" rx="12" ry="4" fill={y.t} />
      <path d="M15.8 20.6h6.8v13.2a3.4 3.4 0 01-6.8 0z" fill={y.v} />
      <path d="M15.8 20.6h6.8v3.8h-6.8z" fill="var(--bl)" opacity=".5" />
      {yalt(12.6, 13.6, 2.2, 3.4, -10, 0.3)}
    </>),
  },

  kitob: {
    rang: "olov", jon: "az-nafas", davom: "3s", emoji: ["📚"],
    chiz: (y) => (<>
      {soya(y, 13, 34.5)}
      <path d="M20 6.5l14.5 6-14.5 6-14.5-6z" fill={y.t} />
      <path d="M5.5 12.5v8.5l14.5 6.4v-8.9z" fill={y.v} />
      <path d="M34.5 12.5v8.5l-14.5 6.4v-8.9z" fill={y.s} />
      <path d="M20 6.5l14.5 6-4 1.7L16 8.1z" fill="#fff" opacity=".26" />
      <path d="M5.5 21.4v3.1l14.5 6.4v-3.1z" fill="#fff6ea" opacity=".85" />
      <path d="M34.5 21.4v3.1L20 30.9v-3.1z" fill="#f0e2cf" opacity=".8" />
    </>),
  },

  qizilKitob: {
    rang: "qizil", jon: "az-nafas", davom: "3s", emoji: ["📕"],
    chiz: (y) => (<>
      {soya(y, 12, 34.5)}
      <path d="M20 7l13.5 5.6L20 18.2 6.5 12.6z" fill={y.t} />
      <path d="M6.5 12.6v8.8L20 27.4v-9.2z" fill={y.v} />
      <path d="M33.5 12.6v8.8L20 27.4v-9.2z" fill={y.s} />
      <path d="M6.5 21.8v2.9L20 30.7v-2.9z" fill="#fff6ea" opacity=".85" />
      <path d="M33.5 21.8v2.9L20 30.7v-2.9z" fill="#eedcc8" opacity=".8" />
      <path d="M20 7l13.5 5.6-3.8 1.6L16.2 8.5z" fill="#fff" opacity=".24" />
    </>),
  },

  yulduzcha: {
    rang: "sariq", jon: "az-yaltira", davom: "2.2s", emoji: ["✨"],
    chiz: (y) => (<>
      <path d="M15.6 4l3 9.4 9.4 3-9.4 3-3 9.4-3-9.4-9.4-3 9.4-3z" fill={y.r} />
      <path d="M29.4 22.6l1.6 4.6 4.6 1.6-4.6 1.6-1.6 4.6-1.6-4.6-4.6-1.6 4.6-1.6z"
        fill={y.r} opacity=".9" />
      {yalt(13, 12.4, 2, 1.4, -38, 0.5)}
    </>),
  },

  toj: {
    rang: "sariq", jon: "az-yaltira", davom: "3s", emoji: ["👑"],
    chiz: (y) => (<>
      {soya(y, 12.5, 35.4)}
      <path d="M5.4 26L3 10.6l9.2 6.2L20 6.4l7.8 10.4 9.2-6.2L34.6 26z" fill={y.v} />
      <path d="M5.4 26L3 10.6l9.2 6.2L20 6.4v19.6z" fill={y.t} opacity=".55" />
      <path d="M5 25.4h30v4.6a15 3.2 0 01-30 0z" fill={y.v} />
      <ellipse cx="20" cy="25.4" rx="15" ry="3.2" fill={y.t} />
      <circle cx="20" cy="18.4" r="2.8" fill="#ff8c7a" />
      <circle cx="11.6" cy="16.4" r="2" fill="#7fd0f0" />
      <circle cx="28.4" cy="16.4" r="2" fill="#7fd0f0" />
      {yalt(12.6, 21, 2, 3, -8, 0.3)}
    </>),
  },

  raketa: {
    rang: "zangori", jon: "az-uch", davom: "2.4s", emoji: ["🚀"],
    chiz: (y) => (<>
      {soya(y, 8, 36, 0.28)}
      <path d="M11.4 20.6l-5.6 6.6 7-1.8zM28.6 20.6l5.6 6.6-7-1.8z" fill={y.s} />
      <path d="M20 3.6c5.9 4.9 8.7 11.4 8.7 18.6L24.4 29h-8.8l-4.3-6.8C11.3 15 14.1 8.5 20 3.6z"
        fill={y.v} />
      <path d="M20 3.6c-3.1 2.6-5.3 5.8-6.6 9.3-1.3 3.5-1.6 6.8-1.1 9.3L15.6 29h2.6L16 22.2c-.5-2.5-.2-5.8 1.1-9.3 1-2.8 2.6-5.4 4.8-7.7z"
        fill="#fff" opacity=".24" />
      <circle cx="20" cy="15.6" r="4.4" fill="#cfeaf6" />
      <circle cx="20" cy="15.6" r="3" fill="#6fb8d8" opacity=".65" />
      <ellipse cx="18.4" cy="14" rx="1.4" ry="1.1" fill="#fff" opacity=".85" />
      <path d="M16 29.4h8l-4 7.2z" fill="#ffb44a" />
      <path d="M17.8 29.4h4.4l-2.2 4.4z" fill="#ffe9a8" />
    </>),
  },

  bitiruv: {
    rang: "binafsha", jon: "az-sakra", davom: "2.9s", emoji: ["🎓"],
    chiz: (y) => (<>
      {soya(y, 12, 35.4)}
      <path d="M10 18.4v7.2c0 3 4.5 5.4 10 5.4s10-2.4 10-5.4v-7.2l-10 4.4z" fill={y.v} />
      <path d="M20 6.8L3.4 14.2 20 21.6l16.6-7.4z" fill={y.t} />
      <path d="M20 6.8L3.4 14.2 20 21.6z" fill="var(--bd)" opacity=".18" />
      <path d="M34.6 16.4v8.4" stroke="#ffd45c" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="34.6" cy="26.4" r="2.4" fill="#ffd45c" />
      {yalt(26, 12.6, 3.4, 1.6, -22, 0.3)}
    </>),
  },

  olov: {
    rang: "olov", jon: "az-tebran", davom: "1.3s", emoji: ["🔥"],
    chiz: (y) => (<>
      <ellipse cx="20" cy="36.4" rx="9.5" ry="2" fill="#e0761a" opacity=".35" filter={y.b} />
      <path d="M20 2.8c1.6 7.6-4.2 9-6.5 14.5-3.2 7.2 1 19.6 6.5 19.6s9.7-5.4 9.7-12.3c0-5.6-3.7-8.4-5-12.1-1.8 2.1-1.3 4.7-1.3 4.7S22.3 11.1 20 2.8z"
        fill={y.v} />
      <path d="M20 12c1.1 5.2-2.9 6.1-4.5 10-2.2 4.9.7 13.4 4.5 13.4s6.7-3.7 6.7-8.4c0-3.9-2.6-5.8-3.5-8.3-1.2 1.4-.9 3.2-.9 3.2S21.6 17.7 20 12z"
        fill="#ffd166" />
      <path d="M20 22.4c1.9 2.5 3.2 3.5 3.2 5.7 0 2.1-1.4 3.4-3.2 3.4s-3.2-1.3-3.2-3.4c0-2.2 1.3-3.2 3.2-5.7z"
        fill="#fff7d6" />
      <path d="M14.6 12.4c-.8 2.4-1 4.4-.6 6.2" stroke="#fff" strokeWidth="1.4"
        fill="none" opacity=".35" strokeLinecap="round" />
    </>),
  },

  kometa: {
    rang: "zangori", jon: "az-uch", davom: "2.2s", emoji: ["☄"],
    chiz: (y) => (<>
      <path d="M21.4 17.6L6 32.4M18.4 13.6L4.4 22.6M25.6 24.6L15 33.4"
        stroke="var(--bm)" strokeWidth="3.2" strokeLinecap="round" opacity=".55" />
      <circle cx="27.4" cy="12" r="7.6" fill={y.r} />
      {yalt(24.6, 9.2, 2.6, 1.8, -30, 0.45)}
    </>),
  },

  olmos: {
    rang: "zangori", jon: "az-yaltira", davom: "2.6s", emoji: ["💎"],
    chiz: (y) => (<>
      {soya(y, 10, 36, 0.28)}
      <path d="M12 5.5h16l8 9L20 34.5 4 14.5z" fill={y.v} />
      <path d="M12 5.5L4 14.5h32l-8-9z" fill={y.t} />
      <path d="M4 14.5h32L20 34.5z" fill={y.v} />
      <path d="M20 14.5L12 5.5 4 14.5z" fill="#fff" opacity=".22" />
      <path d="M12 5.5l8 9 8-9M4 14.5L20 34.5l16-20" stroke="var(--bd)"
        strokeWidth="1.2" fill="none" opacity=".42" />
      <path d="M20 14.5v20" stroke="var(--bd)" strokeWidth="1.2" opacity=".3" />
      {yalt(10.6, 10.4, 2.8, 1.4, -30, 0.5)}
    </>),
  },

  ajdar: {
    rang: "yashil", jon: "az-tebran", davom: "2.4s", emoji: ["🐉"],
    chiz: (y) => (<>
      {soya(y, 11, 35.4)}
      <path d="M14.4 7l3.6 6.6M25.6 6.4l-2.4 7.2" stroke="var(--bm)"
        strokeWidth="3.2" strokeLinecap="round" />
      <path d="M7.4 25c0-7.6 5.6-13.2 13-13.2S33.6 16.4 33.6 23.2c0 5.2-4 8.8-8.8 8.8H11.4A4 4 0 017.4 28z"
        fill={y.r} />
      <path d="M7.4 26.4H3l2.4 3.2-2 3.2h4z" fill={y.s} />
      <circle cx="26" cy="21.6" r="3" fill="#fff" />
      <circle cx="26.8" cy="21.6" r="1.5" fill="#243" />
      <path d="M13.4 27.4c2.6 2 6 2 8.6 0" stroke="var(--bd)" strokeWidth="1.8"
        fill="none" strokeLinecap="round" opacity=".5" />
      {yalt(14, 17.4, 3.4, 2, -22, 0.3)}
    </>),
  },

  /* ══════════════ o'yinlar ══════════════ */

  chaqmoq: {
    rang: "sariq", jon: "az-yaltira", davom: "1.6s", emoji: ["⚡"],
    chiz: (y) => (<>
      <path d="M24.4 2.6L8.4 24.2h9.6L14.4 37.4 32 16.4H21.6z" fill={y.s} opacity=".55"
        transform="translate(1.2 1.2)" />
      <path d="M24.4 2.6L8.4 24.2h9.6L14.4 37.4 32 16.4H21.6z" fill={y.v} />
      <path d="M24.4 2.6L8.4 24.2h5L24 6.4z" fill="#fff" opacity=".3" />
    </>),
  },

  kopaytir: {
    rang: "binafsha", jon: "az-aylan", davom: "3.4s", emoji: ["✖"],
    chiz: (y) => (<>
      {soya(y, 11, 35.6)}
      <g transform="rotate(45 20 21.6)">
        <rect x="16.6" y="6.6" width="6.8" height="30" rx="3.4" fill={y.s} />
        <rect x="6.6" y="16.6" width="30" height="6.8" rx="3.4" fill={y.s} />
      </g>
      <g transform="rotate(45 20 19.4)">
        <rect x="16.6" y="4.4" width="6.8" height="30" rx="3.4" fill={y.v} />
        <rect x="4.4" y="16.6" width="30" height="6.8" rx="3.4" fill={y.v} opacity=".94" />
        <rect x="17.8" y="6" width="2.4" height="26" rx="1.2" fill="#fff" opacity=".3" />
      </g>
    </>),
  },

  savol: {
    rang: "zangori", jon: "az-sakra", davom: "2.6s", emoji: ["❓"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="22" r="16.2" fill={y.s} opacity=".5" />
      <circle cx="20" cy="20" r="16.2" fill={y.r} />
      <path d="M14.6 15.4a5.4 5.4 0 119.4 3.9c-1.9 1.7-2.8 2.8-2.8 4.7"
        stroke="#fff" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="21.2" cy="29.4" r="2.5" fill="#fff" />
      {yalt(13, 11.6, 4, 2.4, -30, 0.32)}
    </>),
  },

  raqamlar: {
    rang: "binafsha", jon: "az-nafas", davom: "2.6s", emoji: ["🔢"],
    chiz: (y) => (<>
      {soya(y, 12, 35.4, 0.26)}
      <rect x="4" y="6" width="14.2" height="14.2" rx="4" fill={y.s} transform="translate(1 1)" />
      <rect x="4" y="6" width="14.2" height="14.2" rx="4" fill={y.v} />
      <rect x="21.8" y="6" width="14.2" height="14.2" rx="4" fill={y.s} transform="translate(1 1)" />
      <rect x="21.8" y="6" width="14.2" height="14.2" rx="4" fill={y.v} opacity=".88" />
      <rect x="4" y="15.8" width="14.2" height="14.2" rx="4" fill={y.s} transform="translate(1 1)" />
      <rect x="4" y="15.8" width="14.2" height="14.2" rx="4" fill={y.v} opacity=".88" />
      <rect x="21.8" y="15.8" width="14.2" height="14.2" rx="4" fill={y.s} transform="translate(1 1)" />
      <rect x="21.8" y="15.8" width="14.2" height="14.2" rx="4" fill={y.v} />
      <path d="M9.8 9.6l1.6-.8v6.4M26.6 10.4a2 2 0 013.8.8c0 1.8-3.8 2.6-3.8 4.4h3.9M9 19.4h3.8l-2 2.6h.3a2 2 0 11-2 2.6M28.6 19.4v4.2h3.4m-1.4-2v6.4"
        stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>),
  },

  koz: {
    rang: "zangori", jon: "az-qara", davom: "4s", emoji: ["👁"],
    chiz: (y) => (<>
      <path d="M20 8c9.2 0 16 7.2 18.2 12-2.2 4.8-9 12-18.2 12S4 24.8 1.8 20C4 15.2 10.8 8 20 8z"
        fill={y.v} />
      <path d="M20 8c9.2 0 16 7.2 18.2 12-9-6.6-27.4-6.6-36.4 0C4 15.2 10.8 8 20 8z"
        fill="#fff" opacity=".28" />
      <circle cx="20" cy="20" r="7.4" fill="#fff" />
      <circle cx="20" cy="20" r="4.4" fill={y.s} />
      <circle cx="20" cy="20" r="2" fill="#12222c" />
      <circle cx="17.8" cy="17.6" r="1.6" fill="#fff" opacity=".9" />
    </>),
  },

  tarozi: {
    rang: "yashil", jon: "az-chayqal", davom: "3.2s", emoji: ["⚖"],
    chiz: (y) => (<>
      {soya(y, 9, 35.6, 0.26)}
      <path d="M16.4 32.4h7.2v2.4a3.6 1.4 0 01-7.2 0z" fill={y.s} />
      <ellipse cx="20" cy="32.4" rx="7.2" ry="2.6" fill={y.t} />
      <path d="M18.6 8h2.8v25h-2.8z" fill={y.v} />
      <path d="M5 11.4h30" stroke="var(--bm)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="11.4" r="3" fill={y.t} />
      <path d="M2 20.4h10L7 11.6z" fill={y.v} />
      <path d="M2 20.4a5 2 0 0010 0z" fill={y.s} />
      <path d="M28 20.4h10L33 11.6z" fill={y.v} />
      <path d="M28 20.4a5 2 0 0010 0z" fill={y.s} />
      {yalt(6, 15.6, 1.6, 2.4, -18, 0.3)}
    </>),
  },

  zar: {
    rang: "qizil", jon: "az-aylan", davom: "3s", emoji: ["🎲"],
    chiz: (y) => (<>
      {soya(y, 12, 35.6)}
      <path d="M20 4l14 6v13l-14 6-14-6V10z" fill={y.v} />
      <path d="M20 4l14 6-14 6-14-6z" fill={y.t} />
      <path d="M34 10v13l-14 6V16z" fill={y.s} />
      <path d="M20 4l14 6-4 1.8L16.4 5.6z" fill="#fff" opacity=".24" />
      {/* tepa yoq: uchta nuqta — chizmaga MOS burchakda yotadi */}
      <ellipse cx="13.4" cy="9.4" rx="1.6" ry=".9" fill="#fff" opacity=".92" />
      <ellipse cx="20" cy="12.2" rx="1.6" ry=".9" fill="#fff" opacity=".92" />
      <ellipse cx="26.6" cy="9.4" rx="1.6" ry=".9" fill="#fff" opacity=".92" />
      {/* old yoq: ikkita */}
      <ellipse cx="11.6" cy="15.6" rx="1.5" ry="1.7" fill="#fff" opacity=".85" />
      <ellipse cx="15.6" cy="22.6" rx="1.5" ry="1.7" fill="#fff" opacity=".85" />
      {/* yon yoq: bitta */}
      <ellipse cx="27" cy="19.4" rx="1.4" ry="1.7" fill="#fff" opacity=".62" />
    </>),
  },

  miya: {
    rang: "binafsha", jon: "az-nafas", davom: "2.4s", emoji: ["🧠"],
    chiz: (y) => (<>
      {soya(y, 11, 35.6)}
      <path d="M18.8 6a6.4 6.4 0 00-6.4 5.4A5.8 5.8 0 008 17.2a5.8 5.8 0 002.7 4.8 5.8 5.8 0 004.5 10c2.2 0 4-1.4 4.6-2.6z"
        fill={y.r} />
      <path d="M21.2 6a6.4 6.4 0 016.4 5.4 5.8 5.8 0 014.4 5.8 5.8 5.8 0 01-2.7 4.8 5.8 5.8 0 01-4.5 10c-2.2 0-4-1.4-4.6-2.6z"
        fill={y.v} />
      <path d="M15.4 13.4c-2.8 0-3.4 2.8-1.4 4.2M24.6 13.4c2.8 0 3.4 2.8 1.4 4.2M20 6v23.8M14 22c2.4.6 3.6 2.4 3.6 4.4M26 22c-2.4.6-3.6 2.4-3.6 4.4"
        stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" opacity=".6" />
      {yalt(14.4, 12, 2.6, 1.8, -30, 0.3)}
    </>),
  },

  nishon: {
    rang: "qizil", jon: "az-nafas", davom: "2s", emoji: ["🎯"],
    chiz: (y) => (<>
      {soya(y, 11, 36)}
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <circle cx="20" cy="20" r="11.2" fill="#fdf6ec" />
      <circle cx="20" cy="20" r="6.6" fill={y.v} />
      <circle cx="20" cy="20" r="2.6" fill="#fdf6ec" />
      {yalt(12.4, 11.8, 4.4, 2.6, -32, 0.3)}
    </>),
  },

  /* ══════════════ masala ══════════════ */

  yoqdi: {
    rang: "yashil", jon: "az-sakra", davom: "2.2s", emoji: ["👍"],
    chiz: (y) => (<>
      {soya(y, 10, 36, 0.26)}
      <path d="M14.4 16.4L21.8 4.4c3.2 0 5.1 2.5 4.6 5.6l-.8 4.8h7.9c2.5 0 4.4 2.4 3.8 4.9l-2.5 11.5a4 4 0 01-3.9 3.1H14.4z"
        fill={y.v} />
      <path d="M14.4 16.4L21.8 4.4c1.5 0 2.8.6 3.6 1.6L17 16.4z" fill="#fff" opacity=".24" />
      <rect x="3.2" y="16" width="9" height="18.3" rx="3.2" fill={y.v} />
      <rect x="3.2" y="16" width="9" height="18.3" rx="3.2" fill="var(--bd)" opacity=".2" />
      <rect x="4.6" y="18" width="2.4" height="14" rx="1.2" fill="#fff" opacity=".28" />
    </>),
  },

  yoqmadi: {
    rang: "qizil", jon: "az-tebran", davom: "2.4s", emoji: ["👎"],
    chiz: (y) => (<>
      <g transform="rotate(180 20 20)">
        <path d="M14.4 16.4L21.8 4.4c3.2 0 5.1 2.5 4.6 5.6l-.8 4.8h7.9c2.5 0 4.4 2.4 3.8 4.9l-2.5 11.5a4 4 0 01-3.9 3.1H14.4z"
          fill={y.v} />
        <rect x="3.2" y="16" width="9" height="18.3" rx="3.2" fill={y.v} />
        <rect x="3.2" y="16" width="9" height="18.3" rx="3.2" fill="var(--bd)" opacity=".2" />
      </g>
    </>),
  },

  goya: {
    rang: "sariq", jon: "az-yaltira", davom: "1.8s", emoji: ["💡"],
    chiz: (y) => (<>
      {soya(y, 7.5, 37, 0.26)}
      <path d="M20 2.5a12.2 12.2 0 00-7.3 22v4.1h14.6v-4.1A12.2 12.2 0 0020 2.5z" fill={y.r} />
      <path d="M16 10.4a6.2 6.2 0 014-2.4" stroke="#fff" strokeWidth="2.2"
        fill="none" strokeLinecap="round" opacity=".7" />
      <path d="M20 15v13.6M16.4 19.4L20 22.4l3.6-3" stroke="#c98f12" strokeWidth="1.5"
        fill="none" strokeLinecap="round" opacity=".55" />
      <path d="M12.7 29.2h14.6v2.4a1.6 1.6 0 01-1.6 1.6H14.3a1.6 1.6 0 01-1.6-1.6z"
        fill="#b8bec6" />
      <path d="M12.7 32.6h14.6v1.6a1.6 1.6 0 01-1.6 1.6H14.3a1.6 1.6 0 01-1.6-1.6z"
        fill="#9aa2ab" />
      <path d="M15.6 36.2h8.8v.6a1.6 1.6 0 01-1.6 1.6h-5.6a1.6 1.6 0 01-1.6-1.6z"
        fill="#7f8790" />
      {yalt(13.6, 11.6, 2.6, 4, -26, 0.42)}
    </>),
  },

  togri: {
    rang: "yashil", jon: "az-urish", davom: "2.4s", emoji: ["✅"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="22" r="16.4" fill={y.s} opacity=".5" />
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <path d="M11.6 20.5l5.7 5.7 10.7-11.7" stroke="#fff" strokeWidth="4.2"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {yalt(12.6, 11.6, 4.2, 2.4, -32, 0.3)}
    </>),
  },

  xato: {
    rang: "qizil", jon: "az-tebran", davom: "1.8s", emoji: ["❌"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="22" r="16.4" fill={y.s} opacity=".5" />
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <path d="M13.6 13.6l12.8 12.8M26.4 13.6L13.6 26.4" stroke="#fff"
        strokeWidth="4.2" strokeLinecap="round" />
      {yalt(12.6, 11.6, 4.2, 2.4, -32, 0.3)}
    </>),
  },

  belgiTogri: {
    rang: "yashil", jon: "az-urish", davom: "2.6s", emoji: ["✓", "✔"],
    chiz: (y) => (<>
      <path d="M6 22l9 9L34.5 10" stroke={y.s} strokeWidth="6.2" fill="none"
        strokeLinecap="round" strokeLinejoin="round" transform="translate(0 1.4)" />
      <path d="M6 22l9 9L34.5 10" stroke={y.v} strokeWidth="6.2" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />
    </>),
  },

  bayroq: {
    rang: "qizil", jon: "az-chayqal", davom: "2.4s", emoji: ["🚩"],
    chiz: (y) => (<>
      {soya(y, 5, 36.4, 0.24)}
      <path d="M9 4v32" stroke="#8b9099" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M9.4 5h21l-5 7 5 7h-21z" fill={y.v} />
      <path d="M9.4 5h21l-5 7h-16z" fill="#fff" opacity=".22" />
    </>),
  },

  qayta: {
    rang: "zangori", jon: "az-aylan", davom: "2.6s", emoji: ["🔁"],
    chiz: (y) => (<>
      <path d="M6.4 20A13.6 13.6 0 0120 6.4c4.7 0 8.9 2.4 11.4 6"
        stroke={y.v} strokeWidth="4.6" fill="none" strokeLinecap="round" />
      <path d="M33.6 20A13.6 13.6 0 0120 33.6c-4.7 0-8.9-2.4-11.4-6"
        stroke={y.v} strokeWidth="4.6" fill="none" strokeLinecap="round" />
      <path d="M32.6 3.4v9.8h-9.8zM7.4 36.6v-9.8h9.8z" fill={y.v} />
      <path d="M6.4 20A13.6 13.6 0 0120 6.4" stroke="#fff" strokeWidth="1.6"
        fill="none" strokeLinecap="round" opacity=".35" />
    </>),
  },

  bayram: {
    rang: "binafsha", jon: "az-tebran", davom: "1.6s", emoji: ["🎉"],
    chiz: (y) => (<>
      <path d="M3 37l9.6-23.4 13.8 13.8z" fill={y.v} />
      <path d="M3 37l4.6-11.2 6.6 6.6z" fill="#fff" opacity=".26" />
      <path d="M12.6 13.6l13.8 13.8" stroke="var(--bd)" strokeWidth="1.4" opacity=".4" />
      <circle cx="30.6" cy="7.4" r="2.6" fill="#ffd45c" />
      <circle cx="36" cy="16.6" r="2.2" fill="#7fd0f0" />
      <circle cx="23" cy="3.6" r="2" fill="#ff8c7a" />
      <path d="M28 22l4.2-2.4M31.4 27.6l4.2-1.4" stroke="#48c97a"
        strokeWidth="2.6" strokeLinecap="round" />
    </>),
  },

  /* ══════════════ duel ══════════════ */

  qilich: {
    rang: "zangori", jon: "az-tebran", davom: "2.2s", emoji: ["⚔"],
    chiz: (y) => (<>
      <path d="M5 4.4h5.2l18.8 18.8-5.2 5.2z" fill="#c9d6de" />
      <path d="M5 4.4h5.2l18.8 18.8-2.6 2.6L5 4.4z" fill="#fff" opacity=".55" />
      <path d="M35 4.4h-5.2L11 23.2l5.2 5.2z" fill="#aebcc6" />
      <rect x="2.4" y="27.4" width="11" height="4.8" rx="2.4" fill={y.v}
        transform="rotate(-45 7.9 29.8)" />
      <rect x="26.6" y="27.4" width="11" height="4.8" rx="2.4" fill={y.v}
        transform="rotate(45 32.1 29.8)" />
      <circle cx="20" cy="35" r="3" fill={y.t} />
    </>),
  },

  maydon: {
    rang: "yashil", jon: "az-nafas", davom: "3s", emoji: ["🏟"],
    chiz: (y) => (<>
      {soya(y, 15, 34.4, 0.26)}
      <path d="M2 19v5.6c0 6.6 8 12 18 12s18-5.4 18-12V19z" fill={y.s} />
      <ellipse cx="20" cy="19" rx="18" ry="12" fill={y.v} />
      <ellipse cx="20" cy="19" rx="13" ry="8.2" fill={y.t} />
      <ellipse cx="20" cy="19" rx="5.4" ry="3.4" fill="none" stroke="#fff"
        strokeWidth="1.4" opacity=".65" />
      <path d="M20 10.8v16.4" stroke="#fff" strokeWidth="1.4" opacity=".65" />
      {yalt(11, 14, 4.4, 2.2, -12, 0.28)}
    </>),
  },

  qolBerish: {
    rang: "yashil", jon: "az-nafas", davom: "2.2s", emoji: ["🤝"],
    chiz: (y) => (<>
      {soya(y, 11, 33.4, 0.24)}
      <path d="M1.5 16.5l8.5-5.5 10.5 5-5.5 6.5z" fill={y.s} />
      <path d="M38.5 16.5L30 11l-10.5 5 5.5 6.5z" fill={y.s} />
      <rect x="9" y="16.5" width="22" height="10" rx="5" fill={y.v} />
      <rect x="9" y="16.5" width="22" height="4" rx="2" fill="#fff" opacity=".2" />
      <path d="M14 21.5h12" stroke="var(--bd)" strokeWidth="2" strokeLinecap="round" opacity=".5" />
    </>),
  },

  xafa: {
    rang: "zangori", jon: "az-tebran", davom: "3.4s", emoji: ["😔"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <path d="M11 16.6c2-2.2 5-2.2 7 0M22 16.6c2-2.2 5-2.2 7 0"
        stroke="#2b4250" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M13.4 29c3.4-4 8.6-4 12 0" stroke="#2b4250" strokeWidth="2.8"
        fill="none" strokeLinecap="round" />
      {yalt(12.6, 11.6, 4.2, 2.4, -32, 0.3)}
    </>),
  },

  uyalish: {
    rang: "olov", jon: "az-tebran", davom: "2.6s", emoji: ["🙈"],
    chiz: (y) => (<>
      {soya(y, 11, 36)}
      <circle cx="6" cy="15" r="5.6" fill={y.s} />
      <circle cx="34" cy="15" r="5.6" fill={y.s} />
      <circle cx="20" cy="20.5" r="14.4" fill={y.r} />
      <ellipse cx="20" cy="25.6" rx="8.4" ry="6.6" fill="#ffe0bd" opacity=".75" />
      <path d="M6 23c4.8-4.2 8.8-4.2 13.4 0M34 23c-4.8-4.2-8.8-4.2-13.4 0"
        stroke={y.v} strokeWidth="3.8" fill="none" strokeLinecap="round" />
      <path d="M16 30.4h8" stroke="#8a5a2a" strokeWidth="2.4" strokeLinecap="round" />
    </>),
  },

  ogohlantirish: {
    rang: "sariq", jon: "az-urish", davom: "2s", emoji: ["⚠"],
    chiz: (y) => (<>
      {soya(y, 13, 35.4, 0.26)}
      <path d="M20 4.4c1.3 0 2.5.7 3.2 1.9l13.4 23.8c1.3 2.4-.4 5.4-3.2 5.4H6.6c-2.8 0-4.5-3-3.2-5.4L16.8 6.3A3.7 3.7 0 0120 4.4z"
        fill={y.v} />
      <path d="M20 4.4c1.3 0 2.5.7 3.2 1.9l13.4 23.8-3.4-1.6L20 6.4z"
        fill="#fff" opacity=".22" />
      <rect x="17.7" y="13" width="4.6" height="11.6" rx="2.3" fill="#4a3200" />
      <circle cx="20" cy="29.4" r="2.7" fill="#4a3200" />
    </>),
  },

  /* ══════════════ munosabat ══════════════ */

  qarsak: {
    rang: "olov", jon: "az-urish", davom: "1.4s", emoji: ["👏"],
    chiz: (y) => (<>
      <g transform="rotate(-16 12 25)">
        <rect x="5" y="15" width="13.4" height="19.4" rx="5.4" fill={y.v} />
        <rect x="7" y="17.4" width="3" height="14" rx="1.5" fill="#fff" opacity=".26" />
      </g>
      <g transform="rotate(16 26 25)">
        <rect x="20" y="15" width="13.4" height="19.4" rx="5.4" fill={y.v} opacity=".9" />
      </g>
      <path d="M20 2.6v6M9.6 5.4l3 5.2M30.4 5.4l-3 5.2" stroke="#ffd45c"
        strokeWidth="3" strokeLinecap="round" />
    </>),
  },

  kuch: {
    rang: "qizil", jon: "az-nafas", davom: "1.8s", emoji: ["💪"],
    chiz: (y) => (<>
      {soya(y, 12, 34.4, 0.24)}
      <path d="M4 25.6A6.4 6.4 0 0110.4 19h4.4c1.4-4.6 4.8-7.8 9.4-7.8 5.6 0 9.6 4.2 9.6 9.4s-4 9.4-9.6 9.4H10.4A6.4 6.4 0 014 25.6z"
        fill={y.v} />
      <path d="M23 15.6a5.2 5.2 0 010 10.4" stroke="#fff" strokeWidth="2.4"
        fill="none" strokeLinecap="round" opacity=".5" />
      <path d="M6.6 22c2-1 4-1.2 6-.6" stroke="#fff" strokeWidth="2"
        fill="none" strokeLinecap="round" opacity=".3" />
    </>),
  },

  salom: {
    rang: "olov", jon: "az-chayqal", davom: "1.4s", emoji: ["👋"],
    chiz: (y) => (<>
      <rect x="8.6" y="7" width="4.6" height="16" rx="2.3" fill={y.v} />
      <rect x="14.2" y="4" width="4.6" height="19" rx="2.3" fill={y.v} />
      <rect x="19.8" y="5.4" width="4.6" height="17.6" rx="2.3" fill={y.v} />
      <rect x="25.4" y="9.2" width="4.6" height="13.8" rx="2.3" fill={y.v} />
      <path d="M7.4 20.2h23v5.4c0 5.6-4.6 10.2-10.2 10.2h-2.6C12 35.8 7.4 31.2 7.4 25.6z"
        fill={y.v} />
      <path d="M9.4 21.6h4v10.6c-2.4-1.8-4-4.4-4-7.4z" fill="#fff" opacity=".22" />
    </>),
  },

  oylash: {
    rang: "binafsha", jon: "az-chayqal", davom: "3.6s", emoji: ["🤔"],
    chiz: (y) => (<>
      {soya(y, 10, 35)}
      <circle cx="18.4" cy="18.4" r="15" fill={y.r} />
      <circle cx="13" cy="16" r="2.3" fill="#3a2450" />
      <circle cx="23.8" cy="16" r="2.3" fill="#3a2450" />
      <path d="M13.2 26.4c2.8-1.5 8-2.2 11.4-.7" stroke="#3a2450"
        strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <circle cx="33.4" cy="31.4" r="3.4" fill={y.v} opacity=".85" />
      <circle cx="37" cy="36.4" r="1.8" fill={y.v} opacity=".7" />
      {yalt(11.4, 10.4, 4, 2.4, -32, 0.3)}
    </>),
  },

  kulimsirash: {
    rang: "sariq", jon: "az-nafas", davom: "2.8s", emoji: ["😏"],
    chiz: (y) => (<>
      {soya(y, 10, 36)}
      <circle cx="20" cy="20" r="16.4" fill={y.r} />
      <path d="M11 16.4h6.4M21.8 15.6c2.1-1.9 4.7-1.5 6.4.8"
        stroke="#5a3f00" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M13.2 26c4 3.4 9.4 2.6 12.8-2.2" stroke="#5a3f00"
        strokeWidth="3.2" fill="none" strokeLinecap="round" />
      {yalt(12.6, 11.6, 4.2, 2.4, -32, 0.3)}
    </>),
  },

  nihol: {
    rang: "yashil", jon: "az-chayqal", davom: "3.8s", emoji: ["🌱"],
    chiz: (y) => (<>
      {soya(y, 7, 36.4, 0.24)}
      <path d="M20 36.4V16.4" stroke={y.v} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M20 20.4C20 12.6 15 7.4 5.8 7.4c0 7.8 5.2 13 14.2 13z" fill={y.v} />
      <path d="M20 23c0-6.6 4.6-11.2 13.2-11.2 0 7.2-4.6 11.2-13.2 11.2z"
        fill={y.v} opacity=".82" />
      <path d="M11 10.4c4 1.4 7 4 9 7.6" stroke="#fff" strokeWidth="1.4"
        fill="none" strokeLinecap="round" opacity=".35" />
    </>),
  },

  /* ══════════════ shakl, rang, yo'nalish ══════════════ */

  doira: {
    rang: "qizil", jon: "az-nafas", davom: "2.4s", emoji: ["⭕"],
    chiz: (y) => (<>
      {soya(y, 12, 35.6, 0.24)}
      <circle cx="20" cy="21.4" r="14" fill="none" stroke={y.s} strokeWidth="7.4" />
      <circle cx="20" cy="20" r="14" fill="none" stroke={y.v} strokeWidth="7.4" />
      <path d="M9.4 10.8a14 14 0 00-3 6.4" stroke="#fff" strokeWidth="2.4"
        fill="none" strokeLinecap="round" opacity=".35" />
    </>),
  },

  uchburchak: {
    rang: "qizil", jon: "az-nafas", davom: "2.6s", emoji: ["🔺"],
    chiz: (y) => (<>
      {soya(y, 13, 35.4, 0.24)}
      <path d="M20 5.4l16.4 28.4H3.6z" fill={y.s} transform="translate(0 1.2)" />
      <path d="M20 5.4l16.4 28.4H3.6z" fill={y.v} />
      <path d="M20 5.4L3.6 33.8h5.6L20 15z" fill="#fff" opacity=".2" />
    </>),
  },

  kvadrat: {
    rang: "qizil", jon: "az-nafas", davom: "2.8s", emoji: ["🟥"],
    chiz: (y) => (<>
      {soya(y, 13, 35.4, 0.24)}
      <rect x="4.6" y="6.6" width="30.8" height="27.4" rx="4" fill={y.s} />
      <rect x="4.6" y="5.4" width="30.8" height="27.4" rx="4" fill={y.v} />
      <rect x="7.6" y="8" width="24.8" height="6" rx="3" fill="#fff" opacity=".22" />
    </>),
  },

  yurak: {
    rang: "qizil", jon: "az-urish", davom: "1.6s", emoji: ["❤", "❤️", "💗"],
    chiz: (y) => (<>
      {soya(y, 10, 36, 0.26)}
      <path d="M20 35.4S3.4 25 3.4 14.8A9.3 9.3 0 0120 10.4a9.3 9.3 0 0116.6 4.4C36.6 25 20 35.4 20 35.4z"
        fill={y.r} />
      {yalt(12.4, 14, 3.6, 2.4, -36, 0.4)}
    </>),
  },

  romb: {
    rang: "zangori", jon: "az-aylan", davom: "3.2s", emoji: ["🔷"],
    chiz: (y) => (<>
      {soya(y, 11, 36, 0.24)}
      <path d="M20 4.4L35.6 20 20 35.6 4.4 20z" fill={y.v} />
      <path d="M20 4.4L35.6 20H4.4z" fill={y.t} />
      <path d="M20 4.4L4.4 20h7.8L20 11.8z" fill="#fff" opacity=".24" />
    </>),
  },

  qizilDoira: {
    rang: "qizil", jon: "az-nafas", davom: "2.2s", emoji: ["🔴"],
    chiz: (y) => (<>{soya(y, 11, 36, 0.26)}<circle cx="20" cy="20" r="15.4" fill={y.r} />
      {yalt(13.6, 12.6, 4.2, 2.6, -32, 0.34)}</>),
  },
  sariqDoira: {
    rang: "sariq", jon: "az-nafas", davom: "2.4s", emoji: ["🟡"],
    chiz: (y) => (<>{soya(y, 11, 36, 0.26)}<circle cx="20" cy="20" r="15.4" fill={y.r} />
      {yalt(13.6, 12.6, 4.2, 2.6, -32, 0.34)}</>),
  },
  kokDoira: {
    rang: "zangori", jon: "az-nafas", davom: "2.6s", emoji: ["🔵"],
    chiz: (y) => (<>{soya(y, 11, 36, 0.26)}<circle cx="20" cy="20" r="15.4" fill={y.r} />
      {yalt(13.6, 12.6, 4.2, 2.6, -32, 0.34)}</>),
  },

  yuqoriga: {
    rang: "zangori", jon: "az-surish", davom: "1.6s", emoji: ["⬆", "⬆️"],
    chiz: (y) => (<>
      <path d="M20 3.4l14.2 15.8h-7.8v17.4H13.6V19.2H5.8z" fill={y.s} transform="translate(0 1.2)" />
      <path d="M20 3.4l14.2 15.8h-7.8v17.4H13.6V19.2H5.8z" fill={y.v} />
      <path d="M20 3.4L5.8 19.2h5L20 8.8z" fill="#fff" opacity=".24" />
    </>),
  },
  ongga: {
    rang: "zangori", jon: "az-surish", davom: "1.6s", emoji: ["➡", "➡️", "→"],
    chiz: (y) => (<g transform="rotate(90 20 20)">
      <path d="M20 3.4l14.2 15.8h-7.8v17.4H13.6V19.2H5.8z" fill={y.s} transform="translate(0 1.2)" />
      <path d="M20 3.4l14.2 15.8h-7.8v17.4H13.6V19.2H5.8z" fill={y.v} />
      <path d="M20 3.4L5.8 19.2h5L20 8.8z" fill="#fff" opacity=".24" />
    </g>),
  },
  pastga: {
    rang: "zangori", jon: "az-surish", davom: "1.6s", emoji: ["⬇", "⬇️"],
    chiz: (y) => (<g transform="rotate(180 20 20)">
      <path d="M20 3.4l14.2 15.8h-7.8v17.4H13.6V19.2H5.8z" fill={y.s} transform="translate(0 1.2)" />
      <path d="M20 3.4l14.2 15.8h-7.8v17.4H13.6V19.2H5.8z" fill={y.v} />
    </g>),
  },
  chapga: {
    rang: "zangori", jon: "az-surish", davom: "1.6s", emoji: ["⬅", "⬅️", "←"],
    chiz: (y) => (<g transform="rotate(270 20 20)">
      <path d="M20 3.4l14.2 15.8h-7.8v17.4H13.6V19.2H5.8z" fill={y.s} transform="translate(0 1.2)" />
      <path d="M20 3.4l14.2 15.8h-7.8v17.4H13.6V19.2H5.8z" fill={y.v} />
    </g>),
  },

  /* ══════════════ boshqa ══════════════ */

  qongiroq: {
    rang: "sariq", jon: "az-qoqish", davom: "2.4s", emoji: ["🔔"],
    chiz: (y) => (<>
      {soya(y, 10, 36.4, 0.24)}
      <path d="M20 3a3 3 0 013 3v1.2a12 12 0 018.2 11.4v6l3.2 5.4c.8 1.3-.1 2.9-1.6 2.9H7.2c-1.5 0-2.4-1.6-1.6-2.9l3.2-5.4v-6A12 12 0 0117 7.2V6a3 3 0 013-3z"
        fill={y.r} />
      <path d="M20 3a3 3 0 013 3v1.2a12 12 0 013.4 2C22 6.6 16 8 12.6 12.8c1-2.6 3-4.7 5.4-5.6V6a3 3 0 013-3z"
        fill="#fff" opacity=".26" />
      <path d="M15.2 33.4a4.8 4.8 0 009.6 0z" fill={y.v} />
      {yalt(14, 14.4, 2.2, 4.6, -14, 0.3)}
    </>),
  },

  asbob: {
    rang: "zangori", jon: "az-chayqal", davom: "3s", emoji: ["🛠", "🔧"],
    chiz: (y) => (<>
      {soya(y, 9, 36, 0.24)}
      <path d="M25.8 3.4a9.2 9.2 0 00-8.4 13L4.2 29.8a3.5 3.5 0 004.9 4.9l13.4-13.3a9.2 9.2 0 103.3-18z"
        fill="#b9c7d2" />
      <path d="M25.8 3.4a9.2 9.2 0 00-8.4 13l-2.3 2.3a9.2 9.2 0 0110.7-15.3z"
        fill="#fff" opacity=".5" />
      <circle cx="25.8" cy="12.6" r="4" fill={y.v} />
      <circle cx="6.6" cy="32.3" r="1.9" fill="#8f9ea9" />
    </>),
  },

  ayiqcha: {
    rang: "olov", jon: "az-sakra", davom: "2.8s", emoji: ["🧸"],
    chiz: (y) => (<>
      {soya(y, 12, 36)}
      <circle cx="8.4" cy="10.4" r="6" fill={y.v} />
      <circle cx="31.6" cy="10.4" r="6" fill={y.v} />
      <circle cx="8.4" cy="10.4" r="3.2" fill="#ffd9b8" />
      <circle cx="31.6" cy="10.4" r="3.2" fill="#ffd9b8" />
      <circle cx="20" cy="21.4" r="14.6" fill={y.r} />
      <ellipse cx="20" cy="25.6" rx="7" ry="6" fill="#ffe0bd" />
      <circle cx="14.2" cy="17.6" r="2.2" fill="#4a2d12" />
      <circle cx="25.8" cy="17.6" r="2.2" fill="#4a2d12" />
      <ellipse cx="20" cy="23.4" rx="2.9" ry="2.2" fill="#4a2d12" />
      <path d="M20 25.6v2.4M16.6 29.4c2 1.6 4.8 1.6 6.8 0" stroke="#4a2d12"
        strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {yalt(13, 13.4, 3.4, 2.2, -30, 0.3)}
    </>),
  },

  diagramma: {
    rang: "binafsha", jon: "az-nafas", davom: "2.4s", emoji: ["📊", "📈"],
    chiz: (y) => (<>
      {soya(y, 14, 36, 0.24)}
      <path d="M4.4 19.4h8.2v15.2H4.4z" fill={y.s} />
      <path d="M4.4 17.6h8.2v1.8H4.4z" fill={y.t} />
      <path d="M15.9 9.4h8.2v25.2h-8.2z" fill={y.v} />
      <path d="M15.9 7.6h8.2v1.8h-8.2z" fill={y.t} />
      <path d="M27.4 14.4h8.2v20.2h-8.2z" fill={y.v} opacity=".88" />
      <path d="M27.4 12.6h8.2v1.8h-8.2z" fill={y.t} />
      <path d="M3 36.4h34" stroke="var(--bd)" strokeWidth="2.2" strokeLinecap="round" opacity=".45" />
    </>),
  },

  boyoq: {
    rang: "binafsha", jon: "az-chayqal", davom: "3.2s", emoji: ["🎨"],
    chiz: (y) => (<>
      {soya(y, 12, 36)}
      <path d="M20 3.4c9.6 0 17.4 6.8 17.4 15 0 4.5-3.7 6.8-7.5 6.8h-3c-2.2 0-3.7 1.5-3.7 3.5 0 1 .4 1.7.9 2.5.5.6.9 1.4.9 2.2 0 2-1.7 3.5-4.2 3.5C10.4 36.9 2.6 29.4 2.6 19.4 2.6 10.4 10.4 3.4 20 3.4z"
        fill="#f0e6d8" />
      <path d="M20 3.4c9.6 0 17.4 6.8 17.4 15 0 4.5-3.7 6.8-7.5 6.8-6-6-14-9.8-22.6-11 3.2-6.4 8-10.8 12.7-10.8z"
        fill="#fff" opacity=".5" />
      <circle cx="11.6" cy="16" r="2.9" fill="#ff7a6b" />
      <circle cx="18.6" cy="10.6" r="2.9" fill="#f5b301" />
      <circle cx="26.8" cy="13" r="2.9" fill="#4fb8e0" />
      <circle cx="10.6" cy="24.8" r="2.9" fill="#48c97a" />
      <circle cx="18" cy="28.4" r="2.5" fill="#b07be8" />
    </>),
  },

  shar: {
    rang: "qizil", jon: "az-uch", davom: "3.2s", emoji: ["🎈"],
    chiz: (y) => (<>
      <ellipse cx="20" cy="15.4" rx="11.6" ry="13.4" fill={y.r} />
      <path d="M17.6 28.4h4.8l-2.4 3.2z" fill="var(--bd)" />
      <path d="M20 31.2c3 2.2-3 3.6 0 5.8" stroke="#8b9099" strokeWidth="1.6"
        fill="none" strokeLinecap="round" />
      {yalt(14.4, 10.4, 3, 4.4, -22, 0.42)}
    </>),
  },

  soyabon: {
    rang: "binafsha", jon: "az-chayqal", davom: "3.4s", emoji: ["☂", "☔"],
    chiz: (y) => (<>
      {soya(y, 8, 36.6, 0.22)}
      <path d="M20 4C10.4 4 2.6 11.4 2.6 20.4h34.8C37.4 11.4 29.6 4 20 4z" fill={y.v} />
      <path d="M11.2 20.4c0-9 3.9-16.4 8.8-16.4s8.8 7.4 8.8 16.4" fill={y.t} />
      <path d="M20 4c-4.9 0-8.8 7.4-8.8 16.4H2.6C2.6 11.4 10.4 4 20 4z" fill="#fff" opacity=".2" />
      <path d="M20 20.4v11.2a4.2 4.2 0 008.4 0" stroke="#8b9099" strokeWidth="2.8"
        fill="none" strokeLinecap="round" />
    </>),
  },

  pishloq: {
    rang: "sariq", jon: "az-sakra", davom: "3s", emoji: ["🧀"],
    chiz: (y) => (<>
      {soya(y, 14, 34.4, 0.24)}
      <path d="M3 16.4L24 6.4c7 0 13 4.6 13 10z" fill={y.t} />
      <path d="M3 16.4h34v10.2a5.4 5.4 0 01-5.4 5.4H8.4A5.4 5.4 0 013 26.6z" fill={y.v} />
      <circle cx="11.4" cy="23" r="2.9" fill="var(--bd)" opacity=".55" />
      <circle cx="25.4" cy="25.4" r="2.2" fill="var(--bd)" opacity=".55" />
      <circle cx="30.4" cy="20" r="1.8" fill="var(--bd)" opacity=".45" />
      <circle cx="17.4" cy="12" r="1.8" fill="var(--bd)" opacity=".3" />
    </>),
  },

  puzzle: {
    rang: "qizil", jon: "az-sakra", davom: "2.8s", emoji: ["🧩"],
    chiz: (y) => (<>
      {soya(y, 11, 36)}
      <path d="M13.6 5h12.8v4.4a3.4 3.4 0 100 6.8V28a3.4 3.4 0 110 6.8v.2H13.6v-4.6a3.4 3.4 0 110-6.8V10.6a3.4 3.4 0 103.4-3.4 3.4 3.4 0 00-3.4-2.2z"
        fill={y.r} />
      {yalt(17.4, 11.4, 3, 2, -28, 0.3)}
    </>),
  },

  suyak: {
    rang: "kumush", jon: "az-chayqal", davom: "3s", emoji: ["🦴"],
    chiz: (y) => (<>
      {soya(y, 11, 36, 0.22)}
      <path d="M10.6 9.4a4.9 4.9 0 117.5 5.5l11.5 11.5a4.9 4.9 0 11-5.5 7.5 4.9 4.9 0 11-7.5-5.5L15.1 17a4.9 4.9 0 11-4.5-7.6z"
        fill="#f2f4f6" />
      <path d="M10.6 9.4a4.9 4.9 0 117.5 5.5l-2 2A4.9 4.9 0 0010.6 9.4z"
        fill="#fff" opacity=".8" />
      <path d="M18.1 14.9l11.5 11.5" stroke="#d5dbe0" strokeWidth="1.4" opacity=".8" />
    </>),
  },

} satisfies Record<string, Belgi>;
