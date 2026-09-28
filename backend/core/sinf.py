"""
SINF — o'qituvchi kodi va paneli.

    yarat        o'qituvchi sinf ochadi, 6 belgili kod oladi
    kod_haqida   qo'shilishdan oldingi oyna: qaysi sinf, kim o'qituvchi
    qoshil       o'quvchi (profil) kod bilan qo'shiladi
    chiq         o'quvchi o'zi chiqadi
    chiqar       o'qituvchi o'quvchini chiqaradi
    panel        o'qituvchi: har o'quvchining faolligi va natijalari,
                 sinfning ZAIF MAVZULARI, haftalik sinf reytingi
    oquvchi      o'quvchi: sinf reytingi (sinfdoshlar orasida)

─────────────────── MAXFIYLIK ───────────────────

O'qituvchi faqat O'Z sinfidagi, O'ZI qo'shilgan o'quvchining natijasini
ko'radi. Qo'shilish oynasi buni ochiq aytadi va o'quvchi istalgan payt
chiqib keta oladi — chiqqach panelda ko'rinmaydi. Sinf reytingida
ismlar to'liq: bu sinfdoshlar orasida, kanal kabi hammaga ochiq emas.

─────────────────── ZAIF MAVZULAR QAYERDAN ───────────────────

Ikki manba birlashadi (oxirgi 30 kun):

    DTM/sertifikat   `ImtihonNatija.mavzular` — mavzu bo'yicha xatolar
    darslar          `LessonResult` — to'g'ri javob ulushi past darslar

Mavzu ro'yxatda qancha O'QUVCHI qiynalgani bilan turadi, xatolar soni
bilan emas: bitta o'quvchining yigirma xatosi sinfning muammosi emas.
"""
from __future__ import annotations

import secrets
from datetime import timedelta

from django.db import IntegrityError, transaction
from django.db.models import Max
from django.utils import timezone

from .duel import OZIM_NOMLARI
from .models import ImtihonNatija, LessonResult, MarafonNatija, Profile, Pupil, Session, Sinf, SinfAzo

KOD_HARF = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"   # 0/O, 1/I/L yo'q — doskada adashmasin
KOD_UZUN = 6
USTOZ_SINF_CHEK = 20
AZO_CHEK = 200
#: Dars "qiyin" hisoblanadigan to'g'ri javob ulushi.
QIYIN_ULUSH = 0.7
#: Maxsus natijalar (blok 98, sinov 99, sertifikat 97) — dars emas.
DARS_CHEGARA = 90


class SinfXato(Exception):
    def __init__(self, sabab: str, kod: int = 400):
        super().__init__(sabab)
        self.sabab, self.kod = sabab, kod


def _ism(p: Profile) -> str:
    nom = (p.name or "").strip()
    if nom.lower() in OZIM_NOMLARI:
        nom = ""
    return p.pupil.toliq_ism or nom or ""


def _yangi_kod() -> str:
    for _ in range(20):
        kod = "".join(secrets.choice(KOD_HARF) for _ in range(KOD_UZUN))
        if not Sinf.objects.filter(kod=kod).exists():
            return kod
    raise SinfXato("kod_yasalmadi", 500)


def _sinf(s: Sinf, **qoshimcha) -> dict:
    return {"id": s.pk, "nom": s.nom, "kod": s.kod, "ustoz": s.ustoz.toliq_ism or "",
            "azo": s.azolar.count(), **qoshimcha}


# ------------------------------------------------------------------ amallar


def yarat(pupil: Pupil, nom: str) -> dict:
    nom = (nom or "").strip()[:60]
    if len(nom) < 2:
        raise SinfXato("nom_qisqa")
    if pupil.sinflar.count() >= USTOZ_SINF_CHEK:
        raise SinfXato("sinf_kop")
    for _ in range(3):
        try:
            with transaction.atomic():
                s = Sinf.objects.create(nom=nom, kod=_yangi_kod(), ustoz=pupil)
            return _sinf(s, men_ustoz=True)
        except IntegrityError:
            continue
    raise SinfXato("kod_yasalmadi", 500)


def _kod_bilan_top(kod: str) -> Sinf:
    s = Sinf.objects.select_related("ustoz").filter(kod=(kod or "").strip().upper()[:8]).first()
    if not s:
        raise SinfXato("topilmadi", 404)
    return s


def kod_haqida(kod: str, profil: Profile) -> dict:
    s = _kod_bilan_top(kod)
    return _sinf(s, azo_men=s.azolar.filter(profile=profil).exists(),
                 men_ustoz=s.ustoz_id == profil.pupil_id)


def qoshil(profil: Profile, kod: str) -> dict:
    s = _kod_bilan_top(kod)
    if s.ustoz_id == profil.pupil_id:
        raise SinfXato("oz_sinfingiz")
    if s.azolar.count() >= AZO_CHEK:
        raise SinfXato("sinf_toldi")
    SinfAzo.objects.get_or_create(sinf=s, profile=profil)
    return _sinf(s, azo_men=True)


def chiq(profil: Profile, sinf_id: int) -> None:
    SinfAzo.objects.filter(sinf_id=sinf_id, profile=profil).delete()


def _ustoz_sinfi(pupil: Pupil, sinf_id: int) -> Sinf:
    s = Sinf.objects.filter(pk=sinf_id, ustoz=pupil).first()
    if not s:
        raise SinfXato("ruxsat_yoq", 403)
    return s


def chiqar(pupil: Pupil, sinf_id: int, profil_id: int) -> None:
    _ustoz_sinfi(pupil, sinf_id).azolar.filter(profile_id=profil_id).delete()


def ochir(pupil: Pupil, sinf_id: int) -> None:
    _ustoz_sinfi(pupil, sinf_id).delete()


def royxat(pupil: Pupil, profil: Profile) -> dict:
    """O'qituvchi sifatidagi sinflar va o'quvchi sifatida a'zo bo'lganlari."""
    return {
        "ustoz": [_sinf(s, men_ustoz=True) for s in pupil.sinflar.select_related("ustoz").order_by("-created_at")],
        "azo": [_sinf(a.sinf, azo_men=True) for a in
                SinfAzo.objects.filter(profile=profil).select_related("sinf__ustoz").order_by("-qoshildi_at")],
    }


# ------------------------------------------------------------------ panel


def _hafta_ball(profil_idlar: list[int], boshi) -> dict[int, int]:
    """Shu davrdagi TO'G'RI javoblar yig'indisi — darslar, imtihonlar, marafon."""
    ball = {pid: 0 for pid in profil_idlar}
    for pid, c in LessonResult.objects.filter(profile_id__in=profil_idlar, created_at__gte=boshi) \
            .values_list("profile_id", "correct"):
        ball[pid] += c
    for pid, c in ImtihonNatija.objects.filter(profile_id__in=profil_idlar, created_at__gte=boshi) \
            .values_list("profile_id", "togri"):
        ball[pid] += c
    for pid, c in MarafonNatija.objects.filter(profile_id__in=profil_idlar, created_at__gte=boshi) \
            .values_list("profile_id", "togri"):
        ball[pid] += c
    return ball


def _reyting(azolar: list[Profile], men_id: int | None = None) -> list[dict]:
    boshi = timezone.now() - timedelta(days=7)
    ball = _hafta_ball([p.pk for p in azolar], boshi)
    qatorlar = sorted(azolar, key=lambda p: -ball[p.pk])
    return [{"orin": i + 1, "id": p.pk, "ism": _ism(p), "ball": ball[p.pk], "men": p.pk == men_id}
            for i, p in enumerate(qatorlar)]


def zaif_mavzular(profil_idlar: list[int], kunlar: int = 30, n: int = 6) -> list[dict]:
    boshi = timezone.now() - timedelta(days=kunlar)
    odam: dict[str, set] = {}
    xato: dict[str, int] = {}
    for pid, mavzular in ImtihonNatija.objects.filter(profile_id__in=profil_idlar, created_at__gte=boshi) \
            .values_list("profile_id", "mavzular"):
        for q in mavzular or []:
            m = str(q.get("m", ""))[:120]
            if m:
                odam.setdefault(m, set()).add(pid)
                xato[m] = xato.get(m, 0) + int(q.get("x") or 0)
    for pid, nom, asked, correct in LessonResult.objects.filter(
            profile_id__in=profil_idlar, created_at__gte=boshi, unit__lt=DARS_CHEGARA, asked__gt=0) \
            .values_list("profile_id", "lesson_name", "asked", "correct"):
        if nom and correct / asked < QIYIN_ULUSH:
            odam.setdefault(nom, set()).add(pid)
            xato[nom] = xato.get(nom, 0) + (asked - correct)
    r = sorted(odam, key=lambda m: (-len(odam[m]), -xato[m]))[:n]
    return [{"mavzu": m, "odam": len(odam[m]), "xato": xato[m]} for m in r]


def panel(pupil: Pupil, sinf_id: int) -> dict:
    """O'qituvchi paneli — faqat o'z sinfi."""
    s = _ustoz_sinfi(pupil, sinf_id)
    azolar = [a.profile for a in s.azolar.select_related("profile__pupil").order_by("qoshildi_at")]
    idlar = [p.pk for p in azolar]
    hozir = timezone.now()
    hafta, oy = hozir - timedelta(days=7), hozir - timedelta(days=30)

    oxirgi = dict(Session.objects.filter(pupil_id__in={p.pupil_id for p in azolar})
                  .values("pupil").annotate(m=Max("last_seen")).values_list("pupil", "m"))
    kunlar: dict[int, set] = {pid: set() for pid in idlar}
    for model, maydon in ((LessonResult, "profile_id"), (ImtihonNatija, "profile_id"), (MarafonNatija, "profile_id")):
        for pid, vaqt in model.objects.filter(profile_id__in=idlar, created_at__gte=hafta) \
                .values_list(maydon, "created_at"):
            kunlar[pid].add(timezone.localtime(vaqt).date())

    darslar: dict[int, list] = {pid: [0, 0, 0] for pid in idlar}     # dars soni (hafta), asked, correct (oy)
    for pid, vaqt, asked, correct in LessonResult.objects.filter(
            profile_id__in=idlar, created_at__gte=oy, unit__lt=DARS_CHEGARA) \
            .values_list("profile_id", "created_at", "asked", "correct"):
        if vaqt >= hafta:
            darslar[pid][0] += 1
        darslar[pid][1] += asked
        darslar[pid][2] += correct

    imt: dict[int, dict] = {pid: {"dtm": 0, "dtm_eng": None, "sert_eng": None} for pid in idlar}
    for pid, tur, kurs, togri, jami, ball in ImtihonNatija.objects.filter(profile_id__in=idlar) \
            .values_list("profile_id", "tur", "kurs", "togri", "jami", "ball"):
        if kurs:
            continue
        d = imt[pid]
        if tur == "sert":
            d["sert_eng"] = max(d["sert_eng"] or 0, ball or 0)
        else:
            d["dtm"] += 1
            f = round(100 * togri / jami) if jami else 0
            d["dtm_eng"] = max(d["dtm_eng"] or 0, f)

    oquvchilar = []
    for p in azolar:
        _, asked, correct = darslar[p.pk]
        oquvchilar.append({
            "id": p.pk, "ism": _ism(p),
            "oxirgi": oxirgi.get(p.pupil_id).isoformat() if oxirgi.get(p.pupil_id) else None,
            "hafta_kun": len(kunlar[p.pk]),
            "dars_hafta": darslar[p.pk][0],
            "aniqlik": round(100 * correct / asked) if asked else None,
            **imt[p.pk],
        })
    faol = sum(1 for o in oquvchilar if o["hafta_kun"])
    return {
        **_sinf(s, men_ustoz=True),
        "faol_hafta": faol,
        "oquvchilar": oquvchilar,
        "zaif": zaif_mavzular(idlar),
        "reyting": _reyting(azolar),
    }


def oquvchi(profil: Profile, sinf_id: int) -> dict:
    """O'quvchi ko'rinishi — sinf reytingi. Faqat a'zoga."""
    a = SinfAzo.objects.filter(sinf_id=sinf_id, profile=profil).select_related("sinf__ustoz").first()
    if not a:
        raise SinfXato("azo_emas", 403)
    azolar = [x.profile for x in a.sinf.azolar.select_related("profile__pupil")]
    return {**_sinf(a.sinf, azo_men=True), "reyting": _reyting(azolar, profil.pk)}


def korish(profil: Profile, sinf_id: int) -> dict:
    """O'qituvchi bo'lsa — panel, a'zo bo'lsa — o'quvchi ko'rinishi."""
    if Sinf.objects.filter(pk=sinf_id, ustoz_id=profil.pupil_id).exists():
        return panel(profil.pupil, sinf_id)
    return oquvchi(profil, sinf_id)
