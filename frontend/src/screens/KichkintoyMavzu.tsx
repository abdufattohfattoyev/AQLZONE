/**
 * ALBOM — bitta mavzu ichi. Bo'limning yuragi shu ekranda.
 *
 * ─────────── ISHLASH QOIDASI: BITTA NARSA, BITTA VAQTDA ───────────
 *
 * Ekranda ayni paytda FAQAT BITTA karta turadi va u juda katta. Setka
 * qilib, o'n ikkitasini birga ko'rsatish ham mumkin edi — kattalar
 * uchun shunisi qulay. Lekin 3 yoshli bolaning diqqati bitta narsaga
 * qaratiladi: o'n ikkita rasm bo'lsa, u hech biriga qaramaydi, faqat
 * barmog'ini yugurtiradi. Bitta katta rasm esa savol tug'diradi —
 * "bu nima?" — va aynan shu savol o'rganishning boshlanishi.
 *
 * ─────────── OVOZ O'ZI GAPIRADI ───────────
 *
 * Karta ochilishi bilan ilova nomini aytadi, keyin pauza qilib
 * tovushini ("bi-bip"). Bola hech narsa bosmaydi — bosishi shart
 * emas, chunki u hali "eshitish uchun tugmani bos" degan qoidani
 * bilmaydi. Sahnani bosish nomni QAYTA aytadi va bu bu yoshdagi eng
 * ko'p qilinadigan harakat: takror, takror, yana takror.
 *
 * Keyingi kartaning ovozi OLDINDAN yuklanadi. Server so'zni birinchi
 * marta yasashi bir necha soniya olishi mumkin va o'sha jimlik
 * "ilova buzuq" bo'lib tuyuladi.
 *
 * ─────────── O'YIN — ALBOMDAN KEYIN ───────────
 *
 * "Topib ber" tugmasi bola kamida to'rtta kartani ko'rgandan keyin
 * paydo bo'ladi. Bilmagan narsasini so'rash — bolani "men bilmayman"
 * degan holatga solish, va bu yoshda u ilovani yopish bilan tugaydi.
 *
 * O'yinda YUTQAZISH YO'Q. Xato javobda karta silkinadi, ovoz nomni
 * qaytadan aytadi va o'yin o'sha savolda turaveradi. Ball ham,
 * yulduz ham, vaqt ham yo'q.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../lib/icons";
import { Konfetti } from "../components/Konfetti";
import { KichkintoyKarta } from "../components/KichkintoyKarta";
import { OvozTugma } from "../components/OvozTugma";
import { aytiladigan, kNom, kOvoz, savolMatni } from "../lib/kichkintoy";
import type { Karta, Mavzu } from "../lib/kichkintoy";
import { korildi, korilganSoni } from "../lib/kichkintoyHolat";
import { gapirKetma, oldindanYukla, toxtat } from "../lib/ovoz";
import { tovushniChal, tovushniToxtat } from "../lib/tovush";
import { shuffle } from "../lib/rnd";
import { UNIT_COLORS } from "../lib/types";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";

/** O'yin ochilishi uchun shuncha karta ko'rilgan bo'lishi kerak. */
const OYIN_SHARTI = 4;

/** O'yindagi savollar soni. */
const SAVOL = 6;

export function KichkintoyMavzu({ m, onBack }: { m: Mavzu; onBack: () => void }) {
  const [oyinda, setOyinda] = useState(false);

  // Orqaga: o'yindan albomga, albomdan bo'limga. Telegram'ning nativ
  // tugmasi ham shu mantiqqa bo'ysunadi — aks holda o'yin o'rtasida
  // bosilgan "ortga" bolani butun bo'limdan chiqarib yuborardi.
  const orqaga = useCallback(() => {
    toxtat();
    tovushniToxtat();
    if (oyinda) setOyinda(false);
    else onBack();
  }, [oyinda, onBack]);

  const ozStrelka = useOrqaga(orqaga);

  // Ekrandan chiqqanda ovoz to'xtasin: bola "ortga" bosgach, ilova
  // yana yarim soniya "mashina" deb turmasligi kerak.
  useEffect(() => () => { toxtat(); tovushniToxtat(); }, []);

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-10 sm:max-w-[560px]">
      <div className="flex items-center justify-between gap-2">
        {ozStrelka ? (
          <button type="button" onClick={orqaga} title={t("ortga")}
            className="clay-press grid size-[38px] shrink-0 place-items-center rounded-full bg-karta
                       text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        ) : <span className="size-[38px]" />}

        <h1 className="min-w-0 truncate font-display text-[17px] leading-tight">{kNom(m)}</h1>

        <OvozTugma className="shrink-0" />
      </div>

      {oyinda
        ? <Oyin m={m} onChiq={() => setOyinda(false)} />
        : <Albom m={m} onOyin={() => setOyinda(true)} />}
    </div>
  );
}

/* ================================================================== */
/*                              ALBOM                                 */
/* ================================================================== */

function Albom({ m, onOyin }: { m: Mavzu; onOyin: () => void }) {
  const [i, setI] = useState(0);
  const k = m.kartalar[i];
  const rang = UNIT_COLORS[m.rang];

  // Ko'rilgan sanoq holatda turadi: `korilganSoni()` ni to'g'ridan-to'g'ri
  // chaqirsak, u localStorage'dan o'qiydi va React qayta chizishni
  // bilmasdi — o'yin tugmasi to'rtinchi kartada paydo bo'lmay qolardi.
  const [korilgan, setKorilgan] = useState(() => korilganSoni(m.id));

  /**
   * Karta almashganda: belgilaymiz, aytamiz, keyingisini tayyorlaymiz.
   *
   * `gapirKetma` ATAYLAB kutilmaydi (`void`): u ovoz tugaguncha
   * yashaydi va effektni bog'lab qo'ysa, karta almashishi sekinlashardi.
   */
  /**
   * Kartani "aytadi": gap, keyin tovush.
   *
   * Ikki xil tovush ikki xil yo'l bilan ketadi va tartib ham boshqacha:
   *
   *   HAYVON  gap → pauza → so'z ("Bu it" … "vov-vov"). Ikkalasi ham
   *           odam ovozi, ya'ni ular bitta oqim bo'lib eshitiladi va
   *           bola ikkinchisini takrorlaydi.
   *   MASHINA gap → pauza → HAQIQIY signal. Bu yerda ovoz kutilmaydi:
   *           gap tugagach tovush chalinadi, chunki ular butunlay
   *           boshqa manbadan keladi (biri server, biri brauzer).
   */
  const ayt = useCallback((x: Karta) => {
    const gap = aytiladigan(m.id, x);
    if (x.tovush) {
      void gapirKetma([gap]).then(() => tovushniChal(x.tovush!));
      return;
    }
    void gapirKetma([gap, kOvoz(x)]);
  }, [m]);

  useEffect(() => {
    korildi(m.id, k.id);
    setKorilgan(korilganSoni(m.id));
    ayt(k);

    // Keyingi ikkitasi oldindan yuklanadi. Ikkitasi — chunki bola
    // ko'pincha tez-tez bosadi va bittasi yetib ulgurmaydi. Mashina
    // tovushi yuklanmaydi: u brauzerda yasaladi, tarmoq kerak emas.
    const keyin = [m.kartalar[i + 1], m.kartalar[i + 2]].filter(Boolean);
    oldindanYukla(
      keyin.flatMap((x) => [aytiladigan(m.id, x), kOvoz(x)]).filter(Boolean),
    );
  }, [m, k, i, ayt]);

  const yur = (yon: 1 | -1) => {
    tebrat("tanlov");
    tovushniToxtat();
    setI((x) => (x + yon + m.kartalar.length) % m.kartalar.length);
  };

  const qaytar = () => {
    tebrat("tanlov");
    ayt(k);
  };

  /** Faqat TOVUSHNI qaytaradi — nomni qayta aytmasdan. */
  const tovushniQaytar = () => {
    tebrat("tanlov");
    if (k.tovush) { toxtat(); tovushniChal(k.tovush); }
    else void gapirKetma([kOvoz(k)]);
  };

  const surish = useSurish(yur);
  const tovushi = kOvoz(k);

  return (
    <>
      {/* ---- sahna ----
          Butun maydon bosiladigan tugma: bola ekranning istalgan
          joyiga tegadi va nomni qayta eshitadi. Kichik "karnay"
          tugmasi ham bor, lekin u faqat ISHORA — asosiy nishon
          kartaning o'zi. */}
      <button type="button" onClick={qaytar} title={t("kichkintoyQayta")}
        {...surish}
        style={{ backgroundImage: `radial-gradient(circle at 50% 38%, ${rang.road}1f, transparent 70%)` }}
        className="az-savol tugma-3d mt-4 flex min-h-[290px] w-full flex-col items-center justify-center
                   gap-4 rounded-clay bg-karta px-4 py-7 shadow-clay">
        {/* `key` — karta almashganda animatsiya qaytadan boshlansin:
            usiz rasm jimgina almashib, bola o'zgarishni sezmasdi. */}
        <span key={k.id} className="az-kadr flex flex-col items-center gap-3">
          <KichkintoyKarta k={k} olcham="katta" />

          <span className="font-display text-[30px] leading-none text-ink">{kNom(k)}</span>

        </span>
      </button>

      {/* ---- eshitish tugmalari ----
          KARTADAN TASHQARIDA turadi va bu ikki sababdan.

          KO'RINISH. Ilgari tugma faqat tovushi bor kartada (mashina,
          hayvon) chiqardi. Rang va raqam kartalarida esa ekranda
          hech qanday tugma yo'q edi: bola sahnani bosish mumkinligini
          BILMASDI va nomni qayta eshitolmasdi. Endi "Yana eshitish"
          har doim turadi — bu yoshda eng ko'p kerak bo'ladigan
          harakat aynan takror.

          TUZILISH. Ilgari u sahna tugmasining ICHIDA edi, ya'ni
          tugma ichida tugma — brauzer uchun ham, ekran o'quvchi uchun
          ham noto'g'ri. */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => { tebrat("tanlov"); ayt(k); }}
          className="clay-press inline-flex items-center gap-2 rounded-full bg-karta px-5 py-2.5
                     font-display text-[15.5px] leading-none text-ink shadow-clay-sm">
          <Icon name="ovoz" size={18} className="text-brand-green-d" />
          {t("kichkintoyQayta")}
        </button>

        {/* TOVUSH TUGMASI — ikki xil gapiradi.
            Mashinada u "tovushi" deydi va HAQIQIY signalni chaladi;
            hayvonda esa tovushning O'ZINI yozib qo'yadi ("vov-vov"),
            chunki bola aynan uni takrorlaydi. */}
        {(k.tovush || tovushi) && (
          <button type="button" onClick={tovushniQaytar}
            className="clay-press inline-flex items-center gap-2 rounded-full bg-track px-4 py-2.5
                       font-display text-[15.5px] leading-none text-ink-soft">
            <Icon name="ovoz" size={16} className="text-brand-green-d" />
            {k.tovush ? t("kichkintoyTovushi") : tovushi}
          </button>
        )}
      </div>

      {/* ---- yurish ----
          Tugmalar KATTA va chetlarda: bu yoshdagi bola telefonni ikki
          qo'llab ushlaydi va bosh barmog'i aynan shu joyga tushadi. */}
      <div className="mt-4 flex items-center gap-3">
        <YonTugma yon="chap" on={() => yur(-1)} />

        {/* Nuqtalar — qayerdaligini ko'rsatadi. Bosiladigan emas: o'n
            ikkita mayda nuqtaga aniq tegish bu yoshda imkonsiz va
            har tegish kartani sakratib yuborardi. */}
        <span aria-hidden className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-1.5">
          {m.kartalar.map((x, n) => (
            <span key={x.id}
              className={`h-2 rounded-full transition-all duration-300
                          ${n === i ? "w-5 bg-brand-green" : "w-2 bg-track"}`} />
          ))}
        </span>

        <YonTugma yon="ong" on={() => yur(1)} />
      </div>

      {/* ---- o'yin ----
          To'rtta karta ko'rilgunicha ko'rinmaydi. Tugma "paydo
          bo'lishi" ning o'zi mukofot bo'lib ishlaydi: bola albomni
          ko'rib chiqqach, ekranda yangi narsa ochiladi. */}
      {korilgan >= Math.min(OYIN_SHARTI, m.kartalar.length) && (
        <button type="button" onClick={() => { tebrat("tanlov"); onOyin(); }}
          className="az-kirish tugma-3d az-yaltir mt-5 flex w-full items-center gap-3.5 rounded-clay
                     bg-brand-green p-4 text-left text-white shadow-clay">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-[26px]">
            🎯
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[17px] leading-tight">{t("kichkintoyOyin")}</span>
            <span className="mt-0.5 block text-[12.5px] text-white/85">{t("kichkintoyOyinIzoh")}</span>
          </span>
          <Icon name="chevron" size={18} className="shrink-0 text-white/80" />
        </button>
      )}
    </>
  );
}

function YonTugma({ yon, on }: { yon: "chap" | "ong"; on: () => void }) {
  return (
    <button type="button" onClick={on}
      title={t(yon === "chap" ? "kichkintoyOldingi" : "kichkintoyKeyingi")}
      className="clay-press grid size-[54px] shrink-0 place-items-center rounded-full bg-karta
                 text-ink-soft shadow-clay-sm">
      <Icon name="chevron" size={26} className={yon === "chap" ? "rotate-180" : ""} />
    </button>
  );
}

/**
 * Barmoq bilan surish (swipe).
 *
 * Kutubxona qo'shilmadi: kerak bo'lgani — barmoq qaysi tomonga va
 * qancha siljigani. Tik siljish E'TIBORGA OLINMAYDI, aks holda
 * sahifani pastga aylantirmoqchi bo'lgan har harakat kartani
 * almashtirib yuborardi.
 */
function useSurish(yur: (yon: 1 | -1) => void) {
  const bosh = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t0 = e.touches[0];
      bosh.current = { x: t0.clientX, y: t0.clientY };
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const b = bosh.current;
      bosh.current = null;
      if (!b) return;
      const t1 = e.changedTouches[0];
      const dx = t1.clientX - b.x;
      const dy = t1.clientY - b.y;
      // 48px — bexosdan tegish bilan ataylab surishning orasidagi
      // chegara. Undan kichigi "bosish" deb qoladi va nom qayta
      // aytiladi, ya'ni bola baribir javob oladi.
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
      yur(dx < 0 ? 1 : -1);
    },
  };
}

/* ================================================================== */
/*                               O'YIN                                */
/* ================================================================== */

interface Savol {
  javob: Karta;
  variant: Karta[];
}

/**
 * Savollar OLDINDAN yig'iladi.
 *
 * Har savolda uchta variant bo'ladi va to'g'ri javob ular orasida.
 * Javoblar TAKRORLANMAYDI: bir xil so'z ikki marta so'ralsa, bola uni
 * "ilova qotib qoldi" deb tushunadi.
 */
function savollarniYig(m: Mavzu): Savol[] {
  const hammasi = m.kartalar;
  const nishon = shuffle([...hammasi]).slice(0, Math.min(SAVOL, hammasi.length));
  return nishon.map((javob) => {
    const boshqa = shuffle(hammasi.filter((x) => x.id !== javob.id)).slice(0, 2);
    return { javob, variant: shuffle([javob, ...boshqa]) };
  });
}

function Oyin({ m, onChiq }: { m: Mavzu; onChiq: () => void }) {
  // `qayta` — "Yana o'ynash" bosilganda o'sadigan sanoq. U hisobda
  // ISHLATILMAYDI, faqat `useMemo` ni qaytadan yasashga majbur qiladi:
  // usiz ikkinchi o'yin aynan o'sha oltita savol bilan ochilardi.
  const [qayta, setQayta] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const savollar = useMemo(() => savollarniYig(m), [m, qayta]);
  const [n, setN] = useState(0);
  const [xato, setXato] = useState("");
  const [portlash, setPortlash] = useState(0);
  const [togri, setTogri] = useState(false);
  /**
   * Shu savolda nechta xato qilindi.
   *
   * Ikkitadan keyin to'g'ri javob YONIB turadi (`ishora`). Bu yoshda
   * "yana urin" degan gapning ma'nosi yo'q: bola bilmayotgan bo'lsa,
   * u yuz marta ham topolmaydi va oxiri telefonni qo'yadi. Ishora esa
   * unga javobni KO'RSATADI — va ko'rsatilgan javobni o'zi bosgani
   * ham o'rganish bo'ladi.
   */
  const [xatoSoni, setXatoSoni] = useState(0);

  const s = savollar[n];
  const tugadi = n >= savollar.length;
  const ishora = xatoSoni >= 2;

  // Savol o'zgarganda so'raladigan so'z aytiladi. Bu o'yindagi YAGONA
  // savol: ekranda hech qanday yozuv yo'q, chunki bola o'qiy olmaydi.
  useEffect(() => {
    if (tugadi) {
      void gapirKetma([t("kichkintoyBarakalla")]);
      return;
    }
    // TO'LIQ SAVOL aytiladi ("Qaysi biri mashina?"), yakka so'z emas.
    // Yakka so'z savol bo'lib eshitilmaydi — bola nima qilish
    // kerakligini ovoz OHANGIDAN tushunadi, yozuvdan emas.
    void gapirKetma([savolMatni(m.id, s.javob)]);
    // Yangi savol — xato sanoq ham noldan boshlanadi.
    setXatoSoni(0);
  }, [n, s, tugadi, m]);

  const bosildi = (k: Karta) => {
    if (togri) return;                       // javob berilgan, keyingisini kutyapmiz

    if (k.id !== s.javob.id) {
      /* ─────────── XATO — JAZO EMAS, DARS ───────────
       *
       * Ilgari bu yerda faqat savol qaytarilardi: "Qaysi biri
       * yashil?" Bola esa nimani bosganini BILMASDI — u shunchaki
       * "bo'lmadi" degan javob olardi va yana taxmin qilardi.
       *
       * Endi ilova avval BOSILGAN narsani nomlaydi ("Bu ko'k"),
       * keyin savolni qaytaradi. Shu ikki gap orasida bola aynan
       * o'sha farqni eshitadi — ya'ni xato ham o'rgatadi.
       */
      tebrat("xato");
      setXato(k.id);
      setXatoSoni((x) => x + 1);
      setTimeout(() => setXato(""), 500);
      void gapirKetma([aytiladigan(m.id, k), savolMatni(m.id, s.javob)]);
      return;
    }

    tebrat("togri");
    setTogri(true);
    setPortlash((x) => x + 1);
    // Topilgan narsaning gapi qaytariladi ("Bu mashina"), keyin
    // maqtov — ya'ni bola javobni ESHITIB tasdiqlaydi.
    void gapirKetma([aytiladigan(m.id, k), t("kichkintoyBarakalla")])
      .then(() => { if (k.tovush) tovushniChal(k.tovush); });
    // Keyingi savolgacha pauza: konfetti tugasin va bola o'z
    // yutug'ini ko'rib ulgursin.
    setTimeout(() => { setTogri(false); setN((x) => x + 1); }, 1250);
  };

  if (tugadi) {
    return (
      <div className="az-savol mt-4 rounded-clay bg-karta p-6 text-center shadow-clay">
        <span className="relative mx-auto grid size-24 place-items-center rounded-full bg-brand-green/15 text-[52px]">
          🎉
          <Konfetti key={portlash} />
        </span>
        <p className="mt-4 font-display text-[22px] leading-tight">{t("kichkintoyBarakalla")}</p>
        <p className="mt-1 text-[13px] text-ink-soft">{t("kichkintoyOyinTugadi")}</p>

        <div className="mt-5 flex flex-col gap-2.5">
          <button type="button"
            onClick={() => { setN(0); setQayta((x) => x + 1); }}
            className="tugma-3d w-full rounded-clay bg-brand-green px-4 py-3.5 font-display
                       text-[16px] text-white shadow-clay">
            {t("kichkintoyYana")}
          </button>
          <button type="button" onClick={onChiq}
            className="clay-press w-full rounded-clay bg-karta px-4 py-3 font-display text-[15px]
                       text-ink-soft shadow-clay-sm">
            {t("kichkintoyAlbomga")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sarlavha o'rnida — TOPILADIGAN NARSANING O'ZI aytiladi, shuning
          uchun bu yerda faqat qaytarish tugmasi turadi. Bola ovozni
          eshitmay qolsa (telefon jim, ota-ona gapirib turdi), uni bir
          bosishda qayta eshitadi. */}
      <button type="button" onClick={() => void gapirKetma([savolMatni(m.id, s.javob)])}
        className="clay-press az-kirish mt-4 flex w-full items-center justify-center gap-2.5 rounded-clay
                   bg-karta px-4 py-3.5 shadow-clay-sm">
        <Icon name="ovoz" size={20} className="shrink-0 text-brand-green-d" />
        <span className="font-display text-[16px] text-ink">{t("kichkintoyQaniTop")}</span>
      </button>

      {/* Nechanchi savol — MAYDA va pastda emas, tepada. Bola uni
          o'qimaydi, lekin ota-ona "yana ikkita qoldi" deb aytib
          turadi va bu bolani oxirigacha olib boradi. */}
      <p className="mt-2 text-center text-[11.5px] text-ink-soft/85">
        {t("kichkintoySanoq", { n: n + 1, jami: savollar.length })}
      </p>

      <div className="mt-3 grid gap-2.5">
        {s.variant.map((k) => (
          <button key={k.id} type="button" onClick={() => bosildi(k)}
            title={kNom(k)}
            className={`tugma-3d relative flex min-h-[104px] items-center justify-center rounded-clay
                        bg-karta p-3 shadow-clay
                        ${xato === k.id ? "az-silkin" : ""}
                        ${togri && k.id === s.javob.id ? "az-sakra ring-4 ring-brand-green" : ""}
                        ${ishora && !togri && k.id === s.javob.id
                          ? "az-pulse ring-4 ring-brand-orange" : ""}`}>
            <KichkintoyKarta k={k} olcham="kichik" />
            {togri && k.id === s.javob.id && <Konfetti key={portlash} />}
          </button>
        ))}
      </div>

      <button type="button" onClick={onChiq}
        className="clay-press mx-auto mt-5 block rounded-full px-4 py-2 text-[12.5px] text-ink-soft">
        {t("kichkintoyAlbomga")}
      </button>
    </>
  );
}
