/**
 * SURAT — chizma o'rniga qo'yiladigan HAQIQIY rasm.
 *
 * ─────────── NEGA BU BOR ───────────
 *
 * Chizma har telefonda bir xil ko'rinadi va hech kimning mulki emas.
 * Lekin haqiqiy suratning o'z kuchi bor: bola ko'chada ko'rgan
 * narsani ekranda AYNAN o'sha holida taniydi.
 *
 * Shuning uchun ikkalasi ham ishlaydi. `src/rasm/` papkasiga
 * kartaning id'si nomi bilan fayl tashlansa (`samolyot.png`), karta
 * o'sha zahoti chizma o'rniga o'sha suratni ko'rsatadi. Kodga tegish
 * SHART EMAS — fayl qo'yildi, tamom.
 *
 * ─────────── NEGA `public/` EMAS ───────────
 *
 * `public/rasm/samolyot.png` deb yozib qo'yish osonroq edi, lekin u
 * "fayl bormi?" degan savolga javob bera olmaydi: brauzer har karta
 * uchun so'rov yuborib, 404 olishi kerak bo'lardi — ya'ni rasmi yo'q
 * o'n ikkita karta har ochilganda o'n ikkita bekor so'rov.
 *
 * `import.meta.glob` esa YIG'ISH PAYTIDA ishlaydi: qaysi fayl borligi
 * oldindan ma'lum, manzillari esa nom-belgili bo'ladi (kesh
 * muammosi ham shu bilan yo'qoladi).
 *
 * ─────────── FAYL QANDAY BO'LISHI KERAK ───────────
 *
 *   • FONI SHAFFOF png yoki webp — karta oq, fonli surat esa uning
 *     ustida "yamoq" bo'lib turadi;
 *   • kvadratga yaqin, taxminan 512×512;
 *   • narsa markazda va chetdan biroz bo'shliq bilan;
 *   • 150 KB dan og'ir bo'lmasin — bo'lim o'n ikkita kartadan iborat
 *     va ular sekin internetda ochiladi.
 *
 * ─────────── LITSENZIYA ───────────
 *
 * Faqat O'ZINGIZNIKI bo'lgan yoki tijoratda ishlatishga ochiq
 * litsenziyali surat qo'ying. Google'dan topilgan surat "bepul"
 * ko'rinadi-yu, deyarli har doim egasi bor. `lib/tovush.ts` da ham
 * shu sabab yozilgan: birovning mulki ilovaga kirsa, u vaqt bombasi
 * bo'lib qoladi.
 */

/**
 * Yig'ish paytida topilgan hamma surat: `{ "samolyot": "/assets/…" }`.
 *
 * Papka bo'sh bo'lsa, ro'yxat ham bo'sh bo'ladi va hamma karta
 * chizmada qolaveradi — ya'ni bu qo'shimcha hech narsani buzmaydi.
 */
const FAYLLAR = import.meta.glob<string>(
  "../../rasm/*.{png,webp,jpg,jpeg}",
  { eager: true, query: "?url", import: "default" },
);

const JADVAL: Record<string, string> = {};
for (const [yol, manzil] of Object.entries(FAYLLAR)) {
  // "../../rasm/samolyot.png" → "samolyot"
  const nom = yol.split("/").pop()?.replace(/\.[^.]+$/, "");
  if (nom) JADVAL[nom] = manzil;
}

/** Shu id uchun haqiqiy surat bormi? Bo'lsa — uning manzili. */
export const surat = (id: string): string | undefined => JADVAL[id];
