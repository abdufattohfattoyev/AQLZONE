/**
 * 10–11-sinf geometriya — stereometriya.
 *
 * Manba:
 *   "Geometriya 10" — stereometriyaga kirish, fazoda to'g'ri chiziq va
 *     tekisliklarning parallelligi hamda perpendikulyarligi
 *   "Matematika 11, I qism" — fazoda koordinatalar va vektorlar,
 *     prizma va silindr
 *   "Matematika 11, II qism" — piramida va konus, sfera va shar
 *
 * ────────────── FAZOVIY MASALA CHIZMASIZ BO'LADIMI ──────────────
 *
 * Ha, va bu yerda hatto qulayroq. Fazoviy chizma ikki o'lchovli
 * ekranda o'zi ham shartli: kub qiyshiq to'rtburchak bo'lib chiziladi
 * va o'quvchi uni "o'qishni" alohida o'rganadi. Formulani qo'llash
 * savoli esa chizmaga umuman muhtoj emas: "r = 3, h = 5, silindr hajmi"
 * — bu yerda ko'rish kerak bo'lgan narsa yo'q, bilish kerak bo'lgan
 * narsa bor.
 *
 * Fazoni TASAVVUR qilishni talab qiladigan savollar (ayqash to'g'ri
 * chiziqlar, kesim yasash) so'z bilan beriladi va javobi ham so'z —
 * ular tasavvurni tekshiradi, chizishni emas.
 *
 * π = 3,14 deb olinadi — darsliklardagi kabi. Javoblar shu qiymatdan
 * hisoblanadi, aks holda "12π" va "37,68" bir vaqtda to'g'ri bo'lib
 * qolardi.
 */
import type { Activity } from "../activity";
import { po } from "../tarjima/oliy";
import { dPick, iz, pick, rnd, sPick, shuffle, zPick } from "./asos";

const PI = 3.14;

/* ==================================================================== */
/*                   10-SINF: STEREOMETRIYAGA KIRISH                    */
/* ==================================================================== */

/** 11–12-§. Fazoda ikki to'g'ri chiziqning o'zaro joylashuvi. */
export const s10Joylashuv = (): Activity => {
  const holatlar: [string, string][] = [
    ["Bir tekislikda yotadi va umumiy nuqtasi yo'q", po("jParallel")],
    ["Bir tekislikda yotadi va bitta umumiy nuqtasi bor", po("jKesishuvchi")],
    ["Hech qanday tekislikda birga yotmaydi", po("jAyqash")],
    ["Barcha nuqtalari umumiy", po("jUstMaUst")],
  ];
  const [shart, j] = pick(holatlar);
  return {
    type: "eqn", text: shart, prompt: po("fazoJoylashuv"),
    answer: j, choices: shuffle([po("jParallel"), po("jKesishuvchi"), po("jAyqash"), po("jUstMaUst")]),
  };
};

/** 6-§. Ko'pyoq elementlari: kub, parallelepiped, prizma, piramida. */
export const s10Kopyoq = (): Activity => {
  const jismlar = [
    { nom: "Kub", u: 8, q: 12, y: 6 },
    { nom: "To'g'ri burchakli parallelepiped", u: 8, q: 12, y: 6 },
    { nom: "Uchburchakli prizma", u: 6, q: 9, y: 5 },
    { nom: "To'rtburchakli piramida", u: 5, q: 8, y: 5 },
    { nom: "Uchburchakli piramida", u: 4, q: 6, y: 4 },
    { nom: "Oltiburchakli prizma", u: 12, q: 18, y: 8 },
  ];
  const jism = pick(jismlar);
  const nima = pick(["uch", "qirra", "yoq"] as const);
  const s = nima === "uch" ? jism.u : nima === "qirra" ? jism.q : jism.y;
  const soz = nima === "uch" ? "uchlari" : nima === "qirra" ? "qirralari" : "yoqlari";
  return {
    type: "eqn", text: `${jism.nom} — ${soz} soni = ?`, prompt: po("kopyoqElement"),
    ...zPick(s, [jism.u, jism.q, jism.y].filter((x) => x !== s)),
  };
};

/** 6-§. Eyler formulasi: U − Q + Y = 2. */
export const s10Eyler = (): Activity => {
  const jismlar = [[8, 12, 6], [6, 9, 5], [5, 8, 5], [4, 6, 4], [12, 18, 8], [10, 15, 7]];
  const [u, q, y] = pick(jismlar);
  const nima = rnd(0, 2);
  const s = [u, q, y][nima];
  const berilgan = nima === 0 ? `Q = ${q},  Y = ${y}.   U = ?`
    : nima === 1 ? `U = ${u},  Y = ${y}.   Q = ?`
      : `U = ${u},  Q = ${q}.   Y = ?`;
  return {
    type: "eqn", text: berilgan, prompt: po("eylerFormula"),
    ...zPick(s, [s + 2, s - 2, u + q + y]),
  };
};

/** 18-§. To'g'ri burchakli parallelepipedning fazoviy diagonali. */
export const s10Diagonal = (): Activity => {
  // Uchalasi butun diagonal beradigan "Eyler g'ishtlari" va sodda holatlar.
  const uchlik = pick([[1, 2, 2], [2, 3, 6], [1, 4, 8], [4, 4, 7], [2, 6, 9], [6, 6, 7], [3, 4, 12]] as const);
  const [a, b, c] = uchlik;
  const d = Math.round(Math.sqrt(a * a + b * b + c * c));
  return {
    type: "eqn", text: po("txtOlchamlar", { a, b, c }) + ".   d = ?", prompt: po("diagonalFazo"),
    ...zPick(d, [a + b + c, d + 1, a * b * c]),
  };
};

/** 17-§. Fazoda ikki nuqta orasidagi masofa. */
export const s10Masofa = (): Activity => {
  const uchlik = pick([[1, 2, 2], [2, 3, 6], [1, 4, 8], [4, 4, 7], [2, 6, 9]] as const);
  const [dx, dy, dz] = uchlik;
  const d = Math.round(Math.sqrt(dx * dx + dy * dy + dz * dz));
  const x1 = rnd(-6, 6), y1 = rnd(-6, 6), z1 = rnd(-6, 6);
  return {
    type: "eqn",
    text: `A(${iz(x1)}; ${iz(y1)}; ${iz(z1)}),  B(${iz(x1 + dx)}; ${iz(y1 + dy)}; ${iz(z1 + dz)})`,
    prompt: po("fazoMasofa"), ...zPick(d, [dx + dy + dz, d + 1, dx * dy * dz]),
  };
};

/** Fazoviy vektorning uzunligi. */
export const s10Vektor = (): Activity => {
  const uchlik = pick([[1, 2, 2], [2, 3, 6], [1, 4, 8], [4, 4, 7], [2, 6, 9], [3, 4, 12]] as const);
  const [x, y, z] = uchlik;
  const d = Math.round(Math.sqrt(x * x + y * y + z * z));
  const sx = Math.random() < 0.5 ? -x : x;
  return {
    type: "eqn", text: `a⃗(${iz(sx)}; ${y}; ${z})`, prompt: po("fazoVektor"),
    ...zPick(d, [Math.abs(sx) + y + z, d + 1, x * y * z]),
  };
};

/* ==================================================================== */
/*             11-SINF: PRIZMA, SILINDR, PIRAMIDA, SHAR                 */
/* ==================================================================== */

/** 6–7-§. To'g'ri prizma hajmi: V = S·h. */
export const s11PrizmaHajm = (): Activity => {
  const S = rnd(4, 40), h = rnd(2, 20);
  return {
    type: "eqn", text: `S(asos) = ${S},  h = ${h}`, prompt: po("prizmaHajm"),
    ...zPick(S * h, [S + h, (S * h) / 3, 2 * S * h]),
  };
};

/** 6-§. To'g'ri burchakli parallelepiped hajmi va sirti. */
export const s11Parallelepiped = (): Activity => {
  const a = rnd(2, 12), b = rnd(2, 12), c = rnd(2, 12);
  if (Math.random() < 0.5) {
    return {
      type: "eqn", text: po("txtOlchamlar", { a, b, c }) + ".   V = ?", prompt: po("prizmaHajm"),
      ...zPick(a * b * c, [a + b + c, 2 * (a * b + b * c + a * c), (a * b * c) / 3]),
    };
  }
  const S = 2 * (a * b + b * c + a * c);
  return {
    type: "eqn", text: po("txtOlchamlar", { a, b, c }) + ".   S = ?", prompt: po("prizmaSirt"),
    ...zPick(S, [a * b * c, S / 2, a + b + c]),
  };
};

/** 8-§. Silindr hajmi: V = πr²h. */
export const s11SilindrHajm = (): Activity => {
  const r = rnd(2, 10), h = rnd(2, 15);
  return {
    type: "eqn", text: po("txtRadiusBalandlik", { r, h }), prompt: po("silindrHajm"),
    ...dPick(PI * r * r * h, [PI * r * h, (PI * r * r * h) / 3, r * r * h]),
  };
};

/** 8-§. Silindrning yon sirti: S = 2πrh. */
export const s11SilindrSirt = (): Activity => {
  const r = rnd(2, 12), h = rnd(2, 15);
  return {
    type: "eqn", text: po("txtRadiusBalandlik", { r, h }) + ".   S(yon) = ?", prompt: po("silindrSirt"),
    ...dPick(2 * PI * r * h, [PI * r * h, 2 * PI * r * r, PI * r * r * h]),
  };
};

/** 10-§. Piramida hajmi: V = ⅓·S·h. */
export const s11PiramidaHajm = (): Activity => {
  const S = rnd(3, 12) * 3, h = rnd(2, 15);
  return {
    type: "eqn", text: `S(asos) = ${S},  h = ${h}`, prompt: po("piramidaHajm"),
    // Klassik xato: uchdan birini unutish (prizma formulasini qo'llash).
    ...zPick((S * h) / 3, [S * h, (S * h) / 2, S + h]),
  };
};

/** 11-§. Konus hajmi: V = ⅓πr²h. */
export const s11KonusHajm = (): Activity => {
  const r = rnd(2, 9), h = rnd(3, 15);
  return {
    type: "eqn", text: po("txtRadiusBalandlik", { r, h }), prompt: po("konusHajm"),
    ...dPick((PI * r * r * h) / 3, [PI * r * r * h, (PI * r * h) / 3, (r * r * h) / 3]),
  };
};

/** 11-§. Konusning yon sirti: S = πrl. */
export const s11KonusSirt = (): Activity => {
  // r, h, l — Pifagor uchligi bo'lsin, yasovchi butun chiqsin.
  const [r, h, l] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]] as const);
  return {
    type: "eqn", text: `r = ${r},  h = ${h}  (l = ${l})`, prompt: po("konusSirt"),
    ...dPick(PI * r * l, [PI * r * h, PI * r * r, 2 * PI * r * l]),
  };
};

/** 14-§. Shar hajmi: V = 4/3·πr³. */
export const s11SharHajm = (): Activity => {
  const r = rnd(1, 9);
  return {
    type: "eqn", text: po("txtRadiusR", { r }), prompt: po("sharHajm"),
    ...dPick((4 / 3) * PI * r ** 3, [4 * PI * r * r, (PI * r ** 3) / 3, (4 / 3) * PI * r * r]),
  };
};

/** 15-§. Sfera sirtining yuzi: S = 4πr². */
export const s11SferaYuza = (): Activity => {
  const r = rnd(1, 12);
  return {
    type: "eqn", text: po("txtRadiusR", { r }), prompt: po("sferaYuza"),
    ...dPick(4 * PI * r * r, [2 * PI * r, (4 / 3) * PI * r ** 3, PI * r * r]),
  };
};

/** Hajm formulalarini tanish — qaysi formula qaysi jismniki. */
export const s11Formula = (): Activity => {
  const jadval: [string, string][] = [
    ["Silindr", "πr²h"],
    ["Konus", "⅓πr²h"],
    ["Shar", "4/3·πr³"],
    ["Prizma", "S·h"],
    ["Piramida", "⅓S·h"],
  ];
  const [nom, j] = pick(jadval);
  const boshqa = jadval.map((x) => x[1]).filter((x) => x !== j);
  return {
    type: "eqn", text: `${nom}:  V = ?`, prompt: po("prizmaHajm"),
    ...sPick(j, shuffle(boshqa).slice(0, 3)),
  };
};
