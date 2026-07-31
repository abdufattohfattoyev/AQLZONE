"""
Telegram eslatmasi: bugun mashq qilmagan bolalarga xabar.

Ishlatish:

    python manage.py eslatma --sinov      # kimga borishini va MATNINI ko'rsatadi
    python manage.py eslatma              # haqiqiy yuborish

Buyruq O'ZI rejalashtirmaydi — uni kuniga bir marta tashqi rejalashtirgich
chaqiradi (cron yoki Windows Task Scheduler). Sabab: doimiy ishlab
turadigan jarayon qo'shish butun serverni murakkab qiladi, holbuki kuniga
bir marta ishlaydigan buyruq yetarli.

Soatni to'g'ri tanlang. Eslatma maktabdan keyin, kechki ovqatdan oldin
ma'noli — 17:00–19:00. Ertalab yuborilgani darsga ketayotgan bolada
ochilmaydi va shunchaki o'qilmagan xabar bo'lib qoladi.

Kimga yuboriladi:
  - Telegram'i bog'langan bo'lsa (aks holda yuboradigan joy yo'q)
  - botni bloklamagan bo'lsa
  - BUGUN birorta dars tugatmagan bo'lsa
  - lekin oxirgi 14 kun ichida faol bo'lgan bo'lsa
  - va bugun unga eslatma hali yuborilmagan bo'lsa

Oxirgi ikki shart muhim. Butunlay tashlab ketgan odamga xabar yuborish —
spam. Kuniga ikki marta yuborish esa undan ham yomon: bolaning ota-onasi
botni bloklaydi va biz uni butunlay yo'qotamiz.

MATN har kuni bir xil emas. Zanjiri bor bolaga "zanjiring uziladi"
deyiladi — bu eng kuchli sabab, chunki u YO'QOTISH haqida. Zanjiri
yo'qlarga esa kun bo'yicha almashadigan matn boradi: har kuni bir xil
xabar bir haftada ko'rinmas bo'lib qoladi.
"""
from __future__ import annotations

import time
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Max
from django.utils import timezone

from core import xabar as X
from core.matn import M, tilni_tanla
from core.models import Identity, LessonResult, Pupil

#: Shu kundan beri umuman faol bo'lmaganlarga yozmaymiz.
FAOL_KUN = 14

#: Zanjirni sanashda shuncha kundan orqaga qaramaymiz — uzoq tarix
#: xabarga hech narsa qo'shmaydi, so'rov esa og'irlashadi.
ZANJIR_CHEGARA = 60

#: Bir marta yuboriladigan eng ko'p xabar. Bu XAVFSIZLIK to'sig'i:
#: kutilmaganda ro'yxat o'n barobar oshsa, buyruq soatlab ishlab
#: qolmasin. Tezlik cheklovi bundan alohida (`xabar.ORALIQ`).
CHEKLOV = 5000


def zanjir(profil_idlar: list[int], bugun) -> int:
    """
    Ketma-ket necha kun mashq qilingan (bugun hisobga olinmaydi).

    Kechadan orqaga qarab sanaladi. Bugun allaqachon o'ynagan bolaga
    eslatma yuborilmaydi, ya'ni bu yerda "bugun" doim bo'sh.
    """
    kunlar = {
        timezone.localtime(v).date()
        for v in LessonResult.objects.filter(
            profile_id__in=profil_idlar,
            created_at__gte=timezone.now() - timedelta(days=ZANJIR_CHEGARA),
        ).values_list("created_at", flat=True)
    }
    n = 0
    kun = bugun - timedelta(days=1)
    while kun in kunlar:
        n += 1
        kun -= timedelta(days=1)
    return n


#: Xabarda ISHLATILMAYDIGAN nomlar.
#:
#: "Men" — profilning standart nomi (`Pupil.asosiy_profil`): ismi yo'q
#: hisobda shunday yoziladi. Uni xabarga qo'ysak "Men, zanjiring uzilib
#: qoladi" degan ma'nosiz gap chiqardi — ishlab turgan bazada
#: foydalanuvchilarning aksariyati aynan shunday edi.
STANDART_NOM = {"men", "bola", "foydalanuvchi", "user"}


def ism_tanla(profil, pupil, til: str = "uz") -> str:
    """Xabarda murojaat qilinadigan nom. Topilmasa — neytral so'z."""
    for nomzod in (getattr(profil, "name", ""), pupil.ism):
        nomzod = (nomzod or "").strip()
        if nomzod and nomzod.lower() not in STANDART_NOM:
            return nomzod
    return M("eslatmaIsmsiz", til)


#: Zanjiri yo'q bolaga boradigan matnlar — kun bo'yicha almashadi.
#: Har kuni bir xil xabar bir haftada ko'zga tashlanmay qoladi.
VARIANT = ("eslatma0", "eslatma1", "eslatma2", "eslatma3")


def matn_yasa(ism: str, zanjir_kun: int, kun_raqami: int, til: str = "uz") -> str:
    """
    Eslatma matni. Zanjiri borga boshqacha, yo'qqa boshqacha.

    Matnlarning o'zi `core/matn.py` da, ikki tilda. Ular shu yerdan
    chiqarildi: bitta xabar ikki tilda yozilganda kod matndan ko'rinmay
    ketardi va yangi til qo'shish har bir tarmoqni qayta yozish demak
    bo'lardi.
    """
    if zanjir_kun >= 2:
        return M("eslatmaZanjir", til, ism=ism, kun=zanjir_kun)
    if zanjir_kun == 1:
        return M("eslatmaBirKun", til, ism=ism)
    return M(VARIANT[kun_raqami % len(VARIANT)], til, ism=ism)


class Command(BaseCommand):
    help = "Bugun mashq qilmagan bolalarga Telegram eslatmasi yuboradi"

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
            help="Faqat shu soatda ishlaydi (Toshkent vaqti). Cron'ni soat "
                 "sayin chaqirib qo'yish uchun — vaqt mintaqasi chalkashligi yo'qoladi.",
        )

    def handle(self, *args, **o):
        sinov: bool = o["sinov"]

        # Vaqt mintaqasi masalasi shu yerda hal bo'ladi.
        #
        # Serverning soati CEST, konteynerniki UTC, bolalar esa Toshkent
        # vaqtida yashaydi — cron'da "18:00" deb yozish uchalasidan
        # qaysi biri ekanini taxmin qilish demak. Ustiga yozgi vaqt
        # ko'chishi bor: to'g'ri sozlangan cron ham yiliga ikki marta bir
        # soatga siljib ketadi.
        #
        # Shuning uchun cron SOAT SAYIN chaqiriladi, soatni esa buyruq
        # o'zi tekshiradi — Django uchun mahalliy vaqt aniq
        # (`TIME_ZONE = Asia/Tashkent`).
        if o["soat"] is not None and timezone.localtime().hour != o["soat"]:
            return

        if not settings_bot_bormi() and not sinov:
            self.stderr.write(self.style.ERROR(
                "BOT_TOKEN sozlanmagan — .env ga qo'shing yoki --sinov bilan ishga tushiring"
            ))
            return

        bugun = timezone.localdate()
        chegara = timezone.now() - timedelta(days=FAOL_KUN)
        kun_raqami = bugun.toordinal()
        havola = X.ilova_havolasi()

        # Bugun dars tugatgan profillar — ularga yozmaymiz.
        bugungilar = set(
            LessonResult.objects.filter(created_at__date=bugun)
            .values_list("profile_id", flat=True)
        )

        yuborildi = xato = bloklandi = 0
        korilgan: set[int] = set()

        for kirish in (
            Identity.objects.filter(provider=Identity.TELEGRAM)
            # Bloklaganlar butunlay chetda: ularga urinish vaqt, so'rov
            # cheklovi va "xato" ustunidagi soxta raqam degani.
            .filter(pupil__bot_bloklandi_at__isnull=True)
            # "Boshqa yozmang" degan odam ham chetda: bu bloklash emas,
            # hurmat bilan so'ralgan iltimos va uni buzish bloklashga
            # olib keladi (`bot.py` → `xabarni_yop`).
            .filter(pupil__xabar_yopiq_at__isnull=True)
            .select_related("pupil")
            .iterator()
        ):
            if kirish.pupil_id in korilgan:
                continue
            korilgan.add(kirish.pupil_id)

            pupil = kirish.pupil

            # Bugun allaqachon yuborilgan bo'lsa — takrorlamaymiz.
            if pupil.eslatma_at and timezone.localtime(pupil.eslatma_at).date() == bugun:
                continue

            profillar = list(pupil.profiles.all())
            if not profillar:
                continue

            # Hisobdagi HAMMA bola bugun o'ynagan bo'lsa — eslatma kerak emas.
            qolganlar = [p for p in profillar if p.pk not in bugungilar]
            if not qolganlar:
                continue

            # Yaqinda faol bo'lganmi?
            idlar = [p.pk for p in profillar]
            oxirgi = LessonResult.objects.filter(profile_id__in=idlar).aggregate(
                oxirgi=Max("created_at")
            )["oxirgi"]
            if oxirgi is None or oxirgi < chegara:
                continue

            til = tilni_tanla(pupil.til)
            ism = ism_tanla(qolganlar[0], pupil, til)
            matn = matn_yasa(ism, zanjir(idlar, bugun), kun_raqami, til)

            if sinov:
                self.stdout.write(f"  → {kirish.external_id} ({ism}):")
                self.stdout.write("    " + matn.replace("\n", " ").replace("<b>", "").replace("</b>", ""))
                yuborildi += 1
            else:
                holat, sabab = X.yubor(
                    kirish.external_id, matn, tugma=M("tMashqQilish", til), havola=havola,
                )
                if holat == "yuborildi":
                    yuborildi += 1
                    Pupil.objects.filter(pk=pupil.pk).update(eslatma_at=timezone.now())
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


def settings_bot_bormi() -> bool:
    from django.conf import settings

    return bool(settings.BOT_TOKEN)
