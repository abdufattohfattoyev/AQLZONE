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
import { ChizmaRang } from "../lib/chizma/rang";
import { surat } from "../lib/chizma/surat";
import { kNom } from "../lib/kichkintoy";
import type { Karta } from "../lib/kichkintoy";

/**
 * Rasmning o'lchami.
 *
 *   katta   albomdagi sahna
 *   kichik  o'yindagi variant
 *   belgi   kirish ekranidagi mavzu kartasi
 *   mayda   mavzu kartasi ostidagi uchta ishora
 *
 * Oxirgi ikkitasi kirish ekrani uchun qo'shildi: u ilgari EMOJI
 * ko'rsatardi va natijada bir xil narsa ikki joyda ikki xil chiqardi —
 * kartada Windows'ning avtobusi, albomda esa bizning avtobus.
 */
export type Olcham = "katta" | "kichik" | "belgi" | "mayda";

/*
 * `doira` endi `chizma` bilan BIR XIL.
 *
 * Ilgari rang tekis `<span>` edi va `doira` uning aniq o'lchami
 * bo'lardi. Endi u SVG (`lib/chizma/rang.tsx`) va qolgan hamma
 * chizma kabi 120×120 to'rda turibdi: sharning atrofida yorug'lik
 * va soya uchun bo'shliq bor. Shu sabab o'lcham ham o'shalarniki
 * bilan bir xil bo'lishi kerak — aks holda rang kartasi qo'shni
 * kartadan kichik chiqardi.
 */
const OLCHAM = {
  katta: {
    chizma: "size-[168px]", emoji: "text-[104px]", doira: "size-[168px]",
    raqam: "text-[92px]", nuqta: "size-[26px]",
  },
  kichik: {
    chizma: "size-[86px]", emoji: "text-[46px]", doira: "size-[86px]",
    raqam: "text-[42px]", nuqta: "size-[12px]",
  },
  belgi: {
    chizma: "size-[64px]", emoji: "text-[40px]", doira: "size-[64px]",
    raqam: "text-[40px]", nuqta: "size-[9px]",
  },
  mayda: {
    // 32px — 26px da mashina SURATLARI qorayib ketardi: fotoda
    // tafsilot ko'p va u kichrayganda bir dog'ga aylanadi. Chizmalar
    // 26px da ham o'qilardi, lekin ikkalasi bitta qatorda turadi.
    chizma: "size-[32px]", emoji: "text-[18px]", doira: "size-[32px]",
    raqam: "text-[16px]", nuqta: "size-[5px]",
  },
} as const;

export function KichkintoyKarta({ k, olcham = "katta" }: { k: Karta; olcham?: Olcham }) {
  const o = OLCHAM[olcham];

  /* ---- haqiqiy surat ----
     Eng ustun turadi: `src/rasm/<id>.png` qo'yilgan bo'lsa, karta
     chizmani emas, o'sha suratni ko'rsatadi (`lib/chizma/surat.ts`).
     Papka bo'sh bo'lsa bu shart hech qachon bajarilmaydi va hamma
     narsa avvalgidek chizma bilan ishlaydi. */
  const s = surat(k.id);
  if (s) {
    return (
      <img src={s} alt={kNom(k)}
        // `object-contain` — surat cho'zilmasin: kvadrat bo'lmagan
        // faylda ham narsa o'z nisbatida qoladi.
        className={`${o.chizma} block object-contain
                    ${olcham === "katta" ? "az-nafas" : ""}`} />
    );
  }

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
     Tekis doira o'rniga bo'yalgan SHAR (`lib/chizma/rang.tsx`):
     yonidagi kartalarda hajmli suratlar turibdi va ular orasida
     yassi doira ilovaning bitmagan joyiga o'xshab ko'rinardi. */
  if (k.hex) {
    return <ChizmaRang hex={k.hex} className={`${o.doira} block`} />;
  }

  /* ---- raqam ----
     Belgi va narsalar TIK joylashadi: yonma-yon qo'yilganda tor
     telefonda to'qqizta olma raqamni siqib qo'yardi. */
  if (k.belgi) {
    return (
      <span className="flex flex-col items-center gap-2">
        {/* Ostidagi qalin soya raqamni "yasalgan" narsa qiladi. MAYDA
            o'lchamda esa u 4px siljish bilan raqamdan kattaroq bo'lib
            qolardi — natijada raqam emas, kir dog'i ko'rinardi. */}
        <span aria-hidden
          className={`${o.raqam} font-display leading-none text-ink
                      ${olcham === "mayda" ? "" : "drop-shadow-[0_4px_0_var(--color-clay)]"}`}>
          {k.belgi}
        </span>
        {/* Nol kartasida bitta ham narsa yo'q — bo'sh joyning o'zi
            "hech narsa" degan gapni aytadi. Shuning uchun bu yerda
            "0 ta" degan yozuv ham yo'q.

            MAYDA o'lchamda olma umuman chizilmaydi: 26px joyda
            to'qqizta olma sanaladigan narsa emas, kir dog'i bo'lib
            ko'rinardi. U yerda raqamning O'ZI yetarli. */}
        {(k.n ?? 0) > 0 && olcham !== "mayda" && (
          <Olmalar n={k.n ?? 0} nuqta={o.nuqta} />
        )}
      </span>
    );
  }

  /* ---- zaxira: emoji ---- */
  return <span aria-hidden className={`${o.emoji} block leading-none`}>{k.e}</span>;
}

/**
 * Sanaladigan olmalar — BESHTALAB qatorda.
 *
 * ─────────── NEGA QATOR MUHIM ───────────
 *
 * Ilgari olmalar `flex-wrap` bilan terilardi: qatorga nechtasi
 * sig'sa, shuncha. Natijada to'qqizta olma bir telefonda 5+4, boshqa
 * telefonda 6+3, uchinchisida 4+4+1 bo'lib chiqardi — ya'ni BIR XIL
 * SON har safar boshqacha ko'rinardi.
 *
 * Bola esa sanashni aynan shakldan boshlaydi. Doim beshtalab
 * terilgan qator unga ikkinchi foyda ham beradi: yettita olmani u
 * "besh va yana ikki" deb KO'RADI, bitta-bitta sanamasdan. Bu
 * "subitizatsiya" deyiladi va maktabgacha matematikaning poydevori.
 *
 * Beshta — tasodifiy son emas: bir qo'lda beshta barmoq bor va bola
 * bu bog'lanishni o'zi topadi.
 */
function Olmalar({ n, nuqta }: { n: number; nuqta: string }) {
  const qatorlar = n <= 5 ? [n] : [5, n - 5];
  return (
    <span aria-hidden className="flex flex-col items-center gap-1">
      {qatorlar.map((soni, q) => (
        <span key={q} className="flex gap-1">
          {Array.from({ length: soni }, (_, i) => (
            <ChizmaOlma key={i} className={nuqta} />
          ))}
        </span>
      ))}
    </span>
  );
}
