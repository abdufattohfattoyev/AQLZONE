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

tekshir("sinf ro'yxati bo'sh emas", true, S.SINFLAR.length > 10);

// Server FAQAT shu kodlarni qabul qiladi (`MasalaSerializer.validate_sinf`).
// Ro'yxatda boshqa kod bo'lsa, o'sha sinfga yozilgan masala 400
// bilan rad etilardi — va buni faqat yozib ko'rgan odam bilardi.
const yaroqli = (k: number) => (k >= 0 && k <= 11) || (k >= 107 && k <= 110);
const yomon = S.SINFLAR.filter((s) => !yaroqli(s.kod));
tekshir("hamma sinf kodi server qabul qiladigan oraliqda", [],
  yomon.map((s) => `${s.nom}=${s.kod}`));

tekshir("kodlar takrorlanmaydi",
  S.SINFLAR.length, new Set(S.SINFLAR.map((s) => s.kod)).size);
tekshir("noma'lum kod yiqilmaydi", "999", S.sinfNomi(999));
tekshir("ma'lum kod nom beradi", true, S.sinfNomi(1).length > 0);

console.log(xato === 0 ? "\n✅ masala: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
