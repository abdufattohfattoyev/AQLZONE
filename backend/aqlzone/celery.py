"""
Celery — fon vazifalari va jadval.

─────────────────── NEGA UMUMAN KERAK ───────────────────

Ikki narsa uchun, va faqat shu ikkisi uchun:

1. JADVAL KODDA TURSIN. Ilgari u serverning `crontab` ida edi —
   ya'ni git'da yo'q. Serverni ko'chirsak yoki qayta o'rnatsak,
   jadval jimgina yo'qolardi va buni faqat kanalga post chiqmay
   qolgandagina bilardik.

2. XABAR YO'QOLMASIN. Duel chaqiruvi va admin bildirishnomasi
   `threading.Thread` bilan ketardi. Konteyner o'sha lahzada qayta
   ishga tushsa — xabar jimgina yo'qolardi va uni hech kim
   qidirmasdi. Celery esa vazifani Redis'da saqlaydi: ishchi
   yiqilsa, boshqasi (yoki o'sha) uni qaytadan oladi.

─────────────────── BROKER BO'LMASA HAM ISHLAYDI ───────────────

`CELERY_BROKER_URL` berilmasa vazifalar DARHOL, o'sha yerda
bajariladi (`task_always_eager`). Bu ishlab chiqish uchun: lokal
mashinada Redis ko'tarish, uni yodda tutish va ishchi jarayonni
alohida ishga tushirish kerak bo'lardi — loyihaga kirish narxi
oshardi. Xuddi baza bilan bo'lgani kabi (`settings.py`).

Sinovlar ham shu rejimda ketadi va bu ATAYLAB: vazifa haqiqatan
chaqirilganini tekshirish uchun navbat kerak emas, natija esa
bir xil.
"""
import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "aqlzone.settings")

app = Celery("aqlzone")

# Sozlamalar Django'dan olinadi — `CELERY_` bilan boshlanganlari.
# Ikkinchi sozlama fayli bo'lmasin: bitta joyda tursa, u yerda
# nima borligini bir qarashda ko'rish mumkin.
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


#: Jadval — ilgari serverning `crontab` ida turgan to'rtta ish.
#:
#: Soatlar TOSHKENT vaqtida (`CELERY_TIMEZONE`). Cron'da bu
#: muammo edi: server soati CEST, konteynerniki UTC, bolalar esa
#: Toshkentda — shuning uchun buyruqlar `--soat` bilan chaqirilib,
#: kerakli soatni o'zlari kutardi. Endi kutish kerak emas va
#: `--soat` ham berilmaydi.
app.conf.beat_schedule = {
    # Kunlik son xabari — 17:30, umumiy eslatmadan OLDIN. Sabab:
    # o'ynaydigan odamga jumboq haqidagi xabar foydaliroq, umumiy
    # eslatma esa uni `eslatma_at` bo'yicha o'tkazib yuboradi (ya'ni
    # bir odam bir kunda ikkita xabar olmaydi).
    "kunlik-son-xabari": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=17, minute=30),
        "args": ("kunlik_eslatma",),
    },
    # Kunlik son natijalari kanalga — kun tugagach.
    "kunlik-son-kanal": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=21, minute=0),
        "args": ("kunlik_kanal",),
    },
    # Kunlik eslatma — 18:00. Ertalab yuborilgani darsga ketayotgan
    # bolada ochilmaydi va o'qilmagan xabar bo'lib qoladi.
    "kunlik-eslatma": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=18, minute=0),
        "args": ("eslatma",),
    },
    # Haftalik hisobot ota-onaga — yakshanba kechqurun: hafta tugagan,
    # ota-ona uyda va keyingi haftani rejalashtiradi. Faqat yoqqanlarga.
    "haftalik-hisobot": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=20, minute=0, day_of_week=0),
        "args": ("haftalik_hisobot",),
    },
    # Kunlik masala kanalga — o'sha soatda.
    "kunlik-masala": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=18, minute=5),
        "args": ("masala_post", "--kunlik"),
    },
    # ── Matematika rukni (`core/matematika_kanal.py`) ──
    # Lentalar faqat oxirgi 15–30 xabarni saqlaydi — kun davomida
    # yig'ib boriladi, aks holda ertalabgi yangilik kechgacha lentadan
    # tushib ketardi.
    "matematika-yigish": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(minute=20, hour="*/2"),
        "args": ("matematika_kanal", "yigish"),
    },
    # 10:00 — yangilik bo'lsa yangiliklar, bo'lmasa qiziq fakt. Ertalab:
    # kechki masala (18:05) va natijalar (21:00) postlaridan uzoqda.
    "matematika-post": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=10, minute=0),
        "args": ("matematika_kanal", "avto"),
    },
    # Kun misollari — HAR KUNI uchta, alohida post: boshlang'ich sinf
    # (13:00, darsdan keyin), maktab (14:00), oliy (16:00). 15:00 —
    # test/albom joyi, shuning uchun bo'sh. Soatlar `MK.BOSQICHLAR`
    # bilan bir xil bo'lsin — ular postda yozib qo'yiladi.
    "matematika-misol-boshlangich": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=13, minute=0),
        "args": ("matematika_kanal", "misol", "--bosqich", "boshlangich"),
    },
    "matematika-misol-maktab": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=14, minute=0),
        "args": ("matematika_kanal", "misol", "--bosqich", "maktab"),
    },
    "matematika-misol-oliy": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=16, minute=0),
        "args": ("matematika_kanal", "misol", "--bosqich", "oliy"),
    },
    # Uchalasining javobi — bitta postda, 20:00 da (`MK.JAVOB_SOATI`).
    # Shu orada o'quvchilar javobini izohda yozadi.
    "matematika-misol-javob": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=20, minute=0),
        "args": ("matematika_kanal", "javob"),
    },
    # Tez test (kattalar uchun, quiz) — misolsiz kunlarda (dush, chor,
    # jum), o'sha 15:00 da. Javob so'rovnomaning o'zida — alohida post yo'q.
    "matematika-test": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=15, minute=0, day_of_week="1,3,5"),
        "args": ("matematika_kanal", "test"),
    },
    # Albom (suriladigan kartalar, `core/albom_kanal.py`) — yakshanba,
    # o'sha 15:00 da: bu kuni misol ham, test ham yo'q, o'rin bo'sh.
    # Haftada bitta: mazmuni qo'lda yozilgan va tez tugab qolmasin.
    "matematika-albom": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=15, minute=0, day_of_week=0),
        "args": ("matematika_kanal", "albom"),
    },
    # ── O'sish tahlili (`core/osish.py`) ──
    # Kun oxiridagi surat: Telegram kanal obunachilarining TARIXINI
    # bermaydi — yozib borilmasa "hafta davomida +40" deb bo'lmaydi.
    "osish-surat": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=23, minute=55),
        "args": ("osish_hisobot", "--surat"),
    },
    # Haftalik o'sish hisoboti adminlarga — dushanba ertalab, hafta
    # boshida: nima ishlaganini ko'rib, yangi haftani rejalashtirish uchun.
    "osish-hisobot": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=9, minute=5, day_of_week=1),
        "args": ("osish_hisobot",),
    },
    # ── DTM marafoni (`core/marafon.py`) ──
    # 19:00 — bugun hali ishlamagan qatnashchilarga (kunlik eslatmadan
    # oldin emas, keyin: 18:00 dagisi umumiy, bu esa marafon zanjiri haqida).
    "marafon-eslatma": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=19, minute=0),
        "args": ("marafon", "eslatma"),
    },
    # Reklama roligi kanalga — 19:00, haftalik to'plam navbatidan bittadan
    # (`rolik_post`). Kechqurun: o'quvchi darsdan bo'shagan, kunlik masala
    # (18:05) bilan bir soat oralig'i bor.
    "rolik-post": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=19, minute=0),
        "args": ("rolik_post",),
    },
    # Tugagan marafonning g'oliblari kanalga — bir marta (`elon_at`).
    "marafon-yakun": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=10, minute=30),
        "args": ("marafon", "yakun"),
    },
    # O'tgan haftaning DTM/sertifikat reytingi kanalga — dushanba 12:00
    # (`reyting_post`): ijtimoiy isbot, yangi haftaga taklif bilan.
    "reyting-post": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=12, minute=0, day_of_week=1),
        "args": ("reyting_post",),
    },
    # Kanaldagi postlar joyidami — kuniga bir marta yetarli.
    "kanal-tekshiruvi": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=9, minute=0),
        "args": ("kanal_tekshir",),
    },
    # Post ostidagi "Masalani yechganlar" soni — har o'n besh daqiqada.
    "kanal-sanoqi": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(minute="*/15"),
        "args": ("kanal_yangila",),
    },
}
