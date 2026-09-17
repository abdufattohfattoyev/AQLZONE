/**
 * O'yinlar bo'limi — bitta eshik, pastida mashq.
 *
 * Kurslardan ALOHIDA turadi va bu butun bo'limning ma'nosi: bu yerda
 * dars yo'q, tartib yo'q, "keyingi bob" yo'q.
 *
 * ──────────── NEGA SAKKIZTA KARTA PASTGA TUSHDI ────────────
 *
 * Ilgari ekran sakkizta teng kartadan boshlanardi va aynan shu uni
 * chalkash qilardi: sakkizta teng karta — sakkizta qaror. Odam bunday
 * paytda tanlamaydi, chiqib ketadi. Darsda bu muammo yo'q, chunki u
 * yerda bitta yashil "Davom etish" bor.
 *
 * Ikkinchi teshik: hech bir o'yin BUGUN boshqacha emas edi. Ertaga ham
 * xuddi shu sakkizta karta turardi, ya'ni bugun kirish uchun sabab
 * yo'q edi.
 *
 * Endi tepada bitta katta tugma turadi — "Bugungi maydon". U har kuni
 * yangi, muddati bor va hammaga bir xil savol beradi. Sakkizta o'yin
 * yo'qolmadi: ular pastga, "Mashq" bo'limiga tushdi va kartasi
 * kichraydi. Ular endi TANLOV emas, MASHQ — ya'ni ular bilan
 * maydonga tayyorlaniladi.
 *
 * ──────────── DUEL ENDI SHU YERDA ────────────
 *
 * Ilgari u bosh sahifada, alohida karta bo'lib turardi — "duel o'yin
 * emas, unda ikkinchi odam bor" degan mulohaza bilan. Mulohaza to'g'ri
 * edi, lekin xulosa noto'g'ri chiqdi: odam bellashuvni ATAYLAB
 * qidirganda birinchi qaraydigan joyi — o'yinlar bo'limi. Bosh sahifada
 * esa u kurslar ro'yxatini pastga surib yuborardi.
 *
 * Sakkizta o'yin qatoriga ham QO'SHILMADI. U yuqorida, "Bugungi
 * maydon" bilan yonma-yon turadi va bu ikkisi bir turdagi narsa:
 * ikkalasi ham BUGUN bo'ladi, ikkalasida ham qarshi tomon bor.
 * Pastdagi sakkiztasi esa mashq — ular har doim joyida.
 *
 * KARTA IKKI XIL GAPIRADI. O'ynalmagan o'yinda izoh turadi ("Qaysi
 * belgi yashiringan?") — u savol bo'lib, qiziqish uyg'otadi.
 * O'ynalganida esa uning o'rniga REKORD chiqadi: endi izoh ortiqcha,
 * odam o'yinni biladi va uni faqat bitta narsa qiziqtiradi — o'z
 * natijasi.
 */
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { duelTaklifOl } from "../lib/api";
import type { XonaOyin } from "../lib/api";
import { XONA_OYINLAR } from "../lib/xonaOyinlar";
import { kunlikSonBugun } from "./KunlikSon";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { OYINLAR } from "../lib/oyin";
import { DARAJALAR } from "../lib/oyin/tur";
import type { Oyin } from "../lib/oyin/tur";
import { maydonNatija, rekord } from "../lib/oyin/rekord";
import { qolganSoat } from "../lib/oyin/maydon";
import { UNIT_COLORS } from "../lib/types";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";

/**
 * ──────────── IKKI BO'LIM: YAKKA VA JAMOAVIY (2026-09-17) ────────────
 *
 * Jamoaviy o'yinlar (Son kartalari, Hisob Royale, Son kodlari) qo'shilgach
 * bitta ro'yxat yana "o'nta teng karta — o'nta qaror" ga aylanardi. Odam
 * bu yerga ikki xil kayfiyatda keladi: yolg'iz mashq qilgani yoki kimdir
 * bilan o'ynagani. Tab aynan shu birinchi savolni so'raydi, qolgan tanlov
 * esa kichrayadi. Tanlangan tab eslab qolinadi.
 */
type Bolim = "yakka" | "jamoaviy";
const BOLIM_KALIT = "az-oyin-bolim";

function bolimOl(): Bolim {
  try { return localStorage.getItem(BOLIM_KALIT) === "jamoaviy" ? "jamoaviy" : "yakka"; } catch { return "yakka"; }
}

export function Oyinlar({ onBack, onOyin, onMaydon, onKunlikSon, onShaharcha, onJadval, onDuel, onJamoa }: {
  onBack: () => void;
  onOyin: (id: string) => void;
  onMaydon: () => void;
  /** Kunlik son — Wordle uslubidagi jumboq. */
  onKunlikSon: () => void;
  /** Tulki shaharchasi — tangaga bino, kunlik hosil. */
  onShaharcha: () => void;
  /** Daraja va haftalik jadval. */
  onJadval: () => void;
  /** Do'st bilan bellashuv — jamoaviy bo'limda. */
  onDuel: () => void;
  /** Jamoaviy o'yin — xona ochish ekrani. */
  onJamoa: (oyin: XonaOyin) => void;
}) {
  const ozStrelka = useOrqaga(onBack);
  // Bugun o'ynalganmi — karta shunga qarab ikki xil gapiradi.
  const bugun = maydonNatija();
  const [bolim, setBolim] = useState<Bolim>(bolimOl);
  const tanla = (b: Bolim) => {
    setBolim(b);
    try { localStorage.setItem(BOLIM_KALIT, b); } catch { /* jim */ }
  };

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-10 sm:max-w-[700px] lg:max-w-[1020px]">
      {/* Telegram ichida bu strelka chizilmaydi: u yerda nativ orqaga
          tugmasi bor va ikkitasi bir ekranda turganda odam har safar
          "qaysi biri to'g'ri?" deb o'ylardi (`lib/qobiq.ts`). */}
      {ozStrelka && (
        <button type="button" onClick={onBack} title={t("ortga")}
          className="clay-press grid size-[38px] place-items-center rounded-full bg-karta
                     text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}

      {/* Sarlavha YONMA-YON, ustma-ust emas.
          Markazga tizilgan katta belgi va uning ostidagi sarlavha
          ekranning uchdan birini yeb qo'yardi va asosiy ikkita
          tugma ekrandan tushib ketardi. Sahifaning maqsadi esa
          o'sha tugmalarda, sarlavhada emas. */}
      <div className="az-kirish mt-3 flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-[18px]
                         bg-brand-purple/15">
          <EmojiBelgi e="🧩" olcham={32} />
        </span>
        <span className="min-w-0">
          <h1 className="text-[19px] leading-tight">{t("oyinlarBolim")}</h1>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-soft">{t("oyinlarIzoh")}</p>
        </span>
      </div>

      {/* ---- Yakka / Jamoaviy ----
          Ilgari maydon va duel yonma-yon turardi ("yolg'iz yoki do'st
          bilan"). Jamoaviy o'yinlar qo'shilgach bu savol tabga aylandi:
          yakkada maydon va mashq, jamoaviyda duel va xona o'yinlari. */}
      <div role="tablist" className="az-kirish mt-4 flex rounded-full bg-track p-1">
        {(["yakka", "jamoaviy"] as Bolim[]).map((b) => (
          <button key={b} type="button" role="tab" aria-selected={bolim === b} onClick={() => tanla(b)}
            data-tahlil={`O'yinlar: ${b}`}
            className={`flex-1 rounded-full py-2.5 font-display text-[14.5px] transition-colors ${
              bolim === b ? "bg-karta text-ink shadow-clay-sm" : "text-ink-soft"}`}>
            {t(b === "yakka" ? "oyinYakka" : "oyinJamoaviy")}
          </button>
        ))}
      </div>

      {bolim === "yakka" ? (
        <>
          <div className="mt-4 grid grid-cols-2 items-stretch gap-2.5">
            <MaydonKarta bugun={bugun} onOch={onMaydon} />
            {/* Kunlik son — maydon bilan yonma-yon: ikkalasi ham "bugun bir marta". */}
            <Chorlov onOch={onKunlikSon} kech={60}
              rang={kunlikSonBugun() ? "bg-karta text-ink shadow-clay-sm" : "bg-brand-blue text-white shadow-clay"}
              quti={kunlikSonBugun() ? "bg-brand-green/15" : "bg-white/20"}
              belgi={kunlikSonBugun() ? "✅" : "🔢"}
              nom={t("kunlikSon")}
              izoh={kunlikSonBugun() ? t("kunlikSonYechildi") : t("kunlikSonIzoh")}
              yorliq="" />
          </div>

          {/* Tulki shaharchasi — tangani sarflaydigan joy va har kuni qaytish sababi. */}
          <button type="button" onClick={onShaharcha} data-tahlil="O'yinlar: shaharcha"
            className="az-kirish tugma-3d mt-2.5 flex w-full items-center gap-3 rounded-clay bg-brand-orange p-3
                       text-left text-white shadow-clay">
            <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-white/20">
              <EmojiBelgi e="🦊" olcham={28} jonli />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[15px] leading-tight">{t("shTitul")}</span>
              <span className="block text-[11.5px] opacity-90">{t("shIzoh")}</span>
            </span>
            <span className="text-[22px]">🏠🌳🏪</span>
          </button>

          <h2 className="az-kirish mt-6 mb-1.5 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
            {t("maydonMashq")}
          </h2>
          <p className="az-kirish mb-2.5 ml-1.5 text-[12px] leading-snug text-ink-soft/85">
            {t("maydonMashqIzoh")}
          </p>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {OYINLAR.map((o, i) => (
              <Karta key={o.id} o={o} i={i} onOch={() => onOyin(o.id)} />
            ))}
          </div>

          <p className="az-kirish mt-5 text-center text-[11.5px] leading-snug text-ink-soft/80">
            {t("oyinlarTagi")}
          </p>
        </>
      ) : (
        <>
          <p className="az-kirish mt-3 ml-1.5 text-[12.5px] leading-snug text-ink-soft">{t("jamoaviyIzoh")}</p>
          {/* Daraja va haftalik jadval — "dadamdan o'tib ketdim". */}
          <button type="button" onClick={onJadval} data-tahlil="O'yinlar: haftalik jadval"
            className="az-kirish clay-press mt-3 flex w-full items-center gap-3 rounded-clay bg-karta p-3 text-left shadow-clay-sm">
            <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-brand-gold/20">
              <EmojiBelgi e="🏆" olcham={24} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[14.5px] leading-tight">{t("tjJadval")}</span>
              <span className="block text-[11.5px] text-ink-soft">{t("tjMeningDaraja")} · {t("tjBirga")}</span>
            </span>
            <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
          </button>
          <div className="mt-3 grid grid-cols-2 items-stretch gap-2.5 lg:grid-cols-4">
            <DuelKarta onOch={onDuel} />
            {(Object.keys(XONA_OYINLAR) as XonaOyin[]).map((k, i) => {
              const m = XONA_OYINLAR[k];
              return (
                <Chorlov key={k} onOch={() => onJamoa(k)} kech={120 + i * 40}
                  rang="bg-karta text-ink shadow-clay-sm" quti="bg-brand-blue/15"
                  belgi={m.emoji} nom={t(m.nom)} izoh={t(m.izoh)}
                  yorliq={t("xonaKishi", { min: m.min, max: m.max })} yorliqRang="bg-track text-ink-soft" />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Bugungi maydon kartasi.
 *
 * IKKI XIL GAPIRADI va farq muhim:
 *
 *   o'ynalmagan  chaqiruv + QOLGAN VAQT ("6 soat qoldi"). Muddatsiz
 *                taklif "keyinroq" degan javobni oladi, muddatli esa
 *                bugun bosiladi.
 *   o'ynalgan    natija + "ertaga yangisi". Karta yo'qolmaydi: bugun
 *                qilingan ish ko'rinib turishi ham mukofotning bir
 *                qismi, va u ertaga qaytishni eslatib turadi.
 */
function MaydonKarta({ bugun, onOch }: {
  bugun: ReturnType<typeof maydonNatija>;
  onOch: () => void;
}) {
  const oynalgan = Boolean(bugun);
  return (
    <Chorlov
      onOch={onOch} kech={0}
      // O'ynab bo'lingandan keyin karta CHORLOV emas, XABAR bo'ladi:
      // to'yingan yashil "hozir bos" deb turadi va bosadigan narsa
      // qolmagan. Shuning uchun u oddiy karta rangiga qaytadi.
      rang={oynalgan ? "bg-karta text-ink shadow-clay-sm" : "bg-brand-green text-white shadow-clay"}
      quti={oynalgan ? "bg-brand-green/15" : "bg-white/20"}
      belgi={oynalgan ? "✅" : "🏟"} oq={!oynalgan} jonli={!oynalgan} halqa={!oynalgan}
      nom={oynalgan ? t("maydonBugunOynadingiz") : t("maydon")}
      izoh={oynalgan ? t("maydonNatijangiz", { n: bugun!.ball }) : t("maydonIzoh")}
      yorliq={oynalgan ? "" : t("maydonQolgan", { n: qolganSoat() })}
    />
  );
}

/**
 * Do'st bilan bellashuv kartasi.
 *
 * Maydonning YONIDA, ostida emas. Ikkalasi bir turdagi taklif —
 * "bugun bir marta" — va ular bir-birining muqobili: yolg'iz
 * o'ynaysizmi yoki do'st bilanmi. Ustma-ust turganda esa ular
 * ketma-ketlikdek o'qilardi.
 */
function DuelKarta({ onOch }: { onOch: () => void }) {
  // "Sizni 2 kishi kutyapti" — do'st o'ynab qo'ygan va javob kutyapti.
  // Kartadagi yagona yorliq shu: bu odatiy holat emas, qaytish sababi.
  const [navbat, setNavbat] = useState(0);
  useEffect(() => {
    let bekor = false;
    duelTaklifOl().then((h) => { if (!bekor && h) setNavbat(h.navbat); });
    return () => { bekor = true; };
  }, []);

  return (
    <Chorlov
      onOch={onOch} kech={90}
      rang="bg-brand-orange text-white shadow-clay" quti="bg-white/20"
      belgi="⚔️" oq jonli halqa
      nom={t("duel")} izoh={t("duelIzoh")}
      yorliq={navbat > 0 ? t("duelKutyaptiBelgi", { n: navbat }) : ""}
    />
  );
}

/**
 * Sahifaning ikkita asosiy chorlovi — bitta shakl.
 *
 * Ikkalasi alohida yozilsa, ular albatta bir-biridan chetga chiqib
 * ketardi: biriga yorliq qo'shiladi, ikkinchisining ichki bo'shlig'i
 * o'zgaradi va yonma-yon turgan ikkita tugma turli bo'yda bo'lib
 * qolardi. Bu yerda esa farq faqat rang va yozuvda.
 *
 * Bo'yi TENGLASHADI (`h-full` va `items-stretch`): yorliq faqat
 * bittasida bor va usiz ikkinchisi pastroq bo'lib qolardi.
 */
function Chorlov({
  onOch, kech: ms, rang, quti, belgi, oq, jonli, halqa, nom, izoh, yorliq, yorliqRang = "bg-white/25",
}: {
  onOch: () => void; kech: number; rang: string; quti: string;
  belgi: string; oq?: boolean; jonli?: boolean; halqa?: boolean;
  nom: string; izoh: string; yorliq: string;
  /** Yorliq foni — oq kartada shaffof oq ko'rinmaydi. */
  yorliqRang?: string;
}) {
  return (
    <button type="button" onClick={onOch}
      className={`az-kirish az-chorlov tugma-3d flex h-full w-full flex-col items-start gap-1.5
                  rounded-clay p-3 text-left ${halqa ? "az-yaltir " : ""}${rang}`}
      style={{ "--az-kech": `${ms}ms` } as CSSProperties}>
      <span className={`grid size-10 shrink-0 place-items-center rounded-[14px] ${quti}`}>
        <EmojiBelgi e={belgi} olcham={26} jonli={jonli}
          className={oq ? "hajmli-oq" : undefined} />
      </span>
      <span className="block font-display text-[14px] leading-tight">{nom}</span>
      {/* Izoh IKKI QATORGACHA. Uchinchi qator ikkala tugmani ham
          cho'zib, ro'yxatni ekrandan tushirib yuborardi. */}
      <span className="line-clamp-2 text-[11px] leading-snug opacity-85">{izoh}</span>
      {yorliq && (
        <span className={`mt-auto rounded-full ${yorliqRang} px-2 py-0.5 text-[10px]
                         whitespace-nowrap`}>
          {yorliq}
        </span>
      )}
    </button>
  );

}

/**
 * Bitta o'yin kartasi.
 *
 * Rekord ENG YAXSHISI ko'rsatiladi — qaysi darajada bo'lishidan qat'i
 * nazar. Uchala darajani birga chiqarish ham mumkin edi, lekin unda
 * kartada olti son turib, ro'yxat jadvalga aylanib qolardi. Daraja
 * bo'yicha to'liq hisob keyingi ekranda, tanlash paytida ko'rinadi —
 * ya'ni aynan kerak bo'lgan payt.
 */
function Karta({ o, i, onOch }: { o: Oyin; i: number; onOch: () => void }) {
  const rang = UNIT_COLORS[o.rang];
  const eng = Math.max(...DARAJALAR.map((d) => rekord(o.id, d.n)));
  // Rekord NOL bo'lsa izoh o'z o'rnida qoladi. "🏆 0" degan yozuv
  // hech narsa aytmaydi va faqat kartani xunuk qiladi: o'yin ochilib
  // yopilgan bo'lsa ham, odam uni hali o'ynamagan hisoblanadi.
  const bor = eng > 0;

  return (
    /* `title` SHART: kartaning ichida katta emoji va ikki qator yozuv
       bor, lekin tugmaning o'z nomi yo'q — ekran o'quvchi uni "tugma"
       deb o'qib, qaysi o'yin ekanini aytmasdi. */
    <button type="button" onClick={onOch} title={t(o.nom)}
      style={{ "--az-kech": `${60 + i * 45}ms` } as CSSProperties}
      className="az-kirish clay-press flex flex-col items-center gap-1.5 rounded-clay bg-karta
                 p-3 text-center shadow-clay-sm">
      {/* Rang KLASS bilan emas, uslub bilan beriladi. Tailwind
          klasslarni manba matnidan topib yasaydi, ya'ni `${rang.bg}/12`
          kabi yig'ilgan satr hech qachon CSS'ga tushmasdi va doira
          rangsiz qolardi. `road` — o'sha rangning HEX ko'rinishi. */}
      <span style={{ backgroundColor: `${rang.road}20` }}
        className="grid size-14 shrink-0 place-items-center rounded-[20px]">
        {/* Harakat ATAYLAB yo'q: bu yerda sakkizta karta yonma-yon
            turadi va hammasi birga qimirlasa ko'z hech biriga
            qadalmasdi. */}
        <EmojiBelgi e={o.emoji} olcham={38} />
      </span>

      <span className="font-display text-[13.5px] leading-tight text-ink">{t(o.nom)}</span>

      {bor ? (
        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-track px-2 py-0.5
                         text-[10.5px] leading-none text-ink-soft">
          <Icon name="trophy" size={11} className="text-brand-gold" />
          {eng}
        </span>
      ) : (
        <span className="text-[10.5px] leading-tight text-ink-soft/85">{t(o.izoh)}</span>
      )}
    </button>
  );
}
