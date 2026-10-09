/**
 * AI ustoz eshiklari — imtihon ro'yxati va natija ekranida.
 *
 * Nega kerak: AI ilgari faqat profildagi Premium kartasida va ko'rib
 * chiqishning ichida edi — odam uni deyarli topmasdi. testmakon.uz AI ni
 * aynan natija yonida ko'rsatadi ("har bir xatoyingiz keyingi mashqqa
 * aylanadi") va bu to'g'ri joy: odam AI ga natijasini ko'rgan paytda
 * muhtoj bo'ladi, menyuda emas.
 *
 * Ikkalasi ham ikkinchi darajali (neytral yoki och firuza) — ekrandagi
 * asosiy tugma o'zgarmaydi (dizayn qoidasi: bitta asosiy tugma).
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiBoshla, aiHolat, aiXatoMatni } from "../lib/ai";
import type { AiHolat, AiXatoKod } from "../lib/ai";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import { yolAiSuhbat, yolPremium } from "../lib/yollar";

/**
 * DTM / sertifikat ro'yxatida, natija kartasi ostida: zaif mavzular
 * bo'yicha 7 kunlik reja. Natijalar SERVERDA (`core/ai.py` →
 * `reja_konteksti`), shuning uchun bu yerdan hech narsa yuborilmaydi.
 *
 * Server javob bermasa yoki AI o'chiq bo'lsa (kalit yo'q) — karta umuman
 * chiqmaydi: ishlamaydigan narsani reklama qilish shovqin.
 */
export function AiRejaKarta({ tahlil }: { tahlil: string }) {
  const nav = useNavigate();
  const [h, setH] = useState<AiHolat | null>(null);
  const [band, setBand] = useState(false);
  const [xato, setXato] = useState<AiXatoKod | null>(null);

  useEffect(() => {
    let tirik = true;
    aiHolat().then((x) => { if (tirik) setH(x); }).catch(() => {});
    return () => { tirik = false; };
  }, []);

  if (!h?.yoqilgan) return null;

  const bos = async () => {
    tebrat("tanlov");
    if (!h.ochiq) { nav(yolPremium()); return; }
    setBand(true);
    setXato(null);
    const r = await aiBoshla("reja");
    setBand(false);
    if (r.ok) nav(yolAiSuhbat(r.qiymat.id));
    else if (r.kod === "premium") nav(yolPremium());
    else setXato(r.kod);
  };

  // Odatiy holat (Premium) belgisiz; faqat sinov va uning tugagani aytiladi.
  const holat = h.premium ? "" : h.ochiq ? t("aiBepulQolgan", { n: h.bepul_qolgan }) : t("aiPremiumda");

  return (
    <section className="flex flex-col gap-2.5 rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:p-[18px]"
      aria-label={t("aiSarlavha")}>
      <div className="flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sahna text-brand-blue shadow-ichki">
          <Icon name="izoh" size={18} />
        </span>
        <span className="min-w-0 flex-1 font-display text-[16px] leading-tight">{t("aiSarlavha")}</span>
        {holat && <span className="shrink-0 text-[12.5px] font-semibold text-ink-dim">{holat}</span>}
      </div>
      <p className="text-[14px] leading-snug text-ink-soft">{t("aiRejaIzoh")}</p>
      {xato && <p className="text-[13.5px] text-brand-red" role="alert">{aiXatoMatni(xato)}</p>}
      <button type="button" onClick={bos} disabled={band} data-tahlil={tahlil}
        className="clay-press min-h-11 self-start rounded-xl bg-brand-blue/10 px-4 text-[14.5px] font-bold
                   text-brand-blue-t disabled:opacity-60">
        {band ? t("aiYozyapti") : t("aiRejaTugma")}
      </button>
    </section>
  );
}

/**
 * Natija ekranida, "Ko'rib chiqish" ostida: xatolarni AI tushuntiradi.
 * Bosilganda ko'rib chiqish XATOLAR bilan ochiladi — har kartada
 * "AI tushuntirsin" bor (`KoribChiqish.tsx`). Xato bo'lmasa — chiqmaydi.
 */
export function AiNatijaKarta({ xato, onOch, tahlil }: { xato: number; onOch: () => void; tahlil: string }) {
  if (xato <= 0) return null;
  return (
    <button type="button" onClick={onOch} data-tahlil={tahlil}
      className="clay-press flex min-h-[60px] w-full items-center gap-3 rounded-[20px] bg-brand-blue/10 px-4 py-2.5
                 text-left">
      <Icon name="izoh" size={20} className="shrink-0 text-brand-blue-t" />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[16px] leading-tight">{t("aiNatijaSarlavha")}</span>
        <span className="block text-[13px] text-ink-dim">{t("aiNatijaIzoh", { n: xato })}</span>
      </span>
      <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
    </button>
  );
}
