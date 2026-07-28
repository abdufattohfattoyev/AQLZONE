/**
 * Kirish ekrani — YAGONA yo'l: Telegram.
 *
 * Tugma Telegram Login Widget EMAS. Widget domenni BotFather'da ro'yxatga
 * olishni talab qiladi, o'z iframe'ini chizadi (uni tema bilan bo'yab
 * bo'lmaydi) va telefonda qo'shimcha oyna ochadi. Bu yerdagi yo'l soddaroq
 * va bot allaqachon mavjud bo'lgani uchun tekin:
 *
 *   1. tugma → t.me/<bot>?start=kirish
 *   2. bot «✅ Saytga kirish» havolasini yuboradi (bir martalik, 1 soat)
 *   3. havola → /kirish/<kod> → sayt o'zi kiradi
 *   4. ism-familiya so'raladi
 *
 * NEGA "QO'LDA KIRITISH" YO'Q. Ism-familiyani o'zi yozgan odam hech
 * narsani ISBOTLAMAYDI: uni boshqa qurilmada tiklab bo'lmaydi, reytingda
 * istalgan nom bilan ikkinchi hisob ochib olish mumkin va progress
 * brauzer tozalanishi bilan yo'qoladi. Telegram esa bularning uchalasini
 * ham bir bosishda hal qiladi.
 *
 * Bot nomi serverdan keladi (`/api/health`), shuning uchun botni
 * almashtirish uchun ilovani qayta yig'ish shart emas.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { Logo } from "./Logo";
import { botHavolasi, botNomi, miniAppda } from "../lib/api";

interface Props {
  /**
   * Sarlavha ostidagi qo'shimcha xabar — masalan havola eskirganda.
   * Bo'sh bo'lsa oddiy "Tizimga kirish" ko'rinishi chiqadi.
   */
  xabar?: string;
  /** Sarlavha ostidagi qator. Standart — "Tizimga kirish". */
  izoh?: string;
  /** Tugma matni. Standart — "Telegram bilan kirish". */
  tugma?: string;
  /**
   * Berilsa — pastda "Keyinroq" chiqadi va ekran MAJBURIY bo'lmay qoladi.
   *
   * Sinov rejimidagi taklif aynan shunday: odam kirmasdan ham o'ynashda
   * davom eta oladi. Chiqib bo'lmaydigan taklif — bu o'sha eski devor,
   * faqat boshqa joyga ko'chirilgani.
   */
  onKeyinroq?: () => void;
}

export function Kirish({ xabar, izoh, tugma, onKeyinroq }: Props) {
  const [bot, setBot] = useState<string | null>(null);
  // Mini App ichida tugma ko'rsatilmaydi: u odamni Telegram ichidan
  // yana Telegram'ga yuboradigan halqa bo'lardi. Bu yerga tushish
  // o'zi g'ayrioddiy holat — ichkarida kirish `initData` bilan
  // avtomatik bo'ladi — shuning uchun sabab boshqacha yoziladi.
  const ichkarida = miniAppda();

  useEffect(() => {
    if (ichkarida) return setBot("");
    let bekor = false;
    botNomi().then((b) => { if (!bekor) setBot(b); });
    return () => { bekor = true; };
  }, [ichkarida]);

  return (
    <div className="mx-auto grid min-h-dvh w-full max-w-[430px] place-items-center px-4 py-8">
      <div className="az-kirish w-full rounded-clay bg-karta p-6 text-center shadow-clay">
        <Logo size={64} className="mx-auto" />
        <h1 className="mt-3 text-[22px]">Aql Zone</h1>
        <p className="mt-1 text-[13.5px] text-ink-dim">{izoh || "Tizimga kirish"}</p>

        {xabar && (
          <p className="mt-4 rounded-2xl bg-track px-3 py-2.5 text-[12.5px]
                        leading-snug text-ink-soft">
            {xabar}
          </p>
        )}

        {/* Bot nomi kelgunicha tugma o'rnida bo'sh joy turadi — aks holda
            u paydo bo'lganda ekran sakrab ketardi. */}
        <div className="mt-5 min-h-[56px]">
          {bot === null ? (
            <div className="h-[56px] animate-pulse rounded-3xl bg-track" />
          ) : bot ? (
            <a
              href={botHavolasi(bot)}
              className="clay-press flex h-[56px] w-full items-center justify-center gap-3
                         rounded-3xl bg-brand-green font-display text-[16px] text-white"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white/25">
                <Icon name="send" size={16} />
              </span>
              {tugma || "Telegram bilan kirish"}
            </a>
          ) : ichkarida ? (
            <p className="px-2 text-[13px] leading-snug text-ink-soft">
              Telegram ma'lumoti kelmadi. Ilovani yopib, botdagi tugma
              orqali qaytadan oching.
            </p>
          ) : (
            <p className="px-2 text-[13px] leading-snug text-ink-soft">
              Telegram orqali kirish sozlanmagan. Iltimos, keyinroq urinib
              ko'ring.
            </p>
          )}
        </div>

        {bot ? (
          <p className="mt-3 px-2 text-[12px] leading-snug text-ink-dim">
            Botda «Saytga kirish» tugmasi chiqadi — uni bossangiz shu yerga
            qaytasiz va avtomatik kirasiz.
          </p>
        ) : null}

        {onKeyinroq && (
          <button type="button" onClick={onKeyinroq}
            className="mt-4 w-full py-2 text-[13px] text-ink-dim underline-offset-2 hover:underline">
            Keyinroq
          </button>
        )}
      </div>
    </div>
  );
}
