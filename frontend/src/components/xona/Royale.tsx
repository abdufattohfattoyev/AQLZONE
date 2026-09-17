/**
 * HISOB ROYALE — o'yin ekrani (`core/oyin_royale.py`).
 *
 * Savol va to'rtta javob katta, qolgani kichik: bu o'yinda soniyalar
 * hal qiladi va ko'z faqat savolga qarashi kerak. Vaqt chizig'i mahalliy
 * soat bilan silliq kamayadi — serverdan kelgan "qolgan soniya" har
 * yangi savolda qayta o'rnatiladi.
 */
import { useEffect, useRef, useState } from "react";
import { EmojiBelgi } from "../../lib/hajmli";
import { t } from "../../lib/matn";
import { tebrat } from "../../lib/qobiq";
import type { XonaHolat } from "../../lib/api";

interface Oyinchi {
  yurak: number; tirik: boolean; joy: number | null; togri: number; hujum: number; daraja: number;
  savol?: { matn: string; variantlar: string[] }; qolgan?: number; vaqt?: number; zanjir?: number; jazo?: number;
}
interface RoyaleHolat {
  oyinchilar: Record<string, Oyinchi>;
  tirikSoni: number;
  hujumlar: { kimdan: string; kimga: string; vaqt: number }[];
  tugadi: boolean;
}

const Yuraklar = ({ n, kichik }: { n: number; kichik?: boolean }) => (
  <span className={kichik ? "text-[11px]" : "text-[18px]"} aria-label={`${n}`}>
    {"❤️".repeat(Math.max(0, n))}<span className="opacity-25">{"🤍".repeat(Math.max(0, 3 - n))}</span>
  </span>
);

export function Royale({ xona, amal }: {
  xona: XonaHolat;
  amal: (a: Record<string, unknown>) => Promise<void>;
}) {
  const h = xona.oyinHolat as RoyaleHolat;
  const men = String(xona.men);
  const o = h.oyinchilar[men];
  const ism = (id: string) => id === men ? t("xonaSiz") : xona.azolar.find((a) => String(a.id) === id)?.ism ?? "";

  /* ---- vaqt: yangi savolda qayta o'rnatiladi ---- */
  const [tugash, setTugash] = useState(0);
  const [hozir, setHozir] = useState(() => Date.now());
  const savolKalit = `${o.savol?.matn}|${o.togri}|${o.yurak}`;
  useEffect(() => {
    if (o.qolgan !== undefined) setTugash(Date.now() + o.qolgan * 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savolKalit]);
  useEffect(() => {
    const id = setInterval(() => setHozir(Date.now()), 100);
    return () => clearInterval(id);
  }, []);
  const qolgan = Math.max(0, (tugash - hozir) / 1000);

  /* ---- hujum xabari: yangi kelganini bir necha soniya ko'rsatamiz ---- */
  const [xabar, setXabar] = useState<{ matn: string; menga: boolean } | null>(null);
  const korilgan = useRef(h.hujumlar.length ? h.hujumlar[h.hujumlar.length - 1].vaqt : 0);
  useEffect(() => {
    const yangi = h.hujumlar.filter((x) => x.vaqt > korilgan.current && (x.kimga === men || x.kimdan === men));
    if (!h.hujumlar.length) return;
    korilgan.current = Math.max(korilgan.current, h.hujumlar[h.hujumlar.length - 1].vaqt);
    const oxirgi = yangi[yangi.length - 1];
    if (!oxirgi) return;
    const menga = oxirgi.kimga === men;
    setXabar({
      matn: menga ? t("rHujumKeldi", { nom: ism(oxirgi.kimdan) }) : t("rHujumKetdi", { nom: ism(oxirgi.kimga) }),
      menga,
    });
    tebrat(menga ? "xato" : "yutuq");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h.hujumlar.length ? h.hujumlar[h.hujumlar.length - 1].vaqt : 0]);

  // Yopilish taymeri XABARGA bog'liq, hujumlar ro'yxatiga emas: boshqalar
  // o'zaro hujum qilganda ro'yxat o'zgaradi va taymer bekor bo'lib, yozuv
  // ekranda qotib qolardi.
  useEffect(() => {
    if (!xabar) return;
    const id = setTimeout(() => setXabar(null), 2500);
    return () => clearTimeout(id);
  }, [xabar]);

  const [band, setBand] = useState(false);
  const [bosildi, setBosildi] = useState("");
  const javob = (v: string) => {
    if (band) return;
    setBand(true);
    setBosildi(v);
    amal({ tur: "javob", javob: v }).catch(() => {}).finally(() => { setBand(false); setBosildi(""); });
  };

  const boshqalar = Object.entries(h.oyinchilar)
    .filter(([k]) => k !== men)
    .sort((a, b) => Number(b[1].tirik) - Number(a[1].tirik) || b[1].togri - a[1].togri);

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col gap-3 px-4 pt-4 pb-6 sm:max-w-[560px]">
      <div className="flex items-center justify-between">
        <span className="font-display text-[15px]">👥 {t("rTirik", { n: h.tirikSoni })}</span>
        <Yuraklar n={o.yurak} />
      </div>

      {xabar && (
        <div role="status" className={`rounded-clay px-3 py-2 text-center text-[13px] ${
          xabar.menga ? "bg-brand-gold/20 text-brand-gold-d" : "bg-brand-green/15 text-brand-green-d"}`}>
          {xabar.matn}
        </div>
      )}

      {o.tirik && o.savol ? (
        <>
          <div className="h-2.5 overflow-hidden rounded-full bg-track">
            <div className={`h-full rounded-full ${qolgan < 3 ? "bg-brand-gold" : "bg-brand-blue"}`}
              style={{ width: `${Math.min(100, (qolgan / (o.vaqt || 10)) * 100)}%` }} />
          </div>
          <div className="grid flex-1 place-items-center rounded-clay bg-karta px-4 py-10 shadow-clay-sm">
            <div className="font-display text-[46px] leading-none">{o.savol.matn} = ?</div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {o.savol.variantlar.map((v) => (
              <button key={`${o.savol!.matn}-${v}`} type="button" onClick={() => javob(v)} disabled={band}
                className={`clay-press rounded-clay py-5 font-display text-[26px] shadow-clay-sm
                            ${bosildi === v ? "bg-brand-blue text-white" : "bg-karta text-ink"}`}>
                {v}
              </button>
            ))}
          </div>
          <p className="text-center text-[12.5px] text-ink-soft">
            {t("rZanjir", { n: 3 - (o.zanjir ?? 0) })}
          </p>
        </>
      ) : (
        <div className="grid flex-1 place-items-center rounded-clay bg-karta p-6 text-center shadow-clay-sm">
          <div>
            <EmojiBelgi e="👀" olcham={48} className="mx-auto" />
            <div className="mt-2 font-display text-[18px]">{t("rChiqdingiz", { n: o.joy ?? h.tirikSoni + 1 })}</div>
            <div className="mt-1 text-[13px] text-ink-soft">{t("rTomosha")}</div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {boshqalar.map(([k, x]) => (
          <span key={k} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] ${
            x.tirik ? "bg-karta text-ink shadow-clay-sm" : "bg-track text-ink-dim line-through"}`}>
            {ism(k)} {x.tirik && <Yuraklar n={x.yurak} kichik />}
          </span>
        ))}
      </div>
    </div>
  );
}
