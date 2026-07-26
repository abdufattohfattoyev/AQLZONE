/**
 * Yutuq nishonlari.
 *
 * Qo'lga kiritilmagan nishon ham to'liq ko'rsatiladi — nomi, sharti va
 * qancha qolgani bilan. Yashirin nishon bolani harakatga undamaydi:
 * u nimaga intilishini bilishi kerak.
 */
import { Icon } from "../lib/icons";
import type { Nishon } from "../lib/nishon";

interface Props {
  nishonlar: Nishon[];
  onBack: () => void;
}

export function Nishonlar({ nishonlar, onBack }: Props) {
  const olingan = nishonlar.filter((n) => n.daraja >= 1).length;

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-16">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} title="Ortga"
          className="clay-press grid size-[38px] place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      </div>

      <div className="az-kirish mt-4 text-center">
        <div className="text-[52px] leading-none">🏅</div>
        <h1 className="mt-2 text-[22px]">Nishonlar</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          {olingan} / {nishonlar.length} qo'lga kiritildi
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {nishonlar.map((n, i) => {
          const tayyor = n.daraja >= 1;
          return (
            <div
              key={n.id}
              className="az-kirish flex items-center gap-3.5 rounded-clay bg-karta p-4 shadow-clay-sm"
              style={{ "--az-kech": `${i * 55}ms` } as React.CSSProperties}
            >
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-2xl
                  ${tayyor ? "bg-brand-gold/20 text-brand-gold" : "bg-track text-ink-dim"}`}
              >
                <Icon name={n.ic} size={26} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className={`font-display text-[15px] ${tayyor ? "" : "text-ink-soft"}`}>
                    {n.nom}
                  </span>
                  {tayyor && <Icon name="check" size={16} className="text-brand-green-d" />}
                  {!tayyor && n.hisob && (
                    <span className="ml-auto shrink-0 text-[12px] text-ink-dim">{n.hisob}</span>
                  )}
                </div>

                <div className="mt-0.5 text-[12.5px] leading-snug text-ink-dim">{n.izoh}</div>

                {!tayyor && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-track">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-gold
                                 transition-[width] duration-500"
                      style={{ width: `${Math.round(n.daraja * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
