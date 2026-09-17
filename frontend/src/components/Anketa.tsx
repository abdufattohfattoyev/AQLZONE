/**
 * TANISHUV ANKETASI — ro'yxatdan o'tgandan keyin, bir marta.
 *
 * Har savol ALOHIDA ekranda va har biri bir bosish:
 *
 *   1. Siz kimsiz?       maktab o'quvchisi / talaba / ota-ona /
 *                        o'qituvchi / boshqa (kattalar)
 *   2. Bosqich           savol va javoblar birinchi javobga moslashadi
 *   3. Qayerdansiz?      viloyat
 *
 * ─────────────── FAQAT MAKTAB EMAS ───────────────
 *
 * Ilgari javoblar maktabga qaratilgan edi (o'quvchi, ota-ona, ustoz) va
 * ikkinchi savol har doim "qaysi sinf?" edi. Ilovaga esa talabalar,
 * o'quv markazi o'qituvchilari, matematika yoqadigan kattalar ham
 * keladi — ular noto'g'ri tugmani bosib, tahlilni buzardi.
 *
 * Endi ikkinchi savol kimligiga qarab:
 *
 *   o'quvchi    qaysi sinf (1–11)
 *   ota-ona     farzand nechanchi sinfda (maktabgacha ham bor)
 *   talaba      nechanchi kurs / magistratura
 *   o'qituvchi  qayerda: maktab (3 bosqich) / OTM / o'quv markazi
 *   kattalar    SO'RALMAYDI — ular uchun bosqich ma'nosiz
 *
 * Kodlar serverdagi `tahlil.BOSQICHLAR` bilan bir xil.
 *
 * Nega yozish maydoni yo'q: klaviatura ochilgan zahoti anketa "forma"
 * bo'lib qoladi va odam uni yopadi. "O'tkazib yuborish" har ekranda bor.
 */
import { useState } from "react";
import { sorov } from "../lib/api";
import { til } from "../lib/til";
import { t } from "../lib/matn";

type Kim = "oquvchi" | "talaba" | "ota_ona" | "ustoz" | "kattalar";

const VILOYATLAR: [string, string, string][] = [
  ["toshkent_sh", "Toshkent shahri", "г. Ташкент"],
  ["toshkent", "Toshkent viloyati", "Ташкентская обл."],
  ["andijon", "Andijon", "Андижан"],
  ["buxoro", "Buxoro", "Бухара"],
  ["fargona", "Farg'ona", "Фергана"],
  ["jizzax", "Jizzax", "Джизак"],
  ["xorazm", "Xorazm", "Хорезм"],
  ["namangan", "Namangan", "Наманган"],
  ["navoiy", "Navoiy", "Навои"],
  ["qashqadaryo", "Qashqadaryo", "Кашкадарья"],
  ["samarqand", "Samarqand", "Самарканд"],
  ["sirdaryo", "Sirdaryo", "Сырдарья"],
  ["surxondaryo", "Surxondaryo", "Сурхандарья"],
  ["qoraqalpogiston", "Qoraqalpog'iston", "Каракалпакстан"],
  ["chet_el", "Chet el", "Зарубежье"],
];

interface Javob { kim?: Kim; sinf?: number; viloyat?: string }

/** Ikkinchi savolning sarlavhasi va javoblari — kimligiga qarab. */
function bosqichSavol(kim: Kim | undefined): { savol: string; tanlov: [number, string][] } | null {
  const sinflar = (boshi: number): [number, string][] =>
    Array.from({ length: 12 - boshi }, (_, i) => [boshi + i, String(boshi + i)]);
  switch (kim) {
    case "kattalar":
      return null;
    case "talaba":
      return {
        savol: t("anketaKurs"),
        tanlov: [
          ...[1, 2, 3, 4].map((k): [number, string] => [100 + k, t("anketaKursN", { n: k })]),
          [105, t("anketaMagistr")],
        ],
      };
    case "ustoz":
      return {
        savol: t("anketaUstozJoy"),
        tanlov: [
          [130, t("anketaUstozBoshlangich")],
          [131, t("anketaUstozOrta")],
          [132, t("anketaUstozYuqori")],
          [120, t("anketaUstozOtm")],
          [121, t("anketaUstozMarkaz")],
        ],
      };
    case "ota_ona":
      return { savol: t("anketaSinfOta"), tanlov: [[0, t("anketaMaktabgacha")], ...sinflar(1)] };
    default:
      return { savol: t("anketaSinf"), tanlov: sinflar(1) };
  }
}

export function Anketa({ onTugadi }: { onTugadi: () => void }) {
  const [qadam, setQadam] = useState(1);
  const [javob, setJavob] = useState<Javob>({});

  const bosqich = bosqichSavol(javob.kim);
  /** Kattalarda ikkinchi savol yo'q — jami ikki qadam. */
  const jami = javob.kim === "kattalar" ? 2 : 3;
  /** Ekrandagi raqam: kattalarda viloyat "2 / 2" bo'lib ko'rinadi. */
  const korinadigan = javob.kim === "kattalar" && qadam === 3 ? 2 : qadam;

  const yubor = (j: Javob) => {
    // Javobni kutmaymiz: anketa kuzatuv, uning sekin interneti
    // odamni ilova eshigida ushlab turmasin.
    void sorov("/api/v1/anketa", j).catch(() => {});
    onTugadi();
  };

  const keyingi = (j: Javob) => {
    setJavob(j);
    if (qadam >= 3) { yubor(j); return; }
    // Kattalarga bosqich so'ralmaydi — to'g'ri viloyatga.
    setQadam(qadam === 1 && j.kim === "kattalar" ? 3 : qadam + 1);
  };

  const kimlar: [Kim, string][] = [
    ["oquvchi", t("anketaOquvchi")],
    ["talaba", t("anketaTalaba")],
    ["ota_ona", t("anketaOtaOna")],
    ["ustoz", t("anketaUstoz")],
    ["kattalar", t("anketaKattalar")],
  ];

  // Uzun yozuvli tanlovlar (o'qituvchi, talaba) bitta ustunda — "OTM"
  // yoki "o'quv markazi" uch ustunli setkaga sig'masdi.
  const uzunTanlov = javob.kim === "ustoz" || javob.kim === "talaba";

  return (
    <div className="mx-auto grid min-h-ekran w-full max-w-[430px] place-items-center px-4 py-8">
      <div className="az-kirish w-full rounded-clay bg-karta p-6 shadow-clay">
        <div className="flex items-center justify-between text-[12px] text-ink-dim">
          <span>{korinadigan} / {jami}</span>
          <button type="button" onClick={() => yubor(javob)} className="min-h-11 px-1">
            {t("anketaOtkaz")}
          </button>
        </div>

        {qadam === 1 && (
          <>
            <h1 className="mt-1 text-[22px] leading-tight">{t("anketaSarlavha")}</h1>
            <p className="mt-1 text-[13px] text-ink-dim">{t("anketaIzoh")}</p>
            <h2 className="mt-5 text-[16px]">{t("anketaKim")}</h2>
            <div className="mt-3 space-y-2">
              {kimlar.map(([kod, nom]) => (
                <button key={kod} type="button" onClick={() => keyingi({ ...javob, kim: kod })}
                  className="clay-press flex min-h-12 w-full items-center justify-center rounded-2xl
                             bg-sahna px-3 font-display text-[16px] shadow-ichki">
                  {nom}
                </button>
              ))}
            </div>
          </>
        )}

        {qadam === 2 && bosqich && (
          <>
            <h2 className="mt-1 text-[20px] leading-tight">{bosqich.savol}</h2>
            <div className={`mt-4 grid gap-2 ${uzunTanlov ? "grid-cols-1" : "grid-cols-3"}`}>
              {bosqich.tanlov.map(([kod, nom]) => (
                <button key={kod} type="button" onClick={() => keyingi({ ...javob, sinf: kod })}
                  className={`clay-press min-h-12 rounded-2xl bg-sahna px-3 font-display text-[15px]
                              shadow-ichki ${kod === 0 ? "col-span-3" : ""}`}>
                  {nom}
                </button>
              ))}
            </div>
          </>
        )}

        {qadam === 3 && (
          <>
            <h2 className="mt-1 text-[20px] leading-tight">{t("anketaViloyat")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {VILOYATLAR.map(([kod, uz, ru]) => (
                <button key={kod} type="button" onClick={() => keyingi({ ...javob, viloyat: kod })}
                  className="clay-press min-h-11 rounded-2xl bg-sahna px-2 py-2 text-[13.5px] leading-tight shadow-ichki">
                  {til() === "ru" ? ru : uz}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
