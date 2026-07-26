/**
 * `/kirish/<kod>` — botdagi «✅ Saytga kirish» havolasi shu yerga tushadi.
 *
 * Uch bosqich, va foydalanuvchi faqat ikkinchisini ko'radi:
 *
 *   1. kod tokenga almashtiriladi (`auth/kod`) — anonim progress ham shu
 *      yerda Telegram hisobiga qo'shiladi;
 *   2. ism-familiya so'raladi — FAQAT hisob hali ro'yxatdan o'tmagan
 *      bo'lsa. Telegram bergan ism allaqachon yozilgan bo'ladi, shuning
 *      uchun odatda faqat familiya kiritiladi;
 *   3. ilova ochiladi.
 *
 * NEGA OXIRIDA TO'LIQ QAYTA YUKLASH. Kirishdan oldin ilova anonim
 * hisobning progressini xotirasida ushlab turadi va uni vaqti-vaqti bilan
 * serverga yozadi. Server esa endi BIRLASHTIRILGAN (kattaroq) qiymatni
 * saqlaydi. Oddiy `navigate()` bilan o'tsak, xotiradagi eski qiymat
 * yangisining ustiga yozilib, bola yulduzlarini yo'qotardi. Qayta yuklash
 * shu tuzoqni butunlay yopadi — bir marta bo'ladigan ish uchun arzon narx.
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Kirish } from "../components/Kirish";
import { Logo } from "../components/Logo";
import { Sozlamalar } from "./Sozlamalar";
import { getHisob, kodBilanKir } from "../lib/api";

type Holat = "kutilyapti" | "ism" | "tayyor" | "xato";

/**
 * Kirish + hisobni o'qish. Natija — keyingi bosqich.
 *
 * Ism-familiya FAQAT ro'yxatdan o'tmagan hisobdan so'raladi. Botdagi
 * havola kirishning odatiy yo'li: odam har kuni shu tugmani bosishi
 * mumkin. Har safar o'sha oynani ko'rsatsak, u to'ldirilgan maydonlarni
 * tasdiqlash uchun bosiladigan keraksiz bosqichga aylanardi.
 */
async function kirVaTekshir(kod: string): Promise<Holat> {
  if (!(await kodBilanKir(kod))) return "xato";
  const h = await getHisob();
  // Hisob o'qilmasa (aloqa uzildi) — so'raymiz. Ortiqcha savol ilovaga
  // noto'g'ri nom bilan kirib qolishdan yaxshiroq.
  return h?.royxatdan ? "tayyor" : "ism";
}

/**
 * Boshlangan so'rov — kod bo'yicha.
 *
 * Effekt ikki marta ishga tushishi MUMKIN va bu normal: React ishlab
 * chiqish rejimida (StrictMode) komponentni ataylab ikki marta ulaydi.
 * Kod esa bir martalik — ikkinchi so'rov "havola ishlamadi" javobini
 * olardi va ekran birinchisining muvaffaqiyatini o'chirib tashlardi.
 * Va'dani eslab qolamiz, shunda ikkala chaqiruv AYNAN bir natijani ko'radi.
 *
 * Komponentdan tashqarida turadi — ref bilan bo'lmaydi, chunki StrictMode
 * ikkinchi ulanishda yangi ref beradi.
 */
const boshlangan = new Map<string, Promise<Holat>>();

/** Ilovani boshidan ochadi — marshrut turiga qarab (veb yoki APK). */
function ilovaniQaytaOch(): void {
  if (import.meta.env.VITE_ROUTER === "hash") {
    window.location.hash = "#/";
    window.location.reload();
  } else {
    window.location.replace("/");
  }
}

export function KodKirish() {
  const { kod } = useParams();
  const [holat, setHolat] = useState<Holat>("kutilyapti");

  useEffect(() => {
    const k = kod ?? "";
    let vada = boshlangan.get(k);
    if (!vada) {
      vada = kirVaTekshir(k);
      boshlangan.set(k, vada);
    }

    let bekor = false;
    vada.then((keyingi) => {
      if (bekor) return;
      // Ro'yxat allaqachon to'liq — hech narsa so'ramaymiz, ilovani ochamiz.
      if (keyingi === "tayyor") return ilovaniQaytaOch();
      setHolat(keyingi);
    });
    return () => { bekor = true; };
  }, [kod]);

  if (holat === "ism") {
    return (
      <Sozlamalar
        royxat
        onBack={ilovaniQaytaOch}
        onTayyor={ilovaniQaytaOch}
      />
    );
  }

  // Havola eskirgan yoki allaqachon ishlatilgan. Bu TUPIK BO'LMASLIGI
  // kerak: odam shu yerdayoq yangi havola olishi mumkin bo'lsin. Shuning
  // uchun oddiy xato matni emas, kirish ekranining o'zi ko'rsatiladi —
  // Telegram tugmasi bilan birga.
  if (holat === "xato") {
    return (
      <Kirish xabar="Havolaning muddati tugagan — u bir soat amal qiladi. Yangisini olish uchun tugmani bosing." />
    );
  }

  return (
    <div className="mx-auto grid min-h-dvh w-full max-w-[430px] place-items-center px-4 py-8">
      <div className="az-kirish w-full rounded-clay bg-karta p-6 text-center shadow-clay">
        <Logo size={64} className="mx-auto" />
        <h1 className="mt-3 text-[20px]">Kirilyapti…</h1>
        <p className="mt-1 text-[13px] text-ink-dim">Bir soniya</p>
      </div>
    </div>
  );
}
