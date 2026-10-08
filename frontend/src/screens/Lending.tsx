/**
 * Tanishuv sahifasi — saytga birinchi kelgan odam ko'radigan yagona ekran
 * (`components/Tanishtiruv.tsx` orqali, faqat veb'da va bosh manzilda).
 *
 * Bir savolga javob beradi: "bu menga kerakmi?". Shu sabab tartib:
 *
 *   1. Sarlavha + "Bepul boshlash" + JONLI SAVOL. Odam o'qimasdan turib
 *      bitta masalani yechib ko'radi va tushuntirishni ko'radi — ilova
 *      aynan shu, va bu har qanday ta'rifdan tezroq tushuntiradi.
 *   2. Sonlar — dasturdan hisoblanadi, kurs o'sganda eskirmaydi.
 *   3. Bo'limlar (bosilsa — o'sha bo'lim ochiladi), kimlar uchun,
 *      qanday ishlaydi, savollar.
 *   4. Oxirida yana o'sha bitta tugma.
 *
 * Ko'rinish 2026-10-08 da foydalanuvchi bergan namunadan olingan:
 * suzuvchi tepa panel, yumshoq "loy" tugmalar, rangli belgi qutilari,
 * har bo'limga kichik ustki yorliq. Ilova qoidalaridan (`aqlzone-dizayn`)
 * ataylab ikki chekinish bor va ular FAQAT shu sahifada: tepada yumshoq
 * nur va oxirgi chaqiriqda ko'k gradient — bu reklama yuzi, savol
 * yechiladigan ekran emas. Ranglar baribir faqat uchta: ko'k, yashil,
 * oltin (qizil — faqat xato javobda).
 *
 * Namunadagi uydirma raqamlar ("4 800+ o'quvchi", "4.9 / 5") va begona
 * rasmlar olinmadi: sahifada faqat rost narsa turadi.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Logo } from "../components/Logo";
import { Icon } from "../lib/icons";

import { COURSES, lessonCount } from "../lib/curriculum";
import { OYINLAR } from "../lib/oyin";
import { blokBormi, sinfOf } from "../lib/blok";
import { botHavolasi, botNomi } from "../lib/api";
import { TILLAR, til, tilniAlmashtir } from "../lib/til";
import { aniqla, obuna, yoruglikniOqi, yoruglikniQoy } from "../lib/yoruglik";
import { useTahlil } from "../lib/tahlil";
import {
  yolKichkintoy, yolKurslar, yolMasalalar, yolOyinlar, yolSertifikat, yolTestSinf,
} from "../lib/yollar";
import { t } from "../lib/matn";

const JAMI_DARS = COURSES.reduce((s, c) => s + lessonCount(c), 0);
const TEST_SINFLAR = COURSES.map((c) => sinfOf(c.grade)).filter(blokBormi);

/** Telegram kanal — sahifa pastida. Kanal nomi o'zgarmaydi. */
const KANAL = "https://t.me/AqlZoneUz";

type Rang = "blue" | "green" | "gold";

/**
 * Rang → tayyor klasslar. Tailwind klasslarni MATNDAN qidiradi, shuning
 * uchun `bg-brand-${rang}` kabi yig'ib bo'lmaydi — to'liq yozilishi shart.
 */
const RANG: Record<Rang, { quti: string; matn: string }> = {
  blue: { quti: "bg-brand-blue/12", matn: "text-brand-blue-t" },
  green: { quti: "bg-brand-green/14", matn: "text-brand-green" },
  gold: { quti: "bg-brand-gold/18", matn: "text-brand-gold-d" },
};

type Kim = "oquvchi" | "abiturient" | "talaba" | "ota_ona" | "ustoz";
const KIMLAR: { kim: Kim; ic: string; rang: Rang }[] = [
  { kim: "oquvchi", ic: "map", rang: "blue" },
  { kim: "abiturient", ic: "vazifa", rang: "green" },
  { kim: "talaba", ic: "miya", rang: "gold" },
  { kim: "ota_ona", ic: "koz", rang: "blue" },
  { kim: "ustoz", ic: "chart", rang: "green" },
];

/** Jonli savollar — javoblar tartibi ataylab har xil. */
const SAVOLLAR = [
  { mavzu: "lendMavzu1", savol: "lendS1", ifoda: "3/4 + 1/8", javoblar: ["5/8", "7/8", "4/12", "1"], togri: 1, izoh: "lendS1Izoh" },
  { mavzu: "lendMavzu2", savol: "lendS2", ifoda: "", javoblar: ["8", "15", "12", "20"], togri: 2, izoh: "lendS2Izoh" },
  { mavzu: "lendMavzu3", savol: "lendS3", ifoda: "", javoblar: ["6", "11", "7", "12"], togri: 0, izoh: "lendS3Izoh" },
] as const;

const BOLIMLAR = [
  { ic: "map", nom: "tabDarslar", izoh: "boshDarslarBatafsil", rang: "blue", yol: yolKurslar },
  { ic: "chart", nom: "testlar", izoh: "boshTestlarBatafsil", rang: "green", yol: yolTestSinf },
  { ic: "vazifa", nom: "lendSertifikat", izoh: "lendSertifikatIzoh", rang: "gold", yol: yolSertifikat },
  { ic: "pencil", nom: "masalalar", izoh: "boshMasalalarBatafsil", rang: "blue", yol: yolMasalalar },
  { ic: "puzzle", nom: "oyinlar", izoh: "boshOyinlarBatafsil", rang: "green", yol: yolOyinlar },
  { ic: "palette", nom: "kichkintoy", izoh: "lendKichkintoyIzoh", rang: "gold", yol: yolKichkintoy },
] as const;

const FAQ = [["lendF1", "lendF1J"], ["lendF2", "lendF2J"], ["lendF3", "lendF3J"], ["lendF4", "lendF4J"]] as const;

/** Tepa paneldagi bo'limlar — `id` sahifadagi bo'lim langari. */
const NAV = [
  ["imkoniyat", "lendImkoniyat"], ["kimlar", "lendKimlar"],
  ["qanday", "boshQanday"], ["savollar", "lendSavollar"],
] as const;

/* Ko'k "loy" tugma: ichki yorug' qirra + pastki to'q qirra + yumshoq soya. */
const KOK_TUGMA = "bg-brand-blue text-white shadow-[0_14px_26px_-10px_var(--color-brand-blue),inset_0_2px_0_rgb(255_255_255/0.35),inset_0_-4px_0_var(--color-brand-blue-d)]";
/* Oq "loy" tugma — ikkinchi darajali amal. */
const OQ_TUGMA = "bg-karta text-ink shadow-[0_12px_24px_-12px_rgb(15_23_42/0.25),inset_0_-3px_0_var(--color-track)]";

function bor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

interface Props {
  onBoshlash: () => void;
  /** Bo'lim kartasi bosilganda — o'sha bo'limning manzili. */
  onOch: (yol: string) => void;
}

export function Lending({ onBoshlash, onOch }: Props) {
  // Ilovaning `App` qismi hali ulanmagan — bosishlar shu yerda yoziladi:
  // panelda "tanishuv sahifasidan nechta odam ichkariga o'tdi" ko'rinsin.
  useTahlil();
  const [bot, setBot] = useState("");
  useEffect(() => {
    let bekor = false;
    botNomi().then((b) => { if (!bekor) setBot(b); });
    return () => { bekor = true; };
  }, []);

  return (
    <div className="min-h-ekran w-full overflow-x-clip">
      <Tepa onBoshlash={onBoshlash} bot={bot} />
      <main>
        <Qahramon onBoshlash={onBoshlash} bot={bot} />
        <Sonlar />
        <Bolimlar onOch={onOch} />
        <Kimlar onBoshlash={onBoshlash} />
        <Qanday />
        <Savollar />
        <Oxir onBoshlash={onBoshlash} bot={bot} />
      </main>
      <Etak bot={bot} />
      <PastkiTugma onBoshlash={onBoshlash} />
    </div>
  );
}

/**
 * Telefonda pastda doim turadigan "Bepul boshlash".
 *
 * Tor ekranda tepa panelda bu tugmaga joy yo'q, sahifa esa uzun: odam
 * "Kimlar uchun" ni o'qib turganda boshlashga qaror qilsa, tugmani
 * qidirib tepaga qaytishi kerak bo'lardi. Panel faqat asosiy tugma
 * ekrandan chiqib ketganda va yakuniy chaqiriq hali ko'rinmaganda
 * chiqadi — bir ekranda ikkita bir xil tugma turmasin.
 */
function PastkiTugma({ onBoshlash }: { onBoshlash: () => void }) {
  const [kor, setKor] = useState(false);
  useEffect(() => {
    const asosiy = document.querySelector('[data-tahlil="Tanishuv: boshlash"]');
    const oxir = document.querySelector('[data-tahlil="Tanishuv: boshlash (oxir)"]');
    if (!asosiy || !oxir) return;
    const holat = { asosiy: true, oxir: false };
    const kuzat = new IntersectionObserver((yozuvlar) => {
      for (const y of yozuvlar) {
        if (y.target === asosiy) holat.asosiy = y.isIntersecting;
        else holat.oxir = y.isIntersecting;
      }
      setKor(!holat.asosiy && !holat.oxir);
    });
    kuzat.observe(asosiy);
    kuzat.observe(oxir);
    return () => kuzat.disconnect();
  }, []);

  return (
    <div aria-hidden={!kor}
      className={`fixed inset-x-0 bottom-0 z-30 px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]
                  transition duration-300 min-[520px]:hidden ${
                    kor ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"}`}>
      <button type="button" onClick={onBoshlash} tabIndex={kor ? 0 : -1} data-tahlil="Tanishuv: boshlash (past)"
        className={`tugma-3d flex h-14 w-full items-center justify-center gap-2 rounded-full font-display text-[17px] ${KOK_TUGMA}`}>
        {t("lendBoshlash")}
        <Icon name="chevron" size={18} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------ tepa */

/** Qaysi bo'lim ko'rinib turibdi — tepa paneldagi yorliq shunga yonadi. */
function useFaolBolim(): string {
  const [faol, setFaol] = useState("");
  useEffect(() => {
    const kuzat = new IntersectionObserver((yozuvlar) => {
      for (const y of yozuvlar) if (y.isIntersecting) setFaol(y.target.id);
    }, { rootMargin: "-45% 0px -50% 0px" });
    for (const [id] of NAV) {
      const el = document.getElementById(id);
      if (el) kuzat.observe(el);
    }
    return () => kuzat.disconnect();
  }, []);
  return faol;
}

function Tepa({ onBoshlash, bot }: { onBoshlash: () => void; bot: string }) {
  const faol = useFaolBolim();
  return (
    <header className="pointer-events-none sticky top-0 z-30 px-3 pt-2 sm:px-6">
      <div className="pointer-events-auto mx-auto flex h-16 max-w-[1200px] 2xl:max-w-[1320px] items-center gap-2 rounded-[28px]
                      bg-karta/85 px-3 shadow-clay-sm backdrop-blur-xl sm:h-[72px] sm:gap-3 sm:px-5">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex shrink-0 items-center gap-2" aria-label="Aql Zone">
          <Logo size={34} jonli={false} />
          <span className="hidden font-display text-[20px] text-brand-blue-t min-[400px]:inline">Aql Zone</span>
        </button>

        <nav className="ml-3 hidden items-center gap-1 rounded-full bg-track p-1 lg:flex">
          {NAV.map(([id, nom]) => (
            <button key={id} type="button" onClick={() => bor(id)}
              className={`h-9 rounded-full px-4 font-display text-[14px] transition ${
                faol === id ? KOK_TUGMA : "text-ink-soft hover:text-ink"}`}>
              {t(nom)}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <TilTugma />
          <YoruglikTugma />
          <button type="button" onClick={onBoshlash} data-tahlil="Tanishuv: boshlash (tepa)"
            className={`tugma-3d hidden h-10 items-center rounded-full px-5 font-display text-[14.5px] min-[520px]:flex ${KOK_TUGMA}`}>
            {t("lendBoshlash")}
          </button>
          {bot && (
            <a href={botHavolasi(bot)} data-tahlil="Tanishuv: kirish (tepa)" aria-label={t("lendKirish")}
              title={t("lendKirish")}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-blue-d text-white">
              <Icon name="send" size={18} />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

/** UZ / RU. Sahifa qayta yuklanmaydi — joyida yangi tilda chiziladi. */
function TilTugma() {
  const joriy = til();
  return (
    <div className="flex h-10 items-center rounded-full bg-track p-1" role="group" aria-label="Til / Язык">
      {TILLAR.map((x) => (
        <button key={x.kod} type="button" onClick={() => void tilniAlmashtir(x.kod)}
          aria-pressed={x.kod === joriy} data-tahlil={`Tanishuv: til ${x.kod}`}
          className={`h-8 rounded-full px-3 font-display text-[13px] transition ${
            x.kod === joriy ? "bg-karta text-brand-blue-t shadow-clay-sm" : "text-ink-dim hover:text-ink"}`}>
          {x.belgi}
        </button>
      ))}
    </div>
  );
}

function YoruglikTugma() {
  const holat = useSyncExternalStore(obuna, () => aniqla(yoruglikniOqi()));
  const qora = holat === "qora";
  return (
    <button type="button" onClick={() => yoruglikniQoy(qora ? "oq" : "qora")}
      aria-label={qora ? t("yoruglikOq") : t("yoruglikQora")}
      className="grid size-10 place-items-center rounded-full bg-track text-ink-soft hover:text-ink">
      <Icon name={qora ? "quyosh" : "oy"} size={19} />
    </button>
  );
}

/* ------------------------------------------------------------ qahramon */

function Qahramon({ onBoshlash, bot }: { onBoshlash: () => void; bot: string }) {
  return (
    <section className="relative">
      {/* Yumshoq nur — faqat shu yerda (tepadagi izoh). Sahifa kengligidan
          chiqib ketmaydi: ildiz `overflow-x-clip`. */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[860px]
                                  max-w-[200vw] -translate-x-1/2 rounded-full bg-brand-blue/12 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -left-40 -z-10 size-[420px]
                                  rounded-full bg-brand-green/10 blur-[110px]" />

      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 pt-8 pb-12 sm:gap-12 sm:px-6 2xl:max-w-[1320px]
                      sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pt-16 lg:pb-20">
        <div className="az-kirish min-w-0 lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-karta px-3.5 py-1.5 text-[13px]
                        text-brand-blue-t shadow-clay-sm">
            <span className="relative flex size-2.5" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-green opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-brand-green" />
            </span>
            <span className="font-display">{t("lendBelgi")}</span>
          </p>

          {/* O'lcham ekran kengligiga SILLIQ ergashadi (clamp): ilgari
              sakrab o'zgarardi va 400–640px oralig'ida sarlavha yo
              juda kichik, yo juda katta ko'rinardi. Kompyuterda ustun
              kengligi cheklangani uchun yuqori chegara alohida. */}
          <h1 className="mt-5 font-display text-[clamp(2.4rem,11vw,3.75rem)] leading-[1.06] tracking-tight
                         lg:text-[clamp(3.5rem,4.8vw,4.5rem)]">
            {t("lendSarlavha1")}{" "}
            <span className="relative inline-block text-brand-blue-t">
              {t("lendSarlavha2")}
              <svg aria-hidden viewBox="0 0 240 12" fill="none" preserveAspectRatio="none"
                className="absolute -bottom-1.5 left-0 h-3 w-full text-brand-green">
                <path d="M3 9C60 3 180 3 237 9" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            {t("lendSarlavha3")}
          </h1>

          <p className="mt-6 max-w-[36rem] text-[16px] leading-relaxed text-ink-soft sm:text-[18px]">
            {t("lendIzoh")}
          </p>

          <div className="mt-8 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-center">
            <button type="button" onClick={onBoshlash} data-tahlil="Tanishuv: boshlash"
              className={`tugma-3d group flex h-14 items-center justify-center gap-2.5 rounded-full px-8
                          font-display text-[17px] ${KOK_TUGMA}`}>
              {t("lendBoshlash")}
              <span className="transition-transform group-hover:translate-x-1"><Icon name="chevron" size={18} /></span>
            </button>
            {bot && (
              <a href={botHavolasi(bot)} data-tahlil="Tanishuv: telegram"
                className={`clay-press flex h-14 items-center justify-center gap-2.5 rounded-full px-7
                            font-display text-[16px] ${OQ_TUGMA}`}>
                <span className="grid size-7 place-items-center rounded-full bg-brand-blue/12 text-brand-blue-t">
                  <Icon name="send" size={15} />
                </span>
                {t("telegramBilanKirish")}
              </a>
            )}
          </div>

          <p className="mt-4 flex items-center gap-2 text-[13.5px] text-ink-dim">
            <span className="grid size-5 place-items-center rounded-full bg-brand-green text-white">
              <Icon name="check" size={12} />
            </span>
            {t("lendTagIzoh")}
          </p>

          {/* Namunadagi "4 800+ o'quvchi, 4.9 / 5" o'rnida — rost faktlar. */}
          <ul className="mt-8 flex flex-wrap gap-2 border-t border-track pt-6">
            {(["lendFakt1", "lendFakt2", "lendFakt3"] as const).map((k) => (
              <li key={k} className="rounded-full bg-track px-3.5 py-1.5 font-display text-[13px] text-ink-soft">
                {t(k)}
              </li>
            ))}
          </ul>
        </div>

        {/* Yorliqlar KARTAGA nisbatan joylashadi (o'rovchi karta kengligida):
            ustun kengroq bo'lganda ular kartadan uzoqlashib qolardi. */}
        <div className="relative mx-auto w-full max-w-[460px] lg:col-span-5">
          {/* Karta atrofidagi kichik yorliqlar — tor ekranda yashirinadi. */}
          <span className="absolute -top-5 -left-4 z-20 hidden items-center gap-1.5 rounded-full bg-karta/95 px-3.5 py-2
                           font-display text-[13px] shadow-clay-sm backdrop-blur sm:flex">
            <span className="text-brand-gold"><Icon name="star" size={16} /></span>
            {t("lendChipYulduz")}
          </span>
          <span className="absolute -right-3 -bottom-5 z-20 hidden items-center gap-1.5 rounded-full bg-karta/95 px-3.5 py-2
                           font-display text-[13px] shadow-clay-sm backdrop-blur sm:flex">
            <span className="text-brand-green"><Icon name="izoh" size={16} /></span>
            {t("lendChipIzoh")}
          </span>
          <Sinov />
        </div>
      </div>
    </section>
  );
}

/** Kasrni ustma-ust yozadi: "7/8" → 7 ustida 8. Qolgani o'zgarmaydi. */
function Ifoda({ matn }: { matn: string }) {
  const qism = matn.split(/(\d+\/\d+)/);
  return (
    <span className="inline-flex items-center gap-1.5">
      {qism.filter(Boolean).map((q, i) => {
        const m = q.match(/^(\d+)\/(\d+)$/);
        if (!m) return <span key={i}>{q}</span>;
        return (
          <span key={i} className="inline-flex flex-col items-center text-[0.8em] leading-none">
            <span>{m[1]}</span>
            <span className="my-0.5 h-[2px] w-full min-w-4 rounded-full bg-current" />
            <span>{m[2]}</span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Jonli savol — sahifadagi eng muhim qism. Ilovaning o'zi kabi ishlaydi:
 * javob → darhol to'g'ri/xato → bir qatorlik tushuntirish.
 */
function Sinov() {
  const [n, setN] = useState(0);
  const [tanlov, setTanlov] = useState<number | null>(null);
  const s = SAVOLLAR[n]!;
  const javob = tanlov !== null;
  const togri = tanlov === s.togri;

  return (
    <div className="az-kirish relative z-10 w-full rounded-[28px] bg-karta p-5 shadow-clay sm:p-6"
      style={{ "--az-kech": "120ms" } as CSSProperties}>
      <div className="flex items-center justify-between gap-3 border-b border-track pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-blue/12">
            <img src="/belgi/savol.webp" width={26} height={26} alt="" aria-hidden decoding="async" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[15.5px] leading-tight">{t("lendJonli")}</p>
            <p className="text-[12.5px] text-ink-dim">{t("lendJonliIzoh")}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-brand-blue/12 px-3 py-1 font-display text-[13px] text-brand-blue-t">
          {n + 1} / {SAVOLLAR.length}
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-sahna px-4 py-5 text-center shadow-ichki">
        <p className="font-display text-[12px] tracking-wider text-ink-dim uppercase">{t(s.mavzu)}</p>
        <p className="mt-2 text-[15px] text-ink-soft">{t(s.savol)}</p>
        {s.ifoda && (
          <p className="mt-3 font-display text-[34px] leading-none">
            <Ifoda matn={s.ifoda} /> <span className="text-ink-dim">=</span>{" "}
            <span className="rounded-xl bg-brand-blue/12 px-2.5 text-brand-blue-t">?</span>
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {s.javoblar.map((j, i) => {
          const bu = tanlov === i;
          const rang = !javob ? `${OQ_TUGMA} hover:-translate-y-0.5`
            : i === s.togri ? "bg-brand-green text-white"
            : bu ? "bg-brand-red text-white"
            : "bg-track text-ink-dim";
          const harf = !javob ? "bg-track text-ink-dim group-hover:bg-brand-blue group-hover:text-white"
            : i === s.togri || bu ? "bg-white/25 text-white" : "bg-karta/60 text-ink-dim";
          return (
            <button key={`${n}-${i}`} type="button" disabled={javob}
              onClick={() => setTanlov(i)} data-tahlil="Tanishuv: sinov javob"
              className={`clay-press group flex h-16 items-center justify-between rounded-2xl px-3
                          font-display text-[22px] transition ${rang}`}>
              <span className={`grid size-7 place-items-center rounded-full text-[12.5px] transition ${harf}`}>
                {"ABCD"[i]}
              </span>
              <Ifoda matn={j} />
              <span className="w-7" />
            </button>
          );
        })}
      </div>

      <div aria-live="polite"
        className={`mt-4 flex min-h-[64px] items-center gap-3 rounded-2xl px-4 py-3 transition ${
          !javob ? "bg-track" : togri ? "bg-brand-green/14" : "bg-brand-red/10"}`}>
        <span className={`grid size-8 shrink-0 place-items-center rounded-full text-white ${
          !javob ? "bg-brand-blue" : togri ? "bg-brand-green" : "bg-brand-red"}`}>
          <Icon name={!javob ? "izoh" : togri ? "check" : "close"} size={16} />
        </span>
        <div className="min-w-0 text-[14px] leading-snug">
          {javob ? (
            <>
              <p className={`font-display text-[15px] ${togri ? "text-brand-green" : "text-brand-red"}`}>
                {togri ? t("lendTogri") : t("lendNotogri")}
              </p>
              <p className="text-ink-soft">{t(s.izoh)}</p>
            </>
          ) : (
            <p className="text-ink-soft">{t("lendTanlang")}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="button" data-tahlil="Tanishuv: keyingi savol"
          onClick={() => { setN((n + 1) % SAVOLLAR.length); setTanlov(null); }}
          className="flex h-11 items-center gap-1.5 rounded-full bg-track px-5 font-display text-[14px] text-ink hover:bg-brand-blue/12">
          {t("lendKeyingi")}
          <Icon name="chevron" size={15} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ sonlar */

function Sonlar() {
  const sonlar: { ic: string; rang: Rang; son: string; nom: string; izoh: string }[] = [
    { ic: "map", rang: "blue", son: `${JAMI_DARS}+`, nom: t("lendSonDars"), izoh: t("lendSonDarsIzoh") },
    { ic: "chart", rang: "green", son: `${Math.min(...TEST_SINFLAR)}–${Math.max(...TEST_SINFLAR)}`,
      nom: t("lendSonSinf"), izoh: t("lendSonSinfIzoh") },
    { ic: "puzzle", rang: "gold", son: String(OYINLAR.length), nom: t("lendSonOyin"), izoh: t("lendSonOyinIzoh") },
    { ic: "raqamlar", rang: "blue", son: "UZ / RU", nom: t("lendSonTilNom"), izoh: t("lendSonTilIzoh") },
  ];
  return (
    <section className="bg-track/60 py-6 sm:py-10">
      {/* Telefonda ham IKKI ustun: bitta ustunda to'rtta baland karta
          ekranni to'rt marta aylantirtirardi. Tor kartada belgi ustda,
          kengida — chapda. */}
      <ul className="mx-auto grid max-w-[1200px] grid-cols-2 gap-3 px-4 sm:gap-4 sm:px-6 lg:grid-cols-4 2xl:max-w-[1320px]">
        {sonlar.map((s) => (
          <li key={s.nom} className="flex flex-col gap-3 rounded-[22px] bg-karta p-4 shadow-clay-sm transition
                                     hover:-translate-y-1 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
            <span className={`grid size-10 shrink-0 place-items-center rounded-2xl sm:size-12 ${RANG[s.rang].quti}`}>
              <img src={`/belgi/${s.ic}.webp`} width={28} height={28} alt="" aria-hidden decoding="async"
                className="size-6 sm:size-7" />
            </span>
            <div className="min-w-0">
              <p className={`font-display text-[24px] leading-none tracking-tight sm:text-[30px] ${RANG[s.rang].matn}`}>{s.son}</p>
              <p className="mt-1.5 font-display text-[14px] sm:mt-2 sm:text-[14.5px]">{s.nom}</p>
              <p className="text-[12.5px] leading-snug text-ink-dim sm:text-[13px]">{s.izoh}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------ bo'limlar */

function Sarlavha({ id, yorliq, rang = "blue", nom, izoh }: {
  id: string; yorliq: string; rang?: Rang; nom: string; izoh?: string;
}) {
  return (
    <div id={id} className="mx-auto max-w-[44rem] scroll-mt-28 text-center">
      <span className={`inline-flex rounded-full px-3.5 py-1 font-display text-[12px] tracking-wider uppercase
                        ${RANG[rang].quti} ${RANG[rang].matn}`}>
        {yorliq}
      </span>
      <h2 className="mt-3 font-display text-[clamp(1.75rem,6.5vw,2.75rem)] leading-tight tracking-tight">{nom}</h2>
      {izoh && <p className="mt-3 text-[15px] leading-relaxed text-ink-soft sm:text-[16px]">{izoh}</p>}
    </div>
  );
}

function Bolim({ children, fon }: { children: ReactNode; fon?: boolean }) {
  return (
    <section className={`py-14 sm:py-20 lg:py-24 ${fon ? "bg-track/60" : ""}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 2xl:max-w-[1320px]">{children}</div>
    </section>
  );
}

function Bolimlar({ onOch }: { onOch: (yol: string) => void }) {
  return (
    <Bolim>
      <Sarlavha id="imkoniyat" yorliq={t("lendImkoniyat")} nom={t("lendImkSarlavha")} izoh={t("lendImkIzoh")} />
      <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {BOLIMLAR.map((b) => (
          <li key={b.ic}>
            <button type="button" onClick={() => onOch(b.yol())} data-tahlil={`Tanishuv: bo'lim ${b.ic}`}
              className="group flex h-full w-full flex-col rounded-[24px] bg-karta p-5 text-left sm:rounded-[28px] sm:p-6 shadow-clay-sm
                         transition hover:-translate-y-1.5 hover:shadow-clay">
              <span className={`grid size-14 place-items-center rounded-2xl transition-transform group-hover:scale-110
                                ${RANG[b.rang].quti}`}>
                <img src={`/belgi/${b.ic}.webp`} width={34} height={34} alt="" aria-hidden decoding="async" />
              </span>
              <h3 className="mt-5 font-display text-[20px] leading-tight">{t(b.nom)}</h3>
              <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-ink-soft">{t(b.izoh)}</p>
              <span className={`mt-5 flex items-center gap-1.5 font-display text-[14.5px] ${RANG[b.rang].matn}`}>
                {t("boshOchish")}
                <span className="transition-transform group-hover:translate-x-1"><Icon name="chevron" size={15} /></span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Bolim>
  );
}

/* ------------------------------------------------------------ kimlar */

function Kimlar({ onBoshlash }: { onBoshlash: () => void }) {
  const [kim, setKim] = useState<Kim>("oquvchi");
  const tanlangan = KIMLAR.find((k) => k.kim === kim)!;
  const r = RANG[tanlangan.rang];
  return (
    <Bolim fon>
      <Sarlavha id="kimlar" yorliq={t("lendKimlar")} rang="green" nom={t("lendKimSarlavha")} izoh={t("lendKimIzoh")} />

      {/* Tor ekranda yorliqlar o'ralib ikkinchi qatorga o'tadi — yonga
          suriladigan qator sahifani gorizontal siljitib yuborardi. */}
      <div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8" role="tablist">
        {KIMLAR.map(({ kim: k }) => (
          <button key={k} type="button" role="tab" aria-selected={k === kim}
            onClick={() => setKim(k)} data-tahlil={`Tanishuv: kim ${k}`}
            className={`h-11 rounded-full px-4 font-display text-[14.5px] transition sm:px-5 sm:text-[15px] ${
              k === kim ? KOK_TUGMA : `${OQ_TUGMA} text-ink-soft hover:text-ink`}`}>
            {t(`lendKim_${k}`)}
          </button>
        ))}
      </div>

      <div key={kim} role="tabpanel"
        className="az-kirish mt-6 grid items-center gap-6 rounded-[28px] bg-karta p-5 shadow-clay sm:gap-8 sm:rounded-[32px] sm:p-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <span className={`inline-flex rounded-full px-3.5 py-1 font-display text-[13px] ${r.quti} ${r.matn}`}>
            {t(`lendKim_${kim}_belgi`)}
          </span>
          <h3 className="mt-4 font-display text-[24px] leading-tight sm:text-[28px]">{t(`lendKim_${kim}_sarlavha`)}</h3>
          <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">{t(`lendKim_${kim}_izoh`)}</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {([1, 2, 3, 4] as const).map((i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-green text-white">
                  <Icon name="check" size={13} />
                </span>
                <span className="font-display text-[14.5px] leading-snug">{t(`lendKim_${kim}${i}`)}</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={onBoshlash} data-tahlil={`Tanishuv: kim boshlash ${kim}`}
            className={`tugma-3d mt-7 flex h-12 items-center gap-2 rounded-full px-6 font-display text-[15px] ${KOK_TUGMA}`}>
            {t("lendBoshlash")}
            <Icon name="chevron" size={16} />
          </button>
        </div>

        {/* Namunadagi suratlar o'rnida — bo'limning o'z belgisi. Begona
            rasm sahifani og'irlashtirar va istalgan payt o'chib qolardi. */}
        <div className={`relative order-first grid h-40 place-items-center overflow-hidden rounded-[22px] sm:h-60 lg:order-none lg:col-span-5 lg:h-80 ${r.quti}`}>
          <img src={`/belgi/${tanlangan.ic}.webp`} width={150} height={150} alt="" aria-hidden decoding="async"
            className="az-suzish size-24 drop-shadow-xl sm:size-32 lg:size-40" />
          <span className="absolute bottom-4 left-4 rounded-full bg-karta/90 px-3.5 py-1.5 font-display text-[13px] shadow-clay-sm">
            {t(`lendKim_${kim}`)}
          </span>
        </div>
      </div>
    </Bolim>
  );
}

/* ------------------------------------------------------------ qanday */

function Qanday() {
  const qadamlar = [
    { nom: "lendQ1", izoh: "lendQ1Izoh", chip: "lendQ1Chip", rang: "blue", ic: "play" },
    { nom: "lendQ2", izoh: "lendQ2Izoh", chip: "lendChipIzoh", rang: "green", ic: "izoh" },
    { nom: "lendQ3", izoh: "lendQ3Izoh", chip: "lendQ3Chip", rang: "gold", ic: "trophy" },
  ] as const;
  return (
    <Bolim>
      <Sarlavha id="qanday" yorliq={t("lendQadamlar")} nom={t("boshQanday")} izoh={t("lendQandayIzoh")} />
      {/* Uch ustun faqat keng ekranda. Planshetda (768) uch ustunda
          sarlavhalar ikki qatorga sinib, kartalar cho'zilib ketardi —
          u yerda va telefonda raqam chapda, matn o'ngda turadi. */}
      <ol className="mx-auto mt-8 grid max-w-[720px] gap-3 sm:mt-10 sm:gap-4 lg:max-w-none lg:grid-cols-3">
        {qadamlar.map((q, i) => (
          <li key={q.nom} className="flex gap-4 rounded-[24px] bg-karta p-5 shadow-clay-sm transition
                                     hover:-translate-y-1 sm:p-6 lg:flex-col lg:gap-0 lg:rounded-[28px]">
            <span className={`grid size-12 shrink-0 place-items-center rounded-2xl font-display text-[19px]
                              sm:size-14 lg:size-16 lg:text-[24px] ${RANG[q.rang].quti} ${RANG[q.rang].matn}`}>
              0{i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="font-display text-[18px] sm:text-[20px] lg:mt-5">{t(q.nom)}</h3>
              <p className="mt-1.5 flex-1 text-[14.5px] leading-relaxed text-ink-soft lg:mt-2">{t(q.izoh)}</p>
              <span className={`mt-3 flex w-fit items-center gap-2 rounded-xl bg-track px-3 py-2 font-display text-[13px]
                                lg:mt-5 lg:w-auto lg:py-2.5 ${RANG[q.rang].matn}`}>
                <Icon name={q.ic} size={16} />
                {t(q.chip)}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </Bolim>
  );
}

/* ------------------------------------------------------------ savollar */

function Savollar() {
  const [ochiq, setOchiq] = useState<number | null>(0);
  return (
    <Bolim fon>
      <Sarlavha id="savollar" yorliq={t("lendSavollar")} rang="gold" nom={t("lendSavolSarlavha")} />
      <div className="mx-auto mt-10 grid max-w-[820px] gap-3">
        {FAQ.map(([s, j], i) => {
          const bu = ochiq === i;
          return (
            <div key={s} className="rounded-[22px] bg-karta shadow-clay-sm">
              <button type="button" aria-expanded={bu} onClick={() => setOchiq(bu ? null : i)}
                className="flex min-h-16 w-full items-center gap-3 px-5 py-4 text-left font-display text-[16.5px]">
                <span className="flex-1">{t(s)}</span>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full transition ${
                  bu ? "rotate-90 bg-brand-blue text-white" : "bg-track text-ink-dim"}`}>
                  <Icon name="chevron" size={16} />
                </span>
              </button>
              {bu && <p className="az-kirish px-5 pb-5 text-[15px] leading-relaxed text-ink-soft">{t(j)}</p>}
            </div>
          );
        })}
      </div>
    </Bolim>
  );
}

/* ------------------------------------------------------------ oxir */

function Oxir({ onBoshlash, bot }: { onBoshlash: () => void; bot: string }) {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] sm:rounded-[36px] 2xl:max-w-[1320px] bg-gradient-to-br
                      from-brand-blue to-brand-blue-d px-5 py-12 text-center sm:px-6 sm:py-16 lg:py-20 text-white shadow-clay">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 size-80 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-brand-green/25 blur-3xl" />
        <div className="relative mx-auto flex max-w-[40rem] flex-col items-center">
          <span className="grid size-16 place-items-center rounded-full bg-white/15 backdrop-blur">
            <img src="/belgi/chaqmoq.webp" width={36} height={36} alt="" aria-hidden decoding="async" />
          </span>
          <h2 className="mt-5 font-display text-[28px] leading-tight tracking-tight sm:text-[40px]">{t("lendOxirSarlavha")}</h2>
          <p className="mt-3 text-[16px] opacity-90 sm:text-[17px]">{t("lendOxirIzoh")}</p>
          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <button type="button" onClick={onBoshlash} data-tahlil="Tanishuv: boshlash (oxir)"
              className="tugma-3d flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white px-8 font-display
                         text-[17px] text-brand-blue-d shadow-[0_16px_32px_rgb(0_0_0/0.18),inset_0_-3px_0_rgb(0_0_0/0.08)] sm:w-auto">
              {t("lendBoshlash")}
              <Icon name="chevron" size={18} />
            </button>
            {bot && (
              <a href={botHavolasi(bot)} data-tahlil="Tanishuv: telegram (oxir)"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white/12 px-7 font-display
                           text-[16px] backdrop-blur hover:bg-white/20 sm:w-auto">
                <Icon name="send" size={17} />
                {t("telegramBilanKirish")}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Etak({ bot }: { bot: string }) {
  return (
    <footer className="bg-track/60">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 px-4 py-8 2xl:max-w-[1320px] text-center
                      sm:px-6 md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2.5">
          <Logo size={30} jonli={false} />
          <span className="font-display text-[18px] text-brand-blue-t">Aql Zone</span>
        </div>
        <p className="text-[13.5px] text-ink-dim">{t("lendEtak")}</p>
        <div className="flex items-center gap-1 text-[14px]">
          <a href={KANAL} target="_blank" rel="noopener" data-tahlil="Tanishuv: kanal"
            className="flex h-11 items-center rounded-full px-3 font-display text-ink-soft hover:bg-karta hover:text-ink">
            {t("lendKanal")}
          </a>
          {bot && (
            <a href={botHavolasi(bot)} data-tahlil="Tanishuv: kirish (etak)"
              className="flex h-11 items-center rounded-full px-3 font-display text-ink-soft hover:bg-karta hover:text-ink">
              {t("lendKirish")}
            </a>
          )}
        </div>
      </div>
      <p className="pb-24 text-center text-[13px] text-ink-dim min-[520px]:pb-6">© {new Date().getFullYear()} Aql Zone</p>
    </footer>
  );
}
