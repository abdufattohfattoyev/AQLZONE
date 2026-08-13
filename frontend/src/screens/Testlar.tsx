/**
 * TESTLAR BAZASI — sinfning barcha testlari bir ro'yxatda.
 *
 * ─────────────── DARSLARDAN ALOHIDA ───────────────
 *
 * Kurs ekrani AMALIY MISOLlar joyi: yo'l xaritasi, bobma-bob tartib,
 * yulduzlar, qulflar. U yerda maqsad o'rganish.
 *
 * Bu ekran esa o'lchaydi. Shuning uchun undagi hamma narsa boshqacha:
 * tartib yo'q, qulf yo'q, yulduz yo'q. Istalgan bobning testini
 * istalgan paytda ochish mumkin — dars tugatilmagan bo'lsa ham.
 *
 * ─────────────── NEGA QULF YO'Q ───────────────
 *
 * Maktabda mavzu ALLAQACHON o'tilgan bo'ladi. Bola ilovaga bilimini
 * tekshirish uchun kiradi, o'rganish uchun emas — va uni "avval shu
 * yerda ham o'tib chiq" deb qaytarish mavjud bilimini inkor qilish
 * bo'lardi.
 *
 * "Birinchi kuni 30 tadan 3 ball chiqadi" degan xavf boshqa yo'l
 * bilan hal qilingan: QAMROVNI O'ZI TANLAYDI. Butun sinf bo'yicha
 * aralash test ham bor, bitta bobning testi ham. Maktabda
 * progressiyani o'tayotgan bola aynan o'sha bobni oladi.
 *
 * ─────────────── RO'YXAT NIMANI KO'RSATADI ───────────────
 *
 * Har bobning yonida ENG YAXSHI bali turadi (agar topshirilgan
 * bo'lsa). Oxirgisi emas: bu son "men bu mavzuni qanchalik bilaman"
 * degan savolga javob beradi va shoshib topshirilgan bitta test o'sha
 * javobni butunlay o'chirib yuborishi noto'g'ri bo'lardi.
 *
 * Ball rangi bilan ham gapiradi — yashil, sariq, qizil. Bu bezak
 * emas: yigirmata bobli ro'yxatda "qaysi biriga qaytishim kerak"
 * degan savolga ko'z bilan javob berish kerak.
 */
import { useMemo, useState } from "react";
import { Icon } from "../lib/icons";
import { Blok } from "./Blok";
import type { Qamrov, Uzunlik } from "../lib/blok";
import {
  OLCHAM, bobBali, dtmBormi, joriyniOqi, qolganVaqt, sinfBoblari,
  sinfKurslari, vaqtiTugagan,
} from "../lib/blok";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { tebrat, useOrqaga } from "../lib/qobiq";

/** Ayni paytda ochilgan test. */
interface Tanlov {
  uzunlik: Uzunlik;
  qamrov: Qamrov;
  bobNomi?: string;
  /** Tugallanmagan testni so'ramasdan davom ettirish. */
  davomEt?: boolean;
}

export function Testlar({ sinf, onBack, onHisobot }: {
  sinf: number;
  onBack: () => void;
  onHisobot: () => void;
}) {
  const [tanlov, setTanlov] = useState<Tanlov | null>(null);
  /** Tasdiq kutayotgan tanlov — faqat uzun test uchun. */
  const [sorov, setSorov] = useState<Tanlov | null>(null);
  const ozStrelka = useOrqaga(onBack);

  /**
   * Tugallanmagan test — RO'YXAT TEPASIDA ko'rsatiladi.
   *
   * Nega aynan bu yerda: yarim qolgan test xotirada saqlanadi, lekin
   * uni ochadigan ekran `Blok` va u faqat yangi test tanlanganda
   * ochiladi. Ya'ni sahifa yangilangandan keyin — aynan o'sha holatda
   * saqlash kerak bo'lgan paytda — odam bu ekranga tushadi va
   * ishidan darak topmaydi.
   *
   * `tanlov` ga bog'langan: testdan qaytilganda qayta o'qiladi va
   * tugallangan test kartasi ekranda qolib ketmaydi.
   */
  const yarim = useMemo(
    joriyniOqi,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tanlov],
  );

  const boblar = useMemo(() => sinfBoblari(sinf), [sinf]);
  // Bir sinfda ikki fan bo'lsa (algebra + geometriya) bob nomi yonida
  // qaysi fan ekani ham kerak. Bitta kurs bo'lsa u ortiqcha shovqin.
  const ikkiFan = sinfKurslari(sinf).length > 1;

  /**
   * Ballar test topshirilgandan KEYIN o'zgaradi, shuning uchun ular
   * `tanlov` ga bog'lab hisoblanadi: testdan qaytgan odam ro'yxatda
   * yangi balini darhol ko'radi.
   */
  const ballar = useMemo(
    () => new Map(boblar.map((b) => [b.nom, bobBali(sinf, b.nom)])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boblar, sinf, tanlov],
  );

  if (tanlov) {
    return (
      <Blok
        sinf={sinf}
        uzunlik={tanlov.uzunlik}
        qamrov={tanlov.qamrov}
        bobNomi={tanlov.bobNomi}
        davomEt={tanlov.davomEt}
        onExit={() => setTanlov(null)}
      />
    );
  }

  /**
   * Testni boshlash.
   *
   * UZUN TESTLAR tasdiq so'raydi (to'liq blok va DTM), qolganlari
   * yo'q. Sabab o'lchovda: yarim soatdan bir soatgacha — bir
   * o'tirishda qilinadigan eng katta ish. Uni tasodifan bosib qo'yib, ikkinchi
   * savolda tashlab ketish eng ko'p uchraydigan yo'qotish.
   *
   * Qisqa va bob testlari o'n daqiqalik — ular uchun tasdiq foydadan
   * ko'ra to'siq bo'lardi. Har bosishda savol beriladigan ilova
   * o'zining hamma tugmasini og'irlashtiradi.
   */
  const boshla = (x: Tanlov) => {
    tebrat("tanlov");
    if (x.uzunlik === "toliq" || x.uzunlik === "dtm") setSorov(x);
    else setTanlov(x);
  };

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-10">
      <div className="flex items-center gap-3">
        {ozStrelka && (
          <button type="button" onClick={onBack} title={t("ortga")}
            className="clay-press grid size-11 place-items-center rounded-2xl bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="flex-1 font-display text-[18px]">{t("testlarSarlavha")}</h1>
        {/* Natijaga o'tish shu yerdan ham: testni topshirgan odamning
            keyingi savoli deyarli har doim "oldingilarga nisbatan
            qanday?" bo'ladi. */}
        <button type="button" onClick={onHisobot} title={t("hisobotTugma")}
          className="clay-press grid size-10 place-items-center rounded-2xl bg-karta text-brand-blue shadow-clay-sm">
          <Icon name="chart" size={18} />
        </button>
      </div>

      <p className="mt-3 text-[12.5px] leading-snug text-ink-dim">{t("testlarIzoh")}</p>

      {/* ---- tugallanmagan test ----
          Ro'yxatdan OLDIN turadi: yarim qolgan ish har qanday yangi
          taklifdan muhimroq. Vaqti tugab qolgan bo'lsa ham
          ko'rsatiladi — bosilganda natija ochiladi va bergan
          javoblari bekorga ketmaydi. */}
      {yarim && (
        <button type="button"
          onClick={() => {
            tebrat("tanlov");
            setTanlov({
              uzunlik: yarim.uzunlik,
              qamrov: { tur: "hammasi" },
              bobNomi: yarim.bobNomi,
              davomEt: true,
            });
          }}
          className="tugma-3d az-kirish mt-3 flex w-full items-center gap-3 rounded-clay bg-karta p-3.5
                     text-left shadow-clay-sm ring-2 ring-brand-orange/45">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-orange/15
                           text-brand-orange-d">
            <Icon name="clock" size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[14.5px] leading-tight">
              {t("blokDavomSarlavha")}
            </span>
            <span className="mt-0.5 block text-[12px] leading-snug text-ink-dim">
              {t("blokDavomIzoh", {
                a: yarim.javoblar.filter((x) => x.tanlangan !== null).length,
                b: yarim.savollar.length,
              })}
              {!vaqtiTugagan(yarim)
                && ` · ${t("blokDavomVaqt", { n: Math.ceil(qolganVaqt(yarim) / 60) })}`}
            </span>
          </span>
          <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
        </button>
      )}

      {/* ---- butun sinf bo'yicha ----
          Yuqorida turadi, chunki bu asosiy mashq: imtihonda savollar
          aralash keladi va qaysi mavzudan ekani aytilmaydi. */}
      <h2 className="az-kirish mt-5 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("testlarAralash")}
      </h2>
      {/* DTM eng tepada va faqat bitiruv sinfida: 11-sinf o'quvchisi
          ilovaga aynan shuning uchun keladi, qolgan mashqlar esa
          unga tayyorgarlik. */}
      <div className="az-kirish space-y-2">
        {(dtmBormi(sinf) ? (["dtm", "toliq", "qisqa"] as const) : (["toliq", "qisqa"] as const))
          .map((u) => {
            const bezak = {
              dtm: { rang: "bg-brand-orange", ikon: "clock", nom: "blokDtm", izoh: "blokDtmIzoh" },
              toliq: { rang: "bg-brand-purple", ikon: "trophy", nom: "blokToliq", izoh: "" },
              qisqa: { rang: "bg-brand-blue", ikon: "flame", nom: "blokQisqa", izoh: "" },
            }[u];
            return (
              <button key={u} type="button"
                onClick={() => boshla({ uzunlik: u, qamrov: { tur: "hammasi" } })}
                className="tugma-3d flex w-full items-center gap-3 rounded-clay bg-karta p-3.5 text-left shadow-clay-sm">
                <span className={`grid size-10 shrink-0 place-items-center rounded-2xl text-white ${bezak.rang}`}>
                  <Icon name={bezak.ikon as "clock"} size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] leading-tight">
                    {t(bezak.nom as "blokToliq")}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-dim">
                    {t("blokOlcham", { s: OLCHAM[u].savol, d: OLCHAM[u].daqiqa })}
                    {bezak.izoh && ` · ${t(bezak.izoh as "blokDtmIzoh")}`}
                  </span>
                </span>
                <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
              </button>
            );
          })}
      </div>

      {/* ---- bob-bob ---- */}
      <h2 className="az-kirish mt-6 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("testlarBoblar", { n: boblar.length })}
      </h2>
      <div className="az-kirish space-y-2" style={{ "--az-kech": "60ms" } as React.CSSProperties}>
        {boblar.map((b) => {
          const ball = ballar.get(b.nom) ?? null;
          return (
            <button key={`${b.kursId}-${b.ui}`} type="button"
              onClick={() => boshla({
                uzunlik: "bob",
                qamrov: { tur: "bob", kursId: b.kursId, ui: b.ui },
                bobNomi: b.nom,
              })}
              className="tugma-3d flex w-full items-center gap-3 rounded-clay bg-karta p-3 text-left shadow-clay-sm">
              {/* Chap tomonda BALL turadi, belgi emas. Ro'yxatning
                  butun ma'nosi shu ustunda: odam uni yuqoridan pastga
                  bir marta ko'zdan kechirib, qaysi mavzu oqsayotganini
                  topadi. Hali topshirilmagan bobda chiziqcha turadi —
                  nol emas, chunki nol "yomon bildim" degani bo'lardi. */}
              <span className={`grid size-10 shrink-0 place-items-center rounded-2xl font-display text-[13px]
                ${ball === null ? "bg-track text-ink-dim"
                  : ball >= 80 ? "bg-brand-green text-white"
                  : ball >= 50 ? "bg-brand-orange text-white"
                  : "bg-brand-red text-white"}`}>
                {ball === null ? "—" : ball}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] leading-tight">{kursMatn(b.nom)}</span>
                <span className="mt-0.5 block truncate text-[11.5px] text-ink-dim">
                  {ikkiFan && `${kursMatn(b.kursNomi)} · `}
                  {t("testlarBobIzoh", { d: b.dars, s: OLCHAM.bob.savol })}
                </span>
              </span>
              <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
            </button>
          );
        })}
      </div>

      {sorov && (
        <Tasdiq
          uzunlik={sorov.uzunlik}
          onBoshla={() => { setTanlov(sorov); setSorov(null); }}
          onBekor={() => setSorov(null)}
        />
      )}
    </div>
  );
}

/* ==================== uzun testdan oldin ==================== */

/**
 * "Yarim soat vaqting bormi?" — to'liq blokdan oldingi savol.
 *
 * Bu ogohlantirish emas, KELISHUV. Imtihonning butun ma'nosi uzluksiz
 * yarim soatda: o'rtasida to'xtatilgan test na ball beradi, na
 * mashq bo'ladi. Shu sabab matnda ikkita fakt aniq turadi — nechta
 * savol va necha daqiqa.
 *
 * "Boshlash" birinchi va katta, "Keyinroq" esa quyida va xira. Bu
 * `Chiqish` oynasidagi tartibning teskarisi va shunday bo'lishi
 * kerak: u yerda xavfsiz javob "qolish" edi, bu yerda esa odam
 * allaqachon boshlashni tanlab bosgan.
 */
function Tasdiq({ uzunlik, onBoshla, onBekor }: {
  uzunlik: Uzunlik;
  onBoshla: () => void;
  onBekor: () => void;
}) {
  const o = OLCHAM[uzunlik];
  return (
    <div
      className="az-kanal-fon fixed inset-0 z-[80] grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="az-tasdiq-sarlavha"
      /* Fonga bosilsa BEKOR bo'ladi: e'tiborsiz bosish yarim soatlik
         majburiyatni boshlab yubormasligi kerak. */
      onClick={onBekor}
    >
      <div
        className="az-kanal w-full max-w-[340px] rounded-clay bg-karta p-6 text-center shadow-clay"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-brand-blue text-white
                         shadow-[0_6px_0_var(--color-brand-blue-d)]">
          <Icon name="clock" size={26} />
        </span>

        <h2 id="az-tasdiq-sarlavha" className="mt-4 font-display text-[19px] leading-tight">
          {t("tasdiqSarlavha", { d: o.daqiqa })}
        </h2>
        <p className="mt-2 text-[13px] leading-snug text-ink-soft">
          {t("tasdiqIzoh", { s: o.savol, d: o.daqiqa })}
        </p>

        <button type="button" onClick={() => { tebrat("tanlov"); onBoshla(); }}
          className="clay-press mt-5 h-12 w-full rounded-3xl bg-brand-green font-display text-[15px]
                     text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
          {t("tasdiqBoshla")}
        </button>
        <button type="button" onClick={onBekor}
          className="clay-press mt-2 h-11 w-full rounded-3xl bg-track font-display text-[14px] text-ink-soft">
          {t("tasdiqKeyinroq")}
        </button>
      </div>
    </div>
  );
}
