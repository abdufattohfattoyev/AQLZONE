"""
Tahlil — kim, qayerdan, nimada faol.

Uch qismi bor:

  * YOZISH (`yoz`) — ilova yig'ib yuborgan hodisalar
    (`views.hodisalar` → shu yer). Sahifa ochilishi va tugma bosishi.
  * ANKETA (`anketa_yoz`) — ro'yxatdan keyingi uch savol.
  * HISOBOT (`statistika`) — boshqaruv panelidagi "Tahlil" sahifasi.

Hodisa yozish HECH QACHON ilovani to'xtatmasligi kerak: noto'g'ri
kelgan qator jimgina tashlab yuboriladi, xato qaytarilmaydi.
"""
from __future__ import annotations

from datetime import timedelta

from django.db.models import Count
from django.utils import timezone

from .models import Hodisa, Pupil

#: Bir so'rovda qabul qilinadigan eng ko'p hodisa. Ilova 15 soniyada
#: bir yuboradi — bundan ko'pi faqat buzilgan yoki yolg'on mijozda bo'ladi.
MAX_BIR_YUBORISH = 60

#: Batafsil hodisalar necha kun saqlanadi.
SAQLASH_KUN = 120

VILOYATLAR = [
    ("toshkent_sh", "Toshkent shahri"), ("toshkent", "Toshkent viloyati"),
    ("andijon", "Andijon"), ("buxoro", "Buxoro"), ("fargona", "Farg'ona"),
    ("jizzax", "Jizzax"), ("xorazm", "Xorazm"), ("namangan", "Namangan"),
    ("navoiy", "Navoiy"), ("qashqadaryo", "Qashqadaryo"), ("samarqand", "Samarqand"),
    ("sirdaryo", "Sirdaryo"), ("surxondaryo", "Surxondaryo"),
    ("qoraqalpogiston", "Qoraqalpog'iston"), ("chet_el", "Chet el"),
]
VILOYAT_NOMI = dict(VILOYATLAR)
KIM_NOMI = dict(Pupil.KIMLAR)


def qurilma_ol(ua: str) -> str:
    """Brauzer satridan qurilma turi. Aniq bo'lmasa — bo'sh."""
    u = (ua or "").lower()
    if "iphone" in u or "ipad" in u:
        return "ios"
    if "android" in u:
        return "android"
    if "windows" in u or "macintosh" in u or "linux" in u:
        return "kompyuter"
    return ""


def yoz(pupil: Pupil, kelgan, ua: str = "") -> int:
    """Hodisalarni saqlaydi. Nechtasi qabul qilinganini qaytaradi."""
    if not isinstance(kelgan, list):
        return 0
    hozir = timezone.now()
    qatorlar = []
    for h in kelgan[:MAX_BIR_YUBORISH]:
        if not isinstance(h, dict):
            continue
        tur = str(h.get("tur") or "")
        if tur not in (Hodisa.SAHIFA, Hodisa.BOSISH):
            continue
        yol = str(h.get("yol") or "")[:80]
        nom = str(h.get("nom") or "").strip()[:48]
        if tur == Hodisa.BOSISH and not nom:
            continue
        # Mijoz soati noto'g'ri bo'lishi mumkin — faqat "necha soniya
        # oldin" qabul qilinadi va u ham chegaralangan.
        try:
            oldin = max(0, min(int(h.get("oldin") or 0), 3600))
        except (TypeError, ValueError):
            oldin = 0
        qatorlar.append(Hodisa(
            pupil=pupil, tur=tur, yol=yol, nom=nom,
            created_at=hozir - timedelta(seconds=oldin),
        ))
    if qatorlar:
        Hodisa.objects.bulk_create(qatorlar)

    q = qurilma_ol(ua)
    if q and pupil.qurilma != q:
        pupil.qurilma = q
        pupil.save(update_fields=["qurilma"])
    return len(qatorlar)


def anketa_yoz(pupil: Pupil, d: dict) -> None:
    """
    Anketa javoblari. Bo'sh kelsa ham `anketa_at` qo'yiladi — bu
    "o'tkazib yubordi" degani va anketa ikkinchi marta chiqmaydi.
    """
    kim = str(d.get("kim") or "")
    if kim in KIM_NOMI:
        pupil.kim = kim
    try:
        sinf = int(d.get("sinf"))
        if 0 <= sinf <= 11:
            pupil.anketa_sinf = sinf
    except (TypeError, ValueError):
        pass
    viloyat = str(d.get("viloyat") or "")
    if viloyat in VILOYAT_NOMI:
        pupil.viloyat = viloyat
    pupil.anketa_at = timezone.now()
    pupil.save(update_fields=["kim", "anketa_sinf", "viloyat", "anketa_at"])


def tozala() -> int:
    """SAQLASH_KUN dan eski hodisalarni o'chiradi."""
    chegara = timezone.now() - timedelta(days=SAQLASH_KUN)
    n, _ = Hodisa.objects.filter(created_at__lt=chegara).delete()
    return n


def _taqsimot(qs, maydon: str, nomlar: dict, jami: int) -> list[dict]:
    """Bitta maydon bo'yicha ulushlar — eng kattasi tepada."""
    qator = (
        qs.exclude(**{maydon: ""}) if maydon != "anketa_sinf"
        else qs.exclude(anketa_sinf=-1)
    ).values(maydon).annotate(n=Count("id")).order_by("-n")
    natija = []
    for r in qator:
        k = r[maydon]
        nom = nomlar.get(k, k) if nomlar else (
            "Maktabgacha" if k == 0 else f"{k}-sinf"
        )
        natija.append({"nom": nom, "n": r["n"], "foiz": round(100 * r["n"] / jami) if jami else 0})
    return natija


def statistika(kunlar: int = 30) -> dict:
    hozir = timezone.now()
    boshi = hozir - timedelta(days=kunlar)

    hisoblar = Pupil.objects.all()
    jami = hisoblar.count()
    yangi = hisoblar.filter(created_at__gte=boshi).count()
    anketali = hisoblar.filter(anketa_at__isnull=False).exclude(kim="").count()

    hodisa = Hodisa.objects.filter(created_at__gte=boshi)
    faol_hisob = hodisa.values("pupil").distinct().count()

    sahifalar = list(
        hodisa.filter(tur=Hodisa.SAHIFA).values("yol")
        .annotate(n=Count("id"), odam=Count("pupil", distinct=True)).order_by("-n")[:15]
    )
    tugmalar = list(
        hodisa.filter(tur=Hodisa.BOSISH).values("nom", "yol")
        .annotate(n=Count("id"), odam=Count("pupil", distinct=True)).order_by("-n")[:20]
    )
    eng_katta_sahifa = max((s["n"] for s in sahifalar), default=1)
    for s in sahifalar:
        s["foiz"] = round(100 * s["n"] / eng_katta_sahifa)

    # Eng faollar va har birining SEVIMLI bo'limi — "kim nimada faol".
    faollar = list(
        hodisa.values("pupil").annotate(n=Count("id"), kun=Count("created_at__date", distinct=True))
        .order_by("-n")[:25]
    )
    idlar = [f["pupil"] for f in faollar]
    kimlar = {p.pk: p for p in Pupil.objects.filter(pk__in=idlar)}
    sevimli: dict[int, str] = {}
    for r in (
        Hodisa.objects.filter(pupil__in=idlar, created_at__gte=boshi, tur=Hodisa.SAHIFA)
        .values("pupil", "yol").annotate(n=Count("id")).order_by("pupil", "-n")
    ):
        sevimli.setdefault(r["pupil"], r["yol"])
    for f in faollar:
        p = kimlar.get(f["pupil"])
        f["ism"] = (p.toliq_ism if p else "") or f"hisob #{f['pupil']}"
        f["kim"] = KIM_NOMI.get(p.kim, "—") if p else "—"
        f["sinf"] = (
            "—" if not p or p.anketa_sinf < 0
            else ("Maktabgacha" if p.anketa_sinf == 0 else f"{p.anketa_sinf}-sinf")
        )
        f["viloyat"] = VILOYAT_NOMI.get(p.viloyat, "—") if p else "—"
        f["premium"] = bool(p and p.tg_premium)
        f["sevimli"] = sevimli.get(f["pupil"], "—")

    # Oxirgi ro'yxatdan o'tganlar — anketa bilan birga.
    oxirgilar = []
    for p in hisoblar.order_by("-created_at")[:20]:
        oxirgilar.append({
            "ism": p.toliq_ism or f"hisob #{p.pk}",
            "vaqt": p.created_at,
            "kim": KIM_NOMI.get(p.kim, "—"),
            "sinf": "—" if p.anketa_sinf < 0 else ("Maktabgacha" if p.anketa_sinf == 0 else f"{p.anketa_sinf}-sinf"),
            "viloyat": VILOYAT_NOMI.get(p.viloyat, "—"),
            "premium": p.tg_premium,
            "qurilma": p.qurilma or "—",
        })

    premium = hisoblar.filter(tg_premium=True).count()
    qurilmalar = {"ios": "iPhone", "android": "Android", "kompyuter": "Kompyuter"}

    return {
        "kunlar": kunlar,
        "yangilangan": hozir,
        "jami": jami,
        "yangi": yangi,
        "faol_hisob": faol_hisob,
        "anketali": anketali,
        "anketa_foiz": round(100 * anketali / jami) if jami else 0,
        "premium": premium,
        "premium_foiz": round(100 * premium / jami) if jami else 0,
        "kim_taqsimot": _taqsimot(hisoblar, "kim", KIM_NOMI, anketali),
        "sinf_taqsimot": _taqsimot(hisoblar, "anketa_sinf", {}, anketali),
        "viloyat_taqsimot": _taqsimot(hisoblar, "viloyat", VILOYAT_NOMI, anketali),
        "qurilma_taqsimot": _taqsimot(
            hisoblar, "qurilma", qurilmalar, hisoblar.exclude(qurilma="").count(),
        ),
        "sahifalar": sahifalar,
        "tugmalar": tugmalar,
        "faollar": faollar,
        "oxirgilar": oxirgilar,
        "hodisa_soni": hodisa.count(),
        "bosish_soni": hodisa.filter(tur=Hodisa.BOSISH).count(),
    }
