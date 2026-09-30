/**
 * Rasmiy namunadagi chizmalar (`lib/sertRasmiy.ts`) — SVG matn ko'rinishida.
 *
 * Nega rasm fayl emas: chizma rang, kenglik va qorong'i rejimga
 * moslashishi kerak. Hammasi `currentColor` bilan chiziladi — matn qanday
 * rangda bo'lsa, chizma ham shunday; kenglik `viewBox` orqali cho'ziladi
 * va 320 px li ekranda ham, planshetda ham o'qiladi.
 *
 * Bu MATN, foydalanuvchi kiritmasi emas: faqat shu fayldagi qattiq
 * yozilgan shakllar, shuning uchun `dangerouslySetInnerHTML` xavfsiz.
 */

const CH = 'stroke="currentColor" fill="none" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"';
const YUP = 'stroke="currentColor" fill="none" stroke-width="1" stroke-opacity=".55" stroke-dasharray="4 3"';
const TOR = 'stroke="currentColor" stroke-opacity=".14" stroke-width="1"';

const r = (x: number) => Math.round(x * 10) / 10;

/** Harf/yozuv: ko'rsatilgan nuqtada, kursiv (nuqta nomlari kabi). */
function yoz(x: number, y: number, s: string, o: { a?: "start" | "middle" | "end"; z?: number; kursiv?: boolean } = {}): string {
  const { a = "middle", z = 14, kursiv = true } = o;
  return `<text x="${r(x)}" y="${r(y)}" text-anchor="${a}" font-size="${z}" fill="currentColor"` +
    `${kursiv ? ' font-style="italic"' : ""}>${s}</text>`;
}

const nuqta = (x: number, y: number, q = 2.6) => `<circle cx="${r(x)}" cy="${r(y)}" r="${q}" fill="currentColor"/>`;
const ochiq = (x: number, y: number) =>
  `<circle cx="${r(x)}" cy="${r(y)}" r="3.6" fill="var(--color-karta, #fff)" stroke="currentColor" stroke-width="1.5"/>`;
const chiziq = (x1: number, y1: number, x2: number, y2: number, s = CH) =>
  `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" ${s}/>`;
const yol = (d: string, s = CH) => `<path d="${d}" ${s}/>`;

/** Ikki uchli o'lcham strelkasi. */
function olcham(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1, dy = y2 - y1, u = Math.hypot(dx, dy) || 1;
  const ux = dx / u, uy = dy / u, px = -uy, py = ux, q = 5;
  const uch = (x: number, y: number, s: number) =>
    `M${r(x + s * ux * q + px * 2.6)} ${r(y + s * uy * q + py * 2.6)}L${r(x)} ${r(y)}L${r(x + s * ux * q - px * 2.6)} ${r(y + s * uy * q - py * 2.6)}`;
  return chiziq(x1, y1, x2, y2, 'stroke="currentColor" stroke-width="1.2"') +
    yol(uch(x1, y1, 1), 'stroke="currentColor" fill="none" stroke-width="1.2"') +
    yol(uch(x2, y2, -1), 'stroke="currentColor" fill="none" stroke-width="1.2"');
}

function svg(w: number, h: number, tavsif: string, ichi: string): string {
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${tavsif}" ` +
    `style="width:100%;max-width:${w}px;height:auto;display:block;margin:0 auto" ` +
    `font-family="inherit">${ichi}</svg>`;
}

/** Silliq egri chiziq: nuqtalar orqali (Catmull–Rom, Bezier'ga o'tkazilgan). */
function silliq(p: [number, number][]): string {
  let d = `M${r(p[0][0])} ${r(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)];
    d += `C${r(b[0] + (c[0] - a[0]) / 6)} ${r(b[1] + (c[1] - a[1]) / 6)} ` +
      `${r(c[0] - (e[0] - b[0]) / 6)} ${r(c[1] - (e[1] - b[1]) / 6)} ${r(c[0])} ${r(c[1])}`;
  }
  return d;
}

/* ------------------------------------------------------------- 27 */

/** Parallelogramm: AK = KB = x, AF = 3y, FD = y. */
export function parallelogramm(): string {
  const A = [30, 150], B = [250, 150], C = [310, 30], D = [90, 30], K = [140, 150], F = [75, 60];
  return svg(340, 180, "ABCD parallelogramm, F nuqta AD da, K nuqta AB da",
    yol(`M${A}L${B}L${C}L${D}Z`) + chiziq(F[0], F[1], K[0], K[1]) + chiziq(K[0], K[1], C[0], C[1]) +
    yoz(18, 166, "A") + yoz(K[0], 168, "K") + yoz(254, 166, "B") + yoz(318, 26, "C") + yoz(82, 22, "D") +
    yoz(58, 62, "F") + yoz(36, 110, "3y", { z: 13 }) + yoz(66, 40, "y", { z: 13 }) +
    yoz(85, 168, "x", { z: 13 }) + yoz(195, 168, "x", { z: 13 }));
}

/* ------------------------------------------------------------- 33–35 */

/** Silindr shaklidagi yog'och va undan kesilgan to'g'ri burchakli ustun. */
export function yogoch(): string {
  const y0 = 30, y1 = 110, ym = 70, rx = 22, ry = 40, xa = 46, xb = 226;
  return svg(320, 190, "Silindr shaklidagi yog'och bo'lagi va unga ichki chizilgan to'g'ri to'rtburchak asosli ustun",
    chiziq(xa, y0, xb, y0) + chiziq(xa, y1, xb, y1) +
    yol(`M${xa} ${y0}A${rx} ${ry} 0 0 0 ${xa} ${y1}`) +
    `<ellipse cx="${xb}" cy="${ym}" rx="${rx}" ry="${ry}" ${CH}/>` +
    // ichki ustun: old tomoni to'liq, qirralari uzunlik bo'ylab punktir
    `<rect x="${xb - 17}" y="${ym - 27}" width="34" height="54" ${CH} stroke-dasharray="4 3"/>` +
    chiziq(xa, ym - 27, xb - 17, ym - 27, YUP) + chiziq(xa, ym + 27, xb - 17, ym + 27, YUP) +
    olcham(xb + rx + 12, ym - 27, xb + rx + 12, ym + 27) + yoz(xb + rx + 16, ym + 4, "Bo'yi", { a: "start", z: 13, kursiv: false }) +
    olcham(xb - 17, y1 + 18, xb + 17, y1 + 18) + yoz(xb, y1 + 34, "Eni", { z: 13, kursiv: false }) +
    olcham(xa, y1 + 46, xb, y1 + 46) + yoz((xa + xb) / 2, y1 + 62, "6 m", { z: 13, kursiv: false }) +
    yoz(116, y0 - 8, "Yog'och bo'lagi", { z: 13, kursiv: false }));
}

/* ------------------------------------------------------------- 38 */

/** f(x) = −x² + x + 6 kabi parabola: uchi B, Oy bilan kesishishi A, ildizlari x₁ < x₂. */
export function parabola(): string {
  const X = (x: number) => 110 + 40 * x, Y = (y: number) => 150 - 18 * y;
  const p: [number, number][] = [];
  for (let x = -2.4; x <= 3.401; x += 0.2) p.push([X(x), Y(-x * x + x + 6)]);
  return svg(280, 200, "Parabola: uchi B, Oy o'qini A nuqtada, Ox o'qini x1 va x2 nuqtalarda kesadi",
    chiziq(8, 150, 268, 150, 'stroke="currentColor" stroke-width="1.2"') +
    chiziq(110, 196, 110, 14, 'stroke="currentColor" stroke-width="1.2"') +
    yol(silliq(p)) +
    nuqta(110, Y(6)) + nuqta(X(0.5), Y(6.25)) + nuqta(X(-2), 150) + nuqta(X(3), 150) +
    yoz(96, Y(6) + 4, "A", { a: "end" }) + yoz(X(0.5) + 6, Y(6.25) - 8, "B(½; 6¼)", { a: "start", z: 12 }) +
    yoz(X(-2), 168, "x₁", { z: 13 }) + yoz(X(3), 168, "x₂", { z: 13 }) +
    yoz(266, 166, "x", { z: 13 }) + yoz(120, 20, "y", { z: 13 }));
}

/* ------------------------------------------------------------- 39 */

/** y = f′(x) grafigi (−6; 12) oraliqda: lokal ekstremumlar — nol nuqtalarida ishora almashishi. */
export function hosila(): string {
  const X = (x: number) => 140 + 20 * x, Y = (y: number) => 96 - 20 * y;
  const nuq: [number, number][] = [
    [-6, -2.4], [-5, 0], [-4, 2.3], [-3, 3.5], [-2, 2.7], [-1.5, 1.4], [-1, 0], [-0.75, -0.65], [-0.3, -0.85],
    [0, -1], [0.5, -2.2], [1, -3], [1.35, -2.3], [2, 0], [2.5, 2.3], [3, 4], [3.5, 3], [4.3, 1.7], [5, 1.3],
    [5.5, 1.6], [6.3, 2.5], [7, 3], [7.35, 2.7], [8, 0], [9, -1.9], [10, -2.6], [10.6, -2], [11, 0], [11.5, 1.8],
    [12, 3],
  ];
  let tor = "";
  for (let x = -6; x <= 12; x++) tor += chiziq(X(x), Y(4.3), X(x), Y(-3.3), TOR);
  for (let y = -3; y <= 4; y++) tor += chiziq(X(-6.2), Y(y), X(12.6), Y(y), TOR);
  const belgi = [-6, -3, 1, 3, 5, 7, 10, 12].map((x) => yoz(X(x), Y(0) + 15, String(x).replace("-", "−"), { z: 11, kursiv: false })).join("");
  const vert = [-3, 1, 3, 5, 7, 10].map((x) => {
    const yq = nuq.find((q) => q[0] === x)![1];
    return chiziq(X(x), Y(yq), X(x), Y(0), YUP);
  }).join("");
  return svg(390, 196, "y = f′(x) funksiyaning (−6; 12) oraliqdagi grafigi",
    tor + chiziq(X(-6.4), Y(0), X(12.8), Y(0), 'stroke="currentColor" stroke-width="1.3"') +
    chiziq(X(0), Y(4.5), X(0), Y(-3.5), 'stroke="currentColor" stroke-width="1.3"') +
    vert + yol(silliq(nuq.map(([x, y]): [number, number] => [X(x), Y(y)])), 'stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"') +
    ochiq(X(-6), Y(-2.4)) + ochiq(X(12), Y(3)) + belgi +
    yoz(X(7.5), Y(3.4), "y = f′(x)", { a: "start", z: 12 }) + yoz(X(0) + 8, Y(4.3), "y", { a: "start", z: 12 }) +
    yoz(X(12.7), Y(0) - 6, "x", { z: 12 }));
}

/* ------------------------------------------------------------- 41 */

/** Aylana, O–F–E bitta to'g'ri chiziqda; G aylanada, GE = OG. (Burchak ko'rinishi uchun kattalashtirilgan.) */
export function aylana41(): string {
  const O = [56, 92], R = 54, phi = (28 * Math.PI) / 180, th = (20 * Math.PI) / 180;
  const P = (ang: number, d: number) => [O[0] + d * Math.cos(ang), O[1] - d * Math.sin(ang)];
  const F = P(phi, R), G = P(phi - th, R), E = P(phi, 2 * R * Math.cos(th));
  return svg(240, 170, "Aylana: markaz O, F va G aylanada, O, F, E bir to'g'ri chiziqda",
    `<circle cx="${O[0]}" cy="${O[1]}" r="${R}" ${CH}/>` +
    chiziq(O[0], O[1], E[0], E[1]) + chiziq(O[0], O[1], G[0], G[1]) + chiziq(G[0], G[1], E[0], E[1]) +
    chiziq(F[0], F[1], G[0], G[1], 'stroke="currentColor" fill="none" stroke-width="3"') +
    nuqta(O[0], O[1]) + nuqta(F[0], F[1]) + nuqta(G[0], G[1]) + nuqta(E[0], E[1]) +
    yoz(O[0] - 12, O[1] + 4, "O") + yoz(F[0] - 5, F[1] - 7, "F") + yoz(G[0] + 9, G[1] + 14, "G") + yoz(E[0] + 10, E[1] - 3, "E") +
    yoz(O[0] + 24, O[1] + 16, "1 cm", { z: 11, kursiv: false }) +
    yoz(G[0] + 26, G[1] - 22, "1 cm", { z: 11, kursiv: false }) +
    yoz(E[0] - 27, E[1] + 5, "2°", { z: 11, kursiv: false }));
}

/* ------------------------------------------------------------- 42 */

/** ABCD kvadrat (14 × 14), ichida KLGE kvadrat; AE = 6, ED = 8. */
export function kvadrat42(): string {
  const X = (x: number) => 30 + 16 * x, Y = (y: number) => 250 - 16 * y;
  const nq = (n: [number, number]) => `${r(X(n[0]))} ${r(Y(n[1]))}`;
  const E: [number, number] = [6, 0], G: [number, number] = [14, 4], L: [number, number] = [10, 12], K: [number, number] = [2, 8];
  return svg(270, 290, "ABCD kvadrat ichida KLGE kvadrat joylashgan: AE = 6 cm, ED = 8 cm",
    yol(`M${nq(K)}L${nq(L)}L${nq(G)}L${nq(E)}Z`, 'fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"') +
    yol(`M${X(0)} ${Y(0)}L${X(14)} ${Y(0)}L${X(14)} ${Y(14)}L${X(0)} ${Y(14)}Z`) +
    chiziq(X(0), Y(7), X(14), Y(14)) +
    yoz(X(0) - 12, Y(0) + 4, "A") + yoz(X(0) - 12, Y(14) + 4, "B") + yoz(X(14) + 12, Y(14) - 2, "C") + yoz(X(14) + 12, Y(0) + 4, "D") +
    yoz(X(6), Y(0) + 17, "E") + yoz(X(14) + 12, Y(4) + 2, "G") + yoz(X(10) + 2, Y(12) - 7, "L") + yoz(X(2) - 9, Y(8) - 4, "K") +
    yoz(X(0) - 12, Y(7) + 4, "F") +
    yoz(X(3), Y(0) + 32, "6 cm", { z: 12, kursiv: false }) + yoz(X(10), Y(0) + 32, "8 cm", { z: 12, kursiv: false }));
}

/* ------------------------------------------------------------- 43 */

/** Aylana ikkala o'qqa urinadi; (6; 0) va (0; 8) ni tutashtiruvchi kesma unga B da urinadi. */
export function aylana43(): string {
  const X = (x: number) => 30 + 12 * x, Y = (y: number) => 330 - 12 * y;
  const B = [2.4, 4.8];
  return svg(340, 352, "Aylana Oy o'qiga A, Ox o'qiga C nuqtada urinadi; (6; 0) va (0; 8) kesmasi unga B nuqtada urinadi",
    chiziq(X(-0.5), Y(0), X(26), Y(0), 'stroke="currentColor" stroke-width="1.3"') +
    chiziq(X(0), Y(-0.5), X(0), Y(26.5), 'stroke="currentColor" stroke-width="1.3"') +
    `<circle cx="${X(12)}" cy="${Y(12)}" r="144" ${CH}/>` +
    chiziq(X(6), Y(0), X(0), Y(8)) +
    nuqta(X(12), Y(12)) + nuqta(X(0), Y(12)) + nuqta(X(12), Y(0)) + nuqta(X(B[0]), Y(B[1])) + nuqta(X(6), Y(0)) + nuqta(X(0), Y(8)) +
    yoz(X(12) + 8, Y(12) - 8, "M(x; y)", { a: "start", z: 13 }) +
    yoz(X(0) - 9, Y(12) + 4, "A", { a: "end" }) + yoz(X(0) - 9, Y(8) + 4, "8", { a: "end", z: 12, kursiv: false }) +
    yoz(X(B[0]) + 8, Y(B[1]) + 6, "B", { a: "start" }) + yoz(X(0) - 9, Y(0) + 14, "O", { a: "end" }) +
    yoz(X(6) + 2, Y(0) + 15, "6", { z: 12, kursiv: false }) + yoz(X(12), Y(0) + 16, "C") +
    yoz(X(26) - 4, Y(0) - 8, "x", { z: 13 }) + yoz(X(0) + 10, 18, "y", { a: "start", z: 13 }));
}

/* ------------------------------------------------------------- 45 */

/** Daryo: F stansiya, E qarshisidagi qirg'oq nuqtasi, J — kabel qirg'oqqa chiqadigan nuqta, L — shahar. */
export function daryo(): string {
  const F = [70, 52], E = [70, 116], J = [150, 116], L = [300, 116];
  return svg(340, 196, "Daryo: F stansiyadan J nuqtagacha daryo tubidan, J dan L shaharga qirg'oq bo'ylab kabel",
    `<rect x="10" y="${F[1]}" width="320" height="${E[1] - F[1]}" fill="currentColor" fill-opacity=".08"/>` +
    chiziq(10, F[1], 330, F[1], 'stroke="currentColor" stroke-opacity=".4" stroke-width="1"') +
    yoz(210, 88, "Daryo", { kursiv: false, z: 13 }) + yoz(F[0], 26, "GES", { kursiv: false, z: 13 }) +
    chiziq(F[0], F[1], E[0], E[1], YUP) + chiziq(J[0], J[1], J[0], 150, YUP) + chiziq(L[0], L[1], L[0], 184, YUP) + chiziq(E[0], E[1], E[0], 184, YUP) +
    chiziq(E[0], E[1], J[0], E[1], YUP) +
    chiziq(F[0], F[1], J[0], J[1]) + chiziq(J[0], J[1], L[0], L[1], 'stroke="currentColor" fill="none" stroke-width="2.6"') +
    nuqta(F[0], F[1]) + nuqta(E[0], E[1]) + nuqta(J[0], J[1]) + nuqta(L[0], L[1]) +
    yoz(F[0] - 9, F[1] + 4, "F", { a: "end" }) + yoz(E[0] - 9, E[1] + 4, "E", { a: "end" }) +
    yoz(J[0] + 2, J[1] - 8, "J") + yoz(L[0], L[1] - 8, "L") + yoz(L[0], 168 + 26, "Shahar", { kursiv: false, z: 13 }) +
    olcham(46, F[1], 46, E[1]) + yoz(42, 88, "1 km", { a: "end", z: 12, kursiv: false }) +
    olcham(E[0], 142, J[0], 142) + yoz((E[0] + J[0]) / 2, 158, "x", { z: 13 }) +
    olcham(E[0], 172, L[0], 172) + yoz((E[0] + L[0]) / 2, 168 - 2, "5 km", { z: 12, kursiv: false }));
}
