"""
KUNLIK SON — Wordle uslubidagi kunlik jumboq, serverdagi qismi.

O'yinning O'ZI brauzerda (`frontend/src/lib/oyin/kunlikSon.ts`) va u
shunday qoladi: jumboq sanadan yasaladi, ya'ni hamma bir xil sanada bir
xil tenglikni oladi va buning uchun serverga chiqish shart emas.

─────────────────── NEGA UNDA SERVER KERAK ───────────────────

Uchta narsa qurilmada turolmaydi:

  ZANJIR. "7 kun ketma-ket" telefon xotirasida tursa, ilovani o'chirgan
  yoki telefon almashtirgan bola butun tarixini yo'qotadi. Aynan shu
  payt u ilovani tashlab ketadi.

  RO'YXAT. "Bugun eng tez yechganlar" — bu boshqalarning natijasi. Uni
  faqat server biladi.

  ESLATMA. Botning kechki xabari "zanjiringiz 6 kun" deyishi uchun
  zanjirni SERVER bilishi kerak: bot telefonning localStorage iga
  qaray olmaydi.

─────────────────── NEGA TENGLIK QAYTA YASALADI ───────────────────

Mijoz "yechdim" deb aytsa, serverning ishonishdan boshqa chorasi
qolmasdi — ro'yxat esa shu zahoti ma'nosiz bo'lardi (kim tezroq yozsa,
o'sha birinchi). Shuning uchun jumboq bu yerda QAYTADAN yasaladi
(`jumboq`) va yuborilgan har bir urinish tekshiriladi:

  * urinish to'g'ri uzunlikda va HAQIQIY tenglik bo'lishi kerak;
  * oxirgisi kun yechimiga teng bo'lsagina "yechdi" hisoblanadi.

Generator mijozdagi bilan AYNAN bir xil bo'lishi shart, aks holda
server "yechmadingiz" deb turib oladi. Shuning uchun `core/etalon/
kunlik_son.json` da 200 kunlik etalon yotibdi va sinov ikkalasini
solishtiradi (`KunlikSonPortTest`).

Butun hisob 32 bitli: JavaScript'dagi `>>> 0`, `Math.imul` va `^`
o'sha bit naqshlari bilan ishlaydi, Python esa cheksiz butun sonlar
bilan — shuning uchun har qadamda `& M32` turadi.
"""
from __future__ import annotations

import re
from datetime import date, timedelta

from django.utils import timezone

from .models import KunlikSonNatija, Profile

M32 = 0xFFFFFFFF

#: O'yinning birinchi kuni — jumboq raqami (`#12`) shundan sanaladi.
BOSHLANISH = date(2026, 9, 17)
URINISH = 6
DARAJALAR = (1, 2, 3)

#: Eng uzoq o'ynash vaqti (sekund). Undan uzog'i soatlab ochiq turgan
#: oyna degani — ro'yxatda bunday natijaning ma'nosi yo'q.
MAX_SEKUND = 3600

#: Ro'yxatda nechta qator ko'rsatiladi.
ROYXAT = 20


def uzunlik(daraja: int) -> int:
    return 6 if daraja == 1 else 8


def jumboq_raqami(kun: date) -> int:
    return (kun - BOSHLANISH).days + 1


def kun_kaliti(kun: date | None = None) -> str:
    return (kun or timezone.localdate()).isoformat()


# ----------------------------------------------------------------- tasodif


def kun_urugi(kun: str, qism: int = 0) -> int:
    """djb2 — mijozdagi `kunUrugi` bilan bir xil."""
    x = 5381
    s = f"{kun}#{qism}"
    for ch in s:
        x = (((x * 33) & M32) ^ ord(ch)) & M32
    return x or 1


def _rng(urug: int):
    """mulberry32 — mijozdagi `rng` bilan bir xil bit-bit."""
    holat = urug & M32 or 1

    def keyingi() -> float:
        nonlocal holat
        holat = (holat + 0x6D2B79F5) & M32
        t = holat
        t = ((t ^ (t >> 15)) * (t | 1)) & M32
        t = (t ^ (t + ((t ^ (t >> 7)) * (t | 61)) & M32)) & M32
        return ((t ^ (t >> 14)) & M32) / 4294967296

    return keyingi


# ----------------------------------------------------------------- hisoblash


def hisobla(ifoda: str) -> int | None:
    """
    Ifoda qiymati; yaroqsiz bo'lsa — `None`.

    Yaroqsiz: bo'sh son, oldida nol turgan son (`07`), ketma-ket ikki
    amal, nolga yoki QOLDIQLI bo'lish. Oxirgisi ataylab: `7÷2` kabi
    urinish bolani kasr bilan chalg'itadi, javob esa butun son.
    """
    bolak = re.split(r"([+\-*/])", ifoda)
    if len(bolak) % 2 == 0:
        return None
    sonlar: list[int] = []
    amallar: list[str] = []
    for i, s in enumerate(bolak):
        if i % 2 == 0:
            if not re.fullmatch(r"\d+", s) or (len(s) > 1 and s[0] == "0"):
                return None
            sonlar.append(int(s))
        else:
            amallar.append(s)
    s2 = [sonlar[0]]
    a2: list[str] = []
    for i, a in enumerate(amallar):
        b = sonlar[i + 1]
        if a in ("*", "/"):
            oldingi = s2.pop()
            if a == "*":
                s2.append(oldingi * b)
            else:
                if b == 0 or oldingi % b:
                    return None
                s2.append(oldingi // b)
        else:
            a2.append(a)
            s2.append(b)
    natija = s2[0]
    for i, a in enumerate(a2):
        natija = natija + s2[i + 1] if a == "+" else natija - s2[i + 1]
    return natija


def tekshir(urinish: str, n: int) -> str:
    """Urinish yaroqli tenglikmi. Bo'sh satr — yaroqli."""
    if len(urinish) != n:
        return "uzunlik"
    qism = urinish.split("=")
    if len(qism) != 2:
        return "tenglik"
    if not re.fullmatch(r"\d+", qism[1]) or (len(qism[1]) > 1 and qism[1][0] == "0"):
        return "notogri"
    chap = hisobla(qism[0])
    if chap is None:
        return "notogri"
    return "" if chap == int(qism[1]) else "teng_emas"


def solishtir(urinish: str, yechim: str) -> list[str]:
    """Wordle ranglari: avval yashillar nusxani band qiladi, keyin oltinlar."""
    rang = ["boz"] * len(urinish)
    qolgan: dict[str, int] = {}
    for i, b in enumerate(yechim):
        if i < len(urinish) and urinish[i] == b:
            rang[i] = "yashil"
        else:
            qolgan[b] = qolgan.get(b, 0) + 1
    for i, b in enumerate(urinish):
        if rang[i] == "yashil":
            continue
        if qolgan.get(b):
            rang[i] = "oltin"
            qolgan[b] -= 1
    return rang


KVADRAT = {"yashil": "🟩", "oltin": "🟨", "boz": "⬜"}


def kvadratlar(urinishlar: list[str], yechim: str) -> str:
    """Ulashiladigan kvadratchalar — sonlarsiz, jumboqni ochib qo'ymaydi."""
    return "\n".join("".join(KVADRAT[r] for r in solishtir(u, yechim)) for u in urinishlar)


# ----------------------------------------------------------------- jumboq

_ZAXIRA = {1: "9+8=17", 2: "7*8-6=50", 3: "48/6+3=11"}


def jumboq(kun: str, daraja: int) -> str:
    """Kunning tengligi. Bir sana + daraja → har doim bir xil natija."""
    r = _rng(kun_urugi(kun, 100 + daraja))

    def son(a: int, b: int) -> int:
        return a + int(r() * (b - a + 1))

    n = uzunlik(daraja)
    for _ in range(2000):
        if daraja == 1:
            a, b = son(2, 20), son(1, 20)
            chap = f"{a}+{b}" if r() < 0.5 else f"{max(a, b)}-{min(a, b)}"
        elif daraja == 2:
            a, b, c = son(2, 12), son(2, 12), son(1, 20)
            shakl = int(r() * 4)
            chap = (f"{a}*{b}-{c}" if shakl == 0 else f"{a}*{b}+{c}" if shakl == 1
                    else f"{c}+{a}*{b}" if shakl == 2 else f"{a}+{b}+{c}")
        else:
            b, q, c = son(2, 9), son(2, 12), son(1, 20)
            shakl = int(r() * 3)
            chap = (f"{b * q}/{b}+{c}" if shakl == 0
                    else f"{b * q}/{b}-{min(c, q)}" if shakl == 1 else f"{c}+{b * q}/{b}")
        natija = hisobla(chap)
        if natija is None or natija < 0:
            continue
        tenglik = f"{chap}={natija}"
        if len(tenglik) != n:
            continue
        if daraja == 3 and "/" not in tenglik:
            continue
        if daraja == 2 and "*" not in tenglik and r() < 0.8:
            continue
        return tenglik
    return _ZAXIRA[daraja]


# ----------------------------------------------------------------- natija


class KunlikXato(Exception):
    def __init__(self, sabab: str, kod: int = 400):
        super().__init__(sabab)
        self.sabab = sabab
        self.kod = kod


def _daraja(x) -> int:
    try:
        d = int(x)
    except (TypeError, ValueError):
        raise KunlikXato("daraja") from None
    if d not in DARAJALAR:
        raise KunlikXato("daraja")
    return d


def yoz(profil: Profile, daraja, urinishlar, sekund=None, kun: date | None = None) -> dict:
    """
    Natijani tekshiradi va yozadi.

    BIRINCHI YOZUV QOLADI. Ikkinchi marta yuborilgani jimgina rad
    etiladi (xato emas — mijoz qayta ulanib takror yuborishi normal).
    Busiz odam bir kunni qayta-qayta yuborib, ro'yxatdagi vaqtini
    yaxshilab olardi.
    """
    d = _daraja(daraja)
    kun = kun or timezone.localdate()
    kalit = kun_kaliti(kun)
    if not isinstance(urinishlar, list) or not 1 <= len(urinishlar) <= URINISH:
        raise KunlikXato("urinishlar")
    n = uzunlik(d)
    toza: list[str] = []
    for u in urinishlar:
        if not isinstance(u, str) or tekshir(u, n):
            raise KunlikXato("urinish_notogri")
        toza.append(u)

    yechim = jumboq(kalit, d)
    bajardi = toza[-1] == yechim
    # Yechim o'rtada turib, keyin yana urinish bo'lishi mumkin emas.
    if any(u == yechim for u in toza[:-1]):
        raise KunlikXato("urinish_notogri")
    if not bajardi and len(toza) < URINISH:
        raise KunlikXato("tugamagan")

    try:
        s = int(sekund)
    except (TypeError, ValueError):
        s = MAX_SEKUND
    s = max(1, min(MAX_SEKUND, s))

    # `get_or_create` ATAYLAB: u yozishni o'z savepoint'iga o'raydi, ya'ni
    # bir vaqtda kelgan ikkinchi so'rov butun tranzaksiyani buzmaydi.
    n_yozuv, yangi = KunlikSonNatija.objects.get_or_create(
        profile=profil, sana=kun, daraja=d,
        defaults={"urinish": len(toza), "bajardi": bajardi, "sekund": s, "urinishlar": toza},
    )

    javob = holat(profil, kun)
    javob["yangi"] = yangi
    javob["bajardi"] = n_yozuv.bajardi
    javob["joy"] = joy(profil, kun, d)
    return javob


def zanjir(profil: Profile, kun: date | None = None) -> int:
    """
    Ketma-ket nechta kun yechilgan.

    Bugun hali yechilmagan bo'lsa zanjir UZILMAYDI — u kechadan
    sanaladi: kun tugamagan, ya'ni odam hali ulgurishi mumkin.
    """
    kun = kun or timezone.localdate()
    kunlar = set(KunlikSonNatija.objects.filter(
        profile=profil, bajardi=True, sana__gte=kun - timedelta(days=400),
    ).values_list("sana", flat=True))
    if not kunlar:
        return 0
    n = 0 if kun in kunlar else 1
    soni = 0
    while kun - timedelta(days=n) in kunlar:
        soni += 1
        n += 1
    return soni


def _qator(h: KunlikSonNatija, men_id: int | None = None) -> dict:
    from .duel import korinadigan_ism

    return {
        "id": h.profile_id,
        "ism": korinadigan_ism(h.profile),
        "avatar": h.profile.avatar or "",
        "daraja": h.daraja,
        "urinish": h.urinish,
        "sekund": h.sekund,
        "men": h.profile_id == men_id,
    }


def _saralash(qs):
    """Kam urinish → tez vaqt. Ya'ni ro'yxat AQL uchun, klaviatura uchun emas."""
    return qs.order_by("urinish", "sekund", "created_at")


def royxat(kun: date | None = None, daraja: int | None = None, men: Profile | None = None) -> dict:
    kun = kun or timezone.localdate()
    qs = KunlikSonNatija.objects.select_related("profile").filter(sana=kun, bajardi=True)
    if daraja:
        qs = qs.filter(daraja=daraja)
    men_id = men.pk if men else None
    qatorlar = [_qator(h, men_id) for h in _saralash(qs)[:ROYXAT]]
    return {
        "sana": kun_kaliti(kun),
        "raqam": jumboq_raqami(kun),
        "qatorlar": qatorlar,
        "jami": KunlikSonNatija.objects.filter(sana=kun).values("profile_id").distinct().count(),
        "yechgan": qs.values("profile_id").distinct().count(),
    }


def joy(profil: Profile, kun: date | None = None, daraja: int | None = None) -> int | None:
    """Shu kunda nechanchi o'rin (yechilmagan bo'lsa — `None`)."""
    kun = kun or timezone.localdate()
    qs = KunlikSonNatija.objects.filter(sana=kun, bajardi=True)
    if daraja:
        qs = qs.filter(daraja=daraja)
    meniki = qs.filter(profile=profil).first()
    if not meniki:
        return None
    oldinda = qs.filter(urinish__lt=meniki.urinish).count() + qs.filter(
        urinish=meniki.urinish, sekund__lt=meniki.sekund).count()
    return oldinda + 1


def holat(profil: Profile, kun: date | None = None) -> dict:
    """Bosh ekrandagi karta uchun: bugun nima bo'ldi va zanjir qancha."""
    kun = kun or timezone.localdate()
    bugun = {h.daraja: h for h in KunlikSonNatija.objects.filter(profile=profil, sana=kun)}
    return {
        "sana": kun_kaliti(kun),
        "raqam": jumboq_raqami(kun),
        "zanjir": zanjir(profil, kun),
        "bajarildi": any(h.bajardi for h in bugun.values()),
        "darajalar": {str(d): {"bajardi": h.bajardi, "urinish": h.urinish, "sekund": h.sekund}
                      for d, h in bugun.items()},
        "eng_uzun": (KunlikSonNatija.objects.filter(profile=profil, bajardi=True).count()),
    }
