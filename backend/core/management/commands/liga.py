"""
Haftalik ligani yakunlash: o'rinlar va ko'tarilish-tushish yoziladi.

Ishlatish:

    python manage.py liga --sinov     # nima bo'lishini ko'rsatadi, yozmaydi
    python manage.py liga             # o'tgan haftani yakunlaydi

Har DUSHANBA bir marta chaqiriladi (Windows Task Scheduler, cron yoki
hosting scheduler'i) — `eslatma` buyrug'i bilan bir xil tartibda.

Buyruq ishlamay qolsa ham hech narsa buzilmaydi: bola ligani ochganda
yopilmagan haftasi o'sha yerda yopiladi (`core/liga.py`). Buyruq shunchaki
buni HAMMA uchun bir vaqtda qiladi, ya'ni ilovaga kirmagan bolaning o'rni
ham to'g'ri turadi va guruhdoshlari to'liq jadvalni ko'radi.

Ikki marta chaqirilsa ikkinchisi hech narsa qilmaydi — yakunlash
idempotent.
"""
from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand

from core import liga as L
from core.models import LigaAzo


class Command(BaseCommand):
    help = "Haftalik ligani yakunlaydi: o'rin, ko'tarilish va tushish."

    def add_arguments(self, parser):
        parser.add_argument(
            "--sinov", action="store_true",
            help="Hech narsa yozmaydi, faqat ko'rsatadi.",
        )
        parser.add_argument(
            "--hafta", default="",
            help="Qaysi hafta (YYYY-MM-DD, dushanba). Standart — o'tgan hafta.",
        )

    def handle(self, *args, **o):
        hafta = (
            L.hafta_sanasi(_sana(o["hafta"]))
            if o["hafta"]
            else L.hafta_sanasi() - timedelta(days=7)
        )

        ochiq = LigaAzo.objects.filter(hafta=hafta, orin=0)
        if not ochiq.exists():
            self.stdout.write(f"{hafta}: yakunlanmagan guruh yo'q.")
            return

        if o["sinov"]:
            guruhlar = ochiq.values_list("daraja", "guruh").distinct()
            self.stdout.write(f"{hafta}: {ochiq.count()} a'zo, {len(guruhlar)} guruh")
            for daraja, guruh in sorted(guruhlar):
                nom = L.daraja_json(daraja)["nom"]
                n = ochiq.filter(daraja=daraja, guruh=guruh).count()
                self.stdout.write(f"  {nom} · {guruh}-guruh — {n} bola")
            self.stdout.write(self.style.WARNING("Sinov: hech narsa yozilmadi."))
            return

        n = L.haftani_yakunla(hafta)
        self.stdout.write(self.style.SUCCESS(f"{hafta}: {n} a'zo yakunlandi."))


def _sana(xom: str):
    from datetime import date

    return date.fromisoformat(xom)
