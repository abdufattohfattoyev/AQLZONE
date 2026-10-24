/**
 * MATNDAN QUIZ — o'qituvchi Word'dagi yoki Telegram'dagi testini
 * ko'chirib qo'yadi, bu yer uni savollarga ajratadi.
 *
 * Tanilgan ko'rinishlar (aralash ham bo'ladi):
 *
 *   1. Shart matni            savol — raqam va nuqta/qavs bilan boshlanadi;
 *   2) Shart ...              shart bir necha qator bo'lishi mumkin
 *   A) 12   B) 15             variantlar — har biri alohida qatorda yoki
 *   C) 18*                    bir qatorda ketma-ket; "*", "+", "✓" — to'g'ri
 *   Javob: B                  savol ichidagi javob qatori (harf yoki qiymat)
 *   Javoblar: 1-B, 2-C 3) A   oxirgi kalit — hamma savolga birdaniga
 *
 * Variantsiz savol "javob yoziladi" bo'ladi. To'g'ri javobi topilmagan
 * savol ham TASHLANMAYDI — muharrirda "chala" deb belgilanadi va muallif
 * uni bir bosishda to'ldiradi: savolni yo'qotishdan ko'ra so'rash yaxshi.
 */
import { MAX_MATN, MAX_SAVOL, MAX_VARIANT, MAX_VARIANT_MATN, STANDART_VAQT } from "./quiz";
import type { Savol } from "./quiz";

const SAVOL_BOSH = /^\s*(\d{1,3})\s*[.)]\s+(.*)$/;
/** Qatordagi variant boshlari: "A)", "b.", "C )". Oldida bo'sh joy yoki qator boshi. */
const VARIANT = /(?:^|\s)([A-Fa-f])\s?[).]\s*/g;
const JAVOB_QATOR = /^\s*(?:javob|to'g'ri javob|ответ|правильный ответ)\s*[:\-–]\s*(.+)$/i;
const KALIT_SARLAVHA = /^\s*(?:javoblar|kalit|ответы|ключ)\b.*$/i;
const KALIT_JUFT = /(\d{1,3})\s*[-.):]\s*([A-Fa-f])\b/g;
/** To'g'ri variant belgisi. Boshida faqat * va ✓: +5 — musbat son, belgi emas. */
const BELGI = /\s*[*+✓✔]\s*$|^\s*[*✓✔]\s*/;

export interface ImportNatija {
  savollar: Savol[];
  /** To'g'ri javobi topilmaganlar soni — muharrirda "chala". */
  chala: number;
}

/** Bir qatordagi variantlarni ajratadi; variant yo'q bo'lsa — `null`. */
function variantlarniAjrat(qator: string): { harf: string; matn: string }[] | null {
  const boshlar = [...qator.matchAll(VARIANT)];
  // Birinchi variant qator boshida bo'lishi shart — aks holda "x = a) ..."
  // kabi shart ichidagi qavs variant deb o'qilardi.
  if (!boshlar.length || qator.slice(0, boshlar[0]!.index).trim() !== "") return null;
  return boshlar.map((m, k) => {
    const boshi = m.index! + m[0].length;
    const oxiri = k + 1 < boshlar.length ? boshlar[k + 1]!.index! : qator.length;
    return { harf: m[1]!.toUpperCase(), matn: qator.slice(boshi, oxiri).trim() };
  });
}

/** Oxirgi javoblar kaliti: "Javoblar:" sarlavhasidan keyin yoki faqat juftlardan iborat qatorlar. */
function kalitniAjrat(qatorlar: string[]): { kalit: Map<number, string>; qolgan: string[] } {
  const kalit = new Map<number, string>();
  let i = qatorlar.findIndex((q) => KALIT_SARLAVHA.test(q));
  if (i < 0) {
    // Sarlavhasiz kalit: oxirdagi qatorlar faqat "1-B 2-C" juftlaridan iborat.
    i = qatorlar.length;
    while (i > 0) {
      const q = qatorlar[i - 1]!.trim();
      if (!q) { i--; continue; }
      const qoldiq = q.replace(KALIT_JUFT, "").replace(/[\s,;]/g, "");
      if (qoldiq !== "" || !q.match(KALIT_JUFT)) break;
      i--;
    }
  }
  for (const q of qatorlar.slice(i)) {
    for (const m of q.matchAll(KALIT_JUFT)) kalit.set(Number(m[1]), m[2]!.toUpperCase());
  }
  return { kalit, qolgan: qatorlar.slice(0, i) };
}

const qisqa = (s: string, n: number) => s.replace(/\s+/g, " ").trim().slice(0, n);

export function matndanSavollar(matn: string, vaqt = STANDART_VAQT): ImportNatija {
  const { kalit, qolgan } = kalitniAjrat(matn.replace(/\r\n?/g, "\n").split("\n"));

  interface Xom { raqam: number; shart: string[]; variantlar: { harf: string; matn: string }[]; javob: string }
  const xomlar: Xom[] = [];
  let joriy: Xom | null = null;
  for (const q of qolgan) {
    const bosh = SAVOL_BOSH.exec(q);
    // Yangi savol — raqam bilan boshlangan qator. Lekin variantlar boshlangandan
    // keyin "1) ..." variant emas, keyingi savol ekanini ham shu bildiradi.
    if (bosh) {
      joriy = { raqam: Number(bosh[1]), shart: [bosh[2]!], variantlar: [], javob: "" };
      xomlar.push(joriy);
      continue;
    }
    if (!joriy || !q.trim()) continue;
    const jq = JAVOB_QATOR.exec(q);
    if (jq) { joriy.javob = jq[1]!.trim(); continue; }
    const v = variantlarniAjrat(q);
    if (v) joriy.variantlar.push(...v);
    else if (joriy.variantlar.length) {
      // Variant matni keyingi qatorga o'tib ketgan.
      const oxirgi = joriy.variantlar[joriy.variantlar.length - 1]!;
      oxirgi.matn = `${oxirgi.matn} ${q.trim()}`;
    } else joriy.shart.push(q);
  }

  let chala = 0;
  const savollar: Savol[] = [];
  for (const x of xomlar.slice(0, MAX_SAVOL)) {
    const shart = qisqa(x.shart.join(" "), MAX_MATN);
    if (!shart) continue;
    // To'g'ri variant: belgi (*, +, ✓) → savol ichidagi "Javob:" → oxirgi kalit.
    let togriHarf = "";
    const variantlar: string[] = [];
    for (const v of x.variantlar.slice(0, MAX_VARIANT)) {
      const belgili = BELGI.test(v.matn);
      const toza = qisqa(v.matn.replace(BELGI, ""), MAX_VARIANT_MATN);
      if (!toza || variantlar.includes(toza)) continue;
      if (belgili) togriHarf = v.harf;
      variantlar.push(toza);
    }
    if (variantlar.length >= 2) {
      const harflar = x.variantlar.map((v) => v.harf);
      const jHarf = /^[A-Fa-f]$/.test(x.javob) ? x.javob.toUpperCase() : "";
      togriHarf ||= jHarf || kalit.get(x.raqam) || "";
      const k = harflar.indexOf(togriHarf);
      // "Javob: 15" — harf emas, qiymat yozilgan bo'lishi ham mumkin.
      const javob = k >= 0 && k < variantlar.length ? variantlar[k]!
        : variantlar.includes(qisqa(x.javob, MAX_VARIANT_MATN)) ? qisqa(x.javob, MAX_VARIANT_MATN) : "";
      if (!javob) chala++;
      savollar.push({ tur: "variant", matn: shart, variantlar, javob, vaqt });
    } else {
      const javob = qisqa(x.javob, MAX_VARIANT_MATN);
      if (!javob) chala++;
      savollar.push({ tur: "yozma", matn: shart, variantlar: [], javob, vaqt });
    }
  }
  return { savollar, chala };
}


