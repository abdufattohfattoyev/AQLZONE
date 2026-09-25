"""
KARVON YO'LI — to'siqlarni server yaratadi va javobni server tekshiradi.

Nega serverda. Reyting (kim qaysi bekatda) hammaga ochiq; bekat va yulduzni
o'yin o'zi yuborsa, kodni biladigan odam o'zini Xivaga "yetkazib" qo'yardi.
Endi o'yin faqat javobni yuboradi: qaysi toshlar (id) va qaysi amallar.
Toshlarning QIYMATI serverda — o'yin uni o'zgartira olmaydi.

Oqim:
    bekat   → bekatni boshlaydi (yoki to'xtagan joyidan qaytaradi): qo'l va 1-to'siq
    javob   → tekshiradi; to'g'ri bo'lsa yulduz, keyingi to'siq yoki bekat oxiri
    otkaz   → suv bilan aylanib o'tish (yulduzsiz, bekatda ko'pi bilan 2 marta)
    maslahat→ yechimdagi bitta tosh

Javob kaliti mijozga YUBORILMAYDI: ko'prik, tarozi, ketma-ketlik va yo'l
javobi faqat serverda. Tosh/bo'ron/qaroqchida maqsad ko'rinadi — u sinovning
o'zi (qancha yig'ish kerak).

Tanga, suv, bozor va bezaklar hanuz qurilmada — ular reytingga ta'sir qilmaydi.
"""
from __future__ import annotations

import random

from django.db import transaction
from django.utils import timezone

from .models import KarvonHolat

#: BESHTA DARAJA. Har biri o'lchab tanlangan (`scripts` dagi tahlil):
#: qatorda toshlarning oralig'i, amallar, javob chegarasi va ifodadagi
#: tosh soni turadi.
#:
#: Ilgari uchta daraja bor edi va ular juda keng edi: "9–11 sinf" da
#: sonlar 3..20 oralig'ida qolib ketgandi, ya'ni o'n birinchi sinf
#: uchun "7 + 9" degan misol chiqardi. Beshta pog'ona esa har ikki
#: sinfga bittadan to'g'ri keladi va pog'onalar orasidagi sakrash
#: bola ko'tara oladigan darajada qoladi.
#:
#: SINF EMAS, DARAJA — ataylab. Sinf so'ralsa, kuchli bola o'z
#: sinfida zerikadi, qiynalayotgani esa pastini tanlashdan uyaladi.
#: Daraja esa tanlov: yonidagi "1–2 sinf" faqat MASLAHAT.
DARAJA = {
    1: {"nom": "Yo'lboshchi", "sinf": "1–2 sinf",
        "min": 1,  "max": 10,  "amallar": ["+", "−"],           "chegara": 25,   "qism": 2},
    2: {"nom": "Sayyoh", "sinf": "3–4 sinf",
        "min": 2,  "max": 30,  "amallar": ["+", "−", "×"],      "chegara": 150,  "qism": 2},
    3: {"nom": "Sarbon", "sinf": "5–6 sinf",
        "min": 3,  "max": 50,  "amallar": ["+", "−", "×", "÷"], "chegara": 500,  "qism": 3},
    4: {"nom": "Karvonboshi", "sinf": "7–8 sinf",
        "min": 6,  "max": 80,  "amallar": ["+", "−", "×", "÷"], "chegara": 1100, "qism": 3},
    5: {"nom": "Ustoz munajjim", "sinf": "9–11 sinf",
        "min": 10, "max": 110, "amallar": ["+", "−", "×", "÷"], "chegara": 2000, "qism": 3},
    # OLTINCHI DARAJA — kattalar uchun.
    #
    # Anketa shuni ko'rsatdi: kelganlarning 58% i TALABA, yana 20% i
    # o'qituvchi, ota-ona va boshqa kattalar. Ilova esa maktab dasturi
    # bo'yicha qurilgan va eng yuqori pog'onasi "11-sinf" edi —
    # ya'ni yigirma yoshli odam uchun tepa yo'q edi. Bu pog'onada
    # ifodada TO'RTTA tosh qatnashadi va sonlar uch xonaliga chiqadi.
    6: {"nom": "Sarrof", "sinf": "talaba va kattalar",
        "min": 15, "max": 200, "amallar": ["+", "−", "×", "÷"], "chegara": 5000, "qism": 4},
}
D = DARAJA                                 # eski nom bilan chaqiruvlar uchun

#: Eski uchta daraja yangisining qayeriga tushadi. Bazada allaqachon
#: `daraja=1..3` bo'lgan o'yinchilar bor — ular hech narsa
#: tanlamasdan davom etishi kerak.
ESKI_DARAJA = {1: 1, 2: 3, 3: 5}

#: Sinf aytilsa (eski mijoz yoki tashqi chaqiruv) — qaysi darajaga.
SINF_DARAJA = {1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 5, 10: 5, 11: 5}

#: Mavsum bilan sonlar qanchaga kattalashadi (1-mavsum — jadvaldagidek).
MAVSUM_OSISH = 0.45
MAX_MAVSUM = 9


def darajaga(daraja=None, sinf=None) -> int:
    """
    Kelgan qiymatni 1–5 darajaga aylantiradi.

    Uch xil chaqiruvni ham tushunadi: yangi daraja (1–5), eski daraja
    (1–3) va sinf (1–11). Noma'lum qiymatda — o'rtasi.
    """
    try:
        n = int(sinf)
        if 1 <= n <= 11:
            return SINF_DARAJA[n]
    except (TypeError, ValueError):
        pass
    try:
        d = int(daraja)
    except (TypeError, ValueError):
        return 3
    if d in DARAJA:
        return d
    return ESKI_DARAJA.get(d, 3)


def tavsiya(profil) -> int:
    """
    Anketaga qarab tavsiya etiladigan daraja.

    MAJBURLAMAYDI — tanlash ekranida shunchaki "sizga mos" deb
    belgilanadi. Sabab: anketa endi majburiy bo'lsa ham, eski hisoblarda
    javob yo'q bo'lishi mumkin, to'ldirgani ham bugun boshqacha kayfiyatda bo'lishi mumkin. Lekin
    tavsiyasiz ekran ham yomon: talaba kirib, birinchi kartada
    "1–2 sinf" ni ko'radi va o'yinni bolalarniki deb o'ylaydi.
    """
    pupil = getattr(profil, "pupil", None)
    if not pupil:
        return 3
    kim = getattr(pupil, "kim", "") or ""
    bosqich = getattr(pupil, "anketa_sinf", None)
    if kim in ("talaba", "abiturient", "ustoz", "kattalar", "ota_ona"):
        return 6
    if isinstance(bosqich, int) and 1 <= bosqich <= 11:
        return SINF_DARAJA[bosqich]
    if isinstance(bosqich, int) and bosqich == 0:
        return 1
    return 3


def kuch(daraja: int, mavsum: int = 1) -> dict:
    """
    Shu daraja va shu safardagi sonlar kengligi.

    Qiyinlik ikki o'qda o'sadi: DARAJA va SAFAR (mavsum). Ikkinchisi
    aynan shuning uchun bor — Xivaga yetgan bola uchun yo'l tugamasligi
    kerak, lekin bir xil misollarni qayta yechish ham o'yin emas. Har
    yangi safarda sonlar kattalashadi, uchinchi safardan boshlab eng
    yuqori darajada ifodaga to'rtinchi tosh qo'shiladi.
    """
    d = DARAJA.get(daraja) or DARAJA[3]
    m = max(1, min(MAX_MAVSUM, int(mavsum or 1)))
    o = 1 + MAVSUM_OSISH * (m - 1)
    return {
        "min": max(1, int(d["min"] * (1 + (o - 1) / 2))),
        "max": max(d["min"] + 3, int(d["max"] * o)),
        "amallar": list(d["amallar"]),
        "chegara": int(d["chegara"] * o * o),
        # Eng yuqori ikki pog'onada uchinchi safardan yana bitta tosh.
        "qism": d["qism"] + (1 if daraja >= 5 and m >= 3 else 0),
    }


#: Bekatda nechta to'siq: 3, 3, 4, 4, 5, 5, 6, 6, 6 — jami 42.
#:
#: Ilgari hamma bekatda uchtadan edi, ya'ni butun yo'l 27 ta to'siq
#: (taxminan 18 daqiqa) va uni bir o'tirishda tugatib qo'yish mumkin
#: edi. Endi yo'l oxiriga borib uzayadi: boshida tanishtiradi,
#: oxirida sinaydi.
def tosiqlar(bekat: int) -> int:
    return 3 + max(0, min(3, int(bekat) // 2))


MADAN = ["Mis", "Granit", "Ohaktosh", "Marmar", "Feruza", "Lazurit", "Nefrit"]
NAVBAT = ["tosh", "xotira", "boron", "yol", "koprik", "tarozi", "ketma"]
OBHAVO = ["quyoshli", "issiq", "shamol", "boron", "salqin"]
YUKLAR = [["🏺", "Ko'za"], ["🧵", "Ipak"], ["🧂", "Tuz"], ["🫖", "Choy"], ["💎", "Laal"],
          ["📜", "Qo'lyozma"], ["🪔", "Chiroq"], ["🧿", "Muhr"]]
YOL_NOMLARI = ["Cho'l yo'li", "Tog' yo'li", "Daryo yo'li", "Karvonsaroy yo'li"]
BEKATLAR = 9
MAX_OTKAZ = 2          # bekatda nechta to'siqni suv bilan aylanib o'tish mumkin


class KarvonXato(Exception):
    def __init__(self, sabab: str, kod: int = 409):
        super().__init__(sabab)
        self.sabab = sabab
        self.kod = kod


def hisobla(a: list) -> float | None:
    """Ifoda qiymati: × va ÷ avval. Butun bo'linmasa — NaN (noto'g'ri)."""
    if not a or not isinstance(a[-1], int):
        return None
    s, op = [a[0]], []
    for i in range(1, len(a), 2):
        o, n = a[i], a[i + 1]
        if o == "×":
            s[-1] *= n
        elif o == "÷":
            if not n or s[-1] % n:
                return float("nan")
            s[-1] //= n
        else:
            op.append(o)
            s.append(n)
    x = s[0]
    for j, o in enumerate(op):
        x = x + s[j + 1] if o == "+" else x - s[j + 1]
    return x


def obhavo(bekat: int) -> str:
    """Mijozdagi bilan bir xil: (bekat × 7 + oy kuni) % 5."""
    return OBHAVO[(bekat * 7 + timezone.localdate().day) % len(OBHAVO)]


def _karta(j: dict, rng: random.Random) -> dict:
    j["id_son"] += 1
    d = _kuch(j)
    return {"id": j["id_son"], "v": rng.randint(d["min"], d["max"]), "mad": rng.choice(MADAN)}


def _kuch(j: dict) -> dict:
    """Shu bekat uchun hisoblangan qiyinlik (eski saqlangan o'yinlarda — jadvaldan)."""
    return j.get("kuch") or kuch(_daraja(j), j.get("mavsum") or 1)


def _daraja(j: dict) -> int:
    """O'yinchining darajasi (1–5). Eski holatda 1–3 bo'lishi mumkin."""
    return darajaga(j.get("daraja"), j.get("sinf"))


def _vazifa(j: dict, bekat: int, rng: random.Random) -> dict:
    q, d, soda, dj = j["qol"], _kuch(j), j.get("soda"), _daraja(j)
    tur = NAVBAT[(bekat * 3 + j["tosiq"]) % len(NAVBAT)]
    if obhavo(bekat) == "boron" and j["tosiq"] == 0:
        tur = "boron"
    # Qaroqchi — bekatning OXIRGI to'sig'i (bekatlar endi turli
    # uzunlikda, shuning uchun uchinchisi emas, oxirgisi).
    if bekat % 3 == 2 and j["tosiq"] == tosiqlar(bekat) - 1:
        tur = "qaroqchi"
    if j.get("yetak") and bekat == 0 and j["tosiq"] == 0:
        a, b = sorted(q, key=lambda k: k["v"])[:2]
        return {"tur": "tosh", "maqsad": a["v"] + b["v"], "yechim": [a["id"], b["id"]], "yetak": True}

    def aral():
        x = list(range(len(q)))
        rng.shuffle(x)
        return x

    if tur == "boron":
        eng = 2 if dj <= 1 or soda else min(len(q), d["qism"] + 1)
        tan = aral()[:2 if eng <= 2 else rng.randint(2, eng)]
        return {"tur": tur, "maqsad": sum(q[i]["v"] for i in tan), "yechim": [q[i]["id"] for i in tan]}

    if tur in ("tosh", "qaroqchi"):
        boss = tur == "qaroqchi"
        # Bossda ifoda doim to'liq uzunlikda, oddiy to'siqda esa daraja
        # hal qiladi: boshlovchida ikki tosh, 5-sinfdan yuqorida uchta.
        oddiy = 2 if soda or dj <= 1 else (
            d["qism"] if dj >= 3 else (d["qism"] if rng.random() < .45 else 2))
        for u in range(160):
            k = min(len(q), d["qism"] + (1 if boss and dj >= 5 else 0)) if boss else min(len(q), oddiy)
            tan, a = aral()[:k], []
            for n, i in enumerate(tan):
                if n:
                    a.append(rng.choice(d["amallar"]))
                a.append(q[i]["v"])
            x = hisobla(a)
            if (isinstance(x, int) and 0 < x <= d["chegara"]
                    and (u > 60 or any(v in ("×", "÷", "−") for v in a))):
                return {"tur": tur, "maqsad": x, "yechim": [q[i]["id"] for i in tan]}
        tan = aral()[:2]
        return {"tur": tur, "maqsad": q[tan[0]]["v"] + q[tan[1]]["v"], "yechim": [q[i]["id"] for i in tan]}

    if tur == "koprik":
        c = q[aral()[0]]
        ops = [o for o in d["amallar"] if o != "÷" or c["v"] % 2 == 0 or c["v"] % 3 == 0]
        op = rng.choice(ops)
        if op == "−" and c["v"] < 3:
            op = "+"
        if op == "÷":
            k = next((x for x in (2, 3, 4) if c["v"] % x == 0), None)
            if k:
                yoz = f"? ÷ {k} = {c['v'] // k}"
            else:
                op = "+"
        if op == "+":
            k = rng.randint(1, 9 if dj <= 1 else max(12, d["max"]))
            yoz = f"? + {k} = {c['v'] + k}"
        elif op == "−":
            k = rng.randint(1, c["v"] - 1)
            yoz = f"? − {k} = {c['v'] - k}"
        elif op == "×":
            k = rng.randint(2, 6 if dj <= 2 else 12)
            yoz = f"? × {k} = {c['v'] * k}"
        return {"tur": tur, "maqsad": c["v"], "yechim": [c["id"]], "yoz": yoz}

    if tur == "tarozi":
        c = q[aral()[0]]
        ong = rng.randint(1, d["max"])
        y = rng.randint(1, max(1, ong + c["v"] - 1))
        return {"tur": tur, "maqsad": c["v"], "yechim": [c["id"]],
                "variant": {"chap": [ong + c["v"] - y, y], "ong": ong}}

    if tur == "ketma":
        c = q[aral()[0]]
        kmax = 4 if dj <= 1 else (9 if dj <= 3 else 15)
        if c["v"] >= 5 and rng.random() < .6:
            k = rng.randint(1, min(kmax, (c["v"] - 1) // 4))
            qator = [c["v"] - 4 * k, c["v"] - 3 * k, c["v"] - 2 * k, c["v"] - k]
        else:
            k = -rng.randint(1, 3 if dj <= 1 else kmax)
            qator = [c["v"] - 4 * k, c["v"] - 3 * k, c["v"] - 2 * k, c["v"] - k]
        return {"tur": tur, "maqsad": c["v"], "yechim": [c["id"]],
                "variant": {"qator": qator}, "qadam": k}

    if tur == "xotira":
        yuklar = rng.sample(YUKLAR, 4 if dj <= 1 else (5 if dj <= 3 else 6))
        yoq = rng.randrange(len(yuklar))
        return {"tur": tur, "maqsad": yoq, "variant": {"yuklar": yuklar, "yoq": yoq}}

    # yo'l ayrimi
    katta = 9 if dj <= 1 else max(20, d["max"])
    while True:
        yollar = [{"a": rng.randint(4, katta), "b": rng.randint(3, katta), "nom": rng.choice(YOL_NOMLARI)}
                  for _ in range(3)]
        jamilar = [y["a"] + y["b"] for y in yollar]
        if jamilar.count(min(jamilar)) == 1:
            return {"tur": tur, "maqsad": jamilar.index(min(jamilar)), "variant": {"yollar": yollar}}


def _ochiq(v: dict) -> dict:
    """Mijozga ketadigan qismi — javob kalitisiz."""
    o = {"tur": v["tur"]}
    if v["tur"] in ("tosh", "boron", "qaroqchi"):
        o["maqsad"] = v["maqsad"]
    for k in ("yoz", "variant"):
        if k in v:
            o[k] = v[k]
    if v.get("yetak"):                 # o'rgatishda qaysi toshlar yonishi kerak
        o["yetak"] = True
        o["yechim"] = v["yechim"]
    return o


def _korinish(h: KarvonHolat) -> dict:
    j = h.joriy
    return {"bekat": h.bekat, "mavsum": h.mavsum or 1, "tosiq": j["tosiq"],
            "tosiq_soni": tosiqlar(h.bekat), "daraja": _daraja(j), "qol": j["qol"],
            "vazifa": _ochiq(j["vazifa"])}


def men(profil) -> dict:
    h = KarvonHolat.objects.filter(profile=profil).first()
    if not h:
        return {"bekat": 0, "yulduz": 0, "yulduzlar": {}, "mavsum": 1, "otgan_yulduz": 0,
                "daraja": 0, "tavsiya": tavsiya(profil),
                "tosiqlar": [tosiqlar(b) for b in range(BEKATLAR)]}
    return {"bekat": h.bekat, "yulduz": h.yulduz, "yulduzlar": h.yulduzlar or {},
            "mavsum": h.mavsum or 1, "otgan_yulduz": h.otgan_yulduz or 0,
            "daraja": darajaga(h.daraja), "tavsiya": tavsiya(profil),
            # Har bekatda nechta to'siq — mijoz "2/4" deb yozishi uchun.
            "tosiqlar": [tosiqlar(b) for b in range(BEKATLAR)]}


def _qulfla(profil) -> KarvonHolat:
    h, _ = KarvonHolat.objects.get_or_create(profile=profil)
    return KarvonHolat.objects.select_for_update().get(pk=h.pk)


@transaction.atomic
def bekat_bosh(profil, daraja, qol_soni, soda=False, sahro=False, yetak=False, sinf=None) -> dict:
    h = _qulfla(profil)
    if h.bekat >= BEKATLAR:
        raise KarvonXato("tugagan")
    if h.joriy and h.joriy.get("bekat") == h.bekat:
        return _korinish(h)                            # to'xtagan joyidan
    daraja = darajaga(daraja if daraja is not None else h.daraja, sinf)
    rng = random.Random()
    j = {"bekat": h.bekat, "daraja": daraja, "mavsum": h.mavsum or 1, "tosiq": 0, "qol": [],
         "id_son": 0, "xato": 0, "otkaz": 0, "yulduzlar": [], "soda": bool(soda),
         "sahro": bool(sahro), "yetak": bool(yetak), "kechirildi": False,
         "qol_soni": max(5, min(7, int(qol_soni or 5)))}
    # Qiyinlik BEKAT BOSHIDA bir marta hisoblanadi va o'sha bekat davomida
    # o'zgarmaydi: aks holda uch to'siqning sonlari har xil kenglikdan
    # kelib, bola "nega birdan qiyinlashdi" deb o'ylardi.
    j["kuch"] = kuch(daraja, j["mavsum"])
    j["qol"] = [_karta(j, rng) for _ in range(j["qol_soni"])]
    j["vazifa"] = _vazifa(j, h.bekat, rng)
    h.joriy, h.daraja, h.faol_at = j, daraja, timezone.now()
    h.save(update_fields=["joriy", "daraja", "faol_at"])
    return _korinish(h)


def _tokenlarni_tekshir(j: dict, tokenlar) -> float | None:
    """Tokenlar: [id, "+", id, ...]. Id qo'lda bo'lishi va bir martadan ishlatilishi shart."""
    if not isinstance(tokenlar, list) or not tokenlar or len(tokenlar) > 13:
        return None
    qiymat = {k["id"]: k["v"] for k in j["qol"]}
    amallar = set(_kuch(j)["amallar"])
    tur, a, korilgan = j["vazifa"]["tur"], [], set()
    for n, t in enumerate(tokenlar):
        if n % 2 == 0:
            if not isinstance(t, int) or isinstance(t, bool) or t not in qiymat or t in korilgan:
                return None
            korilgan.add(t)
            a.append(qiymat[t])
        else:
            if t not in amallar or (tur == "boron" and t != "+"):
                return None
            a.append(t)
    if tur in ("koprik", "tarozi", "ketma") and len(a) != 1:
        return None
    return hisobla(a)


def _yechildi(h: KarvonHolat, yulduz: int, ishlatilgan: list[int]) -> dict:
    j = h.joriy
    j["yulduzlar"].append(yulduz)
    j["tosiq"] += 1
    javob = {"togri": True, "yulduz": yulduz, "keyingi": None, "bekat_tugadi": None}
    if j["tosiq"] >= tosiqlar(h.bekat):
        s = j["yulduzlar"]
        bekat_yulduz = int(sum(s) / len(s) + 0.5)
        yulduzlar = dict(h.yulduzlar or {})
        yulduzlar[str(h.bekat)] = bekat_yulduz
        h.yulduzlar = yulduzlar
        h.yulduz = sum(yulduzlar.values())
        eski = h.bekat
        h.bekat = min(BEKATLAR, h.bekat + 1)
        h.joriy = None
        javob["bekat_tugadi"] = {"bekat": eski, "yulduz": bekat_yulduz, "yangi_bekat": h.bekat}
    else:
        rng = random.Random()
        j["qol"] = [k for k in j["qol"] if k["id"] not in set(ishlatilgan)]
        while len(j["qol"]) < j["qol_soni"]:
            j["qol"].append(_karta(j, rng))
        j["xato"], j["kechirildi"], j["yetak"] = 0, False, False
        j["vazifa"] = _vazifa(j, h.bekat, rng)
        h.joriy = j
        javob["keyingi"] = _korinish(h)
    javob["jami_yulduz"] = h.yulduz
    h.faol_at = timezone.now()
    h.save(update_fields=["joriy", "yulduzlar", "yulduz", "bekat", "faol_at"])
    return javob


@transaction.atomic
def javob(profil, tokenlar=None, tanlov=None) -> dict:
    h = _qulfla(profil)
    j = h.joriy
    if not j:
        raise KarvonXato("bekat_yoq")
    v = j["vazifa"]
    if v["tur"] in ("xotira", "yol"):
        togri = isinstance(tanlov, int) and not isinstance(tanlov, bool) and tanlov == v["maqsad"]
        qiymat, ishlatilgan = tanlov, []
    else:
        qiymat = _tokenlarni_tekshir(j, tokenlar)
        if qiymat is None:
            raise KarvonXato("notogri_ifoda", 400)
        togri = qiymat == v["maqsad"]
        ishlatilgan = [t for t in tokenlar[::2]]
    if togri:
        return _yechildi(h, 3 - min(j["xato"], 2), ishlatilgan)

    kechirildi = False
    if j.get("sahro") and not j["kechirildi"]:
        j["kechirildi"] = kechirildi = True
    else:
        j["xato"] += 1
    h.joriy = j
    h.save(update_fields=["joriy"])
    javob_ = {"togri": False, "xato": j["xato"], "kechirildi": kechirildi,
              "qiymat": qiymat if isinstance(qiymat, int) else None}
    if v["tur"] == "ketma":
        javob_["qadam"] = v["qadam"]          # xatodan keyin — qoida ko'rsatiladi
    return javob_


@transaction.atomic
def otkaz(profil) -> dict:
    h = _qulfla(profil)
    j = h.joriy
    if not j:
        raise KarvonXato("bekat_yoq")
    if j["otkaz"] >= MAX_OTKAZ:
        raise KarvonXato("otkaz_limit")
    j["otkaz"] += 1
    return _yechildi(h, 0, [])


def maslahat(profil, ishlatilgan) -> dict:
    h = KarvonHolat.objects.filter(profile=profil).first()
    if not h or not h.joriy:
        raise KarvonXato("bekat_yoq")
    v = h.joriy["vazifa"]
    if v["tur"] == "yol":
        return {"tanlov": v["maqsad"]}
    if v["tur"] == "xotira":
        raise KarvonXato("maslahat_yoq")
    band = {x for x in (ishlatilgan or []) if isinstance(x, int)}
    return {"karta": next((i for i in v.get("yechim", []) if i not in band), None)}


@transaction.atomic
def qayta(profil) -> dict:
    """
    Keyingi safar — faqat Xivaga yetib kelgan karvon uchun.

    Yo'l TUGAMAYDI: Xivadan karvon ortga qaytadi va sonlar kattalashadi
    (`kuch`). Yig'ilgan yulduz yo'qolmaydi — u `otgan_yulduz` ga
    qo'shiladi, ro'yxatda esa avval mavsum, keyin bekat solishtiriladi.
    """
    h = _qulfla(profil)
    if h.bekat < BEKATLAR:
        raise KarvonXato("tugamagan")
    h.otgan_yulduz = (h.otgan_yulduz or 0) + (h.yulduz or 0)
    h.mavsum = min(MAX_MAVSUM, (h.mavsum or 1) + 1)
    h.bekat, h.yulduz, h.yulduzlar, h.joriy = 0, 0, {}, None
    h.save(update_fields=["bekat", "yulduz", "yulduzlar", "joriy", "mavsum", "otgan_yulduz"])
    return men(profil)
