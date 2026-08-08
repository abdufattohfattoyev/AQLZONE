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
 * bir qatorlik javob turadi — "u yerda nima bo'ladi".
 *
 * ─────────────────── nega u YOPILADIGAN bo'ldi ───────────────────
 *
 * Izohli satrlar bilan ro'yxat o'n to'rttaga yetdi va uning ustiga
 * sakkizta o'yin chipi qo'shilgan edi. Natijada menyu ikki ekrandan
 * uzun bo'lib qoldi: uni ochgan odam kerakli satrni O'QIB emas,
 * SURIB qidirardi.
 *
 * Menyu esa o'qish uchun ochilmaydi — bir joyga borish uchun
 * ochiladi. Endi u to'rtta kategoriya: ta'lim, o'yin, yutuq, hisob.
 * Bittasi ochiq bo'ladi (ta'lim — ilovaning asosiy ishi), qolgani
 * yopiq va bosilganda ochiladi. Bir vaqtda faqat BITTASI ochiq
 * turadi, aks holda hammasini ochib qo'ygan odam yana o'sha uzun
 * ro'yxatga qaytardi.
 *
 * Yopiq kategoriya ichidagi ogohlantirishni YUTMAYDI: bajarilmagan
 * kunlik sinov yoki yangi nishon bo'lsa, qizil nuqta kategoriyaning
 * o'zida chiqadi. Busiz "bugun bir ish bor" degan xabar bosilmagan
 * yig'ma ostida ko'rinmay ketardi.
 *
 * SAKKIZTA O'YIN CHIPI OLIB TASHLANDI. Ular "Matematik o'yinlar"
 * satrining ostida turardi va o'sha satr allaqachon o'yinlar
 * ekraniga olib boradi — ya'ni menyuning eng baland bo'lagi butun
 * bir ekranning takrori edi.
 *
 * ENG PASTDA — "ball qanday yig'iladi". Bu ilovaning eng ko'p
 * so'raladigan savoli va javobi ilgari hech qayerda yozilmagan edi:
 * yulduz faqat darsdan, tanga esa darsdan ham, o'yindan ham keladi va
 * bu farqni faqat uzoq o'ynagan odam o'zi sezib olardi.
 *
 * O'NG TOMONDAN chiqadi — uni ochadigan tugma ham panelning eng
 * o'ngida turadi, ya'ni menyu bosilgan joydan "o'sib chiqadi".
 */
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { TilTugma } from "./TilTugma";
import { YoruglikTugma } from "./YoruglikTugma";
import { UNIT_COLORS } from "../lib/types";
import type { Course } from "../lib/curriculum";
import { profilSoni } from "../lib/api";
import { useProgress } from "../lib/progress";
import { nishonlar, olingan } from "../lib/nishon";
import { sinovBajarilgan } from "../lib/kunlikSinov";
import { bugungiSoni } from "../lib/takrorlash";
import {
  yolDaftar, yolDokon, yolDuel, yolKichkintoy, yolKurs, yolKurslar, yolMaydon, yolNishon,
  yolOtaOna, yolOyinlar, yolReyting, yolSinov, yolSozlama,
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
   * Qaysi kategoriya ochiq — bir vaqtda faqat BITTASI.
   *
   * Holat React'da turadi, `<details name>` ning o'z akkordeoniga
   * suyanilmadi: u yangi xossa va eski Telegram WebView'da to'rttala
   * bo'lim birdan ochilib, menyu yana uzun ro'yxatga aylanardi.
   *
   * Boshlang'ich qiymat — "ta'lim": ilovaning asosiy ishi shu va
   * to'rttasi ham yopiq turgan menyu birinchi ochilishda bo'sh
   * tuyulardi.
   */
  const [ochiqBolim, setOchiqBolim] = useState<BolimId | null>("talim");

  /**
   * Menyu yopilganda kategoriyalar boshlang'ich holatga qaytadi.
   *
   * Busiz menyu har safar odam OXIRGI marta qoldirgan holatida
   * ochilardi: kecha "Hisob" ni ochgan bola bugun menyuni ochib,
   * darslar o'rniga sozlamalar ro'yxatini ko'rardi.
   */
  useEffect(() => {
    if (!ochiq) setOchiqBolim("talim");
  }, [ochiq]);

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
          ko'p ishlatiladigan yo'li aynan shu, "Yopish" tugmasi emas.

          MUDDAT va EGRI CHIZIQ menyunikiga TENG. Ilgari fon 200ms,
          menyu esa 300ms edi: yopilganda fon avval yo'qolib, menyu
          yalang'och holda sirg'alib chiqardi — ikkitasi bir narsaning
          bo'lagidek emas, alohida-alohida qimirlardi. */}
      <div
        aria-hidden
        onClick={onYop}
        className={`fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px]
                    transition-opacity duration-300 ease-out
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
          <Bolim id="talim" ic="map" nom={t("menyuTalim")}
            ochiq={ochiqBolim} onOchiq={setOchiqBolim}
            /* Bugun bajarilmagan sinov ham, kutayotgan xatolar ham shu
               ichkarida — nuqta ikkalasidan biri bo'lsa chiqadi. */
            nuqta={sinovBor || daftarSoni > 0}>
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
            {/* Kichkintoylar — "ta'lim" ichida, chunki bu o'yin emas:
                bola bu yerda narsalarning NOMINI o'rganadi. Eng oxirida
                turadi — u ilovadagi eng yosh bo'lim va uni izlaydigan
                odam kamchilik. */}
            <Satr ic="palette" rang="gold" nom={t("kichkintoy")}
              izoh={t("menyuKichkintoyIzoh")} on={yur(yolKichkintoy())} />
          </Bolim>

          {/* ==================== o'yin va duel ====================
              Sakkizta o'yin chipi SHU YERDA edi va olib tashlandi:
              "Matematik o'yinlar" satri allaqachon o'sha ekranga olib
              boradi, ya'ni chiplar butun bir ekranning takrori edi —
              menyudagi eng baland bo'lak esa aynan o'sha edi. */}
          <Bolim id="oyin" ic="puzzle" nom={t("menyuOyinBolim")}
            ochiq={ochiqBolim} onOchiq={setOchiqBolim}>
            <Satr ic="clock" rang="green" nom={t("maydon")}
              izoh={t("menyuMaydonIzoh")} on={yur(yolMaydon())} />
            <Satr ic="flame" rang="orange" nom={t("duel")}
              izoh={t("menyuDuelIzoh")} on={yur(yolDuel())} />
            <Satr ic="puzzle" rang="purple" nom={t("oyinlarBolim")}
              izoh={t("menyuOyinlarIzoh")} on={yur(yolOyinlar())} />
          </Bolim>

          {/* ======================= yutuqlar ======================= */}
          <Bolim id="yutuq" ic="trophy" nom={t("menyuYutuq")}
            ochiq={ochiqBolim} onOchiq={setOchiqBolim} nuqta={yangiNishon}>
            <Satr ic="trophy" rang="gold" nom={t("nishonlar")}
              izoh={t("menyuNishonIzoh")} on={yur(yolNishon(kurs))} nuqta={yangiNishon} />
            <Satr ic="palette" rang="blue" nom={t("tabDokon")}
              izoh={t("menyuDokonIzoh")} on={yur(yolDokon(kurs))} />
            <Satr ic="order" rang="gold" nom={t("reyting")}
              izoh={t("menyuReytingIzoh")} on={yur(yolReyting())} />
          </Bolim>

          {/* ======================== hisob ======================== */}
          <Bolim id="hisob" ic="pencil" nom={t("menyuHisobBolim")}
            ochiq={ochiqBolim} onOchiq={setOchiqBolim}>
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

            {/* Yorug'lik — til bilan bir xil qoidada: satr o'zi ish
                bajaradi, ekran almashmaydi.

                Menyuda ham turishi kerak, garchi bosh sahifaning
                tepasida allaqachon bo'lsa ham: darsning o'rtasida qora
                rejimga o'tmoqchi bo'lgan odam bosh sahifaga qaytishi
                shart emas, menyu esa har ekranning pastidan ochiladi. */}
            <div className="flex items-center gap-2.5 px-3 py-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-track text-ink-soft">
                <Icon name="oy" size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[13px] leading-tight">{t("yoruglikSarlavha")}</span>
                <span className="mt-px block truncate text-[11px] leading-snug text-ink-soft">
                  {t("menyuYoruglikIzoh")}
                </span>
              </span>
              <YoruglikTugma className="shrink-0" />
            </div>
          </Bolim>

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

/** Kategoriyalar. Ro'yxatdagi tartib ham shu. */
type BolimId = "talim" | "oyin" | "yutuq" | "hisob";

/**
 * Yopiladigan kategoriya.
 *
 * ─────────────────── NEGA YOPILADI ───────────────────
 *
 * Ilgari to'rttala bo'lim ham ochiq turardi: o'n to'rtta izohli satr
 * va sakkizta o'yin chipi. Menyu ikki ekrandan uzun edi va uni
 * ochgan odam kerakli joyni o'qib emas, SURIB qidirardi.
 *
 * Endi bir vaqtda bittasi ochiq. Bu bir bosish qo'shadi, lekin
 * o'rniga surish va ko'z bilan qidirishni butunlay olib tashlaydi —
 * bola uchun bu almashuv foydali: u "Reyting"ni qidirmaydi, "Yutuq
 * va reyting"ni bosadi.
 *
 * ─────────────────── NEGA NUQTA SARLAVHADA ───────────────────
 *
 * Yopiq kategoriya ichidagi ogohlantirishni yutib yuborardi:
 * bajarilmagan kunlik sinovning qizil nuqtasi bosilmagan yig'ma
 * ostida qolardi va bola bugun bir ish borligini bilmasdi. Shuning
 * uchun nuqta ichkaridan sarlavhaga ko'tariladi.
 *
 * ─────────────────── NEGA SOYA, NEGA FON EMAS ───────────────────
 *
 * Ko'k mavzuda `--color-karta` ham, `--color-sahna` ham OQ (`#ffffff`)
 * — ya'ni "oq karta" oq fonda umuman ko'rinmasdi. Shuning uchun
 * ajralish rangdan emas, SOYADAN keladi: u har to'rtala mavzuda ham
 * ishlaydi.
 */
function Bolim({ id, ic, nom, ochiq, onOchiq, nuqta = false, children }: {
  id: BolimId;
  ic: IconName;
  nom: string;
  /** Ayni paytda qaysi kategoriya ochiq. */
  ochiq: BolimId | null;
  onOchiq: (yangi: BolimId | null) => void;
  nuqta?: boolean;
  children: ReactNode;
}) {
  const buOchiq = ochiq === id;

  return (
    <details
      open={buOchiq}
      /**
       * `onToggle` YOPILISHDA ham chaqiriladi va bu tuzoq.
       *
       * Yangi kategoriya ochilganda React eskisini yopadi, eskisi esa
       * o'z navbatida "meni yoping" deb xabar beradi. To'g'ridan-to'g'ri
       * `null` qo'ysak, u endigina ochilgan kategoriyani ham yopib
       * qo'yardi — bosish ishlamayotgandek tuyulardi.
       *
       * Shuning uchun yopilish faqat O'ZI ochiq bo'lgan kategoriyaga
       * ta'sir qiladi.
       */
      onToggle={(e) => {
        const endi = e.currentTarget.open;
        if (endi) onOchiq(id);
        else if (buOchiq) onOchiq(null);
      }}
      className="group mt-2.5 overflow-hidden rounded-clay bg-karta shadow-clay-sm first:mt-0.5">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3 py-2.5
                          marker:hidden">
        <span aria-hidden
          className="relative grid size-8 shrink-0 place-items-center rounded-xl bg-track text-ink-soft">
          <Icon name={ic} size={17} />
          {nuqta && (
            <span className="az-nuqta absolute -top-0.5 -right-0.5 size-2.5 rounded-full
                             bg-brand-red ring-2 ring-karta" />
          )}
        </span>
        <span className="min-w-0 flex-1 truncate font-display text-[13.5px] leading-tight">
          {nom}
        </span>
        <Icon name="chevron" size={15}
          className="shrink-0 text-ink-dim transition-transform group-open:rotate-90" />
      </summary>
      {/* Ichkaridagi chiziqlar `--color-track` da: u yarim shaffof va
          quyuq mavzuda oqarib, yorug'ida qoraya oladi. */}
      <div className="divide-y divide-track border-t border-track">{children}</div>
    </details>
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
