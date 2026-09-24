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

from . import karvon as KV
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
    """
    "O'yin ochiq" belgisi (daraja va faollik).

    Bekat va yulduz bu yerdan QABUL QILINMAYDI — ularni faqat server
    yozadi, javob tekshirilgandan keyin (`core/karvon.py`).
    """
    profil = _profil_tanla(request)
    h, _ = KarvonHolat.objects.get_or_create(profile=profil)
    # Daraja 1–5. Eski o'yin 1–3 yuborardi, tashqaridan sinf ham
    # kelishi mumkin — ikkalasini `karvon.darajaga` moslaydi.
    h.daraja = KV.darajaga(request.data.get("daraja"), request.data.get("sinf"))
    h.faol_at = timezone.now()
    h.save(update_fields=["daraja", "faol_at"])
    return Response({"ok": True})


def _xato(e: KV.KarvonXato) -> Response:
    return Response({"detail": e.sabab, "sabab": e.sabab}, status=e.kod)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def karvon_men(request):
    return Response(KV.men(_profil_tanla(request)))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def karvon_bekat(request):
    d = request.data
    try:
        return Response(KV.bekat_bosh(_profil_tanla(request), d.get("daraja"),
                                      _son(d.get("qol"), 5, 7), bool(d.get("soda")),
                                      bool(d.get("sahro")), bool(d.get("yetak")),
                                      sinf=d.get("sinf")))
    except KV.KarvonXato as e:
        return _xato(e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def karvon_javob(request):
    try:
        return Response(KV.javob(_profil_tanla(request), request.data.get("tokens"),
                                 request.data.get("tanlov")))
    except KV.KarvonXato as e:
        return _xato(e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def karvon_otkaz(request):
    try:
        return Response(KV.otkaz(_profil_tanla(request)))
    except KV.KarvonXato as e:
        return _xato(e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def karvon_maslahat(request):
    try:
        return Response(KV.maslahat(_profil_tanla(request), request.data.get("ishlatilgan")))
    except KV.KarvonXato as e:
        return _xato(e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def karvon_qayta(request):
    try:
        return Response(KV.qayta(_profil_tanla(request)))
    except KV.KarvonXato as e:
        return _xato(e)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def karvon_royxat(request):
    """Eng uzoqqa borganlar birinchi; hozir o'ynayotganlar belgilanadi."""
    profil = _profil_tanla(request)
    hozir = timezone.now()
    qs = (KarvonHolat.objects.select_related("profile")
          .order_by("-mavsum", "-bekat", "-yulduz", "-faol_at")[:ROYXAT])
    qatorlar = [{
        "id": h.profile_id,
        "ism": korinadigan_ism(h.profile),
        "avatar": h.profile.avatar or "",
        "bekat": h.bekat,
        "mavsum": h.mavsum or 1,
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
            # Avval mavsum, keyin bekat: ikkinchi safardagi 1-bekat
            # birinchi safardagi 8-bekatdan uzoqroqqa borgan karvon.
            m = h.mavsum or 1
            oldinda = (KarvonHolat.objects.filter(mavsum__gt=m).count()
                       + KarvonHolat.objects.filter(mavsum=m, bekat__gt=h.bekat).count()
                       + KarvonHolat.objects.filter(mavsum=m, bekat=h.bekat, yulduz__gt=h.yulduz).count())
            men = {"joy": oldinda + 1, "bekat": h.bekat, "yulduz": h.yulduz, "mavsum": m}
    return Response({"qatorlar": qatorlar, "jami": jami, "onlayn": onlayn, "men": men})
