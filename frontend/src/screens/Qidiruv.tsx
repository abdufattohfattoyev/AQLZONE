/**
 * QIDIRUV EKRANI — butun ilova bitta maydondan.
 *
 * ─────────────── NEGA ALOHIDA EKRAN ───────────────
 *
 * Qidiruvni bosh sahifaning ustiga qo'yish ham mumkin edi, lekin
 * unda natijalar kurslar ro'yxatini bosib turardi va telefonda
 * klaviatura ochilganda ekranda ikki-uch qator qolardi. Alohida
 * ekranda esa butun bo'sh joy natijalarga tegishli — qidirayotgan
 * odam boshqa hech narsani ko'rishni xohlamaydi.
 *
 * ─────────────── BO'SH MAYDONDA NIMA TURADI ───────────────
 *
 * Taklif so'zlari. Bu shunchaki bezak emas: qidiruv maydonini
 * ko'rgan odamning birinchi savoli — "bu yerda NIMANI qidirsam
 * bo'ladi?". Bo'sh ekran bu savolga javob bermaydi va ko'pchilik
 * shu yerda ortga qaytadi. Tayyor so'zlar esa javobning o'zi: ular
 * ilovada dars ham, formula ham, o'yin ham borligini bir qarashda
 * ko'rsatadi.
 *
 * ─────────────── QULFLANGAN DARS ───────────────
 *
 * Qidiruv qulfni OCHMAYDI. Topilgan dars hali ochilmagan bo'lsa,
 * uning manzili emas, KURS XARITASI ochiladi va natijada qulf
 * belgisi turadi.
 *
 * Sabab: dars manziliga o'tilsa, `App.tsx` uni baribir xaritaga
 * qaytaradi (`isUnlocked` tekshiruvi) — ya'ni odam bosadi, ekran
 * sakraydi va NEGA sakraganini hech kim aytmaydi. Qulf belgisi
 * esa buni oldindan aytadi: "bu bor, lekin oldingi darslardan
 * keyin".
 */
import { useDeferredValue, useMemo, useRef, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { indeks, qidir } from "../lib/qidiruv";
import type { Natija, Tur } from "../lib/qidiruv";
import type { Progress } from "../lib/types";
import type { Course } from "../lib/curriculum";
import { UNIT_COLORS, isUnlocked } from "../lib/types";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { yolKurs } from "../lib/yollar";

/** Bo'sh maydonda ko'rsatiladigan tayyor so'rovlar. */
const TAKLIF = ["kasrlar", "foiz", "Pifagor", "ko'paytirish", "sinus", "hosila"];

/** Turning ro'yxatdagi yorlig'i. */
const TUR_MATN: Record<Tur, () => string> = {
  dars: () => t("qidiruvDars"),
  bob: () => t("qidiruvBob"),
  kurs: () => t("qidiruvKurs"),
  formula: () => t("qidiruvFormula"),
  oyin: () => t("qidiruvOyin"),
  kichkintoy: () => t("qidiruvKichkintoy"),
  bolim: () => t("qidiruvBolim"),
};

interface Props {
  progressOf: (c: Course) => Progress;
  /** Natija bosilganda — manzil bilan. */
  onOch: (yol: string) => void;
  onBack: () => void;
}

export function Qidiruv({ progressOf, onOch, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);
  const [sorov, setSorov] = useState("");
  const maydon = useRef<HTMLInputElement>(null);

  /**
   * Yozilayotgan matn KECHIKTIRILADI.
   *
   * Har bosilgan harfda 915 ta yozuv ko'rib chiqiladi. Bu tez
   * (bir necha millisekund), lekin arzon telefonda tez yozayotgan
   * odamda harflar kechikib chiqa boshlaydi. `useDeferredValue`
   * bilan maydon darhol yangilanadi, ro'yxat esa ozgina orqada
   * keladi — ya'ni yozish HAR DOIM silliq qoladi.
   */
  const kechikkan = useDeferredValue(sorov);
  const natijalar = useMemo(() => qidir(kechikkan), [kechikkan]);

  const yozilgan = sorov.trim().length > 0;
  // Ro'yxat eskirganini bildiradi: natijalar hali oldingi so'rovniki.
  const kutilmoqda = sorov !== kechikkan;

  const bos = (n: Natija) => {
    tebrat("tanlov");
    onOch(manzil(n, progressOf));
  };

  const taklifBos = (s: string) => {
    setSorov(s);
    maydon.current?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-10">
      <div className="flex items-center gap-2.5">
        {!ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl bg-karta
                       text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}

        {/* Maydon sarlavhaning O'RNIDA turadi, ostida emas.
            Bu ekranning yagona ishi — qidirish, ya'ni "Qidiruv"
            degan sarlavha maydonning ustida turib, faqat joy
            egallardi va klaviatura ochilganda birinchi bo'lib
            ekrandan chiqib ketadigan qator bo'lardi. */}
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-clay bg-karta
                          px-3.5 py-2.5 shadow-clay-sm">
          <Icon name="search" size={17} className="shrink-0 text-ink-dim" />
          <input
            ref={maydon}
            type="search"
            // eslint-disable-next-line jsx-a11y/no-autofocus -- ekranning yagona ishi shu
            autoFocus
            value={sorov}
            onChange={(e) => setSorov(e.target.value)}
            placeholder={t("qidiruvJoy")}
            aria-label={t("qidiruvSarlavha")}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-dim"
          />
        </label>
      </div>

      {/* ---- bo'sh maydon: nima qidirish mumkinligi ---- */}
      {!yozilgan && (
        <div className="mt-6">
          {/* Son qo'lda yozilmaydi — indeksdan olinadi. Kurs dasturi
              o'sganda yozuv o'zi yangilanadi va hech qachon yolg'on
              gapirmaydi. */}
          <p className="text-center text-[13px] leading-snug text-ink-dim">
            {t("qidiruvIzoh", { n: indeks().length })}
          </p>
          <div className="mt-3.5 flex flex-wrap justify-center gap-2">
            {TAKLIF.map((s) => (
              <button key={s} type="button" onClick={() => taklifBos(s)}
                className="clay-press rounded-full bg-karta px-3.5 py-2 text-[13px]
                           text-ink-soft shadow-clay-sm">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- hech narsa topilmadi ---- */}
      {yozilgan && !kutilmoqda && natijalar.length === 0 && (
        <p className="mt-10 text-center text-[13.5px] leading-snug text-ink-dim">
          {t("qidiruvTopilmadi", { nima: sorov.trim() })}
        </p>
      )}

      {/* ---- natijalar ---- */}
      {yozilgan && natijalar.length > 0 && (
        <>
          <p className="mt-4 mb-2 ml-1 text-[11px] tracking-widest text-ink-soft uppercase">
            {t("qidiruvNatija", { n: natijalar.length })}
          </p>
          <div className={`space-y-2 transition-opacity ${kutilmoqda ? "opacity-60" : ""}`}>
            {natijalar.map((n) => (
              <Qator key={n.id} n={n} qulf={qulflangan(n, progressOf)} on={() => bos(n)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- yordamchi */

/** Dars qulflanganmi. Dars bo'lmagan yozuv hech qachon qulflanmaydi. */
function qulflangan(n: Natija, progressOf: (c: Course) => Progress): boolean {
  if (!n.joy) return false;
  const { kurs, ui, li } = n.joy;
  return !isUnlocked(kurs.units, progressOf(kurs), ui, li);
}

/** Bosilganda boriladigan manzil — qulflangan dars kurs xaritasiga olib boradi. */
function manzil(n: Natija, progressOf: (c: Course) => Progress): string {
  return qulflangan(n, progressOf) && n.joy ? yolKurs(n.joy.kurs) : n.yol;
}

function Qator({ n, qulf, on }: { n: Natija; qulf: boolean; on: () => void }) {
  const rang = UNIT_COLORS[n.rang];
  return (
    <button type="button" onClick={on}
      className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta p-3
                 text-left shadow-clay-sm">
      {/* Belgi kursning rangida — ro'yxatda ko'z rang bo'yicha ham
          yo'l topadi: geometriya darslari bir xil rangda turadi. */}
      <span className={`grid size-10 shrink-0 place-items-center rounded-2xl text-white ${rang.bg}`}>
        <Icon name={qulf ? "lock" : n.ic} size={18} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="min-w-0 truncate font-display text-[14.5px] leading-tight">
            {n.nom}
          </span>
          <span className="shrink-0 rounded-full bg-track px-1.5 py-0.5 text-[10px] text-ink-dim">
            {TUR_MATN[n.tur]()}
          </span>
          {/* Qulf QISQA yorliq bo'lib turadi, izohning o'rniga emas.
              Avval u "Hali ochilmagan — kurs xaritasi ochiladi" degan
              butun jumla edi va pastdagi qatorni egallardi. Natijada
              yangi hisobda deyarli hamma qator bir xil gapni takrorlab,
              eng kerakli ma'lumot — QAYSI SINF va QAYSI BOB — butunlay
              yo'qolgan edi. Qulf belgisi chapdagi doirada ham turibdi,
              ya'ni ikki marta aytilgan gapni qisqartirish hech narsani
              yashirmaydi. */}
          {qulf && (
            <span className="shrink-0 rounded-full bg-track px-1.5 py-0.5 text-[10px] text-ink-dim">
              {t("qidiruvQulf")}
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] leading-snug text-ink-dim">
          {n.izoh}
        </span>
      </span>

      <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
    </button>
  );
}
