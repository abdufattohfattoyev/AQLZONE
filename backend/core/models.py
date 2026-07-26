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
    2. **Bir marta ishlaydi** — ishlatilgach o'chiriladi. Havola Telegram
       tarixida qolib ketadi; uni keyin topgan odam kira olmasligi kerak.
    3. **Bir soatdan keyin kuchini yo'qotadi.** Havola ulashib yuborilishi
       yoki telefon boshqa qo'lga tushishi mumkin.
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
        ordering = ["-created_at"]
