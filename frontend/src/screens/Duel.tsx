/**
 * Do'st bilan bellashuv — ikkita ekran, bitta fayl.
 *
 *   `Duel`       chaqiruv yasash: o'ynaysiz, keyin havola olasiz
 *   `DuelQabul`  /duel/<kod> — do'stingiz yuborgan havola
 *
 * Ikkalasi bir joyda, chunki ular bir xil o'yin oqimini ishlatadi va
 * bir xil natija ekranini chizadi. Ajratilsa, o'sha umumiy qismlar
 * uchinchi faylga chiqib, uchta faylni birga o'qish kerak bo'lardi.
 *
 * ──────────────── SAVOLLAR QAYERDAN KELADI ────────────────
 *
 * Serverdan faqat URUG' keladi (bitta son). Savollar ikkala qurilmada
 * o'sha urug'dan yasaladi (`lib/oyin/duel.ts`) va AYNAN bir xil
 * chiqadi. Shu sabab server savol saqlamaydi ham, yubormaydi ham.
 *
 * ──────────────── RAQIBNING BALI KO'RSATILMAYDI ────────────────
 *
 * Chaqiruvni ochgan odam raqibning yakuniy natijasini BILMAYDI —
 * faqat uning chizig'i o'yin davomida o'sib boradi. Son ko'rinsa duel
 * "nishonga urish" ga aylanardi: kerakli ballni o'tishi bilan o'yinchi
 * to'xtaydi va oxirigacha urinmaydi.
 */
import { useCallback, useEffect, useState } from "react";
import { Oqim } from "../components/oyin/Oqim";
import { Konfetti } from "../components/Konfetti";
import { Kutish } from "../components/Kutish";
import { Icon } from "../lib/icons";
import { t } from "../lib/matn";
import { useOrqaga, havolaniOch } from "../lib/qobiq";
import { useProgress } from "../lib/progress";
import { oyinById } from "../lib/oyin";
import { DUEL_VAQT, duelSavollari } from "../lib/oyin/duel";
import { tangaHisobi } from "../lib/oyin/rekord";
import {
  DuelXato, duelBoshla, duelKorish, duelNatija, duelQabul,
} from "../lib/api";
import type { DuelHolat, DuelNatija } from "../lib/api";
import type { Daraja, OyinNatija } from "../lib/oyin/tur";

/* ============================ chaqiruv yasash ============================ */

type Bosqich =
  | { nima: "yuklanmoqda" }
  | { nima: "xato"; matn: string }
  | { nima: "oyin"; duel: DuelHolat }
  | { nima: "havola"; duel: DuelHolat };

export function Duel({ onChiq }: { onChiq: () => void }) {
  const { oyinTugadi } = useProgress();
  useOrqaga(onChiq);

  const [bosqich, setBosqich] = useState<Bosqich>({ nima: "yuklanmoqda" });

  // Chaqiruv ekran ochilishi bilan yasaladi: "Chaqirish" tugmasini
  // bosgan odam allaqachon qaror qilgan va undan yana bir bosish
  // so'rash — yo'lni cho'zish.
  useEffect(() => {
    let bekor = false;
    duelBoshla()
      .then((d) => { if (!bekor) setBosqich({ nima: "oyin", duel: d }); })
      .catch((e) => {
        if (bekor) return;
        const kod = e instanceof DuelXato ? e.kod : 0;
        setBosqich({
          nima: "xato",
          matn: kod === 429 ? t("duelChegara") : t("duelXato"),
        });
      });
    return () => { bekor = true; };
  }, []);

  const tugadi = useCallback((n: OyinNatija, duel: DuelHolat) => {
    // Tanga darhol beriladi: o'yin o'ynaldi va uning mehnati
    // raqibning javobiga bog'liq emas.
    oyinTugadi(tangaHisobi(n.ball, false), n.savollar);
    duelNatija<DuelHolat>(duel.kod, n.ball, n.xato ?? 0, n.sanoq ?? [])
      .then((yangi) => setBosqich({ nima: "havola", duel: { ...duel, ...yangi } }))
      // Natija ketmasa ham havolani ko'rsatamiz: chaqiruv serverda
      // allaqachon bor va do'sti uni ochsa "tayyor emas" degan javob
      // oladi. Bu yo'qotishdan ko'ra tushunarliroq holat.
      .catch(() => setBosqich({ nima: "havola", duel }));
  }, [oyinTugadi]);

  if (bosqich.nima === "yuklanmoqda") return <Kutish />;

  if (bosqich.nima === "xato") {
    return <Xabar belgi="⚠️" sarlavha={bosqich.matn} onChiq={onChiq} />;
  }

  if (bosqich.nima === "havola") {
    return <HavolaEkrani duel={bosqich.duel} onChiq={onChiq} />;
  }

  return <DuelOyin duel={bosqich.duel} onChiq={onChiq}
                   onTugadi={(n) => tugadi(n, bosqich.duel)} />;
}

/* ============================ chaqiruvni qabul qilish ============================ */

type QBosqich =
  | { nima: "yuklanmoqda" }
  | { nima: "xato"; matn: string }
  | { nima: "taklif"; duel: DuelHolat }
  | { nima: "oyin"; duel: DuelHolat }
  | { nima: "natija"; natija: DuelNatija };

export function DuelQabul({ kod, onChiq }: { kod: string; onChiq: () => void }) {
  const { oyinTugadi } = useProgress();
  useOrqaga(onChiq);

  const [bosqich, setBosqich] = useState<QBosqich>({ nima: "yuklanmoqda" });

  useEffect(() => {
    let bekor = false;
    duelKorish(kod).then((d) => {
      if (bekor) return;
      if (!d) { setBosqich({ nima: "xato", matn: t("duelTopilmadi") }); return; }
      if (d.ozim) { setBosqich({ nima: "xato", matn: t("duelOzingiz") }); return; }
      if (d.holat === "tugadi") { setBosqich({ nima: "xato", matn: t("duelOynalgan") }); return; }
      if (d.holat === "muddati_otdi") { setBosqich({ nima: "xato", matn: t("duelMuddatiOtdi") }); return; }
      if (d.holat === "boshlanmagan") { setBosqich({ nima: "xato", matn: t("duelTopilmadi") }); return; }
      setBosqich({ nima: "taklif", duel: d });
    });
    return () => { bekor = true; };
  }, [kod]);

  const qabulQil = () => {
    setBosqich({ nima: "yuklanmoqda" });
    duelQabul(kod)
      .then((d) => setBosqich({ nima: "oyin", duel: d }))
      .catch((e) => {
        const k = e instanceof DuelXato ? e.kod : 0;
        setBosqich({
          nima: "xato",
          matn: k === 410 ? t("duelMuddatiOtdi")
            : k === 409 ? t("duelOynalgan")
            : t("duelXato"),
        });
      });
  };

  const tugadi = (n: OyinNatija) => {
    oyinTugadi(tangaHisobi(n.ball, false), n.savollar);
    duelNatija<DuelNatija>(kod, n.ball, n.xato ?? 0, n.sanoq ?? [])
      .then((r) => setBosqich({ nima: "natija", natija: r }))
      .catch(() => setBosqich({ nima: "xato", matn: t("duelXato") }));
  };

  if (bosqich.nima === "yuklanmoqda") return <Kutish />;

  if (bosqich.nima === "xato") {
    return <Xabar belgi="🙈" sarlavha={bosqich.matn} onChiq={onChiq} />;
  }

  if (bosqich.nima === "taklif") {
    return <Taklif duel={bosqich.duel} onQabul={qabulQil} onChiq={onChiq} />;
  }

  if (bosqich.nima === "natija") {
    return <Natija natija={bosqich.natija} onChiq={onChiq} />;
  }

  return (
    <DuelOyin
      duel={bosqich.duel} onChiq={onChiq} onTugadi={tugadi}
      raqib={{
        nom: bosqich.duel.chaqirgan,
        sanoq: bosqich.duel.raqibSanoq ?? [],
      }}
    />
  );
}

/* ============================ umumiy qismlar ============================ */

function DuelOyin({ duel, onChiq, onTugadi, raqib }: {
  duel: DuelHolat;
  onChiq: () => void;
  onTugadi: (n: OyinNatija) => void;
  raqib?: { nom: string; sanoq: number[] };
}) {
  const oyin = oyinById(duel.oyin);
  const savollar = oyin
    ? duelSavollari(duel.urug ?? 0, duel.oyin, duel.daraja as Daraja)
    : [];

  // O'yin topilmasa (server yangi o'yin nomini yuborgan, ilova esa eski)
  // — o'yinni boshlab bo'lmaydi. Bo'sh ekran o'rniga tushunarli xabar.
  if (!oyin || !savollar.length) {
    return <Xabar belgi="⚠️" sarlavha={t("duelXato")} onChiq={onChiq} />;
  }

  return (
    <Oqim
      oyin={oyin}
      daraja={duel.daraja as Daraja}
      savollar={savollar}
      vaqt={DUEL_VAQT}
      raqib={raqib}
      onChiq={onChiq}
      onTugadi={onTugadi}
      rekord={0}
      yakun={null}
    />
  );
}

/** Chaqiruv tayyor — havolani ulashish ekrani. */
function HavolaEkrani({ duel, onChiq }: { duel: DuelHolat; onChiq: () => void }) {
  const [nusxalandi, setNusxalandi] = useState(false);
  const matn = `${t("duelUlashMatn")}\n${duel.havola}`;

  const nusxala = () => {
    // `clipboard` ba'zi qurilmalarda (eski WebView, HTTPS'siz manzil)
    // umuman yo'q. Shunday paytda tugma jimgina ishlamay qolmasligi
    // kerak — havolaning o'zi ekranda ko'rinib turadi.
    navigator.clipboard?.writeText(duel.havola)
      .then(() => setNusxalandi(true))
      .catch(() => setNusxalandi(false));
  };

  const ulash = () => {
    havolaniOch(
      `https://t.me/share/url?url=${encodeURIComponent(duel.havola)}` +
      `&text=${encodeURIComponent(t("duelUlashMatn"))}`,
    );
  };

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-10 pb-10 text-center sm:max-w-[560px]">
      <div className="relative mx-auto w-fit">
        <Konfetti />
        <span className="grid size-20 place-items-center rounded-[26px] bg-brand-green text-[38px] shadow-clay">
          ⚔️
        </span>
      </div>

      <h1 className="mt-4 text-[24px]">{t("duelSizChaqirdingiz")}</h1>
      <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">{t("duelUlashing")}</p>

      <div className="mt-5 rounded-clay bg-karta p-3 text-[12px] break-all text-ink-soft shadow-clay-sm">
        {duel.havola || "—"}
      </div>

      <button type="button" onClick={ulash}
        className="tugma-3d az-yaltir mt-4 flex w-full items-center justify-center gap-2 rounded-3xl
                   bg-brand-blue py-3.5 font-display text-[16px] text-white
                   shadow-[0_5px_0_var(--color-brand-blue-d)]">
        <Icon name="send" size={18} />
        {t("duelUlash")}
      </button>

      <button type="button" onClick={nusxala}
        className="clay-press mt-2.5 w-full rounded-3xl bg-karta py-3 font-display text-[15px]
                   text-ink-soft shadow-clay-sm">
        {nusxalandi ? t("duelNusxalandi") : t("duelNusxa")}
      </button>

      <button type="button" onClick={onChiq}
        className="mt-3 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
        {t("duelOyinlarga")}
      </button>

      {/* Matn pastda turadi: ulashish tugmasi ishlamagan qurilmada odam
          uni qo'lda nusxalab yuborishi mumkin. */}
      <p className="mt-4 text-[11.5px] leading-snug text-ink-soft/70">{matn}</p>
    </div>
  );
}

/** "Do'stingiz chaqiryapti" — havolani ochgan odamga. */
function Taklif({ duel, onQabul, onChiq }: {
  duel: DuelHolat; onQabul: () => void; onChiq: () => void;
}) {
  const oyin = oyinById(duel.oyin);

  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col justify-center px-4 py-10
                    text-center sm:max-w-[560px]">
      <span className="mx-auto grid size-24 place-items-center rounded-[30px] bg-brand-orange
                       text-[46px] shadow-clay">
        ⚔️
      </span>

      <h1 className="mt-5 text-[24px] leading-tight">
        {t("duelChaqiruv", { nom: duel.chaqirgan })}
      </h1>
      <p className="mt-2 text-[14px] leading-snug text-ink-soft">{t("duelChaqiruvIzoh")}</p>

      {oyin && (
        <div className="mx-auto mt-5 flex items-center gap-2.5 rounded-clay bg-karta px-4 py-3 shadow-clay-sm">
          <span className="text-[24px]">{oyin.emoji}</span>
          <span className="font-display text-[15px]">{t(oyin.nom)}</span>
        </div>
      )}

      <button type="button" onClick={onQabul}
        className="tugma-3d az-yaltir mt-8 w-full rounded-3xl bg-brand-green py-4 font-display
                   text-[18px] text-white shadow-[0_6px_0_var(--color-brand-green-d)]">
        {t("duelQabul")}
      </button>

      <button type="button" onClick={onChiq}
        className="mt-3 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
        {t("keyinroq")}
      </button>
    </div>
  );
}

/** Duel natijasi. */
function Natija({ natija, onChiq }: { natija: DuelNatija; onChiq: () => void }) {
  const yutdi = natija.golib === "qabul";
  const durang = natija.golib === "durang";

  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pt-10 pb-10 text-center sm:max-w-[560px]">
      <div className="relative mx-auto w-fit">
        {yutdi && <Konfetti />}
        <span className={`grid size-20 place-items-center rounded-[26px] text-[38px] shadow-clay
                          ${yutdi ? "bg-brand-gold" : durang ? "bg-karta" : "bg-karta"}`}>
          {yutdi ? "🏆" : durang ? "🤝" : "😔"}
        </span>
      </div>

      <h1 className="mt-4 text-[25px]">
        {yutdi ? t("duelYutdingiz") : durang ? t("duelDurang") : t("duelYutqazdingiz")}
      </h1>

      <div className="mt-5 flex items-center justify-center gap-3">
        <Taraf nom={t("duelSiz")} ball={natija.meniki} kuchli={yutdi} />
        <span className="font-display text-[20px] text-ink-dim">:</span>
        <Taraf nom={natija.raqibIsm} ball={natija.raqib} kuchli={!yutdi && !durang} />
      </div>

      <button type="button" onClick={onChiq}
        className="tugma-3d mt-8 w-full rounded-3xl bg-brand-green py-3.5 font-display
                   text-[17px] text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
        {t("duelOyinlarga")}
      </button>
    </div>
  );
}

function Taraf({ nom, ball, kuchli }: { nom: string; ball: number; kuchli: boolean }) {
  return (
    <div className={`min-w-[104px] rounded-clay p-3 shadow-clay-sm
                     ${kuchli ? "bg-brand-green text-white" : "bg-karta"}`}>
      <div className="font-display text-[30px] leading-none">{ball}</div>
      <div className={`mt-1 truncate text-[12px] ${kuchli ? "text-white/85" : "text-ink-soft"}`}>
        {nom}
      </div>
    </div>
  );
}

/** Xato yoki tugagan chaqiruv — bitta oddiy ekran. */
function Xabar({ belgi, sarlavha, onChiq }: {
  belgi: string; sarlavha: string; onChiq: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-ekran w-full max-w-[430px] flex-col items-center justify-center
                    px-4 text-center">
      <span className="grid size-20 place-items-center rounded-[26px] bg-karta text-[38px] shadow-clay">
        {belgi}
      </span>
      <h1 className="mt-4 text-[21px] leading-tight">{sarlavha}</h1>
      <button type="button" onClick={onChiq}
        className="tugma-3d mt-7 w-full max-w-[280px] rounded-3xl bg-brand-green py-3.5
                   font-display text-[16px] text-white shadow-[0_5px_0_var(--color-brand-green-d)]">
        {t("duelOyinlarga")}
      </button>
    </div>
  );
}
