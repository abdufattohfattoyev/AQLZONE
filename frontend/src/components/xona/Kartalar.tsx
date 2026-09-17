/**
 * SON KARTALARI — o'yin ekrani (`core/oyin_kartalar.py`).
 *
 * Tepada raqib, o'rtada nishon va tanlangan zanjir, pastda qo'l va
 * o'zim. Zanjir natijasi BOSISH bilan darhol hisoblanadi — "7 ×8 −6 = 50"
 * ko'rinib turadi, shunda bola zarba berishdan oldin o'zini tekshiradi.
 * Server baribir o'zi qayta hisoblaydi.
 */
import { useEffect, useMemo, useState } from "react";
import { EmojiBelgi } from "../../lib/hajmli";
import { t } from "../../lib/matn";
import type { Kalit } from "../../lib/matn";
import { tebrat } from "../../lib/qobiq";
import type { XonaHolat } from "../../lib/api";

interface Karta { t: "son" | "amal"; v?: number; a?: string; yozuv: string }
interface Oyinchi {
  jon: number; daraja: number; aniq: number;
  maxsus: string | boolean | null; ishlatildi: boolean; ikki: boolean; qalqon: boolean;
  qol?: Karta[]; nishon?: number;
}
interface KartalarHolat {
  navbat: string; yurish: number; maxYurish: number; qolgan: number;
  oyinchilar: Record<string, Oyinchi>;
  oxirgi: { azo: string; ifoda?: string; natija?: number; nishon?: number; zarba?: number; otkazdi?: boolean } | null;
  tugadi: boolean;
}

/** Zanjirni hisoblaydi — server bilan bir xil qoida (ketma-ket). */
function hisobla(kartalar: Karta[]): number | null {
  if (!kartalar.length || kartalar[0].t !== "son") return null;
  let q = kartalar[0].v ?? 0;
  for (const k of kartalar.slice(1)) {
    const v = k.v ?? 0;
    if (k.a === "+") q += v;
    else if (k.a === "-") q -= v;
    else if (k.a === "*") q *= v;
    else if (k.a === "/") { if (!v || q % v !== 0) return null; q /= v; }
    else if (k.a === "kv") { if (Math.abs(q) > 20) return null; q *= q; }
  }
  return q;
}

function JonChiziq({ nom, jon, faol, belgilar }: { nom: string; jon: number; faol: boolean; belgilar?: string }) {
  return (
    <div className={`rounded-clay bg-karta px-3.5 py-2.5 shadow-clay-sm ${faol ? "ring-2 ring-brand-blue" : ""}`}>
      <div className="flex items-center gap-2 text-[13.5px]">
        <span className="min-w-0 flex-1 truncate font-display">{nom}</span>
        {belgilar && <span className="text-[12px] text-ink-soft">{belgilar}</span>}
        <span className="font-display">{jon} <span className="text-[11px] text-ink-dim">{t("kJon")}</span></span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-track">
        <div className={`h-full rounded-full transition-[width] duration-500 ${jon > 30 ? "bg-brand-green" : "bg-brand-gold"}`}
          style={{ width: `${jon}%` }} />
      </div>
    </div>
  );
}

export function Kartalar({ xona, amal }: {
  xona: XonaHolat;
  amal: (a: Record<string, unknown>) => Promise<void>;
}) {
  const h = xona.oyinHolat as KartalarHolat;
  const men = String(xona.men);
  const raqibId = Object.keys(h.oyinchilar).find((k) => k !== men) ?? "";
  const ism = (id: string) => xona.azolar.find((a) => String(a.id) === id)?.ism ?? "";
  const o = h.oyinchilar[men];
  const r = h.oyinchilar[raqibId];
  const navbatim = h.navbat === men && !h.tugadi;
  const [tanlov, setTanlov] = useState<number[]>([]);
  const [band, setBand] = useState(false);

  // Yangi qo'l kelganda tanlov tozalanadi.
  const qolKalit = (o.qol ?? []).map((k) => k.yozuv).join("|") + h.yurish;
  useEffect(() => { setTanlov([]); }, [qolKalit]);

  // Qolgan vaqt — so'rovlar orasida ham silliq kamaysin.
  const [qolgan, setQolgan] = useState(h.qolgan);
  useEffect(() => {
    setQolgan(h.qolgan);
    const id = setInterval(() => setQolgan((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [h.qolgan, h.yurish]);

  const qol = o.qol ?? [];
  // `filter` SHART: zarbadan keyin qo'l bo'shaydi, tanlov esa effekt
  // ishlaguncha bir chizish davomida eski indekslarni ushlab turadi.
  const zanjir = tanlov.map((i) => qol[i]).filter((k): k is Karta => Boolean(k));
  const natija = useMemo(() => hisobla(zanjir), [zanjir]);

  const bos = (i: number) => {
    if (!navbatim || tanlov.includes(i)) return;
    const k = qol[i];
    if (tanlov.length === 0 && k.t !== "son") return;
    if (tanlov.length > 0 && k.t !== "amal") return;
    tebrat("tanlov");
    setTanlov([...tanlov, i]);
  };

  const zarbaBer = () => {
    if (tanlov.length < 2 || band) return;
    setBand(true);
    amal({ tur: "yur", kartalar: tanlov })
      .then(() => tebrat(natija === o.nishon ? "togri" : "tanlov"))
      .catch(() => {})
      .finally(() => setBand(false));
  };

  const maxsusIshlat = () => {
    setBand(true);
    amal({ tur: "maxsus" }).catch(() => {}).finally(() => setBand(false));
  };

  const oxirgi = h.oxirgi;
  const maxsusNomi = typeof o.maxsus === "string" ? o.maxsus : null;

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col gap-3 px-4 pt-4 pb-6 sm:max-w-[560px]">
      <div className="flex items-center justify-between text-[12.5px] text-ink-soft">
        <span>{t("kYurish", { n: Math.min(h.yurish + 1, h.maxYurish), m: h.maxYurish })}</span>
        <span className={qolgan <= 10 ? "font-semibold text-brand-gold-d" : ""}>⏱ {qolgan} s</span>
      </div>

      <JonChiziq nom={ism(raqibId)} jon={r.jon} faol={h.navbat === raqibId}
        belgilar={`${r.qalqon ? "🛡" : ""}${r.maxsus ? "🎴" : ""}`} />

      {oxirgi && (
        <div className="rounded-clay bg-track px-3 py-2 text-center text-[12.5px] text-ink-soft">
          {oxirgi.otkazdi
            ? t("kOtkazdi", { nom: oxirgi.azo === men ? t("xonaSiz") : ism(oxirgi.azo) })
            : t("kOxirgi", {
              nom: oxirgi.azo === men ? t("xonaSiz") : ism(oxirgi.azo), ifoda: oxirgi.ifoda ?? "",
              natija: oxirgi.natija ?? 0, nishon: oxirgi.nishon ?? 0, zarba: oxirgi.zarba ?? 0,
            })}
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center rounded-clay bg-karta p-4 text-center shadow-clay-sm">
        {navbatim ? (
          <>
            <div className="text-[12px] text-ink-dim">{t("kNishon")}</div>
            <div className="font-display text-[56px] leading-none">{o.nishon}</div>
            <div className="mt-3 flex min-h-[48px] flex-wrap items-center justify-center gap-1.5
                            rounded-clay border-2 border-dashed border-brand-blue/40 px-2 py-2">
              {zanjir.length === 0
                ? <span className="text-[12.5px] text-ink-dim">{t("kTanlang")}</span>
                : zanjir.map((k, i) => (
                  <span key={i} className="font-display text-[22px]">{k.yozuv}</span>
                ))}
              {zanjir.length >= 2 && natija !== null && (
                <span className={`font-display text-[22px] ${natija === o.nishon ? "text-brand-green-d" : "text-ink-soft"}`}>
                  = {natija}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="py-6">
            <EmojiBelgi e="🤔" olcham={44} className="mx-auto" />
            <div className="mt-2 font-display text-[16px]">{t("kNavbatRaqib", { nom: ism(h.navbat) })}</div>
          </div>
        )}
      </div>

      {navbatim && (
        <>
          <div className="grid grid-cols-5 gap-1.5">
            {qol.map((k, i) => {
              const ishlatildi = tanlov.includes(i);
              const mumkin = tanlov.length === 0 ? k.t === "son" : k.t === "amal";
              return (
                <button key={i} type="button" onClick={() => bos(i)} disabled={ishlatildi}
                  className={`clay-press grid h-16 place-items-center rounded-clay font-display text-[19px]
                              shadow-clay-sm transition-opacity ${ishlatildi ? "opacity-30"
                                : k.t === "son" ? "bg-brand-blue text-white" : "bg-karta text-ink"}
                              ${!ishlatildi && !mumkin ? "opacity-50" : ""}`}>
                  {k.yozuv}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setTanlov([])} disabled={!tanlov.length}
              className="clay-press rounded-3xl bg-karta px-4 py-3 font-display text-[14px] text-ink-soft
                         shadow-clay-sm disabled:opacity-50">
              {t("kTozala")}
            </button>
            <button type="button" onClick={zarbaBer} disabled={tanlov.length < 2 || natija === null || band}
              data-tahlil="Kartalar: zarba"
              className="tugma-3d flex-1 rounded-3xl bg-brand-green py-3 font-display text-[17px] text-white
                         shadow-[0_5px_0_var(--color-brand-green-d)] disabled:opacity-50">
              {t("kZarba")}
            </button>
          </div>

          {maxsusNomi && !o.ishlatildi && (
            <button type="button" onClick={maxsusIshlat} disabled={band}
              className="clay-press flex items-center gap-3 rounded-clay bg-brand-gold/20 px-3.5 py-2.5 text-left">
              <span className="text-[22px]">🎴</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[14px] text-brand-gold-d">
                  {t(`kM_${maxsusNomi}` as Kalit)}
                </span>
                <span className="block text-[12px] text-ink-soft">{t(`kM_${maxsusNomi}Izoh` as Kalit)}</span>
              </span>
              <span className="font-display text-[13px] text-brand-gold-d">{t("kMaxsusIshlat")}</span>
            </button>
          )}
        </>
      )}

      <JonChiziq nom={t("xonaSiz")} jon={o.jon} faol={navbatim}
        belgilar={`${o.qalqon ? "🛡" : ""}${o.ikki ? "×2" : ""}`} />
    </div>
  );
}
