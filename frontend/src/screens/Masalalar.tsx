/**
 * MASALALAR RO'YXATI — foydalanuvchilar yozgan masalalar.
 *
 * ─────────────── NEGA TO'RTTA SARALASH ───────────────
 *
 * "Yangi" — bo'limning tirikligini ko'rsatadi va yangi muallifga
 * ko'rinish beradi: uning masalasi tasdiqlanishi bilan eng tepada
 * turadi.
 *
 * "Qiyin" — bo'limning eng qiziq ro'yxati. U LIKE bilan emas,
 * yechilganlar foizi bilan quriladi: yoqtirish masalaning
 * qiyinligi haqida hech narsa demaydi, "yuztadan o'n kishi yechdi"
 * esa aynan shuni aytadi.
 *
 * "Zo'r" va "Ko'p yechilgan" — odatiy ikki o'lchov.
 *
 * ─────────────── SINF FILTRI NEGA IXTIYORIY ───────────────
 *
 * Standart holda HAMMA sinf ko'rinadi. 5-sinf bolasi 7-sinf
 * masalasini ochib, yechib ham qo'yishi mumkin va uni oldindan
 * to'sishning ma'nosi yo'q — bu bo'lim dars emas, u yerda tartib
 * ham, qulf ham yo'q.
 */
import { useCallback, useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { MasalaKarta } from "../components/MasalaKarta";
import { SINFLAR } from "../lib/masalaSinf";
import * as MS from "../lib/masala";
import type { Masala, Tartib } from "../lib/masala";
import { tebrat, useOrqaga } from "../lib/qobiq";

const TARTIBLAR: { kod: Tartib; nom: () => string }[] = [
  { kod: "yangi", nom: () => t("masalaYangilar") },
  { kod: "qiyin", nom: () => t("masalaQiyinlar") },
  { kod: "zor", nom: () => t("masalaZorlar") },
  { kod: "koplik", nom: () => t("masalaKoplar") },
];

interface Props {
  onOch: (id: number) => void;
  onYangi: () => void;
  onMenikilar: () => void;
  onBack: () => void;
}

export function Masalalar({ onOch, onYangi, onMenikilar, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);
  const [tartib, setTartib] = useState<Tartib>("yangi");
  const [sinf, setSinf] = useState<number | null>(null);
  const [royxat, setRoyxat] = useState<Masala[]>([]);
  const [yana, setYana] = useState(false);
  const [sahifa, setSahifa] = useState(0);
  const [holat, setHolat] = useState<"yuklanmoqda" | "tayyor" | "xato">("yuklanmoqda");

  /**
   * Ro'yxatni oladi.
   *
   * `qoshimcha` — "yana" tugmasi bosilganda: natija ustiga
   * QO'SHILADI, almashtirilmaydi. Almashtirilsa, uzun ro'yxatni
   * ochgan odam har safar boshiga qaytib tushardi.
   */
  const yukla = useCallback(async (s: number, qoshimcha: boolean) => {
    if (!qoshimcha) setHolat("yuklanmoqda");
    try {
      const d = await MS.royxat(sinf, tartib, s);
      setRoyxat((eski) => (qoshimcha ? [...eski, ...d.masalalar] : d.masalalar));
      setYana(d.yana);
      setSahifa(s);
      setHolat("tayyor");
    } catch {
      // Bo'sh ekran o'rniga xato yozuvi: internetsiz ochgan odam
      // "bu yerda hech narsa yo'q ekan" deb chiqib ketmasin.
      if (!qoshimcha) setHolat("xato");
    }
  }, [sinf, tartib]);

  // Saralash yoki sinf o'zgarsa — birinchi sahifadan qaytadan.
  useEffect(() => { void yukla(0, false); }, [yukla]);

  const almashtir = (k: Tartib) => { tebrat("tanlov"); setTartib(k); };

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
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[18px] leading-tight">{t("masalalar")}</h1>
          <p className="text-[11.5px] leading-snug text-ink-dim">{t("masalalarIzoh")}</p>
        </div>
        <button type="button" onClick={onMenikilar} title={t("masalaMenikilar")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl
                     bg-karta text-ink-soft shadow-clay-sm">
          <Icon name="pencil" size={18} />
        </button>
      </div>

      {/* ---- yangi masala ----
          Ro'yxatning TEPASIDA turadi, pastida emas. Bo'lim
          foydalanuvchi yozgan masalalar ustiga quriladi va "yozish"
          uning asosiy amali: uni pastga qo'ysak, uzun ro'yxatni
          surib chiqqan odamgina ko'rardi. */}
      <button type="button" onClick={onYangi}
        className="tugma-3d az-yaltir mt-3.5 flex w-full items-center gap-3 rounded-clay
                   bg-brand-purple p-3.5 text-left text-white shadow-clay">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/25">
          <Icon name="plus" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] leading-tight">
            {t("masalaYoz")}
          </span>
          <span className="mt-0.5 block text-[11.5px] leading-snug text-white/90">
            {t("masalaYozIzoh")}
          </span>
        </span>
        <Icon name="chevron" size={18} className="shrink-0 text-white/85" />
      </button>

      {/* ---- saralash ---- */}
      <div className="mt-3.5 flex gap-1.5 overflow-x-auto pb-1
                      [-ms-overflow-style:none] [scrollbar-width:none]
                      [&::-webkit-scrollbar]:hidden">
        {TARTIBLAR.map((x) => (
          <button key={x.kod} type="button" onClick={() => almashtir(x.kod)}
            className={`clay-press shrink-0 rounded-full px-3.5 py-2 text-[12.5px] ${
              tartib === x.kod
                ? "bg-brand-purple text-white"
                : "bg-karta text-ink-soft shadow-clay-sm"}`}>
            {x.nom()}
          </button>
        ))}
      </div>

      {/* ---- sinf filtri ---- */}
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1
                      [-ms-overflow-style:none] [scrollbar-width:none]
                      [&::-webkit-scrollbar]:hidden">
        <Filtr faol={sinf === null} on={() => setSinf(null)}>{t("masalaHammaSinf")}</Filtr>
        {SINFLAR.map((s) => (
          <Filtr key={s.kod} faol={sinf === s.kod} on={() => setSinf(s.kod)}>
            {s.nom}
          </Filtr>
        ))}
      </div>

      {/* ---- ro'yxat ---- */}
      {holat === "yuklanmoqda" && (
        <p className="mt-10 text-center text-[13px] text-ink-dim">{t("yuklanyapti")}</p>
      )}
      {holat === "xato" && (
        <p className="mt-10 text-center text-[13px] text-ink-dim">{t("aloqaYoq")}</p>
      )}
      {holat === "tayyor" && royxat.length === 0 && (
        <p className="mt-10 text-center text-[13px] leading-snug text-ink-dim">
          {t("masalaBosh")}
        </p>
      )}

      <div className="mt-3 space-y-2.5">
        {royxat.map((m) => (
          <MasalaKarta key={m.id} m={m} on={() => onOch(m.id)} />
        ))}
      </div>

      {yana && (
        <button type="button" onClick={() => void yukla(sahifa + 1, true)}
          className="clay-press mt-3 w-full rounded-clay bg-karta py-3 text-[13px]
                     text-ink-soft shadow-clay-sm">
          {t("masalaYana")}
        </button>
      )}
    </div>
  );
}

function Filtr(
  { faol, on, children }: { faol: boolean; on: () => void; children: React.ReactNode },
) {
  return (
    <button type="button" onClick={on}
      className={`clay-press shrink-0 rounded-full px-3 py-1.5 text-[12px] ${
        faol ? "bg-brand-blue text-white" : "bg-karta text-ink-dim shadow-clay-sm"}`}>
      {children}
    </button>
  );
}
