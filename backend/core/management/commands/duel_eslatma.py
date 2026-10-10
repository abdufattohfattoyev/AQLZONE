"""
Javobsiz duel chaqiruviga BITTA eslatma (2026-10-10).

    python manage.py duel_eslatma --sinov    # kimga ketishini ko'rsatadi
    python manage.py duel_eslatma            # yuborish (jadvalda har soat, 10:00–20:00)

─────────────────── NEGA ───────────────────

30 kunda odamga yuborilgan 39 chaqiruvdan 4 tasi qabul qilingan. Bot
xabari bir marta keladi va boshqa xabarlar orasida ko'milib ketadi —
odam keyin ochaman deb unutadi. Chaqiruv 24 soat yashaydi
(`Duel.MUDDAT_SOAT`): oxirigacha hech kim eslatmasa, u jimgina o'ladi.

─────────────────── CHEKLOVLAR ───────────────────

  • Faqat chaqirgan odam O'YNAB BO'LGAN chaqiruv (javob kutilyapti) va
    yaratilganiga 3 soatdan ko'p, 20 soatdan kam bo'lgan.
  • Bir duelga bitta eslatma (`Duel.eslatma_at`).
  • Bir odamga kuniga bitta eslatma — bir necha do'st chaqirgan bo'lsa ham
    (`duel-chaqiruv-qoidalari`: bot xabarlari kuniga ko'pi bilan 3 ta).
  • Botni bloklagan yoki "boshqa yozmang" degan odamga — yo'q.
"""
from __future__ import annotations

import html
import time
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core import duel as D
from core import xabar as X
from core.matn import M, tilni_tanla
from core.models import Duel

KECH_SOAT = 3
OXIRI_SOAT = 20


class Command(BaseCommand):
    help = "Javobsiz duel chaqiruvlariga bitta eslatma"

    def add_arguments(self, parser):
        parser.add_argument("--sinov", action="store_true")

    def handle(self, *args, **o):
        hozir = timezone.now()
        bugun = timezone.localtime().replace(hour=0, minute=0, second=0, microsecond=0)
        bot = (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")
        nomzod = (
            Duel.objects.select_related("chaqirgan", "kimga__pupil")
            .filter(kimga__isnull=False, chaqirgan_tugatdi=True, qabul_tugatdi=False,
                    boshlanadi__isnull=True, eslatma_at__isnull=True,
                    created_at__lte=hozir - timedelta(hours=KECH_SOAT),
                    created_at__gte=hozir - timedelta(hours=OXIRI_SOAT))
            .order_by("created_at")
        )
        bugun_olgan = set(Duel.objects.filter(eslatma_at__gte=bugun).values_list("kimga_id", flat=True))
        yuborildi = otkazildi = 0
        for d in nomzod:
            raqib = d.kimga
            p = raqib.pupil
            if raqib.pk in bugun_olgan or p.bot_bloklandi_at or p.xabar_yopiq_at:
                otkazildi += 1
                continue
            tg = D._tg_id(raqib)
            if not tg:
                otkazildi += 1
                continue
            til = tilni_tanla(p.til)
            matn = M("duelEslatma", til, ism=html.escape(D.korinadigan_ism(d.chaqirgan)))
            havola = f"https://t.me/{bot}?startapp={d.kod}" if bot else D.havola(d.kod)
            if o["sinov"]:
                self.stdout.write(f"  → {tg}: {D.korinadigan_ism(d.chaqirgan)} · {d.kod}")
            else:
                holat, _ = X.yubor(tg, matn, tugma=M("tQabulQilish", til), havola=havola)
                if holat == "bloklandi":
                    X.bloklanganini_belgila(p.pk)
                if holat != "yuborildi":
                    otkazildi += 1
                    continue
                time.sleep(X.ORALIQ)
            if not o["sinov"]:
                Duel.objects.filter(pk=d.pk).update(eslatma_at=hozir)
            bugun_olgan.add(raqib.pk)
            yuborildi += 1
        self.stdout.write(self.style.SUCCESS(f"duel eslatmasi: {yuborildi} ta, {otkazildi} ta o'tkazildi"))
