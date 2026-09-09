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

  1. **Oxirgi bir kunda faol** (`Session.last_seen`) — pastdagi
     "NEGA BIR KUN" ga qarang.
  2. **Ro'yxatdan o'tgan.** Ismsiz hisob ro'yxatda "Do'stingiz"
     bo'lib turardi va uni tanlashning ma'nosi yo'q.
  3. **Telegram'i bog'langan.** Chaqiruv Telegram xabari bo'lib
     boradi — boshqa yetkazish yo'li yo'q. Bog'lanmagan odamga
     chaqiruv yuborilsa, u hech qachon yetib bormasdi va
     chaqirgan odam javobini kutib o'tirardi.

─────────────────── NEGA BIR KUN, 15 DAQIQA EMAS ───────────────

Avval ro'yxat faqat oxirgi 15 daqiqada faol bo'lganlarni ko'rsatardi
va u deyarli HAR DOIM BO'SH edi. Sabab arifmetikada: bir kunda
ilovaga o'n besh chog'li odam kiradi, ya'ni istalgan lahzada ichkarida
bir-ikki kishi bo'ladi — va ulardan biri qarayotgan odamning o'zi.

Bo'sh ro'yxat esa xususiyatni o'ldiradi: bola duel ekranini ochadi,
hech kimni ko'rmaydi va boshqa qaramaydi.

Shuning uchun ro'yxat bir kunlik va ikki qismga bo'lingan: HOZIR
onlayn turganlar (`ONLAYN_DAQIQA`) va BUGUN kirganlar. Ikkinchisi
yolg'on emas — chaqiruv Telegram xabari bo'lib boradi va u odam
ilovada bo'lmasa ham yetib boradi. "Onlayn" degan so'z esa faqat
birinchi guruhga nisbatan ishlatiladi.

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

#: Ro'yxat qancha orqaga qaraydi (daqiqa). Bir kun — yuqoridagi
#: "NEGA BIR KUN" ga qarang.
ROYXAT_DAQIQA = 24 * 60


def onlayn_pupillar(bundan_tashqari: Pupil | None = None, daqiqa: int = ROYXAT_DAQIQA):
    """
    Faol hisoblar — eng oxirgi ko'ringani birinchi.

    `korindi` annotatsiyasi qaytadi va u chaqiruvchiga kerak:
    "hozir onlayn" bilan "bugun kirgan" ni aynan shu ajratadi.
    """
    chegara = timezone.now() - timedelta(minutes=daqiqa)
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

    `onlayn` — shu odam AYNAN HOZIR ilovadami. Mijoz shu bayroqqa
    qarab yashil nuqta qo'yadi yoki "bugun kirgan" deb yozadi.
    Ikkalasini bitta ro'yxatda berish ataylab: ular bitta savolga —
    "kimni chaqirsam bo'ladi?" — javob beradi va ikki alohida
    so'rov qilish ekranni ikki marta kutdirardi.
    """
    hozir = timezone.now() - timedelta(minutes=ONLAYN_DAQIQA)
    javob = []
    for p in onlayn_pupillar(men):
        profil = p.profiles.order_by("created_at", "pk").first()
        if profil is None:
            continue
        javob.append({
            "profil": profil.pk,
            "ism": p.toliq_ism or profil.name,
            "avatar": profil.avatar,
            "onlayn": p.korindi >= hozir,
            "korindi": p.korindi,
        })
    return javob


def chaqirsa_boladimi(profil: Profile) -> bool:
    """Shu profilga chaqiruv yetib boradimi (Telegram'i bormi)."""
    return profil.pupil.identities.filter(provider=Identity.TELEGRAM).exists()
