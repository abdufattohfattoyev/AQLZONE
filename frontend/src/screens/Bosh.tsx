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
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { Logo } from "../components/Logo";
import { Reveal } from "../components/Reveal";
import { TilTugma } from "../components/TilTugma";
import { YoruglikTugma } from "../components/YoruglikTugma";
import { getHisob, joriyProfil, profilSoni } from "../lib/api";
import type { Hisob } from "../lib/api";
import { COURSES, courseBySlug, lessonCount } from "../lib/curriculum";
import type { Course } from "../lib/curriculum";
import { MAVZULAR } from "../lib/kichkintoy";
import { OYINLAR } from "../lib/oyin";
import { oxirgiKurs } from "../lib/oxirgi";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { keyingiDars } from "../lib/types";
import type { Progress, UnitColor } from "../lib/types";
import { UNIT_COLORS } from "../lib/types";

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
  onQidiruv: () => void;
  onReyting: () => void;
  onSozlama: () => void;
  onProfillar: () => void;
}

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
  onDavom, onQidiruv, onReyting, onSozlama, onProfillar,
}: Props) {
  const kopBola = profilSoni() > 1;
  const [hisob, setHisob] = useState<Hisob | null>(null);

  useEffect(() => {
    let bekor = false;
    getHisob().then((h) => { if (!bekor) setHisob(h); });
    return () => { bekor = true; };
  }, []);

  const bola = joriyBola(hisob);
  const jamiDars = COURSES.reduce((n, c) => n + lessonCount(c), 0);
  const jamiYulduz = COURSES.reduce((n, c) => n + progressOf(c).stars, 0);
  const davom = davomJoyi(progressOf);

  return (
    <div className="mx-auto w-full max-w-[430px] px-3.5 pt-[clamp(6px,1.5vh,14px)]
                    pb-10 sm:max-w-[700px] sm:px-6">
      <div className="az-kirish flex items-center justify-between gap-2">
        <YoruglikTugma />
        <TilTugma />
      </div>

      <header className="az-kirish text-center">
        <Logo size={272} variant="toliq"
          className="mx-auto h-auto w-[min(52vw,clamp(112px,17vh,184px))]
                     drop-shadow-[0_6px_14px_rgb(30_50_110/0.16)] sm:w-[min(224px,25vh)]" />
        <h1 className="sr-only">{t("shior")}</h1>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          <span className="flex items-center gap-1.5">
            <Belgi ic="star" matn={t("yulduzSoni", { n: jamiYulduz })} />
            <Belgi ic="map" matn={t("darsSoni", { n: jamiDars })} />
          </span>
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

      {/* ---- davom etish ---- */}
      {davom && (
        <Reveal kech={70}>
          <div className="az-kirish mt-2.5" style={kech(70)}>
            <button type="button"
              onClick={() => onDavom(davom.c, davom.ui, davom.li)}
              className="tugma-3d az-yaltir flex w-full items-center gap-3 rounded-clay
                         bg-brand-green p-3.5 text-left text-white shadow-clay">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/25">
                <Icon name="check" size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] leading-tight">
                  {t("boshDavom")}
                </span>
                <span className="mt-0.5 block truncate text-[12px] leading-snug text-white/90">
                  {kursMatn(davom.c.title)} · {t("boshDavomJoy", {
                    bob: davom.ui + 1, dars: davom.li + 1,
                  })}
                </span>
              </span>
              <Icon name="chevron" size={18} className="shrink-0 text-white/85" />
            </button>
          </div>
        </Reveal>
      )}

      {/* ---- beshta eshik ----
          Tartib TASODIFIY EMAS — yoshga qarab: eng kichigidan
          kattasiga. Ota-ona ro'yxatni yuqoridan pastga o'qiydi va
          farzandining yoshiga birinchi to'g'ri kelgan joyda
          to'xtaydi. O'yinlar eng pastda, chunki u yosh bilan
          bog'liq emas va uni bola O'ZI qidiradi. */}
      <p className="az-kirish mt-5 mb-1.5 ml-1 text-[11px] tracking-widest
                    text-ink-soft uppercase" style={kech(100)}>
        {t("boshBolimlar")}
      </p>

      <div className="space-y-2.5">
        <Eshik kech={110} rang="gold" ic="palette"
          nom={t("kichkintoyQisqa")} izoh={t("boshKichkintoyIzoh")}
          son={t("boshMavzuSoni", { n: MAVZULAR.length })} on={onKichkintoy} />

        <Eshik kech={140} rang="green" ic="map"
          nom={t("tabDarslar")} izoh={t("boshDarslarIzoh")}
          son={t("darsSoni", { n: jamiDars })} on={onDarslar} />

        <Eshik kech={170} rang="purple" ic="pencil"
          nom={t("masalalar")} izoh={t("boshMasalalarIzoh")}
          son="" on={onMasalalar} />

        <Eshik kech={200} rang="blue" ic="chart"
          nom={t("testlar")} izoh={t("boshTestlarIzoh")}
          son={t("boshSinfOraliq", { a: 5, b: 11 })} on={onTestlar} />

        <Eshik kech={230} rang="red" ic="puzzle"
          nom={t("oyinlar")} izoh={t("boshOyinlarIzoh")}
          son={t("boshOyinSoni", { n: OYINLAR.length })} on={onOyinlar} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- bo'laklar */

function Belgi({ ic, matn }: { ic: IconName; matn: string }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-karta/70 px-2.5
                     py-1.5 text-[11.5px] text-ink-soft backdrop-blur-sm">
      <Icon name={ic} size={14} className="text-brand-gold" />
      {matn}
    </span>
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
        <span className="grid size-[17px] shrink-0 place-items-center rounded-full
                         bg-track text-[10.5px] leading-none">{avatar}</span>
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
function Eshik({
  kech: ms, rang, ic, nom, izoh, son, on,
}: {
  kech: number; rang: UnitColor; ic: IconName;
  nom: string; izoh: string; son: string; on: () => void;
}) {
  const r = UNIT_COLORS[rang];
  return (
    <Reveal kech={ms}>
      <div className="az-kirish" style={kech(ms)}>
        <button type="button" onClick={on}
          className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta
                     p-3.5 text-left shadow-clay-sm">
          {/* BELGI — ilovaning O'Z chiziqli belgisi, emoji EMAS.
              Emoji har qurilmada boshqacha chiziladi (Windowsda ba'zisi
              umuman chizilmaydi) va menyudagi satrlar bilan yonma-yon
              qo'yilganda ular ikki xil ilovadan kelgandek ko'rinardi.
              Rang esa fonda yumshoq holda turadi — menyudagi qoida
              bilan bir xil (`components/Menyu.tsx` dagi `Satr`). */}
          <span aria-hidden style={{ backgroundColor: `${r.road}1f`, color: r.road }}
            className="grid size-[46px] shrink-0 place-items-center rounded-[16px]">
            <Icon name={ic} size={23} />
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
          {son && (
            <span className="shrink-0 rounded-full bg-track px-2 py-1 text-[11px] text-ink-dim">
              {son}
            </span>
          )}
          <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
        </button>
      </div>
    </Reveal>
  );
}
