"""
TAJRIBA VA HAFTALIK JADVAL — jamoaviy o'yinlarga qaytish sabablari.

  * Tajriba — har o'yindan keyin ochko qo'shiladi (mag'lubga ham), daraja
    faqat oshadi. Natija ekranida "+45 · Bilimdongacha 80" turadi.
  * Haftalik jadval — dushanbadan beri to'plangan ochko. Ikki xil:
    hammasi va BIRGA O'YNAGANLARIM (oila, sinf) — ikkinchisi muhimroq:
    "dadamdan o'tib ketdim" umumiy 500-o'rindan kuchliroq sabab.
"""
from __future__ import annotations

from datetime import datetime, time, timedelta

from django.db.models import Count, Q, Sum
from django.utils import timezone

from .models import OyinchiTajriba, Profile, Xona, XonaAzo, XonaNatija

#: Daraja chegaralari (ochko). Nomlar mijozda, ikki tilda.
CHEGARALAR = [0, 100, 300, 700, 1500, 3000]


def daraja(ochko: int) -> dict:
    """{daraja, oldingi, keyingi} — keyingi `None` bo'lsa eng yuqori."""
    d = max(i for i, c in enumerate(CHEGARALAR) if ochko >= c)
    return {
        "daraja": d, "ochko": ochko, "oldingi": CHEGARALAR[d],
        "keyingi": CHEGARALAR[d + 1] if d + 1 < len(CHEGARALAR) else None,
    }


def yoz(xona: Xona, natija: dict[str, dict]) -> dict[str, dict]:
    """
    Tugagan o'yin natijasini yozadi va har odam uchun oldin/keyin qaytaradi.

    Faqat odamlar — robot jadvalga tushmaydi.
    """
    davlat = xona.davlat or {}
    xoin = davlat.get("xoin") if xona.oyin == Xona.SEYF else None
    ovozlar = davlat.get("ovozlar", {}) if xona.oyin == Xona.SEYF else {}
    ro = {}
    for azo in XonaAzo.objects.filter(xona=xona, robot=False, profile__isnull=False):
        n = natija.get(str(azo.pk))
        if not n:
            continue
        t, _ = OyinchiTajriba.objects.get_or_create(profile_id=azo.profile_id)
        oldin = t.ochko
        t.ochko += n["ochko"]
        t.oyinlar += 1
        t.galabalar += 1 if n.get("golib") else 0
        if xoin and str(azo.pk) != xoin and ovozlar.get(str(azo.pk), {}).get("xoin") == xoin:
            t.xoin_topdi += 1
        t.save()
        XonaNatija.objects.create(profile_id=azo.profile_id, xona=xona, oyin=xona.oyin,
                                  ochko=n["ochko"], golib=bool(n.get("golib")))
        ro[str(azo.pk)] = {"oldin": daraja(oldin), "keyin": daraja(t.ochko), "qoshildi": n["ochko"]}
    return ro


def meniki(profil: Profile) -> dict:
    t = OyinchiTajriba.objects.filter(profile=profil).first()
    ochko = t.ochko if t else 0
    return {**daraja(ochko), "oyinlar": t.oyinlar if t else 0,
            "galabalar": t.galabalar if t else 0, "xoinTopdi": t.xoin_topdi if t else 0}


def hafta_boshi():
    bugun = timezone.localdate()
    dushanba = bugun - timedelta(days=bugun.weekday())
    return timezone.make_aware(datetime.combine(dushanba, time.min))


def haftalik(profil: Profile, tur: str = "hammasi", soni: int = 20) -> dict:
    boshi = hafta_boshi()
    qs = XonaNatija.objects.filter(created_at__gte=boshi)
    if tur == "birga":
        xonalar = qs.filter(profile=profil).values_list("xona_id", flat=True)
        sheriklar = qs.filter(xona_id__in=list(xonalar)).values_list("profile_id", flat=True)
        qs = qs.filter(Q(profile_id__in=list(sheriklar)) | Q(profile=profil))
    jadval = list(
        qs.values("profile_id")
        .annotate(ochko=Sum("ochko"), oyinlar=Count("id"), galaba=Count("id", filter=Q(golib=True)))
        .order_by("-ochko", "profile_id")
    )
    from .duel import korinadigan_ism
    profillar = {p.pk: p for p in Profile.objects.filter(pk__in=[r["profile_id"] for r in jadval[:soni]] + [profil.pk])}
    qatorlar = []
    men = None
    for i, r in enumerate(jadval, start=1):
        if r["profile_id"] == profil.pk:
            men = {"joy": i, **r}
        if i <= soni:
            p = profillar.get(r["profile_id"])
            qatorlar.append({
                "joy": i, "ism": korinadigan_ism(p) if p else "—", "avatar": p.avatar if p else "",
                "ochko": r["ochko"], "oyinlar": r["oyinlar"], "galaba": r["galaba"],
                "menmi": r["profile_id"] == profil.pk,
            })
    return {"qatorlar": qatorlar, "men": men, "haftaBoshi": boshi.date().isoformat()}
