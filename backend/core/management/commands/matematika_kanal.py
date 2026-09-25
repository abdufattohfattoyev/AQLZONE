"""
Kanaldagi matematika rukni (`core/matematika_kanal.py`).

    python manage.py matematika_kanal yigish          # lentalardan yangilik yig'adi (har 2 soatda)
    python manage.py matematika_kanal avto            # 10:00 — yangilik bo'lsa yangilik, bo'lmasa fakt
    python manage.py matematika_kanal fakt            # qiziq fakt
    python manage.py matematika_kanal misol           # og'zaki misol (javobi yashirin)
    python manage.py matematika_kanal avto --sinov    # yubormaydi, matnni ko'rsatadi
"""
from __future__ import annotations

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core import matematika_kanal as MK
from core import xabar as X
from core.models import KanalYozuv


class Command(BaseCommand):
    help = "Kanalga matematika yangiligi, qiziq fakt yoki og'zaki misol joylaydi"

    def add_arguments(self, parser):
        parser.add_argument("tur", choices=["yigish", "avto", "fakt", "misol"])
        parser.add_argument("--sinov", action="store_true", help="yubormaydi, faqat ko'rsatadi")

    def handle(self, *args, **o):
        tur, sinov = o["tur"], o["sinov"]

        if tur == "yigish":
            n = MK.yigish()
            self.stdout.write(self.style.SUCCESS(f"yangi matematika yangiligi: {n} ta"))
            return

        # Joylashdan OLDIN bir marta yig'amiz: ertalabgi yangilik
        # oxirgi yig'ishdan keyin chiqqan bo'lishi mumkin.
        if tur == "avto":
            try:
                MK.yigish()
            except Exception as e:  # yig'ish ishlamasa ham fakt chiqaveradi
                self.stderr.write(f"yig'ish xatosi: {e}")

        yangiliklar = MK.kutayotgan_yangiliklar() if tur == "avto" else []
        fakt = misol = None
        if yangiliklar:
            matn = MK.yangilik_posti(yangiliklar)
        elif tur == "misol":
            misol = MK.bugungi_misol()
            matn = MK.misol_posti(misol)
        else:
            fakt = MK.keyingi_fakt()
            matn = MK.fakt_posti(fakt)

        if sinov:
            self.stdout.write(matn)
            self.stdout.write(self.style.SUCCESS("(sinov — yuborilmadi)"))
            return

        kanal = getattr(settings, "KANAL", "") or ""
        if not kanal or not settings.BOT_TOKEN:
            self.stderr.write(self.style.ERROR("KANAL yoki BOT_TOKEN sozlanmagan"))
            return
        kanal = kanal if kanal.startswith(("@", "-")) else f"@{kanal}"

        # Postning ostida — ilovaga yo'l. Kanal o'quvchisi uchun keyingi
        # qadam aynan shu: o'qidi, endi o'zi yechib ko'rsin.
        #
        # `?startapp` (qiymatsiz) — Mini App'ni bosh sahifada ochadi.
        # Kanalda `web_app` tugmasi TAQIQLANGAN (Telegram uni faqat
        # shaxsiy chatda qabul qiladi), shuning uchun oddiy havola.
        bot = (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")
        havola = f"https://t.me/{bot}?startapp" if bot else X.ilova_havolasi()
        holat, izoh = X.yubor(kanal, matn, tugma="🧮 Mashq qilish", havola=havola)
        if holat != "yuborildi":
            self.stderr.write(self.style.ERROR(f"yuborilmadi: {holat} {izoh}"))
            return

        hozir = timezone.now()
        if yangiliklar:
            KanalYozuv.objects.filter(pk__in=[y.pk for y in yangiliklar]).update(joylangan_at=hozir)
        if fakt:
            MK.fakt_belgila(fakt)
        self.stdout.write(self.style.SUCCESS(
            f"kanalga joylandi: {'yangilik' if yangiliklar else 'misol' if misol else 'fakt'}"))
