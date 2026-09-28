/**
 * "Natijani do'stlarga yuborish" — DTM/sertifikat natija ekranida.
 *
 * Bosilganda server natija KARTASINI (rasm) odamning o'z Telegram'iga
 * yuboradi (`core/taklif.py`), u esa uni sinf guruhiga yo'naltiradi —
 * kunlik son kartochkasi bilan bir yo'l (`screens/KunlikSon.tsx`).
 * Kartadagi "Men ham ishlayman" tugmasi — shu odamning taklif havolasi:
 * shu yo'l bilan kelganlar uning taklifi bo'lib sanaladi.
 *
 * Telegram'i yo'q (saytdan kirgan) yoki xato bo'lsa — oddiy Telegram
 * "ulashish" oynasi o'sha havola bilan ochiladi: ulashish baribir bo'ladi.
 */
import { useState } from "react";
import { Icon } from "../lib/icons";
import type { ImtTur } from "../lib/imtihon";
import { natijaniUlash, taklifHolati } from "../lib/imtihon";
import { t } from "../lib/matn";
import { havolaniOch, tebrat } from "../lib/qobiq";

export function NatijaUlash({ tur, variant, tayyor }: {
  tur: ImtTur;
  variant: number;
  /** Natija serverga yozilgani — karta undan KEYIN so'raladi (aks holda "natija yo'q"). */
  tayyor: Promise<void>;
}) {
  const [holat, setHolat] = useState<"bosh" | "ketmoqda" | "yuborildi">("bosh");

  const ulash = async () => {
    if (holat === "ketmoqda") return;
    tebrat("tanlov");
    setHolat("ketmoqda");
    try {
      await tayyor;
      await natijaniUlash(tur, variant);
      setHolat("yuborildi");
    } catch {
      setHolat("bosh");
      try {
        const { havola } = await taklifHolati();
        havolaniOch(`https://t.me/share/url?url=${encodeURIComponent(havola)}`
          + `&text=${encodeURIComponent(t("ulashMatn"))}`);
      } catch { /* internet yo'q — tugma qayta bosiladi */ }
    }
  };

  return (
    <button type="button" onClick={ulash} disabled={holat === "ketmoqda"}
      data-tahlil={`${tur === "dtm" ? "DTM" : "Sertifikat"}: natijani ulashish`}
      className="clay-press flex min-h-[52px] w-full items-center gap-3 rounded-[20px] bg-karta px-4 py-2 text-left
                 shadow-clay-sm">
      <Icon name="send" size={20} className="shrink-0 text-brand-blue-t" />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[16px]">
          {holat === "yuborildi" ? t("ulashYuborildi") : t("ulashTugma")}
        </span>
        <span className="block text-[12.5px] text-ink-dim">
          {holat === "yuborildi" ? t("ulashYuborildiIzoh") : t("ulashIzoh")}
        </span>
      </span>
      {holat === "yuborildi" && <Icon name="check" size={18} className="shrink-0 text-brand-green-d" />}
    </button>
  );
}
