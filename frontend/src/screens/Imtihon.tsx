/**
 * IMTIHON — DTM matematika blokiga tayyorgarlik.
 *
 * Ekranning butun vazifasi bitta savolga javob berish: "imtihonga
 * tayyormanmi?". Shuning uchun tepada BALL turadi (oxirgi beshta
 * urinishning o'rtachasi), ostida esa variantlar.
 *
 * Nega ball o'rtacha: bitta natija hech narsa demaydi — omad ham,
 * charchoq ham bor. Beshta urinishning o'rtachasi esa haqiqatga
 * yaqin va aynan shu son o'sib borishi kerak (`lib/imtihon.ts`).
 */
import { Icon } from "../lib/icons";
import { Reveal } from "../components/Reveal";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";
import { OLCHAM, VARIANTLAR, daraja, engYaxshi, foiz, natijalar } from "../lib/imtihon";

export function Imtihon({ onVariant, onChiq }: {
  onVariant: (n: number) => void;
  onChiq: () => void;
}) {
  useOrqaga(onChiq);
  const d = daraja();
  const oxirgilar = natijalar().slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[430px] px-3.5 pt-4 pb-10 sm:max-w-[700px] sm:px-6">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onChiq} title={t("ortga")}
          className="clay-press grid size-10 shrink-0 place-items-center rounded-full bg-karta
                     text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-[19px] leading-tight">{t("imtihonTitul")}</h1>
          <p className="text-[12px] leading-snug text-ink-soft">
            {t("imtihonIzoh", { savol: OLCHAM.savol, daqiqa: OLCHAM.daqiqa })}
          </p>
        </div>
      </div>

      {/* ---- daraja ---- */}
      <Reveal kech={60}>
        <div className="az-kirish mt-4 rounded-clay bg-karta p-4 text-center shadow-clay-sm">
          {d ? (
            <>
              <div className="font-display text-[34px] leading-none text-brand-blue">{d.foiz}%</div>
              <div className="mt-1 text-[13px] text-ink-soft">
                {t("imtihonDaraja", { n: d.urinish })}
              </div>
            </>
          ) : (
            <>
              <div className="font-display text-[17px] leading-tight">{t("imtihonBoshlang")}</div>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{t("imtihonBoshlangIzoh")}</p>
            </>
          )}
        </div>
      </Reveal>

      {/* ---- variantlar ---- */}
      <h2 className="az-kirish mt-5 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("imtihonVariantlar")}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {Array.from({ length: VARIANTLAR }, (_, i) => i + 1).map((n) => {
          const eng = engYaxshi(n);
          return (
            <button key={n} type="button" onClick={() => onVariant(n)}
              data-tahlil={`Imtihon: ${n}-variant`}
              className="clay-press flex items-center gap-3 rounded-clay bg-karta p-3 text-left shadow-clay-sm">
              <span className={`grid size-10 shrink-0 place-items-center rounded-2xl font-display
                                text-[15px] ${eng ? "bg-brand-green/15 text-brand-green" : "bg-sahna text-ink-soft"}`}>
                {n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[13.5px] leading-tight">
                  {t("imtihonVariant", { n })}
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-soft">
                  {eng ? `${eng.togri}/${eng.jami} · ${foiz(eng)}%` : t("imtihonIshlanmagan")}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- oxirgi urinishlar ---- */}
      {oxirgilar.length > 0 && (
        <>
          <h2 className="az-kirish mt-6 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
            {t("imtihonOxirgilar")}
          </h2>
          <ol className="grid gap-1.5">
            {oxirgilar.map((x, i) => (
              <li key={`${x.variant}-${x.vaqt}-${i}`}
                className="flex items-center gap-2 rounded-clay bg-karta px-3 py-2 text-[13px] shadow-clay-sm">
                <span className="min-w-0 flex-1 truncate">{t("imtihonVariant", { n: x.variant })}</span>
                <span className="shrink-0 font-display text-ink-soft">
                  {x.togri}/{x.jami} · {Math.round(x.sekund / 60)} {t("daqiqaQisqa")}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}

      <p className="az-kirish mt-5 text-center text-[11.5px] leading-snug text-ink-soft/80">
        {t("imtihonPastIzoh")}
      </p>
    </div>
  );
}
