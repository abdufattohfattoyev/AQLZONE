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
    def royxatdan_otgan(self) -> bool:
        return self.registered_at is not None

    def royxatni_yop(self) -> bool:
        """
        Ism ham, familiya ham bor bo'lsa — ro'yxatdan o'tgan deb belgilaydi.

        Bir joyda turadi, chunki uni uch joy chaqiradi: qo'lda saqlash,
        Telegram orqali kirish va hisoblarni birlashtirish. Har birida
        alohida yozilsa, biri unutilib qolardi va foydalanuvchi ro'yxat
        oynasidan chiqa olmay qolardi.
        """
        if self.registered_at or not (self.first_name.strip() and self.last_name.strip()):
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
    daraja = models.SmallIntegerField(default=2)

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

    created_at = models.DateTimeField(default=timezone.now)
    tugadi_at = models.DateTimeField(null=True, blank=True)

    #: Chaqiruv shuncha soatdan keyin kuchini yo'qotadi.
    MUDDAT_SOAT = 24

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
    def holat(self) -> str:
        """`boshlanmagan` | `kutyapti` | `tugadi` | `muddati_otdi`."""
        if not self.chaqirgan_tugatdi:
            return "boshlanmagan"
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
        if self.chaqirgan_ball != self.qabul_ball:
            return "chaqirgan" if self.chaqirgan_ball > self.qabul_ball else "qabul"
        if self.chaqirgan_xato != self.qabul_xato:
            return "chaqirgan" if self.chaqirgan_xato < self.qabul_xato else "qabul"
        return "durang"
