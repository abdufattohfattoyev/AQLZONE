/**
 * JONLI TAKLIF OYNASI — "Aziz sizni bellashuvga chaqiryapti · 12 s".
 *
 * Ilova ochiq turganda do'st jonli taklif yuborsa, shu oyna chiqadi.
 * Bot xabari EMAS: xabar ertaga o'qiladi, jonli o'yin esa hozir kerak.
 *
 * ─────────────────── UCH SHART (2026-09-17) ───────────────────
 *
 *   1. Faqat RUXSAT ETILGAN ekranda — bosh sahifa, o'yinlar, kurs
 *      xaritasi (bola darsni tugatib qaytgan joy). Savol yechayotgan
 *      bolaning diqqati bo'linmaydi: u ekranlarda so'rov ham ketmaydi.
 *      `MUDDAT` dan keyin oyna o'zi yopiladi.
 *   2. Faqat TANISHdan — server tekshiradi (`duel.tanishmi`).
 *   3. Chegara — server tekshiradi: juftlikka soatiga bitta, kuniga ikki
 *      rad, sozlamada "takliflarni o'chirish".
 *
 * O'z-o'zidan yopilish RAD hisoblanmaydi: bola boshqa xonada bo'lishi
 * mumkin, uni chegaraga yozish adolatsiz bo'lardi. Faqat "Rad etish"
 * tugmasi rad deb yoziladi.
 *
 * ─────────────────── BITTA QAROR (2026-09-26) ───────────────────
 *
 * Oynada 15 soniya bor va ilgari uning ichida daraja tanlovi turardi
 * ("Oson/O'rta/Qiyin" + izoh + "Siz: Oson · Aziz: Qiyin"). Bola shu
 * uchta tugma ustida o'ylanib qolar va vaqt tugardi. Endi daraja anketa
 * va o'yin tajribasidan o'zi olinadi (`duelDarajaTaklif`) va oynada
 * bitta savol qoladi: o'ynaymi-yo'qmi. Chess.com va Lichess'dagi
 * chaqiruv ham shunday: kim, qaysi o'yin, "Qabul" / "Rad".
 *
 * Daraja turgan joyda endi ikkita narsa: do'st bilan umumiy hisob
 * (o'ynash uchun eng kuchli sabab) va "har kim o'z sinfiga mos misol
 * oladi" — bola dadasi bilan o'ynashdan qo'rqmasin.
 *
 * Chaqirgan odam taklifni BEKOR qilsa, oyna keyingi so'rovda o'zi
 * yopiladi va "Aziz taklifni bekor qildi" deb aytadi.
 */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmojiBelgi, EmojiMatn } from "../lib/hajmli";
import { avatarBelgi } from "../lib/dokon";
import { t } from "../lib/matn";
import { tebrat } from "../lib/qobiq";
import { useTgHisob } from "../lib/tgHisob";
import { duelTaklifJavob, duelTaklifOl } from "../lib/api";
import type { KelganTaklif } from "../lib/api";
import { oyinById } from "../lib/oyin";
import { duelDarajaTaklif } from "../lib/oyin/duelDaraja";
import { DuelXato } from "../lib/api";
import { yolDuelKod } from "../lib/yollar";

/**
 * Qancha vaqtda bir so'raladi.
 *
 * Sakkiz soniya: taklif 15 soniya yashaydi, ya'ni eng yomon holatda ham
 * oyna yetti soniya ko'rinib turadi. Tezroq so'rov serverga ortiqcha
 * yuk — bu so'rov ilovani ochib turgan HAR BIR odamdan keladi.
 */
const SOROV_MS = 8_000;

/**
 * Taklif ko'rsatiladigan ekranlar.
 *
 * Ruxsat ro'yxati (taqiq ro'yxati emas): yangi ekran qo'shilsa, u
 * avtomatik "taklifsiz" bo'ladi. Aks holda kimdir yangi test ekranini
 * qo'shadi va bolaga savol o'rtasida oyna chiqa boshlaydi.
 */
const ruxsatmi = (yol: string): boolean =>
  /^\/$/.test(yol)
  || /^\/darslar\/?$/.test(yol)
  || /^\/oyinlar\/?$/.test(yol)
  || /^\/oyinlar\/duel\/?$/.test(yol)
  || /^\/reyting\/?$/.test(yol)
  || /^\/kurs\/[^/]+\/?$/.test(yol);

export function DuelTaklifOyna() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const [taklif, setTaklif] = useState<KelganTaklif | null>(null);
  const [qolgan, setQolgan] = useState(0);
  const [band, setBand] = useState(false);
  const [xabar, setXabar] = useState("");
  // Bir taklif bir marta: "Keyinroq" dan keyin keyingi so'rov uni
  // (server hali yopmagan bo'lsa) qayta ochib qo'ymasin.
  const korilgan = useRef(new Set<number>());
  // Ochiq oyna — so'rov ichidan (yopilgan klojurada) ko'rinsin.
  const ochiqRef = useRef<{ id: number; kimdan: string; qolgan: number } | null>(null);
  ochiqRef.current = taklif ? { id: taklif.id, kimdan: taklif.kimdan, qolgan } : null;

  const xabarBer = (m: string) => {
    setXabar(m);
    setTimeout(() => setXabar(""), 3000);
  };

  // Bellashuv faqat Telegram hisobi bilan o'ynaladi — boshqalardan
  // so'rov yuborishning ma'nosi yo'q, bu esa har 8 soniyadagi yukni
  // ancha kamaytiradi.
  const tg = useTgHisob();
  const ruxsat = tg === "ha" && ruxsatmi(pathname);

  /* ---- so'rov: faqat ruxsat etilgan ekranda va ilova ko'rinib turganda ---- */
  useEffect(() => {
    if (!ruxsat) { setTaklif(null); return; }
    let bekor = false;
    const sora = async () => {
      if (document.hidden) return;
      const h = await duelTaklifOl();
      if (bekor || !h) return;
      // Ochiq taklif serverda yo'qoldi — chaqirgan bekor qildi yoki
      // lobbidan ketdi. Oxirgi ikki soniyada esa bu oddiy muddat tugashi,
      // uni "bekor qildi" deyish yolg'on bo'lardi.
      const ochiq = ochiqRef.current;
      if (ochiq && h.taklif?.id !== ochiq.id) {
        setTaklif(null);
        if (ochiq.qolgan > 2) xabarBer(t("duelTaklifBekorQildi", { nom: ochiq.kimdan }));
      }
      if (!h.taklif || korilgan.current.has(h.taklif.id)) return;
      const k = h.taklif;
      korilgan.current.add(k.id);
      setQolgan(k.qolgan);
      setXabar("");
      setTaklif(k);
      tebrat("tanlov");
    };
    void sora();
    const id = setInterval(() => void sora(), SOROV_MS);
    document.addEventListener("visibilitychange", sora);
    return () => {
      bekor = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", sora);
    };
  }, [ruxsat]);

  /* ---- sanoq: 0 da jimgina yopiladi (rad emas) ---- */
  useEffect(() => {
    if (!taklif) return;
    const id = setInterval(() => {
      setQolgan((n) => {
        if (n <= 1) { clearInterval(id); setTaklif(null); return 0; }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [taklif]);

  if (!taklif || !ruxsat) {
    return xabar ? (
      <div role="status" className="fixed inset-x-0 bottom-6 z-[85] mx-auto w-fit rounded-full
                                    bg-ink px-4 py-2.5 text-[13.5px] text-white shadow-clay">
        {xabar}
      </div>
    ) : null;
  }

  const oyin = oyinById(taklif.oyin);
  const hisob = taklif.hisob;

  const javob = (qabul: boolean) => {
    setBand(true);
    duelTaklifJavob(taklif.id, qabul, qabul ? duelDarajaTaklif(taklif.oyin) : undefined)
      .then((j) => {
        setTaklif(null);
        if (qabul) nav(yolDuelKod(j.kod));
      })
      .catch((e) => {
        setTaklif(null);
        if (qabul) {
          xabarBer(e instanceof DuelXato && e.sabab === "bekor"
            ? t("duelTaklifBekorQildi", { nom: taklif.kimdan }) : t("duelTaklifEskirdi"));
        }
      })
      .finally(() => setBand(false));
  };

  return (
    <div className="az-kanal-fon fixed inset-0 z-[85] grid place-items-center bg-black/45 p-4
                    backdrop-blur-[2px]" role="dialog" aria-modal="true"
      aria-labelledby="duel-taklif-sarlavha">
      <div className="az-kirish w-full max-w-[380px] rounded-clay bg-karta p-5 text-center shadow-clay">
        <div className="flex items-center justify-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-track text-[22px]">
            <EmojiBelgi e={avatarBelgi(taklif.avatar)} olcham={24} />
          </span>
          <EmojiBelgi e="⚔️" olcham={28} />
          {oyin && (
            <span className="grid size-12 place-items-center rounded-full bg-track">
              <EmojiBelgi e={oyin.emoji} olcham={26} />
            </span>
          )}
        </div>

        <h2 id="duel-taklif-sarlavha" className="mt-3 text-[19px] leading-tight">
          {t("duelTaklifKeldi", { nom: taklif.kimdan })}
        </h2>
        <p className="mt-1 text-[13px] leading-snug text-ink-soft">
          {oyin ? `${t(oyin.nom)} · ` : ""}{taklif.savollar} · {t("duelSoniya", { n: taklif.vaqt })}
        </p>
        {hisob && hisob.jami > 0 && (
          // Hisob — o'ynash uchun eng kuchli sabab, shuning uchun alohida
          // yorliq bo'lib turadi (oltin — reyting rangi).
          <p className="mx-auto mt-2 w-fit rounded-full bg-brand-gold/15 px-3 py-1 text-[13px]
                        font-semibold text-brand-gold-d">
            {t("duelDostHisob", { men: hisob.men, raqib: hisob.raqib })}
            {(hisob.zanjir ?? 0) > 0 && (
              <span>
                {" · "}<EmojiMatn>{t("duelZanjir", { n: hisob.zanjir ?? 0 })}</EmojiMatn>
              </span>
            )}
          </p>
        )}

        {/* Daraja tanlovi o'rnida — adolat haqida bitta qator. */}
        <p className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-track px-3 py-1.5
                      text-[12px] leading-snug text-ink-soft">
          <EmojiBelgi e="🎓" olcham={14} />
          {t("duelTaklifAdolat")}
        </p>

        {/* Qolgan vaqt chizig'i — raqam bilan birga: bola sonni o'qimasa
            ham chiziq qisqarayotganini ko'radi. */}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-track">
          <div className="h-full rounded-full bg-brand-green transition-[width] duration-1000 ease-linear"
            style={{ width: `${Math.min(100, (qolgan / 15) * 100)}%` }} />
        </div>

        <button type="button" onClick={() => javob(true)} disabled={band}
          data-tahlil="Duel taklif: qabul"
          className="tugma-3d mt-3 w-full rounded-3xl bg-brand-green py-3.5 font-display text-[17px]
                     text-white shadow-[0_5px_0_var(--color-brand-green-d)] disabled:opacity-60">
          {t("duelTaklifQabul", { n: qolgan })}
        </button>
        <button type="button" onClick={() => javob(false)} disabled={band}
          data-tahlil="Duel taklif: keyinroq"
          className="mt-2 w-full py-2 text-[13.5px] font-semibold text-ink-dim">
          {t("duelTaklifRadEt")}
        </button>
      </div>
    </div>
  );
}
