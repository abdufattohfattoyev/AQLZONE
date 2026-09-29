/**
 * "Ko'p xato qilinayotgan mavzular" yorliqlari — DTM va sertifikat
 * ro'yxatida (`Imtihon.tsx`, `Sertifikat.tsx`).
 *
 * Ilgari ular oddiy yozuv edi: odam zaif mavzusini ko'rardi, lekin
 * bosib, uni o'rganadigan joyga o'ta olmasdi. Endi har biri mavzu
 * sahifasiga (`screens/Mavzu.tsx`) olib boradi — qoida, namuna, mashq.
 */
import { useNavigate } from "react-router-dom";
import { courseById } from "../lib/curriculum";
import type { MavzuXato } from "../lib/imtihon";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { yolMavzu } from "../lib/yollar";

export function ZaifYorliqlar({ zaif, tahlil }: { zaif: MavzuXato[]; tahlil: string }) {
  const nav = useNavigate();
  return (
    <div className="flex flex-wrap gap-2">
      {zaif.map((m) => {
        const c = courseById(m.kursId);
        // Eski yozuvlarda bob raqami yo'q — nomidan topiladi (`mashqBoblari` dagidek).
        const ui = m.ui ?? c?.units.findIndex((U) => U.u === m.mavzu) ?? -1;
        const nom = t("imtZaifXato", { mavzu: kursMatn(m.mavzu).replace(/^\d+-bob\.\s*|^Глава \d+\.\s*/, ""), n: m.xato });
        return c && ui >= 0 ? (
          <button key={`${m.kursId}|${m.mavzu}`} type="button" data-tahlil={tahlil}
            onClick={() => nav(yolMavzu(c, ui), { state: { xato: m.xato } })}
            className="clay-press min-h-9 rounded-full bg-track px-3 py-1.5 text-[13.5px] font-semibold text-ink-soft">
            {nom}
          </button>
        ) : (
          <span key={`${m.kursId}|${m.mavzu}`}
            className="rounded-full bg-track px-3 py-1.5 text-[13.5px] font-semibold text-ink-soft">
            {nom}
          </span>
        );
      })}
    </div>
  );
}
