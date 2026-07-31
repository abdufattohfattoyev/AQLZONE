# TZ — Duel, reyting va kunlik maydon

Bu hujjat **maslahat olish uchun** yozilgan: uni o'qigan odam (yoki AI)
loyihaning kodini ko'rmasdan turib ham aniq fikr ayta olishi kerak.
Shuning uchun bu yerda faqat "nima qilinsin" emas, **qanday cheklovlar
bor** va **qaysi qaror nega qabul qilingan** ham yozilgan — maslahat
aynan shu joylarga kerak.

Sana: 2026-07-31 · Loyiha: **Aql Zone** (https://aql-zone.uz)

---

## 1. Loyiha haqida

4 yoshdan 4-sinfgacha matematika o'rgatadigan veb-ilova. Bola yo'l
xaritasi bo'ylab yuradi, har darsda 6 ta savol yechadi va yulduz
yig'adi. **Savollar har safar qaytadan yasaladi** — darsni ikkinchi
marta ochsa, sonlar boshqacha bo'ladi.

Ilova uch sirtda ishlaydi va dizayn bir xil:

| Sirt | Manzil |
|---|---|
| Veb | `aql-zone.uz` |
| Telegram Mini App | `@Aqlzone_bot` ichida |
| Android WebView (APK) | hash-router bilan |

Butunlay bepul, reklamasiz, internetsiz ham ishlaydi (Service Worker).

### Hozirgi hajm (2026-07-31, jonli server)

| | |
|---|---|
| Ro'yxatdan o'tgan foydalanuvchi | **30** |
| Jami hisob (anonim + ro'yxatdan o'tgan) | 175 |
| Bola profillari | 177 |
| Yechilgan dars natijalari | 297 |
| Darslar | 259 ta dars, 65 bob, 5 kurs |
| Tillar | o'zbekcha, ruscha (savollargacha to'liq) |

**Bu son juda muhim.** Har qanday "ikki kishilik jonli" xususiyat
loyihalanayotganda 30 kishilik baza hisobga olinishi shart: bir vaqtda
onlayn bo'lgan ikki odam deyarli hech qachon uchramaydi.

---

## 2. Texnik holat va cheklovlar

### Backend

- **Django 5.2 + Django REST Framework**, tashqi paket deyarli yo'q
  (CORS, throttling, statik fayl — hammasi Django/DRF ning o'zida).
- **SQLite**. Docker volume ichida, konteyner qayta qurilganda qoladi.
- **gunicorn, sinxron worker × 3**. ASGI emas, WSGI.
- **Celery / Redis / navbat tizimi YO'Q.**
- Fon ishlari: `threading.Thread` (e'lon tarqatish, adminga xabar) va
  cron orqali `manage.py` buyruqlari (eslatma, qaytarish zanjiri).
- Telegram boti — **long polling**, alohida konteyner, `urllib` bilan
  yozilgan (aiogram ishlatilmaydi).
- Autentifikatsiya — **Bearer token**, cookie yo'q. Telegram Mini App
  `initData` imzosi orqali kiradi.

### Frontend

- **React 19 + TypeScript + Vite 8 + Tailwind 4**, react-router 7.
- Butun o'yin mantig'i **mijozda**. Savollar sof funksiyalar bilan
  yasaladi (`lib/generators.ts`, `lib/oyin/savollar.ts`) — server savol
  saqlamaydi va yubormaydi.
- Progress `localStorage` + serverga sinxronlash. Internetsiz to'liq
  ishlaydi.

### Deploy

- Docker Compose, bitta VPS. Oldida boshqa loyihaga tegishli nginx
  konteyneri turadi (portlar band, shuning uchun bu loyiha port ochmaydi
  va nginx unga nomi bilan murojaat qiladi).
- Migratsiyalar konteyner ishga tushganda avtomatik qo'llanadi.

### Shundan kelib chiqadigan qat'iy cheklovlar

1. **WebSocket hozircha yo'q va uni qo'shish arzon emas** — Channels +
   Redis + ASGI server + nginx sozlamasi kerak.
2. **SQLite ko'p yozuvni yoqtirmaydi** — sekundiga o'nlab yozuv chegara.
3. **Server savolni tekshira olmaydi**: generatorlar TypeScript'da.
   Ularni Python'ga ko'chirish ikki nusxa kod degani va ikkalasi bir kun
   kelib bir-biridan farq qila boshlaydi.

---

## 3. Allaqachon ishlaydigan xususiyatlar

Yangi xususiyat shularning ustiga qo'shiladi, ularni buzmasligi kerak:

| Xususiyat | Izoh |
|---|---|
| Yo'l xaritasi, 259 dars | har safar yangi savollar |
| Xatolar daftari | xato qilingan savol turi 1 / 3 / 7 kundan keyin qaytadi |
| Kunlik maqsad va **zanjir** | oyiga bitta qoldirilgan kun kechiriladi |
| Zanjirni tanga bilan tiklash | uzilgan kuni, haftada bittadan ko'p emas |
| Kunlik sinov | 6 savol, faqat bugun, tangasi ikki barobar |
| **Haftalik liga** | 20 kishilik guruh, ko'tarilish va tushish |
| Nishonlar, tangalar do'koni | tulkini bezash |
| **8 ta matematik o'yin** | 3 daraja, rekord qurilmada |
| **Bugungi maydon** (yangi) | 3 bosqich, kuniga bir marta, hammaga bir xil savol |
| Ota-ona paneli | haftalik faollik, qiyin mavzular |
| Telegram bot | kirish havolasi, eslatma, e'lon tarqatish, qaytarish zanjiri |

### "Bugungi maydon" — allaqachon yozilgan, muhim asos

Har kuni 3 bosqich (8 ta o'yindan tanlanadi), har biriga 45 soniya,
kuniga bitta urinish, yarim tunda yopiladi.

**Savollar kun urug'idan yasaladi** (`lib/oyin/urug.ts`): sana → xesh →
son → o'sha son bilan `Math.random` vaqtincha almashtiriladi va
generatorlar chaqiriladi. Natijada **hamma bir xil savolni bir xil
tartibda ko'radi**, server esa savol yubormaydi — faqat urug' (bir son).

Bu duel uchun ham asos bo'ladi: **duelda ham server savol emas, urug'
yuboradi.**

Hozircha maydon natijasi **faqat qurilmada** saqlanadi — server jadvali
hali yo'q. Bu ham shu TZ ichiga kiradi.

---

## 4. Yangi xususiyat: DUEL

### 4.1 Maqsad

Ikki o'yinchi **bir xil savollarni** yechadi, ko'p ball to'plagani
yutadi. Maqsad — har kuni qaytish uchun ijtimoiy sabab yaratish va
o'yinchilarning bir-birini olib kelishi.

### 4.2 Ikki rejim

**A. Asinxron duel (birinchi bo'lib qilinadi)**

O'yinchi o'ynaydi → natijasi **chaqiruv** bo'lib qoladi → istalgan odam
istalgan payt uni ochib o'ynaydi → ikkalasiga botdan xabar ketadi.

Bu yerda "raqib topilmadi" degan holat **umuman yo'q**: har bir o'ynagan
odam keyingi odam uchun raqib bo'ladi. 30 kishilik bazada yagona
ishlaydigan variant shu.

**B. Jonli duel (ikkinchi bosqich)**

Ikkalasi bir vaqtda o'ynaydi, ekranda raqibning bali o'sib boradi.

Texnik yechim: **WebSocket EMAS, 2 soniyalik so'rov**. Sabab —
savollar allaqachon ikkala qurilmada bor, tarmoq bo'ylab faqat **ball**
yuradi (bir necha bayt). Bitta duel = sekundiga ~1 so'rov. 20 ta duel
bir vaqtda = 20 so'rov/s — hozirgi server buni sezmaydi.

WebSocket'ga o'tish chegarasi: bir vaqtda **150+** duel.

### 4.3 Duel qoidalari

| | |
|---|---|
| Davomiyligi | 60 soniya |
| O'yin turi | bittasi (8 tadan tanlanadi, ikkalasiga bir xil) |
| Savollar | urug'dan, bir xil, bir xil tartibda |
| Xato | −3 soniya |
| Kombo | 3 ta ketma-ket to'g'ri → ×2 ball, 6 ta → ×3 |
| G'alaba | ko'p ball. Teng bo'lsa — kam xato qilgani |
| Ekranda | ikki chiziq: siznikí va raqibniki |

Raqibning bali **2 soniya kechikib** keladi va bu ataylab: aniq real
vaqt kerak emas, "u meni quvib yetyapti" hissi kerak.

### 4.4 Juftlash — reyting bo'yicha, DARAJA bo'yicha emas

Bu qaror muhim va sababi bor:

- **Daraja — o'yinchi o'zi tanlaydigan narsa**, ya'ni unga ishonib
  bo'lmaydi: reyting uchun hamma "oson" ni tanlab qo'yadi.
- **Daraja bo'yicha bo'lish 30 kishilik havzani uchga bo'ladi** va
  juftlashni uch barobar qiyinlashtiradi.
- Reyting esa o'ynab topiladi va uni aldab bo'lmaydi. Kuchli 8 yoshli
  bola va bo'sh 30 yoshli odam tabiiy ravishda bitta bandga tushadi.

**Savolning darajasini juftlik hal qiladi**, o'yinchi emas.

#### Qidiruv zinalari (hech qachon bo'sh qaytmaydi)

| Vaqt | Kim qidiriladi | Reyting ta'siri |
|---|---|---|
| 0–3 s | ±50 reyting | to'liq |
| 3–6 s | ±150 | to'liq |
| 6–10 s | hamma; savollar **kuchsizroq** o'yinchi darajasida | yarmi |
| 10 s | **arvoh** — o'sha banddagi haqiqiy o'yin yozuvi | yarmi |
| arvoh yo'q | **mashq raqibi** — yasalgan egri chiziq | **yo'q** |

Oyna **ikki tomonlama** (`1000 → 950–1050`, keyin `850–1150`, keyin
hamma), bir tomonlama emas: aks holda kuchsiz o'yinchi doim o'zidan
kuchlisi bilan o'ynab, doim yutqazadi.

#### Arvoh raqib

Har duel serverda yoziladi: qaysi soniyada nechta ball bo'lgani (60 ta
kichik son). Raqib topilmasa o'sha yozuvlardan biri qaytariladi va
ekranda jonli o'ynayotgandek harakatlanadi.

Ikki qat'iy shart:

1. **Yolg'on gapirilmaydi** — ismi yonida "arvoh" belgisi va
   *"Aziz (kechagi o'yini)"* deb yoziladi.
2. Kuchi o'yinchining ballidan **±20%** oralig'idan tanlanadi.

#### Mashq raqibi

Hech kim o'ynamagan bandda arvoh ham bo'lmaydi. O'shanda server sun'iy
egri chiziq yasaydi: 60 soniyada shu darajaning o'rtacha tezligida,
biroz tebranib javob beradigan raqib. Ismi **"Mashq raqibi"**, robot
belgisi bilan. **Reytingga umuman tegmaydi.**

### 4.5 Reyting — Elo

**Boshlang'ich qiymat: 1000** (0 emas).

Sabablari: 0 dan boshlagan odam birinchi mag'lubiyatdayoq manfiy songa
tushadi; 0 va 30 orasidagi farq o'lchovsiz ko'rinadi; 1000 esa tanish
belgi va uni tushuntirish kerak emas.

```
Kutilgan = 1 / (1 + 10^((raqib − siz) / 400))
Yangi    = Eski + K × (natija − kutilgan)
```

`natija`: yutdi = 1, durang = 0.5, yutqazdi = 0.

| Siz | Raqib | Kutilgan | Yutsa | Yutqazsa |
|---|---|---|---|---|
| 1000 | 1000 | 50% | +12 | −12 |
| 1000 | 900 | 64% | +9 | −15 |
| 1000 | 1300 | 15% | +20 | −4 → **−2** |
| 1300 | 1000 | 85% | +4 | −20 |

**Qo'shimcha qoidalar:**

- `K = 24` odatda, **birinchi 5 duelda `K = 80`** — yangi o'yinchi o'z
  darajasiga 30 ta duelda emas, 5 tada chiqsin. O'sha paytda ekranda
  raqam emas, *"Darajangiz aniqlanmoqda — yana 3 duel"* turadi.
- Reyting farqi **150 dan katta** bo'lsa yutqazish jarimasi **yarmi**,
  **300 dan katta** bo'lsa **umuman kamaymaydi**.
- **Pastki chegara 800** — undan pastga tushmaydi.
- **Vaqt o'tgani uchun kamaymaydi.** Har kuni qaytish uchun zanjir bor,
  ikkinchi jazo ortiqcha.
- **Bitta umumiy reyting**, har o'yin turi uchun alohida emas —
  yana o'sha sabab: bo'lish juftlash havzasini qiritadi.

**Bandlar** (raqam yolg'iz turmasin):

| Reyting | Nom |
|---|---|
| 800–999 | Bronza |
| 1000–1199 | Kumush |
| 1200–1399 | Oltin |
| 1400–1599 | Olmos |
| 1600+ | Usta |

**Reyting yulduz va liga bilan ARALASHMAYDI:**

| O'lchov | Nimani o'lchaydi |
|---|---|
| Yulduz | qancha mehnat qilingan (darslar) |
| Liga | shu haftadagi faollik |
| Reyting | mahorat — boshqalarga nisbatan |

### 4.6 Rozilik va UX

**Kutish paytida savol berilmaydi.** *"O'z darajangizda raqib yo'q,
kuchliroq izlansinmi?"* degan oyna uch sababdan yomon: bolada javob
beradigan ma'lumot yo'q; "Yo'q" tugmasi hech qayerga olib bormaydi
(baribir arvoh beriladi); har qo'shimcha bosish odam yo'qotadi.

**Rozilik raqibni KO'RGAN paytda so'raladi:**

```
        Raqibingiz topildi
   🦊  Aziz
       420 reyting · sizdan kuchli
   Savollar sizning darajangizda bo'ladi.
   Yutqazsangiz reyting kamaymaydi.
   [ Boshlash ]        Boshqa raqib
```

Sozlamalarda bir martalik tanlov: `☐ Faqat o'z darajamdagi raqiblar`
(standart holda **o'chiq**).

### 4.7 Aldashga qarshi

Server savolni qayta hisoblay olmaydi (generatorlar TypeScript'da),
shuning uchun **chegara tekshiruvi**:

- ballning o'sish tezligi sekundiga 3 dan oshmasin;
- duel davomiyligi 60 ± 3 soniya bo'lsin;
- bitta duelga bitta yakuniy natija (takroriy yuborish rad etiladi).

### 4.8 Aloqa uzilishi

10 soniya belgi kelmasa raqib "chiqib ketgan" deb belgilanadi va
qarshi tomonga g'alaba yoziladi — **lekin reyting ochkosining yarmi**.
Bu qasddan uzib ketishni foydasiz qiladi.

---

## 5. Ma'lumotlar modeli (taklif)

```python
class Duel(models.Model):
    urug = models.BigIntegerField()            # savollar shundan yasaladi
    oyin = models.CharField(max_length=16)     # "tezkor", "jadval", ...
    daraja = models.SmallIntegerField()        # 1..3
    rejim = models.CharField(max_length=10)    # "jonli" | "asinxron"
    holat = models.CharField(max_length=10)    # "kutyapti"|"ketyapti"|"tugadi"
    boshlandi = models.DateTimeField(null=True)
    created_at = models.DateTimeField(default=timezone.now)

class DuelAzo(models.Model):
    duel = models.ForeignKey(Duel, related_name="azolar")
    profile = models.ForeignKey(Profile, null=True)   # arvoh/bot uchun null
    tur = models.CharField(max_length=8)        # "odam"|"arvoh"|"bot"
    ball = models.IntegerField(default=0)
    xato = models.IntegerField(default=0)
    sanoq = models.JSONField(default=list)      # 60 ta son — arvoh uchun yozuv
    oxirgi_belgi = models.DateTimeField(null=True)
    tugadi = models.BooleanField(default=False)

class Reyting(models.Model):
    profile = models.OneToOneField(Profile)
    ochko = models.IntegerField(default=1000)
    duellar = models.IntegerField(default=0)    # K ni tanlash uchun
    galaba = models.IntegerField(default=0)

class MaydonNatija(models.Model):             # kunlik maydon jadvali
    profile = models.ForeignKey(Profile)
    kun = models.DateField()
    ball = models.IntegerField()
    savollar = models.IntegerField()
    class Meta:
        constraints = [UniqueConstraint(fields=["profile", "kun"], ...)]
```

---

## 6. API (taklif)

| Metod | Manzil | Nima qiladi |
|---|---|---|
| `POST` | `/api/v1/duel/navbat` | navbatga qo'yadi; javobda duel id, urug', o'yin, daraja, raqib haqida ma'lumot |
| `POST` | `/api/v1/duel/<id>/ball` | o'z balini yuboradi, raqibnikini qaytaradi (jonli rejimda har 2 s) |
| `POST` | `/api/v1/duel/<id>/yakun` | natijani yopadi, reytingni hisoblaydi |
| `GET` | `/api/v1/duel/chaqiruvlar` | asinxron chaqiruvlar ro'yxati |
| `POST` | `/api/v1/maydon` | kunlik maydon natijasini yuboradi |
| `GET` | `/api/v1/maydon` | bugungi top-20, o'z o'rni, bugun nechta odam o'ynagani |

---

## 7. Ekranlar

O'yinlar bo'limi hozir shunday tuzilgan (yaqinda qayta tizildi):

```
🏟  BUGUNGI MAYDON          ← eng katta, yashil, muddat bilan
    3 bosqich · hammaga bir xil savol

MASHQ
[8 ta o'yin kartasi, kichik]
```

Duel **ikkinchi karta** bo'lib maydon ostiga qo'shiladi:

```
⚔️  DUEL                        🏆 Kumush · 1240
    Tasodifiy raqib · 60 soniya
    [Raqib topish]  [Do'stni chaqirish]
```

"Do'stni chaqirish" botdan havola yuboradi — Mini App, rangli tugma va
botdan xabar yuborish allaqachon ishlaydi.

---

## 8. Bosqichlar

| № | Nima | Baho |
|---|---|---|
| 1 | Server: `MaydonNatija` + kunlik jadval API | 1 kun |
| 2 | Server: `Duel`, `DuelAzo`, `Reyting` + 3 endpoint | 1–2 kun |
| 3 | Asinxron duel: chaqiruv qoldirish va qabul qilish | 1 kun |
| 4 | Duel ekrani (mavjud `Oqim` ustiga raqib chizig'i) | 1 kun |
| 5 | Arvoh raqib: yozib olish va qaytarish | 0.5 kun |
| 6 | Botdan chaqiruv | 0.5 kun |
| 7 | Jonli rejim (2 s so'rov) va reyting jadvali | 1–2 kun |

---

## 9. Maslahat kerak bo'lgan ochiq savollar

Bu hujjatni o'qigan odamdan aynan shu joylarga fikr kutilyapti:

1. **30 foydalanuvchida jonli duelni umuman qilish kerakmi?** Asinxron
   duel + arvoh yetarli emasmi? Jonli rejim qachon ma'noga ega bo'ladi
   (necha faol foydalanuvchidan boshlab)?
2. **Elo shu yoshdagi bolalar uchun to'g'ri o'lchovmi?** Balki oddiyroq
   narsa (g'alaba soni, haftalik ochko) tushunarliroq bo'larmi?
   Reytingning tushishi bolani ilovadan qaytarmaydimi?
3. **Arvoh raqib halolmi?** Uni ochiq "arvoh" deb belgilash yetarlimi,
   yoki bu baribir aldov bo'lib qoladimi?
4. **2 soniyalik so'rov o'rniga SSE arzonroq bo'lmaydimi?** gunicorn
   sinxron worker × 3 da SSE umuman ishlaydimi?
5. **SQLite duel yuki uchun yetadimi?** Qachon PostgreSQL'ga o'tish
   kerak — qaysi belgilarga qarab?
6. **Aldashning oldini olishning boshqa yo'li bormi?** Server savolni
   qayta hisoblay olmaydigan holatda chegara tekshiruvi yetarlimi?
7. **Reyting bitta bo'lsinmi yoki o'yin turi bo'yicha alohida?**
   Bittasi juftlashni osonlashtiradi, lekin "Xotira" da kuchli odam
   "Tezkor hisob" da ham kuchli deb hisoblanadi.
8. **Bolalar xavfsizligi:** duelda raqibning haqiqiy ismi ko'rsatilyapti.
   Taxallus majburiy qilinsinmi? Yosh bolalar uchun umuman ism
   ko'rsatilmasinmi?
