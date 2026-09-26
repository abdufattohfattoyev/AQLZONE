/**
 * KICHKINTOY — bo'limning kirish ekrani. To'rtta mavzu, boshqa hech narsa.
 *
 * ─────────── NEGA TO'RTTA VA NEGA KATTA ───────────
 *
 * Bu ekranni 3 yoshli bola ochadi. Uning uchun tanlov qanchalik kam
 * bo'lsa, shuncha yaxshi: sakkizta karta — sakkizta qaror, va bu
 * yoshda qaror qabul qilish o'zi charchatadi. To'rttasi esa bitta
 * ekranga surilmasdan sig'adi, ya'ni bola hammasini BIR QARASHDA
 * ko'radi va barmog'i o'zi kerakligiga boradi.
 *
 * Kartalar ATAYLAB katta (ekranning yarmiga yaqin ikkitasi): bu
 * yoshdagi barmoq aniq tegmaydi va kichik tugma "ilova ishlamayapti"
 * degan taassurot beradi.
 *
 * ─────────── NEGA QULF YO'Q ───────────
 *
 * Ilovaning qolgan qismida dars tartibi bor: oldingisi tugamaguncha
 * keyingisi ochilmaydi. Bu yerda bunday narsa YO'Q va bo'lishi ham
 * mumkin emas. Bola mashinani ko'rgisi kelsa — mashinani ko'radi.
 * Qulflangan katta esa unga "sen bunga arzimaysan" deb ko'rinadi,
 * holbuki u hali "keyingi" degan so'zni ham bilmaydi.
 *
 * ─────────── KICHKINTOY REJIMI (yangi dizayn) ───────────
 *
 * `manba/Kichkintoy.dc.html`: tepada bolaning ismi, o'ngda qulfli
 * "Ota-ona" tugmasi; ekranning qolgan hammasi — to'rtta katta karta.
 * Rejimda (`lib/kichkintoyRejim.ts`) pastki panel yo'q va orqaga yo'l
 * yo'q: ilovaning qolgan qismiga faqat ota-ona oddiy misolni yechib
 * o'tadi. Rejimdan tashqarida (qidiruvdan kelgan katta) — oddiy orqaga
 * strelkasi.
 *
 * Ko'rilgan kartalar soni ("12 tadan 5 tasi") kartadan olib tashlandi:
 * u bolaga emas, kattaga kerak edi va bola uchun faqat shovqin edi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { KichkintoyKarta } from "../components/KichkintoyKarta";
import { MAVZULAR, kNom } from "../lib/kichkintoy";
import type { Mavzu } from "../lib/kichkintoy";
import { getHisob, joriyProfil, profilSoni } from "../lib/api";
import { qulfSavoli, useKichkintoyRejim } from "../lib/kichkintoyRejim";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { OvozTugma } from "../components/OvozTugma";

export function Kichkintoy({ onBack, onMavzu, onChiq }: {
  onBack: () => void;
  onMavzu: (id: string) => void;
  /** Ota-ona qulfni ochdi — rejimdan chiqib, oddiy ilovaga. */
  onChiq: () => void;
}) {
  const rejim = useKichkintoyRejim();
  // Rejimda orqaga yo'l yo'q — Telegram'ning orqaga tugmasi ham.
  const ozStrelka = useOrqaga(onBack, !rejim);
  const [qulf, setQulf] = useState(false);
  const [ism, setIsm] = useState("");

  // Sarlavhada bolaning ismi. Bir bolali hisobda profil nomi ko'pincha
  // standart ("Men") — o'shanda bo'lim nomi turadi.
  useEffect(() => {
    let bekor = false;
    getHisob().then((h) => {
      if (bekor || !h || profilSoni() < 2) return;
      const b = h.profillar?.find((p) => String(p.id) === joriyProfil());
      if (b?.ism) setIsm(b.ism);
    });
    return () => { bekor = true; };
  }, []);

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col gap-[18px] px-4 pt-[22px] pb-[26px]
                    min-[360px]:px-[18px] sm:max-w-[700px]">
      <header className="flex min-h-[52px] items-center gap-2.5">
        {!rejim && ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate font-display text-[22px] min-[400px]:text-[30px]">
          {ism || t("kichkintoy")}
        </h1>
        {/* Ovoz tugmasi butun bo'lim bo'ylab bir joyda — ota-ona uni bir
            marta topadi (avtobusda, uxlash oldidan) va keyin qidirmaydi. */}
        <OvozTugma />
        {rejim && (
          <button type="button" onClick={() => { tebrat("tanlov"); setQulf(true); }}
            aria-label={t("kichkintoyOtaOnaChiqish")} data-tahlil="Kichkintoy: ota-ona"
            className="clay-press flex min-h-11 shrink-0 items-center gap-1.5 rounded-[14px] bg-track px-3.5
                       text-[14px] font-bold text-ink-soft">
            <Icon name="lock" size={16} />
            {/* Tor ekranda faqat qulf belgisi — yozuv bolaning ismini qirqardi. */}
            <span className="hidden min-[360px]:inline">{t("kichkintoyOtaOna")}</span>
          </button>
        )}
      </header>

      <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-3.5">
        {MAVZULAR.map((m) => <MavzuKarta key={m.id} m={m} onOch={() => onMavzu(m.id)} />)}
      </div>

      {qulf && <Qulf onOchildi={() => { setQulf(false); onChiq(); }} onYop={() => setQulf(false)} />}
    </div>
  );
}

/**
 * Mavzu belgisi (`manba/Kichkintoy.dc.html`): mashina va hayvonda albomning
 * birinchi kartasi (bola ichkarida AYNAN shu rasmni topadi), ranglar va
 * raqamlarda — ilovaning 3D belgisi.
 */
function MavzuBelgi({ m }: { m: Mavzu }) {
  if (m.id === "rang" || m.id === "raqam") {
    return (
      <img src={`/belgi/${m.id === "rang" ? "palette" : "raqamlar"}.webp`} alt="" width={84} height={84}
        className="size-[72px] min-[360px]:size-[84px]" />
    );
  }
  const k = m.kartalar[0];
  return k ? <KichkintoyKarta k={k} olcham="kichik" /> : null;
}

/** Katta mavzu kartasi — ekranning chorak qismi. */
function MavzuKarta({ m, onOch }: { m: Mavzu; onOch: () => void }) {
  return (
    <button type="button" onClick={onOch} title={kNom(m)} data-tahlil={`Kichkintoy: ${m.id}`}
      className="tugma-3d flex min-h-40 flex-col items-center justify-center gap-3.5 rounded-[30px] bg-karta p-3
                 shadow-clay">
      <MavzuBelgi m={m} />
      <span className="font-display text-[19px] leading-tight font-bold min-[360px]:text-[22px]">{kNom(m)}</span>
    </button>
  );
}

/**
 * Ota-ona qulfi — oddiy misol. Ikki xonali qo'shish 2–5 yoshli bolaga
 * yechilmaydi, kattaga esa bir soniya. Xato javobda yangi misol chiqadi.
 */
function Qulf({ onOchildi, onYop }: { onOchildi: () => void; onYop: () => void }) {
  const [s, setS] = useState(() => qulfSavoli());
  const [xato, setXato] = useState(false);
  return (
    <div onClick={onYop} role="dialog" aria-modal="true" aria-label={t("kichkintoyOtaOnaChiqish")}
      className="fixed inset-0 z-[80] grid place-items-center bg-black/45 p-4">
      <div onClick={(e) => e.stopPropagation()}
        className="az-kanal w-full max-w-[340px] rounded-clay bg-karta p-5 text-center shadow-clay">
        <p className="text-[14px] font-bold text-ink-dim">{t("kichkintoyQulfIzoh")}</p>
        <p className="mt-2 font-display text-[30px] font-bold">{s.a} + {s.b} = ?</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {s.variantlar.map((v) => (
            <button key={v} type="button" data-tahlil="Kichkintoy: qulf javobi"
              onClick={() => {
                if (v === s.javob) { tebrat("togri"); onOchildi(); return; }
                tebrat("xato");
                setXato(true);
                setS(qulfSavoli());
              }}
              className="clay-press min-h-12 rounded-2xl bg-sahna font-display text-[20px] font-bold shadow-clay-sm">
              {v}
            </button>
          ))}
        </div>
        {xato && <p className="mt-3 text-[13px] text-brand-red">{t("kichkintoyQulfXato")}</p>}
        <button type="button" onClick={onYop}
          className="clay-press mt-3 min-h-11 w-full text-[15px] font-semibold text-ink-soft">
          {t("bekor")}
        </button>
      </div>
    </div>
  );
}
