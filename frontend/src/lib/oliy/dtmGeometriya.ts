/**
 * DTM geometriyasida doim chiqadigan, lekin darslikda bir-ikki mashq
 * bo'lib o'tib ketadigan mavzular (2026-10-24 da qo'shildi):
 *
 *   9-sinf geometriya   5-bob. Uchburchak va aylanalar — bissektrisa
 *                       xossasi, mediana, ichki va tashqi chizilgan aylana
 *                       6-bob. Aylana: vatar, urinma, tenglama — kesishuvchi
 *                       vatarlar, urinma va kesuvchi, trapetsiya va aylana,
 *                       aylana tenglamasi
 *
 * Sonlar hamma joyda BUTUN chiqadi: uchburchaklar Pifagor va Geron
 * uchliklaridan, aylana masalalari esa javobdan orqaga qarab yasaladi.
 * Imtihonda ham shunday — ildiz ostida qolgan javob DTM da deyarli
 * uchramaydi va u bola uchun "hisobim xato" degan signal bo'lib qoladi.
 *
 * Chalg'ituvchilar `dtmQoshimcha.ts` dagi qoida bo'yicha — o'quvchining
 * ANIQ xatosi: bissektrisada nisbatni teskari olish, medianada 4 ga
 * bo'lishni unutish, r = S/p o'rniga S/P (to'liq perimetr), urinmada
 * kesuvchining ichki qismini olish, aylana markazida ishorani saqlash.
 */
import type { Activity } from "../activity";
import { po } from "../tarjima/oliy";
import { PIFAGOR, Y, iz, nz, pick, qosh, rnd, sPick, zPick } from "./asos";

/* ==================================================================== */
/*                       UCHBURCHAK VA AYLANALAR                        */
/* ==================================================================== */

/**
 * Bissektrisa xossasi: BD : DC = AB : AC.
 * AB = kp, AC = kq, BC = t(p + q) — BD = tp butun chiqadi.
 */
export const g9dBissektrisa = (): Activity => {
  for (;;) {
    const p = rnd(2, 7), q = rnd(2, 7);
    if (p === q) continue;
    const k = rnd(1, 3), t = rnd(1, 3);
    const c = k * p, b = k * q, a = t * (p + q);
    if (a >= b + c || a <= Math.abs(b - c)) continue;
    const j = t * p;
    return {
      type: "eqn", text: po("txtBissektrisa", { c, b, a }), prompt: po("bissektrisaBD"),
      // Nisbatni teskari olish (DC ni topish), "bissektrisa tomonni teng bo'ladi" deb o'ylash.
      ...zPick(j, [t * q, a / 2, Math.abs(c - b)]),
      yechim: [
        Y("bissektrisaXossa", "BD : DC = AB : AC"),
        Y("hisobla", `BD = ${a} · ${c} / (${c} + ${b})`),
        Y("javob", String(j)),
      ],
    };
  }
};

/** Mediana butun chiqadigan uchburchaklar: 4m² = 2b² + 2c² − a². */
const MEDIANA: [number, number, number, number][] = [];
for (let a = 2; a <= 24; a += 2) {
  for (let b = 3; b <= 20; b++) {
    for (let c = b; c <= 20; c++) {
      if (a >= b + c || a <= c - b) continue;
      const m2 = (2 * b * b + 2 * c * c - a * a) / 4;
      const m = Math.round(Math.sqrt(m2));
      if (Number.isInteger(m2) && m * m === m2 && m > 0) MEDIANA.push([a, b, c, m]);
    }
  }
}

/** Mediana: uzunlik formulasi yoki medianalar kesishish nuqtasi (2 : 1). */
export const g9dMediana = (): Activity => {
  if (Math.random() < 0.6) {
    const [a, b, c, m] = pick(MEDIANA);
    return {
      type: "eqn", text: po("txtMediana", { a, b, c }), prompt: po("medianaUzunlik"),
      // 4 ga bo'lishni unutish (ildiz chiqmaydi — yaxlitlanadi), yonidagi tomonlar o'rtachasi, BC ning yarmi.
      ...zPick(m, [Math.sqrt(2 * b * b + 2 * c * c - a * a), (b + c) / 2, a / 2]),
      yechim: [
        Y("medianaF", "mₐ = ½ · √(2b² + 2c² − a²)"),
        Y("hisobla", `mₐ = ½ · √(${2 * b * b} + ${2 * c * c} − ${a * a}) = ½ · √${4 * m * m}`),
        Y("javob", String(m)),
      ],
    };
  }
  const k = rnd(2, 12), m = 3 * k;
  const qism = pick(["uchdan", "tomondan"] as const);
  const j = qism === "uchdan" ? 2 * k : k;
  return {
    type: "eqn", text: po("txtMedianaKesish", { m }), prompt: po(qism === "uchdan" ? "medianaUchdan" : "medianaTomondan"),
    // Nisbatni teskari olish, o'rtasidan bo'linadi deb o'ylash.
    ...zPick(j, [qism === "uchdan" ? k : 2 * k, m / 2, m]),
    yechim: [
      Y("medianaKesish", "AG : GM = 2 : 1"),
      Y("hisobla", `${m} : 3 = ${k}`),
      Y("javob", String(j)),
    ],
  };
};

/** Geron uchburchaklari: butun yuz va butun ichki radius. [a, b, c, S, r]. */
const GERON: [number, number, number, number, number][] = [];
for (let a = 3; a <= 30; a++) {
  for (let b = a; b <= 30; b++) {
    for (let c = b; c < a + b && c <= 30; c++) {
      const P = a + b + c;
      if (P % 2) continue;
      const p = P / 2, s2 = p * (p - a) * (p - b) * (p - c);
      const S = Math.round(Math.sqrt(s2));
      if (S * S !== s2 || S % p) continue;
      GERON.push([a, b, c, S, S / p]);
    }
  }
}

/** Ichki chizilgan aylana: to'g'ri burchakli uchburchakda r = (a + b − c)/2, umumiy holda r = S/p. */
export const g9dIchkiAylana = (): Activity => {
  if (Math.random() < 0.45) {
    const [a, b, c] = pick(PIFAGOR);
    const r = (a + b - c) / 2;
    return {
      type: "eqn", text: po("txtToriKatet", { a, b }), prompt: po("ichkiRadius"),
      // Tashqi radius c/2 bilan adashtirish; (a + b + c)/2 — yarim perimetr; minusni plyus qilish.
      ...zPick(r, [c / 2, (a + b + c) / 2, (a + b) / 2]),
      yechim: [
        Y("pifagor", `c = √(${a * a} + ${b * b}) = ${c}`),
        Y("ichkiToriF", "r = (a + b − c) / 2"),
        Y("hisobla", `r = (${a} + ${b} − ${c}) / 2`),
        Y("javob", String(r)),
      ],
    };
  }
  const [a, b, c, S, r] = pick(GERON.filter(([x, y, z]) => x * x + y * y !== z * z));
  const p = (a + b + c) / 2;
  return {
    type: "eqn", text: po("txtUchTomon", { a, b, c }), prompt: po("ichkiRadius"),
    // To'liq perimetrga bo'lish (r/2); yuzni radius deb berish; p ni radius deb berish.
    ...zPick(r, [S / (a + b + c), 2 * r, p]),
    yechim: [
      Y("geron", `p = ${p},   S = √(${p} · ${p - a} · ${p - b} · ${p - c}) = ${S}`),
      Y("ichkiF", "r = S / p"),
      Y("hisobla", `r = ${S} / ${p}`),
      Y("javob", String(r)),
    ],
  };
};

/** Tashqi chizilgan aylana: to'g'ri burchakli uchburchakda R = c/2, sinuslar teoremasidan a / sin A = 2R. */
export const g9dTashqiAylana = (): Activity => {
  if (Math.random() < 0.5) {
    const [x, y, z] = pick(PIFAGOR);
    const k = z % 2 ? 2 : 1;
    const a = k * x, b = k * y, c = k * z, R = c / 2;
    return {
      type: "eqn", text: po("txtToriKatet", { a, b }), prompt: po("tashqiRadius"),
      // Gipotenuzaning o'zini radius deb berish; ichki radius; katetlar yarim yig'indisi.
      ...zPick(R, [c, (a + b - c) / 2, (a + b) / 2]),
      yechim: [
        Y("pifagor", `c = √(${a * a} + ${b * b}) = ${c}`),
        Y("tashqiToriF", "R = c / 2"),
        Y("javob", String(R)),
      ],
    };
  }
  const burchak = pick([30, 150, 90]);
  const a = burchak === 90 ? 2 * rnd(3, 15) : rnd(3, 20);
  const R = burchak === 90 ? a / 2 : a;
  return {
    type: "eqn", text: po("txtTashqiSinus", { a, b: burchak }), prompt: po("tashqiRadius"),
    // 2R ni javob deb yozish (2 ga bo'lishni unutish); sinusga ko'paytirish.
    ...zPick(R, [2 * R, burchak === 90 ? a : a / 2, a + 2]),
    yechim: [
      Y("tashqiSinusF", "a / sin A = 2R"),
      Y("jadvalQiymat", `sin ${burchak}° = ${burchak === 90 ? "1" : "1/2"}`),
      Y("hisobla", `2R = ${a} / ${burchak === 90 ? "1" : "0,5"} = ${2 * R}`),
      Y("javob", String(R)),
    ],
  };
};

/* ==================================================================== */
/*                    AYLANA: VATAR, URINMA, TENGLAMA                   */
/* ==================================================================== */

/** Kesishuvchi vatarlar: AE · EB = CE · ED. */
export const g9dVatarlar = (): Activity => {
  for (;;) {
    const ce = rnd(2, 12), ed = rnd(2, 15), ae = rnd(2, 15);
    const kop = ce * ed;
    if (kop % ae || ae === ce) continue;
    const eb = kop / ae;
    if (eb < 2 || eb > 30) continue;
    return {
      type: "eqn", text: po("txtVatarlar", { ae, eb, ce }), prompt: po("vatarED"),
      // Kesmalarni qo'shish/ayirish (ae + eb − ce), proporsiyani teskari tuzish (eb · ce / ae).
      ...zPick(ed, [ae + eb - ce, (eb * ce) / ae, ae * eb]),
      yechim: [
        Y("vatarlarF", "AE · EB = CE · ED"),
        Y("hisobla", `ED = ${ae} · ${eb} / ${ce}`),
        Y("javob", String(ed)),
      ],
    };
  }
};

/** Urinma va kesuvchi: MT² = MA · MB (MA — tashqi qism, MB — butun kesuvchi). */
export const g9dUrinma = (): Activity => {
  for (;;) {
    const mt = rnd(4, 20), ma = rnd(2, mt - 1);
    if ((mt * mt) % ma) continue;
    const mb = (mt * mt) / ma, ab = mb - ma;
    if (mb > 80) continue;
    if (Math.random() < 0.5) {
      return {
        type: "eqn", text: po("txtUrinmaKesuvchi", { ma, ab }), prompt: po("urinmaTop"),
        // Faqat ichki qism bilan ko'paytirish (MA · AB); qismlarni qo'shish.
        ...zPick(mt, [Math.sqrt(ma * ab), ma + ab, mb / 2]),
        yechim: [
          Y("urinmaF", "MT² = MA · MB"),
          Y("hisobla", `MB = ${ma} + ${ab} = ${mb},   MT² = ${ma} · ${mb} = ${mt * mt}`),
          Y("javob", String(mt)),
        ],
      };
    }
    return {
      type: "eqn", text: po("txtUrinmaBerilgan", { mt, ma }), prompt: po("vatarAB"),
      // Butun kesuvchini (MB) javob deb berish — ichki qismga o'tmaslik.
      ...zPick(ab, [mb, mt - ma, mt]),
      yechim: [
        Y("urinmaF", "MT² = MA · MB"),
        Y("hisobla", `MB = ${mt * mt} / ${ma} = ${mb}`),
        Y("hisobla", `AB = ${mb} − ${ma}`),
        Y("javob", String(ab)),
      ],
    };
  }
};

/** Teng yonli trapetsiya asoslari: ab to'la kvadrat, √(ab) juft — r butun chiqsin. */
const TRAPETSIYA: [number, number][] = [];
for (let s = 1; s <= 6; s++) {
  for (let u = 1; u <= 3; u++) {
    for (let v = u + 1; v <= 5; v++) {
      const a = s * u * u, b = s * v * v;
      if ((s * u * v) % 2 === 0 && (a + b) % 2 === 0 && b <= 50) TRAPETSIYA.push([a, b]);
    }
  }
}

/**
 * Trapetsiya va aylana: ichki chizilgan aylanada asoslar yig'indisi yon
 * tomonlar yig'indisiga teng; teng yonli trapetsiyada h = 2r = √(ab).
 */
export const g9dTrapetsiyaAylana = (): Activity => {
  const [a, b] = pick(TRAPETSIYA);
  const tur = pick(["yon", "radius", "yigindi"] as const);
  if (tur === "yon") {
    const c = (a + b) / 2;
    return {
      type: "eqn", text: po("txtTrapetsiyaAsos", { a, b }), prompt: po("trapetsiyaYon"),
      // Asoslar ayirmasining yarmi; yig'indining o'zi (ikkala yon tomon).
      ...zPick(c, [(b - a) / 2, a + b, b - a]),
      yechim: [
        Y("trapAylanaF", "a + b = c + d"),
        Y("hisobla", `2c = ${a} + ${b}`),
        Y("javob", String(c)),
      ],
    };
  }
  if (tur === "radius") {
    const h = Math.sqrt(a * b), r = h / 2;
    return {
      type: "eqn", text: po("txtTrapetsiyaAsos", { a, b }), prompt: po("ichkiRadius"),
      // Balandlikni radius deb berish (2 ga bo'lmaslik); asoslar o'rtachasini olish.
      ...zPick(r, [h, (a + b) / 4, (a + b) / 2]),
      yechim: [
        Y("trapBalandlikF", "h = 2r = √(a · b)"),
        Y("hisobla", `h = √(${a} · ${b}) = ${h}`),
        Y("javob", String(r)),
      ],
    };
  }
  // Ichki aylana chizilgan to'rtburchak: AB + CD = BC + AD.
  const ab = rnd(5, 20), cd = rnd(5, 20), bc = rnd(4, ab + cd - 4);
  const ad = ab + cd - bc;
  return {
    type: "eqn", text: po("txtTortburchakAylana", { ab, bc, cd }), prompt: po("tortburchakAD"),
    // Qo'shni tomonlarni juftlash (ab + bc − cd), hammasini qo'shish.
    ...zPick(ad, [ab + bc - cd, ab + bc + cd, Math.abs(ab - cd) + bc]),
    yechim: [
      Y("trapAylanaF", "AB + CD = BC + AD"),
      Y("hisobla", `AD = ${ab} + ${cd} − ${bc}`),
      Y("javob", String(ad)),
    ],
  };
};

/** "(x − 2)²", "(x + 3)²", "x²" — markaz koordinatasi bilan. */
const qavsKv = (h: string, m: number) => (m === 0 ? `${h}²` : `(${h} ${qosh(-m)})²`);

/** Aylana tenglamasi: kanonik ko'rinishdan markaz va radius yoki umumiy ko'rinishdan radius. */
export const g9dAylanaTenglama = (): Activity => {
  const a = nz(-6, 6), b = nz(-6, 6), R = rnd(2, 9);
  if (Math.random() < 0.5) {
    const j = `M(${iz(a)}; ${iz(b)}),  R = ${R}`;
    return {
      type: "eqn", text: `${qavsKv("x", a)} + ${qavsKv("y", b)} = ${R * R}`, prompt: po("aylanaMarkazRadius"),
      // Markaz ishorasini saqlab qolish; R² ni radius deb olish.
      ...sPick(j, [`M(${iz(-a)}; ${iz(-b)}),  R = ${R}`, `M(${iz(a)}; ${iz(b)}),  R = ${R * R}`,
        `M(${iz(-a)}; ${iz(-b)}),  R = ${R * R}`], [`M(${iz(b)}; ${iz(a)}),  R = ${R}`]),
      yechim: [
        Y("aylanaKanon", "(x − a)² + (y − b)² = R²"),
        Y("hisobla", `a = ${iz(a)},   b = ${iz(b)},   R = √${R * R}`),
        Y("javob", j),
      ],
    };
  }
  // x² + y² − 2ax − 2by + (a² + b² − R²) = 0.
  const D = -2 * a, E = -2 * b, F = a * a + b * b - R * R;
  const umumiy = `x² + y² ${qosh(D)}x ${qosh(E)}y${F === 0 ? "" : ` ${qosh(F)}`} = 0`;
  return {
    type: "eqn", text: umumiy, prompt: po("aylanaRadius"),
    // R² ni javob deb berish; F ishorasini almashtirmay qo'shish; F ni tashlab yuborish.
    ...zPick(R, [R * R, Math.sqrt(Math.abs(a * a + b * b + F)), Math.sqrt(a * a + b * b)]),
    yechim: [
      Y("toliqKvAjrat", `${qavsKv("x", a)} + ${qavsKv("y", b)} = ${a * a} + ${b * b} ${qosh(-F)}`),
      Y("hisobla", `R² = ${R * R}`),
      Y("javob", String(R)),
    ],
  };
};
