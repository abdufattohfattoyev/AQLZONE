/**
 * Tajriba darajasi — jamoaviy o'yinlarga qaytish sababi.
 *
 * Daraja FAQAT oshadi (mag'lub ham ochko oladi), shuning uchun bu yerda
 * qizil rang yoki "yo'qotdingiz" yo'q: har o'yin chiziqni oldinga suradi.
 */
import { useEffect, useState } from "react";
import type { TajribaDaraja } from "../../lib/api";
import { t } from "../../lib/matn";
import type { Kalit } from "../../lib/matn";

export const darajaNomi = (d: number) => t(`tjD${Math.min(5, Math.max(0, d))}` as Kalit);
export const DARAJA_BELGI = ["🌱", "🔍", "📘", "🛠", "🏅", "👑"];

function foiz(d: TajribaDaraja): number {
  if (d.keyingi === null) return 100;
  return Math.round(((d.ochko - d.oldingi) / (d.keyingi - d.oldingi)) * 100);
}

/** Chiziq: `oldin` dan `keyin` ga silliq to'ladi. */
export function DarajaChiziq({ oldin, keyin, qoshildi }: {
  oldin?: TajribaDaraja; keyin: TajribaDaraja; qoshildi?: number;
}) {
  const oshdi = oldin !== undefined && keyin.daraja > oldin.daraja;
  const [en, setEn] = useState(oldin && !oshdi ? foiz(oldin) : foiz(keyin));
  useEffect(() => {
    const id = window.setTimeout(() => setEn(foiz(keyin)), 350);
    return () => window.clearTimeout(id);
  }, [keyin]);

  return (
    <div className="rounded-clay bg-karta p-3.5 text-left shadow-clay-sm">
      {oshdi && (
        <div className="az-kirish mb-2.5 rounded-clay bg-brand-gold/25 px-3 py-2 text-center font-display
                        text-[14.5px] text-brand-gold-d">
          🎉 {t("tjYangiDaraja", { nom: darajaNomi(keyin.daraja) })}
        </div>
      )}
      <div className="flex items-center gap-2.5">
        <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-brand-blue/15 text-[22px]">
          {DARAJA_BELGI[keyin.daraja] ?? "⭐"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] leading-tight">{darajaNomi(keyin.daraja)}</span>
          <span className="block text-[11.5px] text-ink-soft">
            {keyin.keyingi === null
              ? t("tjEngYuqori")
              : t("tjKeyingi", { nom: darajaNomi(keyin.daraja + 1), n: keyin.keyingi - keyin.ochko })}
          </span>
        </span>
        {qoshildi !== undefined && (
          <span className="shrink-0 rounded-full bg-brand-green/15 px-2.5 py-1 font-display text-[13px] text-brand-green-d">
            {t("tjQoshildi", { n: qoshildi })}
          </span>
        )}
      </div>
      <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-track">
        <div className="h-full rounded-full bg-brand-blue transition-[width] duration-700 ease-out"
          style={{ width: `${en}%` }} />
      </div>
    </div>
  );
}
