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
 * ─────────────── KUNLIK CHEGARA KO'RINADI ───────────────
 *
 * "Bugun: 2/5" degan qator — odam yana nechta yozishi mumkinligini
 * OLDINDAN bilsin. Busiz u oltinchi masalani yozib bo'lib,
 * yuborishda "bugunga yetarli" degan javobni olardi va butun
 * mehnati bekorga ketardi.
 */
import { useCallback, useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { MasalaKarta } from "../components/MasalaKarta";
import * as MS from "../lib/masala";
import type { Menikilar } from "../lib/masala";
import { useOrqaga } from "../lib/qobiq";

interface Props {
  onOch: (id: number) => void;
  onYangi: () => void;
  onBack: () => void;
}

export function Masalalarim({ onOch, onYangi, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);
  const [d, setD] = useState<Menikilar | null>(null);
  const [xato, setXato] = useState(false);

  const yukla = useCallback(() => {
    MS.menikilar().then(setD).catch(() => setXato(true));
  }, []);

  useEffect(yukla, [yukla]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-2 pb-10">
      {/* Sarlavha qatori ro'yxat ekranidagi bilan bir xil — ikkalasi
          bir-biriga o'tib turadi va boshqa turishi sakrab ko'rinardi. */}
      <div className="flex items-center gap-2">
        {!ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press -ml-1 grid size-10 shrink-0 place-items-center rounded-2xl
                       text-ink-soft">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate font-display text-[17px] leading-tight">
          {t("masalaMenikilar")}
        </h1>
        <button type="button" onClick={onYangi} title={t("masalaYoz")}
          className="tugma-3d flex h-9 shrink-0 items-center gap-1 rounded-full
                     bg-brand-purple pr-3.5 pl-3 text-white shadow-clay-sm">
          <Icon name="plus" size={16} />
          <span className="font-display text-[13px] leading-none">{t("masalaYozQisqa")}</span>
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
