/**
 * Kichkintoy kartasining RASMI — uch xil, bitta joyda.
 *
 * Mavzular uch xil narsani ko'rsatadi va ularning har biri boshqacha
 * chiziladi:
 *
 *   RASM      mashina, hayvon — katta emoji.
 *   RANG      rasm yo'q: shu rangdagi to'la doira. Rangni rasm bilan
 *             ko'rsatib bo'lmaydi ("qizil mashina" bolaga MASHINAni
 *             ko'rsatadi, rangni emas).
 *   RAQAM     katta belgi VA shuncha narsa — bir vaqtda. Bu raqamlar
 *             mavzusining butun ma'nosi: "5" degan chizma bilan beshta
 *             olma ajralmas bo'lishi kerak, aks holda bola raqamni
 *             o'qishni o'rganadi-yu, sonni tushunmaydi.
 *
 * Uchalasi BITTA komponentda, chunki ular albomda ham, o'yinda ham,
 * mavzu kartasida ham chiziladi. Uch joyga uch nusxa yozilsa, ulardan
 * biri albatta boshqasidan qolib ketardi — masalan raqam kartasi
 * o'yinda olmasiz chiqib, savol javobsiz bo'lib qolardi.
 */
import { Chizma, ChizmaOlma, chizmaBormi } from "../lib/chizma";
import type { Karta } from "../lib/kichkintoy";

/** Rasmning o'lchami: albomdagi sahna yoki o'yindagi variant. */
export type Olcham = "katta" | "kichik";

const OLCHAM = {
  katta: {
    chizma: "size-[168px]", emoji: "text-[104px]", doira: "size-[132px]",
    raqam: "text-[92px]", nuqta: "size-[28px]",
  },
  kichik: {
    chizma: "size-[86px]", emoji: "text-[46px]", doira: "size-[62px]",
    raqam: "text-[42px]", nuqta: "size-[12px]",
  },
} as const;

export function KichkintoyKarta({ k, olcham = "katta" }: { k: Karta; olcham?: Olcham }) {
  const o = OLCHAM[olcham];

  /* ---- qo'lda chizilgan rasm ----
     Emoji zaxira bo'lib qoladi: yangi karta qo'shilib, rasmi hali
     yasalmagan bo'lsa, u emoji bilan ishlab turadi. Ilova buzilmaydi,
     shunchaki bitta karta boshqacha ko'rinadi. */
  if (k.e && chizmaBormi(k.id)) {
    // "Nafas" faqat KATTA rasmda: o'yindagi uchta variant bir vaqtda
    // tebranib tursa, ekran bezovta bo'lib ko'rinardi.
    return (
      <Chizma id={k.id}
        className={`${o.chizma} block ${olcham === "katta" ? "az-nafas" : ""}`} />
    );
  }

  /* ---- rang ----
     Doira ichida hech qanday yozuv yo'q. Chegara (`ring`) esa SHART:
     oq va qora doira mos fonda butunlay yo'qolib ketardi. */
  if (k.hex) {
    return (
      <span aria-hidden
        style={{ backgroundColor: k.hex }}
        className={`${o.doira} block rounded-full shadow-[inset_0_-8px_18px_rgb(0_0_0/0.18),0_6px_14px_rgb(0_0_0/0.18)]
                    ring-2 ring-ink/10`} />
    );
  }

  /* ---- raqam ----
     Belgi va narsalar TIK joylashadi: yonma-yon qo'yilganda tor
     telefonda to'qqizta olma raqamni siqib qo'yardi. */
  if (k.belgi) {
    return (
      <span className="flex flex-col items-center gap-1.5">
        <span aria-hidden
          className={`${o.raqam} font-display leading-none text-ink
                      drop-shadow-[0_4px_0_var(--color-clay)]`}>
          {k.belgi}
        </span>
        {/* Nol kartasida bitta ham narsa yo'q — bo'sh joyning o'zi
            "hech narsa" degan gapni aytadi. Shuning uchun bu yerda
            "0 ta" degan yozuv ham yo'q. */}
        {(k.n ?? 0) > 0 && (
          <span aria-hidden className="flex max-w-[176px] flex-wrap justify-center gap-1">
            {Array.from({ length: k.n ?? 0 }, (_, i) => (
              <ChizmaOlma key={i} className={o.nuqta} />
            ))}
          </span>
        )}
      </span>
    );
  }

  /* ---- zaxira: emoji ---- */
  return <span aria-hidden className={`${o.emoji} block leading-none`}>{k.e}</span>;
}
