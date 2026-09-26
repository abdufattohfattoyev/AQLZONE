/**
 * MEN — pastki paneldagi beshinchi bo'lim (`manba/Men.dc.html`).
 *
 * Eski "Menyu" o'rnida turadi. Menyu 25 dan ortiq narsani bitta
 * ro'yxatga yig'ardi; darslar, testlar va o'yinlar endi o'z tablarida
 * turadi, bu yerda esa faqat ODAMNING O'ZIGA tegishli narsalar qoldi:
 *
 *   profil kartasi   ism, kim ekani, bolalar orasida almashtirish
 *   uch son          yulduz va tanga (oltin — mukofot), zanjir
 *   Yutuqlar         reyting, nishonlar, do'kon
 *   Ota-ona uchun    ota-ona paneli, bolalar profillari
 *   Sozlamalar       til, yorug'lik, hisob va Telegram, "siz kimsiz"
 *
 * Kursga bog'liq sahifalar (nishonlar, do'kon, ota-ona) qaysi kursni
 * ochadi: oliy yo'lda — profilning o'z kursi, aks holda oxirgi ochilgan
 * kurs, u ham bo'lmasa profil sinfining kursi (`lib/oxirgi.ts`,
 * `lib/profil.ts`). Eski panel ham aynan shu qoidada ishlardi.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { getHisob, getReyting, joriyProfil, profilSoni } from "../lib/api";
import type { Hisob } from "../lib/api";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import type { Kalit } from "../lib/matn";
import { nishonlar, olingan } from "../lib/nishon";
import { oxirgiKurs } from "../lib/oxirgi";
import { joriyKurs, kichkintoyKerak, profilNomi, useProfil } from "../lib/profil";
import { rejimgaKir } from "../lib/kichkintoyRejim";
import { useProgress } from "../lib/progress";
import { tgIsm, tebrat } from "../lib/qobiq";
import { TILLAR, til, tilniAlmashtir } from "../lib/til";
import { obuna, yoruglikniOqi, yoruglikniQoy } from "../lib/yoruglik";
import type { Yoruglik } from "../lib/yoruglik";
import {
  yolAnketa, yolDokon, yolKichkintoy, yolNishon, yolOtaOna, yolReyting, yolSozlama,
} from "../lib/yollar";
import { Tanlov, TanlovVaraq } from "../components/Varaq";

interface Props {
  /** Ichki sahifaga o'tish — marshrut `App.tsx` da. */
  onYol: (yol: string) => void;
}

const YORUGLIK: { kod: Yoruglik; kalit: Kalit }[] = [
  { kod: "avto", kalit: "yoruglikAvto" },
  { kod: "oq", kalit: "yoruglikOq" },
  { kod: "qora", kalit: "yoruglikQora" },
];

/** "Dilnoza Rahimova" → "DR". Bitta so'z bo'lsa — bitta harf. */
const bosHarflar = (ism: string): string =>
  ism.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("");

export function Men({ onYol }: Props) {
  const prof = useProfil();
  const { progressOf, kunlik, jamiTanga, jamiYulduz } = useProgress();
  const yoruglik = useSyncExternalStore(obuna, yoruglikniOqi, () => "avto" as const);
  const [hisob, setHisob] = useState<Hisob | null>(null);
  const [orin, setOrin] = useState<number | null>(null);
  const [varaq, setVaraq] = useState<"til" | "yoruglik" | null>(null);

  // Ikkala so'rov ham internetsiz `null` qaytaradi — ekran ularsiz ham
  // to'liq ishlaydi, faqat ism va reyting o'rni ko'rinmaydi.
  useEffect(() => {
    let bekor = false;
    getHisob().then((h) => { if (!bekor) setHisob(h); });
    getReyting("jami").then((r) => { if (!bekor) setOrin(r?.men?.orin ?? null); });
    return () => { bekor = true; };
  }, []);

  const kurs = joriyKurs(prof, oxirgiKurs());

  const p = progressOf(kurs);
  const nishon = useMemo(() => {
    const n = nishonlar({ progress: p, kunlik, units: kurs.units, savollar: p.savollar ?? 0 });
    return { olingan: olingan(n), jami: n.length };
  }, [p, kunlik, kurs]);

  // Ko'p bolali hisobda kartada TANLANGAN BOLANING ismi: "Almashtirish"
  // aynan uni almashtiradi. Bitta bolada — hisob egasining ismi.
  const bolalar = hisob?.profillar ?? [];
  const kopBola = profilSoni() > 1;
  const bola = bolalar.find((b) => String(b.id) === joriyProfil()) ?? bolalar[0];
  const ism = (kopBola && bola?.ism) || hisob?.toliqIsm || tgIsm() || bola?.ism || t("menMehmon");

  // Ota-ona bo'limi bolasi uchun kelganlarga. Talaba, abituriyent va
  // "o'zim uchun" deganlarga u begona (eski Menyu ham shunday qilardi).
  const oziUchun = ["talaba", "abiturient", "kattalar"].includes(prof?.kim ?? "");
  const tilNomi = TILLAR.find((x) => x.kod === til())?.nom ?? "";
  const yoruglikNomi = t(YORUGLIK.find((x) => x.kod === yoruglik)?.kalit ?? "yoruglikAvto");

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col gap-3.5 px-4 pt-5 pb-3
                    min-[360px]:px-[18px] sm:max-w-[560px]">
      <h1 className="sr-only">{t("menSarlavha")}</h1>

      {/* ---- profil kartasi ---- */}
      <div className="flex items-center gap-3 rounded-clay bg-karta p-4 shadow-clay-sm min-[360px]:gap-3.5">
        <span aria-hidden
          className="grid size-[52px] shrink-0 place-items-center rounded-full bg-brand-blue/12
                     font-display text-[21px] font-bold text-brand-blue-t min-[360px]:size-[60px]
                     min-[360px]:text-[24px]">
          {bosHarflar(ism)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-display text-[19px] leading-tight font-bold break-words
                           min-[360px]:text-[21px]">{ism}</span>
          {prof && <span className="text-[14px] text-ink-dim">{profilNomi(prof)}</span>}
        </span>
        <button type="button" onClick={() => onYol("/profillar")} data-tahlil="Men: almashtirish"
          className="clay-press min-h-11 shrink-0 rounded-xl bg-track px-3 text-[14px] font-bold
                     text-brand-blue-t">
          {t("menAlmashtir")}
        </button>
      </div>

      {/* ---- uch son ---- Yulduz va tanga OLTIN (mukofot), zanjir — neytral. */}
      <div className="grid grid-cols-3 gap-2">
        <Son n={String(jamiYulduz)} nom={t("menYulduz")} oltin />
        <Son n={String(jamiTanga)} nom={t("menTanga")} oltin />
        <Son n={t("menKun", { n: kunlik.kunlar })} nom={t("menZanjir")} />
      </div>

      <Guruh nom={t("menYutuqlar")}>
        <Qator ic="chart" nom={t("reyting")} qiymat={orin ? t("menReytingOrin", { n: orin }) : ""}
          on={() => onYol(yolReyting())} />
        <Qator ic="miya" nom={t("nishonlar")} qiymat={`${nishon.olingan} / ${nishon.jami}`}
          on={() => onYol(yolNishon(kurs))} />
        <Qator ic="palette" nom={t("tabDokon")} on={() => onYol(yolDokon(kurs))} />
      </Guruh>

      {!oziUchun && (
        <Guruh nom={t("menOtaOnaUchun")}>
          <Qator ic="vazifa" nom={t("otaOnaPaneli")} qiymat={t("menHisobot")}
            on={() => onYol(yolOtaOna(kurs))} />
          <Qator ic="menyu" nom={t("menProfillar")}
            qiymat={bolalar.length ? t("menProfilSoni", { n: bolalar.length }) : ""}
            on={() => onYol("/profillar")} />
          {/* Kichkintoy rejimi — telefonni 2–5 yoshli bolaga berishdan oldin.
              Chiqish faqat qulf orqali (`lib/kichkintoyRejim.ts`). */}
          {kichkintoyKerak(prof) && (
            <Qator ic="puzzle" nom={t("kichkintoyRejimi")} qiymat={t("kichkintoyRejimiIzoh")}
              on={() => { rejimgaKir(); onYol(yolKichkintoy()); }} />
          )}
        </Guruh>
      )}

      <Guruh nom={t("menSozlamalar")}>
        <Qator ic="xarita" nom={t("tilSarlavha")} qiymat={tilNomi} on={() => setVaraq("til")} />
        <Qator ic="koz" nom={t("yoruglikSarlavha")} qiymat={yoruglikNomi}
          on={() => setVaraq("yoruglik")} />
        <Qator ic="pencil" nom={t("menTelegram")}
          qiymat={hisob ? t(hisob.telegram ? "boglangan" : "boglanmagan") : ""}
          on={() => onYol(yolSozlama())} />
        {prof && (
          <Qator ic="savol" nom={t("menKimsiz")} qiymat={profilNomi(prof)}
            on={() => onYol(yolAnketa())} />
        )}
      </Guruh>

      {varaq === "til" && (
        <TanlovVaraq sarlavha={t("tilSarlavha")} onYop={() => setVaraq(null)}>
          {TILLAR.map((x) => (
            <Tanlov key={x.kod} faol={x.kod === til()}
              on={() => { setVaraq(null); void tilniAlmashtir(x.kod); }}>
              {x.nom}
            </Tanlov>
          ))}
        </TanlovVaraq>
      )}
      {varaq === "yoruglik" && (
        <TanlovVaraq sarlavha={t("yoruglikSarlavha")} onYop={() => setVaraq(null)}>
          {YORUGLIK.map((x) => (
            <Tanlov key={x.kod} faol={x.kod === yoruglik}
              on={() => { yoruglikniQoy(x.kod); tebrat("tanlov"); setVaraq(null); }}>
              {t(x.kalit)}
            </Tanlov>
          ))}
        </TanlovVaraq>
      )}
    </div>
  );
}

function Son({ n, nom, oltin = false }: { n: string; nom: string; oltin?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-0.5 rounded-[18px] bg-karta px-1.5 py-3
                    shadow-clay-sm">
      <span className={`max-w-full truncate font-display text-[21px] leading-tight font-bold
                        min-[360px]:text-[24px] ${oltin ? "text-brand-gold-d" : ""}`}>{n}</span>
      <span className="text-[13px] text-ink-dim">{nom}</span>
    </div>
  );
}

function Guruh({ nom, children }: { nom: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h2 className="pl-1 text-[13px] font-bold tracking-[0.06em] text-ink-dim uppercase">{nom}</h2>
      <div className="flex flex-col divide-y divide-track overflow-hidden rounded-[20px] bg-karta
                      shadow-clay-sm">
        {children}
      </div>
    </section>
  );
}

/** Guruhdagi bitta qator: belgi · nom · qiymat · strelka. */
function Qator({ ic, nom, qiymat = "", on }: {
  ic: string; nom: string; qiymat?: string; on: () => void;
}) {
  return (
    <button type="button" onClick={on} data-tahlil={`Men: ${ic}`}
      className="clay-press flex min-h-[54px] w-full items-center gap-3 px-3.5 text-left">
      <img src={`/belgi/${ic}.webp`} width={28} height={28} alt="" decoding="async"
        className="size-7 shrink-0 object-contain" />
      <span className="min-w-0 flex-1 truncate text-[16px] font-semibold">{nom}</span>
      {/* Uzun qiymat ("Haftalik hisobot") tor telefonda nomni qirqib
          qo'yardi — u yerda nom muhimroq, qiymat yashiriladi. Chegara
          yozuvlar UZUNLIGIDAN: ruscha satrlar o'zbekchadan uzunroq. */}
      {qiymat && (
        <span className={`max-w-[45%] shrink truncate text-[14px] text-ink-dim ${
          nom.length + qiymat.length > 31 ? "hidden min-[400px]:block"
            : nom.length + qiymat.length > 24 ? "hidden min-[360px]:block" : ""}`}>{qiymat}</span>
      )}
      <Icon name="chevron" size={18} className="shrink-0 text-ink-dim" />
    </button>
  );
}
