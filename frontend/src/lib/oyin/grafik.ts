/**
 * O'yin kartasidagi KICHIK GRAFIK — oxirgi 7 natija (`manba/Oyin.dc.html`).
 *
 * Faqat chiziq, ostidagi yumshoq maydon, oxirgi nuqta (ko'k) va shu
 * yettitaning eng yaxshisi (oltin). O'q, to'r, raqam yo'q — bu hisobot
 * emas, "o'syapmanmi?" degan savolga bir qarashda javob.
 *
 * React'siz va sanani parametr qilib oladi — `scripts/oyin.ts` da sinaladi.
 */
import { kunFarqi, kunKaliti } from "../zanjir";
import type { OxirgiNatija } from "./rekord";

/** Tuval: 140×34, chiziq 5 dan 31 gacha (pastki chiziq — 31). */
export const G = { W: 140, H: 34, TEPA: 5, PAST: 31 } as const;

export interface Nuqta { x: number; y: number; qiymat: number }

export interface Grafik {
  chiziq: string;
  maydon: string;
  oxirgi: Nuqta;
  rekord: Nuqta;
  /** Oxirgi natija — rekordning o'zi: bitta oltin nuqta, ko'k halqa bilan. */
  birlashgan: boolean;
}

const yaxlit = (x: number) => Math.round(x * 10) / 10;

export function grafik(n: number[]): Grafik | null {
  if (!n.length) return null;
  const min = Math.min(...n);
  const max = Math.max(...n);
  // Bitta natija — tekis chiziq o'rtada, nuqta oxirida.
  const x = (i: number) => (n.length === 1 ? G.W : yaxlit((i * G.W) / (n.length - 1)));
  const y = (v: number) => (max === min
    ? yaxlit((G.TEPA + G.PAST) / 2)
    : yaxlit(G.PAST - ((v - min) / (max - min)) * (G.PAST - G.TEPA)));
  const nuqtalar = n.length === 1
    ? [`0 ${y(n[0]!)}`, `${G.W} ${y(n[0]!)}`]
    : n.map((v, i) => `${x(i)} ${y(v)}`);
  const chiziq = `M${nuqtalar.join(" L")}`;
  const oi = n.length - 1;
  // Bir nechta teng rekord bo'lsa — eng YANGISI (oxirgisiga yaqini).
  const ri = n.lastIndexOf(max);
  return {
    chiziq,
    maydon: `${chiziq} L${G.W} ${G.PAST} L0 ${G.PAST} Z`,
    oxirgi: { x: x(oi), y: y(n[oi]!), qiymat: n[oi]! },
    rekord: { x: x(ri), y: y(max), qiymat: max },
    birlashgan: ri === oi,
  };
}

/**
 * "↑ +17 haftada": oxirgi natija minus so'nggi 7 kun ichidagi eng eski
 * natija. Haftada bittadan kam natija bo'lsa — `null` (farq ma'nosiz).
 */
export function haftalikFarq(r: OxirgiNatija[], bugun = kunKaliti()): number | null {
  const hafta = r.filter((x) => kunFarqi(x.k, bugun) <= 6);
  if (hafta.length < 2) return null;
  return hafta[hafta.length - 1]!.b - hafta[0]!.b;
}
