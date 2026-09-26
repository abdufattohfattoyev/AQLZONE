/**
 * Oxirgi tanlangan imtihon turi — DTM yoki milliy sertifikat.
 *
 * Alohida faylda, `components/ImtihonTur.tsx` ichida emas: komponent
 * fayli faqat komponent eksport qilsa, dev serverda tez yangilanish
 * (fast refresh) ishlaydi.
 */
export type ImtihonTuri = "dtm" | "sertifikat";

const KALIT = "az_imtihon_tur";

export function oxirgiTur(): ImtihonTuri {
  try { return localStorage.getItem(KALIT) === "sertifikat" ? "sertifikat" : "dtm"; }
  catch { return "dtm"; }
}

export function turniEsla(tur: ImtihonTuri): void {
  try { localStorage.setItem(KALIT, tur); } catch { /* eslanmaydi, xolos */ }
}
