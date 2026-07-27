/**
 * Yo'lboshchi ko'rsatilganmi.
 *
 * Alohida fayl, chunki bayroqni IKKI joy biladi: yo'lboshchining o'zi
 * (ko'rsatilgandan keyin yozadi) va Sozlamalar ("qaytadan ko'rsat"
 * tugmasi o'chiradi). Komponent ichida qolsa, ekran komponentdan
 * import qilishga majbur bo'lardi.
 *
 * Bayroq profilga BOG'LANMAYDI, ataylab. Bu bolaning yutug'i emas,
 * qurilmada ilova bir marta tanishtirilgani haqidagi belgi: bir
 * telefonda ikkinchi bola o'ynay boshlaganda unga xuddi shu ekranni
 * qaytadan ko'rsatish ortiqcha to'siq bo'lardi — ilova allaqachon
 * tanish, u yonida o'tirgan.
 */
const KALIT = "azapp_yolboshchi_v1";

export function turKerakmi(): boolean {
  try {
    return localStorage.getItem(KALIT) !== "1";
  } catch {
    // Xotira bloklangan — yo'lboshchi har safar chiqib, xalaqit berardi.
    return false;
  }
}

export function turKorildi(): void {
  try {
    localStorage.setItem(KALIT, "1");
  } catch {
    /* xotira bloklangan — keyingi ochilishda yana taklif qilinadi */
  }
}

/** Sozlamalardagi "Yo'lboshchini qaytadan ko'rsatish". */
export function turniUnut(): void {
  try {
    localStorage.removeItem(KALIT);
  } catch {
    /* xotira bloklangan */
  }
}
