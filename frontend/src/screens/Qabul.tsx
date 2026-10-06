/**
 * PREZIDENT VA IXTISOSLASHTIRILGAN MAKTABLARGA TAYYORLOV — variantlar
 * (`lib/qabul.ts`). DTM sahifasi (`screens/Imtihon.tsx`) qolipida:
 * tepada "tayyormanmi?" degan savolga javob, ostida variantlar.
 *
 * ─────────────── NIMA BOSHQACHA ───────────────
 *
 *   uch tur        1-bosqich, 2-bosqich va ixtisoslashtirilgan maktab —
 *                  bitta tanlagichda. Oxirgi tanlangani eslab qolinadi:
 *                  tayyorlanayotgan bola har safar qayta bosmasin.
 *   formati ochiq  har tur tagida nechta topshiriq, qancha vaqt va qaysi
 *                  mavzulardan — ota-ona bu bo'lim "haqiqiy imtihonga
 *                  o'xshaydimi?" degan savolga shu yerda javob oladi.
 *   ball halol     51 ballik shkala faqat ixtisoslashtirilgan maktabda
 *                  (rasmiy). Prezident maktabida o'tish bali YO'Q —
 *                  reyting bo'yicha, shuning uchun foiz ko'rsatiladi va
 *                  bu ochiq yozilgan. O'ylab topilgan "o'tish chegarasi"
 *                  bolaga yolg'on xotirjamlik berardi.
 *
 * Ekrandagi yagona ko'k tugma — keyingi ishlanmagan variant.
 */
import { useState } from "react";
import { Icon } from "../lib/icons";
import { Hajmli } from "../lib/hajmli";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { QABUL, QABUL_TURLAR, QABUL_VARIANT, qabulEng, qabulOrtacha, qabulTurmi } from "../lib/qabul";
import type { QabulTur } from "../lib/qabul";

const TUR_KALIT = "az_qabul_tur";

function oxirgiTur(): QabulTur {
  try { const x = localStorage.getItem(TUR_KALIT) ?? ""; return qabulTurmi(x) ? x : "prezident"; }
  catch { return "prezident"; }
}

/** Ball vergul bilan: 38,4. */
const ballMatn = (b: number) => String(b).replace(".", ",");

export function Qabul({ onVariant, onChiq }: {
  onVariant: (tur: QabulTur, n: number) => void;
  onChiq: () => void;
}) {
  const [tur, setTur] = useState<QabulTur>(oxirgiTur);
  const tanla = (x: QabulTur) => {
    tebrat("tanlov");
    setTur(x);
    try { localStorage.setItem(TUR_KALIT, x); } catch { /* eslanmaydi, xolos */ }
  };
  const strelka = useOrqaga(onChiq);
  const o = QABUL[tur];
  const ortacha = qabulOrtacha(tur);
  const variantlar = Array.from({ length: QABUL_VARIANT }, (_, i) => i + 1);
  const keyingi = variantlar.find((n) => !qabulEng(tur, n)) ?? 1;

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
          <h1 className="font-display text-[20px] leading-tight">{t("qabulSarlavha")}</h1>
          <p className="text-[13px] leading-snug text-ink-dim">{t("qabulIzoh")}</p>
        </div>
        <Hajmli nom="toj" olcham={40} />
      </header>

      {/* Tur tanlagichi — uchta teng tugma. Tor ekranda ikki qatorga
          o'tadi, yozuv qisqarmaydi. */}
      <div role="tablist" className="flex flex-wrap gap-1.5 rounded-[18px] bg-sahna p-1.5 shadow-ichki">
        {QABUL_TURLAR.map((x) => (
          <button key={x} type="button" role="tab" aria-selected={tur === x} onClick={() => tanla(x)}
            data-tahlil={`Qabul: tur ${x}`}
            className={`clay-press min-h-11 flex-1 basis-[30%] rounded-[13px] px-2 text-[13.5px] font-bold whitespace-nowrap ${
              tur === x ? "bg-karta text-brand-blue-t shadow-clay-sm" : "text-ink-soft"}`}>
            {t(`qabulTur_${x}`)}
          </button>
        ))}
      </div>

      {/* Natija yoki boshlash taklifi. */}
      <section className="flex flex-col gap-2.5 rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:p-[18px]">
        {ortacha ? (
          <>
            <div className="text-[13px] font-bold text-ink-dim">{t("qabulOrtacha")}</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[34px] leading-none font-bold">
                {ortacha.ball !== null ? ballMatn(ortacha.ball) : Math.round((ortacha.foiz * o.savol) / 100)}
              </span>
              <span className="flex-1 text-[15px] font-semibold text-ink-soft">
                {ortacha.ball !== null ? "/ 51" : t("imtDtmTogri", { n: o.savol })}
              </span>
              <span className="font-display text-[22px] font-bold text-brand-blue-t">{ortacha.foiz}%</span>
            </div>
            {/* Shkala: 51 ball yoki 100%. Belgilangan chegara yo'q (yuqoridagi izoh). */}
            <span className="block h-2 overflow-hidden rounded-full bg-track" aria-hidden>
              <span className="block h-full rounded-full bg-brand-blue"
                style={{ width: `${Math.max(3, ortacha.ball !== null ? (ortacha.ball / 51) * 100 : ortacha.foiz)}%` }} />
            </span>
          </>
        ) : (
          <>
            <div className="font-display text-[18px] leading-tight">{t("qabulBoshlang")}</div>
            <p className="text-[14px] leading-snug text-ink-soft">{t("qabulBoshlangIzoh")}</p>
          </>
        )}
        <button type="button" onClick={() => onVariant(tur, keyingi)} data-tahlil="Qabul: keyingi variant"
          className="tugma-3d mt-1 flex min-h-[52px] items-center justify-center gap-2 rounded-[16px] bg-brand-blue
                     font-display text-[17px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
          {t("qabulKeyingi", { n: keyingi })}
          <Icon name="chevron" size={18} />
        </button>
      </section>

      {/* Imtihon formati — ota-ona shu yerda "haqiqiysiga o'xshaydimi?" ni ko'radi. */}
      <section className="flex flex-col gap-1.5 rounded-clay px-4 py-3.5 ring-[1.5px] ring-track ring-inset">
        <div className="font-display text-[15.5px]">
          {t(o.ball ? "qabulTuzilishBall" : "qabulTuzilish", { savol: o.savol, daqiqa: o.daqiqa })}
        </div>
        <p className="text-[13.5px] leading-snug text-ink-soft">{t(`qabulMazmun_${tur}`)}</p>
        <p className="text-[12.5px] leading-snug text-ink-dim">{t(`qabulManba_${tur}`)}</p>
      </section>

      <h2 className="mt-1 font-display text-[19px]">{t("imtihonVariantlar")}</h2>
      <div className="grid grid-cols-4 gap-2">
        {variantlar.map((n) => {
          const eng = qabulEng(tur, n);
          return (
            <button key={n} type="button" onClick={() => onVariant(tur, n)} data-tahlil={`Qabul: ${n}-variant`}
              aria-label={t("imtihonVariant", { n })}
              className="clay-press flex min-h-[60px] flex-col items-center justify-center rounded-[16px] bg-karta
                         shadow-clay-sm">
              <span className="font-display text-[18px] leading-tight font-bold">{n}</span>
              <span className={`text-[12.5px] ${eng ? "text-brand-green-d" : "text-ink-dim"}`}>
                {eng ? (eng.ball !== null ? ballMatn(eng.ball) : `${eng.togri}/${eng.jami}`) : "—"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
