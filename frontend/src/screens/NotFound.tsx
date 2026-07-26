import { Link } from "react-router-dom";
import { Icon } from "../lib/icons";
import { Logo } from "../components/Logo";

interface Props {
  /** Nima topilmadi — masalan `"7-sinf" kursi`. */
  nima?: string;
  /** Qayerga qaytish taklif qilinadi. Berilmasa — bosh sahifa. */
  qaytish?: { matn: string; yol: string };
}

export function NotFound({ nima = "Bu sahifa", qaytish }: Props) {
  const orqaga = qaytish ?? { matn: "Kurslarga qaytish", yol: "/" };
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-[360px] rounded-clay bg-karta p-8 text-center shadow-clay">
        <Logo size={64} className="mx-auto" />
        <h1 className="mt-4 text-[22px]">{nima} topilmadi</h1>
        <p className="mt-1.5 text-[13.5px] leading-snug text-ink-soft">
          Manzil noto'g'ri bo'lishi mumkin. Quyidagi tugma orqali davom eting.
        </p>
        <Link
          to={orqaga.yol}
          className="clay-press mt-6 flex items-center justify-center gap-2 rounded-3xl bg-brand-green py-3.5
                     font-display text-lg text-white shadow-[0_6px_0_var(--color-brand-green-d)]"
        >
          <Icon name="home" size={20} />
          {orqaga.matn}
        </Link>
      </div>
    </div>
  );
}
