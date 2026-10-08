"""
Eski Android uchun ikonka PNG larini yasaydi.

─────────────────────── NEGA KERAK ───────────────────────

Android 8 va undan yuqorisi ikonkani XML dan oladi
(`mipmap-anydpi-v26/ic_launcher.xml`) va u yerda hamma narsa vektor.
Android 7 esa vektorni ikonka sifatida qabul qilmaydi — unga PNG kerak,
har ekran zichligi uchun alohida.

─────────────────────── BELGI QAYERDAN ───────────────────────

2026-10-08 dan belgi (firuza plitka + oq "A" + amber "Z") serverdagi
`backend/core/tamga.py` → `_belgi()` bilan chiziladi — masala rasmlariga
tamg'a bosadigan o'sha funksiya. Ilgari bu fayl belgini o'zi, alohida
qo'lda chizardi va logo o'zgarganda ikki joyni birga tuzatish kerak edi.

─────────────────────── QANDAY ISHLATILADI ───────────────────────

    python tools/ikonka.py

Fayllar `app/src/main/res/mipmap-*/` ichiga yoziladi. Ularni qayta
yasash faqat LOGO o'zgarganda kerak — natija repozitoriyda saqlanadi.
"""
from __future__ import annotations

import os
import sys

from PIL import Image, ImageDraw

BU_YER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BU_YER, "..", "..", "backend"))

from core.tamga import _belgi  # noqa: E402

#: Ikonka o'lchamlari — Android talab qiladigan zichliklar.
OLCHAMLAR = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

#: Katta chizib, keyin kichraytiramiz — qirralar silliq bo'lsin.
ANIQLIK = 8


def chiz(olcham: int, doira: bool) -> Image.Image:
    """
    Kvadrat ikonka — plitkaning o'zi (yumaloq burchakli).
    Doira ikonka — plitka doira bilan kesiladi; harflar markazda qoladi.
    """
    katta = olcham * ANIQLIK
    belgi = _belgi(katta)
    if doira:
        niqob = Image.new("L", (katta, katta), 0)
        ImageDraw.Draw(niqob).ellipse([0, 0, katta - 1, katta - 1], fill=255)
        alfa = belgi.getchannel("A")
        belgi.putalpha(Image.composite(alfa, Image.new("L", alfa.size, 0), niqob))
    return belgi.resize((olcham, olcham), Image.LANCZOS)


def main() -> None:
    res = os.path.join(BU_YER, "..", "app", "src", "main", "res")
    for papka, olcham in OLCHAMLAR.items():
        yol = os.path.join(res, papka)
        os.makedirs(yol, exist_ok=True)
        chiz(olcham, doira=False).save(os.path.join(yol, "ic_launcher.png"))
        chiz(olcham, doira=True).save(os.path.join(yol, "ic_launcher_round.png"))
        print(papka, olcham)


if __name__ == "__main__":
    main()
