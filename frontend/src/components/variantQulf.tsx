/** Yopiq variant qulfi — ro'yxat ekranlari uchun hook (`PremiumVaraq.tsx` bilan birga). */
import { useState } from "react";
import { PremiumVaraq } from "./PremiumVaraq";
import { tebrat } from "../lib/qobiq";
import { ochiqmi, usePremium } from "../lib/premium";

/**
 * Variantlar ro'yxati uchun: `tanla(n)` ochiq variantni ochadi, yopig'ida
 * varaqni chiqaradi. Uchala imtihon ro'yxati (DTM, sertifikat, qabul)
 * bitta qoidaga bo'ysunsin — har birida alohida yozilsa, biri albatta
 * boshqacha bo'lib qolardi.
 */
export function useVariantQulf(och: (n: number) => void) {
  const h = usePremium();
  const [qulf, setQulf] = useState<number | null>(null);
  const yopiqmi = (n: number) => !ochiqmi(h, n);
  const tanla = (n: number) => {
    if (!yopiqmi(n)) return och(n);
    tebrat("tanlov");
    setQulf(n);
  };
  const varaq = qulf === null ? null : (
    <PremiumVaraq n={qulf} onYop={() => setQulf(null)}
      onOchildi={() => { setQulf(null); och(qulf); }} />
  );
  return { yopiqmi, tanla, varaq };
}
