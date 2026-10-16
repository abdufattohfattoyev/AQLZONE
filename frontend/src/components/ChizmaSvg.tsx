/**
 * Chizma modelini SVG qilib chizadi (`lib/chizmaModel.ts`).
 *
 * `t` berilmasa — hammasi tayyor (AI suhbatidagi rasm). `t` (0..1) berilsa —
 * doskadagidek: shu paytgacha chizilgani ko'rinadi, chizilayotgan chiziq
 * qisman, qalam (firuza nuqta) uning uchida. Qalamning joyi `onQalam` bilan
 * yuqoriga beriladi — maskot o'sha yerga uchadi (`JonliDoska.tsx`).
 */
import { useEffect } from "react";
import type { Nuqta2 } from "../lib/aiChizma";
import { jadval, qisman } from "../lib/chizmaModel";
import type { Element, Model, Rang } from "../lib/chizmaModel";

/** Faqat uch rang (dizayn qoidasi): ink, firuza, amber/yashil — ikkinchi-uchinchi funksiya. */
const RANG: Record<Rang, string> = {
  ink: "currentColor",
  dim: "color-mix(in srgb, currentColor 20%, transparent)",
  urgu: "var(--color-brand-blue)",
  urgu2: "var(--color-brand-gold)",
  urgu3: "var(--color-brand-green)",
  urguT: "var(--color-brand-blue-t)",
};

const yol = (qismlar: Nuqta2[][]) =>
  qismlar.map((q) => q.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("")).join("");

/** Bitta element, `f` (0..1) qismi chizilgan. Qalam joyi qaytadi. */
function chiz(e: Element, f: number, key: number): { el: React.ReactNode; qalam: Nuqta2 | null } {
  if (f <= 0) return { el: null, qalam: null };
  switch (e.tur) {
    case "chiziq": {
      const q = qisman(e.qismlar, f);
      return {
        el: <path key={key} d={yol(q.qismlar)} fill="none" stroke={RANG[e.rang]} strokeWidth={e.qalin}
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.shtrix ? "6 5" : undefined} />,
        qalam: q.qalam,
      };
    }
    case "nuqta": {
      // "Qo'yilish": kattaroq paydo bo'lib, o'z o'lchamiga tushadi.
      const r = e.r * (f < 1 ? 0.4 + 1.1 * f : 1);
      return {
        el: <circle key={key} cx={e.p[0]} cy={e.p[1]} r={r} stroke={RANG[e.rang]} strokeWidth={e.ochiq ? 2.4 : 0}
          fill={e.ochiq ? "var(--color-sahna)" : RANG[e.rang]} />,
        qalam: e.p,
      };
    }
    case "matn":
      return {
        el: <text key={key} x={e.p[0]} y={e.p[1]} fontSize={e.olcham} textAnchor={e.anchor} fill={RANG[e.rang]}
          opacity={Math.min(1, f * 1.4)} className={e.qalin ? "font-bold" : undefined}>{e.matn}</text>,
        qalam: e.p,
      };
    case "soha":
      return {
        el: <rect key={key} x={e.x} y={e.y} width={e.w * Math.min(1, f)} height={e.h} rx={4} fill={RANG[e.rang]} fillOpacity={0.22} />,
        qalam: [e.x + e.w * Math.min(1, f), e.y + e.h / 2],
      };
  }
}

export function ChizmaSvg({ m, t = null, qalamKorinsin = false, onQalam, aria }: {
  m: Model;
  /** null — hammasi tayyor; 0..1 — doskadagidek qisman. */
  t?: number | null;
  qalamKorinsin?: boolean;
  /** Qalamning joyi — SVG koordinatalarining ulushi (0..1), maskot uchun. */
  onQalam?: (p: { x: number; y: number } | null) => void;
  aria?: string;
}) {
  const vaqt = jadval(m.qadamlar);
  let qalam: Nuqta2 | null = null;
  const qadamlar = m.qadamlar.map((e, i) => {
    const { dan, gacha } = vaqt[i]!;
    const f = t === null ? 1 : gacha <= dan ? (t >= gacha ? 1 : 0) : (t - dan) / (gacha - dan);
    const r = chiz(e, Math.min(1, f), i);
    // Qalam — hozir chizilayotgan (0 < f < 1) element uchida; tugagan bo'lsa oxirgisida.
    if (r.qalam && f > 0) qalam = r.qalam;
    return r.el;
  });
  const tayyor = t === null || t >= 1;
  const qx = qalam ? (qalam as Nuqta2)[0] / m.W : null;
  const qy = qalam ? (qalam as Nuqta2)[1] / m.H : null;

  useEffect(() => {
    onQalam?.(qx === null || qy === null || tayyor ? null : { x: qx, y: qy });
  }, [qx, qy, tayyor, onQalam]);

  return (
    <svg viewBox={`-6 -6 ${m.W + 12} ${m.H + 12}`} className="w-full overflow-visible" role="img" aria-label={aria}>
      <g>{m.fon.map((e, i) => chiz(e, 1, i).el)}</g>
      <g>{qadamlar}</g>
      {qalamKorinsin && qalam && !tayyor && (
        <circle cx={(qalam as Nuqta2)[0]} cy={(qalam as Nuqta2)[1]} r={5} fill="var(--color-brand-blue)"
          stroke="var(--color-karta)" strokeWidth={2} />
      )}
    </svg>
  );
}

/** Grafik izohi — funksiya rangi va nomi. */
export function ChizmaIzoh({ m }: { m: Model }) {
  if (!m.izoh.length) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
      {m.izoh.map((z, k) => (
        <span key={k} className="flex items-center gap-1.5">
          <span className="h-[3px] w-4 rounded-full" style={{ background: RANG[z.rang] }} />{z.nom}
        </span>
      ))}
    </div>
  );
}
