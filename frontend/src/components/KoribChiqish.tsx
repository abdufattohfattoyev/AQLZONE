/**
 * KO'RIB CHIQISH — DTM yoki sertifikat variantidan keyin HAR BIR savol.
 *
 * ─────────────── NEGA KERAK ───────────────
 *
 * Natija ekrani faqat xato savollarning qisqa ro'yxatini berardi: bir
 * qatorda shart va to'g'ri javob, yechimi bo'lmasa — bosilmaydigan
 * qator. "Nega xato qildim?" degan savolga javob uchun esa odam savolni
 * TO'LIQ ko'rishi kerak: chizmasi, variantlari, o'zi nimani belgilagani
 * va to'g'risi qaysi.
 *
 * Tartib imtihon varag'idagidek, filtr bilan: odatda "Xatolar" ochiladi
 * (ko'rib chiqishning asosiy sababi), "Hammasi" — to'g'ri topganlarini
 * ham tekshirmoqchi bo'lganga.
 *
 * Ranglar: to'g'ri javob — yashil, o'zining xato tanlovi — qizil
 * (ilovada qizil faqat xato uchun). Qolgan variantlar neytral.
 */
import { useMemo, useState } from "react";
import type { BlokSavol } from "../lib/blok";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import { kursMatn } from "../lib/tarjima/kurs";
import { QuestionView, sahnaBor, shartSahnada } from "./QuestionView";
import { Yechim } from "./Yechim";

/** Bitta tekshiriladigan savol (sertifikatning ochiq savolida — a) yoki b) qismi). */
export interface KorishSavol {
  /** "12", sertifikatning ochiq savolida "38a". */
  raqam: string;
  s: BlokSavol;
  togri: boolean;
  berildi: boolean;
  /** Odam nima tanladi yoki yozdi — xom qiymat. */
  sizniki: string;
  /**
   * Tanlov variantlari (harfi bilan). Yo'q bo'lsa — ochiq savol: javob
   * qatorlarda yoziladi.
   */
  variantlar?: { harf: string; qiymat: string }[];
}

type Filtr = "xato" | "hammasi" | "javobsiz";

export function KoribChiqish({ sarlavha, savollar, onYop }: {
  /** "5-variant · DTM" kabi — qaysi urinish ekani. */
  sarlavha: string;
  savollar: KorishSavol[];
  onYop: () => void;
}) {
  const xatolar = savollar.filter((q) => !q.togri && q.berildi).length;
  const javobsiz = savollar.filter((q) => !q.berildi).length;
  const [filtr, setFiltr] = useState<Filtr>(() => (xatolar ? "xato" : javobsiz ? "javobsiz" : "hammasi"));
  const [yechimda, setYechimda] = useState<BlokSavol | null>(null);

  const korinadi = useMemo(() => savollar.filter((q) =>
    filtr === "hammasi" ? true : filtr === "xato" ? !q.togri && q.berildi : !q.berildi), [savollar, filtr]);

  const tugmalar: { f: Filtr; nom: string; n: number }[] = [
    { f: "xato", nom: t("korishXatolar", { n: xatolar }), n: xatolar },
    { f: "javobsiz", nom: t("korishJavobsiz", { n: javobsiz }), n: javobsiz },
    { f: "hammasi", nom: t("korishHammasi", { n: savollar.length }), n: savollar.length },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3 px-4 pt-4 pb-10 min-[360px]:px-[18px]
                    sm:max-w-[560px] kom:max-w-[720px]">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onYop} aria-label={t("yop")} title={t("yop")} data-tahlil="Ko'rib chiqish: yopish"
          className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
          <Icon name="close" size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[20px] leading-tight">{t("korishSarlavha")}</h1>
          <p className="truncate text-[13px] text-ink-dim">{sarlavha}</p>
        </div>
      </div>

      {/* Filtr — nol bo'lgan bo'lim ko'rsatilmaydi ("Javobsiz · 0" shovqin). */}
      <div className="flex flex-wrap gap-2">
        {tugmalar.filter((x) => x.n > 0 || x.f === "hammasi").map((x) => (
          <button key={x.f} type="button" aria-pressed={filtr === x.f}
            onClick={() => { tebrat("tanlov"); setFiltr(x.f); }} data-tahlil={`Ko'rib chiqish: ${x.f}`}
            className={`clay-press min-h-11 rounded-full px-4 text-[14px] font-bold ${
              filtr === x.f ? "bg-brand-blue text-white" : "bg-karta text-ink-soft shadow-clay-sm"}`}>
            {x.nom}
          </button>
        ))}
      </div>

      {korinadi.length === 0 ? (
        <p className="rounded-[20px] bg-karta p-5 text-center text-[14.5px] text-ink-dim shadow-clay-sm">
          {t("korishBosh")}
        </p>
      ) : korinadi.map((q) => (
        <SavolKarta key={q.raqam} q={q} onYechim={() => { tebrat("tanlov"); setYechimda(q.s); }} />
      ))}

      {yechimda?.a.yechim && (
        <Yechim qadamlar={yechimda.a.yechim} javob={String(yechimda.a.answer)} onYop={() => setYechimda(null)} />
      )}
    </div>
  );
}

/** Bitta savol: raqam va mavzu · shart · variantlar yoki javob qatorlari · yechim. */
function SavolKarta({ q, onYechim }: { q: KorishSavol; onYechim: () => void }) {
  const a = q.s.a;
  const togriJavob = String(a.answer);
  const belgi = q.togri ? "bg-brand-green/15 text-brand-green-d"
    : q.berildi ? "bg-brand-red/12 text-brand-red" : "bg-track text-ink-soft";
  const mavzu = kursMatn(q.s.mavzu).replace(/^\d+-bob\.\s*|^Глава \d+\.\s*/, "");

  return (
    <article className="flex flex-col gap-3 rounded-[22px] bg-karta p-4 shadow-clay-sm">
      <header className="flex items-center gap-2.5">
        <span className={`grid h-9 min-w-9 shrink-0 place-items-center rounded-xl px-1.5 font-display text-[15px] font-bold ${belgi}`}>
          {q.raqam}
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink-dim">{mavzu}</span>
        {q.togri && <Icon name="check" size={18} className="shrink-0 text-brand-green-d" />}
      </header>

      {!shartSahnada(a) && <p className="text-[15.5px] leading-snug">{a.prompt}</p>}
      {!sahnaBor(a) && "text" in a && a.text && (
        <p className="font-display text-[19px] leading-tight break-words">{a.text}</p>
      )}
      {sahnaBor(a) && (
        <div className="flex items-center justify-center rounded-[18px] bg-sahna p-3 [&_.font-display]:text-[22px]">
          <QuestionView a={a} />
        </div>
      )}

      {q.variantlar ? (
        <div className="flex flex-col gap-2">
          {q.variantlar.map((v) => {
            const togri = v.qiymat === togriJavob;
            const meniki = q.berildi && v.qiymat === q.sizniki;
            const holat = togri ? "outline-2 outline-brand-green outline-solid bg-brand-green/8"
              : meniki ? "outline-2 outline-brand-red outline-solid bg-brand-red/8" : "bg-sahna";
            return (
              <div key={v.harf} className={`flex min-h-12 items-center gap-3 rounded-[14px] px-3 py-1.5 ${holat}`}>
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg font-display text-[14px] font-bold ${
                  togri ? "bg-brand-green text-white" : meniki ? "bg-brand-red text-white" : "bg-track text-ink-soft"}`}>
                  {v.harf}
                </span>
                <span className="min-w-0 flex-1 font-display text-[17px] leading-tight font-bold break-words">{v.qiymat}</span>
                {togri && <Icon name="check" size={17} className="shrink-0 text-brand-green-d" />}
                {meniki && !togri && <Icon name="close" size={17} className="shrink-0 text-brand-red" />}
              </div>
            );
          })}
          {!q.berildi && <p className="text-[13px] text-ink-dim">{t("korishBerilmagan")}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-1 rounded-[14px] bg-sahna px-3.5 py-2.5 text-[14.5px]">
          <span className={q.togri ? "text-brand-green-d" : q.berildi ? "text-brand-red" : "text-ink-dim"}>
            {q.berildi ? t("korishSizniki", { j: q.sizniki }) : t("korishBerilmagan")}
          </span>
          {!q.togri && <span className="font-bold text-brand-green-d">{t("korishTogri", { j: togriJavob })}</span>}
        </div>
      )}

      {a.yechim && (
        <button type="button" onClick={onYechim} data-tahlil="Ko'rib chiqish: yechim"
          className="clay-press flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-brand-blue/10
                     px-4 text-[14.5px] font-bold text-brand-blue-t">
          <Icon name="puzzle" size={17} />
          {t("korishYechim")}
        </button>
      )}
    </article>
  );
}
