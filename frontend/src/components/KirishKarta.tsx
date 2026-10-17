/**
 * DTM sahifasidagi bitta qator — "Kirish yo'li" eshigi (`screens/KirishYoli.tsx`).
 *
 * Maqsad tanlanmagan bo'lsa — savol: "Grantgacha qancha qoldi?". Tanlangan
 * bo'lsa — javob: "Grantgacha: matematikadan 4 ta savol". Har kirganda shu
 * raqam ko'rinadi va u kamayib borishi kerak — qaytish sababi shu.
 *
 * Maqsad SO'RALMAYDI (`lib/kirish.ts` boshidagi izoh): bu faqat eshik.
 */
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import { hisobla, maqsadOqi } from "../lib/kirish";
import { t } from "../lib/matn";
import { yolKirish } from "../lib/yollar";

export function KirishKarta({ foiz }: { foiz: number | null }) {
  const nav = useNavigate();
  const m = maqsadOqi();
  let sarlavha = t("kirishKarta");
  let izoh = t("kirishKartaIzoh");
  if (m) {
    sarlavha = m.y.nomi;
    const k = t(m.y.grant ? "kirishGrant" : "kirishKontrakt");
    if (foiz !== null) {
      const h = hisobla(m.y, foiz, m.boshqa);
      const n = m.y.grant ? h.grantSavol : h.kontraktSavol;
      izoh = n === null ? t("kirishKartaYetmaydi") : n === 0 ? t("kirishKartaYetdi", { k }) : t("kirishKartaSavol", { k, n });
    } else {
      izoh = m.y.otm;
    }
  }
  return (
    <button type="button" onClick={() => nav(yolKirish())} data-tahlil={m ? "DTM: kirish yo'li" : "DTM: kirish yo'li (yangi)"}
      className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta p-3.5 text-left shadow-clay-sm">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sahna text-brand-blue-t">
        <Icon name="map" size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[15px] leading-tight">{sarlavha}</span>
        <span className="block truncate text-[13px] text-ink-dim">{izoh}</span>
      </span>
      <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
    </button>
  );
}
