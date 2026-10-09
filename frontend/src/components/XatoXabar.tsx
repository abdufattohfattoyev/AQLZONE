/**
 * "Xato haqida xabar berish" — savol ostidagi kichik tugma va varaq.
 *
 * Generatorlar minglab savol yasaydi va ularning birortasida xato
 * (noto'g'ri javob, variantlarda to'g'ri javob yo'q, buzuq ko'rinish)
 * bo'lsa, buni faqat o'quvchi ko'radi. Tugma bo'lmasa u indamay
 * ilovani yopadi — xato esa minglab odamga ko'rinishda davom etadi.
 *
 * Tugma ATAYLAB kichik va xira: odam savolga javob berish uchun kelgan,
 * u chalg'itmasligi kerak (dizayn qoidasi). Rang — neytral, qizil emas:
 * qizil faqat xato JAVOB uchun.
 *
 * Xabar bilan savolning SURATI ketadi (matn, variantlar, javob,
 * tanlangani): savollar har safar qaytadan yasaladi va admin "o'sha
 * savol"ni boshqa yo'l bilan topa olmaydi (`backend/core/xato_xabar.py`).
 */
import { useState } from "react";
import type { Activity, Answer } from "../lib/activity";
import { xatoXabarYubor, type XatoXabarTana } from "../lib/api";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import { Tanlov, TanlovVaraq } from "./Varaq";

type Sabab = XatoXabarTana["sabab"];

const SABABLAR: { k: Sabab; matn: () => string }[] = [
  { k: "javob", matn: () => t("xxJavob") },
  { k: "variant", matn: () => t("xxVariant") },
  { k: "savol", matn: () => t("xxSavol") },
  { k: "korinish", matn: () => t("xxKorinish") },
  { k: "boshqa", matn: () => t("xxBoshqa") },
];

/** Savolning odam o'qiydigan matni — admin xabarida birinchi qator. */
function savolMatni(a: Activity): string {
  const x = a as unknown as Record<string, unknown>;
  const qism = [a.prompt];
  if (typeof x.kirish === "string" && x.kirish) qism.push(x.kirish);
  if (typeof x.text === "string" && x.text && x.text !== a.prompt) qism.push(x.text);
  if (a.type === "column") qism.push(`${a.a} ${a.op} ${a.b}`);
  if (a.type === "numray") qism.push(a.arr.map((v, i) => (i === a.hide ? "?" : v)).join(", "));
  if (a.type === "frac") qism.push(`${a.shaded}/${a.parts}`);
  if (a.type === "clock") qism.push(`${a.h}:${String(a.m).padStart(2, "0")}`);
  if (a.type === "perim" || a.type === "area") qism.push(`${a.w} × ${a.h}`);
  return qism.filter(Boolean).join(" · ");
}

/** Activity → server uchun surat. Funksiya va chizma (SVG) tushib qoladi. */
function surat(a: Activity, tanlangan?: Answer | null): Record<string, unknown> {
  const toza: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(a)) {
    if (typeof v === "function" || k === "rasm" || k === "yechim") continue;
    toza[k] = v;
  }
  toza.matn = savolMatni(a);
  if (tanlangan !== undefined && tanlangan !== null) toza.tanlangan = tanlangan;
  return toza;
}

export function XatoXabar({ a, joy, kalit, tanlangan, className = "" }: {
  a: Activity;
  /** "5-sinf · Kasrlar · Qo'shish" — admin qayerdan kelganini ko'radi. */
  joy: string;
  /** Bir xil savol turiga kelgan xabarlarni guruhlash: "kurs:bob:dars:tur". */
  kalit: string;
  /** Odam tanlagan variant (bo'lsa). */
  tanlangan?: Answer | null;
  className?: string;
}) {
  const [ochiq, setOchiq] = useState(false);
  const [sabab, setSabab] = useState<Sabab | null>(null);
  const [izoh, setIzoh] = useState("");
  const [holat, setHolat] = useState<"" | "band" | "ok" | "chegara" | "xato">("");

  function yop() {
    setOchiq(false);
    setSabab(null);
    setIzoh("");
    setHolat("");
  }

  async function yubor() {
    if (!sabab || holat === "band") return;
    setHolat("band");
    const natija = await xatoXabarYubor({
      sabab, izoh: izoh.trim(), joy, kalit: `${kalit}:${a.type}`, savol: surat(a, tanlangan),
    });
    setHolat(natija);
    if (natija === "ok") {
      tebrat("togri");
      window.setTimeout(yop, 1600);
    }
  }

  return (
    <>
      <button type="button" onClick={() => { tebrat("tanlov"); setOchiq(true); }}
        data-tahlil="Savol: xato haqida xabar"
        className={`clay-press flex min-h-11 items-center gap-1.5 px-2 text-[12.5px] text-ink-dim ${className}`}>
        <Icon name="ogoh" size={15} />
        {t("xxTugma")}
      </button>

      {ochiq && (
        <TanlovVaraq sarlavha={t("xxSarlavha")} onYop={yop}>
          {holat === "ok" ? (
            <div className="flex w-full flex-col items-center gap-2 py-4 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-brand-green text-white">
                <Icon name="check" size={24} />
              </span>
              <p className="text-[14.5px] leading-snug text-ink-soft">{t("xxRahmat")}</p>
            </div>
          ) : (
            <>
              <p className="mb-1 w-full text-[13px] leading-snug text-ink-dim">{t("xxIzohMatn")}</p>
              {SABABLAR.map((s) => (
                <Tanlov key={s.k} faol={sabab === s.k} on={() => setSabab(s.k)}>{s.matn()}</Tanlov>
              ))}
              <textarea value={izoh} onChange={(e) => setIzoh(e.target.value.slice(0, 500))}
                rows={2} placeholder={t("xxIzohJoy")}
                className="shadow-ichki mt-2 w-full resize-none rounded-2xl bg-sahna px-3.5 py-2.5
                           text-[14.5px] text-ink outline-none placeholder:text-ink-dim" />
              {(holat === "xato" || holat === "chegara") && (
                <p className="w-full text-[13px] text-ink-soft">
                  {holat === "chegara" ? t("xxChegara") : t("aloqaYoq")}
                </p>
              )}
              <button type="button" onClick={yubor} disabled={!sabab || holat === "band"}
                data-tahlil="Savol: xato xabarini yuborish"
                className="tugma-3d mt-2 h-11 w-full rounded-3xl bg-brand-blue font-display text-[15px]
                           text-white disabled:opacity-50">
                {holat === "band" ? t("yuklanyapti") : t("xxYuborish")}
              </button>
            </>
          )}
        </TanlovVaraq>
      )}
    </>
  );
}
