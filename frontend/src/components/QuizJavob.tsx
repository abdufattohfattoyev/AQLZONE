/**
 * Quizning yangi savol turlari uchun javob qismlari — o'z tezligida ham,
 * jonli o'yinda ham bir xil (`screens/QuizYech.tsx`).
 *
 * ─────────────── NEGA SUDRASH EMAS, BOSISH ───────────────
 *
 * Tartiblash va juftlash odatda sudrab qilinadi. Telegram ichida esa
 * sudrash ekranni aylantirish bilan to'qnashadi va 320px telefonda
 * barmoq elementni yopib qo'yadi. Bosish ikkalasida ham ishonchli:
 *
 *   tartib    elementlarni TO'G'RI tartibda bosasiz — har biriga raqam
 *             tushadi; raqamli elementni bossangiz, u va undan keyingilar
 *             qaytadi (o'rtadagi bitta xatoni tuzatish uchun)
 *   juftlash  chapdan birini, keyin o'ngdan birini bosasiz — ikkalasiga
 *             bir xil raqam tushadi; juftlangan chapni bossangiz — ajraladi
 */
import { useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import type { Javob, SavolTur, TogriJavob } from "../lib/quiz";

/** "To'g'ri" / "Noto'g'ri" — rost turidagi javob ("1"/"0") yozuvi. */
export const rostMatn = (v: string) => t(v === "1" ? "quizRost1" : "quizRost0");

const RAQAM = "grid size-7 shrink-0 place-items-center rounded-lg font-display text-[13px]";

export function TartibTanla({ items, value, onChange, disabled = false }: {
  items: string[]; value: string[]; onChange: (v: string[]) => void; disabled?: boolean;
}) {
  const bos = (x: string) => {
    if (disabled) return;
    tebrat("tanlov");
    const k = value.indexOf(x);
    onChange(k >= 0 ? value.slice(0, k) : [...value, x]);
  };
  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-[13px] text-ink-dim">{t("quizTartibIzoh")}</p>
      {items.map((x) => {
        const k = value.indexOf(x);
        return (
          <button key={x} type="button" onClick={() => bos(x)} disabled={disabled} aria-pressed={k >= 0}
            className={`clay-press flex min-h-[52px] items-center gap-3 rounded-2xl px-3 py-2 text-left shadow-clay-sm ${
              k >= 0 ? "bg-brand-blue/12 ring-2 ring-brand-blue" : "bg-karta"}`}>
            <span className={`${RAQAM} ${k >= 0 ? "bg-brand-blue text-white" : "bg-track text-ink-dim"}`}>
              {k >= 0 ? k + 1 : ""}
            </span>
            <span className="min-w-0 flex-1 text-[16px] break-words">{x}</span>
          </button>
        );
      })}
    </div>
  );
}

export function JuftTanla({ chap, ong, value, onChange, disabled = false }: {
  chap: string[]; ong: string[]; value: (string | null)[]; onChange: (v: (string | null)[]) => void; disabled?: boolean;
}) {
  const [tanlangan, setTanlangan] = useState<number | null>(null);
  // Bo'sh satr ham "juftlanmagan" — yuborishda javob satrlar ro'yxati bo'lib ketadi.
  const qiymat = chap.map((_, i) => value[i] || null);

  const chapBos = (i: number) => {
    if (disabled) return;
    tebrat("tanlov");
    if (qiymat[i] !== null) {
      onChange(qiymat.map((x, k) => (k === i ? null : x)));
      setTanlangan(i);
      return;
    }
    setTanlangan(tanlangan === i ? null : i);
  };
  const ongBos = (x: string) => {
    if (disabled || tanlangan === null) return;
    tebrat("tanlov");
    // Bu o'ng boshqa chapga ulangan bo'lsa — o'sha yerdan ko'chadi.
    onChange(qiymat.map((v, k) => (k === tanlangan ? x : v === x ? null : v)));
    const keyingi = qiymat.findIndex((v, k) => k !== tanlangan && v === null);
    setTanlangan(keyingi >= 0 ? keyingi : null);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-[13px] text-ink-dim">{t("quizJuftIzoh")}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          {chap.map((x, i) => {
            const n = qiymat[i] !== null ? i + 1 : null;
            const faol = tanlangan === i;
            return (
              <button key={x} type="button" onClick={() => chapBos(i)} disabled={disabled} aria-pressed={faol}
                className={`clay-press flex min-h-[52px] items-center gap-2 rounded-2xl px-2.5 py-2 text-left shadow-clay-sm ${
                  faol ? "bg-brand-blue/12 ring-2 ring-brand-blue" : "bg-karta"}`}>
                <span className={`${RAQAM} ${n ? "bg-brand-blue text-white" : "bg-track text-ink-dim"}`}>{n ?? ""}</span>
                <span className="min-w-0 flex-1 text-[15px] break-words">{x}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {ong.map((x) => {
            const k = qiymat.indexOf(x);
            return (
              <button key={x} type="button" onClick={() => ongBos(x)} disabled={disabled || tanlangan === null}
                className={`clay-press flex min-h-[52px] items-center gap-2 rounded-2xl px-2.5 py-2 text-left shadow-clay-sm
                            disabled:opacity-100 ${k >= 0 ? "bg-brand-blue/12" : "bg-karta"}`}>
                <span className={`${RAQAM} ${k >= 0 ? "bg-brand-blue text-white" : "bg-track text-ink-dim"}`}>
                  {k >= 0 ? k + 1 : ""}
                </span>
                <span className="min-w-0 flex-1 text-[15px] break-words">{x}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** To'g'ri / Noto'g'ri — ikki katta tugma. */
export function RostTanla({ value, onChange, togri, katta = false }: {
  value: string | null; onChange?: (v: string) => void; togri?: string | null; katta?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {(["1", "0"] as const).map((v) => {
        const bu = value === v;
        const toG = togri !== null && togri !== undefined && togri === v;
        return (
          <button key={v} type="button" disabled={!onChange} onClick={() => { tebrat("tanlov"); onChange?.(v); }}
            aria-pressed={bu}
            className={`tugma-3d flex flex-col items-center justify-center gap-1 rounded-3xl p-3 font-display shadow-clay
                        ${katta ? "min-h-[96px] text-[19px]" : "min-h-[72px] text-[17px]"} ${
              toG ? "bg-brand-green text-white"
                : togri && bu ? "bg-brand-red text-white"
                : bu ? "bg-brand-blue text-white"
                : "bg-karta text-ink"}`}>
            <Icon name={v === "1" ? "check" : "close"} size={22} />
            {rostMatn(v)}
          </button>
        );
      })}
    </div>
  );
}

/** To'g'ri (yoki berilgan) javobni turiga qarab yozadi — tahlil va natija uchun. */
export function JavobKorinish({ tur, javob, ixcham = false }: {
  tur: SavolTur; javob: TogriJavob | Javob | null; ixcham?: boolean;
}) {
  if (javob === null || javob === "") return <span className="text-ink-dim">—</span>;
  if (tur === "rost" && typeof javob === "string") return <b>{rostMatn(javob)}</b>;
  if (typeof javob === "string") return <b>{javob}</b>;
  if (tur === "juftlash" && Array.isArray(javob[0])) {
    const juftlar = javob as [string, string][];
    return ixcham
      ? <b>{juftlar.map(([a, b]) => `${a} → ${b}`).join("; ")}</b>
      : (
        <span className="flex flex-col gap-0.5">
          {juftlar.map(([a, b]) => <b key={a}>{a} → {b}</b>)}
        </span>
      );
  }
  return <b>{(javob as string[]).join(" → ")}</b>;
}
