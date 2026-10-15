/**
 * DTM mavzu testlari sinovi (`src/lib/dtmMavzu.ts`).
 *
 * Eng muhim va'dalar: har mavzu AYNAN o'z boblaridan yig'iladi (bob
 * raqami siljisa — darslik o'zgargan, mavzu boshqa narsani o'lchay
 * boshlaydi), 7–11 sinfning hech bir bobi chetda qolmaydi va variant
 * har safar bir xil chiqadi.
 */
import "./_xotira";
import { courseById } from "../src/lib/curriculum";
import { imtihonKurslari, manbalar } from "../src/lib/blok";
import { DTM_MAVZULAR, MAVZU_OLCHAM, MAVZU_VARIANTLAR, mavzuFoizi, mavzuYasa } from "../src/lib/dtmMavzu";
import { t as matn } from "../src/lib/matn";

let xato = 0;
const t = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

/* ---------------- boblar joyida ---------------- */
const notogri: string[] = [];
const qamralgan = new Map<string, string>();
for (const m of DTM_MAVZULAR) {
  for (const [kursId, ui, soz] of m.boblar) {
    const nom = courseById(kursId)?.units[ui]?.u ?? "";
    if (!nom.toLowerCase().includes(soz.toLowerCase())) notogri.push(`${m.slug}: ${kursId}[${ui}] = "${nom}"`);
    const k = `${kursId}|${ui}`;
    if (qamralgan.has(k)) notogri.push(`${k} ikki mavzuda: ${qamralgan.get(k)}, ${m.slug}`);
    qamralgan.set(k, m.slug);
  }
}
t("har bob kutilgan joyda va bitta mavzuda", notogri.length === 0, notogri.join("; "));

// Takrorlash boblari o'z savoli emas — chetda qolishi to'g'ri.
const chetda: string[] = [];
for (const c of imtihonKurslari()) {
  c.units.forEach((U, ui) => {
    if (/takrorla/i.test(U.u) || !manbalar(c, c.units, ui).length) return;
    if (!qamralgan.has(`${c.id}|${ui}`)) chetda.push(`${c.id}[${ui}] ${U.u}`);
  });
}
t("7–11 sinfning hamma bobi biror mavzuda", chetda.length === 0, chetda.join("; "));

t("slug'lar takrorlanmaydi", new Set(DTM_MAVZULAR.map((m) => m.slug)).size === DTM_MAVZULAR.length);
t("har mavzuning nomi matnda bor", DTM_MAVZULAR.every((m) => {
  try { return matn(m.nom).length > 3; } catch { return false; }
}));

/* ---------------- variantlar ---------------- */
let kam = 0, begona = 0, bosh = 0, bir = 0, takror = 0;
for (const m of DTM_MAVZULAR) {
  const ruxsat = new Set(m.boblar.map(([k, u]) => `${k}|${u}`));
  const korilgan = new Set<string>();
  for (let n = 1; n <= MAVZU_VARIANTLAR; n++) {
    const v = mavzuYasa(m.slug, n);
    if (!v || v.savollar.length !== MAVZU_OLCHAM.savol || v.daqiqa !== MAVZU_OLCHAM.daqiqa) { kam++; continue; }
    for (const s of v.savollar) {
      if (!ruxsat.has(`${s.kursId}|${s.ui}`)) begona++;
      if (!s.a.prompt || s.a.answer === undefined || s.a.answer === null) bosh++;
    }
    const izi = JSON.stringify(v.savollar.map((s) => s.a.prompt));
    if (izi !== JSON.stringify(mavzuYasa(m.slug, n)?.savollar.map((s) => s.a.prompt))) bir++;
    if (korilgan.has(izi)) takror++;
    korilgan.add(izi);
  }
}
t(`har mavzuda ${MAVZU_VARIANTLAR} ta to'liq variant (${MAVZU_OLCHAM.savol} savol)`, kam === 0, String(kam));
t("savollar faqat mavzuning o'z boblaridan", begona === 0, String(begona));
t("har savolning matni va javobi bor", bosh === 0, String(bosh));
t("bir variant — har safar bir xil", bir === 0, String(bir));
t("variantlar bir-birini takrorlamaydi", takror === 0, String(takror));
t("noto'g'ri mavzu/raqam — null",
  mavzuYasa("yoq", 1) === null && mavzuYasa("logarifm", 0) === null && mavzuYasa("logarifm", MAVZU_VARIANTLAR + 1) === null);

/* ---------------- o'zlashtirish foizi ---------------- */
const r = [
  { kurs: "logarifm", variant: 1, togri: 6, jami: 15, sekund: 1, vaqt: 1 },
  { kurs: "logarifm", variant: 1, togri: 12, jami: 15, sekund: 1, vaqt: 2 },
  { kurs: "logarifm", variant: 2, togri: 9, jami: 15, sekund: 1, vaqt: 3 },
];
t("foiz — variantlardagi eng yaxshisining o'rtachasi", mavzuFoizi(r, "logarifm") === 70, String(mavzuFoizi(r, "logarifm")));
t("ishlanmagan mavzu — null", mavzuFoizi(r, "vektorlar") === null);

console.log(xato ? `\n❌ ${xato} ta xato` : "\n✅ dtm mavzu: hammasi joyida");
if (xato) process.exit(1);
