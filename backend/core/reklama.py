"""
Botdan e'lon tarqatish.

Uch narsa bu modulni "shunchaki hammaga xabar yuborish" dan ajratib
turadi, va uchalasi ham bir marta kuyib bilinadigan narsalar:

  1. **Bir odamga ikki marta bormaydi.** Har yuborilgan xabar
     `ReklamaQabul` ga yoziladi, cheklov esa BAZADA turadi. Shu sabab
     uzilgan e'lonni davom ettirish xavfsiz. Ikki marta kelgan reklama —
     botni bloklashning eng tez yo'li.

  2. **Tezlik cheklangan.** Telegram bir soniyada ~30 xabarga ruxsat
     beradi va oshirib yuborilsa butun bot vaqtincha to'xtatiladi.
     Shuning uchun har xabardan keyin kichik tanaffus bor, 429 javobi
     kelsa esa Telegram aytgan muddat kutiladi.

  3. **Bloklagan odam eslab qolinadi.** 403 javobi "xato" emas: odam
     shunchaki botni bloklagan. U `Pupil.bot_bloklandi_at` ga yoziladi va
     keyingi e'lonlarda umuman qatnashmaydi.

Yuborish alohida oqimda (thread) ketadi — admin tugmani bosib, sahifani
yopib ketishi mumkin. Oqim uzilsa (server qayta ishga tushdi) e'lon
"ketyapti" holatida qoladi va panelda "Davom ettirish" tugmasi chiqadi.
Xuddi shu ishni `manage.py reklama` ham qiladi.
"""
from __future__ import annotations

import threading
import time

from django.db import IntegrityError, connection, transaction
from django.db.models import F
from django.utils import timezone

from . import xabar as X
from .models import Identity, Reklama, ReklamaQabul

#: Telegram bilan gaplashish qoidalari `core/xabar.py` da — bitta joyda.
TEZLIK = X.TEZLIK
MAX_MATN = X.MAX_MATN


def havola() -> str:
    """Tugma bosilganda ochiladigan standart manzil — bot."""
    return X.bot_havolasi("reklama")


def bitta_yubor(r: Reklama, chat_id: str) -> tuple[str, str]:
    """
    Bitta manzilga yuboradi. `(holat, izoh)` qaytadi.

    Holat: `yuborildi` | `bloklandi` | `xato`.
    """
    manzil = (r.havola or havola()).strip()
    return X.yubor(
        chat_id, r.matn,
        tugma=r.tugma_matni if r.tugma else "",
        havola=manzil if r.tugma else "",
    )


def sinov_yubor(r: Reklama, tg_id: str) -> tuple[bool, str]:
    """
    E'lonni FAQAT adminning o'ziga yuboradi — hammaga jo'natishdan oldin.

    `ReklamaQabul` ga YOZILMAYDI: aks holda haqiqiy tarqatishda admin
    o'zi e'londan chetda qolardi. Sinov nusxasi hisobga kirmaydi.

    Bu qadam ataylab bor. E'lonni orqaga qaytarib bo'lmaydi: bir marta
    ketgan xabar ming kishining telefonida qoladi. Uni oldin o'z ko'zi
    bilan ko'rish — xato terilgan so'z yoki ishlamaydigan tugmani
    tuzatishning yagona imkoniyati.
    """
    holat, izoh = bitta_yubor(r, tg_id)
    return holat == "yuborildi", izoh


def qabul_qiluvchilar(r: Reklama):
    """
    Shu e'lon HALI BORMAGAN, Telegram'i bog'langan hisoblar.

    Botni bloklaganlar chiqarib tashlanadi. Natija `(pupil_id, chat_id)`
    juftliklari bo'lib keladi: bitta hisobda bir nechta Telegram bo'lishi
    mumkin emas, lekin ehtiyot uchun har hisobdan bittasi olinadi.
    """
    yetganlar = set(
        ReklamaQabul.objects.filter(reklama=r).values_list("pupil_id", flat=True)
    )
    korilgan: set[int] = set()
    qs = (
        Identity.objects.filter(
            provider=Identity.TELEGRAM, pupil__bot_bloklandi_at__isnull=True
        )
        .values_list("pupil_id", "external_id")
        .order_by("pupil_id")
    )
    for pupil_id, tashqi in qs.iterator():
        if pupil_id in yetganlar or pupil_id in korilgan or not tashqi:
            continue
        korilgan.add(pupil_id)
        yield pupil_id, tashqi


def qancha_odam() -> int:
    """E'lon nechta odamga boradi — yuborishdan OLDIN ko'rsatish uchun."""
    return (
        Identity.objects.filter(
            provider=Identity.TELEGRAM, pupil__bot_bloklandi_at__isnull=True
        )
        .values("pupil_id")
        .distinct()
        .count()
    )


def yubor(reklama_id: int) -> dict:
    """
    E'lonni oxirigacha yuboradi. Qayta chaqirilsa — qolganidan davom etadi.

    Sinxron ishlaydi: uni fon oqimida yoki buyruq ichida chaqirish
    kerak. Natija — hisob-kitob lug'ati.
    """
    r = Reklama.objects.filter(pk=reklama_id).first()
    if r is None or r.holat == "tugadi":
        return {"holat": "yoq"}

    Reklama.objects.filter(pk=r.pk).update(
        holat="ketyapti",
        boshlandi_at=r.boshlandi_at or timezone.now(),
        # `jami` faqat BIR MARTA belgilanadi: davom ettirilganda qayta
        # hisoblansa, foiz orqaga qaytib ketardi.
        jami=r.jami or qancha_odam(),
    )
    r.refresh_from_db()

    oraliq = 1 / TEZLIK
    for pupil_id, chat_id in qabul_qiluvchilar(r):
        # Har xabardan oldin holatni qayta o'qiymiz: admin panelda
        # "To'xtatish" ni bosgan bo'lishi mumkin.
        hozirgi = Reklama.objects.filter(pk=r.pk).values_list("holat", flat=True).first()
        if hozirgi != "ketyapti":
            return {"holat": hozirgi or "yoq"}

        holat, izoh = bitta_yubor(r, chat_id)

        try:
            with transaction.atomic():
                ReklamaQabul.objects.create(
                    reklama=r, pupil_id=pupil_id, holat=holat, izoh=izoh
                )
        except IntegrityError:
            # Boshqa jarayon shu odamga allaqachon yuborgan — o'tkazamiz.
            continue

        if holat == "bloklandi":
            X.bloklanganini_belgila(pupil_id)

        # Hisoblagich BAZADA oshiriladi (`F`): Python tomonda o'qib-yozsak,
        # ikki jarayon bir vaqtda ishlaganda biri ikkinchisining hisobini
        # bosib ketardi.
        Reklama.objects.filter(pk=r.pk).update(**{holat: F(holat) + 1})
        time.sleep(oraliq)

    Reklama.objects.filter(pk=r.pk).update(holat="tugadi", tugadi_at=timezone.now())
    r.refresh_from_db()
    return {
        "holat": "tugadi", "yuborildi": r.yuborildi,
        "bloklandi": r.bloklandi, "xato": r.xato,
    }


def fonda_yubor(reklama_id: int) -> None:
    """
    Yuborishni alohida oqimda boshlaydi — admin javobni kutib turmaydi.

    Oqim `daemon`: server o'chirilganda uni ushlab turmaydi. Yarim
    qolgan e'lon `ketyapti` holatida qoladi va panelda "Davom ettirish"
    tugmasi chiqadi — hech narsa yo'qolmaydi.
    """
    def ish():
        try:
            yubor(reklama_id)
        finally:
            # Oqimning o'z ulanishi bor va uni O'ZI yopishi kerak, aks
            # holda ulanishlar to'planib qoladi.
            connection.close()

    threading.Thread(target=ish, daemon=True, name=f"reklama-{reklama_id}").start()
