/**
 * JONLI FAOLLIK — "hozir shu ishni qilyapman" signali.
 *
 * Boshqaruv panelidagi "Jonli" sahifa shu signallardan quriladi
 * (`backend/core/jonli.py`): admin kim hozir test ishlayotganini, qaysi
 * savolda turganini va nechtasini to'g'ri topganini ko'radi.
 *
 * ─────────────── QACHON YUBORILADI ───────────────
 *
 *   holat o'zgarganda   yangi savol, yangi javob — darhol
 *   har 20 soniyada     o'zgarish bo'lmasa ham: bola bitta savol ustida
 *                       o'ylab o'tirgan bo'lishi mumkin va u ro'yxatdan
 *                       tushib ketmasligi kerak (server 90 s kutadi)
 *   ekran yopilganda    bo'sh `joy` — "ish tugadi"
 *
 * Ilova fonda turganda (`document.hidden`) yurak urishi yuborilmaydi:
 * telefonni cho'ntakka solgan bola "ishlayapti" bo'lib turmasin.
 *
 * Xato YUTILADI: bu kuzatuv signali, uning yiqilishi bolaning testiga
 * hech qanday ta'sir qilmasligi kerak.
 */
import { useEffect, useRef } from "react";
import { bilanProfil, sorov } from "./api";

/** `oyin` va `duel` da `nom` — o'yin id'si ("tezkor"): o'yinlar ekranidagi `• 2` shundan. */
export type FaollikJoy = "dars" | "blok" | "toplam" | "masala" | "oyin" | "duel";

export interface FaollikHolat {
  joy: FaollikJoy;
  nom: string;
  /** Nechanchi savolda (1 dan). Masalada 0. */
  savol?: number;
  jami?: number;
  togri?: number;
}

const YURAK_MS = 20_000;

const yubor = (d: FaollikHolat | { joy: "" }) =>
  sorov("/api/v1/faollik", bilanProfil({ ...d })).catch(() => {});

/**
 * Ekran ochiq ekan holatni serverga yetkazib turadi.
 *
 * `holat = null` — hozir hech narsa ishlanmayapti (natija ekrani,
 * tushuntirish): server qatorni o'chiradi.
 */
export function useFaollik(holat: FaollikHolat | null): void {
  const joriy = useRef(holat);
  joriy.current = holat;

  const kalit = holat
    ? `${holat.joy}|${holat.nom}|${holat.savol ?? 0}|${holat.jami ?? 0}|${holat.togri ?? 0}`
    : "";

  // Holat o'zgardi — darhol.
  useEffect(() => {
    if (joriy.current) void yubor(joriy.current);
    else void yubor({ joy: "" });
  }, [kalit]);

  // Yurak urishi va ekrandan chiqish.
  useEffect(() => {
    const ur = () => {
      if (!document.hidden && joriy.current) void yubor(joriy.current);
    };
    const id = setInterval(ur, YURAK_MS);
    document.addEventListener("visibilitychange", ur);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", ur);
      void yubor({ joy: "" });
    };
  }, []);
}
