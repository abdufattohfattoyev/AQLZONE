/**
 * MATEMATIKA LUG'ATI — har bir mavzu uchun alohida ma'lumotnoma yozuvi.
 *
 * ─────────────────────── NEGA KERAK ───────────────────────
 *
 * Odam qidiruvga dars nomini yozmaydi. U "kvadratlar ayirmasi formulasi",
 * "diskriminant nima", "trapetsiya yuzi qanday topiladi" deb yozadi — ya'ni
 * ATAMANI so'raydi. Bizda bu tushuntirishlarning hammasi bor
 * (`nazariya.ts`: qoida, formula, tipik xato; `tolaq*.ts`: yechilgan
 * misollar va qadamlar), lekin ular DARS ichida yashiringan: darsga faqat
 * kurs → bob → dars yo'li bilan boriladi va sahifaning nomi "4-dars"
 * bo'ladi. Google uchun bu "diskriminant" so'rovi bilan hech qanday
 * bog'liq emas.
 *
 * Shu modul o'sha tushuntirishlarni MAVZU bo'yicha qayta yig'adi: har bir
 * atama — o'z manzili, o'z sarlavhasi va o'z sahifasi
 * (`/lugat/diskriminant`). Sahifalar `scripts/seo.ts` da yasaladi.
 *
 * ─────────────────────── BIR MAVZU, KO'P DARS ───────────────────────
 *
 * Bir xil nomli dars bir necha kursda uchraydi ("Kvadrat tengsizlik" 9- va
 * 10-sinfda). Bu BITTA atama: yozuv bitta bo'ladi va ikkala darsga ham
 * havola beradi — ya'ni Google bir mavzuni ikki nusxa deb ko'rmaydi va
 * o'quvchi o'z sinfidagi darsni tanlaydi.
 *
 * Istisno — nomi bir xil, MAZMUNI boshqa dars (quyi sinfdagi "Kasrlarni
 * qisqartirish" va 8-sinfdagi algebraik kasr). Ularning nazariyasi ham
 * boshqa (`nazariya.ts` dagi `grade6|…` kalitlari), shuning uchun yozuv
 * ikkiga ajraladi va manzilga sinf qo'shiladi: `/lugat/...-6`.
 *
 * ─────────────────────── TILDAN XOLI ───────────────────────
 *
 * Bu yerda faqat o'zbekcha nomlar va tuzilma turadi. Tarjima yuqorida
 * bo'ladi: nomni `kursMatn`, matnlarni esa juftlikning ikkinchi a'zosi
 * beradi. Shunday qilib modul til holatiga bog'lanmaydi va yig'ish
 * skripti uni ikki marta (o'zbekcha, ruscha) ishlatadi.
 */
import { COURSES } from "./curriculum";
import type { Course } from "./curriculum";
import { nazariya, tolaq } from "./nazariya";
import type { Nazariya, Tolaq } from "./nazariya";

/** Atamani o'rgatadigan bitta dars — manzili yuqorida yasaladi. */
export interface LugatDars {
  /** Kurs manzili bo'lagi (`algebra-7`). */
  kurs: string;
  /** Kurs nomi — tarjima qilinadi (`Course.title`). */
  kursNomi: string;
  /** Bob raqami, 1 dan. */
  bob: number;
  /** Dars raqami bob ichida, 1 dan. */
  dars: number;
}

export interface LugatYozuv {
  /** Manzil bo'lagi: `/lugat/<slug>`. */
  slug: string;
  /** Atama nomi o'zbekcha — `kursMatn` bilan tarjima qilinadi. */
  nom: string;
  /** Qoida, formulalar, tipik xato. */
  n: Nazariya;
  /** To'liq tushuntirish: tushuncha, nomli formulalar, qadamlar, yechilgan misollar, xatolar. */
  t?: Tolaq;
  /** Eng quyi kurs kodi (`Course.grade`) — tartib va guruhlash uchun. */
  grade: number;
  /** Eng quyi kursning nomi — "qaysi sinfda o'tiladi" deb ko'rsatiladi. */
  kursNomi: string;
  /** Shu atamani o'rgatadigan darslar, quyi sinfdan yuqoriga. */
  darslar: LugatDars[];
}

/** "Kvadratlar ayirmasi" → "kvadratlar-ayirmasi". `scripts/seo.ts` dagi `slug` bilan bir xil. */
export const atamaSlug = (s: string): string =>
  s.toLowerCase().replace(/[ʻʼ'`’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Dars nomining birinchi qismi — " · " dan keyin darslik betlari turadi. */
const darsNomi = (n: string): string => n.split(" · ")[0]!.trim();

/**
 * Lug'atga TUSHMAYDIGAN darslar.
 *
 * Takrorlash va yakuniy sinov bitta mavzu emas — bir nechta darsning
 * aralashmasi. Ularga atama sahifasi yasalsa, u "Bob takrorlash" degan
 * nomda bo'lardi: bunday so'rov yo'q, mazmuni esa boshqa sahifalardan
 * ko'chirma bo'lib chiqardi.
 */
const CHETDA = /^(Bob takrorlash|Yakuniy|Takrorlash)/i;

/**
 * Lug'at yozuvlari — alfavit tartibida.
 *
 * Manba kurs dasturining O'ZI: dars qo'shilsa yoki nazariya yozilsa, lug'at
 * o'zi o'sadi. Nazariyasi yo'q dars (quyi sinflarning ko'pchiligi)
 * tushmaydi: usiz sahifada atamadan boshqa hech narsa bo'lmasdi.
 */
export function lugat(): LugatYozuv[] {
  // Nom → o'sha nomdagi turli nazariyalar. Odatda bitta; nomi bir xil,
  // mazmuni boshqa dars bo'lsa — bir nechta (izohga qarang).
  const nomlar = new Map<string, { n: Nazariya; t?: Tolaq; grade: number; kurs: Course; darslar: LugatDars[] }[]>();

  for (const c of COURSES) {
    c.units.forEach((u, ui) => {
      u.lessons.forEach((l, li) => {
        const nom = darsNomi(l.n);
        if (CHETDA.test(nom)) return;
        const n = nazariya(c.id, nom);
        if (!n) return;
        const dars: LugatDars = { kurs: c.slug, kursNomi: c.title, bob: ui + 1, dars: li + 1 };
        const guruh = nomlar.get(nom) ?? [];
        // Nazariya obyekti AYNAN bir xil bo'lsa (`nazariya.ts` dagi bitta
        // yozuv) — bu bitta atama, darslar ro'yxatiga qo'shiladi.
        const bor = guruh.find((g) => g.n === n);
        if (bor) {
          bor.darslar.push(dars);
          if (c.grade < bor.grade) { bor.grade = c.grade; bor.kurs = c; }
          bor.t ??= tolaq(c.id, nom);
        } else {
          guruh.push({ n, t: tolaq(c.id, nom), grade: c.grade, kurs: c, darslar: [dars] });
          nomlar.set(nom, guruh);
        }
      });
    });
  }

  const yozuvlar: LugatYozuv[] = [];
  for (const [nom, guruh] of nomlar) {
    guruh.sort((a, b) => a.grade - b.grade);
    for (const g of guruh) {
      yozuvlar.push({
        // Nomi bir xil, mazmuni boshqa yozuvlar bo'lsa — manzilga sinf
        // qo'shiladi, aks holda ikkinchisi birinchisini bosib ketardi.
        slug: atamaSlug(nom) + (guruh.length > 1 ? `-${g.grade}` : ""),
        nom,
        n: g.n,
        ...(g.t ? { t: g.t } : {}),
        grade: g.grade,
        kursNomi: g.kurs.title,
        darslar: g.darslar,
      });
    }
  }
  yozuvlar.sort((a, b) => a.nom.localeCompare(b.nom, "uz"));
  return yozuvlar;
}

/** Bitta yozuv manzil bo'lagi bo'yicha. */
export const lugatYozuv = (slug: string): LugatYozuv | undefined =>
  lugat().find((y) => y.slug === slug);
