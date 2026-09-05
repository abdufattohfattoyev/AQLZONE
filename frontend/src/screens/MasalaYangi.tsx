/**
 * YANGI MASALA — QADAM-BAQADAM.
 *
 * ─────────────── NEGA QADAMLARGA BO'LINDI ───────────────
 *
 * Ilgari bu bitta uzun forma edi: to'rtta maydon, ikkita sinf
 * tasmasi va rasm — hammasi bir ekranda, bir xil ko'rinishdagi
 * qutilar bo'lib pastga cho'zilardi. Odam qayerdan boshlashni ham,
 * qancha qolganini ham bilmasdi va ko'pchilik o'rtasida tashlab
 * ketardi.
 *
 * Endi to'rtta qadam va har birida BITTA savol:
 *
 *   1  kimga mo'ljallangan     (siz belgilaysiz, ilova taxmin qilmaydi)
 *   2  qaysi sinf              (faqat maktab tanlansa)
 *   3  shart, javob, yechim    (yozayotganda tekshiriladi)
 *   4  tekshirib chiqish       (o'zgartirish va yuborish)
 *
 * ─────────────── SINFNI ILOVA ANIQLAMAYDI ───────────────
 *
 * Matndan mavzuni topib berish texnik jihatdan mumkin edi (ilovada
 * 915 yozuvli indeks bor), lekin bu MUALLIFNING qarori: u masalani
 * kim uchun yozayotganini biladi, ilova esa faqat so'zlarga qarab
 * taxmin qilardi. Noto'g'ri taxmin esa masalani butunlay boshqa
 * sinfga yozib qo'yardi va muallif buni sezmasdi ham.
 *
 * ─────────────── TEKSHIRUVLAR FAQAT SHAKL HAQIDA ───────────────
 *
 * Yashil belgi "to'g'ri" degani emas, "shakli joyida" degani —
 * matematikani ular bilmaydi (`lib/masalaTekshir.ts`). Ular yozish
 * paytida ko'rinadi, yuborilgandan keyin emas: uzun matn yozib
 * bo'lib, "kalta" degan javobni olish eng jahl chiqaradigan holat.
 *
 * ─────────────── KENG EKRAN ───────────────
 *
 * Telefonda bitta ustun. Planshetdan boshlab uchinchi qadam ikki
 * ustunga bo'linadi va oxirgi qadamda "yechuvchi shunday ko'radi"
 * yonma-yon turadi — muallif nima yuborayotganini ko'rib turadi.
 */
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { Reveal } from "../components/Reveal";
import { t } from "../lib/matn";
import { KATTALAR, OLIMPIADA, SINF_GURUHLARI, sinfNomi } from "../lib/masalaSinf";
import type { SinfGuruh } from "../lib/masalaSinf";
import {
  javobBelgilari, javobTayyor, matnBelgilari, matnTayyor,
  yechimBelgilari, yechimTayyor,
} from "../lib/masalaTekshir";
import type { Belgi } from "../lib/masalaTekshir";
import * as MS from "../lib/masala";
import { xatoKodi } from "../lib/api";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { UNIT_COLORS } from "../lib/types";
import type { UnitColor } from "../lib/types";

const MAX_MATN = 2000;
const MAX_YECHIM = 4000;
/** Rasm hajmi chegarasi — server bilan bir xil (`MASALA_RASM_MAX`). */
const MAX_RASM = 6 * 1024 * 1024;

/** Nechta qadam bor — progress chizig'i shundan yasaladi. */
const QADAMLAR = 4;

/** Kimga mo'ljallangani — birinchi qadamdagi uchta tanlov. */
type Kim = "maktab" | "kattalar" | "olimpiada";

interface Props {
  onYuborildi: () => void;
  onBack: () => void;
}

export function MasalaYangi({ onYuborildi, onBack }: Props) {
  const [qadam, setQadam] = useState(1);
  const [kim, setKim] = useState<Kim | null>(null);
  const [sinf, setSinf] = useState<number | null>(null);
  /** Ikki fanli sinf tanlanganda — qaysi fan so'raladi. */
  const [fanSorash, setFanSorash] = useState<SinfGuruh | null>(null);

  const [matn, setMatn] = useState("");
  const [javob, setJavob] = useState("");
  const [yechim, setYechim] = useState("");
  const [rasm, setRasm] = useState<File | null>(null);
  const [rasmKor, setRasmKor] = useState("");

  const [ketmoqda, setKetmoqda] = useState(false);
  const [xato, setXato] = useState("");

  /**
   * Orqaga tugmasi qadamlar bo'ylab yuradi.
   *
   * Birinchi qadamda esa ekrandan chiqadi. Busiz Telegram'ning
   * o'z orqaga tugmasi formani o'rtasidan yopib yuborardi va
   * yozilgan matn yo'qolardi.
   */
  const ortga = () => {
    if (fanSorash) { setFanSorash(null); return; }
    if (qadam > 1) { setQadam(qadam - 1); return; }
    onBack();
  };
  const ozStrelka = useOrqaga(ortga);

  /** Maktab tanlanmagan bo'lsa ikkinchi qadam o'tkazib yuboriladi. */
  const sinfKerak = kim === "maktab";
  const tanlanganKod = kim === "kattalar" ? KATTALAR
    : kim === "olimpiada" ? OLIMPIADA
    : sinf;

  const matnB = useMemo(() => matnBelgilari(matn), [matn]);
  const javobB = useMemo(() => javobBelgilari(javob), [javob]);
  const yechimB = useMemo(() => yechimBelgilari(yechim, javob), [yechim, javob]);

  const uchinchiTayyor =
    matnTayyor(matn) && javobTayyor(javob) && yechimTayyor(yechim);

  const qadamTayyor =
    qadam === 1 ? kim !== null
    : qadam === 2 ? tanlanganKod !== null
    : qadam === 3 ? uchinchiTayyor
    : true;

  const oldinga = () => {
    if (!qadamTayyor) return;
    tebrat("tanlov");
    // Kattalar va olimpiada uchun sinf so'ralmaydi — ikkinchi
    // qadam butunlay o'tkazib yuboriladi.
    if (qadam === 1 && !sinfKerak) { setQadam(3); return; }
    setQadam(qadam + 1);
  };

  const kimniTanla = (k: Kim) => {
    tebrat("tanlov");
    setKim(k);
    if (k !== "maktab") setSinf(null);
  };

  const sinfniTanla = (g: SinfGuruh) => {
    tebrat("tanlov");
    // Bir fanli sinf darhol tanlanadi, ikki fanlisi so'raydi.
    if (g.fanlar.length === 1) { setSinf(g.fanlar[0].kod); setFanSorash(null); }
    else setFanSorash(g);
  };

  /**
   * Rasm tanlandi.
   *
   * Hajm SHU YERDA ham tekshiriladi, garchi server ham tekshirsa
   * ham: 8 MB li suratni yuborib, keyin "juda katta" degan javobni
   * olish sekin internetda bir daqiqa vaqt oladi.
   */
  const rasmniTanla = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setXato("");
    if (f.size > MAX_RASM) { setXato(t("masalaRasmKatta")); return; }
    if (!f.type.startsWith("image/")) { setXato(t("masalaRasmXato")); return; }
    setRasm(f);
    setRasmKor((eski) => {
      if (eski) URL.revokeObjectURL(eski);
      return URL.createObjectURL(f);
    });
  };

  const rasmniOchir = () => {
    if (rasmKor) URL.revokeObjectURL(rasmKor);
    setRasm(null);
    setRasmKor("");
  };

  const yubor = async () => {
    if (tanlanganKod === null || !uchinchiTayyor || ketmoqda) return;
    setKetmoqda(true);
    setXato("");
    try {
      await MS.yubor({
        sinf: tanlanganKod,
        matn: matn.trim(), javob: javob.trim(), yechim: yechim.trim(), rasm,
      });
      tebrat("yutuq");
      onYuborildi();
    } catch (e) {
      setXato(xatoKodi(e) === 429 ? t("masalaKunlikChegara") : t("saqlanmadi"));
      setKetmoqda(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-2 pb-10 lg:max-w-4xl">
      {/* ---- sarlavha va progress ----
          Sarlavha va qadam raqami BIR qatorda: ro'yxat ekranidagidek
          past tepa qism, ikkinchi qavatsiz. */}
      <div className="flex items-center gap-2">
        {!ozStrelka && (
          <button type="button" onClick={ortga} aria-label={t("ortga")}
            className="clay-press -ml-1 grid size-10 shrink-0 place-items-center rounded-2xl
                       text-ink-soft">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate font-display text-[17px] leading-tight">
          {sarlavha(qadam, fanSorash)}
        </h1>
        <span className="shrink-0 text-[11.5px] text-ink-dim">
          {t("masalaQadam", { n: qadam, jami: QADAMLAR })}
        </span>
      </div>

      {/* Progress — qadamlar soniga teng bo'lakcha. Rangi to'lgani
          sari o'sadi: odam qancha qolganini bir qarashda ko'radi. */}
      <div className="mt-2.5 flex gap-1" role="progressbar"
        aria-valuenow={qadam} aria-valuemin={1} aria-valuemax={QADAMLAR}>
        {Array.from({ length: QADAMLAR }, (_, i) => (
          <span key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < qadam ? "bg-brand-green" : "bg-track"}`} />
        ))}
      </div>

      {/* ---- qadam ichi ----
          `key` qadam bilan o'zgaradi, ya'ni React butun bo'lakni
          qaytadan yasaydi va `az-kirish` animatsiyasi har o'tishda
          qayta ishlaydi — ekran "sirg'alib" almashadi. */}
      <div key={`${qadam}-${fanSorash?.sinf ?? ""}`} className="az-kirish mt-4">
        {qadam === 1 && <Kimga joriy={kim} on={kimniTanla} />}

        {qadam === 2 && !fanSorash && (
          <SinfSetkasi joriy={sinf} on={sinfniTanla} />
        )}
        {qadam === 2 && fanSorash && (
          <FanTanlash guruh={fanSorash} on={(kod) => { setSinf(kod); setFanSorash(null); }} />
        )}

        {qadam === 3 && (
          <Uchinchi
            matn={matn} setMatn={setMatn} matnB={matnB}
            javob={javob} setJavob={setJavob} javobB={javobB}
            yechim={yechim} setYechim={setYechim} yechimB={yechimB}
            rasmKor={rasmKor} onRasm={rasmniTanla} onRasmOchir={rasmniOchir}
          />
        )}

        {qadam === 4 && (
          <Tortinchi
            kim={kim} kod={tanlanganKod} matn={matn} rasmKor={rasmKor}
            belgilar={[...matnB, ...javobB, ...yechimB]}
            onOzgartir={() => setQadam(1)}
          />
        )}
      </div>

      {xato && (
        <p className="mt-3 rounded-clay bg-brand-red/15 px-3.5 py-2.5 text-[12.5px] text-brand-red">
          {xato}
        </p>
      )}

      {/* ---- pastdagi tugmalar ---- */}
      {!fanSorash && (
        <div className="mt-4 flex gap-2">
          {qadam > 1 && (
            <button type="button" onClick={ortga}
              className="clay-press flex-1 rounded-clay bg-karta py-3 text-[13.5px]
                         text-ink-soft shadow-clay-sm">
              {t("masalaOrtga")}
            </button>
          )}
          {qadam < QADAMLAR ? (
            <button type="button" onClick={oldinga} disabled={!qadamTayyor}
              className="tugma-3d flex-[2] rounded-clay bg-brand-purple py-3 font-display
                         text-[14.5px] text-white shadow-clay disabled:opacity-45">
              {t("masalaKeyingi")}
            </button>
          ) : (
            <button type="button" onClick={() => void yubor()} disabled={ketmoqda}
              className="tugma-3d az-yaltir flex-[2] rounded-clay bg-brand-purple py-3
                         font-display text-[14.5px] text-white shadow-clay disabled:opacity-45">
              {ketmoqda ? t("yuklanyapti") : t("masalaYubor")}
            </button>
          )}
        </div>
      )}

      {qadam === QADAMLAR && (
        <p className="mt-2 text-center text-[11.5px] leading-snug text-ink-dim">
          {t("masalaYozTepa")}
        </p>
      )}
    </div>
  );
}

/** Har qadamning o'z sarlavhasi — u yerda nima so'ralayotgani. */
function sarlavha(qadam: number, fan: SinfGuruh | null): string {
  if (fan) return t("masalaQaysiFan");
  if (qadam === 1) return t("masalaQaysiSinf");
  if (qadam === 2) return t("masalaQaysiSinfBosh");
  if (qadam === 3) return t("masalaMatnBosh");
  return t("masalaTekshirBosh");
}

/* ------------------------------------------------------------ 1-qadam */

function Kimga({ joriy, on }: { joriy: Kim | null; on: (k: Kim) => void }) {
  const lar: { kod: Kim; ic: IconName; rang: UnitColor; nom: string; izoh: string }[] = [
    { kod: "maktab", ic: "map", rang: "blue",
      nom: t("masalaMaktab"), izoh: t("masalaMaktabIzoh") },
    { kod: "kattalar", ic: "parent", rang: "purple",
      nom: t("masalaKattalar"), izoh: t("masalaKattalarIzoh") },
    { kod: "olimpiada", ic: "trophy", rang: "orange",
      nom: t("masalaOlimpiada"), izoh: t("masalaOlimpiadaIzoh") },
  ];
  return (
    <>
      <p className="mb-2 ml-1 text-[11.5px] text-ink-dim">{t("masalaKimgaIzoh")}</p>
      <div className="space-y-2.5 sm:grid sm:grid-cols-3 sm:gap-2.5 sm:space-y-0">
        {lar.map((x, i) => {
          const r = UNIT_COLORS[x.rang];
          const faol = joriy === x.kod;
          return (
            <Reveal key={x.kod} kech={i * 60}>
              <button type="button" onClick={() => on(x.kod)}
                className={`clay-press flex w-full items-center gap-3 rounded-clay bg-karta p-3.5
                            text-left shadow-clay-sm transition-all sm:flex-col sm:items-start
                            ${faol ? "outline outline-2 outline-brand-blue" : ""}`}>
                <span style={{ backgroundColor: `${r.road}1f`, color: r.road }}
                  className="grid size-10 shrink-0 place-items-center rounded-2xl">
                  <Icon name={x.ic} size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[14.5px] leading-tight">{x.nom}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-dim">
                    {x.izoh}
                  </span>
                </span>
                {faol && <Icon name="check" size={18} className="shrink-0 text-brand-blue sm:hidden" />}
              </button>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------ 2-qadam */

function SinfSetkasi({ joriy, on }: { joriy: number | null; on: (g: SinfGuruh) => void }) {
  const maktabgacha = SINF_GURUHLARI.find((g) => g.sinf === 0);
  const sinflar = SINF_GURUHLARI.filter((g) => g.sinf > 0);
  const tanlangan = (g: SinfGuruh) => g.fanlar.some((f) => f.kod === joriy);

  return (
    <>
      <p className="mb-2 ml-1 text-[11.5px] text-ink-dim">{t("masalaSinfIzoh")}</p>

      {maktabgacha && (
        <button type="button" onClick={() => on(maktabgacha)}
          className={`clay-press mb-2.5 flex w-full items-center gap-2.5 rounded-clay bg-karta
                      px-3.5 py-3 text-left shadow-clay-sm
                      ${tanlangan(maktabgacha) ? "outline outline-2 outline-brand-blue" : ""}`}>
          <span className="font-display text-[14px]">{maktabgacha.nom}</span>
          <span className="text-[11.5px] text-ink-dim">· 4–6 yosh</span>
        </button>
      )}

      {/* Setka telefonda 4 ta, kengroq ekranda 6 ta ustun. Sinflar
          soni o'n bitta — to'rt ustunda ular uch qatorga sig'adi va
          hech qayerga surish kerak bo'lmaydi. */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {sinflar.map((g, i) => (
          <Reveal key={g.sinf} kech={i * 25}>
            <button type="button" onClick={() => on(g)}
              className={`clay-press flex w-full flex-col items-center justify-center gap-0.5
                          rounded-2xl bg-karta py-3 shadow-clay-sm transition-all
                          ${tanlangan(g) ? "bg-brand-blue text-white" : ""}`}>
              <span className="font-display text-[17px] leading-none">{g.sinf}</span>
              {/* Ikki fanli sinf shundan bilinadi — bosilganda
                  qaysi biri kerakligi so'raladi. */}
              <span className={`text-[9.5px] leading-none ${
                tanlangan(g) ? "text-white/75" : "text-ink-dim"}`}>
                {g.fanlar.length > 1 ? g.fanlar.map(qisqa).join(" · ") : " "}
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </>
  );
}

/** "Algebra" → "alg". Plitka tor va to'liq nom sig'maydi. */
const qisqa = (f: { nom: string }) => f.nom.slice(0, 3).toLowerCase();

function FanTanlash({ guruh, on }: { guruh: SinfGuruh; on: (kod: number) => void }) {
  return (
    <div className="space-y-2.5">
      {guruh.fanlar.map((f, i) => (
        <Reveal key={f.kod} kech={i * 60}>
          <button type="button" onClick={() => on(f.kod)}
            className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta p-4
                       text-left shadow-clay-sm">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl
                             bg-brand-blue/15 font-display text-[15px] text-brand-blue">
              {guruh.sinf}
            </span>
            <span className="min-w-0 flex-1 font-display text-[15px]">{f.nom}</span>
            <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
          </button>
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ 3-qadam */

function Uchinchi({
  matn, setMatn, matnB, javob, setJavob, javobB,
  yechim, setYechim, yechimB, rasmKor, onRasm, onRasmOchir,
}: {
  matn: string; setMatn: (v: string) => void; matnB: Belgi[];
  javob: string; setJavob: (v: string) => void; javobB: Belgi[];
  yechim: string; setYechim: (v: string) => void; yechimB: Belgi[];
  rasmKor: string;
  onRasm: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRasmOchir: () => void;
}) {
  return (
    // Planshetdan boshlab ikki ustun: shart chapda, javob va yechim
    // o'ngda. Telefonda esa ustma-ust — yonma-yon qo'yilganda
    // maydonlar o'qib bo'lmaydigan darajada torayardi.
    <div className="grid gap-2.5 md:grid-cols-2 md:items-start">
      <Karta nom={t("masalaShart")} belgilar={matnB}>
        <textarea
          value={matn} onChange={(e) => setMatn(e.target.value)}
          rows={5} maxLength={MAX_MATN} placeholder={t("masalaMatniIzoh")}
          className="shadow-ichki w-full resize-y rounded-2xl bg-sahna px-3.5 py-3 text-[14.5px]
                     leading-relaxed outline-none placeholder:text-ink-dim"
        />
        {rasmKor ? (
          <div className="mt-2">
            <img src={rasmKor} alt="" className="max-h-56 w-full rounded-2xl
                                                 bg-track object-contain" />
            <button type="button" onClick={onRasmOchir}
              className="clay-press mt-1.5 w-full rounded-2xl bg-track py-2 text-[12px]
                         text-ink-soft">
              {t("masalaRasmOchir")}
            </button>
          </div>
        ) : (
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-2
                            rounded-2xl border-[1.5px] border-dashed border-track py-3
                            text-[11.5px] text-ink-dim">
            <Icon name="plus" size={15} />
            {t("masalaRasmIzoh")}
            <input type="file" accept="image/*" className="hidden" onChange={onRasm} />
          </label>
        )}
      </Karta>

      <div className="grid gap-2.5">
        <Karta nom={t("masalaJavobi")} qosh={t("masalaJavobiJoy")} belgilar={javobB}>
          {/* Javob maydoni QISQA — u bir necha belgi bo'ladi va
              keng maydon "uzun yozing" degan noto'g'ri ishora
              berardi. */}
          <input
            value={javob} onChange={(e) => setJavob(e.target.value)}
            maxLength={100} inputMode="text"
            className="shadow-ichki w-40 rounded-2xl bg-sahna px-3.5 py-2.5 text-[17px]
                       outline-none placeholder:text-ink-dim"
          />
        </Karta>

        <Karta nom={t("masalaYechimi")} belgilar={yechimB}>
          <textarea
            value={yechim} onChange={(e) => setYechim(e.target.value)}
            rows={4} maxLength={MAX_YECHIM} placeholder={t("masalaYechimiIzoh")}
            className="shadow-ichki w-full resize-y rounded-2xl bg-sahna px-3.5 py-3 text-[14px]
                       leading-relaxed outline-none placeholder:text-ink-dim"
          />
        </Karta>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ 4-qadam */

function Tortinchi({
  kim, kod, matn, rasmKor, belgilar, onOzgartir,
}: {
  kim: Kim | null; kod: number | null; matn: string;
  rasmKor: string; belgilar: Belgi[]; onOzgartir: () => void;
}) {
  return (
    <div className="grid gap-2.5 md:grid-cols-2 md:items-start">
      <div className="rounded-clay bg-karta p-4 shadow-clay-sm">
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 font-display text-[14px]">
            {kim === "maktab" ? t("masalaMaktab") : kod !== null ? sinfNomi(kod) : ""}
            {kim === "maktab" && kod !== null && (
              <span className="text-ink-soft"> · {sinfNomi(kod)}</span>
            )}
          </span>
          <button type="button" onClick={onOzgartir}
            className="clay-press shrink-0 rounded-full bg-track px-2.5 py-1
                       text-[11px] text-ink-soft">
            {t("masalaOzgartirish")}
          </button>
        </div>

        <div className="mt-2.5 space-y-1">
          {belgilar.map((b, i) => <Qator key={i} b={b} />)}
          <Qator b={{
            holat: rasmKor ? "ok" : "ok",
            kalit: rasmKor ? "masalaChizmaBor" : "masalaChizmaYoq",
          }} />
        </div>
      </div>

      {/* Yechuvchi ko'radigan ko'rinish — muallif nima
          yuborayotganini yuborishdan OLDIN ko'radi. */}
      <div className="rounded-clay bg-karta p-4 shadow-clay-sm
                      outline outline-1 outline-brand-purple/40">
        <p className="mb-2 text-[11px] tracking-widest text-ink-soft uppercase">
          {t("masalaShundayKoradi")}
        </p>
        <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{matn}</p>
        {rasmKor && (
          <img src={rasmKor} alt="" className="mt-2.5 max-h-48 w-full rounded-2xl
                                               bg-track object-contain" />
        )}
        {/* Javob va yechim BU YERDA ko'rinmaydi — yechuvchi ham
            ularni ko'rmaydi. Ko'rsatsak, ko'rinish yolg'on
            bo'lardi. */}
        <div className="shadow-ichki mt-2.5 rounded-2xl bg-sahna px-3.5 py-2.5 text-[12.5px] text-ink-dim">
          {t("masalaJavobJoy")}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- bo'laklar */

function Karta(
  { nom, qosh, belgilar, children }:
  { nom: string; qosh?: string; belgilar: Belgi[]; children: ReactNode },
) {
  return (
    <div className="rounded-clay bg-karta p-3.5 shadow-clay-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="min-w-0 flex-1 text-[11px] tracking-widest text-ink-soft uppercase">
          {nom}
        </span>
        {qosh && <span className="shrink-0 text-[11px] text-ink-dim">{qosh}</span>}
      </div>
      {children}
      {belgilar.length > 0 && (
        <div className="mt-2 space-y-1">
          {belgilar.map((b, i) => <Qator key={i} b={b} />)}
        </div>
      )}
    </div>
  );
}

/**
 * Bitta tekshiruv qatori.
 *
 * Sariq belgi XATO EMAS — maslahat. Shuning uchun u qizil emas va
 * "Keyingi" tugmasini ham to'smaydi: masalani yozgan odam nimani
 * qanday yozishni o'zi hal qiladi.
 */
function Qator({ b }: { b: Belgi }) {
  const ok = b.holat === "ok";
  return (
    <p className="flex items-start gap-2 text-[11.5px] leading-snug">
      <span className={`mt-px grid size-4 shrink-0 place-items-center rounded-full ${
        ok ? "bg-brand-green/20 text-brand-green" : "bg-brand-gold/20 text-brand-gold"}`}>
        <Icon name={ok ? "check" : "sign"} size={10} />
      </span>
      <span className="text-ink-soft">
        {t(b.kalit as Parameters<typeof t>[0], b.orin)}
      </span>
    </p>
  );
}
