/**
 * Haftalik jadval va mening darajam.
 *
 * Ikki tab: HAMMASI va BIRGA O'YNAGANLARIM. Ikkinchisi odatiy tanlov —
 * "dadamdan o'tib ketdim" umumiy 500-o'rindan ko'ra kuchliroq qaytish
 * sababi. Jadval har dushanba noldan boshlanadi: yangi kelgan ham
 * birinchi bo'la oladi.
 */
import { useEffect, useState } from "react";
import { xonaTajriba } from "../lib/api";
import type { XonaTajribaJavob } from "../lib/api";
import { avatarBelgi } from "../lib/dokon";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";
import { DarajaChiziq } from "../components/xona/Tajriba";

type Tur = "birga" | "hammasi";
const MEDAL = ["🥇", "🥈", "🥉"];

export function Jadval({ onChiq }: { onChiq: () => void }) {
  const ozStrelka = useOrqaga(onChiq);
  const [tur, setTur] = useState<Tur>("birga");
  const [javob, setJavob] = useState<XonaTajribaJavob | null>(null);
  const [xato, setXato] = useState(false);

  useEffect(() => {
    let bekor = false;
    setXato(false);
    xonaTajriba(tur).then((j) => { if (!bekor) setJavob(j); }).catch(() => { if (!bekor) setXato(true); });
    return () => { bekor = true; };
  }, [tur]);

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-10 sm:max-w-[560px]">
      {ozStrelka && (
        <button type="button" onClick={onChiq} title={t("ortga")}
          className="clay-press grid size-[38px] place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}
      <div className="az-kirish mt-3 flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-brand-gold/20">
          <EmojiBelgi e="🏆" olcham={32} />
        </span>
        <span className="min-w-0">
          <h1 className="text-[19px] leading-tight">{t("tjJadval")}</h1>
          <p className="mt-0.5 text-[12px] text-ink-soft">{t("tjJadvalIzoh")}</p>
        </span>
      </div>

      {javob && (
        <div className="az-kirish mt-4">
          <h2 className="mb-1.5 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">{t("tjMeningDaraja")}</h2>
          <DarajaChiziq keyin={javob.tajriba} />
          <p className="mt-1.5 ml-1.5 text-[11.5px] text-ink-soft">
            {t("tjOyinGalaba", { o: javob.tajriba.oyinlar, g: javob.tajriba.galabalar })}
          </p>
        </div>
      )}

      <div role="tablist" className="mt-5 flex rounded-full bg-track p-1">
        {(["birga", "hammasi"] as Tur[]).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tur === k} onClick={() => setTur(k)}
            data-tahlil={`Jadval: ${k}`}
            className={`flex-1 rounded-full py-2.5 font-display text-[13.5px] transition-colors ${
              tur === k ? "bg-karta text-ink shadow-clay-sm" : "text-ink-soft"}`}>
            {t(k === "birga" ? "tjBirga" : "tjHammasi")}
          </button>
        ))}
      </div>

      {xato ? (
        <p className="mt-8 text-center text-[13px] text-ink-soft">{t("tjXato")}</p>
      ) : !javob ? (
        <div className="mx-auto mt-10 size-8 animate-spin rounded-full border-4 border-track border-t-brand-blue" />
      ) : javob.jadval.qatorlar.length === 0 ? (
        <p className="mt-8 px-4 text-center text-[13.5px] leading-snug text-ink-soft">
          {t(tur === "birga" ? "tjBoshBirga" : "tjBoshJadval")}
        </p>
      ) : (
        <>
          {javob.jadval.men && javob.jadval.men.joy > javob.jadval.qatorlar.length && (
            <p className="mt-3 text-center font-display text-[13.5px] text-brand-blue">
              {t("tjSizJoy", { n: javob.jadval.men.joy })}
            </p>
          )}
          <div className="mt-3 space-y-1.5">
            {javob.jadval.qatorlar.map((q) => (
              <div key={q.joy} className={`flex items-center gap-2.5 rounded-clay px-3 py-2.5 ${
                q.menmi ? "bg-brand-blue/15" : "bg-karta shadow-clay-sm"}`}>
                <span className="w-7 shrink-0 text-center font-display text-[14px] text-ink-soft">
                  {MEDAL[q.joy - 1] ?? q.joy}
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-track text-[18px]">
                  {avatarBelgi(q.avatar)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px]">{q.menmi ? t("xonaSiz") : q.ism}</span>
                <span className="shrink-0 font-display text-[14px] text-brand-gold-d">{q.ochko}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
