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
 * Endi kartada uch qavat (`manba/Masalalar.dc.html`):
 *
 *   tepa   muallif (bosh harflari va ismi) · sinf
 *   o'rta  masala matni va chizmasi — kartaning ASOSIY qismi
 *   past   bitta amal: "Yechish" — yoki yechgan bo'lsa "Yechgansiz ✓"
 *
 * Yangi dizaynda tanga belgisi ham kartadan tushdi: mukofot masala
 * ekranida, "Tekshirish" tugmasining o'zida turadi.
 */
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
  const yechgan = m.uringan && m.birinchiTogri;

  return (
    <button type="button" onClick={on} data-tahlil="Masala kartasi"
      className="clay-press flex w-full flex-col gap-2.5 rounded-[22px] bg-karta p-4 text-left shadow-clay-sm">
      {/* ---- tepa: muallif · sinf (o'z masalasida — holati) ---- */}
      <span className="flex w-full items-center gap-2.5">
        {muallifBilan && (
          <>
            <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-blue/12
                                         text-[13px] font-bold text-brand-blue-t">
              {bosHarflar(m.muallif.ism)}
            </span>
            <span className="min-w-0 flex-1 truncate text-[14px] font-bold text-ink-soft">{m.muallif.ism}</span>
          </>
        )}
        {m.holat === "kutmoqda" && (
          <span className={`text-[13px] text-ink-dim ${muallifBilan ? "" : "flex-1"}`}>{t("masalaKutmoqda")}</span>
        )}
        {m.holat === "rad" && (
          <span className={`text-[13px] text-brand-red ${muallifBilan ? "" : "flex-1"}`}>{t("masalaRad")}</span>
        )}
        {!muallifBilan && m.holat === "tasdiq" && <span className="flex-1" />}
        <span className="shrink-0 text-[13px] text-ink-dim">{sinfNomi(m.sinf)}</span>
      </span>

      {/* ---- matn ---- */}
      <span className="line-clamp-4 text-[16px] leading-[1.4]">{m.matn}</span>

      {m.rasm && (
        <img src={m.rasm} alt="" loading="lazy"
          className="max-h-52 w-full rounded-2xl bg-sahna object-contain" />
      )}

      {/* ---- past: bitta amal ----
          Faqat YECHGANI belgilanadi — odatiy holat belgisiz. */}
      {yechgan ? (
        <span className="text-[14px] font-bold text-brand-green-d">{t("masalaYechgansiz")} ✓</span>
      ) : (
        <span className="grid min-h-10 place-items-center self-start rounded-xl bg-brand-blue/10 px-[18px]
                         text-[15px] font-bold text-brand-blue-t">
          {t("masalaYechishTugma")}
        </span>
      )}
    </button>
  );
}

/** "Sardor Aliyev" → "SA". */
function bosHarflar(ism: string): string {
  return ism.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("") || "?";
}
