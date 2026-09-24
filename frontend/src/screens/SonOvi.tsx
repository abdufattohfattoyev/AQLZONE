/**
 * SON OVI — ekran.
 *
 * To'rtta karta, bitta maqsad (24). Ikkita kartani tanlab amal bosasiz —
 * ular o'rniga natija turadi. To'rtala karta ishlatilib, oxirida 24
 * qolsa — jumboq yechildi.
 *
 * ─────────────── NEGA KARTA BIRLASHTIRISH ───────────────
 *
 * Qavsli ifodani telefonda yozish og'ir va xatoga to'la. Birlashtirish
 * esa qavslarni O'ZI hosil qiladi: `(8−3)×(6−1)` bu yerda shunchaki
 * to'rtta bosish. Bola qavs haqida o'ylamaydi, u faqat "qaysi ikkitasi
 * foyda beradi" deb o'ylaydi — aynan shu hisob-kitob.
 *
 * ─────────────── KUNLIK TO'PLAM ───────────────
 *
 * Har kuni beshta jumboq, hammaga bir xil (`kunlikToplam`). Tugagach
 * cheksiz rejim ochiladi — ya'ni o'yin "bugun tugadi" deb yopilmaydi,
 * lekin qaytib kelishga sabab ham qoladi.
 */
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { useProgress } from "../lib/progress";
import { kunKaliti } from "../lib/zanjir";
import { DARAJALAR, darajaMa } from "../lib/oyin/tur";
import type { Daraja } from "../lib/oyin/tur";
import {
  AMALLAR, SOZLAMA, amalBelgisi, birlashtir, kunlikToplam, maslahat, tasodifiyJumboq,
} from "../lib/oyin/sonOvi";
import type { Amal } from "../lib/oyin/sonOvi";

const KALIT = "az-son-ovi";
const QANDAY_KALIT = "az-son-ovi-qanday";

/** Kunlik to'plamdagi jumboqlar soni. */
const TOPLAM = 5;

/** Bitta karta — qiymati va O'ZGARMAS raqami (React ro'yxati uchun). */
interface Karta { id: number; v: number }

interface Xotira { kun: string; tugagan: Partial<Record<Daraja, number>>; daraja?: Daraja }

function oqi(): Xotira {
  try {
    const x = JSON.parse(localStorage.getItem(KALIT) || "{}") as Partial<Xotira>;
    if (x.kun !== kunKaliti()) return { kun: kunKaliti(), tugagan: {}, daraja: x.daraja };
    return { kun: x.kun, tugagan: x.tugagan ?? {}, daraja: x.daraja };
  } catch { return { kun: kunKaliti(), tugagan: {} }; }
}

function yoz(x: Xotira) {
  try { localStorage.setItem(KALIT, JSON.stringify(x)); } catch { /* jim */ }
}

/** Bugun shu darajada nechta jumboq yechilgan — O'yinlar kartasi uchun. */
export function sonOviBugun(): number {
  const x = oqi();
  return Object.values(x.tugagan).reduce((a, b) => a + (b ?? 0), 0);
}

/** O'rgatish namunasi: 4 6 2 3 → 24 (uch qadam). */
const NAMUNA: { a: number; b: number; amal: Amal; natija: number; qoldiq: number[] }[] = [
  { a: 3, b: 2, amal: "-", natija: 1, qoldiq: [4, 6, 1] },
  { a: 6, b: 4, amal: "*", natija: 24, qoldiq: [24, 1] },
  { a: 24, b: 1, amal: "*", natija: 24, qoldiq: [24] },
];

export function SonOvi({ onChiq }: { onChiq: () => void }) {
  useOrqaga(onChiq);
  const { oyinTugadi } = useProgress();
  const kun = kunKaliti();

  const [xotira, setXotira] = useState<Xotira>(oqi);
  const [daraja, setDaraja] = useState<Daraja>(() => oqi().daraja ?? 2);
  const [qanday, setQanday] = useState(() => {
    try { return !localStorage.getItem(QANDAY_KALIT); } catch { return false; }
  });
  const [namunaQadam, setNamunaQadam] = useState(0);

  const maqsad = SOZLAMA[daraja].maqsad;
  const toplam = useMemo(() => kunlikToplam(kun, daraja, TOPLAM), [kun, daraja]);

  /** Bugun shu darajada nechtasi tugagan — kunlik to'plamdagi o'rin. */
  const tugagan = xotira.tugagan[daraja] ?? 0;
  const cheksiz = tugagan >= TOPLAM;

  const [boshlangich, setBoshlangich] = useState<number[]>(() => toplam[0]);
  const [kartalar, setKartalar] = useState<Karta[]>([]);
  const [tarix, setTarix] = useState<Karta[][]>([]);
  const [tanlangan, setTanlangan] = useState<number | null>(null);
  const [amal, setAmal] = useState<Amal | null>(null);
  // Maslahat KARTA RAQAMI bilan saqlanadi, qiymat bilan emas: qo'lda
  // ikkita bir xil son bo'lsa (masalan 9 va 9), qiymat bo'yicha
  // belgilash uchala kartani yoritib yuborardi.
  const [maslahatQadam, setMaslahatQadam] = useState<{ idlar: number[]; amal: Amal } | null>(null);
  const [yutdi, setYutdi] = useState(false);
  const [boshAt, setBoshAt] = useState(() => Date.now());
  const [sekund, setSekund] = useState(0);

  /** Jumboqni qo'yish — daraja almashganda ham, keyingisiga o'tganda ham. */
  const jumboqQoy = (sonlar: number[]) => {
    setBoshlangich(sonlar);
    setKartalar(sonlar.map((v, i) => ({ id: i + 1, v })));
    setTarix([]);
    setTanlangan(null);
    setAmal(null);
    setMaslahatQadam(null);
    setYutdi(false);
    setBoshAt(Date.now());
    setSekund(0);
  };

  // Daraja almashsa yoki kun o'zgarsa — o'sha darajaning navbatdagi jumboqi.
  useEffect(() => {
    const n = xotira.tugagan[daraja] ?? 0;
    jumboqQoy(n < TOPLAM ? toplam[n] : tasodifiyJumboq(daraja));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daraja, kun]);

  // Sekundomer — faqat yechilmagan jumboqda yuradi.
  useEffect(() => {
    if (yutdi) return;
    const id = setInterval(() => setSekund(Math.floor((Date.now() - boshAt) / 1000)), 500);
    return () => clearInterval(id);
  }, [yutdi, boshAt]);

  const darajaTanla = (d: Daraja) => {
    setDaraja(d);
    const yangi = { ...xotira, daraja: d };
    setXotira(yangi);
    yoz(yangi);
  };

  /** Ikki kartani birlashtirish — o'yinning yagona harakati. */
  const birlash = (ikkinchi: Karta) => {
    const birinchi = kartalar.find((k) => k.id === tanlangan);
    if (!birinchi || !amal || birinchi.id === ikkinchi.id) return;
    const n = birlashtir(birinchi.v, ikkinchi.v, amal);
    if (n === null) {                       // qoldiqli yoki nolga bo'lish
      tebrat("xato");
      setAmal(null);
      return;
    }
    const qolgan = kartalar.filter((k) => k.id !== birinchi.id && k.id !== ikkinchi.id);
    const yangi = [...qolgan, { id: Math.max(...kartalar.map((k) => k.id)) + 1, v: n }];
    setTarix([...tarix, kartalar]);
    setKartalar(yangi);
    setTanlangan(null);
    setAmal(null);
    setMaslahatQadam(null);
    tebrat("togri");

    if (yangi.length === 1) {
      if (yangi[0].v === maqsad) {
        setYutdi(true);
        tebrat("yutuq");
        const vaqt = Math.max(1, Math.round((Date.now() - boshAt) / 1000));
        setSekund(vaqt);
        // Tez yechilsa ko'proq tanga: 3 dan 8 gacha.
        oyinTugadi(Math.max(3, 8 - Math.floor(vaqt / 30)), 1);
        const yangiXotira: Xotira = {
          ...xotira, kun,
          tugagan: { ...xotira.tugagan, [daraja]: Math.min(TOPLAM, tugagan + 1) },
        };
        setXotira(yangiXotira);
        yoz(yangiXotira);
      } else {
        tebrat("xato");
      }
    }
  };

  const kartaBos = (k: Karta) => {
    if (yutdi) return;
    if (tanlangan === k.id) { setTanlangan(null); setAmal(null); return; }
    if (tanlangan === null || !amal) { setTanlangan(k.id); tebrat("tanlov"); return; }
    birlash(k);
  };

  const bekor = () => {
    if (!tarix.length) return;
    setKartalar(tarix[tarix.length - 1]);
    setTarix(tarix.slice(0, -1));
    setTanlangan(null);
    setAmal(null);
    setYutdi(false);
    tebrat("tanlov");
  };

  const boshidan = () => jumboqQoy(boshlangich);

  const maslahatOl = () => {
    const q = maslahat(kartalar.map((k) => k.v), maqsad, SOZLAMA[daraja].manfiysiz);
    if (!q) { tebrat("xato"); return; }
    const birinchi = kartalar.find((k) => k.v === q.a);
    const ikkinchi = kartalar.find((k) => k.v === q.b && k.id !== birinchi?.id);
    if (!birinchi || !ikkinchi) { tebrat("xato"); return; }
    setMaslahatQadam({ idlar: [birinchi.id, ikkinchi.id], amal: q.amal });
    tebrat("tanlov");
  };

  const keyingi = () => {
    const n = xotira.tugagan[daraja] ?? 0;
    jumboqQoy(n < TOPLAM ? toplam[n] : tasodifiyJumboq(daraja));
  };

  /**
   * Karta o'lchami ekrandan hisoblanadi: to'rttasi BIR QATORDA tursin
   * va pastdagi boshqaruv ham ko'rinib qolsin.
   *
   * Eni bo'yicha: (oyna − chetlar − oraliqlar) / 4.
   * Balandligi bo'yicha: sarlavha, amallar va tugmalardan qolgan joy
   * (karta balandligi enidan 1.18 barobar katta).
   */
  const olcham = {
    "--karta": "clamp(52px, min((100vw - 46px) / 4, (var(--az-ekran) - 420px) / 1.18), 96px)",
  } as CSSProperties;

  const maslahatda = (k: Karta) => maslahatQadam?.idlar.includes(k.id) ?? false;

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-3 pt-4 pb-4
                    [@media(max-height:640px)]:pt-1.5 sm:max-w-[520px]">
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={onChiq} title={t("ortga")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-full bg-karta text-ink-soft
                     shadow-clay-sm [@media(max-height:640px)]:size-9">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[19px] leading-tight [@media(max-height:640px)]:text-[16px]">{t("sonOvi")}</h1>
          <p className="text-[12px] text-ink-soft">
            {cheksiz ? t("soCheksiz") : t("soToplam", { n: Math.min(tugagan + 1, TOPLAM), jami: TOPLAM })}
            {" · "}{t("soVaqt", { n: sekund })}
          </p>
        </div>
        <button type="button" onClick={() => { setNamunaQadam(0); setQanday(true); }} aria-label={t("soQandayT")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-full bg-karta font-display
                     text-[18px] text-brand-blue shadow-clay-sm [@media(max-height:640px)]:size-9">?</button>
      </div>

      <div className="mt-2.5 flex shrink-0 rounded-full bg-track p-1
                      [@media(max-height:640px)]:mt-1.5" role="tablist">
        {DARAJALAR.map((d) => (
          <button key={d.n} type="button" role="tab" aria-selected={daraja === d.n}
            onClick={() => darajaTanla(d.n)}
            className={`flex-1 rounded-full py-2 font-display text-[14px] [@media(max-height:640px)]:py-1 ${
              daraja === d.n ? "bg-karta text-ink shadow-clay-sm" : "text-ink-soft"}`}>
            {t(d.nom)}
          </button>
        ))}
      </div>

      {/* Maqsad — ekranning eng ko'zga tashlanadigan joyida. */}
      <div className="mt-3 flex shrink-0 items-center justify-center gap-2 [@media(max-height:640px)]:mt-2">
        <span className="text-[11.5px] tracking-widest text-ink-soft uppercase">{t("soMaqsad")}</span>
        <span className="font-display text-[26px] text-brand-gold [@media(max-height:640px)]:text-[22px]">{maqsad}</span>
      </div>

      {/* ---- kartalar ---- */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3" style={olcham}>
        <div className="flex items-center justify-center gap-2.5">
          {kartalar.map((k) => (
            <button key={k.id} type="button" onClick={() => kartaBos(k)}
              style={{ width: "var(--karta)", height: "calc(var(--karta) * 1.18)" }}
              className={`clay-press grid place-items-center rounded-clay font-display transition-all
                          ${tanlangan === k.id
                            ? "bg-brand-blue text-white shadow-clay ring-2 ring-white/40"
                            : maslahatda(k)
                              ? "bg-karta text-ink shadow-clay-sm ring-2 ring-brand-gold"
                              : "bg-karta text-ink shadow-clay-sm"}`}>
              <span style={{ fontSize: "calc(var(--karta) * .42)" }}>{k.v}</span>
            </button>
          ))}
        </div>

        {/* Amallar — ikkinchi kartani bosishdan oldin tanlanadi. */}
        <div className="flex items-center gap-2">
          {AMALLAR.map((a) => (
            <button key={a} type="button"
              onClick={() => { if (!yutdi) { setAmal(amal === a ? null : a); tebrat("tanlov"); } }}
              disabled={tanlangan === null || yutdi}
              className={`clay-press grid size-12 place-items-center rounded-2xl font-display text-[22px]
                          shadow-clay-sm transition-colors disabled:opacity-35
                          [@media(max-height:640px)]:size-10 [@media(max-height:640px)]:text-[19px]
                          ${amal === a ? "bg-brand-green text-white" : "bg-karta text-brand-blue"}
                          ${maslahatQadam?.amal === a ? "ring-2 ring-brand-gold" : ""}`}>
              {amalBelgisi(a)}
            </button>
          ))}
        </div>

        <p className="min-h-[18px] px-2 text-center text-[12.5px] leading-snug text-ink-soft">
          {yutdi ? "" : tanlangan === null ? t("soYoriq1") : amal === null ? t("soYoriq2") : t("soYoriq3")}
        </p>
      </div>

      {/* ---- natija yoki boshqaruv ---- */}
      {yutdi ? (
        <div className="shrink-0 rounded-clay bg-karta p-4 text-center shadow-clay-sm">
          <EmojiBelgi e="🎯" olcham={36} className="mx-auto" />
          <div className="mt-1 font-display text-[19px]">{t("soTopdingiz", { n: sekund })}</div>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            {cheksiz ? t("soCheksizIzoh") : t("soQoldi", { n: TOPLAM - tugagan })}
          </p>
          <button type="button" onClick={keyingi} data-tahlil="Son ovi: keyingi"
            className="tugma-3d mt-3 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[16px] text-white
                       shadow-[0_5px_0_var(--color-brand-green-d)]">
            {t("soKeyingi")}
          </button>
        </div>
      ) : (
        <div className="grid shrink-0 grid-cols-3 gap-2">
          <button type="button" onClick={bekor} disabled={!tarix.length} data-tahlil="Son ovi: bekor"
            className="clay-press rounded-2xl bg-karta py-3 font-display text-[13.5px] text-ink-soft
                       shadow-clay-sm disabled:opacity-40">
            {t("soBekor")}
          </button>
          <button type="button" onClick={boshidan} data-tahlil="Son ovi: boshidan"
            className="clay-press rounded-2xl bg-karta py-3 font-display text-[13.5px] text-ink-soft shadow-clay-sm">
            {t("soBoshidan")}
          </button>
          <button type="button" onClick={maslahatOl} data-tahlil="Son ovi: maslahat"
            className="clay-press rounded-2xl bg-brand-gold/15 py-3 font-display text-[13.5px] text-brand-gold
                       shadow-clay-sm">
            {t("soMaslahat")}
          </button>
        </div>
      )}

      {/* ---- namuna: qoida gap bilan emas, misol bilan ---- */}
      {qanday && (
        <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-black/50 p-4"
          role="dialog" aria-modal="true">
          <div className="az-kirish my-auto w-full max-w-[380px] rounded-clay bg-sahna p-5 shadow-clay
                          [@media(max-height:640px)]:p-3.5">
            <h2 className="text-center text-[20px]">{t("soQandayT")}</h2>
            <p className="mt-1.5 text-center text-[13.5px] leading-snug text-ink-soft">
              {t("soQanday1", { maqsad })}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {(namunaQadam === 0 ? [4, 6, 2, 3] : NAMUNA[namunaQadam - 1].qoldiq).map((v, i) => (
                <span key={i} className="grid size-12 place-items-center rounded-2xl bg-karta font-display
                                         text-[20px] shadow-clay-sm [@media(max-height:640px)]:size-10">
                  {v}
                </span>
              ))}
            </div>

            <div className="mt-3 rounded-clay bg-karta p-3 [@media(max-height:640px)]:p-2.5">
              <div className="font-display text-[14.5px] leading-tight">
                {namunaQadam === 0
                  ? t("soN0")
                  : `${NAMUNA[namunaQadam - 1].a} ${amalBelgisi(NAMUNA[namunaQadam - 1].amal)} `
                    + `${NAMUNA[namunaQadam - 1].b} = ${NAMUNA[namunaQadam - 1].natija}`}
              </div>
              <p className="mt-1 text-[13px] leading-snug text-ink-soft">
                {t((["soN0Izoh", "soN1Izoh", "soN2Izoh", "soN3Izoh"] as const)[namunaQadam])}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} aria-hidden
                    className={`h-1.5 flex-1 rounded-full ${i <= namunaQadam ? "bg-brand-green" : "bg-track"}`} />
                ))}
              </div>
              <span className="shrink-0 text-[12px] text-ink-soft">{namunaQadam + 1}/4</span>
            </div>

            <button type="button"
              onClick={() => {
                if (namunaQadam < 3) { setNamunaQadam(namunaQadam + 1); return; }
                setQanday(false);
                try { localStorage.setItem(QANDAY_KALIT, "1"); } catch { /* jim */ }
              }}
              className="tugma-3d mt-3 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[17px] text-white
                         shadow-[0_5px_0_var(--color-brand-green-d)] [@media(max-height:640px)]:py-2.5">
              {namunaQadam < 3 ? t("ksKeyingi") : t("ksBoshladik")}
            </button>
            {namunaQadam < 3 && (
              <button type="button"
                onClick={() => {
                  setQanday(false);
                  try { localStorage.setItem(QANDAY_KALIT, "1"); } catch { /* jim */ }
                }}
                className="mt-2 w-full py-1 text-[12.5px] text-ink-soft">
                {t("ksOtkaz")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Daraja nomini tashqariga ham beramiz — O'yinlar kartasi uchun. */
export const sonOviDaraja = darajaMa;
