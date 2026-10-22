/**
 * BILIM XARITASI — DTM matematikasi bo'yicha diagnostika (`lib/diagnostika.ts`).
 *
 * Bosqichlar, har biri BITTA ekran:
 *
 *   kirish    nima bo'lishi, qancha savol, vaqt cheklanmagani, "Bilmayman"
 *   savol     bitta savol — javobdan keyin rang YO'Q (`Daraja.tsx` dagidek):
 *             ketma-ket qizil ko'rgan odam qolganini ham qo'l siltab o'tadi
 *   oraliq    qisqa bosqich tugadi; taxminiy mavzular bo'lsa — aniqlashtirish
 *             taklifi, majburiy emas
 *   natija    xarita: umumiy, 13 mavzu, kuchli tomonlar, takrorlash kerak
 *             bo'lganlar va ularning darslari, reja (Premium), keyingi tekshiruv
 *
 * Natija sahifasi ochilganda ASOSIY tugma bitta: rejasi borga — bugungi
 * vazifa, yo'qqa — eng zaif mavzuning darsi. "Qayta tekshirish" ikkinchi
 * darajali: u faqat keyingi tekshiruv kunida kerak.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import { Logo } from "../components/Logo";
import { QuestionView, sahnaBor, shartSahnada } from "../components/QuestionView";
import type { Answer } from "../lib/activity";
import { sinfOf } from "../lib/blok";
import { courseById } from "../lib/curriculum";
import {
  bobOl, diagHolat, diagYubor, jarayonOqi, jarayonYoz, noaniqlar, QISQA, REJA_KUNLAR, rejaBelgi, rejaYasa,
  sanoq, savollarYasa, togrimi,
} from "../lib/diagnostika";
import type { DiagHolat, DiagNatija, Jarayon, MavzuNatija, Reja, Vazifa } from "../lib/diagnostika";
import { DTM_MAVZULAR, mavzuBySlug } from "../lib/dtmMavzu";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { kursMatn } from "../lib/tarjima/kurs";
import { yolImtihonVariant, yolImtMavzu, yolMavzu, yolPremium } from "../lib/yollar";

/** Tanlangan variant shuncha vaqt ko'k turadi, keyin keyingi savol. */
const KUTISH = 320;
/** Bitta savolga hisoblanadigan eng uzoq vaqt — ilova ochiq qolib ketsa ham. */
const MAX_SAVOL_SEKUND = 300;

type Bosqich = "yuklash" | "kirish" | "savol" | "oraliq" | "natija";

const mavzuNomi = (slug: string) => t(mavzuBySlug(slug)?.nom ?? "imtBolimMavzu");
/**
 * "05.11.2026" — ilovaning boshqa joylaridagi kabi raqam bilan: oy nomi
 * brauzer tilida chiqib qolardi (o'zbekcha ilovada "5 ноября"). Sana
 * qismi satrdan olinadi — `new Date("2026-11-05")` UTC deb o'qiladi va
 * g'arbroq soat mintaqasida bir kun orqaga surilardi.
 */
const sanaMatn = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
};

export function Diagnostika({ onChiq }: { onChiq: () => void }) {
  const [bosqich, setBosqich] = useState<Bosqich>("yuklash");
  const [holat, setHolat] = useState<DiagHolat | null>(null);
  const [jarayon, setJarayon] = useState<Jarayon | null>(() => jarayonOqi());
  const [xato, setXato] = useState(false);
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const strelka = useOrqaga(onChiq);

  /** Jarayonni holatga va qurilmaga birga yozadi. */
  const saqla = (j: Jarayon | null) => { setJarayon(j); jarayonYoz(j); };

  const yubor = useCallback(async (j: Jarayon) => {
    setYuborilmoqda(true);
    setXato(false);
    try {
      const h = await diagYubor(j);
      const yangi = { ...j, yuborildi: true };
      setHolat(h);
      // Aniqlashtirish tugagach jarayon kerak emas; qisqa bosqichniki esa
      // natija sahifasidan aniqlashtirish uchun qoladi.
      saqla(yangi.bosqich === "aniq" ? null : yangi);
      setBosqich(yangi.bosqich === "qisqa" && noaniqlar(sanoq(j.savollar, j.javoblar)).length ? "oraliq" : "natija");
      window.scrollTo(0, 0);
    } catch {
      setXato(true);
    } finally {
      setYuborilmoqda(false);
    }
  }, []);

  useEffect(() => {
    let tirik = true;
    diagHolat().then((h) => {
      if (!tirik) return;
      setHolat(h);
      const j = jarayonOqi();
      // Tugagan, lekin internet yo'qligida yetib bormagan urinish — hozir yuboriladi.
      if (j && !j.yuborildi && j.javoblar.length >= j.savollar.length) void yubor(j);
      else setBosqich(h.oxirgi && !(j && j.javoblar.length < j.savollar.length) ? "natija" : "kirish");
    }).catch(() => { if (tirik) { setXato(true); setBosqich("kirish"); } });
    return () => { tirik = false; };
  }, [yubor]);

  function boshla() {
    tebrat("tanlov");
    const savollar = savollarYasa(DTM_MAVZULAR.map((m) => m.slug), QISQA);
    saqla({ vaqt: Date.now(), bosqich: "qisqa", savollar, qisqaSoni: savollar.length, javoblar: [], sekund: 0 });
    setBosqich("savol");
  }

  function aniqlashtir() {
    if (!jarayon) return;
    tebrat("tanlov");
    const slugs = noaniqlar(sanoq(jarayon.savollar, jarayon.javoblar));
    const yangi = savollarYasa(slugs, QISQA, jarayon.savollar);
    saqla({ ...jarayon, bosqich: "aniq", savollar: [...jarayon.savollar, ...yangi], yuborildi: false });
    setBosqich("savol");
    window.scrollTo(0, 0);
  }

  const sarlavha = (
    <div className="flex min-h-11 items-center gap-3">
      {strelka && (
        <button type="button" onClick={onChiq} title={t("ortga")} aria-label={t("ortga")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta text-ink shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}
      <h1 className="min-w-0 flex-1 truncate font-display text-[20px]">{t("diagSarlavha")}</h1>
    </div>
  );

  if (bosqich === "yuklash") {
    return <div className="mx-auto w-full max-w-[430px] px-4 pt-4">{sarlavha}
      <p className="mt-10 text-center text-[14.5px] text-ink-dim">{t("yuklanyapti")}</p></div>;
  }

  if (bosqich === "savol" && jarayon) {
    return <SavolEkran jarayon={jarayon} onChiq={() => setBosqich(holat?.oxirgi ? "natija" : "kirish")}
      onJavob={(j) => {
        saqla(j);
        if (j.javoblar.length >= j.savollar.length) void yubor(j);
      }}
      yuborilmoqda={yuborilmoqda} xato={xato} onQayta={() => void yubor(jarayon)} />;
  }

  if (bosqich === "oraliq" && jarayon) {
    const slugs = noaniqlar(sanoq(jarayon.savollar, jarayon.javoblar));
    return (
      <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-6">
        {sarlavha}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
          <span className="az-suzish"><Logo size={80} /></span>
          <h2 className="font-display text-[22px] leading-tight">{t("diagOraliq")}</h2>
          <p className="max-w-[340px] rounded-clay bg-karta px-4 py-3.5 text-left text-[15px] leading-snug text-ink-soft
                        shadow-clay-sm">
            {t("diagOraliqIzoh", { n: slugs.length, s: slugs.length * QISQA })}
          </p>
          <p className="max-w-[340px] text-[13px] text-ink-dim">{slugs.map(mavzuNomi).join(" · ")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={aniqlashtir} data-tahlil="Diagnostika: aniqlashtirish"
            className="tugma-3d flex min-h-[54px] items-center justify-center gap-2 rounded-[16px] bg-brand-blue
                       font-display text-[18px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("diagAniqlashtir", { s: slugs.length * QISQA })}
          </button>
          <button type="button" onClick={() => { setBosqich("natija"); window.scrollTo(0, 0); }}
            data-tahlil="Diagnostika: natijaga o'tish"
            className="clay-press min-h-11 rounded-[14px] text-[15px] font-bold text-ink-soft">
            {t("diagNatijaniKor")}
          </button>
        </div>
      </div>
    );
  }

  if (bosqich === "natija" && holat?.oxirgi) {
    // Aniqlashtirish natija sahifasidan ham mumkin — faqat shu urinishning
    // qisqa bosqichi qurilmada bo'lsa (savollar va boblar o'sha yerda).
    const aniqlasaBoladi = Boolean(jarayon && jarayon.vaqt === holat.oxirgi.vaqt && jarayon.bosqich === "qisqa"
      && jarayon.yuborildi && holat.oxirgi.taxminiy > 0);
    return <Natija holat={holat} natija={holat.oxirgi} sarlavha={sarlavha}
      onAniqlashtir={aniqlasaBoladi ? aniqlashtir : undefined}
      onQayta={() => { saqla(null); setBosqich("kirish"); window.scrollTo(0, 0); }}
      onReja={(r) => setHolat({ ...holat, reja: r })} />;
  }

  /* ─────────────────────────── kirish ─────────────────────────── */
  const chala = jarayon && !jarayon.yuborildi && jarayon.javoblar.length < jarayon.savollar.length ? jarayon : null;
  const savolSoni = DTM_MAVZULAR.length * QISQA;
  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-6">
      {sarlavha}
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-6 text-center">
        <span className="az-suzish"><Logo size={88} /></span>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-[22px] leading-tight">{t("diagSalom")}</h2>
          <p className="text-[13px] font-bold text-ink-dim">
            {t("diagQisqa", { n: savolSoni, m: DTM_MAVZULAR.length, d: Math.round(savolSoni * 1.5) })}
          </p>
        </div>
        <p className="max-w-[340px] rounded-clay bg-karta px-4 py-3.5 text-left text-[15px] leading-snug text-ink-soft
                      shadow-clay-sm">
          {t("diagIzoh")}
        </p>
        {xato && <p className="text-[13px] text-ink-dim">{t("aloqaYoq")}</p>}
      </div>
      <div className="flex flex-col gap-2">
        {chala ? (
          <button type="button" onClick={() => { tebrat("tanlov"); setBosqich("savol"); }}
            data-tahlil="Diagnostika: davom etish"
            className="tugma-3d flex min-h-[54px] items-center justify-center gap-2 rounded-[16px] bg-brand-blue
                       font-display text-[18px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("diagDavom", { a: chala.javoblar.length, b: chala.savollar.length })}
            <Icon name="chevron" size={18} />
          </button>
        ) : (
          <button type="button" onClick={boshla} data-tahlil="Diagnostika: boshlash"
            className="tugma-3d flex min-h-[54px] items-center justify-center gap-2 rounded-[16px] bg-brand-blue
                       font-display text-[18px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("diagBoshla")}
            <Icon name="chevron" size={18} />
          </button>
        )}
        {chala && (
          <button type="button" onClick={boshla} data-tahlil="Diagnostika: boshidan"
            className="clay-press min-h-11 rounded-[14px] text-[15px] font-bold text-ink-soft">
            {t("diagBoshidan")}
          </button>
        )}
        {!chala && holat?.oxirgi && (
          <button type="button" onClick={() => setBosqich("natija")} data-tahlil="Diagnostika: oxirgi natija"
            className="clay-press min-h-11 rounded-[14px] text-[15px] font-bold text-ink-soft">
            {t("diagOxirgi")}
          </button>
        )}
      </div>
    </div>
  );
}

/* ==================== savol ==================== */

function SavolEkran({ jarayon, onJavob, onChiq, yuborilmoqda, xato, onQayta }: {
  jarayon: Jarayon;
  onJavob: (j: Jarayon) => void;
  onChiq: () => void;
  yuborilmoqda: boolean;
  xato: boolean;
  onQayta: () => void;
}) {
  const idx = jarayon.javoblar.length;
  const [tanlangan, setTanlangan] = useState<Answer | "bilmayman" | null>(null);
  const boshlangan = useRef(Date.now());
  useEffect(() => { boshlangan.current = Date.now(); }, [idx]);

  // Bosqich ichidagi o'rin: aniqlashtirish chizig'i noldan boshlanadi.
  const boshi = jarayon.bosqich === "aniq" ? jarayon.qisqaSoni : 0;
  const ulush = (idx - boshi) / Math.max(1, jarayon.savollar.length - boshi);

  const S = jarayon.savollar[idx];
  if (!S) {
    return (
      <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="az-suzish"><Logo size={72} /></span>
        <p className="text-[15px] text-ink-soft">{xato ? t("aloqaYoq") : yuborilmoqda ? t("diagHisoblanmoqda") : ""}</p>
        {xato && (
          <button type="button" onClick={onQayta} data-tahlil="Diagnostika: qayta yuborish"
            className="tugma-3d min-h-12 rounded-2xl bg-brand-blue px-6 font-display text-[16px] font-bold text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("diagQaytaYubor")}
          </button>
        )}
      </div>
    );
  }

  function javob(v: Answer | "bilmayman") {
    if (tanlangan !== null) return;
    setTanlangan(v);
    tebrat("tanlov");
    const sekund = Math.min(MAX_SAVOL_SEKUND, Math.round((Date.now() - boshlangan.current) / 1000));
    setTimeout(() => {
      setTanlangan(null);
      window.scrollTo(0, 0);
      onJavob({ ...jarayon, javoblar: [...jarayon.javoblar, togrimi(S!, v)], sekund: jarayon.sekund + sekund });
    }, KUTISH);
  }

  const A = S.a;
  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-6">
      <div className="flex min-h-11 items-center gap-3">
        <button type="button" onClick={onChiq} title={t("ortga")} aria-label={t("ortga")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta text-ink shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
        {/* Savollar soni yozilmaydi — faqat chiziq (`Daraja.tsx` izohi). Mavzu
            nomi ham yo'q: imtihonda formulani o'zi tanlash ham o'lchanadi. */}
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-track" role="progressbar"
          aria-valuenow={Math.round(ulush * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-brand-blue transition-[width] duration-500"
            style={{ width: `${ulush * 100}%` }} />
        </div>
      </div>

      {!shartSahnada(A) && (
        <div key={`p-${idx}`}
          className="az-savol mt-5 rounded-clay bg-karta p-4 text-center text-[15px] leading-snug shadow-clay-sm">
          {A.prompt}
        </div>
      )}

      <div className="relative my-4 flex flex-1 items-center justify-center rounded-clay bg-sahna/85 p-4
                      ring-1 ring-track ring-inset">
        <div key={`q-${idx}`} className="az-savol">
          {sahnaBor(A) ? <QuestionView a={A} /> : <Logo size={80} />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {A.choices.map((c, i) => {
          const bu = tanlangan !== null && String(c) === String(tanlangan);
          return (
            <button key={`${idx}-${i}`} type="button" onClick={() => javob(c)} disabled={tanlangan !== null}
              className={`tugma-3d relative grid min-h-16 place-items-center rounded-3xl px-2 py-4 font-display
                          text-2xl break-words shadow-clay ${bu ? "bg-brand-blue text-white" : "bg-karta text-ink"}`}>
              {A.kind === "belgi" ? <span className="font-display text-[54px] leading-none">{c}</span> : c}
            </button>
          );
        })}
      </div>

      <button type="button" onClick={() => javob("bilmayman")} disabled={tanlangan !== null}
        data-tahlil="Diagnostika: bilmayman"
        className={`clay-press mt-3 min-h-11 rounded-[14px] text-[15px] font-bold ${
          tanlangan === "bilmayman" ? "bg-brand-blue text-white" : "text-ink-soft"}`}>
        {t("darajaBilmayman")}
      </button>
    </div>
  );
}

/* ==================== natija ==================== */

/** Bob kalitidan darsga havola va nomi; bob topilmasa `null`. */
function bobMalumot(k: string) {
  const b = bobOl(k);
  const c = b ? courseById(b.kursId) : undefined;
  if (!b || !c) return null;
  return { yol: yolMavzu(c, b.ui), nom: kursMatn(c.units[b.ui]!.u), sinf: sinfOf(c.grade) };
}

function profilYozuv(h: DiagHolat): string {
  const qism = [h.ism || t("siz")];
  if (h.sinf >= 1 && h.sinf <= 11) qism.push(t("diagSinf", { n: h.sinf }));
  else if (h.kim === "abiturient") qism.push(t("diagAbituriyent"));
  return qism.join(" · ");
}

function Natija({ holat, natija, sarlavha, onAniqlashtir, onQayta, onReja }: {
  holat: DiagHolat;
  natija: DiagNatija;
  sarlavha: React.ReactNode;
  onAniqlashtir?: () => void;
  onQayta: () => void;
  onReja: (r: Reja) => void;
}) {
  const nav = useNavigate();
  const zaifi = natija.takror.map((s) => natija.mavzular.find((m) => m.slug === s)!).filter(Boolean);
  const birinchiDars = zaifi.flatMap((m) => m.zaifBoblar).map(bobMalumot).find(Boolean) ?? null;
  const bugungi = holat.reja?.vazifalar.find((v) => v.kun === holat.reja!.bugun && !v.ok) ?? null;
  const vazifaOch = (v: Vazifa) => {
    if (v.tur === "dars") { const b = v.bob ? bobMalumot(v.bob) : null; if (b) nav(b.yol); else if (v.s) nav(yolImtMavzu(v.s, 1)); }
    else if (v.tur === "test" && v.s && v.v) nav(yolImtMavzu(v.s, v.v));
    else if (v.tur === "aralash" && v.v) nav(yolImtihonVariant(v.v));
    else if (v.tur === "qayta") onQayta();
  };

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-4 pb-10 sm:max-w-[560px]
                    kom:grid kom:max-w-[1040px] kom:grid-cols-2 kom:items-start kom:gap-x-6 kom:px-8 kom:pt-8">
      <div className="kom:col-span-2">{sarlavha}</div>

      <div className="contents kom:flex kom:flex-col kom:gap-3.5">
        {/* Umumiy natija — kim, qachon, nechchi foiz. */}
        <section className="flex flex-col gap-2 rounded-clay bg-karta p-4 shadow-clay-sm">
          <div className="flex items-baseline justify-between gap-3 text-[13px] text-ink-dim">
            <span className="min-w-0 truncate font-bold">{profilYozuv(holat)}</span>
            <span className="shrink-0">{sanaMatn(natija.sana)}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[40px] leading-none font-bold">{natija.umumiy}%</span>
            <span className="flex-1 text-[14.5px] text-ink-soft">{t("diagUmumiy")}</span>
            {holat.oldingi && <Farq n={natija.umumiy - holat.oldingi.umumiy} />}
          </div>
          {natija.taxminiy > 0 && (
            <p className="text-[13px] leading-snug text-ink-dim">{t("diagTaxminiyIzoh", { n: natija.taxminiy })}</p>
          )}
          {onAniqlashtir && (
            <button type="button" onClick={onAniqlashtir} data-tahlil="Diagnostika: natijadan aniqlashtirish"
              className="clay-press mt-0.5 min-h-11 self-start rounded-xl bg-brand-blue/10 px-4 text-[14.5px] font-bold
                         text-brand-blue-t">
              {t("diagAniqlashtir", { s: natija.taxminiy * QISQA })}
            </button>
          )}
          {/* Asosiy keyingi qadam — bitta. */}
          {(bugungi || birinchiDars) && (
            <button type="button" data-tahlil={bugungi ? "Diagnostika: bugungi vazifa" : "Diagnostika: eng zaif dars"}
              onClick={() => (bugungi ? vazifaOch(bugungi) : birinchiDars && nav(birinchiDars.yol))}
              className="tugma-3d mt-1 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-blue px-5
                         font-display text-[16px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
              {bugungi ? t("diagBugungi") : t("diagEngZaifDars")}
              <Icon name="chevron" size={18} />
            </button>
          )}
        </section>

        <MavzularKarta natija={natija} oldingi={holat.oldingi?.mavzular ?? null} />

        {natija.kuchli.length > 0 && (
          <section className="flex flex-col gap-2 rounded-clay bg-karta p-4 shadow-clay-sm">
            <h2 className="font-display text-[17px]">{t("diagKuchli")}</h2>
            <div className="flex flex-wrap gap-1.5">
              {natija.kuchli.slice(0, 5).map((s) => (
                <span key={s} className="rounded-xl bg-sahna px-3 py-1.5 text-[13px] font-bold text-ink-soft">
                  {mavzuNomi(s)}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="contents kom:flex kom:flex-col kom:gap-3.5">
        {zaifi.length > 0 && <TakrorKarta mavzular={zaifi.slice(0, 3)} />}

        {holat.premium
          ? <RejaKarta reja={holat.reja} onReja={onReja} onOch={vazifaOch} />
          : <QulfKarta />}

        <section className="flex items-center gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sahna text-brand-blue-t">
            <Icon name="clock" size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] leading-tight">{t("diagKeyingi")}</span>
            <span className="block text-[13px] text-ink-dim">{holat.keyingi ? sanaMatn(holat.keyingi) : "—"}</span>
          </span>
          <button type="button" onClick={onQayta} data-tahlil="Diagnostika: qayta tekshirish"
            className="clay-press min-h-11 shrink-0 rounded-xl bg-sahna px-3.5 text-[14px] font-bold text-ink-soft">
            {t("diagQaytaTekshir")}
          </button>
        </section>

        {holat.tarix.length > 1 && (
          <section className="flex flex-col gap-1 rounded-clay bg-karta p-4 shadow-clay-sm">
            <h2 className="mb-1 font-display text-[17px]">{t("diagTarix")}</h2>
            {holat.tarix.slice(0, 6).map((x) => (
              <div key={x.id} className="flex min-h-9 items-center justify-between text-[14.5px]">
                <span className="text-ink-soft">{sanaMatn(x.sana)}</span>
                <b className="font-display">{x.umumiy}%</b>
              </div>
            ))}
          </section>
        )}

        <p className="text-[12px] leading-snug text-ink-dim">{t("diagOgohlantirish")}</p>
      </div>
    </div>
  );
}

function Farq({ n }: { n: number }) {
  if (!n) return null;
  return <span className={`shrink-0 text-[13px] font-bold ${n > 0 ? "text-brand-green-d" : "text-ink-dim"}`}>
    {n > 0 ? `+${n}` : n}
  </span>;
}

/** 13 mavzu — har biri chiziq bilan. Kuchli — yashil, qolgani firuza; "zaif" so'z bilan. */
function MavzularKarta({ natija, oldingi }: { natija: DiagNatija; oldingi: Record<string, number> | null }) {
  return (
    <section className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
      <h2 className="font-display text-[17px]">{t("diagMavzular")}</h2>
      {natija.mavzular.map((m) => (
        <div key={m.slug} className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2 text-[14px]">
            <span className="min-w-0 flex-1 truncate">{mavzuNomi(m.slug)}</span>
            {!m.aniq && <span className="shrink-0 text-[12px] text-ink-dim">{t("diagTaxminiy")}</span>}
            {oldingi && oldingi[m.slug] !== undefined && <Farq n={oldingi[m.slug]!} />}
            <b className="w-11 shrink-0 text-right font-display">{m.foiz}%</b>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-track"
            aria-label={`${mavzuNomi(m.slug)}: ${t(darajaKalit(m))}`}>
            <div className={`h-full rounded-full ${m.daraja === "kuchli" ? "bg-brand-green" : "bg-brand-blue"}`}
              style={{ width: `${Math.max(m.foiz, 3)}%` }} />
          </div>
        </div>
      ))}
      <p className="text-[12px] text-ink-dim">{t("diagDarajaIzoh")}</p>
    </section>
  );
}

const darajaKalit = (m: MavzuNatija) =>
  m.daraja === "kuchli" ? "diagDKuchli" as const : m.daraja === "orta" ? "diagDOrta" as const : "diagDZaif" as const;

/** Eng zaif mavzular va ularning darslari — bepul. */
function TakrorKarta({ mavzular }: { mavzular: MavzuNatija[] }) {
  const nav = useNavigate();
  return (
    <section className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
      <h2 className="font-display text-[17px]">{t("diagTakror")}</h2>
      {mavzular.map((m) => {
        const boblar = m.zaifBoblar.map(bobMalumot).filter((b): b is NonNullable<typeof b> => b !== null).slice(0, 2);
        return (
          <div key={m.slug} className="flex flex-col gap-1.5 rounded-2xl bg-sahna p-3">
            <div className="flex items-baseline gap-2">
              <span className="min-w-0 flex-1 font-bold">{mavzuNomi(m.slug)}</span>
              <span className="shrink-0 text-[13px] text-ink-dim">{t(darajaKalit(m))} · {m.foiz}%</span>
            </div>
            {boblar.map((b) => (
              <button key={b.yol} type="button" onClick={() => nav(b.yol)} data-tahlil="Diagnostika: tavsiya dars"
                className="clay-press flex min-h-11 items-center gap-2 rounded-xl bg-karta px-3 text-left text-[14px]">
                <Icon name="pencil" size={16} className="shrink-0 text-brand-blue-t" />
                <span className="min-w-0 flex-1 truncate">{b.nom}</span>
                <span className="shrink-0 text-[12px] text-ink-dim">{t("diagSinf", { n: b.sinf })}</span>
              </button>
            ))}
            <button type="button" onClick={() => nav(yolImtMavzu(m.slug, 1))} data-tahlil="Diagnostika: tavsiya test"
              className="clay-press flex min-h-11 items-center gap-2 rounded-xl bg-karta px-3 text-left text-[14px]">
              <Icon name="check" size={16} className="shrink-0 text-brand-blue-t" />
              <span className="min-w-0 flex-1 truncate">{t("diagMavzuTesti")}</span>
              <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
            </button>
          </div>
        );
      })}
    </section>
  );
}

/** Premium'siz — reja o'rnida bitta eshik. */
function QulfKarta() {
  const nav = useNavigate();
  return (
    <button type="button" onClick={() => nav(yolPremium())} data-tahlil="Diagnostika: reja premium"
      className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta p-4 text-left shadow-clay-sm">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sahna text-brand-gold-d">
        <Icon name="lock" size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] leading-tight">{t("diagRejaQulf")}</span>
        <span className="block text-[13px] text-ink-dim">{t("diagRejaQulfIzoh")}</span>
      </span>
      <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
    </button>
  );
}

const vazifaMatn = (v: Vazifa): string => {
  if (v.tur === "dars") {
    const b = v.bob ? bobMalumot(v.bob) : null;
    return b ? t("diagVDars", { nom: b.nom }) : t("diagVDars", { nom: v.s ? mavzuNomi(v.s) : "" });
  }
  if (v.tur === "test") return t("diagVTest", { nom: v.s ? mavzuNomi(v.s) : "", v: v.v ?? 1 });
  if (v.tur === "aralash") return t("diagVAralash", { v: v.v ?? 1 });
  return t("diagVQayta");
};

function RejaKarta({ reja, onReja, onOch }: {
  reja: Reja | null;
  onReja: (r: Reja) => void;
  onOch: (v: Vazifa) => void;
}) {
  const [kun, setKun] = useState<number>(14);
  const [band, setBand] = useState(false);
  const [hammasi, setHammasi] = useState(false);
  const [yangi, setYangi] = useState(false);

  async function yasa() {
    setBand(true);
    try { onReja(await rejaYasa(kun)); setYangi(false); tebrat("yutuq"); } catch { /* tugma qoladi */ }
    setBand(false);
  }

  async function belgila(i: number, ok: boolean) {
    if (!reja) return;
    tebrat("tanlov");
    try { onReja(await rejaBelgi(reja.id, i, ok)); } catch { /* keyingi ochilishda */ }
  }

  if (!reja || yangi) {
    return (
      <section className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
        <h2 className="font-display text-[17px]">{t("diagReja")}</h2>
        <p className="text-[14px] leading-snug text-ink-soft">{t("diagRejaIzoh")}</p>
        <div className="flex gap-1 rounded-2xl bg-track p-1" role="group">
          {REJA_KUNLAR.map((k) => (
            <button key={k} type="button" aria-pressed={kun === k} onClick={() => setKun(k)}
              data-tahlil={`Diagnostika: reja ${k} kun`}
              className={`min-h-11 flex-1 rounded-xl font-display text-[15px] ${
                kun === k ? "bg-karta font-bold text-ink shadow-clay-sm" : "font-semibold text-ink-soft"}`}>
              {t("diagKun", { n: k })}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => void yasa()} disabled={band} data-tahlil="Diagnostika: reja tuzish"
          className="clay-press min-h-11 rounded-xl bg-brand-blue/10 text-[15px] font-bold text-brand-blue-t">
          {band ? t("yuklanyapti") : t("diagRejaTuz")}
        </button>
      </section>
    );
  }

  // Ko'rinadigan oyna: kechagi kundan besh kun oldinga. Hammasi — bitta tugma bilan.
  const korinadi = reja.vazifalar.map((v, i) => ({ v, i }))
    .filter(({ v }) => hammasi || (v.kun >= reja.bugun - 1 && v.kun <= reja.bugun + 5));
  return (
    <section className="flex flex-col gap-2 rounded-clay bg-karta p-4 shadow-clay-sm">
      <div className="flex items-baseline gap-2">
        <h2 className="min-w-0 flex-1 font-display text-[17px]">{t("diagRejaN", { n: reja.kun })}</h2>
        <span className="shrink-0 text-[13px] text-ink-dim">{t("diagBajarildi", { a: reja.bajarildi, b: reja.kun })}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-track">
        <div className="h-full rounded-full bg-brand-green" style={{ width: `${(reja.bajarildi / reja.kun) * 100}%` }} />
      </div>
      <ol className="mt-1 flex flex-col gap-1.5">
        {korinadi.map(({ v, i }) => {
          const bugun = v.kun === reja.bugun;
          return (
            <li key={i} className={`flex items-center gap-2 rounded-xl p-1.5 ${bugun ? "bg-brand-blue/8" : ""}`}>
              {/* Dars — qo'lda belgilanadi; testlar natija kelganda o'zi. */}
              {v.tur === "dars" ? (
                <button type="button" onClick={() => void belgila(i, !v.ok)} aria-pressed={v.ok}
                  aria-label={t("diagBelgila")} data-tahlil="Diagnostika: dars belgisi"
                  className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                    v.ok ? "bg-brand-green text-white" : "bg-sahna text-ink-dim"}`}>
                  {/* Belgilanmagani — bo'sh katak: xira "✓" bajarilgandek ko'rinardi. */}
                  {v.ok ? <Icon name="check" size={18} /> : <span className="size-5 rounded-md ring-2 ring-ink-dim/60" />}
                </button>
              ) : (
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${
                  v.ok ? "bg-brand-green text-white" : "bg-sahna text-ink-dim"}`}>
                  {v.ok ? <Icon name="check" size={18} /> : <span className="text-[13px] font-bold">{v.kun}</span>}
                </span>
              )}
              <button type="button" onClick={() => onOch(v)} data-tahlil={`Diagnostika: vazifa ${v.tur}`}
                className="clay-press flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl px-2 text-left">
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[14px] ${v.ok ? "text-ink-dim line-through" : ""}`}>
                    {vazifaMatn(v)}
                  </span>
                  <span className="block text-[12px] text-ink-dim">
                    {bugun ? t("diagBugun") : t("diagKunN", { n: v.kun })} · {sanaMatn(v.sana)}
                  </span>
                </span>
                <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
              </button>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap gap-x-4">
        {reja.vazifalar.length > korinadi.length || hammasi ? (
          <button type="button" onClick={() => setHammasi(!hammasi)} data-tahlil="Diagnostika: rejani ochish"
            className="min-h-11 text-[14px] font-bold text-brand-blue-t">
            {hammasi ? t("diagYigish") : t("diagHammasi")}
          </button>
        ) : null}
        <button type="button" onClick={() => setYangi(true)} data-tahlil="Diagnostika: yangi reja"
          className="min-h-11 text-[14px] font-bold text-ink-soft">
          {t("diagYangiReja")}
        </button>
      </div>
    </section>
  );
}
