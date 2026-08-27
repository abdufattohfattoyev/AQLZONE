/**
 * YANGI MASALA YOZISH.
 *
 * ─────────────── NEGA UCHTA MAYDON ───────────────
 *
 * Masala, javob, yechim. Yechim IXTIYORIY EMAS va bu bo'limning
 * eng muhim qaroridir: yechimsiz masala — topishmoq. Uni yecholmagan
 * bola javobni ko'radi-yu, NEGA shunday ekanini bilmaydi va hech
 * narsa o'rganmaydi.
 *
 * Yechim yozish esa MUALLIFGA ham foyda: o'zi bilgan narsani
 * tushuntirib yozish uni ikkinchi marta o'rgatadi.
 *
 * ─────────────── TEKSHIRUV SHU YERDA HAM BOR ───────────────
 *
 * Server baribir tekshiradi (`MasalaSerializer`), lekin xatoni
 * YUBORGANDAN KEYIN aytish yomon: odam uzun matn yozib, tugmani
 * bosadi va "kalta" degan javob oladi. Shu yerdagi hisoblagich esa
 * yozayotgan paytda aytadi.
 *
 * ─────────────── NAVBAT HAQIDA OLDINDAN AYTILADI ───────────────
 *
 * Yuborilgan masala DARHOL ko'rinmaydi. Buni tugmadan oldin aytish
 * shart: aks holda odam yuboradi, ro'yxatda topolmaydi va "ishlamadi"
 * deb ikkinchi marta yuboradi.
 */
import { useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { TOIFALAR } from "../lib/masalaSinf";
import * as MS from "../lib/masala";
import { xatoKodi } from "../lib/api";
import { tebrat, useOrqaga } from "../lib/qobiq";

/** Server talab qiladigan eng kichik uzunliklar (`serializers.py`). */
const MIN_MATN = 20;
const MIN_YECHIM = 10;
const MAX_MATN = 2000;
const MAX_YECHIM = 4000;
/** Rasm hajmi chegarasi — server bilan bir xil (`MASALA_RASM_MAX`). */
const MAX_RASM = 6 * 1024 * 1024;

interface Props {
  onYuborildi: () => void;
  onBack: () => void;
}

export function MasalaYangi({ onYuborildi, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);
  // Standart tanlov — BIRINCHI SINF, "Kattalar uchun" emas.
  // Kursdan tashqari toifalar ro'yxatning boshida turadi (ular u
  // yerda ko'rinishi kerak), lekin masalalarning ko'pi maktab
  // dasturiga tegishli va standart tanlov shuni aks ettirsin.
  const [sinf, setSinf] = useState<number>(
    TOIFALAR.find((x) => x.kursdan && x.kod > 0)?.kod ?? 1,
  );
  const [rasm, setRasm] = useState<File | null>(null);
  const [rasmKor, setRasmKor] = useState("");
  const [matn, setMatn] = useState("");
  const [javob, setJavob] = useState("");
  const [yechim, setYechim] = useState("");
  const [ketmoqda, setKetmoqda] = useState(false);
  const [xato, setXato] = useState("");

  const matnYetarli = matn.trim().length >= MIN_MATN;
  const yechimYetarli = yechim.trim().length >= MIN_YECHIM;
  const tayyor = matnYetarli && yechimYetarli && javob.trim().length > 0;

  const yubor = async () => {
    if (!tayyor || ketmoqda) return;
    setKetmoqda(true);
    setXato("");
    try {
      await MS.yubor({
        sinf, matn: matn.trim(), javob: javob.trim(), yechim: yechim.trim(), rasm,
      });
      tebrat("yutuq");
      onYuborildi();
    } catch (e) {
      // 429 — kunlik chegara. Uni oddiy "xato" deb ko'rsatish
      // noto'g'ri bo'lardi: odam hech narsani buzmagan, shunchaki
      // bugungi hissasini qo'shib bo'lgan.
      setXato(xatoKodi(e) === 429 ? t("masalaKunlikChegara") : t("saqlanmadi"));
    } finally {
      setKetmoqda(false);
    }
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
    // Ko'rinish uchun vaqtinchalik manzil. Eskisi bo'sh joyni
    // egallab qolmasin — u qo'lda bo'shatiladi.
    setRasmKor((eski) => { if (eski) URL.revokeObjectURL(eski); return URL.createObjectURL(f); });
  };

  const rasmniOchir = () => {
    if (rasmKor) URL.revokeObjectURL(rasmKor);
    setRasm(null);
    setRasmKor("");
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-10">
      <div className="flex items-center gap-2.5">
        {!ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl
                       bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-[18px] leading-tight">{t("masalaYoz")}</h1>
          <p className="text-[11.5px] leading-snug text-ink-dim">{t("masalaYozTepa")}</p>
        </div>
      </div>

      {/* ---- sinf ---- */}
      <p className="mt-4 mb-1.5 ml-1 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("masalaQaysiSinf")}
      </p>
      {/* Ikki guruh AJRATILGAN: kursdan tashqari toifalar bitta
          uzun tasmada sinflar bilan aralashib ketsa, ular
          "yigirmanchi sinf" kabi ko'rinardi. */}
      <Guruh nom={t("masalaKursdanTashqari")}
        lar={TOIFALAR.filter((x) => !x.kursdan)} joriy={sinf} on={setSinf} />
      <Guruh nom={t("masalaSinflar")}
        lar={TOIFALAR.filter((x) => x.kursdan)} joriy={sinf} on={setSinf} />

      <Maydon
        nom={t("masalaMatni")} izoh={t("masalaMatniIzoh")}
        qiymat={matn} onOzgar={setMatn} qatorlar={5} max={MAX_MATN}
        min={MIN_MATN} yetarli={matnYetarli}
      />

      {/* Javob QISQA maydon: u bir necha belgi bo'ladi va katta
          maydon "uzun yozing" degan noto'g'ri ishora berardi. */}
      <p className="mt-4 mb-1.5 ml-1 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("masalaJavobi")}
      </p>
      <label className="flex items-center gap-2 rounded-clay bg-karta px-3.5 py-3 shadow-clay-sm">
        <input
          value={javob} onChange={(e) => setJavob(e.target.value)}
          placeholder={t("masalaJavobiJoy")} maxLength={100}
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-dim"
        />
      </label>
      <p className="mt-1 ml-1 text-[11px] leading-snug text-ink-dim">
        {t("masalaJavobiIzoh")}
      </p>

      <Maydon
        nom={t("masalaYechimi")} izoh={t("masalaYechimiIzoh")}
        qiymat={yechim} onOzgar={setYechim} qatorlar={6} max={MAX_YECHIM}
        min={MIN_YECHIM} yetarli={yechimYetarli}
      />

      {/* ---- rasm ----
          YECHIMDAN KEYIN turadi va bu ataylab: rasm ixtiyoriy, matn
          esa majburiy. Yuqorida tursa, rasmi yo'q odam uni majburiy
          deb o'ylab, masalani umuman yozmay qo'yardi. */}
      <p className="mt-4 mb-1.5 ml-1 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("masalaRasm")}
      </p>
      {rasmKor ? (
        <div className="rounded-clay bg-karta p-3 shadow-clay-sm">
          <img src={rasmKor} alt="" className="max-h-64 w-full rounded-2xl
                                               bg-track object-contain" />
          <button type="button" onClick={rasmniOchir}
            className="clay-press mt-2 w-full rounded-clay bg-track py-2 text-[12.5px]
                       text-ink-soft">
            {t("masalaRasmOchir")}
          </button>
        </div>
      ) : (
        <label className="clay-press flex w-full cursor-pointer items-center gap-2.5
                          rounded-clay bg-karta px-3.5 py-3 shadow-clay-sm">
          <Icon name="pie" size={17} className="shrink-0 text-ink-dim" />
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px]">{t("masalaRasmTanla")}</span>
            <span className="block text-[11px] text-ink-dim">{t("masalaRasmIzoh")}</span>
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={rasmniTanla} />
        </label>
      )}

      {xato && (
        <p className="mt-3 rounded-clay bg-brand-red/15 px-3.5 py-2.5 text-[12.5px] text-brand-red">
          {xato}
        </p>
      )}

      {/* Navbat haqida TUGMADAN OLDIN aytiladi. */}
      <p className="mt-4 rounded-clay bg-karta/70 px-3.5 py-2.5 text-[12px] leading-snug text-ink-dim">
        {t("masalaNavbatIzoh")}
      </p>

      <button type="button" onClick={() => void yubor()} disabled={!tayyor || ketmoqda}
        className="tugma-3d mt-2.5 w-full rounded-clay bg-brand-purple py-3.5 font-display
                   text-[15px] text-white shadow-clay disabled:opacity-50">
        {ketmoqda ? t("yuklanyapti") : t("masalaYubor")}
      </button>
    </div>
  );
}

/** Bitta toifa guruhi — sarlavha va chiplar tasmasi. */
function Guruh({ nom, lar, joriy, on }: {
  nom: string;
  lar: { kod: number; nom: string }[];
  joriy: number;
  on: (kod: number) => void;
}) {
  if (!lar.length) return null;
  return (
    <>
      <p className="mt-2 mb-1 ml-1 text-[11px] text-ink-dim">{nom}</p>
      <div className="flex gap-1.5 overflow-x-auto pb-1
                      [-ms-overflow-style:none] [scrollbar-width:none]
                      [&::-webkit-scrollbar]:hidden">
        {lar.map((x) => (
          <button key={x.kod} type="button" onClick={() => on(x.kod)}
            className={`clay-press shrink-0 rounded-full px-3 py-1.5 text-[12px] ${
              joriy === x.kod ? "bg-brand-blue text-white" : "bg-karta text-ink-dim shadow-clay-sm"}`}>
            {x.nom}
          </button>
        ))}
      </div>
    </>
  );
}

function Maydon({
  nom, izoh, qiymat, onOzgar, qatorlar, max, min, yetarli,
}: {
  nom: string; izoh: string; qiymat: string; onOzgar: (v: string) => void;
  qatorlar: number; max: number; min: number; yetarli: boolean;
}) {
  const uzunlik = qiymat.trim().length;
  return (
    <>
      <p className="mt-4 mb-1.5 ml-1 text-[11px] tracking-widest text-ink-soft uppercase">
        {nom}
      </p>
      <textarea
        value={qiymat} onChange={(e) => onOzgar(e.target.value)}
        rows={qatorlar} maxLength={max} placeholder={izoh}
        className="w-full resize-y rounded-clay bg-karta px-3.5 py-3 text-[14.5px]
                   leading-relaxed shadow-clay-sm outline-none placeholder:text-ink-dim"
      />
      {/* Hisoblagich faqat YETMAGANDA ko'rinadi: yetarli bo'lgach u
          shunchaki shovqin bo'lib qolardi. */}
      {!yetarli && uzunlik > 0 && (
        <p className="mt-1 ml-1 text-[11px] text-brand-gold">
          {t("masalaYanaBelgi", { n: min - uzunlik })}
        </p>
      )}
    </>
  );
}
