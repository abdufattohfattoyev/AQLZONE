/**
 * Bosh sahifa: AI reja bo'yicha BUGUNGI ish (`lib/aiReja.ts`).
 *
 * Nega: AI reja ilgari faqat suhbatdagi matn edi — abituriyent o'qib,
 * yopib, unutardi. Endi har kuni bosh sahifada o'sha kunning mavzulari
 * turadi va har birida ikki qadam: avval AI tushuntiradi (chizma bilan),
 * keyin o'sha mavzudan 10 ta savol. 60% dan kam bo'lsa — vazifa ertaga
 * yana chiqadi ("kechagi" belgisi bilan).
 *
 * Reja yo'q (yoki kirmagan) — karta umuman chiqmaydi: ishlamaydigan
 * narsani ko'rsatish shovqin. Ranglar: firuza — keyingi qadam, yashil —
 * bajarilgan, amber yo'q (mukofot emas).
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiBoshla } from "../lib/ai";
import { otdimi, rejaDars, rejaOl, VAZIFA_SAVOL } from "../lib/aiReja";
import type { RejaBugun, RejaIsh } from "../lib/aiReja";
import { xatoKodi } from "../lib/api";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import { yolAiSuhbat, yolPremium, yolRejaVazifa } from "../lib/yollar";

export function AiRejaBugun() {
  const nav = useNavigate();
  const [r, setR] = useState<RejaBugun | null>(null);
  const [band, setBand] = useState<string | null>(null);

  useEffect(() => {
    let tirik = true;
    rejaOl().then((x) => { if (tirik) setR(x); }).catch(() => {});
    return () => { tirik = false; };
  }, []);

  if (!r) return null;

  /** Dars: bor bo'lsa — o'sha suhbat, yo'q bo'lsa server yaratadi. Premiumsiz — Premium sahifasi. */
  const tushuntir = async (i: RejaIsh) => {
    tebrat("tanlov");
    if (i.dars) { nav(yolAiSuhbat(i.dars)); return; }
    setBand(i.kalit);
    try {
      const s = await rejaDars(i.kalit);
      nav(yolAiSuhbat(s.id));
    } catch (e) {
      if (xatoKodi(e) === 403) nav(yolPremium());
    } finally {
      setBand(null);
    }
  };

  const yangiReja = async () => {
    tebrat("tanlov");
    setBand("reja");
    const x = await aiBoshla("reja");
    setBand(null);
    nav(x.ok ? yolAiSuhbat(x.qiymat.id) : yolPremium());
  };

  if (r.tugadi && !r.ishlar.length) {
    return (
      <section className="flex flex-col gap-2 rounded-[22px] bg-karta p-4 shadow-clay-sm" aria-label={t("rejaTugadi")}>
        <h2 className="font-display text-[18px]">{t("rejaTugadi")}</h2>
        <p className="text-[14px] leading-snug text-ink-soft">{t("rejaTugadiIzoh")}</p>
        <button type="button" onClick={yangiReja} disabled={band === "reja"} data-tahlil="Bugun: AI reja yangi"
          className="clay-press min-h-11 self-start rounded-xl bg-brand-blue/10 px-4 text-[14.5px] font-bold
                     text-brand-blue-t disabled:opacity-60">
          {t("rejaYangi")}
        </button>
      </section>
    );
  }

  const jami = r.ishlar.length * 2;
  const qilingan = r.ishlar.reduce((s, i) => s + (i.dars ? 1 : 0) + (otdimi(i.vazifa) ? 1 : 0), 0);
  const tayyor = qilingan === jami;
  const sarlavha = t("rejaSarlavha", { n: Math.min(r.kun, r.jami) });

  return (
    <section aria-label={sarlavha} className="flex flex-col gap-3 rounded-[22px] bg-karta p-4 shadow-clay-sm">
      <div className="flex items-baseline gap-2">
        <h2 className="min-w-0 flex-1 font-display text-[18px]">{sarlavha}</h2>
        <span className={`shrink-0 font-display text-[15px] font-bold ${tayyor ? "text-brand-green-d" : "text-ink-dim"}`}>
          {qilingan}/{jami}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-track">
        <div className={`h-full rounded-full ${tayyor ? "bg-brand-green" : "bg-brand-blue"}`}
          style={{ width: `${(qilingan / Math.max(1, jami)) * 100}%` }} />
      </div>

      <ul className="flex flex-col divide-y divide-track">
        {r.ishlar.map((i) => {
          const otdi = otdimi(i.vazifa);
          return (
            <li key={i.kalit} className="flex flex-col gap-2 py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-baseline gap-2">
                <span className={`min-w-0 flex-1 text-[15px] font-bold leading-snug ${
                  otdi ? "text-ink-dim line-through decoration-2" : ""}`}>
                  {i.mavzu}
                </span>
                {i.otgan && <span className="shrink-0 text-[12px] font-bold text-ink-dim">{t("rejaQarz")}</span>}
                {i.daqiqa > 0 && <span className="shrink-0 text-[12.5px] text-ink-dim">{i.daqiqa}′</span>}
              </div>
              {!otdi && (
                <div className="grid grid-cols-2 gap-2">
                  <Qadam bajarildi={Boolean(i.dars)} band={band === i.kalit} keyingi={!i.dars}
                    matn={t("rejaTushuntirish")} on={() => tushuntir(i)} tahlil="Bugun: AI reja tushuntirish" />
                  <Qadam bajarildi={false} keyingi={Boolean(i.dars)}
                    matn={i.vazifa ? t("rejaQayta", { a: i.vazifa[0], b: i.vazifa[1] }) : t("rejaVazifa", { n: VAZIFA_SAVOL })}
                    on={() => { tebrat("tanlov"); nav(yolRejaVazifa(i.kalit, i.slug)); }} tahlil="Bugun: AI reja vazifa" />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {tayyor && <p className="text-[14px] leading-snug text-brand-green-d">{t("rejaHammasi")}</p>}
    </section>
  );
}

/**
 * Ishning bitta qadami. Navbatdagisi — och firuza (ko'z shunga tushsin),
 * bajarilgani — yashil belgi, qolgani — neytral. Hammasi bosiladi:
 * tushuntirishni o'tkazib vazifaga o'tish ham mumkin.
 */
function Qadam({ matn, bajarildi, keyingi, band = false, on, tahlil }: {
  matn: string; bajarildi: boolean; keyingi: boolean; band?: boolean; on: () => void; tahlil: string;
}) {
  return (
    <button type="button" onClick={on} disabled={band} data-tahlil={tahlil}
      className={`clay-press flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-2 text-[13.5px] font-bold
                  disabled:opacity-60 ${keyingi ? "bg-brand-blue/10 text-brand-blue-t" : "bg-track text-ink-soft"}`}>
      {bajarildi && <Icon name="check" size={15} className="shrink-0 text-brand-green-d" />}
      <span className="truncate">{matn}</span>
    </button>
  );
}
