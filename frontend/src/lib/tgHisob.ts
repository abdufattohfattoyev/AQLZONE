/**
 * "Bu odam Telegram hisobi bilan turibdimi" — bellashuv uchun hukm.
 *
 * ALOHIDA FAYL, chunki `api.ts` React'ni bilmaydi va bilmasligi ham
 * kerak (u APK va sinovlarda ham ishlatiladi), `qobiq.ts` esa `api.ts`
 * ga bog'lana olmaydi — teskari yo'nalishda bog'lanish allaqachon bor
 * va aylana import paydo bo'lardi.
 */
import { useEffect, useState } from "react";
import { telegramHisobmi } from "./api";
import { tgda } from "./qobiq";

export type TgHolat = "kutilmoqda" | "ha" | "yoq";

/**
 * Telegram skripti kechikib yuklansa `initData` qancha kutiladi.
 *
 * NEGA KUTISH KERAK. Ilova ochilishi bilan `window.Telegram` hali
 * bo'lmasligi mumkin — u tashqi skriptdan keladi. O'sha lahzada hukm
 * chiqarsak, HALI HISOBI YO'Q yangi odam (birinchi ochilish) anonim
 * hisob yasab ulguradi va "Telegram kerak" devoriga urilardi.
 *
 * Ikki yarim soniya edi, endi bir yarim: bu kutish endi FAQAT eng
 * yomon holat uchun. Hisobi bor odamda javob serverdan keladi va
 * `initData` umuman kerak bo'lmaydi.
 */
const KUT = 1500;

/**
 * Bellashuv ochilsin yoki yo'q.
 *
 * Uch holat, chunki "hali bilmayman" va "yo'q" — butunlay boshqa narsa:
 * birinchisida kutish belgisi, ikkinchisida kirish taklifi chiqadi.
 * Ikkisini qo'shib yuborsak, sekin internetda o'z hisobi bilan turgan
 * odam bir lahza "Telegram kerak" oynasini ko'rib qolardi.
 */
export function useTgHisob(): TgHolat {
  const [holat, setHolat] = useState<TgHolat>(() => (tgda() ? "ha" : "kutilmoqda"));

  useEffect(() => {
    if (holat !== "kutilmoqda") return;
    let bekor = false;

    // 1-qadam: `initData` kechikib kelishi mumkin — qisqa kutamiz.
    const boshlandi = Date.now();
    const id = setInterval(() => {
      if (bekor) return;
      if (tgda()) {
        clearInterval(id);
        setHolat("ha");
      } else if (Date.now() - boshlandi > KUT) {
        clearInterval(id);
        // 2-qadam: `initData` yo'q. Bu hali "Telegram emas" degani
        // EMAS — hisobning o'zidan so'raymiz.
        telegramHisobmi().then((ha) => { if (!bekor) setHolat(ha ? "ha" : "yoq"); });
      }
    }, 150);

    return () => { bekor = true; clearInterval(id); };
  }, [holat]);

  return holat;
}
