"""
Kunlik son — kechki xabar: "bugungi jumboq hali yechilmagan".

    python manage.py kunlik_eslatma --sinov     # kimga va nima borishini ko'rsatadi
    python manage.py kunlik_eslatma             # haqiqiy yuborish

─────────────────── NEGA ALOHIDA ESLATMA ───────────────────

Umumiy eslatma (`eslatma.py`) "mashq qiling" deydi — bu vazifa. Kunlik
jumboq esa BOSHQA gap: u ikki daqiqalik, hammada bir xil va zanjiri
bor. "Zanjiringiz 6 kun, bugungi son hali yechilmagan" — bu bosiladigan
xabar, chunki u YO'QOTISH haqida.

Botni 698 hisobdan 114 tasi bloklagan. Sabab oddiy: qiziq bo'lmagan
xabar. Shuning uchun bu yerda ikki qat'iy qoida bor:

  1. Faqat KAMIDA BIR MARTA o'ynaganlarga. Hech qachon ochmagan odamga
     "zanjiringiz uzilyapti" deyish — ma'nosiz spam.
  2. Kuniga BITTA xabar. Buyruq `eslatma_at` ni belgilaydi, umumiy
     eslatma esa o'sha maydonni tekshiradi — ya'ni ikkalasi bir kunda
     bitta odamga yozmaydi.

Vaqt: 17:30. Umumiy eslatmadan (18:00) oldin, chunki o'ynaydigan odamga
jumboq haqidagi xabar foydaliroq.
"""
from __future__ import annotations

import time
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from core import kunlik_son as KS
from core import xabar as X
from core.models import Identity, KunlikSonNatija, Pupil

#: Shuncha kundan beri umuman o'ynamaganga yozmaymiz — u qaytmaydi,
#: xabar esa blokka olib keladi.
FAOL_KUN = 21

#: Bir yurishda yuboriladigan eng ko'p xabar (xavfsizlik to'sig'i).
CHEKLOV = 5000


def matn_yasa(zanjir: int, raqam: int, bugun_urinildi: bool) -> str:
    """
    Xabar matni — holatga qarab.

    Uch xil holat, uch xil sabab: zanjirni YO'QOTMASLIK, boshlangan
    ishni TUGATISH va oddiy taklif.
    """
    if bugun_urinildi:
        return (f"<b>Kunlik son #{raqam}</b> yarim qoldi.\n"
                "Urinishlaringiz joyida turibdi — yakunlab qo'ying.")
    if zanjir >= 2:
        return (f"Zanjiringiz — <b>{zanjir} kun</b>.\n"
                f"Bugungi son #{raqam} hali yechilmagan. Ikki daqiqa yetadi.")
    if zanjir == 1:
        return (f"Kecha yechdingiz — zanjir boshlandi.\n"
                f"Bugungi son #{raqam} uni <b>2 kunga</b> uzaytiradi.")
    return (f"<b>Kunlik son #{raqam}</b> tayyor.\n"
            "Olti urinish, bitta yashirin tenglik. Hamma bugun shu jumboqni yechyapti.")


class Command(BaseCommand):
    help = "Kunlik son yechmaganlarga kechki xabar"

    def add_arguments(self, parser):
        parser.add_argument("--sinov", action="store_true", help="yubormaydi, faqat ko'rsatadi")
        parser.add_argument("--soat", type=int, default=None, help="shu soatda ishlasin")
        parser.add_argument("--limit", type=int, default=CHEKLOV)

    def handle(self, *args, **o):
        sinov: bool = o["sinov"]
        # Soatni buyruqning o'zi tekshiradi — sabab `eslatma.py` da.
        if o["soat"] is not None and timezone.localtime().hour != o["soat"]:
            return
        from django.conf import settings
        if not settings.BOT_TOKEN and not sinov:
            self.stderr.write(self.style.ERROR("BOT_TOKEN sozlanmagan"))
            return

        bugun = timezone.localdate()
        raqam = KS.jumboq_raqami(bugun)
        havola = X.ilova_havolasi()
        if havola and "t.me/" not in havola:
            havola = f"{havola.rstrip('/')}/oyinlar/kunlik-son"

        # Bugun YECHGANLAR — ularga yozmaymiz. Boshlagan, lekin
        # tugatmaganlarga esa yozamiz: ularga boshqacha matn boradi.
        bugun_yechgan = set(KunlikSonNatija.objects.filter(sana=bugun, bajardi=True)
                            .values_list("profile_id", flat=True))
        bugun_urindi = set(KunlikSonNatija.objects.filter(sana=bugun)
                           .values_list("profile_id", flat=True)) - bugun_yechgan
        # Umuman o'ynaganlar (oxirgi FAOL_KUN ichida).
        oynaganlar = set(KunlikSonNatija.objects.filter(
            sana__gte=bugun - timedelta(days=FAOL_KUN)).values_list("profile_id", flat=True))

        yuborildi = xato = bloklandi = otkazildi = 0
        korilgan: set[int] = set()

        for kirish in (
            Identity.objects.filter(provider=Identity.TELEGRAM)
            .filter(pupil__bot_bloklandi_at__isnull=True)
            .filter(pupil__xabar_yopiq_at__isnull=True)
            .select_related("pupil").iterator()
        ):
            if kirish.pupil_id in korilgan:
                continue
            korilgan.add(kirish.pupil_id)
            pupil = kirish.pupil

            # Bugun unga allaqachon xabar ketgan (bu buyruqdan yoki umumiy
            # eslatmadan) — ikkinchisi blokka olib keladi.
            if pupil.eslatma_at and timezone.localtime(pupil.eslatma_at).date() == bugun:
                continue

            profillar = list(pupil.profiles.all())
            idlar = [p.pk for p in profillar]
            if not idlar or not (set(idlar) & oynaganlar):
                continue                                   # hech qachon o'ynamagan
            if set(idlar) & bugun_yechgan:
                otkazildi += 1
                continue                                   # bugun yechilgan

            profil = next((p for p in profillar if p.pk in oynaganlar), profillar[0])
            matn = matn_yasa(KS.zanjir(profil, bugun), raqam, bool(set(idlar) & bugun_urindi))

            if sinov:
                self.stdout.write(f"  → {kirish.external_id}: "
                                  + matn.replace("\n", " ").replace("<b>", "").replace("</b>", ""))
                yuborildi += 1
            else:
                holat, sabab = X.yubor(
                    kirish.external_id, matn, tugma="Bugungi sonni yechish",
                    havola=X.manba_bilan(havola, "kunlik"), ilovada=True,
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
                break

        holat = "yuborilardi" if sinov else "yuborildi"
        self.stdout.write(self.style.SUCCESS(
            f"{yuborildi} ta xabar {holat}, {otkazildi} ta bugun yechgan, "
            f"{bloklandi} ta bloklagan, {xato} ta xato"
        ))
