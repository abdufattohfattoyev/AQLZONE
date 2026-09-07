"""
Masalani Telegram kanaliga joylash — buyruq satridan.

    python manage.py masala_post --sinov       # nima ketishini ko'rsatadi
    python manage.py masala_post --kunlik      # bugungi masalani joylaydi
    python manage.py masala_post 12            # aynan shu masalani

Butun mantiq `core/masala_kanal.py` da: xuddi shu ish ilovadagi
admin tugmasidan ham bajariladi va ikki nusxa bo'lishi mumkin emas.
Bu yerda faqat buyruq qobig'i.

Buyruq O'ZI rejalashtirmaydi — uni kuniga bir marta cron chaqiradi
(`eslatma` buyrug'i bilan bir xil qoida).
"""
from __future__ import annotations

from django.core.management.base import BaseCommand

from core import masala_kanal as MK
from core.kanal import kanal_nomi
from core.models import Masala


class Command(BaseCommand):
    help = "Masalani Telegram kanaliga joylaydi"

    def add_arguments(self, parser) -> None:
        parser.add_argument("id", nargs="?", type=int, help="masala raqami")
        parser.add_argument("--kunlik", action="store_true",
                            help="hali joylanmagan eng eski masalani tanlaydi")
        parser.add_argument("--sinov", action="store_true",
                            help="yubormaydi, faqat ko'rsatadi")

    def handle(self, *args, **o) -> None:
        kanal = kanal_nomi()
        if not kanal:
            self.stderr.write("KANAL sozlanmagan — post yuborilmaydi")
            return

        if o["id"]:
            masala = Masala.objects.filter(pk=o["id"]).first()
            if masala is None:
                self.stderr.write(f"#{o['id']} topilmadi")
                return
        elif o["kunlik"]:
            masala = MK.kunlik()
            if masala is None:
                self.stdout.write("Joylanmagan masala qolmadi")
                return
        else:
            self.stderr.write("Masala raqami yoki --kunlik kerak")
            return

        self.stdout.write(f"#{masala.pk} → {kanal}")
        self.stdout.write(f"havola: {MK.havola(masala)}")
        self.stdout.write(f"rasm:   {'bor' if masala.rasm else 'yo`q'}")
        self.stdout.write("─" * 50)
        self.stdout.write(MK.sarlavha(masala))
        self.stdout.write("─" * 50)

        if o["sinov"]:
            self.stdout.write("(sinov — yuborilmadi)")
            return

        holat, izoh = MK.yubor(masala)
        if holat != "yuborildi":
            self.stderr.write(f"yuborilmadi ({holat}): {izoh}")
            return
        self.stdout.write(self.style.SUCCESS(f"#{masala.pk} kanalga joylandi"))
