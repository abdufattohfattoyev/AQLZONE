/**
 * IZDOSH — ekran (`lib/oyin/izdosh.ts`).
 *
 * Maydon, ostida yo'nalish tugmalari va "Kutish". Qo'shni katakni bosib
 * ham yuriladi, kompyuterda — strelkalar va bo'sh joy.
 *
 * Izdoshning KEYINGI qadamlari maydonda kichik nuqtalar bilan ko'rinadi:
 * "4 qadamdan keyin u qayerda" degan savolni bola boshida sanashi kerak,
 * lekin birinchi darajalarda nuqtalar unga o'rganishga yordam beradi.
 *
 * Yulduz: eng qisqa yo'l — 3, biroz uzunroq — 2, yechgan bo'lsa — 1.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { DarajaQatori, Galaba, MantiqSarlavha, Qanday, oqi, yoz } from "../components/oyin/MantiqQobiq";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { til } from "../lib/til";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { useProgress } from "../lib/progress";
import {
  DARAJALAR, izdoshJoyi, maydon, ochiqEshiklar, yur,
} from "../lib/oyin/izdosh";
import type { Yurish } from "../lib/oyin/izdosh";

const KALIT = "az-izdosh";

interface Xotira { ochiq: number; yulduz: Record<number, number>; joriy: number; qandayKorildi: boolean }

const BOSH: Xotira = { ochiq: 0, yulduz: {}, joriy: 0, qandayKorildi: false };

/** O'yinlar ro'yxati kartasi uchun: nechta daraja o'tilgan. */
export function izdoshOtilgan(): number {
  return Object.keys(oqi<Xotira>(KALIT, BOSH).yulduz).length;
}

const yulduzHisobi = (n: number, eng: number) => (n <= eng ? 3 : n <= eng + 4 ? 2 : 1);

export function Izdosh({ onChiq }: { onChiq: () => void }) {
  useOrqaga(onChiq);
  const { oyinTugadi } = useProgress();
  const [xotira, setXotira] = useState<Xotira>(() => oqi(KALIT, BOSH));
  const [joriy, setJoriy] = useState(() => Math.min(oqi(KALIT, BOSH).joriy, oqi(KALIT, BOSH).ochiq));
  const d = DARAJALAR[joriy];
  const m = useMemo(() => maydon(d), [d]);
  const [yol, setYol] = useState<number[]>([m.bosh]);
  const [yurishlar, setYurishlar] = useState<Yurish[]>([]);
  const [silkin, setSilkin] = useState(0);
  const [maslahat, setMaslahat] = useState(true);
  const [qanday, setQanday] = useState(() => !oqi(KALIT, BOSH).qandayKorildi);
  const [tanga, setTanga] = useState(0);

  const oyinchi = yol[yol.length - 1];
  const izdosh = izdoshJoyi(yol, d.kech);
  const yutdi = oyinchi === m.chiqish;
  const ochiq = ochiqEshiklar(m, oyinchi, izdosh);
  const uz = til() !== "ru";

  const boshla = useCallback((i: number) => {
    const mm = maydon(DARAJALAR[i]);
    setJoriy(i);
    setYol([mm.bosh]);
    setYurishlar([]);
    setMaslahat(true);
    setTanga(0);
    setXotira((x) => { const y = { ...x, joriy: i }; yoz(KALIT, y); return y; });
  }, []);

  const qadam = useCallback((y: Yurish) => {
    if (yutdi) return;
    const j = yur(m, yol, d.kech, y);
    if (j === null) { tebrat("xato"); setSilkin((s) => s + 1); return; }
    tebrat("tanlov");
    setMaslahat(false);
    const yangi = [...yol, j];
    setYol(yangi);
    const yangiYur = [...yurishlar, y];
    setYurishlar(yangiYur);
    if (j === m.chiqish) {
      tebrat("yutuq");
      const yul = yulduzHisobi(yangiYur.length, d.engQisqa);
      const eski = xotira.yulduz[joriy] ?? 0;
      // Tanga faqat YANGI yulduz uchun: bir darajani qayta-qayta o'ynab tanga yig'ilmasin.
      const yangiTanga = Math.max(0, yul - eski) * 3;
      setTanga(yangiTanga);
      if (yangiTanga > 0) oyinTugadi(yangiTanga, 1);
      const x: Xotira = {
        ...xotira,
        ochiq: Math.max(xotira.ochiq, Math.min(joriy + 1, DARAJALAR.length - 1)),
        yulduz: { ...xotira.yulduz, [joriy]: Math.max(eski, yul) },
      };
      setXotira(x);
      yoz(KALIT, x);
    }
  }, [yutdi, m, yol, d, yurishlar, xotira, joriy, oyinTugadi]);

  const ortga = () => {
    if (yol.length <= 1 || yutdi) return;
    tebrat("tanlov");
    setYol(yol.slice(0, -1));
    setYurishlar(yurishlar.slice(0, -1));
  };

  // Kompyuter klaviaturasi: strelkalar, bo'sh joy — kutish, Backspace — ortga.
  useEffect(() => {
    const bos = (e: KeyboardEvent) => {
      const k: Record<string, Yurish> = {
        ArrowUp: "u", ArrowDown: "d", ArrowLeft: "l", ArrowRight: "r", " ": "w",
      };
      if (k[e.key]) { e.preventDefault(); qadam(k[e.key]); }
      else if (e.key === "Backspace") { e.preventDefault(); ortga(); }
    };
    window.addEventListener("keydown", bos);
    return () => window.removeEventListener("keydown", bos);
  });

  // Izdoshning keyingi `kech` qadami — siz bosib o'tgan, u hali bormagan kataklar.
  const keladi = new Set(yol.slice(Math.max(0, yol.length - d.kech)));
  keladi.delete(oyinchi);

  const katakBos = (i: number) => {
    const dy = Math.floor(i / m.en) - Math.floor(oyinchi / m.en);
    const dx = (i % m.en) - (oyinchi % m.en);
    if (i === oyinchi) qadam("w");
    else if (Math.abs(dy) + Math.abs(dx) === 1) qadam(dy === -1 ? "u" : dy === 1 ? "d" : dx === -1 ? "l" : "r");
  };

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col gap-3 px-3.5 pt-4 pb-6 sm:max-w-[520px]">
      <MantiqSarlavha nom={t("izdosh")} onChiq={onChiq} onYordam={() => setQanday(true)}
        izoh={`${joriy + 1}/${DARAJALAR.length} · ${uz ? d.nom[0] : d.nom[1]}`} />
      <DarajaQatori jami={DARAJALAR.length} joriy={joriy} ochiq={xotira.ochiq}
        otilgan={(i) => (xotira.yulduz[i] ?? 0) > 0} onTanla={boshla} />

      <div className="flex items-center justify-between gap-2 text-[13px] font-semibold text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-full border-2 border-dashed border-brand-blue bg-brand-blue/25" />
          {t("izdoshKech", { n: d.kech })}
        </span>
        <span className="tabular-nums">{t("izdoshYurish", { n: yurishlar.length, eng: d.engQisqa })}</span>
      </div>

      {maslahat && !yutdi && (
        <p className="rounded-2xl bg-sahna px-3.5 py-2.5 text-[13.5px] leading-snug text-ink-soft shadow-ichki">
          {uz ? d.maslahat[0] : d.maslahat[1]}
        </p>
      )}

      {/* ---- maydon ---- */}
      <div className="flex justify-center">
        <div key={silkin} className={`grid gap-1 rounded-clay bg-track p-1.5 ${silkin ? "az-silkin" : ""}`}
          style={{ gridTemplateColumns: `repeat(${m.en}, min(46px, calc((100vw - 52px) / ${m.en})))` }}>
          {m.hujayra.map((c, i) => (
            <Katak key={i} c={c} oyinchi={i === oyinchi} izdosh={i === izdosh && i !== oyinchi}
              izdoshUstida={i === izdosh && i === oyinchi} keladi={keladi.has(i)}
              ochiq={c >= "A" && c <= "C" && (ochiq.has(c) || i === oyinchi)}
              bosilgan={c >= "a" && c <= "c" && (i === oyinchi || i === izdosh)}
              onBos={() => katakBos(i)} />
          ))}
        </div>
      </div>

      {yutdi ? (
        <Galaba sarlavha={t("izdoshChiqdingiz")} yulduz={yulduzHisobi(yurishlar.length, d.engQisqa)} tanga={tanga}
          izoh={t("izdoshNatija", { n: yurishlar.length, eng: d.engQisqa })}
          keyingi={joriy + 1 < DARAJALAR.length ? t("mqKeyingi") : t("mqTamom")}
          onKeyingi={() => (joriy + 1 < DARAJALAR.length ? boshla(joriy + 1) : onChiq())}
          onQayta={() => boshla(joriy)} />
      ) : (
        <>
          {/* ---- boshqaruv: yo'nalishlar va kutish ---- */}
          <div className="mx-auto grid grid-cols-3 gap-1.5" aria-label={t("izdoshBoshqaruv")}>
            <span />
            <Tugma on={() => qadam("u")} nom={t("izdoshYuqori")}><Icon name="chevron" size={22} className="-rotate-90" /></Tugma>
            <span />
            <Tugma on={() => qadam("l")} nom={t("izdoshChap")}><Icon name="chevron" size={22} className="rotate-180" /></Tugma>
            <Tugma on={() => qadam("w")} nom={t("izdoshKutish")} kichikYozuv>{t("izdoshKutish")}</Tugma>
            <Tugma on={() => qadam("r")} nom={t("izdoshOng")}><Icon name="chevron" size={22} /></Tugma>
            <span />
            <Tugma on={() => qadam("d")} nom={t("izdoshPast")}><Icon name="chevron" size={22} className="rotate-90" /></Tugma>
            <span />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={ortga} disabled={yol.length <= 1}
              className="clay-press min-h-11 flex-1 rounded-3xl bg-karta font-display text-[14.5px] text-ink-soft shadow-clay-sm
                         disabled:opacity-40">
              ↶ {t("izdoshOrtga")}
            </button>
            <button type="button" onClick={() => boshla(joriy)} disabled={yol.length <= 1}
              className="clay-press min-h-11 flex-1 rounded-3xl bg-karta font-display text-[14.5px] text-ink-soft shadow-clay-sm
                         disabled:opacity-40">
              {t("mqBoshidan")}
            </button>
          </div>
        </>
      )}

      {qanday && (
        <Qanday sarlavha={t("izdosh")} qatorlar={[t("izdoshQ1"), t("izdoshQ2"), t("izdoshQ3"), t("izdoshQ4")]}
          onYop={() => {
            setQanday(false);
            setXotira((x) => { const y = { ...x, qandayKorildi: true }; yoz(KALIT, y); return y; });
          }} />
      )}
    </div>
  );
}

function Tugma({ on, nom, children, kichikYozuv }: {
  on: () => void; nom: string; children: React.ReactNode; kichikYozuv?: boolean;
}) {
  return (
    <button type="button" onClick={on} aria-label={nom} data-tahlil={`Izdosh: ${nom}`}
      className={`clay-press grid h-12 w-[72px] place-items-center rounded-2xl bg-karta text-ink shadow-clay-sm
                  ${kichikYozuv ? "font-display text-[13px] text-ink-soft" : ""}`}>
      {children}
    </button>
  );
}

function Katak({ c, oyinchi, izdosh, izdoshUstida, keladi, ochiq, bosilgan, onBos }: {
  c: string; oyinchi: boolean; izdosh: boolean; izdoshUstida: boolean; keladi: boolean;
  ochiq: boolean; bosilgan: boolean; onBos: () => void;
}) {
  if (c === "#") return <span aria-hidden className="aspect-square rounded-lg bg-track" />;
  const tugma = c >= "a" && c <= "c";
  const eshik = c >= "A" && c <= "C";
  return (
    <button type="button" onClick={onBos} tabIndex={-1}
      className={`relative grid aspect-square place-items-center rounded-lg ${
        eshik && !ochiq ? "bg-sahna shadow-ichki" : "bg-karta"}`}>
      {c === "E" && <EmojiBelgi e="🚩" olcham={26} />}
      {tugma && (
        <span className={`grid size-[62%] place-items-center rounded-full border-2 font-display text-[12px] ${
          bosilgan ? "border-brand-green bg-brand-green/20 text-brand-green-d" : "border-ink-dim/50 text-ink-dim"}`}>
          {c.toUpperCase()}
        </span>
      )}
      {eshik && (
        <span className={`grid size-[78%] place-items-center rounded-md font-display text-[12px] ${
          ochiq ? "border-2 border-dashed border-brand-green/70 text-brand-green-d" : "bg-ink/70 text-karta"}`}>
          {ochiq ? c : <Icon name="lock" size={14} />}
        </span>
      )}
      {keladi && !oyinchi && !izdosh && (
        <span aria-hidden className="absolute size-1.5 rounded-full bg-brand-blue/55" />
      )}
      {izdosh && (
        <span aria-label={t("izdosh")}
          className="absolute size-[58%] rounded-full border-2 border-dashed border-brand-blue bg-brand-blue/25 transition-all" />
      )}
      {oyinchi && (
        <span aria-label={t("izdoshSiz")}
          className={`absolute grid size-[64%] place-items-center rounded-full bg-brand-blue shadow-clay-sm transition-all ${
            izdoshUstida ? "ring-2 ring-brand-blue/40 ring-offset-2 ring-offset-karta" : ""}`}>
          <span className="size-[36%] rounded-full bg-white/85" />
        </span>
      )}
    </button>
  );
}
