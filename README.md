# Aql Zone

Kichkintoylar (2–5), maktabgacha yosh (4–6) va 1–6-sinf matematikasi. Bola
boblar bo'ylab yo'l xaritasida yuradi, har bir darsda 6 ta savol yechadi va
yulduz yig'adi. Savollar **har safar qaytadan yasaladi** — darsni ikkinchi
marta ochsa sonlar boshqacha bo'ladi.

## Kichkintoylar — 2–5 yosh

`/kichkintoy` — to'rtta mavzu: **mashinalar, hayvonlar, ranglar, raqamlar
0–9**. Ilovadagi qolgan hamma narsadan tubdan farq qiladi va farqni bitta
gap bilan aytish mumkin: **bu yerda savol yo'q.**

Maktabgacha kurs "Qaysi biri qizil?" deb so'raydi. Savol berish uchun esa
bola javobni allaqachon bilishi kerak. Bu bo'lim o'sha bilimning O'ZINI
beradi.

**Albom.** Ekranda ayni paytda bitta karta turadi va u juda katta. Karta
ochilishi bilan ilova nomini aytadi, keyin pauza qilib tovushini —
"mashina… bi-bip", "it… vov-vov". Bola hech narsa bosmaydi: u hali
"eshitish uchun tugmani bos" degan qoidani bilmaydi. Sahnani bosish nomni
qayta aytadi, va bu yoshdagi eng ko'p qilinadigan harakat aynan shu —
takror, takror, yana takror.

**Nega o'n ikkitasi birga emas.** Setka qilib hammasini ko'rsatish kattalar
uchun qulay. 3 yoshli bola esa o'n ikkita rasmda hech biriga qaramaydi —
faqat barmog'ini yugurtiradi. Bitta katta rasm savol tug'diradi: "bu nima?"

**Qulf, yulduz, tanga, tartib yo'q.** Bola mashinani ko'rgisi kelsa,
mashinani ko'radi. Qulflangan katta unga "sen bunga arzimaysan" deb
ko'rinadi, holbuki u hali "keyingi" degan so'zni ham bilmaydi.

**O'yin — albomdan keyin.** To'rtta karta ko'rilgach "Topib ber" tugmasi
paydo bo'ladi: ovoz nomni aytadi, ekranda uchta rasm. **Yutqazish yo'q** —
xato javobda karta silkinadi, ovoz nomni qaytadan aytadi va o'yin o'sha
savolda turaveradi. Ball ham, vaqt ham yo'q.

**Raqamlarda belgi va narsalar birga.** "5" degan chizma bilan beshta olma
bir vaqtda ko'rinadi. Alohida ko'rsatgan ilova raqamni o'rgatadi, sonni
emas: bola "besh" deb o'qishni biladi-yu, beshta olmani sanay olmaydi. Nol
kartasi bo'sh — bo'sh joyning o'zi tushuntiradi.

Kod: `frontend/src/lib/kichkintoy.ts` (lug'at, ikki tilda),
`screens/Kichkintoy.tsx` (mavzular), `screens/KichkintoyMavzu.tsx` (albom va
o'yin), `components/KichkintoyKarta.tsx` (rasm, rang va raqam kartalari).
Ovoz — `OVOZ-README.md`.

## Maktabgacha kurs

`/kurs/maktabgacha` — 22 bob, 82 dars. Boshqa kurslardan uch narsa bilan
farq qiladi.

**1. Dars savol bilan boshlanmaydi.** Avval animatsion tushuntirish chiqadi:
olmalar bitta-bitta tushib sanaladi, ikki guruh "+" belgisi bilan
birlashadi, ayirishda ketadiganlari ko'z oldida uchib ketadi. Faqat shundan
keyin savol so'raladi. Kod: `frontend/src/components/Ogit.tsx`, tushuntirish
turlari `Ogit` (`frontend/src/lib/types.ts`).

**2. Bola o'qiy olmaydi.** Javob variantlari — rang, rasm yoki bitta katta
harf/raqam, hech qachon so'z emas. Yagona istisno hafta kunlari (19-bob):
kun nomining rasmi yo'q, shuning uchun u eng oxirroqda turadi.

**3. Avval o'rgatamiz, keyin so'raymiz.** Har bobning birinchi darsi
mavzuning HAMMA a'zosini birma-bir ko'rsatishdan boshlanadi (`Ogit` ning
"royxat" turi): yettala rang, oltala shakl, o'nta transport — har biri
katta, nomi bilan, oxirida hammasi birga. Ota-ona shu paytda bola bilan
takrorlaydi. "Qaysi biri binafsha?" degan savol bola binafshani KO'RGANDAN
keyin beriladi.

**4. Bir dars ichida savol takrorlanmaydi.** `screens/Lesson.tsx` savol
yasashda avval butunlay yangisini izlaydi, topilmasa hech bo'lmasa
oldingisiga o'xshamaganini oladi. Ikkinchi bosqich shart: yo'nalish atigi
to'rtta, 6 ta butunlay boshqacha savol chiqmaydi.

**5. Rasmlar.** Faqat GEOMETRIYA o'z SVG chizmamiz
(`frontend/src/components/Rasm.tsx`): shakllar va strelkalar — ularning
"haqiqiysi" yo'q, shundoq ham chizma. Qolgani (hayvon, meva, transport,
ob-havo, yuzlar) emoji: ular hajmli va yorug'-soyali, ya'ni bolaga haqiqiy
narsani eslatadi. Har biri rangli pufak ustida va sekin suzib turadi.
Yangi chizma qo'shish uchun `CHIZMA` ga emojini kalit qilib qo'shish
kifoya — butun ilova o'sha faylning ichidan o'tadi.

**4. Ovoz hozircha O'CHIQ.** Kod tayyor (`frontend/src/lib/ovoz.ts`): tashqi TTS
xizmati → tayyor mp3 → brauzer ovozi. Lekin brauzerning o'z ovozi
o'zbekchani ruscha talaffuz bilan o'qiydi — bunday ovoz bolaga yordam
bermaydi. Shuning uchun `AZ_TTS_API` ga haqiqiy xizmat ulanmaguncha ovoz
yoqilmaydi va tugmasi ham ko'rinmaydi. Ulangandan keyin `ovozYoniqmi()`
dagi bir shartni almashtirish kifoya.

Mavzular: ranglar, shakllar, hayvonlar va ularning ovozi, mevalar,
transport, sanash (3 → 5 → 10), katta-kichik, ko'p-kam, qo'shish, ayirish,
yo'nalish, kun tartibi, ob-havo, hafta kunlari, naqsh, harflar.

Loyiha ikki mustaqil qismdan iborat, boshqa hech narsa yo'q:

```
frontend/   React + Vite + Tailwind — butun interfeys va o'yin mantig'i
  src/          komponentlar, ekranlar, generatorlar, kurslar
  public/       sw.js, manifest, logolar, audio/ (tayyor mp3)
backend/    Django REST Framework — /api/v1 va yig'ilgan frontendni berish
  aqlzone/      sozlamalar, URL'lar
  core/         modellar, view'lar, auth, Telegram bot
```

Ikkisi faqat **HTTP orqali** gaplashadi (`/api/v1`), umumiy fayl yo'q.
Shuning uchun frontendni alohida (Vercel, nginx) joylashtirish ham,
Django'ning o'ziga berdirish ham mumkin — kod o'zgarmaydi.

## Ishga tushirish

Ikki oyna kerak.

**1. Backend**

```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py runserver 8787
```

**2. Frontend**

```bash
cd frontend
npm install
npm run dev
```

So'ng http://localhost:5180 ni oching. Vite `/api` so'rovlarini backendga
uzatadi, shuning uchun ikkalasi bir ilovadek ishlaydi.

### Bitta manzildan berish

```bash
cd frontend && npm run build
cd backend && .venv/Scripts/python.exe manage.py runserver 8787
```

Endi hammasi http://localhost:8787 da: Django React ilovani ham, API'ni ham
o'zi beradi.

## Ishlab chiqarish — aql-zone.uz

Rasmiy domen: **https://aql-zone.uz**

`backend/.env` da eng kamida shu to'rttasi bo'lishi kerak:

```bash
DEBUG=0
SECRET_KEY=<python -c "import secrets; print(secrets.token_urlsafe(50))">
ALLOWED_HOSTS=aql-zone.uz,www.aql-zone.uz
CSRF_TRUSTED_ORIGINS=https://aql-zone.uz,https://www.aql-zone.uz
```

`DEBUG=0` bo'lganda standart `SECRET_KEY` bilan server **umuman ishga
tushmaydi** — ataylab shunday. Ogohlantirish yozib qo'yish yetarli emas:
uni hech kim o'qimaydi va sayt oylab ochiq kalit bilan ishlab ketaveradi.

HTTPS ulangandan keyin (`.env.example` da to'liq izoh bor):

```bash
PROKSI_ORTIDA=1      # nginx yoki Cloudflare ortida
SSL_MAJBURIY=1       # HTTP → HTTPS
HSTS_SEKUND=3600     # avval kichik qiymat bilan sinang
```

**HSTS bilan ehtiyot bo'ling.** Brauzer uni eslab qoladi va berilgan muddat
davomida saytga HTTP bilan umuman murojaat qilmaydi. Sertifikat buzilsa,
sayt shu muddat tugagunicha ochilmaydi. Shuning uchun 1 soatdan boshlang.

`manage.py check --deploy` ikkita narsadan shikoyat qilishda davom etadi va
ikkalasi ham ATAYLAB shunday:

| Ogohlantirish | Nega e'tiborsiz qoldirilgan |
|---|---|
| `CsrfViewMiddleware` yo'q | CSRF cookie'ga tayanadi, bizda cookie yo'q — himoya Bearer token orqali |
| `XFrameOptionsMiddleware` yo'q | Telegram Mini App saytni o'z ramkasida ochadi; `DENY` qo'ysak ilova ochilmay qoladi |

## Nimalar bor

| | Qayerda |
|---|---|
| Yo'l xaritasi, 177 dars, har safar yangi savollar | `frontend/src/lib/curriculum/` |
| **Ikki til** — o'zbekcha va ruscha, savollargacha to'liq | `frontend/src/lib/til.ts` |
| **Xatolar daftari** — xato qilingan savol turi 1 / 3 / 7 kundan keyin qaytadi | `frontend/src/lib/daftar.ts` |
| **Offline** — internetsiz to'liq ishlaydi | `frontend/public/sw.js` |
| **Kunlik maqsad va zanjir** (oyiga bitta qoldirilgan kun kechiriladi) | `frontend/src/lib/progress.tsx` |
| **Zanjirni tanga bilan tiklash** — uzilgan kuni, haftada bitta | `frontend/src/lib/zanjir.ts` |
| **Kunlik sinov** — faqat bugun ochiq, tangasi ikki barobar | `frontend/src/lib/kunlikSinov.ts` |
| **Bugungi maydon** — 3 bosqich, kuniga bir marta, hammaga bir xil savol | `frontend/src/lib/oyin/maydon.ts` |
| **Do'st bilan bellashuv** — jonli (ikkalasi "tayyorman" desa) yoki chaqiruv havolasi orqali | `backend/core/duel.py`, `frontend/src/screens/Duel.tsx` |
| **Qaytarish zanjiri** — 7/21/45 kun, keyin sukut | `backend/core/management/commands/qaytarish.py` |
| **Nishonlar** — progressdan hisoblanadi, alohida saqlanmaydi | `frontend/src/lib/nishon.ts` |
| **Tangalar do'koni** — tulkini bezash | `frontend/src/lib/dokon.ts` |
| **Ota-ona paneli** — haftalik faollik, qiyin mavzular | `frontend/src/screens/OtaOna.tsx` |
| **Reyting** — jami va haftalik, o'z o'rning bilan | `frontend/src/screens/Reyting.tsx` |
| **Haftalik liga** — 20 kishilik guruh, ko'tarilish va tushish | `backend/core/liga.py` |
| **Telegram orqali kirish** — botdagi bir martalik havola bilan | `backend/core/auth.py` |
| **Profillar** — bir qurilma, bir necha bola | `backend/core/models.py` |
| **Telegram eslatmasi** — bugun mashq qilmaganlarga | `backend/core/management/commands/eslatma.py` |
| **E'lon tarqatish** — botdan hammaga xabar, inline tugma bilan | `backend/core/reklama.py` |
| **Adminga xabar** — yangi ro'yxatdan o'tgan odam va jami soni | `backend/core/xabar.py` (`adminga_yangi_hisob`) |
| **Botdagi doimiy tugmalar** — darslar, o'yinlar, raqam, yordam | `backend/core/management/commands/bot.py` (`asosiy_klaviatura`) |
| **Rangli tugmalar** — yashil / ko'k / qizil, ma'nosiga qarab | `backend/core/xabar.py` (`YASHIL`, `KOK`, `QIZIL`) |
| **Matematik o'yinlar** — 8 ta o'yin, har birida 3 daraja | `frontend/src/lib/oyin/` |

## Qaytishni ta'minlaydigan uch mexanizm

Zanjir, liga va nishonlar bolani ushlab turadi, lekin uchta teshik bor edi
va uchalasi ham **ketishning aniq nuqtasida** turardi.

### 1. Zanjirni tanga bilan tiklash

**Muammo.** Bepul muzlatgich oyiga bitta qoldirilgan kunni kechiradi.
Undan keyin zanjir nolga tushardi — va amalda aynan o'sha payt bola
ilovani tashlab ketardi: 12 kunlik mehnat bir kunda yo'qolgandek
tuyuladi.

**Yechim.** Uzilgan kuni ilova ochilsa, kurs sahifasida taklif chiqadi:
*"8 kunlik zanjiringni saqlab qolish mumkin — faqat bugun. 50 tanga."*

Bu bir vaqtda **tangalarga ma'no beradi**: hozir ular faqat shlyapa va
tojga ketadi, ya'ni ikki-uch haftadan keyin ortiqcha bo'lib qoladi.

Uch chegara ATAYLAB qat'iy (`frontend/src/lib/zanjir.ts`), aks holda
zanjir hech narsani bildirmay qolardi:

| Chegara | Qiymat | Nega |
|---|---|---|
| Eng ko'p uzilish | 2 kun | bir hafta yo'qolgan odamning "45 kunlik zanjiri" — yolg'on |
| Ikki tiklash orasi | 7 kun | har kuni sotib olinadigan zanjir — zanjir emas, obuna |
| Narx | 50 → 100 → 200 | oyiga uchtadan ko'p emas |

Bepul muzlatgich BIRINCHI turadi: bir kunlik uzilishni u o'zi yopadi va
o'sha holatda tanga so'rash — bor narsani sotish bo'lardi.

Tanga jami hisobdan yechiladi (eng boy kursdan boshlab): tangalar kursga
tegishli, zanjir esa butun hisobga — aks holda bola tangasini 3-sinfda
yig'ib, 1-sinfda zanjirini tiklay olmasdi.

### 2. Kunlik sinov — faqat bugun ochiq

**Muammo.** Ilovada hech narsa o'tkazib yuborilmaydi: har bir dars ertaga
ham shu yerda. Shoshilish uchun sabab yo'q, ya'ni "keyinroq" har doim
to'g'ri javob — va "keyinroq" hech qachon kelmaydi.

**Yechim.** Kuniga bitta sinov: 6 ta savol, **tangasi ikki barobar**,
yarim tunda yopiladi. Kartada qolgan soat turadi.

Savollar **xatolar daftaridan va allaqachon o'tilgan darslardan** olinadi
(`frontend/src/lib/kunlikSinov.ts`) — ya'ni yangi kontent yozish kerak
emas va sinov hech qachon "bilmagan narsam" bo'lmaydi.

Uch qoida:

- **Olti savol, ko'p emas.** O'tkazib yuborgan bola o'zini aybdor his
  qilmasligi kerak — sinov "yo'qotish" emas, "bonus olmadim" bo'lsin.
- **Zanjirga ta'sir qilmaydi.** U qo'shimcha, majburiyat emas.
- **Yo'l xaritasiga yozilmaydi.** Darslar tartibini oldinga surmaydi.

Serverga natija `unit=99, lesson=99` bilan boradi — haqiqiy darslardan
uzoq son, aks holda sinov ota-ona panelidagi "eng qiyin darslar"
ro'yxatida boshqa darsning aniqligini buzib ko'rsatardi.

### 3. Yo'qolganlarni qaytarish

**Muammo.** Kunlik eslatma ataylab faqat so'nggi 14 kunda faol
bo'lganlarga yoziladi — bu to'g'ri anti-spam qoidasi. Lekin uning
teskari tomoni ham bor edi: **14 kundan oshgan odam abadiy yo'qolardi**,
chunki uni qaytarishning hech qanday yo'li yo'q edi.

**Yechim** (`backend/core/management/commands/qaytarish.py`): uchta
xabar, keyin butunlay sukut.

```
7-kun    "Yulduzlaring joyida — hech narsa yo'qolmagan"
21-kun   "Endi kunlik sinov bor" (yangi sabab)
45-kun   ochiq aytilgan xayrlashuv, keyin hech qachon
```

Har biri BOSHQA narsa haqida gapiradi: bir gapni uch marta takrorlash —
yolvorish, va u ishlamaydi. Oraliqlar kengayib boradi: yaqinda ketgan
odam qaytishga yaqin, uzoq ketgani esa har hafta eslatilsa faqat
asabiylashadi.

**Har xabarda «Boshqa yozmang» tugmasi.** Rad javob yo'li bo'lmagan xabar
oxir-oqibat bloklanadi, bloklangan odam esa butunlay yo'qoladi: keyin
unga na e'lon, na kirish havolasi yetib boradi. Tugma o'sha yo'qotishni
oddiy "hozircha kerakmas" ga aylantiradi (`Pupil.xabar_yopiq_at` —
eslatma ham, qaytarish ham to'xtaydi; `/start` yozilsa o'zi ochiladi).

Hisob har TANAFFUS uchun alohida: odam qaytib dars qilishi bilan
`qaytarish_soni` nolga tushadi, ya'ni bir yilda ikki marta yo'qolgan odam
ikkala safar ham chaqiriladi.

```bash
python manage.py qaytarish --sinov     # kimga va NIMA borishini ko'rsatadi
python manage.py qaytarish --soat 18   # yuborish
```

**Qaytganda nima kutib oladi.** Yigirma kundan keyin qaytgan bolani bo'sh
maqsad va nolga tushgan zanjir kutib olsa, u ikkinchi marta ketadi — va
endi qaytmaydi. Shu sabab kurs sahifasida yumshoq kutib olish kartasi
chiqadi: *"20 kun ko'rinmadingiz. Yulduzlaringiz joyida — yengil
boshlaymiz."* (`components/Qaytish.tsx`).

### Botdagi doimiy tugmalar

Suhbat ostida to'rtta tugma DOIM turadi:

```
🎓 Darslar   🎮 O'yinlar
📱 Raqam     ❓ Yordam
```

Birinchi ikkitasi xabar yubormaydi — ular `web_app` tugmasi va bosilishi
bilan ilovani kerakli sahifada ochadi (`/` va `/oyinlar`).

**Nega kerak edi.** Bot faqat buyruqni tushunardi va ularni hech qayerda
ko'rsatmasdi: `/oyinlar` deb yozgan odam "Boshlash uchun /start yuboring"
degan javob olardi — ya'ni bot bilgan narsasini o'zi yashirib turardi.
Buyruqni eslab qolish esa hech kimning ishi emas.

Uch qo'shimcha:

- **`setMyCommands`** — "/" tugmasi ostidagi ro'yxat. O'rnatilmagunicha u
  BO'SH edi. Har til uchun alohida yuboriladi.
- **`setChatMenuButton`** — kiritish maydoni yonidagi tugma. SUHBAT
  bo'yicha qo'yiladi, umumiy emas: umumiysi bitta tilda qotib qolardi.
- **Klaviatura noma'lum xabarga javobda ham qayta yuboriladi** — bu
  yangilikdan oldin botdan foydalangan odamlarda u yo'q va ular `/start`
  ni boshqa hech qachon yozmasligi mumkin.

Tugma matni **barcha tilda** taniladi (`matn.barcha`): Telegram
allaqachon yuborilgan klaviaturani o'zi yangilamaydi, ya'ni tilini
almashtirgan odamning ekranida eski tildagi tugma qolib ketishi mumkin.

### Bot qaysi tilda gapiradi

Tartib qat'iy va u bitta savolga javob beradi — *"odam uchun bu bitta
ilova"*:

```
1. Pupil.til     ilovada TANLANGAN til        ← ustun
2. language_code Telegram interfeysi tili     ← hisob hali yo'q bo'lsa
3. "uz"          loyihaning asosiy tili
```

Ikkinchisi birinchisidan ustun bo'lmasligi muhim: O'zbekistonda telefon
ruscha, bola esa o'zbek maktabida bo'lishi juda ko'p uchraydi.

Til saytda almashtirilganda **darhol serverga yoziladi**
(`frontend/src/lib/til.ts` dagi `tilniAlmashtir`). Ilgari u faqat
qurilmada saqlanardi va natijada sayt o'zbekchaga o'tgani bilan bot
ruscha gapirib turaverardi. Saqlash sahifa qayta yuklanishidan OLDIN
kutiladi (ko'pi bilan 1,5 soniya), aks holda yangilanish so'rovni yarim
yo'lda uzib qo'yardi.

### Avtomatik eslatma

Kuniga bir marta, bugun mashq qilmagan bolaga Telegram'ga xabar boradi.
Ostida "Mashq qilish" tugmasi — bitta bosishda ilova ochiladi.

```bash
python manage.py eslatma --sinov     # kimga va QANDAY matn borishini ko'rsatadi
python manage.py eslatma             # yuborish
```

Kimga yuboriladi: Telegram'i bog'langan, botni bloklamagan, bugun dars
tugatmagan, lekin **oxirgi 14 kun ichida faol bo'lgan** bolaga. Oxirgi
shart muhim — butunlay tashlab ketgan odamga yozish spam.

Matn bir xil emas va bu ataylab. Zanjiri bor bolaga *"zanjiring 5 kun,
bugun uzilib qoladi"* deyiladi: bu eng kuchli sabab, chunki u yutuq
haqida emas, **yo'qotish** haqida. Zanjiri yo'qlarga esa kun bo'yicha
almashadigan to'rtta matndan biri boradi — har kuni bir xil xabar bir
haftada ko'zga tashlanmay qoladi.

Bir kunda ikki marta yuborilmaydi (`Pupil.eslatma_at`). Rejalashtirgich
tasodifan ikki marta ishga tushsa ham bola bitta xabar oladi.

**Soatni to'g'ri tanlang:** 17:00–19:00. Ertalab yuborilgan eslatma
darsga ketayotgan bolada ochilmaydi va o'qilmagan xabar bo'lib qoladi.

Cron **soat sayin** chaqiriladi, soatni esa buyruqning o'zi tekshiradi:

```bash
0 * * * * docker exec aqlzone python manage.py eslatma --soat 18
```

Nega shunday. Serverning soati CEST, konteynerniki UTC, bolalar esa
Toshkent vaqtida yashaydi — cron'da "18:00" deb yozish uchalasidan
qaysi biri ekanini taxmin qilish demak. Ustiga yozgi vaqt ko'chishi bor:
to'g'ri sozlangan cron ham yiliga ikki marta bir soatga siljib ketadi.
`--soat` bilan bu savol butunlay yo'qoladi — Django uchun mahalliy vaqt
aniq (`TIME_ZONE = Asia/Tashkent`).

### E'lon tarqatish

`/boshqaruv/reklama` — matn yoziladi, Telegram'da qanday ko'rinishi yonida
darhol chiziladi, so'ng avval **o'zingizga**, keyin hammaga yuboriladi.
Xabar ostidagi "botga kirish" tugmasi yoqib-o'chiriladi; havolasi bo'sh
qoldirilsa bot manzili qo'yiladi.

Uch narsa ataylab shunday qilingan va uchalasi ham bir marta kuyib
bilinadigan narsalar:

- **Bir odamga ikki marta bormaydi.** Har yuborilgan xabar
  `ReklamaQabul` ga yoziladi, cheklov esa BAZADA turadi. Shuning uchun
  uzilgan e'lonni davom ettirish xavfsiz.
- **Bloklagan odam eslab qolinadi** (`Pupil.bot_bloklandi_at`) va keyingi
  e'lonlarda umuman qatnashmaydi.
- **Tezlik cheklangan** — soniyasiga 25 ta. Oshirilsa Telegram butun
  botni vaqtincha to'xtatadi.

Yuborish fon oqimida ketadi. Server o'rtada qayta ishga tushsa e'lon
"ketyapti" holatida qoladi va panelda "Davom ettirish" tugmasi chiqadi.
Xuddi shu ishni buyruq qatori ham qiladi:

```bash
python manage.py reklama --royxat        # e'lonlar ro'yxati
python manage.py reklama --id 3          # yuboradi yoki davom ettiradi
python manage.py reklama --uzilganlar    # yarim qolganlarning hammasi
```

### Haftalik liga

Reyting ochilganda birinchi ko'rinadigan jadval. Bola butun saytdagi
bolalar bilan emas, o'ziga TENG 20 tasi bilan yarishadi: hafta oxirida
birinchi beshtasi yuqori darajaga ko'tariladi, oxirgi beshtasi quyiga
tushadi. Darajalar pastdan yuqoriga — Bronza, Kumush, Oltin, Olmos, Toj.

Nega kerak. Umumiy jadval bir necha oydan keyin qotib qoladi: 300 kishilik
ro'yxatda 147-o'rinni egallagan bola kurashmaydi, chunki oldingi bilan
orasi yetib bo'lmas darajada uzoq. 20 kishilik guruhda esa uchinchi o'rin
bir darsda qo'lga kiradi.

Ikki qoida ataylab yumshoq va ikkalasi ham qaytib kelish uchun:

- yulduz yig'magan bola **tushmaydi** — dam olgan hafta jazolanmaydi;
- guruhda faol bola 12 tadan kam bo'lsa, umuman hech kim tushmaydi
  (loyiha yangi bo'lganda guruhlar to'lmaydi).

Hafta har dushanba yakunlanadi:

```bash
python manage.py liga --sinov     # nima bo'lishini ko'rsatadi
python manage.py liga             # o'tgan haftani yakunlaydi
```

Buyruq `eslatma` bilan bir xil tartibda, tashqi rejalashtirgich orqali
chaqiriladi. **U ishlamay qolsa ham hech narsa buzilmaydi**: bola ligani
ochganda yopilmagan haftasi o'sha yerda yopiladi. Buyruq shunchaki buni
hamma uchun bir vaqtda qiladi, ya'ni ilovaga kirmagan bolaning o'rni ham
guruhdoshlariga to'g'ri ko'rinadi.

## Manzillar

Sahifalar endi HTML fayl nomi bilan emas, o'qib tushunarli manzil bilan
ochiladi:

```
/                            kurslar ro'yxati
/profillar                   kim o'ynayapti
/kurs/1-sinf                 kurs yo'l xaritasi
/kurs/1-sinf/2-bob/3-dars    dars
/kurs/1-sinf/daftar          xatolar daftari (takrorlash)
/kurs/1-sinf/dokon           tangalar do'koni
/kurs/1-sinf/nishonlar       yutuq nishonlari
/kurs/1-sinf/ota-ona         ota-ona paneli
/reyting                     reyting — kursdan tashqarida, hammasi birga
/kichkintoy                  kichkintoylar bo'limi — to'rtta mavzu
/kichkintoy/mashina          albom va "topib ber" o'yini
/oyinlar                     matematik o'yinlar ro'yxati
/oyinlar/tezkor              o'yinning daraja tanlash ekrani
/oyinlar/tezkor/2-daraja     o'yinning o'zi
/sozlamalar                  hisob: ism, familiya, kirish usullari
/kirish/<kod>                botdagi «Saytga kirish» havolasi
```

Sahifa yangilanganda ham ishlaydi: diskda bunday fayl yo'q, shuning uchun
server `index.html` ni qaytaradi va marshrutni React hal qiladi
(`backend/core/spa.py`).

Yopiq darsni manzilni qo'lda o'zgartirib ochib bo'lmaydi — ilova kurs
sahifasiga qaytaradi.

## Matematik o'yinlar

Kurslardan **butunlay alohida** bo'lim: `/oyinlar`. U yerda dars yo'q,
tartib yo'q, "keyingi bob" yo'q — sakkizta o'yin va rekord. Kod:
`frontend/src/lib/oyin/`, ekranlar `screens/Oyinlar.tsx`,
`screens/OyinDaraja.tsx`, `screens/Oyin.tsx`.

**Nega alohida.** Kurs — rejali ish, unga bola ota-onasi aytganda kiradi.
O'yinga esa u O'ZI keladi va aynan shu narsa uni ertaga ham qaytaradi.
O'yinni kurs ichiga qo'yganda manzilda tasodifiy sinf raqami turib
qolardi va ulashilgan havola "bu 2-sinf o'yini ekan" degan yolg'onni
aytardi.

| O'yin | Nima so'raydi | 🟢 Oson | 🔵 O'rta | 🔴 Qiyin |
|---|---|---|---|---|
| ⚡ Tezkor hisob | to'g'rimi yoki xatomi | `6 + 5 = 11` | `84 ÷ 12 = 7` | `40% · 220 = 83` |
| ✖️ Ko'paytirish jadvali | jadval, teskarisi ham | `3 × 4 = ?` | `7 × ? = 56` | `288 ÷ 18 = ?` |
| ❓ Yashirin amal | qaysi belgi | `6 ? 3 = 9` | `72 ? 8 = 9` | `(−13) ? (−18) = −31` |
| 🔢 Ketma-ketlik | qonuniyat | `2 · 4 · 6 · ?` | `1 · 4 · 9 · 16 · ?` | `1 · 1 · 2 · 3 · 5 · ?` |
| 👁 Chamalash | taxminiy javob | `19 + 22 ≈ ?` | `19 × 21 ≈ ?` | `2000 ÷ 45 ≈ ?` |
| ⚖️ Tarozi | tenglama, harfsiz | `🍎🍎🍎 = 12` | `3🍒 = 5🍋`, `🍋 = 3` | `🍇+🍋=20`, `🍇−🍋=2` |
| 🎲 24 | to'rt raqamdan 24 | `2·(3+4+5)` | `5×5−1×1` | `8÷(3−8÷3)` |
| 🧠 Sonlar xotirasi | nechta sonni eslaysan | 3 ta, bir xonali | 4 ta, ikki xonali | 5 ta, **teskari** |

### Daraja, yosh emas

Qiyinlik YOSH bilan emas, DARAJA bilan tanlanadi. Yosh esa darajaning
yonida **maslahat** bo'lib turadi ("6–9 yosh · 1–3-sinf"). Farqi kichik
ko'rinadi, oqibati katta:

| Agar yosh tanlov bo'lsa | Nima bo'ladi |
|---|---|
| Devor | kuchli 9 yoshli bola "bolalar darajasi" da zerikadi va chiqolmaydi |
| Uyat | qiynalayotgan 12 yoshli bola "kichiklar" ni tanlashdan uyaladi |
| Yolg'on | yoshni hech kim tekshirmaydi — reyting uchun hamma "kattalar" ni tanlaydi |

Yozuv esa ota-onaga kerak: u bolasiga qaysi darajani berishni bir
qarashda biladi.

**Rekord `o'yin + daraja` juftligi bo'yicha ALOHIDA saqlanadi**
(`lib/oyin/rekord.ts`). Bitta umumiy rekord bo'lganda "Qiyin" da 8 ball
olgan katta bilan "Oson" da 30 ball olgan bola bir jadvalda turardi va
ikkalasi ham o'z natijasining ma'nosini yo'qotardi.

**Qulf.** Yuqori daraja oldingisida bir necha ball to'plangandan keyin
ochiladi (10 va 15). Shart past — bir-ikki o'yin yetadi — va maqsadi
to'sish emas: hech kim isinmasdan turib eng qiyin darajaga tushib,
"juda qiyin ekan" deb tashlab ketmasin.

### O'yinni ushlab turadigan uch mexanizm

Uchalasi ham bir savolga javob beradi: *nega odam yana bir marta
o'ynaydi?*

**1. Zanjir — ketma-ket to'g'ri javoblar** (oqim o'yinlarida)

Har javob bir ball berganda o'yin TEKIS bo'lib qoladi: 40-savol
4-savoldan farq qilmaydi. Zanjir esa o'sish beradi:

| Ketma-ket | Bir javob | Qo'shimcha |
|---|---|---|
| 1–2 | 1 ball | — |
| 3–5 | 2 ball | 🔥 belgisi, +0,7 sek vaqt |
| 6+ | 3 ball | 🔥 belgisi, +0,7 sek vaqt |

Zanjir XATODA uziladi va bu shoshilishga qarshi tabiiy to'siq. Vaqt
jazosi tezlikni jazolaydi, zanjir esa ehtiyotkorlikni MUKOFOTLAYDI —
ikkalasi birga o'yinni "tez bos" dan "tez, lekin to'g'ri bos" ga
aylantiradi.

Yig'ilgan ball savol USTIDA tug'ilib, hisob tomonga uchadi (`az-ball`).
Burchakdagi songa jimgina qo'shilsa, o'yinchi buni umuman sezmasdi:
uning ko'zi savolda, hisobda emas.

**2. Rekord o'yin PAYTIDA ko'rsatiladi**

Ball eski rekorddan oshgan zahoti hisob oltin rangga o'tadi va 🏆
paydo bo'ladi. Buni oxirida aytish kech: rekordini ortda qoldirganini
bilgan odam oxirigacha o'ynaydi, bilmagan esa "baribir chiqmaydi" deb
qo'yib yuboradi.

**3. "24" da berk ko'chani aytish**

O'yinning eng og'riqli joyi shu edi: ikki sonni noto'g'ri
birlashtirgan odam berk ko'chaga kiradi va buni BILMAYDI. U qolgan
sonlarni aylantirib, vaqtini yo'qotadi va oxirida "bu topishmoqning
yechimi yo'q ekan" degan xulosaga keladi — aslida yechim bor edi,
faqat boshqa yo'lda.

Endi har birlashtirishdan keyin yechuvchi hozirgi taxtani tekshiradi
(`yechilarmi`) va 24 ga yo'l qolmagan bo'lsa aytadi, "Ortga qaytar"
esa qizarib turadi. Ogohlantirish ERTA chiqmaydi: `6, 18` da u jim
turadi, chunki `6 + 18 = 24`.

Pastdagi satr endi yig'ilayotgan ifodani ham ko'rsatadi (`8 ×`).
Ilgari u yerda ikki qatorli qoida doim turardi — birinchi
topishmoqdan keyin u hech kimga kerak emas, lekin ekranning eng
qimmatli joyini egallardi.

### O'yin nima beradi, nima bermaydi

| | |
|---|---|
| **Tanga** | beradi — ball ÷ 3, kunning birinchi o'yinida ikki barobar |
| **Kunlik zanjir** | qo'shiladi — bo'limning butun maqsadi shu |
| **Yulduz** | **BERMAYDI** |
| **Serverga yozuv** | yo'q |

Yulduz ataylab berilmaydi: u darsning o'lchovi va reyting aynan shuni
sanaydi. O'yindan yulduz berilsa, 60 soniyada yigirma ball yig'a
oladigan bola bir kechada jadval boshiga chiqib, darslarni oylab o'tgan
bolaning mehnatini ma'nosiz qilardi.

Tanga OXIRGI OCHILGAN kursga tushadi — aynan o'sha do'kon bola ochadigan
do'kon bo'ladi. Tengma-teng bo'lganda bola tangasini ko'rmay qolardi.

### "24" da nega kasr arifmetikasi

`8 ÷ (3 − 8 ÷ 3)` ning oralig'ida 1/3 chiqadi. `double` bilan
hisoblasak, oxirida 24 o'rniga 23.999999999999996 keladi — va o'yin
TO'G'RI yechimni rad etadi. "Epsilon" bilan yamash teskari nuqson
tug'diradi: 24 ga juda yaqin, ammo noto'g'ri yechim qabul qilinadi.
Shu sabab hamma hisob butun sonli kasr (`p/q`) ustida ketadi
(`lib/oyin/yigirma.ts`).

Topishmoqning darajasi ham qo'lda yozilmaydi, **hisoblanadi**:

```
faqat + va × bilan yechiladi           → 1-daraja
− yoki ÷ kerak, oraliq sonlar butun    → 2-daraja
oraliqda kasr chiqishi SHART           → 3-daraja
```

Uchinchisi eng qiziq: odam butun sonlar bilan urinib ko'radi, topa
olmaydi va "yechimi yo'q" deb o'ylaydi — aslida bor.

### Sinov

```bash
cd frontend && npx jiti scripts/oyin.ts
```

Savollar tasodifiy yasaladi va nuqsoni brauzerda ko'rinmasligi mumkin:
yuz savoldan bittasida ikkita to'g'ri variant chiqsa, uni qo'lda o'ynab
topib bo'lmaydi. Bola esa darrov topadi — va to'g'ri javob berib "xato"
degan yozuvni ko'rgan bola o'yinga qaytmaydi. Shuning uchun sinov har
generator va har daraja uchun 400 tadan savol yasab, javob variantlar
ichida va faqat BITTA marta ekanini tekshiradi. `npm run tekshir` bilan
birga ishlaydi.

### Yangi o'yin qo'shish

Oqim o'yini (savol → javob → keyingisi) uchun ikki qadam yetadi:

1. `lib/oyin/savollar.ts` ga `(daraja) => OqimSavol` funksiyasi.
2. `lib/oyin/index.ts` ga bitta qator.

O'yin ekrani (`components/oyin/Oqim.tsx`) qaysi o'yin ekanini bilmaydi —
u faqat savol so'raydi va javobni taqqoslaydi. Matnlar `lib/matn.ts` da,
"O'YINLAR" bo'limida.

## Kurslar

| Kurs | Boblar | Darslar | Nimadan boshlanadi |
|---|---|---|---|
| 1-sinf | 11 | 44 | **Ranglar va hayvonlar** — o'qish shart emas |
| 2-sinf | 10 | 38 | 100 ichida qo'shish |
| 3-sinf | 10 | 45 | 1000 ichida sonlar |
| 4-sinf | 12 | 50 | Million gacha sonlar |
| 5-sinf | 16 | 75 | Natural sonlar, kasr, foiz |
| 6-sinf | 15 | 71 | Bo'linish belgilari, manfiy sonlar |

**1-sinf alohida tuzilgan.** Bu yoshdagi bola hali o'qiy olmaydi, shuning
uchun kurs matematikadan emas, tanishdan boshlanadi: rangni topish,
hayvonni tanish, sanash. Bu darslarda javob tugmalari ham matn emas —
rangli doira yoki katta rasm. Bola savolni hech kimning yordamisiz yechadi.
Keyin asta-sekin sonlarga va amallarga o'tiladi.

**5–6-sinfda javob endi butun son emas.** Bu yoshda kasr ("3/4"), aralash
son ("2 1/2"), o'nli kasr ("0,75") va manfiy son ham javob bo'la oladi.
Javob `String(tanlangan) === String(answer)` bilan solishtirilgani uchun
matn javob ham son kabi ishlaydi, lekin u HAR DOIM bitta ko'rinishda
yasalishi shart — buning uchun `lib/generators.ts` da `fr`, `mx` va `dc`
yordamchilari bor. Manfiy javob esa faqat 6-sinfdan boshlab ruxsat
etiladi: `scripts/tekshir.ts` undan pastda uni xato deb ushlaydi.

5-sinf manbasi — B. Q. Xaydarov, "Matematika 5-sinf" (2020, ikki qism);
6-sinf — M. A. Mirzaxmedov va boshq., "Matematika 6" (O'qituvchi, 2017).
Ikkalasida ham boblar darslikning o'z tartibida boradi.

## Pastki panel — oltita tugma

Panel HAMMA ekranda turadi va o'rni hech qachon o'zgarmaydi
(`components/Panel.tsx`). Ichida oltita tugma bor:

```
Bosh  ·  Darslar  ·  Nishonlar  ·  Do'kon  ·  Reyting  ·  Ota-ona
```

**Ota-ona paneli eng o'ngda va bu ataylab.** U bolaga emas, kattaga
mo'ljallangan; bola esa panelni chapdan o'ngga o'rganadi (darslar →
nishonlar → do'kon), ya'ni oxirgi joy uning yo'lidan eng uzoq nuqta —
bexosdan bosilishi kamayadi. Kurs sahifasidagi yuqoridagi kichik tugma
o'z joyida qoldi: u yerda turgan ota-ona uni pastdan izlamaydi.

Yozuvlar `min-w-0` va `truncate` bilan chegaralangan. Bu SHART: usiz
uzun yozuv (ruscha "Родители") tugmani kengaytirib, qolgan beshtasini
siqib qo'yardi va siljiydigan belgi joyidan chiqib ketardi. Oltita yozuv
320px li telefonga ham sig'adi — ikki tilda ham tekshirilgan.

**Panelsiz ekranlar** (`YOPIQ` ro'yxati): dars, xatolar daftari, kunlik
sinov, o'yinning o'zi va kirish sahifasi. Hammasida bitta sabab —
u yerda diqqat talab qilinadi va vaqt yuradi: pastdagi tugmani
bexosdan bosgan odam yig'gan natijasini yo'qotardi. O'yinlar RO'YXATIDA
esa panel turadi, chunki u oddiy sahifa.

**Yettinchi tugma qo'shilmadi.** O'yinlar bo'limiga kirish bosh
sahifadagi katta kartadan boradi: 320px li telefonda oltita tugmaga
allaqachon ~53px dan qolgan va yettinchisi ikkala tilda ham qatorni
buzardi.

## Qobiq: veb, Telegram Mini App, APK

Ilova uch sirtda ochiladi va **dizayn uchalasida bir xil**:

```
veb   oddiy brauzer (aql-zone.uz)
tg    Telegram Mini App — botdagi tugma orqali
apk   mobil ilova ichidagi WebView (VITE_ROUTER=hash)
```

**Nega dizayn bo'linmaydi.** Ota-ona botdan ochadi, keyin noutbukda
saytga kiradi. Ikkisi boshqacha ko'rinsa, birinchi savoli: "bu o'sha
ilovami, yulduzlarim shu yerdami?" Aynan shu tashvishni yo'qotish uchun
serverda hisoblarni birlashtirish yozilgan — dizayn uni qaytarib
keltirmasligi kerak. Uch dizayn tizimi 20 ekran × 3 tema × 3 sirt degani
ham: har yangi ekran uch marta tekshirilishi kerak bo'lardi.

**Bo'linadigan narsa — RAMKA.** Telegram ichida allaqachon o'z sarlavhasi,
o'z orqaga tugmasi va o'z surish ishoralari bor; biz ularni takrorlab
qo'ysak, ilova "veb sayt Telegram'ga tiqilgan" bo'lib ko'rinadi. Hammasi
bitta faylda: `frontend/src/lib/qobiq.ts`.

| Nuqson | Yechim |
|---|---|
| **Ikkita orqaga tugmasi** — Telegram `←` chizadi, biz yana bittasini | `useOrqaga()` nativ tugmani ulaydi va bizning strelkani yashiradi |
| **Sarlavha rangi** ilova fonidan farq qilib, chok ko'rinardi | tema almashganda `setHeaderColor`/`setBackgroundColor` (`useTema` ichidan) |
| **`100dvh` noto'g'ri** — Desktop'da oyna past, telefonda klaviatura | `--az-ekran` ← `viewportStableHeight`, CSS'da `min-h-ekran` |
| **Tepadagi bo'shliq ikki marta** — Telegram "notch" ni yopgan, biz ustiga `env()` qo'shardik | `--az-tepa` ← `contentSafeAreaInset.top` |
| **Pastga surish ilovani yopardi** — dars o'rtasida halokat | `disableVerticalSwipes()` (7.7+) |
| **Kanal havolasi brauzerni ochardi** va odam ilovadan chiqib ketardi | `openTelegramLink` (`havolaniOch`) |
| Javob berilganda jismoniy javob yo'q edi | `tebrat()` — `HapticFeedback` |

Uchta CSS o'zgaruvchisi (`--az-ekran`, `--az-tepa`, `--az-past`) standart
holatda brauzerning o'z qiymatiga teng (`100dvh`, `env(safe-area-*)`) va
faqat Telegram ichida JS'dan ustiga yoziladi. Ya'ni **vebda hech narsa
o'zgarmaydi**.

Har bir Telegram chaqiruvi `try/catch` va versiya tekshiruvi ichida: 2019
yildagi mijozda `BackButton` ham yo'q, o'shanda ilova jimgina avvalgidek
ishlaydi. `useOrqaga` aynan shu holatni hisobga oladi — nativ tugma
bo'lmasa **o'zimizniki qaytadi**, aks holda ekran qaytib bo'lmaydigan
tuzoqqa aylanardi.

Ikki joyda qobiq ataylab ARALASHMAYDI: ro'yxat oynasida nativ orqaga
tugmasi ulanmaydi (u yerda chiqish yo'li dizayn bo'yicha yo'q), va
Telegram `themeParams` ranglari olinmaydi (foydalanuvchining istalgan
mavzusi bolalar ilovasining o'ziga xosligini yo'qotardi va kontrastni
kafolatlab bo'lmasdi).

### Sinov

Mini App'ni brauzerda ochib bo'lmaydi — u imzolangan `initData` talab
qiladi. Shuning uchun tarmoq soxta `window.Telegram.WebApp` bilan
tekshiriladi:

```bash
cd frontend && npm run tekshir
```

Bu ikki ishni qiladi: generatorlarni 80 martadan ishga tushiradi va
qobiqning Telegram tarmog'ini tekshiradi (`scripts/qobiq.ts`) — qaysi
chaqiruvlar ketgani, o'zgaruvchilar qanday qo'yilgani, havola qaysi
yo'ldan ketgani. Busiz bu kod **ishlab chiqarishda birinchi marta** ishga
tushardi va xatosi jim o'tardi.

## O'lchamlar va moslashuv

Bosh sahifa va kurs sahifasi ataylab ZICH: logo, chiplar, kartalar va
oraliqlar bir bo'g'in kichraytirilgan. Sabab o'lchov bilan tekshirilgan —
avval birinchi kurs kartasi 375px li telefonda 545-pikselda boshlanardi,
ya'ni odam ilovani ochib **hech qanday kursni ko'rmasdi** va skroll
qidirishga majbur bo'lardi. Hozir u 425–432 orasida turadi.

Uch narsa qat'iy o'lchamda emas, ekranga qarab o'sadi:

| Nima | Qanday | Nega |
|---|---|---|
| Logo | `min(58vw, clamp(124px, 20vh, 208px))` | past oynada (Telegram Desktop) balandlik bo'yicha ham kichrayadi |
| Kurs sarlavhasi | `clamp(20px, 5.8vw, 24px)` | "Математика 4 класс" 320px da ikki qatorga bo'linardi |
| Bosh sahifa chiplari | ikki guruh, `flex-wrap` | tor ekranda 2+2, kengida to'rttasi bir qatorda |

Chiplar aynan GURUHGA bo'lingan, bitta o'ralgan qator emas: to'rttasi bir
qatorga qo'yilganda 375px da uchtasi sig'ib, "Hisobim" yolg'iz ikkinchi
qatorga tushardi — qator qiyshiq ko'rinardi.

Tekshirilgan kengliklar: **320**, **360**, **375** va planshet — ikki
tilda ham gorizontal skroll yo'q va hech bir yozuv kesilmaydi.

## Dizayn: uchta tema

Yuqori sinf o'quvchisi "kichkinalar o'yini"ni yoqtirmaydi, 1-sinf bolasi esa
o'ta jiddiy ekranda o'zini yo'qotadi. Bosh sahifa esa ikkalasiga ham
tegishli emas — u umumiy vitrina. Shuning uchun uchta tema bor:

| | `bosh` (kurslar) | `bolalar` (1-sinf) | `katta` (2–6-sinf) |
|---|---|---|---|
| Fon | iliq qora tun, aylanuvchi oltin nur, kengayuvchi halqalar | quyoshli osmon, bulutlar, tepaliklar, pufakchalar | chuqur ko'k tun, yulduzlar, aylanuvchi 3D kublar |
| Kartalar | binafsha-qora, burchagi 24px | oq, burchagi 32px, qalin soya | ko'k shishasimon, burchagi 20px |
| Kayfiyat | qimmatbaho vitrina | o'yinchoqdek | jiddiy va nafis |

Tema `<html data-tema="...">` orqali beriladi (`frontend/src/lib/tema.ts`).

Ilk temani `frontend/index.html` dagi kichik skript **React'dan oldin** qo'yadi.
Busiz sahifa yangilanganda ekran bir lahza noto'g'ri (och) rangda
ko'rinadi — ko'z buni "oq yaltirash" sifatida ilg'aydi.
Komponentlarda `bg-karta`, `text-ink`, `shadow-clay` kabi **token** klasslari
ishlatiladi — qo'lda yozilgan oq yoki qora rang yo'q. Shuning uchun bitta
atributni almashtirish butun ilovaning rangi, radiusi, soyasi va fonini
birga o'zgartiradi.

Diqqat: soyalar ataylab `@theme` dan tashqarida turadi. Tailwind `@theme`
dagi `--shadow-*` qiymatini utility ichiga o'zgarmas qilib yozib qo'yadi,
natijada u temaga ergashmay qolardi.

### Kunlik maqsad

Kuniga 10 savol. Ikki ko'rsatkich alohida hisoblanadi: **bugungi savollar**
(yarim tunda noldan boshlanadi) va **ketma-ket kunlar** zanjiri. Sana mahalliy
vaqt bo'yicha olinadi — `toISOString()` UTC beradi va Toshkentda kechqurun
o'ynagan bola uchun kun noto'g'ri almashardi. Holat `azapp_kunlik_v1` kaliti
bilan serverga ham boradi, ya'ni boshqa qurilmada zanjir uzilmaydi.

Harakatlar: kartalar pastga aylanganda 3D ko'tariladi
(`components/Reveal.tsx`), fon parallaks bilan siljiydi, to'g'ri javobda
konfetti otiladi, xatoda savol silkinadi. `prefers-reduced-motion` yoqilgan
qurilmada barchasi o'chadi va ilova xuddi shunday ishlayveradi.

### Yangi dars qo'shgandan keyin

```bash
cd frontend && npm run tekshir
```

Generatorlar tasodifiy sonlarga tayanadi, shuning uchun xato faqat ma'lum
qiymatlarda ko'rinadi — masalan javob manfiy chiqishi yoki to'g'ri javob
variantlar ichida umuman bo'lmasligi. Skript har bir generatorni 80 martadan
ishga tushirib, shularni bola darsni ochishidan oldin tutadi.

Xuddi shu buyruq **qobiq sinovini** ham o'tkazadi (`scripts/qobiq.ts`) —
Telegram Mini App tarmog'i brauzerda tekshirib bo'lmaydigan yagona joy.
Tafsilot: "Qobiq" bo'limi.

## Hisob, kirish va profillar

Uch qavat, va aynan shu qavatlar kirishni universal qiladi:

```
Pupil     — HISOB, o'zida hech qanday kirish ma'lumoti saqlamaydi
  ├── Identity — KIRISH USULI: qurilma id, Telegram, keyin telefon/Google
  └── Profile  — BOLA: progress hisobga emas, shu yerga bog'lanadi
```

Yangi kirish usuli qo'shish uchun sxema o'zgarmaydi — `Identity` ga
yangi `provider` qiymati yoziladi va o'sha usulni tekshiradigan view
qo'shiladi. Qolgan hamma narsa `auth.hisob_topish()` dan o'tadi.

Anonim hisobni Telegram'ga bog'lash progressni yo'qotmaydi: bitta bola
bo'lsa ikki tomon qo'shiladi, bir nechta profil bo'lsa ular alohida
ko'chadi (`views.auth_link`).

Profil `localStorage` kalitiga ham qo'shiladi (`azapp_grade1_v1::3`),
shuning uchun bir telefonda ikki farzand internetsiz o'ynasa ham
yulduzlari aralashmaydi. Serverga esa kalitning sodda ko'rinishi boradi —
u allaqachon profil bo'yicha ajratadi.

### Telegram orqali kirish — ikki joyda

| | Telegram Mini App | Veb sayt (aql-zone.uz) |
|---|---|---|
| Nima keladi | `initData` — imzolangan satr | bir martalik kod (`/kirish/<kod>`) |
| Kim tasdiqlaydi | Telegram imzosi | botning o'zi — u kimligini biladi |
| Foydalanuvchi | hech narsa bosmaydi, o'zi kiradi | "Telegram bilan kirish" → bot → havola |

**Veb saytda Login Widget ISHLATILMAYDI.** Widget uchun BotFather'da
`/setdomain` qilish shart, u o'z iframe'ini chizadi (uni tema bilan
bo'yab bo'lmaydi) va telefonda qo'shimcha oyna ochadi. Bot esa allaqachon
bor va foydalanuvchi kimligini biladi — shuning uchun eng qisqa yo'l:

```
sayt: "Telegram bilan kirish"  →  t.me/<bot>?start=kirish
bot:  "✅ Saytga kirish"        →  {SAYT_URL}/kirish/<kod>
sayt: ism-familiya              →  faqat BIRINCHI marta, keyin to'g'ridan
                                   to'g'ri ilova ochiladi
```

Ism-familiya faqat ro'yxatdan o'tmagan hisobdan so'raladi. Botdagi havola
kirishning odatiy yo'li va odam uni har kuni bosishi mumkin — har safar
to'ldirilgan maydonlarni tasdiqlatish keraksiz bosqich bo'lardi.

Kod bir soat amal qiladi va shu muddat ichida QAYTA ishlatiladi
(`KirishKodi`). Bazada faqat uning sha256 xeshi turadi, xuddi sessiya
tokeni kabi. Yangi `/start` eski havolani darhol bekor qiladi — suhbatda
yotib qolgan havola bilan hech kim kira olmaydi.

**Kod avval bir martalik edi va bu amalda ishlamadi.** Havolani bir marta
ochish deyarli hech qachon bir so'rov bilan tugamaydi: Telegram uni O'Z
brauzerida ochadi, odam keyin "boshqa brauzerda ochish" ni bosadi,
suhbatdagi tugmaga qayta bosiladi, brauzer havolani oldindan yuklaydi.
Har birida natija bir xil edi — odam tugmani bosadi, sayt esa "kiring"
deb qaytaradi. Ya'ni himoya foydalanuvchini o'z hisobidan to'sardi.
Endi cheklov faqat vaqt va yangi `/start`.

Bot nomi frontendga yig'ish paytida emas, `/api/health` orqali boradi —
botni almashtirish uchun ilovani qayta yig'ish shart emas.

Bola avval mehmon sifatida o'ynab, keyin Telegram bilan kirsa, yulduzlari
yo'qolmaydi: `auth/kod` ikki hisobni birlashtiradi va nizoda yulduzi
ko'proq qiymat ustun turadi.

### Kirish darvozasi

Ro'yxatdan o'tmagan hisob ilovaga kirganda KIRISH ekrani chiqadi
(`frontend/src/components/Kirish.tsx`) va u yerda BITTA tugma bor:
Telegram. Kirgandan keyin ism-familiya so'raladi — Telegram bergani
allaqachon yozilgan bo'ladi, odam odatda shunchaki "Davom etish" ni
bosadi. Familiya shart, chunki reytingda "Ali" ismli o'nta bola bir xil
ko'rinadi va jadval ma'nosini yo'qotadi.

**Nega "qo'lda kiritish" yo'q.** Ism-familiyani o'zi yozgan odam hech
narsani isbotlamaydi: hisobni boshqa qurilmada tiklab bo'lmaydi,
reytingda istalgan nom bilan ikkinchi hisob ochib olish mumkin va
progress brauzer tozalanishi bilan yo'qoladi. Telegram uchalasini ham bir
bosishda hal qiladi.

Ikki holat darvozani OCHIQ qoldiradi: server javob bermasa (internetsiz
bola darsga kira olishi kerak — ilova offline ishlash uchun qurilgan) va
`/kirish/<kod>` sahifasida (aks holda cheksiz halqa bo'lardi).

Havola eskirganda tupik chiqmaydi: xato matni o'rniga o'sha kirish
ekranining o'zi ko'rsatiladi, ya'ni "Telegram bilan kirish" tugmasi
joyida turadi va odam yangi havolani shu yerdan oladi.

**Kirish va anonim kirish POYGA QILMAYDI.** `kodBilanKir` avval
`signIn()` ni kutadi. Ikkalasi bir vaqtda ketganda xato JIM o'tardi:
kod so'rovi Bearer'siz ketib, server hisoblarni birlashtirmasdi, keyin
qurilma kirishi o'z tokenini ustiga yozardi — bola "kirdim" deb
o'ylardi, ism esa anonim hisobga saqlanardi.

Bitta istisno: **server javob bermasa darvoza o'tkazib yuboradi.**
Internetsiz bola darsga kira olmay qolishi ro'yxatdan muhimroq — ilova
offline ishlash uchun qurilgan. Aloqa tiklanganda darvoza yana so'raydi,
reyting esa serverda baribir faqat ro'yxatdan o'tganlarni oladi.

### Reyting

Ikki jadval (`/reyting`):

| | Nima sanaladi | Qachon yangilanadi |
|---|---|---|
| **Jami** | `Progress.stars` — butun vaqt | darhol |
| **Shu hafta** | `LessonResult.stars` yig'indisi | har dushanba noldan |

Faqat "jami" bo'lganda jadval bir necha oyda qotib qoladi: yangi kelgan
bola oldingilarni quvib yeta olmaydi va reyting unga ma'nosiz bo'ladi.
Haftalik jadval hammani teng sharoitga qo'yadi.

O'z o'rning javobda ALOHIDA keladi (`men`) — 100 talikka kirmasang ham
pastda ko'rinadi. Ro'yxatda o'zini ko'rmagan bola uchun reyting begona
odamlar jadvaliga aylanadi.

## Offline

`frontend/public/sw.js` ikki strategiya ishlatadi:

* `/assets/*` — nomida xesh bor, mazmuni o'zgarmaydi → keshdan
* sahifa — avval tarmoq, bo'lmasa kesh (yangi versiya darhol yetib borsin)
* `/api/*` — **hech qachon keshlanmaydi**: eskirgan progressni qaytarish
  uni yo'qotishdan ham yomon, chunki mijoz uni to'g'ri deb qabul qilib
  ustiga yozib yuboradi

Yangi versiya chiqqanda ilova o'zi qayta yuklanmaydi — pastda "yangilash"
tugmasi chiqadi. Bola dars o'rtasida bo'lishi mumkin.

## Ikki til: o'zbekcha va ruscha

Til butun ilovaga taalluqli — interfeys, bob va dars nomlari, animatsion
tushuntirishlar va **savollarning o'zi**. Ya'ni ruscha tanlagan bola
matematikani ruscha o'qiydi, harflar bobida esa lotin emas, **kirill**
alifbosini ko'radi (`activity.ts`, `HARFLAR_RU`).

```
frontend/src/lib/til.ts              til holati — modul darajasida
frontend/src/lib/matn.ts             interfeys matnlari
frontend/src/lib/tarjima/savol.ts    savol matnlari
frontend/src/lib/tarjima/kurs.ts     bob, dars va kurs nomlari
frontend/src/lib/activity.ts         ma'lumot ro'yxatlari (rang, hayvon, meva…)
backend/core/matn.py                 bot va eslatma xabarlari
```

**Til React kontekstida turmaydi.** Sabab: savol generatorlari sof
funksiyalar va komponentdan tashqarida chaqiriladi — hook ularga yetib
bormaydi. Shuning uchun `til()` istalgan joydan o'qiladi.

**Almashtirilganda sahifa qayta yuklanadi.** Kurslar ro'yxati va bob
nomlari modul yuklanganda bir marta yasaladi; ularni yugurib turgan
ilovada birma-bir almashtirish albatta biror joyda eski matn qoldiradi.
Bir soniyalik narx — evaziga ekranda ikki til aralashib qolmaydi.
Profil almashtirish ham xuddi shu yo'ldan boradi.

**Almashtirgich ekranning eng tepasida** (`components/TilTugma.tsx`) —
bosh sahifada o'ng chetda, kurs sahifasida yulduz-tanga yonida. Sozlamalar
ichida ham bor, lekin u yerda YETARLI EMAS: noto'g'ri tilda ochilgan
ilovada odam sozlamalar tugmasini ham o'qiy olmaydi. Tugma ikki bo'lakli
(`UZ | RU`) va ikkala til bir vaqtda ko'rinadi — aylanadigan bitta tugma
bo'lsa, "hozir qaysi til?" degan savol har safar paydo bo'lardi.

**Ilk ochilishda til bir marta so'raladi** (`components/TilTanlash.tsx`).
Brauzer tili taxmin beradi, lekin taxmin ko'p yerda yolg'on chiqadi:
telefon ruscha sozlangan-u, bola o'zbek maktabida o'qiydi. Noto'g'ri
tilda ochilgan ilovada esa ota-ona til tugmasini o'zi o'qiy olmaydigan
ekran ortidan izlashi kerak bo'ladi. Ekran sarlavhasi ikki tilda yozilgan
— o'sha payt foydalanuvchi qaysi tilni o'qiy olishini bilmaymiz.

### Ruscha kelishik tuzog'i

O'zbekchada savol qo'shimcha bilan yasaladi ("olmani top"), ruschada esa
ot kelishikka kiradi va sifat jinsga qarab o'zgaradi: `красное яблоко`,
lekin `красную клубнику`. Shu sabab **ruscha savollar bosh kelishikda
turadigan qolipga solingan**:

| O'zbekcha | Ruscha | Nega |
|---|---|---|
| `Qizil olmani top!` | `Где красное яблоко?` | tushum kelishigi kerak emas |
| `Ayiq qanday ovoz chiqaradi?` | `Как говорит медведь?` | qaratqich kelishigi kerak emas |
| `Nechta olma?` | `Сколько их?` | ko'plik shakli kerak emas |
| `Qaysi biri baland?` | `Что выше?` | daraja shakli jinsga bog'lanmaydi |

Ikki joyda ot jinsi baribir kerak bo'ladi va u ma'lumotning o'zida
turadi: mevalarda `r` maydoni (`"n"` — `яблоко`), ranglarda esa uchala
shakl (`ru`, `ruF`, `ruN`). `rangSifat(hex, rod)` shu ikkisini
kelishtiradi.

Sonlar bilan kelgan otlar ruschada uch shaklga kiradi ("1 предмет",
"2 предмета", "5 предметов") va qolipda uni to'g'ri chiqarib bo'lmaydi.
Shuning uchun bunday joylarda **raqam** ishlatiladi: `Всего 3!`,
`Пучков: 2, палочек: 5.`

### Serverga til nega kerak

Ilovaning o'ziga kerak emas — u tilni `localStorage` da saqlaydi.
`Pupil.til` esa **server yozadigan** xabarlar uchun: eslatma, botdagi
javoblar. Ular ilova yopiq bo'lganda ketadi, ya'ni qurilmadagi sozlamani
so'rab olishning iloji yo'q.

Qiymat ikki manbadan keladi va tartib muhim:

1. **Mavjud hisobda** — ilovada tanlangan til (`PATCH /api/v1/me`).
2. **Yangi hisobda** — Telegram bergan `language_code`.

Ikkinchisi faqat zaxira: Telegram interfeysi ruscha bo'lgani "darslarni
ham ruscha o'qiydi" degani emas. Lekin /start ga javob birinchi aloqa
bo'ladi va u odam o'qiy oladigan tilda bo'lishi kerak — aks holda u
tugmani bosmaydi.

### Yangi matn qo'shganda

Lug'atdagi qiymat `[o'zbekcha, ruscha]` juftligi, `satisfies` bilan
tekshiriladi — ya'ni bir tilni unutish **tiplar tekshiruvida** tutiladi,
ekranda emas. Kurs va dars nomlari esa boshqacha: u yerda kalit
o'zbekcha matnning O'ZI (`tarjima/kurs.ts`), tarjimasi topilmasa
o'zbekchasi qoladi. Shu sabab yangi dars qo'shish hech narsani buzmaydi —
u shunchaki lug'atga tushmaguncha bir tilda ko'rinadi.

## Ovoz

**Yoniq.** O'zbekcha talaffuz serverdagi TTS orqali keladi (Aisha,
"Gulnoza" ovozi): `GET /api/v1/ovoz?matn=olma` audio faylning o'zini
qaytaradi va server uni abadiy keshlaydi. Kichkintoylar bo'limi busiz
yarim ishlaydi — 3 yoshli bola yozuvni o'qiy olmaydi.

Uch manba: server TTS → `frontend/public/audio/` dagi tayyor mp3 →
brauzer ovozi. Oxirgisi **faqat ruscha**: brauzerda `uz-UZ` ovozi
deyarli yo'q va u "qo'y" ni "ko-y" deb o'qiydi — noto'g'ri talaffuz jim
turgandan yomonroq.

Xarajat uch qavat bilan cheklangan: oq ro'yxat (faqat
`backend/core/lugat/*.txt` dagi matn yasaladi), token va kunlik belgi
chegarasi. Ro'yxat eng muhimi — dars savollari tasodifiy sonlar bilan
yasaladi, ya'ni ularsiz har savol yangi to'lov bo'lardi.

Sozlash, lug'atni tayyorlash va yangi so'z qo'shish — `OVOZ-README.md`.

## Testlar

```bash
cd backend && .venv/Scripts/python.exe manage.py test
cd frontend && npm run tekshir && npm run lint && npm run build
```

**Diqqat:** frontend tiplarini tekshirish uchun `npx tsc --noEmit` ISHLAMAYDI —
ildiz `tsconfig.json` da `"files": []` va faqat havolalar bor, ya'ni bu
buyruq hech narsani tekshirmaydi va doim 0 qaytaradi. To'g'ri buyruq:

```bash
cd frontend && npx tsc -b
```

`npm run build` ham ichida `tsc -b` ni chaqiradi, shuning uchun u yetarli.

## Eslatma boti

```bash
cd backend
.venv/Scripts/python.exe manage.py eslatma --sinov   # kimga borishini ko'rsatadi
.venv/Scripts/python.exe manage.py eslatma           # yuboradi
```

Buyruq o'zi rejalashtirmaydi — uni kuniga bir marta Windows Task Scheduler
yoki cron chaqiradi. Xabar faqat Telegram'i bog'langan, bugun o'ynamagan
va oxirgi 14 kunda faol bo'lgan bolalarga ketadi.

## Telegram bot va Mini App

Ota-ona bot orqali keladi, bitta tugma bosadi va ilovaga tushadi:

```
/start
  → salom + "✅ Saytga kirish" (bir martalik havola, 1 soat)
  → havola bosiladi, sayt o'zi kiradi, ism-familiya so'raladi
/raqam
  → "📱 Raqamni yuborish" — ixtiyoriy, eslatma va tiklash uchun
```

Raqam endi MAJBURIY EMAS. Ilgari u yagona tanish belgisi edi, endi esa
Telegram hisobining o'zi shu ishni bajaradi. Raqam faqat eslatma
yuborishda va hisobni tiklashda foyda beradi, shuning uchun uni so'rab
kirishni to'sish ortiqcha to'siq bo'lardi.

**Ishga tushirish.** Mini App HTTPS talab qiladi, shuning uchun sinov uchun tunnel:

```bash
cloudflared tunnel --url http://localhost:8787
```

`backend/.env` ga yozing: BotFather tokenini `BOT_TOKEN` ga, bot nomini
`BOT_USERNAME` ga, tunnel manzilini `CSRF_TRUSTED_ORIGINS`, `SAYT_URL` va
`MINI_APP_URL` ga. **`SAYT_URL` bo'sh bo'lsa kirish havolasi yasalmaydi** —
bot buni ishga tushganda ogohlantirib aytadi. So'ng botni yoqing:

```bash
cd backend && .venv/Scripts/python.exe manage.py bot
```

Bot **long polling** bilan ishlaydi, webhook emas — webhook uchun doimiy
HTTPS manzil va sertifikat kerak, polling esa noutbukda ham serverda ham
bir xil ishlaydi. Yuk ortganda webhook'ga o'tish oson:
`yangilikni_qayta_ishla()` tarmoq mantiqidan mustaqil yozilgan.

### Telefon raqami

Raqam alohida ustunda emas, `Identity(provider="phone")` da turadi — ya'ni
qurilma va Telegram bilan bir qatorda. Shu sabab keyinchalik SMS orqali
kirish qo'shilsa, model umuman o'zgarmaydi.

Ikki himoya bor: raqam faqat foydalanuvchi tugmani BOSGANDA keladi (Telegram
boshqa yo'l bermaydi), va bot begona vizitkani rad etadi — `contact.user_id`
yuboruvchi bilan solishtiriladi.

### Ism va familiya

Ism ikki manbadan keladi va ular to'qnashishi mumkin edi: Telegram'ga har
kirganda ism o'sha yerdan yangilanadi, foydalanuvchi esa uni ilovada o'zi
tahrirlashi mumkin. `ism_qolda` bayrog'i shu ikkisini ajratadi — qo'lda
yozilgan ism keyingi kirishda o'chib ketmaydi.

Ism-familiya **hisobga** tegishli (odatda ota-ona), bolalar ismi esa
profillarda. Ikkisi alohida.

## APK / iOS

`file://` da chiroyli manzillar ishlamaydi, shuning uchun hash kerak:

```bash
cd frontend && VITE_ROUTER=hash npm run build
```

Bitta o'zgaruvchi ham marshrutni, ham asset yo'llarini birga almashtiradi.
Ilova baribir shu backendga ulanadi: qurilma id bilan anonim kiradi, bola
xohlasa keyin Telegram'ga bog'laydi va progress yo'qolmaydi.
