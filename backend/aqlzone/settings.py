"""
Aql Zone — Django sozlamalari.

Muhim g'oya (eski Node backenddan meros): foydalanuvchi Telegram'ga BOG'LANMAGAN.
Bola avval qurilma id bilan anonim kiradi, xohlasa keyin Telegram'ga bog'laydi.
Shu sabab bir xil API Telegram Mini App'da ham, APK/iOS'da ham ishlaydi.

Sozlash uchun .env fayl (yoki muhit o'zgaruvchilari) ishlatiladi — .env.example ga qarang.
"""
import sys
from pathlib import Path

from .env import env, env_bool, env_list

BASE_DIR = Path(__file__).resolve().parent.parent

# Loyiha ildizi — React ilovaning yig'ilgan nusxasi shu yerdan topiladi.
PROJECT_ROOT = BASE_DIR.parent

#: Sozlanmagan kalitning qiymati. Pastdagi tekshiruv shunga qaraydi.
_ZAXIRA_KALIT = "dev-only-insecure-key-almashtiring"

SECRET_KEY = env("SECRET_KEY", _ZAXIRA_KALIT)
DEBUG = env_bool("DEBUG", True)
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", ["*"])

# Ishlab chiqarishda standart kalit bilan ishga tushmaymiz.
#
# Bu ataylab QATTIQ to'xtatadi: kalit imzo uchun ishlatiladi va u ommaga
# ma'lum bo'lsa, sessiyalarni qalbakilashtirish mumkin. Ogohlantirish
# yozib qo'yish yetarli emas — uni hech kim o'qimaydi va sayt oylab shu
# holda ishlab ketaveradi.
if not DEBUG and SECRET_KEY == _ZAXIRA_KALIT:
    raise RuntimeError(
        "SECRET_KEY sozlanmagan. .env ga yozing:\n"
        '  python -c "import secrets; print(secrets.token_urlsafe(50))"'
    )

# Telegram Mini App HTTPS ostida ishlaydi va tunnel domeni har safar o'zgaradi,
# shuning uchun CSRF ishonchli manbalarini muhitdan olamiz.
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", [])

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "rest_framework",
    "core",
]

# Diqqat: `manage.py check --deploy` ikkita narsaning yo'qligidan shikoyat
# qiladi. Ikkalasi ham ATAYLAB qo'shilmagan:
#
#   CsrfViewMiddleware — CSRF hujumi cookie'ga tayanadi. Bizda cookie yo'q,
#     himoya `Authorization: Bearer` sarlavhasi orqali, uni esa boshqa sayt
#     brauzer nomidan yubora olmaydi. Middleware faqat ortiqcha to'siq
#     bo'lardi (mobil ilova token olishdan oldin CSRF token so'rashi kerak edi).
#
#   XFrameOptionsMiddleware — Telegram Mini App saytni O'ZINING ramkasida
#     ochadi. `X-Frame-Options: DENY` qo'ysak, Telegram Web'da ilova umuman
#     ochilmay qoladi. Ya'ni bu sarlavha bu yerda himoya emas, nosozlik.
MIDDLEWARE = [
    # CORS eng birinchi bo'lishi shart — preflight boshqa hech kimga yetib bormaydi.
    "core.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "aqlzone.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": []},
    },
]

WSGI_APPLICATION = "aqlzone.wsgi.application"
ASGI_APPLICATION = "aqlzone.asgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": env("DB_FILE", str(BASE_DIR / "az-data.sqlite3")),
        "OPTIONS": {
            # WAL — bir vaqtda o'qish va yozish tez bo'lsin.
            "init_command": "PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;",
            # SQLite'da bir vaqtda FAQAT BITTA yozuvchi bo'ladi. WAL o'qishni
            # to'smaydi, lekin ikki yozuv to'qnashsa ikkinchisi darhol
            # "database is locked" bilan yiqilardi — foydalanuvchi uchun bu
            # 500 xato. Kutish esa bu holatni butunlay yo'q qiladi: yozuvlar
            # qisqa (bir necha millisekund), navbat ko'rinmaydi.
            "timeout": 15,
        },
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

LANGUAGE_CODE = "uz"
TIME_ZONE = "Asia/Tashkent"
USE_I18N = False
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# React ilovaning yig'ilgan nusxasi (npm run build → frontend/dist).
# Bo'lsa — Django uni SPA sifatida beradi va /kurs/1-sinf kabi URL'lar
# sahifa yangilanganda ham ishlaydi.
FRONTEND_DIST = Path(env("FRONTEND_DIST", str(PROJECT_ROOT / "frontend" / "dist")))

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["core.auth.BearerTokenAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "UNAUTHENTICATED_USER": None,
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "300/min", "user": "600/min"},
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
}
if DEBUG:
    # Ishlab chiqishda brauzerdan API'ni ko'rish qulay bo'lsin.
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ]

# BotFather tokeni. Bo'sh bo'lsa Telegram orqali kirish o'chadi,
# qurilma orqali kirish va statik fayllar baribir ishlayveradi.
BOT_TOKEN = env("BOT_TOKEN", "")

# Mini App qaysi manzilda ochiladi. Bot shu havolani tugma qilib yuboradi.
# HTTPS majburiy — Telegram boshqasini qabul qilmaydi.
MINI_APP_URL = env("MINI_APP_URL", "")

# Saytning ochiq manzili. Bot "Saytga kirish" havolasini shu manzil bilan
# yasaydi: {SAYT_URL}/kirish/<kod>.
#
# Alohida o'zgaruvchi, chunki ikkisi har doim ham bir xil emas: Mini App
# boshqa yo'lda (masalan /app) turishi mumkin. Bo'sh bo'lsa MINI_APP_URL
# ishlatiladi — eng ko'p uchraydigan holatda ikkalasi bir xil va odam
# bitta qiymat yozib qutuladi.
SAYT_URL = (env("SAYT_URL", "") or MINI_APP_URL).rstrip("/")

# Bot nomi (@siz). Faqat xabar matnida ko'rsatish uchun.
BOT_USERNAME = env("BOT_USERNAME", "")

# Sessiya tokeni necha kun amal qiladi.
SESSION_TTL_DAYS = int(env("SESSION_TTL_DAYS", "180"))

# Telegram kanali — ilovadagi "kanalga qo'shiling" oynasi uchun.
#
# Bo'sh bo'lsa oyna umuman chiqmaydi. Ishlashi uchun BOT O'SHA KANALDA
# ADMINISTRATOR bo'lishi shart: a'zolikni `getChatMember` bilan faqat
# admin so'ray oladi. Batafsil — `core/kanal.py`.
KANAL = env("KANAL", "")

# Boshqaruv panelining (/boshqaruv) administratorlari — Telegram id'lari,
# vergul bilan.
#
# Shu ro'yxatdagi odam botga /boshqaruv yozsa, bot unga 10 daqiqa amal
# qiladigan kirish havolasini yuboradi. Ro'yxat SERVERDA turadi va uni
# faqat .env ga kira oladigan odam o'zgartiradi; ya'ni birovning Telegram
# id sini bilish o'z-o'zidan hech narsa bermaydi.
#
# Parol bilan kirish yo'li ATAYLAB yo'q — sababi `core/boshqaruv.py` da.
ADMIN_TG = [x for x in env_list("ADMIN_TG_IDS", []) if x]

# Panel umuman yoqilganmi. Ro'yxat bo'sh bo'lsa /boshqaruv manzili
# BUTUNLAY yo'q (404).
#
# Standart holat ataylab "yopiq": sozlashni unutilgan server butun
# foydalanuvchilar ro'yxatini ochiq qoldirib ketmasligi kerak.
BOSHQARUV_YONIQ = bool(ADMIN_TG)

# Telefon raqami shu SANADAN keyin ochilgan hisoblar uchun majburiy.
#
# Nega sana, hammaga birdan emas: raqam talabi joriy qilingan paytda
# ilovada allaqachon o'nlab odam bor edi va ular hisobini raqamsiz
# ochgan. Ularni bir kunda darvoza oldida qoldirish — ishonchni
# yo'qotishning eng tez yo'li: bola kecha o'ynagan ilovaga bugun kira
# olmay qoladi va nega ekanini tushunmaydi.
#
# Eskilar avvalgidek ishlaydi, raqam esa ulardan KEYINROQ, e'lon
# orqali so'raladi (`/boshqaruv/reklama`).
#
# Sana `.env` da o'zgartiriladi. Bo'sh qoldirilsa raqam hech kimga
# majburiy bo'lmaydi — ya'ni standart holat "yopiq" emas, "ochiq":
# noto'g'ri sozlangan server odamlarni ilovadan chiqarib yubormaydi.
RAQAM_MAJBURIY_DAN = env("RAQAM_MAJBURIY_DAN", "")

# ----------------------------------------------------------------- ovoz
#
# Aisha (aisha.group) — o'zbekcha TTS. Kalit: space.aisha.group/api-keys
#
# Bo'sh bo'lsa ovoz YASALMAYDI, lekin allaqachon keshda turgan fayllar
# avvalgidek beriladi. Ya'ni kalit tugasa yoki olib qo'yilsa, ilova
# jimib qolmaydi — u faqat YANGI so'zni ayta olmaydi.
#
# `AISHA_API_KEY` — eski nom. U `.env` da allaqachon turgan bo'lishi
# mumkin va ikki yarim sozlangan nom bitta sozlanganidan yomonroq:
# kalit qo'yilgan-u, ovoz chiqmaydi degan holat tug'ilardi.
AISHA_KEY = env("AISHA_KEY", "") or env("AISHA_API_KEY", "")

# Ovoz va kayfiyat. Ular fayl xeshiga kiradi (`core/ovoz.py`), shuning
# uchun almashtirilganda eski fayllar o'z-o'zidan ishlatilmay qoladi va
# ilova ikki xil ovozda gapirib qolmaydi.
AISHA_MODEL = env("AISHA_MODEL", "Gulnoza")

# Kayfiyat "Neutral", "Cheerful" EMAS.
#
# Ikkalasi yonma-yon tinglab tanlandi. "Cheerful" quvnoq eshitiladi,
# lekin unda ohang ko'tarilib-tushib turadi va o'zbekcha talaffuzda bu
# YOT AKSENT bo'lib sezilardi — go'yo so'zlovchi tilni yaxshi
# bilmaydi. "Neutral" esa tinch va tabiiy: bola nomni aniq eshitadi.
AISHA_KAYFIYAT = env("AISHA_KAYFIYAT", "Neutral")

# Bolalar uchun sekinroq. 1.0 — odatdagi tezlik.
AISHA_TEZLIK = env("AISHA_TEZLIK", "0.9")

# Maqtov so'zi ("Barakalla!") undan ham sekin aytiladi.
#
# Yakka undov qisqa bo'lgani uchun TTS uni shoshib o'qiydi va oxirgi
# bo'g'in yutilib ketadi. Aynan shu payt esa bolaning mukofoti —
# u maqtovni ANIQ eshitishi kerak. Ro'yxat `core/ovoz.py` da (`SEKIN`).
AISHA_TEZLIK_MAQTOV = env("AISHA_TEZLIK_MAQTOV", "0.8")

# Yasalgan fayllar qayerda yotadi. Docker'da bu volume (`/data`) —
# konteyner qayta qurilganda kesh saqlanib qolishi kerak, aks holda
# har joylashda butun lug'at qaytadan yasalib, qaytadan pul ketardi.
OVOZ_KESH = env("OVOZ_KESH", str(Path("/data") / "ovoz") if Path("/data").exists()
                else str(BASE_DIR / "ovoz-kesh"))

# Bir kunda eng ko'pi shuncha BELGI yangidan yasalishi mumkin.
#
# Bu pulni himoya qiladi. Butun kichkintoylar lug'ati ~700 belgi, ya'ni
# odatdagi kun bu chegaraga umuman yaqinlashmaydi: fayllar bir marta
# yasaladi va keyin keshdan ketadi. Chegara faqat bitta holatda ishga
# tushadi — kimdir endpointni bepul TTS deb ishlatmoqchi bo'lganda.
OVOZ_KUNLIK_BELGI = int(env("OVOZ_KUNLIK_BELGI", "20000"))

# Sinov ishlayaptimi (`manage.py test`).
#
# Faqat BIR narsa uchun kerak: yangi ro'yxatdan o'tganda adminga
# ketadigan xabar sinovda yuborilmasin. Ro'yxatdan o'tish o'nlab testda
# uchraydi va ularning har biri haqiqiy Telegram'ga chiqib ketardi —
# sekin ham, noto'g'ri ham. Boshqa hech qayerda ishlatilmaydi: kodning
# "sinovdami?" deb turli yo'l tutishi odatda xatoni yashiradi.
TESTDA = "test" in sys.argv

# Mobil ilova boshqa origin'dan chaqiradi. Cookie ishlatilmaydi —
# himoya Bearer token orqali, shuning uchun "*" xavfsiz.
CORS_ALLOW_ORIGIN = env("CORS_ALLOW_ORIGIN", "*")

# ---------------------------------------------------------------- HTTPS
#
# Bularning hammasi muhitdan boshqariladi va standart holatda O'CHIQ.
# Sabab: ilova nginx yoki Cloudflare ortida ham, to'g'ridan-to'g'ri ham
# ishlashi mumkin. Sozlamani kod ichida majburlab qo'ysak, HTTPS hali
# ulanmagan serverda sayt cheksiz qayta yo'naltirishga tushib qolardi.

# Proksi ortidagi so'rov HTTPS ekanini Django shu sarlavhadan biladi.
# nginx/Cloudflare uni o'zi qo'yadi. Busiz `request.is_secure()` doim
# False bo'lib, qayta yo'naltirish halqaga aylanadi.
if env_bool("PROKSI_ORTIDA", False):
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# HTTP so'rovni HTTPS ga yo'naltirish. Odatda buni nginx bajaradi;
# bajarmasa — shu yerdan yoqing.
SECURE_SSL_REDIRECT = env_bool("SSL_MAJBURIY", False)

# HSTS — brauzerga "bu saytga faqat HTTPS bilan kir" deb aytadi.
#
# EHTIYOT BO'LING: brauzer buni ESLAB QOLADI va berilgan muddat davomida
# HTTP ga umuman murojaat qilmaydi. Sertifikat muddati o'tib ketsa yoki
# HTTPS buzilsa, sayt shu muddat tugagunicha ochilmaydi. Shuning uchun
# uni faqat HTTPS barqaror ishlaganiga ishonch hosil qilgach yoqing va
# kichik qiymatdan boshlang (masalan 3600), keyin oshiring.
SECURE_HSTS_SECONDS = int(env("HSTS_SEKUND", "0"))
if SECURE_HSTS_SECONDS:
    SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("HSTS_SUBDOMEN", False)
    SECURE_HSTS_PRELOAD = env_bool("HSTS_PRELOAD", False)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}
