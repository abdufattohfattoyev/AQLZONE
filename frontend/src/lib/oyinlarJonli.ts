/**
 * "KIM QAYSI O'YINDA" — o'yinlar ekranidagi sonlar.
 *
 * Duel banneridagi "4 kishi hozir o'yinlarda" va har kartadagi `• 2`
 * shu yerdan keladi (`backend/core/onlayn.py:oyinlar_jonli`). Sonlar
 * `Faollik` signalidan quriladi: o'yin ochiq turganda ilova har 20
 * soniyada "shu o'yindaman" deb turadi (`lib/faollik.ts`).
 *
 * Faqat ekran ko'rinib turganda so'raladi va qaytilganda darhol
 * yangilanadi — fondagi ilova behuda so'rov yubormasin.
 */
import { useEffect, useState } from "react";
import { oyinlarJonli } from "./api";
import type { OyinlarJonli } from "./api";

/** Sakkiz soniya: kimdir o'yinga kirsa, karta yarim daqiqada emas, darrov yonsin. */
const ORALIQ_MS = 8_000;

export function useOyinlarJonli(): OyinlarJonli | null {
  const [d, setD] = useState<OyinlarJonli | null>(null);

  useEffect(() => {
    let bekor = false;
    const yukla = async () => {
      if (document.hidden) return;
      const j = await oyinlarJonli();
      if (!bekor && j) setD(j);
    };
    void yukla();
    const id = setInterval(() => { void yukla(); }, ORALIQ_MS);
    const korinish = () => { void yukla(); };
    document.addEventListener("visibilitychange", korinish);
    return () => {
      bekor = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", korinish);
    };
  }, []);

  return d;
}
