"""
Aql Zone — API testlari.

    python manage.py test

Diqqat qaratilgan joylar: kirish, progressni BIRLASHTIRISH (eng nozik qism —
bu yerda xato bo'lsa bolaning natijasi yo'qoladi) va begona kalitlarni rad etish.
"""
import hashlib
import hmac
import json
from datetime import timedelta
from io import StringIO
import time
from unittest.mock import patch
from urllib.parse import urlencode

from django.core.management import call_command
from django.test import TestCase, override_settings
from django.utils import timezone

from . import auth as A
from . import xabar
from . import liga as L
from . import reklama as R
from .models import (
    Identity, KirishKodi, LessonResult, LigaAzo, Profile, Progress, Pupil,
    Reklama, ReklamaQabul, Session,
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
        self.assertEqual(tugma["url"], "https://aql-zone.uz")

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
    def test_ism_yarim_bolsa_xabar_yoq(self, sorov):
        """Familiyasiz odam hali ro'yxatdan o'tmagan — xabar ham yo'q."""
        pupil = Pupil.objects.create(first_name="Yolg‘iz", last_name="")
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
        self.assertFalse(Identity.objects.filter(provider="phone").exists())
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

    def test_faqat_ism_yetarli_emas(self):
        t = self.kir()
        self.assertFalse(self.patch(t, ism="Ali").json()["user"]["royxatdan"])

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
        from core.management.commands import bot as B

        with self.settings(SAYT_URL="https://aql-zone.uz",
                           MINI_APP_URL="https://aql-zone.uz"):
            B.salom_yubor(1, "973358587", "Ali", "Valiyev", "uz")
        qatorlar = api.call_args[1]["reply_markup"]["inline_keyboard"]
        self.assertEqual(qatorlar[0][0]["style"], "success")   # Saytga kirish
        self.assertEqual(qatorlar[1][0]["style"], "primary")   # Ilovani ochish

    @patch("core.management.commands.bot.api")
    def test_raqam_tugmasi_kok(self, api):
        from core.management.commands import bot as B

        B.raqam_sora(1, "matn", "uz")
        tugma = api.call_args[1]["reply_markup"]["keyboard"][0][0]
        self.assertEqual(tugma["style"], "primary")
        self.assertTrue(tugma["request_contact"])
