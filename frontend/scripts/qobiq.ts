/**
 * Qobiq qatlamining sinovi — Telegram ichidagi tarmoq (`lib/qobiq.ts`).
 *
 * NEGA SINOV KERAK. Bu kodning ustidan brauzerda yurib bo'lmaydi: Mini
 * App faqat imzolangan `initData` bilan ochiladi, ya'ni uni ochish uchun
 * haqiqiy bot, haqiqiy HTTPS manzil va haqiqiy Telegram mijozi kerak.
 * Natijada tarmoq ISHLAB CHIQARISHDA birinchi marta ishga tushadi va
 * u yerdagi xato jim o'tadi — hamma chaqiruv `try/catch` ichida.
 *
 * Shuning uchun soxta `window.Telegram.WebApp` yasaymiz va qaysi
 * chaqiruvlar ketganini yozib olamiz. Sinov `npm run tekshir` bilan
 * birga ishlaydi.
 */
type Chaqiruv = { usul: string; arg?: unknown };

const jurnal: Chaqiruv[] = [];
const yoz = (usul: string, arg?: unknown) => jurnal.push({ usul, arg });

const uslub = new Map<string, string>();
const dataset: Record<string, string> = {};

const tgWebApp = {
  initData: "user=%7B%22id%22%3A1%7D&hash=xxx",
  version: "8.0",
  viewportHeight: 640,
  viewportStableHeight: 604,
  contentSafeAreaInset: { top: 46, bottom: 12, left: 0, right: 0 },
  BackButton: {
    show: () => yoz("BackButton.show"),
    hide: () => yoz("BackButton.hide"),
    onClick: () => yoz("BackButton.onClick"),
    offClick: () => yoz("BackButton.offClick"),
  },
  HapticFeedback: {
    impactOccurred: (s: string) => yoz("impact", s),
    notificationOccurred: (s: string) => yoz("notification", s),
    selectionChanged: () => yoz("selection"),
  },
  ready: () => yoz("ready"),
  expand: () => yoz("expand"),
  isVersionAtLeast: (v: string) => parseFloat(v) <= 8.0,
  setHeaderColor: (c: string) => yoz("setHeaderColor", c),
  setBackgroundColor: (c: string) => yoz("setBackgroundColor", c),
  setBottomBarColor: (c: string) => yoz("setBottomBarColor", c),
  openLink: (u: string) => yoz("openLink", u),
  openTelegramLink: (u: string) => yoz("openTelegramLink", u),
  disableVerticalSwipes: () => yoz("disableVerticalSwipes"),
  onEvent: (n: string) => yoz("onEvent", n),
  offEvent: (n: string) => yoz("offEvent", n),
};

const g = globalThis as unknown as Record<string, unknown>;
g.window = {
  Telegram: { WebApp: tgWebApp },
  open: (u: string) => yoz("window.open", u),
};
g.document = {
  documentElement: {
    dataset,
    style: {
      setProperty: (n: string, v: string) => uslub.set(n, v),
      removeProperty: (n: string) => uslub.delete(n),
    },
  },
};
g.getComputedStyle = () => ({ getPropertyValue: () => "#0d1230" });

const Q = await import("../src/lib/qobiq.ts");

let xato = 0;
const tekshir = (nom: string, kutilgan: unknown, keldi: unknown) => {
  const ok = JSON.stringify(kutilgan) === JSON.stringify(keldi);
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— kutilgan ${JSON.stringify(kutilgan)}, keldi ${JSON.stringify(keldi)}`);
};

/* --------------------------------------------------------- sirt aniqlash */
tekshir("Telegram ichida ekanini aniqlaydi", true, Q.tgda());
tekshir("qobiq() → tg", "tg", Q.qobiq());

/* ------------------------------------------------------- ishga tushirish */
Q.qobiqniUlash();
const usullar = jurnal.map((c) => c.usul);
tekshir("data-qobiq qo'yiladi", "tg", dataset.qobiq);
tekshir("ready chaqirildi", true, usullar.includes("ready"));
tekshir("expand chaqirildi", true, usullar.includes("expand"));
tekshir("pastga surish o'chirildi", true, usullar.includes("disableVerticalSwipes"));
tekshir("viewportChanged kuzatiladi", true,
  jurnal.some((c) => c.usul === "onEvent" && c.arg === "viewportChanged"));

/* ------------------------------------------------ o'lcham va xavfsiz chet */
tekshir("--az-ekran = viewportStableHeight", "604px", uslub.get("--az-ekran"));
tekshir("--az-tepa Telegram'dan", "46px", uslub.get("--az-tepa"));
tekshir("--az-past Telegram'dan", "12px", uslub.get("--az-past"));

/* --------------------------------------------------------------- ranglar */
tekshir("sarlavha rangi temadan olindi", true,
  jurnal.some((c) => c.usul === "setHeaderColor" && c.arg === "#0d1230"));
tekshir("pastki chiziq ham bo'yaldi", true,
  jurnal.some((c) => c.usul === "setBottomBarColor" && c.arg === "#0d1230"));

jurnal.length = 0;
Q.fonRangi("#fff");
tekshir("qisqa hex RAD ETILADI", 0, jurnal.length);
Q.fonRangi("moviy");
tekshir("nom bilan berilgan rang rad etiladi", 0, jurnal.length);

/* --------------------------------------------------------------- havola */
jurnal.length = 0;
Q.havolaniOch("https://t.me/AqlZoneUz");
tekshir("t.me → openTelegramLink", "openTelegramLink", jurnal[0]?.usul);
jurnal.length = 0;
Q.havolaniOch("https://aql-zone.uz");
tekshir("boshqa manzil → openLink", "openLink", jurnal[0]?.usul);
tekshir("window.open ISHLATILMAYDI", false, jurnal.some((c) => c.usul === "window.open"));

/* ------------------------------------------------------------ tebranish */
jurnal.length = 0;
Q.tebrat("togri");
Q.tebrat("xato");
Q.tebrat("yutuq");
Q.tebrat("tanlov");
tekshir("tebranishlar to'g'ri turda", [
  { usul: "notification", arg: "success" },
  { usul: "notification", arg: "error" },
  { usul: "impact", arg: "heavy" },
  { usul: "selection" },
], jurnal);

console.log(xato === 0 ? "\n✅ qobiq: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
