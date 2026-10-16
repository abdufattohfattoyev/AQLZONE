/**
 * JONLI DOSKA — dars sahnasi ustoz doskaga yozayotgandek ko'rsatiladi.
 *
 * Nega: rasm va formula birdaniga chiqsa, o'quvchi qayerga qarashni
 * bilmaydi va ovoz bilan ko'rinish ajralib qoladi. Ustoz esa avval o'qni
 * chizadi, keyin nuqtani qo'yadi, keyin chiziqni tortadi — ko'z doim
 * hozir gapirilayotgan narsada. Shu yerda ham:
 *
 *   * avval doska qatorlari birma-bir "yoziladi" (chapdan o'ngga ochiladi);
 *   * keyin chizma elementlari tartib bilan chiziladi (`lib/chizmaModel.ts`);
 *   * qalam (firuza nuqta) chizilayotgan joyda, tulki uning yonida uchib
 *     yuradi — kichik bola ham, abituriyent ham ko'zini o'sha yerga tikadi.
 *
 * Vaqt tashqaridan keladi (`t`, 0..1): pleyer uni ovoz bilan birga suradi
 * va pauzada to'xtatadi. Fon — katakli daftar (faqat neytral rang).
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { model } from "../lib/chizmaModel";
import type { Chizma } from "../lib/aiChizma";
import { Hajmli } from "../lib/hajmli";
import { ChizmaIzoh, ChizmaSvg } from "./ChizmaSvg";

/** Chizma elementlari doska qatoriga nisbatan qancha "og'ir" (vaqt ulushi). */
const CHIZMA_OGIRLIK = 3;

/** Katakli daftar foni — `color-mix` bilan, qorong'i rejimda ham ko'rinadi. */
export const KATAK: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(color-mix(in srgb, var(--color-ink) 7%, transparent) 1px, transparent 1px)," +
    "linear-gradient(90deg, color-mix(in srgb, var(--color-ink) 7%, transparent) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

export function JonliDoska({ yozuv, chizma, t }: { yozuv: string[]; chizma: Chizma | null; t: number }) {
  const m = useMemo(() => (chizma ? model(chizma) : null), [chizma]);
  const doska = useRef<HTMLDivElement>(null);
  const qatorlar = useRef<(HTMLParagraphElement | null)[]>([]);
  const svgQuti = useRef<HTMLDivElement>(null);
  const [tulki, setTulki] = useState<{ x: number; y: number } | null>(null);

  // Vaqt taqsimoti: qatorlar (har biri 1) → chizma (CHIZMA_OGIRLIK).
  const jami = yozuv.length + (m ? CHIZMA_OGIRLIK : 0) || 1;
  const qatorF = (i: number) => Math.max(0, Math.min(1, t * jami - i));
  const chizmaT = m ? Math.max(0, Math.min(1, (t * jami - yozuv.length) / CHIZMA_OGIRLIK)) : 1;
  const faolQator = yozuv.findIndex((_, i) => qatorF(i) > 0 && qatorF(i) < 1);

  /** Doska ichidagi nuqta (px) — tulki shu yerga uchadi. */
  const joyla = useCallback((x: number, y: number) => {
    const d = doska.current?.getBoundingClientRect();
    if (d) setTulki({ x: x - d.left, y: y - d.top });
  }, []);

  // Qator yozilayotganda — tulki qatorning "yozilgan" uchida.
  useLayoutEffect(() => {
    if (faolQator < 0) return;
    const q = qatorlar.current[faolQator]?.getBoundingClientRect();
    if (q) joyla(q.left + q.width * qatorF(faolQator), q.top + q.height / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faolQator, t, joyla]);

  // Chizma chizilayotganda — qalam uchida (SVG koordinatasidan ekranga).
  const onQalam = useCallback((p: { x: number; y: number } | null) => {
    const s = svgQuti.current?.querySelector("svg")?.getBoundingClientRect();
    if (!p || !s || !m) return;
    // viewBox chetida 6 birlik zaxira bor (`ChizmaSvg`).
    joyla(s.left + ((p.x * m.W + 6) / (m.W + 12)) * s.width, s.top + ((p.y * m.H + 6) / (m.H + 12)) * s.height);
  }, [joyla, m]);

  // Chizish tugadi — tulki doskaning pastki o'ng burchagida dam oladi.
  const tugadi = t >= 1;
  useEffect(() => { if (tugadi) setTulki(null); }, [tugadi]);

  return (
    <div ref={doska} className="relative flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden rounded-clay bg-karta p-4
                                text-ink shadow-clay-sm min-[360px]:p-5" style={KATAK}>
      {yozuv.map((q, i) => (
        <p key={i} ref={(el) => { qatorlar.current[i] = el; }}
          className="self-start font-display text-[19px] leading-snug min-[360px]:text-[20px]"
          style={{ clipPath: `inset(-4px ${(1 - qatorF(i)) * 100}% -4px 0)` }}>
          {q}
        </p>
      ))}
      {m && (
        <div ref={svgQuti} className="mt-1">
          <ChizmaSvg m={m} t={chizmaT} qalamKorinsin onQalam={onQalam} />
          {chizmaT >= 1 && <ChizmaIzoh m={m} />}
        </div>
      )}
      <span aria-hidden className="pointer-events-none absolute top-0 left-0 transition-transform duration-300 ease-out"
        style={{
          // Qalamning o'ng tomonida, shu balandlikda: yozilgan matnni yopmaydi
          // (o'ngda hali yozilmagan joy) va doska tepasida kesilmaydi.
          transform: tulki
            ? `translate(${tulki.x + 8}px, ${Math.max(0, tulki.y - 22)}px)`
            // Dam olishda — yuqori o'ng burchakda (pastda subtitr turadi).
            : `translate(calc(${doska.current?.clientWidth ?? 300}px - 54px), 8px)`,
        }}>
        <Hajmli nom="tulki" olcham={40} jonli={!tugadi} />
      </span>
    </div>
  );
}
