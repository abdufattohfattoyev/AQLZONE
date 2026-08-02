import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../lib/icons";
import { Logo } from "../components/Logo";
import { Reveal } from "../components/Reveal";
import { TilTugma } from "../components/TilTugma";
import { getHisob, joriyProfil, profilSoni } from "../lib/api";
import type { Hisob } from "../lib/api";
import { COURSES, courseBySlug, lessonCount } from "../lib/curriculum";
import { UNIT_COLORS, keyingiDars } from "../lib/types";
import { oxirgiKurs } from "../lib/oxirgi";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import type { Course } from "../lib/curriculum";
import type { Progress } from "../lib/types";

interface Props {
  progressOf: (c: Course) => Progress;
  /** Do'st bilan bellashuv — o'yinlardan ALOHIDA turadi. */
  onDuel: () => void;
  onOpen: (c: Course) => void;
  /** Oxirgi kursning keyingi darsiga TO'G'RIDAN-TO'G'RI o'tish. */
  onDavom: (c: Course, ui: number, li: number) => void;
  /** Profil tanlash ekrani. Tugma faqat ikkinchi bola qo'shilganda chiqadi. */
  onProfillar: () => void;
  /** Hisob sozlamalari — ism, familiya, kirish usullari. */
  onSozlama: () => void;
  /** Reyting — barcha kurslar bo'yicha umumiy. */
  onReyting: () => void;
  /** Matematik o'yinlar bo'limi — kurslardan mustaqil. */
  onOyinlar: () => void;
}

/** Ro'yxat navbat bilan chiqsin — ekran "jonli" ochilgandek ko'rinadi. */
const kech = (ms: number) => ({ "--az-kech": `${ms}ms` }) as CSSProperties;

/**
 * Joriy bolaning profili.
 *
 * Tanlangani bo'lmasa BIRINCHISI olinadi — server ham aynan shunday
 * qiladi. Ikkalasi bir xil qoidaga bo'ysunmasa, ekranda bir bolaning
 * nomi, progressda esa boshqasiniki turardi.
 */
function joriyBola(h: Hisob | null) {
  const ro = h?.profillar ?? [];
  const id = joriyProfil();
  return ro.find((p) => String(p.id) === id) ?? ro[0] ?? null;
}

export function Dashboard({
  progressOf, onOpen, onDavom, onProfillar, onSozlama, onReyting, onOyinlar, onDuel,
}: Props) {
  // Sinxron o'qiladi (localStorage) — tugma sakrab chiqmasligi uchun.
  const kopBola = profilSoni() > 1;
  const [hisob, setHisob] = useState<Hisob | null>(null);

  // Ism serverdan keladi. Kelmaguncha tugmada "Hisobim" turadi — o'lchami
  // deyarli bir xil, shuning uchun ism paydo bo'lganda qator sakramaydi.
  useEffect(() => {
    let bekor = false;
    getHisob().then((h) => { if (!bekor) setHisob(h); });
    return () => { bekor = true; };
  }, []);

  const bola = joriyBola(hisob);

  // Oxirgi ochilgan kurs. `localStorage` dan sinxron o'qiladi — karta
  // ekran chizilishi bilan o'z joyida turishi kerak, keyinroq sakrab
  // chiqmasligi. Kurs o'chirilgan bo'lsa `courseBySlug` `undefined`
  // qaytaradi va karta shunchaki ko'rsatilmaydi.
  const oxirgi = courseBySlug(oxirgiKurs());
  const davom = oxirgi ? keyingiDars(oxirgi.units, progressOf(oxirgi)) : null;

  const jamiDars = COURSES.reduce((n, c) => n + lessonCount(c), 0);
  const jamiYulduz = COURSES.reduce((n, c) => n + progressOf(c).stars, 0);
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
      {/* ---- til ----
          Eng tepada, o'ng chetda. Bosh sahifa brendning kirish eshigi va
          til shu yerda tanlanadi: noto'g'ri tilda ochilgan ilovada odam
          qolgan hech narsani o'qiy olmaydi.

          Sarlavhadan TASHQARIDA turadi va bu ataylab: `header` markazga
          tekislangan, tugma esa chetga suriladi — ikkisini bitta oqimga
          qo'ysak, logo markazdan siljib ketardi. */}
      <div className="az-kirish flex justify-end">
        <TilTugma />
      </div>

      {/* ---- brend ---- */}
      <header className="az-kirish text-center">
        {/* Bosh ekranda brend TO'LIQ ko'rinadi: belgi + yozuv + shior.
            Yozuv logoning ichida bo'lgani uchun sarlavha takrorlanmaydi —
            h1 faqat ekran o'quvchisi va qidiruv uchun ko'rinmas holda qoladi.

            O'lcham CSS'da: `size` faqat SVG nisbatini beradi, kenglikni esa
            klass boshqaradi — 320px li telefonda 272px qat'iy kenglik
            chetlarga tegib ketardi.

            Kenglik BALANDLIKKA ham qaraydi (`vh`). Telegram Desktop'da
            Mini App tor va PAST oynada ochiladi: u yerda logo qat'iy
            272px bo'lganda ekranning yarmini egallab, kurslar butunlay
            pastda qolib ketardi — odam nima qilishni bilmay skroll
            qidirardi. Endi oyna pasaysa, logo ham kichrayadi. */}
        <Logo size={272} variant="toliq"
          className="mx-auto h-auto w-[min(58vw,clamp(124px,20vh,208px))]
                     drop-shadow-[0_6px_14px_rgb(30_50_110/0.16)] sm:w-[min(248px,28vh)]" />
        <h1 className="sr-only">{t("shior")}</h1>

        {/* Hisob belgilari va o'tish tugmalari.
            Ikkisi IKKI GURUHGA bo'lingan va guruhlar o'ralish birligi
            bo'lib turadi. Sabab o'lchovda ko'rindi: to'rtta chipni bitta
            o'ralgan qatorga qo'ysak, 375px li telefonda uchtasi birinchi
            qatorga sig'ib, "Hisobim" yolg'iz ikkinchi qatorga tushadi —
            qator qiyshiq ko'rinadi. Guruh bilan esa tor ekranda 2+2,
            kengida esa to'rttasi bir qatorda bo'ladi. */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
          <span className="flex items-center gap-1.5">
            <Belgi ic="star" matn={t("yulduzSoni", { n: jamiYulduz })} />
            <Belgi ic="map" matn={t("darsSoni", { n: jamiDars })} />
          </span>

          <span className="flex min-w-0 items-center gap-1.5">
            {/* Profil almashtirish faqat IKKI va undan ko'p bola bo'lganda
                ma'noli. Bitta bolali oilada bu tugma hech narsa qilmaydi
                va faqat "bu nima?" degan savol tug'diradi. Bola qo'shish
                "Hisobim" ichida turadi va ikkinchisi qo'shilishi bilan bu
                tugma o'zi paydo bo'ladi. */}
            {kopBola && (
              <button type="button" onClick={onProfillar}
                className="clay-press flex shrink-0 items-center gap-1.5 rounded-full bg-karta/70
                           px-2.5 py-1.5 text-[11.5px] text-ink-soft backdrop-blur-sm">
                <Icon name="parent" size={14} />
                {t("kimOynayapti")}
              </button>
            )}
            {/* Reyting kursga bog'liq emas — barcha kurslar yulduzi birga
                hisoblanadi, shuning uchun tugma bosh sahifada turadi. */}
            {/* Belgi "order" (pog'onali qator), kubok EMAS: kubok kurs
                ichida NISHONLAR degan ma'noni bildiradi va bitta belgi
                ikki xil joyga olib borsa, bola uni o'rganolmaydi. */}
            <button type="button" onClick={onReyting} title={t("reyting")}
              className="clay-press flex shrink-0 items-center gap-1.5 rounded-full bg-karta/70
                         px-2.5 py-1.5 text-[11.5px] text-ink-soft backdrop-blur-sm">
              <Icon name="order" size={14} className="text-brand-gold" />
              {t("reyting")}
            </button>
            {/* Hisob tugmasi — ism bilan.
                Kimning hisobida ekanini ko'rsatish shu yerda muhim: bir
                telefonda ota-ona ham, bola ham ochadi va "bu kimning
                yulduzlari?" degan savol doim tug'iladi. Ism kelmaguncha
                eski matn turadi. */}
            <button type="button" onClick={onSozlama} title={t("hisobSozlamalari")}
              className="clay-press flex min-w-0 items-center gap-1.5 rounded-full bg-karta/70
                         px-2.5 py-1.5 text-[11.5px] text-ink-soft backdrop-blur-sm">
              {bola ? (
                <span className="grid size-[17px] shrink-0 place-items-center rounded-full
                                 bg-track text-[10.5px] leading-none">
                  {bola.avatar || "🦊"}
                </span>
              ) : (
                <Icon name="pencil" size={14} className="shrink-0" />
              )}
              <span className="truncate">{hisob?.toliqIsm || t("hisobim")}</span>
            </button>
          </span>
        </div>
      </header>

      {/* ---- davom etish ----
          Ro'yxatdan OLDIN turadi va ro'yxat tartibini o'zgartirmaydi.
          Kurslarni joyidan surib, "oxirgisi" ni tepaga chiqarish ham
          mumkin edi, lekin unda ro'yxat har ochilganda boshqacha
          ko'rinardi — sinflar tartibi esa ota-ona uchun eng oson
          mo'ljal. Karta esa aniq bir savolga javob beradi: "kecha
          qayerda to'xtagan edim?" */}
      {oxirgi && davom && (
        <Davom c={oxirgi} keyingi={davom}
          onDavom={() => onDavom(oxirgi, davom.ui, davom.li)} />
      )}

      {/* ---- o'yinlar ----
          Kurslardan OLDIN turadi va bu ataylab. Kurslar rejali ish:
          ularga bola ota-onasi aytganda kiradi. O'yinga esa u O'ZI
          keladi — va aynan shu narsa uni ertaga ham qaytaradi. Karta
          pastda tursa, ro'yxatni oxirigacha surgan odamgina uni
          ko'rardi, ya'ni deyarli hech kim.

          Kartaning o'zi bitta va keng: sakkizta o'yin bu yerda
          ko'rsatilmaydi. Bosh sahifa TANLOV ekrani emas, u faqat
          "qayerga borasan?" degan savolga javob beradi. */}
      <OyinlarKarta on={onOyinlar} />

      {/* ---- do'st bilan bellashuv ----
          O'YINLAR ICHIDA EMAS va bu ataylab. Duel o'yin emas: unda
          ikkinchi odam bor, xabar boradi va natija ikkalasiga tegishli
          bo'ladi. Sakkizta o'yin qatoriga qo'yilganda u "to'qqizinchi
          o'yin" bo'lib ko'rinardi va o'sha yerda yo'qolib ketardi.

          Bosh sahifada, kurslardan OLDIN turadi: ilovani ochgan bola
          "do'stim meni chaqirganmi?" degan savolga birinchi ekranda
          javob olsin. */}
      <button type="button" onClick={onDuel}
        className="az-kirish tugma-3d mt-[clamp(10px,2vh,18px)] flex w-full items-center gap-3.5
                   rounded-clay bg-brand-orange p-[clamp(11px,2vh,14px)] text-left text-white
                   shadow-clay"
        style={kech(50)}>
        <span className="grid size-[clamp(40px,7vh,48px)] shrink-0 place-items-center rounded-2xl
                         bg-white/20 text-[clamp(20px,3.6vh,24px)]">
          ⚔️
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[16.5px] leading-tight">{t("duel")}</span>
          <span className="mt-0.5 block text-[12.5px] text-white/85">{t("duelIzoh")}</span>
        </span>
        <Icon name="chevron" size={18} className="shrink-0 text-white/80" />
      </button>

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

/**
 * "Oxirgi marta shu yerda edingiz" kartasi.
 *
 * Bosilganda kurs sahifasiga emas, DARSNING O'ZIGA olib boradi. Butun
 * kartaning ma'nosi shu: ilova ochilgandan darsgacha bitta bosish qoladi.
 */
function Davom({ c, keyingi, onDavom }: {
  c: Course;
  keyingi: { ui: number; li: number };
  onDavom: () => void;
}) {
  const U = c.units[keyingi.ui];
  // Dars nomining ikkinchi qismi — darslik betlari; kartada ortiqcha.
  const nom = kursMatn(U.lessons[keyingi.li].n).split(" · ")[0];

  return (
    <Reveal kech={40}>
      <div className="az-kirish mt-4 sm:mt-6" style={kech(40)}>
        <h2 className="mb-1.5 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
          {t("oxirgiMarta")}
        </h2>
        <button type="button" onClick={onDavom}
          className="tugma-3d az-yaltir flex w-full items-center gap-3 rounded-clay bg-brand-green
                     p-[clamp(11px,2vh,14px)] text-left text-white shadow-clay">
          <span className="grid size-[clamp(40px,7vh,48px)] shrink-0 place-items-center
                           rounded-[16px] bg-white/20">
            <Icon name={U.lessons[keyingi.li].ic} size={26} />
          </span>
          {/* Ikki qator: HARAKAT tepada, MANZIL pastda.
              Ilgari birinchi qatorda "Maktabgacha · Davom etish" turardi
              va telefonda u ikkiga bo'linib ketardi — natijada kartada
              uch qator matn bo'lib, "Davom etish" so'zi kurs nomining
              davomidek ko'rinardi. Endi harakat doim yolg'iz turadi. */}
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[16px] leading-tight">
              {t("davomEtish")}
            </span>
            <span className="mt-0.5 block truncate text-[12.5px] text-white/85">
              {kursMatn(c.title)} · {kursMatn(U.u)}
            </span>
            <span className="block truncate text-[12.5px] text-white/70">{nom}</span>
          </span>
          <Icon name="chevron" size={20} className="shrink-0 text-white/80" />
        </button>
      </div>
    </Reveal>
  );
}

/**
 * "Matematik o'yinlar" kartasi.
 *
 * Kurs kartalaridan ATAYLAB boshqacha ko'rinadi: siyoh rangli fon,
 * yon tomonda uchta o'yin belgisi. Agar u ham oq karta bo'lganda,
 * ro'yxatda "yana bitta kurs" bo'lib yo'qolib ketardi — holbuki bu
 * butunlay boshqa narsa: bu yerda dars yo'q, faqat rekord bor.
 *
 * Belgilar YON TOMONDA turadi va bosilmaydi. Ular ro'yxat emas,
 * ishora: "ichkarida bir nechta o'yin bor" degan gapni yozuvsiz aytadi.
 */
function OyinlarKarta({ on }: { on: () => void }) {
  return (
    <Reveal kech={50}>
      <div className="az-kirish mt-4 sm:mt-6" style={kech(50)}>
        <button type="button" onClick={on}
          className="tugma-3d az-yaltir flex w-full items-center gap-3 rounded-clay bg-brand-purple
                     p-3.5 text-left text-white shadow-clay">
          <span className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-white/20">
            <Icon name="puzzle" size={26} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[16px] leading-tight">
              {t("oyinlarBolim")}
            </span>
            <span className="mt-0.5 block text-[12.5px] leading-snug text-white/85">
              {t("oyinlarIzoh")}
            </span>
          </span>
          {/* 375px dan tor telefonda belgilar yashiriladi: u yerda
              yozuv uchun har piksel qimmat va uchta emoji qatorni
              ikkiga bo'lib yuborardi. */}
          <span aria-hidden className="hidden shrink-0 gap-1 text-[19px] min-[380px]:flex">
            <span>⚡</span><span>🎲</span><span>🧠</span>
          </span>
        </button>
      </div>
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
function KursKarta({ c, i, progressOf, onOpen }: {
  c: Course; i: number;
  progressOf: (c: Course) => Progress;
  onOpen: (c: Course) => void;
}) {
  const p = progressOf(c);
  const total = lessonCount(c);
  const done = Object.keys(p.done).length;
  const foiz = Math.round((done / total) * 100);
  const color = UNIT_COLORS[c.color];

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
        <span className={`relative grid size-12 shrink-0 place-items-center overflow-visible rounded-[16px] text-white sm:size-14 sm:rounded-[18px] ${color.bg}`}>
          <Icon name={c.ic} size={27} />
          {/* Ichki yorug'lik — tekis rangni hajmli qiladi */}
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/35 to-transparent" />
          {foiz === 100 && (
            <span className="absolute -right-1.5 -bottom-1.5 grid size-6 place-items-center rounded-full
                             bg-brand-green text-white ring-3 ring-karta">
              <Icon name="check" size={14} />
            </span>
          )}
        </span>

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
  const color = UNIT_COLORS[c.color];

  return (
    <Reveal kech={i * 90} className="h-full">
      <button type="button" onClick={() => onOpen(c)}
        className="tugma-3d flex h-full w-full flex-col rounded-clay bg-karta/95 p-3 text-left
                   shadow-clay backdrop-blur-sm sm:p-3.5"
        style={kech(110 + i * 70)}>
        <span className="flex w-full items-start gap-2">
          <span className={`relative grid size-11 shrink-0 place-items-center overflow-visible
                            rounded-[15px] text-white sm:size-12 ${color.bg}`}>
            <Icon name={c.ic} size={25} />
            <span className="pointer-events-none absolute inset-0 rounded-[inherit]
                             bg-gradient-to-b from-white/35 to-transparent" />
            {foiz === 100 && (
              <span className="absolute -right-1.5 -bottom-1.5 grid size-6 place-items-center rounded-full
                               bg-brand-green text-white ring-3 ring-karta">
                <Icon name="check" size={14} />
              </span>
            )}
          </span>
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

function Belgi({ ic, matn }: { ic: "star" | "map"; matn: string }) {
  return (
    <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-karta/70 px-2.5 py-1.5
                     text-[11.5px] text-ink-soft backdrop-blur-sm">
      <Icon name={ic} size={14} className={ic === "star" ? "text-brand-gold" : "text-brand-blue-d"} />
      {matn}
    </span>
  );
}
