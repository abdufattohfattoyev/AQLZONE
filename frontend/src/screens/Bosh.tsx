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
 *   3. Bugungi reja  uch band ixcham ro'yxatda, o'ngda "1/3"
 *   4. Bu hafta      7 kun va haftalik sandiq
 *
 * 2026-10-08: "kirishda juda ko'p narsa" — ekrandan bo'limlar to'ri,
 * maslahat, ikkinchi "Darslar" tugmasi, foiz halqasi va yulduz/rekord
 * qatori olib tashlandi (pastdagi `return` izohiga qarang). Yangi odam
 * faqat katta kartani ko'radi.
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
  salomVaqti, sandiqOchilganmi, sandiqniOch,
} from "../lib/bugun";
import { darajaKerakmi } from "../lib/daraja";
import { tovush } from "../lib/ovoz";
import { kunlikSonBugun } from "./KunlikSon";
import { yolDuel, yolImtihon, yolOyinlar, yolSertifikat } from "../lib/yollar";
import { bolimlar as bolimRoyxati } from "../lib/moslash";

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
  /** Tez o'tish tugmalari va duelga taklif uchun. */
  onYol: (yol: string) => void;
}

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

  const { kunlik, jamiTanga, tiklash, zanjirniTikla, oyinTugadi } = useProgress();
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
  // Rekord endi "Men" bo'limida ko'rinadi, lekin u shu yerda yangilanadi.
  rekordniYangila(zanjir);
  const qisqa = t("bugunQisqaKunlar").split(",");

  // Bugungi qadam: reja bandlaridan birinchi bajarilmagani (`asosiyAmal`).
  const qadam: Qadam = {
    dars: vazifalar[0]!.bajarildi,
    sinov: vazifalar[1]!.bajarildi ? undefined : vazifalar[1]!.on,
    son: vazifalar[2]!.bajarildi ? undefined : vazifalar[2]!.on,
  };
  const amal = asosiyAmal({
    davom, prof, qadam, progressOf, onDarslar, onMasalalar, onDavom, onKurs, onDaraja, onImtihon, onTestlar,
    onDuel: () => onYol(yolDuel()),
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
        {/* Tez tugmalar ham anketaga bo'ysunadi: 3-sinf bolasiga DTM tugmasi kerak emas. */}
        {bolimRoyxati(prof).includes("sertifikat") && (
          <TezTugma ik="trophy" nom={t("yonSertifikat")} on={() => onYol(yolSertifikat())} tahlil="Bugun: sertifikat" />
        )}
        {bolimRoyxati(prof).includes("dtm") && (
          <TezTugma ik="clock" nom={t("yonDtm")} on={() => onYol(yolImtihon())} tahlil="Bugun: DTM" />
        )}
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

  /* ─── Bugungi reja: ixcham ro'yxat — uch band, o'ngda "1/3".
     Ilgari har band alohida chegarali karta, tepada foiz halqasi, ostida
     "yulduz · zanjir · rekord" qatori bor edi: ekranda o'nga yaqin
     bir-biriga o'xshash quti paydo bo'lib, odam qayerdan boshlashni
     bilmay qolardi. Endi bandlar oddiy qatorlar, sonlar — "Men" da. ─── */
  const bajarilgan = vazifalar.filter((v) => v.bajarildi).length;
  const reja = (
    <section aria-label={t("bugunReja")} className="flex flex-col gap-1 rounded-[24px] bg-karta px-4 pt-4 pb-2
                                                     shadow-clay-sm min-[360px]:px-5">
      <div className="flex items-baseline gap-3">
        <h2 className="min-w-0 flex-1 font-display text-[19px]">{t("bugunReja")}</h2>
        <span aria-label={t("bugunRejaHolat", { n: bajarilgan, jami: vazifalar.length })}
          className={`shrink-0 font-display text-[16px] font-bold ${
            bajarilgan === vazifalar.length ? "text-brand-green-d" : "text-ink-dim"}`}>
          {bajarilgan}/{vazifalar.length}
        </span>
      </div>
      <ul className="flex flex-col divide-y divide-track">
        {vazifalar.map((v) => (
          <li key={v.tahlil}>
            <button type="button" onClick={v.on} disabled={!v.on} data-tahlil={v.tahlil}
              aria-label={`${v.nom}. ${v.izoh ?? ""}${v.bajarildi ? ` · ${t("bugunBajarildi")}` : ""}`}
              className="clay-press flex min-h-[56px] w-full items-center gap-3 text-left disabled:cursor-default">
              {/* Bajarilgan band — yashil belgi, qolgani — xira 3D belgi: ko'z
                  avval qilinmaganiga tushadi. Belgi qimirlamaydi — harakat faqat
                  tepadagi katta tugmada. */}
              {v.bajarildi ? (
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-green text-white">
                  <Icon name="check" size={15} />
                </span>
              ) : (
                <span className={v.on ? "" : "opacity-50 grayscale"}><Hajmli nom={v.bel} olcham={28} /></span>
              )}
              <span className="flex min-w-0 flex-1 flex-col leading-snug">
                <span className={`text-[15px] font-bold ${v.bajarildi ? "text-ink-dim line-through decoration-2" : ""}`}>
                  {v.nom}
                </span>
                {!v.bajarildi && <span className="truncate text-[12.5px] text-ink-dim">{v.qisqa}</span>}
              </span>
              {!v.bajarildi && (v.on
                ? <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
                : <Icon name="lock" size={15} className="shrink-0 text-ink-dim" />)}
            </button>
          </li>
        ))}
      </ul>
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

  /* Tartib: sarlavha → BITTA katta tugmali karta → bugungi reja → hafta.
     Telefonda ustma-ust, md+ da karta va reja yonma-yon.

     Ilgari bu yerda yana "Bo'limni tanlang" to'ri (9 tagacha karta) va
     "Aql maslahati" bor edi. Bo'limlar pastki panelda (O'qish, O'yin,
     Masalalar) takrorlanardi, maslahat esa o'qilmasdi — ikkalasi ham
     "hozir nima qilay?" degan savolga javobni ko'mib qo'yardi.

     YANGI ODAM (hali hech narsa boshlamagan) faqat katta kartani ko'radi:
     reja va hafta unga hali ma'nosiz ("sinov — darsdan keyin", bo'm-bo'sh
     yo'l). Birinchi darsni o'tgach, ular o'z-o'zidan chiqadi. */
  const yangi = !davom;
  return (
    <div className={`mx-auto flex w-full max-w-[430px] flex-col gap-4 px-3.5 pt-3.5 pb-4 min-[360px]:gap-5
                     min-[360px]:px-[18px] min-[360px]:pt-5 sm:max-w-[560px] md:max-w-[1120px] md:gap-6 md:px-8
                     md:pt-7 ${kompyuter ? "pb-14" : ""}`}>
      {sarlavha}
      <div className={`grid items-stretch gap-4 min-[360px]:gap-5 md:gap-6 ${
        yangi ? "" : "md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"}`}>
        <AsosiyKarta amal={amal} />
        {!yangi && reja}
      </div>
      {ogoh}
      {!yangi && <div className="md:max-w-[560px]">{haftaBlok}</div>}
      {/* Kompyuterda yangi odamga — katta karta ostida yana uch yo'l. Telefonda
          YO'Q: u yerda "kirishda juda ko'p narsa" degan e'tiroz bor edi va
          bo'limlar pastki panelda turibdi. Keng ekranda esa bitta karta
          ostida yarim ekran bo'sh qolardi (2026-10-09). */}
      {yangi && kompyuter && (
        <section aria-label={t("bugunYana")} className="flex flex-col gap-3">
          <h2 className="font-display text-[18px] text-ink-soft">{t("bugunYana")}</h2>
          <div className="grid grid-cols-3 gap-4">
            <YolPlitka belgi="zar" nom={t("tabOyin")} izoh={t("bugunOyinIzoh")}
              on={() => onYol(yolOyinlar())} tahlil="Bugun: yangi — o'yinlar" />
            <YolPlitka belgi="pencil" nom={t("masalalar")} izoh={t("bugunMasalaIzoh")}
              on={onMasalalar} tahlil="Bugun: yangi — masalalar" />
            <YolPlitka belgi="raqamlar" nom={t("kunlikSon")} izoh={t("kunlikSonIzoh")}
              on={onKunlikSon} tahlil="Bugun: yangi — kunlik son" />
          </div>
        </section>
      )}
    </div>
  );
}

/** Kompyuterdagi qo'shimcha yo'l — 3D firuza belgi, nom va bir qator izoh. */
function YolPlitka({ belgi, nom, izoh, on, tahlil }: {
  belgi: string; nom: string; izoh: string; on: () => void; tahlil: string;
}) {
  return (
    <button type="button" onClick={on} data-tahlil={tahlil}
      className="clay-press flex items-center gap-4 rounded-clay bg-karta p-5 text-left shadow-clay-sm">
      <img src={`/belgi/h/${belgi}.webp`} alt="" width={56} height={56} decoding="async"
        className="size-14 shrink-0 drop-shadow-[0_6px_8px_rgb(0_0_0/0.25)]" />
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[18px] leading-tight">{nom}</span>
        <span className="mt-1 block text-[13.5px] leading-snug text-ink-dim">{izoh}</span>
      </span>
      <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
    </button>
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
  /** Kartadagi 3D rasm; berilmasa — dars uchun raketa, boshqasiga bitiruv. */
  belgi?: HajmliNom;
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
 *                    duelga taklif. Ilgari tugma doim keyingi darsni
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
  davom, prof, qadam, progressOf, onDarslar, onMasalalar, onDavom, onKurs, onDaraja, onImtihon, onTestlar, onDuel,
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
  onDuel: () => void;
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
    // Hammasi bajarildi — duelga chaqiriladi. Ilgari "Yana bitta dars"
    // edi: bajarilgan rejadan keyin yana darsga undash charchatardi,
    // do'st bilan bellashuv esa ertaga qaytishga sabab beradi.
    return {
      tahlil: "Bugun: hammasi bajarildi, duel", on: onDuel, yorliq: t("bugunQadamTayyor"),
      nom: t("bugunHammasi"), izoh: t("bugunHammasiIzoh"), tugma: t("bugunDuelga"), belgi: "kubok",
    };
  }
  const boshla = (tahlil: string, on: () => void, nom: string, izoh: string): Amal => ({
    // Tugmada qisqa "Boshlash": sarlavha ko'pincha o'zi "O'rganishni
    // boshlash" va bir xil yozuv ikki marta turardi.
    tahlil, on, nom, izoh, yorliq: t("bugunBirinchiQadam"), tugma: t("bugunAmalBoshlash"),
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
function AsosiyKarta({ amal }: { amal: Amal }) {
  const otilgan = amal.yol?.filter((h) => h === "otilgan").length ?? 0;
  const jami = amal.yol?.length ?? 0;
  const belgi: HajmliNom = amal.belgi ?? (amal.yol ? "raketa" : "bitiruv");
  return (
    /* Bitta tugmali karta. Ilgari yonida ikkinchi "Darslar" tugmasi, ichida
       zanjir chipi (sarlavhada ham bor edi) va orqada rangli nurlar turardi:
       odam ikki tugma orasida ikkilanardi. Endi tanlov yo'q — faqat bosish.
       "Barcha darslar" pastki paneldagi O'qish tabida. */
    <section className="relative flex min-h-[220px] flex-col justify-center gap-3.5 overflow-hidden rounded-[26px] bg-karta
                        p-5 shadow-clay md:p-7">
      {/* Rasm o'lchamga qarab BITTA: telefonda burchakda kichik, kengda katta. */}
      <span className="az-suzish pointer-events-none absolute top-4 right-4 md:hidden">
        <Hajmli nom={belgi} olcham={56} jonli />
      </span>
      <span className="az-suzish pointer-events-none absolute right-8 hidden md:block">
        <Hajmli nom={belgi} olcham={128} jonli />
      </span>
      {amal.joy && (
        <span className="relative pr-20 text-[13px] font-bold text-ink-dim md:pr-40">{amal.joy}</span>
      )}
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
      {/* Telefonda tugma butun eni bo'ylab — bosh barmoq uchun eng oson nishon. */}
      <button type="button" onClick={amal.on} data-tahlil={amal.tahlil}
        className="tugma-3d relative mt-1 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-[16px]
                   bg-brand-blue px-6 font-display text-[18px] font-bold text-white
                   shadow-[0_4px_0_var(--color-brand-blue-d),0_12px_24px_-10px_var(--color-brand-blue)] md:w-auto md:self-start">
        {amal.tugma}
        <Icon name="chevron" size={18} />
      </button>
    </section>
  );
}
