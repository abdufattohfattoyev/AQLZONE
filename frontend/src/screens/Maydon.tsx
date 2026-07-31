/**
 * Bugungi maydon — uch bosqich, kuniga bir marta.
 *
 * Ekran o'yin O'YNAMAYDI: uni `Oqim` qiladi. Bu yerda faqat OQIM
 * boshqariladi — qaysi bosqich, orasidagi ekran, umumiy ball va
 * yakun. Sabab oddiy: o'yin mantig'i allaqachon bir joyda turibdi va
 * uni ikkinchi marta yozish har qanday o'zgarishda ikki fayl
 * tuzatishni talab qilardi.
 *
 * ──────────────── BOSQICHLAR ORASIDA NEGA EKRAN BOR ────────────────
 *
 * Bosqichlar to'g'ridan-to'g'ri ulanib ketsa, o'yinchi o'yin
 * ALMASHGANINI sezmaydi: ekranda yana savol turadi, lekin qoida
 * boshqacha bo'ladi va u birinchi ikki savolni eski qoida bilan
 * yechib, xato qiladi. Oradagi ekran esa yangi o'yinning nomini,
 * belgisini va qoidasini ko'rsatadi — uch soniya, lekin o'sha uch
 * soniya butun bosqichni saqlab qoladi.
 */
import { useMemo, useState } from "react";
import { Oqim } from "../components/oyin/Oqim";
import { Konfetti } from "../components/Konfetti";
import { Icon } from "../lib/icons";
import { useOrqaga } from "../lib/qobiq";
import { useProgress } from "../lib/progress";
import { t } from "../lib/matn";
import { UNIT_COLORS } from "../lib/types";
import { maydonNatija, maydonYoz, tangaHisobi } from "../lib/oyin/rekord";
import { BOSQICH_VAQT, MAYDON_DARAJA, bugungiBosqichlar } from "../lib/oyin/maydon";
import type { Bosqich, MaydonNatija } from "../lib/oyin/maydon";
import type { OyinNatija } from "../lib/oyin/tur";

type Holat =
  | { nima: "tanishuv"; n: number }        // bosqich oldidagi ekran
  | { nima: "oyin"; n: number }
  | { nima: "yakun" };

export function Maydon({ onChiq }: { onChiq: () => void }) {
  const { oyinTugadi } = useProgress();
  useOrqaga(onChiq);

  // Bosqichlar BIR MARTA yasaladi. Har renderda qayta yasalsa, savollar
  // ham qaytadan yasalardi — urug' bir xil bo'lgani uchun natija ham bir
  // xil chiqardi, lekin bu 120 ta savolni har renderda qayta hisoblash
  // degani va past telefonda o'yin sekinlashardi.
  const bosqichlar = useMemo(() => bugungiBosqichlar(), []);

  // Bugun allaqachon o'ynalgan bo'lsa, o'yin umuman boshlanmaydi —
  // to'g'ridan-to'g'ri natija ko'rsatiladi. Qoida `maydon.ts` da ham
  // takrorlanadi: ekran o'zgarishi mumkin, qoida esa qolishi kerak.
  const [natija, setNatija] = useState<MaydonNatija | null>(() => maydonNatija());
  const [holat, setHolat] = useState<Holat>(() =>
    maydonNatija() ? { nima: "yakun" } : { nima: "tanishuv", n: 0 });

  /** Har bosqichda olingan ball. */
  const [ballar, setBallar] = useState<number[]>([]);
  const [savollar, setSavollar] = useState(0);

  const bosqichTugadi = (n: OyinNatija, orin: number) => {
    const yangiBallar = [...ballar, n.ball];
    const yangiSavollar = savollar + n.savollar;
    setBallar(yangiBallar);
    setSavollar(yangiSavollar);

    if (orin + 1 < bosqichlar.length) {
      setHolat({ nima: "tanishuv", n: orin + 1 });
      return;
    }

    // Oxirgi bosqich. Natija SHU YERDA saqlanadi va tanga beriladi.
    const jami = yangiBallar.reduce((s, x) => s + x, 0);
    const yozildi = maydonYoz({
      ball: jami, savollar: yangiSavollar, bosqichlar: yangiBallar,
    });
    // Maydon tangasi mashqdagidan ko'ra saxiyroq (bonus bilan): u
    // kuniga bir marta beriladi va aynan shu narsa ertaga qaytishga
    // sabab bo'ladi.
    oyinTugadi(tangaHisobi(jami, true), yangiSavollar);
    setNatija(yozildi);
    setHolat({ nima: "yakun" });
  };

  if (holat.nima === "yakun") {
    // Natija bo'lmasligi mumkin emas (yakunga faqat u yozilgach
    // o'tiladi), lekin tur darajasida buni ko'rsatib qo'yish kerak.
    return natija
      ? <MaydonYakun natija={natija} bosqichlar={bosqichlar} onChiq={onChiq} />
      : null;
  }

  const bosqich = bosqichlar[holat.n];
  if (!bosqich) return null;

  if (holat.nima === "tanishuv") {
    return (
      <Tanishuv
        bosqich={bosqich} orin={holat.n} jami={bosqichlar.length}
        onBoshla={() => setHolat({ nima: "oyin", n: holat.n })}
        onChiq={onChiq}
      />
    );
  }

  return (
    <Oqim
      key={`maydon-${holat.n}`}
      oyin={bosqich.oyin}
      daraja={MAYDON_DARAJA}
      savollar={bosqich.savollar}
      vaqt={BOSQICH_VAQT}
      onChiq={onChiq}
      onTugadi={(n) => bosqichTugadi(n, holat.n)}
      // Maydonda rekord ko'rsatilmaydi: bu yerda o'lchov o'z rekordi
      // emas, boshqalar bilan solishtirma. Rekord mashqda qoladi.
      rekord={0}
      // Bosqich tugagach `Oqim` ichida hech narsa chizilmaydi —
      // keyingi ekranni shu komponent tanlaydi.
      yakun={null}
    />
  );
}

/* ------------------------------------------------ bosqich oldidan */

function Tanishuv({ bosqich, orin, jami, onBoshla, onChiq }: {
  bosqich: Bosqich;
  orin: number;
  jami: number;
  onBoshla: () => void;
  onChiq: () => void;
}) {
  const rang = UNIT_COLORS[bosqich.oyin.rang];

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-8 sm:max-w-[560px]">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onChiq} title={t("yopish")}
          className="clay-press grid size-[38px] shrink-0 place-items-center rounded-full
                     bg-karta text-ink-soft shadow-clay-sm">
          <Icon name="times" size={18} />
        </button>
        {/* Bosqich chiziqlari — qancha qolganini SON emas, shakl aytadi. */}
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: jami }, (_, i) => (
            <span key={i} className={`h-2 flex-1 rounded-full
              ${i < orin ? "bg-brand-green" : i === orin ? "bg-brand-orange" : "bg-karta/60"}`} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="text-[13px] tracking-widest text-ink-soft uppercase">
          {t("maydonBosqich", { n: orin + 1, jami })}
        </span>
        <span className={`mt-4 grid size-24 place-items-center rounded-[30px] text-[46px]
                          ${rang.bg} shadow-clay`}>
          {bosqich.oyin.emoji}
        </span>
        <h1 className="mt-4 text-[26px] leading-tight">{t(bosqich.oyin.nom)}</h1>
        <p className="mt-2 max-w-[300px] text-[14px] leading-snug text-ink-soft">
          {t(bosqich.oyin.qoida)}
        </p>
        <span className="mt-4 rounded-full bg-karta px-3.5 py-1.5 text-[12.5px] text-ink-soft shadow-clay-sm">
          {t("maydonVaqt", { n: BOSQICH_VAQT })}
        </span>
      </div>

      <button type="button" onClick={onBoshla}
        className="tugma-3d az-yaltir w-full rounded-3xl bg-brand-green py-4 font-display
                   text-[18px] text-white shadow-[0_6px_0_var(--color-brand-green-d)]">
        {t("maydonBoshla")}
      </button>
    </div>
  );
}

/* ------------------------------------------------ yakun */

function MaydonYakun({ natija, bosqichlar, onChiq }: {
  natija: MaydonNatija;
  bosqichlar: Bosqich[];
  onChiq: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-8 pb-10 text-center sm:max-w-[560px]">
      <div className="relative mx-auto w-fit">
        <Konfetti />
        <span className="grid size-20 place-items-center rounded-[26px] bg-brand-gold text-[38px] shadow-clay">
          🏟
        </span>
      </div>

      <h1 className="mt-4 text-[26px]">{t("maydonTugadi")}</h1>
      <div className="mt-1 font-display text-[52px] leading-none text-brand-orange-d">
        {natija.ball}
      </div>
      <div className="text-[13px] text-ink-soft">{t("oyinBall")}</div>

      {/* Bosqichlar bo'yicha bo'linish. Bitta umumiy son o'yinchiga
          qayerda yutqazganini aytmaydi — bo'linish esa aytadi va u
          ertaga qaysi o'yinni mashq qilishni ko'rsatadi. */}
      <div className="mt-6 space-y-2">
        {bosqichlar.map((b, i) => (
          <div key={b.oyin.id}
            className="flex items-center gap-3 rounded-clay bg-karta p-3 text-left shadow-clay-sm">
            <span className="text-[22px]">{b.oyin.emoji}</span>
            <span className="flex-1 font-display text-[14px]">{t(b.oyin.nom)}</span>
            <span className="font-display text-[16px] text-ink-soft">
              {natija.bosqichlar[i] ?? 0}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-5 text-[13px] leading-snug text-ink-soft">{t("maydonErtaga")}</p>

      <button type="button" onClick={onChiq}
        className="tugma-3d mt-5 w-full rounded-3xl bg-brand-green py-3.5 font-display
                   text-[17px] text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
        {t("maydonChiqish")}
      </button>
    </div>
  );
}
