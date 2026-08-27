/**
 * Masalalar bo'limining mijoz tomonidagi sinovi.
 *
 * NEGA AYNAN OVOZ. Like/dislike tugmasi bosilganda ekran DARHOL
 * o'zgaradi — server javobini kutmasdan. Busiz tugma bosilib, yarim
 * soniya hech narsa bo'lmasa, odam uni ikkinchi marta bosadi va
 * o'z ovozini o'zi qaytarib olardi.
 *
 * Lekin "darhol o'zgarish" degani sonlarni QO'LDA hisoblash degani
 * va uch holat bor: qo'yish, olib tashlash, ALMASHTIRISH. Uchinchisi
 * eng nozigi — ikkala son bir vaqtda o'zgaradi. Bu xato jim
 * o'tadi: ekranda 5 turadi, bazada 4 — va buni faqat sahifani
 * yangilagan odam sezadi.
 *
 * Sinf ro'yxati ham shu yerda tekshiriladi: u kurslardan yasaladi
 * va serverning qabul qiladigan kodlariga mos bo'lishi shart, aks
 * holda yozilgan masala hech qaysi filtrga tushmasdi.
 */
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

const M = await import("../src/lib/masalaOvoz.ts");
const S = await import("../src/lib/masalaSinf.ts");
const T = await import("../src/lib/masalaTekshir.ts");

let xato = 0;
const tekshir = (nom: string, kutilgan: unknown, keldi: unknown) => {
  const ok = JSON.stringify(kutilgan) === JSON.stringify(keldi);
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`,
    ok ? "" : `— kutilgan ${JSON.stringify(kutilgan)}, keldi ${JSON.stringify(keldi)}`);
};

/* ------------------------------------------------------- ovoz almashishi */

tekshir("bo'shdan like", "like", M.kelasiOvoz("", "like"));
tekshir("bo'shdan dislike", "dislike", M.kelasiOvoz("", "dislike"));
tekshir("like ustiga like — QAYTARIB OLINADI", "", M.kelasiOvoz("like", "like"));
tekshir("dislike ustiga dislike — qaytariladi", "", M.kelasiOvoz("dislike", "dislike"));
tekshir("like ustiga dislike — almashadi", "dislike", M.kelasiOvoz("like", "dislike"));
tekshir("dislike ustiga like — almashadi", "like", M.kelasiOvoz("dislike", "like"));

/* ---------------------------------------------------------- sanoqlar */

const boshlangich = { like: 5, dislike: 2 };

tekshir("like qo'yildi", { like: 6, dislike: 2 },
  M.sanoqniHisobla(boshlangich, "", "like"));
tekshir("dislike qo'yildi", { like: 5, dislike: 3 },
  M.sanoqniHisobla(boshlangich, "", "dislike"));
tekshir("like olib tashlandi", { like: 4, dislike: 2 },
  M.sanoqniHisobla(boshlangich, "like", ""));

// ENG NOZIK HOLAT: ikkala son bir vaqtda o'zgaradi.
tekshir("like → dislike: ikkalasi ham o'zgaradi", { like: 4, dislike: 3 },
  M.sanoqniHisobla(boshlangich, "like", "dislike"));
tekshir("dislike → like: ikkalasi ham o'zgaradi", { like: 6, dislike: 1 },
  M.sanoqniHisobla(boshlangich, "dislike", "like"));

// Manfiyga tushmasin: server bilan mijoz bir lahza mos kelmasligi
// mumkin va o'shanda ekranda "−1 like" turib qolardi.
tekshir("nol ustidan olib tashlansa manfiy bo'lmaydi", { like: 0, dislike: 0 },
  M.sanoqniHisobla({ like: 0, dislike: 0 }, "like", ""));

// Ketma-ket bosishlar: like → dislike → dislike (qaytarish).
{
  let ovoz: "" | "like" | "dislike" = "";
  let sonlar = { like: 5, dislike: 2 };
  for (const bosilgan of ["like", "dislike", "dislike"] as const) {
    const yangi = M.kelasiOvoz(ovoz, bosilgan);
    sonlar = M.sanoqniHisobla(sonlar, ovoz, yangi);
    ovoz = yangi;
  }
  tekshir("uch bosishdan keyin boshlang'ich holatga qaytadi",
    { ovoz: "", sonlar: { like: 5, dislike: 2 } }, { ovoz, sonlar });
}

/* ------------------------------------------------------------- sinflar */

tekshir("toifalar ro'yxati bo'sh emas", true, S.TOIFALAR.length > 10);

// Server FAQAT shu kodlarni qabul qiladi (`MasalaSerializer.validate_sinf`).
// Ro'yxatda boshqa kod bo'lsa, o'sha toifaga yozilgan masala 400
// bilan rad etilardi — va buni faqat yozib ko'rgan odam bilardi.
const yaroqli = (k: number) =>
  (k >= 0 && k <= 11) || (k >= 107 && k <= 110) || k === S.KATTALAR || k === S.OLIMPIADA;
const yomon = S.TOIFALAR.filter((s) => !yaroqli(s.kod));
tekshir("hamma toifa kodi server qabul qiladigan oraliqda", [],
  yomon.map((s) => `${s.nom}=${s.kod}`));

tekshir("kodlar takrorlanmaydi",
  S.TOIFALAR.length, new Set(S.TOIFALAR.map((s) => s.kod)).size);

// Kursdan tashqari toifalar ENG BOSHIDA turishi kerak: ular o'n
// oltita sinfning ostida qolsa, faqat oxirigacha surgan odam
// ko'rardi — ya'ni deyarli hech kim.
tekshir("kursdan tashqari toifalar boshida", [false, false],
  S.TOIFALAR.slice(0, 2).map((x) => x.kursdan));
tekshir("kattalar toifasi bor", true, S.TOIFALAR.some((x) => x.kod === S.KATTALAR));
tekshir("olimpiada toifasi bor", true, S.TOIFALAR.some((x) => x.kod === S.OLIMPIADA));
tekshir("kattalar nomi bo'sh emas", true, S.sinfNomi(S.KATTALAR).length > 3);
tekshir("noma'lum kod yiqilmaydi", "999", S.sinfNomi(999));
tekshir("ma'lum kod nom beradi", true, S.sinfNomi(1).length > 0);

/* ------------------------------------------------------- sinf setkasi */

// Setka kurslardan yasaladi. 7–10 sinflarda ikki fan bor va ular
// BITTA plitka ostida turishi kerak — aks holda setka o'n oltita
// katakka cho'zilib, "sinf" degan tushuncha yo'qolardi: odam 1 dan
// 11 gacha sanay olmay qolardi.
const guruhlar = S.SINF_GURUHLARI;

tekshir("setkada takroriy sinf yo'q",
  guruhlar.length, new Set(guruhlar.map((g) => g.sinf)).size);
tekshir("setka 0 dan 11 gacha", { a: 0, b: 11 },
  { a: Math.min(...guruhlar.map((g) => g.sinf)), b: Math.max(...guruhlar.map((g) => g.sinf)) });
tekshir("7–10 sinflar ikki fanli", [7, 8, 9, 10],
  guruhlar.filter((g) => g.fanlar.length > 1).map((g) => g.sinf));
tekshir("har fan kodi toifalar ro'yxatida ham bor", true,
  guruhlar.every((g) => g.fanlar.every((f) => S.TOIFALAR.some((x) => x.kod === f.kod))));
// Fan nomidan sinf raqami olib tashlanadi ("8-sinf Algebra" →
// "Algebra"): raqam plitkada allaqachon turibdi va uni takrorlash
// katakni kengaytirib, setkani buzardi.
tekshir("fan nomida sinf raqami qolmagan", true,
  guruhlar.every((g) => g.fanlar.every((f) => !/\d/.test(f.nom))));

/* -------------------------------------------- yozish tekshiruvlari */

const belgilar = (lar: { kalit: string; holat: string }[]) =>
  lar.map((b) => `${b.holat}:${b.kalit}`);

tekshir("bo'sh matnda belgi yo'q", [], belgilar(T.matnBelgilari("   ")));
tekshir("qisqa matn ogohlantiradi", true,
  belgilar(T.matnBelgilari("2+2?")).includes("ogoh:tekshirQisqa"));
tekshir("uzun matn yashil", true,
  belgilar(T.matnBelgilari("Savatda 20 ta olma bor edi, nechta qoldi?"))
    .includes("ok:tekshirUzunlik"));

// Savol belgisiz ham savol bo'lishi mumkin — "nechta", "toping".
tekshir("savol belgisi tanildi", true,
  belgilar(T.matnBelgilari("Savatda 20 ta olma bor edi. Nechta qoldi?"))
    .includes("ok:tekshirSavol"));
tekshir("so'roq so'zi ham yetadi", true,
  belgilar(T.matnBelgilari("Uchburchakning yuzini toping va javobni yozing"))
    .includes("ok:tekshirSavol"));
tekshir("savolsiz matn ogohlantiradi", true,
  belgilar(T.matnBelgilari("Bir savatda yigirmata olma bor edi va sakkiztasi ketdi"))
    .includes("ogoh:tekshirSavolYoq"));

tekshir("uzun javob ogohlantiradi", true,
  belgilar(T.javobBelgilari("avval 20 dan 8 ni ayiramiz keyin 5 qo'shamiz"))
    .includes("ogoh:tekshirJavobUzun"));
tekshir("sonsiz javob ogohlantiradi", true,
  belgilar(T.javobBelgilari("o'n yetti")).includes("ogoh:tekshirJavobSonsiz"));

// ENG FOYDALI TEKSHIRUV: javob yechim ichida uchraydimi. Muallif
// javobga 17 yozib, yechimni "= 15" bilan tugatsa — bu haqiqiy
// e'tiborsizlik va uni tasdiqlashdan OLDIN aytish kerak.
tekshir("javob yechimda topiladi", true,
  belgilar(T.yechimBelgilari("20 - 8 = 12, keyin 12 + 5 = 17", "17"))
    .includes("ok:tekshirJavobBor"));
tekshir("mos kelmagan javob tutiladi", true,
  belgilar(T.yechimBelgilari("20 - 8 = 12, keyin 12 + 3 = 15", "17"))
    .includes("ogoh:tekshirJavobYoq"));

// Solishtiruv server bilan BIR XIL normallashadi (`javob_normal`):
// bo'sh joy, vergul va harf katta-kichikligi farq qilmasin.
tekshir("bo'sh joy va vergul ahamiyatsiz", true,
  belgilar(T.yechimBelgilari("natija = 3.5 sm bo'ladi", " 3,5 SM "))
    .includes("ok:tekshirJavobBor"));

tekshir("javob yozilmagan bo'lsa solishtirilmaydi", false,
  belgilar(T.yechimBelgilari("20 - 8 = 12", "")).some((x) => x.includes("tekshirJavobBor")
    || x.includes("tekshirJavobYoq")));
tekshir("amalsiz yechim ogohlantiradi", true,
  belgilar(T.yechimBelgilari("Javob o'n yetti bo'ladi", "")).includes("ogoh:tekshirQadamYoq"));

console.log(xato === 0 ? "\n✅ masala: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
