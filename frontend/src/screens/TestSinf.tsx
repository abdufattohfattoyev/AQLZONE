/**
 * TESTLAR — sinf tanlash va test to'plamlari.
 *
 * ─────────────── NEGA ALOHIDA EKRAN KERAK BO'LDI ───────────────
 *
 * Testlar bazasi kursning ICHIDA turardi (`/kurs/<sinf>/testlar`)
 * va u yerga faqat kurs sahifasidan kirilardi. Ya'ni "testni
 * yechib ko'ray" degan odam avval to'g'ri kursni topib, uni ochib,
 * keyin testlarni izlashi kerak edi — va ko'pchilik u yerga
 * umuman yetib bormasdi.
 *
 * Test esa darsdan BOSHQA maqsad bilan ochiladi: dars o'rgatadi,
 * test o'lchaydi. O'lchamoqchi bo'lgan odamda "qaysi bobdan
 * boshlay" degan savol yo'q — unda "nechanchi sinfman" degan
 * savolgina bor.
 *
 * ─────────────── NEGA TO'PLAMLAR TEPADA ───────────────
 *
 * Sinf testlari har ochilishda yangidan yig'iladi va natijani hech
 * kim bilan solishtirib bo'lmaydi. To'plamda esa hamma bir xil
 * savollarni yechadi va "42 kishi ishladi, siz 70% idan yaxshiroq"
 * degan javob keladi — bu musobaqa, va aynan u bolani qaytaradi.
 * Shuning uchun eng qiziq narsa eng tepada turadi.
 *
 * ─────────────── NEGA TO'R ───────────────
 *
 * Sinflar ilgari ustma-ust keng tasmalar edi va tekis rangli kvadrat
 * ichida raqam turardi — kurs kartalari 3D bo'lgach, bu sahifa ular
 * yonida eskirib qoldi. Endi kurs kartalaridagi 3D belgilar va to'r:
 * telefonda 2 ustun, keng ekranda 3 ta.
 */
import { sinfOfProfil, useProfil } from "../lib/profil";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { blokBormi, sinfKurslari } from "../lib/blok";
import type { Course } from "../lib/curriculum";
import { kursBelgi } from "../lib/chizma/kursBelgi";
import { kursMatn } from "../lib/tarjima/kurs";
import { UNIT_COLORS } from "../lib/types";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { royxat, type Toplam } from "../lib/toplam";

/** Testi bor sinflar — bazadan yasaladi, qo'lda yozilmaydi. */
const SINFLAR = Array.from({ length: 12 }, (_, i) => i).filter(blokBormi);

/** To'plam kartasining rangi — sinfga qarab, kanal postidagi muqova bilan bir xil. */
const TOPLAM_RANG: Record<number, string> = {
  9: "from-brand-blue to-brand-blue-d",
  10: "from-brand-blue to-brand-blue-d",
  11: "from-brand-blue to-brand-blue-d",
};

interface Props {
  onSinf: (c: Course) => void;
  /** Imtihon variantlari — milliy sertifikat va DTM. */
  onImtihon: () => void;
  onToplam: (id: number) => void;
  onBack: () => void;
}

export function TestSinf({ onSinf, onImtihon, onToplam, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);
  // Anketadagi sinf eng oldinda va belgilangan: odam "nechanchi
  // sinfman" deb qidirib o'tirmasin (`lib/profil.ts`).
  const ozSinf = sinfOfProfil(useProfil());
  const tartib = ozSinf !== null && SINFLAR.includes(ozSinf)
    ? [ozSinf, ...SINFLAR.filter((s) => s !== ozSinf)] : SINFLAR;
  const [toplamlar, setToplamlar] = useState<Toplam[] | null>(null);

  useEffect(() => {
    let bekor = false;
    royxat()
      .then((d) => { if (!bekor) setToplamlar(d.royxat); })
      // Internet bo'lmasa bo'lim shunchaki chiqmaydi — sinf testlari
      // mahalliy va ular baribir ishlaydi.
      .catch(() => { if (!bekor) setToplamlar([]); });
    return () => { bekor = true; };
  }, []);

  const guruhlar = useMemo(() => {
    const m = new Map<number, Toplam[]>();
    for (const x of toplamlar ?? []) m.set(x.sinf, [...(m.get(x.sinf) ?? []), x]);
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [toplamlar]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-3 pb-10">
      <div className="flex items-center gap-2.5">
        {ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-2xl
                       bg-karta text-ink-soft shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-[18px] leading-tight">{t("testlar")}</h1>
          <p className="text-[11.5px] leading-snug text-ink-dim">{t("testSinfIzoh")}</p>
        </div>
      </div>

      {/* ---- imtihon variantlari ----
          Bitta qator, eng tepada: 9–11-sinf o'quvchisi va o'qituvchi
          testlarga ko'pincha aynan imtihon uchun keladi, sertifikat
          va DTM esa sinf ro'yxatining ichida emas — alohida bo'lim. */}
      <button type="button" onClick={() => { tebrat("tanlov"); onImtihon(); }}
        data-tahlil="Testlar: imtihon variantlari"
        className="az-kirish clay-press mt-4 flex w-full items-center gap-3 rounded-clay bg-karta p-3.5
                   text-left shadow-clay-sm">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-track text-brand-blue">
          <Icon name="clock" size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] leading-tight">{t("sertTestlar")}</span>
          <span className="mt-0.5 block truncate text-[12px] leading-snug text-ink-dim">{t("sertTestlarIzoh")}</span>
        </span>
        <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
      </button>

      {/* ---- test to'plamlari ---- */}
      {guruhlar.length > 0 && (
        <section className="mt-5">
          <h2 className="ml-1 font-display text-[15px] leading-tight">{t("toplamlar")}</h2>
          <p className="mt-0.5 ml-1 text-[11.5px] text-ink-dim">{t("toplamlarIzoh")}</p>

          <div className="mt-3 space-y-4">
            {guruhlar.map(([sinf, bloklar]) => (
              <div key={sinf}>
                <div className="mb-2 ml-1 text-[11px] tracking-widest text-ink-soft uppercase">
                  {t("testSinfQisqa", { n: sinf })}
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {bloklar.map((x, i) => (
                    <ToplamKarta key={x.id} x={x} i={i} onOch={() => { tebrat("tanlov"); onToplam(x.id); }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- sinflar ---- */}
      <h2 className="mt-6 mb-2 ml-1 font-display text-[15px] leading-tight">{t("testSinfTanlash")}</h2>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {tartib.map((sinf) => {
          // Bir sinfda ikki fan bo'lishi mumkin (algebra va
          // geometriya). Testlar ikkalasidan ARALASH yig'iladi,
          // shuning uchun kirish nuqtasi bitta — birinchi kurs.
          const kurslar = sinfKurslari(sinf);
          const bosh = kurslar[0];
          if (!bosh) return null;
          const rasm = kursBelgi(bosh.id);
          const rang = UNIT_COLORS[bosh.color];
          return (
            <button key={sinf} type="button"
              onClick={() => { tebrat("tanlov"); onSinf(bosh); }}
              data-tahlil={sinf === ozSinf ? "Testlar: o'z sinfi" : undefined}
              className={`tugma-3d flex h-full flex-col rounded-clay bg-karta p-3 text-left shadow-clay-sm
                          ${sinf === ozSinf ? "ring-2 ring-brand-blue" : ""}`}>
              <span className="flex w-full items-start">
                {rasm ? (
                  <img src={rasm} alt="" loading="lazy" className="kurs-belgi size-14" />
                ) : (
                  <span className={`grid size-12 place-items-center rounded-2xl font-display text-[18px]
                                    text-white ${rang.bg}`}>{sinf}</span>
                )}
                <Icon name="chevron" size={16} className="ml-auto shrink-0 text-ink-dim" />
              </span>
              <span className="mt-2 block font-display text-[14.5px] leading-tight">
                {t("testSinfNomi", { n: sinf })}
              </span>
              {sinf === ozSinf && (
                <span className="mt-0.5 block text-[12px] text-brand-blue">{t("testSizning")}</span>
              )}
              {/* Ikki fan bo'lsa ikkalasi ham yoziladi: 9-sinf
                  o'quvchisi geometriya testi ham borligini shu
                  qatordan biladi. */}
              <span className="mt-0.5 line-clamp-2 block text-[11.5px] leading-snug text-ink-dim">
                {kurslar.map((c) => kursMatn(c.title)).join(" · ")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Bitta to'plam kartasi.
 *
 * Ishlagan bo'lsa natijasi burchakda turadi — qaysi blok qolganini
 * bola eslab qolishi shart bo'lmasin. Ishlamagan bo'lsa esa
 * "N kishi ishladi" — kanaldagi post bilan bir xil chaqiriq.
 */
function ToplamKarta({ x, i, onOch }: { x: Toplam; i: number; onOch: () => void }) {
  const rang = TOPLAM_RANG[x.sinf] ?? TOPLAM_RANG[9];
  return (
    <button type="button" onClick={onOch}
      style={{ "--az-kech": `${i * 70}ms` } as React.CSSProperties}
      /* Telefonda uchtasi bir qatorda (~105px). Shuning uchun natija
         belgisi sarlavha ostiga tushadi — yonida joy yo'q. */
      className={`tugma-3d az-kirish relative flex min-h-[118px] flex-col overflow-hidden rounded-clay
                  bg-gradient-to-br ${rang} p-2.5 text-left text-white shadow-clay sm:p-3.5`}>
      <span aria-hidden className="pointer-events-none absolute -right-4 -bottom-6 font-display text-[88px]
                                   leading-none text-white/15">
        {i + 1}
      </span>
      <span className="font-display text-[14px] leading-tight sm:text-[15px]">{x.nom.split("·").pop()?.trim()}</span>
      {x.mening && (
        <span className="mt-1 self-start rounded-full bg-white/25 px-1.5 py-0.5 text-[10.5px] leading-none">
          {t("toplamMening", { a: x.mening.togri, b: x.mening.jami })}
        </span>
      )}
      <span className="mt-1 text-[11px] leading-snug text-white/85">
        {t("toplamSavolVaqt", { s: x.savol, d: x.daqiqa })}
      </span>
      <span className="mt-auto flex items-center gap-1 pt-2 text-[11px] leading-tight sm:text-[12px]">
        <Icon name="parent" size={13} className="shrink-0" />
        {x.ishlagan ? t("toplamIshlaganlar", { n: x.ishlagan }) : t("toplamHechKim")}
      </span>
    </button>
  );
}
