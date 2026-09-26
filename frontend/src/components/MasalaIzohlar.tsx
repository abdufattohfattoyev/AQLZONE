/**
 * Masala ostidagi "Izohlar N" qatori (`manba/Masala.dc.html`).
 *
 * Bosilganda ochiladi. Ikki qoida serverda (`MasalaIzoh`):
 *
 *   yechimdan keyin   izohlar javobni aytib yuborishi mumkin — yechim
 *                     ochilmaguncha faqat SONI ko'rinadi
 *   tekshiruv         yangi izoh admin tasdiqlaguncha faqat yozganga
 *                     ko'rinadi ("Tekshirilmoqda" belgisi bilan)
 *
 * `ochiqKalit` — yechim ochilganda o'zgaradi va ro'yxat qayta so'raladi:
 * javob berilgan zahoti izohlar ham ochilsin.
 */
import { useEffect, useState } from "react";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { avatarBelgi } from "../lib/dokon";
import { xatoKodi } from "../lib/api";
import * as MS from "../lib/masala";
import { tebrat } from "../lib/qobiq";

const UZUNLIK = 300;

export function MasalaIzohlar({ id, ochiqKalit }: { id: number; ochiqKalit: boolean }) {
  const [ma, setMa] = useState<MS.Izohlar | null>(null);
  const [ochilgan, setOchilgan] = useState(false);
  const [matn, setMatn] = useState("");
  const [ketmoqda, setKetmoqda] = useState(false);
  const [xato, setXato] = useState("");

  useEffect(() => {
    let bekor = false;
    MS.izohlar(id).then((d) => { if (!bekor) setMa(d); }).catch(() => {});
    return () => { bekor = true; };
  }, [id, ochiqKalit]);

  // Server javob bermasa qator umuman chiqmaydi — "Izohlar" deb turib
  // bosilganda hech narsa ochilmasligi yolg'on va'da bo'lardi.
  if (!ma) return null;

  const yubor = async () => {
    const m = matn.trim();
    if (m.length < 2 || ketmoqda) return;
    setKetmoqda(true);
    setXato("");
    try {
      const iz = await MS.izohYoz(id, m);
      tebrat("tanlov");
      setMa((d) => (d ? { ...d, royxat: [...d.royxat, iz] } : d));
      setMatn("");
    } catch (e) {
      setXato(xatoKodi(e) === 429 ? t("masalaIzohKop") : t("masalaIzohXato"));
    } finally {
      setKetmoqda(false);
    }
  };

  return (
    <div className="mt-3 rounded-[18px] bg-karta shadow-clay-sm">
      <button type="button" aria-expanded={ochilgan} data-tahlil="Masala: izohlar"
        onClick={() => { tebrat("tanlov"); setOchilgan((v) => !v); }}
        className="clay-press flex min-h-14 w-full items-center gap-3 rounded-[18px] px-3.5">
        <Icon name="izoh" size={20} className="shrink-0" />
        <span className="min-w-0 flex-1 text-left text-[15px] font-semibold">{t("masalaIzohlar")}</span>
        <span className="shrink-0 text-[14px] text-ink-dim tabular-nums">{ma.soni}</span>
        <Icon name="chevron" size={16}
          className={`shrink-0 text-ink-dim transition-transform ${ochilgan ? "-rotate-90" : "rotate-90"}`} />
      </button>

      {ochilgan && (
        <div className="flex flex-col gap-3 border-t border-track px-3.5 pt-3 pb-3.5">
          {!ma.ochiq ? (
            <p className="flex items-start gap-2 text-[14px] leading-snug text-ink-soft">
              <Icon name="lock" size={17} className="mt-0.5 shrink-0" />
              {t("masalaIzohQulf")}
            </p>
          ) : (
            <>
              {ma.royxat.length === 0 ? (
                <p className="text-[14px] leading-snug text-ink-dim">{t("masalaIzohYoq")}</p>
              ) : (
                <ul className="flex max-h-80 flex-col gap-3 overflow-y-auto">
                  {ma.royxat.map((iz) => (
                    <li key={iz.id} className="flex gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-track">
                        <EmojiBelgi e={avatarBelgi(iz.muallif.avatar)} olcham={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2">
                          <span className="truncate text-[13.5px] font-bold">{iz.muallif.ism}</span>
                          {iz.holat !== "tasdiq" && (
                            <span className="rounded-full bg-track px-2 text-[12px] font-semibold text-ink-dim">
                              {iz.holat === "rad" ? t("masalaIzohRad") : t("masalaIzohTekshiruv")}
                            </span>
                          )}
                        </div>
                        <p className="text-[14.5px] leading-snug break-words whitespace-pre-wrap">{iz.matn}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2">
                <textarea value={matn} onChange={(e) => setMatn(e.target.value)} maxLength={UZUNLIK} rows={2}
                  placeholder={t("masalaIzohJoy")} aria-label={t("masalaIzohJoy")}
                  className="w-full resize-none rounded-2xl bg-track px-3.5 py-2.5 text-[15px] text-ink outline-none
                             placeholder:text-ink-dim" />
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink-dim">
                    {xato || t("masalaIzohIzoh")}
                  </span>
                  <button type="button" onClick={() => void yubor()} data-tahlil="Masala: izoh yuborish"
                    disabled={matn.trim().length < 2 || ketmoqda}
                    className="clay-press min-h-11 shrink-0 rounded-xl bg-brand-blue/10 px-4 text-[14.5px] font-bold
                               text-brand-blue-t disabled:opacity-50">
                    {ketmoqda ? t("yuklanyapti") : t("masalaIzohYubor")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
