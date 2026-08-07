/**
 * KURS BELGISI — sinf kartasidagi 3D plitka.
 *
 * ─────────── NEGA ALOHIDA PAPKA ───────────
 *
 * `src/rasm/` dagi fayllar kichkintoy KARTALARINING id'siga bog'langan
 * (`chizma/surat.ts`): u yerdagi `car.webp` "mashina" degan kartani
 * almashtirardi. Kurs belgilari esa boshqa narsa — ular `ic` nomiga
 * bog'lanadi va ularning ichida ham `car` bor.
 *
 * Ikkisi bitta papkada tursa, bir kun kimdir `car.webp` ni
 * almashtiradi va nima uchundir Kichkintoy albomi ham o'zgarib
 * qoladi. Shuning uchun ular `src/rasm/kurs/` da, o'z ro'yxati bilan.
 * `surat.ts` dagi qidiruv ichma-ich EMAS (`rasm/*`), ya'ni bu papka
 * unga ko'rinmaydi.
 *
 * ─────────── NEGA PLITKANING O'ZI ───────────
 *
 * Ilgari karta rangli kvadrat chizib, ustiga oq chiziqli belgi
 * qo'yardi. Bu fayllarda esa kvadrat ham, belgi ham, yorug'lik ham
 * BITTA rasmda. Shu sabab ular ishlatilganda kartaning o'z rangli
 * kvadrati chizilmaydi — aks holda plitka plitka ustida turardi.
 *
 * Rasmi yo'q kurs (masalan "Maktabgacha") eski ko'rinishda ishlab
 * turaveradi.
 */

const FAYLLAR = import.meta.glob<string>(
  "../../rasm/kurs/*.{png,webp}",
  { eager: true, query: "?url", import: "default" },
);

const JADVAL: Record<string, string> = {};
for (const [yol, manzil] of Object.entries(FAYLLAR)) {
  // "../../rasm/kurs/count.webp" → "count"
  const nom = yol.split("/").pop()?.replace(/\.[^.]+$/, "");
  if (nom) JADVAL[nom] = manzil;
}

/** Shu `ic` uchun 3D plitka bormi? Bo'lsa — uning manzili. */
export const kursBelgi = (ic: string): string | undefined => JADVAL[ic];
