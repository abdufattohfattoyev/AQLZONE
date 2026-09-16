---
name: aqlzone-dizayn
description: Aql Zone ilovasining dizayn va frontend qoidalari — qat'iy 3 rang, toza fon, kam shovqin, tokenlar, ikki til, tahlil belgisi. Aql Zone frontendida (frontend/src) har qanday ekran, komponent, tugma, karta, rang yoki uslub yaratilganda, o'zgartirilganda yoki "dizaynni tahlil qil", "shovqinni kamaytir", "UI/UX yaxshila" deyilganda ishlatiladi.
---

# Aql Zone — dizayn va frontend qoidalari

Ustozning asosiy talabi: **odam savolga javob berish uchun kiradi — uni hech narsa chalg'itmasin.**
Har yangi narsa qo'shishdan oldin so'ra: "Bu odamga HOZIR, SHU ekranda kerakmi?" Yo'q bo'lsa — qo'shma yoki ichki ekranga ol.

## 1. Qat'iy uch rang

| Rang | Token | Ma'nosi — faqat shu |
|---|---|---|
| Ko'k `#3b6fe0` | `brand-blue` (`-d` to'q) | asosiy amal, tanlangan holat, havola |
| Yashil `#22b06b` | `brand-green` | to'g'ri javob, tugadi, "davom etish" |
| Oltin `#f5b301` | `brand-gold` (matnda `brand-gold-d`) | tanga, yulduz, mukofot, reyting |

- Qolgani **neytral**: `bg-karta`, `bg-sahna`, `bg-track`, `text-ink`, `text-ink-soft`, `text-ink-dim`.
- `brand-red` — **faqat xato javob / rad etilgan**. Bezak uchun emas.
- `brand-purple` va `brand-orange` eski nomlar (ko'k va oltinga teng). **Yangi kodda ishlatma.**
- Qo'lda hex (`#8b5cf6`, `text-[#...]`) **yozma** — faqat token. Istisno: `lib/chizma`, `lib/hajmli` rasmlari.
- Bir ekranda bitta asosiy (ko'k to'ldirilgan) tugma. Ikkinchi darajali amallar — neytral yoki faqat yozuv.
- Bo'limlar, yorliqlar, belgilar fonini **rang bilan ajratma** — kamalak paydo bo'ladi. Neytral fon + yozuv yetadi.

## 2. Fon — tekis

- Fon faqat `--az-body` (`components/Fon.tsx`, `index.css` "ORQA FON"). Naqsh, formulalar, aylanuvchi nur, halqa, gradient **qaytarilmaydi**.
- Doimiy harakat (cheksiz animatsiya) faqat bitta "keyingi qadam" elementida bo'lishi mumkin, fonda — hech qachon.

## 3. Shovqinni kamaytirish

Karta yoki ro'yxat qatorida **ko'pi bilan 3 qavat**: tepa (turi/holati) · asosiy mazmun · past (bitta amal + bitta mukofot).

Kartadan olib tashlanadigan narsalar (ular ichki ekranda turadi):
statistika sonlari ("18/22 yechdi", ko'rishlar), like/dislike, qiyinlik nuqtalari, ichki raqam (#17), "Yechilmagan" kabi odatiy holat yozuvlari.

Qoidalar:
- **Odatiy holat belgisiz.** Faqat istisno belgilanadi (masalan "yechgansiz ✓").
- Sarlavha qatorida: orqaga · sarlavha · ko'pi bilan 2 amal. Shior, hisoblagich qo'shma.
- Filtrlar: eng ko'p ishlatiladigan bitta ochiq, qolgani bitta "Saralash/Filtr" varag'ida. O'zgartirilgan bo'lsa tugmada ko'k nuqta.
- "N ta topildi" kabi yordamchi qatorlar — kerak emas.
- Emoji/3D belgi faqat bosh sahifa eshiklarida va o'yinlarda; filtr va yorliqlarda yo'q.
- Bosh sahifada har doim **bitta katta tugma**: yangi odamga "O'rganishni boshlash", qaytganga "Davom etish".

## 4. Tipografiya va o'lcham

- Sarlavha: `font-display`, 19–22px. Asosiy matn: 14.5–15px. Yordamchi: 12–13px `text-ink-dim`. **11px dan kichik matn yozma.**
- Bosiladigan joy kamida 44px balandlik (`h-11`, `size-11`); kichik tugma faqat ikkinchi darajali amalda.
- Telegram Mini App 320px ekranda ham ochiladi — tor ekranda yozuv yashiriladi, belgi qoladi.

## 5. Mavjud qismlardan foydalan

- Yuza: `rounded-clay bg-karta shadow-clay-sm`; botiq maydon: `shadow-ichki bg-sahna`.
- Bosish: `clay-press` (oddiy), `tugma-3d` (asosiy tugma).
- Varaq/modal: `screens/Masalalar.tsx` dagi `TanlovVaraq` + `Tanlov` namunasi.
- Qobiq: orqaga `useOrqaga`, tebranish `tebrat` (`lib/qobiq.ts`).
- Belgilar: `Icon` (`lib/icons.tsx`) — yangi ikonka chizishdan oldin ro'yxatni tekshir.

## 6. Matn — ikki til

- Ekranda qo'lda yozilgan o'zbekcha satr yo'q: hammasi `t("kalit")`, kalit `lib/matn.ts` da `["uz", "ru"]` juftligi bilan.
- Matn qisqa, buyruq shaklida: "Yechish", "Boshlash", "O'tkazib yuborish".

## 7. Tahlil

- Hamma bosish avtomatik yoziladi (`lib/tahlil.ts`, panelda `/boshqaruv/tahlil`).
- Muhim tugmaga barqaror nom ber: `data-tahlil="Bo'lim: amal"`. Yozuvi o'zgaruvchan (ism, son) bo'lgan tugmaga **albatta**.
- Yangi savol yechiladigan ekran qo'shilsa — `SAVOL_EKRANI` ga qo'sh (javob variantlari yozilmasin).
- Yangi bo'lim — yangi marshrut; `yolniUmumlashtir` raqamli qismlarni `:id` ga aylantiradi.

## 8. Kod uslubi

- Izohlar o'zbekcha va **NEGA** shunday qilinganini aytadi (atrofdagi kod kabi).
- Rang/o'lcham qarori o'zgarsa, eski izohni ham yangila — "ilgari ... edi, endi ..." shaklida.

## 9. Tekshiruv (har o'zgarishdan keyin)

```bash
cd frontend && npx tsc -b && npm run tekshir && npm run build
```

Keyin ko'z bilan: dev server (`.claude/launch.json` → `aql-zone-react`), **mobile** o'lcham (375px), ikkala yorug'lik (oq/qora) va o'zgargan ekran. Ro'yxat:

- [ ] Ekranda uchtadan ortiq rang yo'q (qizil faqat xatoda)
- [ ] Bitta asosiy tugma, u darhol ko'rinadi
- [ ] Kartada 3 qavatdan ko'p emas, statistika ichki ekranda
- [ ] Qo'lda hex va qo'lda yozilgan satr yo'q
- [ ] 320px da hech narsa sig'may qolmadi
