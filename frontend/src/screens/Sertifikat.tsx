/**
 * MILLIY SERTIFIKAT — variantlar ro'yxati.
 *
 * `screens/Imtihon.tsx` (DTM) bilan bir qolipda: tepada holat, ostida
 * variantlar. Ikki farqi bor va ikkalasi ham imtihonning o'zidan kelib
 * chiqadi (`lib/sertifikat.ts`):
 *
 *   BALL, FOIZ EMAS    sertifikatda natija 100 ballik va savollarning
 *                      "og'irligi" har xil — foiz odamga hech narsa
 *                      aytmaydi, "67,4 ball · B+" esa aytadi.
 *   DAVOM ETISH        variant uch soatlik va uni bo'lib ishlash mumkin:
 *                      yarim qolgani eng tepada, alohida kartada.
 */
import { useState } from "react";
import { Icon } from "../lib/icons";
import { Reveal } from "../components/Reveal";
import { ImtihonTur } from "../components/ImtihonTur";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";
import {
  DAQIQA, TUZILISH, VARIANTLAR, daraja, engYaxshi, joriyniOqi, natijalar, ortacha,
} from "../lib/sertifikat";

const SAVOL_SONI = TUZILISH.y1 + TUZILISH.y2 + TUZILISH.o;

/** "67,4" — o'zbek va rus yozuvida kasr vergul bilan. */
const ballYoz = (b: number) => String(b).replace(".", ",");

export function Sertifikat({ onVariant, onDtm, onChiq }: {
  onVariant: (n: number) => void;
  onDtm: () => void;
  onChiq: () => void;
}) {
  useOrqaga(onChiq);
  // Bir marta o'qiladi: ekran ochiq turganda variant o'zgarmaydi.
  const [joriy] = useState(joriyniOqi);
  const o = ortacha();
  const d = o ? daraja(o.ball) : null;
  const oxirgilar = natijalar().slice(0, 3);

  const qoldi = joriy ? Math.max(0, Math.ceil((joriy.tugash - Date.now()) / 60_000)) : 0;
  const berilgan = joriy ? joriy.javoblar.filter((x) => x !== null).length : 0;

  return (
    <div className="mx-auto w-full max-w-[430px] px-3.5 pt-4 pb-10 sm:max-w-[700px] sm:px-6">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onChiq} title={t("ortga")}
          className="clay-press grid size-10 shrink-0 place-items-center rounded-full bg-karta
                     text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
        <div className="min-w-0">
          <h1 className="font-display text-[19px] leading-tight">{t("sertTitul")}</h1>
          <p className="text-[12px] leading-snug text-ink-soft">
            {t("sertIzoh", { savol: SAVOL_SONI, soat: DAQIQA / 60, ball: 100 })}
          </p>
        </div>
      </div>

      <ImtihonTur joriy="sertifikat" onTanla={onDtm} />

      {/* ---- yarim qolgan variant ---- */}
      {joriy && (
        <button type="button" onClick={() => onVariant(joriy.n)}
          data-tahlil="Sertifikat: davom etish"
          className="az-kirish tugma-3d mt-4 flex w-full items-center gap-3 rounded-clay bg-brand-green p-4
                     text-left text-white shadow-clay">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/25">
            <Icon name="clock" size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[17px] leading-tight">{t("sertDavom")}</span>
            <span className="mt-0.5 block truncate text-[12.5px] leading-snug text-white/90">
              {qoldi > 0
                ? t("sertDavomIzoh", { v: t("imtihonVariant", { n: joriy.n }), a: berilgan, b: SAVOL_SONI, m: qoldi })
                : t("sertDavomTugagan", { v: t("imtihonVariant", { n: joriy.n }) })}
            </span>
          </span>
          <Icon name="chevron" size={20} className="shrink-0 text-white/90" />
        </button>
      )}

      {/* ---- holat ---- */}
      <Reveal kech={60}>
        <div className="az-kirish mt-4 rounded-clay bg-karta p-4 text-center shadow-clay-sm">
          {o ? (
            <>
              <div className="font-display text-[34px] leading-none text-brand-blue">
                {ballYoz(o.ball)}
                <span className="ml-1 text-[15px] text-ink-soft">{t("sertBallDan")}</span>
              </div>
              <div className="mt-1.5 font-display text-[14px]">
                {d ? t("sertDaraja", { d }) : t("sertDarajaYoq")}
              </div>
              <div className="mt-0.5 text-[12.5px] text-ink-soft">{t("imtihonDaraja", { n: o.urinish })}</div>
            </>
          ) : (
            <>
              <div className="font-display text-[17px] leading-tight">{t("imtihonBoshlang")}</div>
              <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{t("sertBoshlangIzoh")}</p>
            </>
          )}
        </div>
      </Reveal>

      {/* ---- variantlar ---- */}
      <h2 className="az-kirish mt-5 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("imtihonVariantlar")}
      </h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {Array.from({ length: VARIANTLAR }, (_, i) => i + 1).map((n) => {
          const eng = engYaxshi(n);
          const dr = eng ? daraja(eng.ball) : null;
          return (
            <button key={n} type="button" onClick={() => onVariant(n)}
              data-tahlil={`Sertifikat: ${n}-variant`}
              className="clay-press flex items-center gap-3 rounded-clay bg-karta p-3 text-left shadow-clay-sm">
              <span className={`grid size-10 shrink-0 place-items-center rounded-2xl font-display
                                text-[15px] ${eng ? "bg-brand-green/15 text-brand-green" : "bg-sahna text-ink-soft"}`}>
                {n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[13.5px] leading-tight">
                  {t("imtihonVariant", { n })}
                </span>
                <span className="mt-0.5 block truncate text-[11.5px] leading-snug text-ink-soft">
                  {eng
                    ? `${t("sertBallQisqa", { b: ballYoz(eng.ball) })}${dr ? ` · ${dr}` : ""}`
                    : t("imtihonIshlanmagan")}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- oxirgi urinishlar ---- */}
      {oxirgilar.length > 0 && (
        <>
          <h2 className="az-kirish mt-6 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
            {t("imtihonOxirgilar")}
          </h2>
          <ol className="grid gap-1.5">
            {oxirgilar.map((x, i) => (
              <li key={`${x.variant}-${x.vaqt}-${i}`}
                className="flex items-center gap-2 rounded-clay bg-karta px-3 py-2 text-[13px] shadow-clay-sm">
                <span className="min-w-0 flex-1 truncate">{t("imtihonVariant", { n: x.variant })}</span>
                <span className="shrink-0 font-display text-ink-soft">
                  {t("sertBallQisqa", { b: ballYoz(x.ball) })} · {Math.round(x.sekund / 60)} {t("daqiqaQisqa")}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}

      <p className="az-kirish mt-5 text-center text-[11.5px] leading-snug text-ink-soft/80">
        {t("sertPastIzoh")}
      </p>
    </div>
  );
}
