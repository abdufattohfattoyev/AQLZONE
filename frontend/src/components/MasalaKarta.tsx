/**
 * Ro'yxatdagi bitta masala kartasi.
 *
 * Uch ekranda ishlatiladi — ro'yxat, muallif sahifasi va "mening
 * masalalarim" — shuning uchun alohida komponent. Har birida
 * alohida yozilsa, ular albatta bir-biridan qolib ketardi: bittasiga
 * "qiyinlik" qo'shiladi, ikkinchisi eski holida qolardi.
 *
 * ─────────────── KARTANING UCH QAVATI ───────────────
 *
 *   tepa      sinf yorlig'i (botiq) va holat belgisi
 *   o'rta     masala matni, yonida rasm bo'lsa — kichik ko'rinishi
 *   botiq     qiyinlik nuqtalari va "Yechish" ishorasi
 *   past      muallif, yechilgan soni va ovozlar
 *
 * Ko'tarilgan karta ichida BOTIQ qatorlar bor: ikkalasi birga
 * kartaga chuqurlik beradi va ko'z avval matnga, keyin pastdagi
 * raqamlarga tushadi. Bitta tekis qutida esa hammasi bir xil
 * og'irlikda ko'rinardi.
 *
 * MATN QISQARTIRILADI (uch qator). Karta masalani O'QITISH uchun
 * emas, TANLASH uchun turibdi: to'liq matn ichkarida, klaviatura va
 * javob maydoni bilan birga ko'rinadi.
 *
 * ─────────────── ICHIDA TUGMA YO'Q ───────────────
 *
 * "Yechish" ham, ovoz sonlari ham TUGMA EMAS — kartaning o'zi
 * bitta katta tugma va ichiga tugma joylash HTML'da ham
 * (`<button>` ichida `<button>`), ekran o'qigichda ham buziq
 * chiqadi. Ovoz masalaning o'z ekranida beriladi.
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

/**
 * Qiyinlik — beshta nuqta.
 *
 * `qiyinlik` — birinchi urinishda TO'G'RI yechganlar foizi, ya'ni
 * son qancha KATTA bo'lsa, masala shuncha oson. Nuqtalar teskari
 * o'qiladi: ko'p nuqta — qiyin masala.
 */
function nuqtaSoni(qiyinlik: number): number {
  if (qiyinlik >= 80) return 1;
  if (qiyinlik >= 60) return 2;
  if (qiyinlik >= 40) return 3;
  if (qiyinlik >= 20) return 4;
  return 5;
}

export function MasalaKarta({ m, on, muallifBilan = true }: Props) {
  // Hech kim urinmagan bo'lsa foiz ma'nosiz (server 100 qaytaradi) —
  // u yerda nuqta emas, "hali urinilmagan" yozuvi turadi.
  const olchangan = m.urinishSoni > 0;
  const nuqta = nuqtaSoni(m.qiyinlik);

  return (
    <button type="button" onClick={on}
      className="clay-press block w-full rounded-clay bg-karta p-3.5 text-left shadow-clay-sm">
      {/* ---- tepa qator ---- */}
      <div className="flex items-center gap-2">
        <span className="shadow-ichki rounded-full bg-sahna px-2.5 py-1 text-[10.5px]
                         leading-none text-ink-soft">
          {sinfNomi(m.sinf)}
        </span>

        {/* Holat yorlig'i FAQAT o'z masalasida chiqadi — boshqalarnikida
            u har doim "tasdiq" bo'ladi va hech narsa aytmaydi. */}
        {m.holat === "kutmoqda" && (
          <Holat rang="gold" ic="clock">{t("masalaKutmoqda")}</Holat>
        )}
        {m.holat === "rad" && (
          <Holat rang="red" ic="close">{t("masalaRad")}</Holat>
        )}

        {/* O'ng chetdagi belgi — odam bir masalani ikki marta ochib
            o'tirmasin. To'g'ri va xato ATAYLAB ajratilgan: xato
            qilgan masalaga qaytib kelish ma'noli, to'g'ri
            yechilganiga esa deyarli yo'q. */}
        <span className="ml-auto shrink-0">
          {m.uringan
            ? m.birinchiTogri
              ? <Holat rang="green" ic="check">{t("masalaYechgansiz")}</Holat>
              : <Holat rang="xira" ic="repeat">{t("masalaQaytaUrinish")}</Holat>
            : <Holat rang="xira">{t("masalaYechilmagan")}</Holat>}
        </span>
      </div>

      {/* ---- matn ----
          Rasm matn bilan YONMA-YON turadi, ustida emas: ro'yxatda
          karta baland bo'lib ketsa, bir ekranda ikkitasi qolib,
          tanlash uchun uzoq surish kerak bo'lardi. */}
      <div className="mt-2.5 flex items-start gap-2.5">
        <p className="line-clamp-3 min-w-0 flex-1 text-[14px] leading-snug">{m.matn}</p>
        {m.rasm && (
          <img src={m.rasm} alt="" loading="lazy"
            className="size-14 shrink-0 rounded-2xl bg-track object-cover" />
        )}
      </div>

      {/* ---- botiq qator: qiyinlik va "yechish" ---- */}
      <div className="shadow-ichki mt-2.5 flex items-center gap-2 rounded-2xl bg-sahna
                      px-3 py-2">
        {olchangan ? (
          <>
            <span className="text-[11px] text-ink-dim">{t("masalaQiyinlik")}</span>
            <span className="flex items-center gap-[3px]" aria-label={`${nuqta}/5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i}
                  className={`size-[5px] rounded-full ${
                    i < nuqta ? "bg-brand-purple" : "bg-ink-dim/30"}`} />
              ))}
            </span>
          </>
        ) : (
          <span className="text-[11px] text-ink-dim">{t("masalaUrinilmagan")}</span>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-1 text-[11.5px] text-brand-blue">
          {t("masalaYechishTugma")}
          <Icon name="chevron" size={13} />
        </span>
      </div>

      {/* ---- past qator ---- */}
      <div className="mt-2.5 flex min-w-0 items-center gap-1.5 text-[11px] text-ink-dim">
        {muallifBilan && (
          <>
            <span className="flex min-w-0 items-center gap-1">
              <span className="grid size-[18px] shrink-0 place-items-center rounded-full
                               bg-track text-[10px] leading-none">
                {m.muallif.avatar || "🦊"}
              </span>
              <span className="truncate">{m.muallif.ism}</span>
            </span>
            <span aria-hidden className="text-ink-dim/50">·</span>
          </>
        )}
        <span className="shrink-0">
          {t("masalaYechdi", { n: m.yechganSoni, jami: m.urinishSoni })}
        </span>

        {/* Ovozlar — botiq tasmachada. Ular kartaning eng past
            og'irlikdagi ma'lumoti va shu ko'rinishda ham shunday
            o'qiladi. */}
        <span className="shadow-ichki ml-auto flex shrink-0 items-center gap-1.5 rounded-full
                         bg-sahna px-2 py-1 leading-none">
          <span>👍 {m.like}</span>
          <span aria-hidden className="h-2.5 w-px bg-ink-dim/25" />
          <span>👎 {m.dislike}</span>
        </span>
      </div>
    </button>
  );
}

/** Tepa qatordagi kichik holat yorlig'i. */
function Holat(
  { rang, ic, children }:
  { rang: "green" | "gold" | "red" | "xira"; ic?: "check" | "repeat" | "clock" | "close";
    children: React.ReactNode },
) {
  const uslub = {
    green: "bg-brand-green/15 text-brand-green",
    gold: "bg-brand-gold/15 text-brand-gold",
    red: "bg-brand-red/15 text-brand-red",
    xira: "bg-track text-ink-dim",
  }[rang];
  return (
    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px]
                      leading-none ${uslub}`}>
      {ic
        ? <Icon name={ic} size={11} />
        : <span className="size-1.5 rounded-full bg-current opacity-60" />}
      {children}
    </span>
  );
}
