/**
 * VARIANTLAR TO'RI — DTM aralash variantlari va mavzu testlari uchun bitta.
 *
 * ─────────────── NEGA SAHIFALAB ───────────────
 *
 * 12 variant 4×3 to'rga sig'ardi. 30 tasi telefonda olti qator, 100 tasi
 * esa yigirma qator bo'lardi — eslatma ham, boshqa bo'limlar ham ekran
 * tagida yo'qolardi. Shuning uchun to'r `sahifa` tadan bo'linadi va
 * tepada oraliq tanlovi turadi: "1–20 · 21–40 · …". Variantlar kam
 * bo'lsa tanlov umuman chiqmaydi.
 *
 * Ochilganda KEYINGI ishlanmagan ochiq variant turgan oraliq tanlanadi va
 * * u katak firuza hoshiya (`outline` — soya `ring` ni bosib ketardi) bilan belgilanadi — 100 ta raqam ichidan "endi
 * qaysi birini?" deb qidirish kerak bo'lmasin. Bu ekrandagi asosiy tugma
 * emas, faqat ishora: to'ldirilgan rang ishlatilmaydi.
 *
 * Katakda uch narsa: raqam · natija (yoki qulf) · eng yaxshi natija chizig'i.
 */
import { useState } from "react";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import { QulfBelgi } from "./PremiumVaraq";

export function VariantTor({ soni, sahifa = 20, yopiqmi, natija, onTanla, tahlil, ichki = false }: {
  soni: number;
  /** Bir oraliqda nechta katak (5 ustun × 4 qator = 20). */
  sahifa?: number;
  yopiqmi: (n: number) => boolean;
  /** Shu variantdagi eng yaxshi natija (ishlanmagan bo'lsa — `null`). */
  natija: (n: number) => { togri: number; jami: number } | null;
  onTanla: (n: number) => void;
  /** `data-tahlil` boshi: "Imtihon" → "Imtihon: 5-variant". */
  tahlil: string;
  /** Karta ichidagi to'r (mavzu testi) — kataklar botiq, fon kartaniki. */
  ichki?: boolean;
}) {
  const raqamlar = Array.from({ length: soni }, (_, i) => i + 1);
  const keyingi = raqamlar.find((n) => !yopiqmi(n) && !natija(n)) ?? null;
  const oraliqlar = Math.ceil(soni / sahifa);
  const [joriy, setJoriy] = useState(() => (keyingi ? Math.floor((keyingi - 1) / sahifa) : 0));
  const korinadi = raqamlar.slice(joriy * sahifa, (joriy + 1) * sahifa);
  const ishlangan = raqamlar.filter((n) => natija(n)).length;

  return (
    <div className="flex flex-col gap-2.5">
      {oraliqlar > 1 && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]" role="tablist">
          {Array.from({ length: oraliqlar }, (_, i) => {
            const bosh = i * sahifa + 1;
            const oxir = Math.min(soni, (i + 1) * sahifa);
            const faol = i === joriy;
            return (
              <button key={i} type="button" role="tab" aria-selected={faol} data-tahlil={`${tahlil}: oraliq`}
                onClick={() => { if (!faol) { tebrat("tanlov"); setJoriy(i); } }}
                className={`clay-press min-h-10 shrink-0 rounded-full px-3.5 font-display text-[14px] font-bold ${
                  faol ? "bg-brand-blue/12 text-brand-blue-t ring-1 ring-brand-blue/40"
                    : ichki ? "bg-sahna text-ink-soft shadow-ichki" : "bg-karta text-ink-soft shadow-clay-sm"}`}>
                {bosh}–{oxir}
              </button>
            );
          })}
        </div>
      )}

      {/* Karta ichida 6 ustun (oraliq 12 ta — ikki to'liq qator): 5 ustunda
          6-variant yolg'iz qolardi. 360px dan tor ekranda 3 ustun. */}
      <div className={`grid gap-2 ${ichki ? "grid-cols-3 min-[360px]:grid-cols-6" : "grid-cols-5 kom:gap-3"}`}>
        {korinadi.map((n) => {
          const eng = natija(n);
          const yopiq = yopiqmi(n);
          const foiz = eng && eng.jami ? Math.round((100 * eng.togri) / eng.jami) : 0;
          return (
            <button key={n} type="button" onClick={() => onTanla(n)} data-tahlil={`${tahlil}: ${n}-variant`}
              aria-label={t(yopiq ? "premQulfli" : "imtihonVariant", { n })}
              className={`clay-press relative flex min-h-[58px] flex-col items-center justify-center gap-0.5
                          overflow-hidden rounded-[16px] pb-1
                          ${ichki ? "bg-sahna shadow-ichki" : "bg-karta shadow-clay-sm kom:min-h-[76px]"}
                          ${n === keyingi ? "outline-2 -outline-offset-2 outline-brand-blue" : ""}`}>
              <span className={`font-display text-[17px] leading-tight font-bold ${yopiq ? "text-ink-dim" : ""}
                                ${ichki ? "" : "kom:text-[21px]"}`}>{n}</span>
              {yopiq ? <QulfBelgi /> : (
                <span className="text-[12px] leading-none text-ink-dim">{eng ? `${eng.togri}/${eng.jami}` : "—"}</span>
              )}
              {eng && (
                <span aria-hidden className="absolute inset-x-2 bottom-1.5 h-1 overflow-hidden rounded-full bg-track">
                  <span className="block h-full rounded-full bg-brand-blue" style={{ width: `${foiz}%` }} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {ishlangan > 0 && (
        <div className="text-[12.5px] text-ink-dim">{t("imtMavzuIshlandi", { a: ishlangan, b: soni })}</div>
      )}
    </div>
  );
}
