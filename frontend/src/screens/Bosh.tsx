/**
 * BUGUN — ilova ochilganda birinchi ko'rinadigan joy (`manba/Bugun.dc.html`).
 *
 * ─────────────── NEGA QAYTA QURILDI ───────────────
 *
 * Ilgari bosh sahifa bo'limlar ESHIKLARI edi: kichkintoylar, darslar,
 * testlar, masalalar, o'yinlar — beshta teng karta, ustida reyting,
 * hisob va profil chiplari. Pastki panel besh bo'limga o'tgach
 * (`components/Panel.tsx`) eshiklar panelning takroriga aylandi.
 *
 * Endi bu ekran bitta savolga javob beradi: "BUGUN nima qilay?"
 * Tartib o'sha savolga bo'ysunadi (Bugun kanvasi, 2026-09):
 *
 *   1. Sarlavha      sana va salom; o'ngda zanjir (olov + son) va qidiruv
 *   2. Asosiy amal   BIRINCHI turadi: qaysi dars, bobdagi yo'l va
 *                    ekrandagi YAGONA katta tugma
 *   3. Bugungi reja  uch band, har birining NIMA ekani yozilgan
 *                    ("5 ta savol · 3 daqiqa", "yashirin sonni toping")
 *   4. Bu hafta      7 kun va zanjir ODDIY GAP bilan: "Bugun bitta dars
 *                    qilsangiz — 4 kun bo'ladi"
 *   5. Aql maslahati eng pastda, jim ramkada
 *
 * Ilgari asosiy tugma uchinchi o'rinda, "0/3" halqasi va "5 soat"
 * yozuvi izohsiz turardi — yangi odam nima qilishni tushunmasdi.
 * Keng ekranda (md+) ikki ustun: chapda amal va reja, o'ngda hafta.
 *
 * Kichkintoylar, reyting, hisob va profil chiplari o'z joylariga ko'chdi
 * (Men bo'limi, O'qish tabi, kichkintoy rejimi).
 *
 * ─────────────── KATTALAR YO'LI SAQLANDI ───────────────
 *
 * "Davom etish" bo'lmaganda asosiy karta profilga qarab boshqa narsani
 * taklif qiladi (sinf darslari, DTM, testlar, oliy matematika) —
 * `asosiyAmal` ga qarang. Talaba va kattalarga formulalar va DTM
 * kartalari ham qoladi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { Logo } from "../components/Logo";
import { getHisob, joriyProfil, kunlikHolat, profilSoni } from "../lib/api";
import type { Hisob } from "../lib/api";
import { COURSES, courseBySlug } from "../lib/curriculum";
import type { Course } from "../lib/curriculum";
import { oxirgiKurs } from "../lib/oxirgi";
import { useKompyuter } from "../lib/maket";
import { tgIsm } from "../lib/qobiq";
import {
  joriyKurs, pedagogmi, profilKursi, sinfOfProfil, useProfil, yolOf,
} from "../lib/profil";
import type { Profil } from "../lib/profil";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { keyingiDars, lessonId } from "../lib/types";
import type { Progress } from "../lib/types";
import { useProgress } from "../lib/progress";
import { SINOV_SAVOL, qolganSoat, sinovBajarilgan } from "../lib/kunlikSinov";
import { bugungiSoni } from "../lib/takrorlash";
import { jumboqRaqami } from "../lib/oyin/kunlikSon";
import { kunKaliti, qaytish } from "../lib/zanjir";
import { Qaytish, ZanjirTiklash } from "../components/Qaytish";
import {
  darsBugunmi, hafta, joriyZanjir, rekordniYangila, salomVaqti, yilKuni,
} from "../lib/bugun";
import { kunlikSonBugun } from "./KunlikSon";

interface Props {
  progressOf: (c: Course) => Progress;
  onDarslar: () => void;
  onMasalalar: () => void;
  onTestlar: () => void;
  /** Boshlangan darsga qaytish. */
  onDavom: (c: Course, ui: number, li: number) => void;
  onSinov: (c: Course) => void;
  onKunlikSon: () => void;
  onQidiruv: () => void;
  /** Kattalar yo'lidagi ikkita qo'shimcha yo'l. */
  onFormulalar: () => void;
  onImtihon: () => void;
  /** Profildagi sinfning o'z kursi. */
  onKurs: (c: Course) => void;
}

/** Maslahatlar soni — `matn.ts` dagi `maslahat0…` kalitlari. */
const MASLAHAT_SONI = 10;

/**
 * Qayerdan davom etish kerak.
 *
 * Oxirgi ochilgan kurs olinadi; u yo'q bo'lsa — YULDUZI bor
 * kurslardan birinchisi. Ikkinchi shart kerak: qurilma almashgan
 * odamda "oxirgi kurs" mahalliy xotirada yo'q, progressi esa
 * serverdan qaytib kelgan bo'ladi.
 *
 * Hech narsa boshlanmagan bo'lsa `null` — yangi odamga "davom
 * eting" deyish ma'nosiz.
 */
function davomJoyi(progressOf: (c: Course) => Progress) {
  const c =
    courseBySlug(oxirgiKurs()) ??
    COURSES.find((x) => progressOf(x).stars > 0);
  if (!c) return null;
  const p = progressOf(c);
  if (!p.stars) return null;
  const keyingi = keyingiDars(c.units, p);
  return keyingi ? { c, p, ...keyingi } : null;
}

/** Joriy bolaning profili — server bilan bir xil qoidaga bo'ysunadi. */
function joriyBola(h: Hisob | null) {
  const ro = h?.profillar ?? [];
  const id = joriyProfil();
  return ro.find((p) => String(p.id) === id) ?? ro[0] ?? null;
}

export function Bosh({
  progressOf, onDarslar, onMasalalar, onTestlar, onDavom, onSinov, onKunlikSon,
  onQidiruv, onFormulalar, onImtihon, onKurs,
}: Props) {
  const [hisob, setHisob] = useState<Hisob | null>(null);
  // Kunlik son SERVERDA ham yuritiladi (boshqa qurilmada yechilgan
  // bo'lishi mumkin). Aloqa bo'lmasa — qurilmadagi belgi.
  const [sonServer, setSonServer] = useState<boolean | null>(null);

  useEffect(() => {
    let bekor = false;
    getHisob().then((h) => { if (!bekor) setHisob(h); });
    kunlikHolat().then((h) => { if (!bekor && h) setSonServer(h.bajarildi); }).catch(() => {});
    return () => { bekor = true; };
  }, []);

  const { kunlik, jamiTanga, tiklash, zanjirniTikla } = useProgress();
  const prof = useProfil();
  const kompyuter = useKompyuter();
  const bugun = kunKaliti();
  const davom = davomJoyi(progressOf);
  const kurs = davom?.c ?? joriyKurs(prof, oxirgiKurs());

  // ---- sarlavha ----
  const hozir = new Date();
  const kunlar = t("bugunHaftaKunlari").split(",");
  const oylar = t("bugunOylar").split(",");
  const sana = t("bugunSana", { kun: kunlar[hozir.getDay()] ?? "", n: hozir.getDate(), oy: oylar[hozir.getMonth()] ?? "" });
  // Ko'p bolali hisobda — tanlangan bolaning ismi; aks holda hisob egasiniki
  // (bitta bolada profil nomi ko'pincha standart "Men" bo'ladi).
  const bola = profilSoni() > 1 ? joriyBola(hisob)?.ism : "";
  const ism = (bola || hisob?.ism || tgIsm()).split(" ")[0] ?? "";
  const salom = t(`bugun_${salomVaqti(hozir.getHours())}` as Kalit) + (ism ? `, ${ism}` : "");

  // ---- uch vazifa ----
  // Sinov faqat o'tilgan dars yoki xatolar daftari bo'lganda yig'iladi
  // (`lib/kunlikSinov.ts` → sinovDarsi). Yangi odamda qator bosilmaydi.
  const sinovMumkin = progressOf(kurs).stars > 0 || bugungiSoni(kurs.slug) > 0;
  const vazifalar: Vazifa[] = [
    {
      nom: t("bugunBittaDars"), ik: "map", amal: t("bugunAmalBoshlash"),
      izoh: t("bugunDarsIzoh"), bajarildi: darsBugunmi(bugun), tahlil: "Bugun: bitta dars",
      on: davom ? () => onDavom(davom.c, davom.ui, davom.li) : onDarslar,
    },
    {
      nom: t("bugunSinov"), ik: "clock", amal: t("bugunAmalYechish"),
      bajarildi: sinovBajarilgan(kurs.slug), tahlil: "Bugun: sinov",
      izoh: sinovMumkin
        ? t("bugunSinovIzoh", { n: SINOV_SAVOL, d: Math.ceil(SINOV_SAVOL / 2) })
        : t("bugunSinovYopiq"),
      on: sinovMumkin ? () => onSinov(kurs) : undefined,
    },
    {
      nom: t("bugunKunlikSon", { n: jumboqRaqami(bugun) }), ik: "puzzle", amal: t("bugunAmalOynash"),
      bajarildi: sonServer ?? kunlikSonBugun(), tahlil: "Bugun: kunlik son",
      izoh: t("bugunSonIzoh", { soat: t("bugunSoat", { n: qolganSoat() }) }), on: onKunlikSon,
    },
  ];

  // ---- zanjir ----
  const zanjir = joriyZanjir(kunlik, bugun);
  const rekord = rekordniYangila(zanjir);
  const qisqa = t("bugunQisqaKunlar").split(",");

  const amal = asosiyAmal({ davom, prof, onDarslar, onMasalalar, onDavom, onKurs, onImtihon, onTestlar });
  const kattalar = yolOf(prof) !== "maktab";

  const bugunQilingan = kunlik.sana === bugun && kunlik.kunlar > 0;
  const haftaIzoh = zanjir === 0
    ? t("bugunHaftaBosh")
    : bugunQilingan
      ? t("bugunHaftaBajarildi", { n: zanjir })
      : t("bugunHaftaDavom", { n: zanjir, m: zanjir + 1 });

  const sarlavha = (
    <header className="flex min-h-[52px] items-center gap-2">
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-[13px] font-bold text-ink-dim">{sana}</span>
        {/* Qisqartirilmaydi: "Добрый вечер" 320px da sig'masa ikkinchi qatorga o'tadi. */}
        <h1 className="font-display text-[21px] leading-[1.15] min-[360px]:text-[26px] md:text-[30px]">
          {salom}
        </h1>
      </div>
      <span aria-label={t("bugunZanjir", { n: zanjir })} title={t("bugunZanjir", { n: zanjir })}
        className={`flex min-h-11 shrink-0 items-center gap-1 rounded-[14px] bg-karta pr-3 pl-2.5 font-display
                    text-[17px] font-bold shadow-clay-sm ${zanjir ? "text-brand-gold-d" : "text-ink-dim"}`}>
        <Olov yoniq={zanjir > 0} />
        {zanjir}
      </span>
      <button type="button" onClick={onQidiruv} aria-label={t("qidiruvNom")} data-tahlil="Bugun: qidiruv"
        className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta text-ink shadow-clay-sm">
        <Icon name="search" size={20} />
      </button>
    </header>
  );

  const reja = (
    <section aria-label={t("bugunReja")} className="flex flex-col rounded-[22px] bg-karta shadow-clay-sm">
      <div className="flex flex-col gap-2.5 px-4 pt-4 pb-1.5">
        <div className="flex items-baseline gap-2">
          <h2 className="min-w-0 flex-1 font-display text-[18px]">{t("bugunReja")}</h2>
          <span className="shrink-0 text-[14px] font-bold text-ink-soft">
            {vazifalar.filter((v) => v.bajarildi).length} / {vazifalar.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1" aria-hidden>
          {vazifalar.map((v) => (
            <span key={v.tahlil} className={`h-1.5 rounded-full ${v.bajarildi ? "bg-brand-green" : "bg-track"}`} />
          ))}
        </div>
      </div>
      {vazifalar.map((v) => (
        <button key={v.tahlil} type="button" onClick={v.on} disabled={!v.on} data-tahlil={v.tahlil}
          className="clay-press flex min-h-16 items-center gap-3 border-t border-track px-4 py-2 text-left
                     disabled:cursor-default">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-track text-ink-soft">
            <Icon name={v.ik} size={20} />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-snug">
            <span className={`text-[15.5px] font-bold ${v.bajarildi ? "text-ink-soft" : ""}`}>{v.nom}</span>
            {v.izoh && <span className="text-[13px] text-ink-dim">{v.izoh}</span>}
          </span>
          {v.bajarildi ? (
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-green text-white"
              aria-label={t("bugunBajarildi")}>
              <Icon name="check" size={14} />
            </span>
          ) : v.on && (
            /* Tor ekranda faqat "›" — izoh matni to'liq sig'sin. */
            <span className="flex shrink-0 items-center gap-0.5 text-[13px] font-bold text-brand-blue-t">
              <span className="hidden min-[360px]:inline">{v.amal}</span>
              <Icon name="chevron" size={15} />
            </span>
          )}
        </button>
      ))}
    </section>
  );

  const haftaBlok = (
    <section aria-label={t("menZanjir")}
      className="flex flex-col gap-3 rounded-[22px] bg-karta p-4 shadow-clay-sm">
      <div className="flex items-baseline gap-2">
        <h2 className="min-w-0 flex-1 font-display text-[18px]">{t("bugunBuHafta")}</h2>
        {rekord > 0 && (
          <span className="shrink-0 text-[13px] text-ink-dim">{t("bugunRekordKun", { n: rekord })}</span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {hafta(kunlik, bugun).map((k) => (
          <div key={k.sana} className="flex flex-col items-center gap-1.5">
            <span aria-hidden
              className={`grid size-[30px] place-items-center rounded-full text-white min-[360px]:size-[34px] ${
                k.holat === "oynagan" ? "bg-brand-blue" : "bg-track"} ${
                k.bugun && k.holat !== "oynagan" ? "ring-2 ring-brand-blue ring-inset" : ""}`}>
              {k.holat === "oynagan" && <Icon name="check" size={15} />}
            </span>
            <span className={`text-[12.5px] ${k.bugun ? "font-bold text-brand-blue-t" : "font-semibold text-ink-dim"}`}>
              {qisqa[k.indeks]}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[14px] leading-snug text-ink-soft">{haftaIzoh}</p>
    </section>
  );

  // Uzilgan zanjirni tanga bilan tiklash yoki "qaytdingiz" — faqat
  // kerakli kuni chiqadi.
  const ogoh = tiklash ? (
    <div className="[&>*]:mt-0"><ZanjirTiklash taklif={tiklash} jamiTanga={jamiTanga} onTikla={zanjirniTikla} /></div>
  ) : qaytish(kunlik) > 0 && (
    <div className="[&>*]:mt-0"><Qaytish kun={qaytish(kunlik)} /></div>
  );

  const kattalarBlok = kattalar && (
    <div className="grid grid-cols-2 gap-2.5">
      <KattaEshik ik="sqrt" nom={t("kattalarFormula")} izoh={t("kattalarFormulaIzoh")} on={onFormulalar} />
      <KattaEshik ik="clock" nom={t("kattalarDtm")} izoh={t("kattalarDtmIzoh")} on={onImtihon} />
    </div>
  );

  const maslahat = (
    <aside className="flex items-start gap-3 rounded-[20px] px-4 py-3.5 ring-[1.5px] ring-track ring-inset">
      <Logo size={30} jonli={false} className="mt-0.5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[12.5px] font-bold text-ink-dim">{t("bugunMaslahat")}</span>
        <span className="text-[14.5px] leading-[1.45]">
          {t(`maslahat${yilKuni(bugun) % MASLAHAT_SONI}` as Kalit)}
        </span>
      </div>
    </aside>
  );

  /* Bitta tartib hamma o'lchamda: telefonda ustma-ust, keng ekranda
     (md+, planshet va kompyuter) ikki ustun. O'qish tartibi o'zgarmaydi. */
  return (
    <div className={`mx-auto flex w-full max-w-[430px] flex-col gap-3 px-3.5 pt-3.5 pb-4 min-[360px]:gap-4
                     min-[360px]:px-[18px] min-[360px]:pt-5 sm:max-w-[560px] md:max-w-[1040px] md:gap-5 md:px-8
                     md:pt-7 ${kompyuter ? "pb-14" : ""}`}>
      {sarlavha}
      <div className="grid items-start gap-3 min-[360px]:gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:gap-5">
        <div className="flex min-w-0 flex-col gap-3 min-[360px]:gap-4 md:gap-5">
          <AsosiyKarta amal={amal} />
          {reja}
          {ogoh}
        </div>
        <div className="flex min-w-0 flex-col gap-3 min-[360px]:gap-4 md:gap-5">
          {haftaBlok}
          {kattalarBlok}
          {maslahat}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- bo'laklar */

interface Vazifa {
  nom: string;
  ik: IconName;
  /** O'ngdagi yozuv: "Boshlash", "Yechish", "O'ynash". */
  amal: string;
  bajarildi: boolean;
  /** Band nima ekani: "5 ta savol · 3 daqiqa". */
  izoh?: string;
  tahlil: string;
  /** Berilmasa — hozir bosib bo'lmaydi (masalan sinov darsdan oldin). */
  on?: () => void;
}

/** Zanjir yonidagi olov — oltin (mukofot rangi), emoji emas: har qurilmada bir xil. */
function Olov({ yoniq }: { yoniq: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden strokeWidth="1.8" strokeLinejoin="round"
      className={`shrink-0 ${yoniq ? "fill-brand-gold stroke-brand-gold-d" : "fill-none stroke-ink-dim"}`}>
      <path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-3 2-4.5 2-7 1.5 1 2.5 2.5 3-4z" />
    </svg>
  );
}

interface Amal {
  tahlil: string;
  on: () => void;
  yorliq: string;
  /** O'ng tepadagi "2-bob · 3 / 6". */
  joy?: string;
  nom: string;
  izoh?: string;
  /** Bobning kichik yo'li: har dars — o'tilgan / joriy / qolgan. */
  yol?: ("otilgan" | "joriy" | "qolgan")[];
  tugma: string;
}

/**
 * ASOSIY AMAL — ekrandagi yagona katta tugma.
 *
 *   qaytgan odam   → to'xtagan darsi ("Keyingi dars", "Davom etish")
 *   sinfi ma'lum   → o'sha sinf kursi
 *   abituriyent    → DTM variantlari
 *   o'qituvchi     → testlar (maktab)
 *   oliy yo'l      → oliy matematika kursi yoki masalalar
 *   profil yo'q    → sinf tanlash ("O'rganishni boshlash")
 */
function asosiyAmal({ davom, prof, onDarslar, onMasalalar, onDavom, onKurs, onImtihon, onTestlar }: {
  davom: ReturnType<typeof davomJoyi>;
  prof: Profil | null;
  onDarslar: () => void;
  onMasalalar: () => void;
  onDavom: (c: Course, ui: number, li: number) => void;
  onKurs: (c: Course) => void;
  onImtihon: () => void;
  onTestlar: () => void;
}): Amal {
  if (davom) {
    const U = davom.c.units[davom.ui]!;
    return {
      tahlil: "Bugun: davom etish",
      on: () => onDavom(davom.c, davom.ui, davom.li),
      yorliq: t("bugunKeyingiDars"),
      joy: t("bugunBobJoy", { bob: davom.ui + 1, dars: davom.li + 1, jami: U.lessons.length }),
      nom: kursMatn(U.lessons[davom.li]!.n).split(" · ")[0] ?? "",
      yol: U.lessons.map((_, li) =>
        li === davom.li ? "joriy" : davom.p.done[lessonId(davom.ui, li)] ? "otilgan" : "qolgan"),
      tugma: t("davomEtish"),
    };
  }
  const boshla = (tahlil: string, on: () => void, nom: string, izoh: string): Amal => ({
    tahlil, on, nom, izoh, yorliq: t("bugunBirinchiQadam"), tugma: t("bugunBoshlash"),
  });
  const yol = yolOf(prof);
  const kurs = profilKursi(prof);
  if (pedagogmi(prof)) return boshla("Bugun: pedagog darslari", onDarslar, t("boshPedagog"), t("boshPedagogIzoh"));
  if (kurs) {
    const s = sinfOfProfil(prof);
    if (s === null) return boshla("Bugun: oliy matematika", () => onKurs(kurs), kursMatn(kurs.title), kursMatn(kurs.desc));
    return boshla("Bugun: sinf darslari", () => onKurs(kurs),
      s === 0 ? t("boshMaktabgachaDarslari") : t("boshSinfDarslari", { n: s }), t("boshSinfDarslariIzoh"));
  }
  if (yol === "abiturient") return boshla("Bugun: abiturient DTM", onImtihon, t("boshAbiturient"), t("boshAbiturientIzoh"));
  if (prof?.kim === "ustoz" && yol === "maktab") return boshla("Bugun: ustoz testlar", onTestlar, t("boshUstoz"), t("boshUstozIzoh"));
  if (yol === "oliy") return boshla("Bugun: kattalar masalalar", onMasalalar, t("boshKattalarBoshla"), t("boshKattalarIzoh"));
  return boshla("Bugun: boshlash", onDarslar, t("boshBoshla"), t("boshBoshlaIzoh"));
}

/**
 * ASOSIY KARTA — oq karta, ichida yagona ko'k tugma.
 *
 * Ilgari butun karta ko'k edi va "bugungi reja" dan PASTDA turardi:
 * ekrandagi eng muhim narsa uchinchi bo'lib o'qilardi. Endi u birinchi,
 * qaysi dars ekani va bobdagi yo'l (chiziq + "12 tadan 4 tasi") aniq
 * yozilgan. Butun karta bosiladi — nishon katta bo'lsin.
 */
function AsosiyKarta({ amal }: { amal: Amal }) {
  const otilgan = amal.yol?.filter((h) => h === "otilgan").length ?? 0;
  const jami = amal.yol?.length ?? 0;
  return (
    <button type="button" onClick={amal.on} data-tahlil={amal.tahlil}
      className="clay-press flex w-full flex-col gap-3.5 rounded-[24px] bg-karta p-4 text-left shadow-clay
                 min-[360px]:p-[18px] md:p-[22px]">
      <span className="flex flex-col gap-1">
        <span className="flex items-baseline gap-2 text-[13px] font-bold">
          <span className="min-w-0 flex-1 truncate text-brand-blue-t">{amal.yorliq}</span>
          {amal.joy && <span className="shrink-0 text-ink-dim">{amal.joy}</span>}
        </span>
        <span className="font-display text-[21px] leading-[1.2] font-bold min-[360px]:text-[23px] md:text-[26px]">
          {amal.nom}
        </span>
        {amal.izoh && <span className="text-[15px] leading-snug text-ink-soft">{amal.izoh}</span>}
      </span>
      {jami > 0 && (
        <span className="flex flex-col gap-1.5">
          <span className="block h-2 overflow-hidden rounded-full bg-track" aria-hidden>
            <span className="block h-full rounded-full bg-brand-blue"
              style={{ width: `${Math.round((otilgan / jami) * 100)}%` }} />
          </span>
          <span className="text-[13px] text-ink-dim">{t("bugunBobYoli", { n: otilgan, jami })}</span>
        </span>
      )}
      <span className="grid min-h-14 w-full place-items-center rounded-[18px] bg-brand-blue font-display text-[19px]
                       font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
        {amal.tugma}
      </span>
    </button>
  );
}

/** Kattalar yo'lidagi kichik eshik — formulalar va DTM. */
function KattaEshik({ ik, nom, izoh, on }: { ik: IconName; nom: string; izoh: string; on: () => void }) {
  return (
    <button type="button" onClick={on} data-tahlil={`Bugun: ${nom}`}
      className="clay-press flex flex-col items-start gap-2 rounded-clay bg-karta p-3 text-left shadow-clay-sm">
      <span className="grid size-9 place-items-center rounded-2xl bg-track text-brand-blue">
        <Icon name={ik} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[14px] leading-tight">{nom}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-dim">{izoh}</span>
      </span>
    </button>
  );
}
