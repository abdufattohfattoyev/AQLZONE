/**
 * TANISHUV ANKETASI — ilovaga kirgan HAR BIR odamga, bir marta.
 *
 * Har savol ALOHIDA ekranda va har biri bir bosish:
 *
 *   1. Siz kimsiz?       maktab o'quvchisi / talaba / abituriyent /
 *                        ota-ona / o'qituvchi / boshqa
 *   2. Bosqich           savol va javoblar birinchi javobga moslashadi
 *   3. Qayerdansiz?      viloyat
 *
 * Ikkinchi savol kimligiga qarab:
 *
 *   o'quvchi    qaysi sinf (1–11)
 *   ota-ona     farzand nechanchi sinfda (maktabgacha ham bor)
 *   talaba      nechanchi kurs / magistratura
 *   abituriyent SO'RALMAYDI — unga DTM kerak, sinf ham, kurs ham emas
 *   o'qituvchi  qayerda: maktab (3 bosqich) / OTM / o'quv markazi
 *   boshqa      qaysi daraja: maktab matematikasi yoki universitet
 *
 * Kodlar serverdagi `tahlil.BOSQICHLAR` bilan bir xil.
 *
 * Nega yozish maydoni yo'q: klaviatura ochilgan zahoti anketa "forma"
 * bo'lib qoladi va odam uni yopadi.
 *
 * ─────────────── ENDI HAMMAGA VA MAJBURIY ───────────────
 *
 * Ilgari anketa faqat ro'yxatdan o'tganga chiqardi, har savolda
 * "o'tkazib yuborish" bor edi va uni 12% odam to'ldirardi. Ilova esa
 * kimga gapirayotganini bilmay, talabaga ham "1-sinf" ni ko'rsatardi.
 * Endi birinchi ikki savol (kim va bosqich) HAMMAGA va o'tkazib
 * bo'lmaydi — ikkalasi ham bitta bosish. Javob darhol qurilmaga
 * yoziladi (`lib/profil.ts`) va butun ilova shunga moslashadi.
 * Viloyat — faqat tahlil uchun, u o'tkazib yuboriladi.
 */
import { useState } from "react";
import { sorov } from "../lib/api";
import { til } from "../lib/til";
import { t } from "../lib/matn";
import { BOSQICH, profilQoy } from "../lib/profil";
import type { Kim } from "../lib/profil";

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

/** [kod, nom, izoh?] */
type Tanlov = [number, string, string?];

/** Ikkinchi savolning sarlavhasi va javoblari — kimligiga qarab. */
function bosqichSavol(kim: Kim | undefined): { savol: string; tanlov: Tanlov[]; uzun: boolean } | null {
  const sinflar = (boshi: number): Tanlov[] =>
    Array.from({ length: 12 - boshi }, (_, i) => [boshi + i, String(boshi + i)]);
  switch (kim) {
    case "abiturient":
      return null;
    case "kattalar":
      return {
        savol: t("anketaDaraja"),
        uzun: true,
        tanlov: [
          [BOSQICH.maktabDaraja, t("anketaDarajaMaktab"), t("anketaDarajaMaktabIzoh")],
          [BOSQICH.oliyDaraja, t("anketaDarajaOliy"), t("anketaDarajaOliyIzoh")],
        ],
      };
    case "talaba":
      return {
        savol: t("anketaKurs"),
        uzun: true,
        tanlov: [
          ...[1, 2, 3, 4].map((k): Tanlov => [100 + k, t("anketaKursN", { n: k })]),
          [BOSQICH.magistr, t("anketaMagistr")],
        ],
      };
    case "ustoz":
      return {
        savol: t("anketaUstozJoy"),
        uzun: true,
        tanlov: [
          [130, t("anketaUstozBoshlangich")],
          [131, t("anketaUstozOrta")],
          [132, t("anketaUstozYuqori")],
          [BOSQICH.ustozOtm, t("anketaUstozOtm")],
          [BOSQICH.ustozMarkaz, t("anketaUstozMarkaz")],
        ],
      };
    case "ota_ona":
      return { savol: t("anketaSinfOta"), uzun: false, tanlov: [[0, t("anketaMaktabgacha")], ...sinflar(1)] };
    default:
      return { savol: t("anketaSinf"), uzun: false, tanlov: sinflar(1) };
  }
}

/**
 * `qayta` — bosh sahifadagi "o'zgartirish" dan ochilgan. U holda
 * viloyat so'ralmaydi (u allaqachon bor) va yopish tugmasi chiqadi.
 */
export function Anketa({ onTugadi, qayta = false }: { onTugadi: () => void; qayta?: boolean }) {
  const [qadam, setQadam] = useState(1);
  const [javob, setJavob] = useState<Javob>({});

  const bosqich = bosqichSavol(javob.kim);
  const ikkinchiBor = javob.kim !== "abiturient";
  const jami = (ikkinchiBor ? 2 : 1) + (qayta ? 0 : 1);
  const korinadigan = !ikkinchiBor && qadam === 3 ? 2 : qadam;

  const yubor = (j: Javob) => {
    // Javobni kutmaymiz: sekin internet odamni eshikda ushlab turmasin.
    void sorov("/api/v1/anketa", j).catch(() => {});
    onTugadi();
  };

  const keyingi = (j: Javob) => {
    setJavob(j);
    const bosqichTayyor = qadam === 2 || (qadam === 1 && j.kim === "abiturient");
    // Kim va bosqich tayyor — ilova DARHOL moslashadi, viloyat kutilmaydi.
    if (bosqichTayyor && j.kim) profilQoy({ kim: j.kim, bosqich: j.sinf ?? -1 });
    if (qadam >= 3 || (bosqichTayyor && qayta)) { yubor(j); return; }
    setQadam(qadam === 1 && j.kim === "abiturient" ? 3 : qadam + 1);
  };

  const orqaga = () => setQadam(qadam === 3 && !ikkinchiBor ? 1 : Math.max(1, qadam - 1));

  const kimlar: [Kim, string, string][] = [
    ["oquvchi", t("anketaOquvchi"), t("anketaOquvchiIzoh")],
    ["talaba", t("anketaTalaba"), t("anketaTalabaIzoh")],
    ["abiturient", t("anketaAbiturient"), t("anketaAbiturientIzoh")],
    ["ota_ona", t("anketaOtaOna"), t("anketaOtaOnaIzoh")],
    ["ustoz", t("anketaUstoz"), t("anketaUstozIzoh")],
    ["kattalar", t("anketaKattalar"), t("anketaKattalarIzoh")],
  ];

  return (
    <div className="mx-auto grid min-h-ekran w-full max-w-[460px] place-items-center px-4 py-6">
      <div className="az-kirish w-full rounded-clay bg-karta p-5 shadow-clay sm:p-6">
        <div className="flex min-h-11 items-center justify-between gap-2 text-[12px] text-ink-dim">
          {qadam > 1 ? (
            <button type="button" onClick={orqaga} className="min-h-11 px-1" data-tahlil="Anketa: ortga">
              ← {t("ortga")}
            </button>
          ) : <span>{korinadigan} / {jami}</span>}
          {qadam > 1 && <span>{korinadigan} / {jami}</span>}
          {/* O'tkazib yuborish FAQAT viloyatda: kim va bosqich — ilova
              moslashadigan javob, viloyat esa faqat tahlil uchun. */}
          {qadam === 3 && (
            <button type="button" onClick={() => yubor(javob)} className="min-h-11 px-1">
              {t("anketaOtkaz")}
            </button>
          )}
          {qayta && qadam === 1 && (
            <button type="button" onClick={onTugadi} className="min-h-11 px-1">
              {t("yopish")}
            </button>
          )}
        </div>

        {qadam === 1 && (
          <>
            <h1 className="mt-1 text-[22px] leading-tight">{t("anketaSarlavha")}</h1>
            <p className="mt-1 text-[13px] leading-snug text-ink-dim">{t("anketaMajburIzoh")}</p>
            <h2 className="mt-4 text-[16px]">{t("anketaKim")}</h2>
            <div className="mt-3 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
              {kimlar.map(([kod, nom, izoh]) => (
                <button key={kod} type="button" data-tahlil={`Anketa: ${kod}`}
                  onClick={() => keyingi({ ...javob, kim: kod, sinf: undefined })}
                  className="clay-press flex min-h-14 w-full flex-col items-start justify-center rounded-2xl
                             bg-sahna px-3.5 py-2 text-left shadow-ichki">
                  <span className="font-display text-[15px] leading-tight">{nom}</span>
                  <span className="mt-0.5 text-[12px] leading-snug text-ink-dim">{izoh}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {qadam === 2 && bosqich && (
          <>
            <h2 className="mt-1 text-[20px] leading-tight">{bosqich.savol}</h2>
            <div className={`mt-4 grid gap-2 ${bosqich.uzun ? "grid-cols-1" : "grid-cols-3"}`}>
              {bosqich.tanlov.map(([kod, nom, izoh]) => (
                <button key={kod} type="button" data-tahlil="Anketa: bosqich"
                  onClick={() => keyingi({ ...javob, sinf: kod })}
                  className={`clay-press flex min-h-12 flex-col justify-center rounded-2xl bg-sahna px-3
                              py-2 shadow-ichki ${kod === 0 ? "col-span-3" : ""}
                              ${izoh ? "items-start text-left" : "items-center"}`}>
                  <span className="font-display text-[15px] leading-tight">{nom}</span>
                  {izoh && <span className="mt-0.5 text-[12px] leading-snug text-ink-dim">{izoh}</span>}
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
