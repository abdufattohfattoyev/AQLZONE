"""
JAMOAVIY O'YIN XONALARI — umumiy hayot sikli.

──────────────────────────── OQIM ────────────────────────────

    1. Kimdir xona ochadi         POST /xona {oyin}      → 4 xonali kod
    2. Boshqalar kod bilan kiradi POST /xona/<kod>/kir
    3. Har kim darajasini tanlab  POST /xona/<kod>/tayyor
       "Tayyorman" bosadi. HAMMA tayyor va odam yetarli bo'lsa — o'yin
       O'ZI boshlanadi, hech kim "Boshlash" ni bosmaydi.
    4. Kam bo'lsa egasi           POST /xona/<kod>/robot  → bo'sh joyga robot
    5. O'yin davomida             GET  /xona/<kod>        (har 1,5 s)
                                  POST /xona/<kod>/amal
    6. Tugagach                   POST /xona/<kod>/yana   → o'sha xona, yangi o'yin

──────────────────── NEGA "TICK" SO'ROV ICHIDA ────────────────────

    Serverda fon jarayoni yo'q (Celery bor, lekin soniyalik o'yin
    uchun u qo'pol). Vaqt har so'rovda SURILADI: muddat o'tganmi, robot
    yurish vaqti keldimi, kimdir chiqib ketdimi. O'yinchilar har 1,5
    soniyada so'raydi, ya'ni o'yin hech qachon 2 soniyadan ortiq
    "qotmaydi". Qator qulflanadi — bir vaqtda kelgan ikki so'rov vaqtni
    ikki marta surmasin.

──────────────────── BOLALAR XAVFSIZLIGI ────────────────────

    Erkin chat YO'Q: faqat `GAPLAR` dagi tayyor gaplar. Xona faqat kod
    bilan topiladi, ochiq ro'yxat yo'q — notanish odam bolaning xonasiga
    tasodifan tushmaydi.
"""
from __future__ import annotations

import random
import secrets
import time
from datetime import timedelta

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from . import oyin_kartalar as KARTALAR
from . import oyin_kodlar as KODLAR
from . import oyin_royale as ROYALE
from . import oyin_seyf as SEYF
from .models import KartaKolleksiya, Profile, Xona, XonaAzo

MODULLAR = {Xona.KARTALAR: KARTALAR, Xona.ROYALE: ROYALE, Xona.KODLAR: KODLAR, Xona.SEYF: SEYF}

#: Xona kodi shuncha soatdan keyin eskiradi va kod qayta ishlatilishi mumkin.
XONA_SOAT = 6

#: Kutish xonasida shuncha soniya belgi bermagan odam chiqarib yuboriladi.
KUTISH_KETDI = 45
#: O'yin davomida — chiqib ketgan hisoblanadi.
OYIN_KETDI = 40

#: Ruxsat etilgan tayyor gaplar. Matni mijozda (ikki tilda).
GAPLAR = ("zor", "tekshir", "ishonaman", "xato", "menemas", "xavfli", "tez", "yana")

#: Bir odam shuncha soniyada bitta gap yubora oladi.
GAP_ORALIQ = 3

ROBOT_ISMLAR = ("Robot Hisob", "Robot Son", "Robot Qalam", "Robot Chizg'ich",
                "Robot Sanoq", "Robot Kvadrat", "Robot Ayniyat", "Robot Foiz")


class XonaXato(Exception):
    """Foydalanuvchiga tushunarli sabab bilan rad etish."""

    def __init__(self, sabab: str, kod: int = 409):
        super().__init__(sabab)
        self.sabab = sabab
        self.kod = kod


def _hozir() -> float:
    return time.time()


def _faol_qs():
    return Xona.objects.filter(created_at__gte=timezone.now() - timedelta(hours=XONA_SOAT))


def kod_yasa() -> str:
    """4 xonali kod — faol xonalar orasida takrorlanmaydigan."""
    band = set(_faol_qs().exclude(holat=Xona.TUGADI).values_list("kod", flat=True))
    for _ in range(50):
        kod = f"{secrets.randbelow(9000) + 1000}"
        if kod not in band:
            return kod
    return f"{secrets.randbelow(900000) + 100000}"


def topish(kod: str) -> Xona | None:
    return _faol_qs().filter(kod=str(kod)[:8]).order_by("-created_at").first()


def _ism(profil: Profile) -> str:
    from .duel import korinadigan_ism
    return korinadigan_ism(profil)[:40]


def _faol_azolar(xona: Xona) -> list[XonaAzo]:
    return [a for a in xona.azolar.all() if not a.chiqdi]


#: Ochiq xonada tanlash mumkin bo'lgan kutish vaqtlari (daqiqa).
OCHIQ_DAQIQALAR = (1, 2, 5)


@transaction.atomic
def yarat(profil: Profile, oyin: str, daraja: int = 2, ochiq: bool = False, daqiqa=2) -> Xona:
    if oyin not in MODULLAR:
        raise XonaXato("oyin_yoq", 400)
    try:
        daqiqa = int(daqiqa)
    except (TypeError, ValueError):
        daqiqa = 2
    if daqiqa not in OCHIQ_DAQIQALAR:
        daqiqa = 2
    xona = Xona.objects.create(
        kod=kod_yasa(), oyin=oyin, egasi=profil, ochiq=bool(ochiq), kutish_soniya=daqiqa * 60,
        boshlanish=timezone.now() + timedelta(minutes=daqiqa) if ochiq else None,
    )
    XonaAzo.objects.create(xona=xona, profile=profil, ism=_ism(profil), avatar=profil.avatar,
                           daraja=_daraja(daraja), joy=0)
    return xona


def _daraja(x) -> int:
    try:
        n = int(x)
    except (TypeError, ValueError):
        return 2
    return n if n in (1, 2, 3) else 2


def azo_ol(xona: Xona, profil: Profile) -> XonaAzo | None:
    return xona.azolar.filter(profile=profil, chiqdi=False).first()


@transaction.atomic
def kir(xona: Xona, profil: Profile, daraja=None) -> XonaAzo:
    xona = Xona.objects.select_for_update().get(pk=xona.pk)
    bor = xona.azolar.filter(profile=profil).first()
    if bor and not bor.chiqdi:
        bor.belgi = timezone.now()
        bor.save(update_fields=["belgi"])
        return bor
    if xona.holat != Xona.KUTISH:
        raise XonaXato("boshlangan")
    faol = _faol_azolar(xona)
    if len(faol) >= MODULLAR[xona.oyin].MAX:
        # Joy robot bilan band bo'lsa — robot odamga joy bo'shatadi.
        robot = next((a for a in reversed(faol) if a.robot), None)
        if robot is None:
            raise XonaXato("tola")
        robot.delete()
    joy = (max((a.joy for a in xona.azolar.all()), default=-1)) + 1
    if bor:
        bor.chiqdi, bor.tayyor, bor.joy = False, False, joy
        bor.daraja = _daraja(daraja) if daraja is not None else bor.daraja
        bor.belgi = timezone.now()
        bor.save()
        return bor
    return XonaAzo.objects.create(xona=xona, profile=profil, ism=_ism(profil), avatar=profil.avatar,
                                  daraja=_daraja(daraja), joy=joy)


@transaction.atomic
def tayyor(xona: Xona, azo: XonaAzo, qiymat: bool, daraja=None) -> None:
    xona = Xona.objects.select_for_update().get(pk=xona.pk)
    if xona.holat != Xona.KUTISH:
        return
    azo.refresh_from_db()
    azo.tayyor = bool(qiymat)
    if daraja is not None:
        azo.daraja = _daraja(daraja)
    azo.belgi = timezone.now()
    azo.save(update_fields=["tayyor", "daraja", "belgi"])
    _boshlashga_urin(xona)


@transaction.atomic
def robot_qosh(xona: Xona, azo: XonaAzo) -> None:
    """Bo'sh joylarni robot bilan to'ldiradi (faqat xona egasi)."""
    xona = Xona.objects.select_for_update().get(pk=xona.pk)
    if xona.holat != Xona.KUTISH:
        raise XonaXato("boshlangan")
    if xona.egasi_id != azo.profile_id:
        raise XonaXato("egasi_emas", 403)
    m = MODULLAR[xona.oyin]
    faol = _faol_azolar(xona)
    kerak = max(0, m.ROBOT_GACHA - len(faol))
    odamlar = [a for a in faol if not a.robot]
    # Robot darajasi — odamlarning o'rtachasi: kuchli oila kuchli robot oladi.
    daraja = round(sum(a.daraja for a in odamlar) / len(odamlar)) if odamlar else 2
    joy = max((a.joy for a in xona.azolar.all()), default=-1) + 1
    bor_ismlar = {a.ism for a in faol}
    ismlar = [i for i in ROBOT_ISMLAR if i not in bor_ismlar]
    for n in range(kerak):
        XonaAzo.objects.create(xona=xona, robot=True, tayyor=True, daraja=daraja, joy=joy + n,
                               ism=ismlar[n % len(ismlar)] if ismlar else f"Robot {n + 1}")
    _boshlashga_urin(xona)


def _boshlashga_urin(xona: Xona) -> bool:
    """
    Hamma tayyor va odam yetarli — o'yin o'zi boshlanadi.

    Ochiq xona SOAT bilan boshlanadi (`_ochiq_vaqti_keldi`), bu yerda esa
    faqat xona to'lib, hamma tayyor bo'lsa — kutishning ma'nosi qolmaydi.
    """
    if xona.holat != Xona.KUTISH:
        return False
    m = MODULLAR[xona.oyin]
    faol = _faol_azolar(xona)
    if xona.ochiq and len(faol) < m.MAX:
        return False
    return _boshla(xona, faol)


def _ochiq_vaqti_keldi(xona: Xona) -> None:
    """
    Ochiq xonaning soati keldi: tayyor odamlar bilan boshlanadi.

    Tayyor bo'lmaganlar xonadan chiqariladi — ular kanal postini ochib,
    boshqa ishga o'tib ketgan odamlar. Yetmagan joyga robot qo'shiladi,
    shunda bitta tayyor odam ham o'yinsiz qolmaydi. Hech kim tayyor
    bo'lmasa xona yopiladi (`davlat.sabab = "hech_kim"`).
    """
    xona.azolar.filter(robot=False, tayyor=False).delete()
    faol = _faol_azolar(xona)
    odamlar = [a for a in faol if not a.robot]
    if not odamlar:
        xona.holat = Xona.TUGADI
        xona.tugadi_at = timezone.now()
        xona.davlat = {"sabab": "hech_kim"}
        xona.save(update_fields=["holat", "tugadi_at", "davlat"])
        return
    if xona.egasi_id not in {a.profile_id for a in odamlar}:
        xona.egasi_id = odamlar[0].profile_id
        xona.save(update_fields=["egasi"])
    m = MODULLAR[xona.oyin]
    kerak = max(0, m.MIN - len(faol))
    if kerak:
        daraja = round(sum(a.daraja for a in odamlar) / len(odamlar))
        joy = max((a.joy for a in xona.azolar.all()), default=-1) + 1
        bor = {a.ism for a in faol}
        ismlar = [i for i in ROBOT_ISMLAR if i not in bor]
        for n in range(kerak):
            XonaAzo.objects.create(xona=xona, robot=True, tayyor=True, daraja=daraja, joy=joy + n,
                                   ism=ismlar[n % len(ismlar)])
    _boshla(xona, _faol_azolar(xona))


def _boshla(xona: Xona, faol: list[XonaAzo]) -> bool:
    m = MODULLAR[xona.oyin]
    if len(faol) < m.MIN or not all(a.tayyor for a in faol) or not any(not a.robot for a in faol):
        return False
    rng = random.Random()
    azolar = [{"id": a.pk, "daraja": a.daraja, "robot": a.robot} for a in faol]
    kolleksiya = {}
    if xona.oyin == Xona.KARTALAR:
        for a in faol:
            if a.profile_id:
                kolleksiya[a.pk] = list(
                    KartaKolleksiya.objects.filter(profile_id=a.profile_id, soni__gt=0)
                    .values_list("kalit", flat=True))
    xona.davlat = m.boshla(azolar, _hozir(), rng, kolleksiya=kolleksiya, raund=xona.raund)
    xona.holat = Xona.OYIN
    xona.boshlandi_at = timezone.now()
    xona.save(update_fields=["davlat", "holat", "boshlandi_at"])
    return True


def _tugat(xona: Xona) -> None:
    """O'yin tugadi: holat, vaqt va Son kartalarida kolleksiya sovg'asi."""
    xona.holat = Xona.TUGADI
    xona.tugadi_at = timezone.now()
    if xona.oyin == Xona.KARTALAR:
        sovgalar = {}
        natija = KARTALAR.natija(xona.davlat)
        for azo in xona.azolar.filter(robot=False, profile__isnull=False):
            if natija.get(str(azo.pk), {}).get("golib"):
                kalit = random.choice(KARTALAR.MAXSUS)
                obj, _ = KartaKolleksiya.objects.get_or_create(profile_id=azo.profile_id, kalit=kalit)
                KartaKolleksiya.objects.filter(pk=obj.pk).update(soni=F("soni") + 1)
                sovgalar[str(azo.pk)] = kalit
        xona.davlat = {**xona.davlat, "sovgalar": sovgalar}

    # Tajriba va haftalik jadval — hamma o'yinda. Natija ekrani "oldin/keyin"
    # ni shu yerdan oladi va daraja oshganini ko'rsatadi.
    from . import tajriba as TJ
    xona.davlat = {**xona.davlat, "tajriba": TJ.yoz(xona, MODULLAR[xona.oyin].natija(xona.davlat))}


@transaction.atomic
def tick(xona: Xona, azo: XonaAzo | None = None) -> Xona:
    """Vaqtni suradi. Har GET so'rovda chaqiriladi."""
    xona = Xona.objects.select_for_update().get(pk=xona.pk)
    hozir_dt = timezone.now()
    if azo is not None:
        XonaAzo.objects.filter(pk=azo.pk).update(belgi=hozir_dt)

    if xona.holat == Xona.KUTISH and xona.ochiq and xona.boshlanish and hozir_dt >= xona.boshlanish:
        _ochiq_vaqti_keldi(xona)
        return xona

    if xona.holat == Xona.KUTISH:
        eski = hozir_dt - timedelta(seconds=KUTISH_KETDI)
        ketganlar = xona.azolar.filter(robot=False, chiqdi=False, belgi__lt=eski)
        if azo is not None:
            ketganlar = ketganlar.exclude(pk=azo.pk)
        if ketganlar.exists():
            ketganlar.update(chiqdi=True, tayyor=False)
            _egani_tekshir(xona)
            _boshlashga_urin(xona)
        return xona

    if xona.holat == Xona.OYIN:
        m = MODULLAR[xona.oyin]
        eski = hozir_dt - timedelta(seconds=OYIN_KETDI)
        ketganlar = {
            str(a.pk) for a in xona.azolar.filter(robot=False)
            if a.chiqdi or (a.belgi < eski and (azo is None or a.pk != azo.pk))
        }
        d = xona.davlat
        if m.tick(d, _hozir(), random.Random(), ketganlar):
            xona.davlat = d
            if d.get("tugadi"):
                _tugat(xona)
            xona.save()
    return xona


def _egani_tekshir(xona: Xona) -> None:
    odamlar = [a for a in _faol_azolar(xona) if not a.robot]
    if not odamlar:
        xona.holat = Xona.TUGADI
        xona.tugadi_at = timezone.now()
        xona.save(update_fields=["holat", "tugadi_at"])
        return
    if not any(a.profile_id == xona.egasi_id for a in odamlar):
        xona.egasi_id = odamlar[0].profile_id
        xona.save(update_fields=["egasi"])


@transaction.atomic
def amal(xona: Xona, azo: XonaAzo, data: dict) -> None:
    xona = Xona.objects.select_for_update().get(pk=xona.pk)
    if xona.holat != Xona.OYIN:
        raise XonaXato("oyin_yoq")
    m = MODULLAR[xona.oyin]
    d = xona.davlat
    xato = m.amal(d, azo.pk, data if isinstance(data, dict) else {}, _hozir(), random.Random())
    if xato:
        raise XonaXato(xato)
    xona.davlat = d
    if d.get("tugadi"):
        _tugat(xona)
    xona.save()
    XonaAzo.objects.filter(pk=azo.pk).update(belgi=timezone.now())


@transaction.atomic
def chiq(xona: Xona, azo: XonaAzo) -> None:
    xona = Xona.objects.select_for_update().get(pk=xona.pk)
    if xona.holat == Xona.KUTISH:
        azo.delete()
        _egani_tekshir(xona)
        _boshlashga_urin(xona)
        return
    XonaAzo.objects.filter(pk=azo.pk).update(chiqdi=True)


@transaction.atomic
def yana(xona: Xona, azo: XonaAzo) -> None:
    """
    "Yana o'ynaymiz" — o'sha xona, o'sha kod, yangi o'yin.

    Bosgan odam darhol tayyor, qolganlar qaytadan "Tayyorman" bosadi:
    hamma ekran oldida ekanini shu bilan bilamiz. Robotlar qoladi.
    """
    xona = Xona.objects.select_for_update().get(pk=xona.pk)
    if xona.holat != Xona.TUGADI:
        if xona.holat == Xona.KUTISH:
            return
        raise XonaXato("tugamagan")
    xona.azolar.filter(chiqdi=True).delete()
    xona.azolar.filter(robot=False).update(tayyor=False)
    XonaAzo.objects.filter(pk=azo.pk).update(tayyor=True, belgi=timezone.now(), chiqdi=False)
    xona.holat = Xona.KUTISH
    xona.davlat = {}
    xona.gaplar = []
    xona.raund = xona.raund + 1
    xona.boshlandi_at = xona.tugadi_at = None
    if xona.ochiq:
        # Ochiq xonada soat qaytadan qo'yiladi — post kanalda turibdi va
        # yangi odamlar ham kirib ulgursin.
        xona.boshlanish = timezone.now() + timedelta(seconds=xona.kutish_soniya)
    xona.save()
    _egani_tekshir(xona)


@transaction.atomic
def gap(xona: Xona, azo: XonaAzo, kalit: str) -> None:
    if kalit not in GAPLAR:
        raise XonaXato("gap_yoq", 400)
    xona = Xona.objects.select_for_update().get(pk=xona.pk)
    hozir = _hozir()
    oxirgi = [g for g in xona.gaplar if g.get("azo") == azo.pk]
    if oxirgi and hozir - oxirgi[-1]["vaqt"] < GAP_ORALIQ:
        raise XonaXato("tez", 429)
    xona.gaplar = (list(xona.gaplar) + [{"azo": azo.pk, "kalit": kalit, "vaqt": hozir}])[-10:]
    xona.save(update_fields=["gaplar"])


def korinish(xona: Xona, azo: XonaAzo | None) -> dict:
    """Mijozga ketadigan holat — faqat shu o'yinchiga ruxsat etilgani."""
    from django.conf import settings

    m = MODULLAR[xona.oyin]
    hozir = _hozir()
    hozir_dt = timezone.now()
    azolar = []
    for a in xona.azolar.all():
        if a.chiqdi and xona.holat == Xona.KUTISH:
            continue
        azolar.append({
            "id": a.pk, "ism": a.ism, "avatar": a.avatar, "robot": a.robot, "daraja": a.daraja,
            "tayyor": a.tayyor, "chiqdi": a.chiqdi,
            "egasi": a.profile_id is not None and a.profile_id == xona.egasi_id,
            "shuYerda": a.robot or (hozir_dt - a.belgi).total_seconds() < 12,
        })

    bot = (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")
    javob = {
        "kod": xona.kod, "oyin": xona.oyin, "holat": xona.holat, "raund": xona.raund,
        "min": m.MIN, "max": m.MAX, "robotGacha": m.ROBOT_GACHA,
        "azolar": azolar,
        "men": azo.pk if azo else None,
        "egasimi": bool(azo and azo.profile_id == xona.egasi_id),
        "gaplar": [g for g in xona.gaplar if hozir - g["vaqt"] < 20],
        "havola": f"https://t.me/{bot}?start=xona_{xona.kod}" if bot else "",
        "ochiq": xona.ochiq,
        "kutishSoniya": xona.kutish_soniya,
        # Ochiq xona boshlanishiga necha soniya qoldi.
        "boshlanishSoniya": (
            max(0, int((xona.boshlanish - hozir_dt).total_seconds()))
            if xona.ochiq and xona.boshlanish and xona.holat == Xona.KUTISH else None
        ),
        # Ochiq xonada hech kim tayyor bo'lmay yopildi.
        "bekor": xona.holat == Xona.TUGADI and (xona.davlat or {}).get("sabab") == "hech_kim",
        "oyinHolat": None,
        "natija": None,
    }
    if javob["bekor"]:
        return javob
    if azo is not None and xona.davlat and xona.holat in (Xona.OYIN, Xona.TUGADI):
        javob["oyinHolat"] = m.korinish(xona.davlat, azo.pk, hozir)
    if xona.holat == Xona.TUGADI and xona.davlat:
        javob["natija"] = m.natija(xona.davlat)
        javob["sovgalar"] = xona.davlat.get("sovgalar", {})
        javob["tajriba"] = xona.davlat.get("tajriba", {})
    return javob


def kolleksiya(profil: Profile) -> dict[str, int]:
    return dict(KartaKolleksiya.objects.filter(profile=profil).values_list("kalit", "soni"))
