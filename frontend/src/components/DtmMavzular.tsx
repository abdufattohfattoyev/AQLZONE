/**
 * DTM — MAVZU BO'YICHA TESTLAR ro'yxati (`lib/dtmMavzu.ts`), DTM
 * ekranining "Mavzular bo'yicha" bo'limida (`screens/Imtihon.tsx`).
 *
 * Har qator — bitta mavzu: nomi va o'zlashtirish foizi (ishlangan
 * bo'lsa). Bosilganda o'sha joyda variantlar ochiladi. Ular alohida
 * sahifaga olib chiqilmadi: tanlov ikki bosishda tugashi kerak, sahifa
 * esa uchinchi bosish va orqaga qaytishni qo'shardi.
 *
 * Qatorda ATAYLAB uch qavatdan ko'p narsa yo'q: nom · holat (foiz yoki
 * variantlar soni) · ochilgan variantlar. Qaysi bob kirgani, savollar
 * soni — pastdagi bitta izohda, har qatorda emas.
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import { darsliMavzular } from "../lib/jonliDars";
import { yolDarslar } from "../lib/yollar";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import {
  DTM_MAVZULAR, MAVZU_BEPUL, MAVZU_VARIANTLAR, mavzuEng, mavzuFoizi, mavzuNatijalari, mavzuSinxronla,
} from "../lib/dtmMavzu";
import type { MavzuNatija } from "../lib/dtmMavzu";
import { VariantTor } from "./VariantTor";
import { useVariantQulf } from "./variantQulf";

export function DtmMavzular({ onBoshla }: { onBoshla: (slug: string, n: number) => void }) {
  // Serverdagi tarix ustun (telefon almashsa ham qoladi); javob kelguncha
  // qurilmadagi nusxa ko'rinadi.
  const [royxat, setRoyxat] = useState<MavzuNatija[]>(() => mavzuNatijalari());
  useEffect(() => {
    let tirik = true;
    mavzuSinxronla().then((x) => { if (tirik) setRoyxat(x); }).catch(() => {});
    return () => { tirik = false; };
  }, []);

  const [ochiq, setOchiq] = useState<string | null>(null);
  // Jonli darsi bor mavzular — ochilgan qatorda variantlardan oldin "Jonli dars"
  // chiqadi: test ishlashdan oldin mavzuni o'rganish yo'li.
  const nav = useNavigate();
  const [jonli, setJonli] = useState<string[]>([]);
  useEffect(() => {
    let tirik = true;
    darsliMavzular().then((x) => { if (tirik) setJonli(x); });
    return () => { tirik = false; };
  }, []);
  // Premium qulfi variant RAQAMI bo'yicha: har mavzuda faqat birinchisi
  // bepul (`MAVZU_BEPUL`). Qaysi mavzu ekanini qulf bilmaydi — ref'da turadi.
  const slugRef = useRef("");
  const qulf = useVariantQulf((n) => onBoshla(slugRef.current, n), MAVZU_BEPUL);

  return (
    <div className="flex flex-col gap-2">
      {DTM_MAVZULAR.map((m) => {
        const foiz = mavzuFoizi(royxat, m.slug);
        const ochilgan = ochiq === m.slug;
        return (
          <div key={m.slug} className="rounded-clay bg-karta shadow-clay-sm">
            <button type="button" aria-expanded={ochilgan} data-tahlil={`DTM mavzu: ${m.slug}`}
              onClick={() => { tebrat("tanlov"); setOchiq(ochilgan ? null : m.slug); }}
              className="clay-press flex min-h-[56px] w-full items-center gap-3 rounded-clay px-4 py-2.5 text-left">
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15.5px] leading-tight">{t(m.nom)}</span>
                {foiz === null ? (
                  <span className="mt-0.5 block text-[12.5px] text-ink-dim">
                    {t("imtMavzuVariantlar", { n: MAVZU_VARIANTLAR })}
                  </span>
                ) : (
                  <span aria-hidden className="mt-1.5 block h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-track">
                    <span className="block h-full rounded-full bg-brand-blue" style={{ width: `${foiz}%` }} />
                  </span>
                )}
              </span>
              {foiz !== null && <span className="font-display text-[16px] font-bold text-brand-blue-t">{foiz}%</span>}
              <Icon name="chevron" size={18}
                className={`shrink-0 text-ink-dim transition-transform ${ochilgan ? "rotate-90" : ""}`} />
            </button>

            {ochilgan && (
              <div className="px-3 pb-3">
                {jonli.includes(m.slug) && (
                  <button type="button" onClick={() => { tebrat("tanlov"); nav(yolDarslar(m.slug)); }}
                    data-tahlil={`DTM mavzu: jonli dars ${m.slug}`}
                    className="clay-press mb-2.5 flex min-h-11 w-full items-center gap-2 rounded-xl bg-brand-blue/10 px-3.5
                               text-left text-[14.5px] font-bold text-brand-blue-t">
                    <Icon name="play" size={17} className="shrink-0" />
                    <span className="min-w-0 flex-1">{t("darsTugma")}</span>
                    <Icon name="chevron" size={16} className="shrink-0" />
                  </button>
                )}
                <VariantTor soni={MAVZU_VARIANTLAR} sahifa={12} ichki yopiqmi={qulf.yopiqmi}
                  natija={(n) => mavzuEng(royxat, m.slug, n)} tahlil={`DTM mavzu: ${m.slug}`}
                  onTanla={(n) => { slugRef.current = m.slug; qulf.tanla(n); }} />
              </div>
            )}
          </div>
        );
      })}
      {qulf.varaq}
    </div>
  );
}
