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
    reyting    shu haftaning jadvali — DTM yoki milliy sertifikat,
               bitta variant yoki hammasi (`haftalik_reyting`)
"""
from __future__ import annotations

from datetime import datetime, time, timedelta

from django.db import IntegrityError, transaction
from django.db.models import Exists, OuterRef
from django.utils import timezone

from .models import ImtihonNatija, Profile

#: Variantlar soni — mijozdagi `VARIANTLAR` bilan bir xil.
VARIANTLAR = 12

#: Sessiya fanlari — talabalar kurslarining manzili
#: (`frontend/src/lib/curriculum/index.ts`). Boshqa qiymat qabul
#: qilinmaydi: bu maydon ro'yxatlarda guruhlash kaliti bo'ladi.
SESSIYA_KURSLAR = {"oliy-matematika", "oliy-matematika-2", "ehtimollar-nazariyasi"}

#: Sessiya ro'yxatida qancha urinish qaytariladi.
SESSIYA_OXIRGI = 200
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


def _mavzular(x) -> list[dict]:
    """
    `[{"m": nom, "x": xato}]` — tekshirilgan, qisqartirilgan. Buzuq kelsa
    bo'sh ro'yxat: mavzular natijani rad etish sababi emas.
    """
    if not isinstance(x, list):
        return []
    r = []
    for q in x[:40]:
        if isinstance(q, dict) and isinstance(q.get("m"), str):
            xato = _butun(q.get("x"), 1, 60)
            if xato:
                r.append({"m": q["m"][:120], "x": xato})
    return r


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
    kurs = str(d.get("kurs") or "")
    if kurs and kurs not in SESSIYA_KURSLAR:
        return None
    return {"variant": variant, "jami": jami, "togri": togri, "kurs": kurs,
            "sekund": sekund if sekund is not None else 0, "mijoz_vaqt": vaqt,
            "mavzular": _mavzular(d.get("mavzular"))}


def _ochiq_variant(profil: Profile):
    """
    `variant → bool`: shu variant natijasini yozish mumkinmi (`core/premium.py`).

    Savollar mijozda yasaladi, ya'ni yopiq variantni ilova ichida qulf
    to'sadi. Server esa REYTING va TARIXNI qo'riqlaydi: aks holda so'rovni
    qo'lda yuborib, premiumsiz haftalik jadvalga kirib bo'lardi. Premium
    holati bir marta o'qiladi — eski tarix 50 tagacha bir yo'la keladi.
    """
    from . import premium as PR

    faol = PR.faolmi(profil.pupil)
    bepul = PR.bepul_variant()
    return lambda variant: faol or variant <= bepul


def yoz(profil: Profile, urinishlar, sessiya: bool = False) -> int:
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
    ochiq = _ochiq_variant(profil)
    for d in urinishlar[:MAX_BIR_YOLA]:
        t = _toza(d)
        # DTM so'rovi faqat DTM urinishini, sessiya so'rovi faqat
        # sessiyanikini yozadi — biri ikkinchisining tarixiga tushmasin.
        if not t or bool(t["kurs"]) != sessiya:
            continue
        # Yopiq DTM varianti premiumsiz — yozilmaydi (sessiya bepul).
        if not sessiya and not ochiq(t["variant"]):
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
    qs = ImtihonNatija.objects.filter(profile=profil, kurs="", tur="").order_by("-mijoz_vaqt")
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


def sessiya_royxat(profil: Profile) -> dict:
    """
    Sessiya urinishlari — hamma fan bo'yicha, eng yangisi tepada.

    Mijoz o'z qurilmasidagi nusxani shu ro'yxat bilan ALMASHTIRADI
    (`frontend/src/lib/sessiya.ts`): eng yaxshi natija va baho u yerda
    hisoblanadi, shuning uchun bu yerda faqat xom ro'yxat.
    """
    qs = (ImtihonNatija.objects.filter(profile=profil).exclude(kurs="")
          .order_by("-mijoz_vaqt")[:SESSIYA_OXIRGI])
    return {"natijalar": [{
        "kurs": n.kurs, "variant": n.variant, "togri": n.togri, "jami": n.jami,
        "sekund": n.sekund, "vaqt": n.mijoz_vaqt,
    } for n in qs]}


# ------------------------------------------------------------ sertifikat
#
# Milliy sertifikat varianti (`frontend/src/lib/sertifikat.ts`). Jadval
# o'sha (`tur="sert"`): urinishning tuzilishi deyarli bir xil, faqat
# natija 100 ballik va kasr — savollarning og'irligi har xil (1,3 / 2,2 /
# 1,5 / 1,7). `togri` — to'liq ball olingan topshiriqlar soni.

#: Sertifikat varianti uch soatlik — ehtiyot bilan to'rt soatgacha.
SERT_MAX_SEKUND = 4 * 3600


def _sert_toza(d: dict) -> dict | None:
    if not isinstance(d, dict):
        return None
    variant = _butun(d.get("variant"), 1, VARIANTLAR)
    vaqt = _butun(d.get("vaqt"), 1, 10 ** 14)
    try:
        ball = round(float(d.get("ball")), 1)
    except (TypeError, ValueError):
        return None
    if variant is None or vaqt is None or not 0 <= ball <= 100:
        return None
    jami = _butun(d.get("jami"), 1, MAX_SAVOL) or 45
    togri = _butun(d.get("togri"), 0, jami) or 0
    sekund = _butun(d.get("sekund"), 0, SERT_MAX_SEKUND)
    return {"variant": variant, "jami": jami, "togri": togri, "ball": ball, "tur": "sert",
            "sekund": sekund if sekund is not None else 0, "mijoz_vaqt": vaqt,
            "mavzular": _mavzular(d.get("mavzular"))}


def sert_yoz(profil: Profile, urinishlar) -> int:
    """Sertifikat urinishlarini yozadi (takror `vaqt` jimgina tashlanadi)."""
    if isinstance(urinishlar, dict):
        urinishlar = [urinishlar]
    if not isinstance(urinishlar, list):
        return 0
    yangi = 0
    ochiq = _ochiq_variant(profil)
    for d in urinishlar[:MAX_BIR_YOLA]:
        t = _sert_toza(d)
        if not t or not ochiq(t["variant"]):
            continue
        try:
            with transaction.atomic():
                ImtihonNatija.objects.create(profile=profil, **t)
            yangi += 1
        except IntegrityError:
            continue
    return yangi


def sert_royxat(profil: Profile) -> dict:
    """O'z sertifikat natijalari — `royxat` ning ballik egizagi."""
    qs = ImtihonNatija.objects.filter(profile=profil, tur="sert").order_by("-mijoz_vaqt")
    oxirgilar = [{"variant": n.variant, "ball": n.ball or 0, "sekund": n.sekund, "vaqt": n.mijoz_vaqt}
                 for n in qs[:OXIRGI]]
    eng: dict[int, float] = {}
    for n in qs.only("variant", "ball"):
        if (n.ball or 0) > eng.get(n.variant, -1):
            eng[n.variant] = n.ball or 0
    besh = oxirgilar[:5]
    ortacha = round(sum(x["ball"] for x in besh) / len(besh), 1) if besh else None
    return {"oxirgilar": oxirgilar, "eng_yaxshi": {str(k): v for k, v in eng.items()},
            "ortacha": ortacha, "jami": qs.count()}


# ------------------------------------------------------------ haftalik reyting
#
# "Shu hafta kim qanday ishladi" — variant bo'yicha va umumiy.
#
# FAQAT BIRINCHI URINISH. Variant raqamdan yasaladi va har safar bir xil
# chiqadi: ikkinchi urinishda odam javoblarni allaqachon ko'rgan (natija
# ekranida hammasi ochiladi). Oxirgi yoki eng yaxshi urinish hisoblansa,
# jadval "kim ko'proq qayta ishladi" degan ro'yxatga aylanardi. Test
# to'plamida ham shunday (`TestIshlash`).
#
# Hafta — dushanba 00:00 dan (Toshkent vaqti). Har dushanba jadval
# bo'shaydi: yangi kelgan ham birinchi bo'la oladi.

#: Jadvalda nechta qator qaytariladi. "Men" bu yerga sig'masa — alohida.
REYTING_QATOR = 50
TURLAR = {"dtm": "", "sert": "sert"}


def hafta_boshi(hozir: datetime | None = None) -> datetime:
    mahalliy = timezone.localtime(hozir or timezone.now())
    dushanba = mahalliy.date() - timedelta(days=mahalliy.weekday())
    return timezone.make_aware(datetime.combine(dushanba, time.min), mahalliy.tzinfo)


def _birinchilar(tur: str, boshi: datetime, oxiri: datetime | None = None):
    """[boshi, oxiri) da yozilgan va o'z variantidagi BIRINCHI bo'lgan urinishlar."""
    oldingi = ImtihonNatija.objects.filter(
        profile=OuterRef("profile"), variant=OuterRef("variant"), tur=tur, kurs="",
        mijoz_vaqt__lt=OuterRef("mijoz_vaqt"))
    qs = ImtihonNatija.objects.filter(tur=tur, kurs="", created_at__gte=boshi)
    if oxiri is not None:
        qs = qs.filter(created_at__lt=oxiri)
    return qs.annotate(oldin=Exists(oldingi)).filter(oldin=False).select_related("profile__pupil")


def _kalit(n: ImtihonNatija) -> tuple:
    """Saralash: ball (sertifikat) yoki foiz (DTM) — ko'pi oldin, keyin tezrog'i."""
    natija = n.ball if n.tur == "sert" else (n.togri / n.jami if n.jami else 0)
    return (-(natija or 0), n.sekund, n.mijoz_vaqt)


def haftalik_reyting(tur_nomi: str, variant: int | None, men: Profile | None,
                     boshi: datetime | None = None) -> dict:
    """
    `boshi` berilsa — O'SHA hafta (dushanbadan 7 kun): kanaldagi "o'tgan
    hafta reytingi" posti uchun (`reyting_post`). Aks holda joriy hafta.
    `men` bo'lmasa — hech kim "men" deb belgilanmaydi.
    """
    from django.db.models import Count

    from .duel import OZIM_NOMLARI

    tur_nomi = tur_nomi if tur_nomi in TURLAR else "dtm"
    boshi = boshi or hafta_boshi()
    hammasi = list(_birinchilar(TURLAR[tur_nomi], boshi, boshi + timedelta(days=7)))
    men_id = men.pk if men else None
    # Bir hisobda nechta profil — oilaviy hisobda bolaning ismi ham kerak.
    profillar_soni = dict(Profile.objects.filter(pupil_id__in={n.profile.pupil_id for n in hammasi})
                          .values_list("pupil").annotate(n=Count("id")))

    def ism(p: Profile) -> str:
        """
        TO'LIQ ISM — asosiy reytingdagi bilan bir manba (`Pupil.toliq_ism`,
        `views._odam_json`). Ilgari profil nomi olinardi va u ko'pincha
        standart "Men" bo'lib, jadvalda hamma "Do'stingiz" bo'lib turardi.
        Oilaviy hisobda bolaning ismi qavsda: qaysi bola ishlagani bilinsin.
        Hech narsa bo'lmasa — bo'sh, mijoz "Ishtirokchi" yozadi.
        """
        profil_nomi = (p.name or "").strip()
        if profil_nomi.lower() in OZIM_NOMLARI:
            profil_nomi = ""
        toliq = p.pupil.toliq_ism if p.pupil_id else ""
        if profil_nomi and profillar_soni.get(p.pupil_id, 1) > 1:
            return f"{toliq} ({profil_nomi})" if toliq else profil_nomi
        return toliq or profil_nomi

    # Qaysi variantda nechta odam — jadval ustidagi tanlov uchun.
    variantlar: dict[str, int] = {}
    for n in hammasi:
        variantlar[str(n.variant)] = variantlar.get(str(n.variant), 0) + 1

    if variant:
        tanlangan = [n for n in hammasi if n.variant == variant]
    else:
        # Umumiy: har odamning shu haftadagi ENG YAXSHI birinchi urinishi.
        eng: dict[int, ImtihonNatija] = {}
        for n in hammasi:
            bor = eng.get(n.profile_id)
            if bor is None or _kalit(n) < _kalit(bor):
                eng[n.profile_id] = n
        tanlangan = list(eng.values())
    tanlangan.sort(key=_kalit)

    def qator(i: int, n: ImtihonNatija) -> dict:
        q = {
            "orin": i + 1, "ism": ism(n.profile), "variant": n.variant,
            "togri": n.togri, "jami": n.jami, "ball": n.ball, "sekund": n.sekund,
            "men": n.profile_id == men_id,
        }
        # O'zimniki — qaysi urinish jadvalga kirgani: natija ekrani
        # "bu qayta ishlash, hisobga birinchisi kirdi" deb ayta olsin.
        if q["men"]:
            q["vaqt"] = n.mijoz_vaqt
        return q

    meniki = next((qator(i, n) for i, n in enumerate(tanlangan) if n.profile_id == men_id), None)
    return {
        "tur": tur_nomi,
        "variant": variant,
        "hafta_boshi": boshi.date().isoformat(),
        "ishlagan": len(tanlangan),
        "variantlar": variantlar,
        "qatorlar": [qator(i, n) for i, n in enumerate(tanlangan[:REYTING_QATOR])],
        # O'z o'rni — jadvalga sig'masa ham ko'rinsin.
        "meniki": meniki,
    }
