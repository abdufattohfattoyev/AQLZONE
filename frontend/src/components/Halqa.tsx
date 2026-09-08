/**
 * Foiz halqasi — chizilib to'ladigan aylana.
 *
 * ─────────────────── NEGA HALQA ───────────────────
 *
 * "89%" degan raqamning o'zi hech qanday tuyg'u bermaydi: u ko'pmi
 * yoki kammi ekani boshqa masalalar bilan solishtirmasdan bilinmaydi.
 * Halqa esa to'lgan va bo'sh qismni birga ko'rsatadi — javob raqamni
 * o'qishdan OLDIN keladi.
 *
 * ─────────────── CHIZILIB TO'LADI ───────────────
 *
 * Aylana noldan boshlanib, o'z qiymatiga yetguncha chiziladi. Bu
 * bezak emas: harakat ko'zni aynan shu joyga olib keladi va son
 * o'qilishidan oldin "qancha" degan savolga javob beradi. Tayyor
 * holda paydo bo'lgan halqa esa shunchaki yana bir dumaloq shakl
 * bo'lib qolardi.
 *
 * Harakatni kamaytirish yoqilgan bo'lsa (`prefers-reduced-motion`)
 * halqa darhol to'liq holatda turadi — `index.css` dagi qoidaga
 * qarang.
 */
import type { CSSProperties } from "react";

interface Props {
  /** 0–100. */
  foiz: number;
  /** Halqaning tashqi o'lchami (px). */
  olcham?: number;
  /** Chiziq rangi — Tailwind `stroke-*` klassi. */
  rang?: string;
  children?: React.ReactNode;
}

/** Aylananing radiusi 36x36 lik `viewBox` ichida. */
const R = 15;
const AYLANA = 2 * Math.PI * R;

export function Halqa({ foiz, olcham = 44, rang = "stroke-brand-green", children }: Props) {
  const nisbat = Math.max(0, Math.min(100, foiz)) / 100;

  return (
    <span className="relative grid shrink-0 place-items-center"
      style={{ width: olcham, height: olcham }}>
      {/* `-rotate-90` — SVG aylanasi o'ngdan boshlanadi, odam esa
          har doim TEPADAN boshlanishini kutadi (soat strelkasidek). */}
      <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={R} fill="none" strokeWidth="3.5"
          className="stroke-track" />
        <circle cx="18" cy="18" r={R} fill="none" strokeWidth="3.5"
          strokeLinecap="round"
          className={`az-halqa ${rang}`}
          style={{
            strokeDasharray: AYLANA,
            // Boshi — to'liq bo'sh halqa, oxiri — kerakli qismi.
            // Ikkalasi ham shu yerda: CSS aylananing uzunligini
            // bilmaydi, u radiusdan hisoblanadi.
            "--az-halqa-bosh": `${AYLANA}`,
            "--az-halqa-oxir": `${AYLANA * (1 - nisbat)}`,
          } as CSSProperties} />
      </svg>
      <span className="absolute">{children}</span>
    </span>
  );
}
