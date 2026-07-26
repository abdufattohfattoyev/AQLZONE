# Aql Zone — frontend (React + Vite + Tailwind)

1–4-sinf matematikasi. Har bir kurs darslik boblariga mos, savollar esa
generatorlar orqali **har safar qaytadan yasaladi** — bola darsni ikkinchi
marta ochsa sonlar boshqacha bo'ladi.

## Ishga tushirish

```bash
npm install
npm run dev
```

Backend alohida turadi (`../backend`), Vite `/api` ni unga uzatadi:

```bash
cd ../backend && .venv/Scripts/python.exe manage.py runserver 8787
```

## Buyruqlar

| Buyruq | Nima qiladi |
|---|---|
| `npm run dev` | ishlab chiqish serveri (5180-port) |
| `npm run build` | `dist/` ga yig'adi — Django shu papkani beradi |
| `npm run tekshir` | **o'quv dasturini tekshiradi** (pastga qarang) |
| `npm run lint` | oxlint |

### `npm run tekshir` nima uchun kerak

Generatorlar tasodifiy sonlarga tayanadi, shuning uchun xato faqat ma'lum
qiymatlarda ko'rinadi — masalan javob manfiy chiqishi yoki to'g'ri javob
variantlar ichida umuman bo'lmasligi. Skript har bir darsning har bir
generatorini 80 martadan ishga tushirib, shularni tutadi. Yangi dars yoki
generator qo'shganingizdan keyin albatta bir marta yuriting.

## Tuzilishi

```
src/
  lib/
    curriculum/       sinf kurslari — darslik boblari va darslar
    generators.ts     savol yasovchilar (sof funksiyalar)
    activity.ts       savol turlari
    types.ts          bob/dars/progress modellari, dars ochilish qoidasi
    progress.tsx      progress: React ↔ localStorage ↔ server
    api.ts            backend bilan aloqa (/api/v1)
    yollar.ts         manzillar bir joyda
    ovoz.ts           ovoz — HOZIRCHA O'CHIQ (bitta bayroq)
    icons.tsx         chiziqli ikonkalar (emoji ishlatilmaydi)
  components/         Logo, Fon, RoadMap, QuestionView
  screens/            Dashboard, Home, Lesson, NotFound
public/
  sw.js               offline qatlami
  audio/              tayyor o'zbekcha mp3 (/audio/... manzilida beriladi)
  manifest.webmanifest, logolar
```

## Manzillar

Manzil endi HTML fayl nomi emas:

```
/                            kurslar
/kurs/1-sinf                 yo'l xaritasi
/kurs/1-sinf/2-bob/3-dars    dars
```

Sahifa yangilanganda ham ishlaydi — Django `index.html` ni qaytaradi
(`backend/core/spa.py`).

## Ovoz

Hozircha o'chirilgan. Yoqish uchun `src/lib/ovoz.ts` da bitta qatorni
o'zgartiring:

```ts
export const OVOZ_YONIQ = true;
```

Chaqiruv joylari (dars savoli, to'g'ri/xato javob) kodda allaqachon turibdi.
Tayyor mp3 fayllar `public/audio/` da — `../OVOZ-README.md` ga qarang.

## APK / iOS

`file://` da chiroyli manzillar ishlamaydi, shuning uchun hash kerak:

```bash
VITE_ROUTER=hash npm run build
```

Bu bitta o'zgaruvchi ham marshrutni (`main.tsx`), ham asset yo'llarini
(`vite.config.ts`) birga almashtiradi.
