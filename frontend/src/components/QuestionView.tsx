/**
 * Savolning ko'rinishi.
 *
 * Har bir tur o'z chizuvchisiga ega. Hali chizuvchisi yo'q turlar uchun
 * oxirida zaxira ko'rinish bor — savol matni ko'rsatiladi va dars baribir
 * o'ynaydi. Shu sabab yangi tur qo'shilganda hech narsa buzilmaydi.
 */
import { SHAPES } from "../lib/activity";
import { Rasm } from "./Rasm";
import type { Activity } from "../lib/activity";

export function QuestionView({ a }: { a: Activity }) {
  switch (a.type) {
    case "eqn":
      return <div className="text-center font-display text-[34px] leading-tight break-words">{a.text}</div>;

    case "column":
      return (
        <div className="font-display text-[34px] leading-tight tabular-nums">
          <div className="text-right">{a.a}</div>
          <div className="flex gap-4">
            <span>{a.op}</span>
            <span className="flex-1 text-right">{a.b}</span>
          </div>
          <div className="my-1 h-1 rounded bg-ink/70" />
          <div className="text-right text-brand-orange-d">?</div>
        </div>
      );

    case "numray": {
      return (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {a.arr.map((v, i) => (
            <span key={i}
              className={`grid h-12 min-w-12 place-items-center rounded-2xl px-2 font-display text-xl
                ${i === a.hide ? "bg-brand-orange/25 text-brand-orange-d" : "bg-karta shadow-clay-sm"}`}>
              {i === a.hide ? "?" : v}
            </span>
          ))}
        </div>
      );
    }

    case "frac": {
      // butunni teng bo'laklarga bo'lib, bittasini bo'yaymiz
      return (
        <div className="flex gap-1.5">
          {Array.from({ length: a.parts }, (_, i) => (
            <span key={i}
              className={`h-24 w-14 rounded-xl border-4 border-karta ${i < a.shaded ? "bg-brand-orange" : "bg-karta/70"}`} />
          ))}
        </div>
      );
    }

    case "clock": {
      const soatBurchak = ((a.h % 12) + a.m / 60) * 30;
      const daqiqaBurchak = a.m * 6;
      return (
        <svg viewBox="0 0 100 100" className="size-44">
          <circle cx="50" cy="50" r="46" fill="var(--color-karta)" stroke="var(--color-clay)" strokeWidth="4" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="50" y1="9" x2="50" y2="15" stroke="var(--color-ink-dim)" strokeWidth="2.5"
              strokeLinecap="round" transform={`rotate(${i * 30} 50 50)`} />
          ))}
          <line x1="50" y1="50" x2="50" y2="28" stroke="var(--color-ink)" strokeWidth="5" strokeLinecap="round"
            transform={`rotate(${soatBurchak} 50 50)`} />
          <line x1="50" y1="50" x2="50" y2="18" stroke="var(--color-brand-orange)" strokeWidth="3.5" strokeLinecap="round"
            transform={`rotate(${daqiqaBurchak} 50 50)`} />
          <circle cx="50" cy="50" r="3.5" fill="var(--color-ink)" />
        </svg>
      );
    }

    case "perim":
      return (
        <div className="text-center">
          <div className="mx-auto grid place-items-center rounded-xl border-4 border-brand-blue bg-karta/70"
            style={{ width: a.w * 22 + 20, height: a.h * 22 + 20 }}>
            <span className="font-display text-lg text-ink-soft">{a.w} × {a.h}</span>
          </div>
          <div className="mt-2 text-[13px] text-ink-soft">tomonlari {a.w} va {a.h}</div>
        </div>
      );

    case "area":
      return (
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${a.w}, 26px)` }}>
          {Array.from({ length: a.w * a.h }, (_, i) => (
            <span key={i} className="size-[26px] rounded-[5px] bg-brand-green/70" />
          ))}
        </div>
      );

    case "shapeName":
    case "corners":
      return <Shape shape={a.shape} />;

    case "mulvis":
    case "divvis":
      return (
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: a.g }, (_, gi) => (
            <div key={gi} className="flex flex-wrap justify-center gap-1 rounded-2xl bg-karta/70 p-2"
              style={{ maxWidth: 110 }}>
              {Array.from({ length: a.k }, (_, i) => (
                <span key={i} className="text-2xl">{a.emoji}</span>
              ))}
            </div>
          ))}
        </div>
      );

    case "coord":
      return (
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${a.w}, 46px)` }}>
          {Array.from({ length: a.w * a.h }, (_, i) => {
            const x = i % a.w, y = Math.floor(i / a.w);
            const bor = x === a.cx && y === a.cy;
            return (
              <span key={i} className="grid size-[46px] place-items-center rounded-xl bg-karta/80 text-2xl">
                {bor ? a.emoji : ""}
              </span>
            );
          })}
        </div>
      );

    case "data":
      return (
        <div className="flex w-full flex-col gap-2">
          {a.rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2 rounded-2xl bg-karta/75 px-3 py-2">
              <span className="text-2xl">{r.emoji}</span>
              <span className="flex flex-wrap gap-0.5">
                {Array.from({ length: r.n }, (_, j) => <span key={j} className="text-lg">{r.emoji}</span>)}
              </span>
            </div>
          ))}
        </div>
      );

    /* ---------- 1-sinf: savolning o'zi rasm bo'lishi kerak ---------- */

    case "rang":
      // Rang bo'sh bo'lsa savol faqat matnda ("Qaysi biri qizil?") —
      // bunda ustki qismda hech narsa ko'rsatilmaydi, javoblar o'zi yetarli.
      if (!a.rang) return null;
      return (
        <div className="size-40 rounded-full shadow-clay" style={{ background: a.rang }} />
      );

    case "rasm":
      if (!a.emoji) return null;
      // Savolning bosh qahramoni — eng katta va sekin suzib turadi.
      return <Rasm e={a.emoji} size={130} kech={0} />;

    case "count":
      return (
        <div className="flex max-w-[300px] flex-wrap justify-center gap-2 rounded-clay bg-karta/70 p-4">
          {Array.from({ length: a.n }, (_, i) => (
            <Rasm key={i} e={a.emoji} size={40} kech={i * 180} />
          ))}
        </div>
      );

    case "cmpvis":
      return (
        <div className="flex items-stretch gap-3">
          <Guruh n={a.a} emoji={a.emoji} />
          {/* "Hammasi nechta?" savolida guruhlar orasida "+" turadi — bola
              ikkalasini BIRGA sanashi kerakligini o'zi tushunadi. */}
          {a.plus && (
            <span className="self-center font-display text-[38px] leading-none text-brand-orange-d">+</span>
          )}
          <Guruh n={a.b} emoji={a.emoji} />
        </div>
      );

    case "odd":
      return (
        <div className="flex gap-2.5">
          {a.items.map((e, i) => (
            <span key={i} className="grid size-[68px] place-items-center rounded-3xl bg-karta/80 shadow-clay-sm">
              <Rasm e={e} size={44} kech={i * 220} />
            </span>
          ))}
        </div>
      );

    case "pos":
      return (
        <div className="grid grid-cols-3 gap-1.5 rounded-clay bg-karta/55 p-2">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="grid size-[62px] place-items-center rounded-2xl bg-karta/85">
              {i === a.cell && <Rasm e={a.emoji} size={38} kech={0} />}
            </span>
          ))}
        </div>
      );

    case "tens":
      // O'nlik = 10 tayoqchali dasta, birlik = yakka tayoqcha.
      // Bola dastalarni sanab, xona tushunchasini ko'z bilan ilg'ab oladi.
      return (
        <div className="flex flex-wrap items-end justify-center gap-3">
          {Array.from({ length: a.tens }, (_, t) => (
            <span key={t} className="flex gap-[3px] rounded-xl bg-brand-purple/15 p-1.5">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="h-11 w-[5px] rounded-full bg-brand-purple" />
              ))}
            </span>
          ))}
          {a.units > 0 && (
            <span className="flex gap-[5px] rounded-xl bg-brand-orange/15 p-1.5">
              {Array.from({ length: a.units }, (_, i) => (
                <span key={i} className="h-11 w-[5px] rounded-full bg-brand-orange" />
              ))}
            </span>
          )}
        </div>
      );

    /* ---------- maktabgacha: naqsh va belgilar ---------- */

    case "naqsh":
      return (
        <div className="flex max-w-[300px] flex-wrap items-center justify-center gap-1.5">
          {a.items.map((e, i) => (
            <span key={i} className="grid size-[54px] place-items-center rounded-2xl bg-karta/80 text-[30px] shadow-clay-sm">
              {e}
            </span>
          ))}
          {/* Naqshning davomi — bo'sh katak. Bola aynan shu yerga nima
              turishini topadi, shuning uchun u ajralib turishi kerak. */}
          <span className="grid size-[54px] place-items-center rounded-2xl bg-brand-orange/25
                           font-display text-[30px] text-brand-orange-d">
            ?
          </span>
        </div>
      );

    case "ayirvis":
      return (
        <div className="flex max-w-[300px] flex-wrap justify-center gap-2 rounded-clay bg-karta/70 p-4">
          {Array.from({ length: a.n }, (_, i) => {
            // Oxirgi `k` tasi — "ketganlar". Ular chizilib qoladi, chunki
            // yo'q qilib tashlansa bola nechtasi ketganini bilmaydi.
            const ketdi = i >= a.n - a.k;
            return (
              <span key={i} className="relative">
                <span className={`block ${ketdi ? "opacity-35" : ""}`}>
                  <Rasm e={a.emoji} size={40} kech={ketdi ? undefined : i * 180} />
                </span>
                {ketdi && (
                  <span className="absolute top-1/2 left-1/2 h-[3px] w-[42px] -translate-x-1/2
                                   -translate-y-1/2 rotate-[-32deg] rounded-full bg-brand-red" />
                )}
              </span>
            );
          })}
        </div>
      );

    case "belgi":
      // Belgi bo'sh bo'lsa savol faqat matnda ("Qaysi biri A harfi?") —
      // javob tugmalarining o'zi yetarli, ustida hech narsa turmaydi.
      if (!a.belgi) return null;
      // Bitta harf/raqam kvadrat kartada, katta chiziladi. So'z bo'lsa
      // (hafta kunlari) kvadratga sig'maydi — karta kengayadi va yozuv
      // kichrayadi, aks holda "Chorshanba" chetidan chiqib ketardi.
      return a.belgi.length <= 2 ? (
        <div className="grid size-40 place-items-center rounded-clay bg-karta shadow-clay
                        font-display text-[96px] leading-none text-brand-purple">
          {a.belgi}
        </div>
      ) : (
        <div className="rounded-clay bg-karta px-7 py-6 text-center font-display text-[38px]
                        leading-none text-brand-purple shadow-clay">
          {a.belgi}
        </div>
      );

    default:
      // Zaxira: yangi tur qo'shilganda ham dars o'ynaydi
      return <div className="text-center font-display text-2xl">{(a as { prompt: string }).prompt}</div>;
  }
}

/** Bir guruh narsa — "qayerda ko'p?" va "hammasi nechta?" savollarida. */
function Guruh({ n, emoji }: { n: number; emoji: string }) {
  return (
    <div className="flex max-w-[135px] flex-1 flex-wrap content-center justify-center gap-1 rounded-clay bg-karta/75 p-3">
      {Array.from({ length: n }, (_, i) => (
        <Rasm key={i} e={emoji} size={32} kech={i * 160} />
      ))}
    </div>
  );
}

/**
 * Savolning ko'rinadigan qismi bormi.
 *
 * Ba'zi savollar butunlay OG'ZAKI: "Qaysi biri sariq?" — ko'rsatadigan
 * narsasi yo'q, javob tugmalarining o'zi yetarli. Bunday paytda sahna
 * bo'sh qolmasligi kerak (`screens/Lesson.tsx` uning o'rniga "eshit"
 * ko'rinishini chizadi), aks holda ekranning yarmi quruq turadi va bola
 * u yerda nimadir bo'lishi kerakdek his qiladi.
 */
export function sahnaBor(a: Activity): boolean {
  if (a.type === "rasm") return Boolean(a.emoji);
  if (a.type === "rang") return Boolean(a.rang);
  if (a.type === "belgi") return Boolean(a.belgi);
  return true;
}

function Shape({ shape }: { shape: keyof typeof SHAPES }) {
  const s = "var(--color-brand-purple)";
  return (
    <svg viewBox="0 0 100 100" className="size-40">
      {shape === "circle" && <circle cx="50" cy="50" r="40" fill={s} />}
      {shape === "triangle" && <path d="M50 10L90 85H10z" fill={s} />}
      {shape === "square" && <rect x="14" y="14" width="72" height="72" rx="6" fill={s} />}
      {shape === "rect" && <rect x="8" y="26" width="84" height="48" rx="6" fill={s} />}
      {shape === "pentagon" && <path d="M50 8l40 29-15 47H25L10 37z" fill={s} />}
    </svg>
  );
}
