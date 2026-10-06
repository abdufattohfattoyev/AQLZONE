"""
O'SISH TAHLILI — kanal, bot va ilova bitta voronka bo'lib.

Boshqaruv panelidagi "Tahlil" (`core/tahlil.py`) ilova ICHIDAGI
hodisalarni ko'rsatadi. Lekin o'sishning yarmi ilovadan TASHQARIDA
bo'ladi va ilgari umuman ko'rinmas edi:

    kanal     necha obunachi, hafta davomida qancha qo'shildi
    bot       kim `/start` bosdi va qaysi havoladan keldi
    shart     "kanalga a'zo bo'ling" dan nechtasi o'tdi, nechtasi ketdi

Uch qism:

    bot_hodisa      botdagi qadamni sanaydi (`BotHodisa`)
    surat           kun oxirida bir qator (`KunlikOsish`) — kanal soni tarixi
    hisobot_matni   haftalik hisobot: o'tgan hafta bilan solishtirish va
                    raqamlardan chiqqan XULOSALAR (nima qilish kerak)

Hisobot har dushanba adminlarga ketadi (`osish_hisobot` buyrug'i) va
botda `/osish` bilan istalgan payt so'raladi.
"""
from __future__ import annotations

import html
import json
import logging
import urllib.parse
import urllib.request
from datetime import date, datetime, time, timedelta

from django.conf import settings
from django.db import IntegrityError, transaction
from django.db.models import F, Sum
from django.utils import timezone

from .models import BotHodisa, Hodisa, ImtihonNatija, KunlikOsish, KunlikSonNatija, Masala, Pupil

log = logging.getLogger(__name__)

# ------------------------------------------------------------------ bot

#: `/start <param>` ning boshi → manba. Tartib muhim: uzunrog'i oldin.
START_MANBA = [
    ("duel_", "duel"), ("xona_", "xona"), ("masala_", "masala"), ("masalalar", "masala"),
    ("test_", "test"), ("testlar", "test"), ("kunlik", "kunlik_son"), ("karvon", "karvon"),
    ("dtm", "dtm"), ("sertifikat", "sertifikat"), ("ref_", "taklif"),
    ("marafon", "marafon"), ("sinf_", "sinf"),
]

MANBA_NOMI = {
    "": "to'g'ridan (/start)", "duel": "duel chaqiruvi", "xona": "jamoaviy xona",
    "masala": "masala posti", "test": "test to'plami", "kunlik_son": "kunlik son ulashish",
    "karvon": "karvon ulashish", "dtm": "DTM havolasi", "sertifikat": "sertifikat havolasi",
    "taklif": "taklif havolasi", "marafon": "marafon", "sinf": "sinf kodi", "boshqa": "boshqa havola",
}


def start_manbasi(matn: str) -> str:
    """`/start masala_12-k` → "masala". Parametrsiz — bo'sh satr."""
    param = matn.split(" ", 1)[1].strip() if " " in matn.strip() else ""
    if not param:
        return ""
    for bosh, manba in START_MANBA:
        if param.startswith(bosh):
            return manba
    return "boshqa"


def bot_hodisa(tur: str, manba: str = "", kim: str = "") -> None:
    """
    Bugungi sanoqqa bitta qo'shadi. HECH QACHON xato tashlamaydi: tahlil
    botning javobini to'xtatib qo'ymasligi kerak.

    `kim` berilsa — bir odam bir kunda shu turda BIR MARTA sanaladi.
    `/start` ni ketma-ket uch marta bosgan yoki kanal shartini uch marta
    ko'rgan odam voronkani uch barobar ko'rsatmasin.
    """
    try:
        bugun = timezone.localdate()
        if kim:
            from django.core.cache import cache
            if not cache.add(f"osish:{tur}:{kim}:{bugun}", 1, 26 * 3600):
                return
        n = BotHodisa.objects.filter(sana=bugun, tur=tur, manba=manba[:24]).update(n=F("n") + 1)
        if not n:
            try:
                with transaction.atomic():
                    BotHodisa.objects.create(sana=bugun, tur=tur, manba=manba[:24], n=1)
            except IntegrityError:      # parallel yaratildi — endi yangilaymiz
                BotHodisa.objects.filter(sana=bugun, tur=tur, manba=manba[:24]).update(n=F("n") + 1)
    except Exception:                                   # noqa: BLE001
        log.exception("bot_hodisa yozilmadi")


# ------------------------------------------------------------------ surat


def _kanal() -> str:
    k = str(getattr(settings, "KANAL", "") or "")
    return k if k.startswith(("@", "-")) or not k else f"@{k}"


def kanal_azo_soni() -> int | None:
    """Telegram'dan kanal obunachilari soni. Bo'lmasa `None` (hisobot buzilmasin)."""
    kanal, token = _kanal(), getattr(settings, "BOT_TOKEN", "")
    if not kanal or not token or getattr(settings, "TESTDA", False):
        return None
    try:
        url = f"https://api.telegram.org/bot{token}/getChatMemberCount?chat_id={urllib.parse.quote(kanal)}"
        with urllib.request.urlopen(url, timeout=15) as r:
            j = json.loads(r.read())
        return int(j["result"]) if j.get("ok") else None
    except Exception:                                   # noqa: BLE001
        return None


def _kun_oraligi(sana: date) -> tuple[datetime, datetime]:
    tz = timezone.get_current_timezone()
    boshi = timezone.make_aware(datetime.combine(sana, time.min), tz)
    return boshi, boshi + timedelta(days=1)


def instagram_surati() -> dict:
    """
    Instagram'ning bugungi raqamlari — suratga yozish uchun.

    Xato bo'lsa BO'SH qaytadi va kunlik surat baribir yoziladi:
    Instagram kaliti eskirgani kanal va ilova tarixini uzib
    qo'ymasligi kerak.
    """
    from core import instagram as IG

    if not IG.sozlanganmi():
        return {}
    try:
        qiymat = {"instagram_azo": IG.hisob().get("followers_count")}
        kun = IG.kunlik_olchov()
        qiymat["instagram_korish"] = kun.get("views")
        qiymat["instagram_qamrov"] = kun.get("reach")
        return {k: v for k, v in qiymat.items() if v is not None}
    except Exception:                            # noqa: BLE001
        log.warning("instagram surati olinmadi", exc_info=True)
        return {}


def surat(sana: date | None = None, kanal_azo: int | None = None) -> KunlikOsish:
    """Shu kunning qatorini yozadi (qayta chaqirilsa — yangilaydi)."""
    sana = sana or timezone.localdate()
    boshi, oxiri = _kun_oraligi(sana)
    qiymat = {
        "hisoblar": Pupil.objects.filter(created_at__lt=oxiri).count(),
        "yangi": Pupil.objects.filter(created_at__gte=boshi, created_at__lt=oxiri).count(),
        "faol": Hodisa.objects.filter(created_at__gte=boshi, created_at__lt=oxiri)
                .values("pupil").distinct().count(),
    }
    azo = kanal_azo if kanal_azo is not None else kanal_azo_soni()
    if azo is not None:
        qiymat["kanal_azo"] = azo
    qiymat.update(instagram_surati())
    q, _ = KunlikOsish.objects.update_or_create(sana=sana, defaults=qiymat)
    return q


# ------------------------------------------------------------------ hafta


def _oraliq(a: date, b: date) -> tuple[datetime, datetime]:
    """[a, b) sanalar oralig'i — Toshkent vaqtidagi boshlanish nuqtalari."""
    return _kun_oraligi(a)[0], _kun_oraligi(b)[0]


def hafta(a: date, b: date) -> dict:
    """[a, b) oralig'idagi o'sish raqamlari."""
    boshi, oxiri = _oraliq(a, b)
    bot = BotHodisa.objects.filter(sana__gte=a, sana__lt=b)
    start_manba = {m: n for m, n in bot.filter(tur=BotHodisa.START)
                   .values_list("manba").annotate(n=Sum("n"))}
    shart = bot.filter(tur=BotHodisa.KANAL_SHART).aggregate(s=Sum("n"))["s"] or 0
    otdi = bot.filter(tur=BotHodisa.KANAL_OTDI).aggregate(s=Sum("n"))["s"] or 0

    # Kanal: oraliq oxiridagi eng yangi va boshidan oldingi eng yaqin surat.
    oxirgi = KunlikOsish.objects.filter(sana__lt=b, kanal_azo__isnull=False).order_by("-sana").first()
    oldingi = KunlikOsish.objects.filter(sana__lt=a, kanal_azo__isnull=False).order_by("-sana").first()
    # Instagram: o'sha usul. Kunlik ko'rish/qamrov esa haftaga yig'iladi.
    ig_ox = (KunlikOsish.objects.filter(sana__lt=b, instagram_azo__isnull=False)
             .order_by("-sana").first())
    ig_old = (KunlikOsish.objects.filter(sana__lt=a, instagram_azo__isnull=False)
              .order_by("-sana").first())
    ig_hafta = KunlikOsish.objects.filter(sana__gte=a, sana__lt=b).aggregate(
        korish=Sum("instagram_korish"), qamrov=Sum("instagram_qamrov"))

    imt = ImtihonNatija.objects.filter(created_at__gte=boshi, created_at__lt=oxiri, kurs="")
    return {
        "kanal": oxirgi.kanal_azo if oxirgi else None,
        "kanal_osdi": (oxirgi.kanal_azo - oldingi.kanal_azo) if oxirgi and oldingi else None,
        "ig": ig_ox.instagram_azo if ig_ox else None,
        "ig_osdi": (ig_ox.instagram_azo - ig_old.instagram_azo) if ig_ox and ig_old else None,
        "ig_korish": ig_hafta["korish"],
        "ig_qamrov": ig_hafta["qamrov"],
        "start": sum(start_manba.values()),
        "start_manba": start_manba,
        "shart": shart,
        "otdi": otdi,
        "yangi": Pupil.objects.filter(created_at__gte=boshi, created_at__lt=oxiri).count(),
        "faol": Hodisa.objects.filter(created_at__gte=boshi, created_at__lt=oxiri)
                .values("pupil").distinct().count(),
        "dtm": imt.filter(tur="").count(),
        "sert": imt.filter(tur="sert").count(),
        "kunlik_son": KunlikSonNatija.objects.filter(sana__gte=a, sana__lt=b)
                      .values("profile").distinct().count(),
    }


# ------------------------------------------------------------------ hisobot


def rolik_natijalari(a: date, b: date) -> list[dict]:
    """
    Hafta ichida chiqqan roliklar va ularning Instagram raqamlari.

    Savol shu: AYNAN qaysi rolik ishladi. Kunlik suratdan bu chiqmaydi —
    bir kunda bitta rolik chiqsa ham uning ko'rishi keyingi kunlarda
    o'sib boradi, ya'ni raqamni postning o'zidan so'rash kerak.

    Ko'rish bo'yicha kamayish tartibida.
    """
    from core import instagram as IG
    from core import rolik as R

    if not IG.sozlanganmi():
        return []
    natija = []
    for sana, nom, m in R.chiqqanlar(a, b):
        if not m.get("instagram_reels"):
            continue
        natija.append({"sana": sana, "nom": nom, **IG.post_olchov(m["instagram_reels"])})
    return sorted(natija, key=lambda r: -(r.get("views") or 0))


def _farq(joriy, oldingi) -> str:
    """"146 (▲ +12)" — o'tgan haftaga nisbatan."""
    if joriy is None:
        return "—"
    if oldingi is None or oldingi == joriy:
        return f"{joriy}"
    d = joriy - oldingi
    return f"{joriy} ({'▲ +' if d > 0 else '▼ '}{d})"


def _foiz(a: int, b: int) -> int | None:
    return round(100 * a / b) if b else None


def xulosalar(j: dict, o: dict, qaytish: dict, zaxira: int,
              roliklar: list[dict] | None = None) -> list[str]:
    """
    Raqamlardan chiqadigan XULOSA — "nima qilish kerak".

    Qoidalar oddiy va ochiq: har biri bitta raqamga qaraydi va chegara
    shu yerda yozilgan. Hisobot raqam ro'yxati bo'lib qolsa, uni hech
    kim o'qimaydi; bitta aniq gap esa o'qiladi.
    """
    r: list[str] = []
    if j["shart"] >= 10:
        f = _foiz(j["otdi"], j["shart"]) or 0
        if f < 60:
            r.append(f"⚠️ Kanal sharti: {j['shart']} kishiga ko'rsatildi, faqat {f}% o'tdi — "
                     "qolganlari botdan ketyapti. Shart matnini qisqartirish yoki sinab ko'rish kerak.")
    if zaxira == 0:
        r.append("⚠️ Kanalga chiqadigan masala qolmadi — 18:05 dagi post bo'sh ketyapti. "
                 "Masala qo'shing yoki avtomatik «kun masalasi» ishlasin.")
    elif zaxira <= 3:
        r.append(f"⚠️ Kanal uchun masala zaxirasi: {zaxira} ta qoldi.")
    ertasi = (qaytish.get("ertasi") or {}).get("foiz")
    if ertasi is not None and qaytish.get("yangi", 0) >= 10 and ertasi < 20:
        r.append(f"📉 Yangi kelganlarning faqat {ertasi}% i ertasi kuni qaytdi — birinchi "
                 "kun tajribasi (bosh sahifa, birinchi dars) kuchaytirilishi kerak.")
    if o["yangi"] and j["yangi"] < o["yangi"] * 0.7:
        r.append(f"📉 Yangi hisoblar {o['yangi']} → {j['yangi']}: kanal va ulashish postlari kamaygan bo'lishi mumkin.")
    elif o["yangi"] and j["yangi"] > o["yangi"] * 1.3:
        r.append(f"📈 Yangi hisoblar {o['yangi']} → {j['yangi']} — o'sish bor, qaysi manbadan ekaniga qarang.")
    if j["kanal_osdi"] is not None and j["kanal_osdi"] <= 0:
        r.append("📉 Kanal bu hafta o'smadi — post almashish yoki reklama kerak.")
    if j.get("ig_osdi") is not None and j["ig_osdi"] <= 0:
        r.append("📉 Instagram bu hafta o'smadi — rolik mavzusi yoki chiqish vaqtini o'zgartirib ko'rish kerak.")
    # Eng ko'p ko'rilgan rolik qolganidan sezilarli ajralib turgandami —
    # demak mavzu ishlagan va keyingi to'plam shunga qarab yasalsin.
    ko = [r_["views"] for r_ in (roliklar or []) if r_.get("views") is not None]
    if len(ko) >= 3 and max(ko) >= 2 * (sorted(ko)[len(ko) // 2] or 1):
        eng = max(roliklar, key=lambda x: x.get("views") or 0)
        r.append(f"📈 Instagram'da eng ko'p ko'rilgani — «{eng['nom']}» ({eng['views']} ko'rish), "
                 "qolganlaridan ikki barobar yuqori. Keyingi to'plamda shu mavzuni ko'paytirish kerak.")
    if not r:
        r.append("✅ Hammasi me'yorida — keskin tushish yo'q.")
    return r


def hisobot_matni(bugun: date | None = None) -> str:
    """
    Haftalik hisobot — oxirgi 7 to'liq kun, oldingi 7 kun bilan solishtirib.

    Telegram HTML, 4096 belgidan qisqa.
    """
    from . import tahlil as T

    bugun = bugun or timezone.localdate()
    a, b = bugun - timedelta(days=7), bugun
    j, o = hafta(a, b), hafta(a - timedelta(days=7), a)

    boshi, _ = _oraliq(a, b)
    kunlar = T._kunlar_boyicha(Hodisa.objects.all())
    qaytish = T.qaytish(boshi, kunlar)
    manbalar = T.manbalar(boshi, kunlar)[:4]
    chiqish = T.chiqish_nuqtalari(boshi)[:3]
    postlar = sorted(T.kanal_statistikasi(boshi)["postlar"], key=lambda p: -p["keldi"])[:3]
    roliklar = rolik_natijalari(a, b)
    zaxira = Masala.objects.filter(holat=Masala.TASDIQ, kanal_at__isnull=True).count()

    def e(x) -> str:
        return html.escape(str(x))

    q: list[str] = [f"📊 <b>Haftalik o'sish</b> · {a:%d.%m}–{(b - timedelta(days=1)):%d.%m}"]

    q.append("\n<b>📢 Kanal</b>")
    q.append(f"Obunachi: {_farq(j['kanal'], o['kanal'])}"
             + (f" · hafta: {'+' if (j['kanal_osdi'] or 0) >= 0 else ''}{j['kanal_osdi']}"
                if j["kanal_osdi"] is not None else " · (tarix hali yig'ilmoqda)"))
    for p in postlar:
        if p["keldi"]:
            q.append(f"• {e(p['tur'])} {e(p['nom'])}: {p['keldi']} kishi keldi")

    if j["ig"] is not None:
        q.append("\n<b>📸 Instagram</b>")
        q.append(f"Obunachi: {_farq(j['ig'], o['ig'])}"
                 + (f" · hafta: {'+' if j['ig_osdi'] >= 0 else ''}{j['ig_osdi']}"
                    if j["ig_osdi"] is not None else " · (tarix hali yig'ilmoqda)"))
        if j["ig_korish"] is not None:
            q.append(f"Ko'rish: {_farq(j['ig_korish'], o['ig_korish'])}"
                     f" · qamrov: {_farq(j['ig_qamrov'], o['ig_qamrov'])}")
        for r in roliklar[:3]:
            olchov = [f"{r['views']} ko'rish"] if r.get("views") is not None else []
            if r.get("likes"):
                olchov.append(f"{r['likes']} layk")
            if r.get("shares"):
                olchov.append(f"{r['shares']} ulashish")
            q.append(f"• {r['sana']:%d.%m} {e(r['nom'])}: " + (", ".join(olchov) or "raqam yo'q"))

    q.append("\n<b>🤖 Bot</b>")
    q.append(f"/start: {_farq(j['start'], o['start'])}")
    for m, n in sorted(j["start_manba"].items(), key=lambda x: -x[1])[:5]:
        q.append(f"• {e(MANBA_NOMI.get(m, m))}: {n}")
    if j["shart"]:
        q.append(f"Kanal sharti: {j['shart']} → a'zo bo'ldi {j['otdi']} ({_foiz(j['otdi'], j['shart'])}%)")

    q.append("\n<b>📱 Ilova</b>")
    q.append(f"Yangi hisob: {_farq(j['yangi'], o['yangi'])}")
    q.append(f"Faol (haftada): {_farq(j['faol'], o['faol'])}")
    er, hf = qaytish["ertasi"], qaytish["hafta"]
    if er["foiz"] is not None:
        q.append(f"Qaytish: ertasi {er['foiz']}% ({er['n']}/{er['jami']})"
                 + (f" · 7 kunda {hf['foiz']}%" if hf["foiz"] is not None else ""))
    for m in manbalar:
        q.append(f"• {e(m['nom'])}: {m['odam']} kishi, qaytgan {m['qaytgan_foiz']}%")
    if chiqish:
        q.append("Eng ko'p tashlab ketilgan ekran: "
                 + ", ".join(f"{e(c['yol'])} ({c['foiz']}%)" for c in chiqish))

    q.append("\n<b>🎯 Faollik</b>")
    q.append(f"DTM: {_farq(j['dtm'], o['dtm'])} · Sertifikat: {_farq(j['sert'], o['sert'])} urinish")
    q.append(f"Kunlik son o'ynaganlar: {_farq(j['kunlik_son'], o['kunlik_son'])}")
    q.append(f"Kanal uchun masala zaxirasi: {zaxira}")

    q.append("\n<b>💡 Xulosa</b>")
    q.extend(xulosalar(j, o, qaytish, zaxira, roliklar))
    return "\n".join(q)[:4000]
