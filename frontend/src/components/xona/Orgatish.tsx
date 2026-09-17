/**
 * O'YINNI O'RGATISH — birinchi o'ynashdan oldin.
 *
 * Qoidani matn bilan o'qitish ishlamaydi: bola uzun paragrafni o'tkazib
 * yuboradi va birinchi o'yinda nima qilishni bilmay, boshqalarni kutdirib
 * chiqib ketadi. Kanal havolasidan kelgan odam esa o'yinni umuman ko'rmagan.
 *
 * Shuning uchun uch qadam — har birida bitta katta belgi, bitta qisqa gap
 * va KICHIK MISOL — va to'rtinchisida o'zi SINAB ko'radi. Sinovni bajargach
 * "Tushundim — o'ynaymiz!" chiqadi. O'tkazib yuborish har doim bor.
 *
 * Bir marta ko'rsatiladi (`orgatildimi`), "?" tugmasi bilan qayta ochiladi.
 */
import { useEffect, useState } from "react";
import { EmojiBelgi } from "../../lib/hajmli";
import { t } from "../../lib/matn";
import type { Kalit } from "../../lib/matn";
import { tebrat } from "../../lib/qobiq";
import type { XonaOyin } from "../../lib/api";

const kalit = (oyin: XonaOyin) => `az-orgatildi-${oyin}`;

export function orgatildimi(oyin: XonaOyin): boolean {
  try { return localStorage.getItem(kalit(oyin)) === "1"; } catch { return true; }
}

function belgila(oyin: XonaOyin) {
  try { localStorage.setItem(kalit(oyin), "1"); } catch { /* jim */ }
}

/* ------------------------------------------------------------ misollar */

const Chip = ({ children, rang = "bg-karta text-ink" }: { children: React.ReactNode; rang?: string }) => (
  <span className={`inline-grid min-w-11 place-items-center rounded-2xl px-2.5 py-2 font-display text-[18px] shadow-clay-sm ${rang}`}>
    {children}
  </span>
);

const JonMisol = ({ nom, jon }: { nom: string; jon: number }) => (
  <div className="w-full">
    <div className="flex justify-between text-[12px] text-ink-soft"><span>{nom}</span><span>{jon}</span></div>
    <div className="mt-1 h-2 overflow-hidden rounded-full bg-track">
      <div className="h-full rounded-full bg-brand-green" style={{ width: `${jon}%` }} />
    </div>
  </div>
);

interface Qadam { emoji: string; sarlavha: Kalit; matn: Kalit; misol: React.ReactNode }

function qadamlar(oyin: XonaOyin): Qadam[] {
  if (oyin === "kartalar") {
    return [
      { emoji: "🎯", sarlavha: "orgK1T", matn: "orgK1M",
        misol: <div className="font-display text-[54px] leading-none">12</div> },
      { emoji: "🃏", sarlavha: "orgK2T", matn: "orgK2M",
        misol: (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Chip rang="bg-brand-blue text-white">4</Chip><Chip>+2</Chip><Chip>×2</Chip>
            <span className="font-display text-[20px] text-brand-green-d">= 12</span>
          </div>
        ) },
      { emoji: "⚔️", sarlavha: "orgK3T", matn: "orgK3M",
        misol: <div className="w-full max-w-[220px] space-y-2"><JonMisol nom={t("duelRaqib")} jon={75} /><JonMisol nom={t("xonaSiz")} jon={100} /></div> },
    ];
  }
  if (oyin === "royale") {
    return [
      { emoji: "❤️", sarlavha: "orgR1T", matn: "orgR1M", misol: <div className="text-[34px]">❤️❤️<span className="opacity-30">🤍</span></div> },
      { emoji: "⚡", sarlavha: "orgR2T", matn: "orgR2M",
        misol: <div className="flex gap-1.5"><Chip rang="bg-brand-green text-white">✓</Chip><Chip rang="bg-brand-green text-white">✓</Chip><Chip rang="bg-brand-green text-white">✓</Chip><span className="self-center text-[26px]">→ ⚡</span></div> },
      { emoji: "👑", sarlavha: "orgR3T", matn: "orgR3M",
        misol: <div className="flex gap-2 text-[13px]"><Chip>3 + 4</Chip><Chip>13 × 6</Chip></div> },
    ];
  }
  return [
    { emoji: "👥", sarlavha: "orgD1T", matn: "orgD1M",
      misol: <div className="flex gap-2"><Chip rang="bg-brand-blue text-white">{t("kdKok")}</Chip><Chip rang="bg-brand-gold text-white">{t("kdQizil")}</Chip></div> },
    { emoji: "🔍", sarlavha: "orgD2T", matn: "orgD2M",
      misol: <div className="rounded-2xl bg-karta px-4 py-2 font-display text-[24px] shadow-clay-sm">12 · 2</div> },
    { emoji: "💣", sarlavha: "orgD3T", matn: "orgD3M",
      misol: <div className="flex gap-1.5"><Chip rang="bg-brand-blue text-white">3×4</Chip><Chip rang="bg-brand-gold text-white">2×6</Chip><Chip rang="bg-ink text-karta">💣</Chip></div> },
  ];
}

/* ------------------------------------------------------------ sinov */

function Sinov({ oyin, onBajarildi }: { oyin: XonaOyin; onBajarildi: () => void }) {
  const [tanlov, setTanlov] = useState<number[]>([]);
  const [holat, setHolat] = useState<"" | "togri" | "xato">("");

  const togri = () => { setHolat("togri"); tebrat("togri"); onBajarildi(); };
  const xato = () => { setHolat("xato"); tebrat("xato"); setTimeout(() => { setHolat(""); setTanlov([]); }, 900); };

  if (oyin === "kartalar") {
    // 4 → +2 → ×2 = 12. Boshqa yo'l ham qabul: natija 12 bo'lsa bo'ldi.
    const kartalar = [
      { y: "5", son: true, f: (_: number) => 5 }, { y: "×2", son: false, f: (x: number) => x * 2 },
      { y: "4", son: true, f: (_: number) => 4 }, { y: "−1", son: false, f: (x: number) => x - 1 },
      { y: "+2", son: false, f: (x: number) => x + 2 },
    ];
    const natija = tanlov.reduce((q, i, n) => (n === 0 ? kartalar[i].f(0) : kartalar[i].f(q)), 0);
    const bos = (i: number) => {
      if (holat || tanlov.includes(i)) return;
      if (tanlov.length === 0 && !kartalar[i].son) return;
      if (tanlov.length > 0 && kartalar[i].son) return;
      tebrat("tanlov");
      setTanlov([...tanlov, i]);
    };
    return (
      <div className="w-full">
        <div className="text-center font-display text-[40px] leading-none">12</div>
        <div className="mt-2 flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-brand-blue/40 p-1.5">
          {tanlov.map((i) => <span key={i} className="font-display text-[18px]">{kartalar[i].y}</span>)}
          {tanlov.length >= 2 && <span className="font-display text-[18px]">= {natija}</span>}
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-1.5">
          {kartalar.map((k, i) => (
            <button key={i} type="button" onClick={() => bos(i)} disabled={tanlov.includes(i)}
              className={`clay-press h-12 rounded-2xl font-display text-[17px] shadow-clay-sm disabled:opacity-30 ${
                k.son ? "bg-brand-blue text-white" : "bg-karta text-ink"}`}>
              {k.y}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => setTanlov([])}
            className="clay-press rounded-2xl bg-track px-3 py-2 text-[13px] text-ink-soft">{t("kTozala")}</button>
          <button type="button" disabled={tanlov.length < 2 || holat !== ""}
            onClick={() => (natija === 12 ? togri() : xato())}
            className="clay-press flex-1 rounded-2xl bg-brand-green py-2 font-display text-[15px] text-white disabled:opacity-50">
            {t("orgTekshir")}
          </button>
        </div>
        {holat && <SinovNatija holat={holat} />}
      </div>
    );
  }

  if (oyin === "royale") {
    return (
      <div className="w-full">
        <div className="text-center text-[22px]">❤️❤️❤️</div>
        <div className="mt-2 rounded-2xl bg-karta py-5 text-center font-display text-[36px] shadow-clay-sm">6 + 7 = ?</div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["12", "13", "14", "15"].map((v) => (
            <button key={v} type="button" disabled={holat !== ""} onClick={() => (v === "13" ? togri() : xato())}
              className="clay-press rounded-2xl bg-karta py-3 font-display text-[22px] shadow-clay-sm">{v}</button>
          ))}
        </div>
        {holat && <SinovNatija holat={holat} />}
      </div>
    );
  }

  // Son kodlari: "12 · 2" — to'g'ri kartalar 0 va 2.
  const kartalar = ["3 × 4", "2 × 7", "7 + 5", "20 − 9"];
  const TOGRI = [0, 2];
  const bos = (i: number) => {
    if (holat || tanlov.includes(i)) return;
    tebrat("tanlov");
    if (!TOGRI.includes(i)) { xato(); return; }
    const yangi = [...tanlov, i];
    setTanlov(yangi);
    if (yangi.length === 2) togri();
  };
  return (
    <div className="w-full">
      <div className="text-center font-display text-[26px]">12 · 2</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {kartalar.map((k, i) => (
          <button key={k} type="button" onClick={() => bos(i)}
            className={`clay-press rounded-2xl py-4 font-display text-[20px] shadow-clay-sm ${
              tanlov.includes(i) ? "bg-brand-blue text-white" : "bg-karta text-ink"}`}>
            {k}
          </button>
        ))}
      </div>
      {holat && <SinovNatija holat={holat} />}
    </div>
  );
}

const SinovNatija = ({ holat }: { holat: "togri" | "xato" }) => (
  <p role="status" className={`mt-2.5 text-center font-display text-[15px] ${
    holat === "togri" ? "text-brand-green-d" : "text-brand-red"}`}>
    {holat === "togri" ? t("orgZor") : t("orgQayta")}
  </p>
);

/* ------------------------------------------------------------ oyna */

export function Orgatish({ oyin, onYop }: { oyin: XonaOyin; onYop: () => void }) {
  const royxat = qadamlar(oyin);
  const [i, setI] = useState(0);
  const [bajarildi, setBajarildi] = useState(false);
  const sinovda = i === royxat.length;

  useEffect(() => { setBajarildi(false); }, [i]);

  const yop = () => { belgila(oyin); onYop(); };
  const q = royxat[i];

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="dialog" aria-modal="true" aria-label={t("orgQanday")}>
      <div className="az-kirish w-full max-w-[400px] rounded-clay bg-sahna p-5 shadow-clay">
        {/* Qadamlar nuqtasi — qancha qolganini ko'rsatadi. */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {[...royxat, null].map((_, n) => (
              <span key={n} className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-brand-blue" : "w-1.5 bg-track"}`} />
            ))}
          </div>
          <button type="button" onClick={yop} className="py-1 text-[13px] font-semibold text-ink-dim">
            {t("orgOtkazish")}
          </button>
        </div>

        {!sinovda ? (
          <div key={i} className="az-kirish mt-4 flex min-h-[300px] flex-col items-center text-center">
            <EmojiBelgi e={q.emoji} olcham={52} />
            <h2 className="mt-2 text-[21px] leading-tight">{t(q.sarlavha)}</h2>
            <p className="mt-1.5 text-[14px] leading-snug text-ink-soft">{t(q.matn)}</p>
            <div className="mt-5 flex flex-1 items-center justify-center">{q.misol}</div>
          </div>
        ) : (
          <div className="az-kirish mt-4 flex min-h-[300px] flex-col items-center text-center">
            <h2 className="text-[19px] leading-tight">{t("orgSinab")}</h2>
            <p className="mt-1 mb-3 text-[13px] text-ink-soft">
              {t(oyin === "kartalar" ? "orgK4M" : oyin === "royale" ? "orgR4M" : "orgD4M")}
            </p>
            <Sinov oyin={oyin} onBajarildi={() => setBajarildi(true)} />
          </div>
        )}

        {!sinovda ? (
          <button type="button" onClick={() => setI(i + 1)}
            className="tugma-3d mt-4 w-full rounded-3xl bg-brand-blue py-3.5 font-display text-[17px] text-white
                       shadow-[0_5px_0_var(--color-brand-blue-d)]">
            {t("orgKeyingi")}
          </button>
        ) : (
          <button type="button" onClick={yop} data-tahlil={`O'rgatish tugadi (${oyin})`}
            className={`tugma-3d mt-4 w-full rounded-3xl py-3.5 font-display text-[17px] ${bajarildi
              ? "az-yaltir bg-brand-green text-white shadow-[0_5px_0_var(--color-brand-green-d)]"
              : "bg-karta text-ink-soft shadow-clay-sm"}`}>
            {t("orgOynaymiz")}
          </button>
        )}
      </div>
    </div>
  );
}
