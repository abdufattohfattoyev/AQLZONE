/**
 * Til almashtirgich — ikki bo'lakli kichik tugma: UZ | RU.
 *
 * Bosh sahifaning eng tepasida turadi. Nega aynan u yerda: noto'g'ri
 * tilda ochilgan ilovada odam boshqa hech narsani o'qiy olmaydi, ya'ni
 * bu tugma uning BIRINCHI ehtiyoji. Sozlamalar ichida qolsa, u o'zi
 * o'qiy olmaydigan ekran ortida yashiringan bo'lardi.
 *
 * Ko'rinishi ATAYLAB ikki bo'lakli (segment), oddiy tugma emas: ikkala
 * til bir vaqtda ko'rinib turadi va odam nima bosishini oldindan
 * biladi. Aylanadigan bitta tugma bo'lsa ("UZ" bosilsa "RU" ga
 * o'tadimi yoki hozir UZ ekanini bildiradimi?) — bu savol har safar
 * paydo bo'lardi.
 *
 * Faol bo'lak QAYTA BOSILSA hech narsa qilmaydi: `tilniQoy` o'zi
 * tekshiradi va bir xil tilda sahifani qayta yuklamaydi.
 */
import { TILLAR, til, tilniQoy } from "../lib/til";
import { t } from "../lib/matn";

export function TilTugma({ className = "" }: { className?: string }) {
  const joriy = til();

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full bg-karta/70 p-0.5
                  shadow-clay-sm backdrop-blur-sm ${className}`}
      role="group"
      aria-label={t("tilSarlavha")}
    >
      {TILLAR.map((x) => {
        const shu = x.kod === joriy;
        return (
          <button
            key={x.kod}
            type="button"
            onClick={() => tilniQoy(x.kod)}
            title={x.nom}
            aria-current={shu ? "true" : undefined}
            className={`clay-press rounded-full px-2.5 py-1 font-display text-[11.5px]
                        leading-none transition-colors ${
              shu ? "bg-brand-green text-white" : "text-ink-soft"
            }`}
          >
            {x.belgi}
          </button>
        );
      })}
    </div>
  );
}
