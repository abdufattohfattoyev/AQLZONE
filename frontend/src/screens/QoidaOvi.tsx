/**
 * QOIDA OVI — ekran (`lib/oyin/qoida.ts`).
 *
 * Tepada darvoza: ✓ o'tganlar va ✗ o'tmaganlar. Pastda olti son — qaysi
 * biri o'tishini belgilab "Tekshirish". Xato bo'lsa, faqat XATO belgilangan
 * sonlar qizarib silkinadi — qolgani joyida qoladi, odam qayta o'ylaydi.
 * Ikki xatodan keyin "Qoidani ko'rish" chiqadi (bu raund ballsiz).
 *
 * Bir o'yin — 8 savol, oson qoidalardan qiyinga (`bosqichi`). Ball:
 * birinchi tekshirishda — 3, ikkinchisida — 2, keyin — 1.
 */
import { useMemo, useState } from "react";
import { MantiqSarlavha, Qanday, Yulduzlar, oqi, yoz } from "../components/oyin/MantiqQobiq";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { til } from "../lib/til";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { useProgress } from "../lib/progress";
import { RAUND, bosqichi, savolYasa, tasodif } from "../lib/oyin/qoida";
import type { Savol } from "../lib/oyin/qoida";

const KALIT = "az-qoida-ovi";

interface Xotira { rekord: number; oyinlar: number; qandayKorildi: boolean }
const BOSH: Xotira = { rekord: 0, oyinlar: 0, qandayKorildi: false };

/** O'yinlar ro'yxati kartasi uchun. */
export function qoidaRekord(): number {
  return oqi<Xotira>(KALIT, BOSH).rekord;
}

export function QoidaOvi({ onChiq }: { onChiq: () => void }) {
  useOrqaga(onChiq);
  const { oyinTugadi } = useProgress();
  const [xotira, setXotira] = useState<Xotira>(() => oqi(KALIT, BOSH));
  const [urug, setUrug] = useState(() => Math.floor(Math.random() * 1e9));
  const savollar = useMemo<Savol[]>(() => {
    const r = tasodif(urug);
    const nat: Savol[] = [];
    for (let i = 0; i < RAUND; i++) nat.push(savolYasa(bosqichi(i), r, nat[i - 1]?.qoida.id));
    return nat;
  }, [urug]);

  const [idx, setIdx] = useState(0);
  const [tanlov, setTanlov] = useState<boolean[]>(() => Array(6).fill(false));
  const [tekshiruv, setTekshiruv] = useState(0);
  const [xatolar, setXatolar] = useState<Set<number>>(new Set());
  const [hal, setHal] = useState<"" | "togri" | "ochildi">("");
  const [ball, setBall] = useState(0);
  const [tugadi, setTugadi] = useState(false);
  const [qanday, setQanday] = useState(() => !oqi(KALIT, BOSH).qandayKorildi);
  const [tanga, setTanga] = useState(0);
  const uz = til() !== "ru";

  const s = savollar[idx];

  const bos = (i: number) => {
    if (hal) return;
    tebrat("tanlov");
    setXatolar(new Set());
    setTanlov((x) => x.map((v, j) => (j === i ? !v : v)));
  };

  const tekshir = () => {
    if (hal) return;
    const xato = new Set<number>();
    s.javob.forEach((j, i) => { if (j !== tanlov[i]) xato.add(i); });
    const n = tekshiruv + 1;
    setTekshiruv(n);
    if (xato.size === 0) {
      tebrat("togri");
      setHal("togri");
      setBall((b) => b + (n === 1 ? 3 : n === 2 ? 2 : 1));
    } else {
      tebrat("xato");
      setXatolar(xato);
    }
  };

  const och = () => {
    tebrat("tanlov");
    setTanlov([...s.javob]);
    setXatolar(new Set());
    setHal("ochildi");
  };

  const keyingi = () => {
    if (idx + 1 < RAUND) {
      setIdx(idx + 1);
      setTanlov(Array(6).fill(false));
      setTekshiruv(0);
      setXatolar(new Set());
      setHal("");
      return;
    }
    tebrat("yutuq");
    // Tanga — ballning uchdan biri (eng ko'pi 8). Har o'yin yangi savollar,
    // ya'ni qayta o'ynash haqiqiy mashq — tanga cheklanmaydi.
    const yangiTanga = Math.max(1, Math.round(ball / 3));
    setTanga(yangiTanga);
    oyinTugadi(yangiTanga, RAUND);
    const x = { ...xotira, rekord: Math.max(xotira.rekord, ball), oyinlar: xotira.oyinlar + 1 };
    setXotira(x);
    yoz(KALIT, x);
    setTugadi(true);
  };

  const qaytaBoshla = () => {
    setUrug(Math.floor(Math.random() * 1e9));
    setIdx(0);
    setTanlov(Array(6).fill(false));
    setTekshiruv(0);
    setXatolar(new Set());
    setHal("");
    setBall(0);
    setTugadi(false);
  };

  const maks = RAUND * 3;

  if (tugadi) {
    const yul = ball >= maks * 0.85 ? 3 : ball >= maks * 0.55 ? 2 : 1;
    return (
      <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col gap-3 px-3.5 pt-4 pb-6 sm:max-w-[520px]">
        <MantiqSarlavha nom={t("qoidaOvi")} izoh={t("qoidaNatijaIzoh")} onChiq={onChiq} />
        <div className="az-kirish mt-6 flex flex-col items-center gap-2 rounded-clay bg-karta p-5 text-center shadow-clay">
          <Yulduzlar n={yul} />
          <div className="font-display text-[34px] leading-none tabular-nums">{ball}<span className="text-[18px] text-ink-dim"> / {maks}</span></div>
          <p className="text-[14px] text-ink-soft">{t("qoidaRekord", { n: Math.max(xotira.rekord, ball) })}</p>
          <span className="flex items-center gap-1.5 rounded-full bg-brand-gold/16 px-3 py-1 font-display text-[14px]
                           font-bold text-brand-gold-d">
            <span aria-hidden className="size-3.5 rounded-full bg-brand-gold" />+{tanga}
          </span>
          <div className="mt-2 flex w-full gap-2">
            <button type="button" onClick={onChiq}
              className="clay-press min-h-11 flex-1 rounded-3xl bg-track font-display text-[15px] text-ink-soft">
              {t("mqChiqish")}
            </button>
            <button type="button" onClick={qaytaBoshla} data-tahlil="Qoida ovi: yana"
              className="tugma-3d min-h-11 flex-[1.4] rounded-3xl bg-brand-blue font-display text-[15px] text-white
                         shadow-[0_4px_0_var(--color-brand-blue-d)]">
              {t("mqYana")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col gap-3 px-3.5 pt-4 pb-6 sm:max-w-[520px]">
      <MantiqSarlavha nom={t("qoidaOvi")} onChiq={onChiq} onYordam={() => setQanday(true)}
        izoh={t("qoidaSavol", { n: idx + 1, jami: RAUND, ball })} />

      {/* Raund chizig'i — 8 bo'lak. */}
      <div className="flex gap-1">
        {Array.from({ length: RAUND }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${
            i < idx ? "bg-brand-green" : i === idx ? "bg-brand-blue" : "bg-track"}`} />
        ))}
      </div>

      {/* ---- darvoza ---- */}
      <div key={idx} className="az-kirish flex flex-col gap-2.5 rounded-clay bg-karta p-3.5 shadow-clay-sm">
        <div className="text-center font-display text-[16px]">{t("qoidaDarvoza")}</div>
        <Misollar sonlar={s.otdi} otdi />
        <Misollar sonlar={s.otmadi} otdi={false} />
        {hal && (
          <p className="rounded-2xl bg-sahna px-3 py-2 text-center text-[14px] leading-snug shadow-ichki">
            {t("qoidaQoidasi")}: <b>{uz ? s.qoida.nom[0] : s.qoida.nom[1]}</b>
          </p>
        )}
      </div>

      <p className="text-center text-[13.5px] text-ink-soft">
        {hal === "togri" ? t("qoidaTopdingiz") : hal === "ochildi" ? t("qoidaOchildi") : t("qoidaBelgilang")}
      </p>

      {/* ---- belgilanadigan sonlar ---- */}
      <div className="grid grid-cols-3 gap-2.5">
        {s.sonlar.map((n, i) => {
          const tanlangan = tanlov[i];
          const xato = xatolar.has(i);
          const ochiqJavob = hal !== "";
          return (
            <button key={`${idx}-${i}`} type="button" onClick={() => bos(i)} aria-pressed={tanlangan}
              data-tahlil="Qoida ovi: son"
              className={`clay-press relative grid h-16 place-items-center rounded-2xl font-display text-[26px] tabular-nums
                          shadow-clay-sm transition-colors ${xato ? "az-silkin" : ""} ${
                ochiqJavob
                  ? (s.javob[i] ? "bg-brand-green text-white" : "bg-karta text-ink-dim")
                  : xato ? "bg-brand-red text-white"
                  : tanlangan ? "bg-brand-blue text-white" : "bg-karta text-ink"}`}>
              {n}
              {tanlangan && !ochiqJavob && !xato && (
                <span className="absolute top-1.5 right-1.5"><Icon name="check" size={14} /></span>
              )}
            </button>
          );
        })}
      </div>

      {hal ? (
        <button type="button" onClick={keyingi} data-tahlil="Qoida ovi: keyingi"
          className="tugma-3d mt-1 min-h-12 rounded-3xl bg-brand-blue font-display text-[16px] text-white
                     shadow-[0_4px_0_var(--color-brand-blue-d)]">
          {idx + 1 < RAUND ? t("mqKeyingi") : t("qoidaYakun")}
        </button>
      ) : (
        <>
          <button type="button" onClick={tekshir} disabled={!tanlov.some(Boolean)} data-tahlil="Qoida ovi: tekshirish"
            className="tugma-3d mt-1 min-h-12 rounded-3xl bg-brand-blue font-display text-[16px] text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)] disabled:opacity-50">
            {t("qoidaTekshir")}
          </button>
          {tekshiruv >= 2 && (
            <button type="button" onClick={och} data-tahlil="Qoida ovi: qoidani ko'rish"
              className="min-h-11 self-center text-[14px] font-bold text-brand-blue-t">
              {t("qoidaKorish")}
            </button>
          )}
        </>
      )}

      {qanday && (
        <Qanday sarlavha={t("qoidaOvi")} qatorlar={[t("qoidaQ1"), t("qoidaQ2"), t("qoidaQ3")]}
          onYop={() => {
            setQanday(false);
            setXotira((x) => { const y = { ...x, qandayKorildi: true }; yoz(KALIT, y); return y; });
          }} />
      )}
    </div>
  );
}

function Misollar({ sonlar, otdi }: { sonlar: number[]; otdi: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex w-[92px] shrink-0 items-center gap-1 text-[13px] font-bold ${
        otdi ? "text-brand-green-d" : "text-ink-dim"}`}>
        <Icon name={otdi ? "check" : "close"} size={16} />
        {otdi ? t("qoidaOtdi") : t("qoidaOtmadi")}
      </span>
      <div className="flex flex-1 gap-1.5">
        {sonlar.map((n) => (
          <span key={n} className={`grid h-11 flex-1 place-items-center rounded-xl font-display text-[19px] tabular-nums ${
            otdi ? "bg-brand-green/14 text-brand-green-d ring-1 ring-brand-green/40" : "bg-sahna text-ink-soft shadow-ichki"}`}>
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
