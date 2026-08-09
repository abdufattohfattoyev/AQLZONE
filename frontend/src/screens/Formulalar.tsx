/**
 * FORMULALAR VARAQASI.
 *
 * ─────────────── NEGA BO'LIMLAR YOPIQ TURADI ───────────────
 *
 * Ro'yxatda yetmishga yaqin formula bor. Hammasini bir vaqtda ochib
 * qo'ysak, kerakligini topish uchun uzoq aylantirish kerak bo'lardi —
 * va o'sha paytda odam qidiruvga o'tib ketardi, ya'ni ekranning butun
 * maqsadi yo'qqa chiqardi.
 *
 * O'ZINING sinfi ochiq, qolgani yopiq. Bu taxmin emas: 9-sinf
 * o'quvchisi trigonometriya va progressiyani har kuni ochadi, integral
 * esa unga hali kerak emas. Lekin QUYI sinflar ham ro'yxatda qoladi va
 * yopiq turadi — qisqa ko'paytirish formulasi 7-sinfniki, ammo undan
 * 11-sinfgacha so'raladi.
 *
 * ─────────────── QIDIRUV BOR ───────────────
 *
 * Bo'limni eslay olmagan odam uchun. Qidiruv NOM bo'yicha ham,
 * FORMULA bo'yicha ham ishlaydi: ba'zan odam "sin" deb yozadi,
 * "trigonometriya" deb emas.
 */
import { useMemo, useState } from "react";
import { Icon } from "../lib/icons";
import { FORMULALAR } from "../lib/formulalar";
import { t } from "../lib/matn";
import { til } from "../lib/til";
import { tebrat, useOrqaga } from "../lib/qobiq";

export function Formulalar({ sinf, onBack }: { sinf: number; onBack: () => void }) {
  const ozStrelka = useOrqaga(onBack);
  const ru = til() === "ru";

  // O'z sinfiniki boshdan ochiq. Bo'lim nomi kalit sifatida ishlatiladi:
  // ro'yxat qat'iy va indeks o'zgarmaydi, lekin nom o'qishga tushunarli.
  const [ochiq, setOchiq] = useState<Set<string>>(
    () => new Set(FORMULALAR.filter((b) => b.sinf === sinf).map((b) => b.nom)),
  );
  const [qidiruv, setQidiruv] = useState("");

  const q = qidiruv.trim().toLowerCase();

  /**
   * Qidiruv natijasi.
   *
   * Bo'sh so'rovda barcha bo'limlar o'z holicha qaytadi. So'rov
   * bo'lganda esa faqat mos yozuvlar qoladi va bo'lim O'ZI ochiladi —
   * qidirgan odamdan yana bir marta bosishni so'rash ma'nosiz.
   */
  const korinadigan = useMemo(() => {
    if (!q) return FORMULALAR.map((b) => ({ b, lar: b.lar }));
    return FORMULALAR
      .map((b) => ({
        b,
        lar: b.lar.filter((f) =>
          f.nom.toLowerCase().includes(q)
          || f.ru.toLowerCase().includes(q)
          || f.f.toLowerCase().includes(q)),
      }))
      .filter((x) => x.lar.length > 0
        || x.b.nom.toLowerCase().includes(q)
        || x.b.ru.toLowerCase().includes(q));
  }, [q]);

  const almashtir = (nom: string) => {
    setOchiq((s) => {
      const y = new Set(s);
      if (y.has(nom)) y.delete(nom);
      else y.add(nom);
      return y;
    });
    tebrat("tanlov");
  };

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-10">
      <div className="flex items-center gap-3">
        {ozStrelka && (
          <button type="button" onClick={onBack} title={t("ortga")}
            className="clay-press grid size-11 place-items-center rounded-2xl bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="font-display text-[18px]">{t("formulaSarlavha")}</h1>
      </div>

      <p className="mt-3 text-[12.5px] leading-snug text-ink-dim">{t("formulaIzoh")}</p>

      {/* Qidiruv. `type="search"` — telefonda klaviaturada tozalash
          tugmasi paydo bo'ladi va u qo'lda yasagan tugmadan qulayroq. */}
      <label className="mt-3 flex items-center gap-2 rounded-clay bg-karta px-3.5 py-2.5 shadow-clay-sm">
        <Icon name="search" size={17} className="shrink-0 text-ink-dim" />
        <input
          type="search"
          value={qidiruv}
          onChange={(e) => setQidiruv(e.target.value)}
          placeholder={t("formulaQidiruv")}
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-ink-dim"
        />
      </label>

      {korinadigan.length === 0 && (
        <p className="mt-8 text-center text-[13.5px] text-ink-dim">{t("formulaTopilmadi")}</p>
      )}

      <div className="mt-3 space-y-2.5">
        {korinadigan.map(({ b, lar }) => {
          // Qidiruv paytida bo'lim majburan ochiq: natijani yashirib
          // qo'yish qidiruvni ma'nosiz qilardi.
          const yoyilgan = q ? true : ochiq.has(b.nom);
          return (
            <div key={b.nom} className="overflow-hidden rounded-clay bg-karta shadow-clay-sm">
              <button type="button" onClick={() => !q && almashtir(b.nom)}
                className="flex w-full items-center gap-3 p-3.5 text-left">
                <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-track text-ink-soft">
                  <Icon name={b.ikon} size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[14px] leading-tight">
                    {ru ? b.ru : b.nom}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink-dim">
                    {t("formulaSinf", { n: b.sinf })} · {lar.length}
                  </span>
                </span>
                {!q && (
                  <Icon name="chevron" size={16}
                    className={`shrink-0 text-ink-dim transition-transform ${yoyilgan ? "rotate-90" : ""}`} />
                )}
              </button>

              {yoyilgan && (
                <div className="border-t border-track px-3.5 pt-1 pb-2">
                  {lar.map((f, i) => (
                    <div key={i} className="border-b border-track py-2 last:border-0">
                      <div className="text-[11.5px] leading-snug text-ink-dim">{ru ? f.ru : f.nom}</div>
                      {/* Formula kattaroq va qalinroq: ko'z aynan shu
                          qatorlar bo'ylab yuguradi, nom esa faqat
                          adashganda o'qiladi. Uzun formula kesilmasin —
                          gorizontal aylanadi. */}
                      <div className="mt-0.5 overflow-x-auto font-display text-[14.5px] leading-snug whitespace-nowrap">
                        {f.f}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
