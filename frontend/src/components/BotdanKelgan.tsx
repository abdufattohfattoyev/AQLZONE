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
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { boshParametri } from "../lib/qobiq";
import { yolDuelKod } from "../lib/yollar";

export function BotdanKelgan() {
  const nav = useNavigate();
  const otdi = useRef(false);

  useEffect(() => {
    const urin = () => {
      if (otdi.current) return true;
      const kod = boshParametri();
      if (!kod) return false;
      otdi.current = true;
      nav(yolDuelKod(kod), { replace: true });
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
