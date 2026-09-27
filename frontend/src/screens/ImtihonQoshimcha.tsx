/**
 * DTM va milliy sertifikat atrofidagi uch sahifa — ikkalasida bir xil:
 *
 *   ImtReyting   haftalik jadval (`components/HaftalikReyting.tsx`)
 *   ZaifMashq    oxirgi urinishlarda qoqilgan boblardan 10 ta savol
 *   ImtKorish    oxirgi urinishni ko'rib chiqish (`components/KoribChiqish.tsx`)
 *
 * Ro'yxatdan (`Imtihon.tsx`, `Sertifikat.tsx`) va natija ekranidan
 * ochiladi. Natija ekranining O'ZIDAGI ko'rib chiqish esa sahifa emas —
 * u test ekranining ichida (orqaga tugmasi testga qaytarmasin).
 */
import { Navigate } from "react-router-dom";
import { ReytingJadval } from "../components/HaftalikReyting";
import { KoribChiqish } from "../components/KoribChiqish";
import type { ImtTur } from "../lib/imtihon";
import { javobOqi, mashqBoblari, variantYasa as dtmYasa } from "../lib/imtihon";
import { dtmSavollari, sertSavollari } from "../lib/korish";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";
import type { SJavob } from "../lib/sertifikat";
import { variantYasa as sertYasa } from "../lib/sertifikat";
import { Blok } from "./Blok";

export function ImtReyting({ tur, variant, onChiq, onVariant }: {
  tur: ImtTur;
  variant: number | null;
  onChiq: () => void;
  onVariant: (n: number) => void;
}) {
  const strelka = useOrqaga(onChiq);
  return <ReytingJadval tur={tur} boshVariant={variant} strelka={strelka} onChiq={onChiq} onVariantBoshla={onVariant} />;
}

/**
 * Zaif mavzular mashqi — oddiy blok test (`Blok.tsx`), faqat savollar
 * eng zaif uchta bobdan (`mashqBoblari`). Zaif mavzu hali yo'q bo'lsa —
 * variant ishlashga yuboradi: mashq qiladigan narsa yo'q.
 */
export function ZaifMashq({ tur, onChiq }: { tur: ImtTur; onChiq: () => void }) {
  const boblar = mashqBoblari(tur);
  if (!boblar.length) {
    return (
      <div className="mx-auto grid min-h-ekran w-full max-w-[430px] place-items-center px-6">
        <div className="rounded-clay bg-karta p-6 text-center shadow-clay-sm">
          <p className="text-[14.5px] leading-snug text-ink-soft">{t("zaifMashqYoq")}</p>
          <button type="button" onClick={onChiq}
            className="clay-press mt-4 h-12 w-full rounded-3xl bg-track font-display text-[15px] text-ink-soft">
            {t("ortga")}
          </button>
        </div>
      </div>
    );
  }
  return <Blok sinf={11} uzunlik="bob" qamrov={{ tur: "mavzular", boblar }} bobNomi={t("zaifMashqNom")} onExit={onChiq} />;
}

/** Oxirgi urinishni ko'rib chiqish. Javoblar yo'q (boshqa qurilma) — ro'yxatga qaytadi. */
export function ImtKorish({ tur, n, onChiq }: { tur: ImtTur; n: number; onChiq: () => void }) {
  useOrqaga(onChiq);
  const saqlangan = javobOqi<string | null | SJavob>(tur, n);
  if (tur === "dtm") {
    const blok = dtmYasa(n);
    if (!blok || !saqlangan) return <Navigate to="/imtihon" replace />;
    return <KoribChiqish sarlavha={`DTM · ${t("imtihonVariant", { n })}`}
      savollar={dtmSavollari(blok, saqlangan.javoblar as (string | null)[])} onYop={onChiq} />;
  }
  const v = sertYasa(n);
  if (!v || !saqlangan) return <Navigate to="/sertifikat" replace />;
  return <KoribChiqish sarlavha={`${t("imtihonTurSert")} · ${t("imtihonVariant", { n })}`}
    savollar={sertSavollari(v, saqlangan.javoblar as SJavob[])} onYop={onChiq} />;
}
