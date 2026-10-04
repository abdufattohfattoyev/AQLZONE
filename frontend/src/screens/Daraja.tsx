/**
 * AQL BILAN TANISHUV — daraja aniqlash (`lib/daraja.ts`).
 *
 * Uch qadam, har biri BITTA ekran:
 *
 *   kirish   Aql salom beradi: nima bo'lishi, qancha vaqt, baho yo'qligi
 *   savol    bitta savol, variantlar va "Bilmayman"
 *   natija   yo'l xaritasi: bayroq bola boshlaydigan bobga tushadi,
 *            undan oldingi boblar "ochiq", keyingilari yopiq
 *
 * ─────────────── NEGA BU TEST EMAS, SUHBAT ───────────────
 *
 * Bola uchun "test" so'zi baho bilan bog'langan va u qo'rqadi — qo'rqqan
 * bola taxmin qiladi, taxmin esa natijani buzadi. Shuning uchun:
 *
 *   - savollar soni yozilmaydi ("3 / 12"), faqat chiziq to'lib boradi:
 *     test erta tugasa ham, bola "chala qoldi" deb o'ylamaydi
 *   - javobdan keyin QIZIL ham, YASHIL ham yo'q — tanlangan variant bir
 *     lahza ko'k bo'ladi va keyingi savol keladi. Ketma-ket uchta qizil
 *     javob ko'rgan bola qolgan savollarga ham qo'l siltab qo'yardi
 *   - "Bilmayman" bor va u kirishda tushuntiriladi: bilmagan narsani
 *     taxmin qilmaslik — to'g'ri yo'l, aks holda u o'zi uddalay
 *     olmaydigan bobga tushib qoladi
 *
 * Natija `onNatija` orqali DARHOL saqlanadi — natija ekranidan chiqib
 * ketilsa ham, kurs topilgan bobdan boshlanadi.
 */
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Icon } from "../lib/icons";
import { Logo } from "../components/Logo";
import { Rasm } from "../components/Rasm";
import { QuestionView, sahnaBor, shartSahnada } from "../components/QuestionView";
import { Hajmli } from "../lib/hajmli";
import type { Activity, Answer } from "../lib/activity";
import type { Course } from "../lib/curriculum";
import {
  darajaBoshla, darajaFoiz, darajaJavob, darajaSavol, joriyBob, savolIzi,
} from "../lib/daraja";
import type { DarajaHolat } from "../lib/daraja";
import { gapir, tovush } from "../lib/ovoz";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";

interface Props {
  kurs: Course;
  /** Test tugadi — boshlanadigan bob saqlansin. */
  onNatija: (bob: number) => void;
  /** Natija ekranidagi asosiy tugma: topilgan bobning birinchi darsi. */
  onDars: (bob: number) => void;
  /** Kurs sahifasiga (boblar ro'yxatiga). */
  onKurs: () => void;
}

/** Tanlangan variant shuncha vaqt ko'k turadi, keyin keyingi savol. */
const KUTISH = 380;

export function Daraja({ kurs, onNatija, onDars, onKurs }: Props) {
  const units = kurs.units;
  const [bosqich, setBosqich] = useState<"kirish" | "savol" | "natija">("kirish");
  const [holat, setHolat] = useState<DarajaHolat>(() => darajaBoshla(units));
  const chiqqan = useRef(new Set<string>());
  const yangiSavol = (h: DarajaHolat) => {
    const a = darajaSavol(units[joriyBob(units, h)]!, h.togri + h.xato, chiqqan.current);
    chiqqan.current.add(savolIzi(a));
    return a;
  };
  const [savol, setSavol] = useState<Activity>(() => yangiSavol(holat));
  const [tanlangan, setTanlangan] = useState<Answer | "bilmayman" | null>(null);

  const strelka = useOrqaga(onKurs);

  // Har yangi savol ovoz bilan o'qiladi — 1-sinf bolasi hali o'qimaydi.
  useEffect(() => {
    if (bosqich === "savol") gapir(savol.prompt);
  }, [bosqich, savol]);

  function javob(v: Answer | "bilmayman") {
    if (tanlangan !== null) return;
    setTanlangan(v);
    tebrat("tanlov");
    const yangi = darajaJavob(units, holat, v !== "bilmayman" && String(v) === String(savol.answer));
    setTimeout(() => {
      setTanlangan(null);
      setHolat(yangi);
      if (yangi.natija !== null) {
        onNatija(yangi.natija);
        tovush("togri");
        tebrat("yutuq");
        setBosqich("natija");
        window.scrollTo(0, 0);
      } else {
        setSavol(yangiSavol(yangi));
      }
    }, KUTISH);
  }

  const sarlavha = (
    <div className="flex min-h-11 items-center gap-3">
      {strelka && (
        <button type="button" onClick={onKurs} title={t("ortga")} aria-label={t("ortga")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta text-ink shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}
      {bosqich === "savol" ? (
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-track" role="progressbar"
          aria-valuenow={Math.round(darajaFoiz(units, holat) * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-brand-blue transition-[width] duration-500"
            style={{ width: `${darajaFoiz(units, holat) * 100}%` }} />
        </div>
      ) : (
        <h1 className="min-w-0 flex-1 truncate font-display text-[20px]">{t("bugunTanishuv")}</h1>
      )}
    </div>
  );

  /* ─────────────────────────── kirish ─────────────────────────── */
  if (bosqich === "kirish") {
    return (
      <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-6">
        {sarlavha}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-6 text-center">
          <span className="az-suzish"><Logo size={96} /></span>
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-[22px] leading-tight">{t("darajaSalom")}</h2>
            <p className="text-[13px] font-bold text-ink-dim">
              {kursMatn(kurs.title)} · {t("darajaQisqa")}
            </p>
          </div>
          <p className="max-w-[340px] rounded-clay bg-karta px-4 py-3.5 text-left text-[15px] leading-snug
                        text-ink-soft shadow-clay-sm">
            {t("darajaIzoh")}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2">
          <button type="button" onClick={() => { tebrat("tanlov"); setBosqich("savol"); }}
            data-tahlil="Daraja: boshlash"
            className="tugma-3d flex min-h-[54px] items-center justify-center gap-2 rounded-[16px] bg-brand-blue
                       font-display text-[18px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("darajaBoshla")}
            <Icon name="chevron" size={18} />
          </button>
          <button type="button" data-tahlil="Daraja: boshidan"
            onClick={() => { onNatija(0); onDars(0); }}
            className="clay-press min-h-11 rounded-[14px] text-[15px] font-bold text-ink-soft">
            {t("darajaBoshidan")}
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────── natija ─────────────────────────── */
  if (bosqich === "natija" && holat.natija !== null) {
    const bob = holat.natija;
    return (
      <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4">
        {sarlavha}
        <div className="mt-5 flex flex-col items-center gap-1.5 text-center">
          <span className="az-katta"><Hajmli nom="bayroq" olcham={64} jonli /></span>
          <h2 className="font-display text-[22px] leading-tight">{t("darajaTopdik")}</h2>
          <p className="font-display text-[18px] text-brand-blue-t">{t("darajaBob", { n: bob + 1 })}</p>
          <p className="max-w-[320px] text-[14.5px] leading-snug text-ink-soft">
            {bob === 0 ? t("darajaBoshdan")
              : bob === 1 ? t("darajaOchiqBir") : t("darajaOchiqKop", { m: bob })}
          </p>
        </div>

        {/* Yo'l xaritasi: bayroq topilgan bobga TUSHADI (`az-tush`). Oldingi
            boblar ochiq, keyingilari yopiq — Darslar ekranidagi bilan bir xil
            qoida (`lib/types.ts` → isUnlocked), ya'ni bu va'da emas, haqiqat. */}
        <ol className="mt-5 flex flex-col rounded-clay bg-karta px-3 py-2 shadow-clay-sm">
          {units.map((U, ui) => {
            const shu = ui === bob;
            return (
              <li key={ui}
                className={`relative flex min-h-12 items-center gap-3 rounded-[14px] px-2 ${shu ? "bg-brand-blue/8" : ""}`}>
                {/* Bob nuqtalarini bog'lovchi chiziq — yo'l. */}
                {ui < units.length - 1 && (
                  <span aria-hidden className="absolute top-[34px] left-[21px] h-[calc(100%-20px)] w-0.5 bg-track" />
                )}
                <span className={`relative z-[1] grid size-[26px] shrink-0 place-items-center rounded-full ${
                  shu ? "bg-brand-blue text-white"
                    : ui < bob ? "bg-karta ring-2 ring-brand-blue/40 ring-inset" : "bg-track text-ink-dim"}`}>
                  {shu ? <span className="text-[12px] font-bold">{ui + 1}</span>
                    : ui > bob ? <Icon name="lock" size={12} /> : null}
                </span>
                <span className={`min-w-0 flex-1 text-[14.5px] leading-tight ${
                  shu ? "font-bold" : ui < bob ? "text-ink-soft" : "text-ink-dim"}`}>
                  {kursMatn(U.u)}
                </span>
                {shu ? (
                  <span className="az-tush flex shrink-0 items-center gap-1 text-[12.5px] font-bold text-brand-blue-t"
                    style={{ "--az-kech": "350ms" } as CSSProperties}>
                    <Hajmli nom="bayroq" olcham={22} />
                    {t("darajaShuYerda")}
                  </span>
                ) : ui < bob && (
                  <span className="shrink-0 text-[12px] text-ink-dim">{t("darajaOchiq")}</span>
                )}
              </li>
            );
          })}
        </ol>

        {/* Tugmalar ekran pastida qotib turadi (boblar 16 tagacha bo'ladi va
            ro'yxat ekrandan uzun) — orqasi tekis fon bilan, aks holda ostidagi
            bob nomlari tugma orasidan ko'rinib turardi. */}
        <div className="sticky bottom-0 z-10 -mx-4 mt-4 flex flex-col items-stretch gap-2 bg-[var(--az-body)] px-4
                        pt-3 pb-4">
          <button type="button" onClick={() => onDars(bob)} data-tahlil="Daraja: darsni boshlash"
            className="tugma-3d flex min-h-[54px] items-center justify-center gap-2 rounded-[16px] bg-brand-blue
                       font-display text-[18px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("darajaDarsniBoshla")}
            <Icon name="chevron" size={18} />
          </button>
          <button type="button" onClick={onKurs} data-tahlil="Daraja: barcha boblar"
            className="clay-press min-h-11 rounded-[14px] bg-sahna text-[15px] font-bold text-ink-soft">
            {t("darajaBoblar")}
          </button>
        </div>
      </div>
    );
  }

  /* ─────────────────────────── savol ─────────────────────────── */
  const A = savol;
  const rasmli = A.kind === "rang" || A.kind === "emoji" || A.kind === "belgi";
  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-6">
      {sarlavha}

      {!shartSahnada(A) && (
        <div key={`p-${holat.savol}`}
          className="az-savol mt-5 rounded-clay bg-karta p-4 text-center text-[15px] leading-snug shadow-clay-sm">
          {A.prompt}
        </div>
      )}

      <div className="relative my-4 flex flex-1 items-center justify-center rounded-clay bg-sahna/85 p-4
                      ring-1 ring-track ring-inset">
        <div key={`q-${holat.savol}`} className="az-savol">
          {sahnaBor(A) ? <QuestionView a={A} /> : <Logo size={88} />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {A.choices.map((c, i) => {
          const bu = tanlangan !== null && String(c) === String(tanlangan);
          return (
            <button key={`${holat.savol}-${i}`} type="button" onClick={() => javob(c)} disabled={tanlangan !== null}
              className={[
                "tugma-3d relative grid place-items-center rounded-3xl shadow-clay",
                rasmli ? "h-24" : "min-h-16 px-2 py-4 font-display text-2xl break-words",
                bu ? "bg-brand-blue text-white" : "bg-karta text-ink",
              ].join(" ")}>
              {A.kind === "rang"
                ? <span className="size-16 rounded-full ring-3 ring-white/70 outline outline-2 outline-ink/15"
                    style={{ background: String(c) }} />
                : A.kind === "emoji" ? <Rasm e={String(c)} size={84} />
                  : A.kind === "belgi" ? <span className="font-display text-[54px] leading-none">{c}</span>
                    : c}
            </button>
          );
        })}
      </div>

      <button type="button" onClick={() => javob("bilmayman")} disabled={tanlangan !== null}
        data-tahlil="Daraja: bilmayman"
        className={`clay-press mt-3 min-h-11 rounded-[14px] text-[15px] font-bold ${
          tanlangan === "bilmayman" ? "bg-brand-blue text-white" : "text-ink-soft"}`}>
        {t("darajaBilmayman")}
      </button>
    </div>
  );
}
