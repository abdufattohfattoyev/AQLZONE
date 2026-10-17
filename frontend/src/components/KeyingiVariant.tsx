/**
 * Natija ekranidagi asosiy tugma — keyingi variant.
 *
 * Nega: serverdagi voronka (2026-10-17, 30 kun) — sertifikatda 1-variantni
 * 35 odam ochgan, 2-sini 15 ta; DTM da 28 → 9. Yopiq variantgacha
 * hammasi bo'lib 18 kishigina yetgan.
 * Odam natijani ko'rib, "Qayta ishlash" yoki "Chiqish" ni bosib ketardi:
 * keyingi variantga o'tish uchun ro'yxatga qaytib, uni o'zi izlashi kerak edi.
 *
 * Keyingi variant yopiq bo'lsa ham tugma o'sha — faqat qulf belgisi bilan,
 * bosilganda Premium varag'i chiqadi (`useVariantQulf`). Natija hali ko'z
 * oldida turgan payt — Premium taklifi uchun eng to'g'ri payt.
 */
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { useVariantQulf } from "./variantQulf";

export function KeyingiVariant({ n, soni, onOch, tahlil }: {
  /** Hozir ishlangan variant. */
  n: number;
  /** Jami variantlar — oxirgisida tugma chiqmaydi. */
  soni: number;
  onOch: (n: number) => void;
  /** `data-tahlil` boshi: "DTM" → "DTM: keyingi variant". */
  tahlil: string;
}) {
  const qulf = useVariantQulf(onOch);
  const k = n + 1;
  if (k > soni) return null;
  const yopiq = qulf.yopiqmi(k);
  return (
    <>
      <button type="button" onClick={() => qulf.tanla(k)}
        data-tahlil={`${tahlil}: keyingi variant${yopiq ? " (yopiq)" : ""}`}
        className="tugma-3d flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue
                   font-display text-[18px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
        {yopiq && <Icon name="lock" size={18} />}
        {t("natijaKeyingi", { n: k })}
        {!yopiq && <Icon name="chevron" size={18} />}
      </button>
      {qulf.varaq}
    </>
  );
}
