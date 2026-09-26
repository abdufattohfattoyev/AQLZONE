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
 *
 *   1. Sarlavha      kun, sana va salom; o'ngda qidiruv
 *   2. Kunlik halqa  uchta vazifa: bitta dars, bugungi sinov, kunlik son
 *   3. Zanjir        necha kun ketma-ket, rekord va haftaning 7 kuni
 *   4. Keyingi dars  ekrandagi YAGONA asosiy tugma (ko'k karta)
 *   5. Aql maslahati bitta qisqa maslahat, kun bo'yicha almashadi
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
import type { ReactNode } from "react";
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
import { kunKaliti } from "../lib/zanjir";
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

  const { kunlik } = useProgress();
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
      nom: t("bugunBittaDars"), bajarildi: darsBugunmi(bugun), tahlil: "Bugun: bitta dars",
      on: davom ? () => onDavom(davom.c, davom.ui, davom.li) : onDarslar,
    },
    {
      nom: t("bugunSinov"), bajarildi: sinovBajarilgan(kurs.slug), tahlil: "Bugun: sinov",
      izoh: sinovMumkin ? t("bugunDaqiqa", { n: Math.ceil(SINOV_SAVOL / 2) }) : undefined,
      on: sinovMumkin ? () => onSinov(kurs) : undefined,
    },
    {
      nom: t("bugunKunlikSon", { n: jumboqRaqami(bugun) }),
      bajarildi: sonServer ?? kunlikSonBugun(), tahlil: "Bugun: kunlik son",
      izoh: t("bugunSoat", { n: qolganSoat() }), on: onKunlikSon,
    },
  ];
  // Joriy vazifa — birinchi bajarilmagani (ko'k halqa bilan).
  const joriy = vazifalar.findIndex((v) => !v.bajarildi);

  // ---- zanjir ----
  const zanjir = joriyZanjir(kunlik, bugun);
  const rekord = rekordniYangila(zanjir);
  const qisqa = t("bugunQisqaKunlar").split(",");

  const amal = asosiyAmal({ davom, prof, onDarslar, onMasalalar, onDavom, onKurs, onImtihon, onTestlar });
  const kattalar = yolOf(prof) !== "maktab";

  const bloklar = {
    halqa: <Halqa vazifalar={vazifalar} joriy={joriy} />,
    zanjir: (
      <section aria-label={t("menZanjir")}
        className="flex flex-col gap-2.5 rounded-[22px] bg-karta px-4 py-3.5 shadow-clay-sm">
        <div className="flex items-center gap-2">
          <Olov />
          <span className="min-w-0 flex-1 truncate font-display text-[17px] font-bold">
            {zanjir > 0 ? t("bugunZanjir", { n: zanjir }) : t("bugunZanjirYoq")}
          </span>
          {rekord > 0 && (
            <span className="shrink-0 text-[13px] font-semibold text-ink-dim">
              {t("bugunRekord", { n: rekord })}
            </span>
          )}
        </div>
        <div className="grid grid-cols-7 gap-1 min-[360px]:gap-1.5">
          {hafta(kunlik, bugun).map((k) => (
            <div key={k.sana} className="flex flex-col items-center gap-[5px]">
              <span aria-hidden
                className={`grid size-[30px] place-items-center rounded-full font-display text-[13px]
                            font-bold min-[360px]:size-[34px] ${
                  k.holat === "oynagan" ? "bg-brand-gold text-ink" : "bg-track"} ${
                  k.bugun ? "ring-[2.5px] ring-brand-blue ring-offset-[2.5px] ring-offset-karta" : ""}`}>
                {k.holat === "oynagan" && "✓"}
              </span>
              <span className={`text-[12px] ${k.bugun ? "font-bold text-brand-blue-t" : "font-semibold text-ink-dim"}`}>
                {qisqa[k.indeks]}
              </span>
            </div>
          ))}
        </div>
      </section>
    ),
    keyingi: <AsosiyKarta amal={amal} />,
    kattalar: kattalar && (
      <div className="grid grid-cols-2 gap-2.5">
        <KattaEshik ik="sqrt" nom={t("kattalarFormula")} izoh={t("kattalarFormulaIzoh")} on={onFormulalar} />
        <KattaEshik ik="clock" nom={t("kattalarDtm")} izoh={t("kattalarDtmIzoh")} on={onImtihon} />
      </div>
    ),
    maslahat: (
      <aside className="flex items-start gap-3 rounded-[22px] bg-karta px-4 py-3.5 ring-[1.5px] ring-track ring-inset">
        <Logo size={40} jonli={false} className="mt-0.5 shrink-0" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[13px] font-bold text-ink-dim">{t("bugunMaslahat")}</span>
          <span className="text-[15px] leading-[1.4]">
            {t(`maslahat${yilKuni(bugun) % MASLAHAT_SONI}` as Kalit)}
          </span>
        </div>
      </aside>
    ),
  };

  const sarlavha = (
    <header className="flex items-end gap-2.5">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[13px] font-bold tracking-[0.08em] text-ink-dim uppercase">{sana}</span>
        <h1 className="font-display text-[23px] leading-[1.1] tracking-[-0.01em] min-[360px]:text-[27px]">
          {salom}
        </h1>
      </div>
      <button type="button" onClick={onQidiruv} aria-label={t("qidiruvNom")} data-tahlil="Bugun: qidiruv"
        className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta text-ink shadow-clay-sm">
        <Icon name="search" size={20} />
      </button>
    </header>
  );

  // Kompyuterda ikki ustun: chapda bugungi reja, o'ngda "keyin nima".
  if (kompyuter) {
    return (
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-4 px-8 pt-8 pb-14">
        {sarlavha}
        <div className="grid grid-cols-2 items-start gap-4">
          <div className="flex flex-col gap-3.5">{bloklar.halqa}{bloklar.zanjir}</div>
          <div className="flex flex-col gap-3.5">{bloklar.keyingi}{bloklar.kattalar}{bloklar.maslahat}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-[22px] pb-3.5
                    min-[360px]:px-[18px] sm:max-w-[560px]">
      {sarlavha}
      {bloklar.halqa}
      {bloklar.zanjir}
      {bloklar.keyingi}
      {bloklar.kattalar}
      {bloklar.maslahat}
    </div>
  );
}

/* --------------------------------------------------------------- bo'laklar */

interface Vazifa {
  nom: string;
  bajarildi: boolean;
  /** O'ngdagi kichik yozuv: "3 daq", "8 soat". */
  izoh?: string;
  tahlil: string;
  /** Berilmasa — hozir bosib bo'lmaydi (masalan sinov darsdan oldin). */
  on?: () => void;
}

/**
 * Kunlik halqa — uch bo'lakli doira va yonida uch vazifa.
 *
 * Bo'laklar bajarilganlar SONIGA qarab to'ladi (qaysi vazifa ekaniga
 * emas): halqa "qancha qoldi" degan savolga javob beradi.
 */
function Halqa({ vazifalar, joriy }: { vazifalar: Vazifa[]; joriy: number }) {
  const soni = vazifalar.filter((v) => v.bajarildi).length;
  // r=46 aylana uzunligi ≈ 289; har bo'lak 88, oralig'i ≈ 8 (`manba`).
  const bolak = (i: number) => ({ strokeDasharray: "88 201", strokeDashoffset: -4 - i * 96.3 });
  return (
    <section aria-label={t("bugunReja")}
      className="flex items-center gap-3.5 rounded-[26px] bg-karta p-4 shadow-clay-sm min-[400px]:gap-[18px]
                 min-[400px]:p-[18px]">
      <div className="relative size-24 shrink-0 min-[360px]:size-[100px] min-[400px]:size-28">
        <svg viewBox="0 0 112 112" className="size-full -rotate-90" aria-hidden>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx="56" cy="56" r="46" fill="none" strokeWidth="11" strokeLinecap="round"
              style={bolak(i)}
              className={i < soni ? "stroke-brand-green" : "stroke-track"} />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[26px] leading-none font-bold min-[360px]:text-[30px]">
            {soni}<span className="text-[18px] text-ink-dim min-[360px]:text-[20px]">/3</span>
          </span>
          <span className="text-[12.5px] font-semibold text-ink-dim">{t("bugunBajarildi")}</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {vazifalar.map((v, i) => (
          <button key={v.tahlil} type="button" onClick={v.on} disabled={!v.on} data-tahlil={v.tahlil}
            className="clay-press flex min-h-9 items-center gap-2 text-left disabled:cursor-default
                       min-[400px]:gap-2.5">
            {v.bajarildi ? (
              <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-brand-green text-white">
                <Icon name="check" size={13} />
              </span>
            ) : (
              <span className={`size-[22px] shrink-0 rounded-full border-[2.5px] ${
                i === joriy ? "border-brand-blue" : "border-track"}`} />
            )}
            <span className={`min-w-0 flex-1 truncate text-[14.5px] min-[400px]:text-[15px] ${
              v.bajarildi ? "font-semibold text-ink-dim" : "font-bold"}`}>{v.nom}</span>
            {!v.bajarildi && v.izoh && (
              <span className="hidden shrink-0 text-[13px] text-ink-dim min-[360px]:block">{v.izoh}</span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}

/** Zanjir yonidagi olov — oltin (mukofot rangi), emoji emas: har qurilmada bir xil. */
function Olov() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden
      className="shrink-0 fill-brand-gold stroke-brand-gold-d" strokeWidth="1.6" strokeLinejoin="round">
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

/** Ko'k karta: yorliq, nom, bobning kichik yo'li va oq tugma. */
function AsosiyKarta({ amal }: { amal: Amal }) {
  return (
    <button type="button" onClick={amal.on} data-tahlil={amal.tahlil}
      className="tugma-3d flex w-full flex-col gap-3.5 rounded-[26px] bg-brand-blue p-[18px] text-left text-white
                 shadow-[0_5px_0_var(--color-brand-blue-d)]">
      <span className="flex w-full items-baseline justify-between gap-2.5 text-[13px] font-bold opacity-85">
        <span className="truncate tracking-[0.08em] uppercase">{amal.yorliq}</span>
        {amal.joy && <span className="shrink-0">{amal.joy}</span>}
      </span>
      <span className="font-display text-[21px] leading-[1.15] font-bold min-[360px]:text-[23px]">{amal.nom}</span>
      {amal.izoh && <span className="-mt-2 text-[14px] leading-snug text-white/90">{amal.izoh}</span>}
      {amal.yol && <BobYoli yol={amal.yol} />}
      <span className="grid min-h-[52px] w-full place-items-center rounded-2xl bg-white font-display text-[19px]
                       font-bold text-brand-blue-d">
        {amal.tugma}
      </span>
    </button>
  );
}

/** Bobning darslari nuqta bo'lib: o'tilgan — oq, joriy — halqa, qolgan — xira. */
function BobYoli({ yol }: { yol: NonNullable<Amal["yol"]> }) {
  const parts: ReactNode[] = [];
  yol.forEach((h, i) => {
    if (i > 0) {
      // Chiziq joriy darsgacha to'liq oq, keyin xira.
      const oldin = yol.slice(0, i + 1).includes("joriy") && h !== "joriy" ? "bg-white/35" : "bg-white";
      parts.push(<span key={`c${i}`} className={`h-[3px] min-w-1 flex-1 ${oldin}`} />);
    }
    parts.push(h === "joriy"
      ? <span key={i} className="size-[22px] shrink-0 rounded-full border-4 border-white bg-brand-blue" />
      : <span key={i} className={`size-3.5 shrink-0 rounded-full ${h === "otilgan" ? "bg-white" : "bg-white/35"}`} />);
  });
  return <span aria-hidden className="flex w-full items-center">{parts}</span>;
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
