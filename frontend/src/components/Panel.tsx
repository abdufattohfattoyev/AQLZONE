/**
 * Pastki panel — ilovaning asosiy navigatsiyasi.
 *
 * HAMMA ekranda turadi va o'rni hech qachon o'zgarmaydi. Aynan shu
 * o'zgarmaslik uni foydali qiladi: bola bir marta "do'kon pastda, o'ngdan
 * ikkinchi" deb o'rganadi va keyin o'ylamaydi. Ilgari bu tugmalar faqat
 * kurs sahifasida, yuqorida, yozuvsiz kulrang doiralar bo'lib turardi —
 * boshqa ekranga o'tgan bola ularni butunlay yo'qotardi va orqaga qaytish
 * tugmasini qidirishga majbur bo'lardi.
 *
 * ────────────── NEGA OLTITA TUGMA BESHTAGA TUSHDI ──────────────
 *
 * Ilgari panelda oltita tugma turardi: bosh, darslar, nishonlar,
 * do'kon, reyting, ota-ona. Uchta muammosi bor edi.
 *
 *   O'YINLAR YO'Q EDI.  Ilovaning yarmi — sakkizta o'yin, bugungi
 *   maydon, duel — panelda umuman ko'rinmasdi. Ularga faqat bosh
 *   sahifadagi bitta kartadan kirilardi, ya'ni boshqa ekranga o'tgan
 *   odam ularni yo'qotardi.
 *
 *   OLTITA YOZUV SIG'MASDI.  320px li telefonda bir tugmaga ~53px
 *   qolardi va yozuvlar kesilib ketardi.
 *
 *   TENG TUGMA — TENG MA'NO.  Do'kon va ota-ona paneli har kuni
 *   bosiladigan joylar emas, lekin panelda ular "Darslar" bilan bir
 *   xil og'irlikda turardi.
 *
 * Endi panelda faqat HAR KUNI kerak bo'ladigan to'rttasi va menyu
 * bor. Nishonlar, do'kon, ota-ona paneli, sozlamalar, kunlik sinov,
 * xatolar daftari — hammasi menyuda, izohi bilan
 * (`components/Menyu.tsx`).
 *
 * Ikkita tugma KURSGA bog'liq (darslar va menyuning ichidagilar),
 * qolgani bog'liq emas. Kursga bog'liqlari qaysi kursni ochadi degan
 * savol bor va javob uch bosqichli:
 *
 *   1. Ayni paytda kurs sahifasidamiz — o'sha kurs.
 *   2. Emasmiz (masalan reytingda) — oxirgi ochilgan kurs (`lib/oxirgi`).
 *   3. Hali hech qanday kurs ochilmagan — ro'yxatdagi birinchisi.
 *
 * Busiz bosh sahifada turgan bola "Do'kon" ni bosganda hech narsa
 * bo'lmasdi: qaysi kursning do'koni ochilishi noma'lum edi.
 */
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { PanelBelgi, panelRang, type PanelBelgiNom } from "../lib/chizma/panelBelgi";
import { Icon, type IconName } from "../lib/icons";
import { useKompyuter } from "../lib/maket";
import { Menyu } from "./Menyu";
import { Logo } from "./Logo";
import { TilTugma } from "./TilTugma";
import { YoruglikTugma } from "./YoruglikTugma";
import { COURSES, courseBySlug } from "../lib/curriculum";
import { oxirgiKurs } from "../lib/oxirgi";
import { useProgress } from "../lib/progress";
import { nishonlar, olingan } from "../lib/nishon";
import {
  yolBosh, yolKurs, yolKurslar, yolMasalalar, yolOyinlar, yolQidiruv, yolReyting, yolSozlama,
} from "../lib/yollar";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";

/**
 * Panel KO'RINMAYDIGAN manzillar.
 *
 * Dars va takrorlash — diqqat talab qiladigan ish. Pastda navigatsiya
 * tursa, bola savol o'rtasida uni bexosdan bosib, yig'gan javoblarini
 * yo'qotardi. Kirish esa hali hisob yo'q joy: paneldagi hech bir manzil
 * u yerda ma'noga ega emas.
 */
const YOPIQ = [
  /^\/kurs\/[^/]+\/\d+-bob\//,   // dars
  /^\/kurs\/[^/]+\/daftar$/,     // xatolar daftari (u ham dars)
  /^\/kurs\/[^/]+\/sinov$/,      // kunlik sinov (u ham dars)
  // O'yinning O'ZI — ro'yxat va daraja tanlash emas. O'yinda soat
  // yuradi va pastdagi tugmani bexosdan bosgan odam butun natijasini
  // yo'qotardi; ro'yxatda esa panel kerak, chunki u oddiy sahifa.
  /^\/oyinlar\/[^/]+\/[^/]+$/,
  // Bugungi maydon — u ham o'yin, ustiga kuniga bitta urinish. Bu
  // yerda bexosdan bosilgan tugma butun kunni yo'qotardi.
  /^\/oyinlar\/maydon$/,
  // Son ovi — o'yinda soat yuradi va pastdagi boshqaruv tugmalari
  // panel bilan yonma-yon tushib qolardi.
  /^\/oyinlar\/son-ovi$/,
  // DTM varianti — bir soatlik imtihon. Pastdagi tugmani bexosdan
  // bosish butun urinishni yo'qotardi.
  /^\/imtihon\/\d+$/,
  // Kunlik son — o'z klaviaturasi pastda, panel uni yopib qo'yardi.
  /^\/oyinlar\/kunlik-son$/,
  // Karvon yo'li — o'z menyusi bilan to'liq ekran.
  /^\/oyinlar\/karvon$/,
  // Duel — u ham o'yin. Chaqiruv havolasi (`/duel/<kod>`) esa
  // umuman ilova ichidan emas, Telegramdan ochiladi: u yerda panel
  // "qayerdaman?" degan savolni faqat kuchaytirardi.
  /^\/oyinlar\/duel$/,
  /^\/duel\//,
  // Jamoaviy o'yin xonasi — o'yinda soat yuradi va boshqalar kutib turadi.
  /^\/xona\//,
  // Kichkintoylar albomi — 2–5 yosh. Bo'lim ichida pastdagi besh
  // tugma faqat chalg'itadi: bu yoshdagi bola ularni bexosdan bosadi
  // va o'zi ochgan rasmlardan chiqib ketadi. Bo'limning KIRISH ekrani
  // (`/kichkintoy`) esa oddiy sahifa — u yerda panel qoladi.
  /^\/kichkintoy\/[^/]+$/,
  /^\/kirish\//,                 // botdagi havola
  /^\/men$/,                     // anketani qayta to'ldirish — to'liq ekran
  /^\/men$/,                     // anketani qayta to'ldirish — to'liq ekran
];

export const panelKerakmi = (yol: string): boolean => !YOPIQ.some((r) => r.test(yol));

export function Panel() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { progressOf, kunlik } = useProgress();
  const [menyu, setMenyu] = useState(false);
  // Keng brauzer oynasida panel PASTDA emas, CHAPDA turadi
  // (`lib/maket.ts`). Tugmalar o'sha — faqat joyi va ko'rinishi boshqa.
  const kompyuter = useKompyuter();

  // Manzildagi kurs, bo'lmasa oxirgi ochilgani, bo'lmasa birinchisi.
  const kurs =
    courseBySlug(/^\/kurs\/([^/]+)/.exec(pathname)?.[1] ?? "") ??
    courseBySlug(oxirgiKurs()) ??
    COURSES[0];

  // Yangi nishon bor-yo'qligi — tugma ustidagi qizil nuqta uchun.
  const p = progressOf(kurs);
  const yangiNishon = useMemo(
    () => olingan(nishonlar({
      progress: p, kunlik, units: kurs.units, savollar: p.savollar ?? 0,
    })) > 0,
    [p, kunlik, kurs],
  );

  const bosh = pathname === yolBosh();
  // "Darslar" tugmasi kurslar RO'YXATINI ham, ochilgan kursni ham
  // o'ziga oladi: odam uchun bu bitta joy — "darslarim". Ilgari
  // ro'yxat "Bosh" tugmasida turardi va ikkala tugma bir narsani
  // ko'rsatgandek tuyulardi.
  const darslar = pathname === yolKurslar() || /^\/kurs\/[^/]+$/.test(pathname);
  const masalalar = pathname.startsWith("/masalalar");
  // O'yinlar tugmasi butun BO'LIM uchun yonadi: ro'yxat, daraja
  // tanlash, maydon, duel — hammasi `/oyinlar` ostida. Faqat ro'yxatning
  // o'ziga qarasa, daraja tanlash ekranida panel "hech qayerdasiz" deb
  // turardi.
  const oyinlar = pathname.startsWith("/oyinlar");

  // Tugmalar ro'yxat bo'lib turadi, chunki siljiydigan belgiga FAOL
  // TUGMANING INDEKSI kerak. Alohida yozilganda uni sanash uchun har
  // safar qo'lda tartib raqami yozib qo'yishga to'g'ri kelardi — tugma
  // qo'shilganda unutiladigan qadam.
  /**
   * Faol tugma qayta bosilsa — sahifa boshiga qaytadi.
   *
   * Bir xil manzilga o'tish hech narsa qilmaydi va tugma "buzuq" bo'lib
   * tuyulardi. Pastga aylanib ketgan odam uchun esa eng tabiiy kutilma
   * aynan shu: tepaga qayt.
   */
  const yur = (yol: string, faol: boolean) => () => {
    // Yengil tebranish — Telegram ichida tugma "bosildi" degan javobni
    // beradi. Boshqa joyda hech narsa qilmaydi.
    tebrat("tanlov");
    if (faol) window.scrollTo({ top: 0, behavior: "smooth" });
    else nav(yol);
  };

  // Belgilar `lib/icons.tsx` dan EMAS, `lib/chizma/panelBelgi.tsx` dan
  // keladi: panelda ular chiziqli emas, hajmli va rangli. Sababi o'sha
  // faylda yozilgan — bu yerda beshta belgi bir-biridan AJRALIB
  // turishi kerak, ro'yxatdagidek bir xil bo'lishi emas.
  const tablar = [
    { ic: "uy", nom: t("tabBosh"), faol: bosh, on: yur(yolBosh(), bosh) },
    // Kurs ochilgan bo'lsa O'SHA kursga, bo'lmasa ro'yxatga. Odam
    // ko'pincha bitta kursda yuradi va uni har safar ro'yxatdan
    // qayta tanlashi ortiqcha qadam bo'lardi.
    {
      ic: "xarita", nom: t("tabDarslar"), faol: darslar,
      on: yur(pathname.startsWith("/kurs/") ? yolKurs(kurs) : yolKurslar(), darslar),
    },
    // O'yinlar ENG O'RTADA — paneldagi eng oson yetiladigan joy. Bu
    // yerda o'yin, bugungi maydon va duel bir eshik ortida turadi.
    { ic: "oyin", nom: t("tabOyinlar"), faol: oyinlar, on: yur(yolOyinlar(), oyinlar) },
    // REYTING SHU YERDA EDI — bosh sahifaga ko'chdi.
    //
    // U bo'lim emas, MUKOFOT: odam unga kunda bir marta, yulduz
    // yig'gandan keyin kiradi. Panelning beshdan biri esa doim
    // ko'rinib turadigan joy va uni har kuni ochiladigan bo'limga
    // berish kerak edi. Reyting endi bosh sahifadagi chipda turadi
    // — o'zi yig'gan yulduz sonining YONIDA, ya'ni ma'nosi ham
    // ravshanroq bo'ldi.
    {
      ic: "vazifa", nom: t("masalalar"), faol: masalalar,
      on: yur(yolMasalalar(), masalalar),
    },
    // Menyu ENG O'NGDA: u manzil emas, ochiladigan ro'yxat. Qizil nuqta
    // ham shu yerga ko'chdi — nishon endi menyu ichida va odam yangi
    // nishonini boshqa hech qayerdan sezmasdi.
    //
    // `faol` EMAS, `yoniq`. Farq katta va u ko'rinib turadi: `faol`
    // siljiydigan yashil belgini o'ziga tortadi, ya'ni menyu ochilishi
    // bilan belgi joriy sahifadan Menyuga qarab yugurardi va turgan
    // sahifa tugmasi kulrangga aylanardi — panel SAHIFA ALMASHDI deb
    // yolg'on aytardi. Ustiga menyuning o'zi o'ng tomondan chiqadi:
    // bir vaqtda ikki narsa qarama-qarshi tomonga qimirlardi.
    //
    // Menyu esa manzil emas — u shu sahifa USTIDA ochiladigan oyna.
    // Shuning uchun belgi joyida qoladi, tugma faqat yonadi.
    {
      ic: "menyu", nom: t("tabMenyu"), faol: false, yoniq: menyu,
      nuqta: yangiNishon,
      on: () => { tebrat("tanlov"); setMenyu(true); },
    },
  ] as const;

  if (kompyuter) {
    return (
      <>
        <Menyu ochiq={menyu} onYop={() => setMenyu(false)} kurs={kurs} />
        <YonPanel>
          {tablar.map((t) => (
            <YonTugma key={t.nom} ic={t.ic} nom={t.nom} faol={t.faol}
              yoniq={"yoniq" in t ? t.yoniq : false}
              nuqta={"nuqta" in t ? t.nuqta : false}
              on={t.on} />
          ))}
          {/* Telefonda bular bosh sahifadagi chiplarda turadi. Kompyuterda
              yon panelda joy bor va ular HAR sahifadan bir bosishda
              ochilsin — sichqoncha bilan sahifani yuqoriga aylantirib,
              chip qidirish noqulay. */}
          <div className="my-2 h-px bg-track" />
          <YonTugma ic="reyting" nom={t("reyting")} faol={pathname === yolReyting()}
            on={yur(yolReyting(), pathname === yolReyting())} />
          <YonSatr ik="search" nom={t("qidiruvNom")} faol={pathname === yolQidiruv()}
            on={yur(yolQidiruv(), pathname === yolQidiruv())} />
          <YonSatr ik="pencil" nom={t("hisobim")} faol={pathname === yolSozlama()}
            on={yur(yolSozlama(), pathname === yolSozlama())} />
        </YonPanel>
      </>
    );
  }

  return (
    <>
      {/* Oddiy oqimdagi bo'shliq: panel `fixed` bo'lgani uchun sahifa
          oxiri uning ostiga kirib qolardi. Bo'shliq shu yerda turadi va
          panel bilan BIRGA paydo bo'ladi — darsda ikkalasi ham yo'q. */}
      <div aria-hidden className="h-[calc(4rem+var(--az-past))]" />

      <Menyu ochiq={menyu} onYop={() => setMenyu(false)} kurs={kurs} />

      {/* Chegara `border-t` EMAS, `.az-panel` ichidagi soya bilan
          chiziladi. Ilgari u `border-karta/45` edi — ya'ni oq kartada
          oq chiziq, ko'rinmaydigan chegara. */}
      <nav data-tur="panel"
        className="az-panel fixed inset-x-0 bottom-0 z-30 pb-[var(--az-past)]">
        <div className="mx-auto w-full max-w-[430px] px-1 sm:max-w-[560px]">
          {/* Yostiq endi UMUMIY EMAS — har tugmaning o'zida (`Tab`).
              Ilgari shu yerda bitta yostiq turardi va tugmadan tugmaga
              siljirdi: butun panel bo'ylab yuguradigan yashil dog'
              "nimadir joyidan qimirladi" degan tuyg'u berardi. */}
          <div className="flex">
            {tablar.map((t) => (
              <Tab key={t.nom} ic={t.ic} nom={t.nom} faol={t.faol}
                yoniq={"yoniq" in t ? t.yoniq : false}
                nuqta={"nuqta" in t ? t.nuqta : false}
                on={t.on} />
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

/**
 * Panelning bitta tugmasi. Balandligi 56px — barmoq uchun yetarli.
 *
 * `faol` va `yoniq` — ATAYLAB ikki xil narsa:
 *
 *   faol   "siz shu sahifadasiz". Ekran o'quvchi `aria-current="page"`
 *          ni o'qiydi.
 *   yoniq  "shu tugma ochgan narsa hozir ekranda". Menyu shunday: u
 *          sahifa emas, shu sahifa ustidagi oyna. Tugma yonadi, lekin
 *          manzil o'zgarmagani uchun `aria-current` berilmaydi.
 *
 * Yostiq HAR TUGMANING O'ZIDA. Ilgari butun panelga bitta yostiq
 * bor edi va u tugmadan tugmaga siljirdi — ko'z tugmani emas, o'sha
 * yuguruvchini kuzatardi. Endi ketayotgani joyida so'nadi, kelayotgani
 * joyida ochiladi: panelda hech narsa hech qayerga ketmaydi.
 */
function Tab({ ic, nom, on, faol = false, yoniq = false, nuqta = false }: {
  ic: PanelBelgiNom;
  nom: string;
  on: () => void;
  faol?: boolean;
  yoniq?: boolean;
  nuqta?: boolean;
}) {
  // Ko'rinish ikkalasiga ham tegishli — bosilgan tugma javob berishi
  // kerak, bu sahifa bo'ladimi yoki oyna.
  const belgili = faol || yoniq;

  return (
    // `relative` — yostiq shu tugma ICHIDA joylashadi.
    <button type="button" onClick={on} title={nom}
      aria-current={faol ? "page" : undefined}
      /* Tugmaning rangi bir joyda beriladi va yostiq ham, yozuv ham
         shundan oladi — belgi binafsha bo'lib, yostig'i yashil qolgan
         holat shu bilan mumkin emas. */
      style={{ "--az-tab-rang": panelRang(ic) } as CSSProperties}
      /* `min-w-0` SHART: usiz flex elementi o'z mazmunidan kichrayolmaydi
         va uzun yozuv ("Родителям") tugmani kengaytirib, qolgan beshtasini
         siqib qo'yadi. U bilan esa yozuv `truncate` ga bo'ysunadi. */
      className={`clay-press relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2
                  transition-colors duration-200
                  ${belgili ? "az-tab-yoniq" : "text-ink-soft"}`}>
      {/* Yostiq — tugmaning O'Z chegarasi.
          `inset-x-1` yon bo'shliq qoldiradi: yostiqlar bir-biriga
          tegib ketsa, beshta tugma bitta uzun tasmaga aylanardi.
          O'lcham `scale` bilan o'zgaradi — `width` sahifani qayta
          o'lchashga majbur qiladi va past telefonda sakrab ketardi.
          Rangi `--az-tab-rang` dan — ya'ni belgi bilan bir xil. */}
      <span aria-hidden
        className={`az-tab-yostiq absolute inset-x-1 inset-y-1 rounded-2xl
                    ${belgili ? "scale-100 opacity-100" : "scale-90 opacity-0"}`} />

      {/* Belgi va yozuv yostiq USTIDA turishi kerak: joylashgansiz
          element joylashganning ostida chiziladi. */}
      <span className="relative">
        <span className={`az-tab-belgi block ${belgili ? "scale-110" : "scale-100"}`}>
          <PanelBelgi nom={ic} faol={belgili} size={26} />
        </span>
        {nuqta && (
          <span className="az-nuqta absolute -top-0.5 -right-1 size-2.5 rounded-full bg-brand-red ring-2 ring-karta" />
        )}
      </span>
      {/* Beshta yozuv 320px li telefonga ham sig'ishi kerak — bir
          tugmaga ~64px qoladi. Oltitasida bu ~53px edi va eng uzun
          yozuv ("Родители") kesilib ketardi; beshtasida joy yetadi,
          lekin `truncate` baribir turadi: chetdan chiqib ketgan harf
          butun qatorni qiyshaytirardi. */}
      {/* Yozuv shrifti FAOLLIKDA O'ZGARMAYDI. Sinab ko'rildi: `Fredoka`
          ga almashtirilganda 10.5px yozuv boshqa kenglikda chizilib,
          tugma almashganda titrab ketgandek tuyulardi. Ajratish uchun
          yostiq va rang yetarli. */}
      <span className="relative w-full truncate px-0.5 text-center text-[10.5px] leading-none">
        {nom}
      </span>
    </button>
  );
}

/**
 * Chap yon panel — kompyuterdagi navigatsiya.
 *
 * Nega pastki panel kompyuterda qolmadi: 1440px li ekranning pastida
 * beshta 56px li tugma bir-biridan uzoqda sochilib turardi, sichqoncha
 * esa har safar ekran pastigacha tushishi kerak edi. Saytlarda odam
 * navigatsiyani chapda yoki tepada kutadi.
 *
 * Mazmun panel ostiga kirib qolmasin — `<html data-yon>` qo'yiladi va
 * CSS sahifani o'ngga suradi (`index.css`, "YON PANEL"). Atribut panel
 * bilan BIRGA yo'qoladi: darsda panel yo'q va sahifa yana o'rtada.
 */
function YonPanel({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  useEffect(() => {
    document.documentElement.dataset.yon = "1";
    return () => { delete document.documentElement.dataset.yon; };
  }, []);

  return (
    <nav data-tur="panel"
      className="az-yon fixed inset-y-0 left-0 z-30 flex w-[var(--az-yon)] flex-col
                 gap-1 overflow-y-auto bg-karta px-3 py-4">
      <button type="button" onClick={() => nav(yolBosh())} data-tahlil="Yon: logo"
        className="clay-press mb-3 flex items-center gap-2.5 rounded-2xl px-2 py-1.5 text-left">
        <Logo size={40} jonli={false} />
        <span className="font-display text-[20px] leading-none">Aql Zone</span>
      </button>
      {children}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <YoruglikTugma />
        <TilTugma />
      </div>
    </nav>
  );
}

/** Yon paneldagi asosiy tugma — pastki paneldagi `Tab` ning yotiq egizagi. */
function YonTugma({ ic, nom, on, faol = false, yoniq = false, nuqta = false }: {
  ic: PanelBelgiNom;
  nom: string;
  on: () => void;
  faol?: boolean;
  yoniq?: boolean;
  nuqta?: boolean;
}) {
  const belgili = faol || yoniq;
  return (
    <button type="button" onClick={on} data-tahlil={`Yon: ${ic}`}
      aria-current={faol ? "page" : undefined}
      style={{ "--az-tab-rang": panelRang(ic) } as CSSProperties}
      className={`clay-press relative flex h-12 w-full items-center gap-3 rounded-2xl px-3
                  text-left text-[15px] transition-colors duration-200
                  ${belgili ? "az-tab-yoniq" : "text-ink-soft hover:bg-sahna"}`}>
      <span aria-hidden
        className={`az-tab-yostiq absolute inset-0 rounded-2xl
                    ${belgili ? "opacity-100" : "opacity-0"}`} />
      <span className="relative">
        <PanelBelgi nom={ic} faol={belgili} size={26} />
        {nuqta && (
          <span className="az-nuqta absolute -top-0.5 -right-1 size-2.5 rounded-full bg-brand-red ring-2 ring-karta" />
        )}
      </span>
      <span className="relative truncate">{nom}</span>
    </button>
  );
}

/** Ikkinchi darajali satr — chiziqli belgi, yostiqsiz. */
function YonSatr({ ik, nom, on, faol }: { ik: IconName; nom: string; on: () => void; faol: boolean }) {
  return (
    <button type="button" onClick={on} data-tahlil={`Yon: ${ik}`}
      aria-current={faol ? "page" : undefined}
      className={`clay-press flex h-11 w-full items-center gap-3 rounded-2xl px-3.5 text-left
                  text-[14px] ${faol ? "bg-sahna text-brand-blue" : "text-ink-soft hover:bg-sahna"}`}>
      <Icon name={ik} size={18} className="shrink-0" />
      <span className="truncate">{nom}</span>
    </button>
  );
}

/**
 * Sahifa almashganda tepaga qaytarish.
 *
 * Panel bilan birga keldi va usiz nuqson ko'rinardi: reytingni pastigacha
 * aylantirgan odam "Do'kon" ni bossa, do'kon ham O'RTASIDAN ochilardi.
 * Brauzerning orqaga tugmasi bunga kirmaydi — u yerda odam o'zi qoldirgan
 * joyga qaytishni kutadi, shuning uchun faqat yangi o'tishlar hisobga
 * olinadi.
 */
export function TepagaQayt() {
  const { pathname } = useLocation();
  const tur = useNavigationType();
  useEffect(() => {
    // "POP" — brauzerning orqaga/oldinga tugmasi. U yerda odam o'zi
    // qoldirgan joyga qaytishni kutadi, shuning uchun tegilmaydi.
    if (tur === "POP") return;
    window.scrollTo(0, 0);
  }, [pathname, tur]);
  return null;
}
