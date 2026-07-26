# Ovoz — o'zbekcha mp3

Ilova savol matnini o'qib berishi mumkin. Uch manba, shu tartibda
(`frontend/src/lib/ovoz.ts`):

1. `AZ_TTS_API` — tashqi TTS xizmati (hozircha bo'sh, ulanmagan)
2. `frontend/public/audio/` dagi tayyor mp3 — `/audio/<xesh>.mp3`
3. Brauzerning o'z ovozi — yuqoridagilar topilmasa

**Hozircha ovoz O'CHIQ.** Brauzerning o'z ovozi o'zbekchani ruscha
talaffuz bilan o'qiydi — bunday ovoz bolaga yordam bermaydi, chalg'itadi.
Yoqish uchun `ovozYoniqmi()` dagi bitta shartni almashtirish kifoya.

## Tayyor fayllar

`frontend/public/audio/` da ~290 ta mp3 bor. Ular `public/` ichida
turgani uchun Vite ham, Django ham ularni `/audio/...` manzilida o'zi
beradi — qo'shimcha sozlash shart emas. `sw.js` birinchi so'rovdayoq
keshlaydi, ya'ni internetsiz ham eshitiladi.

## Yangi fayllar yasash

Eski generator skripti (`tts-build.js`) eski HTML nusxalar bilan birga
o'chirildi — u gaplarni `Aql-Zone-1-sinf.html` ichidan o'qir edi, endi
bunday fayl yo'q. Yangisi kerak bo'lsa gaplar `frontend/src/lib/generators.ts`
dan olinadi (`npm run tekshir` shu generatorlarni allaqachon ishga tushiradi).

Fayl nomi — matn xeshi, kengaytmasi `.mp3`.

### Xizmatlar

| | Aisha (aisha.group) | Azure Speech |
|---|---|---|
| Hisob | o'zbek, karta shart emas | xorijiy, karta so'raydi |
| Narx | ~73 300 so'm (bir marta) | bepul (oyiga 500k belgi) |
| Ovoz | Gulnoza (4 kayfiyat) | `uz-UZ-MadinaNeural` / `uz-UZ-SardorNeural` |
| Format | wav → mp3 ga siqish kerak | to'g'ridan-to'g'ri mp3 |

- Aisha kaliti: https://space.aisha.group/api-keys
- Azure kaliti: portal.azure.com → Speech → Free F0 → Keys and Endpoint

### Matnni tozalash

Yuborishdan oldin matn tozalanishi shart, aks holda talaffuz g'alati
chiqadi: emoji olib tashlanadi, raqamlar o'zbekcha so'zga aylantiriladi
(`6 ta` → `oltita`, `7 dan` → `yettidan`, `8 + 5 = ?` → `sakkiz qo'shuv
besh nechaga teng?`). Bolalar uchun tezlik biroz sekinroq bo'lgani yaxshi.
