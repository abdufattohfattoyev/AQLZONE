"""
Kanaldagi postlarning sanoq qatorini yangilaydi.

    python manage.py kanal_yangila            # o'zgarganlarini
    python manage.py kanal_yangila --sinov    # yozmaydi, ko'rsatadi
    python manage.py kanal_yangila 12         # aynan shu masalani

─────────────────── NEGA KERAK ───────────────────

Kanal posti chiqqandan keyin o'lik bo'lib qolardi. Obunachi uni
ko'radi, lekin uni yana kimdir yechdimi, qiyinmi yoki osonmi — hech
narsa bilmaydi. Post ostidagi jonli qator buni aytadi:

    hech kim yechmagan   🥇 Hali hech kim yechmagan — birinchi bo'ling!
    yechganlar bor       ✅ Masalani yechganlar: 7

Birinchisi chaqiriq, ikkinchisi esa sabab: son o'sib borishini
ko'rgan odam bosadi.

─────────────────── NEGA JADVAL, JAVOB PAYTIDA EMAS ───────────────

Sanoqni har javob berilganda yangilash ham mumkin edi, lekin unda
Telegram chaqiruvi javob berish yo'liga kirib qolardi: bir sinf
bola bir masalani birdaniga yechsa, o'sha bitta post yigirma marta
tahrirlanardi va har biri javobni sekinlashtirardi.

Jadval esa buni tashqarida qiladi: o'n besh daqiqada bir marta,
faqat SONI O'ZGARGAN postlar uchun. Kanal posti uchun bu yetarli
"jonli" — uni hech kim soniyalab kuzatmaydi.

─────────────────── AVTOMATIK JADVAL ───────────────────

Har 15 daqiqada — Celery Beat chaqiradi (`aqlzone/celery.py`).
Soat kutilmaydi (`--soat` yo'q): bu buyruq kun bo'yi ishlashi
kerak, boshqalari esa kuniga bir marta.
"""
from __future__ import annotations

import time

from django.core.management.base import BaseCommand
from django.db.models import Count, Q

from core import masala_kanal as MK
from core.kanal import kanal_nomi
from core.models import Masala

#: Ikki chaqiruv orasidagi pauza (soniya) — Telegram limitidan uzoqda
#: turish uchun (`kanal_tekshir` dagi bilan bir xil sabab).
PAUZA = 0.12

#: Bir yurishda ko'pi bilan nechta post yangilanadi.
#:
#: Odatda bu son ikki-uchtadan oshmaydi — faqat sanoqlari o'zgargan
#: postlar olinadi. Chegara g'ayrioddiy kun uchun: masala kanalga
#: birdaniga tarqalsa yoki baza qo'lda o'zgartirilsa, buyruq yuzta
#: postni ketma-ket tahrirlashga urinib, limitga urilmasin.
CHEGARA = 25


class Command(BaseCommand):
    help = "Kanal postlaridagi sanoq qatorini yangilaydi"

    def add_arguments(self, parser) -> None:
        parser.add_argument("id", nargs="?", type=int, help="masala raqami")
        parser.add_argument("--sinov", action="store_true",
                            help="yangilamaydi, faqat ko'rsatadi")

    def handle(self, *args, **o) -> None:
        if not kanal_nomi():
            self.stderr.write("KANAL sozlanmagan — yangilanmadi")
            return

        # Yo'qolgan postlar OLINMAYDI: ular admindan qayta yuborishni
        # kutyapti va ularni yangilashning iloji yo'q. Busiz o'sha
        # ikki-uchta post uchun kuniga yuzlab behuda so'rov ketardi.
        #
        # Yechganlar soni BITTA so'rovda sanaladi (`yechganlar_annot`).
        # Busiz har post uchun alohida `COUNT` ketardi — o'n beshta
        # post uchun o'n beshta so'rov, har o'n besh daqiqada.
        qs = Masala.objects.filter(
            kanal_at__isnull=False, kanal_post_id__isnull=False, kanal_yoq=False,
        ).annotate(
            yechganlar_annot=Count("urinishlar", filter=Q(urinishlar__yechdi=True)),
        ).order_by("-kanal_at")
        if o["id"]:
            qs = qs.filter(pk=o["id"])

        # O'zgarganlarini BAZADA ajratamiz — Telegramga behuda so'rov
        # yubormaslik uchun (`masala_kanal.yangila` dagi izohga qarang).
        ozgargan = [m for m in qs if MK.sanoq_kaliti(m) != m.kanal_sanoq][:CHEGARA]
        if not ozgargan:
            self.stdout.write("o'zgargan post yo'q")
            return

        sanoq: dict[str, int] = {}
        for masala in ozgargan:
            qator = MK.sanoq_qatori(masala)
            if o["sinov"]:
                self.stdout.write(f"  #{masala.pk}  {masala.kanal_sanoq or '—'}"
                                  f"  →  {MK.sanoq_kaliti(masala)}   {qator}")
                continue

            holat = MK.yangila(masala)
            sanoq[holat] = sanoq.get(holat, 0) + 1
            belgi = {"yangilandi": "✓", "ozgarmagan": "=", "yoq": "✗"}.get(holat, "?")
            self.stdout.write(f"  {belgi} #{masala.pk} → {holat}   {qator}")
            time.sleep(PAUZA)

        if not o["sinov"]:
            xulosa = " | ".join(f"{k}: {v}" for k, v in sorted(sanoq.items()))
            self.stdout.write(self.style.SUCCESS(xulosa or "hech narsa"))
