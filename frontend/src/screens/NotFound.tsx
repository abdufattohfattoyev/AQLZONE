import { Link } from "react-router-dom";
import { Icon } from "../lib/icons";
import { Logo } from "../components/Logo";
import { t } from "../lib/matn";

interface Props {
  /** Nima topilmadi — masalan `"7-sinf" kursi`. */
  nima?: string;
  /** Qayerga qaytish taklif qilinadi. Berilmasa — bosh sahifa. */
  qaytish?: { matn: string; yol: string };
}

export function NotFound({ nima, qaytish }: Props) {
  const orqaga = qaytish ?? { matn: t("kurslargaQaytish"), yol: "/" };
  return (
    <div className="grid min-h-ekran place-items-center px-6">
      <div className="w-full max-w-[360px] rounded-clay bg-karta p-8 text-center shadow-clay">
        <Logo size={64} className="mx-auto" />
        <h1 className="mt-4 text-[22px]">{t("topilmadi", { nima: nima ?? t("buSahifa") })}</h1>
        <p className="mt-1.5 text-[13.5px] leading-snug text-ink-soft">
          {t("topilmadiIzoh")}
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
