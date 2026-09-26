/**
 * O'QISH › TESTLAR (`manba/Testlar.dc.html`).
 *
 * Mavjud test ekranlarini O'RAYDI, yangi test yozmaydi:
 *
 *   tavsiya kartasi       sinfning to'liq blok testi → `Testlar` ekrani
 *                         (`/kurs/:slug/testlar?boshla=toliq`) — u yerda
 *                         odatdagi tasdiq oynasi chiqadi
 *   Milliy sertifikat     `/imtihon` → oxirgi tanlangan tur (DTM yoki
 *   va DTM                sertifikat, `lib/imtihonTur.ts`)
 *   Mavzu bo'yicha test   o'sha `Testlar` ekrani: boblar ro'yxati
 *   Test to'plamlari      eski `/testlar` ekrani (`/testlar/toplamlar`)
 *   Sessiya               faqat talabaga (`yol === "oliy"`)
 *
 * Blok testlar 5-sinfdan boshlanadi (`lib/blok.ts` → blokBormi). Quyi
 * sinfda tavsiya kartasi o'rniga qisqa izoh turadi.
 */
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import type { Course } from "../lib/curriculum";
import { OLCHAM, blokBormi, sinfKurslari, sinfOf } from "../lib/blok";
import { daraja as sertDaraja, ortacha as sertOrtacha } from "../lib/sertifikat";
import { daraja as dtmDaraja } from "../lib/imtihon";
import { oxirgiTur } from "../lib/imtihonTur";
import { useProfil, yolOf } from "../lib/profil";
import { kursMatn } from "../lib/tarjima/kurs";

interface Props {
  kurs: Course;
  /** Sinfning test ekrani; `toliq` — to'liq blok test tasdig'i bilan ochiladi. */
  onBlok: (boshla?: "toliq") => void;
  onImtihon: () => void;
  onToplamlar: () => void;
  onSessiya: () => void;
}

export function OqishTestlar({ kurs, onBlok, onImtihon, onToplamlar, onSessiya }: Props) {
  const talaba = yolOf(useProfil()) === "oliy";
  const sinf = sinfOf(kurs.grade);
  const blok = blokBormi(sinf);
  const ikkiFan = sinfKurslari(sinf).length > 1;

  // Imtihon natijasi — oxirgi tanlangan tur bo'yicha: sertifikatda harf
  // (oltin — mukofot), DTMda foiz (yashil — to'g'ri javoblar ulushi).
  const sert = sertOrtacha();
  const dtm = dtmDaraja();
  const imtihon = oxirgiTur() === "sertifikat"
    ? (sert && sertDaraja(sert.ball) ? { matn: sertDaraja(sert.ball)!, rang: "text-brand-gold-d" } : null)
    : (dtm ? { matn: `${dtm.foiz}%`, rang: "text-brand-green-d" } : null);

  return (
    <>
      {blok ? (
        <div className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:p-[18px]">
          <div className="flex items-center gap-3">
            <img src="/belgi/chart.webp" alt="" width={44} height={44} className="size-11 shrink-0" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-display text-[19px] leading-tight font-bold">{t("oqishBlokTest", { n: sinf })}</span>
              <span className="text-[14px] text-ink-dim">
                {t("oqishAralash", { fan: ikkiFan ? t("oqishIkkiFan") : kursMatn(kurs.title) })}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-track px-3 py-1 text-[14px] font-semibold text-ink-soft">
              {t("oqishSavol", { n: OLCHAM.toliq.savol })}
            </span>
            <span className="rounded-full bg-track px-3 py-1 text-[14px] font-semibold text-ink-soft">
              {t("oqishDaqiqa", { n: OLCHAM.toliq.daqiqa })}
            </span>
          </div>
          <button type="button" onClick={() => onBlok("toliq")} data-tahlil="Testlar: blok testni boshlash"
            className="tugma-3d min-h-[52px] rounded-2xl bg-brand-blue font-display text-[18px] font-bold text-white
                       shadow-[0_4px_0_var(--color-brand-blue-d)]">
            {t("oqishTestBoshlash")}
          </button>
        </div>
      ) : !talaba && (
        <p className="rounded-clay bg-karta p-4 text-[14.5px] leading-snug text-ink-soft shadow-clay-sm">
          {t("oqishQuyiSinf")}
        </p>
      )}

      <h2 className="mt-1 font-display text-[20px]">{t("oqishBoshqaTestlar")}</h2>
      <div className="flex flex-col gap-3">
        {talaba && (
          <Qator ic="chaqmoq" nom={t("sessiya")} izoh={t("menyuSessiyaIzoh")} on={onSessiya}
            tahlil="Testlar: sessiya" />
        )}
        <Qator ic="miya" nom={t("oqishImtihon")} izoh={t("oqishImtihonIzoh")} on={onImtihon}
          natija={imtihon?.matn} rang={imtihon?.rang} tahlil="Testlar: imtihon" />
        {blok && (
          <Qator ic="savol" nom={t("oqishMavzu")} izoh={t("oqishMavzuIzoh")} on={() => onBlok()}
            tahlil="Testlar: mavzu" />
        )}
        <Qator ic="xarita" nom={t("oqishToplamlar")} izoh={t("oqishToplamlarIzoh")} on={onToplamlar}
          tahlil="Testlar: to'plamlar" />
      </div>
    </>
  );
}

function Qator({ ic, nom, izoh, natija, rang = "", on, tahlil }: {
  ic: string; nom: string; izoh: string; natija?: string; rang?: string; on: () => void; tahlil: string;
}) {
  return (
    <button type="button" onClick={on} data-tahlil={tahlil}
      className="clay-press flex min-h-[60px] w-full items-center gap-3 rounded-[18px] bg-karta px-3.5 py-2.5
                 text-left shadow-clay-sm">
      <img src={`/belgi/${ic}.webp`} alt="" width={32} height={32} className="size-8 shrink-0 object-contain" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[16px] leading-tight font-bold">{nom}</span>
        <span className="text-[13px] leading-snug text-ink-dim">{izoh}</span>
      </span>
      {natija
        ? <span className={`shrink-0 text-[14px] font-bold ${rang}`}>{natija}</span>
        : <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />}
    </button>
  );
}
