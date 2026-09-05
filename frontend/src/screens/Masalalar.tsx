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
import { t } from "../lib/matn";
import { MasalaKarta } from "../components/MasalaKarta";
import { SINFLAR } from "../lib/masalaSinf";
import * as MS from "../lib/masala";
import type { Masala, Tartib } from "../lib/masala";
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
  const [yana, setYana] = useState(false);
  const [sahifa, setSahifa] = useState(0);
  const [holat, setHolat] = useState<"yuklanmoqda" | "tayyor" | "xato">("yuklanmoqda");

  /**
   * Ro'yxatni oladi.
   *
   * `qoshimcha` — "yana" tugmasi bosilganda: natija ustiga
   * QO'SHILADI, almashtirilmaydi. Almashtirilsa, uzun ro'yxatni
   * ochgan odam har safar boshiga qaytib tushardi.
   */
  const yukla = useCallback(async (s: number, qoshimcha: boolean) => {
    if (!qoshimcha) setHolat("yuklanmoqda");
    try {
      const d = await MS.royxat(sinf, tartib, s);
      setRoyxat((eski) => (qoshimcha ? [...eski, ...d.masalalar] : d.masalalar));
      setYana(d.yana);
      setSahifa(s);
      setHolat("tayyor");
    } catch {
      // Bo'sh ekran o'rniga xato yozuvi: internetsiz ochgan odam
      // "bu yerda hech narsa yo'q ekan" deb chiqib ketmasin.
      if (!qoshimcha) setHolat("xato");
    }
  }, [sinf, tartib]);

  // Saralash yoki sinf o'zgarsa — birinchi sahifadan qaytadan.
  useEffect(() => { void yukla(0, false); }, [yukla]);

  const almashtir = (k: Tartib) => { tebrat("tanlov"); setTartib(k); };
  const sinfniTanla = (k: number | null) => { tebrat("tanlov"); setSinf(k); };

  /* Filtr tegilmagan bo'lsa — bo'lim haqiqatan bo'sh. Tegilgan
     bo'lsa esa "bu filtrda yo'q" degani va u yerda katta "yozing"
     tugmasi noto'g'ri javob bo'lardi. */
  const bosh = holat === "tayyor" && royxat.length === 0;
  const butunlayBosh = bosh && sinf === null && tartib === "yangi";

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

      {yana && (
        <button type="button" onClick={() => void yukla(sahifa + 1, true)}
          className="clay-press mt-3 w-full rounded-clay bg-karta py-3 text-[13px]
                     text-ink-soft shadow-clay-sm">
          {t("masalaYana")}
        </button>
      )}
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
