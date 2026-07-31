/**
 * O'yin ekranining UMUMIY qismi — ramka va yakun.
 *
 * Sakkizta o'yinning ichi boshqa-boshqa, tashqarisi esa bir xil
 * bo'lishi SHART: chiqish tugmasi, vaqt chizig'i va ball hisobi har
 * o'yinda aynan bir joyda turishi kerak. Bir o'yinda ball tepada, boshqa
 * o'yinda pastda bo'lsa, odam har safar ekranni qaytadan o'qib chiqadi.
 *
 * Shu sabab bu yerda ikki narsa turadi:
 *
 *   `OyinSahna`  o'ynash paytidagi ramka — sarlavha, vaqt, ball
 *   `Yakun`      o'yin tugagandagi ekran — natija, rekord, tanga
 *
 * O'yinning o'zi (savol, taxta, sonlar) ichkariga bola bo'lib kiradi.
 */
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "../../lib/icons";
import { Konfetti } from "../Konfetti";
import { UNIT_COLORS } from "../../lib/types";
import { t } from "../../lib/matn";
import { darajaMa } from "../../lib/oyin/tur";
import type { Daraja, Oyin } from "../../lib/oyin/tur";

/* ------------------------------------------------------------------ */
/*                              ramka                                 */
/* ------------------------------------------------------------------ */

interface SahnaProps {
  oyin: Oyin;
  daraja: Daraja;
  /** Chapdagi ✕. O'yin natijasi saqlanmasdan chiqiladi. */
  onChiq: () => void;
  /** O'ngdagi katta son — ball yoki pog'ona. */
  ball: number;
  /** Ball yonidagi kichik yozuv ("Ball" / "5-pog'ona"). */
  ballNomi: string;
  /**
   * Qolgan vaqt ulushi (1 → 0). Berilmasa vaqt chizig'i umuman
   * chizilmaydi — xotira o'yinida vaqt yo'q va bo'sh chiziq u yerda
   * "vaqt tugab qolgan" degan yolg'on taassurot qoldirardi.
   */
  qolgan?: number;
  /** Qolgan soniya — chiziq ustidagi raqam. */
  soniya?: number;
  /**
   * Ketma-ket to'g'ri javoblar soni. Uch va undan ko'p bo'lganda
   * ball yonida olov belgisi bilan ko'rinadi.
   */
  zanjir?: number;
  /**
   * Ball allaqachon eski rekorddan oshdimi.
   *
   * O'yin TUGAGANDA emas, AYNI PAYTDA ko'rsatiladi va farqi katta:
   * rekordini ortda qoldirganini bilgan odam oxirigacha o'ynaydi,
   * bilmagan esa "baribir chiqmaydi" deb qo'yib yuboradi.
   */
  rekordOshdi?: boolean;
  children: ReactNode;
}

/** Nechta ketma-ket javobdan keyin zanjir ko'rina boshlaydi. */
export const ZANJIR_KORIN = 3;

export function OyinSahna({
  oyin, daraja, onChiq, ball, ballNomi, qolgan, soniya,
  zanjir = 0, rekordOshdi = false, children,
}: SahnaProps) {
  const rang = UNIT_COLORS[oyin.rang];
  const d = darajaMa(daraja);

  // Oxirgi o'n soniya qizarib turadi. Raqamni o'qish uchun ekrandan ko'z
  // uzish kerak — rang esa chekka ko'rish bilan ham sezilади.
  const oz = typeof soniya === "number" && soniya <= 10;

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-6 sm:max-w-[560px]">
      {/* ---- tepa qatori ---- */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onChiq} title={t("yopish")}
          className="clay-press grid size-[38px] shrink-0 place-items-center rounded-full
                     bg-karta text-ink-soft shadow-clay-sm">
          <Icon name="times" size={18} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <div className="truncate font-display text-[15px] leading-tight">
            {t(oyin.nom)}
          </div>
          <div className="text-[11px] leading-tight text-ink-soft">{t(d.nom)}</div>
        </div>

        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-1.5">
            {/* Zanjir belgisi ball CHAPIDA turadi: ball o'ng chetda
                qotib turishi kerak, aks holda olov paydo bo'lganda
                butun son joyidan siljib, ko'z uni qaytadan izlardi. */}
            {zanjir >= ZANJIR_KORIN && (
              <span key={zanjir}
                className="az-xabar flex items-center gap-0.5 rounded-full bg-brand-orange/15
                           px-1.5 py-0.5 font-display text-[11px] leading-none text-brand-orange-d">
                🔥{zanjir}
              </span>
            )}
            <span className={`font-display text-[22px] leading-none
                              ${rekordOshdi ? "text-brand-gold" : rang.ring}`}>
              {ball}
            </span>
          </div>
          <div className="mt-0.5 text-[10px] leading-none text-ink-soft">
            {rekordOshdi ? "🏆" : ballNomi}
          </div>
        </div>
      </div>

      {/* ---- vaqt chizig'i ----
          Raqam EMAS, CHIZIQ asosiy: o'yin paytida odam raqamni o'qishga
          ulgurmaydi, qisqarib borayotgan chiziqni esa ko'rmasdan ham
          sezadi. Raqam yonida kichik bo'lib turadi — u "yana qancha
          bor?" degan savolga aniq javob beradi, lekin faqat so'ralganda. */}
      {typeof qolgan === "number" && (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-track">
            <div
              style={{ width: `${Math.max(0, Math.min(1, qolgan)) * 100}%` }}
              className={`h-full rounded-full transition-[width] duration-200 ease-linear
                          ${oz ? "bg-brand-red" : rang.bg}`}
            />
          </div>
          {typeof soniya === "number" && (
            <span className={`w-9 text-right font-display text-[13px] tabular-nums
                             ${oz ? "text-brand-red" : "text-ink-soft"}`}>
              {soniya}
            </span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                               yakun                                */
/* ------------------------------------------------------------------ */

interface YakunProps {
  oyin: Oyin;
  daraja: Daraja;
  ball: number;
  /** Shu o'yindagi eng yaxshi natija (yangisi hisobga olingan holda). */
  rekord: number;
  /** Aynan shu o'yinda rekord yangilandimi. */
  yangiRekord: boolean;
  tanga: number;
  /** Kunning birinchi o'yini bo'lgani uchun tanga ikkilanganmi. */
  bonus: boolean;
  onQayta: () => void;
  onDaraja: () => void;
  onOyinlar: () => void;
}

/**
 * O'yin tugagandagi ekran.
 *
 * Uch tugmaning TARTIBI ataylab: "Yana o'ynash" birinchi va katta.
 * O'yin tugagan payt — qaytadan boshlash uchun eng qulay lahza, va
 * o'sha lahzada odamdan "endi qayerga borasan?" deb so'rash uni
 * o'ylashga majbur qiladi. O'ylagan odam esa ko'pincha chiqib ketadi.
 */
export function Yakun({
  oyin, daraja, ball, rekord, yangiRekord, tanga, bonus,
  onQayta, onDaraja, onOyinlar,
}: YakunProps) {
  const rang = UNIT_COLORS[oyin.rang];

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-8 pb-10 text-center sm:max-w-[560px]">
      <div className="relative mx-auto w-fit">
        {/* Konfetti FAQAT rekordda. Har o'yinda otilsa, u "yaxshi
            natija" degan ma'nosini yo'qotib, shunchaki bezakka
            aylanardi. */}
        {yangiRekord && <Konfetti />}
        <span className={`grid size-20 place-items-center rounded-[26px] text-[38px]
                          ${yangiRekord ? rang.bg : "bg-karta"} shadow-clay`}>
          {yangiRekord ? "🏆" : oyin.emoji}
        </span>
      </div>

      <h1 className="mt-4 font-display text-[22px] leading-tight">
        {yangiRekord ? t("oyinYangiRekord") : t("oyinTugadi")}
      </h1>
      {/* O'yin va daraja nomi. Bu ekran "Yana o'ynash" bilan qayta-qayta
          ochiladi va o'nta o'yin ichida qaysi biri ekanini eslab qolish
          qiyin — ayniqsa natija "Boshqa daraja" dan keyin solishtirilsa. */}
      <p className="mt-1 text-[12px] text-ink-soft">
        {t(oyin.nom)} · {t(darajaMa(daraja).nom)}
      </p>

      <div className={`mt-1 font-display text-[56px] leading-none ${rang.ring}`}>{ball}</div>
      <p className="text-[12px] text-ink-soft">
        {oyin.tur === "xotira" ? t("xotiraNatija", { n: ball }) : t("oyinBall")}
      </p>

      {/* Rekordgacha qancha qolgani — yangi rekord bo'lmaganda.
          "Yaxshi harakat" degan quruq maqtovdan ko'ra ANIQ SON ko'proq
          ishlaydi: 2 ball qolgani ko'ringan odam yana bir marta
          o'ynaydi. */}
      {!yangiRekord && rekord > 0 && (
        <p className="mt-2 text-[13px] text-ink-soft">
          {ball >= rekord - 5 && ball < rekord
            ? t("oyinYaqin", { n: rekord - ball })
            : t("oyinOldingi", { n: rekord })}
        </p>
      )}

      {tanga > 0 && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-karta px-4 py-2 shadow-clay-sm">
          <Icon name="coin" size={18} className="text-brand-gold" />
          <span className="font-display text-[15px]">{t("oyinTanga", { n: tanga })}</span>
        </div>
      )}
      {/* Bonus yozuvi FAQAT tanga bilan birga chiqadi. Yolg'iz turganda
          u "ikki barobar" deb aytadi-yu, ekranda hech qanday tanga
          ko'rinmaydi — va bu va'da bajarilmagandek tuyuladi. */}
      {bonus && tanga > 0 && (
        <p className="mt-1.5 text-[11.5px] text-brand-gold">{t("oyinBonusIzoh")}</p>
      )}

      <div className="mt-7 space-y-2.5">
        <button type="button" onClick={onQayta}
          className={`tugma-3d az-yaltir w-full rounded-clay ${rang.bg} py-3.5
                      font-display text-[16px] text-white shadow-clay`}>
          {t("oyinQayta")}
        </button>
        <div className="flex gap-2.5">
          <button type="button" onClick={onDaraja}
            className="clay-press flex-1 rounded-clay bg-karta py-3 text-[13.5px]
                       text-ink-soft shadow-clay-sm">
            {t("oyinBoshqaDaraja")}
          </button>
          <button type="button" onClick={onOyinlar}
            className="clay-press flex-1 rounded-clay bg-karta py-3 text-[13.5px]
                       text-ink-soft shadow-clay-sm">
            {t("oyinlargaQaytish")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                          sanoq (3 · 2 · 1)                         */
/* ------------------------------------------------------------------ */

/**
 * O'yin boshlanishidagi uch soniyalik sanoq.
 *
 * NEGA KERAK. Vaqtli o'yinda soat ekran ochilishi bilan yurib ketsa,
 * birinchi savol odam telefonga qarab ulgurmasidan yo'qoladi — va
 * yo'qotilgan uch soniya butun natijaga ta'sir qiladi. Sanoq esa
 * "tayyorlan" degan aniq ishora beradi.
 *
 * Vaqtsiz o'yinlarda (xotira, 24) u chaqirilmaydi: u yerda shoshilish
 * yo'q va sanoq faqat yo'lni to'sardi.
 */
export function Sanoq({ onTugadi }: { onTugadi: () => void }) {
  const [n, setN] = useState(3);

  useEffect(() => {
    if (n === 0) { onTugadi(); return; }
    const id = setTimeout(() => setN((x) => x - 1), 700);
    return () => clearTimeout(id);
    // `onTugadi` bog'liqlikda emas: u har renderda yangi funksiya bo'lib
    // kelsa, taymer qayta-qayta o'rnatilib, sanoq joyida qotib qolardi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  return (
    <div className="grid flex-1 place-items-center">
      <span key={n} className="az-tab-sakra font-display text-[86px] leading-none text-ink">
        {n > 0 ? n : "!"}
      </span>
    </div>
  );
}
