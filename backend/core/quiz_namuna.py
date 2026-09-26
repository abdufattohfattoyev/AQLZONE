"""
Kanal uchun quiz NAMUNALARI — avval adminga, u tasdiqlasa kanalga.

    python manage.py quiz_namuna          # hamma namunani adminlarga yuboradi

Rasmsiz, faqat matn: savol so'rovnomaning o'zida turadi va odam uni
bir bosishda belgilaydi. Admin har bir namunani o'z chatida ko'radi
(o'zi ham belgilab, izohni tekshira oladi), ostida ikki tugma:
"✅ Kanalga" va "❌ Kerak emas".

Namuna keshda turadi (`KESH_MUDDAT`): bazaga yozish shart emas — admin
bir-ikki kun ichida qaror qiladi, eskisi esa baribir kerak emas.
Tasdiqlash bir martalik: kalit o'chiriladi, ikkinchi bosish kanalga
ikkinchi post chiqarmaydi.
"""
from __future__ import annotations

import uuid

from django.conf import settings
from django.core.cache import cache

from . import xabar as X

KESH_MUDDAT = 7 * 24 * 3600

#: (savol, variantlar, to'g'ri raqami, izoh). Hammasi kattalar uchun,
#: tuzoqli: birinchi xayolga kelgan javob variantlar orasida turadi.
#: Cheklovlar: savol 300, variant 100, izoh 200 belgigacha.
NAMUNALAR: list[tuple[str, list[str], int, str]] = [
    ("🍉 Tarvuzning 99% i suv, og'irligi 100 kg. Quyoshda turib, suvi 98% ga tushdi. "
     "Endi tarvuz necha kg?",
     ["99 kg", "98 kg", "90 kg", "50 kg"], 3,
     "Quruq qismi o'zgarmaydi: 1 kg. Avval u 1% edi, endi 2%. 1 kg = 2% → jami 50 kg. "
     "Suvning 1% i emas, yarmi bug'lanib ketdi!"),
    ("🐌 Salyangoz 10 m chuqurlikdagi quduqdan chiqmoqda. Kunduzi 3 m ko'tariladi, "
     "kechasi 2 m sirpanib tushadi. Nechanchi kuni quduqdan chiqadi?",
     ["10-kuni", "8-kuni", "9-kuni", "7-kuni"], 1,
     "7 kunda 7 m ga yetadi (har sutkada +1 m). 8-kuni kunduzi yana 3 m — 10 m, "
     "tepaga chiqib bo'ldi, endi sirpanmaydi."),
    ("♟ Shaxmat taxtasida jami nechta kvadrat bor? "
     "(1×1, 2×2, … 8×8 — hamma o'lchamdagisi)",
     ["64", "65", "204", "128"], 2,
     "k×k kvadratdan (9 − k)² ta bor: 64 + 49 + 36 + 25 + 16 + 9 + 4 + 1 = 204."),
    ("🕒 Soat 3:15. Soat va minut millari orasidagi burchak necha gradus?",
     ["0°", "7,5°", "15°", "30°"], 1,
     "Minut mili 90° da. Soat mili 15 daqiqada chorak soat siljigan: 90 + 7,5 = 97,5°. "
     "Farq 7,5°. 0° — tuzoq."),
    ("📚 Kitob va qalam birga 11 000 so'm. Kitob qalamdan 10 000 so'm qimmat. "
     "Qalam necha so'm?",
     ["1 000 so'm", "500 so'm", "1 500 so'm", "100 so'm"], 1,
     "Qalam x bo'lsa, kitob x + 10 000. 2x + 10 000 = 11 000 → x = 500. "
     "1 000 bo'lsa kitob 11 000, jami 12 000 bo'lardi."),
]


def _kalit(nid: str) -> str:
    return f"quiz_namuna:{nid}"


def _kanal() -> str:
    k = (getattr(settings, "KANAL", "") or "").strip()
    return k if k.startswith(("@", "-")) or not k else f"@{k}"


def adminlarga_yubor(namunalar=None) -> int:
    """Har bir namuna har bir adminga. Nechta yuborilganini qaytaradi."""
    yuborildi = 0
    for savol, variantlar, togri, izoh in namunalar or NAMUNALAR:
        nid = uuid.uuid4().hex[:12]
        cache.set(_kalit(nid), {"savol": savol, "variantlar": variantlar,
                                "togri": togri, "izoh": izoh}, KESH_MUDDAT)
        klaviatura = [[
            X.tugma_yasa("✅ Kanalga", X.YASHIL, callback_data=f"quiz_ok:{nid}"),
            X.tugma_yasa("❌ Kerak emas", X.QIZIL, callback_data=f"quiz_yoq:{nid}"),
        ]]
        for admin in settings.ADMIN_TG:
            holat, _, _ = X.quiz_yubor(admin, savol, variantlar, togri, izoh,
                                       anonim=False, klaviatura=klaviatura)
            yuborildi += holat == "yuborildi"
    return yuborildi


def qaror(data: str, tg_id: str) -> str:
    """
    Admin tugmasi. Qaytadi: `yuborildi` | `rad` | `eskirgan` | `ruxsat_yoq` | `xato`.

    Kalit AVVAL o'chiriladi, keyin kanalga yuboriladi: ikki admin bir
    vaqtda bossa ham post bitta chiqadi.
    """
    if str(tg_id) not in [str(a) for a in settings.ADMIN_TG]:
        return "ruxsat_yoq"
    amal, _, nid = data.partition(":")
    namuna = cache.get(_kalit(nid))
    if not namuna or not cache.delete(_kalit(nid)):
        return "eskirgan"
    if amal == "quiz_yoq":
        return "rad"
    holat, _, _ = X.quiz_yubor(_kanal(), namuna["savol"], namuna["variantlar"],
                               namuna["togri"], namuna["izoh"])
    if holat != "yuborildi":
        cache.set(_kalit(nid), namuna, KESH_MUDDAT)      # qayta bosib ko'rsin
        return "xato"
    return "yuborildi"
