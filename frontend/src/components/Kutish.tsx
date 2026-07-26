/**
 * Kutish ekrani — `index.html` dagi dastlabki ekranning AYNAN o'zi.
 *
 * Ikki nusxa bo'lgani ataylab: birinchisi React'gacha (HTML), bu esa
 * React ulangandan keyin, hisob serverdan kelgunicha. Ular bir xil
 * ko'rinishi SHART — aks holda odam bir soniya ichida ikki xil ekranni
 * ko'rib, sayt qayta yuklanayotgandek tuyulardi.
 *
 * Belgi HTML'dagi bilan bir xil bo'lishi uchun `logo.svg` fayli olinadi,
 * `Logo` komponenti emas: u paytga qadar rasm allaqachon keshda turadi
 * va yangi so'rov ketmaydi.
 */
export function Kutish() {
  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <div className="grid place-items-center gap-2.5 rounded-clay bg-karta px-8 py-7 shadow-clay">
        <img src="/logo.svg" alt="Aql Zone" width={64} height={64} />
        <b className="font-display text-[19px] text-ink">Aql Zone</b>
        <span className="relative h-1 w-24 overflow-hidden rounded bg-track">
          <span className="az-yur absolute inset-0 rounded bg-brand-green" />
        </span>
      </div>
    </div>
  );
}
