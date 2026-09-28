"""
O'tgan haftaning DTM va sertifikat reytingi — kanalga, dushanba kuni.

    reyting_post           kanalga yuboradi
    reyting_post --sinov   faqat ekranga chiqaradi

─────────────────── NEGA ───────────────────

Reyting ilova ichida bor, lekin uni faqat ishlagan odam ko'radi.
Kanalda esa u IJTIMOIY ISBOT: "o'tgan hafta 14 kishi DTM varianti
ishladi, eng yaxshisi 27/30" — o'quvchini "men ham" deb qo'lga
variant olishga undaydi. Ostidagi tugma botga (`/start dtm`) olib
boradi va o'sish hisobotida "DTM havolasi" bo'lib sanaladi.

─────────────────── ISMLAR QISQA ───────────────────

Kanal hammaga ochiq, ro'yxatda esa bolalar ham bor: "Jasur O." —
to'liq familiya emas. Ilova ichidagi jadvalda to'liq ism qoladi.

Qatnashchi 3 tadan kam bo'lsa post chiqmaydi: bitta odamli
"reyting" ijtimoiy isbot emas, aksincha — bo'shlikni ko'rsatadi.
"""
from __future__ import annotations

import html
from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand

from core import imtihon as IM
from core import xabar as X
from core.kanal import kanal_nomi

ENG_KAM = 3
TOP = 5
MEDAL = ["🥇", "🥈", "🥉", "4.", "5."]
OYLAR = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust",
         "sentabr", "oktabr", "noyabr", "dekabr"]


def qisqa_ism(toliq: str) -> str:
    """"Jasur Olimov" → "Jasur O."; bo'sh — "Ishtirokchi"."""
    q = toliq.split("(")[0].split()
    if not q:
        return "Ishtirokchi"
    return q[0] if len(q) == 1 else f"{q[0]} {q[1][0]}."


def post_matni(boshi) -> tuple[str, int]:
    """`(matn, jami qatnashchi)` — o'tgan hafta (`boshi` — dushanba)."""
    oxiri = boshi + timedelta(days=6)
    sana = (f"{boshi.day}–{oxiri.day} {OYLAR[oxiri.month - 1]}" if boshi.month == oxiri.month
            else f"{boshi.day} {OYLAR[boshi.month - 1]} – {oxiri.day} {OYLAR[oxiri.month - 1]}")
    q = [f"🏆 <b>Haftalik reyting</b> · {sana}"]
    jami = 0
    for tur, nom in (("dtm", "📝 DTM"), ("sert", "🏅 Milliy sertifikat")):
        r = IM.haftalik_reyting(tur, None, None, boshi=boshi)
        if not r["ishlagan"]:
            continue
        jami += r["ishlagan"]
        q.append(f"\n<b>{nom}</b> · {r['ishlagan']} kishi")
        for i, x in enumerate(r["qatorlar"][:TOP]):
            natija = (f"{x['ball']:.1f}".replace(".", ",") + " ball") if x["ball"] is not None \
                else f"{x['togri']}/{x['jami']}"
            q.append(f"{MEDAL[i]} {html.escape(qisqa_ism(x['ism']))} — {natija}")
    q.append("\nHar variantning BIRINCHI urinishi hisoblanadi. Bu hafta siz ham qatnashing 👇")
    return "\n".join(q), jami


class Command(BaseCommand):
    help = "O'tgan hafta DTM/sertifikat reytingini kanalga yuboradi"

    def add_arguments(self, parser):
        parser.add_argument("--sinov", action="store_true")

    def handle(self, *args, **o):
        boshi = IM.hafta_boshi() - timedelta(days=7)
        matn, jami = post_matni(boshi)
        if o["sinov"]:
            self.stdout.write(matn + f"\n(qatnashchi: {jami})")
            return
        if jami < ENG_KAM:
            self.stdout.write(f"qatnashchi {jami} ta — post chiqmaydi (kamida {ENG_KAM})")
            return
        kanal = kanal_nomi()
        bot = (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")
        if not kanal or not bot:
            self.stderr.write("KANAL yoki BOT_USERNAME sozlanmagan")
            return
        holat, izoh = X.yubor(kanal, matn, tugma="📝 Variant ishlash",
                              havola=f"https://t.me/{bot}?start=dtm")
        self.stdout.write(f"reyting posti: {holat} {izoh}")
