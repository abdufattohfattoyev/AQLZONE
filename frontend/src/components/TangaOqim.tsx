/**
 * Tanga qo'shilganda va sarflanganda uchadigan animatsiya.
 *
 * ─────────────────── NEGA KERAK ───────────────────
 *
 * Tanga jimgina qo'shilib, jimgina kamayardi. Bola masalani yechardi,
 * biror joyda son o'zgarardi — lekin QANCHA olgani va nima uchun
 * olgani ekranda hech qachon ko'rinmasdi. Sarflaganda ham shunday:
 * yechim ochilardi, tanga kamayardi, bog'lanish esa faqat taxmin
 * bo'lib qolardi.
 *
 * Shu sababdan do'kondan 454 profildan atigi oltitasi biror narsa
 * sotib olgan: tanganing qiymati his qilinmasa, uni sarflashga ham
 * arzimaydi.
 *
 * ─────────────── YO'NALISH — YAGONA IZOH ───────────────
 *
 * Olingan tanga YUQORIGA ko'tariladi, sarflangani PASTGA tushadi.
 * Boshqa hech qanday yozuvsiz ham qaysi biri ekani tushuniladi;
 * rang ham, matn ham buni faqat kuchaytiradi.
 *
 * ─────────────── EKRANNI TO'SMAYDI ───────────────
 *
 * Qatlam `pointer-events: none` — animatsiya davomida ham ekranga
 * bosish mumkin. Bola javobni yozib bo'lib, darhol keyingi masalaga
 * o'tmoqchi bo'lsa, uni bir soniya kutib turishga majburlash —
 * mukofotni jazoga aylantirish bo'lardi.
 */
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Hajmli } from "../lib/hajmli";
import { t } from "../lib/matn";

interface Props {
  /** Nechta tanga — musbat son. Nol bo'lsa animatsiya chiqmaydi. */
  n: number;
  /** "keldi" — qo'shildi, "ketdi" — sarflandi. */
  yonalish: "keldi" | "ketdi";
  /** Animatsiya tugadi — ota-komponent holatni tozalaydi. */
  onTugadi?: () => void;
}

/** Nechta belgi uchadi. Sondan ko'p emas, lekin beshtadan oshmaydi. */
const ENG_KOP = 5;

/** Ikki tanga orasidagi kechikish (ms). */
const KECHIKISH = 90;

/** Animatsiya umumiy davomiyligi (ms) — CSS dagi 1.05s ga mos. */
const DAVOM = 1150;

export function TangaOqim({ n, yonalish, onTugadi }: Props) {
  const [korinsin, setKorinsin] = useState(true);

  const soni = Math.min(ENG_KOP, Math.max(1, n));

  useEffect(() => {
    setKorinsin(true);
    const oxiri = DAVOM + soni * KECHIKISH;
    const soat = setTimeout(() => {
      setKorinsin(false);
      onTugadi?.();
    }, oxiri);
    return () => clearTimeout(soat);
    // `onTugadi` ataylab bog'liqlikda yo'q: ota-komponent uni har
    // chizishda qaytadan yasasa, animatsiya cheksiz qayta boshlanardi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, yonalish, soni]);

  if (n <= 0 || !korinsin) return null;

  const keldi = yonalish === "keldi";
  return (
    <span aria-hidden
      className="pointer-events-none absolute inset-0 z-20 overflow-visible">
      {Array.from({ length: soni }, (_, i) => (
        <span key={i}
          className={`az-tanga ${keldi ? "az-tanga-keldi" : "az-tanga-ketdi"}
                      text-[22px] leading-none drop-shadow-sm`}
          style={{
            // Har biri biroz boshqa joydan uchadi — bir chiziqda
            // ketgan beshta belgi bitta qalin chiziqqa aylanardi.
            marginLeft: `${(i - (soni - 1) / 2) * 22}px`,
            "--az-kech": `${i * KECHIKISH}ms`,
          } as CSSProperties}>
          <Hajmli nom="tanga" olcham={20} />
        </span>
      ))}

      {/* Son — animatsiyaning markazida. U tanganing O'ZIDAN muhimroq:
          "+5" va "−15" bir qarashda o'qiladi, uchayotgan belgilarni
          esa sanab bo'lmaydi. */}
      <span
        className={`az-tanga ${keldi ? "az-tanga-keldi" : "az-tanga-ketdi"}
                    whitespace-nowrap rounded-full px-2.5 py-1 font-display text-[15px]
                    leading-none shadow-clay-sm ${keldi
                      ? "bg-brand-gold text-white"
                      : "bg-karta text-ink-soft"}`}
        style={{ "--az-kech": `${soni * KECHIKISH}ms`, marginTop: "-34px" } as CSSProperties}>
        {keldi ? `+${n}` : `−${n}`}
      </span>

      {/* Ekran o'qigich uchun — animatsiyani u ko'rmaydi. */}
      <span className="sr-only" role="status">
        {t(keldi ? "tangaQoshildi" : "tangaSarflandi", { n })}
      </span>
    </span>
  );
}
