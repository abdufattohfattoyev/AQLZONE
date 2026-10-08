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
 *   3. Bo'limlar, kimlar uchun, qanday ishlaydi, savollar.
 *   4. Oxirida yana o'sha bitta tugma.
 *
 * Asosiy amal BITTA va hamma joyda bir xil: "Bepul boshlash" (ko'k).
 * Telegram bilan kirish — ikkinchi darajali, neytral: kirish majburiy
 * emas va uni birinchi o'ringa qo'yish "ro'yxatdan o'tish kerak ekan"
 * degan noto'g'ri taassurot berardi.
 *
 * Fon tekis, ranglar faqat tokenlar (`aqlzone-dizayn`). Bo'limlar
 * rang bilan emas, oraliq va kartalar bilan ajraladi.
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
import { t } from "../lib/matn";

const JAMI_DARS = COURSES.reduce((s, c) => s + lessonCount(c), 0);
const TEST_SINFLAR = COURSES.map((c) => sinfOf(c.grade)).filter(blokBormi);

/** Telegram kanal — sahifa pastida. Kanal nomi o'zgarmaydi. */
const KANAL = "https://t.me/AqlZoneUz";

type Kim = "oquvchi" | "abiturient" | "talaba" | "ota_ona" | "ustoz";
const KIMLAR: Kim[] = ["oquvchi", "abiturient", "talaba", "ota_ona", "ustoz"];

/** Jonli savollar — javoblar tartibi ataylab har xil. */
const SAVOLLAR = [
  { savol: "lendS1", ifoda: "3/4 + 1/8", javoblar: ["5/8", "7/8", "4/12", "1"], togri: 1, izoh: "lendS1Izoh" },
  { savol: "lendS2", ifoda: "", javoblar: ["8", "15", "12", "20"], togri: 2, izoh: "lendS2Izoh" },
  { savol: "lendS3", ifoda: "", javoblar: ["6", "11", "7", "12"], togri: 0, izoh: "lendS3Izoh" },
] as const;

const BOLIMLAR = [
  { ic: "map", nom: "tabDarslar", izoh: "boshDarslarBatafsil" },
  { ic: "chart", nom: "testlar", izoh: "boshTestlarBatafsil" },
  { ic: "vazifa", nom: "lendSertifikat", izoh: "lendSertifikatIzoh" },
  { ic: "pencil", nom: "masalalar", izoh: "boshMasalalarBatafsil" },
  { ic: "puzzle", nom: "oyinlar", izoh: "boshOyinlarBatafsil" },
  { ic: "palette", nom: "kichkintoy", izoh: "lendKichkintoyIzoh" },
] as const;

const FAQ = [["lendF1", "lendF1J"], ["lendF2", "lendF2J"], ["lendF3", "lendF3J"], ["lendF4", "lendF4J"]] as const;

function bor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Lending({ onBoshlash }: { onBoshlash: () => void }) {
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
        <Bolimlar />
        <Kimlar />
        <Qanday />
        <Savollar />
        <Oxir onBoshlash={onBoshlash} />
      </main>

      <Etak />
    </div>
  );
}

/* ------------------------------------------------------------ tepa */

function Tepa({ onBoshlash, bot }: { onBoshlash: () => void; bot: string }) {
  const nav: [string, string][] = [
    ["imkoniyat", t("lendImkoniyat")], ["kimlar", t("lendKimlar")],
    ["qanday", t("boshQanday")], ["savollar", t("lendSavollar")],
  ];
  return (
    <header className="sticky top-0 z-30 bg-karta/90 shadow-[inset_0_-1px_0_var(--color-track)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-2 px-4 sm:gap-3">
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex shrink-0 items-center gap-2" aria-label="Aql Zone">
          <Logo size={34} jonli={false} />
          <span className="hidden font-display text-[19px] min-[400px]:inline">Aql Zone</span>
        </button>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {nav.map(([id, nom]) => (
            <button key={id} type="button" onClick={() => bor(id)}
              className="rounded-xl px-3 py-2 text-[14.5px] text-ink-soft hover:bg-track hover:text-ink">
              {nom}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <TilTugma />
          <YoruglikTugma />
          {bot && (
            <a href={botHavolasi(bot)} data-tahlil="Tanishuv: kirish (tepa)"
              className="hidden h-10 items-center rounded-xl px-3 text-[14.5px] text-ink-soft hover:bg-track hover:text-ink sm:flex">
              {t("lendKirish")}
            </a>
          )}
          <button type="button" onClick={onBoshlash} data-tahlil="Tanishuv: boshlash (tepa)"
            className="tugma-3d hidden h-10 items-center rounded-xl bg-brand-blue px-4 font-display
                       text-[15px] text-white shadow-clay-sm min-[480px]:flex">
            {t("boshlash")}
          </button>
        </div>
      </div>
    </header>
  );
}

/** UZ / RU. Sahifa qayta yuklanmaydi — joyida yangi tilda chiziladi. */
function TilTugma() {
  const joriy = til();
  return (
    <div className="flex h-10 items-center rounded-xl bg-track p-1" role="group" aria-label="Til / Язык">
      {TILLAR.map((x) => (
        <button key={x.kod} type="button" onClick={() => void tilniAlmashtir(x.kod)}
          aria-pressed={x.kod === joriy} data-tahlil={`Tanishuv: til ${x.kod}`}
          className={`h-8 rounded-lg px-2.5 font-display text-[13px] ${
            x.kod === joriy ? "bg-karta text-ink shadow-clay-sm" : "text-ink-dim hover:text-ink"}`}>
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
      className="grid size-10 place-items-center rounded-xl text-ink-soft hover:bg-track hover:text-ink">
      <Icon name={qora ? "quyosh" : "oy"} size={20} />
    </button>
  );
}

/* ------------------------------------------------------------ qahramon */

function Qahramon({ onBoshlash, bot }: { onBoshlash: () => void; bot: string }) {
  return (
    <section className="mx-auto grid max-w-[1120px] items-center gap-10 px-4 pt-10 pb-14
                        sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-14 lg:pt-20 lg:pb-20">
      <div className="az-kirish min-w-0">
        <p className="inline-flex items-center gap-2 rounded-full bg-track px-3 py-1.5 text-[13px] text-ink-soft">
          <span className="size-2 rounded-full bg-brand-green" aria-hidden />
          {t("lendBelgi")}
        </p>

        <h1 className="mt-5 font-display text-[40px] leading-[1.05] tracking-tight
                       min-[400px]:text-[46px] sm:text-[60px] lg:text-[68px]">
          {t("lendSarlavha1")}{" "}
          <span className="my-1 inline-block -rotate-1 rounded-2xl bg-brand-blue px-3 pb-1 text-white sm:px-4">
            {t("lendSarlavha2")}
          </span>{" "}
          {t("lendSarlavha3")}
        </h1>

        <p className="mt-5 max-w-[36rem] text-[16px] leading-relaxed text-ink-soft sm:text-[18px]">
          {t("lendIzoh")}
        </p>

        <div className="mt-7 flex flex-col gap-3 min-[480px]:flex-row">
          <button type="button" onClick={onBoshlash} data-tahlil="Tanishuv: boshlash"
            className="tugma-3d flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand-blue px-7
                       font-display text-[17px] text-white shadow-clay-sm">
            {t("lendBoshlash")}
            <Icon name="chevron" size={18} />
          </button>
          {bot && (
            <a href={botHavolasi(bot)} data-tahlil="Tanishuv: telegram"
              className="clay-press flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-karta px-6
                         font-display text-[16px] text-ink shadow-clay-sm">
              <Icon name="send" size={18} />
              {t("telegramBilanKirish")}
            </a>
          )}
        </div>
        <p className="mt-3 text-[13px] text-ink-dim">{t("lendTagIzoh")}</p>
      </div>

      <Sinov />
    </section>
  );
}

/** Kasrni ustma-ust yozadi: "7/8" → 7 ustida 8. Qolgani o'zgarmaydi. */
function Ifoda({ matn, katta }: { matn: string; katta?: boolean }) {
  const qism = matn.split(/(\d+\/\d+)/);
  return (
    <span className="inline-flex items-center gap-1.5">
      {qism.filter(Boolean).map((q, i) => {
        const m = q.match(/^(\d+)\/(\d+)$/);
        if (!m) return <span key={i}>{q}</span>;
        return (
          <span key={i} className={`inline-flex flex-col items-center leading-none ${katta ? "text-[0.8em]" : "text-[0.85em]"}`}>
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
    <div className="az-kirish w-full min-w-0 rounded-clay bg-karta p-5 shadow-clay sm:p-7"
      style={{ "--az-kech": "120ms" } as CSSProperties}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-[15px] text-brand-blue-t">{t("lendSinab")}</span>
        <span className="text-[13px] text-ink-dim">{n + 1} / {SAVOLLAR.length}</span>
      </div>

      <div className="mt-4 rounded-2xl bg-sahna px-4 py-6 text-center shadow-ichki">
        <p className="text-[15px] text-ink-soft">{t(s.savol)}</p>
        {s.ifoda && (
          <p className="mt-3 font-display text-[34px] leading-none">
            <Ifoda matn={`${s.ifoda} = ?`} katta />
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {s.javoblar.map((j, i) => {
          const bu = tanlov === i;
          const rang = !javob ? "bg-karta text-ink shadow-clay-sm hover:-translate-y-0.5"
            : i === s.togri ? "bg-brand-green text-white"
            : bu ? "bg-brand-red text-white"
            : "bg-track text-ink-dim";
          return (
            <button key={`${n}-${i}`} type="button" disabled={javob}
              onClick={() => setTanlov(i)} data-tahlil="Tanishuv: sinov javob"
              className={`clay-press flex h-16 items-center justify-center rounded-2xl font-display text-[22px]
                          transition ${rang}`}>
              <Ifoda matn={j} />
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-[76px]" aria-live="polite">
        {javob ? (
          <div className="az-kirish flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className={`font-display text-[16px] ${togri ? "text-brand-green" : "text-brand-red"}`}>
                {togri ? t("lendTogri") : t("lendNotogri")}
              </p>
              <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">{t(s.izoh)}</p>
            </div>
            <button type="button" data-tahlil="Tanishuv: yana savol"
              onClick={() => { setN((n + 1) % SAVOLLAR.length); setTanlov(null); }}
              className="clay-press h-11 shrink-0 rounded-xl bg-track px-4 font-display text-[14.5px] text-ink">
              {t("lendYanaSavol")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ sonlar */

function Sonlar() {
  const sonlar: [string, string][] = [
    [`${JAMI_DARS}+`, t("lendSonDars")],
    [`${Math.min(...TEST_SINFLAR)}–${Math.max(...TEST_SINFLAR)}`, t("lendSonSinf")],
    [String(OYINLAR.length), t("lendSonOyin")],
    [t("lendSonTil"), t("lendSonTilIzoh")],
  ];
  return (
    <section className="mx-auto max-w-[1120px] px-4">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {sonlar.map(([son, nom]) => (
          <li key={nom} className="rounded-clay bg-karta px-5 py-5 shadow-clay-sm">
            <p className="font-display text-[30px] leading-none sm:text-[36px]">{son}</p>
            <p className="mt-2 text-[13.5px] text-ink-dim">{nom}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------ bo'limlar */

function Sarlavha({ id, nom, izoh }: { id: string; nom: string; izoh?: string }) {
  return (
    <div id={id} className="scroll-mt-20 max-w-[40rem]">
      <h2 className="font-display text-[30px] leading-tight sm:text-[40px]">{nom}</h2>
      {izoh && <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">{izoh}</p>}
    </div>
  );
}

function Bolim({ children }: { children: ReactNode }) {
  return <section className="mx-auto max-w-[1120px] px-4 pt-20 sm:pt-28">{children}</section>;
}

function Bolimlar() {
  return (
    <Bolim>
      <Sarlavha id="imkoniyat" nom={t("lendImkSarlavha")} izoh={t("lendImkIzoh")} />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BOLIMLAR.map((b) => (
          <li key={b.ic} className="rounded-clay bg-karta p-6 shadow-clay-sm">
            <span className="grid size-14 place-items-center rounded-2xl bg-sahna shadow-ichki">
              <img src={`/belgi/${b.ic}.webp`} width={36} height={36} alt="" aria-hidden decoding="async" />
            </span>
            <h3 className="mt-4 font-display text-[20px] leading-tight">{t(b.nom)}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{t(b.izoh)}</p>
          </li>
        ))}
      </ul>
    </Bolim>
  );
}

/* ------------------------------------------------------------ kimlar */

function Kimlar() {
  const [kim, setKim] = useState<Kim>("oquvchi");
  return (
    <Bolim>
      <Sarlavha id="kimlar" nom={t("lendKimSarlavha")} izoh={t("lendKimIzoh")} />
      <div className="mt-8 rounded-clay bg-karta p-3 shadow-clay sm:p-4">
        {/* Tor ekranda yorliqlar o'ralib ikkinchi qatorga o'tadi — yonga
            suriladigan qator sahifani gorizontal siljitib yuborardi. */}
        <div className="flex flex-wrap gap-2" role="tablist">
          {KIMLAR.map((k) => (
            <button key={k} type="button" role="tab" aria-selected={k === kim}
              onClick={() => setKim(k)} data-tahlil={`Tanishuv: kim ${k}`}
              className={`h-11 rounded-xl px-4 font-display text-[15px] transition ${
                k === kim ? "bg-brand-blue text-white" : "bg-track text-ink-soft hover:text-ink"}`}>
              {t(`lendKim_${k}`)}
            </button>
          ))}
        </div>
        <ul key={kim} className="mt-3 grid gap-2.5 sm:grid-cols-3" role="tabpanel">
          {([1, 2, 3] as const).map((i) => (
            <li key={i} className="az-kirish flex items-start gap-3 rounded-2xl bg-sahna p-4 shadow-ichki"
              style={{ "--az-kech": `${i * 60}ms` } as CSSProperties}>
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-green text-white">
                <Icon name="check" size={14} />
              </span>
              <span className="text-[15px] leading-snug">{t(`lendKim_${kim}${i}`)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Bolim>
  );
}

/* ------------------------------------------------------------ qanday */

function Qanday() {
  const qadamlar = [["lendQ1", "lendQ1Izoh"], ["lendQ2", "lendQ2Izoh"], ["lendQ3", "lendQ3Izoh"]] as const;
  return (
    <Bolim>
      <Sarlavha id="qanday" nom={t("boshQanday")} />
      <ol className="mt-8 grid gap-4 md:grid-cols-3">
        {qadamlar.map(([nom, izoh], i) => (
          <li key={nom} className="rounded-clay bg-karta p-6 shadow-clay-sm">
            <span className="grid size-11 place-items-center rounded-full bg-track font-display text-[18px]">
              {i + 1}
            </span>
            <h3 className="mt-4 font-display text-[19px]">{t(nom)}</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{t(izoh)}</p>
          </li>
        ))}
      </ol>
    </Bolim>
  );
}

/* ------------------------------------------------------------ savollar */

function Savollar() {
  return (
    <Bolim>
      <Sarlavha id="savollar" nom={t("lendSavollar")} />
      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {FAQ.map(([s, j]) => (
          <details key={s} className="group rounded-clay bg-karta shadow-clay-sm">
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 py-4
                                font-display text-[16.5px] [&::-webkit-details-marker]:hidden">
              <span className="flex-1">{t(s)}</span>
              <span className="shrink-0 rotate-90 text-ink-dim transition group-open:-rotate-90">
                <Icon name="chevron" size={18} />
              </span>
            </summary>
            <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-ink-soft">{t(j)}</p>
          </details>
        ))}
      </div>
    </Bolim>
  );
}

/* ------------------------------------------------------------ oxir */

function Oxir({ onBoshlash }: { onBoshlash: () => void }) {
  return (
    <section className="mx-auto max-w-[1120px] px-4 pt-20 pb-16 sm:pt-28">
      <div className="rounded-clay bg-brand-blue px-6 py-12 text-center text-white shadow-clay sm:py-16">
        <h2 className="font-display text-[28px] leading-tight sm:text-[40px]">{t("lendOxirSarlavha")}</h2>
        <p className="mt-3 text-[16px] opacity-90">{t("lendOxirIzoh")}</p>
        <button type="button" onClick={onBoshlash} data-tahlil="Tanishuv: boshlash (oxir)"
          className="tugma-3d mx-auto mt-7 flex h-14 items-center justify-center gap-2 rounded-2xl bg-white px-8
                     font-display text-[17px] text-brand-blue-d shadow-clay-sm">
          {t("lendBoshlash")}
          <Icon name="chevron" size={18} />
        </button>
      </div>
    </section>
  );
}

function Etak() {
  return (
    <footer className="shadow-[inset_0_1px_0_var(--color-track)]">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-3 px-4 py-8 text-[13.5px]
                      text-ink-dim sm:flex-row sm:justify-between">
        <span className="flex items-center gap-2">
          <Logo size={24} jonli={false} />
          © {new Date().getFullYear()} Aql Zone
        </span>
        <a href={KANAL} target="_blank" rel="noopener" data-tahlil="Tanishuv: kanal"
          className="flex h-11 items-center gap-2 hover:text-ink">
          <Icon name="send" size={16} />
          {t("lendKanal")} · @AqlZoneUz
        </a>
      </div>
    </footer>
  );
}
