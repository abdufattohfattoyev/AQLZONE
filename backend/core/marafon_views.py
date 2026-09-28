"""Marafon — API (`core/marafon.py`)."""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import marafon as MR
from .views import _profil_tanla


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def marafon(request):
    """GET — holat; POST `{marafon, kun, togri, jami, sekund}` — bugungi natija."""
    profil = _profil_tanla(request)
    if request.method == "POST":
        d = request.data if hasattr(request.data, "get") else {}
        try:
            return Response(MR.yoz(profil, int(d.get("marafon") or 0), int(d.get("kun") or 0),
                                   d.get("togri"), d.get("jami"), d.get("sekund")))
        except (TypeError, ValueError):
            return Response({"detail": "qiymat"}, status=400)
        except MR.MarafonXato as e:
            return Response({"detail": e.sabab, "sabab": e.sabab}, status=e.kod)
    h = MR.holat(profil)
    return Response(h if h else {"yoq": True})
