/**
 * Botdagi chaqiruv havolasidan kelgan odamni o'z ekraniga olib boradi.
 *
 * `t.me/<bot>?startapp=<kod>` bosilganda Telegram Mini App'ni O'ZIDA
 * ochadi va kodni `start_param` bo'lib uzatadi. Ilova esa oddiy bosh
 * sahifada ochiladi — ya'ni bu qismsiz odam chaqiruvni ko'rmasdi.
 *
 * ──────────── NEGA `Tanishuv` DAN TASHQARIDA ────────────
 *
 * Ilgari bu qism `App` ichida edi va aynan shu sabab ishlamasdi:
 * `Tanishuv` til tanlanmagan (yoki ism so'ralayotgan) paytda `App` ni
 * UMUMAN chizmaydi — ya'ni chaqiruv havolasi bilan kelgan YANGI odamda
 * kod hech qachon o'qilmasdi va u tilni tanlagach bosh sahifada qolib
 * ketardi. Aynan yangi odam esa chaqiruvni eng ko'p oladigan odam.
 *
 * Endi u eng tashqarida turadi: manzil darhol almashadi, tanishuv
 * ekranlari esa ustidan o'z ishini qilaveradi va tugagach odam to'g'ri
 * duel ekranida bo'ladi.
 *
 * ──────────── BIR KOD — BIR MARTA ────────────
 *
 * Telegram `start_param` ni SESSIYADA saqlab qo'yadi: ilova o'sha
 * suhbatda qayta ochilganda u yana o'sha kodni beradi. Belgisiz odam
 * bir marta chaqiruvni ochib, keyin ilovaga har kirganda o'sha eski
 * duelga qaytarilaverardi. Shuning uchun ishlatilgan kod
 * `sessionStorage` ga yoziladi va ikkinchi marta e'tiborsiz qoladi.
 *
 * ──────────── UCH XIL HAVOLA ────────────
 *
 * `masala_12`  — ulashilgan masala (`lib/ulash.ts`)
 * `masalalar`  — kanal postidagi «Boshqa masalalar» tugmasi
 * boshqasi     — duel chaqiruvi, ya'ni eski xatti-harakat
 *
 * Belgi ATAYLAB `_` bilan: duel kodlari faqat harf va raqamdan
 * iborat, ya'ni ikkalasi hech qachon adashmaydi. Eski havolalar
 * odamlarning suhbatlarida qolgan va ular avvalgidek ishlashi
 * shart.
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { boshParametri } from "../lib/qobiq";
import { MASALA_BOSH, ROYXAT_PARAM } from "../lib/ulash";
import { yolDuelKod, yolMasala, yolMasalalar } from "../lib/yollar";

/** Ishlatilgan kod shu yerda qoladi — sessiya davomida. */
const KALIT = "az_duel_kod";

/**
 * Kod qaysi ekranga olib borishini aniqlaydi.
 *
 * Masala raqami tekshiriladi: `masala_abc` yoki `masala_` kabi
 * qiymat kelsa, manzilga qo'shilmaydi va odam oddiy duel yo'liga
 * tushmaydi — bunday kod umuman e'tiborsiz qoladi.
 */
function manzil(kod: string): string | null {
  if (kod === ROYXAT_PARAM) return yolMasalalar();
  if (kod.startsWith(MASALA_BOSH)) {
    const raqam = Number(kod.slice(MASALA_BOSH.length));
    return Number.isInteger(raqam) && raqam > 0 ? yolMasala(raqam) : null;
  }
  return yolDuelKod(kod);
}

export function BotdanKelgan() {
  const nav = useNavigate();
  const otdi = useRef(false);

  useEffect(() => {
    const urin = () => {
      if (otdi.current) return true;
      const kod = boshParametri();
      if (!kod) return false;

      const yol = manzil(kod);
      // Tanib bo'lmaydigan kod: o'qildi deb belgilanadi va tashlanadi.
      // Aks holda har 300 millisekundda qayta tekshirilaverardi.
      otdi.current = true;
      if (!yol) return true;

      try {
        if (sessionStorage.getItem(KALIT) === kod) return true;   // allaqachon ochilgan
        sessionStorage.setItem(KALIT, kod);
      } catch {
        /* xotira yopiq — u holda oddiygina o'tamiz */
      }
      nav(yol, { replace: true });
      return true;
    };

    if (urin()) return;

    // Telegram skripti KECHIKIB yuklanishi mumkin va o'sha paytda
    // `initData` hali bo'sh bo'ladi. Bir marta o'qib qo'ysak, sekin
    // internetda chaqiruv jimgina bosh sahifada ochilib qolardi —
    // shuning uchun uch soniya davomida qayta tekshiriladi.
    const id = setInterval(() => { if (urin()) clearInterval(id); }, 300);
    const toxtat = setTimeout(() => clearInterval(id), 3000);
    return () => { clearInterval(id); clearTimeout(toxtat); };
  }, [nav]);

  return null;
}
