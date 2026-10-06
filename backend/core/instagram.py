"""
Instagram'ga video joylash — kunlik reklama roligi (`rolik_post`).

Bitta rolik IKKI joyga chiqadi: Reels (lentada qoladi) va Stories
(bir kun yashaydi). Ikkisi bir xil videodan, bitta ochiq havoladan.

Instagram API (Instagram orqali kirish, `graph.instagram.com`) ishlatiladi:
Facebook sahifa kerak emas, faqat Business yoki Creator akkaunt va
Meta ilovasidan olingan uzoq muddatli kalit (60 kun).

─────────────────── QANDAY JOYLANADI ───────────────────

Uch qadam, Instagram talabi shunday:

  1. Rolik vaqtincha ochiq havolaga qo'yiladi (`core/ommaviy.py`).
  2. Konteyner ochiladi (`media_type=REELS`, `video_url=<havola>`) —
     Instagram videoni o'sha havoladan O'ZI yuklab oladi.
  3. Qayta ishlashini kutamiz (bir necha daqiqa), tayyor bo'lgach
     `media_publish` bilan joylanadi va havola yopiladi.

Faylni to'g'ridan-to'g'ri yuklash (`upload_type=resumable`) bu yerda
ishlamaydi: u faqat Facebook Login o'rnatgan ilovalarga ruxsat
etilgan. Instagram Login da yagona yo'l — ochiq havola.

─────────────────── KALIT ───────────────────

Kalit 60 kunda eskiradi. Uni har gal yangilab, `.env` ni qo'lda
o'zgartirib yurmaslik uchun yangilangani `<ROLIK_PAPKA>/instagram.kalit`
fayliga yoziladi va keyingi safar shu fayl `.env` dagidan ustun turadi.
Yangilash haftada bir marta, joylash paytida o'zi bo'ladi.
"""
from __future__ import annotations

import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from django.conf import settings

from core import ommaviy

API = "https://graph.instagram.com/v23.0"

#: Instagram videoni qayta ishlashini shuncha kutamiz (sekund).
KUTISH = 600
ORALIQ = 10

#: Kalit shuncha kundan eski bo'lsa yangilanadi (u 60 kun yashaydi).
YANGILASH_KUN = 7

#: Instagram izohining eng katta uzunligi.
MAX_IZOH = 2200


def _kalit_fayli() -> Path:
    return Path(settings.ROLIK_PAPKA) / "instagram.kalit"


def kalit() -> str:
    f = _kalit_fayli()
    try:
        if f.exists() and f.read_text(encoding="utf-8").strip():
            return f.read_text(encoding="utf-8").strip()
    except OSError:
        pass
    return getattr(settings, "INSTAGRAM_TOKEN", "") or ""


def sozlanganmi() -> bool:
    return bool(kalit())


def _sorov(url: str, maydonlar: dict | None = None, *, usul: str = "GET",
           tana: bytes | None = None, sarlavhalar: dict | None = None, vaqt: int = 60) -> dict:
    if maydonlar and usul == "GET":
        url += "?" + urllib.parse.urlencode(maydonlar)
    elif maydonlar:
        tana = urllib.parse.urlencode(maydonlar).encode()
    req = urllib.request.Request(url, data=tana, method=usul, headers=sarlavhalar or {})
    try:
        with urllib.request.urlopen(req, timeout=vaqt) as r:
            return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        try:
            xato = json.loads(e.read() or b"{}").get("error", {})
            raise RuntimeError(xato.get("message") or str(e)) from None
        except ValueError:
            raise RuntimeError(str(e)) from None


def kalitni_yangila(majburiy: bool = False) -> bool:
    """Kalit eski bo'lsa yangisini oladi va faylga yozadi."""
    f = _kalit_fayli()
    if not majburiy and f.exists() and time.time() - f.stat().st_mtime < YANGILASH_KUN * 86400:
        return False
    k = kalit()
    if not k:
        return False
    j = _sorov("https://graph.instagram.com/refresh_access_token",
               {"grant_type": "ig_refresh_token", "access_token": k})
    if not j.get("access_token"):
        return False
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(j["access_token"], encoding="utf-8")
    return True


def akkaunt() -> dict:
    """`{"user_id": ..., "username": ...}` — kalit ishlayotganini tekshirish uchun."""
    return _sorov(f"{API}/me", {"fields": "user_id,username", "access_token": kalit()})


# ------------------------------------------------------------------ tahlil
#
# Instagram ham Telegram kabi TARIX bermaydi: "bugun nechta obunachi"
# degan savolga javob bor, "o'tgan hafta qancha edi" degani yo'q.
# Shuning uchun kunlik surat `KunlikOsish` ga yozib boriladi
# (`core/osish.py`) — aks holda "rolik odam olib keldimi" degan savol
# javobsiz qolardi.

#: Kunlik hisobotga tushadigan akkaunt o'lchovlari.
KUNLIK_OLCHOV = ("views", "reach", "accounts_engaged", "total_interactions")

#: Reels posti uchun. Stories boshqa o'lchovlarda yashaydi.
POST_OLCHOV = "views,reach,likes,comments,saved,shares"
STORY_OLCHOV = "views,reach,replies"


def hisob() -> dict:
    """`{"username", "followers_count", "media_count"}` — hozirgi holat."""
    return _sorov(f"{API}/me", {
        "fields": "username,followers_count,media_count", "access_token": kalit()})


def _qiymatlar(j: dict) -> dict[str, int]:
    """
    Insights javobini `{"views": 84, ...}` ga keltiradi.

    Instagram ikki xil shaklda qaytaradi: akkaunt o'lchovlari
    `total_value` da, post o'lchovlari `values[0]` da. Qiymati
    yo'qlari (masalan hali sanalmagan) umuman tushmaydi — nol bilan
    to'ldirilmaydi, chunki "0 ta ko'rish" va "hali ma'lum emas"
    bir xil narsa emas.
    """
    natija = {}
    for o in j.get("data", []):
        if "total_value" in o and "value" in o["total_value"]:
            natija[o["name"]] = o["total_value"]["value"]
        elif o.get("values"):
            natija[o["name"]] = o["values"][0].get("value")
    return natija


def kunlik_olchov() -> dict[str, int]:
    """Bugungi akkaunt raqamlari: ko'rish, qamrov, ta'sirlashgan hisoblar."""
    return _qiymatlar(_sorov(f"{API}/{akkaunt()['user_id']}/insights", {
        "metric": ",".join(KUNLIK_OLCHOV), "period": "day",
        "metric_type": "total_value", "access_token": kalit()}))


def post_olchov(media_id: str, story: bool = False) -> dict[str, int]:
    """Bitta postning raqamlari. Post o'chirilgan bo'lsa — bo'sh."""
    try:
        return _qiymatlar(_sorov(f"{API}/{media_id}/insights", {
            "metric": STORY_OLCHOV if story else POST_OLCHOV, "access_token": kalit()}))
    except (RuntimeError, OSError, ValueError):
        return {}


def izoh(matn: str) -> str:
    """
    Telegram HTML matnini Instagram izohiga o'giradi: teglar olib
    tashlanadi, `<a href="X">Y</a>` — "Y: X" bo'ladi (Instagram'da
    havola bosilmaydi, lekin ko'rinib tursin).
    """
    def havola(m):
        url, yozuv = m.group(1), re.sub(r"<[^>]+>", "", m.group(2)).strip()
        return f"{yozuv}: {url}" if yozuv and yozuv != url else url
    t = re.sub(r'<a\s+href="([^"]+)"[^>]*>(.*?)</a>', havola, matn, flags=re.S | re.I)
    t = re.sub(r"<br\s*/?>", "\n", t, flags=re.I)
    t = re.sub(r"<[^>]+>", "", t)
    return html.unescape(t).strip()[:MAX_IZOH]


def _bitta(ig: str, k: str, maydonlar: dict) -> tuple[str, str, str]:
    """
    Bitta konteyner: ochadi, tayyor bo'lishini kutadi, joylaydi.
    `(holat, izoh, media_id)` — holat "joylandi" yoki "xato".
    """
    try:
        kid = _sorov(f"{API}/{ig}/media", {**maydonlar, "access_token": k}, usul="POST")["id"]
        for _ in range(KUTISH // ORALIQ):
            time.sleep(ORALIQ)
            h = _sorov(f"{API}/{kid}", {"fields": "status_code,status", "access_token": k})
            if h.get("status_code") == "FINISHED":
                break
            if h.get("status_code") in ("ERROR", "EXPIRED"):
                return "xato", h.get("status") or h["status_code"], ""
        else:
            return "xato", f"Instagram videoni {KUTISH // 60} daqiqada tayyorlamadi", ""

        j = _sorov(f"{API}/{ig}/media_publish", {"creation_id": kid, "access_token": k}, usul="POST")
        return "joylandi", "", j.get("id", "")
    except (RuntimeError, OSError, KeyError, ValueError) as e:
        return "xato", str(e), ""


def joyla(video: Path, matn: str) -> dict[str, tuple[str, str, str]]:
    """
    Rolikni Reels'ga VA Stories'ga joylaydi:
    `{"reels": (holat, izoh, id), "stories": (...)}`.

    Ikkisi BIR havoladan oziqlanadi — fayl bir marta ochiladi va
    ikkisi tugagach yopiladi.

    Ikkisi MUSTAQIL: biri chiqmasa ikkinchisi baribir urinadi va
    har birining holati alohida qaytadi. Reels lentada qoladi,
    Stories bir kun yashaydi — ular bir-birining o'rnini bosmaydi,
    shuning uchun bittasining xatosi ikkinchisini to'xtatmasligi
    kerak.

    Stories izoh (`caption`) ni qabul qilmaydi — Instagram unga
    matn qo'shishga ruxsat bermaydi. Va u 60 SONIYAgacha videoni
    oladi: undan uzun rolik faqat Reels'ga chiqadi, Stories esa
    Instagram'ning o'z xatosi bilan qaytadi.
    """
    if not settings.SAYT_URL.startswith("https://"):
        izoh_ = "SAYT_URL yo'q yoki https emas — Instagram videoni olmaydi"
        return {"reels": ("xato", izoh_, ""), "stories": ("xato", izoh_, "")}
    try:
        kalitni_yangila()
    except Exception:                            # noqa: BLE001 — eski kalit hali ishlaydi
        pass
    k = kalit()

    havola, vaqtincha = ommaviy.ochib_ber(video)
    try:
        try:
            ig = akkaunt()["user_id"]
        except (RuntimeError, OSError, KeyError, ValueError) as e:
            return {"reels": ("xato", str(e), ""), "stories": ("xato", str(e), "")}
        return {
            "reels": _bitta(ig, k, {"media_type": "REELS", "video_url": havola,
                                    "caption": matn, "share_to_feed": "true"}),
            "stories": _bitta(ig, k, {"media_type": "STORIES", "video_url": havola}),
        }
    finally:
        # Havola o'z ishini qildi — ochiq qolib ketmasin.
        ommaviy.yop(vaqtincha)
