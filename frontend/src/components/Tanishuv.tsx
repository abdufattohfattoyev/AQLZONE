/**
 * Kirish darvozasi.
 *
 * Kirishning YAGONA yo'li — Telegram (`Kirish.tsx`). Tugma botga olib
 * boradi, bot bir martalik havola yuboradi, havola `/kirish/<kod>` orqali
 * qaytaradi. Shundan keyin ism-familiya so'raladi.
 *
 * Ikki bosqich alohida holat bo'lib turadi, chunki odam ikkisining
 * ORASIDA sahifani yangilashi mumkin: Telegram'i bog'langan-u, familiyasi
 * hali yo'q. Bunda uni yana kirish ekraniga qaytarish ma'nosiz bo'lardi —
 * u allaqachon kirgan, faqat ismini yozib bo'lmagan.
 *
 * Ikki narsa darvozani OCHIQ qoldiradi, va ikkalasi ham ataylab:
 *
 *   1. **Server javob bermasa — o'tkazib yuboriladi.** Internetsiz bola
 *      darsga kira olmay qolishi ro'yxatdan MUHIMROQ: ilova offline
 *      ishlash uchun qurilgan. Aloqa tiklanganda darvoza yana so'raydi,
 *      reyting esa serverda baribir faqat ro'yxatdan o'tganlarni oladi.
 *   2. **`/kirish/<kod>` darvozadan o'tkaziladi.** Bu botdagi havola,
 *      ya'ni odam AYNAN kirish jarayonida. Uni kirish ekraniga tiqsak,
 *      cheksiz halqa yuzaga kelardi.
 */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sozlamalar } from "../screens/Sozlamalar";
import { Kirish } from "./Kirish";
import { getHisob } from "../lib/api";
import type { ReactNode } from "react";

/** Tekshiruv holati: hali bilmaymiz → kirish / ism so'raymiz / so'ramaymiz. */
type Holat = "kutilyapti" | "kirish" | "ism" | "kerak-emas";

export function Tanishuv({ children }: { children: ReactNode }) {
  const [holat, setHolat] = useState<Holat>("kutilyapti");
  const { pathname } = useLocation();
  const kirishSahifasi = pathname.startsWith("/kirish/");

  useEffect(() => {
    if (holat !== "kutilyapti" || kirishSahifasi) return;
    let bekor = false;

    // Kirish `ProgressProvider` da bo'ladi va u biroz vaqt oladi.
    // Shuning uchun bir necha marta urinib ko'ramiz, keyin voz kechamiz.
    let urinish = 0;
    const tekshir = async () => {
      const h = await getHisob();
      if (bekor) return;

      if (h) {
        if (h.royxatdan) return setHolat("kerak-emas");
        // Telegram bog'langan, lekin ism-familiya to'liq emas — odam
        // ikki bosqich orasida qolib ketgan.
        return setHolat(h.telegram ? "ism" : "kirish");
      }
      if (++urinish >= 3) {
        // Server javob bermadi. Ilovani to'smaymiz.
        setHolat("kerak-emas");
        return;
      }
      setTimeout(tekshir, 900);
    };
    tekshir();

    return () => { bekor = true; };
  }, [holat, kirishSahifasi]);

  if (kirishSahifasi) return <>{children}</>;
  if (holat === "kirish") return <Kirish />;

  if (holat === "ism") {
    return <Sozlamalar royxat onBack={() => setHolat("kirish")}
      onTayyor={() => setHolat("kerak-emas")} />;
  }

  // Tekshiruv davomida ilovani ko'rsataveramiz: bo'sh ekran ko'rsatib
  // bolani kuttirishdan ko'ra, so'rov bir lahza kechroq chiqqani afzal.
  return <>{children}</>;
}
