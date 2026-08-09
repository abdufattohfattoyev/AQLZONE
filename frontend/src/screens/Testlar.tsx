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
import { OLCHAM, bobBali, sinfBoblari, sinfKurslari } from "../lib/blok";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import { tebrat, useOrqaga } from "../lib/qobiq";

/** Ayni paytda ochilgan test. */
interface Tanlov {
  uzunlik: Uzunlik;
  qamrov: Qamrov;
  bobNomi?: string;
}

export function Testlar({ sinf, onBack, onHisobot }: {
  sinf: number;
  onBack: () => void;
  onHisobot: () => void;
}) {
  const [tanlov, setTanlov] = useState<Tanlov | null>(null);
  const ozStrelka = useOrqaga(onBack);

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
        onExit={() => setTanlov(null)}
      />
    );
  }

  const boshla = (x: Tanlov) => { tebrat("tanlov"); setTanlov(x); };

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

      {/* ---- butun sinf bo'yicha ----
          Yuqorida turadi, chunki bu asosiy mashq: imtihonda savollar
          aralash keladi va qaysi mavzudan ekani aytilmaydi. */}
      <h2 className="az-kirish mt-5 mb-2 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("testlarAralash")}
      </h2>
      <div className="az-kirish space-y-2">
        {(["toliq", "qisqa"] as const).map((u) => (
          <button key={u} type="button"
            onClick={() => boshla({ uzunlik: u, qamrov: { tur: "hammasi" } })}
            className="tugma-3d flex w-full items-center gap-3 rounded-clay bg-karta p-3.5 text-left shadow-clay-sm">
            <span className={`grid size-10 shrink-0 place-items-center rounded-2xl text-white
              ${u === "toliq" ? "bg-brand-purple" : "bg-brand-blue"}`}>
              <Icon name={u === "toliq" ? "trophy" : "flame"} size={19} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[15px] leading-tight">
                {t(u === "toliq" ? "blokToliq" : "blokQisqa")}
              </span>
              <span className="mt-0.5 block text-[12px] text-ink-dim">
                {t("blokOlcham", { s: OLCHAM[u].savol, d: OLCHAM[u].daqiqa })}
              </span>
            </span>
            <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
          </button>
        ))}
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
    </div>
  );
}
