/**
 * Yo'lboshchi — ilovaga birinchi marta kirgan odam uchun ekran bo'yicha sayohat.
 *
 * Muammo: kurs sahifasida yettita boshqaruv bor va ularning hech biri
 * o'zini tanishtirmaydi. Katta odam ularni birma-bir bosib ko'radi,
 * bola esa bosmaydi — u ekranda birinchi ko'rgan narsasini bosadi va
 * qolganini umuman topmaydi. Nishonlar, do'kon, kunlik maqsad — hammasi
 * shu sabab ko'pincha ochilmay qolardi.
 *
 * Yechim — YORUG' DOG': ekran qorayadi, faqat bitta element yorug'
 * qoladi va Aql uni bir gap bilan tushuntiradi. Dog' qadamdan qadamga
 * SILJIB o'tadi, sakramaydi: ko'z uni kuzatib boradi va shu harakatning
 * o'zi "endi mana bu haqda gapiryapmiz" deb aytadi — matnsiz ham.
 *
 * `Ogit` dan bitta farqi bor va u ataylab: bu yerda qadamlar O'ZI
 * almashmaydi. O'git — multfilm, uni ko'rib o'tirasan; yo'lboshchi esa
 * yo'l ko'rsatadi va odam har qadamda ekranga qarab ulgurishi kerak.
 * Taymer bilan surilsa, o'qishga ulgurmagan odam orqaga qaytara olmasdi.
 *
 * Nishonlar `data-tur` atributi bilan topiladi. Ya'ni ekran o'zgarsa,
 * bu fayl emas, o'sha atribut ko'chadi — va nishon topilmasa qadam
 * shunchaki matn bo'lib ko'rsatiladi, sayohat buzilmaydi.
 */
import { useCallback, useEffect, useState } from "react";
import { Icon } from "../lib/icons";
import { Logo } from "./Logo";
import { gapir } from "../lib/ovoz";
import { turKorildi } from "../lib/tur";

interface Qadam {
  /** Yoritiladigan elementning `data-tur` qiymati. Bo'lmasa — butun ekran. */
  nishon?: string;
  matn: string;
}

/**
 * Qadamlar TARTIBI — bolaning savollari tartibi:
 * "nima qilaman?" → "nima olaman?" → "qancha qilaman?" → "keyin nima?"
 * → "yana nima bor?". Shu sabab birinchi bo'lib eng katta yashil tugma
 * tushuntiriladi, oxirida esa qo'shimcha ekranlar.
 */
const QADAMLAR: Qadam[] = [
  { matn: "Salom! Men Aql. Bu yerda nima qayerda turishini ko'rsatib beraman." },
  { nishon: "davom", matn: "Dars shu tugmadan boshlanadi. Bir bosasan — va o'qish boshlanadi." },
  { nishon: "hisob", matn: "Har bir to'g'ri javob uchun yulduz va tanga olasan." },
  { nishon: "maqsad", matn: "Har kuni shuncha savol yechsang, zanjiring uzilmaydi." },
  { nishon: "boblar", matn: "Darslar boblarga bo'lingan. Bobni ochsang, ichida dars yo'li chiqadi." },
  { nishon: "panel", matn: "Pastda nishonlaring, do'koning va reyting turadi." },
];

/** Yorug' dog' element chekkasidan qancha kengroq bo'lsin. */
const ZAXIRA = 8;

interface Dog {
  top: number; left: number; width: number; height: number; radius: number;
}

export function Yolboshchi({ onTugadi }: { onTugadi: () => void }) {
  const [i, setI] = useState(0);
  const [dog, setDog] = useState<Dog | null>(null);
  const qadam = QADAMLAR[i];
  const oxirgi = i >= QADAMLAR.length - 1;

  /** Nishonni topib, uning joyini o'lchaydi. */
  const olcha = useCallback((nishon: string | undefined): Dog | null => {
    if (!nishon) return null;
    const el = document.querySelector<HTMLElement>(`[data-tur="${nishon}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    // Burchak radiusi elementnikidan olinadi, shunda dog' aynan o'sha
    // shaklda bo'ladi — dumaloq tugma dumaloq, karta yumaloq burchakli.
    const xom = parseFloat(getComputedStyle(el).borderRadius) || 12;

    // Dog' ekran ichida qoladi. Busiz pastdagi panel (u ekran chekkasiga
    // yopishgan) atrofidagi oq halqa pastdan va yon tomondan qirqilib,
    // "yorug' dog'" o'rniga tugallanmagan chiziq bo'lib ko'rinardi.
    const chap = Math.max(0, r.left - ZAXIRA);
    const tep = Math.max(0, r.top - ZAXIRA);
    const ong = Math.min(window.innerWidth, r.right + ZAXIRA);
    const past = Math.min(window.innerHeight, r.bottom + ZAXIRA);

    return {
      top: tep,
      left: chap,
      width: ong - chap,
      height: past - tep,
      radius: xom + ZAXIRA,
    };
  }, []);

  /* --- qadam almashganda: nishonni ko'rinishga surib, o'lchaymiz --- */
  useEffect(() => {
    let bekor = false;
    const el = qadam.nishon
      ? document.querySelector<HTMLElement>(`[data-tur="${qadam.nishon}"]`)
      : null;

    // Nishon ekrandan tashqarida bo'lishi mumkin (boblar ro'yxati pastda).
    // Avval uni ko'rinishga suramiz, KEYIN o'lchaymiz — aks holda dog'
    // ekrandan tashqarida chizilardi.
    //
    // Surilish DARHOL bo'ladi, silliq emas. Silliq surilish kadrlarni
    // talab qiladi va u tugamasdan qolishi mumkin (sahifa orqa fonda,
    // brauzer kadrlarni to'xtatgan, "harakatni kamaytirish" yoqilgan) —
    // o'shanda yorug' dog' ekrandan tashqarida chizilib, qadam butunlay
    // bo'sh ko'rinardi. Harakat baribir bor: dog'ning o'zi nishondan
    // nishonga suzib o'tadi.
    el?.scrollIntoView({ block: "center", behavior: "auto" });

    // Ikki marta o'lchaymiz. Surilishdan keyin sahifa qayta joylashishi
    // mumkin (`Reveal` kartalari ochiladi va balandlik o'zgaradi), shuning
    // uchun bir oz kutib yana bir marta aniqlaymiz.
    setDog(olcha(qadam.nishon));
    const t = setTimeout(() => { if (!bekor) setDog(olcha(qadam.nishon)); }, 260);

    return () => { bekor = true; clearTimeout(t); };
  }, [qadam, olcha]);

  /* --- sahifa surilsa yoki ekran o'lchami o'zgarsa, dog' nishonda qolsin --- */
  useEffect(() => {
    const yangila = () => setDog(olcha(qadam.nishon));
    window.addEventListener("resize", yangila);
    // `scroll` ham kuzatiladi va bu SHART: qadam almashganda nishon
    // ko'rinishga suriladi, surilish esa bir necha kadr davom etadi.
    // Faqat oxirida bir marta o'lchasak, dog' surilish yo'lida qolib,
    // nishondan siljib turardi.
    window.addEventListener("scroll", yangila, { passive: true });
    return () => {
      window.removeEventListener("resize", yangila);
      window.removeEventListener("scroll", yangila);
    };
  }, [qadam, olcha]);

  /* --- har qadam ovoz chiqarib o'qiladi (o'qishni bilmaydigan bola uchun) --- */
  useEffect(() => { gapir(qadam.matn); }, [qadam]);

  const tugat = useCallback(() => { turKorildi(); onTugadi(); }, [onTugadi]);
  const keyingi = useCallback(() => {
    if (oxirgi) return tugat();
    setI((x) => x + 1);
  }, [oxirgi, tugat]);

  // Gap qutisi dog'ning BO'SH tomonida turadi: dog' ekranning yuqori
  // yarmida bo'lsa pastda, aks holda tepada. Aks holda tushuntirish
  // aynan o'zi ko'rsatayotgan narsani yopib qo'yardi.
  const markaz = dog ? dog.top + dog.height / 2 : 0;
  const pastda = !dog || markaz < window.innerHeight / 2;
  const joy = !dog
    ? { top: "50%", transform: "translateY(-50%)" }
    : pastda
      ? { top: dog.top + dog.height + 14 }
      : { bottom: window.innerHeight - dog.top + 14 };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Yo'lboshchi">
      {/* Yorug' dog'.
          Qorayish alohida qatlam emas, aynan SHU elementning ulkan tashqi
          soyasi. Shuning uchun teshik chekkasi hech qachon "sirg'anmaydi":
          qorong'i va yorug' bitta narsaning ikki tomoni. */}
      <div
        className="az-tur-dog"
        style={{
          top: dog?.top ?? window.innerHeight / 2,
          left: dog?.left ?? window.innerWidth / 2,
          width: dog?.width ?? 0,
          height: dog?.height ?? 0,
          borderRadius: dog?.radius ?? 0,
        }}
      />

      {/* Ekranning istalgan joyiga bosish ham oldinga suradi — bolaning
          birinchi harakati aynan shu bo'ladi. */}
      <button type="button" onClick={keyingi} aria-label="Keyingi"
        className="absolute inset-0 size-full cursor-pointer" />

      {/* Gap qutisi */}
      <div className="pointer-events-none absolute inset-x-0 px-4" style={joy}>
        <div key={i} className="az-tur-gap pointer-events-auto mx-auto w-full max-w-[430px]
                                rounded-clay bg-karta p-4 shadow-clay">
          <div className="flex items-start gap-3">
            <Logo size={40} className="mt-0.5 shrink-0" />
            <p className="min-w-0 flex-1 font-display text-[15.5px] leading-snug">{qadam.matn}</p>
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <div className="flex flex-1 gap-1.5">
              {QADAMLAR.map((_, k) => (
                <span key={k} className={`size-2.5 rounded-full transition-colors
                  ${k <= i ? "bg-brand-orange" : "bg-track"}`} />
              ))}
            </div>

            {!oxirgi && (
              <button type="button" onClick={tugat}
                className="clay-press rounded-3xl px-3 py-2 text-[13px] text-ink-dim">
                O'tkazib yuborish
              </button>
            )}
            <button type="button" onClick={keyingi}
              className="clay-press flex items-center gap-1.5 rounded-3xl bg-brand-green px-4 py-2
                         font-display text-[14px] text-white">
              {oxirgi ? "Boshladik!" : "Keyingi"}
              <Icon name="chevron" size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
