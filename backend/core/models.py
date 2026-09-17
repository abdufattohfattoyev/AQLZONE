"""
Aql Zone — ma'lumotlar modeli.

Django'ning `auth` ilovasi ATAYLAB ishlatilmagan: bizda parol ham, email ham
yo'q. Bolaga parol qo'ydirish — uni yo'qotish demak.

Tuzilma uch qavatli va aynan shu qavatlar universal kirishni beradi:

    Pupil     — HISOB. O'zida hech qanday kirish ma'lumoti saqlamaydi.
      │
      ├── Identity — KIRISH USULI. Bittadan ko'p bo'lishi mumkin:
      │              qurilma id, Telegram, keyinchalik telefon yoki Google.
      │              Yangi usul qo'shish = yangi qator, sxema o'zgarmaydi.
      │
      └── Profile  — BOLA. Bir oilada ikki farzand bo'lsa, ikki profil.
            └── Progress, LessonResult — progress profilga tegishli,
                                          hisobga emas.

Nega shunday: avval `tg_id` va `device_id` to'g'ridan-to'g'ri `Pupil` da
ustun edi. Uchinchi usulni (telefon) qo'shish uchun yana ustun kerak
bo'lardi va "qaysi biri asosiy?" degan savol chiqardi. Alohida jadval bu
savolni butunlay yo'q qiladi: usullar teng, hisob bitta.
"""
from __future__ import annotations

import json
import re
import unicodedata

from django.db import models
from django.utils import timezone

#: Serverga yozilishiga ruxsat etilgan localStorage kalitlari.
#: Bularsiz mijoz serverga xohlagan narsasini yozib qo'yishi mumkin bo'lardi.
#:
#: Ro'yxat ataylab eski nomlarni ham qabul qiladi (`aqlvoy`, `aqlzona`).
#: Brend nomi o'zgardi, lekin qurilmalarda TURGAN kalitlar o'zgarmaydi —
#: ularni rad etsak, bolalarning yulduzlari serverga yetib bormay qolardi.
BIZNING_KALIT = re.compile(r"^(aql(voy|zona|zone)|azapp)")

#: Bitta kalit qiymatining eng katta uzunligi.
MAX_QIYMAT = 200_000


class Pupil(models.Model):
    """
    Hisob. Kirish usullari `Identity` da, bolalar `Profile` da.

    Ism va familiya bu yerda saqlanadi, chunki ular hisobga tegishli
    (odatda ota-ona ismi, Telegram'dan keladi yoki qo'lda kiritiladi).
    Profil ismi — bu bolaning ismi — undan alohida turadi.
    """

    first_name = models.CharField(max_length=120, default="", blank=True)
    last_name = models.CharField(max_length=120, default="", blank=True)
    username = models.CharField(max_length=120, default="", blank=True)
    #: Bu hisob USTOZNIKIMI.
    #:
    #: Nomi oldiga "Ustoz" qo'shiladi — ilovada ham, kanal postida
    #: ham. Bu bezak emas: masalani kim yozgani uning OG'IRLIGINI
    #: o'zgartiradi. O'quvchi yozgan masala — mashq, ustoz yozgani
    #: esa dars. Bolaga qaysi biri ekanini bilish kerak.
    #:
    #: Nega alohida maydon, ismga "Ustoz" deb yozib qo'yilmaydi?
    #: Chunki ism reytingda, duel ro'yxatida va profilida ham
    #: ko'rinadi — u yerlarda unvon ortiqcha. Ustiga ism
    #: Telegram'dan yangilanganda qo'lda yozilgan qo'shimcha
    #: yo'qolib ketardi.
    ustoz = models.BooleanField(default=False)
    #: Ism qo'lda tahrirlanganmi.
    #:
    #: Telegram'ga har kirganda ism o'sha yerdan yangilanadi — bu ism
    #: Telegram'da o'zgarsa foydali. Lekin foydalanuvchi ismini ilovada
    #: O'ZI yozgan bo'lsa, uni qayta yozib yuborish — kiritganini o'chirish
    #: demak. Shu bayroq o'sha holatni ajratadi.
    ism_qolda = models.BooleanField(default=False)
    #: Ro'yxatdan o'tgan payt. `None` — hali o'tmagan.
    #:
    #: Nega alohida ustun, `first_name` bo'shligiga qarab bilib bo'lmaydimi?
    #: Bo'lmaydi. Telegram'dan kelgan hisobda ism bor, familiya esa
    #: ko'pincha yo'q — ya'ni "ismi bor" hali "ro'yxatdan o'tgan" degani
    #: emas. Reyting aynan shu bayroqqa qaraydi: ismsiz qatnashchi
    #: ro'yxatda "Noma'lum" bo'lib turmasligi kerak.
    registered_at = models.DateTimeField(null=True, blank=True, default=None)
    #: Telegram kanaliga a'zoligi TASDIQLANGAN payt. `None` — hali yo'q.
    #:
    #: Nega saqlanadi: ilova har ochilganda "kanalga qo'shiling" oynasini
    #: ko'rsatish-ko'rsatmaslikni hal qilish kerak, javob esa Telegram'dan
    #: keladi. Har safar so'rasak, a'zo bo'lib bo'lgan odam uchun ham
    #: tashqi so'rov ketardi va ilova o'sha javobni kutib turardi.
    #:
    #: Bir marta tasdiqlangach qayta so'ralmaydi. Odam keyin kanaldan
    #: chiqib ketsa ham qaytarib chaqirmaymiz — bir marta rad javob
    #: bergan odamni ta'qib qilish obuna qaytarmaydi, ilovadan bezdiradi.
    kanal_azo_at = models.DateTimeField(null=True, blank=True, default=None)
    #: Bot bloklangani ANIQLANGAN payt (Telegram 403 qaytargan).
    #:
    #: Keyingi e'lonlar bunday hisobni butunlay o'tkazib yuboradi. Busiz
    #: har e'londa o'sha odamlarga qayta urinilardi: bu vaqt, so'rov
    #: cheklovi va "xato" ustunidagi soxta raqam — haqiqiy nosozlik
    #: o'sha soxta raqam ichida ko'rinmay ketardi.
    bot_bloklandi_at = models.DateTimeField(null=True, blank=True, default=None)
    #: Oxirgi eslatma yuborilgan payt.
    #:
    #: Kuniga bittadan ko'p yubormaslik uchun. Rejalashtirgich bir necha
    #: marta ishga tushishi mumkin (qo'lda sinash, qayta urinish,
    #: noto'g'ri sozlangan cron) — bunda bola bir kunda uch-to'rt eslatma
    #: olardi. Bu eslatma emas, bezovta qilish: javobi bitta — bloklash.
    eslatma_at = models.DateTimeField(null=True, blank=True, default=None)
    #: Foydalanuvchi "boshqa yozmang" tugmasini bosgan payt.
    #:
    #: Bu BLOKLASHDAN farq qiladi va farqi muhim: bloklash — bizdan
    #: qochish, bu esa hurmat bilan so'ralgan iltimos. Belgilangan hisobga
    #: HECH QANDAY xabar bormaydi: na eslatma, na qaytarish. Bot esa
    #: avvalgidek javob beradi — odam o'zi yozsa, u bilan gaplashamiz.
    #:
    #: Nega tugma kerak. Rad javob berish yo'li bo'lmagan xabar oxir-oqibat
    #: bloklanadi, va bloklangan odam butunlay yo'qoladi: keyin unga na
    #: e'lon, na kirish havolasi yetib boradi. Bitta tugma o'sha yo'qotishni
    #: oddiy "hozircha kerakmas" ga aylantiradi.
    xabar_yopiq_at = models.DateTimeField(null=True, blank=True, default=None)
    #: Oxirgi "qaytib keling" xabari yuborilgan payt.
    qaytarish_at = models.DateTimeField(null=True, blank=True, default=None)
    #: Shu tanaffusda nechta "qaytib keling" xabari yuborilgan (0..3).
    #:
    #: Odam qaytib dars qilishi bilan NOLGA tushadi (`qaytarish.py`) —
    #: ya'ni hisob har tanaffus uchun alohida yuritiladi va bir yil ichida
    #: ikki marta yo'qolgan odam ikkala safar ham chaqiriladi.
    qaytarish_soni = models.PositiveSmallIntegerField(default=0)
    #: Foydalanuvchi tanlagan til: "uz" yoki "ru".
    #:
    #: Ilovaning o'ziga bu kerak emas — u tilni qurilmada (localStorage)
    #: saqlaydi. SERVER YOZADIGAN xabarlar uchun kerak: eslatma, botdagi
    #: javoblar va e'lonlar. Ular ilova ochiq bo'lmaganda yuboriladi,
    #: ya'ni qurilmadagi sozlamani so'rab olishning iloji yo'q.
    #:
    #: Standart qiymat "uz": bu loyihaning asosiy tili va til hali
    #: kelmagan eski hisoblar avvalgidek o'zbekcha xabar oladi.
    til = models.CharField(max_length=2, default="uz", blank=True)

    #: Tilni foydalanuvchining O'ZI tanlaganmi.
    #:
    #: `til` ning o'zi yetmaydi: uning standart qiymati bor ("uz"), ya'ni
    #: "o'zbekchani tanladi" bilan "hech narsa so'ralmagan" bir xil
    #: ko'rinadi.
    #:
    #: Bu bayroq kerak, chunki tanlov QURILMADA saqlanadi
    #: (`localStorage`), qurilma xotirasi esa yo'qoladi: Telegram
    #: ichidagi ko'rinish tozalanadi, brauzer keshi o'chiriladi, odam
    #: boshqa telefondan kiradi. Har safar til yana so'ralardi — bir
    #: marta javob bergan odamdan yana va yana.
    #:
    #: Endi hisob bir marta javob bersa, ilova uni SERVERDAN oladi va
    #: boshqa so'ramaydi.
    til_tanlandi = models.BooleanField(default=False)

    # ─────────────────────── TANISHUV ANKETASI ───────────────────────
    #
    # "Kim bu odam?" — ro'yxatdan o'tgandan keyin UCH savol bilan
    # so'raladi (`components/Anketa.tsx`). Busiz panel faqat "nechta
    # odam" deydi, lekin "kimlar" demaydi: o'quvchimi, ota-onami,
    # ustozmi, qaysi sinf, qaysi viloyat. Mahsulot qarori (nimani
    # pullik qilish, qayerga reklama berish) aynan shu savollarga
    # suyanadi.
    #
    # Hammasi IXTIYORIY: anketada "o'tkazib yuborish" bor. Majburiy
    # anketa yangi odamni birinchi daqiqada yo'qotadi.
    KIMLAR = [("oquvchi", "O'quvchi"), ("ota_ona", "Ota-ona"), ("ustoz", "Ustoz")]
    kim = models.CharField(max_length=10, choices=KIMLAR, default="", blank=True)
    #: 0 — maktabgacha, 1..11 — sinf, -1 — javob berilmagan.
    anketa_sinf = models.SmallIntegerField(default=-1)
    viloyat = models.CharField(max_length=24, default="", blank=True)
    #: Anketa ko'rsatildimi (javob bergan YOKI o'tkazib yuborgan).
    #: Ikkinchi marta so'ralmasin.
    anketa_at = models.DateTimeField(null=True, blank=True, default=None)

    # ─────────────────────── TO'LOV QOBILIYATI BELGILARI ───────────────────────
    #
    # To'g'ridan-to'g'ri so'ralmaydi — "qancha pul to'lay olasiz?" degan
    # savol odamni qo'rqitadi. O'rniga BILVOSITA belgilar yig'iladi:
    #
    #   tg_premium  Telegram Premium'ga pul to'laydi — ya'ni onlayn
    #               obunaga to'lash odati BOR. Eng kuchli belgi.
    #   qurilma     iPhone / Android / kompyuter — `Hodisa` dagi
    #               brauzer satridan aniqlanadi.
    tg_premium = models.BooleanField(default=False)
    qurilma = models.CharField(max_length=12, default="", blank=True)

    #: Telegram Mini App ichida "botga menga yozishga ruxsat beraman"
    #: bosilgan payt (`WebApp.requestWriteAccess`).
    #:
    #: Kanaldagi masala tugmasi Mini App'ni TO'G'RIDAN-TO'G'RI ochadi —
    #: odam botni hech qachon /start qilmagan bo'ladi va bot unga
    #: umuman yoza olmaydi. Ya'ni kunlik eslatma aynan kanaldan
    #: kelganlarga yetib bormasdi. Shu ruxsat bu yo'lni ochadi.
    yozish_ruxsat_at = models.DateTimeField(null=True, blank=True, default=None)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "pupils"
        verbose_name = "hisob"
        verbose_name_plural = "hisoblar"

    def __str__(self) -> str:
        return self.first_name or self.username or f"hisob #{self.pk}"

    def kirish(self, provider: str) -> str | None:
        """Shu usul bo'yicha tashqi id (bo'lmasa None)."""
        i = self.identities.filter(provider=provider).first()
        return i.external_id if i else None

    def asosiy_profil(self) -> Profile:
        """
        Joriy profil. Yo'q bo'lsa — yaratiladi.

        Eski mijozlar profil haqida bilmaydi va hech qanday id yubormaydi;
        ular uchun shu birinchi profil ishlatiladi, ya'ni yangilanish
        progressni buzmaydi.
        """
        p = self.profiles.order_by("created_at", "pk").first()
        if p is None:
            p = Profile.objects.create(pupil=self, name=self.ism or "Men")
        return p

    # DRF `request.user.is_authenticated` ni tekshiradi. Bizda Django'ning
    # AbstractUser'i yo'q, shuning uchun shu ikki xossani o'zimiz beramiz.
    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def is_anonymous(self) -> bool:
        return False

    @property
    def ism(self) -> str:
        return self.first_name or self.username or ""

    @property
    def familiya(self) -> str:
        return self.last_name

    @property
    def toliq_ism(self) -> str:
        """Ism va familiya birga. Ikkalasi ham bo'sh bo'lsa — bo'sh satr."""
        return " ".join(x for x in (self.first_name, self.last_name) if x)

    @property
    def muallif_ismi(self) -> str:
        """
        Masala ustida ko'rinadigan nom — unvoni bilan.

        FAQAT muallif sifatida ishlatiladi. Reyting va duel ro'yxati
        oddiy `toliq_ism` ni oladi: u yerda hamma teng qatnashchi va
        unvon begona ko'rinardi.
        """
        ism = self.toliq_ism
        return f"Ustoz {ism}" if self.ustoz and ism else ism

    @property
    def royxatdan_otgan(self) -> bool:
        return self.registered_at is not None

    def royxatni_yop(self) -> bool:
        """
        Ismi bor bo'lsa — ro'yxatdan o'tgan deb belgilaydi.

        Bir joyda turadi, chunki uni uch joy chaqiradi: qo'lda saqlash,
        Telegram orqali kirish va hisoblarni birlashtirish. Har birida
        alohida yozilsa, biri unutilib qolardi va foydalanuvchi ro'yxat
        oynasidan chiqa olmay qolardi.

        ─────────── FAMILIYA NEGA SHART EMAS ───────────

        Ilgari ikkalasi ham talab qilinardi va natijada BOTDAN kelgan
        odam ko'pincha ism so'raydigan formaga tushardi: Telegram'da
        familiya IXTIYORIY va foydalanuvchilarning katta qismida u
        umuman yo'q.

        Ya'ni bot havolasini bosgan odam ilovaga emas, formaga
        tushardi — eng yomon joyda, birinchi ekranda. Familiyani
        keyin sozlamalarda qo'shsa bo'ladi; uni kirish yo'lida
        to'siq qilishga arzimaydi.
        """
        if self.registered_at or not self.first_name.strip():
            return False
        self.registered_at = timezone.now()
        self.save(update_fields=["registered_at"])
        # Adminga xabar ham SHU YERDA: ro'yxat aynan shu qatorda yopiladi
        # va uchala chaqiruvchining har birida alohida yozilsa, biri
        # ertami-kechmi unutilardi. Yuborish fon oqimida — bu chaqiruv
        # foydalanuvchini kutdirmaydi (`xabar.adminga_yangi_hisob`).
        from .xabar import adminga_yangi_hisob

        adminga_yangi_hisob(self)
        return True

    @property
    def telefon(self) -> str:
        """
        Bog'langan telefon raqami.

        Raqam alohida ustunda emas, `Identity(provider="phone")` da turadi —
        ya'ni u boshqa kirish usullari bilan bir xil qatorda. Shu sabab
        keyinchalik SMS orqali kirish qo'shilsa, model o'zgarmaydi.
        """
        return self.kirish(Identity.TELEFON) or ""


class Identity(models.Model):
    """
    Bitta kirish usuli.

    Yangi provayder qo'shish uchun kod o'zgartirish shart emas — faqat
    `provider` qatoriga yangi qiymat yoziladi va o'sha usulni tekshiradigan
    view yoziladi. Model o'zi hech qachon o'zgarmaydi.

    `(provider, external_id)` juftligi yagona: bitta Telegram hisobi ikki
    joyga bog'lanib qololmaydi.
    """

    QURILMA = "device"
    TELEGRAM = "telegram"
    TELEFON = "phone"
    GOOGLE = "google"

    PROVAYDERLAR = [
        (QURILMA, "qurilma"),
        (TELEGRAM, "Telegram"),
        (TELEFON, "telefon"),
        (GOOGLE, "Google"),
    ]

    pupil = models.ForeignKey(Pupil, on_delete=models.CASCADE, related_name="identities")
    provider = models.CharField(max_length=20, choices=PROVAYDERLAR)
    external_id = models.CharField(max_length=190)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "identities"
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "external_id"], name="identity_provider_external_uniq"
            )
        ]
        indexes = [models.Index(fields=["pupil"])]
        verbose_name = "kirish usuli"
        verbose_name_plural = "kirish usullari"

    def __str__(self) -> str:
        return f"{self.get_provider_display()}: {self.external_id[:16]}"


class Profile(models.Model):
    """
    Bitta bola.

    Progress hisobga emas, SHU YERGA bog'lanadi. Shuning uchun bir
    telefonda ikki farzand o'ynasa, yulduzlar aralashmaydi.
    """

    pupil = models.ForeignKey(Pupil, on_delete=models.CASCADE, related_name="profiles")
    name = models.CharField(max_length=40, default="", blank=True)
    #: Tulki bezagi va rang — mijoz tanlagan qiymat, server uni talqin qilmaydi.
    avatar = models.CharField(max_length=40, default="", blank=True)
    #: "Meni jonli bellashuvga chaqirmasin" — sozlamalardagi tugma.
    #: Oddiy chaqiruv (havola, bot xabari) bunga tegmaydi: u ekranni
    #: to'sib chiqmaydi va istalgan payt ochiladi.
    taklif_yopiq = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "profiles"
        indexes = [models.Index(fields=["pupil"])]
        ordering = ["created_at", "pk"]
        verbose_name = "profil"
        verbose_name_plural = "profillar"

    def __str__(self) -> str:
        return self.name or f"profil #{self.pk}"


class Session(models.Model):
    """
    Sessiya tokeni.

    Tokenning O'ZI saqlanmaydi — faqat sha256 xeshi. Baza o'g'irlansa ham
    hech kim o'sha tokenlar bilan kira olmaydi.
    """

    token_hash = models.CharField(max_length=64, primary_key=True)
    pupil = models.ForeignKey(Pupil, on_delete=models.CASCADE, related_name="sessions")
    platform = models.CharField(max_length=16, default="", blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    last_seen = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "sessions"
        indexes = [models.Index(fields=["pupil"])]


class KirishKodi(models.Model):
    """
    Botdagi "Saytga kirish" havolasining bir martalik kodi.

    Nega kerak: Telegram Mini App faqat Telegram ICHIDA ochiladi. Odam
    kompyuterda saytni ochganda esa uni tanishning yo'li yo'q edi —
    Login Widget bor, lekin u domen sozlamasini talab qiladi va telefonda
    qo'shimcha bosqich qo'shadi. Bot allaqachon kimligini biladi, shuning
    uchun eng qisqa yo'l: bot havola yuboradi, havola saytga kiritadi.

    Uch himoya, va uchalasi ham zarur:

    1. **Kodning o'zi saqlanmaydi** — faqat sha256 xeshi, xuddi `Session`
       kabi. Baza o'g'irlansa ham kodlar bilan kirib bo'lmaydi.
    2. **Bir soatdan keyin kuchini yo'qotadi.** Havola Telegram tarixida
       qolib ketadi; uni keyin topgan odam kira olmasligi kerak.
    3. **Yangi `/start` eskisini darhol bekor qiladi** — suhbatda faqat
       oxirgi havola ishlaydi.

    Muddat ichida kod QAYTA ishlatiladi. Avval u bir martalik edi va bu
    amalda ishlamadi: Telegram havolani o'z brauzerida ochadi, odam esa
    keyin uni oddiy brauzerda ham ochadi — ikkinchisida kod allaqachon
    "ishlatilgan" bo'lib, sayt egasini o'z hisobiga kiritmay qo'yardi.
    Sabab: kirish `auth.kod_bilan_kir()` da.
    """

    #: Kod necha daqiqa amal qiladi. Bot xabarida ham shu yoziladi.
    DAQIQA = 60

    kod_hash = models.CharField(max_length=64, primary_key=True)
    pupil = models.ForeignKey(Pupil, on_delete=models.CASCADE, related_name="kirish_kodlari")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "kirish_kodlari"
        indexes = [models.Index(fields=["pupil"])]
        verbose_name = "kirish kodi"
        verbose_name_plural = "kirish kodlari"

    @property
    def eskirgan(self) -> bool:
        return (timezone.now() - self.created_at).total_seconds() > self.DAQIQA * 60


class Progress(models.Model):
    """
    Veb va Mini App localStorage kalitlari shu yerda blob sifatida turadi.
    Shu bilan mijoz kodini o'zgartirmasdan sinxronlash mumkin bo'ladi.

    Diqqat: kalit PROFIL, hisob emas — bir oilada ikki bola bo'lsa,
    ikkalasining yulduzlari alohida turadi.
    """

    # `primary_key=True` ataylab yo'q: kalit ustunni almashtirish SQLite'da
    # jadvalni qayta qurishni talab qiladi va migratsiyani keraksiz
    # xavfli qiladi. Oddiy `id` + yagona FK bir xil kafolatni beradi.
    profile = models.OneToOneField(
        Profile, on_delete=models.CASCADE, related_name="progress"
    )
    state = models.JSONField(default=dict)
    stars = models.IntegerField(default=0)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "progress"

    @staticmethod
    def yulduz_hisobla(state: dict[str, str]) -> int:
        """Reyting uchun jami yulduz: qabul qilingan har bir kalitdan `stars`."""
        jami = 0
        for kalit, xom in state.items():
            if not BIZNING_KALIT.match(kalit):
                continue
            try:
                d = json.loads(xom)
            except (TypeError, ValueError):
                continue  # buzuq qiymat — e'tiborsiz
            if isinstance(d, dict) and isinstance(d.get("stars"), int):
                jami += d["stars"]
        return jami


class LessonResult(models.Model):
    """Bitta tugatilgan dars. Ota-ona hisoboti va reyting shundan chiqadi."""

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="results")
    grade = models.IntegerField(default=0)
    unit = models.IntegerField(default=0)
    lesson = models.IntegerField(default=0)
    lesson_name = models.CharField(max_length=120, default="", blank=True)
    asked = models.IntegerField(default=0)
    correct = models.IntegerField(default=0)
    mistakes = models.IntegerField(default=0)
    stars = models.IntegerField(default=0)
    duration_ms = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "lesson_results"
        indexes = [models.Index(fields=["profile", "-created_at"])]


class Reklama(models.Model):
    """
    Botdan yuboriladigan e'lon.

    Nega alohida jadval, "yuborib qo'ya qolmaymizmi": yuborish soniyalar
    emas, DAQIQALAR oladi. Ming kishilik ro'yxat Telegram cheklovi bilan
    40 soniya, o'n minglik — o'n daqiqa. Shu orada server qayta ishga
    tushishi mumkin (deploy, xotira, oddiy nosozlik). Holat bazada
    turmasa, e'lon yarim yo'lda uzilib qolardi va uni qayerdan davom
    ettirishni hech kim bilmasdi.

    `ReklamaQabul` esa har bir odam uchun alohida qator yozadi. Shu sabab
    davom ettirish XAVFSIZ: allaqachon yuborilgan odamga ikkinchi marta
    bormaydi. Bir odamga ikki marta kelgan reklama — botni bloklashning
    eng tez yo'li.
    """

    HOLATLAR = [
        ("qoralama", "hali yuborilmagan"),
        ("ketyapti", "yuborilmoqda"),
        ("tugadi", "hammaga yetdi"),
        ("toxtatildi", "qo'lda to'xtatilgan"),
    ]

    matn = models.TextField(default="", blank=True)
    #: Pastdagi "botga kirish" tugmasi. Yoqib-o'chirib turish uchun.
    tugma = models.BooleanField(default=True)
    tugma_matni = models.CharField(max_length=64, default="Aql Zone'ni ochish")
    #: Bo'sh bo'lsa bot havolasi qo'yiladi (`reklama.havola`).
    havola = models.CharField(max_length=300, default="", blank=True)

    #: Tugmaning rangi (Bot API 9.4 `style`). Nomlari `core/xabar.py` da.
    #:
    #: Standart — yashil: e'londagi tugma deyarli har doim asosiy
    #: harakat bo'ladi ("ilovani oching"). Qizil esa ataylab qoldirilgan:
    #: e'londa ogohlantirish yoki bekor qilish tugmasi ham bo'lishi
    #: mumkin va o'shanda rang matndan oldin ko'zga tashlanishi kerak.
    RANGLAR = [
        ("success", "yashil — asosiy harakat"),
        ("primary", "ko'k — yordamchi"),
        ("danger", "qizil — ogohlantirish"),
        ("", "rangsiz — mijozning o'z ko'rinishi"),
    ]
    tugma_rangi = models.CharField(max_length=10, choices=RANGLAR, default="success", blank=True)

    holat = models.CharField(max_length=12, choices=HOLATLAR, default="qoralama")
    #: Yuborish boshlanganda hisoblanadi va o'zgarmaydi — foizni shundan
    #: chiqaramiz. Ro'yxat yuborish davomida o'sib borsa, foiz orqaga
    #: qaytib, "95% dan 91% ga tushdi" degan g'alati ko'rinish chiqardi.
    jami = models.IntegerField(default=0)
    yuborildi = models.IntegerField(default=0)
    bloklandi = models.IntegerField(default=0)
    xato = models.IntegerField(default=0)

    #: Kim yuborgani — admin Telegram id'si.
    kim = models.CharField(max_length=40, default="", blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    boshlandi_at = models.DateTimeField(null=True, blank=True)
    tugadi_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "reklama"
        indexes = [models.Index(fields=["-created_at"])]

    @property
    def foiz(self) -> int:
        if not self.jami:
            return 0
        return round((self.yuborildi + self.bloklandi + self.xato) / self.jami * 100)

    @property
    def qisqa(self) -> str:
        matn = " ".join(self.matn.split())
        return matn[:60] + ("…" if len(matn) > 60 else "")

    def __str__(self) -> str:  # pragma: no cover — admin/shell uchun
        return f"{self.pk} · {self.holat} · {self.qisqa}"


class ReklamaQabul(models.Model):
    """
    Bitta e'lon bitta odamga yetdimi.

    Yagona cheklov (`reklama` + `pupil`) — ikki marta yuborishning oldini
    oladigan asosiy himoya. U dastur mantig'ida emas, BAZADA turadi: ikki
    jarayon bir vaqtda yuborsa ham ikkinchisi qatorni yoza olmaydi.
    """

    HOLATLAR = [
        ("yuborildi", "yetdi"),
        ("bloklandi", "bot bloklangan"),
        ("xato", "yuborilmadi"),
    ]

    reklama = models.ForeignKey(Reklama, on_delete=models.CASCADE, related_name="qabullar")
    pupil = models.ForeignKey(Pupil, on_delete=models.CASCADE, related_name="reklamalar")
    holat = models.CharField(max_length=12, choices=HOLATLAR)
    izoh = models.CharField(max_length=200, default="", blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "reklama_qabul"
        constraints = [
            models.UniqueConstraint(
                fields=["reklama", "pupil"], name="reklama_bir_odamga_bir_marta"
            )
        ]
        indexes = [models.Index(fields=["reklama", "holat"])]


class LigaAzo(models.Model):
    """
    Bitta bolaning bitta haftadagi liga o'rni.

    Nega umumiy reyting yetarli emas: 300 kishilik jadvalda 147-o'rinni
    egallagan bola kurashmaydi — oldingi bilan orasi yetib bo'lmas darajada
    uzoq. 20 kishilik guruhda esa u 4-o'rinda turadi va uchinchi o'rin bir
    darsda qo'lga kiradi. Raqam bir xil, hissiyot butunlay boshqa.

    Qator HAFTAGA yoziladi, guruh esa o'sha hafta ichida o'zgarmaydi:
    jadval o'yin davomida ostidan siljib ketmasligi kerak.

    `orin` nolligicha turgan qator — hali yakunlanmagan hafta. Yakunlangach
    o'rin va natija BIR MARTA yoziladi va qayta hisoblanmaydi: aks holda
    o'tgan haftadagi ko'tarilish keyinchalik ma'lumot o'zgarsa bekor
    bo'lib qolardi.
    """

    NATIJALAR = [
        ("", "hali yakunlanmagan"),
        ("kotarildi", "yuqori darajaga"),
        ("qoldi", "shu darajada"),
        ("tushdi", "quyi darajaga"),
    ]

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="liga")
    #: Haftaning dushanbasi — mahalliy vaqt bo'yicha.
    hafta = models.DateField()
    daraja = models.IntegerField(default=0)
    #: Daraja ichidagi guruh raqami. Har guruhda ko'pi bilan 20 kishi.
    guruh = models.IntegerField(default=0)
    #: Ikkalasi ham FAQAT yakunlashda to'ldiriladi — tarix uchun.
    yulduz = models.IntegerField(default=0)
    orin = models.IntegerField(default=0)
    natija = models.CharField(max_length=12, choices=NATIJALAR, default="", blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "liga_azo"
        constraints = [
            models.UniqueConstraint(
                fields=["profile", "hafta"], name="liga_bir_haftada_bir_marta"
            )
        ]
        indexes = [models.Index(fields=["hafta", "daraja", "guruh"])]

    def __str__(self) -> str:  # pragma: no cover — faqat admin/shell uchun
        return f"{self.profile_id} · {self.hafta} · {self.daraja}-daraja"
        ordering = ["-created_at"]


class Duel(models.Model):
    """
    Ikki do'stning bellashuvi — bir xil savollar bilan.

    ─────────────────── NEGA BITTA JADVAL ───────────────────

    Duelning ikki tomoni bor va ular hech qachon uchtaga aylanmaydi.
    Alohida `DuelAzo` jadvali moslashuvchanroq bo'lardi, lekin har bir
    o'qishda `JOIN` va "ikkinchi tomon topilmadi" degan holatni qo'lda
    tekshirishni talab qilardi. Bitta qatorda esa duelning BUTUN holati
    ko'rinib turadi va noto'g'ri holat yasab bo'lmaydi.

    ─────────────────── SAVOLLAR SAQLANMAYDI ───────────────────

    Server savol yubormaydi va saqlamaydi — faqat `urug` (bitta son).
    Ikkala qurilma o'sha urug'dan AYNAN bir xil savollarni yasaydi
    (`frontend/src/lib/oyin/urug.ts`). Shu sabab duel jadvali kichik
    bo'lib qoladi va savollar o'zgarganda eski duellar buzilmaydi.

    ─────────────────── SANOQ NEGA KERAK ───────────────────

    `*_sanoq` — har soniyadagi ball (60 ta kichik son). Undan raqibning
    chizig'i chiziladi: qabul qilgan odam chaqirganning ballini JONLI
    o'sib borayotgandek ko'radi. Yakuniy son esa ATAYLAB ko'rsatilmaydi
    — u ko'rinsa duel "nishonga urish" ga aylanadi va o'yinchi kerakli
    ballni o'tishi bilan to'xtaydi.
    """

    #: Havoladagi kod. Taxmin qilib bo'lmaydigan bo'lishi kerak: kodni
    #: bilgan odam duelni ochadi va u ochiq havola sifatida ulashiladi.
    kod = models.CharField(max_length=16, unique=True)

    urug = models.BigIntegerField()
    oyin = models.CharField(max_length=16)
    #: ESKI umumiy daraja — endi har tomonniki alohida (pastda). Maydon
    #: o'chirilmadi: u chaqirganning darajasi bilan bir xil yoziladi va
    #: eski ilova versiyalari hali shuni o'qiydi.
    daraja = models.SmallIntegerField(default=2)

    #: HAR KIMGA O'Z DARAJASI (2026-09-17).
    #:
    #: Ilgari ikkalasiga bir xil `daraja=2` berilardi va 6 yoshli bola
    #: dadasi bilan bir xil savolni yechib, doim yutqazardi — ikkinchi
    #: marta esa o'ynamasdi. Endi har o'yinchi savolni O'Z darajasida
    #: yechadi (Prodigy usuli). Urug' bitta, daraja har xil: har kim o'z
    #: darajasidagi savollar ketma-ketligini oladi.
    chaqirgan_daraja = models.SmallIntegerField(default=2)
    qabul_daraja = models.SmallIntegerField(default=2)

    #: Kimga chaqiruv yuborilgan (ro'yxatdan yoki jonli taklif bilan).
    #:
    #: Havola bilan yasalgan chaqiruvda bo'sh — uni istalgan odam ochadi.
    #: To'ldirilgan bo'lsa "Sizning navbatingiz" ro'yxatida AYNAN shu
    #: odamga ko'rinadi: busiz u chaqiruvni faqat bot xabaridan topardi.
    kimga = models.ForeignKey(
        "Profile", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="kelgan_duellar",
    )

    #: Duel shartlari — chaqirgan odam tanlaydi, ikkalasiga bir xil.
    #:
    #: Ikkalasi ham CHEGARA: o'yin qaysi biri oldin tugasa, o'shanda
    #: tugaydi. Faqat vaqt bo'lsa, tez o'ynagan odam ko'proq savol
    #: olardi; faqat savol bo'lsa, o'ylab o'tirgan odam duelni
    #: cho'zib yuborardi.
    savollar_soni = models.SmallIntegerField(default=20)
    vaqt = models.SmallIntegerField(default=60)

    chaqirgan = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="yuborgan_duellar"
    )
    chaqirgan_ball = models.IntegerField(default=0)
    chaqirgan_xato = models.IntegerField(default=0)
    chaqirgan_sanoq = models.JSONField(default=list)
    #: Chaqirgan o'yinni TUGATDIMI. Tugatmagan duel havolasi ishlamaydi:
    #: yarim yo'lda tashlab ketilgan o'yin raqibga chaqiruv bo'lolmaydi.
    chaqirgan_tugatdi = models.BooleanField(default=False)

    qabul = models.ForeignKey(
        Profile, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="qabul_duellar",
    )
    qabul_ball = models.IntegerField(default=0)
    qabul_xato = models.IntegerField(default=0)
    qabul_sanoq = models.JSONField(default=list)
    qabul_tugatdi = models.BooleanField(default=False)

    #: Kim yutdi: "chaqirgan" | "qabul" | "durang" | "" (hali tugamagan).
    golib = models.CharField(max_length=10, default="", blank=True)

    # ---------------------------------------------------- jonli rejim
    #
    # Duel IKKI XIL bo'ladi va farqi bitta maydonda:
    #
    #   asinxron  chaqirgan avval o'ynaydi, do'sti keyin — istalgan payt
    #   jonli     ikkalasi bir vaqtda o'ynaydi, ballar bir-biriga ko'rinadi
    #
    # Rejim ATAYLAB alohida ustunda emas: u `boshlanadi` bo'sh-to'laligidan
    # kelib chiqadi. Ikkita haqiqat manbai bo'lsa, ular albatta bir kun
    # kelib bir-biriga zid bo'lib qoladi — masalan "jonli" deb belgilangan,
    # lekin boshlanish vaqti yo'q duel.

    #: Ikkalasi TAYYOR bo'lgan payt + qisqa sanoq. Bo'sh — asinxron duel.
    #:
    #: Vaqt SERVERDA belgilanadi va mijozga "necha soniya qoldi" bo'lib
    #: uzatiladi. Mijozning o'z soatiga tayanib bo'lmaydi: telefon soati
    #: bir necha soniya oldinda bo'lsa, o'sha o'yinchi duelni erta
    #: boshlab, tekin ustunlik olardi.
    boshlanadi = models.DateTimeField(null=True, blank=True)

    #: Oxirgi belgi — "men shu yerdaman" degani (har 2 soniyada).
    #:
    #: Ikki ish qiladi: chaqirgan odam hali KUTYAPTIMI (do'sti havolani
    #: ochganda jonli boshlash mumkinmi) va o'yin o'rtasida raqib
    #: uzilib qolmadimi.
    chaqirgan_belgi = models.DateTimeField(null=True, blank=True)
    qabul_belgi = models.DateTimeField(null=True, blank=True)

    #: "Men tayyorman" belgisi. IKKALASI ham bosgach o'yin boshlanadi.
    #:
    #: Avtomatik boshlash ham mumkin edi (do'sti havolani ochishi bilan),
    #: lekin unda odam telefonini cho'ntagidan chiqarayotganda o'yin
    #: allaqachon ketayotgan bo'lardi. Tayyorlik tugmasi bir vaqtning
    #: o'zida ikkinchi ishni ham qiladi: u yerda o'yin nomi va qoidasi
    #: turadi, ya'ni ikkalasi ham nima o'ynashini BILIB boshlaydi.
    chaqirgan_tayyor = models.BooleanField(default=False)
    qabul_tayyor = models.BooleanField(default=False)

    # ---------------------------------------------------- qayta bellashuv
    #
    # "Yana o'ynaymizmi?" — duel TUGAGANDAN keyin, ikkalasi hali ekran
    # oldida turganda so'raladi. Ikkalasi ham rozi bo'lsa YANGI duel
    # yasaladi (o'sha shartlar, yangi urug') va shu yerda `keyingi`
    # bo'lib yoziladi.
    #
    # Nega yangi qator: eski duelni qayta ochish natijani ham,
    # sanoqlarni ham o'chirib yuborardi — ya'ni tarix yo'qolardi.
    # Zanjir esa `keyingi` orqali butun bo'lib qoladi.

    chaqirgan_yana = models.BooleanField(default=False)
    qabul_yana = models.BooleanField(default=False)

    #: Ikkalasi rozi bo'lgach yasalgan yangi duel.
    keyingi = models.OneToOneField(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="avvalgi",
    )

    created_at = models.DateTimeField(default=timezone.now)
    tugadi_at = models.DateTimeField(null=True, blank=True)

    #: Chaqiruv shuncha soatdan keyin kuchini yo'qotadi.
    MUDDAT_SOAT = 24

    #: Belgi shuncha soniyadan eski bo'lsa, o'yinchi ketgan hisoblanadi.
    #:
    #: Uch marta o'tkazib yuborilgan belgiga to'g'ri keladi (har 2
    #: soniyada bittadan). Qisqaroq qilinsa, sekin internetda o'ynayotgan
    #: bola "chiqib ketdi" bo'lib qolardi.
    BELGI_SONIYA = 8

    #: Ikkalasi tayyor bo'lgach o'yin shuncha soniyadan keyin boshlanadi.
    #:
    #: Bu vaqt ikki narsaga kerak: ikkala ekranga "3, 2, 1" sanog'ini
    #: chizishga va sekinroq telefonning savollarni yasab ulgurishiga.
    SANOQ_SONIYA = 5

    class Meta:
        db_table = "duel"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["chaqirgan", "-created_at"]),
        ]

    def __str__(self) -> str:  # pragma: no cover — faqat admin/shell uchun
        return f"duel {self.kod} · {self.oyin}"

    @property
    def muddati_otdimi(self) -> bool:
        yosh = timezone.now() - self.created_at
        return yosh.total_seconds() > self.MUDDAT_SOAT * 3600

    @property
    def jonlimi(self) -> bool:
        """Ikkalasi bir vaqtda o'ynayotgan duelmi."""
        return self.boshlanadi is not None

    def belgisi_yangimi(self, chaqirgan: bool) -> bool:
        """O'yinchi hozir shu yerdami (oxirgi belgisi yaqindami)."""
        belgi = self.chaqirgan_belgi if chaqirgan else self.qabul_belgi
        if belgi is None:
            return False
        return (timezone.now() - belgi).total_seconds() <= self.BELGI_SONIYA

    @property
    def jonli_kutyaptimi(self) -> bool:
        """
        Chaqirgan odam AYNI PAYTDA do'stini kutyaptimi.

        Shu savolga javob "havolani ochgan odam jonli o'ynay oladimi"
        degan qarorni beradi. Ikki shart: chaqirgan hali o'ynamagan va
        uning belgisi yangi (ya'ni u shu daqiqada ekran oldida).
        """
        return not self.chaqirgan_tugatdi and self.belgisi_yangimi(chaqirgan=True)

    @property
    def ikkalasi_tayyormi(self) -> bool:
        return self.chaqirgan_tayyor and self.qabul_tayyor

    @property
    def holat(self) -> str:
        """`boshlanmagan` | `jonli_kutyapti` | `jonli` | `kutyapti` | `tugadi` | `muddati_otdi`."""
        if self.qabul_tugatdi and self.chaqirgan_tugatdi:
            return "tugadi"
        if self.jonlimi:
            return "jonli"
        if not self.chaqirgan_tugatdi:
            return "jonli_kutyapti" if self.jonli_kutyaptimi else "boshlanmagan"
        if self.qabul_tugatdi:
            return "tugadi"
        return "muddati_otdi" if self.muddati_otdimi else "kutyapti"

    def golibni_aniqla(self) -> str:
        """
        G'olibni hisoblaydi.

        Ball teng bo'lsa KAM XATO qilgani yutadi — aks holda "durang"
        juda tez-tez chiqardi: ball 60 soniyada yig'iladi va ikki
        o'yinchi bir xil songa kelib qolishi oson.
        """
        if self.chaqirgan_ball != self.qabul_ball:  # noqa: RET505
            return "chaqirgan" if self.chaqirgan_ball > self.qabul_ball else "qabul"
        if self.chaqirgan_xato != self.qabul_xato:
            return "chaqirgan" if self.chaqirgan_xato < self.qabul_xato else "qabul"
        return "durang"


class DuelTaklif(models.Model):
    """
    JONLI TAKLIF — hozir ilovada turgan do'stni o'yinga chaqirish.

    Bot xabari emas, EKRANDAGI oyna: do'st bosh sahifada yoki darsni
    tugatib turgan bo'lsa, unga "Aziz sizni chaqiryapti · 12 s" chiqadi.

    ─────────────────── UCH SHART (2026-09-17) ───────────────────

      1. Ekranda chiqadi, savol yechayotganda emas, `MUDDAT_SONIYA`
         dan keyin o'zi yopiladi (mijoz qaysi ekranda ko'rsatishni
         o'zi biladi — `DuelTaklifOyna.tsx`).
      2. Faqat TANISHdan: oldin bir-biri bilan duel o'ynaganlar
         (`duel.tanishmi`). Notanish katta odam bolani chaqira olmaydi.
      3. Chegara: bir juftlikka soatiga bitta taklif, kuniga ikki marta
         rad etgan odamga o'sha kuni boshqa taklif kelmaydi, va
         `Profile.taklif_yopiq`.

    Nega alohida jadval, `Duel` ichida emas: rad etish va muddati
    o'tish CHEGARA uchun sanaladi, duel esa rad etilgandan keyin ham
    oddiy chaqiruv bo'lib yashashda davom etadi.
    """

    KUTYAPTI, QABUL, RAD = "kutyapti", "qabul", "rad"
    HOLATLAR = [(KUTYAPTI, "kutyapti"), (QABUL, "qabul"), (RAD, "rad")]

    #: Taklif shuncha soniyadan keyin o'z-o'zidan yopiladi.
    MUDDAT_SONIYA = 15

    duel = models.ForeignKey(Duel, on_delete=models.CASCADE, related_name="takliflar")
    kimdan = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="yuborgan_takliflar")
    kimga = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="kelgan_takliflar")
    holat = models.CharField(max_length=10, choices=HOLATLAR, default=KUTYAPTI)
    created_at = models.DateTimeField(default=timezone.now)
    javob_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "duel_taklif"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["kimga", "-created_at"]),
            models.Index(fields=["kimdan", "kimga", "-created_at"]),
        ]

    @property
    def muddati_otdimi(self) -> bool:
        return (timezone.now() - self.created_at).total_seconds() > self.MUDDAT_SONIYA

    @property
    def qolgan_soniya(self) -> int:
        otdi = (timezone.now() - self.created_at).total_seconds()
        return max(0, int(self.MUDDAT_SONIYA - otdi))


# ============================================================ jamoaviy o'yinlar


class Xona(models.Model):
    """
    JAMOAVIY O'YIN XONASI — Son kartalari, Hisob Royale, Son kodlari.

    ─────────────────── NEGA XONA KODI ───────────────────

    Bir vaqtda 4–30 kishini tasodifan yig'ib bo'lmaydi: auditoriya
    kichik. Kahoot usuli ishlaydi — oila, sinf yoki do'stlar bitta joyda
    turib "4827" kodi bilan kiradi. Bo'sh joylarga robot qo'shiladi
    (ochiq belgilangan).

    ─────────────────── NEGA HOLAT JSON'DA ───────────────────

    Uchta o'yinning holati butunlay boshqacha: kartalar qo'li, yuraklar,
    16 kartalik taxta. Har biriga alohida jadval yasash uchta migratsiya
    va o'nlab ustun bo'lardi, holat esa baribir faqat BIR xonaga tegishli
    va doim butunligicha o'qiladi. Qoidalar serverda (`core/oyin_*.py`),
    mijoz faqat o'ziga ruxsat berilgan ko'rinishni oladi — masalan Son
    kodlarida kartalar rangini faqat sardor ko'radi.
    """

    KARTALAR, ROYALE, KODLAR = "kartalar", "royale", "kodlar"
    OYINLAR = [(KARTALAR, "Son kartalari"), (ROYALE, "Hisob Royale"), (KODLAR, "Son kodlari")]

    KUTISH, OYIN, TUGADI = "kutish", "oyin", "tugadi"
    HOLATLAR = [(KUTISH, "kutish"), (OYIN, "oyin"), (TUGADI, "tugadi")]

    kod = models.CharField(max_length=8, db_index=True)
    oyin = models.CharField(max_length=12, choices=OYINLAR)
    holat = models.CharField(max_length=8, choices=HOLATLAR, default=KUTISH)
    egasi = models.ForeignKey(Profile, on_delete=models.SET_NULL, null=True, related_name="xonalar")
    #: O'yin holati — qoidalar moduli yozadi va o'qiydi.
    davlat = models.JSONField(default=dict, blank=True)
    #: Tayyor gaplar ("Tekshirib ko'ring") — oxirgi bir nechtasi.
    gaplar = models.JSONField(default=list, blank=True)
    #: Nechanchi o'yin — "yana o'ynaymiz" har safar oshiradi.
    raund = models.SmallIntegerField(default=1)
    created_at = models.DateTimeField(default=timezone.now)
    boshlandi_at = models.DateTimeField(null=True, blank=True)
    tugadi_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "xona"
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["kod", "-created_at"])]

    def __str__(self) -> str:  # pragma: no cover
        return f"xona {self.kod} · {self.oyin}"


class XonaAzo(models.Model):
    """Xonadagi o'yinchi — odam yoki robot."""

    xona = models.ForeignKey(Xona, on_delete=models.CASCADE, related_name="azolar")
    #: Robotda bo'sh.
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, blank=True,
                                related_name="xona_azoliklari")
    robot = models.BooleanField(default=False)
    ism = models.CharField(max_length=40, default="")
    avatar = models.CharField(max_length=40, default="", blank=True)
    #: Har kimga o'z darajasi — savol va kartalar shu darajada yasaladi.
    daraja = models.SmallIntegerField(default=2)
    tayyor = models.BooleanField(default=False)
    #: "Men shu yerdaman" — har so'rovda yangilanadi.
    belgi = models.DateTimeField(default=timezone.now)
    #: Kirish tartibi — jamoaga bo'lish va sardor navbati shundan.
    joy = models.SmallIntegerField(default=0)
    chiqdi = models.BooleanField(default=False)

    class Meta:
        db_table = "xona_azo"
        ordering = ["joy", "pk"]


class KartaKolleksiya(models.Model):
    """
    Son kartalari kolleksiyasi — g'alabadan keladigan maxsus kartalar.

    Kolleksiya o'yinni oylab ushlab turadigan narsa: "keyingi g'alabada
    qaysi karta chiqadi?" Har o'yin boshida kolleksiyadan bitta maxsus
    karta qo'lga tushadi.
    """

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="kartalar")
    kalit = models.CharField(max_length=16)
    soni = models.IntegerField(default=0)

    class Meta:
        db_table = "karta_kolleksiya"
        constraints = [
            models.UniqueConstraint(fields=["profile", "kalit"], name="karta_kolleksiya_yagona"),
        ]


# =================================================================== masalalar


class Masala(models.Model):
    """
    FOYDALANUVCHI YOZGAN MASALA.

    ─────────────────────── NEGA KERAK ───────────────────────

    Darslardagi savollar GENERATOR bilan yasaladi: sonlar o'zgaradi,
    lekin savolning TURI o'zgarmaydi. Mashq uchun bu ideal va aynan
    shuning uchun chegarali — generator hiylali, o'ylantiradigan,
    "buni qanday qilib yechish mumkin?" dedirtiradigan masalani hech
    qachon yozib bermaydi. Uni faqat odam yozadi.

    Shu sabab jadval kurs dasturidan BUTUNLAY alohida turadi: unda
    bob ham, tartib ham, qulf ham yo'q.

    ─────────────────── TASDIQDAN OLDIN KO'RINMAYDI ───────────────────

    Yangi masala `KUTMOQDA` holatida tug'iladi va faqat admin
    tasdiqlagandan keyin ro'yxatga chiqadi. Bu qat'iy shart, ikki
    sababdan:

      1. Bu bolalar ilovasi, matnni esa istalgan odam yozadi.
      2. XATO masala yo'q masaladan yomonroq. Yechimi noto'g'ri
         masalani yechgan bola o'zini aybdor his qiladi — u javobni
         topa olmaydi va sababini bilmaydi.

    Rad etilganda SABABI yoziladi va muallifga ko'rsatiladi. Sababsiz
    rad etish odamni ikkinchi marta yozishdan butunlay qaytaradi.

    ─────────────────── YECHIM QACHON OCHILADI ───────────────────

    Tasdiqlangandan keyin ham yechim hammaga ko'rinmaydi: u faqat
    URINIB KO'RGAN odamga ochiladi. Qoida darsdagi bilan bir xil
    (`components/Yechim.tsx`) — javobni oldindan o'qish o'rganish
    emas, ko'chirish.

    Buni SERVER qo'riqlaydi: `yechim` maydoni urinmagan odamga umuman
    yuborilmaydi. Faqat mijozda yashirilganda uni har kim tarmoq
    oynasidan o'qib olardi.
    """

    KUTMOQDA = "kutmoqda"
    TASDIQ = "tasdiq"
    RAD = "rad"
    HOLATLAR = [
        (KUTMOQDA, "Kutmoqda"),
        (TASDIQ, "Tasdiqlangan"),
        (RAD, "Rad etilgan"),
    ]

    #: Matn uzunligi chegarasi. Masala — bir-ikki abzats; undan uzuni
    #: amalda ko'chirilgan matn yoki reklama bo'lib chiqadi.
    MAX_MATN = 2000
    MAX_YECHIM = 4000
    MAX_JAVOB = 100

    #: Bir odam kuniga nechta masala yubora oladi.
    #:
    #: Chegara admin uchun: navbatga bir kechada yuzta masala tushsa,
    #: u umuman ko'rilmay qoladi va butun bo'lim to'xtaydi.
    KUNLIK_CHEGARA = 5

    muallif = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="masalalar"
    )

    #: Kimga mo'ljallangan. Kod kurslarnikiga MOS (`Course.grade`),
    #: ya'ni 107 = 7-sinf geometriya. Alohida ro'yxat yasalmadi: ikkita
    #: ro'yxat bir kun kelib albatta bir-biridan qolib ketadi.
    #:
    #: Ikkita QO'SHIMCHA kod bor va ular hech qaysi kursga tegishli
    #: emas — ular kurs dasturidan TASHQARIDAGI masalalar uchun:
    #:
    #:   200  Kattalar uchun    — maktab dasturidan tashqari, yosh
    #:                            chegarasi yo'q
    #:   201  Olimpiada         — sinfi bor, lekin darslikda yo'q:
    #:                            hiylali, o'ylantiradigan masalalar
    #:
    #: Nega kerak. Bo'limning eng qimmatli masalalari ko'pincha hech
    #: qaysi sinfga to'g'ri kelmaydi: ularni yozgan odam "qaysi sinf?"
    #: degan savolda to'xtab qolardi va tasodifiy sinfni tanlardi —
    #: keyin o'sha masala noto'g'ri filtrda ko'rinardi.
    KATTALAR = 200
    OLIMPIADA = 201
    KURSDAN_TASHQARI = (KATTALAR, OLIMPIADA)

    #: Ekranda ko'rinadigan raqam — 1 dan boshlab, ketma-ket.
    #:
    #: ─────────────── NEGA `pk` EMAS ───────────────
    #:
    #: Kartada va masala ekranida "#7" turadi va odam uni do'stiga
    #: aytadi. `pk` esa bunga yaramaydi: u BAZANING ichki raqami va
    #: unda teshiklar bo'ladi. Bir masala o'chirilgani uchun ro'yxat
    #: 2 dan boshlanib qolgan edi — o'n beshta masala "2 dan 16
    #: gacha" bo'lib ko'rinardi.
    #:
    #: ─────────────── NEGA `pk` QOLDIRILDI ───────────────
    #:
    #: Havolalar va bog'lanishlar `pk` ga tayanadi: kanaldagi har bir
    #: postning tugmasi `?startapp=masala_<pk>` ga olib boradi,
    #: urinishlar va ovozlar ham `pk` ga bog'langan. Raqamlarni
    #: almashtirish kanalda chiqqan hamma havolani buzardi.
    #:
    #: Ya'ni ikkita raqam ikki xil ish qiladi: `pk` — mashina uchun,
    #: `raqam` — odam uchun.
    #:
    #: `null` ATAYLAB: migratsiya paytida eski satrlar to'ldirilgunga
    #: qadar bo'sh turadi. Yangi masalada u har doim beriladi
    #: (`masala.yubor`).
    raqam = models.IntegerField(unique=True, null=True, blank=True)

    sinf = models.SmallIntegerField(default=0)

    matn = models.TextField(max_length=MAX_MATN)

    #: Javob MATN bo'lib solishtiriladi, son bo'lib emas.
    #:
    #: Matematik javob har doim ham son emas: "x = 3 yoki x = −3",
    #: "12 sm²", "8/15". Solishtirishdan oldin ikkala tomon ham
    #: normallashtiriladi (`javob_normal`).
    javob = models.CharField(max_length=MAX_JAVOB)

    #: Test variantlari — bo'sh bo'lsa masala JAVOB YOZILADIGAN.
    #:
    #: Ikki xil masala bir modelda turadi va bu ataylab: farqi
    #: faqat JAVOB QANDAY OLINISHIDA, qolgan hammasi (matn, chizma,
    #: yechim, statistika, kanal posti, tanga) bir xil. Alohida model
    #: qilinsa, o'sha hammasi ikki nusxada yozilardi.
    #:
    #: To'g'ri javob shu yerda EMAS, `javob` maydonida — variantlardan
    #: biriga aynan teng bo'ladi. Shunda tekshiruv ikkala turda ham
    #: bitta yo'ldan ketadi (`javob_ber`) va "to'g'ri variant raqami"
    #: degan ikkinchi haqiqat manbasi paydo bo'lmaydi.
    MIN_VARIANT = 2
    MAX_VARIANT = 4
    variantlar = models.JSONField(default=list, blank=True)

    yechim = models.TextField(max_length=MAX_YECHIM)

    #: Masalaga biriktirilgan rasm — chizma, jadval yoki darslik sahifasi.
    #:
    #: IXTIYORIY va bu ataylab: masalalarning ko'pi matn bilan
    #: tushuniladi. Lekin geometriya masalasini chizmasiz yozib
    #: bo'lmaydi — "ABC uchburchakda..." deb boshlangan matn chizmasiz
    #: yarim masala bo'lib qoladi.
    #:
    #: Fayl SAQLASHDAN OLDIN qayta kodlanadi (`core/rasm.py`): shu
    #: bilan uning haqiqatan rasm ekani tekshiriladi, EXIF (jumladan
    #: GPS koordinatasi) tushib qoladi va hajmi cheklanadi.
    #:
    #: Rasm ham matn kabi TASDIQDAN o'tadi — u tasdiqlanmagan masala
    #: bilan birga turadi va hech kimga ko'rinmaydi.
    rasm = models.ImageField(upload_to="masala/%Y/%m/", blank=True, null=True)

    holat = models.CharField(max_length=10, choices=HOLATLAR, default=KUTMOQDA)

    #: Rad etilgan bo'lsa — sababi. Muallif shuni o'qib tuzatadi.
    rad_sababi = models.CharField(max_length=300, default="", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    #: Admin ko'rgan payt. Navbatda qancha turgani shundan bilinadi.
    korilgan_at = models.DateTimeField(null=True, blank=True)

    #: Kanalga qachon joylangani (`management/commands/masala_post.py`).
    #:
    #: Bir masala kanalga IKKI MARTA tushmasligi uchun kerak: kunlik
    #: post buyrug'i har kuni ishlaydi va u "hali joylanmagani"ni
    #: shu maydon bo'yicha tanlaydi. Ro'yxatga ta'siri yo'q — masala
    #: kanalda bo'lsa ham ilovada avvalgidek turaveradi.
    kanal_at = models.DateTimeField(null=True, blank=True)

    #: Kanaldagi post raqami — `t.me/<kanal>/<id>` havolasi shundan
    #: quriladi. Admin yuborgandan keyin "kanalda ko'rish" tugmasini
    #: bosib, postni o'z ko'zi bilan tekshiradi.
    kanal_post_id = models.IntegerField(null=True, blank=True)

    #: Post kanalda hali ham turibdimi — kunlik tekshiruv natijasi
    #: (`management/commands/kanal_tekshir.py`).
    #:
    #: Kanaldan post O'CHIB KETADI: admin uni qo'lda o'chiradi, kanal
    #: ko'chiriladi yoki xabar shunchaki yo'qoladi. Shundan keyin
    #: masalaning `kanal_at` i to'la turaveradi va u kunlik postga
    #: hech qachon qaytmaydi — ya'ni masala jimgina yo'qoladi.
    #: Bayroq shu holatni ko'rinadigan qiladi: admin ekranda
    #: "kanalda topilmadi" ni ko'radi va bir bosishda qayta yuboradi.
    kanal_yoq = models.BooleanField(default=False)

    #: Oxirgi tekshiruv payti. Ekranda "qachon tekshirilgan" bo'lib
    #: chiqadi: bayroqning o'zi qachonlikdir eskirgan bo'lishi mumkin.
    kanal_tekshir_at = models.DateTimeField(null=True, blank=True)

    #: Kanal postida OXIRGI MARTA yozilgan sanoqlar ("42:18:7").
    #:
    #: Post ostidagi "42 ko'rdi · 18 urindi · 7 yechdi" qatori jonli
    #: bo'lishi kerak, lekin Telegram bir xil matn bilan tahrirlashni
    #: rad etadi ("message is not modified") va har safar so'rov
    #: yuborish behuda bo'lardi. Shu satr esa "o'zgardimi?" degan
    #: savolga BAZADAN javob beradi — Telegramga umuman murojaat
    #: qilmasdan.
    #:
    #: Uchta son bitta satrda: alohida uchta ustun qo'shish ham
    #: mumkin edi, lekin ular hech qachon alohida o'qilmaydi —
    #: faqat "o'zgardimi" degan solishtirish uchun kerak.
    kanal_sanoq = models.CharField(max_length=40, default="", blank=True)

    #: Sanoqlar ATAYLAB shu yerda turadi, `urinishlar` dan sanalmaydi.
    #:
    #: Ro'yxat ekrani har masalada "nechta odam yechdi" ni ko'rsatadi.
    #: Har safar sanasak, ellikta masalali sahifa ellikta guruh
    #: so'rovini keltirib chiqarardi. Bu yerda esa u bitta son.
    urinish_soni = models.IntegerField(default=0)
    #: BIRINCHI urinishda topganlar. Faqat QIYINLIK o'lchovi uchun.
    yechgan_soni = models.IntegerField(default=0)
    #: Oxir-oqibat topganlar — nechanchi urinishda bo'lishidan
    #: QAT'I NAZAR.
    #:
    #: `yechgan_soni` dan farqi shundaki, u masalaning qiyinligini
    #: o'lchaydi, bu esa nechta odam MAQSADGA YETGANINI aytadi.
    #: Ikkalasi ikki xil savolga javob beradi va bittasi bilan
    #: ikkalasini ham bera olmaydi: birinchi urinishda topmagan,
    #: lekin keyin topgan odamni "yecholmagan" deb sanash uning
    #: mehnatini inkor qilish bo'lardi.
    #:
    #: Ro'yxatda va kanal postida SHU son ko'rinadi, qiyinlik foizi
    #: esa `yechgan_soni` ga quriladi.
    yechdi_soni = models.IntegerField(default=0)

    #: Masalani nechta ODAM ochgan (`MasalaKorish` ga qarang).
    #:
    #: Urinishdan butunlay boshqa son va ikkalasi ham kerak: masala
    #: ko'p ochilib, kam yechilsa — u qiziq, lekin qiyin; kam ochilib,
    #: ko'p yechilsa — u ro'yxatda ko'zga tashlanmayapti. Bu ikki
    #: holat ikki xil ish talab qiladi va faqat urinish soniga
    #: qarab ularni ajratib bo'lmaydi.
    korish_soni = models.IntegerField(default=0)
    #: Ovozlar ham shu sababdan shu yerda (`MasalaOvoz` ga qarang).
    like_soni = models.IntegerField(default=0)
    dislike_soni = models.IntegerField(default=0)

    class Meta:
        db_table = "masala"
        ordering = ["-created_at"]
        indexes = [
            # Ro'yxat har doim shu ikkisi bo'yicha so'raladi.
            models.Index(fields=["holat", "-created_at"]),
            models.Index(fields=["holat", "sinf"]),
            # Muallif sahifasi: "shu odamning masalalari".
            models.Index(fields=["muallif", "holat"]),
        ]

    def __str__(self) -> str:
        return f"#{self.pk} {self.matn[:40]}"

    @property
    def qiyinlik(self) -> int:
        """
        Birinchi urinishda to'g'ri yechganlar foizi (0–100).

        Urinish bo'lmasa 100 qaytadi — ya'ni "hali hech kim urinmagan"
        masala "eng qiyin" ro'yxatining boshiga chiqib olmaydi.

        "Eng qiyin masala" jadvali shu songa quriladi va u "eng ko'p
        yoqqan" dan halolroq: yoqtirish masalaning qiyinligi haqida
        hech narsa demaydi.
        """
        if not self.urinish_soni:
            return 100
        return round(self.yechgan_soni * 100 / self.urinish_soni)

    @property
    def ovoz(self) -> int:
        """Yakuniy ovoz: like minus dislike. Saralashda ishlatiladi."""
        return self.like_soni - self.dislike_soni


def javob_normal(v: str) -> str:
    """
    Javobni solishtirishga tayyorlaydi.

    Bola javobni xohlagan ko'rinishda yozadi: "12 sm", "12sm", "12 SM".
    Uchalasi bir xil javob va uchalasi qabul qilinishi kerak — aks
    holda to'g'ri yechgan bola "xato" degan javob oladi. Bu ilovadagi
    eng jahl chiqaradigan holat bo'lardi: u to'g'ri bilardi, ilova
    esa yo'q dedi.

    Vergul NUQTAGA aylanadi: kasr ajratgichi klaviaturaga qarab ikki
    xil chiqadi va "3,5" bilan "3.5" bir xil son. Minus belgisining
    uch ko'rinishi ham bittaga keltiriladi (−, –, -).
    """
    v = unicodedata.normalize("NFKC", v or "").strip().lower()
    v = v.replace(",", ".").replace("−", "-").replace("–", "-")
    return re.sub(r"\s+", "", v)


#: Sonli javobning ORTIDAN keladigan birlik.
#:
#: "15 sm²", "15sm", "15%" — uchalasining ham mag'zi 15. Bola
#: birlikni yozadimi yoki yo'qmi, u BILADIGAN narsani o'zgartirmaydi.
#:
#: Faqat SON bilan boshlanadigan javobda ishlaydi: "ha", "kvadrat"
#: kabi so'z-javoblarda harflarni kesish javobning o'zini yeb
#: qo'yardi.
#:
#: Birlik HARF yoki belgi bilan BOSHLANISHI shart, davomida esa
#: raqam, nuqta va qiyshiq chiziq ham bo'lishi mumkin — "sm2",
#: "kv.sm", "km/soat". Raqamdan boshlanishga ruxsat berilsa, "152"
#: ning oxiridagi "2" birlik deb kesilardi; nuqta birinchi bo'la
#: olmagani uchun esa "15.5" kasr son bo'lib qolaveradi.
#:
#: Kvadrat belgisi bu yerga yetib kelganda allaqachon oddiy "2" ga
#: aylangan bo'ladi — `javob_normal` dagi NFKC shunday qiladi.
_BIRLIK = re.compile(r"^(-?\d+(?:\.\d+)?)(?:[a-z°%][a-z0-9°%./]*)?$")


def javob_ozagi(v: str) -> str:
    """
    Normallashtirilgan javobdan birlikni olib tashlaydi.

    Birlik topilmasa — javob o'zgarmaydi.
    """
    m = _BIRLIK.match(v)
    return m.group(1) if m else v


def javob_teng(kiritilgan: str, togri: str) -> bool:
    """
    Ikki javob bir xilmi.

    Avval to'liq solishtiriladi, keyin BIRLIKSIZ. Ya'ni javob
    "15 sm²" bo'lsa, bola "15" deb yozsa ham to'g'ri hisoblanadi:
    u masalani yechgan, birlikni yozmagani esa boshqa masala.

    Teskarisi ham ishlaydi — javob "15" bo'lib, bola "15 sm²" desa
    ham qabul qilinadi.

    ─────────────── NEGA IKKI BOSQICH ───────────────

    Birdaniga o'zakni solishtirish ham mumkin edi, lekin o'shanda
    so'z-javoblar ("ha", "yo'q") bilan sonli javoblar bir xil
    yo'ldan o'tardi va birinchi bosqichning ma'nosi yo'qolardi.
    Bu ko'rinishda esa oddiy holat oddiy yo'ldan ketadi.
    """
    a, b = javob_normal(kiritilgan), javob_normal(togri)
    return a == b or javob_ozagi(a) == javob_ozagi(b)


class MasalaUrinish(models.Model):
    """
    Kim qaysi masalani yechdi.

    BIR ODAM — BIR QATOR. Takroriy urinish yangi qator yasamaydi va
    sanoqni oshirmaydi: aks holda bitta odam bir masalani yigirma
    marta ochib, "eng ko'p yechilgan" jadvalini o'ziga yozib olardi.

    Qator BIRINCHI urinishning natijasini saqlaydi va keyin
    o'zgarmaydi. Sabab: statistika "birinchi urinishda nechta odam
    yecha oldi" degan savolga javob berishi kerak. Ikkinchi urinishda
    hamma to'g'ri topadi — yechim allaqachon ochilgan bo'ladi.
    """

    masala = models.ForeignKey(
        Masala, on_delete=models.CASCADE, related_name="urinishlar"
    )
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="masala_urinishlari"
    )
    togri = models.BooleanField(default=False)

    #: Shu odam masalani OXIR-OQIBAT yechdimi.
    #:
    #: `togri` dan farqi katta: u faqat BIRINCHI urinishni saqlaydi
    #: va statistika uchun shunday bo'lishi kerak. Lekin uchinchi
    #: urinishda topgan odam ham masalani yechgan va uni "yecholmagan"
    #: deb ko'rsatish — mehnatini inkor qilish.
    #:
    #: Ikkalasi ham kerak: biri o'lchov uchun, ikkinchisi ODAM uchun.
    yechdi = models.BooleanField(default=False)

    #: Masala QACHON yechilgani.
    #:
    #: ─────────────── NEGA `created_at` YETMAYDI ───────────────
    #:
    #: `created_at` — BIRINCHI urinishning payti va u qator
    #: yaralgandan keyin o'zgarmaydi. Ya'ni kecha urinib, bugun
    #: topgan odamning yechimi "kechagi" bo'lib qolardi va
    #: "bugun nechta odam yechdi" degan savolga berilgan javob
    #: har kuni kamaytirib ko'rsatardi.
    #:
    #: Bo'sh bo'lishi MUMKIN: hali yecholmaganda ham, bu maydon
    #: qo'shilishidan OLDIN yechilganlarda ham. Eskilari
    #: migratsiyada `created_at` bilan to'ldiriladi — ular uchun
    #: bu eng yaqin haqiqat, chunki o'sha paytdagi sanoqda
    #: birinchi urinish va yechim deyarli har doim bir kunda edi.
    yechdi_at = models.DateTimeField(null=True, blank=True, default=None)

    #: Shu odam necha marta javob yubordi.
    #:
    #: Statistikaga tushmaydi — u faqat YECHIM QACHON ochilishini hal
    #: qiladi: uch marta urinib topolmagan odamga yechim bepul
    #: beriladi (`YECHIM_BEPUL`). Busiz tanga yig'olmagan bola
    #: masalada qamalib qolardi va bo'lim unga yopiq bo'lib qolardi.
    soni = models.IntegerField(default=1)

    #: Yechim shu odamga ochilganmi.
    #:
    #: Uch yo'l bilan ochiladi: to'g'ri yechganda, uch marta xato
    #: urinishdan keyin va tanga sarflab. Uchinchisi — shoshayotgan
    #: odam uchun (`views.masala_yechim`).
    yechim_ochiq = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    #: Nechta xato urinishdan keyin yechim BEPUL ochiladi.
    #:
    #: Uch — ataylab: bir xato tasodif, ikkinchisi hali izlanish,
    #: uchinchisidan keyin esa odam yordamsiz oldinga siljimaydi va
    #: uni o'sha yerda ushlab turish o'rgatmaydi, faqat charchatadi.
    YECHIM_BEPUL = 3

    class Meta:
        db_table = "masala_urinish"
        constraints = [
            models.UniqueConstraint(
                fields=["masala", "profile"], name="masala_bir_odam_bir_urinish"
            )
        ]
        # Hisobot ikkala sana bo'yicha ham kesadi: "bugun kim urindi"
        # va "bugun kim yechdi". Indekssiz ikkalasi ham butun jadvalni
        # o'qirdi — u esa masalalar bo'limidagi eng tez o'sadigan jadval.
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["-yechdi_at"]),
        ]


class MasalaKorish(models.Model):
    """
    Kim qaysi masalani OCHGAN.

    ─────────────── BIR ODAM — BIR KO'RISH ───────────────

    Takroriy ochish yangi qator yasamaydi va sanoqni oshirmaydi.
    Sabab `MasalaUrinish` dagi bilan bir xil: aks holda masalani
    yigirma marta ochib turgan bitta odam sonni o'ziga yozib olardi
    va "nechta odam ko'rdi" degan son "nechta marta ochildi" ga
    aylanardi. Ikkinchisi esa hech narsa haqida gapirmaydi.

    ─────────────── MUALLIF SANALMAYDI ───────────────

    O'z masalasini ochgan odam hisobga olinmaydi. Muallif uni
    tekshirish uchun, tuzatish uchun va shunchaki qarab qo'yish
    uchun ochadi — bu qiziqish emas. Muallifsiz son "boshqalar
    qancha ko'rdi" degan halol javob bo'ladi.

    ─────────────── NEGA QATOR SAQLANADI ───────────────

    Faqat sanoqni oshirish ham mumkin edi, lekin u paytda takrorni
    ajratib bo'lmasdi: "shu odam avval ochganmi?" degan savolga
    javob beradigan yagona joy — shu jadval. Qatorlar bilan birga
    "kim ochgan" degan ma'lumot ham qoladi va u administratorga
    masalaning taqdirini ko'rsatadi.
    """

    masala = models.ForeignKey(
        Masala, on_delete=models.CASCADE, related_name="korishlar"
    )
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="masala_korishlari"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "masala_korish"
        constraints = [
            models.UniqueConstraint(
                fields=["masala", "profile"], name="masala_bir_odam_bir_korish"
            )
        ]


class MasalaOvoz(models.Model):
    """
    Masalaga berilgan ovoz — like yoki dislike.

    BIR ODAM — BIR OVOZ, lekin uni ALMASHTIRSA bo'ladi va QAYTARIB
    OLSA ham bo'ladi (o'sha tugmani ikkinchi marta bosish). Avval
    "tushunmadim" degan bola yechib bo'lgach fikrini o'zgartirishi
    tabiiy va uni birinchi bosgan tugmasiga bog'lab qo'yish ma'nosiz.

    Sanoqlar `Masala` da alohida ustunda turadi va shu yerdagi har
    o'zgarish bilan birga yangilanadi (`masala.ovoz_ber`). Ikkita
    haqiqat manbai xavfli ko'rinadi, lekin muqobili yomonroq:
    ro'yxatdagi har masala uchun ikkita `COUNT` so'rovi.
    """

    LIKE = "like"
    DISLIKE = "dislike"
    TURLAR = [(LIKE, "Like"), (DISLIKE, "Dislike")]

    masala = models.ForeignKey(
        Masala, on_delete=models.CASCADE, related_name="ovozlar"
    )
    profile = models.ForeignKey(
        Profile, on_delete=models.CASCADE, related_name="masala_ovozlari"
    )
    tur = models.CharField(max_length=8, choices=TURLAR)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "masala_ovoz"
        constraints = [
            models.UniqueConstraint(
                fields=["masala", "profile"], name="masala_bir_odam_bir_ovoz"
            )
        ]


class TestToplam(models.Model):
    """
    TEST TO'PLAMI — hamma uchun BIR XIL savollar.

    ─────────────────────── NEGA ODDIY TESTDAN FARQI BOR ───────────────────────

    Testlar bo'limidagi blok test har ochilishda YANGIDAN yig'iladi: sonlar
    ham, savol tartibi ham har odamda boshqa (`frontend/src/lib/blok.ts`).
    O'lchov uchun bu yaxshi — testni yodlab bo'lmaydi. Lekin natijani
    solishtirib bo'lmaydi: "Ali 12 ta, men 9 ta topdim" degan gap
    ma'nosiz, chunki ular BOSHQA-BOSHQA test yechgan.

    To'plam aynan shu savolga javob: hamma bitta testni yechadi, ya'ni
    "42 kishi ishladi, o'rtacha 9/15" degan qator HAQIQATNI aytadi. Kanal
    posti ham shunga quriladi — obunachi son o'sib borishini ko'radi va
    o'zini o'sha qatorga qo'shgisi keladi.

    ─────────────────────── SAVOLLAR BAZADA EMAS ───────────────────────

    Savollar serverda SAQLANMAYDI — faqat `urug`. Mijoz o'sha urug' bilan
    generatorlarni yuritadi va har qurilmada aynan bir xil test chiqadi
    (`frontend/src/lib/oyin/urug.ts`, kunlik maydon ham shunday ishlaydi).

    Nega: savollar allaqachon yuzlab generator ichida yozilgan va ularni
    ikkinchi marta — bazaga — ko'chirish ikki haqiqat manbaini yasardi.
    Generator tuzatilsa, bazadagi nusxa eski xato bilan qolib ketardi.

    Narxi: ball MIJOZDAN keladi va uni server tekshira olmaydi. Bu yerda
    buning ahamiyati kichik — to'plam yulduz ham, tanga ham bermaydi, ya'ni
    soxta ball bilan hech narsa yutib bo'lmaydi. Chegara baribir bor:
    to'g'ri javoblar savollar sonidan oshmaydi (`test_toplam.ishladi`).
    """

    #: Ekranda ko'rinadigan raqam — `Masala.raqam` dagi sababdan.
    raqam = models.IntegerField(unique=True)
    #: 9, 10 yoki 11. Kurs kodi EMAS: to'plam bir sinfning ikkala fanini
    #: (algebra va geometriya) aralashtiradi (`blok.sinfKurslari`).
    sinf = models.SmallIntegerField()
    nom = models.CharField(max_length=80)
    #: Savollarni yasaydigan son. O'zgartirilsa — test BOSHQA bo'ladi va
    #: eski natijalar bilan solishtirib bo'lmaydi.
    urug = models.BigIntegerField()
    savol_soni = models.SmallIntegerField(default=15)
    daqiqa = models.SmallIntegerField(default=20)
    #: O'chirilgan to'plam ro'yxatda ko'rinmaydi, lekin kanal postidagi
    #: havola ochilaveradi — odamlarning suhbatida qolgan havola "topilmadi"
    #: bo'lib qolmasin.
    faol = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    #: Sanoqlar shu yerda — `Masala.urinish_soni` dagi sababdan: ro'yxat va
    #: kanal posti har ochilishda `COUNT` qilmasin.
    ishlagan_soni = models.IntegerField(default=0)
    togri_jami = models.IntegerField(default=0)

    # Kanal — `Masala` dagi maydonlarning aynan o'zi (`masala_kanal.py`).
    kanal_at = models.DateTimeField(null=True, blank=True)
    kanal_post_id = models.IntegerField(null=True, blank=True)
    kanal_yoq = models.BooleanField(default=False)
    kanal_tekshir_at = models.DateTimeField(null=True, blank=True)
    kanal_sanoq = models.CharField(max_length=40, default="", blank=True)

    class Meta:
        db_table = "test_toplam"
        ordering = ["sinf", "raqam"]

    def __str__(self) -> str:
        return f"#{self.raqam} {self.nom}"

    @property
    def ortacha(self) -> float:
        """O'rtacha to'g'ri javoblar soni — bir o'nlik aniqlikda."""
        if not self.ishlagan_soni:
            return 0.0
        return round(self.togri_jami / self.ishlagan_soni, 1)


class TestIshlash(models.Model):
    """
    Kim qaysi to'plamni ishlagan — BIR ODAM, BIR QATOR.

    Faqat BIRINCHI natija saqlanadi va sanoqqa kiradi. Ikkinchi urinishda
    savollar AYNAN O'SHA (urug' bir xil), ya'ni javoblar allaqachon
    ma'lum — uni hisobga olish o'rtachani yolg'on ko'tarardi.
    Qayta ishlash taqiqlanmaydi: bola mashq qilaversin, faqat jadvalga
    tushmaydi.
    """

    toplam = models.ForeignKey(TestToplam, on_delete=models.CASCADE, related_name="ishlashlar")
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="test_ishlashlari")
    togri = models.SmallIntegerField()
    jami = models.SmallIntegerField()
    sekund = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "test_ishlash"
        constraints = [
            models.UniqueConstraint(fields=["toplam", "profile"], name="toplam_bir_odam_bir_natija"),
        ]
        indexes = [models.Index(fields=["toplam", "togri"])]


class Faollik(models.Model):
    """
    Hozir NIMA QILYAPTI — boshqaruv panelidagi "Jonli" sahifasi uchun.

    ─────────────────────── NEGA ALOHIDA JADVAL ───────────────────────

    "Onlayn" (`Session.last_seen`) faqat "ilova ochiq" deydi. Admin esa
    ko'pincha boshqa narsani so'raydi: kim hozir test ishlayapti, qaysi
    savolda turibdi, qiynalyaptimi. Buni natija jadvallaridan bilib
    bo'lmaydi — ular faqat TUGAGAN ishni yozadi, yarim yo'ldagini emas.

    ─────────────────────── BIR PROFIL — BIR QATOR ───────────────────────

    Tarix saqlanmaydi, faqat HOZIRGI holat: har signal o'sha qatorni
    ustidan yozadi. Jadval shuning uchun o'smaydi va "jonli" so'rovi
    hech qachon sekinlashmaydi. Tarix kerak bo'lsa — u natija
    jadvallarida (`LessonResult`, `TestIshlash`).

    Qator o'chirilmaydi, ESKIRADI: `updated_at` 90 soniyadan eski bo'lsa
    odam ishni tashlagan yoki ilovani yopgan hisoblanadi. O'chirishga
    tayanish mumkin emas — ilovani yopgan telefon "chiqdim" deb
    aytishga ulgurmaydi.
    """

    DARS = "dars"
    BLOK = "blok"
    TOPLAM = "toplam"
    MASALA = "masala"
    JOYLAR = [(DARS, "Dars"), (BLOK, "Blok test"), (TOPLAM, "Test to'plami"), (MASALA, "Masala")]

    profile = models.OneToOneField(Profile, on_delete=models.CASCADE, primary_key=True,
                                   related_name="faollik")
    joy = models.CharField(max_length=10, choices=JOYLAR)
    #: Odam o'qiydigan nom: "9-sinf · 1-blok", "Kvadrat tenglama", "#12".
    nom = models.CharField(max_length=120, default="", blank=True)
    #: Nechanchi savolda (1 dan) va jami nechta. Masalada ikkalasi 0.
    savol = models.SmallIntegerField(default=0)
    jami = models.SmallIntegerField(default=0)
    togri = models.SmallIntegerField(default=0)
    #: Shu ish qachon boshlangan — "12 daqiqadan beri" shundan.
    boshlandi = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        db_table = "faollik"


class Hodisa(models.Model):
    """
    Foydalanuvchi NIMA QILDI — tahlil uchun hodisalar jurnali.

    ─────────────────────── NEGA KERAK ───────────────────────

    `Faollik` faqat HOZIRGI holatni saqlaydi, natija jadvallari esa
    faqat TUGAGAN ishni. Mahsulot savollari boshqacha: "qaysi bo'limga
    ko'p kirishadi?", "qaysi tugmani hech kim bosmaydi?", "kim eng faol
    va nimada?". Bularga javob faqat tarixdan chiqadi.

    ─────────────────────── IKKI TUR ───────────────────────

        kirish   ilova ochildi — `nom` da MANBA (kanal, ulashish,
                 eslatma...), `yol` da birinchi ekran
        sahifa   ekran ochildi — `yol` da manzil ("/masalalar")
        bosish   tugma bosildi — `nom` da tugma yozuvi

    Ilova ularni YIG'IB, bir so'rovda yuboradi (`lib/tahlil.ts`) — har
    bosishga alohida so'rov telefon internetini yeb qo'yardi.

    ─────────────────────── JADVAL O'SADI ───────────────────────

    Shuning uchun qator ixcham va eski yozuvlar vaqti-vaqti bilan
    tozalanadi (`tahlil.tozala`, SAQLASH_KUN kun). Batafsil tarix
    faqat so'nggi davr uchun kerak, eskisi yig'ma sonlarda qoladi.
    """

    KIRISH = "kirish"
    SAHIFA = "sahifa"
    BOSISH = "bosish"
    TURLAR = [(KIRISH, "Kirish"), (SAHIFA, "Sahifa"), (BOSISH, "Bosish")]

    pupil = models.ForeignKey(Pupil, on_delete=models.CASCADE, related_name="hodisalar")
    tur = models.CharField(max_length=8, choices=TURLAR)
    #: Manzil — `/kurs/:slug/...` kabi o'zgaruvchan qismlar mijozda
    #: umumlashtiriladi, aks holda har masala alohida "sahifa" bo'lardi.
    yol = models.CharField(max_length=80, default="", blank=True)
    #: Tugma yozuvi (faqat `bosish` da).
    nom = models.CharField(max_length=48, default="", blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        db_table = "hodisa"
        indexes = [models.Index(fields=["pupil", "created_at"])]
