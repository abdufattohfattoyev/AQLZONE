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

Karta raqamiga o'tkazma → chek rasmi botga → admin "✅ Tasdiqlash"
(`management/commands/bot.py`). Click/Payme ATAYLAB yo'q: ular shartnoma
va komissiya talab qiladi, boshlanishda esa oyiga o'nlab to'lov bo'ladi
va ularni ko'z bilan tekshirish bir daqiqalik ish.
"""
from __future__ import annotations

import html
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import Identity, PremiumTolov, Pupil

#: Tarif → kun. Oy 30 kun deb olinadi: "fevralda 28 kun berdi" degan
#: savol tug'ilmasin.
TARIF_KUN = {"1oy": 30, "3oy": 90}

#: Muddat tugashiga shuncha kun qolganda bitta eslatma ketadi.
ESLATMA_KUN = 3


def som(n: int) -> str:
    """49000 → "49 000" — botda ham, panelda ham bir xil."""
    return f"{n:,}".replace(",", " ")


def narxlar() -> dict[str, int]:
    return {"1oy": settings.PREMIUM_NARX_1OY, "3oy": settings.PREMIUM_NARX_3OY}


def bepul_variant() -> int:
    return settings.PREMIUM_BEPUL


def faolmi(pupil: Pupil | None, hozir=None) -> bool:
    if pupil is None or pupil.premium_gacha is None:
        return False
    return pupil.premium_gacha > (hozir or timezone.now())


def ochiqmi(pupil: Pupil | None, variant: int) -> bool:
    """Shu variantni ishlash (va natijasini yozish) mumkinmi."""
    return variant <= bepul_variant() or faolmi(pupil)


def holat(pupil: Pupil) -> dict:
    """`GET /api/v1/premium` va `/me` dagi `premium` maydoni."""
    faol = faolmi(pupil)
    return {
        "faol": faol,
        "gacha": pupil.premium_gacha.isoformat() if faol else None,
        # Sinov — bir marta va faqat hech qachon premium bo'lmaganga:
        # muddati tugagan obunachiga "yana 3 kun bepul" har oy so'raladigan
        # tekin oyga aylanardi.
        "sinov_mumkin": pupil.premium_sinov_at is None and pupil.premium_gacha is None,
        "sinov_kun": settings.PREMIUM_SINOV_KUN,
        "bepul": bepul_variant(),
        "narxlar": narxlar(),
        "karta": settings.PREMIUM_KARTA,
        "karta_egasi": settings.PREMIUM_KARTA_EGASI,
    }


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


def tolov_yoz(pupil: Pupil, tarif: str, chek: str) -> PremiumTolov:
    """Chek keldi — `kutilmoqda` holatida yoziladi, summa HOZIRGI narxda."""
    if tarif not in TARIF_KUN:
        raise ValueError(tarif)
    return PremiumTolov.objects.create(
        pupil=pupil, tarif=tarif, summa=narxlar()[tarif], chek=chek[:255])


def admin_izohi(t: PremiumTolov) -> str:
    """Admin oladigan rasm ostidagi yozuv."""
    p = t.pupil
    ism = html.escape(p.toliq_ism or "—")
    username = f"@{html.escape(p.username)}" if p.username else "—"
    tarif = dict(PremiumTolov.TARIFLAR)[t.tarif]
    qolgan = ""
    if faolmi(p):
        qolgan = f"\n⏳ Hozir faol: {timezone.localtime(p.premium_gacha):%d.%m.%Y} gacha"
    return (
        f"💳 <b>Premium to'lov #{t.pk}</b>\n\n"
        f"👤 {ism} · {username} · hisob #{p.pk}\n"
        f"📦 {tarif} — <b>{som(t.summa)} so'm</b>" + qolgan
    )


def hal_qil(tolov_id: int, tasdiq: bool) -> tuple[str, PremiumTolov | None]:
    """
    Admin qarori. `(natija, to'lov)` qaytadi; natija:

        tasdiqlandi | rad     — shu bosishda hal qilindi
        eskirgan              — allaqachon hal qilingan (ikkinchi bosish
                                yoki boshqa admin ulgurgan)
        yoq                   — bunday to'lov yo'q

    Tranzaksiya va qulf ichida holat QAYTA tekshiriladi: ikki admin bir
    lahzada bossa ham bitta to'lov bir marta muddat qo'shadi.

    Muddat `max(hozir, premium_gacha)` dan uzayadi — oyi tugamasdan
    to'lagan odam qolgan kunlarini yo'qotmasin.
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
            p.premium_gacha = boshi + timedelta(days=TARIF_KUN[t.tarif])
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
    if t.holat == PremiumTolov.TASDIQLANDI:
        gacha = timezone.localtime(p.premium_gacha).strftime("%d.%m.%Y")
        havola = ilova_havolasi()
        fonda(telegram_xabar, chat, M("premiumTasdiq", til, gacha=gacha),
              tugma=M("tPremiumOchish", til) if havola else "",
              havola=f"{havola.rstrip('/')}/imtihon" if havola else "", ilovada=True)
    else:
        fonda(telegram_xabar, chat, M("premiumRad", til))


# ------------------------------------------------------------ eslatma


def eslatma_yubor(sinov: bool = False) -> list[str]:
    """
    Muddat tugashiga 3 kun qolganlarga BITTA xabar.

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
        chat = tg_id(p)
        if not chat:
            continue
        til = p.til or "uz"
        gacha = timezone.localtime(p.premium_gacha).strftime("%d.%m.%Y")
        matn = M("premiumEslatma", til, gacha=gacha)
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


def panel_statistika() -> dict:
    """`/boshqaruv/premium` — kutayotganlar, faollar va tushum."""
    from django.db.models import Sum

    hozir = timezone.now()
    mahalliy = timezone.localtime(hozir)
    oy_boshi = mahalliy.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    tasdiq = PremiumTolov.objects.filter(holat=PremiumTolov.TASDIQLANDI)

    # So'nggi 6 oy tushumi — oyma-oy (Python'da: SQLite va Postgres
    # sana qirqishni har xil yozadi, oyiga o'nlab qator esa sezilmaydi).
    oylar: dict[str, int] = {}
    boshi6 = (oy_boshi - timedelta(days=31 * 5)).replace(day=1)
    for t in tasdiq.filter(hal_qilingan_at__gte=boshi6).only("summa", "hal_qilingan_at"):
        k = timezone.localtime(t.hal_qilingan_at).strftime("%Y-%m")
        oylar[k] = oylar.get(k, 0) + t.summa

    faol = Pupil.objects.filter(premium_gacha__gt=hozir)
    tolagan_idlar = tasdiq.values("pupil_id")
    kutilmoqda = list(PremiumTolov.objects.filter(holat=PremiumTolov.KUTILMOQDA)
                      .select_related("pupil").order_by("created_at")[:100])
    for t in kutilmoqda:
        t.summa_matn = som(t.summa)
    oy_tushum = tasdiq.filter(hal_qilingan_at__gte=oy_boshi).aggregate(s=Sum("summa"))["s"] or 0
    return {
        "kutilmoqda": kutilmoqda,
        "oy_tushum_matn": som(oy_tushum),
        "oylar_matn": [(k, som(v)) for k, v in sorted(oylar.items(), reverse=True)],
        "faol_soni": faol.count(),
        "faol_tolagan": faol.filter(pk__in=tolagan_idlar).count(),
        "faol_sinov": faol.exclude(pk__in=tolagan_idlar).count(),
        "oy_tushum": oy_tushum,
        "oy_soni": tasdiq.filter(hal_qilingan_at__gte=oy_boshi).count(),
        "oylar": sorted(oylar.items(), reverse=True),
        "songgi": list(PremiumTolov.objects.exclude(holat=PremiumTolov.KUTILMOQDA)
                       .select_related("pupil").order_by("-hal_qilingan_at")[:30]),
        "yangilangan": hozir,
    }
