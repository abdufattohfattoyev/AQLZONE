# Ovoz — o'zbekcha talaffuz

Ilova so'z va savollarni ovoz chiqarib o'qiydi. Kichkintoylar bo'limi
(2–5 yosh) uchun bu bezak emas, **ishlash sharti**: 3 yoshli bola
"mashina" degan yozuvni o'qiy olmaydi.

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

Kichkintoylar lug'ati — 134 satr, jami ~860 belgi. Ya'ni butun bo'lim
bir marta yasalganda Aisha hisobidan **bir kilobaytdan kam** matn
ketadi.

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

Sozlama `localStorage` da (`azapp_ovoz`) va butun ilova bo'ylab bitta.
