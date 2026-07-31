/**
 * O'yin ekrani — natijani saqlaydigan yagona joy.
 *
 * O'yinlarning o'zi (`components/oyin/*`) hech narsa saqlamaydi: ular
 * faqat o'ynatadi va oxirida ballni beradi. Saqlash shu yerda,
 * BIR JOYDA turadi — aks holda sakkizta komponentning har biri
 * rekordni, tangani va kunlik zanjirni o'zicha yozib, ulardan bittasi
 * albatta biror qadamni unutgan bo'lardi.
 *
 * Uch narsa yoziladi va uchtasi uch xil joyga ketadi:
 *
 *   rekord   qurilmaga, `o'yin + daraja` bo'yicha  (`lib/oyin/rekord.ts`)
 *   tanga    progressga — do'konda ishlatiladi     (`lib/progress.tsx`)
 *   zanjir   kunlik maqsadga                        (o'sha yerda)
 *
 * YULDUZ berilmaydi: u darsning o'lchovi va reyting aynan shuni
 * sanaydi. O'yindan yulduz berilsa, bir kechada jadval boshiga chiqqan
 * bola darslarni oylab o'tgan bolaning mehnatini ma'nosiz qilardi.
 */
import { useState } from "react";
import { Oqim } from "../components/oyin/Oqim";
import { Xotira } from "../components/oyin/Xotira";
import { YigirmaTort } from "../components/oyin/YigirmaTort";
import { Yakun } from "../components/oyin/Sahna";
import { bugunOynalgan, natijaniYoz, rekord, tangaHisobi } from "../lib/oyin/rekord";
import { useProgress } from "../lib/progress";
import type { Daraja, Oyin as OyinTur, OyinNatija } from "../lib/oyin/tur";

interface Natija {
  ball: number;
  rekord: number;
  yangiRekord: boolean;
  tanga: number;
  bonus: boolean;
}

export function Oyin({ oyin, daraja, onChiq, onDaraja }: {
  oyin: OyinTur;
  daraja: Daraja;
  /** O'yinlar ro'yxatiga qaytish. */
  onChiq: () => void;
  /** Daraja tanlash ekraniga qaytish. */
  onDaraja: () => void;
}) {
  const { oyinTugadi } = useProgress();
  const [natija, setNatija] = useState<Natija | null>(null);
  /**
   * "Yana o'ynash" bosilganda shu son o'sadi va `key` orqali o'yin
   * komponenti QAYTA yasaladi. Holatni qo'lda tozalash ham mumkin edi,
   * lekin unda har o'yinga alohida "tozalash" funksiyasi kerak bo'lardi
   * va ulardan biri albatta bir maydonni unutgan bo'lardi — masalan
   * eski taymer o'chmay, yangi o'yinni birinchi soniyadayoq tugatardi.
   */
  const [urinish, setUrinish] = useState(0);

  const tugadi = (n: OyinNatija) => {
    // Bonus rekord YOZILISHIDAN OLDIN o'qiladi: yozuv bugungi sanani
    // qo'yadi va undan keyin "bugun birinchi marta o'ynayapmi?" degan
    // savolga doim "yo'q" javobi kelardi.
    const bonus = !bugunOynalgan(oyin.id);
    const yangiRekord = natijaniYoz(oyin.id, daraja, n.ball);
    const tanga = tangaHisobi(n.ball, bonus);
    oyinTugadi(tanga, n.savollar);
    setNatija({ ball: n.ball, rekord: rekord(oyin.id, daraja), yangiRekord, tanga, bonus });
  };

  const yakun = natija && (
    <Yakun
      oyin={oyin} daraja={daraja}
      ball={natija.ball} rekord={natija.rekord}
      yangiRekord={natija.yangiRekord} tanga={natija.tanga} bonus={natija.bonus}
      onQayta={() => { setNatija(null); setUrinish((n) => n + 1); }}
      onDaraja={onDaraja}
      onOyinlar={onChiq}
    />
  );

  const umumiy = { oyin, daraja, onChiq, onTugadi: tugadi, yakun: yakun ?? null };
  const kalit = `${oyin.id}-${daraja}-${urinish}`;

  if (oyin.tur === "yigirma") return <YigirmaTort key={kalit} {...umumiy} />;
  if (oyin.tur === "xotira") return <Xotira key={kalit} {...umumiy} />;
  return <Oqim key={kalit} {...umumiy} />;
}
