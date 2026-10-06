/**
 * Prezident va ixtisoslashtirilgan maktablarga tayyorlov (`src/lib/qabul.ts`,
 * `src/lib/qabulSavol.ts`).
 *
 *     jiti scripts/qabul.ts        o'zbekcha
 *     jiti scripts/qabul.ts ru     ruscha
 *
 * NEGA SINOV KERAK. Bu savollar bolaning HAQIQIY imtihoniga tayyorlaydi:
 * bitta noto'g'ri "to'g'ri javob" bola ishonchini va ota-ona ishonchini
 * birdan buzadi. Generatorlar tasodifiy, ya'ni xato faqat ba'zi
 * sonlarda chiqadi — shuning uchun har biri yuzlab marta yasaladi.
 *
 *   1. Tuzilish   30 topshiriq, mavzular va darajalar spetsifikatsiyadagidek,
 *                 ball yig'indisi 51.
 *   2. Variantlar 4 ta, takrorsiz, to'g'risi ichida, yaroqsiz qiymat yo'q.
 *   3. Javob      formulali savollarda javob MUSTAQIL qayta hisoblanadi
 *                 (ifoda, tenglama, bo'linish alomati).
 *   4. Variant    har tur × 12 variant: savol soni to'g'ri, bir variant
 *                 ichida takror yo'q, urug' bir xil natija beradi.
 */
const ruMi = process.argv.includes("ru");
// `til()` modul yuklanganda o'qiladi — import'dan OLDIN. Til HAR DOIM
// aniq beriladi: aks holda Node tizim tilidan taxmin qiladi (ruscha
// Windows'da "uz" sinovi ham ruscha ishlab ketardi).
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => (k === "azapp_til" ? (ruMi ? "ru" : "uz") : null), setItem: () => {}, removeItem: () => {},
};

async function main() {
  const { BALL, MALUMOT, MANTIQ, TOPSHIRIQLAR } = await import("../src/lib/qabulSavol");
  const { QABUL, QABUL_TURLAR, QABUL_VARIANT, qabulBallari, qabulYasa, savolIzi } = await import("../src/lib/qabul");

  const xatolar: string[] = [];
  let savollar = 0;

  /* 1. Tuzilish */
  const sana = <T extends string>(x: T[]) => x.reduce((m, k) => ({ ...m, [k]: (m[k] ?? 0) + 1 }), {} as Record<string, number>);
  const daraja = sana(TOPSHIRIQLAR.map((x) => x.daraja));
  const soha = sana(TOPSHIRIQLAR.map((x) => x.soha));
  const kut = (nom: string, k: unknown, b: unknown) => {
    if (JSON.stringify(k) !== JSON.stringify(b)) xatolar.push(`${nom}: kutilgan ${JSON.stringify(k)}, bor ${JSON.stringify(b)}`);
  };
  kut("topshiriqlar soni", 30, TOPSHIRIQLAR.length);
  kut("darajalar", { bilish: 6, qollash: 6, murakkab: 9, mulohaza: 9 },
    { bilish: daraja.bilish, qollash: daraja.qollash, murakkab: daraja.murakkab, mulohaza: daraja.mulohaza });
  kut("mavzular", { sonlar: 8, kasr: 2, ifoda: 6, nisbat: 3, harakat: 3, statistika: 3, geometriya: 5 },
    { sonlar: soha.sonlar, kasr: soha.kasr, ifoda: soha.ifoda, nisbat: soha.nisbat, harakat: soha.harakat, statistika: soha.statistika, geometriya: soha.geometriya });
  kut("ball yig'indisi", 51, Math.round(TOPSHIRIQLAR.reduce((s, x) => s + BALL[x.daraja], 0) * 10) / 10);
  kut("ixtisos ballari", 51, Math.round((qabulBallari("ixtisos") ?? []).reduce((a, b) => a + b, 0) * 10) / 10);

  /* 2–3. Har yasovchi */
  const hisob = (s: string) => Function(`return (${s.replace(/·/g, "*").replace(/:/g, "/").replace(/−/g, "-")})`)() as number;
  const yasovchilar = [...new Set([...TOPSHIRIQLAR, ...MALUMOT, ...MANTIQ].map((x) => x.yasa))];
  for (const yasa of yasovchilar) {
    for (let k = 0; k < 400; k++) {
      const a = yasa();
      savollar++;
      const joy = `${yasa.name}: «${a.prompt}» ${a.text ?? ""}`;
      const v = a.choices.map(String);
      if (!a.prompt) xatolar.push(`${yasa.name}: savol bo'sh`);
      if (v.length !== 4) xatolar.push(`${joy} — variant ${v.length} ta`);
      if (new Set(v).size !== v.length) xatolar.push(`${joy} — takror variant [${v.join(" | ")}]`);
      if (!v.includes(String(a.answer))) xatolar.push(`${joy} — javob ${a.answer} variantlarda yo'q [${v.join(" | ")}]`);
      if (v.some((x) => /NaN|undefined|Infinity|^-|null/.test(x))) xatolar.push(`${joy} — yaroqsiz variant [${v.join(" | ")}]`);
      if (!a.yechim?.length) xatolar.push(`${yasa.name}: yechim yo'q`);
      // Sahna bo'sh qolmasin: aks holda test ekrani o'rniga katta "?" chizadi.
      if (!a.kirish && !a.text && !a.rasm) xatolar.push(`${yasa.name}: sahna bo'sh (shart, formula yoki chizma yo'q)`);
      for (const m of [a.prompt, a.kirish ?? "", a.text ?? "", ...(a.yechim ?? []).map((y) => y.if ?? "")]) {
        if (/NaN|undefined|Infinity/.test(m)) xatolar.push(`${joy} — matnda yaroqsiz qiymat: ${m}`);
      }
      const javob = Number(String(a.answer).replace(/ /g, ""));

      // Ifoda: formulaning o'zini hisoblaymiz.
      if (yasa.name === "amallarTartibi" && hisob(a.text!) !== javob) xatolar.push(`${joy} — hisob ${hisob(a.text!)} ≠ ${javob}`);
      // Tenglama: javobni qo'yib tekshiramiz.
      if (yasa.name === "tenglama") {
        const [chap, ong] = a.text!.split("=");
        if (hisob(chap!.replace(/x/g, `(${javob})`)) !== Number(ong)) xatolar.push(`${joy} — x = ${javob} tenglamani qanoatlantirmaydi`);
      }
      // Bo'linish alomati: variantlardan AYNAN bittasi bo'linadi.
      if (yasa.name === "bolinishAlomati") {
        const k2 = Number(/(\d+)/.exec(a.prompt)![1]);
        const bol = v.filter((x) => Number(x) % k2 === 0);
        if (bol.length !== 1 || bol[0] !== String(a.answer)) xatolar.push(`${joy} — bo'linadiganlar: [${bol.join(", ")}]`);
      }
      // Ketma-ketlik: javob natural son va ketma-ketlikdagi oxirgisidan katta.
      if (yasa.name === "ketmaKetlik") {
        const q = a.text!.replace(/ /g, "").split(", ").slice(0, -1).map(Number);
        if (!(javob > q[q.length - 1]!)) xatolar.push(`${joy} — javob o'smaydi`);
      }
      // Kasr: javob qisqarmaydi (maxraj tub) va maxraj bir xil.
      if (yasa.name === "kasrlar") {
        const [s, m] = String(a.answer).split("/").map(Number);
        const [x1, y1, x2, , x3] = a.text!.split(/[\s/]+/).filter((t) => /^\d+$/.test(t)).map(Number);
        if (s !== x1! + x2! - x3! || m !== y1) xatolar.push(`${joy} — kasr hisobi`);
      }
    }
  }

  /* 4. Variantlar */
  for (const tur of QABUL_TURLAR) {
    for (let n = 1; n <= QABUL_VARIANT; n++) {
      const b = qabulYasa(tur, n), b2 = qabulYasa(tur, n);
      if (!b || !b2) { xatolar.push(`${tur} ${n}: yasalmadi`); continue; }
      if (b.savollar.length !== QABUL[tur].savol) xatolar.push(`${tur} ${n}: ${b.savollar.length} savol`);
      if (b.daqiqa !== QABUL[tur].daqiqa) xatolar.push(`${tur} ${n}: vaqt ${b.daqiqa}`);
      const iz = b.savollar.map((s) => savolIzi(s.a));
      if (new Set(iz).size !== iz.length) xatolar.push(`${tur} ${n}: variant ichida takror savol`);
      if (iz.join("#") !== b2.savollar.map((s) => savolIzi(s.a)).join("#")) {
        xatolar.push(`${tur} ${n}: urug' bir xil natija bermadi`);
      }
    }
  }
  if (qabulYasa("ixtisos", 0) !== null || qabulYasa("ixtisos", QABUL_VARIANT + 1) !== null) xatolar.push("chegaradan tashqari variant yasaldi");

  const noyob = [...new Set(xatolar)];
  console.log(`\nQabul (${ruMi ? "ru" : "uz"}): ${yasovchilar.length} yasovchi, ${savollar} savol, ${QABUL_TURLAR.length} tur × ${QABUL_VARIANT} variant`);
  if (noyob.length) {
    console.log(`\n❌ ${noyob.length} muammo:\n`);
    for (const x of noyob.slice(0, 40)) console.log("   " + x);
    process.exit(1);
  }
  console.log("✅ hammasi joyida\n");
}

void main();
