import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { Logo } from "../components/Logo";
import { Reveal } from "../components/Reveal";
import { RoadMap } from "../components/RoadMap";
import { Yolboshchi } from "../components/Yolboshchi";
import { turKerakmi } from "../lib/tur";
import { UNIT_COLORS, keyingiDars, lessonId } from "../lib/types";
import type { Progress, Unit } from "../lib/types";
import type { Kunlik } from "../lib/progress";
import { bugungiSoni } from "../lib/takrorlash";
import { buyumTop } from "../lib/dokon";
import { TilTugma } from "../components/TilTugma";
import { Qaytish, ZanjirTiklash } from "../components/Qaytish";
import { useProgress } from "../lib/progress";
import { qaytish } from "../lib/zanjir";
import { qolganSoat, sinovBajarilgan } from "../lib/kunlikSinov";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";

interface Props {
  /** Kurs slug'i — xatolar daftari shu kurs bo'yicha filtrlanadi. */
  slug: string;
  title: string;
  /** Sarlavha ostidagi bir qatorlik izoh — "Darslik bo'yicha to'liq kurs". */
  izoh: string;
  units: Unit[];
  progress: Progress;
  /** Bugungi maqsad holati. */
  kunlik: Kunlik;
  /** Bir kunda nechta savol yechish kerak. */
  maqsad: number;
  onStart: (ui: number, li: number) => void;
  /** Xatolar daftaridagi takrorlash darsini ochadi. */
  onDaftar: () => void;
  /** Kunlik sinovni ochadi — faqat bugun. */
  onSinov: () => void;
  onOtaOna: () => void;
  /**
   * 7–11-sinf uchun uchta qo'shimcha ekran. Quyi sinflarda ular
   * BERILMAYDI (`undefined`) va butun blok umuman chizilmaydi —
   * 2-sinf bolasiga "blok test" ham, "formulalar" ham begona.
   */
  onBlok?: () => void;
  onHisobot?: () => void;
  onFormulalar?: () => void;
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-full bg-karta px-3 py-1 text-[14px] shadow-clay-sm ${className}`}>
      {children}
    </div>
  );
}

/** Bo'lim taraqqiyoti — halqa ko'rinishida. */
function Ring({ done, total, color }: { done: number; total: number; color: string }) {
  const r = 17;
  const C = 2 * Math.PI * r;
  const full = done === total;
  return (
    <div className="relative grid size-[42px] shrink-0 place-items-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={r} fill="none" stroke="var(--color-track)" strokeWidth="5" />
        <circle
          cx="21" cy="21" r={r} fill="none"
          stroke={full ? "var(--color-brand-green)" : color}
          strokeWidth="5" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - done / total)}
        />
      </svg>
      <span className="relative text-[11px] leading-none text-ink-soft">
        {full ? <Icon name="check" size={16} className="text-brand-green-d" /> : `${done}/${total}`}
      </span>
    </div>
  );
}

export function Home({
  slug, title, izoh, units, progress, kunlik, maqsad,
  onStart, onDaftar, onSinov, onOtaOna, onBlok, onHisobot, onFormulalar,
}: Props) {
  // Zanjir tiklash va jami tanga kontekstdan keladi: ular BUTUN hisobga
  // tegishli, bitta kursga emas.
  const { jamiTanga, tiklash, zanjirniTikla } = useProgress();
  const totals = useMemo(() => {
    const total = units.reduce((s, U) => s + U.lessons.length, 0);
    const done = units.reduce(
      (s, U, ui) => s + U.lessons.filter((_, li) => progress.done[lessonId(ui, li)]).length, 0);
    return { total, done };
  }, [units, progress]);

  // Bola turgan joy: "Davom etish" tugmasi ham, ochiq turadigan bob ham
  // shundan kelib chiqadi.
  const keyingi = useMemo(() => keyingiDars(units, progress), [units, progress]);
  const currentUnit = keyingi?.ui ?? 0;

  const [open, setOpen] = useState<number>(currentUnit);

  // Daftar `localStorage` da turadi, React holatida emas. Uni bir marta
  // o'qish yetarli: darsdan qaytilganda marshrut almashadi va bu ekran
  // butunlay qaytadan yasaladi, ya'ni hisob o'z-o'zidan yangilanadi.
  const daftarSoni = useMemo(() => bugungiSoni(slug), [slug]);

  const kiygan = progress.kiygan ? buyumTop(progress.kiygan) : undefined;

  // Necha kundan beri ko'rinmagan. Dars tugashi bilan `kunlik.sana`
  // bugunga o'tadi va karta o'zi yo'qoladi — alohida yopish kerak emas.
  const qaytganKun = qaytish(kunlik);

  /**
   * Yo'lboshchi — birinchi tashrifda ekranni tanishtiradi.
   *
   * Kechikish SHART. Ekran ochilishida kartalar `az-kirish` va `Reveal`
   * bilan pastdan ko'tarilib chiqadi; o'sha paytda o'lchansa, yorug' dog'
   * elementning HALI YETIB KELMAGAN joyiga qo'yilardi va sayohat qiyshiq
   * boshlanardi.
   *
   * Kurs sahifasida boshlanadi, bosh sahifada emas: tanishtiradigan narsa
   * aynan shu yerda: kurslar ro'yxati o'zini o'zi tushuntiradi.
   */
  const [yolboshchi, setYolboshchi] = useState(false);
  useEffect(() => {
    if (!turKerakmi()) return;
    const t = setTimeout(() => setYolboshchi(true), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    /* Kenglik ekranga qarab o'sadi, ammo cheklangan: dars yo'li ilon izi
       bo'lib buriladi va juda keng ustunda uning burilishlari yassilanib,
       "yo'l" o'rniga tarqoq nuqtalarga aylanadi. */
    <div className="mx-auto w-full max-w-[430px] px-3.5 pt-3 pb-4 sm:max-w-[560px] sm:px-6">
      {/* ---- yuqori panel ----
          Bu yerda endi faqat "menda nima bor" turadi: yulduz va tanga.
          O'tish tugmalari pastdagi panelga ko'chdi. Sabab: ular bir xil
          kulrang doiralar edi va 1-sinf bolasi ular orasidan keraklisini
          BELGIGA qarab tanlashi kerak bo'lardi. Pastda esa har birining
          yozuvi bor.

          Ota-ona tugmasi ataylab pastga TUSHMADI: u bolaga emas, kattaga
          mo'ljallangan va bolalar qatorida turgani uchun tez-tez bexosdan
          bosilardi. Yuqorida, chetda — ko'rinadi, lekin yo'lda turmaydi.

          "Kurslar ro'yxati" tugmasi ham ketdi: uning ishini pastdagi
          paneldagi "Bosh" bajaradi va ikkita bir xil yo'l bitta ekranda
          turishi keraksiz. */}
      <div className="flex items-center gap-2">
        {/* `data-tur` — yo'lboshchi shu atributlar bo'yicha nishonni topadi
            (components/Yolboshchi.tsx). Ekran o'zgarsa, atribut ko'chadi. */}
        <span data-tur="hisob" className="flex items-center gap-2 rounded-full">
          <Pill><Icon name="star" size={17} className="text-brand-gold" />{progress.stars}</Pill>
          <Pill><Icon name="coin" size={17} className="text-brand-orange-d" />{progress.coins}</Pill>
        </span>
        {/* Til shu yerda ham turadi: kurs sahifasi ilova ochilganda
            ko'pincha BIRINCHI ekran bo'ladi (bosh sahifadagi "Davom
            etish" to'g'ridan-to'g'ri shu yerga tushiradi), ya'ni
            noto'g'ri tilni ko'rgan odam bosh sahifaga qaytishi shart
            emas. */}
        <TilTugma className="ml-auto" />
        <button type="button" onClick={onOtaOna} title={t("otaOnaPaneli")}
          className="grid size-10 place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm clay-press">
          <Icon name="parent" size={18} />
        </button>
      </div>

      {/* ---- sarlavha ---- */}
      <div className="az-kirish mt-4 flex flex-col items-center text-center">
        <span className="relative">
          <Logo size={46} className="drop-shadow-[0_6px_12px_rgb(58_46_34/0.22)]" />
          {kiygan && (
            <span className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[20px] leading-none">
              {kiygan.belgi}
            </span>
          )}
        </span>
        {/* Sarlavha ekranga qarab o'sadi: uzun kurs nomi ("Математика
            4 класс") 320px li telefonda 26px da ikki qatorga bo'linib,
            ostidagi hamma narsani pastga surardi. */}
        <h1 className="mt-1.5 text-[clamp(20px,5.8vw,24px)] leading-tight">{kursMatn(title)}</h1>
        <div className="mt-0.5 text-[12.5px] text-ink-soft">
          {izoh} · {t("bolimSoni", { n: units.length })}
        </div>
      </div>

      {/* ---- umumiy taraqqiyot ---- */}
      <div className="mt-3">
        <div className="mb-1 text-center text-[12.5px] text-ink-soft">
          {t("darsTugallandi", { done: totals.done, jami: totals.total })}
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-karta/55">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-gold transition-[width] duration-500"
            style={{ width: `${Math.max(2, (totals.done / totals.total) * 100)}%` }}
          />
        </div>
      </div>

      {/* ---- davom etish ----
          Ekrandagi ENG KATTA tugma va u ataylab shu yerda — ro'yxatdan
          oldin. Ilgari darsga yetish uchun bob ochilib, yo'ldan to'g'ri
          tugun topilishi kerak edi; endi bola ilovani ochib, bir bosishda
          o'zi to'xtagan joydan davom etadi. Ro'yxat esa quyida turaveradi:
          boshqa darsni tanlamoqchi bo'lganlar uchun. */}
      {keyingi && (
        <Davom units={units} keyingi={keyingi} boshlanmagan={totals.done === 0}
          onStart={onStart} />
      )}

      {/* ---- qaytish va zanjir ----
          Ikkalasi kunlik maqsaddan OLDIN turadi va bu ataylab: uzilgan
          zanjirni ko'rgan bola avval "hali saqlash mumkin" degan
          javobni olishi kerak, keyin bugungi maqsadni. Teskari tartibda
          u avval nolga tushgan zanjirni ko'rib, ilovani yopardi. */}
      {tiklash && (
        <ZanjirTiklash taklif={tiklash} jamiTanga={jamiTanga} onTikla={zanjirniTikla} />
      )}
      {!tiklash && qaytganKun > 0 && <Qaytish kun={qaytganKun} />}

      {/* ---- kunlik maqsad ---- */}
      <div data-tur="maqsad">
        <KunlikMaqsad kunlik={kunlik} maqsad={maqsad} />
      </div>

      {/* ---- bugungi sinov ----
          Kunlik maqsaddan KEYIN: maqsad majburiy qism, sinov esa
          qo'shimcha. Bajarilganda ham ko'rinib turadi — "bugun buni
          qildim" degan belgi mukofotning bir qismi. */}
      <Sinov bajarildi={sinovBajarilgan(slug)} onSinov={onSinov} />

      {/* ---- xatolar daftari ----
          Faqat takrorlash vaqti kelgan savol bo'lsa ko'rinadi. Doim
          tursa, bola uni fon deb qabul qilib, e'tibor bermay qo'yardi. */}
      {daftarSoni > 0 && (
        <button type="button" onClick={onDaftar}
          className="tugma-3d mt-2.5 flex w-full items-center gap-3 rounded-clay bg-karta p-3.5
                     text-left shadow-clay-sm">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-red/15 text-brand-red">
            <Icon name="repeat" size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] leading-tight">{t("xatolarDaftari")}</span>
            <span className="block text-[12.5px] text-ink-soft">
              {t("daftarKutyapti", { n: daftarSoni })}
            </span>
          </span>
          <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
        </button>
      )}

      {/* ---- imtihonga tayyorgarlik ----
          Faqat 7–11-sinfda. Xatolar daftaridan KEYIN turadi: daftar
          bugungi ish, bu esa uzoq muddatli tayyorgarlik.

          Uchtasi bitta blokda va bu ataylab — ular bitta savolga
          xizmat qiladi: "imtihonga qanday tayyorlanaman?". Alohida
          tarqatib yuborilsa, har biri tasodifiy tugmaga o'xshab
          qolardi. */}
      {onBlok && onHisobot && onFormulalar && (
        <div className="mt-4 space-y-2">
          <TayyorgarlikTugma ic="clock" rang="bg-brand-purple" nom={t("blokTugma")}
            izoh={t("blokTugmaIzoh")} on={onBlok} />
          <TayyorgarlikTugma ic="chart" rang="bg-brand-blue" nom={t("hisobotTugma")}
            izoh={t("hisobotTugmaIzoh")} on={onHisobot} />
          <TayyorgarlikTugma ic="sqrt" rang="bg-brand-orange" nom={t("formulaTugma")}
            izoh={t("formulaTugmaIzoh")} on={onFormulalar} />
        </div>
      )}

      {/* ---- boblar va yo'l ---- */}
      <div className="mt-4 space-y-2.5">
        {units.map((U, ui) => {
          const done = U.lessons.filter((_, li) => progress.done[lessonId(ui, li)]).length;
          const color = UNIT_COLORS[U.color];
          const isOpen = open === ui;
          return (
            <Reveal key={ui} kech={Math.min(ui, 4) * 60}>
            <section className="az-shisha az-bob overflow-hidden rounded-clay"
              style={{ "--az-kech": `${80 + ui * 45}ms` } as CSSProperties}>
              {/* Yo'lboshchi bobning faqat SARLAVHASINI yoritadi, butun
                  bo'limni emas: ochilgan bob ichida dars yo'li bor va u
                  ekrandan uzun. Yorug' dog' butun ekranni qoplasa,
                  "mana bu" degan ishora yo'qoladi. */}
              <button
                type="button"
                data-tur={ui === 0 ? "boblar" : undefined}
                onClick={() => setOpen(isOpen ? -1 : ui)}
                /* `az-qavariq` — yuqori chekkasida yorug'lik, pastida ichki
                   soya. Manzara ustida tekis karta "yopishtirilgan qog'oz"dek
                   ko'rinardi; bu ikkisi uni yuzadan ko'targandek qiladi. */
                className="az-qavariq flex w-full items-center gap-3 bg-karta p-3 text-left shadow-clay-sm clay-press"
              >
                <span className={`grid size-11 shrink-0 place-items-center rounded-[14px] text-white ${color.bg}`}>
                  <Icon name={U.ic} size={24} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[14.5px] leading-tight">{kursMatn(U.u)}</span>
                  <span className="block text-[11.5px] text-ink-dim">
                    {t("bobDars", { n: U.lessons.length })}
                    {done ? t("bobTugadi", { n: done }) : ""}
                  </span>
                </span>
                <Ring done={done} total={U.lessons.length} color={color.road} />
                <Icon name="chevron" size={18}
                  className={`shrink-0 text-ink-dim transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>

              {isOpen && (
                <div className="px-3 pt-3 pb-4">
                  <RoadMap units={units} unitIndex={ui} progress={progress} onStart={onStart} />
                </div>
              )}
            </section>
            </Reveal>
          );
        })}
      </div>

      {yolboshchi && <Yolboshchi onTugadi={() => setYolboshchi(false)} />}
    </div>
  );
}

/**
 * Bugungi sinov kartasi.
 *
 * Yozuvda QOLGAN VAQT turadi va butun ma'no shunda: sinov yarim tunda
 * yopiladi va ertaga boshqasi bo'ladi. Muddatsiz taklif "keyinroq"
 * degan javobni oladi, muddatli esa bugun bosiladi.
 */
/**
 * Tayyorgarlik bloki tugmasi — uchalasi bir xil qolipda.
 *
 * Kunlik sinov tugmasidan PASTROQ va xiraroq: u bugungi ish va
 * har kuni bosiladi, bular esa haftada bir-ikki marta. Bir xil
 * balandlikda tursa, kunlik odat shovqinda yo'qolardi.
 */
function TayyorgarlikTugma({ ic, rang, nom, izoh, on }: {
  ic: IconName; rang: string; nom: string; izoh: string; on: () => void;
}) {
  return (
    <button type="button" onClick={on}
      className="tugma-3d flex w-full items-center gap-3 rounded-clay bg-karta p-3 text-left shadow-clay-sm">
      <span className={`grid size-9 shrink-0 place-items-center rounded-2xl text-white ${rang}`}>
        <Icon name={ic} size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[14px] leading-tight">{nom}</span>
        <span className="mt-0.5 block truncate text-[11.5px] text-ink-soft">{izoh}</span>
      </span>
      <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
    </button>
  );
}

function Sinov({ bajarildi, onSinov }: { bajarildi: boolean; onSinov: () => void }) {
  if (bajarildi) {
    return (
      <div className="mt-2.5 flex items-center gap-3 rounded-clay bg-karta/70 p-3.5 shadow-clay-sm">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl
                         bg-brand-green/15 text-brand-green-d">
          <Icon name="check" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[14px] leading-tight text-ink-soft">
            {t("sinovBajarildi")}
          </span>
          <span className="block text-[12px] text-ink-dim">{t("sinovErtaga")}</span>
        </span>
      </div>
    );
  }

  return (
    <button type="button" onClick={onSinov}
      className="tugma-3d az-yaltir mt-2.5 flex w-full items-center gap-3 rounded-clay
                 bg-brand-gold p-3.5 text-left text-white shadow-clay">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/25">
        <Icon name="flame" size={21} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] leading-tight">
          {t("sinovSarlavha")}
        </span>
        <span className="mt-0.5 block truncate text-[12px] text-white/85">
          {t("sinovIzoh")}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-white/25 px-2.5 py-1 text-[11.5px] whitespace-nowrap">
        {t("sinovQolgan", { n: qolganSoat() })}
      </span>
    </button>
  );
}

/**
 * "Davom etish" — bola to'xtagan darsga bir bosishda olib boradigan tugma.
 *
 * Yozuv ikki qavat: harakat ("Davom etish") va MANZIL ("2-bo'lim ·
 * Qo'shish"). Faqat harakatni yozsak, bola qayerga tushishini bilmay
 * bosardi; faqat dars nomini yozsak, bu tugma ekanini payqamasdi.
 *
 * Hali bitta ham dars tugallanmagan bo'lsa yozuv "Boshlash" bo'ladi:
 * hech narsa qilmagan bolaga "davom eting" deyish g'alati eshitiladi.
 */
function Davom({ units, keyingi, boshlanmagan, onStart }: {
  units: Unit[];
  keyingi: { ui: number; li: number };
  boshlanmagan: boolean;
  onStart: (ui: number, li: number) => void;
}) {
  const U = units[keyingi.ui];
  const L = U.lessons[keyingi.li];
  // Dars nomining ikkinchi qismi — darslik betlari ("Qo'shish · 42–43-bet").
  // Tugmada faqat nomi turadi, betlar bu yerda ortiqcha shovqin.
  const nom = kursMatn(L.n).split(" · ")[0];

  return (
    <button
      type="button"
      onClick={() => onStart(keyingi.ui, keyingi.li)}
      data-tur="davom"
      className="tugma-3d az-yaltir mt-3.5 flex w-full items-center gap-3 rounded-clay
                 bg-brand-green p-3.5 text-left text-white shadow-clay"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/20">
        <Icon name={L.ic} size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[16px] leading-tight">
          {boshlanmagan ? t("boshlash") : t("davomEtish")}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-white/85">
          {kursMatn(U.u)} · {nom}
        </span>
      </span>
      <Icon name="chevron" size={20} className="shrink-0 text-white/80" />
    </button>
  );
}

/**
 * Kunlik maqsad.
 *
 * Ikki ko'rsatkich bor va ular boshqa-boshqa narsani aytadi:
 *   savollar — BUGUN nechta savol yechilgani (yarim tunda noldan boshlanadi);
 *   kunlar   — KETMA-KET necha kun mashq qilingani (zanjir).
 * Zanjir bolani har kuni qaytishga undaydi, shuning uchun u maqsad
 * bajarilgandan keyin ham ko'rinib turadi.
 */
function KunlikMaqsad({ kunlik, maqsad }: { kunlik: Kunlik; maqsad: number }) {
  const foiz = Math.min(100, Math.round((kunlik.savollar / maqsad) * 100));
  const bajarildi = kunlik.savollar >= maqsad;

  return (
    <div className="mt-3 flex items-center gap-3 rounded-clay bg-[linear-gradient(135deg,var(--az-maqsad-1),var(--az-maqsad-2))] p-3.5 shadow-clay-sm">
      <Icon name={bajarildi ? "trophy" : "flame"} size={24}
        className={`shrink-0 ${bajarildi ? "text-brand-gold" : "text-[#e2571f]"}`} />

      <div className="min-w-0 flex-1">
        <div className="font-display text-[14.5px] leading-tight">
          {bajarildi ? t("maqsadBajarildi") : t("kunlikMaqsad")}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-black/15">
            <span className="block h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-gold
                             transition-[width] duration-500"
              style={{ width: `${foiz}%` }} />
          </span>
          <span className="text-[12px] whitespace-nowrap text-ink-soft">
            {Math.min(kunlik.savollar, maqsad)}/{maqsad}
          </span>
        </div>
      </div>

      <div className="shrink-0 rounded-xl bg-karta/70 px-3 py-1.5 text-center">
        <div className="font-display text-[15px] leading-none">{kunlik.kunlar}</div>
        <div className="text-[10px] text-ink-dim">{t("kun")}</div>
      </div>
    </div>
  );
}
