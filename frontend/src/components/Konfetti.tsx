/**
 * To'g'ri javobda otiladigan konfetti.
 *
 * Kutubxona qo'shilmadi: bu yerda kerak bo'lgani — 20 ta rangli to'rtburchak
 * markazdan turli tomonga uchib tarqalishi. Buni CSS animatsiyasi o'zi
 * bajaradi, JS faqat yo'nalish va rangni bir marta hisoblaydi.
 *
 * Yangi portlash uchun ota-komponent `key` ni o'zgartiradi:
 *
 *     <Konfetti key={portlash} />
 *
 * Shunda React komponentni qaytadan yasaydi va yo'nalishlar ham,
 * CSS animatsiyasi ham noldan boshlanadi.
 */
import { useMemo } from "react";
import type { CSSProperties } from "react";

const RANGLAR = ["#ff9f43", "#48c97a", "#4fb8e0", "#b07be8", "#f5b301", "#ff7a6b"];
const SONI = 20;

export function Konfetti() {
  const bolaklar = useMemo(() => {
    return Array.from({ length: SONI }, (_, i) => {
      // Yelpig'ich shaklida yuqoriga: to'liq doira "portlagan" ko'rinadi,
      // yuqoriga qarab tarqalgani esa bayram salyutiga o'xshaydi.
      const burchak = (-160 + (140 / SONI) * i + Math.random() * 14) * (Math.PI / 180);
      const uzoq = 90 + Math.random() * 110;
      return {
        x: `${Math.cos(burchak) * uzoq}px`,
        y: `${Math.sin(burchak) * uzoq}px`,
        aylanish: `${Math.round(Math.random() * 720 - 360)}deg`,
        rang: RANGLAR[i % RANGLAR.length],
        kech: `${Math.round(Math.random() * 90)}ms`,
      };
    });
  }, []);

  return (
    <span aria-hidden className="az-konfetti">
      {bolaklar.map((b, i) => (
        <i
          key={i}
          style={{
            background: b.rang,
            animationDelay: b.kech,
            "--az-x": b.x,
            "--az-y": b.y,
            "--az-burchak": b.aylanish,
          } as CSSProperties}
        />
      ))}
    </span>
  );
}
