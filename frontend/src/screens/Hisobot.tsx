/**
 * O'QUVCHINING O'Z HISOBOTI.
 *
 * ─────────────── NEGA OTA-ONA PANELIDAN ALOHIDA ───────────────
 *
 * `OtaOna.tsx` allaqachon bor va u haftalik faollikni ko'rsatadi.
 * Lekin u BOSHQA ODAMGA yozilgan: "farzandingiz shu hafta 4 kun
 * mashq qildi", "qiyin mavzular". Bu 8 yoshli bolaning onasiga
 * to'g'ri keladi.
 *
 * 17 yoshli o'quvchiga esa yo'q. U ilovani o'zi ochadi, o'zi
 * tayyorlanadi va hisobotni ham O'ZI o'qiydi. Unga kerak bo'lgan
 * savol bitta: "men o'sayapmanmi?"
 *
 * Shuning uchun bu yerda uchinchi shaxs yo'q, maqtov yo'q, kunlik
 * zanjir ham yo'q. Faqat: nechta test topshirilgan, o'rtacha ball
 * qancha va u O'SAYAPTIMI.
 *
 * ─────────────── O'SISH QANDAY O'LCHANADI ───────────────
 *
 * Oxirgi beshta test bilan undan oldingi beshtaning o'rtachasi
 * taqqoslanadi. Nega beshta: bitta test tasodifga juda bog'liq —
 * savollar o'sha kuni qanday tushganiga, charchoqqa, shoshilishga.
 * Ikki-uchta ham kam. Besh esa allaqachon yo'nalishni ko'rsatadi va
 * uni yig'ish uchun oy kutish shart emas.
 *
 * Beshta test to'planmaguncha o'sish umuman ko'rsatilmaydi. "Sizning
 * natijangiz 40% tushdi" degan yozuvni ikkinchi testdan keyin
 * ko'rsatish — yolg'on va u odamni tashlab ketishga undaydi.
 */
import { useMemo } from "react";
import { Icon } from "../lib/icons";
import { foiz, natijalar } from "../lib/blok";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";

/** Grafikda nechta oxirgi test ko'rsatiladi. */
const USTUN = 12;

/** O'sish shu qadar test to'plangandan keyin hisoblanadi. */
const OSISH_KERAK = 5;

export function Hisobot({ sinf, onBack, onBlok }: {
  sinf: number;
  onBack: () => void;
  onBlok: () => void;
}) {
  const ozStrelka = useOrqaga(onBack);

  // Faqat SHU sinfning testlari: 9-sinfda o'tilgan test 10-sinfdagi
  // o'sish grafigiga aralashsa, ikkalasi ham noto'g'ri ko'rinardi.
  const hammasi = useMemo(
    () => natijalar().filter((n) => n.sinf === sinf),
    [sinf],
  );

  const ballar = useMemo(() => hammasi.map(foiz), [hammasi]);

  /**
   * O'sish: oxirgi beshta va undan oldingi beshtaning farqi.
   * Ma'lumot yetmasa `null` — va o'shanda blok umuman chizilmaydi.
   *
   * Hook ATAYLAB erta chaqiriladi, ro'yxat bo'shligini tekshirishdan
   * OLDIN: React hooklarning tartibi har renderda bir xil bo'lishini
   * talab qiladi, shartdan keyin turgan hook esa birinchi testdan
   * so'ng ilovani yiqitardi.
   */
  const osish = useMemo(() => {
    if (ballar.length < OSISH_KERAK * 2) return null;
    const ort = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
    const yangi = ort(ballar.slice(-OSISH_KERAK));
    const eski = ort(ballar.slice(-OSISH_KERAK * 2, -OSISH_KERAK));
    return Math.round(yangi - eski);
  }, [ballar]);

  if (!hammasi.length) return <Bosh onBack={onBack} onBlok={onBlok} ozStrelka={ozStrelka} />;

  const oxirgilar = hammasi.slice(-USTUN);
  const ortacha = Math.round(ballar.reduce((a, b) => a + b, 0) / ballar.length);
  const eng = Math.max(...ballar);
  const jamiVaqt = hammasi.reduce((s, n) => s + n.sekund, 0);

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-10">
      <div className="flex items-center gap-3">
        {ozStrelka && (
          <button type="button" onClick={onBack} title={t("ortga")}
            className="clay-press grid size-11 place-items-center rounded-2xl bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="font-display text-[18px]">{t("hisobotSarlavha")}</h1>
      </div>

      {/* ---- asosiy raqamlar ---- */}
      <div className="az-kirish mt-4 grid grid-cols-3 gap-2">
        <Katak v={`${ortacha}%`} l={t("hisobotOrtacha")} c="text-brand-green-d" />
        <Katak v={`${eng}%`} l={t("hisobotEng")} c="text-brand-gold" />
        <Katak v={hammasi.length} l={t("hisobotTest")} />
      </div>

      {/* ---- o'sish ---- */}
      {osish !== null && (
        <div className="az-kirish mt-3 flex items-center gap-3 rounded-clay bg-karta p-4 shadow-clay-sm"
          style={{ "--az-kech": "60ms" } as React.CSSProperties}>
          <span className={`grid size-11 shrink-0 place-items-center rounded-2xl text-white
            ${osish > 0 ? "bg-brand-green" : osish < 0 ? "bg-brand-orange" : "bg-brand-blue"}`}>
            {/* Strelka yuqoriga yoki pastga: `chevron` 90° buriladi. */}
            <Icon name="chevron" size={20} className={osish >= 0 ? "-rotate-90" : "rotate-90"} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] leading-tight">
              {osish > 0 ? t("hisobotOsdi", { n: osish })
                : osish < 0 ? t("hisobotTushdi", { n: -osish })
                : t("hisobotTekis")}
            </div>
            <div className="mt-0.5 text-[11.5px] leading-snug text-ink-dim">{t("hisobotOsishIzoh")}</div>
          </div>
        </div>
      )}

      {/* ---- grafik ----
          Ustunlar SVG emas, oddiy `div`: o'nta to'rtburchak uchun
          kutubxona ham, koordinata hisobi ham keraksiz. */}
      <h2 className="az-kirish mt-6 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("hisobotGrafik")}
      </h2>
      <div className="az-kirish rounded-clay bg-karta p-4 shadow-clay-sm">
        <div className="flex h-32 items-end gap-1.5">
          {oxirgilar.map((n, i) => {
            const f = foiz(n);
            return (
              <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                {/* Balandlik foizdan. Eng past ustun ham ko'rinib
                    tursin: nol foizli test ham topshirilgan test va u
                    grafikdan yo'qolib qolmasligi kerak. */}
                <div className="flex w-full flex-1 items-end">
                  <div className={`w-full rounded-t-md transition-[height]
                    ${f >= 80 ? "bg-brand-green" : f >= 50 ? "bg-brand-orange" : "bg-brand-red"}`}
                    style={{ height: `${Math.max(6, f)}%` }} />
                </div>
                <span className="text-[9px] leading-none text-ink-dim">{f}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-center text-[11px] text-ink-dim">
          {t("hisobotOxirgi", { n: oxirgilar.length })}
        </div>
      </div>

      {/* ---- ro'yxat ---- */}
      <h2 className="az-kirish mt-6 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("hisobotTarix")}
      </h2>
      <div className="az-kirish space-y-2">
        {[...hammasi].reverse().slice(0, 20).map((n, i) => (
          <div key={i} className="flex items-center gap-3 rounded-clay bg-karta p-3 shadow-clay-sm">
            <span className={`grid size-10 shrink-0 place-items-center rounded-2xl font-display text-[13px]
              text-white ${foiz(n) >= 80 ? "bg-brand-green" : foiz(n) >= 50 ? "bg-brand-orange" : "bg-brand-red"}`}>
              {foiz(n)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] leading-tight">
                {t("hisobotQator", { a: n.togri, b: n.jami })}
              </span>
              <span className="mt-0.5 block text-[11px] text-ink-dim">
                {sana(n.vaqt)} · {daqiqa(n.sekund)}
                {n.ulgurmadi > 0 && ` · ${t("blokUlgurmadiN", { n: n.ulgurmadi })}`}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 text-center text-[12px] text-ink-dim">{t("hisobotJamiVaqt", { v: daqiqa(jamiVaqt) })}</div>

      <button type="button" onClick={onBlok}
        className="az-yaltir tugma-3d mt-4 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[16px]
                   text-white shadow-[0_6px_0_var(--color-brand-green-d)]">
        {t("hisobotYangiTest")}
      </button>
    </div>
  );
}

/* ---------------- hali test topshirilmagan ---------------- */

function Bosh({ onBack, onBlok, ozStrelka }: {
  onBack: () => void;
  onBlok: () => void;
  ozStrelka: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-10">
      <div className="flex items-center gap-3">
        {ozStrelka && (
          <button type="button" onClick={onBack} title={t("ortga")}
            className="clay-press grid size-11 place-items-center rounded-2xl bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="font-display text-[18px]">{t("hisobotSarlavha")}</h1>
      </div>

      <div className="az-kirish mt-6 rounded-clay bg-karta p-6 text-center shadow-clay-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-brand-blue text-white
                         shadow-[0_6px_0_var(--color-brand-blue-d)]">
          <Icon name="chart" size={26} />
        </span>
        <p className="mt-4 text-[13.5px] leading-snug text-ink-dim">{t("natijamBosh")}</p>
        <button type="button" onClick={onBlok}
          className="clay-press mt-5 h-12 w-full rounded-3xl bg-brand-green font-display text-[15px]
                     text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
          {t("hisobotYangiTest")}
        </button>
      </div>
    </div>
  );
}

/* ---------------- yordamchilar ---------------- */

function Katak({ v, l, c = "" }: { v: string | number; l: string; c?: string }) {
  return (
    <div className="rounded-clay bg-karta px-2 py-3 text-center shadow-clay-sm">
      <div className={`font-display text-[22px] leading-tight ${c}`}>{v}</div>
      <div className="mt-0.5 text-[10.5px] leading-tight text-ink-dim">{l}</div>
    </div>
  );
}

/**
 * "12-avg" ko'rinishidagi qisqa sana.
 *
 * Yil yozilmaydi: ro'yxatda oxirgi yigirmata test turadi va ular
 * deyarli har doim shu yilniki. Yil qo'shilsa qator uzayib, vaqt
 * bilan birga ikkinchi satrga tushib ketardi.
 */
function sana(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${t("oyQisqa").split(",")[d.getMonth()]}`;
}

/** Sekundni "12 daq" ko'rinishida. Bir daqiqadan kam bo'lsa — sekund. */
function daqiqa(s: number): string {
  return s < 60 ? t("hisobotSekund", { n: s }) : t("hisobotDaqiqa", { n: Math.round(s / 60) });
}
