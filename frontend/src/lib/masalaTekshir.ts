/**
 * Masala yozayotganda ko'rinadigan tekshiruvlar.
 *
 * ─────────────── NIMANI TEKSHIRADI VA NIMANI YO'Q ───────────────
 *
 * Bu yerdagi tekshiruvlar faqat SHAKL haqida: matn yetarlicha
 * uzunmi, javob qisqami, yechimda qadam bormi. Masalaning
 * matematikasi to'g'rimi — buni bu kod BILMAYDI va bilishga
 * urinmaydi ham.
 *
 * Farq muhim va u ekranda ham ko'rinishi kerak: yashil belgi
 * "tekshirildi, to'g'ri" degani emas, "shakli joyida" degani.
 * Aks holda muallif ham, tasdiqlaydigan odam ham ularga ortiqcha
 * ishonib qolardi — va o'shanda xato masala yashil belgilar bilan
 * birga o'tib ketardi.
 *
 * ─────────────── ENG FOYDALI TEKSHIRUV ───────────────
 *
 * "Javob yechim ichida uchraydimi" — shaklga oid bo'lsa ham,
 * HAQIQIY xatoni tutadi. Muallif javobga 17 yozib, yechimni
 * "= 15" bilan tugatsa, ikkisi mos emas va buni birov tasdiqlashdan
 * oldin aytish kerak. Amalda bu eng ko'p uchraydigan e'tiborsizlik.
 *
 * Mantiq React'siz sinaladi (`scripts/masala.ts`), shuning uchun u
 * ekranda emas, shu yerda turadi.
 */

/** Bitta tekshiruv natijasi. */
export interface Belgi {
  /** `ok` — yashil, `ogoh` — sariq (xato emas, maslahat). */
  holat: "ok" | "ogoh";
  /** Ekranda ko'rinadigan matn kaliti (`lib/matn.ts`). */
  kalit: string;
  /** Matndagi `{n}` kabi o'rinlar. */
  orin?: Record<string, string | number>;
}

/** Server talab qiladigan eng kichik uzunliklar (`serializers.py`). */
export const MIN_MATN = 20;
export const MIN_YECHIM = 10;

/**
 * Javobni solishtirishga tayyorlaydi.
 *
 * SERVERDAGI qoida bilan bir xil (`core/models.py` dagi
 * `javob_normal`): bo'sh joy tashlanadi, harflar kichrayadi,
 * vergul nuqtaga aylanadi. Ikki joyda ikki xil bo'lsa, ekranda
 * "javob yechimda bor" deb turgan masala serverda boshqacha
 * hisoblanardi.
 */
export function normal(v: string): string {
  return (v || "")
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/[−–]/g, "-")
    .replace(/\s+/g, "");
}

/** Masala shartining tekshiruvlari. */
export function matnBelgilari(matn: string): Belgi[] {
  const m = matn.trim();
  if (!m) return [];

  const r: Belgi[] = [];
  if (m.length >= MIN_MATN) {
    r.push({ holat: "ok", kalit: "tekshirUzunlik", orin: { n: m.length } });
  } else {
    r.push({ holat: "ogoh", kalit: "tekshirQisqa", orin: { n: MIN_MATN - m.length } });
  }

  // Savol belgisi yoki so'roq so'zi. Ikkalasi ham qabul qilinadi:
  // "Nechta olma qoldi" degan matn savol belgisiz ham savol.
  const savol = /[?？]/.test(m) || /\b(nechta|necha|qancha|toping|hisoblang|aniqlang)\b/i.test(m);
  r.push(savol
    ? { holat: "ok", kalit: "tekshirSavol" }
    : { holat: "ogoh", kalit: "tekshirSavolYoq" });

  return r;
}

/** Javobning tekshiruvlari. */
export function javobBelgilari(javob: string): Belgi[] {
  const j = javob.trim();
  if (!j) return [];

  const r: Belgi[] = [];
  // Uzun javob deyarli har doim yechim bo'lib chiqadi — odam uni
  // noto'g'ri maydonga yozgan bo'ladi.
  r.push(j.length <= 24
    ? { holat: "ok", kalit: "tekshirJavobQisqa" }
    : { holat: "ogoh", kalit: "tekshirJavobUzun" });

  // Son bo'lsa yechuvchi uchun ham osonroq: "12 sm" va "12sm"
  // bir xil hisoblanadi, "o'n ikki" esa yo'q.
  if (/\d/.test(j)) r.push({ holat: "ok", kalit: "tekshirJavobSon" });
  else r.push({ holat: "ogoh", kalit: "tekshirJavobSonsiz" });

  return r;
}

/**
 * Yechimning tekshiruvlari — javob bilan solishtirib.
 *
 * `javob` bo'sh bo'lsa solishtiruv o'tkazilmaydi: odam hali javobni
 * yozmagan bo'lishi mumkin va o'sha paytda "javob yechimda yo'q"
 * deb turgan sariq belgi faqat chalg'itardi.
 */
export function yechimBelgilari(yechim: string, javob: string): Belgi[] {
  const y = yechim.trim();
  if (!y) return [];

  const r: Belgi[] = [];
  if (y.length >= MIN_YECHIM) {
    r.push({ holat: "ok", kalit: "tekshirYechimUzunlik" });
  } else {
    r.push({ holat: "ogoh", kalit: "tekshirYechimQisqa", orin: { n: MIN_YECHIM - y.length } });
  }

  // Qadamlar: tenglik belgilari soni. Bittasi ham bo'lmasa, yechim
  // ko'pincha javobning qayta yozilishi bo'lib chiqadi.
  const qadam = (y.match(/=/g) || []).length;
  r.push(qadam >= 1
    ? { holat: "ok", kalit: "tekshirQadam", orin: { n: qadam } }
    : { holat: "ogoh", kalit: "tekshirQadamYoq" });

  const j = normal(javob);
  if (j) {
    r.push(normal(y).includes(j)
      ? { holat: "ok", kalit: "tekshirJavobBor", orin: { javob: javob.trim() } }
      : { holat: "ogoh", kalit: "tekshirJavobYoq", orin: { javob: javob.trim() } });
  }

  return r;
}

/** Qadam to'ldirilganmi — "Keyingi" tugmasi shunga qaraydi. */
export const matnTayyor = (matn: string): boolean => matn.trim().length >= MIN_MATN;
export const javobTayyor = (javob: string): boolean => javob.trim().length > 0;
export const yechimTayyor = (yechim: string): boolean => yechim.trim().length >= MIN_YECHIM;
