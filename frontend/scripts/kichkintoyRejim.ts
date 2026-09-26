/**
 * Kichkintoy rejimi (`src/lib/kichkintoyRejim.ts`).
 *
 * NEGA SINOV KERAK. Rejimdan chiqishning yagona yo'li — qulf savoli.
 * Savolda to'g'ri javob variantlar orasida bo'lmasa, ota-ona ilovaga
 * umuman qaytolmay qoladi; savol juda oson bo'lsa — bola chiqib ketadi.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import "./_xotira";
import { qulfSavoli, rejimFaol, rejimdanChiq, rejimgaKir } from "../src/lib/kichkintoyRejim";

const xotira = new Map<string, string>();
(globalThis as unknown as { sessionStorage: Storage }).sessionStorage = {
  getItem: (k: string) => xotira.get(k) ?? null,
  setItem: (k: string, v: string) => void xotira.set(k, v),
  removeItem: (k: string) => void xotira.delete(k),
  clear: () => xotira.clear(), key: () => null, length: 0,
} as Storage;

let xato = 0;
const tekshir = (nom: string, ok: boolean) => {
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${nom}`);
};

let urug = 1;
const rnd = () => { urug = (urug * 16807) % 2147483647; return urug / 2147483647; };
let hammasi = true;
for (let i = 0; i < 500; i++) {
  const s = qulfSavoli(rnd);
  const ok = s.a + s.b === s.javob && s.variantlar.includes(s.javob)
    && new Set(s.variantlar).size === 3 && s.a >= 11 && s.b >= 11;
  if (!ok) { hammasi = false; console.log(JSON.stringify(s)); break; }
}
tekshir("qulf savoli: javob variantlarda, uchalasi har xil, ikki xonali", hammasi);

const maktabgacha = { kim: "ota_ona" as const, bosqich: 0 };
const uchinchi = { kim: "oquvchi" as const, bosqich: 3 };
tekshir("maktabgacha — rejim o'zi yoqiladi", rejimFaol(maktabgacha));
tekshir("3-sinf — rejim yo'q", !rejimFaol(uchinchi));
tekshir("profil yo'q — rejim yo'q", !rejimFaol(null));
rejimdanChiq();
tekshir("ota-ona chiqdi — shu seansda yo'q", !rejimFaol(maktabgacha));
rejimgaKir();
tekshir("qo'lda yoqildi — 3-sinf profilida ham", rejimFaol(uchinchi));
rejimdanChiq();
tekshir("yana chiqdi", !rejimFaol(uchinchi) && !rejimFaol(maktabgacha));

console.log(xato === 0 ? "\n✅ kichkintoy rejimi: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
