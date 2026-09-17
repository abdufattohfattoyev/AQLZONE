/**
 * Tulki shaharchasi — tangaga bino, kunlik hosil va mehmonga borish.
 *
 * Qoida serverda (`core/shaharcha.py`). Tanga hisobi mijozda: bino
 * qurishda avval tanga yechiladi, server rad etsa qaytariladi. Hosilni
 * bola o'zi qo'shadi — to'g'ri topsa ikki barobar.
 *
 * `pid` berilsa — mehmonda: faqat ko'rish va ❤️.
 */
import { useCallback, useEffect, useState } from "react";
import {
  shaharchaHosil, shaharchaMehmon, shaharchaOl, shaharchaOshir, shaharchaQur, shaharchaYoqdi,
} from "../lib/api";
import type { BinoTur, ShaharchaHolat } from "../lib/api";
import { avatarBelgi } from "../lib/dokon";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { useProgress } from "../lib/progress";
import { Konfetti } from "../components/Konfetti";

export const BINO_BELGI: Record<BinoTur, string> = {
  uy: "🏠", bog: "🌳", dokon: "🏪", maktab: "🏫", kutubxona: "📚",
  park: "🎡", fabrika: "🏭", minora: "🗼", rasadxona: "🔭",
};
const TARTIB: BinoTur[] = ["bog", "dokon", "maktab", "kutubxona", "park", "fabrika", "minora", "rasadxona"];
const binoNomi = (tur: BinoTur) => t(`bn_${tur}` as Kalit);

/** Server bilan bir xil: 2-darajaga ×1,5, 3-ga ×3 (uy 30 dan). */
function oshirishNarxi(narxlar: Record<BinoTur, number>, tur: BinoTur, daraja: number): number {
  const asos = narxlar[tur] || 30;
  return Math.floor(asos * (daraja === 1 ? 1.5 : 3));
}

type Varaq = { tur: "qur"; joy: number } | { tur: "bino"; joy: number } | { tur: "hosil" } | null;

export function Shaharcha({ pid, onChiq, onMehmon }: {
  pid?: number;
  onChiq: () => void;
  onMehmon: (pid: number) => void;
}) {
  const ozStrelka = useOrqaga(onChiq);
  const { jamiTanga, tangaYech, oyinTugadi } = useProgress();
  const [h, setH] = useState<ShaharchaHolat | null>(null);
  const [xato, setXato] = useState(false);
  const [varaq, setVaraq] = useState<Varaq>(null);
  const [band, setBand] = useState(false);
  const [xabar, setXabar] = useState("");
  const mehmon = pid !== undefined;

  const yukla = useCallback(() => {
    setXato(false);
    (mehmon ? shaharchaMehmon(pid) : shaharchaOl()).then(setH).catch(() => setXato(true));
  }, [mehmon, pid]);
  useEffect(yukla, [yukla]);

  useEffect(() => {
    if (!xabar) return;
    const id = window.setTimeout(() => setXabar(""), 2600);
    return () => window.clearTimeout(id);
  }, [xabar]);

  // Amal: tanga avval yechiladi, server rad etsa qaytariladi.
  const sotib = async (narx: number, sorov: () => Promise<ShaharchaHolat>) => {
    if (band) return;
    if (!tangaYech(narx)) { setXabar(t("shTangaYetmaydi")); return; }
    setBand(true);
    try {
      const yangi = await sorov();
      setH((eski) => ({ ...yangi, qoshnilar: eski?.qoshnilar }));
      setVaraq(null);
      tebrat("yutuq");
    } catch {
      oyinTugadi(narx, 0);
      yukla();
    } finally {
      setBand(false);
    }
  };

  if (xato) {
    return (
      <div className="mx-auto max-w-[430px] px-4 pt-16 text-center">
        <p className="text-[14px] text-ink-soft">{t("tjXato")}</p>
        <button type="button" onClick={onChiq} className="mt-4 font-display text-brand-blue">{t("ortga")}</button>
      </div>
    );
  }
  if (!h) {
    return <div className="mx-auto mt-24 size-9 animate-spin rounded-full border-4 border-track border-t-brand-blue" />;
  }

  const kunlik = Object.values(h.binolar).reduce(
    (n, b) => n + (h.daromadlar?.[b.tur]?.[b.daraja - 1] ?? 0), 0);

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-12 sm:max-w-[520px]">
      <div className="flex items-center gap-2">
        {ozStrelka && (
          <button type="button" onClick={onChiq} title={t("ortga")}
            className="clay-press grid size-[38px] place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <span className="flex-1" />
        {!mehmon && (
          <span className="flex items-center gap-1 rounded-full bg-karta px-3 py-1.5 font-display text-[14px] shadow-clay-sm">
            🪙 {jamiTanga}
          </span>
        )}
        <span className="flex items-center gap-1 rounded-full bg-karta px-3 py-1.5 font-display text-[14px] shadow-clay-sm">
          ❤️ {h.yurak}
        </span>
      </div>

      <div className="az-kirish mt-3 flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-brand-orange/15 text-[28px]">
          {mehmon ? avatarBelgi(h.avatar ?? "") : <EmojiBelgi e="🦊" olcham={32} />}
        </span>
        <span className="min-w-0">
          <h1 className="truncate text-[19px] leading-tight">
            {mehmon ? t("shMehmon", { ism: h.ism ?? "" }) : t("shTitul")}
          </h1>
          <p className="mt-0.5 text-[12px] text-ink-soft">
            {mehmon ? t("shBinolarSoni", { n: Object.keys(h.binolar).length }) : `${t("shJami")}: ${kunlik} 🪙`}
          </p>
        </span>
      </div>

      {/* Hosil — kuniga bir marta. */}
      {!mehmon && (
        h.hosilMumkin ? (
          <button type="button" onClick={() => setVaraq({ tur: "hosil" })} data-tahlil="Shaharcha: hosil ochish"
            className="tugma-3d az-yaltir mt-4 flex w-full items-center gap-3 rounded-3xl bg-brand-gold px-4 py-3.5
                       text-left text-white shadow-[0_6px_0_var(--color-brand-gold-d)]">
            <EmojiBelgi e="🧺" olcham={30} jonli />
            <span className="flex-1 font-display text-[16px]">{t("shHosilBor")}</span>
            <span className="rounded-full bg-white/25 px-3 py-1 font-display text-[13px]">{t("shHosilYigish")}</span>
          </button>
        ) : (
          <p className="mt-4 rounded-clay bg-track px-4 py-2.5 text-center text-[12.5px] text-ink-soft">
            {t("shHosilOlindi")}
          </p>
        )
      )}

      {/* 3 × 3 maydon */}
      <div className="az-kirish mt-4 grid grid-cols-3 gap-2.5 rounded-[28px] bg-brand-green/20 p-3">
        {Array.from({ length: 9 }, (_, joy) => {
          const b = h.binolar[String(joy)];
          if (!b) {
            return (
              <button key={joy} type="button" disabled={mehmon} title={t("shBoshJoy")}
                onClick={() => setVaraq({ tur: "qur", joy })}
                className={`grid aspect-square place-items-center rounded-clay border-2 border-dashed
                            border-brand-green/40 text-brand-green-d ${mehmon ? "" : "clay-press"}`}>
                {!mehmon && <Icon name="plus" size={22} />}
              </button>
            );
          }
          return (
            <button key={joy} type="button" disabled={mehmon} title={binoNomi(b.tur)}
              onClick={() => setVaraq({ tur: "bino", joy })}
              className={`relative grid aspect-square place-items-center rounded-clay bg-karta shadow-clay-sm
                          ${mehmon ? "" : "clay-press"}`}>
              <EmojiBelgi e={BINO_BELGI[b.tur]} olcham={26 + b.daraja * 8} />
              <span className="absolute bottom-1.5 flex gap-0.5">
                {[1, 2, 3].map((d) => (
                  <span key={d} className={`size-1.5 rounded-full ${d <= b.daraja ? "bg-brand-gold" : "bg-track"}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {mehmon ? (
        <>
          <button type="button" disabled={h.yoqdim || band} data-tahlil="Shaharcha: yoqdi"
            onClick={() => {
              setBand(true);
              shaharchaYoqdi(pid).then((j) => { setH((e) => e && { ...e, ...j }); tebrat("tanlov"); })
                .catch(() => {}).finally(() => setBand(false));
            }}
            className={`mt-5 w-full rounded-3xl py-4 font-display text-[17px] ${h.yoqdim
              ? "bg-track text-ink-soft"
              : "tugma-3d bg-brand-green text-white shadow-[0_6px_0_var(--color-brand-green-d)]"}`}>
            ❤️ {h.yoqdim ? t("shYoqdiBosildi") : t("shYoqdi")}
          </button>
          <button type="button" onClick={onChiq} className="mt-3 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
            {t("shOrtga")}
          </button>
        </>
      ) : (
        <>
          <h2 className="mt-6 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">{t("shQoshnilar")}</h2>
          <p className="mb-2 ml-1.5 text-[12px] text-ink-soft/85">{t("shQoshnilarIzoh")}</p>
          {(h.qoshnilar ?? []).length === 0 ? (
            <p className="rounded-clay bg-karta px-4 py-3 text-center text-[12.5px] text-ink-soft shadow-clay-sm">
              {t("shQoshniBosh")}
            </p>
          ) : (
            <div className="space-y-1.5">
              {h.qoshnilar!.map((q) => (
                <button key={q.profil} type="button" onClick={() => onMehmon(q.profil)}
                  data-tahlil="Shaharcha: mehmonga"
                  className="clay-press flex w-full items-center gap-2.5 rounded-clay bg-karta px-3 py-2.5 text-left shadow-clay-sm">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-track text-[19px]">
                    {avatarBelgi(q.avatar)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px]">{q.ism}</span>
                    <span className="block text-[11.5px] text-ink-soft">{t("shBinolarSoni", { n: q.binolar || 1 })}</span>
                  </span>
                  <span className="shrink-0 text-[13px] text-ink-soft">{q.yoqdim ? "❤️" : "🤍"} {q.yurak}</span>
                  <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {xabar && (
        <div className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-[400px] rounded-clay bg-ink px-4 py-3 text-center
                        text-[13.5px] text-white shadow-clay">
          {xabar}
        </div>
      )}

      {varaq && !mehmon && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => !band && setVaraq(null)}>
          <div className="max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] bg-sahna p-4 pb-8 sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}>
            {varaq.tur === "qur" && h.narxlar && h.daromadlar && (
              <>
                <h2 className="mb-3 text-center text-[17px]">{t("shQur")}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {TARTIB.map((tur) => {
                    const narx = h.narxlar![tur];
                    const yetadi = jamiTanga >= narx;
                    return (
                      <button key={tur} type="button" disabled={band}
                        onClick={() => sotib(narx, () => shaharchaQur(varaq.joy, tur))}
                        data-tahlil={`Shaharcha: qurish (${tur})`}
                        className={`clay-press flex flex-col items-center gap-1 rounded-clay bg-karta p-3 shadow-clay-sm ${
                          yetadi ? "" : "opacity-50"}`}>
                        <EmojiBelgi e={BINO_BELGI[tur]} olcham={34} />
                        <span className="font-display text-[14px]">{binoNomi(tur)}</span>
                        <span className="text-[11px] text-ink-soft">{t("shKunigaTanga", { n: h.daromadlar![tur][0] })}</span>
                        <span className="rounded-full bg-brand-gold/20 px-2.5 py-0.5 font-display text-[13px] text-brand-gold-d">
                          🪙 {narx}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {varaq.tur === "bino" && h.narxlar && h.daromadlar && (() => {
              const b = h.binolar[String(varaq.joy)];
              if (!b) return null;
              const narx = oshirishNarxi(h.narxlar, b.tur, b.daraja);
              return (
                <div className="text-center">
                  <div className="flex justify-center"><EmojiBelgi e={BINO_BELGI[b.tur]} olcham={64} jonli /></div>
                  <h2 className="mt-2 text-[19px]">{binoNomi(b.tur)}</h2>
                  <p className="text-[13px] text-ink-soft">
                    {t("shDaraja", { n: b.daraja })} · {t("shKunigaTanga", { n: h.daromadlar[b.tur][b.daraja - 1] })}
                  </p>
                  {b.daraja < 3 ? (
                    <>
                      <p className="mt-3 text-[12.5px] text-ink-soft">
                        {t("shDaraja", { n: b.daraja + 1 })}: {t("shKunigaTanga", { n: h.daromadlar[b.tur][b.daraja] })}
                      </p>
                      <button type="button" disabled={band} data-tahlil="Shaharcha: oshirish"
                        onClick={() => sotib(narx, () => shaharchaOshir(varaq.joy))}
                        className={`tugma-3d mt-3 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[16px] text-white
                                    shadow-[0_6px_0_var(--color-brand-green-d)] ${jamiTanga >= narx ? "" : "opacity-60"}`}>
                        {t("shOshir", { n: b.daraja + 1 })} · 🪙 {narx}
                      </button>
                    </>
                  ) : (
                    <p className="mt-4 rounded-clay bg-brand-gold/20 px-4 py-2.5 font-display text-brand-gold-d">
                      ⭐ {t("shEngYuqori")}
                    </p>
                  )}
                </div>
              );
            })()}

            {varaq.tur === "hosil" && (
              <HosilVaraq h={h} onTugadi={(yangi) => {
                setH((e) => ({ ...yangi, qoshnilar: e?.qoshnilar }));
                oyinTugadi(yangi.tanga ?? 0, 0);
              }} onYop={() => setVaraq(null)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Hosil: "🏠 2 + 🌳 3 = ?" — bola o'zi qo'shadi. */
function HosilVaraq({ h, onTugadi, onYop }: {
  h: ShaharchaHolat; onTugadi: (h: ShaharchaHolat) => void; onYop: () => void;
}) {
  const [javob, setJavob] = useState("");
  const [natija, setNatija] = useState<ShaharchaHolat | null>(null);
  const [band, setBand] = useState(false);
  const bolaklar = h.hosil ?? [];

  const tekshir = () => {
    if (band || javob === "") return;
    setBand(true);
    shaharchaHosil(Number(javob))
      .then((j) => { setNatija(j); onTugadi(j); tebrat(j.togri ? "yutuq" : "tanlov"); })
      .catch(onYop)
      .finally(() => setBand(false));
  };

  if (natija) {
    return (
      <div className="relative text-center">
        {natija.togri && <Konfetti />}
        <div className="flex justify-center"><EmojiBelgi e={natija.togri ? "🎉" : "🧺"} olcham={60} jonli /></div>
        <h2 className="mt-2 text-[20px]">
          {natija.togri
            ? t("shTogri", { n: natija.tanga ?? 0 })
            : t("shNotogri", { jami: natija.jami ?? 0, n: natija.tanga ?? 0 })}
        </h2>
        <button type="button" onClick={onYop}
          className="tugma-3d mt-5 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[16px] text-white
                     shadow-[0_6px_0_var(--color-brand-green-d)]">
          OK
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-[18px]">{t("shHosilBor")}</h2>
      <p className="mt-1 text-[12.5px] text-ink-soft">{t("shHosilSavol")}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 font-display text-[18px]">
        {bolaklar.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-ink-soft">+</span>}
            <span className="flex items-center gap-1 rounded-clay bg-karta px-2.5 py-1.5 shadow-clay-sm">
              {BINO_BELGI[b.tur]} {b.miqdor}
            </span>
          </span>
        ))}
        <span className="text-ink-soft">=</span>
        <span className="text-brand-blue">?</span>
      </div>
      <input type="text" inputMode="numeric" autoFocus value={javob}
        onChange={(e) => setJavob(e.target.value.replace(/\D/g, "").slice(0, 5))}
        onKeyDown={(e) => { if (e.key === "Enter") tekshir(); }}
        className="mt-5 w-40 rounded-clay bg-karta px-4 py-3 text-center font-display text-[24px] shadow-clay-sm outline-none" />
      <button type="button" onClick={tekshir} disabled={band || javob === ""} data-tahlil="Shaharcha: hosil tekshirish"
        className="tugma-3d mt-4 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[16px] text-white
                   shadow-[0_6px_0_var(--color-brand-green-d)] disabled:opacity-60">
        {t("shTekshir")}
      </button>
    </div>
  );
}
