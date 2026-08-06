/**
 * Kichkintoylar lug'atining sinovi.
 *
 * ─────────── NEGA BU SINOV BOR ───────────
 *
 * Bo'limdagi har bir so'z OVOZ bo'lib eshitiladi, ovoz esa serverda
 * oldindan tayyorlanadi (`backend/core/lugat/kichkintoy.txt` →
 * `manage.py ovoz`). Ya'ni ikki joyda bir xil ro'yxat turadi:
 * bu yerda — ko'rinadigan, u yerda — eshitiladigan.
 *
 * Ikki ro'yxat ajralib ketishi MUTLAQO jimgina bo'ladi: yangi hayvon
 * qo'shilsa, ekranda u chiqadi-yu, bosilganda ilova jim qoladi. Bola
 * uchun bu "buzuq karta", va buni hech qanday test topmasdi — chunki
 * kod to'g'ri ishlaydi, shunchaki fayl yo'q.
 *
 * Shu sabab sinov ikki ro'yxatni SOLISHTIRADI va farq bo'lsa
 * `npm run tekshir` ni yiqitadi.
 *
 *     jiti scripts/kichkintoy.ts          # solishtiradi
 *     jiti scripts/kichkintoy.ts --yoz    # ro'yxatni qaytadan yozadi
 *
 * `--yoz` — lug'atga yangi so'z qo'shgandan keyin ishlatiladi. Undan
 * keyin serverda `manage.py ovoz` ni bir marta yurgizish kifoya.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { MAVZULAR } from "../src/lib/kichkintoy";

const ILDIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LUGAT = resolve(ILDIZ, "backend", "core", "lugat", "kichkintoy.txt");

/**
 * Ovozga chiqadigan HAMMA satr — ikkala tilda.
 *
 * O'yin matnlari ("Barakalla!") ham shu yerda: ular ham TTS orqali
 * aytiladi va ular unutilsa, o'yin yakuni jim tugardi — aynan
 * mukofot payti.
 */
function kutilgan(): string[] {
  const s = new Set<string>();
  for (const m of MAVZULAR) {
    for (const k of m.kartalar) {
      s.add(k.nom);
      s.add(k.ru);
      if (k.ovoz) s.add(k.ovoz);
      if (k.ovozRu) s.add(k.ovozRu);
    }
  }
  // `lib/matn.ts` dagi `kichkintoyBarakalla` — o'yin uni ovoz bilan
  // aytadi. Qo'lda yozilgan, chunki `matn.ts` ni bu skriptga import
  // qilish butun ilova zanjirini tortib kelardi.
  s.add("Barakalla!");
  s.add("Молодец!");
  return [...s].sort((a, b) => a.localeCompare(b, "uz"));
}

const kerak = kutilgan();

if (process.argv.includes("--yoz")) {
  writeFileSync(LUGAT, kerak.join("\n") + "\n", "utf8");
  console.log(`✅ kichkintoy: ${kerak.length} satr yozildi → ${LUGAT}`);
  process.exit(0);
}

let bor: string[];
try {
  bor = readFileSync(LUGAT, "utf8")
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x && !x.startsWith("#"));
} catch {
  console.log(`❌ kichkintoy: lug'at fayli yo'q — ${LUGAT}\n`
    + "   Yasash: npx jiti scripts/kichkintoy.ts --yoz");
  process.exit(1);
}

const borToplam = new Set(bor);
const kerakToplam = new Set(kerak);
const yetishmaydi = kerak.filter((x) => !borToplam.has(x));
const ortiqcha = bor.filter((x) => !kerakToplam.has(x));

if (yetishmaydi.length === 0 && ortiqcha.length === 0) {
  console.log(`✅ kichkintoy: lug'at joyida (${kerak.length} satr)`);
  process.exit(0);
}

if (yetishmaydi.length) {
  console.log(`❌ lug'atda YO'Q (ovozi bo'lmaydi): ${yetishmaydi.join(", ")}`);
}
if (ortiqcha.length) {
  console.log(`⚠️  lug'atda ORTIQCHA (bekorga yasalgan): ${ortiqcha.join(", ")}`);
}
console.log("   Tuzatish: npx jiti scripts/kichkintoy.ts --yoz");
process.exit(1);
