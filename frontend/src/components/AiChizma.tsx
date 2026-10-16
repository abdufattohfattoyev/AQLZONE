/**
 * AI javobidagi chizmalar — funksiya grafigi, geometrik shakl, son o'qi.
 *
 * Nega model rasm "yasamaydi": rasm modeli matematikada adashadi (uchburchak
 * burchaklari, grafik kesishmalari noto'g'ri chiqadi) va qimmat. Bu yerda
 * model faqat koordinata va ifodalarni JSON qilib aytadi (`core/ai.py`,
 * `CHIZMA`), ilova esa ularni aniq SVG qilib chizadi — chizma hisob bilan
 * bir xil to'g'ri bo'ladi va tokenlar arzon.
 *
 * Model xato JSON yozsa yoki noma'lum tur bersa — blok jim tashlab
 * ketiladi: buzilgan chizmadan chizmasiz matn yaxshiroq.
 *
 * Ranglar: chiziq va yozuv — `currentColor` (ink, qorong'i rejimda oq),
 * to'r — ink-dim, asosiy obyekt — firuza (bitta urg'u rangi). Ikkinchi
 * funksiya amber, uchinchisi yashil — uchta rangdan chiqilmaydi.
 */
import type { Chizma, Geometriya, Grafik, Nuqta2, Reja, SonOqi } from "../lib/aiChizma";
import { t } from "../lib/matn";

/**
 * Reja — kunlar zinapoyasi: chapda kun va chiziq (ketma-ketlik), o'ngda
 * har ish uzunligi daqiqasiga mos chiziq. Bir qarashda qaysi kun og'ir
 * va qaysi mavzuga ko'p vaqt ketishi ko'rinadi. SVG emas, HTML: mavzu
 * nomlari uzun va o'raladi.
 */
function RejaKorinish({ c }: { c: Reja }) {
  const eng = Math.max(1, ...c.kunlar.flatMap((k) => k.ishlar.map((i) => i.daqiqa)));
  return (
    <ol className="flex flex-col">
      {c.kunlar.map((k, n) => {
        const jami = k.ishlar.reduce((s, i) => s + i.daqiqa, 0);
        const oxirgi = n === c.kunlar.length - 1;
        return (
          <li key={n} className="flex gap-3">
            <div className="flex w-3 shrink-0 flex-col items-center">
              <span className="mt-1.5 size-3 shrink-0 rounded-full bg-brand-blue" />
              {!oxirgi && <span className="w-[2px] flex-1 bg-brand-blue/30" />}
            </div>
            <div className={`min-w-0 flex-1 ${oxirgi ? "" : "pb-3.5"}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display text-[15px]">{k.kun || t("aiRejaKun", { n: n + 1 })}</span>
                {jami > 0 && <span className="text-[12.5px] text-ink-dim">{t("aiRejaDaq", { n: jami })}</span>}
              </div>
              <div className="mt-1 flex flex-col gap-1.5">
                {k.ishlar.map((i, j) => (
                  <div key={j}>
                    <div className="flex items-baseline justify-between gap-2 text-[13.5px] leading-snug">
                      <span className="min-w-0">{i.mavzu}</span>
                      {i.daqiqa > 0 && <span className="shrink-0 text-[12.5px] text-ink-dim">{i.daqiqa}′</span>}
                    </div>
                    {i.daqiqa > 0 && (
                      <div className="mt-0.5 h-1.5 rounded-full bg-track">
                        <div className="h-full rounded-full bg-brand-blue" style={{ width: `${(i.daqiqa / eng) * 100}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ==================== chizish ==================== */

const W = 320;
const H = 240;
const URGU = ["var(--color-brand-blue)", "var(--color-brand-gold)", "var(--color-brand-green)"];
const sonYoz = (v: number) => String(Math.round(v * 100) / 100).replace(".", ",");

/** Chiroyli qadam: 1, 2, 5 × 10^n — to'r chiziqlari 4–10 ta bo'lsin. */
function qadam(oraliq: number): number {
  const xom = oraliq / 8;
  const p = 10 ** Math.floor(Math.log10(xom));
  return [1, 2, 5, 10].map((k) => k * p).find((q) => q >= xom) ?? p * 10;
}

function GrafikSvg({ c }: { c: Grafik }) {
  const [x0, x1] = c.x;
  const [y0, y1] = c.y;
  const sx = (x: number) => ((x - x0) / (x1 - x0)) * W;
  const sy = (y: number) => H - ((y - y0) / (y1 - y0)) * H;
  const qx = qadam(x1 - x0);
  const qy = qadam(y1 - y0);

  // Har chizishda qayta hisoblanadi: 3 funksiya × 640 nuqta — arzon.
  const yollar = c.funksiyalar.map(({ f }) => {
    // Har piksel ikkiga bo'lib hisoblanadi; uzilish (1/x, tan) va
    // oraliqdan juda chiqqan joyda chiziq bo'linadi.
    let d = "";
    let ichida = false;
    for (let k = 0; k <= W * 2; k++) {
      const x = x0 + ((x1 - x0) * k) / (W * 2);
      const y = f(x);
      const chegara = (y1 - y0) * 3;
      if (!Number.isFinite(y) || y > y1 + chegara || y < y0 - chegara) { ichida = false; continue; }
      d += `${ichida ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
      ichida = true;
    }
    return d;
  });

  const tor: number[] = [];
  for (let v = Math.ceil(x0 / qx) * qx; v <= x1; v += qx) tor.push(v);
  const torY: number[] = [];
  for (let v = Math.ceil(y0 / qy) * qy; v <= y1; v += qy) torY.push(v);
  const oqX = y0 <= 0 && y1 >= 0 ? sy(0) : null;
  const oqY = x0 <= 0 && x1 >= 0 ? sx(0) : null;

  return (
    <>
      <svg viewBox={`-6 -6 ${W + 12} ${H + 12}`} className="w-full" role="img" aria-label={c.funksiyalar.map((f) => f.nom).join(", ")}>
        <defs><clipPath id="az-grafik"><rect width={W} height={H} /></clipPath></defs>
        <g className="text-ink-dim" stroke="currentColor" strokeOpacity={0.18} strokeWidth={1}>
          {tor.map((v) => <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={0} y2={H} />)}
          {torY.map((v) => <line key={`y${v}`} y1={sy(v)} y2={sy(v)} x1={0} x2={W} />)}
        </g>
        <g stroke="currentColor" strokeWidth={1.4}>
          {oqX !== null && <line x1={0} x2={W} y1={oqX} y2={oqX} />}
          {oqY !== null && <line y1={0} y2={H} x1={oqY} x2={oqY} />}
        </g>
        <g className="text-ink-dim" fill="currentColor" fontSize={10}>
          {oqX !== null && tor.filter((v) => Math.abs(v) > 1e-9).map((v) => (
            <text key={`tx${v}`} x={sx(v)} y={Math.min(H - 2, oqX + 12)} textAnchor="middle">{sonYoz(v)}</text>
          ))}
          {oqY !== null && torY.filter((v) => Math.abs(v) > 1e-9).map((v) => (
            <text key={`ty${v}`} x={Math.max(2, oqY - 4)} y={sy(v) + 3} textAnchor="end">{sonYoz(v)}</text>
          ))}
        </g>
        <g clipPath="url(#az-grafik)" fill="none" strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round">
          {yollar.map((d, k) => <path key={k} d={d} stroke={URGU[k]} />)}
        </g>
        {c.nuqtalar.map((n, k) => {
          const px = sx(n.x);
          const py = sy(n.y);
          if (px < -1 || px > W + 1 || py < -1 || py > H + 1) return null;
          return (
            <g key={k}>
              <circle cx={px} cy={py} r={4} fill="currentColor" />
              {n.nom && (
                <text x={px + (px > W - 60 ? -7 : 7)} y={py - 7} fontSize={11.5} fill="currentColor"
                  textAnchor={px > W - 60 ? "end" : "start"} className="font-bold">{n.nom}</text>
              )}
            </g>
          );
        })}
      </svg>
      {c.funksiyalar.some((f) => f.nom) && (
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
          {c.funksiyalar.map((f, k) => f.nom && (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded-full" style={{ background: URGU[k] }} />{f.nom}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function GeometriyaSvg({ c }: { c: Geometriya }) {
  const qiymatlar = [...Object.values(c.nuqtalar)];
  for (const a of c.aylanalar) {
    qiymatlar.push([a.markaz[0] - a.r, a.markaz[1] - a.r], [a.markaz[0] + a.r, a.markaz[1] + a.r]);
  }
  const xs = qiymatlar.map((p) => p[0]);
  const ys = qiymatlar.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // Bir xil masshtab (shakl cho'zilmasin) va yorliqlar uchun chekka.
  const CHEKKA = 26;
  const k = Math.min((W - 2 * CHEKKA) / Math.max(maxX - minX, 1e-6), (H - 2 * CHEKKA) / Math.max(maxY - minY, 1e-6));
  const ox = (W - (maxX - minX) * k) / 2;
  const oy = (H - (maxY - minY) * k) / 2;
  const P = (p: Nuqta2): Nuqta2 => [ox + (p[0] - minX) * k, H - (oy + (p[1] - minY) * k)];
  const N = (n: string) => P(c.nuqtalar[n]);
  const markaz: Nuqta2 = [ox + ((maxX - minX) * k) / 2, H - (oy + ((maxY - minY) * k) / 2)];

  /** Birlik vektor. */
  const yonalish = (a: Nuqta2, b: Nuqta2): Nuqta2 => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
      <g fill="none" stroke="var(--color-brand-blue)" strokeWidth={2}>
        {c.aylanalar.map((a, i) => {
          const [cx, cy] = P(a.markaz);
          return <circle key={i} cx={cx} cy={cy} r={a.r * k} />;
        })}
      </g>
      <g stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
        {c.kesmalar.map((s, i) => {
          const [ax, ay] = N(s.a);
          const [bx, by] = N(s.b);
          return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} strokeDasharray={s.shtrix ? "6 5" : undefined}
            strokeWidth={s.shtrix ? 1.6 : 2.2} />;
        })}
      </g>
      {c.burchaklar.map((b, i) => {
        const u = N(b.uch);
        const v1 = yonalish(u, N(b.a));
        const v2 = yonalish(u, N(b.b));
        if (b.togri) {
          const r = 11;
          const p1: Nuqta2 = [u[0] + v1[0] * r, u[1] + v1[1] * r];
          const p3: Nuqta2 = [u[0] + v2[0] * r, u[1] + v2[1] * r];
          const p2: Nuqta2 = [p1[0] + v2[0] * r, p1[1] + v2[1] * r];
          return <path key={i} d={`M${p1}L${p2}L${p3}`} fill="none" stroke="var(--color-brand-blue)" strokeWidth={1.6} />;
        }
        const r = 20;
        const s1: Nuqta2 = [u[0] + v1[0] * r, u[1] + v1[1] * r];
        const s2: Nuqta2 = [u[0] + v2[0] * r, u[1] + v2[1] * r];
        // Kichik yoy: vektor ko'paytmasining ishorasi yo'nalishni beradi.
        const soat = v1[0] * v2[1] - v1[1] * v2[0] > 0 ? 1 : 0;
        const ort = yonalish([0, 0], [v1[0] + v2[0], v1[1] + v2[1]]);
        return (
          <g key={i}>
            <path d={`M${s1}A${r},${r} 0 0 ${soat} ${s2}`} fill="none" stroke="var(--color-brand-blue)" strokeWidth={1.8} />
            {b.matn && (
              <text x={u[0] + ort[0] * (r + 11)} y={u[1] + ort[1] * (r + 11) + 4} textAnchor="middle" fontSize={12}
                fill="var(--color-brand-blue-t)" className="font-bold">{b.matn}</text>
            )}
          </g>
        );
      })}
      {c.yorliqlar.map((y, i) => {
        const a = N(y.a);
        const b = N(y.b);
        const o: Nuqta2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        // Yorliq kesmaning shakl markazidan UZOQ tomoniga qo'yiladi.
        let n = yonalish([0, 0], [-(b[1] - a[1]), b[0] - a[0]]);
        if ((o[0] - markaz[0]) * n[0] + (o[1] - markaz[1]) * n[1] < 0) n = [-n[0], -n[1]];
        return (
          <text key={i} x={o[0] + n[0] * 13} y={o[1] + n[1] * 13 + 4} textAnchor="middle" fontSize={12.5}
            fill="var(--color-brand-blue-t)" className="font-bold">{y.matn}</text>
        );
      })}
      {Object.keys(c.nuqtalar).map((n) => {
        const p = N(n);
        const d = yonalish(markaz, p);
        const uz = Math.hypot(p[0] - markaz[0], p[1] - markaz[1]) < 1 ? [0, -1] : d;
        return (
          <g key={n}>
            <circle cx={p[0]} cy={p[1]} r={3.2} fill="currentColor" />
            <text x={p[0] + uz[0] * 13} y={p[1] + uz[1] * 13 + 4.5} textAnchor="middle" fontSize={13.5}
              fill="currentColor" className="font-bold">{n}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SonOqiSvg({ c }: { c: SonOqi }) {
  const qiymatlar = [
    ...c.oraliqlar.flatMap((o) => [o.dan, o.gacha]).filter((v): v is number => v !== null),
    ...c.nuqtalar.map((n) => n.x),
  ];
  const min = Math.min(...qiymatlar);
  const max = Math.max(...qiymatlar);
  const yon = Math.max((max - min) * 0.35, 1.5);
  const [a, b] = [min - yon, max + yon];
  const HH = 70;
  const Y = 34;
  const sx = (v: number) => 14 + ((v - a) / (b - a)) * (W - 28);
  // Faqat model aytgan sonlar yoziladi — to'liq shkala son o'qini chalkashtirardi.
  const belgilar = [...new Set(qiymatlar)];
  // Uchning nomi (π/4) berilgan bo'lsa — o'nli son (0,79) o'rniga shu yoziladi:
  // trigonometriyada 0,79 o'quvchiga hech narsa demaydi.
  const nomlar = new Map<number, string>();
  for (const o of c.oraliqlar) {
    if (o.dan !== null && o.danNom) nomlar.set(o.dan, o.danNom);
    if (o.gacha !== null && o.gachaNom) nomlar.set(o.gacha, o.gachaNom);
  }
  for (const n of c.nuqtalar) if (n.nom) nomlar.set(n.x, n.nom);

  return (
    <svg viewBox={`0 0 ${W} ${HH}`} className="w-full" role="img">
      <g stroke="currentColor" strokeWidth={1.6}>
        <line x1={4} x2={W - 6} y1={Y} y2={Y} />
        <path d={`M${W - 12},${Y - 5}L${W - 4},${Y}L${W - 12},${Y + 5}`} fill="none" />
      </g>
      {c.oraliqlar.map((o, i) => {
        const x1 = o.dan === null ? 4 : sx(o.dan);
        const x2 = o.gacha === null ? W - 8 : sx(o.gacha);
        return (
          <g key={i}>
            <rect x={x1} y={Y - 9} width={Math.max(0, x2 - x1)} height={18} rx={4}
              fill="var(--color-brand-blue)" fillOpacity={0.22} />
            <line x1={x1} x2={x2} y1={Y} y2={Y} stroke="var(--color-brand-blue)" strokeWidth={4} />
            {o.dan !== null && <Uch x={sx(o.dan)} yopiq={o.danYopiq} y={Y} />}
            {o.gacha !== null && <Uch x={sx(o.gacha)} yopiq={o.gachaYopiq} y={Y} />}
          </g>
        );
      })}
      {c.nuqtalar.map((n, i) => <Uch key={i} x={sx(n.x)} yopiq={n.yopiq} y={Y} />)}
      <g fill="currentColor" fontSize={12.5} textAnchor="middle" className="font-bold">
        {belgilar.map((v) => <text key={v} x={sx(v)} y={Y + 26}>{nomlar.get(v) ?? sonYoz(v)}</text>)}
      </g>
    </svg>
  );
}

/** Oraliq uchi: yopiq — to'la doira, ochiq — ichi bo'sh. */
function Uch({ x, y, yopiq }: { x: number; y: number; yopiq: boolean }) {
  return <circle cx={x} cy={y} r={5.5} stroke="var(--color-brand-blue)" strokeWidth={2.4}
    fill={yopiq ? "var(--color-brand-blue)" : "var(--color-sahna)"} />;
}

export function AiChizma({ c }: { c: Chizma }) {
  return (
    <figure className="my-2 rounded-2xl bg-sahna p-3 text-ink shadow-ichki">
      {c.tur === "grafik" ? <GrafikSvg c={c} />
        : c.tur === "geometriya" ? <GeometriyaSvg c={c} />
        : c.tur === "reja" ? <RejaKorinish c={c} />
        : <SonOqiSvg c={c} />}
    </figure>
  );
}
