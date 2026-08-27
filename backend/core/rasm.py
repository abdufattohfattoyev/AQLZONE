"""
Foydalanuvchi yuborgan rasmni XAVFSIZ holga keltirish.

────────────────── NEGA QAYTA KODLANADI ──────────────────

Kelgan faylni shundayligicha saqlash mumkin emas va sabab uchta.

1. FAYL HAQIQATAN RASMMI. Mijoz aytgan turga (`Content-Type`) yoki
   kengaytmaga ishonib bo'lmaydi — ikkalasini ham istalgan odam
   yozadi. Yagona ishonchli tekshiruv — faylni OCHIB ko'rish. Ochib
   bo'lmasa, u rasm emas.

2. EXIF. Telefon suratining ichida GPS koordinatasi, qurilma nomi va
   aniq vaqt yotadi. Bolaning uy vazifasi surati saytga chiqsa, u
   bilan birga uyning koordinatasi ham chiqib ketardi. Qayta
   kodlashda bu ma'lumot butunlay yo'qoladi.

3. HAJM. 4000 pikselli surat o'n barobar ko'p joy egallaydi va
   sekin internetda ochilmaydi. Masalaga esa 1600 piksel yetadi.

Natija HAR DOIM WebP: bitta format — bitta yo'l. Serverda saqlangan
fayllar turli formatda bo'lsa, ularni ko'rsatadigan har joyda
"bu qaysi turda edi?" degan savol paydo bo'lardi.
"""
from __future__ import annotations

import io

from django.conf import settings
from django.core.files.uploadedfile import InMemoryUploadedFile

try:
    from PIL import Image, ImageOps
except ImportError:                                   # pragma: no cover
    Image = None                                      # type: ignore[assignment]
    ImageOps = None                                   # type: ignore[assignment]


class RasmXato(Exception):
    """Rasmni qabul qilib bo'lmadi. Xabari foydalanuvchiga ko'rsatiladi."""


#: Pillow o'qiy oladigan, lekin biz QABUL QILMAYDIGAN formatlar.
#:
#: GIF harakatlanadi va u masala rasmi emas, ko'proq hazil bo'ladi;
#: qayta kodlanganda esa harakati yo'qolib, birinchi kadr qolardi —
#: ya'ni odam yuborgan narsa emas. SVG esa umuman rasm emas: uning
#: ichida skript bo'lishi mumkin.
RAD_FORMAT = {"GIF", "SVG", "MPO"}


def tayyorla(fayl) -> InMemoryUploadedFile:
    """
    Yuborilgan faylni tekshiradi va WebP ga qayta kodlaydi.

    Xato bo'lsa `RasmXato` ko'tariladi — matni foydalanuvchiga
    tushunarli tilda yoziladi, chunki u ekranda ko'rinadi.
    """
    if Image is None:                                 # pragma: no cover
        raise RasmXato("Rasm qo'llab-quvvatlanmaydi")

    if fayl.size > settings.MASALA_RASM_MAX:
        mb = settings.MASALA_RASM_MAX // (1024 * 1024)
        raise RasmXato(f"Rasm juda katta — {mb} MB gacha bo'lsin")

    try:
        img = Image.open(fayl)
        # `verify()` faylni O'QIB chiqadi, lekin obyektni yaroqsiz
        # qoldiradi — shuning uchun keyin qaytadan ochamiz. Ikki
        # bosqich ataylab: `verify` buzuq faylni erta tutadi.
        turi = (img.format or "").upper()
        img.verify()
        fayl.seek(0)
        img = Image.open(fayl)
    except RasmXato:
        raise
    except Exception as e:                            # noqa: BLE001
        raise RasmXato("Bu fayl rasm emas") from e

    if turi in RAD_FORMAT:
        raise RasmXato("Bu turdagi rasm qabul qilinmaydi")

    # Telefon suratlari ko'pincha yon tomonga yotgan bo'ladi va
    # to'g'ri tomoni faqat EXIF da yozilgan bo'ladi. EXIF ni tashlab
    # yuborayotganimiz uchun burilishni OLDIN qo'llaymiz — aks holda
    # rasm yonboshlab qolardi.
    img = ImageOps.exif_transpose(img)

    # Shaffoflik yo'qoladi: WebP uni saqlaydi, lekin masala rasmi oq
    # fonda ko'rinishi kerak — qora mavzuda shaffof PNG ning qora
    # chizig'i butunlay ko'rinmay qolardi.
    if img.mode in ("RGBA", "LA", "P"):
        fon = Image.new("RGB", img.size, (255, 255, 255))
        img = img.convert("RGBA")
        fon.paste(img, mask=img.split()[-1])
        img = fon
    else:
        img = img.convert("RGB")

    olcham = settings.MASALA_RASM_OLCHAM
    img.thumbnail((olcham, olcham), Image.LANCZOS)

    chiqish = io.BytesIO()
    img.save(chiqish, format="WEBP", quality=82, method=4)
    chiqish.seek(0)

    return InMemoryUploadedFile(
        chiqish, None, "masala.webp", "image/webp", chiqish.getbuffer().nbytes, None,
    )
