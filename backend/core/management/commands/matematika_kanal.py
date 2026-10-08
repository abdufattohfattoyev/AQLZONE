"""
Kanaldagi matematika rukni (`core/matematika_kanal.py`).

    python manage.py matematika_kanal yigish          # lentalardan yangilik yig'adi (har 2 soatda)
    python manage.py matematika_kanal avto            # 10:00 — yangilik bo'lsa yangilik, bo'lmasa fakt
    python manage.py matematika_kanal fakt            # qiziq fakt
    python manage.py matematika_kanal misol --bosqich maktab   # kun misoli (boshlangich/maktab/oliy)
    python manage.py matematika_kanal misol           # uchala bosqich birdan
    python manage.py matematika_kanal javob           # bugungi misollarning javoblari — bitta post
    python manage.py matematika_kanal test            # kattalar uchun tez test — rasm + quiz
    python manage.py matematika_kanal albom           # haftalik albom — suriladigan kartalar
    python manage.py matematika_kanal avto --sinov   # yubormaydi, matnni ko'rsatadi
"""
from __future__ import annotations

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core import albom_kanal as AK
from core import matematika_kanal as MK
from core import xabar as X
from core.models import KanalYozuv


class Command(BaseCommand):
    help = "Kanalga matematika yangiligi, qiziq fakt yoki og'zaki misol joylaydi"

    def add_arguments(self, parser):
        parser.add_argument("tur", choices=["yigish", "avto", "fakt", "misol", "javob", "test", "albom"])
        parser.add_argument("--sinov", action="store_true", help="yubormaydi, faqat ko'rsatadi")
        parser.add_argument("--bosqich", choices=list(MK.BOSQICHLAR), default="",
                            help="kun misoli: boshlangich (1–4-sinf), maktab (5–11), oliy (1–4-kurs)")

    def _kanal(self) -> str:
        kanal = getattr(settings, "KANAL", "") or ""
        if not kanal or not settings.BOT_TOKEN:
            self.stderr.write(self.style.ERROR("KANAL yoki BOT_TOKEN sozlanmagan"))
            return ""
        return kanal if kanal.startswith(("@", "-")) else f"@{kanal}"

    def _misol(self, bosqich: str, sinov: bool) -> None:
        """
        Kun misoli — bitta bosqichniki (boshlang'ich / maktab / oliy): rasm,
        tugmasiz. O'quvchi javobini izohda yozadi.

        Post raqami `KanalYozuv` ga yoziladi (`misol:<sana>:<bosqich>`,
        raqam `manba` da) — kechki javoblar posti unga havola beradi va
        jadval ikki marta ishlasa ham o'sha misol ikkinchi bor chiqmaydi.
        """
        kun = timezone.localdate()
        misol = MK.bugungi_misol(bosqich, kun)
        kalit = f"misol:{kun}:{bosqich}"
        matn = MK.misol_posti(misol, kun)

        if sinov:
            self.stdout.write(matn)
            self.stdout.write(f"\n❓ {misol[1]}\nJavob: {misol[2]}\n💡 {misol[3]}")
            self.stdout.write(self.style.SUCCESS("(sinov — yuborilmadi)"))
            return
        if KanalYozuv.objects.filter(kalit=kalit).exists():
            self.stdout.write(f"bugungi misol ({bosqich}) allaqachon chiqqan")
            return
        kanal = self._kanal()
        if not kanal:
            return

        holat, izoh, xabar_id = X.rasm_yubor(kanal, MK.misol_rasmi(misol), matn)
        if holat != "yuborildi":
            self.stderr.write(self.style.ERROR(f"yuborilmadi: {holat} {izoh}"))
            return
        KanalYozuv.objects.create(
            kalit=kalit, tur=KanalYozuv.MISOL, sarlavha=misol[1][:300],
            manba=str(xabar_id), joylangan_at=timezone.now(),
        )
        self.stdout.write(self.style.SUCCESS(f"kanalga joylandi: misol {misol[0]} ({xabar_id})"))

    def _javob(self, sinov: bool) -> None:
        """
        Bugun CHIQQAN misollarning javoblari — bitta postda, har biri o'z
        savoliga havola bilan. Birorta misol chiqmagan bo'lsa (kanal
        ishlamadi) javob posti ham yo'q. `misol-javob:<sana>` — bir marta.
        """
        kun = timezone.localdate()
        kanal = getattr(settings, "KANAL", "") or ""
        kanal = kanal if kanal.startswith(("@", "-")) or not kanal else f"@{kanal}"
        chiqqanlar = []
        for bosqich, misol in MK.bugungi_misollar(kun).items():
            yozuv = KanalYozuv.objects.filter(kalit=f"misol:{kun}:{bosqich}").first()
            if yozuv or sinov:
                chiqqanlar.append((misol, MK.post_havolasi(kanal, yozuv.manba if yozuv else "")))
        matn = MK.javob_posti(chiqqanlar, kun)

        if sinov:
            self.stdout.write(matn)
            self.stdout.write(self.style.SUCCESS("(sinov — yuborilmadi)"))
            return
        if not chiqqanlar:
            self.stderr.write("bugun kun misoli chiqmagan — javob ham yo'q")
            return
        javob_kalit = f"misol-javob:{kun}"
        if KanalYozuv.objects.filter(kalit=javob_kalit).exists():
            self.stdout.write("bugungi javoblar allaqachon chiqqan")
            return
        kanal = self._kanal()
        if not kanal:
            return

        holat, izoh, xabar_id = X.kanal_matn(kanal, matn)
        if holat != "yuborildi":
            self.stderr.write(self.style.ERROR(f"yuborilmadi: {holat} {izoh}"))
            return
        KanalYozuv.objects.create(
            kalit=javob_kalit, tur=KanalYozuv.MISOL, sarlavha=f"javoblar {kun}",
            manba=str(xabar_id), joylangan_at=timezone.now(),
        )
        self.stdout.write(self.style.SUCCESS(f"kanalga joylandi: javoblar ({len(chiqqanlar)} ta)"))

    def _test(self, sinov: bool) -> None:
        """
        Tez test — savol rasmi, uning ostida quiz so'rovnoma (rasmga javob
        bo'lib). `test:<sana>` bir kunda ikkinchi marta chiqarmaydi.
        """
        kun = timezone.localdate()
        test = MK.bugungi_test(kun)
        _, savol, javob, usul, variantlar, togri = test
        kalit = f"test:{kun}"

        if sinov:
            self.stdout.write(MK.test_posti(test))
            self.stdout.write(f"\n❓ {savol}")
            for n, v in enumerate(variantlar):
                self.stdout.write(f"  {'✅' if n == togri else '▫️'} {v}")
            self.stdout.write(f"💡 {usul}")
            self.stdout.write(self.style.SUCCESS("(sinov — yuborilmadi)"))
            return
        if KanalYozuv.objects.filter(kalit=kalit).exists():
            self.stdout.write("bugungi test allaqachon chiqqan")
            return
        kanal = self._kanal()
        if not kanal:
            return

        # BITTA post: rasm so'rovnomaning ichida (Bot API 2026-05, `media`).
        # Ilgari rasm alohida post, so'rovnoma unga javob bo'lib chiqardi —
        # lentada ikkita xabar. Yuborilmasa — eski ikki postli yo'l.
        holat, izoh, _ = X.quiz_rasm_bilan(
            kanal, f"🎯 {savol}", MK.quiz_variantlari(test), togri, MK.test_rasmi(test), usul)
        if holat == "yuborildi":
            KanalYozuv.objects.create(
                kalit=kalit, tur=KanalYozuv.MISOL, sarlavha=savol[:300], manba="",
                joylangan_at=timezone.now(),
            )
            self.stdout.write(self.style.SUCCESS("kanalga joylandi: test (bitta post)"))
            return
        self.stderr.write(f"rasmli so'rovnoma o'tmadi ({izoh}) — ikki postli yo'l")

        holat, izoh, rasm_id = X.rasm_yubor(kanal, MK.test_rasmi(test), MK.test_posti(test))
        if holat != "yuborildi":
            self.stderr.write(self.style.ERROR(f"rasm yuborilmadi: {holat} {izoh}"))
            return
        KanalYozuv.objects.create(
            kalit=kalit, tur=KanalYozuv.MISOL, sarlavha=savol[:300],
            manba=str(rasm_id), joylangan_at=timezone.now(),
        )
        holat, izoh, _ = X.quiz_yubor(
            kanal, MK.QUIZ_SAVOLI, MK.quiz_variantlari(test), togri, usul, javob_id=rasm_id)
        if holat != "yuborildi":
            self.stderr.write(self.style.ERROR(f"so'rovnoma yuborilmadi: {holat} {izoh}"))
            return
        self.stdout.write(self.style.SUCCESS("kanalga joylandi: test"))

    def _albom(self, sinov: bool) -> None:
        """
        Haftalik albom — suriladigan kartalar (`core/albom_kanal.py`).
        Kuniga bitta: jadval ikki marta ishlasa ham ikkinchisi chiqmaydi.
        """
        albom = AK.keyingi_albom()
        if sinov:
            self.stdout.write(AK.albom_posti(albom))
            for nom, ifoda, pastki in albom["kartalar"]:
                self.stdout.write(f"  ▫️ {nom}: {ifoda!r} — {pastki}")
            self.stdout.write(self.style.SUCCESS("(sinov — yuborilmadi)"))
            return
        if AK.bugun_chiqdimi():
            self.stdout.write("bugungi albom allaqachon chiqqan")
            return
        kanal = self._kanal()
        if not kanal:
            return

        bot = (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")
        havola = f"https://t.me/{bot}?startapp" if bot else X.ilova_havolasi()
        holat, izoh, xabar_id = X.albom_yubor(
            kanal, AK.albom_rasmlari(albom), AK.albom_posti(albom),
            [("🧮 Mashq qilish", havola, X.KOK)])
        if holat != "yuborildi":
            self.stderr.write(self.style.ERROR(f"albom yuborilmadi: {holat} {izoh}"))
            return
        AK.albom_belgila(albom, xabar_id)
        self.stdout.write(self.style.SUCCESS(f"kanalga joylandi: albom {albom['kalit']} ({xabar_id})"))

    def handle(self, *args, **o):
        tur, sinov = o["tur"], o["sinov"]

        if tur == "albom":
            self._albom(sinov)
            return

        if tur == "test":
            self._test(sinov)
            return

        if tur == "yigish":
            n = MK.yigish()
            self.stdout.write(self.style.SUCCESS(f"yangi matematika yangiligi: {n} ta"))
            return

        if tur == "misol":
            # Bosqich berilmasa — uchalasi (qo'lda ishga tushirish uchun).
            for bosqich in ([o["bosqich"]] if o["bosqich"] else MK.BOSQICHLAR):
                self._misol(bosqich, sinov)
            return

        if tur == "javob":
            self._javob(sinov)
            return

        # Joylashdan OLDIN bir marta yig'amiz: ertalabgi yangilik
        # oxirgi yig'ishdan keyin chiqqan bo'lishi mumkin.
        if tur == "avto":
            try:
                MK.yigish()
            except Exception as e:  # yig'ish ishlamasa ham fakt chiqaveradi
                self.stderr.write(f"yig'ish xatosi: {e}")

        yangiliklar = MK.kutayotgan_yangiliklar() if tur == "avto" else []
        fakt = None
        if yangiliklar:
            matn = MK.yangilik_posti(yangiliklar)
        else:
            fakt = MK.keyingi_fakt()
            matn = MK.fakt_posti(fakt)

        if sinov:
            self.stdout.write(matn)
            self.stdout.write(self.style.SUCCESS("(sinov — yuborilmadi)"))
            return

        kanal = self._kanal()
        if not kanal:
            return

        # Postning ostida — ilovaga yo'l. Kanal o'quvchisi uchun keyingi
        # qadam aynan shu: o'qidi, endi o'zi yechib ko'rsin.
        #
        # `?startapp` (qiymatsiz) — Mini App'ni bosh sahifada ochadi.
        # Kanalda `web_app` tugmasi TAQIQLANGAN (Telegram uni faqat
        # shaxsiy chatda qabul qiladi), shuning uchun oddiy havola.
        bot = (getattr(settings, "BOT_USERNAME", "") or "").lstrip("@")
        havola = f"https://t.me/{bot}?startapp" if bot else X.ilova_havolasi()
        holat, izoh = X.yubor(kanal, matn, tugma="🧮 Mashq qilish", havola=havola)
        if holat != "yuborildi":
            self.stderr.write(self.style.ERROR(f"yuborilmadi: {holat} {izoh}"))
            return

        hozir = timezone.now()
        if yangiliklar:
            KanalYozuv.objects.filter(pk__in=[y.pk for y in yangiliklar]).update(joylangan_at=hozir)
        if fakt:
            MK.fakt_belgila(fakt)
        self.stdout.write(self.style.SUCCESS(
            f"kanalga joylandi: {'yangilik' if yangiliklar else 'fakt'}"))
