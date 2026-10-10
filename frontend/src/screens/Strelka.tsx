/**
 * STRELKA YO'LI — ekran (`lib/oyin/strelka.ts`).
 *
 * Strelkani bosish — uni soat yo'nalishida 90° buradi. Faqat BITTA strelka
 * o'zgartiriladi: boshqasini bossangiz, oldingisi o'z holiga qaytadi (shunda
 * qoida o'z-o'zidan ko'rinadi, alohida ogohlantirish kerak emas).
 * "Yurgizish" — shar katakma-katak yuradi; yetmasa, qayerda adashgani
 * ko'rinib turadi va "Qaytadan" bilan yana urinish mumkin.
 *
 * Yulduz: birinchi urinish — 3, ikkinchisi — 2, keyin — 1. Uch xatodan
 * keyin "Maslahat" — qaysi strelkani burish kerakligini ko'rsatadi
 * (yo'nalishini emas).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { DarajaQatori, Galaba, MantiqSarlavha, Qanday, oqi, yoz } from "../components/oyin/MantiqQobiq";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { useProgress } from "../lib/progress";
import { YONLAR, daraja, yurgiz } from "../lib/oyin/strelka";
import type { Natija, Yon } from "../lib/oyin/strelka";

const KALIT = "az-strelka";

interface Xotira { ochiq: number; yulduz: Record<number, number>; joriy: number; qandayKorildi: boolean }
const BOSH: Xotira = { ochiq: 0, yulduz: {}, joriy: 0, qandayKorildi: false };

/** Darajalar qatorida ko'rinadigani — keyingilari o'tilgach qo'shilib boradi. */
const KORINADI = 30;

/** O'yinlar ro'yxati kartasi uchun: nechta daraja o'tilgan. */
export function strelkaOtilgan(): number {
  return Object.keys(oqi<Xotira>(KALIT, BOSH).yulduz).length;
}

const BURCHAK: Record<Yon, number> = { u: -90, r: 0, d: 90, l: 180 };
const keyingiYon = (y: Yon): Yon => YONLAR[(YONLAR.indexOf(y) + 1) % 4];

export function Strelka({ onChiq }: { onChiq: () => void }) {
  useOrqaga(onChiq);
  const { oyinTugadi } = useProgress();
  const [xotira, setXotira] = useState<Xotira>(() => oqi(KALIT, BOSH));
  const [joriy, setJoriy] = useState(() => Math.min(oqi(KALIT, BOSH).joriy, oqi(KALIT, BOSH).ochiq));
  const d = useMemo(() => daraja(joriy + 1), [joriy]);
  /** O'zgartirilgan strelka: qaysi katak va hozirgi yo'nalishi. */
  const [ozgar, setOzgar] = useState<{ katak: number; yon: Yon } | null>(null);
  const [urinish, setUrinish] = useState(0);
  const [natija, setNatija] = useState<Natija | null>(null);
  const [qadam, setQadam] = useState(0);
  const [yuryapti, setYuryapti] = useState(false);
  const [maslahat, setMaslahat] = useState(false);
  const [qanday, setQanday] = useState(() => !oqi(KALIT, BOSH).qandayKorildi);
  const [tanga, setTanga] = useState(0);
  const taymer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearInterval(taymer.current), []);

  const strelka = useMemo(
    () => (ozgar ? { ...d.strelka, [ozgar.katak]: ozgar.yon } : d.strelka), [d, ozgar]);
  const shar = natija ? natija.yol[Math.min(qadam, natija.yol.length - 1)] : d.bosh;
  const tugadi = natija !== null && qadam >= natija.yol.length - 1;
  const yutdi = tugadi && natija?.tur === "yetdi";
  const ozJami = Math.min(Math.max(xotira.ochiq + 1, 10), KORINADI);
  const otganYol = natija ? new Set(natija.yol.slice(0, qadam + 1)) : new Set<number>();

  const boshla = (i: number) => {
    window.clearInterval(taymer.current);
    setJoriy(i);
    setOzgar(null);
    setUrinish(0);
    setNatija(null);
    setQadam(0);
    setYuryapti(false);
    setMaslahat(false);
    setTanga(0);
    setXotira((x) => { const y = { ...x, joriy: i }; yoz(KALIT, y); return y; });
  };

  const bur = (katak: number) => {
    if (yuryapti || yutdi || !d.strelka[katak]) return;
    tebrat("tanlov");
    setNatija(null);
    setQadam(0);
    if (ozgar && ozgar.katak === katak) {
      const y = keyingiYon(ozgar.yon);
      setOzgar(y === d.strelka[katak] ? null : { katak, yon: y });
    } else {
      // Boshqa strelka — oldingisi o'z holiga qaytadi (faqat bittasi o'zgaradi).
      setOzgar({ katak, yon: keyingiYon(d.strelka[katak]) });
    }
  };

  const yurgizish = () => {
    if (yuryapti) return;
    tebrat("tanlov");
    const n = yurgiz(d, strelka);
    const u = urinish + 1;
    setUrinish(u);
    setNatija(n);
    setQadam(0);
    setYuryapti(true);
    let q = 0;
    window.clearInterval(taymer.current);
    taymer.current = window.setInterval(() => {
      q++;
      setQadam(q);
      if (q >= n.yol.length - 1) {
        window.clearInterval(taymer.current);
        setYuryapti(false);
        if (n.tur === "yetdi") {
          tebrat("yutuq");
          const yul = u === 1 ? 3 : u === 2 ? 2 : 1;
          const eski = xotira.yulduz[joriy] ?? 0;
          const yangiTanga = Math.max(0, yul - eski) * 2;
          setTanga(yangiTanga);
          if (yangiTanga > 0) oyinTugadi(yangiTanga, 1);
          const x: Xotira = {
            ...xotira, ochiq: Math.max(xotira.ochiq, joriy + 1),
            yulduz: { ...xotira.yulduz, [joriy]: Math.max(eski, yul) },
          };
          setXotira(x);
          yoz(KALIT, x);
        } else {
          tebrat("xato");
        }
      }
    }, 170);
  };

  const qaytadan = () => {
    setNatija(null);
    setQadam(0);
  };

  const yulduzSoni = urinish === 1 ? 3 : urinish === 2 ? 2 : 1;

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col gap-3 px-3.5 pt-4 pb-6 sm:max-w-[520px]">
      <MantiqSarlavha nom={t("strelka")} onChiq={onChiq} onYordam={() => setQanday(true)}
        izoh={t("strelkaIzohSatr", { n: joriy + 1, u: urinish })} />
      <DarajaQatori jami={ozJami} joriy={joriy} ochiq={xotira.ochiq}
        otilgan={(i) => (xotira.yulduz[i] ?? 0) > 0} onTanla={boshla} />

      <p className="text-center text-[13.5px] leading-snug text-ink-soft">
        {yutdi ? t("strelkaYetdi")
          : tugadi && natija?.tur === "chiqdi" ? t("strelkaChiqdi")
          : tugadi && natija?.tur === "aylandi" ? t("strelkaAylandi")
          : ozgar ? t("strelkaBurildi") : t("strelkaYoriq")}
      </p>

      {/* ---- maydon ---- */}
      <div className="flex justify-center">
        <div className="grid gap-1 rounded-clay bg-track p-1.5"
          style={{ gridTemplateColumns: `repeat(${d.en}, min(54px, calc((100vw - 52px) / ${d.en})))` }}>
          {Array.from({ length: d.en * d.boy }, (_, i) => {
            const y = strelka[i];
            const ozgargan = ozgar?.katak === i;
            const maslahatda = maslahat && i === d.yechim.katak;
            return (
              <button key={i} type="button" onClick={() => bur(i)} disabled={!d.strelka[i]}
                aria-label={y ? t("strelkaKatak") : undefined}
                className={`relative grid aspect-square place-items-center rounded-lg ${
                  otganYol.has(i) && i !== shar ? "bg-brand-blue/15" : "bg-karta"} ${
                  ozgargan ? "ring-2 ring-brand-blue" : maslahatda ? "ring-2 ring-brand-gold" : ""}`}>
                {i === d.yulduz && <EmojiBelgi e="⭐" olcham={28} />}
                {y && (
                  <span className={`grid place-items-center transition-transform duration-200 ${ozgargan ? "text-brand-blue" : "text-ink"}`}
                    style={{ transform: `rotate(${BURCHAK[y]}deg)` }}>
                    <Icon name="chevron" size={24} />
                  </span>
                )}
                {i === d.bosh && !y && i !== shar && (
                  <span aria-hidden className="absolute size-2 rounded-full bg-ink-dim/50" />
                )}
                {i === shar && (
                  <span className={`absolute grid size-[56%] place-items-center rounded-full shadow-clay-sm ${
                    tugadi && !yutdi ? "bg-brand-red" : "bg-brand-blue"}`}>
                    {/* Boshlanishda shar qaysi tomonga ketishini ko'rsatadi. */}
                    {!natija && (
                      <span className="grid place-items-center text-white" style={{ transform: `rotate(${BURCHAK[d.boshYon]}deg)` }}>
                        <Icon name="chevron" size={14} />
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {yutdi ? (
        <Galaba sarlavha={t("strelkaBarakalla")} yulduz={yulduzSoni} tanga={tanga}
          izoh={t("strelkaNatija", { n: urinish })} keyingi={t("mqKeyingi")}
          onKeyingi={() => boshla(joriy + 1)} onQayta={() => boshla(joriy)} />
      ) : tugadi ? (
        <div className="flex flex-col gap-2">
          <button type="button" onClick={qaytadan} data-tahlil="Strelka: qaytadan"
            className="tugma-3d min-h-12 rounded-3xl bg-brand-blue font-display text-[16px] text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("strelkaQaytadan")}
          </button>
          {urinish >= 3 && !maslahat && (
            <button type="button" onClick={() => { setMaslahat(true); qaytadan(); }} data-tahlil="Strelka: maslahat"
              className="min-h-11 self-center text-[14px] font-bold text-brand-blue-t">
              {t("strelkaMaslahat")}
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={() => setOzgar(null)} disabled={!ozgar || yuryapti}
            className="clay-press min-h-12 flex-1 rounded-3xl bg-karta font-display text-[14.5px] text-ink-soft shadow-clay-sm
                       disabled:opacity-40">
            {t("mqBoshidan")}
          </button>
          <button type="button" onClick={yurgizish} disabled={yuryapti} data-tahlil="Strelka: yurgizish"
            className="tugma-3d min-h-12 flex-[1.6] rounded-3xl bg-brand-blue font-display text-[16px] text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)] disabled:opacity-60">
            ▶ {t("strelkaYurgiz")}
          </button>
        </div>
      )}

      {qanday && (
        <Qanday sarlavha={t("strelka")} qatorlar={[t("strelkaQ1"), t("strelkaQ2"), t("strelkaQ3")]}
          onYop={() => {
            setQanday(false);
            setXotira((x) => { const y = { ...x, qandayKorildi: true }; yoz(KALIT, y); return y; });
          }} />
      )}
    </div>
  );
}
