/**
 * Urug' — bir xil sondan bir xil savollar.
 *
 * NEGA KERAK. Kunlik maydonning butun ma'nosi shunda: hamma **bir xil**
 * savolni oladi. Aks holda jadval hech narsani o'lchamaydi — yuqorida
 * turgan odam yaxshi o'ynadimi yoki unga oson savollar tushdimi, buni
 * hech kim ayta olmaydi. "Menga qiyini chiqdi" degan e'tiroz esa
 * o'yinni birinchi haftadayoq o'ldiradi.
 *
 * ────────────── NEGA `Math.random` ALMASHTIRILADI ──────────────
 *
 * Savol yasovchilar (`lib/oyin/savollar.ts`, `lib/generators.ts`) —
 * o'nlab sof funksiya va ularning hammasi ichida `Math.random()` bor.
 * Ikki yo'l bor edi:
 *
 *   1. Har bir generatorga `rnd` parametrini uzatish. To'g'ri yo'l,
 *      lekin u ellikdan ortiq funksiyaning imzosini o'zgartiradi va
 *      yangi generator yozgan odam uni unutishi aniq — o'shanda o'yin
 *      jimgina noaniq bo'lib qoladi va buni hech kim sezmaydi.
 *   2. Yasash PAYTIDA `Math.random` ni vaqtincha almashtirish.
 *
 * Ikkinchisi tanlandi. U bitta joyda turadi, generatorlarga umuman
 * tegmaydi va yangi generator o'zi-o'zidan bo'ysunadi.
 *
 * XAVFSIZLIK CHORASI: almashtirish `try/finally` ichida. Generator
 * xato tashlasa ham asl `Math.random` qaytariladi — aks holda butun
 * ilova shu daqiqadan boshlab bir xil "tasodifiy" sonlar bilan
 * ishlab ketardi va buni topish deyarli imkonsiz bo'lardi.
 *
 * SINXRON kod uchun. Ichida `await` bo'lgan funksiyani o'rab
 * bo'lmaydi: kutish paytida boshqa kod ham almashtirilgan
 * `Math.random` ni ko'rardi. Bizdagi generatorlarning hammasi
 * sinxron va shunday qolishi kerak.
 */

/**
 * Sana kaliti ("2026-07-31") dan barqaror son yasaydi.
 *
 * Xesh oddiy (djb2) va ATAYLAB shunday: bu yerda kriptografiya kerak
 * emas, faqat "bir xil kun → bir xil son" kerak. Muhimi u qurilmadan
 * qurilmaga bir xil ishlashi — shuning uchun sana o'zi kalit bo'ladi,
 * `Date.now()` yoki vaqt mintaqasi emas.
 */
export function kunUrugi(kun: string, qism = 0): number {
  let x = 5381;
  const s = `${kun}#${qism}`;
  for (let i = 0; i < s.length; i++) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0;
  return x || 1;
}

/**
 * `ish()` ni berilgan urug' bilan bajaradi va natijasini qaytaradi.
 *
 * Ichkarida `Math.random` chiziqli kongruent generatorga almashadi —
 * u tez, qisqa va hamma brauzerda bir xil ishlaydi. Sifati o'yin
 * savollari uchun yetarli: bizga taqsimotning mukammalligi emas,
 * TAKRORLANUVCHANLIK kerak.
 */
export function urugBilan<T>(urug: number, ish: () => T): T {
  const asl = Math.random;
  let holat = urug >>> 0;
  Math.random = () => {
    // Numerical Recipes dagi koeffitsiyentlar — 32 bitli LCG.
    holat = (holat * 1664525 + 1013904223) >>> 0;
    return holat / 4294967296;
  };
  try {
    return ish();
  } finally {
    Math.random = asl;
  }
}
