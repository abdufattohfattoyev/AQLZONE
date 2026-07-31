/**
 * "Darsni tashlab chiqasizmi?" — dars o'rtasida chiqishni tasdiqlash.
 *
 * NEGA KERAK. Dars natijasi FAQAT oxirida saqlanadi: to'rtta savolga
 * javob berib chiqib ketgan bola qaytganda noldan boshlaydi. Chiqish esa
 * bir bosishda bo'lardi va u tasodifan bosiladigan joyda turadi —
 * telefonda ekran chetidagi ishora, Telegram'da esa nativ orqaga tugmasi
 * sarlavhaning o'zida. Bir bosish bilan mehnat yo'qolsa, bola ilovaga
 * emas, o'ziga xafa bo'ladi.
 *
 * SO'ROV DOIM CHIQMAYDI. Hali bitta ham javob berilmagan bo'lsa
 * yo'qotadigan narsa yo'q va o'shanda savol berish — yo'lni to'sish.
 * Shartni chaqiruvchi (`screens/Lesson.tsx`) hal qiladi, bu komponent
 * faqat so'raydi.
 *
 * "Davom etaman" ATAYLAB birinchi va katta: tasodifan ochilgan oynadan
 * chiqishning eng oson yo'li — darsga qaytish bo'lishi kerak. Chiqish
 * tugmasi esa quyida, xira rangda; u ko'rinadi, lekin qo'l o'zi
 * bormaydi.
 */
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";

interface Props {
  /**
   * Shu darsda nechta savol YECHILGAN — yo'qoladigan mehnat.
   *
   * Nol ham bo'ladi: bola birinchi savolda xato qilgan bo'lsa, urinish
   * bor, yechilgan savol yo'q. O'shanda son yozilmaydi.
   */
  javob: number;
  onDavom: () => void;
  onChiq: () => void;
}

export function Chiqish({ javob, onDavom, onChiq }: Props) {
  return (
    <div
      className="az-kanal-fon fixed inset-0 z-[80] grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="az-chiqish-sarlavha"
      /* Fonga bosilsa DARSGA QAYTADI, chiqmaydi: e'tiborsiz bosish
         hech qachon yo'qotishga olib kelmasligi kerak. */
      onClick={onDavom}
    >
      <div
        className="az-kanal w-full max-w-[340px] rounded-clay bg-karta p-6 text-center shadow-clay"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-brand-orange text-white
                         shadow-[0_6px_0_var(--color-brand-orange-d)]">
          <Icon name="flame" size={26} />
        </span>

        <h2 id="az-chiqish-sarlavha" className="mt-4 font-display text-[19px] leading-tight">
          {t("chiqishSarlavha")}
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-snug text-ink-dim">
          {javob > 0 ? t("chiqishIzoh", { n: javob }) : t("chiqishIzohBosh")}
        </p>

        <button
          type="button"
          onClick={onDavom}
          autoFocus
          className="clay-press mt-5 h-[52px] w-full rounded-3xl bg-brand-green font-display text-[16px]
                     text-white shadow-[0_5px_0_var(--color-brand-green-d)]"
        >
          {t("chiqishDavom")}
        </button>

        <button
          type="button"
          onClick={onChiq}
          className="mt-3 w-full py-1.5 text-[13.5px] font-semibold text-ink-dim"
        >
          {t("chiqishHa")}
        </button>
      </div>
    </div>
  );
}
