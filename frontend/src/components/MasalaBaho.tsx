/**
 * "Yechding!" oynasi — masala TO'G'RI yechilgan zahoti chiqadi.
 *
 * ─────────────── NEGA OYNA ───────────────
 *
 * Ovoz tugmalari ham, "navbatdagi masala" kartasi ham ekranda allaqachon
 * bor edi — lekin sahifaning ENG PASTIDA, yechimdan keyin. Yechgan odam
 * esa o'sha payt quvonchdan orqaga qaytib ketardi: masala baholanmay,
 * keyingisi ochilmay qolardi. Bo'lim esa aynan shu ikki narsaga
 * tayanadi — baho muallifni yana yozishga undaydi, ketma-ketlik esa
 * bitta masalani o'nta masalaga aylantiradi.
 *
 * Oyna ikkalasini ham yechim g'alabasi eng yangi bo'lgan LAHZADA so'raydi.
 *
 * ─────────────── NEGA MAJBURIY EMAS ───────────────
 *
 * "Avval yechimni ko'raman" tugmasi va fonga bosish oynani yopadi.
 * Yechimni o'qimasdan keyingisiga surib yuborish o'rgatmaydi — va
 * yopib bo'lmaydigan oyna baholashni emas, g'azabni oladi.
 *
 * Tartib ataylab: avval BAHO (ikki bosish, bir soniya), keyin YO'L.
 * Teskari bo'lsa, odam "keyingi" ni bosib ketadi va baho so'ralmaydi.
 */
import { useEffect, useState } from "react";
import { Konfetti } from "./Konfetti";
import { Hajmli } from "../lib/hajmli";
import type { HajmliNom } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import type { Keyingi, Ovoz } from "../lib/masala";
import { sinfNomi } from "../lib/masalaSinf";
import { tebrat } from "../lib/qobiq";

interface Props {
  /** Shu javob uchun berilgan tanga. 0 — yechim oldin ochilgan edi. */
  tanga: number;
  /** Nechanchi urinishda topildi. */
  urinish: number;
  ovozim: Ovoz;
  /** O'z masalasi — baholash bo'lagi chiqmaydi. */
  meniki: boolean;
  keyingi: Keyingi | null;
  onOvoz: (tur: "like" | "dislike") => void;
  onKeyingi: (id: number) => void;
  onRoyxat: () => void;
  onYop: () => void;
}

export function MasalaBaho({
  tanga, urinish, ovozim, meniki, keyingi, onOvoz, onKeyingi, onRoyxat, onYop,
}: Props) {
  // Oyna ochilgan paytdagi ovoz — "rahmat" faqat SHU oynada berilgan
  // ovozga aytiladi. Avval baholagan odamga har safar rahmat aytilsa,
  // u so'z ma'nosini yo'qotadi.
  const [boshOvoz] = useState(ovozim);
  const baholandi = ovozim !== "" && ovozim !== boshOvoz;

  useEffect(() => { tebrat("yutuq"); }, []);

  // Orqaga tugmasi (klaviatura) oynani yopadi, sahifani emas.
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onYop(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onYop]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      role="dialog" aria-modal="true" aria-labelledby="baho-sarlavha">
      <button type="button" aria-label={t("yopish")} onClick={onYop}
        className="az-baho-fon absolute inset-0 bg-black/55 backdrop-blur-[2px]" />

      <Konfetti />

      <div className="az-baho-varaq relative w-full max-w-[420px] rounded-t-[32px] bg-karta px-5 pt-4 pb-6
                      shadow-[0_-12px_40px_rgb(0_0_0/0.35)] sm:rounded-[32px] sm:pb-5">
        {/* Tutqich — "pastga surib yopsa bo'ladi" degan odatiy ishora. */}
        <span aria-hidden className="mx-auto block h-1.5 w-10 rounded-full bg-track sm:hidden" />

        {/* ---- g'alaba ---- */}
        <div className="mt-2 flex flex-col items-center text-center">
          <span className="az-baho-medal relative grid size-20 place-items-center rounded-full
                           bg-brand-green
                           shadow-[0_10px_24px_-8px_var(--color-brand-green)]">
            <span aria-hidden className="az-baho-halqa absolute inset-0 rounded-full ring-4 ring-brand-green/60" />
            <Hajmli nom="bayram" olcham={44} jonli />
          </span>
          <h2 id="baho-sarlavha" className="mt-3 text-[26px] leading-none">{t("masalaBahoSarlavha")}</h2>
          <p className="mt-1.5 text-[13px] text-ink-soft">
            {urinish <= 1 ? t("masalaBahoBirinchi") : t("masalaBahoUrinish", { n: urinish })}
          </p>
          {tanga > 0 && (
            <span className="az-baho-tanga mt-2.5 flex items-center gap-1.5 rounded-full bg-brand-gold/20 px-3 py-1
                             font-display text-[15px] text-brand-gold-d">
              <Icon name="coin" size={16} />+{tanga}
            </span>
          )}
        </div>

        {/* ---- baho ---- */}
        {!meniki && (
          <div className="mt-5 rounded-3xl bg-track/60 p-3">
            <p className="text-center font-display text-[15px]">
              {baholandi ? t("masalaBahoRahmat") : t("masalaBahoSavol")}
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <BahoTugma belgi="yoqdi" matn={t("masalaBahoYoqdi")} faol={ovozim === "like"}
                rang="green" on={() => onOvoz("like")} />
              <BahoTugma belgi="yoqmadi" matn={t("masalaBahoYoqmadi")} faol={ovozim === "dislike"}
                rang="red" on={() => onOvoz("dislike")} />
            </div>
          </div>
        )}

        {/* ---- yo'l ---- */}
        <div className="mt-4">
          {keyingi ? (
            <>
              <p className="mb-2 text-center text-[12.5px] text-ink-soft">{t("masalaBahoKeyingi")}</p>
              {/* Baho berilgach tugma YALTIRAYDI — ko'z endi shu yerga
                  o'tishi kerak. Undan oldin u tinch turadi va bahodan
                  e'tiborni tortib olmaydi. */}
              <button type="button" onClick={() => onKeyingi(keyingi.id)}
                className={`tugma-3d flex w-full items-center gap-3 rounded-3xl bg-brand-blue px-4 py-3.5
                            text-left text-white shadow-[0_5px_0_var(--color-brand-blue-d)]
                            ${baholandi || meniki || ovozim ? "az-yaltir az-baho-chaqir" : ""}`}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[15px] leading-snug">{keyingi.matn}</span>
                  <span className="text-[11.5px] opacity-80">{sinfNomi(keyingi.sinf)}</span>
                </span>
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/20">
                  <Icon name="chevron" size={20} />
                </span>
              </button>
            </>
          ) : (
            <button type="button" onClick={onRoyxat}
              className="tugma-3d flex w-full items-center justify-center gap-2 rounded-3xl bg-brand-blue py-3.5
                         font-display text-[15px] text-white shadow-[0_5px_0_var(--color-brand-blue-d)]">
              {t("masalaBahoRoyxat")}
              <Icon name="chevron" size={18} />
            </button>
          )}

          <button type="button" onClick={onYop}
            className="clay-press mt-2.5 w-full rounded-3xl py-2.5 text-[13.5px] text-ink-soft">
            {t("masalaBahoYechim")}
          </button>
        </div>
      </div>
    </div>
  );
}

function BahoTugma({ belgi, matn, faol, rang, on }: {
  belgi: HajmliNom; matn: string; faol: boolean; rang: "green" | "red"; on: () => void;
}) {
  const faolRang = rang === "green"
    ? "bg-brand-green text-white shadow-[0_4px_0_var(--color-brand-green-d)]"
    : "bg-ink-soft text-white shadow-clay-sm";
  return (
    <button type="button" onClick={on} aria-pressed={faol}
      className={`tugma-3d flex flex-col items-center gap-1 rounded-2xl py-3 font-display text-[14px]
                  transition-colors ${faol ? `${faolRang} az-baho-tanlandi` : "bg-karta text-ink shadow-clay-sm"}`}>
      <Hajmli nom={belgi} olcham={34} jonli={faol} />
      {matn}
    </button>
  );
}
