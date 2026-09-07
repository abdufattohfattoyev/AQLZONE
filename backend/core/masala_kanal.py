"""
Masalani Telegram kanaliga joylash.

Ikki joydan chaqiriladi va shuning uchun alohida modulda turadi:

  * ilovadagi admin tugmasi (`views.masala_kanal`)
  * buyruq satri (`management/commands/masala_post.py`)

─────────────────── XABAR NEGA SHUNDAY QURILGAN ───────────────────

Kanaldagi xabar uchta qismdan iborat va uchalasi ham zarur:

  RASM       chizmali masalada chizma shartning yarmi. Rasmsiz post
             oqimda ko'zga tashlanmaydi.
  MATN       to'liq shart — odam kanalning o'zida o'ylay boshlashi
             kerak. "Ilovada o'qing" degan post bosilmaydi.
  TUGMA      javob kiritish uchun. U `t.me/<bot>?startapp=masala_12`
             ga olib boradi, ya'ni Mini App AYNAN shu masalada
             ochiladi va odam javob maydonini darhol ko'radi.

Tugma ATAYLAB oddiy havola tugmasi: kanal xabarida Telegram Mini App
tugmasiga (`web_app`) ruxsat bermaydi va butun xabarni rad etadi.

─────────────────── JAVOB KANALDA YOZILMAYDI ───────────────────

Kanalda javob variantlari ham, "javobni izohga yozing" ham yo'q va
bu ataylab: birinchi izohdagi javob qolgan hammaning masalasini
o'ldiradi. Javob faqat ilovada kiritiladi — o'sha yerda u
tekshiriladi, statistikaga tushadi va yechim ochiladi.
"""
from __future__ import annotations

from django.conf import settings
from django.utils import timezone

from . import xabar
from .boshqaruv import sinf_nomi
from .kanal import kanal_nomi
from .models import Masala
from .rasm import jpeg_qil

#: Kanal xabaridagi tugma matni.
TUGMA = "✍️ Javobni kiritish"

#: Sarlavhada shartga ajratilgan joy (Telegram jami 1024 beradi).
MATN_JOYI = 700


def havola(masala: Masala) -> str:
    """Ilovani AYNAN shu masalada ochadigan manzil."""
    bot = (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")
    return f"https://t.me/{bot}?startapp=masala_{masala.pk}" if bot else ""


def sarlavha(masala: Masala) -> str:
    """Rasm ostidagi yozuv."""
    matn = masala.matn.strip()
    if len(matn) > MATN_JOYI:
        kesik = matn[:MATN_JOYI]
        bosh = kesik.rfind(" ")
        matn = (kesik[:bosh] if bosh > MATN_JOYI * 0.6 else kesik).rstrip() + "…"

    # Sinf nomi teg bo'lib ham ketadi: kanal o'sganda odam o'z sinfi
    # bo'yicha qidira oladi.
    teg = sinf_nomi(masala.sinf).replace("-", "").replace(" ", "_")
    return (
        f"<b>{sinf_nomi(masala.sinf)}</b>\n\n"
        f"{matn}\n\n"
        f"Javobingizni ilovada kiriting — u yerda tekshiriladi va "
        f"yechimi ochiladi.\n\n"
        f"#masala #{teg}"
    )


def kunlik() -> Masala | None:
    """
    Bugungi masala — hali kanalga tushmagan eng eskisi.

    Eng eskisi ATAYLAB: yangi masala ro'yxatda o'zi tepada turadi va
    ko'rinadi, eski esa pastga tushib ketgan bo'ladi. Kanal aynan
    o'shalarga ikkinchi hayot beradi.

    Chizmasi borlar birinchi navbatda: rasmli post kanalda sezilarli
    darajada ko'proq ko'riladi.
    """
    tayyor = Masala.objects.filter(holat=Masala.TASDIQ, kanal_at__isnull=True)
    return (
        tayyor.exclude(rasm="").exclude(rasm__isnull=True).order_by("created_at").first()
        or tayyor.order_by("created_at").first()
    )


def yubor(masala: Masala) -> tuple[str, str]:
    """
    Masalani kanalga joylaydi. `(holat, izoh)` qaytaradi.

    Holat: `yuborildi` | `bloklandi` | `xato` | `sozlanmagan` |
    `tasdiqlanmagan` | `takror`.

    Muvaffaqiyatli bo'lsa `kanal_at` yoziladi — shundan keyin bir
    masala ikkinchi marta kanalga tushmaydi.
    """
    if masala.holat != Masala.TASDIQ:
        return "tasdiqlanmagan", ""
    if masala.kanal_at is not None:
        return "takror", ""

    kanal = kanal_nomi()
    manzil = havola(masala)
    # Tugmasiz post ma'nosiz: odam masalani o'qiydi-yu, javob
    # kiritadigan joyni topolmaydi.
    if not kanal or not manzil:
        return "sozlanmagan", ""

    yozuv = sarlavha(masala)
    if masala.rasm:
        with masala.rasm.open("rb") as f:
            holat, izoh = xabar.rasm_yubor(kanal, jpeg_qil(f), yozuv, TUGMA, manzil)
    else:
        # Rasmsiz masala ham joylanadi, faqat oddiy xabar bo'lib.
        holat, izoh = xabar.yubor(kanal, yozuv, TUGMA, manzil)

    if holat == "yuborildi":
        masala.kanal_at = timezone.now()
        masala.save(update_fields=["kanal_at"])
    return holat, izoh
