import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { Fon } from "./components/Fon";
import { Holat } from "./components/Holat";
import { XatoUshlagich } from "./components/XatoUshlagich";
import { BotdanKelgan } from "./components/BotdanKelgan";
import { Tanishuv } from "./components/Tanishuv";
import { Kanal } from "./components/Kanal";
import { ProgressProvider } from "./lib/progress";
import { t } from "./lib/matn";
import { tilniUlash } from "./lib/til";
import { qobiqniUlash } from "./lib/qobiq";
import { qolla as yoruglikniQolla, tizimniKuzat } from "./lib/yoruglik";

/**
 * Sahifa sarlavhasi va `lang` atributi.
 *
 * `index.html` da ular O'ZBEKCHA yozilgan — u statik fayl va ikki tilni
 * bir vaqtda ko'rsata olmaydi. Shu sabab ilova ishga tushganda ustiga
 * to'g'rilanadi: brauzer yorlig'i, tarix va PWA nomi tanlangan tilda
 * ko'rinadi.
 */
tilniUlash();
document.title = t("shior");

/**
 * Yorug'lik: oq yoki qora.
 *
 * Atributni `index.html` dagi skript ALLAQACHON qo'ygan — bu yerdagi
 * chaqiruv uni faqat tasdiqlaydi (xotira bloklangan bo'lsa yoki eski
 * qiymat qolgan bo'lsa to'g'rilaydi).
 *
 * `tizimniKuzat` esa "avto" holati uchun: telefon quyoshbotarda tunga
 * o'tsa, ilova ham o'tadi va foydalanuvchi uni qo'lda almashtirib
 * o'tirmaydi.
 */
yoruglikniQolla();
tizimniKuzat();

/**
 * Qobiq — qaysi sirtda ishlayotganimizga qarab RAMKA sozlanadi:
 * Telegram ichida nativ orqaga tugmasi, sarlavha rangi, haqiqiy ekran
 * balandligi va surish ishoralari. Dizaynga tegmaydi (`lib/qobiq.ts`).
 *
 * React'dan OLDIN chaqiriladi: `--az-ekran` va `--az-tepa` birinchi
 * kadrda joyida bo'lishi kerak, aks holda ekran bir lahza noto'g'ri
 * balandlikda chizilib, keyin sakrab to'g'rilanardi.
 */
qobiqniUlash();

/**
 * Veb va Telegram Mini App'da manzil chiroyli bo'lishi kerak:
 *   /kurs/1-sinf/2-bob/3-dars
 *
 * APK/iOS ichida esa sahifa `file://` dan yuklanadi va bunday manzilni
 * serverdan so'rab bo'lmaydi — u yerda hash kerak:
 *   index.html#/kurs/1-sinf
 *
 * Shu sabab tanlov yig'ish vaqtida beriladi:  VITE_ROUTER=hash npm run build
 */
const Router = import.meta.env.VITE_ROUTER === "hash" ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Fon xato ushlagichdan TASHQARIDA: u shunchaki bezak, unga tegishli
        xato butun ilovani to'xtatmasligi kerak. */}
    <Fon />
    <XatoUshlagich qayer="ilova">
      <Router>
        <ProgressProvider>
          {/* Chaqiruv havolasidan kelgan kod ENG BIRINCHI o'qiladi —
              `Tanishuv` dan ham oldin. U til so'ralayotgan paytda
              ilovani umuman chizmaydi va kod yo'qolib ketardi. */}
          <BotdanKelgan />
          {/* Mini App'ga birinchi kirganda ism so'raladi. Boshqa hamma
              holatda bu qatlam ko'rinmaydi va hech narsa qilmaydi. */}
          <Tanishuv>
            <App />
            {/* Kanalga taklif. Tanishuv ICHIDA: hali ro'yxatdan
                o'tmagan odamga reklama ko'rsatilmaydi — u avval
                ilovaga kirib olsin. */}
            <Kanal />
          </Tanishuv>
          <Holat />
        </ProgressProvider>
      </Router>
    </XatoUshlagich>
  </StrictMode>
);
