/**
 * Aql Zone — dars yo'li (road map).
 *
 * Uchta qaror ataylab shunday qilingan:
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
import type { Progress, Unit } from "../lib/types";

const NODE = 76;         // tugallangan va joriy tugun o'lchami
const NODE_SM = 58;      // ochilmagan tugun — kichikroq, bosim kamayadi
const STEP = 108;        // tugunlar orasidagi vertikal masofa
const SVG_W = 280;       // yo'l chizig'i tuvali (markazga nisbatan ±140)
const OFF = [72, 54, 0, -54, -72, -54, 0, 54];   // ilon izi, o'ngdan boshlanadi

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
  const height = (n - 1) * STEP + NODE + 34;
  const color = UNIT_COLORS[U.color];

  // yo'lning bo'yalgan qismi — boshidan uzluksiz tugagan darslar
  let paved = -1;
  for (let li = 0; li < n; li++) {
    if (progress.done[lessonId(unitIndex, li)]) paved = li;
    else break;
  }

  const base = road(0, n - 1);

  return (
    <div className="relative w-full" style={{ height }}>
      {/* yo'l chizig'i */}
      <svg
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
        width={SVG_W}
        height={height}
        viewBox={`0 0 ${SVG_W} ${height}`}
        aria-hidden="true"
      >
        {base && (
          <>
            <path d={base} fill="none" stroke="var(--color-yol)" strokeWidth={18} strokeLinecap="round" />
            <path
              d={base}
              fill="none"
              stroke="var(--color-yol-chiziq)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="2 13"
            />
          </>
        )}
        {paved > 0 && (
          <path d={road(0, paved)} fill="none" stroke={color.road} strokeWidth={18} strokeLinecap="round" opacity={0.5} />
        )}
      </svg>

      {U.lessons.map((L, li) => {
        const st = nodeState(units, progress, unitIndex, li);
        const stars = progress.done[lessonId(unitIndex, li)] ?? 0;
        const locked = st === "locked";
        const size = locked ? NODE_SM : NODE;
        const off = offAt(li);
        const top = li * STEP + (NODE - size) / 2;      // markazi bir chizig'da qolsin

        // yozuv tugunning bo'sh tomonida turadi
        const onRight = off <= 0;
        const gap = size / 2 + 12;
        const [name, ...rest] = L.n.split(" · ");
        const meta = rest.join(" · ");

        return (
          <div key={li}>
            <button
              type="button"
              disabled={locked}
              onClick={() => onStart(unitIndex, li)}
              title={name}
              style={{ top, left: `calc(50% + ${off}px)`, width: size, height: size }}
              className={[
                "absolute -translate-x-1/2 rounded-full grid place-items-center text-white",
                "transition-[transform,box-shadow] duration-100",
                locked
                  ? "bg-locked shadow-[0_4px_0_rgb(0_0_0/0.14)] cursor-default"
                  : `${color.bg} border-4 border-karta/90 shadow-node active:translate-y-1 cursor-pointer`,
                st === "current" ? "az-pulse" : "",
              ].join(" ")}
            >
              {st === "done" ? (
                <Icon name="check" size={32} />
              ) : (
                <Icon name={L.ic} size={locked ? 24 : 30} className={locked ? "opacity-55" : ""} />
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
                style={{ top: li * STEP + NODE + 4, left: `calc(50% + ${off}px)` }}
                className="absolute z-10 -translate-x-1/2"
              >
                <span className="az-bob block rounded-2xl bg-brand-orange px-3 py-1 font-display text-xs
                                 whitespace-nowrap text-white shadow-[0_4px_0_var(--color-brand-orange-d)]">
                  Boshlash
                </span>
              </div>
            )}

            <div
              style={{
                top: li * STEP,
                height: NODE,
                width: "min(136px, calc(50% - 54px))",
                ...(onRight
                  ? { left: `calc(50% + ${off + gap}px)` }
                  : { left: `calc(50% + ${off - gap}px)`, transform: "translateX(-100%)" }),
              }}
              className={`absolute flex flex-col justify-center gap-0.5 ${onRight ? "text-left" : "text-right"}`}
            >
              <div className={`text-[13.5px] leading-tight ${locked ? "text-ink-dim" : "text-ink"}`}>{name}</div>
              {meta && <div className="text-[11px] text-ink-dim">{meta}</div>}
              {stars > 0 && (
                <div className={`flex gap-px text-brand-gold ${onRight ? "" : "justify-end"}`}>
                  {Array.from({ length: stars }, (_, i) => (
                    <Icon key={i} name="star" size={15} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
