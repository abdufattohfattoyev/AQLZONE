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
  const [holat, setHolat] = useState<"yuklanmoqda" | "tayyor" | "xato">("yuklanmoqda");

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
      const d = await MS.royxat(sinf, tartib, s, yechilganlik);
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
  }, [sinf, tartib, yechilganlik]);

  // Saralash, sinf yoki filtr o'zgarsa — birinchi sahifadan qaytadan.
  useEffect(() => { void yukla(0); }, [yukla]);

  const almashtir = (k: Tartib) => { tebrat("tanlov"); setTartib(k); };
  const sinfniTanla = (k: number | null) => { tebrat("tanlov"); setSinf(k); };
  const holatniTanla = (k: Holat) => { tebrat("tanlov"); setYechilganlik(k); };

  /* Filtr tegilmagan bo'lsa — bo'lim haqiqatan bo'sh. Tegilgan
     bo'lsa esa "bu filtrda yo'q" degani va u yerda katta "yozing"
     tugmasi noto'g'ri javob bo'lardi. */
  const bosh = holat === "tayyor" && royxat.length === 0;
  const butunlayBosh = bosh && sinf === null && tartib === "yangi"
    && yechilganlik === "hammasi";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-10">
      {/* ---- sarlavha va ikkita amal ---- */}
      <div className="flex items-center gap-2">
        {!ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press -ml-1 grid size-10 shrink-0 place-items-center rounded-2xl
                       text-ink-soft">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        {/* Sarlavha yonidagi "Mening" — ikkinchi darajali amal va
            shunday ham ko'rinadi: yozuv, karta emas. Ilgari u
            binafsha tugma yonidagi ikkinchi kvadrat tugma edi va
            ikkalasi bir xil og'irlikda turardi. */}
        <h1 className="shrink-0 font-display text-[17px] leading-none">{t("masalalar")}</h1>
        <button type="button" onClick={onMenikilar} title={t("masalaMenikilar")}
          className="clay-press flex min-w-0 shrink items-center gap-1 text-[12.5px]
                     text-ink-dim">
          <Icon name="pencil" size={14} className="shrink-0" />
          <span className="truncate">{t("masalaMenikilarQisqa")}</span>
        </button>

        {/* Asosiy amal — ro'yxatning ustida emas, YONIDA. Matni
            qisqa, chunki uning izohi keyingi ekranning o'zi. */}
        <button type="button" onClick={onYangi} title={t("masalaYoz")}
          className="tugma-3d ml-auto flex h-9 shrink-0 items-center gap-1 rounded-full
                     bg-brand-purple pr-3.5 pl-3 text-white shadow-clay-sm">
          <Icon name="plus" size={16} />
          <span className="font-display text-[13px] leading-none">{t("masalaYozQisqa")}</span>
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
        {/* Nechta topilgani — filtr ishlaganini shu son ko'rsatadi. */}
        {holat === "tayyor" && jami > 0 && (
          <span className="ml-auto flex shrink-0 items-center pl-2 text-[11.5px] text-ink-dim">
            {t("masalaJami", { n: jami })}
          </span>
        )}
      </div>

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
