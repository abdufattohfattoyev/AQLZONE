/**
 * Ota-ona paneli.
 *
 * Bu ekran bolaga emas, KATTAGA yozilgan — shuning uchun uslubi ham
 * boshqacha: o'yin bezaklari yo'q, raqamlar oldinda.
 *
 * Uchta savolga javob beradi va ular ataylab shu tartibda:
 *   1. Bola muntazam mashq qilyaptimi?   (haftalik ustunlar)
 *   2. Qayerda qiynalyapti?              (eng past aniqlikdagi darslar)
 *   3. Umumiy manzara qanday?            (jami ko'rsatkichlar)
 *
 * Ma'lumot serverdan keladi. Internet bo'lmasa panel bo'sh qolmaydi —
 * qurilmadagi xatolar daftari baribir ko'rsatiladi, chunki u mahalliy.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { getXulosa } from "../lib/api";
import type { Xulosa } from "../lib/api";
import { hammasi as daftarHammasi } from "../lib/daftar";
import { courseBySlug, sinfNomi } from "../lib/curriculum";

interface Props {
  onBack: () => void;
}

/** Millisekundni odam o'qiydigan ko'rinishga aylantiradi. */
function vaqtMatn(ms: number): string {
  const daqiqa = Math.round(ms / 60000);
  if (daqiqa < 60) return `${daqiqa} daqiqa`;
  return `${Math.floor(daqiqa / 60)} soat ${daqiqa % 60} daqiqa`;
}

const HAFTA_KUNI = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];

export function OtaOna({ onBack }: Props) {
  const [xulosa, setXulosa] = useState<Xulosa | null>(null);
  const [yuklandi, setYuklandi] = useState(false);

  useEffect(() => {
    let bekor = false;
    getXulosa().then((x) => {
      if (bekor) return;
      setXulosa(x);
      setYuklandi(true);
    });
    return () => { bekor = true; };
  }, []);

  // Xatolar daftari mahalliy — server bo'lmasa ham ko'rsatiladi.
  const daftar = daftarHammasi().slice(0, 6);

  const eng = Math.max(1, ...(xulosa?.hafta ?? []).map((k) => k.savollar));

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-16">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} title="Ortga"
          className="clay-press grid size-[38px] place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      </div>

      <div className="az-kirish mt-4">
        <h1 className="text-[22px]">Ota-ona paneli</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          Farzandingiz nima qilyapti va qayerda yordam kerak
        </p>
      </div>

      {/* ---- haftalik faollik ---- */}
      {xulosa && (
        <section className="az-kirish mt-5 rounded-clay bg-karta p-4 shadow-clay-sm">
          <h2 className="font-display text-[15px]">Oxirgi 7 kun</h2>
          <div className="mt-3 flex h-24 items-end gap-1.5">
            {xulosa.hafta.map((k) => {
              const kun = new Date(`${k.sana}T00:00:00`);
              const balandlik = Math.round((k.savollar / eng) * 100);
              return (
                <div key={k.sana} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t-lg transition-[height] duration-500
                        ${k.savollar ? "bg-gradient-to-t from-brand-orange to-brand-gold" : "bg-track"}`}
                      // Bo'sh kun ham ko'rinib tursin — 3px chiziq "o'ynamadi"
                      // degan ma'noni beradi, yo'qlik esa chalkashtiradi.
                      style={{ height: k.savollar ? `${Math.max(8, balandlik)}%` : "3px" }}
                    />
                  </div>
                  <span className="text-[10.5px] text-ink-dim">{HAFTA_KUNI[kun.getDay()]}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---- jami ---- */}
      {xulosa && xulosa.jami.darslar > 0 && (
        <section className="az-kirish mt-3 grid grid-cols-2 gap-3">
          <Katak nom="Darslar" qiymat={xulosa.jami.darslar} />
          <Katak nom="Savollar" qiymat={xulosa.jami.savollar} />
          <Katak nom="Aniqlik" qiymat={`${xulosa.jami.aniqlik}%`}
            rang={xulosa.jami.aniqlik >= 80 ? "text-brand-green-d" : "text-brand-orange-d"} />
          <Katak nom="Sarflangan vaqt" qiymat={vaqtMatn(xulosa.jami.vaqt)} kichik />
        </section>
      )}

      {/* ---- qiynalayotgan mavzular ---- */}
      {xulosa && xulosa.qiyin.length > 0 && (
        <section className="az-kirish mt-3 rounded-clay bg-karta p-4 shadow-clay-sm">
          <h2 className="font-display text-[15px]">Eng qiyin kelgan darslar</h2>
          <p className="mt-0.5 text-[12px] text-ink-dim">
            Aniqlik bo'yicha — shu mavzularni birga takrorlash foydali
          </p>
          <div className="mt-3 space-y-2">
            {xulosa.qiyin.map((d, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="min-w-0 flex-1 truncate text-[13px]">
                  {d.lesson_name || `${sinfNomi(d.grade)}, ${d.unit + 1}-bob`}
                </span>
                <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-track">
                  <span
                    className={`block h-full rounded-full ${
                      d.aniqlik >= 80 ? "bg-brand-green" : d.aniqlik >= 60 ? "bg-brand-orange" : "bg-brand-red"
                    }`}
                    style={{ width: `${d.aniqlik}%` }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right text-[12px] text-ink-dim">{d.aniqlik}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- xatolar daftari (mahalliy) ---- */}
      {daftar.length > 0 && (
        <section className="az-kirish mt-3 rounded-clay bg-karta p-4 shadow-clay-sm">
          <h2 className="font-display text-[15px]">Takrorlash kutayotgan mavzular</h2>
          <div className="mt-2.5 space-y-1.5">
            {daftar.map((y, i) => {
              const c = courseBySlug(y.kurs);
              const dars = c?.units[y.ui]?.lessons[y.li];
              return (
                <div key={i} className="flex items-center gap-2 text-[13px]">
                  <span className="min-w-0 flex-1 truncate">
                    {dars?.n.split(" · ")[0] ?? `${y.ui + 1}-bob`}
                  </span>
                  <span className="shrink-0 rounded-full bg-brand-red/15 px-2 py-0.5 text-[11.5px] text-brand-red">
                    {y.xato} xato
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ---- ma'lumot yo'q holatlari ---- */}
      {yuklandi && !xulosa && (
        <div className="az-kirish mt-5 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <div className="text-[34px] leading-none">📶</div>
          <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">
            Hisobot serverdan olinadi va hozir aloqa yo'q.
            Bola o'ynashda davom etaveradi — ma'lumot keyin sinxronlanadi.
          </p>
        </div>
      )}

      {yuklandi && xulosa && xulosa.jami.darslar === 0 && (
        <div className="az-kirish mt-5 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <div className="text-[34px] leading-none">🌱</div>
          <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">
            Hali birorta dars tugallanmagan. Birinchi darsdan keyin
            shu yerda hisobot paydo bo'ladi.
          </p>
        </div>
      )}
    </div>
  );
}

function Katak({ nom, qiymat, rang = "", kichik = false }:
  { nom: string; qiymat: string | number; rang?: string; kichik?: boolean }) {
  return (
    <div className="rounded-clay bg-karta p-4 shadow-clay-sm">
      <div className={`font-display leading-tight ${kichik ? "text-[15px]" : "text-[22px]"} ${rang}`}>
        {qiymat}
      </div>
      <div className="mt-0.5 text-[11.5px] text-ink-dim">{nom}</div>
    </div>
  );
}
