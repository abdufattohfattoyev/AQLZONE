/**
 * IMTIHON PREMIUM — `/premium`.
 *
 * Bitta savol: "nimaga to'layman va qanday to'layman?". Shu tartibda:
 * holat (faol bo'lsa — qancha qoldi, soatlari bilan) → Bepul va Premium
 * farqi → tarif → karta raqami → bitta asosiy tugma "Chek rasmini yuborish".
 *
 * Chek SAYTNING O'ZIDA yuklanadi: saytni brauzerda ochgan odamda Telegram
 * bo'lmasligi mumkin va "botga yuboring" uning uchun berk ko'cha edi.
 * Bot — ikkinchi yo'l (faqat yozuv). Ikkalasida ham rasm adminga
 * "Tasdiqlash" tugmasi bilan boradi, javob esa bot orqali keladi
 * (`backend/core/premium.py`). Click/Payme ATAYLAB yo'q — egasining qarori.
 *
 * Bir ekranda bitta asosiy tugma: sinov, bot va admin — yozuv tugmalar.
 */
import { useRef, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { havolaniOch, tebrat, useOrqaga } from "../lib/qobiq";
import {
  BEPUL, TARIFLAR, botdaYubor, chekYukla, qolganMatn, sanaMatn, sinovOl, som,
  usePremium, useQolgan,
} from "../lib/premium";
import type { PremiumHolat, Tarif } from "../lib/premium";

const TARIF_NOMI: Record<Tarif, Kalit> = { "7kun": "premTarif7kun", "1oy": "premTarif1oy" };

export function Premium({ onBack, onOchildi }: { onBack: () => void; onOchildi: () => void }) {
  const ozStrelka = useOrqaga(onBack);
  const h = usePremium();
  // Oylik — tanlov oldindan shunda: kuniga arzonroq va imtihongacha odatda
  // bir haftadan ko'p qoladi.
  const [tarif, setTarif] = useState<Tarif>("1oy");
  const [nusxa, setNusxa] = useState(false);
  const [xato, setXato] = useState("");
  const [band, setBand] = useState(false);
  const fayl = useRef<HTMLInputElement>(null);

  const nusxala = async () => {
    if (!h?.karta) return;
    try {
      await navigator.clipboard.writeText(h.karta.replace(/\s+/g, ""));
      setNusxa(true);
      tebrat("tanlov");
    } catch { /* raqam ekranda ko'rinib turibdi */ }
  };
  const yukla = async (f: File | undefined) => {
    if (!f) return;
    setXato("");
    setBand(true);
    const kod = await chekYukla(tarif, f);
    setBand(false);
    if (fayl.current) fayl.current.value = "";
    if (kod) setXato(t(`premXato_${kod === "kop" ? "kop" : kod === "aloqa" ? "aloqa" : "rasm"}` as Kalit));
    else { tebrat("yutuq"); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const botda = async () => {
    setXato("");
    if (!(await botdaYubor(tarif))) setXato(t("premBotYoq"));
  };
  const sinov = async () => {
    setBand(true);
    const yangi = await sinovOl();
    setBand(false);
    if (yangi?.faol) { tebrat("yutuq"); onOchildi(); } else setXato(t("premSinovXato"));
  };

  const narx = h?.narxlar[tarif];

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-10 min-[360px]:px-[18px]">
      <div className="flex items-center gap-2.5">
        {ozStrelka && (
          <button type="button" onClick={onBack} title={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta text-ink-soft
                       shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="font-display text-[21px] leading-tight">{t("premSarlavha")}</h1>
      </div>
      {!h?.faol && <p className="text-[14.5px] leading-snug text-ink-soft">{t("premIzoh")}</p>}

      <Holat h={h} />

      <Farq bepul={h?.bepul ?? BEPUL} />

      <h2 className="mt-1 font-display text-[19px]">{h?.faol ? t("premUzaytirish") : t("premTarif")}</h2>
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label={t("premTarif")}>
        {TARIFLAR.map((k) => {
          const n = h?.narxlar[k];
          const faol = tarif === k;
          return (
            <button key={k} type="button" role="radio" aria-checked={faol} onClick={() => setTarif(k)}
              data-tahlil={`Premium: tarif ${k}`}
              className={`clay-press flex min-h-[92px] flex-col items-start justify-center gap-0.5 rounded-clay
                          bg-karta px-4 text-left shadow-clay-sm ${faol ? "outline-2 outline-brand-blue outline-solid" : ""}`}>
              <span className="font-display text-[15px] text-ink-soft">{t(TARIF_NOMI[k])}</span>
              <span className="font-display text-[19px] leading-tight font-bold">
                {n ? t("premSom", { n: som(n) }) : "—"}
              </span>
              {n && h && (
                <span className="text-[12.5px] text-ink-dim">{t("premKuniga", { n: som(n / h.kunlar[k]) })}</span>
              )}
            </button>
          );
        })}
      </div>

      {h && !h.karta ? (
        <p className="rounded-clay bg-karta p-4 text-[14.5px] leading-snug text-ink-soft shadow-clay-sm">
          {t("premYopiq")}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-clay bg-karta p-4 shadow-clay-sm">
            <div className="text-[13px] font-bold text-ink-dim">{t("premKarta")}</div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="min-w-0 flex-1 font-display text-[20px] leading-tight tracking-wide tabular-nums
                               whitespace-nowrap max-[340px]:text-[18px]">
                {h?.karta || "•••• •••• •••• ••••"}
              </span>
              <button type="button" onClick={nusxala} disabled={!h?.karta} data-tahlil="Premium: karta nusxasi"
                className="clay-press flex min-h-11 shrink-0 items-center rounded-xl bg-sahna px-3.5 text-[13.5px]
                           font-bold text-ink-soft shadow-ichki disabled:opacity-50">
                {nusxa ? t("premNusxalandi") : t("premNusxa")}
              </button>
            </div>
            {h?.karta_egasi && <div className="text-[14.5px] font-semibold text-ink-soft">{h.karta_egasi}</div>}
            <p className="text-[13px] leading-snug text-ink-dim">
              {t("premKartaIzoh", { narx: narx ? som(narx) : "—" })}
            </p>
          </div>

          <input ref={fayl} type="file" accept="image/*" hidden
            onChange={(e) => yukla(e.target.files?.[0])} />
          <button type="button" onClick={() => fayl.current?.click()} disabled={!h?.karta || band}
            data-tahlil="Premium: chek yuklash"
            className="tugma-3d min-h-12 rounded-2xl bg-brand-blue px-5 font-display text-[16px] font-bold text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)] disabled:opacity-60">
            {band ? t("premYuklanmoqda") : t("premChekYukla")}
          </button>
          <p className="-mt-1 text-center text-[12.5px] leading-snug text-ink-dim">{t("premChekIzoh")}</p>
          {xato && <p role="alert" className="text-center text-[13.5px] font-semibold text-ink-soft">{xato}</p>}

          <div className="flex flex-col">
            <button type="button" onClick={botda} data-tahlil="Premium: botda yuborish"
              className="clay-press min-h-11 rounded-2xl text-[14.5px] font-bold text-brand-blue-t">
              {t("premBotda")}
            </button>
            {h?.admin && (
              <button type="button" onClick={() => havolaniOch(h.admin)} data-tahlil="Premium: admin aloqa"
                className="clay-press min-h-11 rounded-2xl text-[14.5px] font-bold text-brand-blue-t">
                {t("premAdmin")}
              </button>
            )}
          </div>
        </>
      )}

      {h?.sinov_mumkin && (
        <button type="button" onClick={sinov} disabled={band} data-tahlil="Premium: sinov"
          className="clay-press min-h-11 rounded-2xl bg-karta text-[14.5px] font-bold text-ink-soft shadow-clay-sm
                     disabled:opacity-60">
          {t("premSinov", { n: h.sinov_kun })}
        </button>
      )}
    </div>
  );
}

/** Tepadagi holat: faol (qancha qoldi) · chek tekshirilmoqda · rad etilgan. */
function Holat({ h }: { h: PremiumHolat | null }) {
  const qolgan = useQolgan(h);
  if (!h) return null;
  return (
    <>
      {h.faol && (
        <div className="flex flex-col gap-1 rounded-clay bg-karta p-4 shadow-clay-sm">
          <div className="flex items-center gap-2">
            <Icon name="check" size={18} className="shrink-0 text-brand-green" />
            <span className="font-display text-[15px]">{t("premFaolSarlavha")}</span>
            {h.sinovda && (
              <span className="ml-auto rounded-full bg-sahna px-2.5 py-0.5 text-[12px] font-bold text-ink-soft">
                {t("premSinovda")}
              </span>
            )}
          </div>
          {/* Qolgan vaqt soatlari bilan — faqat sana odamni hisoblashga majbur qiladi. */}
          <div className="font-display text-[26px] leading-tight font-bold">
            {t("premQoldi", { vaqt: qolganMatn(qolgan) })}
          </div>
          <div className="text-[13px] text-ink-dim">{t("premGacha", { sana: sanaMatn(h.gacha) })}</div>
        </div>
      )}
      {h.kutilmoqda && (
        <div role="status" className="flex items-start gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
          <Icon name="clock" size={20} className="mt-0.5 shrink-0 text-brand-blue-t" />
          <span className="min-w-0">
            <span className="block font-display text-[15.5px] leading-tight">{t("premKutilmoqda")}</span>
            <span className="block text-[13px] text-ink-dim">
              {t("premKutilmoqdaIzoh", { tarif: t(TARIF_NOMI[h.kutilmoqda.tarif] ?? "premTarif1oy") })}
            </span>
          </span>
        </div>
      )}
      {h.rad_etilgan && !h.kutilmoqda && (
        <p className="rounded-clay bg-karta p-4 text-[14px] leading-snug text-ink-soft shadow-clay-sm">
          {t("premRadEtilgan")}
        </p>
      )}
    </>
  );
}

/**
 * Har imtihonda 12 variant (`lib/imtihon.ts`, `lib/sertifikat.ts`, `lib/qabul.ts`).
 * Son shu yerda yozilgan: o'sha fayllarni import qilish savol generatorlarini
 * ham Premium sahifasiga tortib kelardi.
 */
const JAMI_VARIANT = 12;

/** Bepul va Premium farqi — halol jadval: nima bepul qolishi ham yozilgan. */
function Farq({ bepul }: { bepul: number }) {
  const qatorlar: { nom: Kalit; b: string; p: string }[] = [
    { nom: "premFarqDtm", b: t("premTaTa", { n: bepul }), p: t("premTaTa", { n: JAMI_VARIANT }) },
    { nom: "premFarqSert", b: t("premTaTa", { n: bepul }), p: t("premTaTa", { n: JAMI_VARIANT }) },
    { nom: "premFarqQabul", b: t("premTaTa", { n: bepul }), p: t("premTaTa", { n: JAMI_VARIANT }) },
    { nom: "premFarqReyting", b: "—", p: "✓" },
    { nom: "premFarqTahlil", b: t("premFarqTahlil_", { n: bepul }), p: t("premFarqTahlil_", { n: JAMI_VARIANT }) },
    { nom: "premFarqDars", b: t("premFarqDarsQiymat"), p: t("premFarqDarsQiymat") },
  ];
  return (
    <section className="overflow-hidden rounded-clay bg-karta shadow-clay-sm" aria-label={t("premFarq")}>
      <h2 className="px-4 pt-3.5 pb-1 font-display text-[16px]">{t("premFarq")}</h2>
      <table className="w-full text-[13.5px]">
        <thead>
          <tr className="text-[12px] text-ink-dim">
            <th className="px-4 py-1.5 text-left font-semibold" />
            <th className="w-[22%] px-1 py-1.5 text-center font-semibold">{t("premBepulUst")}</th>
            <th className="w-[22%] px-1 py-1.5 pr-4 text-center font-bold text-brand-blue-t">{t("premPremiumUst")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-track">
          {qatorlar.map((q) => (
            <tr key={q.nom}>
              <td className="px-4 py-2.5 leading-snug text-ink-soft">{t(q.nom)}</td>
              <td className="px-1 py-2.5 text-center text-ink-dim">{q.b}</td>
              <td className="px-1 py-2.5 pr-4 text-center font-bold">{q.p}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
