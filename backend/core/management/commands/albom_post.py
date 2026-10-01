"""
Albom — chapga-o'ngga suriladigan bir nechta rasmli post kanalga.

    albom_post <papka>           papkadagi rasmlarni bitta post qilib yuboradi
    albom_post <papka> --sinov   nima chiqishini aytadi, yubormaydi

Papka ichida:

    01.jpg  02.png  03.webp ...   2–10 ta rasm, NOM bo'yicha tartiblanadi
    matn.txt                      post ostidagi yozuv (HTML, ixtiyoriy)

Rasmlar JPEG ga o'giriladi: Telegram WebP ni rasm o'rnida ba'zan rad
etadi (`rasm.jpeg_qil` dagi izohga qarang).

Tugma yo'q — Telegram albomga tugma qo'ydirmaydi. Ilovaga havola
`matn.txt` ichida `<a href="https://t.me/...">...</a>` bo'lib yoziladi.
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
    help = "Papkadagi rasmlarni kanalga bitta albom post qilib yuboradi"

    def add_arguments(self, parser):
        parser.add_argument("papka")
        parser.add_argument("--sinov", action="store_true")

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
        if len(matn) > X.MAX_SARLAVHA:
            raise CommandError(f"matn {len(matn)} belgi — {X.MAX_SARLAVHA} dan oshmasin")

        if o["sinov"]:
            self.stdout.write(f"chiqadi: {', '.join(p.name for p in roy)}\n{matn}")
            return

        kanal = kanal_nomi()
        if not kanal or not getattr(settings, "BOT_TOKEN", ""):
            raise CommandError("KANAL yoki BOT_TOKEN sozlanmagan")

        holat, izoh, xabar_id = X.albom_yubor(kanal, [jpeg_qil(p) for p in roy], matn)
        self.stdout.write(f"albom: {len(roy)} ta rasm — {holat} {izoh} {xabar_id or ''}")
        if holat == "yuborildi" and xabar_id:
            self.stdout.write(f"https://t.me/{kanal.lstrip('@')}/{xabar_id}")
