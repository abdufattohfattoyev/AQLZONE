/**
 * BOSH SAHIFA — ilovaning xaritasi.
 *
 * ─────────────── NEGA QAYTA QURILDI ───────────────
 *
 * Ilgari bosh sahifa KURSLAR RO'YXATI edi va bo'limlar uch xil
 * ko'rinish darajasida yotardi:
 *
 *   pastki panelda   darslar, o'yinlar, reyting   — bir bosishda
 *   sahifa o'rtasida kichkintoylar                — surib topiladi
 *   yashiringan      masalalar (menyu ichida),
 *                    testlar va formulalar (kurs ichida)
 *
 * Ya'ni ilovada nima borligini faqat uni uzoq kovlagan odam bilardi.
 * Masalalar bo'limi menyuning yopiq yig'masida turardi — ochilishi
 * uchun odam avval MENYUNI, keyin to'g'ri kategoriyani bosishi
 * kerak edi.
 *
 * Endi bosh sahifa ro'yxat emas, ESHIKLAR: beshta bo'lim bir
 * darajada, har birining ostida bir qatorlik javob — "u yerda nima
 * bo'ladi". Kurslar ro'yxati esa o'zining alohida ekraniga ko'chdi
 * (`/darslar`), chunki u "qaysi sinf?" degan boshqa savolga javob
 * beradi.
 *
 * ─────────────── DAVOM ETISH ENG TEPADA ───────────────
 *
 * Qaytib kelgan odam uchun bosh sahifaning ishi bitta: uni
 * to'xtagan joyiga qaytarish. Shuning uchun boshlangan kurs bo'lsa,
 * "davom etish" eshiklardan OLDIN turadi. Hech narsa boshlanmagan
 * bo'lsa u umuman ko'rinmaydi va sahifa yangi odam uchun toza
 * qoladi.
 *
 * ─────────────── SONLAR QO'LDA YOZILMAYDI ───────────────
 *
 * "637 dars", "8 o'yin" kabi sonlar kurs dasturidan va o'yinlar
 * ro'yxatidan hisoblanadi. Qo'lda yozilganda ular jimgina eskirardi
 * — aynan shunday bo'lgan edi: sayt tavsifida kurs dasturi
 * 11-sinfgacha o'sganidan keyin ham "1–4-sinf" deb turavergan edi.
 */
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { avatarBelgi } from "../lib/dokon";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { Logo } from "../components/Logo";
import { Reveal } from "../components/Reveal";
import { KunlikKarta } from "../components/KunlikKarta";
import { TilTugma } from "../components/TilTugma";
import { YoruglikTugma } from "../components/YoruglikTugma";
import { getHisob, joriyProfil, profilSoni } from "../lib/api";
import type { Hisob } from "../lib/api";
import { COURSES, courseBySlug, lessonCount } from "../lib/curriculum";
import type { Course } from "../lib/curriculum";
import { oxirgiKurs } from "../lib/oxirgi";
import { MAVZULAR } from "../lib/kichkintoy";
import { OYINLAR } from "../lib/oyin";
import { blokBormi, sinfOf } from "../lib/blok";
import { useKompyuter } from "../lib/maket";
import { qobiq, tgIsm } from "../lib/qobiq";
import {
  kichkintoyKerak, pedagogmi, profilKursi, profilNomi, sinfOfProfil, useProfil, yolOf,
} from "../lib/profil";
import type { Profil, Yol } from "../lib/profil";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { keyingiDars } from "../lib/types";
import type { Progress } from "../lib/types";

interface Props {
  progressOf: (c: Course) => Progress;
  /** Beshta eshik. */
  onKichkintoy: () => void;
  onDarslar: () => void;
  onMasalalar: () => void;
  onTestlar: () => void;
  onOyinlar: () => void;
  /** Boshlangan darsga qaytish. */
  onDavom: (c: Course, ui: number, li: number) => void;
  /** Kunlik son ekrani — tepadagi karta shu yerga olib boradi. */
  onKunlikSon: () => void;
  onQidiruv: () => void;
  onReyting: () => void;
  onSozlama: () => void;
  onProfillar: () => void;
  /** Kattalar bo'limidagi ikkita qo'shimcha yo'l. */
  onFormulalar: () => void;
  onImtihon: () => void;
  /** Profildagi sinfning o'z kursi — "{n}-sinf darslari" tugmasi. */
  onKurs: (c: Course) => void;
  /** Anketani qayta ochish — "siz kimsiz" yorlig'i. */
  onProfil: () => void;
}

/**
 * PROFILGA QARAB ESHIKLAR TARTIBI.
 *
 * Anketa shuni ko'rsatdi: kelganlarning 58% i talaba, yana 20% i
 * o'qituvchi va boshqa kattalar. Ularga birinchi bo'lib "Kichkintoylar"
 * va "Darslar · 1-sinf" chiqsa, ilova o'ziga emasdek ko'rinadi. Endi
 * har kimga o'ziga kerakli bo'lim tepada (`lib/profil.ts`):
 *
 *   maktab      darslar → testlar → o'yinlar → masalalar
 *   abituriyent testlar → masalalar → darslar → o'yinlar
 *   oliy        darslar (oliy matematika) → masalalar → testlar → o'yinlar
 *
 * Kichkintoylar faqat kerak bo'lganga (ota-ona, boshlang'ich sinf
 * o'qituvchisi) — talabaga u shovqin.
 */
const TARTIB: Record<Yol, string[]> = {
  maktab: ["palette", "map", "chart", "puzzle", "pencil"],
  abiturient: ["chart", "pencil", "map", "puzzle", "palette"],
  oliy: ["map", "pencil", "chart", "puzzle", "palette"],
};

/* Eshiklardagi sonlar — dasturdan hisoblanadi (fayl boshidagi izoh). */
const JAMI_DARS = COURSES.reduce((s, c) => s + lessonCount(c), 0);
const TEST_SINFLAR = COURSES.map((c) => sinfOf(c.grade)).filter(blokBormi);
const TEST_SINF = { a: Math.min(...TEST_SINFLAR), b: Math.max(...TEST_SINFLAR) };

const kech = (ms: number) => ({ "--az-kech": `${ms}ms` }) as CSSProperties;

/** Joriy bolaning profili — server bilan bir xil qoidaga bo'ysunadi. */
function joriyBola(h: Hisob | null) {
  const ro = h?.profillar ?? [];
  const id = joriyProfil();
  return ro.find((p) => String(p.id) === id) ?? ro[0] ?? null;
}

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
  return keyingi ? { c, ...keyingi } : null;
}

export function Bosh({
  progressOf, onKichkintoy, onDarslar, onMasalalar, onTestlar, onOyinlar,
  onDavom, onKunlikSon, onQidiruv, onReyting, onSozlama, onProfillar, onFormulalar, onImtihon,
  onKurs, onProfil,
}: Props) {
  const kopBola = profilSoni() > 1;
  const [hisob, setHisob] = useState<Hisob | null>(null);

  useEffect(() => {
    let bekor = false;
    getHisob().then((h) => { if (!bekor) setHisob(h); });
    return () => { bekor = true; };
  }, []);

  const bola = joriyBola(hisob);
  const prof = useProfil();
  const yol = yolOf(prof);
  // Formulalar va DTM kartalari — maktab yo'lidan boshqa hammaga.
  const kattalar = yol !== "maktab";
  const davom = davomJoyi(progressOf);
  const kompyuter = useKompyuter();
  // Bot ichida bosh sahifa boshqacha ochiladi: katta logo o'rniga
  // salomlashish. Telegram'da ilova nomi sarlavhada allaqachon yozilgan
  // va ekranning uchdan birini logoga berish — joyni isrof qilish.
  const bot = qobiq() === "tg";
  const ism = (hisob?.toliqIsm || tgIsm()).split(" ")[0] ?? "";

  const hammasi: EshikMalumot[] = [
    { ic: "palette", nom: t("kichkintoyQisqa"), izoh: t("boshKichkintoyIzoh"),
      batafsil: t("boshKichkintoyBatafsil"), son: t("boshMavzuSoni", { n: MAVZULAR.length }), on: onKichkintoy },
    { ic: "map", nom: t("tabDarslar"), izoh: t("boshDarslarIzoh"),
      batafsil: t("boshDarslarBatafsil"), son: t("darsSoni", { n: JAMI_DARS }), on: onDarslar },
    { ic: "pencil", nom: t("masalalar"), izoh: t("boshMasalalarIzoh"),
      batafsil: t("boshMasalalarBatafsil"), son: "", on: onMasalalar },
    { ic: "chart", nom: t("testlar"), izoh: t("boshTestlarIzoh"),
      batafsil: t("boshTestlarBatafsil"), son: t("boshSinfOraliq", TEST_SINF), on: onTestlar },
    { ic: "puzzle", nom: t("oyinlar"), izoh: t("boshOyinlarIzoh"),
      batafsil: t("boshOyinlarBatafsil"), son: t("boshOyinSoni", { n: OYINLAR.length }), on: onOyinlar },
  ];
  // Ota-ona maktabgacha bola uchun kelgan — unga kichkintoylar birinchi.
  const tartib = sinfOfProfil(prof) === 0 ? ["palette", "map", "puzzle", "chart", "pencil"] : TARTIB[yol];
  const eshiklar = tartib
    .map((ic) => hammasi.find((e) => e.ic === ic)!)
    .filter((e) => e.ic !== "palette" || kichkintoyKerak(prof));
  const juft = eshiklar.length % 2 === 0;
  /** Kompyuter setkasi: 5 ta — 3+2, 4 ta — 2+2; teshik qolmasin. */
  const ustun = (i: number) =>
    juft ? "xl:col-span-3"
      : i < 3 ? "xl:col-span-2"
        : i === eshiklar.length - 1 ? "col-span-2 xl:col-span-3" : "xl:col-span-3";

  const profilYorliq = prof && (
    <Chip ic="parent" on={onProfil} rang="text-brand-blue">
      {profilNomi(prof)}
    </Chip>
  );

  const asosiy = (
    <AsosiyAmal davom={davom} prof={prof} katta={kompyuter}
      onDarslar={onDarslar} onMasalalar={onMasalalar} onDavom={onDavom}
      onKurs={onKurs} onImtihon={onImtihon} onTestlar={onTestlar} />
  );

  if (kompyuter) {
    return (
      <div className="mx-auto w-full max-w-[1120px] px-8 pt-8 pb-14">
        <header className="az-kirish flex items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="font-display text-[28px] leading-tight">
              {ism ? t("boshSalom", { ism }) : t("boshSalomYangi")}
            </h1>
            <p className="mt-1 text-[15px] text-ink-soft">{t("boshSalomIzoh")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {profilYorliq}
            {kopBola && <Chip ic="parent" on={onProfillar}>{t("kimOynayapti")}</Chip>}
            <Chip ic="pencil" on={onSozlama} avatar={bola?.avatar}>
              {hisob?.toliqIsm || t("hisobim")}
            </Chip>
          </div>
        </header>

        <button type="button" onClick={onQidiruv} data-tahlil="Bosh: qidiruv"
          className="az-kirish clay-press mt-5 flex w-full items-center gap-3 rounded-clay bg-karta
                     px-4 py-3.5 text-left shadow-clay-sm">
          <Icon name="search" size={19} className="shrink-0 text-ink-dim" />
          <span className="min-w-0 flex-1 truncate text-[15px] text-ink-dim">{t("qidiruvJoy")}</span>
        </button>

        {/* Birinchi qator: chapda "hozir nima qilay" javobi, o'ngda
            kunlik odat. Telefonda ular ustma-ust turadi, bu yerda esa
            ekran keng va ikkalasi bir qarashda ko'rinadi. */}
        <div className="mt-4 grid grid-cols-[1.5fr_1fr] items-stretch gap-4">
          <div className="flex flex-col gap-3">
            {asosiy}
            {kattalar && (
              <div className="grid grid-cols-2 gap-3">
                <KattaEshik ik="sqrt" rang="bg-brand-blue" nom={t("kattalarFormula")}
                  izoh={t("kattalarFormulaIzoh")} on={onFormulalar} />
                <KattaEshik ik="clock" rang="bg-brand-blue" nom={t("kattalarDtm")}
                  izoh={t("kattalarDtmIzoh")} on={onImtihon} />
              </div>
            )}
          </div>
          <div className="[&>*]:h-full"><KunlikKarta onOch={onKunlikSon} /></div>
        </div>

        <h2 className="mt-9 text-[20px]">{t("boshBolimlar")}</h2>
        {/* Keng ekranda 3 + 2 yoki 2 + 2 (`ustun`) — aks holda oxirgi
            qatorda teshik qolardi. */}
        <div className="mt-3 grid grid-cols-2 gap-4 xl:grid-cols-6">
          {eshiklar.map((e, i) => (
            <div key={e.ic} className={`[&>*]:h-full ${ustun(i)}`}>
              <KompEshik e={e} kech={80 + i * 40} />
            </div>
          ))}
        </div>

        {/* Yangi odamga — ilova qanday ishlashi, uch qadamda. Qaytgan
            odam buni allaqachon biladi va unga u faqat joy egallaydi. */}
        {!davom && (
          <section className="mt-9">
            <h2 className="text-[20px]">{t("boshQanday")}</h2>
            <ol className="mt-3 grid grid-cols-3 gap-4">
              {([1, 2, 3] as const).map((n) => (
                <li key={n} className="flex items-start gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-track
                                   font-display text-[16px] text-brand-blue">{n}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-[15.5px] leading-tight">{t(`boshQadam${n}`)}</span>
                    <span className="mt-1 block text-[13px] leading-snug text-ink-dim">{t(`boshQadam${n}Izoh`)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[430px] px-3.5 pt-[clamp(6px,1.5vh,14px)]
                    pb-10 sm:max-w-[700px] sm:px-6">
      {bot ? (
        // BOTDA: logo o'rniga salom va ism. Yorug'lik/til tugmalari
        // shu qatorga sig'adi — alohida qator kerak emas.
        <div className="az-kirish flex items-center gap-2.5 pt-1">
          <Logo size={40} jonli={false} className="shrink-0" />
          <h1 className="min-w-0 flex-1 truncate font-display text-[19px] leading-tight">
            {ism ? t("botSalom", { ism }) : t("boshSalomYangi")}
          </h1>
          <YoruglikTugma />
          <TilTugma />
        </div>
      ) : (
        <div className="az-kirish flex items-center justify-between gap-2">
          <YoruglikTugma />
          <TilTugma />
        </div>
      )}

      <header className="az-kirish text-center">
        {!bot && (
          <>
            <Logo size={272} variant="toliq"
              className="mx-auto h-auto w-[min(52vw,clamp(112px,17vh,184px))]
                         drop-shadow-[0_6px_14px_rgb(30_50_110/0.16)] sm:w-[min(224px,25vh)]" />
            <h1 className="sr-only">{t("shior")}</h1>
          </>
        )}

        <div className={`mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${bot ? "justify-start" : "justify-center"}`}>
          {/* Yulduz va dars soni pillalari olib tashlandi: yangi odamga
              "0 yulduz · 637 dars" hech narsa demaydi, qaytganga esa
              yulduz kurs ichida ko'rinadi. */}
          {/* "Siz kimsiz" yorlig'i — ilova nimaga moslashganini aytadi
              va bosilsa javobni o'zgartirish mumkin. Alohida turadi:
              tor ekranda o'z qatoriga tushadi. */}
          {profilYorliq}
          <span className="flex min-w-0 items-center gap-1.5">
            {kopBola && (
              <Chip ic="parent" on={onProfillar}>{t("kimOynayapti")}</Chip>
            )}
            {/* Reyting PASTKI PANELDAN shu yerga ko'chdi. U bo'lim
                emas — mukofot: odam unga kunda bir marta, yulduz
                yig'gandan keyin kiradi. Panelning beshdan biri esa
                doim ko'rinib turadigan joy va u haqiqiy bo'limga
                kerak edi (endi u yerda Masalalar turadi). */}
            <Chip ic="order" on={onReyting} rang="text-brand-gold">
              {t("reyting")}
            </Chip>
            <Chip ic="pencil" on={onSozlama} avatar={bola?.avatar}>
              {hisob?.toliqIsm || t("hisobim")}
            </Chip>
          </span>
        </div>
      </header>

      {/* ---- qidiruv ---- */}
      <Reveal kech={40}>
        <div className="az-kirish mt-3.5" style={kech(40)}>
          <button type="button" onClick={onQidiruv}
            className="clay-press flex w-full items-center gap-2.5 rounded-clay bg-karta
                       px-3.5 py-3 text-left shadow-clay-sm">
            <Icon name="search" size={17} className="shrink-0 text-ink-dim" />
            <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink-dim">
              {t("qidiruvJoy")}
            </span>
          </button>
        </div>
      </Reveal>

      {/* ---- ASOSIY AMAL ----
          Bosh sahifada har doim BITTA katta tugma bor va u "hozir
          nima qilay?" degan savolga javob beradi:

            qaytgan odam   → to'xtagan darsiga (yashil, "davom")
            yangi odam     → sinf tanlash (ko'k, "boshlash")

          Ilgari yangi odamga katta tugma yo'q edi — beshta teng eshik
          va ulardan qaysi biri "boshlanish" ekanini o'zi topishi
          kerak edi. */}
      {/* KATTALAR YO'LI — anketa "talaba / o'qituvchi / kattalar"
          desa, birinchi qatorda sinf emas, ishlaydigan narsalar
          turadi (izoh yuqorida, `KATTALAR`). */}
      {kattalar && (
        <Reveal kech={50}>
          <div className="az-kirish mt-2.5 grid grid-cols-2 gap-2.5" style={kech(50)}>
            <KattaEshik ik="sqrt" rang="bg-brand-blue" nom={t("kattalarFormula")}
              izoh={t("kattalarFormulaIzoh")} on={onFormulalar} />
            <KattaEshik ik="clock" rang="bg-brand-purple" nom={t("kattalarDtm")}
              izoh={t("kattalarDtmIzoh")} on={onImtihon} />
          </div>
        </Reveal>
      )}

      {/* KUNLIK SON — eng tepada, "davom etish" dan ham yuqorida.
          Sabab `components/KunlikKarta.tsx` izohida: bu ilovadagi
          yagona kunlik odat va u o'yinlar ro'yxatida yashiringani
          uchun 30 kunda besh marta ochilgan edi. */}
      <Reveal kech={60}>
        <div className="az-kirish mt-2.5" style={kech(60)}>
          <KunlikKarta onOch={onKunlikSon} />
        </div>
      </Reveal>

      <Reveal kech={70}>
        <div className="az-kirish mt-2.5" style={kech(70)}>{asosiy}</div>
      </Reveal>

      {/* ---- beshta eshik ----
          Tartib TASODIFIY EMAS — yoshga qarab: eng kichigidan
          kattasiga. Ota-ona ro'yxatni yuqoridan pastga o'qiydi va
          farzandining yoshiga birinchi to'g'ri kelgan joyda
          to'xtaydi. O'yinlar eng pastda, chunki u yosh bilan
          bog'liq emas va uni bola O'ZI qidiradi. */}
      <div className="mt-5 space-y-2.5">
        {eshiklar.map((e, i) => <Eshik key={e.ic} e={e} kech={110 + i * 30} />)}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- bo'laklar */

/**
 * ASOSIY AMAL — bosh sahifadagi yagona katta tugma.
 *
 * U "hozir nima qilay?" degan savolga javob beradi:
 *
 *   qaytgan odam   → to'xtagan darsiga (yashil, "davom")
 *   sinfi ma'lum   → o'sha sinf kursiga ("7-sinf darslari")
 *   abituriyent    → DTM variantlari
 *   o'qituvchi     → testlar (maktab) yoki masalalar (OTM)
 *   oliy yo'l      → masalalar
 *   profil yo'q    → sinf tanlash (ko'k, "boshlash")
 *
 * Ilgari yangi odamga katta tugma yo'q edi — beshta teng eshik va
 * ulardan qaysi biri "boshlanish" ekanini o'zi topishi kerak edi.
 *
 * `katta` — kompyuterdagi ko'rinish: o'sha tugma, balandroq va
 * yirikroq yozuv bilan, chunki u yerda u yarim ekranni egallaydi.
 */
function AsosiyAmal({
  davom, prof, katta, onDarslar, onMasalalar, onDavom, onKurs, onImtihon, onTestlar,
}: {
  davom: ReturnType<typeof davomJoyi>;
  prof: Profil | null;
  katta: boolean;
  onDarslar: () => void;
  onMasalalar: () => void;
  onDavom: (c: Course, ui: number, li: number) => void;
  onKurs: (c: Course) => void;
  onImtihon: () => void;
  onTestlar: () => void;
}) {
  const ol = katta
    ? { p: "p-6 min-h-[120px]", nom: "text-[22px]", izoh: "text-[14.5px]" }
    : { p: "p-4", nom: "text-[17px]", izoh: "text-[12.5px]" };

  const tugma = (rang: string, tahlil: string, on: () => void, nom: string, izoh: string, belgi?: IconName) => (
    <button type="button" onClick={on} data-tahlil={tahlil}
      className={`tugma-3d flex h-full w-full items-center gap-3 rounded-clay text-left text-white
                  shadow-clay ${rang} ${ol.p}`}>
      {belgi && (
        <span className={`grid shrink-0 place-items-center rounded-2xl bg-white/25
                          ${katta ? "size-14" : "size-10"}`}>
          <Icon name={belgi} size={katta ? 28 : 20} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={`block font-display leading-tight ${ol.nom}`}>{nom}</span>
        <span className={`mt-0.5 block truncate leading-snug text-white/90 ${ol.izoh}`}>{izoh}</span>
      </span>
      <Icon name="chevron" size={katta ? 24 : 20} className="shrink-0 text-white/90" />
    </button>
  );

  if (davom) {
    return tugma("bg-brand-green", "Bosh: davom etish",
      () => onDavom(davom.c, davom.ui, davom.li), t("boshDavom"),
      `${kursMatn(davom.c.title)} · ${t("boshDavomJoy", { bob: davom.ui + 1, dars: davom.li + 1 })}`,
      "check");
  }
  const yol = yolOf(prof);
  const kurs = profilKursi(prof);
  // Bo'lajak boshlang'ich sinf o'qituvchisi — 1–4-sinf ro'yxatiga
  // ("Darslar" tepasida "Siz uchun" bo'limi shu sinflar).
  if (pedagogmi(prof)) {
    return tugma("bg-brand-blue", "Bosh: pedagog darslari", onDarslar,
      t("boshPedagog"), t("boshPedagogIzoh"), "map");
  }
  if (kurs) {
    const s = sinfOfProfil(prof);
    if (s === null) {
      // Oliy yo'l — talabalar kursi.
      return tugma("bg-brand-blue", "Bosh: oliy matematika", () => onKurs(kurs),
        kursMatn(kurs.title), kursMatn(kurs.desc), "sqrt");
    }
    return tugma("bg-brand-blue", "Bosh: sinf darslari", () => onKurs(kurs),
      s === 0 ? t("boshMaktabgachaDarslari") : t("boshSinfDarslari", { n: s }),
      t("boshSinfDarslariIzoh"), "map");
  }
  if (yol === "abiturient") {
    return tugma("bg-brand-blue", "Bosh: abiturient DTM", onImtihon,
      t("boshAbiturient"), t("boshAbiturientIzoh"), "clock");
  }
  if (prof?.kim === "ustoz" && yol === "maktab") {
    return tugma("bg-brand-blue", "Bosh: ustoz testlar", onTestlar,
      t("boshUstoz"), t("boshUstozIzoh"), "chart");
  }
  if (yol === "oliy") {
    return tugma("bg-brand-green", "Bosh: kattalar masalalar", onMasalalar,
      t("boshKattalarBoshla"), t("boshKattalarIzoh"));
  }
  return tugma("bg-brand-blue", "Bosh: boshlash", onDarslar, t("boshBoshla"), t("boshBoshlaIzoh"));
}

interface EshikMalumot {
  ic: string;
  nom: string;
  /** Telefondagi bir qatorlik izoh. */
  izoh: string;
  /** Kompyuterdagi to'liq izoh. */
  batafsil: string;
  /** "Ichkarida qancha bor" — bo'sh bo'lsa ko'rsatilmaydi. */
  son: string;
  on: () => void;
}

/**
 * Kompyuterdagi bo'lim kartasi.
 *
 * Telefondagi `Eshik` bilan bir xil ma'lumot, lekin to'liq izoh bilan:
 * keng ekranda bir qatorlik yozuv kartani bo'sh qoldirardi, yangi odam
 * esa "u yerda aniq nima bor" degan javobni baribir olmasdi.
 */
function KompEshik({ e, kech: ms }: { e: EshikMalumot; kech: number }) {
  return (
    <Reveal kech={ms}>
      <button type="button" onClick={e.on} data-tahlil={`Bosh: ${e.ic}`}
        className="az-kirish clay-press flex h-full w-full flex-col items-start gap-3 rounded-clay
                   bg-karta p-5 text-left shadow-clay-sm" style={kech(ms)}>
        <span className="flex w-full items-center gap-3">
          <span aria-hidden
            className="az-eshik-quti bg-track grid size-14 shrink-0 place-items-center rounded-[18px]">
            <img src={`/belgi/${e.ic}.webp`} width={42} height={42} alt=""
              className="az-eshik-belgi" decoding="async" loading="lazy" />
          </span>
          <span className="min-w-0 flex-1 font-display text-[18px] leading-tight">{e.nom}</span>
        </span>
        <span className="text-[14px] leading-relaxed text-ink-soft">{e.batafsil}</span>
        <span className="mt-auto flex w-full items-center justify-between pt-1 text-[13px]">
          <span className="text-ink-dim">{e.son}</span>
          <span className="flex items-center gap-1 text-brand-blue">
            {t("boshOchish")}
            <Icon name="chevron" size={16} />
          </span>
        </span>
      </button>
    </Reveal>
  );
}

/** Kattalar yo'lidagi kichik eshik — bosh ekrandagi ikkita karta. */
function KattaEshik({ ik, rang, nom, izoh, on }: {
  ik: IconName; rang: string; nom: string; izoh: string; on: () => void;
}) {
  return (
    <button type="button" onClick={on} data-tahlil={`Bosh: ${nom}`}
      className="clay-press flex flex-col items-start gap-2 rounded-clay bg-karta p-3 text-left shadow-clay-sm">
      <span className={`grid size-9 place-items-center rounded-2xl text-white ${rang}`}>
        <Icon name={ik} size={18} />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[14px] leading-tight">{nom}</span>
        <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-soft">{izoh}</span>
      </span>
    </button>
  );
}

function Chip(
  { ic, on, children, rang, avatar }:
  { ic: IconName; on: () => void; children: ReactNode; rang?: string; avatar?: string },
) {
  return (
    <button type="button" onClick={on}
      className="clay-press flex min-w-0 shrink-0 items-center gap-1.5 rounded-full
                 bg-karta/70 px-2.5 py-1.5 text-[11.5px] text-ink-soft backdrop-blur-sm">
      {avatar ? (
        // Serverdagi qiymat — do'kon buyumining `id` si ("shlyapa"),
        // ya'ni uni shundayligicha chizib bo'lmaydi.
        <span className="grid size-[17px] shrink-0 place-items-center rounded-full
                         bg-track"><EmojiBelgi e={avatarBelgi(avatar)} olcham={10} /></span>
      ) : (
        <Icon name={ic} size={14} className={`shrink-0 ${rang ?? ""}`} />
      )}
      <span className="truncate">{children}</span>
    </button>
  );
}

/**
 * Bitta bo'lim eshigi.
 *
 * Har birida BIR QATORLIK izoh bor va bu ataylab: eshikning nomi
 * ("Testlar") u yerda nima bo'lishini aytmaydi. Ilgari pastki
 * paneldagi tugmalar aynan shunday edi — yozuvsiz belgi, izohsiz —
 * va ilovaga birinchi marta kirgan odam ularning ortida nima
 * borligini bilmasdi.
 *
 * O'ng tomondagi kichik son "ichkarida qancha bor" degan javob:
 * bo'sh eshikni ochish odamni ikkinchi marta qaytmaydigan qiladi.
 */
function Eshik({ e: { ic, nom, izoh, son, on }, kech: ms }: { e: EshikMalumot; kech: number }) {
  return (
    <Reveal kech={ms}>
      <div className="az-kirish" style={kech(ms)}>
        <button type="button" onClick={on} data-tahlil={`Bosh: ${ic}`}
          className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta
                     p-3.5 text-left shadow-clay-sm">
          {/* BELGI — 3D chizma, emoji EMAS va chiziqli ikonka ham emas.
              Emoji har qurilmada boshqacha chiziladi. Chiziqli belgi
              esa bu yerda juda tinch turardi: bu beshta satr bosh
              sahifaning ASOSIY tanlovi va ular ko'zga birinchi
              tashlanishi kerak. Rang fonda yumshoq holda turadi —
              menyudagi qoida bilan bir xil (`components/Menyu.tsx`
              dagi `Satr`). */}
          {/* Belgi foni NEYTRAL: beshta eshik beshta rangda turganda
              sahifa kamalakka aylanardi va hech biri ajralmasdi. */}
          <span aria-hidden
            className="az-eshik-quti bg-track grid size-[46px] shrink-0 place-items-center
                       rounded-[16px]">
            <img src={`/belgi/${ic}.webp`} width={34} height={34} alt=""
              className="az-eshik-belgi" decoding="async" loading="lazy" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] leading-tight">{nom}</span>
            {/* Izoh BIR QATOR: beshta eshik telefon ekraniga birdaniga
                sig'ishi kerak. Ikki qatorli izoh bilan oxirgisi
                pastda qolib, uni faqat surgan odam ko'rardi — ya'ni
                "hamma bo'lim bir darajada" degan butun maqsad
                buzilardi. */}
            <span className="mt-0.5 line-clamp-1 text-[12px] leading-snug text-ink-dim">
              {izoh}
            </span>
          </span>
          {/* Son 360px dan tor ekranda yashiriladi: u yerda izoh uchun
              joy muhimroq. */}
          {son && (
            <span className="hidden shrink-0 rounded-full bg-track px-2 py-0.5 text-[11.5px]
                             text-ink-soft min-[360px]:block">{son}</span>
          )}
          <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
        </button>
      </div>
    </Reveal>
  );
}
