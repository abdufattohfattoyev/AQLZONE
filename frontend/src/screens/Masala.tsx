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
import { masalaniUlash } from "../lib/ulash";
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

  /**
   * Kanal tugmasining holati — faqat adminda ishlatiladi.
   *
   * "sorayapti" — tasdiq so'ralayotgan payt. Bir bosishda kanalga
   * ketib qolmasligi uchun: kanal xabarini qaytarib olib bo'lmaydi.
   */
  const [kanal, setKanal] = useState<
    "yopiq" | "sorayapti" | "ketmoqda" | "bordi" | "xato"
  >("yopiq");

  useEffect(() => {
    let bekor = false;
    setM(null); setXato(false); setNatija(null); setJavob("");
    setKanal("yopiq");
    MS.bittasi(id)
      .then((d) => {
        if (bekor) return;
        setM(d);
        setOvozim(d.ovozim ?? "");
        setSonlar({ like: d.like, dislike: d.dislike });
        if (d.kanal?.yuborilgan) setKanal("bordi");
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

  /**
   * Kanalga yuboradi — tasdiq bosilgandan KEYIN.
   *
   * Kanal xabarini o'chirib bo'lmaydi (u obunachilarga allaqachon
   * yetib boradi), shuning uchun bu yerda ikkinchi bosish shart.
   */
  const kanalgaYubor = async () => {
    if (!m || kanal === "ketmoqda") return;
    setKanal("ketmoqda");
    try {
      await MS.kanalgaYubor(m.id);
      tebrat("yutuq");
      setKanal("bordi");
    } catch {
      setKanal("xato");
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

        {/* Ulashish FAQAT tasdiqlangan masalada: navbatda turgan yoki
            rad etilgan masalani havola bilan ochgan odam "topilmadi"
            degan ekranga tushardi. */}
        {m.holat === "tasdiq" && (
          <button type="button" onClick={() => void masalaniUlash(m.id, m.matn)}
            aria-label={t("masalaUlash")} title={t("masalaUlash")}
            className="clay-press grid size-9 shrink-0 place-items-center rounded-2xl
                       bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="send" size={16} />
          </button>
        )}
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

      {/* ---- statistika ----
          Uchta son ATAYLAB alohida turadi. Ilgari ular pastda bitta
          qator bo'lib chiqardi ("8/47 yechdi") va u ikki xil o'qilardi:
          "47 tadan 8 tasi" ham, "47 ta urinishdan 8 tasi to'g'ri"
          ham. Endi har bir son o'z nomi bilan turadi.

          Foiz — bo'limning "eng qiyin" ro'yxati quriladigan son
          (`Masala.qiyinlik`): birinchi urinishda yecha olganlar
          ulushi. Hech kim urinmagan bo'lsa u ko'rsatilmaydi, chunki
          nol urinishdan foiz chiqmaydi. */}
      {m.holat === "tasdiq" && <Sanoq
        uringan={natija?.urinishSoni ?? m.urinishSoni}
        yechgan={natija?.yechganSoni ?? m.yechganSoni}
      />}

      {/* ---- kanal tugmasi (faqat admin) ----
          Ko'rinishi ataylab boshqa: uzuq chiziqli ramka va xira rang.
          Bu foydalanuvchi tugmasi emas, ish quroli — u masalaning
          o'z tugmalari bilan bir xil og'irlikda turmasligi kerak. */}
      {m.kanal?.mumkin && (
        <div className="mt-3 rounded-clay border-[1.5px] border-dashed border-track px-3.5 py-2.5">
          {kanal === "bordi" ? (
            <p className="flex items-center gap-2 text-[12.5px] text-brand-green">
              <Icon name="check" size={15} />
              {t("masalaKanalBordi")}
            </p>
          ) : kanal === "sorayapti" ? (
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 text-[12.5px] text-ink-soft">
                {t("masalaKanalSorov")}
              </span>
              <button type="button" onClick={() => void kanalgaYubor()}
                className="clay-press shrink-0 rounded-full bg-brand-green px-3 py-1.5
                           text-[12px] text-white">
                {t("masalaKanalHa")}
              </button>
              <button type="button" onClick={() => setKanal("yopiq")}
                className="clay-press shrink-0 rounded-full bg-track px-3 py-1.5
                           text-[12px] text-ink-soft">
                {t("masalaKanalYoq")}
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setKanal("sorayapti")}
              disabled={kanal === "ketmoqda"}
              className="clay-press flex w-full items-center gap-2 text-[12.5px]
                         text-ink-soft disabled:opacity-50">
              <Icon name="send" size={15} />
              {kanal === "ketmoqda" ? t("yuklanyapti") : t("masalaKanal")}
              {kanal === "xato" && (
                <span className="ml-auto text-[11.5px] text-brand-red">
                  {t("masalaKanalXato")}
                </span>
              )}
            </button>
          )}
        </div>
      )}

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

          {/* Yechgan zahoti — ulashish uchun eng kuchli payt: odam
              hozirgina yenggan va buni ko'rsatgisi keladi. Xato
              javobdan keyin taklif qilinmaydi, u yerda u maqtanish
              emas, malomat bo'lib eshitilardi. */}
          {natija.togri && m.holat === "tasdiq" && (
            <button type="button" onClick={() => void masalaniUlash(m.id, m.matn)}
              className="tugma-3d az-yaltir mt-2.5 flex w-full items-center justify-center gap-2
                         rounded-clay bg-brand-blue py-2.5 font-display text-[14px] text-white
                         shadow-[0_4px_0_var(--color-brand-blue-d)]">
              <Icon name="send" size={16} />
              {t("masalaUlashTogri")}
            </button>
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

      {/* ---- ovoz ----
          Sanoq bu yerdan YUQORIGA ko'chdi: u masalaning o'zi haqida
          va shart bilan birga o'qilishi kerak, ovoz esa masaladan
          keyingi fikr. */}
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
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- bo'laklar */

/**
 * Uringan, yechgan va foiz — uchta botiq katak.
 *
 * Foiz uchinchi bo'lib turadi va u boshqa RANGDA: bu yerdagi ikkita
 * son masalaning tarixi, foiz esa uning O'LCHOVI. Bir xil ko'rinishda
 * turganda uchalasi bir xil og'irlikda o'qilardi.
 */
function Sanoq({ uringan, yechgan }: { uringan: number; yechgan: number }) {
  const foiz = uringan > 0 ? Math.round((yechgan * 100) / uringan) : null;
  return (
    <div className="mt-2.5">
      <div className="shadow-ichki flex items-stretch rounded-clay bg-sahna px-1 py-2.5">
        <Katak nom={t("masalaUringanlar")} qiymat={String(uringan)} />
        <Chiziq />
        <Katak nom={t("masalaYechganlar")} qiymat={String(yechgan)} rang="text-brand-green" />
        <Chiziq />
        <Katak
          nom={t("masalaFoiz")}
          qiymat={foiz === null ? t("masalaFoizYoq") : `${foiz}%`}
          rang="text-brand-purple"
        />
      </div>
      <p className="mt-1.5 text-center text-[11px] text-ink-dim">
        {t("masalaBirinchiIzoh")}
      </p>
    </div>
  );
}

function Katak(
  { nom, qiymat, rang = "" }: { nom: string; qiymat: string; rang?: string },
) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1">
      <span className={`font-display text-[19px] leading-none ${rang}`}>{qiymat}</span>
      <span className="truncate text-[10.5px] leading-tight text-ink-dim">{nom}</span>
    </div>
  );
}

const Chiziq = () => <span aria-hidden className="w-px shrink-0 self-stretch bg-ink-dim/20" />;

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
