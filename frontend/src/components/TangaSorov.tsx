/**
 * "Tanga sarflaymizmi?" — sarflashdan OLDIN so'raladigan ruxsat.
 *
 * ─────────────────── NEGA SO'RALADI ───────────────────
 *
 * Tanga bir bosishda ketardi va qaytmasdi. Yechimni ochish tugmasi
 * esa aynan odam qiynalgan paytda, ya'ni shoshib bosiladigan paytda
 * turadi — "nima bo'ldi?" degan savol tanga ketgandan keyin
 * kelardi. Bir marta shunday bo'lgan bola ikkinchi marta hech
 * narsaga tanga sarflamaydi.
 *
 * ─────────────────── NECHTA QOLISHINI AYTADI ───────────────────
 *
 * Oynada uchta son bor: narx, hozirgi hisob va QOLADIGANI. Uchinchisi
 * eng muhimi — "15 tanga" degan narx o'zi hech narsa anglatmaydi,
 * "380 dan 365 qoladi" esa qaror qabul qilish uchun yetarli.
 *
 * Tanga yetmasa oyna boshqacha: narx o'rniga nechta yetmayotgani
 * turadi va tasdiq tugmasi umuman yo'q. "Yo'q" deb rad etish
 * o'rniga "qancha kerakligini" aytish — bu yo'lni yopish emas,
 * ko'rsatish.
 */
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";

interface Props {
  /** Nima sotib olinyapti — bir qatorlik nom. */
  nima: string;
  narx: number;
  /** Hozirgi umumiy tanga. */
  bor: number;
  onHa: () => void;
  onYoq: () => void;
}

export function TangaSorov({ nima, narx, bor, onHa, onYoq }: Props) {
  const yetadi = bor >= narx;
  const qoladi = bor - narx;

  return (
    <div
      className="az-kanal-fon fixed inset-0 z-[80] grid place-items-center bg-black/45 p-4
                 backdrop-blur-[2px]"
      role="dialog" aria-modal="true" aria-labelledby="az-tanga-sarlavha"
      /* Fonga bosilsa — RAD. Tanga sarflash hech qachon e'tiborsiz
         bosishdan kelib chiqmasligi kerak. */
      onClick={onYoq}
    >
      <div className="az-kanal w-full max-w-[340px] rounded-clay bg-karta p-6 text-center shadow-clay"
        onClick={(e) => e.stopPropagation()}>
        <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-brand-gold text-white
                         shadow-[0_6px_0_var(--color-brand-gold-d)]">
          <Icon name="coin" size={26} />
        </span>

        <h2 id="az-tanga-sarlavha" className="mt-4 font-display text-[19px] leading-tight">
          {t(yetadi ? "tangaSorovSarlavha" : "tangaYetmadiSarlavha")}
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-snug text-ink-dim">{nima}</p>

        {/* Uchta son — botiq jadvalda. Ular oynadagi eng muhim
            ma'lumot va matndan ajralib turishi kerak. */}
        <div className="shadow-ichki mt-4 rounded-2xl bg-sahna px-3.5 py-2.5 text-[13px]">
          <Qator nom={t("tangaSorovNarx")} qiymat={`−${narx}`} rang="text-brand-red" />
          <Qator nom={t("tangaSorovBor")} qiymat={String(bor)} />
          <span aria-hidden className="my-1.5 block h-px bg-ink-dim/15" />
          {yetadi ? (
            <Qator nom={t("tangaSorovQoladi")} qiymat={String(qoladi)}
              rang="text-brand-gold" qalin />
          ) : (
            <Qator nom={t("tangaSorovYetmaydi")} qiymat={String(narx - bor)}
              rang="text-brand-red" qalin />
          )}
        </div>

        {yetadi && (
          <button type="button" onClick={onHa} autoFocus
            className="clay-press mt-5 h-[52px] w-full rounded-3xl bg-brand-gold font-display
                       text-[16px] text-white shadow-[0_5px_0_var(--color-brand-gold-d)]">
            {t("tangaSorovHa")}
          </button>
        )}

        <button type="button" onClick={onYoq}
          className={`w-full py-1.5 text-[13.5px] font-semibold text-ink-dim ${
            yetadi ? "mt-3" : "mt-5"}`}>
          {t(yetadi ? "tangaSorovYoq" : "tangaSorovYopish")}
        </button>
      </div>
    </div>
  );
}

function Qator(
  { nom, qiymat, rang = "text-ink-soft", qalin = false }:
  { nom: string; qiymat: string; rang?: string; qalin?: boolean },
) {
  return (
    <span className="flex items-center justify-between py-0.5">
      <span className="text-ink-dim">{nom}</span>
      <span className={`flex items-center gap-1 ${rang} ${qalin ? "font-display text-[15px]" : ""}`}>
        <Icon name="coin" size={qalin ? 14 : 12} />
        {qiymat}
      </span>
    </span>
  );
}
