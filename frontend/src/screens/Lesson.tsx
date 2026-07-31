import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../lib/icons";
import { QuestionView, sahnaBor } from "../components/QuestionView";
import { Ogit } from "../components/Ogit";
import { Rasm } from "../components/Rasm";
import { Konfetti } from "../components/Konfetti";
import { Chiqish } from "../components/Chiqish";
import type { Activity, Answer } from "../lib/activity";
import type { Lesson as LessonT, Unit } from "../lib/types";
import type { LessonResult } from "../lib/progress";
import { gapir, tovush } from "../lib/ovoz";
import { takrorlandi, xatoQoshildi } from "../lib/daftar";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { tebrat, useOrqaga } from "../lib/qobiq";

/** Bir dars nechta savoldan iborat. */
const SAVOL = 6;

interface Props {
  unit: Unit;
  lesson: LessonT;
  onExit: () => void;
  onFinish: (r: LessonResult) => void;
  /**
   * Savolning manzili — xatolar daftari uchun.
   * Takrorlash darsida berilmaydi: u yerda har bir savol o'z manzilini
   * `A.joy` ichida olib yuradi, chunki savollar turli darslardan yig'iladi.
   */
  joy?: { kurs: string; ui: number; li: number };
  /** Takrorlash darsimi — javob daftar narvonini suradi. */
  takrorlash?: boolean;
}

/**
 * Diqqat: bu komponent har dars uchun QAYTA yasaladi — App.tsx da unga
 * `key={kurs-bob-dars}` beriladi. Shuning uchun savollar holati boshlang'ich
 * qiymatdan olinadi va `lesson` o'zgarishini alohida kuzatish shart emas.
 * O'sha `key` ni olib tashlasangiz, bu yerga effekt qo'shish kerak bo'ladi.
 */
export function Lesson({ unit, lesson, onExit, onFinish, joy, takrorlash }: Props) {
  /**
   * Darsning savollarini yasaydi — ULAR TAKRORLANMASLIGI SHART.
   *
   * Generatorlar tasodifiy, shuning uchun "Qaysi biri qizil?" ketma-ket
   * ikki marta chiqib qolishi mumkin edi. Bola buni darrov sezadi va
   * o'yin zerikarli bo'ladi.
   *
   * Ikki bosqichda tanlaymiz:
   *   1. Avval BUTUNLAY yangi savol izlaymiz (shu darsda hali bo'lmagan).
   *   2. Topilmasa — hech bo'lmasa OLDINGIsiga o'xshamaganini olamiz.
   *
   * Ikkinchi bosqich kerak: ba'zi mavzularda savol turi juda oz (yo'nalish
   * atigi to'rtta), 6 ta butunlay boshqacha savol jismonan chiqmaydi.
   * Unday paytda ham hech qursa yonma-yon takror bo'lmaydi.
   */
  const yasa = useCallback(() => {
    const bir = (a: Activity) => `${a.prompt}|${a.answer}`;
    const chiqqan = new Set<string>();
    const savol: Activity[] = [];

    for (let i = 0; i < SAVOL; i++) {
      const gen = lesson.gens[i % lesson.gens.length];
      let a = gen();
      for (let k = 0; k < 25 && chiqqan.has(bir(a)); k++) a = gen();
      if (chiqqan.has(bir(a))) {
        const oldingi = savol.length ? bir(savol[savol.length - 1]) : "";
        for (let k = 0; k < 25 && bir(a) === oldingi; k++) a = gen();
      }
      chiqqan.add(bir(a));
      savol.push(a);
    }
    return savol;
  }, [lesson]);

  /**
   * Savollar HOLATDA turadi, chunki ular ikki holatda yangilanadi:
   * dars ochilganda va bola "Yana o'ynash" ni bosganda. Ikkinchisida
   * generatorlar qaytadan chaqiriladi, ya'ni sonlar ham, rasmlar ham
   * boshqacha bo'ladi — shu sabab bola darsni yodlab ola olmaydi.
   */
  const [savollar, setSavollar] = useState<Activity[]>(yasa);

  /** Har qayta o'ynashda oshadi — animatsiyalarni noldan boshlash uchun. */
  const [urinish, setUrinish] = useState(0);

  /**
   * Tushuntirish ekrani ochiqmi.
   *
   * Dars tushuntirish bilan boshlanadi (agar u bo'lsa), lekin faqat BIR
   * MARTA: "Yana o'ynash" da bola qoidani allaqachon ko'rgan bo'ladi va
   * ikkinchi marta ko'rsatish uni faqat kutishga majbur qilardi.
   */
  const [ogitda, setOgitda] = useState(Boolean(lesson.ogit));

  const [idx, setIdx] = useState(0);
  const [tanlangan, setTanlangan] = useState<Answer | null>(null);
  const [xato, setXato] = useState(0);
  const [birinchidanTogri, setBirinchidanTogri] = useState(0);
  /** Shu savolda allaqachon xato qilinganmi — birinchi urinish hisobi uchun. */
  const xatoQilgan = useRef(false);
  const [tugadi, setTugadi] = useState(false);
  /** Har to'g'ri javobda oshadi va konfetti portlashini boshlaydi. */
  const [portlash, setPortlash] = useState(0);

  /**
   * Dars qachon boshlangani.
   *
   * `Date.now()` emas, `performance.now()`: birinchisi tizim soati
   * o'zgarsa (yoki qurilma vaqt zonasini yangilasa) sakrab ketadi va
   * manfiy davomiylik chiqishi mumkin.
   */
  const boshlandi = useRef(performance.now());

  const A = savollar[idx];

  /**
   * Chiqishni tasdiqlash oynasi ochiqmi.
   *
   * So'rov faqat BOSHLANGAN darsda chiqadi: birinchi savolda hech narsa
   * yechilmagan bo'lsa yo'qotadigan narsa yo'q va o'shanda tasdiq
   * so'rash — bekorga yo'lni to'sish. `idx` ham, `xato` ham hisobga
   * olinadi: xato qilingan savolda `idx` hali surilmagan bo'ladi.
   */
  const [chiqishSorovi, setChiqishSorovi] = useState(false);
  const boshlangan = idx > 0 || xato > 0 || tanlangan !== null;

  // Darsdan chiqish: Telegram ichida nativ orqaga tugmasi bilan, vebda
  // esa chapdagi qizil strelka bilan. Ikkalasi ham shu yerdan o'tadi —
  // aks holda nativ tugma tasdiqsiz chiqarib yuborardi.
  const chiqmoqchi = useCallback(() => {
    if (boshlangan) setChiqishSorovi(true);
    else onExit();
  }, [boshlangan, onExit]);

  const ozStrelka = useOrqaga(chiqmoqchi);

  useEffect(() => {
    xatoQilgan.current = false;
    setTanlangan(null);
    // Tushuntirish ko'rsatilayotganda savol o'qilmasin — ikki ovoz
    // ustma-ust tushib, ikkalasi ham tushunarsiz bo'lib qolardi.
    if (!ogitda) gapir(A.prompt);
  }, [idx, A.prompt, ogitda]);

  function qaytaBoshla() {
    boshlandi.current = performance.now();
    setSavollar(yasa());
    setUrinish((u) => u + 1);
    setIdx(0);
    setXato(0);
    setBirinchidanTogri(0);
    setTanlangan(null);
    setTugadi(false);
  }

  function javobBer(v: Answer) {
    if (tanlangan !== null) return;             // javob berilgan, ikkinchi bosishni e'tiborsiz qoldiramiz
    const togri = String(v) === String(A.answer);
    setTanlangan(v);

    // --- xatolar daftari ---
    // Faqat BIRINCHI urinish hisoblanadi: ikkinchi bosishda bola javobni
    // allaqachon ko'rgan bo'ladi va uni "bildi" deb yozish yolg'on bo'lardi.
    if (!xatoQilgan.current) {
      const manzil = A.joy ?? joy;
      if (manzil) {
        const yozuv = { ...manzil, tur: A.type };
        if (takrorlash) takrorlandi(yozuv, togri);
        else if (!togri) xatoQoshildi(yozuv);
      }
    }

    if (!togri) {
      xatoQilgan.current = true;
      setXato((x) => x + 1);
      tovush("xato");
      // Tebranish OVOZGA bog'lanmagan: telefoni ovozsiz rejimda turgan
      // bola ham javobi to'g'rimi-yo'qmi darhol biladi. Xato tebranishi
      // ataylab boshqacha — ekranga qaramasdan ham farqi sezilarli.
      tebrat("xato");
      // noto'g'ri javobdan keyin yana urinib ko'rsin
      setTimeout(() => setTanlangan(null), 900);
      return;
    }

    tovush("togri");
    tebrat("togri");
    setPortlash((p) => p + 1);
    if (!xatoQilgan.current) setBirinchidanTogri((c) => c + 1);
    setTimeout(() => {
      if (idx + 1 >= savollar.length) setTugadi(true);
      else setIdx((i) => i + 1);
    }, 750);
  }

  // Avval ko'rsatamiz, keyin so'raymiz. Maktabgacha yoshda savolga darrov
  // o'tish bolani "bilmayman" holatiga tushiradi — u qoidani ko'rmagan.
  if (ogitda && lesson.ogit) {
    return <Ogit o={lesson.ogit} nomi={kursMatn(lesson.n)} onBoshla={() => setOgitda(false)} />;
  }

  /* Tasdiq oynasi ikki ekranda ham kerak — dars ichida ham, natija
     ekranida ham. Natijada u yanada muhim: u yerdan tasdiqsiz chiqilsa
     endigina yig'ilgan yulduzlar yozilmay qolardi (`onFinish` faqat
     "Davom etish" da chaqiriladi). */
  const oyna = chiqishSorovi && (
    <Chiqish
      javob={idx}
      onDavom={() => setChiqishSorovi(false)}
      onChiq={onExit}
    />
  );

  if (tugadi) {
    const yulduz = xato === 0 ? 3 : xato <= 2 ? 2 : 1;
    return (
      <>
      <Natija
        asked={savollar.length}
        correct={birinchidanTogri}
        mistakes={xato}
        stars={yulduz}
        onQayta={qaytaBoshla}
        onNext={() =>
          onFinish({
            asked: savollar.length,
            correct: birinchidanTogri,
            mistakes: xato,
            stars: yulduz,
            davomiylik: Math.round(performance.now() - boshlandi.current),
          })
        }
      />
      {oyna}
      </>
    );
  }

  const togriJavob = tanlangan !== null && String(tanlangan) === String(A.answer);
  // Rasm, rang va bitta belgi — hammasi baland tugma talab qiladi: bu
  // yoshdagi bola kichik nishonga aniq bosa olmaydi.
  const rasmli = A.kind === "rang" || A.kind === "emoji" || A.kind === "belgi";

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-8">
      {/* yuqori panel */}
      <div className="flex items-center gap-3">
        {/* Telegram ichida strelka chizilmaydi — u yerda nativi bor.
            Qolgan qism o'zgarmaydi: `flex-1` chiziqchalari bo'shab
            qolgan joyni o'zi to'ldiradi. */}
        {ozStrelka && (
          <button type="button" onClick={chiqmoqchi}
            className="clay-press grid size-11 place-items-center rounded-2xl bg-karta text-brand-red shadow-clay-sm"
            title={t("ortga")}>
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <div className="flex flex-1 gap-1.5">
          {savollar.map((_, i) => (
            <span key={i}
              className={`h-2.5 flex-1 rounded-full transition-colors duration-300
                ${i < idx ? "bg-brand-green" : i === idx ? "bg-brand-orange" : "bg-karta/60"}`} />
          ))}
        </div>

        {/* Nechanchi savoldaligi ko'rinib tursin: chiziqchalar oralig'ini
            bola sanab o'tirmasin, ayniqsa kichik ekranda. */}
        <div className="shrink-0 rounded-xl bg-karta px-2.5 py-1 font-display text-[13px] shadow-clay-sm">
          <span className="text-brand-orange-d">{idx + 1}</span>
          <span className="text-ink-dim">/{savollar.length}</span>
        </div>
      </div>

      {/* Savol matni va uni QAYTA ESHITISH tugmasi.
          Maktabgacha bola matnni o'qiy olmaydi — u savolni faqat quloq
          bilan oladi. Bir marta eshitib ulgurmasa yoki chalg'isa, boshqa
          yo'li bo'lishi kerak, shuning uchun karnay tugmasi doim shu yerda
          turadi (`lib/ovoz.ts` o'chiq bo'lsa ham bosilaveradi — brauzer
          ovozi zaxira sifatida qoladi). */}
      <div key={`p-${idx}`}
        className="az-savol mt-5 rounded-clay bg-karta p-4 text-center text-[15px] leading-snug shadow-clay-sm">
        {A.prompt}
      </div>

      {/* Savol maydoni — "sahna".
          Ataylab o'z yuzasi bor: savol orqa fon manzarasi bilan qo'shilib
          ketmasin, bolaning ko'zi qayerga qarashni izlamasin. */}
      {/* `overflow` ataylab kesilmaydi — aks holda konfetti sahna
          chegarasida qirqilib qolardi. */}
      <div className="relative my-4 flex flex-1 items-center justify-center
                      rounded-clay bg-sahna/85 p-4 ring-1 ring-track ring-inset backdrop-blur-sm">
        <div key={`q-${idx}-${urinish}`}
          className={`az-savol ${togriJavob ? "az-sakra" : ""} ${tanlangan !== null && !togriJavob ? "az-silkin" : ""}`}>
          {sahnaBor(A)
            ? <QuestionView a={A} />
            /* Savol butunlay og'zaki ("Qaysi biri sariq?") — ko'rsatadigan
               narsasi yo'q. Bo'sh sahna o'rniga savol belgisi chiziladi:
               u bo'shliqni to'ldiradi va bolaga "javob pastda" deb ishora
               qiladi. Suzib turadi, ya'ni ekran o'lik ko'rinmaydi. */
            : (
              <div className="az-suzish grid size-40 place-items-center rounded-full
                              bg-[linear-gradient(150deg,var(--color-brand-orange),var(--color-brand-gold))]
                              font-display text-[86px] leading-none text-white shadow-clay">
                ?
              </div>
            )}
        </div>
        {portlash > 0 && togriJavob && <Konfetti key={portlash} />}
      </div>

      {/* Javob variantlari.
          1-sinfda ular MATN emas — rangli doira yoki katta rasm bo'ladi
          (`kind`), chunki bola hali o'qiy olmaydi. */}
      <div className="grid grid-cols-2 gap-3">
        {A.choices.map((c, i) => {
          const bu = tanlangan !== null && String(c) === String(tanlangan);
          const buTogri = bu && togriJavob;
          const buXato = bu && !togriJavob;
          // Javob berilgan bo'lsa, tanlanmaganlari orqaga chekinadi: bolaning
          // ko'zi to'g'ri javobda qolishi kerak, qolgani chalg'itadi.
          const chetda = tanlangan !== null && !bu;
          return (
            <button key={i} type="button" onClick={() => javobBer(c)} disabled={tanlangan !== null}
              className={[
                "tugma-3d relative grid place-items-center rounded-3xl shadow-clay",
                rasmli ? "h-24" : "py-4 font-display text-2xl",
                buTogri ? "az-golib bg-brand-green text-white"
                  : buXato ? "az-silkin bg-brand-red text-white"
                  : chetda ? "az-sonik bg-karta text-ink"
                  : "bg-karta text-ink",
              ].join(" ")}>
              {A.kind === "rang"
                /* Ikki halqa ataylab: ichkarisi oq (rang kartadan ajralib
                   tursin), tashqarisi to'q. Ikkinchisisiz OQ rang oq karta
                   ustida umuman ko'rinmay qolardi — maktabgacha kursda esa
                   oq ham, qora ham ranglar qatorida bor. */
                ? <span className="size-16 rounded-full ring-3 ring-white/70 outline outline-2 outline-ink/15"
                    style={{ background: String(c) }} />
                : A.kind === "emoji"
                  /* Har bir variant o'z kechikishi bilan sekin suzadi —
                     to'rttasi birdek qotib turmaydi. */
                  ? <Rasm e={String(c)} size={84} pufak kech={i * 260} />
                  : A.kind === "belgi"
                    /* Harf yoki raqam — maktabgacha bola uni RASMDEK ko'radi,
                       shuning uchun oddiy matndan ancha katta chiziladi. */
                    ? <span className="font-display text-[54px] leading-none">{c}</span>
                    : c}

              {/* To'g'ri javob: halqa otiladi va yashil belgi sakrab chiqadi. */}
              {buTogri && (
                <>
                  <span className="az-halqa-otil pointer-events-none absolute inset-0 rounded-3xl
                                   ring-4 ring-brand-green" />
                  <span className="az-belgi-kir absolute -top-2 -right-2 grid size-8 place-items-center
                                   rounded-full bg-white text-brand-green-d shadow-clay-sm">
                    <Icon name="check" size={18} />
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Javob xabari.
          `sticky` ATAYLAB: rasmli savolda ustun ekrandan uzun bo'lib
          qoladi va oddiy oqimda turgan xabar pastga tushib, kesilib
          ko'rinmay qolardi — bola javobi to'g'rimi-yo'qmi bilmasdi.
          Sticky esa uni ekran pastida ushlab turadi va pastga aylantirilsa
          o'z joyiga qo'nadi.

          Balandligi javobsiz ham band turadi (`h-11`): xabar chiqqanda
          tugmalar pastga siljib ketsa, bola endigina bosgan tugmasi
          joyidan qochib ketardi. */}
      <div className="sticky bottom-2 z-20 mt-3 flex h-11 items-center justify-center">
        {tanlangan !== null && (
          <span className={`az-xabar rounded-full px-4 py-2 font-display text-[15px] leading-none
                            text-white shadow-clay-sm
                            ${togriJavob ? "bg-brand-green" : "bg-brand-red"}`}>
            {togriJavob ? t("togriJavob") : t("deyarli")}
          </span>
        )}
      </div>

      <div className="mt-1 text-center text-[12px] text-ink-dim">{kursMatn(unit.u)}</div>

      {oyna}
    </div>
  );
}

/* ---------------- natija ---------------- */

function Natija({ asked, correct, mistakes, stars, onNext, onQayta }:
  Omit<LessonResult, "davomiylik"> & { onNext: () => void; onQayta: () => void }) {
  const pct = asked ? Math.round((correct / asked) * 100) : 0;

  // Uch yulduz — darsning eng katta lahzasi. Konfetti bilan birga
  // kuchli tebranish ketadi: bola qo'lida ham "yutdim" degan javobni
  // sezadi. Bir yoki ikki yulduzda tebranish yo'q — o'shanda u
  // mukofot bo'lmay, shovqinga aylanardi.
  useEffect(() => { if (stars === 3) tebrat("yutuq"); }, [stars]);

  const Box = ({ v, l, c = "" }: { v: string | number; l: string; c?: string }) => (
    <div className="flex-1 rounded-2xl bg-track px-1 py-2 text-center">
      <div className={`font-display text-xl leading-tight ${c}`}>{v}</div>
      <div className="text-[10.5px] text-ink-dim">{l}</div>
    </div>
  );

  return (
    <div className="relative grid min-h-ekran place-items-center p-6">
      {/* Uch yulduz olganda bayram — bu lahza uchun bola qaytib keladi. */}
      {stars === 3 && <Konfetti />}

      <div className="az-savol w-full max-w-[360px] rounded-[32px] bg-karta p-7 text-center
                      shadow-[0_12px_40px_rgb(0_0_0/0.3)]">
        <h2 className="text-2xl">{t("zorIsh")}</h2>

        <div className="mt-2 flex justify-center gap-1 text-brand-gold">
          {Array.from({ length: 3 }, (_, i) => (
            <span key={i} className="az-yulduz" style={{ "--az-kech": `${180 + i * 220}ms` } as React.CSSProperties}>
              <Icon name={i < stars ? "star" : "starOff"} size={34} />
            </span>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <Box v={asked} l={t("natijaSavol")} />
          <Box v={correct} l={t("natijaTogri")} c="text-brand-green-d" />
          <Box v={mistakes} l={t("natijaXato")} c="text-brand-red" />
          <Box v={`${pct}%`} l={t("natijaAniqlik")} />
        </div>

        {mistakes === 0 && (
          <div className="mt-3 text-[13px] text-brand-green-d">
            {t("xatosizJavob")}
          </div>
        )}

        <button type="button" onClick={onNext}
          className="az-yaltir tugma-3d mt-6 w-full rounded-3xl bg-brand-green py-3.5 font-display text-lg
                     text-white shadow-[0_6px_0_var(--color-brand-green-d)]">
          {t("davomEtish")}
        </button>

        {/* Qayta o'ynaganda savollar yangidan yasaladi — sonlar boshqa bo'ladi. */}
        <button type="button" onClick={onQayta}
          className="clay-press mt-2.5 flex w-full items-center justify-center gap-2 rounded-3xl bg-track
                     py-3 font-display text-[15px] text-ink-soft">
          <Icon name="repeat" size={18} />
          {t("yanaOynash")}
        </button>
      </div>
    </div>
  );
}
