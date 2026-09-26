/**
 * Reyting — kim qancha yulduz yig'gan (`manba/Reyting.dc.html`).
 *
 * Tepada guruh (segment) va davr, ostida uchlik PODIUM va ro'yxat:
 *
 *   Sinfim   anketada shu sinfni aytganlar orasida (`?guruh=sinf`);
 *            talabada — talabalar orasida (`?guruh=talaba`)
 *   Hamma    butun sayt
 *   Do'stlar men va duel o'ynagan tanishlarim (`?guruh=dostlar`) —
 *            begonalar emas, "kimdan o'tib ketdim" eng kuchli sabab
 *   Liga     o'ziga teng 20 bola (`LigaJadval`) — har hafta yangidan
 *
 * Davr — "Bu hafta" yoki "Hammasi" (sarlavhaning o'ng chetida). Hafta
 * boshlang'ich: umumiy jadval tez qotib qoladi va yangi kelgan bola
 * yuqoridagilarni hech qachon quvib yeta olmaydi, haftalikda esa hamma
 * har dushanba teng boshlaydi.
 *
 * Do'stlik alohida saqlanmaydi: chaqiruvni QABUL qilgan har kim tanish
 * (`duel.tanishmi` bilan bir qoida). Hali tanish bo'lmasa — jadval o'rniga
 * "do'stni duelga chaqiring" taklifi.
 *
 * O'z o'rning DOIM ko'rinadi: top ichida bo'lmasang ham pastda alohida
 * qator bo'lib turadi (ko'k fon bilan).
 */
import { useEffect, useState } from "react";
import { EmojiBelgi } from "../lib/hajmli";
import { Icon } from "../lib/icons";
import { LigaJadval } from "../components/LigaJadval";
import { getReyting } from "../lib/api";
import type { Reyting as ReytingMa, ReytingQator } from "../lib/api";
import { t } from "../lib/matn";
import { tebrat, useOrqaga } from "../lib/qobiq";
import { sinfOfProfil, useProfil } from "../lib/profil";

type Guruh = "sinf" | "hamma" | "dostlar" | "liga";
type Davr = "hafta" | "jami";

const bosHarflar = (ism: string) =>
  ism.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("") || "?";

export function Reyting({ onBack, onDuel }: { onBack: () => void; onDuel: () => void }) {
  const prof = useProfil();
  const talaba = prof?.kim === "talaba";
  // "Sinfim" faqat sinfi ma'lum odamga (yoki talabaga — talabalar jadvali).
  const sinfBor = talaba || sinfOfProfil(prof) !== null;
  const [guruh, setGuruh] = useState<Guruh>(sinfBor ? "sinf" : "hamma");
  const [davr, setDavr] = useState<Davr>("hafta");
  const [ma, setMa] = useState<ReytingMa | null>(null);
  const [yuklanyapti, setYuklanyapti] = useState(true);
  const ozStrelka = useOrqaga(onBack);

  useEffect(() => {
    // Liga o'z ma'lumotini o'zi oladi — bu yerda so'rov yubormaymiz.
    if (guruh === "liga") return;
    let bekor = false;
    setYuklanyapti(true);
    getReyting(davr, guruh === "sinf" ? (talaba ? "talaba" : "sinf") : guruh === "dostlar" ? "dostlar" : "").then((d) => {
      if (bekor) return;
      setMa(d);
      setYuklanyapti(false);
    });
    return () => { bekor = true; };
  }, [guruh, davr, talaba]);

  const menRoyxatda = Boolean(ma?.top.some((q) => q.men));
  // Do'stlar jadvalida faqat o'zim bo'lsam — hali tanish yo'q.
  const dostsiz = guruh === "dostlar" && Boolean(ma) && !ma!.top.some((q) => !q.men);
  const top3 = ma?.top.slice(0, 3) ?? [];
  const qolgan = ma?.top.slice(3) ?? [];
  const yorliqlar: { id: Guruh; nom: string }[] = [
    ...(sinfBor ? [{ id: "sinf" as const, nom: talaba ? t("reytingTalabalar") : t("reytingSinfim") }] : []),
    { id: "hamma", nom: t("reytingHamma") },
    { id: "dostlar", nom: t("reytingDostlar") },
    { id: "liga", nom: t("reytingLiga") },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-10 min-[360px]:px-[18px]
                    sm:max-w-[560px]">
      <header className="flex min-h-12 items-center gap-3">
        {ozStrelka && (
          <button type="button" onClick={onBack} aria-label={t("ortga")}
            className="clay-press grid size-11 shrink-0 place-items-center rounded-[14px] bg-karta shadow-clay-sm">
            <Icon name="chevron" size={20} className="rotate-180" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate font-display text-[21px] min-[360px]:text-[24px]">{t("reyting")}</h1>
        {guruh !== "liga" && (
          <button type="button" data-tahlil="Reyting: davr"
            onClick={() => { tebrat("tanlov"); setDavr((d) => (d === "hafta" ? "jami" : "hafta")); }}
            className="clay-press flex min-h-11 shrink-0 items-center gap-1 rounded-[14px] px-2 text-[14px] font-bold
                       text-ink-dim">
            {davr === "hafta" ? t("reytingBuHafta") : t("reytingHammasi")}
            <Icon name="chevron" size={14} className="rotate-90" />
          </button>
        )}
      </header>

      <nav aria-label={t("reyting")} className={`grid gap-1 rounded-2xl bg-track p-1 ${
        yorliqlar.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
        {yorliqlar.map((y) => (
          <button key={y.id} type="button" aria-current={guruh === y.id ? "page" : undefined}
            data-tahlil={`Reyting: ${y.id}`}
            onClick={() => { if (guruh !== y.id) { tebrat("tanlov"); setGuruh(y.id); } }}
            className={`grid min-h-10 min-w-0 place-items-center rounded-xl px-1 text-[13px] min-[360px]:text-[14.5px] ${
              guruh === y.id ? "bg-karta font-bold text-brand-blue-t shadow-clay-sm" : "font-semibold text-ink-soft"}`}>
            <span className="max-w-full truncate">{y.nom}</span>
          </button>
        ))}
      </nav>

      {guruh === "liga" && <LigaJadval />}

      {guruh !== "liga" && (
        <>
          {yuklanyapti && <p className="mt-6 text-center text-[13.5px] text-ink-dim">{t("yuklanyapti")}</p>}

          {!yuklanyapti && ma === null && (
            <div className="rounded-clay bg-karta p-5 text-center shadow-clay-sm">
              <EmojiBelgi e="📶" olcham={30} className="mx-auto" />
              <p className="mt-2 text-[14px] leading-snug text-ink-soft">{t("reytingAloqaYoq")}</p>
            </div>
          )}

          {!yuklanyapti && dostsiz && (
            <div className="flex flex-col items-center gap-2.5 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
              <EmojiBelgi e="🤝" olcham={30} />
              <p className="text-[14px] leading-snug text-ink-soft">{t("reytingDostYoq")}</p>
              <button type="button" onClick={onDuel} data-tahlil="Reyting: do'stni chaqirish"
                className="clay-press min-h-11 rounded-xl bg-brand-blue/10 px-4 text-[14.5px] font-bold text-brand-blue-t">
                {t("reytingDostChaqir")}
              </button>
            </div>
          )}

          {!yuklanyapti && !dostsiz && ma?.top.length === 0 && (
            <div className="rounded-clay bg-karta p-5 text-center shadow-clay-sm">
              <EmojiBelgi e="⭐" olcham={30} className="mx-auto" />
              <p className="mt-2 text-[14px] leading-snug text-ink-soft">
                {davr === "hafta" ? t("haftaBosh") : t("reytingBosh")}
              </p>
            </div>
          )}

          {!yuklanyapti && !dostsiz && top3.length > 0 && <Podium top={top3} />}

          {!yuklanyapti && ma && !dostsiz && (qolgan.length > 0 || (ma.men && !menRoyxatda)) && (
            <ol className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta shadow-clay-sm">
              {qolgan.map((q) => <Qator key={`${q.orin}-${q.toliqIsm}`} q={q} />)}
              {/* Top ichida bo'lmasam — oxirida alohida. Bo'lsam
                  takrorlanmaydi: bir odam jadvalda ikki marta turgani chalkashtiradi. */}
              {ma.men && !menRoyxatda && <Qator q={ma.men} />}
            </ol>
          )}

          {!yuklanyapti && ma && !dostsiz && !ma.men && !menRoyxatda && ma.top.length > 0 && (
            <p className="text-center text-[13px] leading-snug text-ink-dim">
              {davr === "hafta" ? t("haftaYulduzsiz") : t("yulduzsiz")}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Uchlik podium: 2 · 1 · 3. Birinchi o'rin OLTIN (mukofot rangi) va
 * baland; qolganlari neytral. O'zim uchlikda bo'lsam — ismim ko'k.
 */
function Podium({ top }: { top: ReytingQator[] }) {
  const tartib = [top[1], top[0], top[2]];
  const boy = { 1: "h-[100px]", 2: "h-[70px]", 3: "h-[54px]" } as const;
  return (
    <div className="grid grid-cols-3 items-end gap-2 pt-1.5">
      {tartib.map((q, i) => {
        if (!q) return <span key={i} />;
        const birinchi = q.orin === 1;
        return (
          <div key={q.orin} className="flex min-w-0 flex-col items-center gap-1.5">
            <span className={`grid shrink-0 place-items-center rounded-full bg-karta font-bold text-brand-blue-t ${
              birinchi ? "size-16 ring-[3px] ring-brand-gold" : "size-[54px] shadow-clay-sm"}`}>
              {bosHarflar(q.toliqIsm || t("nomalum"))}
            </span>
            <span className={`max-w-full truncate text-[14px] font-bold ${q.men ? "text-brand-blue-t" : ""}`}>
              {(q.toliqIsm || t("nomalum")).split(" ")[0]}
            </span>
            <span className={`grid w-full place-items-center rounded-t-2xl rounded-b-md font-display font-bold ${
              boy[q.orin as 1 | 2 | 3] ?? "h-[54px]"} ${
              birinchi ? "bg-brand-gold/20 text-[26px] text-brand-gold-d" : "bg-karta text-[22px] text-ink-dim"}`}>
              {q.orin}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Qator({ q }: { q: ReytingQator }) {
  return (
    <li className={`flex min-h-[52px] items-center gap-2.5 px-4 ${q.men ? "bg-brand-blue/10 text-brand-blue-t" : ""}`}>
      <span className={`w-8 shrink-0 font-display font-bold tabular-nums ${q.men ? "" : "text-ink-dim"}`}>{q.orin}</span>
      <span className="min-w-0 flex-1 truncate text-[15.5px] font-semibold">
        {q.men ? t("reytingSiz", { ism: q.toliqIsm || t("nomalum") }) : q.toliqIsm || t("nomalum")}
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[15px] font-bold tabular-nums text-brand-gold-d">
        <Icon name="star" size={14} className="text-brand-gold" />{q.yulduz}
      </span>
    </li>
  );
}
