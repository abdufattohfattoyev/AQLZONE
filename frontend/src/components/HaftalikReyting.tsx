/**
 * HAFTALIK REYTING — DTM va milliy sertifikat variantlari.
 *
 * Ikki ko'rinish:
 *
 *   ReytingKarta   natija ekranida: "Bu hafta 5-variant · siz 3-o'rin,
 *                  12 kishidan". Bosilsa — to'liq jadval.
 *   ReytingJadval  alohida sahifa: umumiy yoki variant bo'yicha.
 *
 * Hisobga har variantning BIRINCHI urinishi kiradi (`core/imtihon.py`):
 * variant har safar bir xil chiqadi va ikkinchi urinishda javoblar
 * allaqachon ko'rilgan. Qayta ishlagan odamga karta buni ochiq aytadi —
 * "nega 30/30 qilganim ko'rinmayapti?" degan savol qolmasin.
 *
 * Rang: o'rinlar va sovrin — oltin (reyting rangi), o'zim — ko'k.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import type { ImtTur, Reyting, ReytingQator } from "../lib/imtihon";
import { VARIANTLAR, haftalikReyting, oxirgiJavob } from "../lib/imtihon";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";

/** "67,4" — sertifikat balli; DTM da "24/30". */
const natija = (q: ReytingQator) =>
  (q.ball !== null ? q.ball.toFixed(1).replace(".", ",") : `${q.togri}/${q.jami}`);

/** Sekund → "54:12" yoki "2:41:05". */
function vaqt(s: number): string {
  const h = Math.floor(s / 3600);
  const d = Math.floor((s % 3600) / 60);
  const q = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(d).padStart(2, "0")}:${q}` : `${d}:${q}`;
}

/* ==================== ro'yxatdagi eshiklar ==================== */

/**
 * Variantlar ro'yxatidagi ikki qator: haftalik reyting va oxirgi
 * urinishni ko'rib chiqish (bo'lsa). Bitta kartada — ikkalasi ham
 * "natijadan keyin" degan bitta mavzu, alohida kartalar shovqin qilardi.
 */
export function ImtEshiklar({ tur, onReyting, onKorish }: {
  tur: ImtTur;
  onReyting: () => void;
  onKorish: (n: number) => void;
}) {
  const [oxirgi] = useState(() => oxirgiJavob(tur));
  const nom = tur === "dtm" ? "DTM" : "Sertifikat";
  return (
    <div className="flex flex-col divide-y divide-track overflow-hidden rounded-clay bg-karta shadow-clay-sm">
      <button type="button" onClick={onReyting} data-tahlil={`${nom}: haftalik reyting`}
        className="clay-press flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-gold/20 text-brand-gold-d">
          <Icon name="trophy" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[16px] leading-tight">{t("hrSarlavha")}</span>
          <span className="block truncate text-[13px] text-ink-dim">{t("hrKirishIzoh")}</span>
        </span>
        <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
      </button>
      {oxirgi && (
        <button type="button" onClick={() => onKorish(oxirgi.variant)} data-tahlil={`${nom}: oxirgi urinishni ko'rib chiqish`}
          className="clay-press flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-track text-ink-soft">
            <Icon name="search" size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[16px] leading-tight">{t("korishOxirgi", { n: oxirgi.variant })}</span>
            <span className="block truncate text-[13px] text-ink-dim">{t("korishOxirgiIzoh")}</span>
          </span>
          <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
        </button>
      )}
    </div>
  );
}

/* ==================== natija ekranidagi karta ==================== */

/**
 * `tayyor` — urinish serverga yozilgach beriladigan Promise: jadval
 * undan KEYIN so'raladi, aks holda odam o'zini jadvalda ko'rmasdi.
 * `urinishVaqt` — shu urinishning vaqti (qayta ishlashni aniqlash uchun).
 */
export function ReytingKarta({ tur, variant, tayyor, urinishVaqt, onOch }: {
  tur: ImtTur;
  variant: number;
  tayyor: Promise<void>;
  urinishVaqt: number;
  onOch: () => void;
}) {
  const [r, setR] = useState<Reyting | null | "xato">(null);
  useEffect(() => {
    let tirik = true;
    tayyor.then(() => haftalikReyting(tur, variant))
      .then((x) => { if (tirik) setR(x); })
      .catch(() => { if (tirik) setR("xato"); });
    return () => { tirik = false; };
  }, [tur, variant, tayyor]);

  // Internet yo'q — karta chiqmaydi: natijaning o'zi baribir ko'rinadi.
  if (r === "xato") return null;
  const m = r?.meniki ?? null;
  const qayta = m?.vaqt !== undefined && m.vaqt !== urinishVaqt;

  return (
    <button type="button" onClick={() => { tebrat("tanlov"); onOch(); }} disabled={!r}
      data-tahlil={`${tur === "dtm" ? "DTM" : "Sertifikat"}: haftalik reyting (natija)`}
      className="clay-press flex w-full items-center gap-3 rounded-[20px] bg-karta p-3.5 text-left shadow-clay-sm">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-gold/20 text-brand-gold-d">
        <Icon name="trophy" size={22} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold text-ink-dim">{t("hrKarta", { n: variant })}</span>
        <span className="block font-display text-[17px] leading-tight">
          {!r ? t("hrYuklanmoqda")
            : m ? t("hrKartaSiz", { o: m.orin, n: r.ishlagan }) : t("hrIshladi", { n: r.ishlagan })}
        </span>
        {qayta && <span className="mt-0.5 block text-[12.5px] text-ink-dim">{t("hrKartaQayta")}</span>}
      </span>
      <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
    </button>
  );
}

/* ==================== to'liq jadval ==================== */

export function ReytingJadval({ tur, boshVariant, strelka, onChiq, onVariantBoshla }: {
  tur: ImtTur;
  /** Manzildan (`?variant=5`) — natija kartasidan kelganda o'sha variant ochiq. */
  boshVariant: number | null;
  /** O'z orqaga strelkasini chizish kerakmi (`useOrqaga` natijasi). */
  strelka: boolean;
  onChiq: () => void;
  onVariantBoshla: (n: number) => void;
}) {
  const [variant, setVariant] = useState<number | null>(boshVariant);
  const [r, setR] = useState<Reyting | null | "xato">(null);

  useEffect(() => {
    let tirik = true;
    setR(null);
    haftalikReyting(tur, variant)
      .then((x) => { if (tirik) setR(x); })
      .catch(() => { if (tirik) setR("xato"); });
    return () => { tirik = false; };
  }, [tur, variant]);

  const sonlar = r && r !== "xato" ? r.variantlar : {};
  const tanlov: { v: number | null; nom: string }[] = [
    { v: null, nom: t("hrUmumiy") },
    ...Array.from({ length: VARIANTLAR }, (_, i) => ({ v: i + 1, nom: String(i + 1) })),
  ];
  const royxatda = r && r !== "xato" && r.meniki ? r.qatorlar.some((q) => q.men) : true;

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3 px-4 pt-4 pb-10 min-[360px]:px-[18px]
                    sm:max-w-[560px] kom:max-w-[720px] kom:px-8 kom:pt-8">
      <div className="flex items-center gap-2">
        {strelka && (
          <button type="button" onClick={onChiq} aria-label={t("ortga")} title={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[22px] leading-tight">{t("hrSarlavha")}</h1>
          <p className="truncate text-[13px] text-ink-dim">{tur === "dtm" ? t("hrDtm") : t("hrSert")}</p>
        </div>
      </div>

      {/* Variant tanlovi — gorizontal aylanadi. Shu hafta hech kim
          ishlamagan variant xira, lekin bosiladi (bo'sh jadval o'zi aytadi). */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] min-[360px]:-mx-[18px]
                      min-[360px]:px-[18px]">
        {tanlov.map((x) => {
          const faol = variant === x.v;
          const bor = x.v === null || (sonlar[String(x.v)] ?? 0) > 0;
          return (
            <button key={x.nom} type="button" aria-pressed={faol}
              onClick={() => { tebrat("tanlov"); setVariant(x.v); }}
              data-tahlil={x.v === null ? "Haftalik reyting: umumiy" : "Haftalik reyting: variant"}
              className={`clay-press min-h-11 shrink-0 rounded-full px-4 font-display text-[15px] font-bold ${
                faol ? "bg-brand-blue text-white" : `bg-karta shadow-clay-sm ${bor ? "text-ink" : "text-ink-dim"}`}`}>
              {x.nom}
            </button>
          );
        })}
      </div>

      {r === null && <p className="py-8 text-center text-[14.5px] text-ink-dim">{t("hrYuklanmoqda")}</p>}
      {r === "xato" && <p className="py-8 text-center text-[14.5px] text-ink-dim">{t("hrXato")}</p>}

      {r && r !== "xato" && (r.qatorlar.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[22px] bg-karta p-6 text-center shadow-clay-sm">
          <span className="grid size-14 place-items-center rounded-3xl bg-brand-gold/20 text-brand-gold-d">
            <Icon name="trophy" size={26} />
          </span>
          <p className="font-display text-[18px] leading-tight">{t("hrBosh")}</p>
          <p className="text-[14px] text-ink-dim">{t("hrBoshIzoh")}</p>
          <button type="button" onClick={() => onVariantBoshla(variant ?? 1)} data-tahlil="Haftalik reyting: variantni boshlash"
            className="tugma-3d mt-2 min-h-[52px] w-full rounded-2xl bg-brand-blue font-display text-[17px] font-bold
                       text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("hrBoshla", { n: variant ?? 1 })}
          </button>
        </div>
      ) : (
        <>
          <p className="px-1 text-[13px] font-semibold text-ink-dim">{t("hrIshladi", { n: r.ishlagan })}</p>
          <ol className="flex flex-col divide-y divide-track overflow-hidden rounded-[22px] bg-karta shadow-clay-sm">
            {r.qatorlar.map((q) => <Qator key={`${q.orin}-${q.ism}`} q={q} umumiy={variant === null} />)}
          </ol>
          {!royxatda && r.meniki && (
            <ol className="overflow-hidden rounded-[22px] bg-karta shadow-clay-sm">
              <Qator q={r.meniki} umumiy={variant === null} />
            </ol>
          )}
        </>
      ))}

      <p className="px-1 text-[13px] leading-snug text-ink-dim">{t("hrIzoh")}</p>
    </div>
  );
}

/** Jadval qatori: o'rin · ism (umumiyda variant) · natija va vaqt. */
function Qator({ q, umumiy }: { q: ReytingQator; umumiy: boolean }) {
  const sovrin = q.orin <= 3;
  return (
    <li className={`flex min-h-14 items-center gap-3 px-3.5 py-2 ${q.men ? "bg-brand-blue/10" : ""}`}>
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold ${
        sovrin ? "bg-brand-gold/20 text-brand-gold-d" : "text-ink-soft"}`}>
        {q.orin}
      </span>
      <span className="min-w-0 flex-1">
        {/* To'liq ism (`core/imtihon.haftalik_reyting`). O'zimniki — ism
            va "siz"; ismsiz odam — neytral "Ishtirokchi" (server bo'sh
            qaytaradi: "Do'stingiz" jadvalda notanishni do'st deb atardi). */}
        <span className={`block truncate text-[15px] ${q.men ? "font-bold text-brand-blue-t" : "font-semibold"}`}>
          {q.men ? (q.ism ? `${q.ism} · ${t("siz")}` : t("hrSiz")) : q.ism || t("hrAnonim")}
        </span>
        {umumiy && <span className="block text-[12.5px] text-ink-dim">{t("hrVariantQisqa", { n: q.variant })}</span>}
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="font-display text-[17px] leading-tight font-bold tabular-nums">{natija(q)}</span>
        <span className="text-[12px] text-ink-dim tabular-nums">{vaqt(q.sekund)}</span>
      </span>
    </li>
  );
}
