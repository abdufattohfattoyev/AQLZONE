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
        const belgilangan = togri || xato || tanlandi;

        return (
          <button key={i} type="button" role="radio" aria-checked={tanlandi}
            onClick={() => onTanla(i)} disabled={ochiq}
            /* Tanlangan variant CHEGARA bilan ajratiladi, faqat fon
               bilan emas: qorong'i mavzuda och fon bilan och fon
               orasidagi farq deyarli ko'rinmasdi. Chegara esa ikkala
               mavzuda ham bir xil aniq. */
            className={`clay-press az-variant flex items-center gap-2.5 rounded-2xl border-2
                        px-3 py-2.5 text-left text-[13.5px] leading-snug ${
              togri ? "border-brand-green bg-brand-green/15 text-brand-green"
              : xato ? "border-brand-red bg-brand-red/15 text-brand-red"
              : tanlandi ? "az-variant-tanlandi border-brand-purple bg-brand-purple/15 text-brand-purple"
              : "shadow-ichki border-transparent bg-sahna text-ink"}`}>
            <span className={`grid size-7 shrink-0 place-items-center rounded-xl text-[12px]
                              leading-none font-display ${
              togri ? "bg-brand-green text-white"
              : xato ? "bg-brand-red text-white"
              : tanlandi ? "bg-brand-purple text-white"
              : "bg-track text-ink-dim"}`}>
              {HARFLAR[i]}
            </span>
            <span className="min-w-0 flex-1 break-words font-display">{v}</span>

            {/* O'ng chetdagi doiracha — radio tugmasining o'zi.
                Chegara va fon bilan birga u tanlovni UCH usulda
                ko'rsatadi: rangni ajratmaydigan odam ham, kichik
                ekranda ham holat bir xil o'qiladi. */}
            <span aria-hidden
              className={`grid size-[15px] shrink-0 place-items-center rounded-full border-2 ${
                belgilangan
                  ? togri ? "border-brand-green" : xato ? "border-brand-red"
                    : "border-brand-purple"
                  : "border-ink-dim/35"}`}>
              {belgilangan && (
                <span className={`size-[7px] rounded-full ${
                  togri ? "bg-brand-green" : xato ? "bg-brand-red" : "bg-brand-purple"}`} />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
