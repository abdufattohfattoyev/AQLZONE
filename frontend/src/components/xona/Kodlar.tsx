/**
 * SON KODLARI — o'yin ekrani (`core/oyin_kodlar.py`).
 *
 * Bitta ekran uch xil odamga uch xil gapiradi:
 *
 *   sardor, navbati     — son va "nechta" kiritadi; kartalar ranglari ko'rinadi
 *   topuvchi, navbati   — kartaga bir bosish BELGI (jamoadoshlar ko'radi),
 *                         ikkinchi bosish OCHADI. Birdaniga ochilmasligi
 *                         ataylab: jamoa avval kelishib olsin.
 *   raqib jamoasi       — kuzatadi va tayyor gaplar bilan gapiradi
 *
 * Har kim kartadagi ifodani O'Z darajasida ko'radi (server yuboradi).
 */
import { useEffect, useState } from "react";
import { t } from "../../lib/matn";
import { tebrat } from "../../lib/qobiq";
import type { XonaHolat } from "../../lib/api";

type Jamoa = "kok" | "qizil";
interface Karta { ifoda: string; ochiq: boolean; rang: "kok" | "qizil" | "neytral" | "bomba" | null; qiymat: number | null }
interface KodlarHolat {
  kartalar: Karta[];
  jamoalar: Record<string, Jamoa>;
  sardorlar: Record<Jamoa, string>;
  navbat: Jamoa;
  bosqich: "maslahat" | "topish";
  maslahat: { son: number; soni: number } | null;
  qolganOchish: number;
  ochildi: number;
  belgilar: Record<string, string[]>;
  tarix: { tur: string; jamoa: Jamoa; kim?: string; son?: number; soni?: number; rang?: string }[];
  qoldi: Record<Jamoa, number>;
  qolgan: number;
  menJamoa: Jamoa | null;
  menSardor: boolean;
  tugadi: boolean;
}

const JAMOA_RANG: Record<Jamoa, string> = { kok: "bg-brand-blue", qizil: "bg-brand-gold" };
const jamoaNomi = (j: Jamoa) => t(j === "kok" ? "kdKok" : "kdQizil");

function kartaRangi(k: Karta, sardorKoradi: boolean): string {
  if (!k.rang) return "bg-karta text-ink shadow-clay-sm";
  const ochiq = k.ochiq;
  switch (k.rang) {
    case "kok": return ochiq ? "bg-brand-blue text-white" : sardorKoradi ? "bg-brand-blue/25 text-ink" : "bg-karta";
    case "qizil": return ochiq ? "bg-brand-gold text-white" : sardorKoradi ? "bg-brand-gold/30 text-ink" : "bg-karta";
    case "bomba": return ochiq ? "bg-ink text-white" : "bg-ink/80 text-white";
    default: return ochiq ? "bg-track text-ink-dim" : "bg-track/70 text-ink";
  }
}

export function Kodlar({ xona, amal, gap }: {
  xona: XonaHolat;
  amal: (a: Record<string, unknown>) => Promise<void>;
  gap: (kalit: string) => void;
}) {
  const h = xona.oyinHolat as KodlarHolat;
  const men = String(xona.men);
  const ism = (id: string) => id === men ? t("xonaSiz") : xona.azolar.find((a) => String(a.id) === id)?.ism ?? "";
  const navbatim = h.menJamoa === h.navbat && !h.tugadi;
  const topuvchiman = navbatim && !h.menSardor && h.bosqich === "topish";
  const maslahatBeraman = navbatim && h.menSardor && h.bosqich === "maslahat";

  const [son, setSon] = useState("");
  const [soni, setSoni] = useState(1);
  const [band, setBand] = useState(false);

  const [qolgan, setQolgan] = useState(h.qolgan);
  useEffect(() => {
    setQolgan(h.qolgan);
    const id = setInterval(() => setQolgan((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [h.qolgan, h.navbat, h.bosqich]);

  const bajar = (a: Record<string, unknown>) => {
    setBand(true);
    return amal(a).catch(() => {}).finally(() => setBand(false));
  };

  const kartaBos = (i: number) => {
    if (!topuvchiman || band || h.kartalar[i].ochiq) return;
    const belgilaganlar = h.belgilar[String(i)] ?? [];
    tebrat("tanlov");
    if (belgilaganlar.includes(men)) void bajar({ tur: "och", i });
    else void bajar({ tur: "belgi", i });
  };

  const maslahatYubor = () => {
    const n = Number(son);
    if (!son || !Number.isFinite(n)) return;
    void bajar({ tur: "maslahat", son: n, soni }).then(() => setSon(""));
  };

  const oxirgiXabar = [...h.tarix].reverse().find((x) => x.tur === "och");

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col gap-3 px-4 pt-4 pb-6 sm:max-w-[600px]">
      {/* ---- hisob ---- */}
      <div className="grid grid-cols-2 gap-2">
        {(["kok", "qizil"] as Jamoa[]).map((j) => (
          <div key={j} className={`rounded-clay px-3 py-2 text-white ${JAMOA_RANG[j]} ${
            h.navbat === j ? "ring-2 ring-ink/40" : "opacity-80"}`}>
            <div className="font-display text-[14px]">{jamoaNomi(j)}</div>
            <div className="text-[12px] text-white/90">
              {t("kdQoldi", { n: h.qoldi[j] })} · {t("kdSardor")}: {ism(h.sardorlar[j])}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[12.5px] text-ink-soft">
        <span>{h.menJamoa ? t("kdJamoangiz", { j: jamoaNomi(h.menJamoa) }) : ""}</span>
        <span className={qolgan <= 10 ? "font-semibold text-brand-gold-d" : ""}>⏱ {qolgan} s</span>
      </div>

      {/* ---- maslahat qismi ---- */}
      <div className="rounded-clay bg-karta px-3.5 py-3 text-center shadow-clay-sm">
        {maslahatBeraman ? (
          <>
            <div className="text-[12.5px] text-ink-soft">{t("kdSizSardor")}</div>
            <div className="mt-1 text-[13px]">{t("kdMaslahatBering")}</div>
            <div className="mt-2.5 flex items-center gap-2">
              <input value={son} inputMode="numeric" maxLength={4} placeholder={t("kdSon")}
                aria-label={t("kdSon")}
                onChange={(e) => setSon(e.target.value.replace(/\D/g, ""))}
                className="w-24 rounded-2xl bg-track px-3 py-2.5 text-center font-display text-[22px]
                           text-ink outline-none placeholder:text-[13px] placeholder:text-ink-dim" />
              <div className="flex flex-1 gap-1" role="group" aria-label={t("kdSoni")}>
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} type="button" onClick={() => setSoni(n)} aria-pressed={soni === n}
                    className={`clay-press flex-1 rounded-2xl py-2.5 font-display text-[17px] ${
                      soni === n ? "bg-brand-blue text-white" : "bg-track text-ink-soft"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" onClick={maslahatYubor} disabled={!son || band} data-tahlil="Kodlar: maslahat"
              className="tugma-3d mt-2.5 w-full rounded-3xl bg-brand-green py-3 font-display text-[16px] text-white
                         shadow-[0_5px_0_var(--color-brand-green-d)] disabled:opacity-50">
              {t("kdYuborish")}
            </button>
          </>
        ) : h.bosqich === "maslahat" ? (
          <div className="py-1 font-display text-[15px]">
            {t("kdKutSardor", { nom: ism(h.sardorlar[h.navbat]) })}
          </div>
        ) : (
          <>
            <div className="font-display text-[20px]">
              {t("kdMaslahat", { son: h.maslahat?.son ?? 0, soni: h.maslahat?.soni ?? 0 })}
            </div>
            <div className="text-[12.5px] text-ink-soft">
              {topuvchiman ? t("kdTopish", { son: h.maslahat?.son ?? 0 })
                : navbatim ? t("kdQolganOchish", { n: h.qolganOchish })
                : t("kdRaqibNavbati")}
            </div>
          </>
        )}
      </div>

      {/* ---- taxta ---- */}
      <div className="grid grid-cols-4 gap-1.5">
        {h.kartalar.map((k, i) => {
          const belgilar = h.belgilar[String(i)] ?? [];
          return (
            <button key={i} type="button" onClick={() => kartaBos(i)}
              disabled={!topuvchiman || k.ochiq}
              aria-label={`${k.ifoda}${k.rang ? ` · ${k.rang}` : ""}`}
              className={`relative flex h-[68px] flex-col items-center justify-center rounded-clay px-0.5
                          transition-colors ${kartaRangi(k, h.menSardor)}
                          ${belgilar.includes(men) ? "ring-2 ring-brand-blue" : ""}
                          ${k.ochiq ? "" : topuvchiman ? "clay-press" : ""}`}>
              <span className={`font-display leading-tight ${k.ifoda.length > 9 ? "text-[12.5px]" : "text-[15px]"}`}>
                {k.ifoda}
              </span>
              {k.qiymat !== null && (h.menSardor || k.ochiq) && (
                <span className="text-[11px] opacity-80">= {k.qiymat}{k.rang === "bomba" ? " 💣" : ""}</span>
              )}
              {belgilar.length > 0 && !k.ochiq && (
                <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-brand-blue
                                 text-[10px] text-white">{belgilar.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {topuvchiman && (
        <>
          <p className="text-center text-[12px] text-ink-dim">{t("kdBelgiIzoh")}</p>
          <button type="button" onClick={() => void bajar({ tur: "tugat" })} disabled={h.ochildi < 1 || band}
            className="clay-press rounded-3xl bg-karta py-3 font-display text-[14.5px] text-ink-soft shadow-clay-sm
                       disabled:opacity-50">
            {t("kdTugatish")}
          </button>
        </>
      )}

      {oxirgiXabar && (
        <p className="text-center text-[12.5px] text-ink-soft">
          {ism(oxirgiXabar.kim ?? "")}: {oxirgiXabar.rang === "bomba" ? t("kdBombaSabab")
            : oxirgiXabar.rang === "neytral" ? "—" : jamoaNomi(oxirgiXabar.rang as Jamoa)}
        </p>
      )}

      {/* Erkin chat yo'q — faqat tayyor gaplar. */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {(["tekshir", "ishonaman", "xato", "xavfli", "zor"] as const).map((k) => (
          <button key={k} type="button" onClick={() => gap(k)}
            className="clay-press rounded-full bg-karta px-3 py-1.5 text-[12.5px] text-ink-soft shadow-clay-sm">
            {t(`gap_${k}`)}
          </button>
        ))}
      </div>
      {xona.gaplar.slice(-2).map((g) => (
        <div key={`${g.azo}-${g.vaqt}`} className="text-center text-[12.5px] text-ink-soft">
          <b className="font-display text-ink">{ism(String(g.azo))}:</b> {t(`gap_${g.kalit}` as "gap_zor")}
        </div>
      ))}
    </div>
  );
}
