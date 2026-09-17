/**
 * JAMOAVIY O'YINLAR — xona ochish, kutish, o'yin va natija.
 *
 *   `JamoaOchish`  /oyinlar/jamoa/<oyin>  — qoida, daraja, "Xona ochish" yoki kod
 *   `XonaSahifa`   /xona/<kod>            — butun hayot: kutish → o'yin → natija
 *
 * ──────────────────── HAMMA TAYYOR BO'LSA BOSHLANADI ────────────────────
 *
 * "Boshlash" tugmasi YO'Q. Uni kim bosadi degan savol xonada janjal
 * chiqaradi, bosgan odam esa kimdir hali tayyor emasligini ko'rmay qolardi.
 * Har kim o'z "Tayyorman" ini bosadi va server hamma tayyor bo'lgan
 * lahzada o'yinni o'zi boshlaydi.
 *
 * ──────────────────── HOLAT SERVERDA ────────────────────
 *
 * Ekran holatni o'zi hisoblamaydi: har 1–2 soniyada serverdan oladi
 * (`core/xona.py`). Har amaldan keyin javobda YANGI holat keladi — shuning
 * uchun Royale'da keyingi savol so'rovni kutmasdan chiqadi.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Kutish } from "../components/Kutish";
import { Konfetti } from "../components/Konfetti";
import { Kartalar } from "../components/xona/Kartalar";
import { Royale } from "../components/xona/Royale";
import { Kodlar } from "../components/xona/Kodlar";
import { Seyf, SeyfYakun } from "../components/xona/Seyf";
import { Orgatish, orgatildimi } from "../components/xona/Orgatish";
import { avatarBelgi } from "../lib/dokon";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { havolaniOch, tebrat, useOrqaga } from "../lib/qobiq";
import { useProgress } from "../lib/progress";
import { tangaHisobi } from "../lib/oyin/rekord";
import { DARAJALAR } from "../lib/oyin/tur";
import type { Daraja } from "../lib/oyin/tur";
import {
  XonaXato, xonaAmal, xonaChiq, xonaGap, xonaKir, xonaOl, xonaRobot, xonaTayyor, xonaYana, xonaYarat,
} from "../lib/api";
import type { XonaHolat, XonaOyin } from "../lib/api";
import { XONA_OYINLAR } from "../lib/xonaOyinlar";


const DARAJA_KALIT = "az-xona-daraja";

function saqlanganDaraja(): Daraja {
  try {
    const n = Number(localStorage.getItem(DARAJA_KALIT));
    if (n === 1 || n === 2 || n === 3) return n;
  } catch { /* jim */ }
  return 2;
}

function darajaSaqla(d: Daraja) {
  try { localStorage.setItem(DARAJA_KALIT, String(d)); } catch { /* jim */ }
}

/** Xato kalitini odam o'qiydigan gapga aylantiradi. */
export function xatoMatni(e: unknown): string {
  const sabab = e instanceof XonaXato ? e.sabab : "";
  const kalit = `xonaXato_${sabab}` as Kalit;
  try {
    const s = t(kalit);
    if (s) return s;
  } catch { /* kalit yo'q */ }
  return t("xonaXatoUmumiy");
}

/* ============================ daraja tanlovi ============================ */

function Darajalar({ joriy, onTanla, yopiq }: {
  joriy: Daraja; onTanla: (d: Daraja) => void; yopiq?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {DARAJALAR.map((d) => (
        <button key={d.n} type="button" disabled={yopiq} aria-pressed={d.n === joriy}
          onClick={() => { onTanla(d.n); darajaSaqla(d.n); tebrat("tanlov"); }}
          className={`clay-press flex min-w-0 flex-1 flex-col items-center rounded-clay py-2
                      disabled:opacity-60 ${d.n === joriy
                        ? "bg-brand-blue text-white shadow-clay" : "bg-karta text-ink-soft shadow-clay-sm"}`}>
          <span className="font-display text-[15px]">{t(d.nom)}</span>
          <span className={`text-[11px] ${d.n === joriy ? "text-white/85" : "text-ink-dim"}`}>
            {t(d.yosh).split(" · ")[0]}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ============================ xona ochish ============================ */

export function JamoaOchish({ oyin, onXona, onChiq }: {
  oyin: XonaOyin;
  onXona: (kod: string) => void;
  onChiq: () => void;
}) {
  useOrqaga(onChiq);
  const meta = XONA_OYINLAR[oyin];
  const [daraja, setDaraja] = useState<Daraja>(saqlanganDaraja);
  const [kod, setKod] = useState("");
  const [band, setBand] = useState(false);
  const [xato, setXato] = useState("");
  const [orgat, setOrgat] = useState(() => !orgatildimi(oyin));

  const och = () => {
    setBand(true); setXato("");
    xonaYarat(oyin, daraja)
      .then((x) => onXona(x.kod))
      .catch((e) => { setXato(xatoMatni(e)); setBand(false); });
  };

  // Kanal havolasi — soat bilan boshlanadigan ochiq xona.
  const [daqiqa, setDaqiqa] = useState(2);
  const kanalUchun = () => {
    setBand(true); setXato("");
    xonaYarat(oyin, daraja, true, daqiqa)
      .then((x) => onXona(x.kod))
      .catch((e) => { setXato(xatoMatni(e)); setBand(false); });
  };

  const kir = () => {
    const toza = kod.replace(/\D/g, "");
    if (toza.length < 4) return;
    setBand(true); setXato("");
    xonaKir(toza, daraja)
      .then((x) => onXona(x.kod))
      .catch((e) => { setXato(xatoMatni(e)); setBand(false); });
  };

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-6 pb-10 sm:max-w-[560px]">
      <div className="text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-[26px] bg-karta shadow-clay">
          <EmojiBelgi e={meta.emoji} olcham={44} />
        </span>
        <h1 className="mt-3 text-[23px] leading-tight">{t(meta.nom)}</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          {t(meta.izoh)} · {t("xonaKishi", { min: meta.min, max: meta.max })}
        </p>
      </div>

      {/* Qoida matn bo'lib emas, rasmli qadamlar va sinov bo'lib
          ko'rsatiladi. Birinchi kirishda o'zi ochiladi. */}
      <button type="button" onClick={() => setOrgat(true)} data-tahlil={`O'rgatish ochildi (${oyin})`}
        className="clay-press mt-5 flex w-full items-center gap-3 rounded-clay bg-karta px-4 py-3 text-left shadow-clay-sm">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-blue/15 font-display
                         text-[17px] text-brand-blue">?</span>
        <span className="font-display text-[14.5px]">{t("orgQanday")}</span>
      </button>
      {orgat && <Orgatish oyin={oyin} onYop={() => setOrgat(false)} />}

      <h2 className="mt-6 mb-1.5 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("duelDarajaSarlavha")}
      </h2>
      <Darajalar joriy={daraja} onTanla={setDaraja} />
      <p className="mt-1.5 ml-1.5 text-[12px] text-ink-dim">{t("duelDarajaIzoh")}</p>

      <button type="button" onClick={och} disabled={band} data-tahlil={`Jamoa: xona ochish (${oyin})`}
        className="tugma-3d az-yaltir mt-6 w-full rounded-3xl bg-brand-blue py-4 font-display text-[18px]
                   text-white shadow-[0_6px_0_var(--color-brand-blue-d)] disabled:opacity-60">
        {t("xonaOchish")}
      </button>

      {/* Kanal havolasi Son kartalarida yo'q: u ikki kishilik, kanaldan
          esa o'nlab odam keladi va bittadan boshqasi tashqarida qolardi. */}
      {meta.max > 2 && (
        <div className="mt-4 rounded-clay bg-karta p-4 shadow-clay-sm">
          <div className="font-display text-[14px]">📣 {t("xonaKanal")}</div>
          <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{t("xonaKanalIzoh")}</p>
          <div className="mt-3 flex gap-1.5" role="group" aria-label={t("xonaKanal")}>
            {[1, 2, 5].map((n) => (
              <button key={n} type="button" onClick={() => setDaqiqa(n)} aria-pressed={daqiqa === n}
                className={`clay-press flex-1 rounded-2xl py-2 font-display text-[13.5px] ${
                  daqiqa === n ? "bg-brand-blue text-white" : "bg-track text-ink-soft"}`}>
                {t("xonaKanalDaqiqa", { n })}
              </button>
            ))}
          </div>
          <button type="button" onClick={kanalUchun} disabled={band} data-tahlil={`Jamoa: kanal havolasi (${oyin})`}
            className="clay-press mt-2.5 w-full rounded-3xl bg-track py-3 font-display text-[15px] text-ink
                       disabled:opacity-60">
            {t("xonaKanalYarat")}
          </button>
        </div>
      )}

      <div className="mt-6 rounded-clay bg-karta p-4 shadow-clay-sm">
        <div className="font-display text-[14px]">{t("xonaKodBilan")}</div>
        <div className="mt-2.5 flex gap-2">
          <input value={kod} inputMode="numeric" maxLength={6} placeholder={t("xonaKodJoy")}
            onChange={(e) => setKod(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => { if (e.key === "Enter") kir(); }}
            aria-label={t("xonaKodJoy")}
            className="min-w-0 flex-1 rounded-2xl bg-track px-4 py-3 text-center font-display text-[22px]
                       tracking-[0.3em] text-ink outline-none placeholder:text-[14px]
                       placeholder:tracking-normal placeholder:text-ink-dim" />
          <button type="button" onClick={kir} disabled={band || kod.length < 4}
            className="clay-press shrink-0 rounded-2xl bg-brand-green px-5 font-display text-[15px]
                       text-white disabled:opacity-50">
            {t("xonaKirish")}
          </button>
        </div>
      </div>

      {xato && <p role="alert" className="mt-4 text-center text-[13.5px] text-brand-red">{xato}</p>}

      <button type="button" onClick={onChiq}
        className="mt-5 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
        {t("xonaOyinlarga")}
      </button>
    </div>
  );
}

/* ============================ xona ============================ */

/** So'rov oralig'i: o'yinda tezroq — Royale'da savollar soniyalar bilan o'lchanadi. */
const oraliq = (x: XonaHolat | null) =>
  !x ? 2000 : x.holat === "oyin" ? (x.oyin === "royale" ? 1000 : 1500) : x.holat === "kutish" ? 2000 : 3000;

export function XonaSahifa({ kod, onChiq, onXona }: {
  kod: string;
  onChiq: () => void;
  /** Boshqa xonaga o'tish — bekor bo'lgan ochiq xonani qayta ochganda. */
  onXona?: (kod: string) => void;
}) {
  useOrqaga(onChiq);
  const [xona, setXona] = useState<XonaHolat | null>(null);
  const [topilmadi, setTopilmadi] = useState(false);
  const [xato, setXato] = useState("");
  // O'rgatish — havola orqali to'g'ridan-to'g'ri xonaga kelgan odam o'yinni
  // hali ko'rmagan. Kutish paytida (o'yin boshlanishidan oldin) o'zi ochiladi.
  const [orgat, setOrgat] = useState(false);
  const orgatTekshirildi = useRef(false);
  const xonaRef = useRef<XonaHolat | null>(null);
  xonaRef.current = xona;

  const yangila = useCallback((x: XonaHolat) => setXona(x), []);

  /* ---- doimiy so'rov ---- */
  useEffect(() => {
    let bekor = false;
    let id: ReturnType<typeof setTimeout>;
    const sora = async () => {
      if (!document.hidden) {
        try {
          const x = await xonaOl(kod);
          if (!bekor) yangila(x);
        } catch (e) {
          if (!bekor && e instanceof XonaXato && e.kod === 404) { setTopilmadi(true); return; }
        }
      }
      if (!bekor) id = setTimeout(sora, oraliq(xonaRef.current));
    };
    void sora();
    return () => { bekor = true; clearTimeout(id); };
  }, [kod, yangila]);

  const xatoKorsat = (e: unknown) => {
    setXato(xatoMatni(e));
    tebrat("xato");
    setTimeout(() => setXato(""), 2500);
  };

  /** Amal — javobda yangi holat keladi. */
  const amal = useCallback(async (a: Record<string, unknown>) => {
    try {
      yangila(await xonaAmal(kod, a));
    } catch (e) {
      xatoKorsat(e);
      throw e;
    }
  }, [kod, yangila]);

  useEffect(() => {
    if (!xona || orgatTekshirildi.current) return;
    orgatTekshirildi.current = true;
    if (xona.holat === "kutish" && !orgatildimi(xona.oyin)) setOrgat(true);
  }, [xona]);

  const chiq = () => { void xonaChiq(kod).catch(() => {}); onChiq(); };

  if (topilmadi) {
    return (
      <div className="mx-auto grid min-h-ekran max-w-[430px] place-items-center px-4 text-center">
        <div>
          <EmojiBelgi e="🙈" olcham={52} className="mx-auto" />
          <h1 className="mt-3 text-[21px]">{t("xonaXato_topilmadi")}</h1>
          <button type="button" onClick={onChiq}
            className="tugma-3d mt-6 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[16px]
                       text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
            {t("xonaOyinlarga")}
          </button>
        </div>
      </div>
    );
  }
  if (!xona) return <Kutish />;

  let ekran;
  if (xona.bekor) {
    // Ochiq xona: soat keldi, lekin hech kim tayyor emas edi.
    ekran = (
      <div className="mx-auto grid min-h-ekran max-w-[430px] place-items-center px-4 text-center">
        <div>
          <EmojiBelgi e="⏰" olcham={52} className="mx-auto" />
          <h1 className="mt-3 text-[21px]">{t("xonaBekor")}</h1>
          <p className="mt-1 text-[13px] text-ink-soft">{t("xonaBekorIzoh")}</p>
          {onXona && (
            <button type="button" data-tahlil="Jamoa: ochiq xonani qayta ochish"
              onClick={() => xonaYarat(xona.oyin, saqlanganDaraja(), true, Math.round((xona.kutishSoniya ?? 120) / 60))
                .then((x) => onXona(x.kod)).catch(xatoKorsat)}
              className="tugma-3d mt-6 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[16px]
                         text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
              {t("xonaQaytaOchish")}
            </button>
          )}
          <button type="button" onClick={onChiq} className="mt-3 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
            {t("xonaOyinlarga")}
          </button>
        </div>
      </div>
    );
  } else if (xona.men === null) {
    ekran = <Qoshilish xona={xona} onQoshildi={yangila} onXato={xatoKorsat} onChiq={onChiq} />;
  } else if (xona.holat === "kutish") {
    ekran = <Lobbi xona={xona} onYangi={yangila} onXato={xatoKorsat} onChiq={chiq} onQoida={() => setOrgat(true)} />;
  } else if (xona.holat === "tugadi") {
    ekran = <Natija xona={xona} onYangi={yangila} onXato={xatoKorsat} onChiq={chiq} />;
  } else if (xona.oyin === "kartalar") {
    ekran = <Kartalar xona={xona} amal={amal} />;
  } else if (xona.oyin === "royale") {
    ekran = <Royale xona={xona} amal={amal} />;
  } else if (xona.oyin === "seyf") {
    ekran = <Seyf xona={xona} amal={amal} gap={(k) => xonaGap(kod, k).then(yangila).catch(xatoKorsat)} />;
  } else {
    ekran = <Kodlar xona={xona} amal={amal} gap={(k) => xonaGap(kod, k).then(yangila).catch(xatoKorsat)} />;
  }

  return (
    <>
      {ekran}
      {/* O'yin boshlanib qolsa oyna o'zi yopiladi — o'yin ustida turmasin. */}
      {orgat && xona.holat === "kutish" && <Orgatish oyin={xona.oyin} onYop={() => setOrgat(false)} />}
      {xato && (
        <div role="alert" className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-[90vw] rounded-full
                                     bg-ink px-4 py-2.5 text-center text-[13.5px] text-white shadow-clay">
          {xato}
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------- qo'shilish */

function Qoshilish({ xona, onQoshildi, onXato, onChiq }: {
  xona: XonaHolat; onQoshildi: (x: XonaHolat) => void; onXato: (e: unknown) => void; onChiq: () => void;
}) {
  const meta = XONA_OYINLAR[xona.oyin];
  const [daraja, setDaraja] = useState<Daraja>(saqlanganDaraja);
  const [band, setBand] = useState(false);
  const odamlar = xona.azolar.filter((a) => !a.robot);

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col justify-center px-4 py-8 text-center">
      <EmojiBelgi e={meta.emoji} olcham={56} className="mx-auto" />
      <h1 className="mt-3 text-[23px]">{t(meta.nom)}</h1>
      <p className="mt-1 text-[13px] text-ink-soft">
        {t("xonaKod")}: <b className="font-display text-ink">{xona.kod}</b> · {odamlar.map((a) => a.ism).join(", ")}
      </p>
      {xona.holat !== "kutish" ? (
        <p className="mt-6 text-[14px] text-ink-soft">{t("xonaXato_boshlangan")}</p>
      ) : (
        <>
          <div className="mt-6 text-left"><Darajalar joriy={daraja} onTanla={setDaraja} /></div>
          <button type="button" disabled={band}
            onClick={() => { setBand(true); xonaKir(xona.kod, daraja).then(onQoshildi).catch((e) => { setBand(false); onXato(e); }); }}
            className="tugma-3d az-yaltir mt-5 w-full rounded-3xl bg-brand-green py-4 font-display text-[18px]
                       text-white shadow-[0_6px_0_var(--color-brand-green-d)] disabled:opacity-60">
            {t("xonaKirish")}
          </button>
        </>
      )}
      <button type="button" onClick={onChiq} className="mt-3 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
        {t("xonaOyinlarga")}
      </button>
    </div>
  );
}

/* ---------------------------------------------------- kutish */

/**
 * Ochiq xona soati va kanal uchun tayyor post.
 *
 * Soat so'rovlar orasida mahalliy kamayadi, har javobda serverdagi
 * qiymatga qaytadi. Post matni tayyor: admin uni nusxalab kanalga
 * tashlaydi — havola, o'yin nomi va vaqt ichida.
 */
function OchiqSoat({ xona }: { xona: XonaHolat }) {
  const [qolgan, setQolgan] = useState(xona.boshlanishSoniya ?? 0);
  const [nusxa, setNusxa] = useState(false);
  useEffect(() => {
    setQolgan(xona.boshlanishSoniya ?? 0);
    const id = setInterval(() => setQolgan((n) => Math.max(0, n - 1)), 1000);
    return () => clearInterval(id);
  }, [xona.boshlanishSoniya]);

  const daqiqa = Math.max(1, Math.round(qolgan / 60));
  const post = t("xonaPostMatn", {
    oyin: t(XONA_OYINLAR[xona.oyin].nom), n: daqiqa, havola: xona.havola || xona.kod,
  });
  const vaqt = `${Math.floor(qolgan / 60)}:${String(qolgan % 60).padStart(2, "0")}`;

  return (
    <div className="mt-4 rounded-clay bg-brand-blue p-4 text-center text-white shadow-clay">
      <div className="text-[12.5px] text-white/85">{t("xonaBoshlanadi")}</div>
      <div className="font-display text-[46px] leading-none tabular-nums">{vaqt}</div>
      {xona.havola && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button type="button" data-tahlil="Jamoa: kanal matnini nusxalash"
            onClick={() => navigator.clipboard?.writeText(post)
              .then(() => { setNusxa(true); setTimeout(() => setNusxa(false), 2000); }).catch(() => {})}
            className="clay-press flex-1 rounded-full bg-white/20 px-4 py-2.5 text-[13.5px]">
            {nusxa ? t("xonaNusxalandi") : t("xonaPostNusxa")}
          </button>
          <button type="button" data-tahlil="Jamoa: kanalga ulashish"
            onClick={() => havolaniOch(`https://t.me/share/url?url=${encodeURIComponent(xona.havola)}`
              + `&text=${encodeURIComponent(post)}`)}
            className="clay-press flex-1 rounded-full bg-white px-4 py-2.5 text-[13.5px] text-brand-blue-d">
            {t("xonaKanalgaUlash")}
          </button>
        </div>
      )}
    </div>
  );
}

function Lobbi({ xona, onYangi, onXato, onChiq, onQoida }: {
  xona: XonaHolat; onYangi: (x: XonaHolat) => void; onXato: (e: unknown) => void; onChiq: () => void;
  /** "?" — o'rgatishni qayta ochish. */
  onQoida?: () => void;
}) {
  const meta = XONA_OYINLAR[xona.oyin];
  const men = xona.azolar.find((a) => a.id === xona.men);
  const [daraja, setDaraja] = useState<Daraja>(() => (men?.daraja as Daraja) || saqlanganDaraja());
  const [band, setBand] = useState(false);
  const faol = xona.azolar.filter((a) => !a.chiqdi);
  const kerak = Math.max(0, xona.min - faol.length);
  const tayyormi = men?.tayyor ?? false;

  const tayyorla = () => {
    setBand(true);
    tebrat("tanlov");
    xonaTayyor(xona.kod, !tayyormi, daraja).then(onYangi).catch(onXato).finally(() => setBand(false));
  };

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-6 pb-10 sm:max-w-[560px]">
      <div className="flex items-center gap-3">
        <EmojiBelgi e={meta.emoji} olcham={34} />
        <div className="min-w-0 flex-1">
          <h1 className="text-[19px] leading-tight">{t(meta.nom)}</h1>
          <p className="text-[12px] text-ink-soft">{t(xona.ochiq ? "xonaOchiqIzoh" : "xonaKutishIzoh")}</p>
        </div>
        {onQoida && (
          <button type="button" onClick={onQoida} aria-label={t("orgQanday")} title={t("orgQanday")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-full bg-karta font-display
                       text-[18px] text-brand-blue shadow-clay-sm">
            ?
          </button>
        )}
      </div>

      {xona.ochiq && <OchiqSoat xona={xona} />}

      {/* Kod — katta: uni ovoz chiqarib aytishadi va qo'shni partadan o'qishadi. */}
      <div className="mt-4 rounded-clay bg-karta p-4 text-center shadow-clay-sm">
        <div className="text-[12px] text-ink-dim">{t("xonaKod")}</div>
        <div className="font-display text-[40px] leading-none tracking-[0.2em]">{xona.kod}</div>
        {xona.havola && (
          <button type="button" data-tahlil="Jamoa: do'stlarni chaqirish"
            onClick={() => havolaniOch(`https://t.me/share/url?url=${encodeURIComponent(xona.havola)}`
              + `&text=${encodeURIComponent(t("xonaUlashMatn", { kod: xona.kod }))}`)}
            className="clay-press mt-3 inline-flex items-center gap-2 rounded-full bg-track px-4 py-2
                       text-[13.5px] text-ink-soft">
            <Icon name="send" size={16} /> {t("xonaDostChaqir")}
          </button>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        {faol.map((a) => (
          <div key={a.id} className="flex items-center gap-2.5 rounded-clay bg-karta px-3 py-2.5 shadow-clay-sm">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-track text-[14px]">
              {a.robot ? <EmojiBelgi e="🤖" olcham={16} />
                : <EmojiBelgi e={avatarBelgi(a.avatar)} olcham={15} />}
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[14px] leading-tight">
                {a.id === xona.men ? t("xonaSiz") : a.ism}
              </span>
              <span className="text-[11.5px] text-ink-dim">
                {a.robot ? t("xonaRobot") : a.egasi ? t("xonaEgasi") : ""}
              </span>
            </span>
            <span className={`shrink-0 text-[12px] ${a.tayyor ? "text-brand-green-d" : "text-ink-dim"}`}>
              {a.tayyor ? <><Icon name="check" size={14} className="inline" /> {t("xonaTayyor")}</> : t("xonaKutilmoqda")}
            </span>
          </div>
        ))}
        {Array.from({ length: Math.min(kerak, 4) }).map((_, i) => (
          <div key={`bosh-${i}`} className="rounded-clay border border-dashed border-ink-dim/40 px-3 py-2.5
                                            text-left text-[13px] text-ink-dim">
            · · ·
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[13px] text-ink-soft">
        {/* Ochiq xonada bo'sh joyni soat kelganda robot o'zi to'ldiradi. */}
        {xona.ochiq ? t("xonaOchiqIzoh")
          : kerak > 0 ? t("xonaKishiKerak", { n: kerak }) : t("xonaHammaKutilmoqda")}
      </p>

      {xona.egasimi && faol.length < xona.robotGacha && (
        <button type="button" data-tahlil="Jamoa: robot qo'shish"
          onClick={() => xonaRobot(xona.kod).then(onYangi).catch(onXato)}
          className="clay-press mt-3 flex w-full items-center justify-center gap-2 rounded-3xl bg-karta py-3
                     font-display text-[14.5px] text-ink-soft shadow-clay-sm">
          <EmojiBelgi e="🤖" olcham={17} /> {t("xonaRobotQosh")}
        </button>
      )}

      <h2 className="mt-6 mb-1.5 ml-1.5 text-[11px] tracking-widest text-ink-soft uppercase">
        {t("duelDarajaSarlavha")}
      </h2>
      <Darajalar joriy={daraja} onTanla={setDaraja} yopiq={tayyormi} />

      <button type="button" onClick={tayyorla} disabled={band}
        className={`tugma-3d mt-5 w-full rounded-3xl py-4 font-display text-[18px] disabled:opacity-60 ${
          tayyormi ? "bg-karta text-ink-soft shadow-clay-sm"
            : "az-yaltir bg-brand-green text-white shadow-[0_6px_0_var(--color-brand-green-d)]"}`}>
        {tayyormi ? t("xonaTayyorEmas") : t("xonaTayyorman")}
      </button>

      <Gaplar xona={xona} onYangi={onYangi} onXato={onXato} />

      <button type="button" onClick={onChiq} className="mt-4 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
        {t("xonaChiqish")}
      </button>
    </div>
  );
}

/* ---------------------------------------------------- tayyor gaplar */

export const GAPLAR = ["zor", "tekshir", "ishonaman", "xato", "menemas", "xavfli", "tez", "yana"] as const;

/** Oxirgi gaplar va tugmalar. Erkin chat YO'Q — bolalar xavfsizligi uchun. */
export function Gaplar({ xona, onYangi, onXato, tanlov = GAPLAR }: {
  xona: XonaHolat; onYangi: (x: XonaHolat) => void; onXato: (e: unknown) => void;
  tanlov?: readonly string[];
}) {
  const ism = (id: number) => id === xona.men ? t("xonaSiz") : xona.azolar.find((a) => a.id === id)?.ism ?? "";
  return (
    <div className="mt-5">
      {xona.gaplar.length > 0 && (
        <div className="mb-2 space-y-1">
          {xona.gaplar.slice(-3).map((g) => (
            <div key={`${g.azo}-${g.vaqt}`} className="text-[13px] text-ink-soft">
              <b className="font-display text-ink">{ism(g.azo)}:</b> {t(`gap_${g.kalit}` as Kalit)}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {tanlov.map((k) => (
          <button key={k} type="button" onClick={() => xonaGap(xona.kod, k).then(onYangi).catch(onXato)}
            className="clay-press rounded-full bg-karta px-3 py-1.5 text-[12.5px] text-ink-soft shadow-clay-sm">
            {t(`gap_${k}` as Kalit)}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------- natija */

function Natija({ xona, onYangi, onXato, onChiq }: {
  xona: XonaHolat; onYangi: (x: XonaHolat) => void; onXato: (e: unknown) => void; onChiq: () => void;
}) {
  const { oyinTugadi } = useProgress();
  const natija = xona.natija ?? {};
  const men = xona.men !== null ? natija[String(xona.men)] : undefined;
  const durang = Object.values(natija).every((n) => n.golib === null);

  // Tanga bir raundga bir marta — sahifa yangilansa ham qayta berilmaydi.
  const berildi = useRef("");
  useEffect(() => {
    const kalit = `${xona.kod}-${xona.raund}`;
    if (!men || berildi.current === kalit) return;
    try {
      if (sessionStorage.getItem(`az-xona-tanga-${kalit}`)) return;
      sessionStorage.setItem(`az-xona-tanga-${kalit}`, "1");
    } catch { /* jim */ }
    berildi.current = kalit;
    oyinTugadi(tangaHisobi(men.ochko, false), 0);
    tebrat(men.golib ? "yutuq" : "tanlov");
  }, [men, oyinTugadi, xona.kod, xona.raund]);

  const qatorlar = xona.azolar
    .filter((a) => natija[String(a.id)])
    .map((a) => ({ a, n: natija[String(a.id)] }))
    .sort((x, y) => (x.n.joy ?? 0) - (y.n.joy ?? 0) || y.n.ochko - x.n.ochko);
  const goliblar = qatorlar.filter((q) => q.n.golib);
  const maglublar = qatorlar.filter((q) => q.n.golib === false);
  const sovga = xona.men !== null ? xona.sovgalar?.[String(xona.men)] : undefined;

  const Qator = ({ q }: { q: (typeof qatorlar)[number] }) => (
    <div className={`flex items-center gap-2.5 rounded-clay px-3 py-2.5 ${
      q.n.golib ? "bg-brand-green/15" : "bg-karta shadow-clay-sm"}`}>
      {q.n.joy && (
        <span className="shrink-0 font-display text-[13px] whitespace-nowrap text-ink-soft">
          {t("xonaJoy", { n: q.n.joy })}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate text-left text-[14px]">
        {q.a.id === xona.men ? t("xonaSiz") : q.a.ism}
        {q.a.robot && <span className="text-[11.5px] text-ink-dim"> · {t("xonaRobot")}</span>}
      </span>
      <span className="shrink-0 font-display text-[14px] text-brand-gold-d">+{q.n.ochko}</span>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-8 pb-10 text-center sm:max-w-[560px]">
      <div className="relative mx-auto w-fit">
        {men?.golib && <Konfetti />}
        <span className={`grid size-20 place-items-center rounded-[26px] shadow-clay ${
          men?.golib ? "bg-brand-gold" : "bg-karta"}`}>
          <EmojiBelgi e={men?.golib ? "🏆" : durang ? "🤝" : "💪"} olcham={46} jonli />
        </span>
      </div>
      <h1 className="mt-4 text-[25px]">
        {durang ? t("xonaDurang") : men?.golib ? t("xonaYutdingiz") : t("xonaYutqazdingiz")}
      </h1>
      {!men?.golib && !durang && <p className="mt-1 text-[13px] text-ink-soft">{t("xonaMaglubIzoh")}</p>}

      {sovga && (
        <div className="mx-auto mt-4 w-fit rounded-clay bg-brand-gold/20 px-4 py-2.5 text-[13.5px] text-brand-gold-d">
          🎁 {t("xonaSovga", { nom: t(`kM_${sovga}` as Kalit) })}
        </div>
      )}

      {goliblar.length > 0 && (
        <>
          <h2 className="mt-6 mb-1.5 ml-1 text-left text-[11px] tracking-widest text-brand-green-d uppercase">
            {t("xonaGoliblar")}
          </h2>
          <div className="space-y-1.5">{goliblar.map((q) => <Qator key={q.a.id} q={q} />)}</div>
        </>
      )}
      {maglublar.length > 0 && (
        <>
          <h2 className="mt-4 mb-1.5 ml-1 text-left text-[11px] tracking-widest text-ink-soft uppercase">
            {t("xonaMaglublar")}
          </h2>
          <div className="space-y-1.5">{maglublar.map((q) => <Qator key={q.a.id} q={q} />)}</div>
        </>
      )}
      {durang && <div className="mt-6 space-y-1.5">{qatorlar.map((q) => <Qator key={q.a.id} q={q} />)}</div>}

      {/* Seyf: kim xoin edi va kim nimani yolg'on aytgan — o'yinning eng qiziq lahzasi. */}
      {xona.oyin === "seyf" && <SeyfYakun xona={xona} />}

      <button type="button" data-tahlil="Jamoa: yana o'ynash"
        onClick={() => xonaYana(xona.kod).then(onYangi).catch(onXato)}
        className="tugma-3d az-yaltir mt-7 w-full rounded-3xl bg-brand-green py-4 font-display text-[18px]
                   text-white shadow-[0_6px_0_var(--color-brand-green-d)]">
        {t("xonaYana")}
      </button>
      <button type="button" onClick={onChiq} className="mt-3 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
        {t("xonaOyinlarga")}
      </button>
    </div>
  );
}
