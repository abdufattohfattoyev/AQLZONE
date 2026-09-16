/**
 * Ro'yxatdagi bitta masala kartasi.
 *
 * Uch ekranda ishlatiladi — ro'yxat, muallif sahifasi va "mening
 * masalalarim" — shuning uchun alohida komponent.
 *
 * ─────────────── KARTADA FAQAT TANLASH UCHUN KERAKLISI ───────────────
 *
 * Ilgari bitta kartada o'n bir narsa bor edi: raqam, sinf, test
 * belgisi, qiyinlik nuqtalari, holat, matn, rasm, "18/22 yechdi",
 * ko'rishlar soni, tanga, "Yechish", muallif, like va dislike. Odam
 * masalani YECHISH uchun kiradi, bu mayda belgilar esa ko'zni
 * chalg'itib, matnning o'zini ko'mib qo'yardi.
 *
 * Endi kartada uch qavat:
 *
 *   tepa   sinf va (bo'lsa) "yechgansiz" belgisi
 *   o'rta  masala matni va chizmasi — kartaning ASOSIY qismi
 *   past   muallif · mukofot · "Yechish"
 *
 * Raqam, qiyinlik, statistika va ovozlar masalaning O'Z ekranida
 * qoldi — u yerda ular masalani tanlagandan keyin kerak bo'ladi.
 *
 * ─────────────── ICHIDA TUGMA YO'Q ───────────────
 *
 * Kartaning o'zi bitta katta tugma. Ichiga tugma joylash HTML'da ham
 * (`<button>` ichida `<button>`), ekran o'qigichda ham buziq chiqadi.
 */
import { avatarBelgi } from "../lib/dokon";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
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
  const yechgan = m.uringan && m.birinchiTogri;

  return (
    <button type="button" onClick={on} data-tahlil="Masala kartasi"
      className="clay-press block w-full rounded-clay border border-track bg-karta p-4
                 text-left shadow-clay-sm">
      {/* ---- tepa: sinf va holat ---- */}
      <div className="flex items-center gap-2">
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] leading-none
                          ${sinfRangi(m.sinf)}`}>
          {sinfNomi(m.sinf)}
        </span>

        {/* O'z masalasining holati — faqat muallifga kerak. */}
        {m.holat === "kutmoqda" && (
          <span className="text-[11px] text-ink-dim">{t("masalaKutmoqda")}</span>
        )}
        {m.holat === "rad" && (
          <span className="text-[11px] text-brand-red">{t("masalaRad")}</span>
        )}

        {/* Faqat YECHGANI belgilanadi. "Yechilmagan" yozuvi har
            kartada turardi va hech narsa aytmasdi — odatiy holat
            belgisiz bo'ladi. */}
        {yechgan && (
          <span className="ml-auto flex shrink-0 items-center gap-1 text-[11.5px]
                           text-brand-green">
            <Icon name="check" size={13} />
            {t("masalaYechgansiz")}
          </span>
        )}
      </div>

      {/* ---- matn ---- */}
      <p className="mt-2.5 line-clamp-3 font-display text-[15px] leading-snug">{m.matn}</p>

      {m.rasm && (
        <img src={m.rasm} alt="" loading="lazy"
          className="mt-3 max-h-52 w-full rounded-2xl bg-sahna object-contain" />
      )}

      {/* ---- past: muallif · mukofot · yechish ---- */}
      <div className="mt-3 flex min-w-0 items-center gap-2 text-[12px]">
        {muallifBilan && (
          <span className="flex min-w-0 items-center gap-1.5 text-ink-dim">
            <EmojiBelgi e={avatarBelgi(m.muallif.avatar)} olcham={14} />
            <span className="truncate">{m.muallif.ism}</span>
          </span>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-3">
          {!m.uringan && (
            <span className="flex items-center gap-1 text-brand-gold-d">
              <Icon name="coin" size={13} />+{ENG_KATTA_MUKOFOT}
            </span>
          )}
          <span className="flex items-center gap-0.5 font-display text-[13px] text-brand-blue">
            {t("masalaYechishTugma")}
            <Icon name="chevron" size={14} />
          </span>
        </span>
      </div>
    </button>
  );
}
