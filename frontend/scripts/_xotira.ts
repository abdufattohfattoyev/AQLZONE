/**
 * localStorage — Node'da yo'q, shuning uchun eng sodda nusxasi.
 *
 * Alohida fayl va sinov skriptida ENG BIRINCHI import qilinadi: ba'zi
 * modullar (`lib/api.ts`) xotirani yuklanish paytidayoq o'qiydi va
 * nusxa import'lardan keyin qo'yilsa, skript "localStorage is not
 * defined" bilan yiqilardi — `imtihon.ts` sinovi aynan shunday buzilgan edi.
 */
const xotira = new Map<string, string>();
const g = globalThis as unknown as { localStorage?: Storage };
if (!g.localStorage) {
  g.localStorage = {
    getItem: (k: string) => xotira.get(k) ?? null,
    setItem: (k: string, v: string) => void xotira.set(k, v),
    removeItem: (k: string) => void xotira.delete(k),
    clear: () => xotira.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

export {};
