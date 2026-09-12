/**
 * MASALALAR RO'YXATI — foydalanuvchilar yozgan masalalar.
 *
 * ─────────────── NEGA TEPA QISM SHUNCHA PAST ───────────────
 *
 * Ilgari ro'yxatgacha to'rtta qavat bor edi: sarlavha, ostida
 * izoh qatori, keyin butun ekran kengligidagi binafsha "Masala
 * qo'shish" kartasi va ikkita tasma. Telefonda birinchi masala
 * ekranning yarmidan pastda boshlanardi — ya'ni bo'limning o'zi
 * ko'rinmasdi.
 *
 * Endi uch qavat va hammasi past:
 *
 *   sarlavha + ikkita amal   bitta qatorda
 *   saralash                 chiziqli tab, karta emas
 *   sinf                     yupqa tugmachalar
 *
 * "Masala qo'shish" sarlavha qatoriga, binafsha tugma bo'lib
 * ko'chdi: u ekranning eng ko'rinadigan burchagida turadi va
 * ro'yxatdan joy olmaydi. Uzun izohi yo'qoldi, chunki bosilgandan
 * keyingi ekran o'zi hammasini so'raydi.
 *
 * Bo'sh ro'yxatda esa u YANA katta bo'lib qaytadi: u yerda
 * ro'yxatdan olinadigan joy yo'q va yozishdan boshqa qiladigan
 * ish ham yo'q.
 *
 * ─────────────── NEGA TO'RTTA SARALASH ───────────────
 *
 * "Yangi" — bo'limning tirikligini ko'rsatadi va yangi muallifga
 * ko'rinish beradi: uning masalasi tasdiqlanishi bilan eng tepada
 * turadi.
 *
 * "Qiyin" — bo'limning eng qiziq ro'yxati. U LIKE bilan emas,
 * yechilganlar foizi bilan quriladi: yoqtirish masalaning
 * qiyinligi haqida hech narsa demaydi, "yuztadan o'n kishi yechdi"
 * esa aynan shuni aytadi.
 *
 * "Zo'r" va "Ko'p yechilgan" — odatiy ikki o'lchov.
 *
 * ─────────────── SINF FILTRI NEGA IXTIYORIY ───────────────
 *
 * Standart holda HAMMA sinf ko'rinadi. 5-sinf bolasi 7-sinf
 * masalasini ochib, yechib ham qo'yishi mumkin va uni oldindan
 * to'sishning ma'nosi yo'q — bu bo'lim dars emas, u yerda tartib
 * ham, qulf ham yo'q.
 */
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { t } from "../lib/matn";
import { MasalaKarta } from "../components/MasalaKarta";
import { TangaHisob } from "../components/TangaHisob";
import { SINFLAR } from "../lib/masalaSinf";
import * as MS from "../lib/masala";
import type { Holat, Masala, Tartib } from "../lib/masala";
import { tebrat, useOrqaga } from "../lib/qobiq";

/**
 * Saralash tasmasi.
 *
 * Har birida emoji bor va u BEZAK EMAS: to'rtta tugmacha bir xil
 * kulrang matn bo'lib turganda ular bir-biridan faqat o'qib
 * ajratilardi, emoji esa ularni bir qarashda ajratadi va
 * tanlanganini eslab qolishga yordam beradi.
 */
const TARTIBLAR: { kod: Tartib; belgi: string; nom: () => string }[] = [
  { kod: "yangi", belgi: "✨", nom: () => t("masalaYangilar") },
  { kod: "qiyin", belgi: "⚡", nom: () => t("masalaQiyinlar") },
  { kod: "zor", belgi: "🔥", nom: () => t("masalaZorlar") },
  { kod: "koplik", belgi: "🎯", nom: () => t("masalaKoplar") },
];

/**
 * Yechilganlik filtri.
 *
 * "Yechgan" — BIRINCHI urinishda to'g'ri topgani, ya'ni kartadagi
 * yashil belgi bilan bir xil qoida. Xato javob bergan masala
 * "yechilmagan" tomonda qoladi va bu ataylab: odam u yerga aynan
 * qaytib kelishi kerak.
 */
const HOLATLAR: { kod: Holat; ic?: IconName; nom: () => string }[] = [
  { kod: "hammasi", nom: () => t("masalaHolatHammasi") },
  { kod: "yechilmagan", ic: "repeat", nom: () => t("masalaHolatYechilmagan") },
  { kod: "yechgan", ic: "check", nom: () => t("masalaHolatYechgan") },
];


interface Props {
  onOch: (id: number) => void;
  onYangi: () => void;
  onMenikilar: () => void;
  onBack: () => void;
}

export function Masalalar({ onOch, onYangi, onMenikilar, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);
  const [tartib, setTartib] = useState<Tartib>("yangi");
  const [sinf, setSinf] = useState<number | null>(null);
  const [royxat, setRoyxat] = useState<Masala[]>([]);
  const [sahifa, setSahifa] = useState(0);
  const [sahifalar, setSahifalar] = useState(1);
  const [jami, setJami] = useState(0);

  /** Yechilganlik filtri — hammasi / yechilmagan / yechgan. */
  const [yechilganlik, setYechilganlik] = useState<Holat>("hammasi");
  /**
   * Saralash YO'NALISHI — teskarisiga o'girilganmi.
   *
   * Tanlangan saralashdan alohida saqlanadi: odam "Yangi" dan
   * "Eng qiyin" ga o'tganda yo'nalish o'zgarmasligi kerak — u
   * boshqa savolga javob beradi.
   */
  const [teskari, setTeskari] = useState(false);
  const [holat, setHolat] = useState<"yuklanmoqda" | "tayyor" | "xato">("yuklanmoqda");

  /**
   * Qaysi tanlov varag'i ochiq — yoki hech qaysi.
   *
   * Uchala filtr bitta qatorda, uchta tanlagichda turadi va
   * ro'yxatlari varaqda ochiladi. Ilgari uchalasi ham ekranda
   * ochiq tugmachalar tasmasi edi: uch qator bir xil og'irlikda
   * turib, ekranning yarmini yerdi va sinf ro'yxati (o'n oltita)
   * baribir tasmaga sig'may, yonlamasiga surilardi — ya'ni
   * "8-sinf" ni topish uchun surish kerak bo'lardi.
   */
  const [varaq, setVaraq] = useState<"tartib" | "sinf" | "holat" | null>(null);

  /** Tanlagichlarda ko'rinadigan joriy qiymatlar. */
  const joriyTartib = TARTIBLAR.find((x) => x.kod === tartib) ?? TARTIBLAR[0];
  const joriyHolat = HOLATLAR.find((x) => x.kod === yechilganlik) ?? HOLATLAR[0];
  const sinfNomi = sinf === null
    ? t("masalaHammaSinf")
    : (SINFLAR.find((x) => x.kod === sinf)?.nom ?? t("masalaHammaSinf"));

  const och = (v: "tartib" | "sinf" | "holat") => { tebrat("tanlov"); setVaraq(v); };

  /**
   * Ro'yxatni oladi — bitta SAHIFANI.
   *
   * Ilgari "yana ko'rsatish" natijani ustiga qo'shardi va ro'yxat
   * cheksiz cho'zilardi: o'ninchi masaladan keyin odam qayerda
   * turganini bilmasdi, boshiga qaytish uchun esa uzoq surish
   * kerak edi. Endi sahifalar raqamlangan va har biri o'nta.
   */
  const yukla = useCallback(async (s: number) => {
    setHolat("yuklanmoqda");
    try {
      const d = await MS.royxat(sinf, tartib, s, yechilganlik, teskari);
      setRoyxat(d.masalalar);
      setSahifa(d.sahifa);
      setSahifalar(d.sahifalar);
      setJami(d.jami);
      setHolat("tayyor");
      // Yangi sahifa BOSHIDAN ko'rinadi: aks holda odam o'rtada
      // qolib, "nima o'zgardi?" degan savol bilan qolardi.
      if (s > 0) window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // Bo'sh ekran o'rniga xato yozuvi: internetsiz ochgan odam
      // "bu yerda hech narsa yo'q ekan" deb chiqib ketmasin.
      setHolat("xato");
    }
  }, [sinf, tartib, yechilganlik, teskari]);

  // Saralash, sinf yoki filtr o'zgarsa — birinchi sahifadan qaytadan.
  useEffect(() => { void yukla(0); }, [yukla]);

  const almashtir = (k: Tartib) => { tebrat("tanlov"); setTartib(k); };
  const sinfniTanla = (k: number | null) => { tebrat("tanlov"); setSinf(k); };
  const holatniTanla = (k: Holat) => { tebrat("tanlov"); setYechilganlik(k); };
  const teskariAlmashtir = () => { tebrat("tanlov"); setTeskari((x) => !x); };

  /* Filtr tegilmagan bo'lsa — bo'lim haqiqatan bo'sh. Tegilgan
     bo'lsa esa "bu filtrda yo'q" degani va u yerda katta "yozing"
     tugmasi noto'g'ri javob bo'lardi. */
  const bosh = holat === "tayyor" && royxat.length === 0;
  const butunlayBosh = bosh && sinf === null && tartib === "yangi"
    && yechilganlik === "hammasi";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-10">
      {/* ---- sarlavha va amallar ----
          ENG TOR EKRANGA moslangan va bu shart: Telegram Mini App
          320 piksellik telefonlarda ham ochiladi, bu qatorda esa
          beshta narsa bor. Uchta o'lchov nuqtasi:

            <360px   "Yozish" yozuvi yashirinadi, tugma faqat + belgisi
            <400px   "Mening" yozuvi yashirinadi, faqat qalam qoladi
            >=400px  hammasi yozuvi bilan

          Belgilar QOLADI, yozuvlar ketadi: tugmaning o'lchami
          o'zgarmaydi, ya'ni barmoq o'sha joyni topaveradi. */}
      <div className="flex items-center gap-2">
        {!ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press grid size-9 shrink-0 place-items-center rounded-full
                       bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={18} className="rotate-180" />
          </button>
        )}

        {/* Sarlavha bloki — ikki qator. Shior nima uchun kerak:
            bo'lim nomi ("Masalalar") uning nimaligini aytadi, lekin
            nima uchun kerakligini aytmaydi. Birinchi marta kirgan
            odam aynan shu ikkinchi savol bilan keladi. */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[19px] leading-tight">
            {t("masalalar")}
          </h1>
          <p className="truncate text-[11px] leading-tight text-ink-dim">
            {t("masalalarShior")}
          </p>
        </div>

        {/* "Mening" — ikkinchi darajali amal va shunday ham
            ko'rinadi: yozuv, karta emas. */}
        <button type="button" onClick={onMenikilar} title={t("masalaMenikilar")}
          aria-label={t("masalaMenikilar")}
          className="clay-press flex h-9 shrink-0 items-center gap-1 rounded-full px-2
                     text-[12.5px] text-ink-dim">
          <Icon name="pencil" size={15} className="shrink-0" />
          <span className="hidden min-[400px]:inline">{t("masalaMenikilarQisqa")}</span>
        </button>

        {/* Tanga hisobi — bo'limning butun iqtisodi shu songa
            nisbatan o'lchanadi ("+10", "15 tanga"). Streak, XP va
            liga ATAYLAB yo'q: ular boshqa ekranlarda o'z joyida
            turadi va bu yerda to'rtta bir xil yorliq bo'lib,
            hech biri o'qilmasdi. */}
        <TangaHisob />

        {/* Asosiy amal — ro'yxatning ustida emas, YONIDA. Matni
            qisqa, chunki uning izohi keyingi ekranning o'zi. */}
        <button type="button" onClick={onYangi} title={t("masalaYoz")}
          aria-label={t("masalaYoz")}
          className="tugma-3d flex h-9 shrink-0 items-center gap-1 rounded-full
                     bg-brand-purple px-3 text-white shadow-clay-sm">
          <Icon name="plus" size={16} />
          <span className="hidden font-display text-[13px] leading-none min-[360px]:inline">
            {t("masalaYozQisqa")}
          </span>
        </button>
      </div>

      {/* ---- uchta tanlagich, bitta qator ----
          Har biri yorliq (nima tanlanmoqda) va qiymat (nima
          tanlangan) ko'rsatadi. Yorliq shart: qiymatning o'zi
          ("Hammasi") qaysi filtrniki ekanini aytmaydi. */}
      <div className="mt-3 flex gap-1.5">
        <Tanlagich yorliq={t("masalaSaralash")} on={() => och("tartib")}
          qiymat={<><EmojiBelgi e={joriyTartib.belgi} olcham={12} />{joriyTartib.nom()}</>} />
        <Tanlagich yorliq={t("masalaSinfYorliq")} on={() => och("sinf")}
          qiymat={sinfNomi} />
        <Tanlagich yorliq={t("masalaHolatYorliq")} on={() => och("holat")}
          qiymat={joriyHolat.nom()} />
      </div>

      {varaq === "tartib" && (
        <TanlovVaraq sarlavha={t("masalaSaralash")} onYop={() => setVaraq(null)}>
          {TARTIBLAR.map((x) => (
            <Tanlov key={x.kod} faol={tartib === x.kod}
              on={() => { almashtir(x.kod); setVaraq(null); }}>
              <EmojiBelgi e={x.belgi} olcham={14} />{x.nom()}
            </Tanlov>
          ))}
          {/* Yo'nalish SHU YERDA, chunki u saralashning bir qismi:
              "Yangi" ni tanlab bo'lib, "eng eskisidan" deyish
              mumkin. Alohida tugma bo'lganda u qaysi saralashga
              tegishli ekani ko'rinmasdi. */}
          <span className="mt-1 w-full border-t border-track pt-2.5" />
          <Tanlov faol={teskari} on={teskariAlmashtir}>
            <Icon name="chevron" size={13}
              className={`transition-transform ${teskari ? "-rotate-90" : "rotate-90"}`} />
            {t(teskari ? "masalaEskidan" : "masalaYangidan")}
          </Tanlov>
        </TanlovVaraq>
      )}

      {varaq === "sinf" && (
        <TanlovVaraq sarlavha={t("masalaSinfYorliq")} onYop={() => setVaraq(null)}>
          <Tanlov faol={sinf === null} on={() => { sinfniTanla(null); setVaraq(null); }}>
            {t("masalaHammaSinf")}
          </Tanlov>
          {SINFLAR.map((x) => (
            <Tanlov key={x.kod} faol={sinf === x.kod}
              on={() => { sinfniTanla(x.kod); setVaraq(null); }}>
              {x.nom}
            </Tanlov>
          ))}
        </TanlovVaraq>
      )}

      {varaq === "holat" && (
        <TanlovVaraq sarlavha={t("masalaHolatYorliq")} onYop={() => setVaraq(null)}>
          {HOLATLAR.map((x) => (
            <Tanlov key={x.kod} faol={yechilganlik === x.kod}
              on={() => { holatniTanla(x.kod); setVaraq(null); }}>
              {x.ic && <Icon name={x.ic} size={13} />}{x.nom()}
            </Tanlov>
          ))}
        </TanlovVaraq>
      )}

      {/* ---- natija qatori ----
          Son filtr qatoridan SHU YERGA ko'chdi. Sabab: u filtrning
          bir bo'lagi emas, uning NATIJASI. Qator oxirida turganda u
          "yana bitta tugma" bo'lib ko'rinardi va sonni o'qish uchun
          tasmani surish kerak bo'lardi.

          SARALASH NOMI BU YERDAN OLINDI. U tepada ham turardi va
          bitta narsa ikki joyda ko'rinardi — odam "ikkalasi
          boshqa-boshqa narsami?" deb o'ylardi. Yo'nalish tugmasi
          ham shu yerda edi, endi u saralash varag'ining ichida:
          yo'nalish saralashning bir qismi, alohida boshqaruv
          emas. */}
      {holat === "tayyor" && jami > 0 && (
        <div className="mt-2.5 flex items-center gap-2 px-1 text-[12px]">
          <span className="flex min-w-0 items-center gap-1.5 text-ink-soft">
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand-green" />
            <span className="truncate">{t("masalaTopildi", { n: jami })}</span>
          </span>
        </div>
      )}

      {/* ---- ro'yxat ---- */}
      {holat === "yuklanmoqda" && (
        <p className="mt-10 text-center text-[13px] text-ink-dim">{t("yuklanyapti")}</p>
      )}
      {holat === "xato" && (
        <p className="mt-10 text-center text-[13px] text-ink-dim">{t("aloqaYoq")}</p>
      )}

      {bosh && <Bosh katta={butunlayBosh} onYangi={onYangi} />}

      <div className="mt-3 space-y-2.5">
        {royxat.map((m) => (
          <MasalaKarta key={m.id} m={m} on={() => onOch(m.id)} />
        ))}
      </div>

      {sahifalar > 1 && holat === "tayyor" && (
        <Sahifalar joriy={sahifa} jami={sahifalar} on={(s) => void yukla(s)} />
      )}
    </div>
  );
}

/**
 * SAHIFA RAQAMLARI.
 *
 * Ilgari "yana ko'rsatish" tugmasi bor edi va ro'yxat cheksiz
 * cho'zilardi: o'ninchi masaladan keyin odam qayerda turganini
 * bilmasdi va boshiga qaytish uchun uzoq surishga majbur edi.
 *
 * Raqamlar telefonda ham sig'ishi kerak, shuning uchun ular
 * DOIMIY beshta o'rin egallaydi: joriy sahifa o'rtada, ikki
 * yonida qo'shnilari. Chetlarda esa oyna surilib, birinchi yoki
 * oxirgi sahifalar ko'rinadi — ya'ni tugmalar sakramaydi.
 */
function Sahifalar(
  { joriy, jami, on }: { joriy: number; jami: number; on: (s: number) => void },
) {
  const KO_RINADI = 5;
  const boshi = Math.max(0, Math.min(joriy - 2, jami - KO_RINADI));
  const raqamlar = Array.from(
    { length: Math.min(KO_RINADI, jami) },
    (_, i) => boshi + i,
  );

  const oq = (yon: -1 | 1) => {
    const s = joriy + yon;
    if (s < 0 || s >= jami) return;
    tebrat("tanlov");
    on(s);
  };

  return (
    <div className="mt-4 flex items-center justify-center gap-1.5">
      <button type="button" onClick={() => oq(-1)} disabled={joriy === 0}
        aria-label={t("ortga")}
        className="clay-press grid size-9 shrink-0 place-items-center rounded-full bg-karta
                   text-ink-soft shadow-clay-sm disabled:opacity-40">
        <Icon name="chevron" size={16} className="rotate-180" />
      </button>

      {raqamlar.map((s) => (
        <button key={s} type="button" onClick={() => { tebrat("tanlov"); on(s); }}
          className={`clay-press grid size-9 shrink-0 place-items-center rounded-full
                      text-[13px] ${
            s === joriy
              ? "bg-brand-purple font-display text-white shadow-clay-sm"
              : "shadow-ichki bg-sahna text-ink-soft"}`}>
          {s + 1}
        </button>
      ))}

      <button type="button" onClick={() => oq(1)} disabled={joriy + 1 >= jami}
        aria-label={t("masalaYana")}
        className="clay-press grid size-9 shrink-0 place-items-center rounded-full bg-karta
                   text-ink-soft shadow-clay-sm disabled:opacity-40">
        <Icon name="chevron" size={16} />
      </button>
    </div>
  );
}

/**
 * Bo'sh ro'yxat.
 *
 * `katta` — bo'lim butunlay bo'sh (filtr tegilmagan). Faqat
 * o'shanda yozish tugmasi qaytadan katta bo'lib chiqadi: bo'sh
 * ekranda undan boshqa qiladigan ish yo'q. Filtr natijasi bo'sh
 * chiqqanida esa odamga "boshqa filtrni ko'ring" degan bir qator
 * yetadi.
 */
function Bosh({ katta, onYangi }: { katta: boolean; onYangi: () => void }) {
  if (!katta) {
    return (
      <p className="mx-auto mt-10 max-w-xs text-center text-[13px] leading-snug text-ink-dim">
        {t("masalaBoshFiltr")}
      </p>
    );
  }
  return (
    <div className="mt-10 flex flex-col items-center px-6 text-center">
      <span className="grid size-14 place-items-center rounded-3xl bg-brand-purple/12
                       text-brand-purple">
        <Icon name="pencil" size={24} />
      </span>
      <p className="mt-3 font-display text-[15px]">{t("masalaBoshSarlavha")}</p>
      <p className="mt-1 max-w-xs text-[12.5px] leading-snug text-ink-dim">
        {t("masalaYozIzoh")}
      </p>
      <button type="button" onClick={onYangi}
        className="tugma-3d az-yaltir mt-4 flex items-center gap-2 rounded-clay
                   bg-brand-purple px-5 py-3 text-white shadow-clay">
        <Icon name="plus" size={18} />
        <span className="font-display text-[14px] leading-none">{t("masalaYoz")}</span>
      </button>
    </div>
  );
}

/**
 * Filtr tanlagichi — yorliq va joriy qiymat.
 *
 * Yorliq ("Saralash", "Sinf") SHART. Qiymatning o'zi qaysi
 * filtrniki ekanini aytmaydi: uchta tanlagich yonma-yon turganda
 * "Hammasi" ham sinfniki, ham holatniki bo'lishi mumkin.
 *
 * Uchalasi bir xil kenglikda (`flex-1`) va ichidagi uzun nom
 * qisqartiriladi: "Ko'p yechilgan" va "Barchasi" yonma-yon
 * turganda birinchisi ikkinchisini siqib qo'ymasin.
 */
function Tanlagich(
  { yorliq, qiymat, on }: { yorliq: string; qiymat: ReactNode; on: () => void },
) {
  return (
    <button type="button" onClick={on}
      className="clay-press shadow-ichki flex min-w-0 flex-1 items-center gap-1.5
                 rounded-2xl bg-sahna px-2.5 py-1.5 text-left">
      <span className="min-w-0 flex-1">
        <span className="block text-[9.5px] tracking-wider text-ink-dim uppercase">
          {yorliq}
        </span>
        <span className="flex min-w-0 items-center gap-1 truncate font-display text-[12.5px]
                         leading-tight text-ink">
          {qiymat}
        </span>
      </span>
      <Icon name="chevron" size={12} className="shrink-0 rotate-90 text-ink-dim" />
    </button>
  );
}

/**
 * Tanlov varag'i — filtr ro'yxati ochiladigan oyna.
 *
 * Ro'yxat ekranda emas, VARAQDA: sinflar o'n oltita va ular hech
 * qanday tasmaga sig'maydi. Varaqda esa ular o'ralib joylashadi va
 * hammasi bir vaqtda ko'rinadi — ya'ni "8-sinf" ni qidirib surish
 * kerak bo'lmaydi.
 *
 * Fonga bosilsa yopiladi. Bu yerda tanga sarflanmaydi, ya'ni
 * e'tiborsiz bosishning narxi yo'q (`components/TangaSorov.tsx`
 * dagi holat boshqacha va u yerda fon yopmaydi).
 */
function TanlovVaraq(
  { sarlavha, onYop, children }:
  { sarlavha: string; onYop: () => void; children: ReactNode },
) {
  return (
    <div onClick={onYop} role="dialog" aria-modal="true" aria-label={sarlavha}
      className="az-kanal-fon fixed inset-0 z-[80] grid place-items-end bg-black/45
                 backdrop-blur-[2px] sm:place-items-center sm:p-4">
      <div onClick={(e) => e.stopPropagation()}
        className="az-kanal w-full rounded-t-clay bg-karta p-4 shadow-clay
                   sm:max-w-[420px] sm:rounded-clay">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-[15px] leading-tight">{sarlavha}</h2>
          <button type="button" onClick={onYop} aria-label={t("yopish")}
            className="clay-press ml-auto grid size-7 shrink-0 place-items-center rounded-full
                       bg-sahna text-ink-dim">
            <Icon name="close" size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">{children}</div>
      </div>
    </div>
  );
}

/** Varaq ichidagi bitta tanlov. */
function Tanlov(
  { faol, on, children }: { faol: boolean; on: () => void; children: ReactNode },
) {
  return (
    <button type="button" onClick={on}
      className={`clay-press flex items-center gap-1.5 rounded-full px-3.5 py-1.5
                  text-[12.5px] whitespace-nowrap ${
        faol
          ? "bg-brand-purple font-display text-white shadow-clay-sm"
          : "shadow-ichki bg-sahna text-ink-soft"}`}>
      {children}
    </button>
  );
}

