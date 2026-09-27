/**
 * Ko'rib chiqish ro'yxati — variant va javoblardan (`components/KoribChiqish.tsx`).
 *
 * Savollar SAQLANMAYDI: variant raqamdan har safar aynan o'shanday
 * yasaladi (`lib/imtihon.ts`, `lib/sertifikat.ts`). Shuning uchun natija
 * ekrani ham, keyinroq ro'yxatdan ochilgan ko'rib chiqish ham shu
 * funksiyalar bilan bir xil ro'yxatni oladi.
 */
import type { KorishSavol } from "../components/KoribChiqish";
import type { Blok } from "./blok";
import type { SJavob, SVariant } from "./sertifikat";
import { HARFLAR, sonTogrimi } from "./sertifikat";

const variantlar = (qiymatlar: string[]) => qiymatlar.map((qiymat, i) => ({ harf: HARFLAR[i] ?? String(i + 1), qiymat }));

/** DTM varianti. `null` — ulgurilmagan savol. */
export function dtmSavollari(blok: Blok, javoblar: (string | null)[]): KorishSavol[] {
  return blok.savollar.map((s, i) => {
    const j = javoblar[i] ?? null;
    return {
      raqam: String(i + 1), s,
      togri: j !== null && j === String(s.a.answer),
      berildi: j !== null,
      sizniki: j ?? "",
      variantlar: s.a.choices.length ? variantlar(s.a.choices.map(String)) : undefined,
    };
  });
}

/** Milliy sertifikat: test, moslashtirish (umumiy A–F) va ochiq savolning ikki qismi. */
export function sertSavollari(v: SVariant, javoblar: SJavob[]): KorishSavol[] {
  const r: KorishSavol[] = [];
  const y2 = variantlar(v.y2.map(String));
  v.savollar.forEach((S, i) => {
    const j = javoblar[i] ?? null;
    if (S.tur === "o") {
      const o = j && typeof j !== "string" ? j : { a: "", b: "" };
      r.push({ raqam: `${i + 1}a`, s: S.a, togri: sonTogrimi(o.a, S.a.a.answer), berildi: o.a.trim() !== "", sizniki: o.a });
      r.push({ raqam: `${i + 1}b`, s: S.b, togri: sonTogrimi(o.b, S.b.a.answer), berildi: o.b.trim() !== "", sizniki: o.b });
      return;
    }
    const x = typeof j === "string" ? j : "";
    r.push({
      raqam: String(i + 1), s: S.s,
      togri: x !== "" && x === String(S.s.a.answer),
      berildi: x !== "",
      sizniki: x,
      variantlar: S.tur === "y2" ? y2 : variantlar(S.s.a.choices.map(String)),
    });
  });
  return r;
}
