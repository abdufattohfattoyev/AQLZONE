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
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { COURSES } from "./curriculum";
import type { Course } from "./curriculum";
import { lessonId } from "./types";
import type { Progress } from "./types";
import * as api from "./api";

export const BOSH: Progress = { stars: 0, coins: 0, done: {}, savollar: 0, olingan: [], kiygan: "" };

/** Bir kunda nechta savol yechish maqsad qilingan. */
export const KUNLIK_MAQSAD = 10;

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
}

/** Har oy nechta qoldirilgan kun kechiriladi. */
const OYLIK_MUZLATGICH = 1;

const KUNLIK_BOSH: Kunlik = {
  sana: "", savollar: 0, kunlar: 0,
  muzlatgich: OYLIK_MUZLATGICH, muzlatgichOyi: "", muzlaganKun: "",
};

/** Serverdagi va localStorage'dagi kalit — server faqat shunday kalitlarni qabul qiladi. */
const KUNLIK_KEY = "azapp_kunlik_v1";

/**
 * Sana MAHALLIY vaqt bo'yicha olinadi.
 * `toISOString()` UTC beradi — Toshkentda kechqurun o'ynagan bola uchun
 * u allaqachon "ertaga" bo'lib qoladi va kun noto'g'ri almashardi.
 */
function kunKaliti(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const kechaKaliti = () => kunKaliti(new Date(Date.now() - 86400_000));

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
  const oldingi = k.sana && k.sana === kunKaliti(new Date(Date.now() - 2 * 86400_000));
  if (oldingi && muzlatgich > 0) {
    return {
      sana: bugun, savollar, kunlar: k.kunlar + 1,
      muzlatgich: muzlatgich - 1, muzlatgichOyi: oy, muzlaganKun: bugun,
    };
  }

  return { sana: bugun, savollar, kunlar: 1, muzlatgich, muzlatgichOyi: oy, muzlaganKun: "" };
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
  /** Tulkiga buyum kiydirish (bo'sh satr — yechish). */
  kiy: (c: Course, buyumId: string) => void;
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

  return (
    <ProgressCtx.Provider
      value={{ progressOf, darsTugadi, kunlik: kunlikKorinishi(kunlik), sotibOl, kiy }}
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
