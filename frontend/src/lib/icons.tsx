/**
 * Aql Zone — ikonka tizimi.
 *
 * Nega emoji ishlatilmaydi: emoji har platformada boshqa rassom qo'lida
 * chizilgan. Windows'da ular ayniqsa xunuk chiqadi va ro'yxat tarqoq
 * ko'rinadi. Bu yerda hammasi bitta tilda: 24×24 to'r, faqat chiziq,
 * qalinligi 2.4, uchlari yumaloq. Rang `currentColor` orqali keladi.
 */
import type { SVGProps } from "react";

export type IconName = keyof typeof PATHS;

const PATHS = {
  /* --- arifmetika --- */
  plus: <path d="M12 5.5v13M5.5 12h13" />,
  minus: <path d="M5.5 12h13" />,
  times: <path d="M7 7l10 10M17 7L7 17" />,
  divide: (
    <>
      <path d="M5.5 12h13" />
      <circle cx="12" cy="6.8" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17.2" r="1.7" fill="currentColor" stroke="none" />
    </>
  ),
  equals: <path d="M5 9.5h14M5 14.5h14" />,

  /* --- sonlar --- */
  scale: (
    <>
      <path d="M12 5v13M7.5 18.5h9M4 8.5h16" />
      <path d="M1.6 13h4.8L4 8.5z" />
      <path d="M17.6 13h4.8L20 8.5z" />
    </>
  ),
  numline: (
    <>
      <path d="M3 12h18M7 9.5v5M17 9.5v5" />
      <circle cx="12" cy="12" r="2.7" fill="currentColor" stroke="none" />
    </>
  ),
  blocks: (
    <>
      <path d="M5 5v14M9.5 5v14" />
      <rect x="13.5" y="13" width="5.8" height="5.8" rx="1.2" />
    </>
  ),
  column: <path d="M8.5 6.5h7M8.5 11h7M5.5 14.5h13M9.5 18.5h5" />,
  puzzle: <path d="M5 5.5h5.4a1.9 1.9 0 013.8 0H19V11a1.9 1.9 0 000 3.8v4.7H5z" />,
  order: <path d="M4.5 7h15M4.5 12h10M4.5 17h6" />,
  count: (
    <>
      <circle cx="8" cy="8" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="2.4" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l4.6 4.6" />
    </>
  ),

  /* --- kasr, geometriya, o'lchov --- */
  pie: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v8h8" />
    </>
  ),
  ruler: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="1.7" />
      <path d="M7.5 8v3.2M12 8v4M16.5 8v3.2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3.6 2.1" />
    </>
  ),
  shape: (
    <>
      <path d="M12 3.6l5.6 9.4H6.4z" />
      <rect x="7" y="14" width="10" height="6.4" rx="1.2" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 12h16M12 4v16" />
    </>
  ),

  /* --- 5–6-sinf: daraja, foiz, fazoviy va tekis shakllar --- */
  // Kvadrat va uning ustidagi kichik ikkilik — "daraja" belgisi.
  power: (
    <>
      <rect x="3.5" y="9" width="10" height="10" rx="1.8" />
      <path d="M16 8.4c0-1.5 1.2-2.4 2.5-2.4s2.4.9 2.4 2.1c0 1.9-3.4 2.6-4.6 4.9h4.8" />
    </>
  ),
  // Ildiz belgisi — ustidagi chiziq bilan.
  sqrt: <path d="M3.5 12.5h2.6l3 6.4L13.4 5H21" />,
  percent: (
    <>
      <path d="M6 18L18 6" />
      <circle cx="7.4" cy="7.4" r="2.6" />
      <circle cx="16.6" cy="16.6" r="2.6" />
    </>
  ),
  // Plyus-minus: musbat va manfiy sonlar bobining belgisi.
  sign: (
    <>
      <path d="M7.6 4.5v7M4.1 8h7" />
      <path d="M13 16h7" />
      <path d="M4.1 19.5h7" />
    </>
  ),
  angle: <path d="M4.5 19.5h15L4.5 6.5zM9.6 19.5a5.6 5.6 0 00-1.6-4" />,
  triangle: <path d="M12 4.2L20.5 19.5h-17z" />,
  circle: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 12h8.2" />
    </>
  ),
  // Uch o'lchovli quti — parallelepiped va kub.
  cube: (
    <>
      <path d="M12 3.2l8 4v9.6l-8 4-8-4V7.2z" />
      <path d="M4 7.2l8 4 8-4M12 11.2v9.6" />
    </>
  ),

  /* --- boshqalar --- */
  pencil: (
    <>
      <path d="M5 19h3.2l9.8-9.8-3.2-3.2L5 15.8z" />
      <path d="M14.4 6.4l3.2 3.2" />
    </>
  ),
  chart: (
    <>
      <path d="M3.5 19.5h17" />
      <path d="M6.5 19.5v-6M12 19.5V6M17.5 19.5v-8.5" />
    </>
  ),
  map: (
    <>
      <path d="M4 7l5-2 6 2 5-2v12l-5 2-6-2-5 2z" />
      <path d="M9 5v12M15 7v12" />
    </>
  ),
  car: (
    <>
      <path d="M4 15.5h16M5.8 15.5V12l1.9-4h8.6l1.9 4v3.5" />
      <circle cx="8.2" cy="17.6" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="15.8" cy="17.6" r="1.7" fill="currentColor" stroke="none" />
    </>
  ),
  repeat: (
    <>
      <path d="M19.6 12a7.6 7.6 0 11-2.9-6" />
      <path d="M19.6 4.6V9h-4.4" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4.6h8V9a4 4 0 11-8 0z" />
      <path d="M8 6.2H5.6A3 3 0 008.6 9M16 6.2h2.4A3 3 0 0115.4 9" />
      <path d="M12 13v3.2M9 19.4h6" />
    </>
  ),

  /* --- mukofot va interfeys --- */
  star: (
    <path
      d="M12 3.2l2.75 5.85 6.25.85-4.6 4.4 1.15 6.3L12 17.5l-5.55 3.1 1.15-6.3-4.6-4.4 6.25-.85z"
      fill="currentColor"
      stroke="none"
    />
  ),
  starOff: <path d="M12 3.2l2.75 5.85 6.25.85-4.6 4.4 1.15 6.3L12 17.5l-5.55 3.1 1.15-6.3-4.6-4.4 6.25-.85z" />,
  coin: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 8.2v7.6M9.9 10.1h3.2a1.9 1.9 0 010 3.8H9.9" />
    </>
  ),
  palette: (
    <>
      <path d="M12 4a8 8 0 000 16c1.2 0 1.7-1 1.7-1.9 0-1.6 1.3-2.3 2.5-2.3H19a3 3 0 003-3A8 8 0 0012 4z" />
      <circle cx="9" cy="10.2" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="13.4" cy="8.6" r="1.25" fill="currentColor" stroke="none" />
    </>
  ),
  parent: (
    <>
      <circle cx="9.2" cy="8.4" r="2.9" />
      <path d="M3.6 19.6c0-3.1 2.5-5.2 5.6-5.2s5.6 2.1 5.6 5.2" />
      <circle cx="17.2" cy="9.6" r="2.2" />
      <path d="M15.2 14.9c2.7-.4 5.4 1.3 5.4 4.7" />
    </>
  ),
  flame: <path d="M12 3.4c3.6 3.9 6.1 6.3 6.1 9.7a6.1 6.1 0 11-12.2 0c0-2.3 1.2-4 3-6.1.4 1.4 1.2 2.3 2.2 2.6-.4-2.4-.1-4.3.9-6.2z" />,
  lock: (
    <>
      <rect x="5.6" y="11" width="12.8" height="8.4" rx="2.2" />
      <path d="M8.6 11V8.6a3.4 3.4 0 016.8 0V11" />
    </>
  ),
  check: <path d="M5 12.6l4.6 4.6L19 7.4" />,
  home: (
    <>
      <path d="M4 10.5L12 4l8 6.5V19a1 1 0 01-1 1H5a1 1 0 01-1-1z" />
      <path d="M9.5 20v-6h5v6" />
    </>
  ),
  chevron: <path d="M8.5 5l7 7-7 7" />,
  // Uchta chiziq. Pastkisi ATAYLAB qisqa: teng uchta chiziq boshqa
  // belgilarga (`order`, `equals`) o'xshab ketardi va panelda ikkitasi
  // yonma-yon turganda ular bir xil ko'rinardi.
  menu: <path d="M4.5 7h15M4.5 12h15M4.5 17h9" />,
  // Yopish — menyuning o'z tugmasi. `times` dan farqi o'lchamda: bu
  // chiziqlar kaltaroq va doira ichida markazda o'tiradi.
  close: <path d="M6.8 6.8l10.4 10.4M17.2 6.8L6.8 17.2" />,
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.6" />
      <path d="M10.6 18.4h2.8" />
    </>
  ),
  // Telegram uchun — qog'oz samolyot
  send: <path d="M20.5 3.5L2.8 10.4l6.1 2.3 2.3 6.1z M8.9 12.7l11.6-9.2" />,
  // Karnay: savolni qayta eshitish. To'lqinlar ataylab ikkita — bittasi
  // kichik belgida yo'qolib ketardi, uchtasi esa qalashib qolardi.
  ovoz: (
    <>
      <path d="M11 4.5L6.5 8.5H3.5v7h3l4.5 4z" />
      <path d="M15 9.2a4 4 0 010 5.6M17.8 6.4a8 8 0 010 11.2" />
    </>
  ),
} as const;

type Props = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 24, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[];
