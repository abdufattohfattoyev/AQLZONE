/**
 * Reyting — kim qancha yulduz yig'gan.
 *
 * Uch jadval va uchtasi uch xil savolga javob beradi:
 *
 *   Liga       — o'ziga teng 20 bola ichida qayerdaman (`LigaJadval`).
 *   Jami       — butun vaqt bo'yicha. Uzoq o'ynagan bola yuqorida turadi.
 *   Shu hafta  — butun sayt bo'yicha, har dushanba noldan.
 *
 * Liga BIRINCHI turadi va ochilganda o'sha ko'rinadi. Sabab: qolgan ikki
 * jadval bir necha oydan keyin qotib qoladi — yangi kelgan bola
 * yuqoridagilarni hech qachon quvib yeta olmaydi va jadval unga begona
 * odamlar ro'yxatiga aylanadi. Ligada esa u har hafta o'ziga teng
 * bolalar bilan qaytadan boshlaydi.
 *
 * Umumiy jadvallarda o'z o'rning DOIM ko'rinadi — 100 talikka kirmasang,
 * pastda alohida qator bo'lib turadi.
 */
import { useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { LigaJadval } from "../components/LigaJadval";
import { getReyting } from "../lib/api";
import type { Reyting as ReytingMa, ReytingQator } from "../lib/api";

type Davr = "liga" | "jami" | "hafta";

/** Birinchi uchtaga medal. Qolganiga oddiy raqam. */
const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function Reyting({ onBack }: { onBack: () => void }) {
  const [davr, setDavr] = useState<Davr>("liga");
  const [ma, setMa] = useState<ReytingMa | null>(null);
  const [yuklanyapti, setYuklanyapti] = useState(true);

  useEffect(() => {
    // Liga o'z ma'lumotini o'zi oladi — bu yerda so'rov yubormaymiz.
    if (davr === "liga") return;
    let bekor = false;
    setYuklanyapti(true);
    getReyting(davr).then((d) => {
      if (bekor) return;
      setMa(d);
      setYuklanyapti(false);
    });
    return () => { bekor = true; };
  }, [davr]);

  // O'zim top ro'yxatida bormi. Bo'lmasam — pastda alohida ko'rsataman.
  const menRoyxatda = Boolean(ma?.top.some((q) => q.men));
  const umumiy = davr !== "liga";

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-4 pb-16 sm:max-w-[560px]">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onBack} title="Ortga"
          className="clay-press grid size-[38px] place-items-center rounded-full bg-karta text-ink-soft shadow-clay-sm">
          <Icon name="chevron" size={20} className="rotate-180" />
        </button>
      </div>

      <div className="az-kirish mt-4 text-center">
        <span className="grid size-16 place-items-center rounded-[22px] bg-brand-gold/15 mx-auto">
          <Icon name="trophy" size={34} className="text-brand-gold" />
        </span>
        <h1 className="mt-3 text-[22px]">Reyting</h1>
        <p className="mt-1 text-[13px] leading-snug text-ink-soft">
          {davr === "liga"
            ? "Har hafta yangi guruh, yangi imkoniyat"
            : ma?.qatnashchilar
              ? `${ma.qatnashchilar} ta qatnashchi`
              : "Yulduz yig'ib yuqoriga chiqing"}
        </p>
      </div>

      {/* ---- davr ---- */}
      <div className="az-kirish mt-4 flex gap-1 rounded-full bg-karta p-1 shadow-clay-sm">
        <Tab faol={davr === "liga"} onClick={() => setDavr("liga")}>Liga</Tab>
        <Tab faol={davr === "jami"} onClick={() => setDavr("jami")}>Jami</Tab>
        <Tab faol={davr === "hafta"} onClick={() => setDavr("hafta")}>Shu hafta</Tab>
      </div>

      {davr === "liga" && <LigaJadval />}

      {/* Quyisi FAQAT umumiy jadvallar uchun: liga tabida `ma` oldingi
          tabdan qolgan eski ma'lumot bo'ladi va uni ko'rsatib bo'lmaydi. */}
      {umumiy && <>
      {yuklanyapti && (
        <p className="mt-8 text-center text-[13px] text-ink-dim">Yuklanyapti…</p>
      )}

      {!yuklanyapti && ma === null && (
        <div className="az-kirish mt-6 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <div className="text-[34px] leading-none">📶</div>
          <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">
            Reyting serverdan olinadi va hozir aloqa yo'q.
            Darslar baribir ishlayveradi — internet paydo bo'lganda qaytib keling.
          </p>
        </div>
      )}

      {!yuklanyapti && ma?.top.length === 0 && (
        <div className="az-kirish mt-6 rounded-clay bg-karta p-5 text-center shadow-clay-sm">
          <div className="text-[34px] leading-none">⭐</div>
          <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">
            {davr === "hafta"
              ? "Bu hafta hali hech kim yulduz yig'magan. Birinchi bo'ling!"
              : "Reyting hali bo'sh. Birinchi darsni yeching va ro'yxatni boshlang."}
          </p>
        </div>
      )}

      {!yuklanyapti && ma && ma.top.length > 0 && (
        <ol className="mt-4 space-y-2">
          {ma.top.map((q, i) => (
            <Qator key={`${q.orin}-${q.toliqIsm}`} q={q} kech={i * 40} />
          ))}
        </ol>
      )}

      {/* ---- o'z o'rnim ----
          Top ichida bo'lsam takrorlamayman: bir odam jadvalda ikki marta
          turgani chalkashtiradi. */}
      {!yuklanyapti && ma?.men && !menRoyxatda && (
        <>
          <div className="my-3 text-center text-[18px] leading-none text-ink-dim">···</div>
          <Qator q={ma.men} kech={0} />
        </>
      )}

      {/* Yulduzi yo'q — hali o'rin ham yo'q. */}
      {!yuklanyapti && ma && !ma.men && !menRoyxatda && ma.top.length > 0 && (
        <p className="mt-4 text-center text-[12.5px] leading-snug text-ink-dim">
          {davr === "hafta"
            ? "Bu hafta hali yulduz yig'magansiz — bitta dars yeting va ro'yxatda paydo bo'lasiz"
            : "Hali yulduzingiz yo'q — birinchi darsni yeching"}
        </p>
      )}
      </>}
    </div>
  );
}

function Tab({ faol, onClick, children }: {
  faol: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex-1 rounded-full py-2 font-display text-[13.5px] transition-colors ${
        faol ? "bg-brand-green text-white" : "text-ink-soft"
      }`}>
      {children}
    </button>
  );
}

function Qator({ q, kech }: { q: ReytingQator; kech: number }) {
  const medal = MEDAL[q.orin];
  return (
    <li className={`az-kirish flex items-center gap-3 rounded-clay p-3 shadow-clay-sm ${
      q.men ? "bg-brand-green/12 ring-2 ring-brand-green" : "bg-karta"
    }`} style={{ "--az-kech": `${kech}ms` } as React.CSSProperties}>
      {/* O'rin: uchtasiga medal, qolganiga raqam. Kenglik qat'iy —
          aks holda 1 va 100 turli joydan boshlanib, ustun tishli ko'rinardi. */}
      <span className="grid w-9 shrink-0 place-items-center">
        {medal
          ? <span className="text-[24px] leading-none">{medal}</span>
          : <span className="font-display text-[15px] text-ink-dim">{q.orin}</span>}
      </span>

      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-track text-[21px]">
        {q.avatar || "🦊"}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[14.5px] leading-tight">
          {q.toliqIsm || "Noma'lum"}
          {q.men && <span className="ml-1.5 text-[11.5px] text-brand-green-d">siz</span>}
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-ink-dim">
          {q.bola ? `${q.bola} · ` : ""}{q.darslar} dars
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-track px-2.5 py-1.5">
        <Icon name="star" size={15} className="text-brand-gold" />
        <span className="font-display text-[14px]">{q.yulduz}</span>
      </span>
    </li>
  );
}
