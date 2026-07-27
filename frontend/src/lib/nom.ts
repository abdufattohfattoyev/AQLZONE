/**
 * Ismdagi bezakni olib tashlash.
 *
 * Telegram profilidagi ism ko'pincha bezakli bo'ladi — `꧁❖DAVRONOV❖꧂`,
 * `𝓓𝓪𝓿𝓻𝓸𝓷𝓸𝓿`, `Ali 🔥`. Server uni baribir tozalab saqlaydi
 * (`backend/core/nom.py`), lekin forma o'sha bezakni ko'rsatib tursa,
 * odam nima saqlanishini bilmay qoladi va "Davom etish" bosgach ismi
 * o'zgarib ketgandek tuyuladi.
 *
 * Shuning uchun maydonga qo'yishdan OLDIN shu yerda ham tozalanadi.
 * Qoida serverdagi bilan bir xil: `NFKC` bezakli shriftni oddiy harfga
 * qaytaradi, harf bo'lmagan hamma narsa tushib qoladi, bo'shliq-chiziqcha-
 * apostrof qoladi (`Abdulla-Aziz`, `Sa'dulla`).
 *
 * DIQQAT: bu tekshiruv EMAS. Yozib turgan odamning qo'lidan olmaymiz —
 * faqat tayyor qiymatni maydonga qo'yayotganda chaqiriladi. Yakuniy so'z
 * baribir serverda.
 */

/**
 * Ism ichida uchraydigan, harf bo'lmagan belgilar.
 *
 * Apostrof beshta ko'rinishda yoziladi — `o'`, `o‘`, `o’`, `oʻ`, `oʼ` —
 * va hammasi qoladi, aks holda `Gʻulom` → `Gulom` bo'lib ketardi.
 */
const AJRATGICH = " '‘’ʻʼ-";

export function tozala(v: string): string {
  const bosqich = (v ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    // harf, unga qo'shiladigan belgi va ajratgichlardan boshqasi ketadi
    .replace(/[^\p{L}\p{M} '‘’ʻʼ-]/gu, "");

  return kes(bosqich.replace(/[ '‘’ʻʼ-]{2,}/g, (m) => m[0])).slice(0, 120);
}

/** Chetdagi ajratgichlarni kesadi: `-Ali ` → `Ali`. */
function kes(v: string): string {
  let a = 0;
  let b = v.length;
  while (a < b && AJRATGICH.includes(v[a])) a++;
  while (b > a && AJRATGICH.includes(v[b - 1])) b--;
  return v.slice(a, b);
}
