/**
 * Service worker'ni ro'yxatdan o'tkazish va yangilanishni kuzatish.
 *
 * Yangi versiya chiqqanda uni ZO'RLAB o'rnatmaymiz: bola dars o'rtasida
 * bo'lishi mumkin va sahifaning to'satdan qayta yuklanishi javobini
 * yo'qotardi. O'rniga ilova "yangi versiya bor" deb aytadi, qaror bolaniki.
 */
import { useEffect, useState } from "react";

/** Ishlab chiqish rejimida SW keraksiz — u eski fayllarni ushlab qoladi. */
const YOQILGAN = import.meta.env.PROD && "serviceWorker" in navigator;

export function useOffline() {
  /** Navbatda turgan yangi versiya (bo'lsa). */
  const [yangi, setYangi] = useState<ServiceWorker | null>(null);
  const [tarmoq, setTarmoq] = useState(() => navigator.onLine);

  useEffect(() => {
    const on = () => setTarmoq(true);
    const off = () => setTarmoq(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!YOQILGAN) return;
    let bekor = false;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        if (bekor) return;

        // Allaqachon kutayotgan versiya bo'lishi mumkin (oldingi tashrifdan).
        if (reg.waiting) setYangi(reg.waiting);

        reg.addEventListener("updatefound", () => {
          const yangisi = reg.installing;
          if (!yangisi) return;
          yangisi.addEventListener("statechange", () => {
            // `controller` bor = bu birinchi o'rnatish emas, ya'ni haqiqiy
            // yangilanish. Birinchi o'rnatishda xabar ko'rsatish mantiqsiz.
            if (yangisi.state === "installed" && navigator.serviceWorker.controller) {
              setYangi(yangisi);
            }
          });
        });
      })
      .catch((e) => console.warn("service worker ro'yxatdan o'tmadi:", e));

    // Yangi SW boshqaruvni olgach sahifani bir marta qayta yuklaymiz.
    let yuklandi = false;
    const almashdi = () => {
      if (yuklandi) return;   // Chrome buni ikki marta chaqirishi mumkin
      yuklandi = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", almashdi);

    return () => {
      bekor = true;
      navigator.serviceWorker.removeEventListener("controllerchange", almashdi);
    };
  }, []);

  return {
    tarmoq,
    yangiVersiya: yangi !== null,
    yangila: () => yangi?.postMessage("SKIP_WAITING"),
  };
}
