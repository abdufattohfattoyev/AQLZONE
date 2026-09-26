/**
 * YANGI DIZAYN (`manba/Qidiruv.dc.html`): natijalar GURUHLANGAN —
 * Darslar · Formulalar · Masalalar · Boshqa — va har qatorda "qayerda"
 * degan yo'l: "O'qish › 5-sinf › 4-bob". Masalalar serverdan (matn
 * bo'yicha, `?q=`), qolgani qurilmadagi indeksdan (`lib/qidiruv.ts`).
 *
 * QIDIRUV EKRANI — butun ilova bitta maydondan.
 *
 * ─────────────── NEGA ALOHIDA EKRAN ───────────────
 *
 * Qidiruvni bosh sahifaning ustiga qo'yish ham mumkin edi, lekin
 * unda natijalar kurslar ro'yxatini bosib turardi va telefonda
 * klaviatura ochilganda ekranda ikki-uch qator qolardi. Alohida
 * ekranda esa butun bo'sh joy natijalarga tegishli — qidirayotgan
 * odam boshqa hech narsani ko'rishni xohlamaydi.
 *
 * ─────────────── BO'SH MAYDONDA NIMA TURADI ───────────────
 *
 * Taklif so'zlari. Bu shunchaki bezak emas: qidiruv maydonini
 * ko'rgan odamning birinchi savoli — "bu yerda NIMANI qidirsam
 * bo'ladi?". Bo'sh ekran bu savolga javob bermaydi va ko'pchilik
 * shu yerda ortga qaytadi. Tayyor so'zlar esa javobning o'zi: ular
 * ilovada dars ham, formula ham, o'yin ham borligini bir qarashda
 * ko'rsatadi.
 *
 * ─────────────── QULFLANGAN DARS ───────────────
 *
 * Qidiruv qulfni OCHMAYDI. Topilgan dars hali ochilmagan bo'lsa,
 * uning manzili emas, KURS XARITASI ochiladi va natijada qulf
 * belgisi turadi.
 *
 * Sabab: dars manziliga o'tilsa, `App.tsx` uni baribir xaritaga
 * qaytaradi (`isUnlocked` tekshiruvi) — ya'ni odam bosadi, ekran
 * sakraydi va NEGA sakraganini hech kim aytmaydi. Qulf belgisi
 * esa buni oldindan aytadi: "bu bor, lekin oldingi darslardan
 * keyin".
 */
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { indeks, qidir } from "../lib/qidiruv";
import type { Natija } from "../lib/qidiruv";
import type { Progress } from "../lib/types";
import { courseById } from "../lib/curriculum";
import type { Course } from "../lib/curriculum";
import { isUnlocked } from "../lib/types";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { yolKurs, yolMasala } from "../lib/yollar";
import { royxat as masalaRoyxat } from "../lib/masala";
import type { Masala } from "../lib/masala";
import { sinfNomi } from "../lib/masalaSinf";
import { kursQisqa } from "../components/OqishQobiq";

/** Bo'sh maydonda ko'rsatiladigan tayyor so'rovlar. */
const TAKLIF = ["kasrlar", "foiz", "Pifagor", "ko'paytirish", "sinus", "hosila"];

/** Guruhlar tartibi va belgisi (`public/belgi`). */
/**
 * `chek` — guruhda boshda nechta ko'rinadi. Hammasi birdan chiqsa, "kasr"
 * so'rovida 36 ta dars formulalar va masalalarni ekrandan itarib yuborardi;
 * qolgani "Yana N ta" bilan ochiladi.
 */
const GURUH = [
  { id: "dars", kalit: "tabDarslar", ic: "map", chek: 5 },
  { id: "formula", kalit: "oqishFormulalar", ic: "xarita", chek: 3 },
  { id: "masala", kalit: "masalalar", ic: "pencil", chek: 3 },
  { id: "boshqa", kalit: "qidiruvBoshqa", ic: "oyin", chek: 3 },
] as const;
type GuruhId = (typeof GURUH)[number]["id"];

/** Bitta ko'rsatiladigan qator — indeksdan ham, serverdagi masaladan ham. */
interface Qator { id: string; nom: string; yol: string; manzil: string; qulf: boolean }

interface Props {
  progressOf: (c: Course) => Progress;
  /** Natija bosilganda — manzil bilan. */
  onOch: (yol: string) => void;
  onBack: () => void;
}

export function Qidiruv({ progressOf, onOch, onBack }: Props) {
  useOrqaga(onBack);
  const [sorov, setSorov] = useState("");
  const maydon = useRef<HTMLInputElement>(null);

  /**
   * Yozilayotgan matn KECHIKTIRILADI.
   *
   * Har bosilgan harfda mingga yaqin yozuv ko'rib chiqiladi. Bu tez,
   * lekin arzon telefonda tez yozayotgan odamda harflar kechikib chiqa
   * boshlaydi. `useDeferredValue` bilan maydon darhol yangilanadi,
   * ro'yxat esa ozgina orqada keladi.
   */
  const kechikkan = useDeferredValue(sorov);
  const natijalar = useMemo(() => qidir(kechikkan), [kechikkan]);

  // Masalalar SERVERDAN — yozish to'xtagach (350 ms), har harfda emas.
  const [masalalar, setMasalalar] = useState<Masala[]>([]);
  useEffect(() => {
    const q = kechikkan.trim();
    if (q.length < 2) { setMasalalar([]); return; }
    let bekor = false;
    const k = setTimeout(() => {
      masalaRoyxat(null, "yangi", 0, "hammasi", false, q)
        .then((d) => { if (!bekor) setMasalalar(d.masalalar.slice(0, 5)); })
        .catch(() => { if (!bekor) setMasalalar([]); });
    }, 350);
    return () => { bekor = true; clearTimeout(k); };
  }, [kechikkan]);

  const [ochiq, setOchiq] = useState<Set<GuruhId>>(new Set());
  // Yangi so'rov — guruhlar yana qisqa holatda.
  useEffect(() => { setOchiq(new Set()); }, [kechikkan]);

  const yozilgan = sorov.trim().length > 0;
  // Ro'yxat eskirganini bildiradi: natijalar hali oldingi so'rovniki.
  const kutilmoqda = sorov !== kechikkan;

  const guruhlar = useMemo(() => {
    const g: Record<GuruhId, Qator[]> = { dars: [], formula: [], masala: [], boshqa: [] };
    for (const n of natijalar) {
      const qulf = qulflangan(n, progressOf);
      const q: Qator = { id: n.id, nom: n.nom, yol: joyi(n), manzil: qulf && n.joy ? yolKurs(n.joy.kurs) : n.yol, qulf };
      const id: GuruhId = n.tur === "dars" || n.tur === "bob" || n.tur === "kurs" ? "dars"
        : n.tur === "formula" ? "formula" : "boshqa";
      g[id].push(q);
    }
    g.masala = masalalar.map((m) => ({
      id: `masala:${m.id}`, nom: qisqa(m.matn), yol: `${t("masalalar")} › ${sinfNomi(m.sinf)}`,
      manzil: yolMasala(m.id), qulf: false,
    }));
    return g;
  }, [natijalar, masalalar, progressOf]);
  const bormi = GURUH.some((x) => guruhlar[x.id].length > 0);

  const taklifBos = (s: string) => {
    setSorov(s);
    maydon.current?.focus();
  };

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4 px-4 pt-5 pb-10 min-[360px]:px-[18px] sm:max-w-2xl">
      {/* Maydon sarlavhaning O'RNIDA turadi: bu ekranning yagona ishi —
          qidirish. O'ngda "Bekor" — orqaga. */}
      <div className="flex items-center gap-2">
        <label className="flex min-h-[52px] min-w-0 flex-1 items-center gap-2.5 rounded-[18px] bg-karta px-3.5
                          outline-2 outline-brand-blue outline-solid">
          <Icon name="search" size={20} className="shrink-0" />
          <input
            ref={maydon}
            type="search"
            // eslint-disable-next-line jsx-a11y/no-autofocus -- ekranning yagona ishi shu
            autoFocus
            value={sorov}
            onChange={(e) => setSorov(e.target.value)}
            placeholder={t("qidiruvJoy")}
            aria-label={t("qidiruvSarlavha")}
            className="min-w-0 flex-1 bg-transparent text-[17px] font-semibold outline-none placeholder:font-normal
                       placeholder:text-ink-dim"
          />
        </label>
        <button type="button" onClick={onBack} data-tahlil="Qidiruv: bekor"
          className="clay-press grid min-h-11 shrink-0 place-items-center px-1.5 text-[15px] font-bold text-brand-blue-t">
          {t("qidiruvBekor")}
        </button>
      </div>

      {/* ---- bo'sh maydon: nima qidirish mumkinligi ---- */}
      {!yozilgan && (
        <div className="mt-2">
          <p className="text-center text-[14px] leading-snug text-ink-dim">
            {t("qidiruvIzoh", { n: indeks().length })}
          </p>
          <div className="mt-3.5 flex flex-wrap justify-center gap-2">
            {TAKLIF.map((x) => (
              <button key={x} type="button" onClick={() => taklifBos(x)}
                className="clay-press min-h-10 rounded-full bg-karta px-4 text-[14px] text-ink-soft shadow-clay-sm">
                {x}
              </button>
            ))}
          </div>
        </div>
      )}

      {yozilgan && !kutilmoqda && !bormi && (
        <p className="mt-8 text-center text-[14px] leading-snug text-ink-dim">
          {t("qidiruvTopilmadi", { nima: sorov.trim() })}
        </p>
      )}

      {yozilgan && GURUH.map((g) => guruhlar[g.id].length > 0 && (
        <section key={g.id} className={`flex flex-col gap-2 transition-opacity ${kutilmoqda ? "opacity-60" : ""}`}>
          <h2 className="flex items-baseline gap-2 pl-1 text-[13px] font-bold tracking-[0.06em] text-ink-dim uppercase">
            {t(g.kalit)} <span className="tracking-normal">{guruhlar[g.id].length}</span>
          </h2>
          <div className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
            {(ochiq.has(g.id) ? guruhlar[g.id] : guruhlar[g.id].slice(0, g.chek)).map((q) => (
              <button key={q.id} type="button" data-tahlil={`Qidiruv: ${g.id}`}
                onClick={() => { tebrat("tanlov"); onOch(q.manzil); }}
                className="clay-press flex min-h-[58px] w-full items-center gap-3 px-3.5 py-1.5 text-left">
                {q.qulf
                  ? <span className="grid size-7 shrink-0 place-items-center text-ink-dim" title={t("qidiruvQulf")}>
                      <Icon name="lock" size={20} />
                    </span>
                  : <img src={`/belgi/${g.ic}.webp`} alt="" width={28} height={28} className="size-7 shrink-0 object-contain" />}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[15.5px] leading-tight font-bold">{q.nom}</span>
                  <span className="truncate text-[13px] text-ink-dim">
                    {q.yol}
                  </span>
                </span>
              </button>
            ))}
            {!ochiq.has(g.id) && guruhlar[g.id].length > g.chek && (
              <button type="button" data-tahlil={`Qidiruv: yana ${g.id}`}
                onClick={() => setOchiq((x) => new Set(x).add(g.id))}
                className="clay-press min-h-11 w-full text-center text-[14px] font-bold text-brand-blue-t">
                {t("qidiruvYana", { n: guruhlar[g.id].length - g.chek })}
              </button>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- yordamchi */

/** Dars qulflanganmi. Dars bo'lmagan yozuv hech qachon qulflanmaydi. */
function qulflangan(n: Natija, progressOf: (c: Course) => Progress): boolean {
  if (!n.joy) return false;
  const { kurs, ui, li } = n.joy;
  return !isUnlocked(kurs.units, progressOf(kurs), ui, li);
}

/**
 * "Qayerda" yo'li: "O'qish › 5-sinf › 4-bob", "O'qish › Formulalar",
 * "O'yin". Ilgari bu yerda "3-sinf · Kasrlar" kabi izoh turardi — u
 * NIMA ekanini aytardi, lekin ilovaning QAYERIDA ekanini emas.
 */
function joyi(n: Natija): string {
  const oqish = t("tabOqish");
  if (n.joy) return `${oqish} › ${kursQisqa(n.joy.kurs)} › ${t("bobRaqam", { n: n.joy.ui + 1 })}`;
  if (n.tur === "bob" || n.tur === "kurs") {
    const c = courseById(n.id.split(":")[1] ?? "");
    const bob = n.tur === "bob" ? ` › ${t("bobRaqam", { n: Number(n.id.split(":")[2]) + 1 })}` : "";
    return c ? `${oqish} › ${kursQisqa(c)}${bob}` : oqish;
  }
  if (n.tur === "formula") return `${oqish} › ${t("oqishFormulalar")}`;
  if (n.tur === "oyin") return t("tabOyin");
  if (n.tur === "kichkintoy") return t("kichkintoyQisqa");
  return n.izoh;
}

/** Masala matnidan bir qatorlik nom. */
const qisqa = (matn: string) => matn.replace(/\s+/g, " ").trim().slice(0, 80);
