/**
 * QUIZ — muallif tomoni (`lib/quiz.ts`, `core/quiz.py`).
 *
 *   Quizlarim     mening quizlarim, yangi quiz va kod bilan ochish
 *   QuizMuharrir  BITTA sahifa: nom, rejim, savollar ro'yxati, "Saqlash"
 *   QuizSahifa    kod va ulashish, jonli o'yinni boshlash, natijalar
 *
 * ─────────────── NEGA BITTA SAHIFA ───────────────
 *
 * Masala yozish qadamlarga bo'lingan (`MasalaYangi.tsx`), chunki u yerda
 * BITTA narsa yoziladi va har qadamda bitta savol bor. Quizda esa o'nta
 * savol bo'ladi va muallif ular orasida yurib turadi: uchinchisini
 * tuzatadi, beshinchisini o'chiradi, bazadan yana uchtasini qo'shadi.
 * Qadamli oqimda bu "orqaga, orqaga, oldinga" bo'lardi. Shuning uchun
 * ro'yxat doim ko'z oldida, bitta savol esa pastdan chiqadigan varaqda
 * tahrirlanadi.
 */
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { til } from "../lib/til";
import { royxat as toplamRoyxat, type Toplam } from "../lib/toplam";
import { matndanSavollar } from "../lib/quizMatn";
import { RostTanla } from "../components/QuizJavob";
import { havolaniOch, tebrat, useOrqaga } from "../lib/qobiq";
import { xatoKodi } from "../lib/api";
import { HARFLAR } from "../components/Variantlar";
import { Tanlov } from "../components/Varaq";
import type { Bob } from "../lib/blok";
import {
  BAZA_SINFLAR, DTM_VARIANT, MAX_JUFT, MAX_SAVOL, MAX_MATN, MAX_TARTIB, MAX_VARIANT, MAX_VARIANT_MATN, MIN_JUFT, MIN_TARTIB,
  MIN_VARIANT, SAVOL_TURLARI, VAQTLAR,
  aiBoshla, aiHolat, aiIsh, bazaBoblari, bazadanYasa, bosh, jonliOch, kodTozala, quizOch, quizOchir, quizSaqla,
  quizYarat, quizlarim, savolQisqa, savolTayyor, tayyorTest, turgaOtkaz,
} from "../lib/quiz";
import type { AiHolat, AiIsh, OyinTur, SavolTur, TayyorManba } from "../lib/quiz";
import type { Activity } from "../lib/activity";
import { QuestionView, sahnaBor } from "../components/QuestionView";
import { kursMatn } from "../lib/tarjima/kurs";
import type { QuizQisqa, QuizToliq, Rejim, Savol } from "../lib/quiz";
import { yolPremium, yolQuizKod } from "../lib/yollar";

export const QOBIQ = "mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-4 pb-10 min-[360px]:px-[18px] "
  + "sm:max-w-[560px] kom:max-w-[720px] kom:px-8 kom:pt-8";

/** Asosiy (firuza) tugma — ekranda bittadan. */
export const ASOSIY = "tugma-3d min-h-[54px] w-full rounded-2xl bg-brand-blue font-display text-[18px] font-bold "
  + "text-white shadow-[0_4px_0_var(--color-brand-blue-d)] disabled:opacity-45";
/** Ikkinchi darajali — neytral. */
export const IKKINCHI = "clay-press min-h-12 w-full rounded-2xl bg-track font-display text-[16px] font-bold text-brand-blue-t";

export function Sarlavha({ nom, izoh, onChiq, amal }: {
  nom: string; izoh?: string; onChiq: () => void; amal?: ReactNode;
}) {
  const strelka = useOrqaga(onChiq);
  return (
    <div className="flex items-center gap-2">
      {strelka && (
        <button type="button" onClick={onChiq} aria-label={t("ortga")} title={t("ortga")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[22px] leading-tight">{nom}</h1>
        {izoh && <p className="truncate text-[13px] text-ink-dim">{izoh}</p>}
      </div>
      {amal}
    </div>
  );
}

function Guruh({ nom, children }: { nom: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="pl-1 text-[13px] font-bold tracking-[0.06em] text-ink-dim uppercase">{nom}</h2>
      <div className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
        {children}
      </div>
    </section>
  );
}

const Holat = ({ matn }: { matn: string }) => (
  <p className="py-8 text-center text-[14.5px] text-ink-dim">{matn}</p>
);

/** Ulashish: Telegram oynasi; bot nomi bo'lmasa (sayt) — sayt manzili. */
export function quizUlash(nom: string, kod: string, havola: string): void {
  tebrat("tanlov");
  const url = havola || `${location.origin}${yolQuizKod(kod)}`;
  havolaniOch(`https://t.me/share/url?url=${encodeURIComponent(url)}`
    + `&text=${encodeURIComponent(t("quizUlashMatn", { nom, kod }))}`);
}

/* ==================== ro'yxat ==================== */

export function Quizlarim({ onYangi, onOch, onKod, onChiq }: {
  onYangi: () => void; onOch: (id: number) => void; onKod: (kod: string) => void; onChiq: () => void;
}) {
  const [r, setR] = useState<QuizQisqa[] | null | "xato">(null);
  const [kod, setKod] = useState("");

  useEffect(() => {
    let tirik = true;
    quizlarim().then((x) => { if (tirik) setR(x.royxat); }, () => { if (tirik) setR("xato"); });
    return () => { tirik = false; };
  }, []);

  return (
    <div className={QOBIQ}>
      <Sarlavha nom={t("quizSarlavha")} onChiq={onChiq} />

      <button type="button" onClick={onYangi} data-tahlil="Quiz: yangi" className={ASOSIY}>
        <span className="flex items-center justify-center gap-2"><Icon name="plus" size={20} />{t("quizYangi")}</span>
      </button>

      {/* Kod bilan ochish — boshqa birov bergan quizni yechish. Neytral:
          ekrandagi asosiy amal — o'z quizingni yaratish. */}
      <div className="flex flex-col gap-2.5 rounded-clay bg-karta p-4 shadow-clay-sm">
        <span className="font-display text-[17px]">{t("quizKodBilan")}</span>
        <div className="flex gap-2">
          <input value={kod} onChange={(e) => setKod(kodTozala(e.target.value))}
            onKeyDown={(e) => { if (e.key === "Enter" && kod.length === 6) onKod(kod); }}
            placeholder="ABC234" aria-label={t("quizKodBilan")} autoCapitalize="characters" autoComplete="off"
            className="h-12 min-w-0 flex-1 rounded-2xl border-2 border-track bg-karta px-3 font-display text-[19px]
                       font-bold tracking-[0.18em] outline-none placeholder:text-ink-dim focus:border-brand-blue
                       min-[360px]:px-4 min-[360px]:text-[20px]" />
          <button type="button" disabled={kod.length !== 6} onClick={() => onKod(kod)} data-tahlil="Quiz: kod bilan"
            className="clay-press h-12 shrink-0 rounded-2xl bg-track px-4 font-display text-[16px] font-bold
                       text-brand-blue-t disabled:opacity-40">
            {t("quizOchish")}
          </button>
        </div>
      </div>

      {r === null && <Holat matn={t("quizYuklanmoqda")} />}
      {r === "xato" && <Holat matn={t("hrXato")} />}
      {r && r !== "xato" && r.length === 0 && (
        <p className="rounded-clay bg-karta p-5 text-center text-[14.5px] leading-snug text-ink-dim shadow-clay-sm">
          {t("quizBoshIzoh")}
        </p>
      )}
      {r && r !== "xato" && r.length > 0 && (
        <Guruh nom={t("quizMeniki")}>
          {r.map((q) => (
            <button key={q.id} type="button" onClick={() => onOch(q.id)} data-tahlil="Quiz: ochish"
              className="clay-press flex min-h-[58px] w-full items-center gap-3 px-3.5 py-2 text-left">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[16px]">{q.nom}</span>
                <span className="block truncate text-[13px] text-ink-dim">
                  {t("quizSavolSoni", { n: q.savol })} · {t(q.rejim === "jonli" ? "quizRejimJonli" : "quizRejimOz")}
                </span>
              </span>
              <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
            </button>
          ))}
        </Guruh>
      )}
    </div>
  );
}

/* ==================== muharrir ==================== */

export function QuizMuharrir({ id, onSaqlandi, onChiq }: {
  id?: number; onSaqlandi: (id: number) => void; onChiq: () => void;
}) {
  const [yuklandi, setYuklandi] = useState<QuizToliq | null | "yangi" | "xato">(id ? null : "yangi");
  const [nom, setNom] = useState("");
  const [rejim, setRejim] = useState<Rejim>("oz");
  const [savollar, setSavollar] = useState<Savol[]>([]);
  /** Ochiq varaq: savol tartibi (`-1` — yangi savol) yoki bazadan qo'shish. */
  const [varaq, setVaraq] = useState<number | "baza" | "tur" | "matn" | "ai" | "fayl" | null>(null);
  const [ketmoqda, setKetmoqda] = useState(false);
  const [xato, setXato] = useState("");
  const [ozgardi, setOzgardi] = useState(false);
  /**
   * AI ishlayaptimi. O'chiq bo'lsa (kalit yo'q yoki kredit tugagan) AI
   * qatorlari umuman ko'rinmaydi — `ai.py` dagi qoida: ishlamaydigan
   * eshik ko'rsatilmaydi. Premium emasligi esa varaq ichida aytiladi.
   */
  const [aiBor, setAiBor] = useState(false);
  useEffect(() => { aiHolat().then((x) => setAiBor(x.yoqilgan), () => {}); }, []);

  useEffect(() => {
    if (!id) return;
    let tirik = true;
    quizOch(id).then((q) => {
      if (!tirik) return;
      setYuklandi(q);
      setNom(q.nom);
      setRejim(q.rejim);
      setSavollar(q.savollar);
    }, () => { if (tirik) setYuklandi("xato"); });
    return () => { tirik = false; };
  }, [id]);

  // Orqaga: yozilganni jimgina yo'qotmaslik — Telegram'ning orqaga
  // tugmasi ham shu yerdan o'tadi (`useOrqaga`).
  const chiq = () => {
    if (varaq !== null) { setVaraq(null); return; }
    if (ozgardi && !window.confirm(t("quizChiqSorov"))) return;
    onChiq();
  };

  const ozgar = <T,>(f: (x: T) => void) => (x: T) => { f(x); setOzgardi(true); setXato(""); };
  const setNomO = ozgar(setNom);
  const setRejimO = ozgar(setRejim);
  const setSavollarO = ozgar(setSavollar);

  const tayyor = nom.trim().length >= 2 && savollar.length > 0 && savollar.every(savolTayyor);

  const saqla = async () => {
    if (!tayyor || ketmoqda) return;
    const eski = yuklandi && typeof yuklandi === "object" ? yuklandi : null;
    // Savollar o'zgarsa eski natijalar o'chadi (`quiz.yangila`) — oldindan aytiladi.
    if (eski && eski.ishlagan > 0 && JSON.stringify(eski.savollar) !== JSON.stringify(savollar)
        && !window.confirm(t("quizNatijaOchadi", { n: eski.ishlagan }))) return;
    setKetmoqda(true);
    setXato("");
    const d = { nom: nom.trim(), rejim, savollar: savollar.map((s) => ({
      ...s, matn: s.matn.trim(), javob: s.javob.trim(),
      variantlar: s.tur === "variant" || s.tur === "tartib" ? s.variantlar.map((v) => v.trim()).filter(Boolean) : [],
      ...(s.juftlar ? { juftlar: s.juftlar.map(([a, b]) => [a.trim(), b.trim()] as [string, string]) } : {}),
    })) };
    try {
      const q = eski ? await quizSaqla(eski.id, d) : await quizYarat(d);
      tebrat("yutuq");
      onSaqlandi(q.id);
    } catch (e) {
      setKetmoqda(false);
      setXato(t(xatoKodi(e) === 429 ? "quizKunlikChek" : "quizSaqlanmadi"));
    }
  };

  if (yuklandi === null) return <div className={QOBIQ}><Sarlavha nom={t("quizTahrir")} onChiq={onChiq} /><Holat matn={t("quizYuklanmoqda")} /></div>;
  if (yuklandi === "xato") return <div className={QOBIQ}><Sarlavha nom={t("quizTahrir")} onChiq={onChiq} /><Holat matn={t("quizTopilmadi")} /></div>;

  const qoshish = (yangi: Savol[]) => setSavollarO([...savollar, ...yangi].slice(0, MAX_SAVOL));

  return (
    <div className={`${QOBIQ} pb-28`}>
      <Sarlavha nom={id ? t("quizTahrir") : t("quizYangi")} onChiq={chiq} />

      <input value={nom} onChange={(e) => setNomO(e.target.value.slice(0, 80))} placeholder={t("quizNomJoy")}
        aria-label={t("quizNomJoy")}
        className="h-[52px] rounded-2xl border-2 border-track bg-karta px-4 font-display text-[18px] outline-none
                   placeholder:font-sans placeholder:text-[16px] placeholder:text-ink-dim focus:border-brand-blue" />

      {/* Rejim — almashtirgich, ostida bir qator izoh: tanlov nimani
          o'zgartirishini muallif shu yerning o'zida ko'rsin. */}
      <div className="flex flex-col gap-1.5">
        <div role="radiogroup" aria-label={t("quizRejim")} className="shadow-ichki flex rounded-2xl bg-sahna p-1">
          {(["oz", "jonli"] as const).map((r) => (
            <button key={r} type="button" role="radio" aria-checked={rejim === r} onClick={() => setRejimO(r)}
              data-tahlil={`Quiz: rejim ${r}`}
              className={`clay-press min-h-11 flex-1 rounded-xl px-2 text-[14.5px] font-bold ${
                rejim === r ? "bg-karta text-brand-blue-t shadow-clay-sm" : "text-ink-soft"}`}>
              {t(r === "jonli" ? "quizRejimJonli" : "quizRejimOz")}
            </button>
          ))}
        </div>
        <p className="px-1 text-[13px] leading-snug text-ink-dim">
          {t(rejim === "jonli" ? "quizRejimJonliIzoh" : "quizRejimOzIzoh")}
        </p>
      </div>

      <div className="flex items-baseline justify-between px-1 pt-1">
        <h2 className="font-display text-[17px]">{t("quizSavollar")}</h2>
        {savollar.length > 0 && <span className="text-[13px] text-ink-dim">{savollar.length} / {MAX_SAVOL}</span>}
      </div>

      {savollar.length > 0 && (
        <ol className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
          {savollar.map((s, i) => (
            <li key={i}>
              <button type="button" onClick={() => setVaraq(i)} data-tahlil="Quiz: savolni ochish"
                className="clay-press flex min-h-14 w-full items-center gap-3 px-3.5 py-2 text-left">
                <span className="w-5 shrink-0 text-center font-display text-[14px] text-ink-dim">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px]">{savolQisqa(s) || t("quizSavolBosh")}</span>
                  <span className={`block truncate text-[12.5px] ${savolTayyor(s) ? "text-ink-dim" : "text-brand-red"}`}>
                    {savolTayyor(s)
                      ? `${t(TUR_NOMI[s.tur])}${rejim === "jonli" ? ` · ${s.vaqt} ${t("quizSoniya")}` : ""}`
                      : t("quizChala")}
                  </span>
                </span>
                {/* Istisnolar belgilanadi: oltin savol (amber — mukofot) va AI yozgani. */}
                {s.oltin && rejim === "jonli" && <Icon name="star" size={16} className="shrink-0 text-brand-gold-d" />}
                {s.ai && (
                  <span className="shrink-0 rounded-md bg-track px-1.5 py-0.5 text-[11px] font-bold text-ink-soft">AI</span>
                )}
                <Icon name="pencil" size={16} className="shrink-0 text-ink-dim" />
              </button>
            </li>
          ))}
        </ol>
      )}

      {savollar.length < MAX_SAVOL && (
        <button type="button" onClick={() => setVaraq("tur")} data-tahlil="Quiz: savol qo'shish"
          className="clay-press flex min-h-[52px] items-center justify-center gap-2 rounded-[20px] border-2 border-dashed
                     border-track font-display text-[16px] font-bold text-brand-blue-t">
          <Icon name="plus" size={18} />{t("quizSavolQosh")}
        </button>
      )}

      {xato && <p className="text-center text-[14px] text-brand-red">{xato}</p>}

      {/* "Saqlash" pastda qotib turadi: uzun ro'yxatda u har doim qo'l ostida. */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-[var(--az-body)]/95 px-4 pt-2
                      pb-[max(14px,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <div className="mx-auto max-w-[430px] sm:max-w-[560px] kom:max-w-[720px]">
          <button type="button" onClick={saqla} disabled={!tayyor || ketmoqda} data-tahlil="Quiz: saqlash"
            className={ASOSIY}>
            {ketmoqda ? t("quizSaqlanmoqda") : t("quizSaqlash")}
          </button>
        </div>
      </div>

      {varaq === "tur" && (
        <Varaq sarlavha={t("quizSavolQosh")} onYop={() => setVaraq(null)}>
          <div className="flex flex-col gap-2">
            <TurKarta ic="pencil" nom={t("quizOzimYozaman")} izoh={t("quizOzimYozamanIzoh")}
              on={() => setVaraq(-1)} tahlil="Quiz: o'zim yozaman" />
            <TurKarta ic="search" nom={t("quizBazadan")} izoh={t("quizBazadanIzoh")}
              on={() => setVaraq("baza")} tahlil="Quiz: bazadan" />
            <TurKarta ic="menu" nom={t("quizMatndan")} izoh={t("quizMatndanIzoh")}
              on={() => setVaraq("matn")} tahlil="Quiz: matndan" />
            {aiBor && (
              <>
                <TurKarta ic="phone" nom={t("quizFayldan")} izoh={t("quizFayldanIzoh")}
                  on={() => setVaraq("fayl")} tahlil="Quiz: rasm yoki PDF" />
                <TurKarta ic="star" nom={t("quizAiYasaydi")} izoh={t("quizAiYasaydiIzoh")}
                  on={() => setVaraq("ai")} tahlil="Quiz: AI yasaydi" />
              </>
            )}
          </div>
        </Varaq>
      )}
      {typeof varaq === "number" && (
        <SavolVaraq key={varaq} boshlangich={varaq >= 0 ? savollar[varaq]! : bosh()} jonli={rejim === "jonli"}
          tartib={varaq} jami={savollar.length}
          onSaqla={(s) => {
            setSavollarO(varaq >= 0 ? savollar.map((x, i) => (i === varaq ? s : x)) : [...savollar, s]);
            setVaraq(null);
          }}
          onOchir={varaq >= 0 ? () => { setSavollarO(savollar.filter((_, i) => i !== varaq)); setVaraq(null); } : undefined}
          onSur={varaq >= 0 ? (d) => {
            const j = varaq + d;
            if (j < 0 || j >= savollar.length) return;
            const r = [...savollar];
            [r[varaq], r[j]] = [r[j]!, r[varaq]!];
            setSavollarO(r);
            setVaraq(j);
          } : undefined}
          onYop={() => setVaraq(null)} />
      )}
      {varaq === "baza" && (
        <BazaVaraq joy={MAX_SAVOL - savollar.length}
          onQosh={(s) => { qoshish(s); setVaraq(null); tebrat("tanlov"); }} onYop={() => setVaraq(null)} />
      )}
      {varaq === "matn" && (
        <MatnVaraq joy={MAX_SAVOL - savollar.length}
          onQosh={(s) => { qoshish(s); setVaraq(null); tebrat("tanlov"); }} onYop={() => setVaraq(null)} />
      )}
      {(varaq === "ai" || varaq === "fayl") && (
        <AiVaraq fayl={varaq === "fayl"} joy={MAX_SAVOL - savollar.length}
          onQosh={(s) => { qoshish(s); setVaraq(null); tebrat("yutuq"); }} onYop={() => setVaraq(null)} />
      )}
    </div>
  );
}

/** Savol turining nomi — ro'yxat qatori va tur tanlagichda. */
const TUR_NOMI: Record<SavolTur, Kalit> = {
  variant: "quizTurVariant", yozma: "quizTurYozma", rost: "quizTurRost", tartib: "quizTurTartib", juftlash: "quizTurJuft",
};

function TurKarta({ ic, nom, izoh, on, tahlil }: {
  ic: IconName; nom: string; izoh: string; on: () => void; tahlil: string;
}) {
  return (
    <button type="button" onClick={on} data-tahlil={tahlil}
      className="clay-press flex min-h-[60px] items-center gap-3 rounded-2xl bg-sahna px-3.5 py-2.5 text-left ring-1 ring-track">
      <Icon name={ic} size={22} className="shrink-0 text-brand-blue-t" />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[16px] leading-tight">{nom}</span>
        <span className="block text-[12.5px] leading-snug text-ink-dim">{izoh}</span>
      </span>
      <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
    </button>
  );
}

/**
 * Pastdan chiqadigan varaq — USTUN, aylantiriladigan.
 *
 * `TanlovVaraq` (components/Varaq.tsx) qisqa tanlovlar uchun: uning ichi
 * qatorga o'raladi va bo'yi cheklanmagan. Savol formasi esa telefonda
 * ekrandan uzun bo'ladi va klaviatura ham ochiladi.
 */
function Varaq({ sarlavha, onYop, children, past }: {
  sarlavha: string; onYop: () => void; children: ReactNode; past?: ReactNode;
}) {
  return (
    <div onClick={onYop} role="dialog" aria-modal="true" aria-label={sarlavha}
      className="az-kanal-fon fixed inset-0 z-[80] grid place-items-end bg-black/45 backdrop-blur-[2px]
                 sm:place-items-center sm:p-4">
      <div onClick={(e) => e.stopPropagation()}
        className="az-kanal flex max-h-[92dvh] w-full flex-col rounded-t-clay bg-karta shadow-clay
                   sm:max-w-[480px] sm:rounded-clay">
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <h2 className="min-w-0 flex-1 truncate font-display text-[17px] leading-tight">{sarlavha}</h2>
          <button type="button" onClick={onYop} aria-label={t("yopish")}
            className="clay-press grid size-10 shrink-0 place-items-center rounded-full bg-sahna text-ink-dim">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">{children}</div>
        {past && <div className="border-t border-track px-4 pt-3 pb-[calc(1rem+var(--az-past,0px))] sm:pb-4">{past}</div>}
      </div>
    </div>
  );
}

const MAYDON = "w-full rounded-2xl border-2 border-track bg-karta px-3.5 text-[16px] outline-none "
  + "placeholder:text-ink-dim focus:border-brand-blue";

function SavolVaraq({ boshlangich, jonli, tartib, jami, onSaqla, onOchir, onSur, onYop }: {
  boshlangich: Savol; jonli: boolean; tartib: number; jami: number;
  onSaqla: (s: Savol) => void; onOchir?: () => void; onSur?: (d: -1 | 1) => void; onYop: () => void;
}) {
  const [s, setS] = useState<Savol>(boshlangich);
  /**
   * To'g'ri variant TARTIBI faqat shu varaq ichida yashaydi. Saqlanganda
   * u variantning MATNIGA aylanadi (`Savol.javob`) — `MasalaYangi` dagi sabab.
   */
  const [togriI, setTogriI] = useState(() => Math.max(0, boshlangich.variantlar.indexOf(boshlangich.javob)));

  const yakuniy: Savol = s.tur === "variant" ? { ...s, javob: (s.variantlar[togriI] ?? "").trim() } : s;
  const tayyor = savolTayyor(yakuniy);
  const takror = s.tur === "variant"
    && new Set(s.variantlar.map((v) => v.trim()).filter(Boolean)).size !== s.variantlar.map((v) => v.trim()).filter(Boolean).length;

  const variant = (i: number, v: string) =>
    setS({ ...s, variantlar: s.variantlar.map((x, k) => (k === i ? v.slice(0, MAX_VARIANT_MATN) : x)) });
  const variantOchir = (i: number) => {
    setS({ ...s, variantlar: s.variantlar.filter((_, k) => k !== i) });
    if (togriI === i) setTogriI(0);
    else if (togriI > i) setTogriI(togriI - 1);
  };

  return (
    <Varaq sarlavha={tartib >= 0 ? t("quizSavolN", { n: tartib + 1 }) : t("quizYangiSavol")} onYop={onYop}
      past={(
        <button type="button" disabled={!tayyor} onClick={() => onSaqla(yakuniy)} data-tahlil="Quiz: savol tayyor"
          className={ASOSIY}>
          {t("quizTayyor")}
        </button>
      )}>
      {/* Bazadan olingan savol — generator yozgan: matni va variantlari
          tahrirlanadi, chizmasi esa o'sha holicha qoladi. */}
      {!s.a && (
        <div role="radiogroup" aria-label={t("quizTur")} className="flex flex-wrap gap-1.5">
          {SAVOL_TURLARI.map((r) => (
            <Tanlov key={r} faol={s.tur === r} on={() => { if (s.tur !== r) { setS(turgaOtkaz(s, r)); setTogriI(0); } }}>
              {t(TUR_NOMI[r])}
            </Tanlov>
          ))}
        </div>
      )}
      {s.ai && (
        <p className="shadow-ichki rounded-2xl bg-sahna px-3.5 py-2.5 text-[13px] leading-snug text-ink-soft">
          {t("quizAiTekshir")}
        </p>
      )}

      {/* Bazadan olingan savolning chizmasi (formula, soat, shakl) — yechuvchi
          ko'radigan ko'rinishda; muallif nima tahrirlayotganini bilsin. */}
      {s.a && sahnaBor(s.a as Activity) && (
        <div className="pointer-events-none grid max-h-[200px] shrink-0 place-items-center overflow-hidden rounded-2xl
                        bg-sahna p-3 ring-1 ring-track ring-inset">
          {/* Tenglamada shart pastdagi maydonda turibdi — bu yerda faqat formula. */}
          {s.a.type === "eqn"
            ? <span className="text-center font-display text-[24px] leading-tight break-words">{savolQisqa({ matn: "", a: s.a })}</span>
            : <QuestionView a={s.a as Activity} />}
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizShart")}</span>
        <textarea value={s.matn} onChange={(e) => setS({ ...s, matn: e.target.value.slice(0, MAX_MATN) })}
          rows={3} placeholder={t("quizShartJoy")} className={`${MAYDON} min-h-[88px] resize-none py-3 leading-snug`} />
      </label>

      {s.tur === "variant" ? (
        <div className="flex flex-col gap-2">
          <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizVariantlar")}</span>
          {s.variantlar.map((v, i) => {
            const togri = togriI === i;
            return (
              <div key={i} className="flex items-center gap-2">
                {/* Doira — "to'g'ri javob shu". Yashil: to'g'ri javob ma'nosi. */}
                <button type="button" onClick={() => setTogriI(i)} aria-pressed={togri}
                  aria-label={t("quizTogriShu", { h: HARFLAR[i] ?? String(i + 1) })}
                  className={`grid size-11 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold ${
                    togri ? "bg-brand-green text-white" : "bg-track text-ink-soft"}`}>
                  {togri ? <Icon name="check" size={18} /> : (HARFLAR[i] ?? i + 1)}
                </button>
                <input value={v} onChange={(e) => variant(i, e.target.value)}
                  placeholder={t("quizVariantJoy", { h: HARFLAR[i] ?? String(i + 1) })}
                  className={`${MAYDON} h-11 min-w-0 flex-1`} />
                {s.variantlar.length > MIN_VARIANT && (
                  <button type="button" onClick={() => variantOchir(i)} aria-label={t("quizVariantOchir")}
                    className="clay-press grid size-11 shrink-0 place-items-center rounded-xl text-ink-dim">
                    <Icon name="close" size={15} />
                  </button>
                )}
              </div>
            );
          })}
          {s.variantlar.length < MAX_VARIANT && (
            <button type="button" onClick={() => setS({ ...s, variantlar: [...s.variantlar, ""] })}
              className="clay-press flex min-h-11 items-center gap-2 self-start px-1 text-[14.5px] font-bold text-brand-blue-t">
              <Icon name="plus" size={16} />{t("quizVariantQosh")}
            </button>
          )}
          <p className="px-1 text-[12.5px] leading-snug text-ink-dim">
            {takror ? t("quizVariantTakror") : t("quizTogriIzoh")}
          </p>
        </div>
      ) : s.tur === "rost" ? (
        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizRostSorov")}</span>
          <RostTanla value={s.javob} togri={null} onChange={(v) => setS({ ...s, javob: v })} />
        </div>
      ) : s.tur === "tartib" ? (
        <RoyxatMaydon nom={t("quizTartibElementlar")} izoh={t("quizTartibYozIzoh")} qiymat={s.variantlar}
          min={MIN_TARTIB} max={MAX_TARTIB} onChange={(v) => setS({ ...s, variantlar: v })} raqamli />
      ) : s.tur === "juftlash" ? (
        <JuftMaydon qiymat={s.juftlar ?? []} onChange={(j) => setS({ ...s, juftlar: j })} />
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizJavob")}</span>
          <input value={s.javob} onChange={(e) => setS({ ...s, javob: e.target.value.slice(0, MAX_VARIANT_MATN) })}
            placeholder={t("quizJavobJoy")} className={`${MAYDON} h-12`} />
          <span className="px-1 text-[12.5px] leading-snug text-ink-dim">{t("quizJavobIzoh")}</span>
        </label>
      )}

      {/* Vaqt faqat jonli o'yinda ma'noli: o'z tezligida umumiy soat bor
          va u savollar vaqtidan yig'iladi — shuning uchun baribir saqlanadi. */}
      <div className="flex flex-col gap-1.5">
        <span className="px-1 text-[13px] font-bold text-ink-dim">
          {t(jonli ? "quizVaqtJonli" : "quizVaqtOz")}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {VAQTLAR.map((v) => (
            <Tanlov key={v} faol={s.vaqt === v} on={() => setS({ ...s, vaqt: v })}>{v} {t("quizSoniya")}</Tanlov>
          ))}
        </div>
      </div>

      {/* Oltin savol — faqat jonli o'yinda ma'noli (ball ikki baravar). */}
      {jonli && (
        <button type="button" role="switch" aria-checked={Boolean(s.oltin)} onClick={() => setS({ ...s, oltin: !s.oltin })}
          data-tahlil="Quiz: oltin savol"
          className="clay-press flex min-h-[52px] items-center gap-3 rounded-2xl bg-sahna px-3.5 py-2 text-left ring-1 ring-track">
          <Icon name="star" size={20} className={s.oltin ? "text-brand-gold-d" : "text-ink-dim"} />
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">{t("quizOltin")}</span>
            <span className="block text-[12.5px] text-ink-dim">{t("quizOltinIzoh")}</span>
          </span>
          <span className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
            s.oltin ? "justify-end bg-brand-gold" : "justify-start bg-track"}`}>
            <span className="size-5 rounded-full bg-white shadow-clay-sm" />
          </span>
        </button>
      )}

      {(onSur || onOchir) && (
        <div className="flex items-center gap-1 pt-1">
          {onSur && (
            <>
              <button type="button" onClick={() => onSur(-1)} disabled={tartib <= 0} aria-label={t("quizYuqoriga")}
                title={t("quizYuqoriga")}
                className="clay-press grid size-11 place-items-center rounded-xl bg-track text-ink-soft disabled:opacity-35">
                <Icon name="chevron" size={18} className="-rotate-90" />
              </button>
              <button type="button" onClick={() => onSur(1)} disabled={tartib >= jami - 1} aria-label={t("quizPastga")}
                title={t("quizPastga")}
                className="clay-press grid size-11 place-items-center rounded-xl bg-track text-ink-soft disabled:opacity-35">
                <Icon name="chevron" size={18} className="rotate-90" />
              </button>
            </>
          )}
          {onOchir && (
            <button type="button" onClick={onOchir} data-tahlil="Quiz: savolni o'chirish"
              className="clay-press ml-auto min-h-11 px-2 text-[14px] font-semibold text-ink-dim">
              {t("quizSavolOchir")}
            </button>
          )}
        </div>
      )}
    </Varaq>
  );
}

/**
 * Bazadan — ikki yo'l:
 *   mavzu       sinf → bob → nechta savol (generatordan)
 *   to'liq test sinf testi, DTM varianti yoki test to'plami — bir bosishda
 * Savollar shu zahoti yasalib, ro'yxatga tushadi.
 */
function BazaVaraq({ joy, onQosh, onYop }: { joy: number; onQosh: (s: Savol[]) => void; onYop: () => void }) {
  const [bolim, setBolim] = useState<"mavzu" | "toliq">("mavzu");
  const [sinf, setSinf] = useState(9);
  const [bob, setBob] = useState<Bob | null>(null);
  const [soni, setSoni] = useState(5);
  const [yoq, setYoq] = useState(false);
  const [manba, setManba] = useState<TayyorManba | null>(null);
  const [toplamlar, setToplamlar] = useState<Toplam[] | null>(null);
  const [yuklanmoqda, setYuklanmoqda] = useState(false);
  const boblar = useMemo(() => bazaBoblari(sinf), [sinf]);
  /** Bir sinfda ikki fan bo'lsa (algebra va geometriya) — bob ostida fan nomi. */
  const ikkiFan = new Set(boblar.map((b) => b.kursId)).size > 1;
  const n = Math.min(soni, joy);

  useEffect(() => {
    if (bolim !== "toliq" || toplamlar !== null) return;
    toplamRoyxat().then((x) => setToplamlar(x.royxat), () => setToplamlar([]));
  }, [bolim, toplamlar]);

  const qosh = async () => {
    setYoq(false);
    if (bolim === "mavzu") {
      if (!bob) return;
      const s = bazadanYasa(sinf, bob, n, 20);
      if (!s.length) { setYoq(true); return; }
      onQosh(s);
      return;
    }
    if (!manba || yuklanmoqda) return;
    setYuklanmoqda(true);
    const s = (await tayyorTest(manba, 20).catch(() => [])).slice(0, joy);
    setYuklanmoqda(false);
    if (!s.length) { setYoq(true); return; }
    onQosh(s);
  };
  const bir = (a: TayyorManba | null, b: TayyorManba) => JSON.stringify(a) === JSON.stringify(b);

  return (
    <Varaq sarlavha={t("quizBazadan")} onYop={onYop}
      past={(
        <button type="button" onClick={() => void qosh()} data-tahlil="Quiz: bazadan qo'shish"
          disabled={bolim === "mavzu" ? !bob || n < 1 : !manba || yuklanmoqda} className={ASOSIY}>
          {bolim === "mavzu" ? t("quizBazaQosh", { n })
            : yuklanmoqda ? t("quizYuklanmoqda") : t("quizToliqQosh")}
        </button>
      )}>
      <div role="radiogroup" aria-label={t("quizBazadan")} className="shadow-ichki flex shrink-0 rounded-2xl bg-sahna p-1">
        {(["mavzu", "toliq"] as const).map((r) => (
          <button key={r} type="button" role="radio" aria-checked={bolim === r} onClick={() => { setBolim(r); setYoq(false); }}
            className={`clay-press min-h-11 flex-1 rounded-xl px-2 text-[14px] font-bold ${
              bolim === r ? "bg-karta text-brand-blue-t shadow-clay-sm" : "text-ink-soft"}`}>
            {t(r === "mavzu" ? "quizMavzuBoyicha" : "quizToliqTest")}
          </button>
        ))}
      </div>

      {bolim === "mavzu" ? (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizSinf")}</span>
            <div className="flex flex-wrap gap-1.5">
              {BAZA_SINFLAR.map((x) => (
                <Tanlov key={x} faol={sinf === x} on={() => { setSinf(x); setBob(null); setYoq(false); }}>
                  {t("quizSinfN", { n: x })}
                </Tanlov>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizMavzu")}</span>
            <div className="flex flex-col divide-y divide-track overflow-hidden rounded-2xl bg-sahna ring-1 ring-track ring-inset">
              {boblar.map((b) => {
                const faol = bob?.kursId === b.kursId && bob.ui === b.ui;
                return (
                  <button key={`${b.kursId}-${b.ui}`} type="button" aria-pressed={faol}
                    onClick={() => { setBob(b); setYoq(false); }}
                    className={`clay-press flex min-h-12 items-center gap-2.5 px-3.5 py-2 text-left ${faol ? "bg-brand-blue/10" : ""}`}>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[14.5px] leading-snug ${faol ? "font-bold text-brand-blue-t" : ""}`}>
                        {kursMatn(b.nom).replace(/^\d+-bob\.\s*|^Глава \d+\.\s*/, "")}
                      </span>
                      {/* Sinf tepada tanlangan — bu yerda faqat fan ("Algebra"). */}
                      {ikkiFan && (
                        <span className="block text-[12px] text-ink-dim">
                          {kursMatn(b.kursNomi).replace(/^\d+[-\s]?(sinf|класс)\s*/i, "")}
                        </span>
                      )}
                    </span>
                    {faol && <Icon name="check" size={18} className="shrink-0 text-brand-blue-t" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizNechta")}</span>
            <div className="flex flex-wrap gap-1.5">
              {[3, 5, 10].map((x) => (
                <Tanlov key={x} faol={soni === x} on={() => setSoni(x)}>{x}</Tanlov>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="px-1 text-[13px] leading-snug text-ink-dim">{t("quizToliqIzoh", { n: joy })}</p>
          <div className="flex flex-col gap-1.5">
            <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizSinfTesti")}</span>
            <div className="flex flex-wrap gap-1.5">
              {BAZA_SINFLAR.map((x) => (
                <Tanlov key={x} faol={bir(manba, { tur: "sinf", sinf: x })} on={() => setManba({ tur: "sinf", sinf: x })}>
                  {t("quizSinfN", { n: x })}
                </Tanlov>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizDtmVariant")}</span>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: DTM_VARIANT }, (_, k) => k + 1).map((x) => (
                <Tanlov key={x} faol={bir(manba, { tur: "dtm", n: x })} on={() => setManba({ tur: "dtm", n: x })}>{x}</Tanlov>
              ))}
            </div>
          </div>
          {toplamlar && toplamlar.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizToplamlar")}</span>
              <div className="flex flex-col divide-y divide-track overflow-hidden rounded-2xl bg-sahna ring-1 ring-track ring-inset">
                {toplamlar.map((x) => {
                  const m: TayyorManba = { tur: "toplam", sinf: x.sinf, urug: x.urug, savol: x.savol, daqiqa: x.daqiqa };
                  const faol = bir(manba, m);
                  return (
                    <button key={x.id} type="button" aria-pressed={faol} onClick={() => setManba(m)}
                      className={`clay-press flex min-h-12 items-center gap-2.5 px-3.5 py-2 text-left ${faol ? "bg-brand-blue/10" : ""}`}>
                      <span className={`min-w-0 flex-1 text-[14.5px] leading-snug ${faol ? "font-bold text-brand-blue-t" : ""}`}>
                        {x.nom}
                      </span>
                      <span className="shrink-0 text-[12.5px] text-ink-dim">{t("quizSavolSoni", { n: x.savol })}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
      {yoq && <p className="text-center text-[14px] text-ink-dim">{t("quizBazaYoq")}</p>}
    </Varaq>
  );
}

/**
 * Ro'yxat maydoni — tartiblash elementlari (TO'G'RI tartibda yoziladi).
 * `raqamli` — chap tomonda tartib raqami: muallif nimani yozayotganini ko'rsin.
 */
function RoyxatMaydon({ nom, izoh, qiymat, min, max, onChange, raqamli = false }: {
  nom: string; izoh: string; qiymat: string[]; min: number; max: number; onChange: (v: string[]) => void; raqamli?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="px-1 text-[13px] font-bold text-ink-dim">{nom}</span>
      {qiymat.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          {raqamli && (
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-track font-display text-[15px] text-ink-soft">
              {i + 1}
            </span>
          )}
          <input value={v} onChange={(e) => onChange(qiymat.map((x, k) => (k === i ? e.target.value.slice(0, MAX_VARIANT_MATN) : x)))}
            className={`${MAYDON} h-11 min-w-0 flex-1`} aria-label={`${nom} ${i + 1}`} />
          {qiymat.length > min && (
            <button type="button" onClick={() => onChange(qiymat.filter((_, k) => k !== i))} aria-label={t("quizVariantOchir")}
              className="clay-press grid size-11 shrink-0 place-items-center rounded-xl text-ink-dim">
              <Icon name="close" size={15} />
            </button>
          )}
        </div>
      ))}
      {qiymat.length < max && (
        <button type="button" onClick={() => onChange([...qiymat, ""])}
          className="clay-press flex min-h-11 items-center gap-2 self-start px-1 text-[14.5px] font-bold text-brand-blue-t">
          <Icon name="plus" size={16} />{t("quizVariantQosh")}
        </button>
      )}
      <p className="px-1 text-[12.5px] leading-snug text-ink-dim">{izoh}</p>
    </div>
  );
}

/** Juftlar maydoni — har qatorda chap va o'ng. */
function JuftMaydon({ qiymat, onChange }: { qiymat: [string, string][]; onChange: (v: [string, string][]) => void }) {
  const ozgar = (i: number, k: 0 | 1, v: string) =>
    onChange(qiymat.map((j, n) => (n === i ? (k === 0 ? [v.slice(0, MAX_VARIANT_MATN), j[1]] : [j[0], v.slice(0, MAX_VARIANT_MATN)]) : j)));
  return (
    <div className="flex flex-col gap-2">
      <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizJuftlar")}</span>
      {qiymat.map(([a, b], i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input value={a} onChange={(e) => ozgar(i, 0, e.target.value)} placeholder={t("quizJuftChap")}
            className={`${MAYDON} h-11 min-w-0 flex-1 px-2.5`} aria-label={`${t("quizJuftChap")} ${i + 1}`} />
          <Icon name="chevron" size={14} className="shrink-0 text-ink-dim" />
          <input value={b} onChange={(e) => ozgar(i, 1, e.target.value)} placeholder={t("quizJuftOng")}
            className={`${MAYDON} h-11 min-w-0 flex-1 px-2.5`} aria-label={`${t("quizJuftOng")} ${i + 1}`} />
          {qiymat.length > MIN_JUFT && (
            <button type="button" onClick={() => onChange(qiymat.filter((_, k) => k !== i))} aria-label={t("quizVariantOchir")}
              className="clay-press grid size-10 shrink-0 place-items-center rounded-xl text-ink-dim">
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      ))}
      {qiymat.length < MAX_JUFT && (
        <button type="button" onClick={() => onChange([...qiymat, ["", ""]])}
          className="clay-press flex min-h-11 items-center gap-2 self-start px-1 text-[14.5px] font-bold text-brand-blue-t">
          <Icon name="plus" size={16} />{t("quizJuftQosh")}
        </button>
      )}
      <p className="px-1 text-[12.5px] leading-snug text-ink-dim">{t("quizJuftYozIzoh")}</p>
    </div>
  );
}

/** Matndan — ko'chirib qo'yilgan test darhol tahlil qilinadi va natija oldindan ko'rinadi. */
function MatnVaraq({ joy, onQosh, onYop }: { joy: number; onQosh: (s: Savol[]) => void; onYop: () => void }) {
  const [matn, setMatn] = useState("");
  const natija = useMemo(() => matndanSavollar(matn), [matn]);
  const n = Math.min(natija.savollar.length, joy);
  return (
    <Varaq sarlavha={t("quizMatndan")} onYop={onYop}
      past={(
        <button type="button" disabled={n < 1} onClick={() => onQosh(natija.savollar.slice(0, joy))}
          data-tahlil="Quiz: matndan qo'shish" className={ASOSIY}>
          {t("quizBazaQosh", { n })}
        </button>
      )}>
      <p className="px-1 text-[13px] leading-snug text-ink-dim">{t("quizMatnIzoh")}</p>
      <textarea value={matn} onChange={(e) => setMatn(e.target.value.slice(0, 30000))} rows={10}
        placeholder={"1. 2x + 6 = 14. x = ?\nA) 3  B) 4*  C) 5\n\n2. ...\n\nJavoblar: 1-B, 2-C"}
        aria-label={t("quizMatndan")}
        className={`${MAYDON} min-h-[200px] shrink-0 resize-y py-3 font-mono text-[14px] leading-snug`} />
      {matn.trim() !== "" && (
        <p className={`px-1 text-[13.5px] ${natija.savollar.length ? "text-ink-soft" : "text-brand-red"}`}>
          {natija.savollar.length
            ? t(natija.chala ? "quizMatnTopildiChala" : "quizMatnTopildi", { n: natija.savollar.length, c: natija.chala })
            : t("quizMatnTopilmadi")}
        </p>
      )}
    </Varaq>
  );
}

/**
 * AI — mavzudan yasaydi yoki rasm/PDF dagi testni o'qiydi (`core/quiz_ai.py`).
 * Faqat Premium: boshqalarga varaq nima qilishini aytadi va Premium'ga yo'l ko'rsatadi.
 */
function AiVaraq({ fayl: faylRejim, joy, onQosh, onYop }: {
  fayl: boolean; joy: number; onQosh: (s: Savol[]) => void; onYop: () => void;
}) {
  const nav = useNavigate();
  const [holat, setHolat] = useState<AiHolat | null | "xato">(null);
  const [matn, setMatn] = useState("");
  const [soni, setSoni] = useState(10);
  const [fayl, setFayl] = useState<File | null>(null);
  const [ish, setIsh] = useState<AiIsh | null>(null);
  const [xato, setXato] = useState("");

  useEffect(() => { aiHolat().then(setHolat, () => setHolat("xato")); }, []);

  // Ish fonda yuradi — tayyor bo'lguncha har 2 soniyada so'raymiz.
  useEffect(() => {
    if (!ish || ish.holat !== "kutilmoqda") return;
    const id = setInterval(() => {
      aiIsh(ish.id).then((x) => {
        setIsh(x);
        if (x.holat === "tayyor") onQosh(x.savollar.slice(0, joy));
        if (x.holat === "xato") setXato(t("quizAiXato"));
      }, () => {});
    }, 2000);
    return () => clearInterval(id);
  }, [ish, joy, onQosh]);

  const n = Math.min(soni, joy);
  const kutilmoqda = ish?.holat === "kutilmoqda";
  const tayyor = faylRejim ? fayl !== null : matn.trim().length >= 3;
  const boshla = async () => {
    if (!tayyor || kutilmoqda) return;
    setXato("");
    try {
      setIsh(await aiBoshla(matn.trim(), n, til(), fayl ?? undefined));
    } catch (e) {
      const k = xatoKodi(e);
      setXato(t(k === 429 ? "quizAiChegara" : k === 400 ? "quizAiFayl" : "quizAiXato"));
    }
  };

  const sarlavha = t(faylRejim ? "quizFayldan" : "quizAiYasaydi");
  if (holat === null) return <Varaq sarlavha={sarlavha} onYop={onYop}><Holat matn={t("quizYuklanmoqda")} /></Varaq>;
  if (holat === "xato" || !holat.yoqilgan) {
    return <Varaq sarlavha={sarlavha} onYop={onYop}><Holat matn={t("quizAiYopiq")} /></Varaq>;
  }
  if (!holat.premium) {
    return (
      <Varaq sarlavha={sarlavha} onYop={onYop}
        past={<button type="button" onClick={() => nav(yolPremium())} data-tahlil="Quiz: AI premium" className={ASOSIY}>
          {t("quizAiPremiumTugma")}</button>}>
        <div className="flex flex-col items-center gap-2 py-3 text-center">
          <Icon name="lock" size={28} className="text-brand-gold-d" />
          <span className="font-display text-[17px]">{t("quizAiPremium")}</span>
          <span className="text-[13.5px] leading-snug text-ink-dim">{t(faylRejim ? "quizFayldanIzohUzun" : "quizAiIzohUzun")}</span>
        </div>
      </Varaq>
    );
  }

  return (
    <Varaq sarlavha={sarlavha} onYop={onYop}
      past={(
        <button type="button" disabled={!tayyor || kutilmoqda || holat.qolgan < 1} onClick={() => void boshla()}
          data-tahlil={faylRejim ? "Quiz: AI fayl" : "Quiz: AI mavzu"} className={ASOSIY}>
          {kutilmoqda ? t("quizAiYozmoqda") : t(faylRejim ? "quizAiOqi" : "quizAiYasa")}
        </button>
      )}>
      <p className="px-1 text-[13px] leading-snug text-ink-dim">{t(faylRejim ? "quizFayldanIzohUzun" : "quizAiIzohUzun")}</p>
      {faylRejim && (
        <label className="clay-press flex min-h-[64px] cursor-pointer items-center gap-3 rounded-2xl bg-sahna px-3.5 py-2
                          ring-1 ring-track">
          <Icon name="plus" size={20} className="shrink-0 text-brand-blue-t" />
          <span className="min-w-0 flex-1 truncate text-[15px]">{fayl ? fayl.name : t("quizFaylTanla")}</span>
          <input type="file" accept="image/*,application/pdf" className="sr-only" disabled={kutilmoqda}
            onChange={(e) => setFayl(e.target.files?.[0] ?? null)} />
        </label>
      )}
      <textarea value={matn} onChange={(e) => setMatn(e.target.value.slice(0, 1000))} rows={faylRejim ? 2 : 4}
        disabled={kutilmoqda}
        placeholder={t(faylRejim ? "quizFaylIzohJoy" : "quizAiMavzuJoy")} aria-label={sarlavha}
        className={`${MAYDON} shrink-0 resize-none py-3 leading-snug`} />
      <div className="flex flex-col gap-1.5">
        <span className="px-1 text-[13px] font-bold text-ink-dim">{t(faylRejim ? "quizKopiBilan" : "quizNechta")}</span>
        <div className="flex flex-wrap gap-1.5">
          {[5, 10, 20, 30].map((x) => <Tanlov key={x} faol={soni === x} on={() => setSoni(x)}>{x}</Tanlov>)}
        </div>
      </div>
      <p className="px-1 text-[12.5px] text-ink-dim">{t("quizAiQolgan", { n: holat.qolgan, k: holat.kunlik })}</p>
      {kutilmoqda && <p className="az-suzish text-center text-[14px] text-ink-soft">{t("quizAiKutIzoh")}</p>}
      {xato && <p className="text-center text-[14px] text-brand-red">{xato}</p>}
    </Varaq>
  );
}

/* ==================== quiz sahifasi (muallif) ==================== */

export function QuizSahifa({ id, onTahrir, onJonli, onYech, onChiq }: {
  id: number; onTahrir: () => void; onJonli: (oid: number) => void; onYech: (kod: string) => void; onChiq: () => void;
}) {
  const [q, setQ] = useState<QuizToliq | null | "xato">(null);
  const [nusxa, setNusxa] = useState(false);
  const [ochilmoqda, setOchilmoqda] = useState(false);
  const [rejimVaraq, setRejimVaraq] = useState(false);

  useEffect(() => {
    let tirik = true;
    quizOch(id).then((x) => { if (tirik) setQ(x); }, () => { if (tirik) setQ("xato"); });
    return () => { tirik = false; };
  }, [id]);

  if (q === null) return <div className={QOBIQ}><Sarlavha nom={t("quizSarlavha")} onChiq={onChiq} /><Holat matn={t("quizYuklanmoqda")} /></div>;
  if (q === "xato") return <div className={QOBIQ}><Sarlavha nom={t("quizSarlavha")} onChiq={onChiq} /><Holat matn={t("quizTopilmadi")} /></div>;

  const jonli = q.rejim === "jonli";
  const nusxala = async () => {
    try { await navigator.clipboard.writeText(q.kod); setNusxa(true); tebrat("tanlov"); } catch { /* kod ko'rinib turibdi */ }
  };
  const jonliBoshla = async (tur: OyinTur, jamoa: number) => {
    if (ochilmoqda) return;
    setOchilmoqda(true);
    try {
      const o = await jonliOch(q.id, tur, jamoa);
      tebrat("tanlov");
      onJonli(o.id);
    } catch {
      setOchilmoqda(false);
    }
  };
  const ochir = async () => {
    if (!window.confirm(t("quizOchirSorov", { nom: q.nom }))) return;
    await quizOchir(q.id).catch(() => {});
    onChiq();
  };

  return (
    <div className={QOBIQ}>
      <Sarlavha nom={q.nom} onChiq={onChiq}
        izoh={`${t("quizSavolSoni", { n: q.savol })} · ${t(jonli ? "quizRejimJonli" : "quizRejimOz")}`}
        amal={(
          <button type="button" onClick={onTahrir} aria-label={t("quizTahrir")} title={t("quizTahrir")}
            data-tahlil="Quiz: tahrirlash"
            className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
            <Icon name="pencil" size={18} />
          </button>
        )} />

      {/* Kod — doskaga yoziladi; havola — guruhga yuboriladi. Jonlida
          asosiy amal "Boshlash", ulashish esa ikkinchi darajali. */}
      <div className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
        <span className="text-[13px] font-bold text-ink-dim">{t("quizKod")}</span>
        <button type="button" onClick={nusxala} data-tahlil="Quiz: kodni nusxalash"
          className="clay-press shadow-ichki flex items-center justify-between gap-2 rounded-2xl bg-sahna px-4 py-3">
          <span className="font-display text-[26px] font-bold tracking-[0.2em] min-[360px]:text-[30px]">{q.kod}</span>
          <span className="shrink-0 text-[13px] font-bold text-brand-blue-t">{nusxa ? t("sinfNusxalandi") : t("sinfNusxala")}</span>
        </button>
        {jonli ? (
          <>
            <button type="button" onClick={() => (q.jonli ? onJonli(q.jonli) : setRejimVaraq(true))} disabled={ochilmoqda}
              data-tahlil="Quiz: jonli boshlash"
              className={ASOSIY}>
              <span className="flex items-center justify-center gap-2">
                <Icon name="play" size={18} />{t(q.jonli ? "quizJonliDavom" : "quizJonliBoshla")}
              </span>
            </button>
            <button type="button" onClick={() => quizUlash(q.nom, q.kod, q.havola)} data-tahlil="Quiz: ulashish"
              className={IKKINCHI}>
              {t("quizUlash")}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => quizUlash(q.nom, q.kod, q.havola)} data-tahlil="Quiz: ulashish"
            className={ASOSIY}>
            <span className="flex items-center justify-center gap-2"><Icon name="send" size={18} />{t("quizUlash")}</span>
          </button>
        )}
      </div>

      {!jonli && (
        q.natijalar.length === 0 ? (
          <p className="rounded-clay bg-karta p-5 text-center text-[14.5px] leading-snug text-ink-dim shadow-clay-sm">
            {t("quizNatijaYoq")}
          </p>
        ) : (
          <section className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2 px-1">
              <h2 className="font-display text-[17px]">{t("quizNatijalar")}</h2>
              <span className="text-[13px] text-ink-dim">
                {t("quizOrtacha", { n: q.ishlagan, o: String(q.ortacha).replace(".", ","), j: q.savol })}
              </span>
            </div>
            <ol className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
              {q.natijalar.map((n, i) => (
                <li key={i} className="flex min-h-12 items-center gap-3 px-3.5 py-2">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg font-display text-[14px] ${
                    i < 3 ? "bg-brand-gold/20 text-brand-gold-d" : "text-ink-dim"}`}>{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{n.ism || t("hrAnonim")}</span>
                  <span className="shrink-0 text-[13px] text-ink-dim tabular-nums">{Math.round(n.sekund / 60)} {t("quizDaq")}</span>
                  <span className="w-12 shrink-0 text-right font-display text-[16px] tabular-nums">{n.togri}/{q.savol}</span>
                </li>
              ))}
            </ol>
          </section>
        )
      )}
      {jonli && <p className="px-1 text-[13px] leading-snug text-ink-dim">{t("quizJonliIzoh")}</p>}
      {rejimVaraq && (
        <RejimVaraq ketmoqda={ochilmoqda} onYop={() => setRejimVaraq(false)}
          onBoshla={(tur, n) => void jonliBoshla(tur, n)} />
      )}

      <div className="flex flex-col items-center gap-0.5 pt-1">
        {!jonli && (
          <button type="button" onClick={() => onYech(q.kod)} data-tahlil="Quiz: o'zim yechib ko'raman"
            className="clay-press min-h-11 text-[14px] font-semibold text-brand-blue-t">
            {t("quizSinabKor")}
          </button>
        )}
        <button type="button" onClick={ochir} data-tahlil="Quiz: o'chirish"
          className="clay-press min-h-11 text-[14px] font-semibold text-ink-dim">
          {t("quizOchir")}
        </button>
      </div>
    </div>
  );
}

/** Jamoa belgisi va nomi — 3 rang qoidasi tufayli jamoalar RANG bilan emas, SHAKL bilan ajraladi. */
export const JAMOA_BELGI: IconName[] = ["triangle", "circle", "cube", "star"];
export const jamoaNomi = (j: number) => t(`quizJamoa${j}` as Kalit);

/**
 * Jonli o'yin rejimi — o'yin OCHILISHIDAN oldin tanlanadi: kirganlar
 * qaysi jamoaga tushishi va omon qolish qoidasi boshidan ma'lum bo'lsin.
 */
function RejimVaraq({ ketmoqda, onBoshla, onYop }: {
  ketmoqda: boolean; onBoshla: (tur: OyinTur, jamoa: number) => void; onYop: () => void;
}) {
  const [tur, setTur] = useState<OyinTur>("oddiy");
  const [jamoa, setJamoa] = useState(2);
  const TURLAR: { tur: OyinTur; ic: IconName; nom: Kalit; izoh: Kalit }[] = [
    { tur: "oddiy", ic: "trophy", nom: "quizOyinOddiy", izoh: "quizOyinOddiyIzoh" },
    { tur: "jamoa", ic: "parent", nom: "quizOyinJamoa", izoh: "quizOyinJamoaIzoh" },
    { tur: "omon", ic: "flame", nom: "quizOyinOmon", izoh: "quizOyinOmonIzoh" },
  ];
  return (
    <Varaq sarlavha={t("quizRejimTanla")} onYop={onYop}
      past={(
        <button type="button" disabled={ketmoqda} onClick={() => onBoshla(tur, jamoa)} data-tahlil={`Quiz: jonli ochish ${tur}`}
          className={ASOSIY}>
          {t("quizOyinniOch")}
        </button>
      )}>
      <div role="radiogroup" aria-label={t("quizRejimTanla")} className="flex flex-col gap-2">
        {TURLAR.map((x) => {
          const faol = tur === x.tur;
          return (
            <button key={x.tur} type="button" role="radio" aria-checked={faol} onClick={() => setTur(x.tur)}
              className={`clay-press flex min-h-[64px] items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left ${
                faol ? "bg-brand-blue/10 ring-2 ring-brand-blue" : "bg-sahna ring-1 ring-track"}`}>
              <Icon name={x.ic} size={22} className={`shrink-0 ${faol ? "text-brand-blue-t" : "text-ink-dim"}`} />
              <span className="min-w-0 flex-1">
                <span className={`block font-display text-[16px] leading-tight ${faol ? "text-brand-blue-t" : ""}`}>{t(x.nom)}</span>
                <span className="block text-[12.5px] leading-snug text-ink-dim">{t(x.izoh)}</span>
              </span>
            </button>
          );
        })}
      </div>
      {tur === "jamoa" && (
        <div className="flex flex-col gap-1.5">
          <span className="px-1 text-[13px] font-bold text-ink-dim">{t("quizJamoaSoni")}</span>
          <div className="flex flex-wrap gap-1.5">
            {[2, 3, 4].map((n) => <Tanlov key={n} faol={jamoa === n} on={() => setJamoa(n)}>{n}</Tanlov>)}
          </div>
        </div>
      )}
    </Varaq>
  );
}