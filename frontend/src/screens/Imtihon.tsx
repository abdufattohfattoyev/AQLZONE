/**
 * IMTIHON — DTM matematika blokiga tayyorgarlik (`manba/Dtm.dc.html`).
 *
 * Ekranning butun vazifasi bitta savolga javob berish: "imtihonga
 * tayyormanmi?". Shuning uchun tepada natija turadi (oxirgi beshta
 * urinishning o'rtachasi: "22 / 30 to'g'ri · 73%"), ostida variantlar.
 *
 * Nega o'rtacha: bitta natija hech narsa demaydi — omad ham, charchoq
 * ham bor. Beshta urinishning o'rtachasi esa haqiqatga yaqin va aynan
 * shu son o'sib borishi kerak (`lib/imtihon.ts`).
 *
 * Yangi dizaynda natija ostida KO'P XATO QILINAYOTGAN MAVZULAR turadi
 * (oxirgi urinishlardan, `zaifMavzular`) va "Shu mavzularni takrorlash"
 * — eng zaif mavzu kursining bob testlariga olib boradi.
 *
 * DTM da javob har savoldan keyin darhol ko'rinadi (sertifikatdan farqi)
 * va bu ekranning pastida yozilgan.
 *
 * Variantlar ikki bo'limda: ARALASH (30 ta, butun imtihon — "tayyormanmi?")
 * va MAVZULAR BO'YICHA (13 mavzu × 6 variant, `components/DtmMavzular.tsx`
 * — "shu mavzuni yopdimmi?"). Oxirgi tanlangan bo'lim eslab qolinadi:
 * mavzu bo'yicha ishlayotgan odam har safar almashtirgichni bosmasin.
 */
import { useEffect, useState } from "react";
import { ImtihonSarlavha } from "../components/ImtihonTur";
import { ImtEshiklar } from "../components/HaftalikReyting";
import { Icon } from "../lib/icons";
import { PanelBelgi } from "../lib/chizma/panelBelgi";
import { marafonHolat } from "../lib/marafon";
import type { MarafonHolat } from "../lib/marafon";
import { t } from "../lib/matn";
import { PremiumQator } from "../components/PremiumVaraq";
import { VariantTor } from "../components/VariantTor";
import { useVariantQulf } from "../components/variantQulf";
import { AiRejaKarta } from "../components/AiKartalar";
import { ZaifYorliqlar } from "../components/ZaifYorliqlar";
import { DtmMavzular } from "../components/DtmMavzular";
import { DiagnostikaKarta } from "../components/DiagnostikaKarta";
import { KirishKarta } from "../components/KirishKarta";
import { tebrat } from "../lib/qobiq";
import { MAVZU_OLCHAM, MAVZU_VARIANTLAR } from "../lib/dtmMavzu";
import { OLCHAM, VARIANTLAR, daraja, engYaxshi, sinxronla, zaifMavzular } from "../lib/imtihon";
import type { ServerTarix } from "../lib/imtihon";

type Bolim = "aralash" | "mavzu";
const BOLIM_KALIT = "azapp_dtm_bolim_v1";

function bolimOqi(): Bolim {
  try { return localStorage.getItem(BOLIM_KALIT) === "mavzu" ? "mavzu" : "aralash"; } catch { return "aralash"; }
}

export function Imtihon({ onVariant, onMavzu, onSertifikat, onChiq, onMashq, onReyting, onKorish, onMarafon }: {
  onVariant: (n: number) => void;
  /** Mavzu testining varianti (`lib/dtmMavzu.ts`). */
  onMavzu: (slug: string, n: number) => void;
  /** Milliy sertifikat variantlariga o'tish (`components/ImtihonTur.tsx`). */
  onSertifikat: () => void;
  onChiq: () => void;
  /**
   * Zaif mavzular mashqi. Ilgari "takrorlash" eng zaif mavzu KURSINING
   * bob testlari ro'yxatiga olib borardi — u yerda odam bobni yana o'zi
   * qidirardi va boshqa zaif mavzular umuman kirmasdi.
   */
  onMashq: () => void;
  onReyting: () => void;
  /** Oxirgi urinishni ko'rib chiqish (variant raqami). */
  onKorish: (n: number) => void;
  /** DTM marafoni (`screens/Marafon.tsx`). */
  onMarafon: () => void;
}) {
  // Marafon ketayotgan bo'lsa — ro'yxat tepasida: har kuni qaytish sababi.
  const [marafon, setMarafon] = useState<MarafonHolat | null>(null);
  useEffect(() => {
    let tirik = true;
    marafonHolat().then((x) => { if (tirik) setMarafon(x); }).catch(() => {});
    return () => { tirik = false; };
  }, []);
  // Tarix SERVERDAN: telefon almashsa ham yo'qolmaydi. Ochilganda
  // qurilmadagi urinishlar ham yuboriladi — eski tarix shu yo'l bilan
  // bir marta ko'chadi, internetsiz ishlangani keyinroq yetib boradi.
  // Server javob bermaguncha (yoki internet yo'q bo'lsa) qurilmadagi
  // nusxa ko'rinadi — ekran bo'sh turmaydi.
  const [tarix, setTarix] = useState<ServerTarix | null>(null);
  useEffect(() => {
    let tirik = true;
    sinxronla().then((x) => { if (tirik) setTarix(x); }).catch(() => {});
    return () => { tirik = false; };
  }, []);

  const d = tarix
    ? (tarix.ortacha === null ? null : { foiz: tarix.ortacha, urinish: tarix.jami })
    : daraja();
  const engi = (n: number) => (tarix ? tarix.eng_yaxshi[String(n)] ?? null : engYaxshi(n));
  const [zaif] = useState(() => zaifMavzular());
  // 4+ variant — Imtihon Premium (`lib/premium.ts`): bosilsa varaq chiqadi.
  const qulf = useVariantQulf(onVariant);
  const [bolim, setBolim] = useState<Bolim>(bolimOqi);
  const bolimTanla = (b: Bolim) => {
    if (b === bolim) return;
    tebrat("tanlov");
    setBolim(b);
    try { localStorage.setItem(BOLIM_KALIT, b); } catch { /* faqat shu safar */ }
  };

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-10 min-[360px]:px-[18px]
                    sm:max-w-[560px] kom:grid kom:max-w-[1040px] kom:grid-cols-2 kom:items-start
                    kom:gap-x-6 kom:gap-y-5 kom:px-8 kom:pt-8">
      {/* Kompyuterda ikki ustun (`Sertifikat.tsx` dagidek): chapda natija, o'ngda variantlar. */}
      <div className="contents kom:col-span-2 kom:block">
        <ImtihonSarlavha joriy="dtm" onTanla={onSertifikat} onChiq={onChiq} />
      </div>
      {/* Premium faol bo'lsa — qancha qolgani (soatlari bilan), aks holda hech narsa. */}
      <div className="contents kom:col-span-2 kom:block"><PremiumQator /></div>

      {/* Chap ustun: natija va natijadan keyingi eshiklar (reyting, ko'rib chiqish). */}
      <div className="contents kom:flex kom:flex-col kom:gap-3.5">
      {marafon && marafon.kun && (
        <button type="button" onClick={onMarafon} data-tahlil="DTM: marafon"
          className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta p-4 text-left shadow-clay-sm">
          {/* 3D firuza belgi (`PanelBelgi`) — ilgari amber yostiqdagi yassi olov edi. */}
          <PanelBelgi nom="olov" size={44} className="az-pb-toliq shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[17px] leading-tight">{t("marafonKirish")}</span>
            <span className="block text-[13px] text-ink-dim">
              {marafon.men.bugun ? t("marafonBajarildi", { a: marafon.men.bugun.togri, b: marafon.men.bugun.jami })
                : t("marafonKirishIzoh", { k: marafon.kun, n: marafon.kunlar })}
            </span>
          </span>
          {!marafon.men.bugun && <span className="size-2.5 shrink-0 rounded-full bg-brand-blue" aria-hidden />}
          <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
        </button>
      )}
      <div className="flex flex-col gap-2.5 rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:p-[18px]">
        {d ? (
          <>
            <div className="text-[13px] font-bold text-ink-dim">{t("imtOrtachaDtm")}</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[34px] leading-none font-bold">
                {Math.round((d.foiz * OLCHAM.savol) / 100)}
              </span>
              <span className="flex-1 text-[16px] font-semibold text-ink-soft">
                {t("imtDtmTogri", { n: OLCHAM.savol })}
              </span>
              <span className="font-display text-[22px] font-bold text-brand-blue-t">{d.foiz}%</span>
            </div>
          </>
        ) : (
          <>
            <div className="font-display text-[18px] leading-tight">{t("imtihonBoshlang")}</div>
            <p className="text-[14px] leading-snug text-ink-soft">{t("imtihonBoshlangIzoh")}</p>
            {/* Yangi odamga keyingi qadam bitta tugmada: ilgari "boshlang" deyilardi-yu,
                qayerdan — o'zi o'ng ustundagi o'n ikki katakdan izlardi. */}
            <button type="button" onClick={() => onVariant(1)} data-tahlil="DTM: birinchi variantni boshlash"
              className="tugma-3d mt-1 min-h-12 rounded-2xl bg-brand-blue px-5 font-display text-[16px] font-bold
                         text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
              {t("hrBoshla", { n: 1 })}
            </button>
          </>
        )}

        {zaif.length > 0 && (
          <>
            <div className="mt-1 text-[13px] font-bold text-ink-dim">{t("imtZaif")}</div>
            <ZaifYorliqlar zaif={zaif} tahlil="DTM: zaif mavzu" />
            <button type="button" onClick={onMashq} data-tahlil="DTM: mavzularni takrorlash"
              className="clay-press mt-0.5 min-h-11 self-start rounded-xl bg-brand-blue/10 px-4 text-[14.5px] font-bold
                         text-brand-blue-t">
              {t("zaifMashqTugma")}
            </button>
          </>
        )}
      </div>

      {/* Kirish yo'li — "kira olamanmi?" (`lib/kirish.ts`). Natija bo'lmasa ham
          ko'rinadi: maqsadni oldindan tanlab qo'ysa bo'ladi. */}
      <KirishKarta foiz={d ? d.foiz : null} />

      {/* Bilim xaritasi — 13 mavzudan qaysi biri zaif (`screens/Diagnostika.tsx`). */}
      <DiagnostikaKarta />

      {/* AI ustoz — natija bor bo'lsagina: reja natijalardan tuziladi. */}
      {d && <AiRejaKarta tahlil="DTM: AI reja" />}

      <ImtEshiklar tur="dtm" onReyting={onReyting} onKorish={onKorish} />
      </div>

      <div className="contents kom:flex kom:flex-col kom:gap-3.5">
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="font-display text-[20px]">{t("imtihonVariantlar")}</h2>
        <span className="text-[13px] text-ink-dim">
          {bolim === "aralash" ? t("imtDtmTuzilish", { savol: OLCHAM.savol, daqiqa: OLCHAM.daqiqa })
            : t("imtDtmTuzilish", { savol: MAVZU_OLCHAM.savol, daqiqa: MAVZU_OLCHAM.daqiqa })}
        </span>
      </div>
      {/* Aralash / mavzular bo'yicha — imtihon turi almashtirgichi bilan bir xil ko'rinish. */}
      <div className="flex gap-1 rounded-2xl bg-track p-1" role="group">
        {(["aralash", "mavzu"] as const).map((b) => (
          <button key={b} type="button" aria-pressed={bolim === b} data-tahlil={`DTM bo'lim: ${b}`}
            onClick={() => bolimTanla(b)}
            className={`min-h-11 flex-1 rounded-xl font-display text-[15px] transition-colors
                        ${bolim === b ? "bg-karta font-bold text-ink shadow-clay-sm" : "font-semibold text-ink-soft"}`}>
            {t(b === "aralash" ? "imtBolimAralash" : "imtBolimMavzu")}
          </button>
        ))}
      </div>
      {bolim === "mavzu" ? (
        <>
          <DtmMavzular onBoshla={onMavzu} />
          <p className="text-[13px] leading-snug text-ink-dim">
            {t("imtMavzuTuzilish", { v: MAVZU_VARIANTLAR, savol: MAVZU_OLCHAM.savol, daqiqa: MAVZU_OLCHAM.daqiqa })}.{" "}
            {t("imtMavzuPast")}
          </p>
        </>
      ) : (
      <>
      {/* To'r sahifalab chiqadi (`components/VariantTor.tsx`): 30 ham, 100 ham
          telefonda to'rt qatordan oshmaydi. `key` — serverdagi tarix kelgach
          "keyingi variant" oralig'i qaytadan tanlansin. */}
      <VariantTor key={tarix ? "server" : "qurilma"} soni={VARIANTLAR} yopiqmi={qulf.yopiqmi} natija={engi}
        onTanla={qulf.tanla} tahlil="Imtihon" />

      <p className="text-[13px] leading-snug text-ink-dim">{t("imtDtmPast")}</p>
      </>
      )}
      </div>
      {qulf.varaq}
    </div>
  );
}
