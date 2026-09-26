/**
 * Pastki panelning faol tab qoidasi (`src/lib/tab.ts`).
 *
 * NEGA SINOV KERAK. Eski havolalar (`/kurs/...`, `/imtihon/3`) bot va
 * kanal postlarida yashaydi va ularni hech kim qo'lda ochib ko'rmaydi.
 * Qoida jimgina buzilsa, panel "hech qayerdasiz" deb turardi.
 *
 * `npm run tekshir` bilan birga ishlaydi.
 */
import { faolTab } from "../src/lib/tab";

let xato = 0;
const tekshir = (yol: string, kutilgan: ReturnType<typeof faolTab>) => {
  const keldi = faolTab(yol);
  const ok = keldi === kutilgan;
  if (!ok) xato++;
  console.log(`${ok ? "✅" : "❌"} ${yol} → ${kutilgan}`, ok ? "" : `— keldi ${keldi}`);
};

tekshir("/", "bugun");

tekshir("/darslar", "oqish");
tekshir("/kurs/3-sinf", "oqish");
tekshir("/kurs/3-sinf/2-bob/3-dars", "oqish");
tekshir("/kurs/3-sinf/daftar", "oqish");
tekshir("/kurs/3-sinf/formulalar", "oqish");
tekshir("/kurs/9-sinf/testlar", "oqish");
tekshir("/testlar", "oqish");
tekshir("/toplam/4", "oqish");
tekshir("/imtihon", "oqish");
tekshir("/imtihon/3", "oqish");
tekshir("/sertifikat", "oqish");
tekshir("/sertifikat/5", "oqish");
tekshir("/sessiya", "oqish");
tekshir("/sessiya/oliy-1/2", "oqish");

tekshir("/oyinlar", "oyin");
tekshir("/oyinlar/tezkor", "oyin");
tekshir("/oyinlar/duel", "oyin");
tekshir("/duel/abc", "oyin");
tekshir("/xona/XYZ", "oyin");

tekshir("/masalalar", "masalalar");
tekshir("/masalalar/12", "masalalar");
tekshir("/masalalar/yangi", "masalalar");

tekshir("/men", "men");
tekshir("/men/anketa", "men");
tekshir("/reyting", "men");
tekshir("/profillar", "men");
tekshir("/sozlamalar", "men");
tekshir("/kurs/3-sinf/nishonlar", "men");
tekshir("/kurs/3-sinf/dokon", "men");
tekshir("/kurs/3-sinf/ota-ona", "men");
tekshir("/kurs/9-sinf/hisobot", "men");

tekshir("/qidiruv", null);
tekshir("/mening-sahifam", null);
// Prefiks tasodifan mos kelmasin: "/menyu" — "/men" emas.
tekshir("/menyu", null);

console.log(xato === 0 ? "\n✅ tab: hammasi joyida" : `\n❌ ${xato} ta xato`);
if (xato) process.exit(1);
