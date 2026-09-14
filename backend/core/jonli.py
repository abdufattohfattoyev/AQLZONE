"""
Jonli faollik — kim hozir nima ishlayapti.

Ikki tomoni bor:

  * ILOVA signal yuboradi (`views.faollik` → `yoz`): test, dars yoki
    masala ochiq turganda har savolda va har 20 soniyada.
  * PANEL o'qiydi (`royxat`) — `/boshqaruv/jonli` sahifasi har 5
    soniyada so'raydi.

Qator tugashda o'chiriladi (`tozala`), lekin bunga TAYANILMAYDI:
ilovani yopgan telefon "chiqdim" deb aytishga ulgurmaydi. Shuning uchun
panel faqat yangi qatorlarni oladi (`ESKIRISH`) — signal to'xtagan odam
o'zi ro'yxatdan tushib ketadi.
"""
from __future__ import annotations

from datetime import timedelta

from django.utils import timezone

from .models import Faollik, Profile

#: Signal shundan eski bo'lsa — odam ishni tashlagan. Ilova har 20
#: soniyada yuboradi, ya'ni ikki-uch signal yo'qolsa ham (sekin internet)
#: odam ro'yxatdan sakrab chiqib ketmaydi.
ESKIRISH = 90

JOY_NOMI = dict(Faollik.JOYLAR)


def yoz(profile: Profile, joy: str, nom: str, savol: int, jami: int, togri: int) -> None:
    """
    Hozirgi holatni yozadi.

    `boshlandi` faqat ish ALMASHGANDA yangilanadi: bir testning har
    savolida qayta yozilsa, "12 daqiqadan beri" doim "hozirgina" bo'lib
    ko'rinardi.
    """
    if joy not in JOY_NOMI:
        return
    hozir = timezone.now()
    nom = (nom or "")[:120]
    eski = Faollik.objects.filter(pk=profile.pk).first()
    yangi_ish = (
        eski is None or eski.joy != joy or eski.nom != nom
        or (hozir - eski.updated_at).total_seconds() > ESKIRISH
        # Savol raqami orqaga ketdi — test qaytadan boshlangan.
        or savol < eski.savol
    )
    Faollik.objects.update_or_create(
        profile=profile,
        defaults={
            "joy": joy, "nom": nom,
            "savol": max(0, min(savol, 999)), "jami": max(0, min(jami, 999)),
            "togri": max(0, min(togri, 999)),
            "boshlandi": hozir if yangi_ish else eski.boshlandi,
            "updated_at": hozir,
        },
    )


def tozala(profile: Profile) -> None:
    Faollik.objects.filter(pk=profile.pk).delete()


def royxat() -> list[dict]:
    """Hozir ishlayotganlar — oxirgi signal yuborgani birinchi."""
    hozir = timezone.now()
    qs = (
        Faollik.objects
        .filter(updated_at__gte=hozir - timedelta(seconds=ESKIRISH))
        .select_related("profile__pupil")
        .order_by("-updated_at")
    )
    chiq = []
    for f in qs:
        p = f.profile.pupil
        ism = p.toliq_ism or f.profile.name or "—"
        chiq.append({
            "ism": ism,
            "bosh": (ism[:1] or "?").upper(),
            "bola": f.profile.name if f.profile.name and f.profile.name not in ism else "",
            "joy": f.joy,
            "joyNomi": JOY_NOMI.get(f.joy, f.joy),
            "nom": f.nom,
            "savol": f.savol,
            "jami": f.jami,
            "togri": f.togri,
            "foiz": round(f.savol * 100 / f.jami) if f.jami else 0,
            "davom": int((hozir - f.boshlandi).total_seconds()),
            "oxirgi": int((hozir - f.updated_at).total_seconds()),
        })
    return chiq


def soni() -> int:
    return Faollik.objects.filter(
        updated_at__gte=timezone.now() - timedelta(seconds=ESKIRISH)
    ).count()
