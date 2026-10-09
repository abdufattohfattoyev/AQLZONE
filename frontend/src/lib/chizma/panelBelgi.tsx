/**
 * Panel belgilari — hajmli (3D) rasm, bitta firuza rangda.
 *
 * NEGA `lib/icons.tsx` DAN AJRALDI.  U yerdagi belgilar ro'yxatlarda,
 * tugmalarda, sarlavhalarda — yuzlab joyda turadi va bir xil chiziqli
 * bo'lgani ularni tinch qiladi. Panel esa ilovaning YUZI: hamma sahifada
 * doim turadi va bola tugmani yozuvdan oldin SHAKLDAN taniydi.
 *
 * BITTA RANG (2026-10-08).  Ilgari har tugma o'z rangida edi (yashil uy,
 * ko'k xarita, jigarrang quti, binafsha qalam) — "bola tugmani rangdan
 * taniydi" degan fikr bilan. Amalda yon panelda va ekranlarda kamalak
 * paydo bo'ldi, ilova esa bitta asosiy rangga (firuza) o'tdi. Endi
 * hammasi firuza: farq SHAKLDA, hajm (soya va yaltiroq) esa saqlangan.
 * Rasmlar `.belgi/firuza.py` bilan asl 3D rasmlardan yasaladi.
 *
 * 2026-10-09: har belgi TO'Q NAVY PLITKADA (`.az-plitka`, `index.css`) —
 * ingichka firuza chiziq va yumshoq nur bilan. Ilgari faol tugma ustida
 * oqish nusxa (`*-oq.webp`) olinardi; plitka bilan bu kerak emas.
 *
 * Ilgari "Imtihonlar" guruhi (DTM, sertifikat, reyting, qidiruv) yassi
 * chiziqli belgida edi — panelda ikki xil til. Endi ular ham 3D.
 *
 * HARAKAT FAQAT FAOL TUGMADA va faqat BIR MARTA (`az-pb-rasm` —
 * `index.css`): doim qimirlaydigan belgi darsdan chalg'itadi.
 */
export type PanelBelgiNom =
  | "uy" | "xarita" | "oyin" | "vazifa" | "reyting" | "menyu"
  | "dtm" | "kubok" | "lupa" | "olov";

/** Belgi → fayl (`public/belgi/f/`). Nomi farq qilganlari. */
const FAYL: Partial<Record<PanelBelgiNom, string>> = { vazifa: "qalam" };

/** Fayl yo'li — `index.html` dagi oldindan yuklash ham shu shaklda. */
export const panelBelgiYoli = (nom: PanelBelgiNom, oq = false): string =>
  `/belgi/f/${FAYL[nom] ?? nom}${oq ? "-oq" : ""}.webp`;

export function PanelBelgi({ nom, faol = false, size = 26, className = "" }: {
  nom: PanelBelgiNom;
  /** Shu tugma turgan sahifa ochiqmi — harakat shundan. */
  faol?: boolean;
  /**
   * ESKIRGAN (2026-10-09): ilgari firuza tugma ustida oqish nusxa olinardi.
   * Endi belgi doim to'q navy plitkada (`.az-plitka`) — firuza belgi
   * firuza tugma ustida ham ko'rinadi. Chaqiruvlar buzilmasin deb qoldi.
   */
  oq?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`az-plitka ${size < 36 ? "az-plitka-kichik" : ""} ${className}`}
      style={{ width: size, height: size }}>
      <img src={panelBelgiYoli(nom)} width={size} height={size} alt=""
        // Panel belgilari BIRINCHI ko'rinadigan narsalardan. Brauzerga
        // "keyinroq" deb qo'yib berilsa, panel bir zum bo'sh turardi.
        decoding="sync" fetchPriority="high"
        className={`az-pb az-pb-rasm ${faol ? "az-pb-faol" : ""}`} />
    </span>
  );
}
