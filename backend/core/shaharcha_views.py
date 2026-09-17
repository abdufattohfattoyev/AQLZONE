"""Tulki shaharchasi — API (`core/shaharcha.py`)."""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import shaharcha as SH
from .views import _profil_tanla


def _xato(e: SH.ShaharchaXato) -> Response:
    return Response({"detail": e.sabab, "sabab": e.sabab}, status=e.kod)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shaharcha(request):
    profil = _profil_tanla(request)
    return Response({**SH.korinish(SH.ol(profil)), "qoshnilar": SH.qoshnilar(profil)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shaharcha_qur(request):
    """Bino qurish. Javobda `narx` — mijoz tangani shu miqdorda yechadi."""
    try:
        s, narx = SH.qur(_profil_tanla(request), request.data.get("joy"), str(request.data.get("tur") or ""))
    except SH.ShaharchaXato as e:
        return _xato(e)
    return Response({**SH.korinish(s), "narx": narx})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shaharcha_oshir(request):
    try:
        s, narx = SH.oshir(_profil_tanla(request), request.data.get("joy"))
    except SH.ShaharchaXato as e:
        return _xato(e)
    return Response({**SH.korinish(s), "narx": narx})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shaharcha_hosil(request):
    profil = _profil_tanla(request)
    try:
        natija = SH.hosil(profil, request.data.get("javob"))
    except SH.ShaharchaXato as e:
        return _xato(e)
    return Response({**SH.korinish(SH.ol(profil)), **natija})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shaharcha_mehmon(request, pid: int):
    try:
        return Response(SH.mehmon(_profil_tanla(request), pid))
    except SH.ShaharchaXato as e:
        return _xato(e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def shaharcha_yoqdi(request, pid: int):
    try:
        return Response(SH.yoqdi(_profil_tanla(request), pid))
    except SH.ShaharchaXato as e:
        return _xato(e)
