/**
 * O'QISH › DARSLAR — kursning boblari va darslari (`manba/Oqish.dc.html`).
 *
 * `components/OqishQobiq.tsx` ichida turadi: sarlavha, sinf tanlagich va
 * yorliqlar qobiqda, bu yerda faqat kursning o'zi.
 *
 * ─────────────── NIMA O'ZGARDI ───────────────
 *
 * Ilgari bu sahifada o'nga yaqin narsa bor edi: yulduz va tanga
 * pillalari, logo, kunlik maqsad, bugungi sinov, xatolar daftari,
 * imtihon tayyorgarligi, ota-ona tugmasi — va ularning ostida boblar.
 * Ular yangi dizaynda o'z joylariga ko'chdi (Bugun, O'qish yorliqlari,
 * Men) va bu yerda faqat "qaysi darsni o'qiyman" qoldi:
 *
 *   umumiy chiziq   "12 / 45 dars"
 *   tugagan bob     yopiq, yashil belgi, "5 / 5 dars · tugadi"
 *   JORIY bob       ochiq va ko'k halqa bilan ajratilgan; ichida
 *                   o'tilgan (yashil), joriy (ko'k halqa + "Boshlash")
 *                   va keyingi (kulrang) darslar
 *   qolgan boblar   yopiq; bosilsa ochiladi
 *
 * Dars ochilishi qoidasi o'zgarmadi (`lib/types.ts` → nodeState):
 * yopiq darsni bosib bo'lmaydi, o'tilganini qayta o'ynash mumkin.
 */
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../lib/icons";
import { Yolboshchi } from "../components/Yolboshchi";
import { turKerakmi } from "../lib/tur";
import { keyingiDars, lessonId, nodeState } from "../lib/types";
import type { Progress, Unit } from "../lib/types";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";

interface Props {
  units: Unit[];
  progress: Progress;
  onStart: (ui: number, li: number) => void;
}

export function Home({ units, progress, onStart }: Props) {
  const totals = useMemo(() => {
    const total = units.reduce((s, U) => s + U.lessons.length, 0);
    const done = units.reduce(
      (s, U, ui) => s + U.lessons.filter((_, li) => progress.done[lessonId(ui, li)]).length, 0);
    return { total, done };
  }, [units, progress]);

  // Bola turgan joy: joriy bob shundan kelib chiqadi va boshdan ochiq turadi.
  const keyingi = useMemo(() => keyingiDars(units, progress), [units, progress]);
  const joriyBob = keyingi?.ui ?? -1;
  const [ochiq, setOchiq] = useState<Set<number>>(() => new Set([joriyBob]));
  const almashtir = (ui: number) => setOchiq((s) => {
    const y = new Set(s);
    if (y.has(ui)) y.delete(ui); else y.add(ui);
    return y;
  });

  /**
   * Yo'lboshchi — birinchi tashrifda ekranni tanishtiradi.
   *
   * Kechikish SHART: kartalar ochilish animatsiyasi bilan chiqadi va
   * o'sha paytda o'lchansa, yorug' dog' elementning hali yetib
   * kelmagan joyiga qo'yilardi.
   */
  const [yolboshchi, setYolboshchi] = useState(false);
  useEffect(() => {
    if (!turKerakmi()) return;
    const k = setTimeout(() => setYolboshchi(true), 900);
    return () => clearTimeout(k);
  }, []);

  return (
    <>
      {/* ---- umumiy taraqqiyot ---- */}
      <div className="flex items-center gap-2.5">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-track">
          <div className="h-full rounded-full bg-brand-green transition-[width] duration-500"
            style={{ width: `${(totals.done / Math.max(1, totals.total)) * 100}%` }} />
        </div>
        <span className="shrink-0 text-[14px] font-bold text-ink-soft">
          {t("oqishDarsSoni", { n: totals.done, jami: totals.total })}
        </span>
      </div>

      <div data-tur="boblar" className="flex flex-col gap-3">
        {units.map((U, ui) => {
          const soni = U.lessons.filter((_, li) => progress.done[lessonId(ui, li)]).length;
          const tugadi = soni === U.lessons.length;
          const joriy = ui === joriyBob;
          const bu = ochiq.has(ui);
          return (
            <section key={ui}
              className={`overflow-hidden bg-karta shadow-clay-sm ${
                joriy ? "rounded-[22px] outline-2 outline-brand-blue outline-solid" : "rounded-[18px]"}`}>
              <button type="button" onClick={() => almashtir(ui)} aria-expanded={bu}
                data-tahlil={joriy ? "Darslar: joriy bob" : "Darslar: bob"}
                className="clay-press flex min-h-[58px] w-full items-center gap-3 px-3.5 py-2.5 text-left">
                {tugadi ? (
                  <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-brand-green text-white">
                    <Icon name="check" size={18} />
                  </span>
                ) : (
                  <span className={`grid size-[34px] shrink-0 place-items-center rounded-full font-display font-bold ${
                    joriy ? "bg-brand-blue/12 text-brand-blue-t" : "bg-track text-ink-dim"}`}>
                    {ui + 1}
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15.5px] leading-tight font-bold min-[360px]:text-[16px]">{kursMatn(U.u)}</span>
                  <span className="text-[13px] text-ink-dim">
                    {t(tugadi ? "oqishBobTugadi" : "oqishDarsSoni", { n: soni, jami: U.lessons.length })}
                  </span>
                </span>
                <Icon name="chevron" size={20}
                  className={`shrink-0 text-ink-dim transition-transform ${bu ? "-rotate-90" : "rotate-90"}`} />
              </button>

              {bu && (
                <ol className="flex flex-col px-3.5 pb-3">
                  {U.lessons.map((L, li) => {
                    const h = nodeState(units, progress, ui, li);
                    const nom = kursMatn(L.n).split(" · ")[0];
                    if (h === "current") {
                      return (
                        <li key={li}>
                          <button type="button" onClick={() => onStart(ui, li)} data-tur="davom"
                            data-tahlil="Darslar: boshlash"
                            className="clay-press -mx-1.5 my-0.5 flex min-h-14 w-[calc(100%+12px)] items-center gap-3
                                       rounded-[14px] bg-brand-blue/8 px-3 text-left">
                            <span className="size-[22px] shrink-0 rounded-full border-[5px] border-brand-blue" />
                            <span className="min-w-0 flex-1 text-[15px] leading-tight font-bold">{nom}</span>
                            <span className="grid min-h-9 shrink-0 place-items-center rounded-xl bg-brand-blue px-3.5
                                             text-[14px] font-bold text-white">
                              {t("oqishBoshlash")}
                            </span>
                          </button>
                        </li>
                      );
                    }
                    return (
                      <li key={li}>
                        <button type="button" disabled={h === "locked"} onClick={() => onStart(ui, li)}
                          data-tahlil="Darslar: dars"
                          className="clay-press flex min-h-[46px] w-full items-center gap-3 pl-1.5 text-left
                                     disabled:cursor-default">
                          <span className={`size-[22px] shrink-0 rounded-full ${
                            h === "done" ? "bg-brand-green" : "bg-track"}`} />
                          <span className={`min-w-0 flex-1 text-[15px] leading-tight ${
                            h === "done" ? "text-ink-soft" : "text-ink-dim"}`}>{nom}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>

      {yolboshchi && <Yolboshchi onTugadi={() => setYolboshchi(false)} />}
    </>
  );
}
