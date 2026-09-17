"""
TULKI SHAHARCHASI — tangaga bino qurish, kunlik hosil va mehmonga borish.

──────────────────────────── QOIDA ────────────────────────────

    9 ta joy (3 × 3). Boshida o'rtada bitta uy. Tanga evaziga yangi bino
    quriladi va har bino 3 darajagacha oshiriladi.

    Har kuni bir marta HOSIL: har bino o'z daromadini beradi. Hosilni
    bola O'ZI hisoblaydi — "🏠 3 + 🌳 5 + 🏪 8 = ?" — to'g'ri topsa ikki
    barobar oladi. Matematika shu yerda: shahar qancha katta bo'lsa,
    yig'indi shuncha qiyin.

    Do'stlarning shaharchasiga mehmonga boriladi va ❤️ bosiladi (kuniga bir
    marta). Mehmondorchilik — duel va jamoaviy o'yinlardagi sheriklar.

──────────────────────────── TANGA ────────────────────────────

    Tanga hisobi mijozda (`lib/progress.tsx`) va do'kon ham shunday
    ishlaydi: mijoz avval tangani yechadi, keyin server binoni yozadi.
    Server narxni QAYTARADI — mijoz o'z hisobidan emas, serverdagi
    narxdan yechadi. Hosil miqdorini esa server hisoblaydi va javobni
    o'zi tekshiradi.
"""
from __future__ import annotations

from django.db import transaction
from django.db.models import F, Q
from django.utils import timezone

from .models import Duel, Profile, Shaharcha, ShaharchaYoqdi, XonaNatija

JOYLAR = 9
MAX_DARAJA = 3

#: Binolar: narx (qurish), daromad (1, 2, 3-darajada). Nom va belgi mijozda.
BINOLAR = {
    "uy":        {"narx": 0,   "daromad": (2, 3, 5)},
    "bog":       {"narx": 20,  "daromad": (3, 5, 8)},
    "dokon":     {"narx": 40,  "daromad": (5, 8, 12)},
    "maktab":    {"narx": 60,  "daromad": (6, 10, 15)},
    "kutubxona": {"narx": 80,  "daromad": (8, 12, 18)},
    "park":      {"narx": 100, "daromad": (10, 15, 22)},
    "fabrika":   {"narx": 150, "daromad": (14, 20, 30)},
    "minora":    {"narx": 200, "daromad": (18, 26, 38)},
    "rasadxona": {"narx": 300, "daromad": (25, 35, 50)},
}


class ShaharchaXato(Exception):
    def __init__(self, sabab: str, kod: int = 409):
        super().__init__(sabab)
        self.sabab = sabab
        self.kod = kod


def ol(profil: Profile) -> Shaharcha:
    s, yangi = Shaharcha.objects.get_or_create(profile=profil)
    if yangi or not s.binolar:
        s.binolar = {"4": {"tur": "uy", "daraja": 1}}
        s.save(update_fields=["binolar"])
    return s


def oshirish_narxi(tur: str, daraja: int) -> int:
    """2-darajaga — qurish narxining 1,5 barobari, 3-ga — 3 barobari (uy uchun 30 dan)."""
    asos = BINOLAR[tur]["narx"] or 30
    return int(asos * (1.5 if daraja == 1 else 3))


def hosil_bolaklari(s: Shaharcha) -> list[dict]:
    """Har bino bugun qancha beradi — tartib joy bo'yicha."""
    ro = []
    for joy in sorted(s.binolar, key=int):
        b = s.binolar[joy]
        ro.append({"tur": b["tur"], "miqdor": BINOLAR[b["tur"]]["daromad"][b["daraja"] - 1]})
    return ro


def korinish(s: Shaharcha, men: bool = True) -> dict:
    bugun = timezone.localdate()
    javob = {
        "binolar": s.binolar,
        "yurak": s.yurak,
        "hosilMumkin": men and s.hosil_kun != bugun,
    }
    if men:
        javob["hosil"] = hosil_bolaklari(s) if s.hosil_kun != bugun else []
        javob["narxlar"] = {k: v["narx"] for k, v in BINOLAR.items()}
        javob["daromadlar"] = {k: list(v["daromad"]) for k, v in BINOLAR.items()}
    return javob


@transaction.atomic
def qur(profil: Profile, joy, tur: str) -> tuple[Shaharcha, int]:
    s = Shaharcha.objects.select_for_update().get(pk=ol(profil).pk)
    try:
        joy = int(joy)
    except (TypeError, ValueError):
        raise ShaharchaXato("joy", 400)
    if not (0 <= joy < JOYLAR) or tur not in BINOLAR or tur == "uy":
        raise ShaharchaXato("notogri", 400)
    if str(joy) in s.binolar:
        raise ShaharchaXato("band")
    s.binolar = {**s.binolar, str(joy): {"tur": tur, "daraja": 1}}
    s.save(update_fields=["binolar"])
    return s, BINOLAR[tur]["narx"]


@transaction.atomic
def oshir(profil: Profile, joy) -> tuple[Shaharcha, int]:
    s = Shaharcha.objects.select_for_update().get(pk=ol(profil).pk)
    b = s.binolar.get(str(joy))
    if not b:
        raise ShaharchaXato("bosh")
    if b["daraja"] >= MAX_DARAJA:
        raise ShaharchaXato("eng_yuqori")
    narx = oshirish_narxi(b["tur"], b["daraja"])
    s.binolar = {**s.binolar, str(joy): {**b, "daraja": b["daraja"] + 1}}
    s.save(update_fields=["binolar"])
    return s, narx


@transaction.atomic
def hosil(profil: Profile, javob) -> dict:
    """
    Kunlik hosil. Javob to'g'ri (daromadlar yig'indisi) bo'lsa — ikki barobar.

    Noto'g'ri javob ham hosilni beradi, faqat bir barobar: jazo emas, bonus
    yo'qotiladi. Hosil bugun qayta olinmaydi.
    """
    s = Shaharcha.objects.select_for_update().get(pk=ol(profil).pk)
    bugun = timezone.localdate()
    if s.hosil_kun == bugun:
        raise ShaharchaXato("olingan")
    jami = sum(x["miqdor"] for x in hosil_bolaklari(s))
    try:
        togri = int(javob) == jami
    except (TypeError, ValueError):
        togri = False
    s.hosil_kun = bugun
    s.save(update_fields=["hosil_kun"])
    return {"jami": jami, "togri": togri, "tanga": jami * 2 if togri else jami}


def sherik_idlar(profil: Profile, soni: int = 20) -> list[int]:
    """
    Duel va jamoaviy o'yinlardagi sheriklar.

    Mehmonga FAQAT shular boriladi: istalgan raqam bilan istalgan
    shaharchani ochib bo'lsa, notanish odam bolalarning ismlarini birma-bir
    ko'rib chiqa olardi.
    """
    ids: list[int] = []
    for ch, qa in (Duel.objects.filter(Q(chaqirgan=profil) | Q(qabul=profil), qabul__isnull=False)
                   .order_by("-created_at").values_list("chaqirgan_id", "qabul_id")[:100]):
        ids.append(qa if ch == profil.pk else ch)
    xonalar = XonaNatija.objects.filter(profile=profil).values_list("xona_id", flat=True)[:50]
    ids += list(XonaNatija.objects.filter(xona_id__in=list(xonalar)).exclude(profile=profil)
                .values_list("profile_id", flat=True)[:100])
    return list(dict.fromkeys(i for i in ids if i and i != profil.pk))[:soni]


def qoshnilar(profil: Profile, soni: int = 20) -> list[dict]:
    """Sheriklar shaharchalari — mehmonga borish ro'yxati."""
    from .duel import korinadigan_ism
    tartib = sherik_idlar(profil, soni)
    profillar = {p.pk: p for p in Profile.objects.filter(pk__in=tartib)}
    shaharlar = {s.profile_id: s for s in Shaharcha.objects.filter(profile_id__in=tartib)}
    bugun = timezone.localdate()
    yoqdim = set(ShaharchaYoqdi.objects.filter(kimdan=profil, kun=bugun).values_list("kimga_id", flat=True))
    return [
        {
            "profil": pid, "ism": korinadigan_ism(profillar[pid]), "avatar": profillar[pid].avatar,
            "binolar": len(shaharlar[pid].binolar) if pid in shaharlar else 0,
            "yurak": shaharlar[pid].yurak if pid in shaharlar else 0,
            "yoqdim": pid in yoqdim,
        }
        for pid in tartib if pid in profillar
    ]


def mehmon(profil: Profile, kimga_id) -> dict:
    from .duel import korinadigan_ism
    kimga = Profile.objects.filter(pk=kimga_id).first()
    if kimga is None or kimga.pk not in sherik_idlar(profil, 200):
        raise ShaharchaXato("topilmadi", 404)
    s = ol(kimga)
    return {
        **korinish(s, men=False), "ism": korinadigan_ism(kimga), "avatar": kimga.avatar,
        "yoqdim": ShaharchaYoqdi.objects.filter(kimdan=profil, kimga=kimga, kun=timezone.localdate()).exists(),
    }


@transaction.atomic
def yoqdi(profil: Profile, kimga_id) -> dict:
    kimga = Profile.objects.filter(pk=kimga_id).first()
    if kimga is None or kimga.pk == profil.pk or kimga.pk not in sherik_idlar(profil, 200):
        raise ShaharchaXato("notogri", 400)
    _, yangi = ShaharchaYoqdi.objects.get_or_create(kimdan=profil, kimga=kimga, kun=timezone.localdate())
    s = ol(kimga)
    if yangi:
        Shaharcha.objects.filter(pk=s.pk).update(yurak=F("yurak") + 1)
        s.refresh_from_db()
    return {"yurak": s.yurak, "yoqdim": True}
