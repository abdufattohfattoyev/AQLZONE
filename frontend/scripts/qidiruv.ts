/**
 * Umumiy qidiruvning sinovi (`lib/qidiruv.ts`).
 *
 * NEGA SINOV KERAK. Qidiruv — jim buziladigan narsa. U hech qachon
 * xato bermaydi: noto'g'ri ishlaganda shunchaki BO'SH ro'yxat yoki
 * begona natija qaytaradi va buni faqat o'sha so'zni yozib ko'rgan
 * odam sezadi. Kurs dasturi esa o'sib boradi — bugun ishlagan
 * so'rov ertaga boshqa darsni birinchi o'ringa chiqarib qo'yishi
 * mumkin.
 *
 * Shuning uchun bu yerda HAQIQIY kurs dasturi bo'yicha qidiriladi
 * (soxta ma'lumot emas) va tekshiriladigan narsa aniq: falon
 * so'rovga falon dars birinchi o'nlikda bo'lsin.
 */
const g = globalThis as unknown as Record<string, unknown>;

const xotira = new Map<string, string>();
// TIL SHU YERDA QAT'IY BELGILANADI. Til saqlanmagan bo'lsa `lib/til.ts`
// uni brauzer tilidan TAXMIN qiladi — Node'da esa u tizim tili bo'lib
// chiqadi. Ya'ni bu sinov ruscha Windows'da ruscha nomlarni,
// o'zbekchasida o'zbekchasini tekshirgan bo'lardi va quyidagi
// so'rovlarning yarmi mashinaga qarab qizarardi.
xotira.set("azapp_til", "uz");
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

const Q = await import("../src/lib/qidiruv.ts");

let xato = 0;
const tekshir = (nom: string, ok: boolean, izoh = "") => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— ${izoh}`);
};

/** So'rov natijalarining nomlari. */
const nomlar = (s: string, n = 10) => Q.qidir(s).slice(0, n).map((x) => x.nom);

/** Birinchi `n` ta natija ichida shu matnni o'z ichiga olgani bormi. */
const bor = (s: string, qism: string, n = 10) =>
  nomlar(s, n).some((x) => x.toLowerCase().includes(qism.toLowerCase()));

/* --------------------------------------------------------------- indeks */

const hammasi = Q.indeks();
console.log(`indeksda ${hammasi.length} ta yozuv\n`);

tekshir("indeks bo'sh emas", hammasi.length > 800, `${hammasi.length} ta`);
tekshir("id lar takrorlanmaydi",
  new Set(hammasi.map((y) => y.id)).size === hammasi.length,
  "bir xil id ikki marta uchradi");
tekshir("har yozuvda manzil bor", hammasi.every((y) => y.yol.startsWith("/")));
tekshir("har yozuvda nom bor", hammasi.every((y) => y.nom.trim().length > 0));

const turlar = new Set(hammasi.map((y) => y.tur));
tekshir("hamma tur ishtirok etadi",
  ["dars", "bob", "kurs", "formula", "oyin", "kichkintoy", "bolim"].every((x) => turlar.has(x as never)),
  [...turlar].join(", "));

/* -------------------------------------------------- normallashtirish */

tekshir("apostrof yo'qoladi", Q.nrm("Ko'paytirish") === "kopaytirish", Q.nrm("Ko'paytirish"));
tekshir("burma tirnoq ham", Q.nrm("Ko’paytirish") === "kopaytirish", Q.nrm("Ko’paytirish"));
tekshir("ruscha ё → е", Q.nrm("Объём") === "объем", Q.nrm("Объём"));
tekshir("so'zlarga bo'linadi",
  JSON.stringify(Q.sozlar("  5-sinf,  kasrlar ")) === JSON.stringify(["5", "sinf", "kasrlar"]),
  JSON.stringify(Q.sozlar("  5-sinf,  kasrlar ")));

/* ------------------------------------------------------------ qidirish */

tekshir("bo'sh so'rov — bo'sh ro'yxat", Q.qidir("").length === 0);
tekshir("faqat tinish belgisi ham bo'sh", Q.qidir("  ,, -- ").length === 0);

// APOSTROFSIZ yozish — eng ko'p uchraydigan holat.
tekshir("'kopaytirish' (apostrofsiz) topiladi", bor("kopaytirish", "ko'paytirish"),
  nomlar("kopaytirish").join(" | "));
tekshir("'ko'paytirish' (apostrof bilan) ham", bor("ko'paytirish", "ko'paytirish"),
  nomlar("ko'paytirish").join(" | "));

// Odam eslay oladigan tipik so'rovlar.
tekshir("'kasrlar' → kasr darsi", bor("kasrlar", "kasr"), nomlar("kasrlar").join(" | "));
tekshir("'foiz' → foiz", bor("foiz", "foiz"), nomlar("foiz").join(" | "));
tekshir("'pifagor' → Pifagor", bor("pifagor", "pifagor"), nomlar("pifagor").join(" | "));
tekshir("'sinus' → sinus", bor("sinus", "sinus"), nomlar("sinus").join(" | "));
tekshir("'hosila' → hosila", bor("hosila", "hosila"), nomlar("hosila").join(" | "));

// So'zning BOSHIDAN qidiriladi.
tekshir("'kas' → kasrlar (boshidan)", bor("kas", "kasr"), nomlar("kas").join(" | "));
tekshir("'asr' kasrlarni TOPMAYDI (o'rtadan emas)",
  !bor("asr", "kasr"), nomlar("asr").join(" | "));

// Ikki so'z — ikkalasi ham bo'lishi shart.
const ikki = Q.qidir("kasr qosh");
tekshir("ikki so'zli so'rov ishlaydi", ikki.length > 0, "hech narsa topilmadi");
tekshir("ikkala so'z ham bor",
  ikki.every((y) => y.matn.includes("kasr") && y.matn.includes("qosh")),
  "natijada faqat bitta so'z bor yozuv chiqdi");

// Sinf raqami bilan toraytirish.
const bilan = Q.qidir("9-sinf sinus");
tekshir("'9-sinf sinus' — hammasi 9-sinfdan",
  bilan.length > 0 && bilan.every((y) => y.matn.includes("9")),
  bilan.map((y) => y.izoh).join(" | "));

// Bo'limlar nomi bilan topiladi.
tekshir("'reyting' → Reyting bo'limi",
  Q.qidir("reyting")[0]?.tur === "bolim", Q.qidir("reyting")[0]?.nom ?? "yo'q");

// Yo'q narsa — bo'sh.
tekshir("bo'lmagan so'z hech narsa bermaydi",
  Q.qidir("qwertyuiop").length === 0, nomlar("qwertyuiop").join(" | "));

/* ------------------------------------------------------------ saralash */

// To'liq mos kelgan nom birinchi bo'lishi shart — hatto turi
// pastroq bo'lsa ham. "Kub hajmi" formulasi "Parallelepiped va kub
// hajmi" darsidan oldin turadi, chunki so'rov aynan uning nomi.
const kub = Q.qidir("kub hajmi");
tekshir("to'liq mos nom birinchi — turidan qat'i nazar",
  kub.length > 0 && Q.nrm(kub[0].nom) === "kub hajmi",
  kub.slice(0, 3).map((y) => `${y.tur}:${y.nom}`).join(" | "));

// Avtomatik "Bob takrorlash" haqiqiy darslarni pastga surmasin.
const hosila = Q.qidir("hosila").slice(0, 4);
tekshir("'Bob takrorlash' birinchi to'rtlikda emas",
  !hosila.some((y) => y.nom.toLowerCase().includes("takrorlash")),
  hosila.map((y) => y.nom).join(" | "));

// Dars formuladan oldin turadi (turlar og'irligi).
const kasr = Q.qidir("kasrlarni qoshish");
tekshir("dars formuladan oldin",
  kasr.length > 0 && kasr[0].tur === "dars",
  kasr.slice(0, 3).map((y) => `${y.tur}:${y.nom}`).join(" | "));

/* ------------------------------------------------------ dars manzillari */

const darslar = hammasi.filter((y) => y.tur === "dars");
tekshir("darslar soni to'g'ri", darslar.length > 600, `${darslar.length} ta`);
tekshir("har darsda kursdagi o'rni bor",
  darslar.every((y) => y.joy && y.joy.ui >= 0 && y.joy.li >= 0));
tekshir("dars manzili /kurs/ dan boshlanadi",
  darslar.every((y) => y.yol.startsWith("/kurs/")));

/* ---------------------------------------------------------- ruscha ekran */

/**
 * Ruscha tilda indeks BUTUNLAY ruscha bo'lishi kerak.
 *
 * Bu tekshiruv bekorga emas: formulalarning tarjimasi kurs
 * lug'atida EMAS, ularning o'z `ru` maydonida turadi. Ikkalasi
 * aralashtirilganda ruscha ekranda yolg'iz o'zbekcha qator
 * paydo bo'lardi — aynan shunday bo'lgan edi.
 */
xotira.set("azapp_til", "ru");
Q.keshniTozala();
const T = await import("../src/lib/til.ts");
T.tilniQoy("ru", false);
Q.keshniTozala();

// Tekshiruv KIRILL BORLIGIGA qaraydi, lotin YO'QLIGIGA emas: ruscha
// nomlarda ham lotin harflari bo'lishi normal — ular o'zgaruvchi
// ("Степень — произведение n раз", "Арифметическая: n-й член").
const ruscha = Q.indeks();
const KIRILL = /[а-яё]/i;
const tarjimasiz = ruscha.filter((y) => y.tur === "formula" && !KIRILL.test(y.nom));
tekshir("ruscha ekranda formula nomlari ham ruscha",
  tarjimasiz.length === 0,
  tarjimasiz.slice(0, 3).map((y) => y.nom).join(" | "));

// O'zbekcha so'z bilan qidirish ruscha ekranda ham ishlashi kerak:
// odam ilovani ruschada ochib, mavzuni o'zbekcha eslaydi.
tekshir("ruscha ekranda o'zbekcha so'rov ham topadi",
  Q.qidir("kasrlar").length > 0, "hech narsa topilmadi");
tekshir("ruscha so'rov ham ishlaydi",
  Q.qidir("дроби").length > 0, "hech narsa topilmadi");

console.log(xato === 0 ? "\n✅ qidiruv: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
