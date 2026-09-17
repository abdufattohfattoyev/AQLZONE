"""
SON KARTALARI — ikki kishilik kartali jang.

──────────────────────────── QOIDA ────────────────────────────

    Har kimda 100 jon. Navbat bilan yuriladi, jami `MAX_YURISH` ta yurish.
    Navbatdagi o'yinchi qo'lida 5 ta karta: 2 ta son va 3 ta amal
    (`+5`, `×3`, `÷2`, `x²`). Bitta sondan boshlab amallarni KETMA-KET
    qo'llab, NISHON songa yetish kerak: 7 → ×8 → −6 = 50.

    Qanchalik yaqin bo'lsa, raqibga shuncha kuchli zarba (`zarba`).
    Jon tugagan yoki yurishlar tugaganda ko'p jon qolgani yutadi.

────────────────── NEGA AMALLAR KETMA-KET ──────────────────

    "7 × 8 − 6" ni amallar tartibi bilan hisoblash kerakmi yoki chapdan
    o'ngga? Bola uchun bu alohida savol va o'yinning mazmuni emas.
    Kartalar zanjir bo'lib qo'yiladi va har biri OLDINGI NATIJAGA
    qo'llanadi — shunda ifoda ham, javob ham bir xil o'qiladi.

──────────────────── HAR KIMGA O'Z DARAJASI ────────────────────

    Qo'l o'yinchining darajasida yasaladi: bolaga `+` va `−` bilan
    kichik sonlar, kattaga `×`, `÷`, `x²`. Nishon esa HAR DOIM qo'ldagi
    kartalardan aniq yig'iladigan son — yechimi bor qo'l beriladi.

──────────────────── KOLLEKSIYA ────────────────────

    Maxsus kartalar (`MAXSUS`) g'alabadan keladi va kolleksiyada
    saqlanadi. Har o'yin boshida kolleksiyadan bittasi qo'lga tushadi va
    bir marta ishlatiladi.

Modul SOF: bazani bilmaydi. Vaqt va tasodif tashqaridan beriladi —
sinovda natija aniq bo'lishi uchun.
"""
from __future__ import annotations

import itertools
import random

MIN, MAX = 2, 2
#: "Robot bilan o'ynash" bosilganda xona shu songacha to'ldiriladi.
ROBOT_GACHA = 2

BOSH_JON = 100
MAX_YURISH = 10
YURISH_SONIYA = 45

#: Maxsus kartalar — kolleksiya shulardan iborat.
MAXSUS = ("ikki", "qalqon", "almashtir")

#: Daraja bo'yicha qo'l qoidalari: sonlar oralig'i, amallar va ularning
#: qiymati, natijaning chegarasi.
DARAJA = {
    1: {"son": (1, 10), "amallar": {"+": (1, 10), "-": (1, 10)}, "chegara": 40},
    2: {"son": (2, 12), "amallar": {"+": (1, 20), "-": (1, 20), "*": (2, 6)}, "chegara": 150},
    3: {"son": (2, 20), "amallar": {"+": (1, 30), "-": (1, 30), "*": (2, 9), "/": (2, 9), "kv": None},
        "chegara": 400},
}


def _qolla(qiymat: int, karta: dict) -> int | None:
    """Bitta amal kartasini qo'llaydi. Bo'linmasa yoki kvadrat juda katta bo'lsa — None."""
    a, v = karta["a"], karta.get("v")
    if a == "+":
        return qiymat + v
    if a == "-":
        return qiymat - v
    if a == "*":
        return qiymat * v
    if a == "/":
        return qiymat // v if v and qiymat % v == 0 else None
    if a == "kv":
        return qiymat * qiymat if abs(qiymat) <= 20 else None
    return None


def yozuv(karta: dict) -> str:
    """Karta yuzidagi yozuv."""
    if karta["t"] == "son":
        return str(karta["v"])
    belgi = {"+": "+", "-": "−", "*": "×", "/": "÷"}
    return "x²" if karta["a"] == "kv" else f"{belgi[karta['a']]}{karta['v']}"


def _amal_yasa(daraja: int, rng: random.Random) -> dict:
    q = DARAJA[daraja]["amallar"]
    a = rng.choice(list(q))
    if q[a] is None:
        return {"t": "amal", "a": a}
    return {"t": "amal", "a": a, "v": rng.randint(*q[a])}


def qol_yasa(daraja: int, rng: random.Random) -> tuple[list[dict], int]:
    """
    Qo'l va nishon: 2 ta son + 3 ta amal, nishon — yechimli.

    Avval YECHIM yasaladi (son → amal → amal), nishon uning natijasi.
    Keyin bitta ortiqcha son va bitta ortiqcha amal qo'shilib aralashtiriladi:
    yechim bor, lekin uni topish kerak.
    """
    q = DARAJA[daraja]
    for _ in range(200):
        bosh = {"t": "son", "v": rng.randint(*q["son"])}
        amallar = [_amal_yasa(daraja, rng) for _ in range(2)]
        qiymat = bosh["v"]
        for k in amallar:
            qiymat = _qolla(qiymat, k)
            if qiymat is None:
                break
        if qiymat is None or not (0 <= qiymat <= q["chegara"]) or qiymat == bosh["v"]:
            continue
        qol = [bosh, {"t": "son", "v": rng.randint(*q["son"])}, *amallar, _amal_yasa(daraja, rng)]
        rng.shuffle(qol)
        return qol, qiymat
    # Amalda yetib kelinmaydi, lekin cheksiz sikl bo'lmasin.
    return [{"t": "son", "v": 5}, {"t": "son", "v": 3}, {"t": "amal", "a": "+", "v": 4},
            {"t": "amal", "a": "+", "v": 1}, {"t": "amal", "a": "-", "v": 2}], 9


def hisobla(qol: list[dict], tartib: list[int]) -> tuple[int | None, str]:
    """
    Tanlangan kartalar zanjirini hisoblaydi. (natija, xato kaliti).

    Birinchi karta — son, qolganlari — amal, kamida bitta amal.
    """
    if len(tartib) < 2 or len(set(tartib)) != len(tartib):
        return None, "kam"
    if any(not isinstance(i, int) or i < 0 or i >= len(qol) for i in tartib):
        return None, "notogri"
    kartalar = [qol[i] for i in tartib]
    if kartalar[0]["t"] != "son" or any(k["t"] != "amal" for k in kartalar[1:]):
        return None, "tartib"
    qiymat = kartalar[0]["v"]
    for k in kartalar[1:]:
        qiymat = _qolla(qiymat, k)
        if qiymat is None:
            return None, "bolinmaydi"
    return qiymat, ""


def zarba(farq: int) -> int:
    """Nishondan farqqa qarab zarba. Aniq topish eng qadrli."""
    if farq == 0:
        return 25
    if farq <= 2:
        return 15
    if farq <= 5:
        return 8
    if farq <= 10:
        return 3
    return 0


def ifoda(qol: list[dict], tartib: list[int]) -> str:
    return " ".join(yozuv(qol[i]) for i in tartib)


# ------------------------------------------------------------ o'yin hayoti


def boshla(azolar: list[dict], hozir: float, rng: random.Random,
           kolleksiya: dict[int, list[str]] | None = None, **_) -> dict:
    """
    `azolar` — [{id, daraja, robot}] (kirish tartibida).
    `kolleksiya` — {azo id: egasidagi maxsus kartalar}.
    """
    kolleksiya = kolleksiya or {}
    oyinchilar = {}
    for a in azolar:
        bor = kolleksiya.get(a["id"]) or []
        oyinchilar[str(a["id"])] = {
            "jon": BOSH_JON, "qol": [], "nishon": 0, "daraja": a["daraja"], "robot": a["robot"],
            # Robotga maxsus karta berilmaydi: u kolleksiya yig'maydi.
            "maxsus": rng.choice(bor) if bor and not a["robot"] else None,
            "ishlatildi": False, "ikki": False, "qalqon": False,
            "aniq": 0, "zarba_jami": 0,
        }
    d = {
        "tur": "kartalar", "tartib": [str(a["id"]) for a in azolar],
        "navbat": str(azolar[0]["id"]), "yurish": 0, "max_yurish": MAX_YURISH,
        "oyinchilar": oyinchilar, "oxirgi": None, "tugadi": False, "golib": None,
    }
    _navbatni_ber(d, str(azolar[0]["id"]), hozir, rng)
    return d


def _raqib(d: dict, azo: str) -> str:
    return next(x for x in d["tartib"] if x != azo)


def _navbatni_ber(d: dict, azo: str, hozir: float, rng: random.Random) -> None:
    o = d["oyinchilar"][azo]
    o["qol"], o["nishon"] = qol_yasa(o["daraja"], rng)
    d["navbat"] = azo
    d["muddat"] = hozir + YURISH_SONIYA
    d["bot_vaqt"] = hozir + rng.uniform(3, 6) if o["robot"] else None


def _keyingi(d: dict, hozir: float, rng: random.Random) -> None:
    d["yurish"] += 1
    raqib = d["oyinchilar"][_raqib(d, d["navbat"])]
    men = d["oyinchilar"][d["navbat"]]
    if raqib["jon"] <= 0 or men["jon"] <= 0 or d["yurish"] >= d["max_yurish"]:
        _tugat(d)
        return
    _navbatni_ber(d, _raqib(d, d["navbat"]), hozir, rng)


def _tugat(d: dict, golib: str | None = None) -> None:
    d["tugadi"] = True
    d["muddat"] = None
    if golib is not None:
        d["golib"] = golib
        return
    a, b = d["tartib"]
    ja, jb = d["oyinchilar"][a]["jon"], d["oyinchilar"][b]["jon"]
    d["golib"] = a if ja > jb else b if jb > ja else "durang"


def _yur(d: dict, azo: str, tartib: list[int], hozir: float, rng: random.Random) -> str:
    o = d["oyinchilar"][azo]
    natija, xato = hisobla(o["qol"], tartib)
    if natija is None:
        return xato
    farq = abs(natija - o["nishon"])
    z = zarba(farq)
    if o["ikki"]:
        z *= 2
        o["ikki"] = False
    raqib = d["oyinchilar"][_raqib(d, azo)]
    if raqib["qalqon"] and z:
        z //= 2
        raqib["qalqon"] = False
    raqib["jon"] = max(0, raqib["jon"] - z)
    o["zarba_jami"] += z
    if farq == 0:
        o["aniq"] += 1
    d["oxirgi"] = {"azo": azo, "ifoda": ifoda(o["qol"], tartib), "natija": natija,
                   "nishon": o["nishon"], "zarba": z, "vaqt": hozir}
    _keyingi(d, hozir, rng)
    return ""


def _maxsus(d: dict, azo: str, rng: random.Random) -> str:
    o = d["oyinchilar"][azo]
    if not o["maxsus"] or o["ishlatildi"]:
        return "maxsus_yoq"
    o["ishlatildi"] = True
    if o["maxsus"] == "ikki":
        o["ikki"] = True
    elif o["maxsus"] == "qalqon":
        o["qalqon"] = True
    elif o["maxsus"] == "almashtir":
        o["qol"], o["nishon"] = qol_yasa(o["daraja"], rng)
    return ""


def amal(d: dict, azo_id: int, data: dict, hozir: float, rng: random.Random) -> str:
    """O'yinchi harakati. Bo'sh satr — bajarildi, aks holda xato kaliti."""
    azo = str(azo_id)
    if d["tugadi"]:
        return "tugagan"
    if azo not in d["oyinchilar"]:
        return "begona"
    if d["navbat"] != azo:
        return "navbat_emas"
    tur = data.get("tur")
    if tur == "yur":
        tartib = data.get("kartalar")
        if not isinstance(tartib, list):
            return "notogri"
        return _yur(d, azo, tartib, hozir, rng)
    if tur == "maxsus":
        return _maxsus(d, azo, rng)
    return "notogri"


def _robot_yurishi(o: dict, rng: random.Random) -> list[int]:
    """
    Robot eng yaxshi zanjirni qidiradi — lekin har doim emas.

    Har safar aniq topadigan robot bolani bezdiradi. Chorak holatda u
    birinchi uchragan yaroqli zanjirni tanlaydi.
    """
    qol = o["qol"]
    sonlar = [i for i, k in enumerate(qol) if k["t"] == "son"]
    amallar = [i for i, k in enumerate(qol) if k["t"] == "amal"]
    yaroqli = []
    for s in sonlar:
        for n in (1, 2, 3):
            for p in itertools.permutations(amallar, n):
                natija, _ = hisobla(qol, [s, *p])
                if natija is not None:
                    yaroqli.append((abs(natija - o["nishon"]), [s, *p]))
    if not yaroqli:
        return [sonlar[0], amallar[0]]
    if rng.random() < 0.25:
        return rng.choice(yaroqli)[1]
    return min(yaroqli, key=lambda x: x[0])[1]


def tick(d: dict, hozir: float, rng: random.Random, ketganlar: set[str]) -> bool:
    """Vaqt o'tishi: muddat, robot yurishi, chiqib ketgan o'yinchi. O'zgarsa True."""
    if d["tugadi"]:
        return False
    for azo in d["tartib"]:
        if azo in ketganlar:
            _tugat(d, _raqib(d, azo))
            return True
    navbat = d["navbat"]
    o = d["oyinchilar"][navbat]
    if o["robot"] and d.get("bot_vaqt") and hozir >= d["bot_vaqt"]:
        _yur(d, navbat, _robot_yurishi(o, rng), hozir, rng)
        return True
    if d.get("muddat") and hozir >= d["muddat"]:
        d["oxirgi"] = {"azo": navbat, "otkazdi": True, "vaqt": hozir}
        _keyingi(d, hozir, rng)
        return True
    return False


def korinish(d: dict, azo_id: int, hozir: float) -> dict:
    """Mijozga — raqibning qo'li va nishoni YASHIRIN."""
    men = str(azo_id)
    oyinchilar = {}
    for k, o in d["oyinchilar"].items():
        ozim = k == men
        oyinchilar[k] = {
            "jon": o["jon"], "daraja": o["daraja"], "aniq": o["aniq"],
            "maxsus": o["maxsus"] if ozim else bool(o["maxsus"] and not o["ishlatildi"]),
            "ishlatildi": o["ishlatildi"], "ikki": o["ikki"], "qalqon": o["qalqon"],
            **({"qol": [{**x, "yozuv": yozuv(x)} for x in o["qol"]], "nishon": o["nishon"]}
               if ozim and d["navbat"] == men and not d["tugadi"] else {}),
        }
    return {
        "navbat": d["navbat"], "yurish": d["yurish"], "maxYurish": d["max_yurish"],
        "qolgan": max(0, int((d.get("muddat") or hozir) - hozir)),
        "oyinchilar": oyinchilar, "oxirgi": d["oxirgi"],
        "tugadi": d["tugadi"], "golib": d["golib"],
    }


def natija(d: dict) -> dict[str, dict]:
    """{azo id: {golib, ochko}}. Mag'lub ham ochko oladi — kamroq."""
    ro = {}
    for k, o in d["oyinchilar"].items():
        if d["golib"] == "durang":
            golib, ochko = None, 20
        else:
            golib = d["golib"] == k
            ochko = 30 if golib else 10
        ro[k] = {"golib": golib, "ochko": ochko + o["aniq"] * 5}
    return ro
