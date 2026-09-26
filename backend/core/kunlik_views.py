"""
Kunlik son — API.

To'rt so'rov, va har birining aniq bitta ishi bor:

    holat    bugun nima bo'ldi va zanjir qancha (bosh ekrandagi karta)
    natija   yechildi — tekshir va yoz (ro'yxat va zanjir shundan)
    royxat   bugun eng tez yechganlar
    ulash    natija kartochkasini Telegramga yuborish

Yechimni server QAYTA yasaydi va har urinishni tekshiradi
(`core/kunlik_son.py`) — aks holda ro'yxat "kim tezroq yozsa o'sha
birinchi" degan jadvalga aylanardi.
"""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import kunlik_son as KS
from .views import _profil_tanla


def _xato(e: KS.KunlikXato) -> Response:
    return Response({"detail": e.sabab, "sabab": e.sabab}, status=e.kod)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def kunlik_holat(request):
    return Response(KS.holat(_profil_tanla(request)))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def kunlik_natija(request):
    d = request.data
    try:
        return Response(KS.yoz(_profil_tanla(request), d.get("daraja"),
                               d.get("urinishlar"), d.get("sekund")))
    except KS.KunlikXato as e:
        return _xato(e)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def kunlik_royxat(request):
    daraja = request.query_params.get("daraja")
    try:
        d = int(daraja) if daraja else None
    except ValueError:
        d = None
    return Response(KS.royxat(daraja=d if d in KS.DARAJALAR else None,
                              men=_profil_tanla(request)))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def kunlik_ulash(request):
    """
    Natija kartochkasini o'yinchining Telegramiga yuboradi.

    NEGA BOT ORQALI. Matn ko'rinishidagi kvadratchalar guruhda ko'zga
    tashlanmaydi — 30 kun ichida ulashish atigi bir marta bosilgani shuni
    ko'rsatdi. Rasm esa guruhda o'zi reklama qiladi: ostida "Men ham
    o'ynayman" tugmasi va havola turadi. Bola uni sinf guruhiga
    yo'naltiradi, ya'ni ulashishning oxirgi qadamini O'ZI qiladi — bot
    hech qanday guruhga yozmaydi.
    """
    from .kunlik_kartochka import telegramga_yubor

    try:
        return Response(telegramga_yubor(_profil_tanla(request)))
    except KS.KunlikXato as e:
        return _xato(e)


# ------------------------------------------------------------ imtihon
#
# DTM varianti natijalari (`core/imtihon.py`). Shu faylda turibdi, chunki
# ikkalasi ham bir xil shakldagi kichik so'rovlar: mijoz o'yinni o'zi
# yuritadi, server natijani saqlaydi va tarixni qaytaradi.


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def imtihon_natija(request):
    from . import imtihon as IM

    profil = _profil_tanla(request)
    if request.method == "POST":
        d = request.data if hasattr(request.data, "get") else {}
        # Bitta urinish ham, ro'yxat ham qabul qilinadi: ro'yxat
        # telefondagi eski tarixni bir yo'la ko'chirish uchun.
        yangi = IM.yoz(profil, d.get("urinishlar", d))
        javob = IM.royxat(profil)
        javob["yangi"] = yangi
        return Response(javob)
    return Response(IM.royxat(profil))



@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def sessiya_natija(request):
    """
    Talabaning sessiya urinishlari — telefon almashsa ham yo'qolmaydi.

    POST — qurilmadagi hamma urinish (takror jimgina tashlanadi) va
    javobda serverdagi to'liq ro'yxat. GET — faqat ro'yxat.
    """
    from . import imtihon as IM

    profil = _profil_tanla(request)
    if request.method == "POST":
        d = request.data if hasattr(request.data, "get") else {}
        yangi = IM.yoz(profil, d.get("urinishlar", d), sessiya=True)
        javob = IM.sessiya_royxat(profil)
        javob["yangi"] = yangi
        return Response(javob)
    return Response(IM.sessiya_royxat(profil))
