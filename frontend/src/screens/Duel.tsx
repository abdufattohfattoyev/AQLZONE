/**
 * Do'st bilan bellashuv — jonli va asinxron.
 *
 *   `Duel`       chaqiruv yasash va lobbi
 *   `DuelQabul`  /duel/<kod> — do'stingiz yuborgan havola
 *
 * ──────────────────── IKKI YO'L, BITTA HAVOLA ────────────────────
 *
 * Havola bitta va u ikkala holatda ham ishlaydi:
 *
 *   JONLI     ikkalasi ham shu daqiqada ekran oldida. Har biri
 *             "Men tayyorman" ni bosadi, uch soniyalik sanoq ketadi va
 *             o'yin BIR VAQTDA boshlanadi. Ballar bir-biriga ko'rinib
 *             turadi.
 *
 *   ASINXRON  do'sti hozir yo'q. Chaqirgan odam kutmasdan o'ynaydi,
 *             natijasi chaqiruv bo'lib qoladi va do'sti uni istalgan
 *             payt ochib o'ynaydi — o'shanda raqib chizig'i yozib
 *             olingan sanoqdan chiziladi.
 *
 * Tanlov OLDINDAN so'ralmaydi. "Jonli o'ynaysizmi yoki keyinroqmi?"
 * degan savolga odam javob bera olmaydi: do'sti hozir onlaynmi-yo'qmi
 * — buni u bilmaydi. Shuning uchun ekran o'zi kutadi va do'sti
 * qo'shilsa jonli, qo'shilmasa asinxron bo'ladi.
 *
 * ──────────────────── VAQTNI SERVER AYTADI ────────────────────
 *
 * Boshlanish vaqti serverda belgilanadi va "necha soniya qoldi" bo'lib
 * keladi. Mijozning o'z soatiga tayanib bo'lmaydi: telefon soati bir
 * necha soniya oldinda bo'lgan o'yinchi duelni erta boshlab, tekin
 * ustunlik olardi.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Oqim } from "../components/oyin/Oqim";
import { Konfetti } from "../components/Konfetti";
import { Kutish } from "../components/Kutish";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { useOrqaga, havolaniOch, tgKutish } from "../lib/qobiq";
import { Kirish } from "../components/Kirish";
import { useProgress } from "../lib/progress";
import { OYINLAR, oyinById } from "../lib/oyin";
import { DUEL_SAVOLLAR, DUEL_VAQTLAR, duelSavollari } from "../lib/oyin/duel";
import { tangaHisobi } from "../lib/oyin/rekord";
import {
  DuelXato, duelBall, duelBoshla, duelHolat, duelKorish, duelNatija,
  duelQabul, duelTayyor,
} from "../lib/api";
import type { DuelHolat, DuelJonli, DuelShart, DuelYakun } from "../lib/api";
import type { Daraja, Oyin as OyinTur, OyinNatija } from "../lib/oyin/tur";
import { UNIT_COLORS } from "../lib/types";

/** Jonli holat necha millisekundda bir so'raladi. */
const SOROV = 2000;

/* ============================ chaqiruv yasash ============================ */

type Bosqich =
  | { nima: "shartlar" }
  | { nima: "yuklanmoqda" }
  | { nima: "xato"; matn: string }
  | { nima: "lobbi"; duel: DuelHolat }
  | { nima: "oyin"; duel: DuelHolat; jonli: boolean }
  | { nima: "havola"; duel: DuelHolat }
  | { nima: "yakun"; yakun: DuelYakun };

export function Duel({ onChiq }: { onChiq: () => void }) {
  const tg = tgKutish();
  // Chaqiruv endi DARHOL yasalmaydi: avval shartlar so'raladi. Ilgari
  // ekran ochilishi bilan server o'yinni o'zi tanlab, duel yasab
  // qo'yardi — ya'ni fikrini o'zgartirgan odamdan keyin bazada bo'sh
  // chaqiruv qolardi va kunlik chegara ham behuda sarflanardi.
  const [bosqich, setBosqich] = useState<Bosqich>({ nima: "shartlar" });

  useOrqaga(onChiq);

  const yasa = (shart: DuelShart) => {
    setBosqich({ nima: "yuklanmoqda" });
    duelBoshla(shart)
      .then((d) => setBosqich({ nima: "lobbi", duel: d }))
      .catch((e) => {
        const kod = e instanceof DuelXato ? e.kod : 0;
        setBosqich({ nima: "xato", matn: kod === 429 ? t("duelChegara") : t("duelXato") });
      });
  };

  // Bellashuv Telegram hisobisiz o'ynalmaydi — pastdagi izohga qarang.
  // Hukm BIRINCHI RENDERDA chiqarilmaydi: Telegram obyekti tashqi
  // skriptdan keladi va u sekin yuklansa, Telegram ICHIDA turgan odam
  // "Telegramda oching" oynasini ko'rib qolardi.
  if (tg === "kutilmoqda") return <Kutish />;
  if (tg === "yoq") {
    return <Kirish izoh={t("duelTgKerak")} xabar={t("duelTgIzoh")} tugma={t("duelTgTugma")}
      onKeyinroq={onChiq} />;
  }

  if (bosqich.nima === "shartlar") return <Shartlar onTanladi={yasa} onChiq={onChiq} />;
  if (bosqich.nima === "yuklanmoqda") return <Kutish />;
  if (bosqich.nima === "xato") return <Xabar belgi="⚠️" sarlavha={bosqich.matn} onChiq={onChiq} />;
  if (bosqich.nima === "havola") return <HavolaEkrani duel={bosqich.duel} onChiq={onChiq} />;
  if (bosqich.nima === "yakun") return <Natija yakun={bosqich.yakun} onChiq={onChiq} />;

  if (bosqich.nima === "lobbi") {
    return (
      <Lobbi
        duel={bosqich.duel} menChaqirdim
        onBoshla={() => setBosqich({ nima: "oyin", duel: bosqich.duel, jonli: true })}
        onYolgiz={() => setBosqich({ nima: "oyin", duel: bosqich.duel, jonli: false })}
        onChiq={onChiq}
      />
    );
  }

  return (
    <Bellashuv
      duel={bosqich.duel} jonli={bosqich.jonli} menChaqirdim
      onChiq={onChiq}
      onHavola={(d) => setBosqich({ nima: "havola", duel: d })}
      onYakun={(y) => setBosqich({ nima: "yakun", yakun: y })}
    />
  );
}

/* ============================ shartlarni tanlash ============================ */

/**
 * Duelda qatnashadigan o'yinlar — faqat "oqim" turidagilar.
 *
 * "24" va "Sonlar xotirasi" chetda qoladi va bu ataylab: ularning
 * o'z taxtasi bor, ballari boshqacha o'lchanadi va ikki o'yinchini
 * yonma-yon qo'yib bo'lmaydi. Ro'yxat serverdagi `duel.OYINLAR` bilan
 * mos tushishi kerak — u yerda buni tekshiradigan sinov bor.
 */
const DUEL_OYINLAR = OYINLAR.filter((o) => o.tur === "oqim");

/**
 * Chaqirgan odam shartlarni tanlaydi: o'yin, savollar soni va vaqt.
 *
 * ─────────────────── NEGA CHAQIRGAN TANLAYDI ───────────────────
 *
 * Ilgari o'yinni SERVER tasodifiy tanlardi — "chaqirgan odam o'zi
 * kuchli bo'lgan o'yinni tanlab oladi" degan xavotir bilan. Amalda esa
 * duel do'st bilan o'ynaladi: kim kim bilan o'ynashini o'zlari
 * kelishadi va tanlov imkoniyati o'yinni qiziqarliroq qiladi. Tasodif
 * esa teskari ishladi — odam o'zi bilmagan o'yin chiqqanda chaqiruvni
 * umuman yubormay, ekrandan chiqib ketardi.
 *
 * Uchta qiymatdan ortiq berilmaydi. Erkin son so'ralsa, odam "45"
 * yozib qo'yardi va ikkinchi tomon "nega 45?" degan savol bilan
 * qolardi: tanlov qancha keng bo'lsa, qaror shuncha og'ir.
 */
function Shartlar({ onTanladi, onChiq }: {
  onTanladi: (s: DuelShart) => void;
  onChiq: () => void;
}) {
  const [oyin, setOyin] = useState<OyinTur>(DUEL_OYINLAR[0]);
  const [savollar, setSavollar] = useState<number>(20);
  const [vaqt, setVaqt] = useState<number>(60);

  return (
    /* Kenglik ekranga qarab o'sadi, balandlik esa SIQILADI. Telegram
       Desktop'da Mini App tor VA past oynada ochiladi: u yerda qat'iy
       bo'shliqlar bilan "Chaqirish" tugmasi ekrandan chiqib ketardi va
       odam uni umuman ko'rmasdi. `clamp` bilan tepa qismi past oynada
       o'zi kichrayadi. */
    <div className="mx-auto w-full max-w-[430px] px-4 pt-[clamp(10px,2.5vh,24px)]
                    pb-8 sm:max-w-[600px] lg:max-w-[760px]">
      <div className="text-center">
        <span className="mx-auto grid place-items-center rounded-[24px] bg-brand-orange shadow-clay
                         size-[clamp(52px,9vh,72px)] text-[clamp(26px,4.5vh,34px)]">
          ⚔️
        </span>
        <h1 className="mt-2.5 text-[clamp(19px,3.4vh,23px)] leading-tight">{t("duel")}</h1>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{t("duelShartIzoh")}</p>
      </div>

      {/* ---- o'yin ---- */}
      <h2 className="mt-[clamp(14px,2.5vh,24px)] mb-2 ml-1.5 text-[11px] tracking-widest
                     text-ink-soft uppercase">
        {t("duelOyinTanla")}
      </h2>
      {/* Oltita o'yin: tor telefonda 3×2, kengroq ekranda bitta qatorda.
          `min-w-0` SHART — busiz uzun nom katakni kengaytirib, setkani
          buzib yuborardi. */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {DUEL_OYINLAR.map((o) => {
          const tanlangan = o.id === oyin.id;
          const rang = UNIT_COLORS[o.rang];
          return (
            <button key={o.id} type="button" onClick={() => setOyin(o)} title={t(o.nom)}
              aria-pressed={tanlangan}
              style={tanlangan ? undefined : { backgroundColor: `${rang.road}14` }}
              className={`clay-press flex min-w-0 flex-col items-center justify-start gap-1
                          rounded-clay px-1.5 py-2.5 text-center transition-colors
                          ${tanlangan ? `${rang.bg} text-white shadow-clay` : "text-ink shadow-clay-sm"}`}>
              <span className="text-[clamp(20px,3.4vh,24px)] leading-none">{o.emoji}</span>
              {/* Nom KESILMAYDI, ikki qatorgacha o'raladi: "Ko'paytirish
                  jadvali" kesilganda "Ko'paytirish jad…" bo'lib qolardi
                  va bola qaysi o'yin ekanini bilmasdi. */}
              <span className="hyphens-auto font-display text-[10.5px] leading-[1.15] break-words">
                {t(o.nom)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- savollar va vaqt ---- */}
      <ShartQator nom={t("duelSavollarSoni")} qiymatlar={DUEL_SAVOLLAR}
        joriy={savollar} onTanla={setSavollar} yozuv={(n) => String(n)} />
      <ShartQator nom={t("duelVaqtSoni")} qiymatlar={DUEL_VAQTLAR}
        joriy={vaqt} onTanla={setVaqt} yozuv={(n) => t("duelSoniya", { n })} />

      {/* Tanlangan shartlar bitta qatorda takrorlanadi: uchta tanlov uch
          joyda turadi va ularni birga ko'rmasdan "nima chiqdi?" degan
          savolga javob berib bo'lmaydi. */}
      <p className="mt-[clamp(10px,2vh,20px)] text-center text-[12.5px] text-ink-soft">
        {t("duelShartYakun", { oyin: t(oyin.nom), savollar, vaqt })}
      </p>

      <button type="button" onClick={() => onTanladi({ oyin: oyin.id, savollar, vaqt })}
        className="tugma-3d az-yaltir mt-2.5 w-full rounded-3xl bg-brand-green
                   py-[clamp(11px,2.2vh,16px)] font-display text-[17px] text-white
                   shadow-[0_6px_0_var(--color-brand-green-d)]">
        {t("duelChaqirish")}
      </button>

      <button type="button" onClick={onChiq}
        className="mt-2.5 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
        {t("duelOyinlarga")}
      </button>
    </div>
  );
}

/** Bitta shart qatori — uchta tugma yonma-yon. */
function ShartQator({ nom, qiymatlar, joriy, onTanla, yozuv }: {
  nom: string;
  qiymatlar: readonly number[];
  joriy: number;
  onTanla: (n: number) => void;
  yozuv: (n: number) => string;
}) {
  return (
    <>
      <h2 className="mt-[clamp(12px,2.2vh,20px)] mb-1.5 ml-1.5 text-[11px] tracking-widest
                     text-ink-soft uppercase">
        {nom}
      </h2>
      <div className="flex gap-2">
        {qiymatlar.map((n) => (
          <button key={n} type="button" onClick={() => onTanla(n)} aria-pressed={n === joriy}
            className={`clay-press min-w-0 flex-1 rounded-clay py-[clamp(9px,1.8vh,13px)]
                        font-display text-[clamp(14px,2.4vh,16px)] whitespace-nowrap
                        transition-colors ${n === joriy
                          ? "bg-brand-blue text-white shadow-clay"
                          : "bg-karta text-ink-soft shadow-clay-sm"}`}>
            {yozuv(n)}
          </button>
        ))}
      </div>
    </>
  );
}

/* ============================ chaqiruvni ochish ============================ */

type QBosqich =
  | { nima: "yuklanmoqda" }
  | { nima: "xato"; matn: string }
  | { nima: "lobbi"; duel: DuelHolat }
  | { nima: "taklif"; duel: DuelHolat }
  | { nima: "oyin"; duel: DuelHolat; jonli: boolean }
  | { nima: "yakun"; yakun: DuelYakun };

export function DuelQabul({ kod, onChiq }: { kod: string; onChiq: () => void }) {
  const tg = tgKutish();
  const [bosqich, setBosqich] = useState<QBosqich>({ nima: "yuklanmoqda" });

  useOrqaga(onChiq);

  useEffect(() => {
    // Telegram tashqarisida so'rov yuborishning ma'nosi yo'q: pastda
    // baribir kirish ekrani chiqadi va anonim hisob bilan olingan
    // javob faqat bekorga chaqiruvni "ko'rilgan" qilib qo'yardi.
    if (tg !== "ha") return;
    let bekor = false;
    duelKorish(kod).then((d) => {
      if (bekor) return;
      if (!d) { setBosqich({ nima: "xato", matn: t("duelTopilmadi") }); return; }
      if (d.ozim) { setBosqich({ nima: "xato", matn: t("duelOzingiz") }); return; }

      // Chaqirgan odam AYNI PAYTDA kutyapti — jonli o'ynaymiz.
      if (d.holat === "jonli_kutyapti" || d.holat === "jonli") {
        setBosqich({ nima: "lobbi", duel: d });
        return;
      }
      if (d.holat === "tugadi") { setBosqich({ nima: "xato", matn: t("duelOynalgan") }); return; }
      if (d.holat === "muddati_otdi") { setBosqich({ nima: "xato", matn: t("duelMuddatiOtdi") }); return; }
      if (d.holat === "boshlanmagan") { setBosqich({ nima: "xato", matn: t("duelTopilmadi") }); return; }
      setBosqich({ nima: "taklif", duel: d });
    });
    return () => { bekor = true; };
  }, [kod, tg]);

  const asinxronBoshla = () => {
    setBosqich({ nima: "yuklanmoqda" });
    duelQabul(kod)
      .then((d) => setBosqich({ nima: "oyin", duel: d, jonli: false }))
      .catch((e) => {
        const k = e instanceof DuelXato ? e.kod : 0;
        setBosqich({
          nima: "xato",
          matn: k === 410 ? t("duelMuddatiOtdi")
            : k === 409 ? t("duelOynalgan")
            : t("duelXato"),
        });
      });
  };

  /**
   * Bellashuv TELEGRAM hisobi bilan o'ynaladi.
   *
   * Ilgari havolani brauzerda ochgan odam anonim hisob olardi va
   * raqibiga "Noma'lum" bo'lib ko'rinardi. Uch narsa buziladi: raqib
   * kim bilan o'ynayotganini bilmaydi, natija brauzer tozalanishi
   * bilan yo'qoladi va o'sha odamni keyin qaytarib bo'lmaydi.
   *
   * Tugma AYNAN shu chaqiruvni ochadi (`?startapp=<kod>`): odamni
   * avval kirishga, keyin havolani qaytadan qidirishga majburlash —
   * o'sha yo'lda ko'pchilik yo'qoladi.
   *
   * Tekshiruv hamma hooklardan KEYIN turadi: erta qaytish React
   * qoidasini buzib, keyingi hooklarni o'tkazib yuborardi.
   */
  if (tg === "kutilmoqda") return <Kutish />;
  if (tg === "yoq") {
    return (
      <Kirish
        izoh={t("duelTgKerak")}
        xabar={t("duelTgChaqiruv")}
        tugma={t("duelTgTugma")}
        havola={(bot) => `https://t.me/${encodeURIComponent(bot)}?startapp=${encodeURIComponent(kod)}`}
        tagIzoh={t("duelTgTagIzoh")}
        onKeyinroq={onChiq}
      />
    );
  }

  if (bosqich.nima === "yuklanmoqda") return <Kutish />;
  if (bosqich.nima === "xato") return <Xabar belgi="🙈" sarlavha={bosqich.matn} onChiq={onChiq} />;
  if (bosqich.nima === "yakun") return <Natija yakun={bosqich.yakun} onChiq={onChiq} />;

  if (bosqich.nima === "taklif") {
    return <Taklif duel={bosqich.duel} onQabul={asinxronBoshla} onChiq={onChiq} />;
  }

  if (bosqich.nima === "lobbi") {
    return (
      <Lobbi
        duel={bosqich.duel} menChaqirdim={false}
        onBoshla={() => setBosqich({ nima: "oyin", duel: bosqich.duel, jonli: true })}
        onChiq={onChiq}
      />
    );
  }

  return (
    <Bellashuv
      duel={bosqich.duel} jonli={bosqich.jonli} menChaqirdim={false}
      onChiq={onChiq}
      onYakun={(y) => setBosqich({ nima: "yakun", yakun: y })}
    />
  );
}

/* ============================ lobbi ============================ */

/**
 * "Men tayyorman" ekrani.
 *
 * Ikkalasi ham bosgach server boshlanish vaqtini belgilaydi va shu
 * ekranda uch soniyalik sanoq ketadi. Sanoq IKKALA ekranda ham bir
 * vaqtda tugaydi, chunki qolgan soniya serverdan keladi.
 *
 * `onYolgiz` faqat CHAQIRGAN odamda bo'ladi: do'sti kelmasa, u
 * kutishni to'xtatib yolg'iz o'ynaydi va natijasi chaqiruv bo'lib
 * qoladi. Bu duelni "do'stim onlaynmi?" degan savolga bog'liq
 * bo'lishdan qutqaradi.
 */
function Lobbi({ duel, menChaqirdim, onBoshla, onYolgiz, onChiq }: {
  duel: DuelHolat;
  menChaqirdim: boolean;
  onBoshla: () => void;
  onYolgiz?: () => void;
  onChiq: () => void;
}) {
  const oyin = oyinById(duel.oyin);
  const [holat, setHolat] = useState<DuelJonli | null>(null);
  const [tayyorlanmoqda, setTayyorlanmoqda] = useState(false);
  const boshlandiRef = useRef(false);

  // Har 2 soniyada holat so'raladi. So'rovning O'ZI "men shu yerdaman"
  // belgisini ham qo'yadi — alohida "tirikman" so'rovi kerak emas.
  useEffect(() => {
    let bekor = false;
    const sora = async () => {
      const h = await duelHolat(duel.kod);
      if (bekor || !h) return;
      setHolat(h);
      if (h.boshlanishSoniya !== null && h.boshlanishSoniya <= 0 && !boshlandiRef.current) {
        boshlandiRef.current = true;
        onBoshla();
      }
    };
    void sora();
    const id = setInterval(() => void sora(), SOROV);
    return () => { bekor = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duel.kod]);

  // Sanoq boshlangach — so'rovni kutmasdan, o'z soatimiz bilan
  // hisoblaymiz: 2 soniyalik so'rov oralig'ida sanoq sakrab ketardi.
  const [sanoq, setSanoq] = useState<number | null>(null);
  useEffect(() => {
    if (holat?.boshlanishSoniya == null) { setSanoq(null); return; }
    let qolgan = holat.boshlanishSoniya;
    setSanoq(Math.ceil(qolgan));
    const id = setInterval(() => {
      qolgan -= 0.25;
      setSanoq(Math.ceil(Math.max(0, qolgan)));
      if (qolgan <= 0 && !boshlandiRef.current) {
        boshlandiRef.current = true;
        clearInterval(id);
        onBoshla();
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holat?.boshlanishSoniya !== null]);

  const tayyorla = () => {
    setTayyorlanmoqda(true);
    duelTayyor(duel.kod)
      .then((h) => setHolat(h))
      .catch(() => setTayyorlanmoqda(false));
  };

  if (sanoq !== null) {
    return (
      <div className="grid min-h-ekran place-items-center">
        <div className="text-center">
          <div key={sanoq} className="az-tab-sakra font-display text-[86px] leading-none">
            {sanoq > 0 ? sanoq : "!"}
          </div>
          <div className="mt-3 text-[14px] text-ink-soft">{t("duelBoshlanmoqda")}</div>
        </div>
      </div>
    );
  }

  const menTayyor = holat?.menTayyor ?? false;

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col justify-center px-4 py-10
                    text-center sm:max-w-[560px]">
      <span className="mx-auto grid size-20 place-items-center rounded-[26px] bg-brand-orange
                       text-[38px] shadow-clay">
        ⚔️
      </span>

      <h1 className="mt-4 text-[23px] leading-tight">
        {menChaqirdim ? t("duel") : t("duelChaqiruv", { nom: duel.chaqirgan })}
      </h1>

      {oyin && (
        <div className="mx-auto mt-4 flex items-center gap-2.5 rounded-clay bg-karta px-4 py-3 shadow-clay-sm">
          <span className="text-[24px]">{oyin.emoji}</span>
          <span className="font-display text-[15px]">{t(oyin.nom)}</span>
          <span className="text-[12.5px] text-ink-soft">
            · {duel.savollar || 20} · {t("duelSoniya", { n: duel.vaqt || 60 })}
          </span>
        </div>
      )}

      {/* ---- 1-qadam: havola ----
          CHAQIRGAN odamda birinchi va eng katta harakat aynan shu.
          Ilgari ulashish tugmasi pastda, "tayyorman" dan keyin turardi
          va ekran "nimani kutyapman?" degan savol bilan qolardi: odam
          do'stiga havola YUBORISHI kerakligini tushunmasdi.

          Endi qadamlar RAQAMLANGAN: avval havola, keyin tayyorlik. */}
      {menChaqirdim && (
        <div className="mt-6 text-left">
          <div className="ml-1 font-display text-[14px]">{t("duelQadam1")}</div>
          <div className="mt-0.5 ml-1 text-[12.5px] text-ink-soft">{t("duelQadam1Izoh")}</div>
          <button type="button" onClick={() => havolaniOch(
            `https://t.me/share/url?url=${encodeURIComponent(duel.havola)}` +
            `&text=${encodeURIComponent(t("duelUlashMatn"))}`,
          )}
            className="tugma-3d az-yaltir mt-2 flex w-full items-center justify-center gap-2
                       rounded-3xl bg-brand-blue py-3.5 font-display text-[16px] text-white
                       shadow-[0_5px_0_var(--color-brand-blue-d)]">
            <Icon name="send" size={18} />
            {t("duelUlash")}
          </button>
        </div>
      )}

      {menChaqirdim && (
        <div className="mt-5 text-left">
          <div className="ml-1 font-display text-[14px]">{t("duelQadam2")}</div>
          <div className="mt-0.5 ml-1 text-[12.5px] text-ink-soft">{t("duelQadam2Izoh")}</div>
        </div>
      )}

      {/* ---- ikki tomonning holati ----
          Raqib qo'shilganini va tayyorligini KO'RSATISH shart: busiz
          "tayyorman" ni bosgan odam bo'sh ekranga qarab, nima
          kutayotganini bilmay turardi. */}
      <div className="mt-2.5 space-y-2">
        <Qator nom={t("duelSiz")} tayyor={menTayyor} bor />
        <Qator
          nom={holat?.raqibNom || (menChaqirdim ? t("duelDostKutilmoqda") : duel.chaqirgan)}
          tayyor={holat?.raqibTayyor ?? false}
          bor={menChaqirdim ? (holat?.raqibBor ?? false) : true}
        />
      </div>

      {!menTayyor ? (
        <button type="button" onClick={tayyorla} disabled={tayyorlanmoqda}
          className="tugma-3d az-yaltir mt-4 w-full rounded-3xl bg-brand-green py-4 font-display
                     text-[18px] text-white shadow-[0_6px_0_var(--color-brand-green-d)]
                     disabled:opacity-60">
          {t("duelTayyorman")}
        </button>
      ) : (
        <div className="mt-4 rounded-3xl bg-karta py-3.5 font-display text-[15px] text-ink-soft
                        shadow-clay-sm">
          {t("duelRaqibKutilmoqda")}
        </div>
      )}

      {/* Kutish MAJBURIY emas: do'sti kelmasa ham o'yin bo'ladi. */}
      {menChaqirdim && (
        <button type="button" onClick={onYolgiz}
          className="mt-3 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
          {t("duelKutmayman")}
        </button>
      )}

      <button type="button" onClick={onChiq}
        className="mt-1 w-full py-2 text-[13px] font-semibold text-ink-dim/80">
        {t("duelOyinlarga")}
      </button>
    </div>
  );
}

function Qator({ nom, tayyor, bor }: { nom: string; tayyor: boolean; bor: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-clay bg-karta p-3 text-left shadow-clay-sm">
      <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[15px]
                        ${tayyor ? "bg-brand-green text-white" : "bg-track text-ink-dim"}`}>
        {tayyor ? <Icon name="check" size={16} /> : bor ? "…" : "?"}
      </span>
      <span className="min-w-0 flex-1 truncate font-display text-[14.5px]">{nom}</span>
      <span className="shrink-0 text-[12px] text-ink-soft">
        {tayyor ? t("duelTayyorBelgi") : bor ? t("duelLobbiKutyapti") : t("duelUlanmagan")}
      </span>
    </div>
  );
}

/* ============================ o'yinning o'zi ============================ */

/**
 * Bellashuv — jonli ham, asinxron ham shu komponentdan o'tadi.
 *
 * Farq faqat RAQIB qayerdan kelishida: jonlida u har 2 soniyada
 * serverdan so'raladi, asinxronda esa yozib olingan sanoqdan
 * hisoblanadi. O'yinning o'zi (`Oqim`) bu farqni bilmaydi.
 */
function Bellashuv({ duel, jonli, menChaqirdim, onChiq, onHavola, onYakun }: {
  duel: DuelHolat;
  jonli: boolean;
  menChaqirdim: boolean;
  onChiq: () => void;
  onHavola?: (d: DuelHolat) => void;
  onYakun: (y: DuelYakun) => void;
}) {
  const { oyinTugadi } = useProgress();
  const [raqibBall, setRaqibBall] = useState(0);
  const [kutilmoqda, setKutilmoqda] = useState(false);
  const menBall = useRef(0);
  const menSanoq = useRef<number[]>([]);

  const oyin = oyinById(duel.oyin);
  // Savollar soni ham, vaqt ham CHAQIRUVDAN olinadi — ikkala o'yinchi
  // bir xil qiymatni oladi, chunki u serverdagi yozuvda turadi. Eski
  // chaqiruvlarda maydon bo'lmasligi mumkin, shuning uchun standart bor.
  const savollarRef = useRef(
    oyin
      ? duelSavollari(duel.urug ?? 0, duel.oyin, duel.daraja as Daraja, duel.savollar || 20)
      : [],
  );

  /* --- jonli: ball almashinuvi --- */
  useEffect(() => {
    if (!jonli) return;
    let bekor = false;
    const id = setInterval(async () => {
      const h = await duelBall(duel.kod, menBall.current, menSanoq.current);
      if (!bekor && h) setRaqibBall(h.raqibBall);
    }, SOROV);
    return () => { bekor = true; clearInterval(id); };
  }, [jonli, duel.kod]);

  /* --- natija kelguncha kutish --- */
  const kut = useCallback((kod: string) => {
    setKutilmoqda(true);
    const id = setInterval(async () => {
      const h = await duelHolat(kod);
      if (!h) return;
      setRaqibBall(h.raqibBall);
      if (h.raqibTugadi && h.golib) {
        clearInterval(id);
        onYakun({
          kod, holat: h.holat, tugadi: true, golib: h.golib,
          meniki: h.meniki, raqib: h.raqibBall, raqibIsm: h.raqibNom,
          menChaqirdim,
        });
      }
    }, SOROV);
    return () => clearInterval(id);
  }, [menChaqirdim, onYakun]);

  const tugadi = (n: OyinNatija) => {
    oyinTugadi(tangaHisobi(n.ball, false), n.savollar);
    duelNatija<DuelYakun>(duel.kod, n.ball, n.xato ?? 0, n.sanoq ?? [])
      .then((y) => {
        // Asinxron duelda chaqirgan odam birinchi tugatdi — havola.
        if (!jonli && menChaqirdim && !y.tugadi) {
          onHavola?.({ ...duel, ...(y as unknown as DuelHolat) });
          return;
        }
        if (y.tugadi) { onYakun(y); return; }
        // Jonli duelda raqib hali tugatmagan — kutamiz.
        kut(duel.kod);
      })
      .catch(() => {
        if (!jonli && menChaqirdim) onHavola?.(duel);
        else setKutilmoqda(true);
      });
  };

  if (!oyin || !savollarRef.current.length) {
    return <Xabar belgi="⚠️" sarlavha={t("duelXato")} onChiq={onChiq} />;
  }

  if (kutilmoqda) {
    return (
      <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col items-center
                      justify-center px-4 text-center">
        <span className="grid size-20 place-items-center rounded-[26px] bg-karta text-[38px] shadow-clay">
          ⏳
        </span>
        <h1 className="mt-4 text-[21px] leading-tight">{t("duelRaqibTugatmoqda")}</h1>
        <p className="mt-2 text-[13.5px] text-ink-soft">{t("duelRaqibBali", { n: raqibBall })}</p>
      </div>
    );
  }

  return (
    <Oqim
      oyin={oyin}
      daraja={duel.daraja as Daraja}
      savollar={savollarRef.current}
      vaqt={duel.vaqt || 60}
      raqib={
        jonli
          ? { nom: menChaqirdim ? t("duelRaqib") : duel.chaqirgan, ball: raqibBall }
          : menChaqirdim ? undefined
          : { nom: duel.chaqirgan, sanoq: duel.raqibSanoq ?? [] }
      }
      onBall={(ball, sanoq) => { menBall.current = ball; menSanoq.current = sanoq; }}
      onChiq={onChiq}
      onTugadi={tugadi}
      rekord={0}
      yakun={null}
    />
  );
}

/* ============================ yordamchi ekranlar ============================ */

function HavolaEkrani({ duel, onChiq }: { duel: DuelHolat; onChiq: () => void }) {
  const [nusxalandi, setNusxalandi] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-10 pb-10 text-center sm:max-w-[560px]">
      <div className="relative mx-auto w-fit">
        <Konfetti />
        <span className="grid size-20 place-items-center rounded-[26px] bg-brand-green text-[38px] shadow-clay">
          ⚔️
        </span>
      </div>

      <h1 className="mt-4 text-[24px]">{t("duelSizChaqirdingiz")}</h1>
      <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">{t("duelUlashing")}</p>

      <div className="mt-5 rounded-clay bg-karta p-3 text-[12px] break-all text-ink-soft shadow-clay-sm">
        {duel.havola || "—"}
      </div>

      <button type="button" onClick={() => havolaniOch(
        `https://t.me/share/url?url=${encodeURIComponent(duel.havola)}` +
        `&text=${encodeURIComponent(t("duelUlashMatn"))}`,
      )}
        className="tugma-3d az-yaltir mt-4 flex w-full items-center justify-center gap-2 rounded-3xl
                   bg-brand-blue py-3.5 font-display text-[16px] text-white
                   shadow-[0_5px_0_var(--color-brand-blue-d)]">
        <Icon name="send" size={18} />
        {t("duelUlash")}
      </button>

      <button type="button"
        onClick={() => navigator.clipboard?.writeText(duel.havola)
          .then(() => setNusxalandi(true)).catch(() => setNusxalandi(false))}
        className="clay-press mt-2.5 w-full rounded-3xl bg-karta py-3 font-display text-[15px]
                   text-ink-soft shadow-clay-sm">
        {nusxalandi ? t("duelNusxalandi") : t("duelNusxa")}
      </button>

      <button type="button" onClick={onChiq}
        className="mt-3 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
        {t("duelOyinlarga")}
      </button>
    </div>
  );
}

function Taklif({ duel, onQabul, onChiq }: {
  duel: DuelHolat; onQabul: () => void; onChiq: () => void;
}) {
  const oyin = oyinById(duel.oyin);

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col justify-center px-4 py-10
                    text-center sm:max-w-[560px]">
      <span className="mx-auto grid size-24 place-items-center rounded-[30px] bg-brand-orange
                       text-[46px] shadow-clay">
        ⚔️
      </span>

      <h1 className="mt-5 text-[24px] leading-tight">
        {t("duelChaqiruv", { nom: duel.chaqirgan })}
      </h1>
      <p className="mt-2 text-[14px] leading-snug text-ink-soft">{t("duelChaqiruvIzoh")}</p>

      {oyin && (
        <div className="mx-auto mt-5 flex items-center gap-2.5 rounded-clay bg-karta px-4 py-3 shadow-clay-sm">
          <span className="text-[24px]">{oyin.emoji}</span>
          <span className="font-display text-[15px]">{t(oyin.nom)}</span>
          {/* Shartlar shu yerda ham ko'rinadi: do'sti nimaga rozi
              bo'layotganini bilishi kerak. */}
          <span className="text-[12.5px] text-ink-soft">
            · {duel.savollar || 20} · {t("duelSoniya", { n: duel.vaqt || 60 })}
          </span>
        </div>
      )}

      <button type="button" onClick={onQabul}
        className="tugma-3d az-yaltir mt-8 w-full rounded-3xl bg-brand-green py-4 font-display
                   text-[18px] text-white shadow-[0_6px_0_var(--color-brand-green-d)]">
        {t("duelQabul")}
      </button>

      <button type="button" onClick={onChiq}
        className="mt-3 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
        {t("keyinroq")}
      </button>
    </div>
  );
}

function Natija({ yakun, onChiq }: { yakun: DuelYakun; onChiq: () => void }) {
  const meniki = yakun.menChaqirdim ? "chaqirgan" : "qabul";
  const yutdi = yakun.golib === meniki;
  const durang = yakun.golib === "durang";

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-10 pb-10 text-center sm:max-w-[560px]">
      <div className="relative mx-auto w-fit">
        {yutdi && <Konfetti />}
        <span className={`grid size-20 place-items-center rounded-[26px] text-[38px] shadow-clay
                          ${yutdi ? "bg-brand-gold" : "bg-karta"}`}>
          {yutdi ? "🏆" : durang ? "🤝" : "😔"}
        </span>
      </div>

      <h1 className="mt-4 text-[25px]">
        {yutdi ? t("duelYutdingiz") : durang ? t("duelDurang") : t("duelYutqazdingiz")}
      </h1>

      <div className="mt-5 flex items-center justify-center gap-3">
        <Taraf nom={t("duelSiz")} ball={yakun.meniki} kuchli={yutdi} />
        <span className="font-display text-[20px] text-ink-dim">:</span>
        <Taraf nom={yakun.raqibIsm || t("duelRaqib")} ball={yakun.raqib}
               kuchli={!yutdi && !durang} />
      </div>

      <button type="button" onClick={onChiq}
        className="tugma-3d mt-8 w-full rounded-3xl bg-brand-green py-3.5 font-display
                   text-[17px] text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
        {t("duelOyinlarga")}
      </button>
    </div>
  );
}

function Taraf({ nom, ball, kuchli }: { nom: string; ball: number; kuchli: boolean }) {
  return (
    <div className={`min-w-[104px] rounded-clay p-3 shadow-clay-sm
                     ${kuchli ? "bg-brand-green text-white" : "bg-karta"}`}>
      <div className="font-display text-[30px] leading-none">{ball}</div>
      <div className={`mt-1 truncate text-[12px] ${kuchli ? "text-white/85" : "text-ink-soft"}`}>
        {nom}
      </div>
    </div>
  );
}

function Xabar({ belgi, sarlavha, onChiq }: {
  belgi: string; sarlavha: string; onChiq: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col items-center justify-center
                    px-4 text-center">
      <span className="grid size-20 place-items-center rounded-[26px] bg-karta text-[38px] shadow-clay">
        {belgi}
      </span>
      <h1 className="mt-4 text-[21px] leading-tight">{sarlavha}</h1>
      <button type="button" onClick={onChiq}
        className="tugma-3d mt-7 w-full max-w-[280px] rounded-3xl bg-brand-green py-3.5
                   font-display text-[16px] text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
        {t("duelOyinlarga")}
      </button>
    </div>
  );
}
