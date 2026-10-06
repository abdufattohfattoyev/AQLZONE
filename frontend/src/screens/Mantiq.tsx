/**
 * MANTIQ VA FIKRLASH — mavzular ro'yxati (`lib/mantiq.ts`).
 *
 * Tepada bitta katta tugma — birinchi yulduzsiz mavzu ("keyingi").
 * Ostida hamma mavzular: QULF YO'Q. Mantiq darslari bir-biriga
 * tayanmaydi — "tarozi" ni bilish uchun "kalendar" shart emas, va
 * qiziqqan mavzuni ochishga to'sqinlik qilish bolani faqat zeriktiradi.
 * Tartib esa osondan qiyinga, ya'ni ketma-ket borgan bola adashmaydi.
 *
 * Kartada uch qavat (dizayn qoidasi): raqam · nom va izoh · yulduzlar.
 */
import { Icon } from "../lib/icons";
import { Hajmli } from "../lib/hajmli";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";
import { mantiqMavzular, mantiqYulduzlar } from "../lib/mantiq";

export function Mantiq({ onMavzu, onChiq }: { onMavzu: (id: string) => void; onChiq: () => void }) {
  const strelka = useOrqaga(onChiq);
  const mavzular = mantiqMavzular();
  const yulduz = mantiqYulduzlar();
  const keyingi = mavzular.find((m) => !yulduz[m.id]) ?? mavzular[0]!;
  const otilgan = mavzular.filter((m) => yulduz[m.id]).length;

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-10 min-[360px]:px-[18px]
                    sm:max-w-[560px]">
      <header className="flex items-center gap-2.5">
        {strelka && (
          <button type="button" onClick={onChiq} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[20px] leading-tight">{t("mantiqSarlavha")}</h1>
          <p className="text-[13px] leading-snug text-ink-dim">{t("mantiqIzoh", { n: mavzular.length })}</p>
        </div>
        <Hajmli nom="miya" olcham={40} />
      </header>

      <section className="flex flex-col gap-2.5 rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:p-[18px]">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-bold text-brand-blue-t">{t("mantiqKeyingi")}</span>
          <span className="ml-auto text-[13px] text-ink-dim">{t("mantiqOtildi", { n: otilgan, jami: mavzular.length })}</span>
        </div>
        <div className="font-display text-[22px] leading-tight">{keyingi.nom}</div>
        <p className="text-[14px] leading-snug text-ink-soft">{keyingi.usul.t}</p>
        <button type="button" onClick={() => onMavzu(keyingi.id)} data-tahlil="Mantiq: keyingi mavzu"
          className="tugma-3d mt-1 flex min-h-[52px] items-center justify-center gap-2 rounded-[16px] bg-brand-blue
                     font-display text-[17px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
          {t("bugunAmalBoshlash")}
          <Icon name="chevron" size={18} />
        </button>
      </section>

      <h2 className="mt-1 font-display text-[19px]">{t("mantiqMavzular")}</h2>
      <ol className="flex flex-col gap-2">
        {mavzular.map((m, i) => {
          const y = yulduz[m.id] ?? 0;
          return (
            <li key={m.id}>
              <button type="button" onClick={() => onMavzu(m.id)} data-tahlil={`Mantiq: ${m.id}`}
                className="clay-press flex min-h-[60px] w-full items-center gap-3 rounded-[18px] bg-karta px-3.5 py-2.5
                           text-left shadow-clay-sm">
                <span className={`grid size-[34px] shrink-0 place-items-center rounded-full font-display font-bold ${
                  y ? "bg-brand-green text-white" : "bg-track text-ink-dim"}`}>
                  {y ? <Icon name="check" size={18} /> : i + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col leading-snug">
                  <span className="text-[15.5px] font-bold">{m.nom}</span>
                  <span className="truncate text-[13px] text-ink-dim">{m.izoh}</span>
                </span>
                {y > 0 && (
                  <span className="shrink-0 font-display text-[14px] text-brand-gold-d" aria-label={`${y} / 3`}>
                    {"★".repeat(y)}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
