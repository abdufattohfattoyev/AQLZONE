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
 * Endi kartada uch qavat (Masalalar kanvasi, 2026-09):
 *
 *   tepa   muallif (neytral bosh harflar, ismi) · qachon yozilgan
 *   o'rta  masala matni (3 qator) — chizmasi bo'lsa o'ngda kichik rasm
 *   past   sinf · yechgan bo'lsa yashil "✓ Yechgansiz", aks holda
 *          mukofot ("+10" tanga)
 *
 * Ilgari pastda "Yechish" tugmasi turardi — butun karta baribir
 * bosiladi, tugma esa har kartada takrorlanib shovqin berardi. Rasm
 * ham to'liq kenglikda emas: u ro'yxatni cho'zib, keyingi masalani
 * ekrandan chiqarib yuborardi.
 */
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { sinfNomi } from "../lib/masalaSinf";
import { mukofot } from "../lib/masalaTanga";
import type { Masala } from "../lib/masala";

interface Props {
  m: Masala;
  on: () => void;
  /** Muallif yozuvi ko'rsatilsinmi. Muallif sahifasida u ortiqcha. */
  muallifBilan?: boolean;
}

export function MasalaKarta({ m, on, muallifBilan = true }: Props) {
  const yechgan = m.uringan && m.birinchiTogri;
  const vaqt = qachon(m.createdAt);

  return (
    <button type="button" onClick={on} data-tahlil="Masala kartasi"
      className="clay-press flex w-full flex-col gap-2 rounded-[20px] bg-karta px-4 pt-3.5 pb-3 text-left
                 shadow-clay-sm">
      {/* ---- tepa: muallif · qachon (o'z masalasida — holati) ---- */}
      <span className="flex w-full min-w-0 items-center gap-2">
        {muallifBilan && (
          <>
            <span aria-hidden className="grid size-[26px] shrink-0 place-items-center rounded-full bg-track
                                         text-[11.5px] font-bold text-ink-soft">
              {bosHarflar(m.muallif.ism)}
            </span>
            <span className="min-w-0 truncate text-[13.5px] font-bold text-ink-soft">{m.muallif.ism}</span>
          </>
        )}
        {vaqt && <span className="shrink-0 text-[13px] text-ink-dim">{muallifBilan ? `· ${vaqt}` : vaqt}</span>}
        <span className="flex-1" />
        {m.holat === "kutmoqda" && <span className="shrink-0 text-[13px] text-ink-dim">{t("masalaKutmoqda")}</span>}
        {m.holat === "rad" && <span className="shrink-0 text-[13px] text-brand-red">{t("masalaRad")}</span>}
      </span>

      {/* ---- matn va chizma ---- */}
      <span className="flex w-full items-start gap-3">
        <span className="line-clamp-3 min-w-0 flex-1 text-[16px] leading-[1.45]">{m.matn}</span>
        {m.rasm && (
          <img src={m.rasm} alt="" loading="lazy"
            className="size-[52px] shrink-0 rounded-[14px] bg-sahna object-contain min-[360px]:size-16" />
        )}
      </span>

      {/* ---- past: sinf · holat yoki mukofot ----
          Faqat YECHGANI belgilanadi — odatiy holat belgisiz. */}
      <span className="flex min-h-7 w-full items-center">
        <span className="flex-1 text-[13px] text-ink-dim">{sinfNomi(m.sinf)}</span>
        {yechgan ? (
          <span className="flex items-center gap-1.5 text-[14px] font-bold text-brand-green-d">
            <span className="grid size-[18px] place-items-center rounded-full bg-brand-green text-white">
              <Icon name="check" size={12} />
            </span>
            {t("masalaYechgansiz")}
          </span>
        ) : m.holat === "tasdiq" && !m.meniki && (
          <span className="flex items-center gap-1 text-[14px] font-bold text-brand-gold-d">
            <Icon name="coin" size={15} className="text-brand-gold" />+{mukofot(1)}
          </span>
        )}
      </span>
    </button>
  );
}

/** "Sardor Aliyev" → "SA". */
function bosHarflar(ism: string): string {
  return ism.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("") || "?";
}

/** Qachon yozilgani: "hozir", "40 daq", "3 soat", "kecha", "5 kun" — keyin sana. */
function qachon(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const daq = Math.max(0, Math.round((Date.now() - d) / 60000));
  if (daq < 2) return t("vaqtHozir");
  if (daq < 60) return t("vaqtDaqiqa", { n: daq });
  const soat = Math.round(daq / 60);
  if (soat < 24) return t("vaqtSoat", { n: soat });
  const kun = Math.round(soat / 24);
  if (kun === 1) return t("vaqtKecha");
  if (kun < 30) return t("vaqtKun", { n: kun });
  const s = new Date(d);
  return `${String(s.getDate()).padStart(2, "0")}.${String(s.getMonth() + 1).padStart(2, "0")}.${s.getFullYear()}`;
}
