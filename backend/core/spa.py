"""
React ilovani (SPA) berish.

Nima uchun kerak: manzillar endi HTML fayl nomi emas, haqiqiy yo'l —
`/kurs/1-sinf/2-bob/3-dars`. Bola shu sahifada F5 bossa, brauzer serverdan
AYNAN shu yo'lni so'raydi. Diskda bunday fayl yo'q, shuning uchun biz
`index.html` ni qaytaramiz va marshrutni React hal qiladi.

Statik faylni Django berishi ishlab chiqish va kichik yuklama uchun yetarli.
Katta trafikda oldiga nginx/Caddy qo'yish tavsiya etiladi.
"""
from __future__ import annotations

import mimetypes
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, HttpResponse, HttpResponseNotFound, JsonResponse
from django.urls import re_path

# Brauzer eski nusxani ushlab qolmasin (Mini App'da bu ayniqsa og'riqli).
# Vite fayl nomiga xesh qo'shadi, shuning uchun assets uzoq keshlanadi.
KESH_UZOQ = "public, max-age=31536000, immutable"
KESH_YOQ = "no-cache"


def _xavfsiz(rel: str) -> Path | None:
    """`../` hujumidan himoya: natija dist papkasi ichida qolishi shart."""
    root = settings.FRONTEND_DIST.resolve()
    try:
        full = (root / rel.lstrip("/")).resolve()
    except (OSError, ValueError):
        return None
    if full != root and root not in full.parents:
        return None
    return full


def spa(request, rel: str = ""):
    # Noma'lum API yo'li SPA'ga tushib ketmasligi kerak: mijoz HTML o'rniga
    # tushunarli JSON xato olsin, aks holda "nega index.html keldi?" degan
    # chalkash xatoliklarni qidirishga to'g'ri keladi.
    if rel.startswith("api/"):
        return JsonResponse({"error": "bunday endpoint yo'q"}, status=404)

    root = settings.FRONTEND_DIST
    index = root / "index.html"

    if not index.exists():
        return HttpResponse(
            "<h1>Aql Zone</h1>"
            "<p>Frontend hali yig'ilmagan. <code>frontend/</code> papkasida ishga tushiring:</p>"
            "<pre>npm install\nnpm run build</pre>"
            "<p>Ishlab chiqishda esa <code>npm run dev</code> — u API'ni shu serverga uzatadi.</p>",
            content_type="text/html; charset=utf-8",
            status=501,
        )

    full = _xavfsiz(rel)
    if full is None:
        return HttpResponseNotFound("topilmadi")

    if full.is_file():
        turi, _ = mimetypes.guess_type(full.name)
        javob = FileResponse(full.open("rb"), content_type=turi or "application/octet-stream")
        javob["Cache-Control"] = KESH_UZOQ if "/assets/" in f"/{rel}" else KESH_YOQ
        return javob

    # Fayl yo'q — demak bu React marshruti.
    javob = FileResponse(index.open("rb"), content_type="text/html; charset=utf-8")
    javob["Cache-Control"] = KESH_YOQ
    return javob


def spa_urlpatterns():
    return [re_path(r"^(?P<rel>.*)$", spa, name="spa")]
