# Rasm yasatish uchun ro'yxat va prompt

Bu fayl boshqa AI'ga (ChatGPT / Midjourney / Gemini / Flux) rasm
yasatib, natijasini shu papkaga tashlash uchun.

Nom va o'lcham qoidalari [README.md](README.md) da. Bu yerda —
**nima buyurish** kerakligi.

---

## 1 · Umumiy uslub (har bir buyruqqa qo'shiladi)

Bu qism O'ZGARMAYDI. O'n ikkita rasm bitta to'plamdek ko'rinishi
uchun aynan shu matn har safar takrorlanadi:

```
Children's educational flashcard illustration for toddlers aged 2-5.
Soft 3D cartoon style with smooth rounded shapes, no sharp corners.
Bright friendly colors, gentle top-down lighting, subtle gradient
shading on every surface. Clean vector-like finish, thick simple
forms, minimal detail.

Strict side view, facing RIGHT, perfectly level, centered.
Isolated object only — no background, no ground, no scenery,
no people, no text, no logos, no brand names, no watermark.
Plain solid white background.
Square image, 1024x1024, object fills about 80% of the frame
with even margin on all sides.
```

> **Shaffof fon haqida.** Ko'p AI shaffof PNG chiqara olmaydi. Shu
> sabab yuqorida **oq fon** so'ralgan — oq fonni kesib tashlash oson.
> Fayllarni tashlaganingizda ayting, men foniga tegib, hammasini
> shaffof qilib beraman (bitta buyruq bilan bo'ladi).

---

## 2 · O'n ikkita mashina

Har qatordagi **buyruq** ni yuqoridagi umumiy uslub matni bilan
BIRGA yuboring: avval buyruq, keyin uslub.

| # | fayl nomi | ekranda | buyruq (AI'ga) |
|---|-----------|---------|----------------|
| 1 | `mashina.png` | mashina | `A red family sedan car, side view` |
| 2 | `avtobus.png` | avtobus | `A yellow-orange city bus with a row of windows and a door, side view` |
| 3 | `taksi.png` | taksi | `A yellow taxi cab with a checkered stripe and a roof sign (no text on the sign), side view` |
| 4 | `yuk.png` | yuk mashinasi | `A grey cargo box truck with a blue cabin, side view` |
| 5 | `otochir.png` | o't o'chirish mashinasi | `A red fire engine with a ladder on the roof and a hose reel, side view` |
| 6 | `tezyordam.png` | tez yordam | `A white ambulance van with a red cross and a red stripe, blue and red roof lights, side view` |
| 7 | `politsiya.png` | politsiya mashinasi | `A dark blue and white police car with roof lights, side view` |
| 8 | `traktor.png` | traktor | `A green farm tractor with one very large rear wheel and a small front wheel, exhaust pipe, side view` |
| 9 | `velosiped.png` | velosiped | `A blue bicycle with an open triangular frame, thin wheels with spokes, side view` |
| 10 | `poyezd.png` | poyezd | `A red steam locomotive pulling one blue passenger car on rails, puff of steam from the chimney, side view` |
| 11 | `samolyot.png` | samolyot | `A white passenger airliner flying, nose tilted slightly up to the right, light blue tail fin, one wing with an engine under it, side view` |
| 12 | `kema.png` | kema | `A red and white passenger ship with a funnel and round portholes, floating on gentle blue waves, side view` |

---

## 3 · Tayyor namuna (nusxa olib yuborishingiz mumkin)

Mana avtobus uchun to'liq buyruq — qolganlarini shu andoza bo'yicha
almashtiraverasiz:

```
A yellow-orange city bus with a row of windows and a door, side view.

Children's educational flashcard illustration for toddlers aged 2-5.
Soft 3D cartoon style with smooth rounded shapes, no sharp corners.
Bright friendly colors, gentle top-down lighting, subtle gradient
shading on every surface. Clean vector-like finish, thick simple
forms, minimal detail.

Strict side view, facing RIGHT, perfectly level, centered.
Isolated object only — no background, no ground, no scenery,
no people, no text, no logos, no brand names, no watermark.
Plain solid white background.
Square image, 1024x1024, object fills about 80% of the frame
with even margin on all sides.
```

---

## 3b · O'n to'rtta hayvon

Uslub matni (1-bo'lim) AYNAN o'sha bo'ladi — bir farq bilan: oxiriga
shu qator qo'shiladi, aks holda AI hayvonni "multfilm qahramoni"
qilib, kiyim va katta ko'z bilan chizib qo'yadi:

```
Friendly natural animal, full body standing, calm expression,
head turned slightly toward the viewer. Not a mascot, no clothes,
no human posture, no oversized cartoon eyes.
```

| # | fayl nomi | ekranda | buyruq (AI'ga) |
|---|-----------|---------|----------------|
| 1 | `it.webp` | it | `A friendly brown and white dog, side view` |
| 2 | `mushuk.webp` | mushuk | `A ginger cat with a fluffy tail, side view` |
| 3 | `sigir.webp` | sigir | `A black and white spotted cow, side view` |
| 4 | `qoy.webp` | qo'y | `A white woolly sheep, side view` |
| 5 | `ot.webp` | ot | `A brown horse with a dark mane, side view` |
| 6 | `tovuq.webp` | tovuq | `A brown hen, side view` |
| 7 | `xoroz.webp` | xo'roz | `A rooster with a red comb and colourful tail feathers, side view` |
| 8 | `ordak.webp` | o'rdak | `A white duck with an orange beak, side view` |
| 9 | `quyon.webp` | quyon | `A white rabbit with long ears, side view` |
| 10 | `baqa.webp` | baqa | `A green frog sitting, side view` |
| 11 | `ayiq.webp` | ayiq | `A brown bear standing on four legs, gentle face, side view` |
| 12 | `arslon.webp` | arslon | `A lion with a golden mane, calm and friendly, side view` |
| 13 | `fil.webp` | fil | `A grey elephant with big ears and a curved trunk, side view` |
| 14 | `asalari.webp` | asalari | `A single yellow and black bumblebee with translucent wings, side view, shown large` |

**Hayvonlarga xos uchta ogohlantirish:**

- **Ayiq va arslon qo'rqinchli chiqmasin.** AI ularni og'zini
  ochib, tishini ko'rsatib chizishga urinadi. Buyruqqa `calm`,
  `gentle`, `friendly` so'zlarini qo'shdim — baribir tishli chiqsa,
  qayta yasating.
- **Asalari kichkina.** Boshqa hayvonlar bilan bir varaqda
  so'ralsa, u nuqtadek bo'lib qoladi. `shown large` shu uchun bor.
- **Kiyim kiygan hayvon kerak emas.** "Cute cartoon animal" degan
  so'z AI'ni shlyapa va shim tomon olib ketadi; bola esa hayvonni
  emas, o'yinchoqni ko'radi.

---

## 3c · Bitta varaqmi yoki bittalabmi?

Mashinalar bitta 4×3 varaq bo'lib keldi va u ishladi. Lekin bitta
kamchiligi bor edi: varaq 1254 px, ya'ni har bir katak ~418 px.
Kartaga 512 px kerak, shuning uchun rasmlar biroz kattalashtirildi.

Hayvonlarda ikki yo'l bor:

**Bittalab (yaxshiroq).** Har biri 1024×1024 — kartada juda tiniq
chiqadi. O'n to'rtta so'rov kerak, lekin natija sezilarli yaxshi.

**Bitta varaqda (tezroq).** 4 ustun × 4 qator so'rang, oxirgi ikkita
katak bo'sh qolsin. Tartibni AYNAN yuqoridagi jadval bo'yicha
yozing — men kesganda shu tartibga tayanaman. Varaqni imkon
qadar katta so'rang (2048 px bo'lsa, har katak 512 px chiqadi).

---

## 4 · Nimaga e'tibor berish kerak

- **Hammasi bir tomonga qarasin — CHAPGA.** Mashinalar bo'limi
  chapga qaragan (varaqdagi ko'pchilik shunday edi), hayvonlar ham
  shunday bo'lsin. AI baribir aralashtirib yuboradi; men kesish
  paytida keraklisini ag'daraman, siz bu haqda o'ylamang.
- **Yozuv bo'lmasin.** AI ko'pincha kuzovga "BUS", "POLICE" deb
  yozib qo'yadi va u har doim xato yozilgan bo'ladi. Chiqib qolsa —
  qayta yasating.
- **Bitta uslubda bo'lsin.** Hammasini BIR SUHBATDA, ketma-ket
  yasating. Yangi suhbat — yangi uslub.
- **Odam bo'lmasin.** Kabinadagi haydovchi kartani chalg'itadi:
  bola "mashina" emas, "amaki" ni ko'radi.
- **Soya kerak emas.** Ilova soyani o'zi chizadi.

---

## 5 · Keyin nima bo'ladi

Fayllarni shu papkaga tashlab, menga ayting. Men:

1. oq fonni kesib, shaffof qilaman;
2. hammasini bir xil kvadrat kadrga solaman (512×512);
3. hajmini siqaman (har biri ~100 KB dan oshmasin);
4. kartada ochib, o'n ikkitasini yonma-yon ko'rib chiqaman.

Rasmi qo'yilmagan karta chizmada ishlab turaveradi — ya'ni
bittalab tashlasangiz ham bo'ladi, bo'lim buzilmaydi.
