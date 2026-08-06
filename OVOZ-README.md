# Ovoz

Ilovada **ikki xil ovoz** bor va ular butunlay boshqa yo'ldan keladi.
Ularni aralashtirmaslik muhim:

| | **Nutq** (TTS) | **Tovush** (sintez) |
|---|---|---|
| Nima | "Bu mashina", "Qaysi biri it?" | signal, sirena, qo'ng'iroq |
| Qayerdan | Aisha, serverda keshlanadi | brauzerning o'zida yasaladi |
| Kod | `lib/ovoz.ts` + `/api/v1/ovoz` | `lib/tovush.ts` |
| Fayl | `.wav`, `/data/ovoz/` | **yo'q** — real vaqtda yasaladi |

Quyidagi hammasi **nutq** haqida; tovush uchun pastdagi bo'limga qarang.

---

## Nutq — o'zbekcha talaffuz

Ilova so'z va gaplarni ovoz chiqarib o'qiydi. Kichkintoylar bo'limi
(2–5 yosh) uchun bu bezak emas, **ishlash sharti**: 3 yoshli bola
"mashina" degan yozuvni o'qiy olmaydi.

**Gaplar to'liq.** Albom "mashina" emas, "Bu mashina" deydi; o'yin
"Qaysi biri mashina?" deb so'raydi. Yakka so'z savol bo'lib
eshitilmaydi va bola undan gap tuzishni o'rganmaydi. Gaplar qolip
bilan yasaladi (`lib/kichkintoy.ts` → `aytiladigan`, `savolMatni`) —
45 karta × 2 gap × 2 til qo'lda yozilsa, bittasi albatta xato bo'lardi.

## Qanday ishlaydi

Uch manba, mijozda shu tartibda sinaladi (`frontend/src/lib/ovoz.ts`):

1. **`/api/v1/ovoz`** — o'z serverimizdagi TTS. Aisha (aisha.group),
   o'zbekcha "Gulnoza" ovozi.
2. **`frontend/public/audio/`** dagi ~290 tayyor mp3 — eski savollar
   uchun yasalgan to'plam. Server javob bermasa ham ishlaydi.
3. **Brauzerning o'z ovozi** — faqat ruscha. O'zbekcha uchun ataylab
   o'chirilgan: brauzerda `uz-UZ` ovozi deyarli yo'q va u "qo'y" ni
   "ko-y" deb o'qiydi. Noto'g'ri talaffuz jim turgandan yomonroq.

Tartib chaqiruvchiga qarab teskari bo'ladi va bu tezlik masalasi:
kichkintoy so'zlari serverda tayyor (mp3 da yo'q), dars matnlari esa
aksincha. Ikkalasida ham topilmasa — jim qolinadi. **Ovoz hech qachon
o'yin yo'liga to'siq bo'lmaydi.**

## Nega server orqali

* **Kalit chiqmaydi.** Aisha kaliti pullik; mijozga chiqsa, uni
  birinchi ochgan odam nusxalab oladi.
* **Bir so'z — bir marta.** Server javobni abadiy keshlaydi
  (`/data/ovoz/<xesh>.wav`). "Olma" ni ming bola so'rasa ham, xizmatga
  bir marta to'lanadi.
* **Internetsiz ishlaydi.** `sw.js` ovoz javoblarini keshlaydi — bu
  `/api/` ichidagi yagona istisno (izohi o'sha faylda).

## Xarajat qanday cheklangan

Uch qavat, va ularsiz hisob tez bo'shardi:

| Qavat | Nima qiladi |
|---|---|
| **Oq ro'yxat** | Faqat `backend/core/lugat/*.txt` dagi matn yasaladi |
| **Token** | Yangi ovoz yasash uchun kirgan hisob kerak |
| **Kunlik chegara** | `OVOZ_KUNLIK_BELGI` (standart 20 000 belgi/kun) |

Oq ro'yxat eng muhimi. Dars savollari tasodifiy sonlar bilan yasaladi
("8 + 5 = ?", "8 + 6 = ?") — ya'ni **har savol yangi satr** va
ro'yxatsiz har biri uchun alohida to'lanardi.

Keshda turgan ovoz esa **hammaga**, tokensiz beriladi: bu shunchaki
fayl uzatish va bola ilovani birinchi ochganda hisobi bo'lmasligi
mumkin.

## Sozlash

`.env` ga bitta qator yetadi:

```
AISHA_KEY=...
```

Kalit: <https://space.aisha.group/api-keys>

Ixtiyoriy: `AISHA_MODEL` (standart `Gulnoza`), `AISHA_KAYFIYAT`
(`Cheerful`), `AISHA_TEZLIK` (`0.9` — bolalar uchun sekinroq),
`OVOZ_KESH`, `OVOZ_KUNLIK_BELGI`.

Ovoz va kayfiyat **fayl xeshiga kiradi**: ularni almashtirsangiz eski
fayllar o'z-o'zidan ishlatilmay qoladi va ilova ikki xil ovozda
gapirib qolmaydi.

## Lug'atni tayyorlash

Ovoz so'ralganda o'zi ham yasaladi, lekin **birinchi marta** bu bir
necha soniya oladi. Uch yoshli bola uchun o'sha jimlik "ilova buzuq"
degani. Shuning uchun butun lug'at oldindan tayyorlanadi:

```bash
python manage.py ovoz
```

Buyruq xavfsiz takrorlanadi — keshdagi so'z qayta yasalmaydi va qayta
pul ketmaydi. Har joylashdan keyin yurgizsa bo'ladi.

```bash
python manage.py ovoz --sana          # nechtasi yetishmasligini aytadi
python manage.py ovoz --fayl x.txt    # o'z ro'yxating
```

Kichkintoylar lug'ati — 296 satr, jami ~3 200 belgi (nomlar, "Bu …"
gaplari, "Qaysi biri …?" savollari, ikki tilda). Ya'ni butun bo'lim
bir marta yasalganda Aisha hisobidan **uch kilobaytcha** matn ketadi —
oylik bepul chegaraning mingdan bir qismi.

## Yangi so'z qo'shish

1. `frontend/src/lib/kichkintoy.ts` ga qo'shing;
2. `npx jiti scripts/kichkintoy.ts --yoz` — lug'at fayli yangilanadi;
3. serverda `python manage.py ovoz`.

Ikkinchi qadamni unutsangiz `npm run tekshir` yiqiladi va nima
yetishmayotganini aytadi. Bu ataylab: ro'yxatlar jimgina ajralib
ketsa, ekranda karta bo'lardi-yu, bosilganda ilova jim qolardi.

## Ovozni o'chirish

Ikki joyda: Sozlamalarda (ota-ona ataylab qidiradigan joy) va
kichkintoylar bo'limining o'zida, yuqori o'ng burchakda. Ikkinchisi
shuning uchun kerakki, ovozni o'chirish payti har doim shoshilinch
bo'ladi — avtobusda, uxlab yotgan chaqaloq yonida.

Sozlama `localStorage` da (`azapp_ovoz`) va butun ilova bo'ylab bitta —
nutqni ham, tovushni ham birga o'chiradi.

---

## Tovush — narsalarning haqiqiy ovozi

`frontend/src/lib/tovush.ts`. Signal, sirena, qo'ng'iroq, hushtak,
dvigatel — hammasi `AudioContext` da yasaladi va **hech qanday fayl
yuklanmaydi**.

### Nega TTS emas

Ilgari mashina kartasi "bi-bip" degan **so'zni** aytardi — ya'ni odam
ovozi mashinani taqlid qilardi. Bola esa mashinani ko'chada eshitgan
va u yerda "bi-bip" degan so'z emas, **signal** yangraydi. Taqlid
qilingan tovush kulgili, lekin bola uni haqiqiy mashina bilan bog'lay
olmaydi.

### Nega fayl emas

* **og'irlik** — o'n ikkita tovush bir necha megabayt bo'lardi;
* **litsenziya** — internetdagi "bepul" tovushlarning ko'pi shartli
  bepul va startup uchun bu vaqt bombasi;
* **moslashuv** — yasalgan tovushni sozlash mumkin (sirenani
  sekinlashtirish, signalni yumshatish), faylni esa qayta yozish kerak.

### Qanday qurilgan

Har bir tovush — bir necha oddiy to'lqinning yig'indisi:

| | Qanday yasaladi |
|---|---|
| **Signal** | ikkita kvinta oralig'idagi arra to'lqin + past uchinchi nota |
| **Sirena** | chastotasi 660↔1180 Hz orasida silliq yuguradigan nota |
| **Qo'ng'iroq** | FM sintez (nisbat 3.5 — metall jarangi shundan) |
| **Hushtak** | uchta nota akkordi + tarmoqli shovqin (bug') |
| **Dvigatel** | past arra to'lqin, sekundiga 9 marta uziladigan puls |
| **Samolyot** | filtri pastdan yuqoriga suriladigan oq shovqin |

Hammasi qisqa (0.4–1.6 s): bu tovush emas, **ishora**. Uzun tovush
bolani zeriktiradi.

### Hayvonlarda nega tovush yo'q

Hayvon tovushi ataylab **so'z bo'lib qoladi** ("vov-vov", "miyov") va
uni TTS aytadi. Haqiqiy it hurishini qo'ysak, u ta'sirli bo'lardi-yu,
bola uni **qaytara olmasdi** — holbuki bu yoshda o'rganish aynan
taqlid orqali boradi. Sintez qilingan hurish esa yaxshi chiqmaydi:
signal va sirena oddiy to'lqinlardan iborat, hayvon ovozi esa emas.
