/**
 * DTM MARAFONI — mijoz qismi (`core/marafon.py`).
 *
 * Kunning varianti URUG'dan yasaladi (`marafon-<id>-<kun>`): shu kunning
 * savollari hamma uchun bir xil, xuddi DTM variantidek (`lib/imtihon.ts`).
 * Savollar serverda saqlanmaydi — faqat natija.
 */
import { bilanProfil, profilQuery, sorov } from "./api";
import { blokYasa } from "./blok";
import type { Blok } from "./blok";
import { kunUrugi, urugBilan } from "./oyin/urug";

export interface MarafonQator { orin: number; ism: string; ball: number; kun: number; men: boolean }

export interface MarafonHolat {
  id: number;
  nom: string;
  boshlanish: string;
  kunlar: number;
  savol: number;
  daqiqa: number;
  /** Bugun nechanchi kun; marafon ketmayotgan bo'lsa `null`. */
  kun: number | null;
  boshlanmagan: boolean;
  tugagan: boolean;
  ishtirokchi: number;
  men: {
    ball: number;
    kun: number;
    orin: number | null;
    zanjir: number;
    bugun: { togri: number; jami: number } | null;
  };
  reyting: MarafonQator[];
}

export async function marafonHolat(): Promise<MarafonHolat | null> {
  const j = await sorov<MarafonHolat | { yoq: true }>(`/api/v1/marafon${profilQuery()}`);
  return "yoq" in j ? null : j;
}

export function marafonYubor(
  m: Pick<MarafonHolat, "id">, kun: number, togri: number, jami: number, sekund: number,
): Promise<MarafonHolat> {
  return sorov("/api/v1/marafon", bilanProfil({ marafon: m.id, kun, togri, jami, sekund }));
}

/** Kunning varianti — DTM qamrovi (7–11 sinf), `savol` ta savol, `daqiqa` daqiqa. */
export function marafonBlok(id: number, kun: number, savol: number, daqiqa: number): Blok | null {
  return urugBilan(kunUrugi(`marafon-${id}-${kun}`, 7), () =>
    blokYasa(11, "dtm", { tur: "imtihon" }, { savol, daqiqa }));
}
