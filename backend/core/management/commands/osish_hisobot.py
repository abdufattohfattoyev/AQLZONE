"""
O'sish tahlili (`core/osish.py`).

    osish_hisobot --surat    kun oxiridagi surat (kanal obunachilari tarixi)
    osish_hisobot            haftalik hisobotni adminlarga yuboradi
    osish_hisobot --sinov    hisobotni faqat ekranga chiqaradi
"""
from django.conf import settings
from django.core.management.base import BaseCommand

from core import osish as O
from core import xabar as X


class Command(BaseCommand):
    help = "O'sish surati yoki haftalik o'sish hisoboti"

    def add_arguments(self, parser):
        parser.add_argument("--surat", action="store_true", help="bugungi suratni yozish")
        parser.add_argument("--sinov", action="store_true", help="yubormasdan chiqarish")

    def handle(self, *args, **o):
        if o["surat"]:
            q = O.surat()
            self.stdout.write(f"surat {q.sana}: kanal={q.kanal_azo} hisob={q.hisoblar} "
                              f"yangi={q.yangi} faol={q.faol}")
            return

        matn = O.hisobot_matni()
        if o["sinov"]:
            self.stdout.write(matn)
            return
        adminlar = [str(x) for x in getattr(settings, "ADMIN_TG", []) if x]
        for tg in adminlar:
            holat, izoh = X.yubor(tg, matn)
            self.stdout.write(f"{tg}: {holat} {izoh}")
