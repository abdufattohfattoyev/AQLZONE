# Aql Zone — Android qobiq

`https://aql-zone.uz` ni ochadigan WebView ilovasi. Ilovaning butun
mantig'i saytda qoladi: bu papkada bitta ekran, bitta Java fayl va
ikonkalar bor, xolos.

| | |
|---|---|
| Paket | `uz.aqlzone.app` |
| Eng past Android | 7.0 (API 24) |
| Mo'ljal | Android 15 (API 35) |
| Hajmi | ~118 KB |
| Bog'liqliklari | **yo'q** (AndroidX ham, Kotlin ham ishlatilmaydi) |

---

## Nega shu yo'l tanlandi

Uch xil qilish mumkin edi va farqi katta:

| Yo'l | Vaqti | Internetsiz | Yangilash |
|---|---|---|---|
| **WebView, sayt serverdan** ← shu | 3-4 soat | ishlamaydi | deploy qilinsa — hammada |
| Fayllar APK ichida | 1,5-2 kun | ishlaydi | yangi APK kerak |
| Native (Flutter, RN) | 1-2 oy | ishlaydi | yangi APK kerak |

Birinchisi tanlandi, chunki hozir javob kerak bo'lgan savol texnik emas:
**odamlar ilovani umuman o'rnatadimi?** Shu savolga javob topilmasdan
turib offline rejimga ikki kun sarflash erta bo'lardi.

Narxi ochiq aytiladi: **internetsiz ilova ochilmaydi**. Saytdagi
offline rejim (Service Worker) bu yerda ishlamaydi, chunki u faqat
ikkinchi marta ochilganda va faqat brauzerda kuchga kiradi.

---

## Qanday qurish

### Oddiy yo'l — Android Studio

Papkani Android Studio'da oching (`File → Open` → `apk`), so'ng
`Build → Build APK(s)`. Gradle fayllari tayyor, hech narsa sozlash
kerak emas.

Buyruq qatoridan:

```bash
cd apk && gradle assembleDebug
```

### Zaxira yo'l — Gradle'siz

```bash
cd apk && sh tools/qur.sh
```

Natija: `apk/chiqdi/aql-zone.apk`

Bu skript Android SDK vositalarini to'g'ridan-to'g'ri chaqiradi:
`aapt2` → `javac` → `d8` → `aapt add` → `zipalign` → `apksigner`.
Gradle umuman ishlatilmaydi.

> **Nega zaxira yo'l kerak bo'ldi.** Loyiha yozilgan kompyuterda
> Gradle ishga tushmaydi:
>
> ```
> java.io.IOException: Unable to establish loopback connection
>   Caused by: java.net.SocketException: Invalid argument: connect
>     at sun.nio.ch.UnixDomainSockets.connect0
> ```
>
> Java'ning `Selector.open()` chaqiruvi Windows'da AF_UNIX rozetkasidan
> foydalanadi va u shu mashinada bloklangan — odatda antivirus yoki
> buzilgan Winsock qatlami sabab bo'ladi (`netsh winsock reset` va
> qayta yuklash ko'pincha yechadi). Gradle mijozi demon bilan aynan shu
> quvur orqali gaplashadi, shuning uchun Android Studio ham ishlamaydi.
> Muammo TUZATILGACH oddiy yo'lga qaytish mumkin — Gradle fayllari
> joyida turibdi va ishlaydi.

---

## Telefonga o'rnatish

1. APK ni telefonga tashlang (Telegram'ga o'zingizga yuborsangiz ham bo'ladi).
2. Faylni bosing.
3. "Noma'lum manbadan o'rnatish" so'ralsa — ruxsat bering. Bu normal:
   Play Store'dan kelmagan har qanday APK shunday so'raydi.

`adb` orqali:

```bash
adb install -r apk/chiqdi/aql-zone.apk
```

---

## Ilova nima qiladi

**Havolalar.** `aql-zone.uz` ichkarida ochiladi, qolgani —
tashqarida. Bu shunchaki qulaylik emas: bellashuv chaqiruvi
`t.me/...` havolasi bilan ulashiladi va u WebView ichida ochilsa,
Telegram'ning veb ko'rinishi chiqib, bola hisobsiz qolardi.

**Orqaga tugmasi.** Sahifada orqaga qaytaradi, ilovadan chiqmaydi.

**localStorage yoqilgan.** Bolaning butun progressi va kirish tokeni
shu yerda saqlanadi. Bu sozlama o'chsa, ilova ishlayotgandek
ko'rinadi, lekin har ochilganda hammasi noldan boshlanadi.

**Fonga o'tganda to'xtaydi.** Bellashuvda ekran har 2 soniyada
serverga "men shu yerdaman" deb turadi; telefon cho'ntakka
solingandan keyin ham shu belgi ketaversa, raqib yo'q odam bilan duel
boshlanib ketardi.

**Internet yo'q bo'lsa** — `assets/xato.html` ko'rsatiladi. U
butunlay mustaqil sahifa: aynan tarmoq ishlamayotganda ochiladi,
shuning uchun tashqi fayl ishlatmaydi.

---

## Ikonka

`tools/ikonka.py` PNG larni `frontend/public/logo.svg` dagi
yo'llardan chizadi. Logo o'zgarganda:

```bash
cd apk && python tools/ikonka.py
```

Ikki nusxa bor va ikkalasi ham kerak:

* `res/drawable/logo.xml` va `ic_launcher_foreground.xml` — Android 8+
  moslashuvchan ikonkasi (vektor);
* `res/mipmap-*/ic_launcher.png` — Android 7 uchun (u vektorni ikonka
  sifatida qabul qilmaydi).

`tools/dokon-512.png` — Play Store sahifasi uchun.

---

## Play Store'ga chiqarish

Hozirgi APK **sinov** kaliti bilan imzolangan — do'konga yaramaydi.
Kerak bo'ladi:

1. **O'z kalitingiz** (bir marta yasaladi va MANGU saqlanadi):

   ```bash
   keytool -genkeypair -v -keystore aqlzone.jks \
     -alias aqlzone -keyalg RSA -keysize 2048 -validity 10000
   ```

   Bu fayl va paroli yo'qolsa, ilovani boshqa yangilay olmaysiz —
   Play Store faqat shu kalit bilan imzolangan yangilanishni qabul
   qiladi. Repozitoriyga qo'yilmaydi (`.gitignore` da).

2. `app/build.gradle` ga `signingConfigs` qo'shish va parollarni
   `kalit.properties` dan o'qish.

3. `gradle bundleRelease` → `app/build/outputs/bundle/release/app-release.aab`
   (Play Store APK emas, **AAB** qabul qiladi).

Bundan tashqari do'kon talab qiladi: dasturchi hisobi ($25, bir
martalik), maxfiylik siyosati sahifasi, "Data safety" anketasi, kontent
reytingi, skrinshotlar. Ilova bolalarga mo'ljallangani uchun **Families
policy** ham qo'llanadi va ko'rik odatdagidan uzoqroq turadi.

---

## Keyingi qadamlar

**Fayllarni ichiga solish** (offline). Bitta jiddiy to'siq bor:
hozir frontend so'rovlari NISBIY manzil bilan ketadi (`/api/v1/...`).
`file://` dan yuklangan sahifada u `file:///api/v1/...` bo'lib qoladi
va hamma so'rov yiqiladi. Kerak bo'ladi: API manzilini o'zgaruvchiga
chiqarish (`VITE_API_URL`), backendda CORS ni ochish va Service
Worker'ni `file://` da o'chirish.

**Push xabarlar.** Hozir eslatmalarni Telegram boti yuboradi. APK'da
push yo'q — ya'ni faqat ilovadan foydalanadigan bola kunlik eslatmani
umuman olmaydi va zanjiri uzilib qolaveradi. Firebase qo'shish 1-2 kun.

**Yangilanish tekshiruvi.** Sayt yangilansa APK o'zi yangilanadi, lekin
qobiqning o'zi (masalan yangi Android talabi) o'zgarsa, odamda eski
versiya qolib ketadi. Ilova User-Agent'ga `AqlZoneApp/1.0` qo'shadi —
server shunga qarab "ilovani yangilang" deb ayta oladi.
