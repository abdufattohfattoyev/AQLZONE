"""
DTM tayyorgarlik — natijalar serverda.

Savollar mijozda yasaladi (variant raqamidan, `frontend/src/lib/
imtihon.ts`); server faqat NATIJANI saqlaydi. Nega kerak: ilgari
tarix telefon xotirasida edi — ilovani o'chirgan yoki telefon
almashtirgan odam butun o'sish tarixini yo'qotardi, tayyorgarlikda esa
aynan shu tarix eng qimmatli narsa.

Ikki so'rov:

    yoz        bitta yoki bir nechta urinish (telefondagi eski tarix
               ham shu yo'l bilan bir marta ko'chiriladi)
    royxat     o'z natijalari: oxirgi urinishlar, har variantdagi eng
               yaxshisi va oxirgi beshtaning o'rtachasi
"""
from __future__ import annotations

from django.db import IntegrityError, transaction

from .models import ImtihonNatija, Profile

#: Variantlar soni — mijozdagi `VARIANTLAR` bilan bir xil.
VARIANTLAR = 12
#: Bitta variantda eng ko'p savol (ehtiyot chegarasi).
MAX_SAVOL = 60
#: Eng uzoq urinish — ikki soat (variant bir soatlik).
MAX_SEKUND = 2 * 3600
#: Bir so'rovda eng ko'p nechta urinish (eski tarixni ko'chirish uchun).
MAX_BIR_YOLA = 50
#: Ro'yxatda qaytariladigan oxirgi urinishlar.
OXIRGI = 20


def _butun(x, eng_kam: int, eng_kop: int) -> int | None:
    try:
        n = int(x)
    except (TypeError, ValueError):
        return None
    return n if eng_kam <= n <= eng_kop else None


def _toza(d: dict) -> dict | None:
    """Bitta urinishni tekshiradi. Yaroqsiz bo'lsa — `None` (jimgina tashlanadi)."""
    if not isinstance(d, dict):
        return None
    variant = _butun(d.get("variant"), 1, VARIANTLAR)
    jami = _butun(d.get("jami"), 1, MAX_SAVOL)
    if variant is None or jami is None:
        return None
    togri = _butun(d.get("togri"), 0, jami)
    vaqt = _butun(d.get("vaqt"), 1, 10 ** 14)
    if togri is None or vaqt is None:
        return None
    sekund = _butun(d.get("sekund"), 0, MAX_SEKUND)
    return {"variant": variant, "jami": jami, "togri": togri,
            "sekund": sekund if sekund is not None else 0, "mijoz_vaqt": vaqt}


def yoz(profil: Profile, urinishlar) -> int:
    """
    Urinishlarni yozadi. Nechta YANGI qator qo'shilganini qaytaradi.

    Takror kelgani (xuddi o'sha `vaqt`) jimgina tashlanadi — bu xato
    emas: telefon internet qaytganda qayta yuboradi.
    """
    if isinstance(urinishlar, dict):
        urinishlar = [urinishlar]
    if not isinstance(urinishlar, list):
        return 0
    yangi = 0
    for d in urinishlar[:MAX_BIR_YOLA]:
        t = _toza(d)
        if not t:
            continue
        try:
            with transaction.atomic():
                ImtihonNatija.objects.create(profile=profil, **t)
            yangi += 1
        except IntegrityError:
            continue
    return yangi


def _foiz(togri: int, jami: int) -> int:
    return round(100 * togri / jami) if jami else 0


def royxat(profil: Profile) -> dict:
    """O'z natijalari: oxirgilar, har variantdagi eng yaxshisi va o'rtacha."""
    qs = ImtihonNatija.objects.filter(profile=profil).order_by("-mijoz_vaqt")
    oxirgilar = [{
        "variant": n.variant, "togri": n.togri, "jami": n.jami,
        "sekund": n.sekund, "vaqt": n.mijoz_vaqt,
    } for n in qs[:OXIRGI]]

    eng: dict[int, dict] = {}
    for n in qs.only("variant", "togri", "jami"):
        bor = eng.get(n.variant)
        if not bor or n.togri > bor["togri"]:
            eng[n.variant] = {"togri": n.togri, "jami": n.jami}

    besh = oxirgilar[:5]
    ortacha = round(sum(_foiz(x["togri"], x["jami"]) for x in besh) / len(besh)) if besh else None
    return {
        "oxirgilar": oxirgilar,
        "eng_yaxshi": {str(k): v for k, v in eng.items()},
        "ortacha": ortacha,
        "jami": qs.count(),
    }
