/**
 * LUG'AT VA MA'LUMOTNOMA SAHIFALARI — sinovi.
 *
 * ─────────────────── NEGA BU SINOV KERAK ───────────────────
 *
 * Bu sahifalar (`/lugat/...`, `/malumotnoma`, `/tub-sonlar`,
 * `/kopaytirish-jadvali/7` …) ILOVADA KO'RINMAYDI: ular faqat server
 * beradigan HTML (`scripts/seo.ts` → `dist/seo.json` →
 * `backend/core/seo.py`). Ya'ni ularni hech kim ishlatib ko'rmaydi —
 * ularni faqat Google va qidiruvdan kelgan notanish odam ko'radi.
 *
 * Shuning uchun xato jimgina o'tadi. Ikki xil xato bo'lishi mumkin va
 * ikkalasi ham jiddiy:
 *
 *   * TUZILISH xatosi — jadval qatori sarlavhasidan uzun bo'lsa,
 *     sahifa qiyshayadi; bo'sh formula yoki javobsiz savol chiqsa,
 *     Google uni "yupqa mazmun" deb indekslamaydi.
 *   * MAZMUN xatosi — jadvaldagi noto'g'ri son. Bu eng yomoni:
 *     "ko'paytirish jadvali" sahifasi aynan ISHONCH uchun ochiladi va
 *     undagi bitta xato bola yod olgan narsani buzadi.
 *
 * Shu sabab jadvallar bu yerda QAYTA hisoblanadi va sahifadagi son
 * bilan solishtiriladi — ya'ni ikkinchi, mustaqil hisob.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const g = globalThis as unknown as Record<string, unknown>;
const xotira = new Map<string, string>([["azapp_til", "uz"]]);
g.localStorage = {
  getItem: (k: string) => xotira.get(k) ?? null,
  setItem: (k: string, v: string) => void xotira.set(k, v),
  removeItem: (k: string) => void xotira.delete(k),
};
g.window = { Telegram: undefined };
g.document = {
  documentElement: { dataset: {}, style: { setProperty: () => {}, removeProperty: () => {} } },
};
g.getComputedStyle = () => ({ getPropertyValue: () => "#0d1230" });

const { COURSES } = await import("../src/lib/curriculum/index.ts");
const { lugat, lugatYozuv, atamaSlug } = await import("../src/lib/lugat.ts");

let xato = 0;
const tekshir = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

/* ══════════════════════════════ lug'at ══════════════════════════════ */

const LUGAT = lugat();

tekshir("lug'atda yozuv bor", LUGAT.length >= 200, `${LUGAT.length} ta`);

{
  const takror = LUGAT.map((y) => y.slug).filter((s, i, a) => a.indexOf(s) !== i);
  tekshir("manzil bo'laklari takrorlanmaydi", takror.length === 0, takror.join(", "));
}

{
  // Bo'sh yoki lotin bo'lmagan slug manzilni buzadi: `/lugat/` yoki
  // `/lugat/%D0%BA...` — ikkalasi ham 404 bo'ladi.
  const yomon = LUGAT.filter((y) => !/^[a-z0-9][a-z0-9-]*$/.test(y.slug));
  tekshir("manzil bo'laklari lotin harfi va raqamdan", yomon.length === 0,
    yomon.map((y) => `${y.nom} → "${y.slug}"`).join(", "));
}

{
  const bosh = LUGAT.filter((y) => !y.n.q[0]?.trim() || !y.n.q[1]?.trim());
  tekshir("har yozuvda ikki tilda qoida bor", bosh.length === 0, bosh.map((y) => y.nom).join(", "));
}

{
  // Darsga havola — lug'atning butun ma'nosi: atamani o'qigan odam
  // mashqqa o'tadi. Mavjud bo'lmagan koordinata 404 beradi.
  const yomon: string[] = [];
  for (const y of LUGAT) {
    if (!y.darslar.length) { yomon.push(`${y.nom}: darssiz`); continue; }
    for (const d of y.darslar) {
      const c = COURSES.find((x) => x.slug === d.kurs);
      const u = c?.units[d.bob - 1];
      if (!u?.lessons[d.dars - 1]) yomon.push(`${y.nom} → /kurs/${d.kurs}/${d.bob}-bob/${d.dars}-dars`);
    }
  }
  tekshir("dars havolalari mavjud darsga boradi", yomon.length === 0, yomon.slice(0, 5).join("; "));
}

tekshir("yozuvni manzil bo'yicha topish ishlaydi",
  lugatYozuv(LUGAT[0]!.slug)?.nom === LUGAT[0]!.nom && lugatYozuv("yoq-bunday-atama") === undefined);

tekshir("slug lotinga o'tkazadi", atamaSlug("Kvadratlar ayirmasi") === "kvadratlar-ayirmasi",
  atamaSlug("Kvadratlar ayirmasi"));

/* ═════════════════════ yasalgan sahifalar ═════════════════════ */

/*
 * `dist/seo.json` — yig'ish natijasi. U yo'q bo'lsa (hali yig'ilmagan
 * ishchi nusxa) sinov to'xtamaydi: lug'atning o'zi yuqorida
 * tekshirildi, sahifalar esa `npm run build` da yasaladi va shu
 * skript CI da yig'ishdan KEYIN ham chaqiriladi.
 */
const bu = dirname(fileURLToPath(import.meta.url));
let seo: { sahifalar: Record<string, Sahifa> } | null = null;
try {
  seo = JSON.parse(readFileSync(join(bu, "..", "dist", "seo.json"), "utf-8"));
} catch {
  console.log("\nℹ️  dist/seo.json yo'q — sahifalar tekshirilmadi (avval `npm run build`).");
}

interface Jadval { nom: string; bosh: unknown[]; qatorlar: unknown[][] }
interface Sahifa {
  sarlavha: string; tavsif: string; h1: string; matn: string[];
  formulalar?: { n?: string; f: string }[];
  savollar?: { s: string; j: string }[];
  jadval?: Jadval; jadvallar?: Jadval[];
  statik?: boolean; kanonik?: string; muhim?: number;
}

if (seo) {
  const S = seo.sahifalar;
  const bor = (yol: string) => Object.hasOwn(S, yol);

  /* --- hamma lug'at atamasining sahifasi bormi --- */
  {
    const yoq = LUGAT.filter((y) => !bor(`/lugat/${y.slug}`) || !bor(`/ru/lugat/${y.slug}`));
    tekshir("har atamaning ikki tilda sahifasi bor", yoq.length === 0,
      yoq.slice(0, 5).map((y) => y.slug).join(", "));
  }

  /* --- ma'lumotnoma sahifalari o'z joyida --- */
  {
    const kerak = ["/lugat", "/malumotnoma", "/tub-sonlar", "/bolinish-belgilari", "/ekub-ekuk",
      "/kvadratlar-jadvali", "/kublar-jadvali", "/kvadrat-ildizlar", "/rim-raqamlari",
      "/olchov-birliklari", "/foiz", "/kasrlar", "/daraja-xossalari", "/trigonometriya-jadvali",
      "/qabul", "/mantiq"];
    const yoq = kerak.filter((y) => !bor(y) || !bor(`/ru${y}`));
    tekshir("ma'lumotnoma sahifalari ikki tilda bor", yoq.length === 0, yoq.join(", "));
  }

  /* --- jadvallar to'rtburchakmi --- */
  {
    const yomon: string[] = [];
    for (const [yol, s] of Object.entries(S)) {
      for (const j of [...(s.jadval ? [s.jadval] : []), ...(s.jadvallar ?? [])]) {
        if (!j.qatorlar.length) { yomon.push(`${yol} · ${j.nom}: bo'sh`); continue; }
        const xil = j.qatorlar.find((r) => r.length !== j.bosh.length);
        if (xil) yomon.push(`${yol} · ${j.nom}: ${xil.length} ≠ ${j.bosh.length}`);
      }
    }
    tekshir("jadval qatorlari sarlavha kengligida", yomon.length === 0, yomon.slice(0, 5).join("; "));
  }

  /* --- bo'sh formula va javobsiz savol --- */
  {
    const yomon: string[] = [];
    for (const [yol, s] of Object.entries(S)) {
      if (s.formulalar?.some((f) => !f.f.trim())) yomon.push(`${yol}: bo'sh formula`);
      if (s.savollar?.some((q) => !q.s.trim() || !q.j.trim())) yomon.push(`${yol}: javobsiz savol`);
    }
    tekshir("formula va savollar to'la", yomon.length === 0, yomon.slice(0, 5).join("; "));
  }

  /* --- ko'paytirish jadvalidagi SONLAR to'g'rimi --- */
  {
    const yomon: string[] = [];
    for (let n = 2; n <= 20; n++) {
      const s = S[`/kopaytirish-jadvali/${n}`];
      if (!s) { yomon.push(`${n}: sahifa yo'q`); continue; }
      const kop = s.jadvallar?.[0];
      const bol = s.jadvallar?.[1];
      for (let i = 1; i <= 10; i++) {
        if (kop?.qatorlar[i - 1]?.[1] !== n * i) yomon.push(`${n} × ${i} ≠ ${kop?.qatorlar[i - 1]?.[1]}`);
        if (bol?.qatorlar[i - 1]?.[1] !== i) yomon.push(`${n * i} : ${n} ≠ ${bol?.qatorlar[i - 1]?.[1]}`);
      }
    }
    tekshir("ko'paytirish va bo'lish jadvallari to'g'ri", yomon.length === 0, yomon.slice(0, 5).join("; "));
  }

  /* --- kvadratlar va kublar --- */
  {
    const yomon: string[] = [];
    const kv = S["/kvadratlar-jadvali"]?.jadvallar?.[1];
    for (let o = 1; o <= 9; o++) {
      for (let b = 0; b <= 9; b++) {
        const kutilgan = (o * 10 + b) ** 2;
        if (kv?.qatorlar[o - 1]?.[b + 1] !== kutilgan) yomon.push(`${o}${b}² ≠ ${kv?.qatorlar[o - 1]?.[b + 1]}`);
      }
    }
    const kub = S["/kublar-jadvali"]?.jadval;
    for (let r = 1; r <= 10; r++) {
      for (let c = 0; c < 3; c++) {
        const n = c * 10 + r;
        if (kub?.qatorlar[r - 1]?.[c * 2 + 1] !== n ** 3) yomon.push(`${n}³ ≠ ${kub?.qatorlar[r - 1]?.[c * 2 + 1]}`);
      }
    }
    tekshir("kvadratlar va kublar jadvallari to'g'ri", yomon.length === 0, yomon.slice(0, 5).join("; "));
  }

  /* --- tub sonlar haqiqatan tubmi --- */
  {
    const tubmi = (n: number) => {
      if (n < 2) return false;
      for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
      return true;
    };
    const sonlar = (S["/tub-sonlar"]?.jadvallar?.[0]?.qatorlar ?? [])
      .flat().filter((x): x is number => typeof x === "number");
    const yomon = sonlar.filter((n) => !tubmi(n));
    // 100 gacha 25 ta tub son bor — jadval to'liq ekanini ham tekshiramiz.
    tekshir("jadvaldagi sonlar tub va to'liq", yomon.length === 0 && sonlar.length === 25,
      yomon.length ? `tub emas: ${yomon.join(", ")}` : `${sonlar.length} ta, 25 ta kutilgan`);
  }

  /* --- statik sahifa ilovada ekran so'ramasin --- */
  {
    // `statik` sahifada React ULANMAYDI (`seo.py`). Agar ilovada shu
    // manzilga ekran bo'lsa, odam uni ocholmay qoladi: server matni
    // turadi, ilova esa boshlanmaydi.
    const app = readFileSync(join(bu, "..", "src", "App.tsx"), "utf-8");
    const marshrut = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]!)
      .filter((y) => !y.includes(":") && y !== "*");
    const yomon = Object.entries(S)
      .filter(([yol, s]) => s.statik && marshrut.includes(yol.startsWith("/ru/") ? yol.slice(3) : yol))
      .map(([yol]) => yol);
    tekshir("statik sahifaning ilovada ekrani yo'q", yomon.length === 0, yomon.join(", "));
  }
}

console.log(xato === 0 ? "\n✅ lug'at va ma'lumotnoma: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
