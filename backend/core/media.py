"""
Foydalanuvchi yuborgan fayllarni berish (`/media/...`).

────────────────── NEGA DJANGO BERADI ──────────────────

Odatda bunday fayllarni oldindagi nginx beradi va bu tezroq. Bu
loyihada esa nginx BOSHQA loyihaga tegishli va uning sozlamasiga
tegib bo'lmaydi (`docker-compose.yml` dagi izohga qarang) — u yerda
bir nechta sayt yashaydi va bitta noto'g'ri qator hammasini
o'chirardi.

Django berishi bu yerda xavfsiz: rasmlar soni oz (kuniga bir necha
dona), hajmi kichik (qayta kodlangandan keyin ~100 KB) va ular
uzoq keshlanadi.

────────────────── XAVFSIZLIK ──────────────────

Fayl nomi manzildan keladi, ya'ni uni istalgan odam yozadi. Shuning
uchun so'ralgan yo'l `MEDIA_ROOT` ICHIDA qolishi tekshiriladi —
`../../etc/passwd` kabi so'rov papkadan chiqib keta olmaydi.
"""
from __future__ import annotations

import mimetypes
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, HttpResponseNotFound
from django.urls import re_path

#: Fayl nomi o'zgarmaydi (yangi rasm — yangi nom), shuning uchun uzoq kesh.
KESH = "public, max-age=31536000, immutable"


def _xavfsiz(rel: str) -> Path | None:
    """Natija `MEDIA_ROOT` ichida qolishi shart — `../` hujumidan himoya."""
    root = Path(settings.MEDIA_ROOT).resolve()
    try:
        full = (root / rel.lstrip("/")).resolve()
    except (OSError, ValueError):
        return None
    if root not in full.parents:
        return None
    return full


def media(request, rel: str = ""):
    full = _xavfsiz(rel)
    if full is None or not full.is_file():
        return HttpResponseNotFound("topilmadi")
    turi, _ = mimetypes.guess_type(full.name)
    javob = FileResponse(full.open("rb"), content_type=turi or "application/octet-stream")
    javob["Cache-Control"] = KESH
    # Brauzer faylni O'ZI aytgan tur bo'yicha talqin qilmasin: rasm
    # deb saqlangan narsa HTML bo'lib ochilib ketmasligi kerak.
    javob["X-Content-Type-Options"] = "nosniff"
    return javob


def media_urlpatterns():
    return [re_path(r"^media/(?P<rel>.*)$", media, name="media")]
