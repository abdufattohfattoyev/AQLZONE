/**
 * Yopiq variant bosilganda chiqadigan varaq va variant sahifalaridagi darvoza.
 *
 * Varaq `TanlovVaraq` namunasida (`components/Varaq.tsx`): odam ro'yxatdan
 * chiqib ketmaydi — "nima uchun yopiq" bir qarashda bilinadi, Premium
 * sahifasiga esa bitta tugma olib boradi. Sinov mumkin bo'lsa u shu
 * yerda ham turadi: eng qisqa yo'l — bir bosishda ochilgan variant.
 */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { TanlovVaraq } from "./Varaq";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { BEPUL, ochiqmi, premiumOl, sinovOl, usePremium } from "../lib/premium";
import { yolPremium } from "../lib/yollar";

export function PremiumVaraq({ n, onYop, onOchildi }: {
  n: number;
  onYop: () => void;
  /** Sinov olindi — variant darhol ochiladi. */
  onOchildi: () => void;
}) {
  const nav = useNavigate();
  const h = usePremium();
  const [band, setBand] = useState(false);
  const sinov = async () => {
    setBand(true);
    const yangi = await sinovOl();
    setBand(false);
    if (yangi?.faol) onOchildi();
  };
  return (
    <TanlovVaraq sarlavha={t("premVaraqSarlavha", { n })} onYop={onYop}>
      <div className="flex w-full flex-col gap-3">
        <p className="text-[14.5px] leading-snug text-ink-soft">
          {t("premVaraqIzoh", { bepul: h?.bepul ?? BEPUL })}
        </p>
        <button type="button" onClick={() => nav(yolPremium())} data-tahlil="Premium varaq: ko'rish"
          className="tugma-3d min-h-12 rounded-2xl bg-brand-blue px-5 font-display text-[16px] font-bold
                     text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
          {t("premKorish")}
        </button>
        {h?.sinov_mumkin && (
          <button type="button" onClick={sinov} disabled={band} data-tahlil="Premium varaq: sinov"
            className="clay-press min-h-11 rounded-2xl text-[14.5px] font-bold text-brand-blue-t disabled:opacity-60">
            {t("premSinov", { n: h.sinov_kun })}
          </button>
        )}
      </div>
    </TanlovVaraq>
  );
}

/** Variantlar to'ridagi bitta katakning pastki qatori: yopiq bo'lsa — qulf. */
export function QulfBelgi() {
  return <Icon name="lock" size={14} className="text-ink-dim" />;
}

/**
 * Variantni manzil orqali to'g'ridan-to'g'ri ochishga qarshi.
 *
 * Ro'yxatdagi qulf yetmaydi: `/imtihon/9` ni qo'lda yozish yoki eski
 * havolani bosish mumkin. Holat kelguncha kutiladi (bepul variant esa
 * darhol ochiladi — internetsiz ham); yopiq bo'lsa — Premium sahifasi.
 */
export function PremiumDarvoza({ n, children }: { n: number; children: ReactNode }) {
  const h = usePremium();
  const [tayyor, setTayyor] = useState(h !== null);
  useEffect(() => {
    let tirik = true;
    premiumOl().finally(() => { if (tirik) setTayyor(true); });
    return () => { tirik = false; };
  }, []);
  if (ochiqmi(h, n)) return <>{children}</>;
  if (!tayyor) return <div className="p-8 text-center text-[14px] text-ink-dim">{t("yuklanyapti")}</div>;
  return <Navigate to={yolPremium()} replace />;
}

