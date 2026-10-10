/**
 * Tanga → Premium — "Men" bo'limida, eski Do'kon qatori o'rnida (2026-10-10).
 *
 * Do'kon olib tashlandi (25 kunda 7 kishi): tangaga avatar olish odamni
 * qiziqtirmadi. Endi tanga yig'ishning aniq maqsadi bor — 500 tanga =
 * 7 kunlik Premium, oyiga bir marta.
 *
 * Qatorda faqat "320 / 500" — qancha qolgani. Batafsil (chiziq, shart,
 * tugma) varaqda: qatorga uchinchi qavat qo'shilmasin.
 *
 * Varaqdagi son SERVER sanagani (`TangaHolat.yaraydi`): dars, sinov,
 * masala, o'yinlar — serverda yozilgan natijalardan (`core/premium.py`).
 * U ekrandagi jami tangadan kam bo'lishi mumkin: 2026-10-10 dan oldingi
 * telefondagi o'yin tangasi serverga yozilmagan edi. Shu sabab varaqda
 * "nimalar hisoblanadi" degan izoh turadi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { Hajmli } from "../lib/hajmli";
import { t } from "../lib/matn";
import { tangaAlmashtir, tangaHolatOl } from "../lib/premium";
import type { TangaHolat } from "../lib/premium";
import { useProgress } from "../lib/progress";
import { tebrat } from "../lib/qobiq";
import { TanlovVaraq } from "./Varaq";

/** "12.11" — kun va oy, yil kerak emas (30 kundan uzoq emas). */
const kunOy = (iso: string): string => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function TangaPremiumQator() {
  const { tangaYech } = useProgress();
  const [h, setH] = useState<TangaHolat | null>(null);
  const [ochiq, setOchiq] = useState(false);
  const [band, setBand] = useState(false);
  const [natija, setNatija] = useState<"ok" | "xato" | null>(null);

  useEffect(() => {
    let bekor = false;
    tangaHolatOl().then((x) => { if (!bekor) setH(x); });
    return () => { bekor = true; };
  }, []);

  // Internetsiz qator ko'rinmaydi — server sanamasa son ham, tugma ham yo'q.
  if (!h) return null;

  const almashtir = async () => {
    setBand(true);
    const yangi = await tangaAlmashtir();
    setBand(false);
    if (yangi) {
      // Server yozdi — mijozdagi qoldiqdan ham yechamiz, aks holda
      // ekrandagi tanga kamaymagandek ko'rinardi.
      tangaYech(h.narx);
      tebrat("togri");
      setH(yangi);
      setNatija("ok");
    } else {
      setNatija("xato");
      setH((await tangaHolatOl()) ?? h);
    }
  };

  const foiz = Math.min(100, Math.round((h.yaraydi / h.narx) * 100));
  const sabab = h.keyingi ? t("tpKeyingi", { sana: kunOy(h.keyingi) })
    : h.yaraydi < h.narx ? t("tpYetmaydi", { n: h.narx - h.yaraydi }) : "";

  return (
    <>
      <button type="button" onClick={() => { setNatija(null); setOchiq(true); }}
        data-tahlil="Men: tanga premium"
        className="clay-press flex min-h-[54px] w-full items-center gap-3 px-3.5 text-left">
        <span className="az-plitka size-9"><Hajmli nom="tanga" olcham={28} plitkasiz /></span>
        <span className="min-w-0 flex-1 truncate text-[16px] font-semibold">{t("tpNom")}</span>
        <span className={`shrink-0 text-[14px] ${h.mumkin ? "font-bold text-brand-gold-d" : "text-ink-dim"}`}>
          {Math.min(h.yaraydi, h.narx)} / {h.narx}
        </span>
        <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
      </button>

      {ochiq && (
        <TanlovVaraq sarlavha={t("tpNom")} onYop={() => setOchiq(false)}>
          <div className="flex w-full flex-col gap-3">
            <p className="font-display text-[20px] leading-tight">
              {t("tpTaklif", { narx: h.narx, kun: h.kun })}
            </p>

            {natija === "ok" ? (
              <p className="flex items-center gap-2 rounded-2xl bg-brand-green/12 px-3.5 py-3 text-[15px]
                            font-bold text-brand-green-d">
                <Icon name="check" size={18} />{t("tpOchildi", { kun: h.kun })}
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between text-[14px]">
                    <span className="text-ink-soft">{t("tpYaraydi")}</span>
                    <span className="font-display text-[16px] font-bold text-brand-gold-d">
                      {h.yaraydi} / {h.narx}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-track" role="progressbar"
                    aria-valuemin={0} aria-valuemax={h.narx} aria-valuenow={Math.min(h.yaraydi, h.narx)}>
                    <div className="h-full rounded-full bg-brand-gold" style={{ width: `${foiz}%` }} />
                  </div>
                </div>
                <p className="text-[13px] leading-snug text-ink-dim">{t("tpIzoh")}</p>
                {natija === "xato" && <p className="text-[13px] font-semibold text-ink-soft">{t("tpXato")}</p>}
                <button type="button" onClick={almashtir} disabled={!h.mumkin || band}
                  data-tahlil="Tanga premium: almashtirish"
                  className="tugma-3d min-h-12 w-full rounded-2xl bg-brand-blue px-5 font-display text-[16px]
                             font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]
                             disabled:bg-track disabled:text-ink-dim disabled:shadow-none">
                  {sabab || t("tpTugma", { narx: h.narx })}
                </button>
              </>
            )}
          </div>
        </TanlovVaraq>
      )}
    </>
  );
}
