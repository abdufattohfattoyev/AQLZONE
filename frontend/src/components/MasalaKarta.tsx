/**
 * Ro'yxatdagi bitta masala kartasi.
 *
 * Uch ekranda ishlatiladi — ro'yxat, muallif sahifasi va "mening
 * masalalarim" — shuning uchun alohida komponent. Har birida
 * alohida yozilsa, ular albatta bir-biridan qolib ketardi: bittasiga
 * "qiyinlik" qo'shiladi, ikkinchisi eski holida qolardi.
 *
 * MATN QISQARTIRILADI (uch qator). Karta masalani O'QITISH uchun
 * emas, TANLASH uchun turibdi: to'liq matn ichkarida, klaviatura va
 * javob maydoni bilan birga ko'rinadi.
 */
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { sinfNomi } from "../lib/masalaSinf";
import type { Masala } from "../lib/masala";

interface Props {
  m: Masala;
  on: () => void;
  /** Muallif yozuvi ko'rsatilsinmi. Muallif sahifasida u ortiqcha. */
  muallifBilan?: boolean;
}

export function MasalaKarta({ m, on, muallifBilan = true }: Props) {
  return (
    <button type="button" onClick={on}
      className="clay-press block w-full rounded-clay bg-karta p-3.5 text-left shadow-clay-sm">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-track px-2 py-0.5 text-[10.5px] text-ink-dim">
          {sinfNomi(m.sinf)}
        </span>

        {/* Holat yorlig'i FAQAT o'z masalasida chiqadi — boshqalarnikida
            u har doim "tasdiq" bo'ladi va hech narsa aytmaydi. */}
        {m.holat === "kutmoqda" && (
          <span className="rounded-full bg-brand-gold/15 px-2 py-0.5 text-[10.5px] text-brand-gold">
            {t("masalaKutmoqda")}
          </span>
        )}
        {m.holat === "rad" && (
          <span className="rounded-full bg-brand-red/15 px-2 py-0.5 text-[10.5px] text-brand-red">
            {t("masalaRad")}
          </span>
        )}

        {/* "Yechgansiz" belgisi — odam bir masalani ikki marta ochib
            o'tirmasin. To'g'ri va xato ATAYLAB ajratilgan: xato
            qilgan masalaga qaytib kelish ma'noli, to'g'ri
            yechilganiga esa deyarli yo'q. */}
        {m.uringan && (
          <span className={`ml-auto flex items-center gap-1 text-[11px] ${
            m.birinchiTogri ? "text-brand-green" : "text-ink-dim"}`}>
            <Icon name={m.birinchiTogri ? "check" : "repeat"} size={13} />
            {m.birinchiTogri ? t("masalaYechgansiz") : t("masalaQaytaUrinish")}
          </span>
        )}
      </div>

      {/* Rasm bo'lsa u matn bilan YONMA-YON turadi, ustida emas:
          ro'yxatda karta baland bo'lib ketsa, bir ekranda ikkitasi
          qolib, tanlash uchun uzoq surish kerak bo'lardi. */}
      <div className="mt-2 flex items-start gap-2.5">
        <p className="line-clamp-3 min-w-0 flex-1 text-[13.5px] leading-snug">{m.matn}</p>
        {m.rasm && (
          <img src={m.rasm} alt="" loading="lazy"
            className="size-14 shrink-0 rounded-2xl bg-track object-cover" />
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-dim">
        {muallifBilan && (
          <span className="flex min-w-0 items-center gap-1">
            <span className="grid size-[15px] shrink-0 place-items-center rounded-full
                             bg-track text-[9px] leading-none">
              {m.muallif.avatar || "🦊"}
            </span>
            <span className="truncate">{m.muallif.ism}</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <Icon name="check" size={12} />
          {t("masalaYechdi", { n: m.yechganSoni, jami: m.urinishSoni })}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="flex items-center gap-0.5">👍 {m.like}</span>
          <span className="flex items-center gap-0.5">👎 {m.dislike}</span>
        </span>
      </div>
    </button>
  );
}
