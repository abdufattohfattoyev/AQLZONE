/**
 * TEST TO'PLAMI — boshlash kartasi va testning o'zi.
 *
 * Kanal postidagi tugma aynan shu yerga olib keladi (`?startapp=test_<id>`),
 * ya'ni bu ekranni ko'pincha ilovani BIRINCHI marta ochgan odam ko'radi.
 * Shuning uchun darhol test boshlanmaydi — avval karta: nechta savol,
 * qancha vaqt, nechta odam ishlagani va "jadvalga faqat birinchi urinish
 * kiradi" degan qoida. Oxirgisi muhim: bilmay shoshib boshlagan bola
 * keyin natijasini tuzata olmasligidan xafa bo'lardi.
 *
 * Testning o'zi — oddiy blok test ekrani (`screens/Blok.tsx`) `toplam`
 * bilan. Ikkinchi test ekrani yozilmadi: vaqt, tahlil, yechimlar —
 * hammasi o'sha yerda allaqachon bor va ikki nusxa bir kun ajrab ketardi.
 */
import { useEffect, useState } from "react";
import { Blok } from "./Blok";
import { EslatmaTaklif } from "../components/EslatmaTaklif";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { bittasi, kanalgaYubor, type Toplam } from "../lib/toplam";
import { havolaniOch, tebrat, useOrqaga } from "../lib/qobiq";

export function ToplamSahifa({ id, onBack }: { id: number; onBack: () => void }) {
  const [x, setX] = useState<Toplam | null>(null);
  const [xato, setXato] = useState(false);
  const [boshlandi, setBoshlandi] = useState(false);
  const [kanal, setKanal] = useState<"" | "ketmoqda" | "xato">("");

  useEffect(() => {
    let bekor = false;
    setX(null); setXato(false); setBoshlandi(false);
    bittasi(id).then((d) => { if (!bekor) setX(d); }).catch(() => { if (!bekor) setXato(true); });
    return () => { bekor = true; };
  }, [id]);

  const ozStrelka = useOrqaga(boshlandi ? () => setBoshlandi(false) : onBack);

  if (boshlandi && x) {
    return (
      <Blok toplam={x} sinf={x.sinf} uzunlik="toliq" qamrov={{ tur: "hammasi" }}
        onExit={() => {
          // Testdan chiqqach karta YANGILANADI: endi unda shu odamning
          // natijasi va o'sgan sanoq turishi kerak.
          setBoshlandi(false);
          bittasi(id).then(setX).catch(() => {});
        }} />
    );
  }

  const kanalgaJoyla = async () => {
    if (!x || kanal === "ketmoqda") return;
    setKanal("ketmoqda");
    try {
      const d = await kanalgaYubor(x.id, Boolean(x.kanal?.yoq));
      tebrat("yutuq");
      setX({ ...x, kanal: { yuborilgan: true, havola: d.havola ?? "", yoq: false } });
      setKanal("");
    } catch {
      setKanal("xato");
    }
  };

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col px-4 pt-3 pb-10">
      {!ozStrelka && (
        <button type="button" onClick={onBack} aria-label={t("ortga")}
          className="clay-press grid size-11 place-items-center rounded-2xl bg-karta text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      )}

      {xato && <p className="mt-10 text-center text-[13.5px] text-ink-dim">{t("toplamTopilmadi")}</p>}
      {!x && !xato && <p className="mt-10 text-center text-[13.5px] text-ink-dim">{t("yuklanyapti")}</p>}

      {x && (
        <div className="az-kirish mt-4 overflow-hidden rounded-[28px] bg-karta shadow-clay">
          {/* ---- sarlavha ---- */}
          <div className="relative bg-brand-blue
                          px-5 pt-6 pb-5 text-white">
            <span aria-hidden className="pointer-events-none absolute -right-3 -bottom-8 font-display
                                         text-[120px] leading-none text-white/15">{x.sinf}</span>
            <div className="text-[11px] tracking-widest uppercase opacity-85">{t("toplamlar")}</div>
            <h1 className="mt-1 text-[26px] leading-tight">{x.nom}</h1>
            <div className="mt-2 flex flex-wrap gap-2 text-[12.5px]">
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1">
                <Icon name="order" size={14} />{t("toplamSavolVaqt", { s: x.savol, d: x.daqiqa })}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1">
                <Icon name="parent" size={14} />
                {x.ishlagan ? t("toplamIshlaganlar", { n: x.ishlagan }) : t("toplamHechKim")}
              </span>
            </div>
          </div>

          {/* ---- sonlar ---- */}
          <div className="grid grid-cols-2 gap-2.5 p-4">
            <div className="rounded-2xl bg-track px-3 py-2.5 text-center">
              <div className="font-display text-[22px] leading-none">
                {x.ishlagan ? `${x.ortacha} / ${x.savol}` : "—"}
              </div>
              <div className="mt-1 text-[11px] text-ink-dim">{t("toplamOrtacha")}</div>
            </div>
            <div className={`rounded-2xl px-3 py-2.5 text-center ${x.mening ? "bg-brand-green/15" : "bg-track"}`}>
              <div className={`font-display text-[22px] leading-none ${x.mening ? "text-brand-green-d" : ""}`}>
                {x.mening ? `${x.mening.togri} / ${x.mening.jami}` : "—"}
              </div>
              <div className="mt-1 text-[11px] text-ink-dim">
                {x.mening?.yaxshiroqFoiz != null
                  ? t("toplamYaxshiroq", { n: x.mening.yaxshiroqFoiz })
                  : t("toplamSizning")}
              </div>
            </div>
          </div>

          {/* Qoida faqat hali ishlamaganga kerak — ishlagan uni bilib bo'ldi. */}
          {!x.mening && (
            <p className="mx-4 rounded-2xl bg-track px-3.5 py-2.5 text-[12.5px] leading-snug text-ink-soft">
              {t("toplamQoida")}
            </p>
          )}

          <div className="p-4">
            {/* ---- asosiy amal ----
                Ishlamagan — "Boshlash" (ko'k, katta).
                Ishlagan — "Boshqa testlar" katta, "Qayta ishlash" kichik.
                Ilgari tugagan testdan keyin faqat "Qayta ishlash" qolardi:
                kanaldan kelgan odam uchun bu berk ko'cha edi — keyingi
                qadam yo'q, u shu yerda chiqib ketardi. */}
            {x.mening ? (
              <>
                <button type="button" onClick={onBack} data-tahlil="Test: boshqa testlar"
                  className="tugma-3d flex w-full items-center justify-center gap-2 rounded-3xl bg-brand-blue
                             py-3.5 font-display text-lg text-white shadow-[0_6px_0_var(--color-brand-blue-d)]">
                  {t("toplamBoshqaTestlar")}
                  <Icon name="chevron" size={18} />
                </button>
                <button type="button" onClick={() => { tebrat("tanlov"); setBoshlandi(true); }}
                  className="clay-press mt-2 min-h-11 w-full rounded-3xl text-[14px] text-ink-soft">
                  {t("toplamQaytaIshlash")}
                </button>
                <EslatmaTaklif matn={t("eslatmaTaklifTest")} />
              </>
            ) : (
              <button type="button" onClick={() => { tebrat("tanlov"); setBoshlandi(true); }}
                className="tugma-3d w-full rounded-3xl bg-brand-blue py-3.5 font-display text-lg
                           text-white shadow-[0_6px_0_var(--color-brand-blue-d)]">
                {t("toplamBoshlash")}
              </button>
            )}

            {/* ---- admin: kanalga joylash ---- */}
            {x.kanal && (
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => void kanalgaJoyla()} disabled={kanal === "ketmoqda"}
                  className="clay-press flex flex-1 items-center justify-center gap-2 rounded-2xl bg-track py-2.5
                             text-[13px] text-ink-soft disabled:opacity-60">
                  <Icon name="send" size={15} />
                  {kanal === "ketmoqda" ? t("yuklanyapti") : kanal === "xato" ? t("toplamKanalXato") : t("toplamKanal")}
                </button>
                {x.kanal.yuborilgan && x.kanal.havola && (
                  <button type="button" onClick={() => havolaniOch(x.kanal!.havola)}
                    className="clay-press rounded-2xl bg-brand-blue/15 px-3 text-[13px] text-brand-blue">
                    {t("toplamKanalda")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
