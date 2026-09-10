"""
Fon vazifalari — Celery.

─────────────────── IKKITA TUR ───────────────────

  buyruq()          jadval bo'yicha ishlaydigan `manage.py` buyrug'i
  telegram_xabar()  yo'qolmasligi kerak bo'lgan bitta xabar

Uchinchisi yo'q va bu ataylab: har ishni fonga surish oson, lekin
har bir fon vazifasi — kuzatilishi kerak bo'lgan yangi joy. Faqat
ikkita sabab bor edi (`aqlzone/celery.py`) va shu ikkitasi yopiladi.

─────────────────── MANTIQ BU YERDA EMAS ───────────────────

Vazifalar o'zi hech narsa hisoblamaydi — ular mavjud kodni
chaqiradi. Sabab: shu kod buyruq satridan ham, ilovadagi tugmadan
ham ishlaydi va uch nusxa bo'lishi mumkin emas. Bu yerda faqat
"qachon" va "necha marta urinish" turadi.
"""
from __future__ import annotations

import logging

from celery import shared_task
from django.core.management import call_command

log = logging.getLogger(__name__)

#: Telegram xatosidan keyin necha marta qayta urinish.
#:
#: Uch — tarmoq uzilishi uchun yetarli va "bot bloklangan" kabi
#: qaytarib bo'lmaydigan holatda behuda urinish qilmaydi (u holat
#: `xabar.yubor` da alohida qaytadi va qayta urinilmaydi).
URINISH = 3

#: Qayta urinishlar orasidagi kutish (soniya): 10 → 60 → 360.
KUTISH = 10


@shared_task(name="core.vazifalar.buyruq")
def buyruq(nom: str, *argumentlar: str) -> None:
    """
    `manage.py` buyrug'ini jadval bo'yicha yuritadi.

    Har bir buyruq uchun alohida vazifa yozish ham mumkin edi, lekin
    ular bir xil bo'lardi — nomidan boshqa hech narsasi bilan
    farq qilmasdi. Jadval esa bitta joyda, ko'z bilan o'qiladigan
    holda turadi (`aqlzone/celery.py`).

    Xato YUTILMAYDI: u Celery jurnaliga to'liq iz bilan tushadi.
    Ilgari bu chiqish `/var/log/aqlzone-*.log` ga yozilardi va u
    yerga hech kim qaramasdi.
    """
    log.info("vazifa boshlandi: %s %s", nom, " ".join(argumentlar))
    call_command(nom, *argumentlar)


@shared_task(
    name="core.vazifalar.telegram_xabar",
    bind=True,
    max_retries=URINISH,
    autoretry_for=(Exception,),
    retry_backoff=KUTISH,
    retry_jitter=True,
)
def telegram_xabar(self, chat_id: str, matn: str, **maydonlar) -> str:
    """
    Bitta Telegram xabari — yo'qolmaydigan qilib.

    Ilgari bunday xabarlar `threading.Thread` bilan ketardi va
    konteyner o'sha lahzada qayta ishga tushsa — xabar jimgina
    yo'qolardi. Endi u Redis'da turadi: ishchi yiqilsa, vazifa
    navbatga qaytadi.

    ─────────────── QAYSI XATODA QAYTA URINILADI ───────────────

    Faqat `xato` da. `bloklandi` — bu odam botni bloklagan degani
    va uni yuz marta urinish ham o'zgartirmaydi; `yuborildi` esa
    allaqachon yetib borgan.

    Qayta urinish `Exception` orqali boshlanadi, chunki
    `xabar.yubor` xato KO'TARMAYDI — u holatni satr bo'lib
    qaytaradi. Shuning uchun holatni o'zimiz tekshirib, kerak
    bo'lsa ko'taramiz.
    """
    from . import xabar as X

    holat, izoh = X.yubor(chat_id, matn, **maydonlar)
    if holat == "xato":
        log.warning("xabar ketmadi (%s/%s): %s",
                    self.request.retries + 1, URINISH + 1, izoh)
        raise RuntimeError(f"telegram: {izoh}")
    return holat


def fonda(vazifa, *args, **kwargs) -> None:
    """
    Vazifani navbatga qo'yadi — navbat bo'lmasa, joyida bajaradi.

    ─────────────── NEGA O'RAM KERAK ───────────────

    `vazifa.delay()` broker bo'lmaganda ham ishlaydi
    (`task_always_eager`), lekin u paytda xato CHAQIRUVCHIGA
    ko'tariladi — ya'ni bildirishnoma yuborilmagani butun
    ro'yxatdan o'tishni yiqitardi. Holbuki bu fon ishi va uning
    nosozligi asosiy amalni to'xtatmasligi kerak.

    Shuning uchun o'ram: navbat bo'lsa — qo'yadi, bo'lmasa —
    joyida bajaradi va xatoni yutadi (jurnalga yozib).
    """
    try:
        vazifa.delay(*args, **kwargs)
    except Exception:                                # noqa: BLE001
        # Navbatga qo'yib ham bo'lmadi (Redis o'chgan). Asosiy amal
        # bundan to'xtamasligi kerak.
        log.exception("vazifani navbatga qo'yib bo'lmadi: %s", vazifa.name)
