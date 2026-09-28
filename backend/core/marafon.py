"""
DTM MARAFONI — N kun, har kuni bitta "kun varianti".

    holat     ekran uchun: bugun nechanchi kun, mening ballim va zanjirim,
              bugun ishladimmi, marafon reytingi
    yoz       kunning natijasi — faqat BUGUNGI kun va faqat BIRINCHI urinish
    eslatma   kechqurun: bugun hali ishlamagan qatnashchilarga bot xabari
    elon      boshlanish posti (kanalga)
    yakun     tugagach g'oliblar posti (kanalga), bir marta

─────────────────── QOIDALAR ───────────────────

Ball — to'g'ri javoblar yig'indisi (har kuni `savol` tadan). Teng
bo'lsa ko'proq kun qatnashgan, u ham teng bo'lsa — tezrog'i oldin.
Kechagi kunni bugun "to'ldirib" bo'lmaydi: marafon — har kuni qaytish
haqida, bir kechada 30 variant ishlash haqida emas.

Savollar mijozda urug'dan yasaladi (`lib/marafon.ts`, `marafon-<id>-<kun>`)
— shu kunning varianti hamma uchun bir xil.
"""
from __future__ import annotations

from datetime import date, timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone

from .models import Marafon, MarafonNatija, Profile

REYTING_QATOR = 20


class MarafonXato(Exception):
    def __init__(self, sabab: str, kod: int = 400):
        super().__init__(sabab)
        self.sabab, self.kod = sabab, kod


def oxiri(m: Marafon) -> date:
    """Oxirgi kun (shu kun ham marafonga kiradi)."""
    return m.boshlanish + timedelta(days=m.kunlar - 1)


def joriy(bugun: date | None = None) -> Marafon | None:
    """Hozir ketayotgan; bo'lmasa — eng yaqin boshlanadigan; bo'lmasa — oxirgi tugagan."""
    bugun = bugun or timezone.localdate()
    hammasi = list(Marafon.objects.all())
    faol = [m for m in hammasi if m.boshlanish <= bugun <= oxiri(m)]
    if faol:
        return faol[0]
    kelgusi = sorted((m for m in hammasi if m.boshlanish > bugun), key=lambda m: m.boshlanish)
    if kelgusi:
        return kelgusi[0]
    return max(hammasi, key=lambda m: m.boshlanish) if hammasi else None


def kun_raqami(m: Marafon, bugun: date | None = None) -> int | None:
    """Bugun marafonning nechanchi kuni; marafon ketmayotgan bo'lsa `None`."""
    bugun = bugun or timezone.localdate()
    k = (bugun - m.boshlanish).days + 1
    return k if 1 <= k <= m.kunlar else None


def _jadval(m: Marafon) -> list[dict]:
    """Har profil: ball, kunlar, vaqt — saralangan."""
    yig: dict[int, dict] = {}
    for pid, togri, sekund in MarafonNatija.objects.filter(marafon=m) \
            .values_list("profile_id", "togri", "sekund"):
        y = yig.setdefault(pid, {"profil": pid, "ball": 0, "kun": 0, "sekund": 0})
        y["ball"] += togri
        y["kun"] += 1
        y["sekund"] += sekund
    return sorted(yig.values(), key=lambda y: (-y["ball"], -y["kun"], y["sekund"]))


def zanjir(m: Marafon, profil: Profile, bugun: date | None = None) -> int:
    """Ketma-ket kunlar — bugundan (bugun ishlamagan bo'lsa kechadan) orqaga."""
    bugun_k = kun_raqami(m, bugun) or 0
    kunlar = set(MarafonNatija.objects.filter(marafon=m, profile=profil).values_list("kun", flat=True))
    k = bugun_k if bugun_k in kunlar else bugun_k - 1
    n = 0
    while k >= 1 and k in kunlar:
        n += 1
        k -= 1
    return n


def holat(profil: Profile, bugun: date | None = None) -> dict | None:
    from .sinf import _ism

    m = joriy(bugun)
    if not m:
        return None
    bugun = bugun or timezone.localdate()
    k = kun_raqami(m, bugun)
    jadval = _jadval(m)
    profillar = {p.pk: p for p in Profile.objects.filter(pk__in=[y["profil"] for y in jadval[:REYTING_QATOR]]
                                                         + [profil.pk]).select_related("pupil")}
    qatorlar = [{"orin": i + 1, "ism": _ism(profillar[y["profil"]]) if y["profil"] in profillar else "",
                 "ball": y["ball"], "kun": y["kun"], "men": y["profil"] == profil.pk}
                for i, y in enumerate(jadval[:REYTING_QATOR])]
    meniki_i = next((i for i, y in enumerate(jadval) if y["profil"] == profil.pk), None)
    bugungi = MarafonNatija.objects.filter(marafon=m, profile=profil, kun=k).first() if k else None
    return {
        "id": m.pk, "nom": m.nom, "boshlanish": m.boshlanish.isoformat(), "kunlar": m.kunlar,
        "savol": m.savol, "daqiqa": m.daqiqa,
        "kun": k,
        "boshlanmagan": bugun < m.boshlanish,
        "tugagan": bugun > oxiri(m),
        "ishtirokchi": len(jadval),
        "men": {
            "ball": jadval[meniki_i]["ball"] if meniki_i is not None else 0,
            "kun": jadval[meniki_i]["kun"] if meniki_i is not None else 0,
            "orin": meniki_i + 1 if meniki_i is not None else None,
            "zanjir": zanjir(m, profil, bugun),
            "bugun": {"togri": bugungi.togri, "jami": bugungi.jami} if bugungi else None,
        },
        "reyting": qatorlar,
    }


def yoz(profil: Profile, marafon_id: int, kun: int, togri, jami, sekund) -> dict:
    """Bugungi kun natijasi. Takror yuborilsa — birinchisi qoladi (xato emas)."""
    m = Marafon.objects.filter(pk=marafon_id).first()
    if not m:
        raise MarafonXato("topilmadi", 404)
    if kun_raqami(m) != kun:
        raise MarafonXato("kun_emas", 409)
    try:
        jami = max(1, min(int(jami), 60))
        togri = max(0, min(int(togri), jami))
        sekund = max(0, min(int(sekund or 0), 4 * 3600))
    except (TypeError, ValueError):
        raise MarafonXato("qiymat") from None
    try:
        with transaction.atomic():
            MarafonNatija.objects.create(marafon=m, profile=profil, kun=kun, togri=togri,
                                         jami=jami, sekund=sekund)
    except IntegrityError:
        pass
    return holat(profil)
