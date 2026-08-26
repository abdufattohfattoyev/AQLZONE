/**
 * MENING MASALALARIM — hamma holatda, sababi bilan.
 *
 * ─────────────── NEGA ALOHIDA EKRAN ───────────────
 *
 * Muallif sahifasi (`MasalaMuallif.tsx`) faqat TASDIQLANGANlarni
 * ko'rsatadi — u begona odam ham ochadigan sahifa. Odamning o'ziga
 * esa navbatda turgani ham, rad etilgani ham va ayniqsa RAD
 * SABABI kerak: nimani tuzatishni bilmagan odam ikkinchi marta
 * yozmaydi.
 *
 * ─────────────── KUTAYOTGAN TANGA ───────────────
 *
 * Muallifning tangasi serverda TO'PLANIB turadi: masalasi
 * tasdiqlanganda va kimdir uni yechganda qo'shiladi, o'sha paytda
 * esa muallif ilovada bo'lmaydi.
 *
 * Uni olish TUGMA bilan bo'ladi, o'zi emas. Sabab ko'rinishda:
 * "+65 tanga" degan yozuv jimgina hisobga qo'shilib ketsa, odam
 * uni umuman sezmasdi — va aynan shu son uni yana masala
 * yozishga undaydigan narsa.
 *
 * DIQQAT: server hisobni nolga tushiradi va nima tushirganini
 * QAYTARADI. Ya'ni javob bir marta keladi — uni yo'qotib qo'ysak,
 * tanga butunlay yo'qoladi. Shuning uchun progressga qo'shish
 * so'rovdan darhol keyin, hech qanday shartsiz bajariladi.
 */
import { useCallback, useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { MasalaKarta } from "../components/MasalaKarta";
import * as MS from "../lib/masala";
import type { Menikilar } from "../lib/masala";
import { useProgress } from "../lib/progress";
import { tebrat, useOrqaga } from "../lib/qobiq";

interface Props {
  onOch: (id: number) => void;
  onYangi: () => void;
  onBack: () => void;
}

export function Masalalarim({ onOch, onYangi, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);
  const { masalaTugadi } = useProgress();
  const [d, setD] = useState<Menikilar | null>(null);
  const [xato, setXato] = useState(false);
  const [olinmoqda, setOlinmoqda] = useState(false);

  const yukla = useCallback(() => {
    MS.menikilar().then(setD).catch(() => setXato(true));
  }, []);

  useEffect(yukla, [yukla]);

  const mukofotniOl = async () => {
    if (olinmoqda) return;
    setOlinmoqda(true);
    try {
      const { tanga } = await MS.mukofotniOl();
      if (tanga > 0) {
        // Savol soni 0: mukofot mashq emas, uni kunlik zanjirga
        // qo'shish "bugun ishladim" degan yolg'on bo'lardi.
        masalaTugadi(tanga, 0);
        tebrat("yutuq");
      }
      setD((x) => (x ? { ...x, kutayotganTanga: 0 } : x));
    } catch {
      setXato(true);
    } finally {
      setOlinmoqda(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-10">
      <div className="flex items-center gap-2.5">
        {!ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl
                       bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="font-display text-[17px]">{t("masalaMenikilar")}</h1>
        <button type="button" onClick={onYangi} title={t("masalaYoz")}
          className="clay-press ml-auto grid size-11 shrink-0 place-items-center rounded-2xl
                     bg-brand-purple text-white shadow-clay">
          <Icon name="plus" size={20} />
        </button>
      </div>

      {xato && !d && (
        <p className="mt-10 text-center text-[13px] text-ink-dim">{t("aloqaYoq")}</p>
      )}
      {!d && !xato && (
        <p className="mt-10 text-center text-[13px] text-ink-dim">{t("yuklanyapti")}</p>
      )}

      {d && (
        <>
          {d.kutayotganTanga > 0 && (
            <button type="button" onClick={() => void mukofotniOl()} disabled={olinmoqda}
              className="tugma-3d az-yaltir mt-3.5 flex w-full items-center gap-3 rounded-clay
                         bg-brand-gold p-3.5 text-left text-white shadow-clay disabled:opacity-60">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl
                               bg-white/25 text-[20px]">🪙</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[15px] leading-tight">
                  {t("masalaMukofot", { n: d.kutayotganTanga })}
                </span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-white/90">
                  {t("masalaMukofotIzoh")}
                </span>
              </span>
              <Icon name="chevron" size={18} className="shrink-0 text-white/85" />
            </button>
          )}

          <p className="mt-3.5 text-[12px] text-ink-dim">
            {t("masalaBugungi", { n: d.bugun, jami: d.kunlikChegara })}
          </p>

          {d.masalalar.length === 0 ? (
            <p className="mt-8 text-center text-[13px] leading-snug text-ink-dim">
              {t("masalaMenikilarBosh")}
            </p>
          ) : (
            <div className="mt-2.5 space-y-2.5">
              {d.masalalar.map((m) => (
                <div key={m.id}>
                  <MasalaKarta m={m} muallifBilan={false} on={() => onOch(m.id)} />
                  {/* Rad sababi kartaning OSTIDA, ichida emas: karta
                      uch ekranda bir xil ko'rinishi kerak va sabab
                      faqat shu yerda mavjud. */}
                  {m.holat === "rad" && m.radSababi && (
                    <p className="mt-1 rounded-clay bg-brand-red/10 px-3.5 py-2
                                  text-[12px] leading-snug text-brand-red">
                      {m.radSababi}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
