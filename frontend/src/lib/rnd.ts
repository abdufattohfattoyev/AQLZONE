/** Tasodifiy sonlar va javob variantlari — barcha generatorlar shu yerdan foydalanadi. */

export const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** To'g'ri javob atrofidan yaqin variantlar yasaydi (chalg'itish uchun). */
export function choicesAround(correct: number, n: number, lo: number, hi: number): number[] {
  const s = new Set<number>([correct]);
  let g = 0;
  while (s.size < n && g++ < 60) {
    let v = correct + rnd(-4, 4);
    if (v < lo) v = lo + s.size;
    if (v > hi) v = hi - s.size;
    if (v >= lo) s.add(v);
  }
  while (s.size < n) s.add(rnd(lo, hi));
  return shuffle([...s]);
}

/** Aniq javob + qo'lda tanlangan chalg'ituvchilar (sonlar uchun). */
export function pc(c: number, wrong: number[]): number[] {
  const s: number[] = [];
  wrong.forEach((x) => { if (x !== c && x >= 0 && !s.includes(x)) s.push(x); });
  let k = 1;
  while (s.length < 3) {
    const v = c + k * (k % 2 ? 1 : -1) * (1 + (k >> 1));
    if (v !== c && v >= 0 && !s.includes(v)) s.push(v);
    if (++k > 40) break;
  }
  return shuffle([c, ...shuffle(s).slice(0, 3)]);
}

/**
 * Aniq javob + chalg'ituvchilar, MANFIY sonlarga ham ruxsat.
 *
 * `pc` manfiylarni tashlab yuboradi va bu 1–5-sinf uchun to'g'ri: u
 * yerda manfiy son o'tilmagan, "−3" variant sifatida chiqsa savolning
 * o'zi noto'g'ri ko'rinardi. 6-sinfda esa manfiy son — mavzuning
 * O'ZI, shuning uchun butun sonlar uchun alohida yordamchi kerak.
 */
export function pcZ(c: number, wrong: number[]): number[] {
  const s: number[] = [];
  wrong.forEach((x) => { if (x !== c && !s.includes(x)) s.push(x); });
  let k = 1;
  while (s.length < 3) {
    const v = c + k * (k % 2 ? 1 : -1) * (1 + (k >> 1));
    if (v !== c && !s.includes(v)) s.push(v);
    if (++k > 40) break;
  }
  return shuffle([c, ...shuffle(s).slice(0, 3)]);
}

/** Aniq javob + chalg'ituvchilar (matn uchun, masalan "1/2"). */
export function pcS(c: string, wrong: string[], extra: string[]): string[] {
  const s: string[] = [];
  wrong.forEach((x) => { if (x !== c && !s.includes(x)) s.push(x); });
  for (const e of extra) {
    if (s.length >= 3) break;
    if (e !== c && !s.includes(e)) s.push(e);
  }
  return shuffle([c, ...s.slice(0, 3)]);
}
