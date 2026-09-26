/**
 * Pastki panel — ilovaning asosiy navigatsiyasi.
 *
 * HAMMA ekranda turadi va o'rni hech qachon o'zgarmaydi. Aynan shu
 * o'zgarmaslik uni foydali qiladi: bola bir marta "o'yinlar o'rtada"
 * deb o'rganadi va keyin o'ylamaydi.
 *
 * ─────────────── BESH BO'LIM, MENYUSIZ (yangi dizayn) ───────────────
 *
 * Ilgari beshinchi tugma "Menyu" edi va u 25 dan ortiq narsani bitta
 * ro'yxatga yig'ardi: xatolar daftari, do'kon, nishonlar, ota-ona
 * paneli, formulalar, sozlamalar. Muhim bo'limlar kurs ichida ham
 * yashiringan edi va odam narsani topa olmasdi.
 *
 * Endi panelda doim BESH BO'LIM turadi va har narsa bitta joyda:
 *
 *   Bugun      `/`           — bugun nima qilish kerak
 *   O'qish     `/darslar`    — darslar, testlar, formulalar, xatolar
 *   O'yin      `/oyinlar`    — duel, maydon, yakka o'yinlar
 *   Masalalar  `/masalalar`  — lenta, masala yozish
 *   Men        `/men`        — yutuqlar, ota-ona, sozlamalar
 *
 * Qaysi manzil qaysi bo'limga tegishli — `lib/tab.ts` (sinovi
 * `scripts/tab.ts`). Eski manzillar (`/kurs/.../dokon`, `/imtihon/3`)
 * o'chirilmadi — ular ochiladi va to'g'ri tab yonadi.
 *
 * Faol tugma bir xil KO'K rangda. Ilgari har belgining o'z rangi bor
 * edi (yashil uy, binafsha planshet) va panel kamalakka aylanardi —
 * dizayn qoidasi esa tanlangan holat uchun faqat ko'kni beradi.
 */
import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { PanelBelgi, type PanelBelgiNom } from "../lib/chizma/panelBelgi";
import { Icon, type IconName } from "../lib/icons";
import { useKompyuter } from "../lib/maket";
import { Logo } from "./Logo";
import { TilTugma } from "./TilTugma";
import { YoruglikTugma } from "./YoruglikTugma";
import { faolTab, type TabId } from "../lib/tab";
import { yolBosh, yolKurslar, yolMasalalar, yolMen, yolOyinlar, yolQidiruv } from "../lib/yollar";
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
  // Sertifikat varianti — o'zining "Oldingi / Keyingi" tugmalari pastda
  // turadi va panel ularni yopib qo'yardi.
  /^\/sertifikat\/\d+$/,
  // Sessiya varianti — xuddi shunday, bir soatlik nazorat.
  /^\/sessiya\/[^/]+\/\d+$/,
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
  // Anketani qayta to'ldirish — to'liq ekran. Ilgari u `/men` da edi;
  // endi `/men` — "Men" bo'limining o'zi va u yerda panel kerak.
  /^\/men\/anketa$/,
];

export const panelKerakmi = (yol: string): boolean => !YOPIQ.some((r) => r.test(yol));

export function Panel() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  // Keng brauzer oynasida panel PASTDA emas, CHAPDA turadi
  // (`lib/maket.ts`). Tugmalar o'sha — faqat joyi va ko'rinishi boshqa.
  const kompyuter = useKompyuter();
  const faol = faolTab(pathname);

  /**
   * Tugma bosilganda: bo'limning BOSH sahifasiga.
   *
   * Faol tugma o'z bosh sahifasida qayta bosilsa — sahifa boshiga
   * qaytadi (bir xil manzilga o'tish hech narsa qilmasdi va tugma
   * "buzuq" tuyulardi). Bo'limning ichki sahifasida (masalan Men ›
   * Do'kon) esa bo'lim boshiga olib chiqadi.
   */
  const yur = (yol: string) => () => {
    // Yengil tebranish — Telegram ichida tugma "bosildi" degan javobni
    // beradi. Boshqa joyda hech narsa qilmaydi.
    tebrat("tanlov");
    if (pathname === yol) window.scrollTo({ top: 0, behavior: "smooth" });
    else nav(yol);
  };

  const tablar: { id: TabId; ic: PanelBelgiNom; nom: string; yol: string }[] = [
    { id: "bugun", ic: "uy", nom: t("tabBugun"), yol: yolBosh() },
    { id: "oqish", ic: "xarita", nom: t("tabOqish"), yol: yolKurslar() },
    // O'yin ENG O'RTADA — paneldagi eng oson yetiladigan joy.
    { id: "oyin", ic: "oyin", nom: t("tabOyin"), yol: yolOyinlar() },
    { id: "masalalar", ic: "vazifa", nom: t("masalalar"), yol: yolMasalalar() },
    { id: "men", ic: "menyu", nom: t("tabMen"), yol: yolMen() },
  ];

  if (kompyuter) {
    return (
      <YonPanel>
        {tablar.map((x) => (
          <YonTugma key={x.id} ic={x.ic} nom={x.nom} faol={faol === x.id} on={yur(x.yol)} />
        ))}
        {/* Telefonda qidiruv har bo'lim sarlavhasidagi lupada. Kompyuterda
            yon panelda joy bor va u HAR sahifadan bir bosishda ochilsin. */}
        <div className="my-2 h-px bg-track" />
        <YonSatr ik="search" nom={t("qidiruvNom")} faol={pathname === yolQidiruv()}
          on={yur(yolQidiruv())} />
      </YonPanel>
    );
  }

  return (
    <>
      {/* Oddiy oqimdagi bo'shliq: panel `fixed` bo'lgani uchun sahifa
          oxiri uning ostiga kirib qolardi. Bo'shliq shu yerda turadi va
          panel bilan BIRGA paydo bo'ladi — darsda ikkalasi ham yo'q. */}
      <div aria-hidden className="h-[calc(4.25rem+var(--az-past))]" />

      {/* Chegara `border-t` EMAS, `.az-panel` ichidagi soya bilan
          chiziladi. Ilgari u `border-karta/45` edi — ya'ni oq kartada
          oq chiziq, ko'rinmaydigan chegara. */}
      <nav data-tur="panel" aria-label={t("tabBolimlar")}
        className="az-panel fixed inset-x-0 bottom-0 z-30 pb-[var(--az-past)]">
        <div className="mx-auto grid w-full max-w-[430px] grid-cols-5 gap-1 px-1.5 pt-1.5 pb-1
                        sm:max-w-[560px]">
          {tablar.map((x) => (
            <Tab key={x.id} ic={x.ic} nom={x.nom} faol={faol === x.id} on={yur(x.yol)} />
          ))}
        </div>
      </nav>
    </>
  );
}

/**
 * Panelning bitta tugmasi. Balandligi 60px — barmoq uchun yetarli.
 *
 * Faol holat: yumshoq ko'k yostiq va to'q ko'k yozuv (`manba/Tab.dc.html`).
 * Faol bo'lmaganlar kulrang va belgisi sal xira — ko'z faol tugmani
 * birinchi topadi.
 *
 * Yostiq HAR TUGMANING O'ZIDA. Ilgari butun panelga bitta yostiq
 * bor edi va u tugmadan tugmaga siljirdi — ko'z tugmani emas, o'sha
 * yuguruvchini kuzatardi.
 */
function Tab({ ic, nom, on, faol }: {
  ic: PanelBelgiNom;
  nom: string;
  on: () => void;
  faol: boolean;
}) {
  return (
    <button type="button" onClick={on} title={nom} data-tahlil={`Panel: ${ic}`}
      aria-current={faol ? "page" : undefined}
      /* `min-w-0` SHART: usiz grid elementi o'z mazmunidan kichrayolmaydi
         va uzun yozuv ("Задачи") qo'shnilarini siqib qo'yadi. */
      className={`clay-press relative flex min-h-[60px] min-w-0 flex-col items-center justify-center
                  gap-1 rounded-2xl transition-colors duration-200
                  ${faol ? "text-brand-blue-t" : "text-ink-dim"}`}>
      <span aria-hidden
        className={`az-tab-yostiq absolute inset-0 rounded-2xl
                    ${faol ? "scale-100 opacity-100" : "scale-90 opacity-0"}`} />
      <span className={`relative ${faol ? "" : "opacity-75"}`}>
        <PanelBelgi nom={ic} faol={faol} size={28} />
      </span>
      {/* 320px li telefonda bir tugmaga ~60px qoladi: yozuv 11px, kengroqda
          dizayndagi 12.5px. 11px dan kichigi o'qilmaydi (dizayn qoidasi). */}
      <span className="relative w-full truncate px-0.5 text-center text-[11px] leading-none font-bold
                       min-[360px]:text-[12.5px]">
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
function YonTugma({ ic, nom, on, faol }: {
  ic: PanelBelgiNom;
  nom: string;
  on: () => void;
  faol: boolean;
}) {
  return (
    <button type="button" onClick={on} data-tahlil={`Yon: ${ic}`}
      aria-current={faol ? "page" : undefined}
      className={`clay-press relative flex h-12 w-full items-center gap-3 rounded-2xl px-3
                  text-left text-[15px] transition-colors duration-200
                  ${faol ? "font-bold text-brand-blue-t" : "text-ink-soft hover:bg-sahna"}`}>
      <span aria-hidden
        className={`az-tab-yostiq absolute inset-0 rounded-2xl
                    ${faol ? "opacity-100" : "opacity-0"}`} />
      <span className="relative">
        <PanelBelgi nom={ic} faol={faol} size={26} />
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
