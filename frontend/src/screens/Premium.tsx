/**
 * IMTIHON PREMIUM — `/premium`.
 *
 * Bitta savol: "nimaga to'layman va qanday to'layman?". Shu tartibda:
 * imkoniyatlar (uchta qator) → tarif → karta raqami → bitta asosiy
 * tugma "To'ladim — chekni yuborish".
 *
 * Chek SAYTGA emas, BOTGA yuboriladi (`?start=premium_<tarif>`): rasm
 * admin oldiga "Tasdiqlash" tugmasi bilan birga tushadi va tasdiqlangach
 * odam bot orqali xabar oladi (`backend/core/premium.py`). Click/Payme
 * ATAYLAB yo'q — egasining qarori.
 *
 * Sinov — ikkinchi darajali (faqat yozuv): bir ekranda bitta asosiy tugma.
 */
import { useState } from "react";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { BEPUL, chekniYubor, sanaMatn, sinovOl, som, usePremium } from "../lib/premium";
import type { Tarif } from "../lib/premium";

const IMKONIYATLAR: { belgi: IconName; nom: Kalit; izoh: Kalit }[] = [
  { belgi: "lock", nom: "premImkVariant", izoh: "premImkVariantIzoh" },
  { belgi: "search", nom: "premImkTahlil", izoh: "premImkTahlilIzoh" },
  { belgi: "trophy", nom: "premImkReyting", izoh: "premImkReytingIzoh" },
];

export function Premium({ onBack, onOchildi }: { onBack: () => void; onOchildi: () => void }) {
  const ozStrelka = useOrqaga(onBack);
  const h = usePremium();
  // 3 oylik — tanlov oldindan shunda: oyiga arzonroq va imtihongacha
  // odatda bir oydan ko'p qoladi.
  const [tarif, setTarif] = useState<Tarif>("3oy");
  const [nusxa, setNusxa] = useState(false);
  const [xato, setXato] = useState("");
  const [band, setBand] = useState(false);

  const nusxala = async () => {
    if (!h?.karta) return;
    try {
      await navigator.clipboard.writeText(h.karta.replace(/\s+/g, ""));
      setNusxa(true);
      tebrat("tanlov");
    } catch { /* raqam ekranda ko'rinib turibdi */ }
  };
  const chek = async () => {
    setXato("");
    if (!(await chekniYubor(tarif))) setXato(t("premBotYoq"));
  };
  const sinov = async () => {
    setBand(true);
    const yangi = await sinovOl();
    setBand(false);
    if (yangi?.faol) { tebrat("yutuq"); onOchildi(); } else setXato(t("premSinovXato"));
  };

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-10 min-[360px]:px-[18px]">
      <div className="flex items-center gap-2.5">
        {ozStrelka && (
          <button type="button" onClick={onBack} title={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta text-ink-soft
                       shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="font-display text-[21px] leading-tight">{t("premSarlavha")}</h1>
      </div>
      <p className="text-[14.5px] leading-snug text-ink-soft">{t("premIzoh")}</p>

      {h?.faol && (
        <div className="flex items-center gap-2.5 rounded-clay bg-karta p-4 shadow-clay-sm">
          <Icon name="check" size={20} className="shrink-0 text-brand-green" />
          <span className="font-display text-[15.5px]">{t("premFaol", { sana: sanaMatn(h.gacha) })}</span>
        </div>
      )}

      <ul className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
        {IMKONIYATLAR.map((x) => (
          <li key={x.nom} className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sahna text-brand-blue-t">
              <Icon name={x.belgi} size={18} />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-[15.5px] leading-tight">{t(x.nom)}</span>
              <span className="block text-[13px] text-ink-dim">{t(x.izoh, { n: h?.bepul ?? BEPUL })}</span>
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-1 font-display text-[19px]">{h?.faol ? t("premUzaytirish") : t("premTarif")}</h2>
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={t("premTarif")}>
        {(["1oy", "3oy"] as const).map((k) => {
          const narx = h?.narxlar[k];
          const faol = tarif === k;
          return (
            <button key={k} type="button" role="radio" aria-checked={faol} onClick={() => setTarif(k)}
              data-tahlil={`Premium: tarif ${k}`}
              className={`clay-press flex min-h-[92px] flex-col items-start justify-center gap-0.5 rounded-clay
                          bg-karta px-4 text-left shadow-clay-sm ${faol ? "outline-2 outline-brand-blue outline-solid" : ""}`}>
              <span className="font-display text-[15px] text-ink-soft">{t(k === "1oy" ? "premTarif1oy" : "premTarif3oy")}</span>
              <span className="font-display text-[19px] leading-tight font-bold">
                {narx ? t("premSom", { n: som(narx) }) : "—"}
              </span>
              {k === "3oy" && narx && (
                <span className="text-[12.5px] text-ink-dim">{t("premOyiga", { n: som(narx / 3) })}</span>
              )}
            </button>
          );
        })}
      </div>

      {h && !h.karta ? (
        <p className="rounded-clay bg-karta p-4 text-[14.5px] leading-snug text-ink-soft shadow-clay-sm">
          {t("premYopiq")}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-clay bg-karta p-4 shadow-clay-sm">
            <div className="text-[13px] font-bold text-ink-dim">{t("premKarta")}</div>
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 font-display text-[20px] leading-tight tracking-wide tabular-nums
                               break-all">
                {h?.karta || "•••• •••• •••• ••••"}
              </span>
              <button type="button" onClick={nusxala} disabled={!h?.karta} data-tahlil="Premium: karta nusxasi"
                className="clay-press flex min-h-11 shrink-0 items-center rounded-xl bg-sahna px-3.5 text-[13.5px]
                           font-bold text-ink-soft shadow-ichki disabled:opacity-50">
                {nusxa ? t("premNusxalandi") : t("premNusxa")}
              </button>
            </div>
            {h?.karta_egasi && <div className="text-[14px] text-ink-soft">{h.karta_egasi}</div>}
            <p className="text-[13px] leading-snug text-ink-dim">{t("premKartaIzoh")}</p>
          </div>

          <button type="button" onClick={chek} disabled={!h?.karta} data-tahlil="Premium: chekni yuborish"
            className="tugma-3d min-h-12 rounded-2xl bg-brand-blue px-5 font-display text-[16px] font-bold text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)] disabled:opacity-60">
            {t("premChek")}
          </button>
          <p className="-mt-1 text-center text-[12.5px] leading-snug text-ink-dim">{t("premChekIzoh")}</p>
        </>
      )}

      {h?.sinov_mumkin && (
        <button type="button" onClick={sinov} disabled={band} data-tahlil="Premium: sinov"
          className="clay-press min-h-11 rounded-2xl text-[14.5px] font-bold text-brand-blue-t disabled:opacity-60">
          {t("premSinov", { n: h.sinov_kun })}
        </button>
      )}
      {xato && <p role="alert" className="text-center text-[13.5px] text-ink-soft">{xato}</p>}
    </div>
  );
}
