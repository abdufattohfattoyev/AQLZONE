/**
 * IMTIHON — DTM matematika blokiga tayyorgarlik (`manba/Dtm.dc.html`).
 *
 * Ekranning butun vazifasi bitta savolga javob berish: "imtihonga
 * tayyormanmi?". Shuning uchun tepada natija turadi (oxirgi beshta
 * urinishning o'rtachasi: "22 / 30 to'g'ri · 73%"), ostida variantlar.
 *
 * Nega o'rtacha: bitta natija hech narsa demaydi — omad ham, charchoq
 * ham bor. Beshta urinishning o'rtachasi esa haqiqatga yaqin va aynan
 * shu son o'sib borishi kerak (`lib/imtihon.ts`).
 *
 * Yangi dizaynda natija ostida KO'P XATO QILINAYOTGAN MAVZULAR turadi
 * (oxirgi urinishlardan, `zaifMavzular`) va "Shu mavzularni takrorlash"
 * — eng zaif mavzu kursining bob testlariga olib boradi.
 *
 * DTM da javob har savoldan keyin darhol ko'rinadi (sertifikatdan farqi)
 * va bu ekranning pastida yozilgan.
 */
import { useEffect, useState } from "react";
import { ImtihonSarlavha } from "../components/ImtihonTur";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { OLCHAM, VARIANTLAR, daraja, engYaxshi, sinxronla, zaifMavzular } from "../lib/imtihon";
import type { ServerTarix } from "../lib/imtihon";

export function Imtihon({ onVariant, onSertifikat, onChiq, onTakrorla }: {
  onVariant: (n: number) => void;
  /** Milliy sertifikat variantlariga o'tish (`components/ImtihonTur.tsx`). */
  onSertifikat: () => void;
  onChiq: () => void;
  /** Zaif mavzu kursining bob testlari (kurs id'si). */
  onTakrorla: (kursId: string) => void;
}) {
  // Tarix SERVERDAN: telefon almashsa ham yo'qolmaydi. Ochilganda
  // qurilmadagi urinishlar ham yuboriladi — eski tarix shu yo'l bilan
  // bir marta ko'chadi, internetsiz ishlangani keyinroq yetib boradi.
  // Server javob bermaguncha (yoki internet yo'q bo'lsa) qurilmadagi
  // nusxa ko'rinadi — ekran bo'sh turmaydi.
  const [tarix, setTarix] = useState<ServerTarix | null>(null);
  useEffect(() => {
    let tirik = true;
    sinxronla().then((x) => { if (tirik) setTarix(x); }).catch(() => {});
    return () => { tirik = false; };
  }, []);

  const d = tarix
    ? (tarix.ortacha === null ? null : { foiz: tarix.ortacha, urinish: tarix.jami })
    : daraja();
  const engi = (n: number) => (tarix ? tarix.eng_yaxshi[String(n)] ?? null : engYaxshi(n));
  const [zaif] = useState(() => zaifMavzular());

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-10 min-[360px]:px-[18px]
                    sm:max-w-[560px]">
      <ImtihonSarlavha joriy="dtm" onTanla={onSertifikat} onChiq={onChiq} />

      <div className="flex flex-col gap-2.5 rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:p-[18px]">
        {d ? (
          <>
            <div className="text-[13px] font-bold text-ink-dim">{t("imtOrtachaDtm")}</div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[34px] leading-none font-bold">
                {Math.round((d.foiz * OLCHAM.savol) / 100)}
              </span>
              <span className="flex-1 text-[16px] font-semibold text-ink-soft">
                {t("imtDtmTogri", { n: OLCHAM.savol })}
              </span>
              <span className="font-display text-[22px] font-bold text-brand-blue-t">{d.foiz}%</span>
            </div>
          </>
        ) : (
          <>
            <div className="font-display text-[18px] leading-tight">{t("imtihonBoshlang")}</div>
            <p className="text-[14px] leading-snug text-ink-soft">{t("imtihonBoshlangIzoh")}</p>
          </>
        )}

        {zaif.length > 0 && (
          <>
            <div className="mt-1 text-[13px] font-bold text-ink-dim">{t("imtZaif")}</div>
            <div className="flex flex-wrap gap-2">
              {zaif.map((m) => (
                <span key={`${m.kursId}|${m.mavzu}`}
                  className="rounded-full bg-track px-3 py-1.5 text-[13.5px] font-semibold text-ink-soft">
                  {t("imtZaifXato", { mavzu: kursMatn(m.mavzu).replace(/^\d+-bob\.\s*|^Глава \d+\.\s*/, ""), n: m.xato })}
                </span>
              ))}
            </div>
            <button type="button" onClick={() => onTakrorla(zaif[0]!.kursId)} data-tahlil="DTM: mavzularni takrorlash"
              className="clay-press mt-0.5 min-h-11 self-start rounded-xl bg-brand-blue/10 px-4 text-[14.5px] font-bold
                         text-brand-blue-t">
              {t("imtZaifTakrorla")}
            </button>
          </>
        )}
      </div>

      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="font-display text-[20px]">{t("imtihonVariantlar")}</h2>
        <span className="text-[13px] text-ink-dim">
          {t("imtDtmTuzilish", { savol: OLCHAM.savol, daqiqa: OLCHAM.daqiqa })}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: VARIANTLAR }, (_, i) => i + 1).map((n) => {
          const eng = engi(n);
          return (
            <button key={n} type="button" onClick={() => onVariant(n)} data-tahlil={`Imtihon: ${n}-variant`}
              aria-label={t("imtihonVariant", { n })}
              className="clay-press flex min-h-[60px] flex-col items-center justify-center rounded-[16px] bg-karta
                         shadow-clay-sm">
              <span className="font-display text-[18px] leading-tight font-bold">{n}</span>
              <span className="text-[12.5px] text-ink-dim">{eng ? `${eng.togri}/${eng.jami}` : "—"}</span>
            </button>
          );
        })}
      </div>

      <p className="text-[13px] leading-snug text-ink-dim">{t("imtDtmPast")}</p>
    </div>
  );
}
