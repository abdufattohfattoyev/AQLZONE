/**
 * BUGUN — ilova ochilganda birinchi ko'rinadigan joy (`manba/Bugun.dc.html`).
 *
 * ─────────────── NEGA QAYTA QURILDI ───────────────
 *
 * Ilgari bosh sahifa bo'limlar ESHIKLARI edi: kichkintoylar, darslar,
 * testlar, masalalar, o'yinlar — beshta teng karta, ustida reyting,
 * hisob va profil chiplari. Pastki panel besh bo'limga o'tgach
 * (`components/Panel.tsx`) eshiklar panelning takroriga aylandi.
 *
 * Endi bu ekran bitta savolga javob beradi: "BUGUN nima qilay?"
 * Tartib o'sha savolga bo'ysunadi (Bugun kanvasi, 2026-09):
 *
 *   1. Sarlavha      sana va salom; o'ngda zanjir (olov + son) va qidiruv
 *   2. Asosiy amal   BIRINCHI turadi: qaysi dars, bobdagi yo'l va
 *                    ekrandagi YAGONA katta tugma
 *   3. Bugungi reja  uch band, har birining NIMA ekani yozilgan
 *                    ("5 ta savol · 3 daqiqa", "yashirin sonni toping")
 *   4. Bu hafta      7 kun va zanjir ODDIY GAP bilan: "Bugun bitta dars
 *                    qilsangiz — 4 kun bo'ladi"
 *   5. Aql maslahati eng pastda, jim ramkada
 *
 * Ilgari asosiy tugma uchinchi o'rinda, "0/3" halqasi va "5 soat"
 * yozuvi izohsiz turardi — yangi odam nima qilishni tushunmasdi.
 * Keng ekranda (md+) ikki ustun: chapda amal va reja, o'ngda hafta.
 *
 * Kichkintoylar, reyting, hisob va profil chiplari o'z joylariga ko'chdi
 * (Men bo'limi, O'qish tabi, kichkintoy rejimi).
 *
 * ─────────────── KATTALAR YO'LI SAQLANDI ───────────────
 *
 * "Davom etish" bo'lmaganda asosiy karta profilga qarab boshqa narsani
 * taklif qiladi (sinf darslari, DTM, testlar, oliy matematika) —
 * `asosiyAmal` ga qarang. Talaba va kattalarga formulalar va DTM
 * kartalari ham qoladi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import type { IconName } from "../lib/icons";
import { Logo } from "../components/Logo";
import { Hajmli } from "../lib/hajmli";
import type { HajmliNom } from "../lib/hajmli";
import { getHisob, joriyProfil, kunlikHolat, profilSoni } from "../lib/api";
import type { Hisob } from "../lib/api";
import { COURSES } from "../lib/curriculum";
import type { Course } from "../lib/curriculum";
import { oxirgiKurs } from "../lib/oxirgi";
import { useKompyuter } from "../lib/maket";
import { tebrat, tgIsm } from "../lib/qobiq";
import {
  joriyKurs, pedagogmi, profilKursi, profilKurslari, sinfOfProfil, useProfil, yolOf,
} from "../lib/profil";
import type { Profil } from "../lib/profil";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { keyingiDars, lessonId } from "../lib/types";
import type { Progress } from "../lib/types";
import { useProgress } from "../lib/progress";
import { SINOV_SAVOL, qolganSoat, sinovBajarilgan } from "../lib/kunlikSinov";
import { bugungiSoni } from "../lib/takrorlash";
import { kunKaliti, qaytish } from "../lib/zanjir";
import { Qaytish, ZanjirTiklash } from "../components/Qaytish";
import {
  HAFTA_MAQSAD, HAFTA_TANGA, darsBugunmi, faolKunlar, haftaYoli, joriyZanjir, rekordniYangila,
  salomVaqti, sandiqOchilganmi, sandiqniOch, yilKuni,
} from "../lib/bugun";
import { darajaKerakmi } from "../lib/daraja";
import { tovush } from "../lib/ovoz";
import { kunlikSonBugun } from "./KunlikSon";
import { FORMULALAR } from "../lib/formulalar";
import { VARIANTLAR as DTM_VARIANT } from "../lib/imtihon";
import { VARIANTLAR as SERT_VARIANT } from "../lib/sertifikat";
import {
  yolFormulalarUmumiy, yolImtihon, yolKurslar, yolMasalalar, yolMantiq, yolOyinlar, yolQabul, yolSertifikat,
} from "../lib/yollar";
import { QABUL_VARIANT } from "../lib/qabul";
import { mantiqMavzular } from "../lib/mantiq";

interface Props {
  progressOf: (c: Course) => Progress;
  onDarslar: () => void;
  onMasalalar: () => void;
  onTestlar: () => void;
  /** Boshlangan darsga qaytish. */
  onDavom: (c: Course, ui: number, li: number) => void;
  onSinov: (c: Course) => void;
  onKunlikSon: () => void;
  onQidiruv: () => void;
  /** Kattalar yo'lidagi ikkita qo'shimcha yo'l. */
  onFormulalar: () => void;
  onImtihon: () => void;
  /** Profildagi sinfning o'z kursi. */
  onKurs: (c: Course) => void;
  /** Aql bilan tanishuv — daraja aniqlash (`screens/Daraja.tsx`). */
  onDaraja: (c: Course) => void;
  /** Bo'limlar to'ri va tez o'tish tugmalari uchun. */
  onYol: (yol: string) => void;
}

/** Maslahatlar soni — `matn.ts` dagi `maslahat0…` kalitlari. */
const MASLAHAT_SONI = 10;

/**
 * Qayerdan davom etish kerak.
 *
 * Oxirgi ochilgan kurs olinadi; u yo'q bo'lsa — YULDUZI bor
 * kurslardan birinchisi. Ikkinchi shart kerak: qurilma almashgan
 * odamda "oxirgi kurs" mahalliy xotirada yo'q, progressi esa
 * serverdan qaytib kelgan bo'ladi.
 *
 * Oxirgi kursda davom etadigan joy bo'lmasa (hali boshlanmagan yoki
 * tugagan) keyingi nomzodga o'tiladi. Aks holda bir qurilmada faqat
 * ko'rib chiqilgan bo'sh kurs boshqa qurilmadagi "Keyingi dars"ni
 * yashirib qo'yardi — bir hisob, ikki xil bosh sahifa.
 *
 * Oliy yo'lda faqat talabalar kurslari qaraladi (`joriyKurs` dagi
 * qoida bilan bir xil): talaba qiziqib ochgan maktabgacha kurs uning
 * "Keyingi dars"iga aylanmasin.
 *
 * Hech narsa boshlanmagan bo'lsa `null` — yangi odamga "davom
 * eting" deyish ma'nosiz.
 */
function davomJoyi(progressOf: (c: Course) => Progress, prof: Profil | null) {
  const asos = yolOf(prof) === "oliy" ? profilKurslari(prof) : COURSES;
  const oxirgi = asos.find((c) => c.slug === oxirgiKurs());
  const nomzodlar = oxirgi ? [oxirgi, ...asos.filter((x) => x !== oxirgi)] : asos;
  for (const c of nomzodlar) {
    const p = progressOf(c);
    // Daraja aniqlangan kurs ham "boshlangan": yulduz hali yo'q, lekin
    // bola qaysi bobdan boshlashini allaqachon biladi.
    if (!p.stars && p.boshBob === undefined) continue;
    const keyingi = keyingiDars(c.units, p);
    if (keyingi) return { c, p, ...keyingi };
  }
  return null;
}

/** Joriy bolaning profili — server bilan bir xil qoidaga bo'ysunadi. */
function joriyBola(h: Hisob | null) {
  const ro = h?.profillar ?? [];
  const id = joriyProfil();
  return ro.find((p) => String(p.id) === id) ?? ro[0] ?? null;
}

export function Bosh({
  progressOf, onDarslar, onMasalalar, onTestlar, onDavom, onSinov, onKunlikSon,
  onQidiruv, onImtihon, onKurs, onDaraja, onYol,
}: Props) {
  const [hisob, setHisob] = useState<Hisob | null>(null);
  // Kunlik son SERVERDA ham yuritiladi (boshqa qurilmada yechilgan
  // bo'lishi mumkin). Aloqa bo'lmasa — qurilmadagi belgi.
  const [sonServer, setSonServer] = useState<boolean | null>(null);

  useEffect(() => {
    let bekor = false;
    getHisob().then((h) => { if (!bekor) setHisob(h); });
    kunlikHolat().then((h) => { if (!bekor && h) setSonServer(h.bajarildi); }).catch(() => {});
    return () => { bekor = true; };
  }, []);

  const { kunlik, jamiTanga, jamiYulduz, tiklash, zanjirniTikla, oyinTugadi } = useProgress();
  const prof = useProfil();
  const kompyuter = useKompyuter();
  const bugun = kunKaliti();
  const davom = davomJoyi(progressOf, prof);
  const kurs = davom?.c ?? joriyKurs(prof, oxirgiKurs());

  // ---- sarlavha ----
  const hozir = new Date();
  const kunlar = t("bugunHaftaKunlari").split(",");
  const oylar = t("bugunOylar").split(",");
  const sana = t("bugunSana", { kun: kunlar[hozir.getDay()] ?? "", n: hozir.getDate(), oy: oylar[hozir.getMonth()] ?? "" });
  // Ko'p bolali hisobda — tanlangan bolaning ismi; aks holda hisob egasiniki
  // (bitta bolada profil nomi ko'pincha standart "Men" bo'ladi).
  const bola = profilSoni() > 1 ? joriyBola(hisob)?.ism : "";
  const ism = (bola || hisob?.ism || tgIsm()).split(" ")[0] ?? "";
  const salom = t(`bugun_${salomVaqti(hozir.getHours())}` as Kalit) + (ism ? `, ${ism}` : "");

  // ---- uch vazifa ----
  // Sinov faqat o'tilgan dars yoki xatolar daftari bo'lganda yig'iladi
  // (`lib/kunlikSinov.ts` → sinovDarsi). Yangi odamda qator bosilmaydi.
  const sinovMumkin = progressOf(kurs).stars > 0 || bugungiSoni(kurs.slug) > 0;
  const vazifalar: Vazifa[] = [
    {
      nom: t("bugunBittaDars"), ik: "map", bel: "kitob", qisqa: t("bugunDaqiqa", { n: 5 }), amal: t("bugunAmalBoshlash"),
      izoh: t("bugunDarsIzoh"), bajarildi: darsBugunmi(bugun), tahlil: "Bugun: bitta dars",
      on: davom ? () => onDavom(davom.c, davom.ui, davom.li) : onDarslar,
    },
    {
      nom: t("bugunSinov"), ik: "clock", bel: "nishon", amal: t("bugunAmalYechish"),
      qisqa: sinovMumkin ? t("bugunSavolSoni", { n: SINOV_SAVOL }) : t("bugunDarsdanKeyin"),
      bajarildi: sinovBajarilgan(kurs.slug), tahlil: "Bugun: sinov",
      izoh: sinovMumkin
        ? t("bugunSinovIzoh", { n: SINOV_SAVOL, d: Math.ceil(SINOV_SAVOL / 2) })
        : t("bugunSinovYopiq"),
      on: sinovMumkin ? () => onSinov(kurs) : undefined,
    },
    {
      nom: t("bugunKunlikSonQisqa"), ik: "puzzle", bel: "goya", amal: t("bugunAmalOynash"),
      qisqa: t("bugunQoldi", { soat: t("bugunSoat", { n: qolganSoat() }) }),
      bajarildi: sonServer ?? kunlikSonBugun(), tahlil: "Bugun: kunlik son",
      izoh: t("bugunSonIzoh", { soat: t("bugunSoat", { n: qolganSoat() }) }), on: onKunlikSon,
    },
  ];

  // ---- zanjir ----
  const zanjir = joriyZanjir(kunlik, bugun);
  const rekord = rekordniYangila(zanjir);
  const qisqa = t("bugunQisqaKunlar").split(",");

  // Bugungi qadam: reja bandlaridan birinchi bajarilmagani (`asosiyAmal`).
  const qadam: Qadam = {
    dars: vazifalar[0]!.bajarildi,
    sinov: vazifalar[1]!.bajarildi ? undefined : vazifalar[1]!.on,
    son: vazifalar[2]!.bajarildi ? undefined : vazifalar[2]!.on,
  };
  const amal = asosiyAmal({
    davom, prof, qadam, progressOf, onDarslar, onMasalalar, onDavom, onKurs, onDaraja, onImtihon, onTestlar,
  });

  // ---- haftalik yo'l ----
  const yol = haftaYoli(kunlik, faolKunlar(), bugun);
  const [sandiqOchiq, setSandiqOchiq] = useState(() => sandiqOchilganmi(yol.dushanba));
  const sandiqTayyor = yol.soni >= HAFTA_MAQSAD;
  const sandiqniOchish = () => {
    if (!sandiqniOch(yol.dushanba)) { setSandiqOchiq(true); return; }
    // Tanga o'yin mukofoti yo'li bilan tushadi: zanjirga ham, yulduzga
    // ham tegmaydi (`progress.tsx` → oyinTugadi, savollar = 0).
    oyinTugadi(HAFTA_TANGA, 0);
    tovush("togri");
    tebrat("yutuq");
    setSandiqOchiq(true);
  };

  /* ─── Sarlavha (testmakon uslubida): kichik salom, katta sarlavha, o'ngda
     kompyuterda tez o'tish tugmalari. Zanjir — olovli kichik belgi. ─── */
  const sarlavha = (
    <header className="flex min-h-[52px] items-center gap-2">
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-[13.5px] font-bold text-ink-dim">{salom} 👋</span>
        <h1 className="font-display text-[23px] leading-[1.15] min-[360px]:text-[27px] md:text-[30px]">
          {t("bugunSarlavha")}
        </h1>
        <span className="sr-only">{sana}</span>
      </div>
      <div className="hidden items-center gap-2 kom:flex">
        <TezTugma ik="trophy" nom={t("yonSertifikat")} on={() => onYol(yolSertifikat())} tahlil="Bugun: sertifikat" />
        <TezTugma ik="clock" nom={t("yonDtm")} on={() => onYol(yolImtihon())} tahlil="Bugun: DTM" />
      </div>
      <span aria-label={t("bugunZanjir", { n: zanjir })} title={t("bugunZanjir", { n: zanjir })}
        className={`flex min-h-11 shrink-0 items-center gap-1 rounded-[14px] bg-karta pr-3 pl-2.5 font-display
                    text-[17px] font-bold shadow-clay-sm ${zanjir ? "text-brand-gold-d" : "text-ink-dim"}`}>
        <Olov yoniq={zanjir > 0} />
        {zanjir}
      </span>
      <button type="button" onClick={onQidiruv} aria-label={t("qidiruvNom")} data-tahlil="Bugun: qidiruv"
        className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta text-ink shadow-clay-sm">
        <Icon name="search" size={20} />
      </button>
    </header>
  );

  /* ─── Bugungi reja: halqa (necha foiz bajarildi), uch vazifa va uch son. ─── */
  const bajarilgan = vazifalar.filter((v) => v.bajarildi).length;
  const foiz = Math.round((bajarilgan / vazifalar.length) * 100);
  const reja = (
    <section aria-label={t("bugunReja")} className="flex flex-col gap-4 rounded-[24px] bg-karta p-4 shadow-clay-sm
                                                     min-[360px]:p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[19px]">{t("bugunReja")}</h2>
          <p className="text-[13.5px] text-ink-dim">{t("bugunRejaHolat", { n: bajarilgan, jami: vazifalar.length })}</p>
        </div>
        <Halqa foiz={foiz} />
      </div>
      <ul className="flex flex-col gap-2">
        {vazifalar.map((v) => (
          <li key={v.tahlil}>
            <button type="button" onClick={v.on} disabled={!v.on} data-tahlil={v.tahlil}
              aria-label={`${v.nom}. ${v.izoh ?? ""}${v.bajarildi ? ` · ${t("bugunBajarildi")}` : ""}`}
              className={`clay-press flex min-h-[60px] w-full items-center gap-3 rounded-[16px] px-3 text-left
                          disabled:cursor-default ${v.bajarildi ? "bg-brand-green/10" : "bg-sahna"}
                          ring-[1.5px] ring-inset ${v.bajarildi ? "ring-brand-green/35" : "ring-track"}`}>
              <Hajmli nom={v.bel} olcham={36} jonli={!v.bajarildi && Boolean(v.on)} />
              <span className="flex min-w-0 flex-1 flex-col leading-snug">
                <span className={`text-[15px] font-bold ${v.bajarildi ? "text-brand-green-d" : ""}`}>{v.nom}</span>
                <span className="truncate text-[12.5px] text-ink-dim">{v.qisqa}</span>
              </span>
              {v.bajarildi ? (
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-green text-white">
                  <Icon name="check" size={14} />
                </span>
              ) : v.on ? (
                <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
              ) : (
                <Icon name="lock" size={15} className="shrink-0 text-ink-dim" />
              )}
            </button>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-3 divide-x divide-track border-t border-track pt-3 text-center">
        <Son n={String(jamiYulduz)} nom={t("menYulduz")} />
        <Son n={String(zanjir)} nom={t("menZanjir")} />
        <Son n={String(rekord)} nom={t("bugunRekordQisqa")} />
      </div>
    </section>
  );

  /* ─── Bo'limni tanlang — testmakon'dagi "Fan tanlang" kabi: 3D belgi, nom
     va nechta narsa borligi. Telefonda 2, kengroqda 3 ustun. ─── */
  // Prezident maktabiga tayyorlov va Mantiq — 2–4-sinf bolasida (yoki
  // uning ota-onasida) to'r BOSHIDA turadi: bu yoshda eng aniq maqsad shu.
  // Ilgari Prezident maktabi keng karta edi; Mantiq qo'shilgach kartalar
  // sakkizta bo'ldi va hammasi bir o'lchamda — to'r teng ikki ustunda yopiladi.
  const ps = sinfOfProfil(prof);
  const qabulKarta = { bel: "toj" as HajmliNom, nom: t("bolimQabul"), izoh: t("bolimQabulIzoh", { n: QABUL_VARIANT }), yol: yolQabul() };
  const mantiqKarta = { bel: "miya" as HajmliNom, nom: t("bolimMantiq"), izoh: t("bolimMantiqIzoh", { n: mantiqMavzular().length }), yol: yolMantiq() };
  const bolimlar: { bel: HajmliNom; nom: string; izoh: string; yol: string }[] = [
    { bel: "kitob", nom: t("bolimDarslar"), izoh: t("bolimDarslarIzoh", { n: COURSES.reduce((a, c) => a + c.units.reduce((b, u) => b + u.lessons.length, 0), 0) }), yol: yolKurslar() },
    { bel: "nishon", nom: t("yonDtm"), izoh: t("bolimVariant", { n: DTM_VARIANT }), yol: yolImtihon() },
    { bel: "medal", nom: t("yonSertifikat"), izoh: t("bolimVariant", { n: SERT_VARIANT }), yol: yolSertifikat() },
    { bel: "goya", nom: t("masalalar"), izoh: t("bolimMasalaIzoh"), yol: yolMasalalar() },
    { bel: "kubok", nom: t("bolimOyinlar"), izoh: t("bolimOyinIzoh"), yol: yolOyinlar() },
    { bel: "diagramma", nom: t("kattalarFormula"), izoh: t("bolimFormulaIzoh", { n: FORMULALAR.reduce((a, b) => a + b.lar.length, 0) }), yol: yolFormulalarUmumiy() },
  ];
  // To'r endi sakkizta (juft): telefonda 2 ustun, kengda — oxirgi qator ikkita.
  // 2–4-sinfda Mantiq va Prezident maktabi BOSHDA turadi: shu yoshning maqsadi.
  if (ps !== null && ps >= 2 && ps <= 4) bolimlar.unshift(qabulKarta, mantiqKarta);
  else bolimlar.push(mantiqKarta, qabulKarta);
  const bolimTori = (
    <section aria-label={t("bolimSarlavha")} className="flex flex-col gap-3">
      <div>
        <h2 className="font-display text-[20px]">{t("bolimSarlavha")}</h2>
        <p className="text-[13.5px] text-ink-dim">{t("bolimIzoh")}</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 min-[360px]:gap-3 md:grid-cols-3 md:gap-4">
        {bolimlar.map((b) => (
          <button key={b.yol} type="button" onClick={() => onYol(b.yol)} data-tahlil={`Bugun: bo'lim ${b.nom}`}
            /* Telefonda belgi tepada, yozuv ostida — tor ustunda nom bo'linmasin;
               kengda yonma-yon (namunadagi "fan" kartasidek). */
            className="clay-press group flex min-h-[104px] flex-col items-start gap-2 rounded-[20px] bg-karta p-3.5
                       text-left shadow-clay-sm transition-transform min-[360px]:p-4 md:min-h-[110px] md:flex-row
                       md:items-center md:gap-3 kom:hover:-translate-y-0.5">
            <span className="shrink-0 transition-transform kom:group-hover:scale-110">
              <Hajmli nom={b.bel} olcham={40} />
            </span>
            <span className="flex min-w-0 flex-col leading-snug">
              <span className="font-display text-[15.5px] font-bold min-[360px]:text-[17px]">{b.nom}</span>
              <span className="text-[12.5px] text-ink-dim min-[360px]:text-[13.5px]">{b.izoh}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );

  /* ─── Haftalik yo'l: yetti kun bitta yo'l bo'lib, oxirida sandiq. Zanjirdan
     farqi — bitta qoldirilgan kun yo'lni o'chirmaydi (`lib/bugun.ts`).
     Ilgari bu yerda "Bu hafta" — zanjirning o'zi edi va uzilgan kunda
     butun hafta bo'm-bo'sh ko'rinardi. ─── */
  const haftaBlok = (
    <section aria-label={t("haftaYol")}
      className="flex flex-col gap-3 rounded-[22px] bg-karta p-4 shadow-clay-sm">
      <div className="flex items-baseline gap-2">
        <h2 className="min-w-0 flex-1 font-display text-[18px]">{t("haftaYol")}</h2>
        <span className={`shrink-0 font-display text-[15px] font-bold ${yol.soni ? "text-brand-gold-d" : "text-ink-dim"}`}>
          {t("haftaYolSoni", { n: Math.min(yol.soni, HAFTA_MAQSAD), m: HAFTA_MAQSAD })}
        </span>
      </div>
      <div className="relative grid grid-cols-[repeat(7,minmax(0,1fr))_auto] items-start gap-1">
        {/* Kunlarni bog'lovchi yo'l — doiralar markazidan o'tib, sandiqqa yetadi. */}
        <span aria-hidden className="absolute top-[13px] right-5 left-[6%] h-1 rounded-full bg-track
                                     min-[360px]:top-[15px]" />
        {yol.kunlar.map((k) => (
          <div key={k.sana} className="relative flex flex-col items-center gap-1.5">
            <span aria-hidden
              /* O'ynagan kun — OLTIN: sarlavhadagi olov bilan bir xil (mukofot rangi). */
              className={`grid size-[30px] place-items-center rounded-full text-ink min-[360px]:size-[34px] ${
                k.holat === "oynagan" ? "bg-brand-gold shadow-[0_3px_0_var(--color-brand-gold-d)]"
                  : k.holat === "kelajak" ? "bg-karta ring-[1.5px] ring-track ring-inset" : "bg-track"} ${
                k.bugun && k.holat !== "oynagan" ? "ring-2 ring-brand-blue ring-inset" : ""}`}>
              {k.holat === "oynagan" && <Icon name="check" size={15} />}
            </span>
            <span className={`text-[12px] ${k.bugun ? "font-bold text-brand-blue-t" : "font-semibold text-ink-dim"}`}>
              {qisqa[k.indeks]}
            </span>
          </div>
        ))}
        <div className="relative flex flex-col items-center gap-1.5 pl-1">
          <span className={`grid size-[30px] place-items-center rounded-full min-[360px]:size-[34px] ${
            sandiqTayyor && !sandiqOchiq ? "bg-brand-gold/20 ring-2 ring-brand-gold ring-inset" : "bg-karta ring-[1.5px] ring-track ring-inset"} ${
            sandiqTayyor ? "" : "opacity-55 grayscale"}`}>
            <Hajmli nom="tanga" olcham={22} jonli={sandiqTayyor && !sandiqOchiq} />
          </span>
          <span className="text-[12px] font-semibold text-ink-dim">{t("haftaYolSandiq")}</span>
        </div>
      </div>
      {sandiqTayyor && !sandiqOchiq ? (
        <button type="button" onClick={sandiqniOchish} data-tahlil="Bugun: haftalik sandiq"
          /* Oltin tugmada oq yozuv — ilovadagi boshqa oltin tugmalar kabi
             (`KunlikSon`, `TangaOqim`); soya uni ochiq sariq ustida o'qitadi. */
          className="tugma-3d flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-brand-gold font-display
                     text-[16px] font-bold text-white shadow-[0_3px_0_var(--color-brand-gold-d)]
                     [text-shadow:0_1px_1px_var(--color-brand-gold-d)]">
          <Hajmli nom="tanga" olcham={22} />
          {t("haftaYolOch", { t: HAFTA_TANGA })}
        </button>
      ) : (
        <p className="text-[14px] leading-snug text-ink-soft">
          {sandiqOchiq ? t("haftaYolOchildi")
            : t("haftaYolQoldi", { n: HAFTA_MAQSAD - yol.soni, t: HAFTA_TANGA })}
        </p>
      )}
    </section>
  );

  // Uzilgan zanjirni tanga bilan tiklash yoki "qaytdingiz" — faqat kerakli kuni.
  const ogoh = tiklash ? (
    <div className="[&>*]:mt-0"><ZanjirTiklash taklif={tiklash} jamiTanga={jamiTanga} onTikla={zanjirniTikla} /></div>
  ) : qaytish(kunlik) > 0 && (
    <div className="[&>*]:mt-0"><Qaytish kun={qaytish(kunlik)} /></div>
  );

  const maslahat = (
    <aside className="flex items-start gap-3 rounded-[22px] px-4 py-3.5 ring-[1.5px] ring-track ring-inset">
      <Logo size={30} jonli={false} className="mt-0.5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[12.5px] font-bold text-ink-dim">{t("bugunMaslahat")}</span>
        <span className="text-[14.5px] leading-[1.45]">
          {t(`maslahat${yilKuni(bugun) % MASLAHAT_SONI}` as Kalit)}
        </span>
      </div>
    </aside>
  );

  /* Tartib hamma o'lchamda bir xil: sarlavha → hero + reja → bo'limlar →
     hafta + maslahat. Telefonda ustma-ust, md+ da ikki ustun. */
  return (
    <div className={`mx-auto flex w-full max-w-[430px] flex-col gap-4 px-3.5 pt-3.5 pb-4 min-[360px]:gap-5
                     min-[360px]:px-[18px] min-[360px]:pt-5 sm:max-w-[560px] md:max-w-[1120px] md:gap-6 md:px-8
                     md:pt-7 ${kompyuter ? "pb-14" : ""}`}>
      {sarlavha}
      <div className="grid items-stretch gap-4 min-[360px]:gap-5 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-6">
        <AsosiyKarta amal={amal} zanjir={zanjir} ikkinchi={{ nom: t("bolimDarslar"), on: onDarslar }} />
        {reja}
      </div>
      {ogoh}
      {bolimTori}
      <div className="grid items-start gap-4 min-[360px]:gap-5 md:grid-cols-2 md:gap-6">
        {haftaBlok}
        {maslahat}
      </div>
    </div>
  );
}

/** Halqa: bugungi reja necha foiz bajarilgani. */
function Halqa({ foiz }: { foiz: number }) {
  const r = 30, uz = 2 * Math.PI * r;
  return (
    <span className="relative grid size-[76px] shrink-0 place-items-center" role="img" aria-label={`${foiz}%`}>
      <svg viewBox="0 0 72 72" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" className="stroke-track" />
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
          className={foiz === 100 ? "stroke-brand-green" : "stroke-brand-blue"}
          style={{ strokeDasharray: uz, strokeDashoffset: uz * (1 - foiz / 100), transition: "stroke-dashoffset .6s" }} />
      </svg>
      <span className="font-display text-[18px] font-bold">{foiz}%</span>
    </span>
  );
}

function Son({ n, nom }: { n: string; nom: string }) {
  return (
    <span className="flex flex-col px-1">
      <span className="font-display text-[19px] leading-tight font-bold">{n}</span>
      <span className="truncate text-[12px] text-ink-dim">{nom}</span>
    </span>
  );
}

/** Sarlavhadagi tez o'tish tugmasi (faqat kompyuterda). */
function TezTugma({ ik, nom, on, tahlil }: { ik: IconName; nom: string; on: () => void; tahlil: string }) {
  return (
    <button type="button" onClick={on} data-tahlil={tahlil}
      className="clay-press flex min-h-11 items-center gap-2 rounded-[14px] bg-karta px-4 text-[14px] font-bold
                 text-ink-soft shadow-clay-sm hover:text-ink">
      <Icon name={ik} size={17} className="text-brand-blue-t" />
      {nom}
    </button>
  );
}

/* --------------------------------------------------------------- bo'laklar */

interface Vazifa {
  nom: string;
  ik: IconName;
  /** Plitkadagi 3D belgi. */
  bel: HajmliNom;
  /** Plitka ostidagi qisqa yozuv: "5 daq", "6 ta savol", "5 soat qoldi". */
  qisqa: string;
  /** O'ngdagi yozuv: "Boshlash", "Yechish", "O'ynash". */
  amal: string;
  bajarildi: boolean;
  /** Band nima ekani: "5 ta savol · 3 daqiqa". */
  izoh?: string;
  tahlil: string;
  /** Berilmasa — hozir bosib bo'lmaydi (masalan sinov darsdan oldin). */
  on?: () => void;
}

/** Zanjir yonidagi olov — oltin (mukofot rangi), emoji emas: har qurilmada bir xil. */
function Olov({ yoniq, kichik }: { yoniq: boolean; kichik?: boolean }) {
  return (
    <svg width={kichik ? 15 : 20} height={kichik ? 15 : 20} viewBox="0 0 24 24" aria-hidden strokeWidth="1.8" strokeLinejoin="round"
      className={`shrink-0 ${yoniq ? "fill-brand-gold stroke-brand-gold-d" : "fill-none stroke-ink-dim"}`}>
      <path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-3 2-4.5 2-7 1.5 1 2.5 2.5 3-4z" />
    </svg>
  );
}

interface Amal {
  tahlil: string;
  on: () => void;
  yorliq: string;
  /** O'ng tepadagi "2-bob · 3 / 6". */
  joy?: string;
  nom: string;
  izoh?: string;
  /** Bobning kichik yo'li: har dars — o'tilgan / joriy / qolgan. */
  yol?: ("otilgan" | "joriy" | "qolgan")[];
  tugma: string;
}

/** Bugungi reja bandlarining holati — "Bugungi qadam" shundan tanlanadi. */
interface Qadam {
  /** Bugun bitta dars o'tildimi. */
  dars: boolean;
  /** Sinov bajarilmagan va ochiq bo'lsa — uni boshlash. */
  sinov?: () => void;
  /** Kunlik son bajarilmagan bo'lsa — uni ochish. */
  son?: () => void;
}

/**
 * ASOSIY AMAL — ekrandagi yagona katta tugma, "Bugungi qadam".
 *
 *   qaytgan odam   → reja bandlaridan BIRINCHI bajarilmagani: dars,
 *                    keyin sinov, keyin kunlik son; hammasi bajarilsa —
 *                    "Yana bitta dars". Ilgari tugma doim keyingi darsni
 *                    ochardi va sinov bilan kunlik sonni bola pastdagi
 *                    ro'yxatdan o'zi topishi kerak edi. Endi u nima
 *                    qilishni o'ylamaydi — faqat bosadi
 *   sinfi ma'lum   → kursda hali hech narsa yo'q — Aql bilan tanishuv
 *                    (daraja aniqlash), aks holda o'sha sinf kursi
 *   abituriyent    → DTM variantlari
 *   o'qituvchi     → testlar (maktab)
 *   oliy yo'l      → oliy matematika kursi yoki masalalar
 *   profil yo'q    → sinf tanlash ("O'rganishni boshlash")
 */
function asosiyAmal({
  davom, prof, qadam, progressOf, onDarslar, onMasalalar, onDavom, onKurs, onDaraja, onImtihon, onTestlar,
}: {
  davom: ReturnType<typeof davomJoyi>;
  prof: Profil | null;
  qadam: Qadam;
  progressOf: (c: Course) => Progress;
  onDarslar: () => void;
  onMasalalar: () => void;
  onDavom: (c: Course, ui: number, li: number) => void;
  onKurs: (c: Course) => void;
  onDaraja: (c: Course) => void;
  onImtihon: () => void;
  onTestlar: () => void;
}): Amal {
  if (davom) {
    const U = davom.c.units[davom.ui]!;
    const dars: Amal = {
      tahlil: "Bugun: davom etish",
      on: () => onDavom(davom.c, davom.ui, davom.li),
      yorliq: t("bugunQadam"),
      joy: t("bugunBobJoy", { bob: davom.ui + 1, dars: davom.li + 1, jami: U.lessons.length }),
      nom: kursMatn(U.lessons[davom.li]!.n).split(" · ")[0] ?? "",
      yol: U.lessons.map((_, li) =>
        li === davom.li ? "joriy" : davom.p.done[lessonId(davom.ui, li)] ? "otilgan" : "qolgan"),
      tugma: t("davomEtish"),
    };
    if (!qadam.dars) return dars;
    if (qadam.sinov) {
      return {
        tahlil: "Bugun: qadam sinov", on: qadam.sinov, yorliq: t("bugunQadam"), nom: t("bugunSinov"),
        izoh: t("bugunSinovIzoh", { n: SINOV_SAVOL, d: Math.ceil(SINOV_SAVOL / 2) }), tugma: t("bugunAmalYechish"),
      };
    }
    if (qadam.son) {
      return {
        tahlil: "Bugun: qadam kunlik son", on: qadam.son, yorliq: t("bugunQadam"), nom: t("bugunKunlikSonQisqa"),
        izoh: t("bugunSonIzoh", { soat: t("bugunSoat", { n: qolganSoat() }) }), tugma: t("bugunAmalOynash"),
      };
    }
    return {
      ...dars, tahlil: "Bugun: yana bitta dars", yorliq: t("bugunQadamTayyor"),
      izoh: t("bugunQadamTayyorIzoh"), tugma: t("bugunYanaDars"),
    };
  }
  const boshla = (tahlil: string, on: () => void, nom: string, izoh: string): Amal => ({
    tahlil, on, nom, izoh, yorliq: t("bugunBirinchiQadam"), tugma: t("bugunBoshlash"),
  });
  const yol = yolOf(prof);
  const kurs = profilKursi(prof);
  if (pedagogmi(prof)) return boshla("Bugun: pedagog darslari", onDarslar, t("boshPedagog"), t("boshPedagogIzoh"));
  if (kurs) {
    const s = sinfOfProfil(prof);
    if (s === null) return boshla("Bugun: oliy matematika", () => onKurs(kurs), kursMatn(kurs.title), kursMatn(kurs.desc));
    if (darajaKerakmi(kurs, progressOf(kurs))) {
      return boshla("Bugun: tanishuv", () => onDaraja(kurs), t("bugunTanishuv"), t("bugunTanishuvIzoh"));
    }
    return boshla("Bugun: sinf darslari", () => onKurs(kurs),
      s === 0 ? t("boshMaktabgachaDarslari") : t("boshSinfDarslari", { n: s }), t("boshSinfDarslariIzoh"));
  }
  if (yol === "abiturient") return boshla("Bugun: abiturient DTM", onImtihon, t("boshAbiturient"), t("boshAbiturientIzoh"));
  if (prof?.kim === "ustoz" && yol === "maktab") return boshla("Bugun: ustoz testlar", onTestlar, t("boshUstoz"), t("boshUstozIzoh"));
  if (yol === "oliy") return boshla("Bugun: kattalar masalalar", onMasalalar, t("boshKattalarBoshla"), t("boshKattalarIzoh"));
  return boshla("Bugun: boshlash", onDarslar, t("boshBoshla"), t("boshBoshlaIzoh"));
}

/**
 * ASOSIY KARTA — oq karta, ichida yagona ko'k tugma.
 *
 * Ilgari butun karta ko'k edi va "bugungi reja" dan PASTDA turardi:
 * ekrandagi eng muhim narsa uchinchi bo'lib o'qilardi. Endi u birinchi,
 * qaysi dars ekani va bobdagi yo'l (chiziq + "12 tadan 4 tasi") aniq
 * yozilgan. Faqat oq tugma bosiladi: kartaning qolgan qismi o'qish
 * uchun — tasodifan tegib ketilgan barmoq darsni ochib yubormasin.
 */
function AsosiyKarta({ amal, zanjir, ikkinchi }: {
  amal: Amal; zanjir: number; ikkinchi: { nom: string; on: () => void };
}) {
  const otilgan = amal.yol?.filter((h) => h === "otilgan").length ?? 0;
  const jami = amal.yol?.length ?? 0;
  const belgi: HajmliNom = amal.yol ? "raketa" : "bitiruv";
  return (
    /* Testmakon uslubidagi hero: karta rangidagi yuza, burchakda ko'k nur,
       o'ngda katta suzuvchi 3D rasm. Ikki tugma — asosiy (ko'k) va
       ikkinchi darajali (xira). */
    <section className="relative flex min-h-[240px] flex-col justify-center gap-3.5 overflow-hidden rounded-[26px] bg-karta
                        p-5 shadow-clay md:p-7">
      <span aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full
                                   bg-brand-blue/20 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-24 left-10 size-56 rounded-full
                                   bg-brand-gold/10 blur-3xl" />
      {/* Rasm o'lchamga qarab BITTA: telefonda burchakda kichik, kengda katta. */}
      <span className="az-suzish pointer-events-none absolute top-4 right-4 md:hidden">
        <Hajmli nom={belgi} olcham={56} jonli />
      </span>
      <span className="az-suzish pointer-events-none absolute right-8 hidden md:block">
        <Hajmli nom={belgi} olcham={128} jonli />
      </span>
      <span className="relative flex flex-wrap items-center gap-2 pr-20 md:pr-40">
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold ${
          zanjir ? "bg-brand-gold/15 text-brand-gold-d" : "bg-track text-ink-soft"}`}>
          <Olov yoniq={zanjir > 0} kichik /> {t("bugunZanjir", { n: zanjir })}
        </span>
        {amal.joy && <span className="text-[13px] font-bold text-ink-dim">{amal.joy}</span>}
      </span>
      <span className="relative flex flex-col gap-1.5 pr-16 md:pr-40">
        <span className="text-[13px] font-bold text-brand-blue-t">{amal.yorliq}</span>
        <span className="font-display text-[24px] leading-[1.12] font-bold min-[360px]:text-[27px] md:text-[32px]">
          {amal.nom}
        </span>
        {amal.izoh && <span className="text-[14.5px] leading-snug text-ink-soft md:text-[15.5px]">{amal.izoh}</span>}
      </span>
      {jami > 0 && (
        <span className="relative flex max-w-md flex-col gap-1.5">
          <span className="block h-2 overflow-hidden rounded-full bg-track" aria-hidden>
            <span className="block h-full rounded-full bg-brand-blue"
              style={{ width: `${Math.max(4, Math.round((otilgan / jami) * 100))}%` }} />
          </span>
          <span className="text-[13px] text-ink-dim">{t("bugunBobYoli", { n: otilgan, jami })}</span>
        </span>
      )}
      <span className="relative mt-1 flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={amal.on} data-tahlil={amal.tahlil}
          className="tugma-3d flex min-h-[52px] items-center gap-2 rounded-[16px] bg-brand-blue px-6 font-display
                     text-[18px] font-bold text-white shadow-[0_4px_0_var(--color-brand-blue-d),0_12px_24px_-10px_var(--color-brand-blue)]">
          {amal.tugma}
          <Icon name="chevron" size={18} />
        </button>
        <button type="button" onClick={ikkinchi.on} data-tahlil="Bugun: barcha darslar"
          className="clay-press flex min-h-[52px] items-center justify-center rounded-[16px] bg-track px-5 text-[15px] font-bold
                     text-ink-soft hover:text-ink">
          {ikkinchi.nom}
        </button>
      </span>
    </section>
  );
}
