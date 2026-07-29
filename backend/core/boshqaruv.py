"""
Boshqaruv paneli — /boshqaruv.

Nima uchun alohida sahifa, React ilova ichida emas: bu ekran BOLAGA
tegishli emas. Ilova ichida bo'lsa, uning kodi har bir foydalanuvchining
brauzeriga yuklanardi va manzilni topgan har kim uni ochishga urinardi.
Server tomonda chizilgan sahifa esa belgisiz umuman javob bermaydi.

Nima uchun Django admin emas: loyihada `django.contrib.auth` ham,
`admin` ham o'rnatilmagan (settings.py ga qarang). Ularni qo'shish yangi
jadvallar, migratsiyalar va foydalanuvchi boshqaruvini olib keladi —
bitta odam ochadigan hisobot sahifasi uchun juda katta narx.

Kirishning YAGONA yo'li — Telegram: admin botga /boshqaruv yozadi, bot
qisqa muddatli havola yuboradi. Telegram id `ADMIN_TG` ro'yxatida
bo'lishi shart.

Parol yo'li ATAYLAB yo'q. U zaxira sifatida turgan edi va aynan shu
sababdan xavfli: o'zgarmaydigan sir bir marta sizib chiqsa (jurnal,
skrinshot, boshqa kompyuterdagi .env nusxasi) butun foydalanuvchilar
ro'yxati ochiq qoladi va buni hech kim sezmaydi. Telegram havolasi esa
10 daqiqadan keyin o'z-o'zidan kuchini yo'qotadi, va admin ro'yxatidan
chiqarilgan odam eski havola bilan qaytib kira olmaydi.

`ADMIN_TG` sozlanmagan bo'lsa sahifa BUTUNLAY o'chiq (404) — ya'ni
sozlashni unutgan server ochiq qolib ketmaydi. Bu ataylab shunday:
xavfsizlikning standart holati "yopiq" bo'lishi kerak.
"""
from __future__ import annotations

import json
from datetime import timedelta
from urllib.parse import quote

from django.conf import settings
from django.core import signing
from django.db.models import Count, F, Max, Q, Sum
from django.http import Http404, HttpResponseRedirect
from django.shortcuts import render
from django.utils import timezone

from . import reklama as R
from .models import (
    Identity, LessonResult, Profile, Progress, Pupil, Reklama, Session,
)

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

#: Panel FAQAT ro'yxatdan o'tganlarni sanaydi.
#:
#: Ilovaga kirishning yagona yo'li — Telegram va ism-familiya
#: (`frontend/src/components/Tanishuv.tsx`). Lekin hisob qatori undan
#: OLDINROQ yaratiladi: brauzer birinchi so'rovdayoq qurilma tokenini
#: oladi, ya'ni sahifani ochib darhol yopgan har bir odam bazada bitta
#: bo'sh `Pupil` bo'lib qoladi.
#:
#: Bunday qatorlar hisobotni buzadi: "1200 hisob" degan raqamning
#: ko'pchiligi ilovani ko'rmagan ham. Shuning uchun panelning HAMMA
#: qismida shu filtr turadi — kartalar, jadvallar, grafik, oqim.
#: Ro'yxatsizlar faqat bitta joyda ko'rinadi: voronkaning birinchi
#: qadamida, "qanchasi yarim yo'lda to'xtadi" degan savol uchun.
ROYXAT = Q(registered_at__isnull=False)

#: O'sha filtrning `LessonResult`/`Progress` tomonidan ko'rinishi.
DARS_ROYXAT = Q(profile__pupil__registered_at__isnull=False)


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


def _belgini_ber(javob, tg_id: str = ""):
    """
    Kirganlik belgisini cookie'ga yozadi. Ikkala kirish yo'li ham shu
    yerda tugaydi.

    Telegram id ham yoziladi: e'lonni "avval o'zimga yuborish" uchun
    adminning manzili kerak. U imzolangan cookie ichida — ya'ni brauzer
    tomonidan o'zgartirib bo'lmaydi va begona manzil qo'yib bo'lmaydi.
    """
    javob.set_cookie(
        COOKIE,
        signing.dumps({"ok": True, "tg": str(tg_id)}, salt=TUZ),
        max_age=MUDDAT,
        httponly=True,                       # JS o'qiy olmaydi
        secure=not settings.DEBUG,           # faqat HTTPS orqali
        samesite="Lax",
    )
    return javob


def _belgi(request) -> dict | None:
    xom = request.COOKIES.get(COOKIE, "")
    if not xom:
        return None
    try:
        return signing.loads(xom, salt=TUZ, max_age=MUDDAT)
    except signing.BadSignature:
        return None


def kirganmi(request) -> bool:
    return _belgi(request) is not None


def kim(request) -> str:
    """
    Panelga kirgan adminning Telegram id'si.

    Bo'sh bo'lishi MUMKIN: eski cookie'da bu maydon yo'q edi va uni
    majburiy qilsak, kirib turgan admin sababsiz tashqariga chiqib
    qolardi. Bo'sh bo'lganda faqat "o'zimga yuborish" ishlamaydi va
    panel qaytadan kirishni taklif qiladi.
    """
    return str((_belgi(request) or {}).get("tg", ""))


def havola(request, kod: str):
    """Botdagi havola. Imzo to'g'ri va muddati o'tmagan bo'lsa — ichkariga."""
    if not _yoniq():
        raise Http404
    try:
        ma = signing.loads(kod, salt=HAVOLA_TUZ, max_age=HAVOLA_MUDDAT)
    except signing.BadSignature:
        return kirish(request, "Havola eskirgan. Botga /boshqaruv yozib yangisini oling.")

    # Imzo o'zi yetarli emas: ro'yxatdan chiqarilgan admin eski havolasi
    # bilan qaytib kira olmasligi kerak.
    if not admin_tg_mi(ma.get("tg", "")):
        raise Http404

    return _belgini_ber(HttpResponseRedirect("/boshqaruv"), ma.get("tg", ""))


def kirish(request, xato: str = ""):
    """
    "Botga /boshqaruv yozing" degan sahifa.

    Bu yerda kiritadigan hech narsa YO'Q — forma ham, maydon ham. Sahifa
    faqat yo'lni ko'rsatadi, kirish esa botdagi havola orqali bo'ladi.
    """
    if not _yoniq():
        raise Http404
    return render(request, "boshqaruv/kirish.html", {
        "xato": xato,
        "bot": getattr(settings, "BOT_USERNAME", ""),
    }, status=401 if xato else 200)


def eski_kirish(request):
    """Parol formasi turgan eski manzil — endi shunchaki panelga yo'naltiradi."""
    return HttpResponseRedirect("/boshqaruv")


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


# -------------------------------------------------------------- e'lonlar


#: Ro'yxatda ko'rsatiladigan oxirgi e'lonlar soni.
REKLAMA_ROYXAT = 20


def reklama(request):
    """
    E'lon sahifasi: yozish, o'zimga sinab ko'rish, hammaga yuborish.

    Hamma amal POST orqali va oxirida QAYTA YO'NALTIRISH bilan tugaydi
    (PRG). Aks holda sahifani yangilagan admin e'lonni ikkinchi marta
    yuborib yuborardi — orqaga qaytarib bo'lmaydigan xato.

    CSRF haqida. Loyihada `CsrfViewMiddleware` yo'q (API Bearer token
    bilan ishlaydi), ya'ni `{% csrf_token %}` bu yerda TEKSHIRILMAYDI.
    Himoyani cookie'ning o'zi beradi: `az_boshqaruv` `SameSite=Lax` bilan
    qo'yilgan, shuning uchun begona saytdan yuborilgan POST so'roviga u
    UMUMAN qo'shilmaydi va so'rov kirmagan odamniki bo'lib qoladi.
    Shablondagi belgi kelajak uchun turibdi: middleware qo'shilsa,
    formalar o'zgarishsiz ishlayveradi.
    """
    if not _yoniq():
        raise Http404
    if not kirganmi(request):
        return kirish(request)

    if request.method == "POST":
        return _reklama_amal(request)

    xabar = request.GET.get("xabar", "")[:200]
    return render(request, "boshqaruv/reklama.html", {
        "royxat": Reklama.objects.order_by("-created_at")[:REKLAMA_ROYXAT],
        "qancha": R.qancha_odam(),
        "bloklagan": Pupil.objects.filter(bot_bloklandi_at__isnull=False).count(),
        "standart_havola": R.havola(),
        "menda_tg": bool(kim(request)),
        "xabar": xabar,
        "yangilangan": timezone.now(),
    })


def _reklama_amal(request):
    """POST amallari: yasash, sinov, yuborish, to'xtatish, davom ettirish."""
    amal = request.POST.get("amal", "")

    if amal == "yasa":
        matn = (request.POST.get("matn") or "").strip()
        if not matn:
            return _reklama_javob("Matn bo'sh — e'lon yasalmadi")
        r = Reklama.objects.create(
            matn=matn[:R.MAX_MATN],
            # Belgilanmagan checkbox POST'da UMUMAN kelmaydi, shuning
            # uchun "yo'q" degani — kalitning yo'qligi.
            tugma=bool(request.POST.get("tugma")),
            tugma_matni=(request.POST.get("tugma_matni") or "Aql Zone'ni ochish")[:64],
            havola=(request.POST.get("havola") or "").strip()[:300],
            kim=kim(request),
        )
        return _reklama_javob(f"E'lon #{r.pk} yasaldi. Avval o'zingizga yuborib ko'ring.")

    # Raqam bo'lmagan `id` — buzuq so'rov. `filter(pk="abc")` ValueError
    # bilan yiqilardi, ya'ni 500 sahifasi chiqardi.
    try:
        elon_id = int(request.POST.get("id") or 0)
    except ValueError:
        elon_id = 0

    r = Reklama.objects.filter(pk=elon_id).first()
    if r is None:
        return _reklama_javob("E'lon topilmadi")

    if amal == "sinov":
        tg = kim(request)
        if not tg:
            return _reklama_javob(
                "Telegram id topilmadi — chiqib, botdagi havola orqali qaytadan kiring"
            )
        ok, izoh = R.sinov_yubor(r, tg)
        return _reklama_javob(
            "Sinov nusxasi Telegram'ga yuborildi" if ok else f"Yuborilmadi: {izoh}"
        )

    if amal == "ochir":
        # Ketayotgan e'lonni o'chirib bo'lmaydi: qabullar bilan birga
        # o'chsa, qayta yuborilganda odamlarga IKKINCHI marta borardi.
        if r.holat == "ketyapti":
            return _reklama_javob("Avval to'xtating, keyin o'chiring")
        r.delete()
        return _reklama_javob("E'lon o'chirildi")

    if amal == "toxtat":
        Reklama.objects.filter(pk=r.pk, holat="ketyapti").update(holat="toxtatildi")
        return _reklama_javob("To'xtatildi. Davom ettirsangiz qolganidan boshlanadi.")

    if amal in ("yubor", "davom"):
        if r.holat == "tugadi":
            return _reklama_javob("Bu e'lon allaqachon yuborilgan")
        if r.holat == "ketyapti":
            return _reklama_javob("E'lon hozir yuborilyapti")
        R.fonda_yubor(r.pk)
        return _reklama_javob("Yuborish boshlandi — sahifani yangilab turing")

    return _reklama_javob("Noma'lum amal")


def _reklama_javob(xabar: str):
    """POST → yo'naltirish. Sahifani yangilash amalni takrorlamasin."""
    return HttpResponseRedirect(f"/boshqaruv/reklama?xabar={quote(xabar)}")


# ------------------------------------------------------------ hisob-kitob


def _kun_kaliti(dt):
    """UTC'dagi vaqtni MAHALLIY kunga aylantiradi (Asia/Tashkent)."""
    return timezone.localtime(dt).date()


def sinf_nomi(grade) -> str:
    """0 — sinf emas, maktabgacha kurs. "0-sinf" degan narsa yo'q."""
    if grade is None:
        return "—"
    return "Maktabgacha" if grade == 0 else f"{grade}-sinf"


def _foiz(qism: int, butun: int) -> int:
    return round(qism * 100 / butun) if butun else 0


def _ozgarish(hozirgi: int, oldingi: int) -> int | None:
    """
    Ikki davr orasidagi farq, foizda.

    `None` — solishtirish MA'NOSIZ bo'lgan holat: oldingi davrda umuman
    harakat bo'lmagan. "0 dan 5 ga o'sish necha foiz" degan savolning
    javobi yo'q, va o'rniga "+500%" yozib qo'yish yolg'on bo'lardi.
    """
    if not oldingi:
        return None
    return round((hozirgi - oldingi) * 100 / oldingi)


def _chiziq(qiymatlar: list[int], eng_katta: int) -> str:
    """
    SVG `polyline` uchun nuqtalar.

    Koordinatalar 0…1000 × 0…100 oralig'ida beriladi, SVG esa
    `preserveAspectRatio="none"` bilan cho'ziladi. Ya'ni grafik qanday
    kenglikda turishidan qat'i nazar bir xil chiqadi va shablonda
    arifmetika qolmaydi — u yerda hisob-kitob qilib bo'lmaydi ham.
    """
    if not qiymatlar:
        return ""
    if len(qiymatlar) == 1:
        qiymatlar = qiymatlar * 2
    qadam = 1000 / (len(qiymatlar) - 1)
    return " ".join(
        f"{round(i * qadam, 1)},{round(100 - v * 100 / (eng_katta or 1), 1)}"
        for i, v in enumerate(qiymatlar)
    )


def statistika(kunlar: int = 30) -> dict:
    hozir = timezone.now()
    bugun = timezone.localtime(hozir).date()
    oraliq = hozir - timedelta(days=kunlar)

    # Butun panel shu ikki so'rovdan o'sadi. Ikkalasi ham ro'yxatdan
    # o'tmagan hisoblarni CHETLAB o'tadi — sabab `ROYXAT` izohida.
    hisoblar_qs = Pupil.objects.filter(ROYXAT)
    darslar_qs = LessonResult.objects.filter(DARS_ROYXAT)

    # --- umumiy sonlar ---
    royxatdan = hisoblar_qs.count()
    jami_hisob = Pupil.objects.count()          # faqat voronka uchun
    telegramli = (
        Identity.objects
        .filter(provider=Identity.TELEGRAM, pupil__registered_at__isnull=False)
        .values("pupil").distinct().count()
    )
    telefonli = (
        Identity.objects
        .filter(provider=Identity.TELEFON, pupil__registered_at__isnull=False)
        .values("pupil").distinct().count()
    )

    natijalar = darslar_qs.aggregate(
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
    onlayn = (
        Session.objects
        .filter(last_seen__gte=onlayn_vaqt, pupil__registered_at__isnull=False)
        .values("pupil").distinct().count()
    )

    def faol(kun: int) -> int:
        """Shu oraliqda kamida bitta dars tugatgan HISOBLAR soni."""
        return (
            darslar_qs.filter(created_at__gte=hozir - timedelta(days=kun))
            .values("profile__pupil").distinct().count()
        )

    bugun_faol, hafta_faol, oy_faol = faol(1), faol(7), faol(30)

    # --- o'sish: shu hafta va o'tgan hafta ---
    #
    # Yalpi son o'sib borgani bilan hech narsa demaydi — u hech qachon
    # kamaymaydi. Ma'noli savol bitta: shu hafta o'tgan haftadan yaxshimi.
    hafta = hozir - timedelta(days=7)
    old_hafta = hozir - timedelta(days=14)
    yangi_hafta = hisoblar_qs.filter(registered_at__gte=hafta).count()
    yangi_old = hisoblar_qs.filter(
        registered_at__gte=old_hafta, registered_at__lt=hafta
    ).count()
    dars_hafta = darslar_qs.filter(created_at__gte=hafta).count()
    dars_old = darslar_qs.filter(created_at__gte=old_hafta, created_at__lt=hafta).count()

    osish = {
        "yangi": yangi_hafta,
        "yangi_ozgarish": _ozgarish(yangi_hafta, yangi_old),
        "darslar": dars_hafta,
        "dars_ozgarish": _ozgarish(dars_hafta, dars_old),
    }

    # --- ro'yxatdan o'tish voronkasi ---
    #
    # Eng qimmatli ko'rsatkich shu: odamlar qaysi qadamda to'xtayapti.
    # Har qadam oldingisining ICHIDA turadi.
    darsli = darslar_qs.values("profile__pupil").distinct().count()

    # "Qaytgan" — kamida IKKI XIL kunda dars tugatgan. Bir kun o'ynab
    # ketganlar bilan qaytib kelganlar orasidagi farq bu yerdagi eng
    # muhim raqam: ilova ushlab qola oldimi yoki yo'q.
    kunlar_boyicha: dict[int, set] = {}
    soatlar = [0] * 24
    for pk, sana in darslar_qs.values_list("profile__pupil", "created_at"):
        mahalliy = timezone.localtime(sana)
        kunlar_boyicha.setdefault(pk, set()).add(mahalliy.date())
        soatlar[mahalliy.hour] += 1
    qaytgan = sum(1 for k in kunlar_boyicha.values() if len(k) >= 2)
    sodiq = sum(1 for k in kunlar_boyicha.values() if len(k) >= 5)

    voronka = [
        {"nom": "Ilovani ochgan", "son": jami_hisob,
         "izoh": "brauzer hisob ochdi — ko'pi shu yerda to'xtaydi"},
        {"nom": "Ro'yxatdan o'tgan", "son": royxatdan,
         "izoh": "Telegram va ism-familiya"},
        {"nom": "Kamida 1 dars tugatgan", "son": darsli, "izoh": ""},
        {"nom": "Boshqa kuni qaytgan", "son": qaytgan, "izoh": "2+ xil kunda o'ynagan"},
        {"nom": "Odat bo'lgan", "son": sodiq, "izoh": "5+ xil kunda o'ynagan"},
    ]
    for q in voronka:
        q["foiz"] = _foiz(q["son"], jami_hisob)
        # Ikkinchi o'lchov: ro'yxatdan o'tganlarga NISBATAN. Birinchi
        # qadam juda katta bo'lgani uchun qolganlari yonida ko'rinmay
        # qoladi, holbuki asosiy ish o'sha pastki qadamlarda.
        q["ulush"] = _foiz(q["son"], royxatdan)

    # --- kunlik grafik ---
    yangi_kun: dict = {}
    for sana in hisoblar_qs.filter(registered_at__gte=oraliq).values_list("registered_at", flat=True):
        k = _kun_kaliti(sana)
        yangi_kun[k] = yangi_kun.get(k, 0) + 1

    dars_kun: dict = {}
    faol_kun: dict = {}
    for pk, sana in darslar_qs.filter(created_at__gte=oraliq).values_list("profile__pupil", "created_at"):
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
    eng_faol = max([q["faol"] for q in qator] + [1])
    for q in qator:
        q["balandlik"] = round(q["darslar"] * 100 / eng_katta)

    grafik = {
        "qator": qator,
        "eng_katta": eng_katta,
        "eng_faol": eng_faol,
        # Faol bolalar chizig'i — ustunlar ustidan o'tadigan ikkinchi qatlam.
        "chiziq": _chiziq([q["faol"] for q in qator], eng_faol),
        # Sana o'qida hamma kun sig'maydi: boshi, o'rtasi, oxiri yetarli.
        "belgilar": [qator[0]["kun"], qator[len(qator) // 2]["kun"], qator[-1]["kun"]] if qator else [],
    }

    # --- kun davomida qaysi soatda o'ynaydi ---
    #
    # Eslatma yuborish vaqtini shu jadval hal qiladi: bola o'ynamaydigan
    # soatda kelgan xabar shunchaki o'qilmay yopiladi.
    soat_eng = max(soatlar + [1])
    soat_qator = [
        {"soat": s, "son": n, "balandlik": round(n * 100 / soat_eng)}
        for s, n in enumerate(soatlar)
    ]

    # --- sinflar bo'yicha ---
    sinflar = list(
        darslar_qs.values("grade")
        .annotate(
            darslar=Count("id"),
            savollar=Sum("asked"),
            togri=Sum("correct"),
            bolalar=Count("profile", distinct=True),
            yulduz=Sum("stars"),
        )
        .order_by("grade")
    )
    sinf_eng = max([s["darslar"] for s in sinflar] + [1])
    for s in sinflar:
        s["aniqlik"] = _foiz(s["togri"] or 0, s["savollar"] or 0)
        s["nom"] = sinf_nomi(s["grade"])
        s["ulush"] = round(s["darslar"] * 100 / sinf_eng)

    # --- darslar: eng ko'p o'ynalgani va eng qiyini ---
    darslar = list(
        darslar_qs.values("grade", "unit", "lesson", "lesson_name")
        .annotate(
            urinish=Count("id"),
            savollar=Sum("asked"),
            togri=Sum("correct"),
            xato=Sum("mistakes"),
        )
    )
    for d in darslar:
        d["aniqlik"] = _foiz(d["togri"] or 0, d["savollar"] or 0)
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
        hisoblar_qs.annotate(
            profil_soni=Count("profiles", distinct=True),
            oxirgi_kirish=Max("sessions__last_seen"),
            platforma=Max("sessions__platform"),
        )
        .order_by(F("oxirgi_kirish").desc(nulls_last=True))[:300]
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
            # Jadval ustidagi qidiruv shu satr bo'yicha ishlaydi (brauzerda).
            "qidiruv": " ".join(
                x for x in (p.toliq_ism, p.username, p.telefon) if x
            ).lower(),
            "bosh": (p.first_name[:1] or "?").upper(),
            "username": p.username,
            "telefon": p.telefon,
            "usullar": sorted(set(usullar.get(p.pk, []))),
            "profillar": p.profil_soni,
            "yulduz": yulduzlar.get(p.pk, 0) or 0,
            "darslar": dars_soni.get(p.pk, 0),
            "sinf": sinf_nomi(eng_uzoq.get(p.pk)),
            "platforma": p.platforma or "—",
            "qoshilgan": p.registered_at or p.created_at,
            "oxirgi": oxirgi,
            "oxirgi_dars": oxirgi_dars.get(p.pk),
            "onlayn": bool(oxirgi and oxirgi >= onlayn_vaqt),
        })

    # --- eng ko'p mashq qilganlar ---
    faollar = [f for f in sorted(foydalanuvchilar, key=lambda f: -f["darslar"])[:10] if f["darslar"]]
    faol_eng = max([f["darslar"] for f in faollar] + [1])
    for f in faollar:
        f["ulush"] = round(f["darslar"] * 100 / faol_eng)

    # --- so'nggi harakatlar ---
    oqim = list(
        darslar_qs.select_related("profile", "profile__pupil")
        .order_by("-created_at")[:40]
    )

    # --- platformalar ---
    platformalar = list(
        Session.objects.filter(pupil__registered_at__isnull=False)
        .values("platform").annotate(n=Count("token_hash")).order_by("-n")
    )
    platforma_jami = sum(p["n"] for p in platformalar) or 1
    for p in platformalar:
        p["foiz"] = round(p["n"] * 100 / platforma_jami)
        p["nom"] = p["platform"] or "noma'lum"

    return {
        "yangilangan": timezone.localtime(hozir),
        "kunlar": kunlar,
        "umumiy": {
            "royxatdan": royxatdan,
            "jami_hisob": jami_hisob,
            "royxatsiz": jami_hisob - royxatdan,
            "royxat_foiz": _foiz(royxatdan, jami_hisob),
            "profillar": Profile.objects.filter(pupil__registered_at__isnull=False).count(),
            "telegramli": telegramli,
            "telefonli": telefonli,
            "darslar": natijalar["darslar"] or 0,
            "savollar": savollar,
            "yulduz": natijalar["yulduz"] or 0,
            "aniqlik": _foiz(togri, savollar),
            "soat": round((natijalar["vaqt"] or 0) / 3_600_000, 1),
            "dars_ortacha": round((natijalar["darslar"] or 0) / (royxatdan or 1), 1),
        },
        "faollik": {
            "onlayn": onlayn,
            "bugun": bugun_faol,
            "hafta": hafta_faol,
            "oy": oy_faol,
            # "Necha foizi hali ham qaytib turibdi" — o'sishdan muhimroq raqam.
            "hafta_foiz": _foiz(hafta_faol, royxatdan),
        },
        "osish": osish,
        "voronka": voronka,
        "grafik": grafik,
        "soatlar": soat_qator,
        "sinflar": sinflar,
        "mashhur": mashhur,
        "qiyin": qiyin,
        "foydalanuvchilar": foydalanuvchilar,
        "faollar": faollar,
        "oqim": oqim,
        "platformalar": platformalar,
        "onlayn_daqiqa": ONLAYN_DAQIQA,
    }
