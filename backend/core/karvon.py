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

D = {
    1: {"min": 1, "max": 9, "amallar": ["+", "−"], "chegara": 20},
    2: {"min": 2, "max": 12, "amallar": ["+", "−", "×"], "chegara": 80},
    3: {"min": 3, "max": 20, "amallar": ["+", "−", "×", "÷"], "chegara": 300},
}
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
    d = D[j["daraja"]]
    return {"id": j["id_son"], "v": rng.randint(d["min"], d["max"]), "mad": rng.choice(MADAN)}


def _vazifa(j: dict, bekat: int, rng: random.Random) -> dict:
    q, d, soda = j["qol"], D[j["daraja"]], j.get("soda")
    tur = NAVBAT[(bekat * 3 + j["tosiq"]) % len(NAVBAT)]
    if obhavo(bekat) == "boron" and j["tosiq"] == 0:
        tur = "boron"
    if bekat % 3 == 2 and j["tosiq"] == 2:
        tur = "qaroqchi"
    if j.get("yetak") and bekat == 0 and j["tosiq"] == 0:
        a, b = sorted(q, key=lambda k: k["v"])[:2]
        return {"tur": "tosh", "maqsad": a["v"] + b["v"], "yechim": [a["id"], b["id"]], "yetak": True}

    def aral():
        x = list(range(len(q)))
        rng.shuffle(x)
        return x

    if tur == "boron":
        tan = aral()[:2 if j["daraja"] == 1 or soda else rng.randint(2, 3)]
        return {"tur": tur, "maqsad": sum(q[i]["v"] for i in tan), "yechim": [q[i]["id"] for i in tan]}

    if tur in ("tosh", "qaroqchi"):
        boss = tur == "qaroqchi"
        for u in range(120):
            k = min(3, len(q)) if boss else (3 if j["daraja"] == 3 and not soda else
                                             (3 if j["daraja"] == 2 and not soda and rng.random() < .35 else 2))
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
            k = rng.randint(1, 9 if j["daraja"] == 1 else 25)
            yoz = f"? + {k} = {c['v'] + k}"
        elif op == "−":
            k = rng.randint(1, c["v"] - 1)
            yoz = f"? − {k} = {c['v'] - k}"
        elif op == "×":
            k = rng.randint(2, 6 if j["daraja"] == 2 else 9)
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
        kmax = 4 if j["daraja"] == 1 else 9
        if c["v"] >= 5 and rng.random() < .6:
            k = rng.randint(1, min(kmax, (c["v"] - 1) // 4))
            qator = [c["v"] - 4 * k, c["v"] - 3 * k, c["v"] - 2 * k, c["v"] - k]
        else:
            k = -rng.randint(1, 3 if j["daraja"] == 1 else kmax)
            qator = [c["v"] - 4 * k, c["v"] - 3 * k, c["v"] - 2 * k, c["v"] - k]
        return {"tur": tur, "maqsad": c["v"], "yechim": [c["id"]],
                "variant": {"qator": qator}, "qadam": k}

    if tur == "xotira":
        yuklar = rng.sample(YUKLAR, 4 if j["daraja"] == 1 else 5)
        yoq = rng.randrange(len(yuklar))
        return {"tur": tur, "maqsad": yoq, "variant": {"yuklar": yuklar, "yoq": yoq}}

    # yo'l ayrimi
    katta = 9 if j["daraja"] == 1 else 20
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
    return {"bekat": h.bekat, "tosiq": j["tosiq"], "qol": j["qol"], "vazifa": _ochiq(j["vazifa"])}


def men(profil) -> dict:
    h = KarvonHolat.objects.filter(profile=profil).first()
    if not h:
        return {"bekat": 0, "yulduz": 0, "yulduzlar": {}}
    return {"bekat": h.bekat, "yulduz": h.yulduz, "yulduzlar": h.yulduzlar or {}}


def _qulfla(profil) -> KarvonHolat:
    h, _ = KarvonHolat.objects.get_or_create(profile=profil)
    return KarvonHolat.objects.select_for_update().get(pk=h.pk)


@transaction.atomic
def bekat_bosh(profil, daraja, qol_soni, soda=False, sahro=False, yetak=False) -> dict:
    h = _qulfla(profil)
    if h.bekat >= BEKATLAR:
        raise KarvonXato("tugagan")
    if h.joriy and h.joriy.get("bekat") == h.bekat:
        return _korinish(h)                            # to'xtagan joyidan
    daraja = daraja if daraja in D else 2
    rng = random.Random()
    j = {"bekat": h.bekat, "daraja": daraja, "tosiq": 0, "qol": [], "id_son": 0, "xato": 0,
         "otkaz": 0, "yulduzlar": [], "soda": bool(soda), "sahro": bool(sahro),
         "yetak": bool(yetak), "kechirildi": False,
         "qol_soni": max(5, min(7, int(qol_soni or 5)))}
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
    amallar = set(D[j["daraja"]]["amallar"])
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
    if j["tosiq"] >= 3:
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
    """Yangi mavsum — faqat Xivaga yetib kelgan karvon uchun."""
    h = _qulfla(profil)
    if h.bekat < BEKATLAR:
        raise KarvonXato("tugamagan")
    h.bekat, h.yulduz, h.yulduzlar, h.joriy = 0, 0, {}, None
    h.save(update_fields=["bekat", "yulduz", "yulduzlar", "joriy"])
    return men(profil)
