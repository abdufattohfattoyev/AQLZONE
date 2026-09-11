/**
 * HAJMLI BELGILAR — emoji o'rnini bosadigan chizmalar.
 *
 * ─────────────── NEGA EMOJI EMAS ───────────────
 *
 * Emoji har platformada BOSHQA rassom qo'lida chizilgan: Windows'da
 * bir xil, iPhone'da boshqa, Android'da yana boshqa. Bitta ro'yxatda
 * o'nta emoji turganda ular o'nta har xil uslubda chiqadi va ro'yxat
 * tarqoq ko'rinadi. Bu yerda hammasi bitta tilda: bitta to'r, bitta
 * yorug'lik yo'nalishi, bitta soya qoidasi.
 *
 * `lib/icons.tsx` dan FARQI bor va ikkalasi ham kerak. U yerdagilar —
 * chiziqli, rangsiz, `currentColor` bilan bo'yaladigan belgilar:
 * tugma ichida, menyu qatorida, matn yonida turadi. Bu yerdagilar esa
 * RANGLI va HAJMLI: ular o'zi bir narsa bo'lib ko'rinishi kerak
 * (tanga, kubok, olma). Chiziqli belgini kattalashtirsang bo'sh
 * chiqadi, hajmlisini kichraytirsang loyqa bo'ladi — shuning uchun
 * ikkita to'plam, ikki xil ish uchun.
 *
 * ─────────────── HAJM QANDAY CHIQADI ───────────────
 *
 * SVG'da haqiqiy yorug'lik yo'q, shuning uchun u TAQLID qilinadi.
 * To'rtta qoida bilan:
 *
 *   1. Yorug'lik har doim CHAP-TEPADAN tushadi. Hamma belgida bir xil —
 *      aks holda ular bitta javonda turgandek ko'rinmaydi.
 *   2. Narsaning uch yog'i uch xil rangda: tepasi yorug' (`t`),
 *      oldi o'rtacha (`v`), yoni to'q (`s`).
 *   3. Ostida yerga tushgan soya (`b` filtri bilan xiralashtirilgan
 *      ellips). Aynan shu soya narsani "yotgan" emas, "turgan" qiladi.
 *   4. Yaltiroq nuqta — oq, shaffof, chap-tepada.
 *
 * ─────────────── EMOJI XARITASI ───────────────
 *
 * Har belgi o'zi qaysi emojilarni almashtirishini AYTADI (`emoji`
 * maydoni) va xarita shundan tuziladi. Teskarisi ham mumkin edi —
 * alohida jadval yozish — lekin u albatta chizmalardan qolib ketardi:
 * yangi belgi qo'shilib, jadvalga yozilmay qolardi.
 */
import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { ILOVA } from "./hajmli/ilova";
import { OLAM } from "./hajmli/olam";

/** Belgining ohangi. Rang MA'NO bildiradi — bezak emas. */
export type Rang =
  | "yashil" | "sariq" | "zangori" | "binafsha" | "qizil" | "olov"
  | "kumush" | "bronza" | "jigar" | "tuproq";

/**
 * Chizmaga uzatiladigan bo'yoqlar.
 *
 * `t` `v` `s` `r` — gradient manzillari (`url(#...)`), `b` — soya
 * filtri. Ular har chizilishda BOSHQA bo'ladi: bitta sahifada o'nta
 * bir xil belgi tursa, ularning gradient nomlari to'qnashmasligi kerak.
 */
export interface Yuz {
  /** Tepa yoq — eng yorug'i. Yorug'lik tepadan tushadi. */
  t: string;
  /** Old yoq — o'rtacha. Narsaning asosiy rangi shu. */
  v: string;
  /** Yon yoq — eng to'qi. Hajm aynan shundan bilinadi. */
  s: string;
  /** Sharsimon narsalar uchun — yorug'lik nuqtasi chap-tepada. */
  r: string;
  /** Yerga tushgan soyani xiralashtiradigan filtr. */
  b: string;
}

export type Chizma = (y: Yuz) => ReactNode;

export interface Belgi {
  rang: Rang;
  chiz: Chizma;
  /**
   * Tinch turganidagi harakati — CSS keyframes nomi (`index.css`).
   * Yo'q bo'lsa belgi qimirlamaydi.
   */
  jon?: string;
  /** Harakat davomiyligi. Standarti 2.4s. */
  davom?: string;
  /** Shu belgi qaysi emojilarning o'rnini bosadi. */
  emoji?: string[];
}

/**
 * Hamma chizmalar. Ikki faylga bo'lingan, chunki bitta faylda
 * 157 ta chizma turganda undan kerakli bittasini topib bo'lmaydi.
 */
export const BELGILAR = { ...ILOVA, ...OLAM } satisfies Record<string, Belgi>;

export type HajmliNom = keyof typeof BELGILAR;

/**
 * Emoji → belgi nomi.
 *
 * Chizmalardan AVTOMATIK tuziladi. Bir emoji ikki belgiga
 * bog'langan bo'lsa, birinchisi qoladi: bu xato emas, shunchaki
 * ikkita chizma bir narsani ko'rsatyapti degani.
 */
export const EMOJI: Record<string, HajmliNom> = {};
for (const [nom, b] of Object.entries(BELGILAR) as [HajmliNom, Belgi][]) {
  for (const e of b.emoji ?? []) if (!(e in EMOJI)) EMOJI[e] = nom;
}

/**
 * Emojidan "rangli chiqsin" belgisini olib tashlaydi (U+FE0F).
 *
 * Bu belgi KO'RINMAYDI, lekin satrda bor va ikki emojini bir-biriga
 * teng emas qiladi: `"⚔"` bilan `"⚔️"` ikki xil satr. Kodda ikkalasi
 * ham uchraydi — `screens/Duel.tsx` da biri, `lib/matn.ts` da
 * ikkinchisi — va bu farq faqat qidiruv paytida bilinadi.
 */
const sof = (e: string) => e.replace(/️/g, "");
for (const [e, nom] of Object.entries(EMOJI)) {
  const s = sof(e);
  if (s !== e && !(s in EMOJI)) EMOJI[s] = nom;
}

interface Props {
  nom: HajmliNom;
  /** Tomoni, piksel. Belgilar kvadrat. */
  olcham?: number;
  /** Tinch turganda harakatlansinmi. Ro'yxatlarda — YO'Q (pastdagi izoh). */
  jonli?: boolean;
  className?: string;
  /**
   * Belgining ma'nosi matn bilan berilmagan bo'lsa — shu yerda ayting.
   * Berilmasa belgi ekran o'qigichdan yashiriladi (`aria-hidden`),
   * chunki ko'pincha yonida allaqachon yozuv turadi.
   */
  nomi?: string;
}

/**
 * Bitta hajmli belgi.
 *
 * ─────────────── HARAKAT ATAYLAB O'CHIQ ───────────────
 *
 * `jonli` berilmasa belgi qimirlamaydi. Ro'yxatda yigirmata belgi
 * birdan sakrab tursa, ko'z hech qayerga qadala olmaydi va sahifa
 * o'qilmay qoladi. Harakat FAQAT bitta narsaga e'tibor tortish
 * kerak bo'lganda yoqiladi: mukofot berilganda, javob to'g'ri
 * chiqqanda, kunlik sinov ochilganda.
 */
export function Hajmli({ nom, olcham = 24, jonli, className, nomi }: Props) {
  // React har chizilishda o'zi noyob kalit beradi. Qo'lda sanoq
  // yuritish ham mumkin edi, lekin serverda va mijozda ikki xil
  // bo'lib, React ularni bir-biriga mos kelmadi deb hisoblardi.
  const kalit = useId().replace(/:/g, "");
  const b = BELGILAR[nom] as Belgi;

  const y: Yuz = {
    t: `url(#${kalit}t)`, v: `url(#${kalit}v)`, s: `url(#${kalit}s)`,
    r: `url(#${kalit}r)`, b: `url(#${kalit}b)`,
  };

  const uslub = { "--h": b.jon, "--d": b.davom } as CSSProperties;

  return (
    <svg
      viewBox="0 0 40 40" width={olcham} height={olcham}
      className={`hajmli${jonli && b.jon ? " jonli" : ""}${className ? " " + className : ""}`}
      data-rang={b.rang} data-nom={nom} style={uslub}
      role={nomi ? "img" : undefined} aria-label={nomi}
      aria-hidden={nomi ? undefined : true}
    >
      <defs>
        <linearGradient id={`${kalit}t`} x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="var(--bl)" />
          <stop offset="1" stopColor="var(--bm)" />
        </linearGradient>
        <linearGradient id={`${kalit}v`} x1="0" y1="0" x2=".3" y2="1">
          <stop offset="0" stopColor="var(--bm)" />
          <stop offset="1" stopColor="var(--bd)" />
        </linearGradient>
        <linearGradient id={`${kalit}s`} x1="0" y1="0" x2="1" y2=".6">
          <stop offset="0" stopColor="var(--bd)" />
          <stop offset="1" stopColor="#000" stopOpacity=".5" />
        </linearGradient>
        <radialGradient id={`${kalit}r`} cx=".34" cy=".28" r=".85">
          <stop offset="0" stopColor="var(--bl)" />
          <stop offset=".55" stopColor="var(--bm)" />
          <stop offset="1" stopColor="var(--bd)" />
        </radialGradient>
        {/* Soya belgidan tashqariga chiqadi, shuning uchun filtr
            maydoni kengaytirilgan — aks holda soyaning cheti
            kesilib qolardi. */}
        <filter id={`${kalit}b`} x="-60%" y="-160%" width="220%" height="420%">
          <feGaussianBlur stdDeviation="1.7" />
        </filter>
      </defs>
      {b.chiz(y)}
    </svg>
  );
}

interface EmojiProps extends Omit<Props, "nom"> {
  /** Almashtiriladigan emoji. */
  e: string;
}

/**
 * Emoji o'rniga belgi — xaritada bo'lsa.
 *
 * ─────────────── NEGA MA'LUMOTGA TEGILMAYDI ───────────────
 *
 * Mashqlar, do'kon va o'yinlar ro'yxatlarida emoji SATR bo'lib
 * yotibdi — to'rt yuzdan ortiq joyda. Ularning hammasini belgi
 * nomiga almashtirish ham mumkin edi, lekin o'shanda bitta xato
 * yozilgan nom butun mashqni yo'qotardi va buni faqat foydalanuvchi
 * sezardi.
 *
 * Shuning uchun ma'lumot JOYIDA QOLADI, faqat chiqarish joyi
 * o'zgaradi. Xaritada yo'q emoji esa o'zi bo'lib chiqaveradi —
 * ya'ni eng yomon holatda ilova hozirgidek ishlaydi, buziladi emas.
 */
export function EmojiBelgi({ e, olcham = 24, jonli, className, nomi }: EmojiProps) {
  const nom = EMOJI[e] ?? EMOJI[sof(e)];
  if (!nom) {
    return (
      <span className={className} style={{ fontSize: olcham * 0.86, lineHeight: 1 }}
        role={nomi ? "img" : undefined} aria-label={nomi}
        aria-hidden={nomi ? undefined : true}>{e}</span>
    );
  }
  return <Hajmli nom={nom} olcham={olcham} jonli={jonli}
    className={className} nomi={nomi} />;
}

/** Shu emojining belgisi bormi — ro'yxat chizishdan oldin tekshirish uchun. */
export const belgiBor = (e: string): boolean => e in EMOJI || sof(e) in EMOJI;
