/**
 * O'yinlar ro'yxati — bo'limning kirish eshigi.
 *
 * Kurslardan ALOHIDA turadi va bu butun bo'limning ma'nosi: bu yerda
 * dars yo'q, tartib yo'q, "keyingi bob" yo'q. Faqat sakkizta o'yin va
 * rekord. Odam ilovani "bugun bir o'ynay" deb ochsa, unga yo'l xaritasi
 * emas, shu ekran kerak.
 *
 * KARTA IKKI XIL GAPIRADI. O'ynalmagan o'yinda izoh turadi ("Qaysi
 * belgi yashiringan?") — u savol bo'lib, qiziqish uyg'otadi.
 * O'ynalganida esa uning o'rniga REKORD chiqadi: endi izoh ortiqcha,
 * odam o'yinni biladi va uni faqat bitta narsa qiziqtiradi — o'z
 * natijasi.
 */
import type { CSSProperties } from "react";
import { Icon } from "../lib/icons";
import { OYINLAR } from "../lib/oyin";
import { DARAJALAR } from "../lib/oyin/tur";
import type { Oyin } from "../lib/oyin/tur";
import { rekord } from "../lib/oyin/rekord";
import { UNIT_COLORS } from "../lib/types";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";

export function Oyinlar({ onBack, onOyin }: {
  onBack: () => void;
  onOyin: (id: string) => void;
}) {
  const ozStrelka = useOrqaga(onBack);

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-10 sm:max-w-[700px] lg:max-w-[1020px]">
      {/* Telegram ichida bu strelka chizilmaydi: u yerda nativ orqaga
          tugmasi bor va ikkitasi bir ekranda turganda odam har safar
          "qaysi biri to'g'ri?" deb o'ylardi (`lib/qobiq.ts`). */}
      {ozStrelka && (
        <button type="button" onClick={onBack} title={t("ortga")}
          className="clay-press grid size-[38px] place-items-center rounded-full bg-karta
                     text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}

      <div className="az-kirish mt-4 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-[22px] bg-brand-purple/15">
          <Icon name="puzzle" size={34} className="text-brand-purple" />
        </span>
        <h1 className="mt-3 text-[22px]">{t("oyinlarBolim")}</h1>
        <p className="mt-1 text-[13px] leading-snug text-ink-soft">{t("oyinlarIzoh")}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {OYINLAR.map((o, i) => (
          <Karta key={o.id} o={o} i={i} onOch={() => onOyin(o.id)} />
        ))}
      </div>

      <p className="az-kirish mt-5 text-center text-[11.5px] leading-snug text-ink-soft/80">
        {t("oyinlarTagi")}
      </p>
    </div>
  );
}

/**
 * Bitta o'yin kartasi.
 *
 * Rekord ENG YAXSHISI ko'rsatiladi — qaysi darajada bo'lishidan qat'i
 * nazar. Uchala darajani birga chiqarish ham mumkin edi, lekin unda
 * kartada olti son turib, ro'yxat jadvalga aylanib qolardi. Daraja
 * bo'yicha to'liq hisob keyingi ekranda, tanlash paytida ko'rinadi —
 * ya'ni aynan kerak bo'lgan payt.
 */
function Karta({ o, i, onOch }: { o: Oyin; i: number; onOch: () => void }) {
  const rang = UNIT_COLORS[o.rang];
  const eng = Math.max(...DARAJALAR.map((d) => rekord(o.id, d.n)));
  // Rekord NOL bo'lsa izoh o'z o'rnida qoladi. "🏆 0" degan yozuv
  // hech narsa aytmaydi va faqat kartani xunuk qiladi: o'yin ochilib
  // yopilgan bo'lsa ham, odam uni hali o'ynamagan hisoblanadi.
  const bor = eng > 0;

  return (
    /* `title` SHART: kartaning ichida katta emoji va ikki qator yozuv
       bor, lekin tugmaning o'z nomi yo'q — ekran o'quvchi uni "tugma"
       deb o'qib, qaysi o'yin ekanini aytmasdi. */
    <button type="button" onClick={onOch} title={t(o.nom)}
      style={{ "--az-kech": `${60 + i * 45}ms` } as CSSProperties}
      className="az-kirish clay-press flex flex-col items-center gap-1.5 rounded-clay bg-karta
                 p-3 text-center shadow-clay-sm">
      {/* Rang KLASS bilan emas, uslub bilan beriladi. Tailwind
          klasslarni manba matnidan topib yasaydi, ya'ni `${rang.bg}/12`
          kabi yig'ilgan satr hech qachon CSS'ga tushmasdi va doira
          rangsiz qolardi. `road` — o'sha rangning HEX ko'rinishi. */}
      <span style={{ backgroundColor: `${rang.road}20` }}
        className="grid size-14 shrink-0 place-items-center rounded-[20px] text-[28px]">
        {o.emoji}
      </span>

      <span className="font-display text-[13.5px] leading-tight text-ink">{t(o.nom)}</span>

      {bor ? (
        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-track px-2 py-0.5
                         text-[10.5px] leading-none text-ink-soft">
          <Icon name="trophy" size={11} className="text-brand-gold" />
          {eng}
        </span>
      ) : (
        <span className="text-[10.5px] leading-tight text-ink-soft/85">{t(o.izoh)}</span>
      )}
    </button>
  );
}
