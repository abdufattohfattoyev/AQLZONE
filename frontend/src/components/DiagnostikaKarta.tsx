/**
 * DTM sahifasidagi bitta qator — "Bilim xaritasi" eshigi (`screens/Diagnostika.tsx`).
 *
 * Diagnostika bo'lmasa — taklif: "13 mavzudan qaysi biri yiqitadi". Bo'lsa —
 * javob: umumiy foiz va birinchi takrorlanadigan mavzu. Ma'lumot qurilmadagi
 * xulosadan (`xulosaOqi`) — karta serverga so'rov yubormaydi.
 */
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import { QISQA, xulosaOqi } from "../lib/diagnostika";
import { DTM_MAVZULAR, mavzuBySlug } from "../lib/dtmMavzu";
import { t } from "../lib/matn";
import { yolDiagnostika } from "../lib/yollar";

export function DiagnostikaKarta() {
  const nav = useNavigate();
  const x = xulosaOqi();
  const birinchi = x?.takror[0] ? mavzuBySlug(x.takror[0]) : null;
  const izoh = !x ? t("diagKartaIzoh", { n: DTM_MAVZULAR.length * QISQA })
    : birinchi ? t("diagKartaNatija", { f: x.umumiy, m: t(birinchi.nom) })
      : t("diagKartaHammasi", { f: x.umumiy });
  return (
    <button type="button" onClick={() => nav(yolDiagnostika())}
      data-tahlil={x ? "DTM: bilim xaritasi" : "DTM: bilim xaritasi (yangi)"}
      className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta p-3.5 text-left shadow-clay-sm">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sahna text-brand-blue-t">
        <Icon name="chart" size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] leading-tight">{t("diagKarta")}</span>
        <span className="block truncate text-[13px] text-ink-dim">{izoh}</span>
      </span>
      <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
    </button>
  );
}
