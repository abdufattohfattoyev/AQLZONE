/**
 * Duelda o'z darajasini ANIQLASH — endi so'ralmaydi.
 *
 * `duel.ts` dan ALOHIDA fayl: u sof va brauzersiz sinaladi
 * (`scripts/duel.ts`), bu yerdagi hisob esa anketaga va o'yin
 * rekordlariga (`rekord.ts` → `api.ts` → `localStorage`) bog'liq.
 */
import { oyinById } from "./index";
import { ochiqmi } from "./rekord";
import { profil, sinfOfProfil } from "../profil";
import type { Daraja, OyinId } from "./tur";

/**
 * Anketadan kelgan daraja: kim va qaysi sinf.
 *
 *   maktabgacha – 4-sinf   Oson
 *   5 – 9-sinf             O'rta
 *   10–11-sinf, abiturient, talaba, ustoz, kattalar — Qiyin
 *
 * Anketa to'ldirilmagan bo'lsa — `null`, o'shanda faqat o'yin tajribasi
 * hisobga olinadi.
 */
function anketaDarajasi(): Daraja | null {
  const p = profil();
  if (!p) return null;
  const sinf = sinfOfProfil(p);
  if (sinf !== null) return sinf <= 4 ? 1 : sinf <= 9 ? 2 : 3;
  // Ota-ona sinfsiz yoki ustoz/talaba/kattalar — katta odam.
  return 3;
}

/**
 * Duelda qaysi darajada yechiladi.
 *
 * Ilgari duelda ikkalasiga bir xil 2-daraja berilardi va bola dadasi
 * bilan o'ynab doim yutqazardi. Keyin har kim O'Z darajasini tanlaydigan
 * bo'ldi (Prodigy usuli), lekin tanlov o'zi to'siq edi: jonli taklif
 * oynasida 15 soniya bor, bola esa "Oson/O'rta/Qiyin" ustida o'ylanib
 * qolardi va vaqt tugardi. Reyting uchun hamma "Qiyin" ni bosishi ham
 * mumkin edi.
 *
 * 2026-09-26 dan daraja SO'RALMAYDI — Prodigy va Duolingo kabi ilova
 * o'zi biladi. Anketada hammadan sinf so'raladi va u asos bo'ladi.
 * Lekin "yosh — devor" xavfi (`tur.ts`: "NEGA DARAJA, YOSH EMAS") hali
 * ham bor: kuchli 3-sinf bolasi "Oson" da zerikardi. Shuning uchun
 * o'yinlar bo'limida YUQORIROQ daraja ochgan bo'lsa, o'sha olinadi —
 * ya'ni anketa pastki chegara, tajriba esa ko'taradi, hech qachon
 * tushirmaydi.
 */
export function duelDarajaTaklif(oyinId: string): Daraja {
  let d: Daraja = anketaDarajasi() ?? 1;
  const id = oyinId as OyinId;
  if (oyinById(id)) {
    for (const n of [3, 2] as const) {
      if (n > d && ochiqmi(id, n)) { d = n; break; }
    }
  }
  return d;
}
