"""
ONLAYN O'YINCHILAR — kim hozir ilovada.

─────────────────── NEGA KERAK ───────────────────

Duel shu paytgacha faqat HAVOLA bilan ishlardi: odam chaqiruv
yasaydi, havolani do'stiga yuboradi va javobini kutadi. Bu do'sti
bor odam uchun ishlaydi. Kimsasi yo'q bola esa duelni umuman
o'ynay olmasdi — raqib topadigan joy yo'q edi.

Endi ro'yxat bor: hozir ilovada turgan odamlar ko'rinadi va
bittasini bosib chaqirsa bo'ladi.

─────────────────── KIM RO'YXATGA TUSHADI ───────────────────

Uchta shart va uchalasi ham zarur:

  1. **Oxirgi 15 daqiqada faol** (`Session.last_seen`). Sanoq
     boshqaruv panelidagi bilan bir xil — ikkita "onlayn" ta'rifi
     bo'lsa, ular albatta bir-biriga zid javob berardi.
  2. **Ro'yxatdan o'tgan.** Ismsiz hisob ro'yxatda "Do'stingiz"
     bo'lib turardi va uni tanlashning ma'nosi yo'q.
  3. **Telegram'i bog'langan.** Chaqiruv Telegram xabari bo'lib
     boradi — boshqa yetkazish yo'li yo'q. Bog'lanmagan odamga
     chaqiruv yuborilsa, u hech qachon yetib bormasdi va
     chaqirgan odam javobini kutib o'tirardi.

─────────────────── ISM QAYSI ───────────────────

Reytingdagi bilan BIR XIL manba (`Pupil.toliq_ism`). Bir odam ikki
joyda ikki xil nom bilan ko'rinmasligi kerak, aks holda "bu o'sha
odammi?" degan savol paydo bo'ladi.
"""
from __future__ import annotations

from datetime import timedelta

from django.db.models import Max
from django.utils import timezone

from .boshqaruv import ONLAYN_DAQIQA
from .models import Identity, Profile, Pupil, Session

#: Ro'yxatda ko'pi bilan nechta odam ko'rsatiladi.
#:
#: Uzun ro'yxat tanlashni qiyinlashtiradi va pastdagilar baribir
#: bosilmaydi. Yigirmatasi bir ekranga sig'adi.
MAX_ODAM = 20


def onlayn_pupillar(bundan_tashqari: Pupil | None = None):
    """Hozir faol bo'lgan hisoblar — eng oxirgi ko'ringani birinchi."""
    chegara = timezone.now() - timedelta(minutes=ONLAYN_DAQIQA)
    qs = (
        Pupil.objects
        .filter(
            sessions__last_seen__gte=chegara,
            registered_at__isnull=False,
            identities__provider=Identity.TELEGRAM,
        )
        .annotate(korindi=Max("sessions__last_seen"))
        .order_by("-korindi")
        .distinct()
    )
    if bundan_tashqari is not None:
        qs = qs.exclude(pk=bundan_tashqari.pk)
    return qs[:MAX_ODAM]


def royxat(men: Pupil) -> list[dict]:
    """
    Ro'yxat mijozga ketadigan ko'rinishda.

    `profil` — chaqiruv aynan shu profilga yuboriladi. Bir hisobda
    bir necha bola bo'lishi mumkin va chaqiruvni ularning
    ASOSIYSIGA yuboramiz: qaysi bola ilovani ochib turganini server
    bilmaydi.
    """
    javob = []
    for p in onlayn_pupillar(men):
        profil = p.profiles.order_by("created_at", "pk").first()
        if profil is None:
            continue
        javob.append({
            "profil": profil.pk,
            "ism": p.toliq_ism or profil.name,
            "avatar": profil.avatar,
        })
    return javob


def chaqirsa_boladimi(profil: Profile) -> bool:
    """Shu profilga chaqiruv yetib boradimi (Telegram'i bormi)."""
    return profil.pupil.identities.filter(provider=Identity.TELEGRAM).exists()
