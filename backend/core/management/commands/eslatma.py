"""
Telegram eslatmasi: bugun mashq qilmagan bolalarga xabar.

Ishlatish:

    python manage.py eslatma --sinov      # kimga borishini ko'rsatadi, yubormaydi
    python manage.py eslatma              # haqiqiy yuborish

Buyruq O'ZI rejalashtirmaydi — uni kuniga bir marta tashqi rejalashtirgich
chaqiradi (Windows Task Scheduler, cron yoki hosting'ning scheduler'i).
Sabab: doimiy ishlab turadigan jarayon qo'shish butun serverni murakkab
qiladi, holbuki kuniga bir marta ishlaydigan buyruq yetarli.

Kimga yuboriladi:
  - Telegram'i bog'langan bo'lsa (aks holda yuboradigan joy yo'q)
  - BUGUN birorta dars tugatmagan bo'lsa
  - lekin oxirgi 14 kun ichida faol bo'lgan bo'lsa

Oxirgi shart muhim: butunlay tashlab ketgan odamga xabar yuborish —
spam. Eslatma faqat "yaqinda o'ynagan, bugun unutgan" bolaga ma'noli.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Identity, LessonResult

#: Shu kundan beri umuman faol bo'lmaganlarga yozmaymiz.
FAOL_KUN = 14

#: Telegram API bir soniyada ~30 xabarga ruxsat beradi; ehtiyot bo'lamiz.
CHEKLOV = 25


def xabar_yubor(chat_id: str, matn: str) -> tuple[bool, str]:
    """Bitta xabar. Xato bo'lsa (False, sabab) qaytadi — jarayon to'xtamaydi."""
    url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage"
    payload = json.dumps({
        "chat_id": chat_id,
        "text": matn,
        "parse_mode": "HTML",
    }).encode()
    so_rov = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(so_rov, timeout=10) as r:
            return json.loads(r.read()).get("ok", False), ""
    except urllib.error.HTTPError as e:
        # 403 = bola botni bloklagan. Bu xato emas, oddiy holat.
        return False, f"HTTP {e.code}"
    except Exception as e:                       # tarmoq uzilishi va boshqalar
        return False, str(e)


class Command(BaseCommand):
    help = "Bugun mashq qilmagan bolalarga Telegram eslatmasi yuboradi"

    def add_arguments(self, parser):
        parser.add_argument(
            "--sinov", action="store_true",
            help="Hech narsa yubormaydi, faqat kimga borishini ko'rsatadi",
        )
        parser.add_argument(
            "--limit", type=int, default=CHEKLOV,
            help=f"Bir marta eng ko'pi bilan nechta xabar (standart: {CHEKLOV})",
        )

    def handle(self, *args, **o):
        sinov: bool = o["sinov"]

        if not settings.BOT_TOKEN and not sinov:
            self.stderr.write(self.style.ERROR(
                "BOT_TOKEN sozlanmagan — .env ga qo'shing yoki --sinov bilan ishga tushiring"
            ))
            return

        bugun = timezone.localdate()
        chegara = timezone.now() - timedelta(days=FAOL_KUN)

        # Bugun dars tugatgan profillar — ularga yozmaymiz.
        bugungilar = set(
            LessonResult.objects.filter(created_at__date=bugun)
            .values_list("profile_id", flat=True)
        )

        yuborildi = xato = 0
        korilgan: set[int] = set()

        for kirish in (
            Identity.objects.filter(provider=Identity.TELEGRAM)
            .select_related("pupil")
            .iterator()
        ):
            if kirish.pupil_id in korilgan:
                continue
            korilgan.add(kirish.pupil_id)

            profillar = list(kirish.pupil.profiles.all())
            if not profillar:
                continue

            # Hisobdagi HAMMA bola bugun o'ynagan bo'lsa — eslatma kerak emas.
            qolganlar = [p for p in profillar if p.pk not in bugungilar]
            if not qolganlar:
                continue

            # Yaqinda faol bo'lganmi?
            faol = LessonResult.objects.filter(
                profile__in=profillar, created_at__gte=chegara
            ).exists()
            if not faol:
                continue

            ism = qolganlar[0].name or kirish.pupil.ism or "Do'stim"
            matn = (
                f"👋 <b>{ism}</b>, bugun Aql Zone'da mashq qilmading.\n\n"
                "Atigi 10 ta savol — zanjiring uzilmasin! 🔥"
            )

            if sinov:
                self.stdout.write(f"  → {kirish.external_id}: {ism}")
                yuborildi += 1
            else:
                ok, sabab = xabar_yubor(kirish.external_id, matn)
                if ok:
                    yuborildi += 1
                else:
                    xato += 1
                    self.stdout.write(f"  ✗ {kirish.external_id}: {sabab}")

            if yuborildi >= o["limit"]:
                self.stdout.write(f"chegaraga yetildi ({o['limit']})")
                break

        holat = "yuborilardi" if sinov else "yuborildi"
        self.stdout.write(self.style.SUCCESS(f"{yuborildi} ta xabar {holat}, {xato} ta xato"))
