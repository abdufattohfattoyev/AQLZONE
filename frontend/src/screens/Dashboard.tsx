import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { Reveal } from "../components/Reveal";
import { COURSES, OLIY_KURSLAR, lessonCount, maktabKursi } from "../lib/curriculum";
import { kursBelgi } from "../lib/chizma/kursBelgi";
import { UNIT_COLORS } from "../lib/types";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { sorov } from "../lib/api";
import { profilKurslari, useProfil } from "../lib/profil";
import { kursMatn } from "../lib/tarjima/kurs";
import type { Course } from "../lib/curriculum";
import type { Progress } from "../lib/types";

/**
 * `onOyinlar` va `onDuel` SHU YERDA EDI va olib tashlandi.
 *
 * O'yinlarga pastdagi panelning o'rtasidagi tugmadan kiriladi,
 * bellashuv esa o'yinlar ekranining eng tepasida turadi. Bosh
 * sahifadagi ikkita keng karta ularning takrori edi.
 */
interface Props {
  progressOf: (c: Course) => Progress;
  onOpen: (c: Course) => void;
  /**
   * Anketadagi javob ("talaba", "kattalar", "ustoz", "ota_ona",
   * "oquvchi"). Bo'sh bo'lishi normal — odam anketani o'tkazib
   * yuborgan bo'lishi mumkin.
   */
  kim?: string;
  /** Kattalar bo'limidagi tugmalar. */
  onFormulalar: () => void;
  onTestlar: () => void;
  onMasalalar: () => void;
  onOyinlar: () => void;
}

/**
 * KATTALAR BO'LIMI — nega bor.
 *
 * Tahlil ko'rsatdi: anketa to'ldirganlarning 58% i TALABA, yana 20% i
 * o'qituvchi, ota-ona va boshqa kattalar. Shu bilan birga `/darslar`
 * ilovadagi ENG KATTA CHIQISH NUQTASI edi (hamma chiqishning 34% i).
 * Sabab ko'rinib turibdi: yigirma yoshli odam ekranni ochadi, "1-sinf
 * … 11-sinf" ro'yxatini ko'radi va bu ilova o'ziga emas deb o'ylaydi.
 *
 * Yangi kurs yozilmadi — bu yolg'on bo'lardi. Buning o'rniga ilovada
 * ALLAQACHON BOR narsalar ko'rsatildi: formulalar to'plami, blok
 * testlar, o'quvchilar yozgan masalalar va hisob o'yinlari. Bularning
 * hammasi yoshga bog'liq emas.
 *
 * Tartib javobga qarab o'zgaradi: talaba va kattalarga bu bo'lim
 * BIRINCHI, ota-ona va o'quvchiga esa sinflar birinchi chiqadi —
 * ota-ona bolasining sinfini qidirib keladi.
 */
const KATTALAR = ["talaba", "kattalar", "ustoz", "abiturient"];

/**
 * BITTA SAVOL — ZAXIRA.
 *
 * Ilgari anketani 757 hisobdan 90 tasi to'ldirgan edi (12%): u faqat
 * ro'yxatdan to'liq o'tgan odamga chiqardi va shu savol uning o'rnini
 * bosardi. Endi anketa kirishda HAMMAGA majburiy
 * (`components/Anketa.tsx`), ya'ni bu savol deyarli chiqmaydi — faqat
 * profil hech qayerda yo'q bo'lsa (masalan anketa oynasi chetlab
 * o'tilgan `/kirish/<kod>` havolasidan kelganda).
 *
 * Shuning uchun savol KERAK BO'LGAN JOYDA turadi — aynan shu ekranda,
 * chunki `/darslar` eng katta chiqish nuqtasi edi (34%). U hech
 * narsani to'smaydi: ostida kurslar ro'yxati o'sha joyida qoladi,
 * javob bitta bosish va u ro'yxatni o'sha zahoti qayta tizadi.
 *
 * Javob "qisman" bo'lib yoziladi: to'liq tanishuv anketasi (bosqich,
 * viloyat) keyinroq, ro'yxatdan o'tganda baribir so'raladi.
 */
const SAVOL_JAVOBLARI: { kod: string; kalit: Kalit }[] = [
  { kod: "oquvchi", kalit: "savolOquvchi" },
  { kod: "ota_ona", kalit: "savolOtaOna" },
  { kod: "talaba", kalit: "savolTalaba" },
  { kod: "ustoz", kalit: "savolUstoz" },
];

/** Ro'yxat navbat bilan chiqsin — ekran "jonli" ochilgandek ko'rinadi. */
const kech = (ms: number) => ({ "--az-kech": `${ms}ms` }) as CSSProperties;

export function Dashboard({
  progressOf, onOpen, kim, onFormulalar, onTestlar, onMasalalar, onOyinlar,
}: Props) {
  const maktabgacha = COURSES.filter((c) => c.grade === 0);
  const sinflar = COURSES.filter((c) => c.grade > 0 && maktabKursi(c));
  // Talabalar kursi alohida bo'limda — sinflar setkasida "301-sinf"
  // bo'lib turmasin.
  const oliy = OLIY_KURSLAR();
  // Javob shu yerda ham saqlanadi: serverga yozilishini kutib
  // turmasdan ro'yxat darrov qayta tiziladi.
  const [javob, setJavob] = useState(kim ?? "");
  useEffect(() => { if (kim) setJavob(kim); }, [kim]);
  const kattalarAvval = KATTALAR.includes(javob);
  const ozim = profilKurslari(useProfil());

  const savolBer = (kod: string) => {
    setJavob(kod);
    // Xato bo'lsa jim: ro'yxat baribir moslashgan, javob esa
    // keyingi safar qayta so'raladi.
    void sorov("/api/v1/anketa", { kim: kod, qisman: true }).catch(() => {});
  };

  const savol = !javob && (
    <Reveal kech={40}>
      <div className="az-kirish mt-3 rounded-clay bg-karta p-3.5 shadow-clay-sm" style={kech(40)}>
        <div className="font-display text-[14.5px] leading-tight">{t("savolKim")}</div>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">{t("savolIzoh")}</p>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {SAVOL_JAVOBLARI.map((j) => (
            <button key={j.kod} type="button" onClick={() => savolBer(j.kod)}
              data-tahlil={`Darslar: javob ${j.kod}`}
              className="clay-press rounded-2xl bg-sahna px-3 py-2.5 text-left font-display
                         text-[13px] leading-tight shadow-clay-sm">
              {t(j.kalit)}
            </button>
          ))}
        </div>
      </div>
    </Reveal>
  );

  const kattalarBolimi = (
    <>
      <Sarlavha kech={kech(kattalarAvval ? 60 : 200)}>{t("kattalarBolim")}</Sarlavha>
      <p className="az-kirish mb-2 ml-1.5 text-[12px] leading-snug text-ink-soft"
        style={kech(kattalarAvval ? 70 : 210)}>
        {t("kattalarIzoh")}
      </p>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <KattaKarta ik="sqrt" nom={t("kattalarFormula")} izoh={t("kattalarFormulaIzoh")}
          rang="bg-brand-blue" on={onFormulalar} kech={kech(kattalarAvval ? 90 : 230)} />
        {/* Testlar o'rnida DTM: kattaga kerakli test aynan imtihon
            varianti, sinf bo'yicha blok test emas. Blok testlar
            sinf kurslari ichida o'z joyida qoladi. */}
        <KattaKarta ik="clock" nom={t("kattalarDtm")} izoh={t("kattalarDtmIzoh")}
          rang="bg-brand-purple" on={onTestlar} kech={kech(kattalarAvval ? 110 : 250)} />
        <KattaKarta ik="pencil" nom={t("kattalarMasala")} izoh={t("kattalarMasalaIzoh")}
          rang="bg-brand-green" on={onMasalalar} kech={kech(kattalarAvval ? 130 : 270)} />
        <KattaKarta ik="puzzle" nom={t("kattalarOyin")} izoh={t("kattalarOyinIzoh")}
          rang="bg-brand-orange" on={onOyinlar} kech={kech(kattalarAvval ? 150 : 290)} />
      </div>
    </>
  );

  return (
    /* Kenglik ekranga qarab o'sadi. Telefonda bitta ustun — kartalar katta va
       bosish oson. Planshetdan boshlab kurslar yonma-yon turadi, aks holda
       katta ekranda ro'yxat ingichka tasma bo'lib cho'zilib ketardi. */
    /* Balandlik ham moslashadi: Telegram Desktop'da Mini App past
       oynada ochiladi va u yerda qat'iy bo'shliqlar bilan kurslar
       ekrandan chiqib ketardi. */
    <div className="mx-auto w-full max-w-[430px] px-3.5 pt-[clamp(6px,1.5vh,14px)]
                    pb-10 sm:max-w-[700px] sm:px-6 lg:max-w-[1020px]">
      {/* ---- sarlavha ----
          Bu ekran endi FAQAT kurslar ro'yxati. Logo, hisob chiplari,
          qidiruv va kichkintoylar kartasi bosh sahifaga ko'chdi
          (`screens/Bosh.tsx`) — ular "ilovada nima bor?" degan
          savolga javob beradi, bu ekran esa boshqasiga: "qaysi
          sinf?". Ikkalasi bir sahifada turganda ro'yxat pastda
          qolib, uni ko'rish uchun surish kerak edi. */}
      <div className="az-kirish">
        <h1 className="font-display text-[20px] leading-tight">{t("tabDarslar")}</h1>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-dim">
          {t("boshDarslarIzoh")}
        </p>
      </div>

      {/* Maktabgacha kurs alohida sarlavha ostida turadi: u sinf emas va
          ota-ona "bolam hali maktabga bormaydi" deganda aynan shu yerni
          izlaydi. Bitta ro'yxatda turganda u "0-sinf" dek ko'rinardi. */}
      {savol}

      {/* SIZNING SINFINGIZ — anketada sinf aytilgan bo'lsa, o'sha
          kurs(lar) eng tepada. Ro'yxat pastda to'liq qoladi: bola
          o'tgan sinfni takrorlashi yoki oldinga o'tishi mumkin. */}
      {ozim.length > 0 && (
        <>
          <Sarlavha kech={kech(50)}>{t("darslarSizning")}</Sarlavha>
          <div className={`grid gap-2.5 ${ozim.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {ozim.map((c, i) => (
              <KursKarta key={c.id} c={c} i={i} progressOf={progressOf} onOpen={onOpen} />
            ))}
          </div>
        </>
      )}

      {kattalarAvval && kattalarBolimi}

      {maktabgacha.length > 0 && (
        <>
          <Sarlavha kech={kech(kattalarAvval ? 200 : 60)}>{t("maktabgachaBolim")}</Sarlavha>
          {/* Maktabgacha kurs KENG karta bo'lib qoladi: u bitta va uni
              ikkiga bo'lingan setkaga qo'ysak, yonida bo'sh joy turardi.
              Kengligi ham vazifasiga mos — bu bo'limning bosh kursi. */}
          <div className={`grid gap-2.5 ${maktabgacha.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {maktabgacha.map((c, i) => (
              <KursKarta key={c.id} c={c} i={i} progressOf={progressOf} onOpen={onOpen} />
            ))}
          </div>
        </>
      )}

      <Sarlavha kech={kech(kattalarAvval ? 230 : 90)}>{t("sinfKurslari")}</Sarlavha>

      {/* Sinflar TELEFONDA HAM ikkitadan turadi va kartasi boshqacha —
          tik (belgi tepada, yozuv ostida). Ilgari to'rttala sinf keng
          qatorlar bo'lib pastga cho'zilardi: ekranda bittasi ko'rinib,
          qolganini topish uchun surish kerak edi, ya'ni ota-ona "3-sinf
          bormi?" degan savolga darrov javob ololmasdi. Endi to'rttasi
          ikki qatorga sig'adi va butun ro'yxat bir qarashda ko'rinadi.

          Kompyuterda to'rttasi bitta qatorga chiqadi — 2 va 3 ustunli
          oraliq bosqich ATAYLAB yo'q: sinflar soni to'rtta, uchtaga
          bo'lganda oxirgisi yolg'iz qolib, qator sinib ko'rinardi. */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {sinflar.map((c, i) => (
          <SinfKarta key={c.id} c={c} i={i + maktabgacha.length} progressOf={progressOf} onOpen={onOpen} />
        ))}
      </div>

      {/* UNIVERSITET — talabalar kursi. O'z sinfi sifatida tepada
          ko'rsatilgan bo'lsa, bu yerda takrorlanmaydi. */}
      {oliy.length > 0 && !ozim.some((c) => oliy.includes(c)) && (
        <>
          <Sarlavha kech={kech(300)}>{t("oliyBolim")}</Sarlavha>
          <div className={`grid gap-2.5 ${oliy.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {oliy.map((c, i) => (
              <KursKarta key={c.id} c={c} i={i + sinflar.length} progressOf={progressOf} onOpen={onOpen} />
            ))}
          </div>
        </>
      )}

      {!kattalarAvval && kattalarBolimi}

      <p className="az-kirish mt-5 text-center text-[11.5px] text-ink-soft/80" style={kech(460)}>
        {t("kurslarIzoh")}
      </p>
    </div>
  );
}

/** Kattalar bo'limidagi bitta karta — sinf kartalari bilan bir o'lchamda. */
function KattaKarta({ ik, nom, izoh, rang, on, kech }: {
  ik: IconName; nom: string; izoh: string; rang: string; on: () => void; kech: CSSProperties;
}) {
  return (
    <Reveal kech={0}>
      <button type="button" onClick={on} data-tahlil={`Darslar: ${nom}`} style={kech}
        className="az-kirish clay-press flex w-full flex-col items-start gap-2 rounded-clay bg-karta
                   p-3 text-left shadow-clay-sm">
        <span className={`grid size-10 place-items-center rounded-2xl text-white ${rang}`}>
          <Icon name={ik} size={20} />
        </span>
        <span className="min-w-0">
          <span className="block font-display text-[14px] leading-tight">{nom}</span>
          <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-soft">{izoh}</span>
        </span>
      </button>
    </Reveal>
  );
}

function Sarlavha({ children, kech }: { children: React.ReactNode; kech: CSSProperties }) {
  return (
    <h2 className="az-kirish mt-4 mb-1.5 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase sm:mt-6 sm:mb-2"
      style={kech}>
      {children}
    </h2>
  );
}

/**
 * Bitta kurs kartasi.
 *
 * `i` — ro'yxatdagi o'rni. Faqat animatsiya kechikishi uchun kerak, shuning
 * uchun ikkita ro'yxat bo'lganda ikkinchisi birinchisining davomi sifatida
 * sanaladi: kartalar yuqoridan pastga navbat bilan chiqadi.
 */
/**
 * Kurs belgisi — kartadagi 3D narsa.
 *
 * ─────────── IKKI KO'RINISH ───────────
 *
 * 3D RASM. `src/rasm/kurs/<kurs id>.webp` bor bo'lsa — plitkasiz
 * narsa (palitra, cho't, sirkul…), soyasi CSS'da (`.kurs-belgi`).
 * Kartaning rangli kvadrati bu holda CHIZILMAYDI.
 *
 * ESKI KO'RINISH. Rasmi yo'q kurs avvalgidek ishlaydi: rangli
 * kvadrat, ustida oq chiziqli belgi va tepadan tushgan yorug'lik.
 * Ya'ni yangi kurs rasmsiz qo'shilsa ham hech narsa buzilmaydi.
 *
 * "Tugadi" belgisi ikkalasida ham bir xil joyda — plitkaning o'ng
 * pastki burchagida, chetidan chiqib turadi.
 */
function KursBelgi({ c, foiz, olcham }: {
  c: Course; foiz: number; olcham: "katta" | "kichik";
}) {
  const rasm = kursBelgi(c.id);
  const color = UNIT_COLORS[c.color];
  // 3D narsa plitkadan KATTAROQ turadi. Plitka o'z kvadratini to'liq
  // to'ldiradi, narsa esa yo'q: palitra yoki sirkulning atrofida bo'sh
  // joy bor va bir xil o'lchamda u plitkaning yarmicha bo'lib ko'rinardi.
  const olchov = rasm
    ? (olcham === "katta" ? "size-16 sm:size-[72px]" : "size-14 sm:size-16")
    : olcham === "katta"
      ? "size-12 rounded-[16px] sm:size-14 sm:rounded-[18px]"
      : "size-11 rounded-[15px] sm:size-12";

  return (
    <span className={`relative grid shrink-0 place-items-center overflow-visible ${olchov}
                      ${rasm ? "" : `text-white ${color.bg}`}`}>
      {rasm ? (
        /* `kurs-belgi` — soya va bosilgandagi qimirlash (`index.css`).
           Soya rasmga kuydirilmagan: u yorug' va qorong'i temada
           boshqacha bo'lishi kerak. */
        <img src={rasm} alt="" loading="lazy" decoding="async"
          className="kurs-belgi size-full object-contain" />
      ) : (
        <>
          <Icon name={c.ic} size={olcham === "katta" ? 27 : 25} />
          {/* Ichki yorug'lik — tekis rangni hajmli qiladi */}
          <span className="pointer-events-none absolute inset-0 rounded-[inherit]
                           bg-gradient-to-b from-white/35 to-transparent" />
        </>
      )}
      {foiz === 100 && (
        <span className="absolute -right-1.5 -bottom-1.5 grid size-6 place-items-center rounded-full
                         bg-brand-green text-white ring-3 ring-karta">
          <Icon name="check" size={14} />
        </span>
      )}
    </span>
  );
}

function KursKarta({ c, i, progressOf, onOpen }: {
  c: Course; i: number;
  progressOf: (c: Course) => Progress;
  onOpen: (c: Course) => void;
}) {
  const p = progressOf(c);
  const total = lessonCount(c);
  const done = Object.keys(p.done).length;
  const foiz = Math.round((done / total) * 100);

  return (
    /* `h-full` ikkalasida ham: yonma-yon turgan kartalarning matni turli
       uzunlikda, `h-full` bo'lmasa qatordagi kartalar har xil balandlikda
       chiqib, ro'yxat tishli ko'rinardi. */
    <Reveal kech={i * 90} className="h-full">
      <button type="button" onClick={() => onOpen(c)}
        /* `az-yaltir` ataylab yo'q: u `overflow: hidden` talab qiladi va
           kartadan chiqib turgan "tugadi" belgisini kesib qo'yardi. */
        className="tugma-3d flex h-full w-full items-center gap-3 rounded-clay bg-karta/95 p-3
                   text-left shadow-clay backdrop-blur-sm sm:gap-3.5 sm:p-3.5"
        style={kech(110 + i * 70)}>
        <KursBelgi c={c} foiz={foiz} olcham="katta" />

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="min-w-0 truncate font-display text-[15.5px] leading-tight">
              {kursMatn(c.title)}
            </span>
            {done > 0 && (
              <span className="ml-auto shrink-0 font-display text-[12.5px] text-ink-dim">{foiz}%</span>
            )}
          </span>
          {/* Izoh ikki qatordan oshmaydi. Uzun izoh (maktabgacha kursda u
              beshta mavzuni sanaydi) kartani ikki barobar cho'zib, past
              oynada boshqa kurslarni ekrandan chiqarib yuborardi. */}
          <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-ink-dim">{kursMatn(c.desc)}</span>

          {/* Hali boshlanmagan kursda bo'sh chiziq "bu yerda hech narsa
              yo'q" degandek ko'rinardi va `0/40` uni yanada kuchaytirardi.
              Boshlanmagan kursda taraqqiyot emas, TAKLIF turishi kerak. */}
          {done === 0 ? (
            <span className="mt-1.5 flex items-center gap-1.5 font-display text-[12.5px] text-brand-green-d">
              <Icon name="star" size={14} className="text-brand-gold" />
              {t("boshlash")}
            </span>
          ) : (
            <span className="mt-1.5 flex items-center gap-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-track">
                <span className="block h-full rounded-full bg-gradient-to-r from-brand-green to-brand-green-d
                                 transition-[width] duration-500"
                  style={{ width: `${foiz}%` }} />
              </span>
              <span className="text-[11px] whitespace-nowrap text-ink-dim">{done}/{total}</span>
            </span>
          )}
        </span>

        <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
      </button>
    </Reveal>
  );
}

/**
 * Sinf kursining kartasi — TIK ko'rinish.
 *
 * `KursKarta` dan farqi maketda: u yerda belgi, yozuv va strelka bitta
 * qatorda turadi va shu sabab karta kamida butun ekran kengligini
 * talab qiladi. Bu yerda belgi TEPADA, yozuv ostida — natijada karta
 * ikki barobar tor joyga sig'adi va telefonda ikkitadan yonma-yon
 * turadi.
 *
 * Tor kartada IZOH KO'RINMAYDI (`sm:` dan boshlab chiqadi). Sabab
 * o'lchovda ko'rindi: 375px li telefonda ustun ~150px bo'ladi va
 * "Ko'paytirish, bo'lish, perimetr, ulush, soat" u yerda to'rt qatorga
 * bo'linib, kartani cho'zadi — hosil bo'lgan matn devori esa ota-onaga
 * KURSNI TANLASHDA yordam bermaydi, sinf raqami yetarli. Kengroq
 * ekranda joy bor, o'shanda izoh qaytadi.
 *
 * Strelka ham yo'q: butun karta bosiladigan tugma va tor kartada
 * strelka yozuvdan joy o'g'irlardi.
 */
function SinfKarta({ c, i, progressOf, onOpen }: {
  c: Course; i: number;
  progressOf: (c: Course) => Progress;
  onOpen: (c: Course) => void;
}) {
  const p = progressOf(c);
  const total = lessonCount(c);
  const done = Object.keys(p.done).length;
  const foiz = Math.round((done / total) * 100);

  return (
    <Reveal kech={i * 90} className="h-full">
      <button type="button" onClick={() => onOpen(c)}
        className="tugma-3d flex h-full w-full flex-col rounded-clay bg-karta/95 p-3 text-left
                   shadow-clay backdrop-blur-sm sm:p-3.5"
        style={kech(110 + i * 70)}>
        <span className="flex w-full items-start gap-2">
          <KursBelgi c={c} foiz={foiz} olcham="kichik" />
          {done > 0 && (
            <span className="ml-auto font-display text-[12px] text-ink-dim">{foiz}%</span>
          )}
        </span>

        {/* Ikki qatorgacha o'raladi — "1-sinf Matematika" tor ustunda
            aynan shunday bo'linadi. `truncate` bo'lganda esa ruscha
            "Математика 1 класс" da SINF RAQAMI kesilib qolardi, ya'ni
            kartaning eng kerakli so'zi yo'qolardi. */}
        <span className="mt-2 line-clamp-2 font-display text-[14px] leading-tight">
          {kursMatn(c.title)}
        </span>

        <span className="mt-0.5 hidden line-clamp-2 text-[11.5px] leading-snug text-ink-dim sm:block">
          {kursMatn(c.desc)}
        </span>

        {/* `mt-auto` — pastki qator qatordagi hamma kartada bir sathda
            tursin: sarlavhalar bir va ikki qatorli bo'lgani uchun ular
            aks holda har xil balandlikda qolardi. */}
        {done === 0 ? (
          <span className="mt-auto flex items-center gap-1.5 pt-2 font-display text-[12px] text-brand-green-d">
            <Icon name="star" size={13} className="text-brand-gold" />
            {t("boshlash")}
          </span>
        ) : (
          <span className="mt-auto flex items-center gap-1.5 pt-2">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-track">
              <span className="block h-full rounded-full bg-gradient-to-r from-brand-green to-brand-green-d
                               transition-[width] duration-500"
                style={{ width: `${foiz}%` }} />
            </span>
            <span className="text-[10.5px] whitespace-nowrap text-ink-dim">{done}/{total}</span>
          </span>
        )}
      </button>
    </Reveal>
  );
}
