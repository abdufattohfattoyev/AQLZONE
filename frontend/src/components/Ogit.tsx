/**
 * Animatsion tushuntirish — dars savollardan OLDIN shu ekrandan boshlanadi.
 *
 * Maqsad: bola savolga duch kelishidan avval javobning MA'NOSINI ko'rsin.
 * "2 + 1" ni bilmagan bola uchun bu ikkita olma, keyin yana bitta olma, va
 * ular birlashib uchta bo'lishi — ya'ni multfilm. Shu sabab bu yerda hech
 * qanday tugma yoki tanlov yo'q: faqat qadam-baqadam harakat va bitta
 * qatorlik izoh.
 *
 * Qadamlar o'zi almashadi (bola kutib turadi), lekin ekranga bosib ham
 * oldinga surish mumkin — kattalar bilan birga ko'rganda qulay. Oxirgi
 * qadamda "Boshlaymiz!" tugmasi chiqadi.
 *
 * Animatsiyalarning o'zi CSS da (`index.css`, "o'git" bo'limi): elementlar
 * navbat bilan `--az-kech` kechikishi bilan chiqadi, ketadiganlari
 * `az-ketdi` bilan uchib ketadi.
 */
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "../lib/icons";
import { Logo } from "./Logo";
import { Rasm } from "./Rasm";
import { gapir } from "../lib/ovoz";
import type { Ogit as OgitT } from "../lib/types";
import { til } from "../lib/til";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";

/**
 * Bitta qadam necha vaqt turadi.
 *
 * Ataylab uzun. Bu kattalar uchun slayd emas: 4 yoshli bola rasmni ko'radi,
 * kattasi izohni o'qib beradi, keyin bola narsalarni barmog'i bilan sanab
 * chiqadi — bularning hammasi bir qadam ichida sig'ishi kerak. Tezroq
 * ketishni istagan bola ekranga bosib o'zi suradi.
 */
const QADAM_MS = 3400;

/** Sanash qadamlari qisqaroq — ular ketma-ket bittadan qo'shilib boradi. */
const SANASH_MS = 2200;

const SON = ["nol", "bir", "ikki", "uch", "to'rt", "besh",
  "olti", "yetti", "sakkiz", "to'qqiz", "o'n"] as const;

/** "uch" → "Uch". Izohlar gap bosh harfi bilan boshlanadi. */
const Bosh = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Sanoq shakli: 3 → "uchta".
 *
 * "bir" qo'shimcha bilan qo'shilganda o'zgaradi — "birta" emas, "bitta".
 * Bu izohlarni bola ovoz chiqarib eshitadi, shuning uchun noto'g'ri shakl
 * darrov sezilardi.
 *
 * Ruschada RAQAM qaytariladi. Sabab: ruscha ot sonlar bilan uch xil
 * shaklga kiradi ("1 предмет", "2 предмета", "5 предметов") va uni
 * bitta qolipda to'g'ri chiqarib bo'lmaydi — raqam esa har qanday
 * sonda to'g'ri o'qiladi.
 */
const ta = (n: number) =>
  til() === "ru" ? String(n) : (n === 1 ? "bitta" : `${SON[n]}ta`);

/** Son nomi: o'zbekchada so'z, ruschada raqam. */
const son = (n: number) => (til() === "ru" ? String(n) : SON[n]);

const kech = (ms: number) => ({ "--az-kech": `${ms}ms` }) as CSSProperties;

interface Qadam {
  /** Pastdagi bir qatorlik izoh — kattalar o'qib beradi. */
  matn: string;
  ko: ReactNode;
  /** Shu qadam necha ms turadi. Berilmasa `QADAM_MS`. */
  kut?: number;
}

/* ---------------- qurilish bloklari ---------------- */

/**
 * Narsaning kattaligi soniga qarab.
 *
 * Uchta olma ekranni to'ldirib turishi kerak — bola ularni uzoqdan ham
 * ko'rsin. O'nta bo'lganda esa kichrayadi, aks holda ekranga sig'maydi va
 * o'rash tartibi buzilib, sanash qiyinlashadi.
 */
const olcham = (n: number) => (n <= 3 ? 76 : n <= 5 ? 62 : n <= 7 ? 54 : 46);

/** Bir guruh narsa. `ketgan` — oxiridan nechtasi uchib ketishi. */
function Guruh({ n, e, boshKech = 0, ketgan = 0, sonli = false, sekin = false, olchamN }: {
  n: number; e: string; boshKech?: number; ketgan?: number; sonli?: boolean;
  /** Narsalar birin-ketin, dona-dona tushsin (sanash darsi uchun). */
  sekin?: boolean;
  /**
   * Kattalik qaysi songa qarab olinsin.
   *
   * Bir sahnada ikki guruh bo'lganda (4 + 3) ikkalasi BIR XIL kattalikda
   * bo'lishi kerak, aks holda uchta olma to'rttadan yirikroq chiqib, bola
   * "bu boshqa olma" deb o'ylardi. Shuning uchun bunday joyda ikkalasiga
   * ham jami son beriladi.
   */
  olchamN?: number;
}) {
  const px = olcham(olchamN ?? n);
  const oraliq = sekin ? 420 : 260;
  return (
    <span className="flex max-w-[280px] flex-wrap items-center justify-center gap-2">
      {Array.from({ length: n }, (_, i) => {
        const ketdi = i >= n - ketgan;
        return (
          <span key={i} className="relative">
            <span className={`block ${ketdi ? "az-ketdi" : "az-tush"}`}
              style={kech(ketdi ? (i - (n - ketgan)) * 420 : boshKech + i * oraliq)}>
              <Rasm e={e} size={px} />
            </span>
            {/* Sanash darsida har bir narsa ustida o'z tartib raqami turadi:
                bola "bitta narsa — bitta son" qoidasini shunday ilg'aydi. */}
            {sonli && (
              <span className="az-tush absolute -top-2 -right-2 grid place-items-center rounded-full
                               bg-brand-orange font-display text-white"
                style={{
                  width: px * 0.42, height: px * 0.42, fontSize: px * 0.26,
                  ...kech(boshKech + i * oraliq + 260),
                }}>
                {i + 1}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

/** Katta son — natijani e'lon qiladi. */
const KattaSon = ({ v, rang = "text-brand-orange-d" }: { v: number | string; rang?: string }) => (
  <span className={`az-katta font-display text-[86px] leading-none ${rang}`}>{v}</span>
);

/** Amal belgisi: + yoki −. Ataylab katta — dars aslida shu belgi haqida. */
const Belgi = ({ b, kechikish = 0 }: { b: string; kechikish?: number }) => (
  <span className="az-katta font-display text-[60px] leading-none text-brand-purple"
    style={kech(kechikish)}>
    {b}
  </span>
);

/** Yozuv shakli: 2 + 1 = 3. Oxirgi qadamda chiqadi. */
const Yozuv = ({ matn }: { matn: string }) => (
  <span className="az-katta rounded-clay bg-karta px-6 py-4 font-display text-[46px]
                   leading-none shadow-clay-sm">
    {matn}
  </span>
);

/* ---------------- qadamlarni yasash ---------------- */

function qadamlar(o: OgitT): Qadam[] {
  switch (o.tur) {
    case "sanash":
      // Har bir qadamda BITTA narsa qo'shiladi va son o'sadi. Oldin
      // tushganlari joyida qoladi (ular qayta chizilmaydi, chunki qadamlar
      // bir xil tuzilishda) — bola shunda "yana bitta qo'shildi" ni ko'radi,
      // "hammasi qaytadan boshlandi" ni emas.
      return Array.from({ length: o.n }, (_, i) => ({
        matn: i + 1 === o.n
          ? t("ogSanashOxir", { ta: ta(o.n) })
          : t("ogSanashOraliq", { ta: Bosh(ta(i + 1)) }),
        kut: i + 1 === o.n ? QADAM_MS : SANASH_MS,
        ko: (
          <span className="flex flex-col items-center gap-5">
            {/* Son har sanoqda yangidan "chiqadi" — shuning uchun kalit
                qiymatning o'zi: React uni qayta yasaydi va u sakraydi. */}
            <KattaSon key={i + 1} v={i + 1} />
            <Guruh n={i + 1} e={o.emoji} sonli sekin />
          </span>
        ),
      }));

    case "qosh": {
      const j = o.a + o.b;
      // Diqqat: birinchi ikki qadam BIR XIL tuzilishda yozilgan (bitta
      // o'ram, ichida uchta joy). Shu sabab birinchi guruh ikkinchi qadamda
      // qayta tushmaydi — joyida turadi va yoniga "+" bilan yangi guruh
      // keladi. Tuzilishni buzsangiz, hamma narsa qaytadan tushib, bola
      // "nima bo'ldi?" deb qolardi.
      const sahna = (ikki: boolean) => (
        <span className="flex items-center gap-3">
          <Guruh n={o.a} e={o.emoji} olchamN={j} />
          {ikki ? <Belgi b="+" kechikish={200} /> : <span />}
          {ikki ? <Guruh n={o.b} e={o.emoji} boshKech={520} olchamN={j} /> : <span />}
        </span>
      );
      return [
        { matn: t("ogQoshBor", { ta: Bosh(ta(o.a)) }), ko: sahna(false) },
        {
          matn: t("ogQoshYana", { ta: ta(o.b) }),
          ko: sahna(true),
        },
        {
          matn: t("ogQoshJami", { ta: ta(j) }),
          ko: (
            <span className="flex flex-col items-center gap-5">
              <KattaSon v={j} />
              <Guruh n={j} e={o.emoji} sonli sekin />
            </span>
          ),
          // Bu eng muhim qadam: bola natijani o'zi sanab chiqishi kerak.
          // Vaqt narsalar soniga qarab uzayadi — oxirgi olma tushib
          // bo'lmasidan qadam almashib ketmasligi kerak.
          kut: 2000 + j * 520,
        },
        {
          matn: t("ogYozilishi"),
          ko: <Yozuv matn={`${o.a} + ${o.b} = ${j}`} />,
        },
      ];
    }

    case "ayir": {
      const q = o.n - o.k;
      // Bu yerda ham tuzilish ikki qadamda bir xil: narsalar joyidan
      // qo'zg'almaydi, faqat ketadiganlari uchib ketadi. Aynan shu — bolaga
      // "ayirish" nima ekanini ko'rsatadigan lahza.
      const sahna = (ket: boolean) => (
        <span className="flex items-center gap-3">
          <Guruh n={o.n} e={o.emoji} ketgan={ket ? o.k : 0} />
          {ket ? <Belgi b="−" /> : <span />}
        </span>
      );
      return [
        { matn: t("ogAyirBor", { ta: Bosh(ta(o.n)) }), ko: sahna(false) },
        {
          matn: t("ogAyirKetdi", { ta: Bosh(ta(o.k)) }),
          ko: sahna(true),
          // Uchib ketish o'zi ~1 s davom etadi — bola uni ko'rib qolishi kerak.
          kut: QADAM_MS + o.k * 420,
        },
        {
          matn: t("ogAyirQoldi", { ta: Bosh(ta(q)) }),
          ko: (
            <span className="flex flex-col items-center gap-5">
              <KattaSon v={q} />
              <Guruh n={q} e={o.emoji} sonli sekin olchamN={o.n} />
            </span>
          ),
          kut: 2000 + q * 520,
        },
        {
          matn: t("ogYozilishi"),
          ko: <Yozuv matn={`${o.n} − ${o.k} = ${q}`} />,
        },
      ];
    }

    case "taqqosla": {
      const kop = Math.max(o.a, o.b), kam = Math.min(o.a, o.b);
      const chapKop = o.a > o.b;
      const tomon = (n: number, yut: boolean) => (
        <span className={`flex min-w-[120px] flex-col items-center gap-2 rounded-clay p-3
                          ${yut ? "bg-brand-green/20 ring-3 ring-brand-green" : "bg-karta/70"}`}>
          <Guruh n={n} e={o.emoji} olchamN={Math.max(o.a, o.b)} />
        </span>
      );
      return [
        {
          matn: t("ogTaqqoslaIkki"),
          ko: (
            <span className="flex items-stretch gap-3">
              {tomon(o.a, false)}
              {tomon(o.b, false)}
            </span>
          ),
        },
        {
          matn: t("ogTaqqoslaSana"),
          ko: (
            <span className="flex items-stretch gap-3">
              <span className="flex flex-col items-center gap-2">
                <KattaSon v={o.a} rang={chapKop ? "text-brand-green-d" : "text-ink-dim"} />
                {tomon(o.a, false)}
              </span>
              <span className="flex flex-col items-center gap-2">
                <KattaSon v={o.b} rang={chapKop ? "text-ink-dim" : "text-brand-green-d"} />
                {tomon(o.b, false)}
              </span>
            </span>
          ),
        },
        {
          matn: t("ogTaqqoslaNatija", {
            kop: Bosh(son(kop)), kam: son(kam), ta: ta(kop),
          }),
          ko: (
            <span className="flex items-stretch gap-3">
              {tomon(o.a, chapKop)}
              {tomon(o.b, !chapKop)}
            </span>
          ),
        },
      ];
    }

    case "raqam":
      return [
        {
          matn: t("ogRaqamBu", { son: son(o.n) }),
          ko: (
            <span className="az-katta grid size-40 place-items-center rounded-clay bg-karta
                             font-display text-[110px] leading-none text-brand-purple shadow-clay">
              {o.n}
            </span>
          ),
        },
        {
          matn: t("ogRaqamBildiradi", { son: Bosh(son(o.n)), ta: ta(o.n) }),
          ko: (
            <span className="flex items-center gap-4">
              <span className="grid size-24 shrink-0 place-items-center rounded-clay bg-karta
                               font-display text-[64px] leading-none text-brand-purple shadow-clay-sm">
                {o.n}
              </span>
              <Guruh n={o.n} e={o.emoji} sonli />
            </span>
          ),
        },
      ];

    case "qator": {
      const arr = Array.from({ length: o.n }, (_, i) => i + 1);
      const yashirin = Math.min(o.n - 2, 2);        // uchinchi katak
      const qator = (hide: number) => (
        <span className="flex flex-wrap justify-center gap-1.5">
          {arr.map((v, i) => (
            <span key={i}
              className={`az-tush grid size-12 place-items-center rounded-2xl font-display text-xl
                ${i === hide ? "bg-brand-orange/25 text-brand-orange-d" : "bg-karta shadow-clay-sm"}`}
              style={kech(i * 130)}>
              {i === hide ? "?" : v}
            </span>
          ))}
        </span>
      );
      return [
        { matn: t("ogQatorTartib"), ko: qator(-1) },
        { matn: t("ogQatorYashirin"), ko: qator(yashirin) },
        {
          matn: t("ogQatorNatija", {
            a: yashirin, b: yashirin + 1, c: yashirin + 2,
          }),
          ko: qator(-1),
        },
      ];
    }

    case "naqsh": {
      const chiziq = (ajrat: boolean, savol: boolean) => (
        <span className="flex max-w-[280px] flex-wrap items-center justify-center gap-1.5">
          {o.items.map((e, i) => (
            <span key={i}
              className={`az-tush grid size-[52px] place-items-center rounded-2xl text-[28px]
                ${ajrat && Math.floor(i / o.davr) % 2 === 1 ? "bg-brand-purple/20" : "bg-karta/80"}`}
              style={kech(i * 120)}>
              {e}
            </span>
          ))}
          {savol && (
            <span className="az-katta grid size-[52px] place-items-center rounded-2xl
                             bg-brand-orange/25 font-display text-[28px] text-brand-orange-d">
              ?
            </span>
          )}
        </span>
      );
      return [
        { matn: t("ogNaqshBu"), ko: chiziq(false, false) },
        { matn: t("ogNaqshQara"), ko: chiziq(true, false) },
        { matn: t("ogNaqshDemak"), ko: chiziq(true, true) },
      ];
    }

    case "tanish":
      return [
        {
          matn: t("ogTanishBu", { nom: kursMatn(o.nom) }),
          ko: (
            <span className="az-katta block">
              {/* Harf bo'lsa matn, shakl bo'lsa chizma — `Rasm` o'zi ajratadi. */}
              <Rasm e={o.belgi} size={130} />
            </span>
          ),
        },
      ];

    case "royxat": {
      /** Bitta a'zo: rang bo'lsa doira, aks holda rasm. */
      const dona = (it: { nom: string; e?: string; hex?: string }, px: number) =>
        it.hex
          ? <span className="rounded-full shadow-clay ring-3 ring-white/70 outline outline-2 outline-ink/15"
              style={{ width: px, height: px, background: it.hex, display: "block" }} />
          : <Rasm e={it.e ?? ""} size={px} />;

      // Har bir a'zo alohida qadamda, katta va yolg'iz: bola bir vaqtda
      // faqat BITTA yangi so'zni oladi. Nomi pastda yozilgan va aytiladi,
      // ota-ona esa bola bilan takrorlaydi.
      const qadam: Qadam[] = o.items.map((it) => ({
        matn: t("ogTanishBu", { nom: it.nom }),
        kut: 2600,
        ko: <span className="az-katta block">{dona(it, 132)}</span>,
      }));

      // Oxirida hammasi birga — endi bola ularni YONMA-YON ko'radi va
      // farqini o'zi payqaydi. Savollar aynan shundan keyin boshlanadi.
      qadam.push({
        matn: t("ogRoyxatOxir", { nom: kursMatn(o.nom) }),
        ko: (
          <span className="flex max-w-[300px] flex-wrap items-center justify-center gap-3">
            {o.items.map((it, i) => (
              <span key={i} className="az-tush block" style={kech(i * 180)}>
                {dona(it, 56)}
              </span>
            ))}
          </span>
        ),
      });
      return qadam;
    }
  }
}

/* ---------------- ekran ---------------- */

export function Ogit({ o, nomi, onBoshla }: { o: OgitT; nomi: string; onBoshla: () => void }) {
  // `o` — o'quv dasturidagi o'zgarmas obyekt, shuning uchun qadamlar bir
  // marta yasaladi. Bu shart: aks holda pastdagi taymer har qayta
  // chizilishda yangi ro'yxat ko'rib, hisobni noldan boshlab yuborardi.
  const q = useMemo(() => qadamlar(o), [o]);
  const [i, setI] = useState(0);
  /**
   * Necha marta qaytadan ko'rsatilgani.
   *
   * "Yana ko'rsat" bosilganda shu son o'zgaradi va sahna kaliti bilan birga
   * yangilanadi — shunda animatsiyalar boshidan qayta o'ynaydi. Bir marta
   * ko'rib tushunmagan bola uchun bu eng kerakli tugma.
   */
  const [qayta, setQayta] = useState(0);
  const oxirgi = i >= q.length - 1;

  useEffect(() => {
    if (oxirgi) return;                    // oxirgi qadamda kutib turadi
    const t = setTimeout(() => setI((x) => x + 1), q[i].kut ?? QADAM_MS);
    return () => clearTimeout(t);
  }, [i, oxirgi, q]);

  // Har qadamning izohi ovoz chiqarib o'qiladi. Aynan shu narsa bu ekranni
  // "multfilm" qiladi: bola rasmni ko'rib turib, tushuntirishni eshitadi.
  // `qayta` ham bog'liqlikda — "Yana ko'rsat" bosilganda birinchi qadam
  // matni o'zgarmasa ham, u qaytadan aytilishi kerak.
  useEffect(() => { gapir(q[i].matn); }, [i, q, qayta]);

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-4 pb-8">
      {/* Qadam ko'rsatkichi — bola qancha qolganini ko'rib turadi. */}
      <div className="flex items-center gap-2">
        <Logo size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[15px] leading-tight">{nomi}</div>
          <div className="text-[12px] text-ink-dim">{t("avvalKorsataman")}</div>
        </div>
        <div className="flex gap-1.5">
          {q.map((_, k) => (
            <span key={k} className={`size-2.5 rounded-full transition-colors
              ${k <= i ? "bg-brand-orange" : "bg-karta/70"}`} />
          ))}
        </div>
      </div>

      {/* Sahna. Bosilganda keyingi qadamga o'tadi — kattalar bilan birga
          ko'rganda "shosh, keyingisi" degan tabiiy harakat shu.

          Diqqat: kalit qadam raqami EMAS, faqat qayta ko'rsatish raqami.
          Qadam raqami bo'lsa, har qadamda butun sahna qaytadan yasalib,
          allaqachon tushib bo'lgan olmalar yana tushardi — bola esa "yana
          bitta qo'shildi" ni emas, "hammasi qaytadan boshlandi" ni ko'rardi. */}
      <button type="button" onClick={() => setI((x) => Math.min(q.length - 1, x + 1))}
        className="relative my-4 flex flex-1 cursor-pointer items-center justify-center
                   rounded-clay bg-sahna/85 p-4 ring-1 ring-track ring-inset backdrop-blur-sm">
        <span key={qayta} className="block">{q[i].ko}</span>
      </button>

      {/* Izoh. Ovoz yoqilganda ilova shu matnni o'qib beradi. */}
      <div key={`m-${i}-${qayta}`} className="az-savol flex items-center gap-3 rounded-clay
                                     bg-karta p-4 shadow-clay-sm">
        <span className="min-w-0 flex-1 text-center font-display text-[17px] leading-snug">
          {q[i].matn}
        </span>
      </div>

      {oxirgi ? (
        <div className="mt-3 flex gap-2.5">
          {/* Tushunmagan bola uchun eng kerakli tugma: hammasini boshidan
              ko'rish. Shuning uchun u "Boshlaymiz" bilan yonma-yon turadi. */}
          <button type="button"
            onClick={() => { setQayta((k) => k + 1); setI(0); }}
            className="clay-press flex shrink-0 items-center gap-2 rounded-3xl bg-karta px-4 py-3.5
                       font-display text-[15px] text-ink-soft shadow-clay-sm">
            <Icon name="repeat" size={18} />
            {t("yanaKorsat")}
          </button>
          <button type="button" onClick={onBoshla}
            className="az-yaltir tugma-3d flex-1 rounded-3xl bg-brand-green py-3.5
                       font-display text-lg text-white shadow-[0_6px_0_var(--color-brand-green-d)]">
            {t("boshlaymiz")}
          </button>
        </div>
      ) : (
        <button type="button" onClick={onBoshla}
          className="clay-press mt-3 flex w-full items-center justify-center gap-2 rounded-3xl
                     bg-karta/70 py-3 font-display text-[15px] text-ink-soft">
          {t("otkazibYuborish")}
          <Icon name="chevron" size={16} />
        </button>
      )}
    </div>
  );
}
