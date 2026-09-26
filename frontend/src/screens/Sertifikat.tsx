/**
 * MILLIY SERTIFIKAT — variantlar ro'yxati (`manba/Sertifikat.dc.html`).
 *
 * `screens/Imtihon.tsx` (DTM) bilan bir qolipda: tepada holat, ostida
 * variantlar. Ikki farqi bor va ikkalasi ham imtihonning o'zidan kelib
 * chiqadi (`lib/sertifikat.ts`):
 *
 *   BALL, FOIZ EMAS    sertifikatda natija 100 ballik va savollarning
 *                      "og'irligi" har xil — foiz odamga hech narsa
 *                      aytmaydi, "76,8 ball · B" esa aytadi.
 *   DAVOM ETISH        variant uch soatlik va uni bo'lib ishlash mumkin:
 *                      yarim qolgani alohida ko'k kartada.
 *
 * Yangi dizaynda o'rtacha ball ostida DARAJA SHKALASI turadi: odam
 * qaysi darajada ekanini va keyingisigacha qancha qolganini ko'radi.
 * Chegaralar qo'lda yozilmaydi — `DARAJA_SHKALA` dan (`lib/sertifikat.ts`).
 */
import { useState } from "react";
import { ImtihonSarlavha } from "../components/ImtihonTur";
import { t } from "../lib/matn";
import {
  DAQIQA, DARAJA_SHKALA, TUZILISH, VARIANTLAR, berilgan, daraja, engYaxshi, joriyniOqi, ortacha,
} from "../lib/sertifikat";

const SAVOL_SONI = TUZILISH.y1 + TUZILISH.y2 + TUZILISH.o;

/** "67,4", "80,0" — doim bitta kasr xonasi, vergul bilan (o'zbek va rus yozuvi). */
const ballYoz = (b: number) => b.toFixed(1).replace(".", ",");

/** Shkala pog'onalari — ko'kning ochdan to'qqa (C → A+). */
const POGONA = ["bg-brand-blue/25", "bg-brand-blue/35", "bg-brand-blue/50", "bg-brand-blue/65",
  "bg-brand-blue/80", "bg-brand-blue"];

export function Sertifikat({ onVariant, onDtm, onChiq }: {
  onVariant: (n: number) => void;
  onDtm: () => void;
  onChiq: () => void;
}) {
  // Bir marta o'qiladi: ekran ochiq turganda variant o'zgarmaydi.
  const [joriy] = useState(joriyniOqi);
  const o = ortacha();
  const d = o ? daraja(o.ball) : null;

  const qoldi = joriy ? Math.max(0, Math.ceil((joriy.tugash - Date.now()) / 60_000)) : 0;
  const javobli = joriy ? joriy.javoblar.filter(berilgan).length : 0;

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-10 min-[360px]:px-[18px]
                    sm:max-w-[560px]">
      <ImtihonSarlavha joriy="sertifikat" onTanla={onDtm} onChiq={onChiq} />

      {/* ---- o'rtacha va shkala ---- */}
      <div className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:p-[18px]">
        {o ? (
          <>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-ink-dim">{t("imtOrtachaSert")}</div>
                <div className="mt-0.5 font-display text-[34px] leading-none font-bold">
                  {ballYoz(o.ball)}
                  <span className="ml-1 text-[16px] font-semibold text-ink-soft">{t("sertBallDan")}</span>
                </div>
              </div>
              {d && (
                <span className="flex shrink-0 flex-col items-center rounded-2xl bg-brand-gold/20 px-3.5 py-2">
                  <span className="font-display text-[22px] leading-none font-bold text-brand-gold-d">{d}</span>
                  <span className="text-[12px] font-semibold text-brand-gold-d">{t("imtTaxminiy")}</span>
                </span>
              )}
            </div>
            <Shkala ball={o.ball} />
          </>
        ) : (
          <>
            <div className="font-display text-[18px] leading-tight">{t("imtihonBoshlang")}</div>
            <p className="text-[14px] leading-snug text-ink-soft">{t("sertBoshlangIzoh")}</p>
            <Shkala />
          </>
        )}
      </div>

      {/* ---- yarim qolgan variant ---- */}
      {joriy && (
        <button type="button" onClick={() => onVariant(joriy.n)} data-tahlil="Sertifikat: davom etish"
          className="tugma-3d flex w-full flex-col gap-2.5 rounded-clay bg-brand-blue p-4 text-left text-white
                     shadow-[0_5px_0_var(--color-brand-blue-d)] min-[360px]:p-[18px]">
          <span className="flex w-full items-baseline justify-between gap-2">
            <span className="font-display text-[18px] leading-tight font-bold min-[360px]:text-[20px]">
              {t("imtDavomSarlavha", { n: joriy.n })}
            </span>
            <span className="shrink-0 text-[13px] font-bold opacity-90">
              {qoldi > 0 ? t("imtDaqQoldi", { n: qoldi }) : t("imtVaqtTugadi")}
            </span>
          </span>
          <span className="flex w-full items-center gap-2.5">
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/30">
              <span className="block h-full rounded-full bg-white" style={{ width: `${(javobli / SAVOL_SONI) * 100}%` }} />
            </span>
            <span className="shrink-0 text-[13px] font-bold">{t("imtJavobSoni", { a: javobli, b: SAVOL_SONI })}</span>
          </span>
          <span className="text-[13px] leading-snug opacity-90">{t("imtSaqlangan")}</span>
        </button>
      )}

      {/* ---- variantlar ---- */}
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="font-display text-[20px]">{t("imtihonVariantlar")}</h2>
        <span className="text-[13px] text-ink-dim">
          {t("sertIzoh", { savol: SAVOL_SONI, soat: DAQIQA / 60, ball: 100 })}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: VARIANTLAR }, (_, i) => i + 1).map((n) => {
          const eng = engYaxshi(n);
          const bu = joriy?.n === n;
          return (
            <button key={n} type="button" onClick={() => onVariant(n)} data-tahlil={`Sertifikat: ${n}-variant`}
              aria-label={t("imtihonVariant", { n })}
              className={`clay-press flex min-h-[60px] flex-col items-center justify-center rounded-[16px] bg-karta
                          shadow-clay-sm ${bu ? "outline-2 outline-brand-blue outline-solid" : ""}`}>
              <span className="font-display text-[18px] leading-tight font-bold">{n}</span>
              <span className={`text-[12.5px] ${bu ? "font-bold text-brand-blue-t" : "text-ink-dim"}`}>
                {bu ? `${javobli}/${SAVOL_SONI}` : eng ? ballYoz(eng.ball) : "—"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[13px] leading-snug text-ink-dim">{t("sertPastIzoh")}</p>
    </div>
  );
}

/**
 * Daraja shkalasi: sertifikatsiz (0 dan C gacha) va C … A+ pog'onalari,
 * kengligi xom ballga mutanosib. Marker — o'rtacha ball.
 */
function Shkala({ ball }: { ball?: number }) {
  const bolak = [
    { d: t("imtSertifikatsiz"), dan: 0, gacha: DARAJA_SHKALA[0]!.ball, rang: "bg-track" },
    ...DARAJA_SHKALA.map((x, i) => ({
      d: x.d, dan: x.ball, gacha: DARAJA_SHKALA[i + 1]?.ball ?? 100, rang: POGONA[i] ?? "bg-brand-blue",
    })),
  ];
  return (
    <div role="img" aria-label={ball === undefined ? undefined : t("imtShkalaAria", { b: ballYoz(ball) })}>
      <div className="relative flex h-3 gap-[2px]">
        {bolak.map((b) => (
          <span key={b.d} className={`h-full first:rounded-l-full last:rounded-r-full ${b.rang}`}
            style={{ width: `${b.gacha - b.dan}%` }} />
        ))}
        {ball !== undefined && (
          <span aria-hidden className="absolute -top-1 h-5 w-[3px] -translate-x-1/2 rounded-full bg-ink ring-2 ring-karta"
            style={{ left: `${Math.min(99.5, Math.max(0.5, ball))}%` }} />
        )}
      </div>
      <div className="mt-1.5 flex gap-[2px] text-[12px] font-semibold text-ink-dim">
        {bolak.map((b, i) => (
          <span key={b.d} style={{ width: `${b.gacha - b.dan}%` }}
            className={`overflow-visible whitespace-nowrap ${i === 0 ? "text-left" : "text-center"}`}>
            {b.d}
          </span>
        ))}
      </div>
    </div>
  );
}
