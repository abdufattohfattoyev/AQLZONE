"""
Haftalik liga — 20 kishilik guruh, ko'tarilish va tushish.

Umumiy reyting bir necha oydan keyin qotib qoladi: yuqoridagilar bir yil
o'ynagan, yangi kelgan bola ularni hech qachon quvib yeta olmaydi. Liga shu
muammoni yechadi — hamma 20 kishilik guruhga bo'linadi, hafta oxirida
birinchi beshtasi yuqori darajaga ko'tariladi, oxirgi beshtasi quyiga
tushadi. Bola har hafta o'ziga TENG bolalar bilan yarishadi.

Ikki qoida ataylab yumshoq:

  1. Yulduz yig'magan bola TUSHMAYDI. Kasal bo'lgan yoki dam olgan bolani
     jazolash — qaytib kelish uchun sabab kamaytirish demak.

  2. Guruhda faol bola 12 tadan kam bo'lsa, hech kim tushmaydi. Loyiha
     yangi bo'lganda guruhlar to'lmaydi va 6 kishilik guruhdan 5 tasini
     tushirish kulgili bo'lardi.

Hafta qachon yakunlanadi. Ikki yo'l bor va ikkalasi ham bir xil funksiyani
chaqiradi:

  - `manage.py liga` — har dushanba tashqi rejalashtirgich chaqiradi;
  - bola o'zi ochganda — o'tgan haftasi yopilmagan bo'lsa, o'sha yerda
    yopiladi (`_boshlangich_daraja`).

Ikkinchisi shunchaki ehtiyot chorasi emas: rejalashtirgich bir hafta
ishlamay qolsa ham bola ligani ochganda hammasi joyida bo'ladi. Yakunlash
idempotent — ikki marta chaqirilsa ikkinchisi hech narsa qilmaydi.
"""
from __future__ import annotations

from datetime import date, datetime, time, timedelta

from django.db import transaction
from django.db.models import Count, Sum
from django.utils import timezone

from .models import LessonResult, LigaAzo, Profile

#: Darajalar pastdan yuqoriga. Nomer — bazadagi qiymat, shuning uchun
#: o'rtaga yangi daraja QO'SHIB BO'LMAYDI: faqat oxiriga.
DARAJALAR = [
    {"nomer": 0, "nom": "Bronza", "emoji": "🥉"},
    {"nomer": 1, "nom": "Kumush", "emoji": "🥈"},
    {"nomer": 2, "nom": "Oltin", "emoji": "🥇"},
    {"nomer": 3, "nom": "Olmos", "emoji": "💎"},
    {"nomer": 4, "nom": "Toj", "emoji": "👑"},
]

ENG_YUQORI = len(DARAJALAR) - 1

#: Bitta guruhdagi eng ko'p bola. 20 — jadval bir ekranga sig'adigan va
#: beshinchi o'rin real ko'rinadigan hajm.
GURUH_HAJMI = 20

#: Hafta oxirida nechtasi ko'tariladi va nechtasi tushadi.
KOTARILADI = 5
TUSHADI = 5

#: Guruhda shundan kam faol bola bo'lsa, hech kim tushmaydi.
TUSHISH_ENG_KAM = 12


# ------------------------------------------------------------------ vaqt


def hafta_sanasi(kun: date | None = None) -> date:
    """Berilgan kun tegishli haftaning dushanbasi."""
    kun = kun or timezone.localdate()
    return kun - timedelta(days=kun.weekday())


def hafta_boshi(kun: date | None = None) -> datetime:
    """Haftaning dushanbasi, mahalliy yarim tundan — aware datetime."""
    return timezone.make_aware(datetime.combine(hafta_sanasi(kun), time.min))


def hafta_oxiri(hafta: date) -> datetime:
    """Haftaning tugash payti — keyingi dushanba yarim tuni."""
    return timezone.make_aware(datetime.combine(hafta + timedelta(days=7), time.min))


# ---------------------------------------------------------------- yulduz


def yulduzlar(profil_idlar: list[int], hafta: date) -> dict[int, int]:
    """Shu hafta ichida har bir profil yiqqan yulduz."""
    if not profil_idlar:
        return {}
    qs = LessonResult.objects.filter(
        profile_id__in=profil_idlar,
        created_at__gte=hafta_boshi(hafta),
        created_at__lt=hafta_oxiri(hafta),
    )
    return {
        r["profile"]: r["y"] or 0
        for r in qs.values("profile").annotate(y=Sum("stars"))
    }


def darslar(profil_idlar: list[int], hafta: date) -> dict[int, int]:
    """Shu hafta ichida tugatilgan darslar soni."""
    if not profil_idlar:
        return {}
    qs = LessonResult.objects.filter(
        profile_id__in=profil_idlar,
        created_at__gte=hafta_boshi(hafta),
        created_at__lt=hafta_oxiri(hafta),
    )
    return {
        r["profile"]: r["n"]
        for r in qs.values("profile").annotate(n=Count("id"))
    }


# --------------------------------------------------------------- yakunlash


def _natija(orin: int, yulduz: int, daraja: int, faol: int) -> str:
    """Bitta a'zoning haftalik natijasi."""
    # Umuman o'ynamagan bola tushmaydi ham, ko'tarilmaydi ham.
    if yulduz <= 0:
        return "qoldi"
    if orin <= KOTARILADI and daraja < ENG_YUQORI:
        return "kotarildi"
    # Tushish zonasi FAOL bolalarning oxiridan sanaladi: o'ynamaganlar
    # jadval oxirida turadi va ular zonani band qilib qo'ymasligi kerak.
    if daraja > 0 and faol >= TUSHISH_ENG_KAM and orin > faol - TUSHADI:
        return "tushdi"
    return "qoldi"


@transaction.atomic
def guruhni_yakunla(hafta: date, daraja: int, guruh: int) -> int:
    """
    Bir guruhning haftasini yopadi: `yulduz`, `orin`, `natija` yoziladi.

    Idempotent — allaqachon yopilgan guruh qayta hisoblanmaydi. Nechta
    qator yozilgani qaytadi.
    """
    azolar = list(
        LigaAzo.objects.select_for_update().filter(
            hafta=hafta, daraja=daraja, guruh=guruh
        )
    )
    if not azolar or any(a.orin for a in azolar):
        return 0

    y = yulduzlar([a.profile_id for a in azolar], hafta)
    for a in azolar:
        a.yulduz = y.get(a.profile_id, 0)

    # Teng yulduzda oldin kelgan yuqorida turadi — tasodifiy emas, barqaror.
    azolar.sort(key=lambda a: (-a.yulduz, a.created_at, a.pk))
    faol = sum(1 for a in azolar if a.yulduz > 0)

    for i, a in enumerate(azolar, 1):
        a.orin = i
        a.natija = _natija(i, a.yulduz, daraja, faol)

    LigaAzo.objects.bulk_update(azolar, ["yulduz", "orin", "natija"])
    return len(azolar)


def haftani_yakunla(hafta: date) -> int:
    """O'sha haftaning HAMMA guruhini yopadi. Yopilgan qatorlar soni."""
    guruhlar = (
        LigaAzo.objects.filter(hafta=hafta, orin=0)
        .values_list("daraja", "guruh")
        .distinct()
    )
    return sum(guruhni_yakunla(hafta, d, g) for d, g in list(guruhlar))


def keyingi_daraja(azo: LigaAzo) -> int:
    """Yakunlangan qatordan keyingi haftaning darajasi."""
    if azo.natija == "kotarildi":
        return min(azo.daraja + 1, ENG_YUQORI)
    if azo.natija == "tushdi":
        return max(azo.daraja - 1, 0)
    return azo.daraja


# -------------------------------------------------------------- a'zolik


def _boshlangich_daraja(profile: Profile, hafta: date) -> int:
    """
    Bola bu haftani qaysi darajada boshlaydi.

    Birinchi marta kelgan bola — Bronzadan. Aks holda oxirgi o'ynagan
    haftasidan: u yakunlanmagan bo'lsa shu yerda yakunlanadi.

    Diqqat: "oxirgi hafta" — o'tgan hafta emas, OXIRGI qatnashgan hafta.
    Bir oy tanaffus qilgan bola qaysi darajada to'xtagan bo'lsa, o'sha
    darajaga qaytadi. Yo'qligi uchun pastga tushirish — qaytib kelgan
    bolani birinchi kuniyoq jazolash demak.
    """
    oxirgi = (
        LigaAzo.objects.filter(profile=profile, hafta__lt=hafta)
        .order_by("-hafta")
        .first()
    )
    if oxirgi is None:
        return 0
    if not oxirgi.orin:
        guruhni_yakunla(oxirgi.hafta, oxirgi.daraja, oxirgi.guruh)
        oxirgi.refresh_from_db()
    return keyingi_daraja(oxirgi)


def _bosh_guruh(hafta: date, daraja: int) -> int:
    """
    Shu darajada joyi bor guruh raqami; hammasi to'lgan bo'lsa yangisi.

    Eng kichik raqamli guruhdan boshlab to'ldiriladi, ya'ni yarim bo'sh
    guruhlar ko'paymaydi.
    """
    band = {
        r["guruh"]: r["n"]
        for r in LigaAzo.objects.filter(hafta=hafta, daraja=daraja)
        .values("guruh")
        .annotate(n=Count("id"))
    }
    for g in sorted(band):
        if band[g] < GURUH_HAJMI:
            return g
    return max(band) + 1 if band else 0


def azo_qil(profile: Profile, hafta: date | None = None) -> LigaAzo:
    """
    Profilni shu haftaning guruhiga qo'shadi (allaqachon bo'lsa — o'shani).

    Ikki so'rov bir vaqtda kelsa guruh 20 tadan bittaga oshib ketishi
    mumkin. Buni qulf bilan yechish mumkin edi, lekin narxi bor: har
    ochilishda jadval qulflanadi. 21 kishilik guruh esa hech kimga
    xalaqit bermaydi.
    """
    hafta = hafta or hafta_sanasi()
    mavjud = LigaAzo.objects.filter(profile=profile, hafta=hafta).first()
    if mavjud:
        return mavjud

    daraja = _boshlangich_daraja(profile, hafta)
    azo, _ = LigaAzo.objects.get_or_create(
        profile=profile,
        hafta=hafta,
        defaults={"daraja": daraja, "guruh": _bosh_guruh(hafta, daraja)},
    )
    return azo


def daraja_json(nomer: int) -> dict:
    """Darajaning ko'rsatiladigan ma'lumoti. Noma'lum nomer — eng pastgi."""
    return DARAJALAR[nomer] if 0 <= nomer < len(DARAJALAR) else DARAJALAR[0]
