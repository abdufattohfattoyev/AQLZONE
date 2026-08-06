"""
Ovoz lug'atini oldindan tayyorlaydi.

    python manage.py ovoz              # kichkintoylar lug'ati
    python manage.py ovoz --fayl x.txt # o'z ro'yxating
    python manage.py ovoz --sana       # hech narsa yasamaydi, faqat sanaydi

NEGA KERAK. Ovoz so'ralganda o'zi ham yasaladi — lekin BIRINCHI marta
bu bir necha soniya oladi (Aisha'ga so'rov, javobni yuklab olish). Uch
yoshli bola uchun o'sha jimlik "ilova buzuq" degani: u kartani bosadi,
hech narsa bo'lmaydi va u telefonni qo'yadi.

Shuning uchun butun lug'at OLDINDAN tayyorlanadi. Undan keyin har bir
so'z oddiy fayl bo'lib turadi va bir zumda eshitiladi — internetsiz
ham, chunki `sw.js` uni birinchi so'rovdayoq keshlaydi.

Buyruq XAVFSIZ takrorlanadi: keshda turgan so'z qayta yasalmaydi va
qayta pul ketmaydi. Ya'ni uni har joylashdan keyin yurgizsa bo'ladi.

Ro'yxat `core/lugat/kichkintoy.txt` da va uni FRONTEND yasaydi
(`npm run tekshir` uni tekshiradi ham). Ikki joyda qo'lda yozilgan
ro'yxat ertami-kechmi ajralib ketardi: ekranda karta bor, ovozi yo'q.
"""
from __future__ import annotations

import time
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from core import ovoz as O

#: Standart ro'yxat — kichkintoylar bo'limining butun lug'ati.
STANDART = Path(__file__).resolve().parent.parent.parent / "lugat" / "kichkintoy.txt"

#: Ketma-ket so'rovlar orasidagi tanaffus (sekund).
#:
#: Aisha tezlik chegarasini e'lon qilmagan. 134 ta qisqa so'z uchun
#: yarim soniya — jami bir daqiqa, ya'ni shoshilishning ma'nosi yo'q.
#: Chegaraga urilib, yarim lug'atni tashlab ketgandan ko'ra sekin
#: o'tgan yaxshi.
ORALIQ = 0.5


class Command(BaseCommand):
    help = "Ovoz lug'atini oldindan tayyorlaydi (TTS keshini to'ldiradi)"

    def add_arguments(self, parser):
        parser.add_argument("--fayl", default=str(STANDART),
                            help="satrma-satr ro'yxat fayli")
        parser.add_argument("--sana", action="store_true",
                            help="hech narsa yasamaydi — nechtasi yetishmasligini aytadi")
        parser.add_argument("--kuch", action="store_true",
                            help="keshdagini ham qaytadan yasaydi")

    def handle(self, *args, **o):
        fayl = Path(o["fayl"])
        if not fayl.exists():
            raise CommandError(
                f"ro'yxat topilmadi: {fayl}\n"
                "Yasash: frontend papkasida `npx jiti scripts/kichkintoy.ts --yoz`"
            )

        satrlar: list[str] = []
        korilgan: set[str] = set()
        for xom in fayl.read_text(encoding="utf-8").splitlines():
            s = O.tozala(xom.strip())
            # Izoh va bo'sh satr o'tkazib yuboriladi; takror ham —
            # bir so'z ikki mavzuda uchrashi mumkin ("rrr" ayiqda ham,
            # arslonda ham).
            if not s or xom.strip().startswith("#") or s in korilgan:
                continue
            korilgan.add(s)
            satrlar.append(s)

        if not satrlar:
            raise CommandError(f"ro'yxat bo'sh: {fayl}")

        yetishmaydi = [s for s in satrlar if o["kuch"] or not O.bormi(s, O.tili(s))]
        belgi = sum(len(s) for s in yetishmaydi)

        self.stdout.write(
            f"ro'yxat: {len(satrlar)} ta · keshda yo'q: {len(yetishmaydi)} ta "
            f"({belgi} belgi)"
        )
        self.stdout.write(f"kesh: {O.kesh_papka()}")

        if o["sana"]:
            return

        if not yetishmaydi:
            self.stdout.write(self.style.SUCCESS("hammasi tayyor — yasash shart emas"))
            return

        if not settings.AISHA_KEY:
            raise CommandError(
                "AISHA_KEY sozlanmagan (.env). Kalit: https://space.aisha.group/api-keys"
            )

        yasaldi = xato = 0
        for i, s in enumerate(yetishmaydi, 1):
            til = O.tili(s)
            try:
                # Budjet TEKSHIRILMAYDI: bu administrator qo'li bilan
                # ishga tushadigan buyruq, kunlik chegara esa
                # begonalardan himoya (`core/ovoz.py`).
                O.yasa(s, til, budjet=False)
                yasaldi += 1
                self.stdout.write(f"  [{i}/{len(yetishmaydi)}] {til} · {s}")
            except O.OvozXato as e:
                # Bitta so'zning xatosi qolganini to'xtatmasligi kerak:
                # 134 tadan bittasi tushib qolsa, qolgan 133 tasi
                # baribir kerak.
                xato += 1
                self.stderr.write(f"  [{i}/{len(yetishmaydi)}] XATO · {s} — {e}")
            time.sleep(ORALIQ)

        self.stdout.write(self.style.SUCCESS(f"yasaldi: {yasaldi} ta"))
        if xato:
            self.stdout.write(self.style.WARNING(
                f"yasalmadi: {xato} ta — buyruqni qaytadan yurgizsangiz "
                "faqat o'shalar urinib ko'riladi"
            ))
