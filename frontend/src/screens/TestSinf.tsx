/**
 * TESTLAR — sinf tanlash.
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
 * savolgina bor. Shuning uchun bu ekranning butun ishi bitta:
 * sinfni so'rash.
 *
 * ─────────────── NEGA 5–11 ───────────────
 *
 * Test bazasi shu oraliqda mavjud (`lib/blok.ts` dagi `blokBormi`).
 * Ro'yxat qo'lda yozilmaydi — o'sha funksiyadan yasaladi, ya'ni
 * baza kengaysa ekran o'zi o'sadi.
 */
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { blokBormi, sinfKurslari } from "../lib/blok";
import type { Course } from "../lib/curriculum";
import { UNIT_COLORS } from "../lib/types";
import { tebrat, useOrqaga } from "../lib/qobiq";

/** Testi bor sinflar — bazadan yasaladi, qo'lda yozilmaydi. */
const SINFLAR = Array.from({ length: 12 }, (_, i) => i).filter(blokBormi);

interface Props {
  onSinf: (c: Course) => void;
  onBack: () => void;
}

export function TestSinf({ onSinf, onBack }: Props) {
  const ozStrelka = useOrqaga(onBack);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-10">
      <div className="flex items-center gap-2.5">
        {!ozStrelka && (
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

      <div className="mt-4 space-y-2.5">
        {SINFLAR.map((sinf, i) => {
          // Bir sinfda ikki fan bo'lishi mumkin (algebra va
          // geometriya). Testlar ikkalasidan ARALASH yig'iladi,
          // shuning uchun kirish nuqtasi bitta — birinchi kurs.
          const kurslar = sinfKurslari(sinf);
          const bosh = kurslar[0];
          if (!bosh) return null;
          const rang = UNIT_COLORS[bosh.color];
          return (
            <button key={sinf} type="button"
              onClick={() => { tebrat("tanlov"); onSinf(bosh); }}
              className="clay-press flex w-full items-center gap-3 rounded-clay bg-karta
                         p-3.5 text-left shadow-clay-sm">
              <span className={`grid size-11 shrink-0 place-items-center rounded-2xl
                                font-display text-[17px] text-white ${rang.bg}`}>
                {sinf}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[14.5px] leading-tight">
                  {t("testSinfNomi", { n: sinf })}
                </span>
                <span className="mt-0.5 block truncate text-[11.5px] text-ink-dim">
                  {/* Ikki fan bo'lsa ikkalasi ham yoziladi: 9-sinf
                      o'quvchisi geometriya testi ham borligini shu
                      qatordan biladi. */}
                  {kurslar.map((c) => c.title).join(" · ")}
                </span>
              </span>
              <Icon name="chevron" size={16} className="shrink-0 text-ink-dim" />
              <span className="sr-only">{i + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
