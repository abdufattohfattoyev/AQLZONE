"""
SEYF — yashirin xoinli jamoaviy o'yin.

──────────────────────────── QOIDA ────────────────────────────

    Jamoa seyf kodini topishi kerak. Kod bir nechta bo'lakdan hisoblanadi
    va har o'yinchiga BITTA bo'lak yashirin beriladi:

        A = 7        B = A + 3        Kod = A × B        Kod — juft son

    Yolg'iz hech kim yecha olmaydi. Bitta o'yinchi — XOIN: u o'z bo'lagini
    o'zgartirib aytadi ("B = A + 4") va jamoani noto'g'ri kodga olib
    boradi. Uni oddiy hisob bilan emas, bo'laklar orasidagi ZIDDIYATni
    topib fosh qilish kerak: 7 × 11 = 77 — toq, lekin "kod juft" degan
    bo'lak bor.

    1. MUHOKAMA   har kim bo'lagini "aytadi" (xoin — yolg'on variantni
                  tanlashi mumkin), tayyor gaplar bilan gaplashadi.
    2. OVOZ       har kim kodni yozadi va xoin deb o'ylaganini tanlaydi.

    Hisobchilarning ko'pchilik kodi to'g'ri bo'lsa — seyf ochiladi,
    hisobchilar yutadi. Aks holda xoin yutadi. Xoinni topgan har kim
    qo'shimcha ochko oladi — mag'lub ham.

──────────────────── NEGA ERKIN MATN YO'Q ────────────────────

    Bo'lak "aytish" ham tugma: hisobchida bitta variant (haqiqiysi),
    xoinda to'rtta (haqiqiysi + uchta ishonarli yolg'on). Erkin matn
    bolalar ilovasida xavfli, yolg'on variantlarni esa server shunday
    yasaydiki, ular BIR QARASHDA emas, hisoblaganda fosh bo'ladi.

──────────────────── ROBOTLAR ────────────────────

    Robot doim haqiqatni aytadi, kodni ko'pincha to'g'ri topadi. Odamlar
    uch kishidan kam bo'lsa xoin — ROBOT bo'ladi (ochiq belgilangan): bitta
    bola ham robotlar bilan "detektiv" o'ynay olsin.

Modul SOF: bazani bilmaydi.
"""
from __future__ import annotations

import random
from collections import Counter

MIN, MAX = 4, 8
ROBOT_GACHA = 4

MUHOKAMA_SONIYA = 120
OVOZ_SONIYA = 45


# ------------------------------------------------------------ jumboq


def _formula(d: int) -> tuple[str, callable]:
    if d <= 1:
        return "A + B", lambda a, b: a + b
    if d == 2:
        return "A × B", lambda a, b: a * b
    return "A × B − A", lambda a, b: a * b - a


def _xonali(n: int) -> str:
    return "bir" if n < 10 else "ikki" if n < 100 else "uch"


def bolak_matni(tur: str, j: dict, qiymat=None) -> str:
    """
    Bo'lak yozuvi. `qiymat` berilsa — o'sha qiymat bilan (yolg'on uchun).

    Matn o'zbekcha va SERVERDA yasaladi: bo'lak mazmuni sonlarga bog'liq va
    uni mijozda qayta yig'ish ikki joyda bir xil qoidani saqlashni talab
    qilardi.
    """
    A, B, k, kod = j["A"], j["B"], j["k"], j["kod"]
    if tur == "a":
        return f"A = {A if qiymat is None else qiymat}"
    if tur == "b":
        return f"B = A + {k if qiymat is None else qiymat}"
    if tur == "kod":
        return f"Kod = {j['formula'] if qiymat is None else qiymat}"
    if tur == "juft":
        juft = (kod % 2 == 0) if qiymat is None else qiymat
        return "Kod — juft son" if juft else "Kod — toq son"
    if tur == "chegara":
        x, katta = j["chegara"] if qiymat is None else qiymat
        return f"Kod {x} dan {'katta' if katta else 'kichik'}"
    if tur == "yigindi":
        return f"A + B = {A + B if qiymat is None else qiymat}"
    if tur == "b_juft":
        juft = (B % 2 == 0) if qiymat is None else qiymat
        return "B — juft son" if juft else "B — toq son"
    if tur == "oxirgi":
        return f"Kodning oxirgi raqami {kod % 10 if qiymat is None else qiymat}"
    if tur == "xona":
        return f"Kod {_xonali(kod) if qiymat is None else qiymat} xonali son"
    return ""


FORMULALAR = {
    "A + B": lambda a, b: a + b,
    "A × B": lambda a, b: a * b,
    "A × B − A": lambda a, b: a * b - a,
    "A × B + A": lambda a, b: a * b + a,
    "B − A": lambda a, b: b - a,
}


def asosiy_yolgonlar(tur: str, j: dict) -> list[tuple[str, dict]]:
    """
    Asosiy bo'lak (A, B, formula) uchun yolg'onlar va ular olib boradigan
    "soxta dunyo" — shu yolg'onga ishonilsa A, B va kod qancha bo'lardi.

    Soxta dunyo kerak, chunki yolg'on FOSH QILSA BO'LADIGAN bo'lishi shart:
    uni hech bo'lmasa bitta tekshiruv bo'lagi rad etishi kerak (`fosh_qiladimi`).
    """
    A, k, formula = j["A"], j["k"], j["formula"]
    f = FORMULALAR[formula]
    ro = []
    if tur == "a":
        for s in (-2, -1, 1, 2):
            a = A + s
            if a >= 1:
                ro.append((bolak_matni("a", j, a), {"A": a, "B": a + k, "kod": f(a, a + k)}))
    elif tur == "b":
        for s in (-2, -1, 1, 2):
            kk = k + s
            if kk >= 1:
                ro.append((bolak_matni("b", j, kk), {"A": A, "B": A + kk, "kod": f(A, A + kk)}))
    elif tur == "kod":
        for nom, g in FORMULALAR.items():
            if nom != formula and g(A, j["B"]) != j["kod"]:
                ro.append((bolak_matni("kod", j, nom), {"A": A, "B": j["B"], "kod": g(A, j["B"])}))
    return ro


def fosh_qiladimi(tekshiruv: str, j: dict, soxta: dict) -> bool:
    """Tekshiruv bo'lagi (haqiqiy) soxta dunyoda YOLG'ON bo'lib chiqadimi."""
    A, B, kod = soxta["A"], soxta["B"], soxta["kod"]
    if tekshiruv == "juft":
        return (kod % 2) != (j["kod"] % 2)
    if tekshiruv == "chegara":
        x, katta = j["chegara"]
        return (kod > x) != katta
    if tekshiruv == "yigindi":
        return A + B != j["A"] + j["B"]
    if tekshiruv == "b_juft":
        return (B % 2) != (j["B"] % 2)
    if tekshiruv == "oxirgi":
        return kod % 10 != j["kod"] % 10
    if tekshiruv == "xona":
        return _xonali(kod) != _xonali(j["kod"])
    return False


def yolgonlar(tur: str, j: dict, rng: random.Random) -> list[str]:
    """Bo'lakning uchta ISHONARLI yolg'on varianti."""
    kod = j["kod"]
    haqiqat = bolak_matni(tur, j)
    nomzod: list[str] = []
    if tur in ASOSIY:
        nomzod = [matn for matn, _ in asosiy_yolgonlar(tur, j)]
    elif tur == "juft":
        nomzod = [bolak_matni("juft", j, kod % 2 != 0)]
    elif tur == "chegara":
        x, _ = j["chegara"]
        # Faqat HAQIQATDA YOLG'ON gaplar: "Kod 64 dan katta" kod 70 bo'lsa
        # rost bo'lib qolardi va xoin bexosdan haqiqatni aytgan bo'lardi.
        nomzod = [bolak_matni("chegara", j, (y, katta))
                  for y in (x, x + 10, max(1, x - 10), x + 5) for katta in (True, False)
                  if (kod > y) != katta and y != kod]
    elif tur == "yigindi":
        nomzod = [bolak_matni("yigindi", j, j["A"] + j["B"] + s) for s in (-2, -1, 1, 2)]
    elif tur == "b_juft":
        nomzod = [bolak_matni("b_juft", j, j["B"] % 2 != 0)]
    elif tur == "oxirgi":
        nomzod = [bolak_matni("oxirgi", j, (kod + s) % 10) for s in (1, 2, 3, 4)]
    elif tur == "xona":
        nomzod = [bolak_matni("xona", j, x) for x in ("bir", "ikki", "uch")]
    nomzod = [x for x in dict.fromkeys(nomzod) if x != haqiqat]
    rng.shuffle(nomzod)
    return nomzod[:3]


def jumboq_yasa(d: int, rng: random.Random) -> dict:
    formula, f = _formula(d)
    A = rng.randint(2, 9)
    k = rng.randint(2, 6)
    B = A + k
    kod = f(A, B)
    x = max(1, kod + rng.choice([-1, 1]) * rng.randint(3, 10))
    return {"A": A, "B": B, "k": k, "kod": kod, "formula": formula, "chegara": (x, kod > x)}


ASOSIY = ["a", "b", "kod"]
TEKSHIRUV = ["juft", "chegara", "yigindi", "b_juft", "oxirgi", "xona"]


# ------------------------------------------------------------ o'yin hayoti


def _taqsimla(n: int, j: dict, rng: random.Random) -> tuple[str, list[str], list[str]]:
    """
    Xoinning bo'lagi, tekshiruv bo'laklari va xoinning yolg'on variantlari.

    ─────────────── NEGA TASODIFIY EMAS ───────────────

    Birinchi versiyada tekshiruv bo'laklari tasodifiy tanlanardi va xoin
    "B = A + 5" deb yolg'on aytganda uni hech narsa rad etmasdi: 66 ham,
    haqiqiy 54 ham juft. Hisobchilar kodni topa olmasdi — ya'ni o'yin
    matematikaga emas, omadga aylanardi.

    Endi xoinning HAR bir yolg'on varianti kamida bitta tekshiruv bo'lagi
    bilan zid keladi. Tekshiruvlar aynan shu yolg'onlarni ushlaydigan
    qilib tanlanadi, ushlanmaydigan yolg'on esa variantlardan chiqariladi.
    """
    n_tekshiruv = max(1, n - len(ASOSIY))
    for xoin_tur in rng.sample(ASOSIY + TEKSHIRUV, len(ASOSIY + TEKSHIRUV)):
        if xoin_tur in TEKSHIRUV:
            # Tekshiruv bo'lagidagi yolg'onni asosiy bo'laklardan hisoblab
            # fosh qilish mumkin — u doim ushlanadi.
            qolgan = [t for t in TEKSHIRUV if t != xoin_tur]
            tekshiruvlar = [xoin_tur] + rng.sample(qolgan, n_tekshiruv - 1)
            return xoin_tur, tekshiruvlar, yolgonlar(xoin_tur, j, rng)

        yolgon = asosiy_yolgonlar(xoin_tur, j)
        if not yolgon:
            continue
        tanlangan: list[str] = []
        nomzodlar = TEKSHIRUV[:]
        rng.shuffle(nomzodlar)
        for _ in range(n_tekshiruv):
            eng = max(nomzodlar, key=lambda t: sum(
                fosh_qiladimi(t, j, s) and not any(fosh_qiladimi(x, j, s) for x in tanlangan)
                for _, s in yolgon))
            tanlangan.append(eng)
            nomzodlar.remove(eng)
        fosh = [m for m, s in yolgon if any(fosh_qiladimi(t, j, s) for t in tanlangan)]
        if fosh:
            rng.shuffle(fosh)
            return xoin_tur, tanlangan, fosh[:3]
    tekshiruvlar = rng.sample(TEKSHIRUV, n_tekshiruv)
    return tekshiruvlar[0], tekshiruvlar, yolgonlar(tekshiruvlar[0], j, rng)


def boshla(azolar: list[dict], hozir: float, rng: random.Random, **_) -> dict:
    daraja = round(sum(a["daraja"] for a in azolar) / len(azolar))
    j = jumboq_yasa(daraja, rng)

    odamlar = [a for a in azolar if not a["robot"]]
    robotlar = [a for a in azolar if a["robot"]]
    xoin = rng.choice(odamlar if len(odamlar) >= 3 else (robotlar or odamlar))

    xoin_tur, tekshiruvlar, xoin_yolgonlari = _taqsimla(len(azolar), j, rng)
    qolgan_turlar = [t for t in ASOSIY + tekshiruvlar if t != xoin_tur][: len(azolar) - 1]
    rng.shuffle(qolgan_turlar)

    bolaklar = {}
    for a in azolar:
        k = str(a["id"])
        tur = xoin_tur if a["id"] == xoin["id"] else qolgan_turlar.pop()
        haqiqat = bolak_matni(tur, j)
        variantlar = [haqiqat]
        if a["id"] == xoin["id"]:
            variantlar += xoin_yolgonlari
        bolaklar[k] = {"tur": tur, "matn": haqiqat, "variantlar": variantlar}

    d = {
        "tur": "seyf", "daraja": daraja, "jumboq": j, "bolaklar": bolaklar,
        "xoin": str(xoin["id"]), "robotlar": [str(a["id"]) for a in robotlar],
        "odamlar": [str(a["id"]) for a in odamlar],
        "tartib": [str(a["id"]) for a in azolar],
        "bosqich": "muhokama", "muddat": hozir + MUHOKAMA_SONIYA,
        "aytilgan": [], "tayyorlar": [], "ovozlar": {},
        "bot_vaqt": {str(a["id"]): hozir + rng.uniform(4, 25) for a in robotlar},
        "tugadi": False, "yakun": None,
    }
    return d


def _aytdimi(d: dict, k: str) -> bool:
    return any(x["azo"] == k for x in d["aytilgan"])


def _ayt(d: dict, k: str, i: int, hozir: float) -> str:
    if _aytdimi(d, k):
        return "aytilgan"
    variantlar = d["bolaklar"][k]["variantlar"]
    if not isinstance(i, int) or not (0 <= i < len(variantlar)):
        return "notogri"
    d["aytilgan"].append({"azo": k, "matn": variantlar[i], "vaqt": hozir})
    return ""


def _ovozga(d: dict, hozir: float, rng: random.Random) -> None:
    # Muhokamada gapirmay qolgan robot — ovozdan oldin bo'lagini aytadi.
    for k in d["robotlar"]:
        if not _aytdimi(d, k):
            _robot_ayt(d, k, hozir, rng)
    d["bosqich"] = "ovoz"
    d["muddat"] = hozir + OVOZ_SONIYA
    d["bot_vaqt"] = {k: hozir + rng.uniform(3, 15) for k in d["robotlar"]}


def _robot_ayt(d: dict, k: str, hozir: float, rng: random.Random) -> None:
    variantlar = d["bolaklar"][k]["variantlar"]
    # Robot-xoin yolg'on aytadi, oddiy robot — haqiqatni.
    i = rng.randint(1, len(variantlar) - 1) if k == d["xoin"] and len(variantlar) > 1 else 0
    _ayt(d, k, i, hozir)


def _robot_ovoz(d: dict, k: str, rng: random.Random) -> None:
    kod = d["jumboq"]["kod"]
    if k == d["xoin"]:
        taxmin = kod + rng.choice([-7, -3, 3, 7])
    else:
        taxmin = kod if rng.random() < 0.65 else kod + rng.choice([-5, -2, 2, 5])
    boshqalar = [x for x in d["tartib"] if x != k]
    if k != d["xoin"] and rng.random() < 0.5:
        xoin = d["xoin"]
    else:
        xoin = rng.choice(boshqalar)
    d["ovozlar"][k] = {"kod": taxmin, "xoin": xoin}


def _hammasi_ovoz_berdimi(d: dict) -> bool:
    return all(k in d["ovozlar"] for k in d["tartib"])


def _tugat(d: dict) -> None:
    j = d["jumboq"]
    hisobchi_kodlari = [v["kod"] for k, v in d["ovozlar"].items() if k != d["xoin"] and v.get("kod") is not None]
    sanoq = Counter(hisobchi_kodlari)
    eng = max(sanoq.values(), default=0)
    yetakchilar = [x for x, n in sanoq.items() if n == eng]
    kod_togri = j["kod"] in yetakchilar and eng > 0

    xoin_sanoq = Counter(v["xoin"] for v in d["ovozlar"].values() if v.get("xoin"))
    eng_x = max(xoin_sanoq.values(), default=0)
    yetakchi_x = [x for x, n in xoin_sanoq.items() if n == eng_x]
    xoin_topildi = eng_x > 0 and yetakchi_x == [d["xoin"]]

    d["tugadi"] = True
    d["muddat"] = None
    d["yakun"] = {
        "kod": j["kod"], "kodTogri": kod_togri, "xoinTopildi": xoin_topildi,
        "jamoaKodi": yetakchilar[0] if len(yetakchilar) == 1 else None,
        "golib": "hisobchilar" if kod_togri else "xoin",
    }


def amal(d: dict, azo_id: int, data: dict, hozir: float, rng: random.Random) -> str:
    k = str(azo_id)
    if d["tugadi"]:
        return "tugagan"
    if k not in d["bolaklar"]:
        return "begona"
    tur = data.get("tur")

    if tur == "ayt":
        if d["bosqich"] != "muhokama":
            return "bosqich"
        return _ayt(d, k, data.get("i"), hozir)

    if tur == "ovozga":
        if d["bosqich"] != "muhokama":
            return "bosqich"
        if not _aytdimi(d, k):
            return "aytmadingiz"
        if k not in d["tayyorlar"]:
            d["tayyorlar"].append(k)
        if all(x in d["tayyorlar"] for x in d["odamlar"]):
            _ovozga(d, hozir, rng)
        return ""

    if tur == "ovoz":
        if d["bosqich"] != "ovoz":
            return "bosqich"
        if k in d["ovozlar"]:
            return "berilgan"
        try:
            kod = int(data.get("kod"))
        except (TypeError, ValueError):
            return "kod_yoq"
        xoin = str(data.get("xoin") or "")
        if xoin and (xoin not in d["bolaklar"] or xoin == k):
            return "notogri"
        d["ovozlar"][k] = {"kod": kod, "xoin": xoin}
        if all(x in d["ovozlar"] for x in d["odamlar"]):
            for r in d["robotlar"]:
                if r not in d["ovozlar"]:
                    _robot_ovoz(d, r, rng)
            _tugat(d)
        return ""

    return "notogri"


def tick(d: dict, hozir: float, rng: random.Random, ketganlar: set[str]) -> bool:
    if d["tugadi"]:
        return False
    ozgardi = False
    # Chiqib ketgan odam kutilmaydi: uning o'rniga "tayyor" va bo'sh ovoz.
    for k in ketganlar:
        if k in d["odamlar"]:
            d["odamlar"].remove(k)
            ozgardi = True

    for k, vaqt in list(d["bot_vaqt"].items()):
        if hozir < vaqt:
            continue
        del d["bot_vaqt"][k]
        if d["bosqich"] == "muhokama" and not _aytdimi(d, k):
            _robot_ayt(d, k, hozir, rng)
            ozgardi = True
        elif d["bosqich"] == "ovoz" and k not in d["ovozlar"]:
            _robot_ovoz(d, k, rng)
            ozgardi = True

    if d["bosqich"] == "muhokama" and (hozir >= d["muddat"] or not d["odamlar"]
                                       or all(x in d["tayyorlar"] for x in d["odamlar"])):
        _ovozga(d, hozir, rng)
        return True
    if d["bosqich"] == "ovoz":
        if hozir >= d["muddat"] or all(x in d["ovozlar"] for x in d["odamlar"]):
            for r in d["robotlar"]:
                if r not in d["ovozlar"]:
                    _robot_ovoz(d, r, rng)
            _tugat(d)
            return True
    return ozgardi


def korinish(d: dict, azo_id: int, hozir: float) -> dict:
    """Xoin kimligi va boshqalarning haqiqiy bo'lagi — faqat o'yin tugagach."""
    k = str(azo_id)
    men = d["bolaklar"].get(k)
    xoinman = k == d["xoin"]
    javob = {
        "bosqich": d["bosqich"],
        "qolgan": max(0, int((d.get("muddat") or hozir) - hozir)),
        "rol": "xoin" if xoinman else "hisobchi",
        "bolak": men["matn"] if men else None,
        "variantlar": men["variantlar"] if men else [],
        "aytdim": _aytdimi(d, k),
        "aytilgan": d["aytilgan"],
        "tayyorman": k in d["tayyorlar"],
        "tayyorSoni": len([x for x in d["tayyorlar"] if x in d["odamlar"]]),
        "odamSoni": len(d["odamlar"]),
        "ovozBerdim": k in d["ovozlar"],
        "ovozSoni": len(d["ovozlar"]),
        "jami": len(d["tartib"]),
        "tugadi": d["tugadi"],
        # Xoin kodni biladi — yolg'onini unga moslab tanlay olsin.
        "sirKod": d["jumboq"]["kod"] if xoinman else None,
    }
    if d["tugadi"]:
        javob["yakun"] = {
            **d["yakun"], "xoin": d["xoin"],
            "bolaklar": {x: b["matn"] for x, b in d["bolaklar"].items()},
            "ovozlar": d["ovozlar"],
        }
    return javob


def natija(d: dict) -> dict[str, dict]:
    y = d["yakun"] or {}
    kod = d["jumboq"]["kod"]
    ro = {}
    for k in d["tartib"]:
        ovoz = d["ovozlar"].get(k, {})
        if k == d["xoin"]:
            golib = y.get("golib") == "xoin"
            ochko = (40 if golib else 10) + (0 if y.get("xoinTopildi") else 10)
        else:
            golib = y.get("golib") == "hisobchilar"
            ochko = (30 if golib else 10) + (10 if ovoz.get("xoin") == d["xoin"] else 0) \
                + (5 if ovoz.get("kod") == kod else 0)
        ro[k] = {"golib": golib, "ochko": ochko}
    return ro
