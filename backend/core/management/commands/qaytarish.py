"""
"Qaytib keling" — uzoq ko'rinmagan bolalarga chekli xabarlar zanjiri.

Ishlatish:

    python manage.py qaytarish --sinov      # kimga va NIMA borishini ko'rsatadi
    python manage.py qaytarish              # yuborish

NEGA ALOHIDA BUYRUQ. Kunlik eslatma (`eslatma.py`) ataylab faqat SO'NGGI
14 KUNDA faol bo'lganlarga yoziladi — butunlay tashlab ketgan odamga har
kuni xabar yuborish spam va uning yagona natijasi bloklash bo'lardi.
Lekin o'sha qoidaning teskari tomoni ham bor edi: 14 kundan oshgan odam
ilovadan ABADIY yo'qolardi, chunki uni qaytarishning hech qanday yo'li
qolmagan edi.

Bu buyruq o'sha bo'shliqni to'ldiradi va uch qoida bilan cheklaydi:

  1. **Uchta xabar, keyin butunlay sukut.** 7, 21 va 45-kun. Uchinchisi
     ochiq aytilgan xayrlashuv, undan keyin hech qachon yozilmaydi.
  2. **Har biri boshqa narsa haqida** (`core/matn.py`): yo'qotish yo'q →
     yangi sabab → xayrlashuv. Bir gapni uch marta takrorlash yolvorish
     bo'lardi va u ishlamaydi.
  3. **Har xabarda "boshqa yozmang" tugmasi.** Rad javob yo'li bo'lmagan
     xabar oxir-oqibat bloklanadi, bloklangan odam esa butunlay
     yo'qoladi: keyin unga na e'lon, na kirish havolasi yetib boradi.

Hisob har TANAFFUS uchun alohida yuritiladi: odam qaytib dars qilishi
bilan `qaytarish_soni` nolga tushadi, ya'ni bir yilda ikki marta
yo'qolgan odam ikkala safar ham chaqiriladi.

Buyruq o'zi rejalashtirmaydi — `eslatma` bilan bir xil tartibda, tashqi
rejalashtirgich chaqiradi. Kuniga bir marta yetarli:

    30 18 * * * docker exec aqlzone python manage.py qaytarish --soat 18
"""
from __future__ import annotations

import time
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Max
from django.utils import timezone

from core import xabar as X
from core.management.commands.eslatma import ism_tanla, settings_bot_bormi
from core.matn import M, tilni_tanla
from core.models import Identity, LessonResult, Pupil

#: Nechanchi kunda qaysi xabar ketadi.
#:
#: Oraliqlar ataylab KENGAYIB boradi: yaqinda ketgan odam qaytishga
#: yaqin, uzoq ketgani esa har hafta eslatilsa faqat asabiylashadi.
BOSQICH = [
    (7, "qaytarish1"),
    (21, "qaytarish2"),
    (45, "qaytarish3"),
]

#: Bosqich kuni o'tib ketgan bo'lsa ham shuncha kun ichida yuboriladi.
#:
#: Busiz buyruq bir kun ishlamay qolsa (server o'chdi, cron xato ketdi),
#: o'sha kuni 7-kunga to'g'ri kelgan hamma odam bosqichni butunlay
#: o'tkazib yuborardi.
OYNA = 6

#: Ikki xabar orasidagi eng kam kun — bosqichlar qo'shilib ketmasin.
ORALIQ = 10

#: Bir marta yuboriladigan eng ko'p xabar (xavfsizlik to'sig'i).
CHEKLOV = 2000


class Command(BaseCommand):
    help = "Uzoq ko'rinmagan bolalarga chekli 'qaytib keling' zanjiri"

    def add_arguments(self, parser):
        parser.add_argument(
            "--sinov", action="store_true",
            help="Hech narsa yubormaydi, faqat kimga va nima borishini ko'rsatadi",
        )
        parser.add_argument(
            "--limit", type=int, default=CHEKLOV,
            help=f"Bir marta eng ko'pi bilan nechta xabar (standart: {CHEKLOV})",
        )
        parser.add_argument(
            "--soat", type=int, default=None,
            help="Faqat shu soatda ishlaydi (Toshkent vaqti) — `eslatma` bilan bir xil.",
        )

    def handle(self, *args, **o):
        sinov: bool = o["sinov"]

        # Vaqt mintaqasi masalasi `eslatma.py` dagidek hal qilinadi:
        # cron soat sayin chaqiriladi, soatni buyruqning o'zi tekshiradi.
        if o["soat"] is not None and timezone.localtime().hour != o["soat"]:
            return

        if not settings_bot_bormi() and not sinov:
            self.stderr.write(self.style.ERROR(
                "BOT_TOKEN sozlanmagan — .env ga qo'shing yoki --sinov bilan ishga tushiring"
            ))
            return

        hozir = timezone.now()
        havola = X.ilova_havolasi()

        yuborildi = xato = bloklandi = 0
        korilgan: set[int] = set()

        for kirish in (
            Identity.objects.filter(provider=Identity.TELEGRAM)
            # Bloklaganlar va "boshqa yozmang" degan odamlar butunlay chetda.
            .filter(pupil__bot_bloklandi_at__isnull=True)
            .filter(pupil__xabar_yopiq_at__isnull=True)
            .select_related("pupil")
            .iterator()
        ):
            if kirish.pupil_id in korilgan:
                continue
            korilgan.add(kirish.pupil_id)

            pupil = kirish.pupil
            profillar = list(pupil.profiles.all())
            if not profillar:
                continue

            idlar = [p.pk for p in profillar]
            oxirgi = LessonResult.objects.filter(profile_id__in=idlar).aggregate(
                oxirgi=Max("created_at")
            )["oxirgi"]

            # Umuman o'ynamagan odam "yo'qolgan" emas — u hali
            # boshlamagan. Unga "qaytib keling" deyish g'alati.
            if oxirgi is None:
                continue

            kun = (hozir - oxirgi).days

            # QAYTGAN bo'lsa hisob tozalanadi: keyingi tanaffus noldan
            # boshlanadi. Shu yerda qilinadi, chunki bu yagona joy —
            # ilova serverga "men qaytdim" deb alohida xabar bermaydi.
            if kun < BOSQICH[0][0]:
                if pupil.qaytarish_soni or pupil.qaytarish_at:
                    Pupil.objects.filter(pk=pupil.pk).update(
                        qaytarish_soni=0, qaytarish_at=None,
                    )
                continue

            soni = pupil.qaytarish_soni or 0
            if soni >= len(BOSQICH):
                continue                              # zanjir tugagan — sukut

            kerak_kun, kalit = BOSQICH[soni]
            if kun < kerak_kun or kun > kerak_kun + OYNA:
                continue

            # Ikki xabar qo'shilib ketmasin: bosqichlar orasi kengaysa
            # ham, oxirgisidan keyin kamida ORALIQ kun o'tsin.
            if pupil.qaytarish_at and (hozir - pupil.qaytarish_at).days < ORALIQ:
                continue

            til = tilni_tanla(pupil.til)
            ism = ism_tanla(profillar[0], pupil, til)
            matn = M(kalit, til, ism=ism)

            if sinov:
                self.stdout.write(
                    f"  → {kirish.external_id} ({ism}, {kun} kun, "
                    f"{soni + 1}-xabar):"
                )
                self.stdout.write(
                    "    " + matn.replace("\n", " ").replace("<b>", "").replace("</b>", "")
                )
                yuborildi += 1
            else:
                holat, sabab = X.yubor(
                    kirish.external_id, matn,
                    tugma=M("tQaytish", til), havola=havola,
                    # "Boshqa yozmang" — inline tugma, javobi `bot.py` da.
                    ikkinchi_tugma=M("tXabarniOchir", til),
                    ikkinchi_data="xabar_yopiq",
                )
                if holat == "yuborildi":
                    yuborildi += 1
                    Pupil.objects.filter(pk=pupil.pk).update(
                        qaytarish_soni=soni + 1, qaytarish_at=hozir,
                    )
                elif holat == "bloklandi":
                    bloklandi += 1
                    X.bloklanganini_belgila(pupil.pk)
                else:
                    xato += 1
                    self.stdout.write(f"  ✗ {kirish.external_id}: {sabab}")
                time.sleep(X.ORALIQ)

            if yuborildi >= o["limit"]:
                self.stdout.write(f"chegaraga yetildi ({o['limit']})")
                break

        holat = "yuborilardi" if sinov else "yuborildi"
        self.stdout.write(self.style.SUCCESS(
            f"{yuborildi} ta xabar {holat}, {bloklandi} ta bloklagan, {xato} ta xato"
        ))
