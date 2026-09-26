/**
 * MASALALAR RO'YXATI — foydalanuvchilar yozgan masalalar.
 *
 * ─────────────── NEGA TEPA QISM SHUNCHA PAST ───────────────
 *
 * Ilgari ro'yxatgacha to'rtta qavat bor edi: sarlavha, ostida
 * izoh qatori, keyin butun ekran kengligidagi binafsha "Masala
 * qo'shish" kartasi va ikkita tasma. Telefonda birinchi masala
 * ekranning yarmidan pastda boshlanardi — ya'ni bo'limning o'zi
 * ko'rinmasdi.
 *
 * Endi uch qavat va hammasi past:
 *
 *   sarlavha + ikkita amal   bitta qatorda
 *   saralash                 chiziqli tab, karta emas
 *   sinf                     yupqa tugmachalar
 *
 * "Masala qo'shish" sarlavha qatoriga, binafsha tugma bo'lib
 * ko'chdi: u ekranning eng ko'rinadigan burchagida turadi va
 * ro'yxatdan joy olmaydi. Uzun izohi yo'qoldi, chunki bosilgandan
 * keyingi ekran o'zi hammasini so'raydi.
 *
 * Bo'sh ro'yxatda esa u YANA katta bo'lib qaytadi: u yerda
 * ro'yxatdan olinadigan joy yo'q va yozishdan boshqa qiladigan
 * ish ham yo'q.
 *
 * ─────────────── NEGA TO'RTTA SARALASH ───────────────
 *
 * "Yangi" — bo'limning tirikligini ko'rsatadi va yangi muallifga
 * ko'rinish beradi: uning masalasi tasdiqlanishi bilan eng tepada
 * turadi.
 *
 * "Qiyin" — bo'limning eng qiziq ro'yxati. U LIKE bilan emas,
 * yechilganlar foizi bilan quriladi: yoqtirish masalaning
 * qiyinligi haqida hech narsa demaydi, "yuztadan o'n kishi yechdi"
 * esa aynan shuni aytadi.
 *
 * "Zo'r" va "Ko'p yechilgan" — odatiy ikki o'lchov.
 *
 * ─────────────── SINF FILTRI NEGA IXTIYORIY ───────────────
 *
 * Standart holda HAMMA sinf ko'rinadi. 5-sinf bolasi 7-sinf
 * masalasini ochib, yechib ham qo'yishi mumkin va uni oldindan
 * to'sishning ma'nosi yo'q — bu bo'lim dars emas, u yerda tartib
 * ham, qulf ham yo'q.
 */
import { useCallback, useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { t } from "../lib/matn";
import { MasalaKarta } from "../components/MasalaKarta";
import { Tanlov, TanlovVaraq } from "../components/Varaq";
import { SINFLAR } from "../lib/masalaSinf";
import * as MS from "../lib/masala";
import type { Holat, Masala, Tartib } from "../lib/masala";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { useKompyuter } from "../lib/maket";
import { sinfOfProfil, useProfil } from "../lib/profil";

/**
 * Saralash tasmasi.
 *
 * Har birida emoji bor va u BEZAK EMAS: to'rtta tugmacha bir xil
 * kulrang matn bo'lib turganda ular bir-biridan faqat o'qib
 * ajratilardi, emoji esa ularni bir qarashda ajratadi va
 * tanlanganini eslab qolishga yordam beradi.
 */
const TARTIBLAR: { kod: Tartib; belgi: string; nom: () => string }[] = [
  { kod: "yangi", belgi: "✨", nom: () => t("masalaYangilar") },
  { kod: "qiyin", belgi: "⚡", nom: () => t("masalaQiyinlar") },
  { kod: "zor", belgi: "🔥", nom: () => t("masalaZorlar") },
  { kod: "koplik", belgi: "🎯", nom: () => t("masalaKoplar") },
];

/**
 * Yechilganlik filtri.
 *
 * "Yechgan" — BIRINCHI urinishda to'g'ri topgani, ya'ni kartadagi
 * yashil belgi bilan bir xil qoida. Xato javob bergan masala
 * "yechilmagan" tomonda qoladi va bu ataylab: odam u yerga aynan
 * qaytib kelishi kerak.
 */
const HOLATLAR: { kod: Holat; ic?: IconName; nom: () => string }[] = [
  { kod: "hammasi", nom: () => t("masalaHolatHammasi") },
  { kod: "yechilmagan", ic: "repeat", nom: () => t("masalaHolatYechilmagan") },
  { kod: "yechgan", ic: "check", nom: () => t("masalaHolatYechgan") },
];


interface Props {
  onOch: (id: number) => void;
  onYangi: () => void;
  onMenikilar: () => void;
  onBack: () => void;
  onQidiruv: () => void;
}

export function Masalalar({ onOch, onYangi, onMenikilar, onBack, onQidiruv }: Props) {
  // Tab ildizi — Telegram'ning orqaga tugmasi kerak emas (panelda doim
  // besh bo'lim). `onBack` eski chaqiruvlar uchun qoldi.
  useOrqaga(onBack, false);
  const kompyuter = useKompyuter();
  const [tartib, setTartib] = useState<Tartib>("yangi");
  // Boshlang'ich sinf — profilniki (dizaynda sinf chipi ko'k to'ldirilgan):
  // 3-sinf o'quvchisiga birinchi bo'lib 11-sinf masalasi chiqmasin.
  // Profil sinfi masala toifalarida bo'lmasa — hamma sinf.
  const ozSinf = sinfOfProfil(useProfil());
  const [sinf, setSinf] = useState<number | null>(
    () => (ozSinf !== null && SINFLAR.some((x) => x.kod === ozSinf) ? ozSinf : null));
  const [royxat, setRoyxat] = useState<Masala[]>([]);
  const [sahifa, setSahifa] = useState(0);
  const [sahifalar, setSahifalar] = useState(1);

  /** Yechilganlik filtri — hammasi / yechilmagan / yechgan. */
  const [yechilganlik, setYechilganlik] = useState<Holat>("hammasi");
  /**
   * Saralash YO'NALISHI — teskarisiga o'girilganmi.
   *
   * Tanlangan saralashdan alohida saqlanadi: odam "Yangi" dan
   * "Eng qiyin" ga o'tganda yo'nalish o'zgarmasligi kerak — u
   * boshqa savolga javob beradi.
   */
  const [teskari, setTeskari] = useState(false);
  const [holat, setHolat] = useState<"yuklanmoqda" | "tayyor" | "xato">("yuklanmoqda");

  /**
   * Qaysi tanlov varag'i ochiq — yoki hech qaysi.
   *
   * Uchala filtr bitta qatorda, uchta tanlagichda turadi va
   * ro'yxatlari varaqda ochiladi. Ilgari uchalasi ham ekranda
   * ochiq tugmachalar tasmasi edi: uch qator bir xil og'irlikda
   * turib, ekranning yarmini yerdi va sinf ro'yxati (o'n oltita)
   * baribir tasmaga sig'may, yonlamasiga surilardi — ya'ni
   * "8-sinf" ni topish uchun surish kerak bo'lardi.
   */
  const [varaq, setVaraq] = useState<"tartib" | "sinf" | null>(null);

  /** Sinf chipidagi yozuv. */
  const sinfNomi = sinf === null
    ? t("masalaHammaSinf")
    : (SINFLAR.find((x) => x.kod === sinf)?.nom ?? t("masalaHammaSinf"));

  const och = (v: "tartib" | "sinf") => { tebrat("tanlov"); setVaraq(v); };

  /**
   * Ro'yxatni oladi — bitta SAHIFANI.
   *
   * Ilgari "yana ko'rsatish" natijani ustiga qo'shardi va ro'yxat
   * cheksiz cho'zilardi: o'ninchi masaladan keyin odam qayerda
   * turganini bilmasdi, boshiga qaytish uchun esa uzoq surish
   * kerak edi. Endi sahifalar raqamlangan va har biri o'nta.
   */
  const yukla = useCallback(async (s: number) => {
    setHolat("yuklanmoqda");
    try {
      const d = await MS.royxat(sinf, tartib, s, yechilganlik, teskari);
      setRoyxat(d.masalalar);
      setSahifa(d.sahifa);
      setSahifalar(d.sahifalar);
      setHolat("tayyor");
      // Yangi sahifa BOSHIDAN ko'rinadi: aks holda odam o'rtada
      // qolib, "nima o'zgardi?" degan savol bilan qolardi.
      if (s > 0) window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // Bo'sh ekran o'rniga xato yozuvi: internetsiz ochgan odam
      // "bu yerda hech narsa yo'q ekan" deb chiqib ketmasin.
      setHolat("xato");
    }
  }, [sinf, tartib, yechilganlik, teskari]);

  // Saralash, sinf yoki filtr o'zgarsa — birinchi sahifadan qaytadan.
  useEffect(() => { void yukla(0); }, [yukla]);

  const almashtir = (k: Tartib) => { tebrat("tanlov"); setTartib(k); };
  const sinfniTanla = (k: number | null) => { tebrat("tanlov"); setSinf(k); };
  const holatniTanla = (k: Holat) => { tebrat("tanlov"); setYechilganlik(k); };
  const teskariAlmashtir = () => { tebrat("tanlov"); setTeskari((x) => !x); };

  /* Filtr tegilmagan bo'lsa — bo'lim haqiqatan bo'sh. Tegilgan
     bo'lsa esa "bu filtrda yo'q" degani va u yerda katta "yozing"
     tugmasi noto'g'ri javob bo'lardi. */
  const bosh = holat === "tayyor" && royxat.length === 0;
  const butunlayBosh = bosh && (sinf === null || sinf === ozSinf) && tartib === "yangi"
    && yechilganlik === "hammasi";

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-24 min-[360px]:px-[18px]
                    sm:max-w-2xl">
      {/* ---- sarlavha: nom · Menikilar · qidiruv (`manba/Masalalar.dc.html`) ----
          "Masala yozish" sarlavhadan pastdagi SUZUVCHI tugmaga ko'chdi:
          u ekrandagi yagona asosiy amal va ro'yxat surilganda ham
          qo'l ostida turadi. */}
      <header className="flex min-h-12 items-center gap-2">
        <h1 className="min-w-0 flex-1 truncate font-display text-[23px] min-[360px]:text-[26px]">{t("masalalar")}</h1>
        <button type="button" onClick={onMenikilar} data-tahlil="Masalalar: menikilar"
          className="clay-press grid min-h-11 shrink-0 place-items-center rounded-[14px] px-2.5 text-[15px] font-bold
                     text-brand-blue-t min-[360px]:px-3">
          {t("masalaMenikilarTugma")}
        </button>
        <button type="button" onClick={onQidiruv} aria-label={t("qidiruvNom")} data-tahlil="Masalalar: qidiruv"
          className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
          <Icon name="search" size={20} />
        </button>
      </header>

      {/* ---- filtr chiplari ----
          Sinf — eng ko'p ishlatiladigani: tanlangan bo'lsa KO'K
          to'ldirilgan. "Yangi" va "Ommabop" — ikki eng ko'p kerak
          bo'ladigan saralash. Qolgani (eng qiyin, eng zo'r, yo'nalish,
          yechilganlik) "Saralash" varag'ida; o'zgartirilgan bo'lsa
          tugmada ko'k nuqta — ro'yxat nega boshqacha ekani yashirin
          qolmasin. */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => och("sinf")} data-tahlil="Masalalar: sinf"
          className={`clay-press grid min-h-10 shrink-0 place-items-center rounded-full px-3.5 text-[14px]
                      min-[360px]:px-4 min-[360px]:text-[14.5px] ${
            sinf !== null ? "bg-brand-blue font-bold text-white" : "bg-karta font-semibold text-ink-soft shadow-clay-sm"}`}>
          <span className="truncate">{sinfNomi}</span>
        </button>
        {(["yangi", "koplik"] as const).map((k) => (
          <button key={k} type="button" onClick={() => almashtir(k)} aria-pressed={tartib === k}
            data-tahlil={`Masalalar: ${k}`}
            /* 320px da ikkala chip sig'maydi (ayniqsa ruschada): "Ommabop"
               yashiriladi — u "Saralash" varag'ida "Ko'p yechilgan" bo'lib turadi. */
            className={`clay-press min-h-10 min-w-0 place-items-center rounded-full bg-karta px-3 text-[14px]
                        shadow-clay-sm min-[360px]:px-4 min-[360px]:text-[14.5px] ${
              k === "koplik" ? "hidden min-[360px]:grid" : "grid"} ${
              tartib === k ? "font-bold text-brand-blue-t outline-2 -outline-offset-2 outline-brand-blue outline-solid"
                : "font-semibold text-ink-soft"}`}>
            <span className="max-w-full truncate">{k === "yangi" ? t("masalaYangilar") : t("masalaOmmabop")}</span>
          </button>
        ))}
        <button type="button" onClick={() => och("tartib")} aria-label={t("masalaSaralash")}
          data-tahlil="Masalalar: saralash"
          className="clay-press relative ml-auto grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta
                     shadow-clay-sm">
          <Icon name="order" size={19} />
          {((tartib !== "yangi" && tartib !== "koplik") || teskari || yechilganlik !== "hammasi") && (
            <span className="absolute top-2 right-2 size-2 rounded-full bg-brand-blue" />
          )}
        </button>
      </div>

      {varaq === "tartib" && (
        <TanlovVaraq sarlavha={t("masalaSaralash")} onYop={() => setVaraq(null)}>
          {TARTIBLAR.map((x) => (
            <Tanlov key={x.kod} faol={tartib === x.kod}
              on={() => { almashtir(x.kod); setVaraq(null); }}>
              {x.nom()}
            </Tanlov>
          ))}
          {/* Yo'nalish SHU YERDA, chunki u saralashning bir qismi:
              "Yangi" ni tanlab bo'lib, "eng eskisidan" deyish
              mumkin. Alohida tugma bo'lganda u qaysi saralashga
              tegishli ekani ko'rinmasdi. */}
          <span className="mt-1 w-full border-t border-track pt-2.5" />
          <Tanlov faol={teskari} on={teskariAlmashtir}>
            <Icon name="chevron" size={13}
              className={`transition-transform ${teskari ? "-rotate-90" : "rotate-90"}`} />
            {t(teskari ? "masalaEskidan" : "masalaYangidan")}
          </Tanlov>
          <p className="mt-3 w-full text-[12px] text-ink-dim">{t("masalaHolatYorliq")}</p>
          {HOLATLAR.map((x) => (
            <Tanlov key={x.kod} faol={yechilganlik === x.kod}
              on={() => { holatniTanla(x.kod); setVaraq(null); }}>
              {x.nom()}
            </Tanlov>
          ))}
        </TanlovVaraq>
      )}

      {varaq === "sinf" && (
        <TanlovVaraq sarlavha={t("masalaSinfYorliq")} onYop={() => setVaraq(null)}>
          <Tanlov faol={sinf === null} on={() => { sinfniTanla(null); setVaraq(null); }}>
            {t("masalaHammaSinf")}
          </Tanlov>
          {SINFLAR.map((x) => (
            <Tanlov key={x.kod} faol={sinf === x.kod}
              on={() => { sinfniTanla(x.kod); setVaraq(null); }}>
              {x.nom}
            </Tanlov>
          ))}
        </TanlovVaraq>
      )}

      {/* ---- ro'yxat ---- */}
      {holat === "yuklanmoqda" && (
        <p className="mt-10 text-center text-[13px] text-ink-dim">{t("yuklanyapti")}</p>
      )}
      {holat === "xato" && (
        <p className="mt-10 text-center text-[13px] text-ink-dim">{t("aloqaYoq")}</p>
      )}

      {bosh && <Bosh katta={butunlayBosh} onYangi={onYangi} />}

      <div className="mt-3 space-y-2.5">
        {royxat.map((m) => (
          <MasalaKarta key={m.id} m={m} on={() => onOch(m.id)} />
        ))}
      </div>

      {sahifalar > 1 && holat === "tayyor" && (
        <Sahifalar joriy={sahifa} jami={sahifalar} on={(s) => void yukla(s)} />
      )}

      {/* ---- suzuvchi "Masala yozish" — pastki panel USTIDA, o'ngda ----
          Bo'sh ro'yxatda u o'rtadagi katta tugma bilan takrorlanmasin. */}
      {!butunlayBosh && (
        <button type="button" onClick={onYangi} data-tahlil="Masalalar: masala yozish"
          className={`tugma-3d fixed right-4 z-20 flex min-h-14 items-center gap-2 rounded-[20px] bg-brand-blue px-5
                      font-display text-[17px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]
                      min-[360px]:right-[18px] ${
            kompyuter ? "bottom-6" : "bottom-[calc(4.25rem+var(--az-past)+14px)]"}`}>
          <Icon name="plus" size={20} />
          {t("masalaYozish")}
        </button>
      )}
    </div>
  );
}

/**
 * SAHIFA RAQAMLARI.
 *
 * Ilgari "yana ko'rsatish" tugmasi bor edi va ro'yxat cheksiz
 * cho'zilardi: o'ninchi masaladan keyin odam qayerda turganini
 * bilmasdi va boshiga qaytish uchun uzoq surishga majbur edi.
 *
 * Raqamlar telefonda ham sig'ishi kerak, shuning uchun ular
 * DOIMIY beshta o'rin egallaydi: joriy sahifa o'rtada, ikki
 * yonida qo'shnilari. Chetlarda esa oyna surilib, birinchi yoki
 * oxirgi sahifalar ko'rinadi — ya'ni tugmalar sakramaydi.
 */
function Sahifalar(
  { joriy, jami, on }: { joriy: number; jami: number; on: (s: number) => void },
) {
  const KO_RINADI = 5;
  const boshi = Math.max(0, Math.min(joriy - 2, jami - KO_RINADI));
  const raqamlar = Array.from(
    { length: Math.min(KO_RINADI, jami) },
    (_, i) => boshi + i,
  );

  const oq = (yon: -1 | 1) => {
    const s = joriy + yon;
    if (s < 0 || s >= jami) return;
    tebrat("tanlov");
    on(s);
  };

  return (
    <div className="mt-4 flex items-center justify-center gap-1.5">
      <button type="button" onClick={() => oq(-1)} disabled={joriy === 0}
        aria-label={t("ortga")}
        className="clay-press grid size-9 shrink-0 place-items-center rounded-full bg-karta
                   text-ink-soft shadow-clay-sm disabled:opacity-40">
        <Icon name="chevron" size={16} className="rotate-180" />
      </button>

      {raqamlar.map((s) => (
        <button key={s} type="button" onClick={() => { tebrat("tanlov"); on(s); }}
          className={`clay-press grid size-9 shrink-0 place-items-center rounded-full
                      text-[13px] ${
            s === joriy
              ? "bg-brand-blue font-display text-white shadow-clay-sm"
              : "shadow-ichki bg-sahna text-ink-soft"}`}>
          {s + 1}
        </button>
      ))}

      <button type="button" onClick={() => oq(1)} disabled={joriy + 1 >= jami}
        aria-label={t("masalaYana")}
        className="clay-press grid size-9 shrink-0 place-items-center rounded-full bg-karta
                   text-ink-soft shadow-clay-sm disabled:opacity-40">
        <Icon name="chevron" size={16} />
      </button>
    </div>
  );
}

/**
 * Bo'sh ro'yxat.
 *
 * `katta` — bo'lim butunlay bo'sh (filtr tegilmagan). Faqat
 * o'shanda yozish tugmasi qaytadan katta bo'lib chiqadi: bo'sh
 * ekranda undan boshqa qiladigan ish yo'q. Filtr natijasi bo'sh
 * chiqqanida esa odamga "boshqa filtrni ko'ring" degan bir qator
 * yetadi.
 */
function Bosh({ katta, onYangi }: { katta: boolean; onYangi: () => void }) {
  if (!katta) {
    return (
      <p className="mx-auto mt-10 max-w-xs text-center text-[13px] leading-snug text-ink-dim">
        {t("masalaBoshFiltr")}
      </p>
    );
  }
  return (
    <div className="mt-10 flex flex-col items-center px-6 text-center">
      <span className="grid size-14 place-items-center rounded-3xl bg-brand-blue/12
                       text-brand-blue-t">
        <Icon name="pencil" size={24} />
      </span>
      <p className="mt-3 font-display text-[15px]">{t("masalaBoshSarlavha")}</p>
      <p className="mt-1 max-w-xs text-[12.5px] leading-snug text-ink-dim">
        {t("masalaYozIzoh")}
      </p>
      <button type="button" onClick={onYangi}
        className="tugma-3d mt-4 flex min-h-12 items-center gap-2 rounded-clay
                   bg-brand-blue px-5 py-3 text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
        <Icon name="plus" size={18} />
        <span className="font-display text-[14px] leading-none">{t("masalaYoz")}</span>
      </button>
    </div>
  );
}
