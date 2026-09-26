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
  BALL, DAQIQA, HARFLAR, berilgan, daraja, joriyniOchir, joriyniOqi, joriyniSaqla, keyingiDaraja,
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

/** "67,4", "80,0" — doim bitta kasr xonasi, vergul bilan. */
const ballYoz = (b: number) => b.toFixed(1).replace(".", ",");

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
  /** Yakunlanganda — necha sekund ishlandi (natija sarlavhasida). */
  const [sarflandi, setSarflandi] = useState(0);
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
    setSarflandi(sekund);
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

  useOrqaga(onExit);

  if (tugadi) return <Natija v={v} javoblar={javoblar} sekund={sarflandi} onQayta={onQayta} onExit={onExit} />;

  const S = v.savollar[idx];
  const j = javoblar[idx];
  const qoy = (x: SJavob) => setJavoblar((a) => a.map((y, i) => (i === idx ? x : y)));
  const javobsiz = javoblar.filter((x) => !berilgan(x)).length;
  const oxirgi = idx === jami - 1;
  // Oxirgi besh daqiqa — soat oltin rangda. Qizil ATAYLAB emas: u
  // ilovada faqat xato javob uchun (dizayn qoidasi).
  const shoshilinch = qolgan <= 5 * 60;

  const chip = S.tur === "y1" ? t("sertChipTest", { b: ballYoz(S.ball) })
    : S.tur === "y2" ? t("sertChipMoslash", { b: ballYoz(S.ball) })
      : t("sertChipOchiq", { b: ballYoz(yaxlit(BALL.oA + BALL.oB)) });

  // Bo'limlar chegarasi — xarita ostidagi yozuvlar uchun (1–32, 33–35, 36–45).
  const oraliq = (tur: SSavol["tur"]) => {
    const i = v.savollar.findIndex((x) => x.tur === tur);
    const n = v.savollar.filter((x) => x.tur === tur).length;
    return { a: i + 1, b: i + n };
  };

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col gap-3 px-4 pt-4 pb-5 min-[360px]:px-[18px]">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onExit} aria-label={t("sertChiqish")} title={t("sertChiqish")}
          data-tahlil="Sertifikat: chiqish"
          className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
          <Icon name="close" size={20} />
        </button>
        <div className={`flex flex-1 items-center justify-center gap-1.5 font-display text-[20px] font-bold tabular-nums
                         ${shoshilinch ? "text-brand-gold-d" : ""}`}>
          <Icon name="clock" size={18} />
          {soat(qolgan)}
        </div>
        <button type="button" onClick={() => { tebrat("tanlov"); setSorov(true); }}
          data-tahlil="Sertifikat: yakunlash"
          className="clay-press h-11 shrink-0 rounded-[14px] bg-karta px-3.5 text-[14.5px] font-bold text-brand-blue-t
                     shadow-clay-sm">
          {t("sertYakunla")}
        </button>
      </div>

      {/* 45 katakli xarita (15 ustun). Javob berilgani — ko'k, joriysi —
          ko'k halqa (`outline`: `ring` soya bo'lgani uchun boshqa soyalar
          uni bosib ketardi), bo'shi — xira. To'g'ri/xato ko'rsatilmaydi:
          imtihon paytida belgi yo'q. */}
      <div>
        <div className="grid grid-cols-15 gap-1">
          {v.savollar.map((_, i) => (
            <button key={i} type="button" onClick={() => setIdx(i)}
              aria-label={t("sertSavolRaqam", { n: i + 1 })} aria-current={i === idx ? "step" : undefined}
              className={`h-3.5 rounded-[4px] min-[360px]:h-4 ${
                i === idx ? "bg-karta outline-2 -outline-offset-2 outline-brand-blue outline-solid"
                  : berilgan(javoblar[i]) ? "bg-brand-blue" : "bg-track"}`} />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between gap-2 text-[12px] font-semibold text-ink-dim">
          <span>{t("sertXaritaTest", oraliq("y1"))}</span>
          <span>{t("sertXaritaMoslash", oraliq("y2"))}</span>
          <span>{t("sertXaritaOchiq", oraliq("o"))}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-[17px] font-bold">
          {idx + 1}<span className="text-ink-dim"> / {jami}</span>
        </span>
        <span className="truncate rounded-full bg-track px-3 py-1 text-[13px] font-semibold text-ink-soft">{chip}</span>
      </div>

      <div key={idx} className="az-savol flex flex-1 flex-col">
        {S.tur === "y1" && <Test S={S.s} tanlangan={typeof j === "string" ? j : null} onTanla={qoy} />}
        {S.tur === "y2" && (
          <Moslash S={S.s} variantlar={v.y2.map(String)} oraliq={oraliq("y2")}
            tanlangan={typeof j === "string" ? j : null} onTanla={qoy} />
        )}
        {S.tur === "o" && (
          <Ochiq S={S} j={j && typeof j !== "string" ? j : { a: "", b: "" }} onYoz={qoy} />
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2.5">
        <button type="button" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}
          className="clay-press min-h-[52px] rounded-2xl bg-karta font-display text-[17px] font-bold shadow-clay-sm
                     disabled:opacity-40">
          {t("sertOldingi")}
        </button>
        <button type="button"
          onClick={oxirgi ? () => { tebrat("tanlov"); setSorov(true); } : () => setIdx((i) => i + 1)}
          className="tugma-3d min-h-[52px] rounded-2xl bg-brand-blue font-display text-[17px] font-bold text-white
                     shadow-[0_4px_0_var(--color-brand-blue-d)]">
          {oxirgi ? t("sertYakunla") : t("sertKeyingi")}
        </button>
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
        <div className="rounded-[20px] bg-karta px-[18px] py-4 text-[17px] leading-snug shadow-clay-sm">
          {a.prompt}
        </div>
      )}
      {sahnaBor(a) && (
        <div className={`mt-2.5 flex items-center justify-center rounded-[20px] bg-karta p-4 shadow-clay-sm
                         ${kichik ? "[&_.font-display]:text-[24px]" : "min-h-[130px]"}`}>
          <QuestionView a={a} />
        </div>
      )}
    </>
  );
}

/**
 * TEST (Y-1) — to'rt variant ustma-ust, har birida harf belgisi.
 *
 * Tanlangani faqat KO'K (to'g'ri/xato imtihon oxirida ochiladi).
 * Tanlanganini qayta bossa — javob olib tashlanadi: imtihonda ham
 * belgini o'chirib, savolni bo'sh qoldirish mumkin.
 */
function Test({ S, tanlangan, onTanla }: { S: BlokSavol; tanlangan: string | null; onTanla: (x: SJavob) => void }) {
  return (
    <>
      <Shart a={S.a} />
      <div className="mt-3 flex flex-col gap-2.5">
        {S.a.choices.map((c, i) => {
          const bu = tanlangan === String(c);
          return (
            <button key={i} type="button" aria-pressed={bu}
              onClick={() => { tebrat("tanlov"); onTanla(bu ? null : String(c)); }}
              className={`clay-press flex min-h-14 items-center gap-3 rounded-[18px] bg-karta px-3 py-2 text-left
                          shadow-clay-sm ${bu ? "bg-brand-blue/8 outline-2 outline-brand-blue outline-solid" : ""}`}>
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold ${
                bu ? "bg-brand-blue text-white" : "bg-track text-ink-soft"}`}>{HARFLAR[i]}</span>
              <span className="min-w-0 flex-1 font-display text-[19px] leading-tight font-bold break-words">{c}</span>
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
function Moslash({ S, variantlar, oraliq, tanlangan, onTanla }: {
  S: BlokSavol; variantlar: string[]; oraliq: { a: number; b: number };
  tanlangan: string | null; onTanla: (x: SJavob) => void;
}) {
  return (
    <>
      <div className="rounded-[20px] bg-track p-3">
        <div className="px-1 pb-2 text-[13px] font-bold text-ink-soft">{t("sertUmumiy", oraliq)}</div>
        <div className="grid grid-cols-3 gap-1.5">
          {variantlar.map((x, i) => (
            <div key={i} className={`flex min-h-10 items-center gap-1.5 truncate rounded-xl px-2.5 ${
              tanlangan === x ? "bg-brand-blue text-white" : "bg-karta"}`}>
              <span className={`text-[13px] font-bold ${tanlangan === x ? "text-white/85" : "text-ink-soft"}`}>{HARFLAR[i]}</span>
              <span className="truncate font-display text-[16px] font-bold">{x}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3"><Shart a={S.a} kichik /></div>
      <p className="mt-3 px-1 text-[13.5px] text-ink-dim">{t("sertHarfTanla")}</p>
      <div className="mt-2 grid grid-cols-6 gap-1.5">
        {variantlar.map((x, i) => {
          const bu = tanlangan === x;
          return (
            <button key={i} type="button" aria-pressed={bu} aria-label={`${HARFLAR[i]}) ${x}`}
              onClick={() => { tebrat("tanlov"); onTanla(bu ? null : x); }}
              className={`tugma-3d h-12 rounded-2xl font-display text-[18px] font-bold ${
                bu ? "bg-brand-blue text-white shadow-[0_4px_0_var(--color-brand-blue-d)]" : "bg-karta shadow-clay-sm"}`}>
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
      <div className="rounded-[20px] bg-karta p-4 shadow-clay-sm">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[16px] font-bold">{q})</span>
          <span className="min-w-0 flex-1 text-[15.5px] leading-snug">{s.a.prompt}</span>
          <span className="shrink-0 text-[12.5px] font-semibold text-ink-dim">{t("sertBallQisqa", { b: ballYoz(ball) })}</span>
        </div>
        {"text" in s.a && (
          <div className="mt-1.5 font-display text-[20px] leading-tight break-words">
            {s.a.text.split(/,?\s{3,}/).filter(Boolean).map((x, i) => <div key={i}>{x}</div>)}
          </div>
        )}
        {s.a.type !== "eqn" && sahnaBor(s.a) && <div className="mt-2"><QuestionView a={s.a} /></div>}
        <div className="mt-3 flex gap-2">
          <button type="button" aria-label={t("sertIshora")}
            onClick={() => yoz(qiymat.startsWith("−") || qiymat.startsWith("-") ? qiymat.slice(1) : `−${qiymat}`)}
            className="clay-press grid size-[52px] shrink-0 place-items-center rounded-2xl bg-track font-display text-[20px]
                       font-bold text-ink-soft">
            ±
          </button>
          <input value={qiymat} onChange={(e) => yoz(e.target.value.slice(0, 16))}
            inputMode="decimal" autoComplete="off" enterKeyHint="done"
            placeholder={t("sertJavobJoy")} aria-label={`${q}) ${t("sertJavobJoy")}`}
            className="h-[52px] min-w-0 flex-1 rounded-2xl border-2 border-track bg-karta px-4 font-display text-[20px]
                       font-bold outline-none placeholder:text-ink-dim focus:border-brand-blue" />
        </div>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-3">
      {qism("a", S.a, BALL.oA)}
      {qism("b", S.b, BALL.oB)}
      <p className="px-1 text-[13px] text-ink-dim">{t("sertSonYoz")}</p>
    </div>
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
  /** Shu qismning bali — "qayerda ball yo'qotildi" hisobi uchun. */
  ball: number;
}

/**
 * NATIJA (`manba/SertNatija.dc.html`): katta ball, taxminiy daraja va
 * keyingisigacha farq, uch bo'lim, ball yo'qotilgan mavzular, xatolar.
 * Hisob o'zgarmadi (`lib/sertifikat.ts`) — faqat ko'rinish.
 */
function Natija({ v, javoblar, sekund, onQayta, onExit }: {
  v: SVariant; javoblar: SJavob[]; sekund: number; onQayta: () => void; onExit: () => void;
}) {
  const nav = useNavigate();
  const [yechimda, setYechimda] = useState<BlokSavol | null>(null);

  const ball = yaxlit(v.savollar.reduce((a, S, i) => a + savolBali(S, javoblar[i]), 0));
  const dr = daraja(ball);
  const keyingi = keyingiDaraja(ball);
  useEffect(() => { if (dr) tebrat("yutuq"); }, [dr]);

  const qismlar = useMemo(() => {
    const r: Qism[] = [];
    v.savollar.forEach((S, i) => {
      const j = javoblar[i];
      if (S.tur === "o") {
        const o = j && typeof j !== "string" ? j : { a: "", b: "" };
        r.push({ s: S.a, nom: `${i + 1}a`, togri: sonTogrimi(o.a, S.a.a.answer), berildi: o.a.trim() !== "",
          sizniki: o.a, ball: BALL.oA });
        r.push({ s: S.b, nom: `${i + 1}b`, togri: sonTogrimi(o.b, S.b.a.answer), berildi: o.b.trim() !== "",
          sizniki: o.b, ball: BALL.oB });
      } else {
        const x = typeof j === "string" ? j : "";
        const harf = S.tur === "y2" ? HARFLAR[v.y2.map(String).indexOf(x)] : "";
        r.push({ s: S.s, nom: `${i + 1}`, togri: x === String(S.s.a.answer), berildi: x !== "",
          sizniki: harf ? `${harf}) ${x}` : x, ball: S.ball });
      }
    });
    return r;
  }, [v, javoblar]);

  /** Bo'limlar bo'yicha: nechta to'g'ri / nechta (ochiq savolda — qismlar). */
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
    return { togri, jami };
  };
  // Savol bo'yicha sanaladi, qism bo'yicha emas: yakunlash oynasi ham
  // shunday degan va "45 dan 52 tasi javobsiz" chalkashtirardi.
  const javobsiz = javoblar.filter((x) => !berilgan(x)).length;

  /** Mavzular — ko'p ball yo'qotilgani yuqorida. */
  const mavzular = useMemo(() => {
    const m = new Map<string, { nom: string; kursId: string; ui: number; li: number; xato: number; yoqotdi: number }>();
    for (const q of qismlar) {
      if (q.togri) continue;
      const k = `${q.s.kursId}|${q.s.ui}`;
      const bor = m.get(k) ?? { nom: q.s.mavzu, kursId: q.s.kursId, ui: q.s.ui, li: q.s.li, xato: 0, yoqotdi: 0 };
      bor.xato++;
      bor.yoqotdi = yaxlit(bor.yoqotdi + q.ball);
      m.set(k, bor);
    }
    // Ko'pi bilan oltitasi: 45 topshiriq o'ttizga yaqin bobdan keladi va
    // hammasi ro'yxatda tursa, "nimani takrorlay?" javobi yo'qolardi.
    return [...m.values()].sort((a, b) => b.yoqotdi - a.yoqotdi).slice(0, MAVZU_CHEK);
  }, [qismlar]);

  const xatolar = qismlar.filter((q) => !q.togri);

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-10 min-[360px]:px-[18px]">
      {dr && <Konfetti />}

      <div className="az-savol flex flex-col items-center gap-1.5 rounded-clay bg-karta px-4 py-5 text-center shadow-clay-sm">
        <span className="text-[13px] font-bold tracking-[0.08em] text-ink-dim uppercase">
          {t("sertNatijaBosh", { n: v.n, vaqt: soat(sekund) })}
        </span>
        <span className="font-display text-[52px] leading-none font-bold min-[360px]:text-[60px]">
          {ballYoz(ball)}<span className="ml-1.5 text-[20px] text-ink-soft">{t("sertBallDan")}</span>
        </span>
        {dr ? (
          <span className="rounded-full bg-brand-gold/20 px-4 py-1 font-display text-[17px] font-bold text-brand-gold-d">
            {t("sertDaraja", { d: dr })}
          </span>
        ) : (
          <span className="font-display text-[15px] text-ink-soft">{t("sertDarajaYoq")}</span>
        )}
        {keyingi && (
          <span className="text-[13.5px] text-ink-dim">
            {t("sertYetmadi", { d: keyingi.d, b: ballYoz(keyingi.farq) })}
          </span>
        )}
        {javobsiz > 0 && <span className="text-[12.5px] text-ink-dim">{t("sertJavobsiz", { n: javobsiz })}</span>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Bolim nom={t("sertNatijaTest")} {...bolim("y1")} />
        <Bolim nom={t("sertNatijaMoslash")} {...bolim("y2")} />
        <Bolim nom={t("sertNatijaOchiq")} {...bolim("o")} />
      </div>

      {mavzular.length > 0 && (
        <>
          <h2 className="mt-1 font-display text-[19px]">{t("sertYoqotildi")}</h2>
          <div className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
            {mavzular.map((m) => {
              const c = courseById(m.kursId);
              return (
                <button key={`${m.kursId}-${m.ui}`} type="button" disabled={!c}
                  onClick={() => c && nav(yolDars(c, m.ui, m.li))} data-tahlil="Sertifikat: mavzuni takrorlash"
                  className="clay-press flex min-h-[52px] w-full items-center gap-3 px-4 text-left">
                  <span className="min-w-0 flex-1 truncate text-[15px] font-bold">
                    {kursMatn(m.nom).replace(/^\d+-bob\.\s*|^Глава \d+\.\s*/, "")}
                  </span>
                  <span className="shrink-0 text-[13px] text-ink-dim">{t("sertXatoSoni", { n: m.xato })}</span>
                  <span className="w-11 shrink-0 text-right font-display text-[15px] font-bold">−{ballYoz(m.yoqotdi)}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {xatolar.length > 0 && (
        <>
          <h2 className="mt-1 font-display text-[19px]">{t("sertXatolar")}</h2>
          <div className="flex flex-col gap-2">
            {xatolar.map((q) => (
              <button key={q.nom} type="button" disabled={!q.s.a.yechim}
                onClick={() => { setYechimda(q.s); tebrat("tanlov"); }}
                className="flex w-full items-center gap-3 rounded-[18px] bg-karta p-3.5 text-left shadow-clay-sm">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-red/12 font-display
                                 text-[15px] font-bold text-brand-red">{q.nom}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] leading-tight">
                    {"text" in q.s.a ? q.s.a.text : q.s.a.prompt}
                  </span>
                  <span className="mt-0.5 block truncate text-[13px]">
                    <span className="font-bold text-brand-green-d">{t("sertTogriJavob", { j: String(q.s.a.answer) })}</span>
                    {q.berildi && <span className="text-ink-dim"> · {t("sertSizniki", { j: q.sizniki })}</span>}
                  </span>
                </span>
                {q.s.a.yechim && <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />}
              </button>
            ))}
          </div>
        </>
      )}

      <button type="button" onClick={onQayta} data-tahlil="Sertifikat: qayta ishlash"
        className="tugma-3d mt-3 min-h-[54px] w-full rounded-2xl bg-brand-blue font-display text-[18px] font-bold
                   text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
        {t("sertQayta")}
      </button>
      <button type="button" onClick={onExit} data-tahlil="Sertifikat: variantlarga"
        className="clay-press min-h-11 w-full font-display text-[16px] font-semibold text-ink-soft">
        {t("sertVariantlarga")}
      </button>

      {yechimda?.a.yechim && (
        <Yechim qadamlar={yechimda.a.yechim} javob={String(yechimda.a.answer)} onYop={() => setYechimda(null)} />
      )}
    </div>
  );
}

/** Bo'lim kartasi: nom, "26/32" va kichik ko'k chiziq. */
function Bolim({ nom, togri, jami }: { nom: string; togri: number; jami: number }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-[18px] bg-karta p-3 shadow-clay-sm">
      <span className="truncate text-[13px] font-semibold text-ink-dim">{nom}</span>
      <span className="font-display text-[22px] leading-none font-bold">
        {togri}<span className="text-[15px] text-ink-dim">/{jami}</span>
      </span>
      <span className="mt-1 h-1.5 overflow-hidden rounded-full bg-track">
        <span className="block h-full rounded-full bg-brand-blue" style={{ width: `${jami ? (togri / jami) * 100 : 0}%` }} />
      </span>
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
