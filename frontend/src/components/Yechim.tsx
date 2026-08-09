/**
 * QADAM-BAQADAM YECHIM — xato qilingan savolda ochiladi.
 *
 * ─────────────────── NEGA KERAK ───────────────────
 *
 * Ilgari xato javobdan keyin ilova qizil xabar chiqarardi va 900 ms dan
 * so'ng yana urinishga ruxsat berardi. Quyi sinflarda bu YETARLI:
 * variant to'rtta, bola qolgan uchtasidan to'g'risini SANAB topadi va
 * ikkinchi urinishning o'zi mashq bo'ladi.
 *
 * Yuqori sinfda esa yo'q. Kvadrat tenglamani taxmin bilan yechib
 * bo'lmaydi: o'quvchi adashadi, sababini bilmaydi, yana taxmin qiladi va
 * ilovani yopadi. Unga kerak bo'lgan narsa javob emas — QAYSI QADAMDA
 * adashgani.
 *
 * ─────────────────── QACHON OCHILADI ───────────────────
 *
 * Birinchi xatoda O'ZI ochilmaydi, faqat tugmasi paydo bo'ladi. Sabab:
 * darhol ochilsa, ikkinchi urinish ma'nosini yo'qotadi — o'quvchi o'ylab
 * ko'rish o'rniga javobni o'qib oladi va bu o'rganish emas, ko'chirish
 * bo'ladi.
 *
 * IKKINCHI xatoda esa o'zi ochiladi. Bu yerda o'quvchi allaqachon
 * qotib qolgan: uchinchi taxmin unga hech narsa o'rgatmaydi, faqat
 * "men bu fanni bilmayman" degan xulosani mustahkamlaydi.
 *
 * ─────────────────── JAVOB OSHKOR BO'LSA ───────────────────
 *
 * Yechim javobni ko'rsatadi va bu ATAYLAB: qadamlarni oxirigacha
 * yozib, javobni yashirish — o'quvchini yana taxminga qaytarish
 * bo'lardi. Ball tarafidan xavf yo'q: bu savol allaqachon "xato" deb
 * yozilgan (`Lesson.tsx` faqat BIRINCHI urinishni hisoblaydi), ya'ni
 * yechimni ochib to'g'ri javob bosgan odam hech narsa yutmaydi.
 */
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { yo } from "../lib/tarjima/yechim";
import type { Qadam } from "../lib/activity";

export function Yechim({ qadamlar, javob, onYop }: {
  qadamlar: Qadam[];
  /** To'g'ri javob — oxirgi qator sifatida ajratib ko'rsatiladi. */
  javob: string;
  onYop: () => void;
}) {
  return (
    <div
      className="az-kanal-fon fixed inset-0 z-[80] flex items-end justify-center bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="az-yechim-sarlavha"
      onClick={onYop}
    >
      {/* Pastdan chiqadi, markazda emas: yechim uzun bo'lishi mumkin va
          pastdagi varaq telefonda tabiiy — barmoq allaqachon shu yerda
          turadi. Balandligi cheklangan va ichi aylanadi, aks holda
          olti qadamli yechim kichik ekranda tugmasini chiqarib
          yuborardi. */}
      <div
        className="az-varaq flex max-h-[82vh] w-full max-w-[430px] flex-col rounded-t-[28px]
                   bg-karta px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] shadow-clay"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tortish dastagi — varaqning pastdan chiqishini ko'z bilan
            tasdiqlaydi. Bosilmaydi, faqat shakl. */}
        <span aria-hidden="true" className="mx-auto h-1 w-10 shrink-0 rounded-full bg-track" />

        <div className="mt-3 flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-2xl bg-brand-blue/15 text-brand-blue">
            <Icon name="puzzle" size={18} />
          </span>
          <h2 id="az-yechim-sarlavha" className="flex-1 font-display text-[16px] leading-tight">
            {t("yechimSarlavha")}
          </h2>
          <button type="button" onClick={onYop} title={t("yop")}
            className="clay-press grid size-9 place-items-center rounded-2xl bg-track text-ink-soft">
            <Icon name="close" size={16} />
          </button>
        </div>

        <ol className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pb-2">
          {qadamlar.map((k, i) => (
            <li key={i} className="flex gap-2.5">
              {/* Qadam raqami. Yechimning uzunligi ko'rinib tursin:
                  o'quvchi "yana uchta qadam bor" deb biladi va o'qishni
                  yarmida tashlamaydi. */}
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-track
                               font-display text-[11.5px] text-ink-soft">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] leading-snug text-ink-dim">{yo(k.q)}</div>
                {/* Ifoda kattaroq va qalinroq: o'quvchining ko'zi aynan
                    shu qatorlar bo'ylab yuguradi, izoh esa faqat
                    kerak bo'lganda o'qiladi. */}
                {k.if && (
                  <div className="mt-0.5 font-display text-[15px] leading-snug break-words">
                    {k.if}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        {/* Javob ro'yxatdan TASHQARIDA va yashil: qadamlar orasida
            yo'qolib ketmasin. O'quvchi yechimni yopgach, ekranga
            qaytganda aynan shu qiymatni bosishi kerak. */}
        <div className="mt-1 flex shrink-0 items-center gap-2 rounded-2xl bg-brand-green/15 px-3.5 py-2.5">
          <Icon name="check" size={17} className="shrink-0 text-brand-green-d" />
          <span className="text-[12.5px] text-ink-dim">{t("yechimJavob")}</span>
          <span className="ml-auto min-w-0 truncate font-display text-[16px] text-brand-green-d">{javob}</span>
        </div>

        <button type="button" onClick={onYop}
          className="clay-press mt-3 h-12 w-full shrink-0 rounded-3xl bg-brand-green font-display
                     text-[15.5px] text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
          {t("yechimTushundim")}
        </button>
      </div>
    </div>
  );
}
