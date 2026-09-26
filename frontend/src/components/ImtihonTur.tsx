/**
 * "DTM | Milliy sertifikat" almashtirgichi — ikkala imtihon ekranining
 * tepasida.
 *
 * NEGA ALOHIDA ESHIK EMAS. Bosh sahifada kattalar uchun joy ikki
 * kartaga mo'ljallangan (formulalar va imtihon) va uchinchisi
 * qo'shilsa, qator sinib, asosiy tugma pastga tushardi. Imtihonga
 * tayyorlanayotgan odam esa baribir shu ekranga keladi — tanlov shu
 * yerda turgani yetarli.
 *
 * Oxirgi tanlov eslab qolinadi: sertifikatga tayyorlanayotgan odamni
 * har safar DTM ro'yxati kutib olmasin (`App.tsx` → ImtihonSahifasi).
 */
import { tebrat, useOrqaga } from "../lib/qobiq";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { turniEsla } from "../lib/imtihonTur";
import type { ImtihonTuri } from "../lib/imtihonTur";

export function ImtihonTur({ joriy, onTanla }: { joriy: ImtihonTuri; onTanla: (t: ImtihonTuri) => void }) {
  const tugma = (tur: ImtihonTuri, nom: string) => (
    <button type="button" aria-pressed={joriy === tur}
      data-tahlil={`Imtihon turi: ${tur}`}
      onClick={() => {
        if (tur === joriy) return;
        tebrat("tanlov");
        turniEsla(tur);
        onTanla(tur);
      }}
      className={`min-h-11 flex-1 rounded-xl font-display text-[15px] transition-colors min-[360px]:text-[16px]
                  ${joriy === tur ? "bg-karta font-bold text-ink shadow-clay-sm" : "font-semibold text-ink-soft"}`}>
      {nom}
    </button>
  );
  return (
    <div className="flex gap-1 rounded-2xl bg-track p-1">
      {tugma("dtm", t("imtihonTurDtm"))}
      {tugma("sertifikat", t("imtihonTurSert"))}
    </div>
  );
}

/**
 * Ikkala ro'yxatning umumiy tepasi (`manba/Sertifikat.dc.html`, `Dtm.dc.html`):
 * orqaga · "Imtihonga tayyorgarlik" · DTM / Milliy sertifikat.
 */
export function ImtihonSarlavha({ joriy, onTanla, onChiq }: {
  joriy: ImtihonTuri; onTanla: (t: ImtihonTuri) => void; onChiq: () => void;
}) {
  const ozStrelka = useOrqaga(onChiq);
  return (
    <>
      <header className="flex min-h-12 items-center gap-3">
        {ozStrelka && (
          <button type="button" onClick={onChiq} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 font-display text-[20px] leading-tight min-[360px]:text-[22px]">
          {t("imtTayyorgarlik")}
        </h1>
      </header>
      <ImtihonTur joriy={joriy} onTanla={onTanla} />
    </>
  );
}
