/**
 * AI USTOZ — `/ai`, `/ai/yangi/:tur`, `/ai/:id`.
 *
 * Bitta savol: "AI menga nimada yordam beradi?". Shu tartibda: bugun
 * qancha savol qoldi → uchta amal (reja, savol, masala) → xato tahlili
 * qayerda ekani (u ko'rib chiqish kartasidan ochiladi, bu yerdan emas:
 * savolning o'zi o'sha yerda) → oxirgi suhbatlar.
 *
 * Premiumsiz odam — taklif kartasi (nima olishi va bitta tugma). Huquq
 * serverda (`backend/core/ai.py`): bu ekran faqat ko'rsatadi.
 *
 * Amallar — neytral qatorlar, rangli emas (dizayn qoidasi: bo'limlarni
 * rang bilan ajratma). Bitta asosiy tugma faqat yozish ekranida.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiChat, AiPremiumTaklif } from "../components/AiSuhbat";
import { aiBoshla, aiHolat, aiXatoMatni } from "../lib/ai";
import type { AiHolat, AiTur, AiXatoKod } from "../lib/ai";
import { botNomi } from "../lib/api";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { havolaniOch, tebrat, useOrqaga } from "../lib/qobiq";
import { yolAiSuhbat, yolAiYangi } from "../lib/yollar";

/**
 * `ildiz` — `/ai` pastki paneldagi BO'LIM (2026-10-10 dan): unda orqaga
 * strelka va Telegram'ning orqaga tugmasi yo'q, boshqa tab ildizlaridagi kabi.
 */
function Sarlavha({ matn, onBack, ildiz = false }: { matn: string; onBack: () => void; ildiz?: boolean }) {
  // `useOrqaga` qaytargani "nativ tugma yo'q" degani — ildizda strelka baribir kerak emas.
  const strelka = useOrqaga(onBack, !ildiz) && !ildiz;
  return (
    <div className="flex items-center gap-2.5">
      {strelka && (
        <button type="button" onClick={onBack} title={t("ortga")} aria-label={t("ortga")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate font-display text-[21px] leading-tight">{matn}</h1>
    </div>
  );
}

const QOBIQ = "mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-10 min-[360px]:px-[18px] sm:max-w-[560px]";

const AMALLAR: { tur: AiTur; belgi: IconName }[] = [
  { tur: "reja", belgi: "chart" },
  { tur: "repetitor", belgi: "izoh" },
  { tur: "masala", belgi: "puzzle" },
];

/** `/ai` — amallar va oxirgi suhbatlar. */
export function AiBosh({ onBack }: { onBack: () => void }) {
  const nav = useNavigate();
  const [h, setH] = useState<AiHolat | null>(null);
  const [aloqaYoq, setAloqaYoq] = useState(false);
  const [xato, setXato] = useState<AiXatoKod | null>(null);
  const [band, setBand] = useState(false);

  useEffect(() => {
    aiHolat().then(setH).catch(() => setAloqaYoq(true));
  }, []);

  const bosildi = async (tur: AiTur) => {
    tebrat("tanlov");
    if (tur !== "reja") { nav(yolAiYangi(tur as "repetitor" | "masala")); return; }
    // Reja uchun yozish kerak emas — natijalar serverda.
    setBand(true);
    setXato(null);
    const r = await aiBoshla("reja");
    setBand(false);
    if (r.ok) nav(yolAiSuhbat(r.qiymat.id)); else setXato(r.kod);
  };
  const botda = async () => {
    const bot = await botNomi();
    if (bot) havolaniOch(`https://t.me/${encodeURIComponent(bot)}?start=ai`);
  };

  return (
    <div className={QOBIQ}>
      <Sarlavha matn={t("aiSarlavha")} onBack={onBack} ildiz />
      {aloqaYoq && <p className="text-[14.5px] text-ink-dim">{t("aloqaYoq")}</p>}
      {!h && !aloqaYoq && <p className="text-[14.5px] text-ink-dim">{t("yuklanyapti")}</p>}

      {/* Premiumsiz odam ham 3 ta bepul sinov oladi (`AI_BEPUL`) — taklif
          faqat sinov tugagach chiqadi. */}
      {h && !h.ochiq && <AiPremiumTaklif />}
      {h?.ochiq && !h.yoqilgan && <p className="text-[14.5px] text-ink-soft">{aiXatoMatni("yopiq")}</p>}

      {h?.ochiq && h.yoqilgan && (
        <>
          <p className="text-[14.5px] leading-snug text-ink-soft">{t("aiIzoh")}</p>
          <p className="text-[13px] font-semibold text-ink-dim">
            {t(h.premium ? "aiQolgan" : "aiBepulQolgan", { n: h.premium ? h.qolgan : h.bepul_qolgan })}
          </p>

          <div className="flex flex-col gap-2.5">
            {AMALLAR.map((a) => (
              <button key={a.tur} type="button" onClick={() => bosildi(a.tur)} disabled={band}
                data-tahlil={`AI: ${a.tur}`}
                className="clay-press flex min-h-[64px] items-center gap-3 rounded-clay bg-karta px-4 py-3 text-left
                           shadow-clay-sm disabled:opacity-60">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sahna text-brand-blue shadow-ichki">
                  <Icon name={a.belgi} size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[16px] leading-tight">{t(`aiTur_${a.tur}` as Kalit)}</span>
                  <span className="block text-[13px] leading-snug text-ink-dim">{t(`aiTurIzoh_${a.tur}` as Kalit)}</span>
                </span>
                <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
              </button>
            ))}
          </div>
          {xato && <p className="text-[13.5px] text-brand-red" role="alert">{aiXatoMatni(xato)}</p>}

          <div className="rounded-clay bg-sahna px-4 py-3 shadow-ichki">
            <span className="block font-display text-[15px]">{t("aiTur_xato")}</span>
            <span className="block text-[13px] leading-snug text-ink-dim">{t("aiXatoQayerda")}</span>
          </div>

          {h.suhbatlar.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="mt-1 font-display text-[17px]">{t("aiOxirgi")}</h2>
              {h.suhbatlar.map((s) => (
                <button key={s.id} type="button" onClick={() => nav(yolAiSuhbat(s.id))}
                  data-tahlil="AI: oxirgi suhbat"
                  className="clay-press flex min-h-12 flex-col justify-center rounded-2xl bg-karta px-4 py-2 text-left
                             shadow-clay-sm">
                  <span className="text-[12px] font-semibold text-ink-dim">{t(`aiTur_${s.tur}` as Kalit)}</span>
                  <span className="truncate text-[14.5px]">{s.sarlavha || t(`aiTur_${s.tur}` as Kalit)}</span>
                </button>
              ))}
            </section>
          )}

          <button type="button" onClick={botda} data-tahlil="AI: botda so'rash"
            className="min-h-11 self-center text-[14px] font-bold text-brand-blue-t">
            {t("aiBotda")}
          </button>
        </>
      )}
    </div>
  );
}

/** `/ai/yangi/:tur` — birinchi savol (masalada rasm ham). Bitta asosiy tugma. */
export function AiYangi({ tur, onBack }: { tur: "repetitor" | "masala"; onBack: () => void }) {
  const nav = useNavigate();
  const [matn, setMatn] = useState("");
  const [rasm, setRasm] = useState<File | null>(null);
  const [xato, setXato] = useState<AiXatoKod | null>(null);
  const [band, setBand] = useState(false);
  const fayl = useRef<HTMLInputElement>(null);
  const tayyor = Boolean(matn.trim() || (tur === "masala" && rasm));

  const yubor = async () => {
    if (!tayyor || band) return;
    setBand(true);
    setXato(null);
    const r = await aiBoshla(tur, { matn: matn.trim(), rasm });
    setBand(false);
    if (r.ok) { tebrat("tanlov"); nav(yolAiSuhbat(r.qiymat.id), { replace: true }); } else setXato(r.kod);
  };

  return (
    <div className={QOBIQ}>
      <Sarlavha matn={t(`aiTur_${tur}` as Kalit)} onBack={onBack} />
      <p className="text-[14.5px] leading-snug text-ink-soft">{t(`aiTurIzoh_${tur}` as Kalit)}</p>
      <textarea value={matn} onChange={(e) => setMatn(e.target.value)} rows={5} maxLength={2000} autoFocus
        placeholder={t(tur === "masala" ? "aiMasalaYozing" : "aiYozing")}
        aria-label={t(tur === "masala" ? "aiMasalaYozing" : "aiYozing")}
        className="min-h-32 resize-y rounded-clay bg-karta px-4 py-3 text-[15px] leading-snug shadow-clay-sm
                   outline-none focus:outline-2 focus:outline-brand-blue" />

      {tur === "masala" && (
        <>
          <input ref={fayl} type="file" accept="image/*" className="hidden"
            onChange={(e) => setRasm(e.target.files?.[0] ?? null)} />
          {rasm ? (
            <div className="flex min-h-12 items-center gap-2 rounded-2xl bg-sahna px-4 shadow-ichki">
              <span className="min-w-0 flex-1 truncate text-[14px]">{rasm.name}</span>
              <button type="button" onClick={() => { setRasm(null); if (fayl.current) fayl.current.value = ""; }}
                aria-label={t("aiRasmOlib")} title={t("aiRasmOlib")} data-tahlil="AI: rasmni olib tashlash"
                className="clay-press grid size-11 shrink-0 place-items-center rounded-full text-ink-dim">
                <Icon name="close" size={18} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fayl.current?.click()} data-tahlil="AI: rasm qo'shish"
              className="clay-press min-h-12 rounded-2xl bg-karta text-[14.5px] font-bold text-brand-blue-t shadow-clay-sm">
              {t("aiRasm")}
            </button>
          )}
        </>
      )}

      {xato === "premium" ? <AiPremiumTaklif />
        : xato && <p className="text-[13.5px] text-brand-red" role="alert">{aiXatoMatni(xato)}</p>}

      <button type="button" onClick={yubor} disabled={!tayyor || band} data-tahlil={`AI: ${tur} yuborish`}
        className="tugma-3d min-h-12 rounded-2xl bg-brand-blue text-[15px] font-bold text-white disabled:opacity-45">
        {band ? t("aiYozyapti") : t("aiYuborish")}
      </button>
    </div>
  );
}

/** `/ai/:id` — suhbat. */
export function AiSahifa({ id, onBack }: { id: number; onBack: () => void }) {
  return (
    <div className={`${QOBIQ} min-h-[100dvh] pb-0`}>
      <Sarlavha matn={t("aiSarlavha")} onBack={onBack} />
      <AiChat id={id} />
    </div>
  );
}
