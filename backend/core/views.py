"""
Aql Zone — REST API (/api/v1).

Hamma endpoint tokenga asoslangan, shuning uchun Telegram Mini App ham,
kelajakdagi APK/iOS ilova ham AYNAN shu manzillarni chaqiradi.

    POST /api/v1/auth/telegram  {initData} | {tg}   → {token, user}
    POST /api/v1/auth/device    {deviceId}          → {token, user}   (anonim)
    POST /api/v1/auth/link      {initData}  +Bearer → anonim hisobni Telegram'ga bog'laydi
    POST /api/v1/auth/kod       {kod}       ?Bearer → botdagi havola orqali kirish
    GET  /api/v1/me                         +Bearer
    GET  /api/v1/progress                   +Bearer → {state, stars}
    PUT  /api/v1/progress       {state}     +Bearer → kalit darajasida birlashtiradi
    POST /api/v1/results        {...}       +Bearer → bitta dars natijasi
    GET  /api/v1/results?limit=20           +Bearer
    GET  /api/v1/summary                    +Bearer → ota-ona hisoboti uchun
    GET  /api/v1/leaderboard?davr=jami|hafta +Bearer → top + o'z o'rning
    GET  /api/v1/liga                       +Bearer → haftalik liga guruhi
    GET  /api/v1/kanal                      +Bearer → "kanalga qo'shiling" oynasi kerakmi
    GET  /api/health
"""
from __future__ import annotations

import json
from datetime import timedelta

from django.conf import settings
from django.db import models, transaction
from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from . import auth as A
from . import duel as D
from . import kanal as K
from . import liga as L
from .models import (
    BIZNING_KALIT, MAX_QIYMAT, Duel, Identity, LessonResult, LigaAzo, Profile, Progress,
    Pupil, Session,
)
from .serializers import (
    DeviceAuthSerializer,
    HisobSerializer,
    KodSerializer,
    ProfileSerializer,
    ProgressSerializer,
    ResultSerializer,
    TelegramAuthSerializer,
)


def _user_json(pupil: Pupil) -> dict:
    usullar = sorted(pupil.identities.values_list("provider", flat=True))
    return {
        "id": pupil.pk,
        "ism": pupil.ism,
        "familiya": pupil.familiya,
        "toliqIsm": pupil.toliq_ism,
        # Raqamni to'liq qaytaramiz: uni faqat egasining o'zi ko'radi
        # (so'rov token bilan keladi) va Sozlamalarda ko'rsatiladi.
        "telefon": pupil.telefon,
        # Ro'yxat ko'rinishida — telefon yoki Google qo'shilganda bu javob
        # o'zgarmaydi, ichida yangi qiymat paydo bo'ladi, xolos.
        "kirishUsullari": usullar,
        "telegram": Identity.TELEGRAM in usullar,
        "qurilma": Identity.QURILMA in usullar,
        # Ism ham, familiya ham to'ldirilganmi. Mijoz shu bayroqqa qarab
        # ro'yxat oynasini ko'rsatadi yoki ko'rsatmaydi.
        "royxatdan": pupil.royxatdan_otgan,
        # Serverdagi til. Mijoz buni faqat SOLISHTIRISH uchun ishlatadi:
        # qurilmadagi tanlov boshqacha bo'lsa, u yangisini yuboradi.
        "til": pupil.til or "uz",
        "profillar": [_profil_json(pr) for pr in pupil.profiles.all()],
    }


def _profil_json(pr: Profile) -> dict:
    return {"id": pr.pk, "ism": pr.name, "avatar": pr.avatar}


def _profil_tanla(request) -> Profile:
    """
    So'rov qaysi bolaga tegishli.

    Mijoz `profileId` yuborsa — o'sha profil (faqat shu hisobniki bo'lsa).
    Yubormasa — birinchi profil. Shu sabab profillardan bexabar eski
    mijozlar ham ishlayveradi.
    """
    xom = request.query_params.get("profileId") or (
        request.data.get("profileId") if hasattr(request.data, "get") else None
    )
    if xom:
        pr = request.user.profiles.filter(pk=str(xom)).first()
        if pr:
            return pr
    return request.user.asosiy_profil()


def _progress_json(profile: Profile) -> dict:
    row = Progress.objects.filter(profile=profile).first()
    if not row:
        return {"state": {}, "stars": 0, "updatedAt": None}
    return {"state": row.state, "stars": row.stars, "updatedAt": row.updated_at}


@transaction.atomic
def _progress_yoz(profile: Profile, kelgan: dict[str, str]) -> dict:
    """Kalit darajasida birlashtiradi: 4-sinfni saqlash 1-sinfni o'chirmaydi."""
    row, _ = Progress.objects.select_for_update().get_or_create(profile=profile)
    yangi = dict(row.state or {})
    qabul = 0
    for kalit, qiymat in kelgan.items():
        if not BIZNING_KALIT.match(kalit):
            continue  # begona kalitlarni olmaymiz
        if not isinstance(qiymat, str) or len(qiymat) > MAX_QIYMAT:
            continue
        yangi[kalit] = qiymat
        qabul += 1

    row.state = yangi
    row.stars = Progress.yulduz_hisobla(yangi)
    row.updated_at = timezone.now()
    row.save()
    return {"qabul": qabul, "kalitlar": len(yangi), "stars": row.stars}


# ------------------------------------------------------------------ holat


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({
        "ok": True,
        "tokenSozlangan": bool(settings.BOT_TOKEN),
        # Veb saytdagi Telegram tugmasi bot nomini talab qiladi. Uni
        # frontendga yig'ish paytida emas, SHU YERDAN beramiz: botni
        # almashtirish uchun ilovani qayta yig'ish shart bo'lmasin.
        # Tugma faqat ikkalasi ham sozlanganda ko'rsatiladi.
        "botUsername": settings.BOT_USERNAME if settings.BOT_TOKEN else "",
        "versiya": "v1",
        "backend": "django",
    })


# ------------------------------------------------------------------ kirish


@api_view(["POST"])
@permission_classes([AllowAny])
def auth_telegram(request):
    """Mini App (`initData`) va veb saytdagi Login Widget (`tg`) — ikkisi ham."""
    s = TelegramAuthSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    try:
        tg = A.verify_any(s.validated_data)
    except A.TelegramXato as e:
        return Response({"error": e.error}, status=e.code)

    pupil = A.pupil_by_telegram(tg)
    token = A.issue_token(pupil, s.validated_data.get("platform") or "tg")
    return Response({"token": token, "user": _user_json(pupil)})


@api_view(["POST"])
@permission_classes([AllowAny])
def auth_device(request):
    s = DeviceAuthSerializer(data=request.data)
    if not s.is_valid():
        return Response(
            {"error": "deviceId kamida 16 belgi bo'lishi kerak"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    pupil = A.pupil_by_device(s.validated_data["deviceId"])
    token = A.issue_token(pupil, s.validated_data.get("platform") or "app")
    return Response({"token": token, "user": _user_json(pupil)})


def _yulduz(xom: str) -> int:
    """Saqlangan JSON satridan yulduz sonini oladi. O'qib bo'lmasa -1."""
    try:
        d = json.loads(xom)
        return d["stars"] if isinstance(d, dict) and isinstance(d.get("stars"), int) else -1
    except (TypeError, ValueError):
        return -1


@transaction.atomic
def _hisoblarni_birlashtir(joriy: Pupil, mavjud: Pupil) -> None:
    """
    `joriy` (odatda anonim) hisobni `mavjud` hisobga qo'shadi.

    Nizoda YULDUZI KO'PROQ qiymat ustun turadi: progress hech qachon
    kamaymaydi. Bu qoida muzokara qilinmaydi — bola uchun yo'qolgan
    yulduz ilovadan butunlay voz kechish sababi.

    Ikki joydan chaqiriladi: Telegram'ni bog'lash (`auth_link`) va
    botdagi havola orqali kirish (`auth_kod`). Ikkalasida ham vaziyat
    bir xil — brauzerdagi anonim progressni tanilgan hisobga ko'chirish.

    Profillarni juftlashtirish ikki holatga bo'linadi:

    * **Ikkala tomonda bittadan profil.** Eng ko'p uchraydigan holat: bola
      qurilmada anonim o'ynagan, keyin Telegram'ni bog'lagan. Bu BITTA
      bola, ikki xil kirish yo'li — profillar qo'shiladi. Ismga qarab
      moslash bu yerda ishlamaydi: anonim profil "Men", Telegram profili
      esa bolaning ismi bilan ataladi va progress birlashmay qolardi.
    * **Biror tomonda bir nechta profil.** Kim kimligini bilib bo'lmaydi —
      ism bo'yicha moslanadi, mos kelmagani alohida profil bo'lib ko'chadi.
      Shunda ikkinchi farzandning progressi birinchisining ustiga hech
      qachon yozilmaydi.
    """
    joriy_profillar = list(joriy.profiles.all())
    yolgiz = len(joriy_profillar) == 1 and mavjud.profiles.count() == 1

    for pr in joriy_profillar:
        juft = (
            mavjud.asosiy_profil() if yolgiz
            else mavjud.profiles.filter(name=pr.name).first()
        )
        if juft is None:
            pr.pupil = mavjud
            pr.save(update_fields=["pupil"])
            continue

        a = _progress_json(pr)["state"]
        b = _progress_json(juft)["state"]
        birlashgan = dict(b)
        for kalit, qiymat in a.items():
            if kalit not in birlashgan or _yulduz(qiymat) > _yulduz(birlashgan[kalit]):
                birlashgan[kalit] = qiymat

        Progress.objects.update_or_create(
            profile=juft,
            defaults={
                "state": birlashgan,
                "stars": Progress.yulduz_hisobla(birlashgan),
                "updated_at": timezone.now(),
            },
        )
        LessonResult.objects.filter(profile=pr).update(profile=juft)
        pr.delete()          # progressi ko'chirilgan profil endi keraksiz

    # Joriy token endi yangi hisobga ishlaydi — bola qaytadan kirmasin.
    Session.objects.filter(pupil=joriy).update(pupil=mavjud)
    Identity.objects.filter(pupil=joriy).update(pupil=mavjud)
    joriy.refresh_from_db()
    if not joriy.profiles.exists():
        joriy.delete()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def auth_link(request):
    """
    Anonim hisobni Telegram'ga bog'laydi.

    Telegram hisobi allaqachon bo'lsa — progress unga KO'CHIRILADI.
    Nizoda yulduzi ko'proq qiymat ustun turadi: progress hech qachon kamaymaydi.
    """
    s = TelegramAuthSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    try:
        tg = A.verify_any(s.validated_data)
    except A.TelegramXato as e:
        return Response({"error": e.error}, status=e.code)

    joriy: Pupil = request.user
    tg_id = str(tg["id"])

    kirish = Identity.objects.filter(
        provider=Identity.TELEGRAM, external_id=tg_id
    ).select_related("pupil").first()

    if kirish and kirish.pupil_id == joriy.pk:
        return Response({"ok": True, "holat": "allaqachon bog'langan", "userId": joriy.pk})

    if not kirish:
        # Bu Telegram hisobi hali hech kimga tegishli emas — shunchaki
        # joriy hisobga yangi kirish usuli qo'shamiz. Progress joyida qoladi.
        Identity.objects.create(
            pupil=joriy, provider=Identity.TELEGRAM, external_id=tg_id
        )
        A.ismni_yangila(
            joriy,
            tg.get("first_name") or "",
            tg.get("last_name") or "",
            tg.get("username") or "",
        )
        return Response({
            "ok": True, "holat": "bog'landi",
            "userId": joriy.pk, "user": _user_json(joriy),
        })

    # Ikki hisob ham mavjud — birlashtiramiz.
    mavjud: Pupil = kirish.pupil
    _hisoblarni_birlashtir(joriy, mavjud)

    # Ism Telegram'dagi holatga keltiriladi: bola endi shu hisob ostida
    # o'ynaydi va reytingda aynan shu nom ko'rinadi.
    A.ismni_yangila(
        mavjud,
        tg.get("first_name") or "",
        tg.get("last_name") or "",
        tg.get("username") or "",
    )
    return Response({
        "ok": True, "holat": "birlashtirildi",
        "userId": mavjud.pk, "user": _user_json(mavjud),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def auth_kod(request):
    """
    Botdagi "Saytga kirish" havolasi orqali kirish.

    Bearer token IXTIYORIY va u bo'lganda muhim ish bajariladi: brauzerda
    bola allaqachon anonim o'ynagan bo'lishi mumkin. Uning yulduzlarini
    tashlab yuborish — eng yomon nosozlik, chunki u KO'RINMAYDI: bola
    kiradi, hammasi joyida ko'rinadi, faqat progress nolga qaytgan
    bo'ladi. Shuning uchun anonim hisob botning hisobiga qo'shiladi.
    """
    s = KodSerializer(data=request.data)
    s.is_valid(raise_exception=True)

    pupil = A.kod_bilan_kir(s.validated_data["kod"])
    if pupil is None:
        return Response(
            {"error": "havola eskirgan yoki allaqachon ishlatilgan"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    joriy = request.user if request.user and request.user.is_authenticated else None
    if joriy is not None and joriy.pk != pupil.pk:
        _hisoblarni_birlashtir(joriy, pupil)
        pupil.refresh_from_db()

    token = A.issue_token(pupil, s.validated_data.get("platform") or "web")
    return Response({"token": token, "user": _user_json(pupil)})


# ------------------------------------------------------------------ profil


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    profil = _profil_tanla(request)

    if request.method == "PATCH":
        s = HisobSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        pupil: Pupil = request.user
        yangilandi = []
        # Faqat KELGAN maydonlar o'zgaradi: foydalanuvchi familiyani
        # tahrirlaganda ismi tegilmagan bo'lib qolishi kerak.
        if "ism" in s.validated_data:
            pupil.first_name = s.validated_data["ism"]
            # Endi bu ism foydalanuvchiniki: Telegram'ga qayta kirganda
            # uning o'rniga Telegram'dagi ism yozilib ketmasin.
            pupil.ism_qolda = True
            yangilandi += ["first_name", "ism_qolda"]
        if "familiya" in s.validated_data:
            pupil.last_name = s.validated_data["familiya"]
            yangilandi.append("last_name")
        # Til ilovada tanlanadi va shu yerda ESLAB QOLINADI. Ilovaning
        # o'ziga bu kerak emas (u qurilmada saqlaydi) — server yozadigan
        # xabarlar uchun kerak: eslatma va botdagi javoblar ilova yopiq
        # bo'lganda ketadi.
        if "til" in s.validated_data:
            pupil.til = s.validated_data["til"]
            yangilandi.append("til")
        pupil.save(update_fields=yangilandi)
        # Ikkalasi ham to'lgan bo'lsa ro'yxat shu yerda yopiladi —
        # foydalanuvchi "Davom etish" ni bosgan zahoti ilovaga kiradi.
        pupil.royxatni_yop()

    return Response({
        "user": _user_json(request.user),
        "profil": _profil_json(profil),
        **_progress_json(profil),
    })


@api_view(["GET", "PUT", "POST"])
@permission_classes([IsAuthenticated])
def progress(request):
    profil = _profil_tanla(request)
    if request.method == "GET":
        return Response(_progress_json(profil))

    s = ProgressSerializer(data=request.data)
    if not s.is_valid():
        return Response({"error": "state obyekt bo'lishi kerak"}, status=400)
    return Response({"ok": True, **_progress_yoz(profil, s.validated_data["state"])})


# ----------------------------------------------------------------- natija


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def results(request):
    if request.method == "POST":
        s = ResultSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        s.save(profile=_profil_tanla(request))
        return Response({"ok": True}, status=status.HTTP_201_CREATED)

    try:
        limit = int(request.query_params.get("limit") or 20)
    except ValueError:
        limit = 20
    limit = min(200, max(1, limit))
    qs = LessonResult.objects.filter(profile=_profil_tanla(request))[:limit]
    return Response({
        "natijalar": [
            {
                "grade": r.grade, "unit": r.unit, "lesson": r.lesson,
                "lesson_name": r.lesson_name, "asked": r.asked, "correct": r.correct,
                "mistakes": r.mistakes, "stars": r.stars,
                "duration_ms": r.duration_ms, "created_at": r.created_at,
            }
            for r in qs
        ]
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def summary(request):
    """Ota-ona paneli uchun: jami ko'rsatkichlar va sinflar kesimi."""
    profil = _profil_tanla(request)
    jami = LessonResult.objects.filter(profile=profil).aggregate(
        darslar=Count("id"), savollar=Sum("asked"), togri=Sum("correct"),
        xatolar=Sum("mistakes"), vaqt=Sum("duration_ms"),
    )
    jami = {k: (v or 0) for k, v in jami.items()}
    jami["aniqlik"] = round(jami["togri"] / jami["savollar"] * 100) if jami["savollar"] else 0

    sinflar = list(
        LessonResult.objects.filter(profile=profil)
        .values("grade")
        .annotate(darslar=Count("id"), savollar=Sum("asked"), togri=Sum("correct"))
        .order_by("grade")
    )

    # --- oxirgi 7 kun: ota-ona "bola muntazam mashq qilyaptimi?" deb so'raydi ---
    bugun = timezone.localdate()
    boshi = bugun - timedelta(days=6)
    xom = (
        LessonResult.objects.filter(profile=profil, created_at__date__gte=boshi)
        .values("created_at__date")
        .annotate(savollar=Sum("asked"), darslar=Count("id"))
    )
    kunlar_map = {r["created_at__date"]: r for r in xom}
    hafta = []
    for i in range(7):
        kun = boshi + timedelta(days=i)
        r = kunlar_map.get(kun)
        hafta.append({
            "sana": kun.isoformat(),
            "savollar": (r or {}).get("savollar") or 0,
            "darslar": (r or {}).get("darslar") or 0,
        })

    # --- eng qiyin kelgan darslar ---
    # Aniqlik bo'yicha saralaymiz, xatolar soni bo'yicha emas: ko'p savolli
    # dars ko'p xato beradi, bu esa uni "qiyin" ko'rsatib qo'yardi.
    qiyin = []
    for r in (
        LessonResult.objects.filter(profile=profil, asked__gt=0)
        .values("grade", "unit", "lesson", "lesson_name")
        .annotate(savollar=Sum("asked"), togri=Sum("correct"), xatolar=Sum("mistakes"))
    ):
        if not r["savollar"]:
            continue
        r["aniqlik"] = round(r["togri"] / r["savollar"] * 100)
        qiyin.append(r)
    qiyin.sort(key=lambda r: (r["aniqlik"], -r["xatolar"]))

    return Response({
        "jami": jami,
        "sinflar": sinflar,
        "hafta": hafta,
        "qiyin": qiyin[:5],
        "oson": sorted(qiyin, key=lambda r: -r["aniqlik"])[:5],
    })


#: Reytingda ko'rsatiladigan eng ko'p qator.
MAX_REYTING = 100


#: Joriy haftaning dushanbasi, mahalliy vaqt bo'yicha yarim tundan.
#: Reyting ham, liga ham AYNAN shu chegaradan foydalanadi — aks holda
#: "shu hafta" ikki joyda ikki xil ma'no anglatardi.
_hafta_boshi = L.hafta_boshi


def _reyting_jami(limit: int):
    """
    Butun vaqt bo'yicha: yig'ilgan yulduzlar.

    `Progress.stars` allaqachon hisoblangan turadi (`yulduz_hisobla`),
    shuning uchun bu yerda qayta sanash shart emas.
    """
    qs = Progress.objects.filter(
        stars__gt=0, profile__pupil__registered_at__isnull=False
    )
    top = list(qs.order_by("-stars", "updated_at").values("profile", "stars", "updated_at")[:limit])
    return qs, [(r["profile"], r["stars"]) for r in top]


def _reyting_hafta(limit: int):
    """
    Shu hafta yig'ilgani.

    Alohida ko'rsatkich, chunki umumiy jadval tez orada qotib qoladi:
    bir yil o'ynagan bolani yangi kelgani hech qachon quvib yeta olmaydi
    va reyting unga ma'nosiz bo'lib qoladi. Haftalik jadval har dushanba
    noldan boshlanadi — hamma teng sharoitda.
    """
    qs = (
        LessonResult.objects.filter(
            created_at__gte=_hafta_boshi(),
            profile__pupil__registered_at__isnull=False,
        )
        .values("profile")
        .annotate(yulduz=Sum("stars"))
        .filter(yulduz__gt=0)
    )
    top = list(qs.order_by("-yulduz", "profile")[:limit])
    return qs, [(r["profile"], r["yulduz"]) for r in top]


def _kim_ma(profil_idlar: list[int]) -> tuple[dict, dict]:
    """
    Jadval qatorlari uchun ism-avatar ma'lumoti — bitta so'rovda.

    Ikkinchi lug'at: hisobda nechta bola bor. Bitta bolali oilada profil
    nomini ko'rsatish ortiqcha ("Ali Valiyev · Ali"), shuning uchun uni
    faqat ko'p bolali hisobda chiqaramiz.
    """
    profillar = {
        p.pk: p
        for p in Profile.objects.filter(pk__in=profil_idlar).select_related("pupil")
    }
    hisoblar = {p.pupil_id for p in profillar.values()}
    bolalar = {
        r["pupil"]: r["n"]
        for r in Profile.objects.filter(pupil_id__in=hisoblar)
        .values("pupil").annotate(n=Count("id"))
    }
    return profillar, bolalar


def _odam_json(pid: int, kim: tuple[dict, dict]) -> dict:
    """Reyting va liga qatorlarining umumiy qismi: kim ekani."""
    profillar, bolalar = kim
    pr = profillar.get(pid)
    pupil = pr.pupil if pr else None
    return {
        "ism": pupil.first_name if pupil else "",
        "familiya": pupil.last_name if pupil else "",
        "toliqIsm": pupil.toliq_ism if pupil else "",
        "bola": (pr.name if pr and bolalar.get(pr.pupil_id, 1) > 1 else ""),
        "avatar": pr.avatar if pr else "",
    }


def _darslar_soni(profil_idlar: list[int], boshi=None) -> dict[int, int]:
    """Ko'rsatiladigan qatorlar uchun tugatilgan darslar soni."""
    if not profil_idlar:
        return {}
    qs = LessonResult.objects.filter(profile_id__in=profil_idlar)
    if boshi is not None:
        qs = qs.filter(created_at__gte=boshi)
    return {
        r["profile"]: r["n"]
        for r in qs.values("profile").annotate(n=Count("id"))
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    """
    Reyting: `?davr=jami|hafta`.

    O'z o'rningiz javobda ALOHIDA keladi (`men`) — top ichida bo'lmasangiz
    ham. Bu shunchaki qulaylik emas: ro'yxatda o'zini ko'rmagan bola uchun
    reyting begona odamlar jadvaliga aylanadi va uni ochishdan ma'no
    qolmaydi.

    Faqat ro'yxatdan o'tgan hisoblar qatnashadi — ismsiz qator jadvalni
    "Noma'lum" bilan to'ldirib tashlagan bo'lardi.
    """
    davr = "hafta" if request.query_params.get("davr") == "hafta" else "jami"
    try:
        limit = int(request.query_params.get("limit") or 50)
    except ValueError:
        limit = 50
    limit = min(MAX_REYTING, max(1, limit))

    joriy = _profil_tanla(request)
    qs, top = _reyting_jami(limit) if davr == "jami" else _reyting_hafta(limit)

    # --- o'z o'rnim ---
    # Top ichida bo'lsam qo'shimcha so'rov kerak emas.
    meniki = next(((o, y) for o, (pid, y) in enumerate(top, 1) if pid == joriy.pk), None)
    if meniki is None and request.user.royxatdan_otgan:
        if davr == "jami":
            row = Progress.objects.filter(profile=joriy).values("stars").first()
            men_yulduz = (row or {}).get("stars") or 0
            oldingilar = qs.filter(stars__gt=men_yulduz).count() if men_yulduz else 0
        else:
            row = qs.filter(profile=joriy.pk).order_by("profile").first()
            men_yulduz = (row or {}).get("yulduz") or 0
            oldingilar = qs.filter(yulduz__gt=men_yulduz).count() if men_yulduz else 0
        # Yulduzi yo'q bo'lsa o'rin ham yo'q: nol yulduz bilan "412-o'rin"
        # ko'rsatish rag'batlantirmaydi, aksincha.
        meniki = (oldingilar + 1, men_yulduz) if men_yulduz else None

    idlar = [pid for pid, _ in top]
    if joriy.pk not in idlar:
        idlar.append(joriy.pk)

    kim = _kim_ma(idlar)
    boshi = None if davr == "jami" else _hafta_boshi()
    darslar = _darslar_soni(idlar, boshi)

    def qator(orin: int, pid: int, yulduz: int) -> dict:
        return {
            **_odam_json(pid, kim),
            "orin": orin,
            "yulduz": yulduz,
            "darslar": darslar.get(pid, 0),
            "men": pid == joriy.pk,
        }

    return Response({
        "davr": davr,
        "top": [qator(i, pid, y) for i, (pid, y) in enumerate(top, 1)],
        "men": qator(meniki[0], joriy.pk, meniki[1]) if meniki else None,
        "qatnashchilar": qs.count(),
    })


# -------------------------------------------------------------------- liga


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def liga(request):
    """
    Haftalik liga: 20 kishilik guruh, ko'tarilish va tushish zonalari.

    Reytingdan farqi bitta va u hal qiluvchi: bu yerda bola BUTUN saytdagi
    bolalar bilan emas, o'ziga teng 20 tasi bilan yarishadi. Mantiq
    `core/liga.py` da — bu yerda faqat ko'rinish yig'iladi.

    Ro'yxatdan o'tmagan hisob guruhga QO'SHILMAYDI: ismsiz qatorlar bilan
    to'lgan jadval hech kimni qiziqtirmaydi. Bunday hisobga
    `qatnashadi: false` qaytadi va mijoz taklif ko'rsatadi.
    """
    if not request.user.royxatdan_otgan:
        return Response({
            "qatnashadi": False,
            "darajalar": L.DARAJALAR,
        })

    joriy = _profil_tanla(request)
    azo = L.azo_qil(joriy)
    hafta = azo.hafta

    guruh = list(
        LigaAzo.objects.filter(hafta=hafta, daraja=azo.daraja, guruh=azo.guruh)
    )
    idlar = [a.profile_id for a in guruh]
    yulduz = L.yulduzlar(idlar, hafta)
    darslar = L.darslar(idlar, hafta)

    # Jadval TIRIK hisoblanadi: hafta ichida `LigaAzo.yulduz` to'ldirilmaydi
    # (u faqat yakunlashda yoziladi), shuning uchun tartib har so'rovda
    # dars natijalaridan chiqadi. Yakunlash bilan bir xil qoida bo'lishi
    # uchun teng yulduzda oldin qo'shilgan yuqorida turadi.
    guruh.sort(key=lambda a: (-yulduz.get(a.profile_id, 0), a.created_at, a.pk))
    faol = sum(1 for a in guruh if yulduz.get(a.profile_id, 0) > 0)

    kim = _kim_ma(idlar)
    tushish_bor = azo.daraja > 0 and faol >= L.TUSHISH_ENG_KAM

    def zona(orin: int, y: int) -> str:
        """Qator qaysi rangda ko'rinadi."""
        if y <= 0:
            return "kutmoqda"
        if orin <= L.KOTARILADI and azo.daraja < L.ENG_YUQORI:
            return "kotariladi"
        if tushish_bor and orin > faol - L.TUSHADI:
            return "tushadi"
        return "xavfsiz"

    qatorlar = []
    men = None
    for i, a in enumerate(guruh, 1):
        y = yulduz.get(a.profile_id, 0)
        q = {
            **_odam_json(a.profile_id, kim),
            "orin": i,
            "yulduz": y,
            "darslar": darslar.get(a.profile_id, 0),
            "zona": zona(i, y),
            "men": a.profile_id == joriy.pk,
        }
        qatorlar.append(q)
        if q["men"]:
            men = q

    # O'tgan hafta qanday tugagani — bir marta ko'rsatiladigan xabar uchun.
    otgan = (
        LigaAzo.objects.filter(profile=joriy, hafta__lt=hafta)
        .exclude(orin=0)
        .order_by("-hafta")
        .first()
    )

    tugaydi = L.hafta_oxiri(hafta)
    return Response({
        "qatnashadi": True,
        "daraja": L.daraja_json(azo.daraja),
        "darajalar": L.DARAJALAR,
        "hafta": {
            "boshi": hafta,
            "tugaydi": tugaydi,
            # Mijoz o'zi ham hisoblay olardi, lekin qurilma soati noto'g'ri
            # bo'lsa "0 kun qoldi" deb yozib qo'yardi. Server aytgani aniq.
            "qolganSoat": max(0, int((tugaydi - timezone.now()).total_seconds() // 3600)),
        },
        "guruh": qatorlar,
        "men": men,
        "kotariladi": L.KOTARILADI if azo.daraja < L.ENG_YUQORI else 0,
        "tushadi": L.TUSHADI if tushish_bor else 0,
        "otganHafta": {
            "daraja": L.daraja_json(otgan.daraja),
            "orin": otgan.orin,
            "yulduz": otgan.yulduz,
            "natija": otgan.natija,
            "hafta": otgan.hafta,
        } if otgan else None,
    })


# ---------------------------------------------------------------- profillar


#: Bitta hisobdagi profillar soni. Oila uchun mo'l, lekin cheksiz emas —
#: aks holda bitta hisob bazani profil bilan to'ldirib tashlashi mumkin.
MAX_PROFIL = 6


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def profiles(request):
    """Profillar ro'yxati va yangi profil yaratish."""
    if request.method == "POST":
        if request.user.profiles.count() >= MAX_PROFIL:
            return Response(
                {"error": f"ko'pi bilan {MAX_PROFIL} ta profil bo'ladi"}, status=400
            )
        s = ProfileSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        pr = s.save(pupil=request.user)
        return Response({"profil": _profil_json(pr)}, status=status.HTTP_201_CREATED)

    return Response({"profillar": [_profil_json(p) for p in request.user.profiles.all()]})


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def profile_detail(request, pk: int):
    pr = request.user.profiles.filter(pk=pk).first()
    if pr is None:
        return Response({"error": "profil topilmadi"}, status=404)

    if request.method == "DELETE":
        # Oxirgi profilni o'chirib bo'lmaydi: progress bog'lanadigan joy
        # qolmasa, keyingi so'rov yangi profil yasab, bola o'z yulduzlarini
        # yo'qotgandek ko'rardi.
        if request.user.profiles.count() <= 1:
            return Response({"error": "oxirgi profilni o'chirib bo'lmaydi"}, status=400)
        pr.delete()
        return Response({"ok": True})

    s = ProfileSerializer(pr, data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    return Response({"profil": _profil_json(s.save())})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def kanal(request):
    """
    "Telegram kanalimizga qo'shiling" oynasi shu hisobga kerakmi.

    Javob mijozga ISHORA, buyruq emas: oynani ko'rsatish-ko'rsatmaslikni
    mijoz o'zi hal qiladi (odam "Keyinroq" degan bo'lishi mumkin). Server
    faqat bitta savolga javob beradi — bu odam kanalda bormi.

    Tekshiruv Telegram'ga so'rov yuboradi, ya'ni sekin bo'lishi mumkin.
    Shuning uchun u `/me` ichiga QO'SHILMADI: ilova ochilishi butun
    boshli tashqi xizmatga bog'lanib qolmasligi kerak.
    """
    return Response({
        "korsat": K.korsatilsinmi(request.user),
        "kanal": K.kanal_nomi(),
        "havola": K.havola(),
    })


# ------------------------------------------------------------------ duel


def _duel_json(d, ozim: bool = False) -> dict:
    """
    Duel haqidagi ochiq ma'lumot.

    BALL YO'Q va bu ataylab: chaqiruvni ochgan odam raqibning natijasini
    oldindan bilsa, duel "nishonga urish" ga aylanadi — kerakli sonni
    o'tishi bilan to'xtaydi va oxirigacha urinmaydi. Ball faqat o'yin
    tugagach, natija ekranida ko'rinadi.
    """
    return {
        "kod": d.kod,
        "oyin": d.oyin,
        "daraja": d.daraja,
        "holat": d.holat,
        "chaqirgan": D.korinadigan_ism(d.chaqirgan),
        "ozim": ozim,
        "havola": D.havola(d.kod),
        "menTayyor": (d.chaqirgan_tayyor if ozim else d.qabul_tayyor),
        "boshlanishSoniya": D.boshlanishga_qolgan(d),
        **D.raqib_holati(d, chaqirganmi=ozim),
    }


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def duel_boshla(request):
    """
    Yangi chaqiruv boshlaydi: kod, urug' va o'yin qaytadi.

    O'yinni SERVER tanlaydi. Chaqirgan odam o'zi tanlasa, u har doim
    o'zi eng kuchli bo'lgan o'yinni tanlardi va bellashuv hisoblash
    mahoratini emas, tanlash mahoratini o'lchab qolardi.
    """
    profil = _profil_tanla(request)
    if D.bugungi_soni(profil) >= D.KUNLIK_CHEGARA:
        return Response(
            {"detail": "kunlik chegara", "chegara": D.KUNLIK_CHEGARA},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )
    d = D.yangi_duel(profil)
    return Response({**_duel_json(d, ozim=True), "urug": d.urug}, status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def duel_korish(request, kod: str):
    """Chaqiruv haqida: kim chaqirgan, qaysi o'yin, hali ochiqmi."""
    d = Duel.objects.select_related("chaqirgan").filter(kod=kod).first()
    if d is None:
        return Response({"detail": "topilmadi"}, status=404)

    profil = _profil_tanla(request)
    return Response(_duel_json(d, ozim=d.chaqirgan_id == profil.pk))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def duel_qabul(request, kod: str):
    """
    Chaqiruvni qabul qiladi — o'ynash uchun urug' va raqib sanog'i.

    Uch holatda rad etiladi va uchalasi ham foydalanuvchiga tushunarli
    javob bilan: chaqiruv tayyor emas, muddati o'tgan, yoki allaqachon
    o'ynalgan. To'rtinchisi — o'zini o'zi chaqirish: bu xato emas,
    lekin duel bo'lolmaydi.
    """
    d = Duel.objects.select_related("chaqirgan").filter(kod=kod).first()
    if d is None:
        return Response({"detail": "topilmadi"}, status=404)

    profil = _profil_tanla(request)
    if d.chaqirgan_id == profil.pk:
        return Response({"detail": "ozingiz"}, status=409)

    holat = d.holat
    if holat == "boshlanmagan":
        return Response({"detail": "tayyor emas"}, status=409)
    if holat == "tugadi":
        return Response({"detail": "allaqachon oynalgan"}, status=409)
    if holat == "muddati_otdi":
        return Response({"detail": "muddati otdi"}, status=410)

    return Response({
        **_duel_json(d),
        "urug": d.urug,
        # Faqat SANOQ — raqibning chizig'i uchun. Yakuniy ball emas.
        "raqibSanoq": d.chaqirgan_sanoq,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def duel_natija(request, kod: str):
    """
    O'yin natijasini yozadi.

    Bir tomon uchun BIR MARTA: ikkinchi urinish rad etiladi, aks holda
    o'yinchi eng yaxshi natijasi chiqquncha qayta-qayta yuborardi.
    """
    d = Duel.objects.select_related("chaqirgan").filter(kod=kod).first()
    if d is None:
        return Response({"detail": "topilmadi"}, status=404)

    ball = int(request.data.get("ball") or 0)
    xato = int(request.data.get("xato") or 0)
    sanoq = request.data.get("sanoq") or []
    if not D.natija_yaroqlimi(ball, xato, sanoq):
        return Response({"detail": "notogri natija"}, status=400)

    profil = _profil_tanla(request)
    chaqirganmi = d.chaqirgan_id == profil.pk
    jonli = d.jonlimi

    if chaqirganmi and d.chaqirgan_tugatdi:
        return Response({"detail": "allaqachon yozilgan"}, status=409)
    if not chaqirganmi and d.qabul_tugatdi:
        return Response({"detail": "allaqachon oynalgan"}, status=409)
    # Asinxron duelda tartib qat'iy: avval chaqirgan o'ynaydi. Jonli
    # duelda esa ikkalasi bir vaqtda o'ynaydi va kim birinchi tugatishi
    # oldindan ma'lum emas.
    if not chaqirganmi and not jonli and not d.chaqirgan_tugatdi:
        return Response({"detail": "tayyor emas"}, status=409)
    if not chaqirganmi and not jonli and d.muddati_otdimi:
        return Response({"detail": "muddati otdi"}, status=410)
    if not chaqirganmi and d.qabul_id not in (None, profil.pk):
        return Response({"detail": "band"}, status=409)

    d = D.natijani_yoz(d, profil, chaqirganmi, ball, xato, sanoq)

    tugadi = d.chaqirgan_tugatdi and d.qabul_tugatdi
    if tugadi:
        D.natija_xabari(d)

    # Chaqirgan odam ASINXRON duelda birinchi bo'lib tugatdi — unga
    # ulashiladigan havola kerak.
    if chaqirganmi and not jonli and not tugadi:
        return Response({**_duel_json(d, ozim=True), "havola": D.havola(d.kod)})

    return Response({
        "kod": d.kod,
        "holat": d.holat,
        "tugadi": tugadi,
        "golib": d.golib,
        "meniki": d.chaqirgan_ball if chaqirganmi else d.qabul_ball,
        "raqib": d.qabul_ball if chaqirganmi else d.chaqirgan_ball,
        "raqibIsm": D.korinadigan_ism(d.qabul if chaqirganmi else d.chaqirgan),
        "menChaqirdim": chaqirganmi,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def duel_royxat(request):
    """
    O'z duellarim — o'yinlar ekranidagi ro'yxat uchun.

    Faqat oxirgi 20 tasi: bu tarix emas, "nima bo'lyapti" degan savolga
    javob. To'liq tarix boshqaruv panelida.
    """
    profil = _profil_tanla(request)
    qs = (
        Duel.objects
        .select_related("chaqirgan", "qabul")
        .filter(models.Q(chaqirgan=profil) | models.Q(qabul=profil))
        .order_by("-created_at")[:20]
    )
    ro = []
    for d in qs:
        meniki = d.chaqirgan_id == profil.pk
        ro.append({
            "kod": d.kod,
            "oyin": d.oyin,
            "holat": d.holat,
            "menChaqirdim": meniki,
            "raqib": (D.korinadigan_ism(d.qabul) if d.qabul else "")
            if meniki else D.korinadigan_ism(d.chaqirgan),
            "meniki": d.chaqirgan_ball if meniki else d.qabul_ball,
            "raqibBall": d.qabul_ball if meniki else d.chaqirgan_ball,
            "yutdim": (
                d.golib == ("chaqirgan" if meniki else "qabul")
                if d.golib and d.golib != "durang" else None
            ),
            "durang": d.golib == "durang",
            "havola": D.havola(d.kod) if meniki else "",
        })
    return Response({"duellar": ro})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def duel_tayyor(request, kod: str):
    """
    "Men tayyorman". Ikkalasi bosgach o'yin boshlanadi.

    Chaqiruvni ochgan odam uchun bu ayni paytda QO'SHILISH ham: u
    duelga shu yerda biriktiriladi. Alohida "qabul qilish" qadami
    ortiqcha bo'lardi — odam allaqachon "tayyorman" deb aytdi.
    """
    d = Duel.objects.select_related("chaqirgan", "qabul").filter(kod=kod).first()
    if d is None:
        return Response({"detail": "topilmadi"}, status=404)
    if d.chaqirgan_tugatdi and d.qabul_tugatdi:
        return Response({"detail": "allaqachon oynalgan"}, status=409)
    if d.muddati_otdimi:
        return Response({"detail": "muddati otdi"}, status=410)

    profil = _profil_tanla(request)
    chaqirganmi = d.chaqirgan_id == profil.pk

    # Boshqa odam allaqachon qo'shilgan bo'lsa, uchinchisi kira olmaydi.
    if not chaqirganmi and d.qabul_id not in (None, profil.pk):
        return Response({"detail": "band"}, status=409)

    d = D.tayyorlash(d, profil, chaqirganmi)
    return Response(_duel_json(d, ozim=chaqirganmi))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def duel_holat(request, kod: str):
    """
    Jonli holat — har 2 soniyada so'raladi.

    Javob ATAYLAB kichik: bir necha son va ikkita bayroq. Duel
    davomida bu manzil sekundiga bir marta chaqiriladi va og'ir javob
    bir necha o'nlab duelda serverni bo'g'ib qo'yardi.

    So'rovning o'zi belgi ham qo'yadi ("men shu yerdaman") — alohida
    "tirikman" so'rovi kerak emas.
    """
    d = Duel.objects.select_related("chaqirgan", "qabul").filter(kod=kod).first()
    if d is None:
        return Response({"detail": "topilmadi"}, status=404)

    profil = _profil_tanla(request)
    chaqirganmi = d.chaqirgan_id == profil.pk
    if not chaqirganmi and d.qabul_id not in (None, profil.pk):
        return Response({"detail": "band"}, status=409)

    D.belgi_qoy(d, chaqirganmi)
    return Response({
        "holat": d.holat,
        "menTayyor": (d.chaqirgan_tayyor if chaqirganmi else d.qabul_tayyor),
        "boshlanishSoniya": D.boshlanishga_qolgan(d),
        "golib": d.golib,
        "meniki": d.chaqirgan_ball if chaqirganmi else d.qabul_ball,
        **D.raqib_holati(d, chaqirganmi),
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def duel_ball(request, kod: str):
    """
    O'yin paytidagi ballni yuboradi va raqibnikini oladi.

    Yakuniy natija EMAS: bu yerda g'olib aniqlanmaydi va o'yin
    yopilmaydi. Ikkisini bir manzilga qo'shsak, tarmoq kechikkanda
    o'rtadagi ball "yakuniy" bo'lib yozilib qolardi.
    """
    d = Duel.objects.select_related("chaqirgan", "qabul").filter(kod=kod).first()
    if d is None:
        return Response({"detail": "topilmadi"}, status=404)

    ball = int(request.data.get("ball") or 0)
    sanoq = request.data.get("sanoq") or []
    if not D.natija_yaroqlimi(ball, 0, sanoq):
        return Response({"detail": "notogri natija"}, status=400)

    profil = _profil_tanla(request)
    chaqirganmi = d.chaqirgan_id == profil.pk
    if not chaqirganmi and d.qabul_id not in (None, profil.pk):
        return Response({"detail": "band"}, status=409)

    D.jonli_ball(d, chaqirganmi, ball, sanoq)
    d.refresh_from_db()
    return Response({
        "holat": d.holat,
        **D.raqib_holati(d, chaqirganmi),
    })
