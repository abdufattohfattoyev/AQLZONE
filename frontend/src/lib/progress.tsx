/**
 * Progress — bitta joyda.
 *
 * Uch qavat saqlash:
 *   1. React holati   — ekran shu yerdan chizadi
 *   2. localStorage   — internetsiz ham yo'qolmaydi
 *   3. server         — qurilma almashsa ham qaytib keladi
 *
 * Asosiy qoida: PROGRESS KAMAYMAYDI. Serverdagi va qurilmadagi nusxa
 * to'qnashsa, yulduzi ko'proq bo'lgani ustun turadi. Shu qoida bola
 * internetsiz o'ynagan darsni saqlab qoladi.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { COURSES } from "./curriculum";
import type { Course } from "./curriculum";
import { lessonId } from "./types";
import type { Progress } from "./types";
import * as api from "./api";
import { kunKaliti, kunOldin, tiklangan, tiklashTaklifi } from "./zanjir";
import type { TiklashTaklifi } from "./zanjir";

export const BOSH: Progress = { stars: 0, coins: 0, done: {}, savollar: 0, olingan: [], kiygan: "" };

/** Bir kunda nechta savol yechish maqsad qilingan. */
export const KUNLIK_MAQSAD = 10;

/** Kunlik sinovda har to'g'ri javob nechta tanga beradi (odatdagisi 2). */
export const SINOV_TANGA = 4;

/**
 * Kunlik sinov natijasi serverda qaysi "bob/dars" bo'lib yoziladi.
 *
 * Haqiqiy darslardan uzoq son tanlangan: eng katta kursda 12 bob bor,
 * ya'ni 99 hech qachon to'qnashmaydi. Busiz sinov natijasi ota-ona
 * panelidagi "eng qiyin darslar" ro'yxatida boshqa darsning aniqligini
 * buzib ko'rsatardi.
 */
export const SINOV_JOY = 99;

/** Server hisobotida shu nom bilan ko'rinadi. */
export const SINOV_NOM = "Kunlik sinov";

/** Kunlik maqsad va ketma-ket kunlar. */
export interface Kunlik {
  /** "2026-07-25" — mahalliy vaqt bo'yicha. */
  sana: string;
  /** Shu kuni yechilgan savollar. */
  savollar: number;
  /** Ketma-ket necha kun mashq qilingani. */
  kunlar: number;
  /**
   * Qo'lda turgan "muzlatgich" soni.
   *
   * Bir kun qoldirilsa zanjir nolga tushadi va bola ko'pincha shu yerda
   * butunlay tashlab ketadi — bir haftalik mehnat bir kunda yo'qolgandek
   * tuyuladi. Muzlatgich shu zarbani yumshatadi: oyiga bitta qoldirilgan
   * kun kechiriladi.
   */
  muzlatgich: number;
  /** Muzlatgich qaysi oyga berilgan ("2026-07"). */
  muzlatgichOyi: string;
  /** Oxirgi marta muzlatgich ishlatilgan kun — foydalanuvchiga aytish uchun. */
  muzlaganKun: string;
  /**
   * Zanjir oxirgi marta TANGA bilan tiklangan kun.
   *
   * Muzlatgichdan farqi: muzlatgich bepul va o'zi ishlaydi, tiklash esa
   * pullik va faqat foydalanuvchi so'raganda bo'ladi. Ikki tiklash
   * orasida kamida bir hafta bo'lishi kerak (`lib/zanjir.ts`).
   */
  tiklanganKun: string;
  /** Shu oyda nechta tiklash bo'lgan — narx shundan oshadi. */
  tiklashSoni: number;
  /** Tiklash hisobi qaysi oyga tegishli ("2026-07"). */
  tiklashOyi: string;
}

/** Har oy nechta qoldirilgan kun kechiriladi. */
const OYLIK_MUZLATGICH = 1;

const KUNLIK_BOSH: Kunlik = {
  sana: "", savollar: 0, kunlar: 0,
  muzlatgich: OYLIK_MUZLATGICH, muzlatgichOyi: "", muzlaganKun: "",
  tiklanganKun: "", tiklashSoni: 0, tiklashOyi: "",
};

/** Serverdagi va localStorage'dagi kalit — server faqat shunday kalitlarni qabul qiladi. */
const KUNLIK_KEY = "azapp_kunlik_v1";

// Sana hisobi `lib/zanjir.ts` da — u yerda zanjir qoidalari bilan bir
// joyda turadi va React'siz sinaladi.
const kechaKaliti = () => kunOldin(1);

/** Yangi savollar qo'shilgandagi kunlik holat. */
function kunlikYangila(k: Kunlik, savollar: number): Kunlik {
  const bugun = kunKaliti();
  if (k.sana === bugun) return { ...k, savollar: k.savollar + savollar };

  // Yangi oy boshlandi — muzlatgich yangilanadi.
  const oy = bugun.slice(0, 7);
  const muzlatgich = k.muzlatgichOyi === oy ? k.muzlatgich : OYLIK_MUZLATGICH;

  // Kecha mashq qilgan bo'lsa — zanjir davom etadi.
  if (k.sana === kechaKaliti()) {
    return { ...k, sana: bugun, savollar, kunlar: k.kunlar + 1, muzlatgich, muzlatgichOyi: oy };
  }

  // Roppa-rosa BIR kun qoldirilgan va muzlatgich bor — zanjir saqlanadi.
  // Ikki va undan ko'p kun qoldirilsa muzlatgich yordam bermaydi: aks
  // holda "ketma-ket kunlar" degan so'zning ma'nosi qolmasdi.
  const oldingi = k.sana && k.sana === kunOldin(2);
  if (oldingi && muzlatgich > 0) {
    return {
      ...k,
      sana: bugun, savollar, kunlar: k.kunlar + 1,
      muzlatgich: muzlatgich - 1, muzlatgichOyi: oy, muzlaganKun: bugun,
    };
  }

  // Zanjir uzildi. Tiklash hisobi (`tiklash*`) SAQLANADI — u oy bo'yicha
  // yuritiladi va zanjir uzilgani bilan noldan boshlanmasligi kerak,
  // aks holda har uzilishdan keyin narx yana eng arzoniga qaytardi.
  return {
    ...k,
    sana: bugun, savollar, kunlar: 1,
    muzlatgich, muzlatgichOyi: oy, muzlaganKun: "",
  };
}

/** Ko'rsatish uchun: kun almashgan bo'lsa bugungi hisob noldan boshlanadi. */
function kunlikKorinishi(k: Kunlik): Kunlik {
  return k.sana === kunKaliti() ? k : { ...k, savollar: 0 };
}

/** Bitta dars natijasi — Lesson ekrani shu ko'rinishda qaytaradi. */
export interface LessonResult {
  asked: number;
  correct: number;
  mistakes: number;
  stars: number;
  /** Darsga sarflangan vaqt (ms) — ota-ona panelida ko'rsatiladi. */
  davomiylik: number;
}

/** Barcha kurslar progressi bir joyda — serverga ham shu ko'rinishda boradi. */
type All = Record<string, Progress>;

function oqi(key: string): Progress {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return BOSH;
    const d = JSON.parse(raw) as Partial<Progress>;
    return {
      stars: d.stars ?? 0,
      coins: d.coins ?? 0,
      done: d.done ?? {},
      // Yangi maydonlar: eski saqlangan qiymatlarda ular yo'q, shuning
      // uchun standart qiymat beriladi — eski progress buzilmaydi.
      savollar: d.savollar ?? 0,
      olingan: d.olingan ?? [],
      kiygan: d.kiygan ?? "",
    };
  } catch {
    return BOSH;
  }
}

/**
 * `localStorage` kaliti — profil bilan.
 *
 * Bir telefonda ikki farzand o'ynasa, ularning progressi qurilmada ham
 * ajralishi kerak: aks holda ikkinchi bola internetsiz ochganda
 * birinchisining yulduzlarini ko'rardi.
 *
 * Serverga esa kalitning SODDA ko'rinishi boradi (`holatSatri`), chunki
 * u allaqachon profil bo'yicha ajratadi — ikki marta ajratish kerak emas.
 */
function lokalKalit(kalit: string): string {
  const p = api.joriyProfil();
  return p ? `${kalit}::${p}` : kalit;
}

const hammasiniOqi = (): All =>
  Object.fromEntries(COURSES.map((c) => [c.key, oqi(lokalKalit(c.key))]));

function kunlikniOqi(): Kunlik {
  try {
    const raw = localStorage.getItem(lokalKalit(KUNLIK_KEY));
    if (!raw) return KUNLIK_BOSH;
    const d = JSON.parse(raw) as Partial<Kunlik>;
    return {
      sana: d.sana ?? "",
      savollar: d.savollar ?? 0,
      kunlar: d.kunlar ?? 0,
      muzlatgich: d.muzlatgich ?? OYLIK_MUZLATGICH,
      muzlatgichOyi: d.muzlatgichOyi ?? "",
      muzlaganKun: d.muzlaganKun ?? "",
      // Yangi maydonlar: eski saqlangan qiymatlarda ular yo'q, shuning
      // uchun standart qiymat beriladi — eski zanjir buzilmaydi.
      tiklanganKun: d.tiklanganKun ?? "",
      tiklashSoni: d.tiklashSoni ?? 0,
      tiklashOyi: d.tiklashOyi ?? "",
    };
  } catch {
    return KUNLIK_BOSH;
  }
}

const holatSatri = (all: All, kunlik: Kunlik) => ({
  ...Object.fromEntries(COURSES.map((c) => [c.key, JSON.stringify(all[c.key] ?? BOSH)])),
  [KUNLIK_KEY]: JSON.stringify(kunlik),
});

interface Ctx {
  progressOf: (c: Course) => Progress;
  darsTugadi: (c: Course, ui: number, li: number, r: LessonResult) => void;
  /** Bugungi maqsad holati — Home ekranida ko'rsatiladi. */
  kunlik: Kunlik;
  /** Do'kondan buyum sotib olish. Tanga yetmasa `false` qaytadi. */
  sotibOl: (c: Course, buyumId: string, narx: number) => boolean;
  /** Aqlga buyum kiydirish (bo'sh satr — yechish). */
  kiy: (c: Course, buyumId: string) => void;
  /**
   * Barcha kurslardagi tangalar yig'indisi.
   *
   * Tangalar KURSGA tegishli, zanjir esa BUTUN hisobga. Shu sabab zanjir
   * tiklash narxi jami hisobdan yechiladi — aks holda bola tangasini
   * 3-sinfda yig'ib, 1-sinfda zanjirini tiklay olmasdi.
   */
  jamiTanga: number;
  /** Uzilgan zanjirni tiklash taklifi. Yo'q bo'lsa `null`. */
  tiklash: TiklashTaklifi | null;
  /** Zanjirni tanga evaziga tiklaydi. Tanga yetmasa `false`. */
  zanjirniTikla: () => boolean;
  /** Kunlik sinov natijasi — darslar xaritasiga yozilmaydi. */
  sinovTugadi: (c: Course, r: LessonResult) => void;
}

const ProgressCtx = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<All>(hammasiniOqi);
  const [kunlik, setKunlik] = useState<Kunlik>(kunlikniOqi);
  const ilkYuklash = useRef(true);

  /** Har doim eng oxirgi holatni saqlaydi — asinxron kodda kerak bo'ladi. */
  const allRef = useRef(all);
  const kunlikRef = useRef(kunlik);
  useEffect(() => {
    allRef.current = all;
    kunlikRef.current = kunlik;
  }, [all, kunlik]);

  /* --- serverga ulanamiz, uzoqdagi progressni olib kelamiz va mahalliyni yuboramiz --- */
  useEffect(() => {
    (async () => {
      if (!(await api.signIn())) return;

      const uzoq = await api.getProgress();
      if (uzoq?.state) {
        setAll((joriy) => {
          const yangi = { ...joriy };
          for (const c of COURSES) {
            const raw = uzoq.state[c.key];
            if (!raw) continue;
            try {
              const d = JSON.parse(raw) as Progress;
              if ((d.stars ?? 0) > (yangi[c.key]?.stars ?? 0)) yangi[c.key] = d;
            } catch {
              /* buzuq qiymat — e'tiborsiz */
            }
          }
          return yangi;
        });

        // Kunlik zanjir ham sinxronlanadi: bola boshqa qurilmada mashq
        // qilgan bo'lsa, zanjir uzilib qolmasligi kerak.
        const xomKun = uzoq.state[KUNLIK_KEY];
        if (xomKun) {
          try {
            const u = JSON.parse(xomKun) as Kunlik;
            setKunlik((joriy) => {
              if (!u.sana) return joriy;
              if (u.sana > joriy.sana) return u;                       // uzoqdagisi yangiroq kun
              if (u.sana < joriy.sana) return joriy;
              // Bir xil kun — ikkalasidan kattasini olamiz, progress kamaymasin.
              return {
                ...joriy,
                savollar: Math.max(joriy.savollar, u.savollar ?? 0),
                kunlar: Math.max(joriy.kunlar, u.kunlar ?? 0),
                // Muzlatgich esa KAMROG'I olinadi: boshqa qurilmada
                // ishlatilgan bo'lsa, u qaytadan paydo bo'lmasligi kerak.
                muzlatgich: Math.min(joriy.muzlatgich, u.muzlatgich ?? joriy.muzlatgich),
              };
            });
          } catch { /* buzuq qiymat — e'tiborsiz */ }
        }
      }

      // Muhim: qurilmada allaqachon progress bo'lishi mumkin (bola internetsiz
      // o'ynagan). Kirish endi bo'lgani uchun uni bir marta yuqoriga yuboramiz —
      // aks holda u faqat keyingi darsdan keyin ketardi.
      setTimeout(() => api.putProgress(holatSatri(allRef.current, kunlikRef.current)), 120);
    })();
  }, []);

  /* --- har o'zgarishda localStorage va (kechikib) serverga yozamiz --- */
  useEffect(() => {
    for (const c of COURSES) {
      try {
        localStorage.setItem(lokalKalit(c.key), JSON.stringify(all[c.key] ?? BOSH));
      } catch {
        /* xotira to'lgan */
      }
    }
    try {
      localStorage.setItem(lokalKalit(KUNLIK_KEY), JSON.stringify(kunlik));
    } catch {
      /* xotira to'lgan */
    }
    if (ilkYuklash.current) {
      ilkYuklash.current = false; // ilk render serverga qaytib yozmasin
      return;
    }
    const t = setTimeout(() => api.putProgress(holatSatri(all, kunlik)), 1000);
    return () => clearTimeout(t);
  }, [all, kunlik]);

  const progressOf = useCallback((c: Course) => all[c.key] ?? BOSH, [all]);

  const darsTugadi = useCallback(
    (c: Course, ui: number, li: number, r: LessonResult) => {
      const id = lessonId(ui, li);
      setAll((p) => {
        const cur = p[c.key] ?? BOSH;
        const oldingi = cur.done[id] ?? 0;
        // Darsni qayta o'ynasa yulduz ikki marta qo'shilmasin — faqat o'sishi hisoblanadi.
        const qoshimcha = Math.max(0, r.stars - oldingi);
        return {
          ...p,
          [c.key]: {
            ...cur,
            stars: cur.stars + qoshimcha,
            coins: cur.coins + r.correct * 2,
            savollar: (cur.savollar ?? 0) + r.asked,
            done: { ...cur.done, [id]: Math.max(oldingi, r.stars) },
          },
        };
      });
      setKunlik((k) => kunlikYangila(k, r.asked));
      api.postResult({
        grade: c.grade, unit: ui, lesson: li,
        lessonName: c.units[ui].lessons[li].n,
        asked: r.asked, correct: r.correct, mistakes: r.mistakes, stars: r.stars,
        durationMs: r.davomiylik,
      });
    },
    []
  );

  const sotibOl = useCallback((c: Course, buyumId: string, narx: number): boolean => {
    const cur = allRef.current[c.key] ?? BOSH;
    // Tekshiruvni SETDAN TASHQARIDA qilamiz, chunki javob darhol kerak:
    // "tanga yetmadi" xabarini ko'rsatish uchun. Ichkarida ham qayta
    // tekshiriladi — ikki marta bosilsa, ikki marta yechilmasin.
    if ((cur.olingan ?? []).includes(buyumId)) return true;
    if (cur.coins < narx) return false;

    setAll((p) => {
      const c2 = p[c.key] ?? BOSH;
      if ((c2.olingan ?? []).includes(buyumId) || c2.coins < narx) return p;
      return {
        ...p,
        [c.key]: {
          ...c2,
          coins: c2.coins - narx,
          olingan: [...(c2.olingan ?? []), buyumId],
          // Yangi buyum darhol kiyiladi — bola natijani ko'rsin.
          kiygan: buyumId,
        },
      };
    });
    return true;
  }, []);

  const kiy = useCallback((c: Course, buyumId: string) => {
    setAll((p) => {
      const cur = p[c.key] ?? BOSH;
      if (buyumId && !(cur.olingan ?? []).includes(buyumId)) return p;
      return { ...p, [c.key]: { ...cur, kiygan: buyumId } };
    });
  }, []);

  /* ------------------------------------------------ zanjirni tiklash */

  const jamiTanga = useMemo(
    () => COURSES.reduce((n, c) => n + (all[c.key]?.coins ?? 0), 0),
    [all],
  );

  /** Tiklash taklifi — kun almashishi bilan o'zi yo'qoladi. */
  const tiklash = useMemo(() => tiklashTaklifi(kunlik), [kunlik]);

  /**
   * Zanjirni tanga evaziga tiklaydi.
   *
   * Tanga ENG BOY kursdan boshlab yechiladi. Boshqa taqsimot ham
   * bo'lardi, lekin bu bittasi doim ishlaydi: jami yetsa, yechish
   * albatta tugaydi va hech qaysi kurs manfiyga tushmaydi.
   */
  const zanjirniTikla = useCallback((): boolean => {
    const taklif = tiklashTaklifi(kunlikRef.current);
    if (!taklif) return false;

    const joriy = allRef.current;
    const jami = COURSES.reduce((n, c) => n + (joriy[c.key]?.coins ?? 0), 0);
    if (jami < taklif.narx) return false;

    setAll((p) => {
      const yangi = { ...p };
      let qolgan = taklif.narx;
      // Boydan kambag'alga qarab yechamiz.
      const tartib = [...COURSES].sort(
        (a, b) => (yangi[b.key]?.coins ?? 0) - (yangi[a.key]?.coins ?? 0),
      );
      for (const c of tartib) {
        if (qolgan <= 0) break;
        const cur = yangi[c.key] ?? BOSH;
        const olinadi = Math.min(cur.coins, qolgan);
        if (olinadi <= 0) continue;
        yangi[c.key] = { ...cur, coins: cur.coins - olinadi };
        qolgan -= olinadi;
      }
      return yangi;
    });
    setKunlik((k) => tiklangan(k));
    return true;
  }, []);

  /* -------------------------------------------------- kunlik sinov */

  /**
   * Kunlik sinov natijasi.
   *
   * Darsdan ikki farqi bor va ikkalasi ham ataylab:
   *
   *   1. Yo'l xaritasiga YOZILMAYDI (`done` ga tegilmaydi) — sinov
   *      darslar tartibini oldinga surmaydi, u alohida narsa.
   *   2. Tanga IKKI BAROBAR. Sinovning butun ma'nosi shu: u faqat
   *      bugun ochiq va o'tkazib yuborilsa qaytmaydi.
   *
   * Yulduz esa odatdagidek qo'shiladi — haftalik liga aynan shuni
   * sanaydi va kunlik qaytishni mukofotlash ligadagi maqsad bilan
   * to'liq mos keladi.
   */
  const sinovTugadi = useCallback((c: Course, r: LessonResult) => {
    setAll((p) => {
      const cur = p[c.key] ?? BOSH;
      return {
        ...p,
        [c.key]: {
          ...cur,
          stars: cur.stars + r.stars,
          coins: cur.coins + r.correct * SINOV_TANGA,
          savollar: (cur.savollar ?? 0) + r.asked,
        },
      };
    });
    setKunlik((k) => kunlikYangila(k, r.asked));
    // Serverga ham boradi: liga va ota-ona paneli buni ko'rsin. `unit`
    // va `lesson` ataylab haqiqiy darslardan uzoq son — hisobotda u
    // o'z nomi bilan turadi va biror darsning natijasini buzmaydi.
    api.postResult({
      grade: c.grade, unit: SINOV_JOY, lesson: SINOV_JOY,
      lessonName: SINOV_NOM,
      asked: r.asked, correct: r.correct, mistakes: r.mistakes, stars: r.stars,
      durationMs: r.davomiylik,
    });
  }, []);

  return (
    <ProgressCtx.Provider
      value={{
        progressOf, darsTugadi, kunlik: kunlikKorinishi(kunlik), sotibOl, kiy,
        jamiTanga, tiklash, zanjirniTikla, sinovTugadi,
      }}
    >
      {children}
    </ProgressCtx.Provider>
  );
}

export function useProgress(): Ctx {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error("useProgress faqat <ProgressProvider> ichida ishlaydi");
  return c;
}
