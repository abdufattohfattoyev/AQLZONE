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
import { avatarBelgi } from "../lib/dokon";
import { EmojiBelgi, EmojiMatn } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { useOrqaga, havolaniOch } from "../lib/qobiq";
import { useTgHisob } from "../lib/tgHisob";
import { Kirish } from "../components/Kirish";
import { useProgress } from "../lib/progress";
import { useFaollik } from "../lib/faollik";
import { OYINLAR, oyinById } from "../lib/oyin";
import {
  DUEL_SAVOLLAR, DUEL_VAQTLAR, darajaSon, duelSavollari,
} from "../lib/oyin/duel";
import { duelDarajaSaqla, duelDarajaTaklif } from "../lib/oyin/duelDaraja";
import { tangaHisobi } from "../lib/oyin/rekord";
import {
  DuelXato, duelBall, duelBoshla, duelDostlar, duelHolat, duelKorish, duelNatija,
  onlaynOyinchilar, duelQabul, duelTaklifYubor, duelTayyor, duelYana,
} from "../lib/api";
import type {
  DuelDost, DuelHisob, DuelHolat, DuelJonli, DuelShart, DuelYakun, OdamHolat, OnlaynOyinchi,
} from "../lib/api";
import { DARAJALAR, darajaMa } from "../lib/oyin/tur";
import type { Daraja, Oyin as OyinTur, OyinNatija } from "../lib/oyin/tur";
import type { Kalit } from "../lib/matn";
import { UNIT_COLORS } from "../lib/types";

/** Jonli holat necha millisekundda bir so'raladi. */
const SOROV = 2000;

/**
 * Natija ekranida so'rov necha marta takrorlanadi (≈3 daqiqa).
 *
 * Bu ekran ochiq qolib ketishi mumkin: bola telefonni qo'yib, boshqa
 * ishga o'tadi. Chegarasiz so'rov esa batareyani ham, serverni ham
 * behuda yeydi. Raqib esa amalda bir necha soniya ichida javob beradi
 * — u shuncha kutmasa, "yana o'ynash" baribir bo'lmaydi.
 */
const NATIJA_SOROV = 90;

/* ============================ chaqiruv yasash ============================ */

type Bosqich =
  | { nima: "shartlar" }
  | { nima: "yuklanmoqda" }
  | { nima: "xato"; matn: string }
  | { nima: "lobbi"; duel: DuelHolat }
  | { nima: "oyin"; duel: DuelHolat; jonli: boolean }
  | { nima: "havola"; duel: DuelHolat }
  | { nima: "yakun"; yakun: DuelYakun; duel: DuelHolat; xato: number };

export function Duel({ onChiq, onOyin, onKod, boshOyin }: {
  onChiq: () => void;
  /** Oldindan tanlangan o'yin — o'yin ichidagi "Bellashish" dan. */
  boshOyin?: string;
  /** Mashq rejimi — natijadagi "shu o'yinni mashq qilish". */
  onOyin?: (id: string) => void;
  /** Do'st kutayotgan chaqiruvni ochish — `/duel/<kod>`. */
  onKod?: (kod: string) => void;
}) {
  const tg = useTgHisob();
  // Chaqiruv endi DARHOL yasalmaydi: avval shartlar so'raladi. Ilgari
  // ekran ochilishi bilan server o'yinni o'zi tanlab, duel yasab
  // qo'yardi — ya'ni fikrini o'zgartirgan odamdan keyin bazada bo'sh
  // chaqiruv qolardi va kunlik chegara ham behuda sarflanardi.
  const [bosqich, setBosqich] = useState<Bosqich>({ nima: "shartlar" });

  useOrqaga(onChiq);

  const yasa = (shart: DuelShart, kimga?: number) => {
    setBosqich({ nima: "yuklanmoqda" });
    duelBoshla(shart, kimga)
      .then((d) => setBosqich({ nima: "lobbi", duel: d }))
      .catch((e) => {
        const kod = e instanceof DuelXato ? e.kod : 0;
        setBosqich({ nima: "xato", matn: kod === 429 ? t("duelChegara") : t("duelXato") });
      });
  };

  // Ikkalasi "yana o'ynaymiz" deganda server YANGI duel yasaydi va
  // uning kodini beradi. Duel allaqachon boshlangan bo'ladi: lobbi
  // ochilishi bilan sanoq ketadi, "tayyorman" qaytadan so'ralmaydi.
  const yangiDuelga = useCallback((kod: string) => {
    setBosqich({ nima: "yuklanmoqda" });
    duelKorish(kod).then((d) => setBosqich(
      d ? { nima: "lobbi", duel: d } : { nima: "xato", matn: t("duelXato") },
    ));
  }, []);

  // Bellashuv Telegram HISOBISIZ o'ynalmaydi — pastdagi izohga qarang.
  //
  // Savol "hozir Telegram'dan ochildimi" emas, "hisob Telegram'ganmi"
  // (`useTgHisob`). Farqi katta: bot klaviaturasidagi tugmadan ochilgan
  // Mini App `initData` olmaydi va eski tekshiruv o'z hisobi bilan
  // turgan odamni ham devorga urardi.
  if (tg === "kutilmoqda") return <Kutish />;
  if (tg === "yoq") {
    return <Kirish izoh={t("duelTgKerak")} xabar={t("duelTgIzoh")} tugma={t("duelTgTugma")}
      onKeyinroq={onChiq} />;
  }

  if (bosqich.nima === "shartlar") {
    return (
      <Shartlar onTanladi={yasa} onChiq={onChiq} onKod={onKod} boshOyin={boshOyin}
        onJonli={(d) => setBosqich({ nima: "lobbi", duel: d })} />
    );
  }
  if (bosqich.nima === "yuklanmoqda") return <Kutish />;
  if (bosqich.nima === "xato") return <Xabar belgi="⚠️" sarlavha={bosqich.matn} onChiq={onChiq} />;
  if (bosqich.nima === "havola") return <HavolaEkrani duel={bosqich.duel} onChiq={onChiq} />;
  if (bosqich.nima === "yakun") {
    return (
      <Natija
        yakun={bosqich.yakun} xato={bosqich.xato} oyinId={bosqich.duel.oyin}
        // Javob berish — AYNAN shu shartlar bilan yangi chaqiruv.
        // Shartlarni qaytadan tanlash "yana o'ynayman" degan qarorni
        // uch bosishga cho'zib yuborardi.
        onQayta={() => yasa({
          oyin: bosqich.duel.oyin,
          savollar: bosqich.duel.savollar,
          vaqt: bosqich.duel.vaqt,
        })}
        onYangi={yangiDuelga}
        onMashq={onOyin}
        onChiq={onChiq}
      />
    );
  }

  if (bosqich.nima === "lobbi") {
    return (
      <Lobbi
        duel={bosqich.duel} menChaqirdim
        onBoshla={(d) => setBosqich({ nima: "oyin", duel: d, jonli: true })}
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
      onYakun={(y, xato) => setBosqich({
        nima: "yakun", yakun: y, duel: bosqich.duel, xato,
      })}
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
function Shartlar({ onTanladi, onChiq, onKod, onJonli, boshOyin }: {
  /** `kimga` — onlayn ro'yxatdan tanlangan raqib (bo'lmasa havola bilan). */
  onTanladi: (s: DuelShart, kimga?: number) => void;
  onChiq: () => void;
  onKod?: (kod: string) => void;
  /** Jonli taklif yuborildi — lobbiga o'tiladi. */
  onJonli: (d: DuelHolat) => void;
  boshOyin?: string;
}) {
  const [oyin, setOyin] = useState<OyinTur>(
    () => DUEL_OYINLAR.find((o) => o.id === boshOyin) ?? DUEL_OYINLAR[0]);
  const [savollar, setSavollar] = useState<number>(20);
  const [vaqt, setVaqt] = useState<number>(60);
  const [daraja, setDaraja] = useState<Daraja>(() => duelDarajaTaklif(oyin.id));
  const shart: DuelShart = { oyin: oyin.id, savollar, vaqt, daraja };

  /* ---- do'stlar ----
     Bir marta yuklanadi va ikki joyda chiziladi: kutayotganlar TEPADA
     (javob berish — eng muhim ish), qolganlari pastda, chaqiruv
     tugmasi ostida (ular uchun avval shartlar tanlanadi). */
  const [dostlar, setDostlar] = useState<DuelDost[] | null>(null);
  const [taklifXato, setTaklifXato] = useState("");
  const [yuborilmoqda, setYuborilmoqda] = useState(0);

  useEffect(() => {
    let bekor = false;
    duelDostlar().then((d) => { if (!bekor) setDostlar(d); });
    return () => { bekor = true; };
  }, []);

  const darajaTanla = (d: Daraja) => { setDaraja(d); duelDarajaSaqla(d); };

  const jonliChaqir = (dost: DuelDost) => {
    setTaklifXato("");
    setYuborilmoqda(dost.profil);
    duelTaklifYubor(dost.profil, shart)
      .then(onJonli)
      .catch((e) => {
        setYuborilmoqda(0);
        const sabab = e instanceof DuelXato ? e.sabab : "";
        const kalit = `duelTaklif_${sabab}` as Kalit;
        setTaklifXato(`${dost.ism}: ${
          ["notanish", "oflayn", "soatiga", "bugun_rad", "yopiq", "band"].includes(sabab)
            ? t(kalit) : t("duelXato")}`);
        // Ro'yxat eskirgan — "jonli" tugmasi endi noto'g'ri bo'lishi mumkin.
        duelDostlar().then(setDostlar);
      });
  };

  const kutayotganlar = (dostlar ?? []).filter((d) => d.navbat === "men");
  const qolganlar = (dostlar ?? []).filter((d) => d.navbat !== "men");

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
                         size-[clamp(52px,9vh,72px)]">
          {/* O'lcham `olcham` bilan emas, klass bilan beriladi: bu ekran
              past telefonda siqiladi va tomon `clamp` bo'lishi kerak,
              raqam esa buni ifodalay olmaydi. `olcham` faqat xaritada
              yo'q emoji uchun — o'shanda matn bo'lib chiqadi. */}
          <EmojiBelgi e="⚔️" olcham={40} className="size-[clamp(30px,5vh,40px)]" />
        </span>
        <h1 className="mt-2.5 text-[clamp(19px,3.4vh,23px)] leading-tight">{t("duel")}</h1>
        <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{t("duelShartIzoh")}</p>
      </div>

      {/* ---- sizni kutyapti ----
          Eng tepada: do'st allaqachon o'ynab qo'ygan va javob kutyapti.
          Bu — ekranga kirishning eng ko'p sababi (Trivia Crack usuli). */}
      {kutayotganlar.length > 0 && (
        <DostlarRoyxat sarlavha={t("duelNavbatSarlavha")} dostlar={kutayotganlar}
          onKod={onKod} onJonli={jonliChaqir} onChaqir={(p) => onTanladi(shart, p)}
          yuborilmoqda={yuborilmoqda} />
      )}

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
              <EmojiBelgi e={o.emoji} olcham={30} className="size-[clamp(24px,4vh,30px)]" />
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

      <DarajaTanlov joriy={daraja} onTanla={darajaTanla} />

      {/* Tanlangan shartlar bitta qatorda takrorlanadi: uchta tanlov uch
          joyda turadi va ularni birga ko'rmasdan "nima chiqdi?" degan
          savolga javob berib bo'lmaydi. */}
      <p className="mt-[clamp(10px,2vh,20px)] text-center text-[12.5px] text-ink-soft">
        {t("duelShartYakun", { oyin: t(oyin.nom), savollar, vaqt })}
      </p>

      <button type="button" onClick={() => onTanladi(shart)}
        className="tugma-3d az-yaltir mt-2.5 w-full rounded-3xl bg-brand-green
                   py-[clamp(11px,2.2vh,16px)] font-display text-[17px] text-white
                   shadow-[0_6px_0_var(--color-brand-green-d)]">
        {t("duelChaqirish")}
      </button>

      <button type="button" onClick={onChiq}
        className="mt-2.5 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
        {t("duelOyinlarga")}
      </button>

      {taklifXato && (
        <p role="status" className="mt-5 rounded-clay bg-karta px-3.5 py-3 text-[13px]
                                    leading-snug text-ink-soft shadow-clay-sm">
          {taklifXato}
        </p>
      )}

      {qolganlar.length > 0 && (
        <DostlarRoyxat sarlavha={t("duelDostlar")} dostlar={qolganlar}
          onKod={onKod} onJonli={jonliChaqir} onChaqir={(p) => onTanladi(shart, p)}
          yuborilmoqda={yuborilmoqda} />
      )}

      <Onlayn onChaqir={(profil) => onTanladi(shart, profil)} />
    </div>
  );
}

/**
 * O'z darajasini tanlash — uchta tugma va yosh MASLAHATI.
 *
 * Bu duelni yoshdan qat'iy nazar adolatli qiladigan yagona tanlov: bola
 * "Oson" da, dadasi "Qiyin" da yechadi va ikkalasi teng imkoniyat bilan
 * o'ynaydi. Raqib o'z darajasini o'zi tanlaydi.
 */
function DarajaTanlov({ joriy, onTanla }: { joriy: Daraja; onTanla: (d: Daraja) => void }) {
  return (
    <>
      <h2 className="mt-[clamp(12px,2.2vh,20px)] mb-0.5 ml-1.5 text-[11px] tracking-widest
                     text-ink-soft uppercase">
        {t("duelDarajaSarlavha")}
      </h2>
      <p className="mb-1.5 ml-1.5 text-[12px] leading-snug text-ink-dim">{t("duelDarajaIzoh")}</p>
      <div className="flex gap-2">
        {DARAJALAR.map((d) => (
          <button key={d.n} type="button" onClick={() => onTanla(d.n)} aria-pressed={d.n === joriy}
            className={`clay-press flex min-w-0 flex-1 flex-col items-center rounded-clay px-1
                        py-[clamp(7px,1.5vh,10px)] transition-colors ${d.n === joriy
                          ? "bg-brand-blue text-white shadow-clay"
                          : "bg-karta text-ink-soft shadow-clay-sm"}`}>
            <span className="font-display text-[clamp(14px,2.4vh,16px)]">{t(d.nom)}</span>
            <span className={`truncate text-[11px] ${d.n === joriy ? "text-white/85" : "text-ink-dim"}`}>
              {t(d.yosh).split(" · ")[0]}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

/** "Siz: Oson · Aziz: Qiyin" — ikkala daraja ochiq ko'rinadi, yashirin ustunlik yo'q. */
function DarajaJuftlik({ men, raqib, nom }: { men: number; raqib?: number | null; nom: string }) {
  if (!raqib) return null;
  return (
    <p className="mt-2 text-[12.5px] text-ink-soft">
      {t("duelDarajalar", {
        men: t(darajaMa(darajaSon(men)).nom), nom, u: t(darajaMa(darajaSon(raqib)).nom),
      })}
    </p>
  );
}

/**
 * Do'stlar — kim bilan o'ynaganman, hisob, zanjir va bitta amal.
 *
 * Qatorda ko'pi bilan UCH qavat (dizayn qoidasi): ism · hisob va zanjir ·
 * bitta tugma. Amal holatga qarab bittagina:
 *
 *   navbat menda     "O'ynash"      — u kutyapti, chaqiruvni ochadi
 *   navbat unda      jim yozuv      — ikkinchi chaqiruvning ma'nosi yo'q
 *   onlayn va tanish "Jonli"        — ekranda taklif chiqadi
 *   qolgan hollarda  "Chaqirish"    — bot xabari bilan oddiy chaqiruv
 */
function DostlarRoyxat({ sarlavha, dostlar, onKod, onJonli, onChaqir, yuborilmoqda }: {
  sarlavha: string;
  dostlar: DuelDost[];
  onKod?: (kod: string) => void;
  onJonli: (d: DuelDost) => void;
  onChaqir: (profil: number) => void;
  yuborilmoqda: number;
}) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">{sarlavha}</h2>
      <div className="space-y-1.5">
        {dostlar.map((d) => {
          const h = d.hisob;
          return (
            <div key={d.profil}
              className="flex items-center gap-2.5 rounded-clay bg-karta px-3 py-2.5 shadow-clay-sm">
              <span className="relative shrink-0">
                <span className="grid size-8 place-items-center rounded-full bg-track text-[14px]">
                  <EmojiBelgi e={avatarBelgi(d.avatar)} olcham={14} />
                </span>
                {d.onlayn && (
                  <span className="az-jonli absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full
                                   bg-brand-green ring-2 ring-karta" />
                )}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-[13.5px] leading-tight">{d.ism}</span>
                  {(h.zanjir ?? 0) > 0 && (
                    <span className="shrink-0 text-[11.5px] font-semibold text-brand-gold-d">
                      <EmojiMatn>{t("duelZanjir", { n: h.zanjir ?? 0 })}</EmojiMatn>
                    </span>
                  )}
                </span>
                <span className={`block truncate text-[11.5px] ${
                  h.xavf ? "text-brand-gold-d" : "text-ink-dim"}`}>
                  {h.xavf ? t("duelZanjirXavf")
                    : d.onlayn && holatYozuv(d.holat, d.oyin) ? holatYozuv(d.holat, d.oyin)
                    : h.jami ? t("duelDostHisob", { men: h.men, raqib: h.raqib })
                    : d.onlayn ? t("duelHozir") : ""}
                </span>
              </span>

              {d.navbat === "men" && d.kod ? (
                <button type="button" onClick={() => onKod?.(d.kod)}
                  data-tahlil="Duel: kutayotganga javob"
                  className="clay-press shrink-0 rounded-full bg-brand-green px-3.5 py-2
                             text-[12.5px] text-white">
                  {t("duelOynash")}
                </button>
              ) : d.navbat === "u" ? (
                <span className="shrink-0 text-[11.5px] text-ink-dim">{t("duelJavobKutilmoqda")}</span>
              ) : d.jonli ? (
                <button type="button" onClick={() => onJonli(d)} disabled={yuborilmoqda > 0}
                  data-tahlil="Duel: jonli taklif"
                  className="clay-press shrink-0 rounded-full bg-brand-blue px-3.5 py-2
                             text-[12.5px] text-white disabled:opacity-60">
                  {yuborilmoqda === d.profil ? "…" : t("duelJonliChaqir")}
                </button>
              ) : (
                <button type="button" onClick={() => onChaqir(d.profil)}
                  data-tahlil="Duel: do'stni chaqirish"
                  className="clay-press shrink-0 rounded-full bg-track px-3.5 py-2
                             text-[12.5px] text-ink-soft">
                  {t("duelChaqir")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * "20 daqiqa oldin", "3 soat oldin" — oxirgi marta qachon ko'ringani.
 *
 * ANIQ VAQT ataylab: "bugun kirgan" degan yozuv ertalab kirgan odam
 * bilan yigirma daqiqa oldin chiqib ketgan odamni bir xil ko'rsatardi.
 * Holbuki ikkinchisi deyarli albatta javob beradi, birinchisi esa
 * yo'q — va odam kimni chaqirishni aynan shunga qarab tanlaydi.
 */
/**
 * Odamning holati bitta qisqa yozuvda: "Jadval o'ynayapti", "duelda".
 * `bosh` va `yoq` uchun `null` — ular uchun o'z yozuvi bor.
 */
function holatYozuv(holat?: OdamHolat, oyin?: string): string | null {
  if (holat === "duelda") return t("duelHolatDuelda");
  if (holat === "oqiyapti") return t("duelHolatOqiyapti");
  if (holat === "oyinda") {
    const o = oyin ? oyinById(oyin) : undefined;
    return t("duelHolatOyinda", { oyin: o ? t(o.nom) : t("oyinlar") });
  }
  return null;
}

/** Duelda yoki darsda — chaqirilmaydi, o'qish va bellashuv uzilmasin. */
const bandmi = (holat?: OdamHolat) => holat === "duelda" || holat === "oqiyapti";

function qachonKorindi(iso: string): string {
  const daqiqa = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (daqiqa < 60) return t("duelDaqiqaOldin", { n: Math.max(1, daqiqa) });
  return t("duelSoatOldin", { n: Math.round(daqiqa / 60) });
}

/**
 * Ro'yxat necha soniyada bir yangilanadi.
 *
 * Sakkiz soniya — bu ekranda odam raqib QIDIRIB turadi va ro'yxat
 * jonli bo'lishi kerak: kimdir kirsa, u yarim daqiqadan keyin emas,
 * darrov paydo bo'lsin. So'rov kichkina (bir necha yuz bayt) va
 * faqat shu ekran ochiq turganda ketadi.
 *
 * Bundan tezroq qilishning ma'nosi yo'q: serverdagi `last_seen`
 * baribir 120 soniyada bir yoziladi, ya'ni ma'lumot o'zi shundan
 * tez yangilanmaydi.
 */
const ONLAYN_YANGILASH_MS = 8_000;

/**
 * KIMNI CHAQIRSA BO'LADI — bitta bosishda chaqiriladi.
 *
 * NEGA KERAK. Duel shu paytgacha faqat HAVOLA bilan ishlardi: odam
 * chaqiruv yasaydi, uni do'stiga yuboradi va javobini kutadi. Do'sti
 * bor odam uchun bu yetarli, kimsasi yo'q bola esa duelni umuman
 * o'ynay olmasdi — raqib topadigan joy yo'q edi.
 *
 * Ro'yxatga faqat Telegram'i bog'langanlar tushadi: chaqiruv o'sha
 * yerga xabar bo'lib boradi va boshqa yetkazish yo'li yo'q
 * (`backend/core/onlayn.py`).
 *
 * ─────────────── BO'SH BO'LSA HAM KO'RINADI ───────────────
 *
 * Ilgari ro'yxat bo'sh bo'lganda BUTUNLAY yashirinardi va u deyarli
 * har doim bo'sh edi (kuniga o'n besh chog'li odam kiradi, ya'ni
 * istalgan lahzada ichkarida bir-ikki kishi bo'ladi). Natijada
 * xususiyat bor edi-yu, uni hech kim ko'rmasdi — hatto uni
 * yozganlar ham "ishlamayapti" deb o'ylardi.
 *
 * Endi bo'lim har doim turadi va bo'sh bo'lsa buni AYTADI. Yo'qlik
 * ham javob: odam nima bo'layotganini biladi va havola bilan
 * chaqirish yo'liga o'tadi.
 *
 * ─────────────── O'ZI YANGILANADI ───────────────
 *
 * Ro'yxat yigirma soniyada bir qayta so'raladi va ekranga qaytilganda
 * ham (`visibilitychange`). Bir marta yuklab qo'yish yetarli emas:
 * odam duel ekranida o'ylanib turadi va shu orada boshqa birov
 * ilovaga kirishi mumkin — u esa ro'yxatda paydo bo'lmasdi.
 */
function Onlayn({ onChaqir }: { onChaqir: (profil: number) => void }) {
  const [ro, setRo] = useState<OnlaynOyinchi[] | null>(null);
  const [onlaynSoni, setOnlaynSoni] = useState(0);

  useEffect(() => {
    let bekor = false;

    const yukla = async () => {
      const d = await onlaynOyinchilar();
      if (bekor) return;
      // Tartib — kimni chaqirish oson: bo'sh turgan tepada, band pastda.
      const tartib: Record<string, number> = { bosh: 0, oyinda: 1, yoq: 2, duelda: 3, oqiyapti: 4 };
      setRo([...d.oyinchilar].sort((a, b) =>
        (tartib[a.holat ?? (a.onlayn ? "bosh" : "yoq")] ?? 2)
        - (tartib[b.holat ?? (b.onlayn ? "bosh" : "yoq")] ?? 2)));
      setOnlaynSoni(d.onlaynSoni);
    };

    void yukla();
    const soat = setInterval(() => { void yukla(); }, ONLAYN_YANGILASH_MS);
    // Ilova fonda turganda so'rov yubormaymiz va qaytilganda darhol
    // yangilaymiz: telefon fonda soatlab tursa, o'nlab keraksiz
    // so'rov ketardi va qaytgan odam baribir eski ro'yxatni ko'rardi.
    const korinish = () => { if (!document.hidden) void yukla(); };
    document.addEventListener("visibilitychange", korinish);

    return () => {
      bekor = true;
      clearInterval(soat);
      document.removeEventListener("visibilitychange", korinish);
    };
  }, []);

  // Birinchi yuklanish tugamaguncha hech narsa chizilmaydi: bo'sh
  // ro'yxat bir lahza chaqnab, keyin to'lishi "xato bo'ldimi?" degan
  // taassurot berardi.
  if (ro === null) return null;

  return (
    <div className="mt-7">
      <h2 className="mb-2 ml-1.5 flex items-center gap-1.5 text-[11px] tracking-widest
                     text-ink-soft uppercase">
        {/* Yashil nuqta — "hozir" degan yagona ishora. Kimdir onlayn
            bo'lsa u JIMIRLAYDI: ro'yxat tirik ekanini va o'zi
            yangilanib turishini shu bildiradi. Hech kim bo'lmasa
            nuqta so'nadi va tinch turadi. */}
        <span className={`size-1.5 rounded-full ${
          onlaynSoni > 0 ? "az-jonli bg-brand-green" : "bg-ink-dim/40"}`} />
        {onlaynSoni > 0 ? t("duelOnlayn", { n: onlaynSoni }) : t("duelKimChaqirish")}
      </h2>

      {ro.length === 0 ? (
        <p className="rounded-clay bg-karta px-3.5 py-3 text-[12.5px] leading-snug
                      text-ink-dim shadow-clay-sm">
          {t("duelHechKim")}
        </p>
      ) : (
        <div className="space-y-1.5">
          {ro.map((o) => (
            <div key={o.profil}
              className="flex items-center gap-2.5 rounded-clay bg-karta px-3 py-2.5
                         shadow-clay-sm">
              <span className="relative shrink-0">
                <span className="grid size-7 place-items-center rounded-full bg-track
                                 text-[13px]">
                  <EmojiBelgi e={avatarBelgi(o.avatar)} olcham={12} />
                </span>
                {/* Yashil nuqta avatarning ustida — "hozir shu yerda"
                    degan belgi messenjerlarda ham shu joyda turadi va
                    uni tushuntirish kerak emas. */}
                {o.onlayn && (
                  <span className="az-jonli absolute -right-0.5 -bottom-0.5 size-2.5
                                   rounded-full bg-brand-green ring-2 ring-karta" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] leading-tight">{o.ism}</span>
                {/* Holat: nima qilyapti. Band odam kulrang — uni hozir
                    chaqirib bo'lmasligi yozuvning o'zidan ko'rinsin. */}
                <span className={`block truncate text-[11px] ${
                  bandmi(o.holat) ? "text-ink-dim"
                    : o.onlayn ? "text-brand-green" : "text-ink-dim"}`}>
                  {holatYozuv(o.holat, o.oyin)
                    ?? (o.onlayn ? t("duelHolatBosh") : qachonKorindi(o.korindi))}
                </span>
              </span>
              {bandmi(o.holat) ? (
                <span className="shrink-0 rounded-full bg-track px-3 py-1.5 text-[12px] text-ink-dim">
                  {t("duelBand")}
                </span>
              ) : (
                <button type="button" onClick={() => onChaqir(o.profil)}
                  data-tahlil={`Duel: onlayn chaqirish (${o.holat ?? "?"})`}
                  className="clay-press min-h-9 shrink-0 rounded-full bg-brand-blue px-3.5 py-1.5
                             text-[12.5px] text-white">
                  {t("duelChaqir")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
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
  | { nima: "yakun"; yakun: DuelYakun; duel: DuelHolat; xato: number };

export function DuelQabul({ kod, onChiq, onDuel, onOyin }: {
  kod: string;
  onChiq: () => void;
  /** "Javob berish" — o'z chaqiruvingizni yasash ekraniga. */
  onDuel?: () => void;
  onOyin?: (id: string) => void;
}) {
  const tg = useTgHisob();
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

  // Qayta bellashuv — chaqirgan odam O'ZGARMAYDI, ya'ni bu yerda men
  // yana qabul qilgan tomon bo'lib qolaveraman va lobbi ham shu
  // ko'rinishda ochiladi.
  const yangiDuelga = useCallback((yangiKod: string) => {
    setBosqich({ nima: "yuklanmoqda" });
    duelKorish(yangiKod).then((d) => setBosqich(
      d ? { nima: "lobbi", duel: d } : { nima: "xato", matn: t("duelXato") },
    ));
  }, []);

  const asinxronBoshla = (daraja: Daraja) => {
    setBosqich({ nima: "yuklanmoqda" });
    duelQabul(kod, daraja)
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
  if (bosqich.nima === "yakun") {
    return (
      <Natija
        yakun={bosqich.yakun} xato={bosqich.xato} oyinId={bosqich.duel.oyin}
        // Chaqiruvni OCHGAN odam javob qaytarganda O'ZI chaqiruvchi
        // bo'ladi — ya'ni oddiy duel ekraniga o'tadi va shartlarni
        // o'zi tanlaydi. Zanjir shu yerda almashadi.
        onQayta={onDuel}
        onYangi={yangiDuelga}
        onMashq={onOyin}
        onChiq={onChiq}
      />
    );
  }

  if (bosqich.nima === "taklif") {
    return <Taklif duel={bosqich.duel} onQabul={asinxronBoshla} onChiq={onChiq} />;
  }

  if (bosqich.nima === "lobbi") {
    return (
      <Lobbi
        duel={bosqich.duel} menChaqirdim={false}
        onBoshla={(d) => setBosqich({ nima: "oyin", duel: d, jonli: true })}
        onChiq={onChiq}
      />
    );
  }

  return (
    <Bellashuv
      duel={bosqich.duel} jonli={bosqich.jonli} menChaqirdim={false}
      onChiq={onChiq}
      onYakun={(y, xato) => setBosqich({
        nima: "yakun", yakun: y, duel: bosqich.duel, xato,
      })}
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
  /** O'yin boshlanadi — oxirgi ma'lum darajalar bilan yangilangan duel. */
  onBoshla: (d: DuelHolat) => void;
  onYolgiz?: () => void;
  onChiq: () => void;
}) {
  const oyin = oyinById(duel.oyin);
  const [holat, setHolat] = useState<DuelJonli | null>(null);
  const [tayyorlanmoqda, setTayyorlanmoqda] = useState(false);
  const boshlandiRef = useRef(false);
  // Qabul qilgan tomon darajasini SHU YERDA tanlaydi ("tayyorman" dan oldin).
  const [daraja, setDaraja] = useState<Daraja>(() =>
    darajaSon(duel.menDaraja ?? duelDarajaTaklif(duel.oyin)));
  // O'yin savollari MENING darajamda yasaladi — boshlanish lahzasidagi
  // eng so'nggi qiymat kerak, shuning uchun ref.
  const oxirgiRef = useRef<DuelJonli | null>(null);
  oxirgiRef.current = holat;
  const boshla = () => onBoshla({
    ...duel,
    menDaraja: oxirgiRef.current?.menDaraja ?? duel.menDaraja,
    raqibDaraja: oxirgiRef.current?.raqibDaraja ?? duel.raqibDaraja,
  });

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
        boshla();
      }
    };
    void sora();
    const id = setInterval(() => void sora(), SOROV);
    return () => { bekor = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duel.kod]);

  // Sanoq boshlangach — so'rovni kutmasdan, o'z soatimiz bilan
  // hisoblaymiz: 2 soniyalik so'rov oralig'ida sanoq sakrab ketardi.
  //
  // Boshlang'ich qiymat DUELNING O'ZIDAN olinadi. Qayta bellashuvda
  // o'yin allaqachon boshlangan bo'ladi (ikkalasi rozi bo'lgan payt
  // serverda belgilangan) va busiz birinchi so'rov kelgunicha ekranda
  // "do'stingizga havola yuboring" degan qadam ko'rinib ketardi.
  const boshlanish = holat?.boshlanishSoniya ?? duel.boshlanishSoniya ?? null;
  const [sanoq, setSanoq] = useState<number | null>(null);
  useEffect(() => {
    if (boshlanish == null) { setSanoq(null); return; }
    let qolgan = boshlanish;
    setSanoq(Math.ceil(qolgan));
    const id = setInterval(() => {
      qolgan -= 0.25;
      setSanoq(Math.ceil(Math.max(0, qolgan)));
      if (qolgan <= 0 && !boshlandiRef.current) {
        boshlandiRef.current = true;
        clearInterval(id);
        boshla();
      }
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boshlanish !== null]);

  const tayyorla = () => {
    setTayyorlanmoqda(true);
    if (!menChaqirdim) duelDarajaSaqla(daraja);
    duelTayyor(duel.kod, menChaqirdim ? undefined : daraja)
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
  // Jonli taklif bilan chaqirilgan bo'lsa — havola qadamlari kerak emas,
  // ularning o'rnida do'stning javobi turadi.
  const taklif = holat?.taklif ?? duel.taklif ?? null;
  const raqibNomi = holat?.raqibNom || (menChaqirdim ? t("duelDostKutilmoqda") : duel.chaqirgan);
  const taklifTugadi = taklif?.holat === "rad" || taklif?.holat === "otdi";

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col justify-center px-4 py-10
                    text-center sm:max-w-[560px]">
      <span className="mx-auto grid size-20 place-items-center rounded-[26px] bg-brand-orange
                       shadow-clay">
        <EmojiBelgi e="⚔️" olcham={44} />
      </span>

      <h1 className="mt-4 text-[23px] leading-tight">
        {menChaqirdim ? t("duel") : t("duelChaqiruv", { nom: duel.chaqirgan })}
      </h1>

      {oyin && (
        <div className="mx-auto mt-4 flex items-center gap-2.5 rounded-clay bg-karta px-4 py-3 shadow-clay-sm">
          <EmojiBelgi e={oyin.emoji} olcham={30} className="shrink-0" />
          <span className="font-display text-[15px]">{t(oyin.nom)}</span>
          <span className="text-[12.5px] text-ink-soft">
            · {duel.savollar || 20} · {t("duelSoniya", { n: duel.vaqt || 60 })}
          </span>
        </div>
      )}

      <Hisob hisob={duel.hisob} />
      <DarajaJuftlik nom={raqibNomi}
        men={holat?.menDaraja ?? duel.menDaraja ?? daraja}
        raqib={holat?.raqibDaraja ?? duel.raqibDaraja} />

      {taklif && (
        <div role="status" className={`mt-6 rounded-clay px-3.5 py-3 text-[13.5px] leading-snug ${
          taklif.holat === "qabul"
            ? "bg-brand-green/15 text-brand-green-d" : "bg-karta text-ink-soft shadow-clay-sm"}`}>
          {taklif.holat === "kutyapti"
            ? t("duelTaklifKutilmoqda", { nom: raqibNomi, n: taklif.qolgan })
            : taklif.holat === "rad" ? t("duelTaklifRad", { nom: raqibNomi })
            : taklif.holat === "otdi" ? t("duelTaklifOtdi", { nom: raqibNomi })
            : t("duelBoshlanmoqda")}
          {taklifTugadi && <span className="mt-1 block text-[12.5px] text-ink-dim">{t("duelTaklifYolgiz")}</span>}
        </div>
      )}

      {/* ---- 1-qadam: havola ----
          CHAQIRGAN odamda birinchi va eng katta harakat aynan shu.
          Ilgari ulashish tugmasi pastda, "tayyorman" dan keyin turardi
          va ekran "nimani kutyapman?" degan savol bilan qolardi: odam
          do'stiga havola YUBORISHI kerakligini tushunmasdi.

          Endi qadamlar RAQAMLANGAN: avval havola, keyin tayyorlik. */}
      {/* Onlayn ro'yxatdan chaqirilgan bo'lsa, xabar ALLAQACHON ketgan
          va "havola yuboring" degan qadam yolg'on bo'lardi: odam uni
          o'qib, havolani ikkinchi marta yuborardi. Ulashish tugmasi
          baribir qoladi — chaqiruv Telegram'da ko'zdan qochsa,
          havolani qo'lda ham tashlash mumkin. */}
      {menChaqirdim && !taklif && duel.yuborildi && (
        <div className="mt-6 flex items-center gap-2 rounded-clay bg-brand-green/15
                        px-3.5 py-3 text-left">
          <Icon name="check" size={17} className="shrink-0 text-brand-green" />
          <span className="text-[13px] leading-snug text-brand-green">
            {t("duelChaqiruvKetdi")}
          </span>
        </div>
      )}

      {menChaqirdim && !taklif && (
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

      {menChaqirdim && !taklif && (
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
          nom={raqibNomi}
          tayyor={holat?.raqibTayyor ?? false}
          bor={menChaqirdim ? (holat?.raqibBor ?? false) : true}
        />
      </div>

      {!menTayyor && !menChaqirdim && <DarajaTanlov joriy={daraja} onTanla={setDaraja} />}

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
          className={taklifTugadi
            ? "tugma-3d mt-3 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[16px] text-white shadow-[0_5px_0_var(--color-brand-green-d)]"
            : "mt-3 w-full py-2 text-[13.5px] font-semibold text-ink-dim"}>
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

/**
 * Umumiy hisob — "Aziz bilan 4:3".
 *
 * NEGA KERAK. Bitta duelning bali ertaga esdan chiqadi, bu son esa
 * qolib ketadi: u ikki bolani doimiy raqibga aylantiradi va keyingi
 * bellashuvga sabab yaratadi. Shuning uchun u duel OLDIDA ham, natija
 * ekranida ham ko'rinadi.
 *
 * Birinchi uchrashuvda hech narsa chizilmaydi: "0 : 0" degan qator
 * ma'no bermaydi va ekranni behuda band qiladi.
 */
function Hisob({ hisob }: { hisob?: DuelHisob | null }) {
  if (!hisob?.jami) return null;

  return (
    <div className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-karta
                    px-3.5 py-1.5 shadow-clay-sm">
      <span className="text-[12px] text-ink-soft">{t("duelUmumiyHisob")}</span>
      <span className="font-display text-[14.5px]">{hisob.men} : {hisob.raqib}</span>
      {hisob.durang > 0 && (
        <span className="text-[11.5px] text-ink-dim">
          · {t("duelHisobDurang", { n: hisob.durang })}
        </span>
      )}
      {/* Juftlik zanjiri — hisobning yonida, chunki ikkalasi bitta
          munosabat haqida: "Aziz bilan 4:3 · 🔥 5 kun". */}
      {(hisob.zanjir ?? 0) > 0 && (
        <span className="text-[12px] font-semibold text-brand-gold-d">
          · <EmojiMatn>{t("duelZanjir", { n: hisob.zanjir ?? 0 })}</EmojiMatn>
        </span>
      )}
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
  onYakun: (y: DuelYakun, xato: number) => void;
}) {
  const { oyinTugadi } = useProgress();
  const [raqibBall, setRaqibBall] = useState(0);
  const [kutilmoqda, setKutilmoqda] = useState(false);
  // "Duelda" — boshqalarning ro'yxatida chaqirish tugmasi o'chadi va
  // server bu odamga jonli taklif yubormaydi (`duel.taklif_mumkinmi`).
  // Raqib tugatishini kutayotganda ham "duelda": natija bir necha soniyada
  // keladi va shu orada kelgan taklif "yana o'ynaymizmi?" ni to'sib qo'yardi.
  useFaollik({ joy: "duel", nom: duel.oyin });
  const menBall = useRef(0);
  const menSanoq = useRef<number[]>([]);

  const oyin = oyinById(duel.oyin);
  // DARAJA esa har kimniki O'ZI (2026-09-17). Urug' bir xil, daraja har
  // xil — bola oson, dadasi qiyin savolni yechadi va ikkalasi teng
  // o'ynaydi. Eski server `menDaraja` bermaydi: o'shanda umumiy daraja.
  const menDaraja = darajaSon(duel.menDaraja ?? duel.daraja);
  // Savollar soni ham, vaqt ham CHAQIRUVDAN olinadi — ikkala o'yinchi
  // bir xil qiymatni oladi, chunki u serverdagi yozuvda turadi. Eski
  // chaqiruvlarda maydon bo'lmasligi mumkin, shuning uchun standart bor.
  const savollarRef = useRef(
    oyin
      ? duelSavollari(duel.urug ?? 0, duel.oyin, menDaraja, duel.savollar || 20)
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
  const xatoRef = useRef(0);

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
          menChaqirdim, hisob: h.hisob,
        }, xatoRef.current);
      }
    }, SOROV);
    return () => clearInterval(id);
  }, [menChaqirdim, onYakun]);

  const tugadi = (n: OyinNatija) => {
    xatoRef.current = n.xato ?? 0;
    oyinTugadi(tangaHisobi(n.ball, false), n.savollar);
    duelNatija<DuelYakun>(duel.kod, n.ball, n.xato ?? 0, n.sanoq ?? [])
      .then((y) => {
        // Asinxron duelda chaqirgan odam birinchi tugatdi — havola.
        if (!jonli && menChaqirdim && !y.tugadi) {
          onHavola?.({ ...duel, ...(y as unknown as DuelHolat) });
          return;
        }
        if (y.tugadi) { onYakun(y, n.xato ?? 0); return; }
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
      daraja={menDaraja}
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
        {/* Chaqiruv YASALDI — ekrandagi butun gap shu, konfetti ham shu
            yerda otiladi. Qilichlar qimirlagani mana shuning davomi. */}
        <span className="grid size-20 place-items-center rounded-[26px] bg-brand-green shadow-clay">
          <EmojiBelgi e="⚔️" olcham={44} jonli />
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
  duel: DuelHolat; onQabul: (daraja: Daraja) => void; onChiq: () => void;
}) {
  const oyin = oyinById(duel.oyin);
  const [daraja, setDaraja] = useState<Daraja>(() => duelDarajaTaklif(duel.oyin));

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col justify-center px-4 py-10
                    text-center sm:max-w-[560px]">
      <span className="mx-auto grid size-24 place-items-center rounded-[30px] bg-brand-orange
                       shadow-clay">
        <EmojiBelgi e="⚔️" olcham={52} />
      </span>

      <h1 className="mt-5 text-[24px] leading-tight">
        {t("duelChaqiruv", { nom: duel.chaqirgan })}
      </h1>
      <p className="mt-2 text-[14px] leading-snug text-ink-soft">{t("duelChaqiruvIzoh")}</p>

      {oyin && (
        <div className="mx-auto mt-5 flex items-center gap-2.5 rounded-clay bg-karta px-4 py-3 shadow-clay-sm">
          <EmojiBelgi e={oyin.emoji} olcham={30} className="shrink-0" />
          <span className="font-display text-[15px]">{t(oyin.nom)}</span>
          {/* Shartlar shu yerda ham ko'rinadi: do'sti nimaga rozi
              bo'layotganini bilishi kerak. */}
          <span className="text-[12.5px] text-ink-soft">
            · {duel.savollar || 20} · {t("duelSoniya", { n: duel.vaqt || 60 })}
          </span>
        </div>
      )}

      {/* Umumiy hisob AYNAN shu yerda eng kuchli ishlaydi: "3:2 orqadasiz"
          degan qator chaqiruvni qabul qilishning eng katta sababi. */}
      <Hisob hisob={duel.hisob} />

      {/* Raqib o'z darajasida o'ynab qo'ygan — endi mening navbatim
          o'zimnikini tanlash. Uning darajasi ham ochiq ko'rinadi. */}
      <DarajaJuftlik nom={duel.chaqirgan} men={daraja} raqib={duel.raqibDaraja} />
      <div className="text-left"><DarajaTanlov joriy={daraja} onTanla={setDaraja} /></div>

      <button type="button" onClick={() => { duelDarajaSaqla(daraja); onQabul(daraja); }}
        className="tugma-3d az-yaltir mt-6 w-full rounded-3xl bg-brand-green py-4 font-display
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

/**
 * Duel natijasi.
 *
 * Tugmalar ATAYLAB shu tartibda:
 *
 *   "Yana o'ynaymizmi?" — raqib SHU DAQIQADA ekran oldida bo'lsa.
 *                     Ikkalasi ham bosgach o'sha zahoti yangi duel
 *                     boshlanadi. Bu — eng qimmatli lahza: ikki odam
 *                     bir vaqtda ilovada turgan yagona payt.
 *   "Javob berish"  — raqib ketgan bo'lsa. Yangi chaqiruv yasaladi va
 *                     u botdan xabar bo'lib boradi.
 *   "Mashq qilish"  — xato qilgan bolani O'SHA o'yinga olib boradi.
 *                     O'yin oxiri — o'rganishga eng ochiq lahza.
 *   "O'yinlarga"    — chiqish.
 *
 * ─────────────── NEGA "QASOS" EMAS ───────────────
 *
 * Yutqazgan bolani qaytaradigan narsa o'ch olish emas, o'yinning o'zi
 * bo'lishi kerak. Shuning uchun taklif ikkala tomonga ham bir xil
 * do'stona ohangda ko'rinadi va uni YUTGAN odam ham birinchi bo'lib
 * bosishi mumkin.
 */
function Natija({ yakun, xato, oyinId, onQayta, onYangi, onMashq, onChiq }: {
  yakun: DuelYakun;
  /** Shu duelda nechta xato qilingan. */
  xato?: number;
  /** Qaysi o'yin edi — mashqqa o'sha ochiladi. */
  oyinId?: string;
  onQayta?: () => void;
  /** Qayta bellashuv boshlandi — yangi duel kodi bilan. */
  onYangi?: (kod: string) => void;
  onMashq?: (id: string) => void;
  onChiq: () => void;
}) {
  const meniki = yakun.menChaqirdim ? "chaqirgan" : "qabul";
  const yutdi = yakun.golib === meniki;
  const durang = yakun.golib === "durang";
  const raqibNom = yakun.raqibIsm || t("duelRaqib");

  /* ---- raqib hali shu yerdami ----
     Har 2 soniyada so'raymiz va so'rovning O'ZI "men ham shu
     yerdaman" belgisini qo'yadi. Server qayta bellashuvni faqat
     IKKALASINING belgisi yangi bo'lganda boshlaydi — ya'ni ikkalasi
     ham chindan ekran oldida. */
  const [jonli, setJonli] = useState<DuelJonli | null>(null);
  const [tekshirildi, setTekshirildi] = useState(false);
  const [menSoradim, setMenSoradim] = useState(false);
  const [boshlanmoqda, setBoshlanmoqda] = useState(false);
  const ketdiRef = useRef(false);

  const yangiga = useCallback((kod: string) => {
    if (ketdiRef.current) return;
    ketdiRef.current = true;
    setBoshlanmoqda(true);
    onYangi?.(kod);
  }, [onYangi]);

  useEffect(() => {
    if (!onYangi) return;
    let bekor = false;
    let qolgan = NATIJA_SOROV;
    const sora = async () => {
      const h = await duelHolat(yakun.kod);
      if (bekor) return;
      setTekshirildi(true);
      if (!h) return;
      setJonli(h);
      if (h.keyingiKod) yangiga(h.keyingiKod);
    };
    void sora();
    const id = setInterval(() => {
      // Chegara tugadi — raqib bu ekranga endi kelmaydi. So'rov
      // to'xtagach mening belgim ham eskiradi va server qayta
      // bellashuvni boshlamaydi: ikkala tomon bir xil xulosaga keladi.
      if (--qolgan <= 0) { clearInterval(id); setJonli(null); return; }
      void sora();
    }, SOROV);
    return () => { bekor = true; clearInterval(id); };
  }, [yakun.kod, onYangi, yangiga]);

  const menYana = menSoradim || (jonli?.menYana ?? false);
  const raqibYana = jonli?.raqibYana ?? false;
  const raqibShuYerda = jonli?.raqibShuYerda ?? false;

  const yanaSora = () => {
    setMenSoradim(true);
    duelYana(yakun.kod).then((h) => {
      if (!h) { setMenSoradim(false); return; }
      if (h.keyingiKod) yangiga(h.keyingiKod);
    });
  };

  // Yangi chaqiruv tugmasi FAQAT raqib ketgan bo'lsa ko'rinadi: u
  // yerda turganda "yana o'ynaymizmi?" har jihatdan yaxshiroq va ikki
  // yashil tugma yonma-yon turishi tanlovni og'irlashtirardi.
  const yangiChaqiruv = onQayta && (!onYangi || (tekshirildi && !raqibShuYerda));

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-10 pb-10 text-center sm:max-w-[560px]">
      <div className="relative mx-auto w-fit">
        {yutdi && <Konfetti />}
        <span className={`grid size-20 place-items-center rounded-[26px] shadow-clay
                          ${yutdi ? "bg-brand-gold" : "bg-karta"}`}>
          {/* Uchala holat ham qimirlaydi, yutqazgani ham. Harakat bu
              yerda mukofot emas — ekranning butun mazmuni shu bitta
              belgida va ko'z birinchi navbatda unga tushishi kerak. */}
          <EmojiBelgi e={yutdi ? "🏆" : durang ? "🤝" : "😔"} olcham={46} jonli />
        </span>
      </div>

      <h1 className="mt-4 text-[25px]">
        {yutdi ? t("duelYutdingiz") : durang ? t("duelDurang") : t("duelYutqazdingiz")}
      </h1>

      <div className="mt-5 flex items-center justify-center gap-3">
        <Taraf nom={t("duelSiz")} ball={yakun.meniki} kuchli={yutdi} />
        <span className="font-display text-[20px] text-ink-dim">:</span>
        <Taraf nom={raqibNom} ball={yakun.raqib} kuchli={!yutdi && !durang} />
      </div>

      {/* Umumiy hisob shu duel bilan birga yangilangan holda keladi:
          bugungi mag'lubiyat "3:2" ichida boshqacha ko'rinadi va
          ertaga qaytish uchun sabab bo'ladi. */}
      <Hisob hisob={yakun.hisob} />

      {/* Xato bo'lsa — uni YASHIRMAYMIZ. "3 ta xato" degan qator
          aybdorlik emas, keyingi qadam: pastdagi mashq tugmasi aynan
          shu sonni ko'rgan odam uchun ma'noga ega bo'ladi. */}
      {typeof xato === "number" && xato > 0 && (
        <p className="mt-3 text-[13px] text-ink-soft">{t("duelXatolar", { n: xato })}</p>
      )}

      {/* ---- yana o'ynash: ikkalasi ham shu yerda ---- */}
      {onYangi && raqibShuYerda && !menYana && (
        <>
          {raqibYana && (
            <p className="mt-6 mb-1 text-[13.5px] font-semibold text-brand-green-d">
              {t("duelYanaTaklif", { nom: raqibNom })}
            </p>
          )}
          <button type="button" onClick={yanaSora}
            className={`tugma-3d az-yaltir w-full rounded-3xl bg-brand-green py-3.5
                        font-display text-[17px] text-white
                        shadow-[0_5px_0_var(--color-brand-green-d)] ${raqibYana ? "" : "mt-6"}`}>
            {raqibYana ? t("duelYanaRozi") : t("duelYanaSoray")}
          </button>
        </>
      )}

      {/* Men so'radim — endi raqibning javobini kutamiz. Tugma
          o'rniga jimgina qator: ikkinchi bosishning ma'nosi yo'q. */}
      {onYangi && menYana && (
        <div className="mt-6 rounded-3xl bg-karta py-3.5 font-display text-[15px]
                        text-ink-soft shadow-clay-sm">
          {boshlanmoqda ? t("duelYanaBoshlanmoqda")
            : raqibShuYerda ? t("duelYanaKutilmoqda")
            : t("duelYanaKetdi")}
        </div>
      )}

      {yangiChaqiruv && (
        <button type="button" onClick={onQayta}
          className="tugma-3d az-yaltir mt-6 w-full rounded-3xl bg-brand-green py-3.5
                     font-display text-[17px] text-white
                     shadow-[0_5px_0_var(--color-brand-green-d)]">
          <EmojiMatn>{t("duelJavobBerish")}</EmojiMatn>
        </button>
      )}

      {onMashq && oyinId && (
        <button type="button" onClick={() => onMashq(oyinId)}
          className="clay-press mt-2.5 w-full rounded-3xl bg-karta py-3 font-display
                     text-[15px] text-ink-soft shadow-clay-sm">
          {t("duelMashqQil")}
        </button>
      )}

      <button type="button" onClick={onChiq}
        className={`w-full py-2 text-[13.5px] font-semibold text-ink-dim
                    ${onQayta || onYangi ? "mt-3" : "mt-8"}`}>
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
      {/* `belgi` emoji bo'lib keladi — chaqiruvchilar (`⚠️`, `🙈`) uni
          shunday berishadi. Almashtirish AYNAN shu yerda: prop turi
          o'zgarmaydi, ya'ni xaritada yo'q emoji berilsa ham ekran
          hozirgidek ishlayveradi. */}
      <span className="grid size-20 place-items-center rounded-[26px] bg-karta shadow-clay">
        <EmojiBelgi e={belgi} olcham={46} />
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
