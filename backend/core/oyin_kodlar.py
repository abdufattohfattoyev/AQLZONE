"""
SON KODLARI — Codenames uslubidagi jamoaviy o'yin.

──────────────────────────── QOIDA ────────────────────────────

    Ikki jamoa: KO'K va QIZIL. Stolda 16 ta karta, har birida ifoda
    (`3×4`, `20−8`). Kartalar yashirin rangda: 5 ko'k, 4 qizil, 6 neytral,
    1 bomba. Rangni faqat SARDORLAR ko'radi.

    Navbatdagi jamoa sardori bitta son va nechta karta ekanini aytadi:
    "12 · 3". Jamoadoshlar natijasi 12 bo'lgan kartalarni ochadi.

      o'z kartasi   — davom etadi (ko'pi bilan soni + 1 ta)
      neytral       — navbat o'tadi
      raqib kartasi — raqibga ochko, navbat o'tadi
      bomba         — jamoa DARHOL yutqazadi

    Barcha kartalarini birinchi ochgan jamoa yutadi.

──────────────────── HAR KIMGA O'Z DARAJASI ────────────────────

    Kartaning QIYMATI hamma uchun bitta, lekin IFODASI har kimga o'z
    darajasida ko'rinadi: 12 — bolaga `7 + 5`, kattaga `3 × 4` yoki
    `48 ÷ 4`. Shunda oila yoki sinf bitta stolda teng o'ynaydi.

──────────────────── NEGA QIYMATLAR TAKRORLANADI ────────────────────

    16 ta kartada 6 xil qiymat. Aks holda "12 · 3" degan maslahat
    bo'lmasdi — har son bitta kartaga tegishli bo'lib, sardorning ishi
    shunchaki "12 · 1" deyishga aylanardi. Takrorlanganda esa bitta son
    bir nechta rangdagi kartaga tushadi va sardor xavfni o'ylashi kerak.

Modul SOF: bazani bilmaydi.
"""
from __future__ import annotations

import random

MIN, MAX = 4, 8
ROBOT_GACHA = 4

KOK, QIZIL, NEYTRAL, BOMBA = "kok", "qizil", "neytral", "bomba"
MASLAHAT_SONIYA = 60
TOPISH_SONIYA = 75

#: Robot odam jamoadoshi bor paytda shuncha kutadi — o'yinni odam o'ynasin.
ROBOT_KUTISH_ODAM = 14
ROBOT_KUTISH = 3


def ifoda(v: int, daraja: int, rng: random.Random) -> str:
    """Qiymat `v` uchun o'yinchi darajasidagi ifoda."""
    if daraja >= 3:
        if rng.random() < 0.5:
            k = rng.randint(2, 9)
            return f"{v * k} ÷ {k}"
        a = rng.randint(2, 9)
        b = v // a + 1
        c = a * b - v
        if c > 0:
            return f"{a} × {b} − {c}"
    if daraja >= 2:
        juftlar = [(a, v // a) for a in range(2, 10) if v % a == 0 and 2 <= v // a <= 12]
        if juftlar and rng.random() < 0.7:
            a, b = rng.choice(juftlar)
            return f"{a} × {b}"
        a = rng.randint(2, 5)
        b = v // a
        c = v - a * b
        if b >= 2 and c > 0:
            return f"{a} × {b} + {c}"
    if rng.random() < 0.5 and v >= 2:
        a = rng.randint(1, v - 1)
        return f"{a} + {v - a}"
    b = rng.randint(1, 9)
    return f"{v + b} − {b}"


def taxta(rng: random.Random) -> list[dict]:
    qiymatlar = rng.sample(range(6, 31), 6)
    sanoq = [3, 3, 3, 3, 2, 2]
    ro = [q for q, n in zip(qiymatlar, sanoq) for _ in range(n)]
    rng.shuffle(ro)
    ranglar = [KOK] * 5 + [QIZIL] * 4 + [NEYTRAL] * 6 + [BOMBA]
    rng.shuffle(ranglar)
    return [
        {"qiymat": q, "rang": r, "ochiq": False,
         "ifodalar": {str(d): ifoda(q, d, rng) for d in (1, 2, 3)}}
        for q, r in zip(ro, ranglar)
    ]


def boshla(azolar: list[dict], hozir: float, rng: random.Random, raund: int = 1, **_) -> dict:
    """
    Jamoalar kirish tartibida navbatma-navbat bo'linadi. Sardor har
    raundda almashadi — hamma sardor bo'lib ko'rsin.
    """
    jamoalar, azolar_by = {}, {KOK: [], QIZIL: []}
    for i, a in enumerate(azolar):
        j = KOK if i % 2 == 0 else QIZIL
        jamoalar[str(a["id"])] = j
        azolar_by[j].append(a)
    sardorlar = {j: str(r[(raund - 1) % len(r)]["id"]) for j, r in azolar_by.items()}
    d = {
        "tur": "kodlar", "kartalar": taxta(rng), "jamoalar": jamoalar, "sardorlar": sardorlar,
        "darajalar": {str(a["id"]): a["daraja"] for a in azolar},
        "robotlar": [str(a["id"]) for a in azolar if a["robot"]],
        "navbat": KOK, "belgilar": {}, "tarix": [], "tugadi": False, "golib": None, "sabab": "",
    }
    _maslahatga(d, KOK, hozir, rng)
    return d


def _raqib_jamoa(j: str) -> str:
    return QIZIL if j == KOK else KOK


def _maslahatga(d: dict, jamoa: str, hozir: float, rng: random.Random) -> None:
    d["navbat"] = jamoa
    d["bosqich"] = "maslahat"
    d["maslahat"] = None
    d["qolgan_ochish"] = 0
    d["ochildi"] = 0
    d["belgilar"] = {}
    d["muddat"] = hozir + MASLAHAT_SONIYA
    sardor = d["sardorlar"][jamoa]
    d["bot_vaqt"] = hozir + rng.uniform(3, 5) if sardor in d["robotlar"] else None


def _navbat_otsin(d: dict, hozir: float, rng: random.Random) -> None:
    _maslahatga(d, _raqib_jamoa(d["navbat"]), hozir, rng)


def _qoldi(d: dict, jamoa: str) -> int:
    return sum(1 for k in d["kartalar"] if k["rang"] == jamoa and not k["ochiq"])


def _tarix(d: dict, yozuv: dict, hozir: float) -> None:
    d["tarix"] = (d["tarix"] + [{**yozuv, "vaqt": hozir}])[-12:]


def _odam_topuvchi_bormi(d: dict, jamoa: str) -> bool:
    return any(j == jamoa and k != d["sardorlar"][jamoa] and k not in d["robotlar"]
               for k, j in d["jamoalar"].items())


def _topishga(d: dict, hozir: float, rng: random.Random) -> None:
    d["bosqich"] = "topish"
    d["muddat"] = hozir + TOPISH_SONIYA
    d["bot_vaqt"] = _robot_navbati(d, hozir, rng)


def _robot_navbati(d: dict, hozir: float, rng: random.Random) -> float | None:
    jamoa = d["navbat"]
    robot_bor = any(j == jamoa and k != d["sardorlar"][jamoa] and k in d["robotlar"]
                    for k, j in d["jamoalar"].items())
    if not robot_bor:
        return None
    kut = ROBOT_KUTISH_ODAM if _odam_topuvchi_bormi(d, jamoa) else ROBOT_KUTISH
    return hozir + kut + rng.uniform(0, 1.5)


def _maslahat(d: dict, son, soni, hozir: float, rng: random.Random, kim: str) -> str:
    try:
        son, soni = int(son), int(soni)
    except (TypeError, ValueError):
        return "notogri"
    if not (0 <= son <= 9999 and 1 <= soni <= 5):
        return "notogri"
    d["maslahat"] = {"son": son, "soni": soni}
    d["qolgan_ochish"] = soni + 1
    _tarix(d, {"tur": "maslahat", "jamoa": d["navbat"], "kim": kim, "son": son, "soni": soni}, hozir)
    _topishga(d, hozir, rng)
    return ""


def _och(d: dict, i, hozir: float, rng: random.Random, kim: str) -> str:
    if not isinstance(i, int) or not (0 <= i < len(d["kartalar"])):
        return "notogri"
    k = d["kartalar"][i]
    if k["ochiq"]:
        return "ochiq"
    k["ochiq"] = True
    jamoa = d["navbat"]
    d["belgilar"].pop(str(i), None)
    _tarix(d, {"tur": "och", "jamoa": jamoa, "kim": kim, "i": i, "rang": k["rang"]}, hozir)

    if k["rang"] == BOMBA:
        d.update(tugadi=True, golib=_raqib_jamoa(jamoa), sabab="bomba", muddat=None)
        return ""
    for j in (KOK, QIZIL):
        if _qoldi(d, j) == 0:
            d.update(tugadi=True, golib=j, sabab="hammasi", muddat=None)
            return ""
    if k["rang"] == jamoa:
        d["ochildi"] += 1
        d["qolgan_ochish"] -= 1
        if d["qolgan_ochish"] <= 0:
            _navbat_otsin(d, hozir, rng)
        else:
            d["bot_vaqt"] = _robot_navbati(d, hozir, rng)
        return ""
    _navbat_otsin(d, hozir, rng)
    return ""


def amal(d: dict, azo_id: int, data: dict, hozir: float, rng: random.Random) -> str:
    k = str(azo_id)
    if d["tugadi"]:
        return "tugagan"
    jamoa = d["jamoalar"].get(k)
    if jamoa is None:
        return "begona"
    tur = data.get("tur")
    sardormi = d["sardorlar"][jamoa] == k

    if tur == "belgi":
        # Belgini istalgan jamoadosh qo'yadi — bu "men shuni o'ylayapman".
        if jamoa != d["navbat"] or d["bosqich"] != "topish" or sardormi:
            return "navbat_emas"
        i = str(data.get("i"))
        royxat = d["belgilar"].setdefault(i, [])
        if k in royxat:
            royxat.remove(k)
        else:
            royxat.append(k)
        return ""

    if jamoa != d["navbat"]:
        return "navbat_emas"
    if tur == "maslahat":
        if not sardormi or d["bosqich"] != "maslahat":
            return "ruxsat_yoq"
        return _maslahat(d, data.get("son"), data.get("soni"), hozir, rng, k)
    if tur == "och":
        if sardormi or d["bosqich"] != "topish":
            return "ruxsat_yoq"
        return _och(d, data.get("i"), hozir, rng, k)
    if tur == "tugat":
        if sardormi or d["bosqich"] != "topish" or d["ochildi"] < 1:
            return "ruxsat_yoq"
        _tarix(d, {"tur": "tugat", "jamoa": jamoa, "kim": k}, hozir)
        _navbat_otsin(d, hozir, rng)
        return ""
    return "notogri"


def _robot_maslahati(d: dict) -> tuple[int, int]:
    """Robot sardor: o'z kartalari eng ko'p, bomba yo'q qiymatni tanlaydi."""
    jamoa = d["navbat"]
    yopiq = [k for k in d["kartalar"] if not k["ochiq"]]
    eng, tanlov = None, None
    for q in {k["qiymat"] for k in yopiq}:
        shu = [k for k in yopiq if k["qiymat"] == q]
        if any(k["rang"] == BOMBA for k in shu):
            continue
        ozi = sum(1 for k in shu if k["rang"] == jamoa)
        if not ozi:
            continue
        raqib = sum(1 for k in shu if k["rang"] == _raqib_jamoa(jamoa))
        baho = ozi - 0.7 * raqib - 0.3 * (len(shu) - ozi - raqib)
        if eng is None or baho > eng:
            eng, tanlov = baho, (q, ozi)
    if tanlov is None:
        k = next(k for k in yopiq if k["rang"] == jamoa)
        return k["qiymat"], 1
    return tanlov


def _robot_yurishi(d: dict, hozir: float, rng: random.Random) -> None:
    jamoa = d["navbat"]
    if d["bosqich"] == "maslahat":
        son, soni = _robot_maslahati(d)
        _maslahat(d, son, soni, hozir, rng, d["sardorlar"][jamoa])
        return
    robot = next(k for k, j in d["jamoalar"].items()
                 if j == jamoa and k != d["sardorlar"][jamoa] and k in d["robotlar"])
    son = d["maslahat"]["son"]
    mos = [i for i, k in enumerate(d["kartalar"]) if not k["ochiq"] and k["qiymat"] == son]
    if not mos and d["ochildi"] >= 1:
        _tarix(d, {"tur": "tugat", "jamoa": jamoa, "kim": robot}, hozir)
        _navbat_otsin(d, hozir, rng)
        return
    yopiq = [i for i, k in enumerate(d["kartalar"]) if not k["ochiq"]]
    # Robot ham adashadi — aks holda u hisoblashda hech qachon xato qilmas edi.
    i = rng.choice(yopiq) if (not mos or rng.random() < 0.1) else rng.choice(mos)
    _och(d, i, hozir, rng, robot)


def tick(d: dict, hozir: float, rng: random.Random, ketganlar: set[str]) -> bool:
    if d["tugadi"]:
        return False
    # Sardor ketgan bo'lsa jamoadagi boshqa odamga o'tadi.
    for jamoa, sardor in list(d["sardorlar"].items()):
        if sardor in ketganlar:
            qolganlar = [k for k, j in d["jamoalar"].items() if j == jamoa and k not in ketganlar]
            if qolganlar:
                d["sardorlar"][jamoa] = qolganlar[0]
    if d.get("bot_vaqt") and hozir >= d["bot_vaqt"]:
        d["bot_vaqt"] = None
        _robot_yurishi(d, hozir, rng)
        return True
    if d.get("muddat") and hozir >= d["muddat"]:
        _tarix(d, {"tur": "vaqt", "jamoa": d["navbat"]}, hozir)
        _navbat_otsin(d, hozir, rng)
        return True
    return False


def korinish(d: dict, azo_id: int, hozir: float) -> dict:
    """Kartalar rangi va qiymati faqat sardorga yoki ochilgandan keyin."""
    men = str(azo_id)
    jamoa = d["jamoalar"].get(men)
    sardor = jamoa is not None and d["sardorlar"][jamoa] == men
    daraja = str(d["darajalar"].get(men, 2))
    kartalar = []
    for k in d["kartalar"]:
        korinadi = sardor or k["ochiq"] or d["tugadi"]
        kartalar.append({
            "ifoda": k["ifodalar"][daraja],
            "ochiq": k["ochiq"],
            "rang": k["rang"] if korinadi else None,
            "qiymat": k["qiymat"] if korinadi else None,
        })
    return {
        "kartalar": kartalar, "jamoalar": d["jamoalar"], "sardorlar": d["sardorlar"],
        "navbat": d["navbat"], "bosqich": d["bosqich"], "maslahat": d["maslahat"],
        "qolganOchish": d["qolgan_ochish"], "ochildi": d["ochildi"],
        "belgilar": d["belgilar"], "tarix": d["tarix"][-6:],
        "qoldi": {KOK: _qoldi(d, KOK), QIZIL: _qoldi(d, QIZIL)},
        "qolgan": max(0, int((d.get("muddat") or hozir) - hozir)),
        "menJamoa": jamoa, "menSardor": sardor,
        "tugadi": d["tugadi"], "golib": d["golib"], "sabab": d["sabab"],
    }


def natija(d: dict) -> dict[str, dict]:
    ro = {}
    for k, j in d["jamoalar"].items():
        golib = d["golib"] == j
        ochko = 30 if golib else 10
        if golib and d["sardorlar"][j] == k:
            ochko += 5
        ro[k] = {"golib": golib, "ochko": ochko, "jamoa": j}
    return ro
