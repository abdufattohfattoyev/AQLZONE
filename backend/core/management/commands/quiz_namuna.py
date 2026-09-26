"""
Quiz namunalarini adminlarga yuboradi (`core/quiz_namuna.py`).

    python manage.py quiz_namuna
"""
from django.conf import settings
from django.core.management.base import BaseCommand

from core import quiz_namuna as QN


class Command(BaseCommand):
    help = "Kanal uchun quiz namunalarini adminlarga tasdiqlashga yuboradi"

    def handle(self, *args, **o):
        if not settings.ADMIN_TG or not settings.BOT_TOKEN:
            self.stderr.write(self.style.ERROR("ADMIN_TG_IDS yoki BOT_TOKEN sozlanmagan"))
            return
        n = QN.adminlarga_yubor()
        self.stdout.write(self.style.SUCCESS(f"adminlarga yuborildi: {n} ta"))
