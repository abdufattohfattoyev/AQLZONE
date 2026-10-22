/**
 * Bilim xaritasi sinovi (`src/lib/diagnostika.ts`).
 *
 * Va'dalar: har mavzudan aynan kerakli son savol chiqadi va u o'sha
 * mavzuning O'Z boblaridan; savollar takrorlanmaydi (aniqlashtirishda ham);
 * savol JSON orqali qurilmaga yozilib qaytsa ham o'sha savol bo'lib qoladi
 * (sahifa yangilanganda davom etish shunga tayanadi); sanoq va "taxminiy"
 * qoidasi serverdagi bilan bir xil.
 */
import "./_xotira";
import { savolIzi } from "../src/lib/blok";
import {
  aniqmi, bobOl, darajaOl, noaniqlar, QISQA, sanoq, savollarYasa, togrimi,
} from "../src/lib/diagnostika";
import { DTM_MAVZULAR } from "../src/lib/dtmMavzu";

let xato = 0;
const t = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

const slugs = DTM_MAVZULAR.map((m) => m.slug);

for (let urinish = 0; urinish < 20; urinish++) {
  const qisqa = savollarYasa(slugs, QISQA);
  const soni = new Map<string, number>();
  for (const s of qisqa) soni.set(s.slug, (soni.get(s.slug) ?? 0) + 1);
  const kam = slugs.filter((s) => soni.get(s) !== QISQA);
  if (kam.length) { t("har mavzudan QISQA savol", false, kam.join(", ")); break; }

  const begona = qisqa.filter((s) => {
    const m = DTM_MAVZULAR.find((x) => x.slug === s.slug)!;
    return !m.boblar.some(([k, ui]) => `${k}|${ui}` === s.bob) || !bobOl(s.bob);
  });
  if (begona.length) { t("savol o'z mavzusining bobidan", false, begona.map((s) => `${s.slug}:${s.bob}`).join(", ")); break; }

  const aniq = savollarYasa(slugs.slice(0, 5), QISQA, qisqa);
  const izlar = [...qisqa, ...aniq].map((s) => savolIzi(s.a));
  if (new Set(izlar).size !== izlar.length) { t("savollar takrorlanmaydi", false, `urinish ${urinish}`); break; }

  const ikki = [...qisqa, ...aniq].filter((s) => s.a.choices.length < 3);
  if (ikki.length) { t("ikki variantli savol yo'q", false, ikki[0]!.a.prompt); break; }

  const qaytgan = JSON.parse(JSON.stringify(qisqa)) as typeof qisqa;
  const buzilgan = qaytgan.filter((s, i) => !togrimi(s, qisqa[i]!.a.answer));
  if (buzilgan.length) { t("JSON dan qaytgan savol javobini taniydi", false, buzilgan[0]!.a.prompt); break; }

  if (urinish === 19) {
    t("har mavzudan QISQA savol (20 marta)", true);
    t("savol o'z mavzusining bobidan", true);
    t("savollar takrorlanmaydi, aniqlashtirishda ham", true);
    t("ikki variantli savol yo'q", true);
    t("JSON dan qaytgan savol javobini taniydi", true);
  }
}

/* ---------------- sanoq ---------------- */
const savollar = savollarYasa(["logarifm", "vektorlar"], 2);
const javob = savollar.map((s) => s.slug === "logarifm");
const s = sanoq(savollar, javob);
const log = s.find((m) => m.s === "logarifm")!;
const vek = s.find((m) => m.s === "vektorlar")!;
t("sanoq 13 mavzu, DTM tartibida", s.length === 13 && s.map((m) => m.s).join() === slugs.join());
t("sanoq to'g'ri", log.t === 2 && log.j === 2 && vek.t === 0 && vek.j === 2, JSON.stringify([log, vek]));
t("bob yig'indisi mavzuga teng", s.every((m) => m.b.reduce((a, b) => a + b.j, 0) === m.j
  && m.b.reduce((a, b) => a + b.t, 0) === m.t));
t("javobsiz savol sanalmaydi", sanoq(savollar, [true]).reduce((a, m) => a + m.j, 0) === 1);
t("bilmayman — xato", !togrimi(savollar[0]!, "bilmayman") && !togrimi(savollar[0]!, null));

/* ---------------- qoidalar (server bilan bir xil) ---------------- */
t("1/2 taxminiy, 2/2 va 0/2 aniq, 4 savol aniq",
  !aniqmi(1, 2) && aniqmi(2, 2) && aniqmi(0, 2) && aniqmi(2, 4) && !aniqmi(0, 0));
t("daraja chegaralari", darajaOl(70) === "kuchli" && darajaOl(69) === "orta" && darajaOl(40) === "orta"
  && darajaOl(39) === "zaif");
t("noaniqlar", noaniqlar([{ s: "a", t: 1, j: 2, b: [] }, { s: "b", t: 2, j: 2, b: [] }]).join() === "a");
t("yaroqsiz bob kaliti", bobOl("yoq|1") === null && bobOl("algebra9|99") === null && bobOl("algebra9|3") !== null);

if (xato) {
  console.log(`\n${xato} ta xato`);
  process.exit(1);
}
console.log("\nBilim xaritasi: hammasi joyida");
