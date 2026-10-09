/**
 * Profil (`screens/Men.tsx`) — Premium faol bo'lganda boshqacha ko'rinadi.
 *
 * Egasining talabi: premium ochilsa profil BOSHQACHA bo'lsin. To'lagan odam
 * o'z hisobiga kirganda "men premiumman" degan narsani darhol ko'rishi
 * kerak, aks holda to'lov "ko'rinmas" bo'lib qoladi va uzaytirish sababi
 * yo'qoladi. Shu sabab uch narsa o'zgaradi:
 *
 *   1. profil kartasi — firuza hoshiya, avatarda yulduz, ism ostida
 *      "Premium" yorlig'i (`PremiumBelgi`, `AvatarYulduz`);
 *   2. Premium kartasi — qolgan vaqt soatlari bilan, muddatning qancha
 *      qismi qolgani (chiziq), tugash payti va Premium bilan ishlangan
 *      yopiq variantlar soni (`PremiumKarta`);
 *   3. haftalik reytingda ism yonida yulduz (`HaftalikReyting.tsx`).
 *
 * Rang — firuza (asosiy/tanlangan holat): oltin faqat tanga, yulduz-mukofot
 * va reyting uchun (dizayn qoidasi), qizil hech qayerda.
 */
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { qolganMatn, sanaMatn, usePremium, useQolgan } from "../lib/premium";
import { yolPremium } from "../lib/yollar";

/** Ism ostidagi "⭐ Premium" yorlig'i. */
export function PremiumBelgi() {
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand-blue px-2.5 py-0.5
                     text-[12px] font-bold text-white">
      <Icon name="star" size={12} />
      {t("premBelgi")}
    </span>
  );
}

/** Avatar burchagidagi kichik yulduz. */
export function AvatarYulduz() {
  return (
    <span aria-hidden
      className="absolute -right-0.5 -bottom-0.5 grid size-[22px] place-items-center rounded-full
                 bg-brand-blue text-white ring-2 ring-karta">
      <Icon name="star" size={12} />
    </span>
  );
}

/**
 * Faol Premium kartasi. Faol bo'lmasa — hech narsa (profil o'rniga
 * `PremiumQator taklif` ni chizadi).
 */
export function PremiumKarta() {
  const nav = useNavigate();
  const h = usePremium();
  const qolgan = useQolgan(h);
  if (!h?.faol || !h.gacha) return null;

  // Chiziq: joriy davrning qancha qismi qolgan. Boshi noma'lum bo'lsa
  // (eski yozuv) — chiziq chizilmaydi, faqat son.
  const tugash = new Date(h.gacha).getTime();
  const boshi = h.davr_boshi ? new Date(h.davr_boshi).getTime() : null;
  const jami = boshi ? Math.max(1, (tugash - boshi) / 1000) : null;
  const ulush = jami ? Math.max(0, Math.min(100, Math.round((100 * qolgan) / jami))) : null;

  return (
    <section aria-label={t("premSarlavha")}
      className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm outline-2 outline-brand-blue/40
                 outline-solid">
      <div className="flex items-center gap-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-blue text-white">
          <Icon name="star" size={18} />
        </span>
        <span className="font-display text-[16px] leading-tight">{t("premSarlavha")}</span>
        {h.sinovda && (
          <span className="ml-auto rounded-full bg-sahna px-2.5 py-0.5 text-[12px] font-bold text-ink-soft">
            {t("premSinovda")}
          </span>
        )}
      </div>

      <div>
        <div className="font-display text-[26px] leading-tight font-bold">
          {t("premQoldi", { vaqt: qolganMatn(qolgan) })}
        </div>
        {ulush !== null && (
          <>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-track" role="progressbar"
              aria-valuemin={0} aria-valuemax={100} aria-valuenow={ulush}
              aria-label={t("premQolganUlush", { n: ulush })}>
              <div className="h-full rounded-full bg-brand-blue" style={{ width: `${ulush}%` }} />
            </div>
            <div className="mt-1 text-[12.5px] text-ink-dim">{t("premQolganUlush", { n: ulush })}</div>
          </>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-2">
        <div className="flex flex-col rounded-2xl bg-sahna px-3 py-2.5 shadow-ichki">
          <dt className="text-[12px] font-semibold text-ink-dim">{t("premTugaydi")}</dt>
          <dd className="font-display text-[15px] leading-tight font-bold">{sanaMatn(h.gacha)}</dd>
        </div>
        <div className="flex flex-col rounded-2xl bg-sahna px-3 py-2.5 shadow-ichki">
          <dt className="text-[12px] font-semibold leading-tight text-ink-dim">{t("premIshlangan")}</dt>
          <dd className="font-display text-[15px] leading-tight font-bold">
            {t("premIshlanganSon", { n: h.ishlangan })}
          </dd>
        </div>
      </dl>

      <button type="button" onClick={() => nav(yolPremium())} data-tahlil="Profil: premium uzaytirish"
        className="clay-press min-h-11 rounded-2xl bg-sahna text-[14.5px] font-bold text-brand-blue-t shadow-ichki">
        {t("premUzaytirish")}
      </button>
    </section>
  );
}
