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

export function xatoniYubor(xato: unknown, qoshimcha = ""): void {
  try {
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
  window.addEventListener("error", (ev) => {
    // Rasm yoki skript yuklanmagani (`ev.error` yo'q) — tarmoq, kod xatosi emas.
    if (ev.error) xatoniYubor(ev.error);
  });
  window.addEventListener("unhandledrejection", (ev) => xatoniYubor(ev.reason));
}
