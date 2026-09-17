/**
 * SEYF — o'yin ekrani (`core/oyin_seyf.py`).
 *
 * Tepada rol va o'z bo'lagi (faqat shu o'yinchiga ko'rinadi), o'rtada
 * hamma "aytgan" bo'laklar ro'yxati — detektivlik aynan shu ro'yxatni
 * solishtirishdan iborat. Pastda bosqichga qarab bitta amal:
 *
 *   muhokama  bo'lakni aytish → "Ovozga tayyorman"
 *   ovoz      kodni yozish va xoinni tanlash → "Javobni qulflash"
 *
 * Erkin matn YO'Q: bo'lak ham tugma bilan aytiladi, gap ham tayyor.
 */
import { useEffect, useState } from "react";
import { EmojiBelgi } from "../../lib/hajmli";
import { t } from "../../lib/matn";
import type { Kalit } from "../../lib/matn";
import { tebrat } from "../../lib/qobiq";
import type { XonaHolat } from "../../lib/api";

export interface SeyfHolat {
  bosqich: "muhokama" | "ovoz";
  qolgan: number;
  rol: "xoin" | "hisobchi";
  bolak: string | null;
  variantlar: string[];
  aytdim: boolean;
  aytilgan: { azo: string; matn: string }[];
  tayyorman: boolean;
  tayyorSoni: number;
  odamSoni: number;
  ovozBerdim: boolean;
  ovozSoni: number;
  jami: number;
  tugadi: boolean;
  sirKod: number | null;
  yakun?: {
    kod: number; kodTogri: boolean; xoinTopildi: boolean; golib: string; xoin: string;
    bolaklar: Record<string, string>;
  };
}

export function Seyf({ xona, amal, gap }: {
  xona: XonaHolat;
  amal: (a: Record<string, unknown>) => Promise<void>;
  gap: (kalit: string) => void;
}) {
  const h = xona.oyinHolat as SeyfHolat;
  const men = String(xona.men);
  const ism = (id: string) => id === men ? t("xonaSiz") : xona.azolar.find((a) => String(a.id) === id)?.ism ?? "";
  const xoinman = h.rol === "xoin";
  const [band, setBand] = useState(false);
  const [kod, setKod] = useState("");
  const [xoin, setXoin] = useState<string | null>(null);

  const [qolgan, setQolgan] = useState(h.qolgan);
  useEffect(() => {
    setQolgan(h.qolgan);
    const id = setInterval(() => setQolgan((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [h.qolgan, h.bosqich]);

  const bajar = (a: Record<string, unknown>) => {
    setBand(true);
    tebrat("tanlov");
    return amal(a).catch(() => {}).finally(() => setBand(false));
  };

  const vaqt = `${Math.floor(qolgan / 60)}:${String(qolgan % 60).padStart(2, "0")}`;
  const boshqalar = xona.azolar.filter((a) => String(a.id) !== men && !a.chiqdi);

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col gap-3 px-4 pt-4 pb-6 sm:max-w-[560px]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-display text-[16px]">
          <EmojiBelgi e="🔐" olcham={22} />
          {t(h.bosqich === "muhokama" ? "sfMuhokama" : "sfOvoz")}
        </span>
        <span className={`font-display text-[15px] tabular-nums ${qolgan <= 15 ? "text-brand-gold-d" : "text-ink-soft"}`}>
          ⏱ {vaqt}
        </span>
      </div>

      {/* ---- rol va o'z bo'lagi ---- */}
      <div className={`rounded-clay p-4 shadow-clay ${xoinman ? "bg-ink text-karta" : "bg-brand-blue text-white"}`}>
        <div className="flex items-center gap-2">
          <EmojiBelgi e={xoinman ? "🎭" : "🕵️"} olcham={26} />
          <div className="min-w-0">
            <div className="font-display text-[16px]">{t(xoinman ? "sfXoin" : "sfHisobchi")}</div>
            <div className="text-[12.5px] opacity-85">{t(xoinman ? "sfXoinIzoh" : "sfHisobchiIzoh")}</div>
          </div>
        </div>
        <div className="mt-3 rounded-2xl bg-white/15 px-3 py-2.5">
          <div className="text-[11.5px] opacity-80">{t("sfBolagingiz")}</div>
          <div className="font-display text-[22px] leading-tight">{h.bolak}</div>
        </div>
        {xoinman && h.sirKod !== null && (
          <div className="mt-2 text-[12.5px] opacity-85">{t("sfSirKod", { kod: h.sirKod })}</div>
        )}
      </div>

      {/* ---- aytilgan bo'laklar ---- */}
      <div className="rounded-clay bg-karta p-3.5 shadow-clay-sm">
        <div className="mb-2 text-[11px] tracking-widest text-ink-soft uppercase">{t("sfAytilgan")}</div>
        {h.aytilgan.length === 0 ? (
          <p className="text-[13px] text-ink-dim">{t("sfHaliHechKim")}</p>
        ) : (
          <div className="space-y-1.5">
            {h.aytilgan.map((x) => (
              <div key={x.azo} className="flex items-baseline gap-2">
                <span className="w-24 shrink-0 truncate text-[12.5px] text-ink-soft">{ism(x.azo)}</span>
                <span className="font-display text-[17px]">{x.matn}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- muhokama ---- */}
      {h.bosqich === "muhokama" && !h.aytdim && (
        xoinman ? (
          <div className="rounded-clay bg-karta p-3.5 shadow-clay-sm">
            <div className="mb-2 text-[13px] text-ink-soft">{t("sfNimaAytasiz")}</div>
            <div className="grid grid-cols-1 gap-1.5">
              {h.variantlar.map((v, i) => (
                <button key={v} type="button" disabled={band} onClick={() => void bajar({ tur: "ayt", i })}
                  className="clay-press flex items-center justify-between rounded-2xl bg-track px-3.5 py-2.5
                             text-left font-display text-[16px]">
                  {v}
                  {i === 0 && <span className="text-[11.5px] text-ink-dim">{t("sfHaqiqat")}</span>}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <button type="button" disabled={band} onClick={() => void bajar({ tur: "ayt", i: 0 })}
            data-tahlil="Seyf: bo'lakni aytish"
            className="tugma-3d w-full rounded-3xl bg-brand-green py-3.5 font-display text-[17px] text-white
                       shadow-[0_5px_0_var(--color-brand-green-d)] disabled:opacity-60">
            {t("sfAytish")}
          </button>
        )
      )}

      {h.bosqich === "muhokama" && h.aytdim && (
        <button type="button" disabled={band || h.tayyorman} onClick={() => void bajar({ tur: "ovozga" })}
          className={`w-full rounded-3xl py-3.5 font-display text-[16px] ${h.tayyorman
            ? "bg-karta text-ink-soft shadow-clay-sm"
            : "tugma-3d bg-brand-blue text-white shadow-[0_5px_0_var(--color-brand-blue-d)]"}`}>
          {h.tayyorman ? t("sfTayyorSoni", { n: h.tayyorSoni, m: h.odamSoni }) : t("sfOvozgaTayyor")}
        </button>
      )}

      {/* ---- ovoz ---- */}
      {h.bosqich === "ovoz" && !h.ovozBerdim && (
        <div className="rounded-clay bg-karta p-3.5 shadow-clay-sm">
          <div className="font-display text-[15px]">{t("sfKodYozing")}</div>
          <input value={kod} inputMode="numeric" maxLength={4} aria-label={t("sfKodYozing")}
            onChange={(e) => setKod(e.target.value.replace(/\D/g, ""))}
            className="mt-2 w-full rounded-2xl bg-track px-4 py-3 text-center font-display text-[28px]
                       tracking-[0.2em] text-ink outline-none" />
          <div className="mt-3 font-display text-[15px]">{t("sfKimXoin")}</div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {boshqalar.map((a) => (
              <button key={a.id} type="button" onClick={() => setXoin(String(a.id))} aria-pressed={xoin === String(a.id)}
                className={`clay-press truncate rounded-2xl px-2 py-2.5 text-[13.5px] ${
                  xoin === String(a.id) ? "bg-brand-blue text-white" : "bg-track text-ink"}`}>
                {a.ism}
              </button>
            ))}
            <button type="button" onClick={() => setXoin("")} aria-pressed={xoin === ""}
              className={`clay-press rounded-2xl px-2 py-2.5 text-[13.5px] ${
                xoin === "" ? "bg-brand-blue text-white" : "bg-track text-ink-soft"}`}>
              {t("sfBilmayman")}
            </button>
          </div>
          <button type="button" disabled={band || !kod || xoin === null} data-tahlil="Seyf: ovoz"
            onClick={() => void bajar({ tur: "ovoz", kod: Number(kod), xoin })}
            className="tugma-3d mt-3 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[17px] text-white
                       shadow-[0_5px_0_var(--color-brand-green-d)] disabled:opacity-50">
            {t("sfQulflash")}
          </button>
        </div>
      )}

      {h.bosqich === "ovoz" && h.ovozBerdim && (
        <div className="rounded-clay bg-karta p-4 text-center shadow-clay-sm">
          <div className="font-display text-[16px]">{t("sfKutilmoqda")}</div>
          <div className="mt-1 text-[13px] text-ink-soft">{t("sfJavobBerdi", { n: h.ovozSoni, m: h.jami })}</div>
        </div>
      )}

      {/* Erkin chat yo'q — tayyor gaplar. */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {(["tekshir", "xato", "ishonaman", "menemas", "xavfli"] as const).map((k) => (
          <button key={k} type="button" onClick={() => gap(k)}
            className="clay-press rounded-full bg-karta px-3 py-1.5 text-[12.5px] text-ink-soft shadow-clay-sm">
            {t(`gap_${k}` as Kalit)}
          </button>
        ))}
      </div>
      {xona.gaplar.slice(-3).map((g) => (
        <div key={`${g.azo}-${g.vaqt}`} className="text-center text-[12.5px] text-ink-soft">
          <b className="font-display text-ink">{ism(String(g.azo))}:</b> {t(`gap_${g.kalit}` as Kalit)}
        </div>
      ))}
    </div>
  );
}

/** Natija ekranidagi ochilish: kod, xoin kim edi va kim yolg'on aytgan. */
export function SeyfYakun({ xona }: { xona: XonaHolat }) {
  const h = xona.oyinHolat as SeyfHolat | null;
  const y = h?.yakun;
  if (!h || !y) return null;
  const ism = (id: string) => id === String(xona.men) ? t("xonaSiz") : xona.azolar.find((a) => String(a.id) === id)?.ism ?? "";
  return (
    <div className="mt-4 rounded-clay bg-karta p-4 text-left shadow-clay-sm">
      <div className="flex items-center gap-2 font-display text-[17px]">
        <EmojiBelgi e={y.kodTogri ? "🔓" : "🔒"} olcham={24} />
        {y.kodTogri ? t("sfOchildi", { kod: y.kod }) : t("sfYopiqQoldi", { kod: y.kod })}
      </div>
      <div className="mt-1.5 text-[14px]">
        🎭 {t("sfXoinEdi", { nom: ism(y.xoin) })} ·{" "}
        <span className={y.xoinTopildi ? "text-brand-green-d" : "text-brand-gold-d"}>
          {t(y.xoinTopildi ? "sfTopildi" : "sfYashirindi")}
        </span>
      </div>
      <div className="mt-3 space-y-1">
        {h.aytilgan.map((x) => {
          const haqiqat = y.bolaklar[x.azo];
          const yolgon = haqiqat && haqiqat !== x.matn;
          return (
            <div key={x.azo} className="flex items-baseline gap-2 text-[13px]">
              <span className="w-24 shrink-0 truncate text-ink-soft">{ism(x.azo)}</span>
              <span className={yolgon ? "line-through text-ink-dim" : ""}>{x.matn}</span>
              {yolgon && <span className="text-brand-gold-d">→ {haqiqat} · {t("sfYolgon")}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
