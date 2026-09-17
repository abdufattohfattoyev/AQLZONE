"""
HISOB ROYALE — ko'p kishilik "oxirgi qolgan yutadi".

──────────────────────────── QOIDA ────────────────────────────

    Har kimda 3 yurak. Har kim O'Z savoliga javob beradi (o'z darajasida).
    Xato yoki vaqt tugashi — bitta yurak ketadi. Yurak tugasa chiqadi,
    lekin natijada o'z o'rnini oladi.

    Ketma-ket `HUJUM_ZANJIR` ta to'g'ri javob — HUJUM: tasodifiy tirik
    raqibning keyingi savoliga ajratilgan vaqt qisqaradi.

    Vaqt o'tgan sari hamma uchun vaqt qisqaradi — o'yin cho'zilib ketmasin
    (`savol_vaqti`).

────────────────── NEGA SAVOL SERVERDA ──────────────────

    Duelda savol mijozda yasaladi va server faqat ballni oladi. Bu yerda
    har javob kimningdir yuragini oladi yoki kimgadir hujum yuboradi, ya'ni
    aldash boshqalarga to'g'ridan-to'g'ri zarar. Savollar oddiy arifmetika,
    Python'da yasash ikki nusxa kod muammosini tug'dirmaydi.

Modul SOF: bazani bilmaydi.
"""
from __future__ import annotations

import random

MIN, MAX = 2, 30
ROBOT_GACHA = 8

YURAK = 3
HUJUM_ZANJIR = 3
BOSH_VAQT = 10
ENG_KAM_VAQT = 4
#: Hujum keyingi savoldan shuncha soniya oladi (to'planadi, chegara bilan).
HUJUM_SONIYA = 2
HUJUM_CHEGARA = 5
#: Har shuncha soniyada hamma uchun vaqt bir soniyaga qisqaradi.
TEZLASHISH_SONIYA = 30


def savol(daraja: int, rng: random.Random) -> dict:
    """Bitta savol va 4 ta variant — o'yinchining darajasida."""
    if daraja <= 1:
        a, b = rng.randint(1, 10), rng.randint(1, 10)
        if rng.random() < 0.5:
            matn, javob = f"{a} + {b}", a + b
        else:
            a, b = max(a, b), min(a, b)
            matn, javob = f"{a} − {b}", a - b
    elif daraja == 2:
        r = rng.random()
        if r < 0.5:
            a, b = rng.randint(2, 10), rng.randint(2, 10)
            matn, javob = f"{a} × {b}", a * b
        elif r < 0.75:
            a, b = rng.randint(10, 60), rng.randint(5, 39)
            matn, javob = f"{a} + {b}", a + b
        else:
            a, b = rng.randint(30, 99), rng.randint(5, 29)
            matn, javob = f"{a} − {b}", a - b
    else:
        r = rng.random()
        if r < 0.4:
            a, b = rng.randint(11, 25), rng.randint(3, 9)
            matn, javob = f"{a} × {b}", a * b
        elif r < 0.7:
            b, j = rng.randint(3, 12), rng.randint(3, 15)
            matn, javob = f"{b * j} ÷ {b}", j
        else:
            a = rng.randint(4, 19)
            matn, javob = f"{a}²", a * a

    variantlar = {javob}
    while len(variantlar) < 4:
        siljish = rng.choice([-10, -2, -1, 1, 2, 10, rng.randint(-5, 5)])
        if siljish and javob + siljish >= 0:
            variantlar.add(javob + siljish)
    ro = [str(x) for x in variantlar]
    rng.shuffle(ro)
    return {"matn": matn, "variantlar": ro, "javob": str(javob)}


def savol_vaqti(d: dict, o: dict, hozir: float) -> int:
    tezlashish = int((hozir - d["boshlandi"]) // TEZLASHISH_SONIYA)
    return max(ENG_KAM_VAQT, BOSH_VAQT - o["jazo"] - tezlashish)


def _yangi_savol(d: dict, o: dict, hozir: float, rng: random.Random) -> None:
    vaqt = savol_vaqti(d, o, hozir)
    o["jazo"] = 0
    o["savol"] = savol(o["daraja"], rng)
    o["vaqt"] = vaqt
    o["muddat"] = hozir + vaqt
    if o["robot"]:
        # Robot ba'zan vaqtiga ulgurmaydi — xuddi odamdek.
        o["bot_vaqt"] = hozir + rng.uniform(1.5, vaqt + 1.5)


def boshla(azolar: list[dict], hozir: float, rng: random.Random, **_) -> dict:
    d = {"tur": "royale", "boshlandi": hozir, "oyinchilar": {}, "hujumlar": [], "tugadi": False}
    for a in azolar:
        o = {"yurak": YURAK, "zanjir": 0, "togri": 0, "xato": 0, "hujum": 0, "tirik": True,
             "joy": None, "jazo": 0, "daraja": a["daraja"], "robot": a["robot"]}
        _yangi_savol(d, o, hozir, rng)
        d["oyinchilar"][str(a["id"])] = o
    return d


def _tirik(d: dict) -> list[str]:
    return [k for k, o in d["oyinchilar"].items() if o["tirik"]]


def _yurak_ol(d: dict, k: str) -> None:
    o = d["oyinchilar"][k]
    o["yurak"] -= 1
    o["zanjir"] = 0
    o["xato"] += 1
    if o["yurak"] <= 0:
        _chiqar(d, k)


def _chiqar(d: dict, k: str) -> None:
    o = d["oyinchilar"][k]
    if not o["tirik"]:
        return
    o["joy"] = len(_tirik(d))          # o'zi hali tirik sanaladi
    o["tirik"] = False
    o["yurak"] = 0


def _javob(d: dict, k: str, javob: str, hozir: float, rng: random.Random) -> None:
    o = d["oyinchilar"][k]
    if str(javob) == o["savol"]["javob"]:
        o["togri"] += 1
        o["zanjir"] += 1
        if o["zanjir"] >= HUJUM_ZANJIR:
            o["zanjir"] = 0
            nishonlar = [x for x in _tirik(d) if x != k]
            if nishonlar:
                kimga = rng.choice(nishonlar)
                q = d["oyinchilar"][kimga]
                q["jazo"] = min(HUJUM_CHEGARA, q["jazo"] + HUJUM_SONIYA)
                o["hujum"] += 1
                d["hujumlar"] = (d["hujumlar"] + [{"kimdan": k, "kimga": kimga, "vaqt": hozir}])[-10:]
    else:
        _yurak_ol(d, k)
    if o["tirik"]:
        _yangi_savol(d, o, hozir, rng)


def _tugashni_tekshir(d: dict) -> None:
    tirik = _tirik(d)
    if len(tirik) > 1:
        return
    for k in tirik:
        d["oyinchilar"][k]["joy"] = 1
        d["oyinchilar"][k]["tirik"] = False
    # Hammasi bir vaqtda chiqsa: eng ko'p to'g'ri javob bergani birinchi.
    tartib = sorted(d["oyinchilar"].items(), key=lambda x: (x[1]["joy"] or 99, -x[1]["togri"]))
    for i, (_, o) in enumerate(tartib, start=1):
        o["joy"] = i
    d["tugadi"] = True


def amal(d: dict, azo_id: int, data: dict, hozir: float, rng: random.Random) -> str:
    k = str(azo_id)
    if d["tugadi"]:
        return "tugagan"
    o = d["oyinchilar"].get(k)
    if o is None:
        return "begona"
    if not o["tirik"]:
        return "chiqqan"
    if data.get("tur") != "javob":
        return "notogri"
    if hozir > o["muddat"] + 1:       # tarmoq kechikishiga bir soniya
        return "kechikdi"
    _javob(d, k, str(data.get("javob", "")), hozir, rng)
    _tugashni_tekshir(d)
    return ""


def tick(d: dict, hozir: float, rng: random.Random, ketganlar: set[str]) -> bool:
    if d["tugadi"]:
        return False
    ozgardi = False
    for k in list(d["oyinchilar"]):
        o = d["oyinchilar"][k]
        if not o["tirik"]:
            continue
        if k in ketganlar:
            _chiqar(d, k)
            ozgardi = True
            continue
        if o["robot"] and hozir >= o.get("bot_vaqt", hozir + 1) and hozir <= o["muddat"]:
            aniqlik = {1: 0.8, 2: 0.85, 3: 0.9}.get(o["daraja"], 0.85)
            javob = o["savol"]["javob"] if rng.random() < aniqlik else next(
                v for v in o["savol"]["variantlar"] if v != o["savol"]["javob"])
            _javob(d, k, javob, hozir, rng)
            ozgardi = True
        elif hozir > o["muddat"] + 1:
            _yurak_ol(d, k)
            if o["tirik"]:
                _yangi_savol(d, o, hozir, rng)
            ozgardi = True
    if ozgardi:
        _tugashni_tekshir(d)
    return ozgardi


def korinish(d: dict, azo_id: int, hozir: float) -> dict:
    """Javob kaliti hech kimga ketmaydi. Boshqalarning savoli ham."""
    men = str(azo_id)
    oyinchilar = {}
    for k, o in d["oyinchilar"].items():
        x = {"yurak": o["yurak"], "tirik": o["tirik"], "joy": o["joy"], "togri": o["togri"],
             "hujum": o["hujum"], "daraja": o["daraja"]}
        if k == men and o["tirik"] and not d["tugadi"]:
            x["savol"] = {"matn": o["savol"]["matn"], "variantlar": o["savol"]["variantlar"]}
            x["qolgan"] = max(0.0, round(o["muddat"] - hozir, 1))
            x["vaqt"] = o["vaqt"]
            x["zanjir"] = o["zanjir"]
            x["jazo"] = o["jazo"]
        oyinchilar[k] = x
    return {
        "oyinchilar": oyinchilar,
        "tirikSoni": len(_tirik(d)),
        "hujumlar": d["hujumlar"],
        "tugadi": d["tugadi"],
    }


def natija(d: dict) -> dict[str, dict]:
    ro = {}
    for k, o in d["oyinchilar"].items():
        joy = o["joy"] or len(d["oyinchilar"])
        ochko = {1: 50, 2: 35, 3: 25}.get(joy, 10) + o["togri"]
        ro[k] = {"golib": joy == 1, "ochko": ochko, "joy": joy}
    return ro
