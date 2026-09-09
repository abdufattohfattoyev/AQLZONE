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
import { useEffect, useRef, useState } from "react";
import { Halqa } from "../components/Halqa";
import { MasalaMatn } from "../components/MasalaMatn";
import { TangaHisob } from "../components/TangaHisob";
import { TangaOqim } from "../components/TangaOqim";
import { TangaSorov } from "../components/TangaSorov";
import { Variantlar } from "../components/Variantlar";
import { avatarBelgi } from "../lib/dokon";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { qiyinlikNomi } from "../lib/masalaQiyin";
import { sinfNomi, sinfRangi } from "../lib/masalaSinf";
import * as MS from "../lib/masala";
import type { JavobNatija, Masala as MasalaTur, Ovoz } from "../lib/masala";
import { kelasiOvoz, sanoqniHisobla } from "../lib/masalaOvoz";
import { ENG_KATTA_MUKOFOT, YECHIM_NARX, bepulOchiladi, mukofot } from "../lib/masalaTanga";
import { useProgress } from "../lib/progress";
import { masalaniUlash } from "../lib/ulash";
import { havolaniOch, tebrat, useOrqaga } from "../lib/qobiq";

/**
 * "05.09 14:30" — kanal tekshiruvi qachon bo'lgani.
 *
 * Yil ATAYLAB yo'q: tekshiruv har kuni ishlaydi, ya'ni sana deyarli
 * har doim shu haftaniki. Yil esa qatorni cho'zib, undan muhimroq
 * yozuvni telefonda siqib qo'yardi.
 */
function qisqaSana(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const ikki = (n: number) => String(n).padStart(2, "0");
  return `${ikki(d.getDate())}.${ikki(d.getMonth() + 1)} `
    + `${ikki(d.getHours())}:${ikki(d.getMinutes())}`;
}

interface Props {
  id: number;
  onMuallif: (profilId: number) => void;
  onBack: () => void;
  /** Yechib bo'lgandan keyingi davom yo'li — boshqa masalaga o'tish. */
  onKeyingi: (masalaId: number) => void;
}

export function Masala({ id, onMuallif, onBack, onKeyingi }: Props) {
  const ozStrelka = useOrqaga(onBack);

  const [m, setM] = useState<MasalaTur | null>(null);
  const [xato, setXato] = useState(false);
  const [javob, setJavob] = useState("");
  const [natija, setNatija] = useState<JavobNatija | null>(null);
  const [yuborilmoqda, setYuborilmoqda] = useState(false);
  const [ovozim, setOvozim] = useState<Ovoz>("");
  const [sonlar, setSonlar] = useState({ like: 0, dislike: 0 });

  /**
   * Test masalasida belgilangan variant. `-1` — hech biri.
   *
   * Tanlov DARHOL yuborilmaydi (`components/Variantlar.tsx` dagi
   * izohga qarang): birinchi urinish statistikaga tushadi va uni
   * tasodifiy bosish bilan sarflab yuborish mumkin emas.
   */
  const [tanlangan, setTanlangan] = useState(-1);

  /**
   * Uchayotgan tanga — `{n, yonalish}` yoki `null`.
   *
   * Mukofot ham, sarf ham SHU YERDAN ko'rsatiladi. Ilgari tanga
   * jimgina qo'shilib, jimgina kamayardi va bola qancha olganini
   * ham, nimaga sarflaganini ham sezmasdi.
   */
  const [oqim, setOqim] = useState<{ n: number; yonalish: "keldi" | "ketdi" } | null>(null);

  /** Yechim uchun tanga sarflash ruxsati so'ralayaptimi. */
  const [sorov, setSorov] = useState(false);

  /**
   * Kanal tugmasining holati — faqat adminda ishlatiladi.
   *
   * "sorayapti" — tasdiq so'ralayotgan payt. Bir bosishda kanalga
   * ketib qolmasligi uchun: kanal xabarini qaytarib olib bo'lmaydi.
   */
  const [kanal, setKanal] = useState<
    "yopiq" | "sorayapti" | "qaytaSorayapti" | "ketmoqda" | "bordi" | "xato"
  >("yopiq");
  /** Kanaldagi postning manzili — yuborilgandan keyin paydo bo'ladi. */
  const [kanalHavola, setKanalHavola] = useState("");
  /**
   * Kunlik tekshiruv postni kanalda topmadi.
   *
   * `kanal === "bordi"` bilan birga turadi va bu ziddiyat emas:
   * masala bir marta CHIQQAN, keyin post o'chib ketgan. Aynan shu
   * holatda "qayta yuborish" eng kerak bo'ladi.
   */
  const [kanalYoq, setKanalYoq] = useState(false);
  const [kanalTekshirildi, setKanalTekshirildi] = useState("");

  /** Tanga evaziga (yoki bepul) ochilgan yechim. */
  const [ochilgan, setOchilgan] =
    useState<{
      yechim: string; javob: string;
      keyingi?: MS.Keyingi | null; muallifMasalalari?: number;
    } | null>(null);
  const [ochilmoqda, setOchilmoqda] = useState(false);
  /** Shu urinishda nechta tanga berildi — natija ostida ko'rinadi. */
  const [mukofotOlindi, setMukofotOlindi] = useState(0);

  /**
   * Yechim ushbu urinishdan OLDIN ochiq edimi.
   *
   * Tanga faqat o'zi yechganga beriladi: yechimni ochib, keyin
   * o'sha javobni ko'chirgan odamga emas. Buni bilish uchun
   * "oldingi holat" kerak — `natija` esa allaqachon yangisi.
   */
  const ochiqEdi = useRef(false);

  const { jamiTanga, tangaYech, oyinTugadi } = useProgress();

  useEffect(() => {
    let bekor = false;
    setM(null); setXato(false); setNatija(null); setJavob("");
    setKanal("yopiq"); setKanalHavola("");
    setKanalYoq(false); setKanalTekshirildi("");
    setOchilgan(null); setMukofotOlindi(0);
    setTanlangan(-1); setOqim(null); setSorov(false);
    ochiqEdi.current = false;
    MS.bittasi(id)
      .then((d) => {
        if (bekor) return;
        setM(d);
        setOvozim(d.ovozim ?? "");
        setSonlar({ like: d.like, dislike: d.dislike });
        ochiqEdi.current = Boolean(d.yechimOchiq);
        if (d.kanal?.yuborilgan) {
          setKanal("bordi");
          setKanalHavola(d.kanal.havola ?? "");
          setKanalYoq(Boolean(d.kanal.yoq));
          setKanalTekshirildi(d.kanal.tekshirilgan ?? "");
        }
      })
      .catch(() => { if (!bekor) setXato(true); });
    return () => { bekor = true; };
  }, [id]);

  /** Yechim ekranda ochiqmi: serverdan kelgan bo'lsa — ha. */
  const yechim = ochilgan?.yechim ?? natija?.yechim ?? m?.yechim ?? "";
  const togriJavob = ochilgan?.javob ?? natija?.javob ?? m?.javob ?? "";

  /** Test masalasimi — javob tanlanadimi yoki yoziladimi. */
  const test = (m?.variantlar.length ?? 0) > 0;

  /**
   * Yechim ochilganmi — EKRAN SHUNGA QARAB QAYTA TUZILADI.
   *
   * Yechilgunga qadar asosiy narsa — shart: u ochiq turadi va
   * ekranning yarmini egallaydi. Yechilgandan keyin esa u
   * O'QILGAN bo'ladi va shu joyni yechim egallashi kerak. Shuning
   * uchun shart yig'iladi, yechim esa ochiq karta bo'lib chiqadi.
   *
   * Ikkala holat uchun ikkita ekran yozish ham mumkin edi, lekin
   * ular albatta bir-biridan qolib ketardi: bittasiga kanal tugmasi
   * qo'shiladi, ikkinchisi eski holida qolardi.
   */
  const yechildi = Boolean(yechim);

  /** Yechib bo'lgandan keyingi davom yo'li. */
  const keyingi = ochilgan?.keyingi ?? natija?.keyingi ?? m?.keyingi ?? null;

  /* Muallifning masalalari soni UCH manbadan kelishi mumkin va
     tartib muhim: sahifa yechilgan holda ochilsa — `m` dan, shu
     yerda yechilsa — javobdan yoki yechimni ochish javobidan.
     Faqat `m` ga qarab qolsak, hozirgina yechgan odamga karta
     umuman chiqmasdi: sahifa yechilishdan OLDIN yuklangan. */
  const muallifSoni =
    ochilgan?.muallifMasalalari ?? natija?.muallifMasalalari ?? m?.muallifMasalalari ?? 0;

  /* Sanoqlar javob berilgandan keyin YANGILANADI: odam o'z
     urinishini darhol ko'rishi kerak, sahifani qayta ochib emas. */
  const uringanSoni = natija?.urinishSoni ?? m?.urinishSoni ?? 0;
  const yechganSoni = natija?.yechganSoni ?? m?.yechganSoni ?? 0;
  /** Hech kim urinmagan bo'lsa foiz ma'nosiz (server 100 qaytaradi). */
  const olchangan = uringanSoni > 0;
  const foiz = olchangan ? Math.round((yechganSoni * 100) / uringanSoni) : 0;
  /* Qiyinlik `m.qiyinlik` dan EMAS, o'sha yerdayoq hisoblangan
     foizdan olinadi. Ikkalasi ham bir xil o'lchov (birinchi
     urinishda yechganlar ulushi), lekin `m.qiyinlik` sahifa
     ochilgan paytdagi holat: javob berilgandan keyin foiz
     o'zgaradi-yu, "Murakkabligi" eski qiymatda qolib ketardi. */
  const qiyin = qiyinlikNomi(foiz);

  /** Shu odam necha marta urindi — yechim narxi shunga bog'liq. */
  const urinishim = natija?.urinishim ?? m?.urinishim ?? 0;
  const bepul = bepulOchiladi(urinishim);
  const yetarli = jamiTanga >= YECHIM_NARX;

  const yubor = async () => {
    // Test masalasida javob TANLANADI, yozilmaydi. Ikkalasi shu
    // yerda bitta satrga keladi: undan keyingi butun yo'l — tekshiruv,
    // statistika, tanga — ikkala turda ham aynan bir xil.
    const jonatiladigan = test ? (m?.variantlar[tanlangan] ?? "") : javob.trim();
    if (!m || !jonatiladigan || yuborilmoqda) return;
    setYuborilmoqda(true);
    try {
      const oldinOchiq = ochiqEdi.current;
      const d = await MS.javobBer(m.id, jonatiladigan);
      setNatija(d);
      ochiqEdi.current = d.yechimOchiq;
      tebrat(d.togri ? "togri" : "xato");

      // Tanga FAQAT o'zi yechganga. Yechimni ochib, keyin o'sha
      // javobni ko'chirgan odamga berilmaydi — aks holda tangani
      // "sotib olib" yig'ish mumkin bo'lardi.
      if (d.togri && !oldinOchiq) {
        const n = mukofot(d.urinishim);
        setMukofotOlindi(n);
        oyinTugadi(n, 1);
        setOqim({ n, yonalish: "keldi" });
      }
    } catch {
      setXato(true);
    } finally {
      setYuborilmoqda(false);
    }
  };

  /**
   * Yechimni ochadi.
   *
   * Uch urinishdan keyin bepul, undan oldin — tanga evaziga. Tanga
   * AVVAL yechiladi: server javobini kutib turganda odam tugmani
   * ikkinchi marta bosib, ikki marta to'lashi mumkin edi.
   *
   * Tangali yo'lda bu funksiya TASDIQDAN KEYIN chaqiriladi
   * (`components/TangaSorov.tsx`): tanga qaytmaydi va tugma aynan
   * odam qiynalgan, ya'ni shoshib bosadigan paytda turadi.
   */
  const yechimniOch = async () => {
    if (!m || ochilmoqda) return;
    if (!bepul) {
      if (!tangaYech(YECHIM_NARX)) return;
      setOqim({ n: YECHIM_NARX, yonalish: "ketdi" });
    }
    setOchilmoqda(true);
    try {
      const d = await MS.yechimniOch(m.id);
      ochiqEdi.current = true;
      setOchilgan(d);
      tebrat("tanlov");
    } catch {
      setXato(true);
    } finally {
      setOchilmoqda(false);
    }
  };

  /**
   * Yechim tugmasi bosildi.
   *
   * Bepul bo'lsa darhol ochiladi, tangali bo'lsa AVVAL ruxsat
   * so'raladi. Ikkalasi bitta tugmada, chunki odam uchun bu bitta
   * amal — farqi faqat narxda.
   */
  const yechimSora = () => {
    if (bepul) { void yechimniOch(); return; }
    setSorov(true);
  };

  /**
   * Kanalga yuboradi — tasdiq bosilgandan KEYIN.
   *
   * Kanal xabarini o'chirib bo'lmaydi (u obunachilarga allaqachon
   * yetib boradi), shuning uchun bu yerda ikkinchi bosish shart.
   *
   * `qayta` — allaqachon chiqqan postni yangilash. Tasdiq bu yerda
   * ham so'raladi va matni boshqacha: qayta yuborishda ESKI post
   * o'chadi, ya'ni bu ham qaytarib bo'lmaydigan qadam.
   */
  const kanalgaYubor = async (qayta = false) => {
    if (!m || kanal === "ketmoqda") return;
    setKanal("ketmoqda");
    try {
      const d = await MS.kanalgaYubor(m.id, qayta);
      tebrat("yutuq");
      setKanalHavola(d.havola ?? "");
      // Yangi post — "yo'q" belgisi darhol so'nadi: admin natijani
      // keyingi kunlik tekshiruvni kutmasdan ko'rishi kerak.
      setKanalYoq(Boolean(d.yoq));
      setKanalTekshirildi(d.tekshirilgan ?? "");
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
        {/* Tanga aynan SHU ekranda sarflanadi va shu yerda topiladi —
            oynadagi "65 dan 50 qoladi" degan gap sarlavhadagi shu
            songa nisbatan o'qiladi. */}
        <TangaHisob />
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] leading-none
                          ${sinfRangi(m.sinf)}`}>
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

      {/* ---- muallif qatori ----
          Karta emas, QATOR: muallif masalaning egasi, lekin
          masalaning o'zi emas. Ilgari u to'liq karta bo'lib turardi
          va shart bilan bir xil og'irlikda ko'rinardi — ekran esa
          shartdan boshlanishi kerak. */}
      <button type="button" onClick={() => onMuallif(m.muallif.id)}
        className="clay-press mt-3 flex w-full items-center gap-2 text-left">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-track text-[13px]">
          {avatarBelgi(m.muallif.avatar)}
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] leading-tight">
          {m.muallif.ism}
        </span>
        <span className="shrink-0 text-[11px] text-ink-dim">{t("masalaMuallifKor")}</span>
        <Icon name="chevron" size={14} className="shrink-0 text-ink-dim" />
      </button>

      {/* ---- masala kartasi: sarlavha, shart, chizma ----
          YECHILGANDAN KEYIN YIG'ILADI. Shart o'qilgan bo'ladi va
          ekranning yarmini egallab turishi kerak emas — o'sha joyni
          yechim egallaydi. Lekin butunlay olib tashlanmaydi: yechimni
          o'qiyotgan odam "xo'sh, savol nima edi?" deb qaytishi juda
          tez-tez uchraydi va u bir bosishda qaytishi kerak. */}
      <details open={!yechildi}
        className="az-natija group mt-2.5 rounded-clay border border-track bg-karta p-4
                   shadow-clay-sm">
        {/* Kartaning sarlavha qatori. Chapda masala raqami — odam
            uni do'stiga aytadi va kanaldagi post bilan solishtiradi;
            o'ngda qiyinlik — SO'Z bilan, chunki bu yerda joy bor va
            "Qiyin" degan so'z besh nuqtadan aniqroq.

            Yig'ilgan holatda shu qator BOSILADIGAN bo'ladi va o'ng
            chetda chevron paydo bo'ladi. Ochiq holatda esa u oddiy
            sarlavha bo'lib turadi: bosadigan narsa yo'q. */}
        <summary className={`flex items-center gap-2 border-b border-track pb-2.5 ${
          yechildi ? "cursor-pointer list-none" : "pointer-events-none list-none"}`}>
          <span className="min-w-0 flex-1 truncate font-display text-[11.5px] tracking-widest
                           text-brand-purple uppercase">
            {t("masalaShartSarlavha", { n: m.id })}
          </span>
          {olchangan && !yechildi && (
            <span className="shrink-0 text-[11px] text-ink-dim">
              {t("masalaQiyinlik")}:{" "}
              <b className={`font-display ${qiyin.rang}`}>{qiyin.nom}</b>
            </span>
          )}
          {yechildi && (
            <>
              <span className="shrink-0 text-[11px] text-ink-dim group-open:hidden">
                {t("masalaShartKor")}
              </span>
              <span className="hidden shrink-0 text-[11px] text-ink-dim group-open:inline">
                {t("masalaShartYop")}
              </span>
              <Icon name="chevron" size={15}
                className="shrink-0 rotate-90 text-ink-dim transition-transform
                           group-open:-rotate-90" />
            </>
          )}
        </summary>

        <div className="mt-3">
          <MasalaMatn matn={m.matn} />
        </div>

        {/* Chizma matn bilan BIR kartada: u masalaning bir qismi,
            alohida ilova emas. Geometriya masalasini chizmasiz o'qib
            bo'lmaydi — "ABC uchburchakda..." degan matn chizmasiz
            yarim masala.

            Botiq ramka ichida: karta ko'tarilgan, chizma esa uning
            ichiga o'yilgan oyna. Oq fon esa majburiy — chizmalar oq
            fonda tayyorlanadi va qorong'i mavzuda ular ramkasiz
            "osilib" qolardi. */}
        {m.rasm && (
          <figure className="shadow-ichki mt-3 overflow-hidden rounded-2xl bg-sahna p-2">
            <img src={m.rasm} alt="" loading="lazy"
              className="max-h-[60vh] w-full rounded-xl object-contain" />
          </figure>
        )}
      </details>

      {/* ---- yechuvchilar statistikasi ----
          Halqa + bitta gap. Ilgari bu yerda uchta raqamli katak
          turardi ("Urinib ko'rdi / Yechdi / Yechish foizi") va ular
          uch marta bir xil narsani boshqa shaklda aytardi.

          Foiz — bo'limning "eng qiyin" ro'yxati quriladigan son
          (`Masala.qiyinlik`): birinchi urinishda yecha olganlar
          ulushi. Hech kim urinmagan bo'lsa halqa umuman chizilmaydi:
          nol urinishdan foiz chiqmaydi va "0%" degan yozuv masalani
          imkonsiz ko'rsatib qo'yardi. */}
      {m.holat === "tasdiq" && (
        <div className="shadow-ichki mt-2.5 flex items-center gap-3 rounded-clay bg-sahna
                        px-3.5 py-2.5">
          {olchangan ? (
            <>
              <Halqa foiz={foiz} rang={foiz >= 50 ? "stroke-brand-green" : "stroke-brand-orange"}>
                <span className={`font-display text-[11px] ${
                  foiz >= 50 ? "text-brand-green" : "text-brand-orange"}`}>
                  {foiz}%
                </span>
              </Halqa>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] leading-tight">
                  {t("masalaYechganFoiz", { n: foiz })}
                </span>
                <span className="text-[11px] text-ink-dim">
                  {t("masalaJamiUrinish", { n: uringanSoni, y: yechganSoni })}
                </span>
              </span>
              <Korildi n={m.korishSoni} />
            </>
          ) : (
            <>
              <span className="grid size-11 shrink-0 place-items-center rounded-full
                               bg-brand-purple/15 text-[18px]">
                🚩
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[13px] leading-tight
                                 text-brand-purple">
                  {t("masalaBirinchiBol")}
                </span>
                <span className="text-[11px] text-ink-dim">{t("masalaHechKim")}</span>
              </span>
              <Korildi n={m.korishSoni} />
            </>
          )}
        </div>
      )}

      {/* ---- kim urinib ko'rgan (faqat admin) ----
          Kanal qatori bilan bir xil ko'rinishda: ikkalasi ham ish
          quroli va foydalanuvchi tugmalari bilan bir og'irlikda
          turmasligi kerak. */}
      {m.kanal?.mumkin && <Kimlar id={m.id} />}

      {/* ---- kanal tugmasi (faqat admin) ----
          Ko'rinishi ataylab boshqa: uzuq chiziqli ramka va xira rang.
          Bu foydalanuvchi tugmasi emas, ish quroli — u masalaning
          o'z tugmalari bilan bir xil og'irlikda turmasligi kerak. */}
      {m.kanal?.mumkin && (
        <div className="mt-3 rounded-clay border-[1.5px] border-dashed border-track px-3.5 py-2.5">
          {kanal === "bordi" ? (
            /* Yuborilgandan keyin ikki qator: TEPADA holat, PASTDA
               amallar. Holat ikki xil bo'ladi — post joyida yoki
               kunlik tekshiruv uni topmagan. Amallar esa har ikkala
               holatda ham kerak: postni ko'rish va qayta yuborish. */
            <div className="flex flex-col gap-2">
              <span className={`flex min-w-0 items-center gap-2 text-[12.5px]
                                ${kanalYoq ? "text-brand-red" : "text-brand-green"}`}>
                <Icon name={kanalYoq ? "repeat" : "check"} size={15} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">
                  {kanalYoq ? t("masalaKanalYoqdi") : t("masalaKanalBordi")}
                </span>
                {kanalTekshirildi && (
                  <span className="shrink-0 text-[11px] text-ink-soft">
                    {qisqaSana(kanalTekshirildi)} {t("masalaKanalTekshirildi")}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {kanalHavola && !kanalYoq && (
                  <button type="button" onClick={() => havolaniOch(kanalHavola)}
                    className="clay-press flex shrink-0 items-center gap-1 rounded-full
                               bg-brand-blue px-3 py-1.5 text-[12px] text-white">
                    {t("masalaKanalKorish")}
                    <Icon name="chevron" size={13} />
                  </button>
                )}
                {/* Qayta yuborish HAR DOIM turadi, faqat yo'qolganda
                    emas: chizma yoki matn tuzatilgandan keyin ham
                    kanaldagi post eskirib qoladi. */}
                <button type="button" onClick={() => setKanal("qaytaSorayapti")}
                  className={`clay-press flex shrink-0 items-center gap-1 rounded-full
                              px-3 py-1.5 text-[12px] ${kanalYoq
                                ? "bg-brand-green text-white"
                                : "bg-track text-ink-soft"}`}>
                  <Icon name="repeat" size={13} />
                  {t("masalaKanalQayta")}
                </button>
              </div>
            </div>
          ) : kanal === "sorayapti" || kanal === "qaytaSorayapti" ? (
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 text-[12.5px] text-ink-soft">
                {t(kanal === "qaytaSorayapti"
                  ? "masalaKanalQaytaSorov" : "masalaKanalSorov")}
              </span>
              <button type="button"
                onClick={() => void kanalgaYubor(kanal === "qaytaSorayapti")}
                className="clay-press shrink-0 rounded-full bg-brand-green px-3 py-1.5
                           text-[12px] text-white">
                {t("masalaKanalHa")}
              </button>
              <button type="button"
                onClick={() => setKanal(kanal === "qaytaSorayapti" ? "bordi" : "yopiq")}
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
          {/* Bo'lim sarlavhasi — javob QANDAY berilishini bir qatorda
              aytadi. Testda variantlar o'zi ko'rinib turadi, lekin
              yozma turda bo'sh maydonning nima kutayotgani sarlavhasiz
              bilinmasdi ("bu izohmi yoki javobmi?"). */}
          <div className="mb-2 flex items-center gap-1.5 px-0.5">
            <span aria-hidden className="size-2 rounded-full bg-brand-purple" />
            <h2 className="min-w-0 flex-1 truncate text-[11.5px] tracking-wider
                           text-ink-dim uppercase">
              {t(test ? "masalaVariantTanla" : "masalaJavobSarlavha")}
            </h2>
            {test && (
              <span className="shrink-0 rounded-full bg-brand-green/15 px-2 py-0.5
                               text-[10.5px] leading-none text-brand-green">
                {t("masalaTestBelgi")}
              </span>
            )}
          </div>

          {test ? (
            /* ---- test: variantlardan tanlanadi ---- */
            <Variantlar
              variantlar={m.variantlar}
              tanlangan={tanlangan}
              onTanla={(i) => { setTanlangan(i); tebrat("tanlov"); }}
              ochiq={Boolean(togriJavob)}
              togriJavob={togriJavob}
            />
          ) : (
            /* Javob maydoni BOTIQ — kartalar ko'tarilgan, yoziladigan
               joy esa yuzaga o'yilgan. Shu farq "bu yerga yozing"
               degan yagona ishora bo'lib turadi. */
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
          )}

          {/* Tugma IKKALA turda ham bir xil turadi va bu ataylab:
              "javobni yuborish" — bitta amal, uni qanday tayyorlagani
              (yozgan yoki tanlagan) tugmaga bog'liq emas.

              Testda yechim ochilgandan keyin tugma yo'qoladi:
              variantlar allaqachon o'chirilgan va bosadigan narsa
              qolmaydi. Yozma turda esa maydon qoladi — odam yechimni
              o'qib, o'zini yana sinab ko'rishi mumkin.

              Mukofot tugmaning O'ZIDA: bu hozir bosiladigan tugma va
              nima uchun bosilishi shu yerda aytilishi kerak. */}
          {!(test && togriJavob) && (
            <button type="button" onClick={() => void yubor()}
              disabled={(test ? tanlangan < 0 : !javob.trim()) || yuborilmoqda}
              /* Tugma ichi UCH bo'lakka bo'lingan: chapda belgi,
                 o'rtada amal, o'ngda mukofot. Mukofot markazda,
                 yozuvning yonida turganda ular bitta uzun gap bo'lib
                 qo'shilib ketardi va tanga soni ko'zga tashlanmasdi. */
              className="tugma-3d mt-2 flex w-full items-center gap-2 rounded-clay
                         bg-brand-green px-3.5 py-3 font-display text-[15px] text-white
                         shadow-clay disabled:opacity-50">
              <span aria-hidden className="shrink-0 text-[17px] leading-none">✅</span>
              <span className="min-w-0 flex-1 truncate text-left">
                {yuborilmoqda ? t("yuklanyapti") : t("masalaTekshir")}
              </span>
              {!yuborilmoqda && (
                <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/20
                                 px-2 py-0.5 text-[12.5px] leading-none">
                  <Icon name="coin" size={12} />
                  +{mukofot(urinishim + 1)}
                </span>
              )}
            </button>
          )}

          {/* Qoida tugmaning O'ZI OSTIDA: u aynan hozir bosiladigan
              tugmaga tegishli. Statistika qatorida turganda u
              o'tmish haqidagi ma'lumot bo'lib o'qilardi, bu yerda
              esa ogohlantirish — "shoshmang". Yechilgandan keyin
              kerak emas va yo'qoladi. */}
          {urinishim === 0 && (
            <p className="mt-1.5 text-center text-[11px] text-ink-dim">
              {t("masalaBirinchiIzoh")}
            </p>
          )}
        </div>
      )}

      {/* ---- natija ---- */}
      {natija && (
        /* `key` javob raqamiga bog'langan: har yangi urinishda React
           bo'lakni qaytadan yasaydi va chiqish animatsiyasi noldan
           ishlaydi. Aks holda ikkinchi xato javobda ekranda hech
           narsa qimirlamasdi va odam javob ketdimi-yo'qmi bilmasdi. */
        <div key={natija.urinishim}
          className={`az-natija mt-3 rounded-clay border p-3.5 ${
            natija.togri
              ? "border-brand-green/40 bg-brand-green/12"
              : "border-brand-red/40 bg-brand-red/12"}`}>
          <div className="flex items-center gap-2">
            <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-2xl
                                          text-[17px] leading-none ${
              natija.togri ? "bg-brand-green/20" : "bg-brand-red/20"}`}>
              {natija.togri ? "🎉" : "🔁"}
            </span>
            <p className={`min-w-0 flex-1 font-display text-[15px] ${
              natija.togri ? "text-brand-green" : "text-brand-red"}`}>
              {natija.togri ? t("masalaTogri") : t("masalaXato")}
            </p>
            {/* Mukofot natijaning YONIDA turadi: tanga aynan shu
                javob uchun berilgani shundagina ko'rinadi. */}
            {mukofotOlindi > 0 && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-gold/20
                               px-2.5 py-1 text-[12px] font-display text-brand-gold">
                <Icon name="coin" size={13} />
                {t("masalaTangaOldingiz", { n: mukofotOlindi })}
              </span>
            )}
          </div>

          {/* Xato javobdan keyin TO'G'RI JAVOB KO'RSATILMAYDI —
              ilgari u darhol chiqardi va ikkinchi urinish uchun sabab
              qolmasdi. Yechim ochilgan bo'lsagina javob quyida,
              yechimning ichida ko'rinadi. */}
          {!natija.togri && (
            <p className="mt-1 text-[13px] leading-snug text-ink-soft">
              {t("masalaYanaUrin")}
            </p>
          )}
          {natija.togri && mukofotOlindi > 0 && (
            <p className="mt-1 text-[11.5px] text-ink-dim">{t("masalaTangaIzoh")}</p>
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

      {/* ---- "yechgansiz" belgisi ----
          FAQAT qaytib kelganda: shu seansda javob berilgan bo'lsa,
          yuqorida allaqachon to'liq natija bo'lagi turibdi va ikkita
          bir xil xabar chiqardi.

          Nima uchun kerak: qaytib kelganda shart yig'ilgan, yechim
          esa ochiq turadi — bu holat "men buni yechganmidim yoki
          javobni sotib olganmidimmi?" degan savol tug'dirardi. */}
      {yechildi && !natija && m.holat === "tasdiq" && (
        <div className={`mt-3 flex items-center gap-2 rounded-clay border px-3.5 py-2.5 ${
          m.birinchiTogri
            ? "border-brand-green/40 bg-brand-green/10"
            : "border-track bg-karta"}`}>
          <Icon name={m.birinchiTogri ? "check" : "repeat"} size={15}
            className={`shrink-0 ${m.birinchiTogri ? "text-brand-green" : "text-ink-dim"}`} />
          <span className={`min-w-0 flex-1 text-[12.5px] ${
            m.birinchiTogri ? "text-brand-green" : "text-ink-soft"}`}>
            {t(m.birinchiTogri ? "masalaYechgandingiz" : "masalaYechimOchilgan")}
          </span>
        </div>
      )}

      {/* ---- yechim ---- */}
      {yechim ? (
        /* Yechim YIG'ILADIGAN bo'limda va ochiq holda chiqadi.
           Ochiqligi ataylab: u qiyinchilik bilan (to'g'ri javob,
           uchta urinish yoki tanga) ochilgan va uni yana bir marta
           bosib ochtirish — mehnatga hurmatsizlik.

           Yig'ish esa keyin kerak bo'ladi: yechim uzun bo'ladi va
           masalaga qaytgan odam uni har safar aylanib o'tishga
           majbur bo'lardi. */
        <details open className="az-natija group mt-3 rounded-clay border border-track
                                 bg-karta p-4 shadow-clay-sm">
          <summary className="flex cursor-pointer list-none items-center gap-2
                              border-b border-track pb-2.5">
            <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-xl
                                         bg-brand-purple/15 text-[15px] leading-none">
              💡
            </span>
            <span className="shrink-0 font-display text-[12px] tracking-widest
                             text-brand-purple uppercase">
              {t("masalaYechim")}
            </span>
            {/* To'g'ri javob SARLAVHADA turadi: yechim yig'ilgan
                bo'lsa ham u ko'rinib qoladi. Odam masalaga ko'pincha
                aynan shu bitta son uchun qaytadi. */}
            {togriJavob && (
              <span className="ml-auto flex min-w-0 items-center gap-1.5 text-[12px]">
                <Icon name="check" size={13} className="shrink-0 text-brand-green" />
                <b className="truncate font-display text-brand-green">{togriJavob}</b>
              </span>
            )}
            <Icon name="chevron" size={16}
              className={`shrink-0 rotate-90 text-ink-dim transition-transform
                          group-open:-rotate-90 ${togriJavob ? "" : "ml-auto"}`} />
          </summary>

          <p className="mt-3 text-[14.5px] leading-relaxed whitespace-pre-wrap">
            {yechim}
          </p>
        </details>
      ) : m.holat === "tasdiq" && (
        /* ---- yechimni ochish ----
            Urinmagan odamga umuman ko'rinmaydi: yechimni urinmasdan
            sotib olish mumkin emas, aks holda bo'lim javoblar
            ro'yxatiga aylanardi.

            Uch urinishdan keyin BEPUL bo'ladi — tangasi yo'q bola
            ham yordamsiz qolmasin. */
        urinishim > 0 ? (
          <div className="mt-3">
            {/* Tugma tanga YETMASA HAM bosiladi va bu ataylab
                o'zgartirildi: ilgari u o'chib qolardi va nima uchun
                o'chganini faqat pastdagi kichkina yozuv aytardi.
                Endi bosilsa oyna ochiladi va o'sha yerda "nechta
                yetmayapti" to'liq ko'rinadi. */}
            <button type="button" onClick={yechimSora} disabled={ochilmoqda}
              className={`clay-press flex w-full items-center justify-center gap-2 rounded-clay
                          py-3 text-[13.5px] shadow-clay-sm disabled:opacity-50 ${
                bepul ? "bg-karta text-ink-soft" : "bg-karta text-brand-gold"}`}>
              {!bepul && <Icon name="coin" size={15} />}
              {ochilmoqda
                ? t("yuklanyapti")
                : bepul
                  ? t("masalaYechimBepul")
                  : t("masalaYechimOch", { n: YECHIM_NARX })}
            </button>
            {!bepul && !yetarli && (
              <p className="mt-1.5 text-center text-[11.5px] text-ink-dim">
                {t("masalaTangaYetmadi", { n: YECHIM_NARX - jamiTanga })}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-center text-[12.5px] leading-snug text-ink-dim">
            {t("masalaYechimYopiq")}
          </p>
        )
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

      {/* ---- muallif va davom yo'li (yechilgandan keyin) ----
          Muallif TEPADA ham turadi, lekin u yerda ingichka qator
          bo'lib: masalani o'qiyotgan odamga "kim yozgan" degan
          savol keyin keladi. Yechib bo'lgandan keyin esa u boshqa
          savolga aylanadi — "yana nimalar yozgan?" — va aynan shu
          payt uni karta qilib ko'rsatish ma'noga ega. */}
      {yechildi && muallifSoni > 1 && (
        <button type="button" onClick={() => onMuallif(m.muallif.id)}
          className="clay-press az-natija mt-3 flex w-full items-center gap-2.5 rounded-clay
                     border border-track bg-karta px-3.5 py-3 text-left shadow-clay-sm">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-track
                           text-[18px]">
            {avatarBelgi(m.muallif.avatar)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] leading-tight">{m.muallif.ism}</span>
            <span className="text-[11.5px] text-ink-dim">
              {t("masalaMuallifJami", { n: muallifSoni })}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-0.5 text-[12px] text-brand-blue">
            {t("masalaBarchasi")}
            <Icon name="chevron" size={14} />
          </span>
        </button>
      )}

      {/* ---- navbatdagi masala ----
          Yechib bo'lgan odam ro'yxatga qaytib, o'sha sahifani
          qaytadan ko'zdan kechirib, keyingisini o'zi qidirishi
          kerak edi. Ko'pchilik qidirmaydi — shu yerda to'xtaydi.

          Karta ekranning ENG PASTIDA: u yechimni o'qib bo'lgandan
          keyingi qadam va yechimdan oldin turmasligi kerak. */}
      {yechildi && keyingi && (
        <button type="button" onClick={() => onKeyingi(keyingi.id)}
          className="tugma-3d az-natija mt-3 flex w-full items-center gap-3 rounded-clay
                     bg-brand-purple px-4 py-3.5 text-left text-white
                     shadow-[0_5px_0_var(--color-brand-purple-d)]">
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="text-[10.5px] tracking-widest uppercase opacity-80">
                {t("masalaNavbatdagi")}
              </span>
              <span className="flex items-center gap-0.5 rounded-full bg-white/20 px-1.5
                               py-0.5 text-[10.5px] leading-none">
                <Icon name="coin" size={10} />
                +{ENG_KATTA_MUKOFOT}
              </span>
            </span>
            <span className="mt-1 block truncate font-display text-[14px] leading-snug">
              {keyingi.matn}
            </span>
            <span className="text-[11px] opacity-80">{sinfNomi(keyingi.sinf)}</span>
          </span>
          <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white/20">
            <Icon name="chevron" size={18} />
          </span>
        </button>
      )}

      {/* ---- tanga oqimi ----
          Ekran DARAJASIDA, biror tugmaning ichida emas. Sabab: tanga
          ikki xil joydan keladi (javob tugmasi va yechimni ochish) va
          ikkalasi ham natijadan keyin YO'QOLADI — animatsiya ular
          bilan birga o'chib qolardi. Qatlam bosishni o'tkazadi, ya'ni
          bir soniya kutib turishga majburlamaydi. */}
      {oqim && (
        <span className="pointer-events-none fixed inset-0 z-[70]">
          <TangaOqim n={oqim.n} yonalish={oqim.yonalish} onTugadi={() => setOqim(null)} />
        </span>
      )}

      {/* ---- tanga sarflash ruxsati ---- */}
      {sorov && (
        <TangaSorov
          nima={t("tangaSorovYechim")}
          narx={YECHIM_NARX}
          bor={jamiTanga}
          onHa={() => { setSorov(false); void yechimniOch(); }}
          onYoq={() => setSorov(false)}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------------- bo'laklar */

/**
 * Nechta odam ochgan.
 *
 * Statistika qatorining O'NG chetida, foizdan ajratib turadi va bu
 * ataylab: foiz masalaning QIYINLIGI haqida, ko'rish esa uning
 * TAQDIRI haqida. Ikkalasi bir joyda bir gapdek o'qilardi.
 *
 * Nol bo'lsa umuman chiqmaydi: "0 kishi ochgan" degan yozuv
 * masalani tashlab ketilgandek ko'rsatadi, holbuki u hozirgina
 * ochilgan bo'lishi mumkin.
 */
function Korildi({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span title={t("masalaKorildiIzoh")}
      className="flex shrink-0 flex-col items-center gap-0.5 border-l border-ink-dim/15
                 pl-3 text-ink-dim">
      <span aria-hidden className="text-[13px] leading-none">👁</span>
      <span className="font-display text-[12px] leading-none">{n}</span>
    </span>
  );
}

/**
 * Kim urinib ko'rgan — administrator uchun yig'iladigan ro'yxat.
 *
 * ─────────────── SO'ROV FAQAT OCHILGANDA KETADI ───────────────
 *
 * Ro'yxat yopiq turadi va ma'lumot ochilgandagina so'raladi. Har
 * masala ochilganda yuzta odamning ismini yuklab olish — ekranni
 * sekinlashtiradi va bu ro'yxat aslida kamdan-kam kerak bo'ladi.
 *
 * ─────────────── YECHOLMAGANLAR HAM BOR ───────────────
 *
 * Ro'yxatda yechganlar ham, yecholmaganlar ham turadi. "Kim
 * qiynaldi" degan ma'lumot "kim yechdi" dan kam qimmatli emas:
 * o'nta odam ochib, hech biri yecholmasa — shart noaniq yozilgan
 * bo'lishi mumkin va buni faqat shu ro'yxat ko'rsatadi.
 */
function Kimlar({ id }: { id: number }) {
  const [holat, setHolat] = useState<"yopiq" | "yuklanmoqda" | "tayyor" | "xato">("yopiq");
  const [royxat, setRoyxat] = useState<MS.Urinuvchi[]>([]);

  const och = async () => {
    if (holat === "yuklanmoqda") return;
    setHolat("yuklanmoqda");
    try {
      const d = await MS.yechganlar(id);
      setRoyxat(d.royxat);
      setHolat("tayyor");
    } catch {
      setHolat("xato");
    }
  };

  return (
    <div className="mt-3 rounded-clay border-[1.5px] border-dashed border-track px-3.5 py-2.5">
      <button type="button" onClick={() => void och()}
        disabled={holat === "yuklanmoqda" || holat === "tayyor"}
        className="clay-press flex w-full items-center gap-2 text-[12.5px] text-ink-soft
                   disabled:cursor-default">
        <Icon name="parent" size={15} className="shrink-0" />
        <span className="min-w-0 flex-1 text-left">{t("masalaKimlar")}</span>
        {holat === "tayyor" ? (
          <span className="shrink-0 font-display text-[12px] text-brand-purple">
            {royxat.length}
          </span>
        ) : (
          <span className="shrink-0 text-[11.5px] text-ink-dim">
            {holat === "yuklanmoqda" ? t("yuklanyapti")
              : holat === "xato" ? t("masalaKimlarXato")
              : t("masalaKimlarOch")}
          </span>
        )}
      </button>

      {holat === "tayyor" && (
        royxat.length === 0 ? (
          <p className="mt-2 text-[11.5px] text-ink-dim">{t("masalaKimlarYoq")}</p>
        ) : (
          /* Ro'yxat balandligi CHEKLANGAN: yuzta odam bo'lsa u butun
             ekranni egallab, masalaning o'zini pastga surib
             yuborardi. */
          <ul className="mt-2 max-h-56 space-y-1.5 overflow-y-auto">
            {royxat.map((u) => (
              <li key={u.profilId} className="flex items-center gap-2 text-[12px]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full
                                 bg-track text-[11px] leading-none">
                  {avatarBelgi(u.avatar)}
                </span>
                <span className="min-w-0 flex-1 truncate">{u.ism}</span>
                <span className={`shrink-0 text-[11px] ${
                  u.birinchi ? "text-brand-green"
                  : u.yechdi ? "text-brand-blue"
                  : "text-ink-dim"}`}>
                  {u.birinchi ? `✓ ${t("masalaKimBirinchi")}`
                    : u.yechdi ? `✓ ${t("masalaKimYechdi", { n: u.urinish })}`
                    : t("masalaKimYecholmagan", { n: u.urinish })}
                </span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

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
