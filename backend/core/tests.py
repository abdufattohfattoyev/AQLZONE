"""
Aql Zone — API testlari.

    python manage.py test

Diqqat qaratilgan joylar: kirish, progressni BIRLASHTIRISH (eng nozik qism —
bu yerda xato bo'lsa bolaning natijasi yo'qoladi) va begona kalitlarni rad etish.
"""
import hashlib
import hmac
import json
import threading
from datetime import timedelta
from io import StringIO
import time
from unittest.mock import patch
from urllib.parse import urlencode

from django.conf import settings
from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase, TransactionTestCase, override_settings
from django.core import signing
from django.utils import timezone

from . import auth as A
from . import boshqaruv
from .matn import M
from . import duel as D
from . import xabar
from . import liga as L
from . import masala as MS
from . import reklama as R
from . import views
from . import masala_kanal as MK
from .models import (
    Duel, Identity, KirishKodi, LessonResult, LigaAzo, Masala, MasalaKorish,
    MasalaOvoz, MasalaUrinish, Profile, Progress, Pupil, Reklama, ReklamaQabul,
    Session,
)

BOT = "123456:TEST_TOKEN_FAQAT_SINOV_UCHUN"


def init_data(user_id: int = 777, first_name: str = "Ali", *, auth_date: int | None = None) -> str:
    """
    Haqiqiy Telegram initData'ni bot tokeni bilan imzolab yasaydi.

    `signature` ATAYLAB shu yerda turibdi. Telegram uni har bir Mini App
    ochilishida yuboradi VA hash hisobiga qo'shadi. Sinovda u bo'lmaganida
    kod "signature'ni tashla" degan xato bilan ham yashil o'tardi, ishlab
    turgan saytda esa har bir kirish 401 bo'lardi — aynan shunday bo'lgan.
    """
    juftlar = {
        "auth_date": str(auth_date if auth_date is not None else int(time.time())),
        "query_id": "AAH",
        "signature": "SINOV_Ed25519_IMZOSI",
        "user": json.dumps({"id": user_id, "first_name": first_name}, separators=(",", ":")),
    }
    dcs = "\n".join(f"{k}={v}" for k, v in sorted(juftlar.items()))
    secret = hmac.new(b"WebAppData", BOT.encode(), hashlib.sha256).digest()
    juftlar["hash"] = hmac.new(secret, dcs.encode(), hashlib.sha256).hexdigest()
    return urlencode(juftlar)


def widget_data(
    user_id: int = 777,
    first_name: str = "Ali",
    last_name: str = "Valiyev",
    *,
    auth_date: int | None = None,
) -> dict:
    """
    Veb saytdagi Login Widget yuboradigan obyekt, haqiqiy imzo bilan.

    Diqqat: kalit Mini App'nikidan BOSHQACHA yasaladi — sha256(token),
    HMAC emas. Aynan shu farq alohida funksiyaning sababi.
    """
    d = {
        "id": str(user_id),
        "first_name": first_name,
        "last_name": last_name,
        "username": "aliv",
        "auth_date": str(auth_date if auth_date is not None else int(time.time())),
    }
    dcs = "\n".join(f"{k}={d[k]}" for k in sorted(d))
    secret = hashlib.sha256(BOT.encode()).digest()
    d["hash"] = hmac.new(secret, dcs.encode(), hashlib.sha256).hexdigest()
    return d


class ApiTest(TestCase):
    DEVICE = "dev-0123456789abcdef0123"

    def kir(self, device: str | None = None) -> str:
        r = self.client.post(
            "/api/v1/auth/device",
            {"deviceId": device or self.DEVICE, "platform": "web"},
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 200, r.content)
        return r.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    # ------------------------------------------------------------ kirish

    def test_health(self):
        r = self.client.get("/api/health")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()["ok"])

    def test_qurilma_kirishi_bir_xil_bolani_qaytaradi(self):
        self.kir()
        self.kir()
        self.assertEqual(
            Identity.objects.filter(provider="device", external_id=self.DEVICE).count(), 1
        )

    def test_qisqa_device_id_rad_etiladi(self):
        r = self.client.post(
            "/api/v1/auth/device", {"deviceId": "qisqa"}, content_type="application/json"
        )
        self.assertEqual(r.status_code, 400)

    def test_tokensiz_kirish_taqiqlanadi(self):
        self.assertEqual(self.client.get("/api/v1/progress").status_code, 401)
        self.assertEqual(
            self.client.get("/api/v1/progress", HTTP_AUTHORIZATION="Bearer yolgon").status_code,
            401,
        )

    # ---------------------------------------------------------- progress

    def test_progress_saqlanadi_va_qaytariladi(self):
        t = self.kir()
        holat = {"azapp_grade1_v1": json.dumps({"stars": 12, "coins": 40, "done": {"0-0": 3}})}
        r = self.client.put(
            "/api/v1/progress", {"state": holat}, content_type="application/json", **self.auth(t)
        )
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()["stars"], 12)

        r = self.client.get("/api/v1/progress", **self.auth(t))
        self.assertEqual(r.json()["state"], holat)

    def test_boshqa_kursni_saqlash_avvalgisini_ochirmaydi(self):
        t = self.kir()
        bir = json.dumps({"stars": 5, "coins": 0, "done": {}})
        tort = json.dumps({"stars": 9, "coins": 0, "done": {}})
        self.client.put("/api/v1/progress", {"state": {"azapp_grade1_v1": bir}},
                        content_type="application/json", **self.auth(t))
        self.client.put("/api/v1/progress", {"state": {"azapp_grade4_v1": tort}},
                        content_type="application/json", **self.auth(t))

        holat = self.client.get("/api/v1/progress", **self.auth(t)).json()
        self.assertEqual(set(holat["state"]), {"azapp_grade1_v1", "azapp_grade4_v1"})
        self.assertEqual(holat["stars"], 14)

    def test_begona_kalit_qabul_qilinmaydi(self):
        t = self.kir()
        r = self.client.put(
            "/api/v1/progress",
            {"state": {"begona_kalit": "x", "azapp_grade1_v1": json.dumps({"stars": 1})}},
            content_type="application/json", **self.auth(t),
        )
        self.assertEqual(r.json()["qabul"], 1)
        self.assertEqual(list(Progress.objects.get().state), ["azapp_grade1_v1"])

    # ----------------------------------------------------------- natija

    def test_natija_chegaralanadi(self):
        t = self.kir()
        r = self.client.post(
            "/api/v1/results",
            {"grade": 1, "unit": 0, "lesson": 2, "lessonName": "Sonlar nuri",
             "asked": 6, "correct": 99, "mistakes": 1, "stars": 7},
            content_type="application/json", **self.auth(t),
        )
        self.assertEqual(r.status_code, 201, r.content)
        n = LessonResult.objects.get()
        self.assertEqual(n.correct, 6)   # savoldan ko'p bo'lmaydi
        self.assertEqual(n.stars, 3)     # 3 dan oshmaydi

    def test_summary_aniqlikni_hisoblaydi(self):
        t = self.kir()
        for togri in (6, 3):
            self.client.post(
                "/api/v1/results",
                {"grade": 1, "unit": 0, "lesson": 0, "asked": 6, "correct": togri, "stars": 2},
                content_type="application/json", **self.auth(t),
            )
        j = self.client.get("/api/v1/summary", **self.auth(t)).json()["jami"]
        self.assertEqual((j["darslar"], j["savollar"], j["togri"], j["aniqlik"]), (2, 12, 9, 75))


    # --------------------------------------------------------- Telegram

    @override_settings(BOT_TOKEN=BOT)
    def test_telegram_kirishi(self):
        r = self.client.post("/api/v1/auth/telegram", {"initData": init_data()},
                             content_type="application/json")
        self.assertEqual(r.status_code, 200, r.content)
        self.assertTrue(r.json()["user"]["telegram"])

    @override_settings(BOT_TOKEN=BOT)
    def test_buzilgan_imzo_rad_etiladi(self):
        buzuq = init_data()[:-1] + ("0" if init_data()[-1] != "0" else "1")
        r = self.client.post("/api/v1/auth/telegram", {"initData": buzuq},
                             content_type="application/json")
        self.assertEqual(r.status_code, 401)

    @override_settings(BOT_TOKEN=BOT)
    def test_eskirgan_initdata_rad_etiladi(self):
        eski = init_data(auth_date=int(time.time()) - 3 * 24 * 3600)
        r = self.client.post("/api/v1/auth/telegram", {"initData": eski},
                             content_type="application/json")
        self.assertEqual(r.status_code, 401)

    @override_settings(BOT_TOKEN=BOT)
    def test_boglashda_progress_kamaymaydi(self):
        """Anonim hisobda ko'proq yulduz bo'lsa, Telegram hisobiga o'sha ko'chadi."""
        tg_token = self.client.post("/api/v1/auth/telegram", {"initData": init_data()},
                                    content_type="application/json").json()["token"]
        self.client.put(
            "/api/v1/progress",
            {"state": {"azapp_grade1_v1": json.dumps({"stars": 4})}},
            content_type="application/json", **self.auth(tg_token),
        )

        qurilma = self.kir()
        self.client.put(
            "/api/v1/progress",
            {"state": {"azapp_grade1_v1": json.dumps({"stars": 20}),
                       "azapp_grade2_v1": json.dumps({"stars": 6})}},
            content_type="application/json", **self.auth(qurilma),
        )
        self.client.post("/api/v1/results", {"grade": 1, "asked": 6, "correct": 6, "stars": 3},
                         content_type="application/json", **self.auth(qurilma))

        r = self.client.post("/api/v1/auth/link", {"initData": init_data()},
                             content_type="application/json", **self.auth(qurilma))
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()["holat"], "birlashtirildi")

        # Anonim token endi Telegram hisobiga ishlashi kerak — qayta kirish shart emas.
        holat = self.client.get("/api/v1/progress", **self.auth(qurilma)).json()
        self.assertEqual(json.loads(holat["state"]["azapp_grade1_v1"])["stars"], 20)
        self.assertEqual(holat["stars"], 26)
        self.assertEqual(Pupil.objects.count(), 1)
        self.assertEqual(
            LessonResult.objects.filter(
                profile__pupil__identities__provider="telegram",
                profile__pupil__identities__external_id="777",
            ).count(),
            1,
        )


class ProfilTest(TestCase):
    """Bir qurilma — bir necha bola."""

    DEVICE = "dev-profil-0123456789abcd"

    def kir(self) -> str:
        r = self.client.post(
            "/api/v1/auth/device",
            {"deviceId": self.DEVICE, "platform": "web"},
            content_type="application/json",
        )
        return r.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def test_kirishda_bitta_profil_yaratiladi(self):
        token = self.kir()
        r = self.client.get("/api/v1/profiles", **self.auth(token))
        self.assertEqual(len(r.json()["profillar"]), 1)

    def test_ikki_bolaning_progressi_aralashmaydi(self):
        token = self.kir()
        birinchi = self.client.get("/api/v1/profiles", **self.auth(token)).json()["profillar"][0]

        r = self.client.post(
            "/api/v1/profiles", {"ism": "Zilola"},
            content_type="application/json", **self.auth(token),
        )
        self.assertEqual(r.status_code, 201, r.content)
        ikkinchi = r.json()["profil"]

        # Har biriga boshqa progress yozamiz
        for profil, yulduz in ((birinchi, 5), (ikkinchi, 11)):
            self.client.post(
                "/api/v1/progress",
                {
                    "profileId": profil["id"],
                    "state": {"azapp_grade1_v1": json.dumps({"stars": yulduz})},
                },
                content_type="application/json", **self.auth(token),
            )

        for profil, yulduz in ((birinchi, 5), (ikkinchi, 11)):
            holat = self.client.get(
                f"/api/v1/progress?profileId={profil['id']}", **self.auth(token)
            ).json()
            self.assertEqual(holat["stars"], yulduz)

    def test_begona_profilga_yozib_bolmaydi(self):
        # Boshqa hisobning profili — id to'g'ri bo'lsa ham tegib bo'lmasin.
        boshqa = Pupil.objects.create()
        begona = boshqa.asosiy_profil()

        token = self.kir()
        self.client.post(
            "/api/v1/progress",
            {"profileId": begona.pk, "state": {"azapp_grade1_v1": json.dumps({"stars": 9})}},
            content_type="application/json", **self.auth(token),
        )
        # Begona profil o'zgarmagan bo'lishi kerak
        self.assertFalse(Progress.objects.filter(profile=begona).exists())

    def test_oxirgi_profilni_ochirib_bolmaydi(self):
        token = self.kir()
        pid = self.client.get("/api/v1/profiles", **self.auth(token)).json()["profillar"][0]["id"]
        r = self.client.delete(f"/api/v1/profiles/{pid}", **self.auth(token))
        self.assertEqual(r.status_code, 400)

    def test_profilsiz_soruv_ham_ishlaydi(self):
        """Eski mijozlar profileId yubormaydi — ular buzilmasligi kerak."""
        token = self.kir()
        r = self.client.post(
            "/api/v1/progress",
            {"state": {"azapp_grade1_v1": json.dumps({"stars": 3})}},
            content_type="application/json", **self.auth(token),
        )
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(self.client.get("/api/v1/progress", **self.auth(token)).json()["stars"], 3)


class EslatmaTest(TestCase):
    """
    Eslatma buyrug'i kimni tanlashi.

    Bu mantiq kuniga bir marta, jimgina ishlaydi — xatosi darhol
    ko'rinmaydi, shuning uchun test bilan qotirilgan.
    """

    def kim(self) -> str:
        chiqish = StringIO()
        call_command("eslatma", "--sinov", stdout=chiqish)
        return chiqish.getvalue()

    def hisob(self, tg_id: str, ism: str):
        pupil = Pupil.objects.create(first_name=ism)
        Identity.objects.create(pupil=pupil, provider="telegram", external_id=tg_id)
        return pupil, pupil.asosiy_profil()

    def natija(self, profil, kunlar_oldin: int):
        r = LessonResult.objects.create(profile=profil, asked=6, correct=6, stars=3)
        # `created_at` da default bor, shuning uchun yaratgandan keyin suramiz.
        LessonResult.objects.filter(pk=r.pk).update(
            created_at=timezone.now() - timedelta(days=kunlar_oldin)
        )

    def test_bugun_oynamagan_faol_bola_tanlanadi(self):
        _, profil = self.hisob("111", "Ali")
        self.natija(profil, 3)
        self.assertIn("Ali", self.kim())

    def test_bugun_oynagan_bolaga_yozilmaydi(self):
        _, profil = self.hisob("222", "Zilola")
        self.natija(profil, 0)
        self.assertNotIn("Zilola", self.kim())

    def test_tashlab_ketganga_yozilmaydi(self):
        """20 kundan beri yo'q — bu spam bo'lardi."""
        _, profil = self.hisob("333", "Kamol")
        self.natija(profil, 20)
        self.assertNotIn("Kamol", self.kim())

    def test_hech_qachon_oynamaganga_yozilmaydi(self):
        self.hisob("444", "Yangi")
        self.assertNotIn("Yangi", self.kim())

    def test_telegramsiz_hisob_chetlab_otiladi(self):
        pupil = Pupil.objects.create(first_name="Anonim")
        Identity.objects.create(pupil=pupil, provider="device", external_id="dev-x" * 5)
        self.natija(pupil.asosiy_profil(), 2)
        self.assertNotIn("Anonim", self.kim())

    def test_bloklaganga_yozilmaydi(self):
        """Bloklagan odamga urinish — vaqt va soxta "xato" raqami."""
        pupil, profil = self.hisob("555", "Bloklagan")
        self.natija(profil, 2)
        Pupil.objects.filter(pk=pupil.pk).update(bot_bloklandi_at=timezone.now())
        self.assertNotIn("Bloklagan", self.kim())

    def test_bugun_allaqachon_yuborilgan_bolsa_takrorlanmaydi(self):
        pupil, profil = self.hisob("666", "Takror")
        self.natija(profil, 2)
        self.assertIn("Takror", self.kim())          # hali yuborilmagan
        Pupil.objects.filter(pk=pupil.pk).update(eslatma_at=timezone.now())
        self.assertNotIn("Takror", self.kim())

    def test_kechagi_eslatma_bugungisiga_halaqit_bermaydi(self):
        pupil, profil = self.hisob("777", "Kecha")
        self.natija(profil, 2)
        Pupil.objects.filter(pk=pupil.pk).update(
            eslatma_at=timezone.now() - timedelta(days=1)
        )
        self.assertIn("Kecha", self.kim())

    # ------------------------------------------------------------- matn

    def test_zanjiri_borga_zanjir_haqida_yoziladi(self):
        """Yo'qotish qo'rquvi — qaytarishning eng kuchli sababi."""
        _, profil = self.hisob("888", "Zanjirli")
        for kun in (1, 2, 3):
            self.natija(profil, kun)
        chiqish = self.kim()
        self.assertIn("zanjiring 3 kun", chiqish.lower())

    def test_soat_mos_kelmasa_jim_chiqadi(self):
        """
        Cron soat sayin chaqiradi — vaqt mintaqasi chalkashligi bo'lmasin
        uchun. Belgilangan soat kelmaguncha hech kimga yozilmaydi.
        """
        _, profil = self.hisob("1717", "Soatli")
        self.natija(profil, 2)
        boshqa_soat = (timezone.localtime().hour + 5) % 24

        chiqish = StringIO()
        call_command("eslatma", "--sinov", "--soat", str(boshqa_soat), stdout=chiqish)
        self.assertNotIn("Soatli", chiqish.getvalue())

        chiqish = StringIO()
        call_command(
            "eslatma", "--sinov", "--soat", str(timezone.localtime().hour), stdout=chiqish
        )
        self.assertIn("Soatli", chiqish.getvalue())

    def test_standart_nom_ismga_aylanmaydi(self):
        """
        "Men" — profilning standart nomi. Xabarga tushsa "Men, zanjiring
        uzilib qoladi" degan ma'nosiz gap chiqardi.
        """
        pupil = Pupil.objects.create(first_name="")
        Identity.objects.create(pupil=pupil, provider="telegram", external_id="1515")
        profil = pupil.asosiy_profil()
        self.assertEqual(profil.name, "Men")         # standart nom
        self.natija(profil, 2)

        chiqish = self.kim()
        self.assertIn("Do'stim", chiqish)
        self.assertNotIn("Men,", chiqish)

    def test_haqiqiy_ism_ishlatiladi(self):
        _, profil = self.hisob("1616", "Malika")
        self.natija(profil, 2)
        self.assertIn("Malika", self.kim())

    def test_zanjiri_yoqqa_oddiy_matn(self):
        _, profil = self.hisob("999", "Zanjirsiz")
        self.natija(profil, 4)                       # kecha o'ynamagan
        self.assertNotIn("zanjiring", self.kim().lower())

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_xabarda_ilovaga_tugma_boladi(self, sorov):
        _, profil = self.hisob("1212", "Tugmali")
        self.natija(profil, 2)
        with self.settings(BOT_TOKEN="sinov:token", MINI_APP_URL="https://aql-zone.uz"):
            call_command("eslatma", stdout=StringIO())
        tugma = sorov.call_args[0][1]["reply_markup"]["inline_keyboard"][0][0]
        self.assertEqual(tugma["text"], "Mashq qilish")
        # Ilova BOT ICHIDA ochiladi — brauzerga chiqarib yuboradigan
        # oddiy havola emas.
        self.assertEqual(tugma["web_app"], {"url": "https://aql-zone.uz"})
        self.assertNotIn("url", tugma)

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_mini_app_yoq_bolsa_oddiy_havola(self, sorov):
        """
        `MINI_APP_URL` sozlanmagan bo'lsa tugma bot havolasiga tushadi —
        va `t.me/...` ni Mini App qilib ochib bo'lmaydi.

        `BOT_USERNAME` SHU YERDA beriladi. U sozlamada muhit
        o'zgaruvchisidan olinadi va bo'sh bo'lsa `bot_havolasi()` bo'sh
        satr qaytaradi — tugma umuman yasalmaydi va sinov `reply_markup`
        yo'qligidan yiqiladi. Ya'ni sinov mashinada `BOT_USERNAME` bor
        yoki yo'qligiga qarab yashil/qizil bo'lardi.
        """
        _, profil = self.hisob("1515", "Havolali")
        self.natija(profil, 2)
        with self.settings(
            BOT_TOKEN="sinov:token", BOT_USERNAME="aqlzone_bot",
            MINI_APP_URL="", SAYT_URL="",
        ):
            call_command("eslatma", stdout=StringIO())
        tugma = sorov.call_args[0][1]["reply_markup"]["inline_keyboard"][0][0]
        self.assertNotIn("web_app", tugma)
        self.assertTrue(tugma["url"].startswith("https://t.me/"))

    @patch("core.xabar._sorov", return_value=(False, 403, "bot was blocked by the user"))
    def test_bloklagani_aniqlansa_belgilanadi(self, sorov):
        pupil, profil = self.hisob("1313", "Yangi bloklagan")
        self.natija(profil, 2)
        with self.settings(BOT_TOKEN="sinov:token"):
            call_command("eslatma", stdout=StringIO())
        pupil.refresh_from_db()
        self.assertIsNotNone(pupil.bot_bloklandi_at)

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_yuborilgach_sana_yoziladi(self, sorov):
        pupil, profil = self.hisob("1414", "Sanali")
        self.natija(profil, 2)
        with self.settings(BOT_TOKEN="sinov:token"):
            call_command("eslatma", stdout=StringIO())
        pupil.refresh_from_db()
        self.assertIsNotNone(pupil.eslatma_at)
        # Ikkinchi chaqiruv hech kimga bormaydi.
        sorov.reset_mock()
        with self.settings(BOT_TOKEN="sinov:token"):
            call_command("eslatma", stdout=StringIO())
        self.assertEqual(sorov.call_count, 0)


class AdminXabariTest(TestCase):
    """
    Yangi ro'yxatdan o'tgan odam haqida adminga ketadigan xabar.

    Xabar FON OQIMIDA yuboriladi, sinovda esa natija darhol kerak —
    shuning uchun `threading.Thread` o'rniga vazifani joyida bajaradigan
    soxta sinf qo'yiladi. Oqimni kutib o'tirish (`join`) ham mumkin edi,
    lekin unda test vaqtga bog'liq bo'lib qolardi.
    """

    class DarholOqim:
        def __init__(self, target=None, daemon=None, **kw):
            self._target = target

        def start(self):
            self._target()

    def royxatdan_otkaz(self, ism="Abdufattoh", familiya="Fattoyev"):
        pupil = Pupil.objects.create(first_name=ism, last_name=familiya)
        Identity.objects.create(
            pupil=pupil, provider=Identity.TELEGRAM, external_id=f"tg-{pupil.pk}"
        )
        return pupil

    def sozlama(self):
        return self.settings(ADMIN_TG=["555", "777"], BOT_TOKEN="sinov:token", TESTDA=False)

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_royxat_yopilganda_adminga_ketadi(self, sorov):
        pupil = self.royxatdan_otkaz()
        with self.sozlama(), patch("threading.Thread", self.DarholOqim):
            self.assertTrue(pupil.royxatni_yop())

        # Ikkala adminga ham bordi.
        self.assertEqual(sorov.call_count, 2)
        self.assertEqual(
            {c[0][1]["chat_id"] for c in sorov.call_args_list}, {"555", "777"}
        )

        matn = sorov.call_args[0][1]["text"]
        self.assertIn("Yangi foydalanuvchi", matn)
        self.assertIn("Abdufattoh Fattoyev", matn)
        self.assertIn("Telegram", matn)          # kirish usuli
        self.assertIn("Jami ro‘yxatdan o‘tganlar: <b>1</b>", matn)
        self.assertIn("Bugun: <b>1</b>", matn)

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_sanoq_haqiqiy_songa_teng(self, sorov):
        with self.sozlama(), patch("threading.Thread", self.DarholOqim):
            self.royxatdan_otkaz("Bir", "Birov").royxatni_yop()
            self.royxatdan_otkaz("Ikki", "Ikkov").royxatni_yop()
        self.assertIn("Jami ro‘yxatdan o‘tganlar: <b>2</b>", sorov.call_args[0][1]["text"])

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_takror_chaqiruvda_xabar_takrorlanmaydi(self, sorov):
        pupil = self.royxatdan_otkaz()
        with self.sozlama(), patch("threading.Thread", self.DarholOqim):
            pupil.royxatni_yop()
            sorov.reset_mock()
            # Ikkinchi chaqiruv `False` qaytaradi — ro'yxat allaqachon yopiq.
            self.assertFalse(pupil.royxatni_yop())
        self.assertEqual(sorov.call_count, 0)

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_familiyasiz_ham_royxat_yopiladi(self, sorov):
        """
        Familiya shart emas — Telegram'da u ixtiyoriy.

        Ilgari bunday odam ro'yxatdan o'tmagan hisoblanardi va botdan
        kelganida darhol ism so'raydigan formaga tushardi.
        """
        pupil = Pupil.objects.create(first_name="Yolg‘iz", last_name="")
        with self.sozlama(), patch("threading.Thread", self.DarholOqim):
            self.assertTrue(pupil.royxatni_yop())
        # Ikkita admin sozlangan — har biriga bittadan xabar.
        self.assertEqual(sorov.call_count, 2)

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_ismsiz_hisob_royxatdan_otmaydi(self, sorov):
        """Ismi yo'q hisob — hali hech kim: xabar ham yuborilmaydi."""
        pupil = Pupil.objects.create(first_name="", last_name="Familiya")
        with self.sozlama(), patch("threading.Thread", self.DarholOqim):
            self.assertFalse(pupil.royxatni_yop())
        self.assertEqual(sorov.call_count, 0)

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_admin_sozlanmagan_serverda_jim(self, sorov):
        pupil = self.royxatdan_otkaz()
        with self.settings(ADMIN_TG=[], BOT_TOKEN="sinov:token", TESTDA=False), \
             patch("threading.Thread", self.DarholOqim):
            pupil.royxatni_yop()
        self.assertEqual(sorov.call_count, 0)

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_ismdagi_belgi_xabarni_buzmaydi(self, sorov):
        """HTML rejimida yuboriladi — ism ichidagi `<` qochirilishi shart."""
        pupil = self.royxatdan_otkaz("<b>Ali", "Valiyev")
        with self.sozlama(), patch("threading.Thread", self.DarholOqim):
            pupil.royxatni_yop()
        matn = sorov.call_args[0][1]["text"]
        self.assertIn("&lt;b&gt;Ali Valiyev", matn)


class SpaTest(TestCase):
    def test_notogri_api_yol_404(self):
        # /api/ ostidagi noma'lum yo'l SPA'ga tushib ketmasligi kerak.
        self.assertEqual(self.client.get("/api/v1/yoq").status_code, 404)


@override_settings(RAQAM_MAJBURIY_DAN="2020-01-01")
class BotTest(TestCase):
    """
    Bot mantiqi — Telegram'ga chiqmasdan.

    `yangilikni_qayta_ishla()` tarmoqdan mustaqil yozilgan, shuning uchun
    faqat yuborish funksiyalari almashtiriladi. Shu sabab bu testlar
    internetsiz ham, BotFather tokenisiz ham ishlaydi.
    """

    def setUp(self):
        from core.management.commands import bot

        self.bot = bot
        self.yuborilgan: list[dict] = []
        self._eski = bot.api
        bot.api = lambda usul, **p: (
            self.yuborilgan.append({"usul": usul, **p}) or {"ok": True}
        )

        # Raqam MAJBURIY bo'lgani uchun sinov hisobida u BOR deb
        # olinadi: bu klass botning qolgan mantig'ini tekshiradi,
        # darvozaning o'zi esa `RaqamMajburiyTest` da.
        # `til` ATAYLAB bo'sh: bu klassda Telegram tili bo'yicha
        # tekshiruvlar bor va hisobda til turgan bo'lsa u ustun
        # chiqib, ruscha xabar o'zbekcha bo'lib qolardi.
        pupil = Pupil.objects.create(first_name="Olim", last_name="Salimov", til="")
        Identity.objects.create(pupil=pupil, provider=Identity.TELEGRAM,
                                external_id="555")
        Identity.objects.create(pupil=pupil, provider=Identity.TELEFON,
                                external_id="+998900000555")

    def tearDown(self):
        self.bot.api = self._eski

    # --- yordamchilar ---

    def xabar(self, matn: str, tg_id: int = 555):
        return {
            "update_id": 1,
            "message": {
                "chat": {"id": tg_id},
                "from": {"id": tg_id, "first_name": "Olim", "last_name": "Salimov"},
                "text": matn,
            },
        }

    def kontakt(self, raqam: str, tg_id: int = 555, egasi: int | None = None):
        return {
            "update_id": 2,
            "message": {
                "chat": {"id": tg_id},
                "from": {"id": tg_id, "first_name": "Olim", "last_name": "Salimov"},
                "contact": {
                    "phone_number": raqam,
                    "user_id": tg_id if egasi is None else egasi,
                },
            },
        }

    def matnlar(self) -> str:
        return " | ".join(str(x.get("text", "")) for x in self.yuborilgan)

    # --- testlar ---

    @override_settings(SAYT_URL="https://aql-zone.uz")
    def test_start_kirish_havolasini_yuboradi(self):
        self.bot.yangilikni_qayta_ishla(self.xabar("/start"))
        tugma = self.yuborilgan[0]["reply_markup"]["inline_keyboard"][0][0]
        self.assertIn("Saytga kirish", tugma["text"])
        self.assertTrue(tugma["url"].startswith("https://aql-zone.uz/kirish/"))
        self.assertIn("Aql Zone", self.matnlar())

        # Havoladagi kod HAQIQATDA ishlashi kerak — bazada uning xeshi
        # turibdi. Bu tekshiruvsiz bot chiroyli havola yuborib, sayt esa
        # "havola ishlamadi" deb turaverardi.
        kod = tugma["url"].rsplit("/", 1)[1]
        pupil = A.kod_bilan_kir(kod)
        self.assertIsNotNone(pupil)
        self.assertEqual(pupil.kirish(Identity.TELEGRAM), "555")

    @override_settings(SAYT_URL="https://aql-zone.uz")
    def test_start_eski_havolani_bekor_qiladi(self):
        """Ikkinchi /start — birinchi havola endi ishlamasligi kerak."""
        self.bot.yangilikni_qayta_ishla(self.xabar("/start"))
        eski = self.yuborilgan[0]["reply_markup"]["inline_keyboard"][0][0]["url"]
        self.yuborilgan.clear()
        self.bot.yangilikni_qayta_ishla(self.xabar("/start"))

        self.assertIsNone(A.kod_bilan_kir(eski.rsplit("/", 1)[1]))

    @override_settings(SAYT_URL="")
    def test_start_sayt_manzilisiz_raqam_soraydi(self):
        """SAYT_URL yo'q — havola yasab bo'lmaydi, jim turmaymiz."""
        self.bot.yangilikni_qayta_ishla(self.xabar("/start"))
        tugma = self.yuborilgan[0]["reply_markup"]["keyboard"][0][0]
        self.assertTrue(tugma["request_contact"])
        self.assertIn("SAYT_URL", self.matnlar())

    def test_raqam_buyrogi_kontakt_soraydi(self):
        self.bot.yangilikni_qayta_ishla(self.xabar("/raqam"))
        tugma = self.yuborilgan[0]["reply_markup"]["keyboard"][0][0]
        self.assertTrue(tugma["request_contact"])

    def test_kontakt_hisob_yasaydi_va_raqamni_saqlaydi(self):
        self.bot.yangilikni_qayta_ishla(self.kontakt("+998 90 123 45 67"))
        kirish = Identity.objects.get(provider="phone")
        # Bo'shliqlar tozalanadi, aks holda bir odam ikki xil yozuvda
        # ikki hisob ochib olardi.
        self.assertEqual(kirish.external_id, "+998901234567")
        self.assertEqual(kirish.pupil.first_name, "Olim")
        self.assertEqual(kirish.pupil.last_name, "Salimov")

    def test_raqam_turli_yozuvda_bir_xil_boladi(self):
        self.bot.yangilikni_qayta_ishla(self.kontakt("998901234567"))
        self.bot.yangilikni_qayta_ishla(self.kontakt("+998901234567"))
        self.assertEqual(Identity.objects.filter(provider="phone").count(), 1)

    def test_begona_kontakt_rad_etiladi(self):
        """Boshqa odamning vizitkasini yuborib bo'lmaydi."""
        self.bot.yangilikni_qayta_ishla(self.kontakt("+998901112233", egasi=999))
        self.assertFalse(
            Identity.objects.filter(provider="phone", external_id="+998901112233").exists()
        )
        self.assertIn("o'z raqamingizni", self.matnlar())

    def test_qolda_kiritilgan_ism_bot_tomonidan_ozgarmaydi(self):
        """Foydalanuvchi ismini o'zi yozgan bo'lsa, bot uni qayta yozmaydi."""
        self.bot.yangilikni_qayta_ishla(self.kontakt("+998901234567"))
        pupil = Identity.objects.get(provider="phone").pupil
        pupil.first_name, pupil.last_name = "Shahnoza", "Karimova"
        pupil.ism_qolda = True
        pupil.save()

        self.bot.yangilikni_qayta_ishla(self.kontakt("+998901234567"))
        pupil.refresh_from_db()
        self.assertEqual(pupil.first_name, "Shahnoza")
        self.assertEqual(pupil.last_name, "Karimova")

    def test_raqam_almashsa_eskisi_qoladi_yangisi_ulanadi(self):
        self.bot.yangilikni_qayta_ishla(self.kontakt("+998901111111"))
        self.bot.yangilikni_qayta_ishla(self.kontakt("+998902222222"))
        raqamlar = list(
            Identity.objects.filter(provider="phone").values_list("external_id", flat=True)
        )
        self.assertEqual(raqamlar, ["+998902222222"])
        self.assertEqual(Pupil.objects.count(), 1)

    def test_notanish_xabar_yonaltiradi(self):
        self.bot.yangilikni_qayta_ishla(self.xabar("salom"))
        self.assertIn("/start", self.matnlar())

    # ------------------------------------------------ doimiy klaviatura

    #: Mini App sozlangan holat — doimiy klaviatura faqat shunda chiziladi.
    ILOVA = dict(MINI_APP_URL="https://aql-zone.uz", SAYT_URL="https://aql-zone.uz")

    def klaviatura(self) -> list[list[dict]]:
        """Yuborilgan xabarlardagi ENG OXIRGI doimiy klaviatura."""
        for x in reversed(self.yuborilgan):
            k = (x.get("reply_markup") or {}).get("keyboard")
            if k:
                return k
        return []

    @override_settings(**ILOVA)
    def test_start_doimiy_klaviatura_yuboradi(self):
        """
        Tugmalar suhbat ostida qoladi.

        Ilgari bot faqat buyruqni tushunardi va ularni hech qayerda
        ko'rsatmasdi: `/oyinlar` deb yozgan odam "Boshlash uchun /start
        yuboring" degan javob olardi.
        """
        self.bot.yangilikni_qayta_ishla(self.xabar("/start"))
        k = self.klaviatura()
        matnlar = [t["text"] for qator in k for t in qator]
        self.assertIn("🎮 O'yinlar", matnlar)
        self.assertIn("🎓 Darslar", matnlar)

        # Tugma ILOVANI O'ZI ochadi — oraliq "Ochish" xabari yo'q.
        oyin = next(t for qator in k for t in qator if "O'yinlar" in t["text"])
        self.assertEqual(oyin["web_app"]["url"], "https://aql-zone.uz/oyinlar")

        # Eski klaviatura ekranda qolgan odamlar uchun matnli yo'l ham
        # ishlayveradi: bot javobida inline tugma qaytaradi.
        self.yuborilgan.clear()
        self.bot.yangilikni_qayta_ishla(self.xabar("🎮 O'yinlar"))
        ichki = [
            t for x in self.yuborilgan
            for q in (x.get("reply_markup") or {}).get("inline_keyboard", [])
            for t in q
        ]
        self.assertEqual(ichki[0]["web_app"]["url"], "https://aql-zone.uz/oyinlar")

    @override_settings(MINI_APP_URL="", SAYT_URL="https://aql-zone.uz")
    def test_ilovasiz_klaviatura_chizilmaydi(self):
        """Yarim ishlaydigan tugmalar — yo'qidan yomonroq."""
        self.bot.yangilikni_qayta_ishla(self.xabar("/start"))
        self.assertEqual(self.klaviatura(), [])

    @override_settings(**ILOVA)
    def test_klaviatura_tugmasi_ishlaydi(self):
        """Tugma oddiy MATN yuboradi va bot uni tanishi kerak."""
        self.bot.yangilikni_qayta_ishla(self.xabar("🎮 O'yinlar"))
        self.assertIn("Matematik o'yinlar", self.matnlar())

    @override_settings(**ILOVA)
    def test_klaviatura_tugmasi_boshqa_tilda_ham_tanaladi(self):
        """
        Telegram allaqachon yuborilgan klaviaturani o'zi yangilamaydi.

        Ya'ni tilini almashtirgan odamning ekranida eski tildagi tugma
        qolib ketishi mumkin — u ham ishlashi shart.
        """
        self.bot.yangilikni_qayta_ishla(self.xabar("🎮 Игры"))
        self.assertIn("Matematik o'yinlar", self.matnlar())

    @override_settings(**ILOVA)
    def test_notanish_xabar_klaviaturani_qaytaradi(self):
        """
        Yangilikdan oldingi foydalanuvchilarda klaviatura umuman yo'q va
        ular /start ni boshqa hech qachon yozmasligi mumkin.
        """
        self.bot.yangilikni_qayta_ishla(self.xabar("salom"))
        self.assertNotEqual(self.klaviatura(), [])

    # ------------------------------------------------------- o'yinlar

    @override_settings(**ILOVA)
    def test_oyinlar_buyrogi_toppa_togri_oyinlarni_ochadi(self):
        """Odam o'yin so'radi — uni bosh sahifaga tashlash ortiqcha qadam."""
        self.bot.yangilikni_qayta_ishla(self.xabar("/oyinlar"))
        tugma = self.yuborilgan[-1]["reply_markup"]["inline_keyboard"][0][0]
        self.assertEqual(tugma["web_app"]["url"], "https://aql-zone.uz/oyinlar")

    @override_settings(MINI_APP_URL="https://aql-zone.uz/", SAYT_URL="https://aql-zone.uz")
    def test_manzil_oxiridagi_chiziq_ikkilanmaydi(self):
        """`.env` da manzilni ikki xil yozish mumkin."""
        self.bot.yangilikni_qayta_ishla(self.xabar("/oyinlar"))
        tugma = self.yuborilgan[-1]["reply_markup"]["inline_keyboard"][0][0]
        self.assertEqual(tugma["web_app"]["url"], "https://aql-zone.uz/oyinlar")

    # ------------------------------------------------------------- til

    @override_settings(**ILOVA)
    def test_ilovada_tanlangan_til_botda_ham_ishlaydi(self):
        """
        Odam uchun bu BITTA ilova.

        Telegram interfeysi ruscha bo'lsa ham, saytda o'zbekcha tanlangan
        bo'lsa bot o'zbekcha gapiradi — aks holda bir joyda o'zbekcha,
        boshqa joyda ruscha bo'lib qolardi.
        """
        ruscha = self.xabar("/start")
        ruscha["message"]["from"]["language_code"] = "ru"
        self.bot.yangilikni_qayta_ishla(ruscha)
        self.assertIn("Здравствуйте", self.matnlar())

        # Sayt o'zbekchaga o'tdi (`PATCH /api/v1/me` shuni yozadi).
        Pupil.objects.update(til="uz")
        self.yuborilgan.clear()

        self.bot.yangilikni_qayta_ishla(ruscha)
        self.assertIn("Assalomu alaykum", self.matnlar())
        self.assertNotIn("Здравствуйте", self.matnlar())

    @override_settings(**ILOVA)
    def test_menyu_tugmasi_odamning_tilida(self):
        """
        Menyu tugmasi SUHBAT bo'yicha qo'yiladi, umumiy emas.

        Umumiy sozlash bitta tilda qotib qolardi va ruszabon odam
        o'ziga tanish bo'lmagan so'zni ko'rardi.
        """
        ruscha = self.xabar("/start")
        ruscha["message"]["from"]["language_code"] = "ru"
        self.bot.yangilikni_qayta_ishla(ruscha)
        menyu = next(x for x in self.yuborilgan if x["usul"] == "setChatMenuButton")
        self.assertEqual(menyu["chat_id"], 555)
        self.assertEqual(menyu["menu_button"]["text"], "Открыть")

    @override_settings(**ILOVA)
    def test_buyruqlar_royxati_ikki_tilda_ornatiladi(self):
        """`/` tugmasi ostidagi ro'yxat — usiz bot nima qilishini hech kim bilmaydi."""
        self.bot.buyruqlarni_ornat()
        sorovlar = [x for x in self.yuborilgan if x["usul"] == "setMyCommands"]
        tillar = {x.get("language_code", "") for x in sorovlar}
        self.assertEqual(tillar, {"uz", "ru", ""})
        buyruqlar = [c["command"] for c in sorovlar[0]["commands"]]
        self.assertIn("oyinlar", buyruqlar)


@override_settings(BOT_TOKEN=BOT)
class IsmFamiliyaTest(TestCase):
    """Ism-familiyani tahrirlash va uning Telegram bilan to'qnashuvi."""

    def kir(self, user_id: int = 777, ism: str = "Ali") -> str:
        r = self.client.post(
            "/api/v1/auth/telegram",
            {"initData": init_data(user_id, ism)},
            content_type="application/json",
        )
        return r.json()["token"]

    def patch(self, token: str, **body):
        return self.client.patch(
            "/api/v1/me", body,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

    def test_ism_va_familiya_saqlanadi(self):
        t = self.kir()
        r = self.patch(t, ism="Jasur", familiya="Toshmatov")
        self.assertEqual(r.status_code, 200)
        u = r.json()["user"]
        self.assertEqual(u["ism"], "Jasur")
        self.assertEqual(u["familiya"], "Toshmatov")
        self.assertEqual(u["toliqIsm"], "Jasur Toshmatov")

    def test_faqat_familiyani_ozgartirsa_ism_qoladi(self):
        t = self.kir(ism="Ali")
        self.patch(t, ism="Alisher", familiya="Navoiy")
        r = self.patch(t, familiya="Nizomiy")
        u = r.json()["user"]
        self.assertEqual(u["ism"], "Alisher")       # tegilmagan
        self.assertEqual(u["familiya"], "Nizomiy")

    def test_qolda_yozilgan_ism_qayta_kirganda_ochmaydi(self):
        """
        Eng nozik joy: Telegram'ga qayta kirish ismni o'sha yerdan
        yangilaydi. Foydalanuvchi o'zi yozgan ism shunda o'chib ketmasligi
        kerak.
        """
        t = self.kir(777, "Ali")
        self.patch(t, ism="Alisher", familiya="Navoiy")

        t2 = self.kir(777, "Ali")                   # Telegram'da hamon "Ali"
        u = self.client.get(
            "/api/v1/me", HTTP_AUTHORIZATION=f"Bearer {t2}"
        ).json()["user"]
        self.assertEqual(u["ism"], "Alisher")
        self.assertEqual(u["familiya"], "Navoiy")

    def test_tegilmagan_ism_telegramdan_yangilanadi(self):
        """Qo'lda yozilmagan bo'lsa — Telegram manba bo'lib qolaveradi."""
        self.kir(888, "Eski")
        t = self.kir(888, "Yangi")
        u = self.client.get(
            "/api/v1/me", HTTP_AUTHORIZATION=f"Bearer {t}"
        ).json()["user"]
        self.assertEqual(u["ism"], "Yangi")

    def test_telegramdagi_bezak_bazaga_tushmaydi(self):
        """Kirishning O'ZIDA tozalanadi — reyting bezakni ko'rsatmasin."""
        t = self.kir(555, "꧁❖DAVRONOV❖꧂")
        u = self.client.get(
            "/api/v1/me", HTTP_AUTHORIZATION=f"Bearer {t}"
        ).json()["user"]
        self.assertEqual(u["ism"], "DAVRONOV")

    def test_faqat_bezakdan_iborat_telegram_ismi_yozilmaydi(self):
        """Harfi yo'q ism — YO'Q ism: undan ro'yxat formasida so'raymiz."""
        t = self.kir(556, "❖❖❖")
        u = self.client.get(
            "/api/v1/me", HTTP_AUTHORIZATION=f"Bearer {t}"
        ).json()["user"]
        self.assertEqual(u["ism"], "")

    def test_bosh_sorov_rad_etiladi(self):
        t = self.kir()
        self.assertEqual(self.patch(t).status_code, 400)

    def test_tokensiz_tahrirlab_bolmaydi(self):
        r = self.client.patch(
            "/api/v1/me", {"ism": "Kim"}, content_type="application/json"
        )
        self.assertEqual(r.status_code, 401)

    def test_harf_bolmagan_belgi_tozalanadi(self):
        """Reyting hammaga ko'rinadi — "asd123" o'sha yerda turmasligi kerak.

        Lekin RAD ETMAYMIZ: raqam va bezak kesiladi, harflari qoladi.
        """
        t = self.kir()
        r = self.patch(t, ism="asd123")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["user"]["ism"], "asd")

    def test_bezakli_telegram_ismi_qabul_qilinadi(self):
        """`꧁❖DAVRONOV❖꧂` — Telegram'dan aynan shunday kelib tushadi."""
        t = self.kir()
        r = self.patch(t, ism="꧁❖DAVRONOV❖꧂", familiya="𝓓𝓪𝓿𝓻𝓸𝓷𝓸𝓿")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["user"]["ism"], "DAVRONOV")
        self.assertEqual(r.json()["user"]["familiya"], "Davronov")

    def test_harfsiz_ism_rad_etiladi(self):
        """Harf umuman qolmasa — o'shanda so'raymiz."""
        t = self.kir()
        self.assertEqual(self.patch(t, familiya="!!!").status_code, 400)
        self.assertEqual(self.patch(t, ism="❖❖❖").status_code, 400)
        self.assertEqual(self.patch(t, ism="A").status_code, 400)

    def test_apostrofli_ism_qabul_qilinadi(self):
        """O'zbekcha ism uch xil apostrof bilan yozilishi mumkin."""
        t = self.kir()
        for ism in ("G'ulom", "G‘ulom", "G’ulom", "Gʻulom", "Gʼulom", "Abdulla-Qodiriy"):
            r = self.patch(t, ism=ism)
            self.assertEqual(r.status_code, 200, ism)
            # Apostrof KESILMASLIGI kerak: "Gulom" boshqa ism.
            self.assertEqual(r.json()["user"]["ism"], ism, ism)

    def test_telefon_me_da_korinadi(self):
        t = self.kir(999, "Sardor")
        pupil = Identity.objects.get(provider="telegram", external_id="999").pupil
        Identity.objects.create(pupil=pupil, provider="phone", external_id="+998901234567")
        u = self.client.get(
            "/api/v1/me", HTTP_AUTHORIZATION=f"Bearer {t}"
        ).json()["user"]
        self.assertEqual(u["telefon"], "+998901234567")
        self.assertIn("phone", u["kirishUsullari"])


@override_settings(BOT_TOKEN=BOT, BOT_USERNAME="aqlzone_bot")
class WidgetKirishTest(TestCase):
    """
    Veb saytdagi Telegram tugmasi (Login Widget).

    Mini App'dan butunlay boshqa imzo sxemasi ishlatiladi, shuning uchun
    u alohida sinaladi: Mini App testlari o'tayotgani bu yerda hech
    narsani kafolatlamaydi.
    """

    def post(self, body, token: str | None = None):
        qo = {"HTTP_AUTHORIZATION": f"Bearer {token}"} if token else {}
        return self.client.post(
            "/api/v1/auth/telegram", body, content_type="application/json", **qo
        )

    def test_widget_orqali_kirish(self):
        r = self.post({"tg": widget_data(), "platform": "web"})
        self.assertEqual(r.status_code, 200, r.content)
        u = r.json()["user"]
        self.assertTrue(u["telegram"])
        self.assertEqual(u["toliqIsm"], "Ali Valiyev")
        # Telegram ism ham, familiya ham bergan — qayta so'rashning hojati yo'q.
        self.assertTrue(u["royxatdan"])

    def test_buzilgan_imzo_rad_etiladi(self):
        d = widget_data()
        d["first_name"] = "Boshqa"          # imzo o'sha-o'sha
        self.assertEqual(self.post({"tg": d}).status_code, 401)

    def test_mini_app_imzosi_widgetda_ishlamaydi(self):
        """
        Ikki sxema chalkashib ketmasligi kerak.

        Mini App kaliti bilan imzolangan ma'lumot widget yo'lidan o'tsa,
        u rad etilishi shart — aks holda sxemalardan biri bo'sh joyga
        aylanardi.
        """
        d = widget_data()
        dcs = "\n".join(f"{k}={d[k]}" for k in sorted(d) if k != "hash")
        secret = hmac.new(b"WebAppData", BOT.encode(), hashlib.sha256).digest()
        d["hash"] = hmac.new(secret, dcs.encode(), hashlib.sha256).hexdigest()
        self.assertEqual(self.post({"tg": d}).status_code, 401)

    def test_eskirgan_malumot_rad_etiladi(self):
        eski = widget_data(auth_date=int(time.time()) - 3 * 24 * 3600)
        self.assertEqual(self.post({"tg": eski}).status_code, 401)

    def test_boshsiz_sorov_400(self):
        self.assertEqual(self.post({"platform": "web"}).status_code, 400)

    def test_widget_bilan_anonim_hisob_boglanadi(self):
        """Veb'da bola avval anonim o'ynaydi, keyin Telegram'ni bosadi."""
        anonim = self.client.post(
            "/api/v1/auth/device",
            {"deviceId": "dev-widget-0123456789ab", "platform": "web"},
            content_type="application/json",
        ).json()["token"]
        self.client.put(
            "/api/v1/progress",
            {"state": {"azapp_grade1_v1": json.dumps({"stars": 15})}},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {anonim}",
        )

        r = self.client.post(
            "/api/v1/auth/link", {"tg": widget_data()},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {anonim}",
        )
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()["user"]["toliqIsm"], "Ali Valiyev")

        # Eski token ishlashda davom etadi va yulduzlar joyida.
        holat = self.client.get(
            "/api/v1/progress", HTTP_AUTHORIZATION=f"Bearer {anonim}"
        ).json()
        self.assertEqual(holat["stars"], 15)

    def test_health_bot_nomini_beradi(self):
        """Mijoz tugmani ko'rsatish uchun bot nomini shu yerdan oladi."""
        self.assertEqual(self.client.get("/api/health").json()["botUsername"], "aqlzone_bot")

    @override_settings(BOT_TOKEN="")
    def test_token_yoqda_bot_nomi_berilmaydi(self):
        """Token bo'lmasa tugma ishlamaydi — nomni ham bermaymiz."""
        self.assertEqual(self.client.get("/api/health").json()["botUsername"], "")


class RoyxatTest(TestCase):
    """Majburiy ro'yxatdan o'tish: ism ham, familiya ham."""

    def kir(self, device: str = "dev-royxat-0123456789ab") -> str:
        return self.client.post(
            "/api/v1/auth/device", {"deviceId": device, "platform": "web"},
            content_type="application/json",
        ).json()["token"]

    def patch(self, token, **body):
        return self.client.patch(
            "/api/v1/me", body, content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

    def test_yangi_hisob_royxatdan_otmagan(self):
        t = self.kir()
        u = self.client.get("/api/v1/me", HTTP_AUTHORIZATION=f"Bearer {t}").json()["user"]
        self.assertFalse(u["royxatdan"])

    def test_faqat_ism_ham_yetarli(self):
        """
        Familiya SHART EMAS.

        Ilgari ikkalasi ham talab qilinardi va botdan kelgan odam
        ko'pincha ism so'raydigan formaga tushardi: Telegram'da
        familiya ixtiyoriy va ko'pchilikda u umuman yo'q.
        """
        t = self.kir()
        self.assertTrue(self.patch(t, ism="Ali").json()["user"]["royxatdan"])

    def test_ism_va_familiya_royxatni_yopadi(self):
        t = self.kir()
        u = self.patch(t, ism="Ali", familiya="Valiyev").json()["user"]
        self.assertTrue(u["royxatdan"])

    def test_familiyani_ochirish_royxatni_qaytarmaydi(self):
        """
        Bir marta o'tilgan ro'yxat qaytarilmaydi.

        Aks holda foydalanuvchi familiyasini tozalab, reytingdan chiqib
        ketardi-yu, ilova esa uni yana ro'yxat oynasiga tiqib qo'yardi —
        chiqib bo'lmaydigan halqa.
        """
        t = self.kir()
        self.patch(t, ism="Ali", familiya="Valiyev")
        u = self.patch(t, familiya="").json()["user"]
        self.assertTrue(u["royxatdan"])


class ReytingTest(TestCase):
    """Reyting: jami va haftalik, o'z o'rning bilan."""

    def bola(self, device: str, ism: str, familiya: str) -> str:
        t = self.client.post(
            "/api/v1/auth/device", {"deviceId": device, "platform": "web"},
            content_type="application/json",
        ).json()["token"]
        self.client.patch(
            "/api/v1/me", {"ism": ism, "familiya": familiya},
            content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {t}",
        )
        return t

    def yulduz(self, token: str, n: int):
        self.client.put(
            "/api/v1/progress",
            {"state": {"azapp_grade1_v1": json.dumps({"stars": n})}},
            content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {token}",
        )

    def dars(self, token: str, stars: int, kunlar_oldin: int = 0):
        self.client.post(
            "/api/v1/results",
            {"grade": 1, "asked": 6, "correct": 6, "stars": stars},
            content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        if kunlar_oldin:
            r = LessonResult.objects.order_by("-pk").first()
            LessonResult.objects.filter(pk=r.pk).update(
                created_at=timezone.now() - timedelta(days=kunlar_oldin)
            )

    def reyting(self, token: str, davr: str = "jami") -> dict:
        return self.client.get(
            f"/api/v1/leaderboard?davr={davr}", HTTP_AUTHORIZATION=f"Bearer {token}"
        ).json()

    def setUp(self):
        self.a = self.bola("dev-reyting-a0123456789", "Ali", "Valiyev")
        self.b = self.bola("dev-reyting-b0123456789", "Zilola", "Karimova")
        self.d = self.bola("dev-reyting-d0123456789", "Kamol", "Rustamov")
        for t, n in ((self.a, 3), (self.b, 11), (self.d, 7)):
            self.yulduz(t, n)

    def test_yulduz_boyicha_saralanadi(self):
        top = self.reyting(self.a)["top"]
        self.assertEqual([x["yulduz"] for x in top], [11, 7, 3])

    def test_ism_familiya_toliq_keladi(self):
        birinchi = self.reyting(self.a)["top"][0]
        self.assertEqual(birinchi["ism"], "Zilola")
        self.assertEqual(birinchi["familiya"], "Karimova")
        self.assertEqual(birinchi["toliqIsm"], "Zilola Karimova")

    def test_ozini_ajratib_korsatadi(self):
        top = self.reyting(self.a)["top"]
        self.assertEqual([x["men"] for x in top], [False, False, True])

    def test_oz_orning_alohida_keladi(self):
        men = self.reyting(self.a)["men"]
        self.assertEqual((men["orin"], men["yulduz"], men["toliqIsm"]), (3, 3, "Ali Valiyev"))

    def test_royxatdan_otmagan_korinmaydi(self):
        yangi = self.client.post(
            "/api/v1/auth/device", {"deviceId": "dev-ismsiz-0123456789ab"},
            content_type="application/json",
        ).json()["token"]
        self.yulduz(yangi, 99)                       # eng ko'p yulduz
        top = self.reyting(self.a)["top"]
        self.assertNotIn(99, [x["yulduz"] for x in top])
        # O'zi esa jadvalda o'rinsiz ko'rinadi — ro'yxatdan o'tishi kerak.
        self.assertIsNone(self.reyting(yangi)["men"])

    def test_darslar_soni_keladi(self):
        self.dars(self.a, 3)
        self.dars(self.a, 2)
        men = self.reyting(self.a)["men"]
        self.assertEqual(men["darslar"], 2)

    def test_hafta_faqat_shu_haftanikini_sanaydi(self):
        # 20 kun oldingi dars haftalik jadvalga kirmasligi kerak.
        self.dars(self.b, 3, kunlar_oldin=20)
        self.dars(self.a, 2)
        top = self.reyting(self.a, "hafta")["top"]
        self.assertEqual([(x["toliqIsm"], x["yulduz"]) for x in top], [("Ali Valiyev", 2)])

    def test_hafta_yulduzsiz_bolani_korsatmaydi(self):
        j = self.reyting(self.a, "hafta")
        self.assertEqual(j["top"], [])
        self.assertIsNone(j["men"])

    def test_top_tashqarisidagi_oz_orni_ham_keladi(self):
        j = self.client.get(
            "/api/v1/leaderboard?limit=1", HTTP_AUTHORIZATION=f"Bearer {self.a}"
        ).json()
        self.assertEqual(len(j["top"]), 1)
        self.assertEqual(j["men"]["orin"], 3)        # ro'yxatda yo'q, o'rni bor
        self.assertEqual(j["qatnashchilar"], 3)


class LigaTest(TestCase):
    """
    Haftalik liga: 20 kishilik guruh, ko'tarilish va tushish.

    Testlar ikki narsani tekshiradi va ikkalasi ham muhim: jadval to'g'ri
    saralanadimi, va hafta yakunlanganda kim qayerga o'tadi. Ikkinchisi
    xato bo'lsa bola sababsiz pastga tushadi — bu eng yomon xato, chunki
    uni bola ertasi kuni o'zi ko'radi.
    """

    def bola(self, n: int, ism: str = "") -> str:
        # Ism ATAYLAB raqamsiz: `/me` bezakli va raqamli ismlarni tozalaydi,
        # ya'ni "Bola7" serverdan "Bola" bo'lib qaytardi.
        t = self.client.post(
            "/api/v1/auth/device", {"deviceId": f"dev-liga-{n:012d}", "platform": "web"},
            content_type="application/json",
        ).json()["token"]
        self.client.patch(
            "/api/v1/me",
            {"ism": ism or f"Bola{chr(ord('a') + n % 26)}", "familiya": "Ligachi"},
            content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {t}",
        )
        return t

    def dars(self, token: str, stars: int, kunlar_oldin: int = 0):
        self.client.post(
            "/api/v1/results",
            {"grade": 1, "asked": 6, "correct": 6, "stars": stars},
            content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {token}",
        )
        if kunlar_oldin:
            r = LessonResult.objects.order_by("-pk").first()
            LessonResult.objects.filter(pk=r.pk).update(
                created_at=timezone.now() - timedelta(days=kunlar_oldin)
            )

    def yig(self, token: str, jami: int, kunlar_oldin: int = 0):
        """
        `jami` yulduz to'playdi.

        Bitta darsdan ko'pi bilan 3 yulduz chiqadi (serializer chegarasi),
        shuning uchun kerakli miqdor bir necha darsga bo'linadi.
        """
        while jami > 0:
            self.dars(token, min(3, jami), kunlar_oldin)
            jami -= 3

    def liga(self, token: str) -> dict:
        return self.client.get(
            "/api/v1/liga", HTTP_AUTHORIZATION=f"Bearer {token}"
        ).json()

    def profil(self, token: str) -> Profile:
        return Session.objects.get(token_hash=A.sha256(token)).pupil.asosiy_profil()

    def setUp(self):
        self.a = self.bola(1, "Ali")
        self.b = self.bola(2, "Zilola")

    # --------------------------------------------------------- a'zolik

    def test_birinchi_kirishda_bronzaga_qoshiladi(self):
        j = self.liga(self.a)
        self.assertTrue(j["qatnashadi"])
        self.assertEqual(j["daraja"]["nom"], "Bronza")
        self.assertEqual(len(j["guruh"]), 1)
        self.assertTrue(j["guruh"][0]["men"])

    def test_royxatdan_otmagan_qatnashmaydi(self):
        t = self.client.post(
            "/api/v1/auth/device", {"deviceId": "dev-liga-ismsiz00"},
            content_type="application/json",
        ).json()["token"]
        j = self.liga(t)
        self.assertFalse(j["qatnashadi"])
        self.assertEqual(LigaAzo.objects.filter(profile__pupil__first_name="").count(), 0)

    def test_ikki_marta_ochilsa_ikkinchi_qator_yasalmaydi(self):
        self.liga(self.a)
        self.liga(self.a)
        self.assertEqual(LigaAzo.objects.filter(profile=self.profil(self.a)).count(), 1)

    def test_guruh_toladi_va_yangisi_ochiladi(self):
        # 20 ta joy bor; 21-bola ikkinchi guruhga tushishi kerak.
        for i in range(3, 3 + L.GURUH_HAJMI):
            self.liga(self.bola(i))
        oxirgi = self.liga(self.a)                      # 21-a'zo (a hali qo'shilmagan)
        self.assertEqual(len(oxirgi["guruh"]), 1)
        self.assertEqual(LigaAzo.objects.filter(hafta=L.hafta_sanasi()).count(), L.GURUH_HAJMI + 1)

    # ---------------------------------------------------------- jadval

    def test_yulduz_boyicha_saralanadi(self):
        self.liga(self.a)
        self.liga(self.b)
        self.yig(self.a, 2)
        self.yig(self.b, 5)
        guruh = self.liga(self.a)["guruh"]
        self.assertEqual([q["yulduz"] for q in guruh], [5, 2])
        self.assertEqual(guruh[0]["toliqIsm"], "Zilola Ligachi")

    def test_otgan_haftadagi_yulduz_sanalmaydi(self):
        self.liga(self.a)
        self.yig(self.a, 9, kunlar_oldin=20)
        self.assertEqual(self.liga(self.a)["men"]["yulduz"], 0)

    def test_oynamagan_bola_kutmoqda_zonasida(self):
        self.assertEqual(self.liga(self.a)["men"]["zona"], "kutmoqda")

    def test_besh_kishilik_guruhda_hech_kim_tushmaydi(self):
        # Faol bola 12 tadan kam — tushish zonasi umuman ko'rsatilmaydi.
        for t in (self.a, self.b):
            self.liga(t)
            self.dars(t, 3)
        j = self.liga(self.a)
        self.assertEqual(j["tushadi"], 0)
        self.assertNotIn("tushadi", [q["zona"] for q in j["guruh"]])

    # -------------------------------------------------------- yakunlash

    def _otgan_haftaga_kochir(self, tokenlar: list[str]) -> "date":
        """Berilgan bolalarni o'tgan haftaning guruhiga o'tkazadi."""
        otgan = L.hafta_sanasi() - timedelta(days=7)
        for t in tokenlar:
            self.liga(t)
        LigaAzo.objects.filter(hafta=L.hafta_sanasi()).update(hafta=otgan)
        LessonResult.objects.all().update(
            created_at=timezone.now() - timedelta(days=7)
        )
        return otgan

    def test_birinchi_beshlik_kotariladi(self):
        tokenlar = [self.bola(i) for i in range(10, 16)]
        for i, t in enumerate(tokenlar):
            self.liga(t)
            self.yig(t, 12 - i * 2)                     # 12, 10, 8, 6, 4, 2
        otgan = self._otgan_haftaga_kochir([])
        L.haftani_yakunla(otgan)

        natijalar = [
            LigaAzo.objects.get(profile=self.profil(t), hafta=otgan).natija
            for t in tokenlar
        ]
        self.assertEqual(natijalar, ["kotarildi"] * 5 + ["qoldi"])

    def test_kotarilgan_bola_keyingi_hafta_kumushda(self):
        t = self.bola(20)
        self.liga(t)
        self.yig(t, 5)
        otgan = self._otgan_haftaga_kochir([])
        L.haftani_yakunla(otgan)
        self.assertEqual(self.liga(t)["daraja"]["nom"], "Kumush")

    def test_yakunlanmagan_otgan_hafta_ochilganda_yopiladi(self):
        """Rejalashtirgich ishlamay qolsa ham natija joyida bo'lishi kerak."""
        t = self.bola(21)
        self.liga(t)
        self.yig(t, 5)
        self._otgan_haftaga_kochir([])                   # yakunlanmagan qoldi
        j = self.liga(t)                                 # ochilishning o'zi yopadi
        self.assertEqual(j["daraja"]["nom"], "Kumush")
        self.assertEqual(j["otganHafta"]["natija"], "kotarildi")

    def test_oynamagan_bola_tushmaydi(self):
        t = self.bola(22)
        self.liga(t)
        LigaAzo.objects.filter(profile=self.profil(t)).update(daraja=2)
        otgan = self._otgan_haftaga_kochir([])
        L.haftani_yakunla(otgan)
        azo = LigaAzo.objects.get(profile=self.profil(t), hafta=otgan)
        self.assertEqual((azo.natija, azo.yulduz), ("qoldi", 0))
        self.assertEqual(self.liga(t)["daraja"]["nom"], "Oltin")     # o'sha joyda

    def test_tolgan_guruhning_oxirgi_beshtasi_tushadi(self):
        tokenlar = [self.bola(i) for i in range(30, 30 + L.TUSHISH_ENG_KAM)]
        for i, t in enumerate(tokenlar):
            self.liga(t)
            self.yig(t, (L.TUSHISH_ENG_KAM - i) * 2)     # 24, 22 … 2
        LigaAzo.objects.all().update(daraja=1)           # Kumush: tushish mumkin
        otgan = self._otgan_haftaga_kochir([])
        L.haftani_yakunla(otgan)

        natijalar = [
            LigaAzo.objects.get(profile=self.profil(t), hafta=otgan).natija
            for t in tokenlar
        ]
        self.assertEqual(natijalar[:5], ["kotarildi"] * 5)
        self.assertEqual(natijalar[-5:], ["tushdi"] * 5)
        self.assertEqual(natijalar[5:-5], ["qoldi"] * 2)

    def test_eng_yuqori_darajadan_yuqoriga_chiqmaydi(self):
        t = self.bola(40)
        self.liga(t)
        LigaAzo.objects.filter(profile=self.profil(t)).update(daraja=L.ENG_YUQORI)
        self.yig(t, 8)
        otgan = self._otgan_haftaga_kochir([])
        L.haftani_yakunla(otgan)
        azo = LigaAzo.objects.get(profile=self.profil(t), hafta=otgan)
        self.assertEqual(azo.natija, "qoldi")
        self.assertEqual(self.liga(t)["daraja"]["nomer"], L.ENG_YUQORI)

    def test_yakunlash_ikki_marta_chaqirilsa_ozgarmaydi(self):
        t = self.bola(41)
        self.liga(t)
        self.yig(t, 4)
        otgan = self._otgan_haftaga_kochir([])
        self.assertEqual(L.haftani_yakunla(otgan), 1)
        self.assertEqual(L.haftani_yakunla(otgan), 0)    # ikkinchisi tegmaydi

    def test_uzoq_tanaffusdan_keyin_daraja_saqlanadi(self):
        """Bir oy kelmagan bola o'z darajasiga QAYTADI, pastga tushmaydi."""
        t = self.bola(42)
        self.liga(t)
        p = self.profil(t)
        LigaAzo.objects.filter(profile=p).update(
            hafta=L.hafta_sanasi() - timedelta(days=28),
            daraja=3, orin=9, natija="qoldi", yulduz=4,
        )
        self.assertEqual(self.liga(t)["daraja"]["nom"], "Olmos")


class ReklamaTest(TestCase):
    """
    Botdan e'lon tarqatish.

    Eng muhim ikkita xatti-harakat: BIR ODAMGA IKKI MARTA bormasligi va
    bloklagan odamni eslab qolishi. Ikkalasi ham orqaga qaytarib
    bo'lmaydigan xatolarning oldini oladi — yuborilgan xabarni o'chirib
    bo'lmaydi.
    """

    def bola(self, tg: str) -> Pupil:
        p = Pupil.objects.create(
            first_name=f"Bola{tg}", last_name="Testov", registered_at=timezone.now(),
        )
        Identity.objects.create(pupil=p, provider=Identity.TELEGRAM, external_id=tg)
        Profile.objects.create(pupil=p, name="Bola")
        return p

    def elon(self, **ma) -> Reklama:
        return Reklama.objects.create(**{"matn": "Salom!", **ma})

    def setUp(self):
        self.a = self.bola("1001")
        self.b = self.bola("1002")
        self.d = self.bola("1003")

    # ------------------------------------------------------- yuborish

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_hammaga_yuboriladi(self, sorov):
        r = self.elon()
        natija = R.yubor(r.pk)
        self.assertEqual(natija["yuborildi"], 3)
        self.assertEqual(sorov.call_count, 3)
        r.refresh_from_db()
        self.assertEqual((r.holat, r.jami), ("tugadi", 3))

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_ikkinchi_marta_yuborilmaydi(self, sorov):
        """Qayta ishga tushirish — eng xavfli holat. Hech kimga takror bormaydi."""
        r = self.elon()
        R.yubor(r.pk)
        sorov.reset_mock()

        # Holatni qo'lda ochamiz — server uzilib qolgandek.
        Reklama.objects.filter(pk=r.pk).update(holat="toxtatildi")
        R.yubor(r.pk)
        self.assertEqual(sorov.call_count, 0)
        self.assertEqual(ReklamaQabul.objects.filter(reklama=r).count(), 3)

    @patch("core.xabar._sorov")
    def test_uzilgan_elon_qolganidan_davom_etadi(self, sorov):
        # Birinchi ikkitasi ketdi, uchinchisida tarmoq uzildi.
        sorov.side_effect = [(True, 200, ""), (True, 200, ""), Exception("uzildi")]
        r = self.elon()
        with self.assertRaises(Exception):
            R.yubor(r.pk)
        self.assertEqual(ReklamaQabul.objects.filter(reklama=r).count(), 2)

        sorov.side_effect = None
        sorov.return_value = (True, 200, "")
        sorov.reset_mock()
        R.yubor(r.pk)
        # Faqat QOLGAN bittasiga yuborilgan.
        self.assertEqual(sorov.call_count, 1)
        self.assertEqual(ReklamaQabul.objects.filter(reklama=r).count(), 3)

    # -------------------------------------------------------- bloklash

    @patch("core.xabar._sorov")
    def test_bloklagan_odam_eslab_qolinadi(self, sorov):
        sorov.side_effect = [
            (False, 403, "bot was blocked by the user"),
            (True, 200, ""),
            (True, 200, ""),
        ]
        r = self.elon()
        R.yubor(r.pk)

        self.a.refresh_from_db()
        self.assertIsNotNone(self.a.bot_bloklandi_at)
        r.refresh_from_db()
        self.assertEqual((r.yuborildi, r.bloklandi), (2, 1))

        # Keyingi e'lon unga UMUMAN urinmaydi.
        sorov.side_effect = None
        sorov.return_value = (True, 200, "")
        sorov.reset_mock()
        R.yubor(self.elon(matn="Ikkinchi").pk)
        self.assertEqual(sorov.call_count, 2)

    @patch("core.xabar._sorov", return_value=(False, 400, "chat not found"))
    def test_yoq_hisob_ham_bloklangan_deb_belgilanadi(self, sorov):
        r = self.elon()
        R.yubor(r.pk)
        r.refresh_from_db()
        self.assertEqual((r.bloklandi, r.xato), (3, 0))

    @patch("core.xabar._sorov", return_value=(False, 500, "server xatosi"))
    def test_vaqtinchalik_xato_bloklash_emas(self, sorov):
        """500 — Telegram tomonidagi nosozlik. Odamni bloklangan deb belgilamaymiz."""
        r = self.elon()
        R.yubor(r.pk)
        r.refresh_from_db()
        self.assertEqual((r.xato, r.bloklandi), (3, 0))
        self.a.refresh_from_db()
        self.assertIsNone(self.a.bot_bloklandi_at)

    # ---------------------------------------------------------- tugma

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_tugma_yoniq_bolsa_inline_tugma_qoshiladi(self, sorov):
        with self.settings(BOT_USERNAME="aqlzone_bot"):
            R.yubor(self.elon(tugma=True, tugma_matni="Ochish").pk)
        payload = sorov.call_args[0][1]
        tugma = payload["reply_markup"]["inline_keyboard"][0][0]
        self.assertEqual(tugma["text"], "Ochish")
        self.assertIn("t.me/aqlzone_bot", tugma["url"])

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_tugma_ochiq_bolsa_qoshilmaydi(self, sorov):
        with self.settings(BOT_USERNAME="aqlzone_bot"):
            R.yubor(self.elon(tugma=False).pk)
        self.assertNotIn("reply_markup", sorov.call_args[0][1])

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_oz_havolasi_bot_havolasidan_ustun(self, sorov):
        with self.settings(BOT_USERNAME="aqlzone_bot"):
            R.yubor(self.elon(tugma=True, havola="https://aql-zone.uz/reyting").pk)
        tugma = sorov.call_args[0][1]["reply_markup"]["inline_keyboard"][0][0]
        self.assertEqual(tugma["url"], "https://aql-zone.uz/reyting")

    # ---------------------------------------------------------- boshqa

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_sinov_nusxasi_royxatga_yozilmaydi(self, sorov):
        """Aks holda admin haqiqiy tarqatishda o'zi e'londan chetda qolardi."""
        r = self.elon()
        ok, _ = R.sinov_yubor(r, "1001")
        self.assertTrue(ok)
        self.assertEqual(ReklamaQabul.objects.count(), 0)

        sorov.reset_mock()
        R.yubor(r.pk)
        self.assertEqual(sorov.call_count, 3)         # admin ham oldi

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_toxtatilsa_qolganiga_yuborilmaydi(self, sorov):
        r = self.elon()

        # Birinchi xabardan keyin admin "To'xtatish" ni bosdi.
        def toxtat(*a, **k):
            Reklama.objects.filter(pk=r.pk).update(holat="toxtatildi")
            return (True, 200, "")
        sorov.side_effect = toxtat

        R.yubor(r.pk)
        self.assertEqual(sorov.call_count, 1)
        r.refresh_from_db()
        self.assertEqual(r.holat, "toxtatildi")

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_telegramsiz_hisobga_yuborilmaydi(self, sorov):
        Pupil.objects.create(first_name="Anonim", registered_at=timezone.now())
        R.yubor(self.elon().pk)
        self.assertEqual(sorov.call_count, 3)

    def test_qancha_odam_bloklaganlarni_sanamaydi(self):
        self.assertEqual(R.qancha_odam(), 3)
        Pupil.objects.filter(pk=self.a.pk).update(bot_bloklandi_at=timezone.now())
        self.assertEqual(R.qancha_odam(), 2)


class KirishKodiTest(TestCase):
    """
    Botdagi «Saytga kirish» havolasi.

    Bu testlar borligining sababi aniq: kod avval BIR MARTALIK edi va
    shuning uchun haqiqiy hayotda ishlamadi — Telegram havolani o'z
    brauzerida ochgach, odam uni oddiy brauzerda ham ochardi va o'sha
    yerda "kiring" degan ekranga tushardi.
    """

    def setUp(self):
        self.pupil = Pupil.objects.create(first_name="Olim")

    def test_muddat_ichida_qayta_ishlatiladi(self):
        kod = A.kirish_kodi_yasa(self.pupil)
        self.assertEqual(A.kod_bilan_kir(kod).pk, self.pupil.pk)
        # Ikkinchi marta — xuddi shu natija. Telegram brauzeri ochgandan
        # keyin odam havolani oddiy brauzerda ham ochadi.
        self.assertEqual(A.kod_bilan_kir(kod).pk, self.pupil.pk)

    def test_eskirgan_kod_ishlamaydi_va_ochiriladi(self):
        kod = A.kirish_kodi_yasa(self.pupil)
        eski = timezone.now() - timedelta(minutes=KirishKodi.DAQIQA + 1)
        KirishKodi.objects.filter(pupil=self.pupil).update(created_at=eski)

        self.assertIsNone(A.kod_bilan_kir(kod))
        # Yaroqsiz qator bazada yotib qolmasin.
        self.assertFalse(KirishKodi.objects.filter(pupil=self.pupil).exists())

    def test_yangi_kod_eskisini_bekor_qiladi(self):
        eski = A.kirish_kodi_yasa(self.pupil)
        yangi = A.kirish_kodi_yasa(self.pupil)

        self.assertIsNone(A.kod_bilan_kir(eski))
        self.assertEqual(A.kod_bilan_kir(yangi).pk, self.pupil.pk)

    def test_notogri_kod(self):
        A.kirish_kodi_yasa(self.pupil)
        self.assertIsNone(A.kod_bilan_kir("yoq-bunday-kod"))
        self.assertIsNone(A.kod_bilan_kir(""))


#: Sinovdagi administratorning Telegram id'si.
ADMIN_ID = "555000111"


@override_settings(BOSHQARUV_YONIQ=True, ADMIN_TG=[ADMIN_ID])
class BoshqaruvTest(TestCase):
    """
    Boshqaruv paneli — /boshqaruv.

    Ikki narsa tekshiriladi va ikkalasi ham amalda kerak bo'lgan:

    1. **Faqat Telegram havolasi kiritadi.** Panelda butun bazaning
       kesimi turadi, va parol yo'li ataylab olib tashlangan.
    2. **Ro'yxatdan o'tmaganlar SANALMAYDI.** Hisob qatori odam ilovani
       ko'rishidan oldin yaraladi (qurilma tokeni), shuning uchun ular
       hisobotga qo'shilsa raqamlar ma'nosini yo'qotadi.
    """

    def setUp(self):
        hozir = timezone.now()

        # Ro'yxatdan o'tgan hisob — dars natijasi bilan.
        self.odam = Pupil.objects.create(
            first_name="Olim", last_name="Salimov", registered_at=hozir
        )
        profil = self.odam.asosiy_profil()
        LessonResult.objects.create(
            profile=profil, grade=1, lesson_name="Qo'shish",
            asked=6, correct=5, stars=2,
        )

        # Ro'yxatdan O'TMAGAN hisob — brauzer ochib yopgan odam.
        # Uning ham darsi bo'lishi mumkin (ro'yxat oynasi serverga
        # ulanmaganda o'tkazib yuboriladi), shuning uchun dars ham beramiz:
        # test aynan shu chalkash holatni ushlashi kerak.
        yolgon = Pupil.objects.create(first_name="")
        LessonResult.objects.create(
            profile=yolgon.asosiy_profil(), grade=2, lesson_name="Sanash",
            asked=6, correct=6, stars=3,
        )

    def kir(self, tg_id: str = ADMIN_ID):
        """Botdagi havolani ochish — kirishning yagona yo'li."""
        from .boshqaruv import havola_yasa
        kod = havola_yasa(tg_id).rsplit("/", 1)[-1]
        return self.client.get(f"/boshqaruv/havola/{kod}")

    def test_havolasiz_ochilmaydi(self):
        r = self.client.get("/boshqaruv")
        self.assertEqual(r.status_code, 200)      # kirish sahifasi
        self.assertContains(r, "Boshqaruv paneli")
        self.assertNotContains(r, "Voronka")

    def test_parol_maydoni_umuman_yoq(self):
        """Forma bo'lmasa, o'g'irlanadigan sir ham bo'lmaydi."""
        r = self.client.get("/boshqaruv")
        self.assertNotContains(r, "<form")
        self.assertNotContains(r, 'type="password"')
        # Eski parol manzili endi shunchaki panelga yo'naltiradi.
        eski = self.client.get("/boshqaruv/kirish")
        self.assertEqual(eski.status_code, 302)
        self.assertEqual(eski["Location"], "/boshqaruv")

    def test_havola_bilan_ochiladi(self):
        self.assertEqual(self.kir().status_code, 302)
        r = self.client.get("/boshqaruv")
        self.assertEqual(r.status_code, 200)
        self.assertContains(r, "Voronka")
        self.assertContains(r, "Olim Salimov")

    def test_begona_tg_id_kirmaydi(self):
        """Imzo to'g'ri bo'lsa ham, ro'yxatda bo'lmagan odam o'tmaydi."""
        self.assertEqual(self.kir("111222333").status_code, 404)

    def test_buzilgan_havola(self):
        r = self.client.get("/boshqaruv/havola/yoq-bunday-kod")
        self.assertEqual(r.status_code, 401)
        self.assertContains(r, "Havola eskirgan", status_code=401)

    def test_royxatsizlar_sanalmaydi(self):
        from .boshqaruv import statistika
        s = statistika(30)

        self.assertEqual(s["umumiy"]["royxatdan"], 1)
        self.assertEqual(s["umumiy"]["royxatsiz"], 1)
        # Dars ham, savol ham, yulduz ham faqat ro'yxatdagi odamdan.
        self.assertEqual(s["umumiy"]["darslar"], 1)
        self.assertEqual(s["umumiy"]["savollar"], 6)
        self.assertEqual(s["umumiy"]["yulduz"], 2)
        # Jadvalda ham faqat o'sha bitta odam.
        self.assertEqual(len(s["foydalanuvchilar"]), 1)
        self.assertEqual(s["foydalanuvchilar"][0]["ism"], "Olim Salimov")
        # 2-sinf faqat ro'yxatsiz odamda bor edi — kesimda chiqmasligi kerak.
        self.assertEqual([x["grade"] for x in s["sinflar"]], [1])

    def test_voronka_royxatsizlarni_korsatadi(self):
        """Yagona joy: "qanchasi yarim yo'lda to'xtadi" degan savol."""
        from .boshqaruv import statistika
        voronka = statistika(30)["voronka"]
        self.assertEqual(voronka[0]["son"], 2)      # ilovani ochgan
        self.assertEqual(voronka[1]["son"], 1)      # ro'yxatdan o'tgan
        self.assertEqual(voronka[1]["foiz"], 50)

    def test_bosh_bazada_yiqilmaydi(self):
        """Nolga bo'linish — hisobot sahifalarining eng ko'p uchraydigan xatosi."""
        LessonResult.objects.all().delete()
        Pupil.objects.all().delete()
        self.kir()
        self.assertEqual(self.client.get("/boshqaruv").status_code, 200)


@override_settings(KANAL="AqlZoneUz", BOT_TOKEN=BOT)
class KanalTest(TestCase):
    """
    "Kanalga qo'shiling" oynasi kimga ko'rsatiladi.

    Eng muhim qoida shu: SHUBHADA KO'RSATILMAYDI. Telegram javob
    bermasa yoki bot kanalda admin bo'lmasa, oyna chiqmaydi — chunki
    teskarisi bitta noto'g'ri sozlama bilan hamma foydalanuvchiga, shu
    jumladan allaqachon a'zo bo'lganlarga, har ochilishda reklama
    ko'rsatib chiqardi.
    """

    def setUp(self):
        self.pupil = Pupil.objects.create(first_name="Olim", registered_at=timezone.now())
        Identity.objects.create(
            pupil=self.pupil, provider=Identity.TELEGRAM, external_id="777",
        )

    def _javob(self, natija):
        """`kanal._sorov` o'rniga qo'yiladigan soxta Telegram javobi."""
        return lambda usul, **kw: natija

    def test_azo_bolmaganga_korsatiladi(self):
        from core import kanal as K
        with patch.object(K, "_sorov", self._javob({"ok": True, "result": {"status": "left"}})):
            self.assertTrue(K.korsatilsinmi(self.pupil))
        # Rad javob ESLAB QOLINMAYDI: odam keyin qo'shilsa, keyingi
        # tekshiruvda buni bilishimiz kerak.
        self.pupil.refresh_from_db()
        self.assertIsNone(self.pupil.kanal_azo_at)

    def test_azoga_korsatilmaydi_va_eslab_qolinadi(self):
        from core import kanal as K
        with patch.object(K, "_sorov", self._javob({"ok": True, "result": {"status": "member"}})):
            self.assertFalse(K.korsatilsinmi(self.pupil))

        self.pupil.refresh_from_db()
        self.assertIsNotNone(self.pupil.kanal_azo_at)

        # Ikkinchi marta Telegram UMUMAN so'ralmasligi kerak.
        def portlaydi(*a, **k):
            raise AssertionError("a'zoligi tasdiqlangan hisob uchun so'rov ketmasligi kerak")
        with patch.object(K, "_sorov", portlaydi):
            self.assertFalse(K.korsatilsinmi(self.pupil))

    def test_ovozi_ochirilgan_ham_azo(self):
        from core import kanal as K
        javob = {"ok": True, "result": {"status": "restricted", "is_member": True}}
        with patch.object(K, "_sorov", self._javob(javob)):
            self.assertFalse(K.korsatilsinmi(self.pupil))

    def test_chiqarilgan_odam_azo_emas(self):
        from core import kanal as K
        javob = {"ok": True, "result": {"status": "restricted", "is_member": False}}
        with patch.object(K, "_sorov", self._javob(javob)):
            self.assertTrue(K.korsatilsinmi(self.pupil))

    def test_telegram_javob_bermasa_korsatilmaydi(self):
        """Bot admin emas yoki tarmoq uzilgan — bu reklama sababi emas."""
        from core import kanal as K
        with patch.object(K, "_sorov", self._javob({})):
            self.assertFalse(K.korsatilsinmi(self.pupil))
        with patch.object(K, "_sorov", self._javob({"ok": False, "error_code": 400})):
            self.assertFalse(K.korsatilsinmi(self.pupil))

    @override_settings(KANAL="")
    def test_kanal_sozlanmagan(self):
        from core import kanal as K
        self.assertFalse(K.korsatilsinmi(self.pupil))
        self.assertEqual(K.kanal_nomi(), "")

    def test_telegramsiz_hisob(self):
        """A'zoligini tekshirib bo'lmaydigan odamdan oyna hech qachon ketmasdi."""
        from core import kanal as K
        yolgiz = Pupil.objects.create(first_name="Anon")
        self.assertFalse(K.korsatilsinmi(yolgiz))

    def test_kanal_nomi_shakli(self):
        from core import kanal as K
        self.assertEqual(K.kanal_nomi(), "@AqlZoneUz")
        self.assertEqual(K.havola(), "https://t.me/AqlZoneUz")
        with override_settings(KANAL="@AqlZoneUz"):
            self.assertEqual(K.kanal_nomi(), "@AqlZoneUz")

    def test_endpoint(self):
        from core import kanal as K
        token = A.issue_token(self.pupil, "web")
        with patch.object(K, "_sorov", self._javob({"ok": True, "result": {"status": "left"}})):
            r = self.client.get("/api/v1/kanal", HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json(), {
            "korsat": True, "kanal": "@AqlZoneUz", "havola": "https://t.me/AqlZoneUz",
        })

    def test_endpoint_tokensiz(self):
        self.assertEqual(self.client.get("/api/v1/kanal").status_code, 401)


class QaytarishTest(TestCase):
    """
    "Qaytib keling" zanjiri — kimga, qachon va necha marta.

    Bu mantiq eng nozik joyda turadi: bir qadam noto'g'ri bo'lsa, ilova
    tashlab ketgan odamni ta'qib qila boshlaydi va javobi bitta —
    bloklash. Bloklangan odam esa butunlay yo'qoladi: keyin unga na
    e'lon, na kirish havolasi yetib boradi. Shuning uchun har bir
    chegara alohida test bilan qotirilgan.
    """

    def kim(self) -> str:
        chiqish = StringIO()
        call_command("qaytarish", "--sinov", stdout=chiqish)
        return chiqish.getvalue()

    def hisob(self, tg_id: str, ism: str):
        pupil = Pupil.objects.create(first_name=ism)
        Identity.objects.create(pupil=pupil, provider="telegram", external_id=tg_id)
        return pupil, pupil.asosiy_profil()

    def natija(self, profil, kunlar_oldin: int):
        r = LessonResult.objects.create(profile=profil, asked=6, correct=6, stars=3)
        LessonResult.objects.filter(pk=r.pk).update(
            created_at=timezone.now() - timedelta(days=kunlar_oldin)
        )

    # ------------------------------------------------------- bosqichlar

    def test_yetti_kundan_keyin_birinchi_xabar(self):
        _, profil = self.hisob("901", "Yetti")
        self.natija(profil, 8)
        self.assertIn("Yetti", self.kim())

    def test_uch_kunlik_tanaffusga_yozilmaydi(self):
        """Bu hali "yo'qolgan" emas — kunlik eslatmaning ishi."""
        _, profil = self.hisob("902", "Uch")
        self.natija(profil, 3)
        self.assertNotIn("Uch", self.kim())

    def test_bosqich_oynasidan_otib_ketgan_kutadi(self):
        """15-kun: birinchi bosqich o'tgan, ikkinchisi hali kelmagan."""
        _, profil = self.hisob("903", "Oraliq")
        self.natija(profil, 15)
        self.assertNotIn("Oraliq", self.kim())

    def test_ikkinchi_bosqich_birinchisidan_keyin_keladi(self):
        pupil, profil = self.hisob("904", "Ikkinchi")
        self.natija(profil, 22)
        # Birinchi xabar allaqachon ketgan, oxirgisi 12 kun oldin.
        Pupil.objects.filter(pk=pupil.pk).update(
            qaytarish_soni=1, qaytarish_at=timezone.now() - timedelta(days=12),
        )
        self.assertIn("Ikkinchi", self.kim())

    def test_uchtadan_keyin_butunlay_sukut(self):
        pupil, profil = self.hisob("905", "Tugagan")
        self.natija(profil, 60)
        Pupil.objects.filter(pk=pupil.pk).update(
            qaytarish_soni=3, qaytarish_at=timezone.now() - timedelta(days=30),
        )
        self.assertNotIn("Tugagan", self.kim())

    def test_yaqinda_yuborilgan_bolsa_takrorlanmaydi(self):
        """Bosqichlar qo'shilib ketmasin — orasida kamida 10 kun."""
        pupil, profil = self.hisob("906", "Yaqin")
        self.natija(profil, 22)
        Pupil.objects.filter(pk=pupil.pk).update(
            qaytarish_soni=1, qaytarish_at=timezone.now() - timedelta(days=2),
        )
        self.assertNotIn("Yaqin", self.kim())

    # ---------------------------------------------------------- chetlar

    def test_hech_qachon_oynamaganga_yozilmaydi(self):
        """U yo'qolmagan — hali boshlamagan."""
        self.hisob("907", "Boshlamagan")
        self.assertNotIn("Boshlamagan", self.kim())

    def test_bloklaganga_yozilmaydi(self):
        pupil, profil = self.hisob("908", "Bloklagan")
        self.natija(profil, 10)
        Pupil.objects.filter(pk=pupil.pk).update(bot_bloklandi_at=timezone.now())
        self.assertNotIn("Bloklagan", self.kim())

    def test_xabarni_yopgan_odamga_yozilmaydi(self):
        pupil, profil = self.hisob("909", "Yopgan")
        self.natija(profil, 10)
        Pupil.objects.filter(pk=pupil.pk).update(xabar_yopiq_at=timezone.now())
        self.assertNotIn("Yopgan", self.kim())

    def test_qaytgan_odamning_hisobi_tozalanadi(self):
        """
        Keyingi tanaffus NOLDAN boshlanadi.

        Busiz bir marta qaytarilgan odam ikkinchi safar yo'qolganda
        zanjirning o'rtasidan davom etardi — yoki umuman chaqirilmasdi.
        """
        pupil, profil = self.hisob("910", "Qaytgan")
        Pupil.objects.filter(pk=pupil.pk).update(
            qaytarish_soni=2, qaytarish_at=timezone.now() - timedelta(days=20),
        )
        self.natija(profil, 1)                      # kecha o'ynagan
        self.kim()
        pupil.refresh_from_db()
        self.assertEqual(pupil.qaytarish_soni, 0)
        self.assertIsNone(pupil.qaytarish_at)

    # ------------------------------------------------------------- til

    def test_ruscha_hisobga_ruscha_xabar(self):
        pupil, profil = self.hisob("911", "Rus")
        Pupil.objects.filter(pk=pupil.pk).update(til="ru")
        self.natija(profil, 8)
        self.assertIn("Твои звёзды", self.kim())


class XabarYopishTest(TestCase):
    """«Boshqa yozmang» tugmasi va uni /start orqali qaytarish."""

    def setUp(self):
        self.pupil = Pupil.objects.create(first_name="Charchagan")
        Identity.objects.create(
            pupil=self.pupil, provider="telegram", external_id="920",
        )

    def test_tugma_hisobni_belgilaydi(self):
        from core.management.commands import bot as B
        with patch.object(B, "api", lambda *a, **k: {"ok": True}):
            B.yangilikni_qayta_ishla({
                "callback_query": {
                    "id": "cb1", "data": "xabar_yopiq",
                    "from": {"id": 920},
                    "message": {"message_id": 5, "chat": {"id": 920}},
                },
            })
        self.pupil.refresh_from_db()
        self.assertIsNotNone(self.pupil.xabar_yopiq_at)

    def test_start_belgini_olib_tashlaydi(self):
        """Odam o'zi yozdi — demak xabarlarga qarshi emas."""
        from core.management.commands import bot as B
        Pupil.objects.filter(pk=self.pupil.pk).update(xabar_yopiq_at=timezone.now())
        with patch.object(B, "api", lambda *a, **k: {"ok": True}):
            B.yangilikni_qayta_ishla({
                "message": {
                    "chat": {"id": 920}, "from": {"id": 920, "first_name": "Charchagan"},
                    "text": "/start",
                },
            })
        self.pupil.refresh_from_db()
        self.assertIsNone(self.pupil.xabar_yopiq_at)

    def test_notanish_tugma_javobsiz_qolmaydi(self):
        """
        Telegram HAR bosishga javob kutadi: `answerCallbackQuery`
        yuborilmasa, tugma foydalanuvchining ekranida qotib qoladi.
        """
        from core.management.commands import bot as B
        chaqiruv = []
        with patch.object(B, "api", lambda usul, **k: chaqiruv.append(usul) or {"ok": True}):
            B.yangilikni_qayta_ishla({
                "callback_query": {"id": "cb2", "data": "yoq", "from": {"id": 920}},
            })
        self.assertIn("answerCallbackQuery", chaqiruv)


class TugmaRangiTest(TestCase):
    """
    Tugma ranglari (`style`, Bot API 9.4).

    Rang KO'RINISH emas, MA'NO: asosiy harakat yashil, yordamchi ko'k,
    qaytarib bo'lmaydigani qizil. Shu sabab test ranglarni emas,
    ularning qaysi tugmaga tushishini tekshiradi.
    """

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_asosiy_tugma_yashil_ikkinchisi_qizil(self, sorov):
        with self.settings(BOT_TOKEN="sinov:token"):
            xabar.yubor(
                "555", "matn",
                tugma="Qaytish", havola="https://aql-zone.uz",
                ikkinchi_tugma="Boshqa yozmang", ikkinchi_data="ochir",
            )
        qatorlar = sorov.call_args[0][1]["reply_markup"]["inline_keyboard"]
        self.assertEqual(qatorlar[0][0]["style"], "success")
        self.assertEqual(qatorlar[1][0]["style"], "danger")

    def test_uslub_bosh_bolsa_maydon_qoshilmaydi(self):
        """Telegram noma'lum `style` ga butun xabarni rad etadi."""
        self.assertNotIn("style", xabar.tugma_yasa("Matn", "", url="https://x.uz"))
        self.assertEqual(xabar.tugma_yasa("Matn", xabar.KOK)["style"], "primary")

    @patch("core.management.commands.bot.api")
    def test_start_tugmalari_ranglanadi(self, api):
        """Raqami BOR hisobga ilova tugmasi yashil bo'lib boradi."""
        from core.management.commands import bot as B

        pupil = Pupil.objects.create(first_name="Ali", last_name="Valiyev")
        Identity.objects.create(pupil=pupil, provider=Identity.TELEGRAM,
                                external_id="973358587")
        Identity.objects.create(pupil=pupil, provider=Identity.TELEFON,
                                external_id="+998901234567")

        with self.settings(SAYT_URL="https://aql-zone.uz",
                           MINI_APP_URL="https://aql-zone.uz"):
            B.salom_yubor(1, "973358587", "Ali", "Valiyev", "uz")

        # Ikkita xabar: klaviatura va birinchi kirish uchun inline tugma.
        # Ikkalasi ham yashil — bu odam yuradigan asosiy yo'l.
        xabarlar = [c for c in api.call_args_list if c[0][0] == "sendMessage"]
        self.assertEqual(len(xabarlar), 2)
        k = xabarlar[0][1]["reply_markup"]["keyboard"]
        self.assertEqual(k[0][0]["style"], "success")
        ichki = xabarlar[1][1]["reply_markup"]["inline_keyboard"]
        self.assertEqual(ichki[0][0]["style"], "success")

    @patch("core.management.commands.bot.api")
    def test_raqam_tugmasi_yashil(self, api):
        """Raqam MAJBURIY bo'lgach u ekrandagi yagona harakat."""
        from core.management.commands import bot as B

        B.raqam_sora(1, "matn", "uz")
        tugma = api.call_args[1]["reply_markup"]["keyboard"][0][0]
        self.assertEqual(tugma["style"], "success")
        self.assertTrue(tugma["request_contact"])


class BotIlovaTugmasiTest(TestCase):
    """
    Botdagi asosiy tugma — ilovani BOT ICHIDA ochishi kerak.

    Ilgari birinchi tugma sayt havolasi edi va u brauzerni ochardi:
    odam Telegram'dan chiqib ketardi, u yerda hisobga kirish qaytadan
    boshlanardi. Endi birinchi o'rinda Mini App turadi.
    """

    def tugmalar(self, mini_app="https://aql-zone.uz", sayt="https://aql-zone.uz"):
        from core.management.commands import bot as B

        with self.settings(MINI_APP_URL=mini_app, SAYT_URL=sayt):
            return B.ilova_tugmalari("uz", f"{sayt}/kirish/abc" if sayt else "")

    def test_ilova_birinchi_va_yashil(self):
        q = self.tugmalar()
        self.assertEqual(q[0][0]["web_app"], {"url": "https://aql-zone.uz"})
        self.assertEqual(q[0][0]["style"], "success")

    def test_sayt_havolasi_umuman_berilmaydi(self):
        """
        Botdan chiqadigan yagona yo'l — ilovaning O'ZI.

        Sayt havolasi yonida Telegram "tashqariga chiqasiz" strelkasini
        chizadi va odamlarning bir qismi aynan o'shani bosib brauzerga
        chiqib ketardi.
        """
        q = self.tugmalar()
        self.assertEqual(len(q), 1)
        self.assertNotIn("url", q[0][0])

    def test_mini_app_yoq_bolsa_sayt_yashilga_qaytadi(self):
        q = self.tugmalar(mini_app="")
        self.assertEqual(len(q), 1)
        self.assertIn("/kirish/abc", q[0][0]["url"])
        self.assertEqual(q[0][0]["style"], "success")


class ReklamaRangiTest(TestCase):
    """E'lon tugmasining rangi — admin tanlaydi, e'lon bilan saqlanadi."""

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_tanlangan_rang_xabarga_tushadi(self, sorov):
        r = Reklama.objects.create(
            matn="Salom", tugma=True, tugma_matni="Ochish",
            havola="https://aql-zone.uz", tugma_rangi="danger",
        )
        with self.settings(BOT_TOKEN="sinov:token"):
            R.bitta_yubor(r, "555")
        tugma = sorov.call_args[0][1]["reply_markup"]["inline_keyboard"][0][0]
        self.assertEqual(tugma["style"], "danger")

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_ilova_manzili_bot_ichida_ochiladi(self, sorov):
        r = Reklama.objects.create(
            matn="Salom", tugma=True, tugma_matni="Ochish",
            havola="https://aql-zone.uz",
        )
        with self.settings(BOT_TOKEN="sinov:token", MINI_APP_URL="https://aql-zone.uz"):
            R.bitta_yubor(r, "555")
        self.assertIn("web_app", sorov.call_args[0][1]["reply_markup"]["inline_keyboard"][0][0])

    @patch("core.xabar._sorov", return_value=(True, 200, ""))
    def test_tashqi_manzil_oddiy_havola_bolib_qoladi(self, sorov):
        """Kanal yoki boshqa saytni Mini App qilib ochib bo'lmaydi."""
        r = Reklama.objects.create(
            matn="Salom", tugma=True, tugma_matni="Kanal",
            havola="https://t.me/AqlZoneUz",
        )
        with self.settings(BOT_TOKEN="sinov:token", MINI_APP_URL="https://aql-zone.uz"):
            R.bitta_yubor(r, "555")
        tugma = sorov.call_args[0][1]["reply_markup"]["inline_keyboard"][0][0]
        self.assertNotIn("web_app", tugma)
        self.assertEqual(tugma["url"], "https://t.me/AqlZoneUz")


class DuelTest(TestCase):
    """
    Do'st bilan bellashuv.

    Sinovlar ikki narsaga qaraydi: OQIM to'g'ri ketyaptimi va
    QOIDALAR buzilmaydimi. Ikkinchisi muhimroq — bir tomonga ikki
    marta natija yozish yoki o'zini o'zi chaqirish kabi holatlar
    brauzerda ko'rinmaydi, lekin bittasi o'tib ketsa jadval yolg'on
    bo'lib qoladi.
    """

    def kir(self, device: str) -> dict:
        r = self.client.post(
            "/api/v1/auth/device",
            {"deviceId": device, "platform": "web"},
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 200, r.content)
        return {"HTTP_AUTHORIZATION": f"Bearer {r.json()['token']}"}

    def setUp(self):
        self.a = self.kir("dev-aaaa1111bbbb2222cccc")
        self.b = self.kir("dev-dddd3333eeee4444ffff")

    def boshla(self) -> dict:
        r = self.client.post("/api/v1/duel", {}, content_type="application/json", **self.a)
        self.assertEqual(r.status_code, 201, r.content)
        return r.json()

    def natija(self, kod: str, kim: dict, ball: int, xato: int = 0, sanoq=None):
        return self.client.post(
            f"/api/v1/duel/{kod}/natija",
            {"ball": ball, "xato": xato, "sanoq": sanoq if sanoq is not None else [ball]},
            content_type="application/json", **kim,
        )

    def tayyor(self, ball: int = 30) -> str:
        """Chaqirgan o'ynab bo'lgan duel kodini qaytaradi."""
        kod = self.boshla()["kod"]
        self.assertEqual(self.natija(kod, self.a, ball).status_code, 200)
        return kod

    # --------------------------------------------------------- oqim

    def test_boshlaganda_urug_va_oyin_keladi(self):
        d = self.boshla()
        self.assertIn(d["oyin"], D.OYINLAR)
        self.assertGreater(d["urug"], 0)
        self.assertEqual(d["holat"], "boshlanmagan")

    def test_toliq_oqim_golib_aniqlanadi(self):
        kod = self.tayyor(ball=30)

        # Chaqiruvni ko'rish — ball KO'RINMAYDI.
        r = self.client.get(f"/api/v1/duel/{kod}", **self.b)
        self.assertEqual(r.status_code, 200)
        self.assertNotIn("ball", r.json())
        self.assertEqual(r.json()["holat"], "kutyapti")

        # Qabul qilish — urug' va raqib sanog'i keladi.
        r = self.client.post(f"/api/v1/duel/{kod}/qabul", {},
                             content_type="application/json", **self.b)
        self.assertEqual(r.status_code, 200, r.content)
        self.assertIn("urug", r.json())
        self.assertEqual(r.json()["raqibSanoq"], [30])

        # Ikkinchi o'yinchi ko'proq to'pladi — u yutadi.
        r = self.natija(kod, self.b, 41)
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()["golib"], "qabul")
        self.assertEqual(r.json()["meniki"], 41)
        self.assertEqual(r.json()["raqib"], 30)

        d = Duel.objects.get(kod=kod)
        self.assertEqual(d.holat, "tugadi")
        self.assertIsNotNone(d.tugadi_at)

    def test_ikkala_oyinchi_bir_xil_urugni_oladi(self):
        kod = self.tayyor()
        urug = Duel.objects.get(kod=kod).urug
        r = self.client.post(f"/api/v1/duel/{kod}/qabul", {},
                             content_type="application/json", **self.b)
        self.assertEqual(r.json()["urug"], urug)

    def test_teng_ballda_kam_xato_yutadi(self):
        kod = self.boshla()["kod"]
        self.natija(kod, self.a, 30, xato=4)
        self.natija(kod, self.b, 30, xato=1)
        self.assertEqual(Duel.objects.get(kod=kod).golib, "qabul")

    def test_hammasi_teng_bolsa_durang(self):
        kod = self.boshla()["kod"]
        self.natija(kod, self.a, 30, xato=2)
        self.natija(kod, self.b, 30, xato=2)
        self.assertEqual(Duel.objects.get(kod=kod).golib, "durang")

    # --------------------------------------------------------- qoidalar

    def test_ozini_ozi_chaqira_olmaydi(self):
        kod = self.tayyor()
        r = self.client.post(f"/api/v1/duel/{kod}/qabul", {},
                             content_type="application/json", **self.a)
        self.assertEqual(r.status_code, 409)

    def test_tayyor_bolmagan_chaqiruv_qabul_qilinmaydi(self):
        kod = self.boshla()["kod"]          # chaqirgan hali o'ynamagan
        r = self.client.post(f"/api/v1/duel/{kod}/qabul", {},
                             content_type="application/json", **self.b)
        self.assertEqual(r.status_code, 409)

    def test_bir_tomon_ikki_marta_natija_yubora_olmaydi(self):
        kod = self.tayyor()
        self.assertEqual(self.natija(kod, self.a, 99).status_code, 409)

    def test_oynalgan_duel_qayta_oynalmaydi(self):
        kod = self.tayyor()
        self.natija(kod, self.b, 41)
        # Uchinchi odam ham, o'sha odam ham qayta o'ynay olmaydi.
        c = self.kir("dev-9999888877776666aaaa")
        self.assertEqual(self.natija(kod, self.b, 99).status_code, 409)
        r = self.client.post(f"/api/v1/duel/{kod}/qabul", {},
                             content_type="application/json", **c)
        self.assertEqual(r.status_code, 409)

    def test_muddati_otgan_chaqiruv_ochilmaydi(self):
        kod = self.tayyor()
        eski = timezone.now() - timedelta(hours=Duel.MUDDAT_SOAT + 1)
        Duel.objects.filter(kod=kod).update(created_at=eski)
        r = self.client.post(f"/api/v1/duel/{kod}/qabul", {},
                             content_type="application/json", **self.b)
        self.assertEqual(r.status_code, 410)

    def test_haqiqatga_sigmaydigan_ball_rad_etiladi(self):
        kod = self.boshla()["kod"]
        # 60 soniyada 3 balldan tez — jismonan mumkin emas.
        # Chegara ENG UZUN dueldan hisoblanadi: shartlar tanlanadigan
        # bo'lgach, 60 soniyaga bog'lab qo'yish 90 soniyalik duelning
        # halol natijasini rad etardi.
        self.assertEqual(
            self.natija(kod, self.a, D.MAX_VAQT * D.MAX_BALL_SONIYA + 1).status_code, 400)
        self.assertEqual(self.natija(kod, self.a, -5).status_code, 400)

    def test_topilmagan_kod_404(self):
        r = self.client.get("/api/v1/duel/yoq-bunday-kod", **self.b)
        self.assertEqual(r.status_code, 404)

    def test_kunlik_chegara(self):
        for _ in range(D.KUNLIK_CHEGARA):
            self.client.post("/api/v1/duel", {}, content_type="application/json", **self.a)
        r = self.client.post("/api/v1/duel", {}, content_type="application/json", **self.a)
        self.assertEqual(r.status_code, 429)

    def test_kodlar_takrorlanmaydi(self):
        kodlar = {self.boshla()["kod"] for _ in range(10)}
        self.assertEqual(len(kodlar), 10)

    # --------------------------------------------------------- ro'yxat

    def test_royxatda_ikkala_tomon_ham_koradi(self):
        kod = self.tayyor(ball=30)
        self.natija(kod, self.b, 41)

        r = self.client.get("/api/v1/duel/royxat", **self.a)
        yozuv = r.json()["duellar"][0]
        self.assertTrue(yozuv["menChaqirdim"])
        self.assertFalse(yozuv["yutdim"])
        self.assertEqual(yozuv["meniki"], 30)

        r = self.client.get("/api/v1/duel/royxat", **self.b)
        yozuv = r.json()["duellar"][0]
        self.assertFalse(yozuv["menChaqirdim"])
        self.assertTrue(yozuv["yutdim"])
        self.assertEqual(yozuv["meniki"], 41)


class DuelYanaTest(TestCase):
    """
    "Yana o'ynaymizmi?" va umumiy hisob.

    Ikkala xususiyat bitta maqsadga xizmat qiladi: duel bir martalik
    o'yin bo'lib qolmasin. Shuning uchun sinovlar ham asosan
    QOIDALARGA qaraydi — yangi duel faqat ikkalasi rozi bo'lganda va
    ikkalasi ham chindan ekran oldida turganda boshlanishi kerak.
    """

    def kir(self, device: str) -> dict:
        r = self.client.post(
            "/api/v1/auth/device",
            {"deviceId": device, "platform": "web"},
            content_type="application/json",
        )
        return {"HTTP_AUTHORIZATION": f"Bearer {r.json()['token']}"}

    def setUp(self):
        self.a = self.kir("dev-yana-aaaa1111bbbb2222")
        self.b = self.kir("dev-yana-cccc3333dddd4444")

    def natija(self, kod: str, kim: dict, ball: int):
        return self.client.post(
            f"/api/v1/duel/{kod}/natija",
            {"ball": ball, "xato": 0, "sanoq": [ball]},
            content_type="application/json", **kim,
        )

    def oyna(self, a_ball: int = 30, b_ball: int = 20) -> str:
        """To'liq bitta duel — ikkalasi o'ynab bo'lgan kodni qaytaradi."""
        r = self.client.post("/api/v1/duel", {}, content_type="application/json", **self.a)
        kod = r.json()["kod"]
        self.natija(kod, self.a, a_ball)
        self.client.post(f"/api/v1/duel/{kod}/qabul", {},
                         content_type="application/json", **self.b)
        self.natija(kod, self.b, b_ball)
        return kod

    def yana(self, kod: str, kim: dict):
        return self.client.post(f"/api/v1/duel/{kod}/yana", {},
                                content_type="application/json", **kim)

    # --------------------------------------------------- qayta bellashuv

    def test_ikkalasi_bosgach_yangi_duel_boshlanadi(self):
        kod = self.oyna()
        eski = Duel.objects.get(kod=kod)

        r = self.yana(kod, self.a)
        self.assertEqual(r.status_code, 200, r.content)
        # Bitta tomon — hali hech narsa yasalmaydi.
        self.assertTrue(r.json()["menYana"])
        self.assertEqual(r.json()["keyingiKod"], "")

        r = self.yana(kod, self.b)
        yangi_kod = r.json()["keyingiKod"]
        self.assertTrue(yangi_kod)

        yangi = Duel.objects.get(kod=yangi_kod)
        # Shartlar o'sha, urug' YANGI: eski urug' bilan savollar ham
        # eski bo'lardi va ikkinchi bellashuv "kim eslab qolgan"
        # o'yiniga aylanardi.
        self.assertEqual(yangi.oyin, eski.oyin)
        self.assertEqual(yangi.savollar_soni, eski.savollar_soni)
        self.assertEqual(yangi.vaqt, eski.vaqt)
        self.assertNotEqual(yangi.urug, eski.urug)
        # Ikkalasi ham qatnashchi va o'yin darhol boshlanadi.
        self.assertEqual(yangi.chaqirgan_id, eski.chaqirgan_id)
        self.assertEqual(yangi.qabul_id, eski.qabul_id)
        self.assertTrue(yangi.ikkalasi_tayyormi)
        self.assertIsNotNone(yangi.boshlanadi)
        self.assertEqual(Duel.objects.get(kod=kod).keyingi_id, yangi.pk)

    def test_ikkinchi_bosish_yangi_duel_yasamaydi(self):
        kod = self.oyna()
        self.yana(kod, self.a)
        birinchi = self.yana(kod, self.b).json()["keyingiKod"]
        # Takroriy bosish o'sha kodni qaytaradi, ikkinchi duel EMAS.
        ikkinchi = self.yana(kod, self.a).json()["keyingiKod"]
        self.assertEqual(birinchi, ikkinchi)
        self.assertEqual(Duel.objects.count(), 2)

    def test_raqib_ketgan_bolsa_boshlanmaydi(self):
        """Taklifni bosib chiqib ketgan odam bilan duel boshlanmaydi."""
        kod = self.oyna()
        self.yana(kod, self.a)
        # A ning belgisi eskirdi — u endi ekran oldida emas.
        Duel.objects.filter(kod=kod).update(
            chaqirgan_belgi=timezone.now() - timedelta(seconds=Duel.BELGI_SONIYA + 5),
        )
        r = self.yana(kod, self.b)
        self.assertEqual(r.json()["keyingiKod"], "")
        self.assertEqual(Duel.objects.count(), 1)

    def test_tugamagan_duelda_yana_ishlamaydi(self):
        r = self.client.post("/api/v1/duel", {}, content_type="application/json", **self.a)
        kod = r.json()["kod"]
        self.assertEqual(self.yana(kod, self.a).status_code, 409)

    def test_begona_odam_yana_bosa_olmaydi(self):
        kod = self.oyna()
        c = self.kir("dev-yana-eeee5555ffff6666")
        self.assertEqual(self.yana(kod, c).status_code, 403)

    def test_holat_yangi_duel_kodini_beradi(self):
        """Birinchi bosgan odam yangi kodni HOLAT so'rovidan biladi."""
        kod = self.oyna()
        self.yana(kod, self.a)
        self.yana(kod, self.b)
        h = self.client.get(f"/api/v1/duel/{kod}/holat", **self.a).json()
        self.assertTrue(h["keyingiKod"])
        self.assertTrue(h["raqibYana"])

    def test_qatnashchi_urugni_koradi(self):
        """Yangi duelga ikkala tomon ham `korish` orqali kiradi."""
        kod = self.oyna()
        self.yana(kod, self.a)
        yangi = self.yana(kod, self.b).json()["keyingiKod"]

        for kim in (self.a, self.b):
            r = self.client.get(f"/api/v1/duel/{yangi}", **kim)
            self.assertIn("urug", r.json(), r.content)

        # Begona odam esa ololmaydi.
        c = self.kir("dev-yana-7777888899990000")
        r = self.client.get(f"/api/v1/duel/{yangi}", **c)
        self.assertNotIn("urug", r.json())

    # --------------------------------------------------- umumiy hisob

    def test_umumiy_hisob_sanaladi(self):
        self.oyna(a_ball=30, b_ball=20)     # A yutdi
        self.oyna(a_ball=10, b_ball=40)     # B yutdi
        kod = self.oyna(a_ball=25, b_ball=25)   # durang (xato ham teng)

        r = self.natija(kod, self.b, 25)    # takroriy — javob 409
        self.assertEqual(r.status_code, 409)

        h = self.client.get(f"/api/v1/duel/{kod}/holat", **self.a).json()["hisob"]
        self.assertEqual(h, {"men": 1, "raqib": 1, "durang": 1, "jami": 3})

        # Ikkinchi tomonda hisob TESKARI ko'rinadi.
        h = self.client.get(f"/api/v1/duel/{kod}/holat", **self.b).json()["hisob"]
        self.assertEqual(h, {"men": 1, "raqib": 1, "durang": 1, "jami": 3})

    def test_natija_javobida_hisob_keladi(self):
        self.oyna(a_ball=30, b_ball=20)
        r = self.client.post("/api/v1/duel", {}, content_type="application/json", **self.a)
        kod = r.json()["kod"]
        self.natija(kod, self.a, 30)
        self.client.post(f"/api/v1/duel/{kod}/qabul", {},
                         content_type="application/json", **self.b)
        # Ikkinchi tomon tugatdi — hisob shu duel bilan birga keladi.
        hisob = self.natija(kod, self.b, 50).json()["hisob"]
        self.assertEqual(hisob, {"men": 1, "raqib": 1, "durang": 0, "jami": 2})

    def test_tugamagan_duel_hisobga_kirmaydi(self):
        self.client.post("/api/v1/duel", {}, content_type="application/json", **self.a)
        kod = self.oyna(a_ball=30, b_ball=20)
        h = self.client.get(f"/api/v1/duel/{kod}/holat", **self.a).json()["hisob"]
        self.assertEqual(h["jami"], 1)

    def test_chaqiruvni_ochganda_hisob_korinadi(self):
        """Umumiy hisob duel OLDIDA ham ko'rinadi — qabul qilish sababi."""
        self.oyna(a_ball=30, b_ball=20)
        r = self.client.post("/api/v1/duel", {}, content_type="application/json", **self.a)
        kod = r.json()["kod"]
        self.natija(kod, self.a, 30)

        hisob = self.client.get(f"/api/v1/duel/{kod}", **self.b).json()["hisob"]
        self.assertEqual(hisob, {"men": 0, "raqib": 1, "durang": 0, "jami": 1})


class JoyNomiTest(TestCase):
    """
    Hisobotdagi "joy" ustuni — dars, kunlik sinov va blok test.

    NEGA SINOV KERAK. Kunlik sinov va blok test darslar xaritasida
    TURMAYDI: ular `unit`/`lesson` sifatida 99 va 98 ni oladi. Ilgari
    bu hisobga olinmasdi va hisobotda "9-sinf · 100-bob · 100-dars"
    degan qator chiqardi — raqami ham, o'zi ham ma'nosiz.

    Xato jimgina o'tadigan turdan: panel ochiladi, hech narsa
    yiqilmaydi, faqat qator tushunarsiz bo'ladi va uni hech kim
    xato deb o'ylamaydi.
    """

    def test_oddiy_dars_bob_va_dars_raqami_bilan(self):
        self.assertEqual(
            boshqaruv.joy_nomi(9, 2, 1, "Kvadrat tenglama"),
            "9-sinf algebra · 3-bob · 2-dars",
        )

    def test_kunlik_sinov_oz_nomi_bilan(self):
        self.assertEqual(
            boshqaruv.joy_nomi(9, 99, 99, "Kunlik sinov"),
            "9-sinf algebra · Kunlik sinov",
        )

    def test_blok_test_oz_nomi_bilan(self):
        self.assertEqual(
            boshqaruv.joy_nomi(5, 98, 98, "Blok test"),
            "5-sinf · Blok test",
        )

    def test_bob_testida_bobning_nomi_ham_korinadi(self):
        """Qaysi mavzu ekani hisobotdan bilinishi kerak."""
        self.assertEqual(
            boshqaruv.joy_nomi(109, 98, 98, "Blok test · Aylana"),
            "9-sinf geometriya · Blok test · Aylana",
        )

    def test_nomsiz_maxsus_yozuv_yiqilmaydi(self):
        """Eski yozuvda `lesson_name` bo'sh bo'lishi mumkin."""
        self.assertEqual(boshqaruv.joy_nomi(5, 98, 98, ""), "5-sinf · Mashq")
        self.assertEqual(boshqaruv.joy_nomi(5, 98, 98, None), "5-sinf · Mashq")


class BoshqaruvBlokTest(TestCase):
    """
    Blok test natijasi panelga tushadimi va bob grafigini buzmaydimi.

    Ikkinchisi muhimroq: bob grafigi darslar xaritasi bo'yicha va
    unga 98 kodli yozuv tushsa, u "99-bob" bo'lib grafikning o'ng
    chekkasini egallab olardi.
    """

    def setUp(self):
        # `registered_at` SHART: panel ro'yxatdan o'tmagan hisoblarni
        # butunlay chetlab o'tadi (`boshqaruv.ROYXAT`). Usiz jadval
        # bo'sh chiqadi va sinov o'zi yasagan ma'lumotni ko'rmaydi.
        self.pupil = Pupil.objects.create(first_name="Sardor", registered_at=timezone.now())
        self.profil = Profile.objects.create(pupil=self.pupil, name="Sardor")

    def natija(self, unit, lesson, nom, asked=10, correct=7):
        LessonResult.objects.create(
            profile=self.profil,
            grade=9, unit=unit, lesson=lesson, lesson_name=nom,
            asked=asked, correct=correct, mistakes=asked - correct,
            stars=0, duration_ms=60000,
        )

    def test_blok_test_darslar_royxatida_koinadi(self):
        self.natija(0, 0, "Ratsional sonlar")
        self.natija(98, 98, "Blok test")
        d = boshqaruv.statistika(30)
        joylar = [x["joy"] for x in d["mashhur"]]
        self.assertIn("9-sinf algebra · Blok test", joylar)

    def test_blok_test_bob_grafigiga_tushmaydi(self):
        self.natija(0, 0, "Ratsional sonlar")
        self.natija(1, 0, "Tengsizliklar")
        self.natija(98, 98, "Blok test")
        d = boshqaruv.statistika(30)
        nomlar = [b["nom"] for b in d["boblar"]]
        self.assertEqual(nomlar, ["1-bob", "2-bob"])
        self.assertNotIn("99-bob", nomlar)


class BoshqaruvDuelTest(TestCase):
    """Boshqaruv panelidagi duel hisoboti."""

    def setUp(self):
        self.p1 = Profile.objects.create(pupil=Pupil.objects.create(first_name="A"), name="Aziz")
        self.p2 = Profile.objects.create(pupil=Pupil.objects.create(first_name="M"), name="Malika")

    def duel(self, **kw):
        asos = dict(kod=f"k{Duel.objects.count()}", urug=1, oyin="tezkor", chaqirgan=self.p1)
        return Duel.objects.create(**{**asos, **kw})

    def test_qabul_foizi_tayyorlardan_hisoblanadi(self):
        # Tugagan
        self.duel(chaqirgan_tugatdi=True, qabul=self.p2, qabul_tugatdi=True, golib="qabul")
        # Kutayotgan
        self.duel(chaqirgan_tugatdi=True)
        # Tugatilmagan — foizga KIRMAYDI, chunki raqib uni umuman ko'rmagan
        self.duel()

        s = boshqaruv.duel_statistika(30)
        self.assertEqual(s["duel"]["jami"], 3)
        self.assertEqual(s["duel"]["tayyor"], 2)
        self.assertEqual(s["duel"]["qabul_foiz"], 50)
        self.assertEqual(s["duel"]["boshlanmagan"], 1)

    def test_javobsiz_qolgan_alohida_sanaladi(self):
        d = self.duel(chaqirgan_tugatdi=True)
        Duel.objects.filter(pk=d.pk).update(
            created_at=timezone.now() - timedelta(hours=Duel.MUDDAT_SOAT + 2)
        )
        s = boshqaruv.duel_statistika(30)
        self.assertEqual(s["duel"]["javobsiz"], 1)
        self.assertEqual(s["duel"]["kutyapti"], 0)

    def test_sahifa_ochiladi(self):
        self.duel(chaqirgan_tugatdi=True, qabul=self.p2, qabul_tugatdi=True,
                  chaqirgan_ball=30, qabul_ball=41, golib="qabul")
        with self.settings(ADMIN_TG=["555"], BOSHQARUV_YONIQ=True):
            self.client.cookies[boshqaruv.COOKIE] = signing.dumps(
                {"ok": True, "tg": "555"}, salt=boshqaruv.TUZ
            )
            r = self.client.get("/boshqaruv/duel")
        self.assertEqual(r.status_code, 200)
        matn = r.content.decode()
        self.assertIn("Aziz", matn)
        self.assertIn("Malika", matn)
        self.assertIn("30 : 41", matn)


class DuelJonliTest(TestCase):
    """
    Jonli duel: ikkalasi bir vaqtda o'ynaydi.

    Eng muhim tekshiruv — G'OLIB FAQAT IKKALASI TUGATGACH aniqlanadi.
    Asinxron duelda tartib qat'iy edi va shu sababdan g'olibni qabul
    qilgan tomon tugatishi bilan hisoblasa bo'lardi; jonli duelda esa
    kim birinchi tugatishi oldindan ma'lum emas.
    """

    def kir(self, device: str) -> dict:
        r = self.client.post(
            "/api/v1/auth/device",
            {"deviceId": device, "platform": "web"},
            content_type="application/json",
        )
        return {"HTTP_AUTHORIZATION": f"Bearer {r.json()['token']}"}

    def setUp(self):
        self.a = self.kir("dev-jonli-aaaa1111bbbb")
        self.b = self.kir("dev-jonli-cccc2222dddd")
        r = self.client.post("/api/v1/duel", {}, content_type="application/json", **self.a)
        self.kod = r.json()["kod"]

    def tayyor(self, kim: dict):
        return self.client.post(f"/api/v1/duel/{self.kod}/tayyor", {},
                                content_type="application/json", **kim)

    def holat(self, kim: dict):
        return self.client.get(f"/api/v1/duel/{self.kod}/holat", **kim).json()

    def ball(self, kim: dict, ball: int):
        return self.client.post(f"/api/v1/duel/{self.kod}/ball",
                                {"ball": ball, "sanoq": [ball]},
                                content_type="application/json", **kim)

    def natija(self, kim: dict, ball: int, xato: int = 0):
        return self.client.post(f"/api/v1/duel/{self.kod}/natija",
                                {"ball": ball, "xato": xato, "sanoq": [ball]},
                                content_type="application/json", **kim)

    # ------------------------------------------------------ tayyorlik

    def test_bittasi_tayyor_bolsa_oyin_boshlanmaydi(self):
        r = self.tayyor(self.a)
        self.assertEqual(r.status_code, 200, r.content)
        self.assertIsNone(r.json()["boshlanishSoniya"])
        self.assertTrue(r.json()["menTayyor"])
        self.assertFalse(r.json()["raqibBor"])

    def test_ikkalasi_tayyor_bolsa_sanoq_boshlanadi(self):
        self.tayyor(self.a)
        r = self.tayyor(self.b)
        self.assertEqual(r.status_code, 200, r.content)
        qolgan = r.json()["boshlanishSoniya"]
        self.assertIsNotNone(qolgan)
        self.assertLessEqual(qolgan, Duel.SANOQ_SONIYA)
        self.assertGreater(qolgan, 0)

        # Ikkala tomon ham bir xil vaqtni ko'radi (farq bir soniyagacha).
        self.assertAlmostEqual(self.holat(self.a)["boshlanishSoniya"], qolgan, delta=1.5)

    def test_boshlanish_vaqti_ikki_marta_yozilmaydi(self):
        self.tayyor(self.a)
        self.tayyor(self.b)
        birinchi = Duel.objects.get(kod=self.kod).boshlanadi
        self.tayyor(self.b)                       # takroriy bosish
        self.assertEqual(Duel.objects.get(kod=self.kod).boshlanadi, birinchi)

    def test_uchinchi_odam_qosila_olmaydi(self):
        self.tayyor(self.a)
        self.tayyor(self.b)
        c = self.kir("dev-jonli-eeee3333ffff")
        self.assertEqual(self.tayyor(c).status_code, 409)
        self.assertEqual(
            self.client.get(f"/api/v1/duel/{self.kod}/holat", **c).status_code, 409)

    # ------------------------------------------------------ jonli ball

    def test_ball_raqibga_korinadi(self):
        self.tayyor(self.a); self.tayyor(self.b)
        self.ball(self.a, 12)
        self.assertEqual(self.holat(self.b)["raqibBall"], 12)
        self.ball(self.b, 20)
        self.assertEqual(self.holat(self.a)["raqibBall"], 20)

    def test_kechikkan_sorov_ballni_orqaga_tashlamaydi(self):
        self.tayyor(self.a); self.tayyor(self.b)
        self.ball(self.a, 20)
        self.ball(self.a, 12)                     # tarmoqda kechikib kelgan eski qiymat
        self.assertEqual(self.holat(self.b)["raqibBall"], 20)

    def test_jonli_ball_duelni_yopmaydi(self):
        self.tayyor(self.a); self.tayyor(self.b)
        self.ball(self.a, 30)
        d = Duel.objects.get(kod=self.kod)
        self.assertFalse(d.chaqirgan_tugatdi)
        self.assertEqual(d.golib, "")

    # ------------------------------------------------------ yakun

    def test_golib_faqat_ikkalasi_tugatgach(self):
        self.tayyor(self.a); self.tayyor(self.b)

        # Qabul qilgan BIRINCHI bo'lib tugatdi — asinxron duelda bunday
        # bo'lishi mumkin emas edi.
        r = self.natija(self.b, 41)
        self.assertEqual(r.status_code, 200, r.content)
        self.assertFalse(r.json()["tugadi"])
        self.assertEqual(r.json()["golib"], "")

        r = self.natija(self.a, 30)
        self.assertTrue(r.json()["tugadi"])
        self.assertEqual(r.json()["golib"], "qabul")
        self.assertEqual(r.json()["meniki"], 30)
        self.assertEqual(r.json()["raqib"], 41)

        d = Duel.objects.get(kod=self.kod)
        self.assertEqual(d.holat, "tugadi")
        self.assertIsNone(d.boshlanadi)

    def test_birinchi_tugatgan_raqibni_kutadi(self):
        self.tayyor(self.a); self.tayyor(self.b)
        self.natija(self.a, 30)
        h = self.holat(self.a)
        self.assertFalse(h["raqibTugadi"])
        self.natija(self.b, 25)
        self.assertTrue(self.holat(self.a)["raqibTugadi"])
        self.assertEqual(self.holat(self.a)["golib"], "chaqirgan")

    def test_belgisi_eskirgan_raqib_shu_yerda_emas(self):
        self.tayyor(self.a); self.tayyor(self.b)
        eski = timezone.now() - timedelta(seconds=Duel.BELGI_SONIYA + 5)
        Duel.objects.filter(kod=self.kod).update(qabul_belgi=eski)
        self.assertFalse(self.holat(self.a)["raqibShuYerda"])

    def test_jonli_duel_asinxronni_buzmaydi(self):
        """Chaqiruv havolasi jonli boshlanmagan bo'lsa eski yo'l ishlaydi."""
        r = self.client.post("/api/v1/duel", {}, content_type="application/json", **self.a)
        kod = r.json()["kod"]
        self.client.post(f"/api/v1/duel/{kod}/natija", {"ball": 20, "xato": 1, "sanoq": [20]},
                         content_type="application/json", **self.a)
        r = self.client.post(f"/api/v1/duel/{kod}/qabul", {},
                             content_type="application/json", **self.b)
        self.assertEqual(r.status_code, 200, r.content)
        self.assertEqual(r.json()["raqibSanoq"], [20])


class BotKlaviaturaTest(TestCase):
    """
    Botdagi doimiy klaviatura.

    Har bir tugma ilovaning AYNAN o'z ekranini ochishi kerak — "ilovani
    oching, keyin o'zingiz toping" emas. Bu sinov aynan shuni tekshiradi:
    tugmalar `web_app` bo'lishi va manzillari to'g'ri bo'lishi.
    """

    def klaviatura(self, til: str = "uz"):
        from core.management.commands import bot as B

        with self.settings(MINI_APP_URL="https://aql-zone.uz"):
            return B.asosiy_klaviatura(til)

    def tugmalar(self, til: str = "uz"):
        return [t for qator in self.klaviatura(til)["keyboard"] for t in qator]

    def test_har_bir_tugma_ilovani_ozi_ochadi(self):
        """
        Tugma bosilishi bilan ilova ochiladi — oraliq "Ochish" xabari
        yo'q. Ilgari ular matn yuborardi va odam reyting o'rniga yana
        bitta tugmani ko'rardi.
        """
        kutilgan = {
            M("tIlova", "uz"): "https://aql-zone.uz",
            M("tOyinlar", "uz"): "https://aql-zone.uz/oyinlar",
            M("tDuel", "uz"): "https://aql-zone.uz/oyinlar/duel",
            M("tMaydon", "uz"): "https://aql-zone.uz/oyinlar/maydon",
            M("tReyting", "uz"): "https://aql-zone.uz/reyting",
        }
        tugmalar = {t["text"]: t for t in self.tugmalar()}
        for matn, manzil in kutilgan.items():
            self.assertEqual(tugmalar[matn]["web_app"]["url"], manzil, matn)

        # "Yordam" — ilovaga olib bormaydigan yagona tugma.
        self.assertNotIn("web_app", tugmalar[M("tYordamTugma", "uz")])

    @patch("core.management.commands.bot.api")
    def test_eski_klaviaturadagi_matn_ham_ishlaydi(self, api):
        """
        Telegram ekrandagi klaviaturani o'zi yangilamaydi: eski matnli
        tugma bosilishi mumkin. Bunda bot avvalgidek inline tugma bilan
        javob beradi.
        """
        from core.management.commands import bot as B

        kutilgan = {
            "tIlova": "https://aql-zone.uz",
            "tOyinlar": "https://aql-zone.uz/oyinlar",
            "tDuel": "https://aql-zone.uz/oyinlar/duel",
            "tMaydon": "https://aql-zone.uz/oyinlar/maydon",
            "tReyting": "https://aql-zone.uz/reyting",
        }
        pupil = Pupil.objects.create(first_name="Ali", last_name="Valiyev")
        Identity.objects.create(pupil=pupil, provider=Identity.TELEGRAM, external_id="777")
        Identity.objects.create(pupil=pupil, provider=Identity.TELEFON,
                                external_id="+998900000777")

        for kalit, manzil in kutilgan.items():
            api.reset_mock()
            with self.settings(MINI_APP_URL="https://aql-zone.uz"):
                B.yangilikni_qayta_ishla({"message": {
                    "chat": {"id": 1}, "from": {"id": 777, "language_code": "uz"},
                    "text": M(kalit, "uz"),
                }})
            tugmalar = [
                t for c in api.call_args_list
                for q in (c[1].get("reply_markup") or {}).get("inline_keyboard", [])
                for t in q
            ]
            self.assertTrue(tugmalar, kalit)
            self.assertEqual(tugmalar[0]["web_app"]["url"], manzil, kalit)

    def test_raqam_tugmasi_klaviaturada_yoq(self):
        """
        Raqam bir marta beriladi.

        Tugma undan keyin hech qachon kerak bo'lmaydi, lekin ekranning
        sakkizdan birini egallab turardi. `/raqam` buyrug'i qoladi —
        kerak bo'lganda topiladi, lekin yo'lda turmaydi.
        """
        matnlar = [t["text"] for t in self.tugmalar()]
        self.assertNotIn(M("tRaqamTugma", "uz"), matnlar)
        self.assertIn(M("tYordamTugma", "uz"), matnlar)

    def test_klaviatura_yopiladi_va_moslashuvchan(self):
        """
        `is_persistent` BO'LMASLIGI kerak.

        U bilan Telegram kiritish maydonidagi klaviatura belgisini olib
        tashlaydi: oltita tugma ekranning yarmini egallab qoladi va uni
        yig'ib bo'lmaydi. Android'da "ortga" ham ishlamaydi — u avval
        klaviaturani yopmoqchi bo'ladi, klaviatura esa darrov qaytadi.
        """
        k = self.klaviatura()
        self.assertNotIn("is_persistent", k)
        self.assertTrue(k["resize_keyboard"])

    def test_mini_app_yoq_bolsa_klaviatura_chizilmaydi(self):
        """Yarim ishlaydigan tugma — yo'qidan yomonroq."""
        from core.management.commands import bot as B

        with self.settings(MINI_APP_URL=""):
            self.assertIsNone(B.asosiy_klaviatura("uz"))

    def test_ruscha_klaviaturada_ham_hamma_tugma_bor(self):
        self.assertEqual(len(self.tugmalar("ru")), len(self.tugmalar("uz")))

    @patch("core.management.commands.bot.api")
    def test_duel_buyrugi_duel_ekranini_ochadi(self, api):
        from core.management.commands import bot as B

        with self.settings(MINI_APP_URL="https://aql-zone.uz"):
            B.bolimni_yubor(1, "uz", B.DUEL_YOLI, "duelHaqida")
        tugma = api.call_args[1]["reply_markup"]["inline_keyboard"][0][0]
        self.assertEqual(tugma["web_app"]["url"], "https://aql-zone.uz/oyinlar/duel")
        self.assertEqual(tugma["style"], "success")

    def test_buyruqlar_royxatida_yangi_bolimlar_bor(self):
        from core.management.commands import bot as B

        nomlar = {c for c, _ in B.BUYRUQLAR}
        self.assertTrue({"duel", "maydon", "reyting"} <= nomlar)


class BotTugmaRangiTest(TestCase):
    """Klaviaturadagi har bir tugmaning rangi — hammasi ranglangan."""

    def tugmalar(self):
        from core.management.commands import bot as B

        with self.settings(MINI_APP_URL="https://aql-zone.uz"):
            k = B.asosiy_klaviatura("uz")
        return {t["text"]: t.get("style") for q in k["keyboard"] for t in q}

    def test_hamma_tugma_rangli(self):
        self.assertTrue(all(self.tugmalar().values()), self.tugmalar())

    def test_yordam_qizil_darslar_yashil(self):
        r = self.tugmalar()
        self.assertEqual(r[M("tYordamTugma", "uz")], "danger")
        self.assertEqual(r[M("tIlova", "uz")], "success")


@override_settings(RAQAM_MAJBURIY_DAN="2020-01-01")
class RaqamMajburiyTest(TestCase):
    """
    Raqam MAJBURIY: usiz ilovaga o'tkazilmaydi.

    Sabab hisobning o'zida: bola telefonni almashtirsa yoki brauzer
    xotirasi tozalansa, qurilma tokeni yo'qoladi va butun progressi
    begona hisobda qolib ketardi. Raqam — uni qaytaradigan yagona narsa.
    """

    def setUp(self):
        from core.management.commands import bot as B

        self.B = B

    def hisob(self, tg_id: str, raqam: str = ""):
        p = Pupil.objects.create(first_name="Ali", last_name="Valiyev")
        Identity.objects.create(pupil=p, provider=Identity.TELEGRAM, external_id=tg_id)
        if raqam:
            Identity.objects.create(pupil=p, provider=Identity.TELEFON, external_id=raqam)
        return p

    @patch("core.management.commands.bot.api")
    def test_raqamsiz_startda_ilova_tugmasi_berilmaydi(self, api):
        with self.settings(SAYT_URL="https://aql-zone.uz",
                           MINI_APP_URL="https://aql-zone.uz"):
            self.B.salom_yubor(1, "111", "Ali", "Valiyev", "uz")

        # Kontakt tugmasi yuborilgan bo'lishi kerak.
        self.assertTrue(
            any(
                t.get("request_contact")
                for c in api.call_args_list
                for qator in (c[1].get("reply_markup") or {}).get("keyboard", [])
                for t in qator
            ),
            "raqam so'ralmadi",
        )
        # Hech qayerda ilovani ochadigan tugma yo'q.
        for c in api.call_args_list:
            self.assertNotIn("inline_keyboard", c[1].get("reply_markup", {}))

    @patch("core.management.commands.bot.api")
    def test_raqam_bor_bolsa_ilova_ochiladi(self, api):
        self.hisob("222", "+998901234567")
        with self.settings(SAYT_URL="https://aql-zone.uz",
                           MINI_APP_URL="https://aql-zone.uz"):
            self.B.salom_yubor(1, "222", "Ali", "Valiyev", "uz")
        xabarlar = [c for c in api.call_args_list if c[0][0] == "sendMessage"]

        # Birinchi xabar — doimiy klaviatura. Uning birinchi tugmasi
        # ("Darslar") ilovani o'zi ochadi.
        k = xabarlar[0][1]["reply_markup"]["keyboard"]
        self.assertEqual(k[0][0]["web_app"]["url"], "https://aql-zone.uz")
        self.assertTrue(k[0][0]["text"])

        # Ikkinchi xabar — BIRINCHI kirish uchun inline tugma: faqat u
        # ilovaga `initData` beradi, ya'ni hisob anonim bo'lib qolmaydi.
        ichki = xabarlar[1][1]["reply_markup"]["inline_keyboard"]
        self.assertEqual(ichki[0][0]["web_app"]["url"], "https://aql-zone.uz")

    def test_raqami_yoq_darvozasi(self):
        self.hisob("333")
        self.hisob("444", "+998901112233")
        self.assertTrue(self.B.raqami_yoq("333"))
        self.assertFalse(self.B.raqami_yoq("444"))
        # Hisob umuman yo'q — `/start` uni o'zi yaratadi.
        self.assertFalse(self.B.raqami_yoq("555"))

    @patch("core.management.commands.bot.api")
    def test_bolim_buyruqlari_ham_darvozadan_otadi(self, api):
        self.hisob("666")
        for buyruq in ("/oyinlar", "/duel", "/maydon", "/reyting"):
            api.reset_mock()
            with self.settings(MINI_APP_URL="https://aql-zone.uz"):
                self.B.yangilikni_qayta_ishla({
                    "message": {
                        "chat": {"id": 1}, "from": {"id": 666, "language_code": "uz"},
                        "text": buyruq,
                    },
                })
            self.assertTrue(
                any(
                    t.get("request_contact")
                    for c in api.call_args_list
                    for qator in (c[1].get("reply_markup") or {}).get("keyboard", [])
                    for t in qator
                ),
                buyruq,
            )

    @patch("core.management.commands.bot.api")
    def test_raqamsiz_odamga_klaviatura_berilmaydi(self, api):
        """
        Klaviatura tugmalari endi ilovani O'ZI ochadi va bot ular
        haqida hech qanday xabar olmaydi — ya'ni tugma bosilgandan
        keyin raqamni so'rab bo'lmaydi. Yagona darvoza — klaviaturani
        umuman bermaslik.
        """
        self.hisob("888")
        with self.settings(MINI_APP_URL="https://aql-zone.uz"):
            self.B.yangilikni_qayta_ishla({"message": {
                "chat": {"id": 1}, "from": {"id": 888, "language_code": "uz"},
                "text": "salom",
            }})

        tugmalar = [
            t for c in api.call_args_list
            for qator in (c[1].get("reply_markup") or {}).get("keyboard", [])
            for t in qator
        ]
        self.assertTrue(any(t.get("request_contact") for t in tugmalar))
        self.assertFalse([t for t in tugmalar if "web_app" in t],
                         "raqamsiz odam ilovani ochadigan tugma oldi")


@override_settings(RAQAM_MAJBURIY_DAN="2026-08-01")
class EskiFoydalanuvchiTest(TestCase):
    """
    Eski hisoblardan raqam SO'RALMAYDI.

    Talab joriy qilingan paytda ilovada allaqachon o'nlab odam bor edi.
    Ularni bir kunda darvoza oldida qoldirish — ishonchni yo'qotishning
    eng tez yo'li: bola kecha o'ynagan ilovaga bugun kira olmay qoladi
    va nega ekanini tushunmaydi.
    """

    def hisob(self, kun: str):
        from django.utils.dateparse import parse_datetime

        p = Pupil.objects.create(first_name="Ali", last_name="Valiyev")
        Pupil.objects.filter(pk=p.pk).update(
            created_at=parse_datetime(f"{kun}T10:00:00+05:00")
        )
        return Pupil.objects.get(pk=p.pk)

    def test_eskidan_soralmaydi_yangidan_soraladi(self):
        from core.management.commands import bot as B

        self.assertFalse(B.raqam_kerakmi(self.hisob("2026-07-20")))
        self.assertTrue(B.raqam_kerakmi(self.hisob("2026-08-15")))
        # Chegaraning O'ZI ham yangi hisoblanadi.
        self.assertTrue(B.raqam_kerakmi(self.hisob("2026-08-01")))

    @override_settings(RAQAM_MAJBURIY_DAN="")
    def test_sana_sozlanmagan_bolsa_hech_kimdan_soralmaydi(self):
        from core.management.commands import bot as B

        self.assertFalse(B.raqam_kerakmi(self.hisob("2026-09-01")))

    @override_settings(RAQAM_MAJBURIY_DAN="buzuq-sana")
    def test_buzuq_sana_darvozani_ochiq_qoldiradi(self):
        """Noto'g'ri sozlangan server odamlarni ilovadan chiqarmasin."""
        from core.management.commands import bot as B

        self.assertFalse(B.raqam_kerakmi(self.hisob("2026-09-01")))


class DuelShartlarTest(TestCase):
    """Chaqirgan odam o'yin, savollar soni va vaqtni tanlaydi."""

    def kir(self, device: str) -> dict:
        r = self.client.post("/api/v1/auth/device",
                             {"deviceId": device, "platform": "web"},
                             content_type="application/json")
        return {"HTTP_AUTHORIZATION": f"Bearer {r.json()['token']}"}

    def setUp(self):
        self.a = self.kir("dev-shart-aaaa1111bbbb")

    def boshla(self, **shart):
        return self.client.post("/api/v1/duel", shart,
                                content_type="application/json", **self.a).json()

    def test_tanlangan_shartlar_saqlanadi(self):
        d = self.boshla(oyin="jadval", savollar=10, vaqt=30)
        self.assertEqual((d["oyin"], d["savollar"], d["vaqt"]), ("jadval", 10, 30))

    def test_royxatda_yoq_qiymat_standartga_tushadi(self):
        """Eski ilova yangi maydonlarni umuman yubormasligi mumkin."""
        d = self.boshla(oyin="yoq-bunday", savollar=999, vaqt=7)
        self.assertIn(d["oyin"], D.OYINLAR)
        self.assertEqual((d["savollar"], d["vaqt"]), (20, 60))

    def test_shartsiz_ham_duel_yasaladi(self):
        d = self.boshla()
        self.assertIn(d["oyin"], D.OYINLAR)
        self.assertIn(d["vaqt"], D.VAQTLAR)

    def test_raqam_bolmagan_qiymat_500_bermaydi(self):
        """
        Mijozdan kelgan qiymat hech qachon ishonchli emas.

        Ilgari `int("abc")` tutilmasdan ko'tarilib, butun so'rov 500
        bo'lib qaytardi — holbuki bu serverning nosozligi emas va
        chaqiruvni shu sabab yasay olmaslik ma'nosiz.
        """
        r = self.client.post("/api/v1/duel",
                             {"oyin": "tezkor", "savollar": "abc", "vaqt": None},
                             content_type="application/json", **self.a)
        self.assertEqual(r.status_code, 201)
        d = r.json()
        self.assertEqual((d["savollar"], d["vaqt"]), (20, 60))

    def test_ikkinchi_tomon_ham_shu_shartlarni_koradi(self):
        b = self.kir("dev-shart-cccc2222dddd")
        d = self.boshla(oyin="tezkor", savollar=30, vaqt=90)
        r = self.client.get(f"/api/v1/duel/{d['kod']}", **b).json()
        self.assertEqual((r["oyin"], r["savollar"], r["vaqt"]), ("tezkor", 30, 90))


class DuelChaqiruvHavolasiTest(TestCase):
    """
    Chaqiruv havolasi BOTGA olib boradi, `startapp` bilan emas.

    `?startapp=` Mini App'ni to'g'ridan-to'g'ri ochadi, lekin buning
    uchun BotFather'da "Main Mini App" sozlangan bo'lishi shart.
    Sozlanmagan bo'lsa Telegram uni oddiy bot havolasi deb qabul
    qiladi: suhbat ochiladi va odam duel o'rniga salom xabarini
    ko'radi — aynan shu nosozlik kuzatilgan edi.
    """

    def test_havola_start_bilan_ketadi(self):
        with self.settings(BOT_USERNAME="aqlzone_bot"):
            self.assertEqual(D.havola("ABC123"), "https://t.me/aqlzone_bot?start=duel_ABC123")


class OvozTest(TestCase):
    """
    Ovoz — `/api/v1/ovoz` va uning keshi.

    HECH BIR SINOV TARMOQQA CHIQMAYDI. Aisha'ga so'rov yuboradigan
    yagona joy (`ovoz.yasa`) sinovlarda o'rniga boshqasi qo'yiladi yoki
    umuman chaqirilmaydi: aks holda `manage.py test` har yurganda pul
    yeb, internetsiz kompyuterda esa yiqilardi.

    Eng muhim ikki qoida shu yerda tekshiriladi:

      1. KESHDAGI ovoz TOKENSIZ ham beriladi — bola ilovani birinchi
         marta ochganda hisobi bo'lmasligi mumkin, ovoz esa o'sha
         ondayoq kerak.
      2. YANGI ovoz tokensiz YASALMAYDI — aks holda endpoint
         birovning bepul TTS xizmatiga aylanardi.
    """

    def setUp(self):
        import tempfile

        from core import ovoz as O

        self.O = O
        # Har sinov o'z papkasida ishlaydi: umumiy keshdan foydalansa,
        # sinovlar bir-birining fayllarini ko'rib, tartibga bog'liq
        # bo'lib qolardi.
        self.papka = tempfile.mkdtemp(prefix="az-ovoz-sinov-")

    def kesh(self):
        return self.settings(OVOZ_KESH=self.papka, AISHA_KEY="sinov-kaliti")

    def auth(self) -> dict:
        """Qurilma orqali kiradi va `Authorization` sarlavhasini qaytaradi."""
        r = self.client.post(
            "/api/v1/auth/device",
            {"deviceId": "dev-ovoz-0123456789ab", "platform": "web"},
            content_type="application/json",
        )
        self.assertEqual(r.status_code, 200, r.content)
        return {"HTTP_AUTHORIZATION": f"Bearer {r.json()['token']}"}

    def fayl_qoy(self, matn: str, til: str = "uz") -> None:
        """Keshga tayyor fayl qo'yadi — go'yo u allaqachon yasalgan."""
        p = self.O.yol(matn, til)
        p.parent.mkdir(parents=True, exist_ok=True)
        # 512 baytdan katta: `yasa()` dagi tekshiruv bilan bir xil
        # chegara, ya'ni sinov haqiqiy holatni takrorlaydi.
        p.write_bytes(b"RIFF" + b"\0" * 2048)

    # ---------------------------------------------------------- tozalash

    def test_emoji_va_ortiqcha_boshliq_ketadi(self):
        self.assertEqual(self.O.tozala("  Qizil  mashina 🚗🚗 "), "Qizil mashina")

    def test_apostrof_qoladi(self):
        """O'zbekchada apostrof harfning bir qismi — usiz so'z buziladi."""
        self.assertEqual(self.O.tozala("o'rdak"), "o'rdak")
        self.assertEqual(self.O.tozala("qo'y"), "qo'y")

    def test_til_kirill_bilan_aniqlanadi(self):
        self.assertEqual(self.O.tili("mashina"), "uz")
        self.assertEqual(self.O.tili("машина"), "ru")

    def test_ovoz_almashsa_fayl_ham_almashadi(self):
        """
        Ovoz nomi xeshga kiradi.

        Busiz ovozni almashtirganimizda eski fayllar joyida qolib,
        ilova ikki xil ovozda gapirardi.
        """
        with self.settings(AISHA_MODEL="Gulnoza"):
            a = self.O.kalit("olma")
        with self.settings(AISHA_MODEL="Boshqa"):
            b = self.O.kalit("olma")
        self.assertNotEqual(a, b)

    # ------------------------------------------------------------ endpoint

    def test_keshdagi_ovoz_tokensiz_beriladi(self):
        with self.kesh():
            self.fayl_qoy("olma")
            r = self.client.get("/api/v1/ovoz", {"matn": "olma"})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r["Content-Type"], "audio/wav")
        self.assertIn("immutable", r["Cache-Control"])

    def test_yangi_ovoz_tokensiz_yasalmaydi(self):
        """Ochiq TTS proksisi — birovning hisobidan bepul ovoz yasash yo'li."""
        with self.kesh():
            def portlaydi(*a, **k):
                raise AssertionError("tokensiz so'rov Aisha'ga chiqmasligi kerak")

            with patch.object(self.O, "yasa", portlaydi):
                r = self.client.get("/api/v1/ovoz", {"matn": "yangi so'z"})
        self.assertEqual(r.status_code, 204)

    def test_bosh_matn_204(self):
        with self.kesh():
            r = self.client.get("/api/v1/ovoz", {"matn": "   "})
        self.assertEqual(r.status_code, 204)

    def test_xizmat_yiqilsa_ilova_yiqilmaydi(self):
        """
        Ovoz hech qachon majburiy emas.

        Aisha javob bermasa 500 emas, 204 qaytadi: mijozda 500 qizil
        xato bo'lib chiqar edi va har bir jim so'z "nosozlik" bo'lib
        ko'rinardi.
        """
        sarlavha = self.auth()
        with self.kesh():
            def yiqiladi(*a, **k):
                raise self.O.OvozXato("xizmat javob bermadi")

            with patch.object(self.O, "yasa", yiqiladi):
                r = self.client.get("/api/v1/ovoz", {"matn": "yangi so'z"}, **sarlavha)
        self.assertEqual(r.status_code, 204)

    def test_token_bilan_royxatdagisi_yasaladi(self):
        sarlavha = self.auth()
        with self.kesh():
            def soxta(matn, til="uz", **k):
                self.fayl_qoy(matn, til)
                return self.O.yol(matn, til)

            # "mashina" — lug'atda bor.
            with patch.object(self.O, "yasa", soxta):
                r = self.client.get("/api/v1/ovoz", {"matn": "mashina"}, **sarlavha)
        self.assertEqual(r.status_code, 200)

    def test_royxatda_yoq_matn_yasalmaydi(self):
        """
        Oq ro'yxat — pulni himoya qiladigan asosiy to'siq.

        Dars savollari tasodifiy sonlar bilan yasaladi ("8 + 5 = ?"),
        ya'ni ularning har biri YANGI satr. Ro'yxatsiz har savol
        Aisha'ga alohida so'rov va alohida to'lov bo'lardi.
        """
        sarlavha = self.auth()
        with self.kesh():
            def portlaydi(*a, **k):
                raise AssertionError("ro'yxatda yo'q matn yasalmasligi kerak")

            with patch.object(self.O, "yasa", portlaydi):
                r = self.client.get("/api/v1/ovoz", {"matn": "8 + 5 nechaga teng?"},
                                    **sarlavha)
        self.assertEqual(r.status_code, 204)

    def test_royxatda_yoq_matn_KESHDAN_beriladi(self):
        """
        Ro'yxat YASASHNI cheklaydi, BERISHNI emas.

        Eski savollar uchun tayyor fayllar bor (`manage.py ovoz --fayl`
        bilan yasalgan bo'lishi mumkin) va ular avvalgidek eshitilishi
        kerak — ro'yxat ularni to'sib qo'ysa, ovoz sababsiz yo'qolardi.
        """
        with self.kesh():
            self.fayl_qoy("8 + 5 nechaga teng?")
            r = self.client.get("/api/v1/ovoz", {"matn": "8 + 5 nechaga teng?"})
        self.assertEqual(r.status_code, 200)

    def test_maqtov_sekinroq_aytiladi(self):
        """
        Yakka undov ("Barakalla!") TTS da shoshib o'qiladi va oxirgi
        bo'g'in yutilib ketadi. Aynan shu payt bolaning mukofoti.
        """
        with self.settings(AISHA_TEZLIK="0.9", AISHA_TEZLIK_MAQTOV="0.8"):
            self.assertEqual(self.O.tezligi("Barakalla!"), "0.8")
            self.assertEqual(self.O.tezligi("Молодец!"), "0.8")
            self.assertEqual(self.O.tezligi("Bu mashina"), "0.9")

    def test_tezlik_xeshga_kiradi(self):
        """
        Busiz `.env` da tezlikni o'zgartirsangiz eski fayllar joyida
        qolib, ilova eski tezlikda gapiraverardi.
        """
        with self.settings(AISHA_TEZLIK="0.9"):
            a = self.O.kalit("olma")
        with self.settings(AISHA_TEZLIK="1.0"):
            b = self.O.kalit("olma")
        self.assertNotEqual(a, b)

    def test_maqtovning_kaliti_boshqa_tezlikda(self):
        """
        `kalit()` va `yasa()` BIR XIL tezlikni ko'rishi shart. Aks
        holda xesh bir tezlikda hisoblanib, fayl boshqasida yasalardi
        va kesh hech qachon topilmasdi — har so'rovda qaytadan yasalib,
        har safar pul ketardi.
        """
        with self.settings(AISHA_TEZLIK="0.9", AISHA_TEZLIK_MAQTOV="0.8"):
            maqtov = self.O.kalit("Barakalla!")
            with self.settings(AISHA_TEZLIK="0.8", AISHA_TEZLIK_MAQTOV="0.8"):
                # Oddiy tezlik 0.8 ga tushsa, maqtovning kaliti
                # O'ZGARMAYDI — u allaqachon 0.8 da edi.
                self.assertEqual(self.O.kalit("Barakalla!"), maqtov)

    def test_lugatdagi_hamma_soz_ruxsatda(self):
        self.assertTrue(self.O.ruxsatmi("mashina"))
        self.assertTrue(self.O.ruxsatmi("машина"))
        self.assertTrue(self.O.ruxsatmi("Barakalla!"))
        self.assertFalse(self.O.ruxsatmi("bunday so'z lug'atda yo'q"))

    # ------------------------------------------------------------- budjet

    def test_kunlik_chegara_yangi_ovozni_toxtatadi(self):
        with self.settings(OVOZ_KESH=self.papka, OVOZ_KUNLIK_BELGI=10):
            self.assertTrue(self.O.budjet_bormi("olma"))
            self.O.kunlik_qosh(9)
            # 9 + len("olma") = 13 > 10
            self.assertFalse(self.O.budjet_bormi("olma"))

    def test_chegara_nol_bolsa_cheklov_yoq(self):
        with self.settings(OVOZ_KESH=self.papka, OVOZ_KUNLIK_BELGI=0):
            self.O.kunlik_qosh(10_000)
            self.assertTrue(self.O.budjet_bormi("olma"))

    # -------------------------------------------------------------- lug'at

    def test_lugat_fayli_bor_va_bosh_emas(self):
        """
        Lug'at frontenddagi ro'yxatdan yasaladi (`npm run tekshir`).

        Fayl yo'qolsa `manage.py ovoz` ishlamaydi va butun bo'lim jim
        qoladi — shuning uchun uning borligi shu yerda ham qo'riqlanadi.
        """
        from core.management.commands.ovoz import STANDART

        self.assertTrue(STANDART.exists(), f"lug'at yo'q: {STANDART}")
        satrlar = [x.strip() for x in STANDART.read_text(encoding="utf-8").splitlines()]
        satrlar = [x for x in satrlar if x and not x.startswith("#")]
        self.assertGreater(len(satrlar), 100)
        # Ikkala til ham bo'lishi shart: ruscha ochgan bolaga o'zbekcha
        # ovoz berilsa, u hech narsani tushunmaydi.
        self.assertTrue(any(self.O.tili(x) == "ru" for x in satrlar))
        self.assertTrue(any(self.O.tili(x) == "uz" for x in satrlar))

    def test_lugat_buyrugi_tarmoqqa_chiqmasdan_sanaydi(self):
        chiqish = StringIO()
        with self.settings(OVOZ_KESH=self.papka):
            call_command("ovoz", "--sana", stdout=chiqish)
        self.assertIn("keshda yo'q", chiqish.getvalue())

    @patch("core.management.commands.bot.api")
    def test_bot_chaqiruvni_inline_tugma_bilan_ochadi(self, api):
        from core.management.commands import bot as B

        with self.settings(MINI_APP_URL="https://aql-zone.uz"):
            B.yangilikni_qayta_ishla({"message": {
                "chat": {"id": 1}, "from": {"id": 888, "language_code": "uz"},
                "text": "/start duel_ABC123",
            }})
        tugma = api.call_args[1]["reply_markup"]["inline_keyboard"][0][0]
        # INLINE tugma — faqat u to'liq `initData` beradi.
        self.assertEqual(tugma["web_app"]["url"], "https://aql-zone.uz/duel/ABC123")


    @patch("core.management.commands.bot.api")
    def test_bot_masalani_inline_tugma_bilan_ochadi(self, api):
        """Kanal postidagi tugma shu yo'l bilan keladi: `?start=masala_6`.
        `?startapp=` ishlatib bo'lmaydi — botda Main Mini App yoqilmagan
        bo'lsa Telegram BOT_INVALID deb javob beradi."""
        from core.management.commands import bot as B

        with self.settings(MINI_APP_URL="https://aql-zone.uz"):
            B.yangilikni_qayta_ishla({"message": {
                "chat": {"id": 1}, "from": {"id": 890, "language_code": "uz"},
                "text": "/start masala_6",
            }})
        tugma = api.call_args[1]["reply_markup"]["inline_keyboard"][0][0]
        self.assertEqual(tugma["web_app"]["url"], "https://aql-zone.uz/masalalar/6")

    @patch("core.management.commands.bot.api")
    def test_bot_masalalar_royxatini_ochadi(self, api):
        from core.management.commands import bot as B

        with self.settings(MINI_APP_URL="https://aql-zone.uz"):
            B.yangilikni_qayta_ishla({"message": {
                "chat": {"id": 1}, "from": {"id": 891, "language_code": "uz"},
                "text": "/start masalalar",
            }})
        tugma = api.call_args[1]["reply_markup"]["inline_keyboard"][0][0]
        self.assertEqual(tugma["web_app"]["url"], "https://aql-zone.uz/masalalar")

    @patch("core.management.commands.bot.api")
    def test_buzuq_masala_raqami_oddiy_startga_tushadi(self, api):
        from core.management.commands import bot as B

        with self.settings(MINI_APP_URL="https://aql-zone.uz", SAYT_URL="https://aql-zone.uz"):
            natija = B.yangilikni_qayta_ishla({"message": {
                "chat": {"id": 1}, "from": {"id": 892, "language_code": "uz"},
                "text": "/start masala_abc",
            }})
        self.assertIn("/start", natija)

    @patch("core.management.commands.bot.api")
    def test_buzuq_kod_oddiy_startga_tushadi(self, api):
        from core.management.commands import bot as B

        with self.settings(MINI_APP_URL="https://aql-zone.uz", SAYT_URL="https://aql-zone.uz"):
            natija = B.yangilikni_qayta_ishla({"message": {
                "chat": {"id": 1}, "from": {"id": 889, "language_code": "uz"},
                "text": "/start duel_<script>",
            }})
        self.assertIn("/start", natija)



class ProgressQulfTest(TransactionTestCase):
    """
    Bir vaqtda kelgan bir nechta saqlash "database is locked" bermasin.

    Ilova ochilganda frontend progressni bir necha marta yuboradi
    (kirishdan keyingi bir marta yuborish + har o'zgarishdagi kechikkan
    yozuv). SQLite'da esa bir vaqtda faqat BITTA yozuvchi bo'ladi.

    Nozik joyi shundaki, `timeout` bu holatni O'ZI HAL QILMAYDI.
    `_progress_yoz` avval O'QIYDI (`get_or_create`), keyin YOZADI
    (`save`). Tranzaksiya `BEGIN` bilan (ya'ni "deferred") boshlansa,
    o'qish paytida qulf olinmaydi va yozishga o'tishda SQLite navbat
    kutmaydi — u darhol "database is locked" qaytaradi. Sababi
    oddiy: kutishning foydasi yo'q, chunki tranzaksiya boshida ko'rgan
    nusxasi allaqachon eskirgan.

    Yechim `BEGIN IMMEDIATE` (`transaction_mode`): yozuv qulfi eng
    boshida olinadi, qolganlar esa `timeout` ichida navbatda kutadi.

    Bu sinov `TransactionTestCase` — oddiy `TestCase` butun sinovni
    bitta tranzaksiyaga o'raydi va boshqa oqimlar yozuvni umuman
    ko'rmasdi.
    """

    #: Nechta so'rov bir vaqtda keladi. Uchtasi — haqiqiy holat.
    OQIM = 3

    def test_bir_vaqtda_kelgan_saqlashlar_yiqilmaydi(self):
        from django.db import connection

        pupil = Pupil.objects.create(first_name="Ali")
        profil = pupil.asosiy_profil()

        boshla = threading.Barrier(self.OQIM, timeout=10)
        xatolar: list[Exception] = []
        asl = Progress.yulduz_hisobla

        def sekin_hisobla(state):
            # O'qish bilan yozish ORASIDA ushlab turamiz: shu tufayli
            # uchala oqim ham yozishdan oldin o'qib ulguradi. Bu haqiqiy
            # so'rovda ham shunday bo'ladi (u yerda ham oradagi ish
            # millisekundlar oladi), faqat bu yerda kafolatlangan.
            time.sleep(0.05)
            return asl(state)

        def yoz(n: int) -> None:
            try:
                boshla.wait()
                views._progress_yoz(profil, {"azapp_grade1_v1": json.dumps({"stars": n})})
            except Exception as e:  # noqa: BLE001 — nimaligini quyida ko'rsatamiz
                xatolar.append(e)
            finally:
                # Har oqim o'z ulanishini ochadi — uni yopmasak sinov
                # bazasini o'chirib bo'lmaydi.
                connection.close()

        with patch.object(Progress, "yulduz_hisobla", staticmethod(sekin_hisobla)):
            oqimlar = [threading.Thread(target=yoz, args=(n,)) for n in range(1, self.OQIM + 1)]
            for o in oqimlar:
                o.start()
            for o in oqimlar:
                o.join(timeout=30)

        self.assertEqual(xatolar, [], f"saqlash yiqildi: {xatolar}")
        # Bittasi ham yo'qolmasin: satr bor va oxirgi yozuv turibdi.
        self.assertEqual(Progress.objects.filter(profile=profil).count(), 1)

    def test_baza_yozuv_tranzaksiyasini_darhol_ochadi(self):
        """
        Sozlamaning O'ZI ham qo'riqlanadi.

        Yuqoridagi sinov qulflarga bog'liq va mashina sekin bo'lsa
        tasodifan yashil o'tishi mumkin. Bu esa sababni to'g'ridan-to'g'ri
        tekshiradi: `transaction_mode` olib tashlansa, darhol qizaradi.
        """
        from django.db import connection

        self.assertEqual(connection.transaction_mode, "IMMEDIATE")


class MasalaTest(TestCase):
    """
    Foydalanuvchi masalalari.

    Diqqat qaratilgan joy — YECHIMNING OCHILISHI. Bu bo'limning butun
    ma'nosi shunda: yechim urinib ko'rmagan odamga ko'rinmasligi
    kerak va buni SERVER qo'riqlaydi. Faqat mijozda yashirilsa, uni
    har kim tarmoq oynasidan o'qib olardi va bo'lim javoblar
    ro'yxatiga aylanardi.
    """

    def kir(self, device: str) -> str:
        r = self.client.post(
            "/api/v1/auth/device", {"deviceId": device, "platform": "web"},
            content_type="application/json",
        )
        return r.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def setUp(self):
        self.muallif_token = self.kir("dev-masala-muallif-0001")
        self.yechuvchi_token = self.kir("dev-masala-yechuvchi-002")
        self.muallif = Pupil.objects.get(
            identities__external_id="dev-masala-muallif-0001"
        ).asosiy_profil()
        self.yechuvchi = Pupil.objects.get(
            identities__external_id="dev-masala-yechuvchi-002"
        ).asosiy_profil()

    def masala_yasa(self, *, holat=Masala.TASDIQ, javob="12", muallif=None) -> Masala:
        return Masala.objects.create(
            muallif=muallif or self.muallif, sinf=5,
            matn="Bir savatda 20 ta olma bor edi, 8 tasini yedik. Nechta qoldi?",
            javob=javob, yechim="20 − 8 = 12. Javob: 12 ta olma.",
            holat=holat,
        )

    def yubor(self, token: str, **ozgarish) -> object:
        tana = {
            "sinf": 5,
            "matn": "Bir savatda 20 ta olma bor edi, 8 tasini yedik. Nechta qoldi?",
            "javob": "12",
            "yechim": "20 − 8 = 12",
            **ozgarish,
        }
        return self.client.post(
            "/api/v1/masalalar", tana,
            content_type="application/json", **self.auth(token),
        )

    # ------------------------------------------------------------ yuborish

    def test_yangi_masala_navbatga_tushadi_va_royxatda_korinmaydi(self):
        r = self.yubor(self.muallif_token)
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.json()["masala"]["holat"], Masala.KUTMOQDA)

        # Boshqa odam uchun u YO'Q — tasdiqlanmagan masala ro'yxatga
        # chiqmaydi. Bo'limning butun himoyasi shu qatorda.
        r = self.client.get("/api/v1/masalalar", **self.auth(self.yechuvchi_token))
        self.assertEqual(r.json()["masalalar"], [])

    def test_qisqa_masala_rad_etiladi(self):
        r = self.yubor(self.muallif_token, matn="2+2?")
        self.assertEqual(r.status_code, 400)

    def test_yechimsiz_masala_rad_etiladi(self):
        r = self.yubor(self.muallif_token, yechim="4")
        self.assertEqual(r.status_code, 400)

    def test_notogri_sinf_kodi_rad_etiladi(self):
        # 55 hech qaysi kursga tushmaydi (0–11 va 107–110 dan tashqari).
        self.assertEqual(self.yubor(self.muallif_token, sinf=55).status_code, 400)
        self.assertEqual(self.yubor(self.muallif_token, sinf=108).status_code, 201)

    def test_kunlik_chegara(self):
        for _ in range(Masala.KUNLIK_CHEGARA):
            self.assertEqual(self.yubor(self.muallif_token).status_code, 201)
        r = self.yubor(self.muallif_token)
        self.assertEqual(r.status_code, 429)
        self.assertEqual(r.json()["error"], "kunlik")

    # -------------------------------------------------------------- yechim

    def test_yechim_urinmagan_odamga_yuborilmaydi(self):
        m = self.masala_yasa()
        r = self.client.get(f"/api/v1/masalalar/{m.pk}", **self.auth(self.yechuvchi_token))
        d = r.json()
        self.assertFalse(d["yechimOchiq"])
        # Maydonning O'ZI bo'lmasligi shart: bo'sh satr bo'lib kelsa
        # ham, keyingi o'zgarishda kimdir uni to'ldirib qo'yardi.
        self.assertNotIn("yechim", d)
        self.assertNotIn("javob", d)

    def test_royxatda_ham_yechim_yoq(self):
        m = self.masala_yasa()
        MasalaUrinish.objects.create(masala=m, profile=self.yechuvchi, togri=True)
        r = self.client.get("/api/v1/masalalar", **self.auth(self.yechuvchi_token))
        qator = r.json()["masalalar"][0]
        # Urinib ko'rgan bo'lsa ham RO'YXATDA yechim kelmaydi: yigirmata
        # yechim javobni bekorga kattalashtirardi.
        self.assertNotIn("yechim", qator)
        self.assertTrue(qator["uringan"])

    def test_xato_javob_yechimni_ochmaydi(self):
        """
        Ilgari BITTA urinishdan keyin yechim ham, to'g'ri javob ham
        darhol ko'rinardi — ya'ni "yechish" bir marta biror narsa
        yozishdan iborat edi va ikkinchi urinish uchun sabab
        qolmasdi.
        """
        m = self.masala_yasa()
        r = self.client.post(
            f"/api/v1/masalalar/{m.pk}/javob", {"javob": "xato"},
            content_type="application/json", **self.auth(self.yechuvchi_token),
        )
        d = r.json()
        self.assertFalse(d["togri"])
        self.assertFalse(d["yechimOchiq"])
        self.assertNotIn("yechim", d)
        self.assertNotIn("javob", d)

        r = self.client.get(f"/api/v1/masalalar/{m.pk}", **self.auth(self.yechuvchi_token))
        self.assertFalse(r.json()["yechimOchiq"])

    def test_togri_javob_yechimni_ochadi(self):
        m = self.masala_yasa()
        r = self.client.post(
            f"/api/v1/masalalar/{m.pk}/javob", {"javob": "12"},
            content_type="application/json", **self.auth(self.yechuvchi_token),
        )
        d = r.json()
        self.assertTrue(d["togri"])
        self.assertEqual(d["urinishim"], 1)
        self.assertIn("20 − 8", d["yechim"])

    def test_uchinchi_urinishdan_keyin_yechim_bepul_ochiladi(self):
        """Tangasi yo'q bola masalada qamalib qolmasligi kerak."""
        m = self.masala_yasa()
        yol = f"/api/v1/masalalar/{m.pk}/javob"
        A = self.auth(self.yechuvchi_token)
        for _ in range(2):
            d = self.client.post(yol, {"javob": "xato"},
                                 content_type="application/json", **A).json()
            self.assertFalse(d["yechimOchiq"])

        d = self.client.post(yol, {"javob": "yana xato"},
                             content_type="application/json", **A).json()
        self.assertEqual(d["urinishim"], 3)
        self.assertTrue(d["yechimOchiq"])
        self.assertIn("20 − 8", d["yechim"])

        # Statistikaga faqat BIRINCHI urinish tushadi.
        m.refresh_from_db()
        self.assertEqual(m.urinish_soni, 1)
        self.assertEqual(m.yechgan_soni, 0)

    def test_tanga_evaziga_yechim_ochiladi(self):
        m = self.masala_yasa()
        A = self.auth(self.yechuvchi_token)
        self.client.post(f"/api/v1/masalalar/{m.pk}/javob", {"javob": "xato"},
                         content_type="application/json", **A)

        r = self.client.post(f"/api/v1/masalalar/{m.pk}/yechim", {},
                             content_type="application/json", **A)
        self.assertIn("20 − 8", r.json()["yechim"])
        self.assertEqual(r.json()["javob"], "12")

        # Ilova qayta ochilganda ham yechim joyida — ikkinchi marta
        # to'lanmaydi.
        r = self.client.get(f"/api/v1/masalalar/{m.pk}", **A)
        self.assertTrue(r.json()["yechimOchiq"])

    def test_urinmasdan_yechim_sotib_olinmaydi(self):
        """Aks holda bo'lim javoblar ro'yxatiga aylanardi."""
        m = self.masala_yasa()
        r = self.client.post(f"/api/v1/masalalar/{m.pk}/yechim", {},
                             content_type="application/json",
                             **self.auth(self.yechuvchi_token))
        self.assertEqual(r.status_code, 400)
        r = self.client.get(f"/api/v1/masalalar/{m.pk}", **self.auth(self.yechuvchi_token))
        self.assertFalse(r.json()["yechimOchiq"])

    def test_muallif_oz_yechimini_koradi(self):
        m = self.masala_yasa(holat=Masala.KUTMOQDA)
        r = self.client.get(f"/api/v1/masalalar/{m.pk}", **self.auth(self.muallif_token))
        self.assertTrue(r.json()["yechimOchiq"])

    def test_begona_odam_tasdiqlanmaganini_ocholmaydi(self):
        m = self.masala_yasa(holat=Masala.KUTMOQDA)
        r = self.client.get(f"/api/v1/masalalar/{m.pk}", **self.auth(self.yechuvchi_token))
        self.assertEqual(r.status_code, 404)

    # -------------------------------------------------------------- javob

    def test_javob_boshqacha_yozilsa_ham_qabul_qilinadi(self):
        m = self.masala_yasa(javob="12 sm")
        for xom in ["12 sm", "12sm", "  12 SM  ", "12 sm"]:
            MasalaUrinish.objects.all().delete()
            r = self.client.post(
                f"/api/v1/masalalar/{m.pk}/javob", {"javob": xom},
                content_type="application/json", **self.auth(self.yechuvchi_token),
            )
            self.assertTrue(r.json()["togri"], f"{xom!r} rad etildi")

    def test_vergul_va_nuqta_bir_xil(self):
        m = self.masala_yasa(javob="3.5")
        r = self.client.post(
            f"/api/v1/masalalar/{m.pk}/javob", {"javob": "3,5"},
            content_type="application/json", **self.auth(self.yechuvchi_token),
        )
        self.assertTrue(r.json()["togri"])

    def test_faqat_birinchi_urinish_sanaladi(self):
        m = self.masala_yasa()
        yol = f"/api/v1/masalalar/{m.pk}/javob"
        # Birinchi — xato.
        self.client.post(yol, {"javob": "99"}, content_type="application/json",
                         **self.auth(self.yechuvchi_token))
        # Ikkinchi — to'g'ri, lekin statistikaga tegmaydi.
        r = self.client.post(yol, {"javob": "12"}, content_type="application/json",
                             **self.auth(self.yechuvchi_token))
        d = r.json()
        self.assertTrue(d["togri"])
        self.assertFalse(d["birinchi"])
        self.assertFalse(d["birinchiTogri"])

        m.refresh_from_db()
        self.assertEqual(m.urinish_soni, 1)
        self.assertEqual(m.yechgan_soni, 0)

    def test_qiyinlik_foizi(self):
        m = self.masala_yasa()
        # Hech kim urinmagan masala "eng qiyin" ro'yxatining boshiga
        # chiqib olmasligi kerak.
        self.assertEqual(m.qiyinlik, 100)
        m.urinish_soni, m.yechgan_soni = 4, 1
        self.assertEqual(m.qiyinlik, 25)

    # -------------------------------------------------------------- ovozlar

    def test_like_va_dislike(self):
        m = self.masala_yasa()
        yol = f"/api/v1/masalalar/{m.pk}/ovoz"
        A = self.auth(self.yechuvchi_token)

        r = self.client.post(yol, {"tur": "like"}, content_type="application/json", **A)
        self.assertEqual((r.json()["like"], r.json()["dislike"]), (1, 0))

        # Almashtirish: like ketadi, dislike keladi.
        r = self.client.post(yol, {"tur": "dislike"}, content_type="application/json", **A)
        self.assertEqual((r.json()["like"], r.json()["dislike"]), (0, 1))

        # O'sha tugmani qayta bosish — ovozni QAYTARIB OLADI. Busiz
        # bexosdan bosilgan dislike'ni qaytarib bo'lmasdi.
        r = self.client.post(yol, {"tur": "dislike"}, content_type="application/json", **A)
        self.assertEqual((r.json()["like"], r.json()["dislike"]), (0, 0))
        self.assertEqual(r.json()["ovozim"], "")
        self.assertEqual(MasalaOvoz.objects.count(), 0)

    def test_oz_masalasiga_ovoz_berib_bolmaydi(self):
        m = self.masala_yasa()
        r = self.client.post(
            f"/api/v1/masalalar/{m.pk}/ovoz", {"tur": "like"},
            content_type="application/json", **self.auth(self.muallif_token),
        )
        self.assertEqual(r.status_code, 403)

    # ------------------------------------------------------------- ro'yxat

    def test_sinf_boyicha_filtr_va_saralash(self):
        a = self.masala_yasa()
        b = self.masala_yasa()
        Masala.objects.filter(pk=b.pk).update(sinf=7, like_soni=9)

        r = self.client.get("/api/v1/masalalar?sinf=7", **self.auth(self.yechuvchi_token))
        self.assertEqual([x["id"] for x in r.json()["masalalar"]], [b.pk])

        r = self.client.get("/api/v1/masalalar?tartib=zor", **self.auth(self.yechuvchi_token))
        self.assertEqual(r.json()["masalalar"][0]["id"], b.pk)

        # Eng kam yechilgani "qiyin" ro'yxatining boshida.
        Masala.objects.filter(pk=a.pk).update(urinish_soni=10, yechgan_soni=1)
        Masala.objects.filter(pk=b.pk).update(urinish_soni=10, yechgan_soni=9)
        r = self.client.get("/api/v1/masalalar?tartib=qiyin", **self.auth(self.yechuvchi_token))
        self.assertEqual(r.json()["masalalar"][0]["id"], a.pk)

    def test_muallif_sahifasi(self):
        m = self.masala_yasa()
        Masala.objects.filter(pk=m.pk).update(yechgan_soni=3, like_soni=2)
        # Tasdiqlanmagani begona odamga ko'rinmasligi kerak.
        self.masala_yasa(holat=Masala.KUTMOQDA)

        r = self.client.get(
            f"/api/v1/masalalar/muallif/{self.muallif.pk}",
            **self.auth(self.yechuvchi_token),
        )
        d = r.json()
        self.assertEqual(d["jami"], {"masalalar": 1, "yechilgan": 3, "like": 2})
        self.assertEqual([x["id"] for x in d["masalalar"]], [m.pk])
        self.assertFalse(d["meniki"])

    def test_menikilar_rad_sababini_korsatadi(self):
        m = self.masala_yasa(holat=Masala.KUTMOQDA)
        MS.rad_et(m, "Javobi noto'g'ri: 20 − 8 = 12, siz 13 deb yozgansiz.")

        r = self.client.get("/api/v1/masalalar/menikilar", **self.auth(self.muallif_token))
        qator = r.json()["masalalar"][0]
        self.assertEqual(qator["holat"], Masala.RAD)
        self.assertIn("noto'g'ri", qator["radSababi"])

        # Begona odam esa sababni ko'rmaydi — u masalani umuman ko'rmaydi.
        r = self.client.get(f"/api/v1/masalalar/{m.pk}", **self.auth(self.yechuvchi_token))
        self.assertEqual(r.status_code, 404)

    def test_tokensiz_kirish_taqiqlanadi(self):
        self.assertEqual(self.client.get("/api/v1/masalalar").status_code, 401)

    # ---------------------------------------------------------------- rasm

    def rasm_fayl(self, *, kenglik=2400, balandlik=1800, format="JPEG"):
        """Haqiqiy rasm yasaydi — soxta bayt emas."""
        from io import BytesIO
        from PIL import Image
        from django.core.files.uploadedfile import SimpleUploadedFile

        img = Image.new("RGB", (kenglik, balandlik), (200, 40, 40))
        xotira = BytesIO()
        img.save(xotira, format=format)
        turi = "image/jpeg" if format == "JPEG" else f"image/{format.lower()}"
        return SimpleUploadedFile("surat." + format.lower(), xotira.getvalue(), turi)

    def yubor_rasm(self, token: str, fayl):
        """Rasm bilan yuborish — `multipart/form-data`."""
        return self.client.post("/api/v1/masalalar", {
            "sinf": 5,
            "matn": "ABC uchburchakda AB = 5, BC = 12. AC ni toping.",
            "javob": "13",
            "yechim": "Pifagor: 5² + 12² = 169, √169 = 13.",
            "rasm": fayl,
        }, **self.auth(token))

    def test_rasm_qabul_qilinadi_va_kichraytiriladi(self):
        from PIL import Image

        r = self.yubor_rasm(self.muallif_token, self.rasm_fayl())
        self.assertEqual(r.status_code, 201, r.content)

        m = Masala.objects.get(pk=r.json()["masala"]["id"])
        self.assertTrue(m.rasm)
        # Saqlashdan oldin qayta kodlanadi: bitta format va cheklangan
        # o'lcham. Original 2400 piksel edi.
        with Image.open(m.rasm.path) as img:
            self.assertEqual(img.format, "WEBP")
            self.assertLessEqual(max(img.size), settings.MASALA_RASM_OLCHAM)

    def test_rasm_manzili_javobda_keladi(self):
        r = self.yubor_rasm(self.muallif_token, self.rasm_fayl(kenglik=600, balandlik=400))
        self.assertTrue(r.json()["masala"]["rasm"].startswith("/media/"))

    def test_rasmsiz_yuborish_avvalgidek_ishlaydi(self):
        r = self.yubor(self.muallif_token)
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(r.json()["masala"]["rasm"], "")

    def test_rasm_bolmagan_fayl_rad_etiladi(self):
        """
        Fayl turiga ISHONILMAYDI — u ochib ko'riladi.

        Mijoz `Content-Type` ni istalgan qiymatga qo'ya oladi, ya'ni
        u himoya emas. Yagona ishonchli tekshiruv — faylni ochish.
        """
        from django.core.files.uploadedfile import SimpleUploadedFile

        soxta = SimpleUploadedFile("rasm.jpg", b"bu rasm emas, oddiy matn", "image/jpeg")
        r = self.yubor_rasm(self.muallif_token, soxta)
        self.assertEqual(r.status_code, 400)
        self.assertEqual(r.json()["error"], "rasm")
        # Xato matni foydalanuvchiga ko'rsatiladi — u nima
        # noto'g'riligini bilishi kerak.
        self.assertIn("rasm emas", r.json()["izoh"])

    def test_juda_katta_rasm_rad_etiladi(self):
        from django.core.files.uploadedfile import SimpleUploadedFile

        katta = SimpleUploadedFile(
            "katta.jpg", b"x" * (settings.MASALA_RASM_MAX + 1), "image/jpeg",
        )
        r = self.yubor_rasm(self.muallif_token, katta)
        self.assertEqual(r.status_code, 400)
        self.assertIn("katta", r.json()["izoh"])

    def test_rasm_tasdiqdan_oldin_royxatda_korinmaydi(self):
        """Rasm ham matn kabi navbatda turadi — u masalaning bir qismi."""
        self.yubor_rasm(self.muallif_token, self.rasm_fayl(kenglik=400, balandlik=300))
        r = self.client.get("/api/v1/masalalar", **self.auth(self.yechuvchi_token))
        self.assertEqual(r.json()["masalalar"], [])

    # ------------------------------------------------- kursdan tashqari toifa

    def test_kattalar_va_olimpiada_toifasi(self):
        """
        Bo'limning eng qimmatli masalalari ko'pincha hech qaysi
        sinfga to'g'ri kelmaydi. Ular uchun ikkita alohida kod bor.
        """
        for kod in (Masala.KATTALAR, Masala.OLIMPIADA):
            r = self.yubor(self.muallif_token, sinf=kod)
            self.assertEqual(r.status_code, 201, f"{kod}: {r.content}")
            self.assertEqual(r.json()["masala"]["sinf"], kod)

    def test_oraliqdagi_notogri_kod_rad_etiladi(self):
        # 150 hech qaysi kursga ham, toifaga ham tushmaydi.
        self.assertEqual(self.yubor(self.muallif_token, sinf=150).status_code, 400)
        self.assertEqual(self.yubor(self.muallif_token, sinf=202).status_code, 400)


@override_settings(BOSHQARUV_YONIQ=True, ADMIN_TG=[ADMIN_ID])
class MasalaBoshqaruvTest(TestCase):
    """
    Tasdiqlash navbati — /boshqaruv/masalalar.

    Eng muhim tekshiruv — SABABSIZ RAD ETIB BO'LMASLIGI. Sababsiz rad
    etilgan odam nimani tuzatishni bilmaydi va ikkinchi marta yozmaydi;
    bo'lim esa aynan qayta yozadigan odamlar ustiga quriladi.
    """

    def setUp(self):
        pupil = Pupil.objects.create(first_name="Olim", last_name="Salimov")
        self.profil = pupil.asosiy_profil()
        self.m = Masala.objects.create(
            muallif=self.profil, sinf=5,
            matn="Bir savatda 20 ta olma bor edi, 8 tasini yedik. Nechta qoldi?",
            javob="12", yechim="20 − 8 = 12",
        )
        from .boshqaruv import havola_yasa
        kod = havola_yasa(ADMIN_ID).rsplit("/", 1)[-1]
        self.client.get(f"/boshqaruv/havola/{kod}")

    def test_navbat_masalani_toliq_korsatadi(self):
        r = self.client.get("/boshqaruv/masalalar")
        self.assertEqual(r.status_code, 200)
        # Uchalasi ham bir ekranda: tasdiqlashda ish o'qish emas,
        # matematikani TEKSHIRISH.
        self.assertContains(r, "20 ta olma")
        self.assertContains(r, "20 − 8 = 12")
        self.assertContains(r, "Olim Salimov")

    def test_tasdiqlash(self):
        r = self.client.post("/boshqaruv/masalalar", {
            "amal": "tasdiq", "id": self.m.pk, "holat": "kutmoqda",
        })
        self.assertEqual(r.status_code, 302)
        self.m.refresh_from_db()
        self.assertEqual(self.m.holat, Masala.TASDIQ)

    def test_sababsiz_rad_etib_bolmaydi(self):
        r = self.client.post("/boshqaruv/masalalar", {
            "amal": "rad", "id": self.m.pk, "holat": "kutmoqda", "sabab": "   ",
        })
        self.assertIn("sabab", r["Location"])
        self.m.refresh_from_db()
        self.assertEqual(self.m.holat, Masala.KUTMOQDA)

    def test_sabab_bilan_rad_etiladi(self):
        self.client.post("/boshqaruv/masalalar", {
            "amal": "rad", "id": self.m.pk, "holat": "kutmoqda",
            "sabab": "Javobi noto'g'ri.",
        })
        self.m.refresh_from_db()
        self.assertEqual(self.m.holat, Masala.RAD)
        self.assertEqual(self.m.rad_sababi, "Javobi noto'g'ri.")

    def test_kirmagan_odam_ocholmaydi(self):
        self.client.get("/boshqaruv/chiqish")
        r = self.client.get("/boshqaruv/masalalar")
        # Kirish sahifasi chiqadi, masala matni EMAS.
        self.assertNotContains(r, "20 ta olma")


@override_settings(BOT_USERNAME="aqlzone_bot", KANAL="@aqlzone")
class MasalaKanalTest(TestCase):
    """
    Kanalga joylanadigan post.

    Diqqat qaratilgan joy — TUGMANING MANZILI. Butun postning ma'nosi
    shunda: odam kanalda shartni o'qiydi, tugmani bosadi va ilova
    AYNAN o'sha masalada ochiladi. Manzil buzilsa, post oddiy rasmga
    aylanadi va hech qayerga olib bormaydi.
    """

    def setUp(self):
        pupil = Pupil.objects.create(first_name="Muallif")
        self.profil = pupil.asosiy_profil()

    def masala_yasa(self, **o) -> Masala:
        maydon = {
            "muallif": self.profil, "sinf": 107,
            "matn": "Katta kvadratga doira ichki chizilgan. Yuzlar nisbatini toping.",
            "javob": "2", "yechim": "Nisbat 2 ga teng.", "holat": Masala.TASDIQ,
        }
        maydon.update(o)
        return Masala.objects.create(**maydon)

    def test_havola_ilovani_shu_masalada_ochadi(self):
        m = self.masala_yasa()
        self.assertEqual(
            MK.havola(m), f"https://t.me/aqlzone_bot?startapp=masala_{m.pk}",
        )

    def test_sarlavhada_shart_va_sinf_bor(self):
        m = self.masala_yasa()
        y = MK.sarlavha(m)
        self.assertIn("7-sinf geometriya", y)
        self.assertIn("Katta kvadratga doira", y)
        # Javob kanalda TURMAYDI — u faqat ilovada kiritiladi.
        self.assertNotIn(m.javob, y.split("#")[0].replace("7-sinf", ""))

    def test_uzun_shart_kesiladi(self):
        m = self.masala_yasa(matn="Shart " * 400)
        # Telegram sarlavhasi 1024 belgi; kesilgani uch nuqta bilan tugaydi.
        self.assertLess(len(MK.sarlavha(m)), 1024)
        self.assertIn("…", MK.sarlavha(m))

    def test_kunlik_joylanmaganini_oladi(self):
        eski = self.masala_yasa()
        eski.kanal_at = timezone.now()
        eski.save(update_fields=["kanal_at"])
        yangi = self.masala_yasa()
        self.assertEqual(MK.kunlik(), yangi)

    def test_kunlik_tasdiqlanmaganini_olmaydi(self):
        self.masala_yasa(holat=Masala.KUTMOQDA)
        self.assertIsNone(MK.kunlik())

    def test_kanal_nomi_at_bilan_beriladi(self):
        # Sozlamada `@` yo'q, Telegram esa `@nom` kutadi. Aks holda
        # butun post "chat not found" bo'lib qaytardi.
        from core.kanal import kanal_nomi
        self.assertEqual(kanal_nomi(), "@aqlzone")


@override_settings(BOT_USERNAME="aqlzone_bot", KANAL="aqlzone",
                   ADMIN_TG=["973358587"], BOT_TOKEN="sinov:token")
class MasalaKanalTugmaTest(TestCase):
    """
    Ilovadagi «Kanalga yuborish» tugmasi.

    Diqqat qaratilgan joy — KIM KO'RADI. Tugma administratorga
    ko'rinadi, qolganlarga esa yo'lning o'zi yo'q: 403 emas, 404,
    chunki 403 javobning o'zi "bunday imkoniyat bor" deb aytardi.

    Tekshiruv TELEGRAM id bo'yicha: ism bo'yicha bo'lganda o'zini
    "Abdufattoh Fattoyev" deb atagan har kim kanalga post yuborardi.
    """

    def kir(self, device: str) -> str:
        r = self.client.post(
            "/api/v1/auth/device", {"deviceId": device, "platform": "web"},
            content_type="application/json",
        )
        return r.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def setUp(self):
        # Sinovlar bitta jarayonda ketadi va DRF tezlik chegarasi
        # KESHDA turadi: yangi sinf qo'shilishi bilan chegara to'lib,
        # BOSHQA sinovlar 429 bilan yiqila boshlaydi. Kesh shu yerda
        # tozalanadi — sinovlar bir-biriga ta'sir qilmasin.
        cache.clear()
        self.token = self.kir("dev-kanal-oddiy-000001")
        self.pupil = Pupil.objects.get(identities__external_id="dev-kanal-oddiy-000001")
        self.profil = self.pupil.asosiy_profil()
        self.m = Masala.objects.create(
            muallif=self.profil, sinf=5, matn="Ikki karra ikki nechchi?",
            javob="4", yechim="4.", holat=Masala.TASDIQ,
        )

    def adminga_aylantir(self):
        """Shu hisobga administratorning Telegram id'sini bog'laydi."""
        Identity.objects.create(
            pupil=self.pupil, provider=Identity.TELEGRAM, external_id="973358587",
        )

    def test_oddiy_odamda_kanal_maydoni_yoq(self):
        r = self.client.get(f"/api/v1/masalalar/{self.m.pk}", **self.auth(self.token))
        self.assertNotIn("kanal", r.json())

    def test_adminda_kanal_maydoni_bor(self):
        self.adminga_aylantir()
        r = self.client.get(f"/api/v1/masalalar/{self.m.pk}", **self.auth(self.token))
        self.assertEqual(
            r.json()["kanal"],
            # Havola hali bo'sh: post yuborilmagan. `yoq` ham false —
            # yo'qolgan post bu emas, hali umuman chiqmagan post.
            {"mumkin": True, "yuborilgan": False, "havola": "",
             "yoq": False, "tekshirilgan": None},
        )

    def test_oddiy_odam_yubora_olmaydi(self):
        r = self.client.post(f"/api/v1/masalalar/{self.m.pk}/kanal",
                             {}, content_type="application/json", **self.auth(self.token))
        self.assertEqual(r.status_code, 404)
        self.m.refresh_from_db()
        self.assertIsNone(self.m.kanal_at)

    def test_admin_yuboradi(self):
        self.adminga_aylantir()
        with patch("core.xabar._sorov", return_value=(True, 200, "")):
            r = self.client.post(f"/api/v1/masalalar/{self.m.pk}/kanal",
                                 {}, content_type="application/json",
                                 **self.auth(self.token))
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()["yuborilgan"])
        self.m.refresh_from_db()
        self.assertIsNotNone(self.m.kanal_at)

    def test_ikkinchi_marta_yuborilmaydi(self):
        self.adminga_aylantir()
        self.m.kanal_at = timezone.now()
        self.m.save(update_fields=["kanal_at"])
        with patch("core.xabar._sorov") as s:
            r = self.client.post(f"/api/v1/masalalar/{self.m.pk}/kanal",
                                 {}, content_type="application/json",
                                 **self.auth(self.token))
        # Telegram UMUMAN chaqirilmaydi — kanalda ikkita bir xil post
        # turishi obunachi uchun xato bo'lib ko'rinadi.
        s.assert_not_called()
        self.assertEqual(r.json()["holat"], "takror")

    def test_tasdiqlanmagan_masala_kanalga_chiqmaydi(self):
        self.adminga_aylantir()
        self.m.holat = Masala.KUTMOQDA
        self.m.save(update_fields=["holat"])
        with patch("core.xabar._sorov") as s:
            r = self.client.post(f"/api/v1/masalalar/{self.m.pk}/kanal",
                                 {}, content_type="application/json",
                                 **self.auth(self.token))
        s.assert_not_called()
        self.assertEqual(r.status_code, 400)
        self.assertEqual(r.json()["holat"], "tasdiqlanmagan")

    def test_ikkita_tugma_ketadi(self):
        """Kanal postida ikkita qator: javob va boshqa masalalar."""
        self.adminga_aylantir()
        with patch("core.xabar.urllib.request.urlopen") as u:
            u.return_value.__enter__.return_value.read.return_value = b'{"ok":true}'
            self.client.post(f"/api/v1/masalalar/{self.m.pk}/kanal",
                             {}, content_type="application/json",
                             **self.auth(self.token))
        tana = u.call_args[0][0].data.decode("utf-8", "replace")
        self.assertIn("Javobni kiritish", tana)
        self.assertIn("Boshqa masalalar", tana)
        self.assertIn(f"startapp=masala_{self.m.pk}", tana)
        self.assertIn("startapp=masalalar", tana)

    def test_royxat_havolasi(self):
        self.assertEqual(MK.royxat_havolasi(), "https://t.me/aqlzone_bot?startapp=masalalar")

    def test_yuborilgandan_keyin_postga_havola_qaytadi(self):
        """Admin postni ko'z bilan tekshirishi uchun havola kerak."""
        self.adminga_aylantir()
        with patch("core.xabar.urllib.request.urlopen") as u:
            u.return_value.__enter__.return_value.read.return_value = (
                b'{"ok":true,"result":{"message_id":314}}'
            )
            r = self.client.post(f"/api/v1/masalalar/{self.m.pk}/kanal",
                                 {}, content_type="application/json",
                                 **self.auth(self.token))
        # Rasmsiz masalada `sendMessage` ketadi va u xabar raqamini
        # bermaydi — u holda kanalning o'ziga havola qoladi.
        self.assertEqual(r.json()["havola"], "https://t.me/aqlzone")

    def test_rasmli_post_aynan_ozining_havolasini_beradi(self):
        self.adminga_aylantir()
        self.m.kanal_post_id = 314
        self.m.kanal_at = timezone.now()
        self.m.save(update_fields=["kanal_post_id", "kanal_at"])
        r = self.client.get(f"/api/v1/masalalar/{self.m.pk}", **self.auth(self.token))
        self.assertEqual(r.json()["kanal"]["havola"], "https://t.me/aqlzone/314")

    def test_kattalar_va_olimpiada_nomi_togri(self):
        """200 va 201 ham `>= 100` — tekshirilmasa "100-sinf geometriya"
        bo'lib chiqadi va aynan shu nom kanalga chiqib ketgan edi."""
        from core.boshqaruv import sinf_nomi
        self.assertEqual(sinf_nomi(Masala.KATTALAR), "Kattalar uchun")
        self.assertEqual(sinf_nomi(Masala.OLIMPIADA), "Olimpiada")
        self.assertEqual(sinf_nomi(107), "7-sinf geometriya")

    def test_matn_html_sifatida_qalqonlanadi(self):
        """Matematikada `<` odatiy: "3 < x < 7". Qalqonlanmasa Telegram
        uni teg deb o'qib, xabarni rad etadi."""
        m = Masala.objects.create(
            muallif=self.profil, sinf=9, holat=Masala.TASDIQ,
            matn="Agar 3 < x < 7 & x butun son bo'lsa, x ni toping.",
            javob="4", yechim="4, 5 yoki 6.",
        )
        y = MK.sarlavha(m)
        self.assertIn("3 &lt; x &lt; 7 &amp; x butun", y)
        self.assertNotIn("< x <", y)

    def test_apostrof_qalqonlanmaydi(self):
        """O'zbekcha matnda apostrof deyarli har gapda bor. Telegram
        `&#x27;` ni ochmaydi — postda o'sha ko'rinishda qolib ketardi."""
        m = Masala.objects.create(
            muallif=self.profil, sinf=5, holat=Masala.TASDIQ,
            matn="Yo'lga chiqdi va to'xtadi.", javob="1", yechim="1.",
        )
        y = MK.sarlavha(m)
        self.assertIn("Yo'lga chiqdi", y)
        self.assertNotIn("&#x27;", y)


@override_settings(BOT_USERNAME="aqlzone_bot", KANAL="aqlzone",
                   ADMIN_TG=["973358587"], BOT_TOKEN="sinov:token")
class KanalTekshiruvTest(TestCase):
    """
    Kanaldagi post joyidami — kunlik tekshiruv va qayta yuborish.

    Diqqat qaratilgan joy — UCHINCHI HOLAT. Tekshiruv "bor" va "yo'q"
    dan tashqari "noma'lum" ni ham qaytaradi va aynan shu holatda
    bayroqqa TEGMASLIGI kerak: tarmoq bir kun javob bermasa, butun
    kanal "yo'q bo'lib ketgan" deb belgilanardi va admin o'nlab
    postni behuda qayta yuborardi.
    """

    def setUp(self):
        cache.clear()
        pupil = Pupil.objects.create(first_name="Muallif")
        self.profil = pupil.asosiy_profil()
        self.m = Masala.objects.create(
            muallif=self.profil, sinf=5, matn="Ikki karra ikki nechchi?",
            javob="4", yechim="4.", holat=Masala.TASDIQ,
            kanal_at=timezone.now(), kanal_post_id=314,
        )

    # ─────────────────────────────────────── post_bormi

    def test_ozgarmadi_degani_post_bor_degani(self):
        """Telegram'ning "message is not modified" xatosi — bu XATO
        emas, tasdiq: o'zgartiradigan xabar joyida turibdi."""
        with patch("core.xabar._sorov",
                   return_value=(False, 400, "Bad Request: message is not modified")):
            self.assertEqual(xabar.post_bormi("@aqlzone", 314), "bor")

    def test_topilmadi_degani_post_yoq(self):
        with patch("core.xabar._sorov",
                   return_value=(False, 400, "Bad Request: message to edit not found")):
            self.assertEqual(xabar.post_bormi("@aqlzone", 314), "yoq")

    def test_notanish_xato_nomalum_qoladi(self):
        with patch("core.xabar._sorov", return_value=(False, 0, "timed out")):
            self.assertEqual(xabar.post_bormi("@aqlzone", 314), "nomalum")

    # ─────────────────────────────────────── tekshir()

    def test_yoq_bolsa_bayroq_qoyiladi(self):
        with patch("core.xabar._sorov",
                   return_value=(False, 400, "message to edit not found")):
            self.assertEqual(MK.tekshir(self.m), "yoq")
        self.m.refresh_from_db()
        self.assertTrue(self.m.kanal_yoq)
        self.assertIsNotNone(self.m.kanal_tekshir_at)

    def test_nomalum_bayroqqa_tegmaydi(self):
        self.m.kanal_yoq = True
        self.m.save(update_fields=["kanal_yoq"])
        with patch("core.xabar._sorov", return_value=(False, 0, "timed out")):
            self.assertEqual(MK.tekshir(self.m), "nomalum")
        self.m.refresh_from_db()
        # Bayroq O'ZGARMAGAN, lekin tekshirilgan vaqt yozilgan.
        self.assertTrue(self.m.kanal_yoq)
        self.assertIsNotNone(self.m.kanal_tekshir_at)

    def test_topilsa_bayroq_sonadi(self):
        self.m.kanal_yoq = True
        self.m.save(update_fields=["kanal_yoq"])
        with patch("core.xabar._sorov", return_value=(True, 200, "")):
            self.assertEqual(MK.tekshir(self.m), "bor")
        self.m.refresh_from_db()
        self.assertFalse(self.m.kanal_yoq)

    def test_yuborilmagan_masala_tekshirilmaydi(self):
        yangi = Masala.objects.create(
            muallif=self.profil, sinf=5, matn="Hali yuborilmagan.",
            javob="1", yechim="1.", holat=Masala.TASDIQ,
        )
        with patch("core.xabar._sorov") as s:
            self.assertEqual(MK.tekshir(yangi), "yuborilmagan")
        s.assert_not_called()

    def test_tekshiruv_postdagi_tugmalarni_qaytaradi(self):
        """Tekshiruv postni buzmaydi — u AYNAN o'sha tugmalarni
        qayta qo'yadi. Ro'yxat `yubor` bilan bir manbadan olinadi."""
        with patch("core.xabar._sorov", return_value=(True, 200, "")) as s:
            MK.tekshir(self.m)
        payload = s.call_args[0][1]
        tugmalar = payload["reply_markup"]["inline_keyboard"]
        self.assertEqual(payload["message_id"], 314)
        self.assertEqual(tugmalar[0][0]["url"], MK.havola(self.m))
        self.assertEqual(tugmalar[1][0]["url"], MK.royxat_havolasi())

    # ─────────────────────────────────────── qayta yuborish

    def test_qaytasiz_ikkinchi_marta_ketmaydi(self):
        with patch("core.xabar._sorov") as s:
            self.assertEqual(MK.yubor(self.m)[0], "takror")
        s.assert_not_called()

    def test_qayta_eskisini_ochirib_yuboradi(self):
        with patch("core.xabar.post_ochir", return_value="ochirildi") as o, \
             patch("core.xabar._sorov", return_value=(True, 200, "")):
            self.assertEqual(MK.yubor(self.m, qayta=True)[0], "yuborildi")
        o.assert_called_once_with("@aqlzone", 314)

    def test_qayta_yuborish_yoq_bayrogini_sondiradi(self):
        self.m.kanal_yoq = True
        self.m.save(update_fields=["kanal_yoq"])
        with patch("core.xabar.post_ochir", return_value="yoq"), \
             patch("core.xabar._sorov", return_value=(True, 200, "")):
            MK.yubor(self.m, qayta=True)
        self.m.refresh_from_db()
        self.assertFalse(self.m.kanal_yoq)
        self.assertIsNotNone(self.m.kanal_tekshir_at)

    def test_eskisi_ochmasa_ham_yangisi_ketadi(self):
        """Bot kanalda administrator bo'lmasa o'chirish ishlamaydi.
        Dubl — masalasiz kanaldan yaxshiroq, shuning uchun post
        baribir chiqadi."""
        with patch("core.xabar.post_ochir", return_value="xato"), \
             patch("core.xabar._sorov", return_value=(True, 200, "")):
            self.assertEqual(MK.yubor(self.m, qayta=True)[0], "yuborildi")

    # ─────────────────────────────────────── buyruq

    def test_buyruq_yangi_yoqolganlarni_adminga_aytadi(self):
        with patch("core.xabar._sorov",
                   return_value=(False, 400, "message to edit not found")), \
             patch("core.xabar.yubor") as y:
            call_command("kanal_tekshir", stdout=StringIO(), stderr=StringIO())
        self.assertEqual(y.call_count, 1)
        self.assertIn("Kanalda topilmadi", y.call_args[0][1])

    def test_buyruq_eski_yoqolgan_uchun_qayta_xabar_bermaydi(self):
        """Bir marta o'chirilgan post har kuni xabar berib tursa,
        admin bu xabarlarni bir haftada umuman o'qimay qo'yardi."""
        from io import StringIO

        from django.core.management import call_command

        self.m.kanal_yoq = True
        self.m.save(update_fields=["kanal_yoq"])
        with patch("core.xabar._sorov",
                   return_value=(False, 400, "message to edit not found")), \
             patch("core.xabar.yubor") as y:
            call_command("kanal_tekshir", stdout=StringIO(), stderr=StringIO())
        y.assert_not_called()

    def test_buyruq_soat_mos_kelmasa_ishlamaydi(self):
        """Cron buyruqni SOAT SAYIN chaqiradi — kerakli soatni
        buyruqning o'zi kutadi (server CEST, konteyner UTC)."""
        soat = (timezone.localtime().hour + 3) % 24
        with patch("core.xabar._sorov") as s:
            call_command("kanal_tekshir", "--soat", str(soat),
                         stdout=StringIO(), stderr=StringIO())
        s.assert_not_called()


class MasalaTestVariantTest(TestCase):
    """
    Variantli (test) masala.

    Diqqat qaratilgan joy — TO'G'RI JAVOB VARIANTLAR ORASIDA
    ekanligi. Usiz test masalasi yechib bo'lmaydigan bo'lib qolardi:
    odam to'rtta variantdan birini bosadi, server esa ularning hech
    biriga to'g'ri kelmaydigan javobni kutib turardi. Xatoni faqat
    birinchi yechuvchi topardi — muallif emas.
    """

    def kir(self, device: str) -> str:
        r = self.client.post(
            "/api/v1/auth/device", {"deviceId": device, "platform": "web"},
            content_type="application/json",
        )
        return r.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def setUp(self):
        cache.clear()
        self.token = self.kir("dev-variant-00000000001")
        self.pupil = Pupil.objects.get(identities__external_id="dev-variant-00000000001")
        self.profil = self.pupil.asosiy_profil()

    def yubor(self, **o) -> dict:
        maydon = {
            "sinf": 5,
            "matn": "Yog'och kubning bitta burchagi kesib olindi. Nechta yoq bor?",
            "javob": "7 ta",
            "yechim": "Oltita yoq qoladi va kesik yangi yoq beradi: 6 + 1 = 7.",
            "variantlar": ["6 ta", "7 ta", "8 ta", "9 ta"],
        }
        maydon.update(o)
        r = self.client.post("/api/v1/masalalar", maydon,
                             content_type="application/json", **self.auth(self.token))
        return {"kod": r.status_code, "tana": r.json()}

    def test_variantlar_saqlanadi(self):
        d = self.yubor()
        self.assertEqual(d["kod"], 201)
        m = Masala.objects.get(pk=d["tana"]["masala"]["id"])
        self.assertEqual(m.variantlar, ["6 ta", "7 ta", "8 ta", "9 ta"])

    def test_variantsiz_masala_ham_yuboriladi(self):
        """Ikki tur bir modelda turadi — variantsizi avvalgidek
        ishlashi kerak."""
        d = self.yubor(variantlar=[])
        self.assertEqual(d["kod"], 201)
        self.assertEqual(d["tana"]["masala"]["variantlar"], [])

    def test_togri_javob_variantlar_orasida_bolmasa_rad(self):
        d = self.yubor(javob="10 ta")
        self.assertEqual(d["kod"], 400)
        self.assertIn("javob", d["tana"])

    def test_takroriy_variant_rad(self):
        d = self.yubor(variantlar=["7 ta", "7 ta", "8 ta"])
        self.assertEqual(d["kod"], 400)
        self.assertIn("variantlar", d["tana"])

    def test_bitta_variant_rad(self):
        d = self.yubor(variantlar=["7 ta"], javob="7 ta")
        self.assertEqual(d["kod"], 400)

    def test_beshta_variant_rad(self):
        d = self.yubor(variantlar=["6 ta", "7 ta", "8 ta", "9 ta", "10 ta"])
        self.assertEqual(d["kod"], 400)

    def test_bosh_variant_tashlanadi(self):
        """Muallif uchinchi maydonni ochib, bo'sh qoldirishi mumkin.
        Bo'sh satr testda tanlanadigan variant bo'lib chiqardi."""
        d = self.yubor(variantlar=["6 ta", "7 ta", "  ", ""])
        self.assertEqual(d["kod"], 201)
        m = Masala.objects.get(pk=d["tana"]["masala"]["id"])
        self.assertEqual(m.variantlar, ["6 ta", "7 ta"])

    def test_javob_ikkala_turda_bir_xil_tekshiriladi(self):
        """Testda ham javob MATN bo'lib solishtiriladi — ya'ni
        normallashtirish (bo'sh joy, katta harf) ikkala turda ham
        bir xil ishlaydi."""
        d = self.yubor()
        pk = d["tana"]["masala"]["id"]
        Masala.objects.filter(pk=pk).update(holat=Masala.TASDIQ)
        r = self.client.post(f"/api/v1/masalalar/{pk}/javob", {"javob": "7 TA"},
                             content_type="application/json", **self.auth(self.token))
        self.assertTrue(r.json()["togri"])

    def test_royxatda_variantlar_keladi(self):
        """Mijoz ro'yxatdayoq masala turini bilishi kerak — karta
        ustidagi «Test» belgisi shu maydondan chiziladi."""
        d = self.yubor()
        Masala.objects.filter(pk=d["tana"]["masala"]["id"]).update(holat=Masala.TASDIQ)
        r = self.client.get("/api/v1/masalalar", **self.auth(self.token))
        self.assertEqual(r.json()["masalalar"][0]["variantlar"],
                         ["6 ta", "7 ta", "8 ta", "9 ta"])

    def test_multipart_variantlari_json_satr_bolib_keladi(self):
        """Rasm bilan kelgan masala `multipart` bo'ladi va u ro'yxatni
        bilmaydi — aynan chizmali test esa eng ko'p uchraydigan hol."""
        r = self.client.post("/api/v1/masalalar", {
            "sinf": 5,
            "matn": "Yog'och kubning bitta burchagi kesib olindi. Nechta yoq bor?",
            "javob": "7 ta",
            "yechim": "Oltita yoq qoladi va kesik yangi yoq beradi: 6 + 1 = 7.",
            "variantlar": json.dumps(["6 ta", "7 ta"]),
        }, **self.auth(self.token))
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["masala"]["variantlar"], ["6 ta", "7 ta"])

    def test_buzuq_json_aniq_xato_beradi(self):
        r = self.client.post("/api/v1/masalalar", {
            "sinf": 5,
            "matn": "Yog'och kubning bitta burchagi kesib olindi. Nechta yoq bor?",
            "javob": "7 ta",
            "yechim": "Oltita yoq qoladi va kesik yangi yoq beradi: 6 + 1 = 7.",
            "variantlar": "[buzuq",
        }, **self.auth(self.token))
        self.assertEqual(r.status_code, 400)
        self.assertIn("variantlar", r.json())


@override_settings(BOT_USERNAME="aqlzone_bot", KANAL="aqlzone",
                   ADMIN_TG=["973358587"], BOT_TOKEN="sinov:token")
class MasalaKorishTest(TestCase):
    """
    Ko'rishlar sanoqi va "kim urinib ko'rgan" ro'yxati.

    Diqqat qaratilgan joy — BIR ODAM BIR MARTA. Sanoq "nechta odam
    ko'rdi" degan savolga javob berishi kerak; takrorlar sanalsa u
    "nechta marta ochildi" ga aylanadi va bu son hech narsa
    haqida gapirmaydi — bitta odam masalani yigirma marta ochib,
    uni "eng ommabop" qilib qo'yardi.
    """

    def kir(self, device: str) -> str:
        r = self.client.post(
            "/api/v1/auth/device", {"deviceId": device, "platform": "web"},
            content_type="application/json",
        )
        return r.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def setUp(self):
        cache.clear()
        self.token = self.kir("dev-korish-000000000001")
        self.pupil = Pupil.objects.get(identities__external_id="dev-korish-000000000001")
        self.profil = self.pupil.asosiy_profil()

        muallif = Pupil.objects.create(first_name="Muallif")
        self.m = Masala.objects.create(
            muallif=muallif.asosiy_profil(), sinf=5, matn="Ikki karra ikki nechchi?",
            javob="4", yechim="4 ga teng.", holat=Masala.TASDIQ,
        )

    def och(self, token: str | None = None):
        return self.client.get(f"/api/v1/masalalar/{self.m.pk}",
                               **self.auth(token or self.token))

    # ─────────────────────────────────────── sanoq

    def test_birinchi_ochish_sanaladi(self):
        self.assertEqual(self.och().json()["korishSoni"], 1)
        self.m.refresh_from_db()
        self.assertEqual(self.m.korish_soni, 1)

    def test_takror_ochish_sanalmaydi(self):
        for _ in range(4):
            self.och()
        self.m.refresh_from_db()
        self.assertEqual(self.m.korish_soni, 1)
        self.assertEqual(MasalaKorish.objects.filter(masala=self.m).count(), 1)

    def test_har_odam_alohida_sanaladi(self):
        self.och()
        self.och(self.kir("dev-korish-000000000002"))
        self.och(self.kir("dev-korish-000000000003"))
        self.m.refresh_from_db()
        self.assertEqual(self.m.korish_soni, 3)

    def test_muallif_ozini_sanamaydi(self):
        """Muallif masalasini tekshirish uchun ochadi — bu qiziqish
        emas va sonni ko'tarib yuborardi."""
        oz = Masala.objects.create(
            muallif=self.profil, sinf=5, matn="O'zimning masalam.",
            javob="1", yechim="1 ga teng.", holat=Masala.TASDIQ,
        )
        self.client.get(f"/api/v1/masalalar/{oz.pk}", **self.auth(self.token))
        oz.refresh_from_db()
        self.assertEqual(oz.korish_soni, 0)

    def test_tasdiqlanmagan_masala_sanalmaydi(self):
        """Navbatdagi masalani ko'radigan yagona odam — admin va
        uning tekshiruvi sanoqqa kirmasligi kerak."""
        self.m.holat = Masala.KUTMOQDA
        self.m.save(update_fields=["holat"])
        self.client.get(f"/api/v1/masalalar/{self.m.pk}", **self.auth(self.token))
        self.m.refresh_from_db()
        self.assertEqual(self.m.korish_soni, 0)

    def test_royxatda_ochish_sanalmaydi(self):
        """Ro'yxatda o'nta masala birdan ko'rinadi va ularning hech
        biri hali ochilgan emas."""
        self.client.get("/api/v1/masalalar", **self.auth(self.token))
        self.m.refresh_from_db()
        self.assertEqual(self.m.korish_soni, 0)

    # ─────────────────────────────────────── kim urinib ko'rgan

    def adminga_aylantir(self):
        Identity.objects.create(
            pupil=self.pupil, provider=Identity.TELEGRAM, external_id="973358587",
        )

    def test_oddiy_odamga_royxat_yoq(self):
        r = self.client.get(f"/api/v1/masalalar/{self.m.pk}/yechganlar",
                            **self.auth(self.token))
        self.assertEqual(r.status_code, 404)

    def test_adminga_royxat_keladi(self):
        self.adminga_aylantir()
        self.client.post(f"/api/v1/masalalar/{self.m.pk}/javob", {"javob": "4"},
                         content_type="application/json", **self.auth(self.token))
        r = self.client.get(f"/api/v1/masalalar/{self.m.pk}/yechganlar",
                            **self.auth(self.token))
        self.assertEqual(r.status_code, 200)
        royxat = r.json()["royxat"]
        self.assertEqual(len(royxat), 1)
        self.assertTrue(royxat[0]["birinchi"])
        self.assertTrue(royxat[0]["yechdi"])

    def test_yecholmagan_ham_royxatda(self):
        """"Kim qiynaldi" — "kim yechdi" dan kam qimmatli emas."""
        self.adminga_aylantir()
        self.client.post(f"/api/v1/masalalar/{self.m.pk}/javob", {"javob": "5"},
                         content_type="application/json", **self.auth(self.token))
        royxat = self.client.get(f"/api/v1/masalalar/{self.m.pk}/yechganlar",
                                 **self.auth(self.token)).json()["royxat"]
        self.assertEqual(len(royxat), 1)
        self.assertFalse(royxat[0]["birinchi"])
        self.assertFalse(royxat[0]["yechdi"])

    def test_keyingi_urinishda_topgan_yechgan_hisoblanadi(self):
        """`togri` birinchi urinishni saqlaydi va shunday qolishi
        kerak. Lekin uchinchi urinishda topgan odam ham yechgan va
        uni "yecholmagan" deb ko'rsatish mehnatini inkor qilardi."""
        self.adminga_aylantir()
        for javob in ("5", "6", "4"):
            self.client.post(f"/api/v1/masalalar/{self.m.pk}/javob", {"javob": javob},
                             content_type="application/json", **self.auth(self.token))
        royxat = self.client.get(f"/api/v1/masalalar/{self.m.pk}/yechganlar",
                                 **self.auth(self.token)).json()["royxat"]
        self.assertFalse(royxat[0]["birinchi"])
        self.assertTrue(royxat[0]["yechdi"])
        self.assertEqual(royxat[0]["urinish"], 3)
        # Statistika esa TEGILMAYDI: birinchi urinish xato edi.
        self.m.refresh_from_db()
        self.assertEqual(self.m.yechgan_soni, 0)


class TamgaTest(TestCase):
    """
    Masala rasmidagi AqlZone belgisi.

    Diqqat qaratilgan joy — TAMG'A SAQLASH YO'LIDA turishi. Uni har
    bir chaqiruvchida alohida bosish mumkin edi, lekin bitta joyda
    unutilsa tamg'asiz rasm bazaga tushib ketardi va o'sha rasm
    kanalga chiqib, manbasiz tarqab ketardi.
    """

    def rasm_yasa(self, en=900, bal=700):
        from io import BytesIO

        from django.core.files.uploadedfile import SimpleUploadedFile
        from PIL import Image as PILImage

        xotira = BytesIO()
        PILImage.new("RGB", (en, bal), (255, 255, 255)).save(xotira, "PNG")
        return SimpleUploadedFile("chizma.png", xotira.getvalue(), "image/png")

    def och(self, fayl):
        from PIL import Image as PILImage

        img = PILImage.open(fayl)
        img.load()
        return img.convert("RGB")

    def tayyorla(self, fayl):
        from core.rasm import tayyorla

        return tayyorla(fayl)

    def test_yuklangan_rasmda_tamga_paydo_boladi(self):
        """Oq rasmning o'ng pastki burchagi endi oq emas — u yerda
        belgi turibdi."""
        oldin = self.och(self.rasm_yasa())
        keyin = self.och(self.tayyorla(self.rasm_yasa()))
        burchak = (keyin.width - 60, keyin.height - 40)
        self.assertEqual(oldin.getpixel(burchak), (255, 255, 255))
        self.assertNotEqual(keyin.getpixel(burchak), (255, 255, 255))

    def test_chizmaning_ozi_tegilmaydi(self):
        """Tamg'a burchakda turadi, ya'ni chizmaning markazi va yuqori
        qismi o'zgarmaydi — aks holda u masalani yopib qo'yardi."""
        keyin = self.och(self.tayyorla(self.rasm_yasa()))
        self.assertEqual(keyin.getpixel((keyin.width // 2, 100)), (255, 255, 255))

    def test_juda_kichik_rasm_tamgasiz_qoladi(self):
        """Belgi rasmning yarmiga aylanadigan joyda u umuman
        bosilmaydi: o'sha holatda tamg'a masalani yopib qo'yardi."""
        kichik = self.och(self.rasm_yasa(120, 90))
        keyin = self.och(self.tayyorla(self.rasm_yasa(120, 90)))
        self.assertEqual(kichik.size, keyin.size)
        self.assertEqual(keyin.getpixel((keyin.width - 6, keyin.height - 6)),
                         (255, 255, 255))

    def test_chizma_buyrugi_hamma_rasmni_chizadi(self):
        """Har bir chizma haqiqatan chiziladi va bo'sh emas."""
        from io import BytesIO

        from core.management.commands.masala_rasm import CHIZMALAR, chiz

        for nom in CHIZMALAR:
            with self.subTest(chizma=nom):
                img = self.och(BytesIO(chiz(nom)))
                self.assertEqual(img.size, (900, 700))
                # Oq fonda biror narsa chizilgan bo'lishi shart.
                self.assertGreater(len(img.getcolors(maxcolors=100000) or []), 20)

    def test_har_chizmaga_masala_topiladi(self):
        """Chizma masalaga MATNI bo'yicha ulanadi. Matn tahrirlansa
        bog'lanish uziladi va buni sinov tutishi kerak — aks holda
        buyruq jimgina "topilmadi" deb chiqib ketardi."""
        from core.management.commands.masala_rasm import CHIZMALAR

        pupil = Pupil.objects.create(first_name="Muallif")
        profil = pupil.asosiy_profil()
        for nom, (_, kalit) in CHIZMALAR.items():
            Masala.objects.create(
                muallif=profil, sinf=5, matn=kalit + " Davomi shu yerda.",
                javob="1", yechim="1.", holat=Masala.TASDIQ,
            )
        for nom, (_, kalit) in CHIZMALAR.items():
            with self.subTest(chizma=nom):
                self.assertTrue(Masala.objects.filter(matn__startswith=kalit).exists())


class BezakTest(TestCase):
    """
    Do'kondan kiyilgan bezak BOSHQALARGA ko'rinishi.

    Do'konning butun ma'nosi shunda: ilgari bezak faqat bolaning
    o'ziga ko'rinardi va shuning uchun 454 profildan atigi 6 tasi
    biror narsa sotib olgan.
    """

    def kir(self, device: str) -> str:
        r = self.client.post(
            "/api/v1/auth/device", {"deviceId": device, "platform": "web"},
            content_type="application/json",
        )
        return r.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def setUp(self):
        cache.clear()
        self.token = self.kir("dev-bezak-000000000001")
        self.profil = Pupil.objects.get(
            identities__external_id="dev-bezak-000000000001"
        ).asosiy_profil()

    def test_bezak_saqlanadi(self):
        r = self.client.post("/api/v1/profil/bezak", {"bezak": "olov"},
                             content_type="application/json", **self.auth(self.token))
        self.assertEqual(r.status_code, 200)
        self.profil.refresh_from_db()
        self.assertEqual(self.profil.avatar, "olov")

    def test_profil_raqami_talab_qilinmaydi(self):
        """Bitta profilli hisobda mijoz raqamni umuman bilmaydi —
        ilgari bezak shu sababdan jimgina yozilmay qolardi."""
        r = self.client.post("/api/v1/profil/bezak", {"bezak": "toj"},
                             content_type="application/json", **self.auth(self.token))
        self.assertEqual(r.json()["avatar"], "toj")

    def test_bezak_masala_muallifida_korinadi(self):
        self.client.post("/api/v1/profil/bezak", {"bezak": "olmos"},
                         content_type="application/json", **self.auth(self.token))
        m = Masala.objects.create(
            muallif=self.profil, sinf=5, matn="Ikki karra ikki nechchi?",
            javob="4", yechim="4.", holat=Masala.TASDIQ,
        )
        r = self.client.get(f"/api/v1/masalalar/{m.pk}", **self.auth(self.token))
        self.assertEqual(r.json()["muallif"]["avatar"], "olmos")

    def test_satr_bolmagan_qiymat_rad_etiladi(self):
        r = self.client.post("/api/v1/profil/bezak", {"bezak": 12},
                             content_type="application/json", **self.auth(self.token))
        self.assertEqual(r.status_code, 400)


class TilQaytaSoralmasinTest(TestCase):
    """
    Til bir marta so'raladi va boshqa so'ralmaydi.

    Tanlov QURILMADA saqlanadi, qurilma xotirasi esa yo'qoladi:
    Telegram ichidagi ko'rinish tozalanadi, brauzer keshi
    o'chiriladi, odam boshqa telefondan kiradi. Har safar til qayta
    so'ralardi — bir marta javob bergan odamdan yana va yana.
    """

    def kir(self) -> str:
        r = self.client.post(
            "/api/v1/auth/device", {"deviceId": "dev-til-000000000001", "platform": "web"},
            content_type="application/json",
        )
        return r.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def setUp(self):
        cache.clear()
        self.token = self.kir()

    def test_boshida_tanlanmagan(self):
        r = self.client.get("/api/v1/me", **self.auth(self.token))
        self.assertFalse(r.json()["user"]["tilTanlandi"])

    def test_til_saqlansa_belgilanadi(self):
        self.client.patch("/api/v1/me", {"til": "ru"},
                          content_type="application/json", **self.auth(self.token))
        d = self.client.get("/api/v1/me", **self.auth(self.token)).json()["user"]
        self.assertTrue(d["tilTanlandi"])
        self.assertEqual(d["til"], "ru")


@override_settings(BOT_TOKEN="sinov:token", BOT_USERNAME="aqlzone_bot", TESTDA=False)
class OnlaynTest(TestCase):
    """
    Onlayn o'yinchilar ro'yxati va undan chaqirish.

    Duel shu paytgacha faqat HAVOLA bilan ishlardi: do'sti yo'q bola
    raqib topa olmasdi. Ro'yxat o'sha bo'shliqni to'ldiradi.
    """

    def kir(self, device: str) -> str:
        r = self.client.post(
            "/api/v1/auth/device", {"deviceId": device, "platform": "web"},
            content_type="application/json",
        )
        return r.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def tayyorla(self, device: str, ism: str, tg: str | None) -> Pupil:
        """Ro'yxatdan o'tgan, ixtiyoriy ravishda Telegram'i bor hisob."""
        self.kir(device)
        p = Pupil.objects.get(identities__external_id=device)
        p.first_name = ism
        p.save(update_fields=["first_name"])
        p.royxatni_yop()
        if tg:
            Identity.objects.create(pupil=p, provider=Identity.TELEGRAM, external_id=tg)
        return p

    def setUp(self):
        cache.clear()
        self.token = self.kir("dev-onlayn-men-0001")
        self.men = Pupil.objects.get(identities__external_id="dev-onlayn-men-0001")
        self.men.first_name = "Men"
        self.men.save(update_fields=["first_name"])
        self.men.royxatni_yop()

    def royxat(self) -> list:
        r = self.client.get("/api/v1/onlayn", **self.auth(self.token))
        return r.json()["oyinchilar"]

    def test_telegramli_odam_royxatda(self):
        self.tayyorla("dev-onlayn-aziz-002", "Aziz", "111222333")
        ismlar = [x["ism"] for x in self.royxat()]
        self.assertIn("Aziz", ismlar)

    def test_telegramsiz_odam_royxatda_yoq(self):
        """Chaqiruv Telegram xabari bo'lib boradi — boshqa yo'l yo'q."""
        self.tayyorla("dev-onlayn-anon-003", "Anon", None)
        self.assertNotIn("Anon", [x["ism"] for x in self.royxat()])

    def test_ozim_royxatda_yoq(self):
        self.assertNotIn("Men", [x["ism"] for x in self.royxat()])

    def test_bugun_kirgan_royxatda_lekin_onlayn_emas(self):
        """
        Ro'yxat bir kunlik va bu ataylab o'zgartirilgan: ilgari u
        faqat 15 daqiqalik edi va deyarli HAR DOIM bo'sh chiqardi —
        kuniga o'n besh chog'li odam kiradi, ya'ni istalgan lahzada
        ichkarida bir-ikki kishi bo'ladi.

        Uch soat oldin kirgan odamni chaqirsa bo'ladi: chaqiruv
        Telegram xabari bo'lib boradi va u ilovada bo'lmasa ham
        yetib boradi. Lekin u "onlayn" DEB ATALMAYDI.
        """
        p = self.tayyorla("dev-onlayn-uxla-004", "Uyqu", "444555666")
        Session.objects.filter(pupil=p).update(
            last_seen=timezone.now() - timedelta(hours=3),
        )
        qator = next(x for x in self.royxat() if x["ism"] == "Uyqu")
        self.assertFalse(qator["onlayn"])

    def test_kecha_kirgan_odam_royxatda_yoq(self):
        p = self.tayyorla("dev-onlayn-kecha-006", "Kecha", "444555777")
        Session.objects.filter(pupil=p).update(
            last_seen=timezone.now() - timedelta(days=2),
        )
        self.assertNotIn("Kecha", [x["ism"] for x in self.royxat()])

    def test_hozir_kirgan_odam_onlayn(self):
        p = self.tayyorla("dev-onlayn-hozir-007", "Hozir", "444555888")
        Session.objects.filter(pupil=p).update(last_seen=timezone.now())
        qator = next(x for x in self.royxat() if x["ism"] == "Hozir")
        self.assertTrue(qator["onlayn"])

    def test_tirik_signali_last_seen_ni_yangilaydi(self):
        """
        Ilovani ochib, hech narsa bosmay o'tirgan odam ro'yxatdan
        tushib ketardi — "onlayn" `last_seen` ga qarab aniqlanadi,
        u esa faqat so'rov kelganda yangilanadi.

        Signalning butun ishi — tekshiruvdan o'tish: `last_seen` ni
        autentifikatsiyaning o'zi yangilaydi.
        """
        eski = timezone.now() - timedelta(hours=2)
        Session.objects.filter(pupil=self.men).update(last_seen=eski)

        r = self.client.post("/api/v1/tirik", **self.auth(self.token))
        self.assertEqual(r.status_code, 200)

        yangi = Session.objects.filter(pupil=self.men).first().last_seen
        self.assertGreater(yangi, eski)

    def test_tiriksiz_signal_rad_etiladi(self):
        self.assertEqual(self.client.post("/api/v1/tirik").status_code, 401)

    def test_onlayn_soni_faqat_hozirgilarni_sanaydi(self):
        """Sarlavhadagi son ("3 kishi onlayn") serverdan keladi —
        ikki joyda ikki xil hisoblash ehtimoli bo'lmasin."""
        hozir = self.tayyorla("dev-onlayn-son-a-008", "SonHozir", "444556001")
        bugun = self.tayyorla("dev-onlayn-son-b-009", "SonBugun", "444556002")
        Session.objects.filter(pupil=hozir).update(last_seen=timezone.now())
        Session.objects.filter(pupil=bugun).update(
            last_seen=timezone.now() - timedelta(hours=5),
        )
        r = self.client.get("/api/v1/onlayn", **self.auth(self.token)).json()
        ismlar = [x["ism"] for x in r["oyinchilar"]]
        self.assertIn("SonHozir", ismlar)
        self.assertIn("SonBugun", ismlar)
        self.assertEqual(
            r["onlaynSoni"], sum(1 for x in r["oyinchilar"] if x["onlayn"]),
        )

    class DarholOqim:
        """Fon oqimi sinovda darhol ishlasin — test vaqtga bog'liq bo'lmasin."""

        def __init__(self, target=None, daemon=None, **kw):
            self._target = target

        def start(self):
            self._target()

    def test_chaqiruv_xabari_yuboriladi(self):
        raqib = self.tayyorla("dev-onlayn-raqib-005", "Raqib", "777888999")
        profil = raqib.asosiy_profil()
        with patch("core.xabar._sorov", return_value=(True, 200, "")) as s, \
             patch("threading.Thread", self.DarholOqim):
            r = self.client.post("/api/v1/duel", {"kimga": profil.pk},
                                 content_type="application/json", **self.auth(self.token))
        self.assertEqual(r.status_code, 201)
        self.assertTrue(r.json()["yuborildi"])
        # Xabar ichida AYNAN shu duelning kodi bo'lishi kerak —
        # raqib chaqiruvni qidirib o'tirmasin.
        payload = s.call_args[0][1]
        self.assertIn(r.json()["kod"], json.dumps(payload))

    def test_ozini_chaqira_olmaydi(self):
        men_profil = self.men.asosiy_profil()
        with patch("core.xabar._sorov") as s:
            r = self.client.post("/api/v1/duel", {"kimga": men_profil.pk},
                                 content_type="application/json", **self.auth(self.token))
        s.assert_not_called()
        self.assertFalse(r.json()["yuborildi"])


class MasalaFiltrTest(TestCase):
    """
    Yechilganlik filtri va sahifalar.

    "Yechgan" — BIRINCHI urinishda to'g'ri topgani. Xato javob
    bergan masala "yechilmagan" tomonda qoladi: odam u yerga aynan
    qaytishi kerak.
    """

    def kir(self, device: str) -> str:
        r = self.client.post(
            "/api/v1/auth/device", {"deviceId": device, "platform": "web"},
            content_type="application/json",
        )
        return r.json()["token"]

    def auth(self, token: str) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {token}"}

    def setUp(self):
        cache.clear()
        self.token = self.kir("dev-filtr-000000000001")
        self.muallif = Pupil.objects.create(first_name="Muallif").asosiy_profil()
        self.masalalar = [
            Masala.objects.create(
                muallif=self.muallif, sinf=5, holat=Masala.TASDIQ,
                matn=f"Masala raqami {i} — nechchi?", javob=str(i), yechim=f"{i}.",
            )
            for i in range(1, 26)
        ]

    def royxat(self, **q) -> dict:
        s = "&".join(f"{k}={v}" for k, v in q.items())
        return self.client.get(f"/api/v1/masalalar?{s}", **self.auth(self.token)).json()

    def test_sahifada_ontadan(self):
        d = self.royxat()
        self.assertEqual(len(d["masalalar"]), 10)
        self.assertEqual(d["jami"], 25)
        self.assertEqual(d["sahifalar"], 3)
        self.assertTrue(d["yana"])

    def test_oxirgi_sahifada_qoldigi(self):
        d = self.royxat(sahifa=2)
        self.assertEqual(len(d["masalalar"]), 5)
        self.assertFalse(d["yana"])

    def test_yoq_sahifa_oxirgisiga_tushadi(self):
        """Filtr almashganda odam bo'sh ekranga tushib qolmasin."""
        d = self.royxat(sahifa=99)
        self.assertEqual(d["sahifa"], 2)
        self.assertEqual(len(d["masalalar"]), 5)

    def javob_ber(self, m: Masala, javob: str) -> None:
        self.client.post(f"/api/v1/masalalar/{m.pk}/javob", {"javob": javob},
                         content_type="application/json", **self.auth(self.token))

    def test_yechgan_filtri(self):
        self.javob_ber(self.masalalar[0], "1")          # to'g'ri
        self.javob_ber(self.masalalar[1], "xato")       # xato
        d = self.royxat(holat="yechgan")
        self.assertEqual(d["jami"], 1)
        self.assertIn("raqami 1 ", d["masalalar"][0]["matn"])

    def test_yechilmagan_filtri_xatoni_ham_oladi(self):
        self.javob_ber(self.masalalar[0], "1")          # to'g'ri
        self.javob_ber(self.masalalar[1], "xato")       # xato
        d = self.royxat(holat="yechilmagan")
        # 25 tadan bittasi yechildi — qolgani shu filtrda.
        self.assertEqual(d["jami"], 24)
        matnlar = " ".join(x["matn"] for x in d["masalalar"])
        self.assertNotIn("raqami 1 ", matnlar)

    def test_royxatda_yechgan_belgisi_bor(self):
        """Karta "yechgansiz" va "yecholmagansiz" ni ajratadi —
        buning uchun ro'yxatda `birinchiTogri` bo'lishi kerak."""
        self.javob_ber(self.masalalar[0], "1")
        d = self.royxat(holat="yechgan")
        self.assertTrue(d["masalalar"][0]["uringan"])
        self.assertTrue(d["masalalar"][0]["birinchiTogri"])
