/**
 * YECHGANDAN KEYINGI TAKLIF — odamni ertaga qaytarish.
 *
 * Masala yechilgan yoki test tugagan zahoti chiqadi: odam hozirgina
 * yutgan va "yana shunday" degan taklifga eng ochiq payt.
 *
 * ─────────────── IKKI YO'L, BITTA TAKLIF ───────────────
 *
 * Qaytarishning ikki yo'li bor va odamga FAQAT BITTASI taklif qilinadi
 * — ikkita ketma-ket so'rov shovqin bo'lardi:
 *
 *   1. KANAL — a'zo bo'lmaganga. Har kuni 18:05 da yangi masala
 *      kanalda chiqadi, ya'ni a'zo odam har kuni o'zi ko'radi. Bu eng
 *      kuchli yo'l: bot ruxsati ham, eslatma ham kerak emas.
 *   2. BOT ESLATMASI — kanalda bor yoki kanalni tekshirib bo'lmaganga.
 *      Kanaldagi masala tugmasi Mini App'ni to'g'ridan-to'g'ri ochadi
 *      va odam botni /start qilmagan bo'ladi — bot unga yoza olmaydi.
 *      `WebApp.requestWriteAccess` shu yo'lni ochadi.
 *
 * ─────────────── BEZOVTA QILMAYDI ───────────────
 *
 * Kanal taklifi rad etilsa, umumiy "kanal" oynasi bilan BIR XIL
 * tinchlik muddati ishlaydi (`components/Kanal.tsx`, 3 kun). Eslatma
 * taklifi esa bir marta: javob qurilmada eslanadi. Telegram
 * tashqarisida (sayt, APK) eslatma taklifi chiqmaydi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { getKanal, sorov } from "../lib/api";
import { t } from "../lib/matn";
import { havolaniOch, tebrat, tgWebApp } from "../lib/qobiq";

const ESLATMA_KALIT = "az_eslatma_taklif";
/** `components/Kanal.tsx` dagi bilan BIR XIL — ikkala joy bitta rad javobni hurmat qiladi. */
const KANAL_KEYINROQ = "az_kanal_keyinroq";
const KANAL_TINCHLIK_MS = 3 * 24 * 3600 * 1000;

function olish(k: string): string | null {
  try { return localStorage.getItem(k); } catch { return null; }
}
function yozish(k: string, v: string) {
  try { localStorage.setItem(k, v); } catch { /* eslanmaydi — xolos */ }
}

const kanalTinchlikda = (): boolean => {
  const x = Number(olish(KANAL_KEYINROQ));
  return Number.isFinite(x) && x > 0 && Date.now() - x < KANAL_TINCHLIK_MS;
};

function eslatmaMumkin(): boolean {
  const tg = tgWebApp();
  return Boolean(tg?.initData && tg.requestWriteAccess
    && (tg.isVersionAtLeast?.("6.9") ?? false)) && olish(ESLATMA_KALIT) !== "1";
}

type Holat =
  | { tur: "kutish" }
  | { tur: "kanal"; havola: string }
  | { tur: "eslatma" }
  | { tur: "rahmat"; matn: string }
  | { tur: "yopiq" };

export function EslatmaTaklif({ matn }: { matn: string }) {
  const [h, setH] = useState<Holat>({ tur: "kutish" });

  useEffect(() => {
    let bekor = false;
    const eslatmaYokiYop = () => setH(eslatmaMumkin() ? { tur: "eslatma" } : { tur: "yopiq" });
    if (kanalTinchlikda()) { eslatmaYokiYop(); return; }
    // Kanal a'zoligini server biladi (Telegram'dan so'raydi). Javob
    // kelmasa yoki odam a'zo bo'lsa — eslatma yo'liga o'tiladi.
    void getKanal().then((k) => {
      if (bekor) return;
      if (k?.korsat && k.havola) setH({ tur: "kanal", havola: k.havola });
      else eslatmaYokiYop();
    });
    return () => { bekor = true; };
  }, []);

  if (h.tur === "kutish" || h.tur === "yopiq") return null;

  if (h.tur === "rahmat") {
    return (
      <p className="az-natija mt-3 flex items-center gap-2 rounded-clay bg-brand-green/12 px-3.5 py-3
                    text-[13px] text-brand-green">
        <Icon name="check" size={16} className="shrink-0" />
        {h.matn}
      </p>
    );
  }

  const kanalgaOt = (havola: string) => {
    yozish(KANAL_KEYINROQ, String(Date.now()));
    havolaniOch(havola);
    tebrat("tanlov");
    setH({ tur: "rahmat", matn: t("kanalTaklifRahmat") });
  };

  const ruxsatSora = () => {
    yozish(ESLATMA_KALIT, "1");
    tgWebApp()?.requestWriteAccess?.((berdi) => {
      if (!berdi) { setH({ tur: "yopiq" }); return; }
      tebrat("yutuq");
      void sorov("/api/v1/yozish-ruxsat", {}).catch(() => {});
      setH({ tur: "rahmat", matn: t("eslatmaTaklifHa") });
    });
  };

  const keyinroq = () => {
    if (h.tur === "kanal") yozish(KANAL_KEYINROQ, String(Date.now()));
    else yozish(ESLATMA_KALIT, "1");
    setH({ tur: "yopiq" });
  };

  const kanal = h.tur === "kanal";

  return (
    <div className="az-natija mt-3 rounded-clay bg-karta p-4 shadow-clay-sm">
      <p className="text-[14px] leading-snug">{kanal ? t("kanalTaklifMatn") : matn}</p>
      <div className="mt-3 flex gap-2">
        <button type="button"
          onClick={() => (kanal ? kanalgaOt(h.havola) : ruxsatSora())}
          data-tahlil={kanal ? "Taklif: kanalga o'tish" : "Taklif: eslatma ha"}
          className="tugma-3d flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl
                     bg-brand-blue font-display text-[14px] text-white shadow-clay-sm">
          <Icon name="send" size={15} />
          {kanal ? t("kanalTaklifTugma") : t("eslatmaTaklifTugma")}
        </button>
        <button type="button" onClick={keyinroq}
          data-tahlil={kanal ? "Taklif: kanal keyinroq" : "Taklif: eslatma keyinroq"}
          className="clay-press min-h-11 rounded-2xl px-3.5 text-[13px] text-ink-dim">
          {t("eslatmaTaklifYoq")}
        </button>
      </div>
    </div>
  );
}
