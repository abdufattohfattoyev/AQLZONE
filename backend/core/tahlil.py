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
from django.db.models.functions import TruncDate
from django.utils import timezone

from .models import Hodisa, Pupil

#: Bir so'rovda qabul qilinadigan eng ko'p hodisa. Ilova 15 soniyada
#: bir yuboradi — bundan ko'pi faqat buzilgan yoki yolg'on mijozda bo'ladi.
MAX_BIR_YUBORISH = 60

#: Batafsil hodisalar necha kun saqlanadi.
SAQLASH_KUN = 120

#: Odam ilovaga QAYERDAN kirdi. Ilova yuboradi (`lib/tahlil.ts` →
#: `manbaniAniqla`), server faqat shu ro'yxatdagini qabul qiladi.
MANBALAR = {
    "kanal": "Kanal posti",
    "ulashish": "Do'st ulashgan havola",
    "eslatma": "Bot eslatmasi",
    "duel": "Duel chaqiruvi",
    "bot": "Botdan",
    "telegram": "Telegram (to'g'ridan)",
    "sayt": "Sayt",
    "ilova": "Android ilova",
}

VILOYATLAR = [
    ("toshkent_sh", "Toshkent shahri"), ("toshkent", "Toshkent viloyati"),
    ("andijon", "Andijon"), ("buxoro", "Buxoro"), ("fargona", "Farg'ona"),
    ("jizzax", "Jizzax"), ("xorazm", "Xorazm"), ("namangan", "Namangan"),
    ("navoiy", "Navoiy"), ("qashqadaryo", "Qashqadaryo"), ("samarqand", "Samarqand"),
    ("sirdaryo", "Sirdaryo"), ("surxondaryo", "Surxondaryo"),
    ("qoraqalpogiston", "Qoraqalpog'iston"), ("chet_el", "Chet el"),
]
VILOYAT_NOMI = dict(VILOYATLAR)
#: Kim — FAQAT MAKTAB EMAS.
#:
#: Ilgari uch javob bor edi (o'quvchi, ota-ona, ustoz) va hammasi maktabga
#: qaratilgan edi. Aslida ilovaga talabalar ham, o'quv markazi
#: o'qituvchilari ham, shunchaki matematika yoqadigan kattalar ham keladi —
#: ular "o'quvchi" ni bosib, tahlilni buzardi.
#:
#: Qiymatlar `Pupil.kim` ga yoziladi (10 belgigacha). Ro'yxat shu yerda,
#: modelda emas: yangi turni qo'shish migratsiya talab qilmasin.
KIM_NOMI = {
    "oquvchi": "Maktab o'quvchisi",
    "talaba": "Talaba",
    # DTMga tayyorlanayotgan — unga sinf ham, kurs ham to'g'ri kelmaydi.
    "abiturient": "Abituriyent",
    "ota_ona": "Ota-ona",
    "ustoz": "O'qituvchi",
    "kattalar": "Boshqa (kattalar)",
}

#: Talabaning yo'nalishi (`Pupil.yonalish`).
YONALISH_NOMI = {
    "boshlangich": "Boshlang'ich ta'lim",
    "mat_ustoz": "Matematika o'qituvchiligi",
    "texnika": "Texnika / IT",
    "iqtisod": "Iqtisodiyot",
    "boshqa": "Boshqa yo'nalish",
}

#: `Pupil.anketa_sinf` — BOSQICH. Nomi tarixiy ("sinf"), lekin endi u
#: har bir turning o'z bosqichini saqlaydi:
#:
#:      0          maktabgacha
#:      1..11      maktab sinfi (o'quvchi, ota-ona)
#:    101..104     bakalavr kursi (talaba)
#:    105          magistratura
#:    130..132     maktab o'qituvchisi: boshlang'ich / 5–9 / 10–11
#:    120          OTM o'qituvchisi
#:    121          o'quv markazi yoki repetitor
#:    140          "boshqa": maktab matematikasi kerak
#:    141          "boshqa": universitet darajasi kerak
#:     -1          javob yo'q (kattalarda so'ralmaydi)
BOSQICHLAR = {
    0: "Maktabgacha",
    **{s: f"{s}-sinf" for s in range(1, 12)},
    **{100 + k: f"{k}-kurs (bakalavr)" for k in range(1, 5)},
    105: "Magistratura",
    130: "O'qituvchi · 1–4-sinf",
    131: "O'qituvchi · 5–9-sinf",
    132: "O'qituvchi · 10–11-sinf",
    120: "O'qituvchi · OTM",
    121: "O'qituvchi · o'quv markazi",
    140: "Boshqa · maktab darajasi",
    141: "Boshqa · universitet darajasi",
}


def bosqich_nomi(kod: int) -> str:
    return BOSQICHLAR.get(kod, "—")


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
        if tur not in (Hodisa.KIRISH, Hodisa.SAHIFA, Hodisa.BOSISH):
            continue
        yol = str(h.get("yol") or "")[:80]
        nom = str(h.get("nom") or "").strip()[:48]
        if tur == Hodisa.BOSISH and not nom:
            continue
        if tur == Hodisa.KIRISH and nom not in MANBALAR:
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

    ─────────────── BITTA SAVOLLIK JAVOB ───────────────

    `qisman=True` bo'lsa `anketa_at` QO'YILMAYDI. Bu darslar ro'yxati
    tepasidagi bitta savol uchun: odam "kim uchun qidiryapsiz?" ga
    javob beradi, ro'yxat o'sha zahoti moslashadi, lekin to'liq
    tanishuv anketasi (bosqich, viloyat) keyinroq — ro'yxatdan
    o'tganda — baribir so'raladi.
    """
    qisman = bool(d.get("qisman"))
    kim = str(d.get("kim") or "")
    if kim in KIM_NOMI:
        pupil.kim = kim
    try:
        sinf = int(d.get("sinf"))
        if sinf in BOSQICHLAR:
            pupil.anketa_sinf = sinf
    except (TypeError, ValueError):
        pass
    viloyat = str(d.get("viloyat") or "")
    if viloyat in VILOYAT_NOMI:
        pupil.viloyat = viloyat
    yonalish = str(d.get("yonalish") or "")
    if yonalish in YONALISH_NOMI:
        pupil.yonalish = yonalish
    maydonlar = ["kim", "anketa_sinf", "viloyat", "yonalish"]
    if qisman:
        pupil.save(update_fields=maydonlar)
        return
    pupil.anketa_at = timezone.now()
    pupil.save(update_fields=[*maydonlar, "anketa_at"])


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
        nom = nomlar.get(k, k) if nomlar else bosqich_nomi(k)
        natija.append({"nom": nom, "n": r["n"], "foiz": round(100 * r["n"] / jami) if jami else 0})
    return natija


def _kunlar_boyicha(qs) -> dict[int, set]:
    """Har hisob qaysi KUNLARDA faol bo'lgan (Toshkent vaqti bilan)."""
    # Kun bazada kesiladi va takrorlar o'sha yerda tashlanadi: bir
    # kunda yuzta bosish qilgan odam Python'ga bitta qator bo'lib keladi.
    natija: dict[int, set] = {}
    for pid, kun in (
        qs.annotate(kun=TruncDate("created_at")).values_list("pupil_id", "kun").distinct().iterator()
    ):
        natija.setdefault(pid, set()).add(kun)
    return natija


def qaytish(boshi, kunlar_boyicha: dict[int, set]) -> dict:
    """
    QAYTIB KELADIMI — mahsulotning eng muhim raqami.

    Guruh: shu davrda BIRINCHI marta ko'ringan hisoblar (birinchi
    hodisasi davr ichida). Har biri uchun:

      ertasi     keyingi kalendar kunida qaytdimi
      7 kun      2..7-kunlar oralig'ida kamida bir marta qaytdimi
      har qachon birinchi kundan keyin umuman qaytdimi

    Foiz faqat YETARLI VAQT o'tgan hisoblardan olinadi: kecha kelgan
    odam "7 kunda qaytmadi" deb sanalsa, raqam yolg'on past chiqardi.
    """
    bugun = timezone.localdate()
    bosh_kun = timezone.localtime(boshi).date()
    guruh = {pid: min(k) for pid, k in kunlar_boyicha.items() if min(k) >= bosh_kun}

    def ulush(shart, kerak_kun: int):
        tayyor = [pid for pid, b in guruh.items() if (bugun - b).days >= kerak_kun]
        qaytgan = sum(1 for pid in tayyor if shart(kunlar_boyicha[pid], guruh[pid]))
        return {"n": qaytgan, "jami": len(tayyor),
                "foiz": round(100 * qaytgan / len(tayyor)) if tayyor else None}

    return {
        "yangi": len(guruh),
        "ertasi": ulush(lambda k, b: any((d - b).days == 1 for d in k), 1),
        "hafta": ulush(lambda k, b: any(2 <= (d - b).days <= 7 for d in k), 7),
        "umuman": ulush(lambda k, b: any(d > b for d in k), 1),
    }


def manbalar(boshi, kunlar_boyicha: dict[int, set]) -> list[dict]:
    """
    QAYERDAN kelganlar qanchalik QOLADI.

    Har hisob BIRINCHI kirishidagi manbaga yoziladi. Keyin uch savol:

      bir martalik   faqat bitta kun va bitta ekran — masalan kanaldan
                     kelib, bitta masalani ochib, chiqib ketgan
      ichkariga      boshqa ekranga ham o'tgan (masaladan keyin
                     ro'yxatga, darsga...)
      qaytgan        boshqa KUNI yana kirgan

    "Kanal" qatorida bir martaliklar ko'p bo'lsa — kanal odam olib
    kelyapti, lekin ilova uni ushlab qololmayapti.
    """
    birinchi: dict[int, str] = {}
    for pid, nom in (
        Hodisa.objects.filter(tur=Hodisa.KIRISH, created_at__gte=boshi)
        .order_by("created_at").values_list("pupil_id", "nom").iterator()
    ):
        birinchi.setdefault(pid, nom)
    if not birinchi:
        return []

    ekranlar: dict[int, set] = {}
    for pid, yol in (
        Hodisa.objects.filter(tur=Hodisa.SAHIFA, created_at__gte=boshi, pupil_id__in=list(birinchi))
        .values_list("pupil_id", "yol").distinct().iterator()
    ):
        ekranlar.setdefault(pid, set()).add(yol)

    guruh: dict[str, dict] = {}
    for pid, manba in birinchi.items():
        g = guruh.setdefault(manba, {"kod": manba, "nom": MANBALAR.get(manba, manba),
                                     "odam": 0, "bir_martalik": 0, "ichkariga": 0, "qaytgan": 0})
        g["odam"] += 1
        kunlar = kunlar_boyicha.get(pid, set())
        ekran = ekranlar.get(pid, set())
        if len(kunlar) > 1:
            g["qaytgan"] += 1
        if len(ekran) > 1:
            g["ichkariga"] += 1
        if len(kunlar) <= 1 and len(ekran) <= 1:
            g["bir_martalik"] += 1
    natija = sorted(guruh.values(), key=lambda g: -g["odam"])
    for g in natija:
        for k in ("bir_martalik", "ichkariga", "qaytgan"):
            g[k + "_foiz"] = round(100 * g[k] / g["odam"])
    return natija


def chiqish_nuqtalari(boshi) -> list[dict]:
    """
    Odamlar QAYSI EKRANDA ilovani tashlab ketadi.

    Har hisobning har KUNIDAGI oxirgi ochilgan ekrani olinadi. Bitta
    ekran ro'yxat tepasida bo'lsa — o'sha yerda keyingi qadam yo'q
    yoki u odamni to'xtatib qo'yyapti.
    """
    oxirgi: dict[tuple, str] = {}
    for pid, vaqt, yol in (
        Hodisa.objects.filter(tur=Hodisa.SAHIFA, created_at__gte=boshi)
        .order_by("created_at").values_list("pupil_id", "created_at", "yol").iterator()
    ):
        oxirgi[(pid, timezone.localtime(vaqt).date())] = yol
    sanoq: dict[str, int] = {}
    for yol in oxirgi.values():
        sanoq[yol] = sanoq.get(yol, 0) + 1
    jami = sum(sanoq.values()) or 1
    return [
        {"yol": y, "n": n, "foiz": round(100 * n / jami)}
        for y, n in sorted(sanoq.items(), key=lambda x: -x[1])[:10]
    ]


def kanal_statistikasi(boshi) -> dict:
    """
    KANAL QANCHA ODAM OLIB KELADI — post bo'yicha.

    Uch savol:

      a'zolar     Telegram hisoblaridan nechtasi kanalga a'zo
      postlar     har post ilovaga nechta odam olib keldi va ular
                  masalani yechdimi — qaysi post "ishladi", qaysi yo'q
      soatlar     kanaldan kelish qaysi soatlarda — post vaqti (18:05)
                  to'g'ri tanlanganmi

    Post bo'yicha sanoq `kirish` hodisasining ASL manzilidan olinadi
    (`/masalalar/17`) — ilova uni umumlashtirmay yuboradi.
    """
    from .models import Identity, Masala, MasalaUrinish, TestIshlash, TestToplam

    tg_hisob = Identity.objects.filter(provider=Identity.TELEGRAM).values("pupil").distinct().count()
    azo = Pupil.objects.filter(kanal_azo_at__isnull=False).count()

    kanaldan = Hodisa.objects.filter(tur=Hodisa.KIRISH, nom="kanal", created_at__gte=boshi)
    keldi: dict[str, set] = {}
    soatlar = [0] * 24
    for pid, yol, vaqt in kanaldan.values_list("pupil_id", "yol", "created_at").iterator():
        keldi.setdefault(yol, set()).add(pid)
        soatlar[timezone.localtime(vaqt).hour] += 1

    postlar = []
    for m in Masala.objects.filter(kanal_at__gte=boshi).order_by("-kanal_at")[:20]:
        postlar.append({
            "sana": m.kanal_at, "tur": "Masala", "nom": f"#{m.raqam}",
            "keldi": len(keldi.get(f"/masalalar/{m.pk}", ())),
            "urindi": MasalaUrinish.objects.filter(masala=m).count(),
            "yechdi": m.yechdi_soni, "yoq": m.kanal_yoq,
        })
    for t in TestToplam.objects.filter(kanal_at__gte=boshi).order_by("-kanal_at")[:10]:
        postlar.append({
            "sana": t.kanal_at, "tur": "Test", "nom": t.nom,
            "keldi": len(keldi.get(f"/toplam/{t.pk}", ())),
            "urindi": TestIshlash.objects.filter(toplam=t).count(),
            "yechdi": None, "yoq": False,
        })
    postlar.sort(key=lambda p: p["sana"], reverse=True)

    eng = max(soatlar) or 1
    return {
        "azo": azo, "tg_hisob": tg_hisob,
        "azo_foiz": round(100 * azo / tg_hisob) if tg_hisob else 0,
        "kelgan_odam": len({p for s in keldi.values() for p in s}),
        "postlar": postlar,
        "soatlar": [{"soat": h, "n": n, "foiz": round(100 * n / eng)} for h, n in enumerate(soatlar)],
        "soat_bor": any(soatlar),
    }


#: Auditoriya SEGMENTLARI — "kim" va "bosqich" dan yig'iladi.
#:
#: Nega kerak. Ilova 1–11 sinf uchun qurilgan, lekin anketa boshqa
#: narsani ko'rsatdi: kelganlarning yarmidan ko'pi TALABA. Bu bitta
#: jadvalda ko'rinib turmasa, mahsulot yolg'on tasavvur bilan
#: rivojlanaveradi — darslik sinflarga bo'linadi, o'yin esa bolalar
#: tilida gapiradi, kelgan odam esa yigirma yoshda bo'ladi.
SEGMENT = [
    ("maktab", "Maktab o'quvchisi"),
    ("talaba", "Talaba"),
    ("kattalar", "Kattalar"),
    ("ustoz", "O'qituvchi"),
    ("ota_ona", "Ota-ona"),
]


def _segment(kim: str) -> str:
    if kim == "oquvchi":
        return "maktab"
    if kim in ("talaba", "ustoz", "ota_ona", "kattalar"):
        return kim
    return "kattalar"


def auditoriya() -> dict:
    """
    Kim kirmoqda — segmentlarda va bitta jumlalik xulosa bilan.

    Faqat ANKETA to'ldirganlar bo'yicha: qolganlari haqida hech narsa
    ma'lum emas va ularni "o'quvchi" deb hisoblash eng katta xato
    bo'lardi. Shuning uchun qamrov foizi ham qaytariladi.
    """
    anketali = Pupil.objects.filter(anketa_at__isnull=False).exclude(kim="")
    jami = anketali.count()
    sanoq = {kod: 0 for kod, _ in SEGMENT}
    for kim, n in anketali.values_list("kim").annotate(n=Count("id")):
        sanoq[_segment(kim)] = sanoq.get(_segment(kim), 0) + n

    qatorlar = [{"kod": kod, "nom": nom, "n": sanoq.get(kod, 0),
                 "foiz": round(100 * sanoq.get(kod, 0) / jami) if jami else 0}
                for kod, nom in SEGMENT]
    qatorlar.sort(key=lambda r: -r["n"])

    # Katta yosh = talaba + kattalar + o'qituvchi + ota-ona.
    katta = sum(r["n"] for r in qatorlar if r["kod"] != "maktab")
    katta_foiz = round(100 * katta / jami) if jami else 0
    bola_foiz = 100 - katta_foiz if jami else 0
    if jami < 20:
        xulosa = "Anketa hali kam — xulosa chiqarish erta."
    elif katta_foiz >= 60:
        xulosa = (f"Kelganlarning {katta_foiz}% i KATTA YOSHLI. Ilova esa maktab "
                  "dasturi bo'yicha qurilgan — o'yin va matnlar ikkalasiga ham "
                  "to'g'ri kelishi kerak.")
    elif bola_foiz >= 60:
        xulosa = f"Kelganlarning {bola_foiz}% i maktab o'quvchisi."
    else:
        xulosa = f"Auditoriya aralash: {bola_foiz}% maktab, {katta_foiz}% katta yosh."

    jami_hisob = Pupil.objects.count()
    return {
        "qatorlar": qatorlar,
        "jami": jami,
        "qamrov": round(100 * jami / jami_hisob) if jami_hisob else 0,
        "katta_foiz": katta_foiz,
        "bola_foiz": bola_foiz,
        "xulosa": xulosa,
    }


def oyin_tahlili(boshi) -> dict:
    """
    O'yinlar bo'yicha CHUQURLIK: nechta odam boshladi va qayergacha bordi.

    Sahifa ochilishi ("53 kishi o'yinlar bo'limini ochdi") hech narsa
    demaydi — odam kirib, qarab, chiqib ketgan bo'lishi mumkin. Shuning
    uchun bu yerda o'yinning O'Z yozuvlari sanaladi: karvonda qaysi
    bekatgacha borilgan, kunlik sonda zanjir bormi.
    """
    from .models import KarvonHolat, KunlikSonNatija

    karvon = KarvonHolat.objects.all()
    karvon_jami = karvon.count()
    daraja = [{"nom": f"{d}-daraja", "n": n, "foiz": round(100 * n / karvon_jami) if karvon_jami else 0}
              for d, n in sorted((r["daraja"], r["n"]) for r in
                                 karvon.values("daraja").annotate(n=Count("id")))]
    # Bekat voronkasi: nechta odam shu bekatdan O'TDI.
    voronka = [{"bekat": b, "n": karvon.filter(bekat__gt=b).count()} for b in range(9)]
    for v in voronka:
        v["foiz"] = round(100 * v["n"] / karvon_jami) if karvon_jami else 0

    bugun = timezone.localdate()
    kunlik = KunlikSonNatija.objects.all()
    kunlik_odam = kunlik.values("profile").distinct().count()
    zanjirli = (kunlik.filter(bajardi=True, sana__gte=bugun - timedelta(days=2))
                .values("profile").distinct().count())

    return {
        "karvon": {
            "oynagan": karvon_jami,
            "boshlamagan": karvon.filter(bekat=0).count(),
            "tugatgan": karvon.filter(bekat__gte=9).count(),
            "daraja": daraja,
            "voronka": voronka,
        },
        "kunlik": {
            "oynagan": kunlik_odam,
            "bugun": kunlik.filter(sana=bugun).values("profile").distinct().count(),
            "yechgan_bugun": kunlik.filter(sana=bugun, bajardi=True).values("profile").distinct().count(),
            "zanjirli": zanjirli,
        },
    }


def statistika(kunlar: int = 30) -> dict:
    hozir = timezone.now()
    boshi = hozir - timedelta(days=kunlar)

    hisoblar = Pupil.objects.all()
    jami = hisoblar.count()
    yangi = hisoblar.filter(created_at__gte=boshi).count()
    anketali = hisoblar.filter(anketa_at__isnull=False).exclude(kim="").count()

    hodisa = Hodisa.objects.filter(created_at__gte=boshi)
    faol_hisob = hodisa.values("pupil").distinct().count()

    # Qaytish uchun HAMMA tarix kerak: davr boshida kelgan odamning
    # "birinchi kuni" davrdan oldin bo'lmaganini bilish uchun.
    kunlar_boyicha = _kunlar_boyicha(Hodisa.objects.all())

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
        f["sinf"] = bosqich_nomi(p.anketa_sinf) if p else "—"
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
            "sinf": bosqich_nomi(p.anketa_sinf),
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
        "yonalish_taqsimot": _taqsimot(
            hisoblar.filter(kim="talaba"), "yonalish", YONALISH_NOMI,
            hisoblar.filter(kim="talaba").exclude(yonalish="").count(),
        ),
        "qurilma_taqsimot": _taqsimot(
            hisoblar, "qurilma", qurilmalar, hisoblar.exclude(qurilma="").count(),
        ),
        "sahifalar": sahifalar,
        "tugmalar": tugmalar,
        "faollar": faollar,
        "oxirgilar": oxirgilar,
        "auditoriya": auditoriya(),
        "oyin": oyin_tahlili(boshi),
        "qaytish": qaytish(boshi, kunlar_boyicha),
        "manbalar": manbalar(boshi, kunlar_boyicha),
        "chiqishlar": chiqish_nuqtalari(boshi),
        "kanal": kanal_statistikasi(boshi),
        "yozish_ruxsat": hisoblar.filter(yozish_ruxsat_at__isnull=False).count(),
        "hodisa_soni": hodisa.count(),
        "bosish_soni": hodisa.filter(tur=Hodisa.BOSISH).count(),
    }
