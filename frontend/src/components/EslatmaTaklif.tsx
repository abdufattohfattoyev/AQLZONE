/**
 * "ERTAGA ESLATIB TURAYLIKMI?" — bitta ishdan keyin odamni qaytarish.
 *
 * ─────────────── MUAMMO ───────────────
 *
 * Kanaldagi masala tugmasi Mini App'ni TO'G'RIDAN-TO'G'RI ochadi. Odam
 * botni hech qachon /start qilmagan bo'ladi — Telegram qoidasi bo'yicha
 * bot unga BIRINCHI BO'LIB yoza olmaydi. Ya'ni masalani yechib chiqib
 * ketgan odamni qaytarishning birorta yo'li yo'q edi: kunlik eslatma
 * ham, yangi masala xabari ham unga yetib bormasdi.
 *
 * ─────────────── YECHIM ───────────────
 *
 * `WebApp.requestWriteAccess` — Telegram'ning o'z oynasi: "Botga sizga
 * yozishga ruxsat berasizmi?". Bir bosish, ma'lumot so'ralmaydi.
 *
 * Taklif ENG YAXSHI PAYTDA chiqadi — masala yechilgan yoki test
 * tugagan zahoti: odam hozirgina yutgan va "yana shunday" degan
 * taklifga ochiq.
 *
 * Bir marta: javob (ha ham, yo'q ham) qurilmada eslanadi va taklif
 * qayta chiqmaydi. Telegram tashqarisida (sayt, APK) umuman chiqmaydi.
 */
import { useState } from "react";
import { Icon } from "../lib/icons";
import { sorov } from "../lib/api";
import { t } from "../lib/matn";
import { tebrat, tgWebApp } from "../lib/qobiq";

const KALIT = "az_eslatma_taklif";

function soralganmi(): boolean {
  try { return localStorage.getItem(KALIT) === "1"; } catch { return true; }
}
function belgila() {
  try { localStorage.setItem(KALIT, "1"); } catch { /* eslanmaydi — xolos */ }
}

/** Taklifni ko'rsatish mumkinmi — Telegram ichida va hali so'ralmagan. */
function eslatmaTaklifMumkin(): boolean {
  const tg = tgWebApp();
  return Boolean(tg?.initData && tg.requestWriteAccess
    && (tg.isVersionAtLeast?.("6.9") ?? false)) && !soralganmi();
}

export function EslatmaTaklif({ matn }: { matn: string }) {
  const [holat, setHolat] = useState<"savol" | "ha" | "yopiq">(
    () => (eslatmaTaklifMumkin() ? "savol" : "yopiq"),
  );
  if (holat === "yopiq") return null;

  if (holat === "ha") {
    return (
      <p className="az-natija mt-3 flex items-center gap-2 rounded-clay bg-brand-green/12 px-3.5 py-3
                    text-[13px] text-brand-green">
        <Icon name="check" size={16} className="shrink-0" />
        {t("eslatmaTaklifHa")}
      </p>
    );
  }

  const ruxsat = () => {
    belgila();
    tgWebApp()?.requestWriteAccess?.((berdi) => {
      if (!berdi) { setHolat("yopiq"); return; }
      tebrat("yutuq");
      void sorov("/api/v1/yozish-ruxsat", {}).catch(() => {});
      setHolat("ha");
    });
  };

  return (
    <div className="az-natija mt-3 rounded-clay bg-karta p-4 shadow-clay-sm">
      <p className="text-[14px] leading-snug">{matn}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={ruxsat} data-tahlil="Eslatma taklifi: ha"
          className="tugma-3d flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl
                     bg-brand-blue font-display text-[14px] text-white shadow-clay-sm">
          <Icon name="send" size={15} />
          {t("eslatmaTaklifTugma")}
        </button>
        <button type="button" onClick={() => { belgila(); setHolat("yopiq"); }}
          data-tahlil="Eslatma taklifi: keyinroq"
          className="clay-press min-h-11 rounded-2xl px-3.5 text-[13px] text-ink-dim">
          {t("eslatmaTaklifYoq")}
        </button>
      </div>
    </div>
  );
}
