/**
 * "24" o'yinining taxtasi.
 *
 * ─────────────────── NEGA IFODA YOZILMAYDI ───────────────────
 *
 * Birinchi o'yda ekranda satr bo'lishi kerakdek tuyuladi: odam
 * `8 ÷ (3 − 8 ÷ 3)` deb yozadi. Lekin telefonda bu ishlamaydi —
 * qavslarni joyiga qo'yish, kursorni surish, xatoni tuzatish
 * matematikadan ko'ra ko'proq vaqt oladi va o'yin klaviatura bilan
 * kurashishga aylanadi.
 *
 * Shuning uchun bu yerda BIRLASHTIRISH usuli: ikki son va bitta amal
 * bosiladi, ikkalasi o'rniga natijasi qoladi. To'rtta sondan uchta,
 * uchtadan ikkita, oxirida bittasi. Har birlashtirish o'zi bitta qavs —
 * ya'ni qavs degan tushuncha umuman kerak emas, lekin uning butun kuchi
 * saqlanadi.
 *
 * Yo'l boshi berk chiqsa "Ortga qaytar" bor: bu o'yinda urinib ko'rish
 * xato emas, USUL. Cheklangan qaytarish esa odamni hisoblab bosishga
 * emas, ehtiyot bo'lib bosishga majbur qilardi.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { OyinSahna } from "./Sahna";
import { Konfetti } from "../Konfetti";
import { Icon } from "../../lib/icons";
import { UNIT_COLORS } from "../../lib/types";
import { t } from "../../lib/matn";
import { tebrat } from "../../lib/qobiq";
import {
  AMALLAR, birlashtir, kasrMatn, sondan, yangiTopishmoq, yechim, yigirmaTortmi,
} from "../../lib/oyin/yigirma";
import type { Amal, Kasr } from "../../lib/oyin/yigirma";
import type { Daraja, Oyin, OyinNatija } from "../../lib/oyin/tur";

/** Topishmoqni tashlab yuborish necha soniya turadi. */
const OTKAZ_JAZO = 20;
/** Yechilgandan keyin "Topding!" qancha ko'rinadi. */
const NISHONLASH = 1100;

interface Props {
  oyin: Oyin;
  daraja: Daraja;
  onChiq: () => void;
  onTugadi: (n: OyinNatija) => void;
  yakun: ReactElement | null;
}

export function YigirmaTort({ oyin, daraja, onChiq, onTugadi, yakun }: Props) {
  const jamiVaqt = (oyin.vaqt ?? [180, 180, 180])[daraja - 1];

  const [raqamlar, setRaqamlar] = useState<number[]>(() => yangiTopishmoq(daraja));
  const [toshlar, setToshlar] = useState<Kasr[]>(() => raqamlar.map(sondan));
  const [tanlangan, setTanlangan] = useState<number | null>(null);
  const [amal, setAmal] = useState<Amal | null>(null);
  /** Har qadamdagi taxta — "Ortga qaytar" shu ro'yxatdan oladi. */
  const [tarix, setTarix] = useState<Kasr[][]>([]);
  const [yechilgan, setYechilgan] = useState(0);
  /** Yechilgan lahza: konfetti va "Topding!" uchun. */
  const [nishon, setNishon] = useState(0);
  /** Tashlab yuborilgan topishmoqning yechimi — bir necha soniya turadi. */
  const [korsatilgan, setKorsatilgan] = useState<string | null>(null);
  const [qolganMs, setQolganMs] = useState(jamiVaqt * 1000);
  const [tugadi, setTugadi] = useState(false);

  const muddat = useRef(0);
  const tugaganRef = useRef(false);
  const yechilganRef = useRef(0);
  yechilganRef.current = yechilgan;

  /** Yangi topishmoq qo'yadi va taxtani tozalaydi. */
  const yangi = useCallback((d: Daraja) => {
    const r = yangiTopishmoq(d);
    setRaqamlar(r);
    setToshlar(r.map(sondan));
    setTanlangan(null);
    setAmal(null);
    setTarix([]);
  }, []);

  const tugat = useCallback(() => {
    if (tugaganRef.current) return;
    tugaganRef.current = true;
    setTugadi(true);
    tebrat("yutuq");
    onTugadi({ ball: yechilganRef.current, savollar: yechilganRef.current });
  }, [onTugadi]);

  useEffect(() => {
    muddat.current = Date.now() + jamiVaqt * 1000;
    const id = setInterval(() => {
      const q = muddat.current - Date.now();
      setQolganMs(q);
      if (q <= 0) tugat();
    }, 100);
    return () => clearInterval(id);
    // Soat BIR MARTA ishga tushadi va o'yin oxirigacha shu bo'yicha
    // yuradi. Bog'liqlik qo'shilsa, u har javobda qayta o'rnatilib,
    // hisob noldan boshlanardi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------- harakatlar */

  const toshBos = (i: number) => {
    if (korsatilgan || nishon) return;

    // Hech narsa tanlanmagan — birinchi sonni olamiz.
    if (tanlangan === null) { setTanlangan(i); tebrat("tanlov"); return; }
    // O'sha sonning o'zi qayta bosildi — tanlov bekor bo'ladi.
    if (tanlangan === i) { setTanlangan(null); setAmal(null); return; }
    // Amal hali tanlanmagan — bosilgan son yangi "birinchi" bo'ladi.
    // (Ikki sonni tanlab, keyin amalni bosish ham tabiiy ko'rinardi,
    // lekin unda `−` va `÷` da tartib noaniq bo'lib qolardi: qaysi
    // sondan qaysi biri ayiriladi?)
    if (!amal) { setTanlangan(i); tebrat("tanlov"); return; }

    const natija = birlashtir(toshlar[tanlangan], toshlar[i], amal);
    if (!natija) { tebrat("xato"); return; }   // nolga bo'lish

    const yangiTaxta = toshlar
      .filter((_, k) => k !== tanlangan && k !== i)
      .concat(natija);

    setTarix((x) => [...x, toshlar]);
    setToshlar(yangiTaxta);
    setTanlangan(null);
    setAmal(null);

    if (yangiTaxta.length === 1 && yigirmaTortmi(yangiTaxta[0])) {
      tebrat("yutuq");
      setYechilgan((n) => n + 1);
      setNishon((n) => n + 1);
      setTimeout(() => {
        if (tugaganRef.current) return;
        setNishon(0);
        yangi(daraja);
      }, NISHONLASH);
    } else {
      tebrat("tanlov");
    }
  };

  const qaytar = () => {
    if (!tarix.length || nishon) return;
    setToshlar(tarix[tarix.length - 1]);
    setTarix((x) => x.slice(0, -1));
    setTanlangan(null);
    setAmal(null);
    tebrat("tanlov");
  };

  /**
   * Topishmoqni tashlab yuborish.
   *
   * Yechim KO'RSATILADI — va bu bilib qilingan: javobni ko'rmagan odam
   * "yechimi yo'q edi" degan xulosaga keladi va o'yinga ishonchi
   * yo'qoladi. Yigirma soniya jazo esa "qiyinini tashlab, osonini
   * kutish" yo'lini yopadi.
   */
  const otkaz = () => {
    if (nishon || korsatilgan) return;
    const y = yechim(raqamlar);
    muddat.current -= OTKAZ_JAZO * 1000;
    setQolganMs(muddat.current - Date.now());
    setKorsatilgan(y ?? "—");
    tebrat("xato");
    setTimeout(() => {
      if (tugaganRef.current) return;
      setKorsatilgan(null);
      yangi(daraja);
    }, 2600);
  };

  if (tugadi) return yakun;

  const rang = UNIT_COLORS[oyin.rang];
  const soniya = Math.max(0, Math.ceil(qolganMs / 1000));

  return (
    <OyinSahna
      oyin={oyin} daraja={daraja} onChiq={onChiq}
      ball={yechilgan} ballNomi={t("oyinBall")}
      qolgan={qolganMs / (jamiVaqt * 1000)} soniya={soniya}
    >
      {/* ---- maqsad ---- */}
      <div className="mt-4 text-center">
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5
                          font-display text-[13px] text-white ${rang.bg} shadow-clay-sm`}>
          <Icon name="equals" size={14} />
          {t("oyin24Nishon")}
        </span>
      </div>

      {/* ---- taxta ----
          Balandligi QAT'IY: toshlar birlashgani sari ularning soni
          to'rtdan bittagacha kamayadi va maydon bo'yiga qisqarsa, pastdagi
          amallar qatori har bosishda yuqoriga sakrab, barmoq ostidan
          qochib ketardi. */}
      <div className="relative my-4 grid min-h-[190px] flex-1 place-items-center rounded-clay
                      bg-sahna/85 p-4 ring-1 ring-track ring-inset backdrop-blur-sm">
        {nishon > 0 && <Konfetti key={nishon} />}

        {korsatilgan !== null ? (
          <div className="px-1 text-center font-display text-[17px] leading-snug break-words text-ink">
            {t("oyin24Yechim", { y: korsatilgan })}
          </div>
        ) : nishon > 0 ? (
          <div className="az-xabar text-center">
            <div className="text-[46px] leading-none">🎉</div>
            <div className="mt-2 font-display text-[21px] text-brand-green-d">
              {t("oyin24Topildi")}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {toshlar.map((k, i) => (
              <button key={`${k.matn}-${i}`} type="button" onClick={() => toshBos(i)}
                className={`clay-press grid size-[68px] place-items-center rounded-[22px]
                            font-display leading-none transition-colors
                            ${kasrMatn(k).length > 3 ? "text-[19px]" : "text-[26px]"}
                            ${tanlangan === i
                              ? `${rang.bg} text-white shadow-clay`
                              : "bg-karta text-ink shadow-clay-sm"}`}>
                {kasrMatn(k)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---- amallar ---- */}
      <div className="grid grid-cols-4 gap-2.5">
        {AMALLAR.map((a) => (
          <button key={a} type="button" disabled={tanlangan === null}
            onClick={() => { setAmal(a); tebrat("tanlov"); }}
            className={`clay-press grid min-h-[58px] place-items-center rounded-clay
                        font-display text-[26px] transition-colors
                        ${amal === a
                          ? `${rang.bg} text-white shadow-clay`
                          : "bg-karta text-ink shadow-clay-sm"}
                        ${tanlangan === null ? "opacity-40" : ""}`}>
            {a}
          </button>
        ))}
      </div>

      {/* ---- pastki tugmalar ---- */}
      <div className="mt-2.5 flex gap-2.5">
        <button type="button" onClick={qaytar} disabled={!tarix.length}
          className={`clay-press flex flex-1 items-center justify-center gap-1.5 rounded-clay
                      bg-karta py-3 text-[13px] text-ink-soft shadow-clay-sm
                      ${tarix.length ? "" : "opacity-40"}`}>
          <Icon name="repeat" size={16} />
          {t("oyin24Qaytar")}
        </button>
        <button type="button" onClick={otkaz}
          className="clay-press flex flex-1 items-center justify-center gap-1.5 rounded-clay
                     bg-karta py-3 text-[13px] text-ink-soft shadow-clay-sm">
          {t("oyin24Otkaz")}
          <span className="text-brand-red">−{OTKAZ_JAZO}s</span>
        </button>
      </div>

      <p className="mt-2 text-center text-[11px] text-ink-soft/80">
        {tanlangan === null ? t("oyin24Sonlar") : t("oyin24Qoida")}
      </p>
    </OyinSahna>
  );
}
