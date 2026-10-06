/**
 * DARSGA KIRISH — savollardan OLDIN: tushuncha, formula, namuna, sinov mashqi.
 *
 * ─────────────────────── NEGA KERAK ───────────────────────
 *
 * Ilgari dars ochilgan zahoti birinchi savol chiqardi. Maktabgacha
 * kursda buning oldini `Ogit` (animatsion tushuntirish) olardi, lekin
 * 1-sinfdan oliy matematikagacha — hech narsa: "x bo'yicha xususiy
 * hosila" ni birinchi marta ochgan talaba qoidani ko'rmasdan to'rtta
 * variantdan birini taxmin qilardi. Bu o'rganish emas, taxmin.
 *
 * Endi tartib o'qituvchinikidek (`screens/Mavzu.tsx` dagi kabi, lekin
 * dars ICHIDA va bosqichma-bosqich):
 *
 *   1. TUSHUNCHA   qoida va g'oya — odam tilida (`lib/nazariya.ts`)
 *   2. FORMULA     formulalar, yechish tartibi, ko'p uchraydigan xato
 *   3. NAMUNA      yechilgan misol — qadamlar bittadan ochiladi
 *   4. SINOV       ikkita savol BALLSIZ: xato qilsa yechimi shu yerda
 *
 * Shundan keyingina yulduzli olti savol boshlanadi.
 *
 * ─────────────────── HAR BOSQICH ALOHIDA EKRAN ───────────────────
 *
 * Hammasi bitta uzun sahifada bo'lsa, odam uni aylantirib o'tib
 * ketadi. Bitta ekranda bitta narsa va pastda bitta tugma — o'qilishi
 * shart bo'lmasa ham, har bosqich ko'z oldidan o'tadi.
 *
 * ─────────────────── MAJBURIY EMAS ───────────────────
 *
 * Tepada "O'tkazib yuborish" doim turadi: mavzuni bilgan odamni to'rt
 * ekran ushlab turmasin. Darsni avval tugatgan odamga kirish o'zi
 * chiqmaydi (`Lesson.tsx`), lekin savol ekranidagi "Qoida" tugmasi
 * uni istalgan payt qayta ochadi (`qisqa` — sinovsiz).
 *
 * ─────────────────── MA'LUMOT BO'LMASA ───────────────────
 *
 * Quyi sinflarda (`lib/nazariya.ts` da yozuvi yo'q darslar) tushuncha
 * o'rnida BOB kirishi turadi (`Unit.intro` — dastur mualliflari yozgan
 * bir gap), namuna esa darsning o'z generatoridan olinadi. Ya'ni
 * kirish har darsda bor, faqat boyligi har xil.
 */
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../lib/icons";
import { QuestionView, sahnaBor, shartSahnada } from "./QuestionView";
import { Rasm } from "./Rasm";
import type { Activity, Answer } from "../lib/activity";
import type { Lesson, Unit } from "../lib/types";
import { nazariya, tolaq } from "../lib/nazariya";
import type { Matn, Misol } from "../lib/nazariya";
import { t } from "../lib/matn";
import { til } from "../lib/til";
import { kursMatn } from "../lib/tarjima/kurs";
import { yo } from "../lib/tarjima/yechim";
import { tebrat } from "../lib/qobiq";
import { gapir, toxtat, tovush } from "../lib/ovoz";

/** Sinov mashqida nechta savol — "ozroq": qizib olish uchun, charchatish uchun emas. */
const SINOV = 2;

const juft = (x: Matn) => (typeof x === "string" ? x : til() === "ru" ? x[1] : x[0]);

type Bosqich = "tushuncha" | "formula" | "namuna" | "sinov";

/** Bu darsda kirish ko'rsatiladimi: takrorlash va animatsiyali darslarda yo'q. */
export const kirishBormi = (lesson: Lesson): boolean =>
  !lesson.review && !lesson.ogit && lesson.gens.length > 0;

export function DarsKirish({ kursId, unit, lesson, qisqa = false, savolSoni, strelka, onChiq, onBoshla }: {
  kursId: string;
  unit: Unit;
  lesson: Lesson;
  /** Savol paytida "Qoida" bilan qayta ochilgan — sinov mashqisiz. */
  qisqa?: boolean;
  /** Kirishdan keyin nechta savol kutayotgani — yakuniy tugma ostida. */
  savolSoni: number;
  /** O'z orqaga strelkasi kerakmi (Telegram ichida nativi bor). */
  strelka: boolean;
  onChiq: () => void;
  onBoshla: () => void;
}) {
  const N = nazariya(kursId, lesson.n);
  const T = tolaq(kursId, lesson.n);
  const formulaBor = Boolean(T?.f?.length || N?.f?.length || T?.s?.length);

  const bosqichlar = useMemo<Bosqich[]>(() => {
    const r: Bosqich[] = ["tushuncha"];
    if (formulaBor) r.push("formula");
    r.push("namuna");
    if (!qisqa) r.push("sinov");
    return r;
  }, [formulaBor, qisqa]);

  const [i, setI] = useState(0);
  /** Sinov mashqi tugadi — pastdagi tugma "Savollarga o'tish" ga aylanadi. */
  const [sinovTugadi, setSinovTugadi] = useState(false);
  const B = bosqichlar[i];
  const oxirgi = i === bosqichlar.length - 1;

  const keyingi = () => {
    tebrat("tanlov");
    if (oxirgi) onBoshla();
    else { setI(i + 1); window.scrollTo(0, 0); }
  };

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-28 min-[360px]:px-[18px]">
      {/* Sarlavha: orqaga · dars nomi · o'tkazib yuborish. */}
      <div className="flex items-center gap-2.5">
        {strelka && (
          <button type="button" onClick={i > 0 ? () => setI(i - 1) : onChiq} title={t("ortga")} aria-label={t("ortga")}
            data-tahlil="Dars kirish: orqaga"
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {/* Ikki qatorgacha: "x bo'yicha xususiy hosila" kabi nom kesilib qolmasin. */}
          <div className="line-clamp-2 font-display text-[15.5px] leading-tight">{kursMatn(lesson.n).split(" · ")[0]}</div>
          <div className="truncate text-[12.5px] text-ink-dim">{t(qisqa ? "kirishQoida" : "kirishAvval")}</div>
        </div>
        <button type="button" onClick={() => { tebrat("tanlov"); onBoshla(); }} data-tahlil="Dars kirish: o'tkazib yuborish"
          className="clay-press min-h-11 shrink-0 rounded-xl px-2.5 text-[13.5px] font-bold text-ink-soft">
          {t(qisqa ? "yop" : "otkazibYuborish")}
        </button>
      </div>

      {/* Bosqichlar chizig'i — nechta ekran borligi ko'rinsin. */}
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {bosqichlar.map((b, k) => (
          <span key={b} className={`h-2 flex-1 rounded-full ${k < i ? "bg-brand-green" : k === i ? "bg-brand-blue" : "bg-track"}`} />
        ))}
      </div>

      <div key={B} className="az-savol mt-4 flex flex-1 flex-col gap-3">
        {B === "tushuncha" && <Tushuncha unit={unit} N={N} T={T} />}
        {B === "formula" && <Formula N={N} T={T} />}
        {B === "namuna" && <Namuna lesson={lesson} misollar={T?.m} />}
        {B === "sinov" && <Sinov lesson={lesson} onTugadi={() => setSinovTugadi(true)} />}
      </div>

      {/* Yagona asosiy tugma — pastda qotib turadi. Sinov bosqichida u
          mashq tugagandagina chiqadi: savol o'rtasida "o'tish" tugmasi
          javob tugmalari bilan raqobat qilmasin (tepada o'tkazib
          yuborish baribir bor). */}
      {(B !== "sinov" || sinovTugadi) && (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-[var(--az-body)]/95 px-4 pt-2
                        pb-[max(14px,env(safe-area-inset-bottom))] backdrop-blur-sm">
          <button type="button" onClick={keyingi}
            data-tahlil={oxirgi ? "Dars kirish: savollarga" : "Dars kirish: keyingi"}
            className={`tugma-3d mx-auto flex min-h-[56px] w-full max-w-[430px] flex-col items-center justify-center
                        rounded-2xl px-4 text-white ${oxirgi
              ? "bg-brand-green shadow-[0_4px_0_var(--color-brand-green-d)]"
              : "bg-brand-blue shadow-[0_4px_0_var(--color-brand-blue-d)]"}`}>
            <span className="font-display text-[17px] leading-tight font-bold">
              {oxirgi ? t(qisqa ? "davomEtish" : "kirishSavollarga") : t(KEYINGI_NOM[bosqichlar[i + 1]])}
            </span>
            {oxirgi && !qisqa && (
              <span className="text-[12.5px] opacity-85">{t("kirishTayyorIzoh", { n: savolSoni })}</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/** Tugmada keyingi bosqichning NOMI turadi — "Keyingi" emas: odam nimaga o'tayotganini bilsin. */
const KEYINGI_NOM = {
  tushuncha: "mavzuTushuncha",
  formula: "kirishFormulaga",
  namuna: "kirishNamunaga",
  sinov: "kirishSinovga",
} as const;

/* ═══════════════════════════ bosqichlar ═══════════════════════════ */

function Sarlavha({ nom }: { nom: string }) {
  return <div className="text-[12.5px] font-bold tracking-[0.05em] text-ink-dim uppercase">{nom}</div>;
}

/** 1. Qoida va g'oya. Nazariya yo'q darsda — bob kirishi. */
function Tushuncha({ unit, N, T }: { unit: Unit; N: ReturnType<typeof nazariya>; T: ReturnType<typeof tolaq> }) {
  const bor = Boolean(N || T?.t?.length);
  return (
    <>
      <Sarlavha nom={t("mavzuTushuncha")} />
      <div className="flex flex-col gap-3.5 rounded-clay bg-karta p-4 shadow-clay-sm min-[400px]:p-5">
        {N && <p className="text-[16px] leading-relaxed font-semibold">{juft(N.q)}</p>}
        {T?.t?.map((b, k) => (
          <div key={k} className="flex flex-col gap-1">
            <h3 className="font-display text-[16.5px] leading-tight">{juft(b.h)}</h3>
            <p className="text-[15px] leading-relaxed text-ink-soft">{juft(b.p)}</p>
          </div>
        ))}
        {!bor && (
          <>
            <h3 className="font-display text-[18px] leading-tight">{kursMatn(unit.intro.t)}</h3>
            {unit.intro.v.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2.5 rounded-2xl bg-sahna px-3 py-4 shadow-ichki">
                {unit.intro.v.map((v, k) => (
                  <span key={k} className="font-display text-[30px] leading-none">{v}</span>
                ))}
              </div>
            )}
            <p className="text-[15.5px] leading-relaxed text-ink-soft">{kursMatn(unit.intro.d)}</p>
          </>
        )}
      </div>
      {N?.e && !T?.x && <Etibor matnlar={[N.e]} />}
    </>
  );
}

function Etibor({ matnlar }: { matnlar: Matn[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-clay bg-karta p-4 shadow-clay-sm">
      <Sarlavha nom={t(matnlar.length > 1 ? "mavzuXatolar" : "mavzuEtibor")} />
      {matnlar.map((x, k) => (
        <div key={k} className="flex gap-2.5 text-[14.5px] leading-snug text-ink-soft">
          <Icon name="izoh" size={18} className="mt-0.5 shrink-0 text-brand-blue-t" />
          <span className="min-w-0 flex-1">{juft(x)}</span>
        </div>
      ))}
    </div>
  );
}

/** 2. Formulalar, yechish tartibi va xatolar. */
function Formula({ N, T }: { N: ReturnType<typeof nazariya>; T: ReturnType<typeof tolaq> }) {
  return (
    <>
      {(T?.f?.length || N?.f?.length) ? (
        <>
          <Sarlavha nom={t("mavzuFormulalar")} />
          <div className="flex flex-col gap-2 rounded-clay bg-karta p-3.5 shadow-clay-sm">
            {T?.f ? T.f.map((f, k) => (
              <div key={k} className="min-w-0 rounded-2xl bg-sahna px-3.5 py-2.5 shadow-ichki">
                <div className="text-[12.5px] font-semibold text-ink-dim">{juft(f.n)}</div>
                <div className="mt-0.5 font-display text-[16.5px] leading-snug break-words">{f.f}</div>
              </div>
            )) : N?.f?.map((f, k) => (
              <div key={k} className="min-w-0 rounded-2xl bg-sahna px-3.5 py-2.5 font-display text-[16.5px] leading-snug
                                      break-words shadow-ichki">{juft(f)}</div>
            ))}
          </div>
        </>
      ) : null}

      {T?.s && (
        <>
          <Sarlavha nom={t("mavzuQadamlar")} />
          <ol className="flex flex-col gap-2.5 rounded-clay bg-karta p-4 shadow-clay-sm">
            {T.s.map((q, k) => (
              <li key={k} className="flex gap-2.5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-blue/15
                                 font-display text-[12px] text-brand-blue-t">{k + 1}</span>
                <span className="min-w-0 flex-1 text-[15px] leading-snug">{juft(q)}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      {T?.x ? <Etibor matnlar={T.x} /> : N?.e ? <Etibor matnlar={[N.e]} /> : null}
    </>
  );
}

/* ─────────────────────────── namuna ─────────────────────────── */

/**
 * 3. Yechilgan namuna — JONLI KO'RSATISH. Qo'lda yozilgan misol bo'lsa
 * (`Tolaq.m`) — o'sha, bo'lmasa darsning o'z generatoridan (yechimi
 * bori qidiriladi).
 *
 * Ilgari qadamlar faqat tugma bilan bittadan ochilardi. Endi "Jonli
 * ko'rsatish" ham bor: qadamlar o'zi birin-ketin chiqadi va ovoz ularni
 * aytadi — video kabi, lekin video EMAS: har qadam matn bo'lib qoladi,
 * istalgan joyda to'xtatib qaytadan o'qish mumkin va hech narsa
 * yuklanmaydi.
 *
 * Eng muhimi — OXIRGI QADAMNI BOLA O'ZI qo'yadi: ko'rsatish javobdan
 * oldin to'xtaydi va "Endi o'zingiz" deydi. Tomosha qilgan bola
 * o'rganmaydi; o'zi bir qadam qo'ygan bola o'rganadi.
 */
function Namuna({ lesson, misollar }: { lesson: Lesson; misollar?: Misol[] }) {
  const a = useMemo<Activity>(() => {
    let x = lesson.gens[0]();
    for (let k = 0; k < 12 && !x.yechim; k++) x = lesson.gens[(k + 1) % lesson.gens.length]();
    return x;
  }, [lesson]);

  return (
    <>
      <Sarlavha nom={t("mavzuMisol")} />
      {misollar?.length
        ? misollar.slice(0, 2).map((m, k) => (
          <Qadamli key={k} shart={<p className="text-[15.5px] leading-snug font-semibold">{juft(m.s)}</p>}
            qadamlar={m.y.map((q) => ({ ifoda: juft(q) }))} javob={m.j} />
        ))
        : (
          <Qadamli
            shart={<Shart a={a} />}
            qadamlar={(a.yechim ?? []).map((q) => ({ izoh: yo(q.q), ifoda: q.if }))}
            // "O'zingiz toping" — faqat matnli variantlarda: rang va rasm
            // javobini ifoda qadamlaridan keyin tanlash ma'nosiz.
            tanlov={(!a.kind || a.kind === "matn" || a.kind === "belgi") && a.choices.length > 1
              ? { variantlar: a.choices.map(String), togri: String(a.answer) } : undefined}
            javob={a.kind === "rang" || a.kind === "emoji" ? undefined : String(a.answer)}
            javobKo={a.kind === "rang"
              ? <span className="size-8 rounded-full ring-2 ring-karta outline outline-2 outline-ink/15" style={{ background: String(a.answer) }} />
              : a.kind === "emoji" ? <Rasm e={String(a.answer)} size={40} /> : undefined} />
        )}
    </>
  );
}

/** Savol sharti: matn va (bo'lsa) sahna. */
function Shart({ a }: { a: Activity }) {
  return (
    <>
      {!shartSahnada(a) && <p className="text-[15.5px] leading-snug font-semibold">{a.prompt}</p>}
      {sahnaBor(a) && (
        <div className="flex items-center justify-center rounded-2xl bg-sahna p-3.5 shadow-ichki [&_.font-display]:text-[24px]">
          <QuestionView a={a} />
        </div>
      )}
    </>
  );
}

/** Jonli ko'rsatishda bitta qadam ekranda kamida shuncha turadi (ovoz o'chiq bo'lsa ham o'qib ulgurilsin). */
const QADAM_MS = 1900;

/**
 * Shart + qadamlar + javob.
 *
 *   tayyor   hech narsa ochilmagan: "Jonli ko'rsatish" yoki "Bitta qadam"
 *   yurish   qadamlar o'zi chiqadi, ovoz aytadi; "To'xtatish" bor
 *   pauza    "Davom etish" yoki qo'lda "Bitta qadam"
 *   sen      javobdan oldin to'xtadi — bola variantdan o'zi tanlaydi
 *   tugadi   javob yashil qatorda
 */
function Qadamli({ shart, qadamlar, javob, javobKo, tanlov }: {
  shart: React.ReactNode;
  qadamlar: { izoh?: string; ifoda?: string }[];
  javob?: string;
  javobKo?: React.ReactNode;
  /** Berilsa — oxirgi qadamdan oldin bola javobni o'zi tanlaydi. */
  tanlov?: { variantlar: string[]; togri: string };
}) {
  const [ochiq, setOchiq] = useState(0);
  const [holat, setHolat] = useState<"tayyor" | "yurish" | "pauza" | "sen">("tayyor");
  const [xato, setXato] = useState<string | null>(null);
  const [topdi, setTopdi] = useState(false);
  const tugadi = ochiq >= qadamlar.length + 1;     // +1 — javobning o'zi

  /*
   * Hamma qadam ko'rsatiladi, lekin JAVOB YASHIRIN: bola o'zi topguncha
   * qadamlardagi natija "?" bo'lib turadi ("(26 − 2 · 8) : 2 = ?").
   * Ilgari ko'rsatish oxirgi qadamdan oldin to'xtardi — lekin ko'p
   * yechimda javob oxirgi EMAS, yagona qadamning ichida turadi va bola
   * javobni ko'rib turib "javob qaysi?" degan savolga duch kelardi.
   */
  const toxtash = qadamlar.length;
  const yashir = Boolean(tanlov) && !topdi && ochiq <= qadamlar.length;
  const maskla = (x?: string) => {
    if (!x || !yashir || !tanlov) return x;
    // Sonlardagi uzilmas bo'sh joy (`son()` — "12 345") oddiysiga tenglanadi.
    const oddiy = (s: string) => s.split(String.fromCharCode(160)).join(" ").trim();
    const jv = oddiy(tanlov.togri), toza = oddiy(x);
    if (toza === jv) return "?";
    // Oxirgi "=" dan keyingi natija: "… = 5", "… = 90 g", "x = 30".
    const k = toza.lastIndexOf("=");
    if (k < 0) return toza;
    const ong = toza.slice(k + 1).trim();
    return ong === jv || ong.startsWith(`${jv} `) ? `${toza.slice(0, k)}= ?${ong.slice(jv.length)}` : toza;
  };

  /*
   * Jonli ko'rsatish: ko'rsatilgan qadamning izohi aytiladi, ovoz tugashi
   * VA kamida `QADAM_MS` o'tishi kutiladi, keyin navbatdagisi. Effekt
   * har qadamda qayta ishga tushadi; `bekor` — to'xtatilgan yoki ekran
   * yopilgan bo'lsa, eski kutish yangi qadam qo'shib yubormasin.
   */
  useEffect(() => {
    if (holat !== "yurish") return;
    let bekor = false;
    (async () => {
      const bosh = Date.now();
      const q = qadamlar[ochiq - 1];
      if (q?.izoh) await gapir(q.izoh);
      await new Promise((r) => setTimeout(r, Math.max(400, (ochiq > 0 ? QADAM_MS : 300) - (Date.now() - bosh))));
      if (bekor) return;
      if (ochiq >= toxtash) {
        if (tanlov && ochiq < qadamlar.length + 1) { setHolat("sen"); void gapir(t("jonliSen")); }
        else { setOchiq(qadamlar.length + 1); setHolat("tayyor"); }
        return;
      }
      setOchiq(ochiq + 1);
    })();
    return () => { bekor = true; };
  }, [holat, ochiq, qadamlar, toxtash, tanlov]);

  // Ekran yopilsa ovoz to'xtasin — keyingi bosqichda eski gap davom etmasin.
  useEffect(() => () => toxtat(), []);

  const bitta = () => {
    tebrat("tanlov");
    toxtat();
    if (holat === "yurish") setHolat("pauza");
    if (tanlov && ochiq >= toxtash && !topdi) { setHolat("sen"); return; }
    setOchiq((x) => x + 1);
  };

  const tanla = (v: string) => {
    if (!tanlov || topdi) return;
    if (v === tanlov.togri) {
      tovush("togri"); tebrat("togri");
      setTopdi(true); setXato(null);
      setOchiq(qadamlar.length + 1);
      setHolat("tayyor");
      void gapir(t("jonliTogri"));
    } else {
      tovush("xato"); tebrat("xato");
      setXato(v);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
      {shart}
      {ochiq > 0 && qadamlar.length > 0 && (
        <ol className="flex flex-col gap-2.5">
          {qadamlar.slice(0, ochiq).map((q, k) => (
            <li key={k} className="az-savol flex gap-2.5">
              <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full font-display text-[12px] ${
                holat === "yurish" && k === ochiq - 1 ? "bg-brand-blue text-white" : "bg-track text-ink-soft"}`}>{k + 1}</span>
              <div className="min-w-0 flex-1">
                {q.izoh && <div className="text-[13.5px] leading-snug text-ink-dim">{q.izoh}</div>}
                {q.ifoda && <div className="mt-0.5 font-display text-[16px] leading-snug break-words">{maskla(q.ifoda)}</div>}
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* "Endi o'zingiz" — javob variantlari. Xato tanlov qizarib turadi,
          qolganlari bosilaveradi; to'g'risi topilgach javob ochiladi. */}
      {holat === "sen" && tanlov && !tugadi && (
        <div className="az-savol flex flex-col gap-2 rounded-2xl bg-sahna p-3 shadow-ichki">
          <div className="text-[14px] font-bold">{t(xato ? "jonliYana" : "jonliSen")}</div>
          <div className="grid grid-cols-2 gap-2">
            {tanlov.variantlar.map((v) => (
              <button key={v} type="button" onClick={() => tanla(v)} data-tahlil="Dars kirish: o'zim topaman"
                className={`clay-press min-h-11 rounded-xl px-2 font-display text-[16px] break-words ${
                  xato === v ? "az-silkin bg-brand-red text-white" : "bg-karta shadow-clay-sm"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {tugadi ? (
        <div className="az-savol flex items-center gap-2 rounded-2xl bg-brand-green/15 px-3.5 py-2.5">
          <Icon name="check" size={17} className="shrink-0 text-brand-green-d" />
          <span className="text-[13px] text-ink-dim">{t(topdi ? "jonliTogri" : "mavzuJavob")}</span>
          <span className="ml-auto min-w-0 font-display text-[16.5px] break-words text-brand-green-d">{javobKo ?? javob}</span>
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Asosiy boshqaruv: ko'rsatish / to'xtatish / davom. Ko'k emas —
              ekrandagi yagona ko'k tugma pastdagi "Keyingi". */}
          {holat !== "sen" && (
            <button type="button" data-tahlil={holat === "yurish" ? "Dars kirish: jonli to'xtatish" : "Dars kirish: jonli ko'rsatish"}
              onClick={() => {
                tebrat("tanlov");
                if (holat === "yurish") { toxtat(); setHolat("pauza"); }
                else setHolat("yurish");
              }}
              className="clay-press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-blue/12 px-3
                         font-display text-[15px] text-brand-blue-t">
              <Icon name={holat === "yurish" ? "pause" : "play"} size={16} />
              {t(holat === "yurish" ? "jonliToxtat" : holat === "pauza" ? "jonliDavom" : "jonliKorsat")}
            </button>
          )}
          <button type="button" onClick={holat === "sen" ? () => { tebrat("tanlov"); setOchiq(qadamlar.length + 1); setHolat("tayyor"); } : bitta}
            data-tahlil="Dars kirish: namuna qadami"
            className="clay-press min-h-11 shrink-0 rounded-2xl bg-track px-4 font-display text-[14.5px] text-ink-soft">
            {holat === "sen" || ochiq >= qadamlar.length ? t("kirishJavobniKor") : t("jonliQadam")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── sinov mashqi ─────────────────────────── */

/**
 * 4. Ballsiz ikkita savol.
 *
 * Darsdagi savoldan ikki farqi bor va ikkalasi ham "mashq" ekanidan:
 *   - yulduz, xato hisobi, daftar — HECH NARSA yozilmaydi;
 *   - xato javobda qayta urinish yo'q: to'g'risi va yechimi DARHOL
 *     ochiladi. Bu yerda maqsad topish emas, yo'lni ko'rish.
 */
function Sinov({ lesson, onTugadi }: { lesson: Lesson; onTugadi: () => void }) {
  const savollar = useMemo<Activity[]>(() => {
    const r: Activity[] = [];
    const chiqqan = new Set<string>();
    for (let k = 0; k < SINOV; k++) {
      let a = lesson.gens[k % lesson.gens.length]();
      for (let u = 0; u < 20 && chiqqan.has(`${a.prompt}|${a.answer}`); u++) a = lesson.gens[(k + u) % lesson.gens.length]();
      chiqqan.add(`${a.prompt}|${a.answer}`);
      r.push(a);
    }
    return r;
  }, [lesson]);

  const [idx, setIdx] = useState(0);
  const [tanlangan, setTanlangan] = useState<Answer | null>(null);
  const [tugadi, setTugadi] = useState(false);
  const A = savollar[idx];
  const togri = tanlangan !== null && String(tanlangan) === String(A.answer);
  const rasmli = A.kind === "rang" || A.kind === "emoji" || A.kind === "belgi";

  const javob = (v: Answer) => {
    if (tanlangan !== null) return;
    setTanlangan(v);
    const ok = String(v) === String(A.answer);
    tovush(ok ? "togri" : "xato");
    tebrat(ok ? "togri" : "xato");
  };
  const davom = () => {
    tebrat("tanlov");
    if (idx + 1 >= savollar.length) { setTugadi(true); onTugadi(); }
    else { setIdx(idx + 1); setTanlangan(null); window.scrollTo(0, 0); }
  };

  if (tugadi) {
    return (
      <div className="az-savol my-auto flex flex-col items-center gap-2 rounded-clay bg-karta px-5 py-8 text-center shadow-clay-sm">
        <span className="grid size-14 place-items-center rounded-3xl bg-brand-green/15 text-brand-green-d">
          <Icon name="check" size={28} />
        </span>
        <h2 className="mt-1 font-display text-[20px] leading-tight">{t("kirishTayyor")}</h2>
        <p className="text-[14.5px] leading-snug text-ink-soft">{t("kirishTayyorMatn")}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <Sarlavha nom={`${t("kirishSinov")} · ${idx + 1}/${savollar.length}`} />
        <span className="text-[12.5px] text-ink-dim">{t("kirishSinovIzoh")}</span>
      </div>

      <div className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
        <Shart a={A} />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {A.choices.map((c, k) => {
          const bu = tanlangan !== null && String(c) === String(tanlangan);
          const buTogri = tanlangan !== null && String(c) === String(A.answer);
          return (
            <button key={k} type="button" onClick={() => javob(c)} disabled={tanlangan !== null}
              className={[
                "tugma-3d grid place-items-center rounded-3xl shadow-clay-sm",
                rasmli ? "h-20" : "min-h-[52px] px-2 py-3 font-display text-[19px] break-words",
                buTogri ? "bg-brand-green text-white"
                  : bu ? "bg-brand-red text-white"
                    : tanlangan !== null ? "az-sonik bg-karta text-ink" : "bg-karta text-ink",
              ].join(" ")}>
              {A.kind === "rang"
                ? <span className="size-12 rounded-full ring-3 ring-white/70 outline outline-2 outline-ink/15" style={{ background: String(c) }} />
                : A.kind === "emoji" ? <Rasm e={String(c)} size={56} />
                  : A.kind === "belgi" ? <span className="font-display text-[40px] leading-none">{c}</span> : c}
            </button>
          );
        })}
      </div>

      {tanlangan !== null && (
        <div className="az-savol flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
          <div className={`font-display text-[16px] ${togri ? "text-brand-green-d" : "text-brand-red"}`}>
            {t(togri ? "kirishTogri" : "kirishXato")}
          </div>
          {/* Yechim faqat XATODA: to'g'ri topgan odamga qadamlarni o'qitish — ortiqcha. */}
          {!togri && A.yechim && (
            <ol className="flex flex-col gap-2.5">
              {A.yechim.map((q, k) => (
                <li key={k} className="flex gap-2.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-track font-display
                                   text-[12px] text-ink-soft">{k + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] leading-snug text-ink-dim">{yo(q.q)}</div>
                    {q.if && <div className="mt-0.5 font-display text-[16px] leading-snug break-words">{q.if}</div>}
                  </div>
                </li>
              ))}
            </ol>
          )}
          <button type="button" onClick={davom} data-tahlil="Dars kirish: sinov davom"
            className="tugma-3d min-h-[52px] rounded-2xl bg-brand-blue font-display text-[16.5px] font-bold text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("keyingi")}
          </button>
        </div>
      )}
    </>
  );
}
