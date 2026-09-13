/**
 * KURS BELGISI — kurs kartasidagi 3D narsa.
 *
 * ─────────── NEGA ALOHIDA PAPKA ───────────
 *
 * `src/rasm/` dagi fayllar kichkintoy KARTALARINING id'siga bog'langan
 * (`chizma/surat.ts`): u yerdagi `mashina.webp` "mashina" degan kartani
 * almashtiradi. Kurs belgilari esa boshqa narsa va ular bitta papkada
 * tursa, bir kun kimdir faylni almashtiradi va nima uchundir Kichkintoy
 * albomi ham o'zgarib qoladi. Shuning uchun ular `src/rasm/kurs/` da.
 * `surat.ts` dagi qidiruv ichma-ich EMAS (`rasm/*`), ya'ni bu papka
 * unga ko'rinmaydi.
 *
 * ─────────── NEGA KURS ID'SI BO'YICHA ───────────
 *
 * Ilgari fayl `ic` nomi bilan atalardi (`percent.webp`). Lekin `ic`
 * NOYOB EMAS: 5-sinf va 10-sinf algebrasi ikkalasi ham `percent` va
 * ro'yxatda ikkita bir xil "%" plitka yonma-yon turardi. `ic` ni
 * almashtirish ham mumkin emas edi — u darslar xaritasidagi chiziqli
 * belgining ham nomi. Kurs `id` si esa hech qachon takrorlanmaydi.
 *
 * ─────────── NEGA PLITKA EMAS, NARSA ───────────
 *
 * Birinchi to'plam rangli kvadrat plitkalar edi — telefondagi ilova
 * belgisiga o'xshash. Yangilari plitkasiz: palitra, cho't, sirkul…
 * O'ZI bir narsa bo'lib turadi va karta foni ustida "suzadi". Rasmlar
 * `.belgi/kurs/` dagi promptlar bilan bitta uslubda — kursning o'z
 * rangi va krem — va bir yorug'likda chizilgan (`.belgi/kes.py`,
 * `.belgi/teshik.py`).
 *
 * Rasmi yo'q kurs eski ko'rinishda — rangli kvadrat va chiziqli belgi —
 * ishlab turaveradi.
 */

const FAYLLAR = import.meta.glob<string>(
  "../../rasm/kurs/*.{png,webp}",
  { eager: true, query: "?url", import: "default" },
);

const JADVAL: Record<string, string> = {};
for (const [yol, manzil] of Object.entries(FAYLLAR)) {
  // "../../rasm/kurs/grade1.webp" → "grade1"
  const nom = yol.split("/").pop()?.replace(/\.[^.]+$/, "");
  if (nom) JADVAL[nom] = manzil;
}

/** Shu kurs uchun 3D belgi bormi? Bo'lsa — uning manzili. */
export const kursBelgi = (kursId: string): string | undefined => JADVAL[kursId];
