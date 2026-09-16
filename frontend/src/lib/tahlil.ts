/**
 * TAHLIL — foydalanuvchi qaysi ekranni ochdi va qaysi tugmani bosdi.
 *
 * Boshqaruv panelidagi "Tahlil" sahifasi shundan quriladi
 * (`backend/core/tahlil.py`): qaysi bo'limga ko'p kirishadi, qaysi
 * tugmani hech kim bosmaydi, kim eng faol va nimada.
 *
 * ─────────────── TUGMALARNI BELGILASH SHART EMAS ───────────────
 *
 * Bosishlar HUJJAT darajasida ushlanadi: bosilgan eng yaqin
 * `button` yoki `a` topiladi va uning nomi olinadi — `data-tahlil`,
 * bo'lmasa `aria-label`, bo'lmasa ko'rinadigan yozuvi. Ya'ni yangi
 * tugma qo'shilganda uni kuzatuvga ulashni eslash kerak emas.
 *
 * ─────────────── YIG'IB YUBORILADI ───────────────
 *
 * Har bosishga alohida so'rov telefon internetini yeydi. Hodisalar
 * navbatda turadi va har 15 soniyada yoki ilova fonga ketganda bitta
 * so'rov bilan jo'natiladi.
 *
 * ─────────────── QAYERDAN KELDI ───────────────
 *
 * Ilova har ochilganda BITTA `kirish` hodisasi yuboriladi va unda
 * manba bo'ladi: kanal posti, do'st ulashgan havola, bot eslatmasi...
 * Panel shundan "kanaldan kelganlar qoladimi yoki bitta masala yechib
 * ketadimi" degan savolga javob beradi.
 *
 * Xato YUTILADI: kuzatuvning yiqilishi bolaning ishiga ta'sir
 * qilmasligi kerak. Yuborilmagan navbat yo'qoladi — bu qabul qilingan
 * narx.
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isSignedIn, sorov } from "./api";
import { boshParametri, qobiq, tgda } from "./qobiq";

interface Hodisa {
  tur: "kirish" | "sahifa" | "bosish";
  yol: string;
  nom?: string;
  /** Qo'shilgan paytdagi vaqt — yuborishda "necha soniya oldin" ga aylanadi. */
  vaqt: number;
}

const YUBORISH_MS = 15_000;

/** Shu ochilishda kirish hodisasi yozildimi. */
let kirishBelgilandi = false;
const MAX_NAVBAT = 60;

let navbat: Hodisa[] = [];

/** Kanal posti havolasining oxiri (`backend/core/masala_kanal.py`). */
const KANAL_BELGI = "-k";

/** `masala_12-k` → `masala_12`. */
export const kanalBelgisiz = (kod: string): string =>
  kod.endsWith(KANAL_BELGI) ? kod.slice(0, -KANAL_BELGI.length) : kod;

/**
 * Sahifa ochilgan paytdagi `?manba=` — bot eslatmasi tugmasi qo'yadi.
 * Modul yuklanganda o'qiladi: marshrut almashgach so'rov qatori yo'qoladi.
 */
const URL_MANBA = (() => {
  try { return new URLSearchParams(location.search).get("manba") ?? ""; } catch { return ""; }
})();

/** Kirish qachon bo'lgani va birinchi ekran — yuborilguncha shu yerda. */
let kirish: { vaqt: number; yol: string } | null = null;

/**
 * Odam ilovaga QAYERDAN kirdi.
 *
 * Birinchi yuborishda aniqlanadi, ilova ochilganda EMAS: Telegram
 * skripti kechikib yuklanishi mumkin va o'shanda `start_param` hali
 * bo'sh bo'lib, kanaldan kelgan odam "to'g'ridan" deb yozilardi.
 */
function manbaniAniqla(): string {
  if (URL_MANBA === "eslatma") return "eslatma";
  const kod = boshParametri();
  if (kod) {
    if (kod.endsWith(KANAL_BELGI)) return "kanal";
    // Postdagi "Boshqa masalalar / testlar" tugmalari ham kanalniki.
    if (kod === "masalalar" || kod === "testlar") return "kanal";
    if (kod.startsWith("masala_") || kod.startsWith("test_")) return "ulashish";
    return "duel";
  }
  if (tgda()) return "telegram";
  return qobiq() === "apk" ? "ilova" : "sayt";
}

/**
 * Manzilni umumlashtiradi: `/masalalar/17` → `/masalalar/:id`.
 *
 * Aks holda har masala, har dars alohida "sahifa" bo'lib, panelda
 * yuzlab bir martalik qator paydo bo'lardi va "qaysi BO'LIM" degan
 * savolga javob yo'qolardi. Kurs nomi (`/kurs/5-sinf`) esa QOLADI:
 * qaysi sinf ko'p ochilishi aynan kerakli ma'lumot.
 */
export function yolniUmumlashtir(yol: string): string {
  return yol
    .split("?")[0]
    .replace(/\/kurs\/([^/]+)\/\d+\/\d+$/, "/kurs/$1/dars")
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .replace(/^\/(kirish|duel)\/[^/]+$/, "/$1/:kod")
    .slice(0, 80);
}

function qosh(h: Omit<Hodisa, "vaqt">) {
  if (navbat.length >= MAX_NAVBAT) return;
  navbat.push({ ...h, vaqt: Date.now() });
}

function yubor() {
  if (!navbat.length || !isSignedIn()) return;
  const hozir = Date.now();
  if (kirish) {
    navbat.unshift({ tur: "kirish", yol: kirish.yol, nom: manbaniAniqla(), vaqt: kirish.vaqt });
    kirish = null;
  }
  const tana = {
    hodisalar: navbat.map(({ vaqt, ...h }) => ({
      ...h, oldin: Math.round((hozir - vaqt) / 1000),
    })),
  };
  navbat = [];
  void sorov("/api/v1/hodisalar", tana).catch(() => {});
}

/**
 * Savol yechiladigan ekranlar. U yerda tugmalarning YOZUVI — javob
 * variantlari ("12", "x = 3") va ular tugma nomi emas: panelning
 * "tugmalar" ro'yxati minglab javoblar bilan to'lib ketardi. Bu
 * ekranlarda faqat nomi aniq berilgan boshqaruvlar yoziladi.
 */
const SAVOL_EKRANI = /^\/(kurs\/[^/]+\/(dars|sinov|daftar|testlar)|oyinlar\/.+|toplam\/|masalalar\/:id|kichkintoy\/)/;

/** Bosilgan elementning odam o'qiydigan nomi. */
function tugmaNomi(el: Element, yol: string): string {
  const aniq = el.getAttribute("data-tahlil") || el.getAttribute("aria-label")
    || el.getAttribute("title");
  const belgi = aniq || (SAVOL_EKRANI.test(yol) ? "" : (el as HTMLElement).innerText) || "";
  return belgi.replace(/\s+/g, " ").trim().slice(0, 48);
}

/**
 * Ilova darajasida BIR MARTA chaqiriladi (`App.tsx`).
 * Sahifa almashishini va hamma bosishlarni yozib boradi.
 */
export function useTahlil(): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const yol = yolniUmumlashtir(pathname);
    if (kirishBelgilandi) {
      qosh({ tur: "sahifa", yol });
      return;
    }
    // Birinchi ekran — kirishning "qo'nish joyi".
    //
    // Kanal havolasi bilan kelganda ilova AVVAL bosh sahifada ochiladi
    // va bir lahzadan keyin masalaga o'tadi (`BotdanKelgan`). O'sha
    // lahzalik "/" yozilsa, masala ochib chiqib ketgan odam "ikki ekran
    // ko'rdi" bo'lib, panelda "ichkariga kirdi" deb sanalardi. Shuning
    // uchun bosh sahifa qo'nish joyi bo'lsa, u KUTIB turadi: 3,5
    // soniyada odam hali ham shu yerda bo'lsa — haqiqatan shu yerga kelgan.
    kirishBelgilandi = true;
    const vaqt = Date.now();
    // Kirishning manzili UMUMLASHTIRILMAYDI (`/masalalar/17`, `:id`
    // emas): panel shundan "qaysi kanal posti nechta odam olib keldi"
    // ni sanaydi (`tahlil.kanal_statistikasi`).
    const asl = () => location.pathname.slice(0, 80);
    if (yol !== "/") {
      kirish = { vaqt, yol: asl() };
      qosh({ tur: "sahifa", yol });
      return;
    }
    const id = setTimeout(() => {
      if (kirish) return;
      kirish = { vaqt, yol: asl() };
      if (location.pathname === "/") qosh({ tur: "sahifa", yol: "/" });
    }, 3500);
    return () => {
      // Marshrut o'zgardi — ya'ni "/" o'tkinchi edi: kirish yangi ekranga.
      clearTimeout(id);
      if (!kirish) kirish = { vaqt, yol: asl() };
    };
  }, [pathname]);

  useEffect(() => {
    const bosildi = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("button, a, [role=button]");
      if (!el) return;
      const yol = yolniUmumlashtir(location.pathname);
      const nom = tugmaNomi(el, yol);
      if (nom) qosh({ tur: "bosish", yol, nom });
    };
    const fon = () => { if (document.hidden) yubor(); };

    // `capture` — tugma o'zi `stopPropagation` qilsa ham bosish yozilsin.
    document.addEventListener("click", bosildi, true);
    document.addEventListener("visibilitychange", fon);
    const id = setInterval(yubor, YUBORISH_MS);
    return () => {
      document.removeEventListener("click", bosildi, true);
      document.removeEventListener("visibilitychange", fon);
      clearInterval(id);
    };
  }, []);
}
