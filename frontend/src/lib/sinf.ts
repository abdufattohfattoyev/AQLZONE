/** O'qituvchi sinfi — mijoz qismi (`core/sinf.py`). */
import { bilanProfil, profilQuery, sorov } from "./api";

export interface SinfQisqa {
  id: number;
  nom: string;
  kod: string;
  ustoz: string;
  azo: number;
  men_ustoz?: boolean;
  azo_men?: boolean;
}

export interface SinfOquvchi {
  id: number;
  ism: string;
  oxirgi: string | null;
  hafta_kun: number;
  dars_hafta: number;
  aniqlik: number | null;
  dtm: number;
  dtm_eng: number | null;
  sert_eng: number | null;
}

export interface SinfReytingQator { orin: number; id: number; ism: string; ball: number; men: boolean }

export interface SinfToliq extends SinfQisqa {
  reyting: SinfReytingQator[];
  /** Faqat o'qituvchiga. */
  oquvchilar?: SinfOquvchi[];
  zaif?: { mavzu: string; odam: number; xato: number }[];
  faol_hafta?: number;
}

export const sinflarim = () =>
  sorov<{ ustoz: SinfQisqa[]; azo: SinfQisqa[] }>(`/api/v1/sinflar${profilQuery()}`);
export const sinfYarat = (nom: string) => sorov<SinfQisqa>("/api/v1/sinflar", bilanProfil({ nom }));
export const sinfKod = (kod: string) =>
  sorov<SinfQisqa>(`/api/v1/sinf/kod/${encodeURIComponent(kod)}${profilQuery()}`);
export const sinfQoshil = (kod: string) => sorov<SinfQisqa>("/api/v1/sinf/qoshil", bilanProfil({ kod }));
export const sinfOch = (id: number) => sorov<SinfToliq>(`/api/v1/sinf/${id}${profilQuery()}`);
export const sinfAmal = (id: number, amal: "chiq" | "chiqar" | "ochir", profil?: number) =>
  sorov<{ ok: boolean }>(`/api/v1/sinf/${id}/${amal}`, bilanProfil(profil ? { profil } : {}));

/** O'quvchilarga yuboriladigan havola — bot ichida, kod bilan (`/start sinf_<KOD>`). */
export const sinfHavola = (bot: string, kod: string) => `https://t.me/${bot}?start=sinf_${kod}`;
