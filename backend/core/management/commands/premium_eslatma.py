"""
Imtihon Premium tugashiga 3 kun qolganlarga bitta eslatma (`core/premium.py`).

    python manage.py premium_eslatma --sinov   # kimga va nima borishini ko'rsatadi
    python manage.py premium_eslatma           # yuborish

Jadvalda kuniga bir marta (`aqlzone/celery.py`). Ikki marta yursa ham
bir muddat uchun ikkinchi xabar ketmaydi (`Pupil.premium_eslatildi`).
"""
from django.core.management.base import BaseCommand

from core import premium as PR


class Command(BaseCommand):
    help = "Premium tugashiga 3 kun qolganlarga eslatma"

    def add_arguments(self, parser):
        parser.add_argument("--sinov", action="store_true", help="yubormasdan ko'rsatish")

    def handle(self, *args, **o):
        jurnal = PR.eslatma_yubor(sinov=o["sinov"])
        for q in jurnal:
            self.stdout.write(f"  {q}")
        self.stdout.write(f"jami: {len(jurnal)}")
