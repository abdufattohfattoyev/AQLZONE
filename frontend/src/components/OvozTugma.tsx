/**
 * Ovozni yoqish/o'chirish — bitta yumaloq tugma.
 *
 * NEGA EKRANDA, SOZLAMALARDA EMAS. Ovozni o'chirish kerak bo'ladigan
 * payt har doim SHOSHILINCH: avtobusda, kutubxonada, uxlab yotgan
 * chaqaloq yonida. Sozlamalarga borish uchun esa uch bosish kerak va
 * shu vaqt ichida ilova "mashina!" deb baqirib turadi. Shuning uchun
 * tugma aynan ovoz chiqadigan ekranlarda, doim bir joyda turadi.
 *
 * Tanlov `localStorage` da saqlanadi (`lib/ovoz.ts`), ya'ni u butun
 * ilova bo'ylab bir xil — bu yerda o'chirilgan ovoz darsda ham jim
 * bo'ladi.
 *
 * O'chirilganda chiziq tortilgan karnay chiziladi. Rang bilan emas,
 * SHAKL bilan farqlanadi: rangni ko'rmaydigan odam ham holatni bir
 * qarashda tushunsin.
 */
import { useState } from "react";
import { Icon } from "../lib/icons";
import { ovozYoniqmi, ovozniYoq } from "../lib/ovoz";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";

export function OvozTugma({ className = "" }: { className?: string }) {
  // Sinxron o'qiladi: tugma ekran chizilishi bilan to'g'ri holatda
  // turishi kerak, keyinroq almashib ketmasligi.
  const [yoniq, setYoniq] = useState(ovozYoniqmi);

  const almashtir = () => {
    const yangi = !yoniq;
    ovozniYoq(yangi);
    setYoniq(yangi);
    tebrat("tanlov");
  };

  return (
    <button type="button" onClick={almashtir}
      title={yoniq ? t("ovozOchirish") : t("ovozYoqish")}
      aria-pressed={yoniq}
      className={`clay-press relative grid size-[38px] place-items-center rounded-full bg-karta
                  shadow-clay-sm ${yoniq ? "text-brand-green-d" : "text-ink-dim"} ${className}`}>
      <Icon name="ovoz" size={19} />
      {!yoniq && (
        /* Chiziq karnay ustidan o'tadi. `rotate-45` va aniq o'lcham —
           belgi 24×24 to'rda chizilgani uchun chiziq ham shu markazdan
           o'tishi kerak, aks holda u chetdan o'tib, "o'chiq" degan
           ma'noni bermaydi. */
        <span aria-hidden
          className="pointer-events-none absolute h-[2.4px] w-[22px] rotate-45 rounded-full
                     bg-current" />
      )}
    </button>
  );
}
