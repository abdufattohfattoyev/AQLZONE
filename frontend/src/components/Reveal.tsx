/**
 * Pastga aylanganda karta "yotgan holatdan" ko'tariladi.
 *
 * Mexanizm ataylab oddiy: BITTA umumiy scroll kuzatuvchisi va elementning
 * o'z joyini o'lchash. IntersectionObserver ham ishlatilishi mumkin edi,
 * lekin u asinxron va sahifa ko'rinmayotganda (masalan, orqa fondagi oyna)
 * umuman uyg'onmaydi — o'shanda kartalar `opacity: 0` holida qolib ketardi,
 * ya'ni bola bo'sh ekran ko'rardi. O'lchash esa har doim aniq javob beradi.
 *
 * Narxi past: hisob-kitob kadr boshiga bir marta, faqat hali ochilmagan
 * kartalar uchun bo'ladi. Hammasi ochilgach kuzatuvchi butunlay o'chadi.
 */
import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

/** Hali ochilmagan kartalar. */
const kutayotgan = new Set<HTMLElement>();
let ulangan = false;
let rejalashtirilgan = false;

/** Karta ekranga shu qadar kirsa — ochiladi (pastdan 60px zaxira). */
const KORINDI = 60;

function tekshir() {
  rejalashtirilgan = false;
  const balandlik = window.innerHeight || 0;
  for (const el of kutayotgan) {
    const r = el.getBoundingClientRect();
    if (r.top < balandlik - KORINDI && r.bottom > 0) {
      el.dataset.korindi = "ha";
      kutayotgan.delete(el);
    }
  }
  if (kutayotgan.size === 0) uzil();
}

function reja() {
  if (rejalashtirilgan) return;      // kadr boshiga bir marta
  rejalashtirilgan = true;
  // Sahifa ko'rinmayotganda brauzer `requestAnimationFrame` ni to'xtatadi.
  // Shuning uchun taymer ham qo'yamiz: kadr kelmasa ham tekshiruv o'tadi va
  // karta hech qachon `opacity: 0` da qotib qolmaydi.
  requestAnimationFrame(tekshir);
  setTimeout(tekshir, 250);
}

function ulan() {
  if (ulangan) return;
  ulangan = true;
  window.addEventListener("scroll", reja, { passive: true });
  window.addEventListener("resize", reja, { passive: true });
  // Ilova orqa fonda ochilgan bo'lsa, ko'rinishi bilan qayta hisoblaymiz.
  document.addEventListener("visibilitychange", reja);
}

function uzil() {
  if (!ulangan) return;
  ulangan = false;
  window.removeEventListener("scroll", reja);
  window.removeEventListener("resize", reja);
  document.removeEventListener("visibilitychange", reja);
}

interface Props {
  children: ReactNode;
  /** Yonma-yon kartalar birin-ketin chiqsin. */
  kech?: number;
  className?: string;
  style?: CSSProperties;
}

export function Reveal({ children, kech = 0, className = "", style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    kutayotgan.add(el);
    ulan();
    // Ekranda allaqachon turgan kartalar darhol ochilsin — bola birinchi
    // ekranni ko'rish uchun aylantirishi shart emas.
    tekshir();
    return () => {
      kutayotgan.delete(el);
      if (kutayotgan.size === 0) uzil();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`az-reveal ${className}`}
      style={{ transitionDelay: `${kech}ms`, ...style }}
    >
      {children}
    </div>
  );
}
