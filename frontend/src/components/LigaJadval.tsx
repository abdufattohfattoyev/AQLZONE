/**
 * Haftalik liga jadvali.
 *
 * Umumiy reytingdan farqi bitta va u hal qiluvchi: bu yerda bola butun
 * saytdagi bolalar bilan emas, o'ziga TENG 20 tasi bilan yarishadi. 300
 * kishilik jadvalda 147-o'rin hech qanday his uyg'otmaydi — oldingi bilan
 * orasi yetib bo'lmas darajada uzoq. 20 kishilik guruhda esa uchinchi
 * o'rin bir darsda qo'lga kiradi.
 *
 * Shu sabab ekranda uch narsa doim ko'rinadi: qayerda turibsan, chegaraga
 * qancha qolgan, va hafta tugashiga qancha vaqt bor. Uchtasisiz jadval
 * shunchaki ro'yxatga aylanadi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { getLiga } from "../lib/api";
import type { Liga, LigaQator, LigaZona } from "../lib/api";
import { t } from "../lib/matn";

/**
 * Daraja nomi serverdan O'ZBEKCHA keladi (`core/liga.py`) va shu yerda
 * o'giriladi. Nega mijozda: nom keshlangan javobda ham, o'tgan hafta
 * xabarida ham uchraydi — serverga til yuborish bilan hal qilsak,
 * eski javoblar eski tilda qolib ketardi.
 */
const DARAJA: Record<string, Parameters<typeof t>[0]> = {
  Bronza: "darajaBronza",
  Kumush: "darajaKumush",
  Oltin: "darajaOltin",
  Olmos: "darajaOlmos",
  Toj: "darajaToj",
};

const darajaNomi = (nom: string): string => (DARAJA[nom] ? t(DARAJA[nom]) : nom);

/** O'tgan hafta natijasi ko'rsatilgani — bir marta ko'rsatiladi. */
const XABAR_KALIT = "az_liga_xabar";

const ZONA_USLUB: Record<LigaZona, string> = {
  kotariladi: "bg-brand-green/12",
  tushadi: "bg-brand-red/12",
  xavfsiz: "bg-karta",
  kutmoqda: "bg-karta",
};

export function LigaJadval() {
  const [ma, setMa] = useState<Liga | null>(null);
  const [yuklanyapti, setYuklanyapti] = useState(true);
  const [xabar, setXabar] = useState<Liga["otganHafta"]>(null);

  useEffect(() => {
    let bekor = false;
    getLiga().then((d) => {
      if (bekor) return;
      setMa(d);
      setYuklanyapti(false);
      // O'tgan hafta natijasi FAQAT bir marta chiqadi: har ochilishda
      // qayta ko'rsatilsa, u xushxabar bo'lishdan to'siqqa aylanadi.
      const o = d?.otganHafta;
      if (o && localStorage.getItem(XABAR_KALIT) !== o.hafta) setXabar(o);
    });
    return () => { bekor = true; };
  }, []);

  function xabarniYop() {
    if (xabar) localStorage.setItem(XABAR_KALIT, xabar.hafta);
    setXabar(null);
  }

  if (yuklanyapti) {
    return <p className="mt-8 text-center text-[13px] text-ink-dim">{t("yuklanyapti")}</p>;
  }

  if (ma === null) {
    return (
      <Karta emoji="📶">{t("ligaAloqaYoq")}</Karta>
    );
  }

  // Ismsiz hisob guruhga qo'shilmaydi: jadval "Noma'lum" qatorlar bilan
  // to'lib ketardi va hech kim uni ochmasdi.
  if (!ma.qatnashadi) {
    return (
      <Karta emoji="🏆">{t("ligaIsmKerak")}</Karta>
    );
  }

  const guruh = ma.guruh || [];
  const kotariladi = ma.kotariladi || 0;
  const tushadi = ma.tushadi || 0;
  // Tushish chegarasi qayerdan boshlanishi — birinchi qizil qator.
  const tushishBoshi = guruh.findIndex((q) => q.zona === "tushadi");

  return (
    <div>
      {xabar && (
        <div className={`az-kirish mt-4 flex items-start gap-3 rounded-clay p-4 shadow-clay-sm ${
          xabar.natija === "kotarildi" ? "bg-brand-green/15"
            : xabar.natija === "tushdi" ? "bg-brand-red/15" : "bg-karta"
        }`}>
          <span className="text-[28px] leading-none">
            {xabar.natija === "kotarildi" ? "🎉" : xabar.natija === "tushdi" ? "💪" : "👏"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[14.5px] leading-tight">
              {xabar.natija === "kotarildi"
                ? t("ligaKotarildi")
                : xabar.natija === "tushdi"
                  ? t("ligaTushdi")
                  : t("ligaYakunlandi")}
            </span>
            <span className="mt-1 block text-[12.5px] leading-snug text-ink-soft">
              {t("ligaXabarIzoh", {
                daraja: darajaNomi(xabar.daraja.nom),
                orin: xabar.orin,
                yulduz: xabar.yulduz,
              })}
            </span>
          </span>
          <button type="button" onClick={xabarniYop} title={t("yopish")}
            className="clay-press grid size-7 shrink-0 place-items-center rounded-full bg-karta text-ink-dim">
            <Icon name="times" size={14} />
          </button>
        </div>
      )}

      {/* ---- daraja zinasi ----
          Bola qayerda turganini va oldinda nima borligini BIR qarashda
          ko'rishi kerak: shu narsa keyingi darsga sabab bo'ladi. */}
      <div className="az-kirish mt-4 flex items-center justify-between gap-1 rounded-clay bg-karta p-2.5 shadow-clay-sm">
        {ma.darajalar.map((d) => {
          const joriy = d.nomer === ma.daraja?.nomer;
          const otilgan = d.nomer < (ma.daraja?.nomer ?? 0);
          return (
            <span key={d.nomer} title={darajaNomi(d.nom)}
              className={`grid flex-1 place-items-center rounded-2xl py-1.5 transition-colors ${
                joriy ? "bg-brand-gold/20 ring-2 ring-brand-gold" : ""
              }`}>
              <span className={`text-[19px] leading-none ${
                joriy ? "" : otilgan ? "opacity-55" : "opacity-25 grayscale"
              }`}>
                {d.emoji}
              </span>
              <span className={`mt-0.5 text-[9.5px] leading-none ${
                joriy ? "font-display text-ink" : "text-ink-dim"
              }`}>
                {darajaNomi(d.nom)}
              </span>
            </span>
          );
        })}
      </div>

      <p className="az-kirish mt-3 text-center text-[13px] leading-snug text-ink-soft">
        <span className="font-display text-ink">
          {t("ligaSarlavha", { daraja: darajaNomi(ma.daraja?.nom ?? "") })}
        </span>
        {" · "}{t("ligaBola", { n: guruh.length })}
        <br />
        {qolganVaqt(ma.hafta?.qolganSoat ?? 0)}
      </p>

      <ol className="mt-4 space-y-2">
        {guruh.map((q, i) => (
          <li key={`${q.orin}-${q.toliqIsm}-${i}`}>
            {/* Chegara chiziqlari qatorlar ORASIDA turadi: "shu yerdan
                yuqorisi ko'tariladi" degani jadvalning o'zida ko'rinadi. */}
            {i === kotariladi && kotariladi > 0 && (
              <Chegara rang="green" matn={t("ligaKotariladi", { n: kotariladi })} />
            )}
            {tushadi > 0 && i === tushishBoshi && (
              <Chegara rang="red" matn={t("ligaTushadi", { n: tushadi })} />
            )}
            <Qator q={q} kech={i * 35} />
          </li>
        ))}
      </ol>

      {guruh.every((q) => q.yulduz === 0) && (
        <p className="mt-4 text-center text-[12.5px] leading-snug text-ink-dim">
          {t("ligaBoshGuruh")}
        </p>
      )}

      <p className="mt-5 text-center text-[11.5px] leading-snug text-ink-dim">
        {t("ligaQoida")}
      </p>
    </div>
  );
}

/** "3 kun 5 soat qoldi" — serverdan kelgan soat bo'yicha. */
function qolganVaqt(soat: number): string {
  if (soat <= 0) return t("haftaYakunlanmoqda");
  if (soat < 24) return t("haftaSoat", { n: soat });
  const kun = Math.floor(soat / 24);
  const qoldiq = soat % 24;
  return t("haftaKun", {
    kun,
    soat: qoldiq ? t("haftaKunSoat", { n: qoldiq }) : "",
  });
}

function Chegara({ rang, matn }: { rang: "green" | "red"; matn: string }) {
  const uslub = rang === "green"
    ? "border-brand-green/45 text-brand-green-d"
    : "border-brand-red/50 text-brand-red";
  return (
    <div className={`mb-2 flex items-center gap-2 ${uslub}`}>
      <span className="h-0 flex-1 border-t-2 border-dashed border-inherit" />
      <span className="text-[10.5px] font-display leading-none">{matn}</span>
      <span className="h-0 flex-1 border-t-2 border-dashed border-inherit" />
    </div>
  );
}

function Qator({ q, kech }: { q: LigaQator; kech: number }) {
  return (
    <div
      className={`az-kirish flex items-center gap-3 rounded-clay p-3 shadow-clay-sm ${
        q.men ? "ring-2 ring-brand-green" : ""
      } ${ZONA_USLUB[q.zona]}`}
      style={{ "--az-kech": `${kech}ms` } as React.CSSProperties}
    >
      {/* Kenglik qat'iy: aks holda 1 va 20 turli joydan boshlanib, ustun
          tishli ko'rinardi. */}
      <span className="grid w-7 shrink-0 place-items-center font-display text-[15px] text-ink-dim">
        {q.orin}
      </span>

      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-track text-[21px]">
        {q.avatar || "🦊"}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[14.5px] leading-tight">
          {q.toliqIsm || t("nomalum")}
          {q.men && <span className="ml-1.5 text-[11.5px] text-brand-green-d">{t("siz")}</span>}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-ink-dim">
          {q.bola ? `${q.bola} · ` : ""}
          {q.yulduz ? t("darsSoni", { n: q.darslar }) : t("haliBoshlamadi")}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-track px-2.5 py-1.5">
        <Icon name="star" size={15} className="text-brand-gold" />
        <span className="font-display text-[14px]">{q.yulduz}</span>
      </span>
    </div>
  );
}

function Karta({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <div className="az-kirish mt-6 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
      <div className="text-[34px] leading-none">{emoji}</div>
      <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">{children}</p>
    </div>
  );
}
