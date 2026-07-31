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
 *
 * ──────────────────── ZANJIR: NEGA KERAK ────────────────────
 *
 * Har to'g'ri javob bir ball berganda o'yin TEKIS bo'lib qoladi: 40-savol
 * 4-savoldan hech nima bilan farq qilmaydi va o'yinchi shunchaki
 * "yana bittasi" ni bosaveradi. Ketma-ket javoblar esa o'yinga o'sish
 * beradi — uch to'g'ri javobdan keyin har biri ikki ball, oltitadan
 * keyin uch ball.
 *
 * Muhimi: zanjir XATODA uziladi va bu shoshilishga qarshi tabiiy
 * to'siq. Vaqt jazosi tezlikni jazolaydi, zanjir esa ehtiyotkorlikni
 * MUKOFOTLAYDI — ikkalasi birga o'ynaganda o'yin "tez bos" dan
 * "tez, lekin to'g'ri bos" ga aylanadi.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { OyinSahna, Sanoq } from "./Sahna";
import { HA, YOQ } from "../../lib/oyin/savollar";
import { raqibBali, sanoqniYoz } from "../../lib/oyin/duel";
import { t } from "../../lib/matn";
import { tebrat } from "../../lib/qobiq";
import type { Daraja, OqimSavol, Oyin, OyinNatija } from "../../lib/oyin/tur";

/** Xato javob necha millisekund vaqt oladi. */
const JAZO = 3000;

/**
 * Zanjir uzunligiga qarab bitta to'g'ri javob necha ball beradi.
 *
 * Ko'paytuvchi UCHTA bosqichda to'xtaydi. To'rtinchisi ham qo'shilishi
 * mumkin edi, lekin unda o'yin oxiridagi bitta xato butun natijani
 * yo'qqa chiqarardi — va o'shanda o'yinchi xatodan qo'rqib, javob
 * berishni sekinlashtiradi.
 */
const ballHisobi = (zanjir: number): number =>
  zanjir >= 6 ? 3 : zanjir >= 3 ? 2 : 1;

/**
 * Uzun zanjirda har to'g'ri javob shuncha millisekund vaqt QAYTARADI.
 *
 * Vaqt faqat olinadigan bo'lsa, o'yin oxiri doim bir xil: soat tugaydi.
 * Qaytarilgan vaqt esa yaxshi o'ynagan odamga o'yinni CHO'ZISH imkonini
 * beradi — va aynan shu "yana bir oz" hissi uni ekranda ushlab turadi.
 */
const MUKOFOT = 700;
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
  /** Shu o'yin va darajadagi eski rekord — o'yin PAYTIDA ko'rsatiladi. */
  rekord: number;
  /** Yakun ekrani (natija saqlangandan keyin tashqaridan beriladi). */
  yakun: ReactElement | null;
  /**
   * TAYYOR savollar — kunlik maydon uchun.
   *
   * Berilmasa o'yin savolni o'zi yasaydi (odatdagi mashq rejimi).
   * Berilsa esa ular TARTIB BILAN olinadi va yangisi yasalmaydi:
   * maydonda hamma bir xil savolni, bir xil ketma-ketlikda ko'rishi
   * shart, aks holda jadval hech narsani o'lchamaydi.
   *
   * Ro'yxat tugasa o'yin ham tugaydi. Amalda bunga yetib bo'lmaydi
   * (zaxira 40 ta, vaqt esa 45 soniya), lekin cheksiz aylantirish
   * xavfli bo'lardi: bir xil savolni ikkinchi marta ko'rgan odam
   * javobni eslab qoladi.
   */
  savollar?: OqimSavol[];
  /** Vaqtni tashqaridan belgilash — maydonda hamma bosqich teng. */
  vaqt?: number;
  /**
   * Raqib — duelda ekranda ikkinchi chiziq bo'lib yuradi.
   *
   * `sanoq` — uning har soniyadagi bali. Yakuniy son BERILMAYDI va
   * ko'rsatilmaydi ham: u ko'rinsa duel "nishonga urish" ga aylanadi,
   * o'yinchi kerakli ballni o'tishi bilan to'xtaydi.
   */
  raqib?: { nom: string; sanoq: number[] };
}

type Holat = "sanoq" | "oyin" | "tugadi";

export function Oqim({
  oyin, daraja, onChiq, onTugadi, rekord, yakun, savollar, vaqt, raqib,
}: Props) {
  const gen = oyin.gen!;
  const jamiVaqt = vaqt ?? (oyin.vaqt ?? [60, 60, 60])[daraja - 1];

  /**
   * Keyingi savol: tayyor ro'yxatdan yoki yangi yasalgan.
   *
   * Ro'yxat tugasa `null` qaytadi va o'yin tugaydi — bu holat faqat
   * nazariy, lekin uni ochiq qoldirsak ro'yxat tugagan payt
   * `undefined` savol ekranga chizilardi.
   */
  const keyingiSavol = useCallback(
    (n: number): OqimSavol | null =>
      savollar ? (savollar[n] ?? null) : gen(daraja),
    [savollar, gen, daraja],
  );

  const [holat, setHolat] = useState<Holat>("sanoq");
  const [savol, setSavol] = useState<OqimSavol>(() => keyingiSavol(0) ?? gen(daraja));
  const [ball, setBall] = useState(0);
  const [berilgan, setBerilgan] = useState(0);
  const [qolganMs, setQolganMs] = useState(jamiVaqt * 1000);
  /** Ketma-ket to'g'ri javoblar. Xatoda nolga tushadi. */
  const [zanjir, setZanjir] = useState(0);
  /** Bosilgan variant va u to'g'rimi — tugmalarni bo'yash uchun. */
  const [javob, setJavob] = useState<{ v: string; togri: boolean } | null>(null);
  /**
   * Oxirgi javobda nechta ball qo'shildi — savol ustida "+2" bo'lib
   * uchib chiqadi. Zanjir ishlayotganini SON bilan ko'rsatish kerak:
   * "olov chiqdi" degan belgi o'zi nima berayotganini aytmaydi.
   */
  const [qoshildi, setQoshildi] = useState(0);

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

  /**
   * O'yin qachon boshlangani va har soniyadagi ball.
   *
   * Vaqt DEVOR SOATI bo'yicha o'lchanadi, qolgan vaqtdan emas: qolgan
   * vaqt xato va kombo tufayli o'zgarib turadi, ya'ni undan "necha
   * soniya o'tdi" degan savolga to'g'ri javob chiqmaydi. Raqib chizig'i
   * esa aynan o'sha javobga tayanadi.
   */
  const boshlandi = useRef(0);
  const sanoqRef = useRef<number[]>([]);

  // Soat ichida eng so'nggi ball kerak, lekin uni bog'liqlikka qo'shsak
  // interval har javobda qayta o'rnatilardi — shuning uchun havola
  // orqali o'qiladi. Qiymat har renderda yangilanib turadi.
  const ballRef = useRef(0);
  const berilganRef = useRef(0);
  const xatoRef = useRef(0);
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
    // Oxirgi soniya ham yozilsin: o'yin tugagan lahzadagi ball
    // chiziqning eng oxirgi nuqtasi bo'ladi.
    sanoqniYoz(sanoqRef.current, jamiVaqt, oxirgiBall);
    onTugadi({
      ball: oxirgiBall, savollar: oxirgiSavol,
      xato: xatoRef.current, sanoq: [...sanoqRef.current],
    });
  }, [onTugadi, jamiVaqt]);

  /* Soat. Sanoq tugagandan keyin yuradi. */
  useEffect(() => {
    if (holat !== "oyin") return;
    boshlandi.current = Date.now();
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
    // Keyingi savolning o'rni SHU YERDA hisoblanadi, taymer ichida
    // emas: u yerda `berilganRef` allaqachon yangilangan bo'lishi ham,
    // bo'lmasligi ham mumkin va bitta savol o'tkazib yuborilardi.
    const keyingiOrin = berilganRef.current + 1;
    setJavob({ v, togri });
    setBerilgan((n) => n + 1);

    if (togri) {
      const yangiZanjir = zanjir + 1;
      const olingan = ballHisobi(yangiZanjir);
      setZanjir(yangiZanjir);
      setBall((n) => n + olingan);
      setQoshildi(olingan);
      tebrat("togri");
      // Uzun zanjirda vaqt biroz qaytariladi — o'yin cho'ziladi.
      if (yangiZanjir >= 3) {
        muddat.current += MUKOFOT;
        setQolganMs(muddat.current - Date.now());
      }
    } else {
      setZanjir(0);
      setQoshildi(0);
      xatoRef.current += 1;
      tebrat("xato");
      // Jazo MUDDATDAN olinadi, ko'rsatilayotgan sondan emas — aks holda
      // keyingi soat urishida u eski qiymatdan qaytadan hisoblanib,
      // jazo bekor bo'lib qolardi.
      muddat.current -= JAZO;
      setQolganMs(muddat.current - Date.now());
    }

    // Har javobdan keyin sanoq yangilanadi — raqib uchun chiziq shundan
    // yasaladi. Yozuv javob berilgan LAHZADA bo'lishi kerak, aks holda
    // ikki javob orasidagi sakrash chiziqda ko'rinmasdi.
    if (boshlandi.current) {
      sanoqniYoz(
        sanoqRef.current,
        (Date.now() - boshlandi.current) / 1000,
        togri ? ballRef.current + ballHisobi(zanjir + 1) : ballRef.current,
      );
    }

    setTimeout(() => {
      if (tugaganRef.current) return;
      const keyingi = keyingiSavol(keyingiOrin);
      if (!keyingi) {
        tugat(ballRef.current, berilganRef.current);
        return;
      }
      qulf.current = false;
      setJavob(null);
      setSavol(keyingi);
    }, togri ? TOGRI_KUT : XATO_KUT);
  };

  if (holat === "tugadi") return yakun;

  const soniya = Math.max(0, Math.ceil(qolganMs / 1000));

  // Raqibning SHU LAHZADAGI bali. Soat har 100 ms da yangilanadi,
  // ya'ni chiziq o'z-o'zidan harakatlanadi.
  const otgan = boshlandi.current ? (Date.now() - boshlandi.current) / 1000 : 0;
  const raqibHozir = raqib ? raqibBali(raqib.sanoq, otgan) : 0;
  const engKatta = Math.max(1, ball, raqibHozir);

  return (
    <OyinSahna
      oyin={oyin} daraja={daraja} onChiq={onChiq}
      ball={ball} ballNomi={t("oyinBall")}
      qolgan={qolganMs / (jamiVaqt * 1000)} soniya={soniya}
      zanjir={zanjir} rekordOshdi={rekord > 0 && ball > rekord}
    >
      {holat === "sanoq" ? (
        <Sanoq onTugadi={() => setHolat("oyin")} />
      ) : (
        <>
          {/* ---- raqib chizig'i (faqat duelda) ----
              Ikki chiziq yonma-yon: raqibniki tepada, o'zimniki
              pastda. SON ko'rsatiladi, lekin raqibning YAKUNIY bali
              emas — u hozirgacha to'plagani. Farqi katta: o'yinchi
              "quvib yetyapman" ni ko'radi, "yana 7 ta kerak" ni emas. */}
          {raqib && (
            <div className="mt-3 space-y-1.5 rounded-clay bg-karta/70 p-2.5 shadow-clay-sm">
              <Chiziq nom={raqib.nom} ball={raqibHozir} eng={engKatta} rang="bg-brand-red" />
              <Chiziq nom={t("duelSiz")} ball={ball} eng={engKatta} rang="bg-brand-green" />
            </div>
          )}
          {/* ---- savol ---- */}
          <div className="relative my-4 grid flex-1 place-items-center rounded-clay bg-sahna/85
                          px-3 py-8 ring-1 ring-track ring-inset backdrop-blur-sm">
            {/* Yig'ilgan ball savol USTIDA tug'ilib, yuqoriga uchadi.
                `key` har javobda o'zgaradi — shunda animatsiya qaytadan
                o'ynaydi, hatto ketma-ket bir xil son chiqqanda ham. */}
            {qoshildi > 0 && javob?.togri && (
              <span key={`${ball}-${qoshildi}`} aria-hidden
                className={`az-ball pointer-events-none absolute top-3 font-display
                            text-[19px] leading-none
                            ${qoshildi > 1 ? "text-brand-orange-d" : "text-brand-green-d"}`}>
                +{qoshildi}
              </span>
            )}
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


/**
 * Duel chizig'i — bitta o'yinchining hozirgi bali.
 *
 * Chiziq ENG KATTA balldan kelib chiqib chiziladi (ikkalasidan
 * qaysi biri katta bo'lsa). Qat'iy chegara (masalan 60 ball) ham
 * mumkin edi, lekin unda ikki bo'sh o'ynagan bolaning chiziqlari
 * ekranning chap chekkasida qimirlamay turardi va bellashuv
 * ko'rinmasdi.
 */
function Chiziq({ nom, ball, eng, rang }: {
  nom: string; ball: number; eng: number; rang: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[72px] shrink-0 truncate text-[11.5px] text-ink-soft">{nom}</span>
      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-track">
        <span className={`block h-full rounded-full transition-[width] duration-300 ${rang}`}
          style={{ width: `${Math.max(3, (ball / eng) * 100)}%` }} />
      </span>
      <span className="w-7 shrink-0 text-right font-display text-[13px]">{ball}</span>
    </div>
  );
}
