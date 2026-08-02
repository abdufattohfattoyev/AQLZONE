/**
 * Menyu — ilovaning TO'LIQ ro'yxati.
 *
 * ─────────────────────── nega u kerak bo'ldi ───────────────────────
 *
 * Pastdagi panelda oltita tugma turardi va ularning hammasi bir xil
 * ko'rinardi: yozuvsiz belgi, izohsiz. Ilovaga birinchi marta kirgan
 * odam u yerdan faqat nomlarni o'qirdi — "Nishonlar", "Do'kon" — va
 * ularning ORTIDA nima borligini bilmasdi. O'yinlar esa panelda umuman
 * yo'q edi: ular faqat bosh sahifadagi bitta kartadan ochilardi, ya'ni
 * boshqa ekranga o'tgan odam ularni butunlay yo'qotardi.
 *
 * Shu sabab menyu ro'yxat emas, IZOHLI ro'yxat: har satrning ostida
 * bir qatorlik javob turadi — "u yerda nima bo'ladi". Ro'yxat esa
 * bo'limlarga bo'lingan (ta'lim, o'yin, yutuq, hisob), chunki o'n
 * to'rtta teng satr ham xuddi oltita teng tugmadek chalkash bo'lardi.
 *
 * ENG PASTDA — "ball qanday yig'iladi". Bu ilovaning eng ko'p
 * so'raladigan savoli va javobi ilgari hech qayerda yozilmagan edi:
 * yulduz faqat darsdan, tanga esa darsdan ham, o'yindan ham keladi va
 * bu farqni faqat uzoq o'ynagan odam o'zi sezib olardi.
 *
 * O'NG TOMONDAN chiqadi — uni ochadigan tugma ham panelning eng
 * o'ngida turadi, ya'ni menyu bosilgan joydan "o'sib chiqadi".
 */
import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { TilTugma } from "./TilTugma";
import { OYINLAR } from "../lib/oyin";
import { UNIT_COLORS } from "../lib/types";
import type { Course } from "../lib/curriculum";
import { profilSoni } from "../lib/api";
import { useProgress } from "../lib/progress";
import { nishonlar, olingan } from "../lib/nishon";
import { sinovBajarilgan } from "../lib/kunlikSinov";
import { bugungiSoni } from "../lib/takrorlash";
import {
  yolDaftar, yolDokon, yolDuel, yolKurs, yolKurslar, yolMaydon, yolNishon,
  yolOtaOna, yolOyin, yolOyinlar, yolReyting, yolSinov, yolSozlama,
} from "../lib/yollar";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { tebrat } from "../lib/qobiq";

interface Props {
  ochiq: boolean;
  onYop: () => void;
  /**
   * Kursga bog'liq satrlar qaysi kursni ochadi. Panel bilan BIR XIL
   * qoidaga bo'ysunadi (manzildagi kurs → oxirgisi → birinchisi) va
   * shuning uchun tayyor holda beriladi: ikki joyda ikki xil hisoblansa,
   * menyudagi "Darslar" panel tugmasidan boshqa kursni ochib qo'yardi.
   */
  kurs: Course;
}

export function Menyu({ ochiq, onYop, kurs }: Props) {
  const nav = useNavigate();
  const { progressOf, kunlik, jamiTanga } = useProgress();

  const p = progressOf(kurs);
  const yangiNishon = useMemo(
    () => olingan(nishonlar({
      progress: p, kunlik, units: kurs.units, savollar: p.savollar ?? 0,
    })) > 0,
    [p, kunlik, kurs],
  );

  /**
   * Menyu ochiq turganda sahifaning o'zi surilmasin.
   *
   * Busiz barmoq menyu chetiga tushsa, orqadagi ro'yxat siljib ketardi
   * va menyu yopilgach odam butunlay boshqa joyda turgan bo'lardi.
   */
  useEffect(() => {
    if (!ochiq) return;
    const eski = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = eski; };
  }, [ochiq]);

  /** Escape — kompyuterda menyuni yopishning eng tabiiy usuli. */
  useEffect(() => {
    if (!ochiq) return;
    const bosildi = (e: KeyboardEvent) => { if (e.key === "Escape") onYop(); };
    window.addEventListener("keydown", bosildi);
    return () => window.removeEventListener("keydown", bosildi);
  }, [ochiq, onYop]);

  /** Har satr: yopadi, so'ng o'tadi. Ochiq qolgan menyu yangi ekranni bekitardi. */
  const yur = (yol: string) => () => {
    tebrat("tanlov");
    onYop();
    nav(yol);
  };

  const kopBola = profilSoni() > 1;
  const sinovBor = !sinovBajarilgan(kurs.slug);
  const daftarSoni = bugungiSoni(kurs.slug);

  return (
    <>
      {/* Xira fon. Bosilganda yopiladi — menyudan chiqishning eng
          ko'p ishlatiladigan yo'li aynan shu, "Yopish" tugmasi emas. */}
      <div
        aria-hidden
        onClick={onYop}
        className={`fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-200
                    ${ochiq ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("menyu")}
        /* `inert` — yopiq menyu klaviatura va ekran o'quvchi yo'lidan
           butunlay chiqadi. `visibility: hidden` ham shu ishni qilardi,
           lekin u siljish animatsiyasini buzardi: ko'rinmas element
           uchun brauzer o'tishni o'ynatmaydi va menyu keyingi safar
           o'z joyiga qaytmay, ekran chetida qotib qolardi. */
        inert={!ochiq}
        /* Siljish INLINE uslubda beriladi, klass bilan emas. Tailwind
           buni `translate` xossasi orqali qiladi va u yerda qiymat
           o'tish o'rtasida qotib qolardi — element ochilgan holatda ham
           ekrandan tashqarida turaverardi. */
        style={{ transform: ochiq ? "translateX(0)" : "translateX(100%)" }}
        className="fixed top-0 right-0 z-50 flex h-full w-[min(88vw,360px)] flex-col
                   bg-sahna shadow-clay transition-transform duration-300 ease-out"
      >
        {/* ---- sarlavha ----
            Yopiq holatda ham DOMda turadi, shuning uchun `pt` xavfsiz
            zonani hisobga oladi: Telegramda menyu tepasi sarlavha
            ostidan boshlanadi. */}
        <header className="flex shrink-0 items-center gap-3 px-4 pt-[calc(0.75rem+var(--az-tepa,0px))] pb-2">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[17px] leading-tight">{t("menyu")}</h2>
            {/* Izoh past ekranda YASHIRILADI: u bir martalik tushuntirish
                va uni ikkinchi marta o'qiydigan odam yo'q, o'sha 18px
                esa ro'yxatning bir satriga yetadi. */}
            <p className="mt-0.5 hidden text-[11.5px] leading-snug text-ink-soft
                          [@media(min-height:700px)]:block">
              {t("menyuIzoh")}
            </p>
          </div>
          <button type="button" onClick={onYop} title={t("yopish")}
            className="clay-press grid size-9 shrink-0 place-items-center rounded-full bg-karta
                       text-ink-soft shadow-clay-sm">
            <Icon name="close" size={18} />
          </button>
        </header>

        {/* ---- hisob belgilari ----
            Uchta son: yulduz, tanga, zanjir. Menyuning eng tepasida
            turadi, chunki pastdagi "ball qanday yig'iladi" bo'limi
            aynan shu uchtasini tushuntiradi — savol va javob bitta
            ekranda bo'lsin. */}
        <div className="flex shrink-0 gap-1.5 px-4 pb-2">
          <Son ic="star" rang="text-brand-gold" n={p.stars} nom={t("menyuBallYulduz")} />
          <Son ic="coin" rang="text-brand-gold" n={jamiTanga} nom={t("menyuBallTanga")} />
          <Son ic="flame" rang="text-brand-orange" n={kunlik.kunlar} nom={t("menyuBallZanjir")} />
        </div>

        {/* Ro'yxat uzun va SURILADI. Sarlavha bilan belgilar esa
            joyida qotib turadi: menyuni pastigacha surgan odam ham
            "Yopish" tugmasini yo'qotmasin. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4
                        pb-[calc(1rem+var(--az-past))]">
          {/* ======================= ta'lim ======================= */}
          <Bolim>{t("menyuTalim")}</Bolim>

          <Karta>
            <Satr ic="map" rang="green" nom={kursMatn(kurs.title)}
              izoh={t("menyuDarslarIzoh")} on={yur(yolKurs(kurs))} />
            <Satr ic="home" rang="blue" nom={t("tabBosh")}
              izoh={t("menyuKurslarIzoh")} on={yur(yolKurslar())} />
            {/* Kunlik sinov BUGUN bajarilgan bo'lsa satr ham shuni
                aytadi va bosilmaydi: "6 ta savol" deb turgan, lekin
                bosilganda kurs sahifasiga qaytarib yuboradigan satr
                buzuq tuyulardi (`App.tsx` da o'sha qaytarish bor). */}
            <Satr ic="flame" rang="orange" nom={t("sinovSarlavha")}
              izoh={sinovBor ? t("menyuSinovIzoh") : t("sinovBajarildi")}
              on={sinovBor ? yur(yolSinov(kurs)) : undefined}
              nuqta={sinovBor} />
            {/* Xatolar daftari bo'sh bo'lsa ham ko'rinadi: odam
                "bunday narsa bor ekan" deb bilib qo'yishi kerak.
                Bosilmaydi, chunki bo'sh daftar darrov qaytarib yuboradi. */}
            <Satr ic="repeat" rang="purple" nom={t("xatolarDaftari")}
              izoh={daftarSoni > 0
                ? t("daftarKutyapti", { n: daftarSoni })
                : t("menyuDaftarIzoh")}
              on={daftarSoni > 0 ? yur(yolDaftar(kurs)) : undefined} />
          </Karta>

          {/* ==================== o'yin va duel ==================== */}
          <Bolim>{t("menyuOyinBolim")}</Bolim>

          <Karta>
            <Satr ic="clock" rang="green" nom={t("maydon")}
              izoh={t("menyuMaydonIzoh")} on={yur(yolMaydon())} />
            <Satr ic="flame" rang="orange" nom={t("duel")}
              izoh={t("menyuDuelIzoh")} on={yur(yolDuel())} />
            <Satr ic="puzzle" rang="purple" nom={t("oyinlarBolim")}
              izoh={t("menyuOyinlarIzoh")} on={yur(yolOyinlar())} />

            {/* Sakkizta o'yin SHU KARTANING ichida, chiziq ostida.
                Ular alohida bo'lim emas — "Matematik o'yinlar" satrining
                ichida nima borligini ochib beradi.

                Chip KICHIK va ikki ustunda: ular ro'yxatning davomi
                emas, uning ichki tafsiloti. Katta satr bo'lganda
                sakkiztasi menyuni yolg'iz o'zi to'ldirib yuborardi. */}
            <div className="px-3 py-2">
              <p className="mb-1 ml-0.5 text-[10px] tracking-wider text-ink-soft/80 uppercase">
                {t("menyuBarchaOyin")}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {OYINLAR.map((o) => (
                  <button key={o.id} type="button" onClick={yur(yolOyin(o.id))} title={t(o.nom)}
                    style={{ backgroundColor: `${UNIT_COLORS[o.rang].road}14` }}
                    className="clay-press flex items-center gap-1.5 rounded-xl px-2 py-1 text-left">
                    <span aria-hidden className="shrink-0 text-[15px] leading-none">{o.emoji}</span>
                    {/* Nom KESILMAYDI, ikki qatorga o'raladi. Ruschada
                        ("Последовательность") u chipdan uch barobar uzun
                        va `truncate` bo'lganda "Послед…" bo'lib qolardi —
                        ya'ni o'yin nomi umuman o'qilmasdi.

                        `break-words` SHART: o'sha so'z bo'linmasa, u
                        bitta uzun bo'lak bo'lib chipdan chiqib ketardi
                        va qo'shni ustunning ustiga chiqardi. */}
                    <span className="min-w-0 line-clamp-2 hyphens-auto break-words text-[11px]
                                     leading-tight text-ink">
                      {t(o.nom)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Karta>

          {/* ======================= yutuqlar ======================= */}
          <Bolim>{t("menyuYutuq")}</Bolim>

          <Karta>
            <Satr ic="trophy" rang="gold" nom={t("nishonlar")}
              izoh={t("menyuNishonIzoh")} on={yur(yolNishon(kurs))} nuqta={yangiNishon} />
            <Satr ic="palette" rang="blue" nom={t("tabDokon")}
              izoh={t("menyuDokonIzoh")} on={yur(yolDokon(kurs))} />
            <Satr ic="order" rang="gold" nom={t("reyting")}
              izoh={t("menyuReytingIzoh")} on={yur(yolReyting())} />
          </Karta>

          {/* ======================== hisob ======================== */}
          <Bolim>{t("menyuHisobBolim")}</Bolim>

          <Karta>
            <Satr ic="parent" rang="green" nom={t("otaOnaPaneli")}
              izoh={t("menyuOtaOnaIzoh")} on={yur(yolOtaOna(kurs))} />
            <Satr ic="pencil" rang="blue" nom={t("hisobSozlamalari")}
              izoh={t("menyuSozlamaIzoh")} on={yur(yolSozlama())} />
            {/* Profil almashtirish faqat IKKI va undan ko'p bola bo'lganda
                ma'noli — bosh sahifadagi tugma bilan bir xil qoida. */}
            {kopBola && (
              <Satr ic="parent" rang="purple" nom={t("kimOynayapti")}
                izoh={t("menyuProfilIzoh")} on={yur("/profillar")} />
            )}

          {/* Til — yagona satr, u O'ZI ish bajaradi.
              Boshqa ekranga olib bormaydi, shuning uchun tugma ham
              emas: o'ng tomonda UZ|RA almashtirgichning o'zi turadi. */}
            <div className="flex items-center gap-2.5 px-3 py-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-track text-ink-soft">
                <Icon name="ovoz" size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[13px] leading-tight">{t("tilSarlavha")}</span>
                <span className="mt-px block truncate text-[11px] leading-snug text-ink-soft">
                  {t("menyuTilIzoh")}
                </span>
              </span>
              <TilTugma className="shrink-0" />
            </div>
          </Karta>

          {/* ================ ball qanday yig'iladi ================
              YOPIQ turadi va bosilganda ochiladi.

              Bu to'rt qoida menyuning eng uzun bo'lagi — ochiq holda u
              yolg'iz o'zi butun ekranni egallardi va har safar menyu
              ochgan odam ro'yxatni ko'rish uchun uni surib o'tishga
              majbur bo'lardi. Savol esa bir marta beriladi: javobni
              bir marta o'qigan odam uni qaytadan o'qimaydi. */}
          <details className="group mt-3.5 overflow-hidden rounded-clay bg-karta shadow-clay-sm">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5
                                marker:hidden">
              <span aria-hidden className="text-[14px] leading-none">💡</span>
              <span className="flex-1 font-display text-[12.5px] leading-tight">
                {t("menyuBall")}
              </span>
              <Icon name="chevron" size={14}
                className="text-ink-dim transition-transform group-open:rotate-90" />
            </summary>
            <div className="border-t border-track px-3 py-2.5">
              <Qoida belgi="⭐" nom={t("menyuBallYulduz")} izoh={t("menyuBallYulduzIzoh")} />
              <Qoida belgi="🪙" nom={t("menyuBallTanga")} izoh={t("menyuBallTangaIzoh")} />
              <Qoida belgi="🔥" nom={t("menyuBallZanjir")} izoh={t("menyuBallZanjirIzoh")} />
              <Qoida belgi="🏆" nom={t("menyuBallRekord")} izoh={t("menyuBallRekordIzoh")} />
            </div>
          </details>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Bolim({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-3.5 mb-1 ml-1 text-[10px] tracking-widest text-ink-soft uppercase first:mt-0.5">
      {children}
    </h3>
  );
}

/**
 * Bo'limning kartasi — ichidagi satrlar bir butun bo'lib turadi.
 *
 * ─────────────────── NEGA KERAK BO'LDI ───────────────────
 *
 * Ilgari o'n to'rtta satr fon ustida yakka-yakka turardi va menyu
 * bitta uzun oqim bo'lib ko'rinardi: qaysi satr qaysi bo'limga
 * tegishli ekani faqat kichkina kulrang sarlavhadan bilinardi.
 *
 * Karta buni ko'z bilan hal qiladi: to'rtta bo'lak sanaladi, o'n
 * to'rtta satr emas.
 *
 * ─────────────────── NEGA SOYA, NEGA FON EMAS ───────────────────
 *
 * Ko'k mavzuda `--color-karta` ham, `--color-sahna` ham OQ (`#ffffff`)
 * — ya'ni "oq karta" oq fonda umuman ko'rinmasdi. Shuning uchun
 * ajralish rangdan emas, SOYADAN keladi: u har to'rtala mavzuda ham
 * ishlaydi.
 *
 * Ichkaridagi chiziqlar (`divide-track`) ham xuddi shunday tanlangan —
 * `--color-track` yarim shaffof va u quyuq mavzuda oqarib, yorug'ida
 * qoraya oladi.
 */
function Karta({ children }: { children: ReactNode }) {
  return (
    <div className="divide-y divide-track overflow-hidden rounded-clay bg-karta shadow-clay-sm">
      {children}
    </div>
  );
}

/**
 * Menyuning bitta satri.
 *
 * `on` BERILMASA satr o'chgan holatda chiziladi va bosilmaydi. Uni
 * butunlay yashirish ham mumkin edi, lekin unda menyu har safar
 * boshqacha ko'rinardi: bugun "Xatolar daftari" bor, ertaga yo'q —
 * va odam uni ilovadan yo'qolgan deb o'ylardi. O'chgan satr esa
 * "bor, lekin hozir emas" degan gapni aytadi.
 */
function Satr({ ic, rang, nom, izoh, on, nuqta = false }: {
  ic: IconName;
  rang: keyof typeof UNIT_COLORS;
  nom: string;
  izoh: string;
  on?: () => void;
  nuqta?: boolean;
}) {
  const c = UNIT_COLORS[rang];
  return (
    <button type="button" onClick={on} disabled={!on} title={nom}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors
                  ${on ? "active:bg-track" : "cursor-default opacity-45"}`}>
      <span aria-hidden style={{ backgroundColor: `${c.road}1f`, color: c.road }}
        className="relative grid size-8 shrink-0 place-items-center rounded-xl">
        <Icon name={ic} size={17} />
        {nuqta && (
          <span className="az-nuqta absolute -top-0.5 -right-0.5 size-2.5 rounded-full
                           bg-brand-red ring-2 ring-sahna" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[13px] leading-tight">{nom}</span>
        {/* Izoh BIR qator: matnlar shunga qarab qisqartirilgan
            (`matn.ts` dagi izohga qarang). `truncate` baribir qoladi —
            u yerda kunlik holat ham chiqishi mumkin ("3 ta savol
            kutyapti") va u har kuni har xil uzunlikda bo'ladi. */}
        <span className="mt-px block truncate text-[11px] leading-snug text-ink-soft">
          {izoh}
        </span>
      </span>
      {on && <Icon name="chevron" size={15} className="shrink-0 text-ink-dim" />}
    </button>
  );
}

/** Tepadagi kichik hisob: belgi, son, nom. */
function Son({ ic, rang, n, nom }: { ic: IconName; rang: string; n: number; nom: string }) {
  return (
    /* Belgi, son va nom BIR QATORDA. Ilgari ular ustma-ust turardi va
       uchta kataksimon "kartochka" menyu tepasidan 56px olardi —
       bu ro'yxatning bir satriga teng. */
    <span className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-karta/70 px-1 py-1.5">
      <Icon name={ic} size={13} className={`shrink-0 ${rang}`} />
      <span className="font-display text-[13px] leading-none">{n}</span>
      <span className="min-w-0 truncate text-[10px] leading-none text-ink-soft">{nom}</span>
    </span>
  );
}

/**
 * "Ball qanday yig'iladi" bo'limining bitta qoidasi.
 *
 * Belgi bu yerda EMOJI, ikonka emas — va bu yagona joy. Sabab: bu
 * satrlar bosilmaydi, ular matn. Ikonka bo'lganda ular yuqoridagi
 * bosiladigan satrlarga o'xshab ketardi va odam ularni bosishga
 * urinardi.
 */
function Qoida({ belgi, nom, izoh }: { belgi: string; nom: string; izoh: string }) {
  return (
    <div className="flex gap-2.5 py-1.5 first:pt-0 last:pb-0">
      <span aria-hidden className="shrink-0 text-[15px] leading-tight">{belgi}</span>
      <p className="min-w-0 text-[11.5px] leading-snug text-ink-soft">
        <span className="font-display text-ink">{nom}</span>{" — "}{izoh}
      </p>
    </div>
  );
}
