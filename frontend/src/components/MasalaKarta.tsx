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
import { avatarBelgi } from "../lib/dokon";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { nuqtaSoni } from "../lib/masalaQiyin";
import { sinfNomi, sinfRangi } from "../lib/masalaSinf";
import { ENG_KATTA_MUKOFOT } from "../lib/masalaTanga";
import type { Masala } from "../lib/masala";

interface Props {
  m: Masala;
  on: () => void;
  /** Muallif yozuvi ko'rsatilsinmi. Muallif sahifasida u ortiqcha. */
  muallifBilan?: boolean;
}

export function MasalaKarta({ m, on, muallifBilan = true }: Props) {
  // Hech kim urinmagan bo'lsa foiz ma'nosiz (server 100 qaytaradi) —
  // u yerda nuqta emas, "hali urinilmagan" yozuvi turadi.
  const olchangan = m.urinishSoni > 0;
  const nuqta = nuqtaSoni(m.qiyinlik);

  const test = m.variantlar.length > 0;

  return (
    <button type="button" onClick={on}
      className="clay-press block w-full rounded-clay border border-track bg-karta p-3.5
                 text-left shadow-clay-sm">
      {/* ---- tepa qator ---- */}
      <div className="flex items-center gap-2">
        {/* Toifa yorlig'i RANGLI: o'nta kartali sahifada ko'z avval
            rangni ko'radi, yozuvni keyin o'qiydi. Kulrang yorliqlar
            paytida "olimpiada" masalasini topish uchun har birining
            yozuvini o'qishga to'g'ri kelardi. */}
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] leading-none
                          ${sinfRangi(m.sinf)}`}>
          {sinfNomi(m.sinf)}
        </span>

        {/* Test belgisi — masala TURI kartadanoq bilinsin: variant
            tanlash bilan javob yozish ikki xil ish va odam ko'pincha
            aynan bittasini qidiradi. */}
        {test && (
          <span className="shrink-0 rounded-full bg-brand-green/15 px-2 py-1 text-[10.5px]
                           leading-none text-brand-green">
            {t("masalaTestBelgi")}
          </span>
        )}

        {/* Qiyinlik — sinf yorlig'ining YONIDA. U ham masalaning
            "pasporti": qaysi sinf va qanchalik qiyin degan ikki savol
            bitta qatorda javob topadi. */}
        {olchangan && (
          <span className="flex shrink-0 items-center gap-[3px]" aria-label={`${nuqta}/5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i}
                className={`size-[5px] rounded-full ${
                  i < nuqta ? "bg-brand-purple" : "bg-ink-dim/30"}`} />
            ))}
          </span>
        )}

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
          QALIN va biroz zichroq: karta ichida bu YAGONA asosiy narsa,
          qolgani esa uning atrofidagi belgilar. Ilgari matn oddiy
          og'irlikda edi va yorliqlar bilan bir xil "ovozda" turardi. */}
      <p className="mt-2.5 line-clamp-4 font-display text-[14.5px] leading-snug">{m.matn}</p>

      {/* ---- chizma ----
          Matnning OSTIDA va butun kenglikda, yonida emas.
          Geometriya, shaxmat taxtasi yoki gugurt naqshi — bularning
          hammasi CHIZMA bilan tushuniladi va 56 pikselli kichkina
          kvadratchada ulardan hech narsa ko'rinmasdi. Rasm botiq
          ramkada turadi: karta ko'tarilgan, chizma esa uning ichiga
          o'yilgan oynadek. */}
      {m.rasm && (
        <span className="shadow-ichki mt-2.5 block overflow-hidden rounded-2xl bg-sahna p-1.5">
          <img src={m.rasm} alt="" loading="lazy"
            className="max-h-56 w-full rounded-xl object-contain" />
        </span>
      )}

      {/* ---- botiq qator: holat va "yechish" ---- */}
      <div className="shadow-ichki mt-2.5 flex items-center gap-2 rounded-2xl bg-sahna
                      px-3 py-2">
        <span className="min-w-0 truncate text-[11.5px] text-ink-dim">
          {olchangan
            ? t("masalaYechdi", { n: m.yechganSoni, jami: m.urinishSoni })
            : t("masalaUrinilmagan")}
        </span>
        {/* Mukofot "Yechish" ning YONIDA turadi: tanga aynan shu
            amal uchun berilishi shu qo'shnilikda o'qiladi. Faqat
            hali yechmaganda ko'rinadi — ikkinchi marta to'g'ri
            javob berganga tanga qayta berilmaydi. */}
        {!m.uringan && (
          <span className="ml-auto flex shrink-0 items-center gap-0.5 rounded-full
                           bg-brand-gold/15 px-2 py-1 text-[11.5px] leading-none
                           text-brand-gold">
            <Icon name="coin" size={12} />
            +{ENG_KATTA_MUKOFOT}
          </span>
        )}
        <span className={`flex shrink-0 items-center gap-1 rounded-full bg-brand-purple/15
                          px-2.5 py-1 text-[11.5px] leading-none text-brand-purple
                          ${m.uringan ? "ml-auto" : ""}`}>
          {t("masalaYechishTugma")}
          <Icon name="chevron" size={13} />
        </span>
      </div>

      {/* ---- past qator ----
          "Nechta odam yechdi" endi bu yerda emas, yuqoridagi botiq
          qatorda: u masalaning O'ZI haqidagi ma'lumot, muallifniki
          emas. Muallif yozuvi yonida turganda ikkalasi bir gapdek
          o'qilardi. */}
      <div className="mt-2.5 flex min-w-0 items-center gap-1.5 text-[11px] text-ink-dim">
        {muallifBilan && (
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="grid size-[18px] shrink-0 place-items-center rounded-full
                             bg-track text-[10px] leading-none">
              {avatarBelgi(m.muallif.avatar)}
            </span>
            <span className="truncate">{m.muallif.ism}</span>
          </span>
        )}

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
