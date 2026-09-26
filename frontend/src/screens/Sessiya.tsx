/**
 * SESSIYA — talabaning nazoratga tayyorgarligi (`lib/sessiya.ts`).
 *
 * Tepada fan tanlanadi (talabalar kurslari), ostida o'sha fanning
 * variantlari. Profilga mos fan boshdan tanlangan: 2-kurs talabasiga
 * 2-kurs dasturi. Har variant yonida eng yaxshi natija va taxminiy baho.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";
import { kursMatn } from "../lib/tarjima/kurs";
import { profilKursi, useProfil } from "../lib/profil";
import {
  SESSIYA_OLCHAM, SESSIYA_VARIANTLAR, baho, foizi, sessiyaEng, sessiyaKurslari, sessiyaNatijalari,
  sessiyaSinxronla,
} from "../lib/sessiya";

export function Sessiya({ onVariant, onChiq }: {
  onVariant: (slug: string, n: number) => void;
  onChiq: () => void;
}) {
  const ozStrelka = useOrqaga(onChiq);
  const kurslar = sessiyaKurslari();
  const oz = profilKursi(useProfil());
  const [slug, setSlug] = useState(() =>
    (oz && kurslar.includes(oz) ? oz : kurslar[0])?.slug ?? "");

  // Tarix serverdan: telefon almashsa ham yo'qolmaydi. Javob kelguncha
  // qurilmadagi nusxa ko'rinadi, kelgach ekran qayta chiziladi.
  const [, setYangilandi] = useState(0);
  useEffect(() => {
    let tirik = true;
    sessiyaSinxronla().then(() => { if (tirik) setYangilandi((n) => n + 1); }).catch(() => {});
    return () => { tirik = false; };
  }, []);

  const oxirgilar = sessiyaNatijalari().filter((x) => x.kurs === slug).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[430px] px-3.5 pt-4 pb-10 sm:max-w-[700px] sm:px-6">
      <div className="flex items-center gap-2">
        {ozStrelka && (
          <button type="button" onClick={onChiq} title={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta
                       text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-[19px] leading-tight">{t("sessiya")}</h1>
          <p className="text-[12px] leading-snug text-ink-dim">
            {t("sessiyaIzoh", { savol: SESSIYA_OLCHAM.savol, daqiqa: SESSIYA_OLCHAM.daqiqa })}
          </p>
        </div>
      </div>

      {/* ---- fan ---- */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {kurslar.map((c) => (
          <button key={c.slug} type="button" onClick={() => setSlug(c.slug)}
            data-tahlil={`Sessiya: fan ${c.id}`}
            aria-pressed={c.slug === slug}
            className={`clay-press min-h-11 rounded-2xl px-3 py-2 text-left text-[13.5px] leading-tight
                        ${c.slug === slug ? "bg-brand-blue text-white" : "bg-karta shadow-clay-sm"}`}>
            {kursMatn(c.title)}
          </button>
        ))}
      </div>

      {/* ---- variantlar ---- */}
      <h2 className="mt-5 mb-2 ml-1.5 text-[12px] tracking-widest text-ink-soft uppercase">
        {t("imtihonVariantlar")}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {Array.from({ length: SESSIYA_VARIANTLAR }, (_, i) => i + 1).map((n) => {
          const eng = sessiyaEng(slug, n);
          return (
            <button key={n} type="button" onClick={() => onVariant(slug, n)}
              data-tahlil="Sessiya: variant"
              className="clay-press flex items-center gap-3 rounded-clay bg-karta p-3 text-left shadow-clay-sm">
              <span className={`grid size-10 shrink-0 place-items-center rounded-2xl font-display text-[15px]
                                ${eng ? "bg-track text-brand-green" : "bg-sahna text-ink-soft"}`}>
                {n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[13.5px] leading-tight">
                  {t("imtihonVariant", { n })}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-ink-dim">
                  {eng ? `${foizi(eng)}% · ${t("sessiyaBaho")} ${baho(foizi(eng))}` : t("imtihonIshlanmagan")}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {oxirgilar.length > 0 && (
        <>
          <h2 className="mt-6 mb-2 ml-1.5 text-[12px] tracking-widest text-ink-soft uppercase">
            {t("imtihonOxirgilar")}
          </h2>
          <ol className="grid gap-1.5">
            {oxirgilar.map((x) => (
              <li key={x.vaqt}
                className="flex items-center gap-2 rounded-clay bg-karta px-3 py-2 text-[13px] shadow-clay-sm">
                <span className="min-w-0 flex-1 truncate">{t("imtihonVariant", { n: x.variant })}</span>
                <span className="shrink-0 font-display text-ink-soft">
                  {x.togri}/{x.jami} · {t("sessiyaBaho")} {baho(foizi(x))}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}

      <p className="mt-5 text-center text-[12px] leading-snug text-ink-dim">{t("sessiyaBahoIzoh")}</p>
    </div>
  );
}
