/**
 * Oqim o'yinlarining ekrani — oltitasi shu bitta komponent bilan ishlaydi.
 *
 * Komponent QAYSI o'yin ekanini bilmaydi: u `oyin.gen(daraja)` dan savol
 * so'raydi, javobni taqqoslaydi va keyingisiga o'tadi. Shu sabab yangi
 * oqim o'yini qo'shish uchun bu faylga umuman tegilmaydi.
 *
 * ──────────────────── VAQT JAZOSI, JON EMAS ────────────────────
 *
 * Xato qilinganda o'yin TUGAMAYDI — vaqtdan uch soniya olinadi. Uchta
 * jon berish ham mumkin edi, lekin unda o'yin birinchi daqiqada
 * tugab qolardi va eng yomoni: qiyin savol chiqqan odam javob berishga
 * QO'RQADI. Vaqt jazosi esa harakatni to'xtatmaydi — shoshilib xato
 * qilgan odam baribir o'ynashda davom etadi, faqat kamroq ball oladi.
 *
 * ──────────────────── XATO KO'RSATILADI ────────────────────
 *
 * Xato javobda to'g'ri variant yashil bo'lib yonadi va ekran yarim
 * soniya kutadi. Bu vaqt yo'qotish emas — o'yinning yagona o'rgatuvchi
 * lahzasi: javobni ko'rmagan odam bir xil xatoni yigirma marta
 * takrorlaydi va o'yindan hech narsa o'rganmaydi.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { OyinSahna, Sanoq } from "./Sahna";
import { HA, YOQ } from "../../lib/oyin/savollar";
import { t } from "../../lib/matn";
import { tebrat } from "../../lib/qobiq";
import type { Daraja, OqimSavol, Oyin, OyinNatija } from "../../lib/oyin/tur";

/** Xato javob necha millisekund vaqt oladi. */
const JAZO = 3000;
/** To'g'ri javobdan keyingi qisqa to'xtash. */
const TOGRI_KUT = 200;
/** Xato javobdan keyingi to'xtash — to'g'ri javobni ko'rishga yetadi. */
const XATO_KUT = 750;

interface Props {
  oyin: Oyin;
  daraja: Daraja;
  onChiq: () => void;
  /** O'yin tugadi — natija tashqarida saqlanadi. */
  onTugadi: (n: OyinNatija) => void;
  /** Yakun ekrani (natija saqlangandan keyin tashqaridan beriladi). */
  yakun: ReactElement | null;
}

type Holat = "sanoq" | "oyin" | "tugadi";

export function Oqim({ oyin, daraja, onChiq, onTugadi, yakun }: Props) {
  const gen = oyin.gen!;
  const jamiVaqt = (oyin.vaqt ?? [60, 60, 60])[daraja - 1];

  const [holat, setHolat] = useState<Holat>("sanoq");
  const [savol, setSavol] = useState<OqimSavol>(() => gen(daraja));
  const [ball, setBall] = useState(0);
  const [berilgan, setBerilgan] = useState(0);
  const [qolganMs, setQolganMs] = useState(jamiVaqt * 1000);
  /** Bosilgan variant va u to'g'rimi — tugmalarni bo'yash uchun. */
  const [javob, setJavob] = useState<{ v: string; togri: boolean } | null>(null);

  /**
   * Tugash vaqti — SANOQ emas, MUDDAT saqlanadi.
   *
   * Har yuz millisekundda "qolgan vaqtdan 100 ni ayirish" ham mumkin
   * edi, lekin `setInterval` aniq 100 ms da chaqirilmaydi va xatolik
   * yig'ilib boradi: bir daqiqalik o'yin haqiqatda 63–65 soniya davom
   * etardi. Muddat bilan esa xatolik yig'ilmaydi.
   */
  const muddat = useRef(0);
  const tugaganRef = useRef(false);

  // Soat ichida eng so'nggi ball kerak, lekin uni bog'liqlikka qo'shsak
  // interval har javobda qayta o'rnatilardi — shuning uchun havola
  // orqali o'qiladi. Qiymat har renderda yangilanib turadi.
  const ballRef = useRef(0);
  const berilganRef = useRef(0);
  ballRef.current = ball;
  berilganRef.current = berilgan;

  /**
   * Javob berilganini bildiruvchi QULF.
   *
   * `javob` holati ham shu ishni qiladi, lekin u faqat keyingi
   * chizishda yangilanadi. Tez o'yinda odam ikkala tugmani deyarli bir
   * vaqtda bosib ulguradi va o'shanda ikkinchi bosish hali eski,
   * bo'sh `javob` ni ko'radi — natijada bitta savol ikki marta
   * hisoblanardi. Havola esa darhol yopiladi.
   */
  const qulf = useRef(false);

  const tugat = useCallback((oxirgiBall: number, oxirgiSavol: number) => {
    if (tugaganRef.current) return;
    tugaganRef.current = true;
    setHolat("tugadi");
    tebrat("yutuq");
    onTugadi({ ball: oxirgiBall, savollar: oxirgiSavol });
  }, [onTugadi]);

  /* Soat. Sanoq tugagandan keyin yuradi. */
  useEffect(() => {
    if (holat !== "oyin") return;
    muddat.current = Date.now() + qolganMs;
    const id = setInterval(() => {
      const q = muddat.current - Date.now();
      setQolganMs(q);
      if (q <= 0) tugat(ballRef.current, berilganRef.current);
    }, 100);
    return () => clearInterval(id);
    // Soat FAQAT bir marta ishga tushadi: `qolganMs` bog'liqlikda bo'lsa,
    // interval har yuz millisekundda qayta o'rnatilib turardi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holat]);

  const bos = (v: string) => {
    if (holat !== "oyin" || qulf.current) return;
    qulf.current = true;
    const togri = v === savol.javob;
    setJavob({ v, togri });
    setBerilgan((n) => n + 1);

    if (togri) {
      setBall((n) => n + 1);
      tebrat("togri");
    } else {
      tebrat("xato");
      // Jazo MUDDATDAN olinadi, ko'rsatilayotgan sondan emas — aks holda
      // keyingi soat urishida u eski qiymatdan qaytadan hisoblanib,
      // jazo bekor bo'lib qolardi.
      muddat.current -= JAZO;
      setQolganMs(muddat.current - Date.now());
    }

    setTimeout(() => {
      if (tugaganRef.current) return;
      qulf.current = false;
      setJavob(null);
      setSavol(gen(daraja));
    }, togri ? TOGRI_KUT : XATO_KUT);
  };

  if (holat === "tugadi") return yakun;

  const soniya = Math.max(0, Math.ceil(qolganMs / 1000));

  return (
    <OyinSahna
      oyin={oyin} daraja={daraja} onChiq={onChiq}
      ball={ball} ballNomi={t("oyinBall")}
      qolgan={qolganMs / (jamiVaqt * 1000)} soniya={soniya}
    >
      {holat === "sanoq" ? (
        <Sanoq onTugadi={() => setHolat("oyin")} />
      ) : (
        <>
          {/* ---- savol ---- */}
          <div className="my-4 grid flex-1 place-items-center rounded-clay bg-sahna/85 px-3 py-8
                          ring-1 ring-track ring-inset backdrop-blur-sm">
            <div className="text-center">
              {/* Shart — savolning o'zi EMAS, berilgani. Shuning uchun u
                  kichikroq va xiraroq: ko'z avval savolga tushishi kerak. */}
              {/* `whitespace-pre-line` SHART: tarozida ikki shart bo'lishi
                  mumkin va ular alohida qatorda turishi kerak. Bo'sh joy
                  bilan ajratilganda HTML ularni bitta bo'shliqqa
                  siqib qo'yadi — natijada "🍋 + 🥕 = 30 🍋 − 🥕 = 2" degan
                  o'qib bo'lmaydigan qator chiqardi. */}
              {savol.ost && (
                <div className="mb-4 text-[19px] leading-relaxed whitespace-pre-line
                                text-ink-soft sm:text-[22px]">
                  {savol.ost}
                </div>
              )}
              {/* `key` bilan har savol qaytadan yasaladi — shunda paydo
                  bo'lish animatsiyasi ham qaytadan o'ynaydi va odam
                  savol ALMASHGANINI ko'radi. Busiz sonlar joyida jimgina
                  o'zgarardi va tez o'yinda buni sezmay qolish oson. */}
              <div key={savol.matn}
                className="az-xabar font-display text-[30px] leading-tight text-ink sm:text-[38px]">
                {savol.matn}
              </div>
            </div>
          </div>

          {/* ---- javoblar ---- */}
          <div className={savol.variantlar.length === 2
            ? "grid grid-cols-2 gap-3"
            : "grid grid-cols-2 gap-2.5"}>
            {savol.variantlar.map((v) => (
              <Tugma key={v} qiymat={v} savol={savol} javob={javob} on={() => bos(v)} />
            ))}
          </div>
        </>
      )}
    </OyinSahna>
  );
}

/**
 * Bitta javob tugmasi.
 *
 * Uch holati bor va ranglar ATAYLAB qat'iy:
 *   bosilmagan   oq karta
 *   to'g'ri      yashil — bosilgani ham, ko'rsatilgani ham
 *   xato         qizil — faqat bosilgani
 *
 * Xato javobdan keyin TO'G'RI variant ham yashil bo'lib yonadi. Faqat
 * qizilni ko'rsatib qo'yish yetarli emas: odam nima xato qilganini
 * biladi, lekin to'g'risi nima ekanini bilmaydi.
 */
function Tugma({ qiymat, savol, javob, on }: {
  qiymat: string;
  savol: OqimSavol;
  javob: { v: string; togri: boolean } | null;
  on: () => void;
}) {
  const bosilgan = javob?.v === qiymat;
  const togriVariant = qiymat === savol.javob;
  const korsat = javob !== null && togriVariant;
  const xato = bosilgan && !javob?.togri;

  const holatKlass = korsat
    ? "bg-brand-green text-white shadow-[0_5px_0_var(--color-brand-green-d)]"
    : xato
      ? "bg-brand-red text-white shadow-clay-sm"
      : "bg-karta text-ink shadow-clay-sm";

  // "To'g'rimi?" o'yinining ikki tugmasi — belgi va yozuv birga.
  // Yolg'iz belgi tez o'yinda chalkashtiradi: ✅ va ❌ chekka ko'rishda
  // bir-biriga o'xshaydi, so'z esa aniq ajratadi.
  const ikkilik = qiymat === HA || qiymat === YOQ;

  return (
    <button type="button" onClick={on} disabled={javob !== null}
      className={`clay-press flex min-h-[62px] items-center justify-center gap-2 rounded-clay
                  font-display transition-colors ${holatKlass}
                  ${savol.belgi ? "text-[30px]" : "text-[21px]"}
                  ${ikkilik ? "flex-col gap-1 py-2.5" : ""}`}>
      {ikkilik ? (
        <>
          <span className="text-[24px] leading-none">{qiymat}</span>
          <span className="text-[13px] leading-none">
            {qiymat === HA ? t("oyinTogri") : t("oyinXatoTugma")}
          </span>
        </>
      ) : (
        qiymat
      )}
    </button>
  );
}
