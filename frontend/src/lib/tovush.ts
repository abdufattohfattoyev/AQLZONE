/**
 * TOVUSH — narsalarning HAQIQIY ovozi, brauzerning o'zida yasaladi.
 *
 * ─────────── NEGA TTS EMAS ───────────
 *
 * Ilgari mashina kartasi "bi-bip" degan SO'ZNI aytardi — ya'ni odam
 * ovozi mashina tovushini taqlid qilardi. Bola esa mashinani ko'chada
 * eshitgan: u yerda "bi-bip" degan so'z emas, SIGNAL yangraydi.
 * Taqlid qilingan tovush kulgili, lekin u hech narsani o'rgatmaydi —
 * bola uni haqiqiy mashina bilan bog'lay olmaydi.
 *
 * ─────────── NEGA FAYL EMAS ───────────
 *
 * Tayyor mp3 yuklab qo'yish ham mumkin edi. Uch sabab bilan
 * qilinmadi:
 *
 *   OG'IRLIK. O'n ikkita tovush — bir necha megabayt. Ilova esa
 *   telefonda, ko'pincha sekin internetda ochiladi.
 *   LITSENZIYA. Internetdagi "bepul" tovushlarning ko'pi aslida
 *   shartli bepul va startup uchun bu vaqt bombasi.
 *   MOSLASHUV. Yasalgan tovushni sozlash mumkin: sirenani
 *   sekinlashtirish, signalni yumshatish. Faylni esa qayta yozish kerak.
 *
 * Bu yerdagi hammasi `AudioContext` da, o'nlab qator kod bilan
 * yasaladi va HECH QANDAY fayl yuklanmaydi — ya'ni internetsiz ham
 * birinchi ochilishdayoq ishlaydi.
 *
 * ─────────── QURILISH TAMOYILI ───────────
 *
 * Har bir tovush — bir necha oddiy to'lqinning yig'indisi:
 *
 *   SIGNAL   ikkita kvinta oralig'idagi ohang (haqiqiy avtomobil
 *            signali ham akkord, yakka nota emas — shuning uchun
 *            bitta ossilyator "tiq" bo'lib eshitiladi)
 *   SIRENA   chastotasi past va yuqori orasida sekin yuguradigan nota
 *   QO'NG'IROQ  FM sintez: metall jarangi shundan chiqadi
 *   DVIGATEL  past arra to'lqin + shovqin, sekin puls bilan
 *
 * Hammasi qisqa (0.4–1.6 s): bu tovush emas, ISHORA. Uzun tovush
 * bolani zeriktiradi va u keyingi kartaga o'tib ketadi.
 */

import { ovozYoniqmi } from "./ovoz";

/** Tovush turlari — `lib/kichkintoy.ts` dagi kartalar shularga ishora qiladi. */
export type TovushNomi =
  | "signal"      // yengil avtomobil — ikki karra "bip"
  | "avtobus"     // avtobusning past signali
  | "yuk"         // yuk mashinasining juda past signali
  | "sirena"      // o't o'chirish, tez yordam, politsiya
  | "traktor"     // sekin "tir-tir" dvigatel
  | "qongiroq"    // velosiped qo'ng'irog'i
  | "poyezd"      // "chuh-chuh" ritmi va uning ustidan hushtak
  | "samolyot"    // reaktiv dvigatel shovqini
  | "kema";       // kemaning past gudogi

/**
 * `AudioContext` — bitta, birinchi kerak bo'lganda yasaladi.
 *
 * Sahifa ochilishi bilan yasab bo'lmaydi: brauzer foydalanuvchi
 * hech narsa bosmagunicha ovozni bloklaydi va kontekst "suspended"
 * holatda qotib qoladi. Birinchi bosishda esa u o'zi uyg'onadi.
 */
let ctx: AudioContext | null = null;

function kontekst(): AudioContext | null {
  try {
    const K = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!K) return null;
    ctx ??= new K();
    // Telefon ekrani o'chib yonganda kontekst to'xtab qoladi.
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/**
 * Umumiy tovush balandligi.
 *
 * 0.22 — ataylab past. Bu tovushlar bolaning qulog'iga yaqin turgan
 * telefondan chiqadi va ular ilovaning ASOSIY ovozi emas: nomni
 * aytadigan odam ovozi ulardan baland bo'lishi kerak.
 */
const BALANDLIK = 0.22;

/** Ayni paytda yangrayotgan tugunlar — yangi tovush eskisini bo'ladi. */
let joriy: { stop: () => void } | null = null;

export function tovushniToxtat(): void {
  if (joriy) {
    try { joriy.stop(); } catch { /* allaqachon tugagan */ }
    joriy = null;
  }
}

/**
 * Bitta ossilyator + o'z konverti.
 *
 * `chiqish` — umumiy kuchaytirgich. Har bir tovush o'z konvertini
 * oladi, aks holda ular bir-birining ovozini kesib yuborardi.
 */
function nota(
  c: AudioContext, chiqish: GainNode,
  tur: OscillatorType, chastota: number,
  boshla: number, davom: number, kuch: number,
): OscillatorNode {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tur;
  o.frequency.setValueAtTime(chastota, boshla);

  // Konvert: tez ko'tarilish, sekin so'nish. Keskin boshlanish
  // ("klik") eshitilmasligi uchun ko'tarilish nolinchi emas, 8 ms.
  g.gain.setValueAtTime(0.0001, boshla);
  g.gain.exponentialRampToValueAtTime(kuch, boshla + 0.008);
  g.gain.setValueAtTime(kuch, boshla + davom * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, boshla + davom);

  o.connect(g).connect(chiqish);
  o.start(boshla);
  o.stop(boshla + davom + 0.05);
  return o;
}

/** Oq shovqin buferi — dvigatel va samolyot uchun. */
function shovqin(c: AudioContext, davom: number): AudioBuffer {
  const n = Math.max(1, Math.floor(c.sampleRate * davom));
  const b = c.createBuffer(1, n, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

/* ─────────────────────────── tovushlar ─────────────────────────── */

/**
 * Avtomobil signali — ikki karra qisqa "bip".
 *
 * Haqiqiy signal AKKORD: ikkita karnay bir vaqtda, kvinta oralig'ida
 * yangraydi. Yakka nota o'yinchoq "tiq" bo'lib eshitiladi va bola uni
 * mashina bilan bog'lamaydi.
 */
function signalOvozi(c: AudioContext, out: GainNode, t: number, past = 0): void {
  const a = 415 - past;
  const b = 500 - past;
  for (const kech of [0, 0.26]) {
    nota(c, out, "sawtooth", a, t + kech, 0.19, 0.5);
    nota(c, out, "sawtooth", b, t + kech, 0.19, 0.38);
    // Uchinchi, juda past nota — "vazn" beradi. Usiz signal
    // arzon o'yinchoqnikiga o'xshaydi.
    nota(c, out, "triangle", a / 2, t + kech, 0.19, 0.3);
  }
}

/** Sirena — chastotasi past va yuqori orasida yuguradigan nota. */
function sirenaOvozi(c: AudioContext, out: GainNode, t: number): void {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sawtooth";

  // Ikki marta "vi-u". Chastota BOSQICHMA-BOSQICH emas, silliq
  // ko'tariladi: keskin sakrash ikkita alohida nota bo'lib eshitiladi.
  const davr = 0.62;
  o.frequency.setValueAtTime(660, t);
  for (let i = 0; i < 2; i++) {
    const b = t + i * davr;
    o.frequency.linearRampToValueAtTime(1180, b + davr * 0.45);
    o.frequency.linearRampToValueAtTime(660, b + davr);
  }

  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.42, t + 0.04);
  g.gain.setValueAtTime(0.42, t + davr * 2 - 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, t + davr * 2);

  // Past filtr — arra to'lqinning o'tkir yuqori qismini yumshatadi.
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 2400;

  o.connect(f).connect(g).connect(out);
  o.start(t);
  o.stop(t + davr * 2 + 0.05);
}

/** Velosiped qo'ng'irog'i — FM sintez, metall jarangi shundan chiqadi. */
function qongiroqOvozi(c: AudioContext, out: GainNode, t: number): void {
  for (const kech of [0, 0.22]) {
    const b = t + kech;
    const tashuvchi = c.createOscillator();
    const modul = c.createOscillator();
    const modulKuch = c.createGain();
    const g = c.createGain();

    tashuvchi.type = "sine";
    tashuvchi.frequency.value = 1520;
    // 3.5 — butun bo'lmagan nisbat. Aynan shu narsa ohangni
    // "notada" emas, METALLDA eshittiradi.
    modul.type = "sine";
    modul.frequency.value = 1520 * 3.5;
    modulKuch.gain.setValueAtTime(1400, b);
    modulKuch.gain.exponentialRampToValueAtTime(1, b + 0.35);

    g.gain.setValueAtTime(0.0001, b);
    g.gain.exponentialRampToValueAtTime(0.34, b + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, b + 0.5);

    modul.connect(modulKuch).connect(tashuvchi.frequency);
    tashuvchi.connect(g).connect(out);
    modul.start(b); modul.stop(b + 0.55);
    tashuvchi.start(b); tashuvchi.stop(b + 0.55);
  }
}

/**
 * Bitta "chuh" — bug'ning bir marta chiqishi.
 *
 * Ikki qatlam: shovqin (bug'ning o'zi) va juda past qisqa nota
 * (porshenning zarbi). Yolg'iz shovqin "pshsh" bo'lib eshitiladi va
 * bolaga poyezdni emas, suv sepgichni eslatadi — vaznni aynan past
 * nota beradi.
 */
function chuh(c: AudioContext, out: GainNode, t: number, kuch: number): void {
  const s = c.createBufferSource();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  s.buffer = shovqin(c, 0.22);
  // Filtr yuqoridan pastga tushadi: bug' chiqib, tarqab ketadi.
  f.type = "lowpass";
  f.frequency.setValueAtTime(1600, t);
  f.frequency.exponentialRampToValueAtTime(320, t + 0.18);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(kuch, t + 0.014);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  s.connect(f).connect(g).connect(out);
  s.start(t); s.stop(t + 0.22);

  nota(c, out, "sine", 68, t, 0.11, kuch * 0.5);
}

/**
 * Poyezd — "chuh-chuh" ustiga hushtak.
 *
 * ILGARI BU YERDA FAQAT HUSHTAK BOR EDI. Hushtak esa yakka holda
 * poyezdni bildirmaydi: uchta uzun nota kemaning gudogiga ham,
 * organga ham o'xshab ketadi. Poyezdni taniqli qiladigan narsa
 * OHANG emas, RITM — g'ildirakning bir tekis "chuh-chuh" i. Bola uni
 * o'zi ham takrorlaydi.
 *
 * Shuning uchun tovush ikki qatlam: pastda oltita "chuh", ularning
 * ustida — yarim yo'lda kirib keladigan hushtak. Aynan shu tartib
 * haqiqiy poyezddagidek: u avval qo'zg'aladi, keyin hushtak chaladi.
 */
function poyezdOvozi(c: AudioContext, out: GainNode, t: number): void {
  // Oraliq sekin QISQARADI (0.3 → 0.22): poyezd tezlashadi. Bir tekis
  // ritm mexanik bo'lib eshitilardi, tezlashuvi esa harakatni beradi.
  let x = 0;
  for (let i = 0; i < 6; i++) {
    chuh(c, out, t + x, i === 0 ? 0.42 : 0.34);
    x += 0.3 - i * 0.016;
  }

  // Hushtak — chuhlar boshlangach kiradi. Uch nota, bittasi ataylab
  // "falsh" (466 Hz): shundan o'sha tanish g'amgin ohang chiqadi.
  const h = t + 0.62;
  for (const [hz, kuch] of [[392, 0.3], [466, 0.23], [587, 0.17]] as const) {
    nota(c, out, "sine", hz, h, 0.95, kuch);
    nota(c, out, "triangle", hz, h + 0.02, 0.9, kuch * 0.4);
  }
}

/** Traktor — sekin "tir-tir": past arra to'lqin, pulsli kuchaytirgich. */
function traktorOvozi(c: AudioContext, out: GainNode, t: number): void {
  const davom = 1.35;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();

  o.type = "sawtooth";
  o.frequency.setValueAtTime(78, t);
  f.type = "lowpass";
  f.frequency.value = 620;

  // Puls: sekundiga ~9 marta. Dvigatelning "tir-tir" i shu —
  // tovushning o'zi emas, uning UZILIB turishi.
  g.gain.setValueAtTime(0.0001, t);
  const puls = 1 / 9;
  for (let x = 0; x < davom - puls; x += puls) {
    g.gain.exponentialRampToValueAtTime(0.4, t + x + 0.012);
    g.gain.exponentialRampToValueAtTime(0.06, t + x + puls * 0.85);
  }
  g.gain.exponentialRampToValueAtTime(0.0001, t + davom);

  o.connect(f).connect(g).connect(out);
  o.start(t); o.stop(t + davom + 0.05);
}

/** Samolyot — filtri suriladigan shovqin: "vij-j-j" o'tib ketadi. */
function samolyotOvozi(c: AudioContext, out: GainNode, t: number): void {
  const davom = 1.3;
  const s = c.createBufferSource();
  const g = c.createGain();
  const f = c.createBiquadFilter();

  s.buffer = shovqin(c, davom);
  f.type = "bandpass";
  f.Q.value = 1.4;
  // Filtr pastdan yuqoriga, keyin yana pastga — samolyot yaqinlashib,
  // uzoqlashgandek. Doppler effekti shundan tuyuladi.
  f.frequency.setValueAtTime(420, t);
  f.frequency.exponentialRampToValueAtTime(2600, t + davom * 0.45);
  f.frequency.exponentialRampToValueAtTime(500, t + davom);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + davom);

  s.connect(f).connect(g).connect(out);
  s.start(t); s.stop(t + davom);
}

/**
 * Kema gudogi — juda past va uzun.
 *
 * Uchta nota oberton qatorini yasaydi (104 · 156 · 208 Hz). Yakka past
 * nota telefon karnayida deyarli eshitilmasdi: kichik karnay 100 Hz ni
 * chiqara olmaydi, lekin obertonlar borligi uchun quloq past tovushni
 * O'ZI "eshitadi".
 */
function kemaOvozi(c: AudioContext, out: GainNode, t: number): void {
  for (const [hz, kuch] of [[104, 0.45], [156, 0.22], [208, 0.12]] as const) {
    nota(c, out, "sawtooth", hz, t, 1.5, kuch);
  }
}

/* ─────────────────────────── umumiy kirish ─────────────────────────── */

/**
 * Tovushni chaladi. Ovoz o'chirilgan bo'lsa hech narsa qilmaydi.
 *
 * Xato butunlay yutiladi: `AudioContext` eski brauzerda bo'lmasligi,
 * telefon "jim rejim" da turishi mumkin. Bularning hech biri kartani
 * ochilmay qoldirmasligi kerak.
 */
export function tovushniChal(nom: TovushNomi): void {
  if (!ovozYoniqmi()) return;
  const c = kontekst();
  if (!c) return;

  try {
    tovushniToxtat();

    const out = c.createGain();
    out.gain.value = BALANDLIK;
    out.connect(c.destination);

    // 0.02 s kechikish — brauzerga tugunlarni ulashga vaqt beradi.
    // Usiz birinchi tovush ba'zan boshidan kesilib eshitiladi.
    const t = c.currentTime + 0.02;

    switch (nom) {
      case "signal": signalOvozi(c, out, t); break;
      case "avtobus": signalOvozi(c, out, t, 150); break;
      case "yuk": signalOvozi(c, out, t, 230); break;
      case "sirena": sirenaOvozi(c, out, t); break;
      case "traktor": traktorOvozi(c, out, t); break;
      case "qongiroq": qongiroqOvozi(c, out, t); break;
      case "poyezd": poyezdOvozi(c, out, t); break;
      case "samolyot": samolyotOvozi(c, out, t); break;
      case "kema": kemaOvozi(c, out, t); break;
    }

    joriy = { stop: () => out.disconnect() };
  } catch {
    /* ovoz chiqmadi — karta baribir ochiladi */
  }
}
