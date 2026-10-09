"""
AI ustoz — Imtihon Premium egalariga (OpenAI).

─────────────────── TO'RT VAZIFA, BITTA SUHBAT ───────────────────

    xato       DTM/sertifikat xatosini qadam-baqadam tushuntirish
    reja       zaif mavzular bo'yicha shaxsiy reja (natijalar serverda)
    repetitor  erkin savol-javob, ustoz kabi
    masala     masala matni yoki rasmi bo'yicha yechimga yordam

Hammasi `AiSuhbat` + `AiXabar`: tushuntirishdan keyin ham odam
"2-qadamni tushunmadim" deb davom ettira olishi kerak. Farq faqat tizim
ko'rsatmasi va birinchi xabarga qo'shiladigan ma'lumotda.

─────────────────── NEGA FONDA ───────────────────

Model javobi 5–30 soniya oladi. So'rov ichida kutilsa, gunicorn ishchisi
shuncha vaqt band bo'ladi va bir nechta odam bir vaqtda so'rasa sayt
qotadi. Shuning uchun: so'rov odamning xabarini va BO'SH javob qatorini
(`kutilmoqda`) yozadi, Celery ishchisi uni to'ldiradi, mijoz esa qatorni
so'rab turadi. Botda javob tayyor bo'lgach xabar bo'lib ketadi.

─────────────────── HUQUQ VA XARAJAT ───────────────────

Faol Premium (`premium.faolmi`) — cheksiz (kunlik chegara ichida).
Premiumsiz odam — UMRBOD `AI_BEPUL` (3) ta javob, sinov uchun: AI nima
berishini tatib ko'rmagan odam unga pul to'lamaydi (testmakon.uz ham
shunday — "AI tahlil 1× sinov"). Umrbod, kunlik emas: kunlik bepul
javob doimiy xarajat bo'lardi va Premium'ga sabab qolmasdi.

Ikki chegara: bir odamga kuniga
`AI_KUNLIK` javob va butun ilovaga kuniga `AI_KUNLIK_JAMI` javob.
Ikkinchisi — kalit sizib chiqsa yoki kimdir skript yozsa ham hisob bir
kunda yonib ketmasin. Xato bilan tugagan javob chegaraga sanalmaydi.

Provayder faqat `_chaqir` da: boshqasiga o'tish uchun shu bitta funksiya
almashtiriladi.
"""
from __future__ import annotations

import base64
import hashlib
import html
import logging
import uuid
from datetime import datetime, time, timedelta
from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import AiSuhbat, AiXabar, ImtihonNatija, Pupil

log = logging.getLogger(__name__)

#: Odam yozadigan bitta xabarning eng uzun bo'yi (belgi).
MAX_SAVOL = 2000
#: Modelga yuboriladigan oxirgi xabarlar soni — uzun suhbat har javobda
#: qimmatlashib bormasin.
TARIX = 16
#: Masala rasmi — eng katta hajm.
RASM_MAX = 8 * 1024 * 1024
#: Javob shuncha vaqtdan beri `kutilmoqda` bo'lsa — ishchi yiqilgan deb
#: hisoblanadi va odam qayta so'ray oladi.
OSILIB_QOLGAN = timedelta(minutes=5)
#: Ro'yxatda nechta oxirgi suhbat ko'rsatiladi.
ROYXAT = 30


class AiXato(Exception):
    """Foydalanuvchiga ko'rsatiladigan sabab — `kod` mijozda tarjima qilinadi."""

    #: kod → HTTP holat.
    HOLAT = {"premium": 403, "yopiq": 503, "chegara": 429, "jami": 503,
             "bosh": 400, "tur": 400, "rasm": 400, "katta": 400, "band": 409}

    def __init__(self, kod: str):
        super().__init__(kod)
        self.kod = kod
        self.holat = self.HOLAT.get(kod, 400)


def yoqilganmi() -> bool:
    return bool(settings.OPENAI_API_KEY)


# ------------------------------------------------------------ chegara


def _bugun_boshi(hozir=None) -> datetime:
    """Toshkent vaqtida bugungi 00:00 — chegara yarim tunda yangilanadi."""
    mahalliy = timezone.localtime(hozir or timezone.now())
    return timezone.make_aware(datetime.combine(mahalliy.date(), time.min), mahalliy.tzinfo)


def _sanaladigan(qs):
    return qs.filter(rol=AiXabar.AI).exclude(holat=AiXabar.XATO)


def bugun_ishlatilgan(pupil: Pupil, hozir=None) -> int:
    return _sanaladigan(AiXabar.objects.filter(pupil=pupil, created_at__gte=_bugun_boshi(hozir))).count()


def bepul_qolgan(pupil: Pupil) -> int:
    """Premiumsiz odamning sinov javoblaridan nechtasi qoldi (umrbod)."""
    return max(0, settings.AI_BEPUL - _sanaladigan(AiXabar.objects.filter(pupil=pupil)).count())


def ochiqmi(pupil: Pupil) -> bool:
    """Premium yoki hali bepul sinov bor."""
    from . import premium as PR

    return PR.faolmi(pupil) or bepul_qolgan(pupil) > 0


def holat(pupil: Pupil) -> dict:
    """`GET /api/v1/ai` — ochiqmi, bugun qancha qoldi va oxirgi suhbatlar."""
    from . import premium as PR

    premium = PR.faolmi(pupil)
    bepul = 0 if premium else bepul_qolgan(pupil)
    kunlik = max(0, settings.AI_KUNLIK - bugun_ishlatilgan(pupil))
    return {
        "yoqilgan": yoqilganmi(),
        "premium": premium,
        # Premium yoki sinov bor — AI ishlatsa bo'ladi.
        "ochiq": premium or bepul > 0,
        "bepul": settings.AI_BEPUL,
        "bepul_qolgan": bepul,
        "kunlik": settings.AI_KUNLIK,
        # Bugun nechta javob olish mumkin: premiumda kunlik chegara,
        # sinovda — qolgan sinovlar (kunlik chegaradan oshmasdan).
        "qolgan": kunlik if premium else min(kunlik, bepul),
        "suhbatlar": [_suhbat_qisqa(s) for s in pupil.ai_suhbatlar.all()[:ROYXAT]],
    }


def _tekshir(pupil: Pupil) -> None:
    """Premium (yoki sinov), kalit va ikki chegara. Qator qulfi ostida chaqiriladi."""
    from . import premium as PR

    if not PR.faolmi(pupil) and bepul_qolgan(pupil) <= 0:
        raise AiXato("premium")
    if not yoqilganmi():
        raise AiXato("yopiq")
    if bugun_ishlatilgan(pupil) >= settings.AI_KUNLIK:
        raise AiXato("chegara")
    jami = _sanaladigan(AiXabar.objects.filter(created_at__gte=_bugun_boshi())).count()
    if jami >= settings.AI_KUNLIK_JAMI:
        log.warning("AI: butun ilova kunlik chegarasi tugadi (%s)", jami)
        raise AiXato("jami")


# ------------------------------------------------------------ kontekst


def _qisqa(x, n: int) -> str:
    return str(x or "").strip()[:n]


def xato_konteksti(xom) -> dict:
    """
    Ko'rib chiqish kartasidan kelgan savol. Savollar mijozda urug'dan
    yasaladi — server ularni bilmaydi, shuning uchun hammasi mijozdan
    keladi va faqat qisqartiriladi.
    """
    if not isinstance(xom, dict):
        raise AiXato("bosh")
    savol = _qisqa(xom.get("savol"), 1500)
    togri = _qisqa(xom.get("togri"), 200)
    if not savol or not togri:
        raise AiXato("bosh")
    variantlar = []
    for v in (xom.get("variantlar") or [])[:6]:
        if isinstance(v, dict):
            variantlar.append({"harf": _qisqa(v.get("harf"), 2), "qiymat": _qisqa(v.get("qiymat"), 200)})
    return {
        "savol": savol,
        "togri": togri,
        "sizniki": _qisqa(xom.get("sizniki"), 200),
        "variantlar": variantlar,
        "mavzu": _qisqa(xom.get("mavzu"), 120),
        "imtihon": "sert" if xom.get("imtihon") == "sert" else "dtm",
    }


def reja_konteksti(pupil: Pupil, kunlar: int = 30) -> dict:
    """
    Oxirgi 30 kundagi DTM/sertifikat natijalari: urinishlar, o'rtacha foiz
    va ENG KO'P xato qilingan mavzular. Ma'lumot serverda — mijozga
    ishonish shart emas.
    """
    boshi = timezone.now() - timedelta(days=kunlar)
    qs = ImtihonNatija.objects.filter(profile__pupil=pupil, kurs="", created_at__gte=boshi)
    turlar: dict[str, dict] = {}
    mavzular: dict[str, int] = {}
    for n in qs.only("tur", "togri", "jami", "ball", "mavzular"):
        tur = "sert" if n.tur == "sert" else "dtm"
        t = turlar.setdefault(tur, {"urinish": 0, "foiz": 0.0})
        t["urinish"] += 1
        t["foiz"] += n.ball if n.ball is not None else 100 * n.togri / max(1, n.jami)
        for m in n.mavzular or []:
            if isinstance(m, dict) and m.get("m"):
                mavzular[m["m"]] = mavzular.get(m["m"], 0) + int(m.get("x") or 0)
    for t in turlar.values():
        t["foiz"] = round(t["foiz"] / t["urinish"])
    zaif = sorted(mavzular.items(), key=lambda x: -x[1])[:8]
    return {"turlar": turlar, "zaif": [{"mavzu": m, "xato": x} for m, x in zaif]}


def _kontekst_matni(s: AiSuhbat, til: str) -> str:
    """Birinchi xabarga qo'shiladigan ma'lumot — model o'qiydigan tilda emas, ma'lumot sifatida."""
    k = s.kontekst or {}
    if s.tur == AiSuhbat.XATO:
        qatorlar = [f"Imtihon: {'Milliy sertifikat' if k.get('imtihon') == 'sert' else 'DTM'}"]
        if k.get("mavzu"):
            qatorlar.append(f"Mavzu: {k['mavzu']}")
        qatorlar.append(f"Savol: {k.get('savol', '')}")
        for v in k.get("variantlar") or []:
            qatorlar.append(f"  {v['harf']}) {v['qiymat']}")
        qatorlar.append(f"O'quvchining javobi: {k.get('sizniki') or '(javob bermagan)'}")
        qatorlar.append(f"Kalitdagi to'g'ri javob: {k.get('togri', '')}")
        return "\n".join(qatorlar)
    if s.tur == AiSuhbat.REJA:
        turlar = k.get("turlar") or {}
        if not turlar:
            return "Oxirgi 30 kunda imtihon natijalari yo'q."
        qatorlar = ["Oxirgi 30 kundagi natijalar:"]
        nomi = {"dtm": "DTM", "sert": "Milliy sertifikat"}
        for tur, t in turlar.items():
            qatorlar.append(f"  {nomi.get(tur, tur)}: {t['urinish']} ta urinish, o'rtacha {t['foiz']}%")
        if k.get("zaif"):
            qatorlar.append("Eng ko'p xato qilingan mavzular (xatolar soni):")
            qatorlar += [f"  {z['mavzu']} — {z['xato']}" for z in k["zaif"]]
        return "\n".join(qatorlar)
    return ""


# ------------------------------------------------------------ ko'rsatmalar

UMUMIY = """Sen — Aql Zone ilovasidagi matematika ustozisan. O'quvchilar DTM, \
milliy sertifikat va maktab imtihonlariga tayyorlanadi; ular orasida maktab \
o'quvchilari ham bor.

Qoidalar:
- Faqat {til_nomi} tilida javob ber.
- Matematika va imtihonga tayyorgarlikdan boshqa mavzuda gaplashma: muloyim \
qilib matematikaga qaytar.
- Oddiy matn yoz: LaTeX, jadval va Markdown sarlavhalari ISHLATMA — javob \
telefonda oddiy matn bo'lib ko'rinadi. Formulalarni x², √(x+1), (a+b)/2, \
≤, ≥, π kabi yoz. Qadamlarni "1)", "2)" bilan raqamla.
- Qisqa va aniq yoz; har qadamda NEGA shunday qilinganini bir gap bilan ayt.
- Hisobni tekshir. Ishonching komil bo'lmasa, buni ochiq ayt — taxminni \
haqiqat qilib ko'rsatma.
- Mehribon bo'l, lekin ortiqcha maqtama."""

TUR_KORSATMA = {
    AiSuhbat.XATO: """Vazifa: o'quvchi imtihonda shu savolda xato qildi (yoki javob bermadi).
1) Avval uning javobi nega noto'g'ri ekanini — qaysi tipik xato bo'lishi \
mumkinligini — bir-ikki gapda ayt.
2) Keyin to'g'ri yechimni qadam-baqadam ko'rsat va kalitdagi javobga yetib bor.
3) Oxirida shunday savollar uchun bitta qisqa maslahat ber.
Kalitdagi javobga qo'shilmasang, buni ochiq ayt va sababini ko'rsat.""",
    AiSuhbat.REJA: """Vazifa: o'quvchining natijalari asosida 7 kunlik shaxsiy tayyorgarlik rejasini tuz.
- Eng zaif 2–4 mavzudan boshla; har kun uchun 1–2 mavzu va 20–40 daqiqalik aniq ish yoz.
- Har mavzuda nimani takrorlash kerakligini (formula, qoida, tipik xato) bir qatorda ayt.
- 7-kunga bitta to'liq variant ishlashni qo'y.
- Natijalar bo'lmasa — reja tuzish uchun o'quvchidan maqsadi (DTM yoki sertifikat), \
imtihon sanasi va qiynaladigan mavzularini so'ra.""",
    AiSuhbat.REPETITOR: """Vazifa: repetitor kabi suhbatlash. Savolni tushunishga yordam ber, \
yechimni darhol to'liq berib qo'yma: avval yo'naltiruvchi savol yoki ishora ber, \
o'quvchi so'rasa yoki qiynalsa — to'liq yechimni ko'rsat. Javoblar qisqa bo'lsin.""",
    AiSuhbat.MASALA: """Vazifa: o'quvchi yuborgan masalani yechishga yordam ber.
1) Masala shartini qisqa qilib qayta yoz (rasmdan o'qigan bo'lsang — nimani o'qiganingni ayt; \
o'qib bo'lmasa, aniqroq rasm so'ra).
2) Asosiy g'oyani bir gapda ayt.
3) Yechimni qadam-baqadam ko'rsat va javobni alohida qatorda yoz.""",
}

TIL_NOMI = {"uz": "o'zbek (lotin yozuvida)", "ru": "rus"}


def tizim_korsatmasi(tur: str, til: str) -> str:
    return UMUMIY.format(til_nomi=TIL_NOMI.get(til, TIL_NOMI["uz"])) + "\n\n" + TUR_KORSATMA[tur]


# ------------------------------------------------------------ rasm


def _rasm_papka() -> Path:
    return Path(settings.AI_RASM_PAPKA)


def rasm_saqla(jpeg: bytes) -> str:
    papka = _rasm_papka()
    papka.mkdir(parents=True, exist_ok=True)
    nom = f"{uuid.uuid4().hex}.jpg"
    (papka / nom).write_bytes(jpeg)
    return nom


#: Rasmning uzun tomoni. Telefon surati 4000px — modelga bunchalik kerak
#: emas, lekin tokenlar (ya'ni pul) va so'rov hajmi shunga qarab o'sadi.
RASM_TOMON = 1600


def rasm_yukla(fayl) -> str:
    """
    Kelgan rasm: EXIF bo'yicha buriladi (daftar surati yonboshlab
    tushmasin), kichraytiriladi, JPEG qilinadi (EXIF va GPS tushib
    qoladi) va saqlanadi.
    """
    import io

    from PIL import Image, ImageOps

    if fayl.size > RASM_MAX:
        raise AiXato("katta")
    try:
        img = ImageOps.exif_transpose(Image.open(fayl))
        img.thumbnail((RASM_TOMON, RASM_TOMON))
        chiqish = io.BytesIO()
        img.convert("RGB").save(chiqish, format="JPEG", quality=85)
    except Exception:                               # noqa: BLE001 — rasm emas
        raise AiXato("rasm")
    return rasm_saqla(chiqish.getvalue())


def _rasm_baytlari(nom: str) -> bytes | None:
    if not nom or "/" in nom or "\\" in nom or ".." in nom:
        return None
    yol = _rasm_papka() / nom
    return yol.read_bytes() if yol.is_file() else None


# ------------------------------------------------------------ suhbat


def _sarlavha(s: AiSuhbat, matn: str) -> str:
    if s.tur == AiSuhbat.XATO:
        return _qisqa((s.kontekst or {}).get("savol"), 120)
    return _qisqa(matn.splitlines()[0] if matn else "", 120)


def _navbatga(ai: AiXabar) -> None:
    from .vazifalar import ai_javob, fonda

    fonda(ai_javob, ai.pk)


def boshla(pupil: Pupil, tur: str, matn: str = "", kontekst=None, rasm: str = "",
           manba: str = AiSuhbat.ILOVA) -> tuple[AiSuhbat, AiXabar]:
    """
    Yangi suhbat. `(suhbat, kutilayotgan_javob)` qaytadi yoki `AiXato`.

    `xato` — `kontekst` mijozdan (savol), `reja` — kontekstni server o'zi
    yig'adi, `repetitor` va `masala` — matn (masalada matn yoki rasm).
    """
    if tur not in dict(AiSuhbat.TURLAR):
        raise AiXato("tur")
    matn = (matn or "").strip()[:MAX_SAVOL]
    if tur == AiSuhbat.XATO:
        kontekst = xato_konteksti(kontekst)
    elif tur == AiSuhbat.REJA:
        kontekst = reja_konteksti(pupil)
    else:
        kontekst = {}
        if not matn and not (tur == AiSuhbat.MASALA and rasm):
            raise AiXato("bosh")
    with transaction.atomic():
        # Qator qulfi: bir vaqtda ikki so'rov (ikki qurilma yoki ikki
        # bosish) chegaradan bitta ortiq javob olmasin.
        Pupil.objects.select_for_update().filter(pk=pupil.pk).first()
        _tekshir(pupil)
        s = AiSuhbat(pupil=pupil, tur=tur, manba=manba, kontekst=kontekst,
                     rasm=rasm if tur == AiSuhbat.MASALA else "")
        s.sarlavha = _sarlavha(s, matn)
        s.save()
        AiXabar.objects.create(suhbat=s, pupil=pupil, rol=AiXabar.USER, matn=matn)
        ai = AiXabar.objects.create(suhbat=s, pupil=pupil, rol=AiXabar.AI, holat=AiXabar.KUTILMOQDA)
    _navbatga(ai)
    return s, ai


def davom(pupil: Pupil, s: AiSuhbat, matn: str) -> AiXabar:
    """Suhbatda keyingi savol. Oldingi javob hali yozilayotgan bo'lsa — `band`."""
    matn = (matn or "").strip()[:MAX_SAVOL]
    if not matn:
        raise AiXato("bosh")
    with transaction.atomic():
        Pupil.objects.select_for_update().filter(pk=pupil.pk).first()
        if s.xabarlar.filter(holat=AiXabar.KUTILMOQDA,
                             created_at__gt=timezone.now() - OSILIB_QOLGAN).exists():
            raise AiXato("band")
        _tekshir(pupil)
        AiXabar.objects.create(suhbat=s, pupil=pupil, rol=AiXabar.USER, matn=matn)
        ai = AiXabar.objects.create(suhbat=s, pupil=pupil, rol=AiXabar.AI, holat=AiXabar.KUTILMOQDA)
        AiSuhbat.objects.filter(pk=s.pk).update(yangilangan_at=timezone.now())
    _navbatga(ai)
    return ai


# ------------------------------------------------------------ javob


def _xabarlar(s: AiSuhbat, til: str) -> list[dict]:
    """
    Modelga ketadigan suhbat: kontekst va rasm BIRINCHI odam xabariga
    qo'shiladi, keyin oxirgi `TARIX` ta tayyor xabar.
    """
    tarix = list(s.xabarlar.exclude(holat=AiXabar.KUTILMOQDA).exclude(holat=AiXabar.XATO)
                 .order_by("created_at", "id"))
    birinchi = tarix[0] if tarix else None
    xabarlar = []
    for x in tarix:
        if x is birinchi:
            qism = [_kontekst_matni(s, til), x.matn]
            matn = "\n\n".join(q for q in qism if q) or "Yordam bering."
            jpeg = _rasm_baytlari(s.rasm)
            if jpeg:
                b64 = base64.standard_b64encode(jpeg).decode("ascii")
                xabarlar.append({"role": "user", "content": [
                    {"type": "text", "text": matn},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                ]})
            else:
                xabarlar.append({"role": "user", "content": matn})
        else:
            xabarlar.append({"role": "user" if x.rol == AiXabar.USER else "assistant", "content": x.matn})
    # Birinchi xabar (kontekst bilan) doim qoladi: usiz model nima haqida
    # gaplashayotganini bilmaydi.
    if len(xabarlar) > TARIX:
        xabarlar = xabarlar[:1] + xabarlar[-(TARIX - 1):]
    return xabarlar


def _chaqir(tizim: str, xabarlar: list[dict], pupil_id: int, tur: str) -> tuple[str, int, int]:
    """
    OpenAI Chat Completions. `(matn, kirish_token, chiqish_token)`.

    Paket shu yerda import qilinadi: AI o'chiq serverda (yoki testda)
    usiz ham hamma narsa ishlasin.
    """
    from openai import OpenAI

    # Eng yomon holatda ~2 daqiqa (60 s × 2 urinish): ilgari 120 s × 3 —
    # 6 daqiqa edi va ishchidagi joy shuncha band turardi, odam esa
    # "yozyapti" ni tomosha qilardi. Oddiy javob 5–15 soniya.
    mijoz = OpenAI(api_key=settings.OPENAI_API_KEY, timeout=60, max_retries=1)
    qoshimcha = {}
    if settings.OPENAI_FIKR:
        qoshimcha["reasoning_effort"] = settings.OPENAI_FIKR
    javob = mijoz.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[{"role": "system", "content": tizim}, *xabarlar],
        max_completion_tokens=settings.AI_MAX_TOKEN,
        # Tizim ko'rsatmasi har turda bir xil — OpenAI uni keshlaydi
        # va takroriy qism arzonroq hisoblanadi.
        prompt_cache_key=f"aqlzone-{tur}",
        # Suiiste'molni aniqlash uchun — ism yoki raqam emas, xesh.
        safety_identifier=hashlib.sha256(f"aqlzone:{pupil_id}".encode()).hexdigest()[:32],
        **qoshimcha,
    )
    tanlov = javob.choices[0]
    matn = (tanlov.message.content or getattr(tanlov.message, "refusal", None) or "").strip()
    if not matn:
        raise RuntimeError(f"bo'sh javob (finish_reason={tanlov.finish_reason})")
    kirish = javob.usage.prompt_tokens if javob.usage else 0
    chiqish = javob.usage.completion_tokens if javob.usage else 0
    return matn, kirish, chiqish


def javob_yoz(xabar_id: int) -> str:
    """
    Fondagi ish: kutilayotgan javobni to'ldiradi. Holatni qaytaradi.

    Xato YUTILADI va qatorga `xato` deb yoziladi: odam "qayta urinish"
    tugmasini ko'radi, chegara esa bu javobni sanamaydi.
    """
    ai = AiXabar.objects.select_related("suhbat", "pupil").filter(pk=xabar_id).first()
    if ai is None or ai.holat != AiXabar.KUTILMOQDA:
        return "yoq"
    s, til = ai.suhbat, ai.pupil.til or "uz"
    try:
        matn, kirish, chiqish = _chaqir(tizim_korsatmasi(s.tur, til), _xabarlar(s, til), ai.pupil_id, s.tur)
    except Exception:                                # noqa: BLE001
        log.exception("AI javobi olinmadi (xabar #%s)", xabar_id)
        AiXabar.objects.filter(pk=ai.pk).update(holat=AiXabar.XATO)
        if s.manba == AiSuhbat.BOT:
            _botga(ai.pupil, None)
        return AiXabar.XATO
    AiXabar.objects.filter(pk=ai.pk).update(holat=AiXabar.TAYYOR, matn=matn,
                                            kirish_token=kirish, chiqish_token=chiqish)
    AiSuhbat.objects.filter(pk=s.pk).update(yangilangan_at=timezone.now())
    if s.manba == AiSuhbat.BOT:
        _botga(ai.pupil, matn)
    return AiXabar.TAYYOR


#: Telegram xabari 4096 belgigacha; HTML qochirishdan keyin ham sig'sin.
BOT_BOLAK = 3500


def bolaklarga(matn: str, n: int = BOT_BOLAK) -> list[str]:
    """Uzun javobni qatorlar chegarasida bo'laklaydi (formula o'rtasida emas)."""
    bolaklar, joriy = [], ""
    for qator in matn.split("\n"):
        while len(qator) > n:
            if joriy:
                bolaklar.append(joriy)
                joriy = ""
            bolaklar.append(qator[:n])
            qator = qator[n:]
        if len(joriy) + len(qator) + 1 > n:
            bolaklar.append(joriy)
            joriy = qator
        else:
            joriy = f"{joriy}\n{qator}" if joriy else qator
    if joriy:
        bolaklar.append(joriy)
    return bolaklar


def _botga(pupil: Pupil, matn: str | None) -> None:
    """Botdan boshlangan suhbat — javob (yoki xato) bot xabari bo'lib ketadi."""
    from . import premium as PR
    from . import xabar as X
    from .matn import M

    chat = PR.tg_id(pupil)
    if not chat:
        return
    if matn is None:
        X.yubor(chat, M("aiXato", pupil.til or "uz"))
        return
    for bolak in bolaklarga(matn):
        X.yubor(chat, html.escape(bolak))


# ------------------------------------------------------------ ko'rinish


def _suhbat_qisqa(s: AiSuhbat) -> dict:
    return {"id": s.pk, "tur": s.tur, "sarlavha": s.sarlavha,
            "vaqt": s.yangilangan_at.isoformat()}


def suhbat_toliq(s: AiSuhbat) -> dict:
    hozir = timezone.now()
    xabarlar = []
    for x in s.xabarlar.all():
        h = x.holat
        # Ishchi yiqilgan bo'lsa qator abadiy "yozilmoqda" bo'lib qolmasin.
        if h == AiXabar.KUTILMOQDA and hozir - x.created_at > OSILIB_QOLGAN:
            h = AiXabar.XATO
        xabarlar.append({"id": x.pk, "rol": x.rol, "matn": x.matn, "holat": h})
    return {**_suhbat_qisqa(s), "kontekst": s.kontekst if s.tur == AiSuhbat.XATO else {},
            "rasm": bool(s.rasm), "xabarlar": xabarlar}


def qayta_urin(pupil: Pupil, s: AiSuhbat) -> AiXabar:
    """
    Oxirgi javob xato bilan tugagan — yangi javob qatori. Odamning xabari
    qayta yozilmaydi, eski xato qatori o'chiriladi (tarixda shovqin).
    """
    with transaction.atomic():
        Pupil.objects.select_for_update().filter(pk=pupil.pk).first()
        oxirgi = s.xabarlar.order_by("-created_at", "-id").first()
        if oxirgi is None or oxirgi.rol != AiXabar.AI:
            raise AiXato("bosh")
        osilgan = (oxirgi.holat == AiXabar.KUTILMOQDA
                   and timezone.now() - oxirgi.created_at > OSILIB_QOLGAN)
        if oxirgi.holat != AiXabar.XATO and not osilgan:
            raise AiXato("band")
        _tekshir(pupil)
        oxirgi.delete()
        ai = AiXabar.objects.create(suhbat=s, pupil=pupil, rol=AiXabar.AI, holat=AiXabar.KUTILMOQDA)
    _navbatga(ai)
    return ai
