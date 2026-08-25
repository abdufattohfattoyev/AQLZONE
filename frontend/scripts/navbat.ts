/**
 * Progress saqlash navbatining sinovi (`lib/api.ts` → `putProgress`).
 *
 * NEGA SINOV KERAK. Ilova ochilganda `putProgress` bir necha marta
 * chaqiriladi: kirishdan keyin bir marta, keyin har o'zgarishda. Ular
 * PARALLEL ketganda serverdagi yozuvlar bir-biriga urilardi va SQLite
 * "database is locked" bilan 500 qaytarardi — ya'ni bolaning progressi
 * saqlanmay qolardi.
 *
 * Buni brauzerda ko'rish qiyin: hammasi `try/catch` ichida, ekranda
 * hech narsa o'zgarmaydi. Shuning uchun soxta `fetch` yasab, nechta
 * so'rov ketgani va OXIRGISIDA nima borligi shu yerda tekshiriladi.
 */
const g = globalThis as unknown as Record<string, unknown>;

const xotira = new Map<string, string>();
g.localStorage = {
  getItem: (k: string) => xotira.get(k) ?? null,
  setItem: (k: string, v: string) => void xotira.set(k, v),
  removeItem: (k: string) => void xotira.delete(k),
};
// Token bo'lmasa `putProgress` darhol qaytadi — sinov hech narsa
// ko'rmasdi.
xotira.set("az_token", "SINOV_TOKEN");

g.window = { Telegram: undefined };
g.document = {
  documentElement: {
    dataset: {},
    style: { setProperty: () => {}, removeProperty: () => {} },
  },
};
g.getComputedStyle = () => ({ getPropertyValue: () => "#0d1230" });

/** Ketgan so'rovlar tanasi. */
const sorovlar: Record<string, string>[] = [];
/** Ayni damda javob kutayotgan so'rovni qo'lda tugatish uchun. */
let javobBer: (() => void) | null = null;

g.fetch = (_url: string, sozlama: { body: string }) => {
  const tana = JSON.parse(sozlama.body) as { state: Record<string, string> };
  sorovlar.push(tana.state);
  return new Promise((bajar) => {
    javobBer = () => bajar({ ok: true, status: 200, json: async () => ({ ok: true }) });
  });
};

const api = await import("../src/lib/api.ts");

let xato = 0;
const tekshir = (nom: string, kutilgan: unknown, keldi: unknown) => {
  const ok = JSON.stringify(kutilgan) === JSON.stringify(keldi);
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`, ok ? "" : `— kutilgan ${JSON.stringify(kutilgan)}, keldi ${JSON.stringify(keldi)}`);
};

/** Kutilayotgan mikrovazifalar tugashini kutadi. */
const nafas = () => new Promise((b) => setTimeout(b, 0));

/* ------------------------------------------- uchta chaqiruv, bitta so'rov */

// Aynan ilova ochilishidagi holat: uch marta ketma-ket chaqiriladi va
// birinchisining javobi hali kelmagan.
const a = api.putProgress({ azapp_grade1_v1: "{\"stars\":1}" });
const b = api.putProgress({ azapp_grade1_v1: "{\"stars\":2}" });
const c = api.putProgress({ azapp_grade1_v1: "{\"stars\":3}" });
await nafas();

tekshir("bir vaqtda faqat BITTA so'rov ketadi", 1, sorovlar.length);
tekshir("birinchisi o'zgarmaydi", "{\"stars\":1}", sorovlar[0]?.azapp_grade1_v1);

// Birinchi so'rov tugadi — endi navbatdagi (ENG OXIRGI) holat ketadi.
javobBer?.();
await nafas();

tekshir("javobdan keyin yana bitta so'rov", 2, sorovlar.length);
// Progress TO'LIQ holat bo'lib boradi, ya'ni uchinchisi ikkinchisini
// o'z ichiga oladi. O'rtadagisini yuborish behuda so'rov bo'lardi.
tekshir("o'rtadagisi tashlanadi, oxirgisi ketadi",
  "{\"stars\":3}", sorovlar[1]?.azapp_grade1_v1);

javobBer?.();
await Promise.all([a, b, c]);
await nafas();
tekshir("navbat tugadi — ortiqcha so'rov yo'q", 2, sorovlar.length);

/* --------------------------------- navbat bo'shagach yangisi darhol ketadi */

const d = api.putProgress({ azapp_grade1_v1: "{\"stars\":9}" });
await nafas();
javobBer?.();
await d;
tekshir("keyingi saqlash bloklanmaydi", 3, sorovlar.length);
tekshir("va o'z holatini olib boradi", "{\"stars\":9}", sorovlar[2]?.azapp_grade1_v1);

console.log(xato === 0 ? "\n✅ navbat: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
