"""
DTM marafoni — boshqaruv (`core/marafon.py`).

    marafon yarat --boshlanish 2026-09-28 [--kunlar 30]   bir marta
    marafon elon                                         kanalga boshlanish posti
    marafon eslatma                                      19:00 — bugun ishlamaganlarga
    marafon yakun                                        tugagach g'oliblar (bir marta)
    ... --sinov                                          yubormasdan ko'rsatadi
"""
from __future__ import annotations

import html
import time

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.utils.dateparse import parse_date

from core import marafon as MR
from core import xabar as X
from core.kanal import kanal_nomi
from core.matn import M, tilni_tanla
from core.models import Identity, Marafon, MarafonNatija, Profile

MEDAL = ["🥇", "🥈", "🥉", "4.", "5."]


def _bot() -> str:
    return (getattr(settings, "BOT_USERNAME", "") or "aqlzone_bot").lstrip("@")


class Command(BaseCommand):
    help = "DTM marafoni: yarat / elon / eslatma / yakun"

    def add_arguments(self, parser):
        parser.add_argument("amal", choices=["yarat", "elon", "eslatma", "yakun"])
        parser.add_argument("--boshlanish", default="")
        parser.add_argument("--kunlar", type=int, default=30)
        parser.add_argument("--sinov", action="store_true")

    def handle(self, *args, **o):
        getattr(self, "_" + o["amal"])(o)

    # ------------------------------------------------------------ yarat

    def _yarat(self, o):
        sana = parse_date(o["boshlanish"]) if o["boshlanish"] else timezone.localdate()
        if not sana:
            raise CommandError("--boshlanish YYYY-MM-DD")
        m, yangi = Marafon.objects.get_or_create(
            boshlanish=sana, defaults={"nom": f"{o['kunlar']} kunlik DTM marafoni", "kunlar": o["kunlar"]})
        self.stdout.write(f"{'yaratildi' if yangi else 'bor edi'}: #{m.pk} {m.nom} {m.boshlanish}–{MR.oxiri(m)}")

    # ------------------------------------------------------------ elon

    def _elon(self, o):
        m = MR.joriy()
        if not m:
            raise CommandError("marafon yo'q")
        matn = (
            f"🏃 <b>{html.escape(m.nom)} boshlandi!</b>\n\n"
            f"Har kuni — bitta kun varianti: {m.savol} ta DTM savoli, {m.daqiqa} daqiqa.\n"
            "Ball — to'g'ri javoblar yig'indisi. Har kunning BIRINCHI urinishi hisoblanadi, "
            "o'tkazib yuborilgan kunni qaytarib bo'lmaydi.\n\n"
            f"📅 {m.boshlanish:%d.%m} – {MR.oxiri(m):%d.%m}\n"
            "🏆 Yakunda g'oliblar shu kanalda e'lon qilinadi.\n\n"
            "Bugundan boshlang 👇"
        )
        if o["sinov"]:
            self.stdout.write(matn)
            return
        holat, izoh = X.yubor(kanal_nomi(), matn, tugma="🏃 Marafonga qo'shilish",
                              havola=f"https://t.me/{_bot()}?start=marafon")
        self.stdout.write(f"e'lon: {holat} {izoh}")

    # ------------------------------------------------------------ eslatma

    def _eslatma(self, o):
        """Kamida bir kun qatnashgan, bugun hali ishlamaganlarga — bitta xabar."""
        m = MR.joriy()
        k = MR.kun_raqami(m) if m else None
        if not m or not k:
            self.stdout.write("marafon ketmayapti")
            return
        qatnashgan = set(MarafonNatija.objects.filter(marafon=m).values_list("profile_id", flat=True))
        bugun = set(MarafonNatija.objects.filter(marafon=m, kun=k).values_list("profile_id", flat=True))
        yubordi = 0
        korilgan: set[int] = set()
        for p in Profile.objects.filter(pk__in=qatnashgan - bugun).select_related("pupil"):
            pupil = p.pupil
            if pupil.pk in korilgan or pupil.xabar_yopiq_at or getattr(pupil, "bloklagan_at", None):
                continue
            korilgan.add(pupil.pk)
            kirish = pupil.identities.filter(provider=Identity.TELEGRAM).first()
            if not kirish:
                continue
            til = tilni_tanla(pupil.til)
            z = MR.zanjir(m, p)
            matn = M("marafonEslatma", til, kun=k, jami=m.kunlar, zanjir=z)
            if o["sinov"]:
                self.stdout.write(f"→ {kirish.external_id}: {matn}")
                continue
            holat, _ = X.yubor(kirish.external_id, matn, tugma=M("tMarafon", til),
                               havola=X.manba_bilan(f"{settings.MINI_APP_URL.rstrip('/')}/marafon", "eslatma"),
                               ilovada=True)
            if holat == "bloklandi":
                X.bloklanganini_belgila(pupil.pk)
            yubordi += holat == "yuborildi"
            time.sleep(0.05)
        self.stdout.write(f"marafon eslatmasi: {yubordi} ta")

    # ------------------------------------------------------------ yakun

    def _yakun(self, o):
        from core.management.commands.reyting_post import qisqa_ism
        from core.sinf import _ism

        bugun = timezone.localdate()
        for m in Marafon.objects.filter(elon_at__isnull=True):
            if bugun <= MR.oxiri(m):
                continue
            jadval = MR._jadval(m)
            profillar = {p.pk: p for p in Profile.objects.filter(
                pk__in=[y["profil"] for y in jadval[:5]]).select_related("pupil")}
            q = [f"🏆 <b>{html.escape(m.nom)} yakunlandi!</b>",
                 f"\n{len(jadval)} kishi qatnashdi. G'oliblar:"]
            for i, y in enumerate(jadval[:5]):
                ism = qisqa_ism(_ism(profillar[y["profil"]])) if y["profil"] in profillar else "Ishtirokchi"
                q.append(f"{MEDAL[i]} {html.escape(ism)} — {y['ball']} ball · {y['kun']} kun")
            q.append("\nTabriklaymiz! 👏 Keyingi marafon haqida shu kanalda xabar beramiz.")
            matn = "\n".join(q)
            if o["sinov"]:
                self.stdout.write(matn)
                continue
            if len(jadval) >= 3:
                holat, izoh = X.yubor(kanal_nomi(), matn)
                self.stdout.write(f"yakun posti: {holat} {izoh}")
            m.elon_at = timezone.now()
            m.save(update_fields=["elon_at"])
