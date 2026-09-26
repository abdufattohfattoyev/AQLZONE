/**
 * O'YIN — pastki paneldagi uchinchi bo'lim (`manba/Oyin.dc.html`).
 *
 * Kurslardan ALOHIDA turadi: bu yerda dars yo'q, tartib yo'q, "keyingi
 * bob" yo'q.
 *
 * ──────────── YANGI DIZAYN (2026-09) ────────────
 *
 * Ilgari ekran "Yakka / Jamoaviy" tablariga bo'lingan edi va sakkizta
 * mashq kartasi faqat REKORDNI ko'rsatardi — eng yaxshi natija bir marta
 * qo'yiladi va keyin hech narsa demaydi. Endi tepadan pastga:
 *
 *   Tez o'yin     ko'k karta — duelga (ekrandagi yagona asosiy tugma)
 *   Bugun         bugungi maydon va kunlik son — ikkalasi kuniga bir marta
 *   Yakka o'yinlar har kartada OXIRGI natija, haftalik o'sish va oxirgi
 *                 7 natijaning kichik grafigi (`lib/oyin/grafik.ts`):
 *                 ko'k — oxirgi, oltin — shu yettitaning eng yaxshisi
 *   Boshqa        son ovi, karvon yo'li, tulki shaharchasi
 *   Do'stlar bilan xona o'yinlari va haftalik jadval
 *
 * Tablar olib tashlandi: jamoaviy o'yinlar pastda, bitta surishda —
 * tab ularni ko'pchilikdan butunlay yashirardi. Rangli (to'q sariq,
 * binafsha, jigarrang gradient) kartalar neytral qatorlarga aylandi:
 * dizayn qoidasi uch rangdan boshqasini bermaydi va yonma-yon turgan
 * besh rang qaysi narsa muhimligini yo'qotardi.
 */
import { useEffect, useMemo, useState } from "react";
import { duelTaklifOl } from "../lib/api";
import type { OyinlarJonli, XonaOyin } from "../lib/api";
import { useOyinlarJonli } from "../lib/oyinlarJonli";
import { XONA_OYINLAR } from "../lib/xonaOyinlar";
import { kunlikSonBugun } from "./KunlikSon";
import { sonOviBugun } from "./SonOvi";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { OYINLAR } from "../lib/oyin";
import type { Oyin, OyinId } from "../lib/oyin/tur";
import { maydonNatija, oxirgilar } from "../lib/oyin/rekord";
import { grafik, haftalikFarq, G } from "../lib/oyin/grafik";
import { qolganSoat } from "../lib/oyin/maydon";
import { useProgress } from "../lib/progress";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";

/** Har o'yinning 3D belgisi (`public/belgi`). */
const BELGI: Record<OyinId, string> = {
  tezkor: "chaqmoq", jadval: "kopaytir", belgi: "savol", ketma: "raqamlar",
  taxmin: "koz", tarozi: "tarozi", yigirma: "puzzle", xotira: "miya",
};

export function Oyinlar({
  onBack, onOyin, onMaydon, onKunlikSon, onSonOvi, onShaharcha, onKarvon, onJadval, onDuel, onJamoa, onQidiruv,
}: {
  onBack: () => void;
  onOyin: (id: string) => void;
  onMaydon: () => void;
  /** Kunlik son — Wordle uslubidagi jumboq. */
  onKunlikSon: () => void;
  /** Son ovi — to'rtta kartadan 24 ni chiqarish. */
  onSonOvi: () => void;
  /** Tulki shaharchasi — tangaga bino, kunlik hosil. */
  onShaharcha: () => void;
  /** Karvon yo'li — Ipak yo'li bo'ylab sarguzasht. */
  onKarvon: () => void;
  /** Daraja va haftalik jadval. */
  onJadval: () => void;
  /** Tez o'yin — duel. */
  onDuel: () => void;
  /** Jamoaviy o'yin — xona ochish ekrani. */
  onJamoa: (oyin: XonaOyin) => void;
  onQidiruv: () => void;
}) {
  // Bu tab ildizi: Telegram'ning orqaga tugmasi kerak emas (panelda
  // doim besh bo'lim bor). `onBack` faqat eski chaqiruvlar uchun qoldi.
  useOrqaga(onBack, false);
  const { jamiTanga } = useProgress();
  const bugun = maydonNatija();
  const sonBugun = kunlikSonBugun();
  // Kim qaysi o'yinda — Tez o'yin kartasi va o'yin kartalaridagi `• 2`.
  const jonli = useOyinlarJonli();
  // O'ynalganlar TEPADA (dizayndagidek): grafigi bor karta — odamning
  // o'z o'yinlari; "hali o'ynalmagan" lar pastda, taklif sifatida.
  const tartib = useMemo(
    () => [...OYINLAR].sort((a, b) => Number(oxirgilar(b.id).length > 0) - Number(oxirgilar(a.id).length > 0)),
    [],
  );

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3 px-4 pt-5 pb-3
                    min-[360px]:px-[18px] sm:max-w-[700px] lg:max-w-[1020px]">
      <header className="flex min-h-12 items-center gap-2.5">
        <h1 className="min-w-0 flex-1 truncate font-display text-[23px] min-[360px]:text-[26px]">{t("tabOyin")}</h1>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-gold/16 px-3 py-1.5 font-display
                         text-[16px] font-bold text-brand-gold-d" title={t("menTanga")}>
          <span aria-hidden className="size-4 rounded-full bg-brand-gold" />{jamiTanga}
        </span>
        <button type="button" onClick={onQidiruv} aria-label={t("qidiruvNom")} data-tahlil="O'yin: qidiruv"
          className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
          <Icon name="search" size={20} />
        </button>
      </header>

      <TezOyin jonli={jonli} onOch={onDuel} />

      {/* ---- bugun: maydon va kunlik son — ikkalasi ham kuniga bir marta ---- */}
      <div className="grid grid-cols-2 gap-2">
        <Kichik belgi={bugun ? "✅" : "🏟"} nom={t("maydon")} tahlil="O'yin: maydon" on={onMaydon}
          izoh={bugun ? t("maydonNatijangiz", { n: bugun.ball }) : t("maydonQolgan", { n: qolganSoat() })} />
        <Kichik belgi={sonBugun ? "✅" : "🔢"} nom={t("kunlikSon")} tahlil="O'yin: kunlik son" on={onKunlikSon}
          izoh={sonBugun ? t("kunlikSonYechildi") : t("kunlikSonIzoh")} />
      </div>

      <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="font-display text-[20px]">{t("oyinYakkaSarlavha")}</h2>
        <span aria-hidden className="flex shrink-0 items-center gap-3 text-[12px] font-semibold text-ink-dim">
          <span className="flex items-center gap-1"><span className="size-[9px] rounded-full bg-brand-blue" />{t("oyinOxirgi")}</span>
          <span className="flex items-center gap-1"><span className="size-[9px] rounded-full bg-brand-gold" />{t("oyinRekord")}</span>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {tartib.map((o) => (
          <OyinKarta key={o.id} o={o} onOch={() => onOyin(o.id)} hozir={jonli?.oyinlar[o.id] ?? 0} />
        ))}
      </div>

      <h2 className="mt-2 font-display text-[20px]">{t("oyinBoshqa")}</h2>
      <Royxat>
        <Qator belgi="🎯" nom={t("sonOvi")} tahlil="O'yin: son ovi" on={onSonOvi}
          izoh={sonOviBugun() > 0 ? t("sonOviBugun", { n: sonOviBugun() }) : t("sonOviIzoh")} />
        <Qator belgi="🐫" nom={t("karvonTitul")} izoh={t("karvonIzoh")} tahlil="O'yin: karvon yo'li" on={onKarvon} />
        <Qator belgi="🦊" nom={t("shTitul")} izoh={t("shIzoh")} tahlil="O'yin: shaharcha" on={onShaharcha} />
      </Royxat>

      <h2 className="mt-2 font-display text-[20px]">{t("oyinDostlar")}</h2>
      <Royxat>
        {(Object.keys(XONA_OYINLAR) as XonaOyin[]).map((k) => {
          const m = XONA_OYINLAR[k];
          return (
            <Qator key={k} belgi={m.emoji} nom={t(m.nom)} tahlil={`O'yin: xona ${k}`} on={() => onJamoa(k)}
              izoh={`${t(m.izoh)} · ${t("xonaKishi", { min: m.min, max: m.max })}`} />
          );
        })}
        <Qator belgi="🏆" nom={t("tjJadval")} izoh={t("tjJadvalIzoh")} tahlil="O'yin: haftalik jadval" on={onJadval} />
      </Royxat>
    </div>
  );
}

/**
 * TEZ O'YIN — duelga olib boradi.
 *
 * Izohda tirik holat, muhimlik tartibida (eski duel bannerining qoidasi):
 * sizni kutayotganlar → hozir o'yinda → ilovada → hech kim ("0 kishi"
 * yozilmaydi — nol son bo'limni o'lik ko'rsatadi).
 */
function TezOyin({ jonli, onOch }: { jonli: OyinlarJonli | null; onOch: () => void }) {
  const [navbat, setNavbat] = useState(0);
  useEffect(() => {
    let bekor = false;
    duelTaklifOl().then((h) => { if (!bekor && h) setNavbat(h.navbat); });
    return () => { bekor = true; };
  }, []);
  const oyinda = jonli?.oyinda ?? 0;
  const onlayn = jonli?.onlayn ?? 0;
  const izoh = navbat > 0 ? t("duelKutyaptiBelgi", { n: navbat })
    : oyinda > 0 ? t("duelBannerOyinda", { n: oyinda })
    : onlayn > 0 ? t("duelBannerOnlayn", { n: onlayn })
    : t("tezOyinIzoh");

  return (
    <button type="button" onClick={onOch} data-tahlil="O'yin: tez o'yin"
      className="tugma-3d flex w-full items-center gap-3 rounded-[24px] bg-brand-blue px-3.5 py-3.5 text-left
                 text-white shadow-[0_5px_0_var(--color-brand-blue-d)] min-[360px]:gap-3.5 min-[360px]:px-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/18 min-[360px]:size-[54px]">
        <img src="/belgi/chaqmoq.webp" alt="" width={30} height={30} className="size-[30px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-display text-[19px] leading-tight font-bold min-[360px]:text-[21px]">{t("tezOyin")}</span>
        <span className="truncate text-[14px] font-semibold opacity-90">{izoh}</span>
      </span>
      <span className="grid min-h-11 shrink-0 place-items-center rounded-[14px] bg-white px-3 font-display text-[16px]
                       font-bold text-brand-blue-d min-[360px]:px-4">
        {t("tezOyinTugma")}
      </span>
    </button>
  );
}

/** Kuniga bir martalik o'yin — kichik neytral karta. */
function Kichik({ belgi, nom, izoh, tahlil, on }: {
  belgi: string; nom: string; izoh: string; tahlil: string; on: () => void;
}) {
  return (
    <button type="button" onClick={on} data-tahlil={tahlil}
      className="clay-press flex min-w-0 items-center gap-2 rounded-[18px] bg-karta p-2.5 text-left shadow-clay-sm">
      <span className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-track">
        <EmojiBelgi e={belgi} olcham={22} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="line-clamp-2 text-[14px] leading-tight font-bold">{nom}</span>
        <span className="truncate text-[12px] leading-snug text-ink-dim">{izoh}</span>
      </span>
    </button>
  );
}

/**
 * Bitta yakka o'yin: nom · oxirgi natija va haftalik o'sish · grafik.
 *
 * Grafikda o'q, to'r va raqam yo'q — faqat past chiziq. Ekran o'quvchi
 * uchun `aria-label` da yettala son aytiladi.
 */
function OyinKarta({ o, onOch, hozir }: { o: Oyin; onOch: () => void; hozir: number }) {
  const r = useMemo(() => oxirgilar(o.id), [o.id]);
  const g = grafik(r.map((x) => x.b));
  const farq = haftalikFarq(r);
  const nom = t(o.nom);

  return (
    <button type="button" onClick={onOch} data-tahlil={`O'yin: ${o.id}`}
      title={hozir > 0 ? `${nom} · ${t("oyinKartaHozir", { n: hozir })}` : nom}
      className="clay-press flex min-w-0 flex-col gap-1 rounded-[18px] bg-karta px-3 pt-2.5 pb-2 text-left shadow-clay-sm">
      <span className="flex w-full items-center gap-2">
        <img src={`/belgi/${BELGI[o.id]}.webp`} alt="" width={24} height={24} className="size-6 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-[14px] leading-tight font-bold">{nom}</span>
        {/* Hozir o'ynayotganlar — nol bo'lsa umuman chizilmaydi. */}
        {hozir > 0 && <span aria-hidden className="az-jonli size-2 shrink-0 rounded-full bg-brand-green" />}
      </span>

      {g ? (
        <>
          <span className="flex items-baseline gap-1.5">
            <span className="font-display text-[20px] leading-none font-bold tabular-nums">{g.oxirgi.qiymat}</span>
            {farq !== null && farq !== 0 && (
              <span className="truncate text-[12px] font-bold text-brand-blue-t">
                {t(farq > 0 ? "oyinHaftaOsdi" : "oyinHaftaTushdi", { n: Math.abs(farq) })}
              </span>
            )}
          </span>
          <svg viewBox={`0 0 ${G.W} ${G.H}`} preserveAspectRatio="none" role="img"
            aria-label={t("oyinGrafikAria", { nom, sonlar: r.map((x) => x.b).join(", "), rekord: g.rekord.qiymat })}
            className="block h-[34px] w-full overflow-visible">
            <line x1="0" y1={G.PAST} x2={G.W} y2={G.PAST} strokeWidth="1" className="stroke-track" />
            <path d={g.maydon} className="fill-brand-blue/10" />
            <path d={g.chiziq} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              vectorEffect="non-scaling-stroke" className="stroke-brand-blue" />
          </svg>
          {/* Nuqtalar SVG ustida HTML bilan: `preserveAspectRatio="none"`
              SVG ichidagi doirani ellipsga cho'zardi. */}
          <Nuqtalar g={g} />
        </>
      ) : (
        <>
          <span className="pt-0.5 text-[13px] leading-snug text-ink-dim">{t("oyinOynalmagan")}</span>
          <span aria-hidden className="mt-auto block h-[34px] border-b-[1.5px] border-dashed border-track" />
        </>
      )}
    </button>
  );
}

/** Grafik nuqtalari — foizda joylashadi, ya'ni karta kengligiga moslashadi. */
function Nuqtalar({ g }: { g: NonNullable<ReturnType<typeof grafik>> }) {
  const joy = (x: number, y: number) => ({ left: `${(x / G.W) * 100}%`, top: `${y - G.H}px` });
  return (
    <span aria-hidden className="relative -mt-1 block h-1">
      {!g.birlashgan && (
        <span style={joy(g.oxirgi.x, g.oxirgi.y)}
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue ring-2 ring-karta" />
      )}
      <span style={joy(g.rekord.x, g.rekord.y)}
        className={`absolute size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gold ring-2 ${
          g.birlashgan ? "ring-brand-blue" : "ring-karta"}`} />
    </span>
  );
}

function Royxat({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
      {children}
    </div>
  );
}

function Qator({ belgi, nom, izoh, tahlil, on }: {
  belgi: string; nom: string; izoh: string; tahlil: string; on: () => void;
}) {
  return (
    <button type="button" onClick={on} data-tahlil={tahlil}
      className="clay-press flex min-h-[58px] w-full items-center gap-3 px-3.5 py-2 text-left">
      <EmojiBelgi e={belgi} olcham={26} className="shrink-0" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15.5px] leading-tight font-bold">{nom}</span>
        <span className="truncate text-[13px] leading-snug text-ink-dim">{izoh}</span>
      </span>
      <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
    </button>
  );
}
