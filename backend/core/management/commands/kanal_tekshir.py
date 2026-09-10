"""
Kanaldagi postlar joyidami — kunlik tekshiruv.

    python manage.py kanal_tekshir            # hammasini ketma-ket
    python manage.py kanal_tekshir --sinov    # yozmaydi, faqat ko'rsatadi
    python manage.py kanal_tekshir 12         # aynan shu masalani

─────────────────── NIMA UCHUN KERAK ───────────────────

Kanalga chiqqan post yo'qolib qolishi mumkin: admin uni o'chiradi,
kanal ko'chiriladi, xabar tozalanadi. Masalada esa `kanal_at` to'lgan
bo'lib qolaveradi — ya'ni kunlik post uni boshqa hech qachon tanlamaydi
va masala kanaldan JIMGINA yo'qoladi. Buni hech kim sezmaydi, chunki
ilovada u avvalgidek turaveradi.

Tekshiruv shu jimlikni buzadi: yo'qolgan post masala ekranida qizil
qator bo'lib chiqadi va yonida "qayta yuborish" turadi. Admin bir
kunda bir marta xabar ham oladi.

─────────────────── NEGA KETMA-KET VA SEKIN ───────────────────

Postlar BIRIN-KETIN tekshiriladi, orasida pauza bilan. Telegram bir
botga soniyasiga ~30 ta chaqiruv beradi va limitdan oshsa 429 bilan
javob qaytaradi — o'sha paytda tekshiruv natijasi "noma'lum" bo'lib
chiqardi, ya'ni butun ish behuda ketardi. Yuzta post uchun bir necha
soniya — kuniga bir marta ishlaydigan buyruq uchun arzon narx.

─────────────────── AVTOMATIK JADVAL ───────────────────

Har kuni 09:00 (Toshkent) — Celery Beat chaqiradi
(`aqlzone/celery.py`). `--soat` bayrog'i qoldirilgan: u qo'lda
yurgizishda va zarur bo'lsa cron'ga qaytishda ishlatiladi.
"""
from __future__ import annotations

import time

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core import masala_kanal as MK
from core import xabar
from core.kanal import kanal_nomi
from core.models import Masala

#: Ikki chaqiruv orasidagi pauza (soniya) — Telegram limitidan uzoqda
#: turish uchun. `xabar.TEZLIK` ni takrorlamaydi: u bir vaqtning
#: o'zida ko'p odamga yuborish uchun, bu esa bitta chatga.
PAUZA = 0.12

#: Bir xabarda adminga nechta masala ro'yxat bo'lib ko'rsatiladi.
#: Qolgani "va yana N ta" bo'lib qisqaradi: Telegram xabari 4096
#: belgi bilan cheklangan va uzun ro'yxat baribir o'qilmaydi.
XABARDA = 10


class Command(BaseCommand):
    help = "Kanaldagi masala postlari joyidami — tekshiradi"

    def add_arguments(self, parser) -> None:
        parser.add_argument("id", nargs="?", type=int, help="masala raqami")
        parser.add_argument("--sinov", action="store_true",
                            help="natijani bazaga yozmaydi")
        parser.add_argument("--soat", type=int, default=None,
                            help="Faqat shu soatda ishlaydi (Toshkent vaqti)")

    def handle(self, *args, **o) -> None:
        if o["soat"] is not None and timezone.localtime().hour != o["soat"]:
            return

        if not kanal_nomi():
            self.stderr.write("KANAL sozlanmagan — tekshirilmadi")
            return

        so_rov = Masala.objects.filter(
            kanal_at__isnull=False, kanal_post_id__isnull=False,
        ).order_by("kanal_at")
        if o["id"]:
            so_rov = so_rov.filter(pk=o["id"])

        # Tekshiruvdan OLDINGI holat kerak: xabar faqat YANGI
        # yo'qolganlar haqida ketadi. Aks holda bir marta o'chirilgan
        # post har kuni qaytadan xabar berib turardi va admin bir
        # haftadan keyin bu xabarlarni umuman o'qimay qo'yardi.
        oldin_yoq = set(so_rov.filter(kanal_yoq=True).values_list("pk", flat=True))

        sanoq = {"bor": 0, "yoq": 0, "nomalum": 0, "yuborilmagan": 0}
        yangi_yoq: list[Masala] = []

        for masala in so_rov:
            if o["sinov"]:
                holat = xabar.post_bormi(
                    kanal_nomi(), masala.kanal_post_id, MK.tugmalar(masala),
                )
            else:
                holat = MK.tekshir(masala)

            sanoq[holat] = sanoq.get(holat, 0) + 1
            belgi = {"bor": "✓", "yoq": "✗", "nomalum": "?"}.get(holat, "—")
            self.stdout.write(f"  {belgi} #{masala.pk} → {holat}")

            if holat == "yoq" and masala.pk not in oldin_yoq:
                yangi_yoq.append(masala)
            time.sleep(PAUZA)

        xulosa = (f"tekshirildi: {sum(sanoq.values())} | joyida: {sanoq['bor']} "
                  f"| yo'q: {sanoq['yoq']} | noma'lum: {sanoq['nomalum']}")
        self.stdout.write(self.style.SUCCESS(xulosa))

        if yangi_yoq and not o["sinov"]:
            self._adminga(yangi_yoq)

    def _adminga(self, masalalar: list[Masala]) -> None:
        """
        Yangi yo'qolganlar haqida adminga bitta xabar.

        Bitta xabar, har masalaga bittadan emas: o'ntasi birdan
        o'chirilgan kun bo'lishi mumkin va o'nta bildirishnoma
        telefonni ko'mib tashlardi.
        """
        adminlar = [str(x) for x in getattr(settings, "ADMIN_TG", []) if x]
        if not adminlar or not getattr(settings, "BOT_TOKEN", ""):
            return

        qatorlar = [
            f"• #{m.pk} — {MK.qalqon(m.matn.strip().splitlines()[0][:60])}"
            for m in masalalar[:XABARDA]
        ]
        if len(masalalar) > XABARDA:
            qatorlar.append(f"• va yana {len(masalalar) - XABARDA} ta")

        matn = (
            "⚠️ <b>Kanalda topilmadi</b>\n\n"
            + "\n".join(qatorlar)
            + "\n\nIlovada masalani ochib, «Qayta yuborish» ni bosing."
        )
        havola = MK.royxat_havolasi()
        for tg_id in adminlar:
            try:
                xabar.yubor(tg_id, matn,
                            "📚 Masalalarni ochish" if havola else "", havola)
            except Exception:                        # noqa: BLE001
                pass
