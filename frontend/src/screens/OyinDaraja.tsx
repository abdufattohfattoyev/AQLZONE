/**
 * Daraja tanlash — o'yin boshlanishidan oldingi yagona ekran.
 *
 * ─────────────── NEGA YOSH SO'RALMAYDI ───────────────
 *
 * Bu ekranda "yoshingizni tanlang" degan savol ATAYLAB yo'q. Yosh
 * darajaning yonida faqat MASLAHAT bo'lib turadi ("6–9 yosh"), chunki
 * yoshni tanlov qilib qo'yishning uchta oqibati bor va uchalasi ham
 * yomon:
 *
 *   Devor.   Kuchli to'qqiz yoshli bola "bolalar darajasi" da qolib
 *            zerikadi va undan chiqolmaydi.
 *   Uyat.    Qiynalayotgan o'n ikki yoshli bola "kichiklar" ni
 *            tanlashdan uyaladi va umuman o'ynamaydi.
 *   Yolg'on. Yoshni hech kim tekshirmaydi — reyting uchun hamma
 *            "kattalar" ni tanlaydi va jadval ma'nosini yo'qotadi.
 *
 * Yozuv esa ota-onaga kerak: u bolasiga qaysi darajani berishni bir
 * qarashda biladi.
 *
 * ─────────────── QULF NIMA UCHUN ───────────────
 *
 * Yuqori daraja oldingisida bir necha ball to'plangandan keyin
 * ochiladi. Shart past — bir-ikki o'yin yetadi — va maqsadi to'sish
 * emas: hech kim isinmasdan turib eng qiyin darajaga tushib, o'yinni
 * "juda qiyin ekan" deb tashlab ketmasin. Bola pastda o'ynayveradi,
 * katta esa bir daqiqada yuqoriga chiqadi.
 */
import type { CSSProperties } from "react";
import { Icon } from "../lib/icons";
import { DARAJALAR } from "../lib/oyin/tur";
import type { Daraja, Oyin } from "../lib/oyin/tur";
import { ochiqmi, ochishgaQolgan, rekord } from "../lib/oyin/rekord";
import { UNIT_COLORS } from "../lib/types";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";

export function OyinDaraja({ oyin, onBack, onBoshla }: {
  oyin: Oyin;
  onBack: () => void;
  onBoshla: (d: Daraja) => void;
}) {
  const ozStrelka = useOrqaga(onBack);
  const rang = UNIT_COLORS[oyin.rang];

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-10 sm:max-w-[560px]">
      {ozStrelka && (
        <button type="button" onClick={onBack} title={t("ortga")}
          className="clay-press grid size-[38px] place-items-center rounded-full bg-karta
                     text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}

      {/* ---- o'yin ---- */}
      <div className="az-kirish mt-4 text-center">
        <span style={{ backgroundColor: `${rang.road}20` }}
          className="mx-auto grid size-[76px] place-items-center rounded-[26px] text-[38px]">
          {oyin.emoji}
        </span>
        <h1 className="mt-3 text-[21px] leading-tight">{t(oyin.nom)}</h1>
        {/* Qoida ENG BOSHIDA, o'yin ichida emas. O'yin boshlangandan
            keyin ko'rsatilgan qoidani hech kim o'qimaydi: soat yuradi
            va odam faqat birinchi savolga qaraydi. */}
        <p className="mx-auto mt-2 max-w-[330px] text-[13px] leading-snug text-ink-soft">
          {t(oyin.qoida)}
        </p>
      </div>

      <h2 className="az-kirish mt-6 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("darajaTanla")}
      </h2>

      <div className="space-y-2.5">
        {DARAJALAR.map((d, i) => (
          <Qator key={d.n} oyin={oyin} d={d} i={i} onBoshla={() => onBoshla(d.n)} />
        ))}
      </div>

      <p className="az-kirish mt-4 text-center text-[11.5px] leading-snug text-ink-soft/80">
        {t("darajaYoshIzoh")}
      </p>
    </div>
  );
}

function Qator({ oyin, d, i, onBoshla }: {
  oyin: Oyin;
  d: (typeof DARAJALAR)[number];
  i: number;
  onBoshla: () => void;
}) {
  const ochiq = ochiqmi(oyin.id, d.n);
  const qolgan = ochishgaQolgan(oyin.id, d.n);
  const r = rekord(oyin.id, d.n);
  const rang = UNIT_COLORS[d.rang];

  return (
    <button type="button" onClick={onBoshla} disabled={!ochiq} title={t(d.nom)}
      style={{ "--az-kech": `${80 + i * 70}ms` } as CSSProperties}
      className={`az-kirish flex w-full items-center gap-3 rounded-clay bg-karta p-3.5 text-left
                  shadow-clay-sm ${ochiq ? "clay-press" : "opacity-60"}`}>
      {/* Daraja belgisi — rangi darajaning O'ZIGA tegishli, o'yinga emas.
          Yashil/ko'k/qizil ilovaning boshqa joylarida ham "oson → qiyin"
          degan ma'noni bildiradi va shu tanishlik bu yerda ham ishlaydi. */}
      <span className={`grid size-11 shrink-0 place-items-center rounded-[16px] text-white
                        ${ochiq ? rang.bg : "bg-locked"} shadow-clay-sm`}>
        {ochiq ? <span className="font-display text-[18px]">{d.n}</span>
               : <Icon name="lock" size={18} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15.5px] leading-tight text-ink">{t(d.nom)}</span>
        {/* Yosh — kichik va xira: u maslahat, shart emas. */}
        <span className="block text-[11.5px] leading-tight text-ink-soft">{t(d.yosh)}</span>
      </span>

      <span className="shrink-0 text-right">
        {!ochiq ? (
          <span className="block max-w-[104px] text-[10.5px] leading-tight text-ink-soft">
            {t("darajaQulf", { n: qolgan })}
          </span>
        ) : r > 0 ? (
          <>
            <span className={`block font-display text-[19px] leading-none ${rang.ring}`}>{r}</span>
            <span className="block text-[9.5px] leading-none text-ink-soft">
              {t("oyinRekordim")}
            </span>
          </>
        ) : (
          <Icon name="chevron" size={18} className="text-ink-soft" />
        )}
      </span>
    </button>
  );
}
