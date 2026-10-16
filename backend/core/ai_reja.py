"""
AI reja → bosh sahifadagi KUNLIK ish: tushuntirish (AI dars) va vazifa.

─────────────────── NEGA ───────────────────

Ilgari AI reja faqat suhbatdagi matn edi: odam o'qib, yopib, unutardi.
Abituriyentga "bugun nima qilay?" degan savolga har kuni javob kerak.
Endi reja javobidagi `reja` chizmasi (`ai.CHIZMA`) shu yerda tuzilma
bo'lib saqlanadi va bosh sahifa har kuni o'sha kunning ishlarini beradi:
avval AI tushuntiradi, keyin o'sha DTM mavzusidan 10 ta savol.

─────────────────── QAYERDA SAQLANADI ───────────────────

Alohida jadval YO'Q — reja suhbatining `kontekst` ida:

    kontekst["reja"] = {
        "boshlandi": "2026-10-16",          # 1-kun shu sana (Toshkent)
        "kunlar": [{"kun", "ishlar": [{"mavzu", "daqiqa", "slug"}]}],
        "holat": {"0-1": {"s": 512, "v": [8, 10]}},   # kun-ish → dars, vazifa
    }

Reja suhbatning o'ziga bog'liq: yangi reja so'ralsa — yangi suhbat va
eskisi o'z-o'zidan chetga chiqadi. Bitta suhbatda AI rejani qayta
tuzsa (odam "o'zgartiring" desa) — reja almashadi va 1-kundan boshlanadi.

─────────────────── O'TGAN KUN ───────────────────

Vazifa ishlangan-u, 60% dan kam bo'lsa — keyingi kunlarda ham ro'yxatda
qoladi ("ertaga yana beriladi"), to o'tilguncha. Umuman ishlanmagan ish
esa sudralmaydi: aks holda uch kun kirmagan odam o'n beshta qarzni
ko'rib, umuman qaytmasdi.
"""
from __future__ import annotations

import json
from datetime import date

from django.db import transaction
from django.utils import timezone

from .models import AiSuhbat, Pupil

#: DTM mavzulari — `lib/dtmMavzu.ts` va `imtihon.MAVZU_SLUGLAR` bilan bir xil.
#: Nomlar modelga: rejadagi har ish shu ro'yxatdagi slug bilan bog'lanadi.
MAVZULAR = {
    "ifodalar": "Algebraik ifodalar va kasrlar",
    "tenglamalar": "Tenglamalar va sistemalar",
    "tengsizliklar": "Tengsizliklar",
    "funksiyalar": "Funksiyalar va grafiklar",
    "progressiyalar": "Progressiyalar",
    "trigonometriya": "Trigonometriya",
    "logarifm": "Ko'rsatkichli va logarifmik",
    "hosila-integral": "Hosila va integral",
    "ehtimollik": "Kombinatorika va ehtimollik",
    "uchburchaklar": "Burchaklar va uchburchaklar",
    "tortburchak-aylana": "To'rtburchak, aylana, yuzlar",
    "vektorlar": "Vektorlar",
    "stereometriya": "Stereometriya",
}

#: Vazifa shu ulushdan kam bo'lsa — ertaga yana beriladi.
OTISH = 0.6
#: Vazifadagi savollar soni (mijoz ham shuncha so'raydi).
VAZIFA_SAVOL = 10


def korsatma() -> str:
    """Reja ko'rsatmasiga qo'shiladigan mavzular ro'yxati."""
    qator = "; ".join(f"{s} — {n}" for s, n in MAVZULAR.items())
    return ("Rejadagi HAR ishga \"slug\" qo'sh — quyidagi DTM mavzularidan eng mosi "
            f"(ilova shu mavzudan vazifa beradi): {qator}. "
            'Masalan: {"mavzu":"Trigonometrik tenglamalar","daqiqa":35,"slug":"trigonometriya"}. '
            "To'liq variant kuni uchun slug yozma.")


def _bugun() -> date:
    return timezone.localdate()


def ajrat(matn: str) -> list[dict] | None:
    """AI javobidagi oxirgi `reja` chizmasini tozalab oladi (yo'q bo'lsa — None)."""
    from .ai import CHIZMA_BLOK

    topilgan = None
    for m in CHIZMA_BLOK.finditer(matn or ""):
        try:
            d = json.loads(m.group(1))
        except ValueError:
            continue
        if isinstance(d, dict) and d.get("tur") == "reja":
            topilgan = d
    if topilgan is None:
        return None
    kunlar = []
    for k in (topilgan.get("kunlar") or [])[:14]:
        if not isinstance(k, dict):
            continue
        ishlar = []
        for i in (k.get("ishlar") or [])[:4]:
            if not isinstance(i, dict) or not str(i.get("mavzu") or "").strip():
                continue
            try:
                daqiqa = max(0, min(240, int(i.get("daqiqa") or 0)))
            except (TypeError, ValueError):
                daqiqa = 0
            slug = str(i.get("slug") or "")
            ishlar.append({"mavzu": str(i["mavzu"]).strip()[:60], "daqiqa": daqiqa,
                           "slug": slug if slug in MAVZULAR else ""})
        if ishlar:
            kunlar.append({"kun": str(k.get("kun") or "")[:16], "ishlar": ishlar})
    return kunlar or None


def javobdan_saqla(s: AiSuhbat, matn: str) -> bool:
    """Reja suhbatidagi tayyor javob — reja bo'lsa saqlanadi (1-kun = bugun)."""
    if s.tur != AiSuhbat.REJA:
        return False
    kunlar = ajrat(matn)
    if not kunlar:
        return False
    with transaction.atomic():
        s = AiSuhbat.objects.select_for_update().get(pk=s.pk)
        k = dict(s.kontekst or {})
        k["reja"] = {"boshlandi": _bugun().isoformat(), "kunlar": kunlar, "holat": {}}
        s.kontekst = k
        s.save(update_fields=["kontekst"])
    return True


def _oxirgi(pupil: Pupil) -> AiSuhbat | None:
    for s in pupil.ai_suhbatlar.filter(tur=AiSuhbat.REJA).order_by("-created_at")[:5]:
        if (s.kontekst or {}).get("reja"):
            return s
    return None


def _otdimi(v) -> bool:
    return isinstance(v, list) and len(v) == 2 and v[1] > 0 and v[0] / v[1] >= OTISH


def bugun(pupil: Pupil) -> dict | None:
    """
    `GET /api/v1/ai/reja` — bugungi ishlar. Reja yo'q — None.

    Har ish `kalit` ("kun-ish") bilan: dars va vazifa shu kalit bilan
    yoziladi, ya'ni o'tgan kundan qolgan ish ham o'z joyiga yoziladi.
    """
    s = _oxirgi(pupil)
    if s is None:
        return None
    r = s.kontekst["reja"]
    kunlar = r.get("kunlar") or []
    holat = r.get("holat") or {}
    try:
        boshi = date.fromisoformat(r.get("boshlandi") or "")
    except ValueError:
        return None
    indeks = (_bugun() - boshi).days
    natija = {"suhbat": s.pk, "kun": indeks + 1, "jami": len(kunlar), "tugadi": indeks >= len(kunlar),
              "nom": "", "ishlar": []}

    def ish(ki: int, ii: int, otgan: bool) -> dict:
        i = kunlar[ki]["ishlar"][ii]
        h = holat.get(f"{ki}-{ii}") or {}
        return {"kalit": f"{ki}-{ii}", "mavzu": i["mavzu"], "daqiqa": i["daqiqa"], "slug": i["slug"],
                "dars": h.get("s"), "vazifa": h.get("v"), "otgan": otgan}

    # Oldingi kunlardan: ishlangan, lekin o'tilmagan vazifalar.
    for ki in range(min(max(indeks, 0), len(kunlar))):
        for ii, _ in enumerate(kunlar[ki]["ishlar"]):
            v = (holat.get(f"{ki}-{ii}") or {}).get("v")
            if v and not _otdimi(v):
                natija["ishlar"].append(ish(ki, ii, True))
    if 0 <= indeks < len(kunlar):
        natija["nom"] = kunlar[indeks]["kun"]
        natija["ishlar"] += [ish(indeks, ii, False) for ii in range(len(kunlar[indeks]["ishlar"]))]
    return natija


def _ish_ol(s: AiSuhbat, kalit: str) -> tuple[int, int, dict] | None:
    try:
        ki, ii = (int(x) for x in str(kalit).split("-"))
        return ki, ii, s.kontekst["reja"]["kunlar"][ki]["ishlar"][ii]
    except (ValueError, KeyError, IndexError, TypeError):
        return None


def _holat_yoz(suhbat: AiSuhbat, kalit: str, **qiymat) -> None:
    with transaction.atomic():
        s = AiSuhbat.objects.select_for_update().get(pk=suhbat.pk)
        k = dict(s.kontekst)
        r = dict(k["reja"])
        holat = dict(r.get("holat") or {})
        holat[kalit] = {**(holat.get(kalit) or {}), **qiymat}
        r["holat"] = holat
        k["reja"] = r
        s.kontekst = k
        s.save(update_fields=["kontekst"])


def dars(pupil: Pupil, kalit: str) -> AiSuhbat:
    """
    Ish bo'yicha AI dars. Allaqachon boshlangan bo'lsa — o'sha suhbat
    (qayta bosish yangi javob, ya'ni pul sarflamasin). `AiXato` chiqishi mumkin.
    """
    from . import ai as AI

    s = _oxirgi(pupil)
    topildi = _ish_ol(s, kalit) if s else None
    if topildi is None:
        raise AI.AiXato("bosh")
    _, _, i = topildi
    eski = ((s.kontekst["reja"].get("holat") or {}).get(kalit) or {}).get("s")
    if eski:
        bor = AiSuhbat.objects.filter(pk=eski, pupil=pupil).first()
        if bor is not None:
            return bor
    yangi, _ = AI.boshla(pupil, AiSuhbat.DARS, i["mavzu"], kontekst={
        "reja": s.pk, "kalit": kalit, "mavzu": i["mavzu"], "daqiqa": i["daqiqa"], "slug": i["slug"]})
    _holat_yoz(s, kalit, s=yangi.pk)
    return yangi


def vazifa(pupil: Pupil, kalit: str, togri, jami) -> dict | None:
    """Vazifa natijasi. Eng YAXSHISI qoladi — qayta ishlash yomonlashtirmaydi."""
    s = _oxirgi(pupil)
    if s is None or _ish_ol(s, kalit) is None:
        return None
    try:
        togri, jami = int(togri), int(jami)
    except (TypeError, ValueError):
        return None
    if not (0 < jami <= 50 and 0 <= togri <= jami):
        return None
    eski = ((s.kontekst["reja"].get("holat") or {}).get(kalit) or {}).get("v")
    if not (isinstance(eski, list) and len(eski) == 2 and eski[1] and eski[0] / eski[1] >= togri / jami):
        _holat_yoz(s, kalit, v=[togri, jami])
    return bugun(pupil)
