# Aql Zone — backend (Django REST Framework)

Telegram Mini App, veb va kelajakdagi APK/iOS ilova — hammasi **bitta**
API'dan foydalanadi: `/api/v1`.

Asosiy g'oya: foydalanuvchi Telegram'ga **bog'lanmagan**. Bola avval qurilma
id bilan anonim kiradi, xohlasa keyin Telegram'ga bog'laydi — progress
yo'qolmaydi.

---

## Ishga tushirish

```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe manage.py migrate
.venv/Scripts/python.exe manage.py runserver 8787
```

Linux/macOS'da `.venv/Scripts/` o'rniga `.venv/bin/`.

Sozlash uchun `.env.example` dan `.env` yasang.

Tekshirish:

```bash
curl http://localhost:8787/api/health
```

## Testlar

```bash
.venv/Scripts/python.exe manage.py test
```

## Frontend bilan birga

**Ishlab chiqishda** ikkalasi alohida turadi — Vite `/api` ni shu serverga uzatadi:

```bash
cd frontend && npm run dev     # http://localhost:5180
cd backend && .venv/Scripts/python.exe manage.py runserver 8787
```

**Ishlab chiqarishda** React yig'iladi va Django uni o'zi beradi:

```bash
cd frontend && npm run build   # → frontend/dist
cd backend && .venv/Scripts/python.exe manage.py runserver 8787
```

`/kurs/1-sinf/2-bob/3-dars` kabi manzil sahifa yangilanganda ham ishlaydi:
diskda bunday fayl yo'q, shuning uchun server `index.html` ni qaytaradi va
marshrutni React hal qiladi (`core/spa.py`).

---

## API

Kirish ikki yo'l bilan bo'ladi, natija bir xil — sessiya tokeni.
Keyingi barcha so'rovlarda `Authorization: Bearer <token>`.

| Metod | Yo'l | Izoh |
|---|---|---|
| POST | `/api/v1/auth/telegram` | `{initData}` yoki `{tg}` → `{token, user}` |
| POST | `/api/v1/auth/device` | `{deviceId}` → `{token, user}` (anonim, APK/iOS/veb) |
| POST | `/api/v1/auth/link` | `{initData}` yoki `{tg}` + Bearer → anonim hisobni Telegram'ga bog'laydi |
| GET | `/api/v1/me` | profil + progress |
| PATCH | `/api/v1/me` | `{ism, familiya}` — ikkalasi to'lsa ro'yxat yopiladi |
| GET | `/api/v1/progress` | `{state, stars}` |
| PUT | `/api/v1/progress` | `{state}` — kalit darajasida birlashtiradi |
| POST | `/api/v1/results` | bitta dars natijasi |
| GET | `/api/v1/results?limit=20` | oxirgi natijalar |
| GET | `/api/v1/summary` | ota-ona hisoboti |
| GET | `/api/v1/leaderboard?davr=jami\|hafta` | top + o'z o'rning |
| GET | `/api/health` | holat va bot nomi |

### Telegram orqali kirish — ikki xil imzo

Bitta endpoint, ikki manba. Farq faqat imzo kalitida, lekin u JIDDIY:

| | Mini App (`initData`) | Veb sayt (`tg`) |
|---|---|---|
| Kalit | `HMAC_SHA256("WebAppData", token)` | `SHA256(token)` |
| Ma'lumot | imzolangan **satr** | imzolangan **obyekt** |
| Kod | `auth.verify_telegram()` | `auth.verify_telegram_widget()` |

Ikkalasi ataylab alohida funksiya. Bittaga birlashtirilsa, xato jim
o'tardi: imzo doim mos kelmay, 401 qaytaverar, kod esa to'g'ri
ko'rinaverardi. `auth.verify_any()` qaysi biri kelganini o'zi aniqlaydi.

Veb saytdagi tugma uchun `BOT_USERNAME` va BotFather'da `/setdomain`
kerak — `.env.example` da to'liq izoh bor.

### Ro'yxatdan o'tish

Ism ham, familiya ham to'ldirilgan hisob `registered_at` oladi. Reyting
FAQAT shunday hisoblarni ko'rsatadi: ismsiz qatorlar jadvalni "Noma'lum"
bilan to'ldirib tashlagan bo'lardi.

Bir marta o'tilgach `registered_at` hech qachon tozalanmaydi. Aks holda
familiyasini o'chirgan foydalanuvchi ro'yxat oynasiga qaytib tushar va
undan chiqa olmay qolardi.

Ism `serializers._ismni_tekshir()` dan o'tadi: kamida 2 belgi, raqam va
tinish belgilari yo'q. Tekshiruv ataylab yumshoq — server qaysi ism
"haqiqiy" ekanini bilolmaydi va qattiq urinsa, haqiqiy ismli odamlarni
ham to'sib qo'yardi. Uchala apostrof (`o'`, `o’`, `oʻ`) qabul qilinadi.

### Xavfsizlik qoidalari

- **Token bazada ochiq saqlanmaydi** — faqat sha256 xeshi (`core/auth.py`).
  Baza o'g'irlansa ham hech kim o'sha tokenlar bilan kira olmaydi.
- **Telegram initData imzosi tekshiriladi.** Busiz har kim boshqa bolaning
  nomidan yozib ketishi mumkin bo'lardi.
- **Faqat bizning localStorage kalitlari qabul qilinadi**
  (`azapp_*`, `aqlzone_*`, `aqlvoy_*`) — aks holda mijoz serverga xohlagan
  narsasini yozib qo'yardi.
- **Kelgan sonlar chegaralanadi**, xato qaytarilmaydi: internet uzilganda
  bolaning natijasi umuman saqlanmay qolmasin.
- **Progress kamaymaydi**: hisoblar birlashtirilganda yulduzi ko'proq nusxa
  ustun turadi.

## Nima uchun `django.contrib.auth` yo'q

Bizda parol ham, email ham, xodim hisobi ham yo'q — bola tokeni bilan kiradi.
Shuning uchun `auth` va `admin` ilovalari o'rnatilmagan; `Pupil` modeli
DRF uchun kerakli `is_authenticated` xossasini o'zi beradi.
Ma'lumotni ko'rish kerak bo'lsa: `manage.py shell`.
