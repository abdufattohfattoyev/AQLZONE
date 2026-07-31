/**
 * Xatolar daftaridan takrorlash darsini yig'ish.
 *
 * Har bir yozuv uchun O'SHA darsning generatorlaridan xuddi shu turdagi
 * yangi savol so'raymiz. Generatorlar tasodifiy ishlaydi, shuning uchun
 * kerakli tur birinchi urinishda chiqmasligi mumkin — bir necha marta
 * urinamiz va topolmasak, o'sha darsning istalgan savolini olamiz
 * (bu ham foydali takrorlash, chunki dars bir mavzuga tegishli).
 */
import { courseBySlug } from "./curriculum";
import { bugungilar } from "./daftar";
import type { Yozuv } from "./daftar";
import type { Activity, Gen } from "./activity";
import type { Lesson, Unit } from "./types";
import { t } from "./matn";

/** Kerakli turni topish uchun eng ko'p necha marta urinamiz. */
const URINISH = 24;

/** Bitta yozuvdan savol generatori yasaydi (dars topilmasa — null). */
function genYasa(y: Yozuv): Gen | null {
  const c = courseBySlug(y.kurs);
  const L = c?.units[y.ui]?.lessons[y.li];
  if (!L || !L.gens.length) return null;

  const joy = { kurs: y.kurs, ui: y.ui, li: y.li };

  return () => {
    let zaxira: Activity | null = null;
    for (let i = 0; i < URINISH; i++) {
      const a = L.gens[Math.floor(Math.random() * L.gens.length)]();
      zaxira ??= a;
      if (a.type === y.tur) return { ...a, joy };
    }
    // Kerakli tur chiqmadi — shu darsning boshqa savoli ham takrorlash uchun yaraydi.
    return { ...(zaxira as Activity), joy };
  };
}

/**
 * Bugun takrorlanishi kerak bo'lgan savollar soni.
 * Home ekranidagi kartani ko'rsatish uchun.
 */
export function bugungiSoni(kurs: string): number {
  return bugungilar(kurs).filter((y) => genYasa(y) !== null).length;
}

/**
 * Takrorlash darsi. Yozuv bo'lmasa `null` — chaqiruvchi kartani
 * umuman ko'rsatmaydi.
 */
export function takrorlashDarsi(kurs: string): { unit: Unit; lesson: Lesson } | null {
  const gens = bugungilar(kurs)
    .map(genYasa)
    .filter((g): g is Gen => g !== null)
    .slice(0, 8);            // bir o'tirishda 8 tadan ko'p bo'lmasin

  if (!gens.length) return null;

  return {
    unit: {
      u: t("xatolarDaftari"),
      ic: "repeat",
      color: "orange",
      intro: {
        t: t("xatolarDaftari"),
        v: ["?"],
        d: t("daftarIzoh"),
      },
      lessons: [],
    },
    lesson: { n: t("takrorlash"), ic: "repeat", gens, review: true },
  };
}
