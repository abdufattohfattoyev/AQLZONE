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
import { nazariya, tolaq } from "../lib/nazariya";
import type { Matn, Misol } from "../lib/nazariya";
import { t } from "../lib/matn";
import { til } from "../lib/til";
import { kursMatn } from "../lib/tarjima/kurs";
import { yo } from "../lib/tarjima/yechim";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { courseById } from "../lib/curriculum";
import { darajasi } from "../lib/ozlashtirish";
import type { Daraja } from "../lib/ozlashtirish";
import { asoslar } from "../lib/asos";

/** "3-bob. Kvadrat tenglamalar" → "Kvadrat tenglamalar" (ikkala tilda). */
const bobsiz = (s: string) => kursMatn(s).replace(/^\d+-bob\.\s*|^Глава \d+\.\s*/, "");

const juft = (x: Matn) => (typeof x === "string" ? x : til() === "ru" ? x[1] : x[0]);

export function Mavzu({ kurs, ui, ochiq, imtihon, onMashq, onAsos, onChiq }: {
  kurs: Course;
  ui: number;
  /** Qaysi dars ochiq kelsin — imtihonda xato qilingani. */
  ochiq?: number;
  /** Imtihondan kelinganda — nechta xato va qancha ball yo'qotilgan. */
  imtihon?: { xato: number; ball: string };
  onMashq: () => void;
  /** Asos mavzuga o'tish (`lib/asos.ts`). */
  onAsos: (kursId: string, ui: number) => void;
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

      <DarajaKarta d={darajasi(kurs.id, ui)} />
      <Asoslar kursId={kurs.id} ui={ui} onAsos={onAsos} />

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

const DARAJA_NOM = ["mavzuD0", "mavzuD1", "mavzuD2", "mavzuD3"] as const;
const DARAJA_KEYINGI = ["mavzuK0", "mavzuK1", "mavzuK2", "mavzuK3"] as const;

/**
 * O'ZLASHTIRISH DARAJASI (`lib/ozlashtirish.ts`) — to'rt pog'ona va
 * keyingisiga nima qilish kerakligi. Odam o'sishini ko'rsin: mashqdan
 * keyin shu sahifaga qaytganda pog'ona ko'tarilgan bo'ladi.
 */
function DarajaKarta({ d }: { d: Daraja | undefined }) {
  const son = d === undefined ? 0 : d + 1;
  return (
    <div className="rounded-clay bg-karta p-4 shadow-clay-sm" role="group" aria-label={t("mavzuDaraja")}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12.5px] font-bold tracking-[0.05em] text-ink-dim uppercase">{t("mavzuDaraja")}</span>
        <span className="font-display text-[15px]">{d === undefined ? t("mavzuDYoq") : t(DARAJA_NOM[d])}</span>
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-1.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-2 rounded-full ${i < son ? "bg-brand-blue" : "bg-track"}`} />
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-4 gap-1.5 text-center text-[11px] leading-tight text-ink-dim">
        {DARAJA_NOM.map((k, i) => (
          <span key={k} className={i === d ? "font-bold text-ink" : ""}>{t(k)}</span>
        ))}
      </div>
      <p className="mt-2.5 text-[13.5px] leading-snug text-ink-soft">{t(DARAJA_KEYINGI[d ?? 0])}</p>
    </div>
  );
}

/**
 * ASOS MAVZULAR (`lib/asos.ts`) — bu bob tayanadigan oldingi boblar.
 * Hali "Bilaman" ga yetmaganlari yuqorida turadi va sarlavha "avval
 * shularni" deydi: qoqilishning sababi ko'pincha o'sha yerda.
 */
function Asoslar({ kursId, ui, onAsos }: { kursId: string; ui: number; onAsos: (kursId: string, ui: number) => void }) {
  const r = asoslar(kursId, ui).flatMap(({ kursId: k, ui: u }) => {
    const c = courseById(k);
    return c?.units[u] ? [{ k, u, c, d: darajasi(k, u) }] : [];
  }).sort((a, b) => Number((a.d ?? -1) >= 2) - Number((b.d ?? -1) >= 2));
  if (!r.length) return null;
  const zaif = r.some((x) => (x.d ?? -1) < 2);
  return (
    <section className="rounded-clay bg-karta p-4 shadow-clay-sm">
      <h2 className="font-display text-[16px] leading-tight">{t(zaif ? "mavzuAsosAvval" : "mavzuAsos")}</h2>
      <p className="mt-1 text-[13px] leading-snug text-ink-dim">{t("mavzuAsosIzoh")}</p>
      <div className="mt-3 flex flex-col gap-2">
        {r.map(({ k, u, c, d }) => (
          <button key={`${k}|${u}`} type="button" onClick={() => { tebrat("tanlov"); onAsos(k, u); }}
            data-tahlil="Mavzu: asos mavzu"
            className="clay-press flex min-h-[52px] w-full items-center gap-3 rounded-2xl bg-sahna px-3.5 py-2 text-left">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-bold">{bobsiz(c.units[u].u)}</span>
              <span className="block truncate text-[12.5px] text-ink-dim">{kursMatn(c.title)}</span>
            </span>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${
              (d ?? -1) >= 2 ? "bg-brand-blue/12 text-brand-blue-t" : "bg-track text-ink-soft"}`}>
              {d === undefined ? t("mavzuDYoq") : t(DARAJA_NOM[d])}
            </span>
            <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
          </button>
        ))}
      </div>
    </section>
  );
}

/** Bitta dars: sarlavha (bosiladi), ochilganda — qoida, formulalar, e'tibor, namuna. */
function DarsKarta({ kursId, L, ochiq, onBos }: { kursId: string; L: Lesson; ochiq: boolean; onBos: () => void }) {
  const n = nazariya(kursId, L.n);
  const T = tolaq(kursId, L.n);
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
        <div className="flex flex-col gap-4 px-4 pb-4 min-[400px]:px-5">
          {n && <p className="text-[15.5px] leading-relaxed font-semibold">{juft(n.q)}</p>}

          {T?.t && (
            <Bolim nom={t("mavzuTushuncha")}>
              {T.t.map((b, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <h3 className="font-display text-[15px] leading-tight">{juft(b.h)}</h3>
                  <p className="text-[14.5px] leading-relaxed text-ink-soft">{juft(b.p)}</p>
                </div>
              ))}
            </Bolim>
          )}

          {T?.f ? (
            <Bolim nom={t("mavzuFormulalar")}>
              <div className="grid gap-2 min-[520px]:grid-cols-2">
                {T.f.map((f, i) => (
                  <div key={i} className="min-w-0 rounded-2xl bg-sahna px-3.5 py-2.5 shadow-ichki">
                    <div className="text-[12px] font-semibold text-ink-dim">{juft(f.n)}</div>
                    <div className="mt-0.5 font-display text-[15.5px] leading-snug break-words">{f.f}</div>
                  </div>
                ))}
              </div>
            </Bolim>
          ) : n?.f && n.f.length > 0 && (
            <div className="flex flex-col gap-1.5 rounded-2xl bg-sahna px-3.5 py-3 shadow-ichki">
              {n.f.map((f, i) => (
                <div key={i} className="font-display text-[16px] leading-snug break-words">{juft(f)}</div>
              ))}
            </div>
          )}

          {T?.s && (
            <Bolim nom={t("mavzuQadamlar")}>
              <ol className="flex flex-col gap-2">
                {T.s.map((q, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-blue/15
                                     font-display text-[12px] text-brand-blue-t">{i + 1}</span>
                    <span className="min-w-0 flex-1 text-[14.5px] leading-snug">{juft(q)}</span>
                  </li>
                ))}
              </ol>
            </Bolim>
          )}

          {T?.m && (
            <Bolim nom={t("mavzuMisol")}>
              {T.m.map((m, i) => <MisolKarta key={i} n={i + 1} m={m} />)}
            </Bolim>
          )}

          {(T?.x ?? (n?.e ? [n.e] : [])).length > 0 && (
            <Bolim nom={t("mavzuXatolar")}>
              <ul className="flex flex-col gap-2">
                {(T?.x ?? (n?.e ? [n.e] : [])).map((x, i) => (
                  <li key={i} className="flex gap-2.5 text-[14px] leading-snug text-ink-soft">
                    <Icon name="izoh" size={18} className="mt-0.5 shrink-0 text-brand-blue-t" />
                    <span className="min-w-0 flex-1">{juft(x)}</span>
                  </li>
                ))}
              </ul>
            </Bolim>
          )}

          <Namuna L={L} />
        </div>
      )}
    </section>
  );
}

/** Dars ichidagi bo'lim: sarlavha va tarkib. */
function Bolim({ nom, children }: { nom: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 border-t border-track pt-3.5 first:border-t-0 first:pt-0">
      <div className="text-[12.5px] font-bold tracking-[0.05em] text-ink-dim uppercase">{nom}</div>
      {children}
    </div>
  );
}

/**
 * Qo'lda yechilgan misol. Yechim birdaniga ochilmaydi: har bosishda
 * BITTA qadam (Khan Academy'dagi maslahatlar kabi) — odam har qadamdan
 * keyin o'zi davom ettirib ko'rsin. Oxirgi qadamdan keyin javob chiqadi.
 */
function MisolKarta({ n, m }: { n: number; m: Misol }) {
  const [ochiq, setOchiq] = useState(0);
  const tugadi = ochiq >= m.y.length;
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl bg-sahna p-3.5 shadow-ichki">
      <div className="flex gap-2.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-track font-display text-[12px] text-ink-soft">{n}</span>
        <p className="min-w-0 flex-1 text-[14.5px] leading-snug font-semibold">{juft(m.s)}</p>
      </div>
      {ochiq > 0 && (
        <ol className="flex flex-col gap-1.5 border-l-2 border-brand-blue/30 pl-3">
          {m.y.slice(0, ochiq).map((q, i) => (
            <li key={i} className="az-savol font-display text-[14.5px] leading-snug break-words">{juft(q)}</li>
          ))}
        </ol>
      )}
      {tugadi ? (
        <div className="flex items-baseline gap-2 rounded-xl bg-brand-green/15 px-3 py-2">
          <Icon name="check" size={16} className="shrink-0 self-center text-brand-green-d" />
          <span className="text-[13px] text-ink-dim">{t("mavzuJavob")}:</span>
          <span className="min-w-0 flex-1 font-display text-[15.5px] break-words text-brand-green-d">{m.j}</span>
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={() => { tebrat("tanlov"); setOchiq((x) => x + 1); }} data-tahlil="Mavzu: misol qadami"
            className="clay-press min-h-11 flex-1 rounded-xl bg-track px-3 font-display text-[14.5px] text-ink-soft">
            {ochiq === 0 ? t("mavzuBirinchiQadam") : t("mavzuKeyingiQadam", { a: ochiq, b: m.y.length })}
          </button>
          {ochiq > 0 && (
            <button type="button" onClick={() => { tebrat("tanlov"); setOchiq(m.y.length); }} data-tahlil="Mavzu: misol hammasi"
              className="clay-press min-h-11 shrink-0 rounded-xl px-3 text-[13.5px] font-bold text-brand-blue-t">
              {t("mavzuHammasi")}
            </button>
          )}
        </div>
      )}
    </div>
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
      <div className="text-[12.5px] font-bold tracking-[0.05em] text-ink-dim uppercase">{t("mavzuMustaqil")}</div>
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
