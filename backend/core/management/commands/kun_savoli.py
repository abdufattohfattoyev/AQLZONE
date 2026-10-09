"""
Botdagi shaxsiy kun savoli (`core/kun_savoli.py`).

    python manage.py kun_savoli yubor --sinov            # kimga qaysi savol — yubormaydi
    python manage.py kun_savoli yubor --faqat 12345678   # faqat shu Telegram id ga
    python manage.py kun_savoli yubor                    # hammaga (jadvalda 16:30)
    python manage.py kun_savoli hisobot [--sinov]        # adminlarga kunlik hisobot (22:00)
    python manage.py kun_savoli rasm --daraja 7-sinf --fayl /tmp/k.jpg   # rasmni ko'rish
"""
from __future__ import annotations

from django.conf import settings
from django.core.management.base import BaseCommand

from core import kun_savoli as KS


class Command(BaseCommand):
    help = "Botdagi kun savoli: yuborish va admin hisoboti"

    def add_arguments(self, parser):
        parser.add_argument("amal", choices=["yubor", "hisobot", "rasm"])
        parser.add_argument("--sinov", action="store_true", help="yubormaydi, faqat ko'rsatadi")
        parser.add_argument("--faqat", default="", help="faqat shu Telegram id ga")
        parser.add_argument("--limit", type=int, default=KS.CHEKLOV)
        parser.add_argument("--daraja", default="7-sinf")
        parser.add_argument("--fayl", default="kun-savoli.jpg")

    def handle(self, *args, **o):
        amal = o["amal"]
        if amal == "rasm":
            ks = KS.bugungi(o["daraja"])
            with open(o["fayl"], "wb") as f:
                f.write(KS.rasm(ks))
            self.stdout.write(f"{o['fayl']}: {ks.savol} · {ks.variantlar} · to'g'ri {ks.togri}")
            return

        if not settings.BOT_TOKEN and not o["sinov"]:
            self.stderr.write(self.style.ERROR("BOT_TOKEN sozlanmagan"))
            return

        if amal == "hisobot":
            if o["sinov"]:
                self.stdout.write(KS.hisobot_matni())
                return
            n = KS.hisobot_yubor()
            self.stdout.write(self.style.SUCCESS(f"hisobot {n} ta adminga yuborildi"))
            return

        sanoq = KS.yubor_hammaga(sinov=o["sinov"], limit=o["limit"], faqat=o["faqat"],
                                 chiqar=self.stdout.write)
        holat = "yuborilardi" if o["sinov"] else "yuborildi"
        self.stdout.write(self.style.SUCCESS(
            f"{sanoq['yuborildi']} ta {holat}, {sanoq['otkazildi']} ta bugun olgan, "
            f"{sanoq['bloklandi']} ta bloklagan, {sanoq['xato']} ta xato"))
