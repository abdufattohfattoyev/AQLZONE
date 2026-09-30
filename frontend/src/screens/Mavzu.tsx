/**
 * MAVZU SAHIFASI — bitta bob: qoida, yechilgan namuna va mashq.
 *
 * ─────────────────────── NEGA KERAK ───────────────────────
 *
 * Imtihon natijasidagi "zaif mavzu" ilgari to'g'ridan-to'g'ri DARSGA
 * olib borardi. Ikki muammo bor edi:
 *
 *   1. Dars yopiq bo'lsa (8-sinf kursini hali boshlamagan abituriyent),
 *      manzil kurs xaritasiga qaytarardi — odam "hech narsa bo'lmadi"
 *      deb o'ylardi.
 *   2. Ochiq bo'lsa ham dars qoidani tushuntirmaydi, faqat yana misol
 *      beradi. Qoidani bilmay xato qilgan odam yana taxmin qiladi.
 *
 * Endi tartib o'qituvchinikidek: avval QOIDA (`lib/nazariya.ts`), keyin
 * YECHILGAN NAMUNA (darsning o'z generatoridan, qadamlari bilan), oxirida
 * MASHQ (faqat shu bobdan, `Blok` — xato bo'lsa yechim ko'rsatiladi).
 *
 * Sahifa dars qulfiga BOG'LANMAGAN: u o'qish uchun, yulduz yoki
 * progressga hech narsa yozmaydi.
 *
 * ─────────────────────── TUZILISHI ───────────────────────
 *
 * Bobdagi har dars — yig'iladigan karta. Hammasi ochiq tursa, olti
 * darsli bob telefonda o'nlab ekran bo'lardi. Birinchisi (yoki imtihonda
 * xato qilingani, `?dars=`) ochiq keladi.
 */
import { useMemo, useState } from "react";
import { Icon } from "../lib/icons";
import { QuestionView, sahnaBor, shartSahnada } from "../components/QuestionView";
import type { Activity } from "../lib/activity";
import type { Course } from "../lib/curriculum";
import type { Lesson } from "../lib/types";
import { nazariya } from "../lib/nazariya";
import type { Juft } from "../lib/nazariya";
import { t } from "../lib/matn";
import { til } from "../lib/til";
import { kursMatn } from "../lib/tarjima/kurs";
import { yo } from "../lib/tarjima/yechim";
import { tebrat, useOrqaga } from "../lib/qobiq";

/** "3-bob. Kvadrat tenglamalar" → "Kvadrat tenglamalar" (ikkala tilda). */
const bobsiz = (s: string) => kursMatn(s).replace(/^\d+-bob\.\s*|^Глава \d+\.\s*/, "");

const juft = (x: string | Juft) => (typeof x === "string" ? x : til() === "ru" ? x[1] : x[0]);

export function Mavzu({ kurs, ui, ochiq, imtihon, onMashq, onChiq }: {
  kurs: Course;
  ui: number;
  /** Qaysi dars ochiq kelsin — imtihonda xato qilingani. */
  ochiq?: number;
  /** Imtihondan kelinganda — nechta xato va qancha ball yo'qotilgan. */
  imtihon?: { xato: number; ball: string };
  onMashq: () => void;
  onChiq: () => void;
}) {
  const U = kurs.units[ui];
  const strelka = useOrqaga(onChiq);

  // Takrorlash darslari chiqmaydi: ular bir nechta darsning aralashmasi
  // va har biri bu yerda allaqachon alohida tushuntirilgan.
  const darslar = U.lessons.map((L, li) => ({ L, li })).filter(({ L }) => !L.review && L.gens.length > 0);
  const [ochiqLi, setOchiqLi] = useState<number | null>(
    () => (ochiq !== undefined && darslar.some((d) => d.li === ochiq) ? ochiq : darslar[0]?.li ?? null));

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3 px-4 pb-32 min-[360px]:px-[18px] sm:max-w-[560px]">
      <div className="sticky top-0 z-20 -mx-4 flex min-h-[60px] items-center gap-2.5 bg-[var(--az-body)] px-4 py-2
                      min-[360px]:-mx-[18px] min-[360px]:px-[18px]">
        {strelka && (
          <button type="button" onClick={onChiq} aria-label={t("ortga")} title={t("ortga")} data-tahlil="Mavzu: orqaga"
            className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[19px] leading-tight">{bobsiz(U.u)}</h1>
          <p className="truncate text-[12.5px] text-ink-dim">{kursMatn(kurs.title)}</p>
        </div>
      </div>

      {/* Bobning bir gaplik mazmuni — dastur mualliflari yozgan kirish. */}
      <div className="rounded-clay bg-karta p-4 shadow-clay-sm">
        <p className="font-display text-[16px] leading-snug">{kursMatn(U.intro.t)}</p>
        <p className="mt-1 text-[14.5px] leading-snug text-ink-soft">{kursMatn(U.intro.d)}</p>
        {imtihon && (
          <p className="mt-2 text-[13px] font-semibold text-ink-dim">
            {imtihon.ball ? t("mavzuImtihonda", { n: imtihon.xato, b: imtihon.ball }) : t("mavzuTestda", { n: imtihon.xato })}
          </p>
        )}
      </div>

      {darslar.map(({ L, li }) => (
        <DarsKarta key={li} kursId={kurs.id} L={L} ochiq={ochiqLi === li}
          onBos={() => { tebrat("tanlov"); setOchiqLi(ochiqLi === li ? null : li); }} />
      ))}

      {/* Yagona asosiy tugma — pastda qotib turadi: qoidani o'qigan odam
          mashqqa o'tish uchun sahifa oxirini qidirmasin. */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-[var(--az-body)]/95 px-4 pt-2
                      pb-[max(14px,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <button type="button" onClick={() => { tebrat("tanlov"); onMashq(); }} data-tahlil="Mavzu: mashq"
          className="tugma-3d mx-auto flex min-h-[56px] w-full max-w-[430px] flex-col items-center justify-center
                     rounded-2xl bg-brand-blue px-4 text-white shadow-[0_4px_0_var(--color-brand-blue-d)] sm:max-w-[524px]">
          <span className="font-display text-[17px] leading-tight font-bold">{t("mavzuMashq")}</span>
          <span className="text-[12.5px] opacity-85">{t("mavzuMashqIzoh")}</span>
        </button>
      </div>
    </div>
  );
}

/** Bitta dars: sarlavha (bosiladi), ochilganda — qoida, formulalar, e'tibor, namuna. */
function DarsKarta({ kursId, L, ochiq, onBos }: { kursId: string; L: Lesson; ochiq: boolean; onBos: () => void }) {
  const n = nazariya(kursId, L.n);
  return (
    <section className="overflow-hidden rounded-clay bg-karta shadow-clay-sm">
      <button type="button" onClick={onBos} aria-expanded={ochiq} data-tahlil="Mavzu: dars"
        className="flex min-h-[56px] w-full items-center gap-3 px-4 text-left">
        <span className="min-w-0 flex-1 font-display text-[16px] leading-tight">
          {kursMatn(L.n).split(" · ")[0]}
        </span>
        <Icon name="chevron" size={18} className={`shrink-0 text-ink-dim transition-transform ${ochiq ? "-rotate-90" : "rotate-90"}`} />
      </button>

      {ochiq && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {n && (
            <>
              <p className="text-[15px] leading-snug">{juft(n.q)}</p>
              {n.f && n.f.length > 0 && (
                <div className="flex flex-col gap-1.5 rounded-2xl bg-sahna px-3.5 py-3 shadow-ichki">
                  {n.f.map((f, i) => (
                    <div key={i} className="font-display text-[16px] leading-snug break-words">{juft(f)}</div>
                  ))}
                </div>
              )}
              {n.e && (
                <div className="flex gap-2.5 text-[14px] leading-snug text-ink-soft">
                  <Icon name="izoh" size={18} className="mt-0.5 shrink-0 text-brand-blue-t" />
                  <span><b className="text-ink">{t("mavzuEtibor")}: </b>{juft(n.e)}</span>
                </div>
              )}
            </>
          )}
          <Namuna L={L} />
        </div>
      )}
    </section>
  );
}

/**
 * YECHILGAN NAMUNA — darsning o'z generatoridan.
 *
 * Yechim darhol ochilmaydi: odam avval o'zi o'ylab ko'rsin, keyin
 * solishtirsin. "Boshqa namuna" yangi sonlar bilan yana bittasini beradi
 * — qoida bir misolda emas, bir nechtasida tushuniladi.
 */
function Namuna({ L }: { L: Lesson }) {
  const [urug, setUrug] = useState(0);
  const [korildi, setKorildi] = useState(false);
  // Yechimi bor savol izlanadi: namunaning butun ma'nosi — qadamlar.
  const a: Activity = useMemo(() => {
    let x = L.gens[urug % L.gens.length]();
    for (let k = 0; k < 12 && !x.yechim; k++) x = L.gens[(urug + k + 1) % L.gens.length]();
    return x;
  }, [L, urug]);

  return (
    <div className="flex flex-col gap-2.5 border-t border-track pt-3">
      <div className="text-[13px] font-bold tracking-[0.04em] text-ink-dim uppercase">{t("mavzuNamuna")}</div>
      {!shartSahnada(a) && <p className="text-[15px] leading-snug">{a.prompt}</p>}
      {sahnaBor(a) && (
        <div className="flex items-center justify-center rounded-2xl bg-sahna p-3 shadow-ichki [&_.font-display]:text-[22px]">
          <QuestionView a={a} />
        </div>
      )}

      {korildi && a.yechim ? (
        <>
          <ol className="flex flex-col gap-2">
            {a.yechim.map((k, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-track font-display
                                 text-[12px] text-ink-soft">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] leading-snug text-ink-dim">{yo(k.q)}</div>
                  {k.if && <div className="mt-0.5 font-display text-[15px] leading-snug break-words">{k.if}</div>}
                </div>
              </li>
            ))}
          </ol>
          <div className="flex items-center gap-2 rounded-2xl bg-brand-green/15 px-3.5 py-2.5">
            <Icon name="check" size={17} className="shrink-0 text-brand-green-d" />
            <span className="text-[13px] text-ink-dim">{t("yechimJavob")}</span>
            <span className="ml-auto min-w-0 truncate font-display text-[16px] text-brand-green-d">{String(a.answer)}</span>
          </div>
        </>
      ) : (
        <button type="button" onClick={() => { tebrat("tanlov"); setKorildi(true); }} data-tahlil="Mavzu: yechimni ko'rish"
          className="clay-press min-h-11 rounded-2xl bg-track px-4 font-display text-[15px] text-ink-soft">
          {t("korishYechim")}
        </button>
      )}

      {korildi && (
        <button type="button" onClick={() => { tebrat("tanlov"); setUrug((u) => u + 1); setKorildi(false); }}
          data-tahlil="Mavzu: boshqa namuna"
          className="clay-press flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-[14.5px] font-bold
                     text-brand-blue-t">
          <Icon name="repeat" size={17} />
          {t("mavzuBoshqa")}
        </button>
      )}
    </div>
  );
}
