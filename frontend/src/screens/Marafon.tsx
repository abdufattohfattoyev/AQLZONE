/**
 * DTM MARAFONI — holat, bugungi variant va marafon reytingi (`core/marafon.py`).
 *
 * Ekranning vazifasi bitta: "bugun ishladimmi?". Shuning uchun tepada
 * kun (3/30) va yagona ko'k tugma — bugungi variant. Bajarilgan bo'lsa
 * tugma o'rnida natija va "ertaga yangi variant". Ostida uch son (ball,
 * o'rin, zanjir) va reyting.
 *
 * Kun varianti `/marafon/bugun` da oddiy blok test bo'lib ishlanadi
 * (`MarafonKun`), natijadan keyin shu ekranga qaytadi.
 */
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import type { MarafonHolat } from "../lib/marafon";
import { marafonHolat } from "../lib/marafon";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { Blok } from "./Blok";

function useMarafon(): MarafonHolat | null | "yoq" | "xato" {
  const [h, setH] = useState<MarafonHolat | null | "yoq" | "xato">(null);
  useEffect(() => {
    let tirik = true;
    marafonHolat().then((x) => { if (tirik) setH(x ?? "yoq"); }, () => { if (tirik) setH("xato"); });
    return () => { tirik = false; };
  }, []);
  return h;
}

export function Marafon({ onBoshla, onChiq }: { onBoshla: () => void; onChiq: () => void }) {
  const strelka = useOrqaga(onChiq);
  const h = useMarafon();

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-4 pb-10 min-[360px]:px-[18px]
                    sm:max-w-[560px] kom:max-w-[720px] kom:px-8 kom:pt-8">
      <div className="flex items-center gap-2">
        {strelka && (
          <button type="button" onClick={onChiq} aria-label={t("ortga")} title={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate font-display text-[22px] leading-tight">
          {h && typeof h === "object" ? h.nom : t("marafonSarlavha")}
        </h1>
      </div>

      {h === null && <p className="py-8 text-center text-[14.5px] text-ink-dim">{t("hrYuklanmoqda")}</p>}
      {h === "xato" && <p className="py-8 text-center text-[14.5px] text-ink-dim">{t("hrXato")}</p>}
      {h === "yoq" && (
        <p className="rounded-clay bg-karta p-6 text-center text-[14.5px] text-ink-dim shadow-clay-sm">
          {t("marafonYoq")}
        </p>
      )}
      {h && typeof h === "object" && <Tana h={h} onBoshla={onBoshla} />}
    </div>
  );
}

function Tana({ h, onBoshla }: { h: MarafonHolat; onBoshla: () => void }) {
  const bugun = h.men.bugun;
  const kun = h.kun ?? (h.tugagan ? h.kunlar : 0);
  return (
    <>
      {/* ---- kun va bugungi ish ---- */}
      <div className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:p-[18px]">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-[18px]">
            {h.boshlanmagan ? t("marafonBoshlanmagan", { sana: h.boshlanish })
              : h.tugagan ? t("marafonTugadi") : t("marafonKunNom", { n: kun })}
          </span>
          <span className="shrink-0 text-[14px] font-bold text-ink-dim">{kun}/{h.kunlar}</span>
        </div>
        <span className="block h-2 overflow-hidden rounded-full bg-track">
          <span className="block h-full rounded-full bg-brand-blue" style={{ width: `${(kun / h.kunlar) * 100}%` }} />
        </span>

        {h.kun && !bugun && (
          <button type="button" onClick={() => { tebrat("tanlov"); onBoshla(); }} data-tahlil="Marafon: bugungi variant"
            className="tugma-3d mt-1 flex min-h-[56px] flex-col items-center justify-center rounded-2xl bg-brand-blue
                       font-display text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
            <span className="text-[18px] font-bold">{t("marafonBoshla")}</span>
            <span className="text-[13px] opacity-85">{t("marafonOlcham", { s: h.savol, d: h.daqiqa })}</span>
          </button>
        )}
        {bugun && (
          <div className="flex items-center gap-3 rounded-2xl bg-brand-green/10 px-3.5 py-3">
            <Icon name="check" size={20} className="shrink-0 text-brand-green-d" />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[16px]">{t("marafonBajarildi", { a: bugun.togri, b: bugun.jami })}</span>
              <span className="block text-[13px] text-ink-dim">{t("marafonErtaga")}</span>
            </span>
          </div>
        )}
      </div>

      {/* ---- uch son — ball va zanjir oltin (mukofot), o'rin neytral ---- */}
      <div className="grid grid-cols-3 gap-2">
        <Son n={String(h.men.ball)} nom={t("marafonBall")} oltin />
        <Son n={h.men.orin ? `${h.men.orin}` : "—"} nom={t("marafonOrin")} />
        <Son n={t("menKun", { n: h.men.zanjir })} nom={t("menZanjir")} oltin />
      </div>

      {/* ---- reyting ---- */}
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-[19px]">{t("marafonReyting")}</h2>
        <span className="text-[13px] text-ink-dim">{t("hrIshladi", { n: h.ishtirokchi })}</span>
      </div>
      {h.reyting.length === 0 ? (
        <p className="rounded-clay bg-karta p-5 text-center text-[14.5px] text-ink-dim shadow-clay-sm">
          {t("marafonReytingBosh")}
        </p>
      ) : (
        <ol className="flex flex-col divide-y divide-track overflow-hidden rounded-[22px] bg-karta shadow-clay-sm">
          {h.reyting.map((q) => (
            <li key={q.orin} className={`flex min-h-14 items-center gap-3 px-3.5 py-2 ${q.men ? "bg-brand-blue/10" : ""}`}>
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold ${
                q.orin <= 3 ? "bg-brand-gold/20 text-brand-gold-d" : "text-ink-soft"}`}>{q.orin}</span>
              <span className={`min-w-0 flex-1 truncate text-[15px] ${q.men ? "font-bold text-brand-blue-t" : "font-semibold"}`}>
                {q.men ? (q.ism ? `${q.ism} · ${t("siz")}` : t("hrSiz")) : q.ism || t("hrAnonim")}
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <span className="font-display text-[17px] leading-tight font-bold tabular-nums">{q.ball}</span>
                <span className="text-[12px] text-ink-dim">{t("marafonKunSoni", { n: q.kun })}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="px-1 text-[13px] leading-snug text-ink-dim">{t("marafonQoida")}</p>
    </>
  );
}

function Son({ n, nom, oltin = false }: { n: string; nom: string; oltin?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 rounded-[18px] bg-karta px-1.5 py-3 shadow-clay-sm">
      <span className={`max-w-full truncate font-display text-[22px] leading-tight font-bold ${oltin ? "text-brand-gold-d" : ""}`}>
        {n}
      </span>
      <span className="text-[13px] text-ink-dim">{nom}</span>
    </div>
  );
}

/**
 * Bugungi variant — oddiy blok test (`Blok.tsx`, `marafon` rejimi). Marafon
 * ketmayotgan yoki bugun allaqachon ishlangan bo'lsa — marafon sahifasiga.
 */
export function MarafonKun({ onChiq }: { onChiq: () => void }) {
  const h = useMarafon();
  if (h === null) return <p className="py-16 text-center text-[14.5px] text-ink-dim">{t("hrYuklanmoqda")}</p>;
  if (typeof h !== "object" || !h.kun || h.men.bugun) return <Navigate to="/marafon" replace />;
  return (
    <Blok sinf={11} uzunlik="dtm" qamrov={{ tur: "imtihon" }} bobNomi={t("marafonKunNom", { n: h.kun })}
      marafon={{ id: h.id, kun: h.kun, savol: h.savol, daqiqa: h.daqiqa }} onExit={onChiq} />
  );
}
