"""
Haftalik hisobot — ota-onaga Telegram'da, har yakshanba kechqurun.

Ishlatish:

    python manage.py haftalik_hisobot --sinov   # kimga va NIMA borishini ko'rsatadi
    python manage.py haftalik_hisobot           # haqiqiy yuborish

Jadval `aqlzone/celery.py` da (yakshanba 20:00, Toshkent vaqti).

Kimga yuboriladi:
  - Ota-ona panelida "Haftalik hisobot Telegram'ga" ni YOQQAN bo'lsa
    (`Pupil.haftalik_hisobot`; standart — o'chiq)
  - Telegram'i bog'langan, botni bloklamagan va "boshqa yozmang"
    demagan bo'lsa
  - va oxirgi 6 kun ichida hisobot olmagan bo'lsa (qayta ishga tushsa
    ham ikkinchi xabar bormaydi)

Raqamlar Ota-ona panelidagi bilan BIR XIL (`views.summary`): oxirgi
7 kun, darslar bo'yicha. Panelda "3 kun" deb turib xabarda "4 kun"
deyilsa, ota-ona ikkalasiga ham ishonmay qo'yadi.

Hafta davomida mashq qilinmagan bo'lsa ham hisobot boradi — "bu hafta
mashq qilinmadi" ota-ona aynan bilishi kerak bo'lgan xabar.
"""
from __future__ import annotations

import time
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db.models import Count, Sum
from django.utils import timezone

from core import xabar as X
from core.management.commands.eslatma import ism_tanla, settings_bot_bormi
from core.matn import M, tilni_tanla
from core.models import Identity, LessonResult, Pupil

#: Shuncha kun ichida hisobot olgan hisobga qayta yozilmaydi.
TAKROR_KUN = 6

#: "Qiynalgan mavzu" deyish uchun kamida shuncha savol va shundan past
#: aniqlik. Bitta savolda xato qilingan dars "qiyin" emas.
ZAIF_SAVOL = 5
ZAIF_FOIZ = 70

CHEKLOV = 5000


def hafta_xulosa(profil_id: int, bugun) -> dict:
    """Bitta bolaning oxirgi 7 kuni — Ota-ona panelidagi raqamlar."""
    qs = LessonResult.objects.filter(profile_id=profil_id, created_at__date__gte=bugun - timedelta(days=6))
    j = qs.aggregate(dars=Count("id"), savol=Sum("asked"), togri=Sum("correct"), vaqt=Sum("duration_ms"))
    kunlar = {timezone.localtime(v).date() for v in qs.values_list("created_at", flat=True)}
    zaif: tuple[str, float] | None = None
    for r in (
        qs.filter(asked__gt=0).exclude(lesson_name="")
        .values("lesson_name").annotate(savol=Sum("asked"), togri=Sum("correct"))
    ):
        foiz = r["togri"] * 100 / r["savol"]
        if r["savol"] >= ZAIF_SAVOL and foiz < ZAIF_FOIZ and (not zaif or foiz < zaif[1]):
            zaif = (r["lesson_name"], foiz)
    savol = j["savol"] or 0
    return {
        "kun": len(kunlar),
        "dars": j["dars"] or 0,
        "daqiqa": round((j["vaqt"] or 0) / 60000),
        "aniqlik": round((j["togri"] or 0) * 100 / savol) if savol else 0,
        # Dars nomi "O'zbekcha · Русский" ko'rinishida bo'lishi mumkin —
        # birinchi qismi olinadi.
        "zaif": zaif[0].split(" · ")[0] if zaif else "",
    }


def matn_yasa(pupil: Pupil, bugun, til: str) -> str:
    """Hisobdagi har bola uchun alohida blok."""
    qismlar = [M("hisobotSarlavha", til)]
    for p in pupil.profiles.all():
        x = hafta_xulosa(p.pk, bugun)
        ism = ism_tanla(p, pupil, til)
        if not x["dars"]:
            qismlar.append(M("hisobotBosh", til, ism=ism))
            continue
        blok = M("hisobotProfil", til, ism=ism, kun=x["kun"], dars=x["dars"],
                 daqiqa=x["daqiqa"], aniqlik=x["aniqlik"])
        # Mavzu nomi serverda faqat o'zbekcha — ruscha xabarga aralash
        # tilda qator qo'shmaymiz.
        if x["zaif"] and til == "uz":
            blok += "\n" + M("hisobotZaif", til, mavzu=x["zaif"])
        qismlar.append(blok)
    qismlar.append(M("hisobotOxiri", til))
    return "\n\n".join(qismlar)


class Command(BaseCommand):
    help = "Haftalik hisobotni yoqqan ota-onalarga Telegram xabari yuboradi"

    def add_arguments(self, parser):
        parser.add_argument("--sinov", action="store_true",
                            help="Hech narsa yubormaydi, faqat kimga va nima borishini ko'rsatadi")
        parser.add_argument("--limit", type=int, default=CHEKLOV,
                            help=f"Bir marta eng ko'pi bilan nechta xabar (standart: {CHEKLOV})")

    def handle(self, *args, **o):
        sinov: bool = o["sinov"]
        if not settings_bot_bormi() and not sinov:
            self.stderr.write(self.style.ERROR(
                "BOT_TOKEN sozlanmagan — .env ga qo'shing yoki --sinov bilan ishga tushiring"
            ))
            return

        bugun = timezone.localdate()
        chegara = timezone.now() - timedelta(days=TAKROR_KUN)
        havola = X.manba_bilan(X.ilova_havolasi(), "haftalik")
        yuborildi = xato = bloklandi = 0
        korilgan: set[int] = set()

        for kirish in (
            Identity.objects.filter(provider=Identity.TELEGRAM, pupil__haftalik_hisobot=True)
            .filter(pupil__bot_bloklandi_at__isnull=True, pupil__xabar_yopiq_at__isnull=True)
            .select_related("pupil")
            .iterator()
        ):
            pupil = kirish.pupil
            if pupil.pk in korilgan:
                continue
            korilgan.add(pupil.pk)
            if pupil.hisobot_at and pupil.hisobot_at >= chegara:
                continue

            til = tilni_tanla(pupil.til)
            matn = matn_yasa(pupil, bugun, til)

            if sinov:
                self.stdout.write(f"  → {kirish.external_id}:")
                self.stdout.write("    " + matn.replace("\n", " | ").replace("<b>", "").replace("</b>", ""))
                yuborildi += 1
            else:
                holat, sabab = X.yubor(kirish.external_id, matn, tugma=M("tHisobotOchish", til),
                                       havola=havola, ilovada=True)
                if holat == "yuborildi":
                    yuborildi += 1
                    Pupil.objects.filter(pk=pupil.pk).update(hisobot_at=timezone.now())
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
            f"{yuborildi} ta hisobot {holat}, {bloklandi} ta bloklagan, {xato} ta xato"
        ))
