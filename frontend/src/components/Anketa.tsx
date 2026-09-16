/**
 * TANISHUV ANKETASI — ro'yxatdan o'tgandan keyin, bir marta.
 *
 * Uch savol, har biri ALOHIDA ekranda va har biri bir bosish:
 *
 *   1. Siz kimsiz?     o'quvchi / ota-ona / ustoz
 *   2. Qaysi sinf?     savol matni birinchi javobga moslashadi
 *   3. Qayerdansiz?    viloyat
 *
 * Nega kerak: panel ilgari faqat "nechta odam" derdi. "Kimlar" — ya'ni
 * ota-onalar ko'pmi yoki bolalar, qaysi sinf, qaysi viloyat — mahsulot
 * qarorining asosi (`backend/core/tahlil.py`).
 *
 * Nega yozish maydoni yo'q: klaviatura ochilgan zahoti anketa "forma"
 * bo'lib qoladi va odam uni yopadi. Tugma bosish esa o'yindek.
 *
 * "O'tkazib yuborish" HAR ekranda bor — majburiy anketa yangi odamni
 * birinchi daqiqada yo'qotadi. O'tkazib yuborilsa ham server buni
 * eslaydi va anketa qayta chiqmaydi.
 */
import { useState } from "react";
import { sorov } from "../lib/api";
import { til } from "../lib/til";
import { t } from "../lib/matn";

type Kim = "oquvchi" | "ota_ona" | "ustoz";

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

export function Anketa({ onTugadi }: { onTugadi: () => void }) {
  const [qadam, setQadam] = useState(1);
  const [javob, setJavob] = useState<Javob>({});

  const yubor = (j: Javob) => {
    // Javobni kutmaymiz: anketa kuzatuv, uning sekin interneti
    // odamni ilova eshigida ushlab turmasin.
    void sorov("/api/v1/anketa", j).catch(() => {});
    onTugadi();
  };

  const keyingi = (j: Javob) => {
    setJavob(j);
    if (qadam >= 3) yubor(j);
    else setQadam(qadam + 1);
  };

  const sinfSavol = javob.kim === "ota_ona" ? t("anketaSinfOta")
    : javob.kim === "ustoz" ? t("anketaSinfUstoz") : t("anketaSinf");

  return (
    <div className="mx-auto grid min-h-ekran w-full max-w-[430px] place-items-center px-4 py-8">
      <div className="az-kirish w-full rounded-clay bg-karta p-6 shadow-clay">
        <div className="flex items-center justify-between text-[12px] text-ink-dim">
          <span>{t("anketaQadam", { n: qadam })}</span>
          <button type="button" onClick={() => yubor(javob)} className="px-1 py-1 underline-offset-2 hover:underline">
            {t("anketaOtkaz")}
          </button>
        </div>

        {qadam === 1 && (
          <>
            <h1 className="mt-3 text-[22px] leading-tight">{t("anketaSarlavha")}</h1>
            <p className="mt-1 text-[13px] text-ink-dim">{t("anketaIzoh")}</p>
            <h2 className="mt-5 text-[16px]">{t("anketaKim")}</h2>
            <div className="mt-3 space-y-2.5">
              {([
                ["oquvchi", t("anketaOquvchi")],
                ["ota_ona", t("anketaOtaOna")],
                ["ustoz", t("anketaUstoz")],
              ] as [Kim, string][]).map(([kod, nom]) => (
                <Tanlov key={kod} on={() => keyingi({ ...javob, kim: kod })}>{nom}</Tanlov>
              ))}
            </div>
          </>
        )}

        {qadam === 2 && (
          <>
            <h2 className="mt-3 text-[20px] leading-tight">{sinfSavol}</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button type="button" onClick={() => keyingi({ ...javob, sinf: 0 })}
                className="clay-press col-span-3 h-12 rounded-2xl bg-sahna font-display text-[15px] shadow-ichki">
                {t("anketaMaktabgacha")}
              </button>
              {Array.from({ length: 11 }, (_, i) => i + 1).map((s) => (
                <button key={s} type="button" onClick={() => keyingi({ ...javob, sinf: s })}
                  className="clay-press h-12 rounded-2xl bg-sahna font-display text-[16px] shadow-ichki">
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {qadam === 3 && (
          <>
            <h2 className="mt-3 text-[20px] leading-tight">{t("anketaViloyat")}</h2>
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

function Tanlov({ on, children }: { on: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={on}
      className="clay-press flex h-14 w-full items-center justify-center rounded-3xl
                 bg-brand-blue font-display text-[17px] text-white shadow-clay-sm">
      {children}
    </button>
  );
}
