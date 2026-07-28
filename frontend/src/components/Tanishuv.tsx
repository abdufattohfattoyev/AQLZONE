/**
 * Kirish darvozasi — va u ataylab DEVOR EMAS.
 *
 * Ilgari kirmagan odam ilovaning o'zini umuman ko'rmasdi: birinchi ekran
 * "Telegram bilan kirish" edi. Bu reklamani o'ldiradi — havolani bosgan
 * odam hali ishonmagan mahsulotga hisob ochmaydi, orqaga qaytadi.
 *
 * Endi kirmagan odam ilovaga TO'G'RIDAN-TO'G'RI tushadi va o'ynayveradi.
 * Kirish taklifi birinchi dars tugagach chiqadi — bola yulduzini ko'rgan,
 * ya'ni nimadir yutgan paytda (`lib/sinov.ts`). Taklifda "Keyinroq" bor,
 * ya'ni undan chiqib ketish mumkin.
 *
 * Progress yo'qolmaydi: sinov paytidagi natija anonim hisobda serverda
 * turadi va Telegram bilan kirganda o'sha hisobga qo'shiladi
 * (`auth/kod` → `_hisoblarni_birlashtir`).
 *
 * Bitta holat hamon TO'SADI va u to'g'ri: odam botdan kelib, Telegram'i
 * bog'langan-u, ismini yozmagan bo'lsa (`ism`). U allaqachon kirish
 * jarayonining o'rtasida — uni yarim yo'lda qoldirish chalkashtiradi.
 *
 * `/kirish/<kod>` darvozadan o'tkaziladi: bu botdagi havola, ya'ni odam
 * AYNAN kirish jarayonida. Uni kirish ekraniga tiqsak, cheksiz halqa
 * yuzaga kelardi.
 */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sozlamalar } from "../screens/Sozlamalar";
import { Kirish } from "./Kirish";
import { getHisob, miniAppda } from "../lib/api";
import { royxatniBelgila, taklifgaObuna } from "../lib/sinov";
import type { Hisob } from "../lib/api";
import type { ReactNode } from "react";

/** Tekshiruv holati: hali bilmaymiz → sinov / ism so'raymiz / so'ramaymiz. */
type Holat = "kutilyapti" | "sinov" | "ism" | "kerak-emas";

/**
 * Oxirgi safar kirgan bo'lganmi.
 *
 * Server javobini kutish bir necha yuz millisekund. Shu paytda nima
 * ko'rsatish kerakligi ikki xil bo'ladi va TAXMIN QILIB bo'lmaydi:
 * kirgan odamga ilovani, kirmaganga kirish ekranini. Noto'g'ri
 * taxmin ko'zga tashlanadi — ilova ochilib, keyin tortib olinadi.
 *
 * Shuning uchun javob mahalliy eslab qolinadi. U faqat ISHORA: server
 * baribir qayta tekshiradi va boshqacha desa, holat yangilanadi.
 */
const KIRGAN_KEY = "az_kirgan";

export function Tanishuv({ children }: { children: ReactNode }) {
  const [holat, setHolat] = useState<Holat>("kutilyapti");
  /** Sinov taklifi ko'rsatilyaptimi va bola nechta yulduz olgan edi. */
  const [taklif, setTaklif] = useState<number | null>(null);
  // Ism so'raladigan bo'lsa, o'sha ekranga TAYYOR holda beriladi. Aks
  // holda u xuddi shu `/me` javobini ikkinchi marta so'rar va odam
  // kirish tugmasini bosgach yana kutib turardi.
  const [hisob, setHisob] = useState<Hisob | null>(null);
  const { pathname } = useLocation();
  const kirishSahifasi = pathname.startsWith("/kirish/");

  useEffect(() => {
    if (holat !== "kutilyapti" || kirishSahifasi) return;
    let bekor = false;

    // Kirish `ProgressProvider` da bo'ladi va u biroz vaqt oladi.
    // Shuning uchun bir necha marta urinib ko'ramiz, keyin voz kechamiz.
    let urinish = 0;
    const tekshir = async () => {
      const h = await getHisob();
      if (bekor) return;

      if (h) {
        setHisob(h);
        try {
          if (h.royxatdan) localStorage.setItem(KIRGAN_KEY, "1");
          else localStorage.removeItem(KIRGAN_KEY);
        } catch { /* xotira to'lgan — faqat bayroq eslanmaydi */ }

        royxatniBelgila(h.royxatdan);
        if (h.royxatdan) return setHolat("kerak-emas");
        // Telegram bog'langan, lekin ism-familiya to'liq emas — odam
        // ikki bosqich orasida qolib ketgan.
        return setHolat(h.telegram ? "ism" : "sinov");
      }
      if (++urinish >= 3) {
        // Server javob bermadi. Ilovani to'smaymiz va taklif ham
        // chiqarmaymiz: internetsiz odamni Telegram'ga yuborishdan
        // ma'no yo'q, u baribir ochilmaydi.
        setHolat("kerak-emas");
        return;
      }
      setTimeout(tekshir, 900);
    };
    tekshir();

    return () => { bekor = true; };
  }, [holat, kirishSahifasi]);

  // Dars tugaganda `lib/sinov.ts` shu yerga xabar beradi.
  useEffect(() => taklifgaObuna(setTaklif), []);

  if (kirishSahifasi) return <>{children}</>;

  if (holat === "ism") {
    return <Sozlamalar royxat boshlangich={hisob} onBack={() => setHolat("sinov")}
      onTayyor={() => setHolat("kerak-emas")} />;
  }

  // Mini App ichida taklif KO'RSATILMAYDI: u yerda kirish `initData`
  // orqali o'zi bo'ladi va odamni Telegram ichidan yana Telegram'ga
  // yuborish halqasi yuzaga kelardi.
  if (taklif !== null && !miniAppda()) {
    return (
      <Kirish
        izoh={taklif === 3 ? "Zo'r! Uchala yulduzni oldingiz" : `${taklif} yulduz qo'lga kiritildi`}
        xabar={"Yulduzlaringiz hozir faqat shu brauzerda turibdi. Telegram bilan "
          + "kirsangiz — ular saqlanadi, boshqa telefonda ham ochiladi va "
          + "haftalik ligada qatnasha boshlaysiz."}
        tugma="Telegram bilan saqlash"
        onKeyinroq={() => setTaklif(null)}
      />
    );
  }

  // Qolgan hamma holatda ilova ochiq: kutilyapti bo'lsa ham, sinov
  // bo'lsa ham. Kutish ekrani ataylab olib tashlandi — reklamadan kelgan
  // odam birinchi ko'rgan narsasi aylanuvchi belgi bo'lmasligi kerak.
  return <>{children}</>;
}
