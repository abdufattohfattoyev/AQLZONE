/**
 * Tangalar do'koni va Aqlni bezash.
 *
 * Ikki qism bitta ekranda ataylab: bola buyumni sotib olishi bilan uni
 * Aqlning ustida ko'radi. Alohida ekranlar bo'lsa, sotib olish va natija
 * o'rtasida bo'shliq paydo bo'lardi va mukofot hissi susayardi.
 *
 * DIQQAT: bezatiladigan qahramon — brend belgisi (`Logo`), ya'ni "Aql".
 * Ilgari bu ekran uni "tulki" deb atardi, holbuki tulki hech qachon
 * chizilmagan: ekranda ham shu yerda, ham o'git ekranida, ham bosh
 * sahifada har doim LOGO turgan. Ya'ni matn ekrandagi narsaga
 * mos kelmasdi va bola "tulki qani?" deb qidirardi.
 */
import { Icon } from "../lib/icons";
import { Logo } from "../components/Logo";
import { BUYUMLAR, buyumNomi, buyumTop } from "../lib/dokon";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";
import type { Progress } from "../lib/types";

interface Props {
  progress: Progress;
  onSotibOl: (id: string, narx: number) => boolean;
  onKiy: (id: string) => void;
  onBack: () => void;
}

export function Dokon({ progress, onSotibOl, onKiy, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);
  const olingan = progress.olingan ?? [];
  const kiygan = progress.kiygan ?? "";
  const kiyilgan = kiygan ? buyumTop(kiygan) : undefined;

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-16">
      <div className="flex items-center gap-2">
        {/* Telegram ichida strelka chizilmaydi — u yerda nativi bor
            (`lib/qobiq.ts`). Tanga hisobi `ml-auto` bilan o'ng chetda
            turadi, ya'ni strelka yo'qolganda ham joyidan siljimaydi. */}
        {ozStrelka && (
          <button type="button" onClick={onBack} title={t("ortga")}
            className="clay-press grid size-[38px] place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-karta px-3.5 py-1.5 text-[15px] shadow-clay-sm">
          <Icon name="coin" size={19} className="text-brand-orange-d" />
          {progress.coins}
        </div>
      </div>

      {/* ---- Aql va kiygan buyumi ---- */}
      <div className="az-kirish mt-5 flex flex-col items-center">
        <div className="relative">
          <Logo size={110} className="drop-shadow-[0_8px_16px_rgb(0_0_0/0.2)]" />
          {kiyilgan && (
            // Buyum Aqlning boshiga tushadi. Belgi emoji bo'lgani uchun
            // o'lchami shriftdan keladi.
            <span className="az-sakra pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2
                             text-[42px] leading-none">
              {kiyilgan.belgi}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-[22px]">{t("aqlniBezash")}</h1>
        <p className="mt-1 text-center text-[12.5px] text-ink-soft">
          {t("tangaIzoh")}
        </p>

        {kiygan && (
          <button type="button" onClick={() => onKiy("")}
            className="clay-press mt-2.5 rounded-full bg-track px-4 py-1.5 text-[12.5px] text-ink-soft">
            {t("buyumniYechish")}
          </button>
        )}
      </div>

      {/* ---- buyumlar ---- */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {BUYUMLAR.map((b) => {
          const bor = olingan.includes(b.id);
          const shu = kiygan === b.id;
          const yetadi = progress.coins >= b.narx;

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => (bor ? onKiy(shu ? "" : b.id) : onSotibOl(b.id, b.narx))}
              disabled={!bor && !yetadi}
              className={[
                "tugma-3d flex flex-col items-center gap-1.5 rounded-clay p-4 shadow-clay-sm",
                shu ? "bg-brand-green/20 ring-2 ring-brand-green" : "bg-karta",
                // Tanga yetmasa xira, lekin YASHIRILMAYDI — bola nimaga
                // intilishini ko'rib turishi kerak.
                !bor && !yetadi ? "opacity-50" : "",
              ].join(" ")}
            >
              <span className="text-[38px] leading-none">{b.belgi}</span>
              <span className="font-display text-[13.5px] leading-tight">{buyumNomi(b)}</span>

              {bor ? (
                <span className={`text-[12px] ${shu ? "text-brand-green-d" : "text-ink-dim"}`}>
                  {shu ? t("kiyilgan") : t("kiyish")}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[12.5px] text-ink-soft">
                  <Icon name="coin" size={14} className="text-brand-orange-d" />
                  {b.narx}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
