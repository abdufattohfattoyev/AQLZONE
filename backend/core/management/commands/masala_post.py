"""
Masalani Telegram kanaliga joylash.

Ishlatish:

    python manage.py masala_post --sinov       # nima ketishini ko'rsatadi
    python manage.py masala_post --kunlik      # bugungi masalani joylaydi
    python manage.py masala_post 12            # aynan shu masalani

Buyruq O'ZI rejalashtirmaydi — uni kuniga bir marta cron chaqiradi
(`eslatma` buyrug'i bilan bir xil qoida).

─────────────────── XABAR NEGA SHUNDAY QURILGAN ───────────────────

Kanaldagi xabar uchta qismdan iborat va uchalasi ham zarur:

  RASM       chizmali masalada chizma shartning yarmi. Rasmsiz post
             oddiy matn bo'lib oqimda ko'zga tashlanmaydi.
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
from django.core.management.base import BaseCommand
from django.utils import timezone

from core import xabar
from core.boshqaruv import sinf_nomi
from core.kanal import kanal_nomi
from core.models import Masala
from core.rasm import jpeg_qil

#: Kanal xabaridagi tugma matni.
TUGMA = "✍️ Javobni kiritish"

#: Sarlavha uzunligi chegarasi (Telegram 1024 beradi, qolgani bizniki).
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


class Command(BaseCommand):
    help = "Masalani Telegram kanaliga joylaydi"

    def add_arguments(self, parser) -> None:
        parser.add_argument("id", nargs="?", type=int, help="masala raqami")
        parser.add_argument("--kunlik", action="store_true",
                            help="hali joylanmagan eng eski masalani tanlaydi")
        parser.add_argument("--sinov", action="store_true",
                            help="yubormaydi, faqat ko'rsatadi")

    def handle(self, *args, **o) -> None:
        # Sozlamada kanal `@` siz turishi mumkin (`KANAL=AqlZoneUz`),
        # Telegram esa `@nom` kutadi va boshqasiga "chat not found"
        # deb javob beradi. Normallashtirish `core/kanal.py` da,
        # a'zolik tekshiruvi bilan bitta joyda.
        kanal = kanal_nomi()
        if not kanal:
            self.stderr.write("KANAL sozlanmagan — post yuborilmaydi")
            return

        if o["id"]:
            masala = Masala.objects.filter(pk=o["id"]).first()
            if masala is None:
                self.stderr.write(f"#{o['id']} topilmadi")
                return
            if masala.holat != Masala.TASDIQ:
                self.stderr.write(f"#{masala.pk} tasdiqlanmagan — kanalga chiqmaydi")
                return
        elif o["kunlik"]:
            masala = kunlik()
            if masala is None:
                self.stdout.write("Joylanmagan masala qolmadi")
                return
        else:
            self.stderr.write("Masala raqami yoki --kunlik kerak")
            return

        manzil = havola(masala)
        if not manzil:
            self.stderr.write("BOT_USERNAME sozlanmagan — tugmasiz post ma'nosiz")
            return

        yozuv = sarlavha(masala)
        self.stdout.write(f"#{masala.pk} → {kanal}")
        self.stdout.write(f"havola: {manzil}")
        self.stdout.write(f"rasm:   {'bor' if masala.rasm else 'yo`q'}")
        self.stdout.write("─" * 50)
        self.stdout.write(yozuv)
        self.stdout.write("─" * 50)

        if o["sinov"]:
            self.stdout.write("(sinov — yuborilmadi)")
            return

        if masala.rasm:
            with masala.rasm.open("rb") as f:
                holat, izoh = xabar.rasm_yubor(kanal, jpeg_qil(f), yozuv, TUGMA, manzil)
        else:
            # Rasmsiz masala ham joylanadi, faqat oddiy xabar bo'lib.
            holat, izoh = xabar.yubor(kanal, yozuv, TUGMA, manzil)

        if holat != "yuborildi":
            self.stderr.write(f"yuborilmadi ({holat}): {izoh}")
            return

        masala.kanal_at = timezone.now()
        masala.save(update_fields=["kanal_at"])
        self.stdout.write(self.style.SUCCESS(f"#{masala.pk} kanalga joylandi"))
