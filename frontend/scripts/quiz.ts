/**
 * Quiz — mijoz tomonidagi sinov: matndan import va savol tayyorligi.
 *
 * NEGA PARSER. O'qituvchi testni Word yoki Telegram'dan ko'chiradi va
 * har biri o'zicha yozadi: variantlar bir qatorda yoki alohida, to'g'ri
 * javob "*" bilan, "Javob: B" bilan yoki oxirida kalit bilan. Bitta
 * ko'rinish sinsa, o'ttizta savol jimgina "chala" bo'lib qoladi.
 */
const g = globalThis as unknown as Record<string, unknown>;
const xotira = new Map<string, string>([["azapp_til", "uz"]]);
g.localStorage = {
  getItem: (k: string) => xotira.get(k) ?? null,
  setItem: (k: string, v: string) => void xotira.set(k, v),
  removeItem: (k: string) => void xotira.delete(k),
};
g.window = { Telegram: undefined };
g.document = { documentElement: { dataset: {}, style: { setProperty: () => {}, removeProperty: () => {} } } };
g.getComputedStyle = () => ({ getPropertyValue: () => "#0d1230" });

const P = await import("../src/lib/quizMatn.ts");
const Q = await import("../src/lib/quiz.ts");

let xato = 0;
const tekshir = (nom: string, kutilgan: unknown, keldi: unknown) => {
  const ok = JSON.stringify(kutilgan) === JSON.stringify(keldi);
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}${ok ? "" : ` — kutilgan ${JSON.stringify(kutilgan)}, keldi ${JSON.stringify(keldi)}`}`);
};

// Har variant alohida qatorda, belgi bilan.
let r = P.matndanSavollar(`1. 2x + 6 = 14. x ni toping
A) 3
B) 4*
C) 5
2) Kvadrat tomoni 3 sm.
Yuzini toping.
Javob: 9 sm²`);
tekshir("ikki savol ajraldi", 2, r.savollar.length);
tekshir("belgi bilan to'g'ri variant", "4", r.savollar[0]?.javob);
tekshir("variantlar belgisiz", ["3", "4", "5"], r.savollar[0]?.variantlar);
tekshir("variantsiz — yozma", "yozma", r.savollar[1]?.tur);
tekshir("ko'p qatorli shart birlashdi", "Kvadrat tomoni 3 sm. Yuzini toping.", r.savollar[1]?.matn);
tekshir("savol ichidagi javob qatori", "9 sm²", r.savollar[1]?.javob);
tekshir("chala yo'q", 0, r.chala);

// Bir qatorda variantlar va oxirida kalit.
r = P.matndanSavollar(`1) 5 + 7 = ?
A) 11  B) 12  C) 13
2) 3 · 4 = ?
a. 7 b. 12 c. 34

Javoblar: 1-B, 2-b`);
tekshir("bir qatordagi variantlar", ["11", "12", "13"], r.savollar[0]?.variantlar);
tekshir("kalitdan javob (1)", "12", r.savollar[0]?.javob);
tekshir("kichik harfli variant va kalit", "12", r.savollar[1]?.javob);

// Sarlavhasiz kalit va "Javob: 15" qiymat bilan.
r = P.matndanSavollar(`1. 10 + 5
A) 15 B) 16
2. 2 · 9
A) 18 B) 19
3. 1 + 1
A) 2 B) 3
Javob: 2
1-A 2-A`);
tekshir("sarlavhasiz kalit", ["15", "18"], r.savollar.slice(0, 2).map((s) => s.javob));
tekshir("javob qiymat bilan", "2", r.savollar[2]?.javob);

// Javobi yo'q savol tashlanmaydi — chala.
r = P.matndanSavollar("1. Qaysi son tub?\nA) 4 B) 6 C) 7");
tekshir("javobsiz savol qoladi", 1, r.savollar.length);
tekshir("javobsiz — chala", 1, r.chala);
tekshir("chala savol tayyor emas", false, Q.savolTayyor(r.savollar[0]!));
tekshir("shart ichidagi qavs variant emas", 0, P.matndanSavollar("1. f(x) = a) ifoda").savollar[0]?.variantlar.length);
tekshir("musbat son belgi emas", "", P.matndanSavollar("1. ?\nA) +5\nB) -5").savollar[0]?.javob);

// Savol tayyorligi — har tur.
const s = (x: Partial<import("../src/lib/quiz.ts").Savol>) => ({ ...Q.bosh(), matn: "Shart", ...x });
tekshir("tartib: 3 element — tayyor", true, Q.savolTayyor(s({ tur: "tartib", variantlar: ["1", "2", "3"] })));
tekshir("tartib: bo'sh element — yo'q", false, Q.savolTayyor(s({ tur: "tartib", variantlar: ["1", "", "3"] })));
tekshir("juftlash: takror o'ng — yo'q", false,
  Q.savolTayyor(s({ tur: "juftlash", variantlar: [], juftlar: [["a", "1"], ["b", "1"]] })));
tekshir("juftlash: 2 juft — tayyor", true,
  Q.savolTayyor(s({ tur: "juftlash", variantlar: [], juftlar: [["a", "1"], ["b", "2"]] })));
tekshir("rost: javob 0 — tayyor", true, Q.savolTayyor(s({ tur: "rost", variantlar: [], javob: "0" })));
tekshir("turga o'tkazish matnni saqlaydi", "Shart", Q.turgaOtkaz(s({}), "juftlash").matn);
tekshir("juftlash javobi to'liq bo'lsa tayyor", true,
  Q.javobTayyor({ tur: "juftlash", matn: "", variantlar: [], vaqt: 20, chap: ["a", "b"], ong: ["1", "2"] }, ["2", "1"]));
tekshir("tartib javobi chala — tayyor emas", false,
  Q.javobTayyor({ tur: "tartib", matn: "", variantlar: ["a", "b", "c"], vaqt: 20 }, ["a"]));

// Muharrirdagi DTM variantlari soni imtihonnikiga teng (`lib/quiz.ts` DTM_VARIANT).
const I = await import("../src/lib/imtihon.ts");
tekshir("DTM variantlari soni imtihon bilan bir xil", I.VARIANTLAR, Q.DTM_VARIANT);
const dtm = await Q.tayyorTest({ tur: "dtm", n: 1 }, 20);
tekshir("DTM varianti to'liq quizga aylanadi", 30, dtm.length);
tekshir("DTM savollari tayyor", true, dtm.every(Q.savolTayyor));
tekshir("DTM varianti har safar bir xil", JSON.stringify(dtm), JSON.stringify(await Q.tayyorTest({ tur: "dtm", n: 1 }, 20)));

console.log(xato ? `\n❌ quiz: ${xato} ta xato` : "\n✅ quiz: hammasi joyida");
if (xato) process.exit(1);
