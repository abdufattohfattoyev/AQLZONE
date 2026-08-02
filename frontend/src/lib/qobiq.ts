/**
 * QOBIQ — ilova qaysi sirtda ishlayotgani va shu sirtning o'ziga xosligi.
 *
 * Uch sirt bor va ular bitta dizaynni ko'rsatadi:
 *
 *   "veb"  oddiy brauzer (aql-zone.uz)
 *   "tg"   Telegram Mini App — botdagi tugma orqali
 *   "apk"  mobil ilova ichidagi WebView (`VITE_ROUTER=hash`)
 *
 * DIZAYN BO'LINMAYDI, QOBIQ BO'LINADI. Ranglar, shriftlar, maket va
 * navigatsiya tuzilishi hamma joyda bir xil: ota-ona botdan ochib, keyin
 * noutbukda saytga kirganda "bu o'sha ilovami, yulduzlarim shu yerdami?"
 * degan savol tug'ilmasligi kerak — aynan shu tashvishni yo'qotish uchun
 * serverda hisoblarni birlashtirish yozilgan.
 *
 * Farq qiladigan narsa — RAMKA. Telegram ichida allaqachon o'z sarlavhasi,
 * o'z orqaga tugmasi va o'z surish ishoralari bor; biz ularni takrorlab
 * qo'ysak, ilova "veb sayt Telegram'ga tiqilgan" bo'lib ko'rinadi. Shu
 * fayl o'sha takrorni yo'qotadi:
 *
 *   1. orqaga tugmasi — nativ (`useOrqaga`)
 *   2. sarlavha va fon rangi temaga moslashadi (`fonRangi`)
 *   3. balandlik `viewportStableHeight` dan olinadi (`--az-ekran`)
 *   4. xavfsiz chetlar Telegram'dan olinadi (`--az-tepa`, `--az-past`)
 *   5. pastga surish ilovani YOPMAYDI — dars o'rtasida bu halokat
 *   6. tashqi havola Telegram ichida ochiladi (`havolaniOch`)
 *   7. javob berilganda telefon tebranadi (`tebrat`)
 *
 * Hech biri majburiy emas: har bir chaqiruv himoyalangan va eski
 * Telegram mijozida (yoki oddiy brauzerda) shunchaki hech narsa qilmaydi.
 */
import { useEffect, useRef } from "react";

/* ------------------------------------------------ Telegram WebApp turi */

interface TgChet {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Telegram beradigan obyektning BIZ ISHLATADIGAN qismi.
 *
 * To'liq tur emas va ataylab: hamma maydon `?` bilan. Telegram mijozi
 * versiyaga qarab turlicha bo'ladi — 2019 yildagi telefonda `BackButton`
 * ham yo'q. Ixtiyoriy maydon bilan tekshiruv tabiiy chiqadi va eski
 * mijozda ilova jimgina avvalgidek ishlaydi.
 */
interface TgWebApp {
  initData?: string;
  initDataUnsafe?: { start_param?: string; user?: { id?: number } };
  version?: string;
  platform?: string;
  colorScheme?: "light" | "dark";
  viewportHeight?: number;
  viewportStableHeight?: number;
  safeAreaInset?: TgChet;
  contentSafeAreaInset?: TgChet;
  BackButton?: {
    show(): void;
    hide(): void;
    onClick(cb: () => void): void;
    offClick(cb: () => void): void;
  };
  HapticFeedback?: {
    impactOccurred(s: "light" | "medium" | "heavy" | "rigid" | "soft"): void;
    notificationOccurred(s: "error" | "success" | "warning"): void;
    selectionChanged(): void;
  };
  ready?(): void;
  expand?(): void;
  isVersionAtLeast?(v: string): boolean;
  setHeaderColor?(rang: string): void;
  setBackgroundColor?(rang: string): void;
  setBottomBarColor?(rang: string): void;
  openLink?(url: string): void;
  openTelegramLink?(url: string): void;
  disableVerticalSwipes?(): void;
  onEvent?(nom: string, cb: () => void): void;
  offEvent?(nom: string, cb: () => void): void;
}

/**
 * Telegram obyekti — YAGONA joyda.
 *
 * Ilgari u `lib/api.ts` ichida ham alohida yozilgan edi. Ikki nusxa
 * bo'lganda ular albatta bir-biridan qolib ketadi: bittasiga yangi
 * maydon qo'shiladi, ikkinchisi eski holida qoladi va nosozlik faqat
 * ishlab chiqarishda ko'rinadi.
 */
export const tgWebApp = (): TgWebApp | undefined =>
  (window as unknown as { Telegram?: { WebApp: TgWebApp } }).Telegram?.WebApp;

/**
 * Botdagi havoladan kelgan parametr (`t.me/<bot>?startapp=XXX`).
 *
 * Duel chaqiruvi shu yo'l bilan keladi: havola Telegram ichida
 * ochiladi, ilova esa kodni SHU YERDAN oladi va `/duel/<kod>` ga
 * o'tadi (`App.tsx`).
 *
 * UCHTA manba tekshiriladi va uchalasi ham kerak:
 *
 *   1. `initDataUnsafe.start_param` — Telegram beradigan asosiy yo'l,
 *      lekin u skript yuklanib bo'lgandan KEYIN paydo bo'ladi;
 *   2. manzil HASHI (`#tgWebAppStartParam=...`) — Telegram Mini App'ni
 *      aynan shunday ochadi va bu qiymat birinchi kadrdayoq turadi;
 *   3. oddiy so'rov qatori (`?tgWebAppStartParam=...`) — ba'zi
 *      mijozlarda shunday keladi.
 *
 * Ilgari faqat 1 va 3 tekshirilardi va chaqiruv havolasi jimgina bosh
 * sahifada ochilib qolardi: kod hashda edi.
 *
 * Qiymat tozalanadi: faqat harf, raqam, `-` va `_`. Boshqasi kelsa —
 * bo'sh satr. Bu qiymat manzilga qo'shiladi va tekshirilmasa ochiq
 * yo'naltirish teshigi bo'lib qolardi.
 */
export function boshParametri(): string {
  /** `?a=1&b=2` ko'rinishidagi satrdan bitta kalitni oladi. */
  const olib = (satr: string, kalit: string): string =>
    new URLSearchParams(satr).get(kalit) || "";

  /**
   * `tgWebAppData` ICHIDAN oladi.
   *
   * Telegram ko'p mijozda kodni alohida kalit qilib emas, imzolangan
   * `tgWebAppData` ning ichiga solib yuboradi:
   *
   *   #tgWebAppData=query_id%3D..%26start_param%3DKOD%26hash%3D..
   *
   * `URLSearchParams` tashqi qiymatni o'zi dekodlaydi, shuning uchun
   * uni ikkinchi marta so'rov satri sifatida o'qish yetarli.
   */
  const ichidan = (satr: string): string => {
    const ma = olib(satr, "tgWebAppData");
    return ma ? olib(ma, "start_param") : "";
  };

  let xom = "";
  try {
    const hash = location.hash.replace(/^#/, "");
    const soro = location.search.replace(/^\?/, "");
    xom =
      tgWebApp()?.initDataUnsafe?.start_param
      // Imzolangan satrning O'ZI — Telegram ichida eng ishonchli manba.
      || olib(tgWebApp()?.initData || "", "start_param")
      || ichidan(hash)
      || olib(hash, "tgWebAppStartParam")
      || ichidan(soro)
      || olib(soro, "tgWebAppStartParam")
      || "";
  } catch {
    return "";
  }
  return /^[A-Za-z0-9_-]{1,64}$/.test(xom) ? xom : "";
}

/** Telegram mijozi shu versiyani qo'llab-quvvatlaydimi. */
function versiyaBor(v: string): boolean {
  try {
    return Boolean(tgWebApp()?.isVersionAtLeast?.(v));
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------- sirt */

export type Qobiq = "veb" | "tg" | "apk";

/**
 * Ilova Telegram Mini App ichidami.
 *
 * Tekshiruv `initData` ga suyanadi, `window.Telegram` borligiga emas.
 * Sabab: skript `index.html` da har doim yuklanadi, ya'ni obyekt oddiy
 * brauzerda ham paydo bo'ladi — lekin ichi bo'sh. Imzolangan `initData`
 * esa faqat Telegram ichida beriladi.
 */
export const tgda = (): boolean => Boolean(tgWebApp()?.initData);

/**
 * Ayni paytda ekran oldida turgan Telegram foydalanuvchisining raqami.
 * Telegram tashqarisida — bo'sh satr.
 *
 * DIQQAT: bu qiymat `initDataUnsafe` dan olinadi va u IMZOLANMAGAN —
 * nomi ham shundan. Uni hech qachon "kim ekani"ning DALILI sifatida
 * ishlatib bo'lmaydi; kirish har doim imzolangan `initData` bilan
 * serverda tekshiriladi.
 *
 * Bu yerda u faqat KESH KALITI: "saqlangan token shu odamnikimi?"
 * degan savolga tez javob berish uchun. Qalbakilashtirilgan qiymat
 * ortiqcha bir marta qayta kirishga olib keladi, xolos — va u
 * kirish baribir serverda tasdiqlanadi.
 */
export function tgFoydalanuvchi(): string {
  try {
    const id = tgWebApp()?.initDataUnsafe?.user?.id;
    return id ? String(id) : "";
  } catch {
    return "";
  }
}

export const qobiq = (): Qobiq =>
  tgda() ? "tg" : (import.meta.env.VITE_ROUTER === "hash" ? "apk" : "veb");

/* ------------------------------------------------- o'lcham va ranglar */

/** CSS o'zgaruvchisini qo'yadi. Bo'sh qiymat — o'zgaruvchini olib tashlaydi. */
function css(nom: string, qiymat: string): void {
  const el = document.documentElement;
  if (qiymat) el.style.setProperty(nom, qiymat);
  else el.style.removeProperty(nom);
}

/**
 * Ekran balandligi va xavfsiz chetlarni Telegram'dan oladi.
 *
 * Nega `100dvh` yetmaydi. Telegram Desktop'da Mini App TOR VA PAST
 * oynada ochiladi, telefonda esa klaviatura chiqqanda ko'rinadigan
 * balandlik o'zgaradi — `dvh` bularning ikkalasini ham noto'g'ri
 * hisoblaydi va ekran pastidagi tugma ko'rinmay qoladi.
 * `viewportStableHeight` esa aynan "hozir ko'rinib turgan barqaror
 * balandlik" ni beradi.
 *
 * Chetlar (`safeAreaInset`) ham Telegram'dan olinadi. Ilgari body
 * `env(safe-area-inset-top)` ishlatardi va Mini App ichida bu QO'SHILIB
 * ketardi: Telegram o'z sarlavhasi bilan "notch" ni allaqachon yopgan,
 * biz esa ustiga yana bo'shliq qo'shib, mazmunni pastga surardik.
 */
function olchamlarniYangila(): void {
  const w = tgWebApp();
  if (!w) return;

  const b = w.viewportStableHeight || w.viewportHeight || 0;
  if (b > 0) css("--az-ekran", `${Math.round(b)}px`);

  // 8.0 dan boshlab Telegram chetlarni o'zi aytadi. Eski mijozda
  // o'zgaruvchi qo'yilmaydi va CSS `env()` zaxirasida qoladi.
  const chet = w.contentSafeAreaInset ?? w.safeAreaInset;
  if (chet) {
    css("--az-tepa", `${Math.max(0, Math.round(chet.top))}px`);
    css("--az-past", `${Math.max(0, Math.round(chet.bottom))}px`);
  } else {
    // Telegram sarlavhasi "notch" ni yopgan — tepadan qo'shimcha
    // bo'shliq kerak emas.
    css("--az-tepa", "0px");
  }
}

/**
 * Telegram sarlavhasi va fonini joriy temaga bo'yaydi.
 *
 * Busiz chok ko'rinadi: bizning fon quyoshli ko'k, Telegram sarlavhasi
 * esa o'zining kulrangida turadi va ikkisi orasida keskin chiziq paydo
 * bo'ladi — ilova "ramkaga tiqilgan" bo'lib ko'rinadi.
 *
 * Telegram FAQAT `#rrggbb` ni qabul qiladi. Tema o'zgaruvchisi esa
 * boshqa ko'rinishda bo'lishi mumkin, shuning uchun tekshiriladi va
 * mos kelmasa umuman yuborilmaydi — noto'g'ri qiymat Telegram'da
 * xatoga sabab bo'ladi.
 */
export function fonRangi(hex: string): void {
  const w = tgWebApp();
  if (!w || !tgda()) return;
  const rang = hex.trim();
  if (!/^#[0-9a-f]{6}$/i.test(rang)) return;
  try {
    if (versiyaBor("6.1")) w.setHeaderColor?.(rang);
    if (versiyaBor("6.1")) w.setBackgroundColor?.(rang);
    // Pastki chiziq — 7.10 dan. Pastdagi panelimiz shu yerda turadi.
    if (versiyaBor("7.10")) w.setBottomBarColor?.(rang);
  } catch {
    /* mijoz qo'llab-quvvatlamadi — rang o'zgarmaydi, ilova ishlayveradi */
  }
}

/** Joriy temaning fon rangini o'qib, Telegram'ga uzatadi. */
export function temaRanginiUzat(): void {
  if (!tgda()) return;
  const rang = getComputedStyle(document.documentElement)
    .getPropertyValue("--az-body")
    .trim();
  if (rang) fonRangi(rang);
}

/* ------------------------------------------------------ ishga tushirish */

/**
 * Qobiqni ulaydi — ilova ishga tushganda BIR MARTA chaqiriladi.
 *
 * `<html data-qobiq="...">` ham shu yerda qo'yiladi: CSS kelajakda
 * sirtga qarab bir-ikki tafsilotni o'zgartirishi mumkin bo'lsin
 * (masalan Telegram ichida o'z sarlavhamiz ustidagi bo'shliq).
 */
export function qobiqniUlash(): void {
  document.documentElement.dataset.qobiq = qobiq();

  const w = tgWebApp();
  if (!w || !tgda()) return;

  try {
    w.ready?.();
    w.expand?.();

    /**
     * Pastga surish ilovani YOPMASIN.
     *
     * Telegram'da vertikal surish Mini App'ni yopadi. Dars o'rtasida bu
     * halokat: bola javob tugmasini bosmoqchi bo'lib barmog'ini
     * sirg'antirsa, ilova yopiladi va u yechgan savollari yo'qolgandek
     * tuyuladi. 7.7 dan buni o'chirish mumkin.
     */
    if (versiyaBor("7.7")) w.disableVerticalSwipes?.();
  } catch {
    /* eski mijoz — quyidagi o'lchamlar baribir ishlaydi */
  }

  olchamlarniYangila();
  temaRanginiUzat();

  // Oyna o'lchami va chetlar o'zgarishini kuzatamiz: klaviatura chiqishi,
  // Desktop'da oynani cho'zish, telefonni burish — hammasi shu hodisalar.
  try {
    w.onEvent?.("viewportChanged", olchamlarniYangila);
    w.onEvent?.("safeAreaChanged", olchamlarniYangila);
    w.onEvent?.("contentSafeAreaChanged", olchamlarniYangila);
  } catch {
    /* hodisalar qo'llab-quvvatlanmadi — o'lcham bir marta o'lchandi */
  }
}

/* ------------------------------------------------------ orqaga tugmasi */

/**
 * Ortga qaytish — Telegram ichida NATIV tugma bilan.
 *
 * `true` qaytsa, ekran o'z strelkasini chizishi kerak; `false` qaytsa —
 * chizmasligi. Sabab: Mini App ichida Telegram allaqachon sarlavhada
 * `←` chizadi va biz yana bittasini qo'shsak, foydalanuvchi bir ekranda
 * IKKITA orqaga tugmasini ko'radi. Ikkisi bir ishni qiladi, lekin
 * odam har safar "qaysi biri to'g'ri?" deb o'ylaydi.
 *
 * Tugma komponent yo'qolganda yashiriladi — ya'ni bosh sahifada va
 * kurs sahifasida (u yerda qaytadigan joy yo'q) Telegram sarlavhasi
 * toza qoladi.
 */
export function useOrqaga(onBack: () => void, kerak = true): boolean {
  const nativ = tgda();

  /**
   * Chaqiruv `ref` da turadi va bu SHART.
   *
   * Ekranlar `onBack` ni joyida yozadi (`onBack={() => nav(...)}`), ya'ni
   * har renderda yangi funksiya keladi. Uni effekt bog'liqligiga qo'ysak,
   * tugma har renderda o'chirilib qayta ulanardi — Telegram'da bu
   * ko'rinadigan pirpirash beradi. Ref bilan esa effekt faqat sirt
   * o'zgarganda ishlaydi.
   */
  const chaqiruv = useRef(onBack);
  useEffect(() => { chaqiruv.current = onBack; }, [onBack]);

  useEffect(() => {
    if (!nativ || !kerak) return;
    const tugma = tgWebApp()?.BackButton;
    if (!tugma) return;

    const bosildi = () => chaqiruv.current();
    try {
      tugma.onClick(bosildi);
      tugma.show();
    } catch {
      return;
    }
    return () => {
      try {
        tugma.offClick(bosildi);
        tugma.hide();
      } catch {
        /* mijoz yopilyapti — ahamiyati yo'q */
      }
    };
  }, [nativ, kerak]);

  // Nativ tugma BO'LMASA o'zimizniki chiziladi. Eski Telegram mijozida
  // `BackButton` yo'q va o'shanda ekran umuman qaytib bo'lmaydigan
  // tuzoqqa aylanardi — shuning uchun tekshiruv obyektning o'ziga
  // qaraydi, `tgda()` ga emas.
  return !(nativ && Boolean(tgWebApp()?.BackButton));
}

/* ------------------------------------------------------------ havola */

/**
 * Tashqi havolani ochadi.
 *
 * Telegram ichida `window.open` brauzerni ochadi va odam ilovadan
 * BUTUNLAY chiqib ketadi — qaytib kelish uchun u botni qaytadan topishi
 * kerak. `openTelegramLink` esa kanalni Telegram'ning o'zida ochadi va
 * orqaga bosish ilovaga qaytaradi.
 */
export function havolaniOch(url: string): void {
  const w = tgWebApp();
  if (tgda() && w) {
    try {
      const tg = /^https?:\/\/t\.me\//i.test(url);
      if (tg && w.openTelegramLink) return w.openTelegramLink(url);
      if (w.openLink) return w.openLink(url);
    } catch {
      /* pastdagi oddiy yo'lga tushamiz */
    }
  }
  window.open(url, "_blank", "noopener");
}

/* ---------------------------------------------------------- tebranish */

/** Qanday tebranish: javob to'g'ri, xato, yutuq yoki oddiy tanlov. */
export type Tebranish = "togri" | "xato" | "yutuq" | "tanlov";

/**
 * Telefonni tebratadi — faqat Telegram ichida ishlaydi.
 *
 * Bu bezak emas: bolalar o'yinida javob bergandan keyingi jismoniy
 * javob taassurotni sezilarli kuchaytiradi va u OVOZDAN mustaqil.
 * Shuning uchun tebranish ovoz sozlamasiga bog'lanmagan — ovozi o'chiq
 * telefonda ham ishlaydi.
 *
 * Xato tebranishi ataylab boshqacha ("error"): bola ekranga qaramasdan
 * ham javobi to'g'rimi-yo'qmi bilib oladi.
 */
export function tebrat(tur: Tebranish): void {
  const h = tgWebApp()?.HapticFeedback;
  if (!tgda() || !h) return;
  try {
    if (tur === "togri") h.notificationOccurred("success");
    else if (tur === "xato") h.notificationOccurred("error");
    else if (tur === "yutuq") h.impactOccurred("heavy");
    else h.selectionChanged();
  } catch {
    /* mijoz qo'llab-quvvatlamadi — jimgina o'tamiz */
  }
}
