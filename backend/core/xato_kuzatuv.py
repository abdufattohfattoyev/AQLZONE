"""
Xatolarni kuzatish — administratorning Telegram'iga.

Sentry kabi tashqi xizmat o'rniga: bot va `ADMIN_TG` allaqachon bor,
ya'ni yangi hisob, kalit yoki pul kerak emas. Uchta manba bitta
yo'ldan ketadi:

  * `django.request` — serverdagi 500 xatolar;
  * `celery.app.trace` — yiqilgan fon vazifalari;
  * `core.frontend` — bolaning brauzerida yiqilgan JavaScript
    (`POST /api/v1/xato`, `frontend/src/lib/xatoKuzatuv.ts`).

─────────────── NEGA SHOVQIN BO'LMAYDI ───────────────

Bitta buzuq sahifani yuzta bola ochsa, yuzta xabar kelardi va admin
bir kunda botni ovozsiz qilib qo'yardi — ya'ni keyingi haqiqiy xato
ham ko'rinmay qolardi. Shuning uchun ikki to'siq:

  * bir xil xato (joy + matn) `TAKROR_SEKUND` ichida bir marta;
  * hammasi bo'lib soatiga `SOATIGA` tadan oshmaydi.

─────────────── NEGA CELERY ORQALI EMAS ───────────────

Xabar oddiy fon oqimida, `xabar._sorov` bilan ketadi. Celery orqali
yuborilganda Telegram'ning o'zi yiqilsa, vazifa xatosi yana shu yerga
kelib, yana vazifa yaratardi — cheksiz halqa. Qayta urinish ham yo'q:
xato xabari yo'qolsa, keyingi takrorida baribir keladi.
"""
from __future__ import annotations

import hashlib
import html
import logging
import threading
import time

from django.conf import settings
from django.core.cache import cache

#: Bir xil xato qayta necha sekunddan keyin yuboriladi.
TAKROR_SEKUND = 30 * 60

#: Soatiga eng ko'pi nechta xabar.
SOATIGA = 20

#: Xabardagi izning (traceback) eng ko'p uzunligi. Telegram 4096 dan
#: uzunini rad etadi; oxirgi qatorlar eng muhimi — xato o'sha yerda.
IZ_UZUNLIGI = 2500


def _yoqilganmi() -> bool:
    return bool(
        getattr(settings, "BOT_TOKEN", "")
        and getattr(settings, "ADMIN_TG", [])
        and not getattr(settings, "TESTDA", False)
    )


def ruxsat(kalit: str) -> bool:
    """Shu xatoni hozir yuborish mumkinmi (takror va soatlik chegara)."""
    imzo = hashlib.sha1(kalit.encode("utf-8", "replace")).hexdigest()[:16]
    if not cache.add(f"xato:takror:{imzo}", 1, TAKROR_SEKUND):
        return False
    soat = f"xato:soat:{int(time.time() // 3600)}"
    cache.add(soat, 0, 3600)
    try:
        son = cache.incr(soat)
    except ValueError:                           # kalit o'sha lahzada eskirdi
        return True
    return son <= SOATIGA


def _yubor(matn: str) -> None:
    from . import xabar as X

    for tg_id in getattr(settings, "ADMIN_TG", []):
        X._sorov("sendMessage", {
            "chat_id": str(tg_id), "text": matn, "parse_mode": "HTML",
            "disable_web_page_preview": True,
        })


def adminga(sarlavha: str, tafsilot: str, kalit: str) -> None:
    """Fon oqimida yuboradi — chaqiruvchi kutmaydi va yiqilmaydi."""
    if not _yoqilganmi() or not ruxsat(kalit):
        return
    iz = tafsilot[-IZ_UZUNLIGI:]
    matn = f"🚨 <b>{html.escape(sarlavha[:300])}</b>\n\n<pre>{html.escape(iz)}</pre>"
    threading.Thread(target=_yubor, args=(matn,), daemon=True, name="xato-kuzatuv").start()


class AdmingaXato(logging.Handler):
    """`settings.LOGGING` ga ulanadigan jurnal ushlagichi."""

    def emit(self, record: logging.LogRecord) -> None:
        try:
            # Telegram'ning o'zi haqidagi xato qaytib shu yerga kelmasin.
            if "api.telegram.org" in record.getMessage():
                return
            sarlavha = record.getMessage().splitlines()[0] if record.getMessage() else record.name
            tafsilot = self.format(record)
            # Kalit — joy va xato turi, sonlar va id'larsiz emas: bir
            # xil xato turli masala raqamida takrorlansa ham bitta bo'lsin.
            if record.exc_info and record.exc_info[1] is not None:
                e = record.exc_info[1]
                kalit = f"{record.name}:{type(e).__name__}:{record.pathname}:{record.lineno}"
                sarlavha = f"{sarlavha} — {type(e).__name__}: {e}"
            else:
                kalit = f"{record.name}:{sarlavha}"
            adminga(sarlavha, tafsilot, kalit)
        except Exception:                        # noqa: BLE001 — jurnal hech qachon yiqitmasin
            self.handleError(record)
