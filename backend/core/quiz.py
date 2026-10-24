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
#: "hamma javob berdi" sanog'iga kirmaydi. Ilova har 1,5 s so'raydi,
#: lekin o'ttiz kishilik sinfda server sekinlashadi: 12 s da hali
#: o'ylayotgan bola "ketgan" bo'lib, savol uning ko'z oldida yopilardi.
KETGAN = 20

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


#: Savol turlari:
#:
#:   variant   2–6 variantdan bittasi
#:   yozma     javob yoziladi (`javob_teng` — "12 sm" va "12" teng)
#:   rost      to'g'ri yoki noto'g'ri; `javob` — "1" yoki "0" (yozuv
#:             tilga bog'liq, shuning uchun bazada belgi)
#:   tartib    3–6 element; `variantlar` — TO'G'RI tartibda saqlanadi,
#:             yechuvchiga aralashtirilib ketadi
#:   juftlash  2–5 juft `[chap, o'ng]`; o'ng ustun aralashtiriladi
TURLAR = ("variant", "yozma", "rost", "tartib", "juftlash")
MIN_TARTIB, MAX_TARTIB = 3, 6
MIN_JUFT, MAX_JUFT = 2, 5


def _royxat(xom, chek: int) -> list[str]:
    """Bo'sh va takrorlanganlarsiz satrlar ro'yxati."""
    r: list[str] = []
    for v in (xom if isinstance(xom, list) else [])[:chek]:
        v = _matn(v, MAX_VARIANT_MATN)
        if v and v not in r:
            r.append(v)
    return r


def savol_tozala(s) -> dict:
    """Bitta savolni tekshiradi va saqlanadigan ko'rinishga keltiradi."""
    if not isinstance(s, dict):
        raise QuizXato("savol_xato")
    tur = s.get("tur") if s.get("tur") in TURLAR else "variant"
    matn = _matn(s.get("matn"), MAX_MATN)
    if not matn:
        raise QuizXato("savol_matn")
    try:
        vaqt = int(s.get("vaqt") or STANDART_VAQT)
    except (TypeError, ValueError):
        vaqt = STANDART_VAQT
    if vaqt not in VAQTLAR:
        vaqt = STANDART_VAQT

    javob = _matn(s.get("javob"), MAX_VARIANT_MATN)
    variantlar: list[str] = []
    toza: dict = {"tur": tur, "matn": matn}
    if tur == "variant":
        variantlar = _royxat(s.get("variantlar"), MAX_VARIANT)
        if len(variantlar) < MIN_VARIANT or javob not in variantlar:
            raise QuizXato("savol_variant")
    elif tur == "yozma":
        if not javob:
            raise QuizXato("savol_javob")
    elif tur == "rost":
        if javob not in ("1", "0"):
            raise QuizXato("savol_javob")
    elif tur == "tartib":
        variantlar = _royxat(s.get("variantlar"), MAX_TARTIB)
        if len(variantlar) < MIN_TARTIB:
            raise QuizXato("savol_variant")
        javob = ""
    else:  # juftlash
        juftlar, chaplar, onglar = [], set(), set()
        for j in (s.get("juftlar") if isinstance(s.get("juftlar"), list) else [])[:MAX_JUFT]:
            if not isinstance(j, (list, tuple)) or len(j) != 2:
                continue
            chap, ong = _matn(j[0], MAX_VARIANT_MATN), _matn(j[1], MAX_VARIANT_MATN)
            # Takrorlangan chap yoki o'ng — javob ikki xil bo'lib qoladi.
            if chap and ong and chap not in chaplar and ong not in onglar:
                juftlar.append([chap, ong])
                chaplar.add(chap)
                onglar.add(ong)
        if len(juftlar) < MIN_JUFT:
            raise QuizXato("savol_juft")
        toza["juftlar"] = juftlar
        javob = ""

    toza.update({"variantlar": variantlar, "javob": javob, "vaqt": vaqt})
    # Oltin savol — jonli o'yinda ball ikki baravar (`ball_hisobla`).
    if s.get("oltin"):
        toza["oltin"] = True
    # AI yozgan savol — muharrir "tekshirib chiqing" deb belgilaydi.
    if s.get("ai"):
        toza["ai"] = True
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


def _aralash(r: list, urug: str) -> list:
    """
    Urug'li aralashtirish — har so'rovda va har qurilmada BIR XIL.

    Har ochilishda boshqa tartib bo'lsa, jonli o'yinda har 1,5 soniyada
    elementlar sakrab turardi. Asl tartib (ya'ni javob) hech qachon
    chiqmaydi: aralash natija unga teng bo'lsa — bir qadam suriladi.
    """
    import random

    a = list(r)
    random.Random(urug).shuffle(a)
    if a == list(r) and len(a) > 1:
        a = a[1:] + a[:1]
    return a


def _ochiq_savol(s: dict) -> dict:
    """Mijozga ketadigan savol — JAVOBSIZ."""
    d = {"tur": s["tur"], "matn": s["matn"], "variantlar": s["variantlar"], "vaqt": s["vaqt"]}
    if s["tur"] == "tartib":
        d["variantlar"] = _aralash(s["variantlar"], f"t|{s['matn']}|{s['variantlar']}")
    elif s["tur"] == "juftlash":
        d["chap"] = [j[0] for j in s["juftlar"]]
        d["ong"] = _aralash([j[1] for j in s["juftlar"]], f"j|{s['matn']}|{s['juftlar']}")
    if s.get("oltin"):
        d["oltin"] = True
    if s.get("a"):
        d["a"] = s["a"]
    return d


def togri_javob(s: dict):
    """Ko'rsatish uchun to'g'ri javob: satr, tartib ro'yxati yoki juftlar."""
    if s["tur"] == "tartib":
        return s["variantlar"]
    if s["tur"] == "juftlash":
        return s["juftlar"]
    return s["javob"]


def javob_tozala(s: dict, j):
    """
    Kelgan javobni turiga qarab saqlanadigan shaklga keltiradi.
    Ro'yxatli turlarda — satrlar ro'yxati, boshqasida — satr; bo'sh — `None`.
    """
    if j is None:
        return None
    if s["tur"] in ("tartib", "juftlash"):
        if not isinstance(j, list) or not j:
            return None
        return [_matn(x, MAX_VARIANT_MATN) for x in j[:MAX_TARTIB]]
    j = _matn(j, MAX_VARIANT_MATN)
    return j or None


def togrimi(s: dict, javob) -> bool:
    javob = javob_tozala(s, javob)
    if javob is None:
        return False
    if s["tur"] in ("variant", "rost"):
        return javob == s["javob"]
    if s["tur"] == "tartib":
        return javob == s["variantlar"]
    if s["tur"] == "juftlash":
        # Javob — chap ustun tartibida tanlangan o'nglar.
        return javob == [j[1] for j in s["juftlar"]]
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
        j = javob_tozala(s, javoblar[i] if i < len(javoblar) else None)
        t = togrimi(s, j)
        togri += t
        tahlil.append({"togri": t, "javob": togri_javob(s), "sizniki": j})
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
#
# Uch rejim (`QuizOyin.tur`):
#
#   oddiy   har kim o'zi uchun
#   jamoa   ishtirokchilar 2–4 jamoaga navbat bilan bo'linadi; jamoa bali —
#           a'zolar balining O'RTACHASI. Yig'indi bo'lsa, ko'p kishilik
#           jamoa faqat soni bilan yutardi.
#   omon    xato yoki javobsiz qolgan o'yindan chiqadi (`chiqdi` — qaysi
#           savolda); chiqqan tomosha qiladi. Bitta odam qolsa o'yin tugaydi.

OYIN_TURLARI = (QuizOyin.ODDIY, QuizOyin.JAMOA, QuizOyin.OMON)
MIN_JAMOA, MAX_JAMOA = 2, 4
#: Seriya bonusi: ketma-ket to'g'ri javobning har biri uchun (birinchisidan
#: keyin) shuncha ball, eng ko'pi `SERIYA_MAX` qadam. Kahoot'dagi kabi:
#: bitta tasodifiy omad emas, barqarorlik mukofotlanadi.
SERIYA_BALL = 100
SERIYA_MAX = 5
#: Tomoshabin — omon qolish o'yiniga boshlangandan keyin kirgan odam.
#: U o'tgan savollarni ko'rmagan, ya'ni "tirik" deb hisoblash adolatsiz.
TOMOSHABIN = -1


def _faol_oyin(q: Quiz) -> QuizOyin | None:
    return (q.oyinlar.exclude(holat=QuizOyin.TUGADI)
            .filter(created_at__gte=timezone.now() - timedelta(hours=OYIN_SOAT))
            .order_by("-created_at").first())


@transaction.atomic
def jonli_och(profil: Profile, qid: int, tur=None, jamoa_soni=None) -> QuizOyin:
    """
    Yangi jonli o'yin. Avvalgi tugamagan o'yin yopiladi — bitta kod
    bitta paytda bitta o'yinga olib borsin.
    """
    q = meniki(profil, qid)
    tur = tur if tur in OYIN_TURLARI else QuizOyin.ODDIY
    try:
        jamoa_soni = int(jamoa_soni or 2)
    except (TypeError, ValueError):
        jamoa_soni = 2
    jamoa_soni = min(max(jamoa_soni, MIN_JAMOA), MAX_JAMOA) if tur == QuizOyin.JAMOA else 0
    q.oyinlar.exclude(holat=QuizOyin.TUGADI).update(holat=QuizOyin.TUGADI, tugadi_at=timezone.now())
    return QuizOyin.objects.create(quiz=q, tur=tur, jamoa_soni=jamoa_soni)


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


def _jamoa_tanla(o: QuizOyin) -> int:
    """Eng kam odamli jamoa (teng bo'lsa — kichik raqamli): jamoalar teng to'lsin."""
    sanoq = [0] * o.jamoa_soni
    for j in o.qatnashlar.exclude(jamoa__isnull=True).values_list("jamoa", flat=True):
        if 0 <= j < o.jamoa_soni:
            sanoq[j] += 1
    return sanoq.index(min(sanoq))


@transaction.atomic
def kir(o: QuizOyin, profil: Profile, ism=None) -> QuizQatnash:
    """
    O'yinga kirish. Boshlangandan keyin ham kirsa bo'ladi — kech qolgan
    bola o'tgan savollarga ball olmaydi, xolos. Kahoot'da ham shunday:
    eshikdan kirgan o'quvchini darsdan haydab bo'lmaydi.

    Omon qolish o'yinida esa kech kirgan — tomoshabin (`TOMOSHABIN`).
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
    return QuizQatnash.objects.create(
        quiz=o.quiz, oyin=o, profile=profil, ism=_taxallus(o, ism, profil),
        jamoa=_jamoa_tanla(o) if o.tur == QuizOyin.JAMOA else None,
        chiqdi=TOMOSHABIN if o.tur == QuizOyin.OMON and o.holat != QuizOyin.KUTISH else None,
    )


def _savol(o: QuizOyin) -> dict | None:
    s = o.quiz.savollar
    return s[o.joriy] if 0 <= o.joriy < len(s) else None


def _tirik(n: QuizQatnash) -> bool:
    return n.chiqdi is None


def _faollar(o: QuizOyin) -> list[QuizQatnash]:
    """Ekran oldida turgan va javob bera oladiganlar (omon qolishda — faqat tiriklar)."""
    eski = timezone.now() - timedelta(seconds=KETGAN)
    return [n for n in o.qatnashlar.filter(belgi__gte=eski) if _tirik(n)]


def _javob_berdi(n: QuizQatnash, i: int) -> bool:
    return i < len(n.javoblar) and n.javoblar[i] is not None


def _yop(o: QuizOyin) -> None:
    """
    Savolni yopadi. Omon qolishda shu savolga to'g'ri javob bermagan har
    bir tirik o'yinchi chiqadi — javobsiz qolgan ham: vaqtida javob berish
    ham o'yinning bir qismi.
    """
    o.holat = QuizOyin.NATIJA
    o.save(update_fields=["holat"])
    if o.tur != QuizOyin.OMON:
        return
    for n in o.qatnashlar.filter(chiqdi__isnull=True):
        if not (_javob_berdi(n, o.joriy) and n.javoblar[o.joriy].get("t")):
            n.chiqdi = o.joriy
            n.save(update_fields=["chiqdi"])


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
        _yop(o)
    return o


def _tirik_soni(o: QuizOyin) -> int:
    return o.qatnashlar.filter(chiqdi__isnull=True).count()


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
        _yop(o)
        return o
    if o.holat == QuizOyin.KUTISH and not o.qatnashlar.exists():
        raise QuizXato("hech_kim", 409)
    # Omon qolishda bitta (yoki hech kim) qolgan bo'lsa — davom etishning
    # ma'nosi yo'q: g'olib aniq.
    omon_tugadi = o.tur == QuizOyin.OMON and o.holat == QuizOyin.NATIJA and _tirik_soni(o) <= 1
    if o.joriy + 1 >= len(o.quiz.savollar) or omon_tugadi:
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


def _oldingi_seriya(javoblar: list, i: int) -> int:
    """`i` dan oldin ketma-ket nechta to'g'ri javob. O'tkazib yuborilgan savol seriyani uzadi."""
    n = 0
    for x in reversed(javoblar[:i]):
        if not x or not x.get("t"):
            break
        n += 1
    return n


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
    if not _tirik(n):
        raise QuizXato("chiqqan", 409)
    if _javob_berdi(n, i):
        raise QuizXato("berilgan", 409)
    j = javob_tozala(s, j)
    t = togrimi(s, j)
    seriya = _oldingi_seriya(n.javoblar, i) + 1 if t else 0
    asos = ball_hisobla(sarf, s["vaqt"]) * (2 if s.get("oltin") else 1) if t else 0
    bonus = min(seriya - 1, SERIYA_MAX) * SERIYA_BALL if t else 0
    b = asos + bonus
    javoblar = list(n.javoblar) + [None] * max(0, i + 1 - len(n.javoblar))
    javoblar[i] = {"j": j, "t": t, "b": b, "bn": bonus, "sr": seriya, "s": round(min(sarf, s["vaqt"]), 1)}
    n.javoblar = javoblar
    n.togri += t
    n.ball += b
    n.sekund = round(sum((x or {}).get("s", 0) for x in javoblar))
    n.belgi = timezone.now()
    n.save(update_fields=["javoblar", "togri", "ball", "sekund", "belgi"])
    return n


def _reyting(o: QuizOyin) -> list[QuizQatnash]:
    """
    O'rinlar. Omon qolishda avval tiriklar, keyin kim KECHROQ chiqqan
    bo'lsa — yuqoriroq; ball faqat bir xil holatdagilar orasini ajratadi.
    """
    odamlar = list(o.qatnashlar.all())
    if o.tur == QuizOyin.OMON:
        return sorted(odamlar, key=lambda n: (
            0 if n.chiqdi is None else 1, -(n.chiqdi if n.chiqdi is not None else 0),
            -n.ball, n.sekund, n.created_at))
    return sorted(odamlar, key=lambda n: (-n.ball, n.sekund, n.created_at))


def _jamoalar(o: QuizOyin, odamlar: list[QuizQatnash], yashir: dict[int, int]) -> list[dict]:
    """Jamoalar jadvali — o'rtacha ball bo'yicha (sinf qaysi jamoa oldinda ekanini ko'radi)."""
    r = []
    for j in range(o.jamoa_soni):
        azo = [n for n in odamlar if n.jamoa == j]
        ball = sum(n.ball - yashir.get(n.pk, 0) for n in azo)
        r.append({"jamoa": j, "odam": len(azo), "ball": round(ball / len(azo)) if azo else 0})
    return sorted(r, key=lambda x: -x["ball"])


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
    # Savol ochiqligida joriy javoblarning bali hech kimga (jamoa jadvaliga ham)
    # QO'SHILMAYDI: son o'ssa, "to'g'rimi" degan savolga javob berib qo'yardi.
    yashir = ({n.pk: n.javoblar[o.joriy]["b"] for n in odamlar if _javob_berdi(n, o.joriy)}
              if o.holat == QuizOyin.SAVOL else {})
    d = {
        "id": o.pk, "kod": q.kod, "nom": q.nom, "holat": o.holat, "tur": o.tur,
        "joriy": o.joriy, "jami": len(q.savollar),
        "boshlovchi": boshlovchi, "qatnashyapman": men is not None,
        "ism": men.ism if men is not None else ("" if boshlovchi else oldindan_ism(profil)),
        "odam": len(odamlar), "havola": havola(q),
        "savol": None, "qolgan": None, "javobBerdi": 0,
        "togriJavob": None, "taqsimot": None, "mening": None, "reyting": None,
        "jamoalar": _jamoalar(o, odamlar, yashir) if o.tur == QuizOyin.JAMOA else None,
        "tirik": sum(1 for n in odamlar if _tirik(n)) if o.tur == QuizOyin.OMON else None,
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
            d["togriJavob"] = togri_javob(s)
            if s["tur"] in ("variant", "rost"):
                tartib = s["variantlar"] if s["tur"] == "variant" else ["1", "0"]
                sanoq = {v: 0 for v in tartib}
                for n in odamlar:
                    if _javob_berdi(n, o.joriy):
                        j = n.javoblar[o.joriy]["j"]
                        if j in sanoq:
                            sanoq[j] += 1
                d["taqsimot"] = [sanoq[v] for v in tartib]
    if o.holat in (QuizOyin.NATIJA, QuizOyin.TUGADI):
        reyting = _reyting(o)
        d["reyting"] = [{"orin": k + 1, "ism": n.ism, "ball": n.ball, "togri": n.togri,
                         "men": men is not None and n.pk == men.pk,
                         "jamoa": n.jamoa, "chiqdi": n.chiqdi}
                        for k, n in enumerate(reyting[: (5 if o.holat == QuizOyin.NATIJA else 100)])]
        if men is not None:
            d["orin"] = next((k + 1 for k, n in enumerate(reyting) if n.pk == men.pk), None)
    if men is not None:
        joriy = men.javoblar[o.joriy] if s is not None and _javob_berdi(men, o.joriy) else None
        ochiq = joriy is not None and o.holat != QuizOyin.SAVOL
        d["mening"] = {
            "ball": men.ball - yashir.get(men.pk, 0),
            "togri": men.togri - (1 if men.pk in yashir and joriy and joriy["t"] else 0),
            "javob": joriy["j"] if joriy else None,
            # Savol ochiq turganda "to'g'rimi" AYTILMAYDI — qo'shni partadagiga
            # ekranni ko'rsatib qo'yish mumkin edi.
            "togrimi": joriy["t"] if ochiq else None,
            "oxirgiBall": joriy["b"] if ochiq else None,
            "bonus": joriy.get("bn", 0) if ochiq else 0,
            "seriya": joriy.get("sr", 0) if ochiq else 0,
            # Savol ochilgandan KEYIN kirgan — unga "ulgurmadingiz" deyish
            # noto'g'ri: u bu savolni umuman ko'rmagan.
            "kech": s is not None and joriy is None and men.created_at.timestamp() > o.savol_vaqt,
            "jamoa": men.jamoa,
            "chiqdi": men.chiqdi,
        }
    return d
