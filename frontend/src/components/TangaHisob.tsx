/**
 * Tanga hisobi — kichkina yorliq.
 *
 * ─────────────────── NEGA AYNAN SHU YERDA ───────────────────
 *
 * Masalalar bo'limi endi butunlay tanga ustiga qurilgan: kartada
 * "+10" turadi, yechimni ochish 15 turadi, sarflashdan oldin
 * "nechta qoladi" so'raladi. Bu sonlarning hammasi bitta narsaga —
 * HOZIR NECHTA BOR degan songa — nisbatan ma'noga ega. U ko'rinmasa
 * "+10" ham, "−15" ham shunchaki bezak bo'lib qoladi.
 *
 * ─────────────── XP, STREAK VA LIGA BU YERDA YO'Q ───────────────
 *
 * Ular boshqa ekranlarda o'z joyida turadi va bu yerga chiqarilsa,
 * to'rtta bir xil yorliq bo'lib, hech biri o'qilmasdi. Tepa qism
 * bir marta juda katta bo'lib ketgan va qaytadan yig'ilgan — unga
 * faqat SHU ekranda ishlaydigan son qo'shiladi.
 *
 * ─────────────── O'ZGARGANDA SESKANADI ───────────────
 *
 * Son o'zgarishi bilan bir marta kattalashib qaytadi. Uchayotgan
 * tanga (`TangaOqim`) va bu yerdagi sakrash birga "tanga MANA SHU
 * YERGA qo'shildi" degan bog'lanishni yasaydi — animatsiyaning
 * o'zi esa bu bog'lanishni bera olmaydi, chunki u ekran o'rtasida
 * uchadi.
 */
import { useEffect, useRef, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { useProgress } from "../lib/progress";

export function TangaHisob() {
  const { jamiTanga } = useProgress();
  const [sakra, setSakra] = useState(false);
  const oldingi = useRef(jamiTanga);

  useEffect(() => {
    if (oldingi.current === jamiTanga) return;
    oldingi.current = jamiTanga;
    setSakra(true);
    const soat = setTimeout(() => setSakra(false), 520);
    return () => clearTimeout(soat);
  }, [jamiTanga]);

  return (
    <span aria-label={t("menyuBallTanga")}
      className={`shadow-ichki flex shrink-0 items-center gap-1 rounded-full bg-sahna
                  px-2.5 py-1 text-[12.5px] leading-none text-brand-gold
                  ${sakra ? "az-tanga-sanoq" : ""}`}>
      <Icon name="coin" size={13} />
      <span className="font-display">{jamiTanga}</span>
    </span>
  );
}
