"""
Telegram kanaliga a'zolikni tekshirish.

Ilova ochilgandan bir necha soniya keyin "kanalga qo'shiling" oynasi
chiqadi. Oyna A'ZO BO'LMAGANGA ko'rinishi kerak — a'zoga ko'rsatilsa u
reklama emas, bezorilik bo'lib qoladi.

A'zolikni faqat Telegram biladi, shuning uchun `getChatMember` so'raladi.
Buning uchun **bot kanalda administrator bo'lishi shart** — oddiy a'zo
bo'lsa Telegram ro'yxatni bermaydi. Sozlanmagan bo'lsa butun imkoniyat
o'chiq turadi (`KANAL` bo'sh).

Xato bo'lganda javob doim bir xil: KO'RSATMA. Ya'ni bot admin qilinmagan
yoki Telegram javob bermagan holatda oyna umuman chiqmaydi. Teskarisi
(shubha bo'lsa ko'rsatish) xavfliroq: bitta noto'g'ri sozlama butun
foydalanuvchilarga, shu jumladan allaqachon a'zo bo'lganlarga, har
ochilishda oyna ko'rsatib chiqardi.
"""
from __future__ import annotations

import json
import logging
import urllib.error
import urllib.parse
import urllib.request
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

log = logging.getLogger(__name__)

#: Telegram javobi qancha kutiladi (sekund).
#:
#: Qisqa: bu so'rov foydalanuvchi ilovani ochganda ketadi va u javobni
#: kutib turadi. Telegram sekinlashsa, oyna chiqmagani ilova sekin
#: ochilganidan yaxshiroq.
KUTISH = 4

#: `getChatMember` shu holatlarni "a'zo" deb hisoblaydi.
#:
#: `restricted` ro'yxatda YO'Q va bu ataylab: u ovozi o'chirilgan odam
#: bo'lishi ham, kanaldan chiqarilgan odam bo'lishi ham mumkin —
#: farqini `is_member` aytadi, shuning uchun u alohida tekshiriladi.
AZO = {"creator", "administrator", "member"}


def _hech_kirmagan(tavsif: str) -> bool:
    """Telegram xatosi "bu odam kanalda hech qachon bo'lmagan" degani."""
    t = tavsif.upper()
    return "PARTICIPANT_ID_INVALID" in t or "USER NOT FOUND" in t


def kanal_nomi() -> str:
    """`@nom` ko'rinishida. Sozlanmagan bo'lsa bo'sh satr."""
    nom = (getattr(settings, "KANAL", "") or "").strip()
    if not nom:
        return ""
    return nom if nom.startswith("@") else f"@{nom}"


def havola() -> str:
    nom = kanal_nomi()
    return f"https://t.me/{nom[1:]}" if nom else ""


def _sorov(usul: str, **payload) -> dict:
    """Telegram Bot API chaqiruvi. Xato bo'lsa bo'sh natija."""
    token = getattr(settings, "BOT_TOKEN", "")
    if not token:
        return {}
    url = f"https://api.telegram.org/bot{token}/{usul}"
    so_rov = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(so_rov, timeout=KUTISH) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            tavsif = str(json.loads(e.read()).get("description") or "")
        except Exception:                        # noqa: BLE001
            tavsif = ""
        if _hech_kirmagan(tavsif):
            # Kanalga umuman kirmagan odam — bu xato emas, javob.
            return {"ok": False, "error_code": e.code, "description": tavsif}
        # Eng ko'p uchraydigan sabab — bot kanalda ADMIN emas. Buni
        # ko'rinadigan qilib yozamiz: aks holda imkoniyat jimgina
        # ishlamay turadi va nega ekani ma'lum bo'lmaydi.
        log.warning(
            "kanal: %s → HTTP %s %s. Bot @%s kanalida administrator ekanini tekshiring.",
            usul, e.code, tavsif, kanal_nomi().lstrip("@"),
        )
    except Exception as e:                       # tarmoq uzilishi va h.k.
        log.warning("kanal: %s → %s", usul, e)
    return {}


def azo_mi(tg_id: str) -> bool | None:
    """
    Shu Telegram id kanalga a'zomi.

    `None` — BILIB BO'LMADI (kanal sozlanmagan, bot admin emas, Telegram
    javob bermadi). Chaqiruvchi buni "a'zo emas" deb qabul QILMASLIGI
    kerak: modul izohidagi sabab bo'yicha shubhada oyna ko'rsatilmaydi.
    """
    nom = kanal_nomi()
    if not nom or not tg_id:
        return None

    javob = _sorov("getChatMember", chat_id=nom, user_id=int(tg_id))
    if not javob.get("ok"):
        # Kanalga hech qachon kirmagan odam uchun Telegram "a'zo emas"
        # deb emas, 400 PARTICIPANT_ID_INVALID bilan javob beradi. Buni
        # "bilib bo'lmadi" deb o'tkazsak, aynan qo'shilmaganlar tekshiruvdan
        # sirg'alib o'tib ketardi (serverda ular yarmidan ko'p chiqdi).
        if _hech_kirmagan(str(javob.get("description") or "")):
            return False
        return None

    natija = javob.get("result") or {}
    holat = natija.get("status", "")
    if holat in AZO:
        return True
    if holat == "restricted":
        # Ovozi o'chirilgan, lekin hali kanalda — a'zo hisoblanadi.
        return bool(natija.get("is_member"))
    return False                                  # left, kicked


def majburiymi() -> bool:
    return bool(getattr(settings, "KANAL_MAJBURIY", False)) and bool(kanal_nomi())


#: Majburiy rejimda eslab qolingan a'zolik shuncha vaqtdan keyin qayta
#: tekshiriladi: odam qo'shilib, darrov chiqib ketishi mumkin.
QAYTA_TEKSHIRISH = timedelta(hours=24)


def korsatilsinmi(pupil) -> bool:
    """
    Shu hisobga "kanalga qo'shiling" oynasi ko'rsatilsinmi.

    Yon ta'siri bor va u ataylab: a'zoligi tasdiqlansa, sana hisobga
    yoziladi va keyingi safar Telegram umuman so'ralmaydi. Majburiy
    rejimda esa sutkada bir marta qayta so'raladi.
    """
    if pupil.kanal_azo_at is not None:
        if not majburiymi() or timezone.now() - pupil.kanal_azo_at < QAYTA_TEKSHIRISH:
            return False
    if not kanal_nomi():
        return False

    tg_id = pupil.kirish("telegram")
    if not tg_id:
        # Telegram'i yo'q odamning a'zoligini tekshirib bo'lmaydi, ya'ni
        # oyna undan hech qachon ketmasdi.
        return False

    natija = azo_mi(tg_id)
    if natija is True:
        pupil.kanal_azo_at = timezone.now()
        pupil.save(update_fields=["kanal_azo_at"])
        return False
    if natija is None:
        return False                              # shubhada — bezovta qilmaymiz
    if pupil.kanal_azo_at is not None:
        # Kanaldan chiqib ketgan — belgi olib tashlanadi.
        pupil.kanal_azo_at = None
        pupil.save(update_fields=["kanal_azo_at"])
    return True


def bot_otkazadimi(tg_id: str) -> bool:
    """
    Bot shu odamga ilovani ochib bersinmi (majburiy rejim).

    A'zolik keshda 12 soat saqlanadi — bot har xabarda Telegram'ga
    so'rov yubormasin. "A'zo emas" javobi keshlanmaydi: odam qo'shilib,
    darrov "tekshirish" ni bosadi.
    """
    if not majburiymi() or not tg_id:
        return True
    from django.core.cache import cache
    kalit = f"kanal_azo:{tg_id}"
    if cache.get(kalit):
        return True
    natija = azo_mi(tg_id)
    if natija is None:
        return True                               # bilib bo'lmadi — o'tkazamiz
    if natija:
        cache.set(kalit, 1, 12 * 3600)
    return natija
