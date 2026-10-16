/**
 * AI javobidagi chizmalar — funksiya grafigi, geometrik shakl, son o'qi.
 *
 * Nega model rasm "yasamaydi": rasm modeli matematikada adashadi (uchburchak
 * burchaklari, grafik kesishmalari noto'g'ri chiqadi) va qimmat. Bu yerda
 * model faqat koordinata va ifodalarni JSON qilib aytadi (`core/ai.py`,
 * `CHIZMA`), ilova esa ularni aniq SVG qilib chizadi — chizma hisob bilan
 * bir xil to'g'ri bo'ladi va tokenlar arzon.
 *
 * Model xato JSON yozsa yoki noma'lum tur bersa — blok jim tashlab
 * ketiladi: buzilgan chizmadan chizmasiz matn yaxshiroq.
 *
 * Ranglar: chiziq va yozuv — `currentColor` (ink, qorong'i rejimda oq),
 * to'r — ink-dim, asosiy obyekt — firuza (bitta urg'u rangi). Ikkinchi
 * funksiya amber, uchinchisi yashil — uchta rangdan chiqilmaydi.
 * Chizishning o'zi — `ChizmaSvg.tsx`.
 */
import { useMemo } from "react";
import type { Chizma, Reja } from "../lib/aiChizma";
import { model } from "../lib/chizmaModel";
import { t } from "../lib/matn";
import { ChizmaIzoh, ChizmaSvg } from "./ChizmaSvg";

/**
 * Reja — kunlar zinapoyasi: chapda kun va chiziq (ketma-ketlik), o'ngda
 * har ish uzunligi daqiqasiga mos chiziq. Bir qarashda qaysi kun og'ir
 * va qaysi mavzuga ko'p vaqt ketishi ko'rinadi. SVG emas, HTML: mavzu
 * nomlari uzun va o'raladi.
 */
function RejaKorinish({ c }: { c: Reja }) {
  const eng = Math.max(1, ...c.kunlar.flatMap((k) => k.ishlar.map((i) => i.daqiqa)));
  return (
    <ol className="flex flex-col">
      {c.kunlar.map((k, n) => {
        const jami = k.ishlar.reduce((s, i) => s + i.daqiqa, 0);
        const oxirgi = n === c.kunlar.length - 1;
        return (
          <li key={n} className="flex gap-3">
            <div className="flex w-3 shrink-0 flex-col items-center">
              <span className="mt-1.5 size-3 shrink-0 rounded-full bg-brand-blue" />
              {!oxirgi && <span className="w-[2px] flex-1 bg-brand-blue/30" />}
            </div>
            <div className={`min-w-0 flex-1 ${oxirgi ? "" : "pb-3.5"}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-[15px]">{k.kun || t("aiRejaKun", { n: n + 1 })}</span>
                {jami > 0 && <span className="text-[12.5px] text-ink-dim">{t("aiRejaDaq", { n: jami })}</span>}
              </div>
              <div className="mt-1 flex flex-col gap-1.5">
                {k.ishlar.map((i, j) => (
                  <div key={j}>
                    <div className="flex items-baseline justify-between gap-2 text-[13.5px] leading-snug">
                      <span className="min-w-0">{i.mavzu}</span>
                      {i.daqiqa > 0 && <span className="shrink-0 text-[12.5px] text-ink-dim">{i.daqiqa}′</span>}
                    </div>
                    {i.daqiqa > 0 && (
                      <div className="mt-0.5 h-1.5 rounded-full bg-track">
                        <div className="h-full rounded-full bg-brand-blue" style={{ width: `${(i.daqiqa / eng) * 100}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Suhbatdagi chizma — tayyor rasm. Geometriya (masshtab, yorliqlar) jonli
 * doska bilan bir joyda hisoblanadi (`lib/chizmaModel.ts`), ya'ni darsda
 * birma-bir chizilgan rasm bilan bir xil chiqadi.
 */
export function AiChizma({ c }: { c: Chizma }) {
  const m = useMemo(() => model(c), [c]);
  return (
    <figure className="my-2 rounded-2xl bg-sahna p-3 text-ink shadow-ichki">
      {c.tur === "reja" ? <RejaKorinish c={c} /> : m && (
        <>
          <ChizmaSvg m={m} aria={c.tur === "grafik" ? c.funksiyalar.map((f) => f.nom).join(", ") : undefined} />
          <ChizmaIzoh m={m} />
        </>
      )}
    </figure>
  );
}
