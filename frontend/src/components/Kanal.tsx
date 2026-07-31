/**
 * "Telegram kanalimizga qo'shiling" oynasi.
 *
 * Ilova ochilgandan bir necha soniya keyin chiqadi. Kechikish ATAYLAB:
 * birinchi ekranda darrov reklama ko'rsatish — bola darsga kirmasidan
 * turib uni to'sish demak. Bir necha soniya odamga ilovani ko'rishga
 * ulguradi va oyna "shu ilovaning bir qismi" bo'lib qabul qilinadi.
 *
 * Uch shart bir vaqtda bajarilsagina ko'rinadi:
 *
 *   1. Server "bu odam kanalda yo'q" deydi (`/api/v1/kanal`). A'zoga
 *      ko'rsatilsa oyna reklama emas, bezorilik bo'lardi.
 *   2. Yaqinda "Keyinroq" bosilmagan. Rad javob HURMAT QILINADI —
 *      har ochilishda qayta so'rash obuna qaytarmaydi, ilovadan
 *      bezdiradi va odam uni butunlay yopib qo'yadi.
 *   3. Ekranda dars ochiq emas. Savol yechayotgan bolani to'xtatish
 *      eng yomon payt: u javobni unutadi va xato qiladi.
 *
 * Odam "Telegramda ochish" ni bossa, kanal yangi oynada ochiladi va
 * ilovaga qaytganda A'ZOLIK QAYTA TEKSHIRILADI: qo'shilgan bo'lsa oyna
 * boshqa hech qachon chiqmaydi.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "../lib/icons";
import { getKanal } from "../lib/api";
import { havolaniOch } from "../lib/qobiq";
import { t } from "../lib/matn";

/** Oyna ilova ochilgandan qancha vaqt o'tib chiqadi (ms). */
const KECHIKISH = 2500;

/** "Keyinroq" bosilgach shuncha kun so'ralmaydi. */
const TINCHLIK_KUN = 3;

const KEYINROQ_KEY = "az_kanal_keyinroq";

/** Ochiq dars — savol yechilayotgan payt. Bunda oyna chiqmaydi. */
const darsdami = (yol: string): boolean => /^\/kurs\/[^/]+\/[^/]+\/[^/]+/.test(yol);

function tinchlikdami(): boolean {
  const x = Number(localStorage.getItem(KEYINROQ_KEY));
  if (!Number.isFinite(x) || !x) return false;
  return Date.now() - x < TINCHLIK_KUN * 24 * 3600 * 1000;
}

export function Kanal() {
  const [holat, setHolat] = useState<{ kanal: string; havola: string } | null>(null);
  const [ochiq, setOchiq] = useState(false);
  const { pathname } = useLocation();

  // Bir marta so'raymiz. `pathname` o'zgarganda qayta so'ralmasligi
  // kerak — har ekran almashganda Telegram'ga so'rov ketardi.
  const sorabBolindi = useRef(false);

  const tekshir = useCallback(async () => {
    const h = await getKanal();
    if (!h || !h.korsat || !h.havola) return false;
    setHolat({ kanal: h.kanal, havola: h.havola });
    return true;
  }, []);

  useEffect(() => {
    if (tinchlikdami()) return;

    // Bayroq TAYMER ICHIDA qo'yiladi, effekt boshida emas. React qat'iy
    // rejimda (dev) effektni ikki marta ishga tushiradi va oradagi
    // tozalash taymerni bekor qiladi — bayroq tashqarida bo'lsa ikkinchi
    // chaqiruv "so'ralib bo'lgan" deb qaytib ketardi va oyna hech qachon
    // chiqmasdi. Bu yerda ikkinchi taymer qayta qo'yiladi, so'rov esa
    // baribir bir marta ketadi.
    const t = setTimeout(() => {
      if (sorabBolindi.current) return;
      sorabBolindi.current = true;
      void tekshir();
    }, KECHIKISH);
    return () => clearTimeout(t);
  }, [tekshir]);

  // Ma'lumot keldi — endi qulay paytni kutamiz. Dars ochiq bo'lsa oyna
  // dars tugaguncha kutib turadi, keyin o'zi chiqadi.
  useEffect(() => {
    if (!holat || ochiq) return;
    if (darsdami(pathname)) return;
    setOchiq(true);
  }, [holat, ochiq, pathname]);

  const yop = (keyinroq: boolean) => {
    setOchiq(false);
    setHolat(null);
    if (keyinroq) {
      try { localStorage.setItem(KEYINROQ_KEY, String(Date.now())); } catch { /* xotira to'lgan */ }
    }
  };

  const och = () => {
    // Telegram ichida kanal TELEGRAM'NING O'ZIDA ochiladi. `window.open`
    // u yerda brauzerni ochadi va odam ilovadan butunlay chiqib ketadi —
    // qaytish uchun u botni qaytadan topishi kerak bo'lardi.
    havolaniOch(holat!.havola);
    setOchiq(false);
    // Odam qaytganda a'zoligini qayta so'raymiz: qo'shilgan bo'lsa
    // server buni eslab qoladi va oyna boshqa chiqmaydi. Qo'shilmagan
    // bo'lsa ham hozir qaytarib ko'rsatmaymiz — "keyinroq" deb belgilaymiz.
    try { localStorage.setItem(KEYINROQ_KEY, String(Date.now())); } catch { /* mayli */ }
    const qaytdi = () => {
      window.removeEventListener("focus", qaytdi);
      setTimeout(() => { void getKanal(); }, 1200);
    };
    window.addEventListener("focus", qaytdi);
  };

  if (!ochiq || !holat) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/45 p-4
                 backdrop-blur-[2px] az-kanal-fon"
      role="dialog"
      aria-modal="true"
      aria-labelledby="az-kanal-sarlavha"
      // Fonga bosilsa yopiladi, lekin "keyinroq" deb hisoblanadi:
      // e'tiborsiz qoldirish ham rad javobning bir turi.
      onClick={() => yop(true)}
    >
      <div
        className="az-kanal w-full max-w-[380px] rounded-clay bg-karta p-6 text-center shadow-clay"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => yop(true)}
          aria-label={t("yopish")}
          className="clay-press float-right -mr-1 -mt-1 grid size-8 place-items-center
                     rounded-full text-ink-dim hover:bg-track"
        >
          <Icon name="times" size={16} />
        </button>

        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand-blue text-white
                         shadow-[0_8px_0_var(--color-brand-blue-d)]">
          <Icon name="send" size={30} />
        </span>

        <h2 id="az-kanal-sarlavha" className="mt-4 font-display text-[21px] leading-tight">
          {t("kanalSarlavha")}
        </h2>
        <p className="mt-1.5 text-[13.5px] leading-snug text-ink-dim">
          {t("kanalIzoh")}
        </p>

        <ul className="mt-5 space-y-3 text-left">
          <Qator belgi="📚" bosh={t("kanal1")}>{t("kanal1Izoh")}</Qator>
          <Qator belgi="🎯" bosh={t("kanal2")}>{t("kanal2Izoh")}</Qator>
          <Qator belgi="🏆" bosh={t("kanal3")}>{t("kanal3Izoh")}</Qator>
          <Qator belgi="🔔" bosh={t("kanal4")}>{t("kanal4Izoh")}</Qator>
        </ul>

        <button
          type="button"
          onClick={och}
          className="clay-press mt-6 flex h-[54px] w-full items-center justify-center gap-2.5
                     rounded-3xl bg-brand-blue font-display text-[16px] text-white"
        >
          <span className="grid size-7 place-items-center rounded-full bg-white/25">
            <Icon name="send" size={15} />
          </span>
          {t("kanalOchish")}
        </button>

        <button
          type="button"
          onClick={() => yop(true)}
          className="mt-3 w-full py-1.5 text-[13.5px] font-semibold text-ink-dim"
        >
          {t("keyinroq")}
        </button>
      </div>
    </div>
  );
}

function Qator({ belgi, bosh, children }: { belgi: string; bosh: string; children: string }) {
  return (
    <li className="flex gap-3">
      <span className="text-[19px] leading-none" aria-hidden>{belgi}</span>
      <span className="text-[13.5px] leading-snug">
        <b className="font-semibold">{bosh}</b>
        <span className="text-ink-dim"> — {children}</span>
      </span>
    </li>
  );
}
