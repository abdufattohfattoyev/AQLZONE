/**
 * MILLIY SERTIFIKAT VARIANTI — ishlash va natija.
 *
 * ─────────────── NEGA `Blok.tsx` EMAS ───────────────
 *
 * Blok test (DTM) har javobdan keyin darhol "to'g'ri/xato" deydi va
 * orqaga qaytarmaydi. Sertifikat imtihoni boshqacha va mashq ham
 * shunday bo'lishi kerak:
 *
 *   BELGI YO'Q       javob tanlanadi, lekin to'g'riligi OXIRIDA ochiladi —
 *                    imtihonda ham shunday va har savolda "xato" ko'rib
 *                    borgan odam 45-savolga yetmay ruhan cho'kadi.
 *   ERKIN YURISH     istalgan savolga qaytib, javobni o'zgartirish mumkin:
 *                    uch soatlik imtihonda qiyin savolni oxiriga qoldirish
 *                    — asosiy strategiya.
 *   UCH XIL SAVOL    test, moslashtirish (A–F) va javobni o'zi yozadigan
 *                    ochiq savol (`lib/sertifikat.ts`).
 *   SAQLANADI        har javobda — variant uch soatlik va uni bo'lib
 *                    ishlash tabiiy. Chiqish shuning uchun so'ralmaydi:
 *                    yo'qoladigan narsa yo'q.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import { QuestionView, sahnaBor, shartSahnada } from "../components/QuestionView";
import { Yechim } from "../components/Yechim";
import { Konfetti } from "../components/Konfetti";
import type { Activity } from "../lib/activity";
import type { BlokSavol } from "../lib/blok";
import * as api from "../lib/api";
import { courseById } from "../lib/curriculum";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { yolDars } from "../lib/yollar";
import { useFaollik } from "../lib/faollik";
import type { SJavob, SSavol, SVariant } from "../lib/sertifikat";
import {
  BALL, DAQIQA, HARFLAR, berilgan, daraja, joriyniOchir, joriyniOqi, joriyniSaqla,
  maksBall, natijaSaqla, savolBali, sonTogrimi, variantYasa, yaxlit,
} from "../lib/sertifikat";

/**
 * Natija serverda qaysi "bob/dars" bo'lib yoziladi. Blok test 98,
 * kunlik sinov 99 (`lib/blok.ts`) — sertifikat 97: hisobotda o'z nomi
 * bilan turadi va biror darsning statistikasini buzmaydi.
 */
const SERT_JOY = 97;

/** Natijada nechta eng zaif mavzu ko'rsatiladi. */
const MAVZU_CHEK = 6;

/** "67,4" — kasr vergul bilan. */
const ballYoz = (b: number) => String(b).replace(".", ",");

export function SertifikatTest({ n, onExit }: { n: number; onExit: () => void }) {
  const v = useMemo(() => variantYasa(n), [n]);
  /** "Qayta ishlash" da oshadi — ekran butunlay yangidan boshlanadi. */
  const [urinish, setUrinish] = useState(0);

  if (!v) {
    return (
      <div className="mx-auto grid min-h-ekran w-full max-w-[430px] place-items-center px-6">
        <div className="rounded-clay bg-karta p-6 text-center shadow-clay-sm">
          <p className="text-[13.5px] leading-snug text-ink-dim">{t("blokBosh")}</p>
          <button type="button" onClick={onExit}
            className="clay-press mt-4 h-12 w-full rounded-3xl bg-track font-display text-[15px] text-ink-soft">
            {t("ortga")}
          </button>
        </div>
      </div>
    );
  }

  return <Oyna key={urinish} v={v} onExit={onExit}
    onQayta={() => { joriyniOchir(); setUrinish((u) => u + 1); tebrat("tanlov"); }} />;
}

/* ==================== ishlash ==================== */

function Oyna({ v, onQayta, onExit }: { v: SVariant; onQayta: () => void; onExit: () => void }) {
  const jami = v.savollar.length;

  /**
   * Yarim qolgani faqat SHU variantniki bo'lsa tiklanadi. Boshqa
   * variant ochilsa — yangisi boshlanadi va eskisining o'rnini oladi
   * (ro'yxatdagi "davom etish" kartasi doim oxirgisini ko'rsatadi).
   */
  const [davom] = useState(() => {
    const j = joriyniOqi();
    return j && j.n === v.n && j.javoblar.length === jami ? j : null;
  });

  const [javoblar, setJavoblar] = useState<SJavob[]>(() => davom?.javoblar ?? Array(jami).fill(null));
  const [idx, setIdx] = useState(() => Math.min(davom?.idx ?? 0, jami - 1));
  const [tugadi, setTugadi] = useState(false);
  const [sorov, setSorov] = useState(false);

  // Soat — `Blok.tsx` dagidek: sanoq emas, TUGASH PAYTI eslanadi va
  // qolgan vaqt har safar `Date.now()` dan hisoblanadi (fondagi yorliq
  // taymeri sekinlashsa ham vaqt to'g'ri o'tadi).
  const tugash = useRef(davom?.tugash ?? Date.now() + DAQIQA * 60_000);
  const boshlandi = useRef(davom?.boshlandi ?? Date.now());
  const [qolgan, setQolgan] = useState(() => Math.max(0, Math.round((tugash.current - Date.now()) / 1000)));

  useFaollik(tugadi ? null : {
    joy: "blok",
    nom: `${t("imtihonTurSert")} · ${t("imtihonVariant", { n: v.n })}`,
    savol: idx + 1,
    jami,
    togri: 0,
  });

  const yakunla = useCallback((j: SJavob[]) => {
    setTugadi(true);
    joriyniOchir();
    const ball = yaxlit(v.savollar.reduce((a, S, i) => a + savolBali(S, j[i]), 0));
    const sekund = Math.round((Date.now() - boshlandi.current) / 1000);
    natijaSaqla({ variant: v.n, ball, sekund, vaqt: Date.now() });

    // `/boshqaruv` ko'rsin — nechta variant ishlandi, qanday natija.
    // Yulduz yo'q: bu o'lchov, mukofot emas (`Blok.tsx` dagi sabab).
    const toliq = v.savollar.filter((S, i) => savolBali(S, j[i]) === maksBall(S)).length;
    api.postResult({
      grade: 11,
      unit: SERT_JOY,
      lesson: v.n,
      lessonName: `${t("imtihonTurSert")} · ${t("imtihonVariant", { n: v.n })} · ${ballYoz(ball)}`,
      asked: jami,
      correct: toliq,
      mistakes: j.filter((x, i) => berilgan(x) && savolBali(v.savollar[i], x) < maksBall(v.savollar[i])).length,
      stars: 0,
      durationMs: Date.now() - boshlandi.current,
    });
  }, [v, jami]);

  // Har o'zgarishda saqlanadi — chiqish hodisasini ilova ko'rmasligi
  // mumkin (brauzer yorliqni ogohlantirmasdan yopadi).
  useEffect(() => {
    if (tugadi) return;
    joriyniSaqla({ n: v.n, javoblar, idx, tugash: tugash.current, boshlandi: boshlandi.current });
  }, [v.n, javoblar, idx, tugadi]);

  useEffect(() => {
    if (tugadi) return;
    const hisobla = () => setQolgan(Math.max(0, Math.round((tugash.current - Date.now()) / 1000)));
    hisobla();
    const id = setInterval(hisobla, 1000);
    document.addEventListener("visibilitychange", hisobla);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", hisobla); };
  }, [tugadi]);

  useEffect(() => {
    if (qolgan === 0 && !tugadi) yakunla(javoblar);
  }, [qolgan, tugadi, javoblar, yakunla]);

  const ozStrelka = useOrqaga(onExit);

  // Joriy savol raqami tasmada ko'rinib tursin.
  const tasma = useRef<HTMLDivElement>(null);
  useEffect(() => {
    tasma.current?.querySelector(`[data-i="${idx}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [idx]);

  if (tugadi) return <Natija v={v} javoblar={javoblar} onQayta={onQayta} onExit={onExit} />;

  const S = v.savollar[idx];
  const j = javoblar[idx];
  const qoy = (x: SJavob) => setJavoblar((a) => a.map((y, i) => (i === idx ? x : y)));
  const javobsiz = javoblar.filter((x) => !berilgan(x)).length;
  const oxirgi = idx === jami - 1;
  const shoshilinch = qolgan <= 5 * 60;

  const bolim = S.tur === "y1" ? t("sertBolimY1", { b: ballYoz(S.ball) })
    : S.tur === "y2" ? t("sertBolimY2", { b: ballYoz(S.ball) })
      : t("sertBolimO", { a: ballYoz(BALL.oA), b: ballYoz(BALL.oB) });

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-6">
      <div className="flex items-center gap-2">
        {ozStrelka && (
          <button type="button" onClick={onExit} title={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <div className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 font-display text-[15px] shadow-clay-sm
                         ${shoshilinch ? "bg-brand-red text-white" : "bg-karta"}`}>
          <Icon name="clock" size={16} />
          {soat(qolgan)}
        </div>
        <button type="button" onClick={() => { tebrat("tanlov"); setSorov(true); }}
          data-tahlil="Sertifikat: yakunlash"
          className="clay-press ml-auto h-11 shrink-0 rounded-2xl bg-karta px-3.5 font-display text-[13.5px]
                     text-ink-soft shadow-clay-sm">
          {t("sertYakunla")}
        </button>
      </div>

      {/* Savollar tasmasi — istalganiga o'tish mumkin. Javob berilgani
          ko'k, joriysi chiziq bilan (`outline`: `ring` soya bo'lgani uchun
          `shadow-clay-sm` uni bosib ketardi). Belgisiz holat — "hali javob yo'q". */}
      <div ref={tasma} className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 py-1.5 [scrollbar-width:none]">
        {v.savollar.map((_, i) => (
          <button key={i} type="button" data-i={i} onClick={() => setIdx(i)}
            aria-label={t("imtihonVariant", { n: i + 1 })}
            className={`grid h-9 min-w-9 shrink-0 place-items-center rounded-xl font-display text-[13px]
                        ${berilgan(javoblar[i]) ? "bg-brand-blue text-white" : "bg-karta text-ink-soft shadow-clay-sm"}
                        ${i === idx ? "outline-2 outline-offset-2 outline-brand-blue" : ""}`}>
            {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2 px-1 text-[12px] text-ink-dim">
        <span className="font-display text-[14px] text-ink">{idx + 1}<span className="text-ink-dim">/{jami}</span></span>
        <span className="truncate">{bolim}</span>
      </div>

      <div key={idx} className="az-savol flex flex-1 flex-col">
        {S.tur === "y1" && <Test S={S.s} tanlangan={typeof j === "string" ? j : null} onTanla={qoy} />}
        {S.tur === "y2" && (
          <Moslash S={S.s} variantlar={v.y2.map(String)} tanlangan={typeof j === "string" ? j : null} onTanla={qoy} />
        )}
        {S.tur === "o" && (
          <Ochiq S={S} j={j && typeof j !== "string" ? j : { a: "", b: "" }} onYoz={qoy} />
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button type="button" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}
          className="clay-press h-12 rounded-3xl bg-track font-display text-[15px] text-ink-soft disabled:opacity-40">
          {t("sertOldingi")}
        </button>
        {oxirgi ? (
          <button type="button" onClick={() => { tebrat("tanlov"); setSorov(true); }}
            className="tugma-3d h-12 rounded-3xl bg-brand-green font-display text-[15px] text-white
                       shadow-[0_5px_0_var(--color-brand-green-d)]">
            {t("sertYakunla")}
          </button>
        ) : (
          <button type="button" onClick={() => setIdx((i) => i + 1)}
            className="tugma-3d h-12 rounded-3xl bg-brand-blue font-display text-[15px] text-white
                       shadow-[0_5px_0_var(--color-brand-blue-d)]">
            {t("sertKeyingi")}
          </button>
        )}
      </div>

      {sorov && (
        <YakunSorov javobsiz={javobsiz} onDavom={() => setSorov(false)}
          onYakunla={() => { setSorov(false); tebrat("yutuq"); yakunla(javoblar); }} />
      )}
    </div>
  );
}

/* ==================== savol turlari ==================== */

/** Savol sharti: formulali savolda shart kartaning ichida (`QuestionView`). */
function Shart({ a, kichik = false }: { a: Activity; kichik?: boolean }) {
  return (
    <>
      {!shartSahnada(a) && (
        <div className="mt-3 rounded-clay bg-karta p-4 text-center text-[15px] leading-snug shadow-clay-sm">
          {a.prompt}
        </div>
      )}
      {sahnaBor(a) && (
        <div className={`mt-3 flex items-center justify-center rounded-clay bg-sahna/85 p-4 ring-1 ring-track ring-inset
                         ${kichik ? "[&_.font-display]:text-[24px]" : "min-h-[150px]"}`}>
          <QuestionView a={a} />
        </div>
      )}
    </>
  );
}

function Test({ S, tanlangan, onTanla }: { S: BlokSavol; tanlangan: string | null; onTanla: (x: SJavob) => void }) {
  return (
    <>
      <Shart a={S.a} />
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {S.a.choices.map((c, i) => {
          const bu = tanlangan === String(c);
          return (
            <button key={i} type="button" aria-pressed={bu}
              // Tanlanganini qayta bossa — javob olib tashlanadi: imtihonda
              // ham belgini o'chirib, savolni bo'sh qoldirish mumkin.
              onClick={() => { tebrat("tanlov"); onTanla(bu ? null : String(c)); }}
              className={`tugma-3d flex min-h-14 items-center gap-2 rounded-3xl px-3 py-3 text-left shadow-clay
                          ${bu ? "bg-brand-blue text-white" : "bg-karta text-ink"}`}>
              <span className={`shrink-0 text-[13px] ${bu ? "text-white/85" : "text-ink-dim"}`}>{HARFLAR[i]})</span>
              <span className="min-w-0 flex-1 font-display text-[19px] leading-tight break-words">{c}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

/**
 * MOSLASHTIRISH (Y-2) — uch savol, oltita umumiy javob.
 *
 * Javoblar ro'yxati HAR UCHALA savolda ko'rinadi: imtihon varag'ida
 * ular bitta ramkada yonma-yon turadi, telefonda esa savollar alohida
 * ekranda — ro'yxatni qidirib orqaga qaytish kerak bo'lmasin.
 */
function Moslash({ S, variantlar, tanlangan, onTanla }: {
  S: BlokSavol; variantlar: string[]; tanlangan: string | null; onTanla: (x: SJavob) => void;
}) {
  return (
    <>
      <p className="mt-2 px-1 text-[12.5px] leading-snug text-ink-soft">{t("sertY2Izoh")}</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-clay bg-karta p-3 shadow-clay-sm">
        {variantlar.map((x, i) => (
          <div key={i} className={`truncate rounded-xl px-2 py-1.5 text-[14px]
                                   ${tanlangan === x ? "bg-brand-blue/15 text-brand-blue" : ""}`}>
            <span className="text-ink-dim">{HARFLAR[i]})</span> <span className="font-display">{x}</span>
          </div>
        ))}
      </div>
      <Shart a={S.a} kichik />
      <div className="mt-4 grid grid-cols-6 gap-1.5">
        {variantlar.map((x, i) => {
          const bu = tanlangan === x;
          return (
            <button key={i} type="button" aria-pressed={bu}
              onClick={() => { tebrat("tanlov"); onTanla(bu ? null : x); }}
              className={`tugma-3d h-12 rounded-2xl font-display text-[17px] shadow-clay
                          ${bu ? "bg-brand-blue text-white" : "bg-karta text-ink"}`}>
              {HARFLAR[i]}
            </button>
          );
        })}
      </div>
    </>
  );
}

/**
 * OCHIQ JAVOB (O) — ikki qism, javob qo'lda yoziladi.
 *
 * Minus tugmasi alohida: telefonning raqamli klaviaturasida (ayniqsa
 * iPhone'da) minus yo'q, matn klaviaturasida esa raqamlar ikkinchi
 * sahifada. Manfiy javob esa matematikada kam emas.
 */
function Ochiq({ S, j, onYoz }: {
  S: Extract<SSavol, { tur: "o" }>;
  j: { a: string; b: string };
  onYoz: (x: SJavob) => void;
}) {
  const qism = (q: "a" | "b", s: BlokSavol, ball: number) => {
    const qiymat = j[q];
    const yoz = (x: string) => {
      const yangi = { ...j, [q]: x };
      onYoz(yangi.a.trim() || yangi.b.trim() ? yangi : null);
    };
    return (
      <div className="mt-3 rounded-clay bg-karta p-3.5 shadow-clay-sm">
        <div className="flex items-baseline justify-between gap-2 text-[12px] text-ink-dim">
          <span className="font-display text-[15px] text-ink">{q})</span>
          <span>{t("sertBallQisqa", { b: ballYoz(ball) })}</span>
        </div>
        <div className="mt-1 text-[14px] leading-snug text-ink-soft">{s.a.prompt}</div>
        {"text" in s.a && (
          <div className="mt-1 font-display text-[21px] leading-tight break-words">
            {s.a.text.split(/,?\s{3,}/).filter(Boolean).map((x, i) => <div key={i}>{x}</div>)}
          </div>
        )}
        {s.a.type !== "eqn" && sahnaBor(s.a) && <div className="mt-2"><QuestionView a={s.a} /></div>}
        <div className="mt-3 flex gap-2">
          <button type="button" aria-label={t("sertIshora")}
            onClick={() => yoz(qiymat.startsWith("−") || qiymat.startsWith("-") ? qiymat.slice(1) : `−${qiymat}`)}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-track font-display text-[20px] text-ink-soft">
            ±
          </button>
          <input value={qiymat} onChange={(e) => yoz(e.target.value.slice(0, 16))}
            inputMode="decimal" autoComplete="off" enterKeyHint="done"
            placeholder={t("sertJavobJoy")} aria-label={`${q}) ${t("sertJavobJoy")}`}
            className="h-11 min-w-0 flex-1 rounded-2xl bg-sahna px-3.5 font-display text-[18px] shadow-ichki
                       outline-none focus:ring-2 focus:ring-brand-blue" />
        </div>
      </div>
    );
  };
  return (
    <>
      {qism("a", S.a, BALL.oA)}
      {qism("b", S.b, BALL.oB)}
    </>
  );
}

/* ==================== yakunlash so'rovi ==================== */

/**
 * "Yakunlaysizmi?" — javobsiz savol bo'lsa, soni aytiladi.
 * "Qaytish" ATAYLAB katta va birinchi (`components/Chiqish.tsx` dagi
 * sabab): tasodifiy bosish hech qachon uch soatlik ishni yopmasin.
 */
function YakunSorov({ javobsiz, onDavom, onYakunla }: {
  javobsiz: number; onDavom: () => void; onYakunla: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true"
      onClick={onDavom}>
      <div className="az-kanal w-full max-w-[340px] rounded-clay bg-karta p-6 text-center shadow-clay"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-[19px] leading-tight">{t("sertYakunSarlavha")}</h2>
        {javobsiz > 0 && (
          <p className="mt-1.5 text-[13.5px] leading-snug text-ink-dim">{t("sertYakunIzoh", { n: javobsiz })}</p>
        )}
        <button type="button" onClick={onDavom}
          className="tugma-3d mt-5 h-12 w-full rounded-3xl bg-brand-blue font-display text-[15px] text-white
                     shadow-[0_5px_0_var(--color-brand-blue-d)]">
          {t("sertYakunDavom")}
        </button>
        <button type="button" onClick={onYakunla} data-tahlil="Sertifikat: yakunlash tasdiq"
          className="clay-press mt-2 h-11 w-full rounded-3xl bg-track font-display text-[14px] text-ink-soft">
          {t("sertYakunla")}
        </button>
      </div>
    </div>
  );
}

/* ==================== natija ==================== */

/** Bitta tekshirilgan qism: test savoli yoki ochiq savolning a)/b) qismi. */
interface Qism {
  s: BlokSavol;
  /** Savol raqami (1 dan) va ochiq savolda qism harfi. */
  nom: string;
  togri: boolean;
  berildi: boolean;
  /** Odam nima yozdi/tanladi — xatolar ro'yxatida ko'rsatiladi. */
  sizniki: string;
}

function Natija({ v, javoblar, onQayta, onExit }: {
  v: SVariant; javoblar: SJavob[]; onQayta: () => void; onExit: () => void;
}) {
  const nav = useNavigate();
  const [yechimda, setYechimda] = useState<BlokSavol | null>(null);

  const ball = yaxlit(v.savollar.reduce((a, S, i) => a + savolBali(S, javoblar[i]), 0));
  const dr = daraja(ball);
  useEffect(() => { if (dr) tebrat("yutuq"); }, [dr]);

  const qismlar = useMemo(() => {
    const r: Qism[] = [];
    v.savollar.forEach((S, i) => {
      const j = javoblar[i];
      if (S.tur === "o") {
        const o = j && typeof j !== "string" ? j : { a: "", b: "" };
        r.push({ s: S.a, nom: `${i + 1}a`, togri: sonTogrimi(o.a, S.a.a.answer), berildi: o.a.trim() !== "", sizniki: o.a });
        r.push({ s: S.b, nom: `${i + 1}b`, togri: sonTogrimi(o.b, S.b.a.answer), berildi: o.b.trim() !== "", sizniki: o.b });
      } else {
        const x = typeof j === "string" ? j : "";
        const harf = S.tur === "y2" ? HARFLAR[v.y2.map(String).indexOf(x)] : "";
        r.push({ s: S.s, nom: `${i + 1}`, togri: x === String(S.s.a.answer), berildi: x !== "",
          sizniki: harf ? `${harf}) ${x}` : x });
      }
    });
    return r;
  }, [v, javoblar]);

  /** Bo'limlar bo'yicha: nechta to'g'ri / nechta. */
  const bolim = (tur: SSavol["tur"]) => {
    let togri = 0, jami = 0;
    v.savollar.forEach((S, i) => {
      if (S.tur !== tur) return;
      if (S.tur === "o") {
        const o = javoblar[i] && typeof javoblar[i] !== "string" ? javoblar[i] as { a: string; b: string } : { a: "", b: "" };
        jami += 2;
        togri += Number(sonTogrimi(o.a, S.a.a.answer)) + Number(sonTogrimi(o.b, S.b.a.answer));
      } else {
        jami++;
        if (javoblar[i] === String(S.s.a.answer)) togri++;
      }
    });
    return `${togri}/${jami}`;
  };
  // Savol bo'yicha sanaladi, qism bo'yicha emas: yakunlash oynasi ham
  // shunday degan va "45 dan 52 tasi javobsiz" chalkashtirardi.
  const javobsiz = javoblar.filter((x) => !berilgan(x)).length;

  /** Mavzular — xatosi ko'pi yuqorida (`Blok.tsx` dagi tahlil bilan bir xil mantiq). */
  const mavzular = useMemo(() => {
    const m = new Map<string, { nom: string; kursId: string; ui: number; li: number; jami: number; xato: number }>();
    for (const q of qismlar) {
      const k = `${q.s.kursId}|${q.s.ui}`;
      const bor = m.get(k) ?? { nom: q.s.mavzu, kursId: q.s.kursId, ui: q.s.ui, li: q.s.li, jami: 0, xato: 0 };
      bor.jami++;
      if (!q.togri) {
        if (bor.xato === 0) bor.li = q.s.li;
        bor.xato++;
      }
      m.set(k, bor);
    }
    // Faqat xato bo'lgan boblar va ko'pi bilan oltitasi. 45 topshiriq
    // o'ttizga yaqin bobdan keladi va hammasi ro'yxatda tursa, "nimani
    // takrorlay?" degan javob uzun tasma ichida yo'qolardi.
    return [...m.values()].filter((x) => x.xato > 0).sort((a, b) => b.xato - a.xato).slice(0, MAVZU_CHEK);
  }, [qismlar]);

  const xatolar = qismlar.filter((q) => !q.togri);

  const Box = ({ v: qiymat, l }: { v: string; l: string }) => (
    <div className="flex-1 rounded-2xl bg-track px-1 py-2 text-center">
      <div className="font-display text-xl leading-tight">{qiymat}</div>
      <div className="text-[11px] text-ink-dim">{l}</div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-5 pb-10">
      {dr && <Konfetti />}

      <div className="az-savol rounded-clay bg-karta p-5 text-center shadow-clay">
        <div className="font-display text-[46px] leading-none text-brand-blue">
          {ballYoz(ball)}
          <span className="ml-1 text-[16px] text-ink-soft">{t("sertBallDan")}</span>
        </div>
        <div className="mt-2 font-display text-[15px]">
          {dr ? t("sertDaraja", { d: dr }) : t("sertDarajaYoq")}
        </div>

        <div className="mt-4 flex gap-2">
          <Box v={bolim("y1")} l={t("sertNatijaTest")} />
          <Box v={bolim("y2")} l={t("sertNatijaMoslash")} />
          <Box v={bolim("o")} l={t("sertNatijaOchiq")} />
        </div>
        {javobsiz > 0 && <p className="mt-2 text-[12px] text-ink-dim">{t("sertJavobsiz", { n: javobsiz })}</p>}
      </div>

      {/* ---- eng zaif mavzular ---- */}
      {mavzular.length > 0 && <h2 className="az-kirish mt-6 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("blokTahlil")}
      </h2>}
      <div className="az-kirish space-y-2">
        {mavzular.map((m) => {
          const yaxshi = m.xato === 0;
          const c = courseById(m.kursId);
          return (
            <div key={`${m.kursId}-${m.ui}`} className="flex items-center gap-3 rounded-clay bg-karta p-3 shadow-clay-sm">
              <span className={`grid size-9 shrink-0 place-items-center rounded-2xl text-white
                                ${yaxshi ? "bg-brand-green" : "bg-brand-red"}`}>
                <Icon name={yaxshi ? "check" : "repeat"} size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] leading-tight">{kursMatn(m.nom)}</span>
                <span className="mt-0.5 block text-[11.5px] text-ink-dim">
                  {t("blokMavzuHolat", { a: m.jami - m.xato, b: m.jami })}
                </span>
              </span>
              {!yaxshi && c && (
                <button type="button" onClick={() => nav(yolDars(c, m.ui, m.li))}
                  className="clay-press shrink-0 rounded-2xl bg-track px-3 py-2 font-display text-[12px] text-ink-soft">
                  {t("blokTakrorlash")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- xatolar ---- */}
      {xatolar.length > 0 && (
        <>
          <h2 className="az-kirish mt-6 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
            {t("blokXatolar")}
          </h2>
          <div className="az-kirish space-y-2">
            {xatolar.map((q) => (
              <button key={q.nom} type="button" disabled={!q.s.a.yechim}
                onClick={() => { setYechimda(q.s); tebrat("tanlov"); }}
                className="flex w-full items-center gap-3 rounded-clay bg-karta p-3 text-left shadow-clay-sm disabled:opacity-80">
                <span className="w-8 shrink-0 font-display text-[13px] text-ink-dim">{q.nom}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[13.5px] leading-tight">
                    {"text" in q.s.a ? q.s.a.text : q.s.a.prompt}
                  </span>
                  <span className="mt-0.5 block truncate text-[11.5px]">
                    <span className="text-brand-green-d">{t("sertTogriJavob", { j: String(q.s.a.answer) })}</span>
                    {q.berildi && <span className="text-ink-dim"> · {t("sertSizniki", { j: q.sizniki })}</span>}
                  </span>
                </span>
                {q.s.a.yechim && <Icon name="puzzle" size={18} className="shrink-0 text-brand-blue" />}
              </button>
            ))}
          </div>
        </>
      )}

      <button type="button" onClick={onQayta}
        className="tugma-3d mt-6 w-full rounded-3xl bg-brand-green py-3.5 font-display text-lg text-white
                   shadow-[0_6px_0_var(--color-brand-green-d)]">
        {t("sertQayta")}
      </button>
      <button type="button" onClick={onExit}
        className="clay-press mt-2.5 w-full rounded-3xl bg-track py-3 font-display text-[15px] text-ink-soft">
        {t("sertVariantlarga")}
      </button>

      {yechimda?.a.yechim && (
        <Yechim qadamlar={yechimda.a.yechim} javob={String(yechimda.a.answer)} onYop={() => setYechimda(null)} />
      )}
    </div>
  );
}

/** Sekund → "2:59:05" yoki "12:05". Uch soatlik variantda soat ham kerak. */
function soat(s: number): string {
  const h = Math.floor(s / 3600);
  const d = Math.floor((s % 3600) / 60);
  const q = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(d).padStart(2, "0")}:${q}` : `${d}:${q}`;
}
