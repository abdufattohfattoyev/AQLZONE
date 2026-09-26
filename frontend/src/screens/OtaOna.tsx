/**
 * Ota-ona paneli (`manba/OtaOna.dc.html`).
 *
 * Bu ekran bolaga emas, KATTAGA yozilgan — shuning uchun uslubi ham
 * boshqacha: o'yin bezaklari yo'q, raqamlar oldinda. Tepadan pastga:
 *
 *   farzand      bir nechta bola bo'lsa — tanlash chiplari
 *   uch son      haftada necha kun faol, nechta dars, to'g'ri javob %
 *   hafta        har kuni necha DAQIQA shug'ullangan (ustunlar)
 *   yordam       eng past aniqlikdagi dars va "Darsni ochish"
 *   daftar       takrorlash kutayotgan xatolar (qurilmada)
 *   hisobot      "Haftalik hisobot Telegram'ga" o'chirgichi
 *
 * Ma'lumot serverdan keladi (`/summary`). Internet bo'lmasa panel bo'sh
 * qolmaydi — qurilmadagi xatolar daftari baribir ko'rsatiladi.
 *
 * Haftalik hisobotni server har yakshanba 20:00 da yuboradi
 * (`haftalik_hisobot` buyrug'i) — faqat shu yerda YOQILGAN bo'lsa.
 * Telegram bog'lanmagan hisobda yoqib bo'lmaydi: o'chirgich o'rniga
 * Sozlamalarga (Telegram'ni ulash) olib boradi.
 */
import { useEffect, useState } from "react";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { getHisob, getXulosa, haftalikHisobot, joriyProfil, profilniTanla } from "../lib/api";
import type { Hisob, Profil, QiyinDars, Xulosa } from "../lib/api";
import { hammasi as daftarHammasi } from "../lib/daftar";
import { courseBySlug, sinfNomi } from "../lib/curriculum";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { kursMatn } from "../lib/tarjima/kurs";

interface Props {
  onBack: () => void;
  /** Qiynalgan darsni ochish (sinf kodi, bob va dars indeksi). */
  onDars: (d: QiyinDars) => void;
  /** Telegram'ni ulash uchun Sozlamalar. */
  onSozlama: () => void;
}

export function OtaOna({ onBack, onDars, onSozlama }: Props) {
  const [xulosa, setXulosa] = useState<Xulosa | null>(null);
  const [yuklandi, setYuklandi] = useState(false);
  const [bolalar, setBolalar] = useState<Profil[]>([]);
  const [hisob, setHisob] = useState<Hisob | null>(null);
  const [hisobot, setHisobot] = useState(false);
  const ozStrelka = useOrqaga(onBack);

  useEffect(() => {
    let bekor = false;
    getXulosa().then((x) => {
      if (bekor) return;
      setXulosa(x);
      setYuklandi(true);
    });
    getHisob().then((h) => {
      if (bekor) return;
      setBolalar(h?.profillar ?? []);
      setHisob(h);
      setHisobot(Boolean(h?.haftalikHisobot));
    });
    return () => { bekor = true; };
  }, []);

  // Xatolar daftari mahalliy — server bo'lmasa ham ko'rsatiladi.
  const daftar = daftarHammasi().slice(0, 6);
  const hafta = xulosa?.hafta ?? [];
  const faolKun = hafta.filter((k) => k.darslar > 0).length;
  const haftaDars = hafta.reduce((a, k) => a + k.darslar, 0);
  // Eski server `daqiqa` qaytarmasligi mumkin — o'shanda savollar soni.
  const daqiqada = hafta.some((k) => typeof k.daqiqa === "number");
  const qiymat = (k: Xulosa["hafta"][number]) => (daqiqada ? k.daqiqa ?? 0 : k.savollar);
  const eng = Math.max(1, ...hafta.map(qiymat));
  const qisqa = t("bugunQisqaKunlar").split(",");
  const qiyin = xulosa?.qiyin[0];
  const joriy = joriyProfil();

  const hisobotAlmashtir = () => {
    if (!hisob?.telegram) { onSozlama(); return; }
    const yangi = !hisobot;
    tebrat("tanlov");
    setHisobot(yangi);
    haftalikHisobot(yangi).then((j) => { if (j !== yangi) setHisobot(!yangi); });
  };

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-10 min-[360px]:px-[18px]">
      <header className="flex min-h-12 items-center gap-3">
        {ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate font-display text-[23px]">{t("otaOnaPaneli")}</h1>
      </header>

      {/* ---- farzand tanlash — faqat bir nechta bola bo'lsa ---- */}
      {bolalar.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {bolalar.map((b, i) => {
            const bu = joriy ? String(b.id) === joriy : i === 0;
            return (
              <button key={b.id} type="button" aria-pressed={bu} data-tahlil="Ota-ona: farzand"
                onClick={() => {
                  if (bu) return;
                  tebrat("tanlov");
                  profilniTanla(b.id);
                  // Profil almashsa hamma narsa (progress, daftar) boshqa —
                  // `screens/Profillar.tsx` dagidek to'liq qayta yuklanadi.
                  window.location.reload();
                }}
                className={`grid min-h-10 place-items-center rounded-full px-4 text-[14.5px] ${
                  bu ? "bg-brand-blue font-bold text-white" : "bg-karta font-semibold text-ink-soft shadow-clay-sm"}`}>
                {b.ism}
              </button>
            );
          })}
        </div>
      )}

      {xulosa && (
        <div className="grid grid-cols-3 gap-2">
          <Son qiymat={`${faolKun} / 7`} nom={t("otaKunFaol")} />
          <Son qiymat={String(haftaDars)} nom={t("otaDars")} />
          <Son qiymat={`${xulosa.jami.aniqlik}%`} nom={t("otaTogri")}
            rang={xulosa.jami.savollar ? "text-brand-green-d" : ""} />
        </div>
      )}

      {/* ---- haftalik ustunlar ---- */}
      {xulosa && (
        <section className="flex flex-col gap-2.5 rounded-[22px] bg-karta p-4 shadow-clay-sm">
          <h2 className="font-display text-[18px]">{daqiqada ? t("otaHaftaDaqiqa") : t("oxirgi7Kun")}</h2>
          {/* Ustun `items-stretch` bilan: qator `items-end` bo'lsa ustun
              balandligi MATNIGA teng bo'lib, ichkaridagi `flex-1` nolga
              tushardi va diagramma ko'rinmay qolardi. */}
          <div className="grid h-[120px] grid-cols-7 items-stretch gap-1.5 min-[360px]:gap-2"
            role="img" aria-label={hafta.map((k) => qiymat(k)).join(", ")}>
            {hafta.map((k) => {
              const m = qiymat(k);
              return (
                <div key={k.sana} className="flex flex-col items-center justify-end gap-1">
                  {m > 0 && <span className="text-[12px] font-bold text-ink-soft">{m}</span>}
                  <span className={`block w-full rounded-lg ${m ? "bg-brand-blue" : "bg-track"}`}
                    style={{ height: m ? `${Math.max(6, Math.round((m / eng) * 86))}px` : "6px" }} />
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[12.5px] text-ink-dim min-[360px]:gap-2">
            {hafta.map((k) => (
              <span key={k.sana}>{qisqa[(new Date(`${k.sana}T00:00:00`).getDay() + 6) % 7]}</span>
            ))}
          </div>
        </section>
      )}

      {/* ---- yordam kerak bo'lgan mavzu ---- */}
      {qiyin && (
        <section className="flex flex-col gap-2 rounded-[22px] bg-karta p-4 shadow-clay-sm">
          <h2 className="font-display text-[18px]">{t("otaYordam")}</h2>
          <p className="text-[15px] leading-snug text-ink-soft">
            {t("otaYordamIzoh", {
              nom: qiyin.lesson_name ? kursMatn(qiyin.lesson_name).split(" · ")[0] ?? ""
                : t("sinfBob", { sinf: sinfNomi(qiyin.grade), n: qiyin.unit + 1 }),
              jami: qiyin.savollar, togri: qiyin.togri,
            })}
          </p>
          <button type="button" onClick={() => onDars(qiyin)} data-tahlil="Ota-ona: darsni ochish"
            className="clay-press grid min-h-10 place-items-center self-start rounded-xl bg-brand-blue/10 px-3.5
                       text-[14.5px] font-bold text-brand-blue-t">
            {t("otaDarsniOch")}
          </button>
        </section>
      )}

      {/* ---- xatolar daftari (mahalliy) ---- */}
      {daftar.length > 0 && (
        <section className="flex flex-col gap-2 rounded-[22px] bg-karta p-4 shadow-clay-sm">
          <h2 className="font-display text-[18px]">{t("takrorlashKutayotgan")}</h2>
          {daftar.map((y, i) => {
            const c = courseBySlug(y.kurs);
            const dars = c?.units[y.ui]?.lessons[y.li];
            return (
              <div key={i} className="flex items-center gap-2 text-[14.5px]">
                <span className="min-w-0 flex-1 truncate">
                  {dars ? kursMatn(dars.n).split(" · ")[0] : t("bobRaqam", { n: y.ui + 1 })}
                </span>
                <span className="shrink-0 text-[13px] text-ink-dim">{t("xatoSoni", { n: y.xato })}</span>
              </div>
            );
          })}
        </section>
      )}

      {/* ---- haftalik hisobot — eski server maydonni bermasa ko'rsatilmaydi ---- */}
      {hisob && typeof hisob.haftalikHisobot === "boolean" && (
        <div className="flex min-h-[60px] items-center gap-3 rounded-[20px] bg-karta py-2 pr-2 pl-4 shadow-clay-sm">
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[15.5px] leading-snug font-bold">{t("otaHisobot")}</span>
            <span className="text-[13px] leading-snug text-ink-dim">
              {hisob.telegram ? t("otaHisobotVaqt") : t("otaHisobotTelegramsiz")}
            </span>
          </span>
          {hisob.telegram ? (
            <button type="button" role="switch" aria-checked={hisobot} aria-label={t("otaHisobot")}
              onClick={hisobotAlmashtir} data-tahlil="Ota-ona: haftalik hisobot"
              className="grid h-11 w-[60px] shrink-0 place-items-center">
              <span className={`relative block h-[30px] w-[52px] rounded-full transition-colors ${
                hisobot ? "bg-brand-green" : "bg-track"}`}>
                <span className={`absolute top-[3px] size-6 rounded-full bg-white shadow-clay-sm transition-[left] ${
                  hisobot ? "left-[25px]" : "left-[3px]"}`} />
              </span>
            </button>
          ) : (
            <button type="button" onClick={onSozlama} aria-label={t("otaHisobotTelegramsiz")}
              data-tahlil="Ota-ona: hisobot uchun Telegram"
              className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] text-ink-dim">
              <Icon name="chevron" size={18} />
            </button>
          )}
        </div>
      )}

      {/* ---- ma'lumot yo'q holatlari ---- */}
      {yuklandi && !xulosa && (
        <div className="rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <EmojiBelgi e="📶" olcham={30} className="mx-auto" />
          <p className="mt-2 text-[14px] leading-snug text-ink-soft">{t("hisobotAloqaYoq")}</p>
        </div>
      )}
      {yuklandi && xulosa && xulosa.jami.darslar === 0 && (
        <div className="rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <EmojiBelgi e="🌱" olcham={30} className="mx-auto" />
          <p className="mt-2 text-[14px] leading-snug text-ink-soft">{t("hisobotBosh")}</p>
        </div>
      )}
    </div>
  );
}

function Son({ qiymat, nom, rang = "" }: { qiymat: string; nom: string; rang?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-[18px] bg-karta p-3 shadow-clay-sm">
      <span className={`truncate font-display text-[22px] leading-tight font-bold min-[360px]:text-[24px] ${rang}`}>
        {qiymat}
      </span>
      <span className="truncate text-[13px] text-ink-dim">{nom}</span>
    </div>
  );
}
