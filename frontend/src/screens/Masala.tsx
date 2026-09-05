/**
 * BITTA MASALA — yechish, yechimni ko'rish, ovoz berish.
 *
 * ─────────────── YECHIM URINISHDAN KEYIN ───────────────
 *
 * Ekran ochilganda yechim YO'Q — u serverdan umuman kelmagan
 * bo'ladi. Javob yuborilgandan keyin server uni javob bilan birga
 * qaytaradi va shundan keyin ekranda ochiladi.
 *
 * Qoida darsdagi bilan bir xil (`components/Yechim.tsx`): javobni
 * oldindan o'qish o'rganish emas, ko'chirish. Farqi shundaki, bu
 * yerda uni MIJOZ emas, SERVER qo'riqlaydi — faqat ekranda
 * yashirilsa, uni har kim tarmoq oynasidan o'qib olardi.
 *
 * ─────────────── XATO JAVOB YO'LNI YOPMAYDI ───────────────
 *
 * Xato javobdan keyin ham yechim ochiladi va odam yana urinib
 * ko'rishi mumkin. Statistikaga esa faqat BIRINCHI urinish
 * tushadi — ya'ni "nechta odam o'zi yecha oldi" degan son halol
 * qoladi, lekin o'rganish yo'li yopilmaydi.
 *
 * ─────────────── MUALLIF SHU YERDA ───────────────
 *
 * Masalani o'qigan odamning keyingi savoli deyarli har doim
 * bitta: "buni kim yozdi va yana nimalar yozgan?". Shuning uchun
 * muallif yozuvi masalaning O'Z ustida turadi va bosilsa uning
 * sahifasiga olib boradi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { sinfNomi } from "../lib/masalaSinf";
import * as MS from "../lib/masala";
import type { JavobNatija, Masala as MasalaTur, Ovoz } from "../lib/masala";
import { kelasiOvoz, sanoqniHisobla } from "../lib/masalaOvoz";
import { tebrat, useOrqaga } from "../lib/qobiq";

interface Props {
  id: number;
  onMuallif: (profilId: number) => void;
  onBack: () => void;
}

export function Masala({ id, onMuallif, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);

  const [m, setM] = useState<MasalaTur | null>(null);
  const [xato, setXato] = useState(false);
  const [javob, setJavob] = useState("");
  const [natija, setNatija] = useState<JavobNatija | null>(null);
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const [ovozim, setOvozim] = useState<Ovoz>("");
  const [sonlar, setSonlar] = useState({ like: 0, dislike: 0 });

  useEffect(() => {
    let bekor = false;
    setM(null); setXato(false); setNatija(null); setJavob("");
    MS.bittasi(id)
      .then((d) => {
        if (bekor) return;
        setM(d);
        setOvozim(d.ovozim ?? "");
        setSonlar({ like: d.like, dislike: d.dislike });
      })
      .catch(() => { if (!bekor) setXato(true); });
    return () => { bekor = true; };
  }, [id]);

  /** Yechim ekranda ochiqmi: serverdan kelgan bo'lsa — ha. */
  const yechim = natija?.yechim ?? m?.yechim ?? "";
  const togriJavob = natija?.javob ?? m?.javob ?? "";

  const yubor = async () => {
    if (!m || !javob.trim() || yuborilmoqda) return;
    setYuborilmoqda(true);
    try {
      const d = await MS.javobBer(m.id, javob.trim());
      setNatija(d);
      tebrat(d.togri ? "togri" : "xato");
    } catch {
      setXato(true);
    } finally {
      setYuborilmoqda(false);
    }
  };

  const ovozBer = async (tur: "like" | "dislike") => {
    if (!m || m.meniki) return;
    tebrat("tanlov");
    // Ekran DARHOL o'zgaradi, javob kutilmaydi: tugma bosilib,
    // yarim soniya hech narsa bo'lmasa, odam uni ikkinchi marta
    // bosadi va ovozini o'zi qaytarib olardi.
    const oldingi = { ovozim, sonlar };
    const yangi = kelasiOvoz(ovozim, tur);
    setOvozim(yangi);
    setSonlar(sanoqniHisobla(sonlar, ovozim, yangi));
    try {
      const d = await MS.ovozBer(m.id, tur);
      setOvozim(d.ovozim);
      setSonlar({ like: d.like, dislike: d.dislike });
    } catch {
      // Server rad etsa — ekranni o'sha holiga qaytaramiz. Aks
      // holda odam ovozi hisoblangan deb o'ylab qolardi.
      setOvozim(oldingi.ovozim);
      setSonlar(oldingi.sonlar);
    }
  };

  if (xato && !m) {
    return <Xabar matn={t("masalaTopilmadi")} onBack={onBack} ozStrelka={ozStrelka} />;
  }
  if (!m) {
    return <Xabar matn={t("yuklanyapti")} onBack={onBack} ozStrelka={ozStrelka} />;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-10">
      {/* Sarlavha qatori ro'yxat ekranidagi bilan bir xil turadi:
          orqaga — yozuvsiz strelka, o'ng chetda esa sinf yorlig'i
          (kartadagidek botiq). */}
      <div className="flex items-center gap-2">
        {!ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press -ml-1 grid size-10 shrink-0 place-items-center rounded-2xl
                       text-ink-soft">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate font-display text-[17px] leading-none">
          {t("masalaBitta")}
        </h1>
        <span className="shadow-ichki shrink-0 rounded-full bg-sahna px-2.5 py-1 text-[11px]
                         leading-none text-ink-soft">
          {sinfNomi(m.sinf)}
        </span>
      </div>

      {/* ---- muallif ---- */}
      <button type="button" onClick={() => onMuallif(m.muallif.id)}
        className="clay-press mt-3 flex w-full items-center gap-2.5 rounded-clay bg-karta
                   px-3.5 py-2.5 text-left shadow-clay-sm">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-track text-[15px]">
          {m.muallif.avatar || "🦊"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] leading-tight">{m.muallif.ism}</span>
          <span className="text-[11px] text-ink-dim">{t("masalaMuallifKor")}</span>
        </span>
        <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
      </button>

      {/* ---- masala matni va chizmasi ---- */}
      <div className="mt-2.5 rounded-clay bg-karta p-4 shadow-clay-sm">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.matn}</p>
        {/* Rasm matn bilan BIR kartada: u masalaning bir qismi,
            alohida ilova emas. Geometriya masalasini chizmasiz
            o'qib bo'lmaydi — "ABC uchburchakda..." degan matn
            chizmasiz yarim masala. */}
        {m.rasm && (
          <img src={m.rasm} alt="" loading="lazy"
            className="mt-3 max-h-[60vh] w-full rounded-2xl bg-track object-contain" />
        )}
      </div>

      {/* ---- holat (faqat o'z masalasi) ---- */}
      {m.holat === "kutmoqda" && <Belgi rang="gold" matn={t("masalaKutmoqdaIzoh")} />}
      {m.holat === "rad" && (
        <Belgi rang="red" matn={m.radSababi || t("masalaRad")} />
      )}

      {/* ---- javob maydoni ----
          Yechim ochilgandan keyin ham qoladi: odam uni o'qib,
          o'zini sinab ko'rish uchun yana yozishi mumkin. */}
      {m.holat === "tasdiq" && (
        <div className="mt-3">
          {/* Javob maydoni BOTIQ — kartalar ko'tarilgan, yoziladigan
              joy esa yuzaga o'yilgan. Shu farq "bu yerga yozing"
              degan yagona ishora bo'lib turadi. */}
          <label className="shadow-ichki flex items-center gap-2 rounded-clay bg-sahna
                            px-3.5 py-3">
            <Icon name="pencil" size={16} className="shrink-0 text-ink-dim" />
            <input
              value={javob}
              onChange={(e) => setJavob(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void yubor(); }}
              placeholder={t("masalaJavobJoy")}
              maxLength={100}
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none
                         placeholder:text-ink-dim"
            />
          </label>
          <button type="button" onClick={() => void yubor()}
            disabled={!javob.trim() || yuborilmoqda}
            className="tugma-3d mt-2 w-full rounded-clay bg-brand-green py-3 font-display
                       text-[15px] text-white shadow-clay disabled:opacity-50">
            {yuborilmoqda ? t("yuklanyapti") : t("masalaTekshir")}
          </button>
        </div>
      )}

      {/* ---- natija ---- */}
      {natija && (
        <div className={`mt-3 rounded-clay p-3.5 ${
          natija.togri ? "bg-brand-green/15" : "bg-brand-red/15"}`}>
          <p className={`font-display text-[15px] ${
            natija.togri ? "text-brand-green" : "text-brand-red"}`}>
            {natija.togri ? t("masalaTogri") : t("masalaXato")}
          </p>
          {!natija.togri && (
            <p className="mt-1 text-[13px] text-ink-soft">
              {t("masalaTogriJavob", { javob: togriJavob })}
            </p>
          )}
        </div>
      )}

      {/* ---- yechim ---- */}
      {yechim ? (
        <div className="mt-3 rounded-clay bg-karta p-4 shadow-clay-sm">
          <p className="mb-2 text-[11px] tracking-widest text-ink-soft uppercase">
            {t("masalaYechim")}
          </p>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{yechim}</p>
        </div>
      ) : m.holat === "tasdiq" && (
        <p className="mt-3 text-center text-[12.5px] leading-snug text-ink-dim">
          {t("masalaYechimYopiq")}
        </p>
      )}

      {/* ---- ovoz va statistika ---- */}
      {m.holat === "tasdiq" && (
        <div className="shadow-ichki mt-3 flex items-center gap-1.5 rounded-full bg-sahna
                        p-1.5">
          <OvozTugma
            belgi="👍" son={sonlar.like} faol={ovozim === "like"} oz={m.meniki}
            on={() => void ovozBer("like")}
          />
          <OvozTugma
            belgi="👎" son={sonlar.dislike} faol={ovozim === "dislike"} oz={m.meniki}
            on={() => void ovozBer("dislike")}
          />
          <span className="ml-auto pr-2 text-right text-[11.5px] leading-tight text-ink-dim">
            {t("masalaYechdi", {
              n: natija?.yechganSoni ?? m.yechganSoni,
              jami: natija?.urinishSoni ?? m.urinishSoni,
            })}
          </span>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- bo'laklar */

function OvozTugma(
  { belgi, son, faol, oz, on }:
  { belgi: string; son: number; faol: boolean; oz: boolean; on: () => void },
) {
  return (
    <button type="button" onClick={on} disabled={oz}
      // O'z masalasiga ovoz berib bo'lmaydi. Tugma YASHIRILMAYDI,
      // faqat o'chiriladi: yashirilsa, muallif sonni umuman
      // ko'rmay qolardi.
      title={oz ? t("masalaOzOvoz") : undefined}
      className={`clay-press flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px]
                  disabled:opacity-45 ${
        faol ? "bg-brand-purple text-white shadow-clay-sm" : "bg-karta text-ink-soft"}`}>
      <span>{belgi}</span>
      <span className="tabular-nums">{son}</span>
    </button>
  );
}

function Belgi({ rang, matn }: { rang: "gold" | "red"; matn: string }) {
  return (
    <p className={`mt-2.5 rounded-clay px-3.5 py-2.5 text-[12.5px] leading-snug ${
      rang === "gold" ? "bg-brand-gold/15 text-brand-gold" : "bg-brand-red/15 text-brand-red"}`}>
      {matn}
    </p>
  );
}

function Xabar(
  { matn, onBack, ozStrelka }: { matn: string; onBack: () => void; ozStrelka: boolean },
) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3">
      {!ozStrelka && (
        <button type="button" onClick={onBack} aria-label={t("ortga")}
          className="clay-press grid size-11 place-items-center rounded-2xl bg-karta
                     text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}
      <p className="mt-10 text-center text-[13.5px] text-ink-dim">{matn}</p>
    </div>
  );
}
