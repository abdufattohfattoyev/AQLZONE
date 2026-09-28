"""Sinf — API (`core/sinf.py`). Har so'rov tanlangan PROFIL nomidan."""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import sinf as S
from .views import _profil_tanla


def _xato(e: S.SinfXato) -> Response:
    return Response({"detail": e.sabab, "sabab": e.sabab}, status=e.kod)


def _d(request) -> dict:
    return request.data if hasattr(request.data, "get") else {}


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def sinflar(request):
    """GET — mening sinflarim; POST `{nom}` — yangi sinf (o'qituvchi sifatida)."""
    profil = _profil_tanla(request)
    try:
        if request.method == "POST":
            return Response(S.yarat(profil.pupil, _d(request).get("nom", "")))
        return Response(S.royxat(profil.pupil, profil))
    except S.SinfXato as e:
        return _xato(e)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sinf_kod(request, kod: str):
    try:
        return Response(S.kod_haqida(kod, _profil_tanla(request)))
    except S.SinfXato as e:
        return _xato(e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sinf_qoshil(request):
    try:
        return Response(S.qoshil(_profil_tanla(request), str(_d(request).get("kod", ""))))
    except S.SinfXato as e:
        return _xato(e)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sinf_bitta(request, sid: int):
    try:
        return Response(S.korish(_profil_tanla(request), sid))
    except S.SinfXato as e:
        return _xato(e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sinf_amal(request, sid: int, amal: str):
    """`chiq` (o'quvchi), `chiqar` `{profil}` va `ochir` (o'qituvchi)."""
    profil = _profil_tanla(request)
    try:
        if amal == "chiq":
            S.chiq(profil, sid)
        elif amal == "chiqar":
            try:
                pid = int(_d(request).get("profil") or 0)
            except (TypeError, ValueError):
                pid = 0
            S.chiqar(profil.pupil, sid, pid)
        elif amal == "ochir":
            S.ochir(profil.pupil, sid)
        else:
            return Response({"detail": "amal"}, status=404)
        return Response({"ok": True})
    except S.SinfXato as e:
        return _xato(e)
