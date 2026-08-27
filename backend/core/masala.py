"""
Masalalar bo'limining mantig'i.

`views.py` da emas, alohida faylda — chunki bu yerda qoidalar bor va
ular sinovdan HTTP siz o'tishi kerak: kim yechimni ko'ra oladi va
ovoz qanday almashadi.

────────────────────────── UCH QOIDA ──────────────────────────

1. YECHIM URINISHDAN KEYIN. Server yechimni urinmagan odamga umuman
   yubormaydi (`masala_json`). Faqat mijozda yashirilsa, uni har kim
   tarmoq oynasidan o'qib olardi.

2. BIRINCHI URINISH HISOBLANADI. Statistika "birinchi urinishda
   nechta odam yecha oldi" degan savolga javob beradi. Ikkinchi
   urinishda hamma to'g'ri topadi — yechim allaqachon ochiq.

3. TANGA YO'Q. Bo'lim mukofot bilan emas, KO'RINISH bilan ishlaydi:
   "14 kishi yechdi" degan son va muallif sahifasidagi o'quvchilar.
   Tanga bir vaqt bor edi va u faqat noto'g'ri narsani mukofotlardi
   — masala YOZISHNI, uning yaxshi bo'lishini emas. Ustiga u
   tasdiqlash navbatini o'rtamiyona masalalar bilan to'ldirardi va
   narxini admin o'z vaqti bilan to'lardi.
"""
from __future__ import annotations

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from .models import Masala, MasalaOvoz, MasalaUrinish, Profile, javob_normal


# ------------------------------------------------------------------ ko'rinish


def uringanmi(masala: Masala, profile: Profile) -> MasalaUrinish | None:
    """Shu odam bu masalaga urinib ko'rganmi."""
    return MasalaUrinish.objects.filter(masala=masala, profile=profile).first()


def masala_json(masala: Masala, kim: Profile, *, ochiq: bool | None = None) -> dict:
    """
    Masalaning mijozga ketadigan ko'rinishi.

    `yechim` FAQAT quyidagi hollarda qo'shiladi:
      * odam urinib ko'rgan bo'lsa,
      * yoki masalaning O'Z muallifi bo'lsa.

    Muallif istisnosi zarur: u yechimni o'zi yozgan va uni ko'ra
    olmasa, o'z masalasini tuzata ham olmasdi.

    `ochiq` — urinish allaqachon ma'lum bo'lganda qo'shimcha so'rov
    qilmaslik uchun (ro'yxatda ellikta masala bo'ladi).
    """
    oz = masala.muallif_id == kim.pk
    if ochiq is None:
        ochiq = oz or uringanmi(masala, kim) is not None

    d = {
        "id": masala.pk,
        "sinf": masala.sinf,
        "matn": masala.matn,
        "holat": masala.holat,
        "muallif": muallif_json(masala.muallif),
        "meniki": oz,
        "urinishSoni": masala.urinish_soni,
        "yechganSoni": masala.yechgan_soni,
        "qiyinlik": masala.qiyinlik,
        "like": masala.like_soni,
        "dislike": masala.dislike_soni,
        "createdAt": masala.created_at,
        # Rasm manzili — bo'lmasa bo'sh satr, `null` emas. Mijozda
        # `if (m.rasm)` bir xil ishlaydi va turi doim satr bo'lgani
        # uchun tekshiruv ham soddaroq.
        "rasm": masala.rasm.url if masala.rasm else "",
        # Yechim ochiqmi — mijoz shunga qarab tugma ko'rsatadi. Maydonning
        # O'ZI yo'qligiga qarab bilish ham mumkin edi, lekin u paytda
        # "yechim yozilmagan" bilan "yechim berilmadi" bir xil ko'rinardi.
        "yechimOchiq": bool(ochiq),
    }
    if ochiq:
        d["yechim"] = masala.yechim
        d["javob"] = masala.javob
    if oz:
        # Rad etilganining sababini FAQAT muallifning o'zi ko'radi.
        if masala.holat == Masala.RAD:
            d["radSababi"] = masala.rad_sababi
    return d


def muallif_json(pr: Profile) -> dict:
    """
    Masala muallifi — ro'yxatda va masala ustida ko'rinadi.

    Ism reyting bilan BIR XIL manbadan olinadi (`Pupil`), ya'ni bir
    odam ikki joyda ikki xil nom bilan ko'rinmaydi.
    """
    pupil = pr.pupil
    return {
        "id": pr.pk,
        "ism": pupil.toliq_ism or pr.name,
        "avatar": pr.avatar,
    }


# ------------------------------------------------------------------- yuborish


def bugungi_soni(profile: Profile) -> int:
    """Shu profil bugun nechta masala yuborgan — kunlik chegara uchun."""
    boshi = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    return Masala.objects.filter(muallif=profile, created_at__gte=boshi).count()


def yubor(
    profile: Profile, sinf: int, matn: str, javob: str, yechim: str, rasm=None,
) -> Masala:
    """
    Yangi masala — navbatga tushadi, darhol ko'rinmaydi.

    Rasm shu yerda emas, KELISHDAN OLDIN tayyorlanadi
    (`core/rasm.py`): u yerda fayl haqiqatan rasmligini tekshirish
    va EXIF ni tashlash bor va u xato ko'tarishi mumkin — bu esa
    saqlashdan oldin bo'lishi kerak.
    """
    return Masala.objects.create(
        muallif=profile, sinf=sinf,
        matn=matn.strip(), javob=javob.strip(), yechim=yechim.strip(),
        rasm=rasm or None,
        holat=Masala.KUTMOQDA,
    )


# -------------------------------------------------------------------- yechish


@transaction.atomic
def javob_ber(masala: Masala, profile: Profile, javob: str) -> dict:
    """
    Javobni tekshiradi va yechimni ochadi.

    Natija: `{togri, birinchi, yechim, javob}`.

    `birinchi` — shu odamning BIRINCHI urinishimi. Sanoqlar faqat
    shunda o'zgaradi. Ikkinchi marta javob bergan odam yechimni
    baribir ko'radi (u allaqachon ochilgan), lekin statistikaga
    tegmaydi — "nechta odam O'ZI yecha oldi" degan son halol
    qolishi kerak.
    """
    togri = javob_normal(javob) == javob_normal(masala.javob)
    urinish, birinchi = MasalaUrinish.objects.get_or_create(
        masala=masala, profile=profile, defaults={"togri": togri},
    )

    if birinchi:
        # Ikkala sanoq ham bitta so'rovda — o'qib-yozish orasida
        # boshqa urinish tushsa, sanoq yo'qolmasin.
        Masala.objects.filter(pk=masala.pk).update(
            urinish_soni=F("urinish_soni") + 1,
            yechgan_soni=F("yechgan_soni") + (1 if togri else 0),
        )
        masala.refresh_from_db(fields=["urinish_soni", "yechgan_soni"])

    return {
        "togri": togri,
        "birinchi": birinchi,
        # Yechim HAR DOIM qaytadi: odam urinib bo'ldi, endi uni
        # yashirishning ma'nosi yo'q. Xato qilgan odamga u ayniqsa
        # kerak — u aynan shu uchun keldi.
        "yechim": masala.yechim,
        "javob": masala.javob,
        "urinishSoni": masala.urinish_soni,
        "yechganSoni": masala.yechgan_soni,
        # Birinchi urinishning natijasi keyin o'zgarmaydi — mijoz
        # shuni ko'rsatadi ("siz buni yechgansiz" yoki "yecholmagansiz").
        "birinchiTogri": urinish.togri,
    }


# --------------------------------------------------------------------- ovozlar


@transaction.atomic
def ovoz_ber(masala: Masala, profile: Profile, tur: str) -> dict:
    """
    Like yoki dislike qo'yadi, almashtiradi yoki QAYTARIB OLADI.

    O'sha tugmani ikkinchi marta bosish ovozni olib tashlaydi. Busiz
    bexosdan bosilgan dislike'ni qaytarib bo'lmasdi va bu, masala
    ostida turgan sonni hisobga olsak, muallif uchun haqsizlik
    bo'lardi.

    Sanoqlar `Masala` ustunlarida yangilanadi — `F()` bilan, ya'ni
    ikki odam bir vaqtda bosganda ham biri yo'qolmaydi.
    """
    eski = MasalaOvoz.objects.filter(masala=masala, profile=profile).first()
    ozgarish = {"like_soni": 0, "dislike_soni": 0}
    ustun = {MasalaOvoz.LIKE: "like_soni", MasalaOvoz.DISLIKE: "dislike_soni"}

    if eski and eski.tur == tur:
        eski.delete()                                   # qaytarib olindi
        ozgarish[ustun[tur]] -= 1
        joriy = ""
    elif eski:
        ozgarish[ustun[eski.tur]] -= 1                  # almashtirildi
        ozgarish[ustun[tur]] += 1
        eski.tur = tur
        eski.save(update_fields=["tur"])
        joriy = tur
    else:
        MasalaOvoz.objects.create(masala=masala, profile=profile, tur=tur)
        ozgarish[ustun[tur]] += 1
        joriy = tur

    Masala.objects.filter(pk=masala.pk).update(
        like_soni=F("like_soni") + ozgarish["like_soni"],
        dislike_soni=F("dislike_soni") + ozgarish["dislike_soni"],
    )
    masala.refresh_from_db(fields=["like_soni", "dislike_soni"])
    return {"ovozim": joriy, "like": masala.like_soni, "dislike": masala.dislike_soni}


def ovozlarim(profile: Profile, idlar: list[int]) -> dict[int, str]:
    """Ro'yxatdagi masalalarga shu odam qanday ovoz bergan."""
    if not idlar:
        return {}
    return dict(
        MasalaOvoz.objects
        .filter(profile=profile, masala_id__in=idlar)
        .values_list("masala_id", "tur")
    )


# ------------------------------------------------------------------ tasdiqlash


@transaction.atomic
def tasdiqla(masala: Masala) -> None:
    """
    Masalani ro'yxatga chiqaradi.

    Ikkinchi marta tasdiqlash hech narsa qilmaydi: admin bir tugmani
    ikki marta bosishi odatiy hol.
    """
    if masala.holat == Masala.TASDIQ:
        return
    masala.holat = Masala.TASDIQ
    masala.rad_sababi = ""
    masala.korilgan_at = timezone.now()
    masala.save(update_fields=["holat", "rad_sababi", "korilgan_at"])


def rad_et(masala: Masala, sabab: str) -> None:
    """
    Masalani rad etadi. SABAB majburiy — muallif nimani tuzatishni bilsin.

    """
    masala.holat = Masala.RAD
    masala.rad_sababi = (sabab or "").strip()[:300]
    masala.korilgan_at = timezone.now()
    masala.save(update_fields=["holat", "rad_sababi", "korilgan_at"])


def navbat_soni() -> int:
    """Ko'rilmagan masalalar soni — boshqaruv panelidagi belgi uchun."""
    return Masala.objects.filter(holat=Masala.KUTMOQDA).count()
