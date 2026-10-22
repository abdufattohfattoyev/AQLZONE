"""
Bilim xaritasi — DTM matematikasi bo'yicha diagnostika va shaxsiy reja.

─────────────────── NEGA YANA BITTA TEST ───────────────────

Aralash variant "nechta to'g'ri" deydi, mavzu testi bitta mavzuni
yopadi. Ikkalasi ham "QAYERDAN boshlay?" degan savolga javob bermaydi:
yangi kelgan abituriyent 13 mavzuning qaysi biri yiqitayotganini bilmaydi
va 13 × 15 = 195 savol ishlab chiqishga hech kim o'tirmaydi.

Diagnostika har mavzudan oz savol beradi va xarita chizadi: kuchli,
o'rta, zaif. Tavsiya va reja shu xaritadan yasaladi.

─────────────────── QISQA VA ANIQLASHTIRISH ───────────────────

Qisqa bosqich — har mavzudan 2 savol (26 ta). Ikki savol mavzuni
ishonchli o'lchamaydi: 1 tasi to'g'ri bo'lsa, bu bilgani ham, omadi ham
bo'lishi mumkin. Shuning uchun natija ikki xil bo'ladi:

    aniq       2/2 yoki 0/2 (taxmin bilan ikkalasini topish ehtimoli 6%),
               yoki 4 va undan ko'p savol berilgan
    taxminiy   qolgani — ekranda shunday yoziladi va "aniqlashtirish"
               taklif qilinadi: o'sha mavzulardan yana 2 tadan savol

─────────────────── SAVOLLAR MIJOZDA ───────────────────

Savollar boshqa testlardagi kabi mijozda bob generatorlaridan yasaladi
(`frontend/src/lib/diagnostika.ts`). Server javobni tekshira olmaydi —
faqat sonlarni chegaralaydi. Bu yerda ahamiyati yo'q: natija hech qanday
mukofot bermaydi va reytingga kirmaydi, faqat odamning o'ziga kerak.

─────────────────── BEPUL VA PREMIUM ───────────────────

Bepul: diagnostikaning o'zi (aniqlashtirish bilan), mavzular bo'yicha
natija, kuchli/zaif tomonlar va bepul darslarga tavsiya.
Premium: 7/14/30 kunlik reja, oldingi natijalar tarixi va solishtirish.
Huquq SERVERDA tekshiriladi (`premium.faolmi`): reja yasash so'rovi
premiumsiz 403 qaytaradi, tarix esa umuman berilmaydi.
"""
from __future__ import annotations

from datetime import timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone

from . import premium as PR
from .models import Diagnostika, ImtihonNatija, OquvReja, Profile

#: Mavzular tartibi — mijozdagi `DTM_MAVZULAR` bilan bir xil
#: (`frontend/src/lib/dtmMavzu.ts`). Tekshiruv: `imtihon.MAVZU_SLUGLAR`
#: bilan to'plam bir xil bo'lishi testda (`test_diagnostika.py`).
MAVZULAR = (
    "ifodalar", "tenglamalar", "tengsizliklar", "funksiyalar", "progressiyalar",
    "trigonometriya", "logarifm", "hosila-integral", "ehtimollik", "uchburchaklar",
    "tortburchak-aylana", "vektorlar", "stereometriya",
)

#: Panel uchun nomlar — mijozdagi `dtmM_*` matnlarining o'zbekchasi.
MAVZU_NOMI = {
    "ifodalar": "Algebraik ifodalar va kasrlar", "tenglamalar": "Tenglamalar va sistemalar",
    "tengsizliklar": "Tengsizliklar", "funksiyalar": "Funksiyalar va grafiklar",
    "progressiyalar": "Progressiyalar", "trigonometriya": "Trigonometriya",
    "logarifm": "Ko'rsatkichli va logarifmik", "hosila-integral": "Hosila va integral",
    "ehtimollik": "Kombinatorika va ehtimollik", "uchburchaklar": "Burchaklar va uchburchaklar",
    "tortburchak-aylana": "To'rtburchak, aylana, yuzlar", "vektorlar": "Koordinatalar va vektorlar",
    "stereometriya": "Stereometriya",
}

#: Baholash qoidalari. Bazada xom son turadi, shuning uchun bu sonlarni
#: o'zgartirish eski natijalarga ham darhol ta'sir qiladi.
KUCHLI = 70   # foiz ≥ shu — kuchli
ZAIF = 40     # foiz < shu — zaif; oralig'i — o'rta

#: Qisqa bosqichda har mavzudan savol, aniqlashtirishda yana shuncha.
QISQA = 2
#: Bir mavzuda eng ko'p savol — mijoz bundan ko'p yubormaydi.
MAX_MAVZU_SAVOL = 8
#: Eng uzoq urinish — 3 soat (savollar cheklanmagan vaqtda ishlanadi).
MAX_SEKUND = 3 * 3600

#: Keyingi tekshiruv — reja bo'lmasa shuncha kundan keyin.
QAYTA_KUN = 14
REJA_KUNLAR = (7, 14, 30)
#: Har reja uzunligida nechta mavzu bilan ishlanadi: har mavzuga ikki kun
#: (dars + test), haftada bir aralash variant va oxirgi kun qayta
#: diagnostika. Ko'proq mavzu sig'dirilsa, har biri yuzaki qolardi.
REJA_MAVZU = {7: 3, 14: 5, 30: 13}

#: Tarixda qaytariladigan urinishlar.
TARIX = 20


class DiagXato(Exception):
    def __init__(self, sabab: str, kod: int = 400):
        super().__init__(sabab)
        self.sabab, self.kod = sabab, kod


# ------------------------------------------------------------- hisob


def foiz(togri: int, jami: int) -> int:
    return round(100 * togri / jami) if jami else 0


def daraja(f: int) -> str:
    return "kuchli" if f >= KUCHLI else "zaif" if f < ZAIF else "orta"


def aniqmi(togri: int, jami: int) -> bool:
    return jami >= 2 * QISQA or (jami >= QISQA and togri in (0, jami))


def mavzu_holati(m: dict) -> dict:
    """Bazadagi xom qatordan ekranga kerakli hamma narsa."""
    f = foiz(m["t"], m["j"])
    # Zaif boblar — xato qilinganlari, ko'p xatolisi oldin.
    boblar = sorted((b for b in m.get("b", []) if b["t"] < b["j"]),
                    key=lambda b: (b["t"] - b["j"], b["k"]))
    return {"slug": m["s"], "togri": m["t"], "jami": m["j"], "foiz": f, "daraja": daraja(f),
            "aniq": aniqmi(m["t"], m["j"]), "zaifBoblar": [b["k"] for b in boblar]}


def umumiy(mavzular: list[dict]) -> int:
    """Mavzular foizining o'rtachasi — har mavzu teng og'irlikda."""
    if not mavzular:
        return 0
    return round(sum(foiz(m["t"], m["j"]) for m in mavzular) / len(mavzular))


# ------------------------------------------------------------- tekshirish


def _butun(x, eng_kam: int, eng_kop: int) -> int | None:
    if isinstance(x, bool):
        return None
    try:
        n = int(x)
    except (TypeError, ValueError):
        return None
    return n if eng_kam <= n <= eng_kop else None


def _bob_kalit(k) -> str | None:
    """`algebra9|3` — kurs id va bob raqami. Boshqa ko'rinish qabul qilinmaydi."""
    if not isinstance(k, str) or len(k) > 40 or k.count("|") != 1:
        return None
    kurs, ui = k.split("|")
    if not kurs or not kurs.replace("-", "").isalnum() or _butun(ui, 0, 40) is None:
        return None
    return k


def toza_mavzular(xom) -> list[dict] | None:
    """
    Mijoz yuborgan mavzular — tekshirilgan, MAVZULAR tartibida.
    Hamma 13 mavzu bo'lishi shart: chala xarita "kuchli tomonlar"ni yolg'on
    ko'rsatardi. Yaroqsiz bo'lsa — `None`.
    """
    if not isinstance(xom, list):
        return None
    topildi: dict[str, dict] = {}
    for q in xom[:len(MAVZULAR) * 2]:
        if not isinstance(q, dict) or q.get("s") not in MAVZULAR or q["s"] in topildi:
            continue
        jami = _butun(q.get("j"), 1, MAX_MAVZU_SAVOL)
        if jami is None:
            return None
        togri = _butun(q.get("t"), 0, jami)
        if togri is None:
            return None
        boblar: list[dict] = []
        bj = bt = 0
        for b in (q.get("b") if isinstance(q.get("b"), list) else [])[:MAX_MAVZU_SAVOL]:
            if not isinstance(b, dict):
                continue
            k = _bob_kalit(b.get("k"))
            j = _butun(b.get("j"), 1, MAX_MAVZU_SAVOL)
            t = _butun(b.get("t"), 0, j or 0) if j else None
            if k and j and t is not None and k not in {x["k"] for x in boblar}:
                boblar.append({"k": k, "t": t, "j": j})
                bj, bt = bj + j, bt + t
        # Boblar yig'indisi mavzuga mos kelmasa — boblar tashlanadi, mavzu qoladi.
        if bj != jami or bt != togri:
            boblar = []
        topildi[q["s"]] = {"s": q["s"], "t": togri, "j": jami, "b": boblar}
    if set(topildi) != set(MAVZULAR):
        return None
    return [topildi[s] for s in MAVZULAR]


# ------------------------------------------------------------- yozish


def yoz(profil: Profile, d: dict) -> Diagnostika:
    """
    Urinishni yozadi yoki (aniqlashtirishdan keyin) yangilaydi.

    Yangilash faqat KO'PAYISHGA: har mavzuda savollar soni kamaymasligi
    kerak. Eski telefon nusxasi yangi natijani ezib qo'ymasin.
    """
    if not isinstance(d, dict):
        raise DiagXato("yaroqsiz")
    vaqt = _butun(d.get("vaqt"), 1, 10 ** 14)
    mavzular = toza_mavzular(d.get("mavzular"))
    if vaqt is None or mavzular is None:
        raise DiagXato("yaroqsiz")
    sekund = _butun(d.get("sekund"), 0, MAX_SEKUND) or 0
    aniq = d.get("aniq") is True
    sinf = profil.pupil.anketa_sinf

    with transaction.atomic():
        bor = Diagnostika.objects.select_for_update().filter(profile=profil, mijoz_vaqt=vaqt).first()
        if bor:
            eski = {m["s"]: m["j"] for m in bor.mavzular}
            if all(m["j"] >= eski.get(m["s"], 0) for m in mavzular):
                bor.mavzular, bor.sekund = mavzular, max(bor.sekund, sekund)
                bor.aniq = bor.aniq or aniq
                bor.updated_at = timezone.now()
                bor.save(update_fields=["mavzular", "sekund", "aniq", "updated_at"])
            return bor
        try:
            with transaction.atomic():
                return Diagnostika.objects.create(profile=profil, sinf=sinf, mavzular=mavzular,
                                                  aniq=aniq, sekund=sekund, mijoz_vaqt=vaqt)
        except IntegrityError:  # bir vaqtda ikki so'rov — ikkinchisi birinchisini oladi
            return Diagnostika.objects.get(profile=profil, mijoz_vaqt=vaqt)


# ------------------------------------------------------------- o'qish


def _sana(dt) -> str:
    """Mahalliy (Toshkent) sana — UTC da kechasi topshirilgan urinish kechagi kun bo'lib qolmasin."""
    return timezone.localtime(dt).date().isoformat()


def natija_json(d: Diagnostika) -> dict:
    holatlar = [mavzu_holati(m) for m in d.mavzular]
    tartib = sorted(holatlar, key=lambda m: (m["foiz"], MAVZULAR.index(m["slug"])))
    return {
        "id": d.pk,
        "vaqt": d.mijoz_vaqt,
        "sana": _sana(d.created_at),
        "sinf": d.sinf,
        "umumiy": umumiy(d.mavzular),
        "aniq": d.aniq,
        "taxminiy": sum(1 for m in holatlar if not m["aniq"]),
        "sekund": d.sekund,
        "mavzular": holatlar,
        # Kuchli — eng yaxshisi oldin; takrorlash kerak — eng zaifi oldin.
        "kuchli": [m["slug"] for m in reversed(tartib) if m["daraja"] == "kuchli"],
        "takror": [m["slug"] for m in tartib if m["daraja"] != "kuchli"],
    }


def _taqqos(hozir: Diagnostika, oldin: Diagnostika) -> dict:
    eski = {m["s"]: foiz(m["t"], m["j"]) for m in oldin.mavzular}
    return {
        "sana": _sana(oldin.created_at),
        "umumiy": umumiy(oldin.mavzular),
        "mavzular": {m["s"]: foiz(m["t"], m["j"]) - eski[m["s"]] for m in hozir.mavzular if m["s"] in eski},
    }


def keyingi_tekshiruv(d: Diagnostika, reja: OquvReja | None):
    """Reja bo'lsa — uning oxirgi kuni, aks holda QAYTA_KUN dan keyin."""
    if reja and reja.diagnostika_id == d.pk:
        return timezone.localtime(reja.created_at).date() + timedelta(days=reja.kun - 1)
    return timezone.localtime(d.created_at).date() + timedelta(days=QAYTA_KUN)


def holat(profil: Profile) -> dict:
    """Diagnostika sahifasi uchun hamma narsa bitta so'rovda."""
    premium = PR.faolmi(profil.pupil)
    royxat = list(Diagnostika.objects.filter(profile=profil).order_by("-created_at", "-pk")[:TARIX])
    oxirgi = royxat[0] if royxat else None
    reja = OquvReja.objects.filter(profile=profil).order_by("-created_at", "-pk").first()
    javob: dict = {
        "premium": premium,
        "ism": profil.name or profil.pupil.first_name or "",
        "sinf": profil.pupil.anketa_sinf,
        "kim": profil.pupil.kim,
        "soni": Diagnostika.objects.filter(profile=profil).count(),
        "oxirgi": natija_json(oxirgi) if oxirgi else None,
        "keyingi": keyingi_tekshiruv(oxirgi, reja).isoformat() if oxirgi else None,
        "oldingi": None,
        "tarix": [],
        "reja": None,
    }
    if premium:
        if len(royxat) > 1:
            javob["oldingi"] = _taqqos(royxat[0], royxat[1])
        javob["tarix"] = [{"id": d.pk, "sana": _sana(d.created_at), "umumiy": umumiy(d.mavzular)}
                          for d in royxat]
        if reja:
            javob["reja"] = reja_json(reja)
    return javob


# ------------------------------------------------------------- reja


def _keyingi_variant(profil: Profile, slug: str | None, olingan: set[int]) -> int:
    """
    Hali ishlanmagan eng kichik variant: mavzu testida `slug` bo'yicha,
    aralash DTM da (`slug=None`). Hammasi ishlangan bo'lsa — birinchidan
    qaytadan (o'sishni solishtirish ham foydali mashq).
    """
    from . import imtihon as IM

    if slug:
        qs = ImtihonNatija.objects.filter(profile=profil, tur=IM.MAVZU_TUR, kurs=slug)
        soni = IM.MAVZU_VARIANTLAR
    else:
        qs = ImtihonNatija.objects.filter(profile=profil, tur="", kurs="")
        soni = IM.VARIANTLAR
    ishlangan = set(qs.values_list("variant", flat=True)) | olingan
    for v in range(1, soni + 1):
        if v not in ishlangan:
            return v
    return 1 + len(olingan) % soni


def reja_yasa(profil: Profile, kun: int) -> OquvReja:
    """
    Oxirgi diagnostikadan reja yasaydi. Premiumsiz — 403.

    Kunlar shunday to'ldiriladi:
      * oxirgi kun — qayta diagnostika (o'sish ko'rinsin)
      * har 7-kun — aralash DTM varianti (mavzular imtihonda yonma-yon keladi)
      * qolgan kunlar navbat bilan: zaif mavzu → o'rta mavzu, har biriga
        avval DARS (eng ko'p xato qilingan bob), ertasiga shu mavzu TESTI
      * kun ortib qolsa — eng zaif mavzulardan keyingi test varianti
    """
    if kun not in REJA_KUNLAR:
        raise DiagXato("kun")
    if not PR.faolmi(profil.pupil):
        raise DiagXato("premium", 403)
    d = Diagnostika.objects.filter(profile=profil).order_by("-created_at", "-pk").first()
    if not d:
        raise DiagXato("diagnostika_yoq", 404)

    holatlar = [mavzu_holati(m) for m in d.mavzular]
    navbat = sorted((m for m in holatlar if m["daraja"] != "kuchli"),
                    key=lambda m: (m["foiz"], MAVZULAR.index(m["slug"])))[:REJA_MAVZU[kun]]
    # Hammasi kuchli — mavzu ishi yo'q, faqat aralash variantlar va eng
    # pastroq natijali mavzularni ushlab turish.
    if not navbat:
        navbat = sorted(holatlar, key=lambda m: (m["foiz"], MAVZULAR.index(m["slug"])))[:2]

    olingan: dict[str | None, set[int]] = {}

    def variant(slug: str | None) -> int:
        v = _keyingi_variant(profil, slug, olingan.setdefault(slug, set()))
        olingan[slug].add(v)
        return v

    ishlar: list[dict] = []
    for m in navbat:
        ishlar.append({"tur": "dars", "s": m["slug"], "bob": (m["zaifBoblar"] or [None])[0]})
        ishlar.append({"tur": "test", "s": m["slug"]})
    vazifalar: list[dict] = []
    takror = 0
    for k in range(1, kun + 1):
        if k == kun:
            v = {"tur": "qayta"}
        elif k % 7 == 0:
            v = {"tur": "aralash", "v": variant(None)}
        elif ishlar:
            v = ishlar.pop(0)
        else:
            m = navbat[takror % len(navbat)]
            takror += 1
            v = {"tur": "test", "s": m["slug"]}
        if v["tur"] == "test":
            v["v"] = variant(v["s"])
        vazifalar.append({"kun": k, **{a: b for a, b in v.items() if b is not None}, "ok": False})

    return OquvReja.objects.create(profile=profil, diagnostika=d, kun=kun, vazifalar=vazifalar)


def _avto_bajarilgan(reja: OquvReja) -> set[int]:
    """Test, aralash va qayta vazifalar — natija bazada bo'lsa o'zi bajarilgan."""
    from . import imtihon as IM

    profil = reja.profile
    natijalar = set(ImtihonNatija.objects.filter(profile=profil, created_at__gte=reja.created_at)
                    .values_list("tur", "kurs", "variant"))
    qayta = Diagnostika.objects.filter(profile=profil, created_at__gte=reja.created_at).exists()
    r = set()
    for i, v in enumerate(reja.vazifalar):
        if (v["tur"] == "test" and (IM.MAVZU_TUR, v["s"], v["v"]) in natijalar
                or v["tur"] == "aralash" and ("", "", v["v"]) in natijalar
                or v["tur"] == "qayta" and qayta):
            r.add(i)
    return r


def reja_json(reja: OquvReja) -> dict:
    avto = _avto_bajarilgan(reja)
    bugun = timezone.localdate()
    boshi = timezone.localtime(reja.created_at).date()
    vazifalar = [{**v, "ok": v.get("ok", False) or i in avto, "sana": (boshi + timedelta(days=v["kun"] - 1)).isoformat()}
                 for i, v in enumerate(reja.vazifalar)]
    return {
        "id": reja.pk,
        "kun": reja.kun,
        "boshi": boshi.isoformat(),
        # 1 dan boshlanadi; reja tugagan bo'lsa — oxirgi kundan katta.
        "bugun": (bugun - boshi).days + 1,
        "bajarildi": sum(1 for v in vazifalar if v["ok"]),
        "vazifalar": vazifalar,
    }


def reja_belgila(profil: Profile, reja_id, indeks, ok: bool) -> dict:
    """Vazifani qo'lda belgilash (dars vazifasi uchun). Premiumsiz — 403."""
    if not PR.faolmi(profil.pupil):
        raise DiagXato("premium", 403)
    with transaction.atomic():
        reja = OquvReja.objects.select_for_update().filter(profile=profil, pk=_butun(reja_id, 1, 10 ** 12)).first()
        if not reja:
            raise DiagXato("reja_yoq", 404)
        i = _butun(indeks, 0, len(reja.vazifalar) - 1)
        if i is None:
            raise DiagXato("yaroqsiz")
        reja.vazifalar[i]["ok"] = bool(ok)
        reja.save(update_fields=["vazifalar"])
    return reja_json(reja)


# ------------------------------------------------------------- panel


def panel_statistika(kunlar: int = 30) -> dict:
    """
    Boshqaruv paneli — faqat umumlashtirilgan sonlar, hech kimning ismi yo'q.

    Yakunlash foizi: "Diagnostika: boshlash" tugmasini bosgan odamlardan
    nechtasi natija yozdi (`Hodisa` — `data-tahlil` nomi).
    """
    from .models import Hodisa

    boshi = timezone.now() - timedelta(days=kunlar)
    qs = Diagnostika.objects.filter(created_at__gte=boshi)
    odamlar = set(qs.values_list("profile__pupil_id", flat=True))
    boshlagan = set(Hodisa.objects.filter(created_at__gte=boshi, tur="bosish", nom="Diagnostika: boshlash")
                    .values_list("pupil_id", flat=True))
    yig: dict[str, list[int]] = {s: [0, 0] for s in MAVZULAR}
    darajalar = {"kuchli": 0, "orta": 0, "zaif": 0}
    umumiylar: list[int] = []
    for mavzular in qs.values_list("mavzular", flat=True):
        umumiylar.append(umumiy(mavzular))
        for m in mavzular:
            if m["s"] in yig:
                yig[m["s"]][0] += m["t"]
                yig[m["s"]][1] += m["j"]
                darajalar[daraja(foiz(m["t"], m["j"]))] += 1
    mavzu_qatorlar = sorted(({"slug": s, "nom": MAVZU_NOMI[s], "foiz": foiz(t, j), "savol": j} for s, (t, j) in yig.items() if j),
                            key=lambda x: x["foiz"])
    rejalar = OquvReja.objects.filter(created_at__gte=boshi)
    jami_vazifa = bajarilgan = 0
    for r in rejalar.select_related("profile"):
        jami_vazifa += len(r.vazifalar)
        bajarilgan += len(_avto_bajarilgan(r) | {i for i, v in enumerate(r.vazifalar) if v.get("ok")})
    return {
        "kunlar": kunlar,
        "soni": qs.count(),
        "aniq": qs.filter(aniq=True).count(),
        "odamlar": len(odamlar),
        "boshlagan": len(boshlagan),
        "yakunlash": foiz(len(odamlar & boshlagan), len(boshlagan)) if boshlagan else None,
        "ortacha": round(sum(umumiylar) / len(umumiylar)) if umumiylar else None,
        "mavzular": mavzu_qatorlar,
        "darajalar": darajalar,
        "rejalar": rejalar.count(),
        "reja_bajarilish": foiz(bajarilgan, jami_vazifa) if jami_vazifa else None,
        "qoidalar": {"kuchli": KUCHLI, "zaif": ZAIF, "qisqa": QISQA, "qayta_kun": QAYTA_KUN},
    }
