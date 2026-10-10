"""
DUEL CHAQIRUVINI TELEGRAM'DA ULASHISH — rasmli karta + "⚔️ Qabul qilish".

─────────────────── NEGA (2026-10-10) ───────────────────

30 kunda havola bilan 35 ta chaqiruv yasalgan va birortasi ham qabul
qilinmagan. Havola `t.me/share/url` bilan ketardi — do'stga shunchaki
matn va uzun manzil boradi, tugma yo'q. Odamlar uni bosmaydi.

Endi Telegram'ning `shareMessage` oynasi ishlatiladi (Bot API 8.0):
server `savePreparedInlineMessage` bilan TAYYOR xabar yasaydi — rasm
(kim chaqirdi, qaysi o'yin), izoh va ostida "⚔️ Qabul qilish" tugmasi.
Mini App shu xabarni `WebApp.shareMessage(id)` bilan ochadi, odam
do'stini tanlaydi va u chiroyli karta oladi. Eski Telegram'da mijoz
avvalgi `t.me/share/url` ga qaytadi.

Karta rasmi ochiq manzildan beriladi (`/api/v1/duel/<kod>/karta.jpg`):
Telegram uni o'zi yuklab oladi. Rasmda ball yo'q (`duel-chaqiruv-
qoidalari`): faqat kim, qaysi o'yin va shartlar.
"""
from __future__ import annotations

import io
import json
import logging
import urllib.error
import urllib.request

from django.conf import settings

from .models import Duel, Profile

log = logging.getLogger(__name__)

#: Duel o'yinlarining nomi va kartadagi belgisi (`frontend/src/lib/oyin/index.ts`).
OYIN_NOMI = {
    "tezkor": ("Tezkor hisob", "Быстрый счёт"),
    "jadval": ("Ko'paytirish jadvali", "Таблица умножения"),
    "belgi": ("Yashirin amal", "Скрытый знак"),
    "ketma": ("Ketma-ketlik", "Последовательность"),
    "taxmin": ("Chamalash", "Прикидка"),
    "tarozi": ("Tarozi", "Весы"),
}

_FON = (11, 28, 33)
_KARTA = (20, 48, 55)
_OQ = (240, 250, 251)
_XIRA = (138, 178, 184)
_KOK = (23, 179, 193)
_OLTIN = (242, 179, 61)
_YASHIL = (22, 163, 74)


def karta(duel: Duel, til: str = "uz") -> bytes:
    """Chaqiruv kartasi — 1200×630 JPEG (Telegram'da to'liq ko'rinadi)."""
    from PIL import Image, ImageDraw

    from . import duel as D
    from .kunlik_kartochka import _shrift
    from .tamga import _belgi

    S, EN, BOY = 2, 1200, 630
    t = Image.new("RGB", (EN * S, BOY * S), _FON)
    d = ImageDraw.Draw(t)
    d.rounded_rectangle([28 * S, 28 * S, (EN - 28) * S, (BOY - 28) * S], radius=40 * S, fill=_KARTA)

    # Ikki qilich o'rnida — ikki doira va "VS": kim kimga.
    ru = til == "ru"
    ism = D.korinadigan_ism(duel.chaqirgan)
    sarlavha = f"{ism} " + ("вызывает тебя!" if ru else "seni chaqirdi!")
    oyin = OYIN_NOMI.get(duel.oyin, ("", ""))[1 if ru else 0]
    shart = (f"{duel.savollar_soni} вопросов · {duel.vaqt} сек" if ru
             else f"{duel.savollar_soni} savol · {duel.vaqt} soniya")

    # Logo — chap tepada.
    belgi = _belgi(96 * S)
    t.paste(belgi, (70 * S, 66 * S), belgi)
    d.text((182 * S, 82 * S), "Aql Zone", font=_shrift(44 * S), fill=_OQ)
    d.text((182 * S, 134 * S), "BELLASHUV" if not ru else "ДУЭЛЬ", font=_shrift(26 * S), fill=_KOK)

    # O'ng tepada — kesishgan ikki qilich: tig', ko'ndalang himoya, dasta.
    cx, cy = (EN - 150) * S, 124 * S
    for k in (-1, 1):
        uch = (cx + 58 * S * k, cy - 58 * S)                  # tig' uchi (yuqorida)
        dasta = (cx - 58 * S * k, cy + 58 * S)                # dasta oxiri (pastda)
        himoya = (cx - 30 * S * k, cy + 30 * S)               # ko'ndalang himoya markazi
        d.line([himoya, uch], fill=(226, 236, 240), width=14 * S)
        d.line([himoya, dasta], fill=(150, 98, 40), width=12 * S)
        hx, hy = 15 * S, 15 * S * k                           # himoyaga perpendikulyar yo'nalish
        d.line([(himoya[0] - hx, himoya[1] - hy), (himoya[0] + hx, himoya[1] + hy)], fill=_OLTIN, width=11 * S)
        d.ellipse([dasta[0] - 9 * S, dasta[1] - 9 * S, dasta[0] + 9 * S, dasta[1] + 9 * S], fill=_OLTIN)

    # Asosiy gap — sig'guncha kichrayadi.
    for px in (76, 68, 60, 52, 46):
        sh = _shrift(px * S)
        if d.textlength(sarlavha, font=sh) <= (EN - 140) * S:
            break
    d.text((70 * S, 250 * S), sarlavha, font=sh, fill=_OQ)
    d.text((70 * S, 350 * S), oyin, font=_shrift(46 * S), fill=_KOK)
    d.text((70 * S, 412 * S), shart, font=_shrift(34 * S, False), fill=_XIRA)

    # Pastda — "tugma" ko'rinishidagi chaqiriq.
    tugma = "Qabul qilish  →" if not ru else "Принять  →"
    sh = _shrift(38 * S)
    en = d.textlength(tugma, font=sh)
    x0, y0 = 70 * S, 488 * S
    d.rounded_rectangle([x0, y0, x0 + en + 80 * S, y0 + 84 * S], radius=42 * S, fill=_YASHIL)
    d.text((x0 + 40 * S, y0 + 18 * S), tugma, font=sh, fill=(255, 255, 255))
    izoh = ("Bir xil savollar · har kim o'z darajasida" if not ru
            else "Одни вопросы · каждому свой уровень")
    d.text((x0 + en + 120 * S, y0 + 26 * S), izoh, font=_shrift(26 * S, False), fill=_XIRA)

    t = t.resize((EN, BOY), Image.LANCZOS)
    buf = io.BytesIO()
    t.save(buf, format="JPEG", quality=88)
    return buf.getvalue()


def karta_url(duel: Duel) -> str:
    sayt = (getattr(settings, "SAYT_URL", "") or "").rstrip("/")
    return f"{sayt}/api/v1/duel/{duel.kod}/karta.jpg" if sayt.startswith("https://") else ""


def tayyorla(duel: Duel, profil: Profile) -> str:
    """
    `savePreparedInlineMessage` — Mini App'dan ulashiladigan tayyor xabar.
    Qaytadi: xabar id'si, yoki bo'sh satr (mijoz oddiy havolaga qaytadi).
    """
    from . import duel as D
    from .matn import M, tilni_tanla

    token = getattr(settings, "BOT_TOKEN", "")
    tg = D._tg_id(profil)
    rasm = karta_url(duel)
    if not token or not tg or not rasm or getattr(settings, "TESTDA", False):
        return ""
    til = tilni_tanla(profil.pupil.til)
    natija = {
        "type": "photo",
        "id": f"duel-{duel.kod}",
        "photo_url": rasm,
        "thumbnail_url": rasm,
        "photo_width": 1200,
        "photo_height": 630,
        "caption": M("duelUlashIzoh", til, ism=D.korinadigan_ism(duel.chaqirgan)),
        "parse_mode": "HTML",
        "reply_markup": {"inline_keyboard": [[{"text": M("tQabulQilish", til), "url": D.havola(duel.kod)}]]},
    }
    tana = {"user_id": int(tg), "result": natija, "allow_user_chats": True,
            "allow_group_chats": True, "allow_channel_chats": False, "allow_bot_chats": False}
    so = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/savePreparedInlineMessage",
        data=json.dumps(tana).encode(), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(so, timeout=15) as r:
            j = json.load(r)
        return str((j.get("result") or {}).get("id") or "")
    except (urllib.error.URLError, ValueError) as e:              # noqa: PERF203
        log.warning("duel ulash: tayyor xabar yasalmadi: %s", e)
        return ""
