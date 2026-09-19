"""
Karvon yo'li — kim qayerda (hammaga ochiq ro'yxat).

O'yin qurilmada o'ynaladi; bu yerga faqat joriy joy yoziladi. Qiymatlar
chegaralanadi (bekat 0–9, yulduz 0–27): noto'g'ri raqam ro'yxatni
buzmasin. Ro'yxatda taxallus turadi, haqiqiy ism emas.
"""
from __future__ import annotations

from datetime import timedelta

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .duel import korinadigan_ism
from .models import KarvonHolat
from .views import _profil_tanla

#: Shu vaqt ichida yangilangan o'yinchi "hozir o'ynayapti" hisoblanadi.
ONLAYN = timedelta(minutes=5)
ROYXAT = 50


def _son(x, eng_kam: int, eng_kop: int) -> int:
    try:
        return max(eng_kam, min(eng_kop, int(x)))
    except (TypeError, ValueError):
        return eng_kam


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def karvon_holat(request):
    """O'yin joriy joyini yuboradi: {bekat, yulduz, daraja}."""
    profil = _profil_tanla(request)
    KarvonHolat.objects.update_or_create(profile=profil, defaults={
        "bekat": _son(request.data.get("bekat"), 0, 9),
        "yulduz": _son(request.data.get("yulduz"), 0, 27),
        "daraja": _son(request.data.get("daraja"), 1, 3),
        "faol_at": timezone.now(),
    })
    return Response({"ok": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def karvon_royxat(request):
    """Eng uzoqqa borganlar birinchi; hozir o'ynayotganlar belgilanadi."""
    profil = _profil_tanla(request)
    hozir = timezone.now()
    qs = (KarvonHolat.objects.select_related("profile")
          .order_by("-bekat", "-yulduz", "-faol_at")[:ROYXAT])
    qatorlar = [{
        "id": h.profile_id,
        "ism": korinadigan_ism(h.profile),
        "avatar": h.profile.avatar or "",
        "bekat": h.bekat,
        "yulduz": h.yulduz,
        "daraja": h.daraja,
        "onlayn": hozir - h.faol_at < ONLAYN,
        "men": h.profile_id == profil.pk,
    } for h in qs]
    jami = KarvonHolat.objects.count()
    onlayn = KarvonHolat.objects.filter(faol_at__gte=hozir - ONLAYN).count()
    men = next((q for q in qatorlar if q["men"]), None)
    if men is None:
        h = KarvonHolat.objects.filter(profile=profil).first()
        if h:
            oldinda = KarvonHolat.objects.filter(bekat__gt=h.bekat).count() + KarvonHolat.objects.filter(
                bekat=h.bekat, yulduz__gt=h.yulduz).count()
            men = {"joy": oldinda + 1, "bekat": h.bekat, "yulduz": h.yulduz}
    return Response({"qatorlar": qatorlar, "jami": jami, "onlayn": onlayn, "men": men})
