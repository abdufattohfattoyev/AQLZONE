/**
 * AI ustoz — Imtihon Premium egalariga (`backend/core/ai.py`).
 *
 * To'rt vazifa: xatoni tushuntirish (ko'rib chiqish kartasidan), zaif
 * mavzular rejasi, repetitor suhbati va masala yechimiga yordam. Hammasi
 * suhbat: tushuntirishdan keyin ham "shu qadamni tushunmadim" deb so'rash
 * mumkin.
 *
 * Kalit MIJOZDA YO'Q — so'rov serverga ketadi, server OpenAI'ni chaqiradi.
 * Javob fonda yoziladi: server darhol `kutilmoqda` qatorini qaytaradi va
 * biz uni tayyor bo'lguncha so'rab turamiz (`useSuhbat`).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { sorov, xatoKodi } from "./api";
import { t } from "./matn";
import type { Kalit } from "./matn";

export type AiTur = "xato" | "reja" | "repetitor" | "masala";

export interface AiXabar {
  id: number;
  rol: "user" | "ai";
  matn: string;
  holat: "kutilmoqda" | "tayyor" | "xato";
}

export interface AiSuhbatQisqa {
  id: number;
  tur: AiTur;
  sarlavha: string;
  vaqt: string;
}

export interface AiSuhbat extends AiSuhbatQisqa {
  /** Faqat `xato` turida — tushuntirilayotgan savol. */
  kontekst: { savol?: string; togri?: string; sizniki?: string };
  rasm: boolean;
  xabarlar: AiXabar[];
}

export interface AiHolat {
  /** Serverda kalit bor-yo'qligi. */
  yoqilgan: boolean;
  premium: boolean;
  kunlik: number;
  /** Bugun yana nechta javob olish mumkin. */
  qolgan: number;
  suhbatlar: AiSuhbatQisqa[];
}

/** Ko'rib chiqish kartasidan keladigan savol (`KoribChiqish.tsx`). */
export interface XatoSavol {
  savol: string;
  togri: string;
  sizniki: string;
  variantlar?: { harf: string; qiymat: string }[];
  mavzu: string;
  imtihon: "dtm" | "sert";
}

/**
 * Xato kodi — matnni ekran o'z tilida yozadi.
 * `premium` | `yopiq` | `chegara` | `band` | `rasm` | `aloqa`.
 */
export type AiXatoKod = "premium" | "yopiq" | "chegara" | "band" | "rasm" | "aloqa";

const HTTP_KOD: Record<number, AiXatoKod> = { 403: "premium", 503: "yopiq", 409: "band" };

/**
 * So'rov xatosini kodga aylantiradi. `sorov` javob tanasini o'qimaydi,
 * shuning uchun kod HTTP holatidan olinadi: 429 — shaxsiy kunlik chegara
 * ("ertaga"), 503 — kalit yo'q yoki butun ilova chegarasi ("keyinroq").
 */
function kodi(e: unknown): AiXatoKod {
  const k = xatoKodi(e);
  if (k === 429) return "chegara";
  if (k === 400) return "rasm";
  return HTTP_KOD[k] ?? "aloqa";
}

/** Xato kodining odam o'qiydigan matni (joriy tilda). */
export const aiXatoMatni = (kod: AiXatoKod): string => t(`aiXato_${kod}` as Kalit);

export type Natija<T> = { ok: true; qiymat: T } | { ok: false; kod: AiXatoKod };

async function urin<T>(f: () => Promise<T>): Promise<Natija<T>> {
  try {
    return { ok: true, qiymat: await f() };
  } catch (e) {
    return { ok: false, kod: kodi(e) };
  }
}

export const aiHolat = (): Promise<AiHolat> => sorov<AiHolat>("/api/v1/ai");

/** Yangi suhbat. Rasm bo'lsa so'rov multipart bo'ladi. */
export function aiBoshla(tur: AiTur, o: { matn?: string; kontekst?: XatoSavol; rasm?: File | null } = {}):
Promise<Natija<AiSuhbat>> {
  return urin(() => {
    if (o.rasm) {
      const f = new FormData();
      f.append("tur", tur);
      f.append("matn", o.matn ?? "");
      f.append("rasm", o.rasm);
      return sorov<AiSuhbat>("/api/v1/ai/suhbat", f);
    }
    return sorov<AiSuhbat>("/api/v1/ai/suhbat", { tur, matn: o.matn ?? "", kontekst: o.kontekst });
  });
}

export const aiDavom = (id: number, matn: string) =>
  urin(() => sorov<AiSuhbat>(`/api/v1/ai/suhbat/${id}`, { matn }));

export const aiQayta = (id: number) =>
  urin(() => sorov<AiSuhbat>(`/api/v1/ai/suhbat/${id}/qayta`, {}));

/** Javob tayyor bo'lguncha qancha oraliqda so'raladi (ms). */
const SORASH = 2000;

/**
 * Bitta suhbat — javob `kutilmoqda` ekan, har 2 soniyada qayta so'raladi.
 * `yangila` — yuborish yoki qayta urinishdan keyin serverdan kelgan
 * yangi holatni darhol qo'yish uchun.
 */
export function useSuhbat(id: number, boshlangich?: AiSuhbat | null) {
  const [s, setS] = useState<AiSuhbat | null>(boshlangich ?? null);
  const [topilmadi, setTopilmadi] = useState(false);
  const tirik = useRef(true);

  const ol = useCallback(async () => {
    try {
      const j = await sorov<AiSuhbat>(`/api/v1/ai/suhbat/${id}`);
      if (tirik.current) setS(j);
    } catch (e) {
      if (tirik.current && xatoKodi(e) === 404) setTopilmadi(true);
    }
  }, [id]);

  useEffect(() => {
    tirik.current = true;
    if (!boshlangich) ol();
    return () => { tirik.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const kutilmoqda = Boolean(s?.xabarlar.some((x) => x.holat === "kutilmoqda"));
  useEffect(() => {
    if (!kutilmoqda) return;
    const t = window.setTimeout(ol, SORASH);
    return () => window.clearTimeout(t);
  }, [kutilmoqda, s, ol]);

  return { s, yangila: setS, kutilmoqda, topilmadi };
}
