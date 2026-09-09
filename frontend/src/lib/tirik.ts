/**
 * "MEN SHU YERDAMAN" — ilova ochiq turganini serverga bildirish.
 *
 * ─────────────────── NEGA KERAK ───────────────────
 *
 * Duel ekranidagi "kim hozir onlayn" ro'yxati `Session.last_seen`
 * ga qarab quriladi, u esa faqat SO'ROV kelganda yangilanadi.
 * Ya'ni ilovani ochib, hech narsa bosmay o'tirgan bola o'n besh
 * daqiqadan keyin "onlayn emas" bo'lib qolardi — holbuki u ekranga
 * qarab turibdi va aynan uni chaqirish kerak edi.
 *
 * Bola darsni o'qib o'tirgan, masalani o'ylayotgan yoki menyuni
 * ochib qo'ygan payt — bularning hammasi so'rovsiz o'tadi.
 *
 * ─────────────── ILOVA DARAJASIDA, EKRANDA EMAS ───────────────
 *
 * Signal butun ilova uchun bir joyda (`App.tsx`) urib turadi, har
 * ekranda alohida emas. Sabab oddiy: "onlayn" degani "ilova ochiq"
 * degani, "duel ekranida turibdi" degani emas — aks holda ro'yxatda
 * faqat duel ekranidagilar ko'rinardi va ular allaqachon raqib
 * qidirayotgan bir-ikki kishi bo'lardi.
 *
 * ─────────────── FONDA URILMAYDI ───────────────
 *
 * Telefon cho'ntakda, ilova fonda turganda signal to'xtaydi va
 * qaytilganda DARHOL uriladi. Fondagi ilova "onlayn" emas: unga
 * yuborilgan chaqiruv javobsiz qolardi va chaqirgan odam kutib
 * o'tirardi.
 */
import { useEffect } from "react";
import { tirikman } from "./api";

/**
 * Ikki signal orasidagi vaqt.
 *
 * Serverdagi `last_seen` baribir 120 soniyada bir yoziladi
 * (`auth.BearerTokenAuthentication`), ya'ni bundan tez-tez urishning
 * ma'nosi yo'q — yozuv baribir o'tkazib yuboriladi. Bir daqiqa esa
 * o'sha oraliqdan xavfsiz tarzda kichik.
 */
const ORALIQ_MS = 60_000;

/** Ilova ochiq ekan, serverga vaqti-vaqti bilan signal yuboradi. */
export function useTirik(): void {
  useEffect(() => {
    const ur = () => { if (!document.hidden) void tirikman(); };

    ur();
    const soat = setInterval(ur, ORALIQ_MS);
    document.addEventListener("visibilitychange", ur);
    return () => {
      clearInterval(soat);
      document.removeEventListener("visibilitychange", ur);
    };
  }, []);
}
