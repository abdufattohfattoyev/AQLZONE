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
 *   3. Bo'limlar (bosilsa — o'sha bo'lim ochiladi), kimlar uchun va
 *      qanday ishlaydi. "Savollar" (FAQ) 2026-10-08 da olib tashlandi.
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
import { Hajmli } from "../lib/hajmli";

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

/** Tepa paneldagi bo'limlar — `id` sahifadagi bo'lim langari. */
const NAV = [
  ["imkoniyat", "lendImkoniyat"], ["kimlar", "lendKimlar"],
  ["qanday", "boshQanday"],
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
        <Qahramon onBoshlash={onBoshlash} onOch={onOch} />
        <Sonlar />
        <SinovBolim />
        <Bolimlar onOch={onOch} />
        <Kimlar onBoshlash={onBoshlash} />
        <Qanday />
        <Oxir onBoshlash={onBoshlash} bot={bot} />
      </main>
      <Etak bot={bot} onOch={onOch} />
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
    const asosiy = document.getElementById("qahramon");
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

/**
 * Qahramon slaydlari — o'zi almashib turadi.
 *
 * Har slayd bitta bo'limni sotadi: o'z sarlavhasi (o'rtadagi so'z rangli,
 * tagida marker chizig'i), izohi, "sahna" ichidagi 3D belgi, ikkita
 * yorliq va o'sha bo'limga olib boradigan tugma. "Bepul boshlash" esa
 * hammasida bir xil — asosiy amal o'zgarmaydi.
 *
 * Ilk variant testmakon'ga juda o'xshab ketdi (katak fon, to'liq rangli
 * tabletka, ochiq havoda suzuvchi narsa) va 2026-10-08 da foydalanuvchi
 * "o'zimizga xos bo'lsin" dedi. Shuning uchun: fon katak emas — faqat
 * rangli nur; belgi yumaloq SAHNA kartada, atrofida halqalar va suzuvchi
 * matematik belgilar; ajratilgan so'z — marker bilan; slaydlar nuqta
 * emas, nomli yorliqlar.
 *
 * 3D belgilar `Hajmli` dan: `public/belgi/e/` dagi 256px rasmlar (asl
 * varaqdagi o'lcham shu) — 240px dan katta qilinmaydi, xiralashardi.
 */
const SLAYDLAR = [
  { rang: "blue", belgi: "kitob", tab: "lendSlTab1", yorliq: "lendSl1Belgi", s1: "lendSarlavha1", s2: "lendSarlavha2", s3: "lendSarlavha3",
    izoh: "lendIzoh", tugma: "lendSl1Tugma", yol: yolKurslar, chip1: "lendSl1Chip1", chip2: "lendSl1Chip2", n: JAMI_DARS },
  { rang: "green", belgi: "nishon", tab: "lendSlTab2", yorliq: "lendSl2Belgi", s1: "lendSl2S1", s2: "lendSl2S2", s3: "lendSl2S3",
    izoh: "lendSl2Izoh", tugma: "lendSl2Tugma", yol: yolTestSinf, chip1: "lendSl2Chip1", chip2: "lendSl2Chip2", n: 0 },
  { rang: "gold", belgi: "medal", tab: "lendSlTab3", yorliq: "lendSl3Belgi", s1: "lendSl3S1", s2: "lendSl3S2", s3: "lendSl3S3",
    izoh: "lendSl3Izoh", tugma: "lendSl3Tugma", yol: yolSertifikat, chip1: "lendSl3Chip1", chip2: "lendSl3Chip2", n: 0 },
  { rang: "blue", belgi: "kubok", tab: "lendSlTab4", yorliq: "lendSl4Belgi", s1: "lendSl4S1", s2: "lendSl4S2", s3: "lendSl4S3",
    izoh: "lendSl4Izoh", tugma: "lendSl4Tugma", yol: yolOyinlar, chip1: "lendSl4Chip1", chip2: "lendSl4Chip2", n: OYINLAR.length },
] as const;

type Slayd = (typeof SLAYDLAR)[number];

/** Bir slayd necha millisekund turadi. */
const SLAYD_MS = 6500;

/**
 * Ajratilgan so'z: rangli matn + tagida yarim balandlikdagi marker.
 * Marker rangi `color-mix` bilan shaffof qilinadi — token o'zgarsa,
 * u ham ergashadi.
 */
const MARKER: Record<Rang, string> = {
  blue: "text-brand-blue-t bg-[linear-gradient(transparent_62%,color-mix(in_srgb,var(--color-brand-blue)_28%,transparent)_62%)]",
  green: "text-brand-green bg-[linear-gradient(transparent_62%,color-mix(in_srgb,var(--color-brand-green)_28%,transparent)_62%)]",
  gold: "text-brand-gold-d bg-[linear-gradient(transparent_62%,color-mix(in_srgb,var(--color-brand-gold)_32%,transparent)_62%)]",
};
const CHIZIQ: Record<Rang, string> = { blue: "bg-brand-blue", green: "bg-brand-green", gold: "bg-brand-gold" };
const NUR: Record<Rang, string> = { blue: "bg-brand-blue/22", green: "bg-brand-green/22", gold: "bg-brand-gold/22" };

/**
 * Sahna atrofida suzuvchi matematik belgilar: [belgi, chapdan %, tepadan %,
 * kechikish s]. Joylari qo'lda tanlangan — belgining o'zi va yorliqlarni
 * yopmasin.
 */
const SIMVOLLAR: [string, number, number, number][] = [
  ["+", 14, 22, 0], ["×", 80, 16, 1.2], ["π", 86, 58, 2.1], ["√", 10, 66, 0.6], ["%", 50, 8, 1.7], ["=", 58, 88, 2.6],
];

const SARLAVHA = "mt-5 font-display text-[clamp(2.4rem,11vw,3.75rem)] leading-[1.1] tracking-tight lg:text-[clamp(3.4rem,4.6vw,4.25rem)]";

function Qahramon({ onBoshlash, onOch }: { onBoshlash: () => void; onOch: (yol: string) => void }) {
  const [i, setI] = useState(0);
  const [toxta, setToxta] = useState(false);
  // Harakatni kamaytirishni so'ragan odamga slaydlar o'zi almashmaydi.
  const [kamHarakat] = useState(() => {
    try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
  });

  useEffect(() => {
    if (toxta || kamHarakat) return;
    const id = setTimeout(() => setI((x) => (x + 1) % SLAYDLAR.length), SLAYD_MS);
    return () => clearTimeout(id);
  }, [i, toxta, kamHarakat]);

  const s = SLAYDLAR[i]!;

  return (
    <section id="qahramon" className="relative isolate overflow-hidden"
      onMouseEnter={() => setToxta(true)} onMouseLeave={() => setToxta(false)}>
      {/* Fon — faqat slayd rangidagi yumshoq nur (fayl boshidagi izoh). */}
      <div aria-hidden className={`pointer-events-none absolute top-[10%] right-[2%] -z-10 size-[380px] rounded-full
                                   blur-[120px] transition-colors duration-700 sm:size-[560px] ${NUR[s.rang]}`} />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-32 -z-10 size-[420px] rounded-full
                                  bg-brand-blue/10 blur-[120px]" />

      <div className="mx-auto max-w-[1200px] px-4 pt-8 pb-10 sm:px-6 sm:pt-12 lg:pt-14 lg:pb-12 2xl:max-w-[1320px]">
        {/* Hamma slayd BITTA katakda ustma-ust turadi: blok balandligi eng
            uzun slaydga teng bo'ladi va almashganda sahifa sakramaydi. */}
        <div className="grid">
          {SLAYDLAR.map((sl, k) => {
            const faol = k === i;
            return (
              <div key={k} aria-hidden={!faol} inert={!faol}
                className={`grid items-center gap-8 [grid-area:1/1] lg:grid-cols-12 lg:gap-12
                            transition-[opacity,transform] duration-500 ${
                              faol ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
                <div className="min-w-0 lg:col-span-7">
                  <p className={`inline-flex items-center gap-2 rounded-full bg-karta px-3.5 py-1.5 font-display text-[13px]
                                 shadow-clay-sm ${RANG[sl.rang].matn}`}>
                    <span className="relative flex size-2.5" aria-hidden>
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-green opacity-60" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-brand-green" />
                    </span>
                    {t(sl.yorliq)}
                  </p>

                  {/* Sahifada bitta h1 — birinchi slaydniki. */}
                  {k === 0
                    ? <h1 className={SARLAVHA}><Sarlavha3 sl={sl} /></h1>
                    : <p role="heading" aria-level={2} className={SARLAVHA}><Sarlavha3 sl={sl} /></p>}

                  <p className="mt-5 max-w-[36rem] text-[16px] leading-relaxed text-ink-soft sm:text-[18px]">{t(sl.izoh)}</p>

                  <div className="mt-7 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-center">
                    <button type="button" onClick={onBoshlash} data-tahlil="Tanishuv: boshlash"
                      className={`tugma-3d group flex h-14 items-center justify-center gap-2.5 rounded-full px-8
                                  font-display text-[17px] ${KOK_TUGMA}`}>
                      {t("lendBoshlash")}
                      <span className="transition-transform group-hover:translate-x-1"><Icon name="chevron" size={18} /></span>
                    </button>
                    <button type="button" onClick={() => onOch(sl.yol())} data-tahlil={`Tanishuv: slayd ${k + 1}`}
                      className={`clay-press flex h-14 items-center justify-center gap-2 rounded-full px-7
                                  font-display text-[16px] ${OQ_TUGMA}`}>
                      {t(sl.tugma)}
                    </button>
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-[13px] text-ink-dim">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-green text-white">
                      <Icon name="check" size={12} />
                    </span>
                    {t("lendTagIzoh")}
                  </p>
                </div>

                <Sahna sl={sl} faol={faol} />
              </div>
            );
          })}
        </div>

        {/* Slayd yorliqlari — faolining tagida keyingisigacha qolgan vaqt. */}
        <div className="mt-8 grid grid-cols-4 gap-2 sm:max-w-[560px] sm:gap-3 lg:mt-10" role="tablist" aria-label="Slaydlar">
          {SLAYDLAR.map((sl, k) => {
            const bu = k === i;
            return (
              <button key={k} type="button" role="tab" aria-selected={bu} onClick={() => setI(k)}
                data-tahlil={`Tanishuv: slayd yorliq ${k + 1}`}
                className={`group min-w-0 text-left font-display text-[13px] transition sm:text-[14px] ${
                  bu ? "text-ink" : "text-ink-dim hover:text-ink-soft"}`}>
                <span className="block h-1.5 overflow-hidden rounded-full bg-track">
                  {bu && (
                    <span key={i} data-toxtadi={toxta ? "1" : "0"}
                      className={`az-lend-vaqt block h-full rounded-full ${CHIZIQ[sl.rang]}`}
                      style={{ "--az-vaqt": `${SLAYD_MS}ms` } as CSSProperties} />
                  )}
                </span>
                <span className="mt-2 block truncate">{t(sl.tab)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Sarlavha3({ sl }: { sl: Slayd }) {
  return (
    <>
      {t(sl.s1)}{" "}
      <span className={`[box-decoration-break:clone] [-webkit-box-decoration-break:clone] ${MARKER[sl.rang]}`}>
        {t(sl.s2)}
      </span>{" "}
      {t(sl.s3)}
    </>
  );
}

/**
 * Sahna — 3D belgi turadigan yumaloq karta.
 *
 * Ichida: slayd rangida och fon, markazdan tarqaluvchi uchta halqa, sekin
 * suzuvchi matematik belgilar va o'rtada belgining o'zi. Ikki yorliq
 * kartaning chetiga "yopishgan" — yarmi tashqarida.
 */
function Sahna({ sl, faol }: { sl: Slayd; faol: boolean }) {
  return (
    <div className="relative mx-auto w-full max-w-[290px] sm:max-w-[400px] lg:col-span-5 lg:max-w-[440px]">
      <div className={`relative aspect-square overflow-hidden rounded-[40px] bg-karta shadow-clay sm:rounded-[48px]`}>
        <div aria-hidden className={`absolute inset-0 ${RANG[sl.rang].quti}`} />
        {/* Halqalar */}
        {[88, 66, 44].map((o) => (
          <div key={o} aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-ink-dim/15"
            style={{ width: `${o}%`, height: `${o}%` }} />
        ))}
        {/* Suzuvchi matematik belgilar */}
        {SIMVOLLAR.map(([b, x, y, kech]) => (
          <span key={b} aria-hidden
            className={`az-lend-suz absolute grid size-10 place-items-center rounded-2xl bg-karta font-display text-[20px]
                        shadow-clay-sm sm:size-12 sm:text-[24px] ${RANG[sl.rang].matn}`}
            style={{ left: `${x}%`, top: `${y}%`, translate: "-50% -50%", animationDelay: `-${kech}s` }}>
            {b}
          </span>
        ))}
        {/* Belgi — faqat faol slaydda chiziladi: kirish animatsiyasi har
            almashishda qaytadan boshlansin. */}
        <div className="absolute inset-0 grid place-items-center">
          {faol && (
            <div className="az-lend-kir">
              <div className="az-lend-suz">
                <Hajmli nom={sl.belgi} olcham={240}
                  className="size-36 drop-shadow-[0_26px_26px_rgb(0_0_0/0.28)] sm:size-48 lg:size-56" />
              </div>
            </div>
          )}
        </div>
      </div>

      {faol && (
        <>
          <span className="az-kirish absolute top-[14%] -left-2 flex items-center gap-1.5 rounded-full bg-karta px-3.5 py-2
                           font-display text-[13px] shadow-clay sm:-left-6"
            style={{ "--az-kech": "250ms" } as CSSProperties}>
            <span className={`grid size-5 place-items-center rounded-full text-white ${CHIZIQ[sl.rang]}`}>
              <Icon name="check" size={12} />
            </span>
            {t(sl.chip1, { n: sl.n })}
          </span>
          <span className="az-kirish absolute -right-2 bottom-[12%] flex items-center gap-1.5 rounded-full bg-karta px-3.5 py-2
                           font-display text-[13px] shadow-clay sm:-right-6"
            style={{ "--az-kech": "400ms" } as CSSProperties}>
            <span className="text-brand-gold"><Icon name="star" size={16} /></span>
            {t(sl.chip2)}
          </span>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ sinov */

/** Jonli savol — endi alohida bo'lim (ilgari qahramon blokining o'ng tomoni edi). */
function SinovBolim() {
  return (
    <section className="py-10 sm:py-14 lg:py-16">
      <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 2xl:max-w-[1320px]">
        <div className="text-center lg:col-span-6 lg:text-left">
          <span className={`inline-flex rounded-full px-3.5 py-1 font-display text-[12px] tracking-wider uppercase
                            ${RANG.blue.quti} ${RANG.blue.matn}`}>
            {t("lendJonli")}
          </span>
          <h2 className="mt-3 font-display text-[clamp(1.75rem,6.5vw,2.75rem)] leading-tight tracking-tight">
            {t("lendSinovSarlavha")}
          </h2>
          <p className="mx-auto mt-3 max-w-[32rem] text-[15px] leading-relaxed text-ink-soft sm:text-[16px] lg:mx-0">
            {t("lendSinovIzoh")}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
            <span className="flex items-center gap-1.5 rounded-full bg-karta px-3.5 py-2 font-display text-[13px] shadow-clay-sm">
              <span className="text-brand-gold"><Icon name="star" size={15} /></span>
              {t("lendChipYulduz")}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-karta px-3.5 py-2 font-display text-[13px] shadow-clay-sm">
              <span className="text-brand-green"><Icon name="izoh" size={15} /></span>
              {t("lendChipIzoh")}
            </span>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[460px] lg:col-span-6 lg:mr-0">
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
    <section className={`py-10 sm:py-14 lg:py-16 ${fon ? "bg-track/60" : ""}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 2xl:max-w-[1320px]">{children}</div>
    </section>
  );
}

function Bolimlar({ onOch }: { onOch: (yol: string) => void }) {
  return (
    <Bolim>
      <Sarlavha id="imkoniyat" yorliq={t("lendImkoniyat")} nom={t("lendImkSarlavha")} izoh={t("lendImkIzoh")} />
      <ul className="mt-7 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
      <ol className="mx-auto mt-7 grid max-w-[720px] gap-3 sm:mt-8 sm:gap-4 lg:max-w-none lg:grid-cols-3">
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

/* ------------------------------------------------------------ oxir */

function Oxir({ onBoshlash, bot }: { onBoshlash: () => void; bot: string }) {
  return (
    <section className="px-4 pt-2 pb-10 sm:px-6 sm:pb-14 lg:pb-16">
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

/**
 * Sahifa oxiri — to'rt ustun: kim biz, bo'limlar, shu sahifa, aloqa.
 *
 * Ilgari bitta qator edi (logo · shior · ikki havola) va keng ekranda
 * uchala bo'lak bir-biridan uzoqlashib, "©" qatori esa ulardan alohida
 * osilib qolardi. Endi hammasi bitta to'rga tushadi, pastki qator esa
 * yupqa chiziq bilan ajratilgan.
 */
function Etak({ bot, onOch }: { bot: string; onOch: (yol: string) => void }) {
  const havola = "flex min-h-9 items-center text-[14.5px] text-ink-soft transition hover:text-brand-blue-t";
  const sarlavha = "font-display text-[13px] tracking-wider text-ink-dim uppercase";
  return (
    <footer className="bg-track/60">
      <div className="mx-auto max-w-[1200px] px-4 pt-12 sm:px-6 sm:pt-14 2xl:max-w-[1320px]">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Kim biz */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <Logo size={36} jonli={false} />
              <span className="font-display text-[22px] text-brand-blue-t">Aql Zone</span>
            </div>
            <p className="mt-4 max-w-[26rem] text-[14.5px] leading-relaxed text-ink-soft">{t("lendEtakIzoh")}</p>
            <a href={KANAL} target="_blank" rel="noopener" data-tahlil="Tanishuv: kanal (etak)"
              className={`clay-press mt-5 inline-flex h-11 items-center gap-2.5 rounded-full pr-5 pl-2 font-display text-[14.5px] ${OQ_TUGMA}`}>
              <span className="grid size-8 place-items-center rounded-full bg-brand-blue text-white">
                <Icon name="send" size={15} />
              </span>
              @AqlZoneUz
            </a>
          </div>

          {/* Havolalar — telefonda ikki ustun, kengida uchta. */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <nav aria-label={t("lendEtakBolimlar")}>
              <p className={sarlavha}>{t("lendEtakBolimlar")}</p>
              <ul className="mt-3">
                {BOLIMLAR.map((b) => (
                  <li key={b.ic}>
                    <button type="button" onClick={() => onOch(b.yol())} data-tahlil={`Tanishuv: etak ${b.ic}`}
                      className={havola}>
                      {t(b.nom)}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label={t("lendEtakSahifa")}>
              <p className={sarlavha}>{t("lendEtakSahifa")}</p>
              <ul className="mt-3">
                {NAV.map(([id, nom]) => (
                  <li key={id}>
                    <button type="button" onClick={() => bor(id)} className={havola}>{t(nom)}</button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="col-span-2 sm:col-span-1">
              <p className={sarlavha}>{t("lendEtakAloqa")}</p>
              <ul className="mt-3">
                <li>
                  <a href={KANAL} target="_blank" rel="noopener" data-tahlil="Tanishuv: kanal" className={havola}>
                    {t("lendKanal")}
                  </a>
                </li>
                {bot && (
                  <li>
                    <a href={botHavolasi(bot)} data-tahlil="Tanishuv: kirish (etak)" className={havola}>
                      {t("lendBot")} · @{bot}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Pastki qator. Telefonda pastki "Bepul boshlash" paneli uni
            yopmasin — shuning uchun tor ekranda pastdan katta bo'sh joy. */}
        <div className="mt-10 flex flex-col-reverse items-center gap-4 border-t border-track py-6 pb-24
                        min-[520px]:pb-6 sm:flex-row sm:justify-between">
          <p className="text-[13px] text-ink-dim">© {new Date().getFullYear()} Aql Zone · {t("lendEtak")}</p>
          <div className="flex items-center gap-2">
            <TilTugma />
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              data-tahlil="Tanishuv: tepaga"
              className="flex h-10 items-center gap-1.5 rounded-full bg-karta px-4 font-display text-[13.5px] text-ink-soft
                         shadow-clay-sm hover:text-ink">
              <span className="-rotate-90"><Icon name="chevron" size={14} /></span>
              {t("lendTepaga")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
