"""
Masalalar bo'limining mantig'i.

`views.py` da emas, alohida faylda — chunki bu yerda qoidalar bor va
ular sinovdan HTTP siz o'tishi kerak: kim yechimni ko'ra oladi, ovoz
qanday almashadi, tanga qachon oqadi.

────────────────────────── UCH QOIDA ──────────────────────────

1. YECHIM URINISHDAN KEYIN. Server yechimni urinmagan odamga umuman
   yubormaydi (`masala_json`). Faqat mijozda yashirilsa, uni har kim
   tarmoq oynasidan o'qib olardi.

2. BIRINCHI URINISH HISOBLANADI. Statistika "birinchi urinishda
   nechta odam yecha oldi" degan savolga javob beradi. Ikkinchi
   urinishda hamma to'g'ri topadi — yechim allaqachon ochiq.

3. TANGA IKKI TOMONGA. Yechgan bola ham, MASALA MUALLIFI ham oladi.
   Faqat yechganga bersak, odam masala yozish uchun emas, faqat
   yechish uchun kirardi va bo'lim bir hafta ichida bo'shab qolardi.
"""
from __future__ import annotations

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from .models import (
    Masala, MasalaMukofot, MasalaOvoz, MasalaUrinish, Profile, javob_normal,
)


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
        # Yechim ochiqmi — mijoz shunga qarab tugma ko'rsatadi. Maydonning
        # O'ZI yo'qligiga qarab bilish ham mumkin edi, lekin u paytda
        # "yechim yozilmagan" bilan "yechim berilmadi" bir xil ko'rinardi.
        "yechimOchiq": bool(ochiq),
    }
    if ochiq:
        d["yechim"] = masala.yechim
        d["javob"] = masala.javob
    # Rad etilgan masalaning sababini FAQAT muallifning o'zi ko'radi.
    if oz and masala.holat == Masala.RAD:
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


def yubor(profile: Profile, sinf: int, matn: str, javob: str, yechim: str) -> Masala:
    """Yangi masala — navbatga tushadi, darhol ko'rinmaydi."""
    return Masala.objects.create(
        muallif=profile, sinf=sinf,
        matn=matn.strip(), javob=javob.strip(), yechim=yechim.strip(),
        holat=Masala.KUTMOQDA,
    )


# -------------------------------------------------------------------- yechish


@transaction.atomic
def javob_ber(masala: Masala, profile: Profile, javob: str) -> dict:
    """
    Javobni tekshiradi va yechimni ochadi.

    Natija: `{togri, birinchi, yechim, javob, tanga}`.

    `birinchi` — shu odamning BIRINCHI urinishimi. Sanoqlar va tanga
    faqat shunda o'zgaradi. Ikkinchi marta javob bergan odam yechimni
    baribir ko'radi (u allaqachon ochilgan), lekin statistikaga
    tegmaydi.

    Tanga ham faqat birinchi va faqat TO'G'RI javobda beriladi.
    Yechganga darhol (u ekranda turibdi), muallifga esa hisobiga
    to'planib boradi — u hozir ilovada emas.
    """
    togri = javob_normal(javob) == javob_normal(masala.javob)
    urinish, birinchi = MasalaUrinish.objects.get_or_create(
        masala=masala, profile=profile, defaults={"togri": togri},
    )

    tanga = 0
    if birinchi:
        # Ikkala sanoq ham bitta so'rovda — o'qib-yozish orasida
        # boshqa urinish tushsa, sanoq yo'qolmasin.
        Masala.objects.filter(pk=masala.pk).update(
            urinish_soni=F("urinish_soni") + 1,
            yechgan_soni=F("yechgan_soni") + (1 if togri else 0),
        )
        masala.refresh_from_db(fields=["urinish_soni", "yechgan_soni"])
        if togri:
            tanga = MasalaMukofot.YECHGAN_TANGA
            # Muallif o'z masalasini yechsa tanga OLMAYDI: aks holda
            # bu tekin tanga chiqaradigan tugma bo'lardi.
            if masala.muallif_id != profile.pk:
                mukofot_qosh(masala.muallif, MasalaMukofot.YECHILDI_TANGA)

    return {
        "togri": togri,
        "birinchi": birinchi,
        # Yechim HAR DOIM qaytadi: odam urinib bo'ldi, endi uni
        # yashirishning ma'nosi yo'q. Xato qilgan odamga u ayniqsa
        # kerak — u aynan shu uchun keldi.
        "yechim": masala.yechim,
        "javob": masala.javob,
        "tanga": tanga,
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


# ---------------------------------------------------------------------- tanga


def mukofot_qosh(profile: Profile, tanga: int) -> None:
    """Muallifning kutayotgan hisobiga tanga qo'shadi."""
    if tanga <= 0:
        return
    MasalaMukofot.objects.get_or_create(profile=profile)
    MasalaMukofot.objects.filter(profile=profile).update(
        tanga=F("tanga") + tanga, jami=F("jami") + tanga,
    )


@transaction.atomic
def mukofotni_ol(profile: Profile) -> int:
    """
    Kutayotgan tangani beradi va hisobni nolga tushiradi.

    ATOMAR bo'lishi shart: ikki qurilmadan bir vaqtda kirilganda
    tanga ikki marta berilmasin. Shuning uchun avval `update` bilan
    nolga tushiriladi va NIMA tushirilgani qaytariladi — o'qib, keyin
    yozish emas.
    """
    row = MasalaMukofot.objects.select_for_update().filter(profile=profile).first()
    if not row or row.tanga <= 0:
        return 0
    tanga = row.tanga
    MasalaMukofot.objects.filter(pk=row.pk).update(tanga=0)
    return tanga


def kutayotgan_tanga(profile: Profile) -> int:
    row = MasalaMukofot.objects.filter(profile=profile).first()
    return row.tanga if row else 0


# ------------------------------------------------------------------ tasdiqlash


@transaction.atomic
def tasdiqla(masala: Masala) -> None:
    """
    Masalani ro'yxatga chiqaradi va muallifga tanga yozadi.

    Ikkinchi marta tasdiqlash tangani ikki marta bermaydi: holat
    allaqachon `TASDIQ` bo'lsa hech narsa qilinmaydi. Admin bir
    tugmani ikki marta bosishi mumkin va bu odatiy hol.
    """
    if masala.holat == Masala.TASDIQ:
        return
    masala.holat = Masala.TASDIQ
    masala.rad_sababi = ""
    masala.korilgan_at = timezone.now()
    masala.save(update_fields=["holat", "rad_sababi", "korilgan_at"])
    mukofot_qosh(masala.muallif, MasalaMukofot.TASDIQ_TANGA)


def rad_et(masala: Masala, sabab: str) -> None:
    """
    Masalani rad etadi. SABAB majburiy — muallif nimani tuzatishni bilsin.

    Tanga qaytarib olinmaydi: tasdiqlangan masala keyin rad etilsa
    ham, muallif o'sha paytda haqli edi va tangani qaytarib olish
    jazoga o'xshab ketardi.
    """
    masala.holat = Masala.RAD
    masala.rad_sababi = (sabab or "").strip()[:300]
    masala.korilgan_at = timezone.now()
    masala.save(update_fields=["holat", "rad_sababi", "korilgan_at"])


def navbat_soni() -> int:
    """Ko'rilmagan masalalar soni — boshqaruv panelidagi belgi uchun."""
    return Masala.objects.filter(holat=Masala.KUTMOQDA).count()
