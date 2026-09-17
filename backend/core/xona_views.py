"""
Jamoaviy o'yin xonalari — API (`core/xona.py`).

Hamma javob bir xil shaklda: xonaning to'liq ko'rinishi (`X.korinish`).
Mijoz har amaldan keyin alohida so'rov yubormasdan yangi holatni oladi —
Hisob Royale'da bu javob va keyingi savol orasidagi kechikishni yo'qotadi.
"""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import xona as X
from .views import _profil_tanla


def _xato(e: X.XonaXato) -> Response:
    return Response({"detail": e.sabab, "sabab": e.sabab}, status=e.kod)


def _xona_va_azo(request, kod: str):
    xona = X.topish(kod)
    if xona is None:
        return None, None, Response({"detail": "topilmadi", "sabab": "topilmadi"}, status=404)
    profil = _profil_tanla(request)
    return xona, X.azo_ol(xona, profil), None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def xona_yarat(request):
    try:
        xona = X.yarat(_profil_tanla(request), str(request.data.get("oyin") or ""),
                       request.data.get("daraja"), ochiq=bool(request.data.get("ochiq")),
                       daqiqa=request.data.get("daqiqa") or 2)
    except X.XonaXato as e:
        return _xato(e)
    return Response(X.korinish(xona, X.azo_ol(xona, xona.egasi)), status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def xona_holat(request, kod: str):
    """
    Holat + vaqtni surish. A'zo bo'lmagan odam ham ko'radi (kirish
    ekrani uchun: qaysi o'yin, necha kishi) — lekin o'yin holatini emas.
    """
    xona, azo, xato = _xona_va_azo(request, kod)
    if xato:
        return xato
    xona = X.tick(xona, azo)
    # Ochiq xona soati kelganda tayyor bo'lmagan a'zo chiqariladi — endi
    # u a'zo emas va o'yin holatini ko'rmasligi kerak.
    if azo is not None:
        azo = X.azo_ol(xona, azo.profile)
    return Response(X.korinish(xona, azo))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def xona_kir(request, kod: str):
    xona, _, xato = _xona_va_azo(request, kod)
    if xato:
        return xato
    try:
        azo = X.kir(xona, _profil_tanla(request), request.data.get("daraja"))
    except X.XonaXato as e:
        return _xato(e)
    xona.refresh_from_db()
    return Response(X.korinish(xona, azo))


def _azo_kerak(fn):
    """A'zo bo'lmaganga 403 — amal faqat xona ichidan."""
    def ichki(request, kod: str):
        xona, azo, xato = _xona_va_azo(request, kod)
        if xato:
            return xato
        if azo is None:
            return Response({"detail": "azo_emas", "sabab": "azo_emas"}, status=403)
        try:
            fn(request, xona, azo)
        except X.XonaXato as e:
            return _xato(e)
        xona.refresh_from_db()
        azo.refresh_from_db()
        return Response(X.korinish(xona, azo))
    ichki.__name__ = fn.__name__
    ichki.__doc__ = fn.__doc__
    return api_view(["POST"])(permission_classes([IsAuthenticated])(ichki))


@_azo_kerak
def xona_tayyor(request, xona, azo):
    """ "Tayyorman" (va daraja). Hamma tayyor bo'lsa o'yin o'zi boshlanadi. """
    X.tayyor(xona, azo, request.data.get("tayyor", True), request.data.get("daraja"))


@_azo_kerak
def xona_robot(request, xona, azo):
    """Bo'sh joylarga robot — faqat xona egasi."""
    X.robot_qosh(xona, azo)


@_azo_kerak
def xona_amal(request, xona, azo):
    """O'yin harakati — qoidani o'yin moduli tekshiradi."""
    X.amal(xona, azo, request.data.get("amal") or {})


@_azo_kerak
def xona_gap(request, xona, azo):
    """Tayyor gap (erkin chat yo'q)."""
    X.gap(xona, azo, str(request.data.get("kalit") or ""))


@_azo_kerak
def xona_yana(request, xona, azo):
    X.yana(xona, azo)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def xona_chiq(request, kod: str):
    xona, azo, xato = _xona_va_azo(request, kod)
    if xato:
        return xato
    if azo is not None:
        X.chiq(xona, azo)
    return Response({"chiqdi": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def xona_tajriba(request):
    """Mening darajam va haftalik jadval (`?tur=hammasi|birga`)."""
    from . import tajriba as TJ
    profil = _profil_tanla(request)
    tur = "birga" if request.query_params.get("tur") == "birga" else "hammasi"
    return Response({"tajriba": TJ.meniki(profil), "jadval": TJ.haftalik(profil, tur)})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def karta_kolleksiya(request):
    """Son kartalari kolleksiyasi — {kalit: soni}."""
    return Response({"kolleksiya": X.kolleksiya(_profil_tanla(request))})
