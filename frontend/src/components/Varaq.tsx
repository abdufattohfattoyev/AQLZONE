/**
 * Tanlov varag'i — pastdan chiqadigan kichik oyna va uning tanlovlari.
 *
 * Ilgari faqat `screens/Masalalar.tsx` ichida yashardi. Yangi dizaynda
 * xuddi shu varaq "Men" bo'limida (til, yorug'lik) va O'qish qobig'ida
 * (sinf tanlagich) ham kerak — uch joyda uch xil oyna bo'lmasin, bitta
 * komponentga chiqarildi.
 *
 * Fonga bosilsa yopiladi. Bu yerda tanga sarflanmaydi, ya'ni
 * e'tiborsiz bosishning narxi yo'q (`components/TangaSorov.tsx`
 * dagi holat boshqacha va u yerda fon yopmaydi).
 */
import type { ReactNode } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";

export function TanlovVaraq(
  { sarlavha, onYop, children }:
  { sarlavha: string; onYop: () => void; children: ReactNode },
) {
  return (
    <div onClick={onYop} role="dialog" aria-modal="true" aria-label={sarlavha}
      className="az-kanal-fon fixed inset-0 z-[80] grid place-items-end bg-black/45
                 backdrop-blur-[2px] sm:place-items-center sm:p-4">
      <div onClick={(e) => e.stopPropagation()}
        className="az-kanal w-full rounded-t-clay bg-karta p-4 pb-[calc(1rem+var(--az-past,0px))]
                   shadow-clay sm:max-w-[420px] sm:rounded-clay sm:pb-4">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-[16px] leading-tight">{sarlavha}</h2>
          <button type="button" onClick={onYop} aria-label={t("yopish")}
            className="clay-press ml-auto grid size-9 shrink-0 place-items-center rounded-full
                       bg-sahna text-ink-dim">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">{children}</div>
      </div>
    </div>
  );
}

/**
 * Varaq ichidagi bitta tanlov. Tanlangani KO'K — ilgari binafsha edi,
 * dizayn qoidasida esa "tanlangan holat" faqat ko'k.
 */
export function Tanlov(
  { faol, on, children }: { faol: boolean; on: () => void; children: ReactNode },
) {
  return (
    <button type="button" onClick={on} aria-pressed={faol}
      className={`clay-press flex min-h-10 items-center gap-1.5 rounded-full px-4 py-1.5
                  text-[13.5px] whitespace-nowrap ${
        faol
          ? "bg-brand-blue font-display text-white shadow-clay-sm"
          : "shadow-ichki bg-sahna text-ink-soft"}`}>
      {children}
    </button>
  );
}
