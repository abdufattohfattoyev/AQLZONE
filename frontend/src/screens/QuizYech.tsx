/**
 * QUIZ — yechuvchi tomoni (`lib/quiz.ts`, `core/quiz.py`).
 *
 *   QuizKod    kod yoki havola bilan kelgan odam. Jonli o'yin ochiq bo'lsa —
 *              o'yinga; o'z tezligidagi quiz bo'lsa — boshlash, yechish, natija
 *   QuizJonli  jonli o'yin: boshlovchi (muallif) va ishtirokchi BITTA manzilda,
 *              ekran kim ekaniga qarab boshqacha chiziladi
 *
 * ─────────────── IKKI XIL YECHISH EKRANI ───────────────
 *
 * O'z tezligida — blok test kabi (`Blok.tsx`): umumiy soat, variantlar
 * ustun bo'lib, tanlash va "Keyingisi" alohida — odam o'ylab, fikrini
 * o'zgartira oladi va oldingi savolga qaytadi.
 *
 * Jonli — 2×2 katta tugmalar, bosish = javob. U yerda tezlik ball beradi
 * va har soniya hisobda: "tanla, keyin tasdiqla" qadami bolani faqat
 * sekinlashtirardi.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import { HARFLAR } from "../components/Variantlar";
import { MasalaMatn } from "../components/MasalaMatn";
import { QuestionView, sahnaBor, shartSahnada } from "../components/QuestionView";
import type { Activity, ChoiceKind } from "../lib/activity";
import {
  TAXALLUS_UZUN, javobTayyor, oyinAmal, oyinHolat, oyinJavob, oyinKir, quizKod, quizTopshir, savolQisqa, soat,
} from "../lib/quiz";
import type { Javob, OchiqSavol, Oyin, QuizOchiq, ReytingQator, TogriJavob, Topshiriq } from "../lib/quiz";
import { JavobKorinish, JuftTanla, RostTanla, TartibTanla } from "../components/QuizJavob";
import { ASOSIY, IKKINCHI, JAMOA_BELGI, QOBIQ, Sarlavha, jamoaNomi, quizUlash } from "./Quiz";

/** Jonli o'yin holati shuncha millisekundda bir so'raladi (`xona.py` dagi kabi). */
const SORASH_MS = 1500;

/* ==================== umumiy qismlar ==================== */

/** Variantning o'zi — rang, rasm yoki matn (`Blok.tsx` dagi kabi). */
function VariantMatn({ v, kind, katta = false }: { v: string; kind?: ChoiceKind; katta?: boolean }) {
  if (kind === "rang") {
    return <span className="inline-block size-9 rounded-full outline outline-2 outline-ink/15" style={{ background: v }} />;
  }
  if (kind === "belgi" || kind === "emoji") return <span className="font-display text-[34px] leading-none">{v}</span>;
  return <span className={`break-words ${katta ? "font-display text-[20px]" : "text-[16px]"}`}>{v}</span>;
}

/**
 * Savol sharti. Bazadan olingan savolda — generatorning o'z chizmasi
 * (`QuestionView`): soat, kasr, shakl so'z bilan yozilmaydi.
 */
function Shart({ s, ixcham = false }: { s: OchiqSavol; ixcham?: boolean }) {
  const a = s.a as Activity | undefined;
  if (a) {
    return (
      <div className="flex flex-col gap-3">
        {!shartSahnada(a) && (
          <div className="rounded-clay bg-karta p-4 text-center text-[15px] leading-snug shadow-clay-sm">{s.matn}</div>
        )}
        {sahnaBor(a) && (
          <div className={`grid place-items-center overflow-hidden rounded-clay bg-sahna/85 p-4 ring-1 ring-track ring-inset
                           ${ixcham ? "min-h-[120px]" : "min-h-[160px]"}`}>
            <QuestionView a={a} />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:p-5">
      <MasalaMatn matn={s.matn} katta />
    </div>
  );
}

/**
 * Javob berish qismi — variantdan tashqari turlar uchun (variantni har
 * ekran o'zicha chizadi: o'z tezligida ustun, jonlida 2×2).
 */
function YangiTurJavob({ s, javob, onChange }: { s: OchiqSavol; javob: Javob | null; onChange: (j: Javob | null) => void }) {
  if (s.tur === "rost") {
    return <RostTanla value={typeof javob === "string" ? javob : null} onChange={(v) => onChange(v)} />;
  }
  if (s.tur === "tartib") {
    return <TartibTanla items={s.variantlar} value={Array.isArray(javob) ? javob : []}
      onChange={(v) => onChange(v.length ? v : null)} />;
  }
  if (s.tur === "juftlash") {
    const chap = s.chap ?? [];
    return <JuftTanla chap={chap} ong={s.ong ?? []} value={Array.isArray(javob) ? javob : chap.map(() => "")}
      onChange={(v) => onChange(v.map((x) => x ?? ""))} />;
  }
  return null;
}

/**
 * Javobni ko'rsatish uchun shaklga keltiradi: juftlashda yechuvchining
 * javobi — chap tartibidagi o'nglar ro'yxati, ko'rsatishda esa juftlar.
 */
function korinish(s: OchiqSavol | undefined, j: Javob | TogriJavob | null): Javob | TogriJavob | null {
  if (!s || s.tur !== "juftlash" || !Array.isArray(j) || Array.isArray(j[0])) return j;
  return (s.chap ?? []).map((c, k) => [c, String((j as string[])[k] ?? "")] as [string, string]);
}

const Holat = ({ matn }: { matn: string }) => (
  <p className="py-8 text-center text-[14.5px] text-ink-dim">{matn}</p>
);

/** Shohsupa — birinchi uch o'rin. Faqat amber (mukofot ma'nosi). */
function Shohsupa({ reyting }: { reyting: ReytingQator[] }) {
  const uch = [reyting[1], reyting[0], reyting[2]];
  const boy = ["h-16", "h-24", "h-12"];
  return (
    <div className="flex items-end justify-center gap-2 pt-2">
      {uch.map((r, k) => r ? (
        <div key={r.orin} className="flex w-[30%] max-w-[110px] min-w-0 flex-col items-center gap-1">
          <span className={`w-full truncate text-center text-[13px] ${r.men ? "font-bold text-brand-blue-t" : "text-ink-soft"}`}>
            {r.men ? t("siz") : r.ism}
          </span>
          <span className="font-display text-[13px] text-ink-dim tabular-nums">{r.ball}</span>
          <div className={`grid w-full place-items-center rounded-t-2xl font-display text-[22px] ${boy[k]} ${
            r.orin === 1 ? "bg-brand-gold text-white" : "bg-brand-gold/20 text-brand-gold-d"}`}>
            {r.orin}
          </div>
        </div>
      ) : <div key={k} className="w-[30%] max-w-[110px]" />)}
    </div>
  );
}

function ReytingRoyxat({ reyting, dan = 0 }: { reyting: ReytingQator[]; dan?: number }) {
  const qator = reyting.slice(dan);
  if (!qator.length) return null;
  return (
    <ol className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
      {qator.map((r) => (
        <li key={r.orin} className={`flex min-h-12 items-center gap-3 px-3.5 py-2 ${r.men ? "bg-brand-blue/10" : ""}`}>
          <span className="w-6 shrink-0 text-center font-display text-[14px] text-ink-dim">{r.orin}</span>
          <span className={`min-w-0 flex-1 truncate text-[15px] ${r.men ? "font-bold text-brand-blue-t" : "font-semibold"}`}>
            {r.men ? `${r.ism} · ${t("siz")}` : r.ism}
          </span>
          <span className="shrink-0 font-display text-[16px] tabular-nums">{r.ball}</span>
        </li>
      ))}
    </ol>
  );
}

/* ==================== kod bilan kirish ==================== */

export function QuizKod({ kod, onJonli, onMeniki, onChiq }: {
  kod: string; onJonli: (oid: number) => void; onMeniki: (id: number) => void; onChiq: () => void;
}) {
  const [q, setQ] = useState<QuizOchiq | null | "yoq" | "xato">(null);
  const [bosqich, setBosqich] = useState<"bosh" | "yech" | Topshiriq>("bosh");

  const yukla = useCallback(() => quizKod(kod).then(
    (x) => { setQ(x); return x; },
    (e) => { setQ((e as { kod?: number }).kod === 404 ? "yoq" : "xato"); return null; },
  ), [kod]);

  useEffect(() => { void yukla(); }, [yukla]);

  // Jonli o'yin ochiq — darhol o'yinga. Kodni olgan bola "qayerga
  // bosaman?" deb o'ylab o'tirmasin.
  useEffect(() => {
    if (q && typeof q === "object" && q.jonli) onJonli(q.jonli);
  }, [q, onJonli]);

  // Jonli rejimdagi quiz, o'yin hali ochilmagan — boshlovchini kutamiz.
  const kutish = q && typeof q === "object" && q.rejim === "jonli" && !q.jonli && !q.meniki;
  useEffect(() => {
    if (!kutish) return;
    const id = setInterval(() => { void yukla(); }, 3000);
    return () => clearInterval(id);
  }, [kutish, yukla]);

  if (q === null) return <div className={QOBIQ}><Sarlavha nom={t("quizSarlavhaYech")} onChiq={onChiq} /><Holat matn={t("quizYuklanmoqda")} /></div>;
  if (q === "yoq" || q === "xato") {
    return (
      <div className={QOBIQ}>
        <Sarlavha nom={t("quizSarlavhaYech")} onChiq={onChiq} />
        <p className="rounded-clay bg-karta p-6 text-center text-[14.5px] leading-snug text-ink-dim shadow-clay-sm">
          {t(q === "yoq" ? "quizKodYoq" : "hrXato")}
        </p>
      </div>
    );
  }

  if (bosqich === "yech") return <OzYechish q={q} onTugadi={(n) => { setBosqich(n); void yukla(); }} onChiq={() => setBosqich("bosh")} />;
  if (typeof bosqich === "object") {
    return <OzNatija q={q} n={bosqich} onQayta={() => setBosqich("yech")} onChiq={onChiq} />;
  }

  const daq = Math.max(1, Math.round(q.soniya / 60));
  return (
    <div className={QOBIQ}>
      <Sarlavha nom={t("quizSarlavhaYech")} onChiq={onChiq} />
      <div className="flex flex-col gap-3 rounded-clay bg-karta p-5 shadow-clay-sm">
        <span className="font-display text-[24px] leading-tight break-words">{q.nom}</span>
        <span className="text-[14.5px] text-ink-soft">{t("quizMuallifi", { ism: q.meniki ? t("siz") : q.muallif })}</span>
        <span className="text-[14.5px] text-ink-soft">
          {q.rejim === "jonli" ? t("quizSavolSoni", { n: q.savol }) : t("quizSavolDaq", { n: q.savol, d: daq })}
        </span>
        {q.mening && (
          <p className="shadow-ichki rounded-2xl bg-sahna px-3.5 py-3 text-[14px] leading-snug text-ink-soft">
            {t("quizAvvalgi", { t: q.mening.togri, j: q.mening.jami })}
          </p>
        )}
      </div>

      {q.rejim === "jonli" ? (
        q.meniki ? (
          <button type="button" onClick={() => onMeniki(q.id)} className={ASOSIY}>{t("quizOchishMuallif")}</button>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-clay bg-karta p-6 text-center shadow-clay-sm">
            <span className="az-suzish grid size-14 place-items-center rounded-full bg-brand-blue/10 text-brand-blue-t">
              <Icon name="clock" size={26} />
            </span>
            <span className="font-display text-[18px]">{t("quizBoshlovchiKut")}</span>
            <span className="text-[13.5px] leading-snug text-ink-dim">{t("quizBoshlovchiKutIzoh")}</span>
          </div>
        )
      ) : (
        <button type="button" onClick={() => { tebrat("tanlov"); setBosqich("yech"); }} data-tahlil="Quiz: boshlash"
          className={ASOSIY}>
          {t(q.mening ? "quizQaytaYech" : "quizBoshlash")}
        </button>
      )}
      {(q.mening || (q.meniki && q.rejim === "oz")) && (
        <p className="px-1 text-center text-[13px] text-ink-dim">{t(q.meniki ? "quizMuallifIzoh" : "quizQaytaIzoh")}</p>
      )}
    </div>
  );
}

/* ==================== o'z tezligida ==================== */

function OzYechish({ q, onTugadi, onChiq }: { q: QuizOchiq; onTugadi: (n: Topshiriq) => void; onChiq: () => void }) {
  const [i, setI] = useState(0);
  const [javoblar, setJavoblar] = useState<(Javob | null)[]>(() => q.savollar.map(() => null));
  const [ketmoqda, setKetmoqda] = useState(false);
  const [xato, setXato] = useState(false);
  const boshi = useRef(Date.now());
  const [qolgan, setQolgan] = useState(q.soniya);

  const topshir = useCallback(async (j: (Javob | null)[]) => {
    if (ketmoqda) return;
    setKetmoqda(true);
    setXato(false);
    try {
      const n = await quizTopshir(q.kod, j, Math.round((Date.now() - boshi.current) / 1000));
      tebrat(n.togri === n.jami ? "yutuq" : "tanlov");
      onTugadi(n);
    } catch {
      setKetmoqda(false);
      setXato(true);
    }
  }, [ketmoqda, q.kod, onTugadi]);

  // Umumiy soat. Tugasa — bor javoblar bilan topshiriladi (blok test kabi).
  const javobRef = useRef(javoblar);
  javobRef.current = javoblar;
  useEffect(() => {
    const id = setInterval(() => {
      const q2 = q.soniya - (Date.now() - boshi.current) / 1000;
      setQolgan(q2);
      if (q2 <= 0) { clearInterval(id); void topshir(javobRef.current); }
    }, 500);
    return () => clearInterval(id);
    // `topshir` har render yangi — soat bir marta qo'yiladi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.soniya]);

  const s = q.savollar[i]!;
  const javob = javoblar[i];
  const oxirgi = i === q.savollar.length - 1;
  // Funksional yangilanish: ketma-ket tez bosishlar bir-birini yo'qotmasin.
  const belgila = (v: Javob | null) => setJavoblar((eski) => eski.map((x, k) => (k === i ? v : x)));
  const shoshilinch = qolgan <= 30;

  return (
    <div className={`${QOBIQ} min-h-dvh pb-6`}>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => { if (window.confirm(t("quizToxtatSorov"))) onChiq(); }}
          aria-label={t("yopish")} title={t("yopish")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
          <Icon name="close" size={18} />
        </button>
        <div className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 font-display text-[15px] tabular-nums shadow-clay-sm ${
          shoshilinch ? "bg-brand-red text-white" : "bg-karta"}`}>
          <Icon name="clock" size={16} />{soat(qolgan)}
        </div>
        <span className="ml-auto shrink-0 rounded-xl bg-karta px-2.5 py-1 font-display text-[13px] shadow-clay-sm">
          <span className="text-brand-blue-t">{i + 1}</span><span className="text-ink-dim">/{q.savollar.length}</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-karta/60">
        <div className="h-full rounded-full bg-brand-green transition-[width] duration-300"
          style={{ width: `${(javoblar.filter((x, k) => javobTayyor(q.savollar[k]!, x)).length / q.savollar.length) * 100}%` }} />
      </div>

      <div key={i} className="az-savol flex flex-col gap-3">
        <Shart s={s} />
        {s.tur === "variant" ? (
          <div className="flex flex-col gap-2">
            {s.variantlar.map((v, k) => {
              const bu = javob === v;
              return (
                <button key={k} type="button" onClick={() => { tebrat("tanlov"); belgila(bu ? null : v); }} aria-pressed={bu}
                  className={`clay-press flex min-h-[54px] items-center gap-3 rounded-2xl px-3 py-2 text-left shadow-clay-sm ${
                    bu ? "bg-brand-blue/12 text-brand-blue-t ring-2 ring-brand-blue" : "bg-karta"}`}>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg font-display text-[14px] ${
                    bu ? "bg-brand-blue text-white" : "bg-track text-ink-soft"}`}>{HARFLAR[k] ?? k + 1}</span>
                  <VariantMatn v={v} kind={s.a?.kind} />
                </button>
              );
            })}
          </div>
        ) : s.tur !== "yozma" ? (
          <YangiTurJavob s={s} javob={javob ?? null} onChange={belgila} />
        ) : (
          <input value={typeof javob === "string" ? javob : ""} onChange={(e) => belgila(e.target.value.slice(0, 100))}
            placeholder={t("quizJavobYoz")} aria-label={t("quizJavobYoz")} inputMode="text" autoComplete="off"
            className="h-14 rounded-2xl border-2 border-track bg-karta px-4 font-display text-[20px] outline-none
                       placeholder:font-sans placeholder:text-[16px] placeholder:text-ink-dim focus:border-brand-blue" />
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {xato && <p className="text-center text-[14px] text-brand-red">{t("quizYuborilmadi")}</p>}
        <button type="button" disabled={ketmoqda}
          onClick={() => (oxirgi ? void topshir(javoblar) : setI(i + 1))}
          data-tahlil={oxirgi ? "Quiz: topshirish" : "Quiz: keyingisi"} className={ASOSIY}>
          {ketmoqda ? t("premYuklanmoqda") : t(oxirgi ? "quizTopshirish" : "quizKeyingisi")}
        </button>
        {i > 0 && (
          <button type="button" onClick={() => setI(i - 1)}
            className="clay-press min-h-11 text-[14px] font-semibold text-ink-dim">
            {t("quizOldingi")}
          </button>
        )}
      </div>
    </div>
  );
}

function OzNatija({ q, n, onQayta, onChiq }: { q: QuizOchiq; n: Topshiriq; onQayta: () => void; onChiq: () => void }) {
  const foiz = n.jami ? n.togri / n.jami : 0;
  const yaxshi = n.mening?.yaxshiroqFoiz;
  return (
    <div className={QOBIQ}>
      <Sarlavha nom={q.nom} onChiq={onChiq} />

      <div className="flex flex-col items-center gap-2 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
        {/* Halqa — yashil: to'g'ri javoblar ulushi. */}
        <div className="relative grid size-32 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" className="stroke-track" />
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="10" strokeLinecap="round"
              className="stroke-brand-green" strokeDasharray={`${foiz * 263.9} 263.9`} />
          </svg>
          <span className="font-display text-[30px] tabular-nums">{n.togri}/{n.jami}</span>
        </div>
        <span className="font-display text-[19px] leading-tight">
          {yaxshi !== null && yaxshi !== undefined && n.birinchi
            ? t("quizYaxshiroq", { n: yaxshi })
            : t(foiz === 1 ? "quizHammasi" : "quizNatijaSarlavha")}
        </span>
        <span className="text-[13px] text-ink-dim">
          {n.ishlagan > 0 ? t("quizOrtacha", { n: n.ishlagan, o: String(n.ortacha).replace(".", ","), j: n.jami }) : ""}
        </span>
        {!n.birinchi && (
          <span className="text-[13px] text-ink-dim">{t(q.meniki ? "quizMuallifIzoh" : "quizQaytaIzoh")}</span>
        )}
      </div>

      <ol className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
        {n.tahlil.map((x, k) => (
          <li key={k} className="flex items-start gap-3 px-3.5 py-2.5">
            <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${
              x.togri ? "bg-brand-green/15 text-brand-green" : "bg-brand-red/12 text-brand-red"}`}>
              <Icon name={x.togri ? "check" : "close"} size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px]">{k + 1}. {q.savollar[k] ? savolQisqa(q.savollar[k]) : ""}</span>
              {!x.togri && q.savollar[k] && (
                <span className="flex flex-col gap-0.5 text-[13px] text-ink-dim">
                  {x.sizniki !== null && (
                    <span>{t("quizSizniki")}: <JavobKorinish tur={q.savollar[k].tur} ixcham
                      javob={korinish(q.savollar[k], x.sizniki)} /></span>
                  )}
                  <span className="text-ink">{t("quizTogriJavob")}: <JavobKorinish tur={q.savollar[k].tur} ixcham
                    javob={x.javob} /></span>
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>

      <button type="button" onClick={() => quizUlash(q.nom, q.kod, q.havola)} data-tahlil="Quiz: natijadan ulashish"
        className={ASOSIY}>
        <span className="flex items-center justify-center gap-2"><Icon name="send" size={18} />{t("quizDostga")}</span>
      </button>
      <button type="button" onClick={onQayta} className="clay-press min-h-11 text-[14px] font-semibold text-ink-dim">
        {t("quizQaytaYech")}
      </button>
    </div>
  );
}

/* ==================== jonli o'yin ==================== */

export function QuizJonli({ id, onChiq }: { id: number; onChiq: () => void }) {
  const [o, setO] = useState<Oyin | null | "yoq">(null);
  /** So'rov olingan paytdagi `qolgan` va shu payt — soat oraliqda o'zi yursin. */
  const [olindi, setOlindi] = useState(0);
  const [hozir, setHozir] = useState(Date.now());
  const [yuborildi, setYuborildi] = useState<Javob | null>(null);

  const qabul = useCallback((x: Oyin) => { setO(x); setOlindi(Date.now()); }, []);

  useEffect(() => {
    let tirik = true;
    const sora = () => oyinHolat(id).then((x) => { if (tirik) qabul(x); },
      (e) => { if (tirik && (e as { kod?: number }).kod === 404) setO("yoq"); });
    void sora();
    const t1 = setInterval(sora, SORASH_MS);
    const t2 = setInterval(() => setHozir(Date.now()), 250);
    return () => { tirik = false; clearInterval(t1); clearInterval(t2); };
  }, [id, qabul]);

  // Yangi savol — eski javob belgisi tozalanadi.
  const joriy = o && o !== "yoq" ? o.joriy : -1;
  useEffect(() => { setYuborildi(null); }, [joriy]);

  if (o === null) return <div className={QOBIQ}><Holat matn={t("quizYuklanmoqda")} /></div>;
  if (o === "yoq") return <div className={QOBIQ}><Sarlavha nom={t("quizJonliSarlavha")} onChiq={onChiq} /><Holat matn={t("quizTopilmadi")} /></div>;

  const qolgan = o.qolgan === null ? null : Math.max(0, o.qolgan - (hozir - olindi) / 1000);
  const amal = (a: "keyingi" | "tugat") => { tebrat("tanlov"); oyinAmal(id, a).then(qabul, () => {}); };
  const javobBer = (j: Javob) => {
    if (yuborildi !== null || !o.savol) return;
    setYuborildi(j);
    tebrat("tanlov");
    oyinJavob(id, o.joriy, j).then(qabul, () => {});
  };

  if (o.boshlovchi) return <Boshlovchi o={o} qolgan={qolgan} onAmal={amal} onChiq={onChiq} />;
  if (!o.qatnashyapman && o.holat !== "tugadi") {
    return <KirishOyna o={o} onKir={(ism) => oyinKir(id, ism).then(qabul)} onChiq={onChiq} />;
  }
  return <Ishtirokchi o={o} qolgan={qolgan} yuborildi={yuborildi} onJavob={javobBer} onChiq={onChiq} />;
}

/**
 * Kirish — taxallus bilan (Kahoot kabi). Profil nomi oldindan yozilgan,
 * ya'ni ko'pchilik uchun bu bitta bosish. Nomsiz profil esa "Do'stingiz"
 * bo'lib qolmaydi: boshlovchi o'ttizta bir xil qatorni ajrata olmasdi.
 */
function KirishOyna({ o, onKir, onChiq }: { o: Oyin; onKir: (ism: string) => Promise<unknown>; onChiq: () => void }) {
  const [ism, setIsm] = useState(o.ism);
  const [ketmoqda, setKetmoqda] = useState(false);
  const tayyor = ism.trim().length >= 2;
  const kir = () => {
    if (!tayyor || ketmoqda) return;
    setKetmoqda(true);
    tebrat("tanlov");
    onKir(ism.trim()).catch(() => setKetmoqda(false));
  };
  return (
    <div className={QOBIQ}>
      <Sarlavha nom={o.nom} izoh={`${t("quizSavolSoni", { n: o.jami })} · ${t(OYIN_TUR_NOMI[o.tur])}`} onChiq={onChiq} />
      <form className="flex flex-col gap-3 rounded-clay bg-karta p-5 shadow-clay-sm"
        onSubmit={(e) => { e.preventDefault(); kir(); }}>
        <label className="flex flex-col gap-1.5">
          <span className="font-display text-[18px]">{t("quizTaxallus")}</span>
          <span className="text-[13px] leading-snug text-ink-dim">{t("quizTaxallusIzoh")}</span>
          <input value={ism} onChange={(e) => setIsm(e.target.value.slice(0, TAXALLUS_UZUN))} autoComplete="off"
            placeholder={t("quizTaxallusJoy")}
            className="mt-1 h-[52px] rounded-2xl border-2 border-track bg-karta px-4 font-display text-[18px] outline-none
                       placeholder:font-sans placeholder:text-[16px] placeholder:text-ink-dim focus:border-brand-blue" />
        </label>
        <button type="submit" disabled={!tayyor || ketmoqda} data-tahlil="Quiz jonli: kirish" className={ASOSIY}>
          {t("quizKirish")}
        </button>
      </form>
      {o.holat !== "kutish" && (
        <p className="px-1 text-center text-[13px] text-ink-dim">{t(o.tur === "omon" ? "quizKechTomosha" : "quizKechKirdi")}</p>
      )}
    </div>
  );
}

const OYIN_TUR_NOMI = { oddiy: "quizOyinOddiy", jamoa: "quizOyinJamoa", omon: "quizOyinOmon" } as const;

function VaqtChizigi({ qolgan, jami }: { qolgan: number | null; jami: number }) {
  const ulush = qolgan === null ? 0 : Math.min(1, qolgan / jami);
  return (
    <div className="h-2 overflow-hidden rounded-full bg-karta/60" role="progressbar" aria-valuemin={0} aria-valuemax={jami}
      aria-valuenow={Math.round(qolgan ?? 0)}>
      <div className={`h-full rounded-full transition-[width] duration-300 ease-linear ${ulush < 0.25 ? "bg-brand-red" : "bg-brand-blue"}`}
        style={{ width: `${ulush * 100}%` }} />
    </div>
  );
}

/** Jamoa belgisi va nomi — bir qatorda. */
function JamoaYorliq({ j, kichik = false }: { j: number; kichik?: boolean }) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${kichik ? "text-[13px]" : "text-[15px] font-bold"}`}>
      <Icon name={JAMOA_BELGI[j] ?? "circle"} size={kichik ? 14 : 17} className="shrink-0 text-brand-blue-t" />
      <span className="truncate">{jamoaNomi(j)}</span>
    </span>
  );
}

function OyinTepa({ o, qolgan, onChiq }: { o: Oyin; qolgan: number | null; onChiq: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onChiq} aria-label={t("yopish")} title={t("yopish")}
        className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
        <Icon name="close" size={18} />
      </button>
      {o.joriy >= 0 && o.holat !== "tugadi" && (
        <span className="rounded-xl bg-karta px-2.5 py-1 font-display text-[13px] shadow-clay-sm">
          <span className="text-brand-blue-t">{o.joriy + 1}</span><span className="text-ink-dim">/{o.jami}</span>
        </span>
      )}
      {qolgan !== null && (
        <span className="flex items-center gap-1 font-display text-[15px] tabular-nums">
          <Icon name="clock" size={15} />{Math.ceil(qolgan)}
        </span>
      )}
      {/* Omon qolish — hali o'yindagilar soni: o'yinning asosiy hayajoni shu. */}
      {o.tirik !== null && (
        <span className="flex items-center gap-1 text-[13px] font-bold text-ink-soft tabular-nums" title={t("quizQoldi")}>
          <Icon name="flame" size={15} />{o.tirik}
        </span>
      )}
      {o.mening && o.holat !== "kutish" && (
        <span className="ml-auto flex items-center gap-1 font-display text-[16px] text-brand-gold-d tabular-nums">
          <Icon name="star" size={16} />{o.mening.ball}
        </span>
      )}
    </div>
  );
}

/** Oltin savol yorlig'i — amber (mukofot ma'nosi). */
function OltinYorliq() {
  return (
    <span className="az-kirish inline-flex items-center gap-1.5 self-center rounded-full bg-brand-gold/15 px-3 py-1
                     text-[13px] font-bold text-brand-gold-d">
      <Icon name="star" size={14} />{t("quizOltinX2")}
    </span>
  );
}

/** Jonli o'yin varianti — 2×2 katta tugma. Ranglar YO'Q: harf yetadi (3 rang qoidasi). */
function JonliVariantlar({ s, onTanla, tanlangan, togri, taqsimot }: {
  s: OchiqSavol; onTanla?: (v: string) => void; tanlangan?: string | null; togri?: string | null; taqsimot?: number[] | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {s.variantlar.map((v, k) => {
        const bu = tanlangan === v;
        const toG = togri !== null && togri !== undefined && togri === v;
        const holat = toG ? "bg-brand-green text-white"
          : togri && bu ? "bg-brand-red text-white"
          : bu ? "bg-brand-blue text-white"
          : togri ? "bg-karta text-ink-dim"
          : "bg-karta text-ink";
        return (
          <button key={k} type="button" disabled={!onTanla} onClick={() => onTanla?.(v)}
            className={`tugma-3d relative flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-3xl p-2
                        text-center shadow-clay min-[360px]:min-h-[96px] ${holat}`}>
            <span className={`absolute top-2 left-2.5 font-display text-[12px] ${toG || bu ? "text-white/80" : "text-ink-dim"}`}>
              {HARFLAR[k] ?? k + 1}
            </span>
            <VariantMatn v={v} kind={s.a?.kind} katta />
            {taqsimot && <span className="font-display text-[13px] opacity-80 tabular-nums">{taqsimot[k] ?? 0}</span>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Boshlovchi ekranidagi javob qismi. Savol ochiqligida — faqat elementlar
 * (javob emas); yopilgach — to'g'ri javob va variantlarda kim nimani tanlagani.
 */
function BoshlovchiJavob({ o, s }: { o: Oyin; s: OchiqSavol }) {
  const togri = o.holat === "natija" ? o.togriJavob : null;
  if (s.tur === "variant") {
    return <JonliVariantlar s={s} togri={typeof togri === "string" ? togri : null}
      taqsimot={o.holat === "natija" ? o.taqsimot : null} />;
  }
  if (s.tur === "rost") {
    return (
      <div className="flex flex-col gap-1.5">
        <RostTanla value={null} togri={typeof togri === "string" ? togri : null} katta />
        {o.holat === "natija" && o.taqsimot && (
          <div className="grid grid-cols-2 text-center font-display text-[14px] text-ink-soft tabular-nums">
            <span>{o.taqsimot[0] ?? 0}</span><span>{o.taqsimot[1] ?? 0}</span>
          </div>
        )}
      </div>
    );
  }
  if (o.holat === "natija") {
    return (
      <div className="rounded-2xl bg-brand-green px-4 py-3 text-center text-[17px] text-white">
        <JavobKorinish tur={s.tur} javob={togri} />
      </div>
    );
  }
  // Tartib va juftlash elementlari — sinf o'qib tursin, tartib aralash.
  const elementlar = s.tur === "juftlash" ? [...(s.chap ?? []), ...(s.ong ?? [])] : s.variantlar;
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {elementlar.map((x) => (
        <span key={x} className="rounded-2xl bg-karta px-3.5 py-2 font-display text-[17px] shadow-clay-sm">{x}</span>
      ))}
    </div>
  );
}

/** Jamoalar jadvali — o'rtacha ball ustunlari (amber: ball). */
function Jamoalar({ o }: { o: Oyin }) {
  if (!o.jamoalar) return null;
  const eng = Math.max(1, ...o.jamoalar.map((j) => j.ball));
  return (
    <section className="flex flex-col gap-2 rounded-clay bg-karta p-3.5 shadow-clay-sm">
      {o.jamoalar.map((j) => (
        <div key={j.jamoa} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <JamoaYorliq j={j.jamoa} />
            <span className="text-[12.5px] text-ink-dim">{t("quizJamoaOdam", { n: j.odam })}</span>
            <span className="ml-auto font-display text-[16px] tabular-nums">{j.ball}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-track">
            <div className="h-full rounded-full bg-brand-gold transition-[width] duration-500" style={{ width: `${(j.ball / eng) * 100}%` }} />
          </div>
        </div>
      ))}
      <p className="text-[12px] leading-snug text-ink-dim">{t("quizJamoaOrtacha")}</p>
    </section>
  );
}

function Boshlovchi({ o, qolgan, onAmal, onChiq }: {
  o: Oyin; qolgan: number | null; onAmal: (a: "keyingi" | "tugat") => void; onChiq: () => void;
}) {
  const tugat = () => { if (window.confirm(t("quizTugatSorov"))) onAmal("tugat"); };

  if (o.holat === "kutish") {
    return (
      <div className={QOBIQ}>
        <Sarlavha nom={o.nom} izoh={`${t("quizBoshlovchi")} · ${t(OYIN_TUR_NOMI[o.tur])}`} onChiq={onChiq} />
        {/* Kod — proyektorda ham o'qilsin: ekranning eng katta yozuvi. */}
        <div className="flex flex-col items-center gap-1 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <span className="text-[13px] font-bold text-ink-dim">{t("quizKodAyting")}</span>
          <span className="font-display text-[40px] font-bold tracking-[0.18em] min-[360px]:text-[46px]">{o.kod}</span>
          <button type="button" onClick={() => quizUlash(o.nom, o.kod, o.havola)}
            className="clay-press min-h-11 px-3 text-[14px] font-bold text-brand-blue-t">{t("quizHavolaYubor")}</button>
        </div>
        {o.tur !== "oddiy" && (
          <p className="shadow-ichki rounded-2xl bg-sahna px-3.5 py-2.5 text-[13.5px] leading-snug text-ink-soft">
            {t(o.tur === "jamoa" ? "quizOyinJamoaIzoh" : "quizOyinOmonIzoh")}
          </p>
        )}
        <div className="flex flex-col gap-2 rounded-clay bg-karta p-4 shadow-clay-sm">
          <span className="font-display text-[17px]">{t("quizKirdi", { n: o.odam })}</span>
          {o.ismlar && o.ismlar.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {o.ismlar.map((ism, k) => (
                <span key={k} className="az-kirish rounded-full bg-track px-3 py-1 text-[13.5px]">{ism}</span>
              ))}
            </div>
          ) : <span className="text-[13.5px] text-ink-dim">{t("quizKimdirKirsin")}</span>}
        </div>
        {o.jamoalar && o.odam > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
            {o.jamoalar.slice().sort((a, b) => a.jamoa - b.jamoa).map((j) => (
              <span key={j.jamoa} className="flex items-center gap-1.5">
                <JamoaYorliq j={j.jamoa} kichik /><span className="text-[13px] text-ink-dim tabular-nums">{j.odam}</span>
              </span>
            ))}
          </div>
        )}
        <button type="button" disabled={o.odam === 0} onClick={() => onAmal("keyingi")} data-tahlil="Quiz jonli: boshlash"
          className={ASOSIY}>{t("quizBoshlash")}</button>
      </div>
    );
  }

  if (o.holat === "tugadi") return <Yakun o={o} onChiq={onChiq} />;

  const s = o.savol!;
  const oxirgi = o.joriy + 1 >= o.jami || (o.tur === "omon" && o.holat === "natija" && (o.tirik ?? 0) <= 1);
  return (
    <div className={`${QOBIQ} min-h-dvh pb-6`}>
      <OyinTepa o={o} qolgan={qolgan} onChiq={onChiq} />
      {o.holat === "savol" && <VaqtChizigi qolgan={qolgan} jami={s.vaqt} />}
      <div key={o.joriy} className="az-savol flex flex-col gap-3">
        {s.oltin && <OltinYorliq />}
        <Shart s={s} />
        <BoshlovchiJavob o={o} s={s} />
      </div>
      {o.holat === "savol" ? (
        <p className="text-center text-[14px] text-ink-soft">
          {t("quizJavobBerdi", { n: o.javobBerdi, j: o.tirik ?? o.odam })}
        </p>
      ) : (
        <>
          {o.tur === "omon" && <p className="text-center font-display text-[17px]">{t("quizQoldiN", { n: o.tirik ?? 0 })}</p>}
          <Jamoalar o={o} />
          {o.tur !== "jamoa" && o.reyting && o.reyting.length > 0 && (
            <section className="flex flex-col gap-1.5">
              <h2 className="px-1 font-display text-[16px]">{t("quizEngYaxshi")}</h2>
              <ReytingRoyxat reyting={o.reyting} />
            </section>
          )}
        </>
      )}
      <div className="mt-auto flex flex-col gap-1 pt-2">
        <button type="button" onClick={() => onAmal("keyingi")} className={ASOSIY}
          data-tahlil={o.holat === "savol" ? "Quiz jonli: yopish" : "Quiz jonli: keyingi"}>
          {t(o.holat === "savol" ? "quizJavoblarniKorsat" : oxirgi ? "quizNatijalarniKorsat" : "quizKeyingiSavol")}
        </button>
        <button type="button" onClick={tugat} className="clay-press min-h-11 text-[14px] font-semibold text-ink-dim">
          {t("quizOyinniTugat")}
        </button>
      </div>
    </div>
  );
}

function Ishtirokchi({ o, qolgan, yuborildi, onJavob, onChiq }: {
  o: Oyin; qolgan: number | null; yuborildi: Javob | null; onJavob: (j: Javob) => void; onChiq: () => void;
}) {
  const [yozma, setYozma] = useState("");
  /** Tartib va juftlash — avval yig'iladi, keyin "Yuborish" bilan ketadi. */
  const [qoralama, setQoralama] = useState<Javob | null>(null);
  useEffect(() => { setYozma(""); setQoralama(null); }, [o.joriy]);

  const jamoa = o.mening?.jamoa ?? null;
  const chiqdi = o.mening?.chiqdi ?? null;

  if (o.holat === "kutish") {
    return (
      <div className={QOBIQ}>
        <Sarlavha nom={o.nom} izoh={t(OYIN_TUR_NOMI[o.tur])} onChiq={onChiq} />
        <div className="flex flex-col items-center gap-3 rounded-clay bg-karta p-6 text-center shadow-clay-sm">
          <span className="az-suzish grid size-16 place-items-center rounded-full bg-brand-green/15 text-brand-green">
            <Icon name="check" size={30} />
          </span>
          <span className="font-display text-[20px]">{t("quizSizOyindasiz")}</span>
          {jamoa !== null && (
            <span className="flex flex-col items-center gap-1">
              <span className="text-[13px] text-ink-dim">{t("quizSizningJamoa")}</span>
              <JamoaYorliq j={jamoa} />
            </span>
          )}
          <span className="text-[14px] leading-snug text-ink-dim">{t("quizBoshlovchiKutIzoh")}</span>
          <span className="text-[13px] text-ink-dim">{t("quizKirdi", { n: o.odam })}</span>
        </div>
      </div>
    );
  }

  if (o.holat === "tugadi") return <Yakun o={o} onChiq={onChiq} />;

  const s = o.savol!;
  const berildi = yuborildi ?? o.mening?.javob ?? null;

  if (o.holat === "natija") {
    const togri = o.mening?.togrimi;
    const bonus = o.mening?.bonus ?? 0;
    // Shu savolda chiqqan — alohida, aniq xabar: endi u tomoshabin.
    const hozirChiqdi = o.tur === "omon" && chiqdi === o.joriy;
    return (
      <div className={`${QOBIQ} min-h-dvh pb-6`}>
        <OyinTepa o={o} qolgan={null} onChiq={onChiq} />
        {o.mening?.kech && berildi === null ? (
          // Kech kirgan — bu savolni ko'rmagan: qizil "xato" emas, neytral karta.
          <div className="az-kirish flex flex-col items-center gap-1.5 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
            <Icon name="clock" size={30} className="text-brand-blue-t" />
            <span className="font-display text-[19px]">{t(o.tur === "omon" ? "quizTomoshabin" : "quizKechKeldi")}</span>
          </div>
        ) : chiqdi !== null && !hozirChiqdi ? (
          <div className="az-kirish flex flex-col items-center gap-1.5 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
            <Icon name="play" size={28} className="text-ink-dim" />
            <span className="font-display text-[18px]">{t("quizTomoshabin")}</span>
            <span className="text-[14px] text-ink-soft">{t("quizTogriJavob")}: <JavobKorinish tur={s.tur} javob={o.togriJavob} /></span>
          </div>
        ) : (
          <div className={`az-kirish flex flex-col items-center gap-1.5 rounded-clay p-5 text-center text-white shadow-clay ${
            togri ? "bg-brand-green" : "bg-brand-red"}`}>
            <Icon name={togri ? "check" : "close"} size={34} />
            <span className="font-display text-[22px]">
              {togri ? t("quizTogri", { b: o.mening?.oxirgiBall ?? 0 }) : berildi === null ? t("quizUlgurmadi") : t("quizXato")}
            </span>
            {togri && s.oltin && <span className="text-[13.5px] text-white/90">{t("quizOltinX2")}</span>}
            {!togri && (
              <span className="text-[14.5px] text-white/90">{t("quizTogriJavob")}: <JavobKorinish tur={s.tur} javob={o.togriJavob} /></span>
            )}
            {hozirChiqdi && <span className="mt-1 font-display text-[16px]">{t("quizSizChiqdingiz")}</span>}
          </div>
        )}
        {/* Seriya — ketma-ket to'g'ri javoblar va bonusi (amber: mukofot). */}
        {togri && (o.mening?.seriya ?? 0) >= 2 && (
          <div className="az-kirish flex items-center gap-2.5 rounded-2xl bg-karta px-3.5 py-2.5 shadow-clay-sm">
            <Icon name="flame" size={20} className="text-brand-gold-d" />
            <span className="min-w-0 flex-1 text-[14.5px] font-bold">{t("quizSeriya", { n: o.mening?.seriya ?? 0 })}</span>
            {bonus > 0 && <span className="font-display text-[15px] text-brand-gold-d tabular-nums">+{bonus}</span>}
          </div>
        )}
        {jamoa !== null && (
          <p className="flex items-center justify-center gap-2 text-[14px]">
            <JamoaYorliq j={jamoa} kichik />
            <span className="text-ink-dim">
              {t("quizJamoaOrin", { n: (o.jamoalar ?? []).findIndex((j) => j.jamoa === jamoa) + 1, j: o.jamoalar?.length ?? 0 })}
            </span>
          </p>
        )}
        {o.tur === "omon" && <p className="text-center font-display text-[17px]">{t("quizQoldiN", { n: o.tirik ?? 0 })}</p>}
        {o.tur !== "omon" && o.orin && (
          <p className="text-center font-display text-[18px]">{t("quizOrin", { n: o.orin, j: o.odam })}</p>
        )}
        {o.tur === "jamoa" ? <Jamoalar o={o} /> : o.reyting && <ReytingRoyxat reyting={o.reyting} />}
        <p className="mt-auto text-center text-[13.5px] text-ink-dim">{t("quizKeyingiKut")}</p>
      </div>
    );
  }

  // Savol ochiq.
  const yuborish = (j: Javob | null) => { if (j !== null && javobTayyor(s, j)) onJavob(j); };
  return (
    <div className={`${QOBIQ} min-h-dvh pb-6`}>
      <OyinTepa o={o} qolgan={qolgan} onChiq={onChiq} />
      <VaqtChizigi qolgan={qolgan} jami={s.vaqt} />
      <div key={o.joriy} className="az-savol flex flex-col gap-3">
        {s.oltin && <OltinYorliq />}
        <Shart s={s} ixcham />
        {chiqdi !== null ? (
          <div className="flex flex-col items-center gap-2 rounded-clay bg-karta p-6 text-center shadow-clay-sm">
            <span className="font-display text-[18px]">{t("quizTomoshabin")}</span>
            <span className="text-[13.5px] text-ink-dim">{t("quizTomoshaIzoh")}</span>
          </div>
        ) : berildi !== null ? (
          <div className="flex flex-col items-center gap-2 rounded-clay bg-karta p-6 text-center shadow-clay-sm">
            <span className="font-display text-[18px]">{t("quizQabulQilindi")}</span>
            <span className="text-[13.5px] text-ink-dim">{t("quizBoshqalarKut")}</span>
          </div>
        ) : s.tur === "variant" ? (
          <JonliVariantlar s={s} onTanla={onJavob} />
        ) : s.tur === "rost" ? (
          <RostTanla value={null} onChange={onJavob} katta />
        ) : s.tur === "yozma" ? (
          <form className="flex flex-col gap-2" onSubmit={(e) => { e.preventDefault(); if (yozma.trim()) onJavob(yozma.trim()); }}>
            <input value={yozma} onChange={(e) => setYozma(e.target.value.slice(0, 100))} autoFocus
              placeholder={t("quizJavobYoz")} aria-label={t("quizJavobYoz")} autoComplete="off"
              className="h-14 rounded-2xl border-2 border-track bg-karta px-4 font-display text-[20px] outline-none
                         placeholder:font-sans placeholder:text-[16px] placeholder:text-ink-dim focus:border-brand-blue" />
            <button type="submit" disabled={!yozma.trim()} className={ASOSIY}>{t("quizYuborish")}</button>
          </form>
        ) : (
          <>
            <YangiTurJavob s={s} javob={qoralama} onChange={setQoralama} />
            <button type="button" disabled={!javobTayyor(s, qoralama)} onClick={() => yuborish(qoralama)} className={ASOSIY}>
              {t("quizYuborish")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Yakun({ o, onChiq }: { o: Oyin; onChiq: () => void }) {
  const reyting = o.reyting ?? [];
  const meniki = reyting.find((r) => r.men);
  const golibJamoa = o.jamoalar?.[0];
  return (
    <div className={QOBIQ}>
      <Sarlavha nom={o.nom} izoh={t("quizYakun")} onChiq={onChiq} />
      {/* Jamoaviy jangda asosiy natija — g'olib jamoa. */}
      {golibJamoa && (
        <div className="az-kirish flex flex-col items-center gap-1.5 rounded-clay bg-brand-gold/15 p-5 text-center">
          <Icon name="trophy" size={30} className="text-brand-gold-d" />
          <span className="text-[13px] font-bold text-brand-gold-d">{t("quizGolibJamoa")}</span>
          <span className="font-display text-[22px]"><JamoaYorliq j={golibJamoa.jamoa} /></span>
          <span className="text-[13px] text-ink-soft tabular-nums">{t("quizJamoaBall", { n: golibJamoa.ball })}</span>
        </div>
      )}
      <Jamoalar o={o} />
      {reyting.length > 0 ? <Shohsupa reyting={reyting} /> : <Holat matn={t("quizHechKim")} />}
      {meniki && meniki.orin > 3 && (
        <p className="text-center font-display text-[18px]">{t("quizOrin", { n: meniki.orin, j: reyting.length })}</p>
      )}
      {o.mening && (
        <p className="text-center text-[14px] text-ink-soft">
          {t("quizTogriSoni", { t: o.mening.togri, j: o.jami })}
        </p>
      )}
      <ReytingRoyxat reyting={reyting} dan={3} />
      <button type="button" onClick={onChiq} className={o.boshlovchi ? IKKINCHI : ASOSIY}>{t("yopish")}</button>
    </div>
  );
}
