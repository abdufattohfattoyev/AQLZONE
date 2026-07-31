/**
 * Profil tanlash — bir qurilma, bir necha bola.
 *
 * Profil almashganda sahifa QAYTA YUKLANADI. Bu ataylab: progress
 * localStorage'da, xotirada va serverda bir vaqtda turadi, ularni
 * yugurib turgan ilovada birma-bir almashtirish esa albatta biror joyda
 * eski qiymat qoldiradi. Qayta yuklash — bir soniyalik narx, buning
 * evaziga ikki bolaning yulduzlari hech qachon aralashmaydi.
 *
 * Ekran faqat server bilan aloqa bo'lganda ma'noga ega (profillar u
 * yerda saqlanadi), shuning uchun aloqa yo'q bo'lsa buni ochiq aytamiz.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { Logo } from "../components/Logo";
import { joriyProfil, profilQosh, profillar, profilniTanla } from "../lib/api";
import type { Profil } from "../lib/api";
import { t } from "../lib/matn";
import { useOrqaga } from "../lib/qobiq";

interface Props {
  onBack: () => void;
}

export function Profillar({ onBack }: Props) {
  const [royxat, setRoyxat] = useState<Profil[] | null>(null);
  const [yuklandi, setYuklandi] = useState(false);
  const [yangiIsm, setYangiIsm] = useState("");
  const [band, setBand] = useState(false);

  const joriy = joriyProfil();
  const ozStrelka = useOrqaga(onBack);

  useEffect(() => {
    let bekor = false;
    profillar().then((p) => {
      if (bekor) return;
      setRoyxat(p);
      setYuklandi(true);
    });
    return () => { bekor = true; };
  }, []);

  function tanla(id: number) {
    if (String(id) === joriy) return onBack();
    profilniTanla(id);
    // Yuqoridagi izohga qarang — to'liq qayta yuklash eng ishonchli yo'l.
    window.location.reload();
  }

  async function qosh() {
    const ism = yangiIsm.trim();
    if (!ism || band) return;
    setBand(true);
    const p = await profilQosh(ism);
    setBand(false);
    if (!p) return;
    setYangiIsm("");
    setRoyxat((r) => (r ? [...r, p] : [p]));
  }

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-16">
      <div className="flex items-center gap-2">
        {/* Telegram Mini App ichida bu strelka CHIZILMAYDI: u yerda
            Telegram o'z sarlavhasida nativ `←` ni ko'rsatadi va ikkitasi
            bir ekranda turganda odam har safar "qaysi biri to'g'ri?" deb
            o'ylardi (`lib/qobiq.ts`). */}
        {ozStrelka && (
          <button type="button" onClick={onBack} title={t("ortga")}
            className="clay-press grid size-[38px] place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
      </div>

      <div className="az-kirish mt-4 text-center">
        <Logo size={64} className="mx-auto" />
        <h1 className="mt-3 text-[22px]">{t("kimOynayapti")}</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          {t("bolalarIzoh")}
        </p>
      </div>

      {yuklandi && royxat === null && (
        <div className="az-kirish mt-6 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <div className="text-[34px] leading-none">📶</div>
          <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">
            {t("profilAloqaYoq")}
          </p>
        </div>
      )}

      {royxat && (
        <>
          <div className="mt-6 space-y-3">
            {royxat.map((p, i) => {
              const shu = String(p.id) === joriy || (!joriy && i === 0);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => tanla(p.id)}
                  style={{ "--az-kech": `${i * 60}ms` } as React.CSSProperties}
                  className={`az-kirish tugma-3d flex w-full items-center gap-3.5 rounded-clay p-4
                    text-left shadow-clay-sm ${shu ? "bg-brand-green/15 ring-2 ring-brand-green" : "bg-karta"}`}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-track text-[26px]">
                    {p.avatar || "🦊"}
                  </span>
                  <span className="min-w-0 flex-1 font-display text-[16px]">
                    {p.ism || t("profilNomer", { n: i + 1 })}
                  </span>
                  {shu && <Icon name="check" size={20} className="shrink-0 text-brand-green-d" />}
                </button>
              );
            })}
          </div>

          {/* ---- yangi profil ---- */}
          <div className="az-kirish mt-5 rounded-clay bg-karta p-4 shadow-clay-sm">
            <div className="font-display text-[14px]">{t("yangiBola")}</div>
            <div className="mt-2.5 flex gap-2">
              <input
                value={yangiIsm}
                onChange={(e) => setYangiIsm(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") qosh(); }}
                maxLength={40}
                placeholder={t("joyBolaIsmi")}
                className="min-w-0 flex-1 rounded-2xl bg-track px-3.5 py-2.5 text-[15px]
                           text-ink outline-none placeholder:text-ink-dim"
              />
              <button
                type="button"
                onClick={qosh}
                disabled={!yangiIsm.trim() || band}
                className="clay-press shrink-0 rounded-2xl bg-brand-green px-4 py-2.5 font-display
                           text-[14px] text-white disabled:opacity-50"
              >
                {t("qoshish")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
