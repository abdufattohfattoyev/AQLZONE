/**
 * AI ustoz suhbati — `/ai/:id` sahifasida ham, ko'rib chiqish ustidagi
 * oynada ham (`AiOyna`) bir xil.
 *
 * Nega oyna, sahifa emas: imtihondan keyingi natija va ko'rib chiqish
 * xotirada turadi (`Blok.tsx`). Tushuntirish uchun boshqa sahifaga o'tilsa,
 * qaytganda natija yo'qolardi — odam esa ketma-ket bir nechta xatosini
 * so'ramoqchi.
 *
 * Ranglar: odamning xabari — neytral botiq (`bg-sahna`), AI javobi — karta.
 * Firuza faqat yuborish tugmasida (bitta asosiy amal). Qizil — faqat javob
 * olinmaganda (xato holati).
 *
 * Javob oddiy matn (`whitespace-pre-wrap`): server modelga LaTeX va
 * Markdown ishlatmaslikni aytadi, formulalar x², √x ko'rinishida keladi.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiBoshla, aiDavom, aiQayta, aiXatoMatni, useSuhbat } from "../lib/ai";
import type { AiSuhbat, AiXatoKod, XatoSavol } from "../lib/ai";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import { yolPremium } from "../lib/yollar";

/** Premiumsiz odamga — nima olishini aytadigan karta va bitta asosiy tugma. */
export function AiPremiumTaklif() {
  const nav = useNavigate();
  return (
    <section className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
      <div className="flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-blue/15 text-brand-blue">
          <Icon name="izoh" size={18} />
        </span>
        <h2 className="font-display text-[17px] leading-tight">{t("aiPremiumSarlavha")}</h2>
      </div>
      <p className="text-[14.5px] leading-snug text-ink-soft">{t("aiPremiumIzoh")}</p>
      <button type="button" onClick={() => nav(yolPremium())} data-tahlil="AI: premium taklif"
        className="tugma-3d min-h-12 rounded-2xl bg-brand-blue text-[15px] font-bold text-white">
        {t("aiPremiumTugma")}
      </button>
    </section>
  );
}

/** Xabarlar va yozish maydoni. */
export function AiChat({ id, boshlangich }: { id: number; boshlangich?: AiSuhbat | null }) {
  const { s, yangila, kutilmoqda, topilmadi } = useSuhbat(id, boshlangich);
  const [matn, setMatn] = useState("");
  const [xato, setXato] = useState<AiXatoKod | null>(null);
  const [band, setBand] = useState(false);
  const oxiri = useRef<HTMLDivElement>(null);

  const soni = s?.xabarlar.length ?? 0;
  const oxirgiHolat = s?.xabarlar[soni - 1]?.holat;
  useEffect(() => {
    oxiri.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [soni, oxirgiHolat]);

  if (topilmadi) return <p className="p-4 text-center text-[14.5px] text-ink-dim">{t("aiJavobXato")}</p>;
  if (!s) return <p className="p-4 text-center text-[14.5px] text-ink-dim">{t("yuklanyapti")}</p>;

  const yubor = async () => {
    const m = matn.trim();
    if (!m || band || kutilmoqda) return;
    setBand(true);
    setXato(null);
    const r = await aiDavom(s.id, m);
    setBand(false);
    if (r.ok) { setMatn(""); yangila(r.qiymat); tebrat("tanlov"); } else setXato(r.kod);
  };
  const qayta = async () => {
    setXato(null);
    const r = await aiQayta(s.id);
    if (r.ok) yangila(r.qiymat); else setXato(r.kod);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {s.tur === "xato" && s.kontekst.savol && (
        <div className="rounded-[18px] bg-sahna px-4 py-3 text-[14.5px] leading-snug shadow-ichki">
          <p className="whitespace-pre-wrap">{s.kontekst.savol}</p>
          {s.kontekst.sizniki && <p className="mt-1.5 text-brand-red">{t("korishSizniki", { j: s.kontekst.sizniki })}</p>}
          <p className="font-bold text-brand-green-d">{t("korishTogri", { j: s.kontekst.togri ?? "" })}</p>
        </div>
      )}

      <div className="flex flex-col gap-2.5" aria-live="polite">
        {s.xabarlar.map((x) => {
          if (x.rol === "user") {
            // Xato va reja turida birinchi xabar bo'sh — mazmuni kontekstda.
            if (!x.matn && !(s.rasm && x === s.xabarlar[0])) return null;
            return (
              <div key={x.id} className="ml-8 self-end rounded-[18px] rounded-br-md bg-sahna px-3.5 py-2.5
                                         text-[14.5px] leading-snug shadow-ichki">
                {s.rasm && x === s.xabarlar[0] && (
                  <span className="mb-1 block text-[12.5px] font-semibold text-ink-dim">{t("aiRasmBilan")}</span>
                )}
                <p className="whitespace-pre-wrap break-words">{x.matn}</p>
              </div>
            );
          }
          if (x.holat === "kutilmoqda") {
            return (
              <div key={x.id} className="mr-8 flex items-center gap-2 self-start rounded-[18px] rounded-bl-md
                                         bg-karta px-3.5 py-3 text-[14px] text-ink-dim shadow-clay-sm">
                <span className="size-2 animate-pulse rounded-full bg-brand-blue" aria-hidden />
                {t("aiYozyapti")}
              </div>
            );
          }
          if (x.holat === "xato") {
            return (
              <div key={x.id} className="mr-8 flex flex-col items-start gap-2 self-start rounded-[18px] rounded-bl-md
                                         bg-karta px-3.5 py-3 text-[14px] shadow-clay-sm">
                <span className="text-brand-red">{t("aiJavobXato")}</span>
                <button type="button" onClick={qayta} data-tahlil="AI: qayta urinish"
                  className="clay-press min-h-11 rounded-xl bg-sahna px-4 font-bold text-brand-blue-t shadow-ichki">
                  {t("aiQayta")}
                </button>
              </div>
            );
          }
          return (
            <div key={x.id} className="mr-4 self-start rounded-[18px] rounded-bl-md bg-karta px-3.5 py-3
                                       text-[15px] leading-relaxed shadow-clay-sm">
              <p className="whitespace-pre-wrap break-words">{x.matn}</p>
            </div>
          );
        })}
        <div ref={oxiri} />
      </div>

      <p className="text-center text-[12px] text-ink-dim">{t("aiEslatma")}</p>

      {xato && <p className="text-center text-[13.5px] text-brand-red" role="alert">{aiXatoMatni(xato)}</p>}

      <div className="sticky bottom-0 -mx-1 flex items-end gap-2 bg-[var(--az-body)] px-1 pt-1
                      pb-[max(8px,env(safe-area-inset-bottom))]">
        <textarea value={matn} onChange={(e) => setMatn(e.target.value)} rows={1} maxLength={2000}
          placeholder={t("aiYozing")} aria-label={t("aiYozing")}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); yubor(); } }}
          className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl bg-karta px-3.5 py-3 text-[15px]
                     shadow-clay-sm outline-none focus:outline-2 focus:outline-brand-blue" />
        <button type="button" onClick={yubor} disabled={!matn.trim() || band || kutilmoqda}
          aria-label={t("aiYuborish")} title={t("aiYuborish")} data-tahlil="AI: yuborish"
          className="clay-press grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-blue text-white
                     disabled:opacity-45">
          <Icon name="send" size={20} />
        </button>
      </div>
    </div>
  );
}

/**
 * Ko'rib chiqish ustidagi oyna: ochilishi bilan xato savol bo'yicha suhbat
 * boshlanadi. Premiumsiz odam — taklif kartasini ko'radi.
 */
export function AiOyna({ savol, onYop }: { savol: XatoSavol; onYop: () => void }) {
  const [s, setS] = useState<AiSuhbat | null>(null);
  const [xato, setXato] = useState<AiXatoKod | null>(null);
  const boshlandi = useRef(false);

  useEffect(() => {
    // StrictMode effektni ikki marta chaqiradi — suhbat ikki marta ochilib,
    // chegaradan ikki javob ketmasin.
    if (boshlandi.current) return;
    boshlandi.current = true;
    aiBoshla("xato", { kontekst: savol }).then((r) => (r.ok ? setS(r.qiymat) : setXato(r.kod)));
  }, [savol]);

  return (
    <div className="az-kanal-fon fixed inset-0 z-[80] flex items-end justify-center bg-black/45 backdrop-blur-[2px]"
      role="dialog" aria-modal="true" aria-label={t("aiSarlavha")} onClick={onYop}>
      <div onClick={(e) => e.stopPropagation()}
        className="az-varaq flex h-[88vh] w-full max-w-[560px] flex-col rounded-t-[28px] bg-[var(--az-body)]
                   px-4 pt-3 shadow-clay">
        <span aria-hidden className="mx-auto h-1 w-10 shrink-0 rounded-full bg-track" />
        <div className="mt-2 mb-3 flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-2xl bg-brand-blue/15 text-brand-blue">
            <Icon name="izoh" size={18} />
          </span>
          <h2 className="flex-1 font-display text-[17px] leading-tight">{t("aiSarlavha")}</h2>
          <button type="button" onClick={onYop} aria-label={t("yopish")} data-tahlil="AI: oynani yopish"
            className="clay-press grid size-11 shrink-0 place-items-center rounded-full bg-karta text-ink-dim shadow-clay-sm">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {xato === "premium" ? <AiPremiumTaklif />
            : xato ? <p className="p-4 text-center text-[14.5px] text-ink-soft" role="alert">{aiXatoMatni(xato)}</p>
            : s ? <AiChat id={s.id} boshlangich={s} />
            : <p className="p-4 text-center text-[14.5px] text-ink-dim">{t("aiYozyapti")}</p>}
        </div>
      </div>
    </div>
  );
}
