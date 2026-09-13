/**
 * Aql Zone — dars yo'li (road map).
 *
 * ─────────── NEGA YANA QAYTA YASALDI ───────────
 *
 * Oldingi ko'rinish yo'lni OQ TASMA qilib chizardi: qalin lenta, ustida
 * ingichka punktir, tugunlar esa bir xil bob rangida. U ishlardi, lekin
 * ikkita narsani yo'qotardi.
 *
 *   YO'L HAMMA NARSANI YEB QO'YARDI. 22px enli oq tasma kartaning eng
 *   katta elementi edi va ko'z avval o'sha lentani, keyin darslarni
 *   ko'rardi. Aslida esa asosiy narsa — DARSLAR, yo'l ular orasidagi
 *   bog'lanish xolos.
 *
 *   BIR XIL TUGUNLAR. Hamma tugun bobning bitta rangida edi. Beshta
 *   bir xil doira ustma-ust turganda ko'z ularni sanay olmasdi: qaysi
 *   biri qayerda ekani faqat o'qib bilinardi.
 *
 * Endi yo'l — NUQTALAR IZI, tugunlar esa 3D OROLLAR (pastdagi `Orol`):
 * har biri o'z rangida, tepasida tanga, joriysi bayroqli va suzib turadi.
 * Yozuvlar sarlavha va izohli kartaga aylandi, ya'ni bir qarashda
 * "nima" va "qaysi holatda" degan ikkala savolga javob beradi.
 *
 * ─────────── O'ZGARMAGAN QARORLAR ───────────
 *
 *  1. Yo'l O'NG tomondan boshlanib chapga buriladi — bola qayerdan qadam
 *     tashlashini birinchi qarashda ko'radi.
 *  2. QULFLAR DEVORI yo'q. Ochilmagan darslarda qulf belgisi turmaydi:
 *     ular kichikroq va och rangda bo'ladi. Qulflar qatori bolani "bu
 *     yerga yo'l yo'q" degan tuyg'u bilan to'xtatadi; och tugun esa
 *     "hali oldinda" deb ko'rsatadi — bir xil ma'lumot, boshqa kayfiyat.
 *  3. Yo'lning o'tilgan qismi bo'yalgan turadi, shunda mehnat ko'rinadi.
 *  4. "Boshlash" pufagi tugun OSTIDA. Yon tomonda unga 320px enli
 *     telefonda joy yo'q edi — chetdagi tugunda pufakning yarmi
 *     kartadan tashqarida qolardi.
 *  5. Yo'l o'z yuzasida (yumshoq panel) turadi — ostidagi matematik
 *     naqsh nuqtalar orasidan o'tib, ularni yuvib yubormasligi kerak.
 */
import type { CSSProperties } from "react";
import { Icon } from "../lib/icons";
import { UNIT_COLORS, lessonId, nodeState } from "../lib/types";
import { t } from "../lib/matn";
import { kursMatn } from "../lib/tarjima/kurs";
import type { Progress, Unit } from "../lib/types";

const NODE = 72;         // tugun QATORINING balandligi — yo'l shu o'q bo'yicha yuradi
const STEP = 104;        // tugunlar orasidagi vertikal masofa

/**
 * 3D OROLLAR — tugunning o'lchamlari.
 *
 * ─────────── NEGA OROL ───────────
 *
 * Doira tugun yassi edi: gradient va nur bilan "ko'tarilgan" deb
 * ko'rsatilardi, lekin baribir tugma bo'lib qolardi. Orol esa JOY —
 * bola unga qadam qo'yadi, o'tganlari yashil maysaga aylanadi, oldinda
 * turganlari hali tumanda. Kurs kartalaridagi 3D narsalar bilan bir
 * oila: yumaloq, loy kabi, tepadan yorug'lik.
 *
 * Orol SVG bilan chiziladi, rasm bilan emas: rangi holatga qarab
 * o'zgaradi (tugagan, joriy, oldinda) va har bob o'z rangida. Rasm
 * bo'lsa har rang uchun alohida fayl kerak bo'lardi.
 *
 * Joriy orol eng katta va sekin suzadi — "shu yerdasan" degan ishora
 * harakat bilan beriladi. Qolganlari qimirlamaydi: yettita orol birdan
 * chayqalsa, ko'z qayerga qarashni bilmaydi.
 */
const OROL = 80;         // tugagan orol eni
const OROL_SM = 62;      // hali oldindagi orol — kichikroq, bosim kamayadi
const OROL_JORIY = 94;   // joriy orol — eng kattasi
const OROL_NISBAT = 0.78; // balandlik / en
/** Tepa yuza markazining balandlik ulushi — yo'l shu nuqtadan o'tadi. */
const YUZA_Y = 0.42;
const SVG_W = 252;       // yo'l chizig'i tuvali (markazga nisbatan ±126)

/**
 * Ilon izi — o'ngdan boshlanadi.
 *
 * Chetki qiymat 58 (ilgari 72 edi). Sabab o'lchovda ko'rindi: karta
 * tugunning bo'sh tomonida turadi va chetki tugunda unga atigi
 * `50% − 58 − gap` qoladi. 320px li telefonda bu ~60px edi — dars nomi
 * to'rt qatorga bo'linib ketardi.
 */
const OFF = [58, 42, 0, -42, -58, -42, 0, 42];

/**
 * Panel chetidagi bo'shliq.
 *
 * Birinchi tugun panelning yuqori chetiga TEGIB turardi va joriy
 * darsning kengayuvchi halqasi (`az-pulse`) kesilib qolardi — ya'ni
 * "shu yerdasan" degan eng muhim ishora yarim ko'rinardi.
 */
const PAD = 18;

/**
 * Tugun ranglari — dars tartibi bo'yicha aylanadi.
 *
 * NEGA HAR BIRI BOSHQA RANGDA. Bir xil rangdagi beshta doira ustma-ust
 * turganda ular bitta uzun narsaga qo'shilib ketadi va bola "uchinchi
 * dars" ni ko'z bilan topa olmaydi. Har birining o'z rangi bo'lsa,
 * qatordagi o'rin RANG BILAN eslab qolinadi ("binafsha darsdan keyin
 * ko'ki").
 *
 * YASHIL RO'YXATDA YO'Q va bu ataylab: yashil faqat TUGALLANGAN
 * darsniki. U ro'yxatda ham qatnashsa, tugagan dars tugamaganidan
 * farq qilmay qolardi.
 */
const TUGUN = ["#8b5cf6", "#3b82f6", "#ff9f43", "#ff7a6b", "#22b8cf", "#f5b301"];
const TUGAGAN = "#3fbf6f";

/** Rangning to'q juftligi — gradientning pastki chekkasi. */
const quyuq = (r: string) => `color-mix(in srgb, ${r} 76%, #101a33)`;
/**
 * Hali oldindagi orol uchun — o'sha rang, lekin tumanga cho'kkan.
 *
 * Sutga emas, karta foniga aralashtiriladi: qorong'i temada oq
 * aralashma orolni yorqin dog'ga aylantirardi va u "oldinda" emas,
 * "shu yerga bos" deb chaqirardi.
 */
const tuman = (r: string, ulush: number) =>
  `color-mix(in srgb, ${r} ${ulush}%, var(--color-karta, #2b3556))`;

const offAt = (i: number) => OFF[i % OFF.length];
const cx = (i: number) => SVG_W / 2 + offAt(i);
const cy = (i: number) => i * STEP + NODE / 2;

/** Tugun markazlaridan silliq o'tadigan yo'l chizig'i (kubik Bezye). */
function road(from: number, to: number): string {
  if (to <= from) return "";
  const k = STEP * 0.42;
  let d = `M ${cx(from)} ${cy(from)}`;
  for (let i = from; i < to; i++) {
    d += ` C ${cx(i)} ${cy(i) + k}, ${cx(i + 1)} ${cy(i + 1) - k}, ${cx(i + 1)} ${cy(i + 1)}`;
  }
  return d;
}

interface Props {
  units: Unit[];
  unitIndex: number;
  progress: Progress;
  onStart: (ui: number, li: number) => void;
}

export function RoadMap({ units, unitIndex, progress, onStart }: Props) {
  const U = units[unitIndex];
  const n = U.lessons.length;
  // Oxirgi tugun ostida "Boshlash" pufagi uchun joy qoldiriladi — aks
  // holda oxirgi dars joriy bo'lganda pufak kartadan pastga chiqib ketardi.
  const height = (n - 1) * STEP + NODE + 44;
  const color = UNIT_COLORS[U.color];

  // yo'lning bo'yalgan qismi — boshidan uzluksiz tugagan darslar
  let paved = -1;
  for (let li = 0; li < n; li++) {
    if (progress.done[lessonId(unitIndex, li)]) paved = li;
    else break;
  }

  const base = road(0, n - 1);

  return (
    <div className="relative w-full" style={{ height: height + PAD * 2 }}>
      {/* ---- yo'lning O'Z YUZASI ----
          Rang bobnikidan olinadi, lekin past to'yinganlikda: panel
          ko'zga tashlanmasligi, faqat fonni to'sishi kerak. Ichkarida
          yupqa yorug' chegara — yuza "botiq" bo'lib ko'rinadi va yo'l
          uning ichida yotgandek tuyuladi.

          ALOHIDA QATLAM bo'lib turadi, tugunlarning ota-elementi
          emas. Sabab: `overflow-hidden` bilan joriy darsning
          kengayuvchi halqasi (`az-pulse`) panel chetida kesilib
          qolardi. Fon esa hech narsani kesmaydi.

          Rang KLASS bilan emas, uslub bilan beriladi: Tailwind
          klasslarni manba matnidan topib yasaydi va `${color.road}14`
          kabi yig'ilgan satr hech qachon CSS'ga tushmasdi. */}
      <div aria-hidden className="absolute inset-0 rounded-clay"
        style={{
          backgroundColor: `${color.road}12`,
          boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.55), inset 0 0 0 1px ${color.road}20`,
        }} />

      {/* ---- yo'l: NUQTALAR IZI ----

          Qalin oq tasma o'rniga mayda nuqtalar. Uch sababdan:

            1. Tasma kartadagi eng katta shakl edi va tugunlarni
               o'ziga tortib olardi. Nuqta esa o'zi ko'rinmaydi —
               faqat YO'NALISH ko'rsatadi.
            2. Nuqtalar orasidan panel yuzasi ko'rinib turadi, ya'ni
               yo'l yuzaga chizilgan bo'lib qoladi, ustiga
               yopishtirilgan lenta bo'lib emas.
            3. Nuqta oqadi. Keyingi darsga ketayotgan bo'lak sekin
               harakatlanadi va "shu tomonga" deb ko'rsatadi —
               tasmada bunday ishorani berib bo'lmasdi.

          `stroke-dasharray="0 14"` + yumaloq uchi — aynan shu juftlik
          nuqta beradi: uzunligi nol bo'lgan chiziqcha yumaloq uch
          bilan doiraga aylanadi. */}
      <svg
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ top: PAD }}
        width={SVG_W}
        height={height}
        viewBox={`0 0 ${SVG_W} ${height}`}
        aria-hidden="true"
      >
        {base && (
          <path d={base} fill="none" stroke={`${color.road}8c`} strokeWidth={6.5}
            strokeLinecap="round" strokeDasharray="0 14" />
        )}
        {paved > 0 && (
          /* O'TILGAN QISM to'liq rangda, yarim shaffof emas. Ilgari u
             `opacity 0.5` bilan chizilardi va tugagan yo'l tugamaganidan
             deyarli farq qilmasdi — ya'ni bola qilgan mehnati
             ko'rinmasdi. */
          <path d={road(0, paved)} fill="none" stroke={TUGAGAN} strokeWidth={6}
            strokeLinecap="round" strokeDasharray="0 14" />
        )}
        {/* Keyingi qadam — oqadigan nuqtalar. Faqat BITTA bo'lakda:
            butun yo'l bo'ylab oqsa, u doimiy harakatga aylanadi va
            ko'z darsni emas, oqimni kuzatadi. */}
        {paved >= 0 && paved < n - 1 && (
          <path className="az-yol-oqim" d={road(paved, paved + 1)} fill="none"
            stroke={color.road} strokeWidth={6} strokeLinecap="round"
            strokeDasharray="0 14" />
        )}
      </svg>

      {U.lessons.map((L, li) => {
        const st = nodeState(units, progress, unitIndex, li);
        const stars = progress.done[lessonId(unitIndex, li)] ?? 0;
        const locked = st === "locked";
        const joriy = st === "current";
        // Orol ENLI: tepa yuzasi ellips, shuning uchun kengligi
        // balandligidan katta. Joriy orol eng kattasi — "shu yerdasan".
        const en = joriy ? OROL_JORIY : locked ? OROL_SM : OROL;
        const boy = Math.round(en * OROL_NISBAT);
        const off = offAt(li);
        // Yo'l orolning TEPA YUZASI markazidan o'tadi — xuddi odam
        // orolga qadam qo'yayotgandek. Shuning uchun tepa chekka o'sha
        // markazdan yuza ulushicha yuqorida turadi.
        const top = PAD + cy(li) - boy * YUZA_Y;

        // Tugunning rangi: tugagani — yashil, joriysi — bobniki (bola
        // qaysi bobda turganini shu rangdan biladi), qolgani —
        // ro'yxatdan navbat bilan.
        const rang = st === "done" ? TUGAGAN
          : st === "current" ? color.road
            : TUGUN[li % TUGUN.length];

        // karta tugunning bo'sh tomonida turadi
        const onRight = off <= 0;
        // Joriy orolda o'ng tomonda bayroq bor — karta unga tegmasin.
        const gap = en / 2 + (joriy ? 20 : 12);

        // Paydo bo'lish kechikishi — tugun, pufak va karta BIRGA
        // kelishi kerak. O'ram elementiga qo'yib bo'lmaydi: `transform`
        // li o'ram absolyut bolalar uchun yangi tayanch yasaydi va
        // ular animatsiya davomida uning burchagiga yopishib qolardi.
        const kir = { animationDelay: `${li * 70}ms` };

        return (
          <div key={li}>
            <button
              type="button"
              disabled={locked}
              onClick={() => onStart(unitIndex, li)}
              title={kursMatn(L.n).split(" · ")[0]}
              style={{ ...kir, top, left: `calc(50% + ${off}px)`, width: en, height: boy }}
              className={[
                "az-yol-kir absolute -translate-x-1/2",
                locked ? "cursor-default" : "az-orol-bos cursor-pointer",
              ].join(" ")}
            >
              <Orol rang={rang} holat={st} en={en}
                belgi={st === "done"
                  ? <Icon name="check" size={joriy ? 24 : 20} strokeWidth={3.2} />
                  : <Icon name={L.ic} size={joriy ? 24 : locked ? 18 : 20} strokeWidth={2.6} />} />
            </button>

            {/* "Boshlash" pufagi tugun OSTIDA, markazi bilan tekislangan.
                Ilgari u tugunning yozuvsiz tomonida turardi va o'ng chekkadagi
                tugun uchun o'sha tomonda joy YO'Q edi: 320px enli kartada
                pufak chetdan 17px tashqariga chiqib, yarmi kesilib qolardi.
                Chetga surib ham bo'lmaydi — u holda pufak tugunning ustiga
                minadi. Tugun ostida esa u har qanday enda sig'adi, chunki
                markazi tugun markazi bilan bir xil. */}
            {st === "current" && (
              <div
                style={{ ...kir, top: PAD + li * STEP + NODE + 10, left: `calc(50% + ${off}px)` }}
                className="az-yol-kir absolute z-10 -translate-x-1/2"
              >
                <span
                  style={{ background: `linear-gradient(180deg, ${color.road}, ${quyuq(color.road)})` }}
                  className="az-bob relative block rounded-full px-4 py-1.5 font-display
                             text-[12.5px] whitespace-nowrap text-white
                             shadow-[0_6px_14px_-4px_rgb(0_0_0/0.35)]"
                >
                  {/* Dumcha — pufak aynan SHU tugunga tegishli ekanini
                      aytadi. Usiz u ikki tugun orasida osilgan mustaqil
                      tugmaga o'xshab ketardi. */}
                  <span aria-hidden style={{ background: color.road }}
                    className="absolute -top-1 left-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-[2px]" />
                  <span className="relative">{t("boshlash")}</span>
                </span>
              </div>
            )}

            <Karta nom={kursMatn(L.n)} li={li} off={off} gap={gap} onRight={onRight}
              locked={locked} joriy={st === "current"} stars={stars} pad={PAD} kir={kir} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Bitta 3D orol.
 *
 * Uch qatlam, pastdan yuqoriga:
 *
 *   1. Suvdagi soya — orol ostida, u bilan birga suzmaydi. Aynan shu
 *      soya orolni "turgan" emas, "havoda suzib turgan" qiladi.
 *   2. Yon devor — tepa rangining to'q juftligi. Hajm shundan bilinadi.
 *   3. Tepa yuza — ellips, chap-tepada yaltiroq. Kurs kartalaridagi
 *      3D narsalarda ham yorug'lik shu tomondan tushadi.
 *
 * Tepada TANGA turadi — tugaganda belgi, joriy darsda dars belgisi.
 * Hali oldindagi orolda tanga yo'q: belgi yuzaga "chizilgan" va xira.
 * Tanga — mukofot tuyg'usi; u faqat qo'l yetgan joyda bo'lishi kerak.
 */
function Orol({ rang, holat, en, belgi }: {
  rang: string; holat: "done" | "current" | "locked";
  en: number; belgi: React.ReactNode;
}) {
  const joriy = holat === "current";
  const oldinda = holat === "locked";
  const tepa = oldinda ? tuman(rang, 60) : rang;
  const yon = oldinda ? tuman(rang, 40) : quyuq(rang);
  const tanga = Math.round(en * (joriy ? 0.44 : 0.4));

  return (
    <span className="relative block size-full">
      {/* 1 — soya. Suzuvchi qatlamdan TASHQARIDA. */}
      <svg aria-hidden viewBox="0 0 100 78" className="absolute inset-0 size-full overflow-visible">
        <ellipse className={joriy ? "az-orol-soya" : ""} cx="50" cy="72" rx="32" ry="4.5"
          fill="rgb(0 0 0 / 0.22)" />
      </svg>

      <span className={`absolute inset-0 block ${joriy ? "az-orol-suz" : ""}`}>
        <svg aria-hidden viewBox="0 0 100 78" className="absolute inset-0 size-full overflow-visible">
          {/* "Shu yerdasan" halqasi — ellips, orol shaklida. Doira halqa
              enli orol atrofida begona ko'rinardi. */}
          {joriy && (
            <ellipse className="az-orol-halqa" cx="50" cy="33" rx="46" ry="22"
              fill="none" stroke={rang} strokeWidth="3" />
          )}
          {/* 2 — yon devor */}
          <ellipse cx="50" cy="50" rx="44" ry="20" fill={yon} />
          <rect x="6" y="33" width="88" height="17" fill={yon} />
          {/* Devordagi ikkita tosh chizig'i — yon tomon SILLIQ bo'lsa,
              orol shunchaki qalin tanga bo'lib ko'rinardi. */}
          {!oldinda && (
            <path d="M18 50 q8 5 18 3 M60 55 q10 1 20 -5" stroke="rgb(0 0 0 / 0.18)"
              strokeWidth="2.2" fill="none" strokeLinecap="round" />
          )}
          {/* 3 — tepa yuza va yaltiroq */}
          <ellipse cx="50" cy="33" rx="44" ry="20" fill={tepa} />
          <ellipse cx="50" cy="33" rx="44" ry="20" fill="none"
            stroke="rgb(255 255 255 / 0.28)" strokeWidth="1.5" />
          {!oldinda && <ellipse cx="38" cy="26" rx="17" ry="5" fill="rgb(255 255 255 / 0.35)" />}
          {/* Joriy orolda bayroq — "manzil shu yerda". */}
          {joriy && (
            <g>
              <rect x="80" y="4" width="2.4" height="28" rx="1.2" fill="#fff" />
              <path d="M82.4 5 h14 l-4 5 l4 5 h-14 z" fill="#ffd166" />
            </g>
          )}
        </svg>

        {/* Tanga yoki chizilgan belgi */}
        {oldinda ? (
          <span className="absolute left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ top: `${YUZA_Y * 100}%`, color: "rgb(255 255 255 / 0.85)" }}>
            {belgi}
          </span>
        ) : (
          <span
            className="absolute left-1/2 grid -translate-x-1/2 place-items-center rounded-full bg-white"
            style={{
              width: tanga, height: tanga,
              // Tanga yuzada TURADI: pastki cheti yuza markaziga tegadi.
              top: `calc(${YUZA_Y * 100}% - ${tanga * 0.86}px)`,
              color: holat === "done" ? TUGAGAN : rang,
              boxShadow: `inset 0 -3px 0 color-mix(in srgb, ${rang} 30%, #fff), 0 3px 5px rgb(0 0 0 / 0.2)`,
            }}
          >
            {belgi}
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * Dars kartasi — sarlavha va uning ostida ikkinchi qator.
 *
 * Ilgari bu yerda faqat dars nomi turardi. Bitta qator bilan karta
 * "shunchaki yorliq" edi va bola undan HOLATNI o'qiy olmasdi: tugagan
 * dars ham, hali ochilmagani ham bir xil oq to'rtburchak bo'lib
 * turardi. Farq faqat tugunning rangida edi — ya'ni yozuvni o'qiyotgan
 * ko'z uchun hech qayerda.
 *
 * Endi ikkinchi qator holatni aytadi va u har holatda BOSHQA narsa:
 *
 *   tugagan     yulduzlar — natija so'zdan kuchliroq gapiradi
 *   joriy       "O'rganishni boshlang"
 *   ochilmagan  "Hali oldinda" — qulf emas, kutish
 *
 * Ochilmagan kartada yuza shaffofroq: u bor, lekin o'ziga chaqirmaydi.
 */
function Karta({ nom, li, off, gap, onRight, locked, joriy, stars, pad, kir }: {
  nom: string; li: number; off: number; gap: number;
  onRight: boolean; locked: boolean; joriy: boolean; stars: number; pad: number;
  /** Paydo bo'lish kechikishi — tugun bilan bir vaqtda kelishi uchun. */
  kir: CSSProperties;
}) {
  // Dars nomining ikkinchi qismi — darslik betlari ("· 12–14-bet").
  // Yo'lda u ortiqcha: bola betlarni izlamaydi, ota-ona esa ularni
  // darsning o'zida ko'radi.
  const [asosiy] = nom.split(" · ");

  return (
    <div
      style={{
        ...kir,
        top: pad + li * STEP,
        height: NODE,
        width: `min(140px, calc(50% - ${gap + 12}px))`,
        ...(onRight
          ? { left: `calc(50% + ${off + gap}px)` }
          : { left: `calc(50% + ${off - gap}px)`, transform: "translateX(-100%)" }),
      }}
      className="az-yol-kir absolute flex items-center"
    >
      <div
        className={`rounded-2xl px-3 py-2 leading-tight
                    ${onRight ? "text-left" : "ml-auto text-right"}
                    ${locked
                      ? "bg-karta/55 shadow-[0_2px_6px_-2px_rgb(0_0_0/0.08)]"
                      : "bg-karta shadow-[0_6px_16px_-6px_rgb(0_0_0/0.28)]"}`}
      >
        <div className={`font-display text-[12.5px] ${locked ? "text-ink-dim" : "text-ink"}`}>
          {asosiy}
        </div>

        {/* Yulduzlar KARTADA, tugunda emas. Tugun ostida ular o'zining
            oq yostig'i bilan turardi va qo'shni dars nomiga tegib
            ketardi; kartada esa ular o'z qatorida yotadi va tugun toza
            qoladi. */}
        {stars > 0 ? (
          /* Uchala o'rin ham ko'rinadi, olinmaganlari xira. Faqat
             olinganlar chizilsa, "ikki yulduz" bola uchun to'liq natija
             bo'lib ko'rinardi — qaytib, uchinchisini olish sababi
             ko'rinmay qolardi. */
          <div className={`mt-0.5 flex gap-px ${onRight ? "" : "justify-end"}`}>
            {Array.from({ length: Math.max(3, stars) }, (_, i) => (
              <Icon key={i} name="star" size={12}
                className={i < stars ? "text-brand-gold" : "text-ink-dim/35"} />
            ))}
          </div>
        ) : (
          <div className="mt-0.5 text-[10px] text-ink-dim">
            {joriy ? t("yolBoshlang") : t("yolOldinda")}
          </div>
        )}
      </div>
    </div>
  );
}
