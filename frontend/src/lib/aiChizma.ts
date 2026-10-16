/**
 * AI javobidagi ```chizma bloklari: ajratish, tekshirish va ifoda tahlili.
 * Chizishning o'zi — `components/AiChizma.tsx`. Bu fayl Reactsiz, shuning
 * uchun `scripts/aiChizma.ts` uni to'g'ridan-to'g'ri tekshiradi.
 *
 * Model yozgan JSON va ifoda — ishonchsiz ma'lumot: har maydon tekshiriladi,
 * ifoda `eval` siz o'z tahlilchimizda hisoblanadi.
 */

/* ==================== matnni bo'laklash ==================== */

export type Bolak = { tur: "matn"; matn: string } | { tur: "chizma"; c: Chizma };

const BLOK = /```chizma\s*([\s\S]*?)```/g;

/** Javobni matn va chizma bo'laklariga ajratadi. */
export function bolakla(matn: string): Bolak[] {
  const natija: Bolak[] = [];
  let oxiri = 0;
  for (const m of matn.matchAll(BLOK)) {
    const oldin = matn.slice(oxiri, m.index).replace(/\n+$/, "");
    if (oldin.trim()) natija.push({ tur: "matn", matn: oldin.replace(/^\n+/, "") });
    const c = tekshir(m[1]);
    if (c) natija.push({ tur: "chizma", c });
    oxiri = (m.index ?? 0) + m[0].length;
  }
  const qolgan = matn.slice(oxiri).replace(/^\n+/, "");
  if (qolgan.trim()) natija.push({ tur: "matn", matn: qolgan });
  return natija;
}

/* ==================== turlar va tekshiruv ==================== */

export type Nuqta2 = [number, number];

export interface Grafik {
  tur: "grafik";
  x: Nuqta2;
  y: Nuqta2;
  funksiyalar: { f: Ifoda; nom: string }[];
  nuqtalar: { x: number; y: number; nom: string }[];
}

export interface Geometriya {
  tur: "geometriya";
  nuqtalar: Record<string, Nuqta2>;
  kesmalar: { a: string; b: string; shtrix: boolean }[];
  yorliqlar: { a: string; b: string; matn: string }[];
  burchaklar: { uch: string; a: string; b: string; matn: string; togri: boolean }[];
  aylanalar: { markaz: Nuqta2; r: number }[];
}

export interface SonOqi {
  tur: "sonOqi";
  /** `danNom`/`gachaNom` — uchning yozuvi ("π/4"); bo'lmasa son o'zi yoziladi. */
  oraliqlar: {
    dan: number | null; gacha: number | null; danYopiq: boolean; gachaYopiq: boolean; danNom: string; gachaNom: string;
  }[];
  nuqtalar: { x: number; yopiq: boolean; nom: string }[];
}

/**
 * Tayyorgarlik rejasi — kunlar va har kundagi ishlar (daqiqa bilan).
 * Ilgari reja suhbatida chizma yo'q edi va "rasm bilan chiz" deyilganda
 * model `[ ... ] ---> [ ... ]` kabi matnli "rasm" yasardi.
 */
export interface Reja {
  tur: "reja";
  kunlar: { kun: string; ishlar: { mavzu: string; daqiqa: number }[] }[];
}

export type Chizma = Grafik | Geometriya | SonOqi | Reja;

const son = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);
const juft = (x: unknown): x is Nuqta2 => Array.isArray(x) && x.length === 2 && son(x[0]) && son(x[1]);
const matnOl = (x: unknown, n = 24) => (typeof x === "string" ? x.slice(0, n) : "");
const royxat = (x: unknown): unknown[] => (Array.isArray(x) ? x.slice(0, 12) : []);

/** Model yozgan JSON — ishonchsiz ma'lumot: har maydon tekshiriladi. */
export function tekshir(xom: string): Chizma | null {
  let d: Record<string, unknown>;
  try {
    d = JSON.parse(xom.trim()) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!d || typeof d !== "object") return null;

  if (d.tur === "grafik") {
    const x = juft(d.x) && d.x[0] < d.x[1] ? d.x : ([-5, 5] as Nuqta2);
    const y = juft(d.y) && d.y[0] < d.y[1] ? d.y : ([-5, 5] as Nuqta2);
    const funksiyalar = royxat(d.funksiyalar).slice(0, 3).flatMap((f) => {
      const o = f as Record<string, unknown>;
      const ifoda = typeof o?.f === "string" ? tahlil(o.f) : null;
      return ifoda ? [{ f: ifoda, nom: matnOl(o.nom, 32) }] : [];
    });
    const nuqtalar = royxat(d.nuqtalar).flatMap((n) => {
      const o = n as Record<string, unknown>;
      return son(o?.x) && son(o?.y) ? [{ x: o.x, y: o.y, nom: matnOl(o.nom) }] : [];
    });
    if (!funksiyalar.length && !nuqtalar.length) return null;
    return { tur: "grafik", x, y, funksiyalar, nuqtalar };
  }

  if (d.tur === "geometriya") {
    const nuqtalar: Record<string, Nuqta2> = {};
    if (d.nuqtalar && typeof d.nuqtalar === "object") {
      for (const [k, v] of Object.entries(d.nuqtalar as Record<string, unknown>).slice(0, 16)) {
        if (juft(v)) nuqtalar[k.slice(0, 3)] = v;
      }
    }
    const nomlar = Object.keys(nuqtalar).sort((a, b) => b.length - a.length);
    /** "AB" → ["A","B"]; ko'p harfli nomlar (A1, O') ham ajraladi. */
    const ikkiga = (s: string): [string, string] | null => {
      for (const a of nomlar) {
        if (s.startsWith(a) && s.slice(a.length) in nuqtalar) return [a, s.slice(a.length)];
      }
      return null;
    };
    const kesmalar = royxat(d.kesmalar).flatMap((k) => {
      const o = typeof k === "string" ? { k, shtrix: false } : (k as Record<string, unknown>);
      const ab = typeof o?.k === "string" ? ikkiga(o.k) : null;
      return ab ? [{ a: ab[0], b: ab[1], shtrix: o.shtrix === true }] : [];
    });
    const yorliqlar = royxat(d.yorliqlar).flatMap((y) => {
      const o = y as Record<string, unknown>;
      const ab = typeof o?.kesma === "string" ? ikkiga(o.kesma) : null;
      return ab ? [{ a: ab[0], b: ab[1], matn: matnOl(o.matn, 12) }] : [];
    });
    const burchaklar = royxat(d.burchaklar).flatMap((b) => {
      const o = b as Record<string, unknown>;
      const ok = [o?.uch, o?.a, o?.b].every((n) => typeof n === "string" && n in nuqtalar);
      return ok ? [{ uch: o.uch as string, a: o.a as string, b: o.b as string,
        matn: matnOl(o.matn, 8), togri: o.togri === true }] : [];
    });
    const aylanalar = royxat(d.aylanalar).flatMap((a) => {
      const o = a as Record<string, unknown>;
      const m = juft(o?.markaz) ? o.markaz : typeof o?.markaz === "string" ? nuqtalar[o.markaz] : undefined;
      return m && son(o.r) && o.r > 0 ? [{ markaz: m, r: o.r }] : [];
    });
    if (!Object.keys(nuqtalar).length) return null;
    return { tur: "geometriya", nuqtalar, kesmalar, yorliqlar, burchaklar, aylanalar };
  }

  if (d.tur === "reja") {
    const kunlar = royxat(d.kunlar).flatMap((k) => {
      const o = k as Record<string, unknown>;
      const ishlar = royxat(o?.ishlar).slice(0, 4).flatMap((i) => {
        const w = i as Record<string, unknown>;
        const mavzu = matnOl(w?.mavzu, 48);
        return mavzu ? [{ mavzu, daqiqa: son(w.daqiqa) ? Math.max(0, Math.min(240, Math.round(w.daqiqa))) : 0 }] : [];
      });
      return ishlar.length ? [{ kun: matnOl(o.kun, 16), ishlar }] : [];
    });
    return kunlar.length ? { tur: "reja", kunlar } : null;
  }

  if (d.tur === "sonOqi") {
    const oraliqlar = royxat(d.oraliqlar).flatMap((o0) => {
      const o = o0 as Record<string, unknown>;
      const dan = son(o?.dan) ? o.dan : null;
      const gacha = son(o?.gacha) ? o.gacha : null;
      if (dan === null && gacha === null) return [];
      if (dan !== null && gacha !== null && dan > gacha) return [];
      return [{ dan, gacha, danYopiq: o.dan_yopiq === true, gachaYopiq: o.gacha_yopiq === true,
        danNom: matnOl(o.dan_nom, 12), gachaNom: matnOl(o.gacha_nom, 12) }];
    });
    const nuqtalar = royxat(d.nuqtalar).flatMap((n) => {
      const o = n as Record<string, unknown>;
      return son(o?.x) ? [{ x: o.x, yopiq: o.yopiq !== false, nom: matnOl(o.nom) }] : [];
    });
    if (!oraliqlar.length && !nuqtalar.length) return null;
    return { tur: "sonOqi", oraliqlar, nuqtalar };
  }
  return null;
}

/* ==================== ifoda tahlilchisi ==================== */

/**
 * `x^2 - 4*sin(x)` → x dan son qaytaradigan funksiya. `eval` YO'Q: model
 * yozgan satr ishonchsiz. Kichik rekursiv tahlilchi — faqat sonlar, x,
 * pi, e, + - * / ^, qavslar va oq ro'yxatdagi funksiyalar. Yashirin
 * ko'paytirish ham tushuniladi (`2x`, `3(x+1)`, `x sin(x)`).
 */
export type Ifoda = (x: number) => number;

const FUNKSIYALAR: Record<string, (v: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, tg: Math.tan, ctg: (v) => 1 / Math.tan(v),
  sqrt: Math.sqrt, abs: Math.abs, ln: Math.log, log: Math.log10, exp: Math.exp,
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan, arctg: Math.atan,
};

export function tahlil(manba: string): Ifoda | null {
  const s = manba.replace(/\s+/g, "").replace(/·|×/g, "*").replace(/−/g, "-").replace(/²/g, "^2").replace(/³/g, "^3")
    .replace(/√/g, "sqrt").replace(/π/g, "pi").replace(/^y=/, "");
  if (!s || s.length > 120) return null;
  let i = 0;
  type T = (x: number) => number;

  const raqam = (): T | null => {
    const m = /^\d*\.?\d+/.exec(s.slice(i));
    if (!m) return null;
    i += m[0].length;
    const v = Number(m[0]);
    return () => v;
  };

  const birlik = (): T | null => {
    if (s[i] === "-") { i++; const a = daraja(); return a && ((x) => -a(x)); }
    if (s[i] === "+") { i++; return daraja(); }
    return daraja();
  };

  const asos = (): T | null => {
    if (s[i] === "(") {
      i++;
      const a = yigindi();
      if (!a || s[i] !== ")") return null;
      i++;
      return a;
    }
    const r = raqam();
    if (r) return r;
    const m = /^[a-z]+/i.exec(s.slice(i));
    if (!m) return null;
    const soz = m[0].toLowerCase();
    if (soz === "x") { i += 1; return (x) => x; }
    if (soz === "pi") { i += 2; return () => Math.PI; }
    if (soz === "e") { i += 1; return () => Math.E; }
    // Eng uzun mos funksiya nomi ("arcsinx" → arcsin + x).
    const nom = Object.keys(FUNKSIYALAR).filter((f) => soz.startsWith(f)).sort((a, b) => b.length - a.length)[0];
    if (!nom) {
      // "xsin" kabi yopishgan — bitta x ni olib, qolganini keyingi ko'paytuvchi qilamiz.
      if (soz.startsWith("x")) { i += 1; return (x) => x; }
      return null;
    }
    i += nom.length;
    const f = FUNKSIYALAR[nom];
    const arg = asos();
    return arg && ((x) => f(arg(x)));
  };

  const daraja = (): T | null => {
    const a = asos();
    if (!a) return null;
    if (s[i] === "^") {
      i++;
      const b = birlik();
      return b && ((x) => Math.pow(a(x), b(x)));
    }
    return a;
  };

  const kopaytma = (): T | null => {
    let a = birlik();
    if (!a) return null;
    for (;;) {
      const ch = s[i];
      if (ch === "*" || ch === "/") {
        i++;
        const b = birlik();
        if (!b) return null;
        const chap: T = a;
        a = ch === "*" ? (x) => chap(x) * b(x) : (x) => chap(x) / b(x);
      } else if (ch && /[\d.(a-z]/i.test(ch)) {
        const b = daraja();
        if (!b) return null;
        const chap: T = a;
        a = (x) => chap(x) * b(x);
      } else return a;
    }
  };

  const yigindi = (): T | null => {
    let a = kopaytma();
    if (!a) return null;
    while (s[i] === "+" || s[i] === "-") {
      const ch = s[i++];
      const b = kopaytma();
      if (!b) return null;
      const chap: T = a;
      a = ch === "+" ? (x) => chap(x) + b(x) : (x) => chap(x) - b(x);
    }
    return a;
  };

  const f = yigindi();
  return f && i === s.length ? f : null;
}
