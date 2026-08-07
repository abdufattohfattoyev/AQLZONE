/**
 * Aql Zone — dars yo'li (road map).
 *
 * ─────────── NEGA QAYTA YASALDI ───────────
 *
 * Avvalgi ko'rinishda uchta nuqson bor edi va uchalasi ham bitta
 * sababdan kelib chiqardi: yo'l MANZARALI FON ustida to'g'ridan-to'g'ri
 * chizilardi.
 *
 *   YUVILIB KETGAN. Yo'l rangi `--color-yol` — deyarli shaffof kulrang.
 *   Ostidagi matematik belgilar naqshi undan o'tib ko'rinardi va yo'l
 *   "chizilmagan" bo'lib tuyulardi.
 *
 *   O'LIK TUGUNLAR. Ochilmagan darslar tekis bej doira edi. Fon ham
 *   iliq rangda bo'lgani uchun ular fondan deyarli ajralmasdi —
 *   natijada yo'lning yarmi "bo'sh joy" bo'lib ko'rinardi.
 *
 *   OSILGAN YOZUVLAR. Dars nomlari hech qanday tayanchsiz, to'g'ridan-
 *   to'g'ri naqsh ustida turardi. Gah o'ngda, gah chapda — ko'z ularni
 *   ro'yxat sifatida o'qiy olmasdi.
 *
 * Endi yo'l O'Z YUZASIDA turadi: bobning rangiga bo'yalgan yumshoq
 * panel. Fon shu panel ostida qoladi va yo'l ham, tugun ham, yozuv ham
 * o'sha yuzada aniq ko'rinadi.
 *
 * ─────────── O'ZGARMAGAN QARORLAR ───────────
 *
 *  1. Yo'l O'NG tomondan boshlanib chapga buriladi — bola qayerdan qadam
 *     tashlashini birinchi qarashda ko'radi.
 *  2. QULFLAR DEVORI yo'q. Ochilmagan darslar kichik va xira bo'ladi, lekin
 *     ustida qulf belgisi turmaydi. Qulflar qatori bolani "bu yerga hali
 *     yo'l yo'q" degan tuyg'u bilan to'xtatadi; xira tugun esa "hali oldinda"
 *     deb ko'rsatadi — bir xil ma'lumot, boshqa kayfiyat.
 *  3. Yo'lning o'tilgan qismi bo'yalgan turadi, shunda mehnat ko'rinadi.
 */
import { Icon } from "../lib/icons";
import { UNIT_COLORS, lessonId, nodeState } from "../lib/types";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import type { Progress, Unit } from "../lib/types";

const NODE = 70;         // tugallangan va joriy tugun o'lchami
const NODE_SM = 52;      // ochilmagan tugun — kichikroq, bosim kamayadi
const STEP = 98;         // tugunlar orasidagi vertikal masofa
const SVG_W = 252;       // yo'l chizig'i tuvali (markazga nisbatan ±126)

/**
 * Ilon izi — o'ngdan boshlanadi.
 *
 * Chetki qiymat 58 (ilgari 72 edi). Sabab o'lchovda ko'rindi: yozuv
 * tugunning bo'sh tomonida turadi va chetki tugunda unga atigi
 * `50% − 58 − gap` qoladi. 320px li telefonda bu ~60px edi — dars nomi
 * to'rt qatorga bo'linib ketardi.
 */
const OFF = [58, 42, 0, -42, -58, -42, 0, 42];

/**
 * Panel chetidagi bo'shliq.
 *
 * Birinchi tugun panelning yuqori chetiga TEGIB turardi va joriy
 * darsning kengayuvchi halqasi (`az-pulse`) kesilib qolardi — ya'ni
 * "shu yerdasan" degan eng muhim ishora yarim ko'rinardi.
 */
const PAD = 16;

const offAt = (i: number) => OFF[i % OFF.length];
const cx = (i: number) => SVG_W / 2 + offAt(i);
const cy = (i: number) => i * STEP + NODE / 2;

/** Tugun markazlaridan silliq o'tadigan yo'l chizig'i (kubik Bezye). */
function road(from: number, to: number): string {
  if (to <= from) return "";
  const k = STEP * 0.42;
  let d = `M ${cx(from)} ${cy(from)}`;
  for (let i = from; i < to; i++) {
    d += ` C ${cx(i)} ${cy(i) + k}, ${cx(i + 1)} ${cy(i + 1) - k}, ${cx(i + 1)} ${cy(i + 1)}`;
  }
  return d;
}

interface Props {
  units: Unit[];
  unitIndex: number;
  progress: Progress;
  onStart: (ui: number, li: number) => void;
}

export function RoadMap({ units, unitIndex, progress, onStart }: Props) {
  const U = units[unitIndex];
  const n = U.lessons.length;
  // Oxirgi tugun ostida "Boshlash" pufagi uchun joy qoldiriladi — aks
  // holda oxirgi dars joriy bo'lganda pufak kartadan pastga chiqib ketardi.
  const height = (n - 1) * STEP + NODE + 40;
  const color = UNIT_COLORS[U.color];

  // yo'lning bo'yalgan qismi — boshidan uzluksiz tugagan darslar
  let paved = -1;
  for (let li = 0; li < n; li++) {
    if (progress.done[lessonId(unitIndex, li)]) paved = li;
    else break;
  }

  const base = road(0, n - 1);

  return (
    <div className="relative w-full" style={{ height: height + PAD * 2 }}>
      {/* ---- yo'lning O'Z YUZASI ----
          Rang bobnikidan olinadi, lekin past to'yinganlikda: panel
          ko'zga tashlanmasligi, faqat fonni to'sishi kerak. Ichkarida
          yupqa yorug' chegara — yuza "botiq" bo'lib ko'rinadi va yo'l
          uning ichida yotgandek tuyuladi.

          ALOHIDA QATLAM bo'lib turadi, tugunlarning ota-elementi
          emas. Sabab: `overflow-hidden` bilan joriy darsning
          kengayuvchi halqasi (`az-pulse`) panel chetida kesilib
          qolardi. Fon esa hech narsani kesmaydi.

          Rang KLASS bilan emas, uslub bilan beriladi: Tailwind
          klasslarni manba matnidan topib yasaydi va `${color.road}14`
          kabi yig'ilgan satr hech qachon CSS'ga tushmasdi. */}
      <div aria-hidden className="absolute inset-0 rounded-clay"
        style={{
          backgroundColor: `${color.road}16`,
          boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.55), inset 0 0 0 1px ${color.road}24`,
        }} />

      {/* yo'l chizig'i */}
      <svg
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ top: PAD }}
        width={SVG_W}
        height={height}
        viewBox={`0 0 ${SVG_W} ${height}`}
        aria-hidden="true"
      >
        {base && (
          <>
            {/* Yo'lning soyasi — bir piksel pastda, to'qroq. Usiz yo'l
                yuzaga chizilgan tasma emas, unga YOPISHTIRILGAN
                lenta bo'lib ko'rinardi. */}
            <path d={base} fill="none" stroke="rgb(0 0 0 / 0.06)" strokeWidth={23}
              strokeLinecap="round" transform="translate(0 2)" />
            {/* CHEGARA — bob rangida, juda past to'yinganlikda.
                Usiz yo'l ham, yozuv pufakchalari ham oq bo'lib, ular
                bir-biriga qo'shilib ketardi: ko'z yo'lning qayerda
                tugab, yozuv qayerdan boshlanganini ajrata olmasdi. */}
            <path d={base} fill="none" stroke={`${color.road}3a`} strokeWidth={22}
              strokeLinecap="round" />
            <path d={base} fill="none" stroke="var(--color-karta)" strokeWidth={18}
              strokeLinecap="round" />
            {/* O'rtadagi punktir — yo'l ekanini aytadigan yagona belgi */}
            <path d={base} fill="none" stroke={`${color.road}66`} strokeWidth={3}
              strokeLinecap="round" strokeDasharray="1 11" />
          </>
        )}
        {paved > 0 && (
          <>
            {/* O'TILGAN QISM to'liq bo'yalgan, yarim shaffof emas.
                Ilgari u `opacity 0.5` bilan chizilardi va tugagan yo'l
                tugamaganidan deyarli farq qilmasdi — ya'ni bola
                qilgan mehnati ko'rinmasdi. */}
            <path d={road(0, paved)} fill="none" stroke={color.road} strokeWidth={22}
              strokeLinecap="round" />
            <path d={road(0, paved)} fill="none" stroke="rgb(255 255 255 / 0.5)"
              strokeWidth={4} strokeLinecap="round" strokeDasharray="1 11" />
          </>
        )}
      </svg>

      {U.lessons.map((L, li) => {
        const st = nodeState(units, progress, unitIndex, li);
        const stars = progress.done[lessonId(unitIndex, li)] ?? 0;
        const locked = st === "locked";
        const size = locked ? NODE_SM : NODE;
        const off = offAt(li);
        const top = PAD + li * STEP + (NODE - size) / 2;  // markazi bir chizig'da qolsin

        // yozuv tugunning bo'sh tomonida turadi
        const onRight = off <= 0;
        const gap = size / 2 + 10;

        return (
          <div key={li}>
            <button
              type="button"
              disabled={locked}
              onClick={() => onStart(unitIndex, li)}
              title={kursMatn(L.n).split(" · ")[0]}
              style={{
                top, left: `calc(50% + ${off}px)`, width: size, height: size,
                ...(locked ? {} : { backgroundColor: color.road }),
              }}
              className={[
                "absolute -translate-x-1/2 rounded-full grid place-items-center",
                "transition-[transform,box-shadow] duration-100",
                locked
                  /* OCHILMAGAN tugun endi bej emas, OQ karta: yuzadan
                     ajralib turadi va "bo'sh joy" bo'lib ko'rinmaydi.
                     Xiraligi rangda emas, ICHIDAGI belgining
                     to'qligida — shakl aniq, mazmuni esa hali kutmoqda. */
                  ? "bg-karta/70 text-ink-dim shadow-[0_2px_0_rgb(0_0_0/0.08)] cursor-default"
                  : "text-white border-4 border-karta shadow-node active:translate-y-1 cursor-pointer",
                st === "current" ? "az-pulse" : "",
              ].join(" ")}
            >
              {st === "done" ? (
                <Icon name="check" size={30} />
              ) : (
                <Icon name={L.ic} size={locked ? 22 : 28} />
              )}

              {/* YULDUZLAR TUGUN USTIDA, yozuvda emas.
                  Ilgari ular dars nomining ostida turardi va uzun nomli
                  darsda yozuv uch qatorga cho'zilib ketardi. Tugunning
                  o'zida esa ular natijaning BELGISI bo'lib turadi —
                  o'yinlardagi kabi. */}
              {stars > 0 && (
                <span className="absolute -bottom-2 flex rounded-full bg-karta px-1 py-px
                                 shadow-[0_2px_4px_rgb(0_0_0/0.15)]">
                  {Array.from({ length: stars }, (_, i) => (
                    <Icon key={i} name="star" size={11} className="text-brand-gold" />
                  ))}
                </span>
              )}
            </button>

            {/* "Boshlash" pufagi tugun OSTIDA, markazi bilan tekislangan.
                Ilgari u tugunning yozuvsiz tomonida turardi va o'ng chekkadagi
                tugun uchun o'sha tomonda joy YO'Q edi: 320px enli kartada
                pufak chetdan 17px tashqariga chiqib, yarmi kesilib qolardi.
                Chetga surib ham bo'lmaydi — u holda pufak tugunning ustiga
                minadi. Tugun ostida esa u har qanday enda sig'adi, chunki
                markazi tugun markazi bilan bir xil. */}
            {st === "current" && (
              <div
                style={{ top: PAD + li * STEP + NODE + 8, left: `calc(50% + ${off}px)` }}
                className="absolute z-10 -translate-x-1/2"
              >
                <span className="az-bob block rounded-full bg-brand-orange px-3.5 py-1
                                 font-display text-[12.5px] whitespace-nowrap text-white
                                 shadow-[0_3px_0_var(--color-brand-orange-d)]">
                  {t("boshlash")}
                </span>
              </div>
            )}

            <Yozuv nom={kursMatn(L.n)} li={li} off={off} gap={gap}
              onRight={onRight} locked={locked} pad={PAD} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Dars nomi — endi PUFAKCHA ichida.
 *
 * Ilgari u yalang'och matn edi va manzarali fon ustida o'qish qiyin
 * bo'lardi: naqshning chizig'i harflar orasidan o'tardi. Pufakcha esa
 * matnga o'z yuzasini beradi va butun ro'yxatni bir xil qiladi — ko'z
 * endi ularni QATOR sifatida o'qiydi, tarqoq yozuvlar sifatida emas.
 *
 * Ochilmagan darsda pufakcha SHAFFOFROQ: u bor, lekin o'ziga
 * chaqirmaydi.
 */
function Yozuv({ nom, li, off, gap, onRight, locked, pad }: {
  nom: string; li: number; off: number; gap: number;
  onRight: boolean; locked: boolean; pad: number;
}) {
  // Dars nomining ikkinchi qismi — darslik betlari ("· 12–14-bet").
  // Yo'lda u ortiqcha: bola betlarni izlamaydi, ota-ona esa ularni
  // darsning o'zida ko'radi.
  const [asosiy] = nom.split(" · ");

  return (
    <div
      style={{
        top: pad + li * STEP,
        height: NODE,
        width: `min(122px, calc(50% - ${gap + 14}px))`,
        ...(onRight
          ? { left: `calc(50% + ${off + gap}px)` }
          : { left: `calc(50% + ${off - gap}px)`, transform: "translateX(-100%)" }),
      }}
      className="absolute flex items-center"
    >
      <span
        className={`rounded-xl px-2.5 py-1.5 text-[12.5px] leading-tight
                    ${onRight ? "text-left" : "ml-auto text-right"}
                    ${locked
                      ? "bg-karta/45 text-ink-dim"
                      : "bg-karta text-ink shadow-[0_2px_5px_rgb(0_0_0/0.08)]"}`}
      >
        {asosiy}
      </span>
    </div>
  );
}
