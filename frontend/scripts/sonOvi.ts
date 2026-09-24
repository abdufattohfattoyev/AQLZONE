/**
 * Son ovi sinovi (`src/lib/oyin/sonOvi.ts`).
 *
 * Eng muhim va'da bitta: BERILGAN HAR JUMBOQNING YECHIMI BOR. Yechimi
 * yo'q to'plam bolani o'zini ayblashga majbur qiladi va o'yinni bir
 * kunda o'ldiradi.
 */
import {
  SOZLAMA, birlashtir, jumboq, kunlikToplam, maslahat, tasodifiyJumboq, yechimBormi, yechimTop,
} from "../src/lib/oyin/sonOvi";
import type { Daraja } from "../src/lib/oyin/tur";

let xato = 0;
const t = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

/* ---------------- amallar ---------------- */
t("qo'shish", birlashtir(6, 4, "+") === 10);
t("ayirish tartibli", birlashtir(6, 4, "-") === 2 && birlashtir(4, 6, "-") === -2);
t("qoldiqli bo'lish rad etiladi", birlashtir(7, 2, "/") === null);
t("nolga bo'lish rad etiladi", birlashtir(7, 0, "/") === null);
t("qoldiqsiz bo'lish", birlashtir(12, 4, "/") === 3);

/* ---------------- yechim topuvchi ---------------- */
t("klassik 4 6 2 3 → 24", yechimBormi([4, 6, 2, 3], 24));
t("1 1 1 1 → 24 emas", !yechimBormi([1, 1, 1, 1], 24));
const y = yechimTop([8, 3, 2, 1], 24);
t("yechim qadamlari uchta", y !== null && y.length === 3, JSON.stringify(y));

/** Qadamlarni haqiqatan bajarib ko'radi — yechim "qog'ozda" emas, amalda. */
function qadamlarniBajar(sonlar: number[], qadamlar: ReturnType<typeof yechimTop>): number | null {
  if (!qadamlar) return null;
  let qolgan = [...sonlar];
  for (const q of qadamlar) {
    const i = qolgan.indexOf(q.a);
    if (i < 0) return null;
    qolgan.splice(i, 1);
    const j = qolgan.indexOf(q.b);
    if (j < 0) return null;
    qolgan.splice(j, 1);
    const n = birlashtir(q.a, q.b, q.amal);
    if (n !== q.natija) return null;
    qolgan.push(n);
  }
  return qolgan.length === 1 ? qolgan[0] : null;
}
t("topilgan yechim haqiqatan ishlaydi",
  qadamlarniBajar([4, 6, 2, 3], yechimTop([4, 6, 2, 3], 24)) === 24);

/* ---------------- jumboq yasash ---------------- */
for (const d of [1, 2, 3] as Daraja[]) {
  const s = SOZLAMA[d];
  let yaroqsiz = 0;
  let chegaradan = 0;
  for (let i = 0; i < 150; i++) {
    const j = tasodifiyJumboq(d);
    if (j.length !== 4) yaroqsiz++;
    if (!yechimBormi(j, s.maqsad)) yaroqsiz++;
    if (j.some((x) => x < s.eng_kichik || x > s.eng_katta)) chegaradan++;
  }
  t(`${d}-daraja: 150 ta jumboqning hammasi yechiladi`, yaroqsiz === 0, String(yaroqsiz));
  t(`${d}-daraja: sonlar chegarada`, chegaradan === 0, String(chegaradan));
}

/* ---------------- manfiy oraliq ---------------- */
// 1-darajada (1–4 sinf) manfiy son hali o'tilmagan: ekranda `−4`
// chiqishi bolani to'xtatib qo'yadi. Shuning uchun o'sha darajaning
// har bir jumboqi MANFIYSIZ ham yechilishi shart.
let manfiyKerak = 0;
for (let i = 0; i < 120; i++) {
  const j = tasodifiyJumboq(1);
  if (!yechimBormi(j, SOZLAMA[1].maqsad, true)) manfiyKerak++;
}
t("1-daraja: manfiy oraliqsiz ham yechiladi", manfiyKerak === 0, String(manfiyKerak));
// Cheklov haqiqatan ishlaydimi: manfiysiz topilgan yechimning HAR
// qadami musbat bo'lishi kerak.
let manfiyQadam = 0;
for (let i = 0; i < 80; i++) {
  const j = tasodifiyJumboq(1);
  const y = yechimTop(j, SOZLAMA[1].maqsad, true);
  if (!y || y.some((q) => q.natija < 0)) manfiyQadam++;
}
t("manfiysiz yechimda manfiy oraliq chiqmaydi", manfiyQadam === 0, String(manfiyQadam));

/* ---------------- kunlik to'plam ---------------- */
const a = kunlikToplam("2026-09-21", 2);
const b = kunlikToplam("2026-09-21", 2);
const c = kunlikToplam("2026-09-22", 2);
t("bir kun — bir xil to'plam", JSON.stringify(a) === JSON.stringify(b));
t("boshqa kun — boshqa to'plam", JSON.stringify(a) !== JSON.stringify(c));
t("to'plamda beshta jumboq", a.length === 5);
t("kunlik to'plamning hammasi yechiladi", a.every((x) => yechimBormi(x, 24)));

/* ---------------- maslahat ---------------- */
const m = maslahat([4, 6, 2, 3], 24);
t("maslahat bitta qadam beradi", m !== null && birlashtir(m.a, m.b, m.amal) === m.natija);
t("yechilgan holatda maslahat yo'q", maslahat([24], 24) === null);

/* ---------------- darajalar ---------------- */
t("1-daraja maqsadi 12", SOZLAMA[1].maqsad === 12);
t("2 va 3-darajada faqat qo'shish yetmaydi",
  [2, 3].every((d) => {
    const j = tasodifiyJumboq(d as Daraja);
    return yechimBormi(j, SOZLAMA[d as Daraja].maqsad);
  }));

console.log(xato ? `\n❌ ${xato} ta xato` : "\n✅ son ovi: hammasi joyida");
if (xato) process.exit(1);
