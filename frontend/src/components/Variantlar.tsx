/**
 * Test masalasining javob variantlari — A, B, C, D.
 *
 * ─────────────────── NEGA HARF BOR ───────────────────
 *
 * Har variant oldida harf turadi va u bezak emas. Masala kanalga
 * chiqadi, skrinshot bo'lib guruhlarga tarqaydi va u yerda odamlar
 * javobni bir-biriga aytadi. "Ikkinchisi" degan javob har kimda
 * boshqacha o'qiladi (kimdir tepadan, kimdir chapdan sanaydi), "B"
 * esa bitta ma'noga ega.
 *
 * ─────────────── QATOR SONI MAZMUNGA QARAB ───────────────
 *
 * Variantlar qisqa bo'lsa — ikkitadan yonma-yon, uzun bo'lsa — har
 * biri o'z qatorida. Matematik javob ko'pincha qisqa ("7 ta", "48"),
 * lekin "hech qanday javob to'g'ri emas" ham uchraydi va u ikki
 * ustunga sig'maydi: yarmi kesilib, variantlar o'qib bo'lmas
 * bo'lardi.
 *
 * ─────────────── TANLOV DARHOL YUBORILMAYDI ───────────────
 *
 * Bosilgan variant faqat BELGILANADI, javob esa alohida tugma bilan
 * ketadi. Barmoq telefonda tez-tez noto'g'ri katakka tushadi va
 * darhol yuboriladigan tanlov o'sha bosishni tuzatib bo'lmaydigan
 * xatoga aylantirardi — masalada esa birinchi urinish statistikaga
 * tushadi.
 */
import { t } from "../lib/matn";

/** Harf tartibi. To'rttadan ko'p variant serverda ham qabul qilinmaydi. */
export const HARFLAR = ["A", "B", "C", "D"] as const;

/** Shu uzunlikdan uzun variant o'z qatorini oladi. */
const UZUN = 14;

interface Props {
  variantlar: string[];
  /** Belgilangan variant indeksi. `-1` — hech biri. */
  tanlangan: number;
  onTanla: (i: number) => void;
  /**
   * Javob berib bo'lingan — tugmalar o'chadi va natija ranglanadi.
   *
   * `togriJavob` bo'lsa to'g'ri variant yashil bo'lib qoladi: yechim
   * ochilgandan keyin odam qaysi biri to'g'ri ekanini variantlarning
   * O'ZIDA ko'rishi kerak, pastdagi matnda emas.
   */
  ochiq?: boolean;
  togriJavob?: string;
}

export function Variantlar({
  variantlar, tanlangan, onTanla, ochiq = false, togriJavob = "",
}: Props) {
  const uzun = variantlar.some((v) => v.length > UZUN);
  const normal = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const togriI = togriJavob
    ? variantlar.findIndex((v) => normal(v) === normal(togriJavob))
    : -1;

  return (
    <div role="radiogroup" aria-label={t("masalaVariantTanla")}
      className={`grid gap-2 ${uzun ? "grid-cols-1" : "grid-cols-2"}`}>
      {variantlar.slice(0, HARFLAR.length).map((v, i) => {
        const tanlandi = i === tanlangan;
        const togri = ochiq && i === togriI;
        // Xato tanlov FAQAT o'zi tanlagan variantda qizaradi:
        // qolgan uchtasini ham qizartirish "hammasi noto'g'ri"
        // degan taassurot berardi.
        const xato = ochiq && tanlandi && togriI >= 0 && i !== togriI;

        return (
          <button key={i} type="button" role="radio" aria-checked={tanlandi}
            onClick={() => onTanla(i)} disabled={ochiq}
            className={`clay-press flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left
                        text-[13.5px] leading-snug transition-colors ${
              togri ? "bg-brand-green/20 text-brand-green shadow-clay-sm"
              : xato ? "bg-brand-red/20 text-brand-red shadow-clay-sm"
              : tanlandi ? "bg-brand-purple/20 text-brand-purple shadow-clay-sm"
              : "shadow-ichki bg-sahna text-ink"}`}>
            <span className={`grid size-6 shrink-0 place-items-center rounded-lg text-[11.5px]
                              leading-none font-display ${
              togri ? "bg-brand-green text-white"
              : xato ? "bg-brand-red text-white"
              : tanlandi ? "bg-brand-purple text-white"
              : "bg-track text-ink-dim"}`}>
              {HARFLAR[i]}
            </span>
            <span className="min-w-0 flex-1 break-words">{v}</span>
          </button>
        );
      })}
    </div>
  );
}
