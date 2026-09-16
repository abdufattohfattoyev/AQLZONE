/**
 * TEST TO'PLAMLARI — hamma uchun bir xil savollar.
 *
 * Oddiy blok testdan farqi bitta, lekin hal qiluvchi: savollar URUG'
 * bilan yasaladi (`lib/oyin/urug.ts`) va har qurilmada aynan bir xil
 * chiqadi. Shu tufayli natijalarni solishtirish mumkin — "42 kishi
 * ishladi, o'rtacha 9/15, sen 70% idan yaxshiroq" degan gap haqiqat.
 *
 * Savollar serverda saqlanmaydi — server faqat urug'ni beradi va
 * natijani yozadi (`backend/core/test_toplam.py` dagi izohga qarang).
 */
import { bilanProfil, profilQuery, sorov } from "./api";
import { blokYasa, type Blok } from "./blok";
import { urugBilan } from "./oyin/urug";

export interface MeningNatija {
  togri: number;
  jami: number;
  sekund: number;
  /** Ishlaganlarning necha foizidan yaxshiroq. Yolg'iz bo'lsa `null`. */
  yaxshiroqFoiz: number | null;
}

export interface Statistika {
  ishlagan: number;
  ortacha: number;
  mening: MeningNatija | null;
}

export interface Toplam extends Statistika {
  id: number;
  raqam: number;
  sinf: number;
  nom: string;
  urug: number;
  savol: number;
  daqiqa: number;
  /** Faqat adminga keladi. */
  kanal?: { yuborilgan: boolean; havola: string; yoq: boolean };
}

export const royxat = (sinf?: number) =>
  sorov<{ royxat: Toplam[] }>(
    `/api/v1/toplamlar${sinf ? `?sinf=${sinf}${profilQuery("&")}` : profilQuery()}`,
  );

export const bittasi = (id: number) =>
  sorov<Toplam>(`/api/v1/toplamlar/${id}${profilQuery()}`);

export const natijaYubor = (id: number, togri: number, jami: number, sekund: number) =>
  sorov<Statistika & { birinchi: boolean }>(
    `/api/v1/toplamlar/${id}/natija`, bilanProfil({ togri, jami, sekund }),
  );

/** To'plamni ishlagan bitta odam — faqat admin ro'yxatida. */
export interface Ishlagan {
  profilId: number;
  ism: string;
  avatar: string;
  togri: number;
  jami: number;
  sekund: number;
  sana: string;
}

/** Kim ishlagan — admin bo'lmaganga server 404 qaytaradi. */
export const ishlaganlar = (id: number) =>
  sorov<{ royxat: Ishlagan[] }>(`/api/v1/toplamlar/${id}/ishlaganlar${profilQuery()}`);

export const kanalgaYubor = (id: number, qayta = false) =>
  sorov<{ holat: string; yuborilgan: boolean; havola?: string }>(
    `/api/v1/toplamlar/${id}/kanal`, bilanProfil({ qayta }),
  );

/**
 * To'plamning savollari — urug' bilan, ya'ni har qurilmada bir xil.
 *
 * `blokYasa` ichidagi hamma tasodif (`aralash` va har bir generator)
 * `urugBilan` davomida almashtirilgan `Math.random` dan o'tadi.
 */
export const toplamYasa = (t: Pick<Toplam, "sinf" | "urug" | "savol" | "daqiqa">): Blok | null =>
  urugBilan(t.urug, () => blokYasa(t.sinf, "toliq", { tur: "hammasi" },
    { savol: t.savol, daqiqa: t.daqiqa }));
