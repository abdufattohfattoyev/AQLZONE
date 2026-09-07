/**
 * MASALANI ULASHISH — bo'limning tarqalish yo'li.
 *
 * ─────────────── NEGA AYNAN MASALA ───────────────
 *
 * Ilovadagi hamma narsa — dars, o'yin, duel — sinf guruhiga
 * tashlab bo'lmaydigan narsa: ular ilova ICHIDA ma'noga ega.
 * Masala esa o'zi tugallangan: shart, chizma va bitta savol.
 * Uni ko'chirib yuborsa ham odam tushunadi, ilovaga esa "buni
 * yechib ko'r" degan tabiiy sabab bilan keladi.
 *
 * ─────────────── HAVOLA ILOVANI O'ZIDA OCHADI ───────────────
 *
 * `t.me/<bot>?startapp=masala_12` — Telegram bu havolani bosgan
 * odamga Mini App'ni DARHOL ochadi va `masala_12` ni
 * `start_param` bo'lib beradi (`lib/qobiq.ts`). `BotdanKelgan`
 * uni ushlab, odamni to'g'ri o'sha masalaga olib boradi.
 *
 * Ya'ni yangi odam til, sinf va kurs tanlash zanjiridan
 * o'tmasdan, birinchi ekranda YECHADIGAN narsani ko'radi.
 *
 * Bot nomi bo'lmasa (server bermasa yoki oddiy brauzer bo'lsa)
 * — veb manzil ishlatiladi. U ham ishlaydi, faqat Telegram
 * ichida emas.
 */
import { botNomi } from "./api";
import { havolaniOch } from "./qobiq";
import { t } from "./matn";

/** `start_param` oldiga qo'yiladigan belgi. Duel kodlarida `_` yo'q. */
export const MASALA_BOSH = "masala_";

/**
 * Ro'yxatni ochadigan `start_param`.
 *
 * Kanal postidagi «Boshqa masalalar» tugmasi shu bilan keladi
 * (`backend/core/masala_kanal.py`). Duel kodi hech qachon shunday
 * bo'lmaydi: ular tasodifiy harf-raqam.
 */
export const ROYXAT_PARAM = "masalalar";

/** Ulashiladigan matnda masaladan nechta belgi ko'rsatiladi. */
const MATN_UZUNLIK = 140;

/** Manzil hash rejimida (`#/...`) yoki oddiy rejimda quriladi. */
function vebHavola(id: number): string {
  const asos = location.origin;
  return import.meta.env.VITE_ROUTER === "hash"
    ? `${asos}/#/masalalar/${id}`
    : `${asos}/masalalar/${id}`;
}

/**
 * Bitta masalaning ulashiladigan havolasi.
 *
 * `?startapp=` — havolani bosgan odam BIR bosishda o'sha masalada
 * turadi. Bu botda "Main Mini App" yoqilgan bo'lishini talab qiladi
 * (BotFather → Configure Mini App); yoqilmagan botda Telegram
 * `BOT_INVALID` deb javob beradi.
 *
 * Zaxira yo'l ham bor: bot `/start masala_<id>` ni tushunadi
 * (`backend/core/management/commands/bot.py`), ya'ni eski
 * havolalar ham ishlayveradi.
 */
export const masalaHavolasi = (bot: string, id: number): string =>
  bot
    ? `https://t.me/${encodeURIComponent(bot)}?startapp=${MASALA_BOSH}${id}`
    : vebHavola(id);

/**
 * Matnning boshi — guruhga tashlanganda ko'rinadigan qism.
 *
 * So'z o'rtasidan kesilmaydi: kesilgan joydan oldingi oxirgi
 * bo'sh joygacha qaytariladi. Aks holda "uchburchakn..." kabi
 * yarim so'z qolib, xabar tashlab qo'yilgandek ko'rinardi.
 */
export function qisqaMatn(matn: string, uzunlik = MATN_UZUNLIK): string {
  const bir = matn.replace(/\s+/g, " ").trim();
  if (bir.length <= uzunlik) return bir;
  const kesik = bir.slice(0, uzunlik);
  const bosh = kesik.lastIndexOf(" ");
  return `${(bosh > uzunlik * 0.6 ? kesik.slice(0, bosh) : kesik).trim()}…`;
}

/**
 * Telegram ulashish oynasini ochadi.
 *
 * Matn HAVOLA bilan birga ketadi: guruhda faqat havola turgan
 * xabar bosilmaydi — odam nima ekanini bilmaydi. Masalaning o'z
 * shartidan bir necha satr esa savolning o'zini ko'rsatadi.
 */
export async function masalaniUlash(id: number, matn: string): Promise<void> {
  const bot = await botNomi();
  const havola = masalaHavolasi(bot, id);
  const yozuv = `${t("masalaUlashMatn")}\n\n${qisqaMatn(matn)}`;
  havolaniOch(
    `https://t.me/share/url?url=${encodeURIComponent(havola)}`
    + `&text=${encodeURIComponent(yozuv)}`,
  );
}
