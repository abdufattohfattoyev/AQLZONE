/**
 * RASMIY NAMUNA — Baholash agentligining matematikadan namunaviy
 * topshiriqlari (uzbmb.uz, "Matematika fanidan namunaviy test
 * topshiriqlari", 45 topshiriq).
 *
 * Boshqa variantlar generatordan yasaladi (`lib/sertifikat.ts`), bu esa
 * haqiqiy imtihon savollari: shart, javob variantlari va har topshiriqning
 * BALLI rasmiy varaqdagidek. Rasmiy varaqda javoblar kaliti yo'q edi —
 * har javob qo'lda yechib, sinovda (`scripts/sertifikat.ts`) qaytadan
 * hisoblanadi.
 *
 * Chizmalar (`lib/sertRasm.ts`) rasmiy chizmaga qarab qayta chizilgan:
 * o'lchamlari va yozuvlari o'sha, faqat rang mavzuga moslashadi.
 */
import type { BlokSavol } from "./blok";
import type { RasmiyQ } from "./activity";
import type { SSavol, SVariant } from "./sertifikat";
import * as R from "./sertRasm";

/** Ro'yxatdagi qaysi variant rasmiy namuna. */
export const RASMIY_RAQAM = 1;

interface Mavzu { kursId: string; ui: number; mavzu: string }

const M = {
  a7son: { kursId: "algebra7", ui: 0, mavzu: "1-bob. Algebraik ifodalar" },
  a7tenglama: { kursId: "algebra7", ui: 1, mavzu: "2-bob. Birinchi darajali tenglamalar" },
  a7kasr: { kursId: "algebra7", ui: 4, mavzu: "5-bob. Algebraik kasrlar" },
  a8tengsizlik: { kursId: "algebra8", ui: 1, mavzu: "2-bob. Tengsizliklar" },
  a8kvadrat: { kursId: "algebra8", ui: 2, mavzu: "3-bob. Kvadrat tenglamalar" },
  a8malumot: { kursId: "algebra8", ui: 3, mavzu: "4-bob. Ma'lumotlar tahlili" },
  a9funksiya: { kursId: "algebra9", ui: 0, mavzu: "1-bob. Kvadrat funksiya" },
  a9trig: { kursId: "algebra9", ui: 2, mavzu: "3-bob. Trigonometriya elementlari" },
  a9progressiya: { kursId: "algebra9", ui: 3, mavzu: "4-bob. Progressiyalar" },
  a9ehtimol: { kursId: "algebra9", ui: 4, mavzu: "5-bob. Ehtimolliklar nazariyasi" },
  a10takror: { kursId: "algebra10", ui: 0, mavzu: "1-bob. Takrorlash" },
  a10funksiya: { kursId: "algebra10", ui: 1, mavzu: "2-bob. Elementar funksiyalar" },
  a10irratsional: { kursId: "algebra10", ui: 2, mavzu: "3-bob. Ratsional va irratsional tenglamalar" },
  a10logarifm: { kursId: "algebra10", ui: 3, mavzu: "4-bob. Ko'rsatkichli va logarifmik funksiyalar" },
  a10trig: { kursId: "algebra10", ui: 4, mavzu: "5-bob. Trigonometrik tenglamalar" },
  g7burchak: { kursId: "geometriya7", ui: 1, mavzu: "2-bob. Burchak" },
  g7uchburchak: { kursId: "geometriya7", ui: 2, mavzu: "3-bob. Ko'pburchak va uchburchak" },
  g8uchburchak: { kursId: "geometriya8", ui: 1, mavzu: "2-bob. To'g'ri burchakli uchburchak" },
  g8yuz: { kursId: "geometriya8", ui: 3, mavzu: "4-bob. Yuz" },
  g8aylana: { kursId: "geometriya8", ui: 4, mavzu: "5-bob. Aylana" },
  g10planimetriya: { kursId: "geometriya10", ui: 0, mavzu: "1-bob. Planimetriyani takrorlash" },
  g10perpendikulyar: { kursId: "geometriya10", ui: 3, mavzu: "4-bob. Fazoda perpendikulyarlik" },
  m11hosila: { kursId: "matematika11", ui: 0, mavzu: "1-bob. Hosila" },
  m11tatbiq: { kursId: "matematika11", ui: 1, mavzu: "2-bob. Hosilaning tatbiqlari" },
  m11integral: { kursId: "matematika11", ui: 2, mavzu: "3-bob. Integral" },
  m11prizma: { kursId: "matematika11", ui: 3, mavzu: "4-bob. Prizma va silindr" },
  m11piramida: { kursId: "matematika11", ui: 4, mavzu: "5-bob. Piramida, konus, shar" },
} satisfies Record<string, Mavzu>;

interface Sh { p: string; f?: string; rasm?: string }

/** Bitta test savoli: shart, 4 variant (A–D), to'g'ri harf indeksi, ball, mavzu. */
type Y1 = [Sh, [string, string, string, string], 0 | 1 | 2 | 3, 1.3 | 2.2, Mavzu];

const T = 2.2, Y = 1.3;

/** 1–32. Tartib va ballar rasmiy varaqdagidek (10 tasi 1,3; 22 tasi 2,2). */
const TEST: Y1[] = [
  [{ p: "a va b natural sonlar uchun a · b = 30 bo'lsa, a + 2b − 1 ifodaning eng kichik qiymatini toping." },
    ["16", "15", "12", "31"], 1, Y, M.a7son],
  [{ p: "Hisoblang:", f: "7,2(1) − 4,4(2) + 31/90" },
    ["3,1(3)", "3,1(2)", "2,1(3)", "2,1(2)"], 0, T, M.a7son],
  [{ p: "Do'kon 3 kunda jami 175 kg kartoshka sotdi. Agar ikkinchi kun uchinchi kunga nisbatan 1,5 marta ko'p, birinchi kun esa ikkinchi kunga nisbatan 2,4 marta kam kartoshka sotgan bo'lsa, do'kon birinchi kun necha kilogramm kartoshka sotgan?" },
    ["35", "44", "56", "27"], 0, T, M.a7tenglama],
  [{ p: "Xonaga eni hamda bo'yi 2,4 m va 4 m bo'lgan gilam to'shalgan. Agar xonaning eni hamda bo'yi 4 m va 6 m bo'lsa, xona yuzining necha foizini gilam egallagan?" },
    ["55", "40", "60", "45"], 1, T, M.a7tenglama],
  [{ p: "Ifodaning qiymatini toping:", f: "(√(4 − √7) + √(4 + √7))²" },
    ["7", "14", "11", "22"], 1, Y, M.a10takror],
  [{ p: "Quyidagi sonlarni o'sish tartibida joylashtiring:", f: "a = 6,  b = 4√2,  c = 2√10" },
    ["a < b < c", "c < b < a", "b < a < c", "c < a < b"], 2, Y, M.a10takror],
  [{ p: "Soddalashtiring:", f: "(√7 + 1 − √3)(√7 + √3 − 1)" },
    ["5 + 2√3", "3 − 2√3", "5 − 2√3", "3 + 2√3"], 3, T, M.a10takror],
  [{ p: "Agar {aₙ} arifmetik progressiyada a₁₀ + a₁₂ = 25 va a₂₀ + a₂₂ = 45 bo'lsa, a₁₁ + a₂₁ ni toping." },
    ["25", "35", "30", "20"], 1, T, M.a9progressiya],
  [{ p: "Agar {bₙ} geometrik progressiyada b₃ = 18 va S₃ = 26 bo'lsa, b₁ ni toping." },
    ["8 yoki 16", "6 yoki 36", "2 yoki 32", "4 yoki 64"], 2, T, M.a9progressiya],
  [{ p: "Agar x − y = 5 bo'lsa, 6x + 5 − 6y ning qiymatini toping." },
    ["35", "25", "30", "40"], 0, Y, M.a7son],
  [{ p: "Agar n = −3, m = −2 va k = 3 bo'lsa, ifodaning qiymatini toping:", f: "(4n²/m)² · k/(m²n²) : k³/(mn)³ · mk²/n³" },
    ["288", "48", "−48", "144"], 3, T, M.a7kasr],
  [{ p: "Soddalashtiring:", f: "(cos 3α + cos α)/(sin 3α − sin α)" },
    ["tg α", "ctg α", "2 ctg α", "2 tg α"], 1, Y, M.a9trig],
  [{ p: "Hisoblang:", f: "2 · (sin⁴(π/8) + cos⁴(3π/8) + sin⁴(5π/8) + cos⁴(7π/8))" },
    ["3,5", "2", "3", "1"], 2, T, M.a10trig],
  [{ p: "Tenglamaning barcha haqiqiy ildizlari yig'indisini (agar u bitta bo'lsa, shu haqiqiy ildizni) toping.", f: "3³ˣ − 2 · 3²ˣ + 9 · 3ˣ⁻² = 0" },
    ["−1", "0,5", "0", "1"], 2, T, M.a10logarifm],
  [{ p: "Tenglama nechta haqiqiy ildizga ega?", f: "log₇(3x + 5) + √(log₇²(2x + 5)) = 0" },
    ["3", "1", "0", "2"], 1, T, M.a10logarifm],
  [{ p: "Tenglamaning ildizlari x₁ va x₂ bo'lsa, 1/x₁ + 1/x₂ ni hisoblang.", f: "2x² − 5x − 3 = 0" },
    ["−3/5", "−5/3", "5/3", "3/5"], 1, Y, M.a8kvadrat],
  [{ p: "Tenglamaning haqiqiy ildizlari yig'indisini toping.", f: "x²/3 + 48/x² = 10(x/3 − 4/x)" },
    ["10", "6", "−1", "4"], 0, T, M.a8kvadrat],
  [{ p: "Tengsizlikni yeching.", f: "√(x + 18) < 2 − x" },
    ["(−18; −1)", "[−18; −2)", "(−18; 2)", "[−18; +∞)"], 1, Y, M.a10irratsional],
  [{ p: "Tengsizlikning barcha butun yechimlari yig'indisini toping.", f: "(5x + 3)/(x² + x − 2) > 1" },
    ["9", "10", "15", "14"], 0, T, M.a8tengsizlik],
  [{ p: "Quyidagi funksiyalardan qaysi biri toq funksiya?" },
    ["y = x⁴ + ctg x", "y = x²/(1 + lg x)", "y = sin x · (1 + x²)", "y = √x + x⁴"], 2, Y, M.a10funksiya],
  [{ p: "Agar f(x) = x² − 1 va g(x) = 3 − 2x bo'lsa, f(g(x)) ni toping." },
    ["4x² − 12x + 8", "4x² + 12x − 8", "5 − 2x²", "4x² − 6x + 8"], 0, T, M.a10funksiya],
  [{ p: "f(t) = t⁴ − 2t² + 1 bo'lsa, f′(1) ni hisoblang." },
    ["0", "4", "2", "8"], 0, T, M.m11hosila],
  [{ p: "Funksiyaning boshlang'ich funksiyasini toping.", f: "f(x) = 1/(1 − cos(−x + 8π))" },
    ["½ tg(x/2) + C", "−½ ctg(x/2) + C", "−ctg(x/2) + C", "−tg(x/2) + C"], 2, T, M.m11integral],
  [{ p: "Ikki to'g'ri chiziqning kesishishidan hosil bo'lgan qo'shni burchaklarning ayirmasi 20° ga teng bo'lsa, bu burchaklardan kichigini toping." },
    ["90°", "80°", "60°", "70°"], 1, Y, M.g7burchak],
  [{ p: "ABC teng yonli (AB = BC) uchburchakning BD medianasi uzunligi 4 cm ga teng. Agar ABD uchburchak perimetri 12 cm ga teng bo'lsa, ABC uchburchak perimetrini (cm) toping." },
    ["9", "8", "16", "18"], 2, Y, M.g7uchburchak],
  [{ p: "Aylana 13 : 14 : 9 nisbatda uchta yoyga bo'lingan va bo'linish nuqtalari tutashtirilib uchburchak hosil qilingan. Agar hosil bo'lgan uchburchakning kichik tomoni ⁴√12 cm ga teng bo'lsa, aylanaga tashqi chizilgan muntazam uchburchakning yuzini (cm²) toping." },
    ["2⁴√3", "9", "36", "3√3"], 1, T, M.g10planimetriya],
  [{ p: "Chizmadagi ABCD parallelogrammning yuzi 64 cm² ga teng bo'lsa, FKCD to'rtburchakning yuzini (cm²) toping. Bunda AF/FD = 3, AK/KB = 1 ga teng.", rasm: R.parallelogramm() },
    ["52", "36", "48", "28"], 1, T, M.g8yuz],
  [{ p: "Muntazam sakkizburchakka ichki va tashqi aylanalar chizilgan. Agar ichki chizilgan aylananing radiusi r = 2 + √2 cm bo'lsa, bu aylanalar hosil qilgan halqaning yuzini (cm²) toping." },
    ["4π", "8π", "2π", "√2π"], 2, T, M.g8aylana],
  [{ p: "α tekislik va uni kesib o'tmaydigan AB kesma berilgan. AB kesmaning uchlaridan α tekislikkacha bo'lgan eng qisqa masofalar AA₁ = 2 cm va BB₁ = 7 cm ga teng. A uchidan boshlab hisoblaganda AB kesmani 3 : 2 nisbatda bo'luvchi nuqtadan α tekislikkacha bo'lgan eng qisqa masofani (cm) toping." },
    ["5", "3", "4,5", "4"], 0, T, M.g10perpendikulyar],
  [{ p: "Agar a va b vektorlarning uzunliklari |a| = 5 va |b| = 4 bo'lib, bu vektorlar orasidagi burchak 60° ga teng bo'lsa, 5a − b vektorning uzunligini toping." },
    ["21", "9", "√41", "√541"], 3, T, M.g8uchburchak],
  [{ p: "U = {x | −10 ≤ x ≤ 10, x ∈ Z} universal to'plam hamda uning A = {x | −7 ≤ x ≤ 3, x ∈ Z} va B = {x | −3 ≤ x ≤ 7, x ∈ Z} qism to'plamlari bo'lsin. (A ∪ B)′ to'plamning elementlari sonini toping. Bunda (A ∪ B)′ to'plam A ∪ B to'plamning to'ldiruvchisi." },
    ["2", "6", "8", "4"], 1, T, M.a8malumot],
  [{ p: "Qopchada har biri 8 tadan moviy va qizil sharlar bor. Ketma-ket olingan ikki shardan ikkalasining ham moviy bo'lish ehtimolligini toping." },
    ["1/4", "7/15", "7/30", "1/8"], 2, T, M.a9ehtimol],
];

/** 33–35: moslashtirish. Variantlar A–F tartibida — rasmiy varaqdagidek. */
const MOSLASH_VARIANT = ["30", "3", "50", "25", "33⅓", "3000"];
const MOSLASH_KIRISH =
  "Uzunligi 6 m va asosining radiusi 5 dm ga teng bo'lgan silindrsimon shakldagi yog'och bo'lagidan eng katta hajmli to'g'ri burchakli parallelepiped shaklidagi yog'och ustun yasaldi.";
const MOSLASH: [string, string][] = [
  ["Yasalgan ustun asosining yuzini (dm²) toping.", "50"],
  ["Yasalgan ustunning hajmini (m³) toping.", "3"],
  ["Ustun yasash natijasida (jarayonida) yog'och bo'lagining necha foizi chiqindiga chiqqan? (π ≈ 3 deb oling)", "33⅓"],
];

interface Qism { p: string; j: string }
interface Ochiq { kirish: string; f?: string; rasm?: string; a: Qism; b: Qism; mavzu: Mavzu }

/** 36–45: ochiq javob. a) 1,5 ball, b) 1,7 ball. */
const OCHIQ: Ochiq[] = [
  { kirish: "Tenglamani yeching:", f: "(x − 1)⁴ + 2x = x² + 73",
    a: { p: "Tenglama nechta haqiqiy ildizga ega?", j: "2" },
    b: { p: "Tenglamaning haqiqiy ildizlari ko'paytmasini toping.", j: "−8" }, mavzu: M.a10irratsional },
  { kirish: "Tenglamani yeching:", f: "sin 7x · cos x = sin 6x",
    a: { p: "Tenglamaning eng kichik musbat ildizini toping.", j: "π/14" },
    b: { p: "Tenglama x ∈ [−π; π] kesmada nechta haqiqiy ildizga ega?", j: "17" }, mavzu: M.a10trig },
  { kirish: "Quyidagi chizmada f(x) = ax² + bx + 6 funksiyaning grafigi tasvirlangan. Parabola uchi B(½; 6¼) nuqtada joylashgan bo'lib, f(x) funksiya grafigi Oy o'qini A nuqtada, Ox o'qini esa abssissalari x₁ va x₂ (x₁ < x₂) bo'lgan nuqtalarda kesib o'tgan.",
    rasm: R.parabola(),
    a: { p: "x₂/x₁ ni toping.", j: "−3/2" },
    b: { p: "A va B nuqtalar orasidagi masofani toping.", j: "√5/4" }, mavzu: M.a9funksiya },
  { kirish: "Quyidagi chizmada (−6; 12) oraliqda aniqlangan y = f′(x) funksiyaning grafigi tasvirlangan. Bunda y = f′(x) funksiya y = f(x) funksiyaning hosilasi.",
    rasm: R.hosila(),
    a: { p: "y = f(x) funksiyaning (−6; 12) oraliqdagi lokal maksimum nuqtalari sonini toping.", j: "2" },
    b: { p: "y = f(x) funksiyaning (−6; 12) oraliqdagi lokal minimum nuqtalari sonini toping.", j: "3" }, mavzu: M.m11tatbiq },
  { kirish: "Bizga f(x) = 2√x va g(x) = 2x funksiyalar berilgan bo'lsin.",
    a: { p: "f(x) va g(x) funksiyalar nechta umumiy nuqtaga ega?", j: "2" },
    b: { p: "f(x) va g(x) funksiyalar grafiklari bilan chegaralangan shakl yuzini hisoblang.", j: "1/3" }, mavzu: M.m11integral },
  { kirish: "Quyidagi chizmada radiusi 1 cm ga teng va markazi O nuqtada bo'lgan aylana tasvirlangan. F va G nuqtalar aylanaga tegishli bo'lib, O, F va E nuqtalar bir to'g'ri chiziqda yotadi. Bunda ∠GEF = 2° va GE = 1 cm.",
    rasm: R.aylana41(),
    a: { p: "∠EGF ni toping.", j: "87" },
    b: { p: "∠EFG ni toping.", j: "91" }, mavzu: M.g10planimetriya },
  { kirish: "ABCD kvadratning ichki sohasida chizmadagi kabi KLGE kvadrat joylashtirilgan. Bunda AE = 6 cm va ED = 8 cm.",
    rasm: R.kvadrat42(),
    a: { p: "CG kesma uzunligini (cm) toping.", j: "10" },
    b: { p: "KLGE kvadratning yuzini (cm²) toping.", j: "80" }, mavzu: M.g10planimetriya },
  { kirish: "Koordinatalar tekisligida markazi M nuqtada bo'lgan aylana Oy o'qiga A nuqtada, Ox o'qiga esa C nuqtada urinadi (rasm). Koordinatalari (6; 0) va (0; 8) bo'lgan nuqtalarni tutashtirishdan hosil bo'lgan kesma aylanaga B nuqtada urinadi.",
    rasm: R.aylana43(),
    a: { p: "Aylana radiusini toping.", j: "12" },
    b: { p: "Aylana markazidan koordinata boshigacha bo'lgan masofani toping.", j: "12√2" }, mavzu: M.g8aylana },
  { kirish: "Uchi S nuqtada bo'lgan SABC muntazam uchburchakli piramida yon qirrasining uzunligi asosining tomonidan 2 marta katta. SAB uchburchakda AH balandlik va ABC uchburchakda BM mediana o'tkazilgan.",
    a: { p: "AH kesma uzunligining BH kesma uzunligiga nisbatini toping.", j: "√15" },
    b: { p: "MH kesma uzunligining BH kesma uzunligiga nisbatini toping.", j: "√11" }, mavzu: M.m11piramida },
  { kirish: "Shaharni elektr energiyasi bilan ta'minlash maqsadida ikki xil kabeldan foydalanilgan. Daryo tubidan o'tadigan FJ uzunlikdagi kabelning har bir kilometri uchun 7500$ dan va qirg'oq bo'ylab (yer ostidan) JL masofaga tortilgan kabelning har bir kilometri uchun 6000$ dan pul to'langan. Bunda daryoning kengligi FE = 1 km, EL = 5 km va EL ⊥ FE bo'lib, eng kam pul ($) sarflab F nuqta (stansiya)dan L nuqta (shahar)ga kabel tortib borilgan.",
    rasm: R.daryo(),
    a: { p: "Qirg'oq bo'ylab JL masofaga tortilgan kabel uchun qancha mablag' ($) sarflangan?", j: "22000" },
    b: { p: "Daryo tubidan FJ masofaga tortilgan kabel uchun qancha mablag' ($) sarflangan?", j: "12500" }, mavzu: M.m11tatbiq },
];

/* ------------------------------------------------------------ yig'ish */

function savol(m: Mavzu, a: RasmiyQ): BlokSavol {
  return { a, kurs: `azapp_${m.kursId}_v1`, kursId: m.kursId, ui: m.ui, li: 0, mavzu: m.mavzu };
}

/** Rasmiy namunaning to'liq varianti (45 topshiriq, 100 ball). */
export function rasmiyVariant(n: number): SVariant {
  const y1 = TEST.map(([sh, v, t, ball, m]): SSavol => ({
    tur: "y1", ball,
    s: savol(m, { type: "rasmiy", prompt: sh.p, text: sh.f, rasm: sh.rasm, answer: v[t], choices: v }),
  }));
  const y2 = MOSLASH.map(([p, j]): SSavol => ({
    tur: "y2", ball: 2.2,
    s: savol(M.m11prizma, {
      type: "rasmiy", prompt: p, kirish: MOSLASH_KIRISH, rasm: R.yogoch(), answer: j, choices: MOSLASH_VARIANT,
    }),
  }));
  const o = OCHIQ.map((q): SSavol => {
    const qism = (x: Qism): BlokSavol => savol(q.mavzu, {
      type: "rasmiy", prompt: x.p, kirish: q.kirish, text: q.f, rasm: q.rasm, answer: x.j, choices: [],
    });
    return { tur: "o", a: qism(q.a), b: qism(q.b) };
  });
  return { n, savollar: [...y1, ...y2, ...o], y2: [...MOSLASH_VARIANT], rasmiy: true };
}
