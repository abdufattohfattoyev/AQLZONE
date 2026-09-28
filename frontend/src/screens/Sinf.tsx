/**
 * SINF — o'qituvchi kodi va paneli (`core/sinf.py`).
 *
 *   Sinflar      mening sinflarim: o'qituvchi sifatida (kod, a'zolar) va
 *                o'quvchi sifatida; kod bilan qo'shilish; yangi sinf
 *   SinfQoshil   kod bilan kelgan odam: qaysi sinf, kim o'qituvchi va
 *                OCHIQ OGOHLANTIRISH — o'qituvchi natijalaringizni ko'radi
 *   SinfSahifa   o'qituvchi: kod va havola, zaif mavzular, o'quvchilar;
 *                o'quvchi: sinf reytingi va "chiqish"
 *
 * O'qituvchi paneli ATAYLAB sodda: har o'quvchiga bitta qator — kim, qachon
 * kirgan, haftada necha kun ishlagan, eng yaxshi DTM/sertifikat. Batafsil
 * grafiklar emas: o'qituvchi buni dars oldidan 30 soniyada ko'rishi kerak.
 */
import { useEffect, useState } from "react";
import { botNomi } from "../lib/api";
import { Icon } from "../lib/icons";
import { kursMatn } from "../lib/tarjima/kurs";
import { t } from "../lib/matn";
import { havolaniOch, tebrat, useOrqaga } from "../lib/qobiq";
import type { SinfQisqa, SinfToliq } from "../lib/sinf";
import { sinfAmal, sinfHavola, sinfKod, sinfOch, sinfQoshil, sinfYarat, sinflarim } from "../lib/sinf";

function Sarlavha({ nom, izoh, onChiq }: { nom: string; izoh?: string; onChiq: () => void }) {
  const strelka = useOrqaga(onChiq);
  return (
    <div className="flex items-center gap-2">
      {strelka && (
        <button type="button" onClick={onChiq} aria-label={t("ortga")} title={t("ortga")}
          className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-[22px] leading-tight">{nom}</h1>
        {izoh && <p className="truncate text-[13px] text-ink-dim">{izoh}</p>}
      </div>
    </div>
  );
}

const QOBIQ = "mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-4 pb-10 min-[360px]:px-[18px] "
  + "sm:max-w-[560px] kom:max-w-[720px] kom:px-8 kom:pt-8";

/** "bugun", "kecha", "5 kun oldin". */
function qachon(iso: string | null): string {
  if (!iso) return t("sinfKirmagan");
  const kun = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return kun <= 0 ? t("sinfBugun") : kun === 1 ? t("sinfKecha") : t("sinfKunOldin", { n: kun });
}

/* ==================== ro'yxat ==================== */

export function Sinflar({ onOch, onKod, onChiq }: {
  onOch: (id: number) => void; onKod: (kod: string) => void; onChiq: () => void;
}) {
  const [r, setR] = useState<{ ustoz: SinfQisqa[]; azo: SinfQisqa[] } | null | "xato">(null);
  const [kod, setKod] = useState("");
  const [nom, setNom] = useState("");
  const [yaratish, setYaratish] = useState(false);

  useEffect(() => {
    let tirik = true;
    sinflarim().then((x) => { if (tirik) setR(x); }, () => { if (tirik) setR("xato"); });
    return () => { tirik = false; };
  }, []);

  const yarat = async () => {
    if (nom.trim().length < 2 || yaratish) return;
    setYaratish(true);
    try {
      const s = await sinfYarat(nom.trim());
      tebrat("yutuq");
      onOch(s.id);
    } catch {
      setYaratish(false);
    }
  };

  return (
    <div className={QOBIQ}>
      <Sarlavha nom={t("sinfSarlavha")} onChiq={onChiq} />

      {/* Kod bilan qo'shilish — o'quvchining yagona ishi shu. */}
      <div className="flex flex-col gap-2.5 rounded-clay bg-karta p-4 shadow-clay-sm">
        <span className="font-display text-[17px]">{t("sinfKodBilan")}</span>
        <div className="flex gap-2">
          <input value={kod} onChange={(e) => setKod(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
            placeholder="ABC234" aria-label={t("sinfKodBilan")} autoCapitalize="characters" autoComplete="off"
            className="h-12 min-w-0 flex-1 rounded-2xl border-2 border-track bg-karta px-4 font-display text-[20px]
                       font-bold tracking-[0.2em] outline-none placeholder:text-ink-dim focus:border-brand-blue" />
          <button type="button" disabled={kod.length !== 6} onClick={() => onKod(kod)} data-tahlil="Sinf: kod bilan"
            className="clay-press h-12 shrink-0 rounded-2xl bg-brand-blue px-4 font-display text-[16px] font-bold text-white
                       disabled:opacity-40">
            {t("sinfQoshilish")}
          </button>
        </div>
      </div>

      {r === null && <p className="py-6 text-center text-[14.5px] text-ink-dim">{t("hrYuklanmoqda")}</p>}
      {r === "xato" && <p className="py-6 text-center text-[14.5px] text-ink-dim">{t("hrXato")}</p>}

      {r && r !== "xato" && r.azo.length > 0 && (
        <Guruh nom={t("sinfAzoman")}>
          {r.azo.map((s) => <Qator key={s.id} s={s} izoh={s.ustoz} onOch={() => onOch(s.id)} />)}
        </Guruh>
      )}
      {r && r !== "xato" && r.ustoz.length > 0 && (
        <Guruh nom={t("sinfUstozman")}>
          {r.ustoz.map((s) => (
            <Qator key={s.id} s={s} izoh={`${t("sinfKod")}: ${s.kod} · ${t("sinfAzoSoni", { n: s.azo })}`}
              onOch={() => onOch(s.id)} />
          ))}
        </Guruh>
      )}

      {/* Yangi sinf — o'qituvchi uchun. Ikkinchi darajali amal: neytral. */}
      <div className="flex flex-col gap-2.5 rounded-clay bg-karta p-4 shadow-clay-sm">
        <span className="font-display text-[17px]">{t("sinfYangi")}</span>
        <span className="text-[13px] leading-snug text-ink-dim">{t("sinfYangiIzoh")}</span>
        <div className="flex gap-2">
          <input value={nom} onChange={(e) => setNom(e.target.value.slice(0, 60))} placeholder={t("sinfNomJoy")}
            aria-label={t("sinfNomJoy")}
            className="h-12 min-w-0 flex-1 rounded-2xl border-2 border-track bg-karta px-4 text-[16px] outline-none
                       placeholder:text-ink-dim focus:border-brand-blue" />
          <button type="button" disabled={nom.trim().length < 2 || yaratish} onClick={yarat} data-tahlil="Sinf: yaratish"
            className="clay-press h-12 shrink-0 rounded-2xl bg-track px-4 font-display text-[16px] font-bold
                       text-brand-blue-t disabled:opacity-40">
            {t("sinfYarat")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Guruh({ nom, children }: { nom: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="pl-1 text-[13px] font-bold tracking-[0.06em] text-ink-dim uppercase">{nom}</h2>
      <div className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
        {children}
      </div>
    </section>
  );
}

function Qator({ s, izoh, onOch }: { s: SinfQisqa; izoh: string; onOch: () => void }) {
  return (
    <button type="button" onClick={onOch} data-tahlil="Sinf: ochish"
      className="clay-press flex min-h-[58px] w-full items-center gap-3 px-3.5 py-2 text-left">
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[16px]">{s.nom}</span>
        <span className="block truncate text-[13px] text-ink-dim">{izoh}</span>
      </span>
      <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
    </button>
  );
}

/* ==================== kod bilan qo'shilish ==================== */

export function SinfQoshil({ kod, onQoshildi, onChiq }: {
  kod: string; onQoshildi: (id: number) => void; onChiq: () => void;
}) {
  const [s, setS] = useState<SinfQisqa | null | "yoq">(null);
  const [ketmoqda, setKetmoqda] = useState(false);

  useEffect(() => {
    let tirik = true;
    sinfKod(kod).then((x) => { if (tirik) setS(x); }, () => { if (tirik) setS("yoq"); });
    return () => { tirik = false; };
  }, [kod]);

  const qoshil = async () => {
    if (!s || s === "yoq" || ketmoqda) return;
    setKetmoqda(true);
    try {
      const x = await sinfQoshil(kod);
      tebrat("yutuq");
      onQoshildi(x.id);
    } catch {
      setKetmoqda(false);
    }
  };

  return (
    <div className={QOBIQ}>
      <Sarlavha nom={t("sinfQoshilishSarlavha")} onChiq={onChiq} />
      {s === null && <p className="py-8 text-center text-[14.5px] text-ink-dim">{t("hrYuklanmoqda")}</p>}
      {s === "yoq" && (
        <p className="rounded-clay bg-karta p-6 text-center text-[14.5px] text-ink-dim shadow-clay-sm">{t("sinfTopilmadi")}</p>
      )}
      {s && s !== "yoq" && (
        <div className="flex flex-col gap-3 rounded-clay bg-karta p-5 shadow-clay-sm">
          <span className="font-display text-[24px] leading-tight">{s.nom}</span>
          <span className="text-[14.5px] text-ink-soft">
            {t("sinfUstozi", { ism: s.ustoz || "—" })} · {t("sinfAzoSoni", { n: s.azo })}
          </span>
          {/* Maxfiylik OCHIQ aytiladi — qo'shilishdan OLDIN. */}
          <p className="rounded-2xl bg-sahna px-3.5 py-3 text-[14px] leading-snug text-ink-soft">{t("sinfOgohlantirish")}</p>
          {s.men_ustoz ? (
            <p className="text-[14px] text-ink-dim">{t("sinfOzingizniki")}</p>
          ) : s.azo_men ? (
            <button type="button" onClick={() => onQoshildi(s.id)}
              className="clay-press min-h-[52px] rounded-2xl bg-track font-display text-[17px] font-bold text-brand-blue-t">
              {t("sinfOchish")}
            </button>
          ) : (
            <button type="button" onClick={qoshil} disabled={ketmoqda} data-tahlil="Sinf: qo'shilish tasdiq"
              className="tugma-3d min-h-[54px] rounded-2xl bg-brand-blue font-display text-[18px] font-bold text-white
                         shadow-[0_4px_0_var(--color-brand-blue-d)]">
              {t("sinfQoshilish")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ==================== sinf sahifasi ==================== */

export function SinfSahifa({ id, onChiq }: { id: number; onChiq: () => void }) {
  const [s, setS] = useState<SinfToliq | null | "xato">(null);
  const [yangila, setYangila] = useState(0);

  useEffect(() => {
    let tirik = true;
    sinfOch(id).then((x) => { if (tirik) setS(x); }, () => { if (tirik) setS("xato"); });
    return () => { tirik = false; };
  }, [id, yangila]);

  if (s === null) return <div className={QOBIQ}><Sarlavha nom={t("sinfSarlavha")} onChiq={onChiq} />
    <p className="py-8 text-center text-[14.5px] text-ink-dim">{t("hrYuklanmoqda")}</p></div>;
  if (s === "xato") return <div className={QOBIQ}><Sarlavha nom={t("sinfSarlavha")} onChiq={onChiq} />
    <p className="py-8 text-center text-[14.5px] text-ink-dim">{t("sinfKirishYoq")}</p></div>;

  return s.oquvchilar
    ? <UstozPanel s={s} onChiq={onChiq} onYangila={() => setYangila((x) => x + 1)} />
    : <OquvchiKorinish s={s} onChiq={onChiq} />;
}

function UstozPanel({ s, onChiq, onYangila }: { s: SinfToliq; onChiq: () => void; onYangila: () => void }) {
  const [bot, setBot] = useState("");
  const [nusxa, setNusxa] = useState(false);
  useEffect(() => { void botNomi().then(setBot); }, []);

  const ulash = () => {
    if (!bot) return;
    tebrat("tanlov");
    havolaniOch(`https://t.me/share/url?url=${encodeURIComponent(sinfHavola(bot, s.kod))}`
      + `&text=${encodeURIComponent(t("sinfUlashMatn", { nom: s.nom, kod: s.kod }))}`);
  };
  const nusxala = async () => {
    try { await navigator.clipboard.writeText(s.kod); setNusxa(true); tebrat("tanlov"); } catch { /* ko'rinib turibdi */ }
  };
  const chiqar = async (pid: number, ism: string) => {
    if (!window.confirm(t("sinfChiqarSorov", { ism: ism || t("hrAnonim") }))) return;
    await sinfAmal(s.id, "chiqar", pid).catch(() => {});
    onYangila();
  };
  const ochir = async () => {
    if (!window.confirm(t("sinfOchirSorov", { nom: s.nom }))) return;
    await sinfAmal(s.id, "ochir").catch(() => {});
    onChiq();
  };
  const oquvchilar = s.oquvchilar ?? [];

  return (
    <div className={QOBIQ}>
      <Sarlavha nom={s.nom} izoh={t("sinfPanelIzoh", { n: s.azo, f: s.faol_hafta ?? 0 })} onChiq={onChiq} />

      {/* Kod — doskaga yoziladi; havola — guruhga yuboriladi. */}
      <div className="flex flex-col gap-3 rounded-clay bg-karta p-4 shadow-clay-sm">
        <span className="text-[13px] font-bold text-ink-dim">{t("sinfKod")}</span>
        <button type="button" onClick={nusxala} data-tahlil="Sinf: kodni nusxalash"
          className="clay-press flex items-center justify-between rounded-2xl bg-sahna px-4 py-3">
          <span className="font-display text-[30px] font-bold tracking-[0.25em]">{s.kod}</span>
          <span className="text-[13px] font-bold text-brand-blue-t">{nusxa ? t("sinfNusxalandi") : t("sinfNusxala")}</span>
        </button>
        <button type="button" onClick={ulash} disabled={!bot} data-tahlil="Sinf: havolani ulashish"
          className="tugma-3d min-h-[52px] rounded-2xl bg-brand-blue font-display text-[17px] font-bold text-white
                     shadow-[0_4px_0_var(--color-brand-blue-d)] disabled:opacity-50">
          {t("sinfHavolaUlash")}
        </button>
      </div>

      {oquvchilar.length === 0 ? (
        <p className="rounded-clay bg-karta p-5 text-center text-[14.5px] leading-snug text-ink-dim shadow-clay-sm">
          {t("sinfBoshIzoh")}
        </p>
      ) : (
        <>
          {(s.zaif ?? []).length > 0 && (
            <Guruh nom={t("sinfZaif")}>
              {(s.zaif ?? []).map((z) => (
                <div key={z.mavzu} className="flex min-h-12 items-center gap-3 px-3.5 py-2">
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                    {kursMatn(z.mavzu).replace(/^\d+-bob\.\s*|^Глава \d+\.\s*/, "")}
                  </span>
                  <span className="shrink-0 text-[13px] text-ink-dim">{t("sinfZaifOdam", { n: z.odam })}</span>
                </div>
              ))}
            </Guruh>
          )}

          <Guruh nom={t("sinfOquvchilar")}>
            {oquvchilar.map((o) => (
              <div key={o.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold">{o.ism || t("hrAnonim")}</span>
                  <span className="block text-[12.5px] leading-snug text-ink-dim">
                    {qachon(o.oxirgi)} · {t("sinfHaftaKun", { n: o.hafta_kun })}
                    {o.aniqlik !== null && ` · ${t("sinfAniqlik", { n: o.aniqlik })}`}
                  </span>
                  <span className="block text-[12.5px] text-ink-dim">
                    {o.dtm_eng !== null ? t("sinfDtm", { n: o.dtm_eng, k: o.dtm }) : t("sinfDtmYoq")}
                    {o.sert_eng !== null && ` · ${t("sinfSert", { b: o.sert_eng.toFixed(1).replace(".", ",") })}`}
                  </span>
                </span>
                <button type="button" onClick={() => chiqar(o.id, o.ism)} aria-label={t("sinfChiqar")} title={t("sinfChiqar")}
                  className="clay-press grid size-10 shrink-0 place-items-center rounded-xl text-ink-dim">
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
          </Guruh>
        </>
      )}

      <button type="button" onClick={ochir} data-tahlil="Sinf: o'chirish"
        className="clay-press mt-2 min-h-11 text-[14px] font-semibold text-ink-dim">
        {t("sinfOchir")}
      </button>
    </div>
  );
}

function OquvchiKorinish({ s, onChiq }: { s: SinfToliq; onChiq: () => void }) {
  const chiq = async () => {
    if (!window.confirm(t("sinfChiqSorov", { nom: s.nom }))) return;
    await sinfAmal(s.id, "chiq").catch(() => {});
    onChiq();
  };
  return (
    <div className={QOBIQ}>
      <Sarlavha nom={s.nom} izoh={t("sinfUstozi", { ism: s.ustoz || "—" })} onChiq={onChiq} />
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-[19px]">{t("sinfReyting")}</h2>
        <span className="text-[13px] text-ink-dim">{t("sinfReytingIzoh")}</span>
      </div>
      <ol className="flex flex-col divide-y divide-track overflow-hidden rounded-[22px] bg-karta shadow-clay-sm">
        {s.reyting.map((q) => (
          <li key={q.id} className={`flex min-h-14 items-center gap-3 px-3.5 py-2 ${q.men ? "bg-brand-blue/10" : ""}`}>
            <span className={`grid size-9 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold ${
              q.orin <= 3 && q.ball > 0 ? "bg-brand-gold/20 text-brand-gold-d" : "text-ink-soft"}`}>{q.orin}</span>
            <span className={`min-w-0 flex-1 truncate text-[15px] ${q.men ? "font-bold text-brand-blue-t" : "font-semibold"}`}>
              {q.men ? `${q.ism || t("hrSiz")} · ${t("siz")}` : q.ism || t("hrAnonim")}
            </span>
            <span className="shrink-0 font-display text-[17px] font-bold tabular-nums">{q.ball}</span>
          </li>
        ))}
      </ol>
      <button type="button" onClick={chiq} data-tahlil="Sinf: chiqish"
        className="clay-press mt-2 min-h-11 text-[14px] font-semibold text-ink-dim">
        {t("sinfChiqish")}
      </button>
    </div>
  );
}
