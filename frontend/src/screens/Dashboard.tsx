import type { CSSProperties } from "react";
import { Icon } from "../lib/icons";
import { Reveal } from "../components/Reveal";
import { COURSES, lessonCount } from "../lib/curriculum";
import { kursBelgi } from "../lib/chizma/kursBelgi";
import { UNIT_COLORS } from "../lib/types";
import { t } from "../lib/matn";
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
}

/** Ro'yxat navbat bilan chiqsin — ekran "jonli" ochilgandek ko'rinadi. */
const kech = (ms: number) => ({ "--az-kech": `${ms}ms` }) as CSSProperties;

export function Dashboard({ progressOf, onOpen }: Props) {



  const maktabgacha = COURSES.filter((c) => c.grade === 0);
  const sinflar = COURSES.filter((c) => c.grade > 0);

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
      {maktabgacha.length > 0 && (
        <>
          <Sarlavha kech={kech(60)}>{t("maktabgachaBolim")}</Sarlavha>
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

      <Sarlavha kech={kech(90)}>{t("sinfKurslari")}</Sarlavha>

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

      <p className="az-kirish mt-5 text-center text-[11.5px] text-ink-soft/80" style={kech(460)}>
        {t("kurslarIzoh")}
      </p>
    </div>
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
 * Kurs belgisi — sinf kartasining chap tomonidagi plitka.
 *
 * ─────────── IKKI KO'RINISH ───────────
 *
 * 3D RASM. `src/rasm/kurs/<ic>.webp` bor bo'lsa, plitkaning o'zi
 * shu rasm bo'ladi: kvadrat ham, belgi ham, yorug'lik ham unda
 * chizilgan. Kartaning o'z rangli kvadrati bu holda CHIZILMAYDI —
 * aks holda plitka plitka ustida turardi.
 *
 * ESKI KO'RINISH. Rasmi yo'q kurs (hozir — "Maktabgacha") avvalgidek
 * ishlaydi: rangli kvadrat, ustida oq chiziqli belgi va tepadan
 * tushgan yorug'lik. Ya'ni yangi rasm qo'shilmaguncha ham hech narsa
 * buzilmaydi.
 *
 * "Tugadi" belgisi ikkalasida ham bir xil joyda — plitkaning o'ng
 * pastki burchagida, chetidan chiqib turadi.
 */
function KursBelgi({ c, foiz, olcham }: {
  c: Course; foiz: number; olcham: "katta" | "kichik";
}) {
  const rasm = kursBelgi(c.ic);
  const color = UNIT_COLORS[c.color];
  const olchov = olcham === "katta"
    ? "size-12 rounded-[16px] sm:size-14 sm:rounded-[18px]"
    : "size-11 rounded-[15px] sm:size-12";

  return (
    <span className={`relative grid shrink-0 place-items-center overflow-visible ${olchov}
                      ${rasm ? "" : `text-white ${color.bg}`}`}>
      {rasm ? (
        <img src={rasm} alt="" className="size-full object-contain" />
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
