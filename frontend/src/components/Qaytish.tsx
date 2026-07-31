/**
 * Uzoq ko'rinmagan odamni kutib olish va uzilgan zanjirni tiklash.
 *
 * Ikkalasi bitta faylda, chunki ikkalasi ham BIR savolga javob beradi:
 * "qaytgan odam birinchi nima ko'radi?". Va ikkalasi ham bir joyda —
 * kurs sahifasining tepasida — turadi, ya'ni ular hech qachon birga
 * chiqmaydi (tiklash ko'pi bilan ikki kunlik uzilishda, kutib olish esa
 * yetti kundan keyin).
 *
 * NEGA KUTIB OLISH KERAK. Yigirma kundan keyin qaytgan bolani bo'sh
 * kunlik maqsad va nolga tushgan zanjir kutib olsa, u ikkinchi marta
 * ketadi — va endi qaytmaydi. Qaytish narxi past bo'lishi kerak: eng
 * avval "yulduzlaring joyida" deyish, keyin oson ish taklif qilish.
 */
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import type { TiklashTaklifi } from "../lib/zanjir";

/**
 * Zanjirni tiklash taklifi.
 *
 * Tanga yetmasa tugma o'chadi, lekin karta YASHIRILMAYDI: bola nimaga
 * intilishini ko'rib turishi kerak. Do'kondagi qimmat buyum ham xuddi
 * shunday xira turadi, ya'ni bu ko'rinish ilovada allaqachon tanish.
 */
export function ZanjirTiklash({ taklif, jamiTanga, onTikla }: {
  taklif: TiklashTaklifi;
  jamiTanga: number;
  onTikla: () => void;
}) {
  const yetadi = jamiTanga >= taklif.narx;

  return (
    <div className="az-kirish mt-3 flex items-center gap-3 rounded-clay bg-karta p-3.5
                    shadow-clay-sm ring-2 ring-brand-orange/45">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl
                       bg-brand-orange/15 text-brand-orange-d">
        <Icon name="flame" size={22} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-display text-[14.5px] leading-tight">
          {t("zanjirUzildi")}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-soft">
          {t("zanjirTiklaIzoh", { kunlar: taklif.kunlar })}
        </span>
      </span>

      <button
        type="button"
        disabled={!yetadi}
        onClick={() => { tebrat("yutuq"); onTikla(); }}
        className="clay-press flex shrink-0 items-center gap-1.5 rounded-3xl bg-brand-orange
                   px-3 py-2 font-display text-[12.5px] whitespace-nowrap text-white
                   disabled:opacity-45"
      >
        <Icon name="coin" size={15} />
        {yetadi
          ? t("zanjirTiklaTugma", { narx: taklif.narx })
          : t("zanjirTangaYoq", { bor: jamiTanga })}
      </button>
    </div>
  );
}

/** Uzoq ko'rinmagan odamga — yumshoq kutib olish. */
export function Qaytish({ kun }: { kun: number }) {
  return (
    <div className="az-kirish mt-3 flex items-center gap-3 rounded-clay bg-karta p-3.5 shadow-clay-sm">
      <span className="text-[26px] leading-none">👋</span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[14.5px] leading-tight">
          {t("qaytishSarlavha")}
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-soft">
          {t("qaytishIzoh", { n: kun })}
        </span>
      </span>
    </div>
  );
}
