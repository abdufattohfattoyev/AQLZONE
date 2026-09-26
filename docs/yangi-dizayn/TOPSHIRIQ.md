# Yangi dizaynni ilovaga o'tkazish — topshiriq

> Bu hujjat Claude Code (yoki dasturchi) uchun. Unda nima qilish, qaysi
> faylga tegish, ma'lumot qayerdan olinishi va qachon "tayyor" deyish
> kerakligi yozilgan. Ekran rasmlari — `ekranlar/`, dizayn manbasi —
> `manba/` (HTML, har ekran alohida fayl).

---

## 0. Ishni boshlashdan oldin o'qing

1. **`.claude/skills/aqlzone-dizayn/SKILL.md`** — dizayn qoidalari. Bu
   topshiriqdagi hamma narsa ularga bo'ysunadi: qat'iy 3 rang (ko'k
   `brand-blue`, yashil `brand-green`, oltin `brand-gold`), qizil faqat
   xato javobda, tekis fon, har ekranda bitta asosiy tugma, qo'lda hex
   yo'q, hamma matn `t("kalit")` orqali ikki tilda (`lib/matn.ts`),
   muhim tugmada `data-tahlil`.
2. **`ekranlar/01-Main.png`** — umumiy xarita: 5 bo'lim va nima qayerga
   ko'chgani.
3. **`manba/*.dc.html`** — har ekranning aniq o'lchamlari, oraliqlari,
   ranglari. Bu React emas, oddiy HTML + inline style: undan
   **qiymatlarni** oling (padding, radius, shrift o'lchami), kodni
   ko'chirmang. Ranglar u yerda hex bilan yozilgan — ilovada ularning
   o'rniga **tokenlar** ishlatiladi (jadval pastda, 7-bo'lim).

**Asosiy qoida:** mavjud ekranlar va mantiq QAYTA YOZILMAYDI, balki
qayta joylashtiriladi va ko'rinishi yangilanadi. Darslar, testlar,
sertifikat, o'yinlar, duel — hammasi ishlaydi; biz ularning **yo'lini**
(navigatsiyani) va **ko'rinishini** o'zgartiramiz.

---

## 1. Nega bu ish qilinyapti

Hozir odam narsani topa olmaydi:

- **"Menyu"** tugmasida 25+ narsa aralash (`components/Menyu.tsx`).
- Muhim bo'limlar **kurs ichida yashiringan**: Xatolar daftari, Do'kon,
  Nishonlar, Ota-ona paneli, Formulalar — hammasi `/kurs/:slug/...`.
- Testlar, imtihon, duel **bir necha joyda** takrorlanadi.

Yangi tuzilmada pastki panelda doim **5 bo'lim** va har narsa **bitta
joyda**:

| Tab | Marshrut | Ichida |
|---|---|---|
| **Bugun** | `/` | davom etish, bugungi 3 vazifa, zanjir, tanaffus |
| **O'qish** | `/darslar` | sinf tanlagich + 4 yorliq: Darslar · Testlar · Formulalar · Xatolar |
| **O'yin** | `/oyinlar` | Tez o'yin (duel), bugungi maydon, kunlik son, yakka o'yinlar, xona |
| **Masalalar** | `/masalalar` | lenta, masala yozish, menikilar |
| **Men** | `/men` | profil, yulduz/tanga/zanjir, reyting, nishonlar, do'kon, ota-ona, sozlamalar |

"Menyu" tabi **olib tashlanadi**. Undagi har band quyidagi jadval
bo'yicha tarqatiladi:

| Band | Hozir | Yangi joy |
|---|---|---|
| Xatolar daftari | `/kurs/:slug/daftar` | O'qish › **Xatolar** yorlig'i |
| Formulalar | `/kurs/:slug/formulalar`, Menyu | O'qish › **Formulalar** yorlig'i |
| Testlar, DTM, Milliy sertifikat | `/testlar`, `/imtihon`, `/sertifikat`, Bosh, Menyu | O'qish › **Testlar** yorlig'i |
| Sessiya (talaba) | `/sessiya` | O'qish › Testlar (faqat `yol === "oliy"`) |
| Bugungi sinov | `/kurs/:slug/sinov`, Bosh | **Bugun** › vazifalar |
| Kunlik son | `/oyinlar/kunlik-son`, Bosh | **Bugun** › vazifalar va O'yin |
| Duel | `/oyinlar/duel`, Menyu | **O'yin** › Tez o'yin |
| Reyting | `/reyting`, Bosh, Menyu | **Men** › Yutuqlar |
| Nishonlar, Do'kon | `/kurs/:slug/nishonlar`, `/kurs/:slug/dokon` | **Men** › Yutuqlar |
| Ota-ona paneli, Hisobot | `/kurs/:slug/ota-ona`, `/kurs/:slug/hisobot` | **Men** › Ota-ona uchun |
| Profillar | `/profillar` | **Men** › Ota-ona uchun |
| Til, Yorug'lik, Sozlamalar | Menyu, `/sozlamalar` | **Men** › Sozlamalar |
| Qidiruv | Bosh | Har tab sarlavhasida lupa → `/qidiruv` |
| Kichkintoylar | Darslar, Menyu | Alohida **Kichkintoy rejimi** (9-bosqich) |

**Hech bir eski marshrut o'chirilmaydi.** Bot xabarlari, kanal postlari
va eski havolalar `/kurs/...`, `/imtihon/...` kabi manzillarga olib
boradi — ular ishlashda davom etadi. O'zgaradigani faqat: qaysi tab
yonadi va ekranga qanday yetib boriladi.

---

## 2. Bosqichlar

Har bosqich — **alohida commit**, har biridan keyin 8-bo'limdagi
tekshiruv. Tartib muhim: 1-bosqichsiz qolganlari ma'nosiz.

### 1-bosqich. Pastki panel: 5 tab va "Men" markazi
**Ekranlar:** `02-Bugun.png` ning pastki qismi, `06-Men.png`.

- `components/Panel.tsx`: tablar **Bugun · O'qish · O'yin · Masalalar ·
  Men**. Belgilar: `uy`, `xarita`, `oyin`, `vazifa`, `menyu` (mavjud
  `/belgi/*.webp`). "Menyu" tugmasi va `Menyu.tsx` ni ochish olib
  tashlanadi.
- Faol tab qoidasi: `/kurs/*`, `/testlar`, `/imtihon*`, `/sertifikat*`,
  `/sessiya*`, `/toplam/*` → **O'qish**; `/oyinlar*`, `/duel/*`,
  `/xona/*` → **O'yin**; `/masalalar*` → **Masalalar**; `/men`,
  `/reyting`, `/profillar`, `/sozlamalar`, `/kurs/:slug/(nishonlar|dokon|ota-ona|hisobot)`
  → **Men**.
- **`/men` hozir anketani qayta ochadi** (`App.tsx` → `MenSahifasi`).
  Anketa `/men/anketa` ga ko'chadi (u faqat `App.tsx:245` dan
  chaqiriladi), `/men` esa yangi `screens/Men.tsx` bo'ladi.
- `screens/Men.tsx` (`06-Men.png`): profil kartasi (ism, sinf,
  "Almashtirish" → `/profillar`), 3 ta son (yulduz, tanga — oltin; zanjir),
  keyin 3 guruh ro'yxat: **Yutuqlar** (Reyting, Nishonlar, Do'kon),
  **Ota-ona uchun** (Ota-ona paneli, Bolalar profillari), **Sozlamalar**
  (Til, Yorug'lik, Telegram bog'lash). Kursga bog'liq sahifalar
  (nishonlar, do'kon, ota-ona) uchun `oxirgiKurs()` (`lib/oxirgi.ts`)
  yoki profil sinfining kursi olinadi.
- **Tayyor:** 5 tab hamma sahifada to'g'ri yonadi; Menyu'dagi har band
  yangi joyidan 2 bosishda topiladi.

### 2-bosqich. Bugun (`/`)
**Ekran:** `02-Bugun.png`. Fayl: `screens/Bosh.tsx` (qayta
tuziladi; kattalar yo'li va bot ichidagi salomlashish saqlanadi).

Tepadan pastga:
1. **Sarlavha:** kun va sana (`Juma · 26-sentabr`, kichik, bosh harf,
   `ink-dim`), "Xayrli kech, {ism}" (vaqtga qarab: tong/kun/kech —
   yangi `t()` kalitlari), o'ngda lupa → `/qidiruv`.
2. **Kunlik halqa** (oq karta): 3 bo'lakli doira, bajarilgani yashil,
   markazda `1/3 bajarildi`; yonida 3 qator — Bitta dars, Bugungi sinov
   (`lib/kunlikSinov.ts`), Kunlik son (`lib/oyin/kunlikSon.ts`).
   Bajarilgani yashil belgi, joriysi ko'k halqa, qolgani kulrang halqa.
3. **Zanjir** (oq karta): "N kun ketma-ket · Rekord: M" va 7 ta doira
   (Du–Ya): o'ynagan kun oltin + ✓, bugun oltin + ko'k tashqi halqa,
   kelajak — `bg-track`. Ma'lumot: `lib/zanjir.ts` (`ZanjirHolat`,
   `kunKaliti`, `kunOldin`).
4. **Keyingi dars** (ko'k, asosiy tugma shu yerda): yorliq "KEYINGI DARS"
   va `2-bob · 3 / 6`, dars nomi, **bobning kichik yo'li** (bob darslari
   nuqta bo'lib: o'tilgan — oq, joriy — halqa, qolgan — xira), oq
   "Davom etish" tugmasi. Mavjud `davomJoyi()` (`Bosh.tsx`) ishlatiladi.
   Yangi odamda (hech narsa boshlanmagan) — "O'rganishni boshlash".
5. **Aql maslahati** (ixtiyoriy, oxirgi): logo + bitta qisqa maslahat.
   Maslahatlar ro'yxati `lib/matn.ts` da, kun bo'yicha almashadi.

### 3-bosqich. O'qish (`/darslar`)
**Ekranlar:** `03-Oqish.png`, `08-Testlar.png`.

- Yangi qobiq komponenti `components/OqishQobiq.tsx`: sarlavha "O'qish",
  o'ngda **sinf tanlagich** (ochilganda kurslar ro'yxati — mavjud
  `COURSES`), lupa; ostida 4 yorliqli segment:
  **Darslar · Testlar · Formulalar · Xatolar**.
- Yorliqlar mavjud ekranlarni o'raydi, yangisini yozmaydi:
  Darslar → kurs xaritasi (`/kurs/:slug`, `App.tsx` → `KursSahifasi` →
  `screens/Home.tsx`), Testlar → `TestSinf.tsx`/`Testlar.tsx`,
  Formulalar → `Formulalar.tsx`, Xatolar → `/kurs/:slug/daftar`
  (`App.tsx` → `DaftarSahifasi`, ya'ni `Lesson` daftar rejimida;
  ma'lumot `lib/daftar.ts`). Xatolar yorlig'ida avval daftardagi
  savollar soni va "Mashq qilish" tugmasi turadi.
- **Darslar** ko'rinishi (`03-Oqish.png`): umumiy progress chizig'i
  (yashil) + `12 / 45 dars`; boblar ro'yxati — tugagan bob yopiq
  (yashil belgi, `5 / 5 dars · tugadi`), **joriy bob ochiq** va ko'k
  halqa bilan ajratilgan, ichida darslar: o'tilgan — yashil doira,
  joriy — ko'k halqa + "Boshlash" tugmasi, keyingilari kulrang.
  Qolgan boblar yopiq.
- **Testlar** ko'rinishi (`08-Testlar.png`): tepada tavsiya etilgan
  blok test kartasi (30 savol · 45 daqiqa, "Testni boshlash"), ostida:
  **Milliy sertifikat va DTM** (→ `/sertifikat` yoki oxirgi tanlangan tur,
  `lib/imtihonTur.ts`), mavzu bo'yicha test, test to'plamlari; talaba
  uchun — Sessiya.

### 4-bosqich. O'yin (`/oyinlar`)
**Ekran:** `04-Oyin.png`. Fayl: `screens/Oyinlar.tsx`.

- Tepada **Tez o'yin** ko'k karta (duelga; hozircha mavjud
  `/oyinlar/duel` ga olib boradi — radar 10-bosqichda).
- "Yakka o'yinlar" sarlavhasi va o'ngda kichik izoh: `● oxirgi ● rekord`.
- Har o'yin kartasi (2 ustun): belgi + nom; **oxirgi natija** katta son
  va `↑ +17 haftada`; **kichik grafik** — oxirgi 7 natija: ko'k chiziq
  2px, ostida `brand-blue/10` maydon, oxirgi nuqta ko'k, rekord nuqta
  oltin (oxirgisi rekord bo'lsa — bitta oltin nuqta ko'k halqa bilan).
  O'q, to'r, raqam yo'q; faqat past chiziq. `aria-label` da 7 son.
  O'ynalmagan o'yin: "Hali o'ynalmagan" + uzuq chiziq.
- **Ma'lumot YANGI kerak:** `lib/oyin/rekord.ts` hozir faqat eng
  yaxshisini saqlaydi. `natijaniYoz()` ichida har o'yin uchun **oxirgi 7
  natija** ro'yxatini ham saqlang (`localStorage`, try/catch bilan,
  kalit versiyali, eski ma'lumot bilan buzilmasin) va `oxirgilar(id)`
  eksport qiling.

### 5-bosqich. Imtihon: DTM va Milliy sertifikat
**Ekranlar:** `09-Dtm.png`, `10-Sertifikat.png`, `11-SertTest.png`,
`12-SertMoslash.png`, `13-SertOchiq.png`, `14-SertNatija.png`.
Fayllar: `screens/Imtihon.tsx`, `screens/Sertifikat.tsx`,
`screens/SertifikatTest.tsx`, `components/ImtihonTur.tsx`.

Mantiq TAYYOR (`lib/sertifikat.ts`, `lib/imtihon.ts`) — faqat ko'rinish:

- **Sertifikat ro'yxati:** o'rtacha ball `76,8 / 100` va o'ngda oltin
  "B · taxminiy" belgisi; ostida **daraja shkalasi** — segmentlar
  xom ballda: sertifikatsiz 0–61,3 · C 61,3 · C+ 66,7 · B 73,3 · B+ 80 ·
  A 86,7 · A+ 93,3 (bu `DARAJALAR` ning 75 ga mutanosib teskarisi:
  `chegara / 0,75`; qo'lda yozmang — `DARAJALAR` dan hisoblang), ko'kning
  ochdan to'qqa pog'onalari, marker — o'rtacha ball. Yarim qolgan variant
  — ko'k "Davom etish" kartasi (`joriyniOqi()`): `23 / 45 javob · 94 daq
  qoldi`. Variantlar 4 ustunli setkada: raqam + eng yaxshi ball yoki "—";
  joriy variant ko'k halqa bilan.
- **Savol ekranlari:** tepada ✕ (javoblar saqlanadi), qolgan vaqt
  `1:34:12`, "Yakunlash". Ostida **45 katakli xarita** (15 ustun):
  javob berilgan — ko'k, joriy — ko'k halqa, bo'sh — `bg-track`; ostida
  bo'lim nomlari. **Imtihon paytida to'g'ri/xato ko'rsatilmaydi**
  (tanlangan javob faqat ko'k). Moslashtirishda A–F umumiy javoblar
  har savolda ko'rinadi. Ochiq javobda har qism: `±` tugmasi + son
  maydoni, "Faqat son yozing. Kasrni vergul bilan: 2,5".
- **Natija:** katta `80,0 / 100 ball`, oltin "Taxminiy daraja: B+",
  "A darajaga 6,7 ball yetmadi" (keyingi chegaragacha farq); 3 ta bo'lim
  kartasi (Test 26/32, Moslash 2/3, Ochiq 16/20) kichik ko'k chiziq
  bilan; "Qayerda ball yo'qotildi" — mavzu, xato soni, `−4,4`; xatolar
  ro'yxati (to'g'ri javob yashil, siz — `ink-dim`, raqam qizil fonda);
  "Qayta ishlash" (asosiy), "Variantlarga qaytish".
- **DTM ro'yxati:** o'rtacha `22 / 30 to'g'ri · 73%`, "Ko'p xato
  qilinayotgan mavzular" chiplari + "Shu mavzularni takrorlash".
  DTM da javob darhol ko'rinadi — bu farq ekranda yoziladi.

### 6-bosqich. Masalalar
**Ekranlar:** `05-Masalalar.png`, `16-Masala.png`.
- Lenta: filtr chiplari (sinf — ko'k to'ldirilgan, Yangi, Ommabop) +
  "Saralash" varag'i; karta 3 qavat: muallif · matn · bitta amal.
  Yechilgani — faqat "Yechgansiz ✓", qolgani "Yechish".
  Pastda o'ngda suzuvchi **"Masala yozish"** tugmasi (panel ustida).
- Bitta masala: muallif va "14 kishi yechdi", katta matn, javob maydoni,
  "Tekshirish"; yechim javobdan keyin ochiladi (qulf belgisi), izohlar.

### 7-bosqich. Men ichidagi sahifalar
**Ekranlar:** `17-Reyting.png`, `18-OtaOna.png`.
- Reyting: segment (Sinfim · Hamma · Do'stlar), 3 kishilik podium
  (1-o'rin oltin), ro'yxatda o'zingiz ko'k fon bilan ajratilgan.
- Ota-ona paneli: farzand tanlash chiplari, 3 son (faol kun, dars,
  to'g'ri %), haftalik ustunli grafik (daqiqa), "Yordam kerak bo'lgan
  mavzu" + "Darsni ochish", "Haftalik hisobot Telegram'ga" o'chirgichi.
  Ma'lumot: mavjud `OtaOna.tsx`/`Hisobot.tsx`.

### 8-bosqich. Qidiruv
**Ekran:** `19-Qidiruv.png`. `screens/Qidiruv.tsx` + `lib/qidiruv.ts`.
Natijalar guruhlangan: Darslar · Formulalar · Masalalar, har birida
"O'qish › 5-sinf › 4-bob" ko'rinishidagi yo'l.

### 9-bosqich. Kichkintoy rejimi
**Ekran:** `20-Kichkintoy.png`.
Profil 2–5 yosh bo'lsa (`kichkintoyKerak`/profil sinfi), ilova
**pastki panelsiz** 4 ta katta karta (Mashinalar, Hayvonlar, Ranglar,
Raqamlar) ko'rsatadi. Chiqish — faqat qulfli "Ota-ona" tugmasi (bosib
turish yoki oddiy misol bilan tasdiq). Mavjud `Kichkintoy.tsx` va
`KichkintoyMavzu.tsx` ishlatiladi.

### 10-bosqich (alohida, katta). Tez o'yin: raqib radari
**Ekran:** `15-Duel.png`. Harakatdagi namunasi:
https://claude.ai/artifact/KTxPq93avQ7HpmwhiR3DUE

Uch bosqichli qidiruv (0–5 s jonli, 5–8 s arvoh, 8 s robot), "raqib
topilmadi" holati yo'q. Backend ishi kerak (navbat, arvoh tanlash —
`Duel.chaqirgan_sanoq/qabul_sanoq` allaqachon soniyama-soniya saqlanadi).
Bu bosqichni boshqalardan keyin, alohida PR bilan qiling.

---

## 3. Ranglar: manbadagi hex → ilova tokeni

| `manba/` dagi qiymat | Tailwind token |
|---|---|
| `#3b6fe0` | `bg-brand-blue` / `text-brand-blue` |
| `#2c56b8` | `brand-blue-d` (tugma soyasi, faol matn) |
| `#22b06b`, `#178a52` | `brand-green`, `brand-green-d` |
| `#f5b301`, `#8a6200`/`#c28a00` | `brand-gold`, `brand-gold-d` |
| `#1a2450` | `text-ink` |
| `#4d5a86` | `text-ink-soft` |
| `#5f6d8e` | `text-ink-dim` |
| `#ffffff` karta | `bg-karta` |
| `#f4f6fb` fon | `--az-body` (`Fon.tsx`) |
| `rgba(26,40,90,0.07–0.1)` | `bg-track` |
| `0 3px 0 #c4d2f0, …` | `shadow-clay-sm` / `shadow-clay` |
| `inset 0 2px 5px …` | `shadow-ichki` + `bg-sahna` |
| `#e5484d` (faqat xato raqami) | `brand-red` |

Shrift: sarlavhalar `font-display` (Fredoka), matn — ilova standarti.
Radiuslar: kartalar `rounded-clay` (24px), tugma va qatorlar 14–18px.

---

## 4. Nima QILINMAYDI

- Eski marshrutlarni o'chirish yoki nomini o'zgartirish.
- Mantiqni qayta yozish (ball hisobi, daraja, generatorlar, duel,
  progress) — faqat ko'rinish va navigatsiya.
- Yangi rang, gradient fon, emoji sarlavhalar.
- Qo'lda yozilgan o'zbekcha satr — hammasi `t()`, ikki tilda.
- Bitta commitda hamma bosqichni qilish.

---

## 5. Tekshiruv (har bosqichdan keyin)

```bash
cd frontend && npx tsc -b && npm run lint && npm run tekshir && npm run build
cd ../backend && DEBUG=1 python manage.py test
```

Keyin ko'z bilan: 320×568 va 375×812, oq va qora rejim, o'zbek va rus
tili. Ro'yxat:

- [ ] Ekranda uchtadan ortiq rang yo'q, qizil faqat xatoda
- [ ] Bitta asosiy (ko'k to'ldirilgan) tugma, darhol ko'rinadi
- [ ] 320px da gorizontal toshish va qirqilgan matn yo'q
- [ ] Qo'lda hex va qo'lda yozilgan satr yo'q
- [ ] Yangi tugmalarda `data-tahlil`
- [ ] Eski havolalar (`/kurs/...`, `/imtihon/3`, `/sertifikat/5`,
      `/oyinlar/tezkor`) ochiladi va to'g'ri tab yonadi
