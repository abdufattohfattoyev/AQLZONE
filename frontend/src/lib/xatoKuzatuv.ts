/**
 * Brauzerdagi xato — serverga, u yerdan administratorning Telegram'iga
 * (`backend/core/xato_kuzatuv.py`).
 *
 * Buningsiz bolaning telefonida yiqilgan ekran haqida hech kim bilmasdi:
 * bola shikoyat qilmaydi, u shunchaki ilovani boshqa ochmaydi.
 *
 * Uch manba: `window.onerror`, bajarilmay qolgan va'da
 * (`unhandledrejection`) va React'ning xato ushlagichi (`XatoUshlagich`).
 *
 * Bitta sahifada bir xil xato bir marta yuboriladi, jami esa `CHEGARA`
 * tadan oshmaydi: halqada yiqilayotgan komponent sekundiga yuzlab
 * so'rov yuborib, serverni o'zi "hujum" qilmasin. Serverda ham shunday
 * to'siq bor — bu yerdagisi faqat tarmoqni tejaydi.
 */

const CHEGARA = 10;
const yuborilgan = new Set<string>();

/* ─────────────── ESKI VERSIYA ───────────────
 *
 * Har joylashda fayl nomlari o'zgaradi (`Bosh-CHIjNPlg.js` → boshqa xesh)
 * va eskilari serverda qolmaydi. Ilovani oldinroq ochib qo'ygan odam
 * keyingi bo'limga o'tganda brauzer ESKI nomli bo'lakni so'raydi, u esa
 * yo'q: "Failed to fetch dynamically imported module". Bu kod xatosi
 * emas — yangi versiya chiqqan, xolos. To'g'ri javob: sahifani bir marta
 * yangilash (yangi `index.html` yangi nomlarni biladi). Adminga esa
 * yuborilmaydi — har joylashdan keyin kanal shu xabarlar bilan to'lardi.
 */
const ESKI_VERSIYA = /dynamically imported module|Importing a module script failed|Failed to load module script|Unable to preload CSS/i;
const YANGILANDI = "azapp_versiya_yangilandi";

export function eskiVersiyami(xato: unknown): boolean {
  const m = xato instanceof Error ? xato.message : String(xato ?? "");
  return ESKI_VERSIYA.test(m);
}

/**
 * Sahifani yangilaydi — lekin 30 soniyada ko'pi bilan bir marta: fayl
 * haqiqatan yo'q bo'lsa (server nosoz), cheksiz yangilanish halqasi bo'lmasin.
 * `true` — yangilanish boshlandi.
 */
export function yangiVersiyagaOt(): boolean {
  try {
    const oxirgi = Number(sessionStorage.getItem(YANGILANDI) || 0);
    if (Date.now() - oxirgi < 30_000) return false;
    sessionStorage.setItem(YANGILANDI, String(Date.now()));
  } catch {
    return false;                               // xotira yopiq — halqa xavfi, yangilamaymiz
  }
  window.location.reload();
  return true;
}

export function xatoniYubor(xato: unknown, qoshimcha = ""): void {
  try {
    if (eskiVersiyami(xato)) return;
    const e = xato instanceof Error ? xato : null;
    const matn = (e ? `${e.name}: ${e.message}` : String(xato)).slice(0, 300);
    if (!matn || yuborilgan.has(matn) || yuborilgan.size >= CHEGARA) return;
    yuborilgan.add(matn);

    const tana = JSON.stringify({
      matn,
      joy: location.pathname + location.hash,
      iz: `${e?.stack ?? ""}${qoshimcha ? `\n${qoshimcha}` : ""}`.slice(0, 2000),
    });
    // `sendBeacon` sahifa yopilayotganda ham yetib boradi; bo'lmasa fetch.
    const blob = new Blob([tana], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/v1/xato", blob)) {
      void fetch("/api/v1/xato", {
        method: "POST", body: tana, keepalive: true,
        headers: { "Content-Type": "application/json" },
      }).catch(() => {});
    }
  } catch {
    // Kuzatuvning o'zi hech qachon ilovani yiqitmasin.
  }
}

/**
 * Ishlab chiqishda o'chiq: dasturchi xatoni konsolda allaqachon ko'radi
 * va har saqlashdagi yarim yozilgan kod adminning Telegram'ini to'ldirardi.
 */
export function xatoKuzatuvniUlash(): void {
  if (import.meta.env.DEV) return;
  // Vite bo'lakni oldindan yuklay olmaganda shu hodisa keladi — eski versiya.
  window.addEventListener("vite:preloadError", () => { yangiVersiyagaOt(); });
  window.addEventListener("error", (ev) => {
    // Rasm yoki skript yuklanmagani (`ev.error` yo'q) — tarmoq, kod xatosi emas.
    if (ev.error) xatoniYubor(ev.error);
  });
  window.addEventListener("unhandledrejection", (ev) => {
    if (eskiVersiyami(ev.reason)) yangiVersiyagaOt();
    else xatoniYubor(ev.reason);
  });
}
