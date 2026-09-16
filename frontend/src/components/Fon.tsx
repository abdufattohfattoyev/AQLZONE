/**
 * Orqa fon — TEKIS RANG.
 *
 * Bitta `position: fixed` qatlam, rangi temadan (`--az-body`). Marshrutdan
 * TASHQARIDA (`main.tsx`) turadi, shuning uchun ekranlar almashganda
 * qayta chizilmaydi.
 *
 * Ilgari bu yerda suzuvchi formulalar naqshi, aylanuvchi nur va
 * halqalar bor edi. Ular olib tashlandi: fon mazmun bilan raqobat
 * qilmasligi kerak — odam savolga javob berish uchun kiradi
 * (`index.css` dagi "ORQA FON" izohiga qarang).
 */
export function Fon() {
  return <div aria-hidden className="az-fon" />;
}
