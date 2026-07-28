/**
 * Sinov rejimi — kirishsiz o'ynash.
 *
 * Ilgari saytga birinchi marta kirgan odam darhol "Telegram bilan kirish"
 * ekraniga urilardi va bironta savol ham ko'rmasdi. Reklama uchun bu
 * halokat: odam hali ishonmagan mahsulotga hisob ochishga rozi bo'lmaydi
 * va orqaga qaytadi. Endi u avval O'YNAYDI, keyin taklif ko'radi.
 *
 * Taklif qachon chiqadi. Birinchi dars tugagandan keyin — aynan bola
 * yulduzini ko'rgan, ya'ni nimadir YUTGAN paytda. Shunda kirish yo'qotish
 * emas, saqlash bo'lib tuyuladi. "Keyinroq" desa, keyingi taklif uch
 * darsdan so'ng: har dars oxirida so'rash — bu ilovadan quvish demak.
 *
 * Nega progress yo'qolmaydi. Kirishsiz o'ynagan bolaning natijasi anonim
 * hisobda serverda turadi (`auth/device`), va Telegram bilan kirganda u
 * hisob botning hisobiga QO'SHILADI (`auth/kod` → `_hisoblarni_birlashtir`).
 * Ya'ni sinov paytida yig'ilgan yulduzlar kirgandan keyin ham qoladi.
 */

const DARS_KEY = "az_sinov_darslar";
const SORALDI_KEY = "az_sinov_soraldi";

/** Birinchi taklif shu darsdan keyin chiqadi. */
const BIRINCHI = 1;

/** Keyingi takliflar orasida shuncha dars bo'ladi. */
const ORALIQ = 3;

/**
 * Ro'yxatdan o'tgan odam uchun butun modul o'chiq turadi.
 *
 * Bayroqni `Tanishuv` qo'yadi — server javobini biladigan yagona joy shu.
 * Boshlang'ich qiymat `true`: hali bilmasak, taklif KO'RSATILMAYDI. Teskari
 * xato ko'proq zarar qilardi — kirgan odamga "kiring" deyilishi ilovaning
 * buzuqligini ko'rsatadi.
 */
let royxatdan = true;

export function royxatniBelgila(qiymat: boolean): void {
  royxatdan = qiymat;
  if (qiymat) tozala();
}

function son(kalit: string): number {
  const x = Number(localStorage.getItem(kalit));
  return Number.isFinite(x) && x > 0 ? Math.floor(x) : 0;
}

function yoz(kalit: string, qiymat: number): void {
  try {
    localStorage.setItem(kalit, String(qiymat));
  } catch {
    /* xotira to'lgan — sinov hisobi yo'qoladi, ilova ishlayveradi */
  }
}

/** Kirishsiz tugatilgan darslar soni. */
export function sinovDarslari(): number {
  return son(DARS_KEY);
}

function tozala(): void {
  try {
    localStorage.removeItem(DARS_KEY);
    localStorage.removeItem(SORALDI_KEY);
  } catch { /* muhim emas */ }
}

/* ------------------------------------------------- taklif hodisasi */

type Tinglovchi = (yulduz: number) => void;
const tinglovchilar = new Set<Tinglovchi>();

/**
 * Taklifni ko'rsatadigan joy shu yerga obuna bo'ladi (`Tanishuv`).
 *
 * Context o'rniga oddiy obuna: taklif butun daraxtga emas, BITTA
 * komponentga kerak, va uni context qilish har render'da qayta
 * hisoblanadigan qiymat qo'shardi.
 */
export function taklifgaObuna(f: Tinglovchi): () => void {
  tinglovchilar.add(f);
  return () => { tinglovchilar.delete(f); };
}

/**
 * Dars tugadi — sanaymiz va kerak bo'lsa taklif chiqaramiz.
 *
 * Ro'yxatdan o'tganlarda hech narsa qilmaydi.
 */
export function darsTugadi(yulduz: number): void {
  if (royxatdan) return;

  const n = sinovDarslari() + 1;
  yoz(DARS_KEY, n);

  const oxirgi = son(SORALDI_KEY);
  const kerak = oxirgi === 0 ? n >= BIRINCHI : n - oxirgi >= ORALIQ;
  if (!kerak) return;

  yoz(SORALDI_KEY, n);
  for (const f of tinglovchilar) f(yulduz);
}
