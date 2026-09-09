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
import { TangaHisob } from "../components/TangaHisob";
import { SINFLAR } from "../lib/masalaSinf";
import * as MS from "../lib/masala";
import type { Holat, Masala, Tartib } from "../lib/masala";
import { tebrat, useOrqaga } from "../lib/qobiq";

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

/**
 * Yonlamasiga suriladigan tasma.
 *
 * Chetlari EKRAN chetiga chiqadi (`-mx-4 px-4`): shunda oxirgi
 * tugmacha chetga tegib, "yana bor" degan ishorani beradi. Ichki
 * chegara ichida u to'satdan uzilgandek ko'rinardi.
 */
const TASMA =
  "-mx-4 flex overflow-x-auto px-4 [-ms-overflow-style:none] " +
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

interface Props {
  onOch: (id: number) => void;
  onYangi: () => void;
  onMenikilar: () => void;
  onBack: () => void;
}

export function Masalalar({ onOch, onYangi, onMenikilar, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);
  const [tartib, setTartib] = useState<Tartib>("yangi");
  const [sinf, setSinf] = useState<number | null>(null);
  const [royxat, setRoyxat] = useState<Masala[]>([]);
  const [sahifa, setSahifa] = useState(0);
  const [sahifalar, setSahifalar] = useState(1);
  const [jami, setJami] = useState(0);

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

  /** Joriy saralashning nomi — natija qatorida yozuv bo'lib turadi. */
  const tartibNomi = (TARTIBLAR.find((x) => x.kod === tartib) ?? TARTIBLAR[0]).nom();

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
      setJami(d.jami);
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
  const butunlayBosh = bosh && sinf === null && tartib === "yangi"
    && yechilganlik === "hammasi";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-10">
      {/* ---- sarlavha va amallar ----
          ENG TOR EKRANGA moslangan va bu shart: Telegram Mini App
          320 piksellik telefonlarda ham ochiladi, bu qatorda esa
          beshta narsa bor. Uchta o'lchov nuqtasi:

            <360px   "Yozish" yozuvi yashirinadi, tugma faqat + belgisi
            <400px   "Mening" yozuvi yashirinadi, faqat qalam qoladi
            >=400px  hammasi yozuvi bilan

          Belgilar QOLADI, yozuvlar ketadi: tugmaning o'lchami
          o'zgarmaydi, ya'ni barmoq o'sha joyni topaveradi. */}
      <div className="flex items-center gap-2">
        {!ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press grid size-9 shrink-0 place-items-center rounded-full
                       bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={18} className="rotate-180" />
          </button>
        )}

        {/* Sarlavha bloki — ikki qator. Shior nima uchun kerak:
            bo'lim nomi ("Masalalar") uning nimaligini aytadi, lekin
            nima uchun kerakligini aytmaydi. Birinchi marta kirgan
            odam aynan shu ikkinchi savol bilan keladi. */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[19px] leading-tight">
            {t("masalalar")}
          </h1>
          <p className="truncate text-[11px] leading-tight text-ink-dim">
            {t("masalalarShior")}
          </p>
        </div>

        {/* "Mening" — ikkinchi darajali amal va shunday ham
            ko'rinadi: yozuv, karta emas. */}
        <button type="button" onClick={onMenikilar} title={t("masalaMenikilar")}
          aria-label={t("masalaMenikilar")}
          className="clay-press flex h-9 shrink-0 items-center gap-1 rounded-full px-2
                     text-[12.5px] text-ink-dim">
          <Icon name="pencil" size={15} className="shrink-0" />
          <span className="hidden min-[400px]:inline">{t("masalaMenikilarQisqa")}</span>
        </button>

        {/* Tanga hisobi — bo'limning butun iqtisodi shu songa
            nisbatan o'lchanadi ("+10", "15 tanga"). Streak, XP va
            liga ATAYLAB yo'q: ular boshqa ekranlarda o'z joyida
            turadi va bu yerda to'rtta bir xil yorliq bo'lib,
            hech biri o'qilmasdi. */}
        <TangaHisob />

        {/* Asosiy amal — ro'yxatning ustida emas, YONIDA. Matni
            qisqa, chunki uning izohi keyingi ekranning o'zi. */}
        <button type="button" onClick={onYangi} title={t("masalaYoz")}
          aria-label={t("masalaYoz")}
          className="tugma-3d flex h-9 shrink-0 items-center gap-1 rounded-full
                     bg-brand-purple px-3 text-white shadow-clay-sm">
          <Icon name="plus" size={16} />
          <span className="hidden font-display text-[13px] leading-none min-[360px]:inline">
            {t("masalaYozQisqa")}
          </span>
        </button>
      </div>

      {/* ---- saralash ----
          Tugmachalar ko'tarilgan, tanlangani binafsha: bu ilovaning
          o'z tili — hamma joyda tanlov shunday ko'rsatiladi. */}
      <div className={`${TASMA} mt-3 gap-1.5`}>
        {TARTIBLAR.map((x) => {
          const faol = tartib === x.kod;
          return (
            <button key={x.kod} type="button" onClick={() => almashtir(x.kod)}
              className={`clay-press flex h-8 shrink-0 items-center gap-1.5 rounded-full
                          px-3.5 text-[12.5px] whitespace-nowrap shadow-clay-sm ${
                faol
                  ? "bg-brand-purple font-display text-white"
                  : "bg-karta text-ink-soft"}`}>
              <span aria-hidden className="text-[12px] leading-none">{x.belgi}</span>
              {x.nom()}
            </button>
          );
        })}
      </div>

      {/* ---- sinf filtri ----
          Saralashdan PASTROQ og'irlikda: past, soyasiz va botiq.
          Ikkalasi bir xil bo'lsa, ekran tepasida sakkizta bir xil
          tugmacha turib, qaysi biri nima qilishi bilinmasdi. */}
      <div className={`${TASMA} mt-2 gap-1.5`}>
        <Filtr faol={sinf === null} on={() => sinfniTanla(null)}>
          {t("masalaHammaSinf")}
        </Filtr>
        {SINFLAR.map((s) => (
          <Filtr key={s.kod} faol={sinf === s.kod} on={() => sinfniTanla(s.kod)}>
            {s.nom}
          </Filtr>
        ))}
      </div>

      {/* ---- yechilganlik filtri ----
          Uchta tanlov va ular boshqa ikkalasidan FARQ QILADI: sinf
          masalaning o'zi haqida, bu esa SIZ haqingizda. Shuning
          uchun ular alohida qatorda va boshqa shaklda turadi. */}
      <div className={`${TASMA} mt-2 gap-1.5`}>
        {HOLATLAR.map((x) => (
          <button key={x.kod} type="button" onClick={() => holatniTanla(x.kod)}
            className={`clay-press flex h-7 shrink-0 items-center gap-1 rounded-full px-3
                        text-[11.5px] whitespace-nowrap transition-colors ${
              yechilganlik === x.kod
                ? "bg-brand-green font-display text-white"
                : "shadow-ichki bg-sahna text-ink-dim"}`}>
            {x.ic && <Icon name={x.ic} size={12} />}
            {x.nom()}
          </button>
        ))}
      </div>

      {/* ---- natija qatori ----
          Son filtr qatoridan SHU YERGA ko'chdi. Sabab: u filtrning
          bir bo'lagi emas, uning NATIJASI. Qator oxirida turganda u
          "yana bitta tugma" bo'lib ko'rinardi va sonni o'qish uchun
          tasmani surish kerak bo'lardi.

          O'ngda saralash nomi turadi — u ham natijaga tegishli:
          "nechta topildi va qanday tartibda" degan ikki savol bitta
          qatorda javob topadi. Bu YOZUV, tugma emas: saralash
          yuqorida allaqachon tanlanadi va ikkinchi boshqaruv
          "qaysi biri ishlayapti?" degan savol tug'dirardi. */}
      {holat === "tayyor" && jami > 0 && (
        <div className="mt-2.5 flex items-center gap-2 px-1 text-[12px]">
          <span className="flex min-w-0 items-center gap-1.5 text-ink-soft">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand-green" />
            <span className="truncate">{t("masalaTopildi", { n: jami })}</span>
          </span>
          {/* Yo'nalish tugmasi — o'sha saralashni teskarisiga
              o'giradi ("Yangi" → eng eskisi birinchi).

              Bu yuqoridagi tasmaning takrori EMAS: u yerda QAYSI
              saralash ekani tanlanadi, bu yerda esa uning
              YO'NALISHI. Alohida "eski" va "oson" kodlari qo'shish
              ham mumkin edi, lekin u paytda tasmada sakkizta
              tugmacha bo'lardi va ularning yarmi ikkinchi yarmining
              aksi ekani faqat nomidan taxmin qilinardi.

              Tor ekranda "Saralash:" yozuvi ketadi, o'q qoladi:
              o'qning o'zi yo'nalishni to'liq aytadi. */}
          <button type="button" onClick={teskariAlmashtir}
            aria-label={t(teskari ? "masalaEskidan" : "masalaYangidan")}
            className="clay-press ml-auto flex shrink-0 items-center gap-1 rounded-full
                       bg-karta px-2.5 py-1 text-ink-dim shadow-clay-sm">
            <span className="hidden min-[360px]:inline">{t("masalaSaralash")}:</span>
            <b className="font-display text-brand-purple">{tartibNomi}</b>
            <Icon name="chevron" size={13}
              className={`shrink-0 text-brand-purple transition-transform ${
                teskari ? "-rotate-90" : "rotate-90"}`} />
          </button>
        </div>
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
              ? "bg-brand-purple font-display text-white shadow-clay-sm"
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
      <span className="grid size-14 place-items-center rounded-3xl bg-brand-purple/12
                       text-brand-purple">
        <Icon name="pencil" size={24} />
      </span>
      <p className="mt-3 font-display text-[15px]">{t("masalaBoshSarlavha")}</p>
      <p className="mt-1 max-w-xs text-[12.5px] leading-snug text-ink-dim">
        {t("masalaYozIzoh")}
      </p>
      <button type="button" onClick={onYangi}
        className="tugma-3d az-yaltir mt-4 flex items-center gap-2 rounded-clay
                   bg-brand-purple px-5 py-3 text-white shadow-clay">
        <Icon name="plus" size={18} />
        <span className="font-display text-[14px] leading-none">{t("masalaYoz")}</span>
      </button>
    </div>
  );
}

function Filtr(
  { faol, on, children }: { faol: boolean; on: () => void; children: React.ReactNode },
) {
  return (
    <button type="button" onClick={on}
      className={`clay-press flex h-7 shrink-0 items-center rounded-full px-3 text-[11.5px]
                  whitespace-nowrap transition-colors ${
        faol
          ? "bg-brand-blue font-display text-white"
          : "shadow-ichki bg-sahna text-ink-dim"}`}>
      {children}
    </button>
  );
}
