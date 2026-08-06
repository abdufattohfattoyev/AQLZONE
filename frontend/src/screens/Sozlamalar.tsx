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
import { botHavolasi, botNomi, chiqish, getHisob, hisobniSaqla, miniAppda } from "../lib/api";
import { turniUnut } from "../lib/tur";
import { ovozYoniqmi, ovozniYoq } from "../lib/ovoz";
import { tozala } from "../lib/nom";
import type { Hisob } from "../lib/api";
import { t } from "../lib/matn";
import { TILLAR, til, tilniAlmashtir } from "../lib/til";
import { useOrqaga } from "../lib/qobiq";

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
  /**
   * Allaqachon olingan hisob. Berilsa server QAYTA so'ralmaydi.
   *
   * Ro'yxat rejimida `Tanishuv` bu ekranni aynan `/me` javobiga qarab
   * ochadi — ya'ni ma'lumot bir soniya oldin kelgan. Uni qayta so'rash
   * ikkinchi marta kutish demak: odam kirish tugmasini bosgach bo'sh
   * ekranga qarab turadi va ilova qotgandek tuyuladi.
   */
  boshlangich?: Hisob | null;
}

/** Raqamni o'qishga qulay qilib bo'ladi: +998 90 123 45 67 */
function raqamniBeza(x: string): string {
  const r = x.replace(/\D/g, "");
  if (r.length !== 12) return x;
  return `+${r.slice(0, 3)} ${r.slice(3, 5)} ${r.slice(5, 8)} ${r.slice(8, 10)} ${r.slice(10)}`;
}

export function Sozlamalar({ onBack, onProfillar, onTayyor, royxat = false, boshlangich }: Props) {
  const [hisob, setHisob] = useState<Hisob | null>(boshlangich ?? null);
  const [yuklandi, setYuklandi] = useState(boshlangich != null);
  const [ism, setIsm] = useState(() => tozala(boshlangich?.ism ?? ""));
  const [familiya, setFamiliya] = useState(() => tozala(boshlangich?.familiya ?? ""));
  const [band, setBand] = useState(false);
  const [holat, setHolat] = useState<"" | "saqlandi">("");
  const [xato, setXato] = useState("");
  const [bot, setBot] = useState("");
  // Chiqish qaytarib bo'lmaydigan ish emas, lekin bexosdan bosilsa bola
  // o'yin o'rtasida hisobsiz qoladi — bir savol berib qo'yamiz.
  const [tasdiq, setTasdiq] = useState(false);
  // Yo'lboshchi qayta yoqildimi — tugma bosilganini bildirish uchun.
  // Sayohatning o'zi kurs sahifasida boshlanadi, shu yerda emas.
  const [turQayta, setTurQayta] = useState(false);
  // Sinxron o'qiladi: tugma ekran chizilishi bilan to'g'ri holatda
  // turishi kerak, keyinroq almashib ketmasligi.
  const [ovoz, setOvoz] = useState(ovozYoniqmi);

  // Nativ orqaga tugmasi RO'YXAT rejimida ulanmaydi: u yerda chiqish
  // yo'li ataylab yo'q — odam kirish jarayonining o'rtasida turadi va
  // uni yarim yo'lda qoldirish chalkashtiradi. Telegram'ning tugmasini
  // ko'rsatsak, dizayn ataylab yopgan eshikni qaytarib ochgan bo'lardik.
  const ozStrelka = useOrqaga(onBack, !royxat);

  // Hisob tayyor holda berilgan bo'lsa so'rov YUBORILMAYDI: u chaqiruvchi
  // uchun ham, bu ekran uchun ham bir xil `/me` javobi.
  const tayyorKeldi = boshlangich != null;

  useEffect(() => {
    if (tayyorKeldi) return;
    let bekor = false;
    getHisob().then((h) => {
      if (bekor) return;
      setHisob(h);
      // Serverdagi qiymat Telegram'dan kelgan bo'lishi mumkin va bezakli
      // bo'lishi mumkin. Maydonga tozalab qo'yamiz — odam nima saqlanishini
      // ko'rib tursin.
      setIsm(tozala(h?.ism ?? ""));
      setFamiliya(tozala(h?.familiya ?? ""));
      setYuklandi(true);
    });
    return () => { bekor = true; };
  }, [tayyorKeldi]);

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

  // Ism-familiya maydonlari — ikkala rejimda ham AYNAN bir xil, faqat
  // qaysi kartaning ichida turishi farq qiladi.
  const shakl = (
    <>
      <Maydon nom={t("maydonIsm")} qiymat={ism} ozgar={setIsm}
        joy={t("joyIsm")} onEnter={saqla} />
      <Maydon nom={t("maydonFamiliya")} qiymat={familiya} ozgar={setFamiliya}
        joy={t("joyFamiliya")} onEnter={saqla} />

      <button
        type="button"
        onClick={saqla}
        disabled={!toliq || band || (!royxat && !ozgardi)}
        className="clay-press mt-1 w-full rounded-3xl bg-brand-green py-3 font-display
                   text-[15px] text-white disabled:opacity-40"
      >
        {band ? t("saqlanyapti") : royxat ? t("davomEtish") : t("saqlash")}
      </button>

      <div className="min-h-5 text-center text-[13px]">
        {holat === "saqlandi" && !xato && (
          <span className="az-sakra inline-block text-brand-green-d">{t("saqlandi")}</span>
        )}
        {xato && <span className="text-brand-red">{xato}</span>}
      </div>
    </>
  );

  /*
   * Ro'yxat rejimi kirish ekranining DAVOMI, alohida sahifa emas.
   *
   * Shu sabab tashqi ko'rinishi `Kirish.tsx` bilan bir xil qilingan:
   * ekran o'rtasida bitta karta, belgi va sarlavha o'sha kartaning
   * ichida. Ilgari bu yerda sahifa yuqoridan boshlanar, belgi esa
   * kartadan tashqarida turardi — natijada "Telegram bilan kirish" ni
   * bosgan odam kartaning yuqoriga sakraganini ko'rar va boshqa saytga
   * tushib qolgandek bo'lardi.
   */
  if (royxat) {
    return (
      <div className="mx-auto grid min-h-ekran w-full max-w-[430px] place-items-center px-4 py-8">
        <div className="az-kirish w-full rounded-clay bg-karta p-6 text-center shadow-clay">
          <Logo size={64} className="mx-auto" />
          <h1 className="mt-3 text-[22px]">{t("tanishibOlaylik")}</h1>
          <p className="mt-1 text-[13.5px] leading-snug text-ink-dim">
            {t("royxatIzoh")}
          </p>

          {/* Maydonlar kelgunicha o'sha balandlikdagi bo'sh joy turadi,
              aks holda karta paydo bo'lganda ekran sakrardi. Hisob tayyor
              berilganda (odatdagi holat) bu umuman ko'rinmaydi. */}
          <div className="mt-5 space-y-3 text-left">
            {hisob ? shakl : (
              <>
                <div className="h-[62px] animate-pulse rounded-2xl bg-track" />
                <div className="h-[62px] animate-pulse rounded-2xl bg-track" />
                <div className="h-[46px] animate-pulse rounded-3xl bg-track" />
                <div className="min-h-5" />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-16">
      <div className="flex items-center gap-2">
        {/* Telegram Mini App ichida bu strelka CHIZILMAYDI: u yerda
            Telegram o'z sarlavhasida nativ `←` ni ko'rsatadi va ikkitasi
            bir ekranda turganda odam har safar "qaysi biri to'g'ri?" deb
            o'ylardi (`lib/qobiq.ts`). */}
        {ozStrelka && (
          <button type="button" onClick={onBack} title={t("ortga")}
            className="clay-press grid size-[38px] place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
      </div>

      <div className="az-kirish mt-4 text-center">
        <Logo size={64} className="mx-auto" />
        <h1 className="mt-3 text-[22px]">{t("hisob")}</h1>
        <p className="mt-1 text-[13px] leading-snug text-ink-soft">
          {t("hisobEgasi")}
        </p>
      </div>

      {yuklandi && hisob === null && (
        <div className="az-kirish mt-6 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <div className="text-[34px] leading-none">📶</div>
          <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">
            {t("hisobAloqaYoq")}
          </p>
        </div>
      )}

      {hisob && (
        <>
          <div className="az-kirish mt-6 space-y-3 rounded-clay bg-karta p-4 shadow-clay-sm">
            {shakl}
          </div>

          {/* ---- til ----
              Eng yuqorida turadi va bu ataylab: noto'g'ri tilda ochilgan
              ilovada odam boshqa hech narsani o'qiy olmaydi, ya'ni bu
              tugma uning BIRINCHI ehtiyoji. Almashtirilganda sahifa
              qayta yuklanadi (`lib/til.ts` ga qarang). */}
          <div className="az-kirish mt-4 rounded-clay bg-karta p-4 shadow-clay-sm"
            style={{ "--az-kech": "40ms" } as React.CSSProperties}>
            <div className="font-display text-[14px]">{t("tilSarlavha")}</div>
            <p className="mt-1 text-[12px] leading-snug text-ink-dim">
              {t("tilIzoh")}
            </p>
            <div className="mt-3 flex gap-2">
              {TILLAR.map((x) => {
                const shu = x.kod === til();
                return (
                  <button key={x.kod} type="button" onClick={() => void tilniAlmashtir(x.kod)}
                    aria-current={shu ? "true" : undefined}
                    className={`clay-press flex flex-1 items-center justify-center gap-2 rounded-3xl
                      py-2.5 font-display text-[14px] ${
                      shu ? "bg-brand-green/20 ring-2 ring-brand-green text-ink" : "bg-track text-ink-soft"
                    }`}>
                    <span className={`grid size-6 place-items-center rounded-full text-[11px]
                                      leading-none ${shu ? "bg-brand-green/25" : "bg-karta"}`}>
                      {x.belgi}
                    </span>
                    {x.nom}
                    {shu && <Icon name="check" size={16} className="text-brand-green-d" />}
                  </button>
                );
              })}
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
          {(hisob.profillar?.length ?? 1) > 1 && (
            <div className="az-kirish mt-4 rounded-clay bg-karta p-4 shadow-clay-sm"
              style={{ "--az-kech": "60ms" } as React.CSSProperties}>
              <div className="font-display text-[14px]">{t("bolalar")}</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-dim">
                {t("bolalarIzoh")}
              </p>

              <div className="mt-3 space-y-2">
                {(hisob.profillar ?? []).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-track px-3 py-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-karta text-[20px]">
                      {p.avatar || "🦊"}
                    </span>
                    <span className="min-w-0 flex-1 text-[14px]">{p.ism || t("ismsiz")}</span>
                  </div>
                ))}
              </div>

              <button type="button" onClick={onProfillar}
                className="clay-press mt-3 flex w-full items-center justify-center gap-2 rounded-3xl
                           bg-track py-2.5 font-display text-[14px] text-ink-soft">
                <Icon name="parent" size={17} />
                {t("bolalarniBoshqarish")}
              </button>
            </div>
          )}

          {/* ---- kirish usullari ---- */}
          {(
            <div className="az-kirish mt-4 rounded-clay bg-karta p-4 shadow-clay-sm"
              style={{ "--az-kech": "80ms" } as React.CSSProperties}>
              <div className="font-display text-[14px]">{t("kirishUsullari")}</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-dim">
                {t("kirishUsulIzoh")}
              </p>

              <div className="mt-3 space-y-2">
                <Usul ic="phone" nom={t("usulTelefon")}
                  qiymat={hisob.telefon ? raqamniBeza(hisob.telefon) : ""}
                  yoq={t("raqamniYuboring")} />
                <Usul ic="send" nom={t("usulTelegram")}
                  qiymat={hisob.telegram ? t("boglangan") : ""}
                  yoq={t("boglanmagan")} />
                <Usul ic="phone" nom={t("usulQurilma")}
                  qiymat={hisob.qurilma ? t("shuQurilma") : ""}
                  yoq={t("boglanmagan")} />
              </div>

              {/* Telegram bog'lanmagan bo'lsa — shu yerdan bog'lash mumkin.
                  Yo'l kirish ekranidagi bilan AYNAN bir xil: botga o'tadi,
                  bot havola yuboradi. Progress yo'qolmaydi — server ikki
                  hisobni birlashtiradi (`auth/kod`). */}
              {!hisob.telegram && bot && (
                <div className="mt-3 border-t border-track pt-3">
                  <p className="mb-2 text-center text-[12px] leading-snug text-ink-dim">
                    {t("telegramTaklif")}
                  </p>
                  <a href={botHavolasi(bot)}
                    className="clay-press flex w-full items-center justify-center gap-2
                               rounded-3xl bg-brand-green py-2.5 font-display text-[14px] text-white">
                    <Icon name="send" size={16} />
                    {t("telegramBoglash")}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ---- yo'lboshchi ----
              Sayohat bir marta ko'rsatiladi va shundan keyin uni qaytarish
              yo'li bo'lishi kerak. Bola uni tasodifan o'tkazib yuborishi,
              yoki telefonni ikkinchi farzand olishi mumkin — ikkala holatda
              ham "qayerda nima" degan savol yana paydo bo'ladi. */}
          {(
            <div className="az-kirish mt-4 rounded-clay bg-karta p-4 shadow-clay-sm"
              style={{ "--az-kech": "90ms" } as React.CSSProperties}>
              <div className="font-display text-[14px]">{t("yolboshchi")}</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-dim">
                {t("turIzoh")}
              </p>
              <button type="button"
                disabled={turQayta}
                onClick={() => { turniUnut(); setTurQayta(true); }}
                className="clay-press mt-3 flex w-full items-center justify-center gap-2 rounded-3xl
                           bg-track py-2.5 font-display text-[14px] text-ink-soft disabled:opacity-60">
                <Icon name={turQayta ? "check" : "repeat"} size={17} />
                {turQayta ? t("turBoshlanadi") : t("turQaytadan")}
              </button>
            </div>
          )}

          {/* ---- ovoz ----
              Ilova savol va so'zlarni ovoz chiqarib o'qiydi. Kichkintoylar
              bo'limida bu ishlash sharti — 3 yoshli bola o'qiy olmaydi —
              lekin ovoz kerak bo'lmaydigan payt ham bor: avtobus,
              kutubxona, uxlab yotgan chaqaloq.

              Tugma o'sha bo'lim ichida ham bor (`components/OvozTugma`),
              chunki o'chirish kerak bo'lgan payt har doim SHOSHILINCH.
              Bu yerdagisi esa ota-ona ataylab qidiradigan joy: u
              sozlamani bir marta qo'yib, unutadi. */}
          {(
            <div className="az-kirish mt-4 rounded-clay bg-karta p-4 shadow-clay-sm"
              style={{ "--az-kech": "95ms" } as React.CSSProperties}>
              <div className="font-display text-[14px]">{t("ovozSarlavha")}</div>
              <p className="mt-1 text-[12px] leading-snug text-ink-dim">
                {t("ovozIzoh")}
              </p>
              <button type="button"
                onClick={() => { const y = !ovoz; ovozniYoq(y); setOvoz(y); }}
                aria-pressed={ovoz}
                className="clay-press mt-3 flex w-full items-center justify-center gap-2 rounded-3xl
                           bg-track py-2.5 font-display text-[14px] text-ink-soft">
                <Icon name="ovoz" size={17}
                  className={ovoz ? "text-brand-green-d" : "text-ink-dim"} />
                {ovoz ? t("ovozOchirish") : t("ovozYoqish")}
              </button>
            </div>
          )}

          {/* ---- chiqish ----
              Mini App ichida KO'RSATILMAYDI. U yerda sessiya Telegram'ning
              o'zinikidan kelib chiqadi: chiqqan zahoti ilova `initData`
              bilan xuddi shu hisobga qaytadan kirardi. Tugma bosiladi,
              hech narsa o'zgarmaydi — buzuq tugma. */}
          {!miniAppda() && (
            <div className="az-kirish mt-4 rounded-clay bg-karta p-4 shadow-clay-sm"
              style={{ "--az-kech": "100ms" } as React.CSSProperties}>
              {tasdiq ? (
                <>
                  <p className="text-center text-[13px] leading-snug text-ink-soft">
                    {t("chiqishSavol")}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => setTasdiq(false)}
                      className="clay-press flex-1 rounded-3xl bg-track py-2.5
                                 font-display text-[14px] text-ink-soft">
                      {t("bekor")}
                    </button>
                    <button type="button" onClick={chiqish}
                      className="clay-press flex-1 rounded-3xl bg-brand-red py-2.5
                                 font-display text-[14px] text-white">
                      {t("haChiqaman")}
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => setTasdiq(true)}
                  className="clay-press w-full rounded-3xl bg-track py-2.5
                             font-display text-[14px] text-ink-soft">
                  {t("hisobdanChiqish")}
                </button>
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
