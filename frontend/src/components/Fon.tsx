/**
 * Orqa fon — temaga qarab butunlay boshqacha manzara.
 *
 * Bitta `position: fixed` qatlam: sahifa aylanganda joyida turadi va
 * ekranlar almashganda qayta chizilmaydi (shuning uchun u marshrutdan
 * TASHQARIDA, `main.tsx` da turadi).
 *
 * Uchala temada ham BITTA g'oya: sekin suzuvchi matematik belgilar naqshi.
 * Farq faqat rangda — bosh va bolalar yorug', katta quyuq.
 *
 *   bosh    — och ko'k fon, yumshoq ko'k belgilar
 *   bolalar — och osmon rangi, oq-ko'k belgilar
 *   katta   — quyuq ko'k tun, ochroq ko'k belgilar
 *
 * Hammasi CSS/SVG — birorta rasm yuklanmaydi, shuning uchun sekin
 * internetda ham ilova darhol "to'liq" ko'rinadi.
 *
 * CHUQURLIK QANDAY YASALADI. Uchta qavat BIR XIL plitkani ishlatadi, lekin:
 *
 *   1. har xil o'lchamda — yiriklari yaqinroq tuyuladi;
 *   2. har xil tezlikda suriladi — yaqini tez, uzog'i sekin;
 *   3. har xil shaffoflikda — uzog'i xiraroq.
 *
 * Bitta qavat bo'lsa bu shunchaki "harakatlanuvchi devor qog'ozi" bo'lardi.
 *
 * Naqsh `background-position` orqali suriladi, `transform` orqali emas:
 * takrorlanadigan plitkada faqat shu usul uzluksiz chiqadi, transform esa
 * qatlamni joyidan siljitib, chetida bo'sh joy ochib qo'yadi.
 *
 * Sahifa aylanganda ham qavatlar turli tezlikda siljiydi (`--az-scroll`).
 */
import { useEffect, useRef } from "react";

export function Fon() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let kutilyapti = false;
    const yangila = () => {
      kutilyapti = false;
      // 0 → 1 oralig'i: bir ekran balandligida to'liq siljish.
      const n = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
      ref.current?.style.setProperty("--az-scroll", String(n));
    };
    const onScroll = () => {
      // Har bir scroll hodisasida emas, kadr boshiga bir marta hisoblaymiz.
      if (kutilyapti) return;
      kutilyapti = true;
      requestAnimationFrame(yangila);
    };
    yangila();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={ref} aria-hidden className="az-fon">
      {/* --- bosh sahifa: oltin nur va kengayuvchi halqalar --- */}
      <span className="az-nur" />
      <span className="az-halqa az-halqa-1" />
      <span className="az-halqa az-halqa-2" />
      <span className="az-halqa az-halqa-3" />

      {/* --- Matematik belgilar naqshi: uchala temada ham shu, faqat rangi
          boshqacha. Uchta qavat bir xil plitkani turli o'lchamda va turli
          tezlikda suradi — shundan chuqurlik chiqadi. Bitta qavat surilsa
          u shunchaki "harakatlanuvchi devor qog'ozi" bo'lib qolardi. */}
      <span className="az-naqsh az-naqsh-1" />
      <span className="az-naqsh az-naqsh-2" />
      <span className="az-naqsh az-naqsh-3" />

      {/* Chetlarni qoraytiruvchi qatlam: naqsh markazda kuchli, chekkalarda
          so'nadi. Bo'lmasa belgilar ekran chetida kesilib, "tugamagan"
          ko'rinardi va matnga raqobat qilardi. */}
      <span className="az-vinyet" />
    </div>
  );
}
