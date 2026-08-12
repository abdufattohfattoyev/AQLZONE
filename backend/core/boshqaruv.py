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
from .liga import DARAJALAR
from .models import (
    Duel,
    Identity, LessonResult, LigaAzo, Profile, Progress, Pupil, Reklama, Session,
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
            # Ro'yxatdagi qiymatdan boshqasi kelsa yashilga tushadi:
            # Telegram noma'lum `style` ga butun xabarni rad etadi va
            # e'lon hech kimga bormasdi.
            tugma_rangi=(
                request.POST.get("tugma_rangi")
                if request.POST.get("tugma_rangi") in dict(Reklama.RANGLAR)
                else "success"
            ),
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
    """
    Kurs kodining nomi.

    Kod mijozda belgilanadi (`frontend/src/lib/curriculum/index.ts`) va
    server uni `LessonResult.grade` da o'zgartirmasdan saqlaydi:

        0        maktabgacha
        1–6      matematika
        7–10     algebra
        11       matematika
        107–110  geometriya (100 + sinf)

    Geometriya nega alohida kod bilan: 7-sinfda algebra ham, geometriya
    ham bor. Ikkalasi bir xil `grade` bilan kelsa, panel ularni bitta
    qatorga qo'shib yuborardi — "eng qiyin dars" jadvalida ikki xil
    fanning natijasi aralashib ketardi.
    """
    if grade is None:
        return "—"
    if grade == 0:
        return "Maktabgacha"
    if grade >= 100:
        return f"{grade - 100}-sinf geometriya"
    if 7 <= grade <= 10:
        return f"{grade}-sinf algebra"
    return f"{grade}-sinf"


# Darslar xaritasidan TASHQARIDAGI mashqlar shu kodlar bilan keladi.
# Ular haqiqiy bob raqamlaridan uzoq ataylab tanlangan: shunda bitta
# ustunda ham dars, ham mashq turaveradi va biror darsning statistikasi
# buzilmaydi (`frontend/src/lib/blok.ts`, `lib/progress.tsx`).
MAXSUS_JOY = 90


def joy_nomi(grade, unit, lesson, lesson_name) -> str:
    """
    Hisobotdagi "joy" ustuni.

    Oddiy dars uchun bu "9-sinf · 3-bob · 2-dars". Kunlik sinov va blok
    test uchun esa bob raqami yo'q — ular darslar xaritasida turmaydi.
    Ilgari bu hisobga olinmasdi va sinov "9-sinf · 100-bob · 100-dars"
    bo'lib chiqardi: raqam ma'nosiz, o'zi esa nima ekani tushunarsiz.

    Shuning uchun maxsus kodlarda mijoz yuborgan NOM ishlatiladi —
    "Kunlik sinov" yoki "Blok test · Kvadrat tenglama".
    """
    if unit is not None and unit >= MAXSUS_JOY:
        return f"{sinf_nomi(grade)} · {lesson_name or 'Mashq'}"
    return f"{sinf_nomi(grade)} · {unit + 1}-bob · {lesson + 1}-dars"


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


def _hafta_kaliti(kun):
    """Shu kun tegishli haftaning dushanbasi."""
    return kun - timedelta(days=kun.weekday())


def _ketma_ket(kunlar: set, bugun) -> int:
    """
    Hozirgi ketma-ket kunlar zanjiri.

    Kecha ham boshlanish nuqtasi bo'la oladi: bugun hali o'ynamagan bola
    zanjirini yo'qotgan emas — kun tugagani yo'q. Kechagi kun ham
    bo'lmasa zanjir uzilgan va javob 0.
    """
    if not kunlar:
        return 0
    boshi = bugun if bugun in kunlar else bugun - timedelta(days=1)
    if boshi not in kunlar:
        return 0
    n = 0
    while boshi in kunlar:
        n += 1
        boshi -= timedelta(days=1)
    return n


def _qaytish(reg: dict, kunlar_boyicha: dict, bugun, n: int) -> dict:
    """
    "N kundan keyin ham qaytdimi" — ushlab qolish (rolling retention).

    Nega aynan "N-kunda" emas, "N kundan KEYIN": bola aynan yettinchi kuni
    o'ynamagan bo'lishi mumkin, lekin sakkizinchi kuni qaytgan bo'lsa u
    yo'qotilgan emas. Kalendar kunini talab qilish foizni sun'iy
    pasaytirardi va qarorni noto'g'ri tomonga burardi.

    Maxrajga faqat YETILGAN hisoblar kiradi: kecha ro'yxatdan o'tgan
    odamdan "30 kundan keyin qaytdimi" deb so'rash mumkin emas, va uni
    "qaytmagan" deb sanash foizni har kuni yolg'on pasaytirib turardi.
    """
    jami = qaytgan = 0
    for pk, r in reg.items():
        if r is None or (bugun - r).days < n:
            continue
        jami += 1
        if any((k - r).days >= n for k in kunlar_boyicha.get(pk, ())):
            qaytgan += 1
    return {"jami": jami, "son": qaytgan, "foiz": _foiz(qaytgan, jami)}


#: Oxirgi faollikdan beri o'tgan kunlar bo'yicha guruhlar.
#:
#: Bu jadval "kim bilan ishlash kerak" degan savolga javob beradi:
#: sekinlashgan bolani bitta eslatma qaytaradi, bir oy yo'qolganini esa
#: deyarli hech narsa qaytarmaydi. Chegaralar shu farqni ajratadi.
XAVF_GURUHLARI = [
    ("Faol", 0, 2, "yashil", "oxirgi 3 kunda o'ynagan"),
    ("Sekinlashgan", 3, 7, "moviy", "3–7 kun ko'rinmadi"),
    ("Xavf ostida", 8, 14, "sariq", "bir-ikki haftadan beri yo'q"),
    ("Yo'qolyapti", 15, 30, "qizil", "yarim oydan ko'p"),
    ("Ketgan", 31, 10**9, "xira", "bir oydan ortiq"),
]

#: Hafta kunlari — `date.weekday()` tartibida (dushanba = 0).
HAFTA_KUNLARI = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"]


def statistika(kunlar: int = 30) -> dict:
    """
    Panelning butun ma'lumoti — bitta joyda.

    Tartib ATAYLAB shunday: avval bir marta o'qib olinadigan xom
    ma'lumot, keyin undan chiqadigan hamma ko'rsatkich. Ya'ni "yana
    bitta raqam kerak" bo'lganda yangi so'rov emas, o'sha to'plamdan
    hisob qo'shiladi — sahifa qancha boyisa ham so'rov soni o'smaydi.
    """
    hozir = timezone.now()
    bugun = timezone.localtime(hozir).date()
    oraliq = hozir - timedelta(days=kunlar)

    # Butun panel shu ikki so'rovdan o'sadi. Ikkalasi ham ro'yxatdan
    # o'tmagan hisoblarni CHETLAB o'tadi — sabab `ROYXAT` izohida.
    hisoblar_qs = Pupil.objects.filter(ROYXAT)
    darslar_qs = LessonResult.objects.filter(DARS_ROYXAT)

    # ---------------------------------------------------- xom ma'lumot
    #
    # Butun tarix bo'ylab BITTA o'tish. Undan chiqadigan narsalar:
    # kunlik grafik, soat va hafta kuni taqsimoti, DAU/WAU/MAU, ushlab
    # qolish, zanjir, xavf guruhlari. Har biri uchun alohida so'rov
    # yozilsa, o'nlab `GROUP BY` bo'lardi va sahifa sekinlashardi.
    kunlar_boyicha: dict[int, set] = {}   # hisob → o'ynagan kunlari
    soatlar = [0] * 24
    hafta_kunlari = [0] * 7
    dars_kun: dict = {}                   # kun → dars soni (tanlangan davr)
    faol_kun: dict = {}                   # kun → o'sha kuni o'ynagan hisoblar

    for pk, sana in darslar_qs.values_list("profile__pupil", "created_at"):
        mahalliy = timezone.localtime(sana)
        k = mahalliy.date()
        kunlar_boyicha.setdefault(pk, set()).add(k)
        soatlar[mahalliy.hour] += 1
        hafta_kunlari[mahalliy.weekday()] += 1
        if sana >= oraliq:
            dars_kun[k] = dars_kun.get(k, 0) + 1
            faol_kun.setdefault(k, set()).add(pk)

    # Ro'yxatdan o'tgan sana — ushlab qolish va kohortlar shundan chiqadi.
    royxat_kun: dict = {}
    yangi_kun: dict = {}
    for pk, sana in hisoblar_qs.values_list("id", "registered_at"):
        k = _kun_kaliti(sana)
        royxat_kun[pk] = k
        if sana >= oraliq:
            yangi_kun[k] = yangi_kun.get(k, 0) + 1

    # ------------------------------------------------------ umumiy sonlar
    royxatdan = len(royxat_kun)
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
    jami_dars = natijalar["darslar"] or 0
    savollar = natijalar["savollar"] or 0
    togri = natijalar["togri"] or 0
    jami_vaqt = natijalar["vaqt"] or 0

    # --------------------------------------------------------- faollik
    onlayn_vaqt = hozir - timedelta(minutes=ONLAYN_DAQIQA)
    onlayn = (
        Session.objects
        .filter(last_seen__gte=onlayn_vaqt, pupil__registered_at__isnull=False)
        .values("pupil").distinct().count()
    )

    def faol(kun: int) -> int:
        """Oxirgi `kun` kalendar kunida kamida bitta dars tugatganlar."""
        chegara = bugun - timedelta(days=kun - 1)
        return sum(1 for k in kunlar_boyicha.values() if any(d >= chegara for d in k))

    bugun_faol, hafta_faol, oy_faol = faol(1), faol(7), faol(30)

    # Yopishqoqlik (DAU/MAU) — o'yin sanoatining asosiy o'lchovi.
    # "Oyda kirgan bolaning necha foizi BUGUN ham kirdi" degani. 20% dan
    # yuqorisi kuchli odat, 10% dan pasti — ilova esga tushmayapti.
    yopishqoq = _foiz(bugun_faol, oy_faol)

    # ------------------------------------------------- o'sish (7 kun)
    #
    # Yalpi son o'sib borgani bilan hech narsa demaydi — u hech qachon
    # kamaymaydi. Ma'noli savol bitta: shu hafta o'tgan haftadan yaxshimi.
    hafta = hozir - timedelta(days=7)
    old_hafta = hozir - timedelta(days=14)
    yangi_hafta = hisoblar_qs.filter(registered_at__gte=hafta).count()
    yangi_old = hisoblar_qs.filter(
        registered_at__gte=old_hafta, registered_at__lt=hafta
    ).count()

    bu_hafta_dars = darslar_qs.filter(created_at__gte=hafta).aggregate(
        n=Count("id"), s=Sum("asked"), t=Sum("correct"), v=Sum("duration_ms"),
    )
    old_hafta_dars = darslar_qs.filter(
        created_at__gte=old_hafta, created_at__lt=hafta
    ).aggregate(n=Count("id"), s=Sum("asked"), t=Sum("correct"), v=Sum("duration_ms"))

    faol_hafta_old = sum(
        1 for k in kunlar_boyicha.values()
        if any(bugun - timedelta(days=13) <= d <= bugun - timedelta(days=7) for d in k)
    )

    osish = {
        "yangi": yangi_hafta,
        "yangi_ozgarish": _ozgarish(yangi_hafta, yangi_old),
        "darslar": bu_hafta_dars["n"] or 0,
        "dars_ozgarish": _ozgarish(bu_hafta_dars["n"] or 0, old_hafta_dars["n"] or 0),
        "faol": hafta_faol,
        "faol_ozgarish": _ozgarish(hafta_faol, faol_hafta_old),
        "soat": round((bu_hafta_dars["v"] or 0) / 3_600_000, 1),
        "soat_ozgarish": _ozgarish(bu_hafta_dars["v"] or 0, old_hafta_dars["v"] or 0),
        "aniqlik": _foiz(bu_hafta_dars["t"] or 0, bu_hafta_dars["s"] or 0),
        "aniqlik_old": _foiz(old_hafta_dars["t"] or 0, old_hafta_dars["s"] or 0),
    }
    osish["aniqlik_farq"] = osish["aniqlik"] - osish["aniqlik_old"]

    # ------------------------------------------------------- voronka
    #
    # Eng qimmatli ko'rsatkich shu: odamlar qaysi qadamda to'xtayapti.
    # Har qadam oldingisining ICHIDA turadi.
    darsli = len(kunlar_boyicha)
    qaytgan = sum(1 for k in kunlar_boyicha.values() if len(k) >= 2)
    sodiq = sum(1 for k in kunlar_boyicha.values() if len(k) >= 5)
    odatlangan = sum(1 for k in kunlar_boyicha.values() if len(k) >= 14)

    voronka = [
        {"nom": "Ilovani ochgan", "son": jami_hisob,
         "izoh": "brauzer hisob ochdi — ko'pi shu yerda to'xtaydi"},
        {"nom": "Ro'yxatdan o'tgan", "son": royxatdan,
         "izoh": "Telegram va ism-familiya"},
        {"nom": "Kamida 1 dars tugatgan", "son": darsli, "izoh": "ilovani ko'rgan"},
        {"nom": "Boshqa kuni qaytgan", "son": qaytgan, "izoh": "2+ xil kunda o'ynagan"},
        {"nom": "Odat bo'lgan", "son": sodiq, "izoh": "5+ xil kunda o'ynagan"},
        {"nom": "Doimiy", "son": odatlangan, "izoh": "14+ xil kunda o'ynagan"},
    ]
    oldingi = None
    for q in voronka:
        q["foiz"] = _foiz(q["son"], jami_hisob)
        # Ikkinchi o'lchov: ro'yxatdan o'tganlarga NISBATAN. Birinchi
        # qadam juda katta bo'lgani uchun qolganlari yonida ko'rinmay
        # qoladi, holbuki asosiy ish o'sha pastki qadamlarda.
        q["ulush"] = _foiz(q["son"], royxatdan)
        # Yo'qotish — aynan SHU qadamda to'xtaganlar. Umumiy foizdan
        # muhimroq: tuzatish ishi eng katta tushish turgan joyda boshlanadi.
        q["tushdi"] = (oldingi["son"] - q["son"]) if oldingi else 0
        q["tushdi_foiz"] = _foiz(q["tushdi"], oldingi["son"]) if oldingi else 0
        oldingi = q

    # ---------------------------------------------- ushlab qolish
    #
    # Voronka "qanchasi qoldi" deydi, bu esa "qancha VAQTDAN keyin
    # qoldi" — ikkinchisi ilovaning umrini belgilaydi.
    ushlash = {
        "d1": _qaytish(royxat_kun, kunlar_boyicha, bugun, 1),
        "d7": _qaytish(royxat_kun, kunlar_boyicha, bugun, 7),
        "d30": _qaytish(royxat_kun, kunlar_boyicha, bugun, 30),
        "bir_kunlik": darsli - qaytgan,
        "bir_kunlik_foiz": _foiz(darsli - qaytgan, darsli),
    }

    # Kohortlar: qaysi HAFTADA kelgan odamlar yaxshiroq qoldi. Bitta
    # umumiy foiz o'zgarishni yashiradi — ilova yaxshilangan bo'lsa, buni
    # faqat yangi kohortning eski kohortdan yuqoriligi ko'rsatadi.
    kohort_xom: dict = {}
    for pk, r in royxat_kun.items():
        if r is None or (bugun - r).days > 84:      # 12 hafta yetarli
            continue
        kohort_xom.setdefault(_hafta_kaliti(r), []).append(pk)

    kohortlar = []
    for h in sorted(kohort_xom, reverse=True):
        odamlar = kohort_xom[h]
        satr = {"hafta": h, "nom": h.strftime("%d.%m"), "jami": len(odamlar)}
        for nom, n in (("d1", 1), ("d7", 7), ("d30", 30)):
            # Kohort yetilmagan bo'lsa foiz YOZILMAYDI. "0%" deb qo'yish
            # yangi haftani har doim eng yomon ko'rsatardi.
            if (bugun - h).days < n:
                satr[nom] = None
                continue
            q = sum(
                1 for pk in odamlar
                if any((k - royxat_kun[pk]).days >= n for k in kunlar_boyicha.get(pk, ()))
            )
            satr[nom] = _foiz(q, len(odamlar))
        kohortlar.append(satr)
    kohortlar = kohortlar[:12]

    # ------------------------------------------------- xavf guruhlari
    #
    # "Kim bilan bugun ishlash kerak" degan savolning javobi. Sekinlashgan
    # bolani bitta eslatma qaytaradi, bir oy yo'qolganini — deyarli hech narsa.
    xavf = []
    for nom, past, baland, rang, izoh in XAVF_GURUHLARI:
        son = sum(
            1 for k in kunlar_boyicha.values()
            if past <= (bugun - max(k)).days <= baland
        )
        xavf.append({
            "nom": nom, "son": son, "rang": rang, "izoh": izoh,
            "foiz": _foiz(son, darsli),
        })

    # Zanjir — ketma-ket kunlar. Odat shakllanganini eng aniq ko'rsatadigan
    # belgi: yulduz yig'ib qo'yish mumkin, zanjirni esa faqat har kuni
    # qaytib kelib saqlab bo'ladi.
    zanjirlar = {pk: _ketma_ket(k, bugun) for pk, k in kunlar_boyicha.items()}
    zanjirli = sum(1 for n in zanjirlar.values() if n >= 3)
    eng_zanjir = max(zanjirlar.values()) if zanjirlar else 0

    # ---------------------------------------------------- kunlik grafik
    qator = []
    for i in range(kunlar - 1, -1, -1):
        k = bugun - timedelta(days=i)
        qator.append({
            "sana": k,
            "kun": k.strftime("%d.%m"),
            "yangi": yangi_kun.get(k, 0),
            "darslar": dars_kun.get(k, 0),
            "faol": len(faol_kun.get(k, ())),
            "dam": k.weekday() >= 5,
        })
    eng_katta = max([q["darslar"] for q in qator] + [1])
    eng_faol = max([q["faol"] for q in qator] + [1])
    eng_yangi = max([q["yangi"] for q in qator] + [1])
    for q in qator:
        q["balandlik"] = round(q["darslar"] * 100 / eng_katta)

    grafik = {
        "qator": qator,
        "eng_katta": eng_katta,
        "eng_faol": eng_faol,
        "eng_yangi": eng_yangi,
        # Faol bolalar chizig'i — ustunlar ustidan o'tadigan ikkinchi qatlam.
        "chiziq": _chiziq([q["faol"] for q in qator], eng_faol),
        "chiziq_yangi": _chiziq([q["yangi"] for q in qator], eng_yangi),
        # Sana o'qida hamma kun sig'maydi: boshi, o'rtasi, oxiri yetarli.
        "belgilar": [qator[0]["kun"], qator[len(qator) // 2]["kun"], qator[-1]["kun"]] if qator else [],
        "kunlik_ortacha": round(sum(dars_kun.values()) / (kunlar or 1), 1),
    }

    # ------------------------------------------ vaqt bo'yicha taqsimot
    #
    # Eslatma yuborish vaqtini shu ikki jadval hal qiladi: bola
    # o'ynamaydigan soatda kelgan xabar shunchaki o'qilmay yopiladi.
    soat_eng = max(soatlar + [1])
    soat_qator = [
        {"soat": s, "son": n, "balandlik": round(n * 100 / soat_eng),
         "cho_qqi": n == soat_eng and n > 0}
        for s, n in enumerate(soatlar)
    ]
    eng_soat = soatlar.index(soat_eng) if any(soatlar) else 0

    kun_eng = max(hafta_kunlari + [1])
    kun_qator = [
        {"nom": HAFTA_KUNLARI[i], "son": n, "balandlik": round(n * 100 / kun_eng),
         "dam": i >= 5}
        for i, n in enumerate(hafta_kunlari)
    ]

    # -------------------------------------------------- kurslar bo'yicha
    sinflar = list(
        darslar_qs.values("grade")
        .annotate(
            darslar=Count("id"),
            savollar=Sum("asked"),
            togri=Sum("correct"),
            bolalar=Count("profile", distinct=True),
            yulduz=Sum("stars"),
            vaqt=Sum("duration_ms"),
        )
        .order_by("grade")
    )
    sinf_eng = max([s["darslar"] for s in sinflar] + [1])
    for s in sinflar:
        s["aniqlik"] = _foiz(s["togri"] or 0, s["savollar"] or 0)
        s["nom"] = sinf_nomi(s["grade"])
        s["ulush"] = round(s["darslar"] * 100 / sinf_eng)
        s["bir_bolaga"] = round(s["darslar"] / (s["bolalar"] or 1), 1)

    # Boblar voronkasi — eng ko'p ishlatilgan kursning ichi. Bola qaysi
    # bobda to'xtaydi degan savol dars ketma-ketligini tuzatish uchun
    # kerak: hamma birinchi bobni o'tadi, uchinchisiga yarmi yetmaydi.
    boblar = []
    bob_sinf = ""
    if sinflar:
        eng_sinf = max(sinflar, key=lambda s: s["darslar"])["grade"]
        bob_sinf = sinf_nomi(eng_sinf)
        # Kunlik sinov va blok test bu grafikda TURMAYDI: u darslar
        # xaritasi bo'yicha, ular esa xaritadan tashqarida. Filtrsiz
        # ular "99-bob" va "100-bob" bo'lib chiqib, grafikning
        # o'ng chekkasini egallab olardi.
        xom_bob = list(
            darslar_qs.filter(grade=eng_sinf, unit__lt=MAXSUS_JOY).values("unit")
            .annotate(
                bolalar=Count("profile", distinct=True),
                darslar=Count("id"),
                savollar=Sum("asked"),
                togri=Sum("correct"),
            )
            .order_by("unit")[:14]
        )
        bob_eng = max([b["bolalar"] for b in xom_bob] + [1])
        for b in xom_bob:
            b["nom"] = f"{b['unit'] + 1}-bob"
            b["ulush"] = round(b["bolalar"] * 100 / bob_eng)
            b["aniqlik"] = _foiz(b["togri"] or 0, b["savollar"] or 0)
        boblar = xom_bob

    # ------------------------------------------------------- darslar
    darslar = list(
        darslar_qs.values("grade", "unit", "lesson", "lesson_name")
        .annotate(
            urinish=Count("id"),
            bolalar=Count("profile", distinct=True),
            savollar=Sum("asked"),
            togri=Sum("correct"),
            xato=Sum("mistakes"),
            vaqt=Sum("duration_ms"),
        )
    )
    for d in darslar:
        d["aniqlik"] = _foiz(d["togri"] or 0, d["savollar"] or 0)
        d["joy"] = joy_nomi(d["grade"], d["unit"], d["lesson"], d["lesson_name"])
        # Qayta o'ynash — bir bola shu darsni o'rtacha necha marta olgan.
        # 1,5 dan yuqorisi qiziqarli darsni ham, tushunilmagan darsni ham
        # bildiradi: aniqlik ustuni ikkalasini ajratadi.
        d["takror"] = round(d["urinish"] / (d["bolalar"] or 1), 1)
        d["daqiqa"] = round((d["vaqt"] or 0) / (d["urinish"] or 1) / 60000, 1)

    mashhur = sorted(darslar, key=lambda d: -d["urinish"])[:10]
    # Qiyinlik faqat YETARLI ma'lumot bo'lganda ma'noli: bitta savolda
    # xato qilingan dars "eng qiyin" bo'lib chiqib qolmasin.
    qiyin = sorted(
        [d for d in darslar if (d["savollar"] or 0) >= 5],
        key=lambda d: d["aniqlik"],
    )[:10]
    # Eng ko'p qayta o'ynalgan — "tushunmadi, yana urindi" belgisi.
    takroriy = sorted(
        [d for d in darslar if d["bolalar"] >= 3],
        key=lambda d: -d["takror"],
    )[:10]

    # -------------------------------------------------------- liga
    liga_hafta = _hafta_kaliti(bugun)
    liga_xom = dict(
        LigaAzo.objects.filter(hafta=liga_hafta)
        .values_list("daraja")
        .annotate(n=Count("id"))
        .values_list("daraja", "n")
    )
    liga_jami = sum(liga_xom.values())
    liga = [
        {
            "nom": d["nom"], "emoji": d["emoji"],
            "son": liga_xom.get(d["nomer"], 0),
            "foiz": _foiz(liga_xom.get(d["nomer"], 0), liga_jami),
        }
        for d in reversed(DARAJALAR)
    ]

    # -------------------------------------------------------- duellar
    #
    # To'liq hisobot alohida sahifada. Bu yerda faqat "ishlayaptimi"
    # degan savolga javob beradigan uch raqam turadi.
    duel_qs = Duel.objects.filter(created_at__gte=oraliq)
    duel_tayyor = duel_qs.filter(chaqirgan_tugatdi=True).count()
    duel_tugagan = duel_qs.filter(qabul_tugatdi=True).count()
    duel = {
        "jami": duel_qs.count(),
        "tugagan": duel_tugagan,
        "qabul_foiz": _foiz(duel_tugagan, duel_tayyor),
        "jonli": duel_qs.filter(chaqirgan_tayyor=True, qabul_tayyor=True).count(),
    }

    # ------------------------------------------------ yetkazish kanallari
    #
    # "Nechta odamga xabar yubora olamiz" — e'lon va eslatmaning haqiqiy
    # auditoriyasi shu. Ro'yxatdagi umumiy son emas: bloklagan va
    # "boshqa yozmang" degan odamlarga hech narsa bormaydi.
    kanal_azo = hisoblar_qs.filter(kanal_azo_at__isnull=False).count()
    bloklagan = hisoblar_qs.filter(bot_bloklandi_at__isnull=False).count()
    yopiq = hisoblar_qs.filter(xabar_yopiq_at__isnull=False).count()
    yetkazish = {
        "telegramli": telegramli,
        "kanal_azo": kanal_azo,
        "kanal_foiz": _foiz(kanal_azo, royxatdan),
        "bloklagan": bloklagan,
        "bloklagan_foiz": _foiz(bloklagan, telegramli),
        "yopiq": yopiq,
        "yetadi": max(telegramli - bloklagan - yopiq, 0),
    }

    tillar = list(
        hisoblar_qs.values("til").annotate(n=Count("id")).order_by("-n")
    )
    for t in tillar:
        t["foiz"] = _foiz(t["n"], royxatdan)
        t["nom"] = {"uz": "O'zbekcha", "ru": "Ruscha"}.get(t["til"], t["til"] or "—")

    # ------------------------------------------------- foydalanuvchilar
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
    dars_xulosa = {
        r["profile__pupil"]: r
        for r in LessonResult.objects.filter(profile__pupil_id__in=pupil_ids)
        .values("profile__pupil")
        .annotate(
            n=Count("id"), oxirgi=Max("created_at"), sinf=Max("grade"),
            savol=Sum("asked"), togri=Sum("correct"),
        )
    }
    # Kirish usullari VA telefon raqami bitta o'tishda.
    #
    # Raqamni `p.telefon` orqali olish mumkin edi, lekin u xossa har
    # chaqirilganda alohida so'rov yuboradi — 300 qatorli jadvalda bu
    # 300 ta ortiqcha so'rov demak. Bu yerda hammasi allaqachon o'qilgan.
    usullar: dict = {}
    telefonlar: dict = {}
    for pid, prov, tashqi in (
        Identity.objects.filter(pupil_id__in=pupil_ids)
        .values_list("pupil_id", "provider", "external_id")
    ):
        usullar.setdefault(pid, []).append(prov)
        if prov == Identity.TELEFON:
            telefonlar[pid] = tashqi

    foydalanuvchilar = []
    for p in xom:
        oxirgi = p.oxirgi_kirish
        d = dars_xulosa.get(p.pk, {})
        kun_toplam = kunlar_boyicha.get(p.pk, set())
        oxirgi_dars = d.get("oxirgi")
        telefon = telefonlar.get(p.pk, "")
        foydalanuvchilar.append({
            "id": p.pk,
            "ism": p.toliq_ism or "—",
            # Jadval ustidagi qidiruv shu satr bo'yicha ishlaydi (brauzerda).
            "qidiruv": " ".join(
                x for x in (p.toliq_ism, p.username, telefon) if x
            ).lower(),
            "bosh": (p.first_name[:1] or "?").upper(),
            "username": p.username,
            "telefon": telefon,
            "usullar": sorted(set(usullar.get(p.pk, []))),
            "profillar": p.profil_soni,
            "yulduz": yulduzlar.get(p.pk, 0) or 0,
            "darslar": d.get("n", 0),
            "kunlar": len(kun_toplam),
            "zanjir": zanjirlar.get(p.pk, 0),
            "aniqlik": _foiz(d.get("togri") or 0, d.get("savol") or 0),
            "sinf": sinf_nomi(d.get("sinf")),
            "platforma": p.platforma or "—",
            "qoshilgan": p.registered_at or p.created_at,
            "oxirgi": oxirgi,
            "oxirgi_dars": oxirgi_dars,
            # "Necha kun ko'rinmadi" — sanadan ko'ra tezroq o'qiladi.
            "jimlik": (bugun - max(kun_toplam)).days if kun_toplam else None,
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
            "darslar": jami_dars,
            "savollar": savollar,
            "yulduz": natijalar["yulduz"] or 0,
            "aniqlik": _foiz(togri, savollar),
            "soat": round(jami_vaqt / 3_600_000, 1),
            "dars_ortacha": round(jami_dars / (royxatdan or 1), 1),
            # Sifat o'lchovlari: bir dars qancha davom etadi va ichida
            # nechta savol bor. Ikkalasi birga "dars og'irmi yoki
            # yengilmi" degan savolga javob beradi.
            "dars_daqiqa": round(jami_vaqt / (jami_dars or 1) / 60000, 1),
            "dars_savol": round(savollar / (jami_dars or 1), 1),
            "kun_dars": round(jami_dars / (sum(len(k) for k in kunlar_boyicha.values()) or 1), 1),
        },
        "faollik": {
            "onlayn": onlayn,
            "bugun": bugun_faol,
            "hafta": hafta_faol,
            "oy": oy_faol,
            # "Necha foizi hali ham qaytib turibdi" — o'sishdan muhimroq raqam.
            "hafta_foiz": _foiz(hafta_faol, royxatdan),
            "yopishqoq": yopishqoq,
            "bugun_yangi": yangi_kun.get(bugun, 0),
            "bugun_dars": dars_kun.get(bugun, 0),
            "zanjirli": zanjirli,
            "eng_zanjir": eng_zanjir,
        },
        "osish": osish,
        "voronka": voronka,
        "ushlash": ushlash,
        "kohortlar": kohortlar,
        "xavf": xavf,
        "grafik": grafik,
        "soatlar": soat_qator,
        "eng_soat": eng_soat,
        "kunlar_qatori": kun_qator,
        "sinflar": sinflar,
        "boblar": boblar,
        "bob_sinf": bob_sinf,
        "mashhur": mashhur,
        "qiyin": qiyin,
        "takroriy": takroriy,
        "liga": liga,
        "liga_jami": liga_jami,
        "duel": duel,
        "yetkazish": yetkazish,
        "tillar": tillar,
        "foydalanuvchilar": foydalanuvchilar,
        "faollar": faollar,
        "oqim": oqim,
        "platformalar": platformalar,
        "onlayn_daqiqa": ONLAYN_DAQIQA,
    }


# ---------------------------------------------------------------- duellar


#: Jadvalda ko'rsatiladigan oxirgi duellar soni.
DUEL_ROYXAT = 60


def duel_statistika(kunlar: int = 30) -> dict:
    """
    Duel hisoboti.

    Asosiy savol bitta: **chaqiruvlar javob olyaptimi?** Duel soni emas,
    aynan shu foiz muhim — javobsiz qolgan chaqiruv o'yin emas, bo'sh
    ish. Shuning uchun ekranning eng tepasida "qabul qilindi" turadi.

    Ikkinchi savol: chaqiruv YASALDI-yu, o'ynalmadimi? "Boshlanmagan"
    duellar — bu o'yinni ochib, tugatmasdan chiqib ketganlar. Ular ko'p
    bo'lsa, muammo duelda emas, o'yinning o'zida.
    """
    hozir = timezone.now()
    oraliq = hozir - timedelta(days=kunlar)
    kecha = hozir - timedelta(hours=Duel.MUDDAT_SOAT)

    qs = Duel.objects.filter(created_at__gte=oraliq)

    jami = qs.count()
    boshlanmagan = qs.filter(chaqirgan_tugatdi=False).count()
    tugagan = qs.filter(qabul_tugatdi=True).count()
    # Kutayotgan: chaqiruv tayyor, javob yo'q va muddati hali o'tmagan.
    kutyapti = qs.filter(
        chaqirgan_tugatdi=True, qabul_tugatdi=False, created_at__gte=kecha
    ).count()
    javobsiz = qs.filter(
        chaqirgan_tugatdi=True, qabul_tugatdi=False, created_at__lt=kecha
    ).count()

    # Qabul foizi FAQAT tayyor chaqiruvlardan hisoblanadi: yarim yo'lda
    # tashlab ketilgan duel raqibga umuman ko'rinmagan va uni "qabul
    # qilinmadi" deb sanash foizni yolg'on pasaytirardi.
    tayyor = tugagan + kutyapti + javobsiz
    qabul_foiz = _foiz(tugagan, tayyor)

    # Eng faol chaqiruvchilar.
    faollar = (
        qs.filter(chaqirgan_tugatdi=True)
        .values("chaqirgan__name", "chaqirgan__pupil__first_name")
        .annotate(soni=Count("id"))
        .order_by("-soni")[:10]
    )

    # O'yinlar bo'yicha taqsimot — qaysi o'yin duelda ko'proq tushgani.
    oyinlar = (
        qs.filter(qabul_tugatdi=True)
        .values("oyin").annotate(soni=Count("id")).order_by("-soni")
    )

    # Jonli duel — ikkalasi ham "tayyorman" bosgani. Asinxrondan farqi
    # katta va uni alohida ko'rish kerak: agar jonli duellar deyarli
    # bo'lmasa, demak odamlar bir vaqtda onlayn bo'lmayapti va havolali
    # chaqiruv yagona ishlaydigan yo'l.
    jonli = qs.filter(chaqirgan_tayyor=True, qabul_tayyor=True).count()

    tugaganlar = qs.filter(qabul_tugatdi=True)
    ortacha = tugaganlar.aggregate(
        ch=Sum("chaqirgan_ball"), qa=Sum("qabul_ball"),
    )
    n = tugaganlar.count() or 1

    royxat = list(
        Duel.objects.select_related("chaqirgan", "qabul")
        .order_by("-created_at")[:DUEL_ROYXAT]
    )

    return {
        "kunlar": kunlar,
        "yangilangan": hozir,
        "duel": {
            "jami": jami,
            "tugagan": tugagan,
            "kutyapti": kutyapti,
            "javobsiz": javobsiz,
            "boshlanmagan": boshlanmagan,
            "tayyor": tayyor,
            "qabul_foiz": qabul_foiz,
            "ortacha_ball": round(((ortacha["ch"] or 0) + (ortacha["qa"] or 0)) / (n * 2)),
            "jonli": jonli,
            "bugun": Duel.objects.filter(
                created_at__date=timezone.localtime(hozir).date()
            ).count(),
        },
        "faollar": [
            {
                "ism": f["chaqirgan__name"] or f["chaqirgan__pupil__first_name"] or "—",
                "soni": f["soni"],
            }
            for f in faollar
        ],
        "oyinlar": list(oyinlar),
        "royxat": royxat,
    }


def duellar(request):
    """Duel hisoboti sahifasi."""
    if not _yoniq():
        raise Http404
    if not kirganmi(request):
        return kirish(request)
    kun = max(7, min(120, int(request.GET.get("kun") or 30)))
    return render(request, "boshqaruv/duel.html", duel_statistika(kun))
