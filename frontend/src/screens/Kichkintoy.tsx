/**
 * KICHKINTOY — bo'limning kirish ekrani. To'rtta mavzu, boshqa hech narsa.
 *
 * ─────────── NEGA TO'RTTA VA NEGA KATTA ───────────
 *
 * Bu ekranni 3 yoshli bola ochadi. Uning uchun tanlov qanchalik kam
 * bo'lsa, shuncha yaxshi: sakkizta karta — sakkizta qaror, va bu
 * yoshda qaror qabul qilish o'zi charchatadi. To'rttasi esa bitta
 * ekranga surilmasdan sig'adi, ya'ni bola hammasini BIR QARASHDA
 * ko'radi va barmog'i o'zi kerakligiga boradi.
 *
 * Kartalar ATAYLAB katta (ekranning yarmiga yaqin ikkitasi): bu
 * yoshdagi barmoq aniq tegmaydi va kichik tugma "ilova ishlamayapti"
 * degan taassurot beradi.
 *
 * ─────────── NEGA QULF YO'Q ───────────
 *
 * Ilovaning qolgan qismida dars tartibi bor: oldingisi tugamaguncha
 * keyingisi ochilmaydi. Bu yerda bunday narsa YO'Q va bo'lishi ham
 * mumkin emas. Bola mashinani ko'rgisi kelsa — mashinani ko'radi.
 * Qulflangan katta esa unga "sen bunga arzimaysan" deb ko'rinadi,
 * holbuki u hali "keyingi" degan so'zni ham bilmaydi.
 *
 * Ko'rilgan kartalar soni kartada turadi ("12 tadan 5 tasi"), lekin u
 * MAQSAD emas, ESLATMA: ota-ona qayerda to'xtaganini ko'radi, bola esa
 * o'sib borayotgan sonni yoqtiradi.
 */
import type { CSSProperties } from "react";
import { Icon } from "../lib/icons";
import { Reveal } from "../components/Reveal";
import { MAVZULAR, kNom } from "../lib/kichkintoy";
import type { Mavzu } from "../lib/kichkintoy";
import { korilganSoni } from "../lib/kichkintoyHolat";
import { UNIT_COLORS } from "../lib/types";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";
import { OvozTugma } from "../components/OvozTugma";

export function Kichkintoy({ onBack, onMavzu }: {
  onBack: () => void;
  onMavzu: (id: string) => void;
}) {
  const ozStrelka = useOrqaga(onBack);

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-10 sm:max-w-[700px]">
      <div className="flex items-center justify-between">
        {ozStrelka ? (
          <button type="button" onClick={onBack} title={t("ortga")}
            className="clay-press grid size-[38px] place-items-center rounded-full bg-karta
                       text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        ) : <span />}
        {/* Ovoz tugmasi SHU YERDA turadi va butun bo'lim bo'ylab bir
            joyda qoladi. Ota-ona uni bir marta topadi (avtobusda,
            uxlash oldidan) va keyin qidirmaydi. */}
        <OvozTugma />
      </div>

      <div className="az-kirish mt-4 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-[22px] bg-brand-orange/15 text-[34px]">
          🧸
        </span>
        <h1 className="mt-3 font-display text-[24px] leading-tight">{t("kichkintoy")}</h1>
        <p className="mt-1 text-[13px] leading-snug text-ink-soft">{t("kichkintoyIzoh")}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {MAVZULAR.map((m, i) => (
          <MavzuKarta key={m.id} m={m} i={i} onOch={() => onMavzu(m.id)} />
        ))}
      </div>

      <p className="az-kirish mt-6 text-center text-[11.5px] leading-snug text-ink-soft/80"
        style={{ "--az-kech": "420ms" } as CSSProperties}>
        {t("kichkintoyTagi")}
      </p>
    </div>
  );
}

/**
 * Bitta mavzu kartasi.
 *
 * Belgi ATAYLAB juda katta (56px) va kartaning yarmini egallaydi: bola
 * yozuvni o'qimaydi, u RASMNI taniydi. Yozuv esa ota-ona uchun — u
 * bolaga nomini aytib beradi.
 */
function MavzuKarta({ m, i, onOch }: { m: Mavzu; i: number; onOch: () => void }) {
  const rang = UNIT_COLORS[m.rang];
  const korilgan = korilganSoni(m.id);
  const jami = m.kartalar.length;

  return (
    <Reveal kech={i * 80} className="h-full">
      <button type="button" onClick={onOch} title={kNom(m)}
        style={{ "--az-kech": `${80 + i * 70}ms` } as CSSProperties}
        className="az-kirish tugma-3d flex h-full w-full flex-col items-center gap-2 rounded-clay
                   bg-karta p-4 text-center shadow-clay">
        {/* Rang KLASS bilan emas, uslub bilan: Tailwind klasslarni manba
            matnidan topib yasaydi va `${rang.bg}` kabi yig'ilgan satr
            hech qachon CSS'ga tushmasdi. */}
        <span style={{ backgroundColor: `${rang.road}22` }}
          className="grid size-[86px] shrink-0 place-items-center rounded-[28px] text-[46px]">
          {m.e}
        </span>

        <span className="font-display text-[17px] leading-tight text-ink">{kNom(m)}</span>

        {/* Ishora belgilari — "ichkarida nima bor" degan gapni yozuvsiz
            aytadi. Bola ularni ham taniydi va kartani bosishga sabab
            topadi. */}
        <span aria-hidden className="flex gap-1 text-[15px] opacity-70">
          {m.ishora.map((x, k) => <span key={k}>{x}</span>)}
        </span>

        {/* Sanoq faqat BOSHLANGAN mavzuda. Nolinchi sanoq ("0 / 12")
            hech narsa aytmaydi va faqat kartani band qiladi. */}
        {korilgan > 0 && (
          <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-track px-2.5 py-0.5
                           text-[10.5px] leading-none text-ink-soft">
            {korilgan >= jami
              ? <><Icon name="check" size={11} className="text-brand-green-d" />{t("kichkintoyHammasi")}</>
              : t("kichkintoyKorildi", { n: korilgan, jami })}
          </span>
        )}
      </button>
    </Reveal>
  );
}
