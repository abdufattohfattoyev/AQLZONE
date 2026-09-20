/**
 * KUNLIK SON — ekran (`lib/oyin/kunlikSon.ts`).
 *
 * Tepada daraja, o'rtada 6 qator katakcha, pastda o'z klaviaturasi.
 * Tizim klaviaturasi ATAYLAB ishlatilmaydi: telefonda u ekranning yarmini
 * yopadi, `×` va `÷` belgilari esa unda umuman yo'q.
 *
 * Natija qurilmada saqlanadi (kun + daraja bo'yicha) — sahifa yopilib
 * ochilsa ham urinishlar joyida. Kuniga har darajada bitta o'yin.
 */
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { havolaniOch, tebrat, useOrqaga } from "../lib/qobiq";
import { botNomi, kunlikHolat, kunlikNatija, kunlikRoyxat, kunlikUlash } from "../lib/api";
import type { KunlikHolat, KunlikRoyxat } from "../lib/api";
import { useProgress } from "../lib/progress";
import { kunKaliti, kunOldin } from "../lib/zanjir";
import { DARAJALAR, darajaMa } from "../lib/oyin/tur";
import type { Daraja } from "../lib/oyin/tur";
import {
  URINISH, jumboq, jumboqRaqami, korinish, solishtir, tekshir, ulashKvadratlar, uzunlik,
} from "../lib/oyin/kunlikSon";
import type { Rang } from "../lib/oyin/kunlikSon";

const KALIT = "az-kunlik-son";
const QANDAY_KALIT = "az-kunlik-son-qanday";

interface Yozuv {
  urinishlar: string[]; tugadi: boolean; yutdi: boolean; tanga?: boolean;
  /** Birinchi urinish boshlangan payt (ms). Ro'yxatdagi vaqt shundan. */
  boshAt?: number;
  /** Serverga yozildimi — qayta ulanganda ikkinchi marta yuborilmasin. */
  yuborildi?: boolean;
}
interface Xotira {
  kunlar: Record<string, Partial<Record<Daraja, Yozuv>>>;
  daraja?: Daraja;
}

function oqi(): Xotira {
  try {
    const x = JSON.parse(localStorage.getItem(KALIT) || "{}") as Partial<Xotira>;
    return { kunlar: x.kunlar ?? {}, daraja: x.daraja };
  } catch { return { kunlar: {} }; }
}

function yoz(x: Xotira) {
  // Faqat oxirgi 60 kun — xotira cheksiz o'smasin.
  const kunlar = Object.fromEntries(Object.entries(x.kunlar).sort().slice(-60));
  try { localStorage.setItem(KALIT, JSON.stringify({ ...x, kunlar })); } catch { /* jim */ }
}

/** Bugun istalgan darajada yechilganmi — O'yinlar kartasi uchun. */
export function kunlikSonBugun(): boolean {
  const k = oqi().kunlar[kunKaliti()];
  return Boolean(k && Object.values(k).some((y) => y?.yutdi));
}

/** Ketma-ket yechilgan kunlar (bugun yoki kechadan boshlab). */
function zanjir(x: Xotira): number {
  const yechilganmi = (kun: string) => Object.values(x.kunlar[kun] ?? {}).some((y) => y?.yutdi);
  let n = yechilganmi(kunKaliti()) ? 0 : 1;
  let soni = 0;
  while (yechilganmi(kunOldin(n))) { soni++; n++; }
  return soni;
}

const RANG_KLASS: Record<Rang, string> = {
  yashil: "bg-brand-green text-white",
  oltin: "bg-brand-gold text-white",
  boz: "bg-ink-dim/40 text-white",
};

const TUGMALAR = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "+", "-", "*", "/", "="];

/**
 * O'RGANISH YO'LI — to'rt bosqich.
 *
 * Birinchi marta ochgan odam bo'sh katakchalarni ko'radi va nima
 * qilishni bilmaydi: kanaldagi tugmadan kelgan odam aynan shu yerda
 * chiqib ketadi. Qoidalar oynasi bor edi, lekin u BIR MARTA
 * ko'rsatiladi va yopilgandan keyin ekranda hech qanday yo'riq
 * qolmasdi.
 *
 * Shuning uchun yo'riq endi doimiy va HOLATGA QARAB o'zgaradi:
 * birinchi urinishdan oldin — "istalgan to'g'ri tenglikni yozing",
 * urinishdan keyin — ranglarning ma'nosi, yechgandan keyin — zanjir.
 * Bosqichlar tepada nuqta bo'lib turadi, ya'ni odam yo'lning qayerida
 * ekanini ko'radi.
 */
type Bosqich = { kalit: Kalit; izoh: Kalit };
const YOL: Bosqich[] = [
  { kalit: "ksYol1", izoh: "ksYol1Izoh" },
  { kalit: "ksYol2", izoh: "ksYol2Izoh" },
  { kalit: "ksYol3", izoh: "ksYol3Izoh" },
  { kalit: "ksYol4", izoh: "ksYol4Izoh" },
];

export function KunlikSon({ onChiq }: { onChiq: () => void }) {
  useOrqaga(onChiq);
  const { oyinTugadi } = useProgress();
  const kun = kunKaliti();
  const [xotira, setXotira] = useState<Xotira>(oqi);
  const [daraja, setDaraja] = useState<Daraja>(() => oqi().daraja ?? 2);
  const [joriy, setJoriy] = useState("");
  const [xato, setXato] = useState("");
  const [qanday, setQanday] = useState(() => {
    try { return !localStorage.getItem(QANDAY_KALIT); } catch { return false; }
  });
  // Zanjir va ro'yxat SERVERDAN keladi: telefon xotirasidagi zanjir
  // ilova o'chirilganda yo'qolardi, boshqalarning natijasini esa u
  // umuman bilmaydi.
  const [server, setServer] = useState<KunlikHolat | null>(null);
  const [royxat, setRoyxat] = useState<KunlikRoyxat | null>(null);
  const [joy, setJoy] = useState<number | null>(null);
  const [ulashHolat, setUlashHolat] = useState<"" | "ketmoqda" | "yuborildi" | "xato">("");

  useEffect(() => {
    let tirik = true;
    void (async () => {
      try {
        const h = await kunlikHolat();
        if (tirik) setServer(h);
      } catch { /* aloqa yo'q — qurilmadagi zanjir ko'rsatiladi */ }
    })();
    return () => { tirik = false; };
  }, []);

  /** Bugungi eng tezlar — faqat kerak bo'lganda so'raladi. */
  const royxatniOl = async () => {
    try { setRoyxat(await kunlikRoyxat()); } catch { /* jim */ }
  };

  // Jumboq allaqachon yechilgan bo'lsa (ekran qayta ochildi) — ro'yxat
  // darhol kerak: odam shu yerga natijasini ko'rish uchun qaytadi.
  const tugagan = xotira.kunlar[kun]?.[daraja]?.tugadi ?? false;
  useEffect(() => {
    if (tugagan && !royxat) void royxatniOl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tugagan]);

  const n = uzunlik(daraja);
  const yechim = useMemo(() => jumboq(kun, daraja), [kun, daraja]);
  const yozuv: Yozuv = xotira.kunlar[kun]?.[daraja] ?? { urinishlar: [], tugadi: false, yutdi: false };

  useEffect(() => { setJoriy(""); setXato(""); }, [daraja]);

  const saqla = (y: Yozuv, d = daraja) => {
    const yangi: Xotira = { ...xotira, daraja: d, kunlar: { ...xotira.kunlar, [kun]: { ...xotira.kunlar[kun], [d]: y } } };
    setXotira(yangi);
    yoz(yangi);
  };

  const darajaTanla = (d: Daraja) => {
    setDaraja(d);
    const yangi = { ...xotira, daraja: d };
    setXotira(yangi);
    yoz(yangi);
  };

  /* ---- klaviatura ---- */
  const bos = (b: string) => {
    if (yozuv.tugadi) return;
    setXato("");
    if (b === "⌫") { setJoriy((s) => s.slice(0, -1)); return; }
    if (b === "ok") { yubor(); return; }
    if (joriy.length < n) {
      tebrat("tanlov");
      if (!yozuv.boshAt) saqla({ ...yozuv, boshAt: Date.now() });
      setJoriy(joriy + b);
    }
  };

  const yubor = () => {
    const x = tekshir(joriy, n);
    if (x) { setXato(t(`ksXato_${x}` as Kalit)); tebrat("xato"); return; }
    const urinishlar = [...yozuv.urinishlar, joriy];
    const yutdi = joriy === yechim;
    const tugadi = yutdi || urinishlar.length >= URINISH;
    let tanga = yozuv.tanga;
    if (tugadi && !tanga) {
      // Kam urinish — ko'p tanga. Yechilmasa ham ozgina: harakat qildi.
      oyinTugadi(yutdi ? 6 + (URINISH - urinishlar.length) * 2 : 2, urinishlar.length);
      tanga = true;
    }
    const boshAt = yozuv.boshAt ?? Date.now();
    saqla({ urinishlar, tugadi, yutdi, tanga, boshAt, yuborildi: yozuv.yuborildi });
    setJoriy("");
    tebrat(yutdi ? "yutuq" : tugadi ? "xato" : "togri");
    if (tugadi && !yozuv.yuborildi) {
      // Serverga FAQAT tugagach yuboriladi va faqat bir marta: zanjir,
      // ro'yxat va botning kechki xabari shu yozuvdan oziqlanadi.
      const sekund = Math.max(1, Math.round((Date.now() - boshAt) / 1000));
      void (async () => {
        try {
          const j = await kunlikNatija(daraja, urinishlar, sekund);
          setServer(j);
          setJoy(j.joy);
          saqla({ urinishlar, tugadi, yutdi, tanga, boshAt, yuborildi: true });
          void royxatniOl();
        } catch { /* aloqa yo'q: natija qurilmada qoldi, zanjir ertaga tiklanadi */ }
      })();
    }
  };

  // Jismoniy klaviatura (kompyuter).
  useEffect(() => {
    const tut = (e: KeyboardEvent) => {
      if (qanday) return;
      const k = e.key === "x" || e.key === "X" ? "*" : e.key === ":" ? "/" : e.key;
      if (TUGMALAR.includes(k)) bos(k);
      else if (e.key === "Backspace") bos("⌫");
      else if (e.key === "Enter") bos("ok");
    };
    window.addEventListener("keydown", tut);
    return () => window.removeEventListener("keydown", tut);
  });

  /* ---- klaviatura ranglari: har belgining eng yaxshi holati ---- */
  const tugmaRangi = useMemo(() => {
    const eng: Record<string, Rang> = {};
    const kuch: Record<Rang, number> = { boz: 0, oltin: 1, yashil: 2 };
    for (const u of yozuv.urinishlar) {
      solishtir(u, yechim).forEach((r, i) => {
        const b = u[i];
        if (!eng[b] || kuch[r] > kuch[eng[b]]) eng[b] = r;
      });
    }
    return eng;
  }, [yozuv.urinishlar, yechim]);

  /** Eski yo'l: matnli kvadratchalar (kartochka yuborilmasa). */
  const matnliUlash = async () => {
    const bot = await botNomi();
    const natija = yozuv.yutdi ? `${yozuv.urinishlar.length}/6` : "X/6";
    const matn = `${t("ksUlashMatn", { n: jumboqRaqami(kun), daraja: t(darajaMa(daraja).nom), natija })}\n\n`
      + ulashKvadratlar(yozuv.urinishlar, yechim);
    const havola = bot ? `https://t.me/${bot}?start=kunlik` : location.origin;
    havolaniOch(`https://t.me/share/url?url=${encodeURIComponent(havola)}&text=${encodeURIComponent(matn)}`);
  };

  /**
   * Ulashish — natija KARTOCHKASI botga yuboriladi.
   *
   * Matn ko'rinishidagi kvadratchalar sinf guruhida ko'zga tashlanmaydi
   * (30 kunda tugma bir marta bosilgan). Rasm esa o'zi ko'rinadi va
   * ostida havola turadi. Bot faqat o'yinchining O'Z suhbatiga yozadi,
   * guruhga odam uni o'zi yo'naltiradi.
   */
  /**
   * Hozirgi bosqich: 0 — birinchi urinish, 1 — ranglar, 2 — g'alaba,
   * 3 — zanjir. Bosqich holatdan hisoblanadi, alohida saqlanmaydi:
   * saqlansa, qurilma almashganda yo'l boshidan boshlanardi.
   */
  const bosqich = (() => {
    if (yozuv.tugadi) return 3;                 // yechildi (yoki urinishlar tugadi)
    if (yozuv.urinishlar.length === 0) return 0;
    if (yozuv.urinishlar.length === 1) return 1;
    return 2;
  })();

  const ulash = async () => {
    if (ulashHolat === "ketmoqda") return;
    setUlashHolat("ketmoqda");
    try {
      await kunlikUlash();
      setUlashHolat("yuborildi");
    } catch {
      setUlashHolat("xato");
      await matnliUlash();
    }
  };

  /**
   * Katak va klaviatura o'lchovi — ekrandan hisoblanadi.
   *
   * Ilgari o'lcham qattiq yozilgan edi (`size-12`) va ikki joyda
   * buzilardi: tor oynada sakkizta katak eniga sig'masdi, past oynada
   * esa olti qator klaviaturani pastga itarib yuborardi — "Tekshirish"
   * tugmasi ekrandan chiqib ketardi.
   *
   * Endi ikkala o'lchov ham hisoblanadi va KICHIGI olinadi: eni bo'yicha
   * (oyna kengligi / katak soni) va balandligi bo'yicha (qolgan joy /
   * olti qator). Shuning uchun ekran qanday bo'lsa ham hammasi ko'rinadi.
   */
  const olcham = {
    "--kat-oraliq": "clamp(3px,0.7vh,6px)",
    "--kat": `clamp(24px, min(
      (100vw - 30px - (${n} - 1) * clamp(3px,0.7vh,6px)) / ${n},
      (var(--az-ekran) - 360px) / 6
    ), 52px)`,
    "--tugma-bal": "clamp(34px, 5.4vh, 48px)",
  } as CSSProperties;

  const qatorlar = Array.from({ length: URINISH }, (_, i): { belgilar: string[]; ranglar: (Rang | null)[] } => {
    if (i < yozuv.urinishlar.length) {
      const u = yozuv.urinishlar[i];
      return { belgilar: u.split(""), ranglar: solishtir(u, yechim) as (Rang | null)[] };
    }
    if (i === yozuv.urinishlar.length && !yozuv.tugadi) {
      return { belgilar: joriy.padEnd(n, " ").split(""), ranglar: Array(n).fill(null) };
    }
    return { belgilar: Array(n).fill(" "), ranglar: Array(n).fill(null) };
  });

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-3 pt-4 pb-4
                    [@media(max-height:640px)]:pt-1.5 [@media(max-height:640px)]:pb-1.5 sm:max-w-[520px]">
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={onChiq} title={t("ortga")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-full bg-karta text-ink-soft
                     shadow-clay-sm [@media(max-height:640px)]:size-9">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-[19px] leading-tight [@media(max-height:640px)]:text-[16px]">{t("kunlikSon")}</h1>
          <p className="text-[12px] text-ink-soft">
            {t("kunlikSonRaqam", { n: jumboqRaqami(kun), daraja: t(darajaMa(daraja).nom) })}
            {" · "}{t("ksZanjir", { n: server?.zanjir ?? zanjir(xotira) })}
          </p>
        </div>
        <button type="button" onClick={() => setQanday(true)} aria-label={t("ksQandayT")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-full bg-karta font-display
                     text-[18px] text-brand-blue shadow-clay-sm [@media(max-height:640px)]:size-9">?</button>
      </div>

      <div className="mt-2.5 flex shrink-0 rounded-full bg-track p-1
                      [@media(max-height:640px)]:mt-1.5" role="tablist">
        {DARAJALAR.map((d) => {
          const y = xotira.kunlar[kun]?.[d.n];
          return (
            <button key={d.n} type="button" role="tab" aria-selected={daraja === d.n}
              onClick={() => darajaTanla(d.n)}
              className={`flex-1 rounded-full py-2 font-display text-[14px] [@media(max-height:640px)]:py-1 ${
                daraja === d.n ? "bg-karta text-ink shadow-clay-sm" : "text-ink-soft"}`}>
              {t(d.nom)}{y?.yutdi ? " ✓" : ""}
            </button>
          );
        })}
      </div>

      {/* ---- o'rganish yo'li: hozir nima qilish kerak ---- */}
      <div className="mt-2.5 shrink-0 rounded-clay bg-karta px-3 py-2 shadow-clay-sm
                      [@media(max-height:640px)]:mt-1.5 [@media(max-height:640px)]:py-1.5">
        <div className="flex items-center gap-1.5">
          {YOL.map((b, i) => (
            <span key={b.kalit} aria-hidden
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < bosqich ? "bg-brand-green" : i === bosqich ? "bg-brand-gold" : "bg-track"}`} />
          ))}
        </div>
        <div className="mt-2 flex items-start gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-gold/20
                           font-display text-[12px] text-brand-gold">{bosqich + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[13.5px] leading-tight">{t(YOL[bosqich].kalit)}</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-ink-soft
                             [@media(max-height:640px)]:hidden">{t(YOL[bosqich].izoh)}</span>
          </span>
          <button type="button" onClick={() => setQanday(true)} data-tahlil="Kunlik son: qoidalar"
            className="clay-press shrink-0 rounded-full bg-sahna px-2.5 py-1 text-[11.5px] text-ink-soft">
            {t("ksQoidalar")}
          </button>
        </div>
      </div>

      {/* ---- katakchalar ---- */}
      <div className="mt-3 flex min-h-0 flex-1 flex-col items-center justify-center
                      gap-[var(--kat-oraliq)]" style={olcham}>
        {qatorlar.map((q, i) => (
          <div key={i} className="flex gap-[var(--kat-oraliq)]" aria-label={`${i + 1}`}>
            {q.belgilar.map((b, j) => {
              const r = q.ranglar[j];
              return (
                <span key={j}
                  style={{ width: "var(--kat)", height: "var(--kat)", fontSize: "calc(var(--kat) * .46)" }}
                  className={`grid place-items-center rounded-[calc(var(--kat)*.22)] font-display
                              ${r ? RANG_KLASS[r] : b.trim() ? "bg-karta text-ink ring-2 ring-brand-blue/40" : "bg-karta/60 text-ink"}`}>
                  {b.trim() ? korinish(b) : ""}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {xato && <p role="alert" className="mt-2 text-center text-[13.5px] text-brand-red">{xato}</p>}

      {yozuv.tugadi ? (
        <div className="mt-4 rounded-clay bg-karta p-4 text-center shadow-clay-sm">
          <EmojiBelgi e={yozuv.yutdi ? "🎉" : "💪"} olcham={40} className="mx-auto" />
          <div className="mt-1 font-display text-[19px]">
            {yozuv.yutdi ? t("ksTopdingiz", { n: yozuv.urinishlar.length }) : t("ksTopilmadi")}
          </div>
          {!yozuv.yutdi && (
            <div className="mt-1 font-display text-[18px] text-ink-soft">
              {t("ksJavob", { j: yechim.split("").map(korinish).join("") })}
            </div>
          )}
          {royxat && royxat.yechgan > 0 && (
            <p className="mt-1 text-[13px] text-ink-soft">
              {joy ? t("ksJoy", { y: royxat.yechgan, j: joy }) : t("ksYechgan", { y: royxat.yechgan })}
            </p>
          )}
          <button type="button" onClick={() => void ulash()} data-tahlil="Kunlik son: ulashish"
            disabled={ulashHolat === "ketmoqda"}
            className="tugma-3d mt-3 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[16px] text-white
                       shadow-[0_5px_0_var(--color-brand-green-d)] disabled:opacity-60">
            {ulashHolat === "yuborildi" ? t("ksUlashKetdi") : t("ksUlash")}
          </button>
          {ulashHolat === "yuborildi" && (
            <p className="mt-2 text-[12.5px] text-brand-green">{t("ksUlashIzoh")}</p>
          )}

          {/* Bugungi eng tezlar — "men ham urinib ko'ray" degan fikr shundan tug'iladi. */}
          {royxat && royxat.qatorlar.length > 0 && (
            <div className="mt-4 text-left">
              <div className="mb-1.5 text-[12px] font-semibold tracking-wide text-ink-soft uppercase">
                {t("ksTezlar")}
              </div>
              <ol className="grid gap-1">
                {royxat.qatorlar.slice(0, 5).map((q, i) => (
                  <li key={q.id}
                    className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[13.5px] ${
                      q.men ? "bg-brand-gold/15 ring-1 ring-brand-gold/40" : "bg-sahna"}`}>
                    <span className="w-5 shrink-0 text-center font-display text-ink-soft">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{q.ism}</span>
                    <span className="shrink-0 font-display text-ink-soft">
                      {t("ksUrinishQisqa", { n: q.urinish })} · {Math.round(q.sekund)}s
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <p className="mt-3 text-[12.5px] text-ink-soft">{t("ksErtaga")}</p>
        </div>
      ) : (
        <div className="mt-auto shrink-0 pt-2.5" style={olcham}>
          <div className="grid grid-cols-5 gap-1.5">
            {TUGMALAR.map((b) => (
              <button key={b} type="button" onClick={() => bos(b)}
                style={{ height: "var(--tugma-bal)" }}
                className={`clay-press rounded-xl font-display text-[clamp(15px,2.3vh,20px)] shadow-clay-sm ${
                  tugmaRangi[b] ? RANG_KLASS[tugmaRangi[b]] : "bg-karta text-ink"}`}>
                {korinish(b)}
              </button>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-5 gap-1.5">
            <button type="button" onClick={() => bos("⌫")} aria-label="⌫"
              style={{ height: "var(--tugma-bal)" }}
              className="clay-press col-span-2 rounded-xl bg-karta font-display
                         text-[clamp(15px,2.3vh,20px)] text-ink-soft shadow-clay-sm">
              ⌫
            </button>
            <button type="button" onClick={() => bos("ok")} data-tahlil="Kunlik son: tekshirish"
              style={{ height: "var(--tugma-bal)" }}
              className="clay-press col-span-3 rounded-xl bg-brand-blue font-display
                         text-[clamp(14px,2vh,16px)] text-white shadow-clay-sm">
              {t("ksTekshir")}
            </button>
          </div>
        </div>
      )}

      {qanday && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="az-kirish w-full max-w-[380px] rounded-clay bg-sahna p-5 shadow-clay">
            <h2 className="text-center text-[20px]">{t("ksQandayT")}</h2>
            <p className="mt-2 text-center text-[14px] leading-snug text-ink-soft">{t("ksQanday1")}</p>
            <div className="mt-4 flex justify-center gap-1.5">
              {["9", "+", "8", "=", "1", "7"].map((b, i) => {
                const r: Rang = i === 0 ? "yashil" : i === 2 ? "oltin" : "boz";
                return (
                  <span key={i} className={`grid size-10 place-items-center rounded-xl font-display text-[19px] ${
                    RANG_KLASS[r]}`}>{b}</span>
                );
              })}
            </div>
            <ul className="mt-4 space-y-1.5 text-[13.5px]">
              <li className="flex items-center gap-2"><span className="size-4 rounded bg-brand-green" />{t("ksQanday2")}</li>
              <li className="flex items-center gap-2"><span className="size-4 rounded bg-brand-gold" />{t("ksQanday3")}</li>
              <li className="flex items-center gap-2"><span className="size-4 rounded bg-ink-dim/40" />{t("ksQanday4")}</li>
              <li className="mt-2 text-ink-soft">{t("ksQanday5")}</li>
            </ul>
            <button type="button" onClick={() => {
              setQanday(false);
              try { localStorage.setItem(QANDAY_KALIT, "1"); } catch { /* jim */ }
            }}
              className="tugma-3d mt-5 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[17px] text-white
                         shadow-[0_5px_0_var(--color-brand-green-d)]">
              {t("ksBoshladik")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
