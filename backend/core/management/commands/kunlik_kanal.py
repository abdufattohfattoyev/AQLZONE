"""
Kunlik son — kanalga kechki natija posti.

    python manage.py kunlik_kanal --sinov      # matnni ko'rsatadi, yubormaydi
    python manage.py kunlik_kanal              # kanalga joylaydi

─────────────────── NEGA KERAK ───────────────────

Kanal ikkinchi manba (oxirgi 30 kunda 36 ta kirish), lekin unda faqat
QO'LDA post qo'yilganda hayot bor: yangi hisoblar shu sababli ba'zi
haftalarda 236 ta, ba'zilarida 7 ta bo'lgan. O'sish bir odamning
qo'liga bog'lanib qolgan.

Kunlik natija posti buni hal qiladi: har kuni bir xil soatda, o'zi
chiqadigan, TIRIK post. Unda boshqalarning natijasi turadi — ya'ni
o'qigan odamda "men ham urinib ko'ray" degan fikr paydo bo'ladi.

─────────────────── YECHIM OCHILMAYDI ───────────────────

Postda tenglikning O'ZI hech qachon yozilmaydi: kanal a'zolari orasida
bugungi jumboqni hali yechmaganlar bor va javobni ko'rsatish o'yinni
o'ldiradi. Faqat ism, urinish soni va vaqt ko'rinadi.

Post KECHQURUN (21:00) chiqadi — kun tugagan, natijalar yig'ilgan.
"""
from __future__ import annotations

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core import kunlik_son as KS
from core import xabar as X

#: Postda nechta natija ko'rsatiladi. Uzun ro'yxat kanalda o'qilmaydi.
TOP = 10

O_RIN = ["🥇", "🥈", "🥉"]


def _vaqt(sekund: int) -> str:
    daqiqa, soniya = divmod(max(0, sekund), 60)
    return f"{daqiqa}:{soniya:02d}" if daqiqa else f"{soniya} s"


def post_matni(kun=None) -> tuple[str, int]:
    """Post matni va bugun yechganlar soni."""
    kun = kun or timezone.localdate()
    r = KS.royxat(kun=kun)
    qatorlar = r["qatorlar"][:TOP]
    bosh = f"🔢 <b>Kunlik son #{r['raqam']}</b> — bugungi natijalar\n"
    if not qatorlar:
        return (bosh + "\nBugun hali hech kim yechmadi. Birinchi bo'lasizmi?", 0)

    daraja_nom = {1: "oson", 2: "o'rta", 3: "qiyin"}
    satr = []
    for i, q in enumerate(qatorlar):
        belgi = O_RIN[i] if i < len(O_RIN) else f"{i + 1}."
        satr.append(f"{belgi} {q['ism']} — {q['urinish']}/{KS.URINISH} urinish · "
                    f"{_vaqt(q['sekund'])} · {daraja_nom.get(q['daraja'], '')}")
    oxir = (f"\n\nBugun <b>{r['yechgan']}</b> kishi yechdi. "
            "Ertaga soat 00:00 da yangi jumboq chiqadi.")
    return bosh + "\n" + "\n".join(satr) + oxir, r["yechgan"]


class Command(BaseCommand):
    help = "Kunlik son natijalarini kanalga joylaydi"

    def add_arguments(self, parser):
        parser.add_argument("--sinov", action="store_true")
        parser.add_argument("--soat", type=int, default=None)

    def handle(self, *args, **o):
        if o["soat"] is not None and timezone.localtime().hour != o["soat"]:
            return
        matn, yechgan = post_matni()
        bot = getattr(settings, "BOT_USERNAME", "") or ""
        havola = f"https://t.me/{bot}?start=kunlik" if bot else X.ilova_havolasi()

        if o["sinov"]:
            self.stdout.write(matn.replace("<b>", "").replace("</b>", ""))
            self.stdout.write(self.style.SUCCESS(f"(sinov) {yechgan} ta yechgan · {havola}"))
            return

        kanal = getattr(settings, "KANAL", "") or ""
        if not kanal or not settings.BOT_TOKEN:
            self.stderr.write(self.style.ERROR("KANAL yoki BOT_TOKEN sozlanmagan"))
            return
        kanal = kanal if kanal.startswith("@") or kanal.startswith("-") else f"@{kanal}"

        holat, izoh = X.yubor(kanal, matn, tugma="Bugungi sonni yechish", havola=havola)
        if holat == "yuborildi":
            self.stdout.write(self.style.SUCCESS(f"kanalga joylandi ({yechgan} ta natija)"))
        else:
            self.stderr.write(self.style.ERROR(f"yuborilmadi: {holat} {izoh}"))
