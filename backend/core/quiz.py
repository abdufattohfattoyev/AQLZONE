"""
QUIZ — foydalanuvchi yig'adigan savollar to'plami (`models.Quiz`).

──────────────────────────── IKKI REJIM ────────────────────────────

    o'z tezligida   Quizizz kabi: havolani ochgan odam darhol boshlaydi,
                    umumiy soat bilan. Javoblar OXIRIDA bir so'rovda
                    keladi va server tekshiradi (`topshir`).
    jonli           Kahoot kabi: muallif o'yin ochadi (`jonli_och`),
                    hamma kod bilan kiradi, savollarni BOSHLOVCHI suradi
                    (`keyingi`). Tez va to'g'ri javob ko'proq ball oladi.

Ikkalasi ham BITTA kod bilan ochiladi: kod egasi jonli o'yin ochgan
bo'lsa — o'yinga, bo'lmasa — o'z tezligida yechishga. Odam ikki xil
kodni eslab qolishi shart emas.

──────────────────────── JAVOB SERVERDA ────────────────────────

Mijozga savol JAVOBSIZ ketadi (`_ochiq_savol`). To'g'ri javob faqat
topshirilgandan keyin (o'z tezligida) yoki savol yopilgandan keyin
(jonli) ko'rinadi. Aks holda tarmoq oynasini ochgan bola har doim
birinchi bo'lardi.

──────────────────────── BOLALAR XAVFSIZLIGI ────────────────────────

Chat yo'q, ochiq ro'yxat yo'q — quiz faqat kod bilan topiladi. Ismlar
`duel.korinadigan_ism` orqali: profil taxallusi, haqiqiy ism emas.
"""
from __future__ import annotations

import json
import secrets
import time
from datetime import timedelta

from django.db import IntegrityError, transaction
from django.db.models import F
from django.utils import timezone

from .models import Profile, Quiz, QuizOyin, QuizQatnash, javob_teng
from .sinf import KOD_HARF

KOD_UZUN = 6

MAX_SAVOL = 40
MAX_MATN = 500
MAX_VARIANT_MATN = 100
MIN_VARIANT, MAX_VARIANT = 2, 6
#: Jonli o'yinda bitta savolga beriladigan vaqt (soniya) — tanlov shulardan.
VAQTLAR = (10, 20, 30, 60, 90)
STANDART_VAQT = 20

#: Bir profil shuncha quiz saqlay oladi va kuniga shunchasini yarata oladi.
#: Chegara bazani himoya qiladi: ochiq ro'yxat yo'q, ya'ni minglab quiz
#: hech kimga foyda bermaydi.
MUALLIF_CHEK = 200
KUNLIK_CHEK = 30

#: Jonli o'yinda ishtirokchi chegarasi — bitta maktab zali.
OYIN_ODAM_CHEK = 200
#: Shuncha soatdan keyin ochiq qolgan jonli o'yin o'z-o'zidan eskiradi.
OYIN_SOAT = 6
#: Savol vaqti tugagandan keyin tarmoq kechikishi uchun beriladigan muhlat.
KECHIKISH = 1.5
#: Jonli o'yin bali: to'g'ri javob 500..1000, tezroq — ko'proq.
BALL_MAX = 1000
#: Shuncha soniya so'rov yubormagan ishtirokchi "ketgan" hisoblanadi —
#: "hamma javob berdi" sanog'iga kirmaydi.
KETGAN = 12

#: Bazadan olingan savol chizmasida ruxsat etilmagan turlar va kalitlar.
#: `rasmiy` turidagi `rasm` — SVG matni va `QuestionView` uni
#: `dangerouslySetInnerHTML` bilan chizadi. O'zimizning generator uchun
#: bu xavfsiz, foydalanuvchi yuborgan JSON uchun esa — yo'q.
TAQIQ_TUR = {"rasmiy"}
TAQIQ_KALIT = {"rasm", "answer", "choices", "yechim", "joy"}
MAX_CHIZMA = 3000


class QuizXato(Exception):
    def __init__(self, sabab: str, kod: int = 400):
        super().__init__(sabab)
        self.sabab, self.kod = sabab, kod


def _hozir() -> float:
    return time.time()


def _ism(p: Profile) -> str:
    from .duel import korinadigan_ism
    return korinadigan_ism(p)[:40]


def _yangi_kod() -> str:
    for _ in range(20):
        kod = "".join(secrets.choice(KOD_HARF) for _ in range(KOD_UZUN))
        if not Quiz.objects.filter(kod=kod).exists():
            return kod
    raise QuizXato("kod_yasalmadi", 500)


# ------------------------------------------------------------------ savollar


def _matn(v, chek: int) -> str:
    return str(v if v is not None else "").strip()[:chek]


def _chizma(a) -> dict | None:
    """
    Bazadan olingan savolning chizmasi — faqat ruxsat etilgan qismi.

    Javob va variantlar CHIZMADAN olib tashlanadi: ular savolning o'zida
    alohida turadi va mijozga javobsiz ketishi kerak. Chizmada qolsa,
    javob `a.answer` orqali sizib chiqardi.
    """
    if not isinstance(a, dict):
        return None
    tur = a.get("type")
    if not isinstance(tur, str) or tur in TAQIQ_TUR:
        return None
    toza = {k: v for k, v in a.items() if k not in TAQIQ_KALIT}
    try:
        matn = json.dumps(toza, ensure_ascii=False)
    except (TypeError, ValueError):
        return None
    # `url(` — rang maydoni `style` ga tushadi va tashqi manzilni ochirardi.
    if len(matn) > MAX_CHIZMA or "url(" in matn.lower():
        return None
    return toza


def savol_tozala(s) -> dict:
    """Bitta savolni tekshiradi va saqlanadigan ko'rinishga keltiradi."""
    if not isinstance(s, dict):
        raise QuizXato("savol_xato")
    tur = "yozma" if s.get("tur") == "yozma" else "variant"
    matn = _matn(s.get("matn"), MAX_MATN)
    if not matn:
        raise QuizXato("savol_matn")
    javob = _matn(s.get("javob"), MAX_VARIANT_MATN)
    if not javob:
        raise QuizXato("savol_javob")
    try:
        vaqt = int(s.get("vaqt") or STANDART_VAQT)
    except (TypeError, ValueError):
        vaqt = STANDART_VAQT
    if vaqt not in VAQTLAR:
        vaqt = STANDART_VAQT

    variantlar: list[str] = []
    if tur == "variant":
        xom = s.get("variantlar")
        if not isinstance(xom, list):
            raise QuizXato("savol_variant")
        for v in xom[:MAX_VARIANT]:
            v = _matn(v, MAX_VARIANT_MATN)
            if v and v not in variantlar:
                variantlar.append(v)
        if len(variantlar) < MIN_VARIANT or javob not in variantlar:
            raise QuizXato("savol_variant")

    toza = {"tur": tur, "matn": matn, "variantlar": variantlar, "javob": javob, "vaqt": vaqt}
    a = _chizma(s.get("a"))
    if a is not None:
        toza["a"] = a
    return toza


def savollar_tozala(xom) -> list[dict]:
    if not isinstance(xom, list) or not xom:
        raise QuizXato("savol_yoq")
    if len(xom) > MAX_SAVOL:
        raise QuizXato("savol_kop")
    return [savol_tozala(s) for s in xom]


def _ochiq_savol(s: dict) -> dict:
    """Mijozga ketadigan savol — JAVOBSIZ."""
    d = {"tur": s["tur"], "matn": s["matn"], "variantlar": s["variantlar"], "vaqt": s["vaqt"]}
    if s.get("a"):
        d["a"] = s["a"]
    return d


def togrimi(s: dict, javob) -> bool:
    if javob is None:
        return False
    javob = str(javob).strip()[:MAX_VARIANT_MATN]
    if not javob:
        return False
    if s["tur"] == "variant":
        return javob == s["javob"]
    return javob_teng(javob, s["javob"])


# ------------------------------------------------------------------ muallif


def _nom(nom) -> str:
    nom = _matn(nom, 80)
    if len(nom) < 2:
        raise QuizXato("nom_qisqa")
    return nom


def _rejim(r) -> str:
    return Quiz.JONLI if r == Quiz.JONLI else Quiz.OZ


def yarat(profil: Profile, data: dict) -> Quiz:
    nom = _nom(data.get("nom"))
    savollar = savollar_tozala(data.get("savollar"))
    if Quiz.objects.filter(muallif=profil).count() >= MUALLIF_CHEK:
        raise QuizXato("quiz_kop")
    if Quiz.objects.filter(muallif=profil, created_at__gte=timezone.now() - timedelta(days=1)).count() \
            >= KUNLIK_CHEK:
        raise QuizXato("kunlik_chek", 429)
    for _ in range(3):
        try:
            with transaction.atomic():
                return Quiz.objects.create(muallif=profil, kod=_yangi_kod(), nom=nom,
                                           rejim=_rejim(data.get("rejim")), savollar=savollar)
        except IntegrityError:
            continue
    raise QuizXato("kod_yasalmadi", 500)


def meniki(profil: Profile, qid: int) -> Quiz:
    q = Quiz.objects.filter(pk=qid, muallif=profil).first()
    if q is None:
        raise QuizXato("topilmadi", 404)
    return q


@transaction.atomic
def yangila(profil: Profile, qid: int, data: dict) -> Quiz:
    """
    Tahrirlash. Savollar O'ZGARSA — o'z tezligidagi natijalar o'chadi.

    Eski natija boshqa savollarga berilgan: "o'rtacha 7/10" yangi quizda
    yolg'on bo'lardi. Mijoz buni oldindan ogohlantiradi (`QuizMuharrir`).
    Jonli o'yinlar tarixi qoladi — u o'tgan darsning yozuvi.
    """
    q = Quiz.objects.select_for_update().get(pk=meniki(profil, qid).pk)
    q.nom = _nom(data.get("nom", q.nom))
    q.rejim = _rejim(data.get("rejim", q.rejim))
    maydonlar = ["nom", "rejim", "updated_at"]
    if "savollar" in data:
        yangi = savollar_tozala(data.get("savollar"))
        if yangi != q.savollar:
            q.savollar = yangi
            q.qatnashlar.filter(oyin__isnull=True).delete()
            q.ishlagan_soni = q.togri_jami = 0
            maydonlar += ["savollar", "ishlagan_soni", "togri_jami"]
    q.updated_at = timezone.now()
    q.save(update_fields=maydonlar)
    return q


def ochir(profil: Profile, qid: int) -> None:
    meniki(profil, qid).delete()


def _bot() -> str:
    from django.conf import settings
    return (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")


def havola(q: Quiz) -> str:
    """Mini App'ni AYNAN shu quizga ochadi (`components/BotdanKelgan.tsx`)."""
    bot = _bot()
    return f"https://t.me/{bot}?startapp=quiz_{q.kod}" if bot else ""


def qisqa_json(q: Quiz) -> dict:
    return {"id": q.pk, "kod": q.kod, "nom": q.nom, "rejim": q.rejim, "savol": len(q.savollar),
            "ishlagan": q.ishlagan_soni, "ortacha": q.ortacha, "yangilangan": q.updated_at.isoformat()}


def royxat(profil: Profile) -> list[dict]:
    return [qisqa_json(q) for q in Quiz.objects.filter(muallif=profil).order_by("-updated_at")[:MUALLIF_CHEK]]


def muallif_json(q: Quiz) -> dict:
    """Muallif ko'rinishi: savollar JAVOBI bilan (tahrirlash uchun) va natijalar."""
    natijalar = [
        {"ism": n.ism, "togri": n.togri, "sekund": n.sekund, "sana": n.created_at.isoformat()}
        for n in q.qatnashlar.filter(oyin__isnull=True).order_by("-togri", "sekund", "created_at")[:300]
    ]
    faol = _faol_oyin(q)
    return {**qisqa_json(q), "savollar": q.savollar, "havola": havola(q), "natijalar": natijalar,
            "jonli": faol.pk if faol else None}


# ------------------------------------------------------------------ o'z tezligida


def kod_bilan(kod: str) -> Quiz:
    q = Quiz.objects.select_related("muallif").filter(kod=(kod or "").strip().upper()[:8]).first()
    if q is None:
        raise QuizXato("topilmadi", 404)
    return q


def _mening(q: Quiz, profil: Profile) -> dict | None:
    n = q.qatnashlar.filter(oyin__isnull=True, profile=profil).first()
    if n is None:
        return None
    past = q.qatnashlar.filter(oyin__isnull=True, togri__lt=n.togri).count()
    boshqalar = max(q.ishlagan_soni - 1, 0)
    return {"togri": n.togri, "jami": len(q.savollar), "sekund": n.sekund,
            # Foiz — o'rin emas (`test_toplam.statistika` dagi sabab).
            "yaxshiroqFoiz": round(past * 100 / boshqalar) if boshqalar else None}


def umumiy_vaqt(q: Quiz) -> int:
    """O'z tezligida umumiy soat — savollar vaqtining yig'indisi, soniya."""
    return sum(s["vaqt"] for s in q.savollar)


def ochiq_json(q: Quiz, profil: Profile) -> dict:
    """
    Yechuvchi ko'rinishi.

    Jonli rejimdagi quizda savollar o'yin boshlanmaguncha YUBORILMAYDI:
    kodni oldindan olgan bola ularni o'qib, javobini tayyorlab kelardi.
    """
    faol = _faol_oyin(q)
    oz = q.rejim == Quiz.OZ
    return {
        "id": q.pk, "kod": q.kod, "nom": q.nom, "rejim": q.rejim,
        "savol": len(q.savollar), "soniya": umumiy_vaqt(q),
        "muallif": _ism(q.muallif), "meniki": q.muallif_id == profil.pk,
        "savollar": [_ochiq_savol(s) for s in q.savollar] if oz else [],
        "ishlagan": q.ishlagan_soni, "ortacha": q.ortacha,
        "mening": _mening(q, profil),
        "jonli": faol.pk if faol else None,
        "havola": havola(q),
    }


def topshir(q: Quiz, profil: Profile, javoblar, sekund) -> dict:
    """
    O'z tezligida yechilgan quizni tekshiradi.

    Faqat BIRINCHI urinish yoziladi va muallifning o'zi sanalmaydi — u
    tekshirish uchun yechadi (`masala.korildi` dagi sabab). Qayta yechgan
    odam ham natijasini va to'g'ri javoblarni ko'radi.
    """
    if q.rejim != Quiz.OZ:
        raise QuizXato("jonli_rejim")
    if not isinstance(javoblar, list):
        javoblar = []
    savollar = q.savollar
    tahlil, togri = [], 0
    for i, s in enumerate(savollar):
        j = javoblar[i] if i < len(javoblar) else None
        t = togrimi(s, j)
        togri += t
        tahlil.append({"togri": t, "javob": s["javob"],
                       "sizniki": None if j is None else str(j)[:MAX_VARIANT_MATN]})
    try:
        sekund = max(0, min(int(sekund), umumiy_vaqt(q) + 60))
    except (TypeError, ValueError):
        sekund = 0

    birinchi = False
    if q.muallif_id != profil.pk:
        with transaction.atomic():
            _, birinchi = QuizQatnash.objects.get_or_create(
                quiz=q, oyin=None, profile=profil,
                defaults={"ism": _ism(profil), "togri": togri, "sekund": sekund,
                          "javoblar": [{"j": x["sizniki"], "t": x["togri"]} for x in tahlil]},
            )
            if birinchi:
                Quiz.objects.filter(pk=q.pk).update(ishlagan_soni=F("ishlagan_soni") + 1,
                                                    togri_jami=F("togri_jami") + togri)
        q.refresh_from_db(fields=["ishlagan_soni", "togri_jami"])
    return {"togri": togri, "jami": len(savollar), "sekund": sekund, "birinchi": birinchi,
            "tahlil": tahlil, "ishlagan": q.ishlagan_soni, "ortacha": q.ortacha,
            "mening": _mening(q, profil)}


# ------------------------------------------------------------------ jonli o'yin


def _faol_oyin(q: Quiz) -> QuizOyin | None:
    return (q.oyinlar.exclude(holat=QuizOyin.TUGADI)
            .filter(created_at__gte=timezone.now() - timedelta(hours=OYIN_SOAT))
            .order_by("-created_at").first())


@transaction.atomic
def jonli_och(profil: Profile, qid: int) -> QuizOyin:
    """
    Yangi jonli o'yin. Avvalgi tugamagan o'yin yopiladi — bitta kod
    bitta paytda bitta o'yinga olib borsin.
    """
    q = meniki(profil, qid)
    q.oyinlar.exclude(holat=QuizOyin.TUGADI).update(holat=QuizOyin.TUGADI, tugadi_at=timezone.now())
    return QuizOyin.objects.create(quiz=q)


def oyin_ol(oid: int) -> QuizOyin:
    o = QuizOyin.objects.select_related("quiz").filter(pk=oid).first()
    if o is None:
        raise QuizXato("topilmadi", 404)
    return o


def _boshlovchimi(o: QuizOyin, profil: Profile) -> bool:
    return o.quiz.muallif_id == profil.pk


def qatnash_ol(o: QuizOyin, profil: Profile) -> QuizQatnash | None:
    return o.qatnashlar.filter(profile=profil).first()


#: Jonli o'yindagi taxallus uzunligi — ekranda reyting qatoriga sig'sin.
TAXALLUS_UZUN = 20


def oldindan_ism(profil: Profile) -> str:
    """
    Kirish oynasida oldindan yozilgan taxallus — profil nomi.

    Nomsiz profil uchun bo'sh: `korinadigan_ism` ning "Do'stingiz" degani
    o'ttiz kishilik sinfda o'ttizta bir xil qator bo'lib qolardi.
    """
    from .duel import OZIM_NOMLARI
    nom = (profil.name or "").strip()
    return "" if not nom or nom.lower() in OZIM_NOMLARI else nom[:TAXALLUS_UZUN]


def _taxallus(o: QuizOyin, xom, profil: Profile) -> str:
    """
    Kahoot'dagi kabi har kim o'yinga TAXALLUS bilan kiradi. Bir xil
    taxallusga raqam qo'shiladi ("Ali", "Ali 2") — boshlovchi va
    reyting kim kimligini ajrata olsin.
    """
    ism = " ".join(str(xom or "").split())[:TAXALLUS_UZUN] or oldindan_ism(profil) or _ism(profil)
    band = set(o.qatnashlar.values_list("ism", flat=True))
    if ism not in band:
        return ism
    for n in range(2, OYIN_ODAM_CHEK + 2):
        nomzod = f"{ism[:TAXALLUS_UZUN - 4]} {n}"
        if nomzod not in band:
            return nomzod
    return ism


@transaction.atomic
def kir(o: QuizOyin, profil: Profile, ism=None) -> QuizQatnash:
    """
    O'yinga kirish. Boshlangandan keyin ham kirsa bo'ladi — kech qolgan
    bola o'tgan savollarga ball olmaydi, xolos. Kahoot'da ham shunday:
    eshikdan kirgan o'quvchini darsdan haydab bo'lmaydi.
    """
    o = QuizOyin.objects.select_for_update().select_related("quiz").get(pk=o.pk)
    if o.holat == QuizOyin.TUGADI:
        raise QuizXato("tugagan", 409)
    if _boshlovchimi(o, profil):
        raise QuizXato("boshlovchi", 409)
    bor = qatnash_ol(o, profil)
    if bor:
        return bor
    if o.qatnashlar.count() >= OYIN_ODAM_CHEK:
        raise QuizXato("tola", 409)
    return QuizQatnash.objects.create(quiz=o.quiz, oyin=o, profile=profil, ism=_taxallus(o, ism, profil))


def _savol(o: QuizOyin) -> dict | None:
    s = o.quiz.savollar
    return s[o.joriy] if 0 <= o.joriy < len(s) else None


def _faollar(o: QuizOyin) -> list[QuizQatnash]:
    eski = timezone.now() - timedelta(seconds=KETGAN)
    return list(o.qatnashlar.filter(belgi__gte=eski))


def _javob_berdi(n: QuizQatnash, i: int) -> bool:
    return i < len(n.javoblar) and n.javoblar[i] is not None


@transaction.atomic
def tick(o: QuizOyin, qatnash: QuizQatnash | None = None) -> QuizOyin:
    """
    Vaqtni suradi: savol vaqti tugadimi yoki ekran oldidagi hamma javob
    berdimi — savol yopiladi. Keyingi savolni faqat boshlovchi ochadi:
    u sinfga to'g'ri javobni tushuntirib olishi mumkin.
    """
    if qatnash is not None:
        QuizQatnash.objects.filter(pk=qatnash.pk).update(belgi=timezone.now())
    o = QuizOyin.objects.select_for_update().select_related("quiz").get(pk=o.pk)
    if o.holat == QuizOyin.KUTISH and o.created_at < timezone.now() - timedelta(hours=OYIN_SOAT):
        o.holat, o.tugadi_at = QuizOyin.TUGADI, timezone.now()
        o.save(update_fields=["holat", "tugadi_at"])
        return o
    if o.holat != QuizOyin.SAVOL:
        return o
    s = _savol(o)
    vaqt_tugadi = s is None or _hozir() - o.savol_vaqt > s["vaqt"] + KECHIKISH
    faollar = _faollar(o)
    hamma = bool(faollar) and all(_javob_berdi(n, o.joriy) for n in faollar)
    if vaqt_tugadi or hamma:
        o.holat = QuizOyin.NATIJA
        o.save(update_fields=["holat"])
    return o


@transaction.atomic
def keyingi(o: QuizOyin, profil: Profile) -> QuizOyin:
    """
    Boshlovchining yagona tugmasi — holatga qarab:
    kutish → 1-savol, savol → yopish, natija → keyingi savol yoki tugash.
    """
    o = QuizOyin.objects.select_for_update().select_related("quiz").get(pk=o.pk)
    if not _boshlovchimi(o, profil):
        raise QuizXato("boshlovchi_emas", 403)
    if o.holat == QuizOyin.TUGADI:
        return o
    if o.holat == QuizOyin.SAVOL:
        o.holat = QuizOyin.NATIJA
        o.save(update_fields=["holat"])
        return o
    if o.holat == QuizOyin.KUTISH and not o.qatnashlar.exists():
        raise QuizXato("hech_kim", 409)
    if o.joriy + 1 >= len(o.quiz.savollar):
        o.holat, o.tugadi_at = QuizOyin.TUGADI, timezone.now()
        o.save(update_fields=["holat", "tugadi_at"])
        return o
    o.joriy += 1
    o.holat = QuizOyin.SAVOL
    o.savol_vaqt = _hozir()
    o.save(update_fields=["joriy", "holat", "savol_vaqt"])
    return o


@transaction.atomic
def tugat(o: QuizOyin, profil: Profile) -> None:
    o = QuizOyin.objects.select_for_update().select_related("quiz").get(pk=o.pk)
    if not _boshlovchimi(o, profil):
        raise QuizXato("boshlovchi_emas", 403)
    if o.holat != QuizOyin.TUGADI:
        o.holat, o.tugadi_at = QuizOyin.TUGADI, timezone.now()
        o.save(update_fields=["holat", "tugadi_at"])


def ball_hisobla(sarf: float, vaqt: int) -> int:
    """To'g'ri javob bali: darhol — 1000, oxirgi soniyada — 500."""
    ulush = min(max(sarf / vaqt, 0.0), 1.0)
    return round(BALL_MAX * (1 - ulush / 2))


@transaction.atomic
def javob(o: QuizOyin, qatnash: QuizQatnash, i, j) -> QuizQatnash:
    o = QuizOyin.objects.select_for_update().select_related("quiz").get(pk=o.pk)
    try:
        i = int(i)
    except (TypeError, ValueError):
        raise QuizXato("savol_emas") from None
    if o.holat != QuizOyin.SAVOL or i != o.joriy:
        raise QuizXato("yopiq", 409)
    s = _savol(o)
    sarf = _hozir() - o.savol_vaqt
    if s is None or sarf > s["vaqt"] + KECHIKISH:
        raise QuizXato("vaqt", 409)
    n = QuizQatnash.objects.select_for_update().get(pk=qatnash.pk)
    if _javob_berdi(n, i):
        raise QuizXato("berilgan", 409)
    t = togrimi(s, j)
    b = ball_hisobla(sarf, s["vaqt"]) if t else 0
    javoblar = list(n.javoblar) + [None] * max(0, i + 1 - len(n.javoblar))
    javoblar[i] = {"j": str(j)[:MAX_VARIANT_MATN], "t": t, "b": b, "s": round(min(sarf, s["vaqt"]), 1)}
    n.javoblar = javoblar
    n.togri += t
    n.ball += b
    n.sekund = round(sum((x or {}).get("s", 0) for x in javoblar))
    n.belgi = timezone.now()
    n.save(update_fields=["javoblar", "togri", "ball", "sekund", "belgi"])
    return n


def _reyting(o: QuizOyin, chek: int | None = None) -> list[QuizQatnash]:
    qs = o.qatnashlar.order_by("-ball", "sekund", "created_at")
    return list(qs[:chek] if chek else qs)


def oyin_json(o: QuizOyin, profil: Profile) -> dict:
    """
    Jonli o'yin holati — kim so'rayotganiga qarab.

    Boshlovchi savolni va javob bergan odamlar SONINI ko'radi (kim nima
    deganini emas); ishtirokchi — o'z javobini va o'rnini. To'g'ri javob
    faqat savol yopilgach (`NATIJA`) ochiladi.
    """
    q = o.quiz
    boshlovchi = _boshlovchimi(o, profil)
    men = None if boshlovchi else qatnash_ol(o, profil)
    s = _savol(o)
    odamlar = list(o.qatnashlar.all())
    d = {
        "id": o.pk, "kod": q.kod, "nom": q.nom, "holat": o.holat,
        "joriy": o.joriy, "jami": len(q.savollar),
        "boshlovchi": boshlovchi, "qatnashyapman": men is not None,
        "ism": men.ism if men is not None else ("" if boshlovchi else oldindan_ism(profil)),
        "odam": len(odamlar), "havola": havola(q),
        "savol": None, "qolgan": None, "javobBerdi": 0,
        "togriJavob": None, "taqsimot": None, "mening": None, "reyting": None,
    }
    if o.holat == QuizOyin.KUTISH:
        # Kutish ekranida kirganlarning ismi — boshlovchi "hamma keldimi?" deb qaraydi.
        d["ismlar"] = [n.ism for n in sorted(odamlar, key=lambda n: n.created_at)][-60:]
    if s is not None and o.holat in (QuizOyin.SAVOL, QuizOyin.NATIJA):
        d["savol"] = _ochiq_savol(s)
        d["javobBerdi"] = sum(1 for n in odamlar if _javob_berdi(n, o.joriy))
        if o.holat == QuizOyin.SAVOL:
            d["qolgan"] = max(0.0, round(s["vaqt"] - (_hozir() - o.savol_vaqt), 1))
        else:
            d["togriJavob"] = s["javob"]
            if s["tur"] == "variant":
                sanoq = {v: 0 for v in s["variantlar"]}
                for n in odamlar:
                    if _javob_berdi(n, o.joriy):
                        j = n.javoblar[o.joriy]["j"]
                        if j in sanoq:
                            sanoq[j] += 1
                d["taqsimot"] = [sanoq[v] for v in s["variantlar"]]
    if o.holat in (QuizOyin.NATIJA, QuizOyin.TUGADI):
        reyting = _reyting(o)
        d["reyting"] = [{"orin": k + 1, "ism": n.ism, "ball": n.ball, "togri": n.togri,
                         "men": men is not None and n.pk == men.pk}
                        for k, n in enumerate(reyting[: (5 if o.holat == QuizOyin.NATIJA else 100)])]
        if men is not None:
            d["orin"] = next((k + 1 for k, n in enumerate(reyting) if n.pk == men.pk), None)
    if men is not None:
        joriy = men.javoblar[o.joriy] if s is not None and _javob_berdi(men, o.joriy) else None
        # Savol ochiqligida joriy javobning bali jamiga QO'SHILMAYDI: tepadagi
        # son o'ssa, "to'g'rimi" degan savolga javob berib qo'yardi.
        yashir = joriy if joriy and o.holat == QuizOyin.SAVOL else None
        d["mening"] = {
            "ball": men.ball - (yashir["b"] if yashir else 0),
            "togri": men.togri - (1 if yashir and yashir["t"] else 0),
            "javob": joriy["j"] if joriy else None,
            # Savol ochiq turganda "to'g'rimi" AYTILMAYDI — qo'shni partadagiga
            # ekranni ko'rsatib qo'yish mumkin edi.
            "togrimi": joriy["t"] if joriy and o.holat != QuizOyin.SAVOL else None,
            "oxirgiBall": joriy["b"] if joriy and o.holat != QuizOyin.SAVOL else None,
            # Savol ochilgandan KEYIN kirgan — unga "ulgurmadingiz" deyish
            # noto'g'ri: u bu savolni umuman ko'rmagan.
            "kech": s is not None and joriy is None and men.created_at.timestamp() > o.savol_vaqt,
        }
    return d
