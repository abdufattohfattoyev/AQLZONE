/**
 * BLOK TEST EKRANI — imtihon sharoiti.
 *
 * ─────────────── NEGA `Lesson` QAYTA ISHLATILMADI ───────────────
 *
 * Ko'rinishidan o'xshaydi: savol, to'rtta tugma, progress chizig'i.
 * Lekin ichidagi qoidalar QARAMA-QARSHI va ularni bitta komponentga
 * sig'dirish ikkalasini ham buzardi:
 *
 *   dars                          blok test
 *   ─────────────────────────     ────────────────────────────────
 *   xato bo'lsa qayta urinasan    javob bitta, orqaga yo'l yo'q
 *   vaqt yo'q                     vaqt bor va u tugaydi
 *   yulduz beriladi               ball beriladi
 *   yechim o'sha yerda ochiladi   yechim OXIRIDA, tahlil bilan
 *   6 savol, bitta mavzu          30 savol, aralash mavzu
 *
 * Ayniqsa birinchisi: darsdagi "yana urinib ko'r" imtihonda ma'nosiz.
 * DTMda ikkinchi urinish yo'q va shuni o'rgatmaydigan mashq
 * tayyorgarlik bo'lmaydi.
 *
 * ─────────────── VAQT TUGAGANDA NIMA BO'LADI ───────────────
 *
 * Test to'xtaydi va qolgan savollar "ulgurmadi" bo'lib yoziladi —
 * xato emas. Ikkalasini qo'shib yuborish yolg'on xulosa berardi:
 * mavzuni bilmaydigan odamga takrorlash kerak, ulgurmaydigan odamga
 * esa tezlik. Natija ekranida ular ikki xil rangda turadi.
 *
 * ─────────────── NATIJA BALL EMAS, TAHLIL ───────────────
 *
 * Eng katta raqam — foiz, lekin ekranning asosiy qismi MAVZULAR
 * ro'yxati: qaysi bobda nechta xato va yonida o'sha bobga o'tadigan
 * tugma. Ball o'zi hech narsa o'rgatmaydi, u faqat holatni aytadi.
 * Keyingi qadamni ko'rsatadigan narsa — shu ro'yxat.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import { QuestionView, sahnaBor } from "../components/QuestionView";
import { Chiqish } from "../components/Chiqish";
import { Yechim } from "../components/Yechim";
import { Konfetti } from "../components/Konfetti";
import type { Answer } from "../lib/activity";
import type { Blok, BlokSavol, Uzunlik } from "../lib/blok";
import { OLCHAM, blokYasa, foiz, natijaSaqla, sinfKurslari } from "../lib/blok";
import { xatoQoshildi } from "../lib/daftar";
import { courseById } from "../lib/curriculum";
import type { Course } from "../lib/curriculum";
import { useProgress } from "../lib/progress";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { tovush } from "../lib/ovoz";
import { yolDars } from "../lib/yollar";

/** Bitta berilgan javob. `null` — ulgurilmadi. */
interface Javob {
  tanlangan: Answer | null;
  togri: boolean;
}

export function Blok({ sinf, onExit }: { sinf: number; onExit: () => void }) {
  const { progressOf } = useProgress();
  const [uzunlik, setUzunlik] = useState<Uzunlik | null>(null);
  const [blok, setBlok] = useState<Blok | null>(null);

  const boshla = (u: Uzunlik) => {
    const b = blokYasa(sinf, progressOf, u);
    setUzunlik(u);
    setBlok(b);
    tebrat("tanlov");
  };

  if (!blok || !uzunlik) {
    return <Boshlash sinf={sinf} onBoshla={boshla} onExit={onExit} bosh={blok === null && uzunlik !== null} />;
  }

  // `key` — "yana topshirish" da butun holat noldan boshlanishi uchun.
  return <Oyna key={`${uzunlik}-${blok.savollar.length}`}
    blok={blok} sinf={sinf} uzunlik={uzunlik}
    onQayta={() => { setBlok(null); setUzunlik(null); }}
    onExit={onExit} />;
}

/* ==================== boshlash ekrani ==================== */

function Boshlash({ sinf, onBoshla, onExit, bosh }: {
  sinf: number;
  onBoshla: (u: Uzunlik) => void;
  onExit: () => void;
  /** Test yasalmadi — o'tilgan dars yo'q. */
  bosh: boolean;
}) {
  const ozStrelka = useOrqaga(onExit);

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-8">
      <div className="flex items-center gap-3">
        {ozStrelka && (
          <button type="button" onClick={onExit} title={t("ortga")}
            className="clay-press grid size-11 place-items-center rounded-2xl bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="font-display text-[18px]">{t("blokSarlavha")}</h1>
      </div>

      <div className="az-kirish mt-5 rounded-clay bg-karta p-5 shadow-clay-sm">
        <span className="grid size-14 place-items-center rounded-3xl bg-brand-purple text-white
                         shadow-[0_6px_0_var(--color-brand-purple-d)]">
          <Icon name="clock" size={26} />
        </span>
        <h2 className="mt-4 font-display text-[17px] leading-tight">{t("blokTayyormi", { n: sinf })}</h2>
        <p className="mt-1.5 text-[13px] leading-snug text-ink-dim">{t("blokIzoh")}</p>
      </div>

      {bosh ? (
        /* O'tilgan dars yo'q — test yasashga material yetmaydi. Bu
           xato emas, shuning uchun qizil ogohlantirish emas: shunchaki
           nima qilish kerakligi aytiladi. */
        <div className="az-kirish mt-4 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <p className="text-[13.5px] leading-snug text-ink-dim">{t("blokBosh")}</p>
          <button type="button" onClick={onExit}
            className="clay-press mt-4 h-12 w-full rounded-3xl bg-brand-green font-display text-[15px]
                       text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
            {t("blokDarslarga")}
          </button>
        </div>
      ) : (
        <div className="az-kirish mt-4 space-y-3" style={{ "--az-kech": "60ms" } as React.CSSProperties}>
          {(["toliq", "qisqa"] as const).map((u) => (
            <button key={u} type="button" onClick={() => onBoshla(u)}
              className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta p-4 text-left shadow-clay-sm">
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl text-white
                ${u === "toliq" ? "bg-brand-orange" : "bg-brand-blue"}`}>
                <Icon name={u === "toliq" ? "trophy" : "flame"} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] leading-tight">
                  {t(u === "toliq" ? "blokToliq" : "blokQisqa")}
                </span>
                <span className="mt-0.5 block text-[12px] text-ink-dim">
                  {t("blokOlcham", { s: OLCHAM[u].savol, d: OLCHAM[u].daqiqa })}
                </span>
              </span>
              <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== testning o'zi ==================== */

function Oyna({ blok, sinf, uzunlik, onQayta, onExit }: {
  blok: Blok;
  sinf: number;
  uzunlik: Uzunlik;
  onQayta: () => void;
  onExit: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [javoblar, setJavoblar] = useState<Javob[]>([]);
  const [tanlangan, setTanlangan] = useState<Answer | null>(null);
  const [tugadi, setTugadi] = useState(false);
  const [chiqishSorovi, setChiqishSorovi] = useState(false);

  /** Qolgan vaqt, sekund. */
  const [qolgan, setQolgan] = useState(blok.daqiqa * 60);
  const boshlandi = useRef(performance.now());

  const S = blok.savollar[idx];

  /**
   * Testni yakunlaydi.
   *
   * Javob berilmagan savollar `null` bo'lib to'ldiriladi — vaqt
   * tugaganda ular "ulgurmadi" bo'lib qoladi va xatoga qo'shilmaydi.
   */
  const yakunla = useCallback((berilgan: Javob[]) => {
    const toliq = [...berilgan];
    while (toliq.length < blok.savollar.length) toliq.push({ tanlangan: null, togri: false });
    setJavoblar(toliq);
    setTugadi(true);
    natijaSaqla({
      vaqt: new Date().toISOString(),
      sinf,
      uzunlik,
      jami: toliq.length,
      togri: toliq.filter((x) => x.togri).length,
      xato: toliq.filter((x) => !x.togri && x.tanlangan !== null).length,
      ulgurmadi: toliq.filter((x) => x.tanlangan === null).length,
      sekund: Math.round((performance.now() - boshlandi.current) / 1000),
    });
  }, [blok.savollar.length, sinf, uzunlik]);

  /* Soat. Har sekundda bir marta yuradi va nolga yetganda testni
     o'zi yakunlaydi — bu imtihonning asosiy qoidasi. */
  useEffect(() => {
    if (tugadi) return;
    const id = setInterval(() => {
      setQolgan((q) => {
        if (q <= 1) {
          clearInterval(id);
          return 0;
        }
        return q - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [tugadi]);

  // Vaqt tugadi — javoblar qanday bo'lsa shundayligicha yakunlanadi.
  // Yakunlash `useEffect` da, taymer ichida emas: `setQolgan` ning
  // yangilovchisi sof bo'lishi kerak, aks holda React uni ikki marta
  // chaqirganda natija ikki marta saqlanardi.
  useEffect(() => {
    if (qolgan === 0 && !tugadi) yakunla(javoblar);
  }, [qolgan, tugadi, javoblar, yakunla]);

  const chiqmoqchi = useCallback(() => {
    if (tugadi || idx === 0) onExit();
    else setChiqishSorovi(true);
  }, [tugadi, idx, onExit]);
  const ozStrelka = useOrqaga(chiqmoqchi);

  function javobBer(v: Answer) {
    if (tanlangan !== null) return;
    const togri = String(v) === String(S.a.answer);
    setTanlangan(v);

    // Xato darhol daftarga yoziladi: test tugashini kutmaymiz, chunki
    // vaqt tugab qolsa ham bu ma'lumot yo'qolmasligi kerak.
    if (!togri) xatoQoshildi({ kurs: S.kurs, ui: S.ui, li: S.li, tur: S.a.type });

    tovush(togri ? "togri" : "xato");
    tebrat(togri ? "togri" : "xato");

    const yangi = [...javoblar, { tanlangan: v, togri }];
    setJavoblar(yangi);

    /* Qisqa pauza — javob to'g'ri edimi degan savolga darhol javob
       beriladi. Darsdagidek uzun emas (750 ms): imtihonda har soniya
       o'quvchining o'z vaqti va uni kutishga sarflash adolatsiz. */
    setTimeout(() => {
      setTanlangan(null);
      if (idx + 1 >= blok.savollar.length) yakunla(yangi);
      else setIdx((i) => i + 1);
    }, 420);
  }

  const oyna = chiqishSorovi && (
    <Chiqish javob={idx} onDavom={() => setChiqishSorovi(false)} onChiq={onExit} />
  );

  if (tugadi) {
    return <>
      <Natija blok={blok} javoblar={javoblar} onQayta={onQayta} onExit={onExit} />
      {oyna}
    </>;
  }

  const togriJavob = tanlangan !== null && String(tanlangan) === String(S.a.answer);
  const rasmli = S.a.kind === "rang" || S.a.kind === "emoji" || S.a.kind === "belgi";
  /* Oxirgi daqiqada soat qizaradi va tebranadi. Bu bezak emas: ekranga
     qaramay javob tanlayotgan odam vaqt tugayotganini bilishi kerak. */
  const shoshilinch = qolgan <= 60;

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-8">
      <div className="flex items-center gap-3">
        {ozStrelka && (
          <button type="button" onClick={chiqmoqchi} title={t("ortga")}
            className="clay-press grid size-11 place-items-center rounded-2xl bg-karta text-brand-red shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}

        {/* Soat — ekranning eng ko'zga tashlanadigan joyida. Darsda
            bunday element umuman yo'q va bo'lmasligi ham kerak. */}
        <div className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 font-display text-[15px]
                         shadow-clay-sm ${shoshilinch ? "az-silkin bg-brand-red text-white" : "bg-karta"}`}>
          <Icon name="clock" size={16} />
          {soat(qolgan)}
        </div>

        <div className="ml-auto shrink-0 rounded-xl bg-karta px-2.5 py-1 font-display text-[13px] shadow-clay-sm">
          <span className="text-brand-orange-d">{idx + 1}</span>
          <span className="text-ink-dim">/{blok.savollar.length}</span>
        </div>
      </div>

      {/* Progress — chiziqchalar emas, yagona chiziq: 30 ta chiziqcha
          telefonda sanashga yaramaydigan mayda tirqishga aylanardi. */}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-karta/60">
        <div className="h-full rounded-full bg-brand-green transition-[width] duration-300"
          style={{ width: `${(idx / blok.savollar.length) * 100}%` }} />
      </div>

      <div key={`p-${idx}`}
        className="az-savol mt-4 rounded-clay bg-karta p-4 text-center text-[15px] leading-snug shadow-clay-sm">
        {S.a.prompt}
      </div>

      <div className="relative my-4 flex flex-1 items-center justify-center
                      rounded-clay bg-sahna/85 p-4 ring-1 ring-track ring-inset backdrop-blur-sm">
        <div key={`q-${idx}`} className="az-savol">
          {sahnaBor(S.a)
            ? <QuestionView a={S.a} />
            : (
              <div className="az-suzish grid size-40 place-items-center rounded-full
                              bg-[linear-gradient(150deg,var(--color-brand-orange),var(--color-brand-gold))]
                              font-display text-[86px] leading-none text-white shadow-clay">
                ?
              </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {S.a.choices.map((c, i) => {
          const bu = tanlangan !== null && String(c) === String(tanlangan);
          return (
            <button key={i} type="button" onClick={() => javobBer(c)} disabled={tanlangan !== null}
              className={[
                "tugma-3d relative grid place-items-center rounded-3xl shadow-clay",
                rasmli ? "h-24" : "py-4 font-display text-2xl",
                bu && togriJavob ? "bg-brand-green text-white"
                  : bu ? "bg-brand-red text-white"
                  : tanlangan !== null ? "az-sonik bg-karta text-ink"
                  : "bg-karta text-ink",
              ].join(" ")}>
              {S.a.kind === "rang"
                ? <span className="size-16 rounded-full ring-3 ring-white/70 outline outline-2 outline-ink/15"
                    style={{ background: String(c) }} />
                : S.a.kind === "belgi"
                  ? <span className="font-display text-[54px] leading-none">{c}</span>
                  : c}
            </button>
          );
        })}
      </div>

      {/* Mavzu ATAYLAB yozilmaydi. Imtihonda savol qaysi bobdan
          ekani aytilmaydi va formulani o'zi tanlash — mashqning
          asosiy qismi. U faqat OXIRIDA, tahlilda ochiladi. */}
      <div className="mt-3 h-5 text-center text-[12px] text-ink-dim">
        {tanlangan !== null && (togriJavob ? t("togriJavob") : t("blokXato"))}
      </div>

      {oyna}
    </div>
  );
}

/* ==================== natija va tahlil ==================== */

/** Bitta mavzu bo'yicha yig'indi. */
interface Mavzu {
  nom: string;
  kursId: string;
  ui: number;
  li: number;
  jami: number;
  xato: number;
  ulgurmadi: number;
}

function Natija({ blok, javoblar, onQayta, onExit }: {
  blok: Blok;
  javoblar: Javob[];
  onQayta: () => void;
  onExit: () => void;
}) {
  const nav = useNavigate();
  const [yechimda, setYechimda] = useState<BlokSavol | null>(null);

  const jami = javoblar.length;
  const togri = javoblar.filter((x) => x.togri).length;
  const ulgurmadi = javoblar.filter((x) => x.tanlangan === null).length;
  const xato = jami - togri - ulgurmadi;
  const f = foiz({ jami, togri });

  useEffect(() => { if (f >= 80) tebrat("yutuq"); }, [f]);

  /**
   * Mavzular bo'yicha tahlil — xatosi ko'pi yuqorida.
   *
   * `li` sifatida shu bobdagi ILK xato qilingan darsning raqami
   * saqlanadi: "takrorlash" tugmasi bobning boshiga emas, aynan
   * qoqilgan darsga olib borishi kerak.
   */
  const mavzular = useMemo(() => {
    const m = new Map<string, Mavzu>();
    blok.savollar.forEach((S, i) => {
      const j = javoblar[i];
      const kalit = `${S.kursId}|${S.ui}`;
      const bor = m.get(kalit) ?? {
        nom: S.mavzu, kursId: S.kursId, ui: S.ui, li: S.li,
        jami: 0, xato: 0, ulgurmadi: 0,
      };
      bor.jami++;
      if (!j.togri && j.tanlangan !== null) {
        if (bor.xato === 0) bor.li = S.li;
        bor.xato++;
      }
      if (j.tanlangan === null) bor.ulgurmadi++;
      m.set(kalit, bor);
    });
    return [...m.values()].sort((a, b) => b.xato - a.xato || b.ulgurmadi - a.ulgurmadi);
  }, [blok, javoblar]);

  /** Xato qilingan savollar — yechimini ko'rish uchun. */
  const xatolar = blok.savollar.filter((_, i) => !javoblar[i].togri);

  const Box = ({ v, l, c = "" }: { v: string | number; l: string; c?: string }) => (
    <div className="flex-1 rounded-2xl bg-track px-1 py-2 text-center">
      <div className={`font-display text-xl leading-tight ${c}`}>{v}</div>
      <div className="text-[10.5px] text-ink-dim">{l}</div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-5 pb-10">
      {f >= 80 && <Konfetti />}

      <div className="az-savol rounded-clay bg-karta p-5 text-center shadow-clay">
        <div className="font-display text-[46px] leading-none text-brand-green-d">{f}%</div>
        <div className="mt-1 text-[13px] text-ink-dim">{t("blokNatija", { a: togri, b: jami })}</div>

        <div className="mt-4 flex gap-2">
          <Box v={togri} l={t("natijaTogri")} c="text-brand-green-d" />
          <Box v={xato} l={t("natijaXato")} c="text-brand-red" />
          {/* "Ulgurmadi" faqat bo'lganda ko'rsatiladi: nol turgan
              ustun odamni "nimadir yo'qotdimmi?" deb o'ylatardi. */}
          {ulgurmadi > 0 && <Box v={ulgurmadi} l={t("blokUlgurmadi")} c="text-brand-orange-d" />}
        </div>
      </div>

      {/* ---- mavzular bo'yicha tahlil ---- */}
      <h2 className="az-kirish mt-6 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("blokTahlil")}
      </h2>
      <div className="az-kirish space-y-2" style={{ "--az-kech": "60ms" } as React.CSSProperties}>
        {mavzular.map((m) => {
          const yaxshi = m.xato === 0 && m.ulgurmadi === 0;
          const c = courseById(m.kursId);
          return (
            <div key={`${m.kursId}-${m.ui}`}
              className="flex items-center gap-3 rounded-clay bg-karta p-3 shadow-clay-sm">
              <span className={`grid size-9 shrink-0 place-items-center rounded-2xl text-white
                ${yaxshi ? "bg-brand-green" : m.xato >= m.jami / 2 ? "bg-brand-red" : "bg-brand-orange"}`}>
                <Icon name={yaxshi ? "check" : "repeat"} size={17} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] leading-tight">{kursMatn(m.nom)}</span>
                <span className="mt-0.5 block text-[11.5px] text-ink-dim">
                  {t("blokMavzuHolat", { a: m.jami - m.xato - m.ulgurmadi, b: m.jami })}
                  {m.ulgurmadi > 0 && ` · ${t("blokUlgurmadiN", { n: m.ulgurmadi })}`}
                </span>
              </span>
              {/* Takrorlash tugmasi faqat XATO bo'lgan bobda: hammasini
                  to'g'ri yechgan bobga qaytarish — vaqtni behuda
                  sarflash taklifi. */}
              {!yaxshi && c && (
                <button type="button" onClick={() => nav(yolDars(c, m.ui, m.li))}
                  className="clay-press shrink-0 rounded-2xl bg-track px-3 py-2 font-display text-[12px] text-ink-soft">
                  {t("blokTakrorlash")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- xato qilingan savollarning yechimi ---- */}
      {xatolar.length > 0 && (
        <>
          <h2 className="az-kirish mt-6 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
            {t("blokXatolar")}
          </h2>
          <div className="az-kirish space-y-2">
            {xatolar.map((S, i) => (
              <button key={i} type="button"
                disabled={!S.a.yechim}
                onClick={() => { setYechimda(S); tebrat("tanlov"); }}
                className="flex w-full items-center gap-3 rounded-clay bg-karta p-3 text-left shadow-clay-sm
                           disabled:opacity-60">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[13.5px] leading-tight">
                    {"text" in S.a ? S.a.text : S.a.prompt}
                  </span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-brand-green-d">
                    {String(S.a.answer)}
                  </span>
                </span>
                {S.a.yechim && (
                  <Icon name="puzzle" size={18} className="shrink-0 text-brand-blue" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      <button type="button" onClick={onQayta}
        className="az-yaltir tugma-3d mt-6 w-full rounded-3xl bg-brand-green py-3.5 font-display text-lg
                   text-white shadow-[0_6px_0_var(--color-brand-green-d)]">
        {t("blokYana")}
      </button>
      <button type="button" onClick={onExit}
        className="clay-press mt-2.5 w-full rounded-3xl bg-track py-3 font-display text-[15px] text-ink-soft">
        {t("blokChiqish")}
      </button>

      {yechimda?.a.yechim && (
        <Yechim qadamlar={yechimda.a.yechim} javob={String(yechimda.a.answer)}
          onYop={() => setYechimda(null)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------ vaqt */

/**
 * Sekundni "12:05" ko'rinishida yozadi.
 *
 * Daqiqada nol to'ldirilmaydi ("9:05", "09:05" emas): soat ko'rinishi
 * kerak emas, bu sanoq va u qisqaroq bo'lgani yaxshi.
 */
function soat(s: number): string {
  const d = Math.floor(s / 60);
  const q = s % 60;
  return `${d}:${String(q).padStart(2, "0")}`;
}

/** Kurs ro'yxati bo'sh bo'lmasligini tekshirish uchun — App shuni chaqiradi. */
export const blokKurslariBormi = (sinf: number): boolean => sinfKurslari(sinf).length > 0;

/** Test ochilganda kurs kerak bo'lsa — birinchi kursning o'zi. */
export const blokAsosiyKurs = (sinf: number): Course | undefined => sinfKurslari(sinf)[0];
