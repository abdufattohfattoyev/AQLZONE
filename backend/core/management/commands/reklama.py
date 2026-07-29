"""
E'lonni buyruq qatoridan yuborish yoki davom ettirish.

Ishlatish:

    python manage.py reklama --royxat        # e'lonlar ro'yxati
    python manage.py reklama --id 3          # 3-e'lonni yuboradi/davom ettiradi
    python manage.py reklama --uzilganlar    # yarim qolganlarning HAMMASINI davom ettiradi

Panelning o'zi ham xuddi shu funksiyani chaqiradi (`core/reklama.py`),
faqat u fon oqimida ishlaydi. Bu buyruq esa ikki holatda kerak:

  1. **Server yuborish o'rtasida qayta ishga tushdi** (deploy, nosozlik).
     E'lon "ketyapti" holatida qolib ketadi. `--uzilganlar` ularni
     topib, qolganidan davom ettiradi.
  2. **Katta ro'yxat.** Brauzerni ochib turish shart emas: buyruq
     terminalda ishlaydi va oxirigacha boradi.

Ikki marta yuborish XAVFI YO'Q: kimga yetgani `ReklamaQabul` da yozilgan
va cheklov bazada turadi.
"""
from __future__ import annotations

from django.core.management.base import BaseCommand

from core import reklama as R
from core.models import Reklama


class Command(BaseCommand):
    help = "E'lonni yuboradi yoki uzilib qolganini davom ettiradi."

    def add_arguments(self, parser):
        parser.add_argument("--id", type=int, default=0, help="E'lon raqami")
        parser.add_argument(
            "--royxat", action="store_true", help="E'lonlar ro'yxatini ko'rsatadi",
        )
        parser.add_argument(
            "--uzilganlar", action="store_true",
            help="'Ketyapti' holatida qolganlarning hammasini davom ettiradi",
        )

    def handle(self, *args, **o):
        if o["royxat"]:
            return self._royxat()

        if o["uzilganlar"]:
            idlar = list(
                Reklama.objects.filter(holat="ketyapti").values_list("pk", flat=True)
            )
            if not idlar:
                self.stdout.write("Uzilib qolgan e'lon yo'q.")
                return
            for pk in idlar:
                self._yubor(pk)
            return

        if not o["id"]:
            self.stderr.write(self.style.ERROR(
                "--id, --royxat yoki --uzilganlar dan birini bering"
            ))
            return

        self._yubor(o["id"])

    def _royxat(self):
        qs = Reklama.objects.order_by("-created_at")[:20]
        if not qs:
            self.stdout.write("E'lon yo'q.")
            return
        for r in qs:
            self.stdout.write(
                f"#{r.pk:<4} {r.holat:<11} {r.yuborildi}/{r.jami or '?':<6} {r.qisqa}"
            )

    def _yubor(self, pk: int):
        r = Reklama.objects.filter(pk=pk).first()
        if r is None:
            self.stderr.write(self.style.ERROR(f"#{pk} topilmadi"))
            return
        if r.holat == "tugadi":
            self.stdout.write(f"#{pk} allaqachon yuborilgan.")
            return

        self.stdout.write(f"#{pk} yuborilmoqda…")
        natija = R.yubor(pk)
        if natija.get("holat") == "tugadi":
            self.stdout.write(self.style.SUCCESS(
                f"#{pk} tugadi: {natija['yuborildi']} yetdi, "
                f"{natija['bloklandi']} bloklagan, {natija['xato']} xato"
            ))
        else:
            self.stdout.write(self.style.WARNING(
                f"#{pk} to'xtadi (holat: {natija.get('holat')})"
            ))
