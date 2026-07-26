/**
 * Hisob — ism, familiya va bog'langan kirish usullari.
 *
 * Bu BOLANING emas, HISOBNING ma'lumoti (odatda ota-onaniki). Bolalar
 * ismi profillar ekranida turadi. Ikkisini aralashtirmaslik uchun bu
 * yerda buni ochiq yozib qo'yamiz.
 *
 * Ekran ikki rejimda ishlaydi:
 *
 *   royxat=false  — oddiy sozlama. Tahrirlash, ortga qaytish mumkin.
 *   royxat=true   — MAJBURIY ro'yxat. Ilovaga kirishdan oldin ko'rsatiladi,
 *                   ism ham, familiya ham to'ldirilmaguncha o'tkazmaydi.
 *
 * Nega familiya majburiy: reytingda odamlar bir-birini taniy olishi kerak.
 * Faqat ism bilan "Ali" ismli o'nta bola bir xil ko'rinadi va jadval
 * ma'nosini yo'qotadi.
 *
 * Telefon raqami faqat KO'RSATILADI. Uni o'zgartirish Telegram bot
 * orqali bo'ladi — raqamni tasdiqlash faqat o'sha yerda mumkin, ilovadan
 * yozilgan raqam esa hech narsani isbotlamaydi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { Logo } from "../components/Logo";
import { botHavolasi, botNomi, getHisob, hisobniSaqla, miniAppda } from "../lib/api";
import type { Hisob } from "../lib/api";

interface Props {
  onBack: () => void;
  /** Bolalar ekrani — qo'shish va almashtirish shu yerda. */
  onProfillar?: () => void;
  /** Ro'yxat tugagandan keyin qayerga o'tish. */
  onTayyor?: () => void;
  /**
   * Majburiy ro'yxat rejimi: ism-familiya hali to'liq emas.
   * Bunda sarlavha boshqacha va ortga tugmasi ko'rsatilmaydi.
   */
  royxat?: boolean;
}

/** Raqamni o'qishga qulay qilib bo'ladi: +998 90 123 45 67 */
function raqamniBeza(x: string): string {
  const r = x.replace(/\D/g, "");
  if (r.length !== 12) return x;
  return `+${r.slice(0, 3)} ${r.slice(3, 5)} ${r.slice(5, 8)} ${r.slice(8, 10)} ${r.slice(10)}`;
}

export function Sozlamalar({ onBack, onProfillar, onTayyor, royxat = false }: Props) {
  const [hisob, setHisob] = useState<Hisob | null>(null);
  const [yuklandi, setYuklandi] = useState(false);
  const [ism, setIsm] = useState("");
  const [familiya, setFamiliya] = useState("");
  const [band, setBand] = useState(false);
  const [holat, setHolat] = useState<"" | "saqlandi">("");
  const [xato, setXato] = useState("");
  const [bot, setBot] = useState("");

  useEffect(() => {
    let bekor = false;
    getHisob().then((h) => {
      if (bekor) return;
      setHisob(h);
      setIsm(h?.ism ?? "");
      setFamiliya(h?.familiya ?? "");
      setYuklandi(true);
    });
    return () => { bekor = true; };
  }, []);

  // Bot nomi faqat veb saytda kerak: Mini App ichida foydalanuvchi
  // allaqachon Telegram orqali kirgan va tugma ortiqcha bo'lardi.
  useEffect(() => {
    if (miniAppda()) return;
    let bekor = false;
    botNomi().then((b) => { if (!bekor) setBot(b); });
    return () => { bekor = true; };
  }, []);

  // Tahrirlanganini bilish: o'zgarmagan bo'lsa saqlash tugmasi so'nadi.
  const ozgardi =
    hisob !== null &&
    (ism.trim() !== hisob.ism || familiya.trim() !== hisob.familiya);

  // Ro'yxatda ikkalasi ham shart. Oddiy rejimda familiyani bo'shatish mumkin.
  const toliq = Boolean(ism.trim()) && (!royxat || Boolean(familiya.trim()));

  async function saqla() {
    if (band || !toliq) return;
    setBand(true);
    setXato("");
    setHolat("");
    const n = await hisobniSaqla({ ism: ism.trim(), familiya: familiya.trim() });
    setBand(false);
    if (!n.ok) return setXato(n.xato);
    setHisob(n.hisob);
    setHolat("saqlandi");
    // Ro'yxat faqat SERVER tasdiqlaganda yopiladi. Mahalliy tekshiruvga
    // ishonsak, server qiymatni rad etgan holatda foydalanuvchi ichkariga
    // o'tib ketardi-yu, keyingi ochilishda yana shu oynaga qaytardi.
    if (n.hisob.royxatdan) onTayyor?.();
  }

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-16">
      {!royxat && (
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack} title="Ortga"
            className="clay-press grid size-[38px] place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        </div>
      )}

      <div className="az-kirish mt-4 text-center">
        <Logo size={64} className="mx-auto" />
        <h1 className="mt-3 text-[22px]">
          {royxat ? "Tanishib olaylik" : "Hisob"}
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-ink-soft">
          {royxat
            ? "Ism va familiyangizni kiriting — reytingda shu nom ko'rinadi"
            : "Hisob egasining ismi — odatda ota-ona"}
        </p>
      </div>

      {yuklandi && hisob === null && (
        <div className="az-kirish mt-6 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <div className="text-[34px] leading-none">📶</div>
          <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">
            Hisob ma'lumoti serverda saqlanadi va hozir aloqa yo'q.
            Darslar baribir ishlayveradi — internet paydo bo'lganda qaytib keling.
          </p>
        </div>
      )}

      {hisob && (
        <>
          <div className="az-kirish mt-6 space-y-3 rounded-clay bg-karta p-4 shadow-clay-sm">
            <Maydon nom="Ism" qiymat={ism} ozgar={setIsm}
              joy="Masalan: Jasur" onEnter={saqla} />
            <Maydon nom={royxat ? "Familiya" : "Familiya"} qiymat={familiya} ozgar={setFamiliya}
              joy="Masalan: Toshmatov" onEnter={saqla} />

            <button
              type="button"
              onClick={saqla}
              disabled={!toliq || band || (!royxat && !ozgardi)}
              className="clay-press mt-1 w-full rounded-3xl bg-brand-green py-3 font-display
                         text-[15px] text-white disabled:opacity-40"
            >
              {band ? "Saqlanyapti…" : royxat ? "Davom etish" : "Saqlash"}
            </button>

            <div className="min-h-5 text-center text-[13px]">
              {holat === "saqlandi" && !xato && (
                <span className="az-sakra inline-block text-brand-green-d">Saqlandi ✓</span>
              )}
              {xato && <span className="text-brand-red">{xato}</span>}
            </div>
          </div>

          {/* ---- bolalar ----
              Faqat ikki va undan ko'p bola bo'lganda ko'rinadi.

              Bir bolali oila — eng ko'p uchraydigan holat — profil degan
              tushunchani umuman ko'rmaydi: na bosh sahifada, na bu yerda.
              Ekranda faqat o'sha odamga kerak bo'lgan narsa turadi.

              DIQQAT: shu sabab hozir ilovada ikkinchi bolani qo'shish
              yo'li YO'Q. Bu ataylab shunday. Kerak bo'lganda quyidagi
              shartni olib tashlash yetarli — ekran o'zi tayyor turibdi,
              `/profillar` manzili ham ishlaydi. */}
          {!royxat && (hisob.profillar?.length ?? 1) > 1 && (
            <div className="az-kirish mt-4 rounded-clay bg-karta p-4 shadow-clay-sm"
              style={{ "--az-kech": "60ms" } as React.CSSProperties}>
              <div className="font-display text-[14px]">Bolalar</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-dim">
                Har bir bolaning yulduzlari alohida saqlanadi
              </p>

              <div className="mt-3 space-y-2">
                {(hisob.profillar ?? []).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-track px-3 py-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-karta text-[20px]">
                      {p.avatar || "🦊"}
                    </span>
                    <span className="min-w-0 flex-1 text-[14px]">{p.ism || "Ismsiz"}</span>
                  </div>
                ))}
              </div>

              <button type="button" onClick={onProfillar}
                className="clay-press mt-3 flex w-full items-center justify-center gap-2 rounded-3xl
                           bg-track py-2.5 font-display text-[14px] text-ink-soft">
                <Icon name="parent" size={17} />
                Bolalarni boshqarish
              </button>
            </div>
          )}

          {/* ---- kirish usullari ---- */}
          {!royxat && (
            <div className="az-kirish mt-4 rounded-clay bg-karta p-4 shadow-clay-sm"
              style={{ "--az-kech": "80ms" } as React.CSSProperties}>
              <div className="font-display text-[14px]">Kirish usullari</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-dim">
                Qancha ko'p bo'lsa, progressni tiklash shuncha oson
              </p>

              <div className="mt-3 space-y-2">
                <Usul ic="phone" nom="Telefon"
                  qiymat={hisob.telefon ? raqamniBeza(hisob.telefon) : ""}
                  yoq="Botga raqamingizni yuboring" />
                <Usul ic="send" nom="Telegram"
                  qiymat={hisob.telegram ? "bog'langan" : ""}
                  yoq="bog'lanmagan" />
                <Usul ic="phone" nom="Qurilma"
                  qiymat={hisob.qurilma ? "shu qurilma" : ""}
                  yoq="bog'lanmagan" />
              </div>

              {/* Telegram bog'lanmagan bo'lsa — shu yerdan bog'lash mumkin.
                  Yo'l kirish ekranidagi bilan AYNAN bir xil: botga o'tadi,
                  bot havola yuboradi. Progress yo'qolmaydi — server ikki
                  hisobni birlashtiradi (`auth/kod`). */}
              {!hisob.telegram && bot && (
                <div className="mt-3 border-t border-track pt-3">
                  <p className="mb-2 text-center text-[12px] leading-snug text-ink-dim">
                    Telegram'ni bog'lasangiz, yulduzlaringiz boshqa qurilmada ham ochiladi
                  </p>
                  <a href={botHavolasi(bot)}
                    className="clay-press flex w-full items-center justify-center gap-2
                               rounded-3xl bg-brand-green py-2.5 font-display text-[14px] text-white">
                    <Icon name="send" size={16} />
                    Telegram bilan bog'lash
                  </a>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Maydon({ nom, qiymat, ozgar, joy, onEnter }: {
  nom: string; qiymat: string; joy: string;
  ozgar: (v: string) => void; onEnter: () => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-ink-dim">{nom}</span>
      <input
        value={qiymat}
        onChange={(e) => ozgar(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onEnter(); }}
        maxLength={120}
        placeholder={joy}
        className="w-full rounded-2xl bg-track px-3.5 py-2.5 text-[15px]
                   text-ink outline-none placeholder:text-ink-dim"
      />
    </label>
  );
}

function Usul({ ic, nom, qiymat, yoq }: {
  ic: "phone" | "send"; nom: string; qiymat: string; yoq: string;
}) {
  const bor = Boolean(qiymat);
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-track px-3 py-2.5">
      <Icon name={ic} size={18}
        className={bor ? "shrink-0 text-brand-green-d" : "shrink-0 text-ink-dim"} />
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] leading-tight">{nom}</span>
        <span className={`block text-[11.5px] ${bor ? "text-ink-soft" : "text-ink-dim"}`}>
          {qiymat || yoq}
        </span>
      </span>
      {bor && <Icon name="check" size={16} className="shrink-0 text-brand-green-d" />}
    </div>
  );
}
