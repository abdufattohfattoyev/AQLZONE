/**
 * Ekran pastidagi ikkita xabar: internet uzilgani va yangi versiya.
 *
 * Ikkalasi ham ilovani TO'XTATMAYDI — bola o'ynayveradi. Internet
 * yo'qligi bu yerda ogohlantirish, xato emas: savollar qurilmada
 * yasaladi, progress esa keyin o'zi sinxronlanadi. Bolaga aynan shuni
 * aytamiz, aks holda u o'ynashdan to'xtaydi.
 */
import { useOffline } from "../lib/offline";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";

export function Holat() {
  const { tarmoq, yangiVersiya, yangila } = useOffline();

  if (tarmoq && !yangiVersiya) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-3">
      {!tarmoq && (
        <div className="az-kirish pointer-events-auto flex items-center gap-2 rounded-full bg-karta
                        px-4 py-2 text-[13px] shadow-clay-sm">
          <span className="size-2 shrink-0 rounded-full bg-brand-orange" />
          {t("internetYoq")}
        </div>
      )}

      {yangiVersiya && (
        <button
          type="button"
          onClick={yangila}
          className="az-kirish clay-press pointer-events-auto flex items-center gap-2 rounded-full
                     bg-brand-green px-4 py-2 text-[13px] text-white shadow-clay-sm"
        >
          <Icon name="repeat" size={16} />
          {t("yangiVersiya")}
        </button>
      )}
    </div>
  );
}
