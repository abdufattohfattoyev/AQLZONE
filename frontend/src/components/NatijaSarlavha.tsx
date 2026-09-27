/**
 * Natija ekranining tepasidagi YOPISHQOQ sarlavha — orqaga va nom.
 *
 * Nega kerak: natija ekrani uzun (sertifikatda 40 tagacha xato, DTM da
 * 20 dan ortiq mavzu) va chiqish tugmasi faqat eng pastda edi. Brauzerda
 * variantlarga qaytish uchun butun sahifani aylantirib tushish kerak edi.
 * Endi orqaga tugma doim tepada turadi, sahifa aylansa ham.
 *
 * Telegram ichida o'z strelkasi chizilmaydi (`useOrqaga` → `strelka`):
 * u yerda sarlavhadagi nativ "←" bor, ikkita orqaga tugma chalg'itadi.
 */
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";

export function NatijaSarlavha({ nom, strelka, onChiq }: {
  nom: string;
  strelka: boolean;
  onChiq: () => void;
}) {
  return (
    <div className="sticky top-0 z-20 -mx-4 flex min-h-[60px] items-center gap-2.5 bg-[var(--az-body)] px-4 py-2
                    min-[360px]:-mx-[18px] min-[360px]:px-[18px]">
      {strelka && (
        <button type="button" onClick={onChiq} aria-label={t("ortga")} title={t("ortga")} data-tahlil="Natija: orqaga"
          className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate font-display text-[19px] leading-tight">{nom}</h1>
    </div>
  );
}
