"""
Reklama roligi kanalga — har kuni bittadan, navbat bo'yicha.

    rolik_post           navbatdagi birinchisini kanalga yuboradi
    rolik_post --sinov   nima chiqishini aytadi, yubormaydi
    rolik_post --holat   navbatni ko'rsatadi
    rolik_post --instagram   Instagram kaliti ishlayaptimi

INSTAGRAM_TOKEN berilgan bo'lsa, kanalga chiqqan rolik Instagram'ning
Reels va Stories'iga ham joylanadi (`core/instagram.py`). Izoh —
json'dagi `instagram`, bo'lmasa `matn` dan teglarsiz yasaladi; oxiriga
doim aniq 5 ta `#teg` qo'yiladi (json'dagi `teglar`, yetmasa umumiylari).
Stories izoh olmaydi — json'dagi `stories` matni (bo'lmasa umumiy
yozuv) videoning pastiga yoziladi (`core/stories_yozuv.py`).

─────────────────── NAVBAT ───────────────────

Roliklar HAFTALIK TO'PLAM bo'lib tayyorlanadi (kompyuterda, `.rolik/`
quvuri bilan) va egasi ko'rib chiqqanidan keyin serverga tashlanadi:

    <ROLIK_PAPKA>/navbat/01-sertifikat.mp4
    <ROLIK_PAPKA>/navbat/01-sertifikat.json   {"matn": ..., "tugma": ..., "havola": ...}

Papkalarning o'zi `core/rolik.py` da — hisobot ham o'sha yerdan
o'qiydi (`core/osish.py`: qaysi rolik qancha ko'rildi).

Nom bo'yicha tartiblanadi — oldingi raqam navbatni belgilaydi.
Joylangani `chiqdi/` ga sanasi bilan ko'chadi: navbatda faqat
kutayotganlar qoladi va "nima chiqdi" degan savolga papkaning o'zi
javob beradi.

Rolik kodda yasalmaydi va bu ataylab: yasash uchun brauzer, ilovaning
dev serveri va ovoz xizmati kerak — serverda ularning hech biri yo'q.
Ustiga yasalgan rolikni odam ko'rmasdan kanalga chiqarish xavfli.

─────────────────── KUNIGA BITTA ───────────────────

Beat jadval faylini yo'qotsa yoki qo'lda qayta yuritilsa, bir kunda
ikkita rolik chiqib ketmasin: `chiqdi/` da bugungi sana bilan fayl
bo'lsa — hech narsa yuborilmaydi.

Navbat tugab qolayotganda adminlar ogohlantiriladi: bo'sh navbat
kanalda jimgina "tushib qolgan kun" bo'lib qolmasin.
"""
from __future__ import annotations

import html
import json
import shutil
import subprocess
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core import instagram, stories_yozuv
from core import xabar as X
from core.kanal import kanal_nomi
from core.rolik import malumot, navbat, papkalar

#: Navbatda shuncha yoki kamroq qolganda adminlarga eslatiladi.
OGOHLANTIR = 2


def davomiylik(video: Path) -> int:
    """Soniyalarda; `ffprobe` bo'lmasa 0 (Telegram o'zi aniqlaydi)."""
    try:
        r = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
            capture_output=True, text=True, timeout=20,
        )
        return round(float(r.stdout.strip()))
    except (OSError, ValueError, subprocess.SubprocessError):
        return 0


def bugun_chiqdimi() -> bool:
    _, c = papkalar()
    kun = timezone.localdate().isoformat()
    return c.exists() and any(c.glob(f"{kun}_*.mp4"))


def adminlarga(matn: str) -> None:
    for tg_id in [str(x) for x in getattr(settings, "ADMIN_TG", []) if x]:
        try:
            X.yubor(tg_id, matn)
        except Exception:                        # noqa: BLE001
            pass


class Command(BaseCommand):
    help = "Navbatdagi reklama roligini kanalga yuboradi (kuniga bitta)"

    def add_arguments(self, parser):
        parser.add_argument("--sinov", action="store_true")
        parser.add_argument("--holat", action="store_true")
        parser.add_argument("--instagram", action="store_true", help="Instagram kaliti ishlayaptimi")

    def handle(self, *args, **o):
        if o["instagram"]:
            if not instagram.sozlanganmi():
                self.stdout.write("INSTAGRAM_TOKEN sozlanmagan")
                return
            a = instagram.akkaunt()
            self.stdout.write(f"instagram: @{a.get('username')} ({a.get('user_id')}) — ishlayapti")
            return

        roy = navbat()
        if o["holat"]:
            self.stdout.write(f"navbatda {len(roy)} ta:")
            for v in roy:
                self.stdout.write(f"  {v.name}  —  {(malumot(v).get('matn') or '').splitlines()[:1]}")
            return

        if bugun_chiqdimi():
            self.stdout.write("bugun rolik allaqachon chiqqan — yuborilmaydi")
            return
        if not roy:
            self.stdout.write("navbat bo'sh")
            if not o["sinov"]:
                adminlarga("🎬 <b>Rolik navbati bo'sh</b>\n\nBugun kanalga reklama roligi chiqmadi. "
                           "Yangi haftalik to'plam kerak.")
            return

        video = roy[0]
        m = malumot(video)
        matn = m.get("matn") or ""
        tugmalar = [(m["tugma"], m["havola"], X.KOK)] if m.get("tugma") and m.get("havola") else []
        if o["sinov"]:
            self.stdout.write(f"chiqadi: {video.name}\n{matn}\ntugma: {tugmalar}")
            return

        kanal = kanal_nomi()
        if not kanal or not getattr(settings, "BOT_TOKEN", ""):
            self.stderr.write("KANAL yoki BOT_TOKEN sozlanmagan")
            return

        holat, izoh, xabar_id = X.video_yubor(
            kanal, video.read_bytes(), matn, tugmalar, davom=davomiylik(video))
        self.stdout.write(f"rolik: {video.name} — {holat} {izoh} {xabar_id or ''}")
        if holat != "yuborildi":
            adminlarga(f"🎬 <b>Rolik kanalga chiqmadi</b>\n\n{html.escape(video.name)}: "
                       f"{html.escape(izoh or holat)}")
            return

        # Joylangani `chiqdi/` ga — sanasi va post raqami bilan.
        _, chiqdi = papkalar()
        chiqdi.mkdir(parents=True, exist_ok=True)
        kun = timezone.localdate().isoformat()
        m["xabar_id"] = xabar_id
        (chiqdi / f"{kun}_{video.stem}.json").write_text(
            json.dumps(m, ensure_ascii=False, indent=1), encoding="utf-8")
        shutil.move(str(video), chiqdi / f"{kun}_{video.name}")
        video.with_suffix(".json").unlink(missing_ok=True)

        # O'sha rolik Instagram Reels'ga ham. Telegram'dan KEYIN: Instagram
        # xatosi kanal postini to'xtatmasin, faqat admin bilsin.
        if instagram.sozlanganmi():
            ig_matn = instagram.teglar_bilan(m.get("instagram") or instagram.izoh(matn),
                                             m.get("teglar") or ())
            natija = instagram.joyla(chiqdi / f"{kun}_{video.name}", ig_matn,
                                     m.get("stories") or stories_yozuv.umumiy_matn())
            for joy, (h, izoh, mid) in natija.items():
                self.stdout.write(f"instagram {joy}: {h} {izoh} {mid}")
                m[f"instagram_{joy}"] = mid
            (chiqdi / f"{kun}_{video.stem}.json").write_text(
                json.dumps(m, ensure_ascii=False, indent=1), encoding="utf-8")
            xato = [f"{joy} — {izoh}" for joy, (h, izoh, _) in natija.items() if h != "joylandi"]
            if xato:
                adminlarga(f"📸 <b>Rolik Instagram'ga to'liq chiqmadi</b>\n\n"
                           f"{html.escape(video.name)}\n" + "\n".join(html.escape(x) for x in xato))

        qoldi = len(roy) - 1
        if qoldi <= OGOHLANTIR:
            adminlarga(f"🎬 Rolik navbatida <b>{qoldi} ta</b> qoldi. Yangi haftalik to'plamni "
                       f"tayyorlash vaqti.")
