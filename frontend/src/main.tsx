import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { Fon } from "./components/Fon";
import { Holat } from "./components/Holat";
import { XatoUshlagich } from "./components/XatoUshlagich";
import { Tanishuv } from "./components/Tanishuv";
import { ProgressProvider } from "./lib/progress";

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
          {/* Mini App'ga birinchi kirganda ism so'raladi. Boshqa hamma
              holatda bu qatlam ko'rinmaydi va hech narsa qilmaydi. */}
          <Tanishuv>
            <App />
          </Tanishuv>
          <Holat />
        </ProgressProvider>
      </Router>
    </XatoUshlagich>
  </StrictMode>
);
