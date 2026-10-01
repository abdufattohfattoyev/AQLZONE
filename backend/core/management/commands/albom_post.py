"""
Albom — chapga-o'ngga suriladigan bir nechta rasmli post kanalga.

    albom_post <papka>              papkadagi rasmlarni bitta post qilib yuboradi
    albom_post <papka> --sinov      nima chiqishini aytadi, yubormaydi
    albom_post <papka> --kimga ID   kanal o'rniga shu chatga (ko'rib olish uchun)

Papka ichida:

    01.jpg  02.png  03.webp ...   2–10 ta rasm, NOM bo'yicha tartiblanadi
    matn.txt                      post ostidagi yozuv (HTML, ixtiyoriy)

Rasmlar JPEG ga o'giriladi: Telegram WebP ni rasm o'rnida ba'zan rad
etadi (`rasm.jpeg_qil` dagi izohga qarang).

`matn.txt` da bo'sh qator — yangi band. Tugma kerak bo'lsa:
`--tugma "Ilovani ochish" --havola https://t.me/...`.
"""
from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from core import xabar as X
from core.kanal import kanal_nomi
from core.rasm import jpeg_qil

RASM_TURLARI = {".jpg", ".jpeg", ".png", ".webp"}


def rasmlar(papka: Path) -> list[Path]:
    return sorted(p for p in papka.iterdir() if p.suffix.lower() in RASM_TURLARI)


class Command(BaseCommand):
    help = "Papkadagi rasmlarni kanalga bitta suriladigan albom qilib yuboradi"

    def add_arguments(self, parser):
        parser.add_argument("papka")
        parser.add_argument("--sinov", action="store_true")
        parser.add_argument("--kimga", default="")
        parser.add_argument("--tugma", default="")
        parser.add_argument("--havola", default="")

    def handle(self, *args, **o):
        papka = Path(o["papka"])
        if not papka.is_dir():
            raise CommandError(f"papka topilmadi: {papka}")

        roy = rasmlar(papka)
        if not X.ALBOM_MIN <= len(roy) <= X.ALBOM_MAX:
            raise CommandError(
                f"albomda {X.ALBOM_MIN}–{X.ALBOM_MAX} ta rasm bo'ladi, papkada {len(roy)} ta")

        matn_fayl = papka / "matn.txt"
        matn = matn_fayl.read_text(encoding="utf-8").strip() if matn_fayl.exists() else ""
        tugmalar = [(o["tugma"], o["havola"], X.KOK)] if o["tugma"] and o["havola"] else []

        if o["sinov"]:
            self.stdout.write(
                f"chiqadi: {', '.join(p.name for p in roy)}\n{matn}\ntugma: {tugmalar}")
            return

        kanal = kanal_nomi()
        kimga = o["kimga"] or kanal
        if not kimga or not getattr(settings, "BOT_TOKEN", ""):
            raise CommandError("KANAL yoki BOT_TOKEN sozlanmagan")

        holat, izoh, xabar_id = X.albom_yubor(kimga, [jpeg_qil(p) for p in roy], matn, tugmalar)
        self.stdout.write(f"albom: {len(roy)} ta rasm — {holat} {izoh} {xabar_id or ''}")
        if holat == "yuborildi" and xabar_id and kimga == kanal:
            self.stdout.write(f"https://t.me/{kanal.lstrip('@')}/{xabar_id}")
