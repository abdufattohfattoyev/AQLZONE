/**
 * "Sonlar xotirasi" — bo'limdagi yagona VAQTSIZ o'yin.
 *
 * NEGA VAQT YO'Q. Qolgan yettitasida soat yuradi va bu o'yinga qiziqish
 * qo'shadi. Bu yerda esa u hamma narsani buzardi: xotira shoshilganda
 * ishlamaydi, ya'ni soat o'yinni xotira sinovidan asab sinoviga
 * aylantirardi. O'lchov o'rniga POG'ONA turadi — nechta sonni eslab
 * qolding.
 *
 * Bir XATO bilan tugaydi va bu ham ataylab: uch urinish berilsa, odam
 * eslab qolmagan pog'onani taxmin bilan o'tib ketardi va natija uning
 * xotirasini emas, omadini o'lchagan bo'lardi.
 *
 * ─────────────────── HAMMA YOSH UCHUN ───────────────────
 *
 * Bu o'yin butun bo'limdagi eng ADOLATLISI: unda na hisoblash, na
 * savodxonlik kerak. Yetti yoshli bola ham, yetmish yoshli buvi ham
 * bir xil qoida bilan o'ynaydi — shuning uchun oiladagi hamma bir
 * jadvalga tushadi.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { OyinSahna } from "./Sahna";
import { Icon } from "../../lib/icons";
import { UNIT_COLORS } from "../../lib/types";
import { rnd } from "../../lib/rnd";
import { t } from "../../lib/matn";
import { tebrat } from "../../lib/qobiq";
import type { Daraja, Oyin, OyinNatija } from "../../lib/oyin/tur";

interface Sozlama {
  /** Birinchi pog'onada nechta son. */
  boshlangich: number;
  /** Sonlar bir yoki ikki xonalimi. */
  xona: 1 | 2;
  /** Bitta songa qancha ko'rish vaqti beriladi (ms). */
  korish: number;
  /** Sonlarni TESKARI tartibda qaytarish kerakmi. */
  teskari: boolean;
}

/**
 * Uch daraja uch xil yo'l bilan qiyinlashadi.
 *
 * Faqat uzunlikni o'stirish ham mumkin edi, lekin u zerikarli: uchala
 * daraja bir xil o'yin bo'lib, farqi faqat sabrda qolardi. Shuning
 * uchun ikkinchisi XONANI, uchinchisi esa VAZIFANI o'zgartiradi —
 * teskari tartib butunlay boshqa fikrlashni talab qiladi.
 */
const SOZLAMA: Record<Daraja, Sozlama> = {
  1: { boshlangich: 3, xona: 1, korish: 1000, teskari: false },
  2: { boshlangich: 4, xona: 2, korish: 700, teskari: false },
  3: { boshlangich: 5, xona: 1, korish: 450, teskari: true },
};

type Holat = "korish" | "terish" | "xato";

interface Props {
  oyin: Oyin;
  daraja: Daraja;
  onChiq: () => void;
  onTugadi: (n: OyinNatija) => void;
  rekord: number;
  yakun: ReactElement | null;
}

export function Xotira({ oyin, daraja, onChiq, onTugadi, rekord, yakun }: Props) {
  const s = SOZLAMA[daraja];

  const [uzunlik, setUzunlik] = useState(s.boshlangich);
  const [sonlar, setSonlar] = useState<number[]>([]);
  const [holat, setHolat] = useState<Holat>("korish");
  const [terilgan, setTerilgan] = useState("");
  const [tugadi, setTugadi] = useState(false);
  /** Oxirgi MUVAFFAQIYATLI pog'onadagi sonlar soni — o'yinning bali. */
  const [ball, setBall] = useState(0);

  const tugaganRef = useRef(false);
  const ballRef = useRef(0);
  ballRef.current = ball;

  /**
   * Terilgan raqamlar — HAVOLADA, holat esa faqat chizish uchun.
   *
   * Odam raqamlarni tez teradi, ba'zan React ikki bosish orasida
   * ekranni yangilashga ulgurmaydi. O'shanda `terilgan + r` ESKI
   * qiymatdan hisoblanib, ikkinchi raqam birinchisini o'chirib
   * yuborardi: "655" o'rniga "65" yozilib, to'g'ri javob "xato" bo'lib
   * chiqardi. Havola esa darhol yangilanadi va hech bir bosish
   * yo'qolmaydi.
   */
  const terilganRef = useRef("");

  /** Kutilayotgan raqamlar satri — teskari darajada tartib ag'dariladi. */
  const kutilgan = (s.teskari ? [...sonlar].reverse() : sonlar).join("");

  /* Yangi pog'ona: sonlar yasaladi va ko'rsatiladi. */
  useEffect(() => {
    if (tugaganRef.current) return;
    const yangi = Array.from({ length: uzunlik }, () =>
      s.xona === 1 ? rnd(1, 9) : rnd(10, 99));
    setSonlar(yangi);
    terilganRef.current = "";
    setTerilgan("");
    setHolat("korish");

    const id = setTimeout(() => setHolat("terish"), uzunlik * s.korish);
    return () => clearTimeout(id);
  }, [uzunlik, s.xona, s.korish]);

  const tugat = useCallback(() => {
    if (tugaganRef.current) return;
    tugaganRef.current = true;
    setTugadi(true);
    tebrat("yutuq");
    // `savollar` — kunlik maqsadga qo'shiladigan son. Bu o'yinda "savol"
    // tushunchasi yo'q, shuning uchun o'tilgan POG'ONALAR soni beriladi:
    // to'rt pog'ona o'tgan odam to'rt savol yechgancha ish qilgan.
    const pogona = Math.max(0, ballRef.current - s.boshlangich + 1);
    onTugadi({ ball: ballRef.current, savollar: pogona });
  }, [onTugadi, s.boshlangich]);

  const raqamBos = (r: string) => {
    if (holat !== "terish") return;
    const yangi = terilganRef.current + r;
    terilganRef.current = yangi;
    setTerilgan(yangi);
    tebrat("tanlov");

    if (yangi.length < kutilgan.length) return;

    if (yangi === kutilgan) {
      tebrat("togri");
      setBall(uzunlik);
      // Keyingi pog'ona `uzunlik` o'zgarishi bilan o'zi yasaladi.
      setUzunlik((n) => n + 1);
    } else {
      tebrat("xato");
      setHolat("xato");
      // To'g'ri javob bir lahza ko'rsatiladi: o'yin tugagan bo'lsa ham,
      // odam nimani yodda tutolmaganini ko'rishi kerak.
      setTimeout(tugat, 1400);
    }
  };

  const ochir = () => {
    if (holat !== "terish") return;
    terilganRef.current = terilganRef.current.slice(0, -1);
    setTerilgan(terilganRef.current);
  };

  if (tugadi) return yakun;

  const rang = UNIT_COLORS[oyin.rang];

  return (
    <OyinSahna
      oyin={oyin} daraja={daraja} onChiq={onChiq}
      ball={ball} ballNomi={t("oyinBall")}
      rekordOshdi={rekord > 0 && ball > rekord}
    >
      {/* ---- pog'ona ---- */}
      <div className="mt-4 text-center">
        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5
                          font-display text-[13px] text-white ${rang.bg} shadow-clay-sm`}>
          {t("xotiraPogona", { n: uzunlik })}
        </span>
        <p className={`mt-2 text-[12.5px] ${s.teskari && holat === "terish"
          ? "font-display text-brand-red" : "text-ink-soft"}`}>
          {holat === "korish"
            ? t("xotiraEsla")
            : s.teskari ? t("xotiraTeskari") : t("xotiraQaytar")}
        </p>
      </div>

      {/* ---- sahna ----
          Balandligi QAT'IY: ko'rish va terish bosqichida ichidagi narsa
          boshqa o'lchamda va maydon qisqarsa, pastdagi klaviatura har
          pog'onada joyidan siljib turardi. */}
      <div className="my-4 grid min-h-[150px] flex-1 place-items-center rounded-clay bg-sahna/85
                      p-4 ring-1 ring-track ring-inset backdrop-blur-sm">
        {holat === "korish" && (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {sonlar.map((n, i) => (
              <span key={i}
                className="az-xabar grid size-[58px] place-items-center rounded-[18px] bg-karta
                           font-display text-[26px] text-ink shadow-clay-sm">
                {n}
              </span>
            ))}
          </div>
        )}

        {holat === "terish" && (
          <div className="text-center">
            {/* Terilgan raqamlar va qolgan o'rinlar. Nuqtalar SHART:
                ularsiz odam yana nechta raqam kutilayotganini bilmaydi
                va oxirgi raqamni terganda o'yin kutilmaganda tugab
                qolgandek tuyulardi. */}
            <div className="font-display text-[34px] leading-none tracking-[0.12em] text-ink">
              {terilgan || "·"}
            </div>
            <div className="mt-3 flex justify-center gap-1.5">
              {Array.from({ length: kutilgan.length }, (_, i) => (
                <span key={i}
                  className={`size-2 rounded-full transition-colors
                              ${i < terilgan.length ? rang.bg : "bg-track"}`} />
              ))}
            </div>
          </div>
        )}

        {holat === "xato" && (
          <div className="text-center">
            <div className="text-[13px] text-ink-soft">{t("oyinTogri")}</div>
            <div className="mt-1.5 font-display text-[30px] leading-none tracking-[0.12em]
                            text-brand-green-d">
              {kutilgan}
            </div>
            <div className="mt-2 font-display text-[19px] leading-none tracking-[0.12em]
                            text-brand-red line-through">
              {terilgan}
            </div>
          </div>
        )}
      </div>

      {/* ---- raqam terish ----
          O'ZIMIZNING klaviatura, telefonniki emas. Tizim klaviaturasi
          ekranning yarmini yopadi va ochilib-yopilib turib sahnani
          siljitadi — xotira o'yinida esa sahna joyida qotib turishi
          kerak. */}
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((r) => (
          <Tugma key={r} on={() => raqamBos(r)} yoniq={holat === "terish"}>{r}</Tugma>
        ))}
        <span />
        <Tugma on={() => raqamBos("0")} yoniq={holat === "terish"}>0</Tugma>
        <Tugma on={ochir} yoniq={holat === "terish" && terilgan.length > 0}>
          <Icon name="chevron" size={20} className="rotate-180" />
        </Tugma>
      </div>
    </OyinSahna>
  );
}

function Tugma({ children, on, yoniq }: {
  children: ReactNode;
  on: () => void;
  yoniq: boolean;
}) {
  return (
    <button type="button" onClick={on} disabled={!yoniq}
      className={`clay-press grid min-h-[52px] place-items-center rounded-clay bg-karta
                  font-display text-[22px] text-ink shadow-clay-sm transition-opacity
                  ${yoniq ? "" : "opacity-35"}`}>
      {children}
    </button>
  );
}
