"""
Vaqtinchalik ochiq havola — Instagram video olishi uchun (`core/instagram.py`).

Instagram Login API faylni qabul qilmaydi: u videoni O'ZI ochiq
havoladan yuklab oladi (`video_url`). Shuning uchun joylashdan oldin
rolik shu yerga qo'yiladi, Instagram uni oladi va havola DARHOL
yopiladi — kanalga chiqqan rolik saytda ochiq qolib ketmasin.

Nomi tasodifiy: havola ochiq turgan bir-ikki daqiqada uni tashqi
odam topa olmasin. Papka `ROLIK_PAPKA` ichida — volume'da, ya'ni
veb konteyneri ham, Celery ishchisi ham bir xil faylni ko'radi.

────────────────── RANGE ──────────────────

Meta videoni bo'lak-bo'lak so'raydi (`Range: bytes=...`). Django'ning
`FileResponse` i buni bilmaydi va butun faylni 200 bilan qaytaradi —
ba'zi yuklovchilar esa 206 kelmasa videoni "buzilgan" deb hisoblaydi.
Shuning uchun bo'laklash shu yerda qo'lda qilinadi.
"""
from __future__ import annotations

import re
import secrets
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, HttpResponse, HttpResponseNotFound
from django.urls import re_path

#: Bir o'qishda shuncha bayt beriladi.
BOLAK = 512 * 1024

#: Nom faqat shunday bo'lishi mumkin — manzildan papkadan chiqib ketmasin.
NOM = re.compile(r"^[A-Za-z0-9_-]{8,64}\.mp4$")


def papka() -> Path:
    return Path(settings.ROLIK_PAPKA) / "ommaviy"


def ochib_ber(video: Path) -> tuple[str, Path]:
    """
    Videoni vaqtincha ochiq qiladi. `(havola, fayl)` qaytaradi —
    ikkinchisi `yop()` uchun.
    """
    p = papka()
    p.mkdir(parents=True, exist_ok=True)
    fayl = p / f"{secrets.token_urlsafe(18).replace('-', '_')}.mp4"
    fayl.write_bytes(video.read_bytes())
    return f"{settings.SAYT_URL}/rolik/{fayl.name}", fayl


def yop(fayl: Path) -> None:
    fayl.unlink(missing_ok=True)


def _oraliq(sarlavha: str, hajm: int) -> tuple[int, int] | None:
    """`bytes=N-M` ni (boshi, oxiri) ga o'giradi. Noto'g'risi — None."""
    m = re.match(r"bytes=(\d*)-(\d*)$", (sarlavha or "").strip())
    if not m:
        return None
    boshi, oxiri = m.group(1), m.group(2)
    if boshi:
        b = int(boshi)
        o = min(int(oxiri), hajm - 1) if oxiri else hajm - 1
    elif oxiri:                                  # `bytes=-500` — oxirgi 500 bayt
        b, o = max(hajm - int(oxiri), 0), hajm - 1
    else:
        return None
    return (b, o) if 0 <= b <= o < hajm else None


def _oqim(fayl: Path, boshi: int, uzunlik: int):
    with fayl.open("rb") as f:
        f.seek(boshi)
        qoldi = uzunlik
        while qoldi > 0:
            bolak = f.read(min(BOLAK, qoldi))
            if not bolak:
                return
            qoldi -= len(bolak)
            yield bolak


def rolik(request, nom: str = ""):
    if not NOM.match(nom):
        return HttpResponseNotFound("topilmadi")
    fayl = papka() / nom
    if not fayl.is_file():
        return HttpResponseNotFound("topilmadi")

    hajm = fayl.stat().st_size
    oraliq = _oraliq(request.headers.get("Range", ""), hajm)
    if oraliq:
        boshi, oxiri = oraliq
        javob = HttpResponse(_oqim(fayl, boshi, oxiri - boshi + 1), status=206,
                             content_type="video/mp4")
        javob["Content-Range"] = f"bytes {boshi}-{oxiri}/{hajm}"
        javob["Content-Length"] = str(oxiri - boshi + 1)
    else:
        javob = FileResponse(fayl.open("rb"), content_type="video/mp4")

    javob["Accept-Ranges"] = "bytes"
    # Havola bir-ikki daqiqa yashaydi — keshlanmasin.
    javob["Cache-Control"] = "no-store"
    javob["X-Content-Type-Options"] = "nosniff"
    return javob


def rolik_urlpatterns():
    return [re_path(r"^rolik/(?P<nom>[^/]+)$", rolik, name="rolik")]
