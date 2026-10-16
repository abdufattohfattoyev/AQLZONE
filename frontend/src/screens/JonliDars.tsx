/**
 * JONLI DARS — ro'yxat (`/dars/:slug`) va pleyer (`/dars/:slug/:n`).
 * Format va nega video emasligi — `lib/jonliDars.ts`.
 *
 * Pleyer video kabi o'zi yuradi: sahna ochiladi, doskada qatorlar
 * birma-bir chiqadi, Aisha o'qiydi, tugagach keyingi sahna. Savol
 * sahnasida to'xtaydi — javob berilmaguncha davom etmaydi (passiv
 * ko'rishdan farqi shu). Ovoz yo'q bo'lsa (fayl topilmadi, ovoz
 * o'chirilgan) — o'qish vaqticha kutib, baribir yuradi.
 *
 * Birinchi bosish ATAYLAB: brauzer foydalanuvchi bosmaguncha ovoz
 * chalishga ruxsat bermaydi, shuning uchun muqovada "Boshlash" bor.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { JonliDoska, KATAK } from "../components/JonliDoska";
import { aiBoshla } from "../lib/ai";
import { mavzuBySlug } from "../lib/dtmMavzu";
import { mavzuDarslari, ovozBolaklari, ovozManzil } from "../lib/jonliDars";
import type { Dars, MavzuDarslari, Sahna } from "../lib/jonliDars";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { yolAiSuhbat, yolDarsMashq, yolJonliDars, yolPremium } from "../lib/yollar";

const QOBIQ = "mx-auto flex min-h-ekran w-full max-w-[560px] flex-col px-4 pt-3 pb-4 min-[360px]:px-[18px]";

/* ==================== o'tilgan darslar (shu qurilmada) ==================== */

const otganKalit = (slug: string) => `az-dars-${slug}`;

function otganlar(slug: string): number[] {
  try {
    const x = JSON.parse(localStorage.getItem(otganKalit(slug)) ?? "[]") as unknown;
    return Array.isArray(x) ? x.filter((n): n is number => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function otganYoz(slug: string, n: number): void {
  try {
    localStorage.setItem(otganKalit(slug), JSON.stringify([...new Set([...otganlar(slug), n])]));
  } catch { /* xususiy oyna — belgi faqat shu safar */ }
}

function useMavzu(slug: string) {
  const [m, setM] = useState<MavzuDarslari | null | "yoq">(null);
  useEffect(() => {
    let tirik = true;
    mavzuDarslari(slug).then((x) => { if (tirik) setM(x ?? "yoq"); });
    return () => { tirik = false; };
  }, [slug]);
  return m;
}

/* ==================== ro'yxat ==================== */

export function DarsRoyxat({ slug, onChiq }: { slug: string; onChiq: () => void }) {
  const nav = useNavigate();
  const strelka = useOrqaga(onChiq);
  const m = useMavzu(slug);
  const [otgan] = useState(() => otganlar(slug));
  const nom = t(mavzuBySlug(slug)?.nom ?? "darsSarlavha");

  return (
    // pb-24 — pastki panel ro'yxat oxirini va mashq tugmasini yopmasin.
    <div className={`${QOBIQ} pb-24`}>
      <header className="mb-4 flex min-h-11 items-center gap-2">
        {strelka && (
          <button type="button" onClick={onChiq} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
            <Icon name="chevron" size={18} className="rotate-180" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate font-display text-[21px] leading-tight">{nom}</h1>
      </header>
      {m === null && <p className="text-center text-[14px] text-ink-dim">{t("yuklanyapti")}</p>}
      {m === "yoq" && <p className="text-center text-[14px] text-ink-dim">{t("darsYoq")}</p>}
      {m && m !== "yoq" && (
        <ol className="flex flex-col gap-2.5">
          {m.darslar.map((d) => {
            const tugadi = otgan.includes(d.n);
            return (
              <li key={d.n}>
                <button type="button" onClick={() => { tebrat("tanlov"); nav(yolJonliDars(slug, d.n)); }}
                  data-tahlil="Jonli dars: ochish"
                  className="clay-press flex min-h-[64px] w-full items-center gap-3 rounded-clay bg-karta p-3.5 text-left
                             shadow-clay-sm">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-[16px] ${
                    tugadi ? "bg-brand-green text-white" : "bg-sahna text-brand-blue-t shadow-ichki"}`}>
                    {tugadi ? <Icon name="check" size={18} /> : d.n}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[16px] leading-tight">{d.nom}</span>
                    {d.maqsad && <span className="mt-0.5 block text-[13px] leading-snug text-ink-dim">{d.maqsad}</span>}
                  </span>
                  <Icon name="play" size={18} className="shrink-0 text-brand-blue-t" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
      {m && m !== "yoq" && (
        <button type="button" onClick={() => nav(yolDarsMashq(slug))} data-tahlil="Jonli dars: mashq"
          className="clay-press mt-4 min-h-12 rounded-2xl bg-brand-blue/10 px-4 text-[15px] font-bold text-brand-blue-t">
          {t("darsMashq")}
        </button>
      )}
    </div>
  );
}

/* ==================== pleyer ==================== */

/**
 * Ovozsiz holatda bitta bo'lakni "o'qish" vaqti: belgiga ~75 ms, kamida
 * 3,5 s. Ovoz tezligidan sekinroq ataylab — o'quvchi subtitrni o'qib,
 * doskaga ham qarab ulgursin.
 */
const oqishVaqti = (s: string) => Math.max(3500, s.length * 75);

export function DarsPleyer({ slug, n, onChiq }: { slug: string; n: number; onChiq: () => void }) {
  const nav = useNavigate();
  useOrqaga(onChiq);
  const m = useMavzu(slug);
  const dars = m && m !== "yoq" ? m.darslar.find((d) => d.n === n) ?? null : null;
  const keyingi = m && m !== "yoq" ? m.darslar.find((d) => d.n === n + 1) ?? null : null;

  if (m === null) return <div className={QOBIQ}><p className="m-auto text-[14px] text-ink-dim">{t("yuklanyapti")}</p></div>;
  if (!dars) return <div className={QOBIQ}><p className="m-auto text-[14px] text-ink-dim">{t("darsYoq")}</p></div>;
  return <Pleyer key={`${slug}-${n}`} slug={slug} dars={dars} keyingi={keyingi} onChiq={onChiq}
    onKeyingi={() => keyingi && nav(yolJonliDars(slug, keyingi.n), { replace: true })}
    onMashq={() => nav(yolDarsMashq(slug))} />;
}

function Pleyer({ slug, dars, keyingi, onChiq, onKeyingi, onMashq }: {
  slug: string; dars: Dars; keyingi: Dars | null; onChiq: () => void; onKeyingi: () => void; onMashq: () => void;
}) {
  // -1 — muqova (birinchi bosish ovozga ruxsat beradi), sahnalar soni — yakun.
  const [idx, setIdx] = useState(-1);
  const [ijro, setIjro] = useState(true);
  const [ovozli, setOvozli] = useState(true);
  const [javob, setJavob] = useState<Record<number, number>>({});
  /** Hozir aytilayotgan gap (subtitrda faqat shu — videodagidek). */
  const [bolak, setBolak] = useState(0);
  /** Sahnani qaytadan boshlash — ovoz ham, chizish ham noldan. */
  const [qayta, setQayta] = useState(0);
  /** Doskada chizish jarayoni (0..1) — `JonliDoska`. */
  const [chizT, setChizT] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const taymer = useRef<number | undefined>(undefined);
  const jami = dars.sahnalar.length;
  const S: Sahna | undefined = dars.sahnalar[idx];

  const toxtat = useCallback(() => {
    audio.current?.pause();
    window.clearTimeout(taymer.current);
  }, []);

  const otish = useCallback((i: number) => {
    toxtat();
    setIdx(Math.max(0, Math.min(jami, i)));
  }, [jami, toxtat]);

  // Dars tugadi — shu qurilmada belgi.
  useEffect(() => { if (idx === jami) { otganYoz(slug, dars.n); tebrat("yutuq"); } }, [idx, jami, slug, dars.n]);

  /**
   * Sahna ovozi: bo'laklar ketma-ket. Tugagach — savol bo'lmasa keyingi
   * sahna. Ovoz chiqmasa (204, tarmoq, o'chirilgan) — o'qish vaqticha kutadi.
   */
  useEffect(() => {
    if (!S || !ijro) return;
    const bolaklar = ovozBolaklari(S.aytish);
    let i = 0;
    let bekor = false;
    const tugadi = () => {
      if (bekor || S.savol) return;
      taymer.current = window.setTimeout(() => setIdx((x) => x + 1), 700);
    };
    const navbat = () => {
      if (bekor) return;
      if (i >= bolaklar.length) { tugadi(); return; }
      setBolak(i);
      const bolak = bolaklar[i++]!;
      if (!ovozli) { taymer.current = window.setTimeout(navbat, oqishVaqti(bolak)); return; }
      const a = audio.current ?? new Audio();
      audio.current = a;
      a.src = ovozManzil(bolak);
      a.onended = navbat;
      a.onerror = () => { taymer.current = window.setTimeout(navbat, oqishVaqti(bolak)); };
      a.play().catch(() => { taymer.current = window.setTimeout(navbat, oqishVaqti(bolak)); });
    };
    // Yozuv va chizma ko'rinib olsin, keyin ovoz.
    taymer.current = window.setTimeout(navbat, bolaklar.length ? 350 : 1800);
    return () => { bekor = true; toxtat(); };
  }, [S, ijro, ovozli, toxtat, qayta]);

  // Yangi sahna yoki "qayta" — subtitr va doska noldan.
  useEffect(() => { setBolak(0); setChizT(0); }, [idx, qayta]);

  /**
   * Doskada chizish vaqti — ovozdan tezroq (gapning ~80% ida tugaydi):
   * o'quvchi oxirgi gapda tayyor rasmga qaraydi. Pauzada to'xtaydi.
   */
  const chizishMs = S ? Math.max(2500, Math.min(10000, S.aytish.length * 48)) : 0;
  useEffect(() => {
    if (!S || S.savol || !ijro || chizT >= 1) return;
    // Pauzadan keyin to'xtagan joydan davom etadi; 1 ga yetganda sikl tugaydi.
    let v = chizT;
    let oldingi = performance.now();
    let kadr = requestAnimationFrame(function yur(hozir) {
      v = Math.min(1, v + (hozir - oldingi) / chizishMs);
      oldingi = hozir;
      setChizT(v);
      if (v < 1) kadr = requestAnimationFrame(yur);
    });
    return () => cancelAnimationFrame(kadr);
    // chizT ataylab yo'q: har kadrda effekt qayta ulanmasin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S, ijro, chizishMs, idx, qayta]);

  useEffect(() => () => toxtat(), [toxtat]);

  /* ---- muqova ---- */
  if (idx < 0) {
    return (
      <div className={QOBIQ}>
        <Tepa onChiq={onChiq} idx={-1} jami={jami} />
        <div className="m-auto flex w-full flex-col items-center gap-4 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-brand-blue/10 text-brand-blue-t">
            <Icon name="play" size={34} />
          </span>
          <div>
            <p className="text-[13px] font-bold text-ink-dim">{t("darsRaqam", { n: dars.n })}</p>
            <h1 className="mt-1 font-display text-[24px] leading-tight">{dars.nom}</h1>
            {dars.maqsad && <p className="mt-2 text-[14.5px] leading-snug text-ink-soft">{dars.maqsad}</p>}
          </div>
          <button type="button" onClick={() => { tebrat("tanlov"); setIdx(0); }} data-tahlil="Jonli dars: boshlash"
            className="tugma-3d mt-2 min-h-12 w-full max-w-[320px] rounded-2xl bg-brand-blue font-display text-[17px]
                       text-white shadow-[0_5px_0_var(--color-brand-blue-d)]">
            {t("darsBoshlash")}
          </button>
          <p className="text-[12.5px] text-ink-dim">{t("darsOvozEslatma")}</p>
        </div>
      </div>
    );
  }

  /* ---- yakun ---- */
  if (!S) {
    const savollar = dars.sahnalar.map((s, i) => [s, i] as const).filter(([s]) => s.savol);
    const togri = savollar.filter(([s, i]) => javob[i] === s.savol!.togri).length;
    return (
      <div className={QOBIQ}>
        <Tepa onChiq={onChiq} idx={jami} jami={jami} />
        <div className="m-auto flex w-full flex-col items-center gap-3 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-brand-green text-white"><Icon name="check" size={30} /></span>
          <h1 className="font-display text-[23px]">{t("darsTugadi")}</h1>
          {savollar.length > 0 && (
            <p className="text-[14.5px] text-ink-soft">{t("darsSavolNatija", { a: togri, b: savollar.length })}</p>
          )}
          <div className="mt-2 flex w-full max-w-[340px] flex-col gap-2.5">
            {keyingi ? (
              <button type="button" onClick={onKeyingi} data-tahlil="Jonli dars: keyingi"
                className="tugma-3d min-h-12 rounded-2xl bg-brand-green font-display text-[16px] text-white
                           shadow-[0_5px_0_var(--color-brand-green-d)]">
                {t("darsKeyingi", { nom: keyingi.nom })}
              </button>
            ) : null}
            <button type="button" onClick={onMashq} data-tahlil="Jonli dars: mashq"
              className={`clay-press min-h-12 rounded-2xl px-4 text-[15px] font-bold ${keyingi
                ? "bg-brand-blue/10 text-brand-blue-t"
                : "tugma-3d bg-brand-green font-display text-white shadow-[0_5px_0_var(--color-brand-green-d)]"}`}>
              {t("darsMashq")}
            </button>
            <button type="button" onClick={() => otish(0)} data-tahlil="Jonli dars: qayta"
              className="clay-press min-h-11 rounded-2xl bg-track px-4 text-[14.5px] font-bold text-ink-soft">
              {t("darsQayta")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- sahna ---- */
  const tanlangan = javob[idx];
  const bolaklar = ovozBolaklari(S.aytish);
  return (
    <div className={QOBIQ}>
      <Tepa onChiq={onChiq} idx={idx} jami={jami} nom={dars.nom} />

      {S.savol ? (
        <section key={idx} className="az-kirish flex flex-1 flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm
                                       min-[360px]:p-5" style={KATAK} aria-live="polite">
          <p className="font-display text-[18px] leading-snug">{S.savol.matn}</p>
          <div className="grid grid-cols-2 gap-2">
            {S.savol.variantlar.map((v, i) => {
              const bu = tanlangan === i;
              const togri = i === S.savol!.togri;
              const rang = tanlangan === undefined ? "bg-sahna shadow-ichki"
                : togri ? "bg-brand-green text-white" : bu ? "bg-brand-red text-white" : "bg-sahna opacity-60";
              return (
                <button key={i} type="button" disabled={tanlangan !== undefined} data-tahlil="Jonli dars: javob"
                  onClick={() => { setJavob((j) => ({ ...j, [idx]: i })); tebrat(togri ? "togri" : "xato"); }}
                  className={`clay-press min-h-12 rounded-xl px-3 font-display text-[16px] ${rang}`}>
                  {v}
                </button>
              );
            })}
          </div>
          {tanlangan !== undefined && (
            <>
              {S.savol.izoh && <p className="text-[14.5px] leading-snug text-ink-soft">{S.savol.izoh}</p>}
              <button type="button" onClick={() => otish(idx + 1)} data-tahlil="Jonli dars: savoldan keyin"
                className="tugma-3d min-h-12 rounded-2xl bg-brand-green font-display text-[16px] text-white
                           shadow-[0_5px_0_var(--color-brand-green-d)]">
                {t("darsDavom")}
              </button>
            </>
          )}
        </section>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <JonliDoska key={`${idx}-${qayta}`} yozuv={S.yozuv} chizma={S.chizma} t={chizT} />
          {/* Subtitr — faqat hozir aytilayotgan gap, doska ustida (videodagidek).
              Ovozsiz joyda (avtobus, dars) ham tushuntirish yo'qolmaydi. */}
          {bolaklar[bolak] && (
            <p aria-live="polite"
              className="absolute inset-x-3 bottom-3 rounded-2xl bg-ink/85 px-4 py-2.5 text-center text-[14.5px]
                         leading-snug text-karta backdrop-blur-sm">
              {bolaklar[bolak]}
            </p>
          )}
        </div>
      )}

      {/* Boshqaruv: oldingi · qayta · to'xtatish · keyingi · ovoz. */}
      <div className="mt-3 flex items-center justify-center gap-2.5 min-[360px]:gap-3.5">
        <Tugma nom={t("darsOldingi")} on={() => otish(idx - 1)}><Icon name="chevron" size={18} className="rotate-180" /></Tugma>
        <Tugma nom={t("darsQaytaSahna")} on={() => { toxtat(); setQayta((x) => x + 1); setIjro(true); }}>
          <Icon name="repeat" size={18} />
        </Tugma>
        <button type="button" onClick={() => { setIjro((x) => !x); tebrat("tanlov"); }}
          aria-label={ijro ? t("darsPauza") : t("darsDavom")} data-tahlil="Jonli dars: pauza"
          className="clay-press grid size-14 place-items-center rounded-full bg-brand-blue text-white">
          <Icon name={ijro ? "pause" : "play"} size={24} />
        </button>
        <Tugma nom={t("darsKeyingiSahna")} on={() => otish(idx + 1)}><Icon name="chevron" size={18} /></Tugma>
        <Tugma nom={t("darsOvoz")} on={() => setOvozli((x) => !x)} bosilgan={!ovozli}>
          <Icon name="ovoz" size={18} className={ovozli ? "" : "opacity-40"} />
        </Tugma>
      </div>

      <YanaSora dars={dars} sahna={S} />
    </div>
  );
}

/**
 * "Yana so'rang" — dars ustida savol: AI ustoz suhbati shu dars va sahna
 * konteksti bilan ochiladi (Premium yoki AI sinovi). O'quvchi tushunmagan
 * joyini o'sha zahoti so'raydi, darsni qidirib yurmaydi.
 */
function YanaSora({ dars, sahna }: { dars: Dars; sahna: Sahna }) {
  const nav = useNavigate();
  const [matn, setMatn] = useState("");
  const [band, setBand] = useState(false);
  const yubor = async () => {
    const m = matn.trim();
    if (!m || band) return;
    setBand(true);
    const kontekst = [sahna.yozuv.join("; "), sahna.aytish].filter(Boolean).join(" — ");
    const r = await aiBoshla("repetitor", { matn: t("darsSoraMatn", { dars: dars.nom, joy: kontekst.slice(0, 600), savol: m }) });
    setBand(false);
    nav(r.ok ? yolAiSuhbat(r.qiymat.id) : yolPremium());
  };
  return (
    <form className="mt-3 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); yubor(); }}>
      <input value={matn} onChange={(e) => setMatn(e.target.value)} maxLength={500} placeholder={t("darsSora")}
        aria-label={t("darsSora")}
        className="min-h-12 min-w-0 flex-1 rounded-2xl bg-karta px-4 text-[15px] shadow-clay-sm outline-none
                   focus:outline-2 focus:outline-brand-blue" />
      <button type="submit" disabled={!matn.trim() || band} aria-label={t("aiYuborish")} data-tahlil="Jonli dars: savol"
        className="clay-press grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-blue/10 text-brand-blue-t
                   disabled:opacity-45">
        <Icon name="send" size={19} />
      </button>
    </form>
  );
}

function Tepa({ onChiq, idx, jami, nom }: { onChiq: () => void; idx: number; jami: number; nom?: string }) {
  return (
    <header className="mb-3 flex min-h-11 items-center gap-3">
      <button type="button" onClick={onChiq} aria-label={t("yopish")}
        className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
        <Icon name="close" size={18} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Dars nomi va qadam — qayerdaligini bir qarashda bildiradi. */}
        {nom && idx >= 0 && idx < jami && (
          <p className="truncate text-[13.5px] leading-tight">
            <b className="font-display">{nom}</b>
            <span className="text-ink-dim"> · {t("darsQadam", { n: idx + 1, jami })}</span>
          </p>
        )}
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: jami }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < idx ? "bg-brand-blue" : i === idx ? "bg-brand-blue/60" : "bg-track"}`} />
          ))}
        </div>
      </div>
    </header>
  );
}

function Tugma({ nom, on, bosilgan, children }: { nom: string; on: () => void; bosilgan?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={on} aria-label={nom} title={nom} aria-pressed={bosilgan}
      className="clay-press grid size-11 place-items-center rounded-full bg-karta shadow-clay-sm">
      {children}
    </button>
  );
}
