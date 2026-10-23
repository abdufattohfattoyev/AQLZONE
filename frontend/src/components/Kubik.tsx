/**
 * KUBIK — jonli darsdagi ustoz personaj (firuza kub, yon yog'ida π).
 *
 * Bitta SVG, holat `data-holat` atributi orqali: qaysi ko'z, og'iz va
 * qo'l ko'rinishini CSS hal qiladi (`index.css` → `.kubik`). Shuning uchun
 * holat almashganda React hech narsani qayta chizmaydi — faqat atribut.
 *
 *   tingla  — pauza, javob kutish
 *   gapir   — tushuntiryapti (og'iz ochilib-yopiladi)
 *   korsat  — doskada yozilyapti: chap qo'li bilan doskaga ishora
 *   oyla    — savol: qo'li iyagida, tepasida "?"
 *   xursand — to'g'ri javob: sakraydi, yulduzchalar
 *   dalda   — xato javob: xavotirli qosh, yumshoq tabassum
 *
 * Eskiz va holatlar sinovi — `.dizayn/personajlar/kubik-dars.html`.
 */
import { useId } from "react";

export type KubikHolat = "tingla" | "gapir" | "korsat" | "oyla" | "xursand" | "dalda";

const INK = "#153b45";

export function Kubik({ holat, olcham = 96, className = "" }: { holat: KubikHolat; olcham?: number; className?: string }) {
  // Bir sahifada bir nechta Kubik bo'lsa gradientlar aralashmasin.
  const id = useId().replace(/:/g, "");
  const o = `${id}o`, tp = `${id}t`, y = `${id}y`;
  return (
    <svg className={`kubik ${className}`} data-holat={holat} viewBox="-10 -24 260 304"
      width={olcham} height={Math.round((olcham * 304) / 260)} aria-hidden>
      <defs>
        <linearGradient id={o} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#34d3cc" /><stop offset="1" stopColor="#14a6a0" /></linearGradient>
        <linearGradient id={tp} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c4f6f1" /><stop offset="1" stopColor="#83e2db" /></linearGradient>
        <linearGradient id={y} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#11948f" /><stop offset="1" stopColor="#0a6966" /></linearGradient>
      </defs>
      <ellipse cx="128" cy="264" rx="74" ry="9" fill={INK} opacity=".13" />
      <g className="kubik-sakra"><g className="kubik-tana">
        <path d="M100 214 v30 M150 214 v30" stroke="#0a6966" strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="94" cy="248" rx="17" ry="8.5" fill="#d97706" /><ellipse cx="156" cy="248" rx="17" ry="8.5" fill="#d97706" />
        <g strokeLinejoin="round" strokeWidth="14">
          <path d="M64 98 L94 70 H206 L176 98 Z" fill={`url(#${tp})`} stroke={`url(#${tp})`} />
          <path d="M176 98 L206 70 V184 L176 212 Z" fill={`url(#${y})`} stroke={`url(#${y})`} />
          <path d="M64 98 H176 V212 H64 Z" fill={`url(#${o})`} stroke={`url(#${o})`} />
        </g>
        <path d="M66 92 H176" stroke="#fff" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" />
        <path d="M183 100 V208" stroke="#fff" strokeOpacity=".22" strokeWidth="2.5" strokeLinecap="round" />
        {/* π yon yoqqa "yopishgan" — yoqning o'z koordinatasida chiziladi. */}
        <g transform="matrix(30 -28 0 114 176 98)" fill="none">
          <path d="M.18 .36 H.84 M.4 .36 V.66 M.66 .36 Q.65 .6 .8 .66" stroke="#8fe7e1" strokeWidth="3.2"
            vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        </g>
        <path className="kubik-qosh kubik-qosh-ch" d="M85 115 q13 -8 26 -2" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path className="kubik-qosh kubik-qosh-o" d="M129 113 q13 -6 26 2" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <g className="kubik-koz-oddiy"><g className="kubik-koz">
          <ellipse cx="98" cy="140" rx="13.5" ry="15.5" fill="#fff" /><ellipse cx="142" cy="140" rx="13.5" ry="15.5" fill="#fff" />
          <g className="kubik-qorachiq">
            <circle cx="99" cy="142" r="7.8" fill={INK} /><circle cx="141" cy="142" r="7.8" fill={INK} />
            <circle cx="102" cy="138.5" r="2.7" fill="#fff" /><circle cx="144" cy="138.5" r="2.7" fill="#fff" />
          </g>
        </g></g>
        <path className="kubik-koz-xursand" d="M85 145 q13 -16 26 0 M129 145 q13 -16 26 0" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="82" cy="167" rx="9" ry="5" fill="#ff8f80" opacity=".5" /><ellipse cx="158" cy="167" rx="9" ry="5" fill="#ff8f80" opacity=".5" />
        <path className="kubik-og-oddiy" d="M108 169 q12 10 24 0" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <g className="kubik-og-gap"><g className="kubik-og">
          <path d="M106 164 h28 q0 19 -14 19 q-14 0 -14 -19 Z" fill={INK} />
          <path d="M112 177 q8 -6 16 0 q-2 6 -8 6 q-6 0 -8 -6 Z" fill="#ff8f80" />
        </g></g>
        <g className="kubik-og-kulgi">
          <path d="M100 161 h40 q0 26 -20 26 q-20 0 -20 -26 Z" fill={INK} />
          <path d="M109 178 q11 -8 22 0 q-3 9 -11 9 q-8 0 -11 -9 Z" fill="#ff8f80" />
        </g>
        <ellipse className="kubik-og-o" cx="124" cy="172" rx="6" ry="7.5" fill={INK} />
        <path className="kubik-og-dalda" d="M108 171 q12 7 24 0" stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <g stroke="#14a6a0" strokeWidth="12" strokeLinecap="round" fill="none">
          <path className="kubik-qol-ch-past" d="M62 160 q-24 12 -26 40" />
          <path className="kubik-qol-ch-korsat" d="M62 150 q-26 -2 -44 -20" />
          <path className="kubik-qol-ch-tepa" d="M62 150 q-28 -14 -26 -52" />
          <path className="kubik-qol-o-past" d="M198 156 q24 12 24 40" />
          <path className="kubik-qol-o-iyak" d="M198 162 q16 36 -40 34" />
          <path className="kubik-qol-o-tepa" d="M198 148 q26 -14 24 -52" />
        </g>
        <g fill="#34d3cc" stroke="#14a6a0" strokeWidth="2.5">
          <circle className="kubik-qol-ch-past" cx="36" cy="202" r="10" />
          <g className="kubik-qol-ch-korsat">
            <circle cx="18" cy="128" r="10" />
            <path d="M12 122 L-2 112" stroke="#34d3cc" strokeWidth="7" strokeLinecap="round" />
          </g>
          <circle className="kubik-qol-ch-tepa" cx="36" cy="96" r="10" />
          <circle className="kubik-qol-o-past" cx="222" cy="198" r="10" />
          <circle className="kubik-qol-o-iyak" cx="156" cy="196" r="10" />
          <circle className="kubik-qol-o-tepa" cx="222" cy="94" r="10" />
        </g>
        <g className="kubik-fikr">
          <circle cx="62" cy="62" r="4" fill="#fff" stroke="#cfeee8" strokeWidth="2" />
          <circle cx="48" cy="44" r="7" fill="#fff" stroke="#cfeee8" strokeWidth="2" />
          <circle cx="26" cy="12" r="22" fill="#fff" stroke="#cfeee8" strokeWidth="2" />
          <text x="26" y="21" textAnchor="middle" fontSize="26" fontWeight="800" fill="#19b7b2" fontFamily="system-ui">?</text>
        </g>
        <g className="kubik-yulduz" fill="#d97706">
          <path d="M40 40 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" />
          <path d="M210 30 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 Z" />
          <path d="M128 18 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" fill="#19b7b2" />
        </g>
      </g></g>
    </svg>
  );
}
