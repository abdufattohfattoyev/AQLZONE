/**
 * O'QISH › XATOLAR — xatolar daftari (`lib/daftar.ts`).
 *
 * Ilgari daftar kurs sahifasining pastida, faqat takrorlash vaqti kelgan
 * kuni chiqadigan kartada turardi — boshqa kunlari u bor-yo'qligi
 * ko'rinmasdi. Endi yorliq doim bor:
 *
 *   tepada    bugun takrorlanadigan savollar soni va "Mashq qilish"
 *             (takrorlash darsining o'zi — eski `/kurs/:slug/daftar`)
 *   pastda    daftardagi mavzular: qaysi darsda necha marta xato
 *
 * Takrorlash qoidasi o'zgarmadi: savol 1, 3 va 7 kundan keyin qaytadi.
 */
import { useMemo } from "react";
import { t } from "../lib/matn";
import type { Course } from "../lib/curriculum";
import { hammasi } from "../lib/daftar";
import { bugungiSoni } from "../lib/takrorlash";
import { kursMatn } from "../lib/tarjima/kurs";

export function OqishXatolar({ kurs, onMashq }: { kurs: Course; onMashq: () => void }) {
  const soni = useMemo(() => bugungiSoni(kurs.slug), [kurs.slug]);

  // Bitta darsdagi turli savol turlari bitta qatorga yig'iladi: odamga
  // "qaysi mavzu" muhim, "qaysi savol turi" emas.
  const mavzular = useMemo(() => {
    const m = new Map<string, { nom: string; xato: number }>();
    for (const y of hammasi()) {
      if (y.kurs !== kurs.slug) continue;
      const L = kurs.units[y.ui]?.lessons[y.li];
      if (!L) continue;
      const k = `${y.ui}-${y.li}`;
      const eski = m.get(k);
      m.set(k, { nom: kursMatn(L.n).split(" · ")[0] ?? "", xato: (eski?.xato ?? 0) + y.xato });
    }
    return [...m.values()].sort((a, b) => b.xato - a.xato).slice(0, 12);
  }, [kurs]);

  return (
    <>
      <div className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:p-[18px]">
        <span className="text-[13px] font-bold tracking-[0.06em] text-ink-dim uppercase">
          {soni > 0 ? t("oqishXatoBugun") : t("oqishXatoYoq")}
        </span>
        {soni > 0 && (
          <span className="font-display text-[26px] leading-none font-bold">{t("oqishXatoSoni", { n: soni })}</span>
        )}
        <span className="text-[14.5px] leading-snug text-ink-soft">
          {mavzular.length ? t("oqishXatoIzoh") : t("oqishXatoBosh")}
        </span>
        {soni > 0 && (
          <button type="button" onClick={onMashq} data-tahlil="Xatolar: mashq qilish"
            className="tugma-3d min-h-[52px] rounded-2xl bg-brand-blue font-display text-[18px] font-bold text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("oqishMashq")}
          </button>
        )}
      </div>

      {mavzular.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <h2 className="pl-1 text-[13px] font-bold tracking-[0.06em] text-ink-dim uppercase">
            {t("oqishXatoMavzular")}
          </h2>
          <ul className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
            {mavzular.map((x) => (
              <li key={x.nom} className="flex min-h-[50px] items-center gap-3 px-3.5">
                <span className="min-w-0 flex-1 text-[15px] leading-tight">{x.nom}</span>
                <span className="shrink-0 text-[13px] text-ink-dim">{t("oqishXatoMarta", { n: x.xato })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
