/**
 * MAKET — ekran telefonmi yoki kompyuter.
 *
 * `lib/qobiq.ts` "qayerda ochildik" deb so'raydi (veb / tg / apk). Bu
 * fayl esa undan keyingi savolga javob beradi: "qanday chizamiz".
 *
 *   "kompyuter"  oddiy brauzer VA keng oyna (1024px dan)
 *   "telefon"    qolgan hammasi — shu jumladan butun Telegram
 *
 * Telegram ATAYLAB doim "telefon". Bot ichidagi ilova — cho'ntakdagi
 * ilova: pastda panel, bir ustun, katta tugmalar. Telegram Desktop'da
 * ham u tor oynada ochiladi va chap yon panel u yerga sig'masdi. Ota-ona
 * noutbukda saytni ochganda esa telefon ekranini ekran o'rtasida kichik
 * ustun qilib ko'rishi — "bu sayt emas, ilovaning nusxasi" degan
 * taassurot beradi. Shuning uchun faqat veb-brauzerda maket keng oynaga
 * moslashadi.
 *
 * Ranglar, matn, marshrutlar BO'LINMAYDI — faqat joylashuv.
 */
import { useSyncExternalStore } from "react";
import { qobiq } from "./qobiq";

export type Maket = "kompyuter" | "telefon";

/** Chap yon panel shu kenglikdan boshlab chiqadi (Tailwind `lg`). */
const KENG = "(min-width: 1024px)";

function sorov(): MediaQueryList | null {
  try {
    return window.matchMedia(KENG);
  } catch {
    return null;
  }
}

export function maket(): Maket {
  if (qobiq() !== "veb") return "telefon";
  return sorov()?.matches ? "kompyuter" : "telefon";
}

function obuna(cb: () => void): () => void {
  const s = sorov();
  if (!s) return () => {};
  s.addEventListener("change", cb);
  return () => s.removeEventListener("change", cb);
}

/** Oyna cho'zilsa yoki torayib qolsa — ekran o'zi qayta chiziladi. */
export const useMaket = (): Maket => useSyncExternalStore(obuna, maket, () => "telefon");

export const useKompyuter = (): boolean => useMaket() === "kompyuter";

/**
 * `<html data-maket="...">` — CSS uchun. React'dan OLDIN qo'yiladi,
 * aks holda keng ekranda birinchi kadr telefon maketida chizilib,
 * keyin sakrab o'zgarardi.
 */
export function maketniUlash(): void {
  const qoy = () => { document.documentElement.dataset.maket = maket(); };
  qoy();
  obuna(qoy);
}
