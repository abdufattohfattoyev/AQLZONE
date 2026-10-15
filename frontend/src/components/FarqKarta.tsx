/**
 * DTM natijasining asosiy kartasi: ball, o'rtacha ball va "ballar qayerda".
 *
 * Nega ball: foiz abituriyentga hech narsa demaydi, DTM esa ball bilan
 * o'lchaydi. Nega O'RTACHA: bitta natijada omad ham, charchoq ham bor —
 * oxirgi beshtaning o'rtachasi haqiqatga yaqin va aynan shu son o'sib
 * borishi kerak. Ilgari bu yerda "maqsad" so'ralardi (fan, keyin ball) —
 * ortiqcha qadam edi, egasi o'rniga doim o'rtachani ko'rsatishni so'radi.
 *
 * "Bu ballar qayerda" HAMMAGA ochiq: muammoni ko'rmagan odam yechimga
 * pul to'lamaydi. Pul YECHIM uchun — "AI reja" (`core/ai.py`, `reja`).
 *
 * Ball — DTM ning birinchi mutaxassislik fani hisobi: 30 savol × 3,1.
 * Ilova faqat matematikani tekshiradi, shuning uchun umumiy 189 lik
 * ball "bashorat" qilinmaydi — boshqa fanlarni bilmay bu yolg'on bo'lardi.
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiBoshla, aiHolat, aiXatoMatni } from "../lib/ai";
import type { AiHolat, AiXatoKod } from "../lib/ai";
import { DTM_MAVZULAR } from "../lib/dtmMavzu";
import { natijalar } from "../lib/imtihon";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import { sahifaYoz } from "../lib/tahlil";
import { yolAiSuhbat, yolPremium } from "../lib/yollar";

/** Birinchi mutaxassislik fanining bitta savoli. */
const SAVOL_BALL = 3.1;
/** Kartani ko'rish hodisasi — serverdagi `tahlil.FARQ_KORISH` bilan bir xil. */
const FARQ_KORISH = "/imtihon/:id/natija";
/** Eng ko'p ball olib ketgan uchta mavzu — qolgani "Ko'rib chiqish" da. */
const QATOR = 3;

/** 58,9 — o'zbekcha va ruscha ikkalasida vergul. */
const ball = (x: number) => String(Math.round(x * 10) / 10).replace(".", ",");

export interface FarqMavzu {
  nom: string;
  kursId: string;
  ui: number;
  /** Xato + ulgurmagan — shu bobda yo'qotilgan savollar. */
  yoqotgan: number;
}

/**
 * Boblarni DTM mavzulariga (`lib/dtmMavzu.ts`) yig'adi. Variantda har
 * bobdan ko'pincha bitta savol tushadi — bob bo'yicha ro'yxatda hamma
 * qator "+3,1" bo'lib, hech narsa demasdi. "Trigonometriya +9,3" esa
 * qayerga vaqt sarflashni aytadi. Ro'yxatda yo'q bob — o'z nomi bilan.
 */
function guruhla(mavzular: FarqMavzu[]): { nom: string; yoqotgan: number }[] {
  const m = new Map<string, { nom: string; yoqotgan: number }>();
  for (const x of mavzular) {
    if (x.yoqotgan <= 0) continue;
    const d = DTM_MAVZULAR.find((d) => d.boblar.some(([k, ui]) => k === x.kursId && ui === x.ui));
    const kalit = d?.slug ?? `${x.kursId}|${x.ui}`;
    const bor = m.get(kalit) ?? { nom: d ? t(d.nom) : x.nom, yoqotgan: 0 };
    bor.yoqotgan += x.yoqotgan;
    m.set(kalit, bor);
  }
  return [...m.values()].sort((a, b) => b.yoqotgan - a.yoqotgan);
}

/**
 * Oxirgi beshta urinishning o'rtacha bali — SHU urinish bilan birga.
 * Natija qurilmaga yozilishi bilan karta chizilishi orasida tartib
 * kafolatlanmagan, shuning uchun shu urinish ro'yxatdan (oxirgi 2
 * daqiqadagi bir xil natija) olib tashlanadi va qo'lda qo'shiladi.
 */
function ortacha(togri: number, jami: number): { ball: number; urinish: number } {
  const hozir = Date.now();
  let topildi = false;
  const oldingi = natijalar().filter((n) => {
    if (!topildi && n.togri === togri && n.jami === jami && hozir - n.vaqt < 120_000) {
      topildi = true;
      return false;
    }
    return true;
  });
  const besh = [{ togri, jami }, ...oldingi].slice(0, 5);
  const jamiBall = besh.reduce((s, n) => s + (n.togri / Math.max(1, n.jami)) * 30 * SAVOL_BALL, 0);
  return { ball: jamiBall / besh.length, urinish: oldingi.length + 1 };
}

export function FarqKarta({ togri, jami, mavzular }: { togri: number; jami: number; mavzular: FarqMavzu[] }) {
  const nav = useNavigate();
  const [h, setH] = useState<AiHolat | null>(null);
  const [band, setBand] = useState(false);
  const [xato, setXato] = useState<AiXatoKod | null>(null);
  // Bir marta: keyingi chizishlarda ro'yxat o'zgarsa ham raqam sakramasin.
  const [ort] = useState(() => ortacha(togri, jami));
  const qatorlar = useMemo(() => guruhla(mavzular).slice(0, QATOR), [mavzular]);

  useEffect(() => {
    // Kartani KO'RGANLAR — panelda Premium voronkasining boshi. Natija
    // serverga yetib bormasa ham (internet, kirmagan sayt) ko'rish
    // yoziladi; ilgari ko'rganlar faqat server natijasidan sanalardi.
    sahifaYoz(FARQ_KORISH);
    let tirik = true;
    aiHolat().then((x) => { if (tirik) setH(x); }).catch(() => {});
    return () => { tirik = false; };
  }, []);

  const max = jami * SAVOL_BALL;
  const hozir = togri * SAVOL_BALL;

  /** AI reja. Premium ham, sinov ham tugagan bo'lsa — Premium sahifasi. */
  const reja = async () => {
    tebrat("tanlov");
    if (!h?.ochiq) { nav(yolPremium()); return; }
    setBand(true);
    setXato(null);
    const r = await aiBoshla("reja", {
      matn: t("farqRejaMatn", {
        hozir: ball(hozir), max: ball(max), ortacha: ball(ort.ball),
        mavzular: qatorlar.map((m) => `${m.nom} (+${ball(m.yoqotgan * SAVOL_BALL)})`).join(", "),
      }),
    });
    setBand(false);
    if (r.ok) nav(yolAiSuhbat(r.qiymat.id));
    else if (r.kod === "premium") nav(yolPremium());
    else setXato(r.kod);
  };

  // Odatiy holat (Premium) belgisiz; faqat sinov va uning tugagani aytiladi.
  const holat = !h || h.premium ? "" : h.ochiq ? t("aiBepulQolgan", { n: h.bepul_qolgan }) : t("aiPremiumda");

  return (
    <section className="az-savol rounded-clay bg-karta p-5 shadow-clay" aria-label={t("farqSarlavha")}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-[40px] leading-none">
          {ball(hozir)} <span className="text-[16px] text-ink-dim">/ {ball(max)}</span>
        </span>
        {/* Birinchi urinishda o'rtacha = shu natija — ko'rsatish shovqin. */}
        {ort.urinish > 1 && (
          <span className="text-right text-[13px] leading-tight text-ink-dim">
            {t("farqOrtacha")}
            <b className="block font-display text-[18px] text-ink">{ball(ort.ball)}</b>
          </span>
        )}
      </div>

      {/* Chiziq: firuza — shu natija, ingichka belgi — o'rtacha. */}
      <div className="relative mt-3 h-2.5 rounded-full bg-track">
        <div className="h-full rounded-full bg-brand-blue" style={{ width: `${Math.min(100, (hozir / max) * 100)}%` }} />
        {ort.urinish > 1 && (
          <div className="absolute -top-1 h-[18px] w-[3px] rounded-full bg-ink"
            style={{ left: `calc(${Math.min(100, (ort.ball / max) * 100)}% - 1.5px)` }} />
        )}
      </div>
      <div className="mt-2 text-[13px] text-ink-dim">{t("blokNatija", { a: togri, b: jami })}</div>

      {qatorlar.length > 0 && (
        <>
          <div className="mt-4 mb-1.5 font-display text-[15px]">{t("farqQayerda")}</div>
          <ul className="space-y-1.5">
            {qatorlar.map((m, i) => (
              <li key={i} className="flex items-center gap-2 text-[14px]">
                <span className="min-w-0 flex-1 truncate">{m.nom}</span>
                <span className="shrink-0 font-display text-brand-blue-t">+{ball(m.yoqotgan * SAVOL_BALL)}</span>
              </li>
            ))}
          </ul>

          {xato && <p className="mt-3 text-[13.5px] text-brand-red" role="alert">{aiXatoMatni(xato)}</p>}
          {/* AI o'chiq bo'lsa (kalit yo'q) tugma yo'q — ishlamaydigan
              narsani reklama qilmaymiz; mashq tugmasi pastda bor. */}
          {h?.yoqilgan && (
            <>
              <button type="button" onClick={reja} disabled={band} data-tahlil="DTM: farq AI reja"
                className="clay-press mt-3 min-h-11 w-full rounded-xl bg-brand-blue/10 px-4 text-[14.5px] font-bold
                           text-brand-blue-t disabled:opacity-60">
                {band ? t("aiYozyapti") : t("farqReja")}
              </button>
              {holat && <p className="mt-1.5 text-center text-[12.5px] text-ink-dim">{holat}</p>}
            </>
          )}
        </>
      )}
    </section>
  );
}
