"""
Telegram'ga xabar yuborishning YAGONA joyi.

Ilgari bu kod ikki nusxada edi: e'lon tarqatishda va eslatmada. Ikkalasi
bir xil ishni qilardi, lekin bir xil emas — masalan "odam botni
bloklagan" holati faqat bittasida hisobga olinardi. Shu sabab bloklagan
odamga eslatma har kuni yuborilaverardi va u hech qachon yetib bormasdi.

Telegram'ning uchta o'ziga xosligi shu yerda, bitta joyda hal qilinadi:

  * **403** — odam botni bloklagan yoki suhbatni o'chirgan. Bu XATO
    emas, oddiy holat: hisob belgilanadi va boshqa urinilmaydi.
  * **429** — tezlik cheklovi. Telegram qancha kutishni o'zi aytadi.
  * **"chat not found"** — hisob o'chirilgan. Qayta urinishdan foyda yo'q.
"""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.request

from django.conf import settings
from django.utils import timezone

#: Bir soniyada nechta xabar. Telegram ~30 ga ruxsat beradi; 25 —
#: chegaraga tegib ketmaslik uchun ataylab pastroq.
TEZLIK = 25

#: Har xabardan keyingi tanaffus (sekund).
ORALIQ = 1 / TEZLIK

#: 429 javobida Telegram kutish muddatini o'zi aytadi. Aytmasa — shu.
STANDART_KUTISH = 3

#: Bitta xabarning eng katta uzunligi (Telegram cheklovi).
MAX_MATN = 4096


def _sorov(usul: str, payload: dict) -> tuple[bool, int, str]:
    """
    Telegram chaqiruvi. `(muvaffaqiyatmi, http_kodi, izoh)` qaytadi.

    HTTP kodi ATAYLAB qaytariladi: 403 va 429 butunlay boshqacha muomala
    talab qiladi, "xato bo'ldi" degan bitta bayroq ularni ajrata olmaydi.
    """
    url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/{usul}"
    so_rov = urllib.request.Request(
        url, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(so_rov, timeout=20) as r:
            return json.loads(r.read()).get("ok", False), 200, ""
    except urllib.error.HTTPError as e:
        izoh = ""
        kutish = 0
        try:
            tana = json.loads(e.read())
            izoh = str(tana.get("description", ""))[:200]
            kutish = int(tana.get("parameters", {}).get("retry_after", 0))
        except Exception:
            pass
        if e.code == 429:
            time.sleep(kutish or STANDART_KUTISH)
        return False, e.code, izoh or f"HTTP {e.code}"
    except Exception as e:                       # tarmoq uzilishi va boshqalar
        return False, 0, str(e)[:200]


def yubor(
    chat_id: str,
    matn: str,
    tugma: str = "",
    havola: str = "",
    ikkinchi_tugma: str = "",
    ikkinchi_data: str = "",
) -> tuple[str, str]:
    """
    Bitta xabar yuboradi. `(holat, izoh)` qaytadi.

    Holat: `yuborildi` | `bloklandi` | `xato`.

    `tugma` va `havola` ikkalasi ham berilsa, xabar ostida inline tugma
    chiqadi. Bittasi bo'sh bo'lsa tugma umuman qo'shilmaydi — yarim
    sozlangan tugma Telegram tomonidan rad etiladi va butun xabar
    yuborilmay qolardi.

    `ikkinchi_tugma` esa HAVOLA EMAS, javob tugmasi (`callback_data`):
    bosilganda bot ichida ish bajariladi, brauzer ochilmaydi. Hozircha
    bitta joyda kerak — "qaytib keling" zanjiridagi «Boshqa yozmang»
    (`management/commands/qaytarish.py`). U alohida QATORDA turadi:
    asosiy tugma bilan yonma-yon bo'lsa, bexosdan bosilishi oson bo'lardi
    va bu qaytarib bo'lmaydigan tanlov.
    """
    payload = {
        "chat_id": chat_id,
        "text": matn[:MAX_MATN],
        "parse_mode": "HTML",
        # Havolaning kartasi xabarni cho'zib, matnni pastga surib qo'yadi.
        "link_preview_options": {"is_disabled": True},
    }
    qatorlar = []
    if tugma and havola:
        qatorlar.append([{"text": tugma, "url": havola}])
    if ikkinchi_tugma and ikkinchi_data:
        qatorlar.append([{"text": ikkinchi_tugma, "callback_data": ikkinchi_data}])
    if qatorlar:
        payload["reply_markup"] = {"inline_keyboard": qatorlar}

    ok, kod, izoh = _sorov("sendMessage", payload)
    if ok:
        return "yuborildi", ""
    if kod == 403 or "chat not found" in izoh.lower():
        return "bloklandi", izoh
    return "xato", izoh


def bloklanganini_belgila(pupil_id: int) -> None:
    """Botni bloklagan hisobni belgilaydi — keyin unga urinilmaydi."""
    from .models import Pupil

    Pupil.objects.filter(pk=pupil_id, bot_bloklandi_at__isnull=True).update(
        bot_bloklandi_at=timezone.now()
    )


def bot_havolasi(qayerdan: str = "") -> str:
    """Botga olib boradigan manzil. `qayerdan` — o'lchash uchun belgi."""
    bot = getattr(settings, "BOT_USERNAME", "") or ""
    if not bot:
        return ""
    return f"https://t.me/{bot}?start={qayerdan}" if qayerdan else f"https://t.me/{bot}"


def ilova_havolasi() -> str:
    """
    Ilovaning o'zi — eslatma tugmasi shu yerga olib boradi.

    Botga emas: eslatmani olgan odam ALLAQACHON botda turibdi va uni
    yana botga yuborish qadamni ko'paytiradi. Sayt manzili sozlanmagan
    bo'lsa bot havolasi zaxira bo'lib qoladi.
    """
    sayt = (getattr(settings, "MINI_APP_URL", "") or getattr(settings, "SAYT_URL", "") or "").rstrip("/")
    return sayt or bot_havolasi()
