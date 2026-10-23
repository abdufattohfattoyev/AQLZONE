/**
 * ABITURIYENT BOSH SAHIFASI — "Bugun" o'rnida, faqat abituriyentga
 * (`App.tsx` → BoshSahifasi, `yolOf(prof) === "abiturient"`).
 *
 * Nega alohida: "Bugun" 9 yoshli bola uchun qurilgan — dars, kunlik son,
 * haftalik sandiq. Abituriyentni bular qiziqtirmaydi, uning savoli
 * boshqa: "imtihongacha qancha qoldi, men qayerdaman, bugun nima
 * yechay?" (2026-10-23, testmakon bilan solishtirilgandan keyin).
 * Tartib shu savolga bo'ysunadi:
 *
 *   1. DTM gacha     kun va soat — har kirganda vaqt o'tayotgani ko'rinsin
 *   2. Maqsad        tanlangan OTM va grantgacha necha savol (`lib/kirish.ts`)
 *   3. Bugungi test  ekrandagi YAGONA firuza tugma: zaif mavzu testi
 *                    yoki (hali hech narsa bo'lmasa) Bilim xaritasi
 *   4. Testlar       to'rt eshik: DTM, sertifikat, mavzular, xarita
 *   5. Premium       faqat yo'q bo'lsa, eng pastda bitta qator
 *
 * Premium kirishdayoq "sotilmaydi" (testmakondagidan farqi): odam avval
 * o'z farqini ko'radi, taklif esa aynan bepul variant tugagan joyda —
 * bugungi test kartasining tugmasida chiqadi.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiRejaBugun } from "../components/AiRejaBugun";
import { PremiumQator } from "../components/PremiumVaraq";
import { Hajmli } from "../lib/hajmli";
import type { HajmliNom } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { xulosaOqi } from "../lib/diagnostika";
import {
  DTM_MAVZULAR, MAVZU_BEPUL, MAVZU_OLCHAM, MAVZU_VARIANTLAR, mavzuBySlug, mavzuEng, mavzuFoizi, mavzuNatijalari,
  mavzuSinxronla, zaifDtm,
} from "../lib/dtmMavzu";
import type { MavzuNatija } from "../lib/dtmMavzu";
import { daraja, sinxronla } from "../lib/imtihon";
import { ballYoz, hisobla, maqsadOqi } from "../lib/kirish";
import { t } from "../lib/matn";
import { ochiqmi, som, usePremium } from "../lib/premium";
import type { PremiumHolat } from "../lib/premium";
import { tebrat } from "../lib/qobiq";
import { useKompyuter } from "../lib/maket";
import {
  yolDiagnostika, yolImtMavzu, yolImtihon, yolKirish, yolPremium, yolQidiruv, yolSertifikat,
} from "../lib/yollar";

/**
 * Server javob bermaguncha (yoki kirmagan odamda) — taxminiy sana. Server
 * `dtm_sana` ni `.env` dan beradi (`settings.DTM_SANA`); izohi o'sha yerda.
 */
const DTM_SANA = "2027-07-14T08:00:00+05:00";

/** Qolgan vaqt — daqiqada bir yangilanadi (soniya kerak emas, shovqin). */
function useQolgan(sana: string) {
  const [hozir, setHozir] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setHozir(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const ms = Math.max(0, new Date(sana).getTime() - hozir);
  return { ms, kun: Math.floor(ms / 86_400_000), soat: Math.floor((ms % 86_400_000) / 3_600_000) };
}

interface Test {
  /** Mavzu testi bo'lsa — slug; yo'q bo'lsa Bilim xaritasi. */
  slug: string | null;
  nom: string;
  izoh: string;
  tugma: string;
  tahlil: string;
  on: () => void;
}

/**
 * BUGUNGI TEST — qaysi mavzu, qaysi variant.
 *
 *   hech narsa yo'q  → Bilim xaritasi: taxmin bilan mavzu tanlagandan ko'ra
 *                      26 savolda zaif joyni topish to'g'riroq
 *   zaif mavzu bor   → diagnostika "takrorla" degan, keyin DTM variantlarida
 *                      ko'p xato qilingan mavzu (`zaifDtm`)
 *   zaif yo'q        → hali ishlanmagan birinchi mavzu, hammasi ishlangan
 *                      bo'lsa — foizi eng pasti
 *
 * Variant — mavzuning hali ishlanmagan birinchisi; hammasi ishlangan bo'lsa
 * eng yomon natijalisi qaytadan. Yopiq variant (har mavzuda faqat
 * birinchisi bepul) — tugma Premium'ga olib boradi: taklif aynan kerak
 * bo'lgan joyda, ekran tepasida emas.
 */
function bugungiTest(royxat: MavzuNatija[], h: PremiumHolat | null, nav: (y: string) => void): Test {
  const xulosa = xulosaOqi();
  const zaif = [...(xulosa?.takror ?? []), ...zaifDtm().map((z) => z.slug)].filter((s) => mavzuBySlug(s));
  if (!xulosa && !zaif.length && !royxat.length) {
    return {
      slug: null, nom: t("abtDiagnostika"), izoh: t("abtDiagnostikaIzoh"), tugma: t("bugunAmalBoshlash"),
      tahlil: "Abituriyent: bugungi test — xarita", on: () => nav(yolDiagnostika()),
    };
  }
  let slug = zaif[0];
  if (!slug) {
    const foizlar = DTM_MAVZULAR.map((m) => ({ s: m.slug, f: mavzuFoizi(royxat, m.slug) }));
    slug = (foizlar.find((x) => x.f === null) ?? foizlar.sort((a, b) => (a.f ?? 0) - (b.f ?? 0))[0])!.s;
  }
  const m = mavzuBySlug(slug)!;
  const ishlangan = Array.from({ length: MAVZU_VARIANTLAR }, (_, i) => mavzuEng(royxat, slug, i + 1));
  const bosh = ishlangan.findIndex((x) => !x);
  const n = bosh >= 0 ? bosh + 1
    : ishlangan.reduce((eng, x, i) => (x && x.togri < (ishlangan[eng - 1]?.togri ?? Infinity) ? i + 1 : eng), 1);
  const ochiq = ochiqmi(h, n, MAVZU_BEPUL);
  return {
    slug,
    nom: t(m.nom),
    // Variantdagi chiziqcha bo'linmaydigan (U+2011): tor ekranda "1-" va
    // "variant" ikki qatorga ajralib qolardi.
    izoh: ochiq
      ? `${t(zaif.length ? "abtZaifMavzu" : "abtYangiMavzu", { n: MAVZU_OLCHAM.savol })} · ${t("abtVariant", { n }).replace("-", "‑")}`
      : t("abtBepulTugadi"),
    tugma: ochiq ? t("bugunAmalBoshlash") : t("abtPremiumOch"),
    tahlil: ochiq ? "Abituriyent: bugungi test" : "Abituriyent: bugungi test — premium",
    on: () => nav(ochiq ? yolImtMavzu(slug, n) : yolPremium()),
  };
}

export function Abituriyent() {
  const nav = useNavigate();
  const kompyuter = useKompyuter();
  const h = usePremium();
  const { ms, kun, soat } = useQolgan(h?.dtm_sana || DTM_SANA);

  // Tarix serverdan ham keladi (telefon almashgan bo'lsa) — kelguncha qurilmadagisi.
  const [royxat, setRoyxat] = useState<MavzuNatija[]>(() => mavzuNatijalari());
  const [foiz, setFoiz] = useState<number | null>(() => daraja()?.foiz ?? null);
  useEffect(() => {
    let tirik = true;
    mavzuSinxronla().then((x) => { if (tirik) setRoyxat(x); }).catch(() => {});
    sinxronla().then((x) => { if (tirik && x && x.ortacha !== null) setFoiz(x.ortacha); }).catch(() => {});
    return () => { tirik = false; };
  }, []);

  const yur = (yol: string) => { tebrat("tanlov"); nav(yol); };
  const test = bugungiTest(royxat, h, yur);

  /* ─── 1. Sarlavha: salom o'rniga maqsad nomi — ekran nima haqida ekani. ─── */
  const sarlavha = (
    <header className="flex min-h-[52px] items-center gap-2">
      <h1 className="min-w-0 flex-1 font-display text-[22px] leading-tight min-[360px]:text-[24px] md:text-[28px]">
        {t("abtSarlavha")}
      </h1>
      <button type="button" onClick={() => yur(yolQidiruv())} aria-label={t("qidiruvNom")} data-tahlil="Abituriyent: qidiruv"
        className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta text-ink shadow-clay-sm">
        <Icon name="search" size={20} />
      </button>
    </header>
  );

  /* ─── 2. DTM gacha. Raqamlar katta, qolgani yordamchi. Amber emas —
     u mukofot rangi; vaqt neytral, faqat raqam firuza. ─── */
  const hisoblagich = (
    <section aria-label={t("abtDtmgacha")}
      className="flex items-center gap-3 rounded-[22px] bg-karta px-4 py-3.5 shadow-clay-sm min-[360px]:px-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-sahna text-brand-blue-t">
        <Icon name="clock" size={22} />
      </span>
      {ms > 0 ? (
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="text-[13px] font-bold text-ink-dim">{t("abtDtmgacha")}</span>
          <span className="font-display text-[22px] font-bold whitespace-nowrap min-[360px]:text-[24px]">
            <span className="text-brand-blue-t">{kun}</span> <span className="text-[16px] text-ink-soft">{t("abtKun")}</span>
            {" "}
            <span className="text-brand-blue-t">{soat}</span> <span className="text-[16px] text-ink-soft">{t("abtSoat")}</span>
          </span>
          {/* 320px da sig'maydi va raqami kesilib qolardi — tor ekranda yashiriladi. */}
          <span className="hidden truncate text-[12.5px] text-ink-dim min-[360px]:block">{t("abtKunIzoh", { n: kun })}</span>
        </span>
      ) : (
        <span className="font-display text-[18px]">{t("abtBoshlandi")}</span>
      )}
    </section>
  );

  /* ─── 3. Maqsad: KirishKarta bilan bir xil hisob, lekin katta raqam va
     chiziq bilan — bosh sahifada aynan shu son kamayib borishi kerak. ─── */
  const m = maqsadOqi();
  const hs = m && foiz !== null ? hisobla(m.y, foiz, m.boshqa) : null;
  const chegara = m ? (m.y.grant || m.y.kontrakt) : 0;
  const savolQoldi = hs ? (m!.y.grant ? hs.grantSavol : hs.kontraktSavol) : null;
  const maqsad = (
    <button type="button" onClick={() => yur(yolKirish())} data-tahlil={m ? "Abituriyent: maqsad" : "Abituriyent: maqsad (yangi)"}
      className="clay-press flex w-full items-center gap-3 rounded-[22px] bg-karta px-4 py-3.5 text-left shadow-clay-sm
                 min-[360px]:px-5">
      <span className="shrink-0"><Hajmli nom="nishon" olcham={40} /></span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 leading-tight">
        {m ? (
          <>
            <span className="truncate text-[12.5px] font-bold text-ink-dim">{m.y.otm}</span>
            <span className="truncate font-display text-[16px]">{m.y.nomi}</span>
            {hs ? (
              <>
                <span className={`text-[14px] font-bold ${savolQoldi === 0 ? "text-brand-green-d" : "text-brand-blue-t"}`}>
                  {savolQoldi === null ? t("kirishKartaYetmaydi") : savolQoldi === 0 ? t("kirishKartaYetdi")
                    : t("abtSavolQoldi", { g: t(m.y.grant ? "kirishGrantgacha" : "kirishKontraktgacha"), n: savolQoldi })}
                </span>
                <span className="mt-0.5 block h-1.5 overflow-hidden rounded-full bg-track" aria-hidden>
                  <span className={`block h-full rounded-full ${savolQoldi === 0 ? "bg-brand-green" : "bg-brand-blue"}`}
                    style={{ width: `${Math.max(4, Math.min(100, Math.round((hs.ball / chegara) * 100)))}%` }} />
                </span>
                <span className="text-[12px] text-ink-dim">{t("abtBall", { b: ballYoz(hs.ball), c: ballYoz(chegara) })}</span>
              </>
            ) : (
              <span className="text-[13px] text-ink-dim">{t("abtMaqsadNatijaYoq")}</span>
            )}
          </>
        ) : (
          <>
            <span className="font-display text-[16px]">{t("abtMaqsadTanla")}</span>
            <span className="text-[13px] text-ink-dim">{t("abtMaqsadTanlaIzoh")}</span>
          </>
        )}
      </span>
      <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
    </button>
  );

  /* ─── 4. Bugungi test — ekrandagi yagona to'ldirilgan tugma. Karta
     o'zi bosilmaydi (Bosh dagi kabi): tasodifiy tegish testni ochmasin. ─── */
  const bugungi = (
    <section aria-label={t("abtBugungiTest")}
      className="relative flex flex-col gap-3 overflow-hidden rounded-[26px] bg-karta p-5 shadow-clay md:p-6">
      <span className="az-suzish pointer-events-none absolute top-4 right-4">
        <Hajmli nom={test.slug ? "kitob" : "diagramma"} olcham={52} jonli />
      </span>
      <span className="flex flex-col gap-1 pr-16">
        <span className="text-[13px] font-bold text-brand-blue-t">{t("abtBugungiTest")}</span>
        <span className="font-display text-[22px] leading-[1.15] font-bold min-[360px]:text-[24px]">{test.nom}</span>
        <span className="text-[14px] leading-snug text-ink-soft">{test.izoh}</span>
      </span>
      <button type="button" onClick={test.on} data-tahlil={test.tahlil}
        className="tugma-3d flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[16px] bg-brand-blue px-6
                   font-display text-[17px] font-bold text-white
                   shadow-[0_4px_0_var(--color-brand-blue-d),0_12px_24px_-10px_var(--color-brand-blue)]">
        {test.tugma}
        <Icon name="chevron" size={18} />
      </button>
    </section>
  );

  /* ─── 5. Testlar — to'rt eshik. 3D belgi faqat shu yerda (bosh sahifa
     eshiklari, dizayn qoidasi). Tor ekranda ham ikki ustun: izoh bir qator. ─── */
  const eshiklar: { belgi: HajmliNom; nom: string; izoh: string; yol: string; tahlil: string }[] = [
    { belgi: "qumSoat", nom: t("abtDtmSinov"), izoh: t("abtDtmSinovIzoh"), yol: yolImtihon(), tahlil: "Abituriyent: DTM" },
    { belgi: "kubok", nom: t("abtSertifikat"), izoh: t("abtSertifikatIzoh"), yol: yolSertifikat(), tahlil: "Abituriyent: sertifikat" },
    { belgi: "kitob", nom: t("abtMavzular"), izoh: t("abtMavzularIzoh"), yol: yolImtihon(), tahlil: "Abituriyent: mavzu testlari" },
    { belgi: "diagramma", nom: t("abtXarita"), izoh: xulosaOqi() ? `${xulosaOqi()!.umumiy}%` : t("abtXaritaIzoh"),
      yol: yolDiagnostika(), tahlil: "Abituriyent: bilim xaritasi" },
  ];
  const testlar = (
    <section aria-label={t("abtTestlar")} className="flex flex-col gap-2.5">
      <h2 className="font-display text-[19px]">{t("abtTestlar")}</h2>
      <div className="grid grid-cols-2 gap-2.5 min-[360px]:gap-3 lg:grid-cols-4">
        {eshiklar.map((e) => (
          <button key={e.tahlil} type="button" onClick={() => yur(e.yol)} data-tahlil={e.tahlil}
            className="clay-press flex min-h-[64px] min-w-0 items-center gap-2 rounded-clay bg-karta p-2.5 text-left
                       shadow-clay-sm min-[360px]:gap-2.5 min-[360px]:p-3">
            <span className="shrink-0"><Hajmli nom={e.belgi} olcham={34} /></span>
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-display text-[14px] leading-tight min-[360px]:text-[15px]">{e.nom}</span>
              {/* Kesilmaydi: "30 savol · 60 da…" 320px da ma'nosiz bo'lardi. */}
              <span className="mt-0.5 text-[12px] leading-snug text-ink-dim">{e.izoh}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <div className={`mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-3.5 pt-3.5 pb-4 min-[360px]:gap-4
                     min-[360px]:px-[18px] min-[360px]:pt-5 sm:max-w-[560px] md:max-w-[1120px] md:gap-5 md:px-8
                     md:pt-7 ${kompyuter ? "pb-14" : ""}`}>
      {sarlavha}
      <div className="grid grid-cols-1 items-start gap-3.5 min-[360px]:gap-4 md:grid-cols-2 md:gap-5">
        <div className="flex flex-col gap-3.5 min-[360px]:gap-4 md:gap-5">
          {hisoblagich}
          {maqsad}
        </div>
        {bugungi}
      </div>
      {/* AI reja bo'lsa — uning bugungi ishi (reja yo'q bo'lsa o'zi chiqmaydi). */}
      <AiRejaBugun />
      {testlar}
      {/* Premium yo'q odamga — bitta qator, eng pastda. Bor bo'lsa — qolgan muddati. */}
      {h && !h.faol && !h.kutilmoqda ? (
        <button type="button" onClick={() => yur(yolPremium())} data-tahlil="Abituriyent: premium taklif"
          className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta p-3.5 text-left shadow-clay-sm">
          <span className="shrink-0"><Hajmli nom="toj" olcham={34} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] leading-tight">{t("abtPremiumTaklif")}</span>
            <span className="block truncate text-[13px] text-ink-dim">
              {t("premOlishIzoh", { narx: som(h.narxlar["7kun"]) })}
            </span>
          </span>
          <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
        </button>
      ) : <PremiumQator />}
    </div>
  );
}
