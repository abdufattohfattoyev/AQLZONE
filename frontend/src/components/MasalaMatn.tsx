/**
 * Masala shartining matni — sonlari ajratilgan holda.
 *
 * ─────────────── NEGA SONLAR AJRATILADI ───────────────
 *
 * Masalani yechish sonlarni TOPISHDAN boshlanadi. Uzluksiz matnda
 * ular yo'qoladi va bola shartni ikki-uch marta qayta o'qib, har
 * safar "100 km edimi yoki 50 mi?" deb qaytadi. Telefon ekranida
 * bu yo'qotish ayniqsa katta: matn tor va uzun bo'lib ko'rinadi.
 *
 * Ajratish o'qishni almashtirmaydi — shart baribir to'liq o'qiladi.
 * U faqat KEYIN qaytib kelishni osonlashtiradi: ko'z sonlarga
 * tushadi va matnni qidirmasdan kerakli joyni topadi.
 *
 * ─────────────── CHEGARA BOR VA U ZARUR ───────────────
 *
 * Sonlari juda ko'p matnda (masalan ketma-ketlik yoki jadval)
 * ajratish teskari ishlaydi: hamma narsa ajratilgan bo'lsa, hech
 * narsa ajratilmagan bo'ladi va matn rang-barang shovqinga
 * aylanadi. Shuning uchun `ENG_KOP` dan oshsa — matn o'z holicha
 * qoladi.
 *
 * ─────────────── OXIRGI SAVOL ALOHIDA ───────────────
 *
 * Shartning oxirgi xatboshisi ko'pincha SAVOLNING o'zi bo'ladi
 * ("Pashsha necha km uchadi?"). U qolgan matndan ajratib beriladi:
 * odam shartni o'qib bo'lib, "xo'sh, nima so'ralyapti?" deb yana
 * tepaga qaytmasligi kerak.
 */
/** Shuncha sondan ko'pi bo'lsa ajratish o'chadi. */
const ENG_KOP = 14;

/**
 * Son va uning o'lchov birligi.
 *
 * Birlik ATAYLAB son bilan BIRGA olinadi: "100" va "km" ikki
 * bo'lakka ajralsa, ular orasidan qator uzilishi o'tib ketardi va
 * "100" bir satrda, "km" keyingisida qolardi.
 *
 * ─────────────── BIRLIK SO'ZNING OXIRI BO'LISHI SHART ───────────
 *
 * Oxiridagi `(?![\w'ʼ’])` bir marta yo'qolgan va natijasi darrov
 * ko'ringan: "5 litrli" degan matn "5 l" + "itrli" bo'lib
 * kesilardi, chunki `l` ham birlik ro'yxatida bor. Endi birlikdan
 * keyin harf kelsa, moslik BEKOR bo'ladi va regexp sonning o'ziga
 * qaytadi — "litrli" esa oddiy matn bo'lib qolaveradi.
 *
 * Ro'yxat UZUNIDAN QISQASIGA: `km` `km/soat` dan oldin tursa,
 * "75 km/soat" dagi birlik "km" bo'lib kesilardi.
 */
const BIRLIK = "km/soat|daqiqa|gradus|marta|litr|soat|yosh|sm²|m²|foiz|km|sm|kg|ta|%|l|m|g";

/**
 * Vaqt ("3:20") ro'yxatning BOSHIDA turadi.
 *
 * Aks holda u ikkita alohida son bo'lib kesilardi — "[3]:[20]" —
 * va soat masalasining butun sharti shu ikki son orasidagi
 * bog'liqlikka qurilgan bo'ladi.
 */
const SON = new RegExp(
  String.raw`\d{1,2}:\d{2}|\d+(?:[.,]\d+)?(?:\s?(?:${BIRLIK}))?(?![\w'ʼ’])`, "gi",
);

/** Harf yoki raqam — sonning oldida shu tursa, u ajratilmaydi. */
const SOZ = /[\w'ʼ’]/;

/** Xatboshi savolmi — oxirgisini ajratish uchun. */
const savolmi = (s: string) => /[?？]\s*$/.test(s.trim());

export function MasalaMatn({ matn }: { matn: string }) {
  const xatboshilar = matn.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const oxirgi = xatboshilar.length > 1 ? xatboshilar[xatboshilar.length - 1] : "";
  const savol = savolmi(oxirgi) ? oxirgi : "";
  const asosiy = savol ? xatboshilar.slice(0, -1) : xatboshilar;

  const kop = (matn.match(SON) || []).length > ENG_KOP;

  return (
    <div className="space-y-2.5">
      {asosiy.map((p, i) => (
        <p key={i} className="text-[14.5px] leading-relaxed whitespace-pre-wrap">
          {kop ? p : <Sonli matn={p} />}
        </p>
      ))}

      {savol && (
        /* Savol shartning DAVOMI, alohida karta emas: ramka ichiga
           olinsa u boshqa bo'lim bo'lib ko'rinardi. Shuning uchun
           faqat belgi va og'irlik bilan ajratiladi. */
        <p className="flex items-start gap-2 pt-0.5 font-display text-[15px] leading-snug">
          {/* Belgi ikonka emas, HARF: ikonkalar to'plamida savol
              belgisi yo'q va uni faqat shu joy uchun qo'shish —
              to'plamni bitta ekran uchun kengaytirish bo'lardi. */}
          <span aria-hidden className="mt-px grid size-[19px] shrink-0 place-items-center
                                       rounded-lg bg-brand-purple/15 text-[12px]
                                       leading-none text-brand-purple">
            ?
          </span>
          <span className="min-w-0 flex-1">{kop ? savol : <Sonli matn={savol} />}</span>
        </p>
      )}
    </div>
  );
}

/**
 * Matn ichidagi sonlarni yorliqchaga o'raydi.
 *
 * `split` o'rniga `matchAll` ATAYLAB: sonning OLDIDA harf turgan
 * holatni ("2x2", "8x8") faqat shu yo'l bilan tashlab yuborish
 * mumkin. Buni regexp ichida `(?<=...)` bilan ham qilsa bo'lardi,
 * lekin orqaga qarash eski iOS WebView'da umuman ochilmaydi va
 * SyntaxError butun ilovani yiqitardi — eski telefon esa bizning
 * auditoriyamizda kam emas.
 */
function Sonli({ matn }: { matn: string }) {
  const bolaklar: React.ReactNode[] = [];
  let oxiri = 0;

  for (const m of matn.matchAll(SON)) {
    const boshi = m.index ?? 0;
    if (boshi > 0 && SOZ.test(matn[boshi - 1])) continue;
    if (boshi > oxiri) bolaklar.push(matn.slice(oxiri, boshi));
    bolaklar.push(
      <b key={boshi} className="rounded-md bg-brand-purple/12 px-1 py-px font-display
                                text-[0.96em] text-brand-purple">
        {m[0]}
      </b>,
    );
    oxiri = boshi + m[0].length;
  }
  if (oxiri < matn.length) bolaklar.push(matn.slice(oxiri));

  return <>{bolaklar}</>;
}
