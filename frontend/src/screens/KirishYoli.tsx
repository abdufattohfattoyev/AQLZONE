/**
 * KIRISH YO'LI — maqsad (OTM, yo'nalish) va unga qancha qolgani.
 *
 * Hisob va nega shunday — `lib/kirish.ts`. Bu ekranda ikki holat:
 *   TANLASH  qidiruv: "TATU dasturiy" — OTM qisqartmasi ham topiladi;
 *   YO'L     bitta katta raqam ("grantgacha 4 ta savol"), 189 lik chiziq
 *            va boshqa fanlar surgichi.
 *
 * Bepul: maqsad, taxminiy ball, farq. Premium: farqni yopish REJASI
 * (AI). Muammoni ko'rmagan odam yechimga pul to'lamaydi — farq hammaga
 * ochiq, yo'l esa Premium'da (`FarqKarta.tsx` bilan bir xil qoida).
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NatijaSarlavha } from "../components/NatijaSarlavha";
import { Icon } from "../lib/icons";
import { zaifDtm } from "../lib/dtmMavzu";
import { daraja, sinxronla } from "../lib/imtihon";
import { BOSHQA_BOSHI, MAKS, ballYoz, hisobla, maqsadOqi, maqsadSaqla, matemMaks, yonalishlar } from "../lib/kirish";
import type { Maqsad, Yonalish } from "../lib/kirish";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { yolImtMashq, yolImtMavzu, yolImtihonVariant } from "../lib/yollar";

/** Qidiruvda ko'rsatiladigan eng ko'p qator — ro'yxat telefonda cho'zilib ketmasin. */
const CHEK = 40;

/** "Toshkent axborot texnologiyalari universiteti" → "tatu". */
const qisqa = (s: string) =>
  s.split(/[\s-]+/).filter((w) => /^\p{L}/u.test(w)).map((w) => w[0]).join("").toLowerCase();

/** Apostrof turlari bir xil bo'lsin: o', o‘, oʻ, o` — hammasi bitta. */
const toza = (s: string) => s.toLowerCase().replace(/[‘’ʻʼ`']/g, "'");

export function KirishYoli({ onChiq }: { onChiq: () => void }) {
  const strelka = useOrqaga(onChiq);
  const [maqsad, setMaqsad] = useState<Maqsad | null>(maqsadOqi);
  const [tanlash, setTanlash] = useState(() => maqsadOqi() === null);

  // Matematikadagi o'rtacha — serverdan (Imtihon.tsx dagidek), kelguncha qurilmadagi.
  const [foiz, setFoiz] = useState<number | null>(() => daraja()?.foiz ?? null);
  useEffect(() => {
    let tirik = true;
    sinxronla().then((x) => { if (tirik && x && x.ortacha !== null) setFoiz(x.ortacha); }).catch(() => {});
    return () => { tirik = false; };
  }, []);

  const tanla = (y: Yonalish) => {
    tebrat("tanlov");
    const m = { y, boshqa: maqsad?.boshqa ?? BOSHQA_BOSHI };
    maqsadSaqla(m);
    setMaqsad(m);
    setTanlash(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pb-10 min-[360px]:px-[18px]
                    sm:max-w-[560px]">
      <NatijaSarlavha nom={t("kirishSarlavha")} strelka={strelka}
        onChiq={tanlash && maqsad ? () => setTanlash(false) : onChiq} />
      {tanlash || !maqsad
        ? <Tanlash onTanla={tanla} />
        : <Yol maqsad={maqsad} foiz={foiz}
            onBoshqa={(b) => { const m = { ...maqsad, boshqa: b }; maqsadSaqla(m); setMaqsad(m); }}
            onOzgartir={() => { tebrat("tanlov"); setTanlash(true); }} />}
    </div>
  );
}

/* ==================== tanlash ==================== */

function Tanlash({ onTanla }: { onTanla: (y: Yonalish) => void }) {
  const [hammasi, setHammasi] = useState<Yonalish[] | null>(null);
  const [sorov, setSorov] = useState("");
  useEffect(() => {
    let tirik = true;
    yonalishlar().then((x) => { if (tirik) setHammasi(x); }).catch(() => { if (tirik) setHammasi([]); });
    return () => { tirik = false; };
  }, []);

  const topilgan = useMemo(() => {
    const sozlar = toza(sorov).split(/\s+/).filter(Boolean);
    if (!hammasi || !sozlar.length) return [];
    return hammasi
      .filter((y) => {
        const matn = toza(`${y.otm} ${y.nomi} ${y.hudud} ${y.kod}`);
        const q = qisqa(y.otm);
        return sozlar.every((s) => matn.includes(s) || q === s);
      })
      // Grant bali yuqori yo'nalish — odatda izlangani; grantsizlar oxirida.
      .sort((a, b) => b.grant - a.grant || b.kontrakt - a.kontrakt)
      .slice(0, CHEK);
  }, [hammasi, sorov]);

  return (
    <>
      <p className="text-[14.5px] leading-snug text-ink-soft">{t("kirishIzoh")}</p>
      <label className="flex min-h-12 items-center gap-2 rounded-clay bg-karta px-3.5 shadow-clay-sm">
        <Icon name="search" size={18} className="shrink-0 text-ink-dim" />
        <input type="search" value={sorov} onChange={(e) => setSorov(e.target.value)}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- ekranning yagona ishi shu
          autoFocus placeholder={t("kirishQidiruv")} aria-label={t("kirishQidiruv")}
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-dim" />
      </label>

      {!hammasi && <p className="p-4 text-center text-[14px] text-ink-dim">{t("yuklanyapti")}</p>}
      {hammasi && sorov.trim() !== "" && topilgan.length === 0 && (
        <p className="p-4 text-center text-[14px] text-ink-dim">{t("kirishTopilmadi")}</p>
      )}

      {topilgan.length > 0 && (
        <div className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
          {topilgan.map((y) => (
            <button key={`${y.otm}|${y.kod}|${y.til}|${y.tur}`} type="button" onClick={() => onTanla(y)}
              data-tahlil="Kirish: yo'nalish tanlash"
              className="clay-press flex min-h-[60px] w-full items-center gap-3 px-4 py-2.5 text-left">
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] leading-tight font-bold">{y.nomi}</span>
                <span className="mt-0.5 block truncate text-[12.5px] text-ink-dim">
                  {y.otm} · {y.til} · {y.tur}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-display text-[16px]">{ballYoz(y.grant || y.kontrakt)}</span>
                <span className="block text-[11.5px] text-ink-dim">{t(y.grant ? "kirishGrant" : "kirishKontrakt")}</span>
              </span>
            </button>
          ))}
        </div>
      )}
      <p className="text-[12.5px] leading-snug text-ink-dim">{t("kirishManba")}</p>
    </>
  );
}

/* ==================== yo'l ==================== */

function Yol({ maqsad, foiz, onBoshqa, onOzgartir }: {
  maqsad: Maqsad;
  foiz: number | null;
  onBoshqa: (b: number) => void;
  onOzgartir: () => void;
}) {
  const nav = useNavigate();
  const { y, boshqa } = maqsad;
  const [zaif] = useState(zaifDtm);

  const h = foiz === null ? null : hisobla(y, foiz, boshqa);
  const foizda = (b: number) => `${Math.min(100, Math.max(0, (b / MAKS) * 100))}%`;

  // Asosiy raqam: grant bo'lsa — grantgacha, bo'lmasa — kontraktgacha.
  const nishon = y.grant ? "grant" : "kontrakt";
  const savol = h ? (y.grant ? h.grantSavol : h.kontraktSavol) : null;

  return (
    <>
      {/* Maqsad — kim, qayerga. "O'zgartirish" shu yerda: tanlov bitta bosish. */}
      <div className="flex items-center gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[17px] leading-tight">{y.nomi}</span>
          <span className="mt-0.5 block text-[13px] leading-snug text-ink-dim">{y.otm} · {y.til} · {y.tur}</span>
        </span>
        <button type="button" onClick={onOzgartir} data-tahlil="Kirish: o'zgartirish"
          className="clay-press min-h-11 shrink-0 rounded-xl px-3 text-[14px] font-bold text-brand-blue-t">
          {t("kirishOzgartir")}
        </button>
      </div>

      {!h ? (
        // Natija yo'q — hisoblab bo'lmaydi; bitta qadam: birinchi variant.
        <div className="flex flex-col gap-3 rounded-clay bg-karta p-5 shadow-clay-sm">
          <p className="text-[15px] leading-snug">{t("kirishNatijaYoq")}</p>
          <button type="button" onClick={() => nav(yolImtihonVariant(1))} data-tahlil="Kirish: birinchi variant"
            className="tugma-3d min-h-12 rounded-2xl bg-brand-blue px-5 font-display text-[16px] font-bold text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("hrBoshla", { n: 1 })}
          </button>
        </div>
      ) : (
        <>
          <section className="az-savol rounded-clay bg-karta p-5 shadow-clay" aria-label={t("kirishSarlavha")}>
            <div className="text-[13px] font-bold text-ink-dim">
              {t(nishon === "grant" ? "kirishGrantgacha" : "kirishKontraktgacha")}
            </div>
            {savol === 0 ? (
              <div className="mt-1 flex items-center gap-2 font-display text-[26px] leading-tight text-brand-green-d">
                <Icon name="check" size={26} />{t("kirishYetdi")}
              </div>
            ) : savol === null ? (
              <div className="mt-1 font-display text-[22px] leading-tight">{t("kirishYetmaydi")}</div>
            ) : (
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-[52px] leading-none text-brand-blue-t">{savol}</span>
                <span className="text-[16px] leading-tight font-semibold text-ink-soft">{t("kirishSavol")}</span>
              </div>
            )}
            <p className="mt-1.5 text-[13.5px] leading-snug text-ink-dim">
              {savol === 0 ? t("kirishZaxira", { b: ballYoz(-(nishon === "grant" ? h.grantFarq ?? 0 : h.kontraktFarq)) })
                : savol === null ? t("kirishYetmaydiIzoh")
                : t("kirishSavolIzoh", { b: ballYoz(nishon === "grant" ? h.grantFarq ?? 0 : h.kontraktFarq) })}
            </p>

            {/* 189 lik chiziq: firuza — matematika, kulrang — boshqa fanlar;
                chegaralar ingichka belgi bilan. Rang faqat ikkita: shovqin yo'q. */}
            <div className="relative mt-5 mb-7 h-3 rounded-full bg-track">
              <div className="absolute inset-y-0 left-0 flex overflow-hidden rounded-full" style={{ width: foizda(h.ball) }}>
                <div className="h-full bg-brand-blue" style={{ width: `${(h.matem / Math.max(1, h.ball)) * 100}%` }} />
                <div className="h-full flex-1 bg-ink-dim/40" />
              </div>
              {[
                y.grant ? { b: y.grant, n: t("kirishGrant") } : null,
                { b: y.kontrakt, n: t("kirishKontrakt") },
              ].filter((x): x is { b: number; n: string } => x !== null && x.b > 0).map((c, i) => (
                <div key={i} className="absolute -top-1.5 flex flex-col items-center" style={{ left: foizda(c.b) }}>
                  <span className="h-6 w-[3px] -translate-x-1/2 rounded-full bg-ink" />
                  <span className="mt-0.5 -translate-x-1/2 text-[11.5px] whitespace-nowrap text-ink-dim">
                    {c.n} {ballYoz(c.b)}
                  </span>
                </div>
              ))}
            </div>

            <dl className="space-y-1.5 text-[14px]">
              <div className="flex items-baseline gap-2">
                <dt className="min-w-0 flex-1">
                  {t("kirishMatem")} <span className="text-ink-dim">· {foiz}% · {t("kirishOrin", { n: y.orin })}</span>
                </dt>
                <dd className="font-display">{ballYoz(h.matem)} <span className="text-ink-dim">/ {matemMaks(y.orin)}</span></dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="min-w-0 flex-1">{t("kirishBoshqa")} <span className="text-ink-dim">· {boshqa}%</span></dt>
                <dd className="font-display">{ballYoz(h.boshqa)} <span className="text-ink-dim">/ {MAKS - matemMaks(y.orin)}</span></dd>
              </div>
              <div className="flex items-baseline gap-2 border-t border-track pt-1.5 font-bold">
                <dt className="min-w-0 flex-1">{t("kirishJami")}</dt>
                <dd className="font-display">{ballYoz(h.ball)} <span className="font-normal text-ink-dim">/ {MAKS}</span></dd>
              </div>
            </dl>
          </section>

          {/* Boshqa fanlar — odamning o'z bahosi. Surilsa raqam darhol o'zgaradi:
              "tarixni 70% ga chiqarsam-chi?" degan savolga javob shu yerda. */}
          <label className="flex flex-col gap-2 rounded-clay bg-karta p-4 shadow-clay-sm">
            <span className="flex items-baseline gap-2">
              <span className="min-w-0 flex-1 text-[14.5px] font-bold">{t("kirishSurgich")}</span>
              <span className="font-display text-[18px]">{boshqa}%</span>
            </span>
            <input type="range" min={0} max={100} step={5} value={boshqa}
              onChange={(e) => onBoshqa(Number(e.target.value))} data-tahlil="Kirish: boshqa fanlar"
              className="h-11 w-full accent-[var(--color-brand-blue)]" />
            <span className="text-[12.5px] leading-snug text-ink-dim">{t("kirishSurgichIzoh")}</span>
          </label>

          {/* Farq QAYERDA — oxirgi urinishlarda eng ko'p xato qilingan DTM
              mavzulari. Har biri mavzu testiga olib boradi: 1-variant bepul,
              qolgani Premium (`DtmMavzular.tsx`). Ilgari bu yerda AI reja
              rejalashtirilgan edi, lekin AI kalitga bog'liq — u to'xtasa,
              ekranning asosiy tugmasi ishlamay qolardi. */}
          {zaif.length > 0 && (
            <>
              <h2 className="mt-1 font-display text-[19px]">{t("kirishQayerda")}</h2>
              <div className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
                {zaif.map((z) => (
                  <button key={z.slug} type="button" onClick={() => nav(yolImtMavzu(z.slug, 1))}
                    data-tahlil="Kirish: zaif mavzu testi"
                    className="clay-press flex min-h-[52px] w-full items-center gap-3 px-4 text-left">
                    <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{t(z.nom)}</span>
                    <span className="shrink-0 text-[13px] text-ink-dim">{t("sertXatoSoni", { n: z.xato })}</span>
                    <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
                  </button>
                ))}
              </div>
            </>
          )}
          <button type="button" onClick={() => nav(yolImtMashq("dtm"))} data-tahlil="Kirish: zaif mavzular mashqi"
            className="tugma-3d min-h-[54px] rounded-2xl bg-brand-blue font-display text-[17px] font-bold text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("zaifMashqTugma")}
          </button>
        </>
      )}

      <p className="text-[12.5px] leading-snug text-ink-dim">{t("kirishManba")}</p>
    </>
  );
}
