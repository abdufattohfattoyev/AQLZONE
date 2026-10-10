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
 *   AI ustoz   `/ai`         — reja, savol, masala (2026-10-10 dan;
 *                              ilgari bu joyda Masalalar edi — u endi
 *                              O'qish ichida yorliq, 14 kunda 152 kishidan
 *                              12 tasi masala ochgan edi)
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
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getHisob } from "../lib/api";
import { tgIsm } from "../lib/qobiq";
import { yolSozlama } from "../lib/yollar";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { PanelBelgi, type PanelBelgiNom } from "../lib/chizma/panelBelgi";
import { Icon } from "../lib/icons";
import { useKompyuter } from "../lib/maket";
import { Logo } from "./Logo";
import { TilTugma } from "./TilTugma";
import { YoruglikTugma } from "./YoruglikTugma";
import { faolTab, type TabId } from "../lib/tab";
import {
  yolAi, yolBosh, yolImtihon, yolKurslar, yolMen, yolOyinlar, yolQidiruv, yolReyting, yolSertifikat,
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
  /^\/kurs\/[^/]+\/daraja$/,     // daraja aniqlash — savol ekrani, chalg'itmasin
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
  // AI ustoz suhbati va yozish ekrani — yozish maydoni pastda turadi va
  // panel uni yopib qo'yardi (telefon klaviaturasi ochilganda ayniqsa).
  /^\/ai\/(\d+|yangi\/[^/]+)$/,
  // Maktabga qabul varianti — 70–90 daqiqalik imtihon, xuddi shu sabab.
  /^\/qabul\/[^/]+\/\d+$/,
  // Mantiq mavzusi — bu ham dars (kirish, savollar), panel chalg'itmasin.
  /^\/mantiq\/[^/]+$/,
  // Sertifikat varianti — o'zining "Oldingi / Keyingi" tugmalari pastda
  // turadi va panel ularni yopib qo'yardi.
  /^\/sertifikat\/\d+$/,
  // Zaif mavzular mashqi — soatli blok test, javob tugmalari pastda.
  /^\/(imtihon|sertifikat)\/mashq$/,
  // Mavzu sahifasi — pastda o'zining "mashq qilish" tugmasi qotib turadi,
  // panel uni yopib qo'yardi. Mavzu mashqi esa blok test.
  /^\/mavzu\//,
  // Marafonning bugungi varianti — soatli test.
  /^\/marafon\/bugun$/,
  // Sessiya varianti — xuddi shunday, bir soatlik nazorat.
  /^\/sessiya\/[^/]+\/\d+$/,
  // Kunlik son — o'z klaviaturasi pastda, panel uni yopib qo'yardi.
  /^\/oyinlar\/kunlik-son$/,
  // Karvon yo'li — o'z menyusi bilan to'liq ekran.
  /^\/oyinlar\/karvon$/,
  // Mantiq o'yinlari — boshqaruv tugmalari pastda, panel ularni yopardi.
  /^\/oyinlar\/(izdosh|qoida-ovi|strelka)$/,
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
    { id: "ai", ic: "miya", nom: t("tabAi"), yol: yolAi() },
    { id: "men", ic: "menyu", nom: t("tabMen"), yol: yolMen() },
  ];

  if (kompyuter) {
    // Pastki satrlardan biri faol bo'lsa (DTM, sertifikat, reyting,
    // qidiruv) — faqat O'SHA yonadi. Ilgari `/imtihon` da "O'qish" ham
    // to'liq ko'k turardi va DTM satri uning yonida ko'rinmay qolardi.
    const satrlar = [
      { ik: "dtm" as const, nom: t("yonDtm"), yol: yolImtihon(), faol: pathname.startsWith(yolImtihon()) },
      { ik: "kubok" as const, nom: t("yonSertifikat"), yol: yolSertifikat(), faol: pathname.startsWith(yolSertifikat()) },
      { ik: "reyting" as const, nom: t("reyting"), yol: yolReyting(), faol: pathname === yolReyting() },
      { ik: "lupa" as const, nom: t("qidiruvNom"), yol: yolQidiruv(), faol: pathname === yolQidiruv() },
    ];
    const satrFaol = satrlar.some((s) => s.faol);
    return (
      <YonPanel>
        <YonGuruh nom={t("yonBolimlar")} />
        {tablar.map((x) => (
          <YonTugma key={x.id} ic={x.ic} nom={x.nom} faol={!satrFaol && faol === x.id} on={yur(x.yol)} />
        ))}
        {/* Imtihonlar va reyting — kompyuterda joy bor, ular ichkaridan
            qidirilmasin: abituriyent DTM ni bir bosishda topsin. Telefonda
            qidiruv har bo'lim sarlavhasidagi lupada. */}
        <YonGuruh nom={t("yonImtihonlar")} />
        {satrlar.map((s) => (
          <YonSatr key={s.yol} ik={s.ik} nom={s.nom} faol={s.faol} on={yur(s.yol)} />
        ))}
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
      <span className="relative">
        <PanelBelgi nom={ic} faol={faol} size={34} />
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
                 gap-1 overflow-y-auto bg-sahna px-3 py-4">
      <button type="button" onClick={() => nav(yolBosh())} data-tahlil="Yon: logo"
        className="clay-press mb-3 flex items-center gap-2.5 rounded-2xl px-2 py-1.5 text-left">
        <Logo size={40} jonli={false} />
        <span className="flex flex-col">
          <span className="font-display text-[20px] leading-none">Aql Zone</span>
          <span className="mt-1 text-[12px] leading-none font-semibold text-ink-dim">{t("yonShior")}</span>
        </span>
      </button>
      {children}
      <div className="mt-auto flex flex-col gap-2.5 pt-4">
        <div className="flex items-center justify-between gap-2">
          <YoruglikTugma />
          <TilTugma />
        </div>
        <FoydalanuvchiKarta />
      </div>
    </nav>
  );
}

/**
 * Yon panel pastidagi foydalanuvchi kartasi: kim kirgani va sozlamalar.
 * Kompyuterda "qaysi hisobda turibman?" savoli tez-tez bo'ladi (bir
 * nechta bola) — javob doim ko'z oldida.
 */
function FoydalanuvchiKarta() {
  const nav = useNavigate();
  const [ism, setIsm] = useState(() => tgIsm());
  useEffect(() => {
    let bekor = false;
    getHisob().then((h) => { if (!bekor && h?.ism) setIsm(h.toliqIsm || h.ism); }).catch(() => {});
    return () => { bekor = true; };
  }, []);
  const nom = ism || "Aql Zone";
  const bosh = nom.split(/\s+/).filter(Boolean).slice(0, 2).map((x: string) => x[0]!.toUpperCase()).join("") || "?";
  return (
    <button type="button" onClick={() => nav(yolSozlama())} data-tahlil="Yon: foydalanuvchi"
      className="clay-press flex min-h-14 w-full items-center gap-2.5 rounded-2xl bg-karta px-2.5 text-left shadow-clay-sm">
      <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-blue text-[13px]
                                   font-bold text-white">{bosh}</span>
      <span className="min-w-0 flex-1 truncate text-[14px] font-bold">{nom}</span>
      <Icon name="menu" size={17} className="shrink-0 text-ink-dim" />
    </button>
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
      /* Faol bo'lim — TO'LDIRILGAN ko'k tabletka (2026-09): ilgari yumshoq
         yostiq edi va qaysi sahifada turgani bir qarashda bilinmasdi. */
      className={`clay-press relative flex h-12 w-full items-center gap-3 rounded-2xl px-3
                  text-left text-[15px] transition-colors duration-200
                  ${faol ? "bg-brand-blue font-bold text-white shadow-[0_4px_14px_-4px_var(--color-brand-blue)]"
                    : "font-semibold text-ink-soft hover:bg-karta"}`}>
      <span className="relative">
        <PanelBelgi nom={ic} faol={faol} size={34} />
      </span>
      <span className="relative truncate">{nom}</span>
    </button>
  );
}

/** Guruh sarlavhasi: "BO'LIMLAR", "IMTIHONLAR". */
function YonGuruh({ nom }: { nom: string }) {
  return <span className="mt-3 mb-0.5 px-3 text-[11.5px] font-bold tracking-[0.08em] text-ink-dim uppercase">{nom}</span>;
}

/**
 * Ikkinchi darajali satr — kichikroq 3D belgi (2026-10-08 gacha yassi
 * chiziqli edi va paneldagi 3D tugmalar bilan ikki xil til bo'lardi),
 * yostiqsiz. Faol bo'lsa
 * asosiy tugma kabi to'ldirilgan ko'k: "qayerdaman?" bir qarashda
 * bilinsin (ilgari `bg-karta` edi va qora rejimda deyarli ko'rinmasdi).
 */
function YonSatr({ ik, nom, on, faol }: { ik: PanelBelgiNom; nom: string; on: () => void; faol: boolean }) {
  return (
    <button type="button" onClick={on} data-tahlil={`Yon: ${ik}`}
      aria-current={faol ? "page" : undefined}
      className={`clay-press flex h-11 w-full items-center gap-3 rounded-2xl px-3.5 text-left text-[14px]
                  transition-colors duration-200
                  ${faol ? "bg-brand-blue font-bold text-white shadow-[0_4px_14px_-4px_var(--color-brand-blue)]"
                    : "font-semibold text-ink-soft hover:bg-karta"}`}>
      <PanelBelgi nom={ik} faol={faol} size={30} className="shrink-0" />
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
  // Oxirgi ko'rilgan manzil. Komponent QAYTA ULANGANDA (til almashganda
  // `main.tsx` → TilQobiq butun ilovani qayta chizadi) manzil o'sha-o'sha
  // bo'ladi va tepaga surish kerak emas — aks holda "Men" sahifasining
  // pastida tilni almashtirgan odam birdan tepaga otilib ketardi.
  const oldingi = useRef(pathname);
  useEffect(() => {
    if (oldingi.current === pathname) return;
    oldingi.current = pathname;
    // "POP" — brauzerning orqaga/oldinga tugmasi. U yerda odam o'zi
    // qoldirgan joyga qaytishni kutadi, shuning uchun tegilmaydi.
    if (tur === "POP") return;
    window.scrollTo(0, 0);
  }, [pathname, tur]);
  return null;
}
