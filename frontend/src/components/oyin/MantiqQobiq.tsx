/**
 * Mantiq o'yinlari (Izdosh, Qoida ovi, Strelka yo'li) uchun umumiy qismlar:
 * sarlavha, darajalar qatori va g'alaba kartasi.
 *
 * Uchala o'yin bir xil "ramka" ichida turadi — odam bittasini o'rgansa,
 * qolganlarida tugmalar qayerdaligini qidirmaydi. Sarlavha Son ovi
 * ekranidagi bilan bir xil o'lchamda (`screens/SonOvi.tsx`).
 */
import type { ReactNode } from "react";
import { Icon } from "../../lib/icons";
import { t } from "../../lib/matn";

export function MantiqSarlavha({ nom, izoh, onChiq, onYordam }: {
  nom: string;
  izoh: ReactNode;
  onChiq: () => void;
  onYordam?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" onClick={onChiq} title={t("ortga")} aria-label={t("ortga")}
        className="clay-press grid size-11 shrink-0 place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm">
        <Icon name="chevron" size={20} className="rotate-180" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[19px] leading-tight">{nom}</h1>
        <p className="truncate text-[12.5px] text-ink-soft">{izoh}</p>
      </div>
      {onYordam && (
        <button type="button" onClick={onYordam} aria-label={t("mqQanday")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-full bg-karta font-display
                     text-[18px] text-brand-blue shadow-clay-sm">?</button>
      )}
    </div>
  );
}

/**
 * Darajalar qatori: o'tilganlar belgili, keyingisi ochiq, qolganlari qulf.
 * Ko'p bo'lsa suriladi; joriysi o'rtada turadi.
 */
export function DarajaQatori({ jami, joriy, ochiq, otilgan, onTanla }: {
  jami: number;
  /** 0 dan boshlanadi. */
  joriy: number;
  /** Shu indeksgacha (shu ham) ochiq. */
  ochiq: number;
  otilgan: (i: number) => boolean;
  onTanla: (i: number) => void;
}) {
  return (
    <div className="flex shrink-0 gap-1.5 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist" aria-label={t("mqDarajalar")}>
      {Array.from({ length: jami }, (_, i) => {
        const qulf = i > ochiq;
        const faol = i === joriy;
        return (
          <button key={i} type="button" role="tab" aria-selected={faol} disabled={qulf}
            ref={faol ? (el) => el?.scrollIntoView({ block: "nearest", inline: "center" }) : undefined}
            onClick={() => onTanla(i)}
            className={`grid h-9 min-w-9 shrink-0 place-items-center rounded-full px-2 font-display text-[14px]
                        disabled:opacity-40 ${
              faol ? "bg-brand-blue text-white shadow-clay-sm"
                : otilgan(i) ? "bg-karta text-brand-green-d shadow-clay-sm"
                : "bg-track text-ink-soft"}`}>
            {qulf ? <Icon name="lock" size={14} /> : otilgan(i) && !faol ? <Icon name="check" size={15} /> : i + 1}
          </button>
        );
      })}
    </div>
  );
}

/** Yulduzlar — 1..3, oltin. */
export function Yulduzlar({ n }: { n: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={t("mqYulduz", { n })}>
      {[1, 2, 3].map((i) => (
        <Icon key={i} name={i <= n ? "star" : "starOff"} size={26}
          className={i <= n ? "text-brand-gold" : "text-ink-dim"} />
      ))}
    </span>
  );
}

/** G'alaba kartasi — maydon ostida chiqadi, maydonni yopmaydi. */
export function Galaba({ sarlavha, izoh, yulduz, tanga, keyingi, onKeyingi, onQayta }: {
  sarlavha: string;
  izoh: ReactNode;
  yulduz: number;
  tanga: number;
  keyingi: string;
  onKeyingi: () => void;
  onQayta: () => void;
}) {
  return (
    <div role="status" className="az-kirish flex flex-col items-center gap-2 rounded-clay bg-karta p-4 text-center shadow-clay">
      <Yulduzlar n={yulduz} />
      <div className="font-display text-[19px]">{sarlavha}</div>
      <p className="text-[14px] leading-snug text-ink-soft">{izoh}</p>
      {tanga > 0 && (
        <span className="flex items-center gap-1.5 rounded-full bg-brand-gold/16 px-3 py-1 font-display text-[14px]
                         font-bold text-brand-gold-d">
          <span aria-hidden className="size-3.5 rounded-full bg-brand-gold" />+{tanga}
        </span>
      )}
      <div className="mt-1 flex w-full gap-2">
        <button type="button" onClick={onQayta}
          className="clay-press min-h-11 flex-1 rounded-3xl bg-track font-display text-[15px] text-ink-soft">
          {t("mqQayta")}
        </button>
        <button type="button" onClick={onKeyingi} data-tahlil="Mantiq: keyingi"
          className="tugma-3d min-h-11 flex-[1.4] rounded-3xl bg-brand-blue font-display text-[15px] text-white
                     shadow-[0_4px_0_var(--color-brand-blue-d)]">
          {keyingi}
        </button>
      </div>
    </div>
  );
}

/** Pastdan chiqadigan "Qanday o'ynaladi" varag'i. */
export function Qanday({ sarlavha, qatorlar, onYop }: { sarlavha: string; qatorlar: string[]; onYop: () => void }) {
  return (
    <div onClick={onYop} role="dialog" aria-modal="true" aria-label={sarlavha}
      className="az-kanal-fon fixed inset-0 z-[80] grid place-items-end bg-black/45 backdrop-blur-[2px]
                 sm:place-items-center sm:p-4">
      <div onClick={(e) => e.stopPropagation()}
        className="az-kanal w-full rounded-t-clay bg-karta p-5 pb-[calc(1.25rem+var(--az-past,0px))] shadow-clay
                   sm:max-w-[420px] sm:rounded-clay">
        <h2 className="font-display text-[18px]">{sarlavha}</h2>
        <ol className="mt-3 flex flex-col gap-2.5">
          {qatorlar.map((q, i) => (
            <li key={i} className="flex gap-2.5 text-[14.5px] leading-snug text-ink-soft">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-track font-display text-[13px] text-ink">
                {i + 1}
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
        <button type="button" onClick={onYop}
          className="tugma-3d mt-4 min-h-11 w-full rounded-3xl bg-brand-blue font-display text-[15px] text-white
                     shadow-[0_4px_0_var(--color-brand-blue-d)]">
          {t("mqTushundim")}
        </button>
      </div>
    </div>
  );
}

/** Xotira: o'yin holatini qurilmada saqlash (bloklangan bo'lsa jim). */
export function oqi<T>(kalit: string, standart: T): T {
  try {
    const x = localStorage.getItem(kalit);
    return x ? { ...standart, ...(JSON.parse(x) as T) } : standart;
  } catch { return standart; }
}

export function yoz(kalit: string, qiymat: unknown): void {
  try { localStorage.setItem(kalit, JSON.stringify(qiymat)); } catch { /* jim */ }
}
