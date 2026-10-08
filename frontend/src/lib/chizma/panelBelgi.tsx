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
 * `oq` — to'ldirilgan firuza tugma USTIDA (kompyuterdagi faol bo'lim).
 * U yerda firuza belgi fonga singib ketardi, shuning uchun o'sha hajmning
 * oqish nusxasi (`*-oq.webp`) olinadi.
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

export function PanelBelgi({ nom, faol = false, oq = false, size = 26, className = "" }: {
  nom: PanelBelgiNom;
  /** Shu tugma turgan sahifa ochiqmi — harakat va to'liq rang shundan. */
  faol?: boolean;
  /** To'ldirilgan firuza fon ustida — oqish nusxa. */
  oq?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <img src={panelBelgiYoli(nom, oq)} width={size} height={size} alt=""
      // Panel belgilari BIRINCHI ko'rinadigan narsalardan. Brauzerga
      // "keyinroq" deb qo'yib berilsa, panel bir zum bo'sh turardi.
      decoding="sync" fetchPriority="high"
      className={`az-pb az-pb-rasm ${faol ? "az-pb-faol" : ""} ${className}`} />
  );
}
