"""
Stories uchun rolikning yozuvli nusxasi.

Instagram Stories'ga izoh (`caption`) berib bo'lmaydi — API bunday
maydonni qabul qilmaydi. Matn ko'rinishining yagona yo'li uni
videoning O'ZIGA yozish. Shuning uchun Stories'ga alohida nusxa
ketadi: pastida to'q plashkada qisqa yozuv. Reels va
kanal posti asl videodan — ularga tegilmaydi.

Yozuv Pillow'da rasm bo'lib chiziladi va ffmpeg `overlay` bilan
qo'yiladi. `drawtext` emas: u o'zbekcha apostroflarni va qatorga
bo'lishni o'zi bilmaydi, rasmni esa `core/tamga.py` dagi shriftlar
bilan to'liq boshqaramiz.

Joyi `PASTDAN` da — nega aynan u yerda, o'sha yerda yozilgan.

Biror narsa ishlamasa (ffmpeg yo'q, shrift yo'q) — `None`, va Stories
yozuvsiz asl videodan chiqadi: yozuvsiz Stories chiqmaganidan yaxshi.
"""
from __future__ import annotations

import re
import subprocess
import tempfile
from pathlib import Path

from django.conf import settings

from core.tamga import _shrift

try:
    from PIL import Image, ImageDraw
except ImportError:                                   # pragma: no cover
    Image = None                                      # type: ignore[assignment]

#: Shrift balandligi — video eniga nisbatan (1080 da ~43px).
SHRIFT_ULUSH = 0.04
#: Plashka eni ko'pi bilan videoning shuncha qismi.
EN_ULUSH = 0.86
#: Plashkaning pastki cheti kadr tagidan shuncha yuqorida. Roliklarda
#: shu joyda "Havola bioda" tugmasi turadi — plashka uni to'liq yopadi
#: (Stories'da bot nomi foydaliroq), rolikning subtitrlari esa undan
#: yuqorida qoladi. Undan pastda Stories'ning "javob yozish" qatori.
PASTDAN = 0.08
#: Ikkinchi qator plashkani yuqoriga — subtitrlar tomon — o'stiradi.
ENG_KOP_QATOR = 2
#: Plashka foni deyarli to'q: orqasidagi rolik yozuvi ko'rinib qolmasin.
FON = (12, 18, 40, 225)


def umumiy_matn() -> str:
    bot = getattr(settings, "BOT_USERNAME", "") or "aqlzone_bot"
    return f"Telegram'da bepul: @{bot.lstrip('@')}"


def tozala(matn: str) -> str:
    """HTML teglar va emojilarsiz: shriftda emoji yo'q, kvadrat chiqardi."""
    t = re.sub(r"<[^>]+>", "", matn or "")
    t = re.sub(r"[\U00010000-\U0010FFFF☀-➿️‍]", "", t)
    return re.sub(r"[ \t]+", " ", t).strip()


def _olcham(video: Path) -> tuple[int, int]:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", str(video)],
        capture_output=True, text=True, timeout=20, check=True,
    )
    en, bal = r.stdout.strip().split("x")[:2]
    return int(en), int(bal)


def _qatorlar(matn: str, shrift, eng_keng: int) -> list[str]:
    o = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    qatorlar: list[str] = []
    for xat in matn.splitlines():
        joriy = ""
        for soz in xat.split():
            sinov = f"{joriy} {soz}".strip()
            if joriy and o.textlength(sinov, font=shrift) > eng_keng:
                qatorlar.append(joriy)
                joriy = soz
            else:
                joriy = sinov
        if joriy:
            qatorlar.append(joriy)
    if len(qatorlar) > ENG_KOP_QATOR:
        qatorlar = qatorlar[:ENG_KOP_QATOR]
        qatorlar[-1] = qatorlar[-1].rstrip(".,;: ") + "…"
    return qatorlar


def plashka(matn: str, en: int):
    """Yozuvli yarim shaffof plashka (RGBA). Shrift bo'lmasa — None."""
    px = max(24, round(en * SHRIFT_ULUSH))
    shrift = _shrift(px)
    if shrift is None:
        return None
    ichki = round(px * 0.6)
    qatorlar = _qatorlar(matn, shrift, round(en * EN_ULUSH) - ichki * 2)
    if not qatorlar:
        return None
    o = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    qator_bal = round(px * 1.3)
    w = max(round(o.textlength(q, font=shrift)) for q in qatorlar) + ichki * 2
    h = qator_bal * len(qatorlar) + ichki * 2 - (qator_bal - px)

    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], round(px * 0.7), fill=FON)
    for i, q in enumerate(qatorlar):
        d.text((w / 2, ichki + i * qator_bal), q, font=shrift, fill=(255, 255, 255), anchor="ma")
    return im


def yozuvli(video: Path, matn: str) -> Path | None:
    """
    Pastiga `matn` yozilgan nusxa — vaqtinchalik faylda. Chaqiruvchi
    ishi bitgach o'chiradi. Bo'lmasa `None`.
    """
    matn = tozala(matn)
    if Image is None or not matn:
        return None
    papka = Path(tempfile.mkdtemp(prefix="stories_"))
    chiqish = papka / "stories.mp4"
    try:
        en, bal = _olcham(video)
        p = plashka(matn, en)
        if p is None:
            return None
        rasm = papka / "yozuv.png"
        p.save(rasm)
        x, y = (en - p.width) // 2, bal - p.height - round(bal * PASTDAN)
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-i", str(video), "-i", str(rasm),
             "-filter_complex", f"[0:v][1:v]overlay={x}:{y}[v]",
             "-map", "[v]", "-map", "0:a?", "-c:a", "copy",
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(chiqish)],
            capture_output=True, timeout=300, check=True,
        )
        rasm.unlink(missing_ok=True)
        return chiqish if chiqish.exists() and chiqish.stat().st_size else None
    except (OSError, ValueError, subprocess.SubprocessError):
        return None
