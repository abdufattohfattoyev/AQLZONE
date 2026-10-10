/**
 * O'QISH QOBIG'I — "O'qish" tabining umumiy tepasi (`manba/Oqish.dc.html`).
 *
 * Ilgari o'qishga oid narsalar to'rt joyga sochilgan edi: dars xaritasi
 * kurs ichida, testlar `/testlar` da, formulalar va xatolar daftari
 * kurs sahifasining pastida va menyuda. Endi hammasi bitta qobiq
 * ostida — sarlavha, sinf tanlagich, qidiruv va to'rt yorliq:
 *
 *   Darslar     `/kurs/:slug`             (screens/Home.tsx)
 *   Testlar     `/testlar`                (screens/OqishTestlar.tsx)
 *   Formulalar  `/kurs/:slug/formulalar`  (screens/Formulalar.tsx)
 *   Xatolar     `/kurs/:slug/xatolar`     (screens/OqishXatolar.tsx)
 *
 * Qobiq ekranlarni O'RAYDI, ularni qayta yozmaydi. Har yorliqning o'z
 * manzili bor: eski havolalar (`/kurs/3-sinf`) ochiladi va to'g'ri
 * yorliq yonadi. Yorliq almashishi tarixni ALMASHTIRADI (`replace`):
 * aks holda to'rt yorliqni aylangan odam orqaga tugmasini to'rt marta
 * bosib chiqardi.
 *
 * Testlar yorlig'i kursni manzildan emas, oxirgi ochilgan kursdan oladi
 * (`/testlar` eski manzil va unda kurs yo'q) — shuning uchun sinf
 * almashtirilganda oxirgi kurs ham yoziladi.
 */
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { COURSES } from "../lib/curriculum";
import type { Course } from "../lib/curriculum";
import { kursMatn } from "../lib/tarjima/kurs";
import { oxirginiYoz } from "../lib/oxirgi";
import { profilKurslari, useProfil } from "../lib/profil";
import { tebrat } from "../lib/qobiq";
import { yolFormulalar, yolKurs, yolMasalalar, yolQidiruv, yolTestSinf, yolXatolar } from "../lib/yollar";
import { Tanlov, TanlovVaraq } from "./Varaq";

export type OqishYorliq = "darslar" | "testlar" | "masalalar" | "formulalar" | "xatolar";

const YORLIQLAR: { id: OqishYorliq; kalit: Kalit }[] = [
  { id: "darslar", kalit: "tabDarslar" },
  { id: "testlar", kalit: "testlar" },
  // 2026-10-10: pastki paneldan shu yerga ko'chdi (panelda — AI ustoz).
  // Testlardan keyin: ikkalasi ham "yechish", formulalar esa ma'lumot.
  { id: "masalalar", kalit: "masalalar" },
  { id: "formulalar", kalit: "oqishFormulalar" },
  { id: "xatolar", kalit: "oqishXatolar" },
];

/** Yorliqning manzili — tanlangan kurs bilan. */
export function yorliqYoli(y: OqishYorliq, c: Course): string {
  if (y === "darslar") return yolKurs(c);
  if (y === "formulalar") return yolFormulalar(c);
  if (y === "xatolar") return yolXatolar(c);
  if (y === "masalalar") return yolMasalalar();
  return yolTestSinf();
}

/**
 * Tanlagichdagi qisqa nom: "3-sinf", "9-sinf Algebra", "Oliy matematika · 1-kurs".
 * "Matematika" so'zi tushiriladi — 1–6 va 11-sinfda fan bitta va u
 * tugmani faqat kengaytirardi.
 */
export function kursQisqa(c: Course): string {
  if (/^\d+-sinf Matematika$/.test(c.title)) return t("testSinfQisqa", { n: c.grade });
  return kursMatn(c.title);
}

export function OqishQobiq({ yorliq, kurs, children }: {
  yorliq: OqishYorliq;
  kurs: Course;
  children: ReactNode;
}) {
  const nav = useNavigate();
  const prof = useProfil();
  const [varaq, setVaraq] = useState(false);

  // Profilning o'z kurslari tepada — odam ko'pincha shularni qidiradi.
  const ozi = profilKurslari(prof);
  const qolgan = COURSES.filter((c) => !ozi.includes(c));

  const tanla = (c: Course) => {
    tebrat("tanlov");
    setVaraq(false);
    oxirginiYoz(c.slug);
    nav(yorliqYoli(yorliq, c), { replace: true });
  };

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-3
                    min-[360px]:px-[18px] sm:max-w-[560px] lg:max-w-[720px] kom:max-w-[860px] kom:px-8 kom:pt-8">
      <header className="flex min-h-12 items-center gap-2 min-[360px]:gap-2.5">
        <h1 className="min-w-0 flex-1 truncate font-display text-[23px] min-[360px]:text-[26px]">
          {t("tabOqish")}
        </h1>
        <button type="button" onClick={() => setVaraq(true)} data-tahlil="O'qish: sinf tanlagich"
          aria-haspopup="dialog"
          className="clay-press flex min-h-11 max-w-[55%] items-center gap-1.5 rounded-[14px] bg-karta px-3
                     font-display text-[15px] font-semibold shadow-clay-sm min-[360px]:px-3.5 min-[360px]:text-[16px]">
          <span className="truncate">{kursQisqa(kurs)}</span>
          <Icon name="chevron" size={16} className="shrink-0 rotate-90" />
        </button>
        <button type="button" onClick={() => nav(yolQidiruv())} aria-label={t("qidiruvNom")}
          data-tahlil="O'qish: qidiruv"
          className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
          <Icon name="search" size={20} />
        </button>
      </header>

      <OqishYorliqlar yorliq={yorliq} kurs={kurs} />

      {children}

      {varaq && (
        <TanlovVaraq sarlavha={t("oqishSinfTanlash")} onYop={() => setVaraq(false)}>
          {[...ozi, ...qolgan].map((c) => (
            <Tanlov key={c.slug} faol={c.slug === kurs.slug} on={() => tanla(c)}>
              {kursQisqa(c)}
            </Tanlov>
          ))}
        </TanlovVaraq>
      )}
    </div>
  );
}

/**
 * O'qish yorliqlari — Darslar · Testlar · Masalalar · Formulalar · Xatolar.
 *
 * Alohida komponent, chunki Masalalar sahifasi o'z sarlavhasi (sinf
 * tanlagichi, qidiruv) bilan turadi va `OqishQobiq` ga sig'maydi —
 * lekin yorliqlar qatori ikkalasida BIR XIL bo'lishi shart, aks holda
 * Masalalarga o'tgan odam "qayerga keldim?" deb qoladi.
 *
 * Beshta yorliq 320px ekranga teng bo'lib sig'maydi ("Formulalar"
 * kesilardi) — qator SURILADI va faol yorliq o'zi ko'rinishga keladi.
 */
export function OqishYorliqlar({ yorliq, kurs }: { yorliq: OqishYorliq; kurs: Course }) {
  const nav = useNavigate();
  const faolRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    faolRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [yorliq]);

  return (
    <nav aria-label={t("oqishBolimlar")} data-tur="yorliqlar"
      className="flex gap-1 overflow-x-auto rounded-2xl bg-track p-1 [scrollbar-width:none]
                 [&::-webkit-scrollbar]:hidden">
      {YORLIQLAR.map((y) => {
        const faol = y.id === yorliq;
        return (
          <button key={y.id} ref={faol ? faolRef : undefined} type="button"
            aria-current={faol ? "page" : undefined}
            data-tahlil={`O'qish: ${y.id}`}
            onClick={() => {
              if (faol) return;
              tebrat("tanlov");
              // Testlar va Masalalar manzilida kurs yo'q — u oxirgi kursdan olinadi.
              oxirginiYoz(kurs.slug);
              nav(yorliqYoli(y.id, kurs), { replace: true });
            }}
            className={`grid min-h-10 flex-1 shrink-0 place-items-center rounded-xl px-3 text-[13px]
                        whitespace-nowrap min-[360px]:text-[14px] ${
              faol ? "bg-karta font-bold text-brand-blue-t shadow-clay-sm" : "font-semibold text-ink-soft"}`}>
            {t(y.kalit)}
          </button>
        );
      })}
    </nav>
  );
}
