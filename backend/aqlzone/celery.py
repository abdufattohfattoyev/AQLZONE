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
    # Kunlik eslatma — 18:00. Ertalab yuborilgani darsga ketayotgan
    # bolada ochilmaydi va o'qilmagan xabar bo'lib qoladi.
    "kunlik-eslatma": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=18, minute=0),
        "args": ("eslatma",),
    },
    # Kunlik masala kanalga — o'sha soatda.
    "kunlik-masala": {
        "task": "core.vazifalar.buyruq",
        "schedule": crontab(hour=18, minute=5),
        "args": ("masala_post", "--kunlik"),
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
