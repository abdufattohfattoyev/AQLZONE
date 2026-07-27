"""
Boshqaruv paneli — /boshqaruv.

Nima uchun alohida sahifa, React ilova ichida emas: bu ekran BOLAGA
tegishli emas. Ilova ichida bo'lsa, uning kodi har bir foydalanuvchining
brauzeriga yuklanardi va manzilni topgan har kim uni ochishga urinardi.
Server tomonda chizilgan sahifa esa parolsiz umuman javob bermaydi.

Nima uchun Django admin emas: loyihada `django.contrib.auth` ham,
`admin` ham o'rnatilmagan (settings.py ga qarang). Ularni qo'shish yangi
jadvallar, migratsiyalar va foydalanuvchi boshqaruvini olib keladi —
bitta odam ochadigan hisobot sahifasi uchun juda katta narx. Bu yerda
esa bitta parol yetarli.

Kirishning ikki yo'li bor va ikkalasi ham bir xil belgiga olib keladi:

  Telegram — admin botga /boshqaruv yozadi, bot havola yuboradi.
             Telegram id `ADMIN_TG` ro'yxatida bo'lishi shart.
  Parol    — `ADMIN_PAROL` bilan. Bot ishlamay qolgan holat uchun zaxira.

Ikkalasi ham sozlanmagan bo'lsa sahifa BUTUNLAY o'chiq (404) — ya'ni
sozlashni unutgan server ochiq qolib ketmaydi. Bu ataylab shunday:
xavfsizlikning standart holati "yopiq" bo'lishi kerak.
"""
from __future__ import annotations

import hmac
import json
from datetime import timedelta

from django.conf import settings
from django.core import signing
from django.db.models import Avg, Count, F, Max, Q, Sum
from django.http import Http404, HttpResponseRedirect
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect

from .models import Identity, LessonResult, Profile, Progress, Pupil, Session

#: Kirish belgisi shu nom bilan cookie'da saqlanadi.
COOKIE = "az_boshqaruv"

#: Kirish qancha amal qiladi (sekund). Bir ish kunidan biroz uzun.
MUDDAT = 12 * 3600

#: Cookie imzosining maqsadi. `SECRET_KEY` bilan birga ishlatiladi, ya'ni
#: boshqa maqsadda yasalgan imzo bu yerda o'tmaydi.
TUZ = "aqlzone.boshqaruv"

#: Botdagi havolaning imzo maqsadi va amal qilish muddati (sekund).
#:
#: Qisqa: havola shaxsiy suhbatda yotib qoladi va uzoq amal qilsa,
#: telefoni ochiq qolgan odamning hisoboti begonaga ochilardi.
HAVOLA_TUZ = "aqlzone.boshqaruv.havola"
HAVOLA_MUDDAT = 10 * 60

#: "Hozir onlayn" deb hisoblanadigan oraliq (daqiqa).
#:
#: `Session.last_seen` har so'rovda emas, ma'lum oraliqda yangilanadi
#: (`auth.BearerTokenAuthentication`). Shuning uchun bu qiymat o'sha
#: oraliqdan sezilarli KATTA bo'lishi kerak, aks holda ayni paytda
#: o'ynayotgan bola ham "onlayn emas" bo'lib ko'rinardi.
ONLAYN_DAQIQA = 15


def _parol() -> str:
    return getattr(settings, "ADMIN_PAROL", "") or ""


def _yoniq() -> bool:
    return bool(getattr(settings, "BOSHQARUV_YONIQ", False))


def admin_tg_mi(tg_id: str) -> bool:
    """Shu Telegram id administratorniki-mi (`ADMIN_TG` ro'yxatida bormi)."""
    return str(tg_id) in {str(x) for x in getattr(settings, "ADMIN_TG", [])}


def havola_yasa(tg_id: str) -> str:
    """
    Botga yuboriladigan kirish havolasi.

    Kodda hech qanday sir yo'q — u `SECRET_KEY` bilan IMZOLANGAN qiymat.
    Ya'ni bazada saqlash kerak emas: server imzoni tekshiradi va vaqti
    o'tganini `max_age` o'zi rad etadi.

    Kod bir martalik QILINMADI. Sabab `kod_bilan_kir` dagi bilan bir xil:
    havolani bir marta ochish deyarli hech qachon bitta so'rov bilan
    tugamaydi — Telegram havolani oldindan yuklaydi, odam uni boshqa
    brauzerda ochishi mumkin. Bir martalik bo'lsa, havola admin bosishidan
    OLDIN ishlatilib bo'lingan bo'lardi. Cheklov o'rniga qisqa muddat.
    """
    kod = signing.dumps({"tg": str(tg_id)}, salt=HAVOLA_TUZ)
    asos = (getattr(settings, "SAYT_URL", "") or "").rstrip("/")
    return f"{asos}/boshqaruv/havola/{kod}"


def _belgini_ber(javob):
    """Kirganlik belgisini cookie'ga yozadi. Ikkala kirish yo'li ham shu yerda tugaydi."""
    javob.set_cookie(
        COOKIE,
        signing.dumps({"ok": True}, salt=TUZ),
        max_age=MUDDAT,
        httponly=True,                       # JS o'qiy olmaydi
        secure=not settings.DEBUG,           # faqat HTTPS orqali
        samesite="Lax",
    )
    return javob


def kirganmi(request) -> bool:
    xom = request.COOKIES.get(COOKIE, "")
    if not xom:
        return False
    try:
        signing.loads(xom, salt=TUZ, max_age=MUDDAT)
        return True
    except signing.BadSignature:
        return False


def havola(request, kod: str):
    """Botdagi havola. Imzo to'g'ri va muddati o'tmagan bo'lsa — ichkariga."""
    if not _yoniq():
        raise Http404
    try:
        ma = signing.loads(kod, salt=HAVOLA_TUZ, max_age=HAVOLA_MUDDAT)
    except signing.BadSignature:
        return render(request, "boshqaruv/kirish.html", {
            "xato": "Havola eskirgan. Botga /boshqaruv yozib yangisini oling.",
        }, status=401)

    # Imzo o'zi yetarli emas: ro'yxatdan chiqarilgan admin eski havolasi
    # bilan qaytib kira olmasligi kerak.
    if not admin_tg_mi(ma.get("tg", "")):
        raise Http404

    return _belgini_ber(HttpResponseRedirect("/boshqaruv"))


@csrf_protect
def kirish(request):
    """Parol so'raydigan sahifa."""
    if not _yoniq():
        raise Http404

    xato = ""
    if request.method == "POST":
        berilgan = request.POST.get("parol", "")
        # `compare_digest` — parolni belgima-belgi solishtirishda ketadigan
        # vaqt farqidan ma'lumot sizib chiqmasin. Parol sozlanmagan bo'lsa
        # bu yo'l butunlay yopiq: bo'sh parol hech qachon to'g'ri emas.
        if _parol() and hmac.compare_digest(berilgan, _parol()):
            return _belgini_ber(HttpResponseRedirect("/boshqaruv"))
        xato = "Parol noto'g'ri"

    return render(request, "boshqaruv/kirish.html", {
        "xato": xato,
        "parol_bormi": bool(_parol()),
        "tg_bormi": bool(getattr(settings, "ADMIN_TG", [])),
        "bot": getattr(settings, "BOT_USERNAME", ""),
    }, status=401 if xato else 200)


def chiqish(request):
    javob = HttpResponseRedirect("/boshqaruv")
    javob.delete_cookie(COOKIE)
    return javob


def panel(request):
    if not _yoniq():
        raise Http404
    if not kirganmi(request):
        return kirish(request)
    kun = max(7, min(120, int(request.GET.get("kun") or 30)))
    return render(request, "boshqaruv/panel.html", statistika(kun))


# ------------------------------------------------------------ hisob-kitob


def _kun_kaliti(dt):
    """UTC'dagi vaqtni MAHALLIY kunga aylantiradi (Asia/Tashkent)."""
    return timezone.localtime(dt).date()


def sinf_nomi(grade) -> str:
    """0 — sinf emas, maktabgacha kurs. "0-sinf" degan narsa yo'q."""
    if grade is None:
        return "—"
    return "Maktabgacha" if grade == 0 else f"{grade}-sinf"


def statistika(kunlar: int = 30) -> dict:
    hozir = timezone.now()
    bugun = timezone.localtime(hozir).date()
    oraliq = hozir - timedelta(days=kunlar)

    # --- umumiy sonlar ---
    hisoblar = Pupil.objects.count()
    royxatdan = Pupil.objects.filter(registered_at__isnull=False).count()
    telegramli = Identity.objects.filter(provider=Identity.TELEGRAM).values("pupil").distinct().count()
    qurilmali = Identity.objects.filter(provider=Identity.QURILMA).values("pupil").distinct().count()

    natijalar = LessonResult.objects.aggregate(
        darslar=Count("id"),
        savollar=Sum("asked"),
        togri=Sum("correct"),
        yulduz=Sum("stars"),
        vaqt=Sum("duration_ms"),
    )
    savollar = natijalar["savollar"] or 0
    togri = natijalar["togri"] or 0

    # --- faollik ---
    onlayn_vaqt = hozir - timedelta(minutes=ONLAYN_DAQIQA)
    onlayn = Session.objects.filter(last_seen__gte=onlayn_vaqt).values("pupil").distinct().count()

    def faol(kun: int) -> int:
        """Shu oraliqda kamida bitta dars tugatgan HISOBLAR soni."""
        return (
            LessonResult.objects
            .filter(created_at__gte=hozir - timedelta(days=kun))
            .values("profile__pupil").distinct().count()
        )

    # --- ro'yxatdan o'tish voronkasi ---
    #
    # Eng qimmatli ko'rsatkich shu: odamlar qaysi qadamda to'xtayapti.
    # Har qadam oldingisining ICHIDA turadi, shuning uchun foizlar
    # birinchi qadamdan hisoblanadi.
    darsli = LessonResult.objects.values("profile__pupil").distinct().count()

    # "Qaytgan" — kamida IKKI XIL kunda dars tugatgan. Bir kun o'ynab
    # ketganlar bilan qaytib kelganlar orasidagi farq bu yerdagi eng
    # muhim raqam: ilova ushlab qola oldimi yoki yo'q.
    kunlar_boyicha: dict[int, set] = {}
    for pk, sana in LessonResult.objects.values_list("profile__pupil", "created_at"):
        kunlar_boyicha.setdefault(pk, set()).add(_kun_kaliti(sana))
    qaytgan = sum(1 for k in kunlar_boyicha.values() if len(k) >= 2)

    voronka = [
        {"nom": "Hisob ochgan", "son": hisoblar},
        {"nom": "Ism kiritgan (ro'yxatdan o'tgan)", "son": royxatdan},
        {"nom": "Telegram bog'lagan", "son": telegramli},
        {"nom": "Kamida 1 dars tugatgan", "son": darsli},
        {"nom": "Boshqa kuni qaytib kelgan", "son": qaytgan},
    ]
    asos = hisoblar or 1
    for q in voronka:
        q["foiz"] = round(q["son"] * 100 / asos)

    # --- kunlik grafik ---
    yangi_kun: dict = {}
    for sana in Pupil.objects.filter(created_at__gte=oraliq).values_list("created_at", flat=True):
        k = _kun_kaliti(sana)
        yangi_kun[k] = yangi_kun.get(k, 0) + 1

    dars_kun: dict = {}
    faol_kun: dict = {}
    for pk, sana in LessonResult.objects.filter(created_at__gte=oraliq).values_list("profile__pupil", "created_at"):
        k = _kun_kaliti(sana)
        dars_kun[k] = dars_kun.get(k, 0) + 1
        faol_kun.setdefault(k, set()).add(pk)

    qator = []
    for i in range(kunlar - 1, -1, -1):
        k = bugun - timedelta(days=i)
        qator.append({
            "sana": k,
            "kun": k.strftime("%d.%m"),
            "yangi": yangi_kun.get(k, 0),
            "darslar": dars_kun.get(k, 0),
            "faol": len(faol_kun.get(k, ())),
        })
    eng_katta = max([q["darslar"] for q in qator] + [1])
    for q in qator:
        q["balandlik"] = round(q["darslar"] * 100 / eng_katta)

    # --- sinflar bo'yicha ---
    sinflar = list(
        LessonResult.objects.values("grade")
        .annotate(
            darslar=Count("id"),
            savollar=Sum("asked"),
            togri=Sum("correct"),
            bolalar=Count("profile", distinct=True),
            yulduz=Sum("stars"),
        )
        .order_by("grade")
    )
    for s in sinflar:
        s["aniqlik"] = round((s["togri"] or 0) * 100 / (s["savollar"] or 1))
        s["nom"] = sinf_nomi(s["grade"])

    # --- darslar: eng ko'p o'ynalgani va eng qiyini ---
    darslar = list(
        LessonResult.objects.values("grade", "unit", "lesson", "lesson_name")
        .annotate(
            urinish=Count("id"),
            savollar=Sum("asked"),
            togri=Sum("correct"),
            xato=Sum("mistakes"),
        )
    )
    for d in darslar:
        d["aniqlik"] = round((d["togri"] or 0) * 100 / (d["savollar"] or 1))
        d["joy"] = f"{sinf_nomi(d['grade'])} · {d['unit'] + 1}-bob · {d['lesson'] + 1}-dars"

    mashhur = sorted(darslar, key=lambda d: -d["urinish"])[:10]
    # Qiyinlik faqat YETARLI ma'lumot bo'lganda ma'noli: bitta savolda
    # xato qilingan dars "eng qiyin" bo'lib chiqib qolmasin.
    qiyin = sorted(
        [d for d in darslar if (d["savollar"] or 0) >= 5],
        key=lambda d: d["aniqlik"],
    )[:10]

    # --- foydalanuvchilar ---
    #
    # Bitta so'rovda yig'iladi (`annotate`), aks holda har bir hisob uchun
    # alohida so'rov ketardi va ro'yxat o'sishi bilan sahifa sekinlashardi.
    xom = (
        Pupil.objects.annotate(
            profil_soni=Count("profiles", distinct=True),
            oxirgi_kirish=Max("sessions__last_seen"),
            platforma=Max("sessions__platform"),
        )
        .order_by(F("oxirgi_kirish").desc(nulls_last=True))[:200]
    )
    pupil_ids = [p.pk for p in xom]

    yulduzlar = dict(
        Progress.objects.filter(profile__pupil_id__in=pupil_ids)
        .values_list("profile__pupil")
        .annotate(s=Sum("stars"))
        .values_list("profile__pupil", "s")
    )
    dars_soni = dict(
        LessonResult.objects.filter(profile__pupil_id__in=pupil_ids)
        .values_list("profile__pupil")
        .annotate(n=Count("id"))
        .values_list("profile__pupil", "n")
    )
    oxirgi_dars = dict(
        LessonResult.objects.filter(profile__pupil_id__in=pupil_ids)
        .values_list("profile__pupil")
        .annotate(v=Max("created_at"))
        .values_list("profile__pupil", "v")
    )
    eng_uzoq = dict(
        LessonResult.objects.filter(profile__pupil_id__in=pupil_ids)
        .values_list("profile__pupil")
        .annotate(g=Max("grade"))
        .values_list("profile__pupil", "g")
    )
    usullar: dict = {}
    for pid, prov in Identity.objects.filter(pupil_id__in=pupil_ids).values_list("pupil_id", "provider"):
        usullar.setdefault(pid, []).append(prov)

    foydalanuvchilar = []
    for p in xom:
        oxirgi = p.oxirgi_kirish
        foydalanuvchilar.append({
            "id": p.pk,
            "ism": p.toliq_ism or "—",
            "username": p.username,
            "telefon": p.telefon,
            "royxatdan": p.registered_at is not None,
            "usullar": usullar.get(p.pk, []),
            "profillar": p.profil_soni,
            "yulduz": yulduzlar.get(p.pk, 0) or 0,
            "darslar": dars_soni.get(p.pk, 0),
            "sinf": sinf_nomi(eng_uzoq.get(p.pk)),
            "platforma": p.platforma or "—",
            "qoshilgan": p.created_at,
            "oxirgi": oxirgi,
            "oxirgi_dars": oxirgi_dars.get(p.pk),
            "onlayn": bool(oxirgi and oxirgi >= onlayn_vaqt),
        })

    # --- so'nggi harakatlar ---
    oqim = list(
        LessonResult.objects.select_related("profile", "profile__pupil")
        .order_by("-created_at")[:40]
    )

    # --- platformalar ---
    platformalar = list(
        Session.objects.values("platform").annotate(n=Count("token_hash")).order_by("-n")
    )

    return {
        "yangilangan": timezone.localtime(hozir),
        "kunlar": kunlar,
        "umumiy": {
            "hisoblar": hisoblar,
            "royxatdan": royxatdan,
            "royxat_foiz": round(royxatdan * 100 / asos),
            "profillar": Profile.objects.count(),
            "telegramli": telegramli,
            "qurilmali": qurilmali,
            "darslar": natijalar["darslar"] or 0,
            "savollar": savollar,
            "yulduz": natijalar["yulduz"] or 0,
            "aniqlik": round(togri * 100 / (savollar or 1)),
            "soat": round((natijalar["vaqt"] or 0) / 3_600_000, 1),
        },
        "faollik": {
            "onlayn": onlayn,
            "bugun": faol(1),
            "hafta": faol(7),
            "oy": faol(30),
        },
        "voronka": voronka,
        "qator": qator,
        "sinflar": sinflar,
        "mashhur": mashhur,
        "qiyin": qiyin,
        "foydalanuvchilar": foydalanuvchilar,
        "oqim": oqim,
        "platformalar": platformalar,
        "onlayn_daqiqa": ONLAYN_DAQIQA,
    }
