/**
 * Yorug'lik almashtirgich — uch bo'lakli kichik tugma: telefon | quyosh | oy.
 *
 * ─────────────────── NEGA EKRANNING TEPASIDA ───────────────────
 *
 * Tanlovning o'zi ilgari ham bor edi, lekin faqat Sozlamalar ichida.
 * Odam qora rejimni xohlaganda esa u aynan SHU DAQIQADA xohlaydi —
 * kechqurun, ko'zi qamashganda. Uch bosish naridagi sozlama bunday
 * paytda topilmaydi: ko'pchilik uni umuman yo'q deb o'ylaydi.
 *
 * Til tugmasining yonida turadi va bu tasodif emas: ikkalasi ham
 * ILOVANI EMAS, ko'rinishni boshqaradi va ikkalasi ham darsdan oldin,
 * "o'zim uchun sozlab olay" paytida bosiladi.
 *
 * ─────────────────── NEGA AYLANADIGAN BITTA TUGMA EMAS ───────────────────
 *
 * Ko'rinishi ataylab til tugmasi bilan bir xil (segment): hamma
 * variant bir vaqtda ko'rinib turadi va odam nima bosishini oldindan
 * biladi. Bitta aylanadigan tugmada esa quyosh belgisi ikki xil
 * o'qiladi — "hozir yorug'" degani-mi yoki "bossam yorug' bo'ladi"-mi?
 * Bu savol har safar tug'ilardi, ayniqsa uchta holat bo'lganda.
 *
 * ─────────────────── UCHINCHI BO'LAK ───────────────────
 *
 * "Avto" (telefon belgisi) qoldirilgan, garchi u eng kam bosiladigan
 * bo'lak bo'lsa ham. Sababi: uni olib tashlasak, bir marta "oq" ni
 * bosgan odam tizim sozlamasiga QAYTA OLMAY qolardi — ilova endi
 * telefon tunga o'tganini umrbod sezmasdi va buni orqaga qaytarish
 * yo'li faqat brauzer xotirasini tozalash bo'lardi.
 *
 * Tanlov `lib/yoruglik.ts` da saqlanadi va `azapp_` prefiksi tufayli
 * server orqali qurilmalar orasida ko'chadi.
 */
import { useSyncExternalStore } from "react";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { obuna, yoruglikniOqi, yoruglikniQoy } from "../lib/yoruglik";
import type { Yoruglik } from "../lib/yoruglik";
import { tebrat } from "../lib/qobiq";

/**
 * Joriy tanlovni beradi va u o'zgarganda qayta chizadi.
 *
 * Ikkita tanlagich bir vaqtda ekranda bo'lishi mumkin (menyudagisi va
 * Sozlamalardagisi) — obuna busiz ular bir-biridan xabarsiz qolardi.
 */
export function useYoruglik(): Yoruglik {
  return useSyncExternalStore(obuna, yoruglikniOqi, () => "avto" as const);
}

const BOLAKLAR: { kod: Yoruglik; ikon: IconName; kalit: Kalit }[] = [
  { kod: "avto", ikon: "phone", kalit: "yoruglikAvto" },
  { kod: "oq", ikon: "quyosh", kalit: "yoruglikOq" },
  { kod: "qora", ikon: "oy", kalit: "yoruglikQora" },
];

export function YoruglikTugma({ className = "" }: { className?: string }) {
  const joriy = useYoruglik();

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full bg-karta/70 p-0.5
                  shadow-clay-sm backdrop-blur-sm ${className}`}
      role="group"
      aria-label={t("yoruglikSarlavha")}
    >
      {BOLAKLAR.map((x) => {
        const shu = x.kod === joriy;
        const nom = t(x.kalit);
        return (
          <button
            key={x.kod}
            type="button"
            /* Faol bo'lak qayta bosilsa hech narsa o'zgarmaydi —
               `yoruglikniQoy` bir xil qiymatni qayta yozadi, xolos.
               Tebranish esa baribir beriladi: bosish sezilishi kerak. */
            onClick={() => { yoruglikniQoy(x.kod); tebrat("tanlov"); }}
            title={nom}
            aria-label={nom}
            aria-current={shu ? "true" : undefined}
            className={`clay-press grid size-[26px] place-items-center rounded-full
                        transition-colors ${
              shu ? "bg-brand-green text-white" : "text-ink-soft"
            }`}
          >
            <Icon name={x.ikon} size={14} />
          </button>
        );
      })}
    </div>
  );
}
