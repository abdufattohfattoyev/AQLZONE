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
import { tebrat } from "../lib/qobiq";
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
      className={`h-10 flex-1 rounded-xl font-display text-[14px] transition-colors
                  ${joriy === tur ? "bg-karta text-ink shadow-clay-sm" : "text-ink-soft"}`}>
      {nom}
    </button>
  );
  return (
    <div className="az-kirish mt-4 flex gap-1 rounded-2xl bg-track p-1">
      {tugma("dtm", t("imtihonTurDtm"))}
      {tugma("sertifikat", t("imtihonTurSert"))}
    </div>
  );
}
