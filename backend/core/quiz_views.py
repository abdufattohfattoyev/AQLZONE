"""Quiz — API (`core/quiz.py`). Har so'rov tanlangan PROFIL nomidan."""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import quiz as Q
from .views import _profil_tanla


def _xato(e: Q.QuizXato) -> Response:
    return Response({"detail": e.sabab, "sabab": e.sabab}, status=e.kod)


def _d(request) -> dict:
    return request.data if hasattr(request.data, "get") else {}


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def quizlar(request):
    """GET — mening quizlarim; POST `{nom, rejim, savollar}` — yangi quiz."""
    profil = _profil_tanla(request)
    try:
        if request.method == "POST":
            return Response(Q.muallif_json(Q.yarat(profil, _d(request))), status=201)
        return Response({"royxat": Q.royxat(profil)})
    except Q.QuizXato as e:
        return _xato(e)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def quiz_bitta(request, qid: int):
    """
    Muallif: ko'rish (javoblar va natijalar bilan) va POST — tahrirlash.

    PUT emas, POST: mijozning `sorov` i faqat GET/POST biladi va Telegram
    ichidagi ba'zi eski WebView'lar boshqa usullarni kesib tashlaydi.
    """
    profil = _profil_tanla(request)
    try:
        if request.method == "POST":
            return Response(Q.muallif_json(Q.yangila(profil, qid, _d(request))))
        return Response(Q.muallif_json(Q.meniki(profil, qid)))
    except Q.QuizXato as e:
        return _xato(e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def quiz_ochir(request, qid: int):
    try:
        Q.ochir(_profil_tanla(request), qid)
    except Q.QuizXato as e:
        return _xato(e)
    return Response({"ok": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def quiz_kod(request, kod: str):
    """Yechuvchi: quiz javobsiz, mening natijam va faol jonli o'yin."""
    try:
        return Response(Q.ochiq_json(Q.kod_bilan(kod), _profil_tanla(request)))
    except Q.QuizXato as e:
        return _xato(e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def quiz_topshir(request, kod: str):
    """O'z tezligida: `{javoblar: [...], sekund}` — server tekshiradi."""
    d = _d(request)
    try:
        return Response(Q.topshir(Q.kod_bilan(kod), _profil_tanla(request),
                                  d.get("javoblar"), d.get("sekund") or 0))
    except Q.QuizXato as e:
        return _xato(e)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def quiz_jonli(request, qid: int):
    """Muallif yangi jonli o'yin ochadi."""
    profil = _profil_tanla(request)
    try:
        return Response(Q.oyin_json(Q.jonli_och(profil, qid), profil), status=201)
    except Q.QuizXato as e:
        return _xato(e)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def oyin_holat(request, oid: int):
    """Jonli o'yin holati + vaqtni surish (mijoz har 1,5 s so'raydi)."""
    profil = _profil_tanla(request)
    try:
        o = Q.oyin_ol(oid)
    except Q.QuizXato as e:
        return _xato(e)
    o = Q.tick(o, Q.qatnash_ol(o, profil))
    return Response(Q.oyin_json(o, profil))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def oyin_amal(request, oid: int, amal: str):
    """`kir` `{ism}`, `javob` `{i, javob}` (ishtirokchi); `keyingi`, `tugat` (boshlovchi)."""
    profil = _profil_tanla(request)
    try:
        o = Q.oyin_ol(oid)
        if amal == "kir":
            Q.kir(o, profil, _d(request).get("ism"))
        elif amal == "javob":
            n = Q.qatnash_ol(o, profil)
            if n is None:
                return Response({"detail": "qatnashmaydi", "sabab": "qatnashmaydi"}, status=403)
            d = _d(request)
            Q.javob(o, n, d.get("i"), d.get("javob"))
        elif amal == "keyingi":
            Q.keyingi(o, profil)
        elif amal == "tugat":
            Q.tugat(o, profil)
        else:
            return Response({"detail": "amal"}, status=404)
    except Q.QuizXato as e:
        return _xato(e)
    o.refresh_from_db()
    return Response(Q.oyin_json(o, profil))
