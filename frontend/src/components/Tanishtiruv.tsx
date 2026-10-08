/**
 * Tanishuv sahifasi — veb'da birinchi kelgan odamga "Aql Zone nima?".
 *
 * Ilgari bu yerda kichik karta turardi: beshta bo'lim va "Boshlash",
 * undan oldin til, undan keyin anketa so'ralardi. Ya'ni havolani bosib
 * kelgan odam uch ekrandan o'tib, keyin ilovani ko'rardi. Endi bitta
 * to'liq sahifa (`screens/Lending.tsx`): nima bor, kimga, qanday
 * ishlaydi, va shu yerning o'zida bitta savolni yechib ko'rish mumkin.
 *
 * Sahifa ALOHIDA bo'lakda (`lazy`): uni faqat yangi kelgan odam bir
 * marta ko'radi, ilovaga har kuni kiradigan bola esa uni yuklamasin.
 *
 * Bir marta ko'rsatiladi (`TANISHTIRILDI_KEY`) — "Bepul boshlash"
 * bosilgach yoki odam Telegram bilan kirgach.
 */
import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Kutish } from "./Kutish";

const TANISHTIRILDI_KEY = "az_tanishtirildi";

export function tanishtirilganmi(): boolean {
  try { return localStorage.getItem(TANISHTIRILDI_KEY) === "1"; }
  catch { return true; }        // xotira yopiq — har safar ko'rsatib to'smaymiz
}

export function tanishtirildi(): void {
  try { localStorage.setItem(TANISHTIRILDI_KEY, "1"); } catch { /* eslanmaydi, xolos */ }
}

const Lending = lazy(() => import("../screens/Lending").then((m) => ({ default: m.Lending })));

export function Tanishtiruv({ onTayyor }: { onTayyor: () => void }) {
  const nav = useNavigate();
  const ich = (yol?: string) => {
    tanishtirildi();
    onTayyor();
    // Bo'lim kartasi bosilsa — to'g'ridan-to'g'ri o'sha bo'limga: odam
    // "Testlar" ni tanlagan, uni bosh sahifaga tashlab, testni qaytadan
    // izlatish ortiqcha.
    if (yol) nav(yol);
    window.scrollTo(0, 0);
  };
  return (
    <Suspense fallback={<Kutish />}>
      <Lending onBoshlash={() => ich()} onOch={ich} />
    </Suspense>
  );
}
