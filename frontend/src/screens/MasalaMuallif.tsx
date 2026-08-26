/**
 * MUALLIF SAHIFASI — kim yozgan va yana nimalar yozgan.
 *
 * ─────────────────── NEGA KERAK ───────────────────
 *
 * Masalani o'qigan odamning keyingi savoli deyarli har doim bitta:
 * "buni kim yozdi?". Busiz har masala YAKKA qolardi — bo'lim
 * bir-biriga bog'lanmagan matnlar uyumiga o'xshab, hech kim
 * bo'limda "o'z odami" ni topa olmasdi.
 *
 * Bu sahifa esa muallifga O'QUVCHI beradi: uch yaxshi masala
 * yozgan odamning to'rtinchisi allaqachon kutiladi. Aynan shu
 * narsa odamni yana yozishga undaydi — tanga emas.
 *
 * ─────────────── FAQAT TASDIQLANGANLAR ───────────────
 *
 * Begona odam boshqa birovning navbatdagi yoki rad etilgan ishini
 * ko'rmaydi. O'z ro'yxatini esa muallif "Mening masalalarim"
 * ekranida to'liq ko'radi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { MasalaKarta } from "../components/MasalaKarta";
import * as MS from "../lib/masala";
import type { MuallifSahifa } from "../lib/masala";
import { useOrqaga } from "../lib/qobiq";

interface Props {
  profilId: number;
  onOch: (id: number) => void;
  onMenikilar: () => void;
  onBack: () => void;
}

export function MasalaMuallif({ profilId, onOch, onMenikilar, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);
  const [d, setD] = useState<MuallifSahifa | null>(null);
  const [xato, setXato] = useState(false);

  useEffect(() => {
    let bekor = false;
    setD(null); setXato(false);
    MS.muallifSahifasi(profilId)
      .then((x) => { if (!bekor) setD(x); })
      .catch(() => { if (!bekor) setXato(true); });
    return () => { bekor = true; };
  }, [profilId]);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-10">
      <div className="flex items-center gap-2.5">
        {!ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl
                       bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="font-display text-[17px]">{t("masalaMuallif")}</h1>
      </div>

      {xato && <p className="mt-10 text-center text-[13px] text-ink-dim">{t("aloqaYoq")}</p>}
      {!d && !xato && (
        <p className="mt-10 text-center text-[13px] text-ink-dim">{t("yuklanyapti")}</p>
      )}

      {d && (
        <>
          <div className="mt-3 rounded-clay bg-karta p-4 text-center shadow-clay-sm">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-track text-[26px]">
              {d.muallif.avatar || "🦊"}
            </span>
            <p className="mt-2 font-display text-[16px] leading-tight">{d.muallif.ism}</p>

            {/* Uch son — muallifning "hisob varaqasi". Ular ATAYLAB
                like'dan boshlanmaydi: eng qimmatlisi nechta odam
                uning masalasini YECHGANI, ya'ni nechta odamga
                foydasi tekkani. */}
            <div className="mt-3 flex justify-center gap-2">
              <Son n={d.jami.masalalar} nom={t("masalaSoni")} />
              <Son n={d.jami.yechilgan} nom={t("masalaYechilgan")} />
              <Son n={d.jami.like} nom="👍" />
            </div>

            {d.meniki && (
              <button type="button" onClick={onMenikilar}
                className="clay-press mt-3 w-full rounded-clay bg-track py-2.5 text-[13px]
                           text-ink-soft">
                {t("masalaMenikilar")}
              </button>
            )}
          </div>

          {d.masalalar.length === 0 ? (
            <p className="mt-8 text-center text-[13px] text-ink-dim">{t("masalaMuallifBosh")}</p>
          ) : (
            <div className="mt-3 space-y-2.5">
              {d.masalalar.map((m) => (
                <MasalaKarta key={m.id} m={m} muallifBilan={false} on={() => onOch(m.id)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Son({ n, nom }: { n: number; nom: string }) {
  return (
    <span className="min-w-[74px] rounded-2xl bg-track px-3 py-2">
      <span className="block font-display text-[17px] leading-none tabular-nums">{n}</span>
      <span className="mt-1 block text-[10.5px] leading-tight text-ink-dim">{nom}</span>
    </span>
  );
}
