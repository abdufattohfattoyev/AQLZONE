"""
Imtihon Premium — DTM, milliy sertifikat va prezident maktabi variantlari.

─────────────────── NIMA PULLIK, NIMA BEPUL ───────────────────

Pullik — FAQAT imtihon variantlari, va ulardan ham birinchi uchtasi
(`PREMIUM_BEPUL`) bepul. Bolaning darslari, o'yinlar, duel va
qolgan hamma narsa bepul qoladi: imtihonga tayyorlanayotgan odam
(yoki ota-onasi) natija uchun to'laydi, bola esa o'ynash uchun
to'lamasligi kerak.

─────────────────── HUQUQ SERVERDA ───────────────────

`Pupil.premium_gacha` — tanga yoki `localStorage` da emas: ular mijozda
hisoblanadi va soxtalashtirish bir qator kod. Savollar baribir mijozda
urug'dan yasaladi, ya'ni yopiq variantni ilova ichida qulf to'sadi;
server esa REYTING va TARIXNI himoya qiladi (`imtihon.yoz`): premiumsiz
yopiq variant natijasi yozilmaydi va haftalik jadvalga kirmaydi.

─────────────────── TO'LOV ───────────────────

Karta raqamiga o'tkazma → chek rasmi (SAYTDA yuklanadi yoki BOTGA
yuboriladi) → adminga rasm + "✅ Tasdiqlash" / "❌ Rad etish" → foydalanuvchiga
bot orqali xabar. Click/Payme ATAYLAB yo'q: ular shartnoma va komissiya
talab qiladi, boshlanishda esa kuniga bir nechta to'lov bo'ladi va ularni
ko'z bilan tekshirish bir daqiqalik ish.

Ikki yo'l bo'lishining sababi: saytni brauzerda ochgan odamda Telegram
bo'lmasligi mumkin — "chekni botga yuboring" uning uchun berk ko'cha edi.
"""
from __future__ import annotations

import html
import json
import re
import uuid
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import Identity, PremiumTolov, Pupil

#: Tarif → kun. Oy 30 kun deb olinadi: "fevralda 28 kun berdi" degan
#: savol tug'ilmasin. 7 kunlik — imtihondan oldingi so'nggi hafta uchun:
#: oylik to'lashga ikkilanayotgan odamga kichik birinchi qadam.
TARIF_KUN = {"7kun": 7, "1oy": 30}

#: Muddat tugashiga shuncha kun qolganda bitta eslatma ketadi. 7 kunlik
#: tarifda 3 kun — muddatning yarmi, shuning uchun u yerda 1 kun.
ESLATMA_KUN = 3

#: Bir odamda bir vaqtda nechta tekshirilmagan chek bo'lishi mumkin —
#: undan ko'pi tasodifiy takror yoki spam.
MAX_KUTILAYOTGAN = 3

#: Chek fayli — eng katta hajm (telefon skrinshoti 1–3 MB).
CHEK_MAX = 8 * 1024 * 1024


def som(n: int) -> str:
    """12000 → "12 000" — botda ham, panelda ham bir xil."""
    return f"{n:,}".replace(",", " ")


def narxlar() -> dict[str, int]:
    return {"7kun": settings.PREMIUM_NARX_7KUN, "1oy": settings.PREMIUM_NARX_1OY}


def tarif_nomi(tarif: str, til: str = "uz") -> str:
    nomlar = {"7kun": ("7 kun", "7 дней"), "1oy": ("1 oy", "1 месяц")}
    juft = nomlar.get(tarif, (tarif, tarif))
    return juft[1] if til == "ru" else juft[0]


def bepul_variant() -> int:
    return settings.PREMIUM_BEPUL


def faolmi(pupil: Pupil | None, hozir=None) -> bool:
    if pupil is None or pupil.premium_gacha is None:
        return False
    return pupil.premium_gacha > (hozir or timezone.now())


def ochiqmi(pupil: Pupil | None, variant: int) -> bool:
    """Shu variantni ishlash (va natijasini yozish) mumkinmi."""
    return variant <= bepul_variant() or faolmi(pupil)


def qolgan_matn(gacha, til: str = "uz", hozir=None) -> str:
    """
    "5 kun 3 soat" — qolgan vaqt, soatlari bilan.

    Faqat sana ("12.11 gacha") odamni hisoblashga majbur qiladi va oxirgi
    kunda "bugun tugaydimi, ertagami?" degan savol tug'iladi.
    """
    sek = max(0, int((gacha - (hozir or timezone.now())).total_seconds()))
    kun, qoldiq = divmod(sek, 86400)
    soat, qoldiq = divmod(qoldiq, 3600)
    daqiqa = qoldiq // 60
    ru = til == "ru"
    if kun:
        return f"{kun} дн. {soat} ч" if ru else f"{kun} kun {soat} soat"
    if soat:
        return f"{soat} ч {daqiqa} мин" if ru else f"{soat} soat {daqiqa} daqiqa"
    return f"{daqiqa} мин" if ru else f"{daqiqa} daqiqa"


def admin_havola() -> str:
    """Admin bilan aloqa: `PREMIUM_ADMIN` (username) bo'lsa — o'sha, aks holda bot."""
    nom = (settings.PREMIUM_ADMIN or "").lstrip("@").strip()
    if nom:
        return f"https://t.me/{nom}"
    bot = getattr(settings, "BOT_USERNAME", "") or ""
    return f"https://t.me/{bot}" if bot else ""


def holat(pupil: Pupil) -> dict:
    """`GET /api/v1/premium` va `/me` dagi `premium` maydoni."""
    hozir = timezone.now()
    faol = faolmi(pupil, hozir)
    kutilayotgan = PremiumTolov.objects.filter(pupil=pupil, holat=PremiumTolov.KUTILMOQDA).first()
    oxirgi_rad = (PremiumTolov.objects.filter(pupil=pupil).order_by("-created_at")
                  .values_list("holat", flat=True).first()) == PremiumTolov.RAD
    oxirgi_tasdiq = (PremiumTolov.objects.filter(pupil=pupil, holat=PremiumTolov.TASDIQLANDI)
                     .order_by("-hal_qilingan_at").values_list("hal_qilingan_at", flat=True).first())
    sinovda = faol and oxirgi_tasdiq is None
    # Joriy davr qachon boshlangan — profildagi "qancha qoldi" chizig'i uchun:
    # oxirgi tasdiqlangan to'lov yoki sinov. Uzaytirilgan obunada chiziq
    # oxirgi to'lovdan sanaladi.
    davr_boshi = (oxirgi_tasdiq or pupil.premium_sinov_at) if faol else None
    return {
        "faol": faol,
        "gacha": pupil.premium_gacha.isoformat() if faol else None,
        # Sekundlarda ham — mijoz soati noto'g'ri bo'lsa ham qolgan vaqt
        # to'g'ri chiqsin (u sanani o'z soatidan ayiradi).
        "qolgan_sekund": int((pupil.premium_gacha - hozir).total_seconds()) if faol else 0,
        "sinovda": sinovda,
        "davr_boshi": davr_boshi.isoformat() if davr_boshi else None,
        # Premium bilan ishlangan YOPIQ variantlar (DTM + sertifikat) — profilda
        # "nima oldim" degan savolga javob.
        "ishlangan": _yopiq_ishlangan(pupil),
        # Sinov — bir marta va faqat hech qachon premium bo'lmaganga:
        # muddati tugagan obunachiga "yana 3 kun bepul" har oy so'raladigan
        # tekin oyga aylanardi.
        "sinov_mumkin": pupil.premium_sinov_at is None and pupil.premium_gacha is None,
        "sinov_kun": settings.PREMIUM_SINOV_KUN,
        "bepul": bepul_variant(),
        "narxlar": narxlar(),
        "kunlar": TARIF_KUN,
        "karta": settings.PREMIUM_KARTA,
        "karta_egasi": settings.PREMIUM_KARTA_EGASI,
        "admin": admin_havola(),
        # Chek yuborilgan, hali tekshirilmagan — sahifa "tekshirilmoqda" deydi
        # va ikkinchi marta yuborishga undamaydi.
        "kutilmoqda": {"tarif": kutilayotgan.tarif, "vaqt": kutilayotgan.created_at.isoformat()}
        if kutilayotgan else None,
        "rad_etilgan": oxirgi_rad and not faol,
    }


def _yopiq_ishlangan(pupil: Pupil) -> int:
    from .models import ImtihonNatija

    return (ImtihonNatija.objects.filter(profile__pupil=pupil, kurs="", variant__gt=bepul_variant())
            .values("tur", "variant").distinct().count())


class SinovXato(Exception):
    pass


def sinov_ber(pupil_id: int) -> Pupil:
    """
    3 kunlik bepul sinov. Ikkinchi marta — `SinovXato`.

    Qator qulflanadi: ikki marta tez bosilgan tugma (yoki ikki qurilma)
    ikkita sinov bermasin.
    """
    with transaction.atomic():
        p = Pupil.objects.select_for_update().get(pk=pupil_id)
        if p.premium_sinov_at is not None or p.premium_gacha is not None:
            raise SinovXato("sinov allaqachon olingan")
        hozir = timezone.now()
        p.premium_sinov_at = hozir
        p.premium_gacha = hozir + timedelta(days=settings.PREMIUM_SINOV_KUN)
        p.save(update_fields=["premium_sinov_at", "premium_gacha"])
    return p


def tg_id(pupil: Pupil) -> str:
    kirish = pupil.identities.filter(provider=Identity.TELEGRAM).first()
    return kirish.external_id if kirish else ""


def pupil_tg(tg: str) -> Pupil | None:
    kirish = (Identity.objects.select_related("pupil")
              .filter(provider=Identity.TELEGRAM, external_id=str(tg)).first())
    return kirish.pupil if kirish else None


class ChekXato(Exception):
    """Foydalanuvchiga ko'rsatiladigan sabab — `kod` mijozda tarjima qilinadi."""

    def __init__(self, kod: str):
        super().__init__(kod)
        self.kod = kod


def tolov_yoz(pupil: Pupil, tarif: str, chek: str) -> PremiumTolov:
    """Chek keldi — `kutilmoqda` holatida yoziladi, summa HOZIRGI narxda."""
    if tarif not in TARIF_KUN:
        raise ChekXato("tarif")
    if PremiumTolov.objects.filter(pupil=pupil, holat=PremiumTolov.KUTILMOQDA).count() >= MAX_KUTILAYOTGAN:
        raise ChekXato("kop")
    return PremiumTolov.objects.create(
        pupil=pupil, tarif=tarif, summa=narxlar()[tarif], chek=chek[:255])


# ------------------------------------------------------------ chek fayli
#
# Saytdan yuklangan chek DISKDA turadi, `MEDIA_ROOT` dan TASHQARIDA:
# media ochiq beriladi, chekda esa odamning kartasi va ismi bor. Uni
# faqat boshqaruv paneli ko'rsatadi (`boshqaruv.premium_chek`).
#
# Botdan kelgan chek — Telegram `file_id`: rasm Telegram'da turadi.

FAYL = "fayl:"


def chek_papka() -> Path:
    return Path(settings.PREMIUM_CHEK_PAPKA)


def chek_fayli(t: PremiumTolov) -> Path | None:
    if not t.chek.startswith(FAYL):
        return None
    nom = t.chek[len(FAYL):]
    # Faqat o'zimiz bergan nom (`<uuid>.jpg`) — `../` va boshqa yo'l emas.
    if not re.fullmatch(r"[0-9a-f]{32}\.jpg", nom):
        return None
    return chek_papka() / nom


def chek_yukla(pupil: Pupil, tarif: str, fayl) -> tuple[PremiumTolov, bytes]:
    """
    Saytdan yuborilgan chek. Rasm JPEG ga o'giriladi (Telegram `sendPhoto`
    WebP/HEIC ni ba'zan rad etadi) va diskka yoziladi.
    """
    from . import rasm as R

    if tarif not in TARIF_KUN:
        raise ChekXato("tarif")
    if fayl is None:
        raise ChekXato("rasm")
    if fayl.size > CHEK_MAX:
        raise ChekXato("katta")
    try:
        jpeg = R.jpeg_qil(fayl)
    except Exception:                               # noqa: BLE001 — rasm emas
        raise ChekXato("rasm")
    papka = chek_papka()
    papka.mkdir(parents=True, exist_ok=True)
    nom = f"{uuid.uuid4().hex}.jpg"
    t = tolov_yoz(pupil, tarif, FAYL + nom)
    (papka / nom).write_bytes(jpeg)
    return t, jpeg


def admin_izohi(t: PremiumTolov) -> str:
    """Admin oladigan rasm ostidagi yozuv — qaror uchun kerakli hamma narsa."""
    p = t.pupil
    ism = html.escape(p.toliq_ism or "—")
    username = f"@{html.escape(p.username)}" if p.username else "—"
    oldingi = PremiumTolov.objects.filter(pupil=p, holat=PremiumTolov.TASDIQLANDI).count()
    qatorlar = [
        f"💳 <b>Premium to'lov #{t.pk}</b>",
        "",
        f"👤 {ism} · {username} · hisob #{p.pk}",
        f"📦 {tarif_nomi(t.tarif)} — <b>{som(t.summa)} so'm</b>",
        f"📥 {'saytdan' if t.chek.startswith(FAYL) else 'botdan'} · "
        f"{timezone.localtime(t.created_at):%d.%m.%Y %H:%M}",
        f"🔁 Oldin to'lagan: {oldingi} marta" if oldingi else "🆕 Birinchi to'lov",
    ]
    if p.premium_sinov_at:
        qatorlar.append("🧪 Sinovni olgan")
    if faolmi(p):
        qatorlar.append(f"⏳ Hozir faol: yana {qolgan_matn(p.premium_gacha)}")
    return "\n".join(qatorlar)


def admin_tugmalari(t: PremiumTolov) -> dict:
    from .xabar import QIZIL, YASHIL, tugma_yasa

    return {"inline_keyboard": [[
        tugma_yasa("✅ Tasdiqlash", YASHIL, callback_data=f"premium_ok:{t.pk}"),
        tugma_yasa("❌ Rad etish", QIZIL, callback_data=f"premium_rad:{t.pk}"),
    ]]}


def adminlarga_rasm(t: PremiumTolov, jpeg: bytes) -> int:
    """Saytdan kelgan chek — har adminga rasm + tasdiqlash tugmalari. Nechtasiga yetdi."""
    from . import xabar as X

    if not getattr(settings, "BOT_TOKEN", "") or getattr(settings, "TESTDA", False):
        return 0
    yetdi = 0
    for admin in settings.ADMIN_TG:
        maydonlar = {"chat_id": str(admin), "caption": admin_izohi(t), "parse_mode": "HTML",
                     "reply_markup": json.dumps(admin_tugmalari(t))}
        tana, turi = X._multipart(maydonlar, jpeg, fayl_nomi="chek.jpg")
        holat_, _, _ = X._fayl_sorov("sendPhoto", tana, turi, 60)
        yetdi += holat_ == "yuborildi"
    return yetdi


def chek_olindi_xabari(t: PremiumTolov) -> None:
    """Saytdan chek yuborgan odamga bot orqali "qabul qilindi" (Telegram'i bo'lsa)."""
    from .matn import M
    from .vazifalar import fonda, telegram_xabar

    chat = tg_id(t.pupil)
    if chat:
        fonda(telegram_xabar, chat, M("premiumChekOlindi", t.pupil.til or "uz"))


def hal_qil(tolov_id: int, tasdiq: bool) -> tuple[str, PremiumTolov | None]:
    """
    Admin qarori. `(natija, to'lov)` qaytadi; natija:

        tasdiqlandi | rad     — shu bosishda hal qilindi
        eskirgan              — allaqachon hal qilingan (ikkinchi bosish
                                yoki boshqa admin ulgurgan)
        yoq                   — bunday to'lov yo'q

    Tranzaksiya va qulf ichida holat QAYTA tekshiriladi: ikki admin bir
    lahzada bossa (yoki biri botda, biri panelda) ham bitta to'lov bir
    marta muddat qo'shadi.

    Muddat `max(hozir, premium_gacha)` dan uzayadi — muddati tugamasdan
    to'lagan odam qolgan kunlari va soatlarini yo'qotmasin.
    """
    with transaction.atomic():
        t = (PremiumTolov.objects.select_for_update()
             .filter(pk=tolov_id).first())
        if t is None:
            return "yoq", None
        if t.holat != PremiumTolov.KUTILMOQDA:
            return "eskirgan", t
        hozir = timezone.now()
        t.holat = PremiumTolov.TASDIQLANDI if tasdiq else PremiumTolov.RAD
        t.hal_qilingan_at = hozir
        t.save(update_fields=["holat", "hal_qilingan_at"])
        if tasdiq:
            p = Pupil.objects.select_for_update().get(pk=t.pupil_id)
            boshi = max(hozir, p.premium_gacha or hozir)
            p.premium_gacha = boshi + timedelta(days=TARIF_KUN.get(t.tarif, 30))
            p.save(update_fields=["premium_gacha"])
            t.pupil = p
    return t.holat, t


def foydalanuvchiga_xabar(t: PremiumTolov) -> None:
    """Qaror egasiga. Rad etilganda sabab aytilmaydi — qisqa va muloyim."""
    from .matn import M
    from .vazifalar import fonda, telegram_xabar
    from .xabar import ilova_havolasi

    p = t.pupil
    chat = tg_id(p)
    if not chat:
        return
    til = p.til or "uz"
    havola = ilova_havolasi()
    if t.holat == PremiumTolov.TASDIQLANDI:
        gacha = timezone.localtime(p.premium_gacha).strftime("%d.%m.%Y %H:%M")
        fonda(telegram_xabar, chat,
              M("premiumTasdiq", til, gacha=gacha, qolgan=qolgan_matn(p.premium_gacha, til),
                tarif=tarif_nomi(t.tarif, til)),
              tugma=M("tPremiumOchish", til) if havola else "",
              havola=f"{havola.rstrip('/')}/imtihon" if havola else "", ilovada=True)
    else:
        fonda(telegram_xabar, chat, M("premiumRad", til),
              tugma=M("tAdminAloqa", til) if admin_havola() else "", havola=admin_havola())


# ------------------------------------------------------------ eslatma


def eslatma_yubor(sinov: bool = False) -> list[str]:
    """
    Muddat tugashiga oz qolganlarga BITTA xabar (oylikda 3 kun, 7 kunlikda 1 kun).

    `premium_eslatildi` da qaysi muddat uchun yuborilgani turadi: jadval
    kuniga bir marta yursa ham, ikki marta yursa ham shu muddat uchun
    ikkinchi xabar ketmaydi. Uzaytirilgan obuna — yangi muddat, u yana
    o'z vaqtida eslatiladi.

    Faqat haqiqatan TO'LAGANLARGA: 3 kunlik sinov boshlanishi bilan
    "3 kun qoldi" oralig'ida bo'ladi va birinchi kuniyoq "tugayapti"
    degan xabar olish g'alati.
    """
    from django.db.models import Exists, F, OuterRef, Q

    from .matn import M
    from .xabar import bloklanganini_belgila, ilova_havolasi, yubor

    hozir = timezone.now()
    tolagan = PremiumTolov.objects.filter(pupil=OuterRef("pk"), holat=PremiumTolov.TASDIQLANDI)
    qs = (Pupil.objects
          .filter(premium_gacha__gt=hozir, premium_gacha__lte=hozir + timedelta(days=ESLATMA_KUN),
                  bot_bloklandi_at__isnull=True)
          .filter(Q(premium_eslatildi__isnull=True) | ~Q(premium_eslatildi=F("premium_gacha")))
          .filter(Exists(tolagan)))
    havola = ilova_havolasi()
    jurnal = []
    for p in qs:
        oxirgi = (PremiumTolov.objects.filter(pupil=p, holat=PremiumTolov.TASDIQLANDI)
                  .order_by("-hal_qilingan_at").values_list("tarif", flat=True).first())
        # 7 kunlikda "3 kun qoldi" muddatning yarmida kelardi.
        if oxirgi == "7kun" and p.premium_gacha - hozir > timedelta(days=1):
            continue
        chat = tg_id(p)
        if not chat:
            continue
        til = p.til or "uz"
        matn = M("premiumEslatma", til, qolgan=qolgan_matn(p.premium_gacha, til, hozir),
                 gacha=timezone.localtime(p.premium_gacha).strftime("%d.%m.%Y %H:%M"))
        if sinov:
            jurnal.append(f"{chat}: {matn[:60]}…")
            continue
        holat_, _ = yubor(chat, matn, tugma=M("tPremiumUzaytirish", til) if havola else "",
                          havola=f"{havola.rstrip('/')}/premium" if havola else "", ilovada=True)
        if holat_ == "bloklandi":
            bloklanganini_belgila(p.pk)
        # Yuborilmagan bo'lsa ham belgilanadi ("xato" dan tashqari): bloklagan
        # odamga ertaga yana urinish ma'nosiz.
        if holat_ != "xato":
            Pupil.objects.filter(pk=p.pk).update(premium_eslatildi=p.premium_gacha)
        jurnal.append(f"{chat}: {holat_}")
    return jurnal


# ------------------------------------------------------------ panel

#: Ro'yxatdagi variant tugmasining `data-tahlil` yozuvi (`Imtihon: 7-variant`).
VARIANT_BOSISH = re.compile(r"^(Imtihon|Sertifikat|Qabul): (\d+)-variant$")


def _ozgarish(hozirgi: int, oldingi: int) -> int | None:
    """Foizdagi o'zgarish; oldingi 0 bo'lsa — `None` (cheksiz o'sish ma'nosiz)."""
    return round(100 * (hozirgi - oldingi) / oldingi) if oldingi else None


def voronka(kunlar: int = 30) -> list[dict]:
    """
    Premium qaysi bosqichgacha yetib keldi — HAR BOSQICHDA nechta ODAM.

    Bosqichlar ketma-ketligi foydalanuvchi yo'li bo'yicha:
    yopiq variantni bosdi → Premium sahifasini ochdi → tarif tanladi →
    chek yubordi → tasdiqlandi. Har qatorda oldingisiga nisbatan foiz —
    qaysi joyda odam ketib qolayotgani shundan ko'rinadi.
    """
    from .models import Hodisa

    boshi = timezone.now() - timedelta(days=kunlar)
    bosishlar = Hodisa.objects.filter(tur=Hodisa.BOSISH, created_at__gte=boshi)
    yopiq = set()
    for pid, nom in bosishlar.filter(nom__regex=r"^(Imtihon|Sertifikat|Qabul): \d+-variant$") \
            .values_list("pupil_id", "nom"):
        m = VARIANT_BOSISH.match(nom)
        if m and int(m.group(2)) > bepul_variant():
            yopiq.add(pid)

    def odam(qs) -> int:
        return qs.values("pupil_id").distinct().count()

    sahifa = odam(Hodisa.objects.filter(tur=Hodisa.SAHIFA, yol="/premium", created_at__gte=boshi))
    tarif = odam(bosishlar.filter(nom__startswith="Premium: tarif"))
    tolov_qs = PremiumTolov.objects.filter(created_at__gte=boshi)
    chek = odam(tolov_qs)
    tasdiq = odam(tolov_qs.filter(holat=PremiumTolov.TASDIQLANDI))
    bosqichlar = [
        ("Yopiq variantni bosdi", len(yopiq)),
        ("Premium sahifasini ochdi", sahifa),
        ("Tarif tanladi", tarif),
        ("Chek yubordi", chek),
        ("Tasdiqlandi", tasdiq),
    ]
    natija, oldingi = [], None
    eng = max([s for _, s in bosqichlar] + [1])
    for nom, son in bosqichlar:
        natija.append({"nom": nom, "son": son, "kenglik": round(100 * son / eng),
                       "foiz": round(100 * son / oldingi) if oldingi else None})
        oldingi = son or oldingi
    return natija


def panel_statistika(kunlar: int = 30) -> dict:
    """`/boshqaruv/premium` — navbat, faollar (qolgan soatlari bilan), tushum va voronka."""
    from django.db.models import Count, Sum

    hozir = timezone.now()
    mahalliy = timezone.localtime(hozir)
    oy_boshi = mahalliy.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    hafta_boshi = (mahalliy - timedelta(days=mahalliy.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0)
    otgan_hafta = hafta_boshi - timedelta(days=7)
    tasdiq = PremiumTolov.objects.filter(holat=PremiumTolov.TASDIQLANDI)

    def tushum(qs) -> int:
        return qs.aggregate(s=Sum("summa"))["s"] or 0

    # So'nggi 6 oy tushumi — oyma-oy (Python'da: SQLite va Postgres
    # sana qirqishni har xil yozadi, oyiga o'nlab qator esa sezilmaydi).
    oylar: dict[str, int] = {}
    boshi6 = (oy_boshi - timedelta(days=31 * 5)).replace(day=1)
    for t in tasdiq.filter(hal_qilingan_at__gte=boshi6).only("summa", "hal_qilingan_at"):
        k = timezone.localtime(t.hal_qilingan_at).strftime("%Y-%m")
        oylar[k] = oylar.get(k, 0) + t.summa

    tolagan_idlar = set(tasdiq.values_list("pupil_id", flat=True))
    faollar = list(Pupil.objects.filter(premium_gacha__gt=hozir).order_by("premium_gacha"))
    for p in faollar:
        p.qolgan = qolgan_matn(p.premium_gacha, hozir=hozir)
        p.tolagan = p.pk in tolagan_idlar
        p.tez_tugaydi = p.premium_gacha - hozir <= timedelta(days=ESLATMA_KUN)

    kutilmoqda = list(PremiumTolov.objects.filter(holat=PremiumTolov.KUTILMOQDA)
                      .select_related("pupil").order_by("created_at")[:100])
    for t in kutilmoqda:
        t.summa_matn = som(t.summa)
        t.tarif_matn = tarif_nomi(t.tarif)
        t.manba = "sayt" if t.chek.startswith(FAYL) else "bot"
        t.kutgan = qolgan_matn(hozir, hozir=t.created_at)
    songgi = list(PremiumTolov.objects.exclude(holat=PremiumTolov.KUTILMOQDA)
                  .select_related("pupil").order_by("-hal_qilingan_at")[:30])
    for t in songgi:
        t.summa_matn = som(t.summa)
        t.tarif_matn = tarif_nomi(t.tarif)

    shu_hafta = tushum(tasdiq.filter(hal_qilingan_at__gte=hafta_boshi))
    otgan = tushum(tasdiq.filter(hal_qilingan_at__gte=otgan_hafta, hal_qilingan_at__lt=hafta_boshi))
    oy_tushum = tushum(tasdiq.filter(hal_qilingan_at__gte=oy_boshi))

    # Sinovdan to'lovga o'tish — sinovning o'zi foyda keltiryaptimi.
    sinov_olgan = set(Pupil.objects.filter(premium_sinov_at__isnull=False).values_list("pk", flat=True))
    sinovdan_tolagan = len(sinov_olgan & tolagan_idlar)
    # Qayta to'laganlar — muddati tugab, yana kelganlar (obunaning sog'ligi).
    qayta = (tasdiq.values("pupil_id").annotate(n=Count("id")).filter(n__gte=2).count())
    tugagan = Pupil.objects.filter(premium_gacha__lte=hozir, pk__in=tolagan_idlar).count()
    tariflar = [{"nom": tarif_nomi(k), "soni": n, "tushum": som(s or 0)}
                for k, n, s in tasdiq.values_list("tarif").annotate(n=Count("id"), s=Sum("summa"))
                .values_list("tarif", "n", "s")]

    return {
        "kunlar": kunlar,
        "kutilmoqda": kutilmoqda,
        "faollar": faollar,
        "faol_soni": len(faollar),
        "faol_tolagan": sum(1 for p in faollar if p.tolagan),
        "faol_sinov": sum(1 for p in faollar if not p.tolagan),
        "oy_tushum": oy_tushum,
        "oy_tushum_matn": som(oy_tushum),
        "oy_soni": tasdiq.filter(hal_qilingan_at__gte=oy_boshi).count(),
        "hafta_tushum_matn": som(shu_hafta),
        "otgan_hafta_matn": som(otgan),
        "hafta_ozgarish": _ozgarish(shu_hafta, otgan),
        "jami_tushum_matn": som(tushum(tasdiq)),
        "oylar": sorted(oylar.items(), reverse=True),
        "oylar_matn": [(k, som(v)) for k, v in sorted(oylar.items(), reverse=True)],
        "sinov_olgan": len(sinov_olgan),
        "sinovdan_tolagan": sinovdan_tolagan,
        "sinov_foiz": round(100 * sinovdan_tolagan / len(sinov_olgan)) if sinov_olgan else 0,
        "qayta_tolagan": qayta,
        "tugagan": tugagan,
        "rad_soni": PremiumTolov.objects.filter(holat=PremiumTolov.RAD).count(),
        "tariflar": tariflar,
        "voronka": voronka(kunlar),
        "songgi": songgi,
        "yangilangan": hozir,
    }
