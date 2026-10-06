/**
 * "Siz kimsiz" → butun ilova (`src/lib/moslash.ts`).
 *
 * NEGA SINOV KERAK. Bitta noto'g'ri shart (masalan "sinf < 4" o'rniga
 * "sinf <= 4") 4-sinf bolasini butunlay boshqa guruhga o'tkazib
 * yuboradi va buni hech kim sezmaydi: u shunchaki DTM ni ko'radi, o'z
 * Prezident maktabi tayyorlovini esa ko'rmaydi.
 *
 * Anketaning HAR javobi uchun: guruh, o'yin darajasi, bosh sahifa
 * bo'limlari (bo'sh emas, takrorsiz, kerakli bo'lim bor, keraksizi yo'q)
 * va formulalar sinfi.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import { BOSQICH } from "../src/lib/profil";
import type { Kim, Profil } from "../src/lib/profil";
import { bolimlar, formulaSinfi, guruhOf, oyinDarajasi } from "../src/lib/moslash";

let xato = 0;
const tekshir = (nom: string, shart: boolean, izoh = "") => {
  if (!shart) xato++;
  console.log(`${shart ? "✅" : "❌"} ${nom}${shart ? "" : ` — ${izoh}`}`);
};
const P = (kim: Kim, bosqich: number, yonalish?: Profil["yonalish"]): Profil => ({ kim, bosqich, ...(yonalish ? { yonalish } : {}) });

// Anketadagi hamma javob — `components/Anketa.tsx` dagi bilan bir xil.
const hammasi: [string, Profil | null][] = [
  ["anketa yo'q", null],
  ...Array.from({ length: 11 }, (_, i) => [`${i + 1}-sinf o'quvchi`, P("oquvchi", i + 1)] as [string, Profil]),
  ...Array.from({ length: 12 }, (_, i) => [`ota-ona, ${i}-sinf`, P("ota_ona", i)] as [string, Profil]),
  ["abituriyent", P("abiturient", -1)],
  ["talaba 1-kurs", P("talaba", 101, "texnika")],
  ["talaba boshlang'ich", P("talaba", 101, "boshlangich")],
  ["magistr", P("talaba", BOSQICH.magistr, "iqtisod")],
  ["ustoz maktab", P("ustoz", 130)],
  ["ustoz OTM", P("ustoz", BOSQICH.ustozOtm)],
  ["ustoz markaz", P("ustoz", BOSQICH.ustozMarkaz)],
  ["kattalar maktab", P("kattalar", BOSQICH.maktabDaraja)],
  ["kattalar oliy", P("kattalar", BOSQICH.oliyDaraja)],
];

console.log("--- har javob ---");
for (const [nom, p] of hammasi) {
  const b = bolimlar(p);
  tekshir(`${nom}: bo'limlar 4–8 ta va takrorsiz`, b.length >= 4 && b.length <= 8 && new Set(b).size === b.length, b.join(","));
  const d = oyinDarajasi(p);
  tekshir(`${nom}: o'yin darajasi 1–3`, d >= 1 && d <= 3, String(d));
  const f = formulaSinfi(p);
  tekshir(`${nom}: formulalar 5–11`, f >= 5 && f <= 11, String(f));
}

console.log("\n--- kerakli va keraksiz ---");
const b = (p: Profil | null) => bolimlar(p);
for (let s = 1; s <= 4; s++) {
  tekshir(`${s}-sinf: DTM va sertifikat yo'q`, !b(P("oquvchi", s)).some((x) => x === "dtm" || x === "sertifikat"));
  tekshir(`${s}-sinf: mantiq bor`, b(P("oquvchi", s)).includes("mantiq"));
  tekshir(`${s}-sinf: o'yin darajasi 1`, oyinDarajasi(P("oquvchi", s)) === 1);
}
tekshir("3- va 4-sinf: Prezident maktabi birinchi", b(P("oquvchi", 3))[0] === "qabul" && b(P("oquvchi", 4))[0] === "qabul");
tekshir("2-sinf: Prezident maktabi hali yo'q", !b(P("oquvchi", 2)).includes("qabul"));
tekshir("ota-ona 4-sinf = 4-sinf o'quvchi", JSON.stringify(b(P("ota_ona", 4))) === JSON.stringify(b(P("oquvchi", 4))));
tekshir("7-sinf: o'yin darajasi 2, formulalar 7", oyinDarajasi(P("oquvchi", 7)) === 2 && formulaSinfi(P("oquvchi", 7)) === 7);
tekshir("9-sinf: sertifikat bor", b(P("oquvchi", 9)).includes("sertifikat"));
tekshir("11-sinf: DTM birinchi, daraja 3", b(P("oquvchi", 11))[0] === "dtm" && oyinDarajasi(P("oquvchi", 11)) === 3);
tekshir("abituriyent: DTM birinchi, Prezident maktabi yo'q", b(P("abiturient", -1))[0] === "dtm" && !b(P("abiturient", -1)).includes("qabul"));
tekshir("talaba: sessiya birinchi", b(P("talaba", 101, "texnika"))[0] === "sessiya");
tekshir("bo'lajak boshlang'ich ustoz: boshlang'ich guruh", guruhOf(P("talaba", 101, "boshlangich")) === "boshlangich");
tekshir("maktabgacha: daraja 1, DTM yo'q", oyinDarajasi(P("ota_ona", 0)) === 1 && !b(P("ota_ona", 0)).includes("dtm"));
tekshir("anketa yo'q: hamma asosiy bo'lim bor", ["darslar", "dtm", "oyinlar", "qabul", "mantiq"].every((x) => b(null).includes(x as never)));

console.log(xato === 0 ? "\n✅ moslash: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
