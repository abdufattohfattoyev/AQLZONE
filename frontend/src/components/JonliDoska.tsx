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
 *   * qalam (firuza nuqta) chizilayotgan joyda — ko'z o'sha yerga tikiladi.
 *     Ustoz personaj (Kubik) doska ostida turib unga ishora qiladi
 *     (`screens/JonliDars.tsx`), doskaning o'zida hech narsani yopmaydi.
 *
 * Vaqt tashqaridan keladi (`t`, 0..1): pleyer uni ovoz bilan birga suradi
 * va pauzada to'xtatadi. Fon — katakli daftar (faqat neytral rang).
 */
import { useMemo } from "react";
import { model } from "../lib/chizmaModel";
import type { Chizma } from "../lib/aiChizma";
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

  // Vaqt taqsimoti: qatorlar (har biri 1) → chizma (CHIZMA_OGIRLIK).
  const jami = yozuv.length + (m ? CHIZMA_OGIRLIK : 0) || 1;
  const qatorF = (i: number) => Math.max(0, Math.min(1, t * jami - i));
  const chizmaT = m ? Math.max(0, Math.min(1, (t * jami - yozuv.length) / CHIZMA_OGIRLIK)) : 1;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto rounded-clay bg-karta p-4
                    text-ink shadow-clay-sm min-[360px]:p-5" style={KATAK}>
      {yozuv.map((q, i) => (
        <p key={i}
          className="self-start font-display text-[18px] leading-snug break-words min-[360px]:text-[20px]"
          style={{ clipPath: `inset(-4px ${(1 - qatorF(i)) * 100}% -4px 0)` }}>
          {q}
        </p>
      ))}
      {m && (
        <div className="mx-auto mt-1 w-full max-w-[420px]">
          <ChizmaSvg m={m} t={chizmaT} qalamKorinsin />
          {chizmaT >= 1 && <ChizmaIzoh m={m} />}
        </div>
      )}
    </div>
  );
}
